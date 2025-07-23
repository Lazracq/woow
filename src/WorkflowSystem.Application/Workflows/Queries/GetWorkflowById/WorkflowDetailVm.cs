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
    public string Priority { get; set; } = "medium";
    public string Complexity { get; set; } = "medium";
    public List<string> Tags { get; set; } = new();
    public List<TaskDto> Tasks { get; set; } = new();
    public string LastRun { get; set; } = string.Empty;
    public string NextRun { get; set; } = string.Empty;
    public double AvgDuration { get; set; }
    public double SuccessRate { get; set; }
    public List<ConnectionDto> Connections { get; set; } = new();

    public class ConnectionDto
    {
        public Guid Id { get; set; }
        public Guid FromTaskId { get; set; }
        public Guid ToTaskId { get; set; }
        public string AssociationType { get; set; } = string.Empty;
        public string? Label { get; set; }
    }

    public class TaskDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Type { get; set; }
        public required string Configuration { get; set; }
        public double PositionX { get; set; }
        public double PositionY { get; set; }
        public bool IsActive { get; set; }
        public bool IsStartingNode { get; set; }
    }
} 