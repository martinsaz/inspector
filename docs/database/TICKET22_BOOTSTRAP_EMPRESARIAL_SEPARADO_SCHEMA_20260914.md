# MOKA — Ticket 22: bootstrap empresarial separado del schema

Fecha: 2026-09-14. **IMPLEMENTADO Y CERTIFICADO EN LA RAMA NO-OP APROBADA.** Pendiente únicamente QA/cierre del Product Owner; T23 no implementado.

## Resultado y alcance

ProductosServicios no requiere filas predefinidas al incorporar una empresa: listado y catálogos pueden comenzar vacíos. Categoría y unidad son obligatorias al guardar un artículo, pero las elige/crea el usuario mediante CRUD existente. No hay una identidad contractual que autorice insertar “General”, una marca genérica o una unidad elegida automáticamente. Se implementa el NO-OP explícitamente autorizado por T22; no se confunde ausencia de semillas con que un artículo pueda guardarse sin referencias válidas.

Servicio `IProductosServiciosCompanyBootstrapper` / `ProductosServiciosCompanyBootstrapper`: recibe un descriptor tenant resuelto server-side y scope, verifica T20, devuelve `NO_CHANGES / NO_REQUIRED_COMPANY_SEEDS` con colecciones vacías. Contexto inválido, cancelación, error o incompatibilidad bloquean. No escribe Firebase, datos, State/History/Attempts ni schema. El NO-OP no requiere transacción, rollback de negocio, reserva, flag persistente ni lock; concurrentemente no hay nada que duplicar. No se agrega infraestructura para simular operaciones inexistentes.

## Auditoría del alta e inventario

[LoginController.Registrare](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/LoginController.cs:1377) conserva el flujo general: nueva Conexiones obtiene idEmpresa, copia Hosting y persiste BootstrapIds; genera rol, razón social, zona, sucursal, departamento y puestos. Registraru crea/sincroniza usuario. Gran parte de ese alta legacy usa Servidor MVC, zona usa factory API, usuario SQL usa Conexiones. No se reescribe esa arquitectura en T22 porque sus entidades no son semillas del scope ProductosServicios y Firebase/Hosting/Conexiones/Auth están fuera de modificación.

T11 ya sustituyó el destino del vertical: [TryResolveRequestContextAsync](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs:6808) toma contexto firmado/claims, rechaza discrepancias del cliente, resuelve exactamente Conexiones con T11, aplica T20 y usa TenantSqlConnectionFactory. T12 obtiene identidad física. El diagnóstico de factory fija de la auditoría del 9 de septiembre es antecedente, no descripción actual de PS.

Fuentes de decisión de semillas: `ValidateProductoServicioRequest` exige categoría/unidad; `ValidateCatalogReferencesAsync` comprueba pertenencia; GuardarCategoriaProductoServicio permite alta explícita; GuardarUnidadControladaAsync crea unidades personalizadas OTHER. Frontend ProductosServiciosCatalogos.js permite esa alta. Contrato T15 V1 define estructuras, no registros empresariales. Los scripts históricos de catálogo no son un contrato de semillas para empresas nuevas.

