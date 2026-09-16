# POST-T24 CONSOLIDADO / T25 FROZEN - 2026-09-16

- Documento consolidado: `inspector/docs/database/POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`.
- T24: IMPLEMENTADO Y CERTIFICADO. T25: `FROZEN / NO INICIADO FORMALMENTE`; reanudar solo con autorizacion explicita del Product Owner.
- PRODUCTOSSERVICIOS - PERMISOS: cada opcion navegable independiente requiere permiso propio. Agrupadores: Acceso unicamente. Pantallas funcionales: Acceso + Escritura cuando corresponda. Padres NO conceden hijos.
- Arbol definitivo: `05000000` Proveeduria agrupador; `05001000` Productos y Servicios agrupador; `05001001` ABC; `05001002` Catalogos agrupador; `05001003` Categorias; `05001004` Marcas; `05001005` Unidades de medida.
- SuperAdmin permanece protegido contra edicion manual. No usar otro rol como workaround para SuperAdmin. Denisse QA autorizada debe resolver SuperAdmin mientras esa sea la regla vigente del entorno.
- Correccion historica Denisse: estaba como `QA Activos 163`; se restauro a SuperAdmin en SQL `Usuarios.idRol` y Firebase `Usuarios/{uid}.idRol`. No otorgar permisos PS al rol equivocado.
- T25 freeze: NO ejecutar, NO preparar, NO modificar Hosting, NO modificar bases QA, NO provisionar, NO iniciar bootstrap, NO iniciar QA manual. No cambiar codigos `05000000`-`05001005` sin autorizacion PO.

# PRODUCTOSSERVICIOS_PERMISSION_GRANULARITY_REGRESSION - 2026-09-16

- ProductosServicios usa permisos granulares: `05000000` Proveeduria, `05001000` Productos y Servicios, `05001001` ABC Productos y Servicios, `05001002` Catalogos, `05001003` Categorias, `05001004` Marcas, `05001005` Unidades de medida.
- El padre `05001000` es agrupador de solo Acceso y no autoriza hijos automaticamente. Menu/Home, MVC directo, proxy y API deben exigir el codigo especifico; ausencia de permiso granular falla cerrado. Si `05001000.Escritura` existe en JSON legacy, se ignora y no concede WRITE.
- RolesPermisos muestra el arbol completo y conserva la proteccion SuperAdmin: no permitir edicion manual ni eliminar el mensaje "No se pueden cambiar los permisos del SuperAdmin".
- SuperAdmin PO fue habilitado por operacion administrativa controlada con snapshot de `Roles.Permisos`, actualizando solo codigos ProductosServicios granulares. No modificar otros roles/usuarios ni hacer asignacion masiva.
- Control: no DDL, no Firebase, no Hosting, no Conexiones tenant, no `nxt_*`. Al terminar cualquier QA/trabajo local, liberar y verificar puertos 5200 y 5127.
- QA vigente de esta regresion: tests API/MVC `395/395` PASS, builds API/MVC PASS, `git diff --check` PASS.

# Estado T24 - QA integral T11-T23 ProductosServicios #MOKA, 2026-09-14

- T24 certificado: T11-T23 PASS en conjunto, fuente real Roles/Permisos `db_a883c3_checklist`, codigos `05000000`/`05001000` libres, NOACCESS/READONLY/WRITE reales PASS y fixtures restaurados (6 filas eliminadas, 0 remanentes).
- CheckAppErp final PASS: CurrentVersion 1, hash V1 `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`, T18 SchemaOk, DriftCount 0, T20 COMPATIBLE, conteos 20/255/50/24/14, objetos temporales MOKA 0.
- Correcciones cerradas: AuthZ ya no trata `05001000` como pendiente y lee Roles/Permisos desde `ConnectionStrings:CadenaConexionSQLServer` legacy server-side, con fallback sólo para pruebas.
- Regresion final PASS: tests 388/388, build API PASS, build MVC PASS, diff check PASS, secret scan `SECRET_HITS=0`. Runtime PO 5200/5127 respetado; MVC PS sin sesion redirige a Login y API sin contexto devuelve 401.
- No DDL, no schema changes, no Firebase, no Hosting, no Conexiones tenant, no `nxt_*`, no asignacion masiva, no roles productivos ajenos, no T25. Documento: `inspector/docs/database/TICKET24_QA_INTEGRAL_MULTITENANT_PRODUCTOSSERVICIOS_20260914.md`.

# Estado T23 - certificacion AuthZ final fuente real Roles/Permisos #MOKA, 2026-09-14

- Fuente real Roles/Permisos: conexion legacy configurada `ConnectionStrings:CadenaConexionSQLServer`, base `db_a883c3_checklist`; contiene `dbo.Usuarios`, `dbo.Roles`, `Roles.Permisos`, 124 roles y joins `Usuarios.idRol` -> `Roles.id`.
- Codigos `05000000` y `05001000` libres en SQL real. QA con tres roles/usuarios temporales: NOACCESS deny READ/WRITE, READONLY allow READ deny WRITE, WRITE allow READ/WRITE, otra empresa no autoriza. Cleanup: 6 filas eliminadas, 0 remanentes.
- AuthZ service corregido para leer Roles/Permisos desde la fuente legacy configurada; `05001000` ya no se trata como pendiente.
- CheckAppErp final: V1, hash V1, SchemaOk, DriftCount 0, T20 COMPATIBLE; no contiene ni recibe Roles/Usuarios.
- Regresion final PASS: tests 388/388, build API PASS, build MVC PASS, diff check PASS, secret scan `SECRET_HITS=0`. No DDL, schema, Firebase, Hosting, Conexiones tenant, asignacion masiva ni T24.

# Estado T23 - certificacion SQL real con credencial PO #MOKA, 2026-09-14

- Credencial QA PO usada solo en memoria para SQL real CheckAppErp; no persistida. Secret scan repo: `SECRET_HITS=0`.
- CheckAppErp no contiene `dbo.Roles`, `dbo.Usuarios` ni columnas `Permisos`; `05000000`/`05001000` no tienen uso funcional en esa base, pero no existe ahi el mecanismo `Roles.Permisos` para certificar fixtures AuthZ reales. No crear DDL/schema.
- CheckAppErp final: CurrentVersion 1, ManifestHash V1 `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`, T18 SchemaOk, DriftCount 0, T20 COMPATIBLE.
- Correccion aplicada: `ProductosServiciosAuthorizationService` ya no trata `05001000` como codigo pendiente.
- Regresion final: tests 388/388 PASS, build API PASS, build MVC PASS, git diff --check PASS. No Firebase, Hosting, Conexiones tenant, roles productivos, asignacion masiva, DDL, schema, nxt_* ni T24.

# Estado T23 - certificacion SQL final solicitada #MOKA, 2026-09-14

- Intento de cierre SQL final ejecutado sin imprimir secretos. `MOKA_CHECKAPPERP_QA_CONNECTION` no estuvo disponible en proceso, zsh login ni launchctl; no usar connection string fija.
- SQL real no ejecutado: no se validaron `05000000`/`05001000` en `Roles.Permisos`, no se persistieron fixtures QA y no se confirmo CheckAppErp final en esta ejecucion.
- Regresion local final PASS: tests 388/388, build API PASS, build MVC PASS, `git diff --check` PASS en ambos repos.
- Control preservado: no DDL, no schema, no Firebase, no Hosting, no Conexiones tenant, no `nxt_*`, no asignacion masiva, no T24.

# Estado Ticket 23 - AuthZ ProductosServicios #MOKA cierre final, 2026-09-14

- Decision PO aplicada: `05000000` Proveeduria / `05001000` Productos y Servicios. API, MVC, menu y tests usan `ProductosServicios:PermissionCode=05001000`; `02000000` queda excluido como Inspecciones y no autoriza PS.
- AuthZ server-side implementada con `IProductosServiciosAuthorizationService` / `ProductosServiciosAuthorizationService`: lee `Usuarios.idRol` a `Roles.Permisos` JSON por empresa autorizada, evalua `Acceso`/`Escritura` de forma recursiva y fail-closed; API bloquea antes de T20/T22/SQL de negocio. MVC y Home/menu bloquean/ocultan por `05001000.Acceso`, sin reemplazar al backend.
- Matriz vigente: 51 endpoints identificados; 24 READ y 27 WRITE. READ requiere Acceso; WRITE requiere Acceso+Escritura. NOACCESS/MISSING/02000000 bloquean, READONLY bloquea WRITE antes de gate/SQL.
- Preflight local: sin colision funcional exacta de `05000000`/`05001000`; unico hallazgo relacionado `m05001000` en breadcrumb/menu legacy de configuracion, no codigo JSON exacto. SQL preflight y persistencia real no ejecutados porque `MOKA_CHECKAPPERP_QA_CONNECTION` no esta disponible; no usar connection string fija ni modificar roles productivos sin conexion QA autorizada.
- QA local: `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal` PASS 388/388; builds API/MVC PASS; `git diff --check` PASS en `inspectorapi` e `inspector`. No T24.

# Estado Ticket 23 — Seguridad y contexto multitenant, 2026-09-14

- T23 NO CERRADO: implementación independiente terminada; REQUIERE_DECISION_PO para identificar permiso/política funcional de ProductosServicios. MVC sólo tenía Authorize y API no aplica AuthZ funcional; el menú directo no define un permiso. No inventar códigos ni equivalencia autenticado=autorizado. La mención histórica de «autorización» en T22 no certifica AuthZ funcional.
- API exige autenticidad, sujeto/empresa/GUID consistentes, firma y ventana existente; rechaza claims sin autenticación y contradicciones. MVC valida claims/sesión y conserva UID Firebase string. Contexto canónico/init-only; query/form/JSON no sustituyen tenant; conexión/identity/scope siguen server-side. No nuevo esquema crypto/nonce/Login.
- Logs de controller/resolver/gate saneados; identidad textual de T20/T22 sustituida por digest de correlación. T11–T22 conservan comportamiento, incluido NO_REQUIRED_COMPANY_SEEDS. Fixtures T22 añaden sujeto requerido; no se crean semillas.
- Tests 384/384 PASS (105 T23 nuevos, 279 previos); builds API/MVC PASS, 0 errores; warnings de dependencias existentes. Los tests no sustituyen el requisito AuthZ pendiente. 51 acciones HTTP auditadas y probadas sin identidad antes de SQL.
- QA SQL real CheckAppErp con firma sintética/lector T11 fixture A/B: 7 filas propias creadas/eliminadas; hashes originales restaurados; listado/ficha/PDF propios 200, ajenos 404, payloads discrepantes bloqueados. T22 15 llamadas NO-OP. T20 BLOCK 503 con gate fixture, sin DDL. V1/hash intacto, SchemaOk, drift0, COMPATIBLE, 20/255/50/24/14.
- Sin Firebase/Hosting/Conexiones data/schema/otros verticales/T24/T25; sin commit/push ni reinicio de puertos existentes. Login sólo perímetro 302 y archivos intactos; sin E2E Firebase. Multimedia certificada en guards/ownership API, no acceso directo a Storage.
- Informe y checklist completo 98: `inspector/docs/database/TICKET23_SEGURIDAD_CONTEXTO_MULTITENANT_20260914.md`; runner y evidencia en `inspector/docs/database/t23-qa/`. Resolver regla AuthZ, implementar y repetir QA antes de cerrar T23 o iniciar T24. Este bloque es el estado actual; las entradas siguientes son históricas.

# Estado Ticket 22 — Bootstrap empresarial separado del schema, 2026-09-14

- T22 IMPLEMENTADO Y CERTIFICADO en la rama NO-OP expresamente aprobada: PS no requiere semillas predefinidas al incorporar empresa. Categoría/unidad son obligatorias al guardar artículo y se crean/seleccionan por CRUD; no inventar valores por alta.
- IProductosServiciosCompanyBootstrapper / ProductosServiciosCompanyBootstrapper exige descriptor server-side y T20 compatible, retorna NO_CHANGES/NO_REQUIRED_COMPANY_SEEDS con cero items. Se integra después de autorización/resolución/T20 en el controller API, antes del CRUD; sin endpoint nuevo ni autoridad cliente. Conserva gate del controller y verifica otra vez en servicio, con coste adicional de metadata conocido.
- Sin escritores, estado persistido, transacción empresarial ni locks en NO-OP; no escribe State/History/Attempts. Parciales/rollback/creación por seed son N/A para conjunto obligatorio vacío, no pruebas de operaciones ficticias. T16 EMPTY sigue separado.
- QA automática 279/279 PASS, incluyendo 32 T22 y 247 anteriores. Builds API/MVC PASS; git diff --check en los dos repositorios PASS. PIDs preexistentes 49365/49371 y puertos 5127/5200 respetados.
- QA SQL real CheckAppErp PASS: 15 llamadas C/D incluyendo 10 repeticiones y concurrencia C/C,C/D; T22 creó 0 filas y ejecutó 0 DDL. Dos categorías fixture A/B preservadas durante T22 y eliminadas exclusivamente por sus IDs; hashes originales restaurados, sin productos demo ni tenants Firebase nuevos.
- V1/hash inalterados; snapshot físico y datos/control idénticos. Final 20 tablas/255 columnas/50 índices/24 FK/14 CHECK, SchemaOk, drift 0, T20 COMPATIBLE. Perímetro HTTP 302 Login/401 API; controller actual SQL: listado/catálogos 200 vacíos, ficha ausente 404, discrepancia tenant 403. No se realizó login Firebase interactivo ni ficha/PDF poblada sin productos QA.
- No se modificaron Firebase, Hosting, Conexiones, Auth, schema V1, servicios T11–T21, otros verticales ni MVC. T23+ sin iniciar; sin commit/push. Pendiente QA/cierre del PO, no implementación T22.
- Informe y checklist 85: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/TICKET22_BOOTSTRAP_EMPRESARIAL_SEPARADO_SCHEMA_20260914.md`; evidencia y runner saneados en `inspector/docs/database/t22-qa/`. Esta entrada actualiza el estado T22 sin borrar bitácoras previas.

# Estado Ticket 21 — Integridad multitenant por idEmpresa ProductosServicios, 2026-09-14

- TICKET 21 IMPLEMENTADO Y CERTIFICADO: el CRUD de ProductosServicios quedó auditado/reforzado para que dos empresas en la misma `DatabaseIdentity` no puedan leer ni modificar datos entre sí.
- La autoridad de empresa sigue en `context.IdEmpresa` resuelto server-side desde T11/T12; el `idEmpresa` cliente no puede cambiar la empresa efectiva y se rechaza si contradice el contexto.
- Se reforzaron actualizaciones sensibles de inventario/existencias con `WHERE idEmpresa = @IdEmpresa AND id = @Id`, y se validaron IDs anidados de multimedia, atributos, opciones, valores y variantes contra `idEmpresa + producto padre` antes de sincronizar.
- Auditoría de 49 endpoints PASS: 45 resuelven contexto directamente antes de SQL y 4 exportaciones delegan a endpoints ya protegidos. SELECT, INSERT, UPDATE, bajas, activaciones, exportaciones, inventario y relaciones quedan cubiertos.
- QA automatizado API PASS: suite completa 247/247; pruebas T21 específicas 23/23. Build API PASS; build MVC PASS. Este checkout no contiene `.git`, por lo que se sustituyó `git diff --check` por revisión de whitespace en archivos tocados, sin hallazgos.
- QA SQL real CheckAppErp PASS: empresas QA `3bdad8ea-c040-443e-8aed-7e542abcbc1a` y `39eb2199-f030-4c17-b655-1e75bbf2d16a` compartieron `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`; A no pudo listar, consultar, actualizar, dar de baja ni resolver relaciones de B; B permaneció intacta; fixtures limpiadas.
- T20 preservado: gate `True/COMPATIBLE`, `CurrentVersion=1`, hash V1 `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`, `SchemaOk`, drift 0. Auth runtime preservado: MVC 5200 redirige a Login y API 5127 responde 401 sin credenciales.
- No se ejecutó DDL, no se crearon migraciones, no se creó V2, no se adelantó T22, no se modificó Firebase, Hosting, Login/Auth, permisos, sesión, datos reales de negocio ni bases históricas. No se persistieron secretos.
- Dictamen: `TICKET 21 IMPLEMENTADO Y CERTIFICADO — AISLAMIENTO MULTITENANT DE PRODUCTOSSERVICIOS POR idEmpresa OPERATIVO — SELECT/INSERT/UPDATE/BAJAS Y RELACIONES CERTIFICADOS — DOS EMPRESAS EN LA MISMA DATABASEIDENTITY NO PUEDEN LEER NI MODIFICAR DATOS ENTRE SÍ — idEmpresa DEL CLIENTE NO ES AUTORIDAD — T20 PRESERVADO — SIN DDL, MIGRACIONES NI ADELANTO DE T22 — LISTO PARA QA/Cierre DEL PRODUCT OWNER.`
- Documento: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/TICKET21_INTEGRIDAD_MULTITENANT_IDEMPRESA_20260914.md`.

