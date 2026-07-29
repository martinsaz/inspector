# PATRON CHECKAPP - AUDITORIA TECNICA

## 1. Resumen ejecutivo

La arquitectura real de CheckApp corresponde a una aplicacion ASP.NET Core MVC sobre `.NET 8`, con vistas Razor, carga global de bundles visuales y una dependencia operativa fuerte en `jQuery`, `DataTables`, `Bootstrap` y scripts por pantalla. No existe hoy una base tecnica compatible para portar directamente componentes Blazor de Tarahumara dentro de CheckApp.

La auditoria confirma que el patron futuro de CheckApp debe construirse como una capa propia para MVC y JavaScript, no como copia de componentes Razor/Blazor. El material de Tarahumara aporta lineamientos valiosos de contrato, responsividad, accesibilidad, selector de columnas, exportacion y orden visual, pero su implementacion concreta depende de `MudBlazor`, `RenderFragment`, `Dictionary<string, JsonElement>`, servicios C# y CSS aislado de Blazor, tecnologias que no forman parte del stack actual de CheckApp.

Se identificaron seis patrones tecnicos representativos de grids en CheckApp. El patron dominante es `DataTables` con carga AJAX en cliente, acciones por fila y exportacion con botones estandar; los casos mas complejos aparecen en reportes con columnas dinamicas, filtros externos, modales anidados y exportacion manual con `ExcelJS`.

La conclusion tecnica es favorable para construir en una siguiente fase un `CheckAppDynamicGrid`, un `CheckAppFilterAccordion` y un `checkapp-theme.css`, siempre que se implementen como artefactos propios del stack MVC actual, con adopcion gradual, alcance encapsulado y convivencia controlada con tablas legacy.

## 2. Arquitectura real de CheckApp

### 2.1 Version de .NET

- Evidencia: [`checklist/checklist.csproj`](/Users/denissemendiola/dev/CheckList_Original/checklist/checklist.csproj)
- `TargetFramework`: `net8.0`
- SDK: `Microsoft.NET.Sdk.Web`

### 2.2 Tipo exacto de aplicacion

CheckApp es una aplicacion `ASP.NET Core MVC` con vistas Razor.

Evidencia tecnica:

- Estructura basada en `Controllers/`, `Views/` y `wwwroot/`
- Layout central en [`checklist/Views/Shared/_Layout.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Shared/_Layout.cshtml)
- Vistas de modulo en rutas como:
  - [`checklist/Views/Puestos/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Puestos/Index.cshtml)
  - [`checklist/Views/Usuario/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Usuario/Index.cshtml)
  - [`checklist/Views/ReporteDinamico/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/ReporteDinamico/Index.cshtml)

No se detecto una arquitectura Blazor activa ni uso de Razor Components para la interfaz principal. Tampoco se detecto una solucion basada en Razor Pages.

### 2.3 Librerias visuales presentes

Librerias confirmadas por paquetes, bundles y vistas:

- `Bootstrap 5.3.3`
- `jQuery 3.7.1`
- `jQuery Validation`
- `DataTables`
- `DataTables Buttons`
- `Select2`
- `FullCalendar`
- `SweetAlert`
- `FormValidation`
- `ExcelJS`
- `XLSX`
- `JSZip`
- componentes propios basados en vistas Razor, modales Bootstrap y scripts por modulo

No se detecto presencia de:

- `MudBlazor`
- `Telerik UI`
- `DevExpress`
- `Blazorise`

### 2.4 Ubicacion de layouts, vistas compartidas, CSS y JavaScript

Layouts y compartidos:

- Layout principal:
  - [`checklist/Views/Shared/_Layout.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Shared/_Layout.cshtml)
- Partial view compartida:
  - [`checklist/Views/Shared/_ValidationScriptsPartial.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Shared/_ValidationScriptsPartial.cshtml)

Vistas compartidas y reutilizacion actual:

- La reutilizacion visual se concentra hoy en:
  - layout global
  - modales Bootstrap
  - clases compartidas del tema cargado en bundles
  - scripts utilitarios globales

No se detecto un sistema vigente de componentes UI reutilizables equivalente a `CheckAppDynamicGrid` o `CheckAppFilterAccordion`.

CSS global:

- [`checklist/wwwroot/css/site.css`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/site.css)
- bundles globales cargados desde `_Layout.cshtml`:
  - `/assets/plugins/global/plugins.bundle.css`
  - `/assets/css/style.bundle.css`
  - `/assets/plugins/custom/datatables/datatables.bundle.css`
  - `/assets/plugins/custom/fullcalendar/fullcalendar.bundle.css`

