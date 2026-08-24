# Recepcion de OC

## Existe proceso posterior

Si. El flujo posterior a la aprobacion vive en `RecepcionGController`.

## Entrada al proceso

Solo aparecen recepcionables OCs con:

- `OrdendeCompraPT.Estatus IN (6,3)`

Es decir:

- aprobadas
- parciales

## Pantalla / endpoints relevantes

- `RecepcionGController.Index`
- `llenaComboRazonesSocialesInOrdenesCompra`
- `llenaComboFoliosOrdenCompraRecepcion`
- `GetDatOC`
- `Guardar`
- `validarSeriales`

## Reglas de recepcion confirmadas

1. Si es la primera recepcion de esa OC/proveedor:
   - el folio de compra no debe existir antes para ese proveedor
2. Si la OC ya tuvo recepciones:
   - el nuevo movimiento debe reutilizar el mismo `Compras.Folio`
3. No permite recepcionar si todas las cantidades son `0`
4. Puede recibir parcialmente
5. Puede cambiar cantidad/costo si el ajuste departamental lo permite
6. Si el producto usa serial, existe validacion contra serial duplicado

## Escrituras principales

- `Compras`
- `ComprasDet`
- `fcComprasPT`
- `fcComprasPTDet`
- `fcProductosSeriales`
- `fcProductosSerialesCardex`
- `OrdendeCompraPT.Surtidos`
- `OrdendeCompraPT.Estatus`
- `fcexistenprod`
- `ValueVehicOTPartes`

## Calculo de estado al recibir

- `Cantidad == Surtidos` -> `1`
- `Surtidos < Cantidad` -> `3`
- `Surtidos > Cantidad` -> `5`

## Multiples recepciones

Si, porque la OC puede quedar en `3` y volver a entrar a recepcion.

## Parcialidad

Si, confirmada por codigo y filtros de recepcion.

## Sobrerecepcion

Si, existe el estado `5`.

## Inventario

No se afecta al aprobar.

Se afecta en recepcion al:

- restar `Pedido`
- sumar cantidad a una seccion de `fcexistenprod`

## Documento proveedor

El folio de recepcion/compra funciona como la identidad documental del proveedor y se controla de forma estricta entre recepciones de la misma OC.
