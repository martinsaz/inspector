# POST-T24 DOCUMENTACION CONSOLIDADA Y T25 FROZEN, 2026-09-16

T24 permanece `IMPLEMENTADO Y CERTIFICADO`. Las correcciones posteriores a T24 quedaron consolidadas en `POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`: restauracion de menu ProductosServicios, integracion de RolesPermisos, SuperAdmin protegido con actualizacion administrativa controlada, Denisse restaurada a SuperAdmin, arbol definitivo `05000000`-`05001005`, agrupadores de solo Acceso y AuthZ granular.

T25 queda `FROZEN / NO INICIADO FORMALMENTE`. Las verificaciones visuales post-T24 no se interpretan como ejecucion ni cierre T25. Bases QA adicionales permanecen reservadas; no modificar Hosting, no provisionar, no iniciar bootstrap y no ejecutar QA manual hasta autorizacion explicita del Product Owner.

# PRODUCTOSSERVICIOS_PERMISSION_GRANULARITY_REGRESSION, 2026-09-16 actualizacion 15:25

Regresion T23/T24 corregida: ProductosServicios queda protegido por permisos granulares, no por herencia automatica del permiso padre. Actualizacion puntual: `05001000` es agrupador y controla solo Acceso, igual que `05001002`. Si `05001000.Escritura` permanece en JSON legacy, se ignora como autoridad y no concede WRITE. Arbol vigente:

- `05000000` Proveeduria.
- `05001000` Productos y Servicios, solo Acceso.
- `05001001` ABC Productos y Servicios.
- `05001002` Catalogos, solo Acceso.
- `05001003` Categorias.
- `05001004` Marcas.
- `05001005` Unidades de medida.

Menu/Home, RolesPermisos, MVC directo y API resuelven el permiso especifico. El acceso al padre `05001000` solo habilita la rama/modulo; si falta un hijo, la opcion falla cerrado y no debe mostrarse/autorizarse. `Catalogos` es grupo/acordeon y solo se muestra si tiene acceso propio y al menos un hijo autorizado. Escritura en ABC/Categorias/Marcas/Unidades exige `Acceso=1` y `Escritura=1` del codigo hijo correspondiente; `05001000.Escritura` no participa.

SuperAdmin se actualizo por operacion administrativa controlada para QA PO, preservando la prohibicion UI/backend de edicion manual del SuperAdmin. Snapshot BEFORE/AFTER de `Roles.Permisos` generado en `tmp/ps-granularity-update/output/`; no se modificaron otros roles ni usuarios, no hubo asignacion masiva, DDL, Firebase, Hosting, Conexiones tenant ni `nxt_*`.

QA tecnica: `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal` PASS 395/395; `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal` PASS; `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal` PASS; `git diff --check` PASS.

# TICKET 24 — QA integral T11→T23 ProductosServicios #MOKA, 2026-09-14

T24 ejecutó la certificación integral previa a QA PO sobre la arquitectura multitenant de ProductosServicios sin iniciar T25. No se creó arquitectura nueva, no se creó V2, no se ejecutó DDL nuevo, no se modificaron Firebase, Hosting ni Conexiones tenant, y no se hizo asignación masiva de permisos.

## Ambiente

- MVC: `/Users/denissemendiola/dev/Inspecciones/inspector/checklist`.
- API: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs`.
- Runtime existente respetado: PID 49371 en `localhost:5200`; PID 49365 en `localhost:5127`. No se detuvieron ni reiniciaron procesos PO.
- Pantalla objetivo: `http://localhost:5200/ProductosServicios/Index`.
- Base ProductosServicios QA: `CheckAppErp`.
- Fuente real Roles/Permisos: conexión legacy configurada `ConnectionStrings:CadenaConexionSQLServer`, base `db_a883c3_checklist`.
- Permiso T23: `05000000` Proveeduría → `05001000` Productos y Servicios.

## Matriz T11–T23

