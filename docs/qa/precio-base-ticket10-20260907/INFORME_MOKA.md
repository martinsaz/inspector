# #MOKA — Ticket 10: Precio público y presentación base

Fecha: 2026-09-07. Regla nueva del Product Owner: Precio público representa una unidad base. Sustituye expresamente la regla anterior Precio público = presentación predeterminada elegida.

## Auditoría del caso real

La captura corresponde a un borrador abierto en `Nuevo producto / servicio`: id, nombre, código y categoría estaban vacíos. En esa UI había Costo 80, Precio público 250, Comparación 120 y dos filas Paquete 6/$250 (predeterminada) y Paquete 12/$480. No había Pieza 1/1. Los valores no estaban persistidos. Se documentó el estado antes de recargar; no se confundió con Aceite Motor Sintetico, cuyo precio 680 y presentación base existentes quedaron intactos.

El valor original $100 procede de la confirmación expresa del PO. La causa exacta es la regla anterior implementada en ambos lados: primer borrador predeterminado, copia de su precio al público, normalización del alta desde el predeterminado, y guardado individual con UpdatePrecioPublicoAsync. Además, el alta que recibía presentaciones iniciales omitía generar la base.

Al no existir identidad del producto, se solicitó nombre/código/categoría mientras se corregía el código. Sin respuesta durante el trabajo, se usó la identidad de prueba propuesta y comunicada: **Producto QA T10 Precio base**, código **QA-T10-PRECIO-BASE**, categoría **Alimentos**. ID persistido: `4ffbb00e-d4b3-4199-981d-5714a707b516`. Se conserva activo para continuar el QA solicitado; no es una modificación de un producto comercial anterior.

## Regla y compatibilidad

La UI muestra automáticamente la base al seleccionar la unidad, sin alta manual. El servidor asegura esa fila dentro de la transacción de guardado, reconociéndola por unidad/cantidad/equivalencia 1/1. El precio público actualiza sólo esa fila. Las presentaciones adicionales nunca escriben PrecioPublico. Se eliminó el checkbox y la columna Predeterminada; la base lleva la indicación Base.

La bandera legacy se conserva en SQL/DTO, derivada para la base y falsa para adicionales. La API ignora que un cliente marque un paquete como predeterminado. Las protecciones de edición/baja se basan en la estructura de la fila base. No hay consumidores de la bandera en el POS o motor actuales, ni se inventa una regla para un POS futuro. No hubo migraciones, SQL estructural ni borrado de columnas.

## Configuración final verificada

| Venta | Inventario | Precio |
|---|---|---:|
| 1 Pieza — Base | 1 pz | $100 |
| 1 Paquete | 6 pz | $250 |
| 1 Paquete | 12 pz | $480 |

Costo $80; comparación $120; ganancia $20.00; margen 20.00%.

QA UI: base aparece antes de agregar paquetes; los paquetes no cambian el público; Guardar, F5, Editar, público 100→110, Guardar, restauración a 100, Guardar y otro F5/Editar mantienen exactamente tres filas. El cambio 110 sólo afecta a Pieza. QA API: paquetes 250→260 y 480→500 con bandera legacy true conservan público 100; se restauraron a 250/480. Edición directa de base, alta manual duplicada y baja de base rechazadas HTTP 400 sin cambios.

No se modificaron unidad base, equivalencias 6/12, catálogo, conversiones, factores, IVA, Login/Auth, Ticket 08, POS ni inventario operativo. No se eliminó el registro restaurado: queda disponible para el PO. El producto comercial previo se comparó con el snapshot inicial y permaneció idéntico.

Los servicios funcionaron durante las pruebas y se detuvieron al terminar. `lsof` confirmó ausencia de listeners en 5200 y 5127.

## Entrega 1–45

