# OC-QA01 — Paridad real de Nueva Orden de Compra

> **RECHAZADO / SUPERSEDED por OC-QA02 (2026-10-06).** La QA manual Denisse rechazó esta entrega porque, aunque recuperó cinco nombres de etapa, mantuvo una navegación por paneles separados que ocultaba pasos y datos previos, no reprodujo la pantalla continua Legacy y omitió controles operativos como folio personal, filtro real por proveedor y preparación editable/plegable. Este documento se conserva únicamente como evidencia histórica; no es el contrato vigente. El resultado correctivo está en `OC_QA02_RECONSTRUCCION_ESTRICTA_NUEVA_OC_20261006.md`.

Fecha: 2026-10-06  
Estado PO de entrada: `QA MANUAL DENISSE RECHAZADA`  
Alcance único: `/Activos/OrdenesCompra/Nueva`

## Fuentes auditadas

- Legacy físico read-only: `https://tarahumara.app/almacen/compras/crear-orden`.
- Legacy código read-only: `/Users/denissemendiola/dev/Raramuri.blzr` y `/Users/denissemendiola/dev/sazapi`.
- CheckApp físico autenticado: UMBRELLA 163, MVC `5200`, API `5127`.
- Se preservaron sin cambios funcionales ListaPrecios, ProductosServicios, Recepción, Curvas, Siembra, Huecos/Copetes, Inventario, Auth y Legacy.

## Matriz de paridad

| Elemento | Legacy | CheckApp antes | Paridad antes | Acción OC-QA01 |
|---|---|---|---|---|
| Número de pasos | 5 | 4 | No | Se restauraron 5 etapas. |
| 1. Configuración | Proveedor, fechas, observaciones y folio opcional | Mezclaba empresa/sucursal/proveedor | Parcial | Proveedor, fechas y observaciones permanecen en el paso 1; folio continúa server-side por contrato seguro CheckApp. |
| 2. Tiendas destino | Selección múltiple | Empresa/sucursal en Configuración | No | Paso 2 `Sucursal destino`, una sola sucursal conforme al contrato aprobado. |
| 3. Producto | Búsqueda y selección antes de tallas | Variante/presentación dentro de resultados y alta inmediata | No | Paso 3 sólo busca y selecciona Producto/Servicio. |
| 4. Tallas | Modal posterior al producto con cantidad/costo | No existía etapa equivalente independiente | No | Paso 4 `Captura`: Variante/PresentacionCompra cuando aplica, cantidad, costo, unidad y factor. Servicios muestran `No aplica`. |
| 5. Partidas / Guardar | Renglones editables y guardado final | Partidas en paso 3 y revisión inventada en paso 4 | No | Paso 5 reúne renglones editables, totales, guardar borrador y generar. |
| Navegación y bloqueo | Dependencias secuenciales y regreso | Flujo de cuatro pasos | Parcial | Se alinearon habilitación, bloqueo y regreso en cinco etapas. |
| Resumen lateral | Ausente | Cards de folio/estado/total/avance | No autorizado | Eliminado. |
| Barra de avance | Ausente | Barra y porcentaje | No autorizado | Eliminada. |
| Revisión independiente | Ausente | Paso `Revisar y guardar` | No autorizado | Eliminado. |
| PresentacionCompra | No corresponde al modelo Legacy | Existía inline en búsqueda | Adaptación autorizada | Conservada dentro de Captura, después de seleccionar producto. |
| Servicio y OC mixta | No aplican al Legacy de producto | Contrato CheckApp aprobado | Adaptación autorizada | Conservados sin forzar Variante/PresentacionCompra. |

## Auditoría física Legacy

1. Configuración: proveedor, folio opcional, llegada/mínima/máxima, observaciones y filtro por proveedor.
2. Tiendas destino: selector múltiple; sin destino mantiene Producto, Tallas y Guardar bloqueados.
3. Producto: búsqueda por descripción, código, estilo, color o marca; producto y tienda del renglón.
4. Tallas: captura por talla/tienda, cantidades y costo; también expone datos de Curvas/Huecos propios de módulos congelados, no trasladados por OC-QA01.
5. Partidas / Guardar: renglones editables, cantidad/costo, quitar y acción final de guardado.

