# Ciclo de Estados OC

## Matriz de estados reales

| Estado | Codigo | Significado operativo | Fuente |
| --- | --- | --- | --- |
| Pendiente de aprobacion | `0` | OC creada pero aun no aprobada | `GuardaPedido`, `guardarOrdenDeCompraKits` |
| Surtido / recibida total | `1` | Todo lo pedido ya fue recepcionado | `RecepcionGController.Guardar` |
| Cancelado | `2` | OC o detalle cancelado | `CancelaOrden` |
| Parcial | `3` | Recepcion parcial | `RecepcionGController.Guardar` |
| Terminado | `4` | Cierre manual visible en reporte | `ReporteOC` |
| Sobre recibido | `5` | `Surtidos > Cantidad` | `RecepcionGController.Guardar` |
| Aprobado | `6` | Lista para recepcion sin estar recibida | `aprobarOrdenesDeCompra` o nacimiento directo |

## Flujo principal

1. Crear OC
2. Si el departamento exige aprobacion:
   - nace `0`
3. Si no exige aprobacion:
   - nace `6`
4. Al completar firmas:
   - pasa a `6`
5. En recepcion:
   - pasa a `1` si queda completa
   - pasa a `3` si queda parcial
   - pasa a `5` si se recibe de mas
6. Cancelacion:
   - pasa a `2`
7. Reporte permite un cierre manual a `4` sobre ciertos casos parciales

## Estado de aprobacion separado

`OrdendeCompraAprobaciones.Estatus`

- `0`: sin aprobar
- `1`: aprobada

## Hallazgos

- El significado visual cambia segun pantalla.
- `6` no aparece en todos los `CASE` viejos de detalle, pero si es un estado activo del negocio.
- La recepcion usa `Estatus IN (6,3)` como lista de OCs recepcionables.
- El backlog conceptual correcto para CheckApp debe separar:
  - estado de aprobacion
  - estado logistico/recepcion
  - estado de cierre
