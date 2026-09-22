# BL-03 FASE B OC-03R - QA PO Patron CheckApp

Ticket ejecutado: `MOKA_OC03R_PATRON_CHECKAPP_QA_PO_20260921`.

## Estado

OC-03 fue reabierto por QA PO no aprobado. Esta correccion deja PASS tecnico pendiente de aprobacion QA PO.

## Golden Master

Se audito nuevamente `/ProductosServicios/Index` y la documentacion vigente:

- `docs/pattern/PATRON_CHECKAPP_OFICIAL_20260916.md`.
- `docs/pattern/PATRON_CHECKAPP_GOLDEN_MASTER_COMPONENT_MATRIX_20260917.md`.
- `AGENTS.md`.
- `CLAUDE.md`.

Regla vigente: ProductosServicios/Index es Golden Master literal para pantallas complejas; OC no debe crear sistema visual paralelo.

## Correcciones OC-03R

- Header de OC homologado al hero funcional CheckApp, sin tarjeta blanca paralela.
- Paso 02 conserva columnas operativas en desktop sin scroll horizontal obligatorio: Agregar, Tipo, Codigo, Producto/Servicio, Variante, Presentacion compra, Factor y Costo.
- Paso 02 conserva scroll horizontal como fallback.
- Descripciones HTML saneadas se muestran como texto plano compacto, con tooltip nativo para lectura completa.
- Paso 03 compactado: Producto/Servicio agrupa numero, tipo, codigo, nombre y descripcion; controles editables de cantidad y costo quedan visibles y diferenciados.
- Paso 03 conserva Variante, PresentacionCompra, Cantidad compra, Unidad, Factor, Cantidad base, Costo unitario, Subtotal y Quitar.
- Textos tecnicos retirados de la UI: no se expone inventario, snapshots, schema, gate, tenant ni ids.
- Accion `Guardar orden` renombrada a `Guardar borrador`.
- Accion `Generar orden` se conserva como emision.

## PresentacionCompra

`PresentacionCompra` sigue siendo contrato independiente de `PresentacionVenta` por decision PO Opcion C.

- OC consulta exclusivamente `dbo.OrdenesCompraPresentacionesCompra`.
- OC no copia `PresentacionesVenta`.
- Base directa es fallback valido cuando no hay una presentacion de compra formal aplicable.
- La administracion funcional completa de `PresentacionCompra` no se implemento en este ticket; queda como hueco funcional a resolver en un ticket especifico si PO lo solicita.

## Reglas permanentes

- Las pantallas complejas usan `/ProductosServicios/Index` como Golden Master real.
- Las tablas operativas desktop priorizan controles y acciones; la descripcion nunca debe forzar scroll horizontal obligatorio.
- El scroll horizontal se conserva como fallback responsive.
- HTML nunca se muestra crudo; se convierte a texto seguro en listados/revision/detalle.
- El copy tecnico no pertenece a UI.
- Borrador y emision deben tener nomenclatura inequivoca.
- `PresentacionCompra` y `PresentacionVenta` son contratos independientes.
- LISTO QA PO requiere navegador autenticado real y comparacion visual contra Golden Master.

## Fuera de alcance

- OC-04.
- Recepcion UI.
- Legacy.
- T25.
- Reporte lider.