# Estado Ticket 20 — Gate server-side de compatibilidad ProductosServicios, 2026-09-14

- TICKET 20 IMPLEMENTADO Y CERTIFICADO: se agregó `IProductosServiciosCompatibilityGate` / `ProductosServiciosCompatibilityGate` para decidir en API si el CRUD de ProductosServicios puede operar sobre la base SQL resuelta.
- La decisión exige `DatabaseIdentity + Scope` válidos, `CurrentVersion=1`, hash T15 V1 `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`, ausencia de attempts activos T16/T17/T19 y T18 `SchemaOk` sin drift.
- Estados bloqueados de forma controlada: `EMPTY`, `PARTIAL`, `OUTDATED`, `FUTURE`, `UNKNOWN`, `UNAVAILABLE`, evidencia de versión faltante, versión incompatible, hash distinto, bootstrap/preparing, migración en progreso, drift, drift crítico, validación inconclusa y requiere revisión.
- El controlador API de ProductosServicios invoca el gate antes de ejecutar SQL de negocio; ante incompatibilidad responde 503 saneado con `code`, `message` y `referenceId`. Auth 401/403 existente se preserva antes del flujo tenant/base.
- El MVC no decide compatibilidad ni puede simular ALLOW; conserva el proxy y muestra/propaga el mensaje controlado de API. No se movió lógica de negocio al frontend.
- El gate no ejecuta DDL, no provisiona, no migra, no repara, no actualiza `CheckAppSchemaState`, no escribe `History` ni crea `Attempts`, y no usa cache permisiva.
- QA automatizado API PASS: suite completa 224/224; tests T20 específicos 29/29. Build API PASS, build MVC PASS, `git diff --check` PASS, secret scan T20 PASS; único match fue `ApiKey` como nombre de propiedad/configuración existente, sin valor secreto literal.
- QA SQL real CheckAppErp PASS: BEFORE `IsAllowed=True/COMPATIBLE`, `CurrentVersion=1`, hash V1, `SchemaOk`, drift 0. Drift fixture real sobre `IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento` bloqueó `IsAllowed=False/SCHEMA_DRIFT`; índice restaurado a contrato; AFTER `IsAllowed=True/COMPATIBLE`, `SchemaOk`, drift 0.
- No se creó V2, no se adelantó T21, no se modificó Firebase, Hosting, Login/Auth, permisos, sesión, datos de negocio ni bases históricas. No se persistieron secretos.
- Dictamen: `TICKET 20 IMPLEMENTADO Y CERTIFICADO — GATE SERVER-SIDE DE COMPATIBILIDAD DE PRODUCTOSSERVICIOS OPERATIVO — CRUD PERMITIDO ÚNICAMENTE CON DATABASEIDENTITY + SCOPE COMPATIBLES — ESTADOS EMPTY/PARTIAL/OUTDATED/FUTURE/UNKNOWN/DRIFT/PREPARING/MIGRATING BLOQUEADOS DE FORMA CONTROLADA — CHECKAPPERP V1 / SCHEMA_OK CONFIRMADA COMO ALLOW — RESPUESTAS HTTP/MVC SANEADAS — SIN DDL, MIGRACIÓN NI REPARACIÓN DESDE EL GATE — SIN ADELANTAR T21 — LISTO PARA QA/Cierre DEL PRODUCT OWNER.`
- Documento: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/TICKET20_GATE_COMPATIBILIDAD_PRODUCTOSSERVICIOS_20260914.md`.

# Estado Ticket 19 — Locking, transacciones e idempotencia ProductosServicios, 2026-09-14

- TICKET 19 IMPLEMENTADO Y CERTIFICADO: se agregó `ISchemaOperationLock` / `SqlSchemaOperationLock` con autoridad SQL Server (`sp_getapplock`), timeout finito, validación explícita de retorno y clasificación `LOCK_TIMEOUT`, `LOCK_CANCELLED`, `LOCK_DEADLOCK`, `LOCK_FAILED`.
- La unidad de lock es `DatabaseIdentity + Scope`, no `idEmpresa`, tenant, usuario, PID, instancia API ni connection string textual. Recursos canónicos: `CheckApp.Schema.Control:{fingerprint}` y `CheckApp.Schema.ProductosServicios:{fingerprint}`; el orden obligatorio es Control→Scope y el release queda en `finally`/`IAsyncDisposable`.
- T16/T17 consumen el lock canónico mediante adaptador `ISchemaProvisionLock`. Bootstrap mueve infraestructura/Attempt/relectura efectiva dentro del lock; después del lock relee attempts y clasificación T13 antes de DDL. Migración mantiene relectura de State/History dentro del lock y ahora clasifica fallos de lock sin ejecutar DDL.
- Transacción/idempotencia: provisionamiento y migración conservan `SqlTransaction`; T17 mantiene `SET XACT_ABORT ON`; T18 post-validación usa misma conexión/transacción. Rollback no avanza State ni escribe History SUCCESS; 10 reintentos tras éxito no duplican DDL, State ni History.
- QA automatizado API PASS: 195 pruebas, 0 fallas. T19 agrega cobertura de recursos, aliases, orden Control→Scope, release, timeout/cancel/deadlock/error fail-closed, relectura post-lock, dos empresas misma DB, dos DB distintas e idempotencia de 10 reintentos.
- QA SQL real CheckAppErp PASS: BEFORE `SchemaOk/DriftCount=0`, `CurrentVersion=1`, hash T15 V1, conteos 20/255/50/24/14; A adquirió lock de scope, B quedó bloqueado/timeout mientras A retenía, B adquirió después del release, otro scope y otro recurso/base no se bloquearon indebidamente; fixture QA `dbo.__MOKA_T19_Idempotencia` ejecutó DDL efectivo 1 vez en 10 intentos y fue limpiada; AFTER `SchemaOk/DriftCount=0`, conteos 20/255/50/24/14.
- No se creó V2, no se implementó T20/gate CRUD, no se modificó Firebase, Hosting, Conexiones, Login/Auth, UI/CRUD, datos de negocio ni base histórica 163. No se persistieron secretos.
- Dictamen: `TICKET 19 IMPLEMENTADO Y CERTIFICADO — LOCKING SQL POR DATABASEIDENTITY + SCOPE OPERATIVO — DOBLE CREATE/MIGRACIÓN EVITADO ENTRE EMPRESAS E INSTANCIAS — RELECTURA POST-LOCK, TRANSACCIONES, ROLLBACK E IDEMPOTENCIA CONFIRMADOS — CONCURRENCIA SQL REAL CERTIFICADA — CHECKAPPERP PERMANECE V1 / SCHEMA_OK — SIN IMPACTO A FIREBASE, TENANTS, DATOS NI BASE HISTÓRICA — LISTO PARA QA/Cierre DEL PRODUCT OWNER.`
- Documento: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/TICKET19_LOCKING_TRANSACCIONES_IDEMPOTENCIA_20260914.md`.

# Estado Ticket 18 — Certificación real de drift físico CheckAppErp, 2026-09-14

- TICKET 18 CERTIFICADO EN SQL SERVER REAL: PO autorizó provocar un drift estructural controlado y reversible exclusivamente en QA `CheckAppErp`, con restauración obligatoria. Se ejecutó preflight read-only y la base estaba sana antes del DDL temporal.
- BEFORE: `DB_NAME=CheckAppErp`, identidad saneada `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`, `CurrentVersion=1`, hash T15 V1 `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`, `GlobalResult=SchemaOk`, `DriftCount=0`, conteos 20 tablas / 255 columnas / 50 índices / 24 FK / 14 CHECK.
- Fixture seguro: índice no PK, no UNIQUE y no requerido por FK `IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento` en `dbo.ProductosServiciosMovimientosInventario`; restauración preparada desde contrato T15 antes del DROP con `CREATE NONCLUSTERED INDEX` sobre `idEmpresa ASC, FechaMovimiento ASC`.
- DRIFT: se ejecutó únicamente `DROP INDEX` temporal sobre ese índice en `CheckAppErp`; T18 reportó `GlobalResult=SchemaDrift`, `DriftCount=1`, 49 índices, `INDEX_MISSING=True`, `ObjectName=dbo.ProductosServiciosMovimientosInventario.IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento`, `Actual=<ABSENT>`, `ChangedState=False`, `ExecutedDdl=False`; el índice siguió ausente después del validador, certificando que T18 no repara.
- RESTORE/AFTER: se recreó exactamente el índice; T18 final volvió a `GlobalResult=SchemaOk`, `DriftCount=0`, conteos 20/255/50/24/14, `CurrentVersion=1`, hash T15 V1 intacto. No se creó V2, no se ejecutó T17, no hubo `History MIGRATED`, no se tocaron Firebase, Hosting, Conexiones, Login/Auth, UI/CRUD, datos de negocio ni base histórica 163.
- Dictamen: `TICKET 18 CERTIFICADO EN SQL SERVER REAL — CHECKAPPERP V1 SANA VALIDADA — DRIFT FÍSICO REAL PROVOCADO Y DETECTADO — T18 IDENTIFICÓ INDEX_MISSING SIN REPARACIÓN AUTOMÁTICA — ESTRUCTURA RESTAURADA EXACTAMENTE A V1 — SCHEMA_OK FINAL CONFIRMADO — SIN IMPACTO A DATOS, FIREBASE, TENANTS NI BASE HISTÓRICA — LISTO PARA CIERRE DEL PRODUCT OWNER.`
- Documento: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/TICKET18_VALIDADOR_FISICO_DRIFT_20260911.md`.

# Estado Ticket 16 — Bootstrap autosuficiente ProductosServicios V1, 2026-09-10

- TICKET 16 IMPLEMENTADO: `IProductosServiciosSchemaBootstrapper` / `ProductosServiciosSchemaBootstrapper` provisiona el scope `ProductosServicios` sólo cuando T13 clasifica `Empty`.
- El bootstrap usa contrato T15 V1 y hash `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`; genera DDL desde `SchemaContract`, valida físicamente y confirma T14 sólo en PASS.
- Estados no permitidos: `Partial`, `Current`, `Outdated`, `Future`, `Unknown`, `Unavailable`; devuelven `NoProvision` con reason code específico. `Partial` nunca se completa automáticamente.
- Control T14: crea `Attempt PROVISION`, registra `History PROVISIONED` sólo tras validación y confirma `State CurrentVersion=1 + ManifestHash` sólo tras PASS. No inventa V0, Ticket09/10 ni eventos `MIGRATED`.
- Concurrencia mínima: lock SQL `sp_getapplock` por `DatabaseIdentity + Scope` y re-clasificación dentro del lock; no se bloquea por `idEmpresa`.
- QA 163 read-only: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5` sigue `Unknown/VERSION_EVIDENCE_MISSING` con 20/20 tablas; T16 rechazó `PROVISION_NOT_ALLOWED_UNKNOWN` sin State/History/Attempts nuevos.
- Documento: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/TICKET16_BOOTSTRAP_BASE_NUEVA_PRODUCTOSSERVICIOS_20260910.md`.

# Estado Ticket 15 — Contrato versionado ProductosServicios V1, 2026-09-10

- TICKET 15 IMPLEMENTADO: el API define `SchemaContract` + `SchemaManifest` para `ProductosServicios` con `ContractVersion = 1` y hash canónico determinista `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`.
- Archivos de contrato: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/SchemaContractModels.cs` y `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Services/Tenant/ProductosServiciosSchemaContractProvider.cs`.
- El contrato cubre las 20 tablas del scope, 255 columnas, 50 índices adicionales a PK, 24 FK y 14 CHECK. No contiene datos de negocio ni secretos.
- T15 no adopta ni modifica bases históricas: no escribir `CurrentVersion`, `ManifestHash`, `ADOPTED`, history ni attempts por la mera existencia del contrato. T13 debe permanecer `Unknown/VERSION_EVIDENCE_MISSING` cuando T14 State no tenga evidencia.
- QA real read-only en tenant 163: Firebase resolvió la base, DatabaseIdentity `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`, 20/20 tablas, discrepancias contrato vs metadata `0`, `CheckAppSchemaState` sin filas para ProductosServicios.
- Documento: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/TICKET15_CONTRATO_VERSIONADO_PRODUCTOSSERVICIOS_20260910.md`.

# CLAUDE

## Auditoría Firebase → tenant → database → bootstrap, 2026-09-09 — vigente

- Reglas YA APROBADAS: N empresas por base; versión por DatabaseIdentity + Scope; filas por idEmpresa; DDL una vez/base/scope; bases distintas pueden tener versiones diferentes y sus miembros comparten versión; validar versión + física y datos por empresa; destructivos no automáticos; ProductosServicios primero. Firebase es fuente de configuración tenant: no crear catálogo paralelo.
- Evidencia estática: Login enlaza UID → Usuarios.empresa → Conexiones por clave → IdEmpresa/Cadena. Hosting se lee en Registrare sólo para nueva empresa y se copia a Conexiones; los históricos conservan su copia. Esto no certifica el destino efectivo de PS.
- Destinos actuales mixtos: Registrare usa Servidor MVC para gran parte del negocio; InsertarPrimerZona usa factory fija API; login/usuario SQL consumen Conexiones mediante cadena en request; PS usa CadenaConexionSQLServer de factory. No atribuir a esa configuración fija el significado Hosting/legacy/fallback sin evidencia. Resolver backend unificado NO implementado.
- BootstrapCompleto/BootstrapIds reflejan alta empresarial, no schema. El flujo inserta rol, razón social, zona, sucursal, departamento/puestos y luego usuario; presupone tablas. No se localizó inserción Empresa SQL en esa ruta. Las 20 tablas PS no bastan para plataforma/login/menú sobre base vacía; dependencias físicas y contrato mínimo pendientes.
- Base vacía legítima no es tenant roto: diseño pendiente propone instalación directa del contrato vigente y evento Provisioned; estructura previa coincidente usa Adopted; histórica usa Migrated secuencial; reparación explícita usa Repaired. No replay automático Ticket09/10, no GUID empresarial nuevo si Firebase ya lo asignó.
- Hallazgo de Auth que matiza bitácoras anteriores: ResolveAdministrativeAccessAsync condiciona requireFirebaseStatus al propio status; status=false puede seguir por usuario SQL activo y reparación escribir status=true. No afirmar bloqueo absoluto por status Firebase. No se ejecutó ni corrigió; requiere revisión PO. Persiste fallback query MVC y cadena legacy vía request.
- Auditoría de código concluida; certificación física y aprobación de implementación del bootstrap pendientes. Recomendación: coordinador administrativo backend automático por alta/destino, locks y gate por base/scope, separando estructura y negocio. No hay servicio, tablas de control ni versionador implementados.
- Informe: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/AUDITORIA_FIREBASE_TENANT_DATABASE_BOOTSTRAP_20260909.md`; planeación consolidada en `PLANEACION_VERSIONAMIENTO_SCHEMA_MULTITENANT_20260909.md`, capítulo 31. Esta entrada prevalece sobre inferencias históricas incompatibles, sin reabrir Ticket10 cerrado por PO.
- Sólo documentación. Sin cambios funcionales, Firebase/Auth/sesión/roles/permisos/configuración ni SQL. Sin secretos/datos personales nuevos, sin commit/push. Esperar revisión PO antes de implementar.

## Decisión posterior PO/Líder — Planeación 01 corregida, 2026-09-09

