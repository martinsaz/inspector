# TICKET 16 — Bootstrap autosuficiente de base nueva ProductosServicios

Fecha: 2026-09-10  
Estado: IMPLEMENTADO  
Scope: `ProductosServicios`  
Precondición operativa: T13 debe clasificar el scope como `Empty`.

## Dictamen

Se implementó el bootstrap estructural autosuficiente para `ProductosServicios` V1. La operación explícita `ProvisionScopeAsync` sólo avanza cuando la base autorizada tiene `DatabaseIdentity` válida y T13 clasifica el scope como `Empty`. `Partial`, `Current`, `Outdated`, `Future`, `Unknown` y `Unavailable` cierran sin provisionar.

El bootstrap usa el contrato T15 como fuente de verdad, genera DDL desde ese contrato, crea el schema dentro de transacción cuando SQL Server lo permite, valida físicamente contra el contrato antes de confirmar y registra T14 con `Attempt`, `History = PROVISIONED` y `State CurrentVersion = 1` sólo en `PASS`.

No se modificó Firebase/Auth/Hosting/Conexiones, Login, UI de ProductosServicios, CRUD, datos de negocio ni bases históricas.

## Arquitectura implementada

Archivos API:

- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/ProductosServiciosSchemaBootstrapModels.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/ProductosServiciosSchemaBootstrapper.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaProvisionSqlGenerator.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaProvisionExecutor.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaContractPhysicalValidator.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SqlSchemaProvisionLock.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Program.cs`

Pruebas:

- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/Services/Tenant/ProductosServiciosSchemaBootstrapperTests.cs`

## Flujo de `ProvisionScopeAsync`

1. Recibe conexión autorizada, `DatabaseIdentity` y scope.
2. Clasifica con T13.
3. Si el scope no es `Empty`, devuelve `NoProvision` con reason code específico.
4. Asegura infraestructura T14 mediante `EnsureSchemaControlInfrastructureAsync`.
5. Obtiene contrato T15 V1 y manifiesto canónico.
6. Crea `Attempt` T14 tipo `PROVISION`.
7. Toma lock mínimo por `DatabaseIdentity + Scope` con `sp_getapplock`.
8. Re-clasifica dentro del lock para evitar doble provisión concurrente.
9. Ejecuta DDL derivado del contrato.
10. Valida físicamente tablas, columnas, tipos, longitud, precisión/escala, nullability, defaults, computed, PK, FK, UNIQUE/índices, filtros y CHECK.
11. Si valida, confirma `State CurrentVersion = 1` con `ManifestHash` T15.
12. Registra `History EventType = PROVISIONED`.
13. Completa `Attempt PASS`.

Si falla el DDL o la validación, la transacción se revierte cuando SQL Server lo permite, se completa `Attempt FAIL`, no se registra `History PROVISIONED PASS` y no se confirma `State V1`.

## Contrato T15 usado

- Scope: `ProductosServicios`
- ContractVersion: `1`
- ManifestHash: `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`
- Tablas: `20`
- Columnas: `255`
- Índices adicionales a PK: `50`
- FK: `24`
- CHECK: `14`

El DDL se genera desde `SchemaContract`; no se ejecutan scripts históricos Ticket 08/09/10 como migración ficticia.

## Orden de creación

El plan es determinista:

1. Crear tablas con columnas, defaults, computed y PK.
2. Crear CHECK.
3. Crear índices y reglas únicas representadas como índices únicos del contrato.
4. Crear FK al final, preservando relaciones compuestas con `idEmpresa`.

Como las FK se agregan después de todas las tablas y de los índices únicos `(idEmpresa, id)`, no depende de un orden accidental del manifiesto.

## Multitenant

Todas las tablas contractuales tienen `idEmpresa UNIQUEIDENTIFIER NOT NULL`. Las FK preservan el patrón compuesto `(idEmpresa, idX) → (idEmpresa, id)` y los índices únicos preservan `idEmpresa` como primera columna cuando aplica. El lock usa `DatabaseIdentity + Scope`, no `idEmpresa`, para evitar doble DDL en bases compartidas por varias empresas.

## Idempotencia y concurrencia

La segunda ejecución no recrea objetos porque T13 ya no debe reportar `Empty`; devuelve `ALREADY_PROVISIONED` o reason code equivalente de no provisionamiento. La concurrencia se controla con lock por `DatabaseIdentity + Scope` y re-clasificación dentro del lock; las pruebas validan una sola provisión efectiva.

## QA automatizada

Se agregaron 30 pruebas T16. Cobertura:

- `Empty → Provisioned V1 PASS`;
- conteos 20/255/50/24/14;
- DDL preserva tipos, longitud, precisión/escala, nullability, defaults, computed, FK multitenant, UNIQUE, CHECK y filtro;
- hash final coincide T15;
- State V1 sólo después de ejecutar/validar;
- History `PROVISIONED` sólo en PASS;
- Attempt PASS/FAIL;
- fallo de ejecución/validación no confirma State ni History PASS;
- segunda ejecución no duplica objetos;
- `Partial`, `Current`, `Outdated`, `Future`, `Unknown`, `Unavailable` rechazados;
- concurrencia: una sola provisión efectiva;
- dos empresas misma DB: una provisión;
- bases distintas: provisiones independientes;
- sin seeds de negocio;
- sin secretos;
- residuo parcial detectado como `Partial` en la siguiente ejecución;
- T11–T15 preservados por uso de clasificador, repositorio, contrato y manifest.

