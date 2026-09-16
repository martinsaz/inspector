# POST-T24 DOCUMENTACION CONSOLIDADA Y T25 FROZEN, 2026-09-16

Estado posterior a T24 documentado en `POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`. Se registra la evolucion post-T23/T24: regresion de menu/RolesPermisos por arbol hardcodeado sin `05000000`/`05001000`, correccion de Proveeduria/ProductosServicios en RolesPermisos, actualizacion administrativa controlada de SuperAdmin preservando su proteccion, correccion de Denisse de `QA Activos 163` a SuperAdmin en SQL/Firebase, arbol definitivo `05000000`-`05001005`, regla de granularidad y agrupadores de solo Acceso.

T25 queda `FROZEN / NO INICIADO FORMALMENTE`. No ejecutar T25, no preparar T25, no modificar Hosting, no modificar bases QA reservadas, no iniciar bootstrap ni QA manual hasta autorizacion explicita del Product Owner.

# PRODUCTOSSERVICIOS_PERMISSION_GRANULARITY_REGRESSION, 2026-09-16 actualizacion 15:25

Correccion T23/T24 aplicada para que ProductosServicios no dependa del permiso padre como autorizacion implicita de opciones hijas. Actualizacion puntual: `05001000` es agrupador igual que `05001002`; controla solo acceso/visibilidad de rama y no expone ni usa escritura. Si `05001000.Escritura` existe en JSON legacy de roles anteriores, queda como dato legacy ignorado y no concede WRITE. La regla vigente queda:

- `05000000` Proveeduria: padre/menu.
- `05001000` Productos y Servicios: modulo/rama, solo Acceso.
- `05001001` ABC Productos y Servicios: pantalla navegable `/ProductosServicios/Index`.
- `05001002` Catalogos: grupo/acordeon, solo Acceso.
- `05001003` Categorias: pantalla navegable `/ProductosServicios/Categorias`.
- `05001004` Marcas: pantalla navegable `/ProductosServicios/Marcas`.
- `05001005` Unidades de medida: pantalla navegable `/ProductosServicios/UnidadesMedida`.

El padre `05001000` no concede automaticamente acceso a hijos ni escritura de ABC. Menu, MVC y API deben evaluar el codigo especifico de la opcion/operacion; ausencia del permiso granular falla cerrado. RolesPermisos muestra el arbol completo y conserva la proteccion que impide editar manualmente SuperAdmin. Para QA PO se realizo una habilitacion administrativa controlada del SuperAdmin actual de la empresa del Product Owner, con snapshot BEFORE/AFTER exacto de `Roles.Permisos`, agregando/actualizando exclusivamente `05001001`, `05001002`, `05001003`, `05001004` y `05001005` con acceso requerido y escritura en las opciones navegables. No se reconstruyo el JSON desde cero y el resto de permisos permanecio intacto.

QA tecnica de esta regresion: `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal` PASS 395/395; builds API/MVC PASS; `git diff --check` PASS. Sin DDL, sin Firebase, sin Hosting, sin Conexiones tenant, sin `nxt_*`, sin asignacion masiva y sin modificar otros roles.

# T23 - certificacion AuthZ final fuente real Roles/Permisos #MOKA, 2026-09-14

Fuente real identificada y usada: conexion legacy configurada `ConnectionStrings:CadenaConexionSQLServer`, base `db_a883c3_checklist`. Validado contra SQL real: `dbo.Usuarios` disponible, `dbo.Roles` disponible, columna `Roles.Permisos` disponible, 124 roles existentes y relacion `Usuarios.idRol` -> `Roles.id` por `idEmpresa` con 51 joins reales. No se imprimio ni persistio ConnectionString.

Preflight de codigos en `Roles.Permisos`: `05000000` libre y `05001000` libre, sin colision SQL real.

QA AuthZ real: se crearon tres roles y tres usuarios QA bajo una empresa GUID temporal: NOACCESS (`Acceso=0`, `Escritura=0`), READONLY (`Acceso=1`, `Escritura=0`) y WRITE (`Acceso=1`, `Escritura=1`). `ProductosServiciosAuthorizationService` evaluo la fuente real configurada: NOACCESS denego READ/WRITE, READONLY permitio READ y denego WRITE, WRITE permitio READ/WRITE, y usuario/rol de otra empresa no autorizo. Cleanup elimino 6 filas temporales; remanentes QA: 0 roles y 0 usuarios.

Correccion de cierre: `ProductosServiciosAuthorizationService` ahora usa la fuente legacy configurada para Roles/Permisos (`ConnectionStrings:CadenaConexionSQLServer`) y mantiene fallback a tenant solo si esa configuracion no existe en pruebas. Tambien se removio el guard obsoleto que trataba `05001000` como codigo pendiente.

CheckAppErp final confirmado en ejecucion anterior de este cierre contra SQL real: `CurrentVersion=1`, ManifestHash V1 `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`, T18 `SchemaOk`, `DriftCount=0`, T20 `COMPATIBLE`. CheckAppErp no se uso para Roles/Permisos ni se le agregaron tablas.

