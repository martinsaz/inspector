# Patron CheckApp Oficial - ProductosServicios - 2026-09-16

## V3 UI/UX Proveedores + Sucursales - 2026-09-17

- El core oficial PO de 30 controles permanece congelado, no se modifica ni se sustituye; los controles 31-36 son extension operativa separada para UI/UX V3.
- ProductosServicios es GOLDEN MASTER LITERAL para layout, botones, DynamicGrid, filtros, modales, editor HTML, estados y responsive. No usarlo como inspiracion parcial.
- Descripcion y Notas libres usan siempre el editor HTML oficial TinyMCE local, salvo excepcion funcional explicita aprobada por PO.
- Persistencia de Descripcion/Notas HTML: `NVARCHAR(MAX)` mediante contrato versionado/migracion oficial; no usar `ALTER` manual aislado.
- Sanitizacion server-side/XSS obligatoria con allowlist de HTML; scripts, handlers, estilos peligrosos, tags no permitidos y href no seguro deben eliminarse antes de persistir.
- No crear componentes visuales paralelos si ProductosServicios ya tiene componente equivalente.
- Catalogos administrativos simples usan el Golden Master `ProductosServicios -> quick-add -> Nueva categoria`: header, campos, editor HTML si aplica y footer. No usar automaticamente el modal principal complejo.
- En catalogos simples no agregar segunda card interna, encabezados tipo `Informacion de...`, subtitulos tecnicos/decorativos ni aire artificial. La densidad debe corresponder a la complejidad real y no dejar columnas vacias.
- Iconos sobre fondo primario, rojo, rosa o componente destacado usan contraste oficial (`currentColor`/blanco segun componente); nunca icono gris sobre fondo rojo/primario.
- QA manual posterior del Product Owner invalida cualquier PASS tecnico contradictorio.
- Cierre UI/UX requiere comparacion runtime real A-Y contra ProductosServicios en navegador autenticado; build, markup o screenshot aislado no sustituyen esa comparacion.
- Puertos: si Codex inicia procesos locales debe liberarlos; si `5200`/`5127` ya estaban levantados manualmente por el Product Owner, no cerrarlos.
- Proveedores V3: codigo autogenerado server-side y no capturable; fila 01 Nombre; fila 02 Descripcion HTML; fila 03 Razon social/RFC/Telefono; fila 04 Telefono 1/Email/[Limite + Clasificacion contable en tercera columna]; fila 05 Cuenta contable/Contacto/Cuenta bancaria; no existe fila 06.
- Scope Sucursales V2: `RazonesSociales.Notas`, `Zonas.Notas`, `SucursalesTipos.Notas` y `Sucursales.Notas` deben ser `NVARCHAR(MAX)` por migracion oficial `SUC-M20260917-V1-V2-NOTAS-NVARCHAR-MAX`.

## DynamicGrid catalogos administrables - 2026-09-18

- Golden Master literal para catalogos administrables: `/ProductosServicios/Categorias`.
- Cuando una entidad tenga baja logica (`borrado`), el DynamicGrid debe exponer `Estatus`, filtro `Estatus`, badge oficial, accion de baja logica y accion de reactivacion; no usar hard delete.
- El listado default de Sucursales/Razones/Regiones muestra registros activos para preservar conteos PO (`5/1/5`); el filtro `Todos` incluye activos e inactivos, y `Baja logica` muestra solo inactivos.
- Acciones de fila, buscador interno, contador visibles/registros, Columnas, Exportar Excel, paginacion 25/50/100, empty/loading/error y responsive deben salir de `CheckAppUI.createDynamicGrid` o del adaptador compartido; no crear DataTables/componentes paralelos.
- DYNAMICGRID / ACCIONES: los catalogos CheckApp deben usar el action-group oficial `.ps-catalog-actions` definido en `ProductosServicios.css`. `Editar`, `Dar de baja` y `Reactivar` son botones de icono independientes, con area clickeable homologada, icono centrado, separacion consistente, tooltip, hover/focus accesible y contraste correcto. Nunca usar icono gris sobre fondo rojo/rosa/primario; la baja logica reversible no debe representarse como delete fisico.
- Descripcion/Notas HTML se capturan con TinyMCE oficial, se sanitizan server-side y se renderizan en grid como texto seguro, sin tags crudos ni ejecucion.
- Endpoints de baja/reactivacion deben validar AuthZ especifico, Scope Sucursales, Gate compatible, `DatabaseIdentity`, `idEmpresa` server-side y permiso de escritura; padres no autorizan hijos.
- Para esta ejecucion PO 2026-09-18, si se usan `5200`/`5127` durante QA tecnico, deben quedar liberados al final y verificados con `lsof` sin listeners.

## Extension operativa V3 - controles 31-36

