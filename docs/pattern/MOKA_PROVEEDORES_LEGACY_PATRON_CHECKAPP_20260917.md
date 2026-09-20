# MOKA - Proveedores Legacy a Patron CheckApp

Fecha: 2026-09-17

## Auditoria Legacy

Origen auditado: `/Users/denissemendiola/dev/skncCreator`.

Archivos Legacy revisados:
- `skncCreator/Controllers/AdministracionController.cs`
- `skncCreator/Views/Administracion/Proveedores.cshtml`
- `skncCreator/Scripts/Administracion/fcproveedores.js`
- `skncCreator/Models/FcProveedores.cs`

Tabla Legacy: `fcproveedores`.

Campos reales detectados:
- `idEmpresa`
- `idProveedor`
- `Nombre`
- `RFC`
- `Telefono`
- `Telefono1`
- `Descripcion`
- `Email`
- `RazonSocial`
- `FechaAlta`
- `Limite`
- `Estatus`
- `Tipo`
- `ClasifContable`
- `CuentaContable`
- `Contacto`
- `CuentaBancaria`

Reglas Legacy relevantes:
- Alta/edicion por `idProveedor`.
- `Nombre` es el campo principal requerido por la pantalla.
- `Email` se persiste en minusculas.
- `Limite` es numerico y se persiste como decimal.
- `Estatus` Legacy usa `"1"`/`"0"`; NEXT lo conserva como `Activo bit`.
- `ClasifContable` Legacy usa switch directo/indirecto; NEXT lo conserva como `ClasifContable bit`.
- Listado Legacy expone Nombre, RFC, Telefono, Telefono1, Descripcion, Email, RazonSocial, Estado y Limite.

## Implementacion NEXT

Repos modificados:
- MVC: `/Users/denissemendiola/dev/Inspecciones/inspector/checklist`
- API: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs`

Cambios principales:
- `ProveedorActivoDto` extendido en MVC/API con todos los campos funcionales Legacy.
- `GuardarProveedorActivo` MVC ahora envia razon social, RFC, telefonos, email, limite, clasificacion contable, cuenta contable, contacto y cuenta bancaria.
- API separo Proveedores del helper de catalogo basico para listar, detallar y guardar todos sus campos sin afectar Tipos/Marcas/Estados.
- Busqueda de Proveedores ampliada a codigo, nombre, descripcion, razon social, RFC, email y contacto.
- Modal y grid CheckApp de Proveedores actualizados con campos Legacy y exportacion.
- `ActivosProveedores.Descripcion` queda como `nvarchar(max)`.
- `ActivosProveedores` incorpora defaults, constraint `CK_ActivosProveedores_Limite` e indices por empresa/codigo, empresa/activo/nombre y empresa/RFC.

## SQL CheckAppErp

Script implementado:
- `inspectorapi/checklistWs/Scripts/activos-proveedores-legacy-parity-up.sql`

Certificacion real ejecutada contra `CheckAppErp`:
- Base verificada: `DB_NAME() = CheckAppErp`.
- DDL idempotente aplicada.
- Columnas nuevas verificadas: 10/10.
- `Descripcion` verificada como `NVARCHAR(MAX)`.
- Constraint de limite verificado.
- Indice RFC verificado.
- CRUD real probado dentro de transaccion con rollback.
- Cross-tenant probado: registro de empresa B no fue visible para empresa A.

Resultado: PASS.

## Pruebas

- `node --check inspector/checklist/wwwroot/js/Activos/Activos.js`: PASS.
- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`: PASS con advertencias existentes.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: PASS con advertencias existentes.
- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`: PASS, 415/415.

## Alcance congelado

T25 permanecio FROZEN. No se modifico Legacy. No se tocaron CheckApp2 ni CheckApp3.
