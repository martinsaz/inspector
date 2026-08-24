# 13 FACTURACION EN VENTA

Fecha: 2026-08-17

## Alcance

Solo se audita la participación de facturación dentro de venta. No se rediseña el panel completo de facturación.

## Dependencias confirmadas

- cliente real
- RFC
- código postal fiscal
- régimen fiscal
- uso CFDI
- `FormaFiscal` por forma de pago
- `ClaveProdServ`
- `ClaveUnidad`
- IVA / objeto impuesto
- referencia de ticket/factura

## Fuentes

- `sazapi/Endpoints/Program.Endpoints.Ventas.cs`
- `sazapi/Endpoints/Program.Endpoints.Facturacion.cs`
- `sazapi/Endpoints/Program.Endpoints.ConfiguracionFormasPago.cs`
- `inspector/docs/comercial/11_FORMAS_PAGO_CREDITO.md`

## Venta

En Legacy POS:

- la intención fiscal se decide antes del cobro
- si una forma usada no tiene `FormaFiscal`, la venta no debe facturarse
- si un producto no tiene SAT suficiente, la venta no debe facturarse

## SAT producto

Fuente confirmada:

- `articulosSAT`

Campos confirmados por lectura:

- `ClaveProdServ`
- `ClaveUnidad`

## Cliente fiscal

Legacy:

- `dbo.socios`

CheckApp reutilizable:

- `dbo.Clientes`
- `CatalogoClientesRegimenFiscal`
- `RazonesSociales`

## Factura posterior

Facturación usa ticket ya generado:

- preview de ticket
- preparación
- facturar ticket
- asociación de referencia de factura en `fma`

## Pedido y facturación

- no se confirmó que el pedido por sí solo facture
- la factura nace a partir de ticket/venta

## CheckApp reutilizable

| Dominio | Reutilización |
|---|---|
| Cliente fiscal | Sí parcial |
| Régimen fiscal | Sí |
| Razón social emisora | Sí |
| Catálogo SAT forma pago | No confirmado |
| Catálogo SAT prod/unidad | No confirmado |

## Dictamen

Facturación en venta depende directamente de comercial. No debe construirse aparte del checkout, porque sus reglas nacen de:

- forma de pago
- producto vendido
- cliente
- ticket final
