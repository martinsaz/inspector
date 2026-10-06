# LP-20B - Schema y versionado Cotizaciones consumidor LP-08

Fecha de cierre local: 2026-10-01

Estado: CERRADO / SQL REAL CERTIFICADO POR LP-20C4

## 1. Alcance ejecutado

Se implemento localmente el contrato fisico y versionado del scope `Cotizaciones`. No se ejecuto SQL, DDL, migracion de tenant, integracion LP-08 runtime, cambio de UI ni cambio del tenant resolver productivo.

## 2. Decisiones PO FROZEN

- Lista: nivel 1 preseleccionado, seleccion 1..10 solo en borrador, contexto en encabezado y snapshot en partida; sin Cliente-Lista o Sucursal-Lista.
- Override: solo autorizado y auditado; preserva precio LP-08, precio aplicado, usuario, fecha y motivo.
- Descuento: `DescuentoListaPct` es snapshot LP-08 y `DescuentoPct` es descuento adicional Cotizaciones sobre `PrecioUnitario`; 0..100, REJECT fuera de rango.
- Cambio de lista: solo borrador, confirmado por usuario y con re-resolucion; override requiere confirmacion explicita.
- Clonado: oferta nueva, referencia al origen y re-resolucion LP-08; comparativo requerido en implementacion futura.
- Borradores: identidad estable, INSERT/UPDATE/baja logica y auditoria propia; no usar `ListaPreciosHistorial`.

## 3. Scope e infraestructura

- Scope oficial: `DatabaseScopes.Cotizaciones`.
- Inventory V2: `dbo.Cotizaciones`, `dbo.CotizacionesPartidas`, `dbo.CotizacionesHistorial`.
- Provider: V1 y V2 mediante `CotizacionesSchemaContractFactory`.
- Version conocida: 2.
- Baseline: `COTIZACIONES_V1_HISTORICAL_BASELINE`.
- Runner, History, Attempts, drift y Compatibility Gate: infraestructura oficial existente, sin runner paralelo.
- Gate: V2 es version compatible; Empty/Partial/Drift/Future/Unknown fallan cerrado. No se conecto aun al `CotizacionesController`.

## 4. V1 historico exacto

V1 representa el DDL fisico certificado de las tablas existentes, sin agregar objetos deseados:

- `dbo.Cotizaciones`: 26 columnas, PK `PK_Cotizaciones`, indices `UX_Cotizaciones_Empresa_Folio` e `IX_Cotizaciones_Empresa_Fecha_Estado`; sin FK ni checks.
- `dbo.CotizacionesPartidas`: 26 columnas, PK `PK_CotizacionesPartidas`, indice `IX_CotizacionesPartidas_Cotizacion_Numero`; sin FK ni checks.
- Hash V1: `b12ba03b8757a01a3922ca6bc8f75d451233336dc5d96309e4ca10233244aaa7`.

La adopcion historica acepta solamente esas dos tablas completas, DatabaseIdentity valida y drift cero. El inventory parcial esperado por la tabla V2 nueva se reconoce solo cuando los objetos existentes coinciden exactamente con V1. Un V1 incompleto, con drift o hash inesperado falla cerrado.

## 5. V2 encabezado

`dbo.Cotizaciones` agrega nullable, sin defaults comerciales:

- `idListaPrecio UNIQUEIDENTIFIER`;
- `ListaPrecioNivel TINYINT`;
- `idCotizacionOrigen UNIQUEIDENTIFIER`.

El check exige lista e nivel ambos NULL para historicos o lista presente con nivel 1..10. Las FK de lista y clon son tenant-safe por `(idEmpresa, id)`.

## 6. V2 partida y snapshot

`dbo.CotizacionesPartidas` conserva `idProductoServicio`, `PrecioUnitario`, `DescuentoPct` y `Activo`, y agrega nullable:

