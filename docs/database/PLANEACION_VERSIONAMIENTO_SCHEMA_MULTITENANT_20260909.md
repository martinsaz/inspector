# MOKA — Planeación 01: versionamiento y sincronización de esquema multitenant

Fecha: 2026-09-09. Proyecto: CheckApp / Inspecciones. **Propuesta técnica pendiente de aprobación expresa del Product Owner. No implementada.** Esta es la única iteración de planeación; los pasos posteriores descritos son trabajo futuro, no autorización para ejecutarlo.

## 1. Resumen ejecutivo

Se recomienda un **ejecutor administrativo de reconciliación, separado del proceso HTTP**, que reutilice el catálogo real Firebase `Conexiones`, resuelva cada destino exclusivamente en backend, compare esquema físico contra contratos inmutables versionados y aplique únicamente transiciones conocidas y seguras. La versión y el historial confirmado residen en la base que se modifica. Un índice central de resultados sirve para operación, nunca para decidir que una migración está aplicada.

La brecha principal precede al versionamiento: **ProductosServicios valida empresa, pero abre una conexión fija de configuración**. No hay actualmente una cadena completa certificada tenant→base en ese vertical. Tampoco se encontró un registro de versiones SQL, baseline ni ejecutor secuencial en el código y scripts examinados. Sí existen scripts manuales con guardas parciales, DDL bajo peticiones en Cotizaciones y usos puntuales de `sp_getapplock`; ninguno equivale al mecanismo requerido.

Se identificaron 20 tablas declaradas del núcleo. El UP principal no incluye toda la evolución de unidades y presentaciones. Los scripts posteriores mezclan DDL con DML de negocio, remapean referencias en Cotizaciones/Órdenes y algunos eliminan unidades. No deben envolverse sin cambios en un runner automático.

**Alcance de evidencia:** auditoría estática realizada para esta planeación. No se enumeraron tenants vivos ni se abrieron sus bases. La auditoría previa del mismo día documentó SQL 18456 contra la conexión fija; es evidencia histórica de ese intento, no prueba actual de todos los destinos. Esta ejecución no repitió ese acceso porque la conexión global no demuestra la asociación tenant→base. No se invocaron login, Firebase ni endpoints: algunos caminos de lectura HTTP tienen escrituras laterales. La certificación física queda pendiente; no impide entregar el diseño.

## 2. Arquitectura actual: evidencia verificable

Rutas en esta sección son relativas a las dos raíces siguientes. Las referencias enlazan archivos reales con línea inicial; los intervalos indican el bloque revisado.

- API: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs`.
- MVC: `/Users/denissemendiola/dev/Inspecciones/inspector/checklist`.
- Pantalla de referencia: `http://localhost:5200/ProductosServicios/Index`. No se abrió ni modificó.

| Archivo / líneas | Clase / método | Evidencia y alcance |
|---|---|---|
| [MVC LoginController.cs:223](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/LoginController.cs:223) | LoginController, flujo de login | Lee `Conexiones` y usuarios Firebase. Es la fuente central de configuración identificada, no una lista obtenida en esta auditoría. |
| [MVC LoginController.cs:449](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/LoginController.cs:449), 449–558 | TrySignInAdministrativeUserAsync | Une la empresa del usuario con `itemC.Key`; exige `Status == "1"`; obtiene `IdEmpresa`, `Cadena`, `Nombre`. Claims SerialNumber/Sid conservan empresa; Uri contiene cadena codificada. También puede reparar nodos Firebase: no usar como método de auditoría. |
| [MVC LoginController.cs:412](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/LoginController.cs:412), 412–440 | Resolución de acceso operador | Misma unión por clave y validación Status; no convierte un usuario activo en prueba del estado de todos los tenants. |
| [API Models/Firebase/FireBconn.cs:3](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Models/Firebase/FireBconn.cs:3) | FireBconn | Cadena, Nombre, Status string, Vigencia string e IdEmpresa string. Sin versión SQL. |
| [MVC Models/Firebase/Conexion.cs:3](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Models/Firebase/Conexion.cs:3) | Conexion / BootstrapEmpresaIds | Status nullable entero; idEmpresa, Vigencia, BootstrapCompleto, fecha y GUID de entidades iniciales. Bootstrap es provisión de negocio, no prueba de esquema. |
| [MVC LoginController.cs:880](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/LoginController.cs:880), 880–891; 1429–1511 | SaveConnectionRegistrationStateAsync / registro | Persiste estado bootstrap en Conexiones. No es historial de migraciones. No se invocó. |
| [API Utiles/OperatorFirebaseIdentityService.cs:422](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Utiles/OperatorFirebaseIdentityService.cs:422), 422–443 | ResolveOperatorCompanyCodeAsync | Busca idEmpresa en Conexiones y devuelve clave. Existe patrón backend de consulta, pero retorna fallback si no encuentra. No es resolver seguro de base para DDL. |
| [MVC ProductosServiciosController.cs:273](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/ProductosServicios/ProductosServiciosController.cs:273), 273–341 y 396–409 | BuildApiUrl, RewriteJsonBodyWithServerEmpresa, AddProxyHeaders, ResolveIdEmpresa/ResolveEmpresa | Sustituye empresa en peticiones y firma contexto. **Conserva fallback a Request.Query cuando faltan sesión/claims**; una firma no convierte ese origen en autorizado. Controller tiene Authorize, pero eso no elimina el fallback. |
| [API ProductosServiciosController.cs:6692](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs:6692), 6692–6876 | TryResolveRequestContext, TryResolveEmpresaId, TryResolveSignedProxyContext | GUID desde claims o proxy HMAC; rechaza discrepancia cliente; tolerancia temporal de 5 minutos. No consulta Conexiones para asociar GUID, clave y destino. |
| [API ProductosServiciosController.cs:95](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs:95), constructor; CreateConnection 6878 | ProductosServiciosController | Construye SqlConnectionFactory(configuration); CreateConnection no recibe tenant. |
| [API Utiles/SqlConnectionFactory.cs:9](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Utiles/SqlConnectionFactory.cs:9), 9–17 | SqlConnectionFactory / CreateConnection | Usa siempre ConnectionStrings:CadenaConexionSQLServer. No consulta Cadena de Conexiones. Utiles/SqlConnection.cs contiene sólo una alternativa comentada. |
| [API Utiles/Firebase.cs:22](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Utiles/Firebase.cs:22), 22–98 | Firebase.GetCadenaConexion | Recorre usuarios/conexiones, pero no compara `itemC.Key` con la empresa; puede acabar retornando la última conexión activa. Resultado inicial "Ok" y errores como string. Búsqueda de referencias: sin llamada activa localizada; endpoint FirebaseController1 comentado. No reutilizar para migraciones. |
| [API Program.cs:1](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Program.cs:1), 1–36 | Composición de aplicación | DI de controllers, Swagger, DataProtection y correo; no registro tenant/schema, worker ni migración al arrancar. UseAuthorization sin configuración de autenticación visible en este archivo; no se altera ni se certifica Auth aquí. |
| [API appsettings.json:14](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/appsettings.json:14) | Configuración, sin clase | Clave de conexión fija; fireBdata en líneas 2–12. No reproducir valores. Development contiene logging; launchSettings declara ASPNETCORE_ENVIRONMENT, sin override de conexión en archivo. Un override del host desplegado no fue inspeccionado. |
| [API checklistWs.csproj:1](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/checklistWs.csproj:1) | Dependencias | net8.0, System.Data.SqlClient, Firebase. Sin paquete EF ni DbContext/migraciones encontrado en fuentes revisadas. |
| [API CotizacionesController.cs:1385](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/Cotizaciones/CotizacionesController.cs:1385), 1385–1468; invocación 74 | EnsureSchemaAsync | Crea dos tablas e índices por existencia desde peticiones. No registra versión ni valida definición de objetos existentes. No ejecutar GET como sustituto de SELECT. |
| [API ProductosServiciosController.cs:3794](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs:3794), 3794–3840 | GenerateNextCatalogCodeAsync / GenerateNextCollectionNumberAsync | sp_getapplock transaccional para consecutivos. No inspecciona código de retorno; reutilizar concepto SQL, no copiar ese manejo como garantía de migración. |

## 3. Resolución tenant→base y elegibilidad

### 3.1 Lo que existe

`Usuario.empresa → Conexiones/{clave}.IdEmpresa + Cadena + Status → contexto MVC → firma → IdEmpresa API → filtro SQL`.

En ProductosServicios, el último salto de conexión es en realidad `configuración API → conexión fija`. **Clave tenant, GUID idEmpresa y nombre de base son identidades distintas.** El ejemplo “163” de la solicitud no demuestra un idEmpresa numérico: las tablas y la API del vertical usan uniqueidentifier/Guid. No se encontró un inventario SQL central autoritativo que sustituya Conexiones. `Empresa` local es una entidad de negocio para comprobaciones, no fuente suficiente para enumerar bases.

`Status == 1` es el único estado de elegibilidad cuyo significado activo se demuestra en el login. Hay Vigencia y BootstrapCompleto, pero no equivalen a política de actualización. No se observaron valores reales ni una taxonomía formal suspendido/eliminado. No inventar esos mapeos.

### 3.2 Resolución propuesta, cerrada ante ambigüedad

