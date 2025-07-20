using WorkflowSystem.Domain.Entities;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Domain.Strategies;

public interface ITaskStrategy
{
    string TaskType { get; }
    string DisplayName { get; }
    string Description { get; }
    string Icon { get; }
    bool IsConfigurable { get; }
    
    System.Threading.Tasks.Task<ExecutionStep> ExecuteAsync(Task task, ExecutionStep step, object? inputData, CancellationToken cancellationToken = default);
    object GetDefaultConfiguration();
    bool ValidateConfiguration(string configuration);
    string GetConfigurationSchema();
} 