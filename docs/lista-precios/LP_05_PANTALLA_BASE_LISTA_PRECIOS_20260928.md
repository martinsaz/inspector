# LP-05 Pantalla Base Lista de Precios

Fecha: 2026-09-28

Estado: implementacion tecnica congelada; QA funcional de datos bloqueada por diagnostico tenant/Gate LP-05R2.

## Alcance

LP-05 reemplaza el placeholder de `/ListaPrecios/Index` por una pantalla base funcional de consulta, siguiendo el Golden Master `/ProductosServicios/Index`.

No incluye edicion masiva, consumidores de precio, cambios DDL, cambios Auth, cambios Legacy ni modificaciones al modal congelado de ProductosServicios.

## Golden Master

La pantalla reutiliza el patron CheckApp vigente:

- `checkapp-shell`
- hero con kicker, titulo y subtitulo
- summary strip
- panel de filtros colapsable
- toolbar de DynamicGrid
- selector oficial de columnas
- exportacion Excel por DynamicGrid
- paginacion externa 25/50/100
- estados de carga, vacio y error controlados por `checkapp-ui.js`

CSS base: `wwwroot/css/ProductosServicios/ProductosServicios.css`.

Adaptador LP-05: `wwwroot/css/ListaPrecios/ListaPrecios.css`.

## Filtros

Filtros implementados:

- Busqueda general.
- Lista de precio 1..10, default Lista 1.
- Tipo: Todos / Producto / Servicio.
- Categoria desde catalogo real.
- Marca desde catalogo real.
- Estatus: Activos / Inactivos / Todos.

No se agrego filtro Unidad porque LP-05 debe consultar productos, servicios, variantes y presentaciones; Unidad no aplica a Servicio como filtro operativo transversal.

## DynamicGrid

Columnas LP-05:

- Identidad/nombre.
- Codigo.
- Tipo.
- Categoria.
- Marca.
- Identidad vendible.
- Lista.
- Precio Lista.
- Precio efectivo.
- Origen.
- Estatus.

Las columnas criticas de precio/origen permanecen no ocultables para evitar una pantalla incomprensible.

## Backend

Se agregaron endpoints read-only:

- `GET api/ListaPrecios/Combos`
- `GET api/ListaPrecios/Consulta`
- `GET /ListaPrecios/ObtenerCombos`
- `GET /ListaPrecios/Consultar`

La consulta API usa tenant server-side, AuthZ `05001008`, Gate `ListaPrecios`, catalogos reales de ProductosServicios y el motor LP-03 `ResolverPrecioAsync` para determinar precio efectivo/origen.

No se duplico el motor de resolucion en MVC/JS.

## Origen de Precio

La UI distingue:

- `PRECIO_LISTA`: muestra Precio Lista y Origen "Precio de lista".
- Fallback: muestra Precio efectivo y Origen "Precio base".

Precio Lista `$0.00` se muestra como precio configurado porque el motor LP-03 devuelve `PRECIO_LISTA` cuando existe detalle activo, independientemente del monto.

## Identidades

La consulta representa:

- Producto base.
- Servicio.
- Variante.
- PresentacionVenta.

Variante + PresentacionVenta permanece fuera de V1.

## Permisos

Lectura de pantalla y endpoints:

- `05001008` requerido.
- SuperAdmin preserva resolucion oficial aditiva.
- `05001009` no es requerido para consultar LP-05.

No se modificaron Roles/Permisos, menu, Login, Firebase, Session, Cookies, Claims ni `Program.cs`.

## Responsive

Desktop:

- Filtros en una fila con fallback controlado a dos filas en anchos menores.
- DynamicGrid conserva scroll horizontal controlado.

Tablet:

- Filtros reorganizados a tres columnas.
- Toolbar y paginacion siguen el patron CheckApp.

Mobile 390:

- Filtros a una columna.
- Summary cards apilables.
- Tabla con scroll horizontal controlado.

## QA Tecnica

Verificaciones ejecutadas durante implementacion:

