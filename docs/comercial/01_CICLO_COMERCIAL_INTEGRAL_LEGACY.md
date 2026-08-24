# 01 CICLO COMERCIAL INTEGRAL LEGACY

Fecha: 2026-08-17

## Alcance

Auditoría integral del ciclo comercial Legacy orientada a adaptación CheckApp:

- cotización
- autorización
- pedido
- venta
- cobro
- ticket
- facturación
- devolución
- nota de crédito / vale
- reutilización de documentos en nueva venta

Fuentes primarias:

- `inspector/AGENTS.md`
- `inspector/CLAUDE.md`
- `inspector/docs/qa/AUDITORIA_PREIMPLEMENTACION_LEGACY_VENTAS_DEVOLUCIONES_AJUSTES_PV_FORMAS_PAGO_2026-08-17.md`
- `inspector/docs/ventas/10..16`
- `inspector/checklist/docs/cotizaciones/COTIZACIONES_AUDITORIA_PRE_MIGRACION_20260810.md`
- `sazapi/Endpoints/Program.Endpoints.Cotizaciones.cs`
- `sazapi/Endpoints/Program.Endpoints.Ventas.cs`
- `sazapi/Endpoints/Program.Endpoints.Asistencia.cs`
- `sazapi/Endpoints/Program.Endpoints.Estadisticas.CorteCaja.cs`

## Cadena integral confirmada

`Cotización BORRADOR`
-> `AUTORIZADA`
-> `POST /cotizaciones/{id}/convertir-pedido`
-> `dbo.pedidos_clientes + dbo.pedidos_clientes_det`
-> sync `dbo.orders + dbo.detorder`
-> carga de pedido vigente a venta
-> `POST /ventas/cobrar`
-> `dbo.detnotas + dbo.fma`
-> facturación posterior / asociación fiscal
-> devolución
-> `dbo.notascre` o `dbo.vales`
-> reutilización como documento de pago

## Hallazgos mayores

- `CONFIRMADO` Legacy sí maneja pedido como proceso real, no hipotético.
- `CONFIRMADO` la conversión a pedido exige cotización `AUTORIZADA`.
- `CONFIRMADO` el pedido cliente nuevo no descuenta inventario al crearse.
- `CONFIRMADO` la venta sí puede existir sin pedido en Legacy.
- `CONFIRMADO` la venta sí exige vendedor elegible por asistencia del día.
- `CONFIRMADO` `CajaId` participa en cotización, pedido, venta, devolución y reportes de corte.
- `CONFIRMADO` NC y vale se reutilizan como documentos de pago en nueva venta.

## Estados núcleo confirmados

Cotización Legacy `sazapi`:

- `BORRADOR`
- `AUTORIZADA`
- `CONVERTIDA`
- `CANCELADA`

Cotización CheckApp actual:

- `Borrador`
- `Autorizada`
- `Cancelada`
- `NO EXISTE` estado `Convertida` en el `CotizacionesController` actual de CheckApp

Pedido cliente `sazapi`:

- `PEDIDO_CLIENTE` al crear
- `SURTIDO` después de cobrar una venta que lo consume
- `CANCEL%` aparece tratado como cancelado
- `NO CONFIRMADA — EVIDENCIA FALTANTE` una lista cerrada y oficial completa de estados adicionales

## Dependencias operativas reales

- persona operativa: `dbo.empleado`
- asistencia: `dbo.logdia`
- sucursal: `dbo.tiendas`
- caja: columna `caja` en múltiples tablas y reportes
- cliente: `dbo.socios`
- inventario: `dbo.existen`
- pago: `dbo.formaspago`
- crédito: `dbo.creditos`
- devolución: `dbo.detdev`, `dbo.notascre`, `dbo.vales`
- venta: `dbo.detnotas`, `dbo.fma`
- pedido: `dbo.pedidos_clientes*`, `dbo.orders`, `dbo.detorder`

## Dictamen de proceso

CheckApp no debe copiar literalmente el POS Legacy. Sí debe adoptar estas reglas mínimas:

- cotización autorizable y convertible a pedido
- pedido como entidad separada de venta
- venta libre y venta desde pedido como operaciones distintas
- asistencia por sucursal como prerrequisito de venta
- caja como contexto operativo y de corte
- inventario diferenciando inventariable vs no inventariable
- documentos comerciales reutilizables `NC/VC`

## Reutilización CheckApp ya disponible

- `Clientes`
- `ProductosServicios`
- `Sucursales`
- `RazonesSociales`
- `Cotizaciones`
- `Operadores`
- `Correo saliente`
- exportación PDF documental

## Gaps nuevos inevitables

- venta POS
- pedido comercial operativo
- caja POS
- asistencia POS
- inventario comercial acoplado a venta
- catálogos fiscales de pago/producto aplicados al checkout
