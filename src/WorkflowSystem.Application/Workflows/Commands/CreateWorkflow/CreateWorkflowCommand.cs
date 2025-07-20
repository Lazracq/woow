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

    public CreateWorkflowCommandHandler(IWorkflowRepository workflowRepository)
    {
        _workflowRepository = workflowRepository;
    }

    public async Task<Guid> Handle(CreateWorkflowCommand request, CancellationToken cancellationToken)
    {
        var workflow = new Workflow(request.Name, request.Description);
        workflow.SetCreatedBy(request.CreatedBy);

        var createdWorkflow = await _workflowRepository.AddAsync(workflow, cancellationToken);
        return createdWorkflow.Id;
    }
} 