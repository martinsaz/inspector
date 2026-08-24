# Cotizaciones Estado Actual

## Base actual confirmada

- `Cotizaciones` es vertical funcional real en CheckApp.
- Existe listado, detalle, guardado, cancelacion, autorizacion, PDF y correo.
- Las partidas guardan snapshot de:
  - `Codigo`
  - `Nombre`
  - `Descripcion`
  - `UnidadMedida`
  - `PrecioUnitario`
  - `ExistenciaActual`

## Estructura relevante

### Encabezado

- `CotizacionGuardarRequest`
- `IdCliente`
- `IdSucursal`
- `Observaciones`
- `VigenciaDias`
- `Caja`

### Partida

- `CotizacionPartidaGuardarRequest.IdProductoServicio`
- `Cantidad`
- `PrecioUnitario`
- `DescuentoPct`

### Tabla de partidas

En el DDL embebido del controller:

- `idProductoServicio UNIQUEIDENTIFIER NOT NULL`
- `idUnidadMedida UNIQUEIDENTIFIER NOT NULL`
- `Descripcion NVARCHAR(1000) NOT NULL`

## Estado del modulo frente al alcance comercial

- Producto + servicio juntos: `SI`
- Existencia informativa: `SI`
- Flete: `NO`
- Fecha instalacion: `NO`
- Observaciones instalador: `NO`
- Operador por servicio: `NO`
- Pedido origen / destino: `NO`

## Lectura PO

La cotizacion actual es la mejor base destino para el comercial. No debe volver a clasificarse como placeholder, pero tampoco debe forzarse a resolver sola pedido, promesa, recepcion o venta.
