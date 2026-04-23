using Microsoft.EntityFrameworkCore;
using FoodSupplyChainAPI.Models;

namespace FoodSupplyChainAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // ── Existing Tables ────────────────────────────────────────
        public DbSet<User>              Users              { get; set; }
        public DbSet<Product>           Products           { get; set; }
        public DbSet<SupplyChainRecord> SupplyChainRecords { get; set; }
        public DbSet<ProcessingDetails> ProcessingDetails  { get; set; }
        public DbSet<QualityCheck>      QualityChecks      { get; set; }
        public DbSet<Packaging>         Packaging          { get; set; }

        // ── Distributor Module Tables ──────────────────────────────
        public DbSet<Shipment>          Shipments          { get; set; }
        public DbSet<LocationLog>       LocationLogs       { get; set; }
        public DbSet<StorageCondition>  StorageConditions  { get; set; }
        public DbSet<ShipmentIssue>     ShipmentIssues     { get; set; }

        // ── Retailer Module Tables ─────────────────────────────────
        public DbSet<RetailInventory>   RetailInventory    { get; set; }
        public DbSet<RetailerReceipt>   RetailerReceipts   { get; set; }

        // ── Consumer Module Tables ─────────────────────────────────
        public DbSet<Feedback>          Feedbacks          { get; set; }

        // ── Admin Module Tables ────────────────────────────────────
        public DbSet<AuditLog>              AuditLogs              { get; set; }
        public DbSet<BlockchainTransaction> BlockchainTransactions { get; set; }
        public DbSet<SystemSetting>         SystemSettings         { get; set; }
        public DbSet<FraudLog>              FraudLogs              { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique email constraint
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Shipment → Product (restrict delete to avoid cascade conflicts)
            modelBuilder.Entity<Shipment>()
                .HasOne(s => s.Product)
                .WithMany()
                .HasForeignKey(s => s.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Shipment → Distributor (restrict delete)
            modelBuilder.Entity<Shipment>()
                .HasOne(s => s.Distributor)
                .WithMany()
                .HasForeignKey(s => s.DistributorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Product → Distributor (restrict delete)
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Distributor)
                .WithMany()
                .HasForeignKey(p => p.DistributorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Retailer Receipt Relationships
            modelBuilder.Entity<RetailerReceipt>()
                .HasOne(r => r.Product)
                .WithMany()
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Retail Inventory Relationships
            modelBuilder.Entity<RetailInventory>()
                .HasOne(i => i.Product)
                .WithMany()
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Fix Decimal Precision Warnings
            modelBuilder.Entity<Product>()
                .Property(p => p.Quantity)
                .HasPrecision(18, 2);

            modelBuilder.Entity<RetailInventory>()
                .Property(r => r.RemainingQuantity)
                .HasPrecision(18, 2);

            modelBuilder.Entity<RetailInventory>()
                .Property(r => r.Price)
                .HasPrecision(18, 2);
        }
    }
}
