# OC-QA09-CLEAN — Limpieza total de Órdenes de Compra para baseline QA

Fecha: 2026-10-07  
Tenant: `163 — UMBRELLA`  
Estado: `BASELINE LIMPIO / LISTO PARA QA MANUAL DENISSE`

## Decisión PO

Por autorización expresa de Denisse previa al QA manual, el histórico existente de Órdenes de Compra del tenant UMBRELLA fue descartado para iniciar el nuevo flujo OC V5 desde baseline limpio.

Esta autorización es específica para este baseline QA. No es una regla general de producción ni autoriza limpiar otros tenants o dominios.

## BEFORE

| Entidad | Conteo |
|---|---:|
| OrdenesCompra | 55 |
| OrdenesCompraDetalle | 134 |
| OrdenesCompraSucursales | 68 |
| Recepciones | 0 |
| RecepcionPartidas | 0 |
| RecepcionSeries | 0 |
| movimientos de inventario relacionados | 0 |
| series de inventario relacionadas | 0 |
| CurvasSugerenciasSnapshot | 0 |
| CurvasOperacionOrdenesCompra | 0 |
| CurvasOperacionesCompra | 0 |

## Preflight de dependencias

Se auditó físicamente `sys.foreign_keys` y las tablas que contienen `idOrdenCompra`, `idOrdenCompraDetalle`, `idRecepcion`, `idRecepcionPartida`, `idInventarioMovimiento`, `idInventarioSerie`, `OrigenId` u `OrigenPartidaId`.

Dependencias encontradas:

- `OrdenesCompraDetalle` y `OrdenesCompraSucursales` → `OrdenesCompra`.
- `Recepciones` → `OrdenesCompra` y `OrdenesCompraSucursales`.
- `RecepcionPartidas` → recepción, OC, detalle OC, sucursal y movimiento de inventario.
- `RecepcionSeries` → recepción, partida e `InventarioSeries`.
- `CurvasSugerenciasSnapshot` → OC y detalle OC.
- `CurvasOperacionOrdenesCompra` → OC y operación de curva.

No existían recepciones ni efectos de inventario del tenant. Por tanto, no fue necesario revertir saldos, borrar movimientos ni resolver cantidades mezcladas con inventario legítimo. El gate de seguridad del cleanup abortaba si aparecía cualquier recepción o movimiento de origen recepción.

Orden seguro aplicado:

1. snapshots de sugerencias de curva;
2. relaciones operación-curva ↔ OC;
3. operaciones de curva exclusivas de compra;
4. detalles OC;
5. destinos OC;
6. cabeceras OC;
7. consecutivo `OrdenesCompraFolios` del tenant.

`RecepcionFolios` se preservó: no era una fila dependiente de una OC existente y Recepción V2 permanece disponible.

## DELETE

- autorizado: sí, expresamente por PO para UMBRELLA 163;
- alcance: únicamente filas `idEmpresa = B17AAECE-2B78-4E35-B554-9E694EEB15A7` del dominio OC;
- ejecución: una transacción SQL con `SET XACT_ABORT ON`, `TRY/CATCH`, `ROLLBACK` ante error y aserciones before/after;
- hard delete fuera del alcance OC: 0;
- DDL/schema/migraciones: 0;
- resultado: `COMMIT` exitoso.

## AFTER

| Entidad | Conteo |
|---|---:|
| OrdenesCompra | 0 |
| OrdenesCompraDetalle | 0 |
| OrdenesCompraSucursales | 0 |
| OrdenesCompraFolios | 0 |
| Recepciones | 0 |
| RecepcionPartidas | 0 |
| RecepcionSeries | 0 |
| CurvasSugerenciasSnapshot | 0 |
| CurvasOperacionOrdenesCompra | 0 |
| CurvasOperacionesCompra | 0 |

## Catálogos preservados

Los conteos fueron iguales antes y después:

| Catálogo | BEFORE | AFTER |
|---|---:|---:|
| ProductosServicios | 11 | 11 |
| ProductosServiciosVariantes | 7 | 7 |
| OrdenesCompraPresentacionesCompra | 0 | 0 |
| ActivosProveedores | 4 | 4 |
| Sucursales | 8 | 8 |
| CurvasCatalogo | 1 | 1 |
| CurvasSiembra | 2 | 2 |
| Usuarios | 4 | 4 |
| Roles | 3 | 3 |

No se modificaron Productos, Servicios, PresentacionCompra, Proveedores, Sucursales, Razones Sociales, Curvas, Siembra, Usuarios, Roles/Permisos, ListaPrecios, Auth ni configuración empresarial.

## Inventario

| Medida | BEFORE | AFTER |
|---|---:|---:|
| InventarioMovimientos | 0 | 0 |
| InventarioSeries | 0 | 0 |
| InventarioSaldos | 0 | 0 |
| suma CantidadBaseActual | 0 | 0 |

Afectación ajena: `0`. No existía inventario originado por recepciones de OC y no se ejecutó ninguna escritura sobre Inventario.

## Schema y constraints

- OC V5: `CurrentVersion=5`, manifest `843193ced8cc…`, estructura física presente.
- Recepción V2: `CurrentVersion=2`, manifest `24f73a6f4512…`, estructura física presente.
- FKs deshabilitadas o no confiables: 0.
- `DBCC CHECKCONSTRAINTS WITH ALL_CONSTRAINTS`: sin filas de error.
- DDL/migraciones ejecutadas: 0.
- Drift introducido por el cleanup: 0.
- Gate: `PASS`.

## Verificación runtime

- Reporte OC autenticado: `0 visibles`, `0 registros`, `Sin registros disponibles`.
- Nueva OC autenticada: Paso 1 activo, proveedor sin seleccionar, 0 partidas, total `$0.00`; lista para iniciar desde cero.
- Consola browser: 0 errores y 0 warnings.
- No se creó otra OC después del cleanup.
- No se reejecutó la matriz A–T después del cleanup.
- Pasos 1 y 2: cero modificaciones.
- Legacy: read-only.

## Entrega

DEFECTOS: ninguno atribuible al cleanup.  
BLOQUEOS: ninguno.  
¿BASELINE_LIMPIO_PARA_QA_DENISSE?: `SÍ`.  
SIGUIENTE PASO: `QA MANUAL DENISSE`.