- Una misma base física puede contener varios tenants/empresas; compartir base es válido y no exige bases exclusivas.
- El schema se versiona por **DatabaseIdentity + Scope**, con una sola versión física compartida por sus empresas; la versión no pertenece al tenant individual.
- El aislamiento de datos corresponde a **idEmpresa**; base compartida no autoriza consultar o modificar filas de otra empresa.
- El DDL se ejecuta una sola vez por base/scope, agrupando previamente sus tenants; éstos figuran como contexto del impacto, no como migraciones independientes.
- Esta regla arquitectónica está confirmada por PO/Líder. La implementación continúa **NO aprobada / NO iniciada**; esperar nueva aprobación expresa. Documento consolidado: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/PLANEACION_VERSIONAMIENTO_SCHEMA_MULTITENANT_20260909.md`.

## Planeación 01 — schema multitenant, 2026-09-09 — PENDIENTE DE APROBACIÓN

- Única iteración de planeación documentada en `/Users/denissemendiola/dev/Inspecciones/inspector/docs/database/PLANEACION_VERSIONAMIENTO_SCHEMA_MULTITENANT_20260909.md`. Arquitectura PROPUESTA, no aprobada; implementación NO iniciada. Esperar aprobación expresa del PO / Líder de Proyecto.
- Hallazgos estáticos: catálogo real de configuración en Firebase `Conexiones`; ProductosServicios abre hoy la conexión fija de `SqlConnectionFactory`, sin asociación tenant→base certificada. MVC conserva fallback de empresa desde query; el helper `Firebase.GetCadenaConexion` no une la clave de conexión con la empresa y no tiene llamada activa localizada. No reutilizar estos comportamientos para DDL.
- No se encontró versión SQL, baseline ni runner secuencial en fuentes. Hay scripts manuales, guardas parciales y DDL bajo petición en Cotizaciones. 20 tablas del núcleo declaradas; no son inventario físico certificado. Esta iteración no consultó catálogo vivo ni SQL; el SQL 18456 corresponde a la auditoría anterior, no a todos los tenants.
- Recomendación pendiente de aprobación: ejecutor administrativo separado, catálogo/resolver backend sin fallback, contratos inmutables + SQL revisado, adopción sin historia falsa, versión/historial local, validación física por paso, lock por base y transacción por transición. Bases compartidas requieren grupo de impacto: el DDL no se aísla por idEmpresa.
- Scripts Ticket 09/10 mezclan DDL/DML y algunos cambian consumidores externos o eliminan unidades; no envolverlos como auto-reparación. Backfills, suspendidos, grupos compartidos, ventana, política de incompatibilidad y activación quedan sujetos a decisiones explícitas del PO según el documento.
- No se cambió código funcional, SQL, configuración, esquema, datos, Login/Auth, Firebase, sesión, roles o permisos. No hubo migraciones, commit, push, despliegue ni servidores iniciados. Sólo documentación; cambios previos preservados.
- Ticket 10 permanece CERRADO POR PRODUCT OWNER; PDF Producto y Servicio aprobados. PrecioPublico por UNA unidad base, base 1:1, adicionales independientes y atributos/variantes separados. No reabrir ni reinterpretar esas reglas.

## Estado oficial vigente — Product Owner, 2026-09-09

- **TICKET 10 CERRADO POR PRODUCT OWNER — PDF PRODUCTO Y SERVICIO APROBADOS.**
- El PO revisó y aprobó manualmente ambos PDF. Este cierre sustituye los estados históricos pendientes de QA de Ticket 10 conservados abajo como bitácora.
- No reabrir Ticket 10 ni modificar su diseño/código sin nueva instrucción explícita del Product Owner.
- Nueva etapa autorizada: auditoría de solo lectura del dominio Productos y Servicios, contrastando base real, API, frontend, DTO y scripts. No autoriza implementación, cambios de datos/esquema ni ejecución de scripts de escritura.
- Mantener PrecioPublico como precio de UNA unidad base; presentación base 1:1 y adicionales con precio independiente.
- Al terminar, detener únicamente procesos iniciados por Codex; respetar procesos preexistentes del PO.

## Auditoría Productos y Servicios — hallazgos consolidados, 2026-09-09

- Estado: auditoría estática documentada; auditoría SQL real pendiente por error de autenticación 18456 del destino configurado. No certificar conteos, esquema real, FK físicas, huérfanos ni drift hasta obtener SELECT reales.
- Código y scripts actuales contemplan imagen propia por variante (`ProductosServiciosVariantes.ImagenUrl/ImagenNombre`); la multimedia general es otra tabla. Este hallazgo de código sustituye el diagnóstico histórico de imagen ausente, sin afirmar comprobación física actual.
- Código vigente: PrecioPublico corresponde a UNA unidad base y sincroniza la base 1:1; adicionales independientes. PrecioUnitario* del maestro se conserva como legacy. Atributos descriptivos y opciones comerciales permanecen separados.
- Modelo versionado de inventario: empresa/producto, sin dimensión sucursal/variante. No se infiere ausencia de otras tablas reales sin consulta.
- Informe parcial: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/productos-servicios/AUDITORIA_BASE_DATOS_PRODUCTOS_SERVICIOS_20260909.md`. Anexo con esquema declarado y SELECT pendientes; no confundirlo con esquema real certificado.
- No hubo cambios de datos, esquema, migraciones, SQL de escritura ni código funcional. No se iniciaron servidores. La auditoría no autoriza correcciones ni reabre Ticket 10.



## Patron CheckApp

- Antes de modificar una pantalla, lee `AGENTS.md` y la documentacion de `docs/ui/`.
- Si la tarea impacta UI, ejecuta este flujo:
  - audita comportamiento actual
  - detecta riesgos funcionales y responsive
  - implementa con cambios minimos
  - valida que no se rompa el flujo principal
  - documenta evidencia y pendientes
- Usa la paleta y tokens definidos documentalmente en `docs/ui/PATRON_CHECKAPP.md`.
- No dejes colores hardcodeados cuando exista token definido por el Patron CheckApp.
- Todo icono contenido en un boton primario con fondo rojo debe renderizarse en `#FAFAFA`; nunca debe heredar gris, muted, secondary ni otro color que reduzca su contraste.
- Para tablas y listados reutilizables converger al futuro componente oficial `CheckAppDynamicGrid`.
- Para paneles de filtros plegables converger al futuro componente oficial `CheckAppFilterAccordion`.
- Desde `2026-07-24` la implementación técnica oficial inicial ya existe en:
  - `checklist/wwwroot/css/checkapp-theme.css`
  - `checklist/wwwroot/js/checkapp-ui.js`
  - `docs/ui/CHECKAPP_COMPONENTES.md`
- Toda pantalla debe contemplar `loading`, `empty state`, `error state` y mobile real.
- No muevas logica de negocio al frontend.
- No cambies contratos, permisos, sesion o persistencia sin instruccion explicita.
- Cuando no puedas completar una auditoria o QA, dejalo documentado con fecha `2026-07-24` y el bloqueo real.

## Regla documental permanente

- Toda decision de Product Owner, regla de negocio, restriccion, cambio relevante, estado de QA, pendiente real y cierre de etapa debe quedar registrado en `AGENTS.md` y `CLAUDE.md` en la misma iteracion.
- `AGENTS.md` y `CLAUDE.md` deben permanecer consistentes y no pueden contradecirse.

## Productos y Servicios

- TICKET 09 — `Presentaciones de venta` FASE 2 implementada el `2026-09-03`:
  - pre-check SQL: `UX_ProductosServicios_Empresa_Id` único en `(idEmpresa, id)`; tabla y FK compuesta creadas
  - inicialización: `5` candidatos y `5` presentaciones iniciales creadas, sin duplicados ni cambios a precios, inventario o históricos
  - API transaccional para CRUD/baja lógica, predeterminada única y sincronización `PrecioPublico` ↔ predeterminada; productos únicamente y tenant resuelto en servidor
  - bloqueo de cambio de unidad con presentaciones adicionales; motor exacto con escala decimal real y límite de `100000` unidades normalizadas
  - motor QA local PASS: `1, 6, 7, 10, 12, 16, 20`, imposible y tela `150 cm = $95`; build API/frontend y sintaxis JS PASS
  - UI compacta y modal en `Precios y Costos`; servicios y precio unitario quedan fuera de este flujo
  - pendiente: QA visual autenticada CRUD/multitenant/responsive; los procesos locales preexistentes se preservaron
  - POS, ventas, inventario E2E y Ticket 08: sin cambios.
- TICKET 09 — certificación real previa a QA PO, `2026-09-03`:
  - auditoría SQL de solo lectura: productos activos `5`, con unidad `5`, con precio público válido `5`; presentaciones iniciales `5`, correctas `5`, predeterminadas inválidas `0`, duplicados `0`
  - el histórico previo de candidatos corresponde a esos mismos `5` productos; después de inicializar, candidatos pendientes `0`
  - evidencia de procesos: `POST /api/ProductosServicios/CalcularPresentacionesVentaProductoServicio` en `5127` devuelve `404` y la ruta MVC nueva en `5200` devuelve `404`
  - dictamen operativo: `LOS PROCESOS PREEXISTENTES NO TIENEN CARGADA FASE 2 — SE REQUIERE AUTORIZACIÓN PARA REINICIAR`
  - no se reiniciaron ni terminaron procesos, no se ejecutó SQL estructural adicional y no se alteraron datos QA.
- TICKET 09 — reinicio autorizado para certificación, `2026-09-03`:
  - PIDs anteriores registrados en la auditoría previa: frontend `37965/37966`, API `37967/37968`; ya no existían al aplicar la autorización
  - servicios nuevos iniciados desde el workspace actual: frontend PID `39900` en `5200`, API PID `39891` en `5127`
  - verificación inequívoca: el contrato nuevo `CalcularPresentacionesVentaProductoServicio` en `5127` responde `401` sin contexto, no `404`; Fase 2 quedó cargada
  - la sesión autenticada no sobrevivió al reinicio: `ProductosServicios/Index` redirige a `Login/Index`
  - ambos servicios permanecen funcionando; QA visual queda detenida hasta que el Product Owner haga login manualmente, sin usar credenciales ni usuarios alternos.
- TICKET 09 — `Presentaciones de venta` auditado en `FASE 1` el `2026-09-03`.
- Dictamen oficial vigente:
  - `PROPUESTA PRESENTACIONES DE VENTA — PENDIENTE APROBACIÓN PO`
- Hallazgos confirmados:
  - la unidad base actual del producto sí existe en `ProductosServicios.idUnidadMedida`
  - `PermiteDecimales` ya existe en `ProductosServiciosUnidadesMedida` y debe seguir gobernando equivalencias decimales
  - no existe hoy tabla, DTO, endpoint ni UI persistente para `Presentaciones de venta`
  - `PrecioPublico` permanece como precio legado único del producto base y tiene consumidores en listado, detalle, ficha, PDF y flujos comerciales relacionados
  - `Precio unitario` se conserva como concepto independiente y no sustituye `Presentaciones de venta`
  - `Variantes` siguen siendo un modelo separado y no deben absorber esta funcionalidad sin nueva decisión PO
- Propuesta técnica para una futura `FASE 2`, aún sin implementar:
  - agregar tabla hija `dbo.ProductosServiciosPresentacionesVenta`
  - sincronizar `PrecioPublico` con la presentación predeterminada dentro de la misma transacción de guardado
  - resolver el motor automático en backend con cobertura exacta, menor precio total y desempates deterministas
  - bloquear el cambio de unidad base cuando existan presentaciones activas hasta tener flujo explícito de migración o recreación
- Restricción vigente del ticket:
  - esta corrida fue solo de auditoría y propuesta
  - no se modificó código funcional
  - no se ejecutó SQL
  - no se modificó `POS`
  - no se modificó `Ticket 08`
- Documento base:
  - `docs/productos-servicios/TICKET_09_PRESENTACIONES_VENTA_AUDITORIA_FASE1_2026-09-03.md`
- TICKET 07.1 — Cierre por QA del Product Owner registrado el `2026-08-25`.
- Dictamen oficial vigente:
  - `TICKET 07.1 CERRADO POR QA DEL PRODUCT OWNER — DOCUMENTACIÓN ACTUALIZADA`
- QA manual final aprobado:
  - `Editar` de `Producto` abre y conserva datos
  - `Peso del producto` y `Paquete` cargan/persisten correctamente
  - `Peso físico total`, `Peso volumétrico` y `Peso facturable` quedaron correctos
  - `Guardar` y `F5 + Editar` conservan información
  - `Ficha técnica` y `PDF` muestran correctamente valores logísticos
  - `Servicio` sigue cumpliendo `Ticket 04` sin logística no aplicable
  - `Ticket 06`, `Tags` y `Variantes` permanecen intactos
- Regla logística aprobada y congelada:
  - factor volumétrico aprobado: `5000`
  - `Peso físico total = PesoKg + PesoEmpaqueVacioKg`
  - `Peso volumétrico = (LargoCm × AnchoCm × AltoCm) / 5000`
  - `Peso facturable = MAX(PesoFisicoTotalKg, PesoVolumetricoKg)`
  - los derivados `NO` se persisten
  - la fuente de verdad oficial es `backend`
  - cualquier cálculo visual en frontend es solo previsualización
- Fuente logística vigente:
  - `ProductosServicios.PesoKg`
  - `ProductosServiciosPaquetes.PesoEmpaqueVacioKg`
  - `ProductosServiciosPaquetes.LargoCm`
  - `ProductosServiciosPaquetes.AnchoCm`
  - `ProductosServiciosPaquetes.AltoCm`
- Restricción de cierre:
  - no reabrir `Ticket 03`, `04`, `05`, `06` ni `Ticket 07` Ficha Técnica por este cierre
  - no tocar código ni SQL de `Ticket 07.1` sin nueva instrucción del Product Owner
- TICKET 05 — Cierre definitivo por Product Owner registrado el `2026-08-25`.
- Dictamen oficial vigente:
  - `TICKET 05 CERRADO POR PRODUCT OWNER — 100% APROBADO Y CONGELADO`
- Alcance final certificado por QA manual del Product Owner:
  - `CRUD` de catálogos de `Activos` aprobado
  - `readonly` y conservación de código aprobados
  - consecutivos server-side y cancelación sin consumo de código aprobados
  - integridad multitenant, validaciones, combos y altas rápidas aprobados
  - homologación visual de catálogos de `Productos y Servicios` aprobada
  - microajuste final de `Unidad de medida` aprobado
  - microajuste final de `Colección` aprobado
- Estado aprobado por Product Owner el `2026-08-25`:
  - `Unidad CRUD`: aprobado
  - `Unidad quick-add`: aprobado
  - homologación `Unidad CRUD` + `quick-add`: aprobada
  - guardado de `Unidad`: aprobado
  - `Colección quick-add`: aprobada
  - guardado de `Colección`: aprobado
  - nueva `Colección` queda seleccionada: aprobada
- Congelamiento obligatorio desde el `2026-08-25`:
  - no reabrir ni modificar el diseño CRUD de catálogos de `Activos`
  - no reabrir ni modificar el diseño homologado de catálogos de `Productos y Servicios`
  - no reabrir ni modificar modales `quick-add` homologados
  - no tocar generación automática de códigos, `readonly`, consecutivos ni cancelación sin consumo
  - no tocar integridad multitenant, validaciones, combos ni altas rápidas ya certificadas
  - no reabrir ajustes finales de `Unidad de medida` ni `Colección`
  - no modificar código, SQL ni ejecutar nuevas pruebas funcionales de `Ticket 05` sin autorización expresa
- TICKET 03 — Última corrección definitiva auditada el `2026-08-21`.
- Resultado real de la iteración:
  - `Atributos` quedó en flujo SKNC compacto:
    - header sin botones funcionales
    - combos `Atributo [+]` y `Elemento [+]`
    - `Elemento` solo se habilita después de seleccionar atributo
    - `Nuevo elemento` abre modal contextual con atributo solo lectura
    - UI real validó dependencia correcta:
      - `Sabor` -> `Fresa`, `Chocolate`
      - `Material` -> `Acero`
    - persistencia reabierta en UI real:
      - `Sabor -> Fresa`
      - `Material -> Acero`
  - `Variantes` quedó en flujo Shopify inline:
    - se retiró la UX de `Generar variantes`
    - el foco ya no se pierde al agregar valores
    - la tabla se recalcula en tiempo real
    - UI real validó:
      - `CH/M/G` -> `3` variantes
      - `CH/M` + `Negro/Blanco` -> `4` variantes en orden `CH/Negro`, `CH/Blanco`, `M/Negro`, `M/Blanco`
      - al eliminar `Blanco` permanecen `CH/Negro` y `M/Negro`
      - al reabrir persistieron `CH/Negro = 411` y `M/Negro = 421`
  - `Multimedia` siguió operando sin regresión visible en UI real:
    - `0` fotos
    - `1` video
    - `1` documento
  - Defecto real pendiente:
    - `Variantes` todavía no expone columna ni flujo de `Imagen`
    - no existe `Agregar/Cambiar imagen` por fila
    - el modelo/contrato activo no entrega persistencia independiente de imagen por variante
- Dictamen real del `2026-08-21`:
  - `TICKET 03 SIGUE FALLANDO — falta imagen propia por variante obligatoria en la matriz; hoy la variante no tiene columna ni persistencia de imagen independiente de la multimedia general del ProductoServicio.`
- TICKET 03 — Reimplementación controlada cerrada técnicamente el `2026-08-21`.
- Regla obligatoria:
  - `Inventario` ya estaba aprobado y no se toca fuera de regresión básica.
  - `Atributos` y `Variantes` no comparten flujo funcional ni catálogo obligatorio.
  - `Multimedia` debe validarse sobre su dueño real dentro de `ProductosServicios`.