Regresion final: `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal` PASS 388/388; build API PASS; build MVC PASS; `git diff --check` PASS en `inspectorapi` e `inspector`. Secret scan repo: `SECRET_HITS=0`.

Control: no DDL, no nuevas tablas, no copia Roles/Usuarios a CheckAppErp, no `nxt_*`, no Firebase, no Hosting, no Conexiones tenant, no asignacion masiva, no roles productivos ajenos, no T24.

Dictamen: T23 implementado y certificado contra la fuente real de Roles/Permisos; `05000000`/`05001000` libres, NOACCESS/READONLY/WRITE confirmados, fixtures restaurados, CheckAppErp permanece V1/SchemaOk/T20 compatible.

# T23 - certificacion SQL real con credencial PO #MOKA, 2026-09-14

Conexion QA autorizada por PO usada temporalmente en memoria para `CheckAppErp`; no se persistio en codigo, appsettings, repositorio, AGENTS, CLAUDE ni documentacion, y no se imprimio en evidencia final. Escaneo de repositorios: `SECRET_HITS=0`.

Preflight SQL real `CheckAppErp`: `dbo.Roles` no existe, `dbo.Usuarios` no existe y no hay columnas `Permisos` en tablas de la base. Por lo tanto no se encontro uso funcional previo de `05000000` ni `05001000` dentro de `CheckAppErp`, pero tampoco existe ahi el mecanismo `Roles.Permisos` que el AuthorizationService necesita para certificar NOACCESS/READONLY/WRITE real. No se creo el mecanismo porque T23 prohibe DDL/schema changes y prohibe redisenar Roles/Permisos.

CheckAppErp final confirmado contra SQL real: `CurrentVersion=1`, `ManifestHash=4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`, T18 `SchemaOk`, `DriftCount=0`, T20 `COMPATIBLE`. No se ejecutaron DDL ni cambios de schema, no se modificaron Firebase, Hosting, Conexiones tenant ni roles productivos, no hubo asignacion masiva y no se inicio T24.

Correccion de cierre aplicada en codigo: se removio el guard obsoleto que trataba el codigo aprobado `05001000` como pendiente dentro de `ProductosServiciosAuthorizationService`. Sin esa correccion, el permiso aprobado habria fallado cerrado siempre.

Regresion final disponible: `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal` PASS 388/388; build API PASS; build MVC PASS; `git diff --check` PASS en `inspectorapi` e `inspector`.

Dictamen vigente: T23 queda implementado y con CheckAppErp V1/SchemaOk certificado; la certificacion AuthZ SQL real NOACCESS/READONLY/WRITE no puede cerrarse en `CheckAppErp` porque esa base no contiene el mecanismo `Roles.Permisos` requerido y no se permite crearlo ni modificar schema.

# T23 - certificacion SQL final solicitada #MOKA, 2026-09-14

Ejecucion limitada por entorno: `MOKA_CHECKAPPERP_QA_CONNECTION` no esta disponible para el proceso, zsh login ni launchctl. Por restriccion expresa, no se uso connection string fija, no se imprimio ningun secreto y no se ejecuto SQL real.

Resultado SQL real: no ejecutado. No fue posible validar en SQL real si `05000000` o `05001000` existen en `Roles.Permisos`, no fue posible persistir fixtures QA NOACCESS/READONLY/WRITE, ni confirmar `CurrentVersion`, `ManifestHash`, T18, `DriftCount` o T20 final en CheckAppErp durante esta ejecucion.

Regresion disponible ejecutada: `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal` PASS 388/388; `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal` PASS; `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal` PASS; `git diff --check` PASS en `inspectorapi` e `inspector`.

Control: no DDL, no schema changes, no Firebase, no Hosting, no Conexiones tenant, no `nxt_*`, no asignacion masiva, no T24.

Dictamen de esta ejecucion: T23 permanece implementado y verificado localmente con `05001000`, pero la certificacion SQL final y cierre productivo quedan bloqueados hasta que `MOKA_CHECKAPPERP_QA_CONNECTION` este realmente visible para el proceso de ejecucion.

# TICKET 23 - cierre final AuthZ ProductosServicios #MOKA, 2026-09-14

Decision PO aplicada: `05000000` Proveeduria y `05001000` Productos y Servicios. La configuracion quedo en `ProductosServicios:PermissionCode = 05001000` en API y MVC, y el valor default de codigo funcional propio quedo en `05001000`; `02000000` permanece como Inspecciones y no autoriza ProductosServicios.

Preflight local de colision: no se encontro uso funcional exacto de `05000000` o `05001000` como codigo `Roles.Permisos` de otro modulo en codigo/configuracion local. El unico hallazgo heredado relacionado fue `m05001000` en `wwwroot/js/Utilerias.js`, usado como identificador de breadcrumb/menu de Configuracion/Roles y Permisos, con prefijo `m`; no es el codigo JSON exacto `05001000`. No se detecto colision funcional local que obligue a `COLISION_CODIGO_PERMISO`.

Persistencia SQL real de QA: no ejecutada porque no existe `MOKA_CHECKAPPERP_QA_CONNECTION` en el entorno de ejecucion. Por esta restriccion no se consulto ni modifico `CheckAppErp.Roles.Permisos` real, no se crearon fixtures reales NOACCESS/READONLY/WRITE y no se hizo asignacion administrativa en base. Se conserva la restriccion de no usar connection string fija ni inventar acceso a SQL.

