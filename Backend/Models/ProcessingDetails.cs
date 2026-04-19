using System;
using System.ComponentModel.DataAnnotations;

namespace FoodSupplyChainAPI.Models
{
    public class ProcessingDetails
    {
        public int Id { get; set; }
        
        [Required]
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        
        [Required]
        public string ProcessingType { get; set; } = string.Empty;
        
        public DateTime ProcessingDate { get; set; } = DateTime.UtcNow;
        
        public string Conditions { get; set; } = string.Empty;
        
        public string Notes { get; set; } = string.Empty;
    }
}