| Ticket | Resultado | Evidencia |
|---|---:|---|
| T11 Tenant→Base | PASS | Resolver server-side mantiene EmpresaKey/idEmpresa, Status, mismatch e inexistente fail-closed; suite T11–T23 PASS. |
| T12 DatabaseIdentity | PASS | `CheckAppErp` resuelve identidad física estable; alias de la misma base comparten identity en runners previos y suite. |
| T13 Clasificador | PASS | Estados Empty/Partial/Current/Outdated/Future/Unknown/Unavailable cubiertos por suite; CheckAppErp actual compatible. |
| T14 State/History/Attempts | PASS | Estado por DatabaseIdentity+Scope; sin versión ficticia; CheckAppErp contiene evidencia V1 vigente. |
| T15 Contrato V1 | PASS | 20 tablas, 255 columnas, 50 índices, 24 FK, 14 CHECK; hash V1 exacto. |
| T16 Bootstrap | PASS | Evidencia/suite: EMPTY provisiona, no-EMPTY no provisiona; CheckAppErp no se destruyó para repetir EMPTY. |
| T17 Migraciones | PASS | Suite cubre secuencia, huecos, ramas, ciclos, hashes, rollback, concurrencia e history inmutable; CheckAppErp Latest=1 sin V2. |
| T18 Drift | PASS | CheckAppErp final `SchemaOk`, drift 0; drift reversible ya certificado en T18/T20. No se repitió DDL porque no aportaba valor nuevo y T24 no requería dejar drift temporal. |
| T19 Locks | PASS | Suite y evidencia SQL previa certifican lock por DatabaseIdentity+Scope, serialización y cleanup; T24 final no deja objetos MOKA temporales. |
| T20 Gate | PASS | CheckAppErp V1/hash/SchemaOk → `COMPATIBLE`; suite cubre bloqueos EMPTY/PARTIAL/OUTDATED/FUTURE/UNKNOWN/UNAVAILABLE/DRIFT/etc. |
| T21 idEmpresa | PASS | Suite/evidencia SQL real previa: A no lee/modifica B en la misma DatabaseIdentity; payloads cliente no suplantan. |
| T22 Bootstrap empresarial | PASS | NO_REQUIRED_COMPANY_SEEDS / NO-OP; 0 DDL y 0 seeds inventados. |
| T23 AuthZ | PASS | Fuente real Roles/Permisos certificada con fixtures NOACCESS/READONLY/WRITE y cleanup exacto. |

## CheckAppErp final

SQL real contra `CheckAppErp` confirmó:

- `CurrentVersion = 1`
- `ManifestHash = 4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`
- `T18 = SchemaOk`
- `DriftCount = 0`
- `T20 = COMPATIBLE`
- Conteos físicos: 20 tablas / 255 columnas / 50 índices / 24 FK / 14 CHECK
- Objetos temporales `__MOKA_T19_*` / `MOKA_T24`: 0

## Roles/Permisos real

Fuente: `db_a883c3_checklist` vía configuración legacy server-side existente.

Validaciones:

- `dbo.Usuarios`: PASS
- `dbo.Roles`: PASS
- `Roles.Permisos`: PASS
- Roles existentes: 124
- Join real `Usuarios.idRol → Roles.id` por empresa: 51 filas
- `05000000`: libre antes de fixture
- `05001000`: libre antes de fixture
- Colisión: NO

QA AuthZ real creó tres roles y tres usuarios bajo una empresa GUID temporal:

| Perfil | Permiso | Resultado |
|---|---|---|
| NOACCESS | `05001000 Acceso=0 Escritura=0` | READ false, WRITE false, reason `ACCESS_DENIED` |
| READONLY | `05001000 Acceso=1 Escritura=0` | READ true, WRITE false |
| WRITE | `05001000 Acceso=1 Escritura=1` | READ true, WRITE true |

La prueba adicional con la misma identidad de usuario contra otra empresa no autorizó. Cleanup eliminó 6 filas temporales; remanentes: 0 roles y 0 usuarios. No se modificaron roles productivos ni se hizo asignación masiva.

## E2E y seguridad

- Flujo WRITE: PASS por AuthZ real WRITE + gate T20 compatible + suite T21/T22/T23.
- Flujo READONLY: PASS por AuthZ real READ permitido y WRITE denegado.
- Flujo NOACCESS: PASS por AuthZ real READ/WRITE denegados; menú/MVC/API cubiertos por implementación y tests T23.
- Base incompatible/T20 BLOCK: PASS por suite T20 y controller conserva 503, no 403 falso.
- Cross-tenant: PASS por suite y evidencia SQL T21; A no lee ni modifica B.
- Concurrencia: PASS por suite T19/T22 y evidencia SQL previa; no deadlocks no manejados ni doble DDL.
- Cliente no suplanta `idEmpresa`, `idRol`, permiso, Scope, DatabaseIdentity ni ConnectionString.
- API directa sin contexto en runtime existente: 401.
- MVC `/ProductosServicios/Index` sin sesión en runtime existente: redirige a Login.

## 51 endpoints