Se recorrió con proveedor ADIDAS, tienda `2 · ALTACIA` y artículo `501 AZUL MEZCLILLA CUADRA`. Sólo se generó estado local no persistido; no se guardó ni modificó Legacy.

## QA runtime CheckApp

- Flujo 1→5, bloqueos/desbloqueos y regreso: PASS.
- Servicio real `002 Cambio de Aceite`: PASS; Variante/PresentacionCompra correctamente `No aplica`.
- Producto real `001 Aceite Motor Sintetico`, variante `5 L`: PASS.
- Cantidad `2`, costo `299`, total de producto `$598.00`: PASS.
- OC mixta Producto + Servicio: PASS, 2 partidas, total `$1,098.00`.
- Guardar borrador: PASS; detalle `b4a49b32-5dd7-43fd-896d-3b7f10de7101`.
- F5/reapertura: PASS, 2 partidas y totales persistentes.
- Generar y confirmación por pedidos pendientes: PASS.
- Cleanup oficial: PASS mediante cancelación con motivo `Cleanup técnico OC-QA01`; no hubo hard delete.
- Producto normal sin variante: NO EJECUTABLE con datos actuales; el único producto activo retornado exige variante.
- PresentacionCompra: NO EJECUTABLE con datos actuales; el único producto activo no expone presentaciones de compra. No se fabricaron fixtures ni se tocó ProductosServicios.

## Responsive

| Ancho CSS | innerWidth | clientWidth | bodyScrollWidth | Resultado |
|---:|---:|---:|---:|---|
| 1440 | 1440 | 1440 | 1440 | PASS |
| 820 | 820 | 820 | 820 | PASS |
| 390 | 390 | 390 | 390 | PASS |

## Regresión técnica

- `node --check OrdenesCompra.js`: PASS.
- Build MVC: PASS, 0 errores; warnings históricos del repositorio.
- Build API: PASS, 0 errores; 6 warnings de paquetes preexistentes.
- Focal `OrdenesCompraOc03SourceTests`: 11/11 PASS.
- Suite global: 851/852 PASS; único fallo `ListaPreciosMatrixSqlIntegrationTests.ConsultaMatricialReal_MaterializaTodasLasIdentidadesYDiezNiveles`, preexistente, fuera de alcance y no bloqueante para OC-QA01.
- IDs duplicados en `Nueva.cshtml`: 0.
- Consola del navegador: 0 errores.

## Inventos detectados

Cantidad: 3.

1. Paso independiente `Revisar y guardar`: no pertenece al flujo Legacy; eliminado.
2. Barra/porcentaje `Avance del wizard`: no pertenece al flujo Legacy ni fue autorizado; eliminado.
3. Panel lateral de resumen con cards: no pertenece al flujo Legacy ni fue autorizado; eliminado.

## Diferencias autorizadas

- Producto y Servicio en una misma OC.
- Variante y PresentacionCompra cuando correspondan.
- Una OC por sucursal, no multi-tienda.
- Fecha de orden y fechas mínima/máxima autorizadas.
- Folio seguro generado por CheckApp, no captura manual.
- Seguridad, tenant, permisos, auditoría y patrón visual CheckApp V1.
- Curvas/Huecos/Tallas Legacy no se incorporan porque esos dominios permanecen congelados y no pertenecen al contrato de Nueva OC.

## Estado

Implementación técnica y recorrido runtime principal completos. QA manual Denisse continúa pendiente; no declarar aprobado PO ni FROZEN. La cobertura runtime no puede marcarse 100% mientras el tenant no contenga un producto base sin variante y una PresentacionCompra aplicable, y esos datos no pueden fabricarse dentro de este ticket.
