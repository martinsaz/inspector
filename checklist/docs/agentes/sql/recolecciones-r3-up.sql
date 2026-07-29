/*
  Recolecciones R3 - Script propuesto de avance
  Estado: propuesta tecnica, NO EJECUTAR sin autorizacion final
  Objetivo:
    1. Crear la cabecera dbo.InspeccionesEjecuciones
    2. Agregar dbo.ListasRespuestas.idEjecucion nullable
    3. Crear FK e indices minimos compatibles con Legacy

  Notas de compatibilidad:
    - No modifica historicos.
    - Legacy puede seguir insertando con idEjecucion = NULL.
    - evento se conserva intacto.
    - No se crea FK hacia dbo.Listas en esta pasada porque la tabla no expone PK o indice unico declarado sobre id.
    - El indice unico por respuesta se limita a tipos distintos de 3; tipo 3 requiere varias filas por pregunta con el modelo actual.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    /* 1. Validaciones previas */
    IF CAST(SERVERPROPERTY('EngineEdition') AS int) NOT IN (2, 3, 4, 5, 8)
    BEGIN
        THROW 51000, 'Motor no compatible con el script propuesto.', 1;
    END;

    IF OBJECT_ID(N'dbo.ListasRespuestas', N'U') IS NULL
    BEGIN
        THROW 51001, 'No existe dbo.ListasRespuestas.', 1;
    END;

    IF OBJECT_ID(N'dbo.Sucursales', N'U') IS NULL
    BEGIN
        THROW 51002, 'No existe dbo.Sucursales.', 1;
    END;

    IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
    BEGIN
        THROW 51003, 'No existe dbo.Usuarios.', 1;
    END;

    /* 2. Crear cabecera */
    IF OBJECT_ID(N'dbo.InspeccionesEjecuciones', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.InspeccionesEjecuciones
        (
            id uniqueidentifier NOT NULL
                CONSTRAINT PK_InspeccionesEjecuciones PRIMARY KEY CLUSTERED
                CONSTRAINT DF_InspeccionesEjecuciones_id DEFAULT (newid()),
            idEmpresa uniqueidentifier NOT NULL,
            idLista uniqueidentifier NOT NULL,
            idSucursal uniqueidentifier NOT NULL,
            idResponsable uniqueidentifier NOT NULL,
            idInspector uniqueidentifier NOT NULL,
            eventoLegacy uniqueidentifier NOT NULL,
            estado tinyint NOT NULL
                CONSTRAINT DF_InspeccionesEjecuciones_estado DEFAULT ((1)),
            latitudInicio varchar(64) NULL,
            longitudInicio varchar(64) NULL,
            fechaInicio datetime NOT NULL
                CONSTRAINT DF_InspeccionesEjecuciones_fechaInicio DEFAULT (getdate()),
            fechaUltimaActividad datetime NOT NULL
                CONSTRAINT DF_InspeccionesEjecuciones_fechaUltimaActividad DEFAULT (getdate()),
            fechaCierre datetime NULL,
            activo bit NOT NULL
                CONSTRAINT DF_InspeccionesEjecuciones_activo DEFAULT ((1)),
            versionRow rowversion NOT NULL,
            CONSTRAINT CK_InspeccionesEjecuciones_estado CHECK (estado IN (1, 2, 3))
        );
    END;

    /* 3. Columna nullable en detalle */
    IF COL_LENGTH(N'dbo.ListasRespuestas', N'idEjecucion') IS NULL
    BEGIN
        ALTER TABLE dbo.ListasRespuestas
        ADD idEjecucion uniqueidentifier NULL;
    END;

    /* 4. FKs de cabecera */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_InspeccionesEjecuciones_Sucursales'
    )
    BEGIN
        ALTER TABLE dbo.InspeccionesEjecuciones WITH CHECK
        ADD CONSTRAINT FK_InspeccionesEjecuciones_Sucursales
        FOREIGN KEY (idSucursal)
        REFERENCES dbo.Sucursales(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_InspeccionesEjecuciones_Usuarios_Responsable'
    )
    BEGIN
        ALTER TABLE dbo.InspeccionesEjecuciones WITH CHECK
        ADD CONSTRAINT FK_InspeccionesEjecuciones_Usuarios_Responsable
        FOREIGN KEY (idResponsable)
        REFERENCES dbo.Usuarios(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_InspeccionesEjecuciones_Usuarios_Inspector'
    )
    BEGIN
        ALTER TABLE dbo.InspeccionesEjecuciones WITH CHECK
        ADD CONSTRAINT FK_InspeccionesEjecuciones_Usuarios_Inspector
        FOREIGN KEY (idInspector)
        REFERENCES dbo.Usuarios(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    /* 5. Validar huérfanos antes de FK desde detalle */
    IF EXISTS (
        SELECT 1
        FROM dbo.ListasRespuestas lr
        LEFT JOIN dbo.InspeccionesEjecuciones ie
            ON lr.idEjecucion = ie.id
        WHERE lr.idEjecucion IS NOT NULL
          AND ie.id IS NULL
    )
    BEGIN
        THROW 51004, 'Existen filas en ListasRespuestas con idEjecucion huerfano.', 1;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_ListasRespuestas_InspeccionesEjecuciones'
    )
    BEGIN
        ALTER TABLE dbo.ListasRespuestas WITH CHECK
        ADD CONSTRAINT FK_ListasRespuestas_InspeccionesEjecuciones
        FOREIGN KEY (idEjecucion)
        REFERENCES dbo.InspeccionesEjecuciones(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    /* 6. Indices de cabecera */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.InspeccionesEjecuciones')
          AND name = N'UX_InspeccionesEjecuciones_EventoLegacy'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX UX_InspeccionesEjecuciones_EventoLegacy
        ON dbo.InspeccionesEjecuciones(eventoLegacy);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.InspeccionesEjecuciones')
          AND name = N'IX_InspeccionesEjecuciones_AbiertaBusqueda'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_InspeccionesEjecuciones_AbiertaBusqueda
        ON dbo.InspeccionesEjecuciones(idEmpresa, idInspector, idLista, idSucursal)
        INCLUDE (idResponsable, estado, activo, fechaUltimaActividad, eventoLegacy)
        WHERE activo = 1 AND estado = 1;
    END;

    /* 7. Indices de detalle */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasRespuestas')
          AND name = N'IX_ListasRespuestas_IdEjecucion_Recuperacion'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_ListasRespuestas_IdEjecucion_Recuperacion
        ON dbo.ListasRespuestas(idEjecucion, idPregunta)
        INCLUDE (idTipoPregunta, idUsuario, idLista, idSucursal, FechaRespuesta, evento, ValorCorrecto)
        WHERE idEjecucion IS NOT NULL;
    END;

    /*
      El indice unico se limita a tipos distintos de 3.
      Tipo 3 reutiliza varias filas por pregunta en el modelo actual.
      No se indexa RespuestaValor porque hoy es TEXT y no es valido como clave de indice.
    */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasRespuestas')
          AND name = N'UX_ListasRespuestas_IdEjecucion_IdPregunta_NoTipo3'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX UX_ListasRespuestas_IdEjecucion_IdPregunta_NoTipo3
        ON dbo.ListasRespuestas(idEjecucion, idPregunta)
        WHERE idEjecucion IS NOT NULL
          AND idTipoPregunta <> 3;
    END;

    /* 8. Validaciones posteriores */
    SELECT
        Tabla = t.name,
        Objeto = 'TABLE'
    FROM sys.tables t
    WHERE t.name = N'InspeccionesEjecuciones';

    SELECT
        Columna = c.name,
        Tipo = TYPE_NAME(c.user_type_id),
        EsNula = c.is_nullable
    FROM sys.columns c
    WHERE c.object_id = OBJECT_ID(N'dbo.ListasRespuestas')
      AND c.name = N'idEjecucion';

    SELECT
        FK = fk.name
    FROM sys.foreign_keys fk
    WHERE fk.name IN (
        N'FK_InspeccionesEjecuciones_Sucursales',
        N'FK_InspeccionesEjecuciones_Usuarios_Responsable',
        N'FK_InspeccionesEjecuciones_Usuarios_Inspector',
        N'FK_ListasRespuestas_InspeccionesEjecuciones'
    );

    SELECT
        Indice = i.name,
        i.is_unique,
        i.has_filter,
        i.filter_definition
    FROM sys.indexes i
    WHERE i.object_id IN (
        OBJECT_ID(N'dbo.InspeccionesEjecuciones'),
        OBJECT_ID(N'dbo.ListasRespuestas')
    )
      AND i.name IN (
        N'UX_InspeccionesEjecuciones_EventoLegacy',
        N'IX_InspeccionesEjecuciones_AbiertaBusqueda',
        N'IX_ListasRespuestas_IdEjecucion_Recuperacion',
        N'UX_ListasRespuestas_IdEjecucion_IdPregunta_NoTipo3'
    );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
