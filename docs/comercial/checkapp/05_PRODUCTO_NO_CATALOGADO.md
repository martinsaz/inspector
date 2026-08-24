# Producto No Catalogado

## Hallazgo clave

La estructura actual de `CotizacionesPartidas` exige producto catalogado.

Evidencia:

- `CotizacionPartidaGuardarRequest.IdProductoServicio` es `Guid` obligatorio.
- El guardado rechaza partidas con `IdProductoServicio == Guid.Empty`.
- El DDL embebido define `idProductoServicio UNIQUEIDENTIFIER NOT NULL`.
- La insercion de partidas toma datos desde `ObtenerProductoAsync`, no desde captura libre.

## Respuesta a las preguntas obligatorias

### Puede `idProductoServicio` volverse nullable sin romper arquitectura

`NO` de forma trivial.

Hoy romperia:

- validacion de DTO;
- carga de snapshot desde `ProductosServicios`;
- guardado SQL actual;
- lectura tipada de detalle;
- suposicion de unidad de medida obligatoria;
- flujo de edicion y clonacion basado en producto existente.

### Los snapshots actuales servirian para conservar el concepto

`SI`, conceptualmente.

Los campos `Codigo`, `Nombre`, `Descripcion`, `UnidadMedida` y `PrecioUnitario` ya son suficientes para representar un concepto pendiente, pero hoy siempre nacen de un catalogo existente.

### El PDF funcionaria sin producto catalogado

`SI`, si la partida ya llega con snapshot completo.

El render PDF consume texto y totales de la partida, no necesita consultar de nuevo el catalogo al momento de imprimir.

### La autorizacion puede permitirse con concepto pendiente

Tecnicamente podria, pero funcionalmente queda como `DECISION PO`.

## Estrategia conceptual recomendada

Modelo: `Concepto pendiente de catalogo`

- Se puede cotizar.
- Se puede imprimir.
- Se puede autorizar solo si PO lo permite.
- No se puede convertir a `Pedido` hasta vincular o dar de alta el concepto en `ProductosServicios`.

## Dictamen

Viabilidad actual: `PARCIAL`.

La arquitectura destino puede adaptarse, pero requiere cambio deliberado de contrato y de reglas; no es un switch menor de nullable.
