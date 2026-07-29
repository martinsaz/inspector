/*
  Operadores O0 - Script propuesto de rollback
  Estado: propuesta tecnica, NO EJECUTAR sin autorizacion final

  Importante:
    - Debe retirarse primero cualquier API o frontend que dependa del perfil operador.
    - Si ya existen perfiles o asignaciones, el rollback se bloquea salvo fuerza explicita.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @PermitirPerdidaDatos bit = 0;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.ListasOperadoresAsignaciones', N'U') IS NOT NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.ListasOperadoresAsignaciones)
           AND @PermitirPerdidaDatos = 0
        BEGIN
            THROW 62000, 'Rollback bloqueado: existen asignaciones de operadores.', 1;
        END;
    END;

    IF OBJECT_ID(N'dbo.OperadoresPerfil', N'U') IS NOT NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.OperadoresPerfil)
           AND @PermitirPerdidaDatos = 0
        BEGIN
            THROW 62001, 'Rollback bloqueado: existen perfiles de operadores.', 1;
        END;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Usuarios')
          AND name = N'UX_Usuarios_IdFirebase_Real'
    )
    BEGIN
        DROP INDEX UX_Usuarios_IdFirebase_Real ON dbo.Usuarios;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasOperadoresAsignaciones')
          AND name = N'IX_ListasOperadoresAsignaciones_BusquedaOperativa'
    )
    BEGIN
        DROP INDEX IX_ListasOperadoresAsignaciones_BusquedaOperativa
        ON dbo.ListasOperadoresAsignaciones;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.ListasOperadoresAsignaciones')
          AND name = N'UX_ListasOperadoresAsignaciones_UnicaActiva'
    )
    BEGIN
        DROP INDEX UX_ListasOperadoresAsignaciones_UnicaActiva
        ON dbo.ListasOperadoresAsignaciones;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_ListasOperadoresAsignaciones_Usuarios_ModificadoPor'
    )
    BEGIN
        ALTER TABLE dbo.ListasOperadoresAsignaciones
        DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_ModificadoPor;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_ListasOperadoresAsignaciones_Usuarios_CreadoPor'
    )
    BEGIN
        ALTER TABLE dbo.ListasOperadoresAsignaciones
        DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Usuarios_CreadoPor;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_ListasOperadoresAsignaciones_Sucursales'
    )
    BEGIN
        ALTER TABLE dbo.ListasOperadoresAsignaciones
        DROP CONSTRAINT FK_ListasOperadoresAsignaciones_Sucursales;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_ListasOperadoresAsignaciones_OperadoresPerfil'
    )
    BEGIN
        ALTER TABLE dbo.ListasOperadoresAsignaciones
        DROP CONSTRAINT FK_ListasOperadoresAsignaciones_OperadoresPerfil;
    END;

    IF OBJECT_ID(N'dbo.ListasOperadoresAsignaciones', N'U') IS NOT NULL
    BEGIN
        DROP TABLE dbo.ListasOperadoresAsignaciones;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.OperadoresPerfil')
          AND name = N'IX_OperadoresPerfil_TenantRolEstado'
    )
    BEGIN
        DROP INDEX IX_OperadoresPerfil_TenantRolEstado
        ON dbo.OperadoresPerfil;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.OperadoresPerfil')
          AND name = N'UX_OperadoresPerfil_IdUsuario'
    )
    BEGIN
        DROP INDEX UX_OperadoresPerfil_IdUsuario
        ON dbo.OperadoresPerfil;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_OperadoresPerfil_Usuarios_ModificadoPor'
    )
    BEGIN
        ALTER TABLE dbo.OperadoresPerfil
        DROP CONSTRAINT FK_OperadoresPerfil_Usuarios_ModificadoPor;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_OperadoresPerfil_Usuarios_CreadoPor'
    )
    BEGIN
        ALTER TABLE dbo.OperadoresPerfil
        DROP CONSTRAINT FK_OperadoresPerfil_Usuarios_CreadoPor;
    END;

    IF EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_OperadoresPerfil_Usuarios'
    )
    BEGIN
        ALTER TABLE dbo.OperadoresPerfil
        DROP CONSTRAINT FK_OperadoresPerfil_Usuarios;
    END;

    IF OBJECT_ID(N'dbo.OperadoresPerfil', N'U') IS NOT NULL
    BEGIN
        DROP TABLE dbo.OperadoresPerfil;
    END;

    SELECT Objeto = name, Tipo = type_desc
    FROM sys.objects
    WHERE name IN (
        N'OperadoresPerfil',
        N'ListasOperadoresAsignaciones',
        N'UX_Usuarios_IdFirebase_Real'
    );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
