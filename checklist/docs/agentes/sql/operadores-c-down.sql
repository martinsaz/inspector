/*
  Operadores - Paquete C
  DOWN controlado sobre el modelo real legacy.

  Elimina unicamente roles base creados por el seed de Paquete C
  cuando siguen intactos y no tienen uso operativo.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @ExpectedRoleJson nvarchar(max) =
    N'[{"Opcion":"02000000","Permisos":{"Acceso":1,"Escritura":0},"Hijos":[{"Opcion":"02005000","Permisos":{"Acceso":1,"Escritura":1},"Hijos":[]}]}]';

DECLARE @SeededRoles table
(
    id uniqueidentifier PRIMARY KEY
);

INSERT INTO @SeededRoles (id)
SELECT r.id
FROM dbo.Roles r
WHERE r.NombreRol = 'Operador Base'
  AND r.Permisos = @ExpectedRoleJson;

IF NOT EXISTS (SELECT 1 FROM @SeededRoles)
BEGIN
    SELECT Resultado = 'SIN_CAMBIOS', Observacion = 'No existen roles base intactos creados por Paquete C para revertir.';
    RETURN;
END;

IF EXISTS
(
    SELECT 1
    FROM dbo.Usuarios u
    INNER JOIN @SeededRoles sr
        ON sr.id = u.idRol
)
BEGIN
    THROW 64100, 'El DOWN se detuvo porque al menos un rol base ya esta asignado a Usuarios.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM dbo.OperadoresPerfil op
    INNER JOIN @SeededRoles sr
        ON sr.id = op.idRolOperador
)
BEGIN
    THROW 64101, 'El DOWN se detuvo porque al menos un rol base ya esta referenciado por OperadoresPerfil.', 1;
END;

DELETE r
FROM dbo.Roles r
INNER JOIN @SeededRoles sr
    ON sr.id = r.id;

SELECT
    Resultado = 'COMMIT',
    RolesEliminados = @@ROWCOUNT,
    Observacion = 'Solo se eliminaron roles base intactos de Paquete C. Los respaldos permanecen.';
