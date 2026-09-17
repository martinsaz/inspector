# Aplicacion Patron CheckApp - Sucursales, Razones Sociales y Regiones - 2026-09-16

## Estado

Se aplico el Patron CheckApp en MVC a `/Sucursales/SucursalesABC`, `/RazonesSociales/Index` y `/Regiones/Index`, tomando `/ProductosServicios/Index` como referencia visual y `checkapp-ui.js` como DynamicGrid oficial.

Actualizacion 2026-09-17: Product Owner aprobo jerarquia, codigos y scope tecnico. Se implemento Ajustes -> Sucursales como agrupador, ABC Sucursales como pantalla funcional nueva `04003100`, y Razones Sociales/Regiones como hijos del mismo scope tecnico `Sucursales`.

Actualizacion 2026-09-17 cierre CheckAppErp: se preparo y certifico el carril tecnico API para `Scope=Sucursales` con contrato V1, inventario de tablas, version conocida, bootstrap EMPTY, gate, locks, drift real reversible, CRUD multitenant y firma HMAC desde MVC. La certificacion SQL real contra `CheckAppErp` queda PASS para el scope `Sucursales`; AuthZ real queda certificada contra `db_a883c3_checklist`; ProductosServicios quedo migrado a V2 en `CheckAppErp` con gate `COMPATIBLE`.

T25 permanece `FROZEN`. No se modificaron Hosting, Firebase, Conexiones ni bases QA reservadas.

## BEFORE

- Sucursales usaba DataTables legacy, modal antiguo y permiso `04003000`. Relaciones reales preservadas: Razón Social (`idRazonSocial`) y Región (`idZona`).
- Razones Sociales usaba DataTables legacy, modal antiguo y permiso `04004000`. Campos fiscales/legales reales preservados.
- Regiones usaba DataTables legacy, modal antiguo con footer inconsistente y permiso `04005000`.
- Las tres rutas MVC no tenian `[Authorize]` explicito en el controller.

## AFTER

- Vistas homologadas con `checkapp-hero`, `checkapp-panel`, accordion de filtros, DynamicGrid, buscador interno, columnas configurables, paginacion, page size, Excel y estados loading/empty/error.
- Modales de alta/edicion homologados con footer `[Cancelar] [Guardar]`.
- Nueva capa compartida `wwwroot/js/checkapp-admin-catalogs.js`.
- Nuevos estilos compartidos `wwwroot/css/checkapp-admin-catalogs.css`.
- JS legacy de Sucursales recreado en UTF-8 por bytes heredados no validos.
- Controllers MVC protegidos con `[Authorize]`.
- Sucursales corrige orden de columnas Razón Social/Región en la respuesta MVC legacy.

## Scope / schema / descripcion HTML

- Scope tecnico aprobado: `Sucursales`, que agrupa `ABC Sucursales`, `Razones Sociales` y `Regiones`.
- Se agrego soporte versionado API para `Scope=Sucursales`:
  - Inventario esperado: `dbo.RazonesSociales`, `dbo.Zonas`, `dbo.Sucursales`.
  - Contrato V1 para las tres tablas.
  - Version conocida V1.
  - Bootstrap EMPTY habilitado para scope `Sucursales`.
  - Gate de compatibilidad habilitado para scope `Sucursales`.
  - Lock de operacion normaliza `Sucursales`.
  - Baseline historico V1 con `SUCURSALES_V1_HISTORICAL_BASELINE`.
- No se ejecuto DDL.
- No se inventaron campos.
- `Descripcion HTML`: NO APLICA en las tres rutas; no existe campo conceptual `Descripcion`. `Notas` permanece texto libre legacy.
- XSS: el grid nuevo escapa valores con `CheckAppUI.escapeHtml`; no se renderizan notas como HTML.

## Permisos

- Jerarquia aprobada:
  - `04000000` Ajustes: agrupador, solo Acceso.
  - `04003000` Sucursales: agrupador, solo Acceso.
  - `04003100` ABC Sucursales: funcional, Acceso + Escritura.
  - `04004000` Razones Sociales: funcional, Acceso + Escritura.
  - `04005000` Regiones: funcional, Acceso + Escritura.
