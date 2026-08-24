# Reglas de Aprobacion

## Fuente

- `OrdendeCompraSupervisores`
- `OrdenesCompraController.getAjustesOrdenesCompraByEmpleado`
- `OrdenesCompraController.aprobarOrdenesDeCompra`

## Configuracion por departamento

Cada departamento puede definir:

- `Supervisor1`
- `Supervisor2`
- `Supervisor3`
- `Supervisor4`
- `Supervisor5`
- `aprobarOrdenesCompra`
- `cambiarCostoOrdenDeCompra`
- `cambiarCostoRecepcion`
- `cambiarCantidadRecepcion`

## Matriz real

`Departamento -> Supervisores fijos -> Firmas requeridas -> Aprobacion final`

No se confirmo:

- regla por monto
- regla por proveedor
- regla por sucursal
- regla por importe minimo/maximo

## Comportamiento de nacimiento

- Si `aprobarOrdenesCompra = true`:
  - OC nace `Estatus 0`
  - aprobacion nace `Estatus 0`
  - `Firma1..Firma5 = 0`
- Si `aprobarOrdenesCompra = false`:
  - OC nace `Estatus 6`
  - aprobacion nace `Estatus 1`
  - `Firma1..Firma5 = 1`

## Regla de aprobacion secuencial

- El sistema localiza el email del usuario aprobador.
- Encuentra en que posicion de supervisor esta.
- Marca su firma y su fecha.
- Solo cuando todas las firmas configuradas estan en `1` cambia la OC a aprobada.

## Efecto final

- `OrdendeCompraPT.Estatus = 6`
- `OrdendeCompraAprobaciones.Estatus = 1`
- `ValueVehicOTPartes.EstatusSurtidos = 6` cuando aplica

## Huecos funcionales

- No hay rechazo real del mismo motor
- No hay comentario obligatorio
- No hay historial narrativo de decisiones
- No hay SLA o escalamiento
