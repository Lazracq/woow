using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using WorkflowSystem.Domain.Enums;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Infrastructure.Services;

public class WorkflowExecutionRequest
{
    public Guid WorkflowId { get; set; }
    public Guid UserId { get; set; }
    public Dictionary<string, object> InputData { get; set; } = new();
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public int Priority { get; set; } = 0; // Higher number = higher priority
    public int RetryCount { get; set; } = 0;
    public int MaxRetries { get; set; } = 3;
}

public class WorkflowExecutionResult
{
    public Guid ExecutionId { get; set; }
    public Guid WorkflowId { get; set; }
    public ExecutionStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object> OutputData { get; set; } = new();
    public DateTime CompletedAt { get; set; }
    public TimeSpan Duration { get; set; }
}

public interface IWorkflowExecutionQueue
{
    System.Threading.Tasks.Task EnqueueExecutionAsync(WorkflowExecutionRequest request);
    System.Threading.Tasks.Task<WorkflowExecutionRequest?> DequeueExecutionAsync();
    System.Threading.Tasks.Task<WorkflowExecutionRequest?> DequeueExecutionWithPriorityAsync();
    System.Threading.Tasks.Task PublishResultAsync(WorkflowExecutionResult result);
    System.Threading.Tasks.Task SubscribeToResultsAsync(Func<WorkflowExecutionResult, System.Threading.Tasks.Task> handler);
    System.Threading.Tasks.Task<long> GetQueueLengthAsync();
    System.Threading.Tasks.Task<List<WorkflowExecutionRequest>> GetPendingExecutionsAsync();
    System.Threading.Tasks.Task RetryExecutionAsync(WorkflowExecutionRequest request);
    System.Threading.Tasks.Task CancelExecutionAsync(Guid workflowId);
}