AuthZ implementada: `IProductosServiciosAuthorizationService` / `ProductosServiciosAuthorizationService` centraliza AuthZ server-side para ProductosServicios con `Acceso`/`Escritura`, usando usuario autenticado + empresa autorizada + rol de esa empresa desde `Usuarios.idRol` a `Roles.Permisos` JSON. API aplica AuthZ despues de T11/T12 y antes de T20/T22/SQL de negocio. MVC y menu consultan el mismo codigo funcional `05001000` para ocultar/bloquear acceso directo, sin desplazar la autoridad del backend.

Matriz protegida: 51 endpoints identificados; 24 READ y 27 WRITE. READ requiere `Acceso=1`; WRITE requiere `Acceso=1` y `Escritura=1`. NOACCESS/MISSING bloquea antes de gate/SQL; READONLY permite lectura y bloquea escritura antes de gate/SQL. `02000000` con Acceso/Escritura no concede ProductosServicios.

QA automatizada disponible: `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal` PASS 388/388. Builds API y MVC PASS. `git diff --check` PASS en `inspectorapi` e `inspector`. Warnings observados son preexistentes/de dependencia o nulabilidad/analyzers no introducidos como errores por T23.

Dictamen operativo vigente: implementacion T23 aplicada y verificada localmente con el codigo PO `05001000`; cierre productivo queda limitado por imposibilidad de preflight/persistencia/QA SQL real sin conexion QA disponible en entorno. No se inicio T24.

# TICKET 23 — resultado completo #MOKA

Fecha: 2026-09-14. **NO CERRADO.** Implementación y certificación independiente de contexto realizadas; certificación integral de AuthZ bloqueada por una regla funcional no definida. No se solicita nueva autorización de alcance.

## REQUIERE_DECISION_PO

- Punto exacto: paso 7 AuthZ de la cadena T23; QA real 18, test obligatorio 30 y checklist 41/69. Falta identificar el permiso/política de ProductosServicios y su aplicación a lectura/escritura/exportación/inventario/multimedia.
- Evidencia: MVC `checklist/Controllers/ProductosServicios/ProductosServiciosController.cs:16` sólo declara `[Authorize]`; API valida contexto, pero no tiene una comprobación de permiso funcional. `checklist/Controllers/HomeController.cs:826` agrega el menú de ProductosServicios directamente. No se encontró una política funcional aplicada a este vertical que se pueda conservar como 403.
- El contrato exige AuthN != AuthZ y prohíbe redefinir roles/permisos. Elegir un código, inferir permisos por menú o declarar autorizado a todo usuario autenticado inventaría una regla. Tampoco se ha implantado un bloqueo total inventado.
- Impacto: las solicitudes con contexto auténtico siguen sin control funcional por operación. La suite técnica aprobada no certifica este requisito ni habilita T24.
- Opciones técnicas, sin elegir por PO: vincular el vertical al permiso existente que el PO identifique, reutilizando su evaluador; o recibir una política explícita aprobada que defina operaciones y sujetos autorizados. Después implementar su enforcement y prueba negativa 403, y repetir regresión/QA.

## Implementación y fuentes de autoridad

| Dato | Fuente efectiva | Clasificación y validación |
|---|---|---|
| UserId | NameIdentifier de principal MVC autenticado; sujeto del proxy API | SIGNED_AUTH_CONTEXT; obligatorio, consistente, string Firebase UID, no convertido obligatoriamente a GUID |
| EmpresaKey | Sid MVC; empresa firmada API o claim de principal autenticado API | SIGNED_AUTH_CONTEXT; no fallback a query; alias consistentes |
| idEmpresa | SerialNumber MVC; GUID firmado API o claim autenticado | SIGNED_AUTH_CONTEXT; GUID no vacío; T11 verifica igualdad |
| Conexión | ITenantConnectionReader / TenantDatabaseResolver | TRUSTED_SERVER_SIDE; tenant activo y descriptor concordante; QA sustituye sólo lector por fixture |
| DatabaseIdentity | T12 desde conexión resuelta | DERIVED_SERVER_SIDE; request no participa; fallo impide negocio |
| Scope | DatabaseScopes.ProductosServicios | TRUSTED_SERVER_SIDE; fijo en código |
| Roles/permisos | No existe comprobación funcional identificada en PS | PENDIENTE REGLA PO, no confundir autenticación con autorización |
| Inputs cliente | query, route, form, JSON, multipart, headers, hidden, JS, storage, cookie no validada, ReturnUrl | UNTRUSTED_CLIENT_INPUT; no constituyen autoridad |

Se reutilizan TenantDatabaseContext y TenantDatabaseDescriptor. RequestContext/SignedProxyContext internos quedan init-only. El helper nuevo valida identidad; no es otro catálogo de tenants ni un motor de autorización. UID autenticado permanece string; el actor SQL GUID opcional existente no se usa como sustituto de autenticidad.

