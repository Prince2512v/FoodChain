using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodSupplyChainAPI.Migrations
{
    /// <inheritdoc />
    public partial class SyncLatestSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RetailTxHash",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "RetailerId",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RetailerReceipts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    RetailerId = table.Column<int>(type: "int", nullable: false),
                    ReceivedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConditionStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BlockchainTxHash = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetailerReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetailerReceipts_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailerReceipts_Users_RetailerId",
                        column: x => x.RetailerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RetailInventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    RetailerId = table.Column<int>(type: "int", nullable: false),
                    TotalQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoldQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RemainingQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetailInventory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetailInventory_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailInventory_Users_RetailerId",
                        column: x => x.RetailerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_RetailerId",
                table: "Products",
                column: "RetailerId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailerReceipts_ProductId",
                table: "RetailerReceipts",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailerReceipts_RetailerId",
                table: "RetailerReceipts",
                column: "RetailerId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailInventory_ProductId",
                table: "RetailInventory",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailInventory_RetailerId",
                table: "RetailInventory",
                column: "RetailerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Users_RetailerId",
                table: "Products",
                column: "RetailerId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Users_RetailerId",
                table: "Products");

            migrationBuilder.DropTable(
                name: "RetailerReceipts");

            migrationBuilder.DropTable(
                name: "RetailInventory");

            migrationBuilder.DropIndex(
                name: "IX_Products_RetailerId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RetailTxHash",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RetailerId",
                table: "Products");
        }
    }
}
