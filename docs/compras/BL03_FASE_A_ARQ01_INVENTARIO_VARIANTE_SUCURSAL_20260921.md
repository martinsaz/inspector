# BL-03 FASE A ARQ-01 - Inventario, Variante y Sucursal

Fecha: 2026-09-21

Estado: CERRADO / PASS TECNICO

Alcance ejecutado: auditoria real de modelo fisico, codigo CheckApp y evidencia Legacy de solo lectura para resolver tecnicamente `REQUIERE_DECISION_PO_INVENTARIO_VARIANTE_SUCURSAL`.

Fuera de alcance preservado: no DDL, no migraciones, no UI, no implementacion funcional de OC/Recepcion, no OC-02, no REC-01, no modificaciones a Legacy.

## 1. Fuentes Auditadas

- SQL real, lectura de metadata y conteos: tablas, columnas, PK, FK, indices y conteos de objetos relevantes.
- CheckApp API/MVC actual:
  - `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql`
  - `inspectorapi/checklistWs/Scripts/ordenes-compra-up.sql`
  - `inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs`
  - `inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`
  - `inspectorapi/checklistWs/Models/OrdenesCompra/OrdenesCompraModels.cs`
- Documentos vigentes de OC-01 y SEC-01.
- Documentos Legacy de solo lectura:
  - `inspector/docs/compras/legacy-sknc/06_MODELO_DATOS_OC.md`
  - `inspector/docs/compras/legacy-sknc/08_RECEPCION_OC.md`
  - `inspector/docs/compras/legacy-sknc/11_REGLAS_NEGOCIO_OC.md`

## 2. Mapa Fisico Real

Formato solicitado: `OBJECT|TYPE|PK|FK|idEmpresa|RESPONSIBILITY|USE`.

```text
dbo.ProductosServicios|TABLE|id|FK compuesta a Categorias/Marcas/Unidades/Colecciones/Paquetes por idEmpresa+id|SI|Catalogo maestro producto/servicio|OC selecciona snapshot; inventario actual depende de CausaInventario; variante cuelga de producto.
dbo.ProductosServiciosExistencias|TABLE|id|FK idEmpresa+idProductoServicio -> ProductosServicios|SI|Saldo materializado actual por producto|ExistenciaActual, ExistenciaMinima, CostoPromedio; granularidad actual empresa+producto; no sucursal; no variante.
dbo.ProductosServiciosMovimientosInventario|TABLE|id|FK idEmpresa+idProductoServicio -> ProductosServicios|SI|Historial actual de movimientos de inventario|TipoMovimiento, Cantidad, ExistenciaAnterior, ExistenciaPosterior, CostoUnitario, Referencia; no sucursal; no variante; 0 filas reales auditadas.
dbo.ProductosServiciosOpcionesVariante|TABLE|id|FK idEmpresa+idProductoServicio -> ProductosServicios|SI|Definicion de opciones comerciales de variante|Permite opciones tipo atributo comercial; 1 fila real auditada.
dbo.ProductosServiciosOpcionesVarianteValores|TABLE|id|FK idEmpresa+idOpcionVariante -> OpcionesVariante|SI|Valores de opcion comercial|4 filas reales auditadas.
dbo.ProductosServiciosVariantes|TABLE|id|FK idEmpresa+idProductoServicio -> ProductosServicios|SI|SKU/combinacion de variante|Sku, Nombre, ClaveCombinacion, Costo/Precio opcional; 4 filas reales auditadas; no conecta a existencia actual.
dbo.ProductosServiciosVarianteValores|TABLE|id|FK a Variantes, Opciones, Valores y atributos por idEmpresa|SI|Composicion de cada variante|4 filas reales auditadas.
dbo.ProductosServiciosPresentacionesVenta|TABLE|id|FK idEmpresa+idProductoServicio -> ProductosServicios|SI|Presentaciones de venta|EquivalenciaBase, CantidadVenta, idUnidadVenta, Precio; 57 filas reales auditadas; no debe reutilizarse como compra sin decision PO.
dbo.ProductosServiciosUnidadesMedida|TABLE|id|N/A fisica auditada|SI|Unidad base y unidades convertibles|60 filas reales auditadas; base del calculo de cantidades normalizadas.
dbo.OrdenesCompra|TABLE|id|Sin FK fisica a Razones/Sucursales/Proveedor en script actual|SI|Encabezado OC actual|idSucursal existe en OC; no mueve inventario; estados actuales 1/2/3.
dbo.OrdenesCompraDetalle|TABLE|id|FK idEmpresa+idOrdenCompra -> OrdenesCompra|SI|Partidas OC actuales|idProductoServicio, snapshot codigo/nombre/unidad/cantidad/costo; no VarianteId; no PresentacionCompraId; no recibido acumulado.
dbo.OrdenesCompraFolios|TABLE|id|Sin FK fisica|SI|Consecutivo OC por empresa|Controla UltimoConsecutivo por idEmpresa.
dbo.Sucursales|TABLE|id|Sin FK fisica auditada|SI|Catalogo sucursal operativo|136 filas reales auditadas; OC referencia idSucursal; inventario actual no la usa.
dbo.RazonesSociales|TABLE|id|Sin FK fisica auditada|SI|Catalogo razon social|79 filas reales auditadas; OC referencia idRazonSocial.
dbo.Zonas|TABLE|id|Sin FK fisica auditada|SI|Agrupador geografico/operativo de sucursal|112 filas reales auditadas; no es almacen.
```

