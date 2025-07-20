using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Infrastructure.Services;
using WorkflowSystem.Domain.Enums;

namespace WorkflowSystem.Worker;

public class WorkflowExecutionWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<WorkflowExecutionWorker> _logger;
    private readonly string _workerId;

    public WorkflowExecutionWorker(
        IServiceProvider serviceProvider,
        ILogger<WorkflowExecutionWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _workerId = Guid.NewGuid().ToString("N")[..8]; // Short worker ID
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Workflow Execution Worker {WorkerId} started", _workerId);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var queueService = scope.ServiceProvider.GetRequiredService<IWorkflowExecutionQueue>();
                var executionEngine = scope.ServiceProvider.GetRequiredService<IWorkflowExecutionEngine>();
                var performanceService = scope.ServiceProvider.GetRequiredService<IPerformanceMonitoringService>();

                // Get next execution from queue
                var executionRequest = await queueService.DequeueExecutionWithPriorityAsync();
                
                if (executionRequest != null)
                {
                    _logger.LogInformation("Worker {WorkerId} processing execution for workflow {WorkflowId}", 
                        _workerId, executionRequest.WorkflowId);

                    var startTime = DateTime.UtcNow;
                                            var executionMetrics = new ExecutionMetrics
                        {
                            ExecutionId = Guid.NewGuid(),
                            WorkflowId = executionRequest.WorkflowId,
                            StartedAt = startTime,
                            Status = WorkflowSystem.Domain.Enums.ExecutionStatus.Running
                        };

                    try
                    {
                        // Execute the workflow
                        var execution = await executionEngine.ExecuteWorkflowAsync(
                            executionRequest.WorkflowId, 
                            executionRequest.UserId);

                        executionMetrics.Status = WorkflowSystem.Domain.Enums.ExecutionStatus.Completed;
                        executionMetrics.CompletedAt = DateTime.UtcNow;
                        executionMetrics.Duration = executionMetrics.CompletedAt.Value - startTime;

                        // Publish result
                        var result = new WorkflowExecutionResult
                        {
                            ExecutionId = executionMetrics.ExecutionId,
                            WorkflowId = executionRequest.WorkflowId,
                            Status = WorkflowSystem.Domain.Enums.ExecutionStatus.Completed,
                            CompletedAt = DateTime.UtcNow,
                            Duration = executionMetrics.Duration,
                            OutputData = new Dictionary<string, object>()
                        };

                        await queueService.PublishResultAsync(result);
                        await performanceService.TrackExecutionAsync(executionMetrics);

                        _logger.LogInformation("Worker {WorkerId} completed execution for workflow {WorkflowId} in {Duration}ms", 
                            _workerId, executionRequest.WorkflowId, executionMetrics.Duration.TotalMilliseconds);
                    }
                    catch (Exception ex)
                    {
                        executionMetrics.Status = WorkflowSystem.Domain.Enums.ExecutionStatus.Failed;
                        executionMetrics.ErrorMessage = ex.Message;
                        executionMetrics.CompletedAt = DateTime.UtcNow;
                        executionMetrics.Duration = executionMetrics.CompletedAt.Value - startTime;

                        await performanceService.TrackExecutionAsync(executionMetrics);

                        _logger.LogError(ex, "Worker {WorkerId} failed execution for workflow {WorkflowId}", 
                            _workerId, executionRequest.WorkflowId);

                        // Retry if possible
                        if (executionRequest.RetryCount < executionRequest.MaxRetries)
                        {
                            await queueService.RetryExecutionAsync(executionRequest);
                        }
                    }
                }
                else
                {
                    // No work to do, wait a bit
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Worker {WorkerId} encountered an error", _workerId);
                await Task.Delay(5000, stoppingToken); // Wait before retrying
            }
        }

        _logger.LogInformation("Workflow Execution Worker {WorkerId} stopped", _workerId);
    }
} 