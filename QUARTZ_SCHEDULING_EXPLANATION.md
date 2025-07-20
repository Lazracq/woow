# Quartz.NET Scheduling in WooWStudiO

## 🎯 **How Quartz.NET Works in Our Workflow System**

### **1. Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Trigger       │    │  Quartz.NET      │    │  Workflow       │
│   Entity        │───▶│  Scheduler       │───▶│  Execution      │
│   (Database)    │    │  (In-Memory)     │    │  Engine         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cron/Interval │    │  Job Store       │    │  Task           │
│   Configuration │    │  (PostgreSQL)    │    │  Strategies     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **2. Key Components**

#### **A. WorkflowExecutionJob**
```csharp
[DisallowConcurrentExecution]
public class WorkflowExecutionJob : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        var workflowId = context.JobDetail.JobDataMap.GetGuid("WorkflowId");
        var triggerId = context.JobDetail.JobDataMap.GetGuid("TriggerId");
        var userId = context.JobDetail.JobDataMap.GetGuid("UserId");

        // Execute the workflow
        var execution = await _executionEngine.ExecuteWorkflowAsync(workflowId, userId, context.CancellationToken);
    }
}
```

**What it does:**
- **Quartz Job**: Implements `IJob` interface
- **DisallowConcurrentExecution**: Prevents multiple executions of the same workflow
- **Job Data**: Stores workflow ID, trigger ID, and user ID
- **Execution**: Calls our workflow execution engine

#### **B. WorkflowSchedulerService**
```csharp
public class WorkflowSchedulerService : IWorkflowSchedulerService
{
    public async Task ScheduleWorkflowAsync(Workflow workflow, Trigger trigger, Guid userId)
    {
        // Create Quartz job and trigger based on trigger type
        switch (trigger.Type)
        {
            case TriggerType.Cron:
                // Parse cron expression and schedule
                break;
            case TriggerType.Interval:
                // Set up interval-based scheduling
                break;
            case TriggerType.OneTime:
                // Schedule one-time execution
                break;
        }
    }
}
```

**What it does:**
- **Job Creation**: Creates Quartz jobs for workflow execution
- **Trigger Mapping**: Converts our trigger types to Quartz triggers
- **Scheduling**: Manages job scheduling, pausing, and resuming
- **Monitoring**: Provides trigger information and status

### **3. Trigger Types & Quartz Integration**

#### **A. Cron Triggers**
```csharp
// Our trigger configuration
{
    "cronExpression": "0 0 9 * * ?"  // Every day at 9 AM
}

// Quartz integration
var quartzTrigger = TriggerBuilder.Create()
    .WithIdentity(triggerKey)
    .WithCronSchedule(cronConfig.CronExpression)
    .ForJob(jobDetail)
    .Build();
```

#### **B. Interval Triggers**
```csharp
// Our trigger configuration
{
    "intervalSeconds": 300  // Every 5 minutes
}

// Quartz integration
var quartzTrigger = TriggerBuilder.Create()
    .WithIdentity(triggerKey)
    .WithSimpleSchedule(x => x
        .WithIntervalInSeconds(intervalConfig.IntervalSeconds)
        .RepeatForever())
    .ForJob(jobDetail)
    .Build();
```

#### **C. One-Time Triggers**
```csharp
// Our trigger configuration
{
    "executionTime": "2024-01-15T10:00:00Z"
}

// Quartz integration
var quartzTrigger = TriggerBuilder.Create()
    .WithIdentity(triggerKey)
    .StartAt(oneTimeConfig.ExecutionTime)
    .ForJob(jobDetail)
    .Build();
```

### **4. Database Integration**

#### **A. Job Store Configuration**
```csharp
services.AddQuartz(q =>
{
    q.UsePersistentStore(s =>
    {
        s.UseProperties = true;
        s.RetryInterval = TimeSpan.FromSeconds(15);
        s.UsePostgreSql(connectionString);
        s.UseJsonSerializer();
    });
});
```

**What it stores:**
- **Job Details**: Workflow execution jobs
- **Trigger Information**: Scheduling details
- **Execution History**: Past and future executions
- **State Management**: Job and trigger states

#### **B. Tables Created by Quartz**
```sql
-- Quartz automatically creates these tables
QRTZ_JOB_DETAILS      -- Job definitions
QRTZ_TRIGGERS         -- Trigger definitions
QRTZ_SCHEDULER_STATE  -- Scheduler state
QRTZ_FIRED_TRIGGERS   -- Execution history
QRTZ_SIMPLE_TRIGGERS  -- Simple trigger details
QRTZ_CRON_TRIGGERS    -- Cron trigger details
```

### **5. Workflow Lifecycle with Quartz**

#### **A. Workflow Creation**
```csharp
// 1. Create workflow
var workflow = new Workflow("Daily Report", "Generate daily report");

// 2. Add trigger
var trigger = new Trigger("Daily Trigger", TriggerType.Cron, 
    JsonSerializer.Serialize(new { cronExpression = "0 0 9 * * ?" }));
workflow.AddTrigger(trigger);

// 3. Save to database
await _workflowRepository.AddAsync(workflow);

// 4. Schedule with Quartz
await _schedulerService.ScheduleWorkflowAsync(workflow, trigger, userId);
```

