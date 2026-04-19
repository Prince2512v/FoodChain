using System.ComponentModel.DataAnnotations;

namespace FoodSupplyChainAPI.Models
{
    public class QualityCheck
    {
        public int Id { get; set; }
        
        [Required]
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        
        [Required]
        public string Grade { get; set; } = string.Empty; // A, B, C
        
        public string MoistureLevel { get; set; } = string.Empty;
        
        public bool Passed { get; set; }
        
        public string Remarks { get; set; } = string.Empty;
    }
}
