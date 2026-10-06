# LP-AUD-01 - Auditoria Lista de Precios

Fecha: 2026-09-28  
Estado: `AUDITORIA COMPLETA / LISTA PARA REVISION PO`  
Alcance: Tarahumara/Raramuri + sazapi solo lectura, contrastado contra modelo actual de CheckApp.  
Regla aplicada: no backlog, no tickets, no implementacion, no DDL, no modificaciones Legacy ni productivas CheckApp.

## 1. Resumen ejecutivo

La pantalla Legacy localizada en Tarahumara no administra una cabecera formal de "lista de precios" con nombre, moneda, vigencia, sucursal, cliente, prioridad o default. Su modelo real es un listado operativo por producto `barcode` que agrega tallas desde `dbo.precios` y expone hasta 10 listas paralelas como columnas fisicas: `precio`, `precio2`, `precio3`, `mayoreo`, `mayoreo2`, `mayoreo3`, `precio7`, `precio8`, `precio9`, `precio10`, con descuentos asociados.

El detalle real del precio vive en `dbo.precios` por `barcode + talla`. La pantalla agrupa por `barcode` para mostrar un renglon por articulo y actualiza rangos de talla completos. La bitacora/programacion se registra en `dbo.preciosl` cuando existe; los pendientes se aplican despues con `/productos/lista-precios/aplicar-pendientes`.

CheckApp actual no tiene Lista de Precios como modulo. Tiene `ProductosServicios.PrecioPublico` para una unidad base, `PrecioComparacion`, `Costo`, precios opcionales por variante y `ProductosServiciosPresentacionesVenta.Precio` para presentaciones de venta de productos. Servicios existen en ProductosServicios pero no exponen Unidad Base operativa segun PS-ACT-03/deuda tecnica vigente.

## 2. Fuentes

- Contrato de ejecucion: `/Users/denissemendiola/Downloads/MOKA_LP_AUD_01_AUDITORIA_LISTA_PRECIOS.txt`.
- MVC CheckApp: `inspector/AGENTS.md`, `inspector/CLAUDE.md`.
- API CheckApp: `inspectorapi/AGENTS.md`, `inspectorapi/CLAUDE.md`.
- Legacy frontend: `/Users/denissemendiola/dev/Raramuri.blzr/Raramuri.blzr/Components/Pages/ProductosListaPrecios.razor`.
- Legacy frontend service/modelos: `Services/Productos/ListaPreciosService.cs`, `IListaPreciosService.cs`, `Models/Productos/ListaPreciosModels.cs`.
- Legacy backend: `/Users/denissemendiola/dev/sazapi/Endpoints/Program.Endpoints.Productos.cs`, `Program.Helpers.cs`, `Endpoints/Program.Endpoints.Ventas.cs`, `Endpoints/Program.Endpoints.VentaPro.cs`.
- CheckApp API: `inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs`, `Models/ProductosServicios/ProductosServiciosModels.cs`, `Services/Tenant/ProductosServiciosSchemaContractProvider.cs`, `Services/ProductosServicios/ProductoPresentacionVentaPricingEngine.cs`.
- Documentacion CheckApp: `inspector/docs/productos-servicios/PS_ACT_01_PARTE1_CATALOGOS_COLECCIONES_ETIQUETAS_20260924.md`, `inspector/docs/productos-servicios/DEUDA_TECNICA_PS_UNIDAD_SERVICIO_20260928.md`, `inspector/docs/pattern/PATRON_CHECKAPP_CATALOGOS_V1_20260925.md`.

## 3. BEFORE Legacy

Raramuri BEFORE:
- Repo: `/Users/denissemendiola/dev/Raramuri.blzr`
- `git rev-parse HEAD`: `30b262230dbdc020a52c642a83b7e2f9e378479d`
- `git status --short`: sin salida observada.
- `git diff --stat`: sin salida observada.

sazapi BEFORE:
- Repo: `/Users/denissemendiola/dev/sazapi`
- `git rev-parse HEAD`: `88327a36316e9fd84a2e905fb3c21d3f09bfc104`
- `git status --short`: sin salida observada.
- `git diff --stat`: sin salida observada.

