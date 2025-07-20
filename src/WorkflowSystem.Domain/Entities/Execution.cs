using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using WorkflowSystem.Domain.Enums;

namespace WorkflowSystem.Domain.Entities;

public class Execution : BaseEntity
{
    public Execution(Guid workflowId, ExecutionStatus status = ExecutionStatus.Pending)
    {
        WorkflowId = workflowId;
        Status = status;
        StartedAt = DateTime.UtcNow;
        ExecutionSteps = new List<ExecutionStep>();
    }

    public Guid WorkflowId { get; private set; }

    public ExecutionStatus Status { get; private set; }

    public DateTime StartedAt { get; private set; }

    public DateTime? CompletedAt { get; private set; }

    [StringLength(50)]
    public string? TriggeredBy { get; private set; }

    public string? TriggerData { get; private set; }

    public Guid? CreatedBy { get; private set; }

    public string? ErrorMessage { get; private set; }

    public int? TotalSteps { get; private set; }

    public int? CompletedSteps { get; private set; }

    // Navigation properties
    public virtual Workflow Workflow { get; private set; } = null!;
    public virtual ICollection<ExecutionStep> ExecutionSteps { get; private set; }

    // Business methods
    public void Start()
    {
        if (Status != ExecutionStatus.Pending)
            throw new InvalidOperationException("Execution can only be started when in Pending status.");

        Status = ExecutionStatus.Running;
        StartedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (Status != ExecutionStatus.Running)
            throw new InvalidOperationException("Execution can only be completed when in Running status.");

        Status = ExecutionStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }

    public void Fail(string errorMessage)
    {
        if (Status != ExecutionStatus.Running)
            throw new InvalidOperationException("Execution can only be failed when in Running status.");

        Status = ExecutionStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status != ExecutionStatus.Pending && Status != ExecutionStatus.Running)
            throw new InvalidOperationException("Execution can only be cancelled when in Pending or Running status.");

        Status = ExecutionStatus.Cancelled;
        CompletedAt = DateTime.UtcNow;
    }

    public void Pause()
    {
        if (Status != ExecutionStatus.Running)
            throw new InvalidOperationException("Execution can only be paused when in Running status.");

        Status = ExecutionStatus.Paused;
    }

    public void Resume()
    {
        if (Status != ExecutionStatus.Paused)
            throw new InvalidOperationException("Execution can only be resumed when in Paused status.");

        Status = ExecutionStatus.Running;
    }

    public void SetTriggeredBy(string triggeredBy)
    {
        TriggeredBy = triggeredBy;
    }

    public void SetTriggerData(object triggerData)
    {
        TriggerData = JsonSerializer.Serialize(triggerData);
    }

    public void SetCreatedBy(Guid userId)
    {
        CreatedBy = userId;
    }

    public void SetProgress(int totalSteps, int completedSteps)
    {
        TotalSteps = totalSteps;
        CompletedSteps = completedSteps;
    }

    public void AddExecutionStep(ExecutionStep step)
    {
        if (step == null)
            throw new ArgumentNullException(nameof(step));

        ExecutionSteps.Add(step);
    }

    public double GetProgressPercentage()
    {
        if (TotalSteps == null || TotalSteps == 0)
            return 0;

        return (double)(CompletedSteps ?? 0) / TotalSteps.Value * 100;
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