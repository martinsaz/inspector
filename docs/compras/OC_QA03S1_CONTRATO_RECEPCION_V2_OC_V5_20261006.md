#MOKA

# OC-QA03S1 — Cierre contrato Recepción V2 + OC V5

Fecha: 2026-10-06  
Estado: `CONTRATO CERRADO PO / PACKAGE LOCAL / PENDIENTE REVISIÓN PO PRE-EJECUCIÓN / SIN SQL REAL`  
Autorizado: diseño, contratos, SQL propuesto no registrado, packages locales y pruebas.  
No autorizado: ejecutar DDL/DML, activar versiones, modificar runtime/UI/Legacy o continuar QA Denisse.

## 1. Decisiones PO incorporadas

- Una OC conserva un encabezado y admite múltiples destinos mediante `OrdenesCompraSucursales`; no se generan OCs hijas.
- Cada `OrdenesCompraDetalle` pertenece a exactamente una sucursal mediante `idSucursal NOT NULL`.
- La sucursal de partida sólo es mutable en `Estado=1` (Borrador) y sin recepciones. En estados 2–5 es inmutable.
- Un destino sólo se retira/archiva sin partidas; si lo referencia cualquier recepción, no puede retirarse, archivarse ni reasignarse.
- `OrdenesCompra.idSucursal` conserva el histórico V1–V4, se vuelve nullable y las nuevas escrituras V5 deben dejarlo `NULL`; no es autoridad runtime.
- Producto, Servicio, Variante, PresentacionCompra y OC mixta permanecen autorizados. Legacy permanece read-only.

Las reglas de mutabilidad/archivado son invariantes del runtime V5 futuro. Las FKs físicas garantizan pertenencia; el package no agrega triggers ni activa runtime.

## 2. OC V5 definitivo

`OrdenesCompraSucursales` declara destinos válidos con unicidad tenant-safe `(idEmpresa,idOrdenCompra,idSucursal)`. `OrdenesCompraDetalle.idSucursal` referencia simultáneamente la sucursal y el destino de la OC.

Para soportar la FK de Recepción V2, la clave candidata de detalle queda:

`(idEmpresa,id,idOrdenCompra,idSucursal)`

El backfill V4→V5 crea exactamente un destino por OC histórica y copia la sucursal histórica a sus partidas. Preserva conteos, subtotal, total, ordenado, recibido y pendiente; no inventa sucursales ni altera estados.

## 3. Recepción V2 definitiva

Una recepción pertenece a una sola sucursal:

- `Recepciones.idSucursal NOT NULL` se conserva.
- FK `(idEmpresa,idOrdenCompra,idSucursal)` → `OrdenesCompraSucursales` impide recibir un destino ajeno a la OC.
- `RecepcionPartidas.idSucursal UNIQUEIDENTIFIER NOT NULL` se agrega.
- FK `(idEmpresa,idRecepcion,idOrdenCompra,idSucursal)` → `Recepciones` impide mezclar sucursales dentro de una recepción.
- FK `(idEmpresa,idOrdenCompraDetalle,idOrdenCompra,idSucursal)` → `OrdenesCompraDetalle` impide recibir la partida equivocada, de otra OC, sucursal o tenant.
- FK `(idEmpresa,idSucursal)` → `Sucursales` conserva integridad tenant-safe.

Se preservan checks de cantidades/no sobrerrecepción/estado, `OperationKey` único por tenant, auditoría, snapshots y baja lógica existentes. El runtime V2 futuro debe conservar transacción serializable y locks `UPDLOCK/HOLDLOCK`: cantidad positiva, nunca mayor al pendiente bloqueado, retry idempotente y estado OC derivado de todas sus partidas.

Ejemplo contractual:

- A ordena 10: recepción A1=4, luego A2=6; resultado recibido 10, pendiente 0.
- B ordena 20: recepción B1=20; resultado recibido 20, pendiente 0.
- Al quedar todas las partidas sin pendiente, la OC queda Recibida. Antes, queda Parcialmente recibida.

## 4. Inventario, servicios y series

Flujo de Producto:

`OrdenesCompraDetalle.idSucursal → RecepcionPartidas.idSucursal → InventarioMovimientos.idSucursal → InventarioSaldos/InventarioSeries de la misma sucursal`.

