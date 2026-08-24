# Fecha Instalacion Servicios

## Problema funcional

Una cotizacion puede mezclar:

- productos sin instalacion;
- servicio A;
- servicio B;

y cada servicio puede requerir fecha distinta.

## Ubicaciones evaluadas

### Encabezado de cotizacion

Ventaja:

- facil de consultar.

Riesgo:

- una sola fecha global no modela multiples servicios.

### Partida de servicio

Ventaja:

- respeta granularidad real.

Riesgo:

- obliga a distinguir productos vs servicios en captura y PDF.

### Modelo mixto

- fecha global opcional como referencia comercial;
- fecha por partida de servicio como dato operativo real.

## Recomendacion

`MODELO MIXTO`

- `FechaInstalacionGlobal` opcional a nivel cotizacion para promesa general.
- `FechaInstalacion` a nivel partida servicio para programacion real.
- `ObservacionesInstalador` a nivel partida servicio.

## Casos de uso

- Cotizacion solo con productos: sin fechas por partida.
- Cotizacion con un servicio: puede usar fecha global y replicarse a servicio.
- Cotizacion con multiples servicios: cada servicio conserva su fecha real.

## Dictamen

Nivel recomendado:

- `Fecha instalacion`: `POR SERVICIO`, con opcional global de referencia.
- `Observaciones instalador`: `POR SERVICIO`.
