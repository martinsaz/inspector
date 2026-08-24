# Surtimiento Parcial

## Requerimiento PO

Un mismo `Pedido` podra originar multiples ventas.

## Modelo objetivo

Ejemplo:

- `CantidadPedido = 5`
- `Venta 1 = 2`
- `Surtida = 2`
- `Pendiente = 3`
- `EstadoPedido = PARCIAL`

Luego:

- `Venta 2 = 3`
- `Surtida = 5`
- `Pendiente = 0`
- `EstadoPedido = SURTIDO`

## Impacto en inventario conceptual

Antes:

- `ExistenciaFisica = 7`
- `ComprometidoPedido = 5`
- `Disponible = 2`

Surtir 2:

- `ExistenciaFisica = 5`
- `ComprometidoPedido = 3`
- `Disponible = 2`

## Infraestructura actual que puede soportarlo

- catalogo de producto / servicio;
- existencia fisica actual;
- movimientos fisicos;
- cliente y sucursal;
- cotizacion origen;
- operadores para servicios.

## Infraestructura faltante

- pedido y sus partidas;
- acumulado surtido;
- pendiente;
- compromiso por pedido;
- venta enlazada a pedido.

## Dictamen

El destino no soporta hoy surtimiento parcial, pero su inventario fisico y sus catalogos si permiten construirlo sin reemplazar la base ya existente.
