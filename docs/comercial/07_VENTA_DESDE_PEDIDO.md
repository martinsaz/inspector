# 07 VENTA DESDE PEDIDO

Fecha: 2026-08-17

## Hallazgo principal

Legacy soporta dos caminos:

- venta libre sin pedido previo
- venta desde pedido usando `PedidoRefs`

## Venta desde pedido confirmada

Evidencia:

- `VentaCobrarRequest.PedidoRefs`
- `detorder`
- `pedidos_clientes`
- `POST /ventas/cobrar`

## Cadena trazada

`Pedido cliente vigente`
-> carga en venta
-> `PedidoRefs`
-> cobro
-> update `detorder.ticket`
-> update `detorder.status = 5`
-> update `pedidos_clientes.estado = 'SURTIDO'`

## Respuestas obligatorias

1. `¿Venta puede existir sin Pedido?`
Sí.

2. `¿Legacy permite venta libre?`
Sí.

3. `¿CheckApp debe permitirla?`
Sí probable, pero requiere decisión PO si toda operación comercial debe pasar por cotización/pedido.

4. `¿qué tipos de operación existen?`
Venta libre y venta desde pedido.

5. `¿quién ejecuta venta?`
Usuario autenticado con `VendedorId` elegible.

6. `¿quién ejecuta cobro?`
El mismo flujo autenticado; cajero se resuelve por usuario/empleado.

7. `¿vendedor y cajero pueden ser personas distintas?`
Sí técnicamente; `VendedorId` y `empleadoCajero` se resuelven por rutas distintas.

8. `¿requieren asistencia?`
Vendedor sí.

9. `¿requieren caja abierta?`
`NO CONFIRMADO` como regla dura, pero sí requieren `CajaId`.

10. `¿requieren sucursal activa?`
Sí; la venta resuelve tienda final y valida contexto.

## Pedido consumido por venta

Tablas tocadas:

- `dbo.detorder`
- `dbo.pedidos_clientes`

Efecto:

- renglones afectados quedan con ticket
- pedido cliente cambia a `SURTIDO`

## Venta libre

No requiere:

- cotización
- pedido
- `detorder`

Sí requiere:

- sucursal
- caja
- vendedor elegible
- items
- pagos y/o documentos

## CheckApp

Hoy no existe un módulo comercial real que permita ninguna de las dos variantes.

## Dictamen

CheckApp debe modelar explícitamente:

- `Venta libre`
- `Venta desde pedido`

porque ambas existen funcionalmente en Legacy y afectan trazabilidad, UI y QA.
