using System;
using System.ComponentModel.DataAnnotations;

namespace FoodSupplyChainAPI.Models
{
    public class Feedback
    {
        public int Id { get; set; }

        [Required]
        public string BatchId { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public string CustomerName { get; set; } = "Anonymous";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
