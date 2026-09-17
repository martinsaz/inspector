# Patron CheckApp Oficial - ProductosServicios - 2026-09-16

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
- Modal principal: shell CheckApp grande, secciones colapsables, footer oficial de alta/edicion `[Cancelar][Guardar]`.
- Modales de catalogo: kicker `REGISTRO` o contexto, titulo grande, campos limpios, footer `[Cancelar][Guardar]`.

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

- Botones: `checkapp-btn`, `checkapp-btn-primary`, `checkapp-btn-secondary`, `checkapp-btn-ghost`, `checkapp-btn-excel`.
- Paneles: `checkapp-panel`, `checkapp-panel-head`, `checkapp-panel-eyebrow`, `checkapp-panel-copy`.
- Filtros: accordion `checkapp-accordion`, resumen de chips, acciones Buscar/Limpiar.
- DynamicGrid: buscador interno, contador, columnas configurables, export Excel, acciones, paginacion, loading/empty/error.
- Formularios: `checkapp-field`, selects `form-select`, radios/checkbox cuando sean decisiones binarias o de conjunto.
- Modales alta/edicion: footer `[Cancelar][Guardar]`; `Cerrar` solo para lectura, ficha, visor o flujo posterior sin edicion pendiente.
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
- Si se levantan servidores locales, liberar y verificar puertos `5200` y `5127` al terminar.

## Dictamen documental

ProductosServicios queda formalizado como pantalla base oficial CheckApp para homologaciones futuras. Los cambios de esta fase corrigen el footer del modal principal, centralizan el editor HTML para descripciones conceptuales de ProductosServicios y catalogos aplicables, preservan sanitizacion backend, y dejan resuelta por Product Owner la decision de tipo SQL: las descripciones HTML futuras en catalogos/colecciones deben usar `NVARCHAR(MAX)` mediante contrato versionado y migracion T17.

## Anexo 2026-09-17 - Scopes pequenos

- Los scopes nuevos pueden tener menos de 20 tablas; el probe SQL debe registrar siempre todos los parametros declarados por el query para evitar falsos `UNAVAILABLE`.
- La deteccion de objetos extra debe usar el prefijo del scope actual, no un prefijo fijo de `ProductosServicios`.
- Certificacion real `Scope=Sucursales` V1 en `CheckAppErp`: PASS para bootstrap, idempotencia, drift reversible, locking, CRUD multitenant y gate final `COMPATIBLE`.
- Cierre posterior: AuthZ real debe leer `dbo.Usuarios`/`dbo.Roles` desde la fuente legacy autorizada cuando la base tenant no contiene identidad/permisos. `CheckAppErp` no debe recibir DDL de identidad para resolver permisos.
- Cierre posterior: ProductosServicios debe estar en V2 (`SchemaOk`, `DriftCount=0`, `COMPATIBLE`) antes de declarar completo un scope que convive en `CheckAppErp`.
