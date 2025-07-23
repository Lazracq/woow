using MediatR;
using WorkflowSystem.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace WorkflowSystem.Application.Workflows.Queries.GetWorkflowNodes;

public class GetWorkflowNodesQuery : IRequest<List<WorkflowNodeDto>>
{
    public Guid WorkflowId { get; set; }
}

public class WorkflowNodeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Configuration { get; set; } = string.Empty;
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public bool IsActive { get; set; }
    public bool IsStartingNode { get; set; }
    public List<string> Connections { get; set; } = new();
}

public class GetWorkflowNodesQueryHandler : IRequestHandler<GetWorkflowNodesQuery, List<WorkflowNodeDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWorkflowNodesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkflowNodeDto>> Handle(GetWorkflowNodesQuery request, CancellationToken cancellationToken)
    {
        var tasks = await _context.Tasks
            .Where(t => t.WorkflowId == request.WorkflowId)
            .ToListAsync(cancellationToken);

        var nodeDtos = new List<WorkflowNodeDto>();

        foreach (var task in tasks)
        {
            var connections = new List<string>();
            
            // Try to extract connections from configuration
            try
            {
                var config = task.GetConfiguration<dynamic>();
                if (config != null)
                {
                    if (config.connections is System.Text.Json.JsonElement elem && elem.ValueKind == System.Text.Json.JsonValueKind.Array)
                    {
                        connections = elem.EnumerateArray()
                            .Where(x => x.ValueKind == System.Text.Json.JsonValueKind.String)
                            .Select(x => x.GetString() ?? string.Empty)
                            .Where(x => !string.IsNullOrEmpty(x))
                            .ToList();
                    }
                }
            }
            catch
            {
                // If configuration parsing fails, use empty connections
                connections = new List<string>();
            }

            nodeDtos.Add(new WorkflowNodeDto
            {
                Id = task.Id,
                Name = task.Name,
                Type = task.Type,
                Configuration = task.Configuration,
                PositionX = task.PositionX,
                PositionY = task.PositionY,
                IsActive = task.IsActive,
                IsStartingNode = task.PositionX == 0 && task.PositionY == 0, // Simple heuristic for starting node
                Connections = connections
            });
        }

        return nodeDtos;
    }
} 