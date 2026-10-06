# LP-QA05S — Contrato de datos adicionales y promociones

Fecha: 2026-10-05

Estado: **CONTRATO V3 CERRADO / SQL REAL CERTIFICADO / RUNTIME V3 ACTIVADO / PERSISTENCIA UI NO INTEGRADA**

## Actualización LP-QA05S3

LP-QA05S3 corrige y sustituye el artefacto ejecutable original. El hash final vigente es `0ce8a1e391f89577ce20a0e29f5a048b48109a93951346a395b5618073b794e5`; el hash `086c8e7fe0aced219dda9e3937ac0ddc2299c27b202ec2827c5eeda3916b732d` queda `SUPERSEDED`. CHECKAPPERP y UMBRELLA fueron migradas por el runner oficial, certificadas con drift 0 y activadas en runtime V3. Las restricciones históricas de “SQL no ejecutado” contenidas más abajo describen el estado previo a LP-QA05S3 y ya no son el estado vigente.

La activación física no integra todavía la persistencia del modal Datos adicionales/Promociones y no constituye aprobación PO ni FROZEN definitivo.

Continuidad: LP-QA05 permanece en **STOP PO SCHEMA**.

## 1. Alcance y límites

Este documento define el contrato físico para los datos adicionales y las cuatro banderas promocionales visibles en `Editar precios`. LP-QA05S1 materializa DDL sólo dentro del package local preparado; no autoriza:

- ejecución DDL o DML contra CHECKAPPERP, UMBRELLA u otra base;
- activación del release V3 en el runner runtime;
- cambio de la versión oficial vigente;
- persistencia runtime;
- consumo en Ventas o un motor promocional;
- cambios visuales al modal de LP-QA05.

El contrato y el package V3 están modelados con la infraestructura oficial para calcular manifest, validar constraints y probar resolución/drift. El package preparado permanece fuera de `GetPackage(ProductosServicios)` hasta autorización SQL, por lo que `SchemaMigrationRunner` runtime sigue limitado al release V2.

## 2. Evidencia auditada

### Legacy Rarámuri / sazapi

La pantalla Legacy `/productos/lista-precios` carga y guarda los datos por `Barcode`:

- Rarámuri inicializa `Descripción`, `Web`, `Liverpool`, `ML`, `Observaciones` y las cuatro banderas desde el artículo abierto, y las envía juntas al guardar.
- sazapi resuelve `Descripción` desde `dbo.articulo.descri`.
- sazapi resuelve `Web`, `Liverpool`, `ML` y `Observaciones` desde `dbo.ArticuloExt`, enlazada por `Barcode`.
- sazapi resuelve `dosporuno`, `trespordos`, `descuentosegundo` y `monedero` desde `dbo.articulo`.
- esas banderas no incluyen `idListaPrecio`, sucursal, vigencia, porcentaje, prioridad ni acumulabilidad.
- P1..P10 y D1..D10 viven en `dbo.precios`; las cuatro banderas se actualizan aparte en `dbo.articulo`.

Conclusión: la semántica demostrada es **configuración por artículo**, independiente de lista, sucursal y vigencia. Legacy no demuestra por sí mismo la semántica CheckApp para Servicio, Variante o PresentacionVenta.

### CheckApp actual

- `dbo.ProductosServicios.Descripcion` ya es la fuente canónica, nullable `NVARCHAR(MAX)`.
- `dbo.ProductosServiciosVariantes` y `dbo.ProductosServiciosPresentacionesVenta` no tienen descripción propia.
- el modelo CheckApp reconoce cuatro identidades vendibles: Producto, Servicio, Variante y PresentacionVenta.
- `dbo.ListaPreciosPromociones` V2 pertenece al dominio ListaPrecios: incluye lista, identidad, vigencia y una semántica distinta. No modela Monedero y `DescuentoSegundoPct` es un porcentaje, no la bandera Legacy.
- no existe historial comercial certificado en ProductosServicios equivalente a los nueve campos de este ticket.

## 3. Decisión de ownership

### Descripción

Se conserva exclusivamente en `ProductosServicios.Descripcion`; no se duplica en ListaPrecios ni en la extensión comercial.

Resolución por identidad:

