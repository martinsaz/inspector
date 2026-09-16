# TICKET 17 — Motor de migraciones secuenciales ProductosServicios

## Objetivo

T17 implementa el motor general para resolver y ejecutar migraciones secuenciales por `DatabaseIdentity + Scope`, reutilizando la infraestructura de T13, T14, T15 y T16. No define una versión funcional V2 de ProductosServicios y no convierte fixtures de prueba en releases reales.

## Alcance

El alcance queda limitado a infraestructura de migración: paquete/release, manifest de migración, resolución de cadena, validación de hashes, historial inmutable, ejecución transaccional, lock, rollback lógico, recuperación de commit incierto y pruebas automatizadas. No se modificó Firebase, Hosting, Login/Auth, tenants, UI, CRUD ni datos de negocio.

## Arquitectura

Se agregaron servicios bajo `checklistWs/Services/Tenant`:

- `SchemaMigrationModels`: modelos de release, migración, resultado y contratos de servicio.
- `ProductosServiciosMigrationPackageProvider`: paquete real aprobado para ProductosServicios. El release actual declara `LatestSchemaVersion = 1` y no contiene transiciones reales.
- `SchemaMigrationResolver`: resuelve `GetPendingMigrations(DatabaseIdentity, Scope, CurrentVersion, TargetVersion)` desde el paquete aprobado.
- `SchemaMigrationSqlExecutor`: ejecuta una transición con `SqlConnection`, `SqlTransaction`, `SET XACT_ABORT ON`, `SqlCommand` y validación física antes del commit.
- `SchemaMigrationRunner`: integra T13/T14/T15/T16, lock por `DatabaseIdentity + Scope`, State, History, Attempts, ejecución secuencial y recuperación.

## Formato migration.json conceptual

Cada transición futura debe mapearse a `SchemaMigrationDefinition` con los campos mínimos del ticket:

- `MigrationId`
- `BaselineId`
- `Scope`
- `FromVersion`
- `ToVersion`
- `Order`
- `ObjectsAffected`
- `Preconditions`
- `DataPreconditions`
- `SqlHash`
- `TargetManifestHash`
- `TransactionMode`
- `Risk`
- `AutoApplicable`
- `Timeout`
- `Dependencies`
- `RecoveryPolicy`
- `UpSql`
- `TargetContract`

El motor no selecciona migraciones por nombre de archivo ni por glob; usa exclusivamente el paquete entregado por el provider.

## Cadena de migraciones

`SchemaMigrationResolver` exige una cadena única desde `CurrentVersion` hasta `TargetVersion`. Bloquea huecos, ramas, ciclos, target superior al release, versión futura, baseline incompatible, scope incompatible, metadata incompleta, SQL con `GO`, hash SQL alterado y hash de contrato destino alterado.

Si el release futuro contiene `1 -> 2`, `2 -> 3`, `3 -> 4`, el resultado pendiente se devuelve en ese orden. No existe ejecución directa `1 -> 4`.

## Hash e inmutabilidad

El SQL se valida con SHA-256 contra `SqlHash`. El contrato destino se vuelve a canonizar con `SchemaManifestProvider` y se compara contra `TargetManifestHash`. History se trata como append-only: si una migración aplicada tiene distinto `MigrationId`, `SqlHash`, `TargetManifestHash`, `FromVersion` o `ToVersion` respecto al paquete actual, el motor devuelve `HISTORIAL_INCONSISTENTE` y no ejecuta DDL.

## Lock

El runner usa el mecanismo T16 `ISchemaProvisionLock`, basado en `sp_getapplock`, por `DatabaseIdentity + Scope`. No usa `idEmpresa`, tenant ni versión como granularidad de lock. Si el lock no se obtiene, la migración no avanza.

## Transacción y rollback

`SchemaMigrationSqlExecutor` abre conexión SQL, ejecuta `SET XACT_ABORT ON`, inicia transacción explícita, evalúa precondiciones, ejecuta sólo el `UpSql` aprobado y valida físicamente el contrato destino dentro de la misma conexión/transacción. Ante error de precondición, DDL o validación, hace rollback y el runner registra Attempt `FAIL` sin avanzar State ni registrar History `PASS`.

