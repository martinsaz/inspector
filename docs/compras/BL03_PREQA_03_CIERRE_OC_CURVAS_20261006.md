# BL03-PREQA-03 — Cierre pre-QA OC + Curvas

Fecha: 2026-10-06  
Tenant QA: UMBRELLA 163  
Estado histórico: SUPERSEDIDO POR DECISIÓN PO BL03-PREQA-04

> BL03-PREQA-04 reclasifica estados 4/5 como certificación E2E diferida a Recepción UI y el fallo preexistente de ListaPrecios como no bloqueante. El gate vigente es `LISTO PARA QA MANUAL DENISSE`; ver `BL03_PREQA_04_CIERRE_FORMAL_OC_CURVAS_20261006.md`.

## 1. Fechas mínima y máxima de OC

- `OrdenesCompra` avanza oficialmente de V2 a V3.
- Hash V3: `f301f05fb2928d941d2cd7bf1d312da78629db4002ab1e4ab06225464ab2ffc1`.
- Migración: `OC-M20261006-V2-V3-RANGO-FECHAS`, secuencial, transaccional e idempotente.
- Agrega `FechaMinima DATE NULL`, `FechaMaxima DATE NULL` y `CK_OrdenesCompra_RangoFechas`.
- No existe backfill de negocio ni DML comercial ficticio.
- Runtime oficial UMBRELLA: V2→V3 `Migrated`, drift `SchemaOk/0`; segunda ejecución `NoProvision/NO_PENDING_MIGRATIONS`.
- El flujo UI→payload→API→persistencia→consulta→detalle/edición conserva ambas fechas.
- OC QA `OC-000050`: mínima `2026-10-10`, máxima `2026-10-15`, llegada `2026-10-12`; F5 y reapertura PASS.
- Cleanup oficial: cancelación auditada desde UI con motivo `Cleanup oficial BL03-PREQA-03`; no hard delete.

## 2. Auditoría Legacy read-only

### Etiquetas

- Propósito: buscar una identidad física por estilo/color/acabado/marca/corrida o barcode, seleccionar tallas/cantidades y generar HTML de impresión o ZPL; además permite etiquetas de lote y formatos configurables.
- Visibilidad: módulo `ALMACEN` + `ALMACEN_COMPRAS`; en reporte aparece como acción de OC y factura, y existe la pantalla `Almacén > Compras > Generar etiquetas`.
- Datos: tienda, barcode, estilo, color, acabado, marca, línea, sublínea, descripción/observaciones, corrida, talla, lote, formato, precio y campos configurados.
- Modifica: no modifica la OC ni existencias; genera salida imprimible/ZPL. Las preferencias de campos y modo se conservan en `localStorage` del usuario.
- Dependencias: catálogo físico/barcodes, corridas/tallas, lotes, impresora PDF/Zebra y permisos de Almacén/Compras.
- Equivalencia CheckApp: no existe acción de etiquetas en OC, Catálogo de Curvas o Siembra.
- Aplicabilidad: Producto sí; Servicio no; Variante sí cuando determina barcode/corrida/talla; PresentacionCompra no.
- Clasificación: `C) REQUIERE DECISIÓN PO POSTERIOR`, porque es un proceso físico/hardware posterior y no forma parte del contrato OC/Curvas autorizado.

### Configuración/edición posterior

- Propósito: desde el engrane de una OC cambia status y opcionalmente llegada/mínima/máxima; desde el detalle permite cambiar cantidad/costo, agregar o eliminar renglones.
- Visibilidad: acción `Configurar orden` en cada OC del reporte; edición de partidas dentro del detalle cuando la orden es editable.
- Datos: pedido/folio/proveedor/tienda, status, tres fechas, barcode, punto/talla, cantidad y costo.
- Modifica: cabecera de pedido, fechas/status y partidas; los endpoints Legacy ejecutan escrituras reales.
- Dependencias: endpoints de pedidos, reglas de status y catálogo físico por barcode/talla.
- Equivalencia CheckApp: edición de borrador, cancelación oficial, detalle y fechas mínima/máxima ya existen; no hay equivalencia exacta autorizada para todos los status Legacy ni para toda mutación posterior de partidas.
- Aplicabilidad: Producto sí; Servicio sólo en el modelo CheckApp, no demostrado en Legacy físico; Variante sí; PresentacionCompra sólo en CheckApp, no como identidad Legacy.
- Clasificación: `C) REQUIERE DECISIÓN PO POSTERIOR` para la diferencia remanente de estados/mutaciones; no se agregaron botones, endpoints, tablas ni modales.

Legacy se mantuvo estrictamente read-only en `Raramuri.blzr` y `sazapi`.

## 3. Runtime OC y gate

- Borrador: 17; Generada: 19; Cancelada: 9; Parcialmente recibida: 0; Recibida: 0; total: 45.
- `OC-000050`: Ordenado 1, Recibido 0, Pendiente 1, Cancelada; detalle y fechas PASS.
- Filtros de estados 1/2/3 PASS.
- PDF y Excel del detalle se ejecutaron sin error de UI/consola.
- Estados 4/5: NO CERTIFICADOS. El backend de Recepción expone confirmación pero no cancelación/rollback oficial; fabricar esos estados dejaría escritura de negocio sin cleanup oficial. No se usó SQL directo.
- Edición: la UI conserva la regla de edición sólo cuando corresponde.

## 4. Curvas y responsive

- Catálogo: 13/13; `Revertir cambios` ausente; alta/edición/baja/reactivación, producto/variante, objetivos, múltiples productos, permisos y tenant cubiertos por regresión previa vigente y smoke actual.
- Siembra: 13/13; sucursal/curva/producto/variante/objetivo, sembrar/reemplazar/cerrar, F5, vigentes y cleanup cubiertos por OC-CUR-05R1 y smoke actual; vigentes inicial/final 0.
- Responsive autenticado y visual: Nueva OC, Reporte OC, Catálogo y Siembra en `1440`, `820` y `390`.
- En los doce cruces: `innerWidth == clientWidth == bodyScrollWidth`; grids anchos usan scroll interno y no producen overflow del body.
- Se verificaron filtros, grids, botones, formularios, wizard, acciones, textos y modal de Curvas. El modal quedó opaco y contenido en 390 px.

## 5. Regresión y avance objetivo

- Focal OC/schema/migration: 53/53 PASS.
- OC + Recepción backend + Inventario + Curvas + ProductosServicios: 369/369 PASS.
- Suite completa: 850/851; único fallo preexistente `ListaPreciosMatrixSqlIntegrationTests.ConsultaMatricialReal_MaterializaTodasLasIdentidadesYDiezNiveles`, por precios presentes donde el fixture espera `NULL`. ListaPrecios no se modificó.
- Builds API/MVC: PASS, 0 errores.
- Node: PASS para `OrdenesCompra.js` y `CurvasCatalogo.js`.
- Detector de inventos: 0.

Metodología `conformes/auditados × 100`:

- OC: 21/22 = 95.45% (falta certificación runtime estados 4/5).
- Catálogo: 13/13 = 100%.
- Siembra: 13/13 = 100%.
- Huecos/Copetes: 4/8 = 50%.
- Recepción: 18/36 = 50%.
- BL03: 69/92 = 75%.

## 6. Dictamen

`NO LISTO PARA QA MANUAL DENISSE` por falta de un mecanismo oficial reversible para certificar estados 4/5 y por la suite global no completamente verde. No se inició OC-CUR-06, no se implementó Recepción UI, no se modificó ListaPrecios ni Legacy, y no se declara aprobado PO ni FROZEN.
