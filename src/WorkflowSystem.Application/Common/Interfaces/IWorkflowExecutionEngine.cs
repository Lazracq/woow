using WorkflowSystem.Domain.Entities;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Application.Common.Interfaces;

public interface IWorkflowExecutionEngine
{
    Task<Execution> ExecuteWorkflowAsync(Guid workflowId, object? inputData = null, CancellationToken cancellationToken = default);
    Task<Execution> ExecuteWorkflowAsync(Workflow workflow, object? inputData = null, CancellationToken cancellationToken = default);
    Task CancelExecutionAsync(Guid executionId, CancellationToken cancellationToken = default);
    Task PauseExecutionAsync(Guid executionId, CancellationToken cancellationToken = default);
    Task ResumeExecutionAsync(Guid executionId, CancellationToken cancellationToken = default);
    Task<ExecutionStep> ExecuteTaskAsync(Task task, object? inputData = null, CancellationToken cancellationToken = default);
} 