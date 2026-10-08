# MOKA OC-QA07R — STOP QA / Recertificación visual real patrón CheckApp

Fecha: 2026-10-07  
Estado: IMPLEMENTADO / RECERTIFICACIÓN RUNTIME PASS / PENDIENTE QA MANUAL DENISSE  
No es aprobación PO ni congelamiento.

## Inconsistencia del reporte anterior

El reporte OC-QA07 declaró verdes los estados completados, pero la evidencia física posterior mostró gris. La lógica sí aplicaba `is-completed` al stepper e `is-complete` a los badges; el defecto real estaba en CSS: ambos selectores usaban `--ca-secondary`, cuyo valor CheckApp es gris (`#6B7280`). La validación anterior comprobó texto y clases, pero no inspeccionó color computado ni contraste físico. Ese dictamen visual queda sustituido por esta recertificación.

## Corrección exacta

Único archivo productivo modificado por OC-QA07R:

- `checklist/wwwroot/css/Activos/OrdenesCompra/OrdenesCompra.css`

Los estados completados ahora usan `--ca-success` (`#16A34A`) en borde, círculo, texto y fondo sutil. No se cambió JavaScript, MVC, API, contrato, schema, datos de negocio, proveedores ni reglas de transición.

## Matriz física obligatoria

| Estado | Resultado | Evidencia computada |
|---|---|---|
| A. Sin proveedor | Paso 1 `Pendiente`; Paso 2 `Bloqueado`; sin verde | PASS |
| B. Proveedor válido | Badge y stepper Paso 1 `Completo` verdes; Paso 2 `Pendiente` | `rgb(22, 163, 74)` |
| C. Una sucursal | Badges y steppers Pasos 1–2 `Completo` verdes; Paso 3 `Pendiente` | `rgb(22, 163, 74)` |
| D. Preparación colapsada | Resumen visible; verdes de Pasos 1–2 preservados | PASS |
| E. Preparación reabierta | Editor visible; badges verdes preservados | PASS |
| F. Última sucursal retirada | Paso 2 vuelve a `Pendiente`; clase/color verde retirados | PASS |

No se usó verde para activo, pendiente, bloqueado ni error.

## Legacy vs CheckApp

- Paso 1: proveedor, folio, fechas y opciones equivalentes; completitud visual corregida a verde CheckApp.
- Paso 2: multiselección, chips, retiro/reincorporación y resumen equivalentes; dos sucursales reales certificadas.
- Paso 3: búsqueda `00`, 2 resultados reales; Producto/Servicio con atributos permitidos y selección directa.
- Paso 4: captura física de Servicio para Blue Umbrella y Neo-Umbrella, una unidad y $500.00 por sucursal.
- Paso 5: 2 renglones, 2 piezas, subtotal/total $1,000.00; guardado, generado, PDF y Excel PASS.

OC QA `4a0aab72-4fed-4026-83c1-44f06459b7d1`: creada por la corrida, generada y cancelada mediante el mecanismo oficial con motivo `Cleanup QA OC-QA07R`. No quedó orden QA activa.

## Responsive físico autenticado

| Viewport | innerWidth | clientWidth | bodyScrollWidth | Verdes visibles | Overflow global |
|---:|---:|---:|---:|---|---|
| 1440 | 1440 | 1440 | 1440 | Sí | No |
| 820 | 820 | 820 | 820 | Sí | No |
| 390 | 390 | 390 | 390 | Sí | No |

## Regresión

- Build MVC: PASS, 0 errores (advertencias históricas de paquetes).
- Build API: PASS, 0 errores (sin cambios API en OC-QA07R).
- JavaScript `node --check`: PASS.
- Focal OC: 45/45 PASS.
- `git diff --check` MVC/API: PASS.
- Validación runtime de color computado: PASS, `rgb(22, 163, 74)` para stepper y badges completados.

## Alcance preservado

- API, schema, contratos OC V5/Recepción V2, Legacy, ProductosServicios, ListaPrecios, Curvas, Siembra, Auth y módulos ajenos: sin cambios por OC-QA07R.
- Inventos detectados: 0.
- Diferencias no autorizadas: 0.
- Datos legítimos modificados: 0; la única OC QA quedó cancelada y trazable.
- Puertos 5127/5200: servicios preexistentes de la sesión de QA, no liberados por esta corrección.

## Siguiente paso

QA MANUAL DENISSE. No declarar aprobado PO ni FROZEN.