- identidad: `TipoIdentidad`, `idVariante`, `idPresentacionVenta`;
- lista: `idListaPrecio`, `ListaPrecioNivel`;
- LP-08: `PrecioBase`, `PrecioLista`, `OrigenPrecio`, `DescuentoListaPct`, `SubtotalAntesRedondeo`, `RedondeoModo`, `PrecioFinal`, `VigenciaInicio`, `VigenciaFin`, `ReglaVersion`, `FechaResolucionUtc`, `CorrelationId`;
- override: `PrecioOverride`, `MotivoPrecioOverride`, `idUsuarioPrecioOverride`, `FechaPrecioOverrideUtc`.

`PrecioUnitario` representa `PrecioAplicado`; no se creo columna redundante. `Activo` soporta la futura baja logica.

## 7. Reglas V2

- Producto, Servicio, Variante y PresentacionVenta tienen formas exclusivas.
- Lista permite 1..10.
- Precios permiten `0.00` y rechazan negativos.
- Descuentos Lista y Cotizaciones permanecen separados y aceptan 0..100.
- Redondeo acepta 0, 1 o 2.
- Vigencia exige inicio menor o igual a fin cuando ambos existen.
- Override 1 exige motivo no vacio, usuario y fecha; override 0 no admite metadatos.
- `ReglaVersion IS NULL` conserva PRE_LP08 con campos nuevos NULL.
- `ReglaVersion IS NOT NULL` exige identidad, lista, precio base/final, origen, subtotal, redondeo, fecha, correlacion y estado de override.

## 8. Auditoria propia

V2 agrega `dbo.CotizacionesHistorial`, append-only y sin columna `Activo`. Puede registrar alta, cantidad, identidad, lista, resolucion, override, descuento adicional, baja y clon/re-resolucion. Conserva tenant, cotizacion, partida opcional, campo, valores, actor, motivo, correlacion y fecha UTC. No reutiliza ni modifica `ListaPreciosHistorial`.

## 9. FK e indices

- Se agregan claves unicas tenant-safe `(idEmpresa, id)` en encabezado y partida.
- Las FK de cotizacion, lista, producto, variante, presentacion, clon e historial incluyen `idEmpresa`.
- Se preservan los tres indices historicos.
- Se agregan indices empresa/lista/activo, empresa/lista/identidad LP08 e historial por cotizacion/fecha y correlacion.

## 10. Migracion preparada

- MigrationId: `COT-M20260930-V1-V2-LP08-SNAPSHOT`.
- SourceContract: Cotizaciones V1.
- TargetContract: Cotizaciones V2.
- Hash V2: `e936afda626b83bafbc3c09091f721c94bffaa0957ef96f00fad9c0a38c1c8da`.
- Package: aditivo, `SingleTransaction`, sin `GO`, sin DML sobre filas comerciales.
- Idempotencia: columnas, tabla, checks, indices y FK se crean solo si faltan; runner devuelve `NO_PENDING_MIGRATIONS` al estar en V2.
- Recovery: `ReconcileAfterUncertainCommit`; rollback transaccional ante fallo previo al commit.
- SQL real ejecutado: NO.

## 11. Historicos

- 19 cotizaciones y 70 partidas certificadas permanecen preservables.
- Clasificacion: PRE_LP08.
- Backfill comercial: NO.
- Valores comerciales modificados: 0.
- Todos los campos nuevos quedan NULL en historicos; no se inventan lista, identidad extendida, precios, origen, redondeo, vigencias, regla o correlacion.

## 12. Pruebas y builds

- Contrato/adopcion focal: 32/32 PASS.
- `SchemaMigrationEngineTests`: 35/35 PASS.
- `ListaPreciosServiceTests`: 129/129 PASS.
- Full suite: 725/725 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- ListaPrecios V2 hash preservado: `e7a388ec985a19fb2b3beb73e8c2cf28d5dda17d3f3bb2f0363683c166092882`.

## 13. Protecciones

- `CotizacionesController`, modelos runtime, MVC y UI funcional: sin cambios.
- `Program.cs`, DI y tenant resolver productivo: sin cambios.
- SQL/DDL real, UMBRELLA y CHECKAPPERP: sin cambios.
- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: FROZEN, sin cambios LP-20B.
- Auth/Login/Firebase, ListaPrecios, Inventario, ProductosServicios, Ventas, Facturacion y Legacy: preservados.
- LP-21 y LP-22: no ejecutados.

