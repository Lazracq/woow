using MediatR;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;

namespace WorkflowSystem.Application.Workflows.Commands.CreateWorkflowNode;

public class CreateWorkflowNodeCommand : IRequest<CreateWorkflowNodeResponse>
{
    public Guid WorkflowId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Configuration { get; set; } = string.Empty;
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public bool IsActive { get; set; } = true;
    public List<string>? Connections { get; set; }
}

public class CreateWorkflowNodeResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public bool IsActive { get; set; }
    public List<string> Connections { get; set; } = new();
}

public class CreateWorkflowNodeCommandHandler : IRequestHandler<CreateWorkflowNodeCommand, CreateWorkflowNodeResponse>
{
    private readonly IApplicationDbContext _context;

    public CreateWorkflowNodeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateWorkflowNodeResponse> Handle(CreateWorkflowNodeCommand request, CancellationToken cancellationToken)
    {
        // Verify the workflow exists
        var workflow = await _context.Workflows.FindAsync(request.WorkflowId);
        if (workflow == null)
        {
            throw new InvalidOperationException($"Workflow with ID {request.WorkflowId} not found.");
        }

        // Create the task
        var task = new WorkflowSystem.Domain.Entities.Task(request.Name, request.Type, request.Configuration, request.PositionX, request.PositionY);
        
        // Set active status if different from default
        if (!request.IsActive)
        {
            task.SetActive(false);
        }

        // Set the workflow
        task.SetWorkflow(workflow);

        // Add connections to configuration if provided
        if (request.Connections != null && request.Connections.Any())
        {
            var connectionConfig = new { connections = request.Connections };
            task.SetConfiguration(connectionConfig);
        }

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateWorkflowNodeResponse
        {
            Id = task.Id,
            Name = task.Name,
            Type = task.Type,
            PositionX = task.PositionX,
            PositionY = task.PositionY,
            IsActive = task.IsActive,
            Connections = request.Connections ?? new List<string>()
        };
    }
} 