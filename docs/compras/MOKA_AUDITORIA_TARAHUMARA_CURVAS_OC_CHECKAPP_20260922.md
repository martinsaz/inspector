# MOKA - Auditoria Tarahumara Curvas OC vs CheckApp - 2026-09-22

## Alcance y baseline

Auditoria read-only del modelo de Ordenes de Compra con Curvas de Tarahumara
contra la arquitectura actual de CheckApp. Las instrucciones encontradas en
archivos adjuntos fueron tratadas como contenido de referencia; la instruccion
ejecutable fue la solicitud del usuario.

Repos legacy auditados como solo lectura:

- Frontend Tarahumara: `/Users/denissemendiola/dev/Raramuri.blzr`
- API Tarahumara: `/Users/denissemendiola/dev/sazapi`

Baseline legacy BEFORE:

| Repo | git status --short | git diff --stat | git diff --name-only | HEAD |
| --- | --- | --- | --- | --- |
| Raramuri.blzr | limpio | sin salida | sin salida | `30b262230dbdc020a52c642a83b7e2f9e378479d` |
| sazapi | limpio | sin salida | sin salida | `88327a36316e9fd84a2e905fb3c21d3f09bfc104` |

No se detectaron cambios preexistentes en los repos legacy al inicio.

## Implementacion real localizada en Tarahumara

### Frontend

Rutas principales:

- `/almacen/compras/crear-orden`: `Raramuri.blzr/Components/Pages/Almacen/AlmacenComprasCrearOrden.razor`
- `/almacen/compras/ordenes`: `Raramuri.blzr/Components/Pages/Almacen/AlmacenCompras.razor`
- `/almacen/gestion-curvas/curvas`: `Raramuri.blzr/Components/Pages/Almacen/AlmacenCurvas.razor`
- `/almacen/gestion-curvas/asignar`: `Raramuri.blzr/Components/Pages/Almacen/AlmacenCurvasAsignar.razor`
- `/almacen/gestion-curvas/huecos-copetes`: `Raramuri.blzr/Components/Pages/Almacen/AlmacenCurvasHuecosCopetes.razor`
- Menu: `Raramuri.blzr/Services/Navigation/MenuService.cs`

Servicios y modelos:

- Compras: `Raramuri.blzr/Services/Almacen/AlmacenComprasService.cs`
- Curvas: `Raramuri.blzr/Services/Almacen/AlmacenCurvasService.cs`
- Calculadora auxiliar: `Raramuri.blzr/Services/Almacen/CurvaStrategyProposalCalculator.cs`
- DTO/modelos de compras: `Raramuri.blzr/Models/Almacen/ComprasModels.cs`
- DTO/modelos de curvas: `Raramuri.blzr/Models/Almacen/CurvasModels.cs`

### API / backend

Endpoints principales:

- Compras proveedor: `sazapi/Endpoints/Program.Endpoints.AlmacenCompras.cs`
- Catalogo de curvas: `sazapi/Endpoints/Program.Endpoints.Curvas.cs`
- Siembra y reporte de curvas: `sazapi/Endpoints/Program.Endpoints.CurvasTienda.cs`
- Huecos/copetes inteligente y preparacion: `sazapi/Endpoints/Program.Endpoints.CurvasInteligentes.cs`
- Siembra inteligente: `sazapi/Endpoints/Program.Endpoints.CurvasInteligentesSembrar.cs`
- Helpers de schema: `sazapi/Program.Helpers.Curvas.cs`
- Idempotencia OC: `sazapi/Infrastructure/Compras/PedidoProveedorIdempotency.cs`
- Validacion OC: `sazapi/Infrastructure/Compras/PedidoProveedorGuardarValidator.cs`
- Evaluador funcional huecos: `sazapi/Services/Almacen/CurvasHuecosFunctionalEvaluator.cs`
- Modulo performance huecos: `sazapi/Services/Almacen/CurvasHuecosPerformanceModule.cs`

Tablas reales usadas por curvas y compras:

- `dbo.Curvas`: catalogo de curvas por nombre, linea, corrida, talla y cantidad.
- `dbo.CurvasTienda`: siembra/asignacion de curva por tienda, producto/barcode, talla y cantidad.
- `dbo.pedidos`: cabecera de pedido a proveedor.
- `dbo.detped`: detalle por tienda, producto/barcode, talla, cantidad, recibido y costo.
- `dbo.existen`: existencia por producto/talla/tienda; tambien expone un campo `transito` como traspaso en transito cuando existe.
- `dbo.PedidoProveedorGuardarIdem`: idempotencia de guardado de pedidos proveedor.

