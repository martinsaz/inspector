/*
    BL26 - ListasInspecciones
    Fecha de preparación: 2026-07-29
    Estado: PREPARADO, NO EJECUTADO

    Arquitectura aprobada:
    - dbo.Listas sigue siendo plantilla
    - dbo.ListasInspecciones será la cabecera oficial de ejecución
    - dbo.ListasRespuestas conservará evento y agregará idInspeccion nullable
    - dbo.ListasProgramacion no llevará FK en esta versión

    Importante:
    - no agrega idActivo a dbo.ListasRespuestas
    - no migra históricos
    - no inventa cabeceras para respuestas previas
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    /* 1. Validaciones previas */
    IF OBJECT_ID(N'dbo.Listas', N'U') IS NULL
    BEGIN
        THROW 62000, 'No existe dbo.Listas.', 1;
    END;

    IF OBJECT_ID(N'dbo.ListasRespuestas', N'U') IS NULL
    BEGIN
        THROW 62001, 'No existe dbo.ListasRespuestas.', 1;
    END;

    IF OBJECT_ID(N'dbo.Activos', N'U') IS NULL
    BEGIN
        THROW 62002, 'No existe dbo.Activos.', 1;
    END;

    IF OBJECT_ID(N'dbo.ActivosTipos', N'U') IS NULL
    BEGIN
        THROW 62003, 'No existe dbo.ActivosTipos.', 1;
    END;

    IF OBJECT_ID(N'dbo.ListasInspecciones', N'U') IS NOT NULL
    BEGIN
        THROW 62004, 'dbo.ListasInspecciones ya existe. Script detenido para evitar colisión.', 1;
    END;

    IF COL_LENGTH(N'dbo.ListasRespuestas', N'idActivo') IS NOT NULL
    BEGIN
        THROW 62005, 'Se detectó dbo.ListasRespuestas.idActivo. Esta arquitectura no está aprobada.', 1;
    END;

    DECLARE @TipoListasId sysname;
    DECLARE @TipoListasRespuestasId sysname;
    DECLARE @TipoActivosId sysname;
    DECLARE @TipoActivosTiposId sysname;
    DECLARE @TipoListasProgramacionId sysname;
    DECLARE @ListasProgramacionTienePk bit = 0;
    DECLARE @ListasProgramacionTieneUnique bit = 0;

    SELECT @TipoListasId = TYPE_NAME(c.user_type_id)
    FROM sys.columns c
    WHERE c.object_id = OBJECT_ID(N'dbo.Listas')
      AND c.name = N'id';

    SELECT @TipoListasRespuestasId = TYPE_NAME(c.user_type_id)
    FROM sys.columns c
    WHERE c.object_id = OBJECT_ID(N'dbo.ListasRespuestas')
      AND c.name = N'id';

    SELECT @TipoActivosId = TYPE_NAME(c.user_type_id)
    FROM sys.columns c
    WHERE c.object_id = OBJECT_ID(N'dbo.Activos')
      AND c.name = N'id';

    SELECT @TipoActivosTiposId = TYPE_NAME(c.user_type_id)
    FROM sys.columns c
    WHERE c.object_id = OBJECT_ID(N'dbo.ActivosTipos')
      AND c.name = N'id';

    IF OBJECT_ID(N'dbo.ListasProgramacion', N'U') IS NOT NULL
    BEGIN
        SELECT @TipoListasProgramacionId = TYPE_NAME(c.user_type_id)
        FROM sys.columns c
        WHERE c.object_id = OBJECT_ID(N'dbo.ListasProgramacion')
          AND c.name = N'id';

        SELECT @ListasProgramacionTienePk =
            CASE WHEN EXISTS (
                SELECT 1
                FROM sys.indexes i
                INNER JOIN sys.index_columns ic
                    ON ic.object_id = i.object_id
                   AND ic.index_id = i.index_id
                INNER JOIN sys.columns c
                    ON c.object_id = ic.object_id
                   AND c.column_id = ic.column_id
                WHERE i.object_id = OBJECT_ID(N'dbo.ListasProgramacion')
                  AND i.is_primary_key = 1
                  AND c.name = N'id'
            ) THEN 1 ELSE 0 END;

        SELECT @ListasProgramacionTieneUnique =
            CASE WHEN EXISTS (
                SELECT 1
                FROM sys.indexes i
                INNER JOIN sys.index_columns ic
                    ON ic.object_id = i.object_id
                   AND ic.index_id = i.index_id
                INNER JOIN sys.columns c
                    ON c.object_id = ic.object_id
                   AND c.column_id = ic.column_id
                WHERE i.object_id = OBJECT_ID(N'dbo.ListasProgramacion')
                  AND i.is_unique = 1
                  AND c.name = N'id'
            ) THEN 1 ELSE 0 END;
    END;

    IF @TipoListasId <> N'uniqueidentifier'
    BEGIN
        THROW 62006, 'dbo.Listas.id no es uniqueidentifier. Revisar modelo real antes de continuar.', 1;
    END;

    IF EXISTS (
        SELECT 1
        FROM dbo.Listas
        WHERE id IS NULL
    )
    BEGIN
        THROW 62011, 'dbo.Listas contiene id NULL. No es seguro crear la clave candidata para la FK.', 1;
    END;

    IF EXISTS (
        SELECT id
        FROM dbo.Listas
        GROUP BY id
        HAVING COUNT(*) > 1
    )
    BEGIN
        THROW 62012, 'dbo.Listas contiene ids duplicados. No es seguro crear la clave candidata para la FK.', 1;
    END;

    IF @TipoListasRespuestasId <> N'uniqueidentifier'
    BEGIN
        THROW 62007, 'dbo.ListasRespuestas.id no es uniqueidentifier. Revisar modelo real antes de continuar.', 1;
    END;

    IF @TipoActivosId <> N'uniqueidentifier'
    BEGIN
        THROW 62008, 'dbo.Activos.id no es uniqueidentifier. Revisar modelo real antes de continuar.', 1;
    END;

    IF @TipoActivosTiposId <> N'uniqueidentifier'
    BEGIN
        THROW 62009, 'dbo.ActivosTipos.id no es uniqueidentifier. Revisar modelo real antes de continuar.', 1;
    END;

    IF OBJECT_ID(N'dbo.ListasProgramacion', N'U') IS NOT NULL AND @TipoListasProgramacionId <> N'uniqueidentifier'
    BEGIN
        THROW 62010, 'dbo.ListasProgramacion.id no es uniqueidentifier. Se mantiene idProgramacion sin FK en esta versión.', 1;
    END;

    /* 2. Cambios en dbo.Listas */
    IF COL_LENGTH(N'dbo.Listas', N'UsaActivos') IS NULL
    BEGIN
        ALTER TABLE dbo.Listas
        ADD UsaActivos bit NOT NULL
            CONSTRAINT DF_Listas_UsaActivos_BL26_LISTASINSPECCIONES_20260729 DEFAULT ((0));
    END;

    IF COL_LENGTH(N'dbo.Listas', N'idTipoActivo') IS NULL
    BEGIN
        ALTER TABLE dbo.Listas
        ADD idTipoActivo uniqueidentifier NULL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_Listas_ActivosTipos_idTipoActivo_BL26_LISTASINSPECCIONES_20260729'
    )
    BEGIN
        ALTER TABLE dbo.Listas WITH CHECK
        ADD CONSTRAINT FK_Listas_ActivosTipos_idTipoActivo_BL26_LISTASINSPECCIONES_20260729
        FOREIGN KEY (idTipoActivo) REFERENCES dbo.ActivosTipos(id);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Listas')
          AND name = N'UX_Listas_Id_BL26_20260729'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX UX_Listas_Id_BL26_20260729
        ON dbo.Listas(id);
    END;

    /* 3. Crear dbo.ListasInspecciones */
    CREATE TABLE dbo.ListasInspecciones
    (
        id uniqueidentifier NOT NULL
            CONSTRAINT PK_ListasInspecciones PRIMARY KEY CLUSTERED
            CONSTRAINT DF_ListasInspecciones_id DEFAULT (newsequentialid()),
        idEmpresa uniqueidentifier NOT NULL,
        idLista uniqueidentifier NOT NULL,
        idActivo uniqueidentifier NULL,
        idProgramacion uniqueidentifier NULL,
        eventoLegacy uniqueidentifier NULL,
        idSucursal uniqueidentifier NOT NULL,
        idUsuarioResponsable uniqueidentifier NOT NULL,
        FechaInicio datetime2(0) NOT NULL
            CONSTRAINT DF_ListasInspecciones_FechaInicio DEFAULT (sysdatetime()),
        FechaFin datetime2(0) NULL,
        Estado tinyint NOT NULL
            CONSTRAINT DF_ListasInspecciones_Estado DEFAULT ((1)),
        FechaCreacion datetime2(0) NOT NULL
            CONSTRAINT DF_ListasInspecciones_FechaCreacion DEFAULT (sysdatetime()),
        FechaActualizacion datetime2(0) NOT NULL
            CONSTRAINT DF_ListasInspecciones_FechaActualizacion DEFAULT (sysdatetime()),
        CONSTRAINT CK_ListasInspecciones_Estado_BL26_20260729 CHECK (Estado IN (1, 2, 3))
    );

    /* 4. Relación aprobada en detalle */
    IF COL_LENGTH(N'dbo.ListasRespuestas', N'idInspeccion') IS NULL
    BEGIN
        ALTER TABLE dbo.ListasRespuestas
        ADD idInspeccion uniqueidentifier NULL;
    END;

    /* 5. FKs de cabecera */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_ListasInspecciones_Listas_BL26_20260729'
    )
    BEGIN
        ALTER TABLE dbo.ListasInspecciones WITH CHECK
        ADD CONSTRAINT FK_ListasInspecciones_Listas_BL26_20260729
        FOREIGN KEY (idLista) REFERENCES dbo.Listas(id);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_ListasInspecciones_Activos_BL26_20260729'
    )
    BEGIN
        ALTER TABLE dbo.ListasInspecciones WITH CHECK
        ADD CONSTRAINT FK_ListasInspecciones_Activos_BL26_20260729
        FOREIGN KEY (idActivo) REFERENCES dbo.Activos(id);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_ListasRespuestas_ListasInspecciones_BL26_20260729'
    )
    BEGIN
        EXEC(N'
            ALTER TABLE dbo.ListasRespuestas WITH CHECK
            ADD CONSTRAINT FK_ListasRespuestas_ListasInspecciones_BL26_20260729
            FOREIGN KEY (idInspeccion) REFERENCES dbo.ListasInspecciones(id);
        ');
    END;

    /* 6. Índices mínimos */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Listas')
          AND name = N'IX_Listas_BL26_UsaActivos_TipoActivo_20260729'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_Listas_BL26_UsaActivos_TipoActivo_20260729
        ON dbo.Listas(idEmpresa, Estado, [Status], Activo, UsaActivos, idTipoActivo);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
          AND name = N'IX_ListasInspecciones_IdEmpresa_IdLista_20260729'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_ListasInspecciones_IdEmpresa_IdLista_20260729
        ON dbo.ListasInspecciones(idEmpresa, idLista, Estado, FechaInicio DESC);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
          AND name = N'IX_ListasInspecciones_IdActivo_20260729'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_ListasInspecciones_IdActivo_20260729
        ON dbo.ListasInspecciones(idActivo, Estado, FechaInicio DESC)
        WHERE idActivo IS NOT NULL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
          AND name = N'IX_ListasInspecciones_IdUsuarioResponsable_20260729'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_ListasInspecciones_IdUsuarioResponsable_20260729
        ON dbo.ListasInspecciones(idUsuarioResponsable, Estado, FechaInicio DESC);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
          AND name = N'IX_ListasInspecciones_IdSucursal_20260729'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_ListasInspecciones_IdSucursal_20260729
        ON dbo.ListasInspecciones(idSucursal, Estado, FechaInicio DESC);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasInspecciones')
          AND name = N'IX_ListasInspecciones_EventoLegacy_20260729'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_ListasInspecciones_EventoLegacy_20260729
        ON dbo.ListasInspecciones(eventoLegacy)
        WHERE eventoLegacy IS NOT NULL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasRespuestas')
          AND name = N'IX_ListasRespuestas_IdInspeccion_20260729'
    )
    BEGIN
        EXEC(N'
            CREATE NONCLUSTERED INDEX IX_ListasRespuestas_IdInspeccion_20260729
            ON dbo.ListasRespuestas(idInspeccion, idPregunta)
            INCLUDE (idLista, idSucursal, idUsuario, evento, FechaRespuesta)
            WHERE idInspeccion IS NOT NULL;
        ');
    END;

    /* 7. Validaciones posteriores */
    SELECT
        Objeto = N'dbo.ListasInspecciones',
        Existe = CASE WHEN OBJECT_ID(N'dbo.ListasInspecciones', N'U') IS NULL THEN 0 ELSE 1 END;

    SELECT
        Tabla = t.name,
        Columna = c.name,
        Tipo = TYPE_NAME(c.user_type_id),
        EsNula = c.is_nullable
    FROM sys.tables t
    INNER JOIN sys.columns c
        ON c.object_id = t.object_id
    WHERE (t.name = N'Listas' AND c.name IN (N'UsaActivos', N'idTipoActivo'))
       OR (t.name = N'ListasRespuestas' AND c.name = N'idInspeccion')
       OR (t.name = N'ListasInspecciones');

    SELECT
        FK = fk.name
    FROM sys.foreign_keys fk
    WHERE fk.name IN (
        N'FK_Listas_ActivosTipos_idTipoActivo_BL26_LISTASINSPECCIONES_20260729',
        N'FK_ListasInspecciones_Listas_BL26_20260729',
        N'FK_ListasInspecciones_Activos_BL26_20260729',
        N'FK_ListasRespuestas_ListasInspecciones_BL26_20260729'
    );

    SELECT
        DecisionIdProgramacion = N'SIN FK EN ESTA VERSION',
        Tabla = N'dbo.ListasProgramacion',
        TipoId = ISNULL(@TipoListasProgramacionId, N'NO EXISTE'),
        TienePK = @ListasProgramacionTienePk,
        TieneUnique = @ListasProgramacionTieneUnique;

    SELECT
        Indice = i.name,
        i.is_unique,
        i.has_filter,
        i.filter_definition
    FROM sys.indexes i
    WHERE i.object_id IN (
        OBJECT_ID(N'dbo.Listas'),
        OBJECT_ID(N'dbo.ListasInspecciones'),
        OBJECT_ID(N'dbo.ListasRespuestas')
    )
      AND i.name IN (
        N'IX_Listas_BL26_UsaActivos_TipoActivo_20260729',
        N'UX_Listas_Id_BL26_20260729',
        N'IX_ListasInspecciones_IdEmpresa_IdLista_20260729',
        N'IX_ListasInspecciones_IdActivo_20260729',
        N'IX_ListasInspecciones_IdUsuarioResponsable_20260729',
        N'IX_ListasInspecciones_IdSucursal_20260729',
        N'IX_ListasInspecciones_EventoLegacy_20260729',
        N'IX_ListasRespuestas_IdInspeccion_20260729'
    );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @ErrorMessage nvarchar(4000) = ERROR_MESSAGE();
    DECLARE @ErrorNumber int = ERROR_NUMBER();
    DECLARE @ErrorLine int = ERROR_LINE();

    RAISERROR(
        'bl26-listas-inspecciones-up.sql fallo. Numero: %d. Linea: %d. Detalle: %s',
        16,
        1,
        @ErrorNumber,
        @ErrorLine,
        @ErrorMessage
    );

    THROW;
END CATCH;
