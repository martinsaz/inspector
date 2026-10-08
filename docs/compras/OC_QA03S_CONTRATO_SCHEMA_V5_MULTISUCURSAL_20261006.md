#MOKA

# OC-QA03S — Contrato Schema V5 multisucursal por partida

Fecha: 2026-10-06  
Estado: `SUPERSEDED POR OC-QA03S1 / MODELO C APROBADO / SIN SQL REAL`  
Autorización recibida: diseño y package local solamente.  
Autorización no recibida: ejecución DDL, activación V5, UI, Steps 4/5, cambios en Legacy.

> OC-QA03S1 cerró las decisiones de modelo, mutabilidad, archivado y Recepción V2. El contrato vigente está en `OC_QA03S1_CONTRATO_RECEPCION_V2_OC_V5_20261006.md`; los hashes de este expediente quedan superseded.

## 1. Resultado ejecutivo

Se propone el modelo **C: híbrido normalizado**:

1. `OrdenesCompraSucursales` declara el conjunto de sucursales destino válidas de una OC.
2. `OrdenesCompraDetalle.idSucursal NOT NULL` asigna cada partida a exactamente una de esas sucursales.
3. La FK compuesta `(idEmpresa,idOrdenCompra,idSucursal)` impide partidas cross-tenant, de otra OC o de una sucursal no incluida en la orden.

No se crean OCs hijas. Una OC conserva un solo encabezado, múltiples destinos y múltiples partidas; varias partidas pueden compartir sucursal y una misma OC puede distribuirlas entre una o cuatro sucursales —o más— sin ambigüedad.

## 2. Alternativas evaluadas

### A. Agregar únicamente `idSucursal` a `OrdenesCompraDetalle`

Resuelve el destino por renglón, pero no representa explícitamente el conjunto de destinos elegidos para la OC. También obliga a inferir destinos mediante `DISTINCT` sobre partidas y no permite conservar un destino seleccionado antes de capturar una partida.

Dictamen: insuficiente como contrato completo.

### B. Crear únicamente `OrdenesCompraSucursales`

Representa destinos, pero una partida seguiría sin señalar inequívocamente cuál recibe su cantidad. Una tabla puente adicional detalle-sucursal permitiría repartir una sola partida entre sucursales, semántica que Legacy no exige y que complica recepción y cantidades.

Dictamen: insuficiente por sí sola y una relación N:M sería sobre-modelado.

### C. Tabla de destinos + sucursal obligatoria por partida

Representa ambos hechos distintos: qué sucursales pertenecen a la OC y a cuál de ellas pertenece cada partida. Es la opción elegida.

## 3. Contrato físico propuesto

### 3.1 `dbo.OrdenesCompraSucursales` nueva

Campos:

- `id UNIQUEIDENTIFIER NOT NULL`, PK clustered, default `NEWID()`.
- `idEmpresa UNIQUEIDENTIFIER NOT NULL`.
- `identityKey UNIQUEIDENTIFIER NOT NULL`, default `NEWID()`.
- `idOrdenCompra UNIQUEIDENTIFIER NOT NULL`.
- `idSucursal UNIQUEIDENTIFIER NOT NULL`.
- `Activo BIT NOT NULL`, default `1`.
- `FechaCreacion`, `FechaActualizacion`, `FechaArchivado`.
- `idUsuarioCreacion`, `idUsuarioActualizacion`.
- `CorrelationId UNIQUEIDENTIFIER NULL`.

Reglas:

- Único `(idEmpresa,idOrdenCompra,idSucursal)` sin filtro. Una relación archivada se reactiva; no se duplica.
- FK tenant-safe a `OrdenesCompra(idEmpresa,id)`.
- FK tenant-safe a `Sucursales(idEmpresa,id)`.
- Check de baja lógica `Activo/FechaArchivado`.
- Índices por orden, por sucursal y por correlación.

### 3.2 `dbo.OrdenesCompraDetalle`

Se agrega:

- `idSucursal UNIQUEIDENTIFIER NOT NULL`.
- FK `(idEmpresa,idSucursal)` a `Sucursales`.
- FK `(idEmpresa,idOrdenCompra,idSucursal)` a `OrdenesCompraSucursales`.
- Unique `(idEmpresa,id,idSucursal)` preparado para la futura FK compuesta desde Recepción.
- Índice `(idEmpresa,idOrdenCompra,idSucursal)`.

Se preservan íntegramente Tipo Producto/Servicio, ProductoServicio, Variante, PresentaciónCompra, snapshots, cantidades compra/base, recibido, pendiente, costo, importes, estado de partida y baja lógica.

### 3.3 `dbo.OrdenesCompra.idSucursal` V1–V4

No se elimina ni se renombra durante V4→V5. Se vuelve nullable.

- Para filas históricas V1–V4 conserva exactamente su valor original.
- Durante el backfill ese valor origina la única asociación histórica y la sucursal de todas sus partidas.
- Para escrituras V5 nuevas debe permanecer `NULL` y no significa “principal”, “primera” ni “predeterminada”.
- No puede usarse como autoridad por Nueva OC, Recepción ni Inventario V5.