- Auditoría obligatoria completada:
  - legacy auditado en `/Users/denissemendiola/dev/skncCreator/skncCreator`
  - SKNC confirma modelo `Atributo -> Elemento dependiente -> Asociación al producto`
  - esa asociación descriptiva no genera matriz de variantes
  - la mezcla original en CheckApp venía del frontend y no del concepto legacy
- Reimplementación final:
  - `Atributos` queda homologado a SKNC:
    - atributo existente o alta rápida
    - elementos dependientes por atributo
    - alta rápida de elemento ligada al atributo
    - asociación persistida `ProductoServicio -> Atributo -> Elemento`
  - `Variantes` queda homologado al modelo Shopify:
    - opciones propias del producto
    - valores por opción
    - generación de matriz a partir de esas opciones
    - independencia total respecto a `ProductosServiciosAtributos`
  - Persistencia nueva/documentada:
    - `ProductosServiciosOpcionesVariante`
    - `ProductosServiciosOpcionesVarianteValores`
    - `ProductosServiciosVariantes`
    - `ProductosServiciosVarianteValores` con soporte para ids de opción/valor de variante
  - Endpoints relevantes:
    - `GuardarValorAtributoProductoServicio`
    - `ObtenerValoresAtributoProductoServicio`
    - detalle de producto incluye `opcionesVariante`
  - Multimedia certificada como propia de `ProductosServicios`:
    - tabla `ProductosServiciosMultimedia`
    - relación por `idProductoServicio`
    - almacenamiento temporal/final bajo carpeta `ProductosServicios`
    - no depende de `Activos`
- Validación técnica del `2026-08-21`:
  - `node --check` del JS de `ProductosServicios` sin error
  - `dotnet build` MVC con `0` errores y warnings preexistentes
  - `dotnet build` API con `0` errores y warnings preexistentes
- Estado real de QA browser:
  - la sesión autenticada previa fue expulsada y redirigida a `Login/Index`
  - el bloqueo fue de sesión QA y no de compilación ni de arquitectura
  - Ticket 03 queda listo para QA manual de Denisse
- Microcorrección de alta rápida auditada el `2026-08-20` para `Colección`, con revisión acotada del mismo patrón en `Paquete` y `Atributo`.
- Causa raíz confirmada:
  - el frontend asumía éxito con cualquier `200 OK`, incluso con respuesta vacía o sin entidad válida
  - el modal se cerraba y mostraba confirmación antes de comprobar persistencia real y actualización del combo
- Corrección aplicada:
  - la API de altas rápidas ahora devuelve la entidad creada con identificador válido para `Colección`, `Paquete` y `Atributo`
  - el frontend solo cierra el modal y muestra éxito cuando existe entidad válida y el combo confirma el item creado/seleccionable
  - si la respuesta es vacía, ambigua o inválida, el modal permanece abierto, conserva la captura y muestra error funcional
- Regla global obligatoria para altas rápidas:
  - `No mostrar éxito ni cerrar modal hasta confirmar persistencia real y obtener entidad válida.`
- QA final acotado de `Productos y Servicios` ejecutado el `2026-08-20`:
  - variantes simples certificadas con `3` resultados `CH`, `M` y `G`, sin duplicados y con persistencia SQL validada
  - variantes combinadas certificadas con `4` combinaciones `CH / Negro`, `M / Negro`, `CH / Blanco` y `M / Blanco`, con precios por variante persistidos sin pisar el precio base
  - `QA-SERVICIO-AMPLIADO-20260819` reabrió correctamente con estatus, colección, precios, SAT y `Producto físico = No`
  - registros históricos previos a la ampliación cargan y siguen siendo editables con `null/default` seguros
  - regresión transversal breve validada en navegador real autenticado para `Home`, `Roles y Permisos`, `Cotizaciones`, `Órdenes de compra`, `ContestarLista` y `Activos`, sin `404` ni `500` visibles
  - multimedia validó persistencia real en Firebase para `1 foto`, `1 video` y `1 documento`, con metadatos y contadores reflejados en API y listado
  - defectos reales reproducidos y corregidos dentro de la misma corrida:
    - el API aceptaba `idAtributoValor` ajeno/cruzado en variantes; ahora rechaza referencias que no pertenezcan al atributo y empresa activos
    - al eliminar toda la multimedia el guardado fallaba por `STRING_SPLIT` vacío; ahora desactiva correctamente todas las evidencias cuando la lista final queda vacía
  - cobertura pendiente no clasificada como defecto real:
    - validación visual manual de responsive real `768` y `390` en la sesión autenticada
    - validación visual manual de preview/mensajes UI de multimedia en navegador, limitada en esta corrida por la superficie de automatización disponible
- Cierre documental definitivo del `TICKET 02` registrado el `2026-08-21` por QA manual final del Product Owner:
  - `Ticket 01` quedó previamente aprobado
  - `Configuración comercial 2+1+1+1+1` quedó aprobada
  - `placeholders` monetarios quedaron aprobados
  - `Precio unitario` quedó aprobado
  - `SAT` quedó aprobado
  - `Configuración física` quedó aprobada
  - `Logística/Paquete` quedó aprobada
  - las altas rápidas de `Categoría`, `Marca`, `Colección` y `Unidad` quedaron corregidas
  - las validaciones distinguen exactamente `código/número` vs `nombre`
  - el backend impide nuevos duplicados lógicos
  - causa raíz real de `Select2` confirmada:
    - `dropdownParent` incorrecto provocaba superposición y autoselección
    - `clear` dejaba el dropdown abierto
  - corrección definitiva aplicada y aprobada en QA:
    - `dropdownParent` normalizado a `.modal-body`
    - `clear` limpia y cierra
    - `seleccionar -> X -> reseleccionar` quedó estable
  - `Tipo` ya no se fuerza automáticamente a `Producto` al abrir `Nuevo`
  - no modificar los backlogs congelados
  - no avanzar a `Ticket 03` hasta nueva instrucción del Product Owner
- TICKET 01 — Diseño ProductosServicios ejecutado el `2026-08-20` con alcance solo UX/UI.
- Restricciones permanentes del ticket:
  - no tocar backend, API, SQL, Firebase, persistencia ni reglas de negocio
  - conservar exacta la lógica funcional de `producto físico`, inventario, atributos, variantes y multimedia
  - reutilizar el patrón existente de colapsables de `Cotizaciones/Nueva`
- Resultado de diseño aplicado:
  - retícula superior de `6` columnas en desktop
  - `Imagen principal` a `2` columnas y altura limitada hasta `Descripción`
  - orden superior: `Tipo | Nombre`, `Estatus | Código | Tag`, `Descripción`, `Categoría | Marca | Colección`
  - secciones inferiores convertidas a colapsables compactos sin aire residual al cerrar
- Validación técnica del ticket:
  - `node --check` del JS de `ProductosServicios` sin error
  - `dotnet build` MVC con `0` errores y warnings preexistentes
- Estado local al cierre:
  - `localhost:5200` activo en PID `56251`
  - `localhost:5127` activo en PID `56250`
- Bloqueo real de la corrida automática:
  - la navegación automática a `ProductosServicios/Index` cayó en login por falta de sesión autenticada reutilizable
  - la validación visual final del modal autenticado y del responsive real queda pendiente de QA manual de Denisse
- TICKET 01 — Microcorrección QA Manual ejecutada el `2026-08-21` con alcance solo UX/UI.
- Restricciones permanentes de esta microcorrección:
  - no tocar backend, API, SQL, Firebase, persistencia ni reglas de negocio
  - conservar intacta la retícula ya aprobada del bloque superior
  - usar el mismo patrón de colapsables ya aplicado en el modal
- Resultado aplicado:
  - `Información general` ahora existe como card colapsable y contiene `Imagen principal`, `Tipo`, `Nombre`, `Estatus`, `Código`, `Tag`, `Descripción`, `Categoría`, `Marca` y `Colección`
  - `Información general` inicia abierta
  - `Configuración comercial` inicia abierta
  - el resto de secciones del modal inicia cerrado
  - el encabezado completo de cada sección del modal quedó clicable y soporta teclado, manteniendo el indicador derecho `Expandir / Contraer`
  - colapsar es un comportamiento exclusivamente visual y no altera datos, combos, variantes, multimedia ni flujo funcional
- Validación técnica:
  - `node --check` del JS de `ProductosServicios` sin error
  - `dotnet build` MVC con `0` errores y warnings preexistentes
- TICKET 02 — Diseño y Validaciones ejecutado el `2026-08-21` con alcance acotado a catálogos rápidos, SAT, precio unitario y paquete.
- Reglas permanentes del ticket:
  - no avanzar a Ticket 03 automáticamente
  - no tocar secciones posteriores ni backlogs congelados
  - `Configuración física y de control` no se rediseña
  - no cambiar SQL cuando el modelo actual ya soporte el comportamiento requerido
- UX obligatoria desde `2026-08-21` para `Categoría`, `Marca`, `Colección`, `Unidad` y `Paquete`:
  - validar obligatorios conocidos antes del POST con mensaje específico
  - ante error funcional, el modal sigue abierto y conserva captura
  - solo cerrar modal cuando exista persistencia real y selección confirmada del item creado
  - no mostrar mensajes técnicos al usuario final
- Modelo final de `Precio unitario`:
  - se reutiliza el modelo SQL existente `Monto + BaseCantidad + Unidad`
  - la UI final usa editor compacto en español; ya no deja tres inputs sueltos permanentes en desktop
  - si existe captura parcial de precio unitario, frontend y API deben exigir la terna completa
- Fuente SAT auditada el `2026-08-21`:
  - `Raramuri.blzr` consume `_opcionesProd` y `_opcionesUnidad`
  - `sazapi` resuelve el catálogo SAT desde servicio externo y no desde listas hardcodeadas
  - CheckApp debe consultar SAT vía `MVC -> API CheckApp -> catálogo SAT externo`
  - `H87` se conserva como unidad segura por defecto
- Regla logística vigente:
  - `Peso del producto` y `peso vacío del paquete` son conceptos distintos
  - las dimensiones visibles del paquete viven en el catálogo de paquetes
  - las dimensiones del producto se mantienen solo por compatibilidad backend y pueden ocultarse en UI si el modelo auditado demuestra redundancia
- Paquete predeterminado:
  - la API actual ya soporta `EsPredeterminado` por empresa
  - si se marca un nuevo predeterminado, debe desactivar el anterior
  - en alta nueva de producto físico, el frontend debe preferir el paquete predeterminado cuando exista y el selector siga vacío

## Vertical Cotizaciones

### Reglas globales

- Cotizaciones opera en MVC `http://localhost:5200` y API `http://localhost:5127`.
- La referencia visual obligatoria es `Activos`; no modificar `Activos` al implementar Cotizaciones.
- `Sazmobile26` es legacy de solo lectura para auditoria y migracion funcional.
- Regla permanente del vertical: `NO TALLAS`.
- No modificar `Login`, `Firebase`, `Sesion`, `SQL`, roles, permisos u otros verticales sin autorizacion expresa.
- QA manual del Product Owner prevalece sobre la certificacion automatica.
- Las microiteraciones no deben alterar funcionalidades ya aprobadas.
- Si Codex inicia procesos para QA, solo esos procesos deben detenerse al terminar.
- Desde el `2026-08-14`, `Cotizaciones > Enviar por correo` debe consumir exclusivamente `DocumentEmailService` y la configuracion documental de `Correo saliente`; queda prohibido volver a conectarlo con `EmailServices`, `MailRegistro`, Firebase o SMTP legacy de autenticacion.

### Historia minima obligatoria

- `Etapa 00`: preparacion del vertical, menu `Cotizaciones -> ABC Cotizaciones`, ruta `/Cotizaciones/Index`, sin roles nuevos.
- `Etapa 00.1`: integracion de `Enviar por correo` con `Correo saliente` documental por empresa activa, usando `DocumentEmailService`, PDF existente y bloqueo funcional cuando falta configuracion o verificacion.
- `Etapa 01`: migracion funcional base desde `Sazmobile26` en solo lectura, incluyendo listado, nueva cotizacion, cliente, sucursal, vigencia, observaciones, productos, servicios, partidas, cantidad, precio, descuento, subtotal, total, guardado, borrador, edicion, clonacion, cancelacion y PDF.
- `Etapa 02`: distribucion y autorizacion, incluyendo WhatsApp, correo, compartir, PDF, autorizacion y estados `Borrador`, `Autorizada` y `Cancelada`.
- `Etapa 03`: mejoras UX/UI de `Nueva cotizacion` con Patron CheckApp, resumen, colapsado inteligente, cliente, descuento, datos, observaciones, productos/servicios, imagenes, detalle operativo, responsive, popup PDF y regreso al Reporte.
- `Etapa 03.1`: auditoria de descuento, distinguiendo `descuento cliente` y `descuento partida`; regla heredada `max(descuentoProductoBase, descuentoCliente)` con tope automatico de `10%`, salvo edicion manual autorizada.
- `Etapa 03.2`: correccion del payload de clientes para exponer `Descuento`; caso validado `Sadie Sink 5%`, producto `$680`, descuento `$34`, total `$646`.
- `Etapa 03.3`: compactacion visual de `Unidad`, `Cantidad` y `Precio` en desktop, sin romper tablet ni mobile.
- `Etapa 04`: correccion del `localhost` en WhatsApp; estado real aprobado: chat correcto, telefono correcto, mensaje limpio, sin `localhost`, sin `GUID`, PDF generado y descargado; pendiente real: el PDF no se adjunta automaticamente al chat. Correo sigue bloqueado porque `mail.supervisores.mx` no resuelve por DNS.
- `Etapa 04.2`: auditoria final de distribucion; el navegador real auditado no expone `navigator.share`, `navigator.canShare` ni soporte `files`, por lo que `wa.me` solo transporta texto y el adjunto del PDF debe seguir siendo manual mientras no exista soporte web real o una definicion aprobada distinta.
- `Etapa 04.3`: cierre post-QA manual del `2026-08-15`; resultado oficial:
  - `Web Share API` no cumple la promesa UX de `Enviar por WhatsApp` porque solo abre un chooser genérico
  - `wa.me` sí cumple apertura directa del chat con destinatario y texto, pero no preadjunta el PDF
  - no quedó documentado un mecanismo web oficial aprobado para forzar WhatsApp con PDF local preadjunto desde navegador estándar
  - el único camino oficial para envío directo de documento PDF es `WhatsApp Business Platform / Cloud API`, con número business, token e infraestructura adicional
  - la decisión vigente del producto es mantener `WhatsApp` como apertura directa del chat oficial + descarga/preparación del PDF real, sin fingir adjunto automático
  - el modal de correo ya no debe autocerrarse: permanece abierto durante `Enviando...`, bloquea doble clic y cambia a confirmación visible hasta que el usuario cierre

### Integracion correo documental

- Integracion concluida el `2026-08-14` para `Cotizaciones > Enviar por correo`.
- Auditoria corta del flujo anterior:
  - frontend: `wwwroot/js/Cotizaciones/Cotizaciones.js -> sendCotizacionCorreo()`
  - endpoint MVC: `Controllers/Cotizaciones/CotizacionesController.cs -> EnviarCotizacionCorreo`
  - servicio legacy anterior: `EmailServices`
  - configuracion SMTP anterior: `MailRegistro` en Firebase
  - PDF vigente reutilizado: `api/Cotizaciones/ExportarCotizacionPdf`
- Arquitectura final aplicada:
  - el modal aprobado de correo se conserva
  - MVC `CotizacionesController` deja de enviar SMTP y solo hace proxy al API
  - API `CotizacionesController` resuelve la empresa activa server-side
  - API carga `ConfiguracionCorreoSaliente` de la empresa activa
  - API desbloquea la credencial protegida con `IDataProtector`
  - API reutiliza `DocumentEmailService`
  - API adjunta el PDF existente como `cotizacion_{FOLIO}.pdf` con `application/pdf`
- Reglas funcionales aplicadas:
  - si no existe configuracion documental activa o la credencial protegida no es valida, el flujo responde `No hay una cuenta de correo configurada para enviar documentos.`
  - si la cuenta existe pero no esta verificada, el flujo responde `La cuenta de correo debe verificarse antes de enviar documentos.`
  - no se acepta `idEmpresa` del navegador como autoridad para resolver la cuenta documental
  - no se duplico SMTP ni se creo un servicio paralelo
