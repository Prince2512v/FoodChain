using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodSupplyChainAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductForFarmerModuleV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StorageInfo",
                table: "Products",
                newName: "Unit");

            migrationBuilder.RenameColumn(
                name: "Origin",
                table: "Products",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Products",
                newName: "ProductName");

            migrationBuilder.RenameColumn(
                name: "FarmerName",
                table: "Products",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "CurrentStage",
                table: "Products",
                newName: "LocationLong");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Products",
                newName: "Timestamp");

            migrationBuilder.RenameColumn(
                name: "BatchNumber",
                table: "Products",
                newName: "LocationLat");

            migrationBuilder.AlterColumn<int>(
                name: "FarmerId",
                table: "Products",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BatchId",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BlockchainTxHash",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CropType",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FarmingMethod",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FertilizerUsed",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Quantity",
                table: "Products",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Products_FarmerId",
                table: "Products",
                column: "FarmerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Users_FarmerId",
                table: "Products",
                column: "FarmerId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Users_FarmerId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_FarmerId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "BatchId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "BlockchainTxHash",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "CropType",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "FarmingMethod",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "FertilizerUsed",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "Unit",
                table: "Products",
                newName: "StorageInfo");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "Products",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Products",
                newName: "Origin");

            migrationBuilder.RenameColumn(
                name: "ProductName",
                table: "Products",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "Products",
                newName: "FarmerName");

            migrationBuilder.RenameColumn(
                name: "LocationLong",
                table: "Products",
                newName: "CurrentStage");

            migrationBuilder.RenameColumn(
                name: "LocationLat",
                table: "Products",
                newName: "BatchNumber");

            migrationBuilder.AlterColumn<int>(
                name: "FarmerId",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
