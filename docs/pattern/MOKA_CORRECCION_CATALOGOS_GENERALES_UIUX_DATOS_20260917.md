# MOKA Correccion PO - Catalogos Generales UI/UX + Datos

Fecha: 2026-09-17

## Alcance

Pantallas corregidas:

- `/Sucursales/SucursalesABC`
- `/RazonesSociales/Index`
- `/Regiones/Index`

Golden Master aplicado:

- `/ProductosServicios/Index`
- Modal quick-add de catalogo simple: `Nueva categoria`

Quedan fuera de alcance y congelados: T25, Reporte al Lider, BL-03, OC, Recepcion, Curvas, Huecos, Copetes, Firebase, Hosting, Conexiones, Denisse, SuperAdmin, Gate, AuthZ e idEmpresa.

## Correccion UI/UX

Se reconstruyeron los modales de catalogos generales para usar el patron de quick form del Golden Master:

- Sin tarjeta interna secundaria.
- Sin encabezados tecnicos como `Informacion de sucursal`, `Informacion fiscal` o `Informacion de region`.
- Sin textos descriptivos tecnicos dentro del formulario.
- Campos directos dentro del body del modal.
- Footer simple con `Cancelar` y `Guardar`.
- Editor HTML oficial para Notas.
- Botones sin iconos grises sobre fondo primario/rojo.

Distribucion final:

- Sucursales: Nombre, Direccion, Ciudad, Telefono, Correo, Pais, Razon Social, Region, Notas HTML.
- Razones Sociales: Razon Social, Representante, RFC, Direccion, Colonia, C.P., Ciudad, Estado, Pais, Telefono, Regimen Fiscal, Notas HTML. Regimen Fiscal usa el espacio completo disponible de su fila.
- Regiones: Region, Notas HTML.

## Causa Raiz De Datos

Primer punto exacto de falla identificado en el flujo Browser -> MVC -> API -> AuthZ -> Gate -> Tenant -> SQL:

`MVC -> API`, antes de AuthZ, Gate, Tenant y SQL.

La causa era que el proxy MVC firmaba y enviaba contexto de empresa, pero resolvia `UsuarioId` solo si `ClaimTypes.NameIdentifier` era GUID. En la sesion real, `ClaimTypes.NameIdentifier` contiene el Firebase UID autenticado. Si la sesion de servidor pierde `userUid` mientras la cookie de autenticacion sigue vigente, el proxy omitía el usuario firmado y el API rechazaba la llamada como identidad incompleta antes de llegar a autorizacion o SQL.

Correccion aplicada:

- El proxy acepta el `ClaimTypes.NameIdentifier` no GUID si es un identificador seguro.
- El identificador sigue firmado junto con empresa, timestamp y firma HMAC.
- El API conserva AuthZ real: valida contra `Usuarios.idFirebase` o `Usuarios.id`.
- No se omite Gate, no se omite idEmpresa y no se agregan datos hardcodeados.

## Patron Oficial

Actualizados:

- `docs/pattern/PATRON_CHECKAPP_OFICIAL_20260916.md`
- `docs/pattern/PATRON_CHECKAPP_GOLDEN_MASTER_COMPONENT_MATRIX_20260917.md`
- `AGENTS.md`
- `CLAUDE.md`
- `../inspectorapi/AGENTS.md`
- `../inspectorapi/CLAUDE.md`

Regla agregada al contrato: los catalogos generales simples deben replicar el quick-add de ProductosServicios, no el modal complejo de producto/servicio.

## Verificacion

Comandos ejecutados:

- `node --check inspector/checklist/wwwroot/js/checkapp-admin-catalogs.js`
- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`
- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`
- `git -C inspector diff --check`
- `git -C inspectorapi diff --check`

Resultado:

- MVC: compilacion correcta, 0 errores.
- API: compilacion correcta, 0 errores.
- API tests: 419 superados, 0 errores, 0 omitidos.
- JS syntax: correcto.
- Diff check: correcto.

## Nota Runtime 5200

Los puertos `5200` y `5127` estaban ocupados por procesos preexistentes del Product Owner y no fueron cerrados ni reiniciados por regla operativa. El runtime observado en `5200` seguia mostrando el binario anterior, por lo que la verificacion visual completa en navegador queda pendiente hasta que el Product Owner levante manualmente el build corregido.

No se declara PASS visual definitivo mientras el `5200` actual no ejecute estos cambios.
