# MOKA — Ticket 13: clasificador de estado de base por DatabaseIdentity + Scope

Fecha: 2026-09-10. Proyecto: CheckApp / Inspecciones. Vertical inicial: Productos y Servicios.

## Resultado

Ticket 13 implementa un clasificador read-only para responder qué estado estructural puede demostrarse para una combinación `DatabaseIdentity + Scope`. El scope inicial implementado es `ProductosServicios`.

Estados implementados:

- `Empty`
- `Partial`
- `Current`
- `Outdated`
- `Future`
- `Unknown`

El error operativo `UNAVAILABLE` se reporta separado mediante `IsAvailable = false`, `State = Unknown` y `ReasonCode = UNAVAILABLE`; no se convierte en `Empty`.

## Arquitectura

El flujo queda separado en responsabilidades:

1. T11 resuelve tenant y conexión SQL autorizada.
2. T12 resuelve `DatabaseIdentity` desde metadata real del destino SQL.
3. T13 recibe `DatabaseIdentity + Scope` y ejecuta `DatabaseSchemaProbe` read-only.
4. `DatabaseStateClassifier` clasifica con la evidencia disponible.
5. La evidencia de versión se consume por `IDatabaseVersionEvidenceReader`, hoy implementado como `NullDatabaseVersionEvidenceReader` para no adelantar T14/T15.

La lógica no se colocó dentro de `ProductosServiciosController`.

## Inventario del scope ProductosServicios

T13 usa las 20 tablas auditadas como señal de existencia del scope, no como contrato estructural definitivo:

1. `dbo.ProductosServicios`
2. `dbo.ProductosServiciosCategorias`
3. `dbo.ProductosServiciosMarcas`
4. `dbo.ProductosServiciosColecciones`
5. `dbo.ProductosServiciosUnidadesMedida`
6. `dbo.ProductosServiciosPaquetes`
7. `dbo.ProductosServiciosTags`
8. `dbo.ProductosServiciosProductoTags`
9. `dbo.ProductosServiciosAtributos`
10. `dbo.ProductosServiciosAtributosValores`
11. `dbo.ProductosServiciosProductoAtributos`
12. `dbo.ProductosServiciosProductoAtributoValores`
13. `dbo.ProductosServiciosOpcionesVariante`
14. `dbo.ProductosServiciosOpcionesVarianteValores`
15. `dbo.ProductosServiciosVariantes`
16. `dbo.ProductosServiciosVarianteValores`
17. `dbo.ProductosServiciosMultimedia`
18. `dbo.ProductosServiciosExistencias`
19. `dbo.ProductosServiciosMovimientosInventario`
20. `dbo.ProductosServiciosPresentacionesVenta`

## Reglas de clasificación

- `Empty`: base disponible con 0 tablas del scope, aunque existan tablas generales de CheckApp.
- `Partial`: existe al menos una tabla del scope, pero faltan tablas o no hay evidencia formal suficiente para una versión conocida.
- `Current`: sólo con evidencia formal de versión vigente simulada o futura de T14/T15.
- `Outdated`: sólo con evidencia formal de versión anterior conocida.
- `Future`: sólo con evidencia formal de versión superior conocida.
- `Unknown`: metadata insuficiente, scope no verificable o 20/20 tablas sin evidencia formal de versión.
- `UNAVAILABLE`: error operativo de consulta; no es estado estructural.

T13 no inventa `Current` aunque existan 20/20 tablas, porque aún no existe State/History/Attempts ni contrato T15 persistente.

## Seguridad y read-only