CSS por modulo:

- [`checklist/wwwroot/css/ContestarLista/RecoleccionesBL26.css`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/ContestarLista/RecoleccionesBL26.css)
- [`checklist/wwwroot/css/ContestarLista/ContestarLista.css`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/ContestarLista/ContestarLista.css)
- [`checklist/wwwroot/css/listas-bl26.css`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/listas-bl26.css)
- [`checklist/wwwroot/css/Operadores/OperadoresBL26.css`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/Operadores/OperadoresBL26.css)

JavaScript global:

- [`checklist/wwwroot/js/site.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/site.js)
- [`checklist/wwwroot/js/Utilerias.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Utilerias.js)
- [`checklist/wwwroot/js/ConnectionManager.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ConnectionManager.js)
- [`checklist/wwwroot/js/home.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/home.js)

JavaScript por modulo:

- [`checklist/wwwroot/js/Puestos/Puestos.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Puestos/Puestos.js)
- [`checklist/wwwroot/js/Usuarios/Usuarios.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Usuarios/Usuarios.js)
- [`checklist/wwwroot/js/Operadores/Operadores.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Operadores/Operadores.js)
- [`checklist/wwwroot/js/ReporteListado/ReporteListado.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ReporteListado/ReporteListado.js)
- [`checklist/wwwroot/js/ReporteDinamico/ReporteDinamico.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ReporteDinamico/ReporteDinamico.js)

### 2.5 Forma actual de cargar estilos y scripts

La carga actual es mixta:

- bundles CSS y JS globales desde `_Layout.cshtml`
- fuentes remotas desde Google Fonts
- seccion opcional `Scripts` por vista mediante `@await RenderSectionAsync("Scripts", required: false)`
- scripts adicionales por pantalla, en varios casos desde CDN
- instanciacion manual de `DataTables`, `Select2`, `ExcelJS` y logica de filtros desde el JavaScript del modulo

Conclusiones de carga:

- hoy no existe un punto formal de registro para componentes UI propios encapsulados
- varias vistas agregan dependencias de forma local y heterogenea
- el comportamiento de una futura libreria comun debe convivir con esa heterogeneidad

### 2.6 Restricciones de compatibilidad existentes

Restricciones reales detectadas:

- dependencia amplia de `jQuery` y plugins asociados
- uso predominante de `DataTables` como motor de tabla
- coexistencia de scripts globales y scripts por vista sin encapsulacion uniforme
- presencia de pantallas que agregan `jQuery` y `Bootstrap` desde CDN aun cuando ya existen bundles globales
- tablas con IDs y modales auxiliares que dependen de selectores y eventos existentes
- exportacion heterogenea: unas pantallas usan botones `DataTables`; otras usan `ExcelJS` manual
- dependencia funcional en datos obtenidos por AJAX del lado cliente
- deuda de contexto tenant en JavaScript, donde varias pantallas leen `idEmpresa`, `cadena`, `empresa` o `correo` desde `sessionStorage`

Implicacion principal:

El futuro patron debe ser incremental y encapsulado. No es viable introducir de inicio una sustitucion global ni una capa que requiera refactorizar todo el ciclo de carga del sitio.

## 3. Inventario representativo de grids

Se identificaron seis patrones tecnicos representativos.

### 3.1 Patron 1: CRUD administrativo DataTable con AJAX, acciones y modal

Ejemplos:

- Vista: [`checklist/Views/Puestos/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Puestos/Index.cshtml)
- Script: [`checklist/wwwroot/js/Puestos/Puestos.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Puestos/Puestos.js)
- Vista: [`checklist/Views/Categorias/CategoriasABC.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Categorias/CategoriasABC.cshtml)
- Script: [`checklist/wwwroot/js/Categorias/Categorias.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Categorias/Categorias.js)

Caracteristicas:

- origen de datos: AJAX en cliente
- filtrado: buscador integrado de `DataTables`
- ordenamiento: cliente por columna
- paginacion: cliente
- acciones: editar, activar, desactivar, eliminar segun pantalla
- permisos: gobernados por acceso a pantalla y botones habilitados desde la logica actual
- exportacion: botones estandar de `DataTables`
- riesgo de migracion: bajo

Comentarios:

Este patron es el mas adecuado para una primera migracion estructural futura porque combina uso real, baja complejidad y buena capacidad de validacion.

### 3.2 Patron 2: Grid administrativo ancho con multiples columnas y formularios acoplados

Ejemplos:

- Vista: [`checklist/Views/Usuario/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Usuario/Index.cshtml)
- Script: [`checklist/wwwroot/js/Usuarios/Usuarios.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Usuarios/Usuarios.js)

Caracteristicas:

- origen de datos: `fetch` y carga cliente
- filtrado: buscador interno de `DataTables`
- ordenamiento: cliente
- paginacion: cliente
- acciones: editar, desactivar, cambiar datos
- permisos: acoplados a operacion de usuario y acceso a pantalla
- exportacion: botones estandar de `DataTables`
- riesgo de migracion: medio

Riesgo principal:

El grid esta estrechamente relacionado con formularios, listas auxiliares y flujo de mantenimiento, por lo que una migracion requiere preservar interacciones ya probadas.

### 3.3 Patron 3: Grid con filtros externos y logica de permisos

Ejemplos:

- Vista: [`checklist/Views/Operadores/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Operadores/Index.cshtml)
- Script: [`checklist/wwwroot/js/Operadores/Operadores.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Operadores/Operadores.js)

Caracteristicas:

- origen de datos: `fetch` con filtros externos
- filtrado: combinacion de formulario externo y grid
- ordenamiento: cliente
- paginacion: cliente
- acciones: alta, edicion, suspension, reactivacion, asignaciones
- permisos: condicionan visibilidad y acciones disponibles
- exportacion: no estandarizada en esta pantalla
- riesgo de migracion: medio

Riesgo principal:

El comportamiento visible depende de permisos y de un estilo de pantalla mas personalizado que el CRUD basico.

### 3.4 Patron 4: Reporte con filtros externos, modales y grids secundarios

Ejemplos:

- Vista: [`checklist/Views/ReporteListado/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/ReporteListado/Index.cshtml)
- Script: [`checklist/wwwroot/js/ReporteListado/ReporteListado.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ReporteListado/ReporteListado.js)
- Vista: [`checklist/Views/Resultados/Resultados.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Resultados/Resultados.cshtml)
- Script: [`checklist/wwwroot/js/Resultados/Resultados.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Resultados/Resultados.js)

Caracteristicas:

- origen de datos: llamadas AJAX filtradas por fecha, sucursal, lista u otros criterios
- filtrado: formulario externo
- ordenamiento: cliente
- paginacion: cliente
- acciones: abrir detalle, abrir anexos, navegar a resultados
- permisos: implícitos por acceso a reportes
- exportacion: mezcla de botones `DataTables` y `ExcelJS` manual
- riesgo de migracion: alto

Riesgo principal:

La pantalla no es solo un grid. Es un flujo compuesto con tablas secundarias y detalles modales.

### 3.5 Patron 5: Grid de columnas dinamicas generado desde datos del servidor

Ejemplos:

- Vista: [`checklist/Views/ReporteDinamico/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/ReporteDinamico/Index.cshtml)
- Script: [`checklist/wwwroot/js/ReporteDinamico/ReporteDinamico.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ReporteDinamico/ReporteDinamico.js)

Caracteristicas:

- origen de datos: estructura dinamica recibida del servidor
- filtrado: externo y por buscador del grid
- ordenamiento: cliente
- paginacion: cliente
- acciones: exportar y explorar informacion
- permisos: implicitos por acceso a reporte
- exportacion: `ExcelJS` manual con encabezados y formato construido en JavaScript
- riesgo de migracion: alto

Importancia para esta auditoria:

Es el ejemplo local mas cercano, por comportamiento, a lo que en la siguiente fase deberia soportar `CheckAppDynamicGrid`.

### 3.6 Patron 6: Grid dentro de modal o con tablas embebidas

Ejemplos:

- [`checklist/wwwroot/js/Respuestas/Respuestas.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Respuestas/Respuestas.js)
- [`checklist/wwwroot/js/Resultados/Resultados.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Resultados/Resultados.js)

Caracteristicas:

- origen de datos: cliente, derivado de una pantalla principal
- filtrado: buscadores propios del grid o sin filtrado visible
- ordenamiento: cliente
- paginacion: cliente
- acciones: ver detalle, ver anexos, navegar
- permisos: condicionados por acceso al modulo
- exportacion: presente en algunos grids secundarios
- riesgo de migracion: alto

Riesgo principal:

La responsividad, el scroll, el sticky header y los anchos de columna se vuelven mas delicados dentro de modales.

### 3.7 Conclusiones del inventario

- El patron tecnico dominante hoy es `DataTables` cliente.
- No se encontro evidencia representativa de `serverSide: true` como patron consolidado.
- No se encontro un grid reusable unificado.
- La futura solucion debe soportar:
  - listados CRUD simples
  - filtros externos
  - columnas dinamicas
  - tablas anchas
  - exportacion heterogenea
  - coexistencia con modales

## 4. Comparacion tecnica CheckApp vs. Tarahumara

### 4.1 Material real auditado de Tarahumara

Material disponible y revisado:

- [`/Users/denissemendiola/Downloads/ui.zip`](</Users/denissemendiola/Downloads/ui.zip>)
- [`/Users/denissemendiola/Downloads/css.zip`](</Users/denissemendiola/Downloads/css.zip>)
- [`/Users/denissemendiola/Downloads/FilterAccordion.razor.zip`](</Users/denissemendiola/Downloads/FilterAccordion.razor.zip>)
- [`/Users/denissemendiola/Downloads/TarahumaraDynamicGrid.razor.rz.scp.css.zip`](</Users/denissemendiola/Downloads/TarahumaraDynamicGrid.razor.rz.scp.css.zip>)
- [`/Users/denissemendiola/Downloads/TarahumaraPro.md.zip`](</Users/denissemendiola/Downloads/TarahumaraPro.md.zip>)

El material disponible permite auditar:

- documentacion de patron
- CSS tematico
- CSS aislado del grid
- componente `FilterAccordion.razor`

No fue posible auditar en codigo real, porque no fue proporcionado en los archivos adjuntos:

- `TarahumaraDynamicGrid.razor`
- servicios C# reales de exportacion
- modelos C# de columnas y configuracion
- JavaScript real del patron Tarahumara
- dependencias del proyecto Blazor donde corre

Por lo tanto, la auditoria de Tarahumara es parcial y basada solo en el material efectivamente entregado.

### 4.2 Diferencia de arquitectura

Tarahumara:

- patron orientado a `Blazor`
- referencias documentales a `MudBlazor`
- uso de `RenderFragment`
- CSS aislado de componentes
- contratos documentados con `Dictionary<string, JsonElement>`
- exportacion descrita con `ClosedXML`

CheckApp:

- `ASP.NET Core MVC`
- vistas Razor clasicas
- `jQuery` + `DataTables`
- scripts de modulo
- exportacion actual mediante `DataTables Buttons` y `ExcelJS`

Conclusion:

La compatibilidad no es directa. Tarahumara no puede integrarse como copia de componentes dentro del stack actual de CheckApp.

### 4.3 Analisis por elemento

#### TarahumaraDynamicGrid

Responsabilidad documentada:

- grid oficial para datos dinamicos
- busqueda, ordenamiento, paginacion, selector de columnas, exportacion, responsive, tarjetas moviles, resumen y estados visuales

Dependencias:

- Blazor
- probable `MudBlazor`
- contratos C# de datos dinamicos
- CSS aislado
- exportacion documentada con `ClosedXML`

Que puede reutilizarse conceptualmente:

- definicion del contrato funcional esperado
- selector de columnas con restriccion de no ocultar la ultima columna visible
- footer fuera del scroll horizontal
- mobile cards
- summary slot
- estados vacio/cargando/error
- sticky header

Que podria portarse:

- reglas funcionales
- orden de prioridades del MVP
- criterios de exportacion
- conceptos de responsividad

Que necesita reescribirse:

- todo el componente tecnico
- contratos de columnas y formateadores
- motor de rendering
- integracion con filtros externos
- exportacion

Que no es compatible con CheckApp:

- `RenderFragment`
- `Dictionary<string, JsonElement>` como contrato primario de UI
- `ClosedXML` como solucion asumida sin agregar dependencias ni servicios
- CSS de aislamiento propio de Blazor

Que no debe copiarse:

- clases `tara-*` y `tdg-*`
- nombres de tokens Tarahumara
- implementacion especifica para MudBlazor

#### FilterAccordion

Responsabilidad real observada:

- contenedor reutilizable para filtros
- expandir/colapsar
- resumen visible
- cuerpo persistente aunque colapsado
- accesibilidad con `aria-expanded` y `aria-controls`

Dependencias:

- Blazor
- parametros de componente Razor
- variables CSS `--tara-*`

Que puede reutilizarse conceptualmente:

- patron UX de resumen visible
- cuerpo persistente para no perder estado de filtros
- boton accesible para alternar expansion

Que necesita reescribirse:

- toda la implementacion tecnica para MVC y JavaScript

Que no es compatible:

- binding bidireccional de Blazor con `ExpandedChanged`
- `RenderFragment` para `ChildContent` y `SummaryContent`

#### CSS Tarahumara

Responsabilidad real observada:

- define tokens, estilos base, grid, acordeon, estados y responsive

Que puede reutilizarse conceptualmente:

- disciplina de tokens
- separacion entre patron principal y secundario
- responsive por comportamiento y no solo por ancho

Que no debe copiarse:

- paleta Tarahumara
- nombres de variables `--tara-*`
- clases utilitarias asociadas al patron hermano

### 4.4 Dictamen de compatibilidad general

La compatibilidad general con Tarahumara es `parcial y conceptual`.

Es viable tomar Tarahumara como referencia de:

- contrato funcional
- accesibilidad
- responsividad
- selector de columnas
- estructura de exportacion

No es viable tomarlo como referencia de:

- implementacion tecnica directa
- componentes listos para copiar
- servicios exportadores ya reutilizables
- contratos C# de UI tal como estan documentados para Blazor

## 5. Contrato propuesto de CheckAppDynamicGrid

La propuesta siguiente es tecnica y no implica implementacion en esta fase.

### 5.1 Principio de construccion

`CheckAppDynamicGrid` debe construirse como un artefacto propio de CheckApp compatible con MVC y JavaScript por pantalla. La propuesta mas realista para la siguiente fase es una envoltura reusable sobre el stack actual, con contrato declarativo de columnas, acciones, filtros, estados y exportacion.

### 5.2 Estructura propuesta

Bloques funcionales:

- contenedor raiz del grid
- toolbar superior
- buscador general
- zona de acciones
- zona opcional de resumen
- tabla principal con scroll horizontal
- footer de paginacion y rango
- contenedor de estados
- contenedor responsive para vista movil

### 5.3 Contrato propuesto de configuracion

Configuracion sugerida:

- `gridId`
- `dataSource`
- `columns`
- `defaultSort`
- `pageSize`
- `pageSizeOptions`
- `enableSearch`
- `enableColumnSelector`
- `enableExportExcel`
- `enableResponsiveCards`
- `enableStickyHeader`
- `enableServerOperations`
- `rowActions`
- `summary`
- `permissions`
- `texts`
- `formatters`
- `events`

### 5.4 Contrato propuesto de columnas

Cada columna debera contemplar al menos:

- `key`
- `title`
- `visible`
- `hideable`
- `sortable`
- `searchable`
- `filterable`
- `type`
- `width`
- `align`
- `format`
- `exportable`
- `responsivePriority`
- `cellTemplate` o `render`
- `headerClass`
- `cellClass`

Tipos sugeridos:

- `text`
- `number`
- `currency`
- `percentage`
- `date`
- `datetime`
- `boolean`
- `badge`
- `image`
- `actions`

### 5.5 Capacidades funcionales requeridas

El contrato debe contemplar:

- columnas visibles y ocultas
- busqueda general
- filtros externos e internos
- ordenamiento
- paginacion
- selector de columnas
- exportacion Excel
- acciones por fila
- encabezado fijo
- scroll horizontal
- responsive
- cards moviles cuando aplique
- loading state
- empty state
- error state
- totales o resumenes
- permisos
- accesibilidad
- formateo de fecha, numero, porcentaje y moneda
- soporte de grandes volumenes
- operaciones del servidor cuando aplique

### 5.6 Responsabilidad por capa

Frontend:

- rendering
- interaccion
- orden visual
- validaciones basicas de experiencia
- presentacion de estados

Backend:

- logica de negocio
- permisos reales
- datos filtrados autorizados
- exportaciones de gran volumen si llegaran a requerirse

### 5.7 MVP propuesto

Funcionalidades MVP:

- grid reusable para MVC
- columnas declarativas
- busqueda general
- ordenamiento cliente
- paginacion cliente
- scroll horizontal
- encabezado fijo cuando la estructura lo permita
- acciones por fila
- estados vacio, carga y error
- exportacion Excel del conjunto filtrado en memoria
- selector de columnas basico
- responsive minimo con overflow horizontal y ocultamiento controlado

### 5.8 Funciones futuras

Funciones futuras sugeridas:

- mobile cards completas por fila
- filtros por columna avanzados
- persistencia de preferencias por usuario y pantalla
- totales y agregados por columna
- pin de columnas
- operaciones server-side para grandes volumenes
- exportacion masiva orquestada desde servidor
- vistas resumen o agrupaciones

## 6. Contrato propuesto de CheckAppFilterAccordion

### 6.1 Objetivo

`CheckAppFilterAccordion` debe ser un patron reutilizable e independiente para filtros, usable con o sin `CheckAppDynamicGrid`.

### 6.2 Entradas propuestas

- `accordionId`
- `title`
- `expanded`
- `summary`
- `filters`
- `showApplyButton`
- `showClearButton`
- `disabled`
- `permissions`
- `texts`

### 6.3 Eventos propuestos

- `onToggle`
- `onApply`
- `onClear`
- `onFilterChange`

### 6.4 Estados propuestos

- expandido
- colapsado
- sin filtros activos
- con filtros activos
- deshabilitado
- error de carga de catalogos, si existiera un insumo remoto

### 6.5 Comportamiento funcional esperado

- mostrar resumen visible aun cuando el acordeon este colapsado
- preservar el estado de los controles al colapsar
- permitir limpiar filtros
- permitir aplicar filtros
- reflejar visualmente filtros activos
- operar tanto como contenedor visual independiente como integrado al grid

### 6.6 Responsive y accesibilidad

Debe contemplar:

- header clickeable con semantica de boton
- `aria-expanded`
- `aria-controls`
- orden de tabulacion correcto
- resumen legible en escritorio y movil
- distribucion apilada en pantallas pequenas

### 6.7 Relacion con CheckAppDynamicGrid

Relacion recomendada:

- independencia tecnica
- acoplamiento funcional opcional
- el acordeon emite filtros y el grid decide aplicarlos
- el grid no debe depender obligatoriamente del acordeon

## 7. Estrategia de exportacion Excel

### 7.1 Estado actual en CheckApp

CheckApp exporta hoy de dos maneras:

- botones estandar de `DataTables`
- exportacion manual con `ExcelJS` en reportes complejos

Evidencias representativas:

- [`checklist/wwwroot/js/Puestos/Puestos.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Puestos/Puestos.js)
- [`checklist/wwwroot/js/ReporteListado/ReporteListado.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ReporteListado/ReporteListado.js)
- [`checklist/wwwroot/js/ReporteDinamico/ReporteDinamico.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ReporteDinamico/ReporteDinamico.js)

