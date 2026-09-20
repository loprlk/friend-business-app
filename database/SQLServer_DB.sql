CREATE TABLE [dbo].[customers] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(150) NOT NULL,
    [Phone] NVARCHAR(30) NULL,
    [CreatedAt] DATETIME2 NOT NULL
        CONSTRAINT [DF_Customers_CreatedAt] DEFAULT (SYSDATETIME()),
    CONSTRAINT [PK_Customers] PRIMARY KEY ([Id]),
    CONSTRAINT [UQ_Customers_Email] UNIQUE ([Email])
);


CREATE TABLE [dbo].[test_messages] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [message] NVARCHAR(200) NOT NULL,
    CONSTRAINT [PK_Test_Messages] PRIMARY KEY ([id])
);
