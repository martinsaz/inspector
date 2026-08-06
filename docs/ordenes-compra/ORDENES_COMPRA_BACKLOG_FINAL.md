# BACKLOG DEFINITIVO DE ÓRDENES DE COMPRA

Fecha: 2026-08-05
Estado del documento: Cierre definitivo de planeación
Fuentes únicas:

- `ORDENES_COMPRA_AUDITORIA_Y_PLAN.md`
- `ORDENES_COMPRA_COMPARATIVO_RARAMURI_CHECKLIST.md`
- `ORDENES_COMPRA_MODELO_DATOS.md`
- `ORDENES_COMPRA_API.md`

## IMPLEMENTAR

### CRÍTICO

#### 1. Validación de pedidos pendientes antes de generar

- Descripción: validar, antes de generar la orden, si ya existe un borrador o una orden generada activa con el mismo proveedor y alguno de los mismos productos/servicios para advertir al usuario y evitar duplicidad funcional.
- Objetivo: reducir órdenes duplicadas y capturas conflictivas.
- Impacto: aumenta control operativo sin introducir tallas, tiendas destino ni consolidación estilo Rarámuri.
- Frontend: aviso visible previo a generar, con lista simple de coincidencias y decisión explícita para continuar o cancelar.
- MVC: nuevo endpoint proxy firmado para consultar pendientes antes de `GenerarOrdenCompra`.
- API: endpoint de validación simple por `idProveedor + partidas activas + idEmpresa`; sin consolidación, sin reemplazo, sin tokens de consolidación.
- SQL: sin tablas nuevas; consulta sobre `OrdenesCompra` y `OrdenesCompraDetalle` existentes con filtro por empresa, estado y productos/servicios activos de la orden.
- Prioridad: CRÍTICO.
- Dependencia: requiere modelo y API de órdenes ya aprobados y detalle persistente vigente.
- Criterio de aceptación: al intentar generar una orden con coincidencias activas, el sistema muestra advertencia clara; el usuario puede cancelar la generación o confirmar continuar; si no hay coincidencias, la generación sigue normal.

#### 2. Validaciones fuertes de costos antes de generar

- Descripción: impedir la generación cuando alguna partida tenga cantidad no válida, costo unitario negativo o total final igual a cero; reforzar también la validación de partidas vacías y renglones inválidos.
- Objetivo: asegurar que solo se generen órdenes funcionalmente correctas.
- Impacto: evita órdenes generadas con datos incompletos o monetariamente inútiles.
- Frontend: mensajes inline por partida y mensaje resumen en paso final.
- MVC: reutiliza endpoints existentes de guardado/generación y transmite errores de negocio claros.
- API: endurecer validaciones de `GenerarOrdenCompra` y, si aplica, de `GuardarBorradorOrdenCompra` para detectar payload inconsistente.
- SQL: sin cambios estructurales adicionales; aprovechar checks ya definidos y reglas de total positivo en `Generada`.
- Prioridad: CRÍTICO.
- Dependencia: depende de contratos actuales de encabezado y partidas.
- Criterio de aceptación: no se puede generar una orden si una partida tiene cantidad `<= 0`, costo inválido o si el total de la orden es `<= 0`; el usuario recibe el motivo exacto.

### ALTO

#### 3. Confirmación antes de generar

- Descripción: agregar una confirmación final antes de pasar la orden a estado `Generada`, mostrando encabezado, número de partidas, total y advertencias pendientes.
- Objetivo: reducir errores por clic involuntario y dar cierre consciente al flujo.
- Impacto: mejora control operativo y comprensión del cambio de estado.
- Frontend: modal o panel de confirmación CheckApp en el paso final.
- MVC: sin lógica compleja adicional; reutiliza endpoint actual de generación.
- API: sin endpoint nuevo; solo mensajes de respuesta consistentes.
- SQL: sin cambios.
- Prioridad: ALTO.
- Dependencia: depende del cálculo confiable de partidas y total, y se complementa con validación de pendientes.
- Criterio de aceptación: el usuario siempre debe confirmar la generación; si cancela, la orden permanece en borrador sin cambios.

#### 4. Exportación PDF de la Orden de Compra