### 7.2 Estado documentado en Tarahumara

La documentacion de Tarahumara describe exportacion con `ClosedXML`, pero no se entrego el servicio real ni su implementacion concreta. Por lo tanto, no existe base valida para asumir portacion directa.

### 7.3 Propuesta tecnica para CheckApp

Decisiones propuestas:

- en el MVP, exportar todos los registros filtrados que ya esten cargados en memoria, no solo la pagina visible
- exportar solo columnas visibles y exportables
- respetar encabezados visibles del grid
- aplicar formatos consistentes para fecha, numero, moneda y porcentaje
- generar nombre de archivo con patron estable:
  - `modulo_yyyyMMdd_HHmm`
- usar `ExcelJS` cuando el grid necesite control fino de encabezados, formatos o columnas dinamicas
- permitir uso de exportacion simple solo en pantallas CRUD basicas si el comportamiento sigue siendo equivalente y controlado

### 7.4 Limites de volumen

Propuesta:

- cliente para datasets pequenos o medianos ya cargados
- si una futura pantalla usa paginacion real de servidor o volumen alto, la exportacion completa no debe resolverse solo desde cliente

Implicacion:

El contrato de `CheckAppDynamicGrid` debe prever dos modos futuros:

- exportacion cliente
- exportacion delegada al servidor

