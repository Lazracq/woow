using MediatR;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;

namespace WorkflowSystem.Application.Workflows.Commands.CreateWorkflow;

public record CreateWorkflowCommand : IRequest<Guid>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid CreatedBy { get; init; }
}

public class CreateWorkflowCommandHandler : IRequestHandler<CreateWorkflowCommand, Guid>
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly IApplicationDbContext _context;

    public CreateWorkflowCommandHandler(IWorkflowRepository workflowRepository, IApplicationDbContext context)
    {
        _workflowRepository = workflowRepository;
        _context = context;
    }

    public async Task<Guid> Handle(CreateWorkflowCommand request, CancellationToken cancellationToken)
    {
        var workflow = new Workflow(request.Name, request.Description);
        workflow.SetCreatedBy(request.CreatedBy);

        var createdWorkflow = await _workflowRepository.AddAsync(workflow, cancellationToken);
        
        // Create a default starting node for the new workflow
        var startingNode = new WorkflowSystem.Domain.Entities.Task("Start Workflow", "start", "{}", 0, 0);
        startingNode.SetActive(true);
        startingNode.SetWorkflow(createdWorkflow);
        
        _context.Tasks.Add(startingNode);
        await _context.SaveChangesAsync(cancellationToken);
        
        return createdWorkflow.Id;
    }
} 