### Tablas no observadas en el scope real auditado

- No se observo tabla CheckApp actual de recepcion de OC.
- No se observo tabla CheckApp actual de series de producto dentro del scope ProductosServicios/OC.
- No se observo tabla CheckApp actual de almacen/ubicacion inventariable equivalente a Legacy `fcalmacen` o `fcexistenprod` por seccion.
- Legacy documenta `fcalmacen`, `fcexistenprod`, `fcProductosSeriales` y `fcProductosSerialesCardex`, pero esos objetos pertenecen a SKNC y permanecen solo como evidencia conceptual, no como modelo a modificar.

## 3. Inventario Actual

`ProductosServiciosExistencias` tiene una fila por `idEmpresa + idProductoServicio`, reforzada por el indice unico `UX_ProductosServiciosExistencias_Empresa_ProductoServicio`.

El codigo actual obtiene y bloquea existencia con:

```text
WHERE idEmpresa = @IdEmpresa AND idProductoServicio = @IdProductoServicio
```

Cuando se requiere lock, usa `WITH (UPDLOCK, HOLDLOCK)` sobre la fila de existencia. Esto protege el saldo actual por producto, pero no expresa sucursal ni variante.

`ProductosServiciosMovimientosInventario` registra movimiento por `idEmpresa + idProductoServicio + FechaMovimiento`, con existencia anterior/posterior. En la base auditada tenia 0 filas.

Dictamen: el nivel actual de existencia es `idEmpresa + ProductoServicioId`. No satisface el contrato OC-01 para variantes y sucursal.

## 4. Variante Actual

El modelo de variantes existe y es real:

- `ProductosServiciosOpcionesVariante`
- `ProductosServiciosOpcionesVarianteValores`
- `ProductosServiciosVariantes`
- `ProductosServiciosVarianteValores`

La variante tiene `idEmpresa`, `idProductoServicio`, `Sku`, `Nombre`, `ClaveCombinacion`, precios/costos opcionales y `Activo`.

Brecha: `ProductosServiciosExistencias`, `ProductosServiciosMovimientosInventario` y `OrdenesCompraDetalle` no tienen `idVariante`. Por tanto, stock de 5W-30 y 10W-40, talla/color u otra combinacion no puede mantenerse separado con el modelo actual.

Regla tecnica propuesta:

- Producto sin variante: `VarianteId = NULL`.
- Producto con variante: existencia y movimiento deben usar `VarianteId`.
- Stock de variantes distintas es independiente.
- Inactivar una variante con stock o historia no debe borrar ni fusionar saldos; debe bloquearse o quedar como inactiva seleccionable solo para historico, segun decision PO.

