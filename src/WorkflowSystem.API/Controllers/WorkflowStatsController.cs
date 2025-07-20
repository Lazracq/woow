using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace WorkflowSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkflowStatsController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetWorkflowStats()
        {
            // For now, return sample data
            var stats = new
            {
                totalWorkflows = 5,
                activeWorkflows = 4,
                avgDuration = "1.2s",
                successRate = "94.2%"
            };

            return Ok(stats);
        }
    }
} 