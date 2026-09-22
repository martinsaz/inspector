# BL-03 FASE A INV-01 - Scope Inventario V1 por Sucursal y Variante

Fecha: 2026-09-21

## Alcance Ejecutado

Ticket ejecutado: `BL-03 -> FASE A -> INV-01`.

Predecesores:

- OC-01 cerrado.
- SEC-01 cerrado.
- ARQ-01 aprobado PO.
- OC-02 cerrado / PASS tecnico.

Decisiones PO aplicadas:

- Inventario V1 por sucursal.
- Scope Inventario separado con ledger + saldo materializado.
- Granularidad `idEmpresa + idSucursal + idProductoServicio + idVariante nullable`.
- Stock en unidad base.
- PresentacionCompra no es dimension de saldo.
- OC no mueve inventario.
- Recepcion no se implementa en este ticket.
- No usar `UNKNOWN`.
- No borrar historico incompatible sin prueba segura.

No se ejecuto Recepcion, REC-01, UI nueva, Legacy, Firebase, Hosting ni Conexiones.

## BEFORE Real

Certificacion real sobre tenant `163`, `idEmpresa=b17aaece-2b78-4e35-b554-9e694eeb15a7`:

- `ProductosServiciosExistencias`: 1.
- `ProductosServiciosMovimientosInventario`: 0.
- `ProductosServicios`: 8.
- `ProductosServiciosVariantes`: 4.
- `Sucursales`: 136.
- `OrdenesCompra`: 43.
- `OrdenesCompraDetalle`: 88.

Registro historico incompatible:

- `ProductosServiciosExistencias.id`: `92A412E1-3132-4674-9825-B9A2635E1C11`.
- `idEmpresa`: `B17AAECE-2B78-4E35-B554-9E694EEB15A7`.
- `idProductoServicio`: `ECD83622-584A-48E1-8B01-7DB89C950873`.
- Codigo: `001`.
- Producto: `Aceite Motor Sintetico`.
- `ExistenciaActual`: 10.0000.
- `ExistenciaMinima`: 5.0000.
- `CostoPromedio`: 605.00.
- Producto tipo: 1.
- `CausaInventario`: 1.
- `Activo`: 1.

Uso runtime detectado:

- `ProductosServiciosController` lee `ProductosServiciosExistencias` en listados, detalle/ficha y snapshot.
- Endpoints actuales `ObtenerExistenciaProductoServicio`, `ObtenerMovimientosInventarioProductoServicio` y registros de entrada/salida/ajuste usan la tabla legacy.
- `SynchronizeInventoryForSaveAsync` inserta, actualiza o elimina existencia legacy segun ProductoServicio.
- El propio codigo legacy bloquea eliminacion si hay existencia distinta de cero o movimientos.

## Resolucion Posterior INV-02

INV-02 aplico decision PO explicita para eliminar el residuo historico incompatible de `Aceite Motor Sintetico`.

Decision aplicada:

- No migrar a `UNKNOWN`.
- No crear sucursal ficticia.
- No inventar distribucion historica ni movimientos.
- Eliminar solo el registro autorizado, con predicados exactos y sin dependencias legacy.

Resultado INV-02:

- Primera ejecucion: 1 registro eliminado.
- Segunda ejecucion: 0 registros eliminados.
- `ProductosServiciosExistencias` after: 0.
- `ProductosServiciosMovimientosInventario` after: 0.
- Otros residuos eliminables encontrados: 0.

`ProductosServicios` dejo de usar `ProductosServiciosExistencias` / `ProductosServiciosMovimientosInventario` como fuente de verdad; las lecturas de stock se adaptaron a `InventarioSaldos`, los movimientos visibles a `InventarioMovimientos`, y los endpoints legacy de movimiento quedan fail-closed porque no reciben sucursal/origen/idempotencia.

Con esta resolucion, INV-01 queda desbloqueado y actualizado a `CERRADO / PASS TECNICO`.

## Scope Inventario V1

Scope fisico nuevo: `Inventario`.

Version: `1`.

Hash: `146bd87ec94a7f69f9c84d61c867ee7e99ccf931138d843b0356573fe0e293b2`.