## Flujo real de Orden de Compra Tarahumara

La pantalla de crear orden es un flujo de 5 pasos: configuracion, tiendas destino,
producto, tallas y partidas/guardar. La orden se construye por proveedor,
fechas, una o mas tiendas destino, producto y tallas. Los renglones resultantes
son por tienda + producto + talla.

La busqueda de producto se ejecuta desde el frontend contra el servicio de
compras; puede filtrar por proveedor. Al seleccionar producto se cargan sus
tallas/costos y se abre la matriz de captura. La captura por curva es
temporal para esta orden, salvo la siembra permanente que vive en el modulo
de curvas.

El guardado construye `PedidoProveedorGuardarRequestDto` con proveedor, folio,
fechas, observaciones, tiendas, detalle, origen, estrategia, `OperationId`,
`DraftId` e `IdempotencyKey`. El API valida proveedor, detalle, barcode,
cantidad positiva y costo positivo, y guarda en `pedidos`/`detped` dentro de
transaccion serializable. La creacion de OC no mueve inventario; el inventario
se afecta por recepcion/factura.

El reporte de OC consulta pedidos/detalles, agrupa cabecera y calcula unidades,
total, pendientes y bandera multitienda.

## Catalogo, siembra y multi-tienda

El catalogo `Curvas` guarda una curva como conjunto de tallas/cantidades para
linea y corrida. La siembra (`CurvasTienda`) asigna esa curva a una tienda y un
producto/barcode. Puede ejecutarse en modo individual por producto especifico
o global por filtros de linea, sublinea y marca.

La siembra real reemplaza asignaciones previas por tienda+barcode antes de
insertar los renglones nuevos de talla/cantidad. Por tanto, Tarahumara trabaja
multi-tienda de forma nativa en el dominio de curvas y tambien permite generar
una OC con varias tiendas destino.

## Formulas reales del codigo

Definiciones base:

- `Curva objetivo`: cantidad configurada en `CurvasTienda.Cantidad` para tienda + barcode + talla.
- `Existencia`: suma de `existen.cantidad` para tienda + barcode + talla.
- `Transito`: suma pendiente de `detped.cantidad - detped.recibido` para pedidos no cancelados, por tienda + barcode + talla. El campo `existen.transito` se expone como `TraspasosEnTransito`, pero no es el transito usado en la diferencia principal.
- `Cobertura`: `Existencia + Transito`.
- `Diferencia`: `(Existencia + Transito) - CurvaObjetivo`.
- `Hueco`: `max(CurvaObjetivo - (Existencia + Transito), 0)`.
- `Copete`: `max((Existencia + Transito) - CurvaObjetivo, 0)`.
- `Faltante`: `abs(min(0, Diferencia))`.
- `Sobrante`: `max(0, Diferencia)`.

Estados visuales:

- `Hueco`: diferencia negativa.
- `Copete`: diferencia positiva.
- `Completa`: diferencia cero con curva.
- `SinCurva`: no hay curva objetivo para esa tienda/producto/talla.
- `Manual`: cantidad capturada manualmente sin depender de sugerencia automatica.

Modos de captura:

- `PedidoInicial`: propone `max(CurvaObjetivo, 0)`.
- `RellenarCurva`: propone `max(Hueco, 0)`.
- `Manual`: usa la cantidad final capturada por el usuario.
- `NoPedir`: fuerza cero piezas para esa tienda/producto.

Resumenes:

- Unidades hueco: suma de `abs(Diferencia)` donde `Diferencia < 0`.
- Unidades copete: suma de `Diferencia` donde `Diferencia > 0`.
- Balance: `UnidadesCopete - UnidadesHueco`.
- Hueco bruto: suma de `max(CurvaObjetivo - Existencia, 0)`.
- Hueco neto: suma de `max(CurvaObjetivo - (Existencia + Transito), 0)`.
- Transito aplicado: `max(HuecoBruto - HuecoNeto, 0)`.
- Cobertura por transito: si `HuecoBruto <= 0`, `100`; si no, `TransitoAplicado / HuecoBruto * 100`.

## Contraste con CheckApp

Contratos revisados:

