# Pedido Modelo Objetivo

## Hecho base

`Pedido` no existe hoy en CheckApp destino.

## Rol esperado del pedido

El pedido debe convertirse en la frontera entre:

- intencion comercial cotizada;
- compromiso de inventario;
- surtimiento parcial;
- multiples ventas;
- trazabilidad de cumplimiento.

## Modelo conceptual recomendado

`Cotizacion -> Pedido -> Venta(s) -> Documentos postventa`

## Responsabilidades del pedido

- capturar partidas comprometidas;
- separar surtido vs pendiente;
- soportar estado parcial;
- enlazar sucursal comercial;
- bloquear conceptos no catalogados;
- permitir operadores en partidas de servicio;
- ser fuente unica para venta desde comercial objetivo.

## Estados minimos conceptuales

- `BORRADOR`
- `AUTORIZADO`
- `PARCIAL`
- `SURTIDO`
- `CANCELADO`

## Reutilizacion del destino

Puede reutilizar:

- cliente;
- sucursal;
- razon social;
- productos y servicios;
- operadores;
- cotizacion como origen documental.

Debe nacer como entidad nueva:

- encabezado pedido;
- detalle pedido;
- compromiso;
- seguimiento surtido.
