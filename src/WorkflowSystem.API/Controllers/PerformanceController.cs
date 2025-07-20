using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WorkflowSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerformanceController : ControllerBase
    {
        [HttpGet("metrics")]
        public async Task<IActionResult> GetPerformanceMetrics()
        {
            // For now, return sample performance metrics
            var metrics = new
            {
                cpuUsage = 45.2,
                memoryUsage = 67.8,
                activeConnections = 12,
                requestsPerSecond = 23.4,
                averageResponseTime = 125.6,
                errorRate = 0.5
            };

            return Ok(metrics);
        }

        [HttpGet("executions/recent")]
        public async Task<IActionResult> GetRecentExecutions([FromQuery] int count = 100)
        {
            // For now, return sample recent executions
            var executions = new List<object>
            {
                new
                {
                    id = "exec-1",
                    workflowName = "Data Processing Pipeline",
                    status = "Completed",
                    startTime = DateTime.UtcNow.AddMinutes(-30).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    duration = 45.2,
                    progress = 100
                },
                new
                {
                    id = "exec-2",
                    workflowName = "Email Notification System",
                    status = "Running",
                    startTime = DateTime.UtcNow.AddMinutes(-5).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    duration = 12.8,
                    progress = 65
                },
                new
                {
                    id = "exec-3",
                    workflowName = "File Backup Workflow",
                    status = "Failed",
                    startTime = DateTime.UtcNow.AddMinutes(-15).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    duration = 8.3,
                    progress = 45
                }
            };

            return Ok(executions);
        }
    }
} 