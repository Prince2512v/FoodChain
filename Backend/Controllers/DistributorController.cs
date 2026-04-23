using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FoodSupplyChainAPI.Services;

namespace FoodSupplyChainAPI.Controllers
{
    // ─────────────────────────────────────────────────────────────────────
    //  Distributor Controller
    //  Role: "Distributor"  |  Base route: /api/distributor
    // ─────────────────────────────────────────────────────────────────────

    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Distributor")]
    public class DistributorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAccessControlService _accessControl;

        public DistributorController(ApplicationDbContext context, IAccessControlService accessControl)
        {
            _context = context;
            _accessControl = accessControl;
        }

        // ─────────────────────────────────────────────────────────────
        // 1. GET /api/distributor/available-shipments
        //    Returns all products with Status = "Packaged" (from Processor)
        // ─────────────────────────────────────────────────────────────
        [HttpGet("available-shipments")]
        public async Task<IActionResult> GetAvailableShipments()
        {
            var products = await _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Processor)
                .Where(p => p.Status == "Packaged" && !p.IsRejected)
                .Select(p => new
                {
                    p.Id,
                    p.BatchId,
                    p.ProductName,
                    p.CropType,
                    p.Quantity,
                    p.Unit,
                    p.Status,
                    p.HarvestDate,
                    FarmerName    = p.Farmer    != null ? p.Farmer.Name    : "N/A",
                    ProcessorName = p.Processor != null ? p.Processor.Name : "N/A"
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetDistributorProducts()
        {
            var userId = GetUserId();
            var products = await _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Processor)
                .Where(p => p.Status == "Packaged" || p.DistributorId == userId)
                .OrderByDescending(p => p.Timestamp)
                .ToListAsync();

            return Ok(products);
        }

        // ─────────────────────────────────────────────────────────────
        // 2. POST /api/distributor/accept/{productId}
        //    Distributor accepts a packaged product → creates Shipment
        //    → sets Product.Status = "In Transit"
        // ─────────────────────────────────────────────────────────────
        [HttpPost("accept/{productId}")]
        public async Task<IActionResult> AcceptShipment(int productId)
        {
            var userId = GetUserId();
            var (success, message) = await _accessControl.ValidateProductAction(productId, userId, "Distributor", "Accept");
            if (!success) {
                await _accessControl.LogUnauthorizedAccess(userId, "Distributor Accept Attempt", message, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown");
                return BadRequest(message);
            }
            
            var product = await _context.Products.FindAsync(productId);

            // Check if a shipment was already created for this product
            var existing = await _context.Shipments.FirstOrDefaultAsync(s => s.ProductId == productId);
            if (existing != null)
                return Conflict(new { message = "Shipment already accepted for this product.", shipmentId = existing.Id });

            var shipment = new Shipment
            {
                ProductId      = productId,
                DistributorId  = GetUserId(),
                Status         = "In Transit",
                CreatedAt      = DateTime.UtcNow
            };

            _context.Shipments.Add(shipment);

            product.Status = "In Transit";
            await _context.SaveChangesAsync();

            await LogAction("Shipment Accepted", $"Distributor accepted batch {product.BatchId} for transport.");
            return Ok(new
            {
                message    = "Shipment accepted. Product is now In Transit.",
                shipmentId = shipment.Id,
                productId  = product.Id,
                batchId    = product.BatchId
            });
        }

        // ─────────────────────────────────────────────────────────────
        // 3. POST /api/distributor/shipment-details
        //    Update vehicle, driver, and transport information
        // ─────────────────────────────────────────────────────────────
        [HttpPost("shipment-details")]
        public async Task<IActionResult> UpdateShipmentDetails([FromBody] ShipmentDetailsDto dto)
        {
            var shipment = await _context.Shipments.FindAsync(dto.ShipmentId);
            if (shipment == null)
                return NotFound(new { message = "Shipment not found." });

            if (!IsOwner(shipment.DistributorId))
                return Forbid();

            if (shipment.Status == "Delivered")
                return BadRequest(new { message = "Cannot update a delivered shipment." });

            shipment.VehicleNumber = dto.VehicleNumber;
            shipment.DriverName    = dto.DriverName;
            shipment.DriverContact = dto.DriverContact;
            shipment.TransportType = dto.TransportType;
            shipment.DispatchDate  = dto.DispatchDate;

            await _context.SaveChangesAsync();
            await LogAction("Shipment Details Updated", $"Distributor updated vehicle/driver info for shipment {shipment.Id}");
            return Ok(new { message = "Shipment details updated.", shipment });
        }

        // ─────────────────────────────────────────────────────────────
        // 4. POST /api/distributor/location-update
        //    Add a GPS location log entry (manual or IoT simulation)
        // ─────────────────────────────────────────────────────────────
        [HttpPost("location-update")]
        public async Task<IActionResult> AddLocationUpdate([FromBody] LocationUpdateDto dto)
        {
            var shipment = await _context.Shipments.FindAsync(dto.ShipmentId);
            if (shipment == null)
                return NotFound(new { message = "Shipment not found." });

            if (!IsOwner(shipment.DistributorId))
                return Forbid();

            if (shipment.Status == "Delivered")
                return BadRequest(new { message = "Cannot update location of a delivered shipment." });

            var log = new LocationLog
            {
                ShipmentId    = dto.ShipmentId,
                Latitude      = dto.Latitude,
                Longitude     = dto.Longitude,
                LocationName  = dto.LocationName ?? string.Empty,
                Source        = dto.Source ?? "Manual",
                Timestamp     = DateTime.UtcNow
            };

            _context.LocationLogs.Add(log);
            await _context.SaveChangesAsync();
            await LogAction("Location Updated", $"Distributor updated location for shipment {shipment.Id}: {log.LocationName}");
            return Ok(new { message = "Location updated.", log });
        }

        // ─────────────────────────────────────────────────────────────
        // 5. POST /api/distributor/storage
        //    Add environmental storage condition reading
        // ─────────────────────────────────────────────────────────────
        [HttpPost("storage")]
        public async Task<IActionResult> AddStorageCondition([FromBody] StorageConditionDto dto)
        {
            var shipment = await _context.Shipments.FindAsync(dto.ShipmentId);
            if (shipment == null)
                return NotFound(new { message = "Shipment not found." });

            if (!IsOwner(shipment.DistributorId))
                return Forbid();

            // Detect threshold breach (configurable thresholds)
            bool breached = dto.StorageType switch
            {
                "Cold"   => dto.Temperature > 8  || dto.Temperature < 0  || dto.Humidity > 85,
                "Frozen" => dto.Temperature > -10 || dto.Humidity > 90,
                _        => dto.Temperature > 30  || dto.Humidity > 70
            };

            var condition = new StorageCondition
            {
                ShipmentId       = dto.ShipmentId,
                Temperature      = dto.Temperature,
                Humidity         = dto.Humidity,
                StorageType      = dto.StorageType,
                ThresholdBreached = breached,
                Timestamp        = DateTime.UtcNow
            };

            _context.StorageConditions.Add(condition);

            // Auto-flag shipment issue when breach detected
            if (breached)
            {
                var issue = new ShipmentIssue
                {
                    ShipmentId  = dto.ShipmentId,
                    IssueType   = "Temperature Issue",
                    Description = $"Threshold breach detected: Temp={dto.Temperature}°C, Humidity={dto.Humidity}%. StorageType={dto.StorageType}",
                    Severity    = "High",
                    Timestamp   = DateTime.UtcNow
                };
                _context.ShipmentIssues.Add(issue);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message          = breached ? "⚠️ Storage condition recorded — THRESHOLD BREACHED!" : "Storage condition recorded.",
                condition,
                thresholdBreached = breached
            });
        }

        // ─────────────────────────────────────────────────────────────
        // 6. PUT /api/distributor/status/{shipmentId}
        //    Update delivery status along the defined flow
        //    Packaged → In Transit → Out for Delivery → Delivered
        // ─────────────────────────────────────────────────────────────
        [HttpPut("status/{shipmentId}")]
        public async Task<IActionResult> UpdateDeliveryStatus(int shipmentId, [FromBody] StatusUpdateDto dto)
        {
            var shipment = await _context.Shipments
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.Id == shipmentId);

            if (shipment == null)
                return NotFound(new { message = "Shipment not found." });

            if (!IsOwner(shipment.DistributorId))
                return Forbid();

            if (shipment.Status == "Delivered")
                return BadRequest(new { message = "Shipment is already delivered. No further updates allowed." });

            // Validate forward-only status progression
            var allowedTransitions = new Dictionary<string, HashSet<string>>
            {
                ["In Transit"]        = new() { "Out for Delivery", "Delayed", "Issue Reported" },
                ["Out for Delivery"]  = new() { "Delivered", "Delayed", "Issue Reported" },
                ["Delayed"]           = new() { "In Transit", "Out for Delivery" },
                ["Issue Reported"]    = new() { "In Transit", "Out for Delivery" }
            };

            if (allowedTransitions.TryGetValue(shipment.Status, out var allowed) && !allowed.Contains(dto.Status))
                return BadRequest(new { message = $"Invalid transition: '{shipment.Status}' → '{dto.Status}'." });

            shipment.Status = dto.Status;

            if (dto.Status == "Delivered")
            {
                shipment.DeliveryDate = DateTime.UtcNow;
                if (shipment.Product != null)
                    shipment.Product.Status = "Delivered";
            }

            await _context.SaveChangesAsync();
            await LogAction("Delivery Status Updated", $"Distributor updated status for shipment {shipment.Id} to {dto.Status}");
            return Ok(new { message = "Status updated.", newStatus = dto.Status });
        }

