using Microsoft.Extensions.DependencyInjection;

namespace WorkflowSystem.Domain.Strategies;

public interface ITaskStrategyFactory
{
    ITaskStrategy GetStrategy(string taskType);
    IEnumerable<ITaskStrategy> GetAllStrategies();
    bool IsValidTaskType(string taskType);
}

public class TaskStrategyFactory : ITaskStrategyFactory
{
    private readonly Dictionary<string, ITaskStrategy> _strategies;

    public TaskStrategyFactory(IEnumerable<ITaskStrategy> strategies)
    {
        _strategies = strategies.ToDictionary(s => s.TaskType, s => s);
    }

    public ITaskStrategy GetStrategy(string taskType)
    {
        if (!_strategies.TryGetValue(taskType, out var strategy))
        {
            throw new ArgumentException($"Task type '{taskType}' is not supported");
        }
        return strategy;
    }

    public IEnumerable<ITaskStrategy> GetAllStrategies()
    {
        return _strategies.Values;
    }

    public bool IsValidTaskType(string taskType)
    {
        return _strategies.ContainsKey(taskType);
    }
}

public static class TaskStrategyExtensions
{
    public static IServiceCollection AddTaskStrategies(this IServiceCollection services)
    {
        // Register all task strategies
        services.AddScoped<ITaskStrategy, HttpCalloutTaskStrategy>();
        services.AddScoped<ITaskStrategy, ScriptExecutionTaskStrategy>();
        services.AddScoped<ITaskStrategy, DelayTaskStrategy>();
        // Add more strategies here as they are implemented
        
        // Register the factory
        services.AddScoped<ITaskStrategyFactory, TaskStrategyFactory>();
        
        return services;
    }
} 