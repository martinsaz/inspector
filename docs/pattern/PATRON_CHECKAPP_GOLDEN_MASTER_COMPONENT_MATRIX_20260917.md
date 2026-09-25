# Matriz Golden Master CheckApp - ProductosServicios - 2026-09-17

ProductosServicios runtime (`/ProductosServicios/Index`) es el Golden Master absoluto para homologaciones UI/UX CheckApp. Esta matriz se construyo desde los archivos fuente reales auditados:

- `inspector/checklist/Views/ProductosServicios/Index.cshtml`
- `inspector/checklist/Views/ProductosServicios/_ProductosServiciosCatalogModal.cshtml`
- `inspector/checklist/wwwroot/css/checkapp-theme.css`
- `inspector/checklist/wwwroot/css/ProductosServicios/ProductosServicios.css`
- `inspector/checklist/wwwroot/js/checkapp-ui.js`
- `inspector/checklist/wwwroot/js/ProductosServicios/ProductosServicios.js`
- `inspector/checklist/wwwroot/js/ProductosServicios/ProductosServiciosCatalogModalShared.js`

| Elemento | Componente fuente | Archivo | Clase/token | Valor/comportamiento | Responsive | Donde reutilizar | Prohibiciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A Fondo de pagina | Shell CheckApp | `checkapp-theme.css` | `.checkapp-page`, `--ca-bg` | Fondo calido `#FBF1EA`; padding operativo compacto | Sin overflow accidental | Proveedores, Sucursales, Razones, Regiones | Fondos alternos por modulo |
| B Container | Shell fluido | `Index.cshtml`, `checkapp-theme.css` | `.checkapp-scope .checkapp-shell`, `.container-fluid` | Contenido fluido en grid con gap `1.1rem` | Se adapta a viewport | Todas las pantallas del patron | Containers paralelos o anchos fijos |
| C Page header | Hero funcional | `Index.cshtml`, `checkapp-theme.css` | `.checkapp-hero` | Header transparente con divisor rojo, no tarjeta | Acciones se reacomodan en mobile | Encabezado de modulo | Hero en tarjeta blanca tipo legacy |
| D Eyebrow | Kicker oficial | `checkapp-theme.css` | `.checkapp-kicker`, `.checkapp-panel-eyebrow` | Uppercase rojo, peso 800, `0.76rem` | Escala estable | Hero, paneles y modal | Eyebrow con color local |
| E Titulo | Titulos CheckApp | `checkapp-theme.css` | `.checkapp-hero h1`, `.checkapp-panel-head h2` | Peso 900, escala compacta, color `--ca-text` | No escala por viewport width arbitrario | Titulos de pagina/panel | Titulos browser-default |
| F Descripcion | Copy de panel | `checkapp-theme.css` | `.checkapp-panel-copy`, `.checkapp-hero p` | Texto muted, margen corto | Ajuste natural de linea | Descripcion de modulo y listado | Texto tecnico visible |
| G Filter card | Accordion filtros | `Index.cshtml`, `checkapp-ui.js` | `.checkapp-panel.checkapp-accordion`, `CheckAppFilterAccordion` | Panel plegable con resumen de filtros | Campos bajan a 2/1 columnas | Filtros de targets | Filtros fuera de accordion oficial |
| H Grid card | Panel listado | `Index.cshtml`, `checkapp-ui.js` | `.checkapp-panel`, `CheckAppUI.createDynamicGrid` | Toolbar, buscador, columnas, contador, exportacion, paginacion | Scroll controlado y footer responsive | Listados targets | DataTables local paralelo |
| I Tipografia | Tokens globales | `checkapp-theme.css` | `--ca-text`, `--ca-text-muted` | Inter/Arial, pesos 700-900 en headers, labels compactos | Sin font-size basado en viewport | Todas | Letter-spacing negativo o escalado vw |
| J Spacing | Gaps oficiales | `checkapp-theme.css`, `ProductosServicios.css` | `.checkapp-shell`, `.ps-filter-grid`, `.ps-form-grid` | Gaps `0.65rem-1.1rem`; padding panel/modal consistente | Gaps reducidos en mobile | Formas y filtros | Espaciados inventados por pantalla |
| K Colors | Tokens CheckApp | `checkapp-theme.css` | `--ca-primary #EC0000`, `--ca-surface`, `--ca-border` | Paleta roja + superficie blanca + fondo calido | Contraste preservado | Toda UI | Hardcodear grises/rojos paralelos |
| L Borders | Bordes oficiales | `checkapp-theme.css` | `--ca-border` | Borde suave `#E6E1DC` | Sin solapes | Paneles, inputs, grids | Bordes default browser |
| M Radius | Radios oficiales | `checkapp-theme.css` | `--ca-radius-sm 8px`, `--ca-radius 14px`, `--ca-radius-lg 20px` | Controles 8-14px; modal/panel 14-20px segun fuente | Estables | Botones, inputs, paneles | Radios ajenos tipo legacy |
| N Shadow | Elevacion oficial | `checkapp-theme.css` | `--ca-shadow-sm`, `--ca-shadow` | Sombra ligera y funcional | Sin capas excesivas | Paneles y modales | Sombras decorativas paralelas |
| O Inputs | Campos Golden Master | `ProductosServicios.css`, `checkapp-theme.css` | `.checkapp-field`, `.ps-form-field`, `.ps-filter-field` | Input alto, borde token, radio oficial, label compacto | 4/3/2/1 columnas segun viewport | Formularios targets | Controles HTML default sin estilo |
| P Selects | Select CheckApp/select2 | `ProductosServicios.css`, adaptador | `.form-select`, `.select2-container` | Misma altura/radio que input | Ocupa ancho completo | Sucursal razon/region | Select legacy plano |
| Q HTML editor | TinyMCE oficial | `ProductosServicios.js`, `ProductosServiciosCatalogModalShared.js` | `tinymce.init`, `.checkapp-richtext-input` | Toolbar `blocks/bold/lists/alignment/link/code/removeformat`, sin menubar/statusbar | Alto estable | Descripcion/Notas libres | Textarea plano sin excepcion PO |
| R Buttons | Botones oficiales | `checkapp-theme.css`, `ProductosServicios.css` | `.checkapp-btn-*`, `.ps-filter-search-btn` | Primario rojo con icono/texto blanco, ghost neutral, Excel verde | Width completo en mobile si requiere | Acciones targets | Icono gris en rojo/primario |
| S Icons | Contraste oficial | `ProductosServicios.css` | `.checkapp-btn-primary i`, `.ps-filter-search-btn i` | Iconos `currentColor`/blanco sobre fondo destacado | Preserva contraste | Botones y acciones | Iconos muted en fondo rojo |
| T Modal header | Modal oficial | `ProductosServicios/Index.cshtml` | `.modal-header`, `.ps-modal-content` | Kicker + titulo + cerrar icon-only | Header no se colapsa | Modales targets | Header legacy plano |
| U Modal body | Layout modal PS | `ProductosServicios/Index.cshtml`, `ProductosServicios.css` | `.ps-modal-body`, `.ps-form-layout`, `.ps-block-panel` | Body con paneles internos funcionales y grid oficial | Grid baja a 3/2/1 columnas | Alta/edicion targets | Formularios lineales browser-default |
| U2 Modal catalogo SIMPLE / COMPACTO | PS-ACT-01S-R5: Categorias, Marcas, Unidades de medida, Colecciones, Etiquetas | `_ProductosServiciosCatalogModal.cshtml`, `ProductosServicios.css`, `ProductosServiciosCatalogModalShared.js` | `.ps-catalog-modal-*`, `[data-quick-catalog-layout]` | Header `REGISTRO` + titulo + campos directos + TinyMCE solo si el contrato lo requiere + footer `Cancelar`/`Guardar`; Etiqueta solo Nombre | Ancho compacto en desktop; tablet/mobile adaptan al viewport; altura segun contenido, sin igualar artificialmente | Catalogos clasificados como SIMPLE tras auditar formulario real | Segunda card interna, textos `Informacion de...`, subtitulos tecnicos, aire artificial, ancho compacto como regla universal |
| V Modal footer | Footer oficial | `ProductosServicios/Index.cshtml` | `.modal-footer`, `.checkapp-btn-ghost`, `.checkapp-btn-primary` | Orden `Cancelar` -> `Guardar`; acciones derechas | Botones full width en mobile | Modales editables | Footer invertido o iconos grises |
| W Grid actions | Acciones de fila | `ProductosServicios.css`, `ProductosServiciosCatalogos.js`, adaptador | `.ps-catalog-actions` | Botones de icono independientes para `Editar`, `Dar de baja` y `Reactivar`; area clickeable estable, separacion visible, icono centrado, tooltip, hover/focus y contraste oficial | Target tactil estable; sin overflow en desktop/tablet/mobile | Categorias, Sucursales, Razones, Regiones y futuros catalogos | Acciones texto sueltas, iconos pegados, icono gris sobre rojo/rosa/primario o baja logica como delete fisico |
| X Pagination | Footer DynamicGrid | `checkapp-theme.css` | `.checkapp-grid-footer`, `.checkapp-grid-page-chip`, `.checkapp-grid-nav-btn` | Filas 25/50/100, pagina, prev/next | Se apila en mobile | Todos los grids | Paginacion DataTables default |
| Y Responsive | Media queries oficiales | `checkapp-theme.css`, `ProductosServicios.css`, adaptador | `@media 1199/991/640` | Filtros y forms bajan columnas; acciones no se solapan | Desktop/tablet/mobile obligatorio | Targets auditados | Overflow incoherente o botones cortados |