## 5. Sucursal vs Almacen

CheckApp actual tiene `Sucursales` como catalogo operativo real y OC ya guarda `idSucursal`.

No se encontro tabla actual de almacenes o ubicaciones inventariables en el scope CheckApp auditado. `Zonas` no es almacen: agrupa o clasifica sucursales; no tiene semantica de ubicacion de inventario.

Legacy si usa `fcalmacen` y `fcexistenprod`, pero esa evidencia no autoriza copiar fisicamente el modelo ni modificar Legacy.

Dictamen: ARQ-01 debe recomendar granularidad por sucursal, no por almacen, salvo que el PO agregue explicitamente un dominio `Almacen` posterior.

## 6. Granularidad Objetivo

Granularidad tecnica recomendada:

```text
idEmpresa + SucursalId + ProductoServicioId + VarianteId nullable
```

Cantidad en unidad base del producto/variante:

```text
CantidadBase = CantidadRecibidaEnPresentacion * FactorConversionSnapshot
```

Justificacion:

- `idEmpresa` conserva aislamiento multitenant.
- `SucursalId` existe en OC y es el destino operativo minimo real.
- `ProductoServicioId` es el maestro.
- `VarianteId nullable` permite producto sin variante y separa variantes reales.
- La existencia en unidad base evita que presentaciones de compra se conviertan en dimension permanente del stock.

## 7. Unidad Base y PresentacionCompra

OC-01 ya aprobo `PresentacionCompra` separada de `PresentacionVenta`.

La existencia no debe almacenarse por presentacion de compra. La presentacion es forma documental/logistica de compra; el stock debe quedar normalizado en unidad base.

Ejemplo:

- Compra: 10 cajas x 12 piezas.
- Recepcion 1: 5 cajas.
- Factor snapshot: 12 piezas por caja.
- Movimiento inventario: `+60` en unidad base.

La linea de recepcion debe conservar snapshot de presentacion y factor:

- `PresentacionCompraId` o snapshot textual si la presentacion se archiva.
- `CantidadPresentacionRecibida`.
- `FactorConversionSnapshot`.
- `CantidadBase`.

Esto preserva historico aunque cambie la presentacion futura.

## 8. Recepcion Parcial

Caso obligatorio:

```text
OC: 10 cajas x 12 = 120 base
Recepcion 1: 5 cajas = +60 base
Recepcion 2: 3 cajas = +36 base
Recepcion 3: 2 cajas = +24 base
Total recibido: 120 base
```

Invariante: la OC no mueve inventario por adelantado. Solo confirmar recepcion de producto inventariable genera movimiento.

Si el producto es servicio, no hay movimiento de inventario.

## 9. Series

CheckApp actual tiene `ProductosServicios.UsaNumeroSerie`, pero no se encontro tabla propia de series en ProductosServicios/OC actual.

Legacy confirma:

- `fcProductosSeriales`
- `fcProductosSerialesCardex`
- validacion de duplicado en recepcion

Contrato conceptual recomendado:

- Serie se registra en recepcion, no en OC.
- Serie se asocia a `idEmpresa + ProductoServicioId + VarianteId nullable + NumeroSerie`.
- La ubicacion vigente de la serie se deriva o referencia a `SucursalId`.
- No debe duplicarse una misma serie activa para el mismo producto/variante dentro de la empresa.
- La serie queda ligada al movimiento o partida de recepcion que la ingreso para trazabilidad.

La unicidad exacta queda como decision tecnica/PO antes de DDL, pero no debe ser solo por sucursal porque permitiria duplicar el mismo numero de serie activo en dos sucursales.

## 10. Alternativas

### Alternativa A - Extender existencia mutable actual

Descripcion: agregar en un futuro `idSucursal` y `idVariante nullable` a `ProductosServiciosExistencias` y `ProductosServiciosMovimientosInventario`, conservando las tablas actuales como base.

Pros:

- Menor cantidad de objetos nuevos.
- Aprovecha `UPDLOCK/HOLDLOCK` y DTOs actuales.
- Facil de explicar desde el modulo ProductosServicios.