1. El job obtiene una lectura completa del catálogo autorizado mediante infraestructura Firebase backend existente (configuración fireBdata y patrón de lectura de Conexiones). Nuevo adaptador de sólo lectura; no invocar login, reparación de usuarios ni bootstrap. Si falla la enumeración, ERROR_GLOBAL y cero destinos de escritura.
2. Construye TenantDescriptor inmutable: clave exacta del registro, IdEmpresa validado como GUID no vacío, Status normalizado, Vigencia sin interpretar y revisión/hash de los campos de identidad/configuración. No seleccionar por Nombre, primera coincidencia, usuario conectado ni parámetros del navegador.
3. Detecta claves duplicadas al normalizar, un GUID asociado a varias claves y configuraciones divergentes. No escoger una; TENANT_REQUIERE_REVISION. Mantiene el formato original de clave para leer Firebase; normalización sólo para comparar con reglas explícitas.
4. Lee Cadena de **ese registro**; parsea SqlConnectionStringBuilder y exige destino y catálogo explícitos, configuración de autenticación completa y formato reconocido. Login consume Cadena como texto; el registro tiene tratamiento legacy de cifrado en ResolveRegistrationConnectionString (822–836). No adivinar formatos: configuración no reconocida se bloquea, no probar contraseñas ni fallback global.
5. Abre conexión nueva, dedicada, al destino resuelto. Contrasta SELECT de DB_NAME(), identificación de servidor y fila Empresa del GUID esperado cuando se pueda comprobar su contrato real. Un alias/listener debe tener correspondencia autorizada, no compararse ingenuamente como nombre literal. Sin identidad verificable, sin visibilidad o con asociación inconsistente: cero DDL.
6. Obtiene DatabaseIdentity canónica y conjunto de empresas que comparten destino. La revisión de catálogo se verifica otra vez antes de comenzar cada transición. Un cambio de asociación invalida trabajo pendiente y requiere resolver de nuevo; nunca retargetear una conexión abierta.
7. Toda operación recibe TenantDatabaseContext opaco, ligado a conexión y DatabaseIdentity. No acepta connection string externa, `USE`, ChangeDatabase, SQL con referencias entre bases ni nombres de objetos aportados por cliente. La conexión fija legacy no es fallback.

Para tráfico HTTP futuro, el GUID/clave del contexto autenticado sólo selecciona un descriptor del catálogo backend; debe comprobarse la pareja y su autorización. El ejecutor administrativo no usa ese tráfico ni sus headers. La brecha del fallback MVC debe quedar cerrada para certificar el recorrido de runtime, mediante ajuste técnico acotado posterior a aprobación; no implica rediseñar Login/Auth/sesión. Si se mantiene la prohibición de modificar incluso ese resolver, sólo puede entregarse un job aislado y **no** certificar la garantía end-to-end de la pantalla.

| Situación | Clasificación / tratamiento propuesto |
|---|---|
| Status 1, identidad inequívoca, destino verificado y permisos suficientes | TENANT_PROCESABLE; todavía debe superar versión, física, datos y ventana |
| Status distinto de 1 | TENANT_OMITIDO por defecto conservador; suspensión/inactividad/eliminación requieren política PO explícita |
| Status ausente/desconocido, Vigencia ambigua, bootstrap incompleto | TENANT_REQUIERE_REVISION; no inventar semántica ni inicializar negocio |
| GUID inválido, Cadena vacía, incompleta, formato no reconocido | TENANT_ERROR_CONFIGURACION |
| Login SQL rechazado | TENANT_ERROR_CONFIGURACION / CREDENCIAL_RECHAZADA; sin reintento masivo ni fallback |
| Servidor inaccesible, timeout de red | TENANT_BASE_NO_DISPONIBLE, reintento acotado |
| Base inexistente o acceso denegado al catálogo | TENANT_BASE_NO_DISPONIBLE / DESTINO_NO_VERIFICABLE; no crear base |
| Empresa local ausente/inconsistente, varias asociaciones ambiguas | TENANT_REQUIERE_REVISION; no insertar Empresa ni reparar catálogo |

### 3.3 Bases compartidas: límite material del aislamiento

Las tablas contienen idEmpresa y el factory es global; el modelo admite más de una empresa por base. **No se ha probado la topología real.** Si A y B comparten base/esquema, un ALTER TABLE modifica el contrato físico de ambos: no hay forma de prometer DDL sólo para A usando WHERE idEmpresa. Debe agruparse por DatabaseIdentity, migrar una vez y proyectar el estado físico a todos sus tenants. DML autorizado sí debe filtrar empresa, pero no forma parte de la reparación estructural automática inicial.

Por defecto, una base compartida se deja en revisión hasta verificar todos sus integrantes y aprobar el impacto/ventana del grupo, incluidos suspendidos si existen. No diseñar versiones físicas divergentes para empresas que comparten las mismas tablas. No se propone separar bases ni mover datos. En bases distintas se exige A no modifica B; en compartidas, DDL de grupo explícito, cero cambios de datos ajenos y una sola secuencia.

## 4. Mecanismos actuales de esquema, versiones y GAP

Se buscaron SchemaVersion/schema_version, __EFMigrationsHistory, DbVersion, DatabaseVersion, MigrationHistory, Migrations, DbContext, Database.Migrate, EnsureSchema/EnsureCreated y DDL en C#, scripts y composición, excluyendo bin/obj y recursos de terceros. **No localizado en fuentes** no significa ausencia demostrada en cada base física.

| Capacidad | Situación actual demostrada |
|---|---|
| Versión SQL aplicada, última versión exigida por release | No localizada; versiones de paquetes, tickets y BootstrapCompleto no sirven |
| Historial secuencial, checksums, baseline | No localizados; hay bitácoras Markdown y scripts manuales, sin prueba por tenant |
| Tablas / columnas | Guardas parciales OBJECT_ID y COL_LENGTH en scripts; no validador recurrente ProductosServicios |
| Tipos / longitud / NULL | Algunas comprobaciones puntuales y ALTER directos; no comparación íntegra |
| PK, FK, UNIQUE, CHECK, DEFAULT | DDL declarado; gran parte se comprueba por nombre/existencia o sólo al crear tabla |
| Índices | Guardas por nombre; Ticket 09 comprueba columnas de un índice unique padre, sin cubrir todo su estado/filtro |
| Drift versión vigente | Sin mecanismo general |
| Reparación | Reejecución manual parcial; no certificada como segura/idempotente para todos los estados |
| Startup / lazy | Sin runner en Program; Cotizaciones contiene EnsureSchemaAsync por petición |

GAP: catálogo→destino seguro, contrato esperado completo, adopción sin historia falsa, cadena inmutable, comparación física, clasificación de riesgo, locking correcto, transacción por paso, auditoría durable, estado de compatibilidad por grupo y tratamiento de fallos independiente.

## 5. ProductosServicios: inventario y contratos existentes

20 tablas **declaradas**, no certificadas físicamente. Los CREATE se localizaron en UP principal salvo Presentaciones, en Ticket 09. El [anexo previo del esquema declarado](/Users/denissemendiola/dev/Inspecciones/inspector/docs/productos-servicios/auditoria-20260909/ESQUEMA_DECLARADO_NO_CERTIFICADO.md) conserva columnas/tipos/default/PK/FK e índices para el inventario inicial; es insumo, no manifiesto aprobado. Debe congelarse y contrastarse en implementación antes de liberar la primera baseline.

| Tabla dbo. | CREATE en script | Contrato / uso |
|---|---|---|
| ProductosServiciosCategorias | UP:18 | Catálogo y AplicaA |
| ProductosServiciosMarcas | UP:45 | Catálogo de marcas |
| ProductosServiciosUnidadesMedida | UP:68 + T10 | Unidad base/venta, factores y tipología |
| ProductosServicios | UP:93 + ALTER posteriores | Maestro y precio público por unidad base |
| ProductosServiciosExistencias | UP:156 | Saldo empresa/producto |
| ProductosServiciosMovimientosInventario | UP:184 | Historial empresa/producto |
| ProductosServiciosColecciones | UP:660 | Catálogo por número |
| ProductosServiciosPaquetes | UP:683 | Logística |
| ProductosServiciosAtributos | UP:713 | Atributos descriptivos |
| ProductosServiciosAtributosValores | UP:734 | Elementos descriptivos |
| ProductosServiciosProductoAtributos | UP:758 | Asociación descriptiva |
| ProductosServiciosProductoAtributoValores | UP:781 | Elementos seleccionados |
| ProductosServiciosTags | UP:804 | NombreNormalizado computed |
| ProductosServiciosProductoTags | UP:832 | Relación producto/tag |
| ProductosServiciosOpcionesVariante | UP:849 | Opciones comerciales |
| ProductosServiciosOpcionesVarianteValores | UP:872 | Valores comerciales |
| ProductosServiciosVariantes | UP:895; imágenes 929–938 | Variante con imagen/precios propios |
| ProductosServiciosVarianteValores | UP:949 | Puente comercial con columnas legacy |
| ProductosServiciosMultimedia | UP:995 | Metadatos de archivos generales |
| ProductosServiciosPresentacionesVenta | T09:27 + T10 | Base 1:1 y adicionales independientes |

Todas declaran idEmpresa uniqueidentifier NOT NULL y PK id uniqueidentifier. La PK simple no sustituye los índices únicos `(idEmpresa,id)` requeridos por FK compuestas. Nombre `identityKey` no significa IDENTITY SQL. No se encontró una tabla adicional del núcleo en las referencias dbo.ProductosServicios de controllers; metadata futura puede ampliar este inventario con evidencia.

Los contratos C# están en [ProductosServiciosModels.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Models/ProductosServicios/ProductosServiciosModels.cs). Deben revisarse también parámetros SqlDbType, tamaños y lectores del [controller API](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs:3312): DTO decimal/string no define por sí solo precisión o longitud SQL.

## 6. Consumidores externos y comparación base/API/DTO/scripts

| Consumidor | Evidencia de código | Consecuencia para schema |
|---|---|---|
| Cotizaciones | [Obtener productos / SQL:1197](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/Cotizaciones/CotizacionesController.cs:1197); CotizacionesPartidas en EnsureSchemaAsync:1423 | Lee maestro, unidad y existencia; conserva referencias y snapshots. No migrar su schema ni remapear sus unidades en esta entrega. |
| Órdenes de Compra | [Controller:781](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs:781), consultas 1714; Scripts/ordenes-compra-up.sql | OrdenesCompraDetalle referencia producto/unidad. Verificar regresión y dependencias entrantes, sin tocar vertical. |
| Inventario | [ProductosServiciosController:2475](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs:2475), 2564, 3397, 3473 | Persistencia de saldo/movimiento con transacciones; sin dimensión sucursal/variante en modelo auditado. No cambiar cantidades ni costos. |
| Ficha/PDF y pricing | Controller API:1130, 3312; Services/ProductosServicios/ProductoPresentacionVentaPricingEngine.cs; MVC ficha | Consumidores de contratos vigentes. Ticket 10 cerrado; pruebas de regresión, sin rediseño ni cambio funcional. |

Empresa y Usuarios son dependencias lógicas externas. No se agregan FK nuevas hacia ellas por deducción. Triggers, vistas, SP, FK entrantes y consumidores fuera del repo deben inventariarse físicamente antes de alterar columnas o llaves; ausencia en búsquedas no demuestra ausencia operativa.

