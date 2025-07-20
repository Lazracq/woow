using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Infrastructure.Services;

public class CollaborationEvent
{
    public string EventType { get; set; } = string.Empty;
    public Guid WorkflowId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object> Data { get; set; } = new();
}

public class UserPresence
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    public string CurrentWorkflow { get; set; } = string.Empty;
    public string Status { get; set; } = "online"; // online, away, busy
}

public class WorkflowCollaborationState
{
    public Guid WorkflowId { get; set; }
    public List<UserPresence> ActiveUsers { get; set; } = new();
    public List<CollaborationEvent> RecentEvents { get; set; } = new();
    public Dictionary<string, object> SharedState { get; set; } = new();
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

public interface IRealTimeCollaborationService
{
    System.Threading.Tasks.Task JoinWorkflowAsync(Guid workflowId, UserPresence user);
    System.Threading.Tasks.Task LeaveWorkflowAsync(Guid workflowId, Guid userId);
    System.Threading.Tasks.Task PublishEventAsync(CollaborationEvent collaborationEvent);
    System.Threading.Tasks.Task SubscribeToWorkflowEventsAsync(Guid workflowId, Func<CollaborationEvent, System.Threading.Tasks.Task> handler);
    System.Threading.Tasks.Task<List<UserPresence>> GetActiveUsersAsync(Guid workflowId);
    System.Threading.Tasks.Task<WorkflowCollaborationState> GetCollaborationStateAsync(Guid workflowId);
    System.Threading.Tasks.Task UpdateUserPresenceAsync(Guid workflowId, UserPresence user);
    System.Threading.Tasks.Task UpdateSharedStateAsync(Guid workflowId, string key, object value);
    System.Threading.Tasks.Task<object?> GetSharedStateAsync(Guid workflowId, string key);
    System.Threading.Tasks.Task<List<CollaborationEvent>> GetRecentEventsAsync(Guid workflowId, int count = 50);
    System.Threading.Tasks.Task<bool> IsUserOnlineAsync(Guid userId);
    System.Threading.Tasks.Task<List<Guid>> GetUserWorkflowsAsync(Guid userId);
}

public class RealTimeCollaborationService : IRealTimeCollaborationService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<RealTimeCollaborationService> _logger;
    private readonly string _presencePrefix = "collaboration:presence:";
    private readonly string _eventsPrefix = "collaboration:events:";
    private readonly string _statePrefix = "collaboration:state:";
    private readonly string _workflowUsersPrefix = "collaboration:workflow:users:";
    private readonly string _userWorkflowsPrefix = "collaboration:user:workflows:";

