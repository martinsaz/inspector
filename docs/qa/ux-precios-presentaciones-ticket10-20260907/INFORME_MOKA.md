# #MOKA — Ticket 10: precios y presentaciones

Fecha: 2026-09-07. Corrección acotada al QA del Product Owner; el ticket no se declara cerrado.

Se quitaron las ayudas permanentes, el Nombre capturado y su columna. La identificación visible es cantidad + unidad de venta. La equivalencia muestra cantidad y sufijo automático de la unidad base; las ayudas abren por click/tap. El servidor deriva el Nombre legacy del catálogo, con su límite existente de 100 caracteres, tanto en presentaciones iniciales como en altas/ediciones individuales. No se borran columnas ni se reescriben registros históricos.

Las fórmulas de conversión, factores y reglas de precio quedan intactos. Se conserva el mismo cálculo de vista previa; al guardar, la API continúa calculando el valor definitivo. En reapertura se restablece el modo readonly para unidades físicas.

## Evidencia funcional

- UI `+ Nuevo`: Pieza → Sixpack QA T10, cantidad 1, equivalencia manual 6 pz, precio $50; producto guardado y reabierto correctamente. Sin captura de Nombre ni segundo selector de base.
- UI `+ Nuevo`: Centímetro → Metro, cantidad 1, resultado 100.0000 cm readonly.
- UI `+ Nuevo`: Libra → Kilogramo, cantidad 1, resultado 2.2046 lb readonly. Reabrir borrador conserva readonly.
- API: altas de dos productos con presentaciones iniciales sin Nombre y edición individual sin Nombre: HTTP 200. Nombre persistido Metro/Kilogramo. Precio de predeterminada editado a $55, precio público confirmado $55.
- Las cuatro ayudas se probaron por click; las de precio, equivalencia y predeterminada también en viewport móvil. Textos exactos del ticket, con ayuda dinámica para automático/manual.
- Tabla persistida: `1 Sixpack QA T10 | 6 pz | $50.00 | Sí | Editar`.

## Medidas responsive

| Viewport CSS | Categoría | Unidad base | Modal | Overflow horizontal |
|---|---:|---:|---|---|
| Desktop 1890 px | 282.44 px | 282.44 px | Compacto, todos los controles visibles | No |
| Tablet 820 px | 362.28 px | 362.28 px | 500 × 515.64 px | No |
| Móvil 390 px | 322.72 px | 322.72 px | 378.01 × 557.31 px | No |

La referencia se toma del elemento real de Categoría, incluyendo el botón + adyacente, mediante ResizeObserver; no se inventa una anchura fija. Se restauró el viewport del navegador al terminar.

## Control de alcance y limpieza

Tres productos QA independientes, sin cambiar la unidad base de productos persistidos. Se dieron de baja por IDs y códigos exactos, junto con sus presentaciones. Sixpack QA T10 se dio de baja mediante el endpoint existente. Conteo final: 2 productos de trabajo, 55 unidades activas, 0 productos/presentaciones de esta QA activos. Comparación del catálogo antes/después: las 53 unidades Sistema son idénticas. Sin migraciones ni SQL estructural; SQL de limpieza limitado a fixtures autorizados.

No se modificaron Login/Auth, Firebase, sesión, usuarios/empresas/roles, IVA, Ticket 08, POS ni inventario operativo. Los cambios anteriores del workspace se preservaron. El patch adjunto contiene sólo las diferencias de código de esta iteración.

Observación fuera de alcance: al abrir un producto existente con presentaciones se mostró el aviso preexistente «No puedes cambiar la unidad base», aun sin solicitar un cambio. Tras cerrar el aviso, la presentación reabre y se verifica correctamente. Se conserva la protección; no se altera en este ajuste UX. No impide los casos solicitados de `+ Nuevo`.

## Entrega 1–67

