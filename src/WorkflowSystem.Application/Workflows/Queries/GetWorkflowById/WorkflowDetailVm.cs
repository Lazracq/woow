namespace WorkflowSystem.Application.Workflows.Queries.GetWorkflowById;

public class WorkflowDetailVm
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int TaskCount { get; set; }
    public int ExecutionCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Complexity { get; set; } = string.Empty;
    public string[] Tags { get; set; } = Array.Empty<string>();
    public string LastRun { get; set; } = string.Empty;
    public string NextRun { get; set; } = string.Empty;
    public double AvgDuration { get; set; }
    public double SuccessRate { get; set; }
} 