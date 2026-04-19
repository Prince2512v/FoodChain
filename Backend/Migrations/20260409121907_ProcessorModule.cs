using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodSupplyChainAPI.Migrations
{
    /// <inheritdoc />
    public partial class ProcessorModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProcessingTxHash",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ProcessorId",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Packaging",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    PackageType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Weight = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LabelInfo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Packaging", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Packaging_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcessingDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ProcessingType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProcessingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Conditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessingDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessingDetails_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QualityChecks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Grade = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MoistureLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Passed = table.Column<bool>(type: "bit", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QualityChecks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QualityChecks_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProcessorId",
                table: "Products",
                column: "ProcessorId");

            migrationBuilder.CreateIndex(
                name: "IX_Packaging_ProductId",
                table: "Packaging",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessingDetails_ProductId",
                table: "ProcessingDetails",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_QualityChecks_ProductId",
                table: "QualityChecks",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Users_ProcessorId",
                table: "Products",
                column: "ProcessorId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Users_ProcessorId",
                table: "Products");

            migrationBuilder.DropTable(
                name: "Packaging");

            migrationBuilder.DropTable(
                name: "ProcessingDetails");

            migrationBuilder.DropTable(
                name: "QualityChecks");

            migrationBuilder.DropIndex(
                name: "IX_Products_ProcessorId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ProcessingTxHash",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ProcessorId",
                table: "Products");
        }
    }
}
