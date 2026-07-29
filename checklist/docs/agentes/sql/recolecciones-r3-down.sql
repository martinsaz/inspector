/*
  Recolecciones R3 - Script propuesto de rollback
  Estado: propuesta tecnica, NO EJECUTAR sin autorizacion final

  Importante:
    - Debe retirarse primero la API nueva y cualquier consumo frontend de persistencia R3.
    - Si ya existen ejecuciones nuevas o respuestas con idEjecucion, este script se niega a continuar salvo fuerza explicita.
    - Eliminar estos objetos despues de tener datos nuevos implicaria perder la relacion de ejecucion.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @PermitirPerdidaDatos bit = 0;

BEGIN TRY
    BEGIN TRANSACTION;

    /* 1. Validacion previa de datos nuevos */
    IF OBJECT_ID(N'dbo.InspeccionesEjecuciones', N'U') IS NOT NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.InspeccionesEjecuciones)
           AND @PermitirPerdidaDatos = 0
        BEGIN
            THROW 52000, 'Rollback bloqueado: existen ejecuciones nuevas en dbo.InspeccionesEjecuciones. Respaldar antes de continuar.', 1;
        END;
    END;

    IF COL_LENGTH(N'dbo.ListasRespuestas', N'idEjecucion') IS NOT NULL
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM dbo.ListasRespuestas
            WHERE idEjecucion IS NOT NULL
        )
           AND @PermitirPerdidaDatos = 0
        BEGIN
            THROW 52001, 'Rollback bloqueado: existen respuestas nuevas con idEjecucion. Respaldar antes de continuar.', 1;
        END;
    END;

    /* 2. Retirar indices de detalle */
    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasRespuestas')
          AND name = N'UX_ListasRespuestas_IdEjecucion_IdPregunta_NoTipo3'
    )
    BEGIN
        DROP INDEX UX_ListasRespuestas_IdEjecucion_IdPregunta_NoTipo3
        ON dbo.ListasRespuestas;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasRespuestas')
          AND name = N'IX_ListasRespuestas_IdEjecucion_Recuperacion'
    )
    BEGIN
        DROP INDEX IX_ListasRespuestas_IdEjecucion_Recuperacion
        ON dbo.ListasRespuestas;
    END;

    /* 3. Retirar FK detalle -> cabecera */
    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_ListasRespuestas_InspeccionesEjecuciones'
    )
    BEGIN
        ALTER TABLE dbo.ListasRespuestas
        DROP CONSTRAINT FK_ListasRespuestas_InspeccionesEjecuciones;
    END;

    /* 4. Retirar columna nueva en detalle */
    IF COL_LENGTH(N'dbo.ListasRespuestas', N'idEjecucion') IS NOT NULL
    BEGIN
        ALTER TABLE dbo.ListasRespuestas
        DROP COLUMN idEjecucion;
    END;

    /* 5. Retirar indices de cabecera */
    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.InspeccionesEjecuciones')
          AND name = N'IX_InspeccionesEjecuciones_AbiertaBusqueda'
    )
    BEGIN
        DROP INDEX IX_InspeccionesEjecuciones_AbiertaBusqueda
        ON dbo.InspeccionesEjecuciones;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.InspeccionesEjecuciones')
          AND name = N'UX_InspeccionesEjecuciones_EventoLegacy'
    )
    BEGIN
        DROP INDEX UX_InspeccionesEjecuciones_EventoLegacy
        ON dbo.InspeccionesEjecuciones;
    END;

    /* 6. Retirar FKs de cabecera */
    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_InspeccionesEjecuciones_Usuarios_Inspector'
    )
    BEGIN
        ALTER TABLE dbo.InspeccionesEjecuciones
        DROP CONSTRAINT FK_InspeccionesEjecuciones_Usuarios_Inspector;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_InspeccionesEjecuciones_Usuarios_Responsable'
    )
    BEGIN
        ALTER TABLE dbo.InspeccionesEjecuciones
        DROP CONSTRAINT FK_InspeccionesEjecuciones_Usuarios_Responsable;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_InspeccionesEjecuciones_Sucursales'
    )
    BEGIN
        ALTER TABLE dbo.InspeccionesEjecuciones
        DROP CONSTRAINT FK_InspeccionesEjecuciones_Sucursales;
    END;

    /* 7. Retirar tabla nueva */
    IF OBJECT_ID(N'dbo.InspeccionesEjecuciones', N'U') IS NOT NULL
    BEGIN
        DROP TABLE dbo.InspeccionesEjecuciones;
    END;

    /* 8. Validaciones posteriores */
    SELECT
        Objeto = name,
        Tipo = type_desc
    FROM sys.objects
    WHERE name IN (
        N'InspeccionesEjecuciones',
        N'FK_ListasRespuestas_InspeccionesEjecuciones',
        N'FK_InspeccionesEjecuciones_Sucursales',
        N'FK_InspeccionesEjecuciones_Usuarios_Responsable',
        N'FK_InspeccionesEjecuciones_Usuarios_Inspector'
    );

    SELECT
        ColumnaExiste = CASE WHEN COL_LENGTH(N'dbo.ListasRespuestas', N'idEjecucion') IS NULL THEN 0 ELSE 1 END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