## Aplicacion en esta reconstruccion

- `/Sucursales/SucursalesABC`, `/RazonesSociales/Index` y `/Regiones/Index` migran su wrapper a `checkapp-scope checkapp-page`.
- Las vistas cargan `checkapp-theme.css` antes de `ProductosServicios.css`.
- `checkapp-admin-catalogs.css` queda como adaptador minimo sobre Golden Master; ya no redefine hero, panel, botones, tabla ni tokens base.
- Los catalogos simples usan `ps-catalog-modal-*` siguiendo el Patron CheckApp - Catalogos V1: body directo con campos reales, editor solo si aplica por contrato, sin `ps-form-layout`, sin panel interno `ps-block-panel`, sin copy tecnico y sin altura homologada artificialmente.
- Los filtros usan `ps-filter-grid`, `ps-filter-field`, `ps-filter-tail` y `ps-filter-search-btn`.
- Los listados conservan `CheckAppUI.createDynamicGrid`, exportacion Excel, columnas, contador y paginacion oficial.

## DynamicGrid catalogos administrables - 2026-09-18

- Golden Master especifico: `/ProductosServicios/Categorias`.
- Targets oficiales: `/Sucursales/SucursalesABC`, `/RazonesSociales/Index`, `/Regiones/Index`.
- La toolbar debe conservar `visibles`, `Columnas`, `Exportar Excel`, buscador interno, contador de registros, paginacion 25/50/100, acciones compactas y estados empty/loading/error.
- Entidades con `borrado` deben mostrar `Estatus`, filtro `Estatus`, badge oficial y acciones `Dar de baja`/`Reactivar` sin hard delete.
- Las acciones de fila de catalogos usan exclusivamente `.ps-catalog-actions`: botones de icono independientes, mismo alto/ancho, tooltip `Editar`/`Dar de baja`/`Reactivar`, hover/focus oficial, contraste correcto y sin iconos grises sobre fondos rojos/rosas/primarios.
- Default PO: activos visibles para preservar Sucursales=5, Razones=1, Regiones=5; `Todos` incluye activos e inactivos y `Baja logica` muestra solo inactivos.
- Descripcion/Notas HTML se editan con TinyMCE oficial y se muestran en grilla como texto saneado, sin tags crudos.
- Runtime A-Y debe comparar contra Categorias, no contra una interpretacion previa del patron.

## Comparacion A-Y requerida

La comparacion visual runtime A-Y queda pendiente de ejecucion en navegador autenticado si `5200` no esta levantado por el Product Owner. Un PASS documental, build o static check no sustituye esta comparacion.