public class WorkflowExecutionQueue : IWorkflowExecutionQueue
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<WorkflowExecutionQueue> _logger;
    private readonly string _executionQueueKey = "workflow:execution:queue";
    private readonly string _priorityQueueKey = "workflow:execution:priority:queue";
    private readonly string _resultsChannel = "workflow:execution:results";
    private readonly string _pendingExecutionsKey = "workflow:execution:pending";

    public WorkflowExecutionQueue(
        IConnectionMultiplexer redis,
        ILogger<WorkflowExecutionQueue> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task EnqueueExecutionAsync(WorkflowExecutionRequest request)
    {
        try
        {
            var db = _redis.GetDatabase();
            var serialized = JsonSerializer.Serialize(request);
            
            if (request.Priority > 0)
            {
                // Add to priority queue (sorted set)
                await db.SortedSetAddAsync(_priorityQueueKey, serialized, request.Priority);
                _logger.LogInformation("Enqueued priority execution for workflow {WorkflowId} with priority {Priority}", 
                    request.WorkflowId, request.Priority);
            }
            else
            {
                // Add to regular queue
                await db.ListLeftPushAsync(_executionQueueKey, serialized);
                _logger.LogInformation("Enqueued execution for workflow {WorkflowId}", request.WorkflowId);
            }

            // Track pending execution
            await db.HashSetAsync(_pendingExecutionsKey, request.WorkflowId.ToString(), serialized);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enqueueing execution for workflow {WorkflowId}", request.WorkflowId);
            throw;
        }
    }

    public async System.Threading.Tasks.Task<WorkflowExecutionRequest?> DequeueExecutionAsync()
    {
        try
        {
            var db = _redis.GetDatabase();
            var item = await db.ListRightPopAsync(_executionQueueKey);
            
            if (item.HasValue)
            {
                var request = JsonSerializer.Deserialize<WorkflowExecutionRequest>(item!);
                _logger.LogDebug("Dequeued execution for workflow {WorkflowId}", request?.WorkflowId);
                return request;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error dequeuing execution");
            return null;
        }
    }

    public async System.Threading.Tasks.Task<WorkflowExecutionRequest?> DequeueExecutionWithPriorityAsync()
    {
        try
        {
            var db = _redis.GetDatabase();
            
            // First try priority queue
            var priorityItems = await db.SortedSetRangeByRankAsync(_priorityQueueKey, 0, 0, Order.Descending);
            if (priorityItems.Length > 0)
            {
                var item = priorityItems[0];
                await db.SortedSetRemoveAsync(_priorityQueueKey, item);
                
                var request = JsonSerializer.Deserialize<WorkflowExecutionRequest>(item!);
                _logger.LogDebug("Dequeued priority execution for workflow {WorkflowId}", request?.WorkflowId);
                return request;
            }
            
            // Fallback to regular queue
            return await DequeueExecutionAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error dequeuing priority execution");
            return null;
        }
    }

    public async System.Threading.Tasks.Task PublishResultAsync(WorkflowExecutionResult result)
    {
        try
        {
            var pubsub = _redis.GetSubscriber();
            var serialized = JsonSerializer.Serialize(result);
            await pubsub.PublishAsync(RedisChannel.Literal(_resultsChannel), serialized);
            
            // Remove from pending executions
            var db = _redis.GetDatabase();
            await db.HashDeleteAsync(_pendingExecutionsKey, result.WorkflowId.ToString());
            
            _logger.LogInformation("Published result for execution {ExecutionId} with status {Status}", 
                result.ExecutionId, result.Status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing result for execution {ExecutionId}", result.ExecutionId);
        }
    }

    public async System.Threading.Tasks.Task SubscribeToResultsAsync(Func<WorkflowExecutionResult, System.Threading.Tasks.Task> handler)
    {
        try
        {
            var pubsub = _redis.GetSubscriber();
            await pubsub.SubscribeAsync(RedisChannel.Literal(_resultsChannel), async (channel, message) =>
            {
                try
                {
                    var result = JsonSerializer.Deserialize<WorkflowExecutionResult>(message!);
                    await handler(result!);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error handling execution result");
                }
            });
            
            _logger.LogInformation("Subscribed to execution results channel");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error subscribing to execution results");
        }
    }

    public async System.Threading.Tasks.Task<long> GetQueueLengthAsync()
    {
        try
        {
            var db = _redis.GetDatabase();
            var regularQueueLength = await db.ListLengthAsync(_executionQueueKey);
            var priorityQueueLength = await db.SortedSetLengthAsync(_priorityQueueKey);
            
            return regularQueueLength + priorityQueueLength;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting queue length");
            return 0;
        }
    }

    public async System.Threading.Tasks.Task<List<WorkflowExecutionRequest>> GetPendingExecutionsAsync()
    {
        try
        {
            var db = _redis.GetDatabase();
            var pending = await db.HashGetAllAsync(_pendingExecutionsKey);
            
            var requests = new List<WorkflowExecutionRequest>();
            foreach (var entry in pending)
            {
                if (entry.Value.HasValue)
                {
                    var request = JsonSerializer.Deserialize<WorkflowExecutionRequest>(entry.Value!);
                    if (request != null)
                    {
                        requests.Add(request);
                    }
                }
            }
            
            return requests;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending executions");
            return new List<WorkflowExecutionRequest>();
        }
    }

    public async System.Threading.Tasks.Task RetryExecutionAsync(WorkflowExecutionRequest request)
    {
        try
        {
            request.RetryCount++;
            request.RequestedAt = DateTime.UtcNow;
            
            if (request.RetryCount <= request.MaxRetries)
            {
                await EnqueueExecutionAsync(request);
                _logger.LogInformation("Retried execution for workflow {WorkflowId} (attempt {RetryCount}/{MaxRetries})", 
                    request.WorkflowId, request.RetryCount, request.MaxRetries);
            }
            else
            {
                _logger.LogWarning("Max retries exceeded for workflow {WorkflowId}", request.WorkflowId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying execution for workflow {WorkflowId}", request.WorkflowId);
        }
    }

    public async System.Threading.Tasks.Task CancelExecutionAsync(Guid workflowId)
    {
        try
        {
            var db = _redis.GetDatabase();
            await db.HashDeleteAsync(_pendingExecutionsKey, workflowId.ToString());
            _logger.LogInformation("Cancelled execution for workflow {WorkflowId}", workflowId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling execution for workflow {WorkflowId}", workflowId);
        }
    }
} 