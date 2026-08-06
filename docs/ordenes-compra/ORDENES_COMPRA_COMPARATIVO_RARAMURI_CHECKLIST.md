# Órdenes de Compra · Comparativo Rarámuri vs CheckList

Fecha de auditoría: 2026-08-05

## Alcance auditado

### Rarámuri

- Repositorio: `/Users/denissemendiola/dev/Raramuri.blzr`
- Pantalla: `/almacen/compras/crear-orden`
- Evidencia principal:
  - `Raramuri.blzr/Components/Pages/Almacen/AlmacenComprasCrearOrden.razor`
  - `Raramuri.blzr/Services/Almacen/IAlmacenComprasService.cs`
  - `Raramuri.blzr/Services/Almacen/AlmacenComprasService.cs`
  - `docs/almacen/compras-crear-orden-fase-4c.md`

### CheckList

- Repositorio frontend/MVC: `/Users/denissemendiola/dev/Inspecciones/inspector`
- Repositorio API: `/Users/denissemendiola/dev/Inspecciones/inspectorapi`
- Pantallas auditadas:
  - `http://localhost:5200/Activos/OrdenesCompra/Nueva`
  - `http://localhost:5200/Activos/OrdenesCompra/Detalle/59783e39-c7b1-40fb-9397-384a610be93b`
- Evidencia principal:
  - `checklist/Views/Activos/OrdenesCompra/Nueva.cshtml`
  - `checklist/Controllers/Activos/OrdenesCompraController.cs`
  - `checklist/wwwroot/js/Activos/OrdenesCompra/OrdenesCompra.js`
  - `checklist/wwwroot/css/Activos/OrdenesCompra/OrdenesCompra.css`
  - `../inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`
  - `../inspectorapi/checklistWs/Models/OrdenesCompra/OrdenesCompraModels.cs`
  - `../inspectorapi/checklistWs/Scripts/ordenes-compra-up.sql`

## Verificación de solo lectura

### Estado inicial de Rarámuri

- `git status --short --branch`:
  - `## master...origin/master`
- No se detectaron cambios locales en Rarámuri al iniciar la auditoría.

### Estado inicial de CheckList

- El repositorio `inspector` ya tenía cambios preexistentes no relacionados con esta auditoría.
- Esta auditoría no corrigió ni alteró esos cambios.

## Resumen ejecutivo

La implementación actual de CheckList sí trasladó la base administrativa mínima de una orden de compra:

- proveedor;
- razón social;
- sucursal;
- fechas principales;
- observaciones;
- partidas;
- subtotal/total;
- borrador;
- generación;
- cancelación;
- vista detalle de solo lectura.

Sin embargo, la pantalla real de Rarámuri es funcionalmente más amplia y opera como un flujo de abastecimiento:

- separa preparación, tiendas destino, selección de producto, captura por tallas y guardado;
- trabaja con proveedor sugerido, costos vigentes por proveedor y validación de renglones sin costo;
- detecta pedidos pendientes antes de guardar;
- permite decidir entre mantener pedidos separados o consolidar y reemplazar;
- muestra vista previa de consolidación;
- entrega salida final en PDF y Excel;
- incluye progreso e idempotencia operacional durante el guardado.

La brecha principal no es visual; es de flujo operativo.

También hay una segunda conclusión importante: una parte relevante de lo que existe en Rarámuri está explícitamente fuera de alcance para CheckList por decisión del Product Owner. En especial:

- tallas;
- curvas;
- matrices;
- captura y distribución por tienda;
- lógica de surtido por talla;
- variantes.

Por lo tanto, no todo lo faltante en relación con Rarámuri debe implementarse. El comparativo correcto separa:

- faltantes reales todavía aprobables;
- diferencias que pertenecen a conceptos excluidos por PO;
- diferencias que no aplican por tratarse de un modelo de OC más simple en CheckList.

## Hallazgos principales

### Coincidencias completas

- Encabezado base con proveedor, razón social, sucursal, fecha principal y observaciones.
- Captura de partidas.
- Totales básicos.
- Guardado de borrador.
- Generación.
- Cancelación con motivo.
- Pantalla de detalle reutilizando el mismo flujo.

