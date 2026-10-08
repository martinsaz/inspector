# MOKA OC-QA07 — Corrección QA PO Nueva Orden de Compra

Fecha: 2026-10-07  
Estado: IMPLEMENTADO / QA RUNTIME PASS / PENDIENTE QA MANUAL DENISSE  
No es aprobación PO ni congelamiento.

## Resultado

La Nueva OC conserva la secuencia funcional de Legacy y aplica el patrón visual CheckApp V1. Los pasos 1 y 2 completan con proveedor y una sucursal respectivamente, cambian a verde y, al iniciar la búsqueda, se compactan en el resumen Legacy-equivalente con proveedor, sucursales, fechas, chips y `Editar preparación`. La edición conserva los valores y vuelve a compactarse al continuar.

Las tarjetas de búsqueda son completamente seleccionables mediante clic, teclado o tap. No contienen botones de selección ni costo. Producto muestra únicamente atributos reales disponibles; Servicio omite unidad, variante, presentación e información de inventario. La tarjeta abre directamente la captura por sucursal.

## Matriz de no inventos

| Elemento | Legacy | CheckApp | Autorización PO | Resultado |
|---|---|---|---|---|
| Pasos 1–2 verdes | Sí | Sí | Regla B | PASS |
| Resumen de preparación | Sí | Sí | Regla C | PASS |
| Editar preparación | Sí | Sí | Regla C | PASS |
| Filtro por proveedor | Sí | Sí | Regla D | PASS |
| Card completa seleccionable | Sí | Sí | Regla E2 | PASS |
| Botón Seleccionar | No | No | Prohibido E2 | PASS |
| Costo en card | No | No | Prohibido E3 | PASS |
| Producto/Servicio | Adaptado | Sí | Adaptación autorizada | PASS |
| Variante/PresentaciónCompra | Adaptado | Datos reales | Adaptación autorizada | PASS |
| Modos Manual/Pedido inicial/Rellenar curva/No pedir | Sí | Sí | Regla G | PASS |
| Métricas de curva | Sí | Siete métricas autorizadas | Regla G | PASS |
| Operación mixta/multisucursal | Adaptado | Sí | Adaptación autorizada | PASS |

## Evidencia funcional autenticada

- Cuenta QA autorizada, empresa UMBRELLA y modo Administración.
- Proveedor: Liverpool (`19b44327-2b2a-4101-be33-22f1f3fbed6b`).
- Sucursales: Sede Central y Tricell; retiro y reincorporación del chip PASS.
- Búsqueda `00`, filtro ON: 0 resultados vinculados a Liverpool.
- Búsqueda `00`, filtro OFF: 2 resultados exactos, Producto `001` Aceite Motor Sintetico y Servicio `002` Cambio de Aceite; alternancia sin duplicados ni selección fantasma.
- Producto: categoría Alimentos, marca Mobil 1, unidad Pieza (pz), variantes 946 ml/5 L/10 L/20 L; sin costo en card y sin presentación real configurada, por lo que se usó Base directa.
- Servicio: categoría Mantenimiento; sin unidad, variante, PresentacionCompra, curvas ni métricas de inventario.
- Modal Producto: 2 sucursales × 4 variantes, cuatro modos autorizados y siete métricas; preview oficial read-only PASS.
- Modal Servicio: 2 sucursales, sin modos de curva, métricas ni unidad.
- OC mixta: 4 renglones, 5 piezas, total $1,597.00; edición de cantidad, eliminación y reincorporación PASS.
- Borrador `405da8fe-0db3-4f31-9adf-a581a78522e7`: guardado, F5 y reapertura PASS; generación PASS; estado generado inmutable; cleanup oficial mediante cancelación con motivo `Cleanup QA OC-QA07` PASS.

## Responsive físico autenticado

| Viewport | innerWidth | clientWidth | bodyScrollWidth | Overflow global |
|---:|---:|---:|---:|---|
| 1440 | 1440 | 1440 | 1440 | No |
| 820 | 820 | 820 | 820 | No |
| 390 | 390 | 390 | 390 | No |

## Regresión

- Build MVC: PASS, 0 errores.
- Build API: PASS, 0 errores.
- JavaScript `node --check`: PASS.
- Focal OC: 45/45 PASS.
- Suite API global: 889/890; la única falla es `ListaPreciosMatrixSqlIntegrationTests.ConsultaMatricialReal_MaterializaTodasLasIdentidadesYDiezNiveles`, causada por el estado real de datos LP (esperaba ausencia y obtuvo `550/0`). Es ajena a Nueva OC y no se modificó ListaPrecios.
- `git diff --check` de archivos del ticket: PASS.

## Alcance preservado

- ProductosServicios usado sólo como referencia visual; no modificado.
- Legacy, ListaPrecios, Curvas funcional, Siembra, Recepción, Login/Firebase/Session, schema, migraciones, OC V5 y Recepción V2 permanecen sin cambios.
- Datos legítimos modificados: 0. La única escritura fue la OC QA trazable, posteriormente generada y cancelada por el mecanismo oficial.
- Inventos detectados: 0.
- Diferencias no autorizadas: 0.
- Bloqueos: 0.

## Siguiente paso

QA MANUAL DENISSE. No declarar aprobado PO ni FROZEN.