| Comparación | Evidencia / resultado |
|---|---|
| SQL físico tenant vs API/DTO/scripts | PENDIENTE: ningún tenant validado físicamente en esta ejecución |
| UP principal vs runtime unidades/presentaciones | Brecha estática: el código consume TipoUnidad, FactorConversion, CantidadVenta e idUnidadVenta añadidos por scripts posteriores |
| Variante ImagenUrl/ImagenNombre | Código SELECT/INSERT (5411, 6103) y UP coinciden; presencia física pendiente |
| Regla base 1:1 vs constraints | API EnsureAndSynchronizeBasePresentationAsync:3312; índice predeterminada sólo limita máximo uno, no demuestra base válida/existente |
| idUnidadVenta vs FK | Columna evolucionada y consumida; sin FK a unidades declarada en estos scripts; no afirmar ausencia física |
| Tipos de unidad | CHECK inicial sin TIME; script catálogo-tiempo lo incorpora. Usar sólo UP/controladas dejaría contrato atrasado |
| Catálogo calendario | Script no-convertible inserta Año con abreviatura `a` y decimales habilitados; métrico-US define `año` y decimales deshabilitados y actualiza existentes. Orden/contenido importan para datos; no deducir valor actual de filas |
| Ticket 09 reejecutado sobre esquema posterior | INSERT no incluye idUnidadVenta; tras T10 NOT NULL puede fallar si hay nuevos candidatos. Guardas de tabla no garantizan idempotencia entre releases |
| Código de unidades vs backfill T10 | Controladas: Convertible=1 para Kilogramo, Factor=1 sólo con abreviatura KM; otros casos pueden violar CK. Es riesgo condicional de script, no fallo real observado |

## 7. Scripts y evolución real: no fabricar historia

Todos los scripts permanecieron sin ejecutar ni editar. “Evolución” aquí significa dependencia visible del archivo; no versión históricamente aplicada.

| Archivo en API/Scripts | Dependencia / contenido | Repetibilidad, riesgo y aprovechamiento futuro |
|---|---|---|
| productos-servicios-up.sql (1–1525) | Núcleo de 19 tablas, columnas posteriores, PK/FK/índices/default/CHECK; DDL, sin DML de negocio localizado; BEGIN TRAN/XACT_ABORT | Ya acumula evoluciones (tags, opciones, imagen). Guardas no comparan todas las definiciones; ALTER Descripcion y referencias legacy pueden cambiar contratos. Extraer definiciones; no usar como historial ni reparador universal. |
| productos-servicios-down.sql (1–617) | DROP FK/índices/tablas, transacción | Destructivo; no cubre integralmente Tags/ProductoTags/Presentaciones posteriores. Sólo evidencia; excluido del motor automático. |
| ticket-09-presentaciones-venta-up.sql (1–110) | Requiere UNIQUE padre; tabla 20, constraints/índices y semilla de bases | DDL+DML. Guards no restauran FK/default/CHECK si tabla parcial existe. Semilla debe separarse, no repetir sobre T10. |
| ticket-10-unidades-controladas-up.sql (1–89) | Declara ejecutar después de T09; añade metadata unidad y CantidadVenta/idUnidadVenta; backfill y NOT NULL, CHECK e índice | DDL antes de GO: fuera de la transacción posterior. Enumera empresas desde filas de unidades, omitiendo empresas sin unidades; afecta todas las presentes. Separar pasos y reglas de datos. |
| ticket-10-unidades-catalogo-tiempo-up.sql (1–132) | Requiere columnas de controladas; sustituye CHECK para TIME; catálogo y remapeos | DDL+DML+DELETE, toca CotizacionesPartidas/OrdenesCompraDetalle sin guardas de existencia de esas tablas. No incorporar esas escrituras; frontera externa REQUIERE_REVISION. |
| ticket-10-unidades-tiempo-no-convertible-up.sql (1–34) | Requiere metadata y CHECK compatible con TIME; inserta períodos | DML; NOT EXISTS no corrige definición de filas presentes. No representa una versión de schema independiente. |
| ticket-10-catalogo-metrico-us-up.sql (1–48) | Requiere metadata y TIME; actualiza/inserta catálogo, elimina unidades no referenciadas según consultas | DML y dependencia en consumidores; reejecución cambia fechas/activos. No es reparación estructural segura ni idempotencia de estado completo. |

Orden estructural demostrado: núcleo→Presentaciones→columnas/constraints controladas→CHECK con TIME. Los últimos dos scripts de catálogo no añaden estructura; sus efectos de datos no se deducen de metadata. No se asignan V1…V5 a estos archivos. El UP ya consolidado no permite reconstruir una historia exacta por tenant.

## 8. Riesgos principales y límites de garantía

1. Resolver global y fallback MVC impiden certificar tenant→base server-side actual. Un helper defectuoso no se convierte en infraestructura segura por existir.
2. Destinos compartidos hacen imposible aislar DDL por idEmpresa; requieren grupo de impacto explícito.
3. Sin catálogo vivo/metadatos no se conocen cantidades, versiones, privilegios, topología ni drift físico. No reportar ceros ni PASS físico.
4. Guardas por nombre dejan columnas/índices/FK incorrectos sin detectar. Metadata invisible también puede aparentar ausencia.
5. Seeds, backfills, DELETE y remapeos históricos no son DDL seguro. Catálogo de unidades y negocio se preservan; no reinterpretar Ticket 10.
6. Lock de aplicación sólo coordina participantes que usan el mismo protocolo. No detiene DDL manual, triggers ni tráfico legacy automáticamente.
7. Costos de índices y ALTER: espacio/log, bloqueo, duración y compatibilidad dependen de motor/edición y volumen; no prometer impacto cero.
8. Logs actuales de excepciones completas y cadenas codificadas en flujo legacy requieren cautela; el subsistema nuevo debe registrar sólo campos permitidos. No imprimir ni copiar secretos al documento.

## 9. Arquitectura propuesta y fuente de verdad

**Estrategia principal: paquete inmutable de contratos declarativos JSON + transiciones SQL explícitas, ejecutado con SqlClient desde backend administrativo.** Cada contrato es la fuente normativa del estado esperado; el SQL es la acción de evolución. Ambos se distribuyen y verifican juntos, con hashes. CI futuro debe demostrar que cada transición produce exactamente su contrato destino. No hay dos fuentes independientes con precedencia ambigua.

| Alternativa | Evaluación |
|---|---|
| Sólo clases C# | Fácil integrar, pero tiende a mezclar detección/DDL y oculta comparación; no preferida como fuente de schema |
| Sólo scripts por versión | Reutiliza SQL, pero no detecta drift por sí sola; insuficiente |
| EF Migrations | No hay EF/DbContext real que reutilizar; añadirlo sólo para esto crea otra infraestructura y no resuelve drift |
| Metadata central editable | Útil para estado operativo, peligroso como definición mutable de DDL; descartado como autoridad |
| Contratos JSON + SQL inmutable | Reutiliza SqlClient/scripts como insumo y permite validar cualquier tenant incluso sin ejecutar; recomendada |

Un release incluye AppBuildId, versión del formato de contrato, scope `ProductosServicios`, BaselineId, LatestSchemaVersion, rango de compatibilidad de aplicación, lista ordenada de migraciones y hashes. GetLatestSchemaVersion lee ese paquete local verificado, nunca el máximo encontrado entre tenants. La versión binaria de CheckApp y versión SQL son dimensiones diferentes; una release puede no modificar schema.

El contrato por versión contiene tablas y columnas con schema/nombre, tipo SQL y alias, longitud, precisión/escala, collation relevante, nullable, default (nombre y expresión), computed/persisted, identity seed/increment cuando exista; PK/FK/UNIQUE/CHECK e índices con definición completa. Registra origen de cada objeto, versión de introducción, reglas de compatibilidad y repairId permitido. No inventar nuevas constraints de negocio. El contrato actual se consolida del UP+evoluciones+API/DTO y se contrasta con SQL; si hay conflicto semántico no se elige “lo que tenga el tenant” automáticamente.

## 10. Modelo de versiones y registro local

No existe un número actual demostrable. Se propone iniciar con **PS-B20260909 (candidato de baseline, aún no registrado)**, que representa el contrato estructural vigente consolidado, y comenzar una secuencia prospectiva entera desde ese contrato. El identificador con fecha designa esta propuesta, no fecha de aplicación antigua. `SinVersion` es un estado, nunca un entero cero inventado.

Tablas **propuestas**, no creadas, dentro de cada base:

| Tabla | Clave / campos conceptuales | Responsabilidad |
|---|---|---|
| CheckAppSchemaState | PK Scope; BaselineId, CurrentVersion, ManifestHash, LastMigrationId, LastValidatedAtUtc, LastMigratedAtUtc, LastResult, LastRunId, rowversion | Una versión física por base/scope; se actualiza con la migración y validación en la misma transacción |
| CheckAppSchemaHistory | PK EventId; UNIQUE de aplicación exitosa por Scope/MigrationId; RunId, AttemptId, Kind, From/ToVersion, hashes, inicio/fin UTC, duración, resultado saneado, build, actor administrativo, ConfigRevision | Historial confirmado append-only. Kind distingue Adopted, Migrated, Repaired; no generar Migrated para pasos no ejecutados |
| CheckAppSchemaAttempts | PK AttemptId; RunId, Scope, tenant/grupo de origen, versión origen/objetivo, fase, fechas, resultado, error clasificado | Intento durable antes de la transacción y cierre después; una caída puede dejar estado EnProceso que debe reconciliarse |

La identidad canónica de la base y membresía tenant se guardan como identificadores saneados, no cadenas. El status por tenant incluye TenantKey, IdEmpresa, DatabaseIdentity/alias, versión registrada/objetivo, revisión del catálogo, fecha de última física y migración, estado e incidencias. En base compartida estos son proyecciones de la misma versión física, no filas que permitan mentir sobre DDL distinto.

