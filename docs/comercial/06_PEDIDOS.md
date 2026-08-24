# 06 PEDIDOS

Fecha: 2026-08-17

## Entidad auditada

Pedido comercial en Legacy:

- `dbo.pedidos_clientes`
- `dbo.pedidos_clientes_det`
- `dbo.pedidos_clientes_pago`
- `dbo.pedidos_clientes_doc`
- sync legacy a `dbo.orders` + `dbo.detorder`

## Estructura confirmada

Fuente:

- `EnsurePedidosClientesSchemaAsync` en `sazapi/Endpoints/Program.Endpoints.Ventas.cs`

Encabezado:

- PK `id`
- folio único `UX_pedidos_clientes_folio`
- `tienda_id`
- `caja_id`
- `vendedor_id`
- `socio_id`
- `usuario`
- totales de efectivo, tarjeta, NC, VC
- `nuevo_vale_numero`
- `estado`
- `impreso`
- cancelación
- `idempotency_key`
- `payload_json`
- `fecha`

Detalle:

- PK `id`
- FK `pedido_id`
- `renglon`
- `barcode`
- `talla`
- `cantidad`
- `precio`
- `descuento_pct`
- `subtotal`

Pagos:

- PK `id`
- FK `pedido_id`
- `clave`
- `tipo`
- `monto`

Documentos:

- PK `id`
- FK `pedido_id`
- `tipo`
- `folio`
- `monto`
- `estatus_texto`

## Respuestas obligatorias

1. `¿qué estados tiene?`
`PEDIDO_CLIENTE`, `SURTIDO`, y estado cancelado tratado por `LIKE 'CANCEL%'`.

2. `¿puede modificarse?`
`CONFIRMADO` hay código de actualización/reemplazo de detalle en `Program.Endpoints.Ventas.cs`.

3. `¿puede cancelarse?`
Sí, por columnas `fecha_cancelado`, `usuario_cancelado`, `motivo_cancelado`.

4. `¿puede venderse parcialmente?`
`NO CONFIRMADO — EVIDENCIA FALTANTE`.

5. `¿puede venderse varias veces?`
`NO CONFIRMADO`.

6. `¿puede quedar pendiente?`
Sí, porque nace como `PEDIDO_CLIENTE` antes de `SURTIDO`.

7. `¿reserva inventario?`
No confirmado como reserva técnica en `dbo.existen`.

8. `¿descuenta inventario?`
No, al crearse no toca inventario.

9. `¿admite faltantes?`
`NO CONFIRMADO`.

10. `¿admite negativos?`
`NO CONFIRMADO`.

11. `¿admite servicios?`
No se confirmó en Legacy POS clásico por evidencia de `detorder`.

12. `¿admite fletes?`
No confirmado como renglón de pedido cliente.

13. `¿admite partidas sin inventario?`
`NO CONFIRMADO`.

14. `¿qué significa surtido?`
Pedido consumido por venta y marcado `SURTIDO`.

15. `¿qué significa vendido?`
No se localizó un estado textual oficial separado; la venta afecta `detorder` y `pedidos_clientes`.

16. `¿cómo se relaciona con venta?`
`req.PedidoRefs` en `POST /ventas/cobrar`.

17. `¿qué campo/tabla marca conversión a venta?`
`detorder.ticket`, `detorder.status = 5`, y `pedidos_clientes.estado = 'SURTIDO'`.

18. `¿qué pasa con pedido después de cobrar?`
Se marca `SURTIDO` y deja rastro del ticket en `detorder`.

## CheckApp actual

- pedido comercial actual: no localizado
- venta desde pedido actual: no localizada
- PDF pedido: existe `PedidoClientePdfService` en Legacy, no en CheckApp comercial

## Dictamen

Pedido ya es una entidad real en Legacy y debe migrarse como vertical propio, no como checkbox dentro de venta.
