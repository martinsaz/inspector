/*
    NO APROBADO / NO EJECUTAR
    Script reemplazado por la arquitectura con dbo.ListasInspecciones
    Motivo del rechazo:
    - proponía agregar idActivo directo a dbo.ListasRespuestas
    - esa arquitectura fue descartada por duplicar el activo por respuesta
    Fecha de descarte: 2026-07-29
*/

IF COL_LENGTH('dbo.Listas', 'UsaActivos') IS NULL
BEGIN
    ALTER TABLE dbo.Listas
    ADD UsaActivos bit NOT NULL
        CONSTRAINT DF_Listas_UsaActivos_BL26_20260729 DEFAULT (0);
END;

IF COL_LENGTH('dbo.Listas', 'idTipoActivo') IS NULL
BEGIN
    ALTER TABLE dbo.Listas
    ADD idTipoActivo uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Listas_ActivosTipos_idTipoActivo_BL26_20260729'
)
AND COL_LENGTH('dbo.Listas', 'idTipoActivo') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Listas
    ADD CONSTRAINT FK_Listas_ActivosTipos_idTipoActivo_BL26_20260729
        FOREIGN KEY (idTipoActivo) REFERENCES dbo.ActivosTipos (id);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Listas')
      AND name = N'IX_Listas_Ejecutables_Activos_BL26_20260729'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Listas_Ejecutables_Activos_BL26_20260729
        ON dbo.Listas (idEmpresa, Estado, [Status], Activo, UsaActivos, idTipoActivo, Nombre);
END;

IF COL_LENGTH('dbo.ListasRespuestas', 'idActivo') IS NULL
BEGIN
    ALTER TABLE dbo.ListasRespuestas
    ADD idActivo uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_ListasRespuestas_Activos_idActivo_BL26_20260729'
)
AND COL_LENGTH('dbo.ListasRespuestas', 'idActivo') IS NOT NULL
BEGIN
    ALTER TABLE dbo.ListasRespuestas
    ADD CONSTRAINT FK_ListasRespuestas_Activos_idActivo_BL26_20260729
        FOREIGN KEY (idActivo) REFERENCES dbo.Activos (id);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ListasRespuestas')
      AND name = N'IX_ListasRespuestas_Evento_Activo_BL26_20260729'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_ListasRespuestas_Evento_Activo_BL26_20260729
        ON dbo.ListasRespuestas (evento, idLista, idActivo, idSucursal, idUsuario);
END;
