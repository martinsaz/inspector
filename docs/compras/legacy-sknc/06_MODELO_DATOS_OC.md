# Modelo de Datos OC

## Tablas principales confirmadas

| Tabla | Proposito |
| --- | --- |
| `OrdendeCompraPT` | Partidas de la OC y pseudo encabezado repetido por folio |
| `OrdendeCompraAprobaciones` | Workflow de aprobacion por OC/folio |
| `OrdenCompraPTCambios` | Historial de cambios de cantidad/costo |
| `fcproveedores` | Catalogo de proveedores |
| `fcproductos` | Catalogo de productos |
| `fcvariantes` | Variantes de producto |
| `fcSkus` | SKU opcional por producto/variante |
| `fcalmacen` | Almacen |
| `RazonesSociales` | Razon social |
| `fcdepartamentos` | Departamento |
| `fcempleados` | Usuario, cadena y departamento |
| `fcexistenprod` | Existencias y columna `Pedido` |
| `Compras` | Cabecera de recepcion/compra proveedor |
| `ComprasDet` | Detalle de recepcion |
| `fcComprasPT` | Persistencia adicional de compra |
| `fcComprasPTDet` | Persistencia adicional de detalle recepcionado |
| `fcProductosSeriales` | Seriales recibidos |
| `fcProductosSerialesCardex` | Kardex de seriales |
| `OrdendeCompraSupervisores` | Config de aprobacion y permisos operativos |
| `ValueVehicOTPartes` | Relacion de OC con ordenes de trabajo/backorders |
| `OrdenDeCompraVehiculos` | Relacion OC con vehiculos |
| `TempOrdenDeCompraKits` | Temporal de OCs por kits |
| `tmpOrdenPT` | Temporal de captura previa al guardado final |

## Cabecera real de OC

No existe cabecera unica separada confirmada.

La "cabecera" se distribuye en filas de `OrdendeCompraPT` por folio:

- `Folio`
- `idProveedor`
- `FechaMinima`
- `FechaMaxima`
- `Tipo`
- `idAlmacen`
- `Validacion`
- `idRazon`
- `idDepartamento`
- `idVehiculo`
- `ObservacionGeneral`
- `Consignar`
- `idGlobalOC`

## Detalle real de OC

Tambien en `OrdendeCompraPT`:

- `idOrdenCompra`
- `idProducto`
- `idVariante`
- `Cantidad`
- `Costo`
- `Surtidos`
- `Observaciones`
- `idKit`
- `Caja`

## Tabla de folio

No existe tabla de folios dedicada observada.

El folio se calcula con:

- `SELECT MAX(ISNULL(CAST(Folio AS NUMERIC(20,0)),0)) + 1 FROM OrdendeCompraPT`

## Campos clave de aprobacion

- `OrdendeCompraAprobaciones.Firma1..Firma5`
- `OrdendeCompraAprobaciones.fechaAprovacion1..fechaAprovacion5`
- `OrdendeCompraAprobaciones.Estatus`
- `OrdendeCompraAprobaciones.usuario`

## Campos clave de recepcion

- `OrdendeCompraPT.Surtidos`
- `Compras.FolioOrdenDeCompra`
- `ComprasDet.FolioOrdenCompra`
- `fcexistenprod.Pedido`

## Hallazgo de diseño

Legacy modela la OC con fuerte duplicacion de cabecera en cada renglon. Para CheckApp conviene reutilizar reglas y no la forma fisica del modelo.
