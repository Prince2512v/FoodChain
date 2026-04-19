using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodSupplyChainAPI.Migrations
{
    /// <inheritdoc />
    public partial class ExpandModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActionDetails",
                table: "SupplyChainRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PerformedBy",
                table: "SupplyChainRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "FarmerId",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FarmerName",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "HarvestDate",
                table: "Products",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsRejected",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "QualityStatus",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StorageInfo",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActionDetails",
                table: "SupplyChainRecords");

            migrationBuilder.DropColumn(
                name: "PerformedBy",
                table: "SupplyChainRecords");

            migrationBuilder.DropColumn(
                name: "FarmerId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "FarmerName",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "HarvestDate",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsRejected",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "QualityStatus",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "StorageInfo",
                table: "Products");
        }
    }
}