| Punto | Validación | Resultado |
|---:|---|---|
| 1 | Unidad Base texto permanente eliminado | PASS |
| 2 | Unidad Base ? implementado | PASS |
| 3 | Texto ayuda correcto | PASS |
| 4 | Unidad Base mismo ancho que catálogo de Información general | PASS |
| 5 | Precio Público texto permanente eliminado | PASS |
| 6 | Precio Público ? implementado | PASS |
| 7 | Texto ayuda correcto | PASS |
| 8 | Aire reducido en primera fila | PASS |
| 9 | Campo Nombre eliminado | PASS |
| 10 | Usuario ya no captura Nombre | PASS |
| 11 | Backend compatible sin captura Nombre | PASS |
| 12 | Venta comienza con Cantidad + Unidad | PASS |
| 13 | No existe espacio residual de Nombre | PASS |
| 14 | Selector Unidad de inventario eliminado | PASS |
| 15 | Campo/label confuso "Unidades de inventario..." eliminado | PASS |
| 16 | Sólo se captura/muestra Cantidad equivalente | PASS |
| 17 | Unidad Base se muestra como sufijo informativo | PASS |
| 18 | Línea "Unidad base:" eliminada | PASS |
| 19 | Texto "Selecciona una unidad..." eliminado | PASS |
| 20 | Ayuda ? implementada | PASS |
| 21 | Conversión automática no genera texto permanente | PASS |
| 22 | Equivalencia manual no genera texto permanente | PASS |
| 23 | Texto permanente eliminado | PASS |
| 24 | Ayuda ? implementada | PASS |
| 25 | Columna Presentación redundante eliminada | PASS |
| 26 | Venta identifica correctamente la presentación | PASS |
| 27 | Equivale en inventario claro | PASS |
| 28 | Precio intacto | PASS |
| 29 | Predeterminada intacta | PASS |
| 30 | Pieza + Sixpack: 1 Sixpack → 6 pz | PASS |
| 31 | Sin Nombre manual | PASS |
| 32 | Sin selector adicional de Pieza | PASS |
| 33 | Centímetro + Metro: 1 m → 100 cm | PASS |
| 34 | Resultado automático bloqueado | PASS |
| 35 | Libra + Kilogramo: 1 kg → 2.2046 lb | PASS |
| 36 | Modal claramente más compacto | PASS |
| 37 | Sin aire innecesario | PASS |
| 38 | Sin contenedores vacíos | PASS |
| 39 | Footer compacto | PASS |
| 40 | Desktop | PASS |
| 41 | Tablet | PASS |
| 42 | Móvil | PASS |
| 43 | Overflow horizontal | NO — sin overflow en card, modal y tabla móvil |
| 44 | Catálogo Unidades modificado | NO |
| 45 | Motor conversiones modificado | NO |
| 46 | Factores modificados | NO |
| 47 | Login/Auth modificado | NO |
| 48 | IVA modificado | NO |
| 49 | Ticket 08 modificado | NO |
| 50 | POS modificado | NO |
| 51 | Inventario operativo modificado | NO |
| 52 | SQL estructural ejecutado | NO |
| 53 | Migraciones | NO |
| 54 | Código modificado | Index.cshtml; ProductosServicios.js; ProductosServicios.css; API ProductosServiciosController.cs. Documentación AGENTS.md / CLAUDE.md en ambos repositorios. |
| 55 | Build frontend | PASS — 0 errores, 934 advertencias del proyecto |
| 56 | Build API | PASS — 0 errores, 785 advertencias del proyecto |
| 57 | JS syntax | PASS — node --check; diff --check en ambos repositorios |
| 58 | Datos QA limpiados | PASS — baja lógica de los 3 productos y todas sus presentaciones; baja de Sixpack QA T10 mediante API |
| 59 | Productos finales = 2 | PASS — 2 activos |
| 60 | Unidades finales = 55 | PASS — 55 activas (53 Sistema + 2 personalizadas legítimas) |
| 61 | 5200 funcionando | Sí — proceso local 90901 |
| 62 | 5127 funcionando | Sí — proceso local 91004 |
| 63 | Defectos encontrados | Los señalados por PO: ayudas fijas, ancho reducido, Nombre redundante, equivalencia verbosa, modal alto y columna duplicada. Durante QA: faltaba metadata de unidad en borradores y faltaba restablecer readonly al reabrir; corregidos. Aviso preexistente de protección al abrir un producto con presentaciones, descrito abajo. |
| 64 | Defectos corregidos | UX solicitada; compatibilidad de Nombre derivado en altas y ediciones; unidad visible en tabla de borradores; readonly automático al reabrir; ancho exacto también en tablet. |
| 65 | Pendientes REALES | Segundo QA visual del Product Owner. Sin pendientes bloqueantes de esta corrección. Aviso preexistente de unidad base fuera de alcance, sin modificar su protección. |
| 66 | Evidencias | Capturas PNG, api-qa.json, responsive.json, limpieza-final.json y cambios-esta-iteracion.patch en esta carpeta. |
| 67 | Dictamen | TICKET 10 — UX DE PRECIOS Y PRESENTACIONES SIMPLIFICADA SEGÚN QA DEL PRODUCT OWNER — LISTO PARA SEGUNDO QA VISUAL. |

## Capturas

- [desktop-kg-lb.png](desktop-kg-lb.png)
- [desktop-metro-cm.png](desktop-metro-cm.png)
- [desktop-pricing.png](desktop-pricing.png)
- [desktop-sixpack-edit.png](desktop-sixpack-edit.png)
- [desktop-sixpack.png](desktop-sixpack.png)
- [mobile-modal.png](mobile-modal.png)
- [mobile-pricing.png](mobile-pricing.png)
- [tablet-modal.png](tablet-modal.png)
- [tablet-pricing.png](tablet-pricing.png)
