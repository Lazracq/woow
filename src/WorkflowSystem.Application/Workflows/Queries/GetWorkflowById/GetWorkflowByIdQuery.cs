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
        {
            throw new InvalidOperationException($"Workflow with ID {request.Id} not found");
        }

        return new WorkflowDetailVm
        {
            Id = workflow.Id,
            Name = workflow.Name,
            Description = workflow.Description,
            IsActive = workflow.IsActive,
            CreatedAt = workflow.CreatedAt,
            UpdatedAt = workflow.UpdatedAt,
            TaskCount = workflow.Tasks.Count,
            ExecutionCount = workflow.Executions.Count,
            Status = workflow.IsActive ? "active" : "inactive",
            Priority = "medium", // Default value since it's not in the domain model
            Complexity = "medium", // Default value since it's not in the domain model
            Tags = GetWorkflowTags(workflow),
            LastRun = GetLastRun(workflow),
            NextRun = GetNextRun(workflow),
            AvgDuration = CalculateAverageDuration(workflow),
            SuccessRate = CalculateSuccessRate(workflow)
        };
    }

    private static string[] GetWorkflowTags(WorkflowSystem.Domain.Entities.Workflow workflow)
    {
        var tags = new List<string>();
        
        // Add workflow type tags based on tasks
        if (workflow.Tasks.Any(t => t.Type.Contains("http", StringComparison.OrdinalIgnoreCase)))
            tags.Add("api");
        
        if (workflow.Tasks.Any(t => t.Type.Contains("script", StringComparison.OrdinalIgnoreCase)))
            tags.Add("script");
        
        if (workflow.Tasks.Any(t => t.Type.Contains("email", StringComparison.OrdinalIgnoreCase)))
            tags.Add("notification");
        
        if (workflow.Tasks.Any(t => t.Type.Contains("database", StringComparison.OrdinalIgnoreCase)))
            tags.Add("data");
        
        // Add workflow status tag
        tags.Add(workflow.IsActive ? "active" : "inactive");
        
        return tags.ToArray();
    }

    private static string GetLastRun(WorkflowSystem.Domain.Entities.Workflow workflow)
    {
        var lastExecution = workflow.Executions
            .OrderByDescending(e => e.StartedAt)
            .FirstOrDefault();
        
        return lastExecution?.StartedAt.ToString("yyyy-MM-dd HH:mm:ss") ?? "Never";
    }

    private static string GetNextRun(WorkflowSystem.Domain.Entities.Workflow workflow)
    {
        // For now, return a default value since scheduling is not implemented
        return "Not scheduled";
    }

    private static double CalculateAverageDuration(WorkflowSystem.Domain.Entities.Workflow workflow)
    {
        var completedExecutions = workflow.Executions
            .Where(e => e.IsCompleted())
            .ToList();
        
        if (!completedExecutions.Any())
            return 0;
        
        var averageMs = completedExecutions.Average(e => e.GetDuration().TotalMilliseconds);
        return Math.Round(averageMs / 1000, 1); // Convert to seconds
    }

    private static double CalculateSuccessRate(WorkflowSystem.Domain.Entities.Workflow workflow)
    {
        var totalExecutions = workflow.Executions.Count;
        if (totalExecutions == 0)
            return 0;
        
        var successfulExecutions = workflow.Executions
            .Count(e => e.Status == WorkflowSystem.Domain.Enums.ExecutionStatus.Completed);
        
        return Math.Round((double)successfulExecutions / totalExecutions * 100, 1);
    }
} 