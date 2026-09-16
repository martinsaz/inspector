# MOKA — Ticket 12: DatabaseIdentity + agrupación de bases físicas

Fecha: 2026-09-10. Proyecto: CheckApp / Inspecciones. Vertical inicial: Productos y Servicios.

## Resultado

Ticket 12 implementa la capa mínima aprobada para contestar dos preguntas después de la resolución tenant→SQL de Ticket 11:

1. Qué base física representa realmente una conexión autorizada.
2. Qué empresas/tenants activos resuelven a esa misma base física.

La implementación no versiona schema, no clasifica estado, no crea baseline, no crea tablas de control y no ejecuta migraciones. `CheckAppSchemaState`, `CheckAppSchemaHistory` y `CheckAppSchemaAttempts` siguen fuera de alcance para tickets posteriores.

## Componentes implementados

### API

- `DatabaseIdentity`: value object inmutable, normalizado, comparable, con `GetHashCode` coherente, fingerprint determinístico y representación saneada.
- `DatabaseMetadata`: resultado interno de lectura de metadata SQL.
- `DatabaseGroup`: agrupa una `DatabaseIdentity` con sus `TenantDescriptor` asociados.
- `DatabaseGroupingResult` y `DatabaseGroupingError`: devuelven grupos correctos y errores individuales sin bloquear tenants independientes.
- `IDatabaseMetadataReader` / `SqlDatabaseMetadataReader`: abre la conexión autorizada por T11 y ejecuta sólo SELECT de metadata.
- `IDatabaseIdentityResolver` / `DatabaseIdentityResolver`: normaliza, valida metadata mínima y construye `DatabaseIdentity`.
- `ITenantCatalogReader`: enumera `Conexiones` desde Firebase en modo lectura.
- `IDatabaseGroupingService` / `DatabaseGroupingService`: filtra `Status == 1`, resuelve configuración T11, resuelve identidad física y agrupa por identidad.

### DI

Los servicios nuevos se registraron con lifetime `Scoped` en `Program.cs`, evitando singletons con estado tenant mutable. No se implementó cache en T12; se priorizó correctitud y aislamiento.

## DatabaseIdentity

La identidad se construye con metadata no secreta obtenida desde una conexión SQL abierta:

- `SERVERPROPERTY('ServerName')`
- `SERVERPROPERTY('ComputerNamePhysicalNetBIOS')`
- `SERVERPROPERTY('InstanceName')`
- `DB_NAME()`
- `DB_ID()` como validación de base actual
- `sys.database_recovery_status.database_guid`

La combinación evita depender sólo de nombre de base, sólo de `database_guid` o sólo de ConnectionString. Dos cadenas distintas pueden producir la misma identidad si la metadata real coincide. Dos servidores distintos con el mismo nombre de catálogo producen identidades distintas. El fingerprint se deriva sólo de esa metadata saneada.

No se guarda ni se imprime ConnectionString completa, password, token, secreto Firebase ni usuario SQL.

## Errores cerrados

- SQL no disponible o conexión no abrible: `DatabaseIdentityUnavailable`.
- Metadata mínima ausente o inválida: `DatabaseIdentityUnverifiable`.
- Metadata contradictoria/ambigua: `DatabaseIdentityAmbiguous`.

Cuando una empresa falla por configuración tenant o identidad de base, `DatabaseGroupingService` agrega un error individual y continúa con las demás empresas resolubles.

## Alcance respetado

No hubo cambios en UI de ProductosServicios, CRUD, precios, inventario, atributos, variantes, presentaciones, multimedia, ficha técnica, PDF, Login/Auth, roles, permisos, Hosting, Firebase ni schema SQL. Sólo se agregaron servicios backend, modelos de identidad/agrupación, pruebas y documentación. Ticket 11 no se reabrió; se reutilizó su resolución autorizada.

## QA Codex

### Automatizada

`dotnet test inspectorapi/checklistWs.sln --verbosity minimal`: PASS, 25/25 pruebas.

Las 15 pruebas nuevas cubren:

1. igualdad de `DatabaseIdentity`;
2. desigualdad de `DatabaseIdentity`;
3. tenants distintos en la misma base;
4. bases distintas con mismo nombre de catálogo;
5. ConnectionStrings distintas con misma identidad real simulada;
6. `database_guid` igual en servidor distinto;
7. tenant con configuración inválida;
8. SQL no disponible;
9. metadata no verificable;
10. identidad ambigua;
11. agrupación A/B misma DB;
12. C en otra DB;
13. error de B no bloquea A/C;
14. concurrencia sin estado global mutable;
15. representación saneada sin secretos.

### Real read-only

Se ejecutó runner temporal fuera del repo para empresa autorizada `163`, usando servicios API y sólo lectura:

- lectura Firebase `Conexiones/163`: tenant encontrado, activo, idEmpresa válido;
- resolución T11: PASS;
- SELECT de metadata SQL para `DatabaseIdentity`: PASS;
- salida expuesta: sólo identidad saneada y fingerprint.

Identidad saneada obtenida: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.

No se imprimió ConnectionString, password, token, secreto Firebase ni usuario SQL.

### Builds

- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: PASS.
- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`: PASS.

Warnings legacy de paquetes/nulabilidad permanecen documentados y no se corrigen en T12.

## Archivos principales

- API: `checklistWs/Services/Tenant/DatabaseIdentityModels.cs`
- API: `checklistWs/Services/Tenant/DatabaseIdentityResolver.cs`
- API: `checklistWs/Services/Tenant/SqlDatabaseMetadataReader.cs`
- API: `checklistWs/Services/Tenant/DatabaseGroupingService.cs`
- API: `checklistWs/Services/Tenant/FirebaseTenantConnectionReader.cs`
- API: `checklistWs/Services/Tenant/TenantDatabaseResolution.cs`
- API: `checklistWs/Program.cs`
- Tests: `checklistWs.Tests/Services/Tenant/DatabaseIdentityAndGroupingTests.cs`

## Estado

TICKET 12 IMPLEMENTADO — DATABASEIDENTITY Y AGRUPACIÓN DE BASES FÍSICAS LISTAS PARA QA MANUAL DEL PRODUCT OWNER. T13+ permanece pendiente y no implementado.
