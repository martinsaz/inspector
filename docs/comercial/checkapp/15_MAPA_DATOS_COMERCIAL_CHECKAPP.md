# Mapa Datos Comercial CheckApp

## Reutilizables directos

- `Clientes`
- `RazonesSociales`
- `Sucursales`
- `ProductosServicios`
- `ProductosServiciosExistencias`
- `ProductosServiciosMovimientosInventario`
- `Cotizaciones`
- `Operadores`
- `Activos`
- `Roles`
- `Usuarios`

## Adaptables

- `OrdenesCompra`
- `CotizacionesPartidas` para concepto pendiente
- `Operadores` para asignacion por servicio
- `Activos` para contexto del servicio
- inventario fisico actual para compromiso comercial

## Nuevos reales

- `Pedido`
- `PedidoDetalle`
- `ComprometidoPedido`
- `Disponible`
- `Venta` comercial
- `Caja`
- `Asistencia`
- `NotaCredito`
- `Vale`
- configuracion y catalogo de formas de pago destino

## Relaciones objetivo

`Cliente -> Cotizacion -> Pedido -> Venta`

`Pedido -> PartidaServicio -> Operador`

`Pedido -> CompromisoInventario -> VentaParcial`

`Venta -> DocumentoPago / Factura / NC / Vale`
