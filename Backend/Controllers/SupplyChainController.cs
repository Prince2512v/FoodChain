using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using FoodSupplyChainAPI.Blockchain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FoodSupplyChainAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupplyChainController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly BlockchainService _blockchainService;

        public SupplyChainController(ApplicationDbContext context, BlockchainService blockchainService)
        {
            _context = context;
            _blockchainService = blockchainService;
        }

        [HttpPost("add-product")]
        public async Task<IActionResult> AddProduct([FromBody] Product product)
        {
            // 1. Save to SQL
            product.Timestamp = DateTime.UtcNow;
            product.Status = "Created";
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // 2. Generate Hash (BatchId + Name + Origin)
            string dataString = $"{product.BatchId}{product.ProductName}{product.CropType}";
            string dataHash = _blockchainService.CalculateHash(dataString);

            // 3. Store in Blockchain
            string txHash = await _blockchainService.AddProductAsync(product.BatchId, dataHash);

            // 4. Log Transaction
            var txLog = new BlockchainTransaction
            {
                BatchId = product.BatchId,
                TxHash = txHash,
                Role = "Farmer",
                Status = "Success",
                Action = "AddProduct",
                Timestamp = DateTime.UtcNow
            };
            _context.BlockchainTransactions.Add(txLog);
            await _context.SaveChangesAsync();

            return Ok(new { product, txHash });
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessProduct(string batchId, string status, string processingDetails)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == batchId);
            if (product == null) return NotFound("Product not found");

            product.Status = status;
            await _context.SaveChangesAsync();

            // Hash: BatchId + Status + Details
            string dataHash = _blockchainService.CalculateHash($"{batchId}{status}{processingDetails}");
            string txHash = await _blockchainService.ProcessProductAsync(batchId, status, dataHash);

            _context.BlockchainTransactions.Add(new BlockchainTransaction
            {
                BatchId = batchId,
                TxHash = txHash,
                Role = "Processor",
                Status = "Success",
                Action = "Process",
                Timestamp = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            return Ok(new { txHash });
        }

        [HttpPost("shipment")]
        public async Task<IActionResult> ShipmentUpdate(string batchId, string status, string location)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == batchId);
            if (product == null) return NotFound("Product not found");

            product.Status = status;
            await _context.SaveChangesAsync();

            // Hash: BatchId + Status + Location
            string dataHash = _blockchainService.CalculateHash($"{batchId}{status}{location}");
            string txHash = await _blockchainService.UpdateShipmentAsync(batchId, status, dataHash);

            _context.BlockchainTransactions.Add(new BlockchainTransaction
            {
                BatchId = batchId,
                TxHash = txHash,
                Role = "Distributor",
                Status = "Success",
                Action = "ShipmentUpdate",
                Timestamp = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            return Ok(new { txHash });
        }

        [HttpPost("receive")]
        public async Task<IActionResult> ReceiveProduct(string batchId, string status, string receptionNotes)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == batchId);
            if (product == null) return NotFound("Product not found");

            product.Status = status;
            await _context.SaveChangesAsync();

            string dataHash = _blockchainService.CalculateHash($"{batchId}{status}{receptionNotes}");
            string txHash = await _blockchainService.ReceiveProductAsync(batchId, status, dataHash);

            _context.BlockchainTransactions.Add(new BlockchainTransaction
            {
                BatchId = batchId,
                TxHash = txHash,
                Role = "Retailer",
                Status = "Success",
                Action = "Receive",
                Timestamp = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            return Ok(new { txHash });
        }

        [HttpGet("history/{batchId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetHistory(string batchId)
        {
            var onChainData = await _blockchainService.GetProductHistoryAsync(batchId);
            var dbHistory = await _context.BlockchainTransactions
                .Where(t => t.BatchId == batchId)
                .OrderBy(t => t.Timestamp)
                .ToListAsync();

            return Ok(new { onChainData, dbHistory });
        }

        [HttpGet("verify/{batchId}")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyIntegrity(string batchId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == batchId);
            if (product == null) return NotFound("Product not found");

            // 1. Get last stored hash for this product from Blockchain
            var onChainData = await _blockchainService.GetProductHistoryAsync(batchId);
            if (onChainData == null || onChainData.TransactionHashes.Count == 0) 
                 return BadRequest("No blockchain records found for this product.");

            string lastOnChainHash = onChainData.TransactionHashes[onChainData.TransactionHashes.Count - 1];

            // 2. Re-calculate hash from DB (logic depends on current status)
            // For simplicity in this demo, we use a mapping or just the base data
            // In a production app, you'd store the 'input string' used for hashing in SQL too.
            string dbDataString = $"{product.BatchId}{product.ProductName}{product.CropType}";
            if (product.Status != "Created") {
                // If not created, integrity verification needs the specific stage data.
                // Here we verify against the initial creation as an example.
                // A better approach is storing the HashInput in SQL Transactions.
            }
            
            string calculatedHash = _blockchainService.CalculateHash(dbDataString);

            // 3. Compare
            // NOTE: This comparison is specifically for the 'Creation' hash in this example logic.
            // For full lifecycle verification, you would iterate through the hashes[].
            bool isValid = onChainData.TransactionHashes.Contains(calculatedHash);

            return Ok(new { 
                BatchId = batchId,
                IsValid = isValid,
                OnChainHashes = onChainData.TransactionHashes,
                CurrentCalculatedHash = calculatedHash,
                Message = isValid ? "Data Integrity Verified" : "Data Tampering Detected!"
            });
        }
    }
}
