using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodSupplyChainAPI.Models
{
    /// <summary>
    /// Stores a single GPS location ping for a shipment (manual or IoT-sourced).
    /// Multiple records per shipment build the complete route history.
    /// </summary>
    public class LocationLog
    {
        public int Id { get; set; }

        [Required]
        public int ShipmentId { get; set; }

        [ForeignKey(nameof(ShipmentId))]
        public Shipment? Shipment { get; set; }

        [Required]
        [Range(-90.0, 90.0,  ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude  { get; set; }

        [Required]
        [Range(-180.0, 180.0, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }

        /// <summary>Optional human-readable place name or address</summary>
        public string LocationName { get; set; } = string.Empty;

        /// <summary>Source: "Manual" | "IoT" | "GPS"</summary>
        public string Source { get; set; } = "Manual";

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
