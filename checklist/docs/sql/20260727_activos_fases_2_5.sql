IF OBJECT_ID(N'dbo.ActivosMarcas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ActivosMarcas
    (
        id uniqueidentifier NOT NULL,
        idEmpresa uniqueidentifier NOT NULL,
        Codigo nvarchar(64) NOT NULL,
        Nombre nvarchar(160) NOT NULL,
        Descripcion nvarchar(400) NULL,
        Activo bit NOT NULL CONSTRAINT DF_ActivosMarcas_Activo DEFAULT (1),
        FechaCreacion datetime2(0) NOT NULL CONSTRAINT DF_ActivosMarcas_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        FechaActualizacion datetime2(0) NOT NULL CONSTRAINT DF_ActivosMarcas_FechaActualizacion DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_ActivosMarcas PRIMARY KEY CLUSTERED (id)
    );
END
GO

IF OBJECT_ID(N'dbo.ActivosProveedores', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ActivosProveedores
    (
        id uniqueidentifier NOT NULL,
        idEmpresa uniqueidentifier NOT NULL,
        Codigo nvarchar(64) NOT NULL,
        Nombre nvarchar(160) NOT NULL,
        Descripcion nvarchar(max) NULL,
        RazonSocial nvarchar(250) NULL,
        RFC nvarchar(15) NULL,
        Telefono nvarchar(15) NULL,
        Telefono1 nvarchar(15) NULL,
        Email nvarchar(50) NULL,
        Limite decimal(18,2) NOT NULL CONSTRAINT DF_ActivosProveedores_Limite DEFAULT (0),
        ClasifContable bit NOT NULL CONSTRAINT DF_ActivosProveedores_ClasifContable DEFAULT (0),
        CuentaContable nvarchar(255) NULL,
        Contacto nvarchar(255) NULL,
        CuentaBancaria nvarchar(255) NULL,
        Activo bit NOT NULL CONSTRAINT DF_ActivosProveedores_Activo DEFAULT (1),
        FechaCreacion datetime2(0) NOT NULL CONSTRAINT DF_ActivosProveedores_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        FechaActualizacion datetime2(0) NOT NULL CONSTRAINT DF_ActivosProveedores_FechaActualizacion DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_ActivosProveedores PRIMARY KEY CLUSTERED (id)
    );
END
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'RazonSocial') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD RazonSocial nvarchar(250) NULL;
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'RFC') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD RFC nvarchar(15) NULL;
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'Telefono') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD Telefono nvarchar(15) NULL;
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'Telefono1') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD Telefono1 nvarchar(15) NULL;
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'Email') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD Email nvarchar(50) NULL;
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'Limite') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD Limite decimal(18,2) NOT NULL CONSTRAINT DF_ActivosProveedores_Limite DEFAULT (0);
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'ClasifContable') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD ClasifContable bit NOT NULL CONSTRAINT DF_ActivosProveedores_ClasifContable DEFAULT (0);
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'CuentaContable') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD CuentaContable nvarchar(255) NULL;
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'Contacto') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD Contacto nvarchar(255) NULL;
GO

IF COL_LENGTH('dbo.ActivosProveedores', 'CuentaBancaria') IS NULL
    ALTER TABLE dbo.ActivosProveedores ADD CuentaBancaria nvarchar(255) NULL;
GO

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.ActivosProveedores') AND name = N'Descripcion' AND max_length <> -1)
    ALTER TABLE dbo.ActivosProveedores ALTER COLUMN Descripcion nvarchar(max) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.ActivosProveedores') AND name = N'CK_ActivosProveedores_Limite')
    ALTER TABLE dbo.ActivosProveedores ADD CONSTRAINT CK_ActivosProveedores_Limite CHECK (Limite >= 0);
GO

