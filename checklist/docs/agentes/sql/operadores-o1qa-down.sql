SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @IdEmpresa uniqueidentifier = 'B17AAECE-2B78-4E35-B554-9E694EEB15A7';
DECLARE @IdRol uniqueidentifier = 'B57CEFFB-9731-4354-845E-1EA02C0F33F7';
DECLARE @NombreRol varchar(200) = 'Operador Base';
DECLARE @Permisos nvarchar(max) = N'[{"Opcion":"02000000","Permisos":{"Acceso":1,"Escritura":0},"Hijos":[{"Opcion":"02005000","Permisos":{"Acceso":1,"Escritura":1},"Hijos":[]}]}]';

BEGIN TRANSACTION;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Roles
    WHERE id = @IdRol
      AND idEmpresa = @IdEmpresa
      AND NombreRol = @NombreRol
      AND Permisos = @Permisos
)
BEGIN
    RAISERROR('El rol objetivo no coincide con la configuración certificada de O1 QA.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END;

IF EXISTS (
    SELECT 1
    FROM dbo.OperadoresPerfil
    WHERE idRolOperador = @IdRol
)
BEGIN
    RAISERROR('El rol sigue relacionado con perfiles de Operador y no puede eliminarse.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END;

IF EXISTS (
    SELECT 1
    FROM dbo.ListasOperadoresAsignaciones loa
    INNER JOIN dbo.OperadoresPerfil op
        ON op.id = loa.idOperadorPerfil
    WHERE op.idRolOperador = @IdRol
)
BEGIN
    RAISERROR('El rol tiene uso operativo relacionado y no puede eliminarse.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END;

DELETE FROM dbo.Roles
WHERE id = @IdRol
  AND idEmpresa = @IdEmpresa
  AND NombreRol = @NombreRol
  AND Permisos = @Permisos;

IF @@ROWCOUNT <> 1
BEGIN
    RAISERROR('La reversa no eliminó exactamente un rol.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END;

COMMIT TRANSACTION;