MVC exige principal autenticado y claims SerialNumber/Sid/NameIdentifier no vacíos ni contradictorios, sesión coherente si está presente y clave de firma configurada antes de ejecutar acciones. Conserva la normalización de idEmpresa en JSON/query/multipart T11. Empresa query discordante se rechaza. No se rediseña Login/Auth ni se transforma un valor de sesión aislado en autoridad.

API rechaza claims de principal no autenticado, alias contradictorios, campos faltantes, duplicados y formatos inválidos del proxy. Si recibe principal autenticado y proxy, ambos deben coincidir. Valida la firma del protocolo existente HMAC-SHA256 y comparación constante. Mantiene los cuatro campos del payload y la misma clave configurada; no introduce criptografía ni nonce nuevos. UID ya no se pierde cuando Firebase lo representa como texto no GUID.

La ventana existente es valor absoluto de cinco minutos respecto del timestamp: incluye tolerancia de reloj futuro y permite replay dentro de esa ventana. Fuera de ventana se rechaza; no se afirma protección de un solo uso. Un claim exp presente debe ser válido/no expirado. La validación criptográfica de cookies pertenece al middleware MVC existente; la rama de principal API presupone middleware autenticador, no convierte claims enviados en principal. El proxy no es JWT: issuer/audience no forman parte de su contrato; no se ha inventado un esquema JWT nuevo.

Orden efectivo: Auth/claims y consistencia → T11/descriptor/conexión → T12 dentro del gate T20 → compatibilidad T20 → T22 NO-OP → T21/operación. **La etapa AuthZ requerida entre T12 y T20 está ausente**, por eso no se certifica la cadena completa. Ninguna conexión de negocio se crea antes de contexto. Las lecturas de metadata T12/T20 son necesarias para evaluar compatibilidad; no se presentan como SQL de negocio.

Query/form idEmpresa, empresaId o tenantId discordantes producen 403; empresa/empresaKey discordante produce 403. Parámetros de conexión reconocidos se rechazan; cualquier otro campo no está conectado a la selección SQL. JSON IdEmpresa ajeno produce 400 por contrato DTO; no se procesa como empresa efectiva. Scope/DatabaseIdentity arbitrarios se ignoran y no cambian destino. Headers tenant arbitrarios no son autoridad; los headers reservados del proxy necesitan firma y consistencia. ID de producto ajeno produce 404. T20 BLOCK conserva 503, no 401.

T11 conserva Status activo, coincidencia de idEmpresa y validación de conexión. T12/T18/T20 siguen verificando identidad, versión/hash y físico. T21 mantiene filtros de propiedad/empresa. T22 sigue NO_CHANGES/NO_REQUIRED_COMPANY_SEEDS, cero semillas, sin DDL ni estado empresarial nuevo. Se preserva la doble evaluación de metadata T20 (controller y T22); no se optimiza fuera de alcance.

## Errores, logs y límites

Se eliminaron excepciones completas del logging del controller, resolver y gate; quedan referencia y razón genéricas. Identidad textual en logs T20/T22 se reemplazó por SHA256 de correlación, sin conexión/servidor/token. No se registran payloads firmados ni claves. Las pruebas de errores con canarios y las de logs T22 verifican saneamiento; esto no equivale a inspeccionar logs históricos de infraestructura.

Sin cambios en CORS/TLS, Firebase, Hosting, datos Conexiones, Login, schema SQL ni contrato V1. Sin tenants productivos ni datos productivos para escenarios QA. Las filas preexistentes sólo se usan para digest de integridad, no como casos funcionales. No se invoca carga/borrado válido contra Storage. La prueba multimedia cubre ownership API y rechazo previo a almacenamiento; **no certifica revocación o privacidad de URLs directas Firebase ya emitidas**. No se certificó login interactivo Firebase. Los procesos HTTP existentes no fueron reiniciados: la QA actual invoca los controllers compilados con SQL real, no simula un despliegue.

## Matriz de endpoints

Convenciones: A = autenticidad/claims/firma obligatorios; P = permiso funcional pendiente PO en todas las filas; C = contexto canónico inmutable; R = cliente discordante rechazado/normalizado, nunca autoridad; T11/T20/T21 = controles existentes preservados; E = exportación delega a listado protegido. Los 51 endpoints tienen prueba automática sin identidad que exige 401 antes de resolver, gate o conexión. En cargas/limpiezas se audita también la protección de Storage; no se ejecutan mutaciones Firebase reales.