| Identidad | Lectura | Escritura propuesta |
|---|---|---|
| Producto | `ProductosServicios.Descripcion` | Directa sobre su producto, con permiso 05001009 y auditoría comercial. |
| Servicio | `ProductosServicios.Descripcion` | Directa sobre su servicio, con permiso 05001009 y auditoría comercial. |
| Variante | Descripción heredada del producto padre. | Read-only; no modifica el padre y no tiene columna propia. |
| PresentacionVenta | Descripción heredada del producto padre. | Read-only; no modifica el padre y no tiene columna propia. |

No se inventa `Descripcion` en Variante o PresentacionVenta.

### Datos adicionales y promociones

El ownership canónico propuesto es ProductosServicios, mediante una tabla de extensión de identidad vendible: `dbo.ProductosServiciosIdentidadComercial`.

Motivos:

- los datos describen/configuran una identidad vendible, no una lista de precios;
- una fila única por identidad evita duplicar Web, Liverpool, Mercado Libre, Observaciones y banderas por cada P1..P10;
- la clave polimórfica sigue exactamente el patrón tenant-safe de `ListaPreciosDetalle`;
- permite soportar las cuatro identidades sin agregar columnas arbitrarias a sus tablas base;
- conserva intacta `ListaPreciosPromociones`.

Cardinalidad: cero o una fila activa por `(idEmpresa, identidad vendible)`. La ausencia de fila significa “sin datos adicionales y banderas desactivadas”; no obliga a crear filas históricas.

## 4. Aplicabilidad por identidad

| Identidad | Datos adicionales | Banderas promocionales | Estado funcional |
|---|---|---|---|
| Producto | El contrato físico los soporta. | El contrato físico las soporta. | Semántica equivalente más cercana al artículo Legacy. |
| Servicio | Configuración propia. | Configuración propia. | Aprobado contractualmente; runtime aún no integrado. |
| Variante | Configuración propia. | Configuración propia. | Sin herencia ni fallback desde Producto. |
| PresentacionVenta | Configuración propia. | Configuración propia. | Sin herencia ni fallback desde Producto. |

El soporte físico no decide herencia, precedencia ni fallback. Esas reglas no se infieren en LP-QA05S.

## 5. Contrato físico final

Scope propietario: `ProductosServicios`.

SourceContract: ProductosServicios V2.

TargetContract: ProductosServicios V3.

MigrationId reservado: `PS-M20261005-V2-V3-IDENTIDAD-COMERCIAL`.

### 5.1 dbo.ProductosServiciosIdentidadComercial

| Columna | Tipo | Null | Default | Regla |
|---|---|---:|---|---|
| id | UNIQUEIDENTIFIER | No | NEWID() | PK clustered. |
| idEmpresa | UNIQUEIDENTIFIER | No | — | Tenant obligatorio. |
| identityKey | UNIQUEIDENTIFIER | No | NEWID() | Identidad estable de la fila de extensión. |
| TipoIdentidad | TINYINT | No | — | 1 Producto, 2 Servicio, 3 Variante, 4 PresentacionVenta. |
| idProductoServicio | UNIQUEIDENTIFIER | No | — | Siempre identifica el padre/base. |
| TipoProductoServicio | TINYINT | No | — | 1 Producto, 2 Servicio. |
| idVariante | UNIQUEIDENTIFIER | Sí | — | Sólo para TipoIdentidad 3. |
| idPresentacionVenta | UNIQUEIDENTIFIER | Sí | — | Sólo para TipoIdentidad 4. |
| Web | NVARCHAR(250) | Sí | — | Dato adicional. |
| Liverpool | NVARCHAR(MAX) | Sí | — | Dato adicional. |
| MercadoLibre | NVARCHAR(MAX) | Sí | — | Dato adicional; nombre CheckApp, no `ML`. |
| Observaciones | NVARCHAR(MAX) | Sí | — | Dato adicional. |
| DosPorUno | BIT | No | 0 | Bandera de configuración. |
| TresPorDos | BIT | No | 0 | Bandera de configuración. |
| DescuentoSegundo | BIT | No | 0 | Bandera; no porcentaje. |
| Monedero | BIT | No | 0 | Bandera; no motor de monedero. |
| Activo | BIT | No | 1 | Baja lógica. |
| FechaCreacion | DATETIME2(0) | No | SYSUTCDATETIME() | UTC. |
| FechaActualizacion | DATETIME2(0) | No | SYSUTCDATETIME() | UTC. |
| FechaArchivado | DATETIME2(0) | Sí | — | Requerida al archivar. |
| idUsuarioCreacion | UNIQUEIDENTIFIER | Sí | — | Actor si está disponible. |
| idUsuarioActualizacion | UNIQUEIDENTIFIER | Sí | — | Último actor si está disponible. |
| idUsuarioArchivado | UNIQUEIDENTIFIER | Sí | — | Actor de baja lógica. |

