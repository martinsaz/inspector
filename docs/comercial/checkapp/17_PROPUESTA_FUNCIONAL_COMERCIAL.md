# Propuesta Funcional Comercial

## Direccion recomendada

No rehacer CheckApp comercial desde cero.

Construir encima de lo ya util:

- clientes;
- razones sociales;
- sucursales;
- productos y servicios;
- cotizaciones;
- operadores;
- activos;
- inventario fisico base.

## Modelo funcional propuesto

1. Cotizacion reutiliza estructura actual y agrega despues concepto pendiente, flete y datos de servicio.
2. Pedido nace como nueva entidad obligatoria para compromiso y surtimiento.
3. Compromiso inventario vive separado del fisico y puede operar por sucursal.
4. Venta nace desde pedido y soporta multiples surtidos.
5. Servicio puede asignar uno o varios operadores.
6. NC, Vale, Formas de pago y Facturacion se modelan como bloques nuevos sobre cliente y pedido.

## Clasificacion final

- `REUTILIZAR`: Clientes, RazonesSociales, Sucursales, ProductosServicios, Cotizaciones, Operadores, Activos basicos.
- `ADAPTAR`: OrdenesCompra, inventario fisico, CotizacionesPartidas, fiscal basico, activos en contexto comercial.
- `NUEVO`: Pedido, compromiso, disponible, venta, caja, asistencia, formas de pago, NC, vale, facturacion.

## Restriccion vigente

Esta entrega cierra modelado del sistema destino. Sigue prohibido implementar hasta revision y definicion final del Product Owner.
