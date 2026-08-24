# Modelo Datos OC Actual

Fecha: 2026-08-19

## Tablas confirmadas

### `dbo.OrdenesCompraFolios`

Campos principales:

- `id`
- `idEmpresa`
- `identityKey`
- `UltimoConsecutivo`
- `FechaCreacion`
- `FechaActualizacion`

Funcion:

- llevar consecutivo seguro por empresa para construir folio `OC-000001`.

Hallazgo:

- mejora clara contra la estrategia legacy de `MAX + 1`.

### `dbo.OrdenesCompra`

Campos principales confirmados:

- `id`
- `idEmpresa`
- `identityKey`
- `Folio`
- `idRazonSocial`
- `idSucursal`
- `idProveedor`
- `FechaOrden`
- `FechaLlegada`
- `Estado`
- `Subtotal`
- `Total`
- `Observaciones`
- `MotivoCancelacion`
- `FechaCancelacion`
- `Activo`
- `FechaCreacion`
- `FechaActualizacion`
- `FechaArchivado`
- `idUsuarioCreacion`
- `idUsuarioActualizacion`
- `idUsuarioCancelacion`

Restricciones confirmadas:

- estados permitidos `1,2,3`;
- importes no negativos;
- `Subtotal = Total`;
- `Total > 0` al estar `Generada`;
- `FechaLlegada >= FechaOrden`;
- cancelacion exige motivo y fecha;
- archivado consistente con `Activo`.

Lectura funcional:

- hoy no existen impuestos, descuentos, almacen, aprobacion ni recepcion dentro del modelo de cabecera.

### `dbo.OrdenesCompraDetalle`

Campos principales confirmados:

- `id`
- `idEmpresa`
- `identityKey`
- `idOrdenCompra`
- `NumeroPartida`
- `idProductoServicio`
- `TipoProductoServicio`
- `Codigo`
- `Nombre`
- `Descripcion`
- `idUnidadMedida`
- `UnidadMedida`
- `UnidadAbreviatura`
- `Cantidad`
- `CostoUnitario`
- `Subtotal`
- `Total`
- `Activo`
- `FechaCreacion`
- `FechaActualizacion`
- `FechaArchivado`

Restricciones confirmadas:

- `NumeroPartida > 0`;
- `TipoProductoServicio IN (1,2)`;
- `Cantidad > 0`;
- importes no negativos;
- `Subtotal = ROUND(Cantidad * CostoUnitario, 2)`;
- `Total = Subtotal`.

Lectura funcional:

- el detalle guarda snapshot suficiente del catalogo al momento de captura;
- no depende solo de joins vivos para nombre, codigo o unidad.

## Indices y claves

### `OrdenesCompra`

- `UX_OrdenesCompra_Empresa_Id`
- `UX_OrdenesCompra_Empresa_Folio`
- `IX_OrdenesCompra_Empresa_Estado_FechaOrden`
- `IX_OrdenesCompra_Empresa_Proveedor`
- `IX_OrdenesCompra_Empresa_Sucursal`
- `IX_OrdenesCompra_Empresa_RazonSocial`

### `OrdenesCompraDetalle`

- `UX_OrdenesCompraDetalle_Empresa_Id`
- `IX_OrdenesCompraDetalle_Empresa_Orden`
- `UX_OrdenesCompraDetalle_Empresa_Orden_NumeroPartida`
- `UX_OrdenesCompraDetalle_Empresa_Orden_ProductoServicio_Activo`
- FK `(idEmpresa, idOrdenCompra) -> dbo.OrdenesCompra`

## Estado y ciclo de vida

- `Borrador`:
  - editable;
  - con partidas activas;
  - puede generarse o cancelarse.
- `Generada`:
  - ya no editable;
  - sigue siendo solo documental;
  - puede cancelarse.
- `Cancelada`:
  - conserva motivo y fecha;
  - no hay reactivacion localizada.

## Integraciones confirmadas

### Catalogos de cabecera

- `RazonesSociales`
- `Sucursales`
- `ActivosProveedores`

### Catalogo de partidas

- `ProductosServicios`
- `ProductosServiciosUnidadesMedida`

## Integraciones no localizadas

- tabla de recepcion;
- tabla de recepcion detalle;
- tabla de pendientes por recibir;
- tabla de seriales recibidos;
- relacion directa a `ProductosServiciosExistencias`;
- insercion a `ProductosServiciosMovimientosInventario`;
- recalculo de `CostoPromedio`.

## Folios

Regla confirmada:

- el API reserva el siguiente consecutivo en transaccion serializable;
- el folio queda como `OC-` + consecutivo con padding de 6.

Conclusión:

- el modelo actual de datos de OC es correcto para captura documental;
- no es todavia un modelo completo de abastecimiento, recepcion e inventario.
