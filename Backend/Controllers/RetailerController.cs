using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FoodSupplyChainAPI.Services;

namespace FoodSupplyChainAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Retailer")]
    public class RetailerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAccessControlService _accessControl;

        public RetailerController(ApplicationDbContext context, IAccessControlService accessControl)
        {
            _context = context;
            _accessControl = accessControl;
        }

        // 1. GET /api/retailer/pending-shipments
        [HttpGet("pending-shipments")]
        public async Task<IActionResult> GetPendingShipments()
        {
            var shipments = await _context.Shipments
                .Include(s => s.Product)
                .Include(s => s.Distributor)
                .Where(s => s.Status == "Delivered" && s.Product != null && s.Product.RetailerId == null)
                .Select(s => new
                {
                    s.Id,
                    s.ProductId,
                    s.Status,
                    s.DeliveryDate,
                    DistributorName = s.Distributor != null ? s.Distributor.Name : "N/A",
                    Product = s.Product != null ? new
                    {
                        s.Product.BatchId,
                        s.Product.ProductName,
                        s.Product.CropType,
                        s.Product.Quantity,
                        s.Product.Unit
                    } : null
                })
                .ToListAsync();

            return Ok(shipments);
        }

        // 2. POST /api/retailer/receive
        [HttpPost("receive")]
        public async Task<IActionResult> ReceiveProduct([FromBody] ReceiveProductDto dto)
        {
            int retailerId = GetUserId();
            var (success, message) = await _accessControl.ValidateProductAction(dto.ProductId, retailerId, "Retailer", "Receive");
            if (!success) {
                await _accessControl.LogUnauthorizedAccess(retailerId, "Retailer Receive Attempt", message, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown");
                return BadRequest(message);
            }
            
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null) return NotFound("Product not found");

            if (product.Status != "Delivered")
                return BadRequest("Product status must be 'Delivered' to be received.");

            // 1. Record the receipt
            var receipt = new RetailerReceipt
            {
                ProductId = dto.ProductId,
                RetailerId = retailerId,
                ConditionStatus = dto.ConditionStatus,
                Remarks = dto.Remarks,
                BlockchainTxHash = dto.BlockchainTxHash,
                ReceivedDate = DateTime.UtcNow
            };
            _context.RetailerReceipts.Add(receipt);

            // 2. Update Product status
            product.Status = dto.ConditionStatus == "Rejected" ? "Rejected" : "Received";
            product.RetailerId = retailerId;
            product.RetailTxHash = dto.BlockchainTxHash;

            // 3. Add to inventory if not rejected
            if (dto.ConditionStatus != "Rejected")
            {
                var inventory = new RetailInventory
                {
                    ProductId = dto.ProductId,
                    RetailerId = retailerId,
                    TotalQuantity = product.Quantity,
                    RemainingQuantity = product.Quantity,
                    Status = "In Stock",
                    LastUpdated = DateTime.UtcNow
                };
                _context.RetailInventory.Add(inventory);
            }

            await _context.SaveChangesAsync();

            await LogTransaction(product.BatchId, dto.BlockchainTxHash, "Retail Receipt", "Retailer");
            await LogAction("Product Received", $"Retailer received batch {product.BatchId}. Status: {product.Status}");

            return Ok(new { message = "Product received and processed.", productStatus = product.Status });
        }

        // 3. GET /api/retailer/inventory
        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory()
        {
            int retailerId = GetUserId();
            var inventory = await _context.RetailInventory
                .Include(i => i.Product)
                .Where(i => i.RetailerId == retailerId)
                .Select(i => new {
                    i.Id,
                    i.Price,
                    i.TotalQuantity,
                    i.SoldQuantity,
                    i.RemainingQuantity,
                    i.Status,
                    ProductName = i.Product != null ? i.Product.ProductName : "Unknown",
                    BatchId = i.Product != null ? i.Product.BatchId : "N/A"
                })
                .ToListAsync();

            return Ok(inventory);
        }

        // 4. PUT /api/retailer/inventory/{id}
        [HttpPut("inventory/{id}")]
        public async Task<IActionResult> UpdateInventory(int id, [FromBody] UpdateInventoryDto dto)
        {
            var item = await _context.RetailInventory.FindAsync(id);
            if (item == null) return NotFound();

            if (item.RetailerId != GetUserId()) return Forbid();

            item.Price = dto.Price;
            item.SoldQuantity = dto.SoldQuantity;
            item.RemainingQuantity = item.TotalQuantity - dto.SoldQuantity;
            item.Status = item.RemainingQuantity <= 0 ? "Out of Stock" : 
                          item.RemainingQuantity < 5 ? "Low Stock" : "In Stock";
            item.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await LogAction("Inventory Updated", $"Retailer updated inventory for batch {item.Product?.BatchId}. Stock: {item.RemainingQuantity}");
            return Ok(new { message = "Inventory updated.", item });
        }

        // 5. POST /api/retailer/mark-available/{productId}
        [HttpPut("mark-available/{productId}")]
        public async Task<IActionResult> MarkAvailable(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return NotFound();

            if (product.Status != "Received")
                return BadRequest("Product must be in 'Received' status to be marked available.");

            product.Status = "Available for Sale";
            await _context.SaveChangesAsync();
            await LogAction("Product Available", $"Retailer marked batch {product.BatchId} as available for sale.");
            return Ok(new { message = "Product is now available for sale." });
        }

        // 6. GET /api/retailer/history/{batchId}
        [HttpGet("history/{batchId}")]
        public async Task<IActionResult> GetTraceabilityHistory(string batchId)
        {
            var product = await _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Processor)
                .FirstOrDefaultAsync(p => p.BatchId == batchId);

            if (product == null) return NotFound();

            var shipment = await _context.Shipments
                .Include(s => s.Distributor)
                .Include(s => s.LocationLogs)
                .Include(s => s.StorageConditions)
                .FirstOrDefaultAsync(s => s.ProductId == product.Id);

            var receipt = await _context.RetailerReceipts
                .Include(r => r.Retailer)
                .FirstOrDefaultAsync(r => r.ProductId == product.Id);

            return Ok(new {
                Product = product,
                Farmer = product.Farmer?.Name,
                Processor = product.Processor?.Name,
                Distributor = shipment?.Distributor?.Name,
                Retailer = receipt?.Retailer?.Name,
                Shipment = shipment,
                Receipt = receipt
            });
        }

        private async Task LogAction(string action, string details)
        {
            var userId = GetUserId();
            var log = new AuditLog
            {
                UserId = userId > 0 ? userId : null,
                Action = action,
                Details = details,
                IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                Timestamp = DateTime.UtcNow
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        private async Task LogTransaction(string batchId, string txHash, string action, string role)
        {
            var tx = new BlockchainTransaction
            {
                BatchId = batchId,
                TxHash = txHash,
                Action = action,
                Role = role,
                Status = "Success",
                Timestamp = DateTime.UtcNow
            };
            _context.BlockchainTransactions.Add(tx);
            await _context.SaveChangesAsync();
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }
    }

    // DTOs
    public class ReceiveProductDto
    {
        public int ProductId { get; set; }
        public string ConditionStatus { get; set; } = "Good";
        public string Remarks { get; set; } = string.Empty;
        public string BlockchainTxHash { get; set; } = string.Empty;
    }

    public class UpdateInventoryDto
    {
        public decimal Price { get; set; }
        public decimal SoldQuantity { get; set; }
    }
}