- `node --check inspector/checklist/wwwroot/js/ListaPrecios/ListaPrecios.js`: PASS.
- Build MVC: PASS con warnings preexistentes.
- Build API: PASS con warnings preexistentes tras agregar `System.Text`.
- Full suite API/MVC: 575/575 PASS.
- `git diff --check` MVC/API: PASS.
- Secret scan diff nuevo: PASS; unico match fue variable `cadena` en diff previo sin valor secreto.

QA visual autenticada:

- El puerto 5200/5127 estaba ocupado por procesos preexistentes del PO y no fue detenido.
- Se levanto MVC propio temporal en 5201 y se detuvo al cierre.
- `/ListaPrecios/Index` en 5201 mostro pantalla funcional LP-05, sin placeholder.
- Desktop 1366: `innerWidth=1366`, `clientWidth=1366`, overflow body `false`.
- Tablet 820: `innerWidth=820`, `clientWidth=820`, overflow body `false`.
- Mobile real 390: `innerWidth=390`, `clientWidth=390`, overflow body `false`.

Bloqueo runtime de datos:

- MVC 5201 consumio API fija `http://localhost:5127/`.
- El API 5127 preexistente devolvio 404 para endpoints LP-05 porque no corresponde al build nuevo.
- No se reemplazo ni se detuvo el API preexistente.

## LP-05R2 Hotfix y Diagnostico Tenant/Gate

LP-05R introdujo un cambio de infraestructura no requerido para la funcionalidad LP-05: `Utilerias.UrlBase` dejo de ser una constante local y paso a resolverse por variable de entorno `CHECKAPP_API_URL_BASE`.

LP-05R2 retiro quirurgicamente ese cambio y restauro el comportamiento previo:

- Archivo: `inspector/checklist/Clases/Utilerias.cs`.
- BEFORE restaurado: `public static string UrlBase { get; } = "http://localhost:5127/";`.
- No se modificaron `appsettings`, `Program.cs`, Login, Auth, Firebase, Session, Cookies, Claims, tenant resolver ni conexiones.
- LP-05 pantalla, filtros, DynamicGrid, JS, CSS, API LP-03/LP-05 y permisos quedaron congelados.

Diagnostico read-only LP-05R2:

- Empresa runtime: `163`.
- `idEmpresa`: `b17aaece-2b78-4e35-b554-9e694eeb15a7`.
- DatabaseIdentity runtime: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.
- Scope: `ListaPrecios`.
- Tablas esperadas del scope: 2.
- Tablas existentes del scope: 0.
- Clasificacion: `Empty / NO_SCOPE_TABLES_FOUND`.
- Gate runtime: `SCHEMA_EMPTY`.

Comparacion:

- CheckAppErp QA certificada para LP-02R3/LP-03/LP-04R3: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`, `SchemaOk / 0`, Gate `COMPATIBLE`.
- Runtime empresa 163: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`, Gate `SCHEMA_EMPTY`.
- Resultado: `RUNTIME_TENANT_DB != CHECKAPPERP_QA`.

No se ejecuto DDL, no se provisiono schema, no se modifico tenant y no se apunto empresa 163 a CheckAppErp. La decision de provisionar ListaPrecios en la base real del tenant 163 requiere autorizacion PO explicita.

Pendiente para QA PO/runtime integrado:

- Revision PO del diagnostico `RUNTIME_TENANT_DB != CHECKAPPERP_QA`.
- Definir si se autoriza provisionar ListaPrecios V1 en la base real del tenant 163.
- No continuar QA funcional LP-05 hasta resolver esa decision.

## LP-05R3 Provisionamiento Controlado Tenant 163

LP-05R3 cerro exclusivamente la precondicion de schema para poder retomar despues el QA funcional LP-05. No se ejecuto QA funcional LP-05 en esta etapa.

Identidad validada antes de provisionar:

