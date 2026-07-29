SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.Operadores', N'U') IS NOT NULL
       AND EXISTS (SELECT 1 FROM dbo.Operadores)
    BEGIN
        THROW 65101, 'El rollback se detuvo porque dbo.Operadores ya contiene registros reales.', 1;
    END;

    IF OBJECT_ID(N'dbo.OperadoresSucursales', N'U') IS NOT NULL
       AND EXISTS (SELECT 1 FROM dbo.OperadoresSucursales)
    BEGIN
        THROW 65102, 'El rollback se detuvo porque dbo.OperadoresSucursales ya contiene registros reales.', 1;
    END;

    IF OBJECT_ID(N'dbo.ListasOperadoresAsignaciones', N'U') IS NOT NULL
       AND EXISTS (SELECT 1 FROM dbo.ListasOperadoresAsignaciones)
    BEGIN
        THROW 65103, 'El rollback se detuvo porque dbo.ListasOperadoresAsignaciones ya contiene asignaciones reales.', 1;
    END;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Usuarios_ModificadoPor')
        ALTER TABLE dbo.ListasOperadoresAsignaciones DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_ModificadoPor;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Usuarios_CreadoPor')
        ALTER TABLE dbo.ListasOperadoresAsignaciones DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_CreadoPor;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Sucursales')
        ALTER TABLE dbo.ListasOperadoresAsignaciones DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Sucursales;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Operadores')
        ALTER TABLE dbo.ListasOperadoresAsignaciones DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Operadores;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasOperadoresAsignaciones')
          AND name = N'IX_ListasOperadoresAsignaciones_BusquedaOperativa'
    )
        DROP INDEX IX_ListasOperadoresAsignaciones_BusquedaOperativa ON dbo.ListasOperadoresAsignaciones;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasOperadoresAsignaciones')
          AND name = N'UX_ListasOperadoresAsignaciones_UnicaActiva'
    )
        DROP INDEX UX_ListasOperadoresAsignaciones_UnicaActiva ON dbo.ListasOperadoresAsignaciones;

    IF OBJECT_ID(N'dbo.ListasOperadoresAsignaciones', N'U') IS NOT NULL
        DROP TABLE dbo.ListasOperadoresAsignaciones;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresSucursales_Usuarios_ModificadoPor')
        ALTER TABLE dbo.OperadoresSucursales DROP CONSTRAINT FK_OperadoresSucursales_Usuarios_ModificadoPor;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresSucursales_Usuarios_CreadoPor')
        ALTER TABLE dbo.OperadoresSucursales DROP CONSTRAINT FK_OperadoresSucursales_Usuarios_CreadoPor;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresSucursales_Sucursales')
        ALTER TABLE dbo.OperadoresSucursales DROP CONSTRAINT FK_OperadoresSucursales_Sucursales;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresSucursales_Operadores')
        ALTER TABLE dbo.OperadoresSucursales DROP CONSTRAINT FK_OperadoresSucursales_Operadores;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.OperadoresSucursales')
          AND name = N'IX_OperadoresSucursales_Operador'
    )
        DROP INDEX IX_OperadoresSucursales_Operador ON dbo.OperadoresSucursales;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.OperadoresSucursales')
          AND name = N'UX_OperadoresSucursales_Activa'
    )
        DROP INDEX UX_OperadoresSucursales_Activa ON dbo.OperadoresSucursales;

    IF OBJECT_ID(N'dbo.OperadoresSucursales', N'U') IS NOT NULL
        DROP TABLE dbo.OperadoresSucursales;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Operadores_Usuarios_ModificadoPor')
        ALTER TABLE dbo.Operadores DROP CONSTRAINT FK_Operadores_Usuarios_ModificadoPor;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Operadores_Usuarios_CreadoPor')
        ALTER TABLE dbo.Operadores DROP CONSTRAINT FK_Operadores_Usuarios_CreadoPor;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Operadores')
          AND name = N'IX_Operadores_TenantEstado'
    )
        DROP INDEX IX_Operadores_TenantEstado ON dbo.Operadores;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Operadores')
          AND name = N'UX_Operadores_EmpresaCorreo'
    )
        DROP INDEX UX_Operadores_EmpresaCorreo ON dbo.Operadores;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Operadores')
          AND name = N'UX_Operadores_IdFirebase'
    )
        DROP INDEX UX_Operadores_IdFirebase ON dbo.Operadores;

    IF OBJECT_ID(N'dbo.Operadores', N'U') IS NOT NULL
        DROP TABLE dbo.Operadores;

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
            CONSTRAINT DF_OperadoresPerfil_fechaAlta DEFAULT (GETDATE()),
        fechaSuspension datetime NULL,
        creadoPor uniqueidentifier NULL,
        fechaModificacion datetime NULL,
        modificadoPor uniqueidentifier NULL,
        versionRow rowversion NOT NULL,
        CONSTRAINT CK_OperadoresPerfil_estatus CHECK (estatus IN (1, 2, 3))
    );

    ALTER TABLE dbo.OperadoresPerfil WITH CHECK
    ADD CONSTRAINT FK_OperadoresPerfil_Usuarios
        FOREIGN KEY (idUsuario) REFERENCES dbo.Usuarios(id);

    ALTER TABLE dbo.OperadoresPerfil WITH CHECK
    ADD CONSTRAINT FK_OperadoresPerfil_Usuarios_CreadoPor
        FOREIGN KEY (creadoPor) REFERENCES dbo.Usuarios(id);

    ALTER TABLE dbo.OperadoresPerfil WITH CHECK
    ADD CONSTRAINT FK_OperadoresPerfil_Usuarios_ModificadoPor
        FOREIGN KEY (modificadoPor) REFERENCES dbo.Usuarios(id);

    CREATE UNIQUE NONCLUSTERED INDEX UX_OperadoresPerfil_IdUsuario
        ON dbo.OperadoresPerfil(idUsuario);

    CREATE NONCLUSTERED INDEX IX_OperadoresPerfil_TenantRolEstado
        ON dbo.OperadoresPerfil(idEmpresa, idRolOperador, estatus, activo)
        INCLUDE (idUsuario, fechaAlta, fechaSuspension);

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
            CONSTRAINT DF_ListasOperadoresAsignaciones_fechaCreacion DEFAULT (GETDATE()),
        fechaModificacion datetime NULL,
        modificadoPor uniqueidentifier NULL,
        versionRow rowversion NOT NULL,
        CONSTRAINT CK_ListasOperadoresAsignaciones_estatus CHECK (estatus IN (1, 2, 3, 4))
    );

    ALTER TABLE dbo.ListasOperadoresAsignaciones WITH CHECK
    ADD CONSTRAINT FK_ListasOperadoresAsignaciones_OperadoresPerfil
        FOREIGN KEY (idOperadorPerfil) REFERENCES dbo.OperadoresPerfil(id);

    ALTER TABLE dbo.ListasOperadoresAsignaciones WITH CHECK
    ADD CONSTRAINT FK_ListasOperadoresAsignaciones_Sucursales
        FOREIGN KEY (idSucursal) REFERENCES dbo.Sucursales(id);

    ALTER TABLE dbo.ListasOperadoresAsignaciones WITH CHECK
    ADD CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_CreadoPor
        FOREIGN KEY (creadoPor) REFERENCES dbo.Usuarios(id);

    ALTER TABLE dbo.ListasOperadoresAsignaciones WITH CHECK
    ADD CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_ModificadoPor
        FOREIGN KEY (modificadoPor) REFERENCES dbo.Usuarios(id);

    CREATE UNIQUE NONCLUSTERED INDEX UX_ListasOperadoresAsignaciones_UnicaActiva
        ON dbo.ListasOperadoresAsignaciones(idOperadorPerfil, idLista, idSucursal, vigenciaInicio)
        WHERE activo = 1;

    CREATE NONCLUSTERED INDEX IX_ListasOperadoresAsignaciones_BusquedaOperativa
        ON dbo.ListasOperadoresAsignaciones(idEmpresa, idOperadorPerfil, activo, estatus)
        INCLUDE (idLista, idSucursal, fechaProgramada, vigenciaInicio, vigenciaFin);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