PK: `PK_ProductosServiciosIdentidadComercial (id)`.

FK tenant-safe:

- `(idEmpresa, idProductoServicio)` → `ProductosServicios(idEmpresa, id)`;
- `(idEmpresa, idVariante)` → `ProductosServiciosVariantes(idEmpresa, id)`;
- `(idEmpresa, idPresentacionVenta)` → `ProductosServiciosPresentacionesVenta(idEmpresa, id)`.

Unique:

- `(idEmpresa, id)`;
- Producto/Servicio activos: unique `(idEmpresa, TipoIdentidad, idProductoServicio)` filtrado por `Activo = 1 AND FechaArchivado IS NULL AND TipoIdentidad IN (1,2)`;
- Variante activa: unique `(idEmpresa, idVariante)` filtrado por `Activo = 1 AND FechaArchivado IS NULL AND TipoIdentidad = 3`;
- PresentacionVenta activa: unique `(idEmpresa, idPresentacionVenta)` filtrado por `Activo = 1 AND FechaArchivado IS NULL AND TipoIdentidad = 4`.

Esta estrategia evita depender de la semántica de `NULL` de SQL Server en un índice unique compuesto.

Checks:

- coherencia exacta de las cuatro identidades y de `TipoProductoServicio`;
- `TipoProductoServicio IN (1,2)`;
- activo implica `FechaArchivado IS NULL` e inactivo implica `FechaArchivado IS NOT NULL`.

Índices:

- empresa + producto;
- empresa + variante, filtrado por variante no nula;
- empresa + presentación, filtrado por presentación no nula;
- empresa + activo;
- índices unique anteriores.

No contiene lista, sucursal, vigencia, porcentaje, prioridad, acumulabilidad ni campos de Ventas.

### 5.2 dbo.ProductosServiciosIdentidadComercialHistorial

Historial append-only separado de `ListaPreciosHistorial`.

Columnas:

- `id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()` — PK;
- `idEmpresa UNIQUEIDENTIFIER NOT NULL`;
- identidad completa: `TipoIdentidad`, `idProductoServicio`, `TipoProductoServicio`, `idVariante`, `idPresentacionVenta`;
- `Campo NVARCHAR(60) NOT NULL`;
- `Operacion NVARCHAR(20) NOT NULL`;
- `ValorAnterior NVARCHAR(MAX) NULL`;
- `ValorNuevo NVARCHAR(MAX) NULL`;
- `idUsuario UNIQUEIDENTIFIER NULL`;
- `Usuario NVARCHAR(256) NULL`;
- `CorrelationId UNIQUEIDENTIFIER NOT NULL`;
- `Origen NVARCHAR(40) NOT NULL`;
- `FechaUtc DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME()`.

Campos auditables: `Descripcion`, `Web`, `Liverpool`, `MercadoLibre`, `Observaciones`, `DosPorUno`, `TresPorDos`, `DescuentoSegundo`, `Monedero`, `Activo`.

Operaciones: `INSERT`, `UPDATE`, `ARCHIVE`, `REACTIVATE`. Orígenes: `LISTA_PRECIOS`, `PRODUCTOS_SERVICIOS`.

Tiene las mismas FK tenant-safe de identidad y checks de coherencia. Índices por identidad/fecha y por `CorrelationId`.

## 6. Históricos y compatibilidad

- No hay backfill comercial: no se inventan Web, canales, observaciones ni promociones para productos existentes.
- Las columnas textuales nuevas son nullable.
- Las banderas usan `false` únicamente al crear una fila nueva; para históricos, ausencia de fila sigue significando “no configurado / desactivado”.
- `ProductosServicios.Descripcion` no se transforma ni se rellena.
- los datos y objetos de ListaPrecios V2 permanecen intactos.
- una segunda ejecución futura deberá reconocer objetos exactos como no-op y bloquear objetos parciales o divergentes para revisión.

## 7. Auditoría y guardado futuro

Cuando exista autorización PO y schema adoptado, el guardado será transaccional y dirty-only:

1. cargar Descripción desde `ProductosServicios` y extensión desde `ProductosServiciosIdentidadComercial`;
2. comparar cada campo con su snapshot original;
3. actualizar sólo los campos modificados;
4. insertar un evento por campo modificado en el historial comercial, con un `CorrelationId` común;
5. commit único y recarga desde servidor.

La descripción se audita en el historial comercial aunque su valor canónico permanezca en `ProductosServicios`. `ListaPreciosHistorial` no se usa para estos cambios.

## 8. Permisos

- Lectura desde ListaPrecios: `05001008 READ`.
- Escritura desde Editar Precios: `05001009 WRITE`.
- No se propone permiso nuevo.

La futura API debe validar tenant y `05001009` en servidor para cualquiera de los nueve campos. No debe aceptar que el cliente elija `idEmpresa`. La escritura de `ProductosServicios.Descripcion` desde esta pantalla queda deliberadamente bajo el permiso administrativo de ListaPrecios, sin exigir `05001001`, porque es una operación acotada del editor y debe mantener una sola decisión de autorización.

## 9. Versionado oficial cerrado por PO

- Scope: `ProductosServicios`.
- SourceVersion: 2.
- TargetVersion: 3.
- MigrationId reservado: `PS-M20261005-V2-V3-IDENTIDAD-COMERCIAL`.
- Hash propuesto anterior: `5abf54a4648c69304e260be2e2912ac6e8d391b43b977826a26bcc028ae0cb87`.
- Target manifest hash final: `086c8e7fe0aced219dda9e3937ac0ddc2299c27b202ec2827c5eeda3916b732d`.
- estado: `APROBADO_PAQUETE_LOCAL_SQL_REAL_NO_AUTORIZADO`.
- `ApprovedForExecution = false`.
- el DDL local está materializado y hasheado dentro del package preparado.

El `LatestVersion` oficial permanece en V2 y el migration package oficial no incluye este MigrationId. Por lo tanto, `SchemaMigrationRunner` no puede ejecutarlo.

LP-QA05S1 agregó `GetPreparedProductosServiciosV3Package()` sobre el provider oficial. `GetPackage(ProductosServicios)` permanece en V2, de modo que el runner runtime no puede seleccionar V3 antes de la autorización SQL. El ticket de ejecución deberá:

1. revisar el package preparado y autorizar SQL primero en CHECKAPPERP;
2. activar el release V3 en `GetPackage` y cambiar `LatestVersion` a V3 sólo en la ventana autorizada;
3. certificar CHECKAPPERP antes de migrar UMBRELLA;
4. hacer que Compatibility Gate exija V3 y su manifest hash;
5. definir adopción sólo después de validar V2 exacto;
6. bloquear drift, objetos parciales, duplicados activos o un estado futuro desconocido;
7. ejecutar primero dry-run y luego una migración explícitamente autorizada.

Rollback contractual:

- antes de adopción runtime, sólo se pueden retirar objetos LP-QA05S si están vacíos;
- después de adopción y datos reales, no se elimina información: se usa una migración correctiva hacia delante;
- toda ejecución futura será transacción única y conservará el control de versión en fallo.

## 10. Impacto futuro en Editar Precios

Una vez autorizado el schema, el modal LP-QA05 podrá cargar, editar, guardar dirty-only y recargar los datos adicionales y banderas. Se conserva la UX acordada:

- sin Preview visible;
- sin Historial visible;
- sin Vigencia visible;
- sin Calcular precios finales;
- sin Corrida manual.

LP-QA05S no conecta esa persistencia.

## 11. Decisiones PO cerradas

1. Producto y Servicio editan su `ProductosServicios.Descripcion` canónica bajo `05001009` y auditoría comercial.
2. Variante y PresentacionVenta muestran la descripción heredada read-only, sin columna propia ni escritura al padre.
3. Datos adicionales y banderas aplican a las cuatro identidades como configuración propia, sin herencia ni fallback.
4. Las promociones son banderas de configuración; no constituyen motor de Ventas.
5. ProductosServicios V3 y sus dos tablas quedan aprobados conceptualmente; SQL real permanece pendiente de autorización expresa.

## 12. Dictamen

**LP-QA05S = CONTRATO V3 CERRADO / PACKAGE LOCAL PREPARADO / SQL REAL NO EJECUTADO.**

No se declara aprobación PO, ListaPrecios aprobada ni FROZEN definitivo.