- Ajuste UX aplicado en el modal:
  - asunto sugerido: `Cotización {FOLIO}`
  - mensaje sugerido:
    - `Hola,`
    - `Te compartimos la cotización {FOLIO} por un total de {TOTAL}.`
    - `Adjuntamos el documento en formato PDF.`
    - `Saludos.`
- Archivos intervenidos:
  - `Controllers/Cotizaciones/CotizacionesController.cs`
  - `wwwroot/js/Cotizaciones/Cotizaciones.js`
  - `../inspectorapi/checklistWs/Controllers/Cotizaciones/CotizacionesController.cs`
  - `../inspectorapi/checklistWs/Models/Cotizaciones/CotizacionesModels.cs`
  - `../inspectorapi/checklistWs/Services/DocumentEmailService.cs`
- Validacion tecnica:
  - `node --check checklist/wwwroot/js/Cotizaciones/Cotizaciones.js`
  - `dotnet build inspector/checklist/checklist.csproj`
  - `dotnet build inspectorapi/checklistWs/checklistWs.csproj`
  - ambas compilaciones cerraron con `0` errores y warnings preexistentes del proyecto
- Certificacion E2E auditada el `2026-08-14` en sesion real autenticada:
  - usuario observado: `Denisse Martinez Mendiola`
  - empresa observada: `UMBRELLA`
  - modo observado: `Administracion`
  - `Ajustes > Configuracion > Correo saliente` quedo `Verificada` con `smtp.gmail.com`, puerto `465`, seguridad `SSL/TLS` y password enmascarado
  - cotizacion auditada: `COT-000018`, cliente `Sadie Sink`, correo precargado `alltoowell@song.com`, total `$1,302.00`
  - el modal precarga asunto `Cotización COT-000018` y mensaje documental aprobado
  - durante la corrida automatizada no se obtuvo evidencia suficiente de aceptacion SMTP ni de cierre exitoso del modal; el dictamen funcional queda pendiente de QA manual del Product Owner
  - si se confirmo comunicacion local `MVC 5200 -> API 5127` durante la prueba y la arquitectura vigente por codigo sigue resolviendo empresa server-side, `IDataProtector`, `DocumentEmailService` y adjunto `cotizacion_{FOLIO}.pdf`
  - hallazgo pendiente: `wwwroot/js/Cotizaciones/Cotizaciones.js -> sendCotizacionCorreo()` no deshabilita `#btCotConfirmarCorreo` durante el submit, por lo que la proteccion contra doble clic no esta certificada
- Correccion post-QA manual aplicada el `2026-08-14` para `Cotizaciones > WhatsApp` y `Cotizaciones > Enviar por correo`:
  - causa raiz del PDF en WhatsApp: `wa.me` solo transporta texto; el flujo anterior descargaba el PDF y abria WhatsApp en un `.finally()`, por lo que nunca podia adjuntar el archivo automaticamente
  - capacidad soportada por diseno final:
    - si `navigator.share` + `navigator.canShare({ files })` + `File` + contexto seguro estan disponibles, el flujo usa `Web Share` con `application/pdf`
    - si esa capacidad no existe, el flujo hace fallback honesto: descarga/prepara `cotizacion_{FOLIO}.pdf`, abre WhatsApp con texto limpio y avisa que el usuario debe adjuntar el archivo manualmente
  - queda prohibido insertar `localhost`, `GUID`, rutas internas o afirmar adjunto automatico cuando el navegador no lo soporta
  - causa raiz del cruce WhatsApp -> Correo: ambos flujos reutilizaban `state.action` como estado mutable compartido; la correccion separo estado y busy flags por canal
  - regla operativa nueva:
    - WhatsApp usa estado independiente `distribution.whatsapp`
    - Correo usa estado independiente `distribution.email`
    - un clic en WhatsApp no puede disparar Correo
    - un clic en Correo no puede disparar WhatsApp
  - UX obligatoria:
    - WhatsApp muestra feedback inmediato `Preparando cotización...`
    - Correo muestra feedback inmediato `Enviando...`
    - ambos bloquean doble clic mientras la operacion esta en curso
    - Correo solo cierra despues de mostrar `Correo enviado correctamente.`
  - iconografia aprobada:
    - se reemplazo el pseudo-icono anterior por SVG explicito de WhatsApp, sin introducir una libreria nueva
    - tooltip aprobado: `Enviar por WhatsApp`
    - aria-label aprobado: `Enviar cotización por WhatsApp`
  - cierre UX aprobado el `2026-08-15`:
    - se eliminó el discurso técnico del modal de WhatsApp
    - el icono de WhatsApp quedó reforzado visualmente para evitar botones aparentemente vacíos en el DynamicGrid
    - el modal de correo conserva el contexto al enviar y muestra estado de éxito persistente sin autocierre
  - certificación final post-QA manual del `2026-08-15`:
    - `Correo` quedó funcionalmente aprobado por Product Owner con evidencia real en Gmail y PDF adjunto correcto
    - la microcorrección final de correo solo debía dejar un único botón `Cerrar` tras el éxito
    - `WhatsApp` permanece aprobado solo como apertura de chat + texto precargado
    - el adjunto automático de PDF no es resolvible con otro parche frontend sobre `wa.me`, `api.whatsapp.com`, `Web Share` o deep links web
    - la evolución futura correcta queda documentada como `WhatsApp Business Platform para distribución documental`
  - auditoría preimplementación de `WhatsApp Business Platform` cerrada el `2026-08-15`:
    - API oficial recomendada: `Cloud API`
    - la plataforma sí soporta PDF, documento con caption y plantillas con header de documento
    - estrategia técnica recomendada: `Media Upload API -> media_id -> document message`
    - el PDF vigente de cotizaciones debe reutilizarse desde el backend actual; no debe duplicarse
    - fuera de la ventana de servicio de `24` horas, los mensajes iniciados por empresa requieren template aprobado
    - para clientes que nunca escribieron antes, además del template se requiere opt-in válido
    - la futura configuración debe ser tenant por empresa y aislada de `Correo saliente`
    - los secretos de Meta deben vivir únicamente en backend
    - la etapa futura requiere webhooks y trazabilidad de estados
    - complejidad estimada: `ALTA`
  - cierre definitivo de producto para `WhatsApp` el `2026-08-15`:
    - `Correo` queda definido como distribución automática con PDF adjunto
    - `WhatsApp` queda definido como distribución asistida
    - `desktop`: preparar/descargar PDF + abrir chat correcto con mensaje limpio; el usuario adjunta el PDF manualmente
    - `mobile/tablet`: usar share nativo del PDF solo cuando el entorno realmente soporte compartir `File`
    - si `mobile/tablet` no soporta compartir `File`, usar automáticamente el fallback asistido de desktop
    - la decisión no debe depender solo del ancho de pantalla; debe apoyarse principalmente en capacidades reales del navegador y tipo de dispositivo
    - queda prohibido seguir parcheando adjunto automático desktop con `wa.me`, `api.whatsapp.com`, deep links o automatización del navegador
    - `WhatsApp Business Platform` sigue siendo evolución futura opcional fuera del alcance actual

## Ajustes > Configuración > Correo saliente

- Desde el `2026-08-13`, `Correo saliente` queda definido como correo saliente documental de negocio y no como parte de autenticación o correo interno base.
- Su alcance exclusivo es:
  - cotizaciones
  - órdenes de compra
  - documentos comerciales o operativos para cliente autorizados por Product Owner
- Queda prohibido mezclarlo con:
  - `LoginController`
  - registro
  - recuperación de contraseña
  - Firebase Authentication
  - `MailRegistro`
  - `mail.supervisores.mx`
  - infraestructura SMTP base compartida
- Árbol aprobado:
  - `Ajustes`
  - `Configuración`
  - `Correo saliente`
- Regla confirmada:
  - `Configuración` debe ir después de `Operadores`
  - `Correo saliente` será el único hijo inicial
- Hallazgos reales:
  - `EmailServices` ya existe en MVC y depende de `MailRegistro`
  - `MailRegistro` se hidrata hoy desde Firebase Realtime Database
  - consumidores auditados: `LoginController` y `CotizacionesController`
  - no se encontró SMTP por empresa en SQL, API ni `appsettings`
  - el modelo actual es global, no multitenant
  - el bloqueo de `mail.supervisores.mx` en Cotizaciones proviene de esa misma fuente global
- Corrección arquitectónica obligatoria:
  - el hallazgo anterior demuestra riesgo en la infraestructura actual, no una arquitectura a reutilizar para el nuevo módulo
  - el nuevo correo saliente documental debe vivir como subsistema aislado, multitenant y sin tocar la infraestructura base protegida
  - la contraseña no puede volver al navegador una vez guardada
- Documento base de planeación:
  - `docs/configuracion/CORREO_SALIENTE_AUDITORIA_PREIMPLEMENTACION.md`
- QA Google Workspace del `2026-08-14`:
  - sesión QA reutilizada con configuración visible:
    - `denisse@checkapp.com.mx`
    - `smtp.gmail.com`
    - puerto `465`
    - `SSL/TLS`
  - infraestructura SMTP validada fuera de la UI:
    - DNS correcto para `smtp.gmail.com`
    - TLS válido en `smtp.gmail.com:465`
  - resultado real del módulo:
    - la pantalla siguió mostrando `La respuesta del servidor no pudo interpretarse.`
    - no hubo evidencia observable de salida SMTP del backend a `smtp.gmail.com:465` en la corrida
  - estado de certificación:
    - Google Workspace SMTP no quedó certificado todavía
    - el siguiente diagnóstico debe concentrarse en UI/proxy MVC/API antes de culpar autenticación SMTP
  - corrección parcial aplicada el mismo día:
    - `Controllers/Configuracion/ConfiguracionController.cs` quedó endurecido para mantener contrato JSON consistente en `Obtener/Probar/GuardarCorreoSaliente`
    - el proxy MVC ahora fuerza `Accept: application/json`, envía `application/json` explícito y devuelve JSON controlado ante contenido vacío, no JSON o excepciones del proxy
    - `La respuesta del servidor no pudo interpretarse.` quedó clasificado como error del cliente en `wwwroot/js/Configuracion/CorreoSaliente.js -> readJson(response)`

## Productos y Servicios

- Microcorrección bloqueante aplicada el `2026-08-19` solo para `ProductosServicios/Index`, sin ampliar alcance funcional.
- Hallazgo QA raíz del bootstrap:
  - primera request real: `GET /ProductosServicios/ObtenerCombosProductosServicios`
  - el proxy MVC enviaba `idEmpresa = 163`, mientras la API del módulo exige `Guid`
  - evidencia HTTP reproducible directa en API local: `400 Bad Request` con `errors.idEmpresa[0] = "The value '163' is not valid."`
- Corrección aplicada:
  - MVC normaliza `idEmpresa` legacy numérico a `Guid` canónico antes de construir query y firma proxy
  - MVC reescribe `idEmpresa` en cuerpos JSON server-side para que el navegador no sea autoridad tenant
  - frontend elimina `idEmpresa` desde payloads de producto/servicio, catálogos rápidos, colección, paquete y atributo
  - `fetchJson` interpreta `problem+json` y prioriza el mensaje útil de validación
  - variantes dejan de usar `min-width: 980px`; en `390px` se presentan apiladas sin overflow horizontal accidental
- Validación técnica del `2026-08-19`:
  - `node --check checklist/wwwroot/js/ProductosServicios/ProductosServicios.js`: correcto
  - `dotnet build checklist/checklist.csproj`: correcto con warnings legacy preexistentes
  - `dotnet build checklistWs/checklistWs.csproj`: correcto con warnings legacy preexistentes
- Pendiente real:
  - falta recertificación manual autenticada en navegador contra procesos locales ya recargados para comprobar `F5`, nueva pestaña y limpieza de `sessionStorage` sin perder funcionamiento del módulo
- Rerregresión post-microcorrección ejecutada el `2026-08-20` con sesión real de Chrome:
  - `GET /ProductosServicios/Index` respondió `200`, pero la UI continuó en estado bloqueado con `No fue posible cargar la información`
  - evidencia visible:
    - grid en `0 registros`
    - combos del listado y del modal en `0` opciones
    - `sessionStorage.idEmpresa = null`
  - el contexto server-side sí llegó a la vista:
    - `data-id-empresa = b17aaece-2b78-4e35-b554-9e694eeb15a7`
    - `data-empresa = 163`
    - `data-correo = denisse@checkapp.com.mx`
  - primera request bloqueante aislada con firma equivalente al proxy MVC:
    - `GET /api/ProductosServicios/ObtenerCombosProductosServicios?idEmpresa=b17aaece-2b78-4e35-b554-9e694eeb15a7`
    - `500 Internal Server Error`
    - payload: `{"mensaje":"No fue posible cargar los catálogos del módulo."}`
  - catálogos base auditados por separado sí responden `200`:
    - categorías
    - marcas
    - unidades
  - causa raíz confirmada en esquema activo:
    - existen tablas legacy base del módulo
    - faltan tablas nuevas de colección, paquete, atributos, variantes y multimedia
  - dictamen técnico:
    - el tenant server-side no depende de `sessionStorage`
    - el bloqueo real vigente está en el bootstrap porque el agregado de combos no tolera ausencia de tablas nuevas en la base activa
    - no se modificó código en esta corrida de QA
- Corrección SQL bloqueante ejecutada el `2026-08-20` para `ProductosServicios`:
  - `UP` real localizado y auditado en `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql`
  - `DOWN` localizado en `inspectorapi/checklistWs/Scripts/productos-servicios-down.sql`; no se ejecutó
  - la desalineación confirmada estaba en el esquema activo `db_a883c3_checklist`, no en la API ni en la sesión autenticada
  - el propio `UP` traía una inconsistencia de integridad:
    - varias FK compuestas `(idEmpresa, id)` referenciaban tablas nuevas sin índice único candidato equivalente
    - se corrigió quirúrgicamente el `UP` agregando `UX_*_Empresa_Id` para `Colecciones`, `Paquetes`, `Atributos`, `AtributosValores`, `ProductoAtributos` y `Variantes`
  - el `UP` aplicado alineó:
    - columnas nuevas de `ProductosServicios` para precio de comparación, precio unitario, SAT, control físico, dimensiones, serialización, colección y paquete
    - tablas `ProductosServiciosColecciones`, `ProductosServiciosPaquetes`, `ProductosServiciosAtributos`, `ProductosServiciosAtributosValores`, `ProductosServiciosProductoAtributos`, `ProductosServiciosProductoAtributoValores`, `ProductosServiciosVariantes`, `ProductosServiciosVarianteValores` y `ProductosServiciosMultimedia`
    - PK, FK e índices por `idEmpresa` compatibles con la implementación ampliada
  - resultado funcional después del `UP`:
    - `GET /ProductosServicios/ObtenerCombosProductosServicios` volvió a responder `200 OK` con JSON sano
    - la recarga estable de `ProductosServicios/Index` en Chrome mostró KPIs `17 / 5 / 12`, combos cargados y grid con `17 registros`
    - desapareció el mensaje `No fue posible cargar la información`
    - la validación rápida de `F5`, pestaña nueva y operación sin `sessionStorage.idEmpresa` quedó positiva
  - estado posterior a la corrección parcial:
    - `localhost:5200` compiló y se relanzó con la corrección
    - la pestaña real de Chrome permitió localizar `Enviar correo de prueba`, pero la automatización disponible no reprodujo todavía una corrida UI end-to-end concluyente
    - no existe aún evidencia cerrada de POST útil a `ProbarCorreoSaliente` ni de certificación SMTP final desde la pantalla
  - QA manual asistido concluido el `2026-08-14`:
    - Denisse ejecutó manualmente un único clic real en `Enviar correo de prueba`
    - evidencia técnica observada:
      - `POST /Configuracion/ProbarCorreoSaliente` sí salió de UI a MVC
      - MVC llamó `POST http://localhost:5127/api/CorreoSaliente/ProbarConfiguracion?...`
      - MVC recibió `200 OK` con `Content-Type: application/json`
    - evidencia funcional observada:
      - mensaje UI `Correo de prueba enviado correctamente.`
      - estado `Verificada`
      - `Guardar configuración` habilitado
    - guardado y persistencia:
      - se ejecutó un único guardado posterior con `POST /Configuracion/GuardarCorreoSaliente`
      - MVC recibió `200 OK` con `application/json`
      - después de recargar, `ObtenerConfiguracion` respondió `200 OK`
      - persistieron `denisse@checkapp.com.mx`, `smtp.gmail.com`, puerto `465`, `SSL/TLS` y estado verificado
    - seguridad:
      - la contraseña no volvió visible al navegador
      - la UI posterior solo mostró `Contraseña configurada. Déjala vacía para conservarla.`
    - certificación:
      - Google Workspace SMTP quedó certificado en el módulo `Correo saliente` a nivel UI/MVC/API y persistencia local
      - la recepción externa del buzón queda pendiente de validación manual de Denisse
  - microcorrección final de fecha/hora concluida el `2026-08-14`:
    - causa raíz exacta:
      - `FechaUltimaPrueba` se generaba con `DateTime.UtcNow`
      - SQL la persistía como `datetime2` sin offset
      - al releerla, `SqlDataReader.GetDateTime()` devolvía `Kind=Unspecified`
      - el JSON posterior a `ObtenerConfiguracion` perdía el sufijo `Z`
      - el frontend hacía `new Date(value)` y esa variante rerecuperada se interpretaba como hora local, desplazando la hora visible aproximadamente `+6` horas
    - estrategia final:
      - persistencia UTC intacta
      - el API remarca como UTC las fechas leídas desde SQL antes de serializarlas
      - la UI mantiene conversión a zona local del navegador solo para presentación
    - archivo modificado:
      - `Controllers/Configuracion/CorreoSalienteController.cs`
    - resultado QA:
      - después de recargar, `Última prueba` volvió a mostrarse como `14 ago 2026, 2:59 p.m.`

