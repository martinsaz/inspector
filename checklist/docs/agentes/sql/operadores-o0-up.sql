/*
  Operadores O0 - Script propuesto de avance
  Estado: propuesta tecnica, NO EJECUTAR sin autorizacion final

  Objetivo:
    1. Crear dbo.OperadoresPerfil
    2. Crear dbo.ListasOperadoresAsignaciones
    3. Endurecer dbo.Usuarios.IdFirebase con un indice filtrado compatible

  Notas:
    - No modifica login actual.
    - No modifica historicos.
    - No crea cuentas Firebase.
    - No inserta roles ni permisos; eso queda en operadores-o0-seed.sql.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    /* 1. Validaciones previas */
    IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
    BEGIN
        THROW 61000, 'No existe dbo.Usuarios.', 1;
    END;

    IF OBJECT_ID(N'dbo.Roles', N'U') IS NULL
    BEGIN
        THROW 61001, 'No existe dbo.Roles.', 1;
    END;

    IF OBJECT_ID(N'dbo.Sucursales', N'U') IS NULL
    BEGIN
        THROW 61002, 'No existe dbo.Sucursales.', 1;
    END;

    IF OBJECT_ID(N'dbo.Listas', N'U') IS NULL
    BEGIN
        THROW 61003, 'No existe dbo.Listas.', 1;
    END;

    IF COL_LENGTH(N'dbo.Usuarios', N'IdFirebase') IS NULL
    BEGIN
        THROW 61004, 'No existe la columna dbo.Usuarios.IdFirebase.', 1;
    END;

    /* 2. Validar duplicados en IdFirebase reales antes del indice */
    IF EXISTS (
        SELECT u.IdFirebase
        FROM dbo.Usuarios u
        WHERE u.IdFirebase IS NOT NULL
          AND LTRIM(RTRIM(u.IdFirebase)) <> ''
          AND u.IdFirebase <> 'uid'
        GROUP BY u.IdFirebase
        HAVING COUNT(*) > 1
    )
    BEGIN
        THROW 61005, 'Existen valores duplicados de IdFirebase reales en dbo.Usuarios.', 1;
    END;

    /* 3. Perfil funcional */
    IF OBJECT_ID(N'dbo.OperadoresPerfil', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.OperadoresPerfil
        (
            id uniqueidentifier NOT NULL
                CONSTRAINT PK_OperadoresPerfil PRIMARY KEY CLUSTERED
                CONSTRAINT DF_OperadoresPerfil_id DEFAULT (newid()),
            idUsuario uniqueidentifier NOT NULL,
            idEmpresa uniqueidentifier NOT NULL,
            idRolOperador uniqueidentifier NOT NULL,
            estatus tinyint NOT NULL
                CONSTRAINT DF_OperadoresPerfil_estatus DEFAULT ((1)),
            activo bit NOT NULL
                CONSTRAINT DF_OperadoresPerfil_activo DEFAULT ((1)),
            fechaAlta datetime NOT NULL
                CONSTRAINT DF_OperadoresPerfil_fechaAlta DEFAULT (getdate()),
            fechaSuspension datetime NULL,
            creadoPor uniqueidentifier NULL,
            fechaModificacion datetime NULL,
            modificadoPor uniqueidentifier NULL,
            versionRow rowversion NOT NULL,
            CONSTRAINT CK_OperadoresPerfil_estatus CHECK (estatus IN (1, 2, 3))
        );
    END;

    /* 4. Asignaciones */
    IF OBJECT_ID(N'dbo.ListasOperadoresAsignaciones', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.ListasOperadoresAsignaciones
        (
            id uniqueidentifier NOT NULL
                CONSTRAINT PK_ListasOperadoresAsignaciones PRIMARY KEY CLUSTERED
                CONSTRAINT DF_ListasOperadoresAsignaciones_id DEFAULT (newid()),
            idEmpresa uniqueidentifier NOT NULL,
            idLista uniqueidentifier NOT NULL,
            idOperadorPerfil uniqueidentifier NOT NULL,
            idSucursal uniqueidentifier NOT NULL,
            fechaProgramada date NULL,
            vigenciaInicio datetime NULL,
            vigenciaFin datetime NULL,
            estatus tinyint NOT NULL
                CONSTRAINT DF_ListasOperadoresAsignaciones_estatus DEFAULT ((1)),
            activo bit NOT NULL
                CONSTRAINT DF_ListasOperadoresAsignaciones_activo DEFAULT ((1)),
            creadoPor uniqueidentifier NULL,
            fechaCreacion datetime NOT NULL
                CONSTRAINT DF_ListasOperadoresAsignaciones_fechaCreacion DEFAULT (getdate()),
            fechaModificacion datetime NULL,
            modificadoPor uniqueidentifier NULL,
            versionRow rowversion NOT NULL,
            CONSTRAINT CK_ListasOperadoresAsignaciones_estatus CHECK (estatus IN (1, 2, 3, 4))
        );
    END;

    /* 5. FKs seguras del perfil */
    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresPerfil_Usuarios'
    )
    BEGIN
        ALTER TABLE dbo.OperadoresPerfil WITH CHECK
        ADD CONSTRAINT FK_OperadoresPerfil_Usuarios
        FOREIGN KEY (idUsuario)
        REFERENCES dbo.Usuarios(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresPerfil_Usuarios_CreadoPor'
    )
    BEGIN
        ALTER TABLE dbo.OperadoresPerfil WITH CHECK
        ADD CONSTRAINT FK_OperadoresPerfil_Usuarios_CreadoPor
        FOREIGN KEY (creadoPor)
        REFERENCES dbo.Usuarios(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresPerfil_Usuarios_ModificadoPor'
    )
    BEGIN
        ALTER TABLE dbo.OperadoresPerfil WITH CHECK
        ADD CONSTRAINT FK_OperadoresPerfil_Usuarios_ModificadoPor
        FOREIGN KEY (modificadoPor)
        REFERENCES dbo.Usuarios(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    /* 6. FKs seguras de asignaciones */
    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_OperadoresPerfil'
    )
    BEGIN
        ALTER TABLE dbo.ListasOperadoresAsignaciones WITH CHECK
        ADD CONSTRAINT FK_ListasOperadoresAsignaciones_OperadoresPerfil
        FOREIGN KEY (idOperadorPerfil)
        REFERENCES dbo.OperadoresPerfil(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Sucursales'
    )
    BEGIN
        ALTER TABLE dbo.ListasOperadoresAsignaciones WITH CHECK
        ADD CONSTRAINT FK_ListasOperadoresAsignaciones_Sucursales
        FOREIGN KEY (idSucursal)
        REFERENCES dbo.Sucursales(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Usuarios_CreadoPor'
    )
    BEGIN
        ALTER TABLE dbo.ListasOperadoresAsignaciones WITH CHECK
        ADD CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_CreadoPor
        FOREIGN KEY (creadoPor)
        REFERENCES dbo.Usuarios(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Usuarios_ModificadoPor'
    )
    BEGIN
        ALTER TABLE dbo.ListasOperadoresAsignaciones WITH CHECK
        ADD CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_ModificadoPor
        FOREIGN KEY (modificadoPor)
        REFERENCES dbo.Usuarios(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    END;

    /* 7. Indices del perfil */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.OperadoresPerfil')
          AND name = N'UX_OperadoresPerfil_IdUsuario'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX UX_OperadoresPerfil_IdUsuario
        ON dbo.OperadoresPerfil(idUsuario);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.OperadoresPerfil')
          AND name = N'IX_OperadoresPerfil_TenantRolEstado'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_OperadoresPerfil_TenantRolEstado
        ON dbo.OperadoresPerfil(idEmpresa, idRolOperador, estatus, activo)
        INCLUDE (idUsuario, fechaAlta, fechaSuspension);
    END;

    /* 8. Indices de asignaciones */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasOperadoresAsignaciones')
          AND name = N'UX_ListasOperadoresAsignaciones_UnicaActiva'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX UX_ListasOperadoresAsignaciones_UnicaActiva
        ON dbo.ListasOperadoresAsignaciones(idOperadorPerfil, idLista, idSucursal, vigenciaInicio)
        WHERE activo = 1;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasOperadoresAsignaciones')
          AND name = N'IX_ListasOperadoresAsignaciones_BusquedaOperativa'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_ListasOperadoresAsignaciones_BusquedaOperativa
        ON dbo.ListasOperadoresAsignaciones(idEmpresa, idOperadorPerfil, activo, estatus)
        INCLUDE (idLista, idSucursal, fechaProgramada, vigenciaInicio, vigenciaFin);
    END;

    /* 9. Endurecer IdFirebase existente */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Usuarios')
          AND name = N'UX_Usuarios_IdFirebase_Real'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX UX_Usuarios_IdFirebase_Real
        ON dbo.Usuarios(IdFirebase)
        WHERE IdFirebase IS NOT NULL
          AND IdFirebase <> ''
          AND IdFirebase <> 'uid';
    END;

    /* 10. Validaciones posteriores */
    SELECT Tabla = t.name
    FROM sys.tables t
    WHERE t.name IN (N'OperadoresPerfil', N'ListasOperadoresAsignaciones');

    SELECT Indice = i.name, i.is_unique, i.has_filter, i.filter_definition
    FROM sys.indexes i
    WHERE i.name IN (
        N'UX_OperadoresPerfil_IdUsuario',
        N'IX_OperadoresPerfil_TenantRolEstado',
        N'UX_ListasOperadoresAsignaciones_UnicaActiva',
        N'IX_ListasOperadoresAsignaciones_BusquedaOperativa',
        N'UX_Usuarios_IdFirebase_Real'
    );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
