namespace WorkflowSystem.Domain.Enums;

public enum TaskType
{
    HttpCallout,
    ScriptExecution,
    DataTransformation,
    StoragePush,
    Conditional,
    Batch,
    Iteration,
    Parallel,
    Delay,
    Notification
} 