### Implementación parcial

- Flujo paso a paso: CheckList tiene wizard, pero es una simplificación del flujo operativo real.
- Manejo de folio/estado: existe en resumen y detalle, pero no con la misma profundidad operacional de Rarámuri.
- Validación previa al guardado: existe, pero es más básica.
- Revisión previa al guardado: existe, pero sin validación de pedidos pendientes ni resumen operativo de consolidación.

### Faltantes reales aprobables

- validación previa de pedidos pendientes/duplicados antes de generar la OC;
- confirmación de guardado con resumen más fuerte;
- manejo estricto de costos inválidos o faltantes;
- retroalimentación de progreso/resultado más robusta durante guardado;
- búsqueda y gestión de partidas con mayor contexto y productividad;
- exportables finales del documento generado.

### Diferencias excluidas por PO

- selección de tallas;
- captura por tienda;
- curvas automáticas o manuales;
- hueco/copete/existencia/tránsito;
- distribución por tienda;
- consolidación por talla;
- surtido por talla;
- matrices de talla.

## Matriz comparativa obligatoria

| Número | Área | Función o componente | Rarámuri | CheckList actual | Coincidencia | Exclusión PO | Falta implementar | Prioridad | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Encabezado | Proveedor | Obligatorio desde preparación; incluso puede autoseleccionarse por sugerencia de catálogo. | Obligatorio en paso 1. | COMPLETO | NO | NO | BAJA | Rarámuri: `AlmacenComprasCrearOrden.razor`, `GetProveedorSugeridoAsync`. CheckList: `Nueva.cshtml`, `OrdenesCompra.js`. |
| 2 | Encabezado | Razón social | No se observó como campo editable en la pantalla auditada. | Campo obligatorio en paso 1. | NO APLICA | NO | NO | POSPUESTA | Rarámuri trabaja orden operativa por proveedor/tiendas; CheckList agrega contexto corporativo propio. |
| 3 | Encabezado | Sucursal | No se observó como campo editable en la pantalla auditada. | Campo obligatorio en paso 1. | NO APLICA | NO | NO | POSPUESTA | Rarámuri: misma pantalla auditada no expone sucursal. CheckList: `Nueva.cshtml`. |
| 4 | Encabezado | Folio | Campo opcional visible desde preparación y folio final tras guardar. | Resumen con “Sin asignar” y folio persistido en detalle; no editable en captura. | PARCIAL | NO | SÍ | MEDIA | Rarámuri: `MudTextField` de folio y resumen final. CheckList: hero/sidebar resumen y detalle API. |
| 5 | Encabezado | Fecha de orden/documento | Flujo operativo usa fecha llegada, mínima y máxima; el documento generado incluye fecha documento. | Fecha de orden obligatoria. | PARCIAL | NO | NO | MEDIA | Rarámuri: fechas operativas en preparación y PDF. CheckList: `txOcFechaOrden`. |
| 6 | Encabezado | Fecha de llegada | Obligatoria para guardar junto con rango válido. | Campo disponible y validado contra fecha de orden. | PARCIAL | NO | SÍ | MEDIA | Rarámuri: `TryPrepareGuardar`; CheckList: `validateConfiguration`, API `ValidateGuardarRequest`. |
| 7 | Encabezado | Fecha mínima | Campo obligatorio del flujo real. | No existe. | AUSENTE | NO | SÍ | ALTA | Rarámuri: `_fechaMinima`, validaciones de guardado. |
| 8 | Encabezado | Fecha máxima | Campo obligatorio del flujo real. | No existe. | AUSENTE | NO | SÍ | ALTA | Rarámuri: `_fechaMaxima`, validaciones de guardado. |
| 9 | Encabezado | Observaciones | Campo libre con trazabilidad adicional al guardar. | Campo libre con máximo 1000 caracteres. | PARCIAL | NO | SÍ | MEDIA | Rarámuri: `BuildObservacionesConTrazabilidadHuecos`; CheckList: `OrdenCompraGuardarRequest.Observaciones`. |
| 10 | Encabezado | Filtro “solo productos de este proveedor” | Toggle explícito en preparación. | No existe. | AUSENTE | NO | SÍ | MEDIA | Rarámuri: `Solo productos de este proveedor`. CheckList: búsqueda sin filtro proveedor dedicado. |
| 11 | Encabezado | Tiendas destino | Paso independiente con selección múltiple y resumen visual. | No existe. | EXCLUIDO POR PO | SÍ | NO | EXCLUIDA | Rarámuri: Paso 2 `Tiendas destino`. PO excluyó distribución/tiendas destino por partida. |
| 12 | Flujo | Stepper real | 5 etapas: Configuración, Tiendas destino, Producto, Tallas, Partidas/Guardar. | 4 etapas: Configuración, Productos y servicios, Partidas, Revisar y guardar. | PARCIAL | SÍ | SÍ | MEDIA | Rarámuri: step cards 1-5. CheckList: stepper 1-4. |
| 13 | Flujo | Estados por paso y bloqueo/desbloqueo | Cada etapa cambia entre `Blocked`, `Ready`, `Complete`; el flujo depende de proveedor, tiendas, producto y tallas. | Hay bloqueo por validación, pero depende solo de encabezado y partidas. | PARCIAL | PARCIAL | SÍ | MEDIA | Rarámuri: `PasoConfiguracionState` a `PasoGuardarState`. CheckList: `canAccessStep`, `resolveMaxUnlockedStep`. |
| 14 | Flujo | Preparación colapsable con resumen | La preparación se puede colapsar y reabrir; muestra resumen operativo. | No existe un modo colapsado/resumen editable. | AUSENTE | NO | SÍ | BAJA | Rarámuri: `PreparacionExpandida`, resumen de preparación. |
| 15 | Búsqueda | Búsqueda avanzada de producto | Busca por descripción, barcode, estilo, color o marca. | Busca por código o nombre y tipo producto/servicio. | PARCIAL | NO | SÍ | MEDIA | Rarámuri: copy del paso 3 y servicios `GetPedidoProveedorProductosAsync`. CheckList: `txOcBuscarProductoServicio`, API `BuscarProductosServiciosOrdenCompra`. |
| 16 | Búsqueda | Soporte de servicios | La pantalla auditada está centrada en producto físico por barcode/talla. | Sí soporta productos y servicios. | NO APLICA | NO | NO | POSPUESTA | CheckList cubre un caso adicional, no una ausencia. |
| 17 | Búsqueda | Proveedor sugerido por producto | Puede sugerir y autoseleccionar proveedor desde catálogo/barcode. | No existe. | AUSENTE | NO | SÍ | MEDIA | Rarámuri: `GetProveedorSugeridoAsync`, mensajes `_proveedorSugeridoNombre`. |
| 18 | Captura | Consulta de tallas por producto | Trae tallas disponibles por barcode y proveedor. | No existe. | EXCLUIDO POR PO | SÍ | NO | EXCLUIDA | Rarámuri: `GetPedidoProveedorTallasAsync`. PO excluyó tallas/curvas. |
| 19 | Captura | Diálogo de tallas | Modal específico para capturar talla y cantidad. | No existe. | EXCLUIDO POR PO | SÍ | NO | EXCLUIDA | Rarámuri: diálogo `Selecciona tallas y cantidad`. |
| 20 | Captura | Modos de captura masiva | `Manual`, `Pedido inicial`, `Rellenar curva`, `No pedir`. | No existe. | EXCLUIDO POR PO | SÍ | NO | EXCLUIDA | Rarámuri: botones `Aplicar modo a todas las tiendas`. |
| 21 | Captura | Contexto por tienda/talla | Muestra curva objetivo, existencia, tránsito, hueco y copete. | No existe. | EXCLUIDO POR PO | SÍ | NO | EXCLUIDA | Rarámuri: `compras-crear-orden-fase-4c.md`, `GetCurvaContextoTiendasAsync`. |
| 22 | Captura | Validación de resolución por tienda | No deja continuar si una tienda queda pendiente sin captura o sin “No pedir”. | No existe. | EXCLUIDO POR PO | SÍ | NO | EXCLUIDA | Rarámuri: `TryValidateTiendasCaptura`. |
| 23 | Partidas | Estructura de renglón | Renglón por tienda + producto + talla + cantidad + costo + importe. | Renglón por producto/servicio + cantidad + costo + subtotal. | PARCIAL | PARCIAL | NO | POSPUESTA | Rarámuri: grid de partidas con tienda y talla. CheckList: `grOcPartidas`. |
| 24 | Partidas | Consolidación automática de duplicados | Consolida renglones al agregar/capturar y resume resultado. | Consolida solo duplicado exacto por producto/servicio sumando cantidad. | PARCIAL | NO | SÍ | MEDIA | Rarámuri: mensaje de renglones agregados/consolidados. CheckList: `addPartidaFromSearch`. |
| 25 | Partidas | Costos obligatorios y válidos antes de guardar | Bloquea guardado si hay costo inválido o pendiente; permite reintento de costos. | Permite guardar borrador con costo 0 y solo bloquea generar si el total queda en 0. | AUSENTE | NO | SÍ | CRÍTICA | Rarámuri: `UnresolvedCostRows`, `HasInvalidCosto`, `ResolverCostosDraftAsync`. CheckList: `validatePartidas`, `generateOrder`. |
| 26 | Partidas | Fuente/motivo del costo | Conserva estado, fuente y motivo del costo por renglón. | No existe. | AUSENTE | NO | SÍ | ALTA | Rarámuri: `PedidoProveedorCostoState`, etiquetas de costo pendiente. |
| 27 | Partidas | Filtro/búsqueda en partidas capturadas | Campo de búsqueda local y ordenamiento por columnas. | No existe filtro ni sort sobre partidas capturadas. | AUSENTE | NO | SÍ | MEDIA | Rarámuri: `_searchPartidas`, `ToggleSort`. CheckList: tabla simple. |
| 28 | Validación | Preparación inicial asíncrona | Carga proveedores/tiendas con estado de preparación y retry. | Carga combos simple sin preparación operacional. | PARCIAL | NO | SÍ | BAJA | Rarámuri: `StartCrearOrdenPreparationAsync`, skeleton/retry. CheckList: `loadCombos`. |
| 29 | Guardado | Confirmación previa al guardado | Modal con proveedor, tiendas, fechas, renglones, unidades y total. | Paso 4 revisa datos, pero guardar no abre confirmación final equivalente. | AUSENTE | NO | SÍ | ALTA | Rarámuri: diálogo `Confirmar guardado de Orden de Compra`. CheckList: revisión pasiva en paso 4. |
| 30 | Guardado | Validación de pedidos pendientes | Antes de guardar detecta pedidos previos con productos coincidentes. | No existe. | AUSENTE | NO | SÍ | CRÍTICA | Rarámuri: `ValidarPedidosPendientesAsync`, diálogo `Ya existen pedidos pendientes`. |
| 31 | Guardado | Decisión “mantener separados” vs “consolidar y reemplazar” | Flujo explícito con preview y doble confirmación. | No existe. | AUSENTE | NO | SÍ | ALTA | Rarámuri: `MantenerSeparadosAsync`, `MostrarVistaPreviaConsolidacion`, `ConfirmarConsolidacionAsync`. |
| 32 | Guardado | Vista previa de consolidación | Muestra líneas que se actualizan, conservan o agregan, más totales. | No existe. | AUSENTE | NO | SÍ | ALTA | Rarámuri: `_pendientesPreview`. |
| 33 | Guardado | Idempotencia y verificación post-save | Tiene `idempotencyKey`, `operationId`, recuperación de resultado ambiguo y panel de progreso. | No existe evidencia equivalente en frontend ni API de CheckList. | AUSENTE | NO | SÍ | ALTA | Rarámuri: `GuardarPedidoProveedorAsync`, `GetPedidoProveedorGuardarResultadoAsync`, panel `tara-oc-save-progress`. |
| 34 | Guardado | Feedback de progreso detallado | Muestra fases de guardado, elapsed time y estados de éxito/error/cancelado. | Solo overlay simple de “Guardando/Generando/Cancelando”. | PARCIAL | NO | SÍ | MEDIA | Rarámuri: `SavingState`, panel de progreso. CheckList: `showEditorOverlay`. |
| 35 | Salida | Orden generada con acciones posteriores | Al guardar genera resumen final y habilita PDF, Excel y “Crear otra orden”. | Después de generar solo recarga detalle en modo lectura. | AUSENTE | NO | SÍ | ALTA | Rarámuri: bloque `Orden generada`. CheckList: `generateOrder`, `applyDetailToEditor`. |
| 36 | Salida | Exportación PDF | Disponible desde la orden generada. | No existe en la pantalla auditada. | AUSENTE | NO | SÍ | MEDIA | Rarámuri: botón `Ver/Imprimir PDF`. |
| 37 | Salida | Exportación Excel | Disponible desde la orden generada. | Solo existe exportación del listado de órdenes, no del documento generado en esta pantalla. | PARCIAL | NO | SÍ | MEDIA | Rarámuri: `ExportarOrdenExcelAsync`. CheckList API: `ExportarOrdenesCompra`. |
| 38 | Detalle | Reutilización del flujo para editar/consultar | Sí hay edición operativa del detalle y de renglones en el ecosistema de compras. | La misma pantalla sirve para nuevo/detalle; detalle en borrador editable y otros estados solo lectura. | PARCIAL | NO | NO | BAJA | Rarámuri: interfaz incluye `EditarOrdenCompraAsync` y operaciones de detalle. CheckList: `Detalle/{id}`, `readOnly`. |
| 39 | Cancelación | Cancelación en la misma pantalla auditada | No se observó como parte central del flujo `/crear-orden`. | Sí existe cancelación con motivo y panel de trazabilidad. | NO APLICA | NO | NO | POSPUESTA | La diferencia favorece a CheckList; no es faltante contra Rarámuri. |
| 40 | Seguridad operativa | Mensajes de ayuda contextual | Tiene mensajes operativos ricos durante preparación, captura, costos y guardado. | Tiene estados inline y overlay, pero con menor granularidad. | PARCIAL | NO | SÍ | BAJA | Rarámuri: `_mensaje`, alertas múltiples. CheckList: `setStatus`. |

