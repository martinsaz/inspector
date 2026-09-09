# #MOKA — Información general: acomodo puntual

2026-09-07. Cambio limitado al orden de Código en Razor y a la distribución desktop del grid de Información general. Sin modificaciones de JS, API, controles, validaciones ni datos.

Se movió el bloque intacto de Código inmediatamente después de Nombre, conservando atributos y ajustando el orden de tabulación sólo por ese movimiento. El grid conserva las alturas anteriores de las filas. No se alteraron reglas responsive existentes; se comprobó reflow sin overflow en tablet y móvil.

## Comparación en aplicación real

Medidas desktop antes/después en `antes.json` y `despues.json`:

- Código conserva 282.44 px de ancho y sube a la fila de Nombre.
- Nombre pasa de 866.82 a 574.63 px: cede exactamente el ancho de Código y el espacio entre ambos.
- Tipo y Estatus pasan de 282.44 a 428.54 px cada uno; cubren toda la fila sin hueco.
- Descripción/editor, Categoría, Marca, Colección, Imagen, Etiquetas, encabezado y grid de Precios: diferencias de posición y tamaño exactamente 0 px.
- Tablet y móvil: campos visibles, reflow y ausencia de overflow horizontal. Viewport restaurado.
- No se guardó ningún producto ni se ejecutó SQL manual. No se crearon datos QA.

## Entrega 1–24

| Punto | Validación | Resultado |
|---:|---|---|
| 1 | Código movido junto a Nombre | PASS |
| 2 | Nombre reducido sólo lo necesario | PASS |
| 3 | Código eliminado de fila Tipo/Estatus | PASS |
| 4 | Tipo ampliado | PASS |
| 5 | Estatus ampliado | PASS |
| 6 | Hueco anterior de Código eliminado | PASS |
| 7 | Descripción intacta | PASS |
| 8 | Categoría intacta | PASS |
| 9 | Marca intacta | PASS |
| 10 | Colección intacta | PASS |
| 11 | Imagen intacta | PASS |
| 12 | Etiquetas intactas | PASS |
| 13 | Precios y Costos modificado | NO |
| 14 | Presentaciones modificadas | NO |
| 15 | Unidades modificadas | NO |
| 16 | Lógica/validaciones modificadas | NO |
| 17 | SQL ejecutado | NO — sin SQL manual ni escrituras de datos |
| 18 | Migraciones | NO |
| 19 | Archivos modificados | Código: checklist/Views/ProductosServicios/Index.cshtml y checklist/wwwroot/css/ProductosServicios/ProductosServicios.css. Evidencia e informe en esta carpeta. |
| 20 | Build | PASS — frontend, 0 errores; 934 advertencias existentes del proyecto. Diff check PASS. |
| 21 | 5200 funcionando | Funcionó durante QA; detenido al entregar, puerto libre. |
| 22 | 5127 funcionando | Funcionó durante QA; detenido al entregar, puerto libre. |
| 23 | Evidencia | antes.png, despues.png, tablet.png, movil.png, antes.json, despues.json y cambios.patch. |
| 24 | Dictamen | INFORMACIÓN GENERAL — ACOMODO NOMBRE/CÓDIGO Y TIPO/ESTATUS COMPLETADO — SIN CAMBIOS FUERA DEL ALCANCE. |

[Antes](antes.png) · [Después](despues.png) · [Tablet](tablet.png) · [Móvil](movil.png)
