# OC Recepcion Existencias

## Evidencia localizada

### Modulo MVC

- Ruta: `checklist/Controllers/Activos/OrdenesCompraController.cs`
- UI: `Views/Activos/OrdenesCompra/Index.cshtml`
- UI: `Views/Activos/OrdenesCompra/Nueva.cshtml`
- JS: `wwwroot/js/Activos/OrdenesCompra/OrdenesCompra.js`

### API

- `checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`
- `checklistWs/Models/OrdenesCompra/OrdenesCompraModels.cs`

### Tablas confirmadas

- `dbo.OrdenesCompra`
- `dbo.OrdenesCompraDetalle`
- `dbo.OrdenesCompraFolios`

## Estados confirmados OC

- `1 = Borrador`
- `2 = Generada`
- `3 = Cancelada`

## Flujo real actual

`Orden de compra -> guardado / generacion / cancelacion / exportacion`

No se localizo:

- tabla de recepcion;
- detalle de recepcion;
- endpoint de recepcion;
- estado de recepcion;
- captura de cantidad recibida;
- recepcion parcial;
- actualizacion de `ProductosServiciosExistencias`;
- insercion automatica en `ProductosServiciosMovimientosInventario`.

## Trazabilidad OC -> inventario

Resultado actual:

- `OC -> Recepcion`: `NO LOCALIZADA`
- `OC -> ProductosServiciosMovimientosInventario`: `NO LOCALIZADA`
- `OC -> ProductosServiciosExistencias`: `NO LOCALIZADA`

## Reglas tecnicas observadas

- `GuardarBorradorOrdenCompra` usa transaccion SQL serializable.
- `GenerarOrdenCompra` solo cambia estado y recalcula importes.
- `CancelarOrdenCompra` cancela documentalmente.
- `ValidarPendientesOrdenCompra` solo revisa traslape documental, no recepcion.

## Sucursal e inventario

- La OC tiene `idSucursal` en encabezado.
- El inventario confirmado sigue siendo por empresa + producto.
- No se encontro inventario fisico por sucursal amarrado a recepcion.

## Idempotencia y rollback

- Hay transaccion y rollback en guardado, generacion y cancelacion.
- No existe idempotencia de recepcion porque recepcion no existe en el flujo auditado.

## Recomendacion arquitectonica de inventario

La mejor recomendacion sustentada por la infraestructura actual es `C: inventario fisico por empresa + compromiso comercial por sucursal`.

Motivos:

- el inventario fisico real hoy ya vive por empresa;
- la OC ya conoce sucursal pero no mueve existencias;
- cotizacion y futura venta necesitan promesa local;
- surtimiento parcial necesita reservar y liberar sin duplicar fisico.

## Impacto del modelo recomendado

- Cotizacion: consulta existencia fisica global y disponible comercial local.
- Pedido: crea compromiso por sucursal.
- Recepcion: incrementa fisico; luego puede alimentar disponibilidad.
- Venta: descuenta fisico y reduce compromiso.
- Surtimiento parcial: mantiene pendiente restante en compromiso.
- Devolucion: reintegra fisico y evalua si relibera o no compromiso.
- Negativos: siguen posibles solo bajo politica explicita.

## Dictamen

`OrdenesCompra` existe, pero la cadena `OC -> Recepcion -> Movimiento -> Existencia` no esta integrada en el destino actual. Esto es un `GAP REAL`, no una ausencia de evidencia menor.
