using Microsoft.EntityFrameworkCore;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using Task = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly bool _isReadOnly;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, bool isReadOnly = false) 
        : base(options)
    {
        _isReadOnly = isReadOnly;
    }

    public DbSet<Workflow> Workflows => Set<Workflow>();
    public DbSet<Task> Tasks => Set<Task>();
    public DbSet<Variable> Variables => Set<Variable>();
    public DbSet<Trigger> Triggers => Set<Trigger>();
    public DbSet<Execution> Executions => Set<Execution>();
    public DbSet<ExecutionStep> ExecutionSteps => Set<ExecutionStep>();
    public DbSet<Connection> Connections => Set<Connection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql("Host=localhost;Database=WorkflowSystem;Username=postgres;Password=password");
        }
    }

    public override int SaveChanges()
    {
        if (_isReadOnly)
        {
            throw new InvalidOperationException("Cannot save changes to read-only context");
        }
        return base.SaveChanges();
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        if (_isReadOnly)
        {
            throw new InvalidOperationException("Cannot save changes to read-only context");
        }
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        if (_isReadOnly)
        {
            throw new InvalidOperationException("Cannot save changes to read-only context");
        }
        return base.SaveChangesAsync(cancellationToken);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        if (_isReadOnly)
        {
            throw new InvalidOperationException("Cannot save changes to read-only context");
        }
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }
} 