## Qué existe realmente en Rarámuri

La pantalla de Rarámuri no es solo un formulario de orden de compra. Es un flujo operativo de abastecimiento con estos rasgos reales:

- preparación con proveedor, folio opcional, observaciones y tres fechas;
- selección de múltiples tiendas destino;
- búsqueda de producto orientada a proveedor;
- sugerencia automática de proveedor por catálogo/barcode;
- captura por tallas;
- cálculo y apoyo visual por tienda/talla;
- costos vigentes por proveedor con estado por renglón;
- bloqueo de guardado si faltan costos válidos;
- detección de pedidos pendientes antes de confirmar;
- consolidación opcional con vista previa;
- guardado con trazabilidad operacional;
- salida final con PDF y Excel.

## Qué existe actualmente en CheckList

La implementación actual de CheckList es una OC administrativa simplificada con estas capacidades reales:

- wizard de 4 pasos;
- encabezado con razón social, sucursal, proveedor, fecha de orden, fecha de llegada y observaciones;
- búsqueda de productos y servicios;
- agregado manual de partidas;
- edición de cantidad y costo;
- consolidación básica de duplicados por producto/servicio;
- guardado de borrador;
- generación de orden;
- cancelación con motivo;
- vista detalle reutilizando la misma pantalla;
- API, modelo SQL y proxy MVC firmados para este flujo.

