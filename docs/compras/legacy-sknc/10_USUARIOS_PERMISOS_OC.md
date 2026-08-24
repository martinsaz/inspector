# Usuarios y Permisos OC

## Controles de acceso observados en frontend

- `m011110END` -> `/OrdenesCompra/Index`
- `m011120END` -> `/OrdenesCompra/ReporteOC`
- `m011130END` -> `/OrdenesCompra/Aprobaciones`
- `m011140END` -> `Backorders`
- `m011150END` -> `OrdenDeCompraKits`
- `m046900C-END` -> ajustes de OC

Todos se validan con:

- `validarAccesoPantalla(...)`

## Usuario creador

El sistema registra principalmente:

- `myLogin.Email`
- `myLogin.Empresa`
- `idCadena` resuelto por `fcempleados`

## Usuario aprobador

Debe coincidir con uno de:

- `Supervisor1`
- `Supervisor2`
- `Supervisor3`
- `Supervisor4`
- `Supervisor5`

## Usuario receptor

Recepcion tambien usa:

- `myLogin.Correo` / `myLogin.Email`
- `fcempleados` para `idCadena`

## Riesgo

La mayor parte del control de permiso visible esta en JS. En los endpoints auditados no se confirmo un guard server-side equivalente por accion.

## Quien puede hacer que

- Crear: usuario con acceso a `Index`
- Aprobar: usuario cuyo email este configurado como supervisor
- Recibir: usuario con acceso al modulo de recepcion y contexto valido
- Editar costo/cantidad:
  - en OC segun `OrdendeCompraSupervisores.cambiarCostoOrdenDeCompra`
  - en recepcion segun `cambiarCostoRecepcion` y `cambiarCantidadRecepcion`
