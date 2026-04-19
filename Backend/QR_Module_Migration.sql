/*
  QR Code Module - SQL Migration Script
*/

-- 1. Add QRCodeBase64 column to Products table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'QRCodeBase64' AND Object_ID = Object_Id('Products'))
BEGIN
    ALTER TABLE Products ADD QRCodeBase64 NVARCHAR(MAX) DEFAULT '';
END

-- 2. Create QRScanLogs table for analytics
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'QRScanLogs')
BEGIN
    CREATE TABLE QRScanLogs (
        Id INT PRIMARY KEY IDENTITY(1,1),
        BatchId NVARCHAR(255) NOT NULL,
        ScannedAt DATETIME DEFAULT GETUTCDATE(),
        Location NVARCHAR(MAX) NULL
    );
END

GO

PRINT 'QR Code Module migration completed successfully.';