- Empresa runtime: `163`.
- `idEmpresa`: `b17aaece-2b78-4e35-b554-9e694eeb15a7`.
- DatabaseIdentity runtime: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.
- DatabaseIdentity CheckAppErp QA: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`.
- Resultado de identidad: `RUNTIME_TENANT_163 != CHECKAPPERP_QA`.
- Conexion modificada: `false`.

Estado BEFORE:

- Scope: `ListaPrecios`.
- Tablas esperadas: 2.
- Tablas existentes: 0.
- Clasificacion: `Empty`.
- Razon: `NO_SCOPE_TABLES_FOUND`.
- Gate: `SCHEMA_EMPTY`.

Provisionamiento ejecutado:

- Mecanismo oficial: `ProductosServiciosSchemaBootstrapper.ProvisionScopeAsync`.
- Baseline: `EMPTY`.
- Version: `1`.
- Hash: `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`.
- Resultado: `PROVISIONED/PASS`.
- Tablas creadas: 2.
- Columnas creadas: 30.
- Indices creados: 11.
- Foreign keys creadas: 4.
- Checks creados: 7.

Control de versionado:

- `CheckAppSchemaState`: version `1`, hash `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`, resultado `PROVISIONED/PASS`.
- History: `1`, eventos `PROVISIONED:PASS`.
- Attempts: `1`, resultados `PROVISION:PASS:PROVISIONED`.
- Segunda ejecucion controlada: `NoProvision / ALREADY_PROVISIONED`.
- Idempotencia: `true`.

Estado AFTER:

- Tablas detectadas: `2/2`.
- Tablas: `dbo.ListaPreciosDetalle`, `dbo.ListaPreciosListas`.
- Drift: `SchemaOk`.
- Drift items: `0`.
- Columnas detectadas: 30.
- Indices detectados: 11.
- Foreign keys detectadas: 4.
- Checks detectados: 7.
- Gate: `COMPATIBLE`.
- Gate allowed: `True`.

Controles de no contaminacion:

- Datos copiados desde CheckAppErp: `false`.
- Datos legitimos del tenant modificados: `false`.
- Fixtures permanentes LP-05R3: `false`.
- `Utilerias.UrlBase` permanece `public static string UrlBase { get; } = "http://localhost:5127/";`.

Regresiones protegidas verificadas por conteo antes/despues:

- `CurvasCatalogo`: 1 / 1.
- `CurvasDetalle`: 1 / 1.
- `InventarioMovimientos`: 0 / 0.
- `InventarioSaldos`: 0 / 0.
- `InventarioSeries`: 0 / 0.
- `OrdenesCompra`: 44 / 44.
- `OrdenesCompraDetalle`: 90 / 90.
- `ProductosServicios`: 11 / 11.
- `ProductosServiciosPresentacionesVenta`: 59 / 59.
- `ProductosServiciosVariantes`: 7 / 7.
- `Recepciones`: 0 / 0.
- `RecepcionPartidas`: 0 / 0.

Resultado LP-05R3:

- `LP-05R3 = PRECONDICION SCHEMA TENANT 163 CERRADA`.
- Esto no significa LP-05 aprobado.
- Siguiente paso: retomar QA funcional LP-05R.
- No ejecutar todavia sin autorizacion PO.

## LP-05R4 QA Funcional Runtime

LP-05R4 ejecuto QA funcional real contra `/ListaPrecios/Index` en tenant `163 / UMBRELLA`.

Runtime:

- Usuario QA: Denisse Martinez Mendiola.
- Empresa: `UMBRELLA`.
- `idEmpresa`: `b17aaece-2b78-4e35-b554-9e694eeb15a7`.
- DatabaseIdentity: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.
- Gate inicial/final: `COMPATIBLE`.
- Drift final: `SchemaOk / 0`.
- Pantalla: `/ListaPrecios/Index` visible, sin 404, sin 503 y sin `SCHEMA_EMPTY`.
- Datos reales iniciales: 10 filas activas en Lista 1.

Casos certificados:

- Lista 1 default: PASS.
- Lista 1 -> Lista 2 -> Lista 1: PASS.
- Producto fallback: `Aceite Motor Sintetico`, efectivo `$680.00`, origen `Precio base`.
- Servicio fallback: `Cambio de Aceite`, efectivo `$1,500.00`, origen `Precio base`, sin Unidad Base operativa visible.
- Variante: `Aceite Motor Sintetico · 10 L`, identidad vendible `Variante · 10 L`.
- PresentacionVenta: `Aceite Motor Sintetico · Paquete`, identidad vendible `Presentación · Paquete`, sin confundirse con PresentacionesCompra.
- Producto especifico con fixture reversible en Lista 2: `$777.77`, origen `Precio de lista`.
- Servicio especifico con fixture reversible en Lista 2: `$333.33`, origen `Precio de lista`.
- Precio `0.00` con fixture reversible en Lista 1: Precio Lista `$0.00`, Precio efectivo `$0.00`, origen `Precio de lista`; no se mostro vacio, fallback, guion ni PrecioPublico.
- Busqueda general `Aceite`: PASS.
- Tipo `Servicio`: PASS, 1 registro.
- Categoria `Alimentos`: PASS, 9 registros.
- Marca `Mobil 1`: PASS, 9 registros.
- Combinado Lista + Tipo + Categoria + Marca + Estatus + Busqueda: PASS, 9 registros.
- Limpiar: PASS mediante reset de controles, Lista 1, Tipo Todos, Categoria Todas, Marca Todas, Estatus Activos, grid recargado.
- DynamicGrid render, contador, busqueda interna, columnas, paginacion 25/50/100 y ordenamiento: PASS.
- Sin resultados: endpoint/filtro funcional PASS; estado vacio oficial observado durante combinacion sin match.
- F5: sesion preservada tras login normal, pantalla recarga y DynamicGrid reinicializa.
- Responsive desktop: PASS sin overflow destructivo.
- Permisos smoke: SuperAdmin PASS; `05001008` lectura preservada; `05001009` no requerido para consulta.

Fix minimo LP-05 aplicado durante QA:

- Archivo: `checklist/wwwroot/js/ListaPrecios/ListaPrecios.js`.
- Motivo: al cambiar filtros/listas rapido, respuestas XHR viejas podian sobrescribir la grilla con datos de otro filtro.
- Cambio: `requestVersion` local para descartar respuestas obsoletas de `loadData`.
- Reprueba: Lista 2 mostro Producto `$777.77` y Servicio `$333.33`; regreso a Lista 1 mostro Variante `$0.00` sin mezcla de datos.

Limitaciones observadas:

- La descarga fisica de Excel desde Chrome no dejo archivo en `Downloads` bajo automatizacion; el boton estuvo habilitado y el exportador DynamicGrid tiene vendor `xlsx.full.min.js` disponible. No quedaron archivos Excel QA que limpiar.
- Responsive desktop quedo certificado; no quedo evidencia runtime nueva de tablet ni movil 390 en LP-05R4.

Cleanup:

- Fixtures `ListaPreciosListas`: 0 activos.
- Fixtures `ListaPreciosDetalle`: 0 activos.
- Fixtures soporte: 0.
- Excel QA: 0.
- Datos legitimos modificados: 0.
- Residuos: 0.

Regresion:

- Build MVC: PASS con warnings preexistentes.
- Build API: PASS con warnings preexistentes.
- Full suite: 575/575 PASS.
- `node --check` ListaPrecios.js: PASS.
- `git diff --check` MVC/API: PASS.
- Secret scan MVC/API: PASS.
- `Utilerias.UrlBase` intacta: `public static string UrlBase { get; } = "http://localhost:5127/";`.

Procesos:

- Se identificaron procesos preexistentes `95091` en `5200` y `95093` en `5127`.
- Se reiniciaron explicitamente para cargar el build actual LP-05.
- Se iniciaron procesos Codex temporales en los mismos puertos normales `5200/5127`.

Dictamen:

- `LP-05R4 = QA FUNCIONAL EJECUTADO / PENDIENTE CIERRE PO`.
- No se declara `LP-05 = CERRADO / LISTO QA PO` porque el contrato exige cierre solo con todos los criterios certificados; descarga fisica Excel y responsive tablet/movil no quedaron certificados por la automatizacion runtime de LP-05R4.
- Siguiente paso: revision PO/manual de las dos limitaciones registradas.
- No ejecutar LP-06, LP-07 ni backlog posterior sin autorizacion expresa del PO.

## LP-05R5 Cierre Final Excel + Responsive

LP-05R5 cerro exclusivamente los dos pendientes de LP-05R4: Excel fisico real y responsive runtime tablet/mobile.

Excel:

- Accion UI real: PASS mediante click del boton oficial `#btExportarListaPrecios`; no se llamo directamente ninguna funcion exportadora.
- Download navegador: PASS con eventos Chrome/CDP `Browser.downloadWillBegin` y `Browser.downloadProgress`.
- Archivo fisico: PASS, `/tmp/moka-lp05r5-downloads-1790638852/ListaPrecios_20260928.xlsx`.
- Extension: PASS, `.xlsx`.
- Tamano: PASS, 19545 bytes.
- Abre: PASS, archivo XLSX leido como ZIP/XML OpenXML.
- Encabezados: PASS, `Identidad`, `Codigo`, `Tipo`, `Categoria`, `Marca`, `Identidad vendible`, `Lista`, `Precio Lista`, `Precio efectivo`, `Origen`, `Estatus`.
- Registros: PASS, 9 filas.
- Respeta filtros: PASS, filtro visible `Lista 1 + busqueda Aceite + Tipo Producto`; exporto 9 registros, todos Producto y con `Aceite`.
- Cross-tenant: PASS, sesion autenticada en `UMBRELLA`; exporto solo filas visibles del tenant runtime.
- HTML/error disfrazado: PASS, sin `<html>`, stack ni exception.
- Cleanup Excel: PASS, archivo temporal eliminado; `Downloads` sin `ListaPrecios_*.xlsx`; `/tmp` sin Excel QA.

