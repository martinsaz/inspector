# MOKA - Auditoria OC + Recepcion - 20260920

## Resumen ejecutivo

Esta auditoria consolida OC NEXT, OC/Recepcion Legacy SKNC y el modelo vigente de ProductosServicios. No implementa OC/Recepcion, no ejecuta DDL, no modifica legacy y no toca T25 ni reporte lider.

Dictamen: OC NEXT ya existe como documento administrativo con wizard, folio, estados y partidas Producto/Servicio, pero debe evolucionar antes de implementar recepcion. La brecha critica es que el contrato actual de partida no identifica variante, presentacion, snapshot completo, cantidad recibida, control de serie ni relacion transaccional con recepciones/inventario. Legacy aporta reglas operativas validas: recepcion parcial, multiples recepciones, series por producto/variante, inventario solo al recibir y estado pendiente/recibido; no debe heredarse su modelo fisico ni su UI.

Decision PM/PO recomendada: conservar OC mixta Producto+Servicio, exigir Variante cuando el producto la tenga, y disenar Recepcion OC como flujo nuevo CheckApp complejo. Para Presentaciones, se recomienda la opcion C: separar Presentacion Venta y Presentacion Compra, pero queda como `REQUIERE_DECISION_PO_PRESENTACIONES_OC`.

## Auditorias previas recuperadas

| Archivo | Fecha | Alcance | Conclusiones | Decisiones PO / pendientes | Vigencia |
|---|---:|---|---|---|---|
| `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_SKNC_LEGACY_2026-08-18.md` | 2026-08-18 | Legacy OC, aprobaciones y recepcion | Legacy tiene ciclo crear/aprobar/recibir, parciales, series e inventario en recepcion | Reusar reglas, no diseno fisico | Vigente como fuente funcional |
| `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_CHECKAPP_ACTUAL_2026-08-19.md` | 2026-08-19 | OC CheckApp actual | NEXT tiene wizard, reporte, encabezado/detalle, folio seguro y estados Borrador/Generada/Cancelada; no tiene recepcion | Recepcion/inventario pendientes | Vigente |
| `inspector/docs/compras/legacy-sknc/08_RECEPCION_OC.md` | 2026-08-18 | Recepcion Legacy | Recepcion usa OC aprobadas/parciales, multiples recepciones, actualiza `Surtidos`, inventario y series | Reusar reglas, no UI | Vigente |
| `inspector/docs/compras/legacy-sknc/06_MODELO_DATOS_OC.md` | 2026-08-18 | Tablas legacy | `OrdendeCompraPT` mezcla cabecera/detalle; usa `idProducto`, `idVariante`, `Surtidos`; recepcion toca `Compras`, `ComprasDet`, `fcComprasPT*`, `fcProductosSeriales*`, `fcexistenprod` | Normalizar en CheckApp | Vigente |
| `inspector/docs/compras/legacy-sknc/11_REGLAS_NEGOCIO_OC.md` | 2026-08-18 | Reglas OC/REC | Crear OC no aumenta inventario fisico; recepcion parcial y sobrerecepcion existen; aprobacion no mueve inventario | Sobrerrecepcion requiere regla PO si se adopta | Vigente conceptual |
| `inspector/checklist/docs/activos/ORDENES_COMPRA_REPORTE_AUDITORIA_20260806.md` | 2026-08-06 | Reporte OC NEXT | DynamicGrid/reporte necesita convergencia CheckApp; fecha, KPI y accion Nueva ya auditados | Reporte lider congelado por esta tarea | Parcial para reporte |
| `inspector/docs/ordenes-compra/ORDENES_COMPRA_AUDITORIA_Y_PLAN.md` | 2026-08-05 | Plan OC desde referencia Raramuri | Recomendaba OC administrativa multitenant sin mover inventario al crear | Permisos finos pendientes | Vigente como antecedente |
| `inspector/docs/productos-servicios/AUDITORIA_BASE_DATOS_PRODUCTOS_SERVICIOS_20260909.md` | 2026-09-09 | PS codigo/schema declarado | Producto/Servicio, unidad base, variantes, presentaciones venta, inventario, `UsaNumeroSerie`; conteos fisicos estaban pendientes en esa fecha | PrecioPublico por unidad base aprobado en T10 | Vigente, complementado por T15-T24 |
| `inspector/docs/productos-servicios/TICKET_09_PRESENTACIONES_VENTA_AUDITORIA_FASE1_2026-09-03.md` | 2026-09-03 | Presentaciones venta | Presentacion base 1:1 y adicionales con precio independiente para venta | No decide compra | Vigente |
| `inspector/docs/database/POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md` | 2026-09-16 | AuthZ PS y T25 | Permisos `05000000`-`05001005`; padres no conceden hijos; T25 frozen | No cambiar codigos sin PO | Vigente |
| `inspector/docs/pattern/PATRON_CHECKAPP_GOLDEN_MASTER_COMPONENT_MATRIX_20260917.md` | 2026-09-17 | UI/UX CheckApp | ProductosServicios es Golden Master literal; DynamicGrid, tokens y modales oficiales | Comparacion runtime A-Y requerida cuando aplique | Vigente |
| `inspector/AGENTS.md` y `inspector/CLAUDE.md` | 2026-09-16/17 | Bitacora operativa | T25 frozen, ProductosServicios Golden Master, permisos granulares, SuperAdmin protegido | No reabrir T25 ni modificar codigos PS | Vigente |

## As-is NEXT OC

