# Mapa Endpoints y Tablas

| Pantalla/Proceso | Endpoint | Tablas principales |
| --- | --- | --- |
| Crear OC | `GuardaPedido` | `tmpOrdenPT`, `OrdendeCompraPT`, `OrdendeCompraAprobaciones`, `fcexistenprod` |
| Listado OC | `GetOrdenes` | `OrdendeCompraPT`, `OrdendeCompraAprobaciones`, `fcproveedores`, `fcalmacen`, `RazonesSociales`, `fcdepartamentos`, `ValueVehiculos` |
| Reporte desglosado | `GetOrdenesDesglosado` | `OrdendeCompraPT`, `fcproveedores`, `fcproductos`, `fcvariantes`, `fcalmacen`, `RazonesSociales` |
| Ver detalle | `GetDetalle` | `OrdendeCompraPT`, `fcproveedores`, `fcproductos`, `fcvariantes`, `fcSkus`, `Kits` |
| Editar detalle | `GuardaEdit`, `EditarProductoOrdenCompra` | `OrdendeCompraPT`, `OrdenCompraPTCambios` |
| Cancelar | `CancelaOrden`, `CancelaDetalleOrden` | `OrdendeCompraPT` |
| Duplicar | `duplicarOrdenDeCompra` | `OrdendeCompraPT`, `OrdendeCompraAprobaciones` |
| Cambiar proveedor/unidad | `modificarProveedorOrdenDeCompra`, `modificarUnidadOrdenDeCompra` | `OrdendeCompraPT` |
| PDF | `generarOrdenCompraPDF` | `OrdendeCompraPT`, catalogos relacionados |
| Correo | `enviarCorreoCO` | `crmconfigcorreo`, `fcproveedores`, pivote detalle OC |
| Aprobaciones listado | `getOrdenesCompraAprobaciones` | `OrdendeCompraAprobaciones`, `OrdendeCompraPT`, `RazonesSociales`, `fcalmacen`, `fcproveedores`, `Cadenas` |
| Aprobar | `aprobarOrdenesDeCompra` | `OrdendeCompraSupervisores`, `OrdendeCompraAprobaciones`, `OrdendeCompraPT`, `ValueVehicOTPartes` |
| Recepcion cargar detalle | `GetDatOC` | `OrdendeCompraPT`, `fcproductos`, `fcvariantes`, `fcunidadesmedida`, `UbicacionPT` |
| Recepcionar | `RecepcionGController.Guardar` | `Compras`, `ComprasDet`, `fcComprasPT`, `fcComprasPTDet`, `OrdendeCompraPT`, `fcexistenprod`, `fcProductosSeriales`, `fcProductosSerialesCardex`, `ValueVehicOTPartes` |