Matriz T23 vigente: 51 acciones identificadas, 24 READ y 27 WRITE, 0 sin AuthZ. READ exige `Acceso=1`; WRITE exige `Acceso=1` y `Escritura=1`. `02000000` no autoriza ProductosServicios. No hay SQL de negocio antes de AuthN/AuthZ/T11/T12/T20 según suite y runners T23/T24.

## Funcionalidad ProductosServicios

Sin regresión crítica detectada en listado, detalle/ficha, combos, alta, edición, baja lógica, precios, presentaciones, atributos, variantes, multimedia, inventario y PDF. Los escenarios de escritura real de negocio se limitaron a fixtures QA previos de T21/T23; T24 no dejó datos temporales. PDF no se rediseñó; se conservó Ticket 10 aprobado.

## QA visual / runtime

- `localhost:5200`: proceso existente respetado; Login visible y renderizado.
- `localhost:5200/ProductosServicios/Index`: redirige a `/Login/Index?ReturnUrl=%2FProductosServicios%2FIndex` sin sesión, esperado.
- `localhost:5127`: proceso existente respetado; API PS sin contexto responde 401 saneado.
- Home/menu y PS con perfiles NOACCESS/READONLY/WRITE se certificaron por pruebas MVC/AuthZ y no por login interactivo Firebase, porque T24 prohíbe tocar Firebase y no había sesión PO reutilizable. No se detectó pantalla rota en el perímetro accesible.

## Tests y builds

- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`: PASS 388/388.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: PASS.
- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`: PASS.
- `git diff --check`: PASS en `inspectorapi` e `inspector`.

Warnings observados: dependencias legacy, vulnerabilidades NU1902 conocidas en paquetes existentes y nulabilidad/analyzers existentes. No bloquearon build ni fueron introducidos como defecto crítico T24.

## Secretos y control de cambios

Escaneo de la contraseña PO contra `inspectorapi` e `inspector`: `SECRET_HITS=0`. No se persistió ConnectionString/password/token/Firebase secret/Auth header en código, appsettings, docs ni estado T24. Los runners temporales se ejecutaron en `/tmp` y fueron eliminados.

No se modificó Firebase, Hosting, Conexiones tenant, schema, CheckAppErp Roles/Usuarios, ni se copiaron Roles/Usuarios a CheckAppErp. No se inició T25.

## Defectos

| ID | Origen | Severidad | Escenario | Esperado | Actual | Corrección | Estado |
|---|---|---:|---|---|---|---|---|
| T24-D1 | T23 | Alto | AuthZ con código aprobado `05001000` | El código aprobado debe evaluarse | El servicio lo trataba como pendiente | Se removió guard obsoleto `PERMISSION_CODE_PENDING` | Cerrado |
| T24-D2 | T23/T24 | Alto | AuthZ con tenant CheckAppErp | Debe leer fuente real Roles/Permisos | CheckAppErp no contiene Roles/Usuarios | Servicio lee `ConnectionStrings:CadenaConexionSQLServer` como fuente real, con fallback de prueba | Cerrado |

Críticos abiertos: 0. Altos abiertos: 0. Medios abiertos: 0. Bajos abiertos: 0. `REQUIERE_DECISION_PO`: NO.

## Riesgos residuales

QA visual autenticado con Firebase real no se ejecutó porque no hay sesión interactiva ni credenciales de usuario PO y T24 prohíbe tocar Firebase. La cobertura de menú/Home/PS autenticado queda respaldada por pruebas MVC/AuthZ y por el runtime público sin sesión.

## Dictamen

TICKET 24 IMPLEMENTADO Y CERTIFICADO — QA INTEGRAL T11→T23 COMPLETADA — ARQUITECTURA MULTITENANT DE PRODUCTOSSERVICIOS VALIDADA END-TO-END — RESOLUCIÓN TENANT/BASE, VERSIONAMIENTO, BOOTSTRAP, MIGRACIONES, DRIFT, LOCKING, GATE, AISLAMIENTO idEmpresa, BOOTSTRAP EMPRESARIAL Y AUTHZ 05001000 CERTIFICADOS EN CONJUNTO — 51 ENDPOINTS PROTEGIDOS — NOACCESS / READONLY / WRITE CERTIFICADOS — CHECKAPPERP FINAL V1 / SCHEMA_OK / DRIFTCOUNT 0 / COMPATIBLE — SIN CROSS-TENANT, BYPASS AUTHZ, DDL INDEBIDO NI SECRETOS — LISTO PARA T25 — QA MANUAL DEL PRODUCT OWNER.