Tablas:

- `dbo.InventarioSaldos`.
- `dbo.InventarioMovimientos`.
- `dbo.InventarioSeries`.

Saldo materializado:

- `idEmpresa`.
- `idSucursal`.
- `idProductoServicio`.
- `idVariante nullable`.
- `CantidadBaseActual`.
- auditoria de creacion/actualizacion.

Ledger:

- `idEmpresa`.
- `idSucursal`.
- `idProductoServicio`.
- `idVariante nullable`.
- `TipoMovimiento`.
- `CantidadBase`.
- `SaldoAnterior`.
- `SaldoPosterior`.
- `OrigenTipo`.
- `OrigenId`.
- `OrigenPartidaId`.
- `OperationKey`.
- usuario/fechas/observaciones.

Series:

- Contrato V1 creado para integridad del scope.
- Unicidad activa por `empresa + producto + variante + NumeroSerie`.
- `idSucursalActual` representa ubicacion vigente y no permite duplicar serie entre sucursales.

## Servicios Tecnicos

Se agrego `IInventarioScopeLedgerService` / `InventarioScopeLedgerService`:

- Aplica movimiento y saldo en la misma transaccion.
- Usa `OperationKey` unico por empresa.
- Repetir la misma operacion no duplica movimiento ni saldo.
- Lock por granularidad `empresa+sucursal+producto+variante` via `sp_getapplock`.
- Valida sucursal, producto inventariable y variante perteneciente al producto.
- Falla cerrado cross-tenant.
- No expone endpoint de Recepcion ni UI nueva.

## Certificacion Real

Resultados runner real:

- Script `inventario-up.sql`: PASS.
- Control infra: Ready.
- State Inventario: 1.
- History Inventario: 3.
- Attempts Inventario: 3.
- Drift: `SchemaOk`, 0 diferencias.
- Segunda corrida script: idempotente.
- Gate: `COMPATIBLE`.

Fixture ledger/saldo reversible:

- Entrada: saldo 0 -> 10.
- Repeticion mismo `OperationKey`: `AlreadyApplied=True`.
- Salida limpieza: saldo 10 -> 0.
- Movimientos fixture eliminados: 2.
- Saldo fixture eliminado: 1.
- AFTER fixture: `InventarioSaldos=0`, `InventarioMovimientos=0`, `InventarioSeries=0`.

Cross-tenant:

- Movimiento con `idEmpresa` ajeno fallo cerrado con `InvalidOperationException`.

## Regresion

- ProductosServicios: inventario operativo adaptado a Inventario V1; no recrea ni usa inventario legacy como fuente de verdad.
- OC historicas: 43 OC / 88 detalles preservados.
- Proveedores: sin cambios de datos.
- Sucursales: sin cambios de datos.
- OC-02: schema/gate no modificado funcionalmente; conteos preservados.
- SEC-01 permisos: sin cambios.
- Legacy: sin cambios.
- REC-01: no ejecutado.
- T25: FROZEN.
- Reporte lider: FROZEN.

## Verificacion

- `dotnet test inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --no-restore --filter "FullyQualifiedName~InventarioSchemaContractTests|FullyQualifiedName~OrdenesCompraSchemaContractTests|FullyQualifiedName~SchemaContractProviderTests|FullyQualifiedName~SchemaMigrationEngineTests" --verbosity minimal`: PASS 57/57.
- Build API: PASS con warnings legacy/preexistentes.
- Build MVC: PASS con warnings legacy/preexistentes.
- `git diff --check`: PASS al cierre.

## Cierre Actualizado

`INV-01` queda `CERRADO / PASS TECNICO` despues de INV-02.

El bloqueo por stock activo historico de `Aceite Motor Sintetico` fue resuelto por decision PO y limpieza controlada: 1 registro eliminado, 0 dependencias legacy, segunda ejecucion idempotente, maestros/OC/partidas preservados e Inventario V1 confirmado como fuente operativa.

## Siguiente Ticket Recomendado

`REC-01`, si INV-02 queda PASS; no ejecutar automaticamente desde este documento.
