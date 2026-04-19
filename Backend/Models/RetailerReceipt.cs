using System;
using System.ComponentModel.DataAnnotations;

namespace FoodSupplyChainAPI.Models
{
    public class RetailerReceipt
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        [Required]
        public int RetailerId { get; set; }
        public User? Retailer { get; set; }

        public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string ConditionStatus { get; set; } = "Good"; // Good / Damaged / Tampered

        public string Remarks { get; set; } = string.Empty;

        public string BlockchainTxHash { get; set; } = string.Empty;
    }
}
