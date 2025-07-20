using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using WorkflowSystem.Domain.Enums;
using WorkflowSystem.Infrastructure.Services;
using WorkflowSystem.Infrastructure.Persistence;
using Task = WorkflowSystem.Domain.Entities.Task;
using WorkflowSystem.Domain.ValueObjects;

namespace WorkflowSystem.Infrastructure.Repositories;

public interface IReadOnlyWorkflowRepository
{
    System.Threading.Tasks.Task<Workflow?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<List<Workflow>> GetAllAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<List<Workflow>> GetByStatusAsync(WorkflowStatus status, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<List<Execution>> GetExecutionsByWorkflowIdAsync(Guid workflowId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<long> GetExecutionCountAsync(Guid workflowId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<List<Workflow>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);
}

public class ReadOnlyWorkflowRepository : IReadOnlyWorkflowRepository
{
    private readonly ApplicationDbContext _context;
    private readonly IWorkflowExecutionCache _cache;
    private readonly ILogger<ReadOnlyWorkflowRepository> _logger;

    public ReadOnlyWorkflowRepository(
        ApplicationDbContext context,
        IWorkflowExecutionCache cache,
        ILogger<ReadOnlyWorkflowRepository> logger)
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

        // Fallback to read-replica database
        _logger.LogDebug("Cache miss for workflow {WorkflowId}, querying read-replica", id);
        var workflow = await _context.Workflows
            .Include(w => w.Tasks)
            .Include(w => w.Variables)
            .Include(w => w.Triggers)
            .Include(w => w.Executions)
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

        if (workflow != null)
        {
            // Cache the result
            await _cache.SetWorkflowAsync(id, workflow);
        }

        return workflow;
    }

    public async System.Threading.Tasks.Task<List<Workflow>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Workflows
            .Include(w => w.Tasks)
            .Include(w => w.Variables)
            .Include(w => w.Triggers)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Workflow>> GetByStatusAsync(WorkflowStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Workflows
            .Include(w => w.Tasks)
            .Include(w => w.Variables)
            .Include(w => w.Triggers)
            .Where(w => w.Status == status)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Execution>> GetExecutionsByWorkflowIdAsync(Guid workflowId, CancellationToken cancellationToken = default)
    {
        return await _context.Executions
            .Where(e => e.WorkflowId == workflowId)
            .OrderByDescending(e => e.StartedAt)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<long> GetExecutionCountAsync(Guid workflowId, CancellationToken cancellationToken = default)
    {
        return await _context.Executions
            .Where(e => e.WorkflowId == workflowId)
            .CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Workflow>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        return await _context.Workflows
            .Include(w => w.Tasks)
            .Include(w => w.Variables)
            .Include(w => w.Triggers)
            .Where(w => w.Name.Contains(searchTerm) || w.Description.Contains(searchTerm))
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);
    }
} 