using System;

namespace FoodSupplyChainAPI.Models
{
    public class SupplyChainRecord
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Stage { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public double Temperature { get; set; }
        public string ActionDetails { get; set; } = string.Empty; // e.g. "Quality Check Passed", "Loaded onto Truck"
        public string PerformedBy { get; set; } = string.Empty; // Name of the user
        
        public Product? Product { get; set; }
    }
}
