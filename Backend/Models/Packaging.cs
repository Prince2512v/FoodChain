using System;
using System.ComponentModel.DataAnnotations;

namespace FoodSupplyChainAPI.Models
{
    public class Packaging
    {
        public int Id { get; set; }
        
        [Required]
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        
        [Required]
        public string PackageType { get; set; } = string.Empty; // Bag, Box, etc.
        
        public string Weight { get; set; } = string.Empty;
        
        public string LabelInfo { get; set; } = string.Empty;
        
        public DateTime ExpiryDate { get; set; }
    }
}
