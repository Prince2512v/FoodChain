using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodSupplyChainAPI.Models
{
    public class RetailInventory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        [Required]
        public int RetailerId { get; set; }
        public User? Retailer { get; set; }

        public decimal TotalQuantity { get; set; }
        public decimal SoldQuantity { get; set; } = 0;
        public decimal RemainingQuantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } = 0;

        public string Status { get; set; } = "In Stock"; // In Stock, Low Stock, out of Stock
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