31. Descripcion/Notas libres usan editor HTML oficial.
32. Descripcion/Notas HTML persisten en `NVARCHAR(MAX)` con sanitizacion server-side.
33. Icono sobre fondo primario/rojo/rosa usa contraste oficial; nunca gris.
34. No crear componente visual paralelo cuando exista equivalente en ProductosServicios.
35. QA manual posterior del Product Owner invalida PASS tecnico contradictorio.
36. Homologacion solo cierra tras comparacion runtime A-Y contra ProductosServicios.

## Estado

- Pantalla base oficial: `/ProductosServicios/Index`.
- Alcance: Productos y Servicios, catalogos asociados y componentes reutilizables derivados.
- T25: FROZEN. No iniciar T25 ni aplicar homologacion a otras rutas sin autorizacion explicita del Product Owner.
- Prohibido: Firebase, Hosting, Conexiones tenant, DDL destructivo, `nxt_*`, reasignar Denisse, quitar proteccion SuperAdmin.

## Referencia visual auditada

- Sidebar: arbol izquierdo con Proveeduria, Productos y Servicios, ABC Productos y Servicios y Catalogos.
- Header: barra negra superior, logo CheckApp, modo de trabajo, usuario y empresa.
- Pagina base: fondo calido claro, contenido centrado, ancho fluido.
- Eyebrow: uppercase rojo (`#dc2626` / familia roja CheckApp), peso 700, tamano aproximado `0.72rem`.
- Titulo principal: texto fuerte `#0f172a`, peso 700/800, escala compacta para herramienta operativa.
- Paneles: `checkapp-panel`, fondo `#fff`, borde suave, sombra ligera, radio predominante `1rem`.
- Boton primario: rojo CheckApp `#ff4336`, hover `#e63629`, texto blanco.
- Boton secundario: estilo delineado/neutral o rojo segun accion; botones con icono cuando aplique.
- Boton Excel: verde operativo, texto blanco.
- Inputs/selects: borde `rgba(15, 23, 42, 0.18)`, radio `0.85rem` a `1rem`, altura minima `2.4rem` catalogo y `4rem` modal.
- Badges/chips: radio `999px`, colores por estado: verde activo, azul informativo, rojo/ambar advertencia.
- Grid: DynamicGrid con buscador interno, contador, panel de columnas, exportacion Excel, acciones por fila, paginacion, estados loading/empty/error.
- Modal principal complejo: shell CheckApp grande, secciones colapsables, footer oficial de alta/edicion `[Cancelar][Guardar]`; usarlo solo cuando la complejidad funcional lo justifique.
- Modales de catalogo simple: Golden Master `ProductosServicios -> quick-add -> Nueva categoria`; kicker `REGISTRO`, titulo, campos directos, editor HTML si aplica y footer `[Cancelar][Guardar]`, sin card interna ni texto tecnico.

## Tokens semanticos congelados

- `--ca-primary`: rojo CheckApp, equivalente visual `#dc2626`/`#ff4336` segun boton.
- `--ca-primary-hover`: `#e63629`.
- `--ca-text`: `#0f172a`.
- `--ca-text-secondary`: `#334155`.
- `--ca-text-muted`: `#64748b`.
- `--ca-border`: `rgba(15, 23, 42, 0.12)` a `rgba(15, 23, 42, 0.18)`.
- `--ca-surface`: `#fff`.
- `--ca-page-bg`: beige/calido claro actual de ProductosServicios.
- `--ca-success`: familia verde `#166534` / `#15803d`.
- `--ca-info`: familia azul `#1d4ed8` / `#2563eb`.
- `--ca-danger`: familia roja `#b91c1c` / `#dc2626`.
- Radios oficiales: controles `0.85rem`/`0.9rem`; paneles `1rem`; pills `999px`.

## Tipografia y layout

- No escalar fuentes con viewport width.
- No usar letter spacing negativo.
- Titulos hero solo para encabezados principales de pagina/modal; dentro de paneles usar escala compacta.
- Page sections son bandas o paneles funcionales, no tarjetas decorativas anidadas.
- Textos no deben solaparse ni quedar fuera de botones, chips, inputs o cards.
- Controles fijos deben tener dimensiones estables para evitar layout shift.

## Componentes oficiales

