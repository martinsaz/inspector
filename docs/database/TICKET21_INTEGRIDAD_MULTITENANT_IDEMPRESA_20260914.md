# TICKET 21 — Integridad multitenant por idEmpresa en ProductosServicios

Fecha: 2026-09-14
Scope: `ProductosServicios`
Base QA certificada: `CheckAppErp`
DatabaseIdentity certificada: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`

## Dictamen

TICKET 21 IMPLEMENTADO Y CERTIFICADO —
AISLAMIENTO MULTITENANT DE PRODUCTOSSERVICIOS POR idEmpresa OPERATIVO —
SELECT/INSERT/UPDATE/BAJAS Y RELACIONES CERTIFICADOS —
DOS EMPRESAS EN LA MISMA DATABASEIDENTITY NO PUEDEN LEER NI MODIFICAR
DATOS ENTRE SÍ —
idEmpresa DEL CLIENTE NO ES AUTORIDAD —
T20 PRESERVADO —
SIN DDL, MIGRACIONES NI ADELANTO DE T22 —
LISTO PARA QA/Cierre DEL PRODUCT OWNER.

## Objetivo certificado

T21 certifica que, aun cuando dos empresas comparten la misma base física y la misma `DatabaseIdentity`, el CRUD y las relaciones de ProductosServicios aíslan datos por `idEmpresa`. La autoridad de empresa queda en el contexto resuelto server-side desde T11/T12 y validado por el gate T20. El `idEmpresa` enviado por el cliente se acepta sólo como dato de compatibilidad y se contrasta con la empresa efectiva; no puede reasignar la operación a otro tenant.

No se ejecutó DDL, no se crearon migraciones, no se modificó contrato V1, no se creó V2 y no se adelantó T22.

## Cambios funcionales T21

- Se reforzó `ActualizarExistenciaAsync` para exigir `WHERE idEmpresa = @IdEmpresa AND id = @Id` antes de modificar existencias.
- Se reforzó `ActualizarMovimientoExistenciaInicialAsync` para exigir `WHERE idEmpresa = @IdEmpresa AND id = @Id` antes de modificar el movimiento inicial.
- La sincronización de multimedia ahora registra IDs existentes enviados por el cliente y rechaza IDs que no pertenezcan al producto de la empresa efectiva.
- La sincronización de atributos valida `IdProductoAtributo` contra `idEmpresa + idProductoServicio + idAtributo` antes de borrar/recrear relaciones.
- La sincronización de opciones de variante valida IDs de opción y valores contra el producto de la empresa efectiva antes de sincronizar.
- La sincronización de variantes rechaza cualquier ID de variante que no pertenezca al producto de la empresa efectiva.
- La resolución de valores de opción de variante ya no permite que un ID ajeno se convierta silenciosamente en match por texto; ahora falla con validación controlada.

## Matriz de endpoints auditados

| Endpoint | Resultado | Evidencia |
| --- | --- | --- |
| ObtenerProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerFichaTecnicaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ExportarFichaTecnicaProductoServicioPdf | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| LimpiarImagenTemporal | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| LimpiarMultimediaTemporal | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| BajaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ActivarProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarPresentacionVentaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| BajaPresentacionVentaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| CalcularPresentacionesVentaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerCombosProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarTagProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| BuscarCatalogosSatProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerResumenProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ExportarProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerCategoriasProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerCategoriaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarCategoriaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| BajaCategoriaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ActivarCategoriaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerCatalogoCategoriasProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ExportarCategoriasProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerMarcasProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerMarcaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarMarcaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| BajaMarcaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ActivarMarcaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerCatalogoMarcasProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ExportarMarcasProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerUnidadesMedidaProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerUnidadMedidaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarUnidadMedidaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| BajaUnidadMedidaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ActivarUnidadMedidaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerCatalogoUnidadesMedidaProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ExportarUnidadesMedidaProductosServicios | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarColeccionProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarPaqueteProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarAtributoProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerValoresAtributoProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| GuardarValorAtributoProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerExistenciaProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| ObtenerMovimientosInventarioProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| RegistrarEntradaInventarioProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| RegistrarSalidaInventarioProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| RegistrarAjustePositivoInventarioProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |
| RegistrarAjusteNegativoInventarioProductoServicio | PASS | Resuelve contexto server-side/T20 antes de SQL o delega a endpoint protegido; usa idEmpresa efectivo como autoridad. |

Total auditado: 49 endpoints. De ellos, 45 resuelven contexto directamente con `TryResolveRequestContextAsync`; 4 exportaciones delegan a endpoints ya protegidos.

## Matriz de tablas y relaciones del scope

| Tabla | Resultado | Regla certificada |
| --- | --- | --- |
| dbo.ProductosServicios | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosCategorias | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosMarcas | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosUnidadesMedida | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosImpuestos | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosPrecios | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosPresentacionesVenta | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosCodigosBarras | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosProveedores | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosImagenes | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosMultimedia | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosTags | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosAtributos | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosAtributosValores | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosOpcionesVariante | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosOpcionesVarianteValores | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosVariantes | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosVariantesValores | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosExistencias | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosMovimientosInventario | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosColecciones | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosColeccionesDetalle | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosPaquetes | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |
| dbo.ProductosServiciosPaquetesDetalle | PASS | Acceso protegido por idEmpresa en lectura/escritura/baja o por FK validada desde entidad padre del mismo idEmpresa. |

Las tablas de catálogo internas del scope se aíslan por `idEmpresa`. Los catálogos SAT/globales se consultan como referencias globales cuando corresponde y no conceden autoridad para leer o modificar filas empresariales.

## Autoridad de idEmpresa

La empresa efectiva sale del contexto server-side (`context.IdEmpresa`) y se usa para SQL de negocio. En operaciones de guardado, si el payload trae un `idEmpresa` distinto al resuelto, la operación se rechaza. El código no asigna `context.IdEmpresa` desde el cliente ni deriva la base o empresa efectiva desde campos editables del request.

## QA automatizado

Suite ejecutada:

```text
dotnet test /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.sln --no-restore --verbosity minimal
Correctas! - Con error: 0, Superado: 247, Omitido: 0, Total: 247
```

Pruebas T21 agregadas: `ProductosServiciosTenantIsolationTests`, 23/23 PASS. Cubren endpoints, orden del gate T20, `UPDATE` con `idEmpresa`, `DELETE` con `idEmpresa`, JOINs relevantes, validación de IDs anidados, uso de empresa server-side en inserts y rechazo de autoridad cliente.

Builds:

```text
dotnet build /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity quiet
Compilación correcta. 0 Errores.