| Candidato | Clase T22 | Ownership real | Decisión |
|---|---|---|---|
| Categorías | A para guardar un artículo; B al incorporar empresa | Empresarial idEmpresa | Se crean explícitamente por negocio. No semilla obligatoria. |
| Unidades de medida | A para guardar un artículo; B al incorporar empresa | Empresarial incluso EsSistema=1 en modelo actual | Crear/seleccionar por CRUD; no elegir unidad por empresa automáticamente. EsSistema no convierte la fila en global. |
| Marcas, colecciones, paquetes | B opcional | Empresarial idEmpresa | Sin semillas. |
| Tags, atributos y valores | B opcional | Empresarial idEmpresa | Sin semillas ficticias. |
| Opciones, variantes, puentes, multimedia | B, dependientes de artículo | Empresarial idEmpresa/producto | Se derivan de operaciones reales, no del alta de empresa. |
| Existencias, movimientos, presentaciones | Dependientes de artículo y reglas vigentes | Empresarial idEmpresa/producto | No inventar inventario cero, precio cero ni presentación sin producto. |
| Productos/servicios | D respecto al bootstrap | Negocio empresarial | Prohibido producto demo. |
| Roles, Usuarios, RazonesSociales, Zonas, Sucursales, Departamentos/Puestos | C plataforma / D fuera del scope PS | Según contrato de plataforma, no globalizar por nombre | Alta general intacta; no duplicar desde T22. |
| Catálogos SAT/globales | C plataforma | Referencias externas globales donde aplique | Reutilizar; no copiar por empresa. No afirmar FK global inexistente en V1. |
| State/History/Attempts y contrato V1 | C infraestructura compartida | DatabaseIdentity + Scope | Sólo lectura indirecta vía T20. No usar como estado empresarial. |
| Catálogo inicial futuro con valores elegidos por negocio | E si se solicita posteriormente | Requiere definición funcional | No es necesario para certificar el NO-OP actual; no inventar. |

No existe conjunto de semillas obligatorias cuyo estado pueda ser “parcial seguro” o “parcial inconsistente”. T22 no interpreta ni repara filas comerciales existentes. La integridad de las operaciones sigue en T21; la incompatibilidad estructural sigue en T20. Los tests de insertar faltantes, referencias nuevas y rollback de múltiples semillas son **N/A en esta rama**, no ejecuciones ficticias PASS. No hay decisión PO bloqueante para el alcance aprobado.

## Integración y contrato

Punto de integración: primer acceso autorizado al scope PS y accesos posteriores, en el helper server-side común del controller, después de resolución y de T20, antes de construir contexto CRUD. Así una empresa nueva con Conexiones ya autorizada queda preparada al operar; no necesita una llamada del navegador a un endpoint bootstrap. No se añadió ruta HTTP ni parámetro editable de autoridad tenant. Empresa no se toma de CompanyBootstrapResult ni del payload.

La llamada independiente al servicio también exige T20. La integración conserva el gate existente del controller y vuelve a verificar dentro del servicio: **dos evaluaciones T20 por solicitud admitida**, sin cache permisiva. Es una sobrecarga de metadata conocida de esta integración conservadora; no se cambian contratos T20/T21 para eliminarla. No afecta los invariantes de cero escrituras ni reemplaza el gate. Cambios de disponibilidad entre verificaciones bloquean la preparación.

Resultado: Status, ReasonCode, CreatedItems, ExistingItems, SkippedItems, ReferenceId, StartedAtUtc, CompletedAtUtc y ExecutedDdl=false. No incluye conexión, token, contraseña ni payload empresarial. Logs: ReferenceId, identidad saneada de T20, scope fijo, idEmpresa autorizado, status, conteos cero y duración. Excepciones propias de T22 no se serializan ni registran con texto sensible.

BASE EMPTY → T22 bloquea; T16 debe preparar schema por su flujo separado y autorizado antes de que T20 permita T22. T22 no llama a T16 ni T17. Partial/Outdated/Future/Unknown/Unavailable/Drift/Preparing/Migrating/Inconclusive/HashMismatch bloquean sin crear datos.

## QA automatizada y regresión

`dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`: **279/279 PASS, 0 fallas, 0 omitidas**. 247 pruebas preexistentes T11–T21 preservadas y 32 casos nuevos T22. No se modificó ninguna prueba preexistente ni los servicios T11–T21.

Build API: PASS, 0 errores, 6 advertencias de dependencias preexistentes. Build frontend: PASS, 0 errores, 9 advertencias de dependencias preexistentes. No se actualizaron paquetes fuera de alcance. `git diff --check` en ambos repositorios: PASS; sí existen dos repositorios Git independientes en este entorno.

Defecto encontrado/corregido durante desarrollo de pruebas T22: el fixture del controller usaba SerialNumber/Sid del MVC en vez de los nombres de claims consumidos por API (idEmpresa/empresa), y tres pruebas devolvían 401. Se corrigió exclusivamente el fixture; Auth/claims productivos no cambiaron. Suite final íntegra PASS.

