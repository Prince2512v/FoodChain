using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FoodSupplyChainAPI.Blockchain;

namespace FoodSupplyChainAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly BlockchainService _blockchainService;

        public AdminController(ApplicationDbContext context, BlockchainService blockchainService)
        {
            _context = context;
            _blockchainService = blockchainService;
        }

        // ── User Management ────────────────────────────────────────

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            await LogAction("View Users", "Accessed the user management list");
            return Ok(await _context.Users.OrderByDescending(u => u.CreatedAt).ToListAsync());
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User model)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            string oldRole = user.Role;
            user.Name = model.Name;
            user.Role = model.Role;
            user.Status = model.Status;

            await _context.SaveChangesAsync();
            await LogAction("Update User", $"Updated user {user.Email}. Role: {oldRole} -> {user.Role}, Status: {user.Status}");
            
            return Ok(user);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            await LogAction("Delete User", $"Deleted user {user.Email}");
            
            return Ok(new { message = "User deleted successfully" });
        }

        [HttpPut("users/{id}/block")]
        public async Task<IActionResult> BlockUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Status = "Blocked";
            await _context.SaveChangesAsync();
            await LogAction("Block User", $"Blocked user {user.Email}");

            return Ok(new { message = "User blocked" });
        }

        [HttpPut("users/{id}/unblock")]
        public async Task<IActionResult> UnblockUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Status = "Active";
            await _context.SaveChangesAsync();
            await LogAction("Unblock User", $"Unblocked user {user.Email}");

            return Ok(new { message = "User unblocked" });
        }

        // ── Dashboard & Stats ───────────────────────────────────────

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalProducts = await _context.Products.CountAsync();
            var totalUsers = await _context.Users.CountAsync();
            var activeShipments = await _context.Shipments.CountAsync(s => s.Status == "In Transit");
            var completed = await _context.Products.CountAsync(p => p.Status == "Completed");
            var rejected = await _context.Products.CountAsync(p => p.IsRejected);

            // Fetch recent activities for the chart
            var last7Days = Enumerable.Range(0, 7)
                .Select(i => DateTime.UtcNow.Date.AddDays(-i))
                .OrderBy(d => d)
                .ToList();

            var chartData = last7Days.Select(date => new
            {
                Date = date.ToString("MMM dd"),
                Products = _context.Products.Count(p => p.Timestamp.Date == date),
                Transactions = _context.AuditLogs.Count(l => l.Timestamp.Date == date && l.Action.Contains("Blockchain")) 
                               + _context.BlockchainTransactions.Count(t => t.Timestamp.Date == date)
            }).ToList();

            return Ok(new
            {
                Summary = new { totalProducts, totalUsers, activeShipments, completed, rejected },
                ChartData = chartData
            });
        }

        // ── Monitoring ─────────────────────────────────────────────

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            // Fetch recorded transactions + dynamically extract from source tables
            var recorded = await _context.BlockchainTransactions.OrderByDescending(t => t.Timestamp).Take(50).ToListAsync();
            
            // To provide a rich "Day 1" experience, we'll also pull from the main product/processing hashes
            var harvests = await _context.Products
                .Where(p => !string.IsNullOrEmpty(p.BlockchainTxHash))
                .Select(p => new BlockchainTransaction { 
                    BatchId = p.BatchId, TxHash = p.BlockchainTxHash, Status = "Success", Role = "Farmer", Action = "Harvest", Timestamp = p.Timestamp 
                }).ToListAsync();

            var processing = await _context.Products
                .Where(p => !string.IsNullOrEmpty(p.ProcessingTxHash))
                .Select(p => new BlockchainTransaction { 
                    BatchId = p.BatchId, TxHash = p.ProcessingTxHash, Status = "Success", Role = "Processor", Action = "Process", Timestamp = p.Timestamp 
                }).ToListAsync();

            var all = recorded.Concat(harvests).Concat(processing)
                .OrderByDescending(t => t.Timestamp)
                .Take(100)
                .ToList();

            return Ok(all);
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs()
        {
            return Ok(await _context.AuditLogs.OrderByDescending(l => l.Timestamp).Take(100).ToListAsync());
        }

        // ── Settings ───────────────────────────────────────────────

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            return Ok(await _context.SystemSettings.ToListAsync());
        }

        [HttpPost("settings")]
        public async Task<IActionResult> UpdateSetting([FromBody] SystemSetting model)
        {
            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == model.Key);
            if (setting == null)
            {
                setting = new SystemSetting { Key = model.Key, Value = model.Value, Description = model.Description };
                _context.SystemSettings.Add(setting);
            }
            else
            {
                setting.Value = model.Value;
                setting.Description = model.Description;
                setting.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await LogAction("Update Setting", $"Updated system setting {model.Key}");
            
            return Ok(setting);
        }

        // ── Fraud Detection & Auditing ──────────────────────────────

        [HttpGet("fraud-alerts")]
        public async Task<IActionResult> GetFraudAlerts()
        {
            var alerts = await _context.FraudLogs
                .OrderByDescending(f => f.Timestamp)
                .Take(50)
                .ToListAsync();

            // Perform a quick real-time scan for duplicate BatchIds
            var duplicateBatchIds = await _context.Products
                .GroupBy(p => p.BatchId)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToListAsync();

            foreach (var bid in duplicateBatchIds)
            {
                if (!alerts.Any(a => a.BatchId == bid && a.IssueType == "DuplicateBatch"))
                {
                    _context.FraudLogs.Add(new FraudLog
                    {
                        BatchId = bid,
                        Severity = "High",
                        IssueType = "DuplicateBatch",
                        Description = "Multiple products found with the same Batch ID. Possible supply chain spoofing."
                    });
                }
            }
            await _context.SaveChangesAsync();
            
            return Ok(await _context.FraudLogs.OrderByDescending(f => f.Timestamp).Take(100).ToListAsync());
        }

        [HttpPost("audit/{batchId}")]
        public async Task<IActionResult> AuditProduct(string batchId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == batchId);
            if (product == null) return NotFound("Product not found");

            // 1. Verify Blockchain Integrity
            var onChain = await _blockchainService.GetProductHistoryAsync(batchId);
            bool tampered = false;

            // Simple check: compare DB hash vs Chain hash (for Initial Harvest)
            string dbBaseData = $"{product.BatchId}{product.ProductName}{product.CropType}";
            string calculatedHash = _blockchainService.CalculateHash(dbBaseData);

            if (onChain != null && onChain.TransactionHashes.Count > 0)
            {
                if (!onChain.TransactionHashes.Contains(calculatedHash))
                {
                    tampered = true;
                    _context.FraudLogs.Add(new FraudLog
                    {
                        BatchId = batchId,
                        Severity = "Critical",
                        IssueType = "BlockchainMismatch",
                        Description = $"Integrity check failed. Initial harvest hash in DB ({calculatedHash}) not found on Blockchain."
                    });
                }
            }

            if (tampered)
            {
                await _context.SaveChangesAsync();
                return Ok(new { status = "Warning", message = "Audit complete. Potential anomalies detected.", flaged = true });
            }

            return Ok(new { status = "Success", message = "Audit complete. Chain of custody is intact.", flaged = false });
        }

        // ── Helpers ──────────────────────────────────────────────

        private async Task LogAction(string action, string details)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var log = new AuditLog
            {
                UserId = userId != null ? int.Parse(userId) : null,
                Action = action,
                Details = details,
                IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                Timestamp = DateTime.UtcNow
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
