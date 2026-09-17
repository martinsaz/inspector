# TICKET 18 — Validador físico y detección de drift ProductosServicios

Fecha: 2026-09-11  
Scope: `ProductosServicios`  
Resultado: **CERTIFICADO EN SQL SERVER REAL** con drift físico controlado y restauración exacta en CheckAppErp.

## Dictamen

T18 incorporó el validador físico read-only para comparar la versión declarada por `DatabaseIdentity + Scope` contra la estructura real de SQL Server. El motor detecta diferencias aunque `CheckAppSchemaState.CurrentVersion` diga `1`, clasifica severidad y no repara.

La certificación real sana en QA `CheckAppErp` sí quedó en PASS: la base declara versión 1, conserva el hash T15 V1, la estructura física coincide con el contrato y el resultado global fue `SchemaOk` con `DriftCount=0`.

La certificación de drift físico real queda pendiente porque no hay una base SQL Server temporal/destructible disponible en el ambiente local: no existe `sqlcmd`, no existe Docker y no hay instancia local SQL Server para crear una base de prueba. Por restricción contractual, no se alteró `CheckAppErp`, la base histórica 163, Firebase, datos de negocio ni schema funcional para fabricar drift.

Frase obligatoria de estado:

**TICKET 18 CERTIFICADO EN SQL SERVER REAL — CHECKAPPERP V1 SANA VALIDADA — DRIFT FÍSICO REAL PROVOCADO Y DETECTADO — T18 IDENTIFICÓ INDEX_MISSING SIN REPARACIÓN AUTOMÁTICA — ESTRUCTURA RESTAURADA EXACTAMENTE A V1 — SCHEMA_OK FINAL CONFIRMADO — SIN IMPACTO A DATOS, FIREBASE, TENANTS NI BASE HISTÓRICA — LISTO PARA CIERRE DEL PRODUCT OWNER.**


## Certificación SQL real de drift — CheckAppErp, 2026-09-14

Autorización PO recibida en `/Users/denissemendiola/Desktop/T18_CERTIFICACION_REAL_DRIFT_CHECKAPPERP_MOKA.txt`: provocar temporalmente un drift estructural controlado y reversible exclusivamente en QA `CheckAppErp`, con restauración obligatoria.

### Preflight BEFORE

- `DB_NAME = CheckAppErp`
- `SANITIZED_IDENTITY = VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`
- Base histórica 163 tocada: NO
- `CurrentVersion = 1`
- Hash T15 V1 coincide: PASS
- `GlobalResult = SchemaOk`
- `DriftCount = 0`
- Conteos: 20 tablas / 255 columnas / 50 índices / 24 FK / 14 CHECK
- `ChangedState = False`
- `ExecutedDdl = False`

### Fixture seleccionado

Índice contractual seguro y reversible:

- Índice: `IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento`
- Tabla: `dbo.ProductosServiciosMovimientosInventario`
- No PK: PASS
- No UNIQUE: PASS
- No requerido por FK: PASS
- Restauración preparada antes del DROP: PASS

Definición contractual de restauración, derivada de T15 V1 antes del DROP:

```sql
CREATE NONCLUSTERED INDEX [IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento]
ON [dbo].[ProductosServiciosMovimientosInventario] ([idEmpresa] ASC, [FechaMovimiento] ASC);
```

DDL temporal ejecutado:

```sql
DROP INDEX [IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento]
ON [dbo].[ProductosServiciosMovimientosInventario];
```

No se ejecutó otro DDL destructivo. No se ejecutó DML de negocio.

### DRIFT detectado

Después del DROP:

- `CurrentVersion = 1`
- Hash T15 V1 coincide: PASS
- Índice presente: NO
- `GlobalResult = SchemaDrift`
- `DriftCount = 1`
- Conteos durante drift: 20 tablas / 255 columnas / 49 índices / 24 FK / 14 CHECK
- `INDEX_MISSING = True`
- `ObjectName = dbo.ProductosServiciosMovimientosInventario.IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento`
- `Expected = IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento`
- `Actual = <ABSENT>`
- `ChangedState = False`
- `ExecutedDdl = False`
- T18 intentó reparar: NO
- El índice siguió ausente después del validador: PASS

Esto certifica que T18 detecta drift físico real sin reparación automática.

### Restauración

DDL de restauración ejecutado inmediatamente después de obtener evidencia:

```sql
CREATE NONCLUSTERED INDEX [IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento]
ON [dbo].[ProductosServiciosMovimientosInventario] ([idEmpresa] ASC, [FechaMovimiento] ASC);
```

