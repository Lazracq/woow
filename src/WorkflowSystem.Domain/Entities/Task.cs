using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using WorkflowSystem.Domain.ValueObjects;

namespace WorkflowSystem.Domain.Entities;

public class Task : BaseEntity
{
    public Task(string name, string type, string configuration, double positionX = 0, double positionY = 0)
    {
        Name = name;
        Type = type;
        Configuration = configuration;
        PositionX = positionX;
        PositionY = positionY;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    [Required]
    [StringLength(255)]
    public string Name { get; private set; }

    public string Type { get; private set; }

    [Required]
    public string Configuration { get; private set; }

    public double PositionX { get; private set; }

    public double PositionY { get; private set; }

    public bool IsActive { get; private set; }

    public DateTime CreatedAt { get; private set; }

    // Navigation properties
    public Guid WorkflowId { get; private set; }
    public virtual Workflow Workflow { get; private set; } = null!;

    public virtual ICollection<ExecutionStep> ExecutionSteps { get; private set; } = new List<ExecutionStep>();

    // Business methods
    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Task name cannot be empty.", nameof(name));

        Name = name.Trim();
    }

    public void UpdateConfiguration(string configuration)
    {
        if (string.IsNullOrWhiteSpace(configuration))
            throw new ArgumentException("Task configuration cannot be empty.", nameof(configuration));

        // Validate JSON configuration
        try
        {
            JsonDocument.Parse(configuration);
        }
        catch (JsonException ex)
        {
            throw new ArgumentException("Invalid JSON configuration.", nameof(configuration), ex);
        }

        Configuration = configuration;
    }

    public void UpdatePosition(double positionX, double positionY)
    {
        PositionX = positionX;
        PositionY = positionY;
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
    }

    public void SetWorkflow(Workflow workflow)
    {
        Workflow = workflow ?? throw new ArgumentNullException(nameof(workflow));
        WorkflowId = workflow.Id;
    }

    public bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(Name) && 
               !string.IsNullOrWhiteSpace(Configuration) &&
               IsActive;
    }

    public TaskDefinition ToDefinition()
    {
        return new TaskDefinition
        {
            Id = Id,
            Name = Name,
            Type = Type,
            Configuration = Configuration,
            PositionX = PositionX,
            PositionY = PositionY
        };
    }

    public T GetConfiguration<T>() where T : class
    {
        try
        {
            return JsonSerializer.Deserialize<T>(Configuration) 
                   ?? throw new InvalidOperationException("Failed to deserialize configuration.");
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException("Invalid configuration format.", ex);
        }
    }

    public void SetConfiguration<T>(T configuration) where T : class
    {
        Configuration = JsonSerializer.Serialize(configuration);
    }
} 