IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Products] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [BatchNumber] nvarchar(max) NOT NULL,
    [Origin] nvarchar(max) NOT NULL,
    [CurrentStage] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY ([Id])
);

CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Email] nvarchar(450) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

CREATE TABLE [SupplyChainRecords] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [Stage] nvarchar(max) NOT NULL,
    [Location] nvarchar(max) NOT NULL,
    [Timestamp] datetime2 NOT NULL,
    [Temperature] float NOT NULL,
    CONSTRAINT [PK_SupplyChainRecords] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SupplyChainRecords_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_SupplyChainRecords_ProductId] ON [SupplyChainRecords] ([ProductId]);

CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260407121549_InitialCreate', N'9.0.0');

ALTER TABLE [SupplyChainRecords] ADD [ActionDetails] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [SupplyChainRecords] ADD [PerformedBy] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [FarmerId] int NOT NULL DEFAULT 0;

ALTER TABLE [Products] ADD [FarmerName] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [HarvestDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';

ALTER TABLE [Products] ADD [IsRejected] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Products] ADD [QualityStatus] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [StorageInfo] nvarchar(max) NOT NULL DEFAULT N'';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260408142831_ExpandModules', N'9.0.0');

EXEC sp_rename N'[Products].[StorageInfo]', N'Unit', 'COLUMN';

EXEC sp_rename N'[Products].[Origin]', N'Status', 'COLUMN';

EXEC sp_rename N'[Products].[Name]', N'ProductName', 'COLUMN';

EXEC sp_rename N'[Products].[FarmerName]', N'Notes', 'COLUMN';

EXEC sp_rename N'[Products].[CurrentStage]', N'LocationLong', 'COLUMN';

EXEC sp_rename N'[Products].[CreatedAt]', N'Timestamp', 'COLUMN';

EXEC sp_rename N'[Products].[BatchNumber]', N'LocationLat', 'COLUMN';

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Products]') AND [c].[name] = N'FarmerId');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Products] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Products] ALTER COLUMN [FarmerId] int NULL;

ALTER TABLE [Products] ADD [Address] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [BatchId] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [BlockchainTxHash] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [CropType] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [FarmingMethod] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [FertilizerUsed] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [Quantity] decimal(18,2) NOT NULL DEFAULT 0.0;

CREATE INDEX [IX_Products_FarmerId] ON [Products] ([FarmerId]);

ALTER TABLE [Products] ADD CONSTRAINT [FK_Products_Users_FarmerId] FOREIGN KEY ([FarmerId]) REFERENCES [Users] ([Id]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260409120909_UpdateProductForFarmerModuleV2', N'9.0.0');

ALTER TABLE [Products] ADD [ProcessingTxHash] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Products] ADD [ProcessorId] int NULL;

CREATE TABLE [Packaging] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [PackageType] nvarchar(max) NOT NULL,
    [Weight] nvarchar(max) NOT NULL,
    [LabelInfo] nvarchar(max) NOT NULL,
    [ExpiryDate] datetime2 NOT NULL,
    CONSTRAINT [PK_Packaging] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Packaging_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [ProcessingDetails] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [ProcessingType] nvarchar(max) NOT NULL,
    [ProcessingDate] datetime2 NOT NULL,
    [Conditions] nvarchar(max) NOT NULL,
    [Notes] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_ProcessingDetails] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ProcessingDetails_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [QualityChecks] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [Grade] nvarchar(max) NOT NULL,
    [MoistureLevel] nvarchar(max) NOT NULL,
    [Passed] bit NOT NULL,
    [Remarks] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_QualityChecks] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_QualityChecks_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_Products_ProcessorId] ON [Products] ([ProcessorId]);

CREATE INDEX [IX_Packaging_ProductId] ON [Packaging] ([ProductId]);

CREATE INDEX [IX_ProcessingDetails_ProductId] ON [ProcessingDetails] ([ProductId]);

CREATE INDEX [IX_QualityChecks_ProductId] ON [QualityChecks] ([ProductId]);

ALTER TABLE [Products] ADD CONSTRAINT [FK_Products_Users_ProcessorId] FOREIGN KEY ([ProcessorId]) REFERENCES [Users] ([Id]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260409121907_ProcessorModule', N'9.0.0');

COMMIT;
GO

