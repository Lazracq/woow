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
            await Task.CompletedTask; // Placeholder for future implementation
            
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
            await Task.CompletedTask; // Placeholder for future implementation
            
            // For now, return sample notifications
            var notifications = new[]
            {
                new
                {
                    id = "notif-1",
                    type = "info",
                    title = "System Update",
                    message = "Workflow system updated to version 2.1.0",
                    timestamp = DateTime.UtcNow.AddHours(-2).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    read = false
                },
                new
                {
                    id = "notif-2",
                    type = "warning",
                    title = "High CPU Usage",
                    message = "System CPU usage is above 80%",
                    timestamp = DateTime.UtcNow.AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    read = false
                },
                new
                {
                    id = "notif-3",
                    type = "success",
                    title = "Backup Completed",
                    message = "Daily backup completed successfully",
                    timestamp = DateTime.UtcNow.AddMinutes(-30).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    read = true
                }
            };

            return Ok(notifications);
        }

        [HttpGet("recent-activity")]
        public async Task<IActionResult> GetRecentActivity()
        {
            await Task.CompletedTask; // Placeholder for future implementation
            
            // For now, return sample recent activity
            var activities = new[]
            {
                new
                {
                    id = "act-1",
                    type = "workflow_created",
                    user = "john.doe@example.com",
                    workflow = "Data Processing Pipeline",
                    timestamp = DateTime.UtcNow.AddMinutes(-15).ToString("yyyy-MM-ddTHH:mm:ssZ")
                },
                new
                {
                    id = "act-2",
                    type = "execution_completed",
                    user = "system",
                    workflow = "Email Notification System",
                    timestamp = DateTime.UtcNow.AddMinutes(-30).ToString("yyyy-MM-ddTHH:mm:ssZ")
                },
                new
                {
                    id = "act-3",
                    type = "workflow_updated",
                    user = "jane.smith@example.com",
                    workflow = "File Backup Workflow",
                    timestamp = DateTime.UtcNow.AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ssZ")
                }
            };

            return Ok(activities);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshDashboard()
        {
            await Task.CompletedTask; // Placeholder for future implementation
            
            // For now, return success
            return Ok(new { message = "Dashboard refreshed successfully" });
        }
    }
} 