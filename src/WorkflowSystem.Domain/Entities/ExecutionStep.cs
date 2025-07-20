using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using WorkflowSystem.Domain.Enums;

namespace WorkflowSystem.Domain.Entities;

public class ExecutionStep : BaseEntity
{
    public ExecutionStep(Guid executionId, Guid taskId, ExecutionStatus status = ExecutionStatus.Pending)
    {
        ExecutionId = executionId;
        TaskId = taskId;
        Status = status;
        StartedAt = DateTime.UtcNow;
    }

    public Guid ExecutionId { get; private set; }

    public Guid TaskId { get; private set; }

    public ExecutionStatus Status { get; private set; }

    public DateTime StartedAt { get; private set; }

    public DateTime? CompletedAt { get; private set; }

    public string? InputData { get; private set; }

    public string? OutputData { get; private set; }

    public string? ErrorMessage { get; private set; }

    public int? ExecutionTimeMs { get; private set; }

    public int? RetryCount { get; private set; }

    public int? MaxRetries { get; private set; }

    // Navigation properties
    public virtual Execution Execution { get; private set; } = null!;
    public virtual Task Task { get; private set; } = null!;

    // Business methods
    public void Start()
    {
        if (Status != ExecutionStatus.Pending)
            throw new InvalidOperationException("Execution step can only be started when in Pending status.");

        Status = ExecutionStatus.Running;
        StartedAt = DateTime.UtcNow;
    }

    public void Complete(string? outputData = null)
    {
        if (Status != ExecutionStatus.Running)
            throw new InvalidOperationException("Execution step can only be completed when in Running status.");

        Status = ExecutionStatus.Completed;
        OutputData = outputData;
        CompletedAt = DateTime.UtcNow;
        ExecutionTimeMs = (int)(CompletedAt.Value - StartedAt).TotalMilliseconds;
    }

    public void Fail(string errorMessage)
    {
        if (Status != ExecutionStatus.Running)
            throw new InvalidOperationException("Execution step can only be failed when in Running status.");

        Status = ExecutionStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;
        ExecutionTimeMs = (int)(CompletedAt.Value - StartedAt).TotalMilliseconds;
    }

    public void SetInputData(object inputData)
    {
        InputData = JsonSerializer.Serialize(inputData);
    }

    public void SetOutputData(object outputData)
    {
        OutputData = JsonSerializer.Serialize(outputData);
    }

    public void SetRetryConfiguration(int maxRetries)
    {
        MaxRetries = maxRetries;
        RetryCount = 0;
    }

    public bool CanRetry()
    {
        return Status == ExecutionStatus.Failed && 
               RetryCount.HasValue && 
               MaxRetries.HasValue && 
               RetryCount.Value < MaxRetries.Value;
    }

    public void IncrementRetryCount()
    {
        if (!RetryCount.HasValue)
            RetryCount = 0;

        RetryCount++;
    }

    public T? GetInputData<T>() where T : class
    {
        if (string.IsNullOrWhiteSpace(InputData))
            return null;

        try
        {
            return JsonSerializer.Deserialize<T>(InputData);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public T? GetOutputData<T>() where T : class
    {
        if (string.IsNullOrWhiteSpace(OutputData))
            return null;

        try
        {
            return JsonSerializer.Deserialize<T>(OutputData);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public bool IsCompleted()
    {
        return Status == ExecutionStatus.Completed || 
               Status == ExecutionStatus.Failed || 
               Status == ExecutionStatus.Cancelled;
    }

    public TimeSpan GetDuration()
    {
        var endTime = CompletedAt ?? DateTime.UtcNow;
        return endTime - StartedAt;
    }
} 