- Golden Master literal vigente: `/ProductosServicios/Index`; matriz obligatoria para homologacion en `inspector/docs/pattern/PATRON_CHECKAPP_GOLDEN_MASTER_COMPONENT_MATRIX_20260917.md`.
- Golden Master literal de DynamicGrid para catalogos administrables: `/ProductosServicios/Categorias`.
- Golden Master de catalogo simple: `/ProductosServicios/Index` -> quick-add -> `Nueva categoria`. Aplica a ABC Sucursales, Razones Sociales, Regiones y catalogos equivalentes.
- Botones: `checkapp-btn`, `checkapp-btn-primary`, `checkapp-btn-secondary`, `checkapp-btn-ghost`, `checkapp-btn-excel`.
- Paneles: `checkapp-panel`, `checkapp-panel-head`, `checkapp-panel-eyebrow`, `checkapp-panel-copy`.
- Filtros: accordion `checkapp-accordion`, resumen de chips, acciones Buscar/Limpiar.
- DynamicGrid: buscador interno, contador, columnas configurables, export Excel, acciones, paginacion, loading/empty/error.
- Acciones DynamicGrid catalogos: `.ps-catalog-actions` es el patron oficial para acciones de fila. Debe heredarse en `/ProductosServicios/Categorias`, `/Sucursales/SucursalesABC`, `/RazonesSociales/Index`, `/Regiones/Index` y futuros catalogos del Patron CheckApp.
- Filtros DynamicGrid: cuando un filtro viaja a MVC/API/SQL (`serverSide`), queda prohibido aplicarlo de nuevo sobre el `aaData` normalizado. En especial, `Estatus=activo/inactivo/todos` debe filtrarse en backend y no compararse en cliente contra booleanos (`true/false`) ni campos fisicos (`borrado`).
- Formularios: `checkapp-field`, selects `form-select`, radios/checkbox cuando sean decisiones binarias o de conjunto.
- Modales alta/edicion: footer `[Cancelar][Guardar]`; `Cerrar` solo para lectura, ficha, visor o flujo posterior sin edicion pendiente. Catalogos simples no llevan segunda card ni descripcion tecnica visible.
- Editor HTML: TinyMCE local, toolbar oficial `blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link unlink | code removeformat`, sin menubar, sin branding/statusbar.
- Sanitizacion backend: allowlist server-side; remover scripts, estilos peligrosos, handlers `on*`, tags no permitidos y href no seguro.

## Matriz de descripciones

| Entidad | Campo | UI actual | SQL actual | HTML si/no | Sanitizacion | Cambio requerido |
| --- | --- | --- | --- | --- | --- | --- |
| Producto/Servicio | Descripcion | TinyMCE homologado | `ProductosServicios.Descripcion NVARCHAR(MAX)` por contrato/migracion versionada | Si | `SanitizeRichTextHtml` | Ninguno pendiente |
| Categoria | Descripcion | TinyMCE homologado en modal catalogo | `ProductosServiciosCategorias.Descripcion NVARCHAR(MAX)` desde contrato V2 | Si | `SanitizeRichTextHtml` via normalizacion catalogo | `RESUELTO POR PRODUCT OWNER: NVARCHAR(MAX)` |
| Marca | Descripcion | TinyMCE homologado en modal catalogo | `ProductosServiciosMarcas.Descripcion NVARCHAR(MAX)` desde contrato V2 | Si | `SanitizeRichTextHtml` via normalizacion catalogo | `RESUELTO POR PRODUCT OWNER: NVARCHAR(MAX)` |
| Coleccion | Descripcion | TinyMCE homologado en quick modal | `ProductosServiciosColecciones.Descripcion NVARCHAR(MAX)` desde contrato V2 | Si | `SanitizeRichTextHtml` via normalizacion catalogo | `RESUELTO POR PRODUCT OWNER: NVARCHAR(MAX)` |
| Unidad de medida | Descripcion | No se muestra en UI | No persistida en SELECT operativo actual | No | N/A | Ninguno |
| Proveedores | Descripcion | TinyMCE homologado V3 | `ActivosProveedores.Descripcion NVARCHAR(MAX)` o equivalente versionado | Si | `CheckAppRichTextSanitizer`/allowlist server-side | Codigo no capturable; layout PO de 5 filas |
| Sucursales | Notas | TinyMCE homologado V3 | `Sucursales.Notas NVARCHAR(MAX)` por contrato Sucursales V2 | Si | `CheckAppRichTextSanitizer` | Migracion oficial, preservar 5 registros |
| Razones Sociales | Notas | TinyMCE homologado V3 | `RazonesSociales.Notas NVARCHAR(MAX)` por contrato Sucursales V2 | Si | `CheckAppRichTextSanitizer` | Migracion oficial, preservar 1 registro |
| Regiones/Zonas | Notas | TinyMCE homologado V3 | `Zonas.Notas NVARCHAR(MAX)` por contrato Sucursales V2 | Si | `CheckAppRichTextSanitizer` | Migracion oficial, preservar 5 registros |

## Permisos oficiales

