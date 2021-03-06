IF OBJECT_ID(N'__EFMigrationsHistory') IS NULL
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK_HistoryRow] PRIMARY KEY ([MigrationId])
    );

GO

CREATE TABLE [AppOwner] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_AppOwner] PRIMARY KEY ([Id])
);

GO

CREATE TABLE [AspNetRoles] (
    [Id] int NOT NULL IDENTITY,
    [ConcurrencyStamp] nvarchar(max),
    [Name] nvarchar(256),
    [NormalizedName] nvarchar(256),
    CONSTRAINT [PK_AppRole] PRIMARY KEY ([Id])
);

GO

CREATE TABLE [Category] (
    [Id] int NOT NULL IDENTITY,
    [Description] nvarchar(max),
    [Name] nvarchar(250) NOT NULL,
    [OwnerId] int NOT NULL,
    CONSTRAINT [PK_Category] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Category_AppOwner_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [AppOwner] ([Id]) ON DELETE CASCADE
);

GO

CREATE TABLE [AspNetUsers] (
    [Id] int NOT NULL IDENTITY,
    [AccessFailedCount] int NOT NULL,
    [ConcurrencyStamp] nvarchar(max),
    [Email] nvarchar(256),
    [EmailConfirmed] bit NOT NULL,
    [GroupId] int NOT NULL,
    [LockoutEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset,
    [NormalizedEmail] nvarchar(256),
    [NormalizedUserName] nvarchar(256),
    [PasswordHash] nvarchar(max),
    [PhoneNumber] nvarchar(max),
    [PhoneNumberConfirmed] bit NOT NULL,
    [SecurityStamp] nvarchar(max),
    [TwoFactorEnabled] bit NOT NULL,
    [UserName] nvarchar(256),
    CONSTRAINT [PK_AppUser] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AppUser_AppOwner_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [AppOwner] ([Id]) ON DELETE CASCADE
);

GO

CREATE TABLE [Sheet] (
    [Id] int NOT NULL IDENTITY,
    [CreateTimestamp] datetime2 NOT NULL,
    [Name] nvarchar(250),
    [OwnerId] int NOT NULL,
    [Subject] datetime2 NOT NULL,
    [UpdateTimestamp] datetime2 NOT NULL,
    CONSTRAINT [PK_Sheet] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Sheet_AppOwner_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [AppOwner] ([Id]) ON DELETE CASCADE
);

GO

CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [ClaimType] nvarchar(max),
    [ClaimValue] nvarchar(max),
    [RoleId] int NOT NULL,
    CONSTRAINT [PK_IdentityRoleClaim<int>] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_IdentityRoleClaim<int>_AppRole_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);

GO

CREATE TABLE [AppUserTrustedUsers] (
    [Id] int NOT NULL IDENTITY,
    [SourceUserId] int,
    [TargetUserId] int,
    CONSTRAINT [PK_AppUserTrustedUser] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AppUserTrustedUser_AppUser_SourceUserId] FOREIGN KEY ([SourceUserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_AppUserTrustedUser_AppUser_TargetUserId] FOREIGN KEY ([TargetUserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
);

GO

CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [ClaimType] nvarchar(max),
    [ClaimValue] nvarchar(max),
    [UserId] int NOT NULL,
    CONSTRAINT [PK_IdentityUserClaim<int>] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_IdentityUserClaim<int>_AppUser_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

GO

CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max),
    [UserId] int NOT NULL,
    CONSTRAINT [PK_IdentityUserLogin<int>] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_IdentityUserLogin<int>_AppUser_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

GO

CREATE TABLE [AspNetUserRoles] (
    [UserId] int NOT NULL,
    [RoleId] int NOT NULL,
    CONSTRAINT [PK_IdentityUserRole<int>] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_IdentityUserRole<int>_AppRole_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_IdentityUserRole<int>_AppUser_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

GO

CREATE TABLE [CalculationOptions] (
    [SheetId] int NOT NULL,
    [BankAccountOffset] decimal(18, 2),
    [SavingsAccountOffset] decimal(18, 2),
    CONSTRAINT [PK_CalculationOptions] PRIMARY KEY ([SheetId]),
    CONSTRAINT [FK_CalculationOptions_Sheet_SheetId] FOREIGN KEY ([SheetId]) REFERENCES [Sheet] ([Id]) ON DELETE CASCADE
);

GO

CREATE TABLE [SheetEntry] (
    [Id] int NOT NULL IDENTITY,
    [Account] int NOT NULL,
    [CategoryId] int NOT NULL,
    [CreateTimestamp] datetime2 NOT NULL,
    [Delta] decimal(18, 2) NOT NULL,
    [Remark] nvarchar(max),
    [SheetId] int NOT NULL,
    [SortOrder] int NOT NULL,
    [Source] nvarchar(250),
    [UpdateTimestamp] datetime2 NOT NULL,
    CONSTRAINT [PK_SheetEntry] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SheetEntry_Category_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Category] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_SheetEntry_Sheet_SheetId] FOREIGN KEY ([SheetId]) REFERENCES [Sheet] ([Id]) ON DELETE CASCADE
);

GO

CREATE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]);

GO

CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);

GO

CREATE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]);

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20151124220045_InitialCreate', N'7.0.0-rc1-16348');

GO


