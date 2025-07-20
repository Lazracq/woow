using MediatR;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Application.Workflows.Queries.GetWorkflows;

namespace WorkflowSystem.Application.Workflows.Queries.GetWorkflows;

public record GetWorkflowsQuery : IRequest<WorkflowsVm>
{
    public Guid? UserId { get; init; }
    public bool? IsActive { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SearchTerm { get; init; }
}

public class GetWorkflowsQueryHandler : IRequestHandler<GetWorkflowsQuery, WorkflowsVm>
{
    private readonly IWorkflowRepository _workflowRepository;

    public GetWorkflowsQueryHandler(IWorkflowRepository workflowRepository)
    {
        _workflowRepository = workflowRepository;
    }

    public async Task<WorkflowsVm> Handle(GetWorkflowsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            IEnumerable<WorkflowSystem.Domain.Entities.Workflow> workflows;

            if (request.UserId.HasValue)
            {
                workflows = await _workflowRepository.GetByUserIdAsync(request.UserId.Value, cancellationToken);
            }
            else
            {
                workflows = await _workflowRepository.GetAllAsync(cancellationToken);
            }

            // Apply filters
            if (request.IsActive.HasValue)
            {
                workflows = workflows.Where(w => w.IsActive == request.IsActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLowerInvariant();
                workflows = workflows.Where(w => 
                    w.Name.ToLowerInvariant().Contains(searchTerm) || 
                    (w.Description != null && w.Description.ToLowerInvariant().Contains(searchTerm)));
            }

            // Apply pagination
            var totalCount = workflows.Count();
            var pagedWorkflows = workflows
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            return new WorkflowsVm
            {
                Workflows = pagedWorkflows.Select(w => new WorkflowDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Description = w.Description,
                    IsActive = w.IsActive,
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = w.UpdatedAt,
                    TaskCount = w.Tasks.Count,
                    ExecutionCount = w.Executions.Count
                }).ToList(),
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
            };
        }
        catch (Exception ex)
        {
            // If database is not set up, return empty results
            if (ex.Message.Contains("relation") || ex.Message.Contains("does not exist"))
            {
                return new WorkflowsVm
                {
                    Workflows = new List<WorkflowDto>(),
                    TotalCount = 0,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = 0
                };
            }
            
            // Re-throw other exceptions
            throw;
        }
    }
} 