
using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FoodSupplyChainAPI
{
    public class Seeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            if (context.Products.Any()) return; // Don't seed if data exists

            var users = await context.Users.ToListAsync();
            var farmer = users.FirstOrDefault(u => u.Role == "Farmer") ?? users[0];
            var processor = users.FirstOrDefault(u => u.Role == "Processor") ?? users[0];
            var distributor = users.FirstOrDefault(u => u.Role == "Distributor") ?? users[0];
            var retailer = users.FirstOrDefault(u => u.Role == "Retailer") ?? users[0];

            Console.WriteLine($"Seeding data for Farmer: {farmer.Name}, Processor: {processor.Name}, Distributor: {distributor.Name}, Retailer: {retailer.Name}");

            var products = new List<Product>();

            // 1. Created Products (Farmer)
            for (int i = 1; i <= 3; i++)
            {
                products.Add(new Product
                {
                    ProductName = $"Organic Wheat Batch {i}",
                    CropType = "Wheat",
                    Quantity = 500,
                    Unit = "kg",
                    BatchId = $"WHT-{DateTime.UtcNow.Ticks}-{i}",
                    Status = "Created",
                    FarmerId = farmer.Id,
                    Timestamp = DateTime.UtcNow.AddDays(-10)
                });
            }

            // 2. Processing Products
            for (int i = 1; i <= 2; i++)
            {
                products.Add(new Product
                {
                    ProductName = $"Premium Rice Batch {i}",
                    CropType = "Rice",
                    Quantity = 1000,
                    Unit = "kg",
                    BatchId = $"RCE-{DateTime.UtcNow.Ticks}-{i}",
                    Status = "Processing",
                    FarmerId = farmer.Id,
                    ProcessorId = processor.Id,
                    Timestamp = DateTime.UtcNow.AddDays(-8)
                });
            }

            // 3. In Transit Products (Distributor Hub - The focus of the user)
            for (int i = 1; i <= 5; i++)
            {
                var p = new Product
                {
                    ProductName = $"Corn Batch {i}",
                    CropType = "Corn",
                    Quantity = 2000,
                    Unit = "kg",
                    BatchId = $"CRN-{DateTime.UtcNow.Ticks}-{i}",
                    Status = "In Transit",
                    FarmerId = farmer.Id,
                    ProcessorId = processor.Id,
                    DistributorId = distributor.Id,
                    Timestamp = DateTime.UtcNow.AddDays(-5)
                };
                products.Add(p);
            }

            // 4. Delivered/Stocked Products (Retailer)
            for (int i = 1; i <= 3; i++)
            {
                products.Add(new Product
                {
                    ProductName = $"Soybean Batch {i}",
                    CropType = "Soybean",
                    Quantity = 1500,
                    Unit = "kg",
                    BatchId = $"SOY-{DateTime.UtcNow.Ticks}-{i}",
                    Status = "Received",
                    FarmerId = farmer.Id,
                    ProcessorId = processor.Id,
                    DistributorId = distributor.Id,
                    RetailerId = retailer.Id,
                    Timestamp = DateTime.UtcNow.AddDays(-2)
                });
            }

            context.Products.AddRange(products);
            await context.SaveChangesAsync();

            // Create Shipments for In Transit and Delivered products
            var inTransitProducts = products.Where(p => p.Status == "In Transit" || p.Status == "Received").ToList();
            foreach (var p in inTransitProducts)
            {
                var shipment = new Shipment
                {
                    ProductId = p.Id,
                    DistributorId = distributor.Id,
                    Status = p.Status == "Received" ? "Delivered" : "In Transit",
                    VehicleNumber = "TRK-2026-X1",
                    DriverName = "John Doe",
                    TransportType = "Truck",
                    DispatchDate = DateTime.UtcNow.AddDays(-3),
                    DeliveryDate = p.Status == "Received" ? DateTime.UtcNow.AddDays(-1) : null,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                };
                context.Shipments.Add(shipment);
            }

            // Create Inventory for Retailer
            var receivedProducts = products.Where(p => p.Status == "Received").ToList();
            foreach (var p in receivedProducts)
            {
                context.RetailInventory.Add(new RetailInventory
                {
                    ProductId = p.Id,
                    RetailerId = retailer.Id,
                    TotalQuantity = p.Quantity,
                    RemainingQuantity = p.Quantity,
                    Price = 15.50m,
                    Status = "In Stock",
                    LastUpdated = DateTime.UtcNow
                });
            }

            await context.SaveChangesAsync();
            Console.WriteLine("Seeding completed successfully!");
        }
    }
}
