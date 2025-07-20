using System.Text.Json;
using WorkflowSystem.Domain.Entities;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Domain.Strategies;

public class ScriptExecutionTaskStrategy : ITaskStrategy
{
    public string TaskType => "ScriptExecution";
    public string DisplayName => "Script Execution";
    public string Description => "Execute C#, JavaScript, Python, Bash, or SQL scripts";
    public string Icon => "code";
    public bool IsConfigurable => true;

    public async System.Threading.Tasks.Task<ExecutionStep> ExecuteAsync(Task task, ExecutionStep step, object? inputData, CancellationToken cancellationToken = default)
    {
        try
        {
            step.Start();
            
            var config = task.GetConfiguration<ScriptExecutionConfiguration>();
            
            // For now, we'll implement a basic script execution
            // In a real implementation, you'd have separate engines for each language
            var result = await ExecuteScriptAsync(config, inputData, cancellationToken);
            
            step.SetOutputData(result);
            step.Complete();
            return step;
        }
        catch (Exception ex)
        {
            step.Fail(ex.Message);
            return step;
        }
    }

    private async Task<object> ExecuteScriptAsync(ScriptExecutionConfiguration config, object? inputData, CancellationToken cancellationToken)
    {
        // This is a placeholder implementation
        // In a real system, you'd have separate execution engines for each language
        switch (config.Language.ToLower())
        {
            case "javascript":
                return await ExecuteJavaScriptAsync(config.Script, inputData, cancellationToken);
            case "csharp":
                return await ExecuteCSharpAsync(config.Script, inputData, cancellationToken);
            case "python":
                return await ExecutePythonAsync(config.Script, inputData, cancellationToken);
            case "bash":
                return await ExecuteBashAsync(config.Script, inputData, cancellationToken);
            case "sql":
                return await ExecuteSqlAsync(config.Script, inputData, cancellationToken);
            default:
                throw new NotSupportedException($"Language '{config.Language}' is not supported");
        }
    }

    private async Task<object> ExecuteJavaScriptAsync(string script, object? inputData, CancellationToken cancellationToken)
    {
        // Placeholder - would use a JavaScript engine like Jint or Node.js
        await System.Threading.Tasks.Task.Delay(100, cancellationToken); // Simulate execution time
        return new { result = "JavaScript execution result", input = inputData };
    }

    private async System.Threading.Tasks.Task<object> ExecuteCSharpAsync(string script, object? inputData, CancellationToken cancellationToken)
    {
        // Placeholder - would use Roslyn or similar
        await System.Threading.Tasks.Task.Delay(100, cancellationToken);
        return new { result = "C# execution result", input = inputData };
    }

    private async System.Threading.Tasks.Task<object> ExecutePythonAsync(string script, object? inputData, CancellationToken cancellationToken)
    {
        // Placeholder - would use IronPython or subprocess
        await System.Threading.Tasks.Task.Delay(100, cancellationToken);
        return new { result = "Python execution result", input = inputData };
    }

    private async System.Threading.Tasks.Task<object> ExecuteBashAsync(string script, object? inputData, CancellationToken cancellationToken)
    {
        // Placeholder - would use Process.Start
        await System.Threading.Tasks.Task.Delay(100, cancellationToken);
        return new { result = "Bash execution result", input = inputData };
    }

    private async System.Threading.Tasks.Task<object> ExecuteSqlAsync(string script, object? inputData, CancellationToken cancellationToken)
    {
        // Placeholder - would use Entity Framework or raw SQL
        await System.Threading.Tasks.Task.Delay(100, cancellationToken);
        return new { result = "SQL execution result", input = inputData };
    }

    public object GetDefaultConfiguration()
    {
        return new ScriptExecutionConfiguration
        {
            Language = "javascript",
            Script = "// Your script here\nreturn { message: 'Hello World' };",
            TimeoutSeconds = 30,
            OutputFormat = "json"
        };
    }

    public bool ValidateConfiguration(string configuration)
    {
        try
        {
            var config = JsonSerializer.Deserialize<ScriptExecutionConfiguration>(configuration);
            return config != null && 
                   !string.IsNullOrWhiteSpace(config.Language) &&
                   !string.IsNullOrWhiteSpace(config.Script);
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
                ["language"] = new Dictionary<string, object>
                {
                    ["type"] = "string",
                    ["enum"] = new[] { "javascript", "csharp", "python", "bash", "sql" }
                },
                ["script"] = new Dictionary<string, object>
                {
                    ["type"] = "string"
                },
                ["timeoutSeconds"] = new Dictionary<string, object>
                {
                    ["type"] = "integer",
                    ["minimum"] = 1,
                    ["maximum"] = 300
                },
                ["outputFormat"] = new Dictionary<string, object>
                {
                    ["type"] = "string",
                    ["enum"] = new[] { "json", "csv", "jsonl", "xml" }
                }
            },
            ["required"] = new[] { "language", "script" }
        };

        return JsonSerializer.Serialize(schema);
    }
}

public class ScriptExecutionConfiguration
{
    public string Language { get; set; } = "javascript";
    public string Script { get; set; } = string.Empty;
    public int? TimeoutSeconds { get; set; } = 30;
    public string OutputFormat { get; set; } = "json";
} 