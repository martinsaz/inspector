# BL-03 FASE A OC-02 - Modelo Schema Ordenes de Compra

Fecha: 2026-09-21

## Alcance Ejecutado

Ticket ejecutado: `BL-03 -> FASE A -> OC-02`.

Decisiones PO aplicadas:

- Inventario V1 por sucursal: aprobado.
- ARQ-01 Alternativa B: aprobada.
- Historico de inventario incompatible: no usar `UNKNOWN`.
- Limpieza solo si existe prueba segura, controlada y trazable.
- No forzar `DELETE` ante riesgo o dependencia.

No se ejecuto UI final, Recepcion, REC-01 ni Legacy.

## BEFORE Real

Base auditada mediante contrato fisico y runner SQL real:

- OrdenesCompra: 43.
- OrdenesCompraDetalle: 88.
- OrdenesCompraPresentacionesCompra antes de primera corrida efectiva: 0 filas, tabla inexistente antes de OC-02.
- Existencias historicas legacy/incompatibles: 1 registro en `ProductosServiciosExistencias`.
- Movimientos de inventario relacionados detectados: 0.
- Dependencias FK directas del registro historico de inventario: 0.
- Partidas OC cuyo `idProductoServicio` ya no existe en `ProductosServicios`: 18.

La evidencia de 18 partidas historicas huerfanas impide exigir FK fisica desde `OrdenesCompraDetalle` hacia `ProductosServicios` sin romper historico. Se conserva `idProductoServicio`, snapshots y validacion de escritura en API; no se borra historico.

## Modelo V1

Scope fisico nuevo: `OrdenesCompra`.

Version: `1`.

Hash del contrato OC-02: `dcccb6270d0642625823ac410a273431368f26d035d21cc28e47fb8301d8af55`.

Tablas del scope:

- `dbo.OrdenesCompra`.
- `dbo.OrdenesCompraDetalle`.
- `dbo.OrdenesCompraFolios`.
- `dbo.OrdenesCompraPresentacionesCompra`.

`OrdenesCompraPresentacionesCompra` queda separada de PresentacionVenta y contiene `idEmpresa`, `identityKey`, producto, variante opcional, nombre, unidad de compra, abreviatura, factor, activo y auditoria. No contiene semantica de precio de venta.

`OrdenesCompraDetalle` queda evolucionada para producto sin variante, producto con variante, servicio y mixta mediante:

- `idVariante`.
- `idPresentacionCompra`.
- snapshots de variante, presentacion y unidad de compra.
- `CantidadCompra`.
- `FactorConversionSnapshot`.
- `CantidadBaseOrdenada`.
- `CantidadBaseRecibidaAcumulada`.
- `CantidadBasePendiente`.
- `EstadoPartida`.

Estados header V1:

- 1 `Borrador`.
- 2 `Generada`.
- 3 `Cancelada`.
- 4 `ParcialmenteRecibida`.
- 5 `Recibida`.

No hay movimiento de inventario en OC-02.

## Versionamiento y Gate

Se agrego soporte del scope `OrdenesCompra` a:

- Inventario de scope.
- Provider de contratos.
- Version provider.
- Bootstrapper.
- Migraciones.
- Gate de compatibilidad.
- Adopcion historica.
- Lock de operacion.
- Paquete de migracion no destructivo.

Resultado SQL real:

- Script OC schema: PASS.
- Primera validacion drift: `SchemaOk`, 0 diferencias.
- Segunda corrida idempotente: `SchemaOk`, 0 diferencias.
- State `OrdenesCompra`: 1.
- History `OrdenesCompra`: 3 registros al cierre de verificacion.
- Attempts `OrdenesCompra`: 3 registros al cierre de verificacion.
- Gate tecnico: compatible por State V1, hash esperado persistido y drift `SchemaOk`.

## Limpieza de Inventario

Inventario historico detectado:

- Tabla `ProductosServiciosExistencias`: 1 registro historico/incompatible con el modelo aprobado por sucursal/variante.

Dependencias:

- FK directas detectadas: 0.
- Movimientos inventario detectados: 0.

Dictamen:

- Limpieza segura: BLOQUEADA.
- Registros eliminados: 0.
- Justificacion: el registro conserva semantica de stock usada por ProductosServicios; aunque no tenga FK/movimientos directos, no hay prueba suficiente de que eliminarlo no produzca regresion o perdida de dato operativo. Por instruccion PO, no se fuerza DELETE.

AFTER:

- `ProductosServiciosExistencias`: 1.
- Registros eliminados: 0.

## Regresion

- OC historicas preservadas: 43.
- Detalles historicos preservados: 88.
- PresentacionesCompra creadas: tabla presente, 0 filas.
- Proveedores: sin cambios de datos.
- Sucursales: sin cambios de datos.
- ProductosServicios: sin DELETE ni limpieza destructiva.
- SEC-01 AuthZ: codigos preservados.
- Legacy: sin modificaciones.
- REC-01: no ejecutado.
- T25: FROZEN.
- Reporte lider: FROZEN.

## Verificacion

- `dotnet test inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --no-restore --filter "FullyQualifiedName~OrdenesCompraSchemaContractTests|FullyQualifiedName~ProveeduriaMenuBuilderTests|FullyQualifiedName~SchemaContractProviderTests|FullyQualifiedName~SchemaMigrationEngineTests" --verbosity minimal`: PASS 55/55.
- `dotnet build inspectorapi/checklistWs.sln --no-restore`: PASS con warnings legacy/preexistentes.
- `dotnet build inspector/checklist.sln --no-restore`: PASS con warnings legacy/preexistentes.
- `git -C inspectorapi diff --check`: PASS.
- `git -C inspector diff --check`: PASS.

## Siguiente Ticket Recomendado

`INV-01 Scope Inventario V1 por Sucursal y Variante; NO EJECUTAR`.

Motivo: OC-02 ya define OC sin mover inventario. REC-01 puede modelar recepcion, pero el impacto de inventario aprobado por PO requiere scope propio para evitar depender de `ProductosServiciosExistencias` historico incompatible.
