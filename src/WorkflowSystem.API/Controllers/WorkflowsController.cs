using Microsoft.AspNetCore.Mvc;
using MediatR;
using WorkflowSystem.Application.Workflows.Queries.GetWorkflows;
using WorkflowSystem.Application.Workflows.Commands.CreateWorkflow;
using WorkflowSystem.Application.Workflows.Queries.GetWorkflowById;
using WorkflowSystem.Application.Workflows.Queries.GetWorkflowNodes;
using WorkflowSystem.Application.Workflows.Commands.UpdateWorkflowNode;
using WorkflowSystem.Application.Workflows.Commands.CreateWorkflowNode;

namespace WorkflowSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkflowsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public WorkflowsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetWorkflows(
            [FromQuery] Guid? userId = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            try
            {
                var query = new GetWorkflowsQuery
                {
                    UserId = userId,
                    IsActive = isActive,
                    Page = page,
                    PageSize = pageSize,
                    SearchTerm = searchTerm
                };

                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve workflows", message = ex.Message });
            }
        }

        [HttpGet("workflow/{id}")]
        public async Task<IActionResult> GetWorkflowById(string id)
        {
            try
            {
                if (!Guid.TryParse(id, out var workflowId))
                {
                    return BadRequest(new { error = "Invalid workflow ID format" });
                }

                var query = new GetWorkflowByIdQuery { Id = workflowId };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve workflow", message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateWorkflow([FromBody] CreateWorkflowCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetWorkflowById), new { id = result.ToString() }, new { id = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create workflow", message = ex.Message });
            }
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedSampleData()
        {
            try
            {
                // Create sample workflows
                var sampleWorkflows = new[]
                {
                    new CreateWorkflowCommand
                    {
                        Name = "Data Processing Pipeline",
                        Description = "Automated data processing and transformation workflow",
                        CreatedBy = Guid.NewGuid()
                    },
                    new CreateWorkflowCommand
                    {
                        Name = "Email Notification System",
                        Description = "Sends automated email notifications based on events",
                        CreatedBy = Guid.NewGuid()
                    },
                    new CreateWorkflowCommand
                    {
                        Name = "File Backup Workflow",
                        Description = "Automated file backup and archiving system",
                        CreatedBy = Guid.NewGuid()
                    }
                };

                var createdWorkflows = new List<Guid>();
                foreach (var workflow in sampleWorkflows)
                {
                    var result = await _mediator.Send(workflow);
                    createdWorkflows.Add(result);
                }

                return Ok(new { 
                    message = "Sample data created successfully", 
                    createdWorkflows = createdWorkflows.Count 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to seed sample data", message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkflow(string id, [FromBody] object request)
        {
            await Task.CompletedTask; // Placeholder for future implementation
            
            try
            {
                // TODO: Implement UpdateWorkflowCommand
                return StatusCode(501, new { error = "UpdateWorkflow not implemented yet" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update workflow", message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkflow(string id)
        {
            await Task.CompletedTask; // Placeholder for future implementation
            
            try
            {
                // TODO: Implement DeleteWorkflowCommand
                return StatusCode(501, new { error = "DeleteWorkflow not implemented yet" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to delete workflow", message = ex.Message });
            }
        }

        // Workflow Nodes endpoints
        [HttpGet("{workflowId}/nodes")]
        public async Task<IActionResult> GetWorkflowNodes(string workflowId)
        {
            try
            {
                if (!Guid.TryParse(workflowId, out var workflowGuid))
                {
                    return BadRequest(new { error = "Invalid workflow ID format" });
                }

                var query = new GetWorkflowNodesQuery { WorkflowId = workflowGuid };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve workflow nodes", message = ex.Message });
            }
        }

        [HttpPost("{workflowId}/nodes")]
        public async Task<IActionResult> CreateWorkflowNode(string workflowId, [FromBody] CreateWorkflowNodeCommand command)
        {
            try
            {
                if (!Guid.TryParse(workflowId, out var workflowGuid))
                {
                    return BadRequest(new { error = "Invalid workflow ID format" });
                }

                command.WorkflowId = workflowGuid;
                var result = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetWorkflowNodes), new { workflowId = workflowGuid }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create workflow node", message = ex.Message });
            }
        }

        [HttpPut("{workflowId}/nodes/{nodeId}")]
        public async Task<IActionResult> UpdateWorkflowNode(string workflowId, string nodeId, [FromBody] UpdateWorkflowNodeRequest request)
        {
            try
            {
                if (!Guid.TryParse(workflowId, out var workflowGuid))
                {
                    return BadRequest(new { error = "Invalid workflow ID format" });
                }

                if (!Guid.TryParse(nodeId, out var nodeGuid))
                {
                    return BadRequest(new { error = "Invalid node ID format" });
                }

                var command = new UpdateWorkflowNodeCommand
                {
                    WorkflowId = workflowGuid,
                    NodeId = nodeGuid,
                    PositionX = request.Position?.X,
                    PositionY = request.Position?.Y,
                    Name = request.Name,
                    Type = request.Type,
                    Configuration = request.Configuration,
                    IsActive = request.IsActive,
                    Connections = request.Connections
                };

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update workflow node", message = ex.Message });
            }
        }
    }

    public class UpdateWorkflowNodeRequest
    {
        public Position? Position { get; set; }
        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? Configuration { get; set; }
        public bool? IsActive { get; set; }
        public List<string>? Connections { get; set; }
    }

    public class Position
    {
        public double X { get; set; }
        public double Y { get; set; }
    }
} 