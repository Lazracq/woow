using MediatR;
using WorkflowSystem.Application.Common.Interfaces;

namespace WorkflowSystem.Application.Workflows.Queries.GetWorkflowById;

public record GetWorkflowByIdQuery : IRequest<WorkflowDetailVm>
{
    public Guid Id { get; init; }
}

public class GetWorkflowByIdQueryHandler : IRequestHandler<GetWorkflowByIdQuery, WorkflowDetailVm>
{
    private readonly IWorkflowRepository _workflowRepository;

    public GetWorkflowByIdQueryHandler(IWorkflowRepository workflowRepository)
    {
        _workflowRepository = workflowRepository;
    }

    public async Task<WorkflowDetailVm> Handle(GetWorkflowByIdQuery request, CancellationToken cancellationToken)
    {
        var workflow = await _workflowRepository.GetByIdAsync(request.Id, cancellationToken);
        if (workflow == null)
            throw new InvalidOperationException("Workflow not found");

        var vm = new WorkflowDetailVm
        {
            Id = workflow.Id,
            Name = workflow.Name,
            Description = workflow.Description,
            IsActive = workflow.IsActive,
            CreatedAt = workflow.CreatedAt,
            UpdatedAt = workflow.UpdatedAt,
            TaskCount = workflow.Tasks.Count,
            ExecutionCount = workflow.Executions.Count,
            Status = workflow.Status.ToString().ToLower(),
            Priority = workflow.Priority,
            Complexity = workflow.Complexity,
            Tags = workflow.Tags.ToList(),
            LastRun = workflow.Executions.OrderByDescending(e => e.StartedAt).FirstOrDefault()?.StartedAt.ToString("u") ?? "Never",
            NextRun = "Not scheduled",
            AvgDuration = workflow.Executions.Any()
                ? workflow.Executions.Average(e => ((e.CompletedAt ?? DateTime.UtcNow) - e.StartedAt).TotalSeconds)
                : 0,
            SuccessRate = workflow.Executions.Any() ? 100.0 * workflow.Executions.Count(e => e.Status == Domain.Enums.ExecutionStatus.Completed) / workflow.Executions.Count() : 0,
            Tasks = workflow.Tasks.Select(task => new WorkflowDetailVm.TaskDto
            {
                Id = task.Id,
                Name = task.Name,
                Type = task.Type,
                Configuration = task.Configuration,
                PositionX = task.PositionX,
                PositionY = task.PositionY,
                IsActive = task.IsActive,
                IsStartingNode = task.Type == "start"
            }).ToList(),
            Connections = workflow.Connections.Select(c => new WorkflowDetailVm.ConnectionDto
            {
                Id = c.Id,
                FromTaskId = c.FromTaskId,
                ToTaskId = c.ToTaskId,
                AssociationType = c.AssociationType,
                Label = c.Label
            }).ToList()
        };
        return vm;
    }
} 