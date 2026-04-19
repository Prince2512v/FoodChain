using Microsoft.AspNetCore.SignalR;

namespace FoodSupplyChainAPI.Hubs
{
    public class DashboardHub : Hub
    {
        public async Task SendActivityUpdate(string user, string action, string batchId)
        {
            await Clients.All.SendAsync("ReceiveActivity", user, action, batchId, DateTime.UtcNow);
        }

        public async Task NotifyNewIssue(string batchId, string issueType)
        {
            await Clients.All.SendAsync("ReceiveIssueAlert", batchId, issueType);
        }
    }
}
