# BL-03 FASE A REC-01 - Modelo Schema Recepcion

Fecha: 2026-09-21
Estado: CERRADO / PASS TECNICO

## Alcance Ejecutado

- Scope nuevo: `Recepcion`.
- Version: `V1`.
- Hash contrato: `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`.
- Tablas V1: `RecepcionFolios`, `Recepciones`, `RecepcionPartidas`, `RecepcionSeries`.
- API tecnica agregada sin UI final: `api/Recepcion`.
- Servicio tecnico: `IRecepcionScopeService` / `RecepcionScopeService`.
- Inventario V1 integrado como unica fuente operativa mediante `IInventarioScopeLedgerService`.
- Tablas legacy `ProductosServiciosExistencias` y `ProductosServiciosMovimientosInventario`: no se usan como fuente de verdad.

## Evidencia SQL Real

Tenant: `163`.

Identidad sanitizada:
`SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.

BEFORE real:

```text
OrdenesCompra:43
OrdenesCompraDetalle:88
ProductosServicios:8
ProductosServiciosVariantes:4
OrdenesCompraPresentacionesCompra:0
Recepciones:0
RecepcionPartidas:0
RecepcionSeries:0
InventarioSaldos:0
InventarioMovimientos:0
InventarioSeries:0
ProductosServiciosExistencias:0
ProductosServiciosMovimientosInventario:0
ActivosProveedores:3
Sucursales:5
```

Schema:

```text
BOOTSTRAP=NoProvision; REASON=ALREADY_PROVISIONED
DRIFT=SchemaOk; ITEMS=0; TABLES=4; COLUMNS=57; FKS=13; CHECKS=7
GATE=True; REASON=COMPATIBLE; VERSION=1; LATEST=1
```

QA funcional reversible:

```text
FIRST=True/REC-000003/Already:False
RETRY=True/Already:True
SECOND=True/REC-000004/Already:False
OC:5
VAR:120.0000/0.0000/3
SERV:10.0000/0.0000/3
SER:2.0000/0.0000/3
RECS:2
PARTS:5
SERIES:2
MOVS:3
SALDOS:2
OVER:RECEPCION_OC_ESTADO_INVALIDO
CROSS:RECEPCION_REQUEST_INVALID
```

AFTER real:

```text
OrdenesCompra:43
OrdenesCompraDetalle:88
ProductosServicios:8
ProductosServiciosVariantes:4
OrdenesCompraPresentacionesCompra:0
Recepciones:0
RecepcionPartidas:0
RecepcionSeries:0
InventarioSaldos:0
InventarioMovimientos:0
InventarioSeries:0
ProductosServiciosExistencias:0
ProductosServiciosMovimientosInventario:0
ActivosProveedores:3
Sucursales:5
CLEANUP=PASS
```

## Dictamen

REC-01 queda cerrado tecnicamente. Recepcion V1 soporta cabecera, partidas, recepcion parcial/multiple, producto, servicio, variante, presentacion de compra snapshot, factor snapshot, series, estados, idempotencia por `OperationKey`, concurrencia con transaccion serializable y `sp_getapplock`, multitenant fail closed y autorizacion por codigos `05004001` / `05004002`.

No se construyo UI final de Recepcion. No se modifico Legacy. T25 y reporte lider permanecen FROZEN.
