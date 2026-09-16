# TICKET 15 — Contrato versionado de schema ProductosServicios V1

Fecha: 2026-09-10  
Estado: IMPLEMENTADO  
Scope: `ProductosServicios`  
ContractVersion: `1`

## Dictamen

Se definió el contrato canónico versionado del schema esperado de Productos y Servicios como fuente de verdad técnica para fases posteriores. El contrato no adopta bases históricas, no escribe `CurrentVersion`, no escribe `ManifestHash`, no genera eventos `ADOPTED`, no crea historial ficticio y no registra attempts.

La base QA 163 continúa correctamente clasificada por T13/T14 como `Unknown` con razón `VERSION_EVIDENCE_MISSING`, aunque ya exista contrato V1 en código. Esto preserva la separación entre “contrato esperado disponible” y “base física adoptada o validada”.

## Implementación

Archivos principales del API:

- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaContractModels.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/ProductosServiciosSchemaContractProvider.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Program.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/Services/Tenant/SchemaContractProviderTests.cs`

Se agregaron los modelos:

- `SchemaContract`
- `SchemaTableContract`
- `SchemaColumnContract`
- `SchemaPrimaryKeyContract`
- `SchemaForeignKeyContract`
- `SchemaUniqueContract`
- `SchemaCheckContract`
- `SchemaIndexContract`
- `SchemaManifest`
- `ISchemaContractProvider`
- `ISchemaManifestProvider`

El proveedor `ProductosServiciosSchemaContractProvider` expone únicamente `DatabaseScopes.ProductosServicios` versión `1`. El contrato incluye tablas, columnas, tipos SQL, longitudes, precisión/escala, nulabilidad, defaults normalizados, columnas computadas, PK, FK, únicos derivados de índices únicos reales, checks e índices. La columna `ProductosServiciosTags.NombreNormalizado` se representa como columna computada con definición `UPPER(LTRIM(RTRIM(Nombre)))`.

`SchemaManifestProvider` crea un manifiesto canónico determinista con orden estable de fuentes, tablas, columnas, FK, UNIQUE, CHECK e índices, y calcula SHA-256 sobre el JSON canónico. No incluye datos de negocio ni secretos.

Hash canónico V1:

```text
4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06
```

## Fuentes auditadas para el contrato

El contrato se construyó desde scripts y documentación aprobada/declarada, no desde QA 163 como fuente de verdad:

- `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql`
- `inspectorapi/checklistWs/Scripts/ticket-09-presentaciones-venta-up.sql`
- `inspectorapi/checklistWs/Scripts/ticket-10-unidades-controladas-up.sql`
- `inspectorapi/checklistWs/Scripts/ticket-10-unidades-catalogo-tiempo-up.sql`
- `inspectorapi/checklistWs/Scripts/ticket-10-unidades-tiempo-no-convertible-up.sql`
- `inspectorapi/checklistWs/Scripts/ticket-10-catalogo-metrico-us-up.sql`
- `inspector/docs/productos-servicios/auditoria-20260909/ESQUEMA_DECLARADO_NO_CERTIFICADO.md`

QA 163 se usó solo como contraste read-only del estado físico actual.

## Inventario contractual V1

- Tablas: `20`
- Columnas: `255`
- Índices adicionales a PK: `50`
- FK salientes: `24`
- CHECK: `14`

Tablas incluidas:

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

## Regla multitenant contractual

Todas las tablas del scope incluyen `idEmpresa UNIQUEIDENTIFIER NOT NULL`. Las FK salientes del contrato preservan `idEmpresa` como primera columna; los únicos derivados de índices únicos reales también inician con `idEmpresa`. Esto documenta el aislamiento por tenant dentro de bases físicas compartidas, sin convertir la versión del schema en propiedad de un tenant individual.

## QA automatizado

Se agregó `SchemaContractProviderTests` con 18 pruebas para cubrir el mínimo exigido por el ticket:

- scope correcto;
- ContractVersion correcto;
- inventario final de 20 tablas;
- orden determinista en el manifiesto;
- mismo contrato/mismo hash;
- repetición/mismo hash;
- cambios de tipo, nulabilidad, longitud/precisión/escala alteran hash;
- cambios de índice, FK, UNIQUE y CHECK alteran hash;
- datos de negocio fuera del manifiesto;
- `idEmpresa` contractual en todas las tablas;
- FK/UNIQUE multitenant preservan `idEmpresa`;
- ausencia de secretos;
- repetibilidad runtime de V1;
- lectura del contrato no modifica T14 State;
- T13 no pasa a `Current` por existir contrato;
- scopes no mezclados.

Resultado:

```text
Correctas! - Con error: 0, Superado: 18, Omitido: 0, Total: 18
```

## QA real read-only 163

Runner temporal ejecutado fuera del repo con servicios productivos T11/T12/T13/T14/T15. Acciones realizadas: lectura de Firebase `Conexiones`, resolución tenant → base, identidad SQL, clasificación T13, consulta de `sys.tables`, `sys.columns`, `sys.indexes`, `sys.foreign_keys`, `sys.check_constraints` y lectura de `dbo.CheckAppSchemaState`. No se ejecutó DDL/DML.

Resultado sanitizado:

```text
tenant_found=True
tenant_active=True
idEmpresa_valid=True
database_identity_resolved=true
identity=SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5
classification_state=Unknown
classification_reason=VERSION_EVIDENCE_MISSING
classification_tables=20/20
contract_scope=ProductosServicios
contract_version=1
contract_tables=20
contract_columns=255
contract_indexes=50
contract_fks=24
contract_checks=14
manifest_hash=4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06
state_rows=0
state_current_version=NULL
state_manifest_hash=NULL
detected_columns=255
detected_indexes=50
detected_fks=24
detected_checks=14
discrepancy_count=0
```

## Límites explícitos

Ticket 15 no implementa T16/T17/T18. No ejecuta adopción, migración, reparación, validación física formal ni actualización de `CheckAppSchemaState`. Tampoco modifica tablas funcionales ni datos de negocio.
