using WorkflowSystem.Domain.Entities;

namespace WorkflowSystem.Application.Common.Interfaces;

public interface IWorkflowSchedulerService
{
    System.Threading.Tasks.Task ScheduleWorkflowAsync(Workflow workflow, Trigger trigger, Guid userId);
    System.Threading.Tasks.Task UnscheduleWorkflowAsync(Guid workflowId, Guid triggerId);
    System.Threading.Tasks.Task PauseWorkflowScheduleAsync(Guid workflowId, Guid triggerId);
    System.Threading.Tasks.Task ResumeWorkflowScheduleAsync(Guid workflowId, Guid triggerId);
    System.Threading.Tasks.Task<List<TriggerInfo>> GetScheduledTriggersAsync(Guid workflowId);
}

public class TriggerInfo
{
    public Guid TriggerId { get; set; }
    public DateTime? NextFireTime { get; set; }
    public DateTime? PreviousFireTime { get; set; }
    public string State { get; set; } = string.Empty;
} 