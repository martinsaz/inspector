/*
    BL26 - ListasInspecciones
    Fecha de preparación: 2026-07-29
    Estado: PREPARADO, NO EJECUTADO

    Advertencia:
    - este rollback elimina la cabecera nueva y la relación desde detalle
    - puede causar pérdida de referencias creadas después del despliegue
    - no debe ejecutarse sin autorización expresa
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.ListasInspecciones', N'U') IS NOT NULL
       AND EXISTS (
            SELECT 1
            FROM dbo.ListasInspecciones
       )
    BEGIN
        THROW 63000, 'dbo.ListasInspecciones contiene datos. Revisar pérdida potencial antes de revertir.', 1;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasRespuestas')
          AND name = N'IX_ListasRespuestas_IdInspeccion_20260729'
    )
    BEGIN
        DROP INDEX IX_ListasRespuestas_IdInspeccion_20260729
        ON dbo.ListasRespuestas;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_ListasRespuestas_ListasInspecciones_BL26_20260729'
    )
    BEGIN
        ALTER TABLE dbo.ListasRespuestas
        DROP CONSTRAINT FK_ListasRespuestas_ListasInspecciones_BL26_20260729;
    END;

    IF COL_LENGTH(N'dbo.ListasRespuestas', N'idInspeccion') IS NOT NULL
    BEGIN
        ALTER TABLE dbo.ListasRespuestas
        DROP COLUMN idInspeccion;
    END;

    IF OBJECT_ID(N'dbo.ListasInspecciones', N'U') IS NOT NULL
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
              AND name = N'IX_ListasInspecciones_IdEmpresa_IdLista_20260729'
        )
        BEGIN
            DROP INDEX IX_ListasInspecciones_IdEmpresa_IdLista_20260729
            ON dbo.ListasInspecciones;
        END;

        IF EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
              AND name = N'IX_ListasInspecciones_IdActivo_20260729'
        )
        BEGIN
            DROP INDEX IX_ListasInspecciones_IdActivo_20260729
            ON dbo.ListasInspecciones;
        END;

        IF EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
              AND name = N'IX_ListasInspecciones_IdUsuarioResponsable_20260729'
        )
        BEGIN
            DROP INDEX IX_ListasInspecciones_IdUsuarioResponsable_20260729
            ON dbo.ListasInspecciones;
        END;

        IF EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
              AND name = N'IX_ListasInspecciones_IdSucursal_20260729'
        )
        BEGIN
            DROP INDEX IX_ListasInspecciones_IdSucursal_20260729
            ON dbo.ListasInspecciones;
        END;

        IF EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
              AND name = N'IX_ListasInspecciones_EventoLegacy_20260729'
        )
        BEGIN
            DROP INDEX IX_ListasInspecciones_EventoLegacy_20260729
            ON dbo.ListasInspecciones;
        END;

        IF EXISTS (
            SELECT 1
            FROM sys.foreign_keys
            WHERE name = N'FK_ListasInspecciones_Activos_BL26_20260729'
        )
        BEGIN
            ALTER TABLE dbo.ListasInspecciones
            DROP CONSTRAINT FK_ListasInspecciones_Activos_BL26_20260729;
        END;

        IF EXISTS (
            SELECT 1
            FROM sys.foreign_keys
            WHERE name = N'FK_ListasInspecciones_Listas_BL26_20260729'
        )
        BEGIN
            ALTER TABLE dbo.ListasInspecciones
            DROP CONSTRAINT FK_ListasInspecciones_Listas_BL26_20260729;
        END;

        DROP TABLE dbo.ListasInspecciones;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Listas')
          AND name = N'IX_Listas_BL26_UsaActivos_TipoActivo_20260729'
    )
    BEGIN
        DROP INDEX IX_Listas_BL26_UsaActivos_TipoActivo_20260729
        ON dbo.Listas;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Listas')
          AND name = N'UX_Listas_Id_BL26_20260729'
    )
    BEGIN
        DROP INDEX UX_Listas_Id_BL26_20260729
        ON dbo.Listas;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_Listas_ActivosTipos_idTipoActivo_BL26_LISTASINSPECCIONES_20260729'
    )
    BEGIN
        ALTER TABLE dbo.Listas
        DROP CONSTRAINT FK_Listas_ActivosTipos_idTipoActivo_BL26_LISTASINSPECCIONES_20260729;
    END;

    IF COL_LENGTH(N'dbo.Listas', N'idTipoActivo') IS NOT NULL
    BEGIN
        ALTER TABLE dbo.Listas
        DROP COLUMN idTipoActivo;
    END;

    IF COL_LENGTH(N'dbo.Listas', N'UsaActivos') IS NOT NULL
    BEGIN
        DECLARE @DefaultUsaActivos sysname;

        SELECT @DefaultUsaActivos = dc.name
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c
            ON c.object_id = dc.parent_object_id
           AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'dbo.Listas')
          AND c.name = N'UsaActivos';

        IF @DefaultUsaActivos IS NOT NULL
        BEGIN
            EXEC (N'ALTER TABLE dbo.Listas DROP CONSTRAINT ' + QUOTENAME(@DefaultUsaActivos));
        END;

        ALTER TABLE dbo.Listas
        DROP COLUMN UsaActivos;
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @ErrorMessage nvarchar(4000) = ERROR_MESSAGE();
    DECLARE @ErrorNumber int = ERROR_NUMBER();
    DECLARE @ErrorLine int = ERROR_LINE();

    RAISERROR(
        'bl26-listas-inspecciones-down.sql fallo. Numero: %d. Linea: %d. Detalle: %s',
        16,
        1,
        @ErrorNumber,
        @ErrorLine,
        @ErrorMessage
    );

    THROW;
END CATCH;
