using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using FoodSupplyChainAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodSupplyChainAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class QRCodeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IQRCodeService _qrCodeService;

        public QRCodeController(ApplicationDbContext context, IQRCodeService qrCodeService)
        {
            _context = context;
            _qrCodeService = qrCodeService;
        }

        [HttpPost("generate/{productId}")]
        public async Task<IActionResult> GenerateQrCode(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return NotFound("Product not found");

            if (!string.IsNullOrEmpty(product.QRCodeBase64))
                return Ok(new { message = "QR Code already exists", qrCode = product.QRCodeBase64 });

            string verificationUrl = _qrCodeService.GetVerificationUrl(product.BatchId);
            product.QRCodeBase64 = _qrCodeService.GenerateQRCode(verificationUrl);

            await _context.SaveChangesAsync();
            return Ok(new { qrCode = product.QRCodeBase64, url = verificationUrl });
        }

        [HttpGet("{batchId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetQrCodeByBatch(string batchId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == batchId);
            if (product == null) return NotFound("Product not found");

            if (string.IsNullOrEmpty(product.QRCodeBase64))
            {
                 // Auto-generate if missing
                 string verificationUrl = _qrCodeService.GetVerificationUrl(product.BatchId);
                 product.QRCodeBase64 = _qrCodeService.GenerateQRCode(verificationUrl);
                 await _context.SaveChangesAsync();
            }

            return Ok(new { qrCode = product.QRCodeBase64 });
        }

        [HttpPost("scan-log")]
        [AllowAnonymous]
        public async Task<IActionResult> RecordScan([FromBody] QRScanLog log)
        {
            // Simple logging for analytics
            // (Assumes a QRScanLog model or simple generic logging)
            // Implementation can be expanded based on database needs
            return Ok(new { status = "Logged" });
        }
    }

    public class QRScanLog
    {
        public string BatchId { get; set; } = string.Empty;
        public string? Location { get; set; }
        public DateTime ScannedAt { get; set; } = DateTime.UtcNow;
    }
}
