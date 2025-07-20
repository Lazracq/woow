using Quartz;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using Task = WorkflowSystem.Domain.Entities.Task;
using Microsoft.Extensions.Logging;

namespace WorkflowSystem.Infrastructure.Jobs;

[DisallowConcurrentExecution]
public class WorkflowExecutionJob : IJob
{
    private readonly IWorkflowExecutionEngine _executionEngine;
    private readonly IWorkflowRepository _workflowRepository;
    private readonly ILogger<WorkflowExecutionJob> _logger;

    public WorkflowExecutionJob(
        IWorkflowExecutionEngine executionEngine,
        IWorkflowRepository workflowRepository,
        ILogger<WorkflowExecutionJob> logger)
    {
        _executionEngine = executionEngine;
        _workflowRepository = workflowRepository;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            var workflowId = context.JobDetail.JobDataMap.GetGuid("WorkflowId");
            var triggerId = context.JobDetail.JobDataMap.GetGuid("TriggerId");
            var userId = context.JobDetail.JobDataMap.GetGuid("UserId");

            _logger.LogInformation("Executing scheduled workflow {WorkflowId} triggered by {TriggerId}", workflowId, triggerId);

            // Get the workflow from repository
            var workflow = await _workflowRepository.GetByIdAsync(workflowId, context.CancellationToken);
            if (workflow == null)
            {
                _logger.LogWarning("Workflow {WorkflowId} not found for scheduled execution", workflowId);
                return;
            }

            // Execute the workflow
            var execution = await _executionEngine.ExecuteWorkflowAsync(workflowId, userId, context.CancellationToken);

            _logger.LogInformation("Scheduled workflow {WorkflowId} executed successfully. Execution ID: {ExecutionId}", 
                workflowId, execution.Id);

            // Update trigger last execution time
            await UpdateTriggerLastExecutionAsync(triggerId, DateTime.UtcNow);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing scheduled workflow {WorkflowId}", 
                context.JobDetail.JobDataMap.GetGuid("WorkflowId"));
            throw;
        }
    }

    private async System.Threading.Tasks.Task UpdateTriggerLastExecutionAsync(Guid triggerId, DateTime executionTime)
    {
        // This would typically update the trigger's last execution time
        // For now, we'll just log it
        _logger.LogInformation("Trigger {TriggerId} last executed at {ExecutionTime}", triggerId, executionTime);
    }
}

public static class JobDataMapExtensions
{
    public static Guid GetGuid(this JobDataMap jobDataMap, string key)
    {
        var value = jobDataMap.GetString(key);
        return Guid.Parse(value ?? throw new InvalidOperationException($"Job data key '{key}' not found"));
    }

    public static void SetGuid(this JobDataMap jobDataMap, string key, Guid value)
    {
        jobDataMap.Put(key, value.ToString());
    }
} 