# 09 INVENTARIO EXISTEN NEGATIVOS

Fecha: 2026-08-17

## Tabla principal

- `dbo.existen`

Uso confirmado:

- consulta de existencias por talla
- consulta de existencias por tienda
- descuento por venta vía `act_exis25`
- reintegro por devolución vía `act_exis25`

## Estructura inferida por uso

Columnas confirmadas:

- `barcode`
- `talla`
- `tienda`
- `cantidad`

PK/FK reales:

- `NO CONFIRMADA — EVIDENCIA FALTANTE`

## Reglas confirmadas

1. `¿se puede vender con existencia 0?`
Sí; la UI alerta, pero el cobro no quedó bloqueado por esa condición en la auditoría base.

2. `¿se puede vender en negativo?`
Sí, operativamente parece posible.

3. `¿qué condición lo permite?`
No se localizó un tope duro server-side previo al `act_exis25`.

4. `¿es por producto?`
Sí, por `barcode + talla`.

5. `¿es por sucursal?`
Sí, por `tienda`.

6. `¿hay límite negativo?`
`NO CONFIRMADO`.

7. `¿pedido reserva existencia?`
No confirmado; pedido cliente no descuenta existencias.

8. `¿cotización consulta existencia pero no bloquea?`
Sí.

9. `¿venta descuenta?`
Sí.

10. `¿devolución reintegra?`
Sí.

11. `¿servicios participan?`
No confirmado en Legacy POS clásico.

12. `¿fletes participan?`
No confirmados como renglón inventariable.

13. `¿activos participan?`
No confirmados en Legacy POS clásico.

## Evidencia clave

- `GET /ventas/barcode/{barcode}/tallas`
- `GET /ventas/barcode/{barcode}/existencias-tiendas`
- `POST /ventas/cobrar`
- `POST /ventas/devoluciones/crear`

## CheckApp actual

Existe inventario administrativo en:

- `dbo.ProductosServiciosExistencias`
- `dbo.ProductosServiciosMovimientosInventario`

Reglas confirmadas CheckApp:

- un producto puede ser inventariable o no
- un producto puede `PermiteVentaSinExistencia`
- si `existenciaPosterior < 0` y no lo permite, se bloquea el movimiento

## Dictamen

Legacy y CheckApp ya divergen aquí:

- Legacy usa `dbo.existen` y tolera sobreventa operativa
- CheckApp `ProductosServicios` ya contempla una regla moderna de `PermiteVentaSinExistencia`

La adaptación correcta no es copiar `existen`; es mapear la política comercial a un inventario más explícito.
