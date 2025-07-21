using System.Text.Json;
using WorkflowSystem.Domain.Entities;
using System.Threading.Tasks;
using System.Threading;

namespace WorkflowSystem.Domain.Strategies;

public class DelayTaskStrategy : ITaskStrategy
{
    public string TaskType => "Delay";
    public string DisplayName => "Delay";
    public string Description => "Pause workflow execution for a specified duration.";
    public string Icon => "clock";
    public bool IsConfigurable => true;

    public async Task<ExecutionStep> ExecuteAsync(Task task, ExecutionStep step, object? inputData, CancellationToken cancellationToken = default)
    {
        try
        {
            step.Start();
            var config = task.GetConfiguration<DelayTaskConfiguration>();
            int duration = config.DurationSeconds > 0 ? config.DurationSeconds : 1;
            await Task.Delay(duration * 1000, cancellationToken);
            step.SetOutputData($"Waited {duration} seconds");
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
        return new DelayTaskConfiguration { DurationSeconds = 60 };
    }

    public bool ValidateConfiguration(string configuration)
    {
        try
        {
            var config = JsonSerializer.Deserialize<DelayTaskConfiguration>(configuration);
            return config != null && config.DurationSeconds > 0;
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
                ["durationSeconds"] = new Dictionary<string, object>
                {
                    ["type"] = "integer",
                    ["minimum"] = 1,
                    ["default"] = 60
                }
            },
            ["required"] = new[] { "durationSeconds" }
        };
        return JsonSerializer.Serialize(schema);
    }
}

public class DelayTaskConfiguration
{
    public int DurationSeconds { get; set; } = 60;
} 