    public RealTimeCollaborationService(
        IConnectionMultiplexer redis,
        ILogger<RealTimeCollaborationService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task JoinWorkflowAsync(Guid workflowId, UserPresence user)
    {
        try
        {
            var db = _redis.GetDatabase();
            
            // Add user to workflow
            var workflowUsersKey = $"{_workflowUsersPrefix}{workflowId}";
            await db.HashSetAsync(workflowUsersKey, user.UserId.ToString(), JsonSerializer.Serialize(user));
            
            // Add workflow to user's list
            var userWorkflowsKey = $"{_userWorkflowsPrefix}{user.UserId}";
            await db.SetAddAsync(userWorkflowsKey, workflowId.ToString());
            
            // Publish join event
            var joinEvent = new CollaborationEvent
            {
                EventType = "user_joined",
                WorkflowId = workflowId,
                UserId = user.UserId,
                UserName = user.UserName,
                UserEmail = user.UserEmail,
                Data = new Dictionary<string, object>
                {
                    ["workflowId"] = workflowId.ToString(),
                    ["timestamp"] = DateTime.UtcNow
                }
            };
            
            await PublishEventAsync(joinEvent);
            
            _logger.LogInformation("User {UserId} joined workflow {WorkflowId}", user.UserId, workflowId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining workflow {WorkflowId} for user {UserId}", workflowId, user.UserId);
        }
    }

    public async System.Threading.Tasks.Task LeaveWorkflowAsync(Guid workflowId, Guid userId)
    {
        try
        {
            var db = _redis.GetDatabase();
            
            // Remove user from workflow
            var workflowUsersKey = $"{_workflowUsersPrefix}{workflowId}";
            await db.HashDeleteAsync(workflowUsersKey, userId.ToString());
            
            // Remove workflow from user's list
            var userWorkflowsKey = $"{_userWorkflowsPrefix}{userId}";
            await db.SetRemoveAsync(userWorkflowsKey, workflowId.ToString());
            
            // Publish leave event
            var leaveEvent = new CollaborationEvent
            {
                EventType = "user_left",
                WorkflowId = workflowId,
                UserId = userId,
                Data = new Dictionary<string, object>
                {
                    ["workflowId"] = workflowId.ToString(),
                    ["timestamp"] = DateTime.UtcNow
                }
            };
            
            await PublishEventAsync(leaveEvent);
            
            _logger.LogInformation("User {UserId} left workflow {WorkflowId}", userId, workflowId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving workflow {WorkflowId} for user {UserId}", workflowId, userId);
        }
    }

    public async System.Threading.Tasks.Task PublishEventAsync(CollaborationEvent collaborationEvent)
    {
        try
        {
            var pubsub = _redis.GetSubscriber();
            var channel = $"{_eventsPrefix}{collaborationEvent.WorkflowId}";
            var serialized = JsonSerializer.Serialize(collaborationEvent);
            
            await pubsub.PublishAsync(RedisChannel.Literal(channel), serialized);
            
            // Store recent events
            var db = _redis.GetDatabase();
            var eventsKey = $"{_eventsPrefix}{collaborationEvent.WorkflowId}:recent";
            await db.ListLeftPushAsync(eventsKey, serialized);
            await db.ListTrimAsync(eventsKey, 0, 99); // Keep last 100 events
            
            _logger.LogDebug("Published {EventType} event for workflow {WorkflowId}", 
                collaborationEvent.EventType, collaborationEvent.WorkflowId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing collaboration event");
        }
    }

    public async System.Threading.Tasks.Task SubscribeToWorkflowEventsAsync(Guid workflowId, Func<CollaborationEvent, System.Threading.Tasks.Task> handler)
    {
        try
        {
            var pubsub = _redis.GetSubscriber();
            var channel = $"{_eventsPrefix}{workflowId}";
            
            await pubsub.SubscribeAsync(RedisChannel.Literal(channel), async (channel, message) =>
            {
                try
                {
                    var collaborationEvent = JsonSerializer.Deserialize<CollaborationEvent>(message!);
                    if (collaborationEvent != null)
                    {
                        await handler(collaborationEvent);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error handling collaboration event");
                }
            });
            
            _logger.LogInformation("Subscribed to collaboration events for workflow {WorkflowId}", workflowId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error subscribing to workflow events for {WorkflowId}", workflowId);
        }
    }

    public async System.Threading.Tasks.Task<List<UserPresence>> GetActiveUsersAsync(Guid workflowId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var workflowUsersKey = $"{_workflowUsersPrefix}{workflowId}";
            var users = await db.HashGetAllAsync(workflowUsersKey);
            
            var activeUsers = new List<UserPresence>();
            foreach (var user in users)
            {
                if (user.Value.HasValue)
                {
                    var presence = JsonSerializer.Deserialize<UserPresence>(user.Value!);
                    if (presence != null && DateTime.UtcNow.Subtract(presence.LastSeen).TotalMinutes < 5)
                    {
                        activeUsers.Add(presence);
                    }
                }
            }
            
            return activeUsers.OrderBy(u => u.UserName).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active users for workflow {WorkflowId}", workflowId);
            return new List<UserPresence>();
        }
    }

    public async System.Threading.Tasks.Task<WorkflowCollaborationState> GetCollaborationStateAsync(Guid workflowId)
    {
        try
        {
            var state = new WorkflowCollaborationState
            {
                WorkflowId = workflowId,
                ActiveUsers = await GetActiveUsersAsync(workflowId),
                RecentEvents = await GetRecentEventsAsync(workflowId, 20)
            };
            
            // Get shared state
            var db = _redis.GetDatabase();
            var stateKey = $"{_statePrefix}{workflowId}";
            var sharedState = await db.HashGetAllAsync(stateKey);
            
            foreach (var entry in sharedState)
            {
                if (entry.Value.HasValue)
                {
                    try
                    {
                        var value = JsonSerializer.Deserialize<object>(entry.Value!);
                        state.SharedState[entry.Name.ToString()] = value!;
                    }
                    catch
                    {
                        state.SharedState[entry.Name.ToString()] = entry.Value.ToString();
                    }
                }
            }
            
            return state;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting collaboration state for workflow {WorkflowId}", workflowId);
            return new WorkflowCollaborationState { WorkflowId = workflowId };
        }
    }

    public async System.Threading.Tasks.Task UpdateUserPresenceAsync(Guid workflowId, UserPresence user)
    {
        try
        {
            user.LastSeen = DateTime.UtcNow;
            
            var db = _redis.GetDatabase();
            var workflowUsersKey = $"{_workflowUsersPrefix}{workflowId}";
            await db.HashSetAsync(workflowUsersKey, user.UserId.ToString(), JsonSerializer.Serialize(user));
            
            _logger.LogDebug("Updated presence for user {UserId} in workflow {WorkflowId}", user.UserId, workflowId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user presence for workflow {WorkflowId}", workflowId);
        }
    }

    public async System.Threading.Tasks.Task UpdateSharedStateAsync(Guid workflowId, string key, object value)
    {
        try
        {
            var db = _redis.GetDatabase();
            var stateKey = $"{_statePrefix}{workflowId}";
            var serialized = JsonSerializer.Serialize(value);
            
            await db.HashSetAsync(stateKey, key, serialized);
            
            // Publish state change event
            var stateEvent = new CollaborationEvent
            {
                EventType = "state_changed",
                WorkflowId = workflowId,
                Data = new Dictionary<string, object>
                {
                    ["key"] = key,
                    ["value"] = value,
                    ["timestamp"] = DateTime.UtcNow
                }
            };
            
            await PublishEventAsync(stateEvent);
            
            _logger.LogDebug("Updated shared state {Key} for workflow {WorkflowId}", key, workflowId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating shared state for workflow {WorkflowId}", workflowId);
        }
    }

    public async System.Threading.Tasks.Task<object?> GetSharedStateAsync(Guid workflowId, string key)
    {
        try
        {
            var db = _redis.GetDatabase();
            var stateKey = $"{_statePrefix}{workflowId}";
            var value = await db.HashGetAsync(stateKey, key);
            
            if (value.HasValue)
            {
                return JsonSerializer.Deserialize<object>(value!);
            }
            
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting shared state for workflow {WorkflowId}", workflowId);
            return null;
        }
    }

    public async System.Threading.Tasks.Task<List<CollaborationEvent>> GetRecentEventsAsync(Guid workflowId, int count = 50)
    {
        try
        {
            var db = _redis.GetDatabase();
            var eventsKey = $"{_eventsPrefix}{workflowId}:recent";
            var events = await db.ListRangeAsync(eventsKey, 0, count - 1);
            
            var collaborationEvents = new List<CollaborationEvent>();
            foreach (var eventData in events)
            {
                if (eventData.HasValue)
                {
                    var collaborationEvent = JsonSerializer.Deserialize<CollaborationEvent>(eventData!);
                    if (collaborationEvent != null)
                    {
                        collaborationEvents.Add(collaborationEvent);
                    }
                }
            }
            
            return collaborationEvents.OrderByDescending(e => e.Timestamp).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent events for workflow {WorkflowId}", workflowId);
            return new List<CollaborationEvent>();
        }
    }

    public async System.Threading.Tasks.Task<bool> IsUserOnlineAsync(Guid userId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var userWorkflowsKey = $"{_userWorkflowsPrefix}{userId}";
            var workflows = await db.SetMembersAsync(userWorkflowsKey);
            
            foreach (var workflowId in workflows)
            {
                var workflowUsersKey = $"{_workflowUsersPrefix}{workflowId}";
                var userData = await db.HashGetAsync(workflowUsersKey, userId.ToString());
                
                if (userData.HasValue)
                {
                    var presence = JsonSerializer.Deserialize<UserPresence>(userData!);
                    if (presence != null && DateTime.UtcNow.Subtract(presence.LastSeen).TotalMinutes < 5)
                    {
                        return true;
                    }
                }
            }
            
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} is online", userId);
            return false;
        }
    }

    public async System.Threading.Tasks.Task<List<Guid>> GetUserWorkflowsAsync(Guid userId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var userWorkflowsKey = $"{_userWorkflowsPrefix}{userId}";
            var workflows = await db.SetMembersAsync(userWorkflowsKey);
            
            return workflows.Select(w => Guid.Parse(w.ToString())).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting workflows for user {UserId}", userId);
            return new List<Guid>();
        }
    }
} 