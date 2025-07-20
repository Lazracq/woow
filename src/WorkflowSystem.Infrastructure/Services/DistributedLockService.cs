using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Infrastructure.Services;

public interface IDistributedLock
{
    System.Threading.Tasks.Task<bool> AcquireAsync();
    System.Threading.Tasks.Task ReleaseAsync();
    bool IsAcquired { get; }
    string LockKey { get; }
    TimeSpan Timeout { get; }
}

public interface IDistributedLockService
{
    System.Threading.Tasks.Task<IDistributedLock> AcquireLockAsync(string resourceId, TimeSpan timeout);
    System.Threading.Tasks.Task<bool> IsLockedAsync(string resourceId);
    System.Threading.Tasks.Task ReleaseLockAsync(string resourceId);
    System.Threading.Tasks.Task<TimeSpan> GetLockRemainingTimeAsync(string resourceId);
    System.Threading.Tasks.Task<List<string>> GetActiveLocksAsync();
}

public class RedisDistributedLock : IDistributedLock
{
    private readonly IDatabase _database;
    private readonly string _lockKey;
    private readonly string _lockValue;
    private readonly TimeSpan _timeout;
    private readonly ILogger<RedisDistributedLock> _logger;
    private bool _isAcquired;

    public RedisDistributedLock(
        IDatabase database,
        string lockKey,
        TimeSpan timeout,
        ILogger<RedisDistributedLock> logger)
    {
        _database = database;
        _lockKey = lockKey;
        _timeout = timeout;
        _logger = logger;
        _lockValue = Guid.NewGuid().ToString();
    }

    public bool IsAcquired => _isAcquired;
    public string LockKey => _lockKey;
    public TimeSpan Timeout => _timeout;

    public async System.Threading.Tasks.Task<bool> AcquireAsync()
    {
        try
        {
            var acquired = await _database.StringSetAsync(_lockKey, _lockValue, _timeout, When.NotExists);
            _isAcquired = acquired;
            
            if (acquired)
            {
                _logger.LogDebug("Acquired lock {LockKey} with timeout {Timeout}", _lockKey, _timeout);
            }
            else
            {
                _logger.LogDebug("Failed to acquire lock {LockKey}", _lockKey);
            }
            
            return acquired;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error acquiring lock {LockKey}", _lockKey);
            return false;
        }
    }

    public async System.Threading.Tasks.Task ReleaseAsync()
    {
        try
        {
            if (_isAcquired)
            {
                // Use Lua script to ensure we only release our own lock
                var script = @"
                    if redis.call('get', KEYS[1]) == ARGV[1] then
                        return redis.call('del', KEYS[1])
                    else
                        return 0
                    end";
                
                var result = await _database.ScriptEvaluateAsync(script, new RedisKey[] { _lockKey }, new RedisValue[] { _lockValue });
                _isAcquired = false;
                
                _logger.LogDebug("Released lock {LockKey}", _lockKey);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing lock {LockKey}", _lockKey);
        }
    }
}

public class DistributedLockService : IDistributedLockService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<DistributedLockService> _logger;
    private readonly string _lockPrefix = "lock:";
    private readonly string _activeLocksKey = "locks:active";

    public DistributedLockService(
        IConnectionMultiplexer redis,
        ILogger<DistributedLockService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<IDistributedLock> AcquireLockAsync(string resourceId, TimeSpan timeout)
    {
        var lockKey = $"{_lockPrefix}{resourceId}";
        var db = _redis.GetDatabase();
        
        var distributedLock = new RedisDistributedLock(db, lockKey, timeout, _logger as ILogger<RedisDistributedLock>);
        var acquired = await distributedLock.AcquireAsync();
        
        if (acquired)
        {
            // Track active lock
            await db.HashSetAsync(_activeLocksKey, resourceId, JsonSerializer.Serialize(new
            {
                AcquiredAt = DateTime.UtcNow,
                Timeout = timeout,
                ExpiresAt = DateTime.UtcNow.Add(timeout)
            }));
        }
        
        return distributedLock;
    }

    public async System.Threading.Tasks.Task<bool> IsLockedAsync(string resourceId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var lockKey = $"{_lockPrefix}{resourceId}";
            var exists = await db.KeyExistsAsync(lockKey);
            
            return exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking lock status for resource {ResourceId}", resourceId);
            return false;
        }
    }

    public async System.Threading.Tasks.Task ReleaseLockAsync(string resourceId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var lockKey = $"{_lockPrefix}{resourceId}";
            await db.KeyDeleteAsync(lockKey);
            
            // Remove from active locks
            await db.HashDeleteAsync(_activeLocksKey, resourceId);
            
            _logger.LogDebug("Released lock for resource {ResourceId}", resourceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing lock for resource {ResourceId}", resourceId);
        }
    }

    public async System.Threading.Tasks.Task<TimeSpan> GetLockRemainingTimeAsync(string resourceId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var lockKey = $"{_lockPrefix}{resourceId}";
            var ttl = await db.KeyTimeToLiveAsync(lockKey);
            
            return ttl ?? TimeSpan.Zero;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting lock remaining time for resource {ResourceId}", resourceId);
            return TimeSpan.Zero;
        }
    }

    public async System.Threading.Tasks.Task<List<string>> GetActiveLocksAsync()
    {
        try
        {
            var db = _redis.GetDatabase();
            var activeLocks = await db.HashGetAllAsync(_activeLocksKey);
            
            return activeLocks.Select(entry => entry.Name.ToString()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active locks");
            return new List<string>();
        }
    }
} 