Resultado específico T16:

```text
Correctas! - Con error: 0, Superado: 30, Omitido: 0, Total: 30
```

## Certificación SQL real — CheckAppErp

El 2026-09-10 se ejecutó certificación real controlada en SQL Server sobre la base QA autorizada `CheckAppErp`. La credencial se usó sólo en runner temporal fuera del repositorio y no fue escrita en código, documentación, `appsettings`, AGENTS, CLAUDE ni tests. Antes de cualquier DDL se confirmó `DB_NAME() = CheckAppErp`, `0` tablas de `ProductosServicios`, `0` tablas no-control, ausencia de datos productivos y que la identidad no correspondía a la base histórica 163.

Evidencia saneada inicial:

```text
DB_NAME_PASS=PASS
DB_NAME_VALUE=CheckAppErp
PS_TABLES_BEFORE=0
NON_CONTROL_TABLES_BEFORE=0
PRODUCTIVE_DATA_ABSENT=PASS
SANITIZED_IDENTITY=VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA
NOT_HISTORICAL_163=PASS
INITIAL_T13_STATE=Empty
INITIAL_T13_REASON=NO_SCOPE_TABLES_FOUND
INITIAL_T13_COUNTS=0/20
```

T14 fue ejecutado dos veces mediante `EnsureSchemaControlInfrastructureAsync`; la primera ejecución creó/verificó la infraestructura de control y la segunda no creó objetos adicionales. No existía History ficticio `MIGRATED` ni `ADOPTED` antes del bootstrap.

Bootstrap real T16:

```text
CONTRACT_VERSION=1
MANIFEST_HASH=4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06
CONTRACT_COUNTS=20/255/50/24/14
CONTRACT_INCLUDE_COLUMNS=0
CONTRACT_FILTERED_INDEXES=2
CONTRACT_IDEMPRESA_COLUMNS=20
FIRST_STATUS=Provisioned
FIRST_REASON=PROVISIONED
FINAL_COUNTS=20/255/50/24/14
FINAL_PK_UNIQUE=20/31
VALIDATION_DETECTED=20/255/50/24/14
VALIDATION_DISCREPANCY_COUNT=0
VALIDATION_PASS=PASS
```

Versionamiento persistido:

```text
STATE_VERSION=1
STATE_HASH=4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06
STATE_HASH_MATCH=PASS
HISTORY_EVENT=PROVISIONED
HISTORY_RESULT=PASS
HISTORY_FROM=NULL
HISTORY_TO=1
ATTEMPT_RESULT=PASS
PROVISIONED_HISTORY_TOTAL=1
PROVISIONED_HISTORY_PASS_TOTAL=1
MIGRATED_ADOPTED_TOTAL=0
```

Segunda ejecución real:

```text
SECOND_PRE_T13_STATE=Current
SECOND_PRE_T13_REASON=VERSION_EVIDENCE_CURRENT
SECOND_STATUS=NoProvision
SECOND_REASON=ALREADY_PROVISIONED
SECOND_COUNTS=20/255/50/24/14
REPROVISION_EXECUTED=NO
DUPLICATE_OBJECTS=0
SECOND_PROVISIONED_DELTA=0
STATE_STILL_V1=PASS
HASH_STILL_EQUAL=PASS
IDEMPOTENCE_PASS=PASS
```

Durante la certificación se detectó un defecto en el validador físico: SQL Server devuelve defaults y filtros normalizados con paréntesis sintácticos adicionales en metadata, lo que producía tres falsos negativos de validación aunque el DDL hubiera sido generado desde contrato. Se corrigió únicamente la normalización de definiciones en `SchemaContractPhysicalValidator`; la primera ejecución fallida quedó en rollback sin tablas `ProductosServicios`, sin State V1 y sin History PASS. Después del ajuste, la certificación real terminó con discrepancy_count `0`.

Resultado de pruebas tras la corrección:

```text
dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal
Correctas! - Con error: 0, Superado: 109, Omitido: 0, Total: 109

dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal
Compilación correcta. 0 errores.

dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal
Compilación correcta. 0 errores.
```

No se modificó Firebase, Hosting, Conexiones, Login/Auth, tenants reales, tenant 163, UI/CRUD ni datos de negocio.

## QA read-only base histórica 163

Se ejecutó una prueba real segura sobre 163. La operación T16 fue invocada contra servicios reales, pero T13 clasificó la base como no `Empty`, por lo que el bootstrapper regresó antes de `Ensure`, `Attempt`, DDL, History o State.

Resultado sanitizado:

```text
identity=SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5
classification_state=Unknown
classification_reason=VERSION_EVIDENCE_MISSING
classification_tables=20/20
bootstrap_status=NoProvision
bootstrap_reason=PROVISION_NOT_ALLOWED_UNKNOWN
state_rows_before=0
state_rows_after=0
provisioned_history_before=0
provisioned_history_after=0
provision_attempts_before=0
provision_attempts_after=0
```

## Seguridad

El bootstrapper no loguea ni devuelve connection strings, passwords, tokens, secretos Firebase ni usuarios SQL. Los errores de attempts se sanean antes de persistir o devolverlos.

## Pendientes T17+

Quedan fuera de T16: migraciones secuenciales de bases históricas, reparación de `Partial`, validador de drift general, locking/transacciones del motor completo, gate funcional de compatibilidad y administración operativa de runners.
