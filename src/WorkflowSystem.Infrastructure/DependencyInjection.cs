using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using StackExchange.Redis;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Infrastructure.Jobs;
using WorkflowSystem.Infrastructure.Persistence;
using WorkflowSystem.Infrastructure.Repositories;
using WorkflowSystem.Infrastructure.Services;

namespace WorkflowSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Add database context with read-replica support
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // Add read-only context for read-replica
        if (!string.IsNullOrEmpty(configuration.GetConnectionString("ReadOnlyConnection")))
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("ReadOnlyConnection"),
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)), 
                ServiceLifetime.Scoped, 
                ServiceLifetime.Scoped);
        }

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IWorkflowRepository, WorkflowRepository>();
        services.AddScoped<IReadOnlyWorkflowRepository, ReadOnlyWorkflowRepository>();
        services.AddScoped<IExecutionRepository, ExecutionRepository>();

        // Add Redis connection multiplexer for horizontal scaling
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var redisConnectionString = configuration.GetConnectionString("Redis");
            if (string.IsNullOrEmpty(redisConnectionString))
            {
                throw new InvalidOperationException("Redis connection string is not configured");
            }
            
            return ConnectionMultiplexer.Connect(redisConnectionString);
        });

        // Add Quartz services for job scheduling
        /*
        services.AddQuartz(q =>
        {
            // Configure job store to use PostgreSQL
            q.UsePersistentStore(s =>
            {
                s.UseProperties = true;
                s.RetryInterval = TimeSpan.FromSeconds(15);
                
                // Configure PostgreSQL provider
                s.UseGenericDatabase(configuration.GetConnectionString("DefaultConnection"), "Npgsql", options =>
                {
                    options.UseJsonSerializer();
                });
            });

            // Configure the job
            q.AddJob<WorkflowExecutionJob>(opts => opts.StoreDurably());
        });

        services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);
        */

        // Add Redis caching
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
            options.InstanceName = "WorkflowSystem:";
        });

        // Add cache services
        services.AddScoped<IWorkflowExecutionCache, WorkflowExecutionCache>();

        // Add message queue services for horizontal scaling
        services.AddScoped<IWorkflowExecutionQueue, WorkflowExecutionQueue>();

        // Add distributed locking services for concurrency control
        services.AddScoped<IDistributedLockService, DistributedLockService>();

        // Add performance monitoring services
        services.AddScoped<IPerformanceMonitoringService, PerformanceMonitoringService>();

        // Add real-time collaboration services
        services.AddScoped<IRealTimeCollaborationService, RealTimeCollaborationService>();

        // Add scheduler service
        // services.AddScoped<IWorkflowSchedulerService, WorkflowSchedulerService>();

        return services;
    }
} 