- Descripción: generar un PDF del documento de la orden ya generada con folio, encabezado, partidas y totales.
- Objetivo: entregar una salida formal compartible e imprimible.
- Impacto: cubre necesidad documental real del vertical sin meter recepción, pagos ni facturación.
- Frontend: botón visible en detalle de orden generada y apertura/descarga del PDF.
- MVC: endpoint proxy para solicitar el PDF por `idOrdenCompra`.
- API: endpoint de exportación PDF del documento individual de la orden; usar datos persistidos, no el estado temporal del cliente.
- SQL: sin cambios estructurales; lectura de encabezado y detalle existentes.
- Prioridad: ALTO.
- Dependencia: requiere orden generada con folio persistido y detalle estable.
- Criterio de aceptación: desde una orden generada se puede descargar o visualizar un PDF con folio, razón social, sucursal, proveedor, fechas, observaciones, partidas y total.

#### 5. Exportación Excel de la Orden de Compra

- Descripción: generar un Excel del documento individual de la orden generada con el mismo contenido funcional del PDF en formato tabular.
- Objetivo: facilitar análisis, envío y reproceso administrativo.
- Impacto: añade valor operativo directo sin cambiar modelo funcional.
- Frontend: botón visible en detalle de orden generada y descarga del archivo.
- MVC: endpoint proxy para solicitar el Excel por `idOrdenCompra`.
- API: endpoint de exportación Excel del documento individual.
- SQL: sin cambios estructurales.
- Prioridad: ALTO.
- Dependencia: misma base documental que el PDF.
- Criterio de aceptación: desde una orden generada se puede descargar un `.xlsx` con encabezado y partidas coherentes con el detalle persistido.

### MEDIO

#### 6. Mejor búsqueda de productos

- Descripción: ampliar la búsqueda actual para encontrar productos y servicios por más campos útiles del catálogo aprobado de CheckList, manteniendo el modelo unificado de productos/servicios.
- Objetivo: acelerar la captura y disminuir errores de selección.
- Impacto: mejora productividad sin cambiar la semántica administrativa de la OC.
- Frontend: ajustes al buscador del paso de productos; mejor estado vacío, mejor feedback y filtros útiles.
- MVC: reutiliza proxy actual de búsqueda con parámetros adicionales permitidos.
- API: ampliar `BuscarProductosServiciosOrdenCompra` con criterios de búsqueda más útiles y consistentes con el catálogo real.
- SQL: sin cambios estructurales; optimización sobre consulta existente si hace falta.
- Prioridad: MEDIO.
- Dependencia: depende del catálogo actual de productos y servicios ya certificado.
- Criterio de aceptación: el usuario puede localizar más rápido un producto/servicio por criterios aprobados adicionales y los resultados siguen respetando empresa, activo y tipo.

#### 7. Mejor búsqueda dentro de partidas

- Descripción: agregar búsqueda local sobre las partidas capturadas para filtrar por código, nombre o descripción.
- Objetivo: facilitar revisión y edición cuando la orden tiene muchas partidas.
- Impacto: mejora usabilidad sin tocar reglas de negocio ni persistencia.
- Frontend: caja de búsqueda local sobre la tabla de partidas y revisión.
- MVC: sin cambios.
- API: sin cambios.
- SQL: sin cambios.
- Prioridad: MEDIO.
- Dependencia: ninguna dependencia técnica adicional relevante.
- Criterio de aceptación: al capturar texto en el buscador de partidas, la tabla se filtra en cliente sin alterar el contenido persistido.

#### 8. Mejor retroalimentación visual del proceso de guardado

- Descripción: reforzar el feedback visual al guardar borrador, generar y cancelar para que el usuario vea claramente estado en progreso, éxito y error.
- Objetivo: reducir incertidumbre operativa durante acciones críticas.
- Impacto: mejora percepción de robustez y disminuye doble clic o abandono del flujo.
- Frontend: overlays, estados inline, botones bloqueados y mensajes de resultado más claros.
- MVC: sin cambios relevantes, salvo propagar mejor mensajes.
- API: estandarizar mensajes de error/éxito cuando convenga.
- SQL: sin cambios.
- Prioridad: MEDIO.
- Dependencia: se apoya en endpoints ya existentes.
- Criterio de aceptación: durante guardar/generar/cancelar el usuario ve un estado claro de proceso, no puede disparar acciones duplicadas y recibe confirmación o error comprensible al terminar.

## NO IMPLEMENTAR

Todos los siguientes puntos quedan marcados como `EXCLUIDO POR DECISIÓN DEL PRODUCT OWNER`.

### BAJO

#### 1. Variantes