### 7.5 Permisos y errores

La exportacion debe:

- respetar permisos efectivos de la pantalla
- no exponer columnas ocultas por permiso
- mostrar error de usuario no tecnico si falla la generacion
- registrar internamente el detalle tecnico segun la estrategia existente del proyecto

## 8. Estrategia de tokens y CSS

### 8.1 Paleta obligatoria

Base obligatoria para el futuro patron:

- `#FF9230`
- `#4791AA`
- `#333638`
- `#39394D`
- `#FAFAFA`

Semanticos permitidos:

- exito
- error
- advertencia
- informacion
- exportacion Excel
- acciones secundarias

Los colores semanticos no deben dominar la interfaz.

### 8.2 Tokens necesarios

Tokens recomendados:

- `--checkapp-color-primary`
- `--checkapp-color-secondary`
- `--checkapp-color-text`
- `--checkapp-color-surface`
- `--checkapp-color-surface-alt`
- `--checkapp-color-border`
- `--checkapp-color-muted`
- `--checkapp-color-success`
- `--checkapp-color-error`
- `--checkapp-color-warning`
- `--checkapp-color-info`
- `--checkapp-color-excel`
- `--checkapp-radius-sm`
- `--checkapp-radius-md`
- `--checkapp-shadow-sm`
- `--checkapp-shadow-md`
- `--checkapp-spacing-xs`
- `--checkapp-spacing-sm`
- `--checkapp-spacing-md`
- `--checkapp-spacing-lg`
- `--checkapp-font-size-sm`
- `--checkapp-font-size-md`
- `--checkapp-font-size-lg`