Esto conserva trazabilidad y compatibilidad de lectura histórica sin inventar una sucursal principal.

## 4. Compatibilidad histórica y backfill

La migración propuesta realiza, dentro de la transacción única del runner:

1. Verifica V4 exacto y ausencia total de objetos V5.
2. Rechaza estado parcial/drift.
3. Verifica que toda cabecera V4 tenga sucursal real del mismo tenant.
4. Verifica partidas huérfanas/cross-tenant.
5. Verifica que recepciones históricas sean compatibles con la sucursal V4 de su OC.
6. Toma conteos y sumas de control de cabeceras, partidas, importes, ordenado, recibido y pendiente.
7. Inserta exactamente una fila `OrdenesCompraSucursales` por OC usando `OrdenesCompra.idSucursal`.
8. Agrega `OrdenesCompraDetalle.idSucursal` nullable de manera transitoria y lo llena desde la cabecera de la misma empresa/OC.
9. Rechaza cualquier detalle no poblado; después cambia la columna a `NOT NULL`.
10. Crea FKs/unique/indexes.
11. Cambia la columna histórica de cabecera a nullable.
12. Reconcilia conteos, importes y cantidades antes del commit; cualquier diferencia hace `THROW` y el runner revierte.

No cambia productos, variantes, presentaciones, cantidades, importes, estados, folios ni recepciones. No inventa sucursales. No recalcula negocio.

## 5. Recepción V5 diseñada, no implementada

Una recepción sigue perteneciendo a una sola sucursal. Para habilitar runtime V5, un contrato Recepción V2 separado deberá:

- conservar `Recepciones.idSucursal NOT NULL`;
- hacer FK de `Recepciones(idEmpresa,idOrdenCompra,idSucursal)` a `OrdenesCompraSucursales`;
- agregar `RecepcionPartidas.idSucursal NOT NULL`;
- obligar que la partida recibida coincida simultáneamente con la sucursal de `Recepciones` y con `OrdenesCompraDetalle` mediante FKs compuestas tenant-safe;
- preservar recepción parcial, recepciones sucesivas, no sobre-recepción, `OperationKey`, auditoría y series;
- permitir una partida de Servicio por sucursal, pero exigir `idInventarioMovimiento IS NULL` y no mover inventario;
- para Producto, enviar a Inventario la sucursal de la partida, nunca la sucursal histórica de cabecera.

La propuesta OC V5 no activa escrituras hasta que ese contrato de Recepción sea revisado y aprobado. No se modifica Recepción V1 en este ticket.

## 6. Inventario V5 diseñado, no implementado

Inventario V1 ya dimensiona saldos, movimientos y series por sucursal. La integración futura debe encadenar:

`OC -> OrdenesCompraDetalle.idSucursal -> RecepcionPartidas.idSucursal -> InventarioMovimientos.idSucursal -> InventarioSaldos/InventarioSeries misma sucursal`.

Producto inventariable mueve existencia en esa sucursal. Servicio no crea movimiento, saldo ni serie. Variante, cantidad base, PresentaciónCompra snapshot, seriales e idempotencia permanecen vigentes.

## 7. Package local V4→V5

- MigrationId: `OC-M20261006-V4-V5-MULTISUCURSAL-PARTIDA`.
- SourceVersion: `4`.
- TargetVersion: `5`.
- Baseline: `OC-B20260921`.
- Source manifest: `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`.
- Target manifest: `328f6e4592e2cb4790bffa9d6da3f9613f1e62e69f3bf30b474ad2e03406aaf3`.
- SQL hash SHA-256: `e8617759e3014b03b98b610409c77bdc64b0a533d02df39a21974d2157e52db6`.
- TransactionMode: `SingleTransaction`.
- `SET XACT_ABORT ON`.
- `ApprovedForExecution=false`.
- `AutoApplicable=false`.
- ApprovedMigrationIds: vacío.
- Segunda ejecución directa sobre objetivo completo: `RETURN` sin DDL/DML.
- Estado parcial/drift: rechazo `OC_V5_PARTIAL_OR_DRIFTED_TARGET_REJECTED`.
- Fallo de reconciliación: `THROW` antes de que el runner pueda hacer commit.

El package vive únicamente en `OrdenesCompraV5ContractProposal`. No está registrado en el provider activo, no modifica `OrdenesCompraLatestVersion=4` y el resolver oficial lo rechaza con `MIGRATION_NOT_AUTO_APPLICABLE`.

## 8. Pruebas locales obligatorias

El set `OrdenesCompraV5ContractProposalTests` cubre:

- una OC con 1 sucursal;
- una OC con 4 sucursales;
- múltiples partidas de una sucursal y partidas distribuidas;
- Producto, Servicio, Variante, PresentaciónCompra y OC mixta preservados;
- cross-tenant, sucursal ajena e incompatibilidad detalle/sucursal mediante FKs compuestas;
- backfill histórico desde cabecera;
- recepción sobre la sucursal de la partida;
- inventario sobre la sucursal de la partida y cero movimiento para Servicio;
- segunda corrida SQL no-op;
- rechazo de objetivo parcial/drift;
- bloqueo efectivo del package por falta de aprobación PO.