Regresión HTTP en procesos preexistentes: MVC /ProductosServicios/Index → 302 a Login con ReturnUrl; API listado sin credenciales → 401. PIDs 49371/49365 y puertos 5200/5127 respetados, sin reinicios. Se ejecutó el controller compilado actual contra SQL real mediante fixture servidor autorizado: listado nuevo 200 vacío, categorías C vacías aun con A/B presentes, ficha inexistente 404, empresa cliente contradictoria 403. No se invocó login que escribe Firebase ni se creó cuenta real para fabricar sesión. No se certifica sesión Firebase interactiva ni ficha/PDF poblada: la base QA no contenía productos y T22 prohíbe productos demo. Frontend, Login y exportaciones no cambiaron.

## Certificación SQL controlada

[Resultado completo saneado](t22-qa/RESULTADO_SQL_REAL.json) y [runner reproducible](t22-qa/README.md). Conexión obtenida por mecanismo local de QA previamente usado para CheckAppErp; jamás impresa o persistida en artefactos nuevos. Runner guardado requiere variable de entorno autorizada y no contiene credenciales.

Se verificó DatabaseIdentity antes de cualquier INSERT de fixture y se exigió base CheckAppErp, GUID esperado, T20 COMPATIBLE, V1/hash exacto y T18 sano. No se tocó base histórica. Las empresas C/D se resuelven por ITenantConnectionReader de fixture autorizado y el resolver real T11, sin crear tenants Firebase. No se afirma haber registrado empresas reales en Firebase.

| Evidencia | Resultado |
|---|---|
| DatabaseIdentity compartida | `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA` |
| QA-A / categoría temporal | `57340e54-f51c-4ec2-82b2-02f0c408cf77` / `5a744440-15ea-446b-bb2b-96998ba8b0a8` |
| QA-B / categoría temporal | `11c3110c-0afc-4a55-8185-2e4767bfd0bc` / `d640116c-c317-4cf1-a68e-6c6ab4b7599d` |
| QA-C nueva | `d5fb3c96-deff-4c89-99fc-ec972be17114` |
| QA-D nueva | `99039fa5-53d2-4ffa-9e13-8067c0d5590c` |
| Preexistencia A/B | Dos categorías QA creadas y confirmadas ANTES de invocar T22; no productos demo ni semillas T22 |
| C/D | GUIDs nuevos; ausencia comprobada en las 20 tablas antes de probar |
| Ejecuciones | 10 C secuenciales + 1 D + 2 C/C concurrentes + 2 C/D concurrentes = 15 |
| Primera, segunda y resto | NO_CHANGES / NO_REQUIRED_COMPANY_SEEDS, 0 filas creadas por T22 |
| A/B | Hashes de tablas idénticos antes/después de T22; C no lee sus categorías |
| Estructura | Snapshot físico completo idéntico antes/después; objetos y fechas estructurales iguales |
| Datos/control | SHA-256 por contenido de las 20 tablas + State/History/Attempts idéntico |
| V1/hash | 1 → 1; `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06` intacto |
| Conteos inicial/final | Tablas 20/20; columnas 255/255; índices adicionales 50/50; FK 24/24; CHECK 14/14 |
| T18/T20 final | SchemaOk; drift 0; COMPATIBLE, también tras limpieza |
| DDL T22 / DDL QA | 0 / 0 |
| DML T22 | 0 INSERT, 0 UPDATE, 0 DELETE |
| DML exclusivo fixture | 2 INSERT categorías A/B; 2 DELETE exactos; cero filas preexistentes eliminadas |
| Limpieza | PASS; finally/DisposeAsync por IDs+idEmpresa+código propios; hashes originales restaurados |

Una primera pasada adicional sin fixtures también pasó 15 ejecuciones y snapshots iguales; no reemplaza la evidencia A/B de la pasada certificada. Los bloqueos T20 se prueban con decisiones del gate en fixture automatizado: no se provocó drift real porque T22 no autoriza DDL. No se presenta esa simulación como base física incompatible.