- `05000000` Proveeduria: agrupador, Acceso unicamente.
- `05001000` Productos y Servicios: agrupador, Acceso unicamente. `Escritura` legacy, si existe, se ignora.
- `05001001` ABC Productos y Servicios: Acceso + Escritura.
- `05001002` Catalogos: agrupador, Acceso unicamente.
- `05001003` Categorias: Acceso + Escritura.
- `05001004` Marcas: Acceso + Escritura.
- `05001005` Unidades de medida: Acceso + Escritura.
- Padres no conceden permisos a hijos.
- Backend/API es autoridad final; UI/menu solo refleja visibilidad.
- SuperAdmin sigue protegido contra edicion manual en RolesPermisos.

## Schema y runtime

- Preservar arquitectura T11-T24: `DatabaseIdentity + Scope`, contrato versionado, classifier, `State/History/Attempts`, bootstrap EMPTY, baseline ADOPTED, migrations, drift, locking y gate.
- Contrato vigente: V2. V1 permanece inmutable como baseline historico.
- Cambio V2 aprobado por PO: solo `ProductosServiciosCategorias.Descripcion`, `ProductosServiciosMarcas.Descripcion` y `ProductosServiciosColecciones.Descripcion` pasan de `NVARCHAR(500)` a `NVARCHAR(MAX)`.
- Migracion autorizada: `PS-M20260916-V1-V2-DESCRIPCIONES-NVARCHAR-MAX`, ejecutada por T17 con lock, transaccion, History/Attempts, validacion fisica y preservacion de datos.
- Scope Sucursales vigente: V2. V1 permanece inmutable. Cambio V2 aprobado por PO: columnas `Notas` de `RazonesSociales`, `Zonas`, `SucursalesTipos` y `Sucursales` pasan a `NVARCHAR(MAX)` por `SUC-M20260917-V1-V2-NOTAS-NVARCHAR-MAX`.
- Bases EMPTY provisionan directo con V2; bases V1 deben migrar por T17 y no por `ALTER` aislado.
- No permitir `Unknown` por bypass.
- No ejecutar DDL fuera de migraciones versionadas.
- No cambiar Conexiones ni resolver tenant desde cliente.

## QA obligatorio al homologar desde este patron

- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`.
- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`.
- `git -C inspectorapi diff --check`.
- `git -C inspector diff --check`.
- Comparacion visual runtime contra ProductosServicios: obligatoria para declarar UI/UX PASS. Markup/CSS/build/tests no sustituyen inspeccion autenticada real en navegador. Controles con apariencia browser-default o legacy visible son FAIL.
- Si Codex levanta servidores locales, debe liberar y verificar los puertos que abrio antes de entregar. En tickets #MOKA donde PM/PO ordene liberar `5200`/`5127`, ambos puertos deben quedar sin listeners al final para QA manual del PO.

## Dictamen documental

ProductosServicios queda formalizado como pantalla base oficial CheckApp para homologaciones futuras. Los cambios de esta fase corrigen el footer del modal principal, centralizan el editor HTML para descripciones conceptuales de ProductosServicios y catalogos aplicables, preservan sanitizacion backend, y dejan resuelta por Product Owner la decision de tipo SQL: las descripciones HTML futuras en catalogos/colecciones deben usar `NVARCHAR(MAX)` mediante contrato versionado y migracion T17.

## Anexo 2026-09-17 - Scopes pequenos

- Los scopes nuevos pueden tener menos de 20 tablas; el probe SQL debe registrar siempre todos los parametros declarados por el query para evitar falsos `UNAVAILABLE`.
- La deteccion de objetos extra debe usar el prefijo del scope actual, no un prefijo fijo de `ProductosServicios`.
- Certificacion real `Scope=Sucursales` V1 en `CheckAppErp`: PASS para bootstrap, idempotencia, drift reversible, locking, CRUD multitenant y gate final `COMPATIBLE`.
- Cierre posterior: AuthZ real debe leer `dbo.Usuarios`/`dbo.Roles` desde la fuente legacy autorizada cuando la base tenant no contiene identidad/permisos. `CheckAppErp` no debe recibir DDL de identidad para resolver permisos.
- Cierre posterior: ProductosServicios debe estar en V2 (`SchemaOk`, `DriftCount=0`, `COMPATIBLE`) antes de declarar completo un scope que convive en `CheckAppErp`.
- Cierre UI/UX 2026-09-17: Proveedores y el bloque Sucursales/Razones/Regiones deben reutilizar el lenguaje visual runtime de ProductosServicios para hero, filtros, grid, modales, footer `[Cancelar][Guardar]`, responsive y estados. No declarar cierre total si el navegador autenticado no pudo completar la comparacion.
- Reconstruccion UI/UX 2026-09-17: queda prohibido reintroducir `checkapp-admin-page` o CSS que redefina hero/panel/botones/grid base para Sucursales/Razones/Regiones. La capa `checkapp-admin-catalogs.css` debe ser adaptador de dominio sobre `checkapp-theme.css` + `ProductosServicios.css`, no un sistema visual paralelo.
