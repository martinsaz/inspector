# #MOKA — Ticket 10: segundo QA del Product Owner

2026-09-07. Alcance: ayudas, agrupamiento/búsqueda de unidades, disponibilidad de personalizadas y claridad de cantidades. No se declara el ticket cerrado.

## Causa reproducida y corrección

Paquete existente del PO: `b5bae753-d0c9-4e43-a21a-e3ac7add6f84`, abreviatura PKG, activa, OTHER. Tanto el endpoint de unidades como el de combos la devolvían correctamente. La reproducción sobre la función original y el dato real muestra que la normalización del alta rápida perdía `tipoUnidad`; el filtro de venta ya no reconocía la unidad como OTHER. Además, la respuesta de alta con id evitaba consultar la metadata completa. La evidencia antes/después está en `reproduccion-paquete.json`.

El alta rápida ahora obtiene el registro autoritativo del endpoint existente, conserva tipo/estado/convertible/factor y actualiza la lista local. Se comprobó creando `QA T10 Refresco 2`: apareció seleccionada en Unidad base y luego en Presentaciones, sin recargar la página, reiniciar servidor ni cambiar sesión. La unidad temporal se dio de baja al terminar. Paquete del PO permanece activa e intacta.

Se incluyen unidades OTHER activas con equivalencia manual también cuando la base es física. En API se ajustaron solamente los dos predicados de admisión manual (alta inicial y guardado individual), conforme a la regla explícita del ticket. No se cambiaron cálculos, factores, tipos, precisión, catálogo ni motor de optimización. Se mantiene el rechazo de magnitudes físicas incompatibles.

## UX y pruebas

- Los cinco botones ? usan apertura por click/tap con una sola instancia visible. Click fuera, otro botón, Escape, cierre del modal y cambio de card limpian la ayuda. Se corrigió también la asociación de los labels para que pulsar el combo no active accidentalmente el botón de ayuda.
- Ambos selectores usan Select2 existente con grupos: Peso, Volumen, Longitud, Área, Por artículo, Tiempo y Otra. Los de venta muestran sólo grupos disponibles por compatibilidad. Nombre y abreviatura aparecen en cada opción; búsqueda por `paq`, `kg` y `lib` comprobada.
- Labels: Cantidad de venta y Cantidad en inventario. Ayudas exactas del segundo QA. No se agregaron campos ni textos permanentes.
- UI: Pieza + Paquete, 1 → 6 pz, $50, editable. Centímetro + Metro, 1 → 100.0000 cm, readonly. Libra + Kilogramo, 1 → 2.2046 lb, readonly.
- API: producto temporal con base Centímetro + Paquete manual admitido al crear y editar (HTTP 200); Metro conserva 100 cm; Kilogramo sobre Centímetro sigue rechazado (HTTP 400).
- Desktop, tablet 820 × 1180 CSS y móvil 390 × 844 CSS: dropdowns dentro de pantalla, búsqueda disponible y listas con scroll. Modal móvil de 556.96 px de alto. El viewport se restauró al terminar. La interacción móvil se comprobó en viewport de Chrome, sin requerir hover; no se ensayó hardware táctil físico.

## Control y limpieza

Un producto y su presentación temporales se dieron de baja mediante SQL de datos limitado por id/empresa/código exactos. La unidad temporal se dio de baja con el endpoint existente. Sin SQL estructural ni migraciones. Conteo final: 2 productos activos y 56 unidades activas. El incremento respecto a las 55 de la iteración anterior corresponde a Paquete creada por el PO antes de esta tarea. Se conservó el total inicial de esta iteración y las 53 Sistema son idénticas al snapshot inicial.

Login/Auth, Firebase, sesión, IVA, Ticket 08, POS e inventario operativo no se modificaron. Los cambios previos del workspace se preservaron. Builds frontend/API sin errores y sintaxis JS/diff válidos. Los puertos 5200 y 5127 se liberaron y se verificó ausencia de listeners antes de entregar.

## Entrega 1–67