Fuentes: `inspector/checklist/Views/Activos/OrdenesCompra/Nueva.cshtml`, `inspector/checklist/wwwroot/js/Activos/OrdenesCompra/OrdenesCompra.js`, `inspector/checklist/Controllers/Activos/OrdenesCompraController.cs`, `inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`, `inspectorapi/checklistWs/Models/OrdenesCompra/OrdenesCompraModels.cs`, `inspectorapi/checklistWs/Scripts/ordenes-compra-up.sql`.

Estado actual:

| Elemento | Estado | Evidencia | Clasificacion |
|---|---|---|---|
| Wizard 4 pasos | Configuracion, Productos y servicios, Partidas, Revisar y guardar | `Nueva.cshtml` + JS | OK, pero debe evolucionar |
| Encabezado | `idRazonSocial`, `idSucursal`, `idProveedor`, fechas, observaciones | DTO/API/SQL | OK |
| Partidas | `idProductoServicio`, tipo, codigo/nombre/unidad snapshot, cantidad, costo, total | `OrdenesCompraDetalle` | Incompleto |
| Producto/Servicio | Busca `ProductosServicios` activos por `Tipo` 1/2 | `BuscarProductosServiciosOrdenCompra` | OK base |
| Variante | No se captura ni persiste | no existe campo `idVariante` en DTO/SQL | Debe evolucionar |
| Presentacion | No se captura ni persiste | no existe campo `idPresentacion` | Pendiente PO |
| Recepcion | No existe en NEXT OC | sin controller/modelo/tabla | Falta |
| Series | No existe en OC/Recepcion NEXT | PS tiene `UsaNumeroSerie` | Falta |
| Inventario | Crear/generar OC no toca inventario | API no escribe PS existencias/movimientos | OK como regla, incompleto para recepcion |
| Estados | 1 Borrador, 2 Generada, 3 Cancelada | constantes API y CHECK SQL | Debe evolucionar |
| Totales | Subtotal=Total, sin impuestos | SQL CHECK y calculos API | Incompleto si se requieren impuestos |
| Folio | `OrdenesCompraFolios`, `UPDLOCK/HOLDLOCK`, padding 6 | API/script | OK |
| Permisos | `[Authorize]`, proxy HMAC, sin permiso funcional propio OC | MVC/API | Incompleto |
| Tenant | `idEmpresa` resuelto y validado por proxy/claims | `TryResolveRequestContext` | OK base, no AuthZ funcional |

## As-is Legacy OC

Legacy es solo lectura en `/Users/denissemendiola/dev/skncCreator`.

Estado funcional:

- Captura en `/OrdenesCompra/Index`; reporte operativo en `/OrdenesCompra/ReporteOC`.
- Modelo fisico principal: `OrdendeCompraPT`, con cabecera repetida por partida.
- Producto real: `fcproductos`; variante real: `fcvariantes`; SKU opcional: `fcSkus`.
- Estados observados: `0 Nuevo`, `1 Surtido`, `2 Cancelado`, `3 Parcial`, `4 Terminado`, `5 Sobrerrecibido`, `6 Aprobado`.
- Aprobacion por `OrdendeCompraAprobaciones` y `Firma1..Firma5`.
- Creacion incrementa demanda/pedido en legacy, no existencia fisica; recepcion mueve inventario.
- Reporte permite acciones operativas: editar, cancelar, duplicar, modificar fechas/proveedor/unidad, PDF/correo, terminar parcial.

Reglas utiles a migrar: recepcion parcial, multiples recepciones por OC, trazabilidad de cambios, separacion de inventario hasta recepcion, serie ligada a producto/variante, estados de pendiente/recibido.

Reglas que no deben migrarse: cabecera repetida, `MAX(Folio)+1`, permisos frontend-first, SQL masivo en controller, UI legacy, sobrerecepcion sin politica explicita.

## As-is Recepcion Legacy

Fuentes: `RecepcionGController.cs`, `Scripts/Recepcion/recepcion.js`, auditorias legacy.

Flujo:

1. Filtra razon/proveedor/folio de OC con `OrdendeCompraPT.Estatus IN (6,3)`.
2. `GetDatOC` calcula pendiente por partida como `Cantidad - Surtidos`.
3. `Guardar` valida folio documental de compra por OC/proveedor.
4. Inserta/actualiza `Compras`, `ComprasDet`, `fcComprasPT`, `fcComprasPTDet`.
5. Actualiza `OrdendeCompraPT.Surtidos`.
6. Actualiza inventario en `fcexistenprod`: suma cantidad recibida y resta `Pedido`.
7. Recalcula estatus por partida: total `1`, parcial `3`, sobre `5`.
8. Inserta series en `fcProductosSeriales` y `fcProductosSerialesCardex` cuando llegan en payload.

Hallazgo importante: el codigo contiene UI de series parcialmente comentada en JS, pero backend mantiene insercion/validacion de seriales. Para NEXT debe diseniarse limpio, no copiar el mecanismo.

## ProductosServicios vigente

Modelo real en codigo/contrato:

- `ProductosServicios`: `Tipo` 1 Producto / 2 Servicio, `Codigo`, `Nombre`, `Descripcion`, `idCategoria`, `idMarca`, `idUnidadMedida`, `Costo`, `PrecioPublico`, `CausaInventario`, `PermiteVentaSinExistencia`, `UsaNumeroSerie`, `Activo`.
- `ProductosServiciosUnidadesMedida`: unidad base y conversiones de catalogo.
- `ProductosServiciosExistencias`: existencia por `idEmpresa + idProductoServicio`, sin sucursal ni variante.
- `ProductosServiciosMovimientosInventario`: historial por producto/servicio, cantidad, saldo, costo.
- `ProductosServiciosOpcionesVariante`, `ProductosServiciosOpcionesVarianteValores`, `ProductosServiciosVariantes`, `ProductosServiciosVarianteValores`: modelo de variantes.
- `ProductosServiciosPresentacionesVenta`: presentaciones de venta con `CantidadVenta`, `idUnidadVenta`, `EquivalenciaBase`, `Precio`, `EsPredeterminada`.
- `ProductosServiciosMultimedia`, tags, atributos y catalogos relacionados.

Reglas vigentes:

- Servicio no debe causar inventario; CHECK declarado: `Tipo = 1 OR (idMarca IS NULL AND CausaInventario = 0 AND PermiteVentaSinExistencia = 0)`.
- PrecioPublico es por una unidad base; presentacion base 1:1 y adicionales independientes.
- Variantes son comerciales y pueden tener SKU, costo/precio e imagen propios.
- `UsaNumeroSerie` existe como flag de control; no hay tabla de series en ProductosServicios.
- Inventario actual no distingue variante/sucursal en el scope PS vigente; Recepcion OC debe decidir si extiende scope OC/Recepcion o propone evolucion futura de inventario.

## Decisiones PO ya aprobadas

- Variantes en OC: APROBADO.
- Compra de Productos: APROBADO.
- Compra de Servicios: APROBADO.
- OC mixta Productos + Servicios: APROBADO.
- Numeros de serie en Recepcion cuando aplique: APROBADO.
- T25: FROZEN.
- Reporte lider: FROZEN.

## Presentaciones en OC

### Opcion A: comprar solo Unidad Base

Pros:

- Menor schema y menor riesgo.
- Mantiene inventario simple: cantidad OC y recepcion siempre en unidad base.
- Evita doble conversion y separa claramente ventas de compras.

Contras:

- Mala UX para proveedor si compra se pacta en cajas/bultos.
- El ejemplo caja 12 piezas obliga capturar 24 piezas, no 2 cajas.
- Pierde snapshot comercial de empaque proveedor.
- Parciales se vuelven menos naturales: recibir 1 caja se captura como 12 piezas.

Dictamen: tecnicamente segura, operativamente pobre para compras reales.

### Opcion B: comprar usando Presentaciones actuales

Pros:

- Reusa `ProductosServiciosPresentacionesVenta`.
- Ya existe `EquivalenciaBase` y presentacion base/adicional.
- Permite ejemplo caja 12: ordenar 2 cajas, recibir 1 caja y sumar 12 unidades base.

Contras:

- Semantica actual es venta, no compra.
- Precio de presentacion actual es precio de venta, no costo proveedor.
- Riesgo de contaminar UX y reportes con empaques de venta que no coinciden con proveedor.
- Cambios futuros a presentacion de venta podrian afectar historico si no se snapshottea estrictamente.

Dictamen: util como puente si PO exige rapidez, pero con riesgo alto de significado.

### Opcion C: separar Presentacion Venta y Presentacion Compra

Pros:

- Contrato semanticamente correcto: presentacion venta no se mezcla con compra.
- Permite proveedor/compra: caja, paquete, tarima, bulto, equivalencia a unidad base y costo.
- Permite snapshot historico claro: `CantidadPresentacion`, `FactorConversionSnapshot`, `UnidadBaseSnapshot`.
- Reduce riesgo de cambios de venta afectando compras.
- Mejor base para parciales: ordenado 2 cajas x12, recibido 1 caja, inventario +12 base, pendiente 1 caja.

Contras:

- Mayor alcance de schema/API/UI.
- Requiere definir si presentaciones compra viven globales por producto o por proveedor.
- Requiere ticket propio y decision PO.

Recomendacion PM/PO: Opcion C. Si se necesita MVP rapido, usar A y dejar C como fase siguiente; no se recomienda B salvo aprobacion explicita de riesgo.

`REQUIERE_DECISION_PO_PRESENTACIONES_OC`: decidir A/B/C. Recomendacion: C.

## Propuesta OC

### Wizard recomendado

Conservar 4 pasos, pero fusionar semantica de seleccion y partida en una experiencia menos artificial:

1. Configuracion: razon social, sucursal, proveedor, fechas, observaciones.
2. Seleccion de partidas: buscador Producto/Servicio, selector de variante si aplica, presentacion/unidad segun decision PO, cantidad, costo, notas.
3. Partidas y validaciones: tabla editable con pendientes, duplicados, snapshots, totales y alertas de variantes/series/presentaciones.
4. Revisar y generar: resumen, reglas de recepcion futura, guardar borrador/generar.

Motivo: el paso actual 2 agrega y el 3 edita; se conserva por familiaridad, pero el nuevo contrato debe evitar duplicados por `ProductoServicioId` cuando hay variantes/presentaciones diferentes.

### Modelo partida recomendado

Usar nombres reales donde existen y agregar campos nuevos solo como propuesta:

```text
OrdenCompraPartida
- id
- idEmpresa
- idOrdenCompra
- NumeroPartida
- TipoPartida [Producto|Servicio]
- idProductoServicio
- idVariante NULL
- idPresentacionCompra NULL / idPresentacionVenta NULL segun decision PO
- idUnidadMedidaBase
- UnidadCapturaSnapshot
- FactorConversionSnapshot NULL
- CodigoSnapshot
- NombreSnapshot
- DescripcionSnapshot
- VarianteSnapshot
- PresentacionSnapshot
- CantidadOrdenada
- CantidadRecibidaAcumulada
- CantidadPendiente
- CostoUnitario
- Subtotal
- Total
- ControlSerie
- EstadoPartida
- Activo/fechas/auditoria
```

Relacion viva vs snapshot:

- Vivas: `idProductoServicio`, `idVariante`, `idPresentacion...`, `idUnidadMedidaBase`, `idProveedor`, `idRazonSocial`, `idSucursal`.
- Snapshots obligatorios: codigo/nombre/descripcion, tipo, unidad, variante, presentacion, factor, costo, flags `CausaInventario`/`UsaNumeroSerie`, proveedor/razon/sucursal visible.
- Una OC historica no cambia si cambia catalogo, costo, unidad, variante o factor.

### Estados OC

Propuesta:

```text
Borrador -> Emitida/Generada -> ParcialmenteRecibida -> Recibida
        \-> Cancelada
Emitida/Generada -> Cancelada, si no tiene recepciones o con regla PO
ParcialmenteRecibida -> Cancelada/CerradaManual, solo con regla PO
```

Mapeo actual:

- `1 Borrador`: existe.
- `2 Generada`: existe; renombrar funcionalmente a Emitida/Generada.
- `3 Cancelada`: existe.
- `4 ParcialmenteRecibida`: nuevo.
- `5 Recibida`: nuevo.
- `6 CerradaManual`: solo si PO aprueba cierres con pendientes.

OC mixta: producto completo + servicio pendiente no es `Recibida`.

## Propuesta Recepcion NEXT

### Wireflow Recepcion

1. Identificar OC: buscar por folio/proveedor/razon/sucursal/estado; solo OCs Generadas/ParcialmenteRecibidas.
2. Ver pendientes: partidas con ordenado, recibido acumulado, pendiente, tipo, variante, presentacion/unidad, control serie.
3. Capturar esta recepcion: cantidades por partida; servicios capturan cumplimiento/cantidad/observaciones; productos inventariables capturan entrada.
4. Series: solo para producto con `UsaNumeroSerie = true` y cantidad recibida > 0; serie por unidad base seriada.
5. Revisar: validar totales, series, pendientes, inventario y snapshot.
6. Confirmar: transaccion atomica recepcion + partidas + series + movimientos/existencias + estado OC.

### Parciales

Campos:

- `CantidadOrdenada`
- `CantidadRecibidaAcumulada`
- `CantidadPendiente`
- `CantidadEstaRecepcion`

Reglas:

- N recepciones por OC.
- No sobre-recibir salvo decision PO explicita.
- Reintentos deben ser idempotentes por `IdempotencyKey` de recepcion.
- Confirmacion debe bloquear/serializar OC+partidas durante actualizacion.

### Recepcion de servicios

Servicio no genera inventario ni serie por defecto. Debe permitir:

- cantidad/cumplimiento parcial o total;
- costo y subtotal historico;
- fecha de cumplimiento;
- observaciones;
- evidencia futura.

Un servicio pendiente mantiene OC pendiente aunque todos los productos esten recibidos.

### Series

Aplica solo cuando:

- `TipoPartida = Producto`;
- `UsaNumeroSerie = true`;
- cantidad recibida exige seriales;
- no aplica a Servicio ni producto no serializado.

Reglas:

- Serie no vacia.
- Cantidad de series = cantidad recibida seriada.
- No duplicada en la misma recepcion.
- No duplicada historicamente para `idEmpresa` cuando el negocio lo exija.
- Asociada a `RecepcionPartida` y trazable a OC/partida.
- Si hay variante, serie debe quedar ligada a la variante recibida.

### Inventario

Crear OC no aumenta existencia. Recepcion de Producto inventariable es evento de entrada. Servicio no mueve inventario.

Transaccion atomica propuesta:

```text
Begin Serializable
  Validar OC/partidas/idEmpresa/estado
  Insert RecepcionesOC
  Insert RecepcionesOCDetalle
  Insert RecepcionesOCSeries
  Insert ProductosServiciosMovimientosInventario o scope equivalente
  Upsert ProductosServiciosExistencias o scope equivalente
  Actualizar recibido acumulado / estado partida / estado OC
Commit
```

Nota: PS existencias no distingue variante/sucursal hoy. Si Recepcion OC requiere inventario por variante/sucursal, no debe forzarse en PS actual sin contrato versionado; debe proponerse scope OC/Inventario o evolucion de PS con decision tecnica/PO.

## Proveedores, razon social y sucursal

Reusar:

- `ActivosProveedores` para proveedor.
- `RazonesSociales` para razon social.
- `Sucursales` para sucursal.

Reglas:

- Validar server-side `idEmpresa`.
- Sucursal debe pertenecer a razon social cuando aplique.
- Proveedor activo al capturar, snapshot al generar.
- No duplicar catalogos.
- No confiar en `idEmpresa` frontend.

## Permisos

Permisos actuales confirmados:

- `05000000` Proveeduria, agrupador.
- `05001000` Productos y Servicios, agrupador.
- `05001001` ABC Productos y Servicios.
- `05001002` Catalogos, agrupador.
- `05001003` Categorias.
- `05001004` Marcas.
- `05001005` Unidades de medida.

OC actual no tiene permiso funcional fino localizado; usa `[Authorize]` y menu visible. Propuesta sin inventar codigo definitivo:

- Proveeduria debe seguir como agrupador.
- OC Nueva y OC Reporte requieren codigos funcionales propios.
- Recepcion OC requiere codigo funcional propio si no existe en RolesPermisos.

`REQUIERE_DECISION_PO_CODIGO_RECEPCION_OC`: SI, la auditoria no encontro codigo vigente para Recepcion OC NEXT. Propuesta PM/PO: reservar bajo Proveeduria junto a OC, con padre agrupador solo Acceso y pantalla funcional Acceso+Escritura.

## Multitenant

Reglas:

- Todas las tablas OC/Recepcion/Series deben incluir `idEmpresa`.
- Todas las FK funcionales deben validar `idEmpresa + id`.
- Resolver empresa server-side por claims/proxy firmado; request no es autoridad.
- Cross-tenant fail-closed.
- Proveedor/producto/servicio/variante/presentacion/sucursal/razon deben validarse contra `idEmpresa`.
- Series deben ser unicas/consultables por empresa.

## Scope recomendado

Crear scope versionado `OrdenesCompraRecepcion` o evolucionar `OrdenesCompra` a scope autosuficiente con OC+Recepcion. Recomendacion: `OrdenesCompraRecepcion`, porque recepcion y series son inseparables del ciclo de OC.

Debe aplicar:

- `DatabaseIdentity + Scope`.
- contrato versionado/hash.
- bootstrap EMPTY.
- adopcion historica si las tablas actuales existen.
- migraciones con History/Attempts.
- lock SQL por scope.
- gate CRUD.
- T18 drift.
- transacciones e idempotencia.
- tests/runtime/QA/regresion.

No ejecutar DDL manual final.

## Tablas

Existentes NEXT:

- `OrdenesCompraFolios`
- `OrdenesCompra`
- `OrdenesCompraDetalle`
- `ProductosServicios`
- `ProductosServiciosUnidadesMedida`
- `ProductosServiciosVariantes`
- `ProductosServiciosPresentacionesVenta`
- `ProductosServiciosExistencias`
- `ProductosServiciosMovimientosInventario`
- `ActivosProveedores`
- `RazonesSociales`
- `Sucursales`

Modificar propuestas:

- `OrdenesCompra`: nuevos estados, campos de recepcion/cierre si aplica, snapshots proveedor/razon/sucursal si no quedan en tabla historica.
- `OrdenesCompraDetalle`: `idVariante`, `idPresentacion...`, unidad/factor snapshot, cantidades recibidas, estado partida, control serie, snapshots.
- `OrdenesCompraFolios`: mantener.

Nuevas propuestas:

- `OrdenesCompraRecepciones`
- `OrdenesCompraRecepcionDetalle`
- `OrdenesCompraRecepcionSeries`
- `OrdenesCompraHistorialEstado`
- `OrdenesCompraAttempts` o integrar con Attempts del scope schema para idempotencia operativa segun patron

Indices/constraints propuestos:

- `OrdenesCompra(idEmpresa, Folio)` UNIQUE filtrado.
- `OrdenesCompra(idEmpresa, Estado, FechaOrden)`.
- `OrdenesCompra(idEmpresa, idProveedor, Estado)`.
- `OrdenesCompraDetalle(idEmpresa, idOrdenCompra, NumeroPartida)` UNIQUE activo.
- `OrdenesCompraDetalle(idEmpresa, idProductoServicio, idVariante)`.
- `OrdenesCompraRecepciones(idEmpresa, idOrdenCompra, FechaRecepcion)`.
- `OrdenesCompraRecepcionDetalle(idEmpresa, idRecepcion, idOrdenCompraDetalle)`.
- `OrdenesCompraRecepcionSeries(idEmpresa, NumeroSerie)` UNIQUE segun politica.
- CHECK cantidades `> 0`, recibido acumulado `<= ordenado` salvo sobrerrecepcion aprobada.

## API

Endpoints existentes OC:

- `GET api/OrdenesCompra/ObtenerOrdenesCompra`
- `GET api/OrdenesCompra/ObtenerOrdenCompra`
- `POST api/OrdenesCompra/GuardarBorradorOrdenCompra`
- `POST api/OrdenesCompra/GenerarOrdenCompra`
- `POST api/OrdenesCompra/CancelarOrdenCompra`
- `GET api/OrdenesCompra/ObtenerResumenOrdenesCompra`
- `GET api/OrdenesCompra/ObtenerCombosOrdenCompra`
- `GET api/OrdenesCompra/BuscarProductosServiciosOrdenCompra`
- `POST api/OrdenesCompra/ValidarPendientesOrdenCompra`
- exportaciones PDF/Excel via MVC/API.

Endpoints PS relevantes existentes:

- `GET api/ProductosServicios/ObtenerProductosServicios`
- `GET api/ProductosServicios/ObtenerProductoServicio`
- `GET api/ProductosServicios/ObtenerCombosProductosServicios`
- inventario: entradas/salidas/ajustes y movimientos.

Endpoints propuestos:

- `GET api/OrdenesCompra/ObtenerContratoCaptura`
- `GET api/OrdenesCompra/BuscarPartidasCompra`
- `POST api/OrdenesCompra/GuardarBorradorOrdenCompraV2`
- `POST api/OrdenesCompra/GenerarOrdenCompraV2`
- `GET api/OrdenesCompra/ObtenerOrdenCompraRecepcionable`
- `GET api/OrdenesCompra/ObtenerPendientesRecepcion`
- `POST api/OrdenesCompra/PrevalidarRecepcionOrdenCompra`
- `POST api/OrdenesCompra/ConfirmarRecepcionOrdenCompra`
- `GET api/OrdenesCompra/ObtenerRecepcionesOrdenCompra`
- `GET api/OrdenesCompra/ObtenerRecepcionOrdenCompra`
- `POST api/OrdenesCompra/CancelarRecepcionOrdenCompra` solo si PO aprueba reversa.

Errores:

- 400 validacion de contrato.
- 401/403 auth/authz.
- 404 entidad no disponible para empresa.
- 409 concurrencia/idempotencia/sobre-recepcion/serie duplicada.
- 503 gate schema incompatible.

## Comparativo obligatorio

| Capacidad | Legacy OC | Legacy Recepcion | NEXT OC | ProductosServicios actual | Propuesta OC | Propuesta Recepcion | Decision/Estado |
|---|---|---|---|---|---|---|---|
| Proveedor | `fcproveedores` | valida proveedor/folio | `ActivosProveedores` | N/A | reutilizar `ActivosProveedores` + snapshot | visible en recepcion | Aprobado |
| Razon | `RazonesSociales` | filtro y documento | `RazonesSociales` | N/A | reutilizar + snapshot | mostrar/validar | Aprobado |
| Sucursal/almacen | almacen legacy | recibe a almacen/seccion | sucursal | PS inventario sin sucursal | sucursal cabecera | decidir destino inventario | Requiere diseno |
| Folio | `MAX+1` | folio compra proveedor | `OrdenesCompraFolios` | N/A | mantener seguro | folio recepcion propio | Aprobado tecnico |
| Estados | 0/1/2/3/4/5/6 | parcial/total/sobre | 1/2/3 | N/A | agregar parcial/recibida | controla cierre | Debe evolucionar |
| Producto | `fcproductos` | producto recibido | `ProductosServicios` | Tipo=1 | compra producto | inventario | Aprobado |
| Servicio | no claro como PS | no inventario | soporta Tipo=2 | Tipo=2 sin inventario | compra servicio | cumplimiento | Aprobado |
| Mixta | no modelo PS mixto | N/A | permite por Tipo | Producto/Servicio | una OC mixta | cierre por todos | Aprobado |
| Variante | `fcvariantes` | recibe variante | no existe | `ProductosServiciosVariantes` | obligatoria si aplica | serie liga variante | Aprobado |
| Presentacion | caja legacy | cantidad/caja parcial | no existe | PresentacionesVenta | A/B/C | factor snapshot | Pendiente PO |
| Unidad | legacy `fcunidades` | unidad/compra | unidad base snapshot | unidad base | unidad captura/base | conversion atomica | Diseno |
| Costo | editable | editable condicionado | costo unitario | costo maestro/variante | snapshot | costo recepcion historico | Diseno |
| Parciales | `Surtidos` | si | no | N/A | recibido acumulado | N recepciones | Aprobado por diseno |
| Series | `fcProductosSeriales*` | si | no | `UsaNumeroSerie` flag | flag snapshot | tabla series | Aprobado |
| Inventario | Pedido al crear | existencia al recibir | no mueve | existencias/movimientos | no mueve | entrada producto | Aprobado |
| Cancelacion | si | parcial/manual | si | N/A | mantener con reglas | reversa pendiente | Parcial |
| Permisos | frontend-first | frontend-first | Authorize | codigos PS | AuthZ fino OC | AuthZ fino REC | Pendiente codigo |
| Tenant | cookie/cadena | cookie/cadena | proxy HMAC/idEmpresa | hardening T20-T24 | fail-closed | fail-closed | Aprobado tecnico |
| Schema | legacy no versionado | legacy no versionado | script manual | scope versionado | scope versionado | scope versionado | Requerido |
| Responsive | legacy | legacy | CheckApp parcial | Golden Master | CheckApp complejo | CheckApp complejo | Requerido |

## Modelo de datos textual

```text
EXISTE/MODIFICAR OrdenesCompra
  1:N EXISTE/MODIFICAR OrdenesCompraDetalle
    N:1 EXISTE ProductosServicios
    N:0..1 EXISTE ProductosServiciosVariantes
    N:0..1 NUEVA/EXISTE PresentacionCompra o PresentacionesVenta
    1:N NUEVA OrdenesCompraRecepcionDetalle

NUEVA OrdenesCompraRecepciones
  N:1 EXISTE/MODIFICAR OrdenesCompra
  1:N NUEVA OrdenesCompraRecepcionDetalle
    N:1 EXISTE/MODIFICAR OrdenesCompraDetalle
    1:N NUEVA OrdenesCompraRecepcionSeries

EXISTE ProductosServiciosExistencias / ProductosServiciosMovimientosInventario
  recibe evento desde Recepcion OC si Producto + CausaInventario
```

## Reglas de negocio

### RB-OC

- RB-OC-001: Crear/guardar OC no incrementa existencia fisica. Fuente: LEGACY/NEXT.
- RB-OC-002: Generar OC requiere al menos una partida y total mayor a cero. Fuente: NEXT.
- RB-OC-003: Partida debe referir entidad real `ProductosServicios.id`, no solo texto. Fuente: PRODUCTOSSERVICIOS/PROPUESTA PMPO.
- RB-OC-004: Servicio puede comprarse y no genera inventario por defecto. Fuente: DECISION PO/PRODUCTOSSERVICIOS.
- RB-OC-005: Una OC puede mezclar Productos y Servicios. Fuente: DECISION PO.
- RB-OC-006: Variante debe capturarse si el producto tiene variantes aplicables. Fuente: DECISION PO/PRODUCTOSSERVICIOS.
- RB-OC-007: Presentacion OC queda pendiente por A/B/C; no implementar sin PO. Fuente: PENDIENTE PO.
- RB-OC-008: La partida debe conservar snapshot de descripcion, unidad, variante, presentacion/factor y costo. Fuente: PROPUESTA PMPO.
- RB-OC-009: Folio debe reservarse con lock/transaccion por empresa. Fuente: NEXT.
- RB-OC-010: OC no queda Recibida hasta que todas las partidas producto/servicio esten completas. Fuente: PROPUESTA PMPO.
- RB-OC-011: Cancelacion de OC con recepciones requiere politica PO. Fuente: PROPUESTA PMPO.
- RB-OC-012: Cross-tenant en cabecera/partidas debe fallar cerrado. Fuente: PRODUCTOSSERVICIOS/T20-T24.

### RB-REC

- RB-REC-001: Solo OCs Generadas/ParcialmenteRecibidas son recepcionables. Fuente: LEGACY/PROPUESTA PMPO.
- RB-REC-002: Recepcion parcial permitida. Fuente: LEGACY/PROPUESTA PMPO.
- RB-REC-003: No sobre-recibir sin regla PO. Fuente: PROPUESTA PMPO.
- RB-REC-004: `CantidadEstaRecepcion` debe ser mayor a cero por partida recibida. Fuente: LEGACY/PROPUESTA PMPO.
- RB-REC-005: Producto inventariable genera movimiento y existencia en una transaccion. Fuente: LEGACY/PRODUCTOSSERVICIOS.
- RB-REC-006: Servicio recibido no mueve inventario ni requiere serie. Fuente: DECISION PO/PRODUCTOSSERVICIOS.
- RB-REC-007: Producto con `UsaNumeroSerie` requiere series coherentes con cantidad. Fuente: DECISION PO/PRODUCTOSSERVICIOS.
- RB-REC-008: Serie no puede duplicarse en recepcion ni historico segun politica de empresa. Fuente: LEGACY/PROPUESTA PMPO.
- RB-REC-009: Serie debe asociarse a variante recibida si la partida tiene variante. Fuente: DECISION PO/PROPUESTA PMPO.
- RB-REC-010: Si se compra por presentacion, el factor usado es snapshot historico. Fuente: PROPUESTA PMPO.
- RB-REC-011: Confirmar recepcion debe ser idempotente. Fuente: PATRON T19/PROPUESTA PMPO.
- RB-REC-012: Estado OC se recalcula tras cada recepcion. Fuente: LEGACY/PROPUESTA PMPO.

## Riesgos criticos

| Riesgo | Severidad | Mitigacion |
|---|---|---|
| Doble conversion presentacion/unidad | Alta | snapshot factor, decision PO A/B/C, tests caja 12 |
| Usar presentacion venta como compra sin semantica | Alta | recomendar C o A temporal |
| Sobre-recepcion accidental | Alta | bloquear por defecto, 409, decision PO explicita |
| Serie duplicada | Alta | UNIQUE/validacion server-side por empresa |
| Serie variante A asociada a B | Alta | FK/logica `RecepcionDetalle -> Partida -> Variante` |
| Inventario no atomico | Alta | transaccion Serializable y retry idempotente |
| OC mixta marcada recibida con servicio pendiente | Alta | state machine por partida |
| Cambio de catalogo altera historico | Alta | snapshots obligatorios |
| Cross-tenant | Alta | validar `idEmpresa + id`, fail closed |
| PS inventario sin variante/sucursal | Media/Alta | decidir scope inventario antes de recepcion productiva |
| Permiso recepcion inventado | Media | decision PO codigo permiso |
| Reporte lider alterado | Alta | frozen, no tocar |

## Tickets de implementacion propuestos

| Ticket | Objetivo | Alcance | Dependencia | DoD | Evidencia |
|---|---|---|---|---|---|
| OC-01 | Contrato funcional/schema OC V2 | Scope, modelo, estados, snapshots, variantes, presentaciones placeholder | Decision presentaciones para campo final | contrato versionado sin DDL manual | documento + tests contrato |
| OC-02 | AuthZ Proveeduria OC | codigos OC Nueva/Reporte | decision codigo | padres no conceden hijos | tests AuthZ |
| OC-03 | API partidas Producto/Servicio/Variante | buscar/capturar partida real | OC-01 | 403/404/409 correctos | tests API |
| OC-04 | UI wizard OC V2 | wireflow CheckApp | OC-03 | desktop/tablet/mobile | screenshots QA |
| OC-05 | Migracion/adopcion OC actual | adoptar `OrdenesCompra*` existentes | OC-01 | History/Attempts/gate | T18 drift |
| REC-01 | Contrato recepcion | recepcion, detalle, series, estados | OC-01 | schema versionado | tests contrato |
| REC-02 | API parciales | pendientes, confirmar, recalcular | REC-01 | no sobre-recibir | tests API |
| REC-03 | Series | captura/validacion/trazabilidad | REC-02 | duplicados bloqueados | tests serie |
| REC-04 | Inventario | movimiento/existencia atomica | REC-02 | rollback/idempotencia | tests SQL |
| REC-05 | Recepcion servicios | cumplimiento parcial/total | REC-02 | sin inventario | tests mixtos |
| REC-06 | UI Recepcion | flujo CheckApp complejo | REC-02/03 | responsive | screenshots |
| QA-OCREC-01 | QA integral | OC+REC+PS+Legacy matrix | todos | PASS regresion | informe MOKA |

## Backlog recomendado

No alterar T11-T24 ni T25. OC/Recepcion deben abrirse como epica operativa nueva dentro de Proveeduria, relacionada con BL-03 si BL-03 es el backlog de Proveeduria/Compras actual. Si BL-03 ya esta comprometido con otro alcance, conviene crear sub-backlog operativo `BL-OCREC` para no contaminar ProductosServicios ni T25.

## Entrega MOKA obligatoria

1 auditorias previas encontradas: si, listadas arriba.  
2 decisiones previas vigentes: variantes, productos, servicios, mixta, series; T25/reporte lider frozen.  
3 OC NEXT estado: funcional administrativo, incompleto para variantes/presentaciones/recepcion/series.  
4 OC Legacy estado: ciclo completo con aprobacion/recepcion/inventario, no migrar diseno.  
5 Recepcion Legacy estado: parcial, inventario, series, estados por surtidos.  
6 modelo ProductosServicios vigente: Producto/Servicio, variantes, presentaciones venta, unidad base, inventario, `UsaNumeroSerie`.  
7 Variantes en OC: APROBADO.  
8 Servicios en OC: APROBADO.  
9 OC mixta: APROBADO.  
10 Series recepcion: APROBADO.  
11 Presentaciones opcion A: unidad base, segura pero pobre UX.  
12 opcion B: usar PresentacionesVenta, rapida pero semantica riesgosa.  
13 opcion C: PresentacionCompra separada, recomendada.  
14 recomendacion PM/PO: C; A como MVP temporal si urge.  
15 REQUIERE_DECISION_PO_PRESENTACIONES_OC: SI.  
16 wizard OC recomendado: conservar 4 pasos evolucionados, seleccion+partidas mas directa.  
17 modelo partida recomendado: ver contrato propuesto.  
18 snapshots: obligatorios para producto, variante, unidad, presentacion/factor, costo, proveedor/razon/sucursal.  
19 estados OC: Borrador, Generada, ParcialmenteRecibida, Recibida, Cancelada, posible CerradaManual.  
20 parciales: acumulado/pendiente/esta recepcion; N recepciones.  
21 recepcion servicios: cumplimiento/cantidad/fecha/observaciones sin inventario.  
22 series: solo producto serializado.  
23 variantes+series: serie ligada a variante recibida.  
24 inventario: solo al recibir producto inventariable.  
25 proveedores: reutilizar `ActivosProveedores`.  
26 razon/sucursal: reutilizar `RazonesSociales`/`Sucursales`.  
27 permisos actuales: PS `05000000`-`05001005`; OC sin permiso fino localizado.  
28 permiso Recepcion propuesto/pendiente: requiere decision PO codigo.  
29 multitenant: server-side, `idEmpresa + id`, fail closed.  
30 Scope recomendado: `OrdenesCompraRecepcion`.  
31 tablas existentes: `OrdenesCompra*`, PS, proveedores/razon/sucursal.  
32 tablas a modificar: `OrdenesCompra`, `OrdenesCompraDetalle`.  
33 tablas nuevas propuestas: recepciones, detalle recepcion, series, historial estado.  
34 indices/constraints: listados arriba.  
35 endpoints existentes: listados arriba.  
36 endpoints propuestos: listados arriba.  
37 wireflow OC: configuracion, seleccion, partidas, revision.  
38 wireflow Recepcion: identificar OC, pendientes, capturar, series, revisar, confirmar.  
39 comparativo Legacy/NEXT: matriz incluida.  
40 riesgos criticos: tabla incluida.  
41 reglas RB-OC: incluidas.  
42 reglas RB-REC: incluidas.  
43 tickets implementacion propuestos: incluidos.  
44 backlog recomendado: epica/sub-backlog Proveeduria, no T11-T24/T25.  
45 documento auditoria creado: `inspector/docs/compras/MOKA_AUDITORIA_OC_RECEPCION_COMPLETO_20260920.md`.  
46 AGENTS tocado: SI, solo hechos aprobados y enlace.  
47 CLAUDE tocado: SI, solo hechos aprobados y enlace.  
48 Legacy modificado: NO.  
49 DDL ejecutado: NO.  
50 migraciones ejecutadas: NO.  
51 Firebase: NO.  
52 Hosting: NO.  
53 Conexiones: NO.  
54 T25: FROZEN.  
55 reporte lider: FROZEN.  
56 5200 libre: verificar al cierre operativo.  
57 5127 libre: verificar al cierre operativo.  
58 8080 libre si Codex lo inicio: Codex no inicio 8080.  
59 decisiones que requiere PO: Presentaciones OC A/B/C; codigo permiso Recepcion OC; politica sobrerrecepcion/cierre manual; inventario por variante/sucursal si se requiere.  
60 siguiente ticket recomendado: OC-01 contrato funcional/schema.  
61 tarea del PO: decidir Presentaciones OC A/B/C y codigo Recepcion OC.  
62 dictamen: AUDITORIA COMPLETA LISTA PARA DECISION PO; NO IMPLEMENTAR HASTA CERRAR PRESENTACIONES Y PERMISOS.

## Control de ejecucion

- Legacy modificado: NO.
- DDL: NO.
- Migraciones: NO.
- Firebase: NO.
- Hosting: NO.
- Conexiones: NO.
- ProductosServicios modificado: NO.
- Proveedores/Sucursales modificados: NO.
- T25: FROZEN.
- Reporte lider: FROZEN.
