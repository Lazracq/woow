using Quartz;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using WorkflowSystem.Domain.Enums;
using WorkflowSystem.Infrastructure.Jobs;
using Microsoft.Extensions.Logging;

namespace WorkflowSystem.Infrastructure.Services;

public class WorkflowSchedulerService : IWorkflowSchedulerService
{
    private readonly ISchedulerFactory _schedulerFactory;
    private readonly ILogger<WorkflowSchedulerService> _logger;

    public WorkflowSchedulerService(
        ISchedulerFactory schedulerFactory,
        ILogger<WorkflowSchedulerService> logger)
    {
        _schedulerFactory = schedulerFactory;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task ScheduleWorkflowAsync(Workflow workflow, Trigger trigger, Guid userId)
    {
        var scheduler = await _schedulerFactory.GetScheduler();
        
        var jobKey = CreateJobKey(workflow.Id, trigger.Id);
        var triggerKey = CreateTriggerKey(workflow.Id, trigger.Id);

        // Create job data
        var jobData = new JobDataMap
        {
            ["WorkflowId"] = workflow.Id.ToString(),
            ["TriggerId"] = trigger.Id.ToString(),
            ["UserId"] = userId.ToString()
        };

        // Create job detail
        var jobDetail = JobBuilder.Create<WorkflowExecutionJob>()
            .WithIdentity(jobKey)
            .UsingJobData(jobData)
            .StoreDurably()
            .Build();

        // Create trigger based on trigger type
        ITrigger quartzTrigger;
        
        switch (trigger.Type)
        {
            case TriggerType.Cron:
                var cronConfig = trigger.GetConfiguration<CronTriggerConfiguration>();
                quartzTrigger = TriggerBuilder.Create()
                    .WithIdentity(triggerKey)
                    .WithCronSchedule(cronConfig.CronExpression)
                    .ForJob(jobDetail)
                    .Build();
                break;

            case TriggerType.Interval:
                var intervalConfig = trigger.GetConfiguration<IntervalTriggerConfiguration>();
                quartzTrigger = TriggerBuilder.Create()
                    .WithIdentity(triggerKey)
                    .WithSimpleSchedule(x => x
                        .WithIntervalInSeconds(intervalConfig.IntervalSeconds)
                        .RepeatForever())
                    .ForJob(jobDetail)
                    .Build();
                break;

            case TriggerType.OneTime:
                var oneTimeConfig = trigger.GetConfiguration<OneTimeTriggerConfiguration>();
                quartzTrigger = TriggerBuilder.Create()
                    .WithIdentity(triggerKey)
                    .StartAt(oneTimeConfig.ExecutionTime)
                    .ForJob(jobDetail)
                    .Build();
                break;

            default:
                throw new NotSupportedException($"Trigger type {trigger.Type} is not supported for scheduling");
        }

        // Schedule the job
        await scheduler.ScheduleJob(jobDetail, quartzTrigger);
        
        _logger.LogInformation("Scheduled workflow {WorkflowId} with trigger {TriggerId} for user {UserId}", 
            workflow.Id, trigger.Id, userId);
    }

    public async System.Threading.Tasks.Task UnscheduleWorkflowAsync(Guid workflowId, Guid triggerId)
    {
        var scheduler = await _schedulerFactory.GetScheduler();
        var triggerKey = CreateTriggerKey(workflowId, triggerId);
        var jobKey = CreateJobKey(workflowId, triggerId);

        var unscheduled = await scheduler.UnscheduleJob(triggerKey);
        if (unscheduled)
        {
            await scheduler.DeleteJob(jobKey);
            _logger.LogInformation("Unscheduled workflow {WorkflowId} with trigger {TriggerId}", workflowId, triggerId);
        }
    }

    public async System.Threading.Tasks.Task PauseWorkflowScheduleAsync(Guid workflowId, Guid triggerId)
    {
        var scheduler = await _schedulerFactory.GetScheduler();
        var triggerKey = CreateTriggerKey(workflowId, triggerId);

        await scheduler.PauseTrigger(triggerKey);
        _logger.LogInformation("Paused workflow {WorkflowId} with trigger {TriggerId}", workflowId, triggerId);
    }

    public async System.Threading.Tasks.Task ResumeWorkflowScheduleAsync(Guid workflowId, Guid triggerId)
    {
        var scheduler = await _schedulerFactory.GetScheduler();
        var triggerKey = CreateTriggerKey(workflowId, triggerId);

        await scheduler.ResumeTrigger(triggerKey);
        _logger.LogInformation("Resumed workflow {WorkflowId} with trigger {TriggerId}", workflowId, triggerId);
    }

    public async System.Threading.Tasks.Task<List<TriggerInfo>> GetScheduledTriggersAsync(Guid workflowId)
    {
        var scheduler = await _schedulerFactory.GetScheduler();
        var triggers = new List<TriggerInfo>();

        // Get all triggers for this workflow
        var jobGroups = await scheduler.GetJobGroupNames();
        foreach (var group in jobGroups)
        {
            var jobKeys = await scheduler.GetJobKeys(Quartz.Impl.Matchers.GroupMatcher<JobKey>.GroupEquals(group));
            foreach (var jobKey in jobKeys)
            {
                if (jobKey.Name.StartsWith($"workflow-{workflowId}"))
                {
                    var jobDetail = await scheduler.GetJobDetail(jobKey);
                    var jobTriggers = await scheduler.GetTriggersOfJob(jobKey);
                    
                    foreach (var trigger in jobTriggers)
                    {
                        var triggerId = Guid.Parse(trigger.Key.Name.Split('-').Last());
                        triggers.Add(new TriggerInfo
                        {
                            TriggerId = triggerId,
                            NextFireTime = trigger.GetNextFireTimeUtc()?.DateTime,
                            PreviousFireTime = trigger.GetPreviousFireTimeUtc()?.DateTime,
                            State = "Normal" // Simplified state for now
                        });
                    }
                }
            }
        }

        return triggers;
    }

    private static JobKey CreateJobKey(Guid workflowId, Guid triggerId)
    {
        return new JobKey($"workflow-{workflowId}-trigger-{triggerId}", "workflow-execution");
    }

    private static TriggerKey CreateTriggerKey(Guid workflowId, Guid triggerId)
    {
        return new TriggerKey($"workflow-{workflowId}-trigger-{triggerId}", "workflow-execution");
    }
}



public class CronTriggerConfiguration
{
    public string CronExpression { get; set; } = string.Empty;
}

public class IntervalTriggerConfiguration
{
    public int IntervalSeconds { get; set; } = 60;
}

public class OneTimeTriggerConfiguration
{
    public DateTime ExecutionTime { get; set; }
} 