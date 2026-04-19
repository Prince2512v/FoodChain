namespace FoodSupplyChainAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // Farmer, Processor, Distributor, Retailer
        public string Status { get; set; } = "Active"; // Active, Blocked
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
