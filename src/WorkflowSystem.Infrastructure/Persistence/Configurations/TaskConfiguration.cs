using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowSystem.Domain.Entities;

namespace WorkflowSystem.Infrastructure.Persistence.Configurations;

public class TaskConfiguration : IEntityTypeConfiguration<WorkflowSystem.Domain.Entities.Task>
{
    public void Configure(EntityTypeBuilder<WorkflowSystem.Domain.Entities.Task> builder)
    {
        builder.ToTable("Tasks");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedOnAdd();

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(t => t.Type)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.Configuration)
            .IsRequired()
            .HasColumnType("jsonb");

        builder.Property(t => t.PositionX)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(t => t.PositionY)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(t => t.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.WorkflowId)
            .IsRequired();

        // Relationships
        builder.HasOne(t => t.Workflow)
            .WithMany(w => w.Tasks)
            .HasForeignKey(t => t.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.ExecutionSteps)
            .WithOne(es => es.Task)
            .HasForeignKey(es => es.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
} 