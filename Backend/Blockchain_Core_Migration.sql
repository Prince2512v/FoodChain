/*
  Blockchain Core Engine - SQL Migration Script
  ---------------------------------------------
  Aligns the BlockchainTransactions table with the system-level core engine requirements.
*/

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BlockchainTransactions')
BEGIN
    CREATE TABLE BlockchainTransactions (
        Id INT PRIMARY KEY IDENTITY(1,1),
        BatchId NVARCHAR(255) NOT NULL,
        TxHash NVARCHAR(255) NOT NULL,
        Role NVARCHAR(100) NOT NULL,
        Status NVARCHAR(100) NOT NULL,
        Action NVARCHAR(255) NULL,
        Timestamp DATETIME DEFAULT GETUTCDATE()
    );
END
ELSE
BEGIN
    -- Check for missing columns and add them if necessary
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'BatchId' AND Object_ID = Object_Id('BlockchainTransactions'))
        ALTER TABLE BlockchainTransactions ADD BatchId NVARCHAR(255) DEFAULT '';

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'TxHash' AND Object_ID = Object_Id('BlockchainTransactions'))
        ALTER TABLE BlockchainTransactions ADD TxHash NVARCHAR(255) DEFAULT '';

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'Role' AND Object_ID = Object_Id('BlockchainTransactions'))
        ALTER TABLE BlockchainTransactions ADD Role NVARCHAR(100) DEFAULT '';

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'Timestamp' AND Object_ID = Object_Id('BlockchainTransactions'))
        ALTER TABLE BlockchainTransactions ADD Timestamp DATETIME DEFAULT GETUTCDATE();
END

GO

-- Index for performance on BatchId searches
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE Name = 'IX_BlockchainTransactions_BatchId')
    CREATE INDEX IX_BlockchainTransactions_BatchId ON BlockchainTransactions(BatchId);

GO

PRINT 'BlockchainTransactions table migration completed successfully.';
