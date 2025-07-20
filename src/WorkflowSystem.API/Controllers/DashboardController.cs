using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WorkflowSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // For now, return sample data
            var stats = new
            {
                totalWorkflows = 5,
                runningExecutions = 2,
                successRate = 94.2,
                avgExecutionTime = 1.2,
                systemHealth = new
                {
                    apiService = new { status = "Healthy", uptime = "2d 14h 32m", port = "5776" },
                    workerService = new { status = "Healthy", uptime = "2d 14h 32m", workers = "4" },
                    database = new { status = "Healthy", uptime = "2d 14h 32m", connections = "12" }
                }
            };

            return Ok(stats);
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            // For now, return sample notifications
            var notifications = new List<object>
            {
                new
                {
                    id = "1",
                    title = "Workflow Completed",
                    message = "Data Processing Pipeline completed successfully",
                    type = "success",
                    timestamp = DateTime.UtcNow.AddMinutes(-5).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    read = false
                },
                new
                {
                    id = "2",
                    title = "System Alert",
                    message = "High CPU usage detected",
                    type = "warning",
                    timestamp = DateTime.UtcNow.AddMinutes(-15).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    read = true
                },
                new
                {
                    id = "3",
                    title = "New Workflow Created",
                    message = "Email Notification System workflow created",
                    type = "info",
                    timestamp = DateTime.UtcNow.AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    read = false
                }
            };

            return Ok(notifications);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshDashboard()
        {
            // For now, just return success
            return Ok(new { message = "Dashboard refreshed successfully" });
        }
    }
} 