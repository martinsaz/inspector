# Aplicacion Patron CheckApp - Proveedores

Fecha: 2026-09-17

## Alcance

Pantalla MVC `Activos/Proveedores` y API `ActivosProveedores`, manteniendo la tabla/modelo legacy de proveedores y llevando la experiencia visible al patron CheckApp usado por ProductosServicios.

## Cambios aplicados

- Alta de proveedor sin campo visible de codigo. El codigo queda oculto para alta y solo se muestra como lectura en edicion cuando existe.
- Campo `Nombre` en primera fila principal, sin compartir espacio con el codigo generado.
- `Descripcion` en segunda fila completa con TinyMCE local y toolbar oficial CheckApp.
- Footer homologado: `[Cancelar] [Guardar]`.
- Se conservaron campos funcionales legacy: nombre, razon social, RFC, telefono, telefono 1, email, descripcion, limite, clasificacion contable, cuenta contable, contacto, cuenta bancaria y estatus.
- `Descripcion` acepta HTML controlado en frontend y backend; API sanitiza server-side con allowlist de tags/atributos y bloquea scripts, handlers `on*`, estilos peligrosos y enlaces inseguros.
- Limite de descripcion de proveedores ajustado a `20000` para no truncar HTML razonable.

## Archivos principales

- `checklist/Views/Activos/Proveedores.cshtml`
- `checklist/wwwroot/js/Activos/Activos.js`
- `checklist/wwwroot/css/Activos/Activos.css`
- `checklistWs/Controllers/Activos/ActivosController.cs`

## QA

- `node --check checklist/wwwroot/js/Activos/Activos.js`: PASS.
- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`: PASS con warnings legacy/preexistentes.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: PASS con warnings legacy/preexistentes.
- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`: PASS 415/415.
- `git diff --check` en MVC/API: PASS.

## QA visual runtime

Se levanto un servidor temporal Codex en `5201` para comparar contra ProductosServicios. El acceso autenticado quedo bloqueado por aviso de sesion duplicada y redireccion a login, por lo que no se declara PASS visual total de runtime. El puerto temporal fue liberado. Los puertos manuales `5200` y `5127` ya estaban activos antes de la prueba y se dejaron intactos.

## Dictamen

Proveedores queda corregido en UI/UX y backend HTML para avanzar a la repeticion de QA visual autenticada contra ProductosServicios. No se declara cierre total visual hasta que el Product Owner levante runtime manual y se complete la comparacion autenticada.