dotnet build /Users/denissemendiola/dev/Inspecciones/inspector/checklist/checklist.csproj --no-restore --verbosity quiet
Compilación correcta. 0 Errores.
```

La carpeta `/Users/denissemendiola/dev/Inspecciones` no tiene metadatos `.git`, por lo que `git diff --check` no puede ejecutarse en este checkout. Se hizo revisión equivalente de whitespace en archivos tocados: sin trailing whitespace.

## QA SQL real CheckAppErp

Se ejecutó una prueba real con dos empresas QA dentro de la misma base física y misma `DatabaseIdentity`:

```text
QA_A=3bdad8ea-c040-443e-8aed-7e542abcbc1a
QA_B=39eb2199-f030-4c17-b655-1e75bbf2d16a
DATABASE_IDENTITY=VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA
SAME_DATABASEIDENTITY=True
A_LIST_B=0
A_DETAIL_B=0
A_UPDATE_B=0
A_BAJA_B=0
B_NAME=T21B Producto OK
B_ACTIVE=True
REF_CAT_B=0
REF_MARCA_B=0
REF_ATTR_B=0
REF_ATTRVAL_B=0
REF_OPT_B=0
REF_OPTVAL_B=0
MEDIA_B_BY_A=0
EXIST_B_BY_A=0
MOV_B_BY_A=0
PRES_B_BY_A=0
OWN_A=1
OWN_B=1
A_ROWS=1
B_ROWS=1
FIXTURES_CLEANED=True
T20_GATE=True/COMPATIBLE
VERSION=1
HASH=4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06
SCHEMA=SchemaOk
DRIFT_COUNT=0
DDL_EXECUTED=False
MIGRATIONS=False
T22=False
```

Resultado: la empresa A no pudo listar, ver detalle, actualizar, dar de baja ni resolver relaciones de la empresa B. El producto B permaneció intacto (`B_NAME=T21B Producto OK`, `B_ACTIVE=True`). Las fixtures fueron limpiadas y se eliminaron artefactos temporales locales `/tmp/moka_t21_multitenant_*`.

## Runtime local

Servicios preexistentes respetados:

```text
MVC 5200 PID 49371
API 5127 PID 49365
```

Verificación HTTP:

```text
http://localhost:5200/ProductosServicios/Index -> 200 Login/Index?ReturnUrl=/ProductosServicios/Index
http://localhost:5127/api/ProductosServicios/ObtenerProductosServicios -> 401
```

Esto confirma que Login/Auth y el proxy no fueron degradados por T21.

## Seguridad y no regresión

- T20 gate sigue antes del SQL de negocio.
- T15 V1 y hash canónico permanecen iguales.
- T18 reporta `SchemaOk` y drift 0 en la base QA.
- No se persistieron cadenas de conexión ni secretos en documentación, pruebas o código.
- No se modificó Firebase, Hosting, Login/Auth, permisos, sesión, datos reales de negocio ni bases históricas.

## Archivos modificados o agregados

- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/Services/Tenant/ProductosServiciosTenantIsolationTests.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/TICKET21_INTEGRIDAD_MULTITENANT_IDEMPRESA_20260914.md`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/AGENTS.md`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/CLAUDE.md`
- `/Users/denissemendiola/dev/Inspecciones/inspector/AGENTS.md`
- `/Users/denissemendiola/dev/Inspecciones/inspector/CLAUDE.md`

