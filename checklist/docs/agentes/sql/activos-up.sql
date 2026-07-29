SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.ActivosEstadosOperativos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ActivosEstadosOperativos
    (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ActivosEstadosOperativos PRIMARY KEY,
        idEmpresa UNIQUEIDENTIFIER NOT NULL,
        Codigo NVARCHAR(64) NOT NULL,
        Nombre NVARCHAR(160) NOT NULL,
        Descripcion NVARCHAR(400) NOT NULL CONSTRAINT DF_ActivosEstadosOperativos_Descripcion DEFAULT (N''),
        PermiteOperacion BIT NOT NULL CONSTRAINT DF_ActivosEstadosOperativos_PermiteOperacion DEFAULT ((1)),
        Orden INT NOT NULL CONSTRAINT DF_ActivosEstadosOperativos_Orden DEFAULT ((0)),
        Activo BIT NOT NULL CONSTRAINT DF_ActivosEstadosOperativos_Activo DEFAULT ((1)),
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_ActivosEstadosOperativos_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        FechaActualizacion DATETIME2 NOT NULL CONSTRAINT DF_ActivosEstadosOperativos_FechaActualizacion DEFAULT (SYSUTCDATETIME())
    );
END;

IF COL_LENGTH(N'dbo.Activos', N'idSitio') IS NOT NULL AND COL_LENGTH(N'dbo.Activos', N'idSucursal') IS NULL
BEGIN
    EXEC sp_rename N'dbo.Activos.idSitio', N'idSucursal', N'COLUMN';
END;

IF COL_LENGTH(N'dbo.Activos', N'idDepartamento') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Activos DROP COLUMN idDepartamento;
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ActivosEstadosOperativos')
      AND name = N'UX_ActivosEstadosOperativos_IdEmpresa_Codigo'
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UX_ActivosEstadosOperativos_IdEmpresa_Codigo
        ON dbo.ActivosEstadosOperativos (idEmpresa, Codigo);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ActivosEstadosOperativos')
      AND name = N'IX_ActivosEstadosOperativos_IdEmpresa_Activo_Orden'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_ActivosEstadosOperativos_IdEmpresa_Activo_Orden
        ON dbo.ActivosEstadosOperativos (idEmpresa, Activo, Orden, Nombre);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ActivosTipos')
      AND name = N'UX_ActivosTipos_IdEmpresa_Codigo'
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UX_ActivosTipos_IdEmpresa_Codigo
        ON dbo.ActivosTipos (idEmpresa, Codigo);
END;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Activos')
      AND name = N'UX_nxt_ast_assets_empresa_codigo'
)
BEGIN
    EXEC sp_rename N'dbo.Activos.UX_nxt_ast_assets_empresa_codigo', N'UX_Activos_IdEmpresa_Codigo', N'INDEX';
END;
ELSE IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Activos')
      AND name = N'UX_Activos_IdEmpresa_Codigo'
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UX_Activos_IdEmpresa_Codigo
        ON dbo.Activos (idEmpresa, Codigo);
END;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Activos')
      AND name = N'IX_nxt_ast_assets_site_state'
)
BEGIN
    EXEC sp_rename N'dbo.Activos.IX_nxt_ast_assets_site_state', N'IX_Activos_IdEmpresa_Estado_Tipo_Sucursal', N'INDEX';
END;
ELSE IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Activos')
      AND name = N'IX_Activos_IdEmpresa_Estado_Tipo_Sucursal'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Activos_IdEmpresa_Estado_Tipo_Sucursal
        ON dbo.Activos (idEmpresa, idSucursal, idEstadoOperativo, Activo);
END;

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Activos_ActivosTipos_idTipoActivo'
)
BEGIN
    ALTER TABLE dbo.Activos DROP CONSTRAINT FK_Activos_ActivosTipos_idTipoActivo;
END;

ALTER TABLE dbo.Activos WITH CHECK
ADD CONSTRAINT FK_Activos_ActivosTipos_idTipoActivo
FOREIGN KEY (idTipoActivo) REFERENCES dbo.ActivosTipos (id);

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Activos_ActivosEstadosOperativos_idEstadoOperativo'
)
BEGIN
    ALTER TABLE dbo.Activos DROP CONSTRAINT FK_Activos_ActivosEstadosOperativos_idEstadoOperativo;
END;

ALTER TABLE dbo.Activos WITH CHECK
ADD CONSTRAINT FK_Activos_ActivosEstadosOperativos_idEstadoOperativo
FOREIGN KEY (idEstadoOperativo) REFERENCES dbo.ActivosEstadosOperativos (id);

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Activos_Sucursales_idSucursal'
)
BEGIN
    ALTER TABLE dbo.Activos DROP CONSTRAINT FK_Activos_Sucursales_idSucursal;
END;

ALTER TABLE dbo.Activos WITH CHECK
ADD CONSTRAINT FK_Activos_Sucursales_idSucursal
FOREIGN KEY (idSucursal) REFERENCES dbo.Sucursales (id);

COMMIT TRANSACTION;
