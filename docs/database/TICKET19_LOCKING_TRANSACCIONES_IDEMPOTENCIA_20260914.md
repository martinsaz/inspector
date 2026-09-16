# TICKET 19 — Locking, transacciones e idempotencia por DatabaseIdentity + Scope

Fecha: 2026-09-14  
Scope principal: `ProductosServicios`  
Resultado: **IMPLEMENTADO Y CERTIFICADO EN SQL SERVER REAL**.

## Dictamen

**TICKET 19 IMPLEMENTADO Y CERTIFICADO — LOCKING SQL POR DATABASEIDENTITY + SCOPE OPERATIVO — DOBLE CREATE/MIGRACIÓN EVITADO ENTRE EMPRESAS E INSTANCIAS — RELECTURA POST-LOCK, TRANSACCIONES, ROLLBACK E IDEMPOTENCIA CONFIRMADOS — CONCURRENCIA SQL REAL CERTIFICADA — CHECKAPPERP PERMANECE V1 / SCHEMA_OK — SIN IMPACTO A FIREBASE, TENANTS, DATOS NI BASE HISTÓRICA — LISTO PARA QA/Cierre DEL PRODUCT OWNER.**

T19 consolida una política transversal de exclusión mutua para operaciones estructurales. La unidad de lock es la base física identificada por `DatabaseIdentity` más el `Scope`; no usa `idEmpresa`, usuario, PID, instancia API ni connection string textual como llave funcional.

## Archivos principales

- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaOperationLockModels.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SqlSchemaOperationLock.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/ProductosServiciosSchemaBootstrapper.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaMigrationRunner.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Program.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/Services/Tenant/SchemaOperationLockTests.cs`

## Lock canónico

Servicio nuevo: `ISchemaOperationLock` / `SqlSchemaOperationLock`.

La autoridad del lock es SQL Server mediante `sp_getapplock`, con `LockOwner = Session`, `LockMode = Exclusive`, timeout finito y validación explícita del entero devuelto por SQL Server.

Recursos canónicos:

- Control: `CheckApp.Schema.Control:{DatabaseIdentity.Fingerprint}`
- Scope ProductosServicios: `CheckApp.Schema.ProductosServicios:{DatabaseIdentity.Fingerprint}`

El fingerprint viene de T12 y normaliza servidor físico, instancia, base y `database_guid`. Dos empresas o dos aliases que resuelven a la misma identidad convergen al mismo recurso. Bases distintas producen recursos distintos. Scopes distintos comparten orden de infraestructura, pero tienen lock funcional distinto.

## Orden de locks

Cuando una operación requiere infraestructura T14 y scope funcional, el orden fijo es:

1. `CheckApp.Schema.Control:{fingerprint}`
2. `CheckApp.Schema.ProductosServicios:{fingerprint}`

El adaptador `ISchemaProvisionLock` ahora usa internamente `SqlSchemaOperationLock`, preservando compatibilidad con T16/T17 y evitando invertir el orden.

## Timeout, cancelación, deadlock y release

`SqlSchemaOperationLock` clasifica retornos de `sp_getapplock`:

- `-1` → `LOCK_TIMEOUT`
- `-2` → `LOCK_CANCELLED`
- `-3` → `LOCK_DEADLOCK`
- otros negativos → `LOCK_FAILED`

También clasifica `OperationCanceledException` como cancelación y `SqlException 1205` como deadlock. El release usa `finally`/`IAsyncDisposable`, por lo que success, excepción y cancelación liberan el lock de sesión.

Si el lock no se adquiere, no se ejecuta DDL. Bootstrap devuelve no-op fail-closed con reason de lock. Migración devuelve `LockTimeout` para timeout y `Failed` para otros fallos de lock.

## Relectura post-lock

Bootstrap ya no crea `Attempt` ni infraestructura T14 antes del lock efectivo. Tras adquirir Control→Scope:

- asegura infraestructura T14;
- registra `Attempt STARTED`;
- relee attempts relevantes;
- reclasifica T13;
- sólo si sigue `Empty` ejecuta provisionamiento;
- si otro proceso ya provisionó, devuelve `ALREADY_PROVISIONED` sin DDL.

Migración T17 ya releyó dentro del lock: clasificación, State e History. T19 conserva ese flujo y agrega manejo explícito de lock fail-closed.

## Transacción y atomicidad

El DDL estructural sigue ejecutándose con `SqlConnection + SqlTransaction` explícita en `SchemaProvisionExecutor` y `SchemaMigrationSqlExecutor`. T17 mantiene `SET XACT_ABORT ON` en migraciones. T18 post-validación usa la misma conexión/transacción en migración, por lo que ve el estado transaccional antes del commit.

State/History de éxito se escriben después de validar. Si falla el DDL o la post-validación, se ejecuta rollback y no se registra History SUCCESS ni avance de versión. La recuperación de commit incierto T17 permanece vigente: reconcilia con State, History y validación física antes de marcar `RECOVERED`.

## Idempotencia

Bootstrap mantiene idempotencia por `DatabaseIdentity + Scope`: después de un éxito, reintentos devuelven `ALREADY_PROVISIONED` y no duplican DDL, State ni History.

Migración mantiene idempotencia conceptual por `DatabaseIdentity + Scope + MigrationId`: History PASS con el mismo `MigrationId` evita reaplicar el SQL. El paquete real de ProductosServicios sigue sin V2: `LatestSchemaVersion=1`, `PACKAGE_MIGRATIONS=0`.

## QA automatizado

Suite API ejecutada:

- Total: 195
- PASS: 195
- FAIL: 0

T19 agrega pruebas para:

- recurso por identidad/scope, no por idEmpresa ni connection string;
- aliases de misma identidad convergen;
- bases distintas producen recursos distintos;
- Control y Scope son recursos separados;
- orden Control→Scope y release inverso;
- release en excepción;
- timeout/cancel/deadlock/error fail-closed;
- bootstrap no ejecuta DDL ni State/History si falla lock;
- relectura de clasificación post-lock antes de DDL;
- 10 reintentos tras éxito sin duplicar History/State/DDL;
- dos empresas en la misma identidad provisionan una sola vez;
- dos identidades distintas operan independientemente.

Las pruebas T16–T18 previas siguen cubriendo rollback, post-validación T18 en transacción, commit incierto, History SUCCESS único, State sin avance tras rollback, drift, contrato V1 y ausencia de V2 real.

## Certificación SQL real — CheckAppErp

La certificación real se ejecutó contra `CheckAppErp` con evidencia saneada y sin imprimir credenciales.

Preflight:

- `DB_NAME = CheckAppErp`
- `SANITIZED_IDENTITY = VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`
- `CurrentVersion = 1`
- Hash T15 V1: PASS
- BEFORE T18: `SchemaOk`, `DriftCount=0`, conteos `20/255/50/24/14`

Lock real:

- `RESOURCE_CONTROL = CheckApp.Schema.Control:{fingerprint}`
- `RESOURCE_SCOPE = CheckApp.Schema.ProductosServicios:{fingerprint}`
- `RESOURCE_ALIAS_SAME = True`
- `RESOURCE_OTHER_SCOPE_DISTINCT = True`
- `RESOURCE_OTHER_DB_DISTINCT = True`
- `RESOURCE_HAS_IDEMPRESA = False`
- `RESOURCE_HAS_CONNECTIONSTRING = False`
- Proceso A lock adquirido: PASS
- Proceso B bloqueado con timeout mientras A retenía lock: PASS
- Proceso B adquirió después del release de A: PASS
- Otro scope adquirió mientras `ProductosServicios` estaba retenido: PASS
- Otro recurso/base adquirió mientras `ProductosServicios` estaba retenido: PASS

Idempotencia real con fixture QA aislada:

- Fixture: `dbo.__MOKA_T19_Idempotencia`
- DDL efectivo en 10 intentos: 1
- Tabla creada durante prueba: 1
- Fixture limpiada: PASS

Validación final CheckAppErp:

- `CurrentVersion = 1`
- Hash T15 V1: PASS
- AFTER T18: `SchemaOk`
- `DriftCount = 0`
- Conteos finales: `20/255/50/24/14`

## Seguridad y aislamiento

No se documentaron ni persistieron credenciales, password, token ni connection string. Los logs y documentos usan identidad saneada, recursos de lock y conteos.

No se modificó Firebase, Hosting, Conexiones, Login/Auth, roles/permisos, UI/CRUD ProductosServicios, datos de negocio ni base histórica 163. El único DDL real fuera de producto fue la fixture QA aislada `dbo.__MOKA_T19_Idempotencia`, creada y eliminada durante la certificación.

## Pendientes T20+

T19 no implementa gate CRUD, 503 global, bloqueo de endpoints ni UI operativa. Eso queda para T20 o posterior.
