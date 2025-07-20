using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace WorkflowSystem.API.Controllers
{
    [ApiController]
    [Route("api/workflows/{workflowId}/nodes")]
    public class WorkflowNodesController : ControllerBase
    {
        private readonly ILogger<WorkflowNodesController> _logger;

        public WorkflowNodesController(ILogger<WorkflowNodesController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetWorkflowNodes(string workflowId)
        {
            try
            {
                // For now, return sample data since we don't have the database schema for nodes
                var sampleNodes = new[]
                {
                    new
                    {
                        Id = "start-node",
                        TaskId = "start",
                        Position = new { X = 100, Y = 100 },
                        Connections = new string[0],
                        IsStartingNode = true
                    },
                    new
                    {
                        Id = "data-processing-1",
                        TaskId = "data-processing",
                        Position = new { X = 300, Y = 100 },
                        Connections = new[] { "start-node" },
                        IsStartingNode = false
                    },
                    new
                    {
                        Id = "email-notification-1",
                        TaskId = "email-notification",
                        Position = new { X = 500, Y = 100 },
                        Connections = new[] { "data-processing-1" },
                        IsStartingNode = false
                    }
                };

                return Ok(sampleNodes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workflow nodes for workflow {WorkflowId}", workflowId);
                return StatusCode(500, new { error = "Failed to retrieve workflow nodes", message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateWorkflowNode(string workflowId, [FromBody] CreateWorkflowNodeRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrEmpty(request.TaskId))
                {
                    return BadRequest(new { error = "TaskId is required" });
                }

                var newNode = new
                {
                    Id = $"node-{Guid.NewGuid()}",
                    TaskId = request.TaskId,
                    Position = request.Position,
                    Connections = request.Connections ?? new string[0],
                    IsStartingNode = request.IsStartingNode ?? false
                };

                _logger.LogInformation("Created workflow node {NodeId} for workflow {WorkflowId}", newNode.Id, workflowId);

                return CreatedAtAction(nameof(GetWorkflowNodes), new { workflowId }, newNode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating workflow node for workflow {WorkflowId}", workflowId);
                return StatusCode(500, new { error = "Failed to create workflow node", message = ex.Message });
            }
        }

        [HttpPut("{nodeId}")]
        public async Task<IActionResult> UpdateWorkflowNode(string workflowId, string nodeId, [FromBody] UpdateWorkflowNodeRequest request)
        {
            try
            {
                // Validate request
                if (request.Position == null)
                {
                    return BadRequest(new { error = "Position is required" });
                }

                var updatedNode = new
                {
                    Id = nodeId,
                    TaskId = request.TaskId,
                    Position = request.Position,
                    Connections = request.Connections ?? new string[0],
                    IsStartingNode = request.IsStartingNode ?? false
                };

                _logger.LogInformation("Updated workflow node {NodeId} for workflow {WorkflowId}", nodeId, workflowId);

                return Ok(updatedNode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating workflow node {NodeId} for workflow {WorkflowId}", nodeId, workflowId);
                return StatusCode(500, new { error = "Failed to update workflow node", message = ex.Message });
            }
        }

        [HttpDelete("{nodeId}")]
        public async Task<IActionResult> DeleteWorkflowNode(string workflowId, string nodeId)
        {
            try
            {
                _logger.LogInformation("Deleted workflow node {NodeId} for workflow {WorkflowId}", nodeId, workflowId);

                return Ok(new { message = "Workflow node deleted successfully", nodeId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting workflow node {NodeId} for workflow {WorkflowId}", nodeId, workflowId);
                return StatusCode(500, new { error = "Failed to delete workflow node", message = ex.Message });
            }
        }

        [HttpPost("{nodeId}/connections")]
        public async Task<IActionResult> AddConnection(string workflowId, string nodeId, [FromBody] AddConnectionRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.TargetNodeId))
                {
                    return BadRequest(new { error = "TargetNodeId is required" });
                }

                _logger.LogInformation("Added connection from node {NodeId} to {TargetNodeId} for workflow {WorkflowId}", 
                    nodeId, request.TargetNodeId, workflowId);

                return Ok(new { message = "Connection added successfully", sourceNodeId = nodeId, targetNodeId = request.TargetNodeId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding connection for node {NodeId} in workflow {WorkflowId}", nodeId, workflowId);
                return StatusCode(500, new { error = "Failed to add connection", message = ex.Message });
            }
        }

        [HttpDelete("{nodeId}/connections/{targetNodeId}")]
        public async Task<IActionResult> RemoveConnection(string workflowId, string nodeId, string targetNodeId)
        {
            try
            {
                _logger.LogInformation("Removed connection from node {NodeId} to {TargetNodeId} for workflow {WorkflowId}", 
                    nodeId, targetNodeId, workflowId);

                return Ok(new { message = "Connection removed successfully", sourceNodeId = nodeId, targetNodeId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing connection for node {NodeId} in workflow {WorkflowId}", nodeId, workflowId);
                return StatusCode(500, new { error = "Failed to remove connection", message = ex.Message });
            }
        }

        [HttpPut("{nodeId}/starting")]
        public async Task<IActionResult> SetStartingNode(string workflowId, string nodeId)
        {
            try
            {
                _logger.LogInformation("Set node {NodeId} as starting node for workflow {WorkflowId}", nodeId, workflowId);

                return Ok(new { message = "Starting node updated successfully", startingNodeId = nodeId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting starting node {NodeId} for workflow {WorkflowId}", nodeId, workflowId);
                return StatusCode(500, new { error = "Failed to set starting node", message = ex.Message });
            }
        }
    }

    public class CreateWorkflowNodeRequest
    {
        public string TaskId { get; set; } = string.Empty;
        public Position Position { get; set; } = new();
        public string[]? Connections { get; set; }
        public bool? IsStartingNode { get; set; }
    }

    public class UpdateWorkflowNodeRequest
    {
        public string? TaskId { get; set; }
        public Position? Position { get; set; }
        public string[]? Connections { get; set; }
        public bool? IsStartingNode { get; set; }
    }

    public class AddConnectionRequest
    {
        public string TargetNodeId { get; set; } = string.Empty;
    }

    public class Position
    {
        public double X { get; set; }
        public double Y { get; set; }
    }
} 