- `CREATE INDEX` restauración: PASS
- Definición coincide T15: PASS
- Índice presente nuevamente: PASS

### AFTER final

Después de restaurar:

- `DB_NAME = CheckAppErp`
- `CurrentVersion = 1`
- Hash T15 V1 coincide: PASS
- `GlobalResult = SchemaOk`
- `DriftCount = 0`
- Tablas: 20
- Columnas: 255
- Índices: 50
- FK: 24
- CHECK: 14
- PK/UNIQUE: PASS por `SchemaOk`
- INCLUDE/filtros: PASS por `SchemaOk`
- `ChangedState = False`
- `ExecutedDdl = False`

### Control y seguridad

- V2 creada: NO
- T17 ejecutado: NO
- `History MIGRATED`: NO
- Firebase modificado: NO
- Hosting modificado: NO
- Conexiones modificado: NO
- Login/Auth modificado: NO
- UI/CRUD modificado: NO
- Base histórica 163 tocada: NO
- DDL fuera de `CheckAppErp`: NO
- Secretos persistidos/documentados: NO

### Dictamen certificado

**TICKET 18 CERTIFICADO EN SQL SERVER REAL — CHECKAPPERP V1 SANA VALIDADA — DRIFT FÍSICO REAL PROVOCADO Y DETECTADO — T18 IDENTIFICÓ INDEX_MISSING SIN REPARACIÓN AUTOMÁTICA — ESTRUCTURA RESTAURADA EXACTAMENTE A V1 — SCHEMA_OK FINAL CONFIRMADO — SIN IMPACTO A DATOS, FIREBASE, TENANTS NI BASE HISTÓRICA — LISTO PARA CIERRE DEL PRODUCT OWNER.**

## Alcance implementado

El API ahora expone un validador físico reusable para T17 y fases posteriores:

- `ISchemaPhysicalSnapshotReader` lee metadata real de SQL Server sin datos de negocio.
- `SqlSchemaPhysicalSnapshotReader` toma snapshot determinista de tablas, columnas, PK, índices, FK, CHECK y objetos extra relacionados con `ProductosServicios`.
- `ISchemaDriftValidator` valida por `DatabaseIdentity + Scope + ContractVersion` y por conexión/transacción abierta.
- `SchemaDriftValidator` compara el contrato inmutable T15 contra la estructura física real y produce `SchemaDriftReport`.
- `SchemaMigrationSqlExecutor` consume el validador T18 en post-validación con la misma conexión/transacción cuando está disponible.

Archivos principales:

- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaDriftModels.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SqlSchemaPhysicalSnapshotReader.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaDriftValidator.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaDefinitionNormalizer.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaMigrationSqlExecutor.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Program.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/Services/Tenant/SchemaDriftValidatorTests.cs`

## Addendum 2026-09-16 — validación V2

T18 reconoce ahora V1 histórico y V2 vigente. Para V2, `ProductosServiciosCategorias.Descripcion`, `ProductosServiciosMarcas.Descripcion` y `ProductosServiciosColecciones.Descripcion` deben reportar `nvarchar(max)` (`max_length=-1`) y nullable.

Base 163 después de T17 V1 -> V2: `SchemaOk`, `DriftCount=0`, 20 tablas, 255 columnas, 50 índices, 24 FK y 14 CHECK.

## Contrato base preservado

T18 usa exclusivamente el contrato T15 V1 para `ProductosServicios`:

- `ContractVersion = 1`
- Hash canónico: `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`
- 20 tablas
- 255 columnas
- 50 índices adicionales a PK
- 24 FK
- 14 CHECK

No se modificó el contrato V1 para coincidir con una base. No se inventó V2. No se alteró `LatestSchemaVersion=1` ni `PACKAGE_MIGRATIONS=0`.

## Snapshot físico

El snapshot read-only consulta metadata de SQL Server:

- `sys.schemas`, `sys.objects`, `sys.tables`
- `sys.columns`, `sys.types`, `sys.identity_columns`, `sys.computed_columns`, `sys.default_constraints`
- `sys.key_constraints`, `sys.indexes`, `sys.index_columns`
- `sys.foreign_keys`, `sys.foreign_key_columns`
- `sys.check_constraints`

El snapshot registra nombres saneados, tipos, longitudes, precisión, escala, nulabilidad, collation observado, identity, computed, defaults, PK, índices, filtros, includes, FK, acciones referenciales, estados trusted/disabled y objetos extra con prefijo `ProductosServicios`.

Limitación consciente para preservar T15 V1: `collation`, `identity seed` e `identity increment` se capturan en snapshot, pero no generan drift contractual porque el modelo T15 V1 no define esos campos esperados. Hacerlos estrictos requiere una evolución posterior del contrato y cambiaría el alcance de T15.

## Clasificación de drift

Cada diferencia reporta:

- `DatabaseIdentity` saneada
- `Scope`
- `DeclaredVersion`
- `ExpectedManifestHash`
- tipo y nombre de objeto
- `DifferenceType`
- valor esperado y valor actual
- severidad
- `AutoRepairableFuture`
- `ReasonCode`

Severidades implementadas:

- `Info`
- `Warning`
- `Error`
- `Critical`

Resultados globales:

- `SchemaOk`
- `SchemaDrift`
- `SchemaDriftCritico`
- `ValidacionNoConcluyente`
- `VersionIncompatible`
- `RequiereRevision`

Ejemplos cubiertos por tests: tabla faltante, columna extra, índice faltante, índice deshabilitado, FK insegura multitenant, CHECK distinto, hash de manifiesto distinto, versión sin contrato y metadata insuficiente.

## Integración con T13, T14 y T17

T18 no reemplaza T13 ni T14. Aporta evidencia física profunda para que `State V1` no se trate como sano si la estructura real diverge.

T17 conserva el motor secuencial y, cuando existe `ISchemaDriftValidator`, post-valida releyendo metadata real con la misma `SqlConnection` y `SqlTransaction`. No reutiliza snapshot previo para declarar éxito.

T18 no implementa gate CRUD de T20, no migra, no repara, no escribe `State`, no escribe `History`, no escribe `Attempts` y no modifica hash.

## QA automatizado

Pruebas ejecutadas sobre la solución API:

- Total: 183
- Fallidas: 0
- Omitidas: 0

T18 agrega 47 pruebas enfocadas en drift físico lógico y clasificación. Las pruebas demuestran detección controlada de drift en fixtures automatizados, incluyendo casos críticos multitenant y fail-closed por hash o versión incompatible.

## QA real read-only — CheckAppErp

Validación real ejecutada contra QA `CheckAppErp` en modo solo lectura. Evidencia saneada:

- `DB_NAME = CheckAppErp`
- `SANITIZED_IDENTITY = VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`
- `DECLARED_VERSION = 1`
- `EXPECTED_HASH = 4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`
- `PERSISTED_HASH = 4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`
- `GLOBAL_RESULT = SchemaOk`
- `DRIFT_COUNT = 0`
- `TABLES = 20`
- `COLUMNS = 255`
- `INDEXES = 50`
- `FKS = 24`
- `CHECKS = 14`
- `CHANGED_STATE = False`
- `EXECUTED_DDL = False`

Conclusión: `CheckAppErp` certifica V1 físico sano para `ProductosServicios`.

## QA drift físico controlado

Estado: pendiente de certificación real.

Se verificó que no hay herramienta o instancia local desechable para crear una base SQL temporal y provocar drift sin riesgo:

- `sqlcmd`: no disponible
- Docker: no disponible
- proceso local SQL Server: no disponible

Por las restricciones del ticket, no se fabricó drift sobre `CheckAppErp`, no se tocó la base histórica 163 y no se ejecutó DDL/DML de negocio. La demostración disponible hoy es por fixtures automatizados de tests, no por una base SQL física real alterada a propósito.

## Seguridad y no mutación

T18 no persistió cadenas de conexión ni credenciales. El documento y los archivos del repo contienen sólo identidad saneada y hash contractual. La validación real reportó `ChangedState=False` y `ExecutedDdl=False`.

No se modificó Firebase, Hosting, Login/Auth, roles, permisos, UI/CRUD `ProductosServicios`, datos de negocio ni la base histórica 163.

## Pendiente previo resuelto

El pendiente de drift físico real quedó resuelto el 2026-09-14 con autorización PO sobre CheckAppErp. Históricamente, antes de esta certificación faltaba una de estas opciones:

1. Proveer una base SQL Server temporal/destructible donde se pueda crear V1, provocar drift físico y validar `SCHEMA_DRIFT` / `SCHEMA_DRIFT_CRITICO` sin riesgo.
2. Proveer una base QA ya destinada a drift controlado con autorización explícita para DDL reversible.
3. Agregar al pipeline una fixture SQL Server real efímera.

La evidencia ya fue completada en CheckAppErp y la base quedó nuevamente en `SchemaOk` con `DriftCount=0`.
