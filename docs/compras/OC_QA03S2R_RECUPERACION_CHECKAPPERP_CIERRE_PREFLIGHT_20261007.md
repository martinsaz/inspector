#MOKA

# OC-QA03S2R — Recuperación CHECKAPPERP y cierre del preflight OC V5 + Recepción V2

Fecha: 2026-10-07  
Estado: `STOP_PO / ACCESO RECUPERADO / CHECKAPPERP OC V2, NO V4 / DDL 0 / DML 0`

## 1. Mecanismo anterior

Se auditó la bitácora MVC/API, la certificación `LP_QA05S2_CERTIFICACION_SQL_PRODUCTOSSERVICIOS_V3_20261005.md`, los harnesses temporales de LP-QA05S2/LP-QA05S3, las variables de entorno y los adjuntos locales autorizados por PO.

La conexión QA usada históricamente fue localizada en un adjunto PO ya existente. La misma conexión aparece con una huella idéntica en cinco evidencias locales de certificación, incluidas las instrucciones de Lista de Precios. Se reutilizó exclusivamente en memoria mediante `MOKA_CHECKAPPERP_QA_CONNECTION`; no se imprimió, copió al repositorio ni incorporó al harness o al resultado.

La identidad se resolvió nuevamente desde SQL y coincide con la identidad histórica esperada:

`VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`

La coincidencia se usó para confirmar el destino actual, no para asumir su estado.

## 2. CHECKAPPERP actual

### OrdenesCompra

- Estado persistido: V2.
- Manifest hash: `0977353cc806ec35d21c95c4149e16cdf41b3480d52b929b13ec82185957e802`.
- Último resultado: `PROVISIONED/PASS`.
- Contrato físico V2: `SchemaOk`, drift 0.
- Objetos detectados: 4 tablas, 76 columnas, 17 índices, 6 FKs y 19 checks.
- OCs/detalles: 0/0.
- Estados 1/2/3/4/5/inválidos: 0/0/0/0/0/0.
- Sucursales inválidas, huérfanos y cross-tenant: 0/0/0.
- Errores de cantidades, importes y reconciliación cabecera-detalle: 0/0/0.
- Ordenado/recibido/pendiente: 0/0/0.
- Subtotal/total: 0/0.

El source obligatorio del package OC V5 es V4 con hash `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`. CHECKAPPERP no satisface esa precondición porque permanece en V2.

El resolver oficial read-only identifica exactamente dos migraciones activas previas pendientes:

1. `OC-M20261006-V2-V3-RANGO-FECHAS`, V2→V3, SQL hash `bd1b5d909b54ef9046774ced6c797cdfe8a4d8f7234bfddd97465463fc887874`, target hash `f301f05fb2928d941d2cd7bf1d312da78629db4002ab1e4ab06225464ab2ffc1`.
2. `OC-M20261006-V3-V4-FOLIO-REFERENCIA`, V3→V4, SQL hash `0b7daf6468dd8f933c8e6d74204549904927b71ab2e00eb6de3a6107ff14f47c`, target hash `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`.

No se ejecutó ninguna. El backfill V4→V5 esperado, una vez alcanzado V4 y si PO autoriza posteriormente, es 0 destinos y 0 detalles porque la base no contiene OCs.

### Recepción e Inventario

- Estado persistido: V1.
- Manifest hash: `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`.
- Último resultado: `PROVISIONED/PASS`.
- Contrato físico V1: `SchemaOk`, drift 0.
- Objetos detectados: 4 tablas, 57 columnas, 16 índices, 13 FKs y 7 checks.
- Recepciones/partidas/series: 0/0/0.
- Movimientos totales/relacionados con recepción: 0/0.
- OperationKey vacía/duplicada: 0/0.
- Huérfanos, mismatch OC/partida/concepto/sucursal, cross-tenant: 0.
- Cantidades inválidas, parciales, múltiples y sobrerrecepción: 0.
- Errores Producto/Servicio/Variante, movimientos, saldos y series: 0.
- Backfill Recepción V1→V2 esperado: 0 partidas.

Recepción V1 sí coincide con el source aprobado de V2, pero el orden contractual exige OC V5 antes de Recepción V2. Por ello tampoco está habilitada para ejecución aislada.

## 3. Dry-run y gate

Sólo se usaron `SchemaVersionRepository`, `SchemaDriftValidator`, `SchemaMigrationResolver` y consultas que el harness acepta únicamente cuando comienzan con `SELECT` o `WITH`.

- Identidad actual: PASS.
- Drift OC V2: PASS / 0.
- Drift Recepción V1: PASS / 0.
- Incompatibilidades de datos: 0.
- Source OC V4 requerido: FAIL; actual V2.
- Source Recepción V1: PASS, condicionado a OC V5.
- Resolver de prerequisitos OC: `PENDING_MIGRATIONS_RESOLVED`, dos migraciones pendientes V2→V3→V4.
- Resolver de propuesta V5/V2: protección `MIGRATION_NOT_AUTO_APPLICABLE`; packages no ejecutados y `ApprovedForExecution=false`.
- Segunda ejecución V5/V2: diseñada como no-op sólo después de alcanzar los targets completos; estados parciales/drift abortan.

El resultado UMBRELLA certificado en OC-QA03S2 se conserva sin nueva consulta ni escritura: OC V4 y Recepción V1 exactas, drift 0, incompatibilidades 0, backfill esperado 47 destinos + 96 detalles y 0 partidas de recepción; `READY` individual.

## 4. Dictamen

`STOP_PO`

El acceso CHECKAPPERP quedó recuperado, pero el gate global no puede declarar `READY_FOR_PO_EXECUTION`: CHECKAPPERP no está en el source OC V4 exacto exigido por OC V5. Se requiere revisión PO Denisse sobre la secuencia previa V2→V3→V4; este ticket no autoriza ejecutarla.

DDL ejecutado: 0.  
DML ejecutado: 0.  
Datos modificados: 0.  
Migraciones ejecutadas: 0.  
UI/runtime/providers/LatestVersion modificados: 0.

Siguiente paso: revisión PO Denisse. No ejecutar todavía V2→V3→V4, OC V5 ni Recepción V2.
