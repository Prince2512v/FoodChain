-- ============================================================
-- DISTRIBUTOR MODULE — SQL MIGRATION SCRIPT
-- Food Supply Chain Blockchain System
-- Run this script against your SQL Server database if NOT
-- using EF Core migrations (dotnet ef database update).
-- ============================================================

-- ─────────────────────────────────────────────────────────
-- TABLE: Shipments
-- Represents a distributor's shipment of a packaged product
-- ─────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Shipments]') AND type = N'U')
BEGIN
    CREATE TABLE [dbo].[Shipments] (
        [Id]               INT           IDENTITY(1,1) PRIMARY KEY,
        [ProductId]        INT           NOT NULL,
        [DistributorId]    INT           NOT NULL,
        [VehicleNumber]    NVARCHAR(100) NOT NULL DEFAULT '',
        [DriverName]       NVARCHAR(200) NOT NULL DEFAULT '',
        [DriverContact]    NVARCHAR(50)  NOT NULL DEFAULT '',
        [TransportType]    NVARCHAR(100) NOT NULL DEFAULT '',
        [DispatchDate]     DATETIME2     NULL,
        [DeliveryDate]     DATETIME2     NULL,
        [Status]           NVARCHAR(50)  NOT NULL DEFAULT 'In Transit',
        [BlockchainTxHash] NVARCHAR(100) NOT NULL DEFAULT '',
        [CreatedAt]        DATETIME2     NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT [FK_Shipments_Products]
            FOREIGN KEY ([ProductId])
            REFERENCES [dbo].[Products]([Id])
            ON DELETE NO ACTION,

        CONSTRAINT [FK_Shipments_Users]
            FOREIGN KEY ([DistributorId])
            REFERENCES [dbo].[Users]([Id])
            ON DELETE NO ACTION
    );

    PRINT 'Table [Shipments] created.';
END
ELSE
    PRINT 'Table [Shipments] already exists — skipped.';
GO

-- ─────────────────────────────────────────────────────────
-- TABLE: LocationLogs
-- GPS location pings for shipment tracking
-- ─────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LocationLogs]') AND type = N'U')
BEGIN
    CREATE TABLE [dbo].[LocationLogs] (
        [Id]           INT           IDENTITY(1,1) PRIMARY KEY,
        [ShipmentId]   INT           NOT NULL,
        [Latitude]     FLOAT         NOT NULL,
        [Longitude]    FLOAT         NOT NULL,
        [LocationName] NVARCHAR(300) NOT NULL DEFAULT '',
        [Source]       NVARCHAR(50)  NOT NULL DEFAULT 'Manual',
        [Timestamp]    DATETIME2     NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT [FK_LocationLogs_Shipments]
            FOREIGN KEY ([ShipmentId])
            REFERENCES [dbo].[Shipments]([Id])
            ON DELETE CASCADE
    );

    -- Index for fast per-shipment queries
    CREATE INDEX [IX_LocationLogs_ShipmentId_Timestamp]
        ON [dbo].[LocationLogs]([ShipmentId], [Timestamp]);

    PRINT 'Table [LocationLogs] created.';
END
ELSE
    PRINT 'Table [LocationLogs] already exists — skipped.';
GO

-- ─────────────────────────────────────────────────────────
-- TABLE: StorageConditions
-- Temperature and humidity readings during transit
-- ─────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[StorageConditions]') AND type = N'U')
BEGIN
    CREATE TABLE [dbo].[StorageConditions] (
        [Id]               INT           IDENTITY(1,1) PRIMARY KEY,
        [ShipmentId]       INT           NOT NULL,
        [Temperature]      FLOAT         NOT NULL,
        [Humidity]         FLOAT         NOT NULL,
        [StorageType]      NVARCHAR(50)  NOT NULL DEFAULT 'Ambient',
        [ThresholdBreached] BIT          NOT NULL DEFAULT 0,
        [Timestamp]        DATETIME2     NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT [FK_StorageConditions_Shipments]
            FOREIGN KEY ([ShipmentId])
            REFERENCES [dbo].[Shipments]([Id])
            ON DELETE CASCADE
    );

    CREATE INDEX [IX_StorageConditions_ShipmentId]
        ON [dbo].[StorageConditions]([ShipmentId]);

    PRINT 'Table [StorageConditions] created.';
END
ELSE
    PRINT 'Table [StorageConditions] already exists — skipped.';
GO

-- ─────────────────────────────────────────────────────────
-- TABLE: ShipmentIssues
-- Issues reported by distributor (delay, damage, temp breach)
-- ─────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ShipmentIssues]') AND type = N'U')
BEGIN
    CREATE TABLE [dbo].[ShipmentIssues] (
        [Id]          INT            IDENTITY(1,1) PRIMARY KEY,
        [ShipmentId]  INT            NOT NULL,
        [IssueType]   NVARCHAR(100)  NOT NULL,
        [Description] NVARCHAR(1000) NOT NULL DEFAULT '',
        [Severity]    NVARCHAR(20)   NOT NULL DEFAULT 'Medium',
        [Timestamp]   DATETIME2      NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT [FK_ShipmentIssues_Shipments]
            FOREIGN KEY ([ShipmentId])
            REFERENCES [dbo].[Shipments]([Id])
            ON DELETE CASCADE
    );

    CREATE INDEX [IX_ShipmentIssues_ShipmentId]
        ON [dbo].[ShipmentIssues]([ShipmentId]);

    PRINT 'Table [ShipmentIssues] created.';
END
ELSE
    PRINT 'Table [ShipmentIssues] already exists — skipped.';
GO

PRINT '✅ Distributor Module migration complete.';
