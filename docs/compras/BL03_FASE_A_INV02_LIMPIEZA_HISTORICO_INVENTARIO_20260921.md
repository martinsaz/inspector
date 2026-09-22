# BL-03 FASE A INV-02 - Limpieza Historico Inventario

Fecha: 2026-09-21

## Alcance Ejecutado

Ticket ejecutado: `BL-03 -> FASE A -> INV-02`.

Decision PO aplicada:

- Eliminar las 10 unidades historicas de `Aceite Motor Sintetico`.
- No migrar a `UNKNOWN`.
- No inventar sucursal.
- No inventar movimientos historicos.
- Auditar otros residuos y eliminar solo basura demostrable.
- `ProductosServicios` no debe recrear ni usar inventario legacy como fuente de verdad.
- Inventario V1 queda como fuente operativa hacia adelante.

No se ejecuto REC-01, no se implemento Recepcion y no se modifico Legacy.

## Auditoria Real

Tenant real: `163`.

`idEmpresa`: `b17aaece-2b78-4e35-b554-9e694eeb15a7`.

Base: `db_a883c3_checklist`.

BEFORE:

- `ProductosServiciosExistencias`: 1.
- `ProductosServiciosMovimientosInventario`: 0.
- `InventarioSaldos`: 0.
- `InventarioMovimientos`: 0.
- `InventarioSeries`: 0.
- `ProductosServicios`: 8.
- `ProductosServiciosVariantes`: 4.
- `ActivosProveedores`: 3.
- `Sucursales`: 5 para la empresa 163.
- `OrdenesCompra`: 43.
- `OrdenesCompraDetalle`: 88.

Registro autorizado:

- `ProductosServiciosExistencias.id`: `92A412E1-3132-4674-9825-B9A2635E1C11`.
- `idProductoServicio`: `ECD83622-584A-48E1-8B01-7DB89C950873`.
- Codigo: `001`.
- Producto: `Aceite Motor Sintetico`.
- `ExistenciaActual`: 10.0000.
- `ExistenciaMinima`: 5.0000.
- `CostoPromedio`: 605.00.
- `Tipo`: 1.
- `CausaInventario`: 1.
- `Activo`: 1.
- Dependencias en movimientos legacy para ese producto: 0.

## Limpieza

Se ejecuto DELETE transaccional e idempotente con predicados exactos por `idEmpresa`, `id`, `idProductoServicio`, existencia 10, minimo 5, costo 605 y dependencia legacy 0.

Resultado:

- Primera ejecucion: 1 registro eliminado.
- Segunda ejecucion: 0 registros eliminados.
- Otros residuos encontrados: 0.
- Otros residuos eliminados: 0.

AFTER:

- `ProductosServiciosExistencias`: 0.
- `ProductosServiciosMovimientosInventario`: 0.
- `InventarioSaldos`: 0.
- `InventarioMovimientos`: 0.
- `InventarioSeries`: 0.
- Stock V1 de `Aceite Motor Sintetico`: 0.
- `ProductosServicios`: 8.
- `ProductosServiciosVariantes`: 4.
- `ActivosProveedores`: 3.
- `Sucursales`: 5.
- `OrdenesCompra`: 43.
- `OrdenesCompraDetalle`: 88.

## Runtime ProductosServicios

`ProductosServiciosController` dejo de referenciar:

- `dbo.ProductosServiciosExistencias`.
- `dbo.ProductosServiciosMovimientosInventario`.

Usos adaptados:

- Listado, detalle, ficha y resumen leen stock desde `dbo.InventarioSaldos`.
- Consulta de movimientos lee `dbo.InventarioMovimientos`.
- Snapshot de producto no usa `IdExistencia` legacy.

Usos bloqueados:

- Endpoints legacy de entrada, salida y ajuste de inventario fallan cerrado con mensaje de Inventario V1 porque no reciben sucursal, origen e idempotencia.
- Guardado de `ProductosServicios` ya no crea, actualiza ni elimina filas de inventario legacy.

## Inventario V1

- Scope: `Inventario`.
- Version: 1.
- Hash: `146bd87ec94a7f69f9c84d61c867ee7e99ccf931138d843b0356573fe0e293b2`.
- State: version 1, `VALIDATED`.
- History: 3.
- Attempts: 3.
- Drift: `SchemaOk`.
- Gate: `COMPATIBLE`.

## Verificacion

- Tests API especificos de Inventario/OC/transition: PASS.
- Build API: PASS con warnings legacy/preexistentes.
- Build MVC: PASS con warnings legacy/preexistentes.
- `git diff --check`: PASS.
- `lsof` final: puertos 5200 y 5127 sin listeners.

## Cierre

`INV-02` queda `CERRADO / PASS TECNICO`.

`INV-01` queda desbloqueado y actualizado a `CERRADO / PASS TECNICO` porque el registro historico incompatible fue resuelto con autorizacion PO, limpieza segura e Inventario V1 como fuente operativa.

Siguiente ticket recomendado: `REC-01`, sin ejecutarlo desde INV-02.
