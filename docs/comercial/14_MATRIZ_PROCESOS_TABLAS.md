# 14 MATRIZ PROCESOS TABLAS

Fecha: 2026-08-17

| Proceso | Tabla Legacy | Lectura | Escritura | PK | FK | CheckApp existente | Reutilizar | Nueva propuesta |
|---|---|---|---|---|---|---|---|---|
| Cotización | `dbo.cotizaciones` | Sí | Sí | `id` | `NO CONFIRMADA` | `Cotizaciones` | Parcial | Adaptar |
| Cotización detalle | `dbo.cotizaciones_det` | Sí | Sí | `NO CONFIRMADA` | `cotizacion_id` | `CotizacionesPartidas` CheckApp | Parcial | Adaptar |
| Pedido cliente | `dbo.pedidos_clientes` | Sí | Sí | `id` | no aplica | No | No | Nuevo |
| Pedido detalle | `dbo.pedidos_clientes_det` | Sí | Sí | `id` | `pedido_id` | No | No | Nuevo |
| Pedido pagos | `dbo.pedidos_clientes_pago` | Sí | Sí | `id` | `pedido_id` | No | No | Nuevo |
| Pedido docs | `dbo.pedidos_clientes_doc` | Sí | Sí | `id` | `pedido_id` | No | No | Nuevo |
| Legacy order hdr | `dbo.orders` | Sí | Sí | `NO CONFIRMADA` | no aplica | No | No | No migrar literal |
| Legacy order det | `dbo.detorder` | Sí | Sí | `NO CONFIRMADA` | no confirmada | No | No | Adaptar |
| Venta hdr | `dbo.fma` | Sí | Sí | `NO CONFIRMADA` | no confirmada | No | No | Nuevo |
| Venta det | `dbo.detnotas` | Sí | Sí | `NO CONFIRMADA` | no confirmada | No | No | Nuevo |
| Formas pago | `dbo.formaspago` | Sí | Sí | `NO CONFIRMADA` | no confirmada | No | No | Nuevo |
| Nota crédito | `dbo.notascre` | Sí | Sí | `NO CONFIRMADA` | no confirmada | No | No | Nuevo |
| Vale | `dbo.vales` | Sí | Sí | `NO CONFIRMADA` | no confirmada | No | No | Nuevo |
| Inventario | `dbo.existen` | Sí | Sí | `NO CONFIRMADA` | no confirmada | `ProductosServiciosExistencias` | Parcial | Adaptar |
| Cliente legacy | `dbo.socios` | Sí | No directo | `NO CONFIRMADA` | no confirmada | `dbo.Clientes` | Sí parcial | Adaptar |
| Empleado | `dbo.empleado` | Sí | No directo | `NO CONFIRMADA` | no confirmada | `Usuarios` / `Operadores` | Parcial | Adaptar |
| Asistencia | `dbo.logdia` | Sí | Sí | `NO CONFIRMADA` | no confirmada | No | No | Nuevo |
| Sucursal | `dbo.tiendas` | Sí | No | `NO CONFIRMADA` | no aplica | `dbo.Sucursales` | Sí | Reutilizar |
| Producto | `dbo.articulo` | Sí | No directo | `NO CONFIRMADA` | no confirmada | `dbo.ProductosServicios` | Sí parcial | Adaptar |
| Crédito | `dbo.creditos` | Sí | Sí | `NO CONFIRMADA` | no confirmada | No | No | Nuevo |
| Razón social fiscal | `RazonesSociales` CheckApp | Sí | Sí | propia | propia | `RazonesSociales` | Sí | Reutilizar |

## Lectura rápida

- núcleo comercial nuevo en CheckApp: pedido, venta, caja, asistencia, NC/vale
- reutilización fuerte: clientes, sucursales, productos/servicios, razones sociales, cotizaciones
