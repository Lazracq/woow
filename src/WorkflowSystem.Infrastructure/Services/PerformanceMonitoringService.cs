using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using WorkflowSystem.Domain.Enums;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Infrastructure.Services;

public class PerformanceMetrics
{
    public long TotalExecutions { get; set; }
    public long SuccessfulExecutions { get; set; }
    public long FailedExecutions { get; set; }
    public double AverageExecutionTime { get; set; }
    public double CacheHitRate { get; set; }
    public long QueueLength { get; set; }
    public long ActiveLocks { get; set; }
    public double MemoryUsage { get; set; }
    public double CpuUsage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ExecutionMetrics
{
    public Guid ExecutionId { get; set; }
    public Guid WorkflowId { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public TimeSpan Duration { get; set; }
    public ExecutionStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class CacheMetrics
{
    public string CacheType { get; set; } = string.Empty;
    public long Hits { get; set; }
    public long Misses { get; set; }
    public double HitRate => TotalRequests > 0 ? (double)Hits / TotalRequests : 0;
    public long TotalRequests => Hits + Misses;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public interface IPerformanceMonitoringService
{
    System.Threading.Tasks.Task TrackExecutionAsync(ExecutionMetrics metrics);
    System.Threading.Tasks.Task TrackCacheHitAsync(string cacheType);
    System.Threading.Tasks.Task TrackCacheMissAsync(string cacheType);
    System.Threading.Tasks.Task<PerformanceMetrics> GetPerformanceMetricsAsync();
    System.Threading.Tasks.Task<List<ExecutionMetrics>> GetRecentExecutionsAsync(int count = 100);
    System.Threading.Tasks.Task<CacheMetrics> GetCacheMetricsAsync(string cacheType);
    System.Threading.Tasks.Task<List<CacheMetrics>> GetAllCacheMetricsAsync();
    System.Threading.Tasks.Task<double> GetAverageExecutionTimeAsync(string workflowType);
    System.Threading.Tasks.Task<long> GetExecutionCountAsync(string workflowType, DateTime date);
    System.Threading.Tasks.Task ResetMetricsAsync();
}

public class PerformanceMonitoringService : IPerformanceMonitoringService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<PerformanceMonitoringService> _logger;
    private readonly string _metricsPrefix = "metrics:";
    private readonly string _executionsKey = "metrics:executions";
    private readonly string _cacheMetricsKey = "metrics:cache";
    private readonly string _performanceKey = "metrics:performance";

    public PerformanceMonitoringService(
        IConnectionMultiplexer redis,
        ILogger<PerformanceMonitoringService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task TrackExecutionAsync(ExecutionMetrics metrics)
    {
        try
        {
            var db = _redis.GetDatabase();
            var serialized = JsonSerializer.Serialize(metrics);
            
            // Store execution metrics
            await db.ListLeftPushAsync(_executionsKey, serialized);
            await db.ListTrimAsync(_executionsKey, 0, 999); // Keep last 1000 executions
            
            // Update counters
            var totalKey = $"{_metricsPrefix}executions:total";
            var successKey = $"{_metricsPrefix}executions:success";
            var failedKey = $"{_metricsPrefix}executions:failed";
            
            await db.StringIncrementAsync(totalKey);
            
            if (metrics.Status == ExecutionStatus.Completed)
            {
                await db.StringIncrementAsync(successKey);
            }
            else if (metrics.Status == ExecutionStatus.Failed)
            {
                await db.StringIncrementAsync(failedKey);
            }
            
            // Track execution time
            var timeKey = $"{_metricsPrefix}execution:time:{DateTime.UtcNow:yyyy-MM-dd}";
            await db.ListRightPushAsync(timeKey, metrics.Duration.TotalMilliseconds.ToString());
            
            _logger.LogDebug("Tracked execution {ExecutionId} with duration {Duration}", 
                metrics.ExecutionId, metrics.Duration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking execution metrics");
        }
    }

    public async System.Threading.Tasks.Task TrackCacheHitAsync(string cacheType)
    {
        try
        {
            var db = _redis.GetDatabase();
            var key = $"{_cacheMetricsKey}:{cacheType}:hits:{DateTime.UtcNow:yyyy-MM-dd}";
            await db.StringIncrementAsync(key);
            
            _logger.LogDebug("Tracked cache hit for {CacheType}", cacheType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking cache hit for {CacheType}", cacheType);
        }
    }

    public async System.Threading.Tasks.Task TrackCacheMissAsync(string cacheType)
    {
        try
        {
            var db = _redis.GetDatabase();
            var key = $"{_cacheMetricsKey}:{cacheType}:misses:{DateTime.UtcNow:yyyy-MM-dd}";
            await db.StringIncrementAsync(key);
            
            _logger.LogDebug("Tracked cache miss for {CacheType}", cacheType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking cache miss for {CacheType}", cacheType);
        }
    }

    public async System.Threading.Tasks.Task<PerformanceMetrics> GetPerformanceMetricsAsync()
    {
        try
        {
            var db = _redis.GetDatabase();
            var metrics = new PerformanceMetrics();
            
            // Get execution counts
            var totalKey = $"{_metricsPrefix}executions:total";
            var successKey = $"{_metricsPrefix}executions:success";
            var failedKey = $"{_metricsPrefix}executions:failed";
            
            var total = await db.StringGetAsync(totalKey);
            var success = await db.StringGetAsync(successKey);
            var failed = await db.StringGetAsync(failedKey);
            
            metrics.TotalExecutions = total.HasValue ? (long)total : 0;
            metrics.SuccessfulExecutions = success.HasValue ? (long)success : 0;
            metrics.FailedExecutions = failed.HasValue ? (long)failed : 0;
            
            // Calculate average execution time
            var timeKey = $"{_metricsPrefix}execution:time:{DateTime.UtcNow:yyyy-MM-dd}";
            var times = await db.ListRangeAsync(timeKey);
            
            if (times.Length > 0)
            {
                var totalTime = times.Sum(t => double.Parse(t.ToString()));
                metrics.AverageExecutionTime = totalTime / times.Length;
            }
            
            // Get cache metrics
            var cacheMetrics = await GetAllCacheMetricsAsync();
            if (cacheMetrics.Any())
            {
                var totalHits = cacheMetrics.Sum(c => c.Hits);
                var totalMisses = cacheMetrics.Sum(c => c.Misses);
                metrics.CacheHitRate = totalHits + totalMisses > 0 ? (double)totalHits / (totalHits + totalMisses) : 0;
            }
            
            // Get queue length (from queue service)
            // Get active locks (from lock service)
            // Get system metrics (memory, CPU)
            
            return metrics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting performance metrics");
            return new PerformanceMetrics();
        }
    }

    public async System.Threading.Tasks.Task<List<ExecutionMetrics>> GetRecentExecutionsAsync(int count = 100)
    {
        try
        {
            var db = _redis.GetDatabase();
            var executions = await db.ListRangeAsync(_executionsKey, 0, count - 1);
            
            var metrics = new List<ExecutionMetrics>();
            foreach (var execution in executions)
            {
                if (execution.HasValue)
                {
                    var metric = JsonSerializer.Deserialize<ExecutionMetrics>(execution!);
                    if (metric != null)
                    {
                        metrics.Add(metric);
                    }
                }
            }
            
            return metrics.OrderByDescending(m => m.StartedAt).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent executions");
            return new List<ExecutionMetrics>();
        }
    }

    public async System.Threading.Tasks.Task<CacheMetrics> GetCacheMetricsAsync(string cacheType)
    {
        try
        {
            var db = _redis.GetDatabase();
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            
            var hitsKey = $"{_cacheMetricsKey}:{cacheType}:hits:{today}";
            var missesKey = $"{_cacheMetricsKey}:{cacheType}:misses:{today}";
            
            var hits = await db.StringGetAsync(hitsKey);
            var misses = await db.StringGetAsync(missesKey);
            
            return new CacheMetrics
            {
                CacheType = cacheType,
                Hits = hits.HasValue ? (long)hits : 0,
                Misses = misses.HasValue ? (long)misses : 0,
                Timestamp = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache metrics for {CacheType}", cacheType);
            return new CacheMetrics { CacheType = cacheType };
        }
    }

    public async System.Threading.Tasks.Task<List<CacheMetrics>> GetAllCacheMetricsAsync()
    {
        try
        {
            // For now, return empty list since pattern matching is complex
            // In a real implementation, you would store cache types in a separate key
            var metrics = new List<CacheMetrics>();
            
            // Example: Get metrics for known cache types
            var knownCacheTypes = new[] { "workflow", "execution", "user" };
            
            foreach (var cacheType in knownCacheTypes)
            {
                var metric = await GetCacheMetricsAsync(cacheType);
                if (metric.Hits > 0 || metric.Misses > 0)
                {
                    metrics.Add(metric);
                }
            }
            
            return metrics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all cache metrics");
            return new List<CacheMetrics>();
        }
    }

    public async System.Threading.Tasks.Task<double> GetAverageExecutionTimeAsync(string workflowType)
    {
        try
        {
            var db = _redis.GetDatabase();
            var timeKey = $"{_metricsPrefix}execution:time:{workflowType}:{DateTime.UtcNow:yyyy-MM-dd}";
            var times = await db.ListRangeAsync(timeKey);
            
            if (times.Length > 0)
            {
                var totalTime = times.Sum(t => double.Parse(t.ToString()));
                return totalTime / times.Length;
            }
            
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting average execution time for {WorkflowType}", workflowType);
            return 0;
        }
    }

    public async System.Threading.Tasks.Task<long> GetExecutionCountAsync(string workflowType, DateTime date)
    {
        try
        {
            var db = _redis.GetDatabase();
            var key = $"{_metricsPrefix}executions:{workflowType}:{date:yyyy-MM-dd}";
            var count = await db.StringGetAsync(key);
            
            return count.HasValue ? (long)count : 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting execution count for {WorkflowType} on {Date}", workflowType, date);
            return 0;
        }
    }

    public async System.Threading.Tasks.Task ResetMetricsAsync()
    {
        try
        {
            var db = _redis.GetDatabase();
            
            // Delete specific metric keys instead of using pattern matching
            var keysToDelete = new[]
            {
                $"{_metricsPrefix}executions:total",
                $"{_metricsPrefix}executions:success",
                $"{_metricsPrefix}executions:failed",
                $"{_metricsPrefix}execution:time:{DateTime.UtcNow:yyyy-MM-dd}",
                _executionsKey
            };
            
            foreach (var key in keysToDelete)
            {
                await db.KeyDeleteAsync(key);
            }
            
            _logger.LogInformation("Reset all performance metrics");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting metrics");
        }
    }
} 