ALTER TABLE [CalculationOptions] DROP CONSTRAINT [FK_CalculationOptions_Sheet_SheetId];

GO

ALTER TABLE [Category] DROP CONSTRAINT [FK_Category_AppOwner_OwnerId];

GO

ALTER TABLE [AspNetUsers] DROP CONSTRAINT [FK_AppUser_AppOwner_GroupId];

GO

ALTER TABLE [Sheet] DROP CONSTRAINT [FK_Sheet_AppOwner_OwnerId];

GO

ALTER TABLE [SheetEntry] DROP CONSTRAINT [FK_SheetEntry_Sheet_SheetId];

GO

ALTER TABLE [AspNetRoleClaims] DROP CONSTRAINT [FK_IdentityRoleClaim<int>_AppRole_RoleId];

GO

ALTER TABLE [AspNetUserClaims] DROP CONSTRAINT [FK_IdentityUserClaim<int>_AppUser_UserId];

GO

ALTER TABLE [AspNetUserLogins] DROP CONSTRAINT [FK_IdentityUserLogin<int>_AppUser_UserId];

GO

ALTER TABLE [AspNetUserRoles] DROP CONSTRAINT [FK_IdentityUserRole<int>_AppRole_RoleId];

GO

ALTER TABLE [AspNetUserRoles] DROP CONSTRAINT [FK_IdentityUserRole<int>_AppUser_UserId];

GO

ALTER TABLE [CalculationOptions] ADD CONSTRAINT [FK_CalculationOptions_Sheet_SheetId] FOREIGN KEY ([SheetId]) REFERENCES [Sheet] ([Id]) ON DELETE CASCADE;

GO

ALTER TABLE [Category] ADD CONSTRAINT [FK_Category_AppOwner_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [AppOwner] ([Id]) ON DELETE CASCADE;

GO

ALTER TABLE [AspNetUsers] ADD CONSTRAINT [FK_AppUser_AppOwner_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [AppOwner] ([Id]) ON DELETE CASCADE;

GO

ALTER TABLE [Sheet] ADD CONSTRAINT [FK_Sheet_AppOwner_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [AppOwner] ([Id]) ON DELETE CASCADE;

GO

ALTER TABLE [SheetEntry] ADD CONSTRAINT [FK_SheetEntry_Sheet_SheetId] FOREIGN KEY ([SheetId]) REFERENCES [Sheet] ([Id]) ON DELETE CASCADE;

GO

ALTER TABLE [AspNetRoleClaims] ADD CONSTRAINT [FK_IdentityRoleClaim<int>_AppRole_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE;

GO

ALTER TABLE [AspNetUserClaims] ADD CONSTRAINT [FK_IdentityUserClaim<int>_AppUser_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE;

GO

ALTER TABLE [AspNetUserLogins] ADD CONSTRAINT [FK_IdentityUserLogin<int>_AppUser_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE;

GO

ALTER TABLE [AspNetUserRoles] ADD CONSTRAINT [FK_IdentityUserRole<int>_AppRole_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE;

GO

ALTER TABLE [AspNetUserRoles] ADD CONSTRAINT [FK_IdentityUserRole<int>_AppUser_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE;

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20160106195425_1_0_0_rc1_final', N'7.0.0-rc1-16348');

GO