### 8.3 Compatibilidad con Bootstrap y estilos existentes

Conclusiones:

- conviene usar prefijo `checkapp-` en variables y clases
- no conviene redefinir variables globales de Bootstrap como primer paso
- no conviene intervenir clases nativas como `.table`, `.btn`, `.card` de forma global

### 8.4 Estrategia de nombres y alcance

Recomendacion:

- variables: `--checkapp-*`
- clases de componentes: `.checkapp-grid-*`, `.checkapp-filter-*`, `.checkapp-theme-*`
- alcance inicial por contenedor:
  - `.checkapp-scope`

Objetivo:

Evitar colisiones con pantallas legacy y permitir coexistencia temporal con estilos antiguos.

### 8.5 Riesgo de colisiones

Riesgos reales:

- los bundles actuales ya estilizan tablas, botones y formularios
- varias pantallas agregan dependencias locales
- una hoja global sin alcance puede alterar reportes, modales y CRUD existentes

Mitigacion:

- aplicar el futuro CSS por prefijo y contenedor
- no sobreescribir clases genericas globales en la primera fase

## 9. MVP propuesto

MVP sugerido para la siguiente fase:

- `checkapp-theme.css` con tokens y clases encapsuladas
- `CheckAppDynamicGrid` para MVC/JavaScript
- `CheckAppFilterAccordion` reusable e independiente
- soporte para:
  - columnas declarativas
  - buscador general
  - filtros externos
  - ordenamiento cliente
  - paginacion cliente
  - exportacion Excel en cliente para datos cargados
  - estados visuales
  - selector de columnas basico
  - responsive controlado sin alterar layout global

