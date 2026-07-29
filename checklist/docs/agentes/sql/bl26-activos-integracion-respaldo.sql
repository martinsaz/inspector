/*
    NO APROBADO / NO EJECUTAR
    Script reemplazado por la arquitectura con dbo.ListasInspecciones
    Motivo del rechazo:
    - proponía agregar idActivo directo a dbo.ListasRespuestas
    - esa arquitectura fue descartada por duplicar el activo por respuesta
    Fecha de descarte: 2026-07-29
*/

IF OBJECT_ID(N'dbo.Listas_BKP_BL26_ACTIVOS_20260729', N'U') IS NULL
BEGIN
    SELECT *
    INTO dbo.Listas_BKP_BL26_ACTIVOS_20260729
    FROM dbo.Listas;
END;

IF OBJECT_ID(N'dbo.ListasRespuestas_BKP_BL26_ACTIVOS_20260729', N'U') IS NULL
BEGIN
    SELECT *
    INTO dbo.ListasRespuestas_BKP_BL26_ACTIVOS_20260729
    FROM dbo.ListasRespuestas;
END;
