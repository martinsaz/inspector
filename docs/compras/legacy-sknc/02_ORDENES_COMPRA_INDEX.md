# /OrdenesCompra/Index

## Proposito real

`/OrdenesCompra/Index` es la pantalla de captura de ordenes de compra legacy, no un listado.

Desde aqui nacen:

- pedido manual
- surtir pedidos cliente
- surtir pedidos mayoreo
- lectura por archivo
- orden ligada a orden de trabajo

Adicionalmente el modulo tiene variante separada para kits.

## Evidencia principal

- Vista: `Views/OrdenesCompra/Index.cshtml`
- Script: `Scripts/OrdenesCompra/ordenesCompra.js`
- Guardado: `OrdenesCompraController.GuardaPedido(...)`

## Datos de encabezado observados

- Tipo de pedido
- Razon social
- Fecha llegada
- Fecha cancela
- Proveedor
- Almacen
- Requiere validacion
- Consignar
- Departamento
- Unidad de transporte
- Observacion general

## Captura de partidas

Por partida el flujo permite:

- producto
- variante
- cantidad
- observaciones
- costo base consultado
- nuevo costo opcional si el ajuste departamental lo permite

Tambien puede cargar partidas desde:

- pedidos cliente
- pedidos mayoreo
- lectura por archivo
- productos ligados a orden de trabajo

## Reglas funcionales confirmadas

- Proveedor es obligatorio para guardar.
- Almacen es obligatorio para guardar.
- Razon social es obligatoria.
- Departamento es obligatorio.
- Fecha llegada y fecha cancela son obligatorias.
- El costo puede editarse solo si `getAjustesOrdenesCompraByEmpleado()` devuelve `cambiarCostoOrdenDeCompra = true`.
- El folio temporal usado durante captura es un `GUID` retornado por `GetFolio()`.
- El folio numerico final no se decide en cliente.

## Que no aparece en este flujo

No se confirmo soporte real para:

- moneda
- descuento por partida
- descuento global
- impuestos multiples capturados manualmente
- IEPS
- retenciones
- flete capturado en OC
- adjuntos de OC
- conceptos libres fuera de catalogo

## Productos y catalogo

- Los productos salen de `fcproductos`
- Las variantes salen de `fcvariantes`
- El costo visible se consulta por producto/variante
- La pantalla opera sobre catalogo existente
- No se encontro flujo de servicio libre ni descripcion libre de producto

## Guardado real

El guardado hace:

1. Lee configuracion de aprobacion en `OrdendeCompraSupervisores` por `idDepartamento`
2. Define estatus inicial:
   - `0` si requiere aprobacion
   - `6` si nace aprobada
3. Toma partidas temporales de `tmpOrdenPT`
4. Inserta bulk en `OrdendeCompraPT`
5. Inserta bulk en `OrdendeCompraAprobaciones`
6. Asigna folio con `MAX(Folio)+1`
7. Incrementa `fcexistenprod.Pedido`
8. Si hay ligas operativas, actualiza `ValueVehicOTPartes`

## Respuestas concretas de la fase de creacion

1. Quien puede crear OC: quien tenga acceso frontend `m011110END`.
2. Estado inicial: `6` aprobada o `0` pendiente de aprobacion, segun ajuste departamental.
3. El folio se genera despues de insertar.
4. No se encontro borrador persistente.
5. Si puede editarse despues de guardar en ciertos casos.
6. La edicion visible fuerte se limita sobre todo a estatus `0`.
7. Proveedor obligatorio: si.
8. Sucursal obligatoria: no se usa sucursal como tal; la pieza operativa es razon social + almacen.
9. Producto debe existir en catalogo: si, por `fcproductos`.
10. Conceptos libres: no confirmados.
11. Servicios: no confirmados.
12. Flete: no en OC; aparece en recepcion/compra.
13. Impuestos multiples: no confirmados.
14. Descuentos: no confirmados en OC.
15. Moneda: no confirmada.
16. Costo distinto al catalogo: si, condicionado por ajuste.
17. Multiples entregas: si, via recepcion parcial.
18. Fecha compromiso: si, `FechaMinima` y `FechaMaxima`.
19. Observaciones: si, por partida y generales.
20. Archivos adjuntos: no confirmados para OC.
