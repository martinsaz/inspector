# OC-QA03S5 — Hotfix DDL OC V5 + certificación SQL real

Fecha: 2026-10-07  
Estado: **DDL V5/V2 SQL REAL CERTIFIED / PENDIENTE REVISIÓN PO**

## Causa y corrección

El fallo de OC-QA03S4 se reprodujo y quedó atribuido a resolución prematura de SQL Server: el mismo batch agregaba `OrdenesCompraDetalle.idSucursal` y luego la referenciaba estáticamente al compilar. La auditoría completa encontró el mismo patrón en el package local de Recepción V2 para `RecepcionPartidas.idSucursal`.

Ambos scripts conservan un solo `SingleTransaction`, `SET XACT_ABORT ON`, `THROW`, rechazo de target parcial/drift e idempotencia, sin `GO`. Las fases que referencian columnas u objetos recién creados se ejecutan mediante `sys.sp_executesql`; estructura, backfill, validación, `NOT NULL`, constraints, índices y reconciliación permanecen dentro de la transacción oficial.

## Identidad de packages

### OrdenesCompra V5

- MigrationId: `OC-M20261006-V4-V5-MULTISUCURSAL-PARTIDA` (sin cambio).
- SQL hash sustituido: `8edb374fabba1229bfb558276d1eccdaad0043fa6b2ed4ed468f87c7a3cf97cf`.
- SQL hash corregido: `19fbdeb7de4af7b77b893c36491e455e94c1d446d4d27aba76e0ae844686d71d`.
- Manifest target: `4e88ac49a73e3169903a6399a5b8c4fa2ea4c9b747005082ecc086636cb8462a` (sin cambio porque el contrato físico aprobado no cambió).

### Recepción V2

- MigrationId: `REC-M20261006-V1-V2-SUCURSAL-PARTIDA-OCV5` (sin cambio).
- SQL hash sustituido: `84d55d162bbb2dc53a7e6e686d3610329d2b596e6e6b2f41b259e086cf4321e6`.
- SQL hash corregido: `a0d0d9b43afaaf946f542d038b933e7de864bd158e9b23aeb537f7ccb5ca742a`.
- Manifest target: `44629d5055411a5a12e2acddfa108538a6f40295d339b45cead45ea39f62de40` (sin cambio).

## Certificación SQL Server aislada

Se agregó la prueba opt-in `OrdenesCompraRecepcionV5V2SqlIntegrationTests`, activada únicamente con `MOKA_SCHEMA_SQL_INTEGRATION_CONNECTION`. La prueba crea una base con nombre aleatorio, aprovisiona contratos fuente oficiales, ejecuta los packages mediante `SchemaMigrationRunner` y elimina la base en `finally`.

Resultado real:

- OC V4 exacto → OC V5: PASS.
- Target V5 físico: contrato exacto, `OrdenesCompraSucursales` presente, `OrdenesCompraDetalle.idSucursal NOT NULL`, `OrdenesCompra.idSucursal NULL`, constraints/unique/índices/checks exactos y drift 0 antes de la prueba de drift inducido.
- Fixture temporal: una OC, dos partidas (Producto y Servicio), Producto con Variante y PresentaciónCompra.
- Backfill: un destino y dos detalles poblados con la sucursal histórica.
- Preservación: cantidades ordenadas/recibidas/pendientes `3/0/3`, costos `40`, subtotal/total `60/60`, estados, tipos, IDs de Producto/Servicio/Variante/PresentaciónCompra y snapshots intactos.
- Recepción V1 → V2, ejecutada únicamente en la base temporal después de OC V5: PASS, target físico exacto y drift 0.
- Segunda ejecución de ambos scopes: no-op.
- Target parcial de OC V5: rechazado con `OC_V5_PARTIAL_OR_DRIFTED_TARGET_REJECTED` y rollback.
- Drift inducido al retirar un índice en la base desechable: detectado por el validador físico.
- Base temporal: eliminada.

## CHECKAPPERP — sólo lectura

- DatabaseIdentity: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`.
- OrdenesCompra: V4, hash `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`, `SchemaOk`, drift 0, 0 OC y 0 detalles.
- Recepción: V1, hash `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`, `SchemaOk`, drift 0, 0 recepciones/partidas/series/movimientos.
- Incompatibilidades: 0; `OrdenesCompraSucursales` ausente, `OrdenesCompraDetalle.idSucursal` ausente, cabecera aún NOT NULL, historial V5 PASS 0. El intento FAIL de OC-QA03S4 permanece como auditoría y sus residuos físicos son 0.
- Source del nuevo package: compatible con V4/V1 exactos.
- Protección vigente: packages locales continúan `ApprovedForExecution=false`/`AutoApplicable=false`; resolución `MIGRATION_NOT_AUTO_APPLICABLE`.
- DDL, DML y datos reales modificados: 0.

UMBRELLA no fue consultada ni modificada.

## Regresión

- Integración SQL real nueva: 1/1 PASS.
- Focal OC V5, Recepción V2, motor de migración, OC, Recepción e Inventario: 107/107 PASS.
- Builds API y MVC: PASS, 0 errores.
- ListaPrecios, UI, runtime, Legacy y providers activos: sin cambios por este ticket.
- Secretos persistidos: 0.

## Dictamen

`DDL_V5_V2_SQL_REAL_CERTIFIED`

Siguiente paso: revisión PO Denisse. No reintentar CHECKAPPERP, no tocar UMBRELLA, no activar V5/V2, no implementar UI y no continuar QA manual.