Contras:

- Rompe el supuesto vigente de unicidad `idEmpresa + idProductoServicio`.
- Aumenta riesgo sobre T11-T24 ProductosServicios.
- Mezcla inventario operativo de recepcion con CRUD maestro de productos.
- Requiere migracion delicada de historicos a sucursal/variante `UNKNOWN`.
- Serie y recepcion seguirian sin contrato natural.

Impacto:

- Historia: media/alta.
- Migracion: alta.
- Variante: posible pero invasiva.
- Sucursal: posible pero invasiva.
- Series: requiere objetos nuevos igualmente.
- Multitenant: conservable con `idEmpresa`.
- Idempotencia: debe agregarse aparte.
- Performance: buena para saldo; trazabilidad limitada.
- Riesgo: medio/alto.

### Alternativa B - Ledger de inventario + saldo materializado separado

Descripcion: crear en un futuro scope `Inventario` separado, con movimientos como fuente trazable y existencia materializada por `idEmpresa + SucursalId + ProductoServicioId + VarianteId nullable`. Recepcion confirma movimientos idempotentes y actualiza saldo en la misma transaccion.

Pros:

- Separa maestro ProductosServicios de inventario operativo.
- Conserva performance de saldo materializado.
- Agrega trazabilidad fuerte por ledger.
- Encaja con recepciones parciales, series y futuras salidas/ajustes.
- Reduce impacto directo sobre el scope ProductosServicios actual.
- Permite versionamiento, bootstrap, adoption, migrations, locking, State/History/Attempts y drift por scope.

Contras:

- Requiere mas diseno de contrato y objetos futuros.
- Necesita idempotencia formal por recepcion/partida/intento.
- Requiere definicion PO/tecnica de historico inicial y `UNKNOWN`.

Impacto:

- Historia: controlada por adopcion/backfill.
- Migracion: media, pero aislada.
- Variante: natural.
- Sucursal: natural.
- Series: natural.
- Multitenant: fuerte con `idEmpresa` server-side.
- Idempotencia: natural con llave de operacion.
- Performance: buena por saldo materializado.
- Trazabilidad: alta.
- Riesgo: medio, acotado por scope.

### Alternativa C - Ledger puro, existencia derivada

Descripcion: no guardar saldo materializado; calcular existencia por suma de movimientos cada vez, filtrando por `idEmpresa + SucursalId + ProductoServicioId + VarianteId nullable`.

Pros:

- Auditoria matematica directa.
- No hay divergencia entre saldo y ledger.
- Menos riesgo de saldo desincronizado.

Contras:

- Performance potencialmente mala conforme crezcan movimientos.
- Bloqueos y concurrencia mas complejos para evitar sobreventa/sobresalida futura.
- Consultas de UI/reportes y conteos se vuelven costosas.
- Para recepcion parcial funciona, pero para operacion diaria escala peor.

Impacto:

- Historia: buena si se backfillea ledger.
- Migracion: media.
- Variante/Sucursal: natural.
- Series: requiere contrato aparte.
- Multitenant: fuerte.
- Idempotencia: natural por ledger.
- Performance: riesgo alto.
- Trazabilidad: alta.
- Riesgo: medio/alto por crecimiento.

### Alternativa D - Diferir granularidad y mantener empresa+producto

Descripcion: conservar `ProductosServiciosExistencias` como esta y mapear OC/Recepcion sin variante/sucursal efectiva.

Pros:

- Menor esfuerzo inmediato.
- Casi sin cambios de modelo.

Contras:

- Incumple OC-01 para variantes.
- No resuelve sucursal.
- Mezcla stock de variantes.
- No ofrece contrato serio para recepcion parcial por destino.
- Traslada deuda a OC-02/REC-01.

Dictamen: alternativa descartable tecnicamente; solo valida como no-decision temporal.

## 11. RECOMENDACION_ARQ01

`RECOMENDACION_ARQ01 = Alternativa B - Ledger de inventario + saldo materializado separado`.

Esta es una recomendacion tecnica, no aprobacion PO ni autorizacion de DDL.

Razon:

