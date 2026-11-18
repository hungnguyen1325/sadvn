-- ===================================================
-- SADVN Database Schema (Microsoft SQL Server)
-- ===================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'accounts')
BEGIN
    CREATE TABLE accounts (
        id INT IDENTITY(1,1) NOT NULL,
        uuid UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,

        create_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        update_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT pk_accounts PRIMARY KEY (id),
        CONSTRAINT uq_accounts_uuid UNIQUE (uuid),
        CONSTRAINT uq_accounts_username UNIQUE (username)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'business')
BEGIN
    CREATE TABLE business (
        id INT IDENTITY(1,1) NOT NULL,
        uuid UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),

        name NVARCHAR(255) NOT NULL,
        tax_code VARCHAR(20) NOT NULL,
        address NVARCHAR(255) NULL,

        is_active BIT NOT NULL DEFAULT 0,

        create_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        update_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT pk_business PRIMARY KEY (id),
        CONSTRAINT uq_business_uuid UNIQUE (uuid),
        CONSTRAINT uq_business_tax_code UNIQUE (tax_code)
    );
END;