## State / History / Attempts

Se reutilizan las tablas T14:

- State: conserva una fila por `DatabaseIdentity + Scope` y se actualiza sólo después de una migración validada.
- History: registra `MIGRATED` únicamente cuando una transición real se ejecutó y pasó validación.
- Attempts: registra intentos `STARTED`, `PASS`, `FAIL` y reason codes saneados.

No se guarda connection string, password, token ni secreto.

## Recuperación de commit incierto

`RecoverUncertainCommitAsync` vuelve a tomar lock, lee State, History y metadata física, y decide si el commit realmente ocurrió. Si State + History + validación física confirman la transición, cierra el Attempt como `COMMIT_RECOVERED` y no reejecuta DDL. Si falta alguna evidencia, devuelve `REQUIERE_REVISION` y no aplica cambios.

## QA automatizada

Se agregaron pruebas T17 en `SchemaMigrationEngineTests` con fixtures controlados. Cubren:

- resolución 1 -> 2;
- resolución 1 -> 2 -> 3 -> 4;
- huecos;
- ramas;
- ciclos;
- FromVersion incompatible;
- baseline incompatible;
- SqlHash alterado;
- MigrationId ya aplicado;
- reejecución sin History duplicado;
- error antes del DDL;
- error durante DDL;
- error durante validación post-DDL;
- recuperación de commit incierto;
- lock ocupado;
- dos ejecutores simultáneos;
- SQL con `GO` rechazado;
- SQL fuera del paquete aprobado;
- target superior al release;
- versión futura;
- manifest alterado;
- contract hash alterado;
- history alterado;
- migración de fixture con State/History/hash correctos;
- 10 reejecuciones con una sola aplicación efectiva;
- paquete real ProductosServicios sin V2 inventada;
- scope Empty requiere bootstrap T16 y no migración.

Resultado:

```text
dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal
Correctas! - Con error: 0, Superado: 136, Omitido: 0, Total: 136
```

## QA SQL real

No se ejecutó una migración real V1 -> V2 en CheckAppErp porque T17 prohíbe inventar una V2 funcional de ProductosServicios. Se ejecutó verificación read-only contra la base certificada por T16:

```text
SANITIZED_IDENTITY=VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA
CURRENT_VERSION=1
LATEST_RELEASE_VERSION=1
PACKAGE_MIGRATIONS=0
RESOLUTION_STATUS=NoPendingMigrations
RESOLUTION_REASON=NO_PENDING_MIGRATIONS
MIGRATED_HISTORY=0
```

No se creó base temporal SQL adicional para fixtures de integración porque no había una autorización explícita nueva para DDL fuera de CheckAppErp en esta iteración. Las pruebas de transición, rollback, concurrencia, inmutabilidad y recuperación se ejecutaron con fixtures controlados del motor, sin tocar datos productivos.

## Builds

```text
dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal
Compilación correcta. 0 errores.

dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal
Compilación correcta. 0 errores.
```

## Regresión funcional

T17 no toca Login/Auth, Firebase, Hosting, Conexiones, UI ni CRUD funcional. La ruta `/ProductosServicios/Index` se verificó bajo el contexto local preexistente y sigue redirigiendo a Login sin sesión. Los puertos 5200 y 5127 estaban ocupados por procesos preexistentes y fueron respetados.

## Limitaciones

No existe una transición real de negocio V1 -> V2 en T17. El provider real deja ProductosServicios en V1 sin migraciones pendientes. La primera migración funcional deberá venir en el ticket aprobado correspondiente con contrato destino, `migration.json`, `up.sql` y hash inmutable.

## Pendientes T18+

Quedan fuera de T17: reparación automática de `Partial`, drift validator general, gates globales de compatibilidad, migraciones de otros módulos, backfills de negocio, DOWN destructivo y administración operativa completa de paquetes.