## Qué coincide

- proveedor;
- observaciones;
- fecha de llegada;
- partidas;
- subtotal/total;
- guardado de borrador;
- generación;
- cancelación;
- vista de detalle en la misma pantalla base.

## Qué está parcialmente implementado

- flujo paso a paso;
- folio y estado;
- revisión previa al guardado;
- validaciones para avanzar;
- consolidación de partidas;
- retroalimentación de estado al usuario;
- exportación, pero solo a nivel listado, no desde la orden generada.

## Qué falta

### Faltantes reales todavía aprobables

- fecha mínima y fecha máxima del ciclo operativo;
- filtro explícito de productos por proveedor seleccionado;
- sugerencia automática de proveedor;
- validación estricta de costo antes de guardar;
- reintento/recuperación de costos;
- búsqueda/sort en partidas ya capturadas;
- confirmación final fuerte antes del guardado;
- validación de pedidos pendientes;
- decisión de mantener separado o consolidar;
- vista previa de consolidación;
- progreso detallado e idempotencia del guardado;
- exportación PDF/Excel desde la orden ya generada.

### Faltantes que no deben implementarse por exclusión del PO

- tiendas destino por renglón;
- tallas;
- curvas;
- matrices;
- hueco/copete;
- captura distribuida por tienda;
- surtido por talla;
- consolidación derivada de tallas o variantes.

