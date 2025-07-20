using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowSystem.Domain.Entities;

namespace WorkflowSystem.Infrastructure.Persistence.Configurations;

public class ExecutionConfiguration : IEntityTypeConfiguration<Execution>
{
    public void Configure(EntityTypeBuilder<Execution> builder)
    {
        builder.ToTable("Executions");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedOnAdd();

        builder.Property(e => e.WorkflowId)
            .IsRequired();

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(e => e.StartedAt)
            .IsRequired();

        builder.Property(e => e.CompletedAt);

        builder.Property(e => e.TriggeredBy)
            .HasMaxLength(50);

        builder.Property(e => e.TriggerData)
            .HasColumnType("jsonb");

        builder.Property(e => e.CreatedBy);

        builder.Property(e => e.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(e => e.TotalSteps);

        builder.Property(e => e.CompletedSteps);

        // Relationships
        builder.HasOne(e => e.Workflow)
            .WithMany(w => w.Executions)
            .HasForeignKey(e => e.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.ExecutionSteps)
            .WithOne(es => es.Execution)
            .HasForeignKey(es => es.ExecutionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
} 