- Producto conserva identidad, variante, snapshot de PresentacionCompra y factor de conversión.
- Servicio pertenece y puede recibirse por sucursal, pero `idInventarioMovimiento` permanece `NULL`; no crea movimiento, saldo ni serie.
- Para control serial, la cantidad base recibida debe ser entera y el número de `RecepcionSeries` debe coincidir. Se reconcilian tenant, recepción/partida, producto, variante y sucursal de `InventarioSeries`; la unicidad existente impide duplicados.
- El package no modifica ni recalcula Inventario.

## 5. Backfill Recepción V1→V2

Antes de cualquier DDL, el SQL propuesto valida:

- toda recepción contra el destino OC V5 de la misma empresa/OC/sucursal;
- toda partida contra recepción y detalle OC V5 de la misma empresa/OC/sucursal;
- movimientos contra sucursal, producto y variante;
- servicios sin movimiento;
- series contra identidad, conteo, tenant, producto, variante y sucursal;
- ausencia de objetivo parcial o drift.

Después agrega temporalmente `RecepcionPartidas.idSucursal NULL`, copia exclusivamente `Recepciones.idSucursal`, exige backfill total, cambia a `NOT NULL` y crea constraints. Reconcilia conteos de recepciones/partidas/movimientos/series y sumas de cantidades antes del commit. Cualquier incompatibilidad ejecuta `THROW`; `XACT_ABORT` y `SingleTransaction` dejan rollback al runner.

No cambia cantidades, estados, inventario histórico, movimientos ni series y no inventa sucursales.

## 6. Packages locales y orden exacto

1. OC `OC-M20261006-V4-V5-MULTISUCURSAL-PARTIDA`.
   - Source manifest V4: `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`.
   - Target manifest V5: `4e88ac49a73e3169903a6399a5b8c4fa2ea4c9b747005082ecc086636cb8462a`.
   - SQL hash: `8edb374fabba1229bfb558276d1eccdaad0043fa6b2ed4ed468f87c7a3cf97cf`.
2. Recepción `REC-M20261006-V1-V2-SUCURSAL-PARTIDA-OCV5`.
   - Source manifest V1: `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`.
   - Target manifest V2: `44629d5055411a5a12e2acddfa108538a6f40295d339b45cead45ea39f62de40`.
   - SQL hash: `84d55d162bbb2dc53a7e6e686d3610329d2b596e6e6b2f41b259e086cf4321e6`.
   - Depende del manifest Recepción V1 y del manifest OC V5 exacto.

Ambos packages tienen `ApprovedForExecution=false`, migraciones `AutoApplicable=false` y `ApprovedMigrationIds` vacío. No están registrados en providers/runners activos: OC continúa V4 y Recepción V1. El resolver oficial los rechaza con `MIGRATION_NOT_AUTO_APPLICABLE`.

Segunda ejecución directa sólo retorna no-op ante objetivo completo. Cualquier objetivo parcial o drift se rechaza; no se intenta completar un estado ambiguo.

## 7. Pruebas y protecciones

Las pruebas cubren 1/4 sucursales, múltiples partidas, Producto/Servicio/Variante/PresentacionCompra/mixta, parcial 4+6, múltiples recepciones, cierre completo, sobrerrecepción, series, sucursal/partida incorrectas, cross-tenant, backfill, inventario por sucursal, servicio sin movimiento, idempotencia y partial/drift.

Resultados:

- focal OC V5 + Recepción V2: `32/32 PASS`;
- regresión coordinada OC/Recepción/Inventario/motor de migraciones: `103/103 PASS`;
- suite completa: `885/886 PASS`; único fallo `ListaPreciosMatrixSqlIntegrationTests.ConsultaMatricialReal_MaterializaTodasLasIdentidadesYDiezNiveles`, preexistente, congelado y fuera del alcance;
- `git diff --check`: PASS en API y MVC.

No se modificaron UI Nueva OC, UI Recepción, Steps 4/5, Curvas, Siembra, Huecos/Copetes, ListaPrecios, ProductosServicios funcional, Auth ni Legacy. SQL real y datos modificados: cero.

## 8. Bloqueos y siguiente paso

No quedan decisiones funcionales pendientes del contrato OC V5 + Recepción V2. Sí permanece bloqueada cualquier ejecución/activación/runtime/UI hasta revisión PO pre-ejecución, preflight read-only por base y autorización separada. No procede QA Denisse todavía.

Siguiente paso: `REVISIÓN PO PRE-EJECUCIÓN SCHEMA`.