| Endpoint API | Auth | Permiso | Contexto | Campos tenant cliente / tratamiento | T11 | T20 | T21 | Mismatch | SQL negocio antes contexto |
|---|---|---|---|---|---|---|---|---|---|
| GET ObtenerProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerFichaTecnicaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ExportarFichaTecnicaProductoServicioPdf | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST SubirImagenTemporal | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST LimpiarImagenTemporal | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST SubirMultimediaTemporal | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST LimpiarMultimediaTemporal | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST BajaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST ActivarProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarPresentacionVentaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST BajaPresentacionVentaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST CalcularPresentacionesVentaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerCombosProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarTagProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET BuscarCatalogosSatProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerResumenProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ExportarProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | E | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerCategoriasProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerCategoriaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarCategoriaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST BajaCategoriaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST ActivarCategoriaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerCatalogoCategoriasProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ExportarCategoriasProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | E | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerMarcasProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerMarcaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarMarcaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST BajaMarcaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST ActivarMarcaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerCatalogoMarcasProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ExportarMarcasProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | E | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerUnidadesMedidaProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerUnidadMedidaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarUnidadMedidaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST BajaUnidadMedidaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST ActivarUnidadMedidaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerCatalogoUnidadesMedidaProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ExportarUnidadesMedidaProductosServicios | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | E | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarColeccionProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarPaqueteProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarAtributoProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerValoresAtributoProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST GuardarValorAtributoProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerExistenciaProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| GET ObtenerMovimientosInventarioProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST RegistrarEntradaInventarioProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST RegistrarSalidaInventarioProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST RegistrarAjustePositivoInventarioProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |
| POST RegistrarAjusteNegativoInventarioProductoServicio | A | P | C | idEmpresa/empresa y body/form según firma: R; Scope/identity ignorados | Sí | Sí | Propiedad/empresa | 401 contexto; 403 tenant; 400 DTO; 404 ID ajeno según caso | 0 |

## QA real/controlada (20 puntos)

SQL real con firma de proxy real y clave sintética sólo QA, lector T11 fixture A/B, conexión autorizada CheckAppErp. Se crearon siete filas propias en transacción y se eliminaron siete mediante IDs e idEmpresa en finally. Registro multimedia B apunta a example.invalid; no hay archivo remoto. Digests originales restaurados, cero filas preexistentes borradas. Snapshot de las 20 tablas, State/History/Attempts y físico sin cambios al terminar. Quince invocaciones T22 incluyen repetición y concurrencia A/A y A/B, cero seeds.

| Nº | Caso contrato | Evidencia / resultado |
|---|---|---|
| 1 | A válido → acceso propio si T20 compatible. | PASS SQL: listado/ficha/PDF A 200. |
| 2 | A + query Empresa B → bloqueado. | PASS SQL: query empresa B 403. |
| 3 | A + query idEmpresa B → no B. | PASS SQL: query GUID B 403. |
| 4 | A + JSON idEmpresa B → no B. | PASS SQL: DTO B 400. |
| 5 | A + multipart idEmpresa B → no B. | PASS controlador real: multipart B 403 antes de Storage. |
| 6 | A + header B → autoridad no cambia. | PASS suite: header arbitrario ignorado; SQL: proxy alterado 401. |
| 7 | A + DatabaseIdentity B → destino no cambia. | PASS SQL: destino no cambia. |
| 8 | A + Scope falso → Scope no cambia. | PASS SQL: scope no cambia. |
| 9 | claims contradictorios → bloqueado. | PASS suite: alias/principal-proxy contradictorios rechazados. |
| 10 | tenant inactivo → no SQL. | PASS T11 fixture+factory: no conexión. |
| 11 | tenant inexistente → no SQL. | PASS T11 fixture+factory: no conexión. |
| 12 | Conexiones mismatch → no SQL. | PASS T11 fixture+factory: no conexión. |
| 13 | ID producto B con A → no datos B. | PASS SQL: detalle y baja B 404. |
| 14 | PDF/ficha B con A → no contenido B. | PASS SQL: PDF B 404; propio 200. |
| 15 | multimedia B con A → no acceso/modificación. | PASS acotado: registro B no sale por ownership; guard multipart. Storage directo no certificado. |
| 16 | token/contexto inválido → no SQL. | PASS factory: firma inválida/expirada no abre SQL; expiración firmada también en suite. |
| 17 | Auth válido + T20 BLOCK → T20, no 401 falso. | PASS gate fixture: 503. No se induce drift/DDL. |
| 18 | Auth válido sin permiso → AuthZ existente. | PENDIENTE REQUIERE_DECISION_PO. |
| 19 | errores sin secretos. | PASS suite con excepción canario; respuestas reales 400/401/403/404/503 genéricas. |
| 20 | logs sin secretos. | PASS revisión de rutas y tests de logs; runner SQL usa NullLogger, no prueba captura de todos los logs en vivo. |

## Pruebas obligatorias y regresión

Comandos ejecutados desde la raíz: `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`, `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`, `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`. Resultado 384/384, cero fallos/omitidos; 105 casos T23 nuevos y 279 anteriores. Builds sin errores; API 6 y MVC 9 warnings de compatibilidad/dependencias existentes, no eliminados silenciándolos. git diff --check PASS en ambos repositorios.

Tests nuevos: ProductosServiciosSecurityContextTests (incluye 51 acciones por reflexión) y ProductosServiciosMvcContextTests. Fixtures T22 ahora incluyen sujeto autenticado obligatorio; prueba de log exige digest en lugar de identidad textual. Se referencia MVC desde el proyecto de tests para ejecutar su filtro real.

Los 38 requisitos no son 38 tests artificiales: la tabla distingue tests, SQL controlado, revisión de integridad y el requisito sin certificar. Login sólo tiene verificación de perímetro (302) y archivos intactos; API anónima 401 en runtime preexistente. No se atribuye a estas respuestas una sesión E2E autenticada ni despliegue del cambio.

