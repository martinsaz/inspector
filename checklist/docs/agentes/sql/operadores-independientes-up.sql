SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @Stamp varchar(32) =
    CONVERT(varchar(8), GETDATE(), 112) + '_' +
    REPLACE(CONVERT(varchar(8), GETDATE(), 108), ':', '');

DECLARE @BackupOperadoresPerfil sysname = QUOTENAME('OperadoresPerfil_BKP_CORRECCION_' + @Stamp);
DECLARE @BackupAsignaciones sysname = QUOTENAME('ListasOperadoresAsignaciones_BKP_CORRECCION_' + @Stamp);

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.Operadores', N'U') IS NOT NULL
        OR OBJECT_ID(N'dbo.OperadoresSucursales', N'U') IS NOT NULL
    BEGIN
        THROW 65001, 'La reversa no puede ejecutarse porque ya existen tablas del modelo independiente.', 1;
    END;

    IF OBJECT_ID(N'dbo.OperadoresPerfil', N'U') IS NOT NULL
       AND EXISTS (SELECT 1 FROM dbo.OperadoresPerfil)
    BEGIN
        THROW 65002, 'OperadoresPerfil contiene registros. La corrección se detuvo para evitar pérdida de históricos.', 1;
    END;

    IF OBJECT_ID(N'dbo.ListasOperadoresAsignaciones', N'U') IS NOT NULL
       AND EXISTS (SELECT 1 FROM dbo.ListasOperadoresAsignaciones)
    BEGIN
        THROW 65003, 'ListasOperadoresAsignaciones contiene registros. La corrección se detuvo para evitar pérdida de históricos.', 1;
    END;

    IF OBJECT_ID(N'dbo.OperadoresPerfil', N'U') IS NOT NULL
    BEGIN
        EXEC('SELECT * INTO dbo.' + @BackupOperadoresPerfil + ' FROM dbo.OperadoresPerfil;');
    END;

    IF OBJECT_ID(N'dbo.ListasOperadoresAsignaciones', N'U') IS NOT NULL
    BEGIN
        EXEC('SELECT * INTO dbo.' + @BackupAsignaciones + ' FROM dbo.ListasOperadoresAsignaciones;');
    END;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Usuarios_ModificadoPor')
        ALTER TABLE dbo.ListasOperadoresAsignaciones DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_ModificadoPor;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Usuarios_CreadoPor')
        ALTER TABLE dbo.ListasOperadoresAsignaciones DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_CreadoPor;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_Sucursales')
        ALTER TABLE dbo.ListasOperadoresAsignaciones DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Sucursales;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ListasOperadoresAsignaciones_OperadoresPerfil')
        ALTER TABLE dbo.ListasOperadoresAsignaciones DROP CONSTRAINT FK_ListasOperadoresAsignaciones_OperadoresPerfil;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresPerfil_Usuarios_ModificadoPor')
        ALTER TABLE dbo.OperadoresPerfil DROP CONSTRAINT FK_OperadoresPerfil_Usuarios_ModificadoPor;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresPerfil_Usuarios_CreadoPor')
        ALTER TABLE dbo.OperadoresPerfil DROP CONSTRAINT FK_OperadoresPerfil_Usuarios_CreadoPor;

    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_OperadoresPerfil_Usuarios')
        ALTER TABLE dbo.OperadoresPerfil DROP CONSTRAINT FK_OperadoresPerfil_Usuarios;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasOperadoresAsignaciones')
          AND name = N'IX_ListasOperadoresAsignaciones_BusquedaOperativa'
    )
        DROP INDEX IX_ListasOperadoresAsignaciones_BusquedaOperativa ON dbo.ListasOperadoresAsignaciones;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasOperadoresAsignaciones')
          AND name = N'UX_ListasOperadoresAsignaciones_UnicaActiva'
    )
        DROP INDEX UX_ListasOperadoresAsignaciones_UnicaActiva ON dbo.ListasOperadoresAsignaciones;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.OperadoresPerfil')
          AND name = N'IX_OperadoresPerfil_TenantRolEstado'
    )
        DROP INDEX IX_OperadoresPerfil_TenantRolEstado ON dbo.OperadoresPerfil;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.OperadoresPerfil')
          AND name = N'UX_OperadoresPerfil_IdUsuario'
    )
        DROP INDEX UX_OperadoresPerfil_IdUsuario ON dbo.OperadoresPerfil;

    IF OBJECT_ID(N'dbo.ListasOperadoresAsignaciones', N'U') IS NOT NULL
        DROP TABLE dbo.ListasOperadoresAsignaciones;

    IF OBJECT_ID(N'dbo.OperadoresPerfil', N'U') IS NOT NULL
        DROP TABLE dbo.OperadoresPerfil;

    CREATE TABLE dbo.Operadores
    (
        id uniqueidentifier NOT NULL
            CONSTRAINT PK_Operadores PRIMARY KEY CLUSTERED
            CONSTRAINT DF_Operadores_id DEFAULT (newid()),
        idEmpresa uniqueidentifier NOT NULL,
        idFirebase nvarchar(128) NOT NULL,
        nombre nvarchar(120) NOT NULL,
        apellidoPaterno nvarchar(120) NOT NULL,
        apellidoMaterno nvarchar(120) NULL,
        correo nvarchar(320) NOT NULL,
        estatus tinyint NOT NULL
            CONSTRAINT DF_Operadores_estatus DEFAULT ((1)),
        activo bit NOT NULL
            CONSTRAINT DF_Operadores_activo DEFAULT ((1)),
        fechaAlta datetime NOT NULL
            CONSTRAINT DF_Operadores_fechaAlta DEFAULT (GETDATE()),
        fechaSuspension datetime NULL,
        creadoPor uniqueidentifier NULL,
        fechaCreacion datetime NOT NULL
            CONSTRAINT DF_Operadores_fechaCreacion DEFAULT (GETDATE()),
        modificadoPor uniqueidentifier NULL,
        fechaModificacion datetime NULL,
        versionRow rowversion NOT NULL,
        CONSTRAINT CK_Operadores_estatus CHECK (estatus IN (1, 2, 3))
    );

    ALTER TABLE dbo.Operadores WITH CHECK
    ADD CONSTRAINT FK_Operadores_Usuarios_CreadoPor
        FOREIGN KEY (creadoPor) REFERENCES dbo.Usuarios(id);

    ALTER TABLE dbo.Operadores WITH CHECK
    ADD CONSTRAINT FK_Operadores_Usuarios_ModificadoPor
        FOREIGN KEY (modificadoPor) REFERENCES dbo.Usuarios(id);

    CREATE UNIQUE NONCLUSTERED INDEX UX_Operadores_IdFirebase
        ON dbo.Operadores(idFirebase);

    CREATE UNIQUE NONCLUSTERED INDEX UX_Operadores_EmpresaCorreo
        ON dbo.Operadores(idEmpresa, correo);

    CREATE NONCLUSTERED INDEX IX_Operadores_TenantEstado
        ON dbo.Operadores(idEmpresa, activo, estatus)
        INCLUDE (nombre, apellidoPaterno, apellidoMaterno, correo, fechaAlta, fechaSuspension);

    CREATE TABLE dbo.OperadoresSucursales
    (
        id uniqueidentifier NOT NULL
            CONSTRAINT PK_OperadoresSucursales PRIMARY KEY CLUSTERED
            CONSTRAINT DF_OperadoresSucursales_id DEFAULT (newid()),
        idOperador uniqueidentifier NOT NULL,
        idSucursal uniqueidentifier NOT NULL,
        activo bit NOT NULL
            CONSTRAINT DF_OperadoresSucursales_activo DEFAULT ((1)),
        creadoPor uniqueidentifier NULL,
        fechaCreacion datetime NOT NULL
            CONSTRAINT DF_OperadoresSucursales_fechaCreacion DEFAULT (GETDATE()),
        modificadoPor uniqueidentifier NULL,
        fechaModificacion datetime NULL,
        versionRow rowversion NOT NULL
    );

    ALTER TABLE dbo.OperadoresSucursales WITH CHECK
    ADD CONSTRAINT FK_OperadoresSucursales_Operadores
        FOREIGN KEY (idOperador) REFERENCES dbo.Operadores(id);

    ALTER TABLE dbo.OperadoresSucursales WITH CHECK
    ADD CONSTRAINT FK_OperadoresSucursales_Sucursales
        FOREIGN KEY (idSucursal) REFERENCES dbo.Sucursales(id);

    ALTER TABLE dbo.OperadoresSucursales WITH CHECK
    ADD CONSTRAINT FK_OperadoresSucursales_Usuarios_CreadoPor
        FOREIGN KEY (creadoPor) REFERENCES dbo.Usuarios(id);

    ALTER TABLE dbo.OperadoresSucursales WITH CHECK
    ADD CONSTRAINT FK_OperadoresSucursales_Usuarios_ModificadoPor
        FOREIGN KEY (modificadoPor) REFERENCES dbo.Usuarios(id);

    CREATE UNIQUE NONCLUSTERED INDEX UX_OperadoresSucursales_Activa
        ON dbo.OperadoresSucursales(idOperador, idSucursal)
        WHERE activo = 1;

    CREATE NONCLUSTERED INDEX IX_OperadoresSucursales_Operador
        ON dbo.OperadoresSucursales(idOperador, activo)
        INCLUDE (idSucursal, fechaCreacion, fechaModificacion);

    CREATE TABLE dbo.ListasOperadoresAsignaciones
    (
        id uniqueidentifier NOT NULL
            CONSTRAINT PK_ListasOperadoresAsignaciones PRIMARY KEY CLUSTERED
            CONSTRAINT DF_ListasOperadoresAsignaciones_id DEFAULT (newid()),
        idEmpresa uniqueidentifier NOT NULL,
        idLista uniqueidentifier NOT NULL,
        idOperador uniqueidentifier NOT NULL,
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
    ADD CONSTRAINT FK_ListasOperadoresAsignaciones_Operadores
        FOREIGN KEY (idOperador) REFERENCES dbo.Operadores(id);

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
        ON dbo.ListasOperadoresAsignaciones(idOperador, idLista, idSucursal, vigenciaInicio)
        WHERE activo = 1;

    CREATE NONCLUSTERED INDEX IX_ListasOperadoresAsignaciones_BusquedaOperativa
        ON dbo.ListasOperadoresAsignaciones(idEmpresa, idOperador, activo, estatus)
        INCLUDE (idLista, idSucursal, fechaProgramada, vigenciaInicio, vigenciaFin);

    COMMIT TRANSACTION;

    SELECT
        @Stamp AS respaldoGenerado,
        (SELECT COUNT(1) FROM dbo.Operadores) AS operadores,
        (SELECT COUNT(1) FROM dbo.OperadoresSucursales) AS operadoresSucursales,
        (SELECT COUNT(1) FROM dbo.ListasOperadoresAsignaciones) AS listasOperadoresAsignaciones;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