| Punto | Validación | Resultado |
|---:|---|---|
| 1 | Precio Público antes del defecto | $100, confirmado por el PO; no hay registro persistido de ese borrador previo. |
| 2 | Precio Público persistido actualmente | Al auditar no existía producto persistido correspondiente: id/nombre/código/categoría vacíos en Nuevo. $250 estaba sólo en la UI. Tras restaurar y guardar: $100. |
| 3 | Causa exacta del cambio $100 → $250 | Frontend marcaba la primera presentación como predeterminada y copiaba su precio al público en saveDraftPresentation/syncPublicPriceWithPresentations. API replicaba esa regla al normalizar altas y guardar presentaciones. |
| 4 | Presentación que provocó la sincronización | Borrador 1 Paquete / 6 pz / $250, marcado predeterminado automáticamente. |
| 5 | Presentación base Pieza existía | No en el borrador del PO. |
| 6 | Motivo por el que no aparece | No se generaba base en el frontend; en el alta con presentaciones iniciales el backend omitía EnsureAndSynchronizeDefaultPresentationAsync y aceptaba el paquete como fuente de PrecioPublico. |
| 7 | Precio Público vuelve a representar Unidad Base | PASS |
| 8 | Presentación base automática | PASS |
| 9 | 1 Pieza → 1 pz → $100 | PASS |
| 10 | 1 Paquete → 6 pz → $250 | PASS |
| 11 | 1 Paquete → 12 pz → $480 | PASS |
| 12 | Paquetes ya no modifican Precio Público | PASS |
| 13 | Precio Público actualiza únicamente presentación base | PASS |
| 14 | Costo $80 | PASS |
| 15 | Precio Público $100 | PASS |
| 16 | Ganancia $20 | PASS |
| 17 | Margen 20% | PASS |
| 18 | Guardar | PASS |
| 19 | F5 | PASS |
| 20 | Reabrir | PASS |
| 21 | Configuración permanece correcta | PASS |
| 22 | Uso actual auditado | Sólo selección/sincronización del precio, protección de baja y orden en ProductosServicios. No se encontró un consumidor externo. |
| 23 | Consumidores encontrados | ProductosServicios.js, API ProductosServiciosController.cs y DTO/request ProductosServiciosModels.cs. No hay consumidor de la bandera en POS ni en el motor de cálculo actual. |
| 24 | Regla final aplicada | PrecioPublico es fuente única de la base estructural: idUnidadVenta = idUnidadMedida, CantidadVenta = 1, EquivalenciaBase = 1. Adicionales con precios independientes. Campo legacy derivado exclusivamente para la base; input de clientes no puede elegir un paquete como fuente. |
| 25 | Predeterminada sigue siendo necesaria | No como elección funcional del usuario. Se conserva el campo interno por compatibilidad, sin selector en UI. |
| 26 | Justificación | No inventar un uso futuro de POS ni borrar columna/contrato. La base se reconoce por su estructura, no por una bandera histórica de paquete. |
| 27 | Unidad Base modificada | NO |
| 28 | Conversiones modificadas | NO |
| 29 | Catálogo Unidades modificado | NO |
| 30 | IVA modificado | NO |
| 31 | Ticket 08 modificado | NO |
| 32 | POS modificado | NO |
| 33 | Inventario operativo modificado | NO |
| 34 | Login/Auth modificado | NO |
| 35 | SQL estructural ejecutado | NO |
| 36 | Código modificado | Index.cshtml; ProductosServicios.js; API ProductosServiciosController.cs. Documentación AGENTS.md/CLAUDE.md en ambos repositorios. |
| 37 | Build frontend | PASS — 0 errores, 934 advertencias del proyecto |
| 38 | Build API | PASS — 0 errores, 785 advertencias del proyecto |
| 39 | 5200 funcionando | No al entregar: funcionó durante QA; detenido, puerto libre por instrucción permanente del PO. |
| 40 | 5127 funcionando | No al entregar: funcionó durante QA; detenido, puerto libre por instrucción permanente del PO. |
| 41 | Defectos encontrados | Precio de paquete sobrescribía público; faltaba base en borrador/alta inicial; público quedaba readonly; sincronización backend dependía de bandera y actualizaba paquete; edición de borradores perdía id y podía duplicar fila. |
| 42 | Defectos corregidos | Base automática y única en UI/persistencia; precio público editable y fuente unidireccional; paquetes independientes; flag externo ignorado; base protegida contra edición directa, baja o duplicación; edición de borrador conserva su id. |
| 43 | Pendientes REALES | Sin pendientes bloqueantes de este defecto. Continúa el aviso preexistente de protección de Unidad base al cargar/resetear un producto con presentaciones; se cerró para QA y no se alteró esa protección fuera de alcance. El PO puede asignar identidad comercial al registro de prueba. |
| 44 | Evidencias | borrador-po-antes.png, precio-base-restaurado.png, ui-final.json, restauracion-final.json, api-qa.json, precio-110-verificado.json y cambios-esta-iteracion.patch. |
| 45 | Dictamen | PRECIO PÚBLICO RESTAURADO COMO PRECIO DE LA UNIDAD BASE — PRESENTACIONES ADICIONALES CON PRECIOS INDEPENDIENTES — LISTO PARA CONTINUAR QA DEL PRODUCT OWNER. |
