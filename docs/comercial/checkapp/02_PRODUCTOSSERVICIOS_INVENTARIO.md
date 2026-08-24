# ProductosServicios e Inventario

## Base confirmada

- `ProductosServicios` ya resuelve `Producto` y `Servicio`.
- `ProductosServiciosExistencias` guarda existencia fisica actual.
- `ProductosServiciosMovimientosInventario` registra movimientos con `TipoMovimiento`, `Referencia`, cantidades y costo.
- El alcance confirmado sigue siendo `empresa + producto`; no se confirmo existencia por sucursal.

## Infraestructura reutilizable

- Catalogo maestro de producto / servicio.
- Unidad de medida y reglas de decimales.
- Politica `PermiteVentaSinExistencia`.
- Registro transaccional de movimientos en inventario.

## Limites actuales

- No existe `ComprometidoPedido`.
- No existe `Disponible`.
- No existe reserva comercial por sucursal.
- No existe acoplamiento confirmado entre `OrdenesCompra` y `ProductosServiciosExistencias`.

## Implicacion comercial

La base actual sirve para:

- cotizar;
- visualizar existencia;
- hacer ajustes o movimientos manuales;
- construir despues recepcion, pedido y venta.

No sirve todavia para:

- promesa comercial por pedido;
- surtimiento parcial;
- multiple venta contra mismo pedido;
- disponibilidad comercial confiable por sucursal.

## Dictamen

`ProductosServicios` e inventario fisico actual se `REUTILIZAN`, pero necesitan `ADAPTACION` para compromiso comercial y para decidir si la visibilidad final sera por empresa, por sucursal o hibrida.