| Nº | Requisito obligatorio | Validación |
|---|---|---|
| 1 | contexto válido. | PASS — suite T23 y regresión T11–T22. |
| 2 | claim faltante. | PASS — suite T23 y regresión T11–T22. |
| 3 | empresa claim faltante. | PASS — suite T23 y regresión T11–T22. |
| 4 | idEmpresa claim faltante. | PASS — suite T23 y regresión T11–T22. |
| 5 | claim mismatch. | PASS — suite T23 y regresión T11–T22. |
| 6 | tenant inexistente. | PASS — suite T23 y regresión T11–T22. |
| 7 | tenant inactivo. | PASS — suite T23 y regresión T11–T22. |
| 8 | Conexiones inexistente. | PASS — suite T23 y regresión T11–T22. |
| 9 | Conexiones idEmpresa mismatch. | PASS — suite T23 y regresión T11–T22. |
| 10 | ConnectionString inválida. | PASS — suite T23 y regresión T11–T22. |
| 11 | DatabaseIdentity cliente ignorada. | PASS — suite T23 y regresión T11–T22. |
| 12 | Scope cliente ignorado. | PASS — suite T23 y regresión T11–T22. |
| 13 | query empresa no suplanta. | PASS — suite T23 y regresión T11–T22. |
| 14 | query idEmpresa no suplanta. | PASS — suite T23 y regresión T11–T22. |
| 15 | JSON idEmpresa no suplanta. | PASS — suite T23 y regresión T11–T22. |
| 16 | multipart idEmpresa no suplanta. | PASS — suite T23 y regresión T11–T22. |
| 17 | header tenant no suplanta. | PASS — suite T23 y regresión T11–T22. |
| 18 | helper no acepta empresa arbitraria. | PASS — suite T23 y regresión T11–T22. |
| 19 | SQL no abre antes contexto. | PASS — suite T23 y regresión T11–T22. |
| 20 | T20 tras contexto válido. | PASS — suite T23 y regresión T11–T22. |
| 21 | T20 BLOCK no se convierte 401. | PASS — suite T23 y regresión T11–T22. |
| 22 | T21 preservado. | PASS — suite T23 y regresión T11–T22. |
| 23 | T22 NO-OP preservado. | PASS — suite T23 y regresión T11–T22. |
| 24 | ID ajeno no enumera. | PASS acotado — SQL QA A/B y guards T21; límite de Storage explicado arriba. |
| 25 | PDF/ficha aislada. | PASS acotado — SQL QA A/B y guards T21; límite de Storage explicado arriba. |
| 26 | multimedia aislada. | PASS acotado — SQL QA A/B y guards T21; límite de Storage explicado arriba. |
| 27 | logs sin ConnectionString. | PASS — logs saneados en rutas auditadas y pruebas de logs T22; no captura productiva. |
| 28 | logs sin token. | PASS — logs saneados en rutas auditadas y pruebas de logs T22; no captura productiva. |
| 29 | response sin secretos. | PASS — suite T23 y regresión T11–T22. |
| 30 | AuthZ preservada. | PENDIENTE — REQUIERE_DECISION_PO; ausencia de regla AuthZ, no test verde ficticio. |
| 31 | Login sin regresión. | PARCIAL — Login sin edición y 302; sin sesión interactiva autenticada. |
| 32 | endpoints ajenos sin regresión. | PARCIAL — suite/builds y archivos ajenos intactos; no E2E de todos los verticales. |
| 33 | no Firebase write. | PASS — auditoría de cambios/runner, sin escritura externa ni DDL ni T24. |
| 34 | no Hosting write. | PASS — auditoría de cambios/runner, sin escritura externa ni DDL ni T24. |
| 35 | no Conexiones write. | PASS — auditoría de cambios/runner, sin escritura externa ni DDL ni T24. |
| 36 | no DDL. | PASS — auditoría de cambios/runner, sin escritura externa ni DDL ni T24. |
| 37 | no T24. | PASS — auditoría de cambios/runner, sin escritura externa ni DDL ni T24. |
| 38 | T11–T22 preservados. | PASS — suite T23 y regresión T11–T22. |

## CheckAppErp final

CurrentVersion 1; ManifestHash `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`; T18 SchemaOk; DriftCount 0; T20 COMPATIBLE incluso después de cleanup. 20 tablas, 255 columnas, 50 índices adicionales, 24 FK y 14 CHECK. Identidad A/B igual, derivada por T12; evidencia publica digest de correlación en lugar de servidor/identidad completa. Ninguna migración ni DDL.

Evidencia reproducible: [RESULTADO_SQL_REAL.json](t23-qa/RESULTADO_SQL_REAL.json), [runner](t23-qa/Program.cs), [instrucciones](t23-qa/README.md). CreatedRows/DeletedRows=0 del JSON corresponden al NO-OP T22; FixtureRowsCreated/Deleted=7 corresponden a setup/cleanup QA. La evidencia no confunde ambas cifras.

## Archivos y defectos

