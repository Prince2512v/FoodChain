using System;
using System.ComponentModel.DataAnnotations;

namespace FoodSupplyChainAPI.Models
{
    public class BlockchainTransaction
    {
        public int Id { get; set; }
        public string BatchId { get; set; } = string.Empty;
        public string TxHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        // Keeping Action for additional context in logs
        public string Action { get; set; } = string.Empty;
    }
}