## 10. Funciones futuras

- mobile cards avanzadas
- totales y agregados configurables
- filtros por columna
- persistencia por usuario y pantalla
- operaciones server-side
- exportacion masiva desde servidor
- agrupaciones o vistas resumidas
- plantillas de acciones mas complejas

## 11. Estrategia gradual de adopcion

### 11.1 Adopcion visual

Aplica cuando una pantalla:

- no requiere reemplazo del motor de tabla
- necesita solo orden visual
- tiene riesgo alto de tocar logica funcional

Incluye:

- colores
- botones
- tarjetas
- encabezados
- estilos de tabla
- responsive cosmetico

### 11.2 Adopcion estructural

Aplica cuando una pantalla:

- tiene un grid aislable
- usa patron repetible
- no depende de modales anidados complejos
- puede validarse facilmente

Incluye:

- sustitucion del grid actual
- filtros
- ordenamiento
- exportacion
- paginacion
- acciones
- responsive estructural

### 11.3 Criterios de decision

Solo adopcion visual:

- reportes complejos
- tablas dentro de modales
- columnas dinamicas altamente personalizadas
- pantallas con exportacion especial o edicion sensible

Adopcion estructural:

- CRUD simples
- tablas administrativas estables
- pantallas con baja complejidad de permisos
- datasets medianos y validables

