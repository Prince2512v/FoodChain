using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodSupplyChainAPI.Models
{
    /// <summary>
    /// Captures environmental conditions during storage and transit.
    /// Enables automated alerts when thresholds are breached.
    /// </summary>
    public class StorageCondition
    {
        public int Id { get; set; }

        [Required]
        public int ShipmentId { get; set; }

        [ForeignKey(nameof(ShipmentId))]
        public Shipment? Shipment { get; set; }

        /// <summary>Temperature in Celsius</summary>
        public double Temperature { get; set; }

        /// <summary>Relative humidity percentage (0–100)</summary>
        [Range(0, 100, ErrorMessage = "Humidity must be between 0 and 100%.")]
        public double Humidity { get; set; }

        /// <summary>Type of storage: Cold | Dry | Frozen | Ambient</summary>
        public string StorageType { get; set; } = "Ambient";

        /// <summary>True when temperature or humidity breaches the accepted range</summary>
        public bool ThresholdBreached { get; set; } = false;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