| Punto | Validación | Resultado |
|---:|---|---|
| 1 | Sólo uno abierto a la vez | PASS |
| 2 | Click fuera cierra | PASS |
| 3 | Abrir otro cierra anterior | PASS |
| 4 | Escape cierra | PASS |
| 5 | Cerrar modal limpia tooltip | PASS |
| 6 | Touch funciona | PASS — interacción sin hover y comprobación en viewport móvil de Chrome; sin ensayo en dispositivo físico |
| 7 | Agrupado por Tipo | PASS |
| 8 | Peso visible como grupo | PASS |
| 9 | Volumen visible como grupo | PASS |
| 10 | Longitud visible como grupo | PASS |
| 11 | Área visible como grupo | PASS |
| 12 | Por artículo visible como grupo | PASS |
| 13 | Tiempo visible como grupo | PASS |
| 14 | Otra visible como grupo | PASS |
| 15 | Nombre + abreviatura visibles | PASS |
| 16 | Búsqueda preservada | PASS |
| 17 | Paquete existe activo | PASS |
| 18 | Paquete aparece en Unidad Base | PASS |
| 19 | Paquete aparece en Unidad Presentación | PASS |
| 20 | Grupo Paquete = Otra | PASS |
| 21 | Causa de por qué antes no aparecía | El alta rápida devolvía sólo id/nombre y normalizeQuickCatalogComboItem descartaba tipoUnidad y demás metadata. El filtro ITEM/OTHER excluía la unidad local sin tipo. Endpoint y BD sí devolvían Paquete activa como OTHER. |
| 22 | Defecto corregido | PASS |
| 23 | Refresco catálogo después de alta | PASS |
| 24 | Label "Cantidad de venta" | PASS |
| 25 | Label "Cantidad en inventario" | PASS |
| 26 | Unidad Base sólo informativa | PASS |
| 27 | Ayuda manual clara | PASS |
| 28 | Ayuda automática clara | PASS |
| 29 | Sin textos permanentes innecesarios | PASS |
| 30 | 1 Paquete → 6 pz configurable | PASS |
| 31 | Equivalencia manual editable | PASS |
| 32 | Usuario no vuelve a seleccionar Pieza | PASS |
| 33 | 1 m → 100 cm | PASS |
| 34 | Cantidad inventario automática | PASS |
| 35 | Campo bloqueado | PASS |
| 36 | 1 kg → 2.2046 lb | PASS |
| 37 | Desktop | PASS |
| 38 | Tablet | PASS |
| 39 | Móvil | PASS |
| 40 | Combo no sale de pantalla | PASS |
| 41 | Scroll usable | PASS |
| 42 | Catálogo Sistema modificado | NO |
| 43 | Factores modificados | NO |
| 44 | Motor conversiones modificado | NO — fórmulas y factores intactos. Únicamente compatibilidad manual OTHER ampliada conforme a los puntos 5–6 del ticket. |
| 45 | DECIMAL modificado | NO |
| 46 | Login/Auth modificado | NO |
| 47 | IVA modificado | NO |
| 48 | Ticket 08 modificado | NO |
| 49 | POS modificado | NO |
| 50 | Inventario operativo modificado | NO |
| 51 | SQL estructural | NO |
| 52 | Migraciones | NO |
| 53 | Código modificado | Index.cshtml, ProductosServicios.js, ProductosServicios.css y API ProductosServiciosController.cs; documentación en AGENTS.md/CLAUDE.md de ambos repositorios. |
| 54 | Build frontend | PASS — 0 errores; 934 advertencias del proyecto |
| 55 | Build API | PASS — 0 errores; 785 advertencias del proyecto |
| 56 | JS syntax | PASS — node --check y git diff --check en ambos repositorios |
| 57 | Datos QA adicionales creados | Una unidad temporal QA T10 Refresco 2 y un producto QA-T10-PO2-MANUAL con una presentación. No se duplicó Paquete. |
| 58 | Datos QA limpiados | PASS — todos dados de baja; borradores de UI descartados |
| 59 | Productos finales | 2 activos |
| 60 | Unidades activas finales | 56 activas: 53 Sistema + 3 personalizadas legítimas, incluida Paquete del Product Owner. Mismo total que al comenzar. |
| 61 | 5200 funcionando: Sí/No | No al entregar — funcionó durante QA; detenido y puerto 5200 libre por instrucción permanente del PO |
| 62 | 5127 funcionando: Sí/No | No al entregar — funcionó durante QA; detenido y puerto 5127 libre por instrucción permanente del PO |
| 63 | Defectos encontrados | Ayudas acumuladas; label activaba la ayuda al pulsar selector; listas planas y presentación sin búsqueda; metadata perdida tras alta rápida; OTHER excluida con bases físicas; labels Cantidad ambiguos. |
| 64 | Defectos corregidos | Cierre coordinado de ayudas; labels asociados explícitamente; grupos con nombre/abreviatura y búsqueda en ambos combos; refresco con metadata autoritativa; OTHER manual admitida en UI/API; labels y textos de ayuda actualizados. |
| 65 | Pendientes REALES | Siguiente QA visual del Product Owner. No hay pendientes bloqueantes de este alcance. |
| 66 | Evidencias | PNG, reproduccion-paquete.json, api-qa.json, responsive.json, limpieza-final.json, puertos-final.txt y cambios-esta-iteracion.patch en esta carpeta. |
| 67 | Dictamen | TICKET 10 — SEGUNDO QA DEL PRODUCT OWNER CORREGIDO — COMBOS AGRUPADOS, UNIDADES PERSONALIZADAS DISPONIBLES Y UX DE EQUIVALENCIAS SIMPLIFICADA — LISTO PARA SIGUIENTE QA VISUAL. |

## Capturas

- [desktop-busqueda-paquete.png](desktop-busqueda-paquete.png)
- [desktop-grupos.png](desktop-grupos.png)
- [desktop-paquete-6pz.png](desktop-paquete-6pz.png)
- [kg-lb.png](kg-lb.png)
- [metro-cm.png](metro-cm.png)
- [mobile-base-grupos.png](mobile-base-grupos.png)
- [mobile-busqueda-paquete.png](mobile-busqueda-paquete.png)
- [mobile-paquete.png](mobile-paquete.png)
- [mobile-presentacion-grupos.png](mobile-presentacion-grupos.png)
- [refresco-sin-recargar.png](refresco-sin-recargar.png)
- [tablet-base-grupos.png](tablet-base-grupos.png)
- [tablet-presentacion-grupos.png](tablet-presentacion-grupos.png)