## Qué fue excluido expresamente por el Product Owner

Marcar como `EXCLUIDO POR DECISIÓN DEL PRODUCT OWNER` todo lo relacionado con:

- variantes;
- tallas;
- curvas;
- matrices de tallas;
- surtidos por talla;
- consolidación por talla;
- tiendas destino por partida;
- distribución por tienda;
- combinaciones de variantes;
- inventario por variante.

## Recomendación de alcance para la única implementación posterior

### Propuesta sí aprobable

1. Endurecer el guardado de CheckList para no permitir borradores “funcionalmente inválidos”.
   Esto incluye validar costos positivos o al menos explícitamente resueltos antes de guardar/generar.

2. Agregar una validación previa de pedidos pendientes o duplicados.
   No necesita tallas ni tiendas para aportar valor; puede operar con proveedor + producto/servicio + estado.

3. Incorporar una confirmación final de guardado más robusta.
   Debe resumir encabezado, partidas, unidades y total antes de persistir.

4. Mejorar la productividad de captura.
   Búsqueda más rica, filtro por proveedor y búsqueda/sort dentro de partidas.

5. Agregar salidas del documento generado.
   Priorizar PDF; Excel puede quedar en segundo nivel.

6. Mejorar la robustez operacional del guardado.
   Progreso visible, prevención de doble envío y verificación de resultado.

