using System.ComponentModel.DataAnnotations;
using WorkflowSystem.Domain.Enums;
using WorkflowSystem.Domain.ValueObjects;

namespace WorkflowSystem.Domain.Entities;

public class Workflow(string name, string? description = null) : BaseEntity
{
    [Required]
    [StringLength(255)]
    public string Name { get; private set; } = name;

    [StringLength(2000)]
    public string? Description { get; private set; } = description;

    public bool IsActive { get; private set; } = true;

    public WorkflowStatus Status { get; private set; } = WorkflowStatus.Draft;

    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    public Guid CreatedBy { get; private set; }

    public string Priority { get; private set; } = "medium";
    public string Complexity { get; private set; } = "medium";
    public ICollection<string> Tags { get; private set; } = [];

    // Navigation properties
    public virtual ICollection<Task> Tasks { get; private set; } = [];
    public virtual ICollection<Variable> Variables { get; private set; } = [];
    public virtual ICollection<Trigger> Triggers { get; private set; } = [];
    public virtual ICollection<Execution> Executions { get; private set; } = [];
    public virtual ICollection<Connection> Connections { get; private set; } = [];

    // Business methods
    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Workflow name cannot be empty.", nameof(name));

        Name = name.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDescription(string? description)
    {
        Description = description?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetStatus(WorkflowStatus status)
    {
        Status = status;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCreatedBy(Guid userId)
    {
        CreatedBy = userId;
    }

    public void AddTask(Task task)
    {
        if (task == null)
            throw new ArgumentNullException(nameof(task));

        Tasks.Add(task);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveTask(Task task)
    {
        ArgumentNullException.ThrowIfNull(task);

        Tasks.Remove(task);
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddVariable(Variable variable)
    {
        if (variable == null)
            throw new ArgumentNullException(nameof(variable));

        Variables.Add(variable);
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddTrigger(Trigger trigger)
    {
        if (trigger == null)
            throw new ArgumentNullException(nameof(trigger));

        Triggers.Add(trigger);
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddExecution(Execution execution)
    {
        if (execution == null)
            throw new ArgumentNullException(nameof(execution));

        Executions.Add(execution);
    }

    public bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(Name) && 
               Tasks.Any() && 
               Tasks.All(t => t.IsValid());
    }

    public WorkflowDefinition ToDefinition()
    {
        return new WorkflowDefinition
        {
            Id = Id,
            Name = Name,
            Description = Description,
            Tasks = Tasks.Select(t => t.ToDefinition()).ToList(),
            Variables = Variables.Select(v => v.ToDefinition()).ToList(),
            Triggers = Triggers.Select(t => t.ToDefinition()).ToList()
        };
    }
} 