- Motivo: el vertical actual de CheckList ya está aprobado como orden administrativa simple por producto/servicio.
- Evidencia: `ORDENES_COMPRA_COMPARATIVO_RARAMURI_CHECKLIST.md` marca variantes como excluidas por PO.
- Por qué pertenece a Rarámuri: la referencia auditada trabaja con granularidad operativa de abastecimiento.
- Por qué no aporta valor a CheckList: introduce complejidad de catálogo y captura no requerida para esta iteración única.

#### 2. Tallas

- Motivo: exclusión expresa del PO.
- Evidencia: Rarámuri tiene paso específico de `Tallas`; el comparativo lo marca como excluido.
- Por qué pertenece a Rarámuri: su flujo real captura por barcode, talla y cantidad.
- Por qué no aporta valor a CheckList: rompe el modelo actual unificado de productos/servicios y desvía el vertical.

#### 3. Curvas

- Motivo: exclusión expresa del PO.
- Evidencia: `compras-crear-orden-fase-4c.md` y el comparativo documentan curva objetivo y modos de curva.
- Por qué pertenece a Rarámuri: forma parte del abastecimiento por talla/tienda.
- Por qué no aporta valor a CheckList: no existe requerimiento aprobado de resurtido por curva en OC administrativas.

#### 4. Matrices

- Motivo: exclusión expresa del PO.
- Evidencia: el backlog comparativo menciona matrices de talla como fuera de alcance.
- Por qué pertenece a Rarámuri: deriva de la captura masiva por talla y tienda.
- Por qué no aporta valor a CheckList: agregaría complejidad visual y de datos sin necesidad funcional del vertical.

#### 5. Tiendas destino

- Motivo: exclusión expresa del PO.
- Evidencia: el comparativo marca `Tiendas destino` como `EXCLUIDO POR PO`.
- Por qué pertenece a Rarámuri: es el paso 2 del flujo real.
- Por qué no aporta valor a CheckList: CheckList ya opera con razón social y sucursal en encabezado, no con distribución de la orden por tiendas.

#### 6. Distribución por tienda

- Motivo: exclusión expresa del PO.
- Evidencia: está listada en las exclusiones del documento comparativo y del requerimiento actual.
- Por qué pertenece a Rarámuri: depende de tiendas destino y captura operativa.
- Por qué no aporta valor a CheckList: sobrecarga el vertical sin beneficio para la OC administrativa aprobada.

#### 7. Hueco

- Motivo: exclusión expresa del PO.
- Evidencia: `compras-crear-orden-fase-4c.md` lo documenta como contexto de curva/existencia.
- Por qué pertenece a Rarámuri: es una métrica operativa de reabasto.
- Por qué no aporta valor a CheckList: no influye en una orden administrativa simple de compra.

#### 8. Copete

- Motivo: exclusión expresa del PO.
- Evidencia: mismo documento de fase 4C y comparativo.
- Por qué pertenece a Rarámuri: es parte del contexto de tallas y curva.
- Por qué no aporta valor a CheckList: no forma parte del objetivo funcional aprobado.

#### 9. Tránsito

- Motivo: exclusión expresa del PO.
- Evidencia: documentado como columna operativa de Rarámuri.
- Por qué pertenece a Rarámuri: depende del contexto logístico de existencias.
- Por qué no aporta valor a CheckList: no se solicitó control de inventario ni recepción en esta iteración.

#### 10. Proveedor sugerido

- Motivo: rechazo expreso del PO en esta fase de cierre.
- Evidencia: el comparativo lo identificó como posible mejora, pero el requerimiento actual lo excluye.
- Por qué pertenece a Rarámuri: se apoya en sugerencia automática por barcode/catálogo.
- Por qué no aporta valor a CheckList: el proveedor ya se selecciona explícitamente en encabezado y no es indispensable para cerrar el MVP aprobado.

#### 11. Fecha mínima

- Motivo: rechazo expreso del PO.
- Evidencia: el comparativo la detectó como parte del flujo Rarámuri; el requerimiento actual la excluye.
- Por qué pertenece a Rarámuri: integra su rango operativo de abastecimiento.
- Por qué no aporta valor a CheckList: la OC aprobada ya opera con fecha de orden y fecha de llegada.

#### 12. Fecha máxima

- Motivo: rechazo expreso del PO.
- Evidencia: misma fuente y misma exclusión.
- Por qué pertenece a Rarámuri: pertenece al rango operativo del flujo hermano.
- Por qué no aporta valor a CheckList: agrega complejidad sin valor funcional aprobado.

#### 13. Idempotencia visual