- El modelo real actual ya tiene ProductosServicios y variantes, pero la existencia esta reducida a empresa+producto.
- OC ya conoce sucursal, por lo que sucursal es el destino minimo real.
- Recepcion parcial y series necesitan trazabilidad por evento, no solo saldo mutable.
- El saldo materializado evita recalculos costosos y habilita consultas de disponibilidad.
- El ledger permite idempotencia, auditoria, reversas futuras y adopcion historica controlada.
- Separar `Inventario` reduce riesgo de romper el scope ProductosServicios certificado.

## 12. Contrato Conceptual

### Existencia

Responsabilidad: responder disponibilidad actual.

Clave conceptual:

```text
idEmpresa + SucursalId + ProductoServicioId + VarianteId nullable
```

Campos conceptuales:

- CantidadBaseActual.
- CantidadBaseReservada futura si PO la aprueba.
- CostoPromedio opcional por granularidad.
- FechaActualizacion.
- RowVersion o token equivalente si se aprueba concurrencia optimista.

### Movimiento

Responsabilidad: registrar cada cambio de inventario.

Clave de negocio conceptual:

```text
idEmpresa + OperationKey
```

Campos conceptuales:

- MovimientoId.
- idEmpresa.
- SucursalId.
- ProductoServicioId.
- VarianteId nullable.
- TipoMovimiento.
- CantidadBase.
- ExistenciaAnteriorBase.
- ExistenciaPosteriorBase.
- OrigenTipo: RECEPCION_OC, AJUSTE, SALIDA futura.
- OrigenId.
- OrigenPartidaId.
- IdempotencyKey/OperationKey.
- Usuario.
- FechaMovimiento.

### Serie

Responsabilidad: identificar unidades serializadas y su trazabilidad.

Clave conceptual recomendada:

```text
idEmpresa + ProductoServicioId + VarianteId nullable + NumeroSerie
```

Asociaciones:

- Movimiento de entrada.
- Recepcion/partida de origen.
- Sucursal vigente.
- Estado de serie: disponible, salida, cancelada/revertida futura.

## 13. Invariantes

- `idEmpresa` siempre se resuelve server-side y participa en todas las llaves.
- Producto sin variante usa `VarianteId = NULL`.
- Producto con variante no debe mezclar stock entre variantes.
- No se puede confirmar recepcion de cantidad negativa o cero.
- No se puede recibir por encima de pendiente mientras `sobre-recepcion = NO`.
- OC creada/generada no mueve inventario.
- Recepcion confirmada de producto inventariable si mueve inventario.
- Servicio no mueve inventario.
- Cantidad de inventario se guarda en unidad base.
- PresentacionCompra se guarda como snapshot de recepcion/partida, no como dimension permanente del saldo.
- Inactivar variante/producto con stock o historia no borra ni fusiona existencias.
- Serie requerida debe existir exactamente para cantidad recibida cuando el producto/variante use serie.
- Un mismo movimiento idempotente no puede aplicarse dos veces.

## 14. Idempotencia

Estrategia recomendada:

- Toda confirmacion de recepcion debe emitir una `OperationKey` deterministica por `idEmpresa + recepcion + partida + intento confirmado`.
- El ledger debe tener restriccion unica futura por `idEmpresa + OperationKey`.
- Reintento de la misma confirmacion devuelve el resultado ya aplicado, no inserta otro movimiento ni vuelve a sumar saldo.
- La actualizacion de saldo y la insercion del movimiento deben estar en una misma transaccion.
- Si hay series, la insercion/asociacion de series participa en la misma unidad idempotente.

## 15. Concurrencia

Estrategia recomendada:

- Lock transaccional por granularidad de existencia: `idEmpresa + SucursalId + ProductoServicioId + VarianteId nullable`.
- Si existe fila de saldo, bloquear con semantica equivalente a `UPDLOCK/HOLDLOCK`.
- Si no existe fila, crear dentro de transaccion con llave unica de granularidad.
- Mantener orden de locks estable para recepciones con multiples partidas.
- Usar aislamiento/lock acotado para evitar doble recepcion simultanea de la misma partida.
- No bloquear por tenant completo si basta con la granularidad de inventario.

