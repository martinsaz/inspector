# 11 FORMAS PAGO CREDITO

Fecha: 2026-08-17

## Base previa

Se reutiliza:

- `inspector/docs/ventas/11_BLUEPRINT_TECNICO_FORMAS_PAGO.md`

## Tabla central

- `dbo.formaspago`

## Relación comercial confirmada

Formas de pago interactúan con:

- pedido cliente
- venta
- caja
- cambio
- vale
- nota de crédito
- crédito
- facturación

## Pedido cliente

Tablas:

- `dbo.pedidos_clientes_pago`
- `dbo.pedidos_clientes_doc`

Pedido distingue:

- pagos directos
- documentos `NC/VC`

## Venta

`POST /ventas/cobrar`:

- carga mapa de formas
- clasifica efectivo, tarjeta, crédito, monedero, gift card
- rechaza combinaciones inválidas

## Crédito

Tablas:

- `dbo.creditos`

Endpoints confirmados:

- `GET /ventas/credito/validar`
- `GET /ventas/credito/clientes-con-saldo`
- `GET /ventas/credito/clientes/{socioId}/detalle`
- `GET /ventas/credito/pagare/consultar`
- `POST /ventas/credito/abonos/guardar`

## Reglas crédito confirmadas

- requiere cliente real
- requiere saldo pendiente
- no puede exceder el saldo de la venta
- puede generar pagaré/parcialidades

## Documentos como pago

`CONFIRMADO`

- `NC` aplica como documento de pago
- `VC` aplica como documento de pago

## Caja / vendedor / cajero

- formas de pago se capturan dentro del checkout de caja/sucursal
- `NO CONFIRMADO` un catálogo por cajero distinto al catálogo por sucursal

## Facturación

- cada forma usada en venta facturable requiere `FormaFiscal`
- diferencia real entre catálogo administrativo y operativo

## Dictamen

CheckApp debe separar:

- maestro de forma de pago
- configuración por sucursal
- disponibilidad operativa checkout
- relación fiscal SAT
- reglas de crédito/documentos
