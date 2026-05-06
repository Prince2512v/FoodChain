namespace FoodSupplyChainAPI.DTOs
{
    public class ProductCreateDto
    {
        public string ProductName { get; set; } = string.Empty;
        public string CropType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public DateTime HarvestDate { get; set; }
        public string FarmingMethod { get; set; } = string.Empty;
        public string FertilizerUsed { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string LocationLat { get; set; } = string.Empty;
        public string LocationLong { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string BatchId { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string BlockchainTxHash { get; set; } = string.Empty;
    }
}
