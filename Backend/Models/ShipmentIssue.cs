using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodSupplyChainAPI.Models
{
    /// <summary>
    /// Records issues reported by a distributor: delays, damage, or temperature breaches.
    /// May trigger an automatic shipment status change.
    /// </summary>
    public class ShipmentIssue
    {
        public int Id { get; set; }

        [Required]
        public int ShipmentId { get; set; }

        [ForeignKey(nameof(ShipmentId))]
        public Shipment? Shipment { get; set; }

        /// <summary>Delay | Damage | Temperature Issue | Other</summary>
        [Required]
        public string IssueType { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Severity: Low | Medium | High — drives alert priority
        /// </summary>
        public string Severity { get; set; } = "Medium";

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
