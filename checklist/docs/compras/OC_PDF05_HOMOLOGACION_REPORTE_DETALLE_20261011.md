# OC-PDF05 - Homologación de Reporte/Detalle con PDF oficial

Fecha de validación: 2026-10-11.

## Alcance

Se auditó el flujo `Reporte > Ver detalle > Exportar PDF` de órdenes de compra. No se modificaron el wizard, los pasos 1 y 2, Productos y Servicios, Curvas, contratos, esquema, datos ni Excel.

## Hallazgos

- El wizard y el reporte ya invocaban el endpoint MVC `/Activos/OrdenesCompra/ExportarOrdenCompraPdf`.
- El controlador MVC ya delegaba en `OrdenCompraPdfComposer`, fuente certificada por OC-PDF04.
- La API conservaba un segundo endpoint PDF y un generador manual anterior. Aunque la interfaz no lo consumía, constituía una implementación alterna no homologada.
- El modal de detalle presentaba las partidas en formato plano, repitiendo el concepto por sucursal/variante y dificultando la comparación con la agrupación oficial del PDF.

## Corrección aplicada

- Se eliminó de la API el endpoint/generador PDF alterno. El único generador de PDF de OC queda en `OrdenCompraPdfComposer` y el único endpoint de descarga queda en MVC.
- El detalle web conserva los filtros del reporte y agrupa por `PRODUCTO`/`SERVICIO`, concepto, variante/presentación y sucursal.
- El detalle muestra cantidades, importes, recibido, pendiente, estado de partida, subtotales por concepto, subtotal, total y piezas sin inventar datos.
- La vista usa matriz compacta en escritorio/tablet y tarjetas por variante en móvil, sin scroll horizontal obligatorio.
- Los botones `Exportar PDF`, `Exportar Excel` y `Cerrar` permanecen en el footer del modal. Excel conserva su implementación previa.

## QA real OC-000023

- PDF exportado físicamente desde `Reporte > Ver detalle > Exportar PDF`.
- Resultado: 1 página, 7 partidas, 15 piezas, total de $8,487.00.
- Producto 001 y servicio 002 aparecen diferenciados y agrupados.
- Descripción del servicio completa, sin elipsis accidental.
- Sucursales Tricell y WillPharma con cantidades e importes correctos.
- Observaciones reales: `Sin observaciones`.
- Elaboró y Autorizó permanecen vacíos para la OC histórica, sin identidad inventada.
- QR, subtotales, total, footer y `Página 1 / 1` verificados visualmente.

## Responsive

Se verificó el detalle homologado con los datos canónicos de OC-000023 y los estilos reales del módulo:

- 1440 px: matriz completa, sin cortes ni desbordamiento horizontal.
- 820 px: matriz compacta legible.
- 390 px: tarjetas por variante/sucursal, botones apilados y sin scroll horizontal.

## Regresión

- `node --check`: PASS.
- Build MVC: PASS, 0 errores.
- Build API: PASS, 0 errores.
- Pruebas focales OC/PDF: 57/57 PASS.
- Excel de OC-000023 reconciliado: 7 partidas, 15 piezas, $8,487.00, 5 renglones de producto y 2 de servicio.

## Evidencia

- `evidencia/OC-PDF05/OC-000023-reporte.pdf`
- `evidencia/OC-PDF05/OC-000023-reporte-pagina-1.png`
- `evidencia/OC-PDF05/detalle-oc-000023-1440.png`
- `evidencia/OC-PDF05/detalle-oc-000023-820.png`
- `evidencia/OC-PDF05/detalle-oc-000023-390.png`
- `evidencia/OC-PDF05/OC-000023-excel-regresion.xlsx`

## Operación y datos

- Datos modificados: 0.
- Schema/DDL: sin cambios.
- No se realizó backfill.
- Los procesos preexistentes en 5127/5200 no se detuvieron ni reemplazaron.
- La sesión aislada levantada para validar el binario actualizado activó la protección global de sesión por dispositivo; no se confirmó el aviso ni se cerró la sesión del usuario. La evidencia responsive se obtuvo con un harness local determinista alimentado con el detalle canónico real de OC-000023 y el CSS productivo actualizado.

Este ticket no constituye aprobación PO ni estado FROZEN.
