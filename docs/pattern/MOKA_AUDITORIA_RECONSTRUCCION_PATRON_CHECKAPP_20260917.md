# MOKA - Auditoria y reconstruccion Patron CheckApp - 2026-09-17

## Alcance ejecutado

- Golden Master auditado desde implementacion real de ProductosServicios:
  - `Views/ProductosServicios/Index.cshtml`
  - `Views/ProductosServicios/_ProductosServiciosCatalogModal.cshtml`
  - `wwwroot/css/checkapp-theme.css`
  - `wwwroot/css/ProductosServicios/ProductosServicios.css`
  - `wwwroot/js/checkapp-ui.js`
  - `wwwroot/js/ProductosServicios/ProductosServicios.js`
  - `wwwroot/js/ProductosServicios/ProductosServiciosCatalogModalShared.js`
- Matriz Golden Master A-Y creada en `inspector/docs/pattern/PATRON_CHECKAPP_GOLDEN_MASTER_COMPONENT_MATRIX_20260917.md`.
- Reconstruccion aplicada en:
  - `/Sucursales/SucursalesABC`
  - `/RazonesSociales/Index`
  - `/Regiones/Index`
- Documentacion oficial actualizada:
  - `inspector/docs/pattern/PATRON_CHECKAPP_OFICIAL_20260916.md`
  - `inspector/AGENTS.md`
  - `inspector/CLAUDE.md`
  - `inspectorapi/AGENTS.md`
  - `inspectorapi/CLAUDE.md`

## Causa raiz visual

Las tres pantallas objetivo cargaban y usaban `checkapp-admin-page` junto con `checkapp-admin-catalogs.css`, que redefinia tokens, hero, paneles, botones, grid, formularios y modales con un sistema paralelo. Eso producia una apariencia parecida a CheckApp, pero no equivalente al Golden Master real de ProductosServicios.

## Correccion aplicada

- Las vistas objetivo migran su wrapper a `checkapp-scope checkapp-page ca-catalog-page`.
- Las vistas cargan `checkapp-theme.css` antes de `ProductosServicios.css`.
- Los filtros usan `ps-filter-grid`, `ps-filter-field`, `ps-filter-tail` y `ps-filter-search-btn`.
- Los listados conservan `CheckAppUI.createDynamicGrid`, columnas configurables, contador, exportacion Excel, estados y paginacion.
- Los modales usan `ps-modal-dialog`/`ps-modal-content`/`ps-modal-body` o `ps-catalog-modal-*`, `ps-form-layout`, `ps-block-panel`, `ps-form-grid` y footer oficial `[Cancelar][Guardar]`.
- `checkapp-admin-catalogs.css` fue reemplazado por un adaptador minimo. Ya no redefine hero, panel, botones ni grid base.
- Se preservaron IDs de formularios, inputs, selects, tablas y botones para mantener contratos JS/MVC/API existentes.
- No se tocaron T25, reporte al lider ni BL-03.

## Datos y arquitectura preservados

- No se aplico DDL nuevo en esta reconstruccion visual.
- No se modificaron Firebase, Hosting, Conexiones ni rutas tenant.
- No se degradaron permisos, idEmpresa, Gate ni SuperAdmin.
- La persistencia de datos existente queda bajo los flujos MVC/API ya implementados.

## Validacion ejecutada

- `node --check inspector/checklist/wwwroot/js/checkapp-admin-catalogs.js`: OK.
- `node --check inspector/checklist/wwwroot/js/Sucursales/Sucursales.js`: OK.
- `node --check inspector/checklist/wwwroot/js/RazonesSociales/razonessociales.js`: OK.
- `node --check inspector/checklist/wwwroot/js/Regiones/regiones.js`: OK.
- `git -C inspector diff --check`: OK.
- `git -C inspectorapi diff --check`: OK.
- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`: OK, 419/419.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: OK con warnings legacy.
- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`: OK con warnings legacy.

## Runtime

- Antes de levantar procesos propios, `5200` y `5127` no tenian listeners.
- Se levantaron procesos propios en `http://localhost:5127` y `http://localhost:5200` para intentar QA runtime.
- HTTP sin sesion:
  - `/ProductosServicios/Index`: `HEAD` devuelve `405` y permite `GET`.
  - `/Sucursales/SucursalesABC`: `302` a Login.
  - `/RazonesSociales/Index`: `302` a Login.
  - `/Regiones/Index`: `302` a Login.
- Navegador Chrome local abrio `http://localhost:5200/` en Login; no habia sesion autenticada ni autofill en email/password.

## Dictamen

Reconstruccion tecnica aplicada y validada por build/tests/static checks. No se declara PASS visual final porque la comparacion runtime autenticada A-Y contra ProductosServicios no pudo completarse sin sesion activa en `5200`.

## Puertos

Los procesos `5200` y `5127` levantados por Codex deben liberarse al cierre de esta ejecucion. Si el Product Owner levanta sus propios procesos despues, no deben cerrarse desde esta corrida.
