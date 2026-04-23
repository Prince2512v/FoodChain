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
    [Authorize(Roles = "Processor")]
    public class ProcessorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAccessControlService _accessControl;

        public ProcessorController(ApplicationDbContext context, IAccessControlService accessControl)
        {
            _context = context;
            _accessControl = accessControl;
        }

        [HttpGet("incoming-products")]
        public async Task<IActionResult> GetIncomingProducts()
        {
            var userId = GetUserId();
            var products = await _context.Products
                .Include(p => p.Farmer)
                .Where(p => (!p.IsRejected) && (
                    (p.Status == "Created") || 
                    (p.ProcessorId == userId && (p.Status == "Processing" || p.QualityStatus == "Passed"))
                ))
                .Select(p => new
                {
                    p.Id,
                    p.BatchId,
                    p.ProductName,
                    p.CropType,
                    p.Quantity,
                    p.Unit,
                    p.Status,
                    p.QualityStatus,
                    p.Timestamp,
                    Farmer = new { Name = p.Farmer != null ? p.Farmer.Name : "Unknown" }
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProcessorProducts()
        {
            var userId = GetUserId();
            var products = await _context.Products
                .Include(p => p.Farmer)
                .Where(p => p.ProcessorId == userId || (p.ProcessorId == null && p.Status == "Created"))
                .OrderByDescending(p => p.Timestamp)
                .ToListAsync();

            return Ok(products);
        }
        public async Task<IActionResult> TestIncomingProducts()
        {
            try {
                var products = await _context.Products
                    .Include(p => p.Farmer)
                    .Where(p => (!p.IsRejected) && (
                        (p.Status == "Created") || 
                        (p.ProcessorId == 2 && (p.Status == "Processing" || p.QualityStatus == "Passed"))
                    ))
                    .ToListAsync();
                return Ok(products);
            } catch (Exception ex) {
                return StatusCode(500, ex.ToString());
            }
        }

        // POST: /api/processor/process
        [HttpPost("process")]
        public async Task<IActionResult> StartProcessing([FromBody] ProcessingDetails details)
        {
            var userId = GetUserId();
            var (success, message) = await _accessControl.ValidateProductAction(details.ProductId, userId, "Processor", "Process");
            if (!success) {
                await _accessControl.LogUnauthorizedAccess(userId, "Processor Start Attempt", message, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown");
                return BadRequest(message);
            }

            var product = await _context.Products.FindAsync(details.ProductId);
            if (product == null) return NotFound("Product not found");

            details.ProcessingDate = DateTime.UtcNow;
            _context.ProcessingDetails.Add(details);

            product.Status = "Processing";
            product.ProcessorId = userId; // Reuse already-computed value (avoid double claim lookup)

            await _context.SaveChangesAsync();
            await LogAction("Process Started", $"Processor started processing batch {product.BatchId}");
            return Ok(new { message = "Processing started", details });
        }

        // POST: /api/processor/quality-check
        [HttpPost("quality-check")]
        public async Task<IActionResult> PerformQualityCheck([FromBody] QualityCheck check)
        {
            var userId = GetUserId();
            var (success, message) = await _accessControl.ValidateProductAction(check.ProductId, userId, "Processor", "QualityCheck");
            if (!success) {
                await _accessControl.LogUnauthorizedAccess(userId, "Processor QualityCheck Attempt", message, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown");
                return BadRequest(message);
            }
            
            var product = await _context.Products.FindAsync(check.ProductId);

            _context.QualityChecks.Add(check);

            if (!check.Passed)
            {
                product.Status = "Rejected";
                product.IsRejected = true;
                product.QualityStatus = "Failed";
            }
            else
            {
                product.QualityStatus = "Passed";
            }

            await _context.SaveChangesAsync();
            await LogAction("Quality Check", $"Processor performed quality check on batch {product.BatchId}. Result: {product.QualityStatus}");
            return Ok(new { message = "Quality check recorded", check });
        }

        // POST: /api/processor/packaging
        [HttpPost("packaging")]
        public async Task<IActionResult> AddPackaging([FromBody] Packaging packaging)
        {
            var product = await _context.Products.FindAsync(packaging.ProductId);
            if (product == null) return NotFound("Product not found");

            if (product.QualityStatus != "Passed") return BadRequest("Quality check must be passed before packaging");

            _context.Packaging.Add(packaging);
            product.Status = "Packaged";

            await _context.SaveChangesAsync();
            await LogAction("Packaging Added", $"Processor added packaging details for batch {product.BatchId}");
            return Ok(new { message = "Packaging details added", packaging });
        }

        // PUT: /api/processor/status/{id}
        [HttpPut("status/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Status = status;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Status updated", status });
        }

        // POST: /api/blockchain/process
        [HttpPost("/api/blockchain/process")]
        public async Task<IActionResult> RecordBlockchainData([FromBody] BlockchainProcessDto model)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == model.BatchId);
            if (product == null) return NotFound();

            product.ProcessingTxHash = model.TxHash;
            // NOTE: Status stays as "Processing" — the workflow is:
            // Processing → QualityCheck (Passed) → Packaging → 'Packaged'
            // The Distributor then picks up products in 'Packaged' status.
            // Do NOT set 'Completed' here — that bypasses the Packaging step.
            // Status will be advanced to 'Packaged' by the /api/processor/packaging endpoint.

            await _context.SaveChangesAsync();
            await LogTransaction(product.BatchId, model.TxHash, "Processing", "Processor");
            await LogAction("Blockchain Verification", $"Processor verified batch {product.BatchId} on-chain. Tx: {model.TxHash}");
            return Ok(new { message = "Blockchain transaction recorded", txHash = model.TxHash });
        }

        // GET: /api/processor/history/{batchId}
        [HttpGet("history/{batchId}")]
        public async Task<IActionResult> GetProductHistory(string batchId)
        {
            var product = await _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Processor)
                .FirstOrDefaultAsync(p => p.BatchId == batchId);

            if (product == null) return NotFound();

            var processing = await _context.ProcessingDetails.FirstOrDefaultAsync(pd => pd.ProductId == product.Id);
            var quality = await _context.QualityChecks.FirstOrDefaultAsync(qc => qc.ProductId == product.Id);
            var packaging = await _context.Packaging.FirstOrDefaultAsync(pk => pk.ProductId == product.Id);

            return Ok(new
            {
                Product = product,
                Processing = processing,
                Quality = quality,
                Packaging = packaging
            });
        }

        // POST: /api/processor/reject/{id}
        [HttpPost("reject/{id}")]
        public async Task<IActionResult> RejectProduct(int id, [FromBody] string reason)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Status = "Rejected";
            product.IsRejected = true;
            product.Notes += $"\nRejection Reason: {reason}";

            await _context.SaveChangesAsync();
            await LogAction("Product Rejected", $"Processor rejected batch {product.BatchId}. Reason: {reason}");
            return Ok(new { message = "Product rejected" });
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

    public class BlockchainProcessDto
    {
        public string BatchId { get; set; } = string.Empty;
        public string TxHash { get; set; } = string.Empty;
    }
}