        // ─────────────────────────────────────────────────────────────
        // 7. POST /api/blockchain/shipment
        //    Frontend passes TxHash after MetaMask signs the transaction.
        //    Saves hash + updates product status (must pass before final update).
        // ─────────────────────────────────────────────────────────────
        [HttpPost("/api/blockchain/shipment")]
        public async Task<IActionResult> RecordBlockchainShipment([FromBody] BlockchainShipmentDto dto)
        {
            var shipment = await _context.Shipments
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.Product != null && s.Product.BatchId == dto.BatchId);

            if (shipment == null)
                return NotFound(new { message = "No active shipment found for batch " + dto.BatchId });

            if (!IsOwner(shipment.DistributorId))
                return Forbid();

            shipment.BlockchainTxHash = dto.TxHash;

            await _context.SaveChangesAsync();
            await LogTransaction(dto.BatchId, dto.TxHash, "Shipping", "Distributor");
            await LogAction("Blockchain Verification", $"Distributor verified batch {dto.BatchId} on-chain. Tx: {dto.TxHash}");

            return Ok(new
            {
                message  = "Blockchain transaction recorded.",
                txHash   = dto.TxHash,
                batchId  = dto.BatchId
            });
        }

        // ─────────────────────────────────────────────────────────────
        // 8. GET /api/distributor/history/{batchId}
        //    Full tracking timeline: shipment + locations + conditions + issues
        // ─────────────────────────────────────────────────────────────
        [HttpGet("history/{batchId}")]
        public async Task<IActionResult> GetShipmentHistory(string batchId)
        {
            var product = await _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Processor)
                .FirstOrDefaultAsync(p => p.BatchId == batchId);

            if (product == null)
                return NotFound(new { message = "Product not found." });

            var shipment = await _context.Shipments
                .Include(s => s.Distributor)
                .Include(s => s.LocationLogs!.OrderBy(l => l.Timestamp))
                .Include(s => s.StorageConditions!.OrderBy(c => c.Timestamp))
                .Include(s => s.Issues!.OrderBy(i => i.Timestamp))
                .FirstOrDefaultAsync(s => s.ProductId == product.Id);

            // Processor data
            var processing  = await _context.ProcessingDetails.FirstOrDefaultAsync(pd => pd.ProductId == product.Id);
            var quality     = await _context.QualityChecks.FirstOrDefaultAsync(qc => qc.ProductId == product.Id);
            var packaging   = await _context.Packaging.FirstOrDefaultAsync(pk => pk.ProductId == product.Id);

            return Ok(new
            {
                Product        = product,
                Processing     = processing,
                QualityCheck   = quality,
                Packaging      = packaging,
                Shipment       = shipment,
                LocationLogs      = shipment?.LocationLogs,
                StorageConditions = shipment?.StorageConditions,
                Issues            = shipment?.Issues
            });
        }

        // ─────────────────────────────────────────────────────────────
        // 9. POST /api/distributor/report-issue
        //    Report a delay, damage, or temperature issue
        // ─────────────────────────────────────────────────────────────
        [HttpPost("report-issue")]
        public async Task<IActionResult> ReportIssue([FromBody] ReportIssueDto dto)
        {
            var shipment = await _context.Shipments.FindAsync(dto.ShipmentId);
            if (shipment == null)
                return NotFound(new { message = "Shipment not found." });

            if (!IsOwner(shipment.DistributorId))
                return Forbid();

            var issue = new ShipmentIssue
            {
                ShipmentId  = dto.ShipmentId,
                IssueType   = dto.IssueType,
                Description = dto.Description,
                Severity    = dto.Severity ?? "Medium",
                Timestamp   = DateTime.UtcNow
            };
            _context.ShipmentIssues.Add(issue);

            // Update shipment status to reflect the issue
            if (shipment.Status != "Delivered")
            {
                shipment.Status = dto.IssueType == "Delay" ? "Delayed" : "Issue Reported";
            }

            await _context.SaveChangesAsync();
            await LogAction("Issue Reported", $"Distributor reported {dto.IssueType} for shipment {shipment.Id}");
            return Ok(new { message = "Issue reported.", issue });
        }

        // ─────────────────────────────────────────────────────────────
        // BONUS: IoT Simulation — POST /api/distributor/iot-ping
        //   Simulates GPS data coming from an IoT device
        // ─────────────────────────────────────────────────────────────
        [HttpPost("iot-ping")]
        public async Task<IActionResult> IoTLocationPing([FromBody] LocationUpdateDto dto)
        {
            dto.Source = "IoT";
            return await AddLocationUpdate(dto);
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/distributor/my-shipments
        //   All shipments assigned to the logged-in distributor
        // ─────────────────────────────────────────────────────────────
        [HttpGet("my-shipments")]
        public async Task<IActionResult> GetMyShipments()
        {
            int distributorId = GetUserId();

            var shipments = await _context.Shipments
                .Include(s => s.Product)
                .Where(s => s.DistributorId == distributorId)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    s.Id,
                    s.Status,
                    s.VehicleNumber,
                    s.DriverName,
                    s.TransportType,
                    s.DispatchDate,
                    s.DeliveryDate,
                    s.BlockchainTxHash,
                    s.CreatedAt,
                    Product = s.Product == null ? null : new
                    {
                        s.Product.BatchId,
                        s.Product.ProductName,
                        s.Product.CropType,
                        s.Product.Quantity,
                        s.Product.Unit
                    }
                })
                .ToListAsync();

            return Ok(shipments);
        }

        // ─────────────────────────────────────────────────────────────
        //  Helpers
        // ─────────────────────────────────────────────────────────────

        private async Task LogAction(string action, string details)
        {
            var userId = GetUserId();
            var log = new AuditLog
            {
                UserId = userId > 0 ? userId : null,
                Action = action,
                Details = details,
                IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                Timestamp = DateTime.UtcNow
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        private async Task LogTransaction(string batchId, string txHash, string action, string role)
        {
            var tx = new BlockchainTransaction
            {
                BatchId = batchId,
                TxHash = txHash,
                Action = action,
                Role = role,
                Status = "Success",
                Timestamp = DateTime.UtcNow
            };
            _context.BlockchainTransactions.Add(tx);
            await _context.SaveChangesAsync();
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        private bool IsOwner(int distributorId) => distributorId == GetUserId();
    }

    // ─────────────────────────────────────────────────────────────────
    //  Data Transfer Objects (DTOs)
    // ─────────────────────────────────────────────────────────────────

    /// <summary>Payload for updating vehicle/driver/transport info</summary>
    public class ShipmentDetailsDto
    {
        public int      ShipmentId     { get; set; }
        public string   VehicleNumber  { get; set; } = string.Empty;
        public string   DriverName     { get; set; } = string.Empty;
        public string   DriverContact  { get; set; } = string.Empty;
        public string   TransportType  { get; set; } = string.Empty;
        public DateTime? DispatchDate  { get; set; }
    }

    /// <summary>Payload for a GPS location update</summary>
    public class LocationUpdateDto
    {
        public int     ShipmentId    { get; set; }
        public double  Latitude      { get; set; }
        public double  Longitude     { get; set; }
        public string? LocationName  { get; set; }
        public string? Source        { get; set; } = "Manual";
    }

    /// <summary>Payload for adding a storage condition reading</summary>
    public class StorageConditionDto
    {
        public int    ShipmentId  { get; set; }
        public double Temperature { get; set; }
        public double Humidity    { get; set; }
        public string StorageType { get; set; } = "Ambient";
    }

    /// <summary>Payload for updating the delivery status</summary>
    public class StatusUpdateDto
    {
        public string Status { get; set; } = string.Empty;
    }

    /// <summary>Payload sent after a successful MetaMask blockchain transaction</summary>
    public class BlockchainShipmentDto
    {
        public string BatchId { get; set; } = string.Empty;
        public string TxHash  { get; set; } = string.Empty;
        public string Status  { get; set; } = string.Empty;
    }

    /// <summary>Payload for reporting an issue with a shipment</summary>
    public class ReportIssueDto
    {
        public int     ShipmentId  { get; set; }
        public string  IssueType   { get; set; } = string.Empty;  // Delay | Damage | Temperature Issue | Other
        public string  Description { get; set; } = string.Empty;
        public string? Severity    { get; set; } = "Medium";       // Low | Medium | High
    }
}
