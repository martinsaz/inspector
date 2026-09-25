# BL-03 FASE C OC-CUR-02 - Schema versionado Curvas + Siembra

Fecha: 2026-09-23

Estado: `CERRADO / PASS TECNICO SQL REAL CHECKAPPERP`

Modo: implementacion tecnica de contrato/schema. Sin UI final, sin motor
Huecos/Copetes OC-CUR-03, sin Legacy Tarahumara, sin PresentacionVenta, sin
permisos navegables nuevos.

## 1. Alcance cerrado

OC-CUR-02 materializa el contrato tecnico para Curvas V1 en CheckApp:

- Scope independiente `Curvas`.
- Catalogo de Curvas.
- Detalle por `ProductoServicioId + VarianteId nullable`.
- Siembra por `SucursalId + ProductoServicioId + VarianteId nullable`.
- Operacion agrupadora multisucursal.
- Relacion operacion -> OCs hijas independientes.
- Snapshot minimo de sugerencia.
- Contrato `PresentacionCompra` cerrada/libre mediante flag versionado.
- EMPTY bootstrap, migration package, locking, idempotencia, State/History,
  Attempts, drift y CompatibilityGate por scope.

No se implemento UI, endpoints finales navegables ni calculo OC-CUR-03.

## 2. Versiones y hashes

| Scope | Version vigente | Hash |
| --- | ---: | --- |
| Curvas | 1 | `85167e40a617c4535514563c03cfd3c49ec5c0f915f122b0d0c533779e88d4f5` |
| OrdenesCompra | 2 | `0977353cc806ec35d21c95c4149e16cdf41b3480d52b929b13ec82185957e802` |

Curvas V1 nace como scope nuevo con `CUR-B20260923` y bootstrap EMPTY. No
requiere migraciones internas iniciales.

OrdenesCompra V2 conserva V1 disponible e incorpora una migracion secuencial:

`OC-M20260923-V1-V2-PRESENTACIONCOMPRA-CANTIDAD-BASE`

Objeto afectado:

`dbo.OrdenesCompraPresentacionesCompra.PermiteCantidadBase`

Regla de default: `0`, que significa compra por multiplos cerrados para
presentaciones existentes. No toca `PresentacionesVenta`.

## 3. Modelo Curvas V1

Tablas contractuales:

- `dbo.CurvasCatalogo`
- `dbo.CurvasDetalle`
- `dbo.CurvasSiembra`
- `dbo.CurvasOperacionesCompra`
- `dbo.CurvasOperacionOrdenesCompra`
- `dbo.CurvasSugerenciasSnapshot`

Todas incluyen `idEmpresa` contractual y constraints tenant-safe.

### Catalogo

`CurvasCatalogo` define la curva reutilizable, estado activo/inactivo, codigo
opcional, baja logica y auditoria. Las curvas inactivas preservan historicos y
no deben usarse para nueva siembra.

### Detalle

`CurvasDetalle` define objetivo en unidad base para producto y variante nullable.
`TipoProductoServicio = 1` es check contractual. Servicios fallan cerrado.
`PresentacionCompra` no es dimension de curva.

### Siembra

`CurvasSiembra` asigna una curva a sucursal + producto + variante nullable.
Tiene unicidad vigente por empresa/sucursal/producto/variante donde
`Estado = 1 AND FechaVigenciaFin IS NULL`. Reemplazar siembra cierra la vigente
sin reescribir OCs historicas.

### Operacion agrupadora

`CurvasOperacionesCompra` representa la captura multisucursal y no sustituye a
`OrdenesCompra`. Tiene `OperationKey` unico por tenant, proveedor, conteos,
estado tecnico y FK tenant-safe a `ActivosProveedores`.

`CurvasOperacionOrdenesCompra` relaciona la operacion con cada OC hija. Cada OC
hija conserva su sucursal, folio, estado, partidas, recepcion e inventario.

### Snapshot

`CurvasSugerenciasSnapshot` persiste contexto minimo por sugerencia:
operacion, OC, detalle, curva, siembra, sucursal, producto, variante, modo,
objetivo, existencia, transito, cobertura, hueco, copete, propuesta, final,
override manual, no pedir, `PresentacionCompra`, flag `PermiteCantidadBase`,
fecha, usuario y contexto JSON.

El snapshot es historico. OC-CUR-03 calculara los valores; OC-CUR-02 solo deja
contrato y persistencia tecnica.

## 4. PresentacionCompra cerrada/libre

OrdenesCompra V2 agrega `PermiteCantidadBase bit NOT NULL DEFAULT ((0))` en
`OrdenesCompraPresentacionesCompra`.

Semantica aprobada:

- `PermiteCantidadBase = 0`: presentacion exige multiplos cerrados; OC-CUR-03
  debe redondear sugerencia hacia arriba.
- `PermiteCantidadBase = 1`: permite cantidad exacta en unidad base; OC-CUR-03
  conserva cantidad exacta.
- En ambos casos el usuario conserva `CantidadFinal`.

## 5. Servicios

Servicios siguen permitidos en OC mixta, pero quedan fuera de Curvas V1.

El contrato aplica `TipoProductoServicio = 1`; el servicio tecnico valida
producto activo y rechaza servicio con `CURVA_SERVICIO_RECHAZADO` en detalle,
siembra y snapshot.

## 6. Multitenant, idempotencia y locking

