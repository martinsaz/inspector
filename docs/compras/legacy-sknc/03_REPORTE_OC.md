# /OrdenesCompra/ReporteOC

## Proposito

`/OrdenesCompra/ReporteOC` es la pantalla de consulta y operacion sobre OCs ya creadas.

No es solo consulta. Desde aqui se ejecutan acciones operativas y de mantenimiento.

## Evidencia

- Vista: `Views/OrdenesCompra/ReporteOC.cshtml`
- Script: `Scripts/OrdenesCompra/reporteOC.js`
- Endpoints principales:
  - `GetOrdenes`
  - `GetOrdenesDesglosado`
  - `GetDetalle`
  - `GuardaEdit`
  - `EditaFechas`
  - `EditarProductoOrdenCompra`
  - `CancelaOrden`
  - `CancelaDetalleOrden`
  - `duplicarOrdenDeCompra`
  - `modificarProveedorOrdenDeCompra`
  - `modificarUnidadOrdenDeCompra`
  - `generarOrdenCompraPDF`
  - `enviarCorreoCO`

## Modos de reporte

- Orden de Compra
- Orden de Compra Desglosado

## Filtros

- Estatus
- Tipo de reporte
- Tipo de fecha:
  - captura
  - llegada
  - vencimiento
- Tipo de OC
- Rango de fechas
- Proveedor
- Razon social
- Departamento
- Unidad de transporte
- Almacen
- Producto en modo desglosado

## Estatus visibles

- `0` Nuevo
- `1` Surtido
- `2` Cancelado
- `3` Parcial
- `4` Terminado
- `5` Todos en filtro

Adicionalmente, por codigo de modelo, tambien existe:

- `6` Aprobado

Y en recepcion aparece:

- `5` como sobrerecibido, aunque no se rotula consistentemente en todas las vistas.

## Acciones reales observadas

- enviar correo
- ver detalle
- exportar PDF
- duplicar
- cancelar OC
- modificar fechas
- modificar proveedor
- modificar unidad
- terminar OC parcial
- editar detalle
- ver historial de cambios
- cancelar detalle

## Detalle consultable

El detalle muestra:

- folio
- estatus
- validacion
- fechas minima y maxima
- caja
- codigo
- SKU
- variante
- cantidad
- costo
- importe
- observaciones
- almacen
- proveedor

## Diferencia real vs Index

- `Index` crea
- `ReporteOC` opera sobre OCs persistidas
- `ReporteOC` si permite mantenimiento posterior y trazabilidad de cambios

## Documento y correo

- El PDF se genera desde `generarOrdenCompraPDF`
- El correo no manda PDF: manda un archivo tabular generado desde `pivoterecepcionkitscompleto`
- El adjunto observado es un archivo tipo hoja de calculo/CSV con detalle de la OC

## Riesgos/hallazgos

- El reporte mezcla operacion y consulta.
- La edicion de detalle puede ocurrir despues de creada la OC.
- La UI expone multiples acciones, pero no se vio validacion server-side uniforme por permiso.
- La semantica de estatus no es totalmente consistente entre modelo, reporte y recepcion.
