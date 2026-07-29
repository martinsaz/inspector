/*
    NO APROBADO / NO EJECUTAR
    Script reemplazado por la arquitectura con dbo.ListasInspecciones
    Motivo del rechazo:
    - revierte un cambio ya no aprobado por Product Owner
    Fecha de descarte: 2026-07-29
*/

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ListasRespuestas')
      AND name = N'IX_ListasRespuestas_Evento_Activo_BL26_20260729'
)
BEGIN
    DROP INDEX IX_ListasRespuestas_Evento_Activo_BL26_20260729
        ON dbo.ListasRespuestas;
END;

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_ListasRespuestas_Activos_idActivo_BL26_20260729'
)
BEGIN
    ALTER TABLE dbo.ListasRespuestas
    DROP CONSTRAINT FK_ListasRespuestas_Activos_idActivo_BL26_20260729;
END;

IF COL_LENGTH('dbo.ListasRespuestas', 'idActivo') IS NOT NULL
BEGIN
    ALTER TABLE dbo.ListasRespuestas
    DROP COLUMN idActivo;
END;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Listas')
      AND name = N'IX_Listas_Ejecutables_Activos_BL26_20260729'
)
BEGIN
    DROP INDEX IX_Listas_Ejecutables_Activos_BL26_20260729
        ON dbo.Listas;
END;

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Listas_ActivosTipos_idTipoActivo_BL26_20260729'
)
BEGIN
    ALTER TABLE dbo.Listas
    DROP CONSTRAINT FK_Listas_ActivosTipos_idTipoActivo_BL26_20260729;
END;

IF COL_LENGTH('dbo.Listas', 'idTipoActivo') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Listas
    DROP COLUMN idTipoActivo;
END;

IF COL_LENGTH('dbo.Listas', 'UsaActivos') IS NOT NULL
BEGIN
    DECLARE @dfListasUsaActivos sysname;

    SELECT @dfListasUsaActivos = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c
        ON c.object_id = dc.parent_object_id
       AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID(N'dbo.Listas')
      AND c.name = N'UsaActivos';

    IF @dfListasUsaActivos IS NOT NULL
    BEGIN
        EXEC ('ALTER TABLE dbo.Listas DROP CONSTRAINT ' + QUOTENAME(@dfListasUsaActivos));
    END;

    ALTER TABLE dbo.Listas
    DROP COLUMN UsaActivos;
END;