Una salida JSON estructurada durable por ejecución centraliza omisiones/bases inaccesibles y correlación. No se requiere crear una base central ni escribir Firebase para este diseño. El almacenamiento operativo del despliegue debe ser durable y protegido, no un archivo efímero del contenedor. Si falta el canal durable, se bloquean nuevas escrituras y se reporta ERROR_GLOBAL; no ejecutar cambios sin trazabilidad. El historial local confirmado sigue siendo autoridad ante discrepancia del reporte central.

El bootstrap de estas tres tablas es infraestructura explícita y versionada en el paquete: preflight físico/read-only primero, identidad y permisos verificados, mismo lock de base, transacción y validación de sus definiciones. Crear estas tablas no certifica ProductosServicios. Si ya existen con definición inesperada, bloquear; no sustituirlas ni registrar versión por inferencia.

## 11. Migraciones prospectivas y secuencia

Ubicación propuesta en API (no crear en Planeación):

```text
Schema/ProductosServicios/release.json
Schema/ProductosServicios/Baselines/PS-B20260909/expected-schema.json
Schema/ProductosServicios/Transitions/<id-inmutable>/migration.json
Schema/ProductosServicios/Transitions/<id-inmutable>/up.sql
Schema/ProductosServicios/Transitions/<id-inmutable>/expected-schema.json
Schema/ProductosServicios/Repairs/<repair-id>/definition.json
```

Cada migration.json declara MigrationId, BaselineId, FromVersion, ToVersion, orden, objetos afectados, precondiciones físicas/de datos, hash SQL y contrato destino, modo transaccional, riesgo, autoaplicable, timeout/ventana, dependencias externas y política de recuperación. Los identificadores de transición son futuros; no se crean carpetas V001…V005 fingiendo que tickets son versiones históricas.

GetPendingMigrations verifica cadena única sin huecos/ramas/ciclos desde versión confirmada hasta objetivo fijado al comenzar el run. Valida hashes de historial contra paquete; cambio de un archivo ya aplicado es HISTORIAL_INCONSISTENTE, no permiso de reejecución. Una versión numéricamente conocida con BaselineId incompatible también se bloquea. No ejecutar archivos encontrados por glob ni ordenar alfabéticamente nombres SQL.

Para un tenant versionado atrasado: validar primero contrato de su versión; reparar drift seguro de ese contrato si procede; aplicar **cada arista** pendiente, validar todo contrato destino, confirmar versión y seguir. Si falla k→k+1, detener ese destino y conservar k. No ejecutar directamente un script de estado final.

## 12. Baseline / adopción sin historia falsa

Sin versión: obtener snapshot completo con metadata visible y comparar con la baseline candidata. Si satisface todo el contrato y no hay diferencias sin resolver, registrar **un evento Adopted** con evidencia/hash/fecha actual y CurrentVersion inicial. No registrar que se ejecutaron scripts antiguos, ni inferir seeds completados por existencia de columnas.

Si falta una parte segura del contrato, usar un **plan de adopción explícito**, con pasos identificados y dependencias (tablas padre→columnas→llaves únicas→FK/índices/CHECK). Cada paso se valida y audita; no existe versión de dominio hasta pasar el contrato completo. Si una adopción extensa requiere transacciones separadas, sólo registrar pasos de adopción, nunca baseline parcial. La reanudación recalcula física y pasos confirmados.

Si hay un estado antiguo verificable que requiera backfill, sólo admitir un perfil de origen documentado y un puente de adopción con regla de datos aprobada; no asignarle una versión histórica. Si no puede demostrarse, VERSION_NO_DETERMINADA / REQUIERE_REVISION. Datos de unidades existentes se preservan. No hay inicialización automática de catálogos ni creación de presentaciones de negocio dentro de reparación de schema.

Tenant vacío con tablas del dominio ausentes: puede adoptar estructura conocida sólo si identidad/provisión legítima se verifican. Crear su estructura no equivale a completar alta de empresa/catálogos o habilitar operación funcional. Tenant parcialmente versionado, historial faltante o versión manipulada: no “normalizar” números; reconstrucción de evidencia/intervención.

## 13. Validación física completa

La validación es independiente de migrar: se ejecuta al detectar versión vigente y antes/después de cada transición. Relee metadata por la misma conexión/transacción durante postvalidación; no usa un snapshot previo como prueba final. Lecturas de auditoría sin lock cooperativo no garantizan ausencia de DDL externo concurrente: registrar momento/revisión y rechazar snapshot incoherente.

| Objeto | Metadata / comparación obligatoria |
|---|---|
| Identidad y permisos | DB_NAME, identificación autorizada del servidor, Empresa esperada; visibilidad completa y contrato de infraestructura. Sin visibilidad: VALIDACION_NO_CONCLUYENTE, no TABLA_FALTANTE |
| Tablas | sys.schemas + sys.tables; schema/nombre/tipo, no aceptar view/synonym homónimo |
| Columnas | sys.columns + sys.types; nombre/tipo base y alias, tamaño, precision/scale, collation, NULL; column_id no se confunde con orden requerido de índices |
| Computed / identity | sys.computed_columns y sys.identity_columns; expresión/persistencia, seed/increment. No comparar last_value como schema |
| Default | sys.default_constraints; tabla/columna, nombre y expresión; distinguir ausencia vs definición distinta |
| PK y UNIQUE constraint | sys.key_constraints + sys.indexes/index_columns/columns; clase de constraint, columnas y orden, clustering/estado |
| Índices | sys.indexes + sys.index_columns; columnas key ordenadas y ASC/DESC, INCLUDE como conjunto, unique, filtro, tipo clustered/nonclustered y disabled; no validar sólo nombre |
| FK | sys.foreign_keys + sys.foreign_key_columns; pares ordenados, schemas/tablas/columnas destino, acciones DELETE/UPDATE, enabled, confianza y NOT FOR REPLICATION si corresponde |
| CHECK | sys.check_constraints; definición, columna/tabla, enabled, trusted; no inventar equivalencia ni añadir reglas nuevas |
| Externos/extras | FK entrantes, sys.sql_expression_dependencies, triggers y objetos relacionados; clasificar y revisar antes de alterar dependencia. No versionar todos los módulos |

`max_length` se expresa en bytes: normalizar nchar/nvarchar y distinguir -1 (MAX); decimal/numeric deben comparar precisión y escala, datetime2 también escala. No equiparar varchar y nvarchar. Estos atributos proceden del catálogo oficial [sys.columns](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-columns-transact-sql?view=sql-server-ver17).

Expresiones: tokenización/normalización conservadora de espacios y paréntesis redundantes fuera de literales; preservar Unicode, collation, casts y funciones. NEWID no equivale a NEWSEQUENTIALID; GETDATE no equivale a SYSUTCDATETIME. Si la equivalencia no se demuestra, DEFAULT_DIFERENTE/CONSTRAINT_DIFERENTE. No usar regex que quite paréntesis o espacios dentro de strings. Un nombre alternativo genera diferencia de nombre; sólo una equivalencia explícitamente aprobada en contrato evita reparación innecesaria.

