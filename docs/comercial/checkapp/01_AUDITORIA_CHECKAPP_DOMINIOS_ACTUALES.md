# Auditoria CheckApp Dominios Actuales

Fecha: `2026-08-18`

## Alcance

Este bloque complementa `docs/comercial/21_AUDITORIA_CHECKAPP_DESTINO_CICLO_COMERCIAL.md` sin reauditar lo ya confirmado de `ProductosServicios`, inventario base y gaps generales de `Pedido` y `Venta`.

## Dominios actuales confirmados

| Dominio | Estado actual | Evidencia principal | Dictamen |
|---|---|---|---|
| Productos y servicios | Operativo | `Controllers/ProductosServicios/*` | `REUTILIZAR` |
| Inventario fisico base | Operativo por empresa + producto | `ProductosServiciosExistencias`, `ProductosServiciosMovimientosInventario` | `ADAPTAR` |
| Cotizaciones | Operativo | `Controllers/Cotizaciones/CotizacionesController.cs` | `REUTILIZAR / ADAPTAR` |
| Ordenes de compra | Operativo parcial | `Controllers/OrdenesCompra/OrdenesCompraController.cs` | `ADAPTAR` |
| Recepcion de OC | No localizada | sin tablas ni endpoints localizados | `GAP REAL` |
| Clientes | Operativo | `api/Clientes/*` | `REUTILIZAR` |
| Razones sociales | Operativo | `Controllers/RazonesSociales/*` | `REUTILIZAR` |
| Operadores | Operativo para checklist | `Controllers/Operadores/*` | `ADAPTAR` |
| Roles / permisos | Operativo | `dbo.Roles.Permisos` + `RolesController` | `REUTILIZAR` |
| Formas de pago | Placeholder UI, sin backend comercial actual | `Views/Ajustes/FormasPago.cshtml` | `NUEVO` |
| Facturacion | Placeholder UI, sin backend comercial actual | `Controllers/Facturacion/FacturacionController.cs` | `NUEVO` |
| NC / Vale | No localizado en destino | sin tablas ni endpoints CheckApp actuales | `NUEVO` |
| Activos | Operativo, independiente | `api/Activos/*` | `ADAPTAR` |
| Pedido comercial | No existe | sin modulo destino | `NUEVO` |
| Venta desde pedido | No existe | sin backend destino | `NUEVO` |
| Surtimiento parcial | No existe como flujo | sin entidad pedido | `NUEVO` |

## Conclusion

CheckApp ya ofrece base real reutilizable en catalogos, clientes, cotizaciones, operadores y activos. El corazon transaccional comercial sigue incompleto y debe modelarse sobre infraestructura existente, no reconstruirse desde cero sin criterio.
