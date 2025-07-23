using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Infrastructure.Services;

public class WorkflowExecutionCache : IWorkflowExecutionCache
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<WorkflowExecutionCache> _logger;
    private readonly TimeSpan _defaultExpiration = TimeSpan.FromMinutes(30);

    public WorkflowExecutionCache(
        IDistributedCache cache,
        ILogger<WorkflowExecutionCache> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<Execution?> GetExecutionAsync(Guid executionId)
    {
        try
        {
            var key = $"execution:{executionId}";
            var cached = await _cache.GetStringAsync(key);
            
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for execution {ExecutionId}", executionId);
                return JsonSerializer.Deserialize<Execution>(cached);
            }
            
            _logger.LogDebug("Cache miss for execution {ExecutionId}", executionId);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving execution {ExecutionId} from cache", executionId);
            return null;
        }
    }

    public async System.Threading.Tasks.Task SetExecutionAsync(Guid executionId, Execution execution, TimeSpan? expiration = null)
    {
        try
        {
            var key = $"execution:{executionId}";
            var serialized = JsonSerializer.Serialize(execution);
            
            var options = new DistributedCacheEntryOptions
            {
                SlidingExpiration = expiration ?? _defaultExpiration
            };
            
            await _cache.SetStringAsync(key, serialized, options);
            _logger.LogDebug("Cached execution {ExecutionId} with expiration {Expiration}", 
                executionId, expiration ?? _defaultExpiration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error caching execution {ExecutionId}", executionId);
        }
    }

    public async System.Threading.Tasks.Task RemoveExecutionAsync(Guid executionId)
    {
        try
        {
            var key = $"execution:{executionId}";
            await _cache.RemoveAsync(key);
            _logger.LogDebug("Removed execution {ExecutionId} from cache", executionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing execution {ExecutionId} from cache", executionId);
        }
    }

    public async Task<Workflow?> GetWorkflowAsync(Guid workflowId)
    {
        try
        {
            var key = $"workflow:{workflowId}";
            var cached = await _cache.GetStringAsync(key);
            
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for workflow {WorkflowId}", workflowId);
                return JsonSerializer.Deserialize<Workflow>(cached);
            }
            
            _logger.LogDebug("Cache miss for workflow {WorkflowId}", workflowId);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow {WorkflowId} from cache", workflowId);
            return null;
        }
    }

    public async System.Threading.Tasks.Task SetWorkflowAsync(Guid workflowId, Workflow workflow, TimeSpan? expiration = null)
    {
        try
        {
            var key = $"workflow:{workflowId}";
            var serialized = JsonSerializer.Serialize(workflow);
            
            var options = new DistributedCacheEntryOptions
            {
                SlidingExpiration = expiration ?? _defaultExpiration
            };
            
            await _cache.SetStringAsync(key, serialized, options);
            _logger.LogDebug("Cached workflow {WorkflowId} with expiration {Expiration}", 
                workflowId, expiration ?? _defaultExpiration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error caching workflow {WorkflowId}", workflowId);
        }
    }

    public async System.Threading.Tasks.Task RemoveWorkflowAsync(Guid workflowId)
    {
        try
        {
            var key = $"workflow:{workflowId}";
            await _cache.RemoveAsync(key);
            _logger.LogDebug("Removed workflow {WorkflowId} from cache", workflowId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing workflow {WorkflowId} from cache", workflowId);
        }
    }
} 