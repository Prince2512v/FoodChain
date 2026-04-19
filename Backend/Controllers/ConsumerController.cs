using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodSupplyChainAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsumerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ConsumerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /api/consumer/product/{batchId}
        [HttpGet("product/{batchId}")]
        public async Task<IActionResult> GetProduct(string batchId)
        {
            var product = await _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Processor)
                .Include(p => p.Retailer)
                .FirstOrDefaultAsync(p => p.BatchId == batchId);

            if (product == null) return NotFound("Product not found");

            return Ok(product);
        }

        // GET: /api/consumer/history/{batchId}
        [HttpGet("history/{batchId}")]
        public async Task<IActionResult> GetHistory(string batchId)
        {
            var product = await _context.Products
                .Include(p => p.Farmer)
                .FirstOrDefaultAsync(p => p.BatchId == batchId);

            if (product == null) return NotFound();

            var processing = await _context.ProcessingDetails.FirstOrDefaultAsync(pd => pd.ProductId == product.Id);
            var quality = await _context.QualityChecks.FirstOrDefaultAsync(qc => qc.ProductId == product.Id);
            var packaging = await _context.Packaging.FirstOrDefaultAsync(pk => pk.ProductId == product.Id);
            
            var shipments = await _context.Shipments
                .Include(s => s.Distributor)
                .Where(s => s.ProductId == product.Id)
                .OrderBy(s => s.CreatedAt)
                .ToListAsync();

            var shipmentIds = shipments.Select(s => s.Id).ToList();

            var shipmentIssues = await _context.ShipmentIssues
                .Where(si => shipmentIds.Contains(si.ShipmentId))
                .ToListAsync();

            var locationLogs = await _context.LocationLogs
                .Where(ll => shipmentIds.Contains(ll.ShipmentId))
                .OrderBy(ll => ll.Timestamp)
                .ToListAsync();

            var storageConditions = await _context.StorageConditions
                .Where(sc => shipmentIds.Contains(sc.ShipmentId))
                .OrderBy(sc => sc.Timestamp)
                .ToListAsync();

            var receipt = await _context.RetailerReceipts
                .FirstOrDefaultAsync(r => r.ProductId == product.Id);

            var feedbacks = await _context.Feedbacks
                .Where(f => f.BatchId == batchId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return Ok(new
            {
                Product = product,
                Processing = processing,
                QualityCheck = quality,
                Packaging = packaging,
                Shipments = shipments,
                ShipmentIssues = shipmentIssues,
                LocationLogs = locationLogs,
                StorageConditions = storageConditions,
                Receipt = receipt,
                Feedbacks = feedbacks
            });
        }

        // GET: /api/consumer/verify/{batchId}
        [HttpGet("verify/{batchId}")]
        public async Task<IActionResult> GetVerificationData(string batchId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == batchId);
            if (product == null) return NotFound();

            return Ok(new
            {
                BatchId = product.BatchId,
                OriginTxHash = product.BlockchainTxHash,
                ProcessingTxHash = product.ProcessingTxHash,
                RetailTxHash = product.RetailTxHash,
                // In a real app, we'd return hashes to compare, 
                // but since the frontend interacts with the contract directly, 
                // these TxHashes already provide proof.
            });
        }

        // POST: /api/consumer/feedback
        [HttpPost("feedback")]
        public async Task<IActionResult> SubmitFeedback([FromBody] Feedback feedback)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var productExists = await _context.Products.AnyAsync(p => p.BatchId == feedback.BatchId);
            if (!productExists) return BadRequest("Invalid Batch ID");

            feedback.CreatedAt = DateTime.UtcNow;
            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            // Update Product aggregate rating
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == feedback.BatchId);
            if (product != null)
            {
                var allFeedbacks = await _context.Feedbacks.Where(f => f.BatchId == feedback.BatchId).ToListAsync();
                product.ReviewCount = allFeedbacks.Count;
                product.Rating = (decimal)allFeedbacks.Average(f => f.Rating);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Feedback submitted successfully!", feedback, newRating = product?.Rating });
        }
    }
}