## Auditoría SKNC Órdenes de compra 2026-08-18

- Se completó auditoría integral de solo lectura sobre `/Users/denissemendiola/dev/skncCreator/skncCreator` sin modificar el legacy.
- El backlog comercial congelado continuó intacto.
- Hallazgos estructurales:
  - el vertical corre en `ASP.NET MVC 5` sobre `.NET Framework 4.6.1`
  - la capa dominante es SQL directo desde controllers/models; no un servicio desacoplado
  - `/OrdenesCompra/Index` es captura de OC
  - `/OrdenesCompra/ReporteOC` mezcla consulta y operación
  - `/OrdenesCompra/Aprobaciones` usa supervisores por departamento en `OrdendeCompraSupervisores`
  - `OrdendeCompraPT` concentra detalle y cabecera repetida por folio
  - la OC nace `0` o `6` según si el departamento exige aprobación
  - la aprobación positiva cambia la OC a `6`, pero no entra inventario
  - la recepción posterior vive en `RecepcionGController` y es el punto que actualiza existencias reales
  - el flujo soporta recepción parcial y sobrerecepción
  - no quedó confirmado un flujo formal de rechazo de OC con motivo dentro del motor auditado
- Estado local observado:
  - `http://localhost:8080` respondió `200 OK`
  - proceso en escucha observado: `mono-sgen`
  - PID observado: `31350`
- Artefactos documentales generados:
  - `docs/compras/legacy-sknc/01_ARQUITECTURA_SKNC_OC.md`
  - `docs/compras/legacy-sknc/02_ORDENES_COMPRA_INDEX.md`
  - `docs/compras/legacy-sknc/03_REPORTE_OC.md`
  - `docs/compras/legacy-sknc/04_APROBACIONES_OC.md`
  - `docs/compras/legacy-sknc/05_CICLO_ESTADOS_OC.md`
  - `docs/compras/legacy-sknc/06_MODELO_DATOS_OC.md`
  - `docs/compras/legacy-sknc/07_APROBACIONES_REGLAS.md`
  - `docs/compras/legacy-sknc/08_RECEPCION_OC.md`
  - `docs/compras/legacy-sknc/09_INVENTARIO_DESDE_OC.md`
  - `docs/compras/legacy-sknc/10_USUARIOS_PERMISOS_OC.md`
  - `docs/compras/legacy-sknc/11_REGLAS_NEGOCIO_OC.md`
  - `docs/compras/legacy-sknc/12_MAPA_ENDPOINTS_TABLAS.md`
  - `docs/compras/legacy-sknc/13_PROCESO_E2E_OC.md`
  - `docs/compras/legacy-sknc/14_GAP_LEGACY_OC_VS_CHECKAPP.md`
  - `docs/compras/AUDITORIA_INTEGRAL_OC_SKNC_LEGACY_2026-08-18.md`
- Pendiente real:
  - si se necesita evidencia de network autenticada de las tres pantallas, debe hacerse en sesión QA real y sin aprobar/cancelar/recibir registros reales sin autorización expresa
      - desapareció el desfase visual entre prueba, guardado y `F5`
      - SMTP, `Verificada`, `Guardar`, persistencia y password protegido permanecieron intactos
  - microcorrección UX/UI concluida el `2026-08-14`:
    - alcance exacto:
      - claridad del campo `Contraseña` cuando ya existe password guardado
      - corrección definitiva del color del icono del botón `Guardar configuración`
    - ajuste UX de contraseña:
      - cuando existe password guardado, la vista muestra una máscara ficticia `••••••••••••••••`
      - la máscara no proviene del backend, no expone el secreto y no coincide con la longitud real
      - el helper final para usuario quedó como `Tu contraseña ya está guardada. Escribe una nueva solo si deseas cambiarla.`
      - si el usuario no escribe una nueva contraseña, o escribe y luego borra, el flujo conserva la existente
    - ajuste visual del patrón:
      - la regla del icono `#FAFAFA` para botones primarios rojos quedó reforzada en `wwwroot/css/checkapp-theme.css`
      - `Correo saliente` ya no depende de un parche aislado para ese estado visual
    - archivos modificados:
      - `Views/Configuracion/CorreoSaliente.cshtml`
      - `wwwroot/js/Configuracion/CorreoSaliente.js`
      - `wwwroot/css/Configuracion/CorreoSaliente.css`
      - `wwwroot/css/checkapp-theme.css`
    - resultado QA:
  - la pantalla mantuvo `smtp.gmail.com`, puerto `465`, `SSL/TLS`, estado `Verificada` y fecha `14 ago 2026, 3:16 p.m.`
  - el campo de contraseña ahora comunica correctamente que la clave ya existe sin exponerla
  - el botón `Guardar configuración` conserva icono y texto en `#FAFAFA`

## Menú principal > actualización controlada

- Cierre de implementación del `2026-08-15` para ajuste controlado del menú principal sin cambiar seguridad ni negocio.
- Auditoría previa obligatoria registrada en `docs/ui/MENU_CHECKAPP_ACTUALIZACION_CONTROLADA_20260815.md`.
- Hechos confirmados antes de intervenir:
  - `Ventas` era un nodo visual estático sin ruta funcional real
  - no se localizaron rutas MVC equivalentes reutilizables para `Devoluciones`, `Panel de facturación`, `Ajustes PV por tienda` y `Formas de pago`
  - `Roles y Permisos` ya estaba protegido como hija directa de `Ajustes`
  - `Configuración > Correo saliente` ya estaba aprobada y no debía moverse
- Implementación final aplicada:
  - `Ventas`
    - `Nueva Venta`
    - `Devoluciones`
  - `Facturación`
    - `Panel de facturación`
  - `Ajustes`
    - conserva `Usuarios`
    - conserva `Roles y Permisos`
    - conserva `Sucursales`
    - conserva `Razones Sociales`
    - conserva `Regiones`
    - conserva `Operadores`
    - conserva `Configuración -> Correo saliente`
    - agrega `Ajustes PV por tienda`
    - agrega `Formas de pago`
- Alcance técnico:
  - cambios mínimos en `HomeController.BuildMenu`
  - placeholders MVC mínimos en:
    - `/Ventas/Nueva`
    - `/Ventas/Devoluciones`
    - `/Facturacion/Panel`
    - `/Ajustes/AjustesPvPorTienda`
    - `/Ajustes/FormasPago`
  - sincronización `active/here/show` añadida en `wwwroot/js/Utilerias.js`
- Reglas preservadas:
  - no se crean roles ni permisos
  - no se altera la ruta ni posición relativa de `Roles y Permisos`
  - no se altera `/Configuracion/CorreoSaliente`
  - no se toca la lógica de `Inspección en campo`

## Auditoría preimplementación Legacy Ventas / Devoluciones / Ajustes PV / Formas de pago

- El `2026-08-17` quedó abierta la auditoría documental previa a migración de:
  - `/ventas/nueva`
  - `/ventas/devoluciones`
  - `/ajustes/pv/tiendas-ajustes`
  - `/ajustes-pv/formas-pago`
- Fuentes Legacy auditadas en solo lectura:
  - `/Users/denissemendiola/dev/Raramuri.blzr`
  - `/Users/denissemendiola/dev/sazapi`
- Documento base resultante:
  - `docs/qa/AUDITORIA_PREIMPLEMENTACION_LEGACY_VENTAS_DEVOLUCIONES_AJUSTES_PV_FORMAS_PAGO_2026-08-17.md`
- Hechos técnicos confirmados:
  - el frontend Legacy sí tiene mecanismo oficial para consumir `sazapi` local sin hardcodear, mediante `launchSettings` profile `http-local-api`
  - `/ventas/nueva` no puede migrarse correctamente sin homologar antes validación fiscal de cliente, formas de pago y claves SAT
  - `/ventas/devoluciones` no debe migrarse como pantalla aislada porque depende de vigencia por tienda resuelta en backend
  - `/ajustes/pv/tiendas-ajustes` y `/ajustes-pv/formas-pago` son dependencias funcionales reales del POS
- Estado de ejecución local observado:
  - `Raramuri.blzr` levantó en `http://localhost:5022`
  - `sazapi` quedó bloqueado en Development por falta de `Jwt:Key`; no se completó login QA E2E
- Regla operativa para la siguiente iteración:
  - no improvisar secretos
  - cargar solo `user-secrets` autorizados
  - reintentar arranque local y entonces capturar requests reales autenticadas antes de diseñar la implementación CheckApp

## Continuación auditoría runtime Legacy Ventas / PV

- El `2026-08-17` se cerró una continuación de auditoría enfocada únicamente en:
  - runtime
  - network
  - trazabilidad
  - GAP analysis
  - roadmap
- Restricciones respetadas:
  - no se usaron `user-secrets`
  - no se creó `Jwt:Key`
  - no se creó `ConnectionStrings:Central`
  - no se modificó autenticación ni login
- Hechos runtime confirmados:
  - `Raramuri.blzr` sí levanta con perfil `http` en `http://localhost:5022`
  - `GET /login` y `GET /ventas/nueva` respondieron `200` desde el listener local del frontend
  - en modo normal el frontend usa bootstrap contra `http://174.138.180.181:5000` y luego espera resolver `Tenant.Api`
  - `sazapi` local sigue bloqueado por el propio mecanismo oficial del repo:
    - `run-local.sh -> setup-local.sh --check-only`
    - faltantes exactos: `Jwt:Key` y `ConnectionStrings:Central`
- Hechos funcionales nuevos confirmados:
  - `Días para devolver` ya tiene trazabilidad cerrada `TiendasAjustes -> GetDiasParaDevolverAsync -> /ventas/devoluciones/ticket`
  - `Formas de pago` ya tiene trazabilidad cerrada `configuracion/formas-pago -> ValidarFormasPagoFacturaAsync -> bloqueo de facturación en checkout`
  - `/ventas/nueva` construye `VentaPosCobroRequestDto` y desemboca en `POST /ventas/cobrar`
  - `POST /ventas/cobrar` declara persistencia en `detnotas + fma` y descuento de existencias vía `act_exis25`
- Documento fuente ampliado:
  - `docs/qa/AUDITORIA_PREIMPLEMENTACION_LEGACY_VENTAS_DEVOLUCIONES_AJUSTES_PV_FORMAS_PAGO_2026-08-17.md`

## Cierre definitivo auditoría Legacy Ventas / PV

- El `2026-08-17` se cerró definitivamente la auditoría con `Raramuri.blzr` contra WS publicado y `sazapi` solo como referencia de código.
- Restricción ya consolidada:
  - no volver a intentar levantar `sazapi` local
  - no buscar `Jwt:Key`
  - no buscar `ConnectionStrings:Central`
  - no usar `user-secrets`
- Runtime real confirmado:
  - `dotnet run --launch-profile http`
  - listener `http://localhost:5022`
  - PID `71810`
  - `GET /login` -> `200`
  - `GET /ventas/nueva` -> `200`
  - logs: `MODO SAZ API: NORMAL`, `LOGIN-BOOTSTRAP ORIGIN: http://174.138.180.181:5000`, `API EFECTIVA ESPERADA POST-LOGIN: TENANT.API`
- Login real QA confirmado:
  - bootstrap `POST /app/login-bootstrap` -> `200`
  - `Empresa=4993`
  - `EmpleadoTiendaAsignadaId=2`
  - `Tenant.Api=http://153.75.231.11:5082`
  - `Tenant.Database=db_aab1b5_babicora`
  - `Tenant.EmpresaNombre=BABICORA`
  - `MenuAcceso.Acceso=true`
- Network autenticada confirmada en `Tenant.Api`:
  - cliente QA `Daniel X` sí existe
  - `ventas/formas-pago` devuelve `5` formas operativas
  - `ventas/devoluciones/motivos` devuelve `10` motivos
  - `configuracion/tiendas-ajustes/tiendas` devuelve `4` sucursales
  - `configuracion/tiendas-ajustes?tienda=2` devuelve campos `null` válidos como fallback
  - `configuracion/formas-pago?tiendaId=2` devuelve `26` filas para `ALTACIA`
  - `configuracion/formas-pago/catalogos/formas-fiscales` devolvió arreglo vacío en esta sesión
- Implicaciones para futuras iteraciones:
  - separar bootstrap de autenticación y `tenantApi` operativo
  - separar catálogo administrativo de formas de pago y catálogo operativo POS
  - modelar explícitamente configuración vacía/default en `TiendasAjustes`
  - migrar `Nueva venta` al final del bloque por su acoplamiento transaccional y fiscal

## Planeación única de migración Ventas / PV

- El `2026-08-17` quedó cerrada la única iteración de planeación para migrar:
  - `Ajustes PV por tienda`
  - `Formas de pago`
  - `Devoluciones`
  - `Nueva venta`
- Documento rector creado:
  - `docs/ventas/VENTAS_DEVOLUCIONES_AJUSTES_PV_FORMAS_PAGO_PLAN_MIGRACION_2026-08-17.md`
- Orden aprobado técnicamente:
  1. `Ajustes PV por tienda`
  2. `Formas de pago`
  3. `Devoluciones`
  4. `Nueva venta`
- Motivo del orden:
  - `Devoluciones` necesita política por sucursal
  - `Nueva venta` necesita configuración operativa/fiscal de formas de pago
  - `Nueva venta` es la frontera más compleja del bloque
- Decisiones clave propuestas a PO:
  - no migrar todas las opciones Legacy de `Ajustes PV`
  - sí migrar primero:
    - `DiasParaDevolver`
    - `DiasValidezNotaCredito`
    - `DiasValidezValeCambio`
    - `MostrarPrevioCobro`
  - separar `Formas de pago` en maestro, configuración por sucursal y catálogo operativo
  - mantener `FormaFiscal` como regla obligatoria de facturación
  - implementar `Devoluciones` antes de `Nueva venta`

## Blueprint técnico final Ventas / PV

- El `2026-08-17` quedó cerrada la iteración documental final de blueprint previo a implementación.
- Documentos creados:
  - `docs/ventas/10_BLUEPRINT_TECNICO_AJUSTES_PV.md`
  - `docs/ventas/11_BLUEPRINT_TECNICO_FORMAS_PAGO.md`
  - `docs/ventas/12_BLUEPRINT_TECNICO_DEVOLUCIONES.md`
  - `docs/ventas/13_BLUEPRINT_TECNICO_NUEVA_VENTA.md`
  - `docs/ventas/14_MATRIZ_LEGACY_CHECKAPP_TABLAS.md`
  - `docs/ventas/15_MATRIZ_ENDPOINTS_DTO_REGLAS.md`
  - `docs/ventas/16_DEPENDENCIAS_TRANSVERSALES_POS.md`
- Hallazgos documentales finales:
  - `TiendasAjustes` sí tiene estructura SQL confirmada desde código
  - `formaspago` sí concentra maestro/configuración Legacy de pagos
  - `devoluciones/crear` sí genera nota de crédito y escribe en `detdev`
  - `ventas/cobrar` sí persiste ticket/venta y toca múltiples dominios transversales
  - CheckApp sí aporta reutilización real de `Clientes`, `ProductosServicios`, `Sucursales` y `RazonesSociales`
  - CheckApp no tiene todavía equivalentes confirmados de caja POS, venta POS, devoluciones POS ni catálogo SAT de formas de pago

## Auditoría integral ciclo comercial

