using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using WorkflowSystem.Domain.Enums;
using WorkflowSystem.Infrastructure.Services;
using Task = WorkflowSystem.Domain.Entities.Task;
using WorkflowSystem.Domain.ValueObjects;

namespace WorkflowSystem.Infrastructure.Repositories;

public class WorkflowRepository : IWorkflowRepository
{
    private readonly IApplicationDbContext _context;
    private readonly IWorkflowExecutionCache _cache;
    private readonly ILogger<WorkflowRepository> _logger;

    public WorkflowRepository(
        IApplicationDbContext context,
        IWorkflowExecutionCache cache,
        ILogger<WorkflowRepository> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<Workflow?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        // Try to get from cache first
        var cached = await _cache.GetWorkflowAsync(id);
        if (cached != null)
        {
            _logger.LogDebug("Cache hit for workflow {WorkflowId}", id);
            return cached;
        }

        // Fallback to database
        _logger.LogDebug("Cache miss for workflow {WorkflowId}, querying database", id);
        var workflow = await _context.Workflows
            .Include(w => w.Tasks)
            .Include(w => w.Variables)
            .Include(w => w.Triggers)
            .Include(w => w.Executions)
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

        // Cache the result
        if (workflow != null)
        {
            await _cache.SetWorkflowAsync(id, workflow);
        }

        return workflow;
    }

    public async System.Threading.Tasks.Task<IEnumerable<Workflow>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.Workflows
                .Include(w => w.Tasks)
                .Include(w => w.Variables)
                .Include(w => w.Triggers)
                .Include(w => w.Executions)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve workflows from database. Returning empty list.");
            return new List<Workflow>();
        }
    }

    public async System.Threading.Tasks.Task<IEnumerable<Workflow>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.Workflows
                .Include(w => w.Tasks)
                .Include(w => w.Variables)
                .Include(w => w.Triggers)
                .Include(w => w.Executions)
                .Where(w => w.CreatedBy == userId)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve workflows for user {UserId} from database. Returning empty list.", userId);
            return new List<Workflow>();
        }
    }

    public async System.Threading.Tasks.Task<Workflow> AddAsync(Workflow workflow, CancellationToken cancellationToken = default)
    {
        _context.Workflows.Add(workflow);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Cache the new workflow
        await _cache.SetWorkflowAsync(workflow.Id, workflow);
        
        return workflow;
    }

    public async System.Threading.Tasks.Task<Workflow> UpdateAsync(Workflow workflow, CancellationToken cancellationToken = default)
    {
        _context.Workflows.Update(workflow);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Update cache
        await _cache.SetWorkflowAsync(workflow.Id, workflow);
        
        return workflow;
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var workflow = await GetByIdAsync(id, cancellationToken);
        if (workflow != null)
        {
            _context.Workflows.Remove(workflow);
            await _context.SaveChangesAsync(cancellationToken);
            
            // Remove from cache
            await _cache.RemoveWorkflowAsync(id);
        }
    }

    public async System.Threading.Tasks.Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Workflows.AnyAsync(w => w.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<WorkflowDefinition> ExportAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var workflow = await GetByIdAsync(id, cancellationToken);
        if (workflow == null)
            throw new ArgumentException("Workflow not found.", nameof(id));

        return workflow.ToDefinition();
    }

    public async System.Threading.Tasks.Task<Workflow> ImportAsync(WorkflowDefinition definition, Guid userId, CancellationToken cancellationToken = default)
    {
        var workflow = new Workflow(definition.Name, definition.Description);
        workflow.SetCreatedBy(userId);

        // Import tasks
        foreach (var taskDef in definition.Tasks)
        {
            var task = new Task(taskDef.Name, taskDef.Type, taskDef.Configuration, taskDef.PositionX, taskDef.PositionY);
            workflow.AddTask(task);
        }

        // Import variables
        foreach (var variableDef in definition.Variables)
        {
            var variableType = Enum.Parse<VariableType>(variableDef.Type);
            var variable = new Variable(variableDef.Name, variableDef.Value, variableType);
            workflow.AddVariable(variable);
        }

        // Import triggers
        foreach (var triggerDef in definition.Triggers)
        {
            var triggerType = Enum.Parse<TriggerType>(triggerDef.Type);
            var trigger = new Trigger(triggerDef.Name, triggerType, triggerDef.Configuration);
            workflow.AddTrigger(trigger);
        }

        return await AddAsync(workflow, cancellationToken);
    }
} 