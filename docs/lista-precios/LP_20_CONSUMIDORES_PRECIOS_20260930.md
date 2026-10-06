# LP-20 - Consumidores reales del motor ListaPrecios

Fecha: 2026-09-30

Estado: CERRADO / COTIZACIONES CONSUMIDOR REAL LP-08 CERTIFICADO

## 1. Dictamen

La fase de auditoria identifico un dominio comercial funcional, Cotizaciones, pero ninguno que pueda integrarse correctamente con LP-08 bajo el schema y la arquitectura autorizados actualmente.

`LP-20 = STOP PO / SIN CONSUMIDOR REAL CERTIFICABLE`

No se modifico codigo productivo, no se ejecuto DDL y no se integraron consumidores parcialmente.

## 2. Matriz de consumidores

| Consumidor | UI real | API/Servicio | Persistencia | Identidades | Tenant | Fuente actual del precio | Puede consumir LP-08 hoy | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ventas | Placeholders `/Ventas/Nueva` y `/Ventas/Devoluciones` | No existe | No existe | No existe | No existe | No existe | No | PLACEHOLDER; LP-19 sigue bloqueado |
| Cotizaciones | Si: reporte, alta, detalle, edicion, clon, PDF y correo | `api/Cotizaciones` funcional | `Cotizaciones` + `CotizacionesPartidas` | Producto y Servicio por `idProductoServicio`; sin Variante/PresentacionVenta | Filtra `idEmpresa`, pero API abre `SqlConnectionFactory` fijo y no usa resolver/gate ListaPrecios | `ProductosServicios.PrecioPublico` llega al JS, es editable y vuelve al API; descuento manual/cliente; calculo duplicado JS/API | No sin cambios de schema y tenant no autorizados | FUNCIONAL, NO CERTIFICABLE LP-08 / STOP PO |
| Pedidos | No existe UI CheckApp | No existe | No existe | No existe | No existe | No existe | No | NO EXISTE |
| Facturacion | Placeholder `/Facturacion/Panel` | No existe | No existe | No existe | No existe | No existe | No | PLACEHOLDER |
| Ordenes de Compra | Si | Si | Canonica de compra | Producto/Servicio/Variante/PresentacionCompra | Dominio propio | Costo de compra | No corresponde | FUERA DE ALCANCE |
| Recepcion | Si | Si | Canonica de recepcion | Identidades de compra | Dominio propio | Snapshot/costo de compra | No corresponde | FUERA DE ALCANCE |
| Inventario | Contexto LP-13 | Si | Ledger/saldos | Producto/Variante | Tenant propio | No determina precio comercial | No corresponde | FUERA DE ALCANCE |

## 3. Evidencia fisica UMBRELLA 163

- Auditoria SQL: READ-ONLY.
- DatabaseIdentity saneada: `DB_A883C3_CHECKLIST`.
- Cotizaciones: 19 totales y 19 activas.
- CotizacionesPartidas: 70 totales y 70 activas.
- Datos modificados: 0.

`CotizacionesPartidas` conserva snapshots parciales de codigo, nombre, descripcion, unidad, existencia, cantidad, `PrecioUnitario`, `DescuentoPct`, importe bruto, descuento importe y total. No conserva el snapshot contractual completo de LP-08.

## 4. Brechas Cotizaciones

Los 13 campos/dimensiones LP-08 auditados que faltan fisicamente son:

- `idVariante`;
- `idPresentacionVenta`;
- `idListaPrecio`;
- `PrecioBase`;
- `PrecioLista`;
- `OrigenPrecio`;
- `SubtotalAntesRedondeo`;
- `RedondeoModo`;
- `PrecioFinal`;
- `VigenciaInicio`;
- `VigenciaFin`;
- `ReglaVersion`;
- `CorrelationId`.

Brechas adicionales:

- La solicitud acepta precio y descuento calculados/editados en cliente.
- JavaScript calcula importe, descuento y total.
- API repite el calculo y aplica descuento de cliente si el enviado es cero.
- `NormalizePartidasAsync` descarta `PrecioUnitario <= 0`, incompatible con precio configurado `0.00` valido en LP-08.
- El consumidor solo identifica Producto/Servicio; no representa Variante ni PresentacionVenta.
- No existe seleccion contractual de lista.
- `CotizacionesController` usa `SqlConnectionFactory` fijo y no el resolver server-side/gate de ListaPrecios.
- Editar un borrador elimina fisicamente sus partidas y las recrea; no se altero este comportamiento preexistente.

