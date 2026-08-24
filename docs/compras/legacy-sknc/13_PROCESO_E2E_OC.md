# Proceso E2E OC

## Flujo real

Usuario
-> `/OrdenesCompra/Index`
-> captura razon social, proveedor, almacen, departamento, fechas y partidas
-> `GuardaPedido`
-> `OrdendeCompraPT` + `OrdendeCompraAprobaciones`
-> folio numerico
-> estado `0` o `6`
-> si hay aprobacion:
-> `/OrdenesCompra/Aprobaciones`
-> `aprobarOrdenesDeCompra`
-> estado `6`
-> `/OrdenesCompra/ReporteOC`
-> consulta / mantenimiento / PDF / correo
-> `RecepcionGController`
-> `Guardar`
-> `Compras` + `ComprasDet` + `fcComprasPT*`
-> actualiza `Surtidos`
-> actualiza `fcexistenprod`
-> estado `1` o `3` o `5`

## Responsables por paso

| Paso | Pantalla | Endpoint | Tabla | Responsable |
| --- | --- | --- | --- | --- |
| Captura | `Index` | `GuardaPedido` | `OrdendeCompraPT` | creador |
| Aprobacion | `Aprobaciones` | `aprobarOrdenesDeCompra` | `OrdendeCompraAprobaciones` | supervisor configurado |
| Consulta operativa | `ReporteOC` | `GetOrdenes`, `GetDetalle` | `OrdendeCompraPT` | comprador/operador |
| Recepcion | modulo recepcion | `RecepcionGController.Guardar` | `Compras`, `ComprasDet`, `fcexistenprod` | receptor |

## Paso posterior a aprobacion

No genera inventario por si sola.

El paso posterior real es:

- recepcion de compra
- o permanencia en espera de recepcion

## Cierre

No se encontro un cierre formal nuevo con documento separado. El cierre operativo real se expresa por:

- recepcion total `1`
- parcial `3`
- terminado manual `4`
- cancelado `2`