## 16. Multitenant

- `idEmpresa` no viene de autoridad cliente.
- Todas las consultas y escrituras futuras deben filtrar por `idEmpresa`.
- Llaves unicas deben iniciar con `idEmpresa`.
- La version de schema debe seguir la regla vigente: `DatabaseIdentity + Scope`.
- Si se crea scope `Inventario`, su contrato/versionamiento debe ser propio y compatible con T15-T24.

## 17. Compatibilidad Historica

La base real auditada ya tiene datos:

- `ProductosServicios`: 8 filas.
- `ProductosServiciosExistencias`: 1 fila.
- `ProductosServiciosMovimientosInventario`: 0 filas.
- `ProductosServiciosVariantes`: 4 filas.
- `ProductosServiciosPresentacionesVenta`: 57 filas.
- `Sucursales`: 136 filas.
- `OrdenesCompra`: 43 filas.
- `OrdenesCompraDetalle`: 88 filas.

Problema historico: la existencia actual no tiene sucursal ni variante.

Opciones de adopcion/backfill futuras:

- Si el PO aprueba una sucursal historica por defecto, mover saldos existentes a esa sucursal.
- Si no hay evidencia suficiente, usar clasificacion controlada `UNKNOWN` o requerir decision de adopcion antes de migrar.
- Para variante historica, existencia actual sin variante debe mapear a `VarianteId = NULL`; no repartir entre variantes sin evidencia.
- Movimientos inexistentes no deben inventarse salvo evento de adopcion trazado.

No se ejecuto ningun backfill.

## 18. Scope Recomendado

Crear un scope separado `Inventario` en una fase posterior, no dentro de ARQ-01.

Razones:

- Inventario no pertenece exclusivamente a OC/Recepcion.
- Futuras salidas, ajustes, traspasos y ventas tambien consumiran inventario.
- ProductosServicios debe seguir siendo maestro/catalogo, no ledger operativo.
- Recepcion debe ser origen de movimiento, no propietario unico del inventario.

Versionamiento futuro recomendado:

- Contrato inmutable por `Inventario`.
- Bootstrap solo para bases empty del scope.
- Adoption explicita para bases historicas.
- Migrations con History/Attempts/State.
- Lock de schema por `DatabaseIdentity + Scope`.
- Drift gate antes de operar.
- Sin DDL manual desde OC-02 o REC-01.

## 19. Impacto ProductosServicios

ProductosServicios debe permanecer como maestro:

- `CausaInventario` define si un producto mueve inventario.
- `UsaNumeroSerie` define necesidad de series en recepcion.
- `idUnidadMedida` define unidad base.
- Variantes existentes son catalogo comercial/operativo del producto.

No recomendado:

- Mover recepcion dentro del controller de ProductosServicios.
- Hacer que PresentacionesVenta sea PresentacionCompra.
- Cambiar la unicidad actual de existencia sin contrato de migracion.
- Mezclar variantes por falta de campo.

## 20. Handoff OC-02

OC-02 debe disenar schema/modelo tecnico de OC sin ejecutar DDL en ARQ-01.

Debe incorporar:

- `VarianteId nullable` en partida o contrato futuro.
- `PresentacionCompra` separada o snapshot de compra.
- `CantidadBaseOrdenada`.
- `CantidadBaseRecibidaAcumulada`.
- `CantidadBasePendiente`.
- Estado compatible con recepcion parcial/completa.
- No mover inventario al generar OC.
- Mantener `idSucursal` como destino operativo.
- Referenciar la recomendacion ARQ-01 como recomendacion, no como decision PO.

## 21. Handoff REC-01

REC-01 debe disenar contrato/schema de recepcion sin ejecutar DDL desde ARQ-01.

Debe incorporar:

- Recepcion parcial.
- Multiples recepciones por OC.
- No sobre-recepcion por ahora.
- Confirmacion idempotente.
- Movimiento de inventario solo al confirmar producto inventariable.
- Series en recepcion cuando `UsaNumeroSerie` aplique.
- PresentacionCompra snapshot y conversion a unidad base.
- Integracion con `Inventario` recomendado si PO lo aprueba.