La infraestructura existente de schema fue extendida para `Curvas`:

- `KnownSchemaVersionProvider`
- `ProductScopeInventory`
- `ProductosServiciosSchemaContractProvider`
- `ProductosServiciosSchemaBootstrapper`
- `ProductosServiciosHistoricalBaselineAdopter`
- `SchemaMigrationRunner`
- `SqlSchemaOperationLock`
- `ProductosServiciosCompatibilityGate`

El locking se mantiene por `DatabaseIdentity + Scope`. La operacion agrupadora
usa `OperationKey` unico por tenant. La relacion operacion -> OC evita duplicar
la misma OC. La siembra vigente tiene unicidad por tenant/sucursal/producto/
variante.

## 7. API tecnica minima

Se agregaron modelos y servicio tecnico:

- `CurvasScopeModels.cs`
- `CurvasScopeService.cs`
- `ICurvasScopeService`

No se agregaron endpoints finales ni UI. El servicio valida `idEmpresa`,
producto, variante, sucursal, proveedor, OC, detalle OC, siembra, curva y
presentacion compra cuando aplican.

## 8. QA SQL real CheckAppErp

Certificacion definitiva ejecutada el 2026-09-23 contra SQL Server QA real
`CheckAppErp`, usando credencial PO temporal solo en memoria. No se persistio
connection string, usuario, password ni secreto en archivos del repo, docs,
configuracion, Git ni logs de evidencia.

Identidad saneada:

`VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`

Resultado versionado:

- Scope `Curvas`: version `1`, hash
  `85167e40a617c4535514563c03cfd3c49ec5c0f915f122b0d0c533779e88d4f5`.
- `Curvas` segunda corrida: `ALREADY_PROVISIONED`.
- `Curvas` State/History/Attempts: presentes; History PASS `1`; Attempts `4`.
- `Curvas` drift: `SchemaOk/0`.
- `Curvas` CompatibilityGate: `COMPATIBLE`.
- Scope `OrdenesCompra`: version `2`, hash
  `0977353cc806ec35d21c95c4149e16cdf41b3480d52b929b13ec82185957e802`.
- `OrdenesCompra` segunda corrida: `NO_PENDING_MIGRATIONS`.
- `OrdenesCompra` drift: `SchemaOk/0`.
- `OrdenesCompra` CompatibilityGate: `COMPATIBLE`.
- Columna `OrdenesCompraPresentacionesCompra.PermiteCantidadBase`: presente.

Fixtures reales reversibles:

- Curva creada.
- Detalle de producto sin variante creado.
- Detalle de producto con variante creado.
- Servicio rechazado con `CURVA_SERVICIO_RECHAZADO`.
- Variante invalida rechazada con `CURVA_VARIANTE_NO_DISPONIBLE`.
- Siembra creada y unicidad vigente demostrada.
- Operacion agrupadora creada.
- `OperationKey` idempotente demostrado.
- Relacion operacion -> OC fixture creada.
- Snapshot creado para presentacion cerrada.
- Snapshot creado para presentacion libre.
- Cross-tenant fail closed con `CURVA_NO_DISPONIBLE`.

Cleanup:

- Curvas fixtures: `0`.
- Detalles fixtures: `0`.
- Siembras fixtures: `0`.
- Operaciones fixtures: `0`.
- Relaciones fixtures: `0`.
- Snapshots fixtures: `0`.
- Fixtures de soporte: `0`.
- Conteos historicos preservados: PASS.

Nota tecnica de compatibilidad SQL Server:

Durante la certificacion real SQL Server materializo un `CHECK` de vigencia con
orden equivalente de expresiones `OR` sobre `Estado`. Se ajusto unicamente la
normalizacion del validador de definiciones para comparar de forma estable
expresiones equivalentes `IN (2, 3)` contra `Estado = 3 OR Estado = 2`. No se
relajo el contrato ni se omitio validacion de constraints.

El contrato de `CurvasOperacionesCompra` conserva validacion funcional de
proveedor por `idEmpresa + idProveedor + Activo`; no declara FK fisica compuesta
contra `ActivosProveedores` porque el contrato real de Proveedores mantiene PK
fisica por `id` y unicidad de negocio separada.

## 9. QA local/regresion

Certificacion local ejecutada antes del cierre real:

- Contrato Curvas V1.
- Contrato OrdenesCompra V2.
- Migracion real declarada de OC V1 -> V2.
- Curvas como EMPTY bootstrap.
- Inventario de tablas por scope.
- Multitenant por columnas/FK/UNIQUE.
- PresentacionCompra cerrada/libre.
- `dotnet test` focalizado: 15/15 PASS.

La corrida final de regresion completa queda documentada en el cierre de tarea
OC-CUR-02R: full suite API, build MVC/API, `git diff --check`, secret scan y
puertos.

## 10. No ejecutado por diseno

- No UI Curvas/Siembra/Huecos.
- No OC-CUR-03.
- No motor Huecos/Copetes.
- No PresentacionVenta.
- No permisos navegables definitivos.
- No Legacy Tarahumara.
- No datos reales ni fixtures SQL reales.

## 11. Siguiente ticket

`OC-CUR-03 - Motor Huecos/Copetes/sugerencias`.

Debe usar este schema, Inventario V1, Recepcion V1, OrdenesCompra V2,
PresentacionCompra cerrada/libre y snapshots. No queda autorizado por este
documento a ejecutarse automaticamente.