## 12. Pantalla piloto recomendada

Pantalla recomendada:

- [`checklist/Views/Puestos/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Puestos/Index.cshtml)

Justificacion:

- bajo riesgo
- patron representativo del CRUD administrativo actual
- datos suficientes para validar grid, acciones y exportacion
- ausencia de logica critica de reporte dinamico
- ausencia de edicion inline compleja
- facil de comparar antes y despues

Pantallas no recomendadas como primer piloto:

- `ReporteDinamico` por columnas dinamicas y exportacion compleja
- `ReporteListado` por modales y flujos compuestos
- `Operadores` por dependencia de permisos y reglas de operacion

## 13. Riesgos y mitigaciones

### 13.1 Colisiones de CSS

Riesgo:

- afectar pantallas legacy por estilos globales

Mitigacion:

- prefijos `checkapp-*`
- alcance por contenedor
- no redefinir globalmente `.table`, `.btn` o `.card` en la primera implementacion

### 13.2 Dependencia de jQuery

Riesgo:

- romper pantallas existentes si la nueva solucion asume un stack distinto

Mitigacion:

- construir el patron para convivir inicialmente con `jQuery` y `DataTables`

### 13.3 Incompatibilidad MVC vs. Tarahumara

Riesgo:

- intentar copiar una implementacion Blazor no portable

Mitigacion:

- usar Tarahumara solo como referencia funcional y visual, no como copia tecnica

### 13.4 Grandes volumenes

Riesgo:

- degradacion si todo se resuelve en cliente

Mitigacion:

- dejar soporte server-side como extension futura del contrato

### 13.5 Paginacion del servidor

Riesgo:

- el patron actual esta orientado a cliente

Mitigacion:

- disenar el contrato con `enableServerOperations` desde la fase de definicion

### 13.6 Permisos

Riesgo:

- mostrar acciones o columnas no autorizadas

Mitigacion:

- conservar la validacion real del lado servidor y usar el grid solo como capa de presentacion

### 13.7 Edicion inline o flujos acoplados

Riesgo:

- pantallas con formularios, modales o cascadas de eventos pueden romperse

Mitigacion:

- no usar esos casos como piloto

### 13.8 Exportaciones

Riesgo:

- inconsistencia entre botones `DataTables` y `ExcelJS`

Mitigacion:

- unificar reglas de columnas, encabezados, formato y nombre de archivo en el futuro componente

### 13.9 Responsive

Riesgo:

- tablas anchas y modales en movil

Mitigacion:

- adoptar responsive en capas: primero scroll horizontal controlado, despues cards moviles donde aplique

### 13.10 Regresiones de navegacion o acciones

Riesgo:

- los botones por fila dependen hoy de selectores y eventos existentes

Mitigacion:

- mantener en el piloto las mismas acciones y contratos de datos

### 13.11 Componentes dentro de modales

Riesgo:

- problemas de ancho, z-index, focus y scroll

Mitigacion:

- excluir modales complejos de la primera implementacion

### 13.12 Coexistencia temporal de grids

Riesgo:

- convivencia entre tablas viejas y nuevas durante varias fases

Mitigacion:

- nombres de clase aislados
- inicializacion explicita por pantalla
- adopcion gradual sin sustitucion masiva

## 14. Archivos que deberan crearse en la siguiente fase

Propuesta de archivos para la fase de implementacion:

- `checklist/wwwroot/css/checkapp-theme.css`
- `checklist/wwwroot/js/ui/CheckAppDynamicGrid.js`
- `checklist/wwwroot/js/ui/CheckAppFilterAccordion.js`
- `checklist/wwwroot/js/ui/checkapp-grid-formatters.js`
- `checklist/wwwroot/js/ui/checkapp-grid-export.js`

Nota:

Estos archivos son solo propuesta tecnica para la siguiente fase. No fueron creados en esta auditoria.

## 15. Archivos que deberan modificarse en la siguiente fase

Segun el piloto sugerido, se anticipa modificacion futura de:

- [`checklist/Views/Puestos/Index.cshtml`](/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Puestos/Index.cshtml)
- [`checklist/wwwroot/js/Puestos/Puestos.js`](/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Puestos/Puestos.js)

Si se decide una adopcion visual inicial sin cambiar estructura:

- la vista piloto
- su script de pantalla
- sin tocar `_Layout.cshtml` en la primera implementacion, salvo autorizacion futura expresa

## 16. Criterios de aceptacion para la implementacion

- el nuevo grid funciona en la pantalla piloto sin alterar rutas, permisos ni contratos funcionales
- no se modifica `_Layout.cshtml` sin autorizacion expresa
- no se introducen colisiones visibles en pantallas legacy
- el buscador, ordenamiento y paginacion reproducen el comportamiento esperado del caso piloto
- la exportacion Excel respeta columnas visibles, encabezados y formatos definidos
- los estados vacio, carga y error son claros y no tecnicos
- el responsive no rompe acciones ni lectura principal
- la solucion queda encapsulada para permitir coexistencia con grids antiguos

## 17. Dictamen tecnico

Dictamen:

CheckApp si puede evolucionar hacia un patron oficial de grid y filtros inspirado en las reglas de Tarahumara, pero no mediante copia tecnica. La implementacion correcta debe ser propia del stack `ASP.NET Core MVC + Razor + JavaScript`, con convivencia temporal con `DataTables`, encapsulacion estricta de CSS y una primera adopcion en una pantalla CRUD de bajo riesgo.

La evidencia auditada respalda avanzar a la siguiente fase con un `CheckAppDynamicGrid`, un `CheckAppFilterAccordion` y un `checkapp-theme.css` propios de CheckApp, siempre que el alcance permanezca incremental, sin cambios globales tempranos y sin asumir compatibilidad directa con Blazor.