#### **B. Execution Flow**
```csharp
// 1. Quartz fires the job
WorkflowExecutionJob.Execute(context)

// 2. Job extracts workflow data
var workflowId = context.JobDetail.JobDataMap.GetGuid("WorkflowId");

// 3. Execute workflow
var execution = await _executionEngine.ExecuteWorkflowAsync(workflowId, userId);

// 4. Update execution history
await _executionRepository.AddAsync(execution);
```

### **6. Monitoring & Management**

#### **A. Get Scheduled Triggers**
```csharp
public async Task<List<TriggerInfo>> GetScheduledTriggersAsync(Guid workflowId)
{
    var scheduler = await _schedulerFactory.GetScheduler();
    var triggers = new List<TriggerInfo>();

    // Query Quartz for all triggers for this workflow
    foreach (var trigger in jobTriggers)
    {
        triggers.Add(new TriggerInfo
        {
            TriggerId = triggerId,
            NextFireTime = trigger.GetNextFireTimeUtc()?.DateTime,
            PreviousFireTime = trigger.GetPreviousFireTimeUtc()?.DateTime,
            State = trigger.GetTriggerState().ToString()
        });
    }

    return triggers;
}
```

#### **B. Pause/Resume Triggers**
```csharp
// Pause a trigger
await scheduler.PauseTrigger(triggerKey);

// Resume a trigger
await scheduler.ResumeTrigger(triggerKey);

// Unschedule a trigger
await scheduler.UnscheduleJob(triggerKey);
await scheduler.DeleteJob(jobKey);
```

### **7. Benefits of Quartz.NET Integration**

#### **A. Reliability**
- **Persistent Storage**: Jobs survive application restarts
- **Clustering**: Multiple instances can share job scheduling
- **Error Handling**: Automatic retry mechanisms
- **Transaction Support**: ACID compliance for job operations

#### **B. Flexibility**
- **Multiple Trigger Types**: Cron, Simple, Calendar, Custom
- **Dynamic Scheduling**: Add/remove triggers at runtime
- **Complex Patterns**: Advanced scheduling expressions
- **Time Zones**: Full timezone support

#### **C. Monitoring**
- **Real-time Status**: Job and trigger states
- **Execution History**: Complete audit trail
- **Performance Metrics**: Execution times and statistics
- **Health Checks**: Scheduler health monitoring

### **8. Configuration Examples**

#### **A. Cron Expressions**
```csharp
// Every day at 9 AM
"0 0 9 * * ?"

// Every Monday at 8 AM
"0 0 8 ? * MON"

// Every 15 minutes
"0 */15 * * * ?"

// Every hour on weekdays
"0 0 * ? * MON-FRI"
```

#### **B. Interval Scheduling**
```csharp
// Every 5 minutes
.WithIntervalInSeconds(300)

// Every hour
.WithIntervalInHours(1)

// Every day
.WithIntervalInDays(1)
```

### **9. Error Handling & Recovery**

#### **A. Job Failure Handling**
```csharp
public async Task Execute(IJobExecutionContext context)
{
    try
    {
        // Execute workflow
        var execution = await _executionEngine.ExecuteWorkflowAsync(workflowId, userId);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Workflow execution failed");
        
        // Quartz will handle retry logic
        throw; // Re-throw to trigger Quartz retry mechanism
    }
}
```

#### **B. Retry Configuration**
```csharp
services.AddQuartz(q =>
{
    q.UsePersistentStore(s =>
    {
        s.RetryInterval = TimeSpan.FromSeconds(15);
        s.MaxBatchSize = 1;
        s.UseIsolationLevel = IsolationLevel.ReadCommitted;
    });
});
```

### **10. Integration with WooWStudiO**

#### **A. Frontend Integration**
```typescript
// Schedule a workflow
const scheduleWorkflow = async (workflowId: string, trigger: TriggerConfig) => {
    const response = await api.post(`/workflows/${workflowId}/schedule`, trigger);
    return response.data;
};

// Get scheduled triggers
const getScheduledTriggers = async (workflowId: string) => {
    const response = await api.get(`/workflows/${workflowId}/triggers`);
    return response.data;
};
```

#### **B. API Endpoints**
```csharp
[HttpPost("{id}/schedule")]
public async Task<IActionResult> ScheduleWorkflow(Guid id, ScheduleRequest request)
{
    var workflow = await _workflowRepository.GetByIdAsync(id);
    var trigger = workflow.Triggers.First(t => t.Id == request.TriggerId);
    
    await _schedulerService.ScheduleWorkflowAsync(workflow, trigger, User.GetUserId());
    
    return Ok();
}
```

## 🎉 **Summary**

Quartz.NET provides a robust, enterprise-grade scheduling solution for our workflow system:

- **Reliable**: Persistent storage ensures jobs survive restarts
- **Scalable**: Supports clustering and distributed scheduling
- **Flexible**: Multiple trigger types and complex scheduling patterns
- **Monitorable**: Complete visibility into job execution and status
- **Integrable**: Seamlessly integrates with our existing workflow engine

The integration allows users to schedule workflows using familiar cron expressions or simple intervals, while providing enterprise-level reliability and monitoring capabilities. 