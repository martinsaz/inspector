# MOKA — Ticket 14: control de versión y trazabilidad por DatabaseIdentity + Scope

Fecha: 2026-09-10. Proyecto: CheckApp / Inspecciones. Vertical inicial: Productos y Servicios.

## Resultado

Ticket 14 implementa el control persistente de versión y trazabilidad estructural por `DatabaseIdentity + Scope`. Crea y administra únicamente las tablas internas:

- `dbo.CheckAppSchemaState`
- `dbo.CheckAppSchemaHistory`
- `dbo.CheckAppSchemaAttempts`

No crea versión histórica, no adopta base, no ejecuta migraciones de ProductosServicios, no repara drift y no modifica tablas funcionales.

## Modelo persistente

`CheckAppSchemaState` tiene una fila lógica por `DatabaseIdentityKey + Scope`, con `CurrentVersion` nullable, `BaselineId`, `BaselineVersion`, `ManifestHash`, fechas de validación/migración, resultado y timestamps. Una base compartida por varias empresas mantiene una sola fila de estado estructural para ese scope.

`CheckAppSchemaHistory` registra sólo eventos estructurales confirmados: `ADOPTED`, `PROVISIONED`, `MIGRATED`, `REPAIRED`, `VALIDATED` u otros eventos futuros controlados. Un intento fallido no genera historia exitosa.

`CheckAppSchemaAttempts` registra intentos, incluidos fallidos, con operación, versiones origen/destino, resultado, reason code y error saneado. Un attempt no significa versión aplicada.

## Infraestructura idempotente

`SchemaVersionRepository.EnsureSchemaControlInfrastructureAsync` abre la conexión SQL autorizada por T11/T12, comprueba existencia de las tres tablas internas, crea sólo las faltantes y valida columnas mínimas. Repetir la operación no duplica objetos ni borra/resetea estado. Si una tabla T14 existe con estructura incompatible, devuelve `CONTROL_SCHEMA_CONFLICT`/`Conflict` y falla cerrado sin `DROP` ni recreación destructiva.

## Repositorio

Se implementó `ISchemaVersionRepository` / `SchemaVersionRepository` con operaciones:

- `EnsureSchemaControlInfrastructureAsync`
- `GetStateAsync`
- `GetHistoryAsync`
- `GetAttemptsAsync`
- `BeginAttemptAsync`
- `CompleteAttemptAsync`
- `RecordHistoryAsync`
- `SetConfirmedStateAsync`

El SQL queda encapsulado en servicios de tenant/schema; no se agregó SQL crudo a controllers.

## Evidencia real para T13

`DatabaseVersionEvidenceReader` reemplaza la ausencia de evidencia nula y lee `CheckAppSchemaState` real para `DatabaseIdentity + Scope` mediante descriptor SQL autorizado. Si no existe State o `CurrentVersion` es null, devuelve `VERSION_EVIDENCE_MISSING`. Si existe versión confirmada, compara contra la versión conocida por la aplicación para el scope y produce `Current`, `Outdated` o `Future`.

La versión conocida inicial para `ProductosServicios` se define como entero positivo `1`, sólo como formato comparable de aplicación. Esto no adopta la base real ni crea una versión ficticia; sólo permite interpretar State cuando exista confirmación persistida por flujos futuros.

## Seguridad

La persistencia usa `DatabaseIdentity.Fingerprint` como `DatabaseIdentityKey`; no almacena ConnectionString, password, token, secreto Firebase ni usuario SQL. Los campos `Details`, `ReasonCode` y `Error` se saneean. La QA real no insertó State, Attempts ni History ficticios.

## QA automatizada

`dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`: PASS, 61/61 pruebas.

Las 21 pruebas nuevas T14 cubren infraestructura inexistente, idempotencia, State vacío, State confirmado, separación por scope, separación por DatabaseIdentity, varias empresas misma DB sin State por empresa, BeginAttempt, CompleteAttempt FAIL, FAIL no avanza State, History confirmado, History separado de Attempts, SetConfirmedState acotado a base+scope, conflicto de control, concurrencia básica, sanitización de secretos, consumo T13 de evidencia T14, T13 sin State no inventa Current, Scope A no contamina Scope B, no tocar tablas funcionales y comparación Outdated/Future.

## QA real empresa 163

Flujo ejecutado: T11 → T12 → T14 Ensure → T14 Ensure repetido → consulta State → T13 clasificación con evidencia real T14.

Resultado:

- `tenant_found`: `true`
- `tenant_active`: `true`
- `idEmpresa_valid`: `true`
- `database_identity_resolved`: `true`
- `t14_first_status`: `Ready`
- `t14_first_created_count`: `3`
- `t14_second_status`: `Ready`
- `t14_second_created_count`: `0`
- `t14_second_verified_count`: `3`
- `state_exists`: `False`
- `state_current_version`: `NULL`
- `classification_available`: `True`
- `classification_state`: `Unknown`
- `classification_reason`: `VERSION_EVIDENCE_MISSING`
- `scope_tables`: `20/20`

Objetos SQL T14 creados/verificados en la base física de QA 163:

- `dbo.CheckAppSchemaState`
- `dbo.CheckAppSchemaHistory`
- `dbo.CheckAppSchemaAttempts`

No se insertó versión ficticia. No se insertaron intentos ni historia ficticia. No se modificaron datos de negocio.

## Builds y regresión

- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`: PASS.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: PASS.
- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`: PASS, 61/61.

Warnings legacy de paquetes/nulabilidad permanecen documentados y no se corrigen en T14.

Regresión HTTP: el servidor local preexistente respondió `GET /ProductosServicios/Index` redirigiendo a Login con HTTP 200 al no tener sesión autenticada en consola. Listado/ficha autenticados quedan para QA manual del Product Owner; T14 no modificó UI/CRUD.

## Fuera de alcance preservado

No se implementó T15 contrato definitivo, T16 bootstrap, T17 migraciones, T18 validador físico/drift, T19 locking, T20 gate CRUD ni T21+. No se modificó Login/Auth, Firebase, Hosting, Conexiones, Usuario.status, Tokens, Roles, Permisos, ProductosServicios UI/CRUD, precios, inventario, atributos, variantes, presentaciones, multimedia, ficha técnica ni PDF.

## Dictamen

TICKET 14 IMPLEMENTADO — CONTROL DE VERSIÓN Y TRAZABILIDAD POR DATABASEIDENTITY + SCOPE OPERATIVO — SIN INVENTAR VERSIONES NI HISTORIA — LISTO PARA QA MANUAL DEL PRODUCT OWNER.
