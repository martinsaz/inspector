# Venta Desde Pedido

## Estado actual

- No existe `Venta` comercial funcional en CheckApp destino.
- `Ventas/Nueva` y `Ventas/Devoluciones` continúan como placeholders visuales.

## Regla PO tomada

La venta objetivo debe nacer desde `Pedido`.

## Justificacion

- el destino no tiene hoy checkout real;
- pedido es la unica forma estable de soportar compromiso y surtimiento;
- evita ventas sueltas imposibles de conciliar con promesa comercial.

## Modelo conceptual

`Pedido -> Venta 1..N`

Cada venta debe conocer:

- pedido origen;
- partida origen;
- cantidad surtida;
- pendiente restante;
- documento de pago / facturacion posterior.

## Reutilizacion del destino

- clientes;
- sucursales;
- razones sociales;
- productos / servicios;
- operadores para servicios;
- inventario fisico base.

## Nuevo requerido

- transaccion de venta;
- cobro;
- caja;
- aplicacion sobre pedido;
- reduccion de compromiso;
- estados parciales y surtidos.
