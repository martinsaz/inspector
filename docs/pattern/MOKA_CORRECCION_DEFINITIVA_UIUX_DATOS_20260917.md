# MOKA - Correccion definitiva UI/UX + datos - 2026-09-17

## Scope

- Proveedores en `5200/Activos/Proveedores`.
- ABC Sucursales en `5200/Sucursales/SucursalesABC`.
- Razones Sociales en `5200/RazonesSociales/Index`.
- Regiones en `5200/Regiones/Index`.
- Comparativo runtime contra `5200/ProductosServicios/Index`.

T25 permanece frozen: no se modifico ni se uso como base de correccion.

## Causa encontrada

### Proveedores UI

El modal de Proveedores quedaba sin cuerpo porque el normalizador runtime ocultaba el ancestro `div` mas cercano del campo codigo:

`#txCodigoProveedorActivo.closest("label, .checkapp-field, .form-group, div").first().hide()`

En la vista standalone el campo codigo es un input hidden dentro del grid principal, por lo que el selector terminaba ocultando el contenedor completo del formulario.

Correccion aplicada:

- El codigo de nuevo proveedor queda no capturable sin ocultar el body del modal.
- Se oculta solo el campo explicito `#fieldCodigoProveedorActivo` cuando exista.
- En alta de proveedor se omite `codigo` del payload para preservar generacion backend.

### Datos / Gate / Tenant

La cadena real observada fue:

Browser -> MVC: OK
MVC -> API: OK
API -> AuthZ/Gate: fallo previo con 503
Tenant/SQL: datos existentes

Primer punto exacto de falla: gate de compatibilidad del API por scope sin versionado activo y drift fisico contra contrato.

Evidencia SQL real previa:

- `ActivosProveedores`: 3 registros.
- `Sucursales`: 5 registros.
- `RazonesSociales`: 1 registro.
- `Zonas`: 5 registros.
- `CheckAppSchemaState`: solo tenia versionado `ProductosServicios`.

Correccion aplicada:

- Se agrego contrato versionado V1 para `Proveedores`.
- Se ajusto contrato `Sucursales` a la fisica real legacy de `RazonesSociales`, `Zonas`, `Sucursales` y `SucursalesTipos`.
- Se aplico DDL compatible sobre CheckAppErp para Proveedores/Sucursales.
- Se adopto baseline historico real por scope.

Resultado de adopcion:

- `Proveedores`: `Version=1`, `SchemaOk`, `Drift=0`, `Gate=True`, `COMPATIBLE`.
- `Sucursales`: `Version=1`, `SchemaOk`, `Drift=0`, `Gate=True`, `COMPATIBLE`.

## Archivos corregidos en este cierre

- `checklist/wwwroot/js/Activos/Activos.js`
- `checklistWs/Services/Tenant/ProductosServiciosSchemaContractProvider.cs`

## Validacion tecnica

- MVC `dotnet build checklist/checklist.csproj --no-restore --verbosity minimal`: PASS con warnings NuGet preexistentes.
- API `dotnet build checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: PASS con warnings NuGet preexistentes.
- `node --check checklist/wwwroot/js/Activos/Activos.js`: PASS.
- `git diff --check`: PASS en inspector e inspectorapi.

## Estado de runtime visual

Durante la revalidacion en navegador, la sesion quedo invalidada por control de sesion concurrente y el browser redirigio a login. No se declara PASS visual final de 5200 mientras esa sesion no este activa otra vez.

Los puertos `5200` y `5127` fueron liberados al cierre de la ejecucion para respetar la regla operativa de levantamiento manual.
