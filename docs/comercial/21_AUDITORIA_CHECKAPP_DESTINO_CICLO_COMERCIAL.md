# 21 AUDITORIA CHECKAPP DESTINO CICLO COMERCIAL

Fecha: 2026-08-18

## Objetivo

Auditar el estado real actual de CheckApp para el ciclo comercial objetivo definido por Product Owner, sin implementar nada y sin repetir la auditoría Legacy ya cerrada.

Base documental obligatoria leída completa:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/comercial/01_CICLO_COMERCIAL_INTEGRAL_LEGACY.md`
- `docs/comercial/02_USUARIOS_PERFILES_POS.md`
- `docs/comercial/03_ASISTENCIA_OPERACION_POS.md`
- `docs/comercial/04_CAJA_APERTURA_CIERRE.md`
- `docs/comercial/05_COTIZACION_A_PEDIDO.md`
- `docs/comercial/06_PEDIDOS.md`
- `docs/comercial/07_VENTA_DESDE_PEDIDO.md`
- `docs/comercial/08_VENTAS_COBRAR_TRANSACCION.md`
- `docs/comercial/09_INVENTARIO_EXISTEN_NEGATIVOS.md`
- `docs/comercial/10_PRODUCTOS_SERVICIOS_ACTIVOS_FLETES.md`
- `docs/comercial/11_FORMAS_PAGO_CREDITO.md`
- `docs/comercial/12_NOTAS_CREDITO_VALES.md`
- `docs/comercial/13_FACTURACION_EN_VENTA.md`
- `docs/comercial/14_MATRIZ_PROCESOS_TABLAS.md`
- `docs/comercial/15_MATRIZ_PERFILES_RESPONSABILIDADES.md`
- `docs/comercial/16_MAPA_CICLO_COMERCIAL.md`
- `docs/comercial/17_GAP_CHECKAPP_COMERCIAL.md`
- `docs/comercial/18_RECOMENDACION_ARQUITECTURA_CHECKAPP.md`
- `docs/comercial/19_DECISIONES_PO_CICLO_COMERCIAL.md`
- `docs/comercial/20_CIERRE_GAPS_PRE_PLAN.md`

## Dictamen ejecutivo

CheckApp actual sí tiene base comercial reutilizable real en:

- `ProductosServicios`
- `ProductosServiciosExistencias`
- `ProductosServiciosMovimientosInventario`
- `Cotizaciones`
- `Clientes`
- `Sucursales`
- `Operadores`
- `Correo saliente`

CheckApp actual no tiene operación comercial completa en:

- `Pedido`
- `Venta`
- `Checkout / Cobro`
- `Caja POS`
- `Asistencia POS`
- `Notas de crédito / vales` como documentos comerciales reutilizables

Conclusión central:

- el núcleo reutilizable real está en catálogo + inventario base + cotización
- el gap real está en la operación transaccional `Pedido -> Venta -> Cobro -> Postventa`

## Hallazgo crítico documental

Quedó desactualizada la premisa histórica de que `Cotizaciones` era solo placeholder.

Evidencia actual auditada:

- MVC sí tiene proxy funcional en `checklist/Controllers/Cotizaciones/CotizacionesController.cs`
- API sí tiene backend real en `inspectorapi/checklistWs/Controllers/Cotizaciones/CotizacionesController.cs`
- sí existen tablas propias `dbo.Cotizaciones` y `dbo.CotizacionesPartidas`
- sí existen acciones reales de:
  - listado
  - detalle
  - alta / edición
  - cancelación
  - autorización
  - PDF
  - correo

Por lo tanto, la auditoría vigente debe tomar `Cotizaciones` como módulo existente y reusable, no como gap total.

## Auditoría 01 - ProductosServicios

Fuentes primarias:

- `checklist/Controllers/ProductosServicios/ProductosServiciosController.cs`
- `checklist/wwwroot/js/ProductosServicios/ProductosServicios.js`
- `inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs`
- `inspectorapi/checklistWs/Models/ProductosServicios/ProductosServiciosModels.cs`
- `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql`

### Tablas confirmadas

#### `dbo.ProductosServicios`

Campos relevantes confirmados:

- PK `id`
- empresa `idEmpresa`
- identidad técnica `identityKey`
- tipo `Tipo`
- código `Codigo`
- tag `Tag`
- nombre `Nombre`
- descripción `Descripcion`
- categoría `idCategoria`
- marca `idMarca`
- unidad `idUnidadMedida`
- costo `Costo`
- precio `PrecioPublico`
- causa inventario `CausaInventario`
- permite venta sin existencia `PermiteVentaSinExistencia`
- imagen `ImagenUrl`, `ImagenNombre`
- estado `Activo`
- fechas `FechaCreacion`, `FechaActualizacion`, `FechaArchivado`

Reglas confirmadas:

- `Tipo = 1` producto
- `Tipo = 2` servicio
- un servicio no puede llevar marca ni inventario
- `PermiteVentaSinExistencia` solo aplica a producto inventariable

Restricciones confirmadas:

- `CK_ProductosServicios_Tipo`
- `CK_ProductosServicios_ValoresMonetarios`
- `CK_ProductosServicios_ServicioSinInventario`

Índices confirmados por script:

- `UX_ProductosServicios_Empresa_Codigo`
- `UX_ProductosServicios_Empresa_Id`
- `IX_ProductosServicios_Empresa_Tipo_Activo`
- `IX_ProductosServicios_Empresa_Categoria_Activo`
- `IX_ProductosServicios_Empresa_Marca_Activo`
- `IX_ProductosServicios_Empresa_Unidad_Activo`
- `IX_ProductosServicios_Empresa_Tag`

#### `dbo.ProductosServiciosCategorias`

Campos relevantes:

- PK `id`
- empresa `idEmpresa`
- `Codigo`
- `Nombre`
- `Descripcion`
- `AplicaA`
- `Activo`
- fechas

Regla clave:

- `AplicaA = 0` todos
- `AplicaA = 1` productos
- `AplicaA = 2` servicios

#### `dbo.ProductosServiciosMarcas`

Campos relevantes:

- PK `id`
- empresa `idEmpresa`
- `Codigo`
- `Nombre`
- `Descripcion`
- `Activo`
- fechas

#### `dbo.ProductosServiciosUnidadesMedida`

Campos relevantes:

- PK `id`
- empresa `idEmpresa`
- `Codigo`
- `Nombre`
- `Abreviatura`
- `PermiteDecimales`
- `Activo`
- fechas

### Cómo distingue hoy Producto vs Servicio

La distinción actual sí existe y es explícita:

- `Tipo = 1` => `Producto`
- `Tipo = 2` => `Servicio`

Además la UI actual la refuerza:

- si es servicio, oculta marca e inventario
- fuerza `CausaInventario = false`
- fuerza `PermiteVentaSinExistencia = false`

### Qué ya tenemos reutilizable

- catálogo unificado producto/servicio
- categorías con alcance `productos`, `servicios` o `todos`
- unidad de medida
- marca para productos
- costo y precio público
- baja lógica
- imágenes
- validación backend
- KPIs y exportación
- búsqueda y filtrado en UI

### Qué falta respecto al objetivo PO

No existe hoy en `ProductosServicios` evidencia de:

- impuestos
- SAT producto / servicio
- clave SAT
- impuestos trasladados / retenidos
- asignación obligatoria de operador para servicio
- tipo de servicio instalable
- política comercial de flete

Conclusión:

- `ProductosServicios` sí sirve como base del catálogo comercial destino
- para `Servicio requiere Operador` todavía falta modelado funcional y de datos; no existe evidencia actual en este módulo

## Auditoría 02 - Existencias

Fuentes primarias:

- `inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs`
- `inspectorapi/checklistWs/Models/ProductosServicios/ProductosServiciosModels.cs`
- `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql`

### Tablas confirmadas

#### `dbo.ProductosServiciosExistencias`

Campos confirmados:

- PK `id`
- empresa `idEmpresa`
- identidad técnica `identityKey`
- producto `idProductoServicio`
- `ExistenciaActual`
- `ExistenciaMinima`
- `CostoPromedio`
- `FechaCreacion`
- `FechaActualizacion`

Índice confirmado:

- `UX_ProductosServiciosExistencias_Empresa_ProductoServicio`

Relación confirmada:

- FK a `dbo.ProductosServicios (idEmpresa, id)`

#### `dbo.ProductosServiciosMovimientosInventario`

Campos confirmados:

- PK `id`
- empresa `idEmpresa`
- identidad técnica `identityKey`
- producto `idProductoServicio`
- `TipoMovimiento`
- `Cantidad`
- `ExistenciaAnterior`
- `ExistenciaPosterior`
- `CostoUnitario`
- `Referencia`
- `Observaciones`
- `idUsuario`
- `FechaMovimiento`

Tipos de movimiento confirmados:

- `1` existencia inicial
- `2` entrada
- `3` salida
- `4` ajuste positivo
- `5` ajuste negativo

Índices confirmados:

- `IX_ProductosServiciosMovimientos_Empresa_ProductoServicio_FechaMovimiento`
- `IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento`

### Qué calcula hoy el inventario

Conceptos actuales confirmados:

- existencia física actual `ExistenciaActual`
- existencia mínima `ExistenciaMinima`
- costo promedio `CostoPromedio`
- historial de movimientos

No existen hoy, en estas tablas ni en el controlador auditado, conceptos explícitos de:

- `Reservado`
- `Comprometido`
- `ComprometidoPedido`
- `Disponible`

Conclusión:

- hoy el inventario CheckApp maneja existencia física y movimientos
- no maneja aún disponibilidad comercial derivada de pedido

### Negativos y validaciones

Reglas confirmadas:

- la existencia inicial no puede ser negativa al alta
- la existencia mínima no puede ser negativa
- movimientos solo con `Cantidad > 0`
- una salida o ajuste negativo puede dejar existencia negativa solo si `PermiteVentaSinExistencia = true`
- si `PermiteVentaSinExistencia = false`, el backend bloquea cualquier movimiento que deje saldo negativo

Conclusión:

- sí existe soporte actual para negativos controlados
- ese soporte hoy vive por producto, no por pedido

### Sucursal

No existe evidencia en `ProductosServiciosExistencias` ni `ProductosServiciosMovimientosInventario` de inventario por sucursal.

Implicación:

- el inventario actual auditado es por `empresa + producto`
- no por `empresa + sucursal + producto`

Esto es una brecha importante frente al objetivo PO que pide mostrar:

- existencia física
- comprometido en pedido
- disponible

con contexto operacional de sucursal.

## Auditoría 03 - Cotizaciones actuales CheckApp

Fuentes primarias:

- `checklist/Controllers/Cotizaciones/CotizacionesController.cs`
- `checklist/wwwroot/js/Cotizaciones/Cotizaciones.js`
- `checklist/Views/Cotizaciones/Index.cshtml`
- `checklist/Views/Cotizaciones/Nueva.cshtml`
- `inspectorapi/checklistWs/Controllers/Cotizaciones/CotizacionesController.cs`
- `inspectorapi/checklistWs/Models/Cotizaciones/CotizacionesModels.cs`

### Qué sí existe hoy

Existe operación real de:

- listado
- resumen
- detalle
- nueva cotización
- edición de borrador
- clonación
- cancelación
- autorización
- exportación PDF
- envío por correo
- selección de cliente
- selección de sucursal
- captura de caja
- observaciones
- partidas desde `ProductosServicios`

### Tablas confirmadas

#### `dbo.Cotizaciones`

Campos relevantes confirmados:

- PK `id`
- empresa `idEmpresa`
- `identityKey`
- `Folio`
- `Estado`
- `FechaCotizacion`
- `VigenciaDias`
- `FechaVigencia`
- `idCliente`
- `idSucursal`
- `Vendedor`
- `Caja`
- `Observaciones`
- `Subtotal`
- `DescuentoTotal`
- `Total`
- `TotalPiezas`
- `MotivoCancelacion`
- `FechaCancelacion`
- auditoría de usuarios
- fechas
- `Activo`

#### `dbo.CotizacionesPartidas`

Campos relevantes confirmados:

- PK `id`
- `idCotizacion`
- empresa `idEmpresa`
- `identityKey`
- `NumeroPartida`
- `idProductoServicio`
- snapshot `Codigo`, `Nombre`, `Descripcion`
- `TipoProductoServicio`
- `idUnidadMedida`
- `UnidadMedida`
- `UnidadAbreviatura`
- `UnidadPermiteDecimales`
- `PermiteVentaSinExistencia`
- `ExistenciaActual`
- `Cantidad`
- `PrecioUnitario`
- `DescuentoPct`
- `ImporteBruto`
- `DescuentoImporte`
- `Total`
- fechas
- `Activo`

### Estados actuales confirmados

- `Borrador = 1`
- `Cancelada = 2`
- `Autorizada = 3`

No existe hoy:

- estado `Convertida`

### Relación con inventario hoy

Confirmado:

- la cotización solo guarda snapshot de `ExistenciaActual`
- no escribe ni altera `ProductosServiciosExistencias`
- no genera movimientos de inventario
- no genera compromiso de inventario

Esto sí cumple parcialmente la dirección PO de que la cotización no afecte inventario.

### Qué sí reutiliza bien del catálogo actual

- producto y servicio en la misma cotización
- `PermiteVentaSinExistencia`
- `ExistenciaActual` informativa
- unidad de medida
- descuentos
- cliente y sucursal

### Qué no cumple todavía del objetivo PO

No existe evidencia actual de:

- `Fecha Instalación`
- `Observaciones para instalador`
- `Flete` opcional
- partidas ad hoc no catalogadas
- validación de alta obligatoria antes de convertir a pedido
- `ComprometidoPedido`
- `Disponible = ExistenciaFisica - ComprometidoPedido`
- selección o asignación de `Operador instalador`
- vista de existencia por sucursal comercial
- conversión `Cotización autorizada -> Pedido`

## Auditoría 04 - Pedido, Venta, Caja y Asistencia en CheckApp

### Pedido

No existe en MVC auditado:

- controlador `Pedidos`
- vistas `Pedidos`
- JS `Pedidos`

No existe en API auditada:

- controlador `Pedidos`
- tabla CheckApp `Pedidos`
- endpoint de conversión `Cotización -> Pedido`

Conclusión:

- `Pedido` es gap real actual en CheckApp

### Venta

En MVC sí existe menú y controller `VentasController`, pero solo como placeholder:

- `Nueva`
- `Devoluciones`

La UI actual explícitamente dice que la implementación funcional no forma parte de la iteración.

No existe API `Ventas` en `checklistWs`.

Conclusión:

- `Venta` sigue siendo gap real actual
- el módulo visible no equivale a operación comercial implementada

### Caja

Solo se localizó `Caja` como dato capturable dentro de cotización.

No existe evidencia de:

- módulo Caja POS
- apertura
- cierre
- cortes
- sesión de caja

Conclusión:

- `Caja POS` es gap real

### Asistencia

No existe en CheckApp auditado:

- módulo de asistencia POS
- elegibilidad comercial por asistencia
- vínculo operativo entre venta y asistencia

Conclusión:

- `Asistencia POS` es gap real

## Reutilización real vs adaptación vs faltantes

### Ya tenemos

- catálogo unificado de producto/servicio
- control de inventario físico básico
- negativos controlados por producto
- cotización con autorización
- snapshot de existencia en cotización
- clientes
- sucursales
- operadores
- PDF y correo documental

### Podemos reutilizar

- `ProductosServicios` como base de partida comercial
- `Cotizaciones` como preventa base
- `Operadores` como semilla de persona operativa
- `Sucursales` y `Clientes`
- infraestructura documental PDF/correo

### Debemos adaptar

- `ProductosServicios` para datos fiscales/comerciales faltantes
- `Cotizaciones` para instalación, flete, disponibilidad y transición comercial
- `Operadores` para servicios instalables y rol operativo comercial
- inventario para manejar compromiso por pedido y disponible comercial

### Realmente falta

- `Pedido`
- compromiso de inventario por pedido
- `Disponible`
- surtimiento parcial
- múltiples ventas por pedido
- `Venta/Ticket`
- checkout/cobro
- formas de pago
- NC / vale
- asistencia POS
- caja POS
- distinción formal vendedor / cajero / operador instalador

## Respuesta puntual a decisiones del Product Owner

### 1. Cotizar productos y servicios juntos

Estado actual:

- `SÍ PARCIAL`

Evidencia:

- `CotizacionesPartidas` guarda `TipoProductoServicio`
- `Cotizaciones` consulta `ProductosServicios`

Limitación:

- no hay concepto ad hoc no catalogado

### 2. Cotización no afecta inventario

Estado actual:

- `SÍ`

### 3. Cotización debe mostrar existencia física, comprometido y disponible

Estado actual:

- `NO`

Solo muestra:

- `ExistenciaActual`

No muestra:

- `ComprometidoPedido`
- `Disponible`

### 4. Cotizar con existencia, sin existencia o disponible negativo

Estado actual:

- `PARCIAL`

Sí existe:

- `PermiteVentaSinExistencia`

No existe todavía:

- cálculo de `Disponible` por pedido comprometido

### 5. Concepto no catalogado en cotización

Estado actual:

- `NO`

### 6. Antes de convertir a pedido, alta/vinculación obligatoria

Estado actual:

- `NO APLICA AÚN`

porque no existe conversión a pedido en CheckApp actual.

### 7. Pedido compromete inventario

Estado actual:

- `NO`

porque no existe `Pedido`.

### 8. Fórmula `Disponible = ExistenciaFisica - ComprometidoPedido`

Estado actual:

- `NO EXISTE`

### 9. Servicios no afectan inventario

Estado actual:

- `SÍ`

### 10. Servicios de instalación requieren operador

Estado actual:

- `NO`

### 11. Operador no equivale a vendedor ni cajero

Estado actual:

- `SIN MODELADO COMERCIAL AÚN`

### 12. Cotización requiere fecha instalación y observaciones para instalador

Estado actual:

- `NO`

### 13. Cotización con flete opcional

Estado actual:

- `NO`

### 14. Venta nace solo de pedido

Estado actual:

- `NO EXISTE AÚN EL FLUJO`

### 15. Pedido con surtimiento parcial y múltiples ventas

Estado actual:

- `NO EXISTE AÚN EL FLUJO`

## Dictamen final

CheckApp sí está más avanzado de lo que parecía en dos frentes:

- catálogo comercial base
- cotización operativa real

Pero el sistema destino todavía no soporta el ciclo comercial objetivo del PO porque faltan los bloques críticos:

- pedido
- compromiso por pedido
- disponible comercial
- venta / cobro
- caja
- asistencia
- postventa documental transaccional

La recomendación documental correcta no es rehacer todo.

La recomendación correcta es:

- reutilizar `ProductosServicios`
- reutilizar `Cotizaciones`
- adaptar inventario a compromiso por pedido
- construir después el corazón transaccional faltante

## Resumen corto por dominio

| Dominio | Estado real actual | Dictamen |
|---|---|---|
| ProductosServicios | existe y es reutilizable | `REUTILIZAR` |
| Existencias | existe pero solo física por empresa | `ADAPTAR` |
| Movimientos inventario | existe | `REUTILIZAR` |
| Cotizaciones | existe y opera | `REUTILIZAR / ADAPTAR` |
| Pedido | no existe | `FALTA` |
| Venta | placeholder MVC sin backend | `FALTA` |
| Caja POS | no existe | `FALTA` |
| Asistencia POS | no existe | `FALTA` |
| Operador instalador en servicio | no existe | `FALTA` |
| Comprometido / Disponible | no existe | `FALTA` |

## CORRECCION / AMPLIACION DE AUDITORIA

El `2026-08-18` se completo la ampliacion documental de los bloques omitidos del destino CheckApp, sin reauditar los hallazgos ya confirmados de inventario base, `ProductosServicios`, `Cotizaciones` y gaps generales de `Pedido` / `Venta`.

Documentos nuevos creados en `docs/comercial/checkapp/`:

- `01_AUDITORIA_CHECKAPP_DOMINIOS_ACTUALES.md`
- `02_PRODUCTOSSERVICIOS_INVENTARIO.md`
- `03_OC_RECEPCION_EXISTENCIAS.md`
- `04_COTIZACIONES_ESTADO_ACTUAL.md`
- `05_PRODUCTO_NO_CATALOGADO.md`
- `06_FECHA_INSTALACION_SERVICIOS.md`
- `07_SERVICIOS_OPERADORES.md`
- `08_USUARIOS_CAPACIDADES_ASISTENCIA.md`
- `09_FORMAS_PAGO_DOCUMENTOS.md`
- `10_PEDIDO_MODELO_OBJETIVO.md`
- `11_COMPROMISO_INVENTARIO.md`
- `12_VENTA_DESDE_PEDIDO.md`
- `13_SURTIMIENTO_PARCIAL.md`
- `14_FLETE_ACTIVOS_FISCAL.md`
- `15_MAPA_DATOS_COMERCIAL_CHECKAPP.md`
- `16_GAP_FINAL_CHECKAPP_COMERCIAL.md`
- `17_PROPUESTA_FUNCIONAL_COMERCIAL.md`

Correcciones y cierres nuevos relevantes:

- `OrdenesCompra` si existe como modulo vivo, pero no se encontro recepcion integrada a inventario.
- La cadena `OC -> Recepcion -> ProductosServiciosMovimientosInventario -> ProductosServiciosExistencias` no esta implementada en el destino actual.
- El mejor modelo sustentado por infraestructura vigente es conservar inventario fisico por empresa y construir compromiso comercial por sucursal.
- `CotizacionesPartidas` hoy exige `idProductoServicio` obligatorio; el concepto no catalogado es viable solo como adaptacion deliberada, no como ajuste trivial.
- `FechaInstalacion` y `ObservacionesInstalador` deben modelarse por servicio, con opcion global de referencia comercial.
- `Operadores` si es reusable como maestro operativo, pero no existe aun asignacion formal `Servicio -> Operador`.
- `Usuarios`, `Roles` y `Permisos` si permiten proyectar capacidades comerciales posteriores, evitando duplicar sistemas de autorizacion.
- No se localizo un modulo general reutilizable de asistencia comercial en CheckApp; el soporte actual se limita a contexto operativo de checklist.
- `Formas de pago`, `Facturacion`, `NC` y `Vale` siguen siendo gaps reales del destino.
- `Clientes` y `RazonesSociales` si aportan fiscal basico reusable (`RFC`, `Regimen`, `CP`), pero no cubren todavia `UsoCFDI`, `FormaFiscal`, `ClaveProdServ` ni `ClaveUnidad`.
- `Activos` es reutilizable como contexto de servicio o evidencia, no como partida comercial por defecto.

Restriccion vigente:

- sigue prohibido generar plan de implementacion o modificar modulos funcionales con base en esta auditoria hasta revision final de Product Owner.
