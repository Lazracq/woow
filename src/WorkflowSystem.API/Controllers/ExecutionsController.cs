using Microsoft.AspNetCore.Mvc;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using WorkflowSystem.Domain.Enums;
using System.Linq;

namespace WorkflowSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExecutionsController : ControllerBase
    {
        private readonly IExecutionRepository _executionRepository;
        private readonly IWorkflowRepository _workflowRepository;

        public ExecutionsController(
            IExecutionRepository executionRepository,
            IWorkflowRepository workflowRepository)
        {
            _executionRepository = executionRepository;
            _workflowRepository = workflowRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetExecutions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] string? workflowId = null)
        {
            try
            {
                // Get all executions with workflow information
                var allExecutions = await _executionRepository.GetAllAsync();
                
                // Apply filters
                var filteredExecutions = allExecutions.AsQueryable();
                
                if (!string.IsNullOrEmpty(status) && Enum.TryParse<ExecutionStatus>(status, true, out var statusEnum))
                {
                    filteredExecutions = filteredExecutions.Where(e => e.Status == statusEnum);
                }
                
                if (!string.IsNullOrEmpty(workflowId) && Guid.TryParse(workflowId, out var workflowGuid))
                {
                    filteredExecutions = filteredExecutions.Where(e => e.WorkflowId == workflowGuid);
                }

                // Apply pagination
                var totalCount = filteredExecutions.Count();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var skip = (page - 1) * pageSize;
                
                var pagedExecutions = filteredExecutions
                    .OrderByDescending(e => e.StartedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToList();

                // Transform to DTOs
                var executionDtos = pagedExecutions.Select(e => new
                {
                    id = e.Id.ToString(),
                    workflow = e.Workflow?.Name ?? "Unknown Workflow",
                    status = e.Status.ToString().ToLower(),
                    startedAt = e.StartedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                    completedAt = e.CompletedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                    duration = FormatDuration(e.GetDuration()),
                    progress = (int)e.GetProgressPercentage(),
                    result = GetResultFromStatus(e.Status),
                    logs = e.ErrorMessage ?? GetDefaultLogMessage(e.Status),
                    tags = GetTagsFromWorkflow(e.Workflow)
                }).ToList();

                var response = new
                {
                    executions = executionDtos,
                    totalCount = totalCount,
                    page = page,
                    pageSize = pageSize,
                    totalPages = totalPages
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve executions", message = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetExecutionStats()
        {
            try
            {
                var allExecutions = await _executionRepository.GetAllAsync();
                
                var totalExecutions = allExecutions.Count();
                var successfulExecutions = allExecutions.Count(e => e.Status == ExecutionStatus.Completed);
                var failedExecutions = allExecutions.Count(e => e.Status == ExecutionStatus.Failed);
                var runningExecutions = allExecutions.Count(e => e.Status == ExecutionStatus.Running);
                
                var completedExecutions = allExecutions.Where(e => e.IsCompleted()).ToList();
                var avgDuration = completedExecutions.Any() 
                    ? FormatDuration(TimeSpan.FromMilliseconds(completedExecutions.Average(e => e.GetDuration().TotalMilliseconds)))
                    : "0s";
                
                var successRate = totalExecutions > 0 
                    ? Math.Round((double)successfulExecutions / totalExecutions * 100, 1)
                    : 0;

                var stats = new
                {
                    totalExecutions = totalExecutions,
                    successfulExecutions = successfulExecutions,
                    failedExecutions = failedExecutions,
                    runningExecutions = runningExecutions,
                    avgDuration = avgDuration,
                    successRate = successRate
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve execution statistics", message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExecutionById(string id)
        {
            try
            {
                if (!Guid.TryParse(id, out var executionId))
                {
                    return BadRequest(new { error = "Invalid execution ID format" });
                }

                var execution = await _executionRepository.GetByIdAsync(executionId);
                if (execution == null)
                {
                    return NotFound(new { error = "Execution not found" });
                }

                var executionDto = new
                {
                    id = execution.Id.ToString(),
                    workflow = execution.Workflow?.Name ?? "Unknown Workflow",
                    status = execution.Status.ToString().ToLower(),
                    startedAt = execution.StartedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                    completedAt = execution.CompletedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                    duration = FormatDuration(execution.GetDuration()),
                    progress = (int)execution.GetProgressPercentage(),
                    result = GetResultFromStatus(execution.Status),
                    logs = execution.ErrorMessage ?? GetDefaultLogMessage(execution.Status),
                    tags = GetTagsFromWorkflow(execution.Workflow),
                    steps = execution.ExecutionSteps.Select(es => new
                    {
                        id = es.Id.ToString(),
                        name = es.Task?.Name ?? "Unknown Task",
                        status = es.Status.ToString().ToLower(),
                        duration = FormatDuration(es.GetDuration())
                    }).ToList()
                };

                return Ok(executionDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve execution details", message = ex.Message });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelExecution(string id)
        {
            try
            {
                if (!Guid.TryParse(id, out var executionId))
                {
                    return BadRequest(new { error = "Invalid execution ID format" });
                }

                var execution = await _executionRepository.GetByIdAsync(executionId);
                if (execution == null)
                {
                    return NotFound(new { error = "Execution not found" });
                }

                if (execution.Status != ExecutionStatus.Pending && execution.Status != ExecutionStatus.Running)
                {
                    return BadRequest(new { error = "Execution cannot be cancelled in its current state" });
                }

                execution.Cancel();
                await _executionRepository.UpdateAsync(execution);

                return Ok(new { message = "Execution cancelled successfully", id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to cancel execution", message = ex.Message });
            }
        }

        [HttpPost("{id}/retry")]
        public async Task<IActionResult> RetryExecution(string id)
        {
            try
            {
                if (!Guid.TryParse(id, out var executionId))
                {
                    return BadRequest(new { error = "Invalid execution ID format" });
                }

                var execution = await _executionRepository.GetByIdAsync(executionId);
                if (execution == null)
                {
                    return NotFound(new { error = "Execution not found" });
                }

                if (execution.Status != ExecutionStatus.Failed)
                {
                    return BadRequest(new { error = "Only failed executions can be retried" });
                }

                // Create a new execution for retry
                var retryExecution = new Execution(execution.WorkflowId, ExecutionStatus.Pending);
                retryExecution.SetTriggeredBy("Manual Retry");
                retryExecution.SetCreatedBy(execution.CreatedBy ?? Guid.Empty);
                
                await _executionRepository.AddAsync(retryExecution);

                return Ok(new { message = "Execution retry initiated", id = retryExecution.Id.ToString() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retry execution", message = ex.Message });
            }
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedSampleExecutions()
        {
            try
            {
                // Get or create sample workflows
                var workflows = await _workflowRepository.GetAllAsync();
                var sampleWorkflows = workflows.ToList();

                // Create sample workflows if none exist
                if (!sampleWorkflows.Any())
                {
                    var workflow1 = new Workflow("Data Processing Pipeline", "Automated data processing and transformation workflow");
                    workflow1.SetCreatedBy(Guid.NewGuid());
                    workflow1.SetStatus(WorkflowStatus.Active);
                    await _workflowRepository.AddAsync(workflow1);

                    var workflow2 = new Workflow("Email Notification System", "Sends automated email notifications based on events");
                    workflow2.SetCreatedBy(Guid.NewGuid());
                    workflow2.SetStatus(WorkflowStatus.Active);
                    await _workflowRepository.AddAsync(workflow2);

                    var workflow3 = new Workflow("File Backup Workflow", "Automated file backup and archiving system");
                    workflow3.SetCreatedBy(Guid.NewGuid());
                    workflow3.SetStatus(WorkflowStatus.Active);
                    await _workflowRepository.AddAsync(workflow3);

                    sampleWorkflows = new List<Workflow> { workflow1, workflow2, workflow3 };
                }

                // Create sample executions
                var sampleExecutions = new List<Execution>();

                // Completed execution
                var completedExecution = new Execution(sampleWorkflows[0].Id, ExecutionStatus.Completed);
                completedExecution.SetTriggeredBy("Manual");
                completedExecution.SetCreatedBy(Guid.NewGuid());
                completedExecution.SetProgress(10, 10);
                completedExecution.Complete();
                sampleExecutions.Add(completedExecution);

                // Running execution
                var runningExecution = new Execution(sampleWorkflows[1].Id, ExecutionStatus.Running);
                runningExecution.SetTriggeredBy("Scheduled");
                runningExecution.SetCreatedBy(Guid.NewGuid());
                runningExecution.SetProgress(10, 6);
                runningExecution.Start();
                sampleExecutions.Add(runningExecution);

                // Failed execution
                var failedExecution = new Execution(sampleWorkflows[2].Id, ExecutionStatus.Failed);
                failedExecution.SetTriggeredBy("Webhook");
                failedExecution.SetCreatedBy(Guid.NewGuid());
                failedExecution.SetProgress(10, 3);
                failedExecution.Start();
                failedExecution.Fail("Database connection timeout");
                sampleExecutions.Add(failedExecution);

                // Pending execution
                var pendingExecution = new Execution(sampleWorkflows[0].Id, ExecutionStatus.Pending);
                pendingExecution.SetTriggeredBy("Manual");
                pendingExecution.SetCreatedBy(Guid.NewGuid());
                sampleExecutions.Add(pendingExecution);

                // Add all executions
                foreach (var execution in sampleExecutions)
                {
                    await _executionRepository.AddAsync(execution);
                }

                return Ok(new { 
                    message = "Sample executions created successfully", 
                    createdExecutions = sampleExecutions.Count 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to seed sample executions", message = ex.Message });
            }
        }

        private static string FormatDuration(TimeSpan duration)
        {
            if (duration.TotalSeconds < 60)
            {
                return $"{(int)duration.TotalSeconds}s";
            }
            else if (duration.TotalMinutes < 60)
            {
                return $"{(int)duration.TotalMinutes}m {(int)duration.Seconds}s";
            }
            else
            {
                return $"{(int)duration.TotalHours}h {(int)duration.Minutes}m";
            }
        }

        private static string? GetResultFromStatus(ExecutionStatus status)
        {
            return status switch
            {
                ExecutionStatus.Completed => "success",
                ExecutionStatus.Failed => "error",
                ExecutionStatus.Cancelled => "cancelled",
                _ => null
            };
        }

        private static string GetDefaultLogMessage(ExecutionStatus status)
        {
            return status switch
            {
                ExecutionStatus.Pending => "Execution is queued and waiting to start",
                ExecutionStatus.Running => "Execution is currently running",
                ExecutionStatus.Completed => "Execution completed successfully",
                ExecutionStatus.Failed => "Execution failed with an error",
                ExecutionStatus.Cancelled => "Execution was cancelled",
                ExecutionStatus.Paused => "Execution is paused",
                _ => "Unknown execution status"
            };
        }

        private static string[] GetTagsFromWorkflow(Workflow? workflow)
        {
            if (workflow == null) return new[] { "unknown" };
            
            var tags = new List<string>();
            
            // Add workflow type tags based on tasks
            if (workflow.Tasks.Any(t => t.Type.Contains("http", StringComparison.OrdinalIgnoreCase)))
                tags.Add("api");
            
            if (workflow.Tasks.Any(t => t.Type.Contains("script", StringComparison.OrdinalIgnoreCase)))
                tags.Add("script");
            
            if (workflow.Tasks.Any(t => t.Type.Contains("email", StringComparison.OrdinalIgnoreCase)))
                tags.Add("notification");
            
            if (workflow.Tasks.Any(t => t.Type.Contains("database", StringComparison.OrdinalIgnoreCase)))
                tags.Add("data");
            
            // Add workflow status tag
            tags.Add(workflow.IsActive ? "active" : "inactive");
            
            return tags.ToArray();
        }
    }
} 