using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodSupplyChainAPI.Models
{
    /// <summary>
    /// Represents a shipment record created when a Distributor accepts a packaged product.
    /// Tracks the full journey from dispatch to delivery.
    /// </summary>
    public class Shipment
    {
        public int Id { get; set; }

        // ── Product Reference ──────────────────────────────
        [Required]
        public int ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public Product? Product { get; set; }

        // ── Distributor ────────────────────────────────────
        /// <summary>ID of the User with Role = "Distributor"</summary>
        public int DistributorId { get; set; }

        [ForeignKey(nameof(DistributorId))]
        public User? Distributor { get; set; }

        // ── Vehicle & Driver Info ──────────────────────────
        public string VehicleNumber { get; set; } = string.Empty;
        public string DriverName    { get; set; } = string.Empty;
        public string DriverContact { get; set; } = string.Empty;

        /// <summary>E.g., Truck / Cold Storage / Ship / Air</summary>
        public string TransportType { get; set; } = string.Empty;

        public DateTime? DispatchDate  { get; set; }
        public DateTime? DeliveryDate  { get; set; }

        // ── Status ────────────────────────────────────────
        /// <summary>
        /// Status flow: Packaged → In Transit → Out for Delivery → Delivered
        /// Can also be: Delayed | Issue Reported
        /// </summary>
        public string Status { get; set; } = "In Transit";

        // ── Blockchain ───────────────────────────────────
        public string BlockchainTxHash { get; set; } = string.Empty;

        // ── Timestamps ───────────────────────────────────
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Collections ───────────────────────
        public ICollection<LocationLog>?      LocationLogs      { get; set; }
        public ICollection<StorageCondition>? StorageConditions { get; set; }
        public ICollection<ShipmentIssue>?    Issues            { get; set; }
    }
}