- El `2026-08-17` quedó cerrada la auditoría integral del ciclo comercial `Cotización -> Pedido -> Venta -> Postventa`, solo documental.
- Documentos creados en `docs/comercial/`:
  - `01_CICLO_COMERCIAL_INTEGRAL_LEGACY.md`
  - `02_USUARIOS_PERFILES_POS.md`
  - `03_ASISTENCIA_OPERACION_POS.md`
  - `04_CAJA_APERTURA_CIERRE.md`
  - `05_COTIZACION_A_PEDIDO.md`
  - `06_PEDIDOS.md`
  - `07_VENTA_DESDE_PEDIDO.md`
  - `08_VENTAS_COBRAR_TRANSACCION.md`
  - `09_INVENTARIO_EXISTEN_NEGATIVOS.md`
  - `10_PRODUCTOS_SERVICIOS_ACTIVOS_FLETES.md`
  - `11_FORMAS_PAGO_CREDITO.md`
  - `12_NOTAS_CREDITO_VALES.md`
  - `13_FACTURACION_EN_VENTA.md`
  - `14_MATRIZ_PROCESOS_TABLAS.md`
  - `15_MATRIZ_PERFILES_RESPONSABILIDADES.md`
  - `16_MAPA_CICLO_COMERCIAL.md`
  - `17_GAP_CHECKAPP_COMERCIAL.md`
  - `18_RECOMENDACION_ARQUITECTURA_CHECKAPP.md`
- Hallazgos integrales nuevos:
  - `Pedido` sí existe como entidad real en Legacy
  - `POST /cotizaciones/{id}/convertir-pedido` sí existe y exige cotización `AUTORIZADA`
  - la conversión sí escribe `pedidos_clientes*` y sincroniza `orders/detorder`
  - `POST /ventas/cobrar` sí consume pedidos y los marca `SURTIDO`
  - `logdia` sí gobierna asistencia y elegibilidad de vendedor
  - `CajaId` sí cruza cotización, pedido, venta, devolución y corte
  - `notascre` y `vales` sí son documentos reutilizables como pago
  - CheckApp sí reutiliza `Cotizaciones`, `Clientes`, `ProductosServicios`, `Sucursales`, `RazonesSociales`, `Operadores` y `Correo saliente`
  - CheckApp no tiene todavía `Pedido`, `Venta POS`, `Caja POS`, `Asistencia POS` ni checkout comercial real

## Cierre final de gaps comerciales

- El `2026-08-17` quedó cerrado el bloque final de gaps previo al plan de trabajo definitivo, sin implementación.
- Documentos nuevos creados en `docs/comercial/`:
  - `19_DECISIONES_PO_CICLO_COMERCIAL.md`
  - `20_CIERRE_GAPS_PRE_PLAN.md`
- Gaps finales resueltos con evidencia:
  - pedido parcial Legacy: `NO CONFIRMADO`
  - múltiples ventas sobre mismo pedido: `NO CONFIRMADO`
  - regla observable actual: pedido referenciado termina como `SURTIDO`
  - caja formal de apertura/cierre obligatoria para vender: `NO CONFIRMADA`
  - vendedor y cajero son identidades separadas en runtime actual
  - asistencia sí bloquea elegibilidad del vendedor
  - flete se comporta como cargo financiero, no como partida inventariable confirmada
  - activos no quedaron confirmados como partida POS Legacy
- Decisiones PO abiertas para Denisse:
  - venta libre vs venta obligatoria desde pedido
  - surtido total vs pedido parcial real
  - caja contextual vs caja con sesión formal
  - separación vendedor/cajero
  - modelo de perfil POS por capacidades
  - alcance de bloqueos por asistencia
  - semántica comercial de flete
  - papel comercial de activos
  - modelo unificado o separado de `NC/VALE`
- Restricción vigente:
  - queda prohibido implementar comercial en CheckApp hasta cerrar decisiones PO y construir después el plan definitivo.

## Auditoría destino CheckApp ciclo comercial

- El `2026-08-18` quedó cerrada la auditoría profunda del sistema destino CheckApp para ciclo comercial, solo documental.
- Documento nuevo creado:
  - `docs/comercial/21_AUDITORIA_CHECKAPP_DESTINO_CICLO_COMERCIAL.md`
- Hallazgos obligatorios nuevos:
  - `ProductosServicios` sí existe como módulo real reusable con inventario base propio
  - `ProductosServiciosExistencias` y `ProductosServiciosMovimientosInventario` sí son parte viva del backend actual
  - `Cotizaciones` sí existe ya como vertical funcional en CheckApp con MVC + API + tablas propias
  - la premisa vieja de `Cotizaciones` como placeholder total queda superada por el código vigente auditado el `2026-08-18`
  - `Cotización` sí admite productos y servicios juntos y no afecta inventario
  - la existencia mostrada hoy en cotización es solo `ExistenciaActual`; no existen todavía `ComprometidoPedido` ni `Disponible`
  - no existe aún `Pedido`, `Venta`, `Caja POS` ni `Asistencia POS` operativas en CheckApp
  - `Ventas/Nueva` y `Ventas/Devoluciones` continúan como placeholders visuales sin backend comercial
  - tampoco existen todavía `Fecha Instalación`, `Observaciones para instalador`, `Flete` ni asignación de `Operador instalador` en la cotización actual
- Regla de continuidad:
  - cualquier planeación posterior del comercial CheckApp debe partir de `docs/comercial/21_AUDITORIA_CHECKAPP_DESTINO_CICLO_COMERCIAL.md` y no volver a tratar `Cotizaciones` ni `ProductosServicios` como si fueran gaps vacíos.

## Corrección y cierre de auditoría destino CheckApp

- El `2026-08-18` quedó cerrada la corrección documental de la auditoría destino CheckApp para ciclo comercial, sin implementación y por instrucción directa del Product Owner.
- Alcance obligatorio respetado:
  - completar solo los bloques omitidos;
  - no reabrir auditoría base de `ProductosServicios`, inventario físico propio, estructura básica de `Cotizaciones` ni gaps generales `Pedido` / `Venta`.
- Documentos nuevos creados en `docs/comercial/checkapp/`:
  - `01_AUDITORIA_CHECKAPP_DOMINIOS_ACTUALES.md`
  - `02_PRODUCTOSSERVICIOS_INVENTARIO.md`
  - `03_OC_RECEPCION_EXISTENCIAS.md`
  - `04_COTIZACIONES_ESTADO_ACTUAL.md`
  - `05_PRODUCTO_NO_CATALOGADO.md`
  - `06_FECHA_INSTALACION_SERVICIOS.md`
  - `07_SERVICIOS_OPERADORES.md`
  - `08_USUARIOS_CAPACIDADES_ASISTENCIA.md`
  - `09_FORMAS_PAGO_DOCUMENTOS.md`
  - `10_PEDIDO_MODELO_OBJETIVO.md`
  - `11_COMPROMISO_INVENTARIO.md`
  - `12_VENTA_DESDE_PEDIDO.md`
  - `13_SURTIMIENTO_PARCIAL.md`
  - `14_FLETE_ACTIVOS_FISCAL.md`
  - `15_MAPA_DATOS_COMERCIAL_CHECKAPP.md`
  - `16_GAP_FINAL_CHECKAPP_COMERCIAL.md`
  - `17_PROPUESTA_FUNCIONAL_COMERCIAL.md`
- Hallazgos de cierre nuevos:
  - `OrdenesCompra` existe como vertical activo pero sin recepción integrada a inventario
  - no se localizaron tablas ni endpoints de recepción sobre OC; la trazabilidad `OC -> Recepción -> Movimiento -> Existencia` queda como `GAP REAL`
  - recomendación arquitectónica respaldada por código actual: inventario físico por empresa + compromiso comercial por sucursal
  - `CotizacionesPartidas` requiere producto catalogado; el concepto pendiente de catálogo es una adaptación futura, no un comportamiento vigente
  - `FechaInstalacion` y `ObservacionesInstalador` deben modelarse por partida de servicio, con opción global solo como referencia comercial
  - `Operadores` es reutilizable para ejecución, pero no existe hoy asignación operativa comercial a servicio / pedido
  - no existe módulo general reusable de asistencia comercial; solo contexto operativo parcial en checklist
  - `Formas de pago`, `Facturación`, `NC` y `Vale` siguen faltando en destino
  - `Clientes` y `RazonesSociales` sí cubren fiscal básico reusable; faltan catálogos y contratos SAT comerciales completos
  - `Activos` debe entrar como contexto o evidencia del servicio, no como producto comercial por defecto
- Restricción vigente:
  - sigue prohibido pasar a plan de implementación o tocar código funcional comercial hasta revisión final de Denisse.

## Auditoría CheckApp actual de Órdenes de Compra

- El `2026-08-19` quedó cerrada la auditoría integral solo documental del módulo actual de `OrdenesCompra` y su `Reporte` en CheckApp, usando la auditoría legacy SKNC del `2026-08-18` solo como fuente comparativa.
- Documentos nuevos creados en `docs/compras/`:
  - `AUDITORIA_INTEGRAL_OC_CHECKAPP_ACTUAL_2026-08-19.md`
  - `checkapp-actual/01_ARQUITECTURA_CHECKAPP_OC.md`
  - `checkapp-actual/02_PANTALLA_ACTUAL_OC.md`
  - `checkapp-actual/03_REPORTE_OC_ACTUAL.md`
  - `checkapp-actual/04_MODELO_DATOS_OC_ACTUAL.md`
  - `checkapp-actual/05_COMPARATIVO_CHECKAPP_VS_SKNC.md`
- Hallazgos obligatorios nuevos:
  - CheckApp actual sí tiene módulo real de OC con wizard, reporte, persistencia normalizada, folio seguro por empresa, exportación PDF/Excel y validación backend
  - los estados confirmados actuales son `Borrador`, `Generada` y `Cancelada`
  - `GenerarOrdenCompra` solo formaliza documentalmente la OC; no ejecuta recepción ni inventario
  - no se localizaron aprobación formal, recepción, recepción parcial, pendientes por recibir, seriales ni movimiento automático a `ProductosServiciosExistencias` o `ProductosServiciosMovimientosInventario`
  - la cadena `OC -> Recepción -> Movimiento -> Existencia` sigue siendo un `GAP REAL` del destino actual
  - `Fecha minima` y `Fecha maxima` aparecen en la UI de captura, pero no se localizaron en request, tabla ni persistencia del backend auditado
  - CheckApp actual supera a SKNC en arquitectura técnica y modelo de datos de captura, pero SKNC sigue cubriendo mejor la vida posterior `Generada -> Recepción -> Inventario`
- Restricción vigente:
  - queda prohibido interpretar esta auditoría como autorización de implementación; el backlog comercial continúa congelado y la evolución posterior debe respetar la arquitectura actual de CheckApp.

## Actualización Productos y Servicios 2026-08-19

- El `2026-08-19` se amplió `ProductosServicios` con implementación real sobre UI, MVC proxy, API y SQL de soporte, manteniendo fuera de alcance los demás dominios comerciales y de seguridad.
- La ficha de alta / edición ahora contempla:
  - `Estatus` operativo respaldado por `Activo`
  - `Colección` multitenant con alta rápida
  - `PrecioComparacion`
  - `PrecioUnitarioMonto`, `PrecioUnitarioBaseCantidad` y `PrecioUnitarioUnidad`
  - bloque SAT: `ObjetoImpuesto`, `ClaveProductoSat`, `ClaveUnidadSat`
  - `EsProductoFisico`, `UsaNumeroSerie`, peso y dimensiones
  - `Paquete` multitenant con alta rápida
  - `Atributos` y `Variantes` normalizadas
  - `Multimedia` con patrón de `Activos`
- Persistencia nueva o ampliada:
  - columnas nuevas en `ProductosServicios` para precios extendidos, SAT, logística, serialización, colección y paquete
  - tablas nuevas para colecciones, paquetes, atributos, valores, atributos por producto, variantes y multimedia
- Regla de continuidad:
  - cualquier cambio posterior de este módulo debe partir del documento `docs/productos-servicios/PRODUCTOS_SERVICIOS_AMPLIACION_20260819.md` y preservar la separación entre producto físico, inventario, variantes y multimedia temporal/final.

## QA Productos y Servicios 2026-08-20

- El `2026-08-20` se ejecutó QA funcional ampliada en navegador real autenticado sobre `ProductosServicios/Index` con la sesión QA de `denisse@checkapp.com.mx` y empresa visible `UMBRELLA`.
- Validaciones confirmadas antes del bloqueo:
  - listeners activos: `5200 -> PID 41621`, `5127 -> PID 41626`
  - `GET /ProductosServicios/ObtenerCombosProductosServicios` siguió cargando bootstrap útil
  - el grid siguió mostrando `17 registros`, sin error visual general de carga
  - el tenant visible del módulo siguió siendo `UMBRELLA`
- Bloqueo funcional reproducible:
  - al usar alta rápida de colección desde el formulario web de `ProductosServicios`, la UI acepta captura, cierra modal y muestra mensaje de éxito
  - reproducción validada con `QA-COL-20260820-WEB2 / Colección QA Web 2`
  - resultado real: no queda seleccionada y no existe fila en `dbo.ProductosServiciosColecciones`
  - el mismo alta directo al API firmado sí funcionó y persistió `QA-COL-20260820-DIRECT2`, que luego sí apareció en el combo al recargar la pantalla
- Lectura práctica:
  - el SQL ya no es el bloqueo
  - el bloqueo se movió al flujo web/proxy de alta rápida de catálogos
  - el falso positivo de éxito nace al menos en `ProductosServicios.js`, porque `saveCollection()` comunica éxito aunque el item creado no exista en combos ni en base
- Restricción respetada:
  - no se tocó código en esta corrida QA porque el defecto quedó reproducido pero no suficientemente aislado todavía para un parche mínimo seguro dentro de la misma vuelta.
- Continuación QA del `2026-08-20`:
  - regla permanente ratificada: el mensaje `Se inició sesión en otro dispositivo con su usuario` es comportamiento conocido del proyecto; la acción correcta es reingresar y continuar QA, sin volver a tratarlo como bloqueo ni pedir credenciales al Product Owner
  - altas rápidas certificadas con evidencia de UI, MVC, API y SQL:
    - colección `QA-COL-RUNTIME-20260819 / Colección QA Runtime`
    - paquete `Paquete QA Runtime 20260819`
    - atributos `Talla QA Runtime` y `Color QA Runtime`
  - microcorrección frontend aplicada:
    - `saveCollection`, `savePackage` y `saveAttributeCatalog` ya preservan selecciones del modal al refrescar combos
    - validación posterior: colección y paquete permanecen seleccionados después de un alta rápida adicional de atributo
  - bloqueo de guardado completo identificado y corregido en API:
    - `GuardarProductoServicio` devolvía `500`
    - causa raíz: consulta de multimedia sin `SqlTransaction` activa dentro de `SynchronizeProductoMultimediaAsync`
    - ajuste aplicado: `ObtenerMultimediaProductoAsync` acepta transacción opcional y la reutiliza cuando el guardado corre dentro de una transacción abierta
  - resultado funcional posterior:
    - `POST /GuardarProductoServicio` volvió a responder `200`
    - producto QA persistido: `QA-PRODUCTO-AMPLIADO-20260819`
    - servicio QA persistido: `QA-SERVICIO-AMPLIADO-20260819`
    - reapertura post-F5 del producto validada con colección, paquete, peso y precios extendidos persistidos
  - pendiente real fuera de esta vuelta:
    - variantes completas
    - multimedia real
    - regresión transversal de módulos congelados
- Continuación QA del `2026-08-21` sobre catálogos y combos:
  - sesión real del PO reutilizada en Chrome sobre `ProductosServicios/Index`
  - doble `Gramo` reproducido y trazado hasta SQL real, no a un bug extra de Select2
  - filas activas encontradas en `ProductosServiciosUnidadesMedida` para `UMBRELLA`:
    - `Codigo=001`, `Nombre=Gramo`, `Abreviatura=g`
    - `Codigo=002`, `Nombre=Gramo`, `Abreviatura=g`
    - ambas sin referencias en `ProductosServicios`
  - conclusión operativa:
    - el combo sí estaba mostrando datos reales duplicados
    - la brecha estaba en reglas de unicidad por nombre, no solo por código
  - corrección aplicada:
    - API bloquea nuevos duplicados por nombre en categoría, marca, colección y unidad
    - frontend desambigüa duplicados históricos en combos con sufijo de código, por ejemplo `Gramo · 001`
  - QA posterior validada en navegador real:
    - mensajes correctos para duplicado por nombre y por código/número
    - alta válida correcta para categoría, marca, colección y unidad
    - `select / clear / reselect` correcto en tipo, categoría, marca, colección, unidad, objeto de impuesto y paquete
  - todavía no certificar como cerrado:
    - SAT producto / SAT unidad requieren QA manual adicional antes de decir `sí`