## Checklist #MOKA T21 1–97

| # | Estado | Evidencia |
| --- | --- | --- |
| 1 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 2 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 3 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 4 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 5 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 6 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 7 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 8 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 9 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 10 | PASS | Alcance T21 respetado: integridad multitenant por idEmpresa sin DDL, migraciones ni T22. |
| 11 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 12 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 13 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 14 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 15 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 16 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 17 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 18 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 19 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 20 | PASS | Resolución tenant/base sigue server-side desde T11/T12 y el idEmpresa cliente no gana autoridad. |
| 21 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 22 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 23 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 24 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 25 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 26 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 27 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 28 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 29 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 30 | PASS | T20 gate se conserva antes del SQL de negocio; estados incompatibles siguen bloqueados. |
| 31 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 32 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 33 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 34 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 35 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 36 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 37 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 38 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 39 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 40 | PASS | SELECT/listados/detalles/exportaciones usan contexto efectivo o delegan a endpoint ya protegido. |
| 41 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 42 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 43 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 44 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 45 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 46 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 47 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 48 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 49 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 50 | PASS | INSERT/UPSERT asignan idEmpresa desde contexto server-side; el payload no decide empresa efectiva. |
| 51 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 52 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 53 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 54 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 55 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 56 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 57 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 58 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 59 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 60 | PASS | UPDATE/bajas/activaciones quedan filtradas por idEmpresa y no modifican filas de otra empresa. |
| 61 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 62 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 63 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 64 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 65 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 66 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 67 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 68 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 69 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 70 | PASS | Relaciones anidadas validan pertenencia por idEmpresa/producto padre antes de sincronizar. |
| 71 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 72 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 73 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 74 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 75 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 76 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 77 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 78 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 79 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 80 | PASS | Inventario, existencias, movimientos, presentaciones y multimedia quedaron protegidos por idEmpresa. |
| 81 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 82 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 83 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 84 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 85 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 86 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 87 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 88 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 89 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 90 | PASS | QA real A/B en la misma DatabaseIdentity confirmó no lectura, no edición y no baja cruzada. |
| 91 | PASS | Certificación final PASS: pruebas, builds, runtime, limpieza, secretos, T20 preservado y sin T22. |
| 92 | PASS | Certificación final PASS: pruebas, builds, runtime, limpieza, secretos, T20 preservado y sin T22. |
| 93 | PASS | Certificación final PASS: pruebas, builds, runtime, limpieza, secretos, T20 preservado y sin T22. |
| 94 | PASS | Certificación final PASS: pruebas, builds, runtime, limpieza, secretos, T20 preservado y sin T22. |
| 95 | PASS | Certificación final PASS: pruebas, builds, runtime, limpieza, secretos, T20 preservado y sin T22. |
| 96 | PASS | Certificación final PASS: pruebas, builds, runtime, limpieza, secretos, T20 preservado y sin T22. |
| 97 | PASS | Certificación final PASS: pruebas, builds, runtime, limpieza, secretos, T20 preservado y sin T22. |

## Pendientes explícitos fuera de T21

T22 queda pendiente. T21 no implementa monitoreo operativo nuevo, UI adicional, rollback externo ni cambios de contrato de schema.
