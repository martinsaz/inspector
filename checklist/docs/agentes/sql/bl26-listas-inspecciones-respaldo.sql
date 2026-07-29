/*
    BL26 - ListasInspecciones
    Fecha de preparación: 2026-07-29
    Estado: PREPARADO, NO EJECUTADO

    Objetivo:
    - respaldar tablas existentes que serían modificadas
    - no ejecuta cambios estructurales si este archivo no se corre manualmente
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.Listas', N'U') IS NULL
    BEGIN
        THROW 61000, 'No existe dbo.Listas.', 1;
    END;

    IF OBJECT_ID(N'dbo.ListasRespuestas', N'U') IS NULL
    BEGIN
        THROW 61001, 'No existe dbo.ListasRespuestas.', 1;
    END;

    IF OBJECT_ID(N'dbo.Listas_BKP_BL26_LISTASINSPECCIONES_20260729', N'U') IS NOT NULL
    BEGIN
        THROW 61002, 'Ya existe dbo.Listas_BKP_BL26_LISTASINSPECCIONES_20260729. No se sobrescribe.', 1;
    END;

    IF OBJECT_ID(N'dbo.ListasRespuestas_BKP_BL26_LISTASINSPECCIONES_20260729', N'U') IS NOT NULL
    BEGIN
        THROW 61003, 'Ya existe dbo.ListasRespuestas_BKP_BL26_LISTASINSPECCIONES_20260729. No se sobrescribe.', 1;
    END;

    DECLARE @ListasOrigen bigint;
    DECLARE @ListasRespuestasOrigen bigint;
    DECLARE @ListasBackup bigint;
    DECLARE @ListasRespuestasBackup bigint;

    SELECT @ListasOrigen = COUNT(*) FROM dbo.Listas;
    SELECT @ListasRespuestasOrigen = COUNT(*) FROM dbo.ListasRespuestas;

    SELECT *
    INTO dbo.Listas_BKP_BL26_LISTASINSPECCIONES_20260729
    FROM dbo.Listas;

    SELECT *
    INTO dbo.ListasRespuestas_BKP_BL26_LISTASINSPECCIONES_20260729
    FROM dbo.ListasRespuestas;

    SELECT @ListasBackup = COUNT(*) FROM dbo.Listas_BKP_BL26_LISTASINSPECCIONES_20260729;
    SELECT @ListasRespuestasBackup = COUNT(*) FROM dbo.ListasRespuestas_BKP_BL26_LISTASINSPECCIONES_20260729;

    IF @ListasOrigen <> @ListasBackup
    BEGIN
        THROW 61004, 'El conteo de dbo.Listas no coincide con su respaldo.', 1;
    END;

    IF @ListasRespuestasOrigen <> @ListasRespuestasBackup
    BEGIN
        THROW 61005, 'El conteo de dbo.ListasRespuestas no coincide con su respaldo.', 1;
    END;

    SELECT
        TablaOrigen = N'dbo.Listas',
        FilasOrigen = @ListasOrigen,
        TablaRespaldo = N'dbo.Listas_BKP_BL26_LISTASINSPECCIONES_20260729',
        FilasRespaldo = @ListasBackup
    UNION ALL
    SELECT
        TablaOrigen = N'dbo.ListasRespuestas',
        FilasOrigen = @ListasRespuestasOrigen,
        TablaRespaldo = N'dbo.ListasRespuestas_BKP_BL26_LISTASINSPECCIONES_20260729',
        FilasRespaldo = @ListasRespuestasBackup;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @ErrorMessage nvarchar(4000) = ERROR_MESSAGE();
    DECLARE @ErrorNumber int = ERROR_NUMBER();
    DECLARE @ErrorLine int = ERROR_LINE();

    RAISERROR(
        'bl26-listas-inspecciones-respaldo.sql fallo. Numero: %d. Linea: %d. Detalle: %s',
        16,
        1,
        @ErrorNumber,
        @ErrorLine,
        @ErrorMessage
    );

    THROW;
END CATCH;