`SqlDatabaseSchemaProbe` consulta únicamente metadata mediante `sys.tables` y `sys.schemas`. No consulta datos de negocio y no usa excepciones como algoritmo de clasificación. No ejecuta `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `INSERT`, `UPDATE`, `DELETE` ni `MERGE`.

No se exponen ConnectionString, password, token, secreto Firebase ni usuario SQL. La salida permitida contiene identidad saneada, scope, estado, conteos, nombres técnicos de tablas, reason code y warnings.

## Componentes

- API: `checklistWs/Services/Tenant/DatabaseClassificationModels.cs`
- API: `checklistWs/Services/Tenant/ProductScopeInventory.cs`
- API: `checklistWs/Services/Tenant/SqlDatabaseSchemaProbe.cs`
- API: `checklistWs/Services/Tenant/DatabaseStateClassifier.cs`
- API: `checklistWs/Services/Tenant/NullDatabaseVersionEvidenceReader.cs`
- API: `checklistWs/Program.cs`
- Tests: `checklistWs.Tests/Services/Tenant/DatabaseStateClassifierTests.cs`

Servicios registrados como `Scoped`, sin cache y sin estado global mutable.

## QA automatizada

`dotnet test inspectorapi/checklistWs.sln --verbosity minimal`: PASS, 40/40 pruebas.

Las 15 pruebas nuevas cubren:

1. tablas generales / 0 tablas scope → `Empty`;
2. 0 tablas scope → `Empty`;
3. 1/20 tablas → `Partial`;
4. 8/20 tablas → `Partial`;
5. 19/20 tablas → `Partial`;
6. 20/20 sin evidencia formal → no inventa `Current`, clasifica `Unknown`;
7. SQL unavailable → `UNAVAILABLE`, nunca `Empty`;
8. metadata insuficiente → `Unknown`;
9. `DatabaseIdentity` inválida → error controlado `Unknown`;
10. evidencia simulada anterior → `Outdated`;
11. evidencia simulada vigente → `Current`;
12. evidencia simulada superior → `Future`;
13. Scope A no contamina Scope B;
14. concurrencia sin estado mutable compartido;
15. evidencia/warnings sin DDL/DML.

## QA real read-only empresa 163

Se ejecutó runner temporal fuera del repo, usando los servicios API y sólo lectura:

- T11: tenant `163` encontrado, activo, idEmpresa válido.
- T12: `DatabaseIdentity` resuelta.
- T13: scope `ProductosServicios` clasificado con metadata SQL.

Resultado real:

- `classification_available`: `True`
- `classification_scope`: `ProductosServicios`
- `classification_state`: `Unknown`
- `classification_reason`: `VERSION_EVIDENCE_MISSING`
- `scope_tables`: `20/20`

Este resultado es correcto para T13: hay 20 tablas del scope, pero no existe evidencia formal T14/T15 para declarar `Current`. No se imprimió ConnectionString, password, token, secreto Firebase ni usuario SQL.

## Regresión funcional

No hubo cambios funcionales en UI/CRUD. El servidor local preexistente respondió `GET /ProductosServicios/Index` redirigiendo a Login con HTTP 200 al no tener sesión autenticada en la llamada de consola. No se validó listado/ficha autenticados desde navegador porque no se abrió sesión ni se usaron credenciales; queda para QA manual del Product Owner. Esta limitación no bloquea T13 porque la implementación no toca flujo visible y los builds/tests pasan.

## Builds

- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`: PASS.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: PASS.
- `dotnet test inspectorapi/checklistWs.sln --verbosity minimal`: PASS, 40/40.

Warnings legacy de paquetes/nulabilidad permanecen documentados y no se corrigen en T13.

## Fuera de alcance preservado

No se creó State, History, Attempts, baseline, contrato T15, bootstrap, migraciones, locking, gate, validador físico exhaustivo ni reparador de drift. No se modificó schema, datos, Firebase, Hosting, Login/Auth, roles, permisos, UI, CRUD, precios, inventario, atributos, variantes, presentaciones, multimedia, ficha técnica ni PDF.

## Pendientes T14+

- T14: control persistente de versión y trazabilidad.
- T15: contrato versionado definitivo.
- T16: bootstrap.
- T17: migraciones.
- T18: validador físico exhaustivo/drift.
- T19: locking/transacciones.
- T20: gate CRUD.
- T21+: certificación integral idEmpresa y resto del backlog.

## Dictamen

TICKET 13 IMPLEMENTADO DENTRO DE SU ALCANCE — CLASIFICACIÓN RESPETA LA EVIDENCIA DISPONIBLE — VERSIONAMIENTO Y VALIDACIÓN EXHAUSTIVA CONTINÚAN EN T14+ — LISTO PARA QA MANUAL DEL PRODUCT OWNER.


## Actualización T14

El lector nulo de evidencia usado originalmente por T13 fue reemplazado en DI por `DatabaseVersionEvidenceReader`, que lee `CheckAppSchemaState` real por `DatabaseIdentity + Scope`. Si no existe versión confirmada, T13 conserva `Unknown` con `VERSION_EVIDENCE_MISSING`; no inventa `Current`.