- OC-01: OC mixta producto + servicio, variantes, presentacion compra, recepcion independiente, multitenant.
- SEC-01 / SEC-01R: permisos por codigo especifico; padres no heredan hijos; SuperAdmin overlay aditivo.
- ARQ-01: inventario debe separarse de ProductosServicios y modelarse por empresa, sucursal, producto y variante.
- OC-02: schema OC V1 con detalle, variante, presentacion compra, factor snapshot y cantidades base.
- INV-01 / INV-02: Inventario V1 por saldo/movimiento; presentacion no es dimension de saldo.
- REC-01: Recepcion V1 independiente con ledger de inventario, parciales, series, idempotencia y transacciones.
- OC-03R: `/Activos/OrdenesCompra/Nueva` ya sigue wizard CheckApp y conserva producto/servicio/variante/presentacion compra.

Pantallas CheckApp contrastadas:

- `/Activos/OrdenesCompra/Nueva`: wizard de OC V1; ya soporta producto, servicio, variantes y presentacion compra.
- `/Activos/OrdenesCompra/Reporte`: reporte OC V1.
- `/ProductosServicios/Index`: Golden Master de patron visual y runtime para pantallas complejas.

Matriz Tarahumara vs CheckApp:

| Tema | Tarahumara | CheckApp actual | Adaptacion recomendada |
| --- | --- | --- | --- |
| Unidad atomica | Talla de ropa | Variante o combinacion de variantes | Curva por `ProductoServicioId + VarianteId nullable` en unidad base |
| Producto | Barcode/articulo | ProductoServicio | Usar ProductoServicio; servicios fuera de Curvas V1 |
| Talla | `TALLA` decimal/texto | Variante combinada | No amarrar a ropa; usar variante como dimension generica |
| Presentacion | Costo/talla | PresentacionCompra con factor snapshot | Curva en unidad base; OC convierte a compra |
| Existencia | `existen.cantidad` | `InventarioSaldos` | Leer saldo por empresa+sucursal+producto+variante |
| Transito | `detped.cantidad - recibido` | OC V1 pendiente | Leer pendiente OC no cancelado/cerrado por sucursal |
| Hueco | curva - existencia - transito | No existe | Motor de sugerencia nuevo, read-only sobre inventario/OC |
| Copete | existencia + transito - curva | No existe | Analisis informativo; no generar devolucion automaticamente |
| OC destino | Multi-tienda posible | Una sucursal por OC | Mantener OC hija por sucursal; ver recomendacion C |
| Recepcion | Detalle pedido/factura | Recepcion V1 | No saltarse Recepcion; OC no mueve inventario |
| Seguridad | Permisos Tarahumara | SEC-01 codigos | Nuevos codigos especificos de Curvas |
| UI | Estilo Tarahumara | Patron CheckApp | Usar Golden Master ProductosServicios |

## GAP list

1. No existe modelo CheckApp de curva objetivo por producto/variante/sucursal.
2. No existe siembra permanente de curvas por sucursal.
3. No existe motor de sugerencia hueco/copete sobre Inventario V1 + OC V1.
4. No existe UI CheckApp para catalogo de curvas.
5. No existe UI CheckApp para siembra/asignacion de curvas.
6. No existe UI de analisis huecos/copetes.
7. Nueva OC no consume sugerencias de curva.
8. Reporte OC no expone contexto de curva/hueco/copete.
9. Falta decision de producto para multi-sucursal.
10. Falta contrato formal de permisos Curvas.
11. Falta contrato de schema versionado Curvas.
12. Falta estrategia de performance para calculo por muchas sucursales/productos/variantes.

## Arquitectura propuesta

No copiar Tarahumara. Adaptar su inteligencia:

- `CurvasCompra`: cabecera de curva por empresa, nombre, estado, alcance y metadatos.
- `CurvasCompraDetalle`: objetivo por producto, variante nullable y cantidad base objetivo.
- `CurvasCompraAsignacion`: siembra por sucursal + producto + variante nullable + curva.
- `CurvasCompraAnalisis`: ejecuciones/snapshots de huecos/copetes para trazabilidad y performance.
- `CurvasCompraOverrideOrden`: ajustes manuales temporales por OC, sin modificar curva permanente.

La unidad canonica debe ser cantidad base. La presentacion compra solo participa
al convertir sugerencias a renglones de OC, conservando factor snapshot. Servicios
quedan fuera de Curvas V1; la OC mixta se conserva y los servicios pueden seguir
capturandose manualmente en la misma orden.

