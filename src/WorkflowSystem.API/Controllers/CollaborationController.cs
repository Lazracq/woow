using Microsoft.AspNetCore.Mvc;
using WorkflowSystem.Infrastructure.Services;

namespace WorkflowSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CollaborationController : ControllerBase
{
    private readonly IRealTimeCollaborationService _collaborationService;
    private readonly ILogger<CollaborationController> _logger;

    public CollaborationController(
        IRealTimeCollaborationService collaborationService,
        ILogger<CollaborationController> logger)
    {
        _collaborationService = collaborationService;
        _logger = logger;
    }

    [HttpPost("workflows/{workflowId}/join")]
    public async Task<ActionResult> JoinWorkflow(Guid workflowId, [FromBody] UserPresence user)
    {
        try
        {
            await _collaborationService.JoinWorkflowAsync(workflowId, user);
            return Ok("Successfully joined workflow");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining workflow {WorkflowId}", workflowId);
            return StatusCode(500, "Error joining workflow");
        }
    }

    [HttpPost("workflows/{workflowId}/leave")]
    public async Task<ActionResult> LeaveWorkflow(Guid workflowId, [FromBody] Guid userId)
    {
        try
        {
            await _collaborationService.LeaveWorkflowAsync(workflowId, userId);
            return Ok("Successfully left workflow");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving workflow {WorkflowId}", workflowId);
            return StatusCode(500, "Error leaving workflow");
        }
    }

    [HttpGet("workflows/{workflowId}/users")]
    public async Task<ActionResult<List<UserPresence>>> GetActiveUsers(Guid workflowId)
    {
        try
        {
            var users = await _collaborationService.GetActiveUsersAsync(workflowId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active users for workflow {WorkflowId}", workflowId);
            return StatusCode(500, "Error retrieving active users");
        }
    }

    [HttpGet("workflows/{workflowId}/state")]
    public async Task<ActionResult<WorkflowCollaborationState>> GetCollaborationState(Guid workflowId)
    {
        try
        {
            var state = await _collaborationService.GetCollaborationStateAsync(workflowId);
            return Ok(state);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting collaboration state for workflow {WorkflowId}", workflowId);
            return StatusCode(500, "Error retrieving collaboration state");
        }
    }

    [HttpPut("workflows/{workflowId}/users/{userId}/presence")]
    public async Task<ActionResult> UpdateUserPresence(Guid workflowId, Guid userId, [FromBody] UserPresence user)
    {
        try
        {
            user.UserId = userId; // Ensure the user ID matches
            await _collaborationService.UpdateUserPresenceAsync(workflowId, user);
            return Ok("User presence updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user presence for workflow {WorkflowId}", workflowId);
            return StatusCode(500, "Error updating user presence");
        }
    }

    [HttpPut("workflows/{workflowId}/state/{key}")]
    public async Task<ActionResult> UpdateSharedState(Guid workflowId, string key, [FromBody] object value)
    {
        try
        {
            await _collaborationService.UpdateSharedStateAsync(workflowId, key, value);
            return Ok("Shared state updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating shared state for workflow {WorkflowId}", workflowId);
            return StatusCode(500, "Error updating shared state");
        }
    }

    [HttpGet("workflows/{workflowId}/state/{key}")]
    public async Task<ActionResult<object>> GetSharedState(Guid workflowId, string key)
    {
        try
        {
            var value = await _collaborationService.GetSharedStateAsync(workflowId, key);
            return Ok(value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting shared state for workflow {WorkflowId}", workflowId);
            return StatusCode(500, "Error retrieving shared state");
        }
    }

    [HttpGet("workflows/{workflowId}/events")]
    public async Task<ActionResult<List<CollaborationEvent>>> GetRecentEvents(Guid workflowId, [FromQuery] int count = 50)
    {
        try
        {
            var events = await _collaborationService.GetRecentEventsAsync(workflowId, count);
            return Ok(events);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent events for workflow {WorkflowId}", workflowId);
            return StatusCode(500, "Error retrieving recent events");
        }
    }

    [HttpGet("users/{userId}/online")]
    public async Task<ActionResult<bool>> IsUserOnline(Guid userId)
    {
        try
        {
            var isOnline = await _collaborationService.IsUserOnlineAsync(userId);
            return Ok(isOnline);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} is online", userId);
            return StatusCode(500, "Error checking user online status");
        }
    }

    [HttpGet("users/{userId}/workflows")]
    public async Task<ActionResult<List<Guid>>> GetUserWorkflows(Guid userId)
    {
        try
        {
            var workflows = await _collaborationService.GetUserWorkflowsAsync(userId);
            return Ok(workflows);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting workflows for user {UserId}", userId);
            return StatusCode(500, "Error retrieving user workflows");
        }
    }

    [HttpPost("workflows/{workflowId}/events")]
    public async Task<ActionResult> PublishEvent(Guid workflowId, [FromBody] CollaborationEvent collaborationEvent)
    {
        try
        {
            collaborationEvent.WorkflowId = workflowId; // Ensure the workflow ID matches
            await _collaborationService.PublishEventAsync(collaborationEvent);
            return Ok("Event published successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing event for workflow {WorkflowId}", workflowId);
            return StatusCode(500, "Error publishing event");
        }
    }
} 