IF OBJECT_ID(N'dbo.ActivosMultimedia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ActivosMultimedia
    (
        id uniqueidentifier NOT NULL,
        idActivo uniqueidentifier NOT NULL,
        TipoMultimedia nvarchar(20) NOT NULL,
        Foto bit NOT NULL CONSTRAINT DF_ActivosMultimedia_Foto DEFAULT (0),
        Video bit NOT NULL CONSTRAINT DF_ActivosMultimedia_Video DEFAULT (0),
        Documento bit NOT NULL CONSTRAINT DF_ActivosMultimedia_Documento DEFAULT (0),
        NombreOriginal nvarchar(255) NOT NULL,
        NombreAlmacenado nvarchar(255) NOT NULL,
        Extension nvarchar(20) NOT NULL,
        MimeType nvarchar(120) NOT NULL,
        UrlFirebase nvarchar(1024) NOT NULL,
        PesoBytes bigint NOT NULL CONSTRAINT DF_ActivosMultimedia_PesoBytes DEFAULT (0),
        Orden int NOT NULL CONSTRAINT DF_ActivosMultimedia_Orden DEFAULT (1),
        Activo bit NOT NULL CONSTRAINT DF_ActivosMultimedia_Activo DEFAULT (1),
        FechaCreacion datetime2(0) NOT NULL CONSTRAINT DF_ActivosMultimedia_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        FechaActualizacion datetime2(0) NOT NULL CONSTRAINT DF_ActivosMultimedia_FechaActualizacion DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_ActivosMultimedia PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_ActivosMultimedia_Tipo CHECK (TipoMultimedia IN (N'foto', N'video', N'documento'))
    );
END
GO

IF COL_LENGTH(N'dbo.Activos', N'idMarca') IS NULL
BEGIN
    ALTER TABLE dbo.Activos
    ADD idMarca uniqueidentifier NULL;
END
GO

IF COL_LENGTH(N'dbo.Activos', N'idProveedor') IS NULL
BEGIN
    ALTER TABLE dbo.Activos
    ADD idProveedor uniqueidentifier NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_ActivosMarcas_EmpresaActivoNombre'
      AND object_id = OBJECT_ID(N'dbo.ActivosMarcas')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_ActivosMarcas_EmpresaActivoNombre
        ON dbo.ActivosMarcas (idEmpresa, Activo, Nombre, Codigo);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_ActivosProveedores_EmpresaActivoNombre'
      AND object_id = OBJECT_ID(N'dbo.ActivosProveedores')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_ActivosProveedores_EmpresaActivoNombre
        ON dbo.ActivosProveedores (idEmpresa, Activo, Nombre, Codigo);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_ActivosMultimedia_ActivoActivoTipoOrden'
      AND object_id = OBJECT_ID(N'dbo.ActivosMultimedia')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_ActivosMultimedia_ActivoActivoTipoOrden
        ON dbo.ActivosMultimedia (idActivo, Activo, TipoMultimedia, Orden);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Activos_IdEmpresaMarcaProveedor'
      AND object_id = OBJECT_ID(N'dbo.Activos')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Activos_IdEmpresaMarcaProveedor
        ON dbo.Activos (idEmpresa, idMarca, idProveedor);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Activos_IdMarca_ActivosMarcas'
)
BEGIN
    ALTER TABLE dbo.Activos WITH CHECK
    ADD CONSTRAINT FK_Activos_IdMarca_ActivosMarcas
        FOREIGN KEY (idMarca) REFERENCES dbo.ActivosMarcas (id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Activos_IdProveedor_ActivosProveedores'
)
BEGIN
    ALTER TABLE dbo.Activos WITH CHECK
    ADD CONSTRAINT FK_Activos_IdProveedor_ActivosProveedores
        FOREIGN KEY (idProveedor) REFERENCES dbo.ActivosProveedores (id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_ActivosMultimedia_IdActivo_Activos'
)
BEGIN
    ALTER TABLE dbo.ActivosMultimedia WITH CHECK
    ADD CONSTRAINT FK_ActivosMultimedia_IdActivo_Activos
        FOREIGN KEY (idActivo) REFERENCES dbo.Activos (id);
END
GO
