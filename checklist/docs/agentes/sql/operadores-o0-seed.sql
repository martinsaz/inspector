/*
  Operadores - Paquete C
  UP transaccional sobre el modelo real legacy.

  Modelo confirmado:
    - No existen tablas separadas de permisos o menu.
    - El arbol de acceso vive en dbo.Roles.Permisos (JSON).
    - La unica tabla de empresa con bandera operativa es dbo.Empresa.

  Alcance:
    - respaldo puntual de dbo.Roles
    - insercion del rol base configurable por empresa activa
    - permiso operativo 02005000 representado dentro del JSON del rol

  Nota:
    - el menu visible /ContestarLista/RecoleccionesBL26 se resuelve en codigo.
    - este script no modifica Usuarios, OperadoresPerfil ni ListasOperadoresAsignaciones.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @TimeStamp varchar(15) =
    CONVERT(char(8), GETDATE(), 112) + '_' + REPLACE(CONVERT(char(8), GETDATE(), 108), ':', '');
DECLARE @BackupTableName sysname = N'Roles_BKP_OPERADORES_C_' + @TimeStamp;
DECLARE @BackupSql nvarchar(max);
DECLARE @OriginalCount int;
DECLARE @BackupCount int;
DECLARE @ExpectedRoleJson nvarchar(max) =
    N'[{"Opcion":"02000000","Permisos":{"Acceso":1,"Escritura":0},"Hijos":[{"Opcion":"02005000","Permisos":{"Acceso":1,"Escritura":1},"Hijos":[]}]}]';
DECLARE @ActiveCompanies table
(
    idEmpresa uniqueidentifier PRIMARY KEY
);

IF OBJECT_ID(N'dbo.Roles', N'U') IS NULL
BEGIN
    THROW 64000, 'dbo.Roles no existe en la base conectada.', 1;
END;

IF OBJECT_ID(N'dbo.Empresa', N'U') IS NULL
BEGIN
    THROW 64001, 'dbo.Empresa no existe en la base conectada.', 1;
END;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = @BackupTableName)
BEGIN
    THROW 64002, 'El respaldo puntual ya existe con el timestamp calculado.', 1;
END;

SELECT @OriginalCount = COUNT(*) FROM dbo.Roles;

SET @BackupSql = N'SELECT * INTO dbo.' + QUOTENAME(@BackupTableName) + N' FROM dbo.Roles;';
EXEC sys.sp_executesql @BackupSql;

SET @BackupSql = N'SELECT @Rows = COUNT(*) FROM dbo.' + QUOTENAME(@BackupTableName) + N';';
EXEC sys.sp_executesql @BackupSql, N'@Rows int OUTPUT', @Rows = @BackupCount OUTPUT;

IF @OriginalCount <> @BackupCount
BEGIN
    THROW 64003, 'El conteo del respaldo puntual de Roles no coincide.', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.Roles
        WHERE Permisos LIKE N'%02005000%'
    )
    BEGIN
        THROW 64004, 'El codigo 02005000 ya existe en dbo.Roles.Permisos.', 1;
    END;

    INSERT INTO @ActiveCompanies (idEmpresa)
    SELECT e.id
    FROM dbo.Empresa e
    WHERE ISNULL(e.status, 0) = 1
      AND ISNULL(e.borrado, 0) = 0;

    IF NOT EXISTS (SELECT 1 FROM @ActiveCompanies)
    BEGIN
        THROW 64005, 'No se encontraron empresas activas en dbo.Empresa.', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.Roles r
        INNER JOIN @ActiveCompanies ac
            ON ac.idEmpresa = r.idEmpresa
        WHERE LOWER(LTRIM(RTRIM(ISNULL(r.NombreRol, '')))) = 'operador base'
    )
    BEGIN
        THROW 64006, 'Ya existe un rol Operador Base en al menos una empresa activa.', 1;
    END;

    INSERT INTO dbo.Roles (id, idEmpresa, NombreRol, Permisos)
    SELECT
        NEWID(),
        ac.idEmpresa,
        'Operador Base',
        @ExpectedRoleJson
    FROM @ActiveCompanies ac;

    IF @@ROWCOUNT <> (SELECT COUNT(*) FROM @ActiveCompanies)
    BEGIN
        THROW 64007, 'No fue posible insertar el rol base en todas las empresas activas.', 1;
    END;

    COMMIT TRANSACTION;

    SELECT
        Resultado = 'COMMIT',
        TablaRespaldada = 'dbo.Roles',
        Respaldo = @BackupTableName,
        EmpresasActivas = (SELECT COUNT(*) FROM @ActiveCompanies),
        RolCreado = 'Operador Base',
        CodigoPermiso = '02005000',
        RutaMenu = '/ContestarLista/RecoleccionesBL26';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