## Correspondencia de las 32 pruebas obligatorias

| # contrato | Requisito | Evidencia / resultado |
|---|---|---|
| 1 | Compatible permite | PASS servicio y SQL real. |
| 2 | T20 BLOCK | PASS 13 estados en fixture y orden controller. |
| 3 | Cliente no manda | PASS 403 antes de resolver. |
| 4 | Servidor usado | PASS descriptor observado y QA C/D. |
| 5 | 0 DDL | PASS sin escritor y snapshots SQL. |
| 6 | State no cambia | PASS digest real. |
| 7 | ManifestHash no cambia | PASS V1/gate/digest. |
| 8 | T18 SchemaOk | PASS SQL final. |
| 9 | Primera crea requeridos | N/A conjunto vacío; primera NO_CHANGES PASS. |
| 10 | Segunda no duplica | PASS automática/real. |
| 11 | Diez ejecuciones | PASS automática/real. |
| 12 | Concurrencia misma empresa | PASS automática/real; 0 creaciones. |
| 13 | Dos empresas misma DB | PASS C/D. |
| 14 | C no modifica A | PASS categoría y digest. |
| 15 | C no modifica B | PASS categoría y digest. |
| 16 | Referencias de semillas same-tenant | N/A no inserciones; T21 regresión PASS. |
| 17 | Cross-tenant | PASS 403 y categorías A/B no visibles. |
| 18 | Global no duplicado | PASS cero escritores/filas T22. |
| 19 | Empresarial idEmpresa | PASS contexto; INSERT T22 N/A. |
| 20 | Parcial seguro completa | N/A no conjunto obligatorio; no se inventan faltantes. |
| 21 | Parcial inconsistente | N/A de semillas; errores/bloqueos producen revisión sin escribir, T21 intacto. |
| 22 | Fallo intermedio rollback | N/A no transacción empresarial; excepción/cancelación cero cambios PASS. |
| 23 | No demo | PASS no productos creados. |
| 24 | No defaults inventados | PASS no seeds. |
| 25 | No Firebase write | PASS sin dependencia; fixture no llama Firebase. |
| 26 | No Hosting write | PASS código intacto. |
| 27 | No Conexiones write | PASS código intacto. |
| 28 | No schema DDL | PASS fuente+snapshot. |
| 29 | T11–T21 | PASS 247 tests previos y hashes de servicios intactos. |
| 30 | No T23 | PASS alcance. |
| 31 | Limpieza sólo QA | PASS IDs propios y digest original. |
| 32 | Secretos ausentes | PASS prueba de logs/error/resultado y revisión. |

## Archivos y pendientes

Nuevos: servicio/resultado/interfaz en API Services/Tenant/ProductosServiciosCompanyBootstrapper.cs; pruebas ProductosServiciosCompanyBootstrapperTests.cs; este informe; runner QA Program.cs, T22Qa.csproj, README.md y RESULTADO_SQL_REAL.json en t22-qa.

Modificados: Program.cs (DI), controller API PS (inyección y llamada posterior a gate), AGENTS.md y CLAUDE.md de ambos repositorios (estado T22). Los cambios preexistentes fueron preservados; sin commit/push. No se modificaron fuentes de schema, contrato V1, Login/Auth, Firebase, Hosting/Conexiones, MVC ni otros verticales. La planeación/auditoría previa se leyeron como contexto y no se reescriben en T22.

No hay bloqueo real ni REQUIERE_DECISION_PO para NO-OP. No se implementan T23/T24/T25; permanecen bajo su propio contrato futuro, sin inventar su contenido. El cierre del ticket corresponde al PO. Si en el futuro se exige un catálogo inicial obligatorio, debe aprobarse su identidad/regla antes de cambiar el NO-OP, y entonces transacciones/locks empresariales/parciales necesitan implementación y nuevas pruebas.

## Entrega #MOKA — 85 puntos

