using Microsoft.EntityFrameworkCore;
using WorkflowSystem.Domain.Entities;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Workflow> Workflows { get; }
    DbSet<Task> Tasks { get; }
    DbSet<Variable> Variables { get; }
    DbSet<Trigger> Triggers { get; }
    DbSet<Execution> Executions { get; }
    DbSet<ExecutionStep> ExecutionSteps { get; }
    DbSet<Connection> Connections { get; }

    System.Threading.Tasks.Task<int> SaveChangesAsync(CancellationToken cancellationToken);
} 