Nuevos: API Services/Tenant/ProductosServiciosIdentityValidation.cs; tests Services/Tenant/ProductosServiciosSecurityContextTests.cs y ProductosServiciosMvcContextTests.cs; este informe; t23-qa/Program.cs, T23Qa.csproj, README.md y RESULTADO_SQL_REAL.json.

Modificados por T23: controllers ProductosServicios MVC/API; Services/Tenant/TenantDatabaseResolver.cs, ProductosServiciosCompatibilityGate.cs y ProductosServiciosCompanyBootstrapper.cs (saneamiento de logs); tests ProductosServiciosCompanyBootstrapperTests.cs y checklistWs.Tests.csproj; docs/database/t22-qa/Program.cs (subject fixture); AGENTS.md y CLAUDE.md de ambos repositorios. Los cambios previos T11–T22 presentes en git se conservaron; no se atribuyen a T23. Sin commit/push.

Defectos corregidos: principal con claims sin autenticación; alias contradictorios con precedencia silenciosa; empresa faltante sintetizada; UID Firebase descartado por conversión GUID; contexto firmado sin sujeto requerido; contradicción sesión/claims MVC; query/form tenant discrepante; logs de excepción/identidad sensibles. Cada corrección queda cubierta por suite. Defecto pendiente: falta control AuthZ funcional aplicado, requiere regla PO. No se debilita seguridad para pasar pruebas ni se inventa acceso funcional.

## Checklist #MOKA — 98 puntos

Los PASS acotados son evidencia del control descrito, no una certificación E2E de operaciones fuera del caso ejecutado. AuthZ pendiente impide cierre global.

