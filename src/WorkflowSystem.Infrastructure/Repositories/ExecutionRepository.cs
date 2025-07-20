using Microsoft.EntityFrameworkCore;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using WorkflowSystem.Domain.Enums;

namespace WorkflowSystem.Infrastructure.Repositories;

public class ExecutionRepository : IExecutionRepository
{
    private readonly IApplicationDbContext _context;

    public ExecutionRepository(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Execution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Executions
            .Include(e => e.ExecutionSteps)
            .Include(e => e.Workflow)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Execution>> GetByWorkflowIdAsync(Guid workflowId, CancellationToken cancellationToken = default)
    {
        return await _context.Executions
            .Include(e => e.ExecutionSteps)
            .Where(e => e.WorkflowId == workflowId)
            .OrderByDescending(e => e.StartedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Execution>> GetByStatusAsync(ExecutionStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Executions
            .Include(e => e.ExecutionSteps)
            .Where(e => e.Status == status)
            .OrderByDescending(e => e.StartedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Execution>> GetActiveExecutionsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Executions
            .Include(e => e.ExecutionSteps)
            .Where(e => e.Status == ExecutionStatus.Pending || 
                       e.Status == ExecutionStatus.Running || 
                       e.Status == ExecutionStatus.Paused)
            .OrderByDescending(e => e.StartedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Execution> AddAsync(Execution execution, CancellationToken cancellationToken = default)
    {
        _context.Executions.Add(execution);
        await _context.SaveChangesAsync(cancellationToken);
        return execution;
    }

    public async Task<Execution> UpdateAsync(Execution execution, CancellationToken cancellationToken = default)
    {
        _context.Executions.Update(execution);
        await _context.SaveChangesAsync(cancellationToken);
        return execution;
    }

    public async Task<ExecutionStep?> GetExecutionStepAsync(Guid executionId, Guid taskId, CancellationToken cancellationToken = default)
    {
        return await _context.ExecutionSteps
            .Include(es => es.Task)
            .FirstOrDefaultAsync(es => es.ExecutionId == executionId && es.TaskId == taskId, cancellationToken);
    }

    public async Task<ExecutionStep> AddExecutionStepAsync(ExecutionStep step, CancellationToken cancellationToken = default)
    {
        _context.ExecutionSteps.Add(step);
        await _context.SaveChangesAsync(cancellationToken);
        return step;
    }

    public async Task<ExecutionStep> UpdateExecutionStepAsync(ExecutionStep step, CancellationToken cancellationToken = default)
    {
        _context.ExecutionSteps.Update(step);
        await _context.SaveChangesAsync(cancellationToken);
        return step;
    }
} 