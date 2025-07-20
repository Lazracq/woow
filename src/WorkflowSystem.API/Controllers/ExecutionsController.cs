using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WorkflowSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExecutionsController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetExecutions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] string? workflowId = null)
        {
            // For now, return sample executions data
            var executions = new List<object>
            {
                new
                {
                    id = "1",
                    workflow = "Data Processing Pipeline",
                    status = "completed",
                    startedAt = DateTime.UtcNow.AddMinutes(-30).ToString("yyyy-MM-dd HH:mm:ss"),
                    completedAt = DateTime.UtcNow.AddMinutes(-29).ToString("yyyy-MM-dd HH:mm:ss"),
                    duration = "1m 12s",
                    progress = 100,
                    result = "success",
                    logs = "Processing completed successfully",
                    tags = new[] { "data", "processing" }
                },
                new
                {
                    id = "2",
                    workflow = "Email Notification System",
                    status = "running",
                    startedAt = DateTime.UtcNow.AddMinutes(-5).ToString("yyyy-MM-dd HH:mm:ss"),
                    completedAt = (string?)null,
                    duration = "5m 30s",
                    progress = 65,
                    result = (string?)null,
                    logs = "Sending notifications to 150 recipients...",
                    tags = new[] { "email", "notifications" }
                },
                new
                {
                    id = "3",
                    workflow = "Report Generation",
                    status = "failed",
                    startedAt = DateTime.UtcNow.AddMinutes(-15).ToString("yyyy-MM-dd HH:mm:ss"),
                    completedAt = DateTime.UtcNow.AddMinutes(-12).ToString("yyyy-MM-dd HH:mm:ss"),
                    duration = "3m 15s",
                    progress = 0,
                    result = "error",
                    logs = "Database connection timeout",
                    tags = new[] { "reports", "analytics" }
                },
                new
                {
                    id = "4",
                    workflow = "Backup System",
                    status = "completed",
                    startedAt = DateTime.UtcNow.AddHours(-1).ToString("yyyy-MM-dd HH:mm:ss"),
                    completedAt = DateTime.UtcNow.AddMinutes(-15).ToString("yyyy-MM-dd HH:mm:ss"),
                    duration = "45m 30s",
                    progress = 100,
                    result = "success",
                    logs = "Backup completed: 2.3GB saved",
                    tags = new[] { "backup", "database" }
                }
            };

            var response = new
            {
                executions = executions,
                totalCount = executions.Count,
                page = page,
                pageSize = pageSize,
                totalPages = 1
            };

            return Ok(response);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetExecutionStats()
        {
            // For now, return sample stats
            var stats = new
            {
                totalExecutions = 1247,
                successfulExecutions = 1156,
                failedExecutions = 45,
                runningExecutions = 2,
                avgDuration = "2.3s",
                successRate = 92.7
            };

            return Ok(stats);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExecutionById(string id)
        {
            // For now, return sample execution details
            var execution = new
            {
                id = id,
                workflow = "Data Processing Pipeline",
                status = "completed",
                startedAt = DateTime.UtcNow.AddMinutes(-30).ToString("yyyy-MM-dd HH:mm:ss"),
                completedAt = DateTime.UtcNow.AddMinutes(-29).ToString("yyyy-MM-dd HH:mm:ss"),
                duration = "1m 12s",
                progress = 100,
                result = "success",
                logs = "Processing completed successfully",
                tags = new[] { "data", "processing" },
                steps = new[]
                {
                    new { id = "1", name = "Data Validation", status = "completed", duration = "15s" },
                    new { id = "2", name = "Data Transformation", status = "completed", duration = "45s" },
                    new { id = "3", name = "Data Export", status = "completed", duration = "12s" }
                }
            };

            return Ok(execution);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelExecution(string id)
        {
            // For now, return success
            return Ok(new { message = "Execution cancelled successfully", id });
        }

        [HttpPost("{id}/retry")]
        public async Task<IActionResult> RetryExecution(string id)
        {
            // For now, return success
            return Ok(new { message = "Execution retry initiated", id });
        }
    }
} 