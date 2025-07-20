using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace WorkflowSystem.API.Hubs
{
    public class DashboardHub : Hub
    {
        public async System.Threading.Tasks.Task JoinDashboardGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "dashboard");
        }

        public async System.Threading.Tasks.Task LeaveDashboardGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "dashboard");
        }

        public async System.Threading.Tasks.Task UpdateDashboardStats(object stats)
        {
            await Clients.Group("dashboard").SendAsync("DashboardStatsUpdated", stats);
        }

        public async System.Threading.Tasks.Task UpdateNotifications(List<object> notifications)
        {
            await Clients.Group("dashboard").SendAsync("NotificationsUpdated", notifications);
        }

        public async System.Threading.Tasks.Task WorkflowExecutionUpdated(object execution)
        {
            var notification = new
            {
                Id = "mock-id",
                Type = "success",
                Title = "Workflow Completed",
                Message = "Mock workflow completed successfully",
                Time = "just now",
                Icon = "CheckCircle",
                Color = "text-green-500",
                BgColor = "bg-green-500/10"
            };

            await Clients.Group("dashboard").SendAsync("NewNotification", notification);
        }
    }
} 