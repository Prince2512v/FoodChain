namespace FoodSupplyChainAPI.DTOs
{
    public class ProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string BatchNumber { get; set; } = string.Empty;
        public string Origin { get; set; } = string.Empty;
        public DateTime HarvestDate { get; set; } = DateTime.UtcNow;
        public string StorageInfo { get; set; } = string.Empty;
    }

    public class UpdateStageDto
    {
        public int ProductId { get; set; }
        public string Stage { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public double Temperature { get; set; }
        public string ActionDetails { get; set; } = string.Empty;
        public string? QualityStatus { get; set; } // For Processors
        public bool? IsRejected { get; set; }
    }
}
