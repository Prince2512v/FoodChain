using System;
using System.ComponentModel.DataAnnotations;

namespace FoodSupplyChainAPI.Models
{
    public class Product
    {
        public int Id { get; set; }
        
        [Required]
        public string ProductName { get; set; } = string.Empty;
        
        [Required]
        public string CropType { get; set; } = string.Empty;
        
        [Required]
        public decimal Quantity { get; set; }
        
        [Required]
        public string Unit { get; set; } = string.Empty; // kg, tons, etc.

        public DateTime HarvestDate { get; set; } = DateTime.UtcNow;
        
        public string FarmingMethod { get; set; } = "Conventional"; // Organic / Conventional
        
        public string FertilizerUsed { get; set; } = string.Empty;
        
        public string Notes { get; set; } = string.Empty;

        // Farm Location
        public string LocationLat { get; set; } = string.Empty;
        public string LocationLong { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        // Supply Chain Details
        [Required]
        public string BatchId { get; set; } = string.Empty;

        public string QRCodeBase64 { get; set; } = string.Empty;
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public string BlockchainTxHash { get; set; } = string.Empty;
        
        public string Status { get; set; } = "Created"; // Created, Processing, Completed

        // Quality Control (used by other modules)
        public string QualityStatus { get; set; } = "Pending";
        public bool IsRejected { get; set; } = false;

        // Ownership
        public int? FarmerId { get; set; }
        public User? Farmer { get; set; }

        public int? ProcessorId { get; set; }
        public User? Processor { get; set; }

        public string ProcessingTxHash { get; set; } = string.Empty;

        // Retailer Details
        public int? RetailerId { get; set; }
        public User? Retailer { get; set; }

        public string RetailTxHash { get; set; } = string.Empty;

        // Advanced Bonus Features
        public string? ImageUrl { get; set; } // Base64 or URL
        public decimal Rating { get; set; } = 0;
        public int ReviewCount { get; set; } = 0;
    }
}
