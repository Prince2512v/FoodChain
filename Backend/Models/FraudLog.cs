using System;
using System.ComponentModel.DataAnnotations;

namespace FoodSupplyChainAPI.Models
{
    public class FraudLog
    {
        public int Id { get; set; }
        public string BatchId { get; set; } = string.Empty;
        public string Severity { get; set; } = "Medium"; // Low, Medium, High
        public string IssueType { get; set; } = string.Empty; // DuplicateBatch, TamperDetected, StatusJump
        public string Description { get; set; } = string.Empty;
        public bool IsResolved { get; set; } = false;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
