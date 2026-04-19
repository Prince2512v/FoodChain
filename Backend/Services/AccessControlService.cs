using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FoodSupplyChainAPI.Services
{
    public interface IAccessControlService
    {
        Task<(bool success, string message)> ValidateProductAction(int productId, int userId, string userRole, string action);
        Task LogUnauthorizedAccess(int? userId, string action, string details, string ipAddress);
    }

    public class AccessControlService : IAccessControlService
    {
        private readonly ApplicationDbContext _context;

        public AccessControlService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool success, string message)> ValidateProductAction(int productId, int userId, string userRole, string action)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return (false, "Product not found.");

            // 1. Role-based Ownership & Lifecycle Checks
            switch (userRole)
            {
                case "Farmer":
                    if (product.FarmerId != userId) return (false, "Access Denied: You do not own this product.");
                    if (action == "Update" && product.Status != "Created") 
                        return (false, $"Action Blocked: Cannot update product in '{product.Status}' state.");
                    break;

                case "Processor":
                    // Processors can only work on products that are 'Created' or currently 'Processing'
                    if (action == "Process" && product.Status != "Created")
                        return (false, $"Action Blocked: Product must be 'Created' to start processing. Current: '{product.Status}'.");
                    if (action == "QualityCheck" && product.Status != "Processing")
                        return (false, "Action Blocked: Quality check can only be performed while in 'Processing' state.");
                    if (action == "Package" && product.QualityStatus != "Passed")
                        return (false, "Action Blocked: Quality check must be 'Passed' before packaging.");
                    break;

                case "Distributor":
                    // Distributors only interact with Packaged products for 'Accept'
                    if (action == "Accept" && product.Status != "Packaged")
                        return (false, $"Action Blocked: Product must be 'Packaged' to be accepted for shipping. Current: '{product.Status}'.");
                    if (action == "Track" && product.Status != "In Transit")
                        return (false, "Action Blocked: Tracking updates only allowed for products 'In Transit'.");
                    break;

                case "Retailer":
                    // Retailers only interact with Delivered products
                    if (action == "Receive" && product.Status != "Delivered")
                        return (false, $"Action Blocked: Product must be 'Delivered' to be received. Current: '{product.Status}'.");
                    if (action == "MarkAvailable" && product.Status != "Received")
                        return (false, "Action Blocked: Product must be 'Received' before marking as 'Available for Sale'.");
                    break;

                case "Admin":
                    return (true, "Admin Override");

                default:
                    return (false, "Unknown Role Permissions.");
            }

            return (true, "Valid");
        }

        public async Task LogUnauthorizedAccess(int? userId, string action, string details, string ipAddress)
        {
            var log = new AuditLog
            {
                UserId = userId,
                Action = "Unauthorized Access Attempt",
                Details = $"[{action}] {details}",
                IPAddress = ipAddress,
                Timestamp = DateTime.UtcNow
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