### Propuesta que no debe entrar

1. Separar el wizard para meter tiendas destino y tallas.
2. Replicar curvas, hueco/copete o contexto por talla.
3. Crear distribución por tienda.
4. Llevar variantes/tallas al modelo actual de CheckList.

## Priorización sugerida

### CRÍTICA

- validación de costos válidos antes de guardar;
- validación de pedidos pendientes/duplicados antes de generar.

### ALTA

- fecha mínima/máxima si el proceso real de negocio en CheckList también las requiere;
- confirmación final de guardado;
- consolidación/decisión informada frente a pedidos pendientes;
- idempotencia y verificación de resultado;
- salida PDF/Excel desde la orden generada.

### MEDIA

- sugerencia de proveedor;
- filtro explícito por proveedor;
- mejoras de búsqueda;
- filtro y ordenamiento sobre partidas;
- enriquecimiento de observaciones con trazabilidad.

### EXCLUIDA

- todo lo asociado a tallas, curvas, matrices y distribución por tienda.

## Conclusión

CheckList no está vacío ni incorrectamente planteado; ya cubre la base administrativa certificada definida por el Product Owner. Pero todavía no alcanza la madurez operativa real que sí existe en Rarámuri para prevenir errores de captura, validar duplicidades, asegurar costos y cerrar el guardado con mayor trazabilidad.

La implementación posterior no debe intentar copiar toda la pantalla de Rarámuri. Debe tomar solo el subconjunto que:

- eleva integridad funcional;
- mejora la seguridad operativa;
- no reintroduce tallas, curvas ni distribución por tienda.

En consecuencia, la recomendación es aprobar una implementación posterior enfocada en:

- validaciones fuertes de guardado;
- control de pedidos pendientes;
- confirmación y progreso operacional;
- productividad de captura;
- salida documental final;

y dejar expresamente fuera cualquier traslado de lógica de tallas, curvas o tiendas destino por partida.