## 14. Dictamen

`LP-20B = CERRADO / CONTRATO FISICO COTIZACIONES V2 IMPLEMENTADO LOCALMENTE / SCOPE + VERSIONADO + MIGRATION PACKAGE LISTOS / SQL REAL PENDIENTE DE AUTORIZACION`

Siguiente paso: revision PO. No ejecutar SQL real ni integrar Cotizaciones con LP-08 todavia. No ejecutar LP-21 ni LP-22.

## 15. LP-20C4 - Reconciliacion oficial V1/V2 y certificacion SQL real

LP-20C3 demostro con el script historico `checklist/docs/agentes/sql/cotizaciones-up.sql` y el commit `83a2b21` del 2026-08-11 que `IX_Cotizaciones_Empresa_Cliente` y `FK_CotizacionesPartidas_Cotizaciones` pertenecen al baseline historico real. El V1 original los omitio por error. La correccion no es una evolucion comercial: V1 y V2 preservan ambos objetos, y V2 conserva ademas la FK tenant-safe compuesta.

- V1 hash anterior: `b12ba03b8757a01a3922ca6bc8f75d451233336dc5d96309e4ca10233244aaa7` (`SUPERSEDED_BY_BASELINE_CORRECTION`).
- V1 hash vigente: `ae905dfc622135c5858fdf2c551287b38193fe3f92d4ccbe61eec374a1deb9b8`.
- V2 hash anterior: `e936afda626b83bafbc3c09091f721c94bffaa0957ef96f00fad9c0a38c1c8da` (`SUPERSEDED_BY_BASELINE_CORRECTION`).
- V2 hash vigente: `5310c00e5991ed0e1c06bc84560a7d94b861b8ab1e310ad395a0303e9426e765`.
- ListaPrecios V2 permanece `e7a388ec985a19fb2b3beb73e8c2cf28d5dda17d3f3bb2f0363683c166092882`.

El package `COT-M20260930-V1-V2-LP08-SNAPSHOT` usa SourceContract V1 y TargetContract V2 corregidos. La reconciliacion tecnica `COT-M20261001-V2-RECONCILE-HISTORICAL-OBJECTS` mantiene version comercial 2 y aplica unicamente a State V2 con el hash superseded autorizado; agrega los dos objetos si faltan, sin DROP, DML comercial, backfill ni reset.

CHECKAPPERP fue reconciliado por el runner oficial: Version 2, hash V2 vigente, `SchemaOk/0`, Gate `COMPATIBLE`, indice historico, FK historica y FK tenant-safe presentes, y segunda corrida `NO_PENDING_MIGRATIONS`.

UMBRELLA 163 resolvio la DatabaseIdentity esperada por Firebase/tenant resolver normal. V1 corregido fue exacto y adoptado; la migracion V1→V2 fue PASS. Permanecen 19 cotizaciones y 70 partidas activas, fingerprint comercial BEFORE=AFTER, campos LP-08 historicos NULL, PRE_LP08 preservado y backfill 0. Ambas FK estan enabled/trusted y sin cascadas; gates Cotizaciones y ListaPrecios `COMPATIBLE`; segunda corrida `NO_PENDING_MIGRATIONS`.

Regresion LP-20C4: Cotizaciones 29/29, bootstrap 38/38, adoption 9/9, runner 36/36, ListaPrecios 129/129, full suite 740/740 y builds API/MVC PASS. Runtime Cotizaciones, tenant resolver, UI, Auth y archivos protegidos no fueron modificados. LP-21 y LP-22 no fueron ejecutados.

Dictamen: `LP-20C = CERRADO / BASELINE HISTORICO RECONCILIADO / COTIZACIONES V2 SQL REAL CERTIFICADO / CHECKAPPERP PASS / UMBRELLA PASS / PRE_LP08 PRESERVADO / LISTO PARA INTEGRACION RUNTIME`.