Responsive:

- Desktop before: `innerWidth=1366`, `clientWidth=1366`, `scrollWidth=1366`, body overflow `false`.
- Tablet: `innerWidth=820`, `clientWidth=820`, `scrollWidth=820`, body overflow `false`; filtros, toolbar, Columnas, Exportar, DynamicGrid y paginacion visibles/utilizables.
- Mobile: `innerWidth=390`, `clientWidth=390`, `scrollWidth=390`, body overflow `false`; busqueda, lista, tipo, categoria, marca, estatus, limpiar, DynamicGrid, Columnas, Exportar, paginacion y precio/origen visibles/utilizables.
- Grid scroll: controlado; no se detecto overflow destructivo de body.
- Resize: Desktop -> Tablet -> Mobile -> Desktop PASS sin F5.

Regresion LP-05R5:

- Drift: `SchemaOk / 0`.
- Gate: `COMPATIBLE`.
- Fixtures nuevos: 0.
- Datos legitimos modificados: 0.
- Build MVC: PASS con warnings preexistentes.
- Build API: PASS con warnings preexistentes.
- Full suite: 575/575 PASS.
- `node --check`: PASS.
- `git diff --check` MVC/API: PASS.
- Secret scan: PASS; unico falso positivo revisado fue parametro de codigo llamado `token` sin credencial.
- Auth/Login/Firebase/Session/Cookies/Claims/Program.cs: intactos.
- `Utilerias.UrlBase`: intacta.
- Procesos temporales Codex: 0; puertos `5200`, `5127` y `9333` libres al cierre.

Dictamen LP-05R5:

- `LP-05 = CERRADO / LISTO QA PO`.
- Siguiente paso: QA manual PO.
- No ejecutar LP-06, LP-07 ni backlog posterior sin autorizacion expresa del PO.

## Fixtures

LP-05 no requiere fixtures de escritura para implementar la pantalla base.

Fixtures LP-05 activos esperados al cierre: 0.

## Regresiones Protegidas

No se tocaron:

- ProductosServicios modal / PS-ACT-03.
- Motor LP-03.
- Schema ListaPrecios.
- Auth/Login/Firebase/Session/Cookies/Claims/Program.cs.
- Legacy Raramuri/sazapi.
- Inventario, Curvas, OC, Recepcion.

## Handoff

Siguiente paso autorizado al terminar LP-05:

QA manual PO.

No ejecutar LP-06, LP-07 ni backlog posterior sin autorizacion expresa del PO.
