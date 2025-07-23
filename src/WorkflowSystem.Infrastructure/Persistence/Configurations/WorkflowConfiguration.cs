using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowSystem.Domain.Entities;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace WorkflowSystem.Infrastructure.Persistence.Configurations;

public class WorkflowConfiguration : IEntityTypeConfiguration<Workflow>
{
    public void Configure(EntityTypeBuilder<Workflow> builder)
    {
        builder.ToTable("Workflows");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).ValueGeneratedOnAdd();

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(w => w.Description)
            .HasMaxLength(2000);

        builder.Property(w => w.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(w => w.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(w => w.CreatedAt)
            .IsRequired();

        builder.Property(w => w.UpdatedAt)
            .IsRequired();

        builder.Property(w => w.CreatedBy)
            .IsRequired();

        builder.Property(w => w.Priority)
            .HasMaxLength(50)
            .IsRequired();
        builder.Property(w => w.Complexity)
            .HasMaxLength(50)
            .IsRequired();
            
        var serializerOptions = new JsonSerializerOptions();
        var tagsConverter = new ValueConverter<ICollection<string>, string>(
            v => JsonSerializer.Serialize(v ?? new List<string>(), serializerOptions),
            v => string.IsNullOrWhiteSpace(v)
                ? new List<string>()
                : (JsonSerializer.Deserialize<List<string>>(v, serializerOptions) ?? new List<string>())
        );
        builder.Property(w => w.Tags)
            .HasConversion(tagsConverter)
            .HasColumnType("text");

        // Relationships
        builder.HasMany(w => w.Tasks)
            .WithOne(t => t.Workflow)
            .HasForeignKey(t => t.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Variables)
            .WithOne(v => v.Workflow)
            .HasForeignKey(v => v.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Triggers)
            .WithOne(t => t.Workflow)
            .HasForeignKey(t => t.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Executions)
            .WithOne(e => e.Workflow)
            .HasForeignKey(e => e.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}