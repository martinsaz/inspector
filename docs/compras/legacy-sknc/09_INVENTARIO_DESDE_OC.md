# Inventario desde OC

## Momento exacto del impacto

### Al crear OC

No entra inventario fisico.

Solo sube la demanda esperada:

- `fcexistenprod.Pedido += Cantidad`

### Al aprobar OC

No se observan updates de existencia fisica.

### Al recepcionar

Si entra inventario fisico:

- suma cantidad a la columna de seccion elegida en `fcexistenprod`
- resta `Pedido`
- registra compra y detalle
- registra seriales cuando aplica

## Tabla de existencias

- `fcexistenprod`

## Tabla de movimientos ligados

- `fcComprasPT`
- `fcComprasPTDet`
- `Compras`
- `ComprasDet`
- `fcProductosSerialesCardex`

## Formula de actualizacion observada

`seccion = seccion + cantidad_recibida`

`Pedido = max(Pedido - cantidad_recibida, 0)`

## Campos inventariables relevantes

- `idEmpresa`
- `idProducto`
- `idVariante`
- `idAlmacen`
- `Pedido`
- seccion destino elegida en recepcion

## Conclusion

Legacy usa la OC como compromiso de compra y la recepcion como evento que realmente materializa inventario.
