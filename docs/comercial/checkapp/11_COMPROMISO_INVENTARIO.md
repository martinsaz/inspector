# Compromiso Inventario

## Problema actual

El destino solo conoce:

- existencia fisica;
- negativos controlados;
- movimientos fisicos.

No conoce:

- `ComprometidoPedido`
- `Disponible`

## Propuesta conceptual

Formula objetivo:

`Disponible = ExistenciaFisica - ComprometidoPedido`

## Recomendacion

Mantener:

- `ExistenciaFisica` en infraestructura actual de inventario por empresa.

Agregar despues:

- compromiso comercial por sucursal y por partida de pedido.

## Motivo de la recomendacion

- evita rehacer inventario fisico;
- habilita promesa comercial local;
- soporta multiple venta contra un pedido;
- desacopla recepcion fisica de reserva comercial.

## Comportamiento esperado

- crear pedido: aumenta `ComprometidoPedido`
- surtir parcial: baja fisico y baja compromiso solo por lo surtido
- cancelar pedido: libera compromiso remanente
- devolver: reingresa fisico y evalua regla comercial de reliberacion

## Dictamen

`ComprometidoPedido` y `Disponible` son `ENTIDADES / DATOS NUEVOS`, pero se montan sobre inventario actual reusable.