- Cierre funcional Ticket 05 del `2026-08-24`:
  - no se reabrió auditoría completa; solo se cerraron pendientes autorizados
  - `ProductosServicios`:
    - el quick-add de `Categoría`, `Marca` y `Unidad` quedó homologado al mismo modal/estructura del CRUD
    - se centralizó la lógica compartida en `ProductosServiciosCatalogModalShared.js`
    - `node --check` pasó en los tres JS implicados
  - `Activos`:
    - se confirmó que `ActivosMarcas` y `ActivosProveedores` no tenían duplicados por `(idEmpresa, Codigo)` antes del hardening
    - se ejecutó SQL real para crear:
      - `UX_ActivosMarcas_IdEmpresa_Codigo`
      - `UX_ActivosProveedores_IdEmpresa_Codigo`
    - se borraron únicamente históricos autorizados y sin referencias:
      - `ORD-QA-27`
      - `VIS-QA-27`
  - compilación final:
    - API y MVC compilaron correctamente; permanecen warnings legacy ya existentes de paquetes y nullability
  - dictamen operativo:
    - la automatización web disponible quedó bloqueada por login en `localhost:5200`
    - sin sesión autenticada reutilizable no es honesto marcar cerrada la QA UI final de Ticket 05
- Ticket 06 — actualización alta Productos y Servicios ejecutado el `2026-08-25` (`Tuesday, August 25, 2026`):
  - alcance implementado sin salir de Ticket 06:
    - redistribución de `Información general` en `ProductosServicios/Index`
    - `Estatus` cambió de combo a switch visual `Activo/Inactivo`
    - `Tags` migró a catálogo relacional + relación `ProductoServicio ↔ Tag`, con multiselección, chips y alta inline
    - `Variantes` agregó `Costo` inmediatamente antes de `Precio`
  - backend / SQL ajustados:
    - nuevos DTO/request para `Tags` y `Costo` por variante
    - nuevo endpoint `GuardarTagProductoServicio`
    - persistencia relacional en `dbo.ProductosServiciosTags` y `dbo.ProductosServiciosProductoTags`
    - `productos-servicios-up.sql` quedó idempotente con tablas, índices y columna `ProductosServiciosVariantes.Costo`
  - defecto adicional real encontrado durante la validación del `2026-08-25`:
    - `ObtenerProductosServicios` disparó `SqlException 8649`
    - mensaje: `The query has been canceled because the estimated cost of this query (4645) exceeds the configured threshold of 3000`
    - causa raíz: el listado seguía usando `OUTER APPLY` correlacionados para multimedia, variantes y tags tras la ampliación de Ticket 06
    - corrección mínima aplicada:
      - el listado pasó a `LEFT JOIN` sobre agregados por `idEmpresa + idProductoServicio`
      - después del relanzamiento del API en `http://localhost:5127`, la recarga real de `ProductosServicios/Index` volvió a mostrar encabezados y acciones del grid sin repetir el error en logs del API
  - estado real de QA al `2026-08-25`:
    - `BUILD`:
      - `dotnet build inspectorapi/checklistWs/checklistWs.csproj` correcto con warnings legacy preexistentes
      - `dotnet build inspector/checklist/checklist.csproj` correcto con warnings legacy preexistentes
    - `REAL UI`:
      - sesión real reutilizada en Chrome con empresa visible `UMBRELLA`
      - la pantalla `ProductosServicios/Index` cargó shell, contadores y grid
      - persistió el overlay heredado `Se inició sesión en otro dispositivo con su usuario`
      - el wrapper de automatización no permitió abrir el modal `Nuevo` ni editar detrás del overlay, por lo que la cobertura UI completa de altas/edición/tags/variantes quedó pendiente
    - `REAL HTTP`:
      - el módulo real volvió a consumir el listado después de corregir el costo del query
      - no quedó certificada una corrida completa de guardado autenticado vía navegador automatizado en esta vuelta
    - `REAL SQL`:
      - el esquema de Ticket 06 quedó aplicado previamente en la base compartida
      - en esta vuelta del `2026-08-25` no fue posible reabrir la conexión SQL directa desde shell con `db_a883c3_checklist_admin` porque el servidor devolvió `Login failed`, así que no se infló evidencia SQL adicional
  - dictamen honesto al cierre de esta corrida:
    - Ticket 06 quedó implementado y endurecido técnicamente
    - Ticket 06 todavía no puede marcarse `CERTIFICADO` mientras la QA UI autenticada completa siga bloqueada por la limitación real del overlay/sesión en la automatización disponible
- Ticket 07 — ficha técnica de producto / servicio ejecutado el `2026-08-25` (`Tuesday, August 25, 2026`):
  - alcance implementado:
    - acción `Ficha técnica` en el grid de `ProductosServicios`
    - modal previo de ficha técnica dentro de CheckApp
    - descarga PDF usando el patrón existente de `QuestPDF`, sin introducir un motor nuevo
    - comportamiento dual real para `Producto` y `Servicio`
  - restricciones de diseño y datos que quedaron vigentes:
    - no existe ni debe crearse tabla `FichaTecnica`
    - la ficha consume datos vivos del módulo actual: generales, comerciales, SAT, inventario, atributos, variantes y multimedia según aplique
    - para servicios deben ocultarse secciones no aplicables en modal y PDF, no renderizar placeholders vacíos
  - defectos reales descubiertos en la corrida:
    - el modal no abría porque la referencia `state.fichaModal` podía quedar nula al momento del click
    - el PDF rompía por mal uso de contenedores de `QuestPDF` en la imagen principal y en la tabla de variantes
  - correcciones aplicadas:
    - resolución lazy del modal antes de ejecutar `.show()`
    - normalización de contenedores `IContainer` únicos en las dos composiciones PDF defectuosas
  - evidencia real cerrada:
    - producto QA abierto y renderizado: `Aceite Motor Sintetico` (`001`)
    - servicio QA abierto y renderizado: `Cambio de Aceite` (`002`)
    - PDFs reales descargados:
      - `FichaTecnica_001_Aceite Motor Sintetico.pdf`
      - `FichaTecnica_002_Cambio de Aceite.pdf`
    - render final validado:
      - producto muestra secciones extendidas, incluyendo atributos y variantes
      - servicio se reduce a secciones válidas sin ruido visual ni bloques no aplicables
  - compilación:
    - MVC y API compilaron correctamente con warnings legacy preexistentes

## Ticket 09 - Certificación visual autenticada (2026-09-03)

- Sesión manual autenticada en `UMBRELLA`; sin reinicios, cambios de código ni SQL durante la corrida.
- PASS real en `QA-T03-CERT-20260821`: grid, altas Sixpack/Paquete 10, edición, bajas lógicas, predeterminada única y sincronización de `PrecioPublico`.
- Limpieza final confirmada: `Pieza | 1 PZA | $99.00 | predeterminada`; `Precio unitario` permaneció `$0.00`.
- PASS: el servicio activo `Cambio de Aceite` no muestra Presentaciones de venta y conserva precios.
- Procesos vigentes: frontend PID `39900` en `5200`; API PID `39891` en `5127`.
- No certificados: motor autenticado y sus casos, multitenant cruzado, decimales, bloqueo de unidad, F5, tablet y móvil. No declararlos PASS.
- POS, ventas, inventario E2E y Ticket 08 no se modificaron.


- TICKET 10 — corrección UX por QA del Product Owner, `2026-09-07`:
  - Precios: ayudas por click/tap y ancho de Unidad base igual a la columna real de Categoría en desktop/tablet/móvil.
  - Presentaciones: sin Nombre manual ni columna redundante; cantidad + unidad, equivalencia compacta con sufijo, ayudas y modal compacto. API deriva Nombre legacy del catálogo en alta inicial/individual y edición; sin migraciones.
  - Fórmulas, factores, 53 Sistema, CRUD Unidades, Login/Auth, IVA, Ticket 08, POS e inventario operativo intactos.
  - QA acotada PASS: Sixpack 6 pz/$50, Metro 100 cm readonly, Kilogramo 2.2046 lb readonly; alta/edición sin Nombre, precio predeterminado, responsive 1890/820/390 sin overflow; builds sin errores y sintaxis JS PASS.
  - Limpieza final: 2 productos de trabajo y 55 unidades activas; 0 productos/presentaciones QA adicionales activos. Sixpack temporal dado de baja.
  - Evidencia: `inspector/docs/qa/ux-precios-presentaciones-ticket10-20260907/INFORME_MOKA.md` (67 puntos).
  - Aviso preexistente al reabrir productos con presentaciones («No puedes cambiar la unidad base») documentado fuera de alcance; no se alteró la protección.
  - Estado: listo para segundo QA visual del Product Owner; no declarar Ticket 10 cerrado.


## Instrucción permanente del Product Owner — puertos locales

- Al terminar cualquier trabajo o QA local, liberar siempre los puertos 5200 y 5127 deteniendo los servidores del proyecto y comprobar que no queden listeners. No dejarlos funcionando al entregar, salvo instrucción posterior explícita del Product Owner.


- TICKET 10 — segundo QA del Product Owner, `2026-09-07`:
  - Cinco ayudas coordinadas: una visible; cierre fuera/otra ayuda/Escape/modal/card. Labels explícitos evitan activar ayuda al pulsar selector.
  - Unidad base y venta agrupadas Peso/Volumen/Longitud/Área/Por artículo/Tiempo/Otra, nombre+abreviatura y búsqueda Select2.
  - Causa Paquete: alta rápida perdía TipoUnidad y demás metadata local. Se consulta registro completo y conserva metadata; refresco sin F5 comprobado.
  - OTHER activa admite equivalencia manual con cualquier base según instrucción PO. Ajustados sólo predicados de admisión manual en API; fórmulas/factores/precisión y motor intactos.
  - Labels Cantidad de venta / Cantidad en inventario y ayudas actualizadas. QA PASS: Paquete 6 pz/$50, Metro 100 cm readonly, Kilogramo 2.2046 lb readonly, búsqueda y responsive; builds sin errores.
  - Limpieza: 2 productos activos, 56 unidades activas (incluye Paquete del PO); unidad/producto/presentación temporales dados de baja. 53 Sistema idénticas.
  - Puertos 5200 y 5127 liberados al entregar, por instrucción permanente.
  - Informe completo: `inspector/docs/qa/segundo-qa-po-ticket10-20260907/INFORME_MOKA.md`. Listo para siguiente QA visual; no declarar cerrado.


- TICKET 10 — nueva regla aprobada Precio público / presentación base, `2026-09-07`:
  - Esta instrucción posterior del PO REEMPLAZA la regla anterior de sincronización desde una presentación predeterminada elegida: PrecioPublico es el precio de UNA unidad base.
  - Base automática única 1 unidad de venta base → 1 unidad inventario; PrecioPublico la actualiza. Adicionales con precios independientes nunca sobrescriben PrecioPublico.
  - Sin elección Predeterminada en UI. Campo legacy conservado/derivado sólo para base; no hay consumidores POS actuales. No inventar una función futura ni reactivar sincronización desde paquetes.
  - Caso del PO era borrador Nuevo sin id/nombre/código/categoría, no persistido. Se documentó antes y se guardó con identidad de prueba comunicada: QA-T10-PRECIO-BASE, Producto QA T10 Precio base, Alimentos, id 4ffbb00e-d4b3-4199-981d-5714a707b516. Conservar para continuar QA.
  - Final: Pieza1/1 $100, Paquete6 $250, Paquete12 $480; costo80, comparación120, ganancia20, margen20%. Guardar/F5/reapertura PASS; cambio público110 sólo cambia base; paquetes260/500 no cambian público; importes restaurados.
  - API bloquea alta duplicada/edición directa/baja de base. Edición de borrador conserva id. Sin migraciones/SQL estructural ni cambios en unidad base, conversiones, IVA, Ticket08, POS, inventario o Auth.
  - Builds sin errores; sintaxis/diff PASS. Puertos5200/5127 libres al entregar.
  - Informe45: inspector/docs/qa/precio-base-ticket10-20260907/INFORME_MOKA.md. Aviso preexistente de unidad base al cargar producto documentado fuera de alcance. No declarar ticket cerrado.


- TICKET 10 — validaciones y ficha técnica, 2026-09-08:
  - Orden general Por artículo/Peso/Volumen/Longitud/Área/Tiempo/Otra; unidad base excluida de venta adicional. API rechaza repetición y duplicados activos por cantidad/unidad/equivalencia a 4 decimales, también alta inicial/edición, sin precio en llave.
  - Ficha/PDF añaden ganancia/margen y presentaciones activas para Producto; Servicio conserva sólo valores aplicables. Motor, factores, catálogo, IVA y Ticket08 sin cambios.
  - API y PDF real verificados; QA visual/F5/responsive pendientes porque Chrome no tiene sesión. No declarar cerrado/aprobado.
  - Instrucción posterior explícita de esta entrega: dejar 5200/5127 activos para QA manual.
  - Nueva limpieza autorizada sustituye conservar fixture anterior: QA-T10-PRECIO-BASE y sus presentaciones archivados. Final 2 registros de trabajo, 53 Sistema + 3 personalizadas; Paquete activo. Datos de trabajo idénticos.
  - Informe: inspector/docs/qa/validaciones-ficha-ticket10-20260908/INFORME_MOKA.md.
- TICKET 11 implementado el 2026-09-10 dentro de alcance: ProductosServicios MVC obtiene tenant solo de sesion/claims, elimina fallback de `idEmpresa`/`empresa` desde query y filtra campos tenant manipulables en multipart. El proxy HMAC se conserva como integridad MVC/API; la API valida despues contra Firebase `Conexiones/{EmpresaKey}` antes de abrir SQL.
- QA T11 frontend/MVC: `dotnet build inspector/checklist/checklist.csproj` PASS con warnings legacy. No se modifico UI, Ticket 10, Auth general, Login, permisos, roles, datos, schema, Hosting ni Firebase.
- Documento de entrega: `docs/database/TICKET11_RESOLUCION_TENANT_BASE_FIREBASE_20260910.md`. Estado: listo para QA manual del Product Owner, sin cierre administrativo.

- TICKET 12 implementado el 2026-09-10 sin cambios funcionales en frontend/MVC: DatabaseIdentity y agrupación viven en API. ProductosServicios UI, CRUD, precios, inventario, atributos, variantes, presentaciones, ficha técnica, PDF, Login/Auth, sesión, roles, permisos, Firebase y Hosting quedan intactos.
- Regla arquitectónica vigente: una base física puede contener N tenants; schema futuro por DatabaseIdentity+Scope; datos aislados por idEmpresa; DDL futuro una vez por base/scope, no por tenant. T13+ pendiente y no implementado.
- QA T12 frontend: build MVC requerido para regresión de compilación; no se levantó entorno visual salvo necesidad. Mantener instrucción permanente de liberar 5200/5127 al entregar.

- TICKET 13 implementado el 2026-09-10 sin cambios funcionales en frontend/MVC: el clasificador por `DatabaseIdentity + Scope` vive en API. ProductosServicios UI, CRUD, precios, inventario, atributos, variantes, presentaciones, multimedia, ficha técnica, PDF, Login/Auth, sesión, roles, permisos, Firebase y Hosting quedan intactos.
- Estado real QA read-only empresa 163 para scope `ProductosServicios`: `Unknown` por `VERSION_EVIDENCE_MISSING` con 20/20 tablas; no se inventa `Current` hasta T14/T15. Build MVC PASS con warnings legacy.
- Regresión consola: GET sin sesión a `/ProductosServicios/Index` redirige a Login con HTTP 200; listado/ficha autenticados quedan para QA manual del Product Owner. Mantener instrucción de no detener procesos 5200/5127 preexistentes del PO.

- TICKET 14 implementado el 2026-09-10 sin cambios funcionales en frontend/MVC: control de versión/trazabilidad vive en API y base física. ProductosServicios UI, CRUD, precios, inventario, atributos, variantes, presentaciones, multimedia, ficha técnica, PDF, Login/Auth, sesión, roles, permisos, Firebase y Hosting quedan intactos.
- QA real 163 creó/verificó sólo `CheckAppSchemaState`, `CheckAppSchemaHistory` y `CheckAppSchemaAttempts`; no se insertó versión ficticia ni datos de negocio. T13 posterior sigue `Unknown/VERSION_EVIDENCE_MISSING` con 20/20 tablas hasta adopción futura T15/T18.
- Build MVC PASS con warnings legacy; GET sin sesión a `/ProductosServicios/Index` redirige a Login con HTTP 200. Listado/ficha autenticados quedan para QA manual del Product Owner. Respetar procesos preexistentes 5200/5127.
