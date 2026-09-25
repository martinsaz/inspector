# BL-03 FASE C - OC-CUR-03 - Motor Huecos/Copetes/Sugerencias

Estado: CERRADO / PASS TECNICO SQL REAL CHECKAPPERP  
Fecha: 2026-09-23  
Ticket posterior: OC-CUR-04 recomendado; NO ejecutado.

## Alcance Implementado

Se implemento el motor backend de sugerencias para Curvas CheckApp sin UI final, sin modificar Nueva OC visualmente, sin generar OCs hijas y sin mover inventario.

Flujo certificado:

`CurvaObjetivo + Existencia Inventario V1 + Transito OC/Recepcion -> Cobertura -> Hueco/Copete -> Modo -> Cantidad sugerida -> PresentacionCompra`

Formula canonica:

- `Cobertura = Existencia + Transito`
- `Hueco = max(CurvaObjetivo - Cobertura, 0)`
- `Copete = max(Cobertura - CurvaObjetivo, 0)`
- `Pedido inicial = max(CurvaObjetivo, 0)`
- `Rellenar curva = max(Hueco, 0)`
- `Manual = decision del usuario; el motor solo conserva contexto y override`
- `No pedir = 0`

## Implementacion

Backend:

- `inspectorapi/checklistWs/Services/Tenant/CurvasScopeModels.cs`
- `inspectorapi/checklistWs/Services/Tenant/CurvasSugerenciasMotorService.cs`
- `inspectorapi/checklistWs/Controllers/Curvas/CurvasSugerenciasController.cs`
- `inspectorapi/checklistWs/Program.cs`

Pruebas:

- `inspectorapi/checklistWs.Tests/Services/Tenant/CurvasSugerenciasMotorTests.cs`

Endpoint tecnico:

- `POST api/CurvasSugerencias/Preview`
- Read-only.
- Gate por `Curvas`, `Inventario`, `OrdenesCompra`, `Recepcion`.
- Permiso existente `OrdenesCompraNuevaPermissionCode` en modo lectura.
- No inventa permisos nuevos.

## Reglas Certificadas

- `SIN_CURVA`: sin siembra vigente no calcula pedido automatico.
- `HUECO`: cobertura menor que curva objetivo.
- `COPETE`: cobertura mayor que curva objetivo.
- `COMPLETA`: cobertura igual a curva objetivo.
- `PedidoInicial`: propone curva objetivo.
- `RellenarCurva`: propone hueco.
- `Manual`: respeta cantidad manual y marca override.
- `NoPedir`: cantidad final cero.
- Producto sin variante: soportado con `idVariante NULL`.
- Producto con variante: soportado por `idProductoServicio + idVariante`.
- Servicio: rechazado con `CURVA_SERVICIO_RECHAZADO`.
- Multisucursal: cada sucursal calcula existencia/transito de manera independiente.
- Cross-tenant: fail closed si `descriptor.IdEmpresa` no coincide con el `idEmpresa` solicitado.
- Preview: no persiste `CurvasSugerenciasSnapshot`; solo devuelve payload compatible.

## Fuentes Reales

Existencia:

- `dbo.InventarioSaldos.CantidadBaseActual`
- Llave: `idEmpresa + idSucursal + idProductoServicio + idVariante nullable`
- Sin fila de saldo equivale a cero.

Transito:

- `dbo.OrdenesCompraDetalle.CantidadBasePendiente`
- Con cabecera `dbo.OrdenesCompra`
- Incluye OC `Estado IN (2 Generada, 4 ParcialmenteRecibida)`
- Incluye partidas `EstadoPartida IN (1 Pendiente, 2 Parcial)`
- Excluye borradores, canceladas, recibidas, servicios, otra sucursal, otra variante y otro tenant.

PresentacionCompra:

- `PermiteCantidadBase = 0`: redondea hacia arriba por `FactorConversionBase`.
- `PermiteCantidadBase = 1`: conserva cantidad exacta en unidad base.
- `ExcedenteRedondeoBase = CantidadBaseConvertida - CantidadPropuestaBase`.

Nota tecnica: `InventarioSaldos` conserva contrato `CHECK (CantidadBaseActual >= 0)`. El caso de existencia negativa se certifico en calculadora pura del motor para preservar el valor si una fuente externa llegara a devolverlo, pero CheckAppErp no permite persistir un saldo negativo sin violar Inventario V1.

## QA SQL Real CheckAppErp

Mecanismo usado:

- TXT autorizado con variable temporal `MOKA_CHECKAPPERP_QA_CONNECTION`.
- Runner fuera del repo.
- Conexion usada solo en memoria.
- Sin persistir connection string ni password en codigo/documentacion.
- `unset`/limpieza de variable al finalizar.

Identidad:

- `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`

Estado:

- Curvas Version: `1`
- Curvas Hash: `85167e40a617c4535514563c03cfd3c49ec5c0f915f122b0d0c533779e88d4f5`
- State: `PROVISIONED/PASS`
- History: `1`
- Attempts: `4`
- Drift: `SchemaOk`
- DriftCount: `0`
- Gate: `COMPATIBLE`

Dependencias CheckAppErp:

- `Inventario`: `NoProvision/ALREADY_PROVISIONED`
- `Recepcion`: `NoProvision/ALREADY_PROVISIONED`

Fixtures reales reversibles:

- Curva fixture: PASS.
- Detalle producto sin variante: PASS.
- Detalle producto con variante: PASS.
- Servicio rechazado: PASS.
- Siembra: PASS.
- Varias OCs en transito: PASS.
- Recepcion parcial modelada por `CantidadBaseRecibidaAcumulada` y `CantidadBasePendiente`: PASS.
- OC cancelada excluida del transito: PASS.
- Presentacion cerrada: `6` base -> `2` compras -> `10` base; excedente `4`: PASS.
- Presentacion libre: `6` base exacta: PASS.
- Multisucursal sin mezcla: PASS.
- Cross-tenant fail closed: PASS.
- Preview read-only: `CurvasSugerenciasSnapshot` no recibio filas.
- Cleanup: residuos `0`.

## Resultado de Pruebas

- `dotnet test checklistWs.Tests/checklistWs.Tests.csproj --filter CurvasSugerenciasMotorTests`: PASS, 10/10.
- QA SQL real CheckAppErp: PASS.

## Congelamientos

- No OC-CUR-04 ejecutado.
- No UI final.
- No Nueva OC visual.
- No OCs hijas generadas.
- No movimiento de inventario.
- No Legacy Tarahumara.
- T25 FROZEN.
- REPORTE LIDER FROZEN.