| # | Punto | Resultado |
|---|---|---|
| 1 | T22 implementado: PASS/FAIL | PASS — rama NO-OP aprobada implementada/certificada. |
| 2 | Alcance limitado T22: PASS/FAIL | PASS — sólo T22. |
| 3 | T11–T21 preservados: PASS/FAIL | PASS — 247 pruebas anteriores y fuentes preservadas. |
| 4 | T23+ adelantado: NO | NO. |
| 5 | Firebase modificado: NO | NO. |
| 6 | Hosting modificado: NO | NO. |
| 7 | Conexiones modificado: NO | NO. |
| 8 | Schema PS modificado: NO | NO. |
| 9 | DDL T22: NO | NO. |
| 10 | Flujo alta auditado: PASS/FAIL | PASS; inventario y fuentes arriba. |
| 11 | Punto integración | API helper común después de autorización/resolución/T20, antes del CRUD; sin nuevo endpoint. |
| 12 | Datos requeridos | Ninguna semilla obligatoria al incorporar empresa; categoría/unidad requeridas sólo para guardar artículo. |
| 13 | Opcionales | Catálogos/artículos/relaciones por operación explícita. |
| 14 | Globales | Plataforma y referencias globales reutilizadas; no duplicadas. |
| 15 | Empresariales | Catálogos PS y relaciones mantienen idEmpresa; EsSistema no cambia ownership. |
| 16 | Seeds descartados | General/Default/N/A, marcas genéricas, unidades elegidas, producto demo, precios/inventario/atributos ficticios. |
| 17 | Decisiones PO pendientes | Ninguna para NO-OP aprobado. |
| 18 | Servicio | IProductosServiciosCompanyBootstrapper / ProductosServiciosCompanyBootstrapper. |
| 19 | Resultado | CompanyBootstrapResult; NO_CHANGES o BLOCKED, colecciones vacías, referencia/timestamps, DDL=false. |
| 20 | idEmpresa server-side: PASS/FAIL | PASS. |
| 21 | Cliente impone empresa: NO | NO. |
| 22 | T20 previo: PASS/FAIL | PASS; T20 también exigido por servicio independiente. |
| 23 | Transacción: PASS/FAIL | N/A NO-OP, sin conjunto de escrituras. |
| 24 | Rollback: PASS/FAIL | N/A empresarial; fallos/cancelación dejan cero cambios. |
| 25 | Estrategia concurrencia | Stateless sin escritores; concurrencia SQL C/C y C/D verificada. |
| 26 | Lock estructural por empresa usado: NO | NO. |
| 27 | State schema usado como estado empresa: NO | NO. |
| 28 | Base/fixture | CheckAppErp; fixture de contexto T11 y categorías A/B temporales. |
| 29 | DatabaseIdentity | VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA |
| 30 | QA-A preservada: PASS/FAIL | PASS; digest idéntico durante T22. |
| 31 | QA-B preservada: PASS/FAIL | PASS; digest idéntico durante T22. |
| 32 | QA-C | d5fb3c96-deff-4c89-99fc-ec972be17114 |
| 33 | QA-D | 99039fa5-53d2-4ffa-9e13-8067c0d5590c |
| 34 | Misma DatabaseIdentity: PASS/FAIL | PASS. |
| 35 | T20 inicial | COMPATIBLE. |
| 36 | DDL ejecutado: NO | NO. |
| 37 | Datos C creados | 0. |
| 38 | Datos D creados | 0. |
| 39 | C cruza D: NO | NO. |
| 40 | C modifica A/B: NO | NO. |
| 41 | D modifica A/B: NO | NO. |
| 42 | Global duplicado por empresa: NO | NO. |
| 43 | Empresariales idEmpresa correcto: PASS/FAIL | PASS contexto; INSERT empresarial N/A. |
| 44 | Primera ejecución | NO_CHANGES, cero requeridos. |
| 45 | Segunda | NO_CHANGES. |
| 46 | Diez ejecuciones duplicados: 0 esperado | 0; 10 secuenciales reales y unitarias. |
| 47 | Concurrencia misma empresa: PASS/FAIL | PASS; cero duplicados. |
| 48 | Creaciones efectivas por seed: 1 esperado | 0: no hay semillas requeridas; 1 esperado aplica sólo a rama con semillas. |
| 49 | Parcial seguro completado: PASS/FAIL | N/A conjunto requerido vacío. |
| 50 | Parcial inconsistente bloqueado: PASS/FAIL | N/A semillas; T20/revisión bloquean cuando corresponde, sin reparar negocio. |
| 51 | CurrentVersion inicial/final | 1 / 1. |
| 52 | ManifestHash inicial/final | 4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06 / igual. |
| 53 | Tablas inicial/final | 20 / 20. |
| 54 | Columnas inicial/final | 255 / 255. |
| 55 | Índices inicial/final | 50 / 50 (adicionales a PK). |
| 56 | FK inicial/final | 24 / 24. |
| 57 | CHECK inicial/final | 14 / 14. |
| 58 | T18 final | SchemaOk. |
| 59 | DriftCount final | 0. |
| 60 | T20 final | COMPATIBLE. |
| 61 | Schema alterado por T22: NO | NO. |
| 62 | Datos QA creados | 2 categorías fixture A/B; T22 C/D creó 0. |
| 63 | Datos QA eliminados | 2 categorías exactas propias; IDs arriba. |
| 64 | Datos preexistentes eliminados: NO | NO. |
| 65 | Fixtures QA limpios: PASS/FAIL/N/A | PASS, hashes originales restaurados. |
| 66 | Tests totales | 279, de ellos 32 T22. |
| 67 | Tests PASS | 279. |
| 68 | Tests FAIL | 0. |
| 69 | Build API | PASS; 0 errores. |
| 70 | Build frontend | PASS; 0 errores. |
| 71 | git diff --check | PASS en ambos repositorios. |
| 72 | Login regresión | PASS perímetro 302/401 y fuente intacta; no login interactivo Firebase. |
| 73 | ProductosServicios regresión | PASS listado/catálogos vacíos, ficha ausente404, contexto403 y build; no ficha/PDF poblada porque no hay productos QA. |
| 74 | T21 regresión | PASS 23 pruebas T21 y no lectura de categorías A/B en SQL. |
| 75 | Secretos expuestos: NO | NO. |
| 76 | Puertos respetados: PASS/FAIL/N/A | PASS; PIDs preexistentes intactos. |
| 77 | Documento T22 | /Users/denissemendiola/dev/Inspecciones/inspector/docs/database/TICKET22_BOOTSTRAP_EMPRESARIAL_SEPARADO_SCHEMA_20260914.md |
| 78 | AGENTS/CLAUDE sincronizados: PASS/FAIL | PASS cuatro memorias con estado T22. |
| 79 | Archivos creados | Servicio, tests, informe y cuatro artefactos QA. |
| 80 | Archivos modificados | API Program/controller y cuatro memorias; sin modificar servicios T11–T21. |
| 81 | Defectos encontrados | Fixture unitario usaba claims MVC y obtuvo401; documentación T21 enumera tablas que no coinciden con V1, por lo que QA usa contrato T15 real. |
| 82 | Defectos corregidos | Claims del fixture T22 corregidos; no Auth productivo ni documentos T21 reescritos. |
| 83 | Bloqueos reales | Ninguno para rama NO-OP; límites de regresión explícitos. |
| 84 | Pendientes exclusivamente T23+ | T23/T24/T25 sin iniciar; sujetos a sus contratos. |
| 85 | Dictamen | IMPLEMENTADO Y CERTIFICADO NO-OP; listo para QA/cierre PO. |

## Dictamen final

TICKET 22 IMPLEMENTADO Y CERTIFICADO — PRODUCTOSSERVICIOS NO REQUIERE DATOS INICIALES OBLIGATORIOS POR EMPRESA — BOOTSTRAP EMPRESARIAL ES NO-OP CONTROLADO E IDEMPOTENTE — BASE VIGENTE RECIBE CERO DDL Y CERO SEEDS INVENTADOS — LISTO PARA QA/Cierre DEL PRODUCT OWNER.