Resultados al cerrar documento:

- propuesta OC V5: `14/14 PASS`;
- OC + Recepción + Inventario + motor de migraciones: `73/73 PASS`;
- suite completa: `867/868 PASS`, con el único fallo preexistente y fuera de alcance `ListaPreciosMatrixSqlIntegrationTests.ConsultaMatricialReal_MaterializaTodasLasIdentidadesYDiezNiveles`;
- `git diff --check`: PASS en API y MVC.

## 9. Fuera de alcance preservado

- UI MVC: sin cambios OC-QA03S.
- Steps 4/5: no implementados.
- Legacy: read-only, sin cambios.
- Curvas, Siembra, Huecos/Copetes, ListaPrecios, ProductosServicios funcional y Auth: sin cambios OC-QA03S.
- CHECKAPPERP/UMBRELLA: sin DDL, sin migración, sin datos modificados.

## 10. Decisiones PO aún pendientes

1. Aprobar, corregir o rechazar el modelo C y la política de cabecera histórica nullable/no autoritativa.
2. Autorizar o no un contrato Recepción V2 coordinado antes de activar escrituras V5.
3. Definir si la asignación de sucursal de una partida puede cambiar sólo en Borrador; recomendación técnica: nunca después de generar ni después de una recepción.
4. Definir política de archivado/reactivación de destinos; recomendación técnica: no archivar mientras existan partidas activas o recepciones.
5. Autorizar en ticket separado la activación de V5 y la ejecución real, después de preflight read-only en cada base.

#MOKA

TICKET:
OC-QA03S

MODELO_PROPUESTO:
- C) `OrdenesCompraSucursales` + `OrdenesCompraDetalle.idSucursal NOT NULL` con FK compuesta.

JUSTIFICACION:
- Separa destinos válidos de asignación por partida, conserva una sola OC y evita inferencias o sucursal principal inventada.

TABLAS_NUEVAS:
- `dbo.OrdenesCompraSucursales`.

COLUMNAS_NUEVAS:
- `dbo.OrdenesCompraDetalle.idSucursal UNIQUEIDENTIFIER NOT NULL`.

CAMBIOS_EN_CABECERA:
- `OrdenesCompra.idSucursal` se conserva, pasa a nullable y queda sólo como dato histórico V1–V4; V5 nuevo escribe NULL y nunca lo usa como autoridad.

FK_Y_CONSTRAINTS:
- Tenant-safe OC→destinos, destino→Sucursal y detalle→(empresa, OC, sucursal); unique empresa/OC/sucursal, baja lógica e índices de operación/auditoría.

BACKFILL_V1_V4:
- Una asociación por cabecera y todas sus partidas con la misma sucursal histórica; sin alterar negocio ni inventar sucursales.

RECEPCION_V5:
- Requiere Recepción V2 separada antes de runtime: recepción de una sucursal y partidas obligatoriamente de esa misma sucursal.

INVENTARIO_V5:
- Producto usa sucursal de partida; Servicio no mueve inventario; cabecera prohibida como fuente V5.

TENANT_SAFETY:
- `idEmpresa` participa en todas las FKs de negocio; no se acepta autoridad del cliente.

IDEMPOTENCIA:
- Package oficial sigue V4; propuesta rechazada por resolver. SQL propuesto retorna no-op sólo ante objetivo V5 completo y rechaza cualquier parcial/drift.

MIGRATION_ID_PROPUESTO:
- `OC-M20261006-V4-V5-MULTISUCURSAL-PARTIDA`.

HASH_PROPUESTO:
- Manifest V5 `328f6e4592e2cb4790bffa9d6da3f9613f1e62e69f3bf30b474ad2e03406aaf3`; SQL `e8617759e3014b03b98b610409c77bdc64b0a533d02df39a21974d2157e52db6`.

PRUEBAS_DISEÑADAS:
- 14/14 focal y 73/73 regresión contractual PASS; incluidos 1/4 destinos, detalle, mixto, tenant, backfill, Recepción, Inventario, no-op y drift. Full 867/868 con único fallo ListaPrecios preexistente/fuera de alcance.

RIESGOS:
- Activar OC V5 sin Recepción V2 permitiría incoherencia runtime; consumidores que sigan leyendo cabecera perderían autoridad; cambio de sucursal tras recepción corrompería trazabilidad.

DECISIONES_PO_PENDIENTES:
- Aprobación del modelo/política de cabecera, contrato Recepción V2, mutabilidad/archivado y autorización separada de activación/ejecución.

SQL_REAL_EJECUTADO:
NO

UI_MODIFICADA:
NO

LISTO_PARA_IMPLEMENTAR_V5:
NO — pendiente revisión/decisión PO y contrato Recepción V2.

SIGUIENTE_PASO:
REVISIÓN PO DEL CONTRATO V5.
