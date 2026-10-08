# OC-QA09 — Corrección final Paso 3 y modal de captura

Fecha: 2026-10-07  
Estado: `IMPLEMENTACIÓN TÉCNICA PASS / QA RUNTIME FÍSICA PASS / LISTO PARA QA MANUAL DENISSE`

## Alcance ejecutado

- Pasos 1 y 2: sin cambios atribuibles a OC-QA09 (`PASO_1_MODIFICADO=0`, `PASO_2_MODIFICADO=0`). El árbol ya contenía cambios acumulados de tickets anteriores; la edición OC-QA09 se limitó al Paso 4/modal, proxy MVC y contrato de preview de Curvas.
- Paso 3 conserva búsqueda automática, card completa seleccionable, Producto/Servicio, variantes y PresentacionCompra, sin costo en resultados.
- El modal de Producto quedó jerarquizado Producto → Sucursal → configuración/resumen/grid.
- La leyenda distingue curva configurada, captura manual, pendiente y no pedir, e informa que una curva manual sólo aplica a la orden actual.
- “Aplicar modo a todas las sucursales” usa `Swal.fire`, con Aplicar/Cancelar y mensaje dinámico; no usa `window.confirm`.
- Sucursal sin curva expone selector de curvas aplicables, Aplicar curva, Captura manual, Captura manual y limpiar, No pedir, cuatro modos, Cantidad base e Iguales en esta sucursal.
- La curva temporal viaja como `idCurvaTemporal`; la API valida producto/variante/estado y calcula preview sin escribir Catálogo ni Siembra.
- La grilla usa identidad Variante/PresentacionCompra, métricas reales, controles `− / cantidad / +`, costo informativo no editable y Base directa sin selector cuando no hay PresentacionCompra.
- Estados visuales diferenciados: Sin curva, Curva configurada, Hueco, Copete y No pedir. Los checks usan el rojo primario CheckApp.
- Servicio conserva captura simple sin curva, inventario, variante o presentación ficticia.

## Auditoría Legacy read-only

Se reabrió físicamente `https://tarahumara.app/almacen/compras/crear-orden` con el artículo 501. Se verificó:

- ESTEBAN ALATORRE sin curva, selector/acciones, modos, Cantidad base, Iguales en esta tienda, métricas y seis tallas.
- ALTACIA con `CurvasTienda`: objetivo 24, existencia -1, tránsito 54, huecos 0, copetes 29 y 24 piezas propuestas/finales.
- La intención de los dos niveles se preserva: las acciones de curva resuelven/configuran la sucursal para la captura; los modos determinan el cálculo del pedido. Ninguna de ambas persiste configuración permanente.

## Verificación automatizada

- `node --check checklist/wwwroot/js/Activos/OrdenesCompra/OrdenesCompra.js`: PASS.
- Focal Curvas + fuente OC-QA09: `28/28` PASS.
- Suite completa: `892/893` PASS; único fallo `ListaPreciosMatrixSqlIntegrationTests.ConsultaMatricialReal_MaterializaTodasLasIdentidadesYDiezNiveles`, preexistente, conocido y fuera de alcance.
- Build API/MVC: PASS como parte de las corridas anteriores.
- `git diff --check` MVC/API: PASS.
- ListaPrecios, Auth/Login, schema OC V5/Recepción V2, Catálogo/Siembra y Legacy: no modificados por OC-QA09.

## Cierre físico CheckApp

La sesión QA autorizada se restableció por el Login normal, sin bypass ni cambios a Auth. La matriz A–T quedó ejecutada físicamente:

- filtro de proveedor ON/OFF/ON, Producto, Servicio, Variantes, PresentacionCompra y multisucursal: PASS;
- OC mixta y modal completo: PASS;
- curva configurada, sin curva, curva temporal parcial, Manual, Pedido inicial, Rellenar curva y No pedir: PASS;
- aplicar modo global con `Swal`, selector/acciones de curva, Iguales en esta sucursal y Cantidad base: PASS;
- métricas, grid por variante/presentación, checks rojos, costo no editable, steppers y estados: PASS;
- borrador, F5, generación e inmutabilidad: PASS;
- PDF de cuatro páginas y Excel con diez partidas: contenido PASS; el layout de impresión por defecto de Excel reparte las 18 columnas en cinco páginas, observación visual no bloqueante;
- responsive físico `1440/820/390`: PASS sin overflow global (el navegador reportó DPR 0.8 durante la medición);
- OC QA generada: `OC-000060`, 10 renglones, 15 piezas, total `$10,488.00`;
- consola: 0 errores/warnings.

Durante runtime se corrigió un defecto real: una curva temporal parcial abortaba el preview cuando no contenía todas las variantes. El motor ahora prioriza la variante exacta, acepta detalle de producto como fallback y deja en captura manual las variantes no definidas, sin persistir Catálogo ni Siembra.

El cleanup oficial inicial dejó `OC-000060` cancelada con auditoría. Después, por la autorización PO específica `OC-QA09-CLEAN`, se descartó todo el histórico OC del tenant UMBRELLA dentro de una transacción controlada: 55 cabeceras, 134 detalles y 68 destinos quedaron en cero, sin recepciones ni afectación de inventario. Expediente: `OC_QA09_CLEAN_LIMPIEZA_TOTAL_BASELINE_20261007.md`.

No se declara aprobado PO ni FROZEN. El resultado queda listo para QA manual de Denisse desde baseline limpio.
