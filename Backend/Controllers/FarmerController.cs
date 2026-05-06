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
    [Authorize(Roles = "Farmer")]
    public class FarmerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAccessControlService _accessControl;

        public FarmerController(ApplicationDbContext context, IAccessControlService accessControl)
        {
            _context = context;
            _accessControl = accessControl;
        }

        // POST /api/farmer/product
        [HttpPost("product")]
        public async Task<IActionResult> AddProduct([FromBody] DTOs.ProductCreateDto dto)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var product = new Product
            {
                ProductName = dto.ProductName,
                CropType = dto.CropType,
                Quantity = dto.Quantity,
                Unit = dto.Unit,
                HarvestDate = dto.HarvestDate,
                FarmingMethod = dto.FarmingMethod,
                FertilizerUsed = dto.FertilizerUsed,
                Notes = dto.Notes,
                LocationLat = dto.LocationLat,
                LocationLong = dto.LocationLong,
                Address = dto.Address,
                BatchId = dto.BatchId,
                ImageUrl = dto.ImageUrl,
                BlockchainTxHash = dto.BlockchainTxHash,
                FarmerId = userId,
                Timestamp = DateTime.UtcNow,
                Status = "Created",
                QRCodeBase64 = string.Empty, // Will be generated if needed later
                ProcessingTxHash = string.Empty,
                RetailTxHash = string.Empty
            };

            try
            {
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                var innerError = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { message = $"Database Save Failed: {innerError}" });
            }

            try
            {
                await LogAction("Harvest Logged", $"Farmer created new harvest: {product.ProductName} ({product.BatchId})");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Logging failed: {ex.Message}");
            }

            return Ok(product);
        }

        // GET /api/farmer/products
        [HttpGet("products")]
        public async Task<IActionResult> GetFarmerProducts()
        {
            var userId = GetUserId();
            var products = await _context.Products
                .Where(p => p.FarmerId == userId)
                .OrderByDescending(p => p.Timestamp)
                .ToListAsync();

            return Ok(products);
        }

        // PUT /api/farmer/product/{id}
        [HttpPut("product/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            var userId = GetUserId();
            var (success, message) = await _accessControl.ValidateProductAction(id, userId, "Farmer", "Update");

            if (!success) {
                await _accessControl.LogUnauthorizedAccess(userId, "Farmer Update Attempt", message, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown");
                return message.Contains("Denied") ? Forbid(message) : BadRequest(message);
            }

            // Re-fetch the product from DB for updating.
            // ValidateProductAction already verifies existence, but we re-fetch
            // for safety — FindAsync is cached by EF Core within the same request scope.
            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null) return NotFound("Product not found.");

            existingProduct.ProductName = updatedProduct.ProductName;
            existingProduct.CropType = updatedProduct.CropType;
            existingProduct.Quantity = updatedProduct.Quantity;
            existingProduct.Unit = updatedProduct.Unit;
            existingProduct.HarvestDate = updatedProduct.HarvestDate;
            existingProduct.FarmingMethod = updatedProduct.FarmingMethod;
            existingProduct.FertilizerUsed = updatedProduct.FertilizerUsed;
            existingProduct.Notes = updatedProduct.Notes;
            existingProduct.LocationLat = updatedProduct.LocationLat;
            existingProduct.LocationLong = updatedProduct.LocationLong;
            existingProduct.Address = updatedProduct.Address;
            existingProduct.BlockchainTxHash = updatedProduct.BlockchainTxHash;

            await _context.SaveChangesAsync();
            return Ok(existingProduct);
        }

        // POST /api/blockchain/upload
        [HttpPost("blockchain/upload")]
        public async Task<IActionResult> UpdateBlockchainHash([FromBody] BlockchainUploadDto model)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == model.BatchId);
            if (product == null) return NotFound();

            product.BlockchainTxHash = model.TxHash;
            await _context.SaveChangesAsync();

            await LogTransaction(product.BatchId, model.TxHash, "Harvest", "Farmer");
            await LogAction("Blockchain Verification", $"Farmer verified batch {product.BatchId} on-chain. Tx: {model.TxHash}");

            return Ok(new { message = "Blockchain hash updated successfully" });
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
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }

    public class BlockchainUploadDto
    {
        public string BatchId { get; set; } = string.Empty;
        public string TxHash { get; set; } = string.Empty;
    }
}