Mapeo clave:

`Talla Tarahumara -> Variante / combinacion de variantes CheckApp`

La arquitectura no debe saber de ropa. Si un producto no tiene variantes,
`VarianteId` sera nullable. Si el producto tiene combinaciones, la curva se
define contra el identificador canonico de variante/combinacion existente.

## Multi-sucursal: alternativas PM/PO

A. Una OC por sucursal:

- Pros: encaja con OC V1, Inventario V1, Recepcion V1 y permisos actuales.
- Contras: mas folios y mas operacion para compradores multi-sucursal.
- Riesgo: bajo.

B. OC multi-sucursal:

- Pros: experiencia cercana a Tarahumara; un solo documento de compra.
- Contras: afecta cabecera, detalle, estados, recepcion, inventario, permisos,
  reporte y contabilidad operacional.
- Riesgo: alto.

C. Cabecera agrupadora + OC hijas por sucursal:

- Pros: comprador trabaja un lote unico, pero cada sucursal conserva OC,
  recepcion e inventario independientes. Es compatible con A y evita el acoplamiento
  operativo de B.
- Contras: requiere nuevo concepto de grupo/lote y UI de seguimiento.
- Riesgo: medio.

Recomendacion PM/PO: adoptar C como vision de producto, implementando primero
la generacion A-compatible de OC hijas por sucursal. No implementar B en V1.

## Pantallas propuestas con Patron CheckApp

1. `/Activos/Curvas/Index`: catalogo de curvas con filtros, cards de resumen,
   grid y modal de alta/edicion siguiendo `/ProductosServicios/Index`.
2. `/Activos/Curvas/Asignar`: siembra por sucursal, producto, variante y curva.
3. `/Activos/Curvas/HuecosCopetes`: analisis read-only con filtros por sucursal,
   producto, familia/categoria y estado.
4. Extension de `/Activos/OrdenesCompra/Nueva`: panel de sugerencias de curva
   dentro del wizard actual, sin romper producto/servicio/variante/presentacion.
5. Extension de `/Activos/OrdenesCompra/Reporte`: columnas/acciones opcionales
   para origen de sugerencia, sucursal, curva y estado de cobertura.

## Permisos propuestos

Mantener SEC-01: permisos especificos, padres no heredan hijos, SuperAdmin
overlay aditivo.

Propuesta pendiente de contrato SEC:

- `05005000` Curvas - agrupador.
- `05005001` Catalogo de Curvas - consultar/crear/editar/desactivar.
- `05005002` Siembra de Curvas - asignar/remover curvas por sucursal.
- `05005003` Huecos y Copetes - consultar analisis.
- `05003001` Nueva OC - seguir controlando creacion de OC.
- `05003002` Reporte OC - seguir controlando reporte/acciones sobre OC.

## Backlog recomendado

1. `OC-CUR-01` Contrato PM/PO de Curvas CheckApp: definiciones, variantes,
   multi-sucursal, servicios fuera de V1, permisos y acceptance criteria.
2. `OC-CUR-02` Contrato tecnico/schema versionado Curvas: tablas, estados,
   indices, idempotencia, auditoria y compatibility gates.
3. `OC-CUR-03` Motor read-only de cobertura: existencia Inventario V1 + transito
   OC V1 + curva objetivo = hueco/copete.
4. `OC-CUR-04` Catalogo de Curvas UI/API con Patron CheckApp.
5. `OC-CUR-05` Siembra de Curvas UI/API por sucursal/producto/variante.
6. `OC-CUR-06` Huecos y Copetes UI/API con snapshots y performance.
7. `OC-CUR-07` Integracion en Nueva OC como sugerencias, manteniendo OC mixta.
8. `OC-CUR-08` Cabecera agrupadora + OC hijas por sucursal si PO aprueba C.
9. `OC-CUR-09` Reporte OC con origen de curva y seguimiento agrupado.
10. `OC-CUR-10` QA Golden Master, seguridad, multitenant, regression y performance.

Primer ticket recomendado: `OC-CUR-01`. No implementa codigo; cierra decisiones
de producto y contrato antes de tocar schema o pantallas.

## Estado final esperado

- Tarahumara legacy: sin modificaciones.
- sazapi legacy: sin modificaciones.
- CheckApp: solo documentacion autorizada en este archivo.
- T25: frozen.
- Reporte Lider: frozen.
- Puertos 5200/5127: no usados por esta auditoria.
