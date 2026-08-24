# 10 PRODUCTOS SERVICIOS ACTIVOS FLETES

Fecha: 2026-08-17

## Objetivo

Determinar qué puede funcionar como partida comercial en CheckApp.

## Legacy

Producto inventariable clásico:

- `CONFIRMADO`
- tablas `articulo`, `precios`, `existen`

Servicio:

- `NO CONFIRMADO` dentro del POS Legacy auditado

Activo:

- `NO CONFIRMADO` como renglón POS Legacy

Flete:

- `CONFIRMADO` como monto/columna en `fma` y corte, no como catálogo de partida plenamente trazado en esta corrida

## CheckApp actual

### ProductosServicios

Reutilización: `Sí`

Evidencia:

- `dbo.ProductosServicios`
- `dbo.ProductosServiciosExistencias`
- `dbo.ProductosServiciosMovimientosInventario`

Capacidades ya confirmadas:

- `TipoProducto = 1`
- `TipoServicio = 2`
- `CausaInventario`
- `PermiteVentaSinExistencia`
- existencia mínima
- movimientos inventario

### Activos

Reutilización: `Parcial`

Evidencia:

- módulo `Activos`
- tablas `Activos`, `ActivosMultimedia` y relacionadas

Limitación:

- no existe evidencia de uso actual como partida comercial de venta

## Fletes

Estado:

- `AUDITADO`

Hallazgo:

- aparecen como columna/monto `flete` en corte y acumulados de `fma`
- no quedó confirmada una tabla maestra de fletes comerciales para POS en esta corrida

Tabla fletes:

- `NO CONFIRMADA — EVIDENCIA FALTANTE`

## Propuesta conceptual de partida comercial

Una `Partida comercial` CheckApp sí debe poder referenciar:

- producto
- servicio
- activo `solo si PO lo autoriza`
- flete/cargo `solo si se define como concepto comercial`

## Clasificación

| Tipo | CheckApp | Decisión |
|---|---|---|
| Producto | `ProductosServicios` tipo producto | `REUTILIZAR/ADAPTAR` |
| Servicio | `ProductosServicios` tipo servicio | `REUTILIZAR/ADAPTAR` |
| Activo | `Activos` | `NO APLICA` por ahora o `ADAPTAR` con decisión PO |
| Flete | no catálogo comercial confirmado | `NUEVO` o concepto especial |

## Dictamen

CheckApp no debe limitar el comercial a artículos de almacén. La base correcta ya existe en `ProductosServicios`; ahí vive la mejor convergencia para producto + servicio. Activos y fletes requieren definición explícita.
