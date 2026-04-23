using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FoodSupplyChainAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int userId = int.Parse(userIdStr);
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            IQueryable<Product> productsQuery = _context.Products;
            IQueryable<Shipment> shipmentsQuery = _context.Shipments;

            // Role-based filtering
            if (role == "Farmer") {
                productsQuery = productsQuery.Where(p => p.FarmerId == userId);
            } else if (role == "Processor") {
                productsQuery = productsQuery.Where(p => p.ProcessorId == userId);
            } else if (role == "Distributor") {
                shipmentsQuery = shipmentsQuery.Where(s => s.DistributorId == userId);
            } else if (role == "Retailer") {
                productsQuery = productsQuery.Where(p => p.RetailerId == userId);
            }

            var totalStats = new {
                Total = await productsQuery.CountAsync(),
                Processing = await productsQuery.CountAsync(p => p.Status == "Processing"),
                Packaged = await productsQuery.CountAsync(p => p.Status == "Packaged"),
                InTransit = role == "Distributor" 
                    ? await shipmentsQuery.CountAsync(s => s.Status == "In Transit")
                    : await productsQuery.CountAsync(p => p.Status == "In Transit"),
                Delivered = await productsQuery.CountAsync(p => p.Status == "Completed" || p.Status == "Delivered"),
                Available = await productsQuery.CountAsync(p => p.Status == "Available"),
                Rejected = await productsQuery.CountAsync(p => p.IsRejected || p.Status == "Rejected")
            };

            return Ok(totalStats);
        }

        [HttpGet("performance")]
        public async Task<IActionResult> GetPerformance()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = int.Parse(userIdStr ?? "0");

            var last7Days = Enumerable.Range(0, 7)
                .Select(i => DateTime.UtcNow.Date.AddDays(-i))
                .OrderBy(d => d)
                .ToList();

            var performanceData = last7Days.Select(date => new
            {
                Date = date.ToString("MMM dd"),
                Count = _context.Products.Count(p => 
                    p.Timestamp.Date == date && 
                    (role == "Admin" || (role == "Farmer" && p.FarmerId == userId) || (role == "Processor" && p.ProcessorId == userId))
                ),
                Issues = _context.ShipmentIssues.Count(i => i.Timestamp.Date == date)
            }).ToList();

            return Ok(performanceData);
        }

        [HttpGet("recent-activities")]
        public async Task<IActionResult> GetRecentActivities([FromQuery] int limit = 10)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(role)) return Unauthorized("Role claim missing");

            var query = _context.BlockchainTransactions
                .Where(t => role == "Admin" || t.Role.ToLower() == role.ToLower())
                .OrderByDescending(t => t.Timestamp);

            var activities = limit > 0 
                ? await query.Take(limit).ToListAsync() 
                : await query.ToListAsync();

            return Ok(activities);
        }

        [HttpGet("issues")]
        public async Task<IActionResult> GetAlerts()
        {
            var issues = await _context.ShipmentIssues
                .Include(i => i.Shipment)
                .OrderByDescending(i => i.Timestamp)
                .Take(5)
                .ToListAsync();

            return Ok(issues);
        }
    }
}