Conectar LP-08 sin resolver estas brechas produciria snapshots incompletos, calculo duplicado y una integracion tenant/gate no certificable.

## 5. Contrato requerido antes de integrar

PO debe definir y autorizar, como minimo:

- schema/versionado de snapshot comercial para Cotizaciones;
- politica de lista aplicable;
- soporte de Producto, Servicio, Variante y PresentacionVenta;
- preservacion de precio `0.00`, fallback, descuento, redondeo y vigencia LP-08;
- momento de resolucion y reglas de edicion manual posteriores;
- adopcion del resolver tenant y Compatibility Gate sin alterar otros dominios;
- politica de actualizacion de partidas de borrador y preservacion historica.

LP-20 no puede crear ese DDL ni tomar estas decisiones por inferencia.

## 6. Motor, snapshot y QA

- Consumidor integrado: ninguno.
- Motor LP-08 invocado por consumidor: no.
- Snapshot LP-08 persistido: no.
- Fixtures/documentos QA: 0.
- Configuraciones LP QA: 0.
- Cleanup: no requerido; residuos 0.
- Tests/builds completos: no ejecutados porque el STOP ocurre antes de implementacion.
- `git diff --check`: unica regresion requerida para el cierre documental.

## 7. Protecciones

- LP-01..LP-18: certificaciones preservadas.
- LP-19: BLOQUEADO / DEPENDENCIA EXTERNA VENTAS.
- Ventas y Facturacion placeholders: sin cambios.
- ListaPreciosHistorial LP-18: append-only/FROZEN.
- Schema ListaPrecios, Auth/Login/Firebase, Inventario, ProductosServicios y Legacy: sin cambios.
- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: FROZEN y sin cambios LP-20.
- LP-21 y LP-22: NO EJECUTADOS.

## 8. Siguiente paso

Revision PO de la brecha Cotizaciones: snapshot comercial, schema/versionado, tenant/gate y politica de lista. No ejecutar LP-21 ni LP-22.

## 9. LP-20E - Consolidacion final LP-20

Fecha: 2026-10-01

Esta seccion consolida el resultado final certificado por los expedientes LP-20A, LP-20B/LP-20C4 y LP-20D/LP-20D1/LP-20D2/LP-20D3. Las secciones anteriores preservan la auditoria inicial y sus bloqueos historicos; el estado vigente es el siguiente:

- `LP-20 = CERRADO`.
- Consumidor real certificado: Cotizaciones.
- Motor: ListaPrecios LP-08.
- Tenant: resolucion server-side PASS.
- Gates: Cotizaciones y ListaPrecios `COMPATIBLE`.
- Identidades: Producto, Servicio, Variante y PresentacionVenta PASS.
- Comercial: Lista 1..10, precio especifico, precio `0.00`, fallback, descuento LP, descuento adicional, redondeo, vigencia, snapshot, override auditado y clon re-resuelto PASS.
- Historico: 19 cotizaciones y 70 partidas `PRE_LP08` preservadas, sin recalculo ni backfill comercial.
- QA runtime autenticada UMBRELLA 163 y responsive `1440/820/390`: PASS.
- Regresion final: `772/772` PASS.

Dependencias no resueltas:

- Ventas: PLACEHOLDER; LP-19 permanece `BLOQUEADO POR DOMINIO VENTAS`.
- Pedidos: NO EXISTE como dominio CheckApp.
- Facturacion: PLACEHOLDER.
- LP-21: `BLOQUEADO / NO EJECUTABLE` por dependencias comerciales/Ventas.
- LP-22: `PENDIENTE REVISION PO`.

No se declaran consumidores adicionales ni implementaciones de Ventas, Pedidos o Facturacion. LP-20E no ejecuta SQL, DDL, fixtures, runtime, LP-21 ni LP-22 y no modifica codigo productivo.

Expedientes de referencia:

- `LP_20A_CONTRATO_COTIZACIONES_CONSUMIDOR_LP08_20260930.md`.
- `LP_20B_SCHEMA_VERSIONADO_COTIZACIONES_LP08_20260930.md`.
- `LP_20D_INTEGRACION_RUNTIME_COTIZACIONES_LP08_20261001.md`.

Dictamen vigente: `LP-20 = CERRADO / COTIZACIONES CONSUMIDOR REAL LP-08 CERTIFICADO / SNAPSHOT PASS / PRE_LP08 PRESERVADO / QA RUNTIME AUTENTICADA PASS`.

Siguiente paso: revision PO pre-LP-22. No ejecutar LP-21 ni LP-22.