| Nº | Punto literal del contrato | Resultado |
|---|---|---|
| 1 | T23 implementado: PASS/FAIL | FAIL de cierre integral: endurecimiento independiente implementado; falta regla AuthZ. |
| 2 | Alcance limitado T23: PASS/FAIL | PASS |
| 3 | T11–T22 preservados: PASS/FAIL | PASS de regresión técnica; 279 casos anteriores dentro de 384. |
| 4 | T24+ adelantado: NO | NO |
| 5 | Firebase modificado: NO | NO |
| 6 | Hosting modificado: NO | NO |
| 7 | Conexiones data modificada: NO | NO |
| 8 | Schema/DDL: NO | NO |
| 9 | UserId fuente: | NameIdentifier autenticado MVC; UID string firmado y validado API. |
| 10 | EmpresaKey fuente: | Sid autenticado MVC; empresa firmada API, validada por T11. |
| 11 | idEmpresa fuente: | SerialNumber autenticado MVC; GUID firmado y validado contra T11. |
| 12 | ConnectionString fuente: | Lector server-side T11 de Conexiones; QA usa lector fixture autorizado. |
| 13 | DatabaseIdentity fuente: | T12 a partir de conexión verificada; nunca request. |
| 14 | Scope fuente: | Constante DatabaseScopes.ProductosServicios. |
| 15 | Cliente impone empresa: NO | NO |
| 16 | Cliente impone idEmpresa: NO | NO |
| 17 | Cliente impone conexión: NO | NO |
| 18 | Cliente impone DatabaseIdentity: NO | NO |
| 19 | Cliente impone Scope: NO | NO |
| 20 | Descriptor canónico: | TenantDatabaseContext / TenantDatabaseDescriptor existentes. |
| 21 | Contexto inmutable: PASS/FAIL | PASS — contexto interno init-only. |
| 22 | Claims requeridos: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 23 | Firma/autenticidad: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 24 | Expiración: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 25 | Mismatch empresa: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 26 | Mismatch idEmpresa: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 27 | Tenant inexistente: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 28 | Tenant inactivo: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 29 | Conexiones mismatch: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 30 | SQL negocio antes contexto: NO | NO |
| 31 | Query empresa B: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 32 | Query idEmpresa B: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 33 | JSON idEmpresa B: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 34 | Multipart idEmpresa B: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 35 | Header tenant B: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 36 | DatabaseIdentity falsa: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 37 | Scope falso: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 38 | Claims contradictorios: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 39 | Claims faltantes: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 40 | Token/contexto inválido: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 41 | AuthZ preservada: PASS/FAIL | FAIL de certificación — ausencia de regla funcional identificada; REQUIERE_DECISION_PO. |
| 42 | T20 preservado: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 43 | T20 BLOCK correcto: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 44 | T21 preservado: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 45 | T22 NO-OP preservado: PASS/FAIL | PASS — evidencia de código y suite; límites indicados en matrices. |
| 46 | Cliente bootstrappea otra empresa: NO | NO |
| 47 | Endpoints PS auditados: | 51 acciones HTTP, incluidas dos cargas temporales. |
| 48 | Matriz completa: PASS/FAIL | PASS — 51 filas abajo; permiso pendiente señalado en todas. |
| 49 | Endpoints con SQL antes contexto: 0 esperado | 0 en auditoría y pruebas sin identidad; metadata T12/T20 sólo después del contexto. |
| 50 | Listado: PASS/FAIL | PASS SQL real A. |
| 51 | Detalle/ficha: PASS/FAIL | PASS SQL real A y rechazo B. |
| 52 | Escrituras: PASS/FAIL | PASS limitado a guards, aislamiento y baja ajena SQL; no certificación exhaustiva de todo CRUD positivo. |
| 53 | Precios/presentaciones/atributos/variantes: PASS/FAIL | PASS de auditoría y regresión automática T21; no ejecución SQL positiva de cada variante. |
| 54 | Multimedia: PASS/FAIL | PASS de guards, ownership y registro B; acceso directo Storage NO certificado. |
| 55 | Inventario: PASS/FAIL | PASS de auditoría y regresión automática; sin movimientos SQL reales nuevos. |
| 56 | PDF/ficha técnica: PASS/FAIL | PASS PDF propio real 200 y ajeno 404. |
| 57 | Base/fixture QA: | CheckAppErp, 7 filas QA propias creadas y eliminadas. |
| 58 | DatabaseIdentity: | SHA256 de correlación 6E603D3474365601BFBFA4E49C1D056F5C59DE729E25D2FF73CB6AC9F03DD94C; identidad canónica derivada por T12 en ejecución. |
| 59 | Contexto A/B misma DB: PASS/FAIL | PASS |
| 60 | Acceso propio A: PASS/FAIL | PASS |
| 61 | Inputs B no suplantan A: PASS/FAIL | PASS |
| 62 | ID B no filtra: PASS/FAIL | PASS |
| 63 | PDF/ficha B aislado: PASS/FAIL/N/A | PASS |
| 64 | Multimedia B aislada: PASS/FAIL/N/A | PASS en API/ownership; N/A acceso directo Storage fuera de la prueba. |
| 65 | Tenant inactivo sin SQL: PASS/FAIL | PASS |
| 66 | Tenant inexistente sin SQL: PASS/FAIL | PASS |
| 67 | Conexiones mismatch sin SQL: PASS/FAIL | PASS |
| 68 | T20 BLOCK: PASS/FAIL | PASS 503 con gate fixture, sin DDL. |
| 69 | AuthZ sin regresión: PASS/FAIL | FAIL de certificación — no política funcional existente identificada. |
| 70 | ConnectionString en logs: NO | NO en rutas auditadas; excepciones saneadas. |
| 71 | Token en logs: NO | NO en rutas auditadas. |
| 72 | Secretos response: NO | NO en respuestas verificadas. |
| 73 | Stack trace cliente: NO | NO |
| 74 | Datos tenant ajeno enumerados: NO | NO en casos A/B verificados. |
| 75 | CORS/TLS debilitado: NO | NO |
| 76 | CurrentVersion final: | 1 |
| 77 | ManifestHash match: PASS/FAIL | PASS |
| 78 | T18 GlobalResult: | SchemaOk |
| 79 | DriftCount: | 0 |
| 80 | T20 final: | COMPATIBLE |
| 81 | Tests totales: | 384 |
| 82 | Tests PASS: | 384 |
| 83 | Tests FAIL: | 0; omitidos 0. El bloqueo AuthZ no se disfraza de test aprobado. |
| 84 | Build API: | PASS, 0 errores, 6 warnings de dependencias. |
| 85 | Build frontend: | PASS, 0 errores, 9 warnings de dependencias. |
| 86 | git diff --check: | PASS en ambos repositorios. |
| 87 | Login regresión: | PASS limitado: código Login intacto y perímetro HTTP 302; no login Firebase interactivo. |
| 88 | ProductosServicios regresión: | PASS de regresión técnica independiente; AuthZ pendiente impide certificación total. |
| 89 | Puertos respetados: PASS/FAIL/N/A | PASS; servicios preexistentes respetados, sin despliegue. |
| 90 | Documento T23: | Este documento. |
| 91 | AGENTS/CLAUDE sincronizados: PASS/FAIL | PASS — bloque de estado T23 en las cuatro memorias. |
| 92 | Archivos creados: | Validador de identidad, dos archivos de tests, informe y cuatro artefactos QA; ver inventario. |
| 93 | Archivos modificados: | Controllers MVC/API, logs de resolver/gate/bootstrapper, fixture T22, csproj de tests, runner T22 y cuatro memorias. |
| 94 | Defectos encontrados: | Claims sin autenticación/contradictorios, UID perdido, fallback de empresa, query conflictiva ignorada, logs sensibles y falta AuthZ. |
| 95 | Defectos corregidos: | Corregidos los defectos independientes; AuthZ pendiente de regla, no inventada. |
| 96 | Bloqueos reales: | REQUIERE_DECISION_PO: permiso/política funcional PS y alcance por operación no identificados. |
| 97 | Pendientes exclusivamente T24+: | T24/T25 no iniciados. No es posible afirmar que sólo quedan pendientes T24+: persiste AuthZ T23. |
| 98 | Dictamen: | TICKET 23 NO CERRADO — BRECHA DE SEGURIDAD/CONTEXTO DETECTADA — CORREGIR Y REPETIR QA ANTES DE T24. |

**TICKET 23 NO CERRADO — BRECHA DE SEGURIDAD/CONTEXTO DETECTADA — CORREGIR Y REPETIR QA ANTES DE T24.**

Se completaron las partes independientes autorizadas. No se inició T24/T25. No puede afirmarse que los únicos pendientes sean T24+: la regla y certificación AuthZ siguen perteneciendo a T23.
