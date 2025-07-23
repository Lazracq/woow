using System.Text.Json;
using WorkflowSystem.Domain.Entities;
using System.Threading.Tasks;
using System.Threading;
using TaskEntity = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Domain.Strategies;

public class DelayTaskStrategy : ITaskStrategy
{
    public string TaskType => "Delay";
    public string DisplayName => "Delay";
    public string Description => "Pause workflow execution for a specified duration.";
    public string Icon => "clock";
    public bool IsConfigurable => true;

    public async Task<ExecutionStep> ExecuteAsync(TaskEntity task, ExecutionStep step, object? inputData, CancellationToken cancellationToken = default)
    {
        try
        {
            step.Start();
            var config = task.GetConfiguration<DelayTaskConfiguration>();
            int duration = config.DurationMilliseconds > 0 ? config.DurationMilliseconds : 1000;
            await System.Threading.Tasks.Task.Delay(duration, cancellationToken);
            step.SetOutputData($"Waited {duration} ms");
            step.Complete();
            return step;
        }
        catch (Exception ex)
        {
            step.Fail(ex.Message);
            return step;
        }
    }

    public object GetDefaultConfiguration()
    {
        return new DelayTaskConfiguration { DurationMilliseconds = 1000, UserDescription = string.Empty };
    }

    public bool ValidateConfiguration(string configuration)
    {
        try
        {
            var config = JsonSerializer.Deserialize<DelayTaskConfiguration>(configuration);
            return config != null && config.DurationMilliseconds > 0;
        }
        catch
        {
            return false;
        }
    }

    public string GetConfigurationSchema()
    {
        var schema = new Dictionary<string, object>
        {
            ["type"] = "object",
            ["properties"] = new Dictionary<string, object>
            {
                ["durationMilliseconds"] = new Dictionary<string, object>
                {
                    ["type"] = "integer",
                    ["minimum"] = 1,
                    ["default"] = 1000
                },
                ["userDescription"] = new Dictionary<string, object>
                {
                    ["type"] = "string"
                }
            },
            ["required"] = new[] { "durationMilliseconds" }
        };
        return JsonSerializer.Serialize(schema);
    }
}

public class DelayTaskConfiguration
{
    public int DurationMilliseconds { get; set; } = 1000;
    public string? UserDescription { get; set; }
} 