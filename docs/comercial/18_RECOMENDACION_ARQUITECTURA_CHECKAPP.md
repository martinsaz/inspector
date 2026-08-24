# 18 RECOMENDACION ARQUITECTURA CHECKAPP

Fecha: 2026-08-17

## Principio

No clonar Tarahumara. Adaptar reglas Legacy a la realidad actual de CheckApp.

## Recomendación

Separar el comercial en seis bloques:

1. `Cotizaciones`
2. `Pedidos`
3. `Venta / Cobro`
4. `Caja / Asistencia`
5. `Documentos comerciales`
6. `Dependencias fiscales`

## Núcleo reutilizable CheckApp

- `Usuarios`
- `Operadores`
- `Sucursales`
- `Clientes`
- `ProductosServicios`
- `RazonesSociales`
- `Correo saliente`
- infraestructura PDF existente

## Núcleo nuevo recomendado

- `PerfilPos`
- `AsistenciaPos`
- `CajaPos`
- `PedidoComercial`
- `VentaPos`
- `VentaPago`
- `DocumentoComercial`

## Decisiones de arquitectura

- contexto tenant siempre server-side
- reglas de negocio solo en API
- MVC como shell y proxy seguro
- estados operativos explícitos
- inventario comercial desacoplado del UI
- compatibilidad documental con ticket/factura/NC/vale

## Decisiones PO necesarias

- si CheckApp permitirá venta libre siempre
- si activo puede venderse como partida comercial
- si flete será renglón comercial o cargo global
- si caja y vendedor pueden ser personas distintas
- si operador reutilizado cubrirá venta/cobro o se definirá perfil nuevo

## Dictamen

La arquitectura está lista para construir plan de trabajo. No está lista para implementar directo sin decisiones de PO sobre:

- perfil POS
- caja
- venta libre vs obligatoria desde pedido
- activos/fletes como partida comercial
