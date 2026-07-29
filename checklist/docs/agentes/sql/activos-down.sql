SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Activos_Sucursales_idSucursal'
)
BEGIN
    ALTER TABLE dbo.Activos DROP CONSTRAINT FK_Activos_Sucursales_idSucursal;
END;

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Activos_ActivosEstadosOperativos_idEstadoOperativo'
)
BEGIN
    ALTER TABLE dbo.Activos DROP CONSTRAINT FK_Activos_ActivosEstadosOperativos_idEstadoOperativo;
END;

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Activos_ActivosTipos_idTipoActivo'
)
BEGIN
    ALTER TABLE dbo.Activos DROP CONSTRAINT FK_Activos_ActivosTipos_idTipoActivo;
END;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Activos')
      AND name = N'IX_Activos_IdEmpresa_Estado_Tipo_Sucursal'
)
BEGIN
    EXEC sp_rename N'dbo.Activos.IX_Activos_IdEmpresa_Estado_Tipo_Sucursal', N'IX_nxt_ast_assets_site_state', N'INDEX';
END;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Activos')
      AND name = N'UX_Activos_IdEmpresa_Codigo'
)
BEGIN
    EXEC sp_rename N'dbo.Activos.UX_Activos_IdEmpresa_Codigo', N'UX_nxt_ast_assets_empresa_codigo', N'INDEX';
END;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ActivosTipos')
      AND name = N'UX_ActivosTipos_IdEmpresa_Codigo'
)
BEGIN
    DROP INDEX UX_ActivosTipos_IdEmpresa_Codigo ON dbo.ActivosTipos;
END;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ActivosEstadosOperativos')
      AND name = N'IX_ActivosEstadosOperativos_IdEmpresa_Activo_Orden'
)
BEGIN
    DROP INDEX IX_ActivosEstadosOperativos_IdEmpresa_Activo_Orden ON dbo.ActivosEstadosOperativos;
END;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ActivosEstadosOperativos')
      AND name = N'UX_ActivosEstadosOperativos_IdEmpresa_Codigo'
)
BEGIN
    DROP INDEX UX_ActivosEstadosOperativos_IdEmpresa_Codigo ON dbo.ActivosEstadosOperativos;
END;

IF COL_LENGTH(N'dbo.Activos', N'idDepartamento') IS NULL
BEGIN
    ALTER TABLE dbo.Activos ADD idDepartamento UNIQUEIDENTIFIER NULL;
END;

IF COL_LENGTH(N'dbo.Activos', N'idSucursal') IS NOT NULL AND COL_LENGTH(N'dbo.Activos', N'idSitio') IS NULL
BEGIN
    EXEC sp_rename N'dbo.Activos.idSucursal', N'idSitio', N'COLUMN';
END;

IF OBJECT_ID(N'dbo.ActivosEstadosOperativos', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.ActivosEstadosOperativos;
END;

COMMIT TRANSACTION;
