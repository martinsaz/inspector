# LP-02 - Schema V1 + Versionado + Compatibility Gate Lista de Precios CheckApp

Fecha: 2026-09-28  
Estado: IMPLEMENTACION TECNICA LOCAL COMPLETA / QA SQL REAL CHECKAPPERP BLOQUEADO POR CREDENCIAL NO DISPONIBLE  
Scope: `ListaPrecios`  
Version: V1  
ManifestHash: `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`

## 1. Alcance ejecutado

LP-02 implementa exclusivamente la primera capa tecnica de Lista de Precios:

- Schema Contract V1.
- Versionado por scope `ListaPrecios`.
- Inventory de tablas esperadas.
- Compatibility Gate habilitado para el scope.
- Bootstrapper/migracion/baseline vacio habilitados para scope V1.
- Pruebas automatizadas de contrato y manifest.

No se implemento UI, CRUD de negocio, resolucion de precios, consumidores, menu, permisos, Auth, Legacy ni LP-03.

## 2. Decision PO incorporada

Decision PO recibida en LP-02:

- `Precio Lista = 0.00` es precio configurado valido.
- `Precio Lista = 0.00` no activa fallback.
- `Precio NULL` o fila inexistente significa no configurado y activa fallback.

Ejecucion tecnica:

- `ListaPreciosDetalle.Precio` es `DECIMAL(18,2) NOT NULL`.
- `CK_ListaPreciosDetalle_Precio` exige `Precio >= 0`.
- La ausencia de fila de detalle representa no configurado.
- No existe columna o bandera de fallback en LP-02.

Esta decision quedo registrada como adenda en LP-01 sin reabrir el contrato funcional.

## 3. Modelo fisico V1

Tablas del scope:

| Tabla | Rol |
|---|---|
| `dbo.ListaPreciosListas` | Identidad estable tenant + nivel de lista 1..10. |
| `dbo.ListaPreciosDetalle` | Precio especifico por lista e identidad vendible. |

`ListaPreciosListas`:

- `idEmpresa` tenant obligatorio.
- `Nivel TINYINT` con `CHECK (Nivel BETWEEN 1 AND 10)`.
- Unicidad `idEmpresa + Nivel`.
- Un default activo por tenant mediante indice unico filtrado.
- Baja logica con `Activo`, `FechaArchivado`, `idUsuarioArchivado`.

`ListaPreciosDetalle`:

- `idEmpresa` tenant obligatorio.
- FK tenant-safe a lista, producto/servicio, variante y presentacion de venta.
- `TipoIdentidad`: 1 Producto base, 2 Servicio, 3 Variante, 4 PresentacionVenta.
- `TipoProductoServicio`: 1 Producto, 2 Servicio.
- `Precio DECIMAL(18,2) NOT NULL`.
- Unicidad activa por `idEmpresa + idListaPrecio + TipoIdentidad + idProductoServicio + idVariante + idPresentacionVenta`.
- Baja logica sin borrado destructivo.

## 4. Reglas protegidas por SQL

LP-02 protege por contrato:

- Tenant-first en FKs e indices.
- Nivel de lista limitado a 1..10.
- Precio negativo rechazado.
- Precio cero aceptado.
- Servicio sin variante ni presentacion.
- Producto base sin variante ni presentacion.
- Variante sin presentacion.
- PresentacionVenta sin variante.
- Variante + PresentacionVenta fuera de V1.
- Un precio activo por lista e identidad vendible.

## 5. Limites tecnicos documentados

El schema actual de `ProductosServiciosVariantes` y `ProductosServiciosPresentacionesVenta` permite FK tenant-safe por `(idEmpresa, id)`, pero no expone una llave unica fisica `(idEmpresa, idProductoServicio, id)` reusable desde LP sin modificar esos contratos.

Por tanto LP-02 no modifica Variantes ni PresentacionesVenta para agregar llaves nuevas. La pertenencia exacta variante->producto y presentacion->producto debe validarse fail-closed en LP-03/API antes de insertar o resolver precios.

No se agregaron triggers ni cambios colaterales a ProductosServicios.

## 6. Archivos modificados

API:

- `inspectorapi/checklistWs/Services/Tenant/DatabaseClassificationModels.cs`
- `inspectorapi/checklistWs/Services/Tenant/ListaPreciosSchemaContractFactory.cs`
- `inspectorapi/checklistWs/Services/Tenant/ProductosServiciosSchemaContractProvider.cs`
- `inspectorapi/checklistWs/Services/Tenant/ProductScopeInventory.cs`
- `inspectorapi/checklistWs/Services/Tenant/SchemaVersionControlModels.cs`
- `inspectorapi/checklistWs/Services/Tenant/SchemaMigrationModels.cs`
- `inspectorapi/checklistWs/Services/Tenant/ProductosServiciosSchemaBootstrapper.cs`
- `inspectorapi/checklistWs/Services/Tenant/ProductosServiciosCompatibilityGate.cs`
- `inspectorapi/checklistWs/Services/Tenant/SchemaMigrationRunner.cs`
- `inspectorapi/checklistWs/Services/Tenant/ProductosServiciosHistoricalBaselineAdopter.cs`
- `inspectorapi/checklistWs/Services/Tenant/SqlSchemaOperationLock.cs`

Tests:

- `inspectorapi/checklistWs.Tests/Services/Tenant/ListaPreciosSchemaContractTests.cs`

Docs:

- `inspector/docs/lista-precios/LP_01_CONTRATO_FUNCIONAL_MODELO_RESOLUCION_20260928.md`
- `inspector/docs/lista-precios/LP_02_SCHEMA_V1_VERSIONADO_GATE_20260928.md`

## 7. QA automatizada local

Comando ejecutado:

```bash
dotnet test inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --filter ListaPreciosSchemaContractTests --no-restore
```

Resultado:

- PASS: 8/8.
- Manifest V1 estable: `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`.
- Warnings existentes de paquetes/vulnerabilidades y compatibilidad net8; sin errores.

Cobertura de pruebas:

- Scope conocido y versionado.
- Inventory igual al contrato.
- Niveles 1..10 y default activo.
- Producto, servicio, variante y PresentacionVenta soportados.
- Variante + PresentacionVenta rechazado por contrato.
- Precio cero permitido y negativo rechazado.
- FKs tenant-first.
- Duplicado activo protegido.
- Manifest estable.

## 8. QA SQL real CheckAppErp

Estado: BLOQUEADO / NO EJECUTADO.

Motivo:

- `MOKA_CHECKAPPERP_QA_CONNECTION` no esta disponible en el proceso.
- `launchctl getenv MOKA_CHECKAPPERP_QA_CONNECTION` no devuelve valor.
- No se uso una cadena legacy de otra base como sustituto porque LP-02 exige CheckAppErp real.
- No se invento conexion fija ni se imprimio o persistio credencial QA.

Resultado:

- No se provisiono CheckAppErp desde esta ejecucion.
- No se modifico base de datos real.
- No hay PASS SQL real declarable para LP-02.

## 9. Matriz #MOKA

| Item | Resultado | Evidencia |
|---|---|---|
| AGENTS/CLAUDE leidos | OK | Reglas MVC/API consideradas antes de editar. |
| LP-AUD-01 leido | OK | Contraste de modelo actual y limites V1. |
| LP-01 leido | OK | Contrato funcional actualizado con decision PO de precio cero. |
| Backlog leido | OK | Scope acotado a LP-02, sin tickets posteriores. |
| Schema V1 | OK | `ListaPreciosSchemaContractFactory`. |
| Versionado | OK | `ListaPreciosLatestVersion = V1`, `KnownSchemaVersionProvider`. |
| Inventory | OK | `ProductScopeInventory` con dos tablas LP. |
| Compatibility Gate | OK | Scope aceptado por gate. |
| Bootstrap/migracion V1 | OK | Package V1 sin migraciones, baseline vacio. |
| Tenant | OK | `idEmpresa` obligatorio, FKs/indices tenant-first. |
| Precio 0 | OK | `Precio >= 0`, `NOT NULL`; cero no fallback. |
| NULL/no existente | OK | Ausencia de detalle representa no configurado. |
| Variante + Presentacion | OK | Fuera de V1 por CHECK de identidad. |
| SQL real CheckAppErp | BLOQUEADO | Credencial QA no disponible en entorno. |
| Backlog/tickets posteriores | NO EJECUTADO | Conforme a contrato. |

## 10. Estado final LP-02

LP-02 = IMPLEMENTACION TECNICA LOCAL COMPLETA / LISTA PARA QA SQL REAL CHECKAPPERP CUANDO EL PO PROVEA CREDENCIAL QA.

No ejecutar LP-03, backlog, UI, permisos, menu, Auth, consumidores ni cambios Legacy sin autorizacion expresa PO.