- Motivo: rechazo expreso del PO.
- Evidencia: el comparativo la propuso como mejora operacional; el requerimiento actual la excluye nominalmente.
- Por qué pertenece a Rarámuri: forma parte de su flujo robusto de guardado con panel de estado.
- Por qué no aporta valor a CheckList: el valor buscado se cubre con mejor feedback visual sin incorporar semántica completa de idempotencia en UI.

#### 14. Recuperación de operaciones

- Motivo: rechazo expreso del PO.
- Evidencia: identificada en la auditoría como recuperación de resultado ambiguo; excluida en el requerimiento actual.
- Por qué pertenece a Rarámuri: responde a su esquema de `OperationId` e `IdempotencyKey`.
- Por qué no aporta valor a CheckList: excede el alcance de esta implementación única.

#### 15. Reintentos de costos

- Motivo: rechazo expreso del PO.
- Evidencia: el comparativo detecta `ResolverCostosDraftAsync`; el requerimiento actual lo excluye.
- Por qué pertenece a Rarámuri: depende de costos por proveedor con resolución operativa posterior.
- Por qué no aporta valor a CheckList: aquí solo se requiere validar costos antes de generar, no construir una capa de recuperación de costos.

#### 16. Estados internos de costo

- Motivo: rechazo expreso del PO.
- Evidencia: el comparativo identifica `PedidoProveedorCostoState`; el requerimiento actual lo excluye.
- Por qué pertenece a Rarámuri: es parte del control fino de costo por renglón.
- Por qué no aporta valor a CheckList: para esta iteración basta con validar costo válido/inválido.

#### 17. Lógica específica de Rarámuri

- Motivo: exclusión expresa del PO.
- Evidencia: todos los documentos base concluyen que Rarámuri es referencia, no plantilla literal.
- Por qué pertenece a Rarámuri: usa semántica de pedido a proveedor por tienda/talla, consolidación avanzada y contexto operativo propio.
- Por qué no aporta valor a CheckList: desviaría el vertical de su diseño administrativo aprobado.

#### 18. Consolidación y reemplazo de pedidos pendientes estilo Rarámuri

- Motivo: no fue aprobada; solo se aprueba validación de pendientes, no consolidación avanzada.
- Evidencia: `ORDENES_COMPRA_AUDITORIA_Y_PLAN.md` ya recomendaba diferir esa complejidad; el requerimiento actual no la incluye como candidato aprobado.
- Por qué pertenece a Rarámuri: requiere preview de consolidación, doble confirmación y reglas de reemplazo.
- Por qué no aporta valor a CheckList: la necesidad aprobada es advertir duplicidad, no fusionar órdenes.

#### 19. Vista previa de consolidación

- Motivo: no aprobada y dependiente de la consolidación avanzada rechazada.
- Evidencia: aparece en el comparativo como hallazgo faltante, pero no en los candidatos aprobados del PO.
- Por qué pertenece a Rarámuri: es parte del flujo `mantener separados` vs `consolidar y reemplazar`.
- Por qué no aporta valor a CheckList: no existe un proceso aprobado de consolidación que justifique esta pantalla.

#### 20. Preparación asíncrona compleja y estados operativos de pre-carga

- Motivo: no agrega valor suficiente frente al flujo actual de combos y búsqueda.
- Evidencia: el comparativo lo detectó como diferencia de UX menor.
- Por qué pertenece a Rarámuri: responde a su preparación de proveedor, tiendas y costos.
- Por qué no aporta valor a CheckList: no cambia el resultado funcional del vertical y aumenta complejidad innecesaria.

## Dictamen definitivo

### Se implementará

- validación de pedidos pendientes antes de generar;
- validaciones fuertes de costos antes de generar;
- confirmación antes de generar;
- exportación PDF de la orden de compra;
- exportación Excel de la orden de compra;
- mejor búsqueda de productos;
- mejor búsqueda dentro de partidas;
- mejor retroalimentación visual del proceso de guardado.

### No se implementará

- variantes;
- tallas;
- curvas;
- matrices;
- tiendas destino;
- distribución por tienda;
- hueco;
- copete;
- tránsito;
- proveedor sugerido;
- fecha mínima;
- fecha máxima;
- idempotencia visual;
- recuperación de operaciones;
- reintentos de costos;
- estados internos de costo;
- lógica específica de Rarámuri;
- consolidación avanzada y vista previa de consolidación.

Este documento cierra el alcance funcional del vertical. Cualquier elemento fuera de la lista de `IMPLEMENTAR` queda formalmente rechazado para la iteración única.
