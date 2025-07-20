using System.ComponentModel.DataAnnotations;
using WorkflowSystem.Domain.Enums;
using WorkflowSystem.Domain.ValueObjects;

namespace WorkflowSystem.Domain.Entities;

public class Variable : BaseEntity
{
    public Variable(string name, string value, VariableType type = VariableType.Global)
    {
        Name = name;
        Value = value;
        Type = type;
        CreatedAt = DateTime.UtcNow;
    }

    [Required]
    [StringLength(100)]
    public string Name { get; private set; }

    [Required]
    [StringLength(4000)]
    public string Value { get; private set; }

    public VariableType Type { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public Guid WorkflowId { get; private set; }
    public virtual Workflow Workflow { get; private set; } = null!;

    // Business methods
    public void UpdateValue(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Variable value cannot be empty.", nameof(value));

        Value = value.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetWorkflow(Workflow workflow)
    {
        Workflow = workflow ?? throw new ArgumentNullException(nameof(workflow));
        WorkflowId = workflow.Id;
    }

    public bool IsSystemVariable()
    {
        return Type == VariableType.System;
    }

    public VariableDefinition ToDefinition()
    {
        return new VariableDefinition
        {
            Id = Id,
            Name = Name,
            Value = Value,
            Type = Type.ToString()
        };
    }
} 