# TICKET 24 ADDENDUM — ProductosServicios V2 descripciones HTML NVARCHAR(MAX)

Fecha: 2026-09-16  
Estado: IMPLEMENTADO Y MIGRADO EN BASE 163  
Scope: `ProductosServicios`  
T25: `FROZEN / NO EJECUTADO`

## Decisión PO

El Product Owner aprobó que las descripciones HTML de catálogos conceptuales usen `NVARCHAR(MAX)`:

- `dbo.ProductosServiciosCategorias.Descripcion`
- `dbo.ProductosServiciosMarcas.Descripcion`
- `dbo.ProductosServiciosColecciones.Descripcion`

La decisión reemplaza el pendiente `REQUIERE_DECISION_PO_TIPO_DESCRIPCION` por:

```text
RESUELTO POR PRODUCT OWNER: NVARCHAR(MAX)
```

## Contratos

- V1 histórico permanece inmutable.
- Hash V1 preservado: `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`.
- V2 vigente cambia únicamente las tres columnas listadas de `NVARCHAR(500)` a `NVARCHAR(MAX)`.
- Hash V2: `1b5c75e4b44fcfcb3af4219660095ddb2a99419db8da300aff6e4a38c731a705`.
- `LatestSchemaVersion = 2`.

## Migración

Migración aprobada:

```text
PS-M20260916-V1-V2-DESCRIPCIONES-NVARCHAR-MAX
```

La migración se ejecuta exclusivamente por T17:

- lock T19 por `DatabaseIdentity + Scope`;
- transacción y `SET XACT_ABORT ON`;
- precondiciones de existencia, tipo `nvarchar`, longitud V1/V2 y nulabilidad;
- `ALTER COLUMN` idempotente solo para las tres columnas;
- validación física contra contrato V2 antes de confirmar;
- `History MIGRATED` y `State CurrentVersion=2` solo tras PASS.

No hay `GO`, DML ni reconstrucción de tablas. No modifica Firebase, Hosting, Conexiones, permisos, usuarios, roles, `nxt_*` ni T25.

## Evidencia SQL real 163

Runner temporal:

```text
tmp/productos-servicios-v2-migration/output/report-20260916-232624.json
```

BEFORE:

- Empresa `163`, `idEmpresa=b17aaece-2b78-4e35-b554-9e694eeb15a7`.
- `CurrentVersion=1`, hash V1.
- T18 V1: `SchemaOk`, `DriftCount=0`.
- Columnas físicas: las tres `Descripcion` eran `nvarchar` longitud `1000` bytes (`NVARCHAR(500)`), nullable.
- Snapshot lógico sin contenido sensible: conteos, nulls, longitud máxima y checksum por tabla.

AFTER:

- Migración: `Status=Migrated`, `ReasonCode=MIGRATED`, `FromVersion=1`, `ToVersion=2`.
- `CurrentVersion=2`, hash V2.
- T18 V2: `SchemaOk`, `DriftCount=0`.
- Columnas físicas: las tres `Descripcion` son `nvarchar(max)` (`max_length=-1`), nullable.
- Conteos/nulls/longitudes/checksums iguales a BEFORE: datos preservados.
- Segunda corrida: `NoProvision/NO_PENDING_MIGRATIONS`; `History MIGRATED` quedó una sola vez.

## Baseline y bootstrap

Las bases EMPTY deben provisionar directamente con contrato V2. Las bases históricas V1 no se alteran por bootstrap ni adopción; deben evolucionar por la migración T17 aprobada.

La adopción histórica continúa anclada a V1 cuando una base completa carece de evidencia T14, y la transición V1 -> V2 queda separada, trazada e idempotente.

## Regla futura

Toda descripción HTML editable con TinyMCE en ProductosServicios que requiera preservar markup debe usar `NVARCHAR(MAX)` y sanitización server-side allowlist. No usar `NVARCHAR(500)` para nuevos campos HTML de descripción.

## QA

- Pruebas enfocadas schema/migración/sanitización: PASS, 31/31.
- SQL real 163: PASS con T17/T18/T20 posteriores.
- Data preservation: PASS.
- Idempotencia segunda corrida: PASS.
- Firebase modificado: NO.
- Hosting modificado: NO.
- Conexiones modificadas: NO.
- DDL: SI, únicamente migración versionada T17 aprobada.
