# /OrdenesCompra/Aprobaciones

## Proposito

Pantalla para listar ordenes pendientes o aprobadas y permitir aprobacion manual por supervisores configurados.

## Evidencia

- Vista: `Views/OrdenesCompra/Aprobaciones.cshtml`
- Script: `Scripts/OrdenesCompra/aprobaciones.js`
- Endpoints:
  - `getOrdenesCompraAprobaciones`
  - `aprobarOrdenesDeCompra`

## Filtros visibles

- Razon social
- Proveedor
- Rango de fechas
- Tipo de fecha:
  - captura
  - llegada
  - vencimiento
- Switch:
  - sin aprobar
  - aprobados

## Columnas reales

- checkbox
- folio
- fecha
- razon social
- proveedor
- almacen
- fecha minima
- fecha maxima
- tipo
- cadena
- idDepartamento

## Como se decide quien aprueba

No hay motor por importe.

La regla real depende de:

- `idDepartamento`
- configuracion en `OrdendeCompraSupervisores`
- columnas `Supervisor1` a `Supervisor5`
- email del usuario actual

## Niveles y secuencia

- Soporta hasta 5 supervisores
- La aprobacion es secuencial por columnas `Firma1..Firma5`
- Para quedar aprobada, la OC exige todas las firmas configuradas
- No se observo aprobacion paralela con criterio "basta uno"

## Que guarda la aprobacion

- `OrdendeCompraAprobaciones.Firma1..Firma5`
- `fechaAprovacion1..fechaAprovacion5`
- `Estatus`
- `usuario`
- `Folio`

## Cambio de estado al aprobar

Cuando todas las firmas requeridas valen `1`:

- `OrdendeCompraAprobaciones.Estatus = 1`
- `OrdendeCompraPT.Estatus = 6`
- `ValueVehicOTPartes.EstatusSurtidos = 6` para piezas ligadas

## Lo que no se encontro

- rechazo en esta pantalla
- motivo de rechazo
- comentarios de aprobacion
- sustituto
- escalamiento
- limites por monto
- reglas por empresa/importe jerarquico

## Conclusiones

- La pantalla es importante, pero su motor es simple.
- El workflow real es "lista fija de supervisores por departamento".
- La aprobacion no crea inventario.
- La aprobacion si desbloquea el paso hacia recepcion.