SQL puede ocultar metadata por permisos. Un NULL en OBJECT_ID o cero filas no demuestra ausencia hasta comprobar visibilidad. Usar VIEW DEFINITION sobre el alcance requerido y SELECT para validaciones de datos autorizadas; no conceder privilegios en esta fase. [Microsoft: visibilidad de metadatos](https://learn.microsoft.com/en-us/sql/relational-databases/security/metadata-visibility-configuration?view=sql-server-ver17).

FK habilitada pero no confiable no satisface contrato de FK confiable; validar ambas propiedades, además de columnas y acciones. [Microsoft: sys.foreign_keys](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-foreign-keys-transact-sql?view=sql-server-ver17).

## 14. Drift, estados y compatibilidad

Drift es **cualquier** diferencia entre esperado y real, incluso con versión actual. Catálogo mínimo: TABLA_FALTANTE, COLUMNA_FALTANTE, COLUMNA_EXTRA, TIPO_DIFERENTE, LONGITUD_DIFERENTE, PRECISION_DIFERENTE, SCALE_DIFERENTE, NULLABILITY_DIFERENTE, DEFAULT_FALTANTE/DIFERENTE, PK_FALTANTE/DIFERENTE, FK_FALTANTE/DIFERENTE, INDICE_FALTANTE/DIFERENTE, UNIQUE_FALTANTE/DIFERENTE, CHECK_FALTANTE y CONSTRAINT_DIFERENTE. Añadir COMPUTED_DIFERENTE, IDENTITY_DIFERENTE, COLLATION_DIFERENTE, FK_NO_CONFIABLE, CHECK_NO_CONFIABLE, INDICE_DISABLED, INDICE_EXTRA, TABLA_EXTRA y OBJETO_EXTRA.

Separar ejes: elegibilidad tenant, relación de versión (sin/atrasada/actual/futura), salud física (OK/drift/no concluyente), compatibilidad de operación, ejecución (pendiente/en proceso/completada/fallida/revisión). `VERSION_ACTUAL` no implica `ESQUEMA_OK`. Sólo usar ESQUEMA_OK si se satisfacen todos los objetos requeridos y no quedan diferencias sin clasificar. Extras preservados siguen visibles como drift; una aceptación explícita de compatibilidad puede permitir operación con advertencia, pero no ocultar diferencias ni simular igualdad estricta.

Versión actual + índice faltante: repairId conocido, preflight, lock, reparación, validación, evento Repaired, **misma versión**. Versión actual + índice homónimo distinto: revisión, nunca DROP/recreate genérico. Versión futura o baseline/formato no soportado: VERSION_MAS_NUEVA_QUE_APLICACION, cero DOWN y cero reparaciones de paquete antiguo. Read-only del estado y reporte sí; habilitar operación sólo con compatibilidad explícita, no por comparación numérica.

## 15. Matriz de autocorrección

“Condicional” requiere cambio exacto del paquete aprobado, identidad/permisos verificados, precondiciones dentro de transacción, recursos/ventana y validación final. No autoriza DDL durante esta planeación. Riesgo bajo no significa sin bloqueo.

| Diferencia | Detectable | Auto-corregible | Condición | Riesgo | Estado resultante |
|---|---|---|---|---|---|
| Tabla faltante | Sí | Condicional | Definición conocida, dependencias y grupo autorizados; sin seeds | Bajo/medio | TABLA_CREADA o REQUIERE_REVISION |
| Columna nullable faltante | Sí | Condicional | Tipo exacto, sin reinterpretar datos ni dependencias incompatibles | Bajo/medio | COLUMNA_CREADA |
| Columna NOT NULL faltante | Sí | No genérico | Tabla vacía o default legítimo; con datos sin regla, detener | Alto | REQUIERE_BACKFILL |
| nvarchar 50→100, 100→250 | Sí | Condicional | Misma familia/collation/null, índices y consumidores compatibles | Medio | COLUMNA_AMPLIADA |
| varchar 50→100 | Sí | Condicional | Ejemplo general; no varchar del núcleo declarado auditado | Medio | COLUMNA_AMPLIADA |
| nvarchar(150)→MAX (Descripcion) | Sí | Evaluación específica | Revisar índices/lectores y nullability; no copiar ALTER genérico del UP | Medio/alto | COLUMNA_MODIFICADA_SEGURA o REQUIERE_REVISION |
| varchar/nvarchar reducción, MAX→limitado | Sí | No | Truncamiento potencial, aunque hoy valores quepan | Alto | CAMBIO_DESTRUCTIVO_NO_EJECUTADO |
| varchar↔nvarchar / collation | Sí | No genérico | Cambia representación/comparación/llaves | Alto | CAMBIO_TIPO_REQUIERE_REVISION |
| int→bigint (Orden, ejemplo) | Sí | No por defecto | Validar DTO int/lectores, llaves, índices y almacenamiento | Medio/alto | CAMBIO_TIPO_REQUIERE_REVISION |
| bigint→int (PesoBytes) | Sí | No | Overflow/reducción | Alto | CAMBIO_DESTRUCTIVO_NO_EJECUTADO |
| tinyint→int (Tipo) | Sí | No genérico | Contrato byte/enum y CHECK; no cambio funcional automático | Medio | CAMBIO_TIPO_REQUIERE_REVISION |
| bit↔numérico (Activo/Convertible) | Sí | No | Cambia semántica | Alto | CAMBIO_TIPO_REQUIERE_REVISION |
| uniqueidentifier distinto / identity | Sí | No | Identidad, PK/FK y referencias | Alto | REQUIERE_REVISION |
| decimal(18,2), (18,4), (18,6), (5,2), (28,12) | Sí | Condicional sólo ampliación probada | Deben crecer o mantenerse dígitos enteros p−s Y escala; revisar .NET decimal/motor e índices | Alto | COLUMNA_MODIFICADA_SEGURA o REQUIERE_REVISION |
| decimal(18,2)→(18,4) | Sí | No automático | Pierde dos dígitos enteros, no es ampliación total | Alto | CAMBIO_TIPO_REQUIERE_REVISION |
| Reducción precisión/escala | Sí | No | Redondeo/overflow | Alto | CAMBIO_DESTRUCTIVO_NO_EJECUTADO |
| datetime2(0)→mayor escala | Sí | Evaluación | Contratos temporales/consumidores; no rellenar fechas | Medio | REQUIERE_REVISION |
| datetime2 menor escala / texto→fecha/número | Sí | No | Pérdida o reinterpretación | Alto | CAMBIO_DESTRUCTIVO_NO_EJECUTADO |
| NULL→NOT NULL | Sí | Condicional | Cero NULL bajo protección hasta ALTER; si los hay, regla PO de backfill | Alto | COLUMNA_MODIFICADA_SEGURA / REQUIERE_BACKFILL |
| NOT NULL→NULL | Sí | No genérico | Cambia garantía funcional aunque amplíe valores admitidos | Medio/alto | REQUIERE_REVISION |
| DEFAULT faltante | Sí | Condicional | Expresión exacta conocida; sólo efecto futuro, sin WITH VALUES genérico | Medio | DEFAULT_CREADO |
| DEFAULT distinto | Sí | No genérico | Afecta futuras altas; no sustituir por parecido | Medio/alto | REQUIERE_REVISION |
| PK faltante | Sí | Condicional específica | Sin NULL/duplicados en toda tabla, dependencias y clustering compatibles | Alto | CONSTRAINT_CREADO / REQUIERE_REVISION |
| PK distinta | Sí | No | Puede afectar consumidores y FKs | Alto | REQUIERE_REVISION |
| Índice no unique faltante | Sí | Condicional | Exacto, espacio/log y ventana; sin asumir ONLINE | Medio | INDICE_CREADO |
| Índice homónimo distinto / disabled | Sí | No genérico | Rebuild/reemplazo tiene impacto; repair explícito separado | Medio/alto | REQUIERE_REVISION |
| UNIQUE índice/constraint faltante | Sí | Condicional | Cero duplicados según claves, collation y filtro exactos, toda base | Alto | INDICE_CREADO / CONSTRAINT_CREADO |
| FK faltante | Sí | Condicional | Pares completos, UNIQUE destino, cero huérfanos; WITH CHECK y trusted | Alto | FK_CREADA / REQUIERE_REVISION |
| FK distinta/no confiable | Sí | No genérico | No NOCHECK ni borrado de huérfanos; validación/reparación explícita | Alto | REQUIERE_REVISION |
| CHECK faltante | Sí | Condicional | Regla ya existente aprobada, datos cumplen semántica SQL de NULL | Alto | CONSTRAINT_CREADO / REQUIERE_REVISION |
| CHECK distinto/disabled/no confiable | Sí | No genérico | No reemplazar reglas por inferencia | Alto | REQUIERE_REVISION |
| NombreNormalizado computed distinto | Sí | No | Afecta UNIQUE tags; expresión/collation/persisted | Alto | REQUIERE_REVISION |
| Columna/tabla/índice/FK/constraint extra | Sí | No eliminar | Registrar, evaluar dependencia/compatibilidad | Variable | COLUMNA_EXTRA / INDICE_EXTRA / OBJETO_EXTRA |
| DROP, TRUNCATE, DELETE negocio, remapeo externo | Sí, inspección paquete | No | Fuera de reparación automática estructural | Alto | CAMBIO_DESTRUCTIVO_NO_EJECUTADO |
| Metadata no visible | No concluyente | No | Restituir acceso legítimo fuera del runner | Alto | VALIDACION_NO_CONCLUYENTE |

## 16. Seguridad y permisos mínimos futuros

El contexto del job procede exclusivamente del catálogo backend verificado. Secretos permanecen en memoria/configuración autorizada; ningún secreto nuevo ni ConnectionString hardcodeada. No registrar Cadena, passwords, tokens, headers HMAC, excepciones completas, parámetros de negocio o payloads Firebase. Usar categorías/códigos SQL, operación y correlación; nombres de base/empresa sólo en reporte administrativo controlado. El error del proveedor puede contener datos sensibles: sanitizar por lista permitida, no sólo reemplazar `Password=`.

Auditor: CONNECT, visibilidad de metadata del alcance, SELECT sobre verificaciones autorizadas. Migrador: permisos específicos de CREATE TABLE y ALTER/REFERENCES necesarios en objetos/schema afectados y escritura sólo en control/historial; DML de negocio no habilitado por defecto. No exigir sysadmin/db_owner como atajo. En dbo, ALTER de schema puede ser amplio: preferir aprovisionamiento controlado/capacidad firmada o concesiones acotadas por DBA; revisar privilegios efectivos antes de activar. **No crear usuarios, roles o permisos en esta fase**, ni cambiar los roles funcionales.

El protocolo acepta sólo SQL distribuido y verificado del paquete, sin nombres externos. No depende de un filtro de palabras como única barrera. Revisión del paquete debe excluir escrituras a otros módulos, referencias de tres/cuatro partes, DDL fuera de allowlist y ejecución dinámica no acotada. Comparar fingerprint de destino antes de cada fase y registrar sólo su identificador saneado.

## 17. Concurrencia

Se recomienda `sp_getapplock` Exclusive con propietario **Session** para todo el ciclo de una base, misma conexión dedicada y recurso constante `CheckApp.Schema` (no idEmpresa ni versión); principal uniforme entre instancias. SQL lo delimita por base, principal y nombre. Así dos aliases de tenants que lleguen a la misma base compiten por el mismo lock. Capturar retorno: sólo >=0 permite continuar; timeout/cancel/deadlock/error abortan la tentativa y nunca dejan avanzar SQL. Timeout propuesto 10 s, configurable y finito. Liberar explícitamente en finally antes de devolver conexión al pool; si se pierde sesión, cancelar todo trabajo asociado. [Microsoft: sp_getapplock](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver17).

Lock por fila requiere crear tabla antes de proteger bootstrap y no coordina otros objetos; SemaphoreSlim sólo cubre un proceso. Por eso no son la barrera primaria. rowversion y UNIQUE de historial complementan, no reemplazan, el lock. No mantener transacción abierta durante toda la actualización de varias versiones: cada paso confirma independientemente.

El lock cooperativo no bloquea CRUD ni DDL de otros actores. Prechecks de datos y ALTER deben compartir transacción y protección SQL apropiada hasta crear constraint; no confiar en un SELECT anterior fuera de protección. Cambios que no puedan coexistir con tráfico requieren drenar operaciones y ventana del grupo completo. Concurrencia inicial recomendada: una base por ejecutor; escalar de forma limitada tras medir, nunca varias transiciones simultáneas del mismo destino.

## 18. Transaccionalidad y recuperación

Por transición: identidad/preflight→lock→releer versión/hashes/física→persistir Attempt started→BEGIN TRANSACTION→precondiciones protegidas→DDL aprobado→validar contrato destino completo→insertar History success y actualizar State→COMMIT. **La versión sólo es visible como nueva al confirmar**. El registro de intento es anterior y separado para sobrevivir a rollback; finalizarlo después con correlación al evento confirmado.

SqlConnection y SqlTransaction viajan explícitamente a runner, validator y repository; ninguna pieza abre otra conexión por conveniencia dentro del paso. `XACT_ABORT ON`, captura explícita y rollback cuando corresponde; no basta con XACT_ABORT ante errores de compilación. `GO` no es SQL ejecutable de SqlCommand: futuros scripts se empaquetan como batches explícitos sin commits internos que rompan la unidad. [Microsoft: XACT_ABORT](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-xact-abort-transact-sql?view=sql-server-ver17).

Si falla DDL o validación, rollback del paso; no avanzar ni borrar historial previo. Registrar Failed fuera de la transacción fallida. Si no puede registrarse por caída, el intento durable y reporte permiten marcar ResultadoDesconocido. Tras recuperar conexión e identidad, obtener lock y consultar History+State+física: un COMMIT cuya respuesta se perdió puede haber ocurrido; **no repetir ciegamente**. Si History confirmó y física concuerda, cerrar intento como confirmado recuperado; si no hay commit y origen coincide, reintentar el paso conocido; inconsistencia, revisión.

DDL no compatible con transacción única, operaciones resumibles/online especiales o costos no acotados quedan fuera del automático inicial. Se requiere plan específico de checkpoints y mantenimiento; jamás marcar versión al inicio de un trabajo parcial. No ejecutar DOWN destructivo. Rollback de aplicación exige compatibilidad con schema adelantado; no “bajar” la base. Restauración de backup sólo como procedimiento operativo explícito con evaluación de pérdida de escrituras; no automática.

## 19. Observabilidad e historial

Por run: RunId, build/manifest, inicio/fin, catálogo completo o error, tenants procesables/omitidos/revisión/no disponibles, bases distintas y grupos compartidos. Por destino/transición: AttemptId, descriptor revisado, alias de base, versiones origen/objetivo/final, MigrationId/RepairId, fase, validación antes/después, diferencias esperadas/reales saneadas, duración, filas sólo como conteos, lock wait, error clasificado y siguiente acción.

Métricas: pendientes, drift por tipo, versión futura, errores globales/tenant, tiempo y espera de lock, última validación física y antigüedad. Alertar en fallo significativo o revisión requerida; no emitir secretos ni notificar éxito repetido de un tenant sano. Validaciones sanas repetidas pueden actualizar marca de última revisión, sin duplicar migraciones ni crear objetos. Auditar intentos fallidos no viola idempotencia de schema/datos.

Historial local confirmado es append-only; una reparación genera otro evento con versión igual. Si se descubre evidencia inválida, registrar incidente, no reescribir éxitos pasados. Retención de logs operativos se configura con política del despliegue; no purgar historial de aplicación de schema automáticamente.

## 20. Fallo por tenant y operación

Recomendación: aislar fallo a **base/scope afectado**, continuar otros destinos y mantener API disponible. El estado de compatibilidad del vertical debe negar operaciones que necesitan schema incompleto/futuro/desconocido, con respuesta controlada de indisponibilidad; no intentar DDL al entrar. Para bases compartidas, se afecta el grupo. Catálogo inaccesible o paquete/hash inválido es fallo global del ejecutor: detener nuevos cambios, no sustituir catálogo por conexión fija.

Bloqueo sólo del vertical es propuesta operativa pendiente PO. Los consumidores externos pueden necesitar ese mismo contrato: no prometer aislamiento funcional perfecto sin sus precondiciones. Esta entrega no modifica Cotizaciones/Órdenes. Una transición incompatible con ellos queda bloqueada; si se requiere alterar su gating/código, se necesita ampliar explícitamente alcance. No esconder errores cambiando automáticamente de base.

El cache de compatibilidad debe incluir DatabaseIdentity, scope, manifest, ConfigRevision y validación física reciente; invalidarse tras cambio de versión/configuración o error de schema. No afirmar salud por un booleano de startup para siempre. Antes de habilitar una versión nueva validar físico; una revisión periódica detecta drift posterior, sin prometer detección instantánea frente a DDL externo no coordinado.

## 21. Punto de ejecución recomendado

| Alternativa | Startup, seguridad y disponibilidad | Decisión |
|---|---|---|
| Startup API con DDL | Bloquea arranque de todas las instancias; catálogo/locks/fallos parciales difíciles | Descartar |
| BackgroundService en API | Arranque ágil, pero credenciales DDL junto a HTTP y carreras por réplicas | No preferido |
| Ejecutor administrativo separado + job de despliegue/programado | Sin costo DDL en startup HTTP; credenciales/cancelación/lotes/ventanas aislados; mismos componentes | **Principal** |
| Comando sólo al desplegar | Bueno para actualizar; no detecta drift posterior | Trigger inicial del mismo ejecutor, complementar con validación periódica |
| Lazy en primera petición | Latencia/timeouts y riesgo de escribir por lectura | Descartar |

Tres modos del mismo ejecutor: ValidateOnly (predeterminado), Plan (sin escrituras SQL), ApplySafe (activación explícita tras aprobación y ventana). El job periódico puede validar siempre; autoaplicación sólo si política autorizada. Target release se fija al iniciar y no cambia a mitad. Intervalo recomendado inicial de validación: 24 h y tras cada despliegue; es parámetro operativo propuesto, no automatización creada.

Startup API futuro sólo compone servicios y comprueba que su paquete sea íntegro; no enumera/migra todos los tenants. Estado no verificado falla cerrado para funcionalidad dependiente conforme política PO, sin tumbar salud global del proceso.

## 22. Componentes, contratos y archivos futuros

Nada de esta tabla se creó. Ubicación común propuesta `API/Services/TenantSchema/`; se conserva SqlClient y patrones de configuración/logging existentes. No extender silenciosamente SqlConnectionFactory global de todos los módulos: introducir una ruta tenant explícita y conectar sólo el alcance aprobado.

| Componente / ubicación | Responsabilidad y dependencias | Entrada → salida | Errores / tenant |
|---|---|---|---|
| TenantCatalogReader | Conexiones read-only, configuración Firebase backend | GetTenantsAsync → catálogo completo con revisión | ERROR_GLOBAL; descriptor inválido aislado; no fallback |
| TenantSchemaResolver | Asociación GUID/clave/configuración y verificación destino, SqlClient | ResolveTenantDatabaseAsync(descriptor) → TenantDatabaseContext | Error configuración/base/identidad; conexión dedicada |
| TenantSchemaManifestProvider | Carga paquete inmutable y hashes | GetLatestSchemaVersion(scope), GetPendingMigrations(state,target) → contrato/cadena | ERROR_GLOBAL por paquete; historial inconsistente por base |
| TenantSchemaValidator | Metadata física y precondiciones; SqlConnection/Transaction recibidas | ValidateTenantSchemaAsync, ValidateVersionAsync → diferencias y compatibilidad | No concluyente/permisos; no ejecuta DDL ni registra versión |
| TenantSchemaMigrationRunner | Lock/cambios exactos/transacción/validación | ApplyMigrationAsync(context,migration) → resultado confirmado | Rollback, intento desconocido, revisión; nunca otra base |
| TenantSchemaVersionRepository | State/History/Attempts y concurrencia optimista | GetCurrentSchemaVersionAsync; SetSchemaVersionAsync interno al runner | Sin versión/inconsistencia; Set exige transacción y ValidationReceipt de misma base/contrato |
| TenantSchemaVersionManager | Enumeración, grupos, orden, política y aislamiento; usa piezas anteriores | RunAsync(mode,target), GetSchemaStatusAsync → reporte por tenant/base | Global vs tenant; continúa bases independientes |
| TenantSchemaMigration / SchemaContract / SchemaDiff | Contratos inmutables con riesgos y dependencias | Metadata de paquete → plan verificable | Paquete desconocido o incompleto rechazado |
| TenantSchemaStatusReader | Lectura de compatibilidad para runtime | Contexto backend verificado + scope → estado fresco | No DDL; no aceptar base ni cadena del browser |
| Host administrativo en inspectorapi/checklistSchemaRunner/ (propuesto) | CLI/job que compone los mismos servicios backend sin requests/login | opciones administrativas → run durable y código de salida | Fallo parcial distinto de fallo global |

Archivos futuros a crear: clases anteriores, paquete Schema/ProductosServicios, host y proyecto de pruebas de integración con SQL Server desechable. Infraestructura compartida debe ubicarse en biblioteca backend si el host requiere extraerla; no copiar helpers defectuosos ni lógica de negocio.

Archivos futuros a modificar, **sólo tras aprobación**: Program.cs para DI/gating sin DDL; ProductosServiciosController API para conexión tenant y consulta de compatibilidad conservando CRUD; resolver de contexto MVC para fallar cerrado si faltan datos server-side (sin cambios de UI/Login); csproj/solución para empaquetado y host. Configuración propuesta TenantSchema: modo, timeouts, concurrencia, almacenamiento durable, cadencia y ventana; sin cambiar ConnectionStrings actuales ni credenciales en esta planeación. Scripts legacy permanecen como evidencia; nuevos scripts revisados viven en el paquete, no se reescribe historia.

## 23. QA futura y criterios comprobables

Pruebas con SQL Server real aislado y fixtures deliberados **después de aprobación**; no mocks de metadata como única garantía. Crear/alterar fixtures y provocar fallos son acciones de implementación/QA, no se ejecutaron ahora.

| Caso | Preparación futura | Resultado exigido |
|---|---|---|
| Tenant actualizado | Versión y físico completos | ESQUEMA_OK; cero DDL/versiones duplicadas |
| Una versión atrás | Estado de origen exacto | Una arista, física destino PASS, commit de versión |
| Varias atrás | Cadena con varios pasos | Orden estricto y postvalidación de cada versión |
| Sin tabla / columna nullable | Drift conocido | Repair autorizado, contrato completo; no seeds |
| Índice faltante | Quitar requerido en fixture | Detectar por definición; crear seguro y validar |
| Índice homónimo incorrecto / disabled | Cambiar keys/INCLUDE/filtro/estado | INDICE_DIFERENTE; no éxito por nombre |
| Columna/objeto extra | Agregar objeto en fixture | Detectar y conservar, sin DROP |
| Tipo incompatible / decimal | varchar por decimal o reducción capacidad | Bloqueo sin conversión/pérdida |
| NULL impide NOT NULL | Filas con NULL | REQUIERE_BACKFILL; no inventar valor |
| FK/UNIQUE/CHECK | Huérfanos, duplicados, untrusted, mismo nombre distinto | Detectar todo; no NOCHECK ni limpieza |
| Default/computed/identity | Expresión o seed distinto | Diferencia exacta; no falso equivalente |
| Versión vigente con drift | Quitar FK/índice | No declarar sano; reparar sólo autorizado con misma versión |
| Sin versión | Físico completo / parcial / desconocido | Adopted una vez / plan explícito / revisión; sin historia falsa |
| Versión futura | Manifest viejo y State nuevo | Cero modificación/DOWN, reporte de incompatibilidad |
| Base no disponible / credencial inválida | Error por un destino | A y C continúan; nunca usar su conexión para B |
| Dos instancias | Arranque simultáneo mismo destino | Un titular; perdedor espera/relee o termina; sin doble CREATE |
| Mismos datos vía dos aliases | A/B apuntan a base compartida | Un lock/versión; grupo reportado, no migrar dos veces |
| Fallo a mitad | Error de DDL o validación en paso k+1 | Rollback k+1, versión k y Failed fuera de transacción |
| Caída tras COMMIT sin respuesta | Cortar transporte de fixture | Reconciliar History+State+física sin reejecutar |
| Reejecución 1 y 10 veces | Tenant sano y adoptado | Objetos/datos iguales; sólo auditoría legítima |
| Metadata oculta | Usuario con visibilidad parcial | No concluyente; no CREATE sobre falsa ausencia |
| Hash modificado / cadena con hueco | Alterar paquete o historial de fixture | Bloqueo, no saltos |
| Revisión de catálogo cambia | Remapear descriptor durante run de prueba | Invalidar plan y detener; no redirigir conexión viva |
| Tenant A/B/C bases distintas | Marcadores y snapshots antes/después | A sólo cambia A, B sólo B; coincidencia conexión/descriptor |
| Cliente manipula GUID/clave/cadena | Petición sin contexto o discrepante | Rechazo, nunca firma/autorización desde fallback query |
| Logs con proveedor que incluye secreto | Excepción controlada | Sólo código/categoría/correlación; cero password/token/cadena |
| Regresión vertical y consumidores | Leer/guardar fixtures autorizados en entorno QA | Precio base 1:1, adicionales independientes, atributos/variantes separados, PDF y contratos intactos |

Pruebas de volumen deben medir duración de ALTER/índices, log/espacio y bloqueo; fijar límites y ruta mantenimiento a partir de resultados. QA de Codex precede QA manual PO; build no reemplaza validación física, y una base no representa todas.

## 24. Ejemplos de salida futura (ficticios)

Los nombres A/B/C y versiones n son ilustrativos. No son resultados SQL ni tenants enumerados.

| Tenant / base | Versión registrada → objetivo | Inicial / pasos | Final |
|---|---|---|---|
| A / DB-A | n → n+2 | n sano; n→n+1 validar PASS/commit; n+1→n+2 validar PASS/commit | n+2, ESQUEMA_OK, ACTUALIZACION_COMPLETADA |
| B / DB-B | n → n+2 | n→n+1 PASS; siguiente FK incompatible, rollback | n+1, ACTUALIZACION_FALLIDA, REQUIERE_REVISION |
| C / DB-C | n+2 → n+2 | Índice falta; repair seguro validado | n+2, evento Repaired; si no seguro, DRIFT_DETECTADO |
| D / DB-D | SinVersion → baseline candidata | Contrato completo probado | Adopted en fecha actual; sin eventos de migraciones antiguas |

Reporte detallado incluye TenantKey, GUID empresa, DatabaseIdentity/alias, RegisteredVersion, TargetVersion, InitialValidation, PendingMigrations, StepResults, FinalValidation, FinalVersion, LastValidatedAt y NextAction. Ningún campo transporta secretos. Un tenant inaccesible muestra versión **desconocida**, no 0 ni versión del último tenant procesado.

## 25. Primer vertical y restricciones consolidadas

Sólo contratos de las 20 tablas ProductosServicios y control de schema. Integridad externa se inspecciona como precondición; no se implementan otros módulos. PrecioPublico es precio de UNA unidad base; base 1:1; adicionales con precio independiente. Atributos descriptivos y variantes comerciales separados. No agregar reglas de negocio, reescribir datos ni “completar” constraints que no están aprobadas.

Ticket 10 **CERRADO POR PRODUCT OWNER**, PDF Producto y Servicio aprobados. Esta planeación no cambia UI, CRUD, precios/costos/ganancia/margen, unidades/conversiones, IVA, ficha/PDF, POS, inventario operativo, Cotizaciones, Órdenes, Auth/Firebase/sesión/roles/permisos. No iniciar implementación, migraciones, despliegue, commit ni push.

## 26. Decisiones técnicas y decisiones del PO

### Recomendaciones técnicas resueltas con evidencia (pendientes de aprobación del conjunto)

Catálogo Conexiones mediante lector backend; resolver sin fallback; agrupación por base física; contrato JSON + transiciones SQL inmutables; baseline sin historia falsa; estado local autoritativo y reporte central; ejecutor separado; locking por base; transacción por transición; comparación física completa; reparación por allowlist; futuro→sin DOWN; fallo aislado; no reutilizar scripts de catálogo destructivos. No se pide al PO elegir una biblioteca ni diseñar llaves SQL.

### Decisiones operativas requeridas para autorizar aplicación

| Decisión PO | Recomendación concreta | Mientras no se apruebe |
|---|---|---|
| Tenant incompatible | Bloquear funcionalidad dependiente en ese destino/grupo y continuar otros | Sólo diagnóstico, sin habilitación automática |
| Suspendidos/inactivos/eliminados/Vigencia | Procesar Status 1; omitidos con motivo, revisar estados desconocidos | No adivinar mapeos o política de caducidad |
| Base compartida y miembros omitidos | Autorizar mantenimiento de grupo sólo tras inventario completo | Cero DDL automático sobre grupo no autorizado |
| Backfill de negocio | Sólo regla explícita por hallazgo medido, con impacto y reversibilidad | REQUIERE_BACKFILL; no 0/fecha/GUID inventados |
| Ventana de mantenimiento / riesgo de datos | Canario y ventana por grupo según volumen y consumidores | Reparación costosa/incompatible detenida |
| Activación automática vs administrativa | ValidateOnly inicial; ApplySafe tras canario aprobado; validación periódica | Nada de autoaplicación ni job creado ahora |
| Alcance del resolver/runtime | Aprobar cambio técnico acotado de resolución y compatibilidad descrito en sección 22, sin cambiar reglas funcionales | Job aislado no certifica pantalla end-to-end; implementación de esa integración no autorizada |

Prerequisitos técnicos externos, no decisiones de arquitectura delegadas al PO: acceso legítimo de lectura al catálogo/tenants, verificación de permisos/identidad/edición SQL, inventario de destinos compartidos y almacenamiento operativo durable. Deben obtenerse por administración autorizada, sin enviar secretos por chat. Resolverlos no requiere otra iteración de diseño; los estados y rutas de bloqueo están definidos aquí.

## 27. Roadmap posterior a aprobación

1. **PO aprueba esta planeación y política operativa**; aprobación registrada con restricciones. Hasta entonces detenerse.
2. Implementación: lector/resolver read-only y validación de identidades reales, grupos y permisos; confirmar catálogo sin tocar Login/Firebase. Primer resultado es inventario físico por destino, no DDL.
3. Congelar contrato baseline con trazabilidad a scripts/API/DTO/físico, resolver discrepancias y separar totalmente DML externo. Crear paquete y verificación de hashes/cadena; no asignar historia ficticia.
4. Implementar infraestructura local de versión/historial/intentos, comparación, locking, transacciones y recuperación; pruebas SQL aisladas. Integración tenant del vertical según alcance aprobado.
5. Ejecutar QA de Codex completo: fallos/concurrencia/cruce/drift/idempotencia/regresión. Validación read-only de canario; ApplySafe sólo bajo autorización de la fase.
6. Canario autorizado→lotes acotados por destino→reporte de todos los tenants; detener automáticamente cambios riesgosos, mantener pendientes visibles.
7. QA manual PO y aprobación operativa; luego cierre de infraestructura inicial/vertical. Extender otros verticales sólo en trabajo posterior autorizado.

La futura implementación sólo estará completa cuando cada tenant elegible tenga identidad verificable, versión demostrada, físico conforme y resultado auditado, o una excepción explícita reportada y tratada conforme política PO. No vender como garantía absoluta que “todos se actualizan” si alguno requiere backfill, acceso o mantenimiento pendiente.

## 28. Verificación de esta entrega documental

No se iniciaron servidores ni se detuvieron procesos preexistentes. No se ejecutaron SQL, migraciones, endpoints, login, escrituras Firebase, builds con hooks ni pruebas destructivas. No se modificaron código funcional, scripts SQL, configuración, datos o esquema. Se preservaron los cambios de trabajo preexistentes de ambos repositorios.

Se creó este documento dentro del repositorio frontend porque allí reside la documentación consolidada del proyecto (`inspector/docs/database/`). Se agregará el mismo bloque de estado pendiente en AGENTS.md y CLAUDE.md de ambos repositorios; no reemplaza la bitácora anterior ni convierte recomendaciones en aprobadas.

## 29. Entrega #MOKA — 100 puntos

| # | Punto solicitado | Resultado |
|---|---|---|
| 1 | Auditoría realizada | PASS auditoría estática de planeación; física PENDIENTE, no certificada (§1–8). |
| 2 | Código funcional modificado | NO en esta ejecución; cambios previos preservados. |
| 3 | SQL escritura ejecutado | NO. |
| 4 | Datos modificados | NO. |
| 5 | Schema modificado | NO. |
| 6 | Migraciones ejecutadas | NO. |
| 7 | Configuración modificada | NO. |
| 8 | Fuente real de tenants | Firebase Realtime Database Conexiones; evidencia de código, no catálogo vivo enumerado (§2). |
| 9 | Identificador tenant | Clave del nodo Conexiones; IdEmpresa GUID es identidad de empresa separada (§3). |
| 10 | Relación empresa→tenant | Usuario.empresa se une por clave; registro contiene IdEmpresa (§2–3). |
| 11 | Resolución ConnectionString | Login obtiene Cadena del nodo; ProductosServicios usa hoy configuración fija (§2). |
| 12 | Resolución base | Actual: factory fija; propuesta: descriptor backend + verificación física, sin fallback (§3). |
| 13 | Clase/servicio responsable | LoginController, FireBconn, SqlConnectionFactory; helper Firebase inseguro sin llamada activa localizada (§2). |
| 14 | Tenants activos identificables | SÍ identificables por Status 1 en código; cantidad/identidades reales PENDIENTES. |
| 15 | Estados tenant detectados | Status 1 activo demostrado; otros valores sin taxonomía confirmada; Vigencia/Bootstrap no son versión (§3). |
| 16 | Riesgo de cruce tenant encontrado | SÍ, riesgo estático; no incidente físico comprobado. |
| 17 | Detalle | Factory fija, fallback query firmado en MVC y helper sin unión por clave; bases compartidas pendientes (§2–3). |
| 18 | Existe versionamiento actual | NO localizado en fuentes; existencia física PENDIENTE. |
| 19 | Mecanismo | Scripts manuales/guardas parciales y bootstrap de negocio; no versión SQL (§4). |
| 20 | Tabla/archivo/clase | Scripts y CotizacionesController.EnsureSchemaAsync; no tabla de versión localizada (§2,4,7). |
| 21 | Existe historial | NO historial SQL localizado; documentación previa no lo sustituye. |
| 22 | Existe baseline | NO baseline localizada; adopción propuesta (§12). |
| 23 | Existe migración secuencial | NO ejecutor secuencial localizado; cadena prospectiva propuesta (§11). |
| 24 | GAP principal | Falta tenant→base seguro + registro secuencial + contrato físico y reconciliación (§4). |
| 25 | Existe mecanismo actual de validación | PARCIAL: guardas SQL, sin validador general. |
| 26 | Valida tablas | PARCIAL: OBJECT_ID. |
| 27 | Valida columnas | PARCIAL: COL_LENGTH. |
| 28 | Valida tipos | NO integral; comprobaciones/ALTER puntuales. |
| 29 | Valida NULL | NO integral; ALTER puntuales no equivalen a validar. |
| 30 | Valida defaults | NO integral; DDL declarado. |
| 31 | Valida PK | NO integral; DDL declarado. |
| 32 | Valida FK | NO integral; guardas de nombres. |
| 33 | Valida índices | PARCIAL: existencia/nombres y precheck único padre en T09. |
| 34 | Valida constraints | NO integral; CHECK/default al crear o guardas puntuales. |
| 35 | Puede detectar drift | NO general; sólo algunas diferencias puntuales por scripts. |
| 36 | Puede reparar drift | NO seguro/general; reejecución manual condicionada. |
| 37 | Total tablas de dominio identificadas | 20 declaradas; total físico PENDIENTE (§5). |
| 38 | Tablas principales | Maestro, 6 catálogos, tags/puentes, atributos, variantes, multimedia, inventario y presentaciones: lista completa §5. |
| 39 | Consumidores externos | Cotizaciones y Órdenes; inventario/ficha/pricing consumen núcleo; dependencias §6. |
| 40 | Scripts existentes | UP/DOWN principal, T09 y cuatro T10; siete archivos auditados (§7). |
| 41 | Drift scripts/código detectado | SÍ diferencias estáticas: UP incompleto vs evoluciones, CHECK TIME, semillas no repetibles sobre schema posterior; físico pendiente (§6–7). |
| 42 | Riesgos principales | Resolución de base, DML multiempresa en scripts, contratos parciales y consumidores externos (§8). |
| 43 | Estrategia recomendada | Contratos JSON + SQL inmutables, runner backend separado, validación por paso (§9). |
| 44 | Punto de ejecución recomendado | Ejecutor administrativo de despliegue/job; no DDL startup ni lazy (§21). |
| 45 | Fuente de verdad recomendada | Contrato por versión incluido en paquete verificado; SQL debe producirlo (§9). |
| 46 | Registro de versión recomendado | CheckAppSchemaState local por base/scope; no creada (§10). |
| 47 | Historial recomendado | History confirmado + Attempts durables, salida central saneada (§10,19). |
| 48 | Mecanismo de locking/concurrencia | sp_getapplock Session por base, recurso común, retorno comprobado (§17). |
| 49 | Mecanismo transaccional | DDL + física + History/State en una transacción por transición (§18). |
| 50 | Estrategia ante fallo tenant | Detener base/scope afectado y continuar destinos independientes; política operativa PO (§20). |
| 51 | Estrategia tenant sin versión | Comparar/adoptar con evidencia, sin inventar historia; parcial requiere plan explícito (§12). |
| 52 | Estrategia tenant con versión futura | Bloquear modificaciones y DOWN; reportar versión futura (§14). |
| 53 | Estrategia drift con versión vigente | Validar siempre; reparar sólo allowlist y registrar Repaired sin subir versión (§14). |
| 54 | Tabla faltante | Condicional: definición conocida, dependencias/grupo/ventana seguros (§15). |
| 55 | Columna faltante | Nullable conocida condicional; NOT NULL exige precondiciones/backfill aprobado (§15). |
| 56 | Ampliación varchar/nvarchar | Condicional; misma familia y contrato, índices/consumidores compatibles (§15). |
| 57 | Reducción varchar/nvarchar | NO automática (§15). |
| 58 | Cambio int→bigint | Evaluación específica de DTO/lectores/llaves; no por defecto (§15). |
| 59 | Cambio bigint→int | NO, reducción/overflow (§15). |
| 60 | Cambio decimal | Comparar p−s y s; no reducir capacidad; 18,2→18,4 no es ampliación total (§15). |
| 61 | NULL→NOT NULL | Sólo cero NULL protegido o backfill legítimo aprobado (§15). |
| 62 | Índice faltante | Condicional: definición exacta y recursos/ventana; UNIQUE exige datos compatibles (§15). |
| 63 | FK faltante | Condicional: integridad completa y trusted; nunca NOCHECK (§15). |
| 64 | Constraint faltante | Sólo regla ya aprobada y datos compatibles; no inferir reglas nuevas (§15). |
| 65 | Columna extra | Detectar y conservar (§14–15). |
| 66 | Objeto extra | Detectar, conservar y revisar compatibilidad (§14–15). |
| 67 | Cambios destructivos | Bloqueados; sin DROP/TRUNCATE/DELETE negocio automático (§15). |
| 68 | ConnectionStrings hardcodeadas requeridas esperado | NO. |
| 69 | Password en logs | NO en documento/subsistema propuesto; no se inspeccionaron logs productivos (§16). |
| 70 | Contexto tenant server-side/PENDIENTE | FAIL para garantía actual completa; hay validación parcial de empresa, falta asociación segura a destino (§2–3). |
| 71 | Permisos mínimos requeridos | CONNECT, visibilidad metadata, SELECT prechecks; DDL/control acotados para ejecución futura, sin sysadmin (§16). |
| 72 | Riesgos de seguridad | Fallback/factory/helper, secretos legacy y scope compartido; ningún secreto reproducido (§8,16). |
| 73 | Archivos a crear | Services/TenantSchema, Schema/ProductosServicios, host administrativo y pruebas; sólo propuestos (§22). |
| 74 | Archivos a modificar | Program/DI, csproj, conexión/estado API ProductosServicios y resolver MVC acotado tras aprobación (§22). |
| 75 | Nuevas clases propuestas | CatalogReader, Resolver, ManifestProvider, Validator, Runner, Repository, Manager, StatusReader y contratos (§22). |
| 76 | Nuevas tablas propuestas | CheckAppSchemaState, CheckAppSchemaHistory, CheckAppSchemaAttempts; NO creadas (§10). |
| 77 | Cambios de configuración propuestos | Modo/timeouts/concurrencia/ventana/cadencia/reporte durable; NO aplicados (§22). |
| 78 | Impacto startup | Sin DDL ni enumeración masiva; sólo composición/paquete y gating futuro (§21). |
| 79 | Impacto por tenant | Limitado a destino/scope; base compartida afecta grupo; locks y costos sujetos a preflight (§3,20). |
| 80 | Estrategia de rollback | Rollback transaccional; recuperación forward; jamás DOWN destructivo automático (§18). |
| 81 | Estrategia de observabilidad | Resultados por tenant/base/paso, métricas drift/atrasos/locks, eventos saneados (§19). |
| 82 | Tenant actualizado | Planeada: físico completo→ESQUEMA_OK y cero DDL (§23). |
| 83 | Tenant atrasado | Planeada: una transición con validación/commit (§23). |
| 84 | Tenant varias versiones atrás | Planeada: todas las aristas en orden (§23). |
| 85 | Tenant sin tabla | Planeada: detección/reparación segura o revisión (§23). |
| 86 | Tenant con columna faltante | Planeada: validar tipo/null y reparación permitida (§23). |
| 87 | Tenant con índice faltante | Planeada: comparar definición; crear sólo seguro (§23). |
| 88 | Tenant con drift | Planeada: incluir versión vigente, extras, tipos/constraints incorrectos (§23). |
| 89 | Tenant sin versión | Planeada: Adopted demostrado, nunca historia falsa (§23). |
| 90 | Tenant versión futura | Planeada: cero DOWN/modificaciones (§23). |
| 91 | Tenant no disponible | Planeada: aislamiento y cero fallback (§23). |
| 92 | Concurrencia | Planeada: dos instancias y dos aliases misma base (§23). |
| 93 | Fallo parcial | Planeada: rollback por paso y reconciliar COMMIT de resultado desconocido (§23). |
| 94 | Idempotencia | Planeada: 1/10 corridas sin DDL/DML repetido (§23). |
| 95 | Validación post-migración | Planeada: física completa antes de confirmar versión, misma transacción (§23). |
| 96 | Documento generado | inspector/docs/database/PLANEACION_VERSIONAMIENTO_SCHEMA_MULTITENANT_20260909.md. |
| 97 | AGENTS actualizado | SÍ, ambos repositorios, bloque pendiente sincronizado. |
| 98 | CLAUDE actualizado | SÍ, ambos repositorios, bloque pendiente sincronizado. |
| 99 | Arquitectura aprobada por PO | NO. |
| 100 | Implementación iniciada | NO. |

## 30. Dictamen

**PLANEACIÓN MULTITENANT COMPLETADA — ARQUITECTURA DE VERSIONAMIENTO Y SINCRONIZACIÓN DE SCHEMA LISTA PARA APROBACIÓN DEL PRODUCT OWNER — NO IMPLEMENTADA.**

Completada se refiere a esta planeación y auditoría estática; no certifica acceso, inventario ni esquema físico de los tenants. Se detiene aquí y espera aprobación expresa del Product Owner / Líder de Proyecto. No inicia la fase de implementación.
