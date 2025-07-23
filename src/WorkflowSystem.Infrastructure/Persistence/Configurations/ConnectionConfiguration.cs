using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowSystem.Domain.Entities;

public class ConnectionConfiguration : IEntityTypeConfiguration<Connection>
{
    public void Configure(EntityTypeBuilder<Connection> builder)
    {
        builder.ToTable("Connections");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.AssociationType).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Label).HasMaxLength(255);

        builder.HasOne(c => c.Workflow)
            .WithMany(w => w.Connections)
            .HasForeignKey(c => c.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.FromTask)
            .WithMany(t => t.OutgoingConnections)
            .HasForeignKey(c => c.FromTaskId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.ToTask)
            .WithMany(t => t.IncomingConnections)
            .HasForeignKey(c => c.ToTaskId)
            .OnDelete(DeleteBehavior.Restrict);
    }
} 