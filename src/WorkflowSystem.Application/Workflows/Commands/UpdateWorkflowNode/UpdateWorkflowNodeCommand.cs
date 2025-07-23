using MediatR;
using WorkflowSystem.Application.Common.Interfaces;

namespace WorkflowSystem.Application.Workflows.Commands.UpdateWorkflowNode;

public class UpdateWorkflowNodeCommand : IRequest<UpdateWorkflowNodeResponse>
{
    public Guid WorkflowId { get; set; }
    public Guid NodeId { get; set; }
    public double? PositionX { get; set; }
    public double? PositionY { get; set; }
    public string? Name { get; set; }
    public string? Type { get; set; }
    public string? Configuration { get; set; }
    public bool? IsActive { get; set; }
    public List<string>? Connections { get; set; }
}

public class UpdateWorkflowNodeResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public bool IsActive { get; set; }
    public List<string> Connections { get; set; } = new();
    public string Configuration { get; set; } = string.Empty;
}

public class UpdateWorkflowNodeCommandHandler : IRequestHandler<UpdateWorkflowNodeCommand, UpdateWorkflowNodeResponse>
{
    private readonly IApplicationDbContext _context;

    public UpdateWorkflowNodeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateWorkflowNodeResponse> Handle(UpdateWorkflowNodeCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks.FindAsync(request.NodeId);
        if (task == null)
        {
            throw new InvalidOperationException($"Task with ID {request.NodeId} not found.");
        }

        // Verify the task belongs to the specified workflow
        if (task.WorkflowId != request.WorkflowId)
        {
            throw new InvalidOperationException($"Task {request.NodeId} does not belong to workflow {request.WorkflowId}.");
        }

        // Update position if provided
        if (request.PositionX.HasValue && request.PositionY.HasValue)
        {
            task.UpdatePosition(request.PositionX.Value, request.PositionY.Value);
        }

        // Update name if provided
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            task.UpdateName(request.Name);
        }

        // Update type if provided
        if (!string.IsNullOrWhiteSpace(request.Type))
        {
            // Note: You might want to add a method to update the type in the Task entity
            // For now, we'll handle this through reflection or add a method
        }

        // Update configuration if provided
        bool configUpdated = false;
        if (!string.IsNullOrWhiteSpace(request.Configuration))
        {
            task.UpdateConfiguration(request.Configuration);
            configUpdated = true;
        }

        // Update active status if provided
        if (request.IsActive.HasValue)
        {
            task.SetActive(request.IsActive.Value);
        }

        // Update connections if provided and configuration was NOT updated
        if (request.Connections != null && !configUpdated)
        {
            // Merge connections into existing config
            var configObj = task.GetConfiguration<dynamic>() ?? new System.Dynamic.ExpandoObject();
            configObj.connections = request.Connections;
            task.UpdateConfiguration(System.Text.Json.JsonSerializer.Serialize(configObj));
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateWorkflowNodeResponse
        {
            Id = task.Id,
            Name = task.Name,
            Type = task.Type,
            PositionX = task.PositionX,
            PositionY = task.PositionY,
            IsActive = task.IsActive,
            Connections = request.Connections ?? new List<string>(),
            Configuration = task.Configuration
        };
    }
} 