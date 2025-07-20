

namespace WorkflowSystem.Domain.ValueObjects;

public class WorkflowDefinition
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<TaskDefinition> Tasks { get; set; } = new();
    public List<VariableDefinition> Variables { get; set; } = new();
    public List<TriggerDefinition> Triggers { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class TaskDefinition
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Configuration { get; set; } = string.Empty;
    public int PositionX { get; set; }
    public int PositionY { get; set; }
}

public class VariableDefinition
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}

public class TriggerDefinition
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Configuration { get; set; } = string.Empty;
    public bool IsActive { get; set; }
} 