- El padre no concede permisos de hijos. Excepcion controlada de compatibilidad: roles legacy con `04003000` plano y sin hijos se interpretan como ABC Sucursales hasta que el rol sea editado/guardado en RolesPermisos.
- `RolesPermisos` guarda la nueva jerarquia bajo `04003000`; `04004000` y `04005000` ya no se persisten como hermanos directos de Ajustes en roles nuevos.
- Menu lateral oculta agrupadores vacios. Con roles legacy `04003000` plano muestra `ABC Sucursales`.
- `Utilerias.GetOpcion` usa busqueda recursiva exacta para soportar la nueva profundidad sin depender de prefijos.
- `Inicializa` retorna `access` y `perm`; los grids no cargan datos si `access != 1`, y los endpoints MVC de guardado fallan cerrado si `Escritura != 1`.
- MVC firma las llamadas RestSharp de Sucursales/Razones Sociales/Regiones con cabeceras HMAC `X-ProductosServicios-Proxy-*`, reutilizando el protocolo existente.
- API tiene resolver reusable de contexto seguro para `Scope=Sucursales`: valida identidad HMAC/principal, resuelve tenant server-side, ejecuta AuthZ por permiso funcional y pasa por gate `Sucursales`.
- API AuthZ reconoce `04000000` y `04003000` como agrupadores solo Acceso; los permisos funcionales siguen siendo `04003100`, `04004000`, `04005000`.
- SuperAdmin protegido: sin cambios.
- Denisse SuperAdmin: sin cambios.
- Asignacion masiva: NO.

## QA

- `node --check` en `checkapp-admin-catalogs.js`, `Sucursales.js`, `razonessociales.js`, `regiones.js`: PASS.
- `node --check` en `RolesPermisos.js` y `Utilerias.js`: PASS.
- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`: PASS con warnings legacy/preexistentes.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: PASS con warnings legacy/preexistentes.
- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`: PASS 404/404.
- `git diff --check` en MVC/API: PASS.
- Certificacion SQL real `CheckAppErp` para `Scope=Sucursales` V1: PASS. Bootstrap real, state/history/attempts, idempotencia, drift reversible, locking, CRUD, aislamiento multitenant, limpieza de fixtures y gate final `COMPATIBLE`.
- Detalle formal: `inspector/docs/database/TICKET_SCOPE_SUCURSALES_V1_CERTIFICACION_CHECKAPPERP_20260917.md`.
- AuthZ SQL real: PASS contra fuente independiente `db_a883c3_checklist`; `CheckAppErp` no requiere `dbo.Usuarios`/`dbo.Roles`.
- ProductosServicios en `CheckAppErp`: V2, `SchemaOk`, `DriftCount=0`, gate `COMPATIBLE`.
- Runtime autenticado desktop/tablet/mobile: no ejecutado por falta de sesion interactiva disponible; implementacion responsive aplicada estaticamente.

## Regresion y control

- ProductosServicios V2: migrado en `CheckAppErp` por T17.
- T20/T21/T22/T23/T24: se reutilizo arquitectura de tenant/schema/gate sin descongelar T25.
- Login/Home/RolesPermisos: actualizados solo para la nueva jerarquia de permisos aprobada.
- Firebase modificado: NO.
- Hosting: NO.
- Conexiones: NO.
- Bases T25 usadas: NO.
- DDL: SI, exclusivamente migracion T17 aprobada `PS-M20260916-V1-V2-DESCRIPCIONES-NVARCHAR-MAX`.
- Secretos: NO.
- T25: FROZEN.

## Dictamen

PATRON CHECKAPP APLICADO EN MVC A SUCURSALES, RAZONES SOCIALES Y REGIONES; JERARQUIA APROBADA DE AJUSTES -> SUCURSALES -> ABC SUCURSALES/RAZONES SOCIALES/REGIONES IMPLEMENTADA EN MENU, ROLESPERMISOS, DEFAULT ROLES, UTILITARIAS Y MVC AUTHZ; DISEÑO, RESPONSIVE, DYNAMICGRID, FILTROS, FORMULARIOS, MODALES, CANCELAR/GUARDAR Y PROTECCION MVC HOMOLOGADOS CONTRA PRODUCTOSSERVICIOS; API CON SCOPE SUCURSALES V1, GATE, FIRMA HMAC Y AUTHZ FUNCIONAL CONTRA FUENTE REAL LEGACY; FUNCIONALIDAD PREEXISTENTE PRESERVADA; SIN FIREBASE/HOSTING/CONEXIONES; T25 PERMANECE FROZEN. SCOPE SUCURSALES V1 CERTIFICADO EN SQL REAL CHECKAPPERP. PRODUCTOSSERVICIOS V2 COMPATIBLE EN CHECKAPPERP. CIERRE TOTAL #MOKA PASS.
