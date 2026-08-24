# 16 MAPA CICLO COMERCIAL

Fecha: 2026-08-17

## Mapa obligatorio

`USUARIO / OPERADOR`
-> `PERFIL POS`
-> `ASISTENCIA`
-> `SUCURSAL`
-> `CAJA`
-> `COTIZACIÓN`
-> `AUTORIZACIÓN`
-> `PEDIDO`
-> `VENTA`
-> `COBRO`
-> `INVENTARIO / SIN INVENTARIO`
-> `TICKET`
-> `FACTURACIÓN`
-> `DEVOLUCIÓN`
-> `NC / VALE`
-> `NUEVA VENTA`

## Lectura funcional

- cotización no afecta inventario
- pedido no afecta inventario
- venta sí afecta inventario
- devolución reintegra inventario
- NC/vale regresan al flujo como documento de pago

## Variantes operativas

- flujo libre: `Venta -> Cobro`
- flujo guiado: `Cotización -> Pedido -> Venta -> Cobro`

## Precisión final de gaps

PREVENTA

- `Cotización`
- `Autorización`
- `Pedido`

OPERACIÓN

- `Usuario autenticado`
- `Operador vendedor`
- `Perfil POS`
- `Asistencia vigente`
- `Sucursal`
- `Caja`

VENTA

- `Pedido / Venta libre` según decisión PO
- `Partida comercial`
- `Inventario / Sin inventario`
- `Checkout`
- `Cobro`
- `Ticket`

POSTVENTA

- `Devolución`
- `NC / Vale`
- `Nueva venta`

## Dependencias obligatorias

- sin persona operativa no hay venta
- sin asistencia no hay vendedor elegible
- sin sucursal no hay contexto comercial
- sin caja no hay trazabilidad POS suficiente
- sin catálogo de pagos no hay checkout
- sin cliente fiscal no hay factura
- pedido parcial no está confirmado como paridad Legacy
- caja formal abierta no está confirmada como requisito duro de cobro
