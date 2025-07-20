using WorkflowSystem.Domain.Entities;
using WorkflowSystem.Domain.Enums;

namespace WorkflowSystem.Application.Common.Interfaces;

public interface IExecutionRepository
{
    Task<Execution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Execution>> GetByWorkflowIdAsync(Guid workflowId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Execution>> GetByStatusAsync(ExecutionStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Execution>> GetActiveExecutionsAsync(CancellationToken cancellationToken = default);
    Task<Execution> AddAsync(Execution execution, CancellationToken cancellationToken = default);
    Task<Execution> UpdateAsync(Execution execution, CancellationToken cancellationToken = default);
    Task<ExecutionStep?> GetExecutionStepAsync(Guid executionId, Guid taskId, CancellationToken cancellationToken = default);
    Task<ExecutionStep> AddExecutionStepAsync(ExecutionStep step, CancellationToken cancellationToken = default);
    Task<ExecutionStep> UpdateExecutionStepAsync(ExecutionStep step, CancellationToken cancellationToken = default);
} 