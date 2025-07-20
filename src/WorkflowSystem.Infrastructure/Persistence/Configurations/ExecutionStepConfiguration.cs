using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowSystem.Domain.Entities;

namespace WorkflowSystem.Infrastructure.Persistence.Configurations;

public class ExecutionStepConfiguration : IEntityTypeConfiguration<ExecutionStep>
{
    public void Configure(EntityTypeBuilder<ExecutionStep> builder)
    {
        builder.ToTable("ExecutionSteps");

        builder.HasKey(es => es.Id);
        builder.Property(es => es.Id).ValueGeneratedOnAdd();

        builder.Property(es => es.ExecutionId)
            .IsRequired();

        builder.Property(es => es.TaskId)
            .IsRequired();

        builder.Property(es => es.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(es => es.StartedAt)
            .IsRequired();

        builder.Property(es => es.CompletedAt);

        builder.Property(es => es.InputData)
            .HasColumnType("jsonb");

        builder.Property(es => es.OutputData)
            .HasColumnType("jsonb");

        builder.Property(es => es.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(es => es.ExecutionTimeMs);

        builder.Property(es => es.RetryCount);

        builder.Property(es => es.MaxRetries);

        // Relationships
        builder.HasOne(es => es.Execution)
            .WithMany(e => e.ExecutionSteps)
            .HasForeignKey(es => es.ExecutionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(es => es.Task)
            .WithMany(t => t.ExecutionSteps)
            .HasForeignKey(es => es.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
} 