CheckApp referencia:
- `inspector` HEAD `15930e4f61c71cc5c2c3db8b3bbdc314a36068c2`
- `inspectorapi` HEAD `2e97e4ddf966c54322accabe2a3ab9e7814535df`
- Ambos sin salida observada en `status --short` y `diff --stat` antes del documento.

## 4. Mapa frontend

- Pagina/ruta: `ProductosListaPrecios.razor`, `@page "/productos/lista-precios"`.
- Layout: `DashboardLayout`; valida `SessionService.IsLoaded` y `SessionService.IsAuthenticated`, redirige a login si no hay sesion.
- Header: `TarahumaraOperationalPageHeader` con titulo "Lista de precios".
- Filtros: `FilterAccordion` con Linea, Sublinea, Clasificacion, Marca, Temporada, Proveedor condicionado por `PRODUCTOS_VER_COSTO`, Color, Acabado, Lista precio, Precio min/max, Costo min/max, Descuento, Tiendas de existencia, Existencia, Ventas por periodo y busqueda.
- Grid/listado: `MudDataGrid<ListaPreciosItemDto>` con paginador manual 100/200/400 y filtros por columna tipo Excel.
- Modales: editar precios, ajuste masivo, copiar lista, descuento por marca, columnas visibles, foto, sugerencias comerciales, quick view de movimientos.
- Servicios: `IListaPreciosService`/`ListaPreciosService` llama endpoints `productos/lista-precios/*`.
- DTOs: `ListaPreciosCatalogosDto`, `ListaPreciosItemDto`, requests de actualizar/ajuste/copiar/descuento y DTOs de matrices.
- Exportacion: `ExcelExportService.ListaPrecios(...)`.

## 5. Mapa backend

- Endpoints principales en `Endpoints/Program.Endpoints.Productos.cs`:
  - `GET /productos/lista-precios/catalogos`
  - `GET /productos/lista-precios/items`
  - `POST /productos/lista-precios/item/actualizar`
  - `POST /productos/lista-precios/ajuste`
  - `POST /productos/lista-precios/copiar-lista`
  - `POST /productos/lista-precios/descuento-marca`
  - `GET/POST/DELETE /productos/lista-precios/margen-utilidad`
  - `GET /productos/lista-precios/historial`
  - `GET /productos/lista-precios/reporte-cambios`
  - `POST /productos/lista-precios/aplicar-pendientes`
  - `GET /productos/lista-precios/ventas-matriz`, `devoluciones-matriz`, `transito-matriz`, `pedidos-matriz`, `curva-matriz`, `sugerencias`.
- Helpers principales en `Program.Helpers.cs`:
  - `GetListaPreciosCatalogosAsync`
  - `GetListaPreciosItemsAsync`
  - `TryMapListaCampo`
  - `ApplyListaPreciosItemUpdateAsync`
  - `GetListaPreciosHistorialAsync`
  - `EnsureListaPreciosIndexesAsync`
  - matrices y sugerencias `GetListaPrecios*Async`.
- Tablas Legacy usadas: `articulo`, `precios`, `preciosl`, `ArticuloExt`, `existen`, `detnotas`, `detdev`, `detped`, `pedidos`, `CurvasTienda`, `tiendas`, catalogos `lineas`, `sublinea`, `clasific`, `marcas`, `temporad`, `colores`, `acabados`, `departamentos`, `catalogo`, `corridas`, `empleado`, `margenutilidad`.

## 6. Flujo end-to-end

ENTRADA:
- Usuario entra a `/productos/lista-precios`.
- Frontend valida sesion y carga catalogos con `GetCatalogosAsync`.
- Backend abre tenant con `GetTenantConnectionStringAsync(user, cfg)`.

LISTADO/FILTROS:
- Usuario captura filtros y ejecuta `BuscarAsync`.
- Frontend llama `GET /productos/lista-precios/items`.
- Backend ejecuta `EnsureListaPreciosIndexesAsync` y `GetListaPreciosItemsAsync`.
- Persistencia consultada: `articulo` + `precios` y joins opcionales.
- Resultado: `ListaPreciosItemsResponse`.

ALTA:
- No existe alta de lista/cabecera. `NO EXISTE`.

CAPTURA/DETALLE:
- Usuario abre "Editar precios" sobre un articulo.
- Frontend precarga precio/costo/descuentos de `ListaPreciosItemDto`.
- No abre detalle por talla individual; el guardado opera sobre rango `Del-Al`.

PRODUCTOS/PRECIO/GUARDAR:
- `GuardarEditarAsync` envia `POST /productos/lista-precios/item/actualizar`.
- Backend `ApplyListaPreciosItemUpdateAsync` valida tablas, obtiene rango real en `dbo.precios`, actualiza `dbo.articulo`, `dbo.ArticuloExt` y/o `dbo.precios`.
- Si existe `dbo.preciosl`, inserta bitacora por talla/lista/costo.

EDITAR:
- Edicion directa en modal. Ajuste masivo, copiar lista y descuento por marca son acciones separadas.

BAJA/ESTATUS:
- No hay baja/reactivacion de lista de precios. El listado filtra `articulo.activo` salvo incluir inactivos en backend.

CONSUMO POSTERIOR:
- Ventas resuelve lista seleccionada 1..10 en `Endpoints/Program.Endpoints.Ventas.cs` usando columnas de `dbo.precios`.
- VentaPro sincroniza productos con `ResolveVentaProPrecioColumns`.

## 7. Funcionalidad

| Concepto | Estado | Evidencia |
|---|---|---|
| Nombre de lista | NO EXISTE | No hay cabecera; listas son numeros/columnas. |
| Codigo de lista | NO EXISTE | No hay entidad lista. |
| Descripcion | NO EXISTE para lista; EXISTE para articulo | `articulo.descri`, DTO `Descripcion`. |
| Estatus | NO EXISTE para lista; EXISTE para articulo | filtro `articulo.activo`; `preciosl.Status` para pendiente/aplicado. |
| Vigencia inicio/fin | PARCIAL | `preciosl.FechaAplicacion`; no fin. |
| Moneda | NO EXISTE | No se localiza campo moneda. |
| Impuestos | NO EXISTE en lista | Precio/descuento no incluyen regla IVA en Lista Precios. |
| Sucursal/tienda | PARCIAL | Filtros de existencia/matrices por tienda; precio no se guarda por tienda. |
| Empresa/tenant | EXISTE tecnico | `GetTenantConnectionStringAsync(user,cfg)` selecciona BD tenant. |
| Cliente/tipo cliente | NO EXISTE | No campo/regla localizada. |
| Canal | NO EXISTE como regla; PARCIAL campos articulo | `ArticuloExt.Web`, `Liverpool`, `ML` son flags/textos de articulo. |
| Prioridad/default | NO EXISTE | lista default se asume 1 en consumidores si request invalida. |
| Multiples listas | EXISTE | 10 columnas en `dbo.precios`. |
| Duplicidad | NO DETERMINABLE | No metadata fisica viva; codigo agrupa por barcode y usa filas por talla. |
| Historial | EXISTE | `dbo.preciosl`, `GetListaPreciosHistorialAsync`. |
| Auditoria | PARCIAL | usuario/fecha/modulo en `preciosl`; no modelo audit integral. |
| Baja/reactivacion | NO EXISTE para lista | No endpoint localizado. |
| Eliminacion fisica | NO EXISTE para lista | `DELETE margenutilidad` existe; no delete de listas. |

## 8. Listado/filtros/acciones

Columnas principales: foto, barcode, estilo, color, acabado, marca, descripcion, linea, costo, existencia, ventas, P1-D1 hasta P10-D10, flags/promociones y acciones. Costo se oculta si falta permiso `PRODUCTOS_VER_COSTO`.

Filtros server-side: linea, sublinea, clasificacion, marca, temporada, proveedor, color, acabado, lista precio, precio min/max, costo min/max, descuento, tiendas existencia, existencia, ventas fecha inicio/fin, q.

Acciones: buscar, limpiar, editar precios, ajuste masivo, copiar lista, descuento por marca, sugerencias, columnas visibles, exportar Excel, foto, quick view movimientos. No se encontro alta de lista, baja/reactivacion de lista ni duplicar lista como entidad; copiar lista actualiza columnas destino desde origen.

## 9. Alta/edicion

Alta de lista: `NO EXISTE`.

Edicion por articulo:
- Costo: decimal, requerido visualmente si se edita, no negativo, permiso `PRODUCTOS_EDITAR_COSTO`.
- Precio 1..10: decimal, no negativo, default desde fila.
- Descuento 1..10: decimal 0..100.
- Descripcion: texto, persiste en `articulo.descri`.
- Corrida manual: texto, persiste en `articulo.ubica`.
- Web/Liverpool/ML/Observaciones: texto, persiste en `ArticuloExt`.
- DosPorUno/TresPorDos/DescuentoSegundo/Monedero: booleanos en `articulo`.
- Fecha aplicacion/avisar/usuario: request soportado; usado para `preciosl` si aplica programacion.

Diferencia alta vs edicion: solo edicion. Ajuste masivo aplica campo/tipo/operacion/valor al resultado de filtros.

## 10. Detalle

| Campo detalle | Estado | Evidencia |
|---|---|---|
| Producto | EXISTE | `articulo` por `barcode`. |
| Codigo/barcode | EXISTE | `ListaPreciosItemDto.Id`, `dbo.precios.barcode`. |
| Talla | EXISTE en persistencia | `dbo.precios.talla`; frontend muestra rango `Del/Al`. |
| Variante | NO EXISTE como concepto separado | Se usa talla, color/acabado de articulo. |
| Presentacion | NO EXISTE | No tabla/endpoint de presentacion de venta. |
| Unidad | NO EXISTE para precio | No unidad en `precios`; talla no es unidad. |
| Cantidad | NO EXISTE en precio | Cantidades aparecen en ventas/existencias, no lista. |
| Costo | EXISTE | `dbo.precios.costo`. |
| Precio | EXISTE | 10 columnas de precio. |
| Descuento | EXISTE | 10 columnas de descuento. |
| Margen | DERIVADO | `GetListaPreciosItemsAsync` calcula `(precio-costo)/precio`. |
| Precio minimo | NO EXISTE | Solo filtros min/max, no restriccion persistida. |
| Impuestos | NO EXISTE | No campo localizado. |
| Vigencia por renglon | PARCIAL | `preciosl.FechaAplicacion` para cambios pendientes. |
| Otros | EXISTE | promociones `dosporuno`, `trespordos`, `descuentosegundo`, `monedero`. |

## 11. Producto/variante/presentacion

Legacy producto: `articulo` + `precios` por barcode. Color/acabado/marca/linea son catalogos legacy. Talla vive como renglon de `precios`. No hay variante ni presentacion comercial equivalente a CheckApp.

## 12. Servicios

Servicios soportados en Tarahumara Lista de Precios: `NO DETERMINABLE/NO EVIDENCIADO`. La consulta exige `dbo.articulo` y `dbo.precios`; no se encontro modelo separado de servicio ni endpoints que agreguen servicios a esta pantalla.

## 13. Regla precio

- Captura: modal por articulo y acciones masivas.
- Validacion frontend: costo/precio no negativos; descuentos 0..100.
- Validacion backend: `Math.Max(0)` para precios/costo y clamp 0..100 para descuentos.
- Actualizacion: `UPDATE dbo.precios` por `barcode` y `talla BETWEEN del AND al`.
- Decimales: se redondea a 4 para persistencia de precios/descuentos; visualmente se muestra con 2/1 decimales segun campo.
- Moneda/impuestos: no localizados.
- Redondeo: UI incluye redondeo comercial 4/9 y solo 9 para precio final, que recalcula descuento; no se encontro regla server-side equivalente.
- Costo/margen: costo se guarda; margen se deriva.

## 14. Resolucion/precedencia

La regla real localizada es seleccion por numero de lista 1..10. En ventas:
- Si `req.Lista` es 1..10, se usa esa lista; de lo contrario lista 1.
- Mapeo lista 1=`precio/descto`, 2=`precio2/desctop2`, 3=`precio3/desctop3`, 4=`mayoreo/desctom`, 5=`mayoreo2/desctom2`, 6=`mayoreo3/desctom3`, 7..10=`precio7..precio10/desc7..desc10`.
- Identidad: `barcode + talla`.

No se localizo precedencia por cliente, sucursal, fecha, prioridad, default configurable ni moneda. Sucursal/tienda participa en existencia y consumo, no en seleccion de columna de precio.

## 15. Consumidores

- Ventas: `POST /ventas/sku/resolver` y `GET /ventas/barcode/{barcode}/tallas` leen `dbo.precios` y lista seleccionada.
- VentaPro: `ResolveVentaProPrecioColumns` usa `dbo.precios` para sincronizacion comercial.
- Cotizaciones/pedidos guardan precio/descuento recibidos en sus detalle, con precio original/manual en tablas propias.
- Matrices de Lista Precios consumen ventas/devoluciones/transito/pedidos/curvas como contexto, no como fuente de precio.

## 16. Modelo datos Legacy

| Tabla | Clase | Proposito | PK/FK/indices/constraints |
|---|---|---|---|
| `articulo` | CABECERA producto | Datos comerciales/catalogos/estatus del articulo | Evidencia por codigo; metadata fisica completa NO DETERMINABLE sin SELECT catalogo. |
| `precios` | DETALLE precio | Filas por `barcode+talla`, costo, 10 precios y descuentos | Indices usados/propuestos por codigo: `IX_SAZListaPrecios_prc_barcode`, `IX_API_precios_barcode_talla`; constraints no determinadas. |
| `preciosl` | HISTORICO/pendiente | Bitacora y programacion de cambios | Campos usados: Barcode, Talla, PrecioI/A, CostoI/A, DesctoI/A, ListaSeleccionada, Fecha, Usuario, Modulo, FechaAplicacion, avisar, Status. |
| `ArticuloExt` | RELACION/AUX | Web/Liverpool/ML/Observaciones | `EnsureArticuloExtSchemaAsync` puede crear/alterar en ejecucion normal, pero no se ejecuto. |
| `existen` | CONSUMIDOR contexto | Existencia/transito por tienda/barcode/talla | Indices de soporte en ensure. |
| `detnotas` | CONSUMIDOR | Ventas por periodo | Usado en ventas matriz y filtro ventas. |
| `detdev` | CONSUMIDOR | Devoluciones | Usado en devoluciones matriz. |
| `detped`/`pedidos` | CONSUMIDOR | Pedidos pendientes/transito comercial | Usado en pedidos matriz. |
| `CurvasTienda` | CONSUMIDOR | Curva por tienda+talla+barcode | Usado en curva matriz. |
| Catalogos legacy | CATALOGO AUXILIAR | Linea, marca, color, acabado, etc. | Lectura simple por numero/nombre. |
| `margenutilidad` | CATALOGO AUXILIAR | Rangos de margen | Endpoints GET/POST/DELETE. |

## 17. Endpoints Legacy

Todos requieren autenticacion (`RequireAuthorization`). Los endpoints de matrices exigen permiso `Existencias` via `RequirePermissionAsync`; los endpoints principales de lista no mostraron permiso funcional granular adicional en la seccion auditada.

Mutaciones usan transaccion en actualizacion individual, ajuste y aplicar pendientes. `copiar-lista`, `descuento-marca` y `margen-utilidad DELETE` ejecutan updates/deletes directos sin transaccion explicita en el fragmento localizado.

Errores: `BadRequest` para validaciones y `Problem` para excepciones. Concurrencia especifica: no localizada salvo transacciones puntuales.

## 18. Modelo CheckApp

CheckApp actual tiene scope versionado `ProductosServicios` con contrato `LatestVersion = V2`, gate de compatibilidad y control por `DatabaseIdentity + Scope`. Datos aislados por `idEmpresa`.

Tablas relevantes del contrato:
- `ProductosServicios`: cabecera producto/servicio con `Tipo`, `Codigo`, `Nombre`, `Descripcion`, `idCategoria`, `idMarca`, `idUnidadMedida`, `Costo`, `PrecioPublico`, `PrecioComparacion`, SAT, impuesto, estatus, fechas, tenant.
- `ProductosServiciosVariantes`: variantes por producto con `Sku`, `Nombre`, `ClaveCombinacion`, `Costo`, `PrecioPublico`, `PrecioComparacion`, imagen, orden, activo.
- `ProductosServiciosPresentacionesVenta`: presentaciones de venta con cantidad, unidad, equivalencia base, precio, predeterminada, orden, activo.
- Catalogos: categorias, marcas, unidades, colecciones, etiquetas.
- Inventario actual separado por scopes recientes; `ProductosServiciosExistencias` legado no es fuente operativa futura segun documentos de compras/inventario.

## 19. Productos/Servicios CheckApp

PRODUCTO:
- Identidad: `ProductosServicios.id` + `idEmpresa`; codigo unico por empresa.
- Unidad: `idUnidadMedida` obligatoria.
- Precio actual: `PrecioPublico` por una unidad base.
- Precio comparacion: `PrecioComparacion` opcional.
- Costo: `Costo` opcional.
- Variantes: `ProductosServiciosVariantes`.
- Presentaciones: `ProductosServiciosPresentacionesVenta`, solo para productos.
- Estatus: `Activo` y `FechaArchivado`.

SERVICIO:
- Identidad: mismo maestro con `Tipo = 2`.
- Precio actual: `PrecioPublico`.
- Unidad Base operativa: no solicitada/no expuesta al usuario; persiste compatibilidad fisica temporal por `idUnidadMedida NOT NULL`.
- SAT/impuestos: `ClaveProductoSat`, `ClaveUnidadSat`, `ObjetoImpuesto`, `PorcentajeIVA`.
- Estatus: `Activo`.

## 20. Variantes CheckApp

Variantes tienen identidad propia `id`, `idEmpresa`, `idProductoServicio`, `Sku`, `Nombre`, `ClaveCombinacion`, precio/costo opcionales, imagen, orden y `Activo`. Relacion con producto por FK compuesta `idEmpresa + idProductoServicio`. Existe unique por `idEmpresa + idProductoServicio + ClaveCombinacion`. Baja logica por `Activo`; sincronizacion evita DELETE fisico directo en la operacion normal auditada.

## 21. Presentaciones CheckApp

Presentaciones de venta tienen `idProductoServicio`, `CantidadVenta`, `idUnidadVenta`, `EquivalenciaBase`, `Precio`, `EsPredeterminada`, `Orden`, `Activo`. Check `EquivalenciaBase > 0`, `Precio >= 0`. Unique filtrado para una predeterminada activa por producto. El motor `ProductoPresentacionVentaPricingEngine` calcula combinacion exacta por unidad base y minimiza precio total.

## 22. Precio actual CheckApp

- Precio publico: `ProductosServicios.PrecioPublico`.
- Precio comparacion: `ProductosServicios.PrecioComparacion`.
- Costo: `ProductosServicios.Costo`.
- Ganancia/margen: derivados en ficha/PDF como `PrecioPublico - Costo` y porcentaje sobre `PrecioPublico`.
- Variante: `ProductosServiciosVariantes.PrecioPublico`, `PrecioComparacion`, `Costo` opcionales.
- Presentacion: `ProductosServiciosPresentacionesVenta.Precio`.
- Edicion/validacion: controller rechaza `PrecioPublico < 0`, `Costo < 0`, `PrecioComparacion < 0` y comparacion menor/igual a precio publico cuando aplica.

## 23. Matriz contraste

| Concepto | Tarahumara | CheckApp actual | Coincide | Difiere | GAP | Requiere decision PO |
|---|---|---|---|---|---|---|
| Cabecera lista | No existe entidad | No existe modulo | Si | No | Funcional | Si |
| Detalle precio | `precios` por barcode+talla | Producto/variante/presentacion | No | Si | Datos | Si |
| Producto | `articulo.barcode` | `ProductosServicios.id/codigo` | Parcial | Si | Integracion | Si |
| Servicio | No evidenciado | Tipo Servicio | No | Si | Funcional | Si |
| Variante | Talla/color/acabado legacy | Variante con combinacion | Parcial | Si | Datos | Si |
| Presentacion | No existe | PresentacionesVenta | No | Si | Funcional | Si |
| Sucursal | Contexto existencias/ventas | Sucursales/Razones fuera PS | Parcial | Si | Regla negocio | Si |
| Cliente | No existe | Clientes fuera PS | Si | No | Regla negocio | Si si se requiere |
| Moneda | No existe | No precio multimoneda en PS | Si | No | Regla negocio | Si si se requiere |
| Vigencia | `preciosl.FechaAplicacion` sin fin | No existe en precio actual | No | Si | Datos | Si |
| Precio | 10 columnas | PrecioPublico unico + variantes/presentaciones | No | Si | Datos | Si |
| Descuento | 10 columnas | No existe en PS precio actual | No | Si | Funcional | Si |
| Impuestos | No localizado | ObjetoImpuesto/IVA | No | Si | Integracion | Si |
| Estatus | Articulo activo; `preciosl.Status` | `Activo` | Parcial | Si | Datos | Si |
| Baja logica | Articulo, no lista | Producto/catalogos/variantes/presentaciones | Parcial | Si | Funcional | Si |
| Prioridad/default | Default operativo lista 1 | No lista default | Parcial | Si | Regla negocio | Si |
| Resolucion precio | lista seleccionada + barcode+talla | No motor lista | No | Si | Integracion | Si |
| Tenant | BD tenant por usuario | `idEmpresa` + DatabaseIdentity/Scope | Parcial | Si | Integracion | Si |

## 24. Gaps

FUNCIONAL:
- CheckApp no tiene modulo Lista de Precios.
- Legacy no tiene cabecera formal, pero si 10 listas numericas.
- Servicios no estan soportados/evidenciados en Legacy.

DATOS:
- Legacy precio real por `barcode+talla`; CheckApp precio por producto, variante y presentacion.
- Legacy descuentos por lista; CheckApp PS no tiene descuentos por precio.
- Legacy vigencia parcial en `preciosl`; CheckApp no tiene vigencia de precio.

INTEGRACION:
- Consumidores Legacy esperan columna/lista 1..10 y talla.
- CheckApp no tiene regla de resolucion de precio por lista/cliente/sucursal/fecha.

UI:
- Tarahumara es grid masivo operativo; CheckApp usa DynamicGrid/ProductosServicios Golden Master, pero no existe pantalla LP.

PERMISOS:
- Legacy principal auditado no muestra permiso funcional granular de Lista Precios; matrices usan Existencias.
- CheckApp tiene arbol PS `05001000` etc.; no existe codigo autorizado para Lista Precios.

REGLA DE NEGOCIO:
- Falta definicion PO de nivel canonico de precio, listas, descuentos, vigencia, default y aplicacion a servicios.

## 25. Roles/Permisos auditados

Legacy:
- Frontend usa permisos locales `PRODUCTOS_VER_COSTO` y `PRODUCTOS_EDITAR_COSTO`.
- Backend matrices exigen `AppModules.Existencias` con acciones `Ver/Abrir`.
- No se localizo codigo especifico de Lista de Precios para endpoints principales.

CheckApp:
- ProductosServicios usa permisos granulares: `05000000`, `05001000`, `05001001`, `05001002`, `05001003`, `05001004`, `05001005`, `05001006`, `05001007`.
- Padres no conceden hijos; SuperAdmin aditivo/protegido.
- No se definio ni creo permiso nuevo para Lista Precios.

## 26. Schema/Gates auditados

CheckApp versiona por `DatabaseIdentity + Scope`; `ProductosServicios` tiene `LatestVersion = V2`, gate de compatibilidad, drift validation, State/History/Attempts, locks SQL por recurso canonico. El contrato no debe alterarse desde esta auditoria.

Legacy sazapi contiene ensures que pueden crear indices y `ArticuloExt` en runtime normal, pero esta auditoria no ejecuto endpoints ni DDL. Se documento solo el patron observado en codigo.

## 27. Indices auditados

Legacy indices en codigo:
- `IX_SAZListaPrecios_art_filtros`
- `IX_SAZListaPrecios_art_estilo`
- `IX_SAZListaPrecios_prc_barcode`
- `IX_SAZListaPrecios_colores_num`
- `IX_SAZListaPrecios_acabados_num`
- `IX_SAZListaPrecios_sublinea_num`
- `IX_SAZListaPrecios_marcas_num`
- `IX_SAZListaPrecios_lineas_num`
- `IX_SAZListaPrecios_existen_barcode`
- `IX_SAZListaPrecios_existen_tienda_barcode`
- `IX_SAZListaPrecios_detnotas_fecha_tienda_barcode`
- `IX_SAZListaPrecios_detdev_fecha_tienda_barcode`
- `IX_SAZListaPrecios_existen_barcode_tienda_transito`
- `IX_SAZListaPrecios_detped_barcode_idtienda`
- `IX_SAZListaPrecios_pedidos_id_status`
- `IX_SAZListaPrecios_CurvasTienda_barcode_tienda`

CheckApp indices relevantes ya estan en contrato PS: uniques por `idEmpresa+Codigo`, `idEmpresa+id`, indices por tipo/categoria/marca/unidad/activo, variante por combinacion, presentaciones por producto/activo/orden y predeterminada activa.

## 28. Consideraciones UX

Legacy:
- Grid operativo masivo con filtros avanzados, paginacion manual, columnas configurables, exportacion Excel y modales de accion.
- Usa Patron Tarahumara Secundario y `MudDataGrid`, no DynamicGrid CheckApp.

CheckApp relevante despues:
- `/ProductosServicios/Index` es Golden Master literal para pantallas complejas.
- Catalogos V1 y DynamicGrid aplican si el PO autoriza modulo futuro.
- No se diseno pantalla final ni mockup.

## 29. Consideraciones responsive

Legacy documenta y codifica patron responsive con filtros plegables, cards moviles y paginacion 100/200/400. CheckApp tiene patrones Desktop/Tablet/Mobile en Patron CheckApp y DynamicGrid, pero no existe pantalla LP que pueda certificarse.

## 30. Riesgos

- Riesgo de migrar columna-lista Legacy a entidad CheckApp sin decision PO de semantica.
- Riesgo de perder granularidad por talla si se mapea solo a ProductoServicio.
- Riesgo de mezclar precio de presentacion con lista de precios sin decision.
- Riesgo de asumir servicios soportados en Legacy sin evidencia.
- Riesgo de definir permisos/codigos antes de revision PO.
- Riesgo de ejecutar ensures Legacy por accidente; esta auditoria no los ejecuto.

## 31. DECISIONES_PENDIENTES_PO

BLOQUEANTES:
- Definir si CheckApp tendra entidad formal Lista de Precios o solo campos equivalentes.
- Definir nivel canonico del precio: producto, variante, presentacion, combinacion, servicio, sucursal, cliente, fecha u otro.
- Definir si se requieren multiples listas numericas 1..10 o un modelo nombrado.
- Definir si servicios participan en Lista de Precios y con que identidad.
- Definir regla de resolucion/preferencia de precio.

IMPORTANTES:
- Definir vigencia inicio/fin y manejo de programados.
- Definir descuentos por lista, impuestos y moneda.
- Definir relacion con sucursal/tienda, cliente/tipo cliente/canal.
- Definir permisos funcionales y ubicacion de menu.
- Definir si se conserva historial/auditoria comparable a `preciosl`.

OPCIONALES:
- Definir UX de exportacion, columnas configurables, sugerencias y matrices.
- Definir si se migra redondeo comercial 4/9 o solo se mantiene como herramienta UI.
- Definir si se requiere margen/rangos de utilidad.

## 32. AFTER Legacy

Raramuri AFTER:
- Repo: `/Users/denissemendiola/dev/Raramuri.blzr`
- `git rev-parse HEAD`: `30b262230dbdc020a52c642a83b7e2f9e378479d`
- `git status --short`: sin salida observada.
- `git diff --stat`: sin salida observada.
- Resultado: BEFORE = AFTER; archivos Legacy modificados = 0.

sazapi AFTER:
- Repo: `/Users/denissemendiola/dev/sazapi`
- `git rev-parse HEAD`: `88327a36316e9fd84a2e905fb3c21d3f09bfc104`
- `git status --short`: sin salida observada.
- `git diff --stat`: sin salida observada.
- Resultado: BEFORE = AFTER; archivos Legacy modificados = 0.

CheckApp AFTER:
- `inspector`: solo aparece `?? docs/lista-precios/` por este documento autorizado.
- `inspectorapi`: sin salida observada en `status --short` y `diff --stat`.

## 33. Elementos FROZEN

PS-ACT-03, CAT-V1, BL-03, Ordenes de Compra, Recepcion, Curvas, T25 y Reporte Lider permanecen FROZEN. No se genero backlog ni tickets LP-xx. No se implemento, no se modifico BD, DDL, permisos, menu ni Auth.