## 22. Riesgos

| Riesgo | Severidad | Mitigacion |
| --- | --- | --- |
| Mezclar variantes en un solo saldo | Alta | Usar `VarianteId nullable` en granularidad futura. |
| Perder sucursal destino del stock | Alta | Usar `SucursalId` como parte de existencia/movimiento. |
| Doble aplicacion de recepcion por reintento | Alta | `OperationKey` unico + transaccion. |
| Saldo divergente del ledger | Media | Actualizar ledger y saldo en la misma transaccion; validaciones de drift/conciliacion. |
| Backfill historico incorrecto | Alta | No inferir sucursal/variante; usar decision PO o `UNKNOWN`. |
| Romper ProductosServicios certificado | Media/Alta | Crear scope `Inventario` separado. |
| Performance si todo se deriva del ledger | Media/Alta | Saldo materializado recomendado. |
| Series duplicadas | Alta | Unicidad por empresa/producto/variante/serie activa. |

## 23. Separacion de Decisiones

### Decisiones aprobadas vigentes

- OC admite producto, servicio y mixta.
- OC admite variantes cuando existan.
- PresentacionCompra separada de PresentacionVenta.
- Recepcion independiente dentro de Proveeduria.
- Recepcion parcial: si.
- Sobre-recepcion: no por ahora.
- Crear/generar OC no mueve inventario.
- Confirmar recepcion de producto inventariable si mueve inventario.
- Series se capturan en Recepcion cuando aplique.

### Recomendacion tecnica ARQ-01

- Usar scope `Inventario` separado con ledger + saldo materializado.
- Granularidad `idEmpresa + SucursalId + ProductoServicioId + VarianteId nullable`.
- Stock en unidad base; PresentacionCompra como snapshot.

### Decisiones PO pendientes

- Aprobar o rechazar `RECOMENDACION_ARQ01`.
- Confirmar politica de historico cuando no exista sucursal/variante evidenciable.
- Confirmar si habra dominio `Almacen` futuro o si `Sucursal` es destino suficiente para BL-03.
- Confirmar unicidad exacta de series antes de DDL.

### Detalles tecnicos no aprobados para ejecucion

- Nombres fisicos de tablas/columnas futuras.
- Indices/constraints finales.
- Migraciones/adoption/backfill.
- Locks exactos.
- Endpoints de OC-02/REC-01.

## 24. Definition of Done

- Auditoria real de modelo fisico ejecutada: PASS.
- Mapa `OBJECT|TYPE|PK|FK|idEmpresa|RESPONSIBILITY|USE`: PASS.
- Granularidad evaluada: PASS.
- Sucursal vs almacen auditado: PASS.
- Variantes evaluadas sin mezclar stock: PASS.
- PresentacionCompra y unidad base evaluadas: PASS.
- Recepcion parcial evaluada con ejemplo 10x12: PASS.
- Series evaluadas conceptualmente con evidencia Legacy: PASS.
- Movimientos comparados con alternativas: PASS.
- Minimo 3 alternativas: PASS.
- Una recomendacion tecnica sin decision PO automatica: PASS.
- Contratos conceptuales existencia/movimiento/serie: PASS.
- Invariantes/idempotencia/concurrencia/multitenant: PASS.
- Historico/adopcion/backfill/UNKNOWN: PASS.
- Scope/versionamiento/bootstrap/adoption/migrations/locking/State-History-Attempts/drift/Gate: PASS.
- Impacto ProductosServicios: PASS.
- Handoff OC-02 y REC-01: PASS.
- Riesgos: PASS.
- No DDL/migraciones/UI/Legacy/OC-02/REC-01: PASS.

## 25. Dictamen

ARQ-01 queda cerrado como recomendacion tecnica. La decision PO `REQUIERE_DECISION_PO_INVENTARIO_VARIANTE_SUCURSAL` sigue pendiente y debe presentarse al PO antes de ejecutar OC-02 o REC-01.
