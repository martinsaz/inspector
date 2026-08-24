# 05 COTIZACION A PEDIDO

Fecha: 2026-08-17

## Base previa obligatoria

Se reutiliza y complementa:

- `inspector/checklist/docs/cotizaciones/COTIZACIONES_AUDITORIA_PRE_MIGRACION_20260810.md`

No se repite la auditoría de cotización desde cero.

## Estados cotización confirmados

Legacy `sazapi`:

- `BORRADOR`
- `AUTORIZADA`
- `CONVERTIDA`
- `CANCELADA`

Reglas:

- solo `BORRADOR` se edita
- solo `BORRADOR` se autoriza
- solo `AUTORIZADA` se convierte a pedido
- `CONVERTIDA` ya no puede volver a convertirse

## Endpoint crítico

- `POST /cotizaciones/{id}/convertir-pedido`

Archivo:

- `sazapi/Endpoints/Program.Endpoints.Cotizaciones.cs`

## Request real

- path param `id`
- no DTO body confirmado en esta versión
- contexto por token y tenant

## Validaciones confirmadas

- permiso `AppActions.ConvertirPedido`
- cotización existente
- estado `AUTORIZADA`
- `pedido_folio_convertido` vacío
- cotización con detalle

## Tablas leídas

- `dbo.cotizaciones`
- `dbo.cotizaciones_det`

## Tablas escritas

- `dbo.pedidos_clientes`
- `dbo.pedidos_clientes_det`
- `dbo.orders`
- `dbo.detorder`
- `dbo.cotizaciones` update a `CONVERTIDA`

## Encabezado pedido insertado

En `dbo.pedidos_clientes`:

- `folio`
- `tienda_id`
- `caja_id`
- `vendedor_id`
- `socio_id`
- `usuario`
- `observaciones`
- `total`
- `total_pagado = 0`
- `cambio = 0`
- `total_documentos = 0`
- `total_efectivo = 0`
- `total_tarjeta = 0`
- `total_nc = 0`
- `total_vc = 0`
- `nuevo_vale_monto = 0`
- `estado = 'PEDIDO_CLIENTE'`
- `idempotency_key = 'COT2PED-{id}'`

## Detalle pedido insertado

En `dbo.pedidos_clientes_det`:

- `pedido_id`
- `renglon`
- `barcode`
- `talla`
- `cantidad`
- `precio`
- `descuento_pct`
- `subtotal`
- `estilo`
- `precio_original`
- `descuento_original`
- flags y motivos de edición manual
- `curva_nombre`
- `curva_multiplicador`

## Folio pedido

- se intenta `GetNextPedidoClienteFolioLegacyAsync`
- fallback a `GetNextPedidoClienteFolioAsync`

## Cliente, vendedor, sucursal, caja

Salen de `dbo.cotizaciones`:

- `tienda_id`
- `caja_id`
- `vendedor_id`
- `socio_id`

## Existencia

- `CONFIRMADO` convertir cotización a pedido no descuenta inventario
- el sync a `orders/detorder` tampoco afecta `dbo.existen`

## Estado final de la cotización

Update:

- `estado = 'CONVERTIDA'`
- `pedido_folio_convertido = @PedFolio`
- `fecha_convertido`
- `usuario_convertido`

## Respuesta

- `CotizacionConvertirResponse(true, folioPedido, "Cotización convertida a pedido {folioPedido}.")`

## CheckApp actual

- `Cotizaciones` actual sí existe
- autorización sí existe
- conversión a pedido no existe en el controlador actual CheckApp
- estado `Convertida` no existe en `CotizacionEstados` actual CheckApp

## Dictamen

`Cotización -> Pedido` está completamente confirmada en Legacy y parcialmente reutilizable en CheckApp solo del lado `Cotizaciones`; la conversión y la entidad `Pedido` siguen siendo gap nuevo.
