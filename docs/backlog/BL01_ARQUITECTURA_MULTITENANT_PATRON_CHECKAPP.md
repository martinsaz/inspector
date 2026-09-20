# BL-01 - Arquitectura Multitenant / Patron CheckApp

Objetivo: concentrar la infraestructura transversal reusable de CheckApp y preservar trazabilidad historica T11 a T24 sin renumerar tickets.

Regla de lectura: `PASS`, `IMPLEMENTADO` o `CERTIFICADO` se tratan como evidencia tecnica. Solo se marca `CERRADO` / `100%` cuando hay cierre PO documentado. En T11 a T24 no se localizo cierre PO formal en los documentos auditados, por lo que el avance se reporta como `90%` cuando hay QA tecnico/certificacion, o `REQUIERE_VALIDACION_PM/PO` si el documento no permite aplicar la escala.

## Tickets

### T11 - Resolucion tenant a base SQL desde Firebase

- Backlog: BL-01.
- Objetivo: resolver la conexion SQL server-side desde `Conexiones/{EmpresaKey}` y contexto autorizado para ProductosServicios.
- Problema/necesidad: dejar de operar ProductosServicios con base fija y cerrar fallos por tenant invalido.
- Alcance: resolucion tenant, validacion `empresa`/`idEmpresa`, HMAC MVC/API, `TenantSqlConnectionFactory`, fail-closed.
- Fuera de alcance: versionamiento, bootstrap, migraciones, DDL, catalogo tenant paralelo.
- Dependencias: configuracion Firebase existente y flujo ProductosServicios.
- Criterios de aceptacion: tenant valido resuelve base; mismatch/inexistente falla cerrado; no expone secretos.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET11_RESOLUCION_TENANT_BASE_FIREBASE_20260910.md`; `inspectorapi/AGENTS.md`.
- Bloqueos: cierre PO no localizado.
- Responsable tecnico: API / arquitectura multitenant.
- QA requerido: validacion PO del flujo multitenant.
- Siguiente accion: confirmar cierre PO o mantener en seguimiento.
- Fecha ultima actualizacion: 2026-09-10.

### T12 - DatabaseIdentity + agrupacion de bases fisicas

- Backlog: BL-01.
- Objetivo: identificar de forma canonica una base fisica y agrupar tenants que comparten la misma base.
- Problema/necesidad: permitir versionamiento por `DatabaseIdentity + Scope`, no por empresa aislada.
- Alcance: value object `DatabaseIdentity`, metadata SQL read-only, agrupacion de tenants activos.
- Fuera de alcance: DDL, cache mutable, bootstrap, migraciones.
- Dependencias: T11.
- Criterios de aceptacion: identidad estable, saneada y verificable; agrupacion sin exponer connection string.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET12_DATABASEIDENTITY_AGRUPACION_BASES_20260910.md`.
- Bloqueos: cierre PO no localizado.
- Responsable tecnico: API / tenant.
- QA requerido: revision PO/PM de criterio de agrupacion.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-10.

### T13 - Clasificador de estado de base por DatabaseIdentity + Scope

- Backlog: BL-01.
- Objetivo: clasificar el estado estructural de un scope sin escribir datos ni ejecutar DDL.
- Problema/necesidad: distinguir `Empty`, `Partial`, `Unknown`, `Current`, `Outdated`, `Future` y `Unavailable`.
- Alcance: inventario read-only de tablas del scope ProductosServicios y consumo de evidencia de version.
- Fuera de alcance: reparar, migrar o crear tablas.
- Dependencias: T11, T12.
- Criterios de aceptacion: clasificacion por evidencia, no por excepciones ni inferencias destructivas.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET13_CLASIFICADOR_ESTADO_BASE_20260910.md`; `inspectorapi/AGENTS.md`.
- Bloqueos: cierre PO no localizado.
- Responsable tecnico: API / schema.
- QA requerido: aceptacion PO del comportamiento `Unknown` cuando no hay evidencia formal.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-10.

### T14 - Control de version y trazabilidad

- Backlog: BL-01.
- Objetivo: persistir State, History y Attempts por `DatabaseIdentity + Scope`.
- Problema/necesidad: tener evidencia trazable sin inventar version actual por existencia de tablas.
- Alcance: infraestructura idempotente y repositorio de control.
- Fuera de alcance: contrato definitivo, bootstrap, migraciones, gate CRUD.
- Dependencias: T11, T12, T13.
- Criterios de aceptacion: control idempotente, saneado y separado por scope/base.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET14_CONTROL_VERSION_TRAZABILIDAD_20260910.md`.
- Bloqueos: cierre PO no localizado.
- Responsable tecnico: API / schema control.
- QA requerido: validacion PO de trazabilidad.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-10.

### T15 - Contrato versionado ProductosServicios V1

- Backlog: BL-01.
- Objetivo: definir contrato y manifest de schema ProductosServicios.
- Problema/necesidad: establecer fuente de verdad versionada para validacion, bootstrap y migraciones.
- Alcance: contrato V1 y addendum V2 para descripciones HTML `NVARCHAR(MAX)` aprobado por PO.
- Fuera de alcance: adoptar bases historicas por mera existencia del contrato.
- Dependencias: T13, T14.
- Criterios de aceptacion: hash determinista, contrato no destructivo, diferencias auditables.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET15_CONTRATO_VERSIONADO_PRODUCTOSSERVICIOS_20260910.md`; `inspector/docs/database/TICKET24_SCHEMA_V2_DESCRIPCIONES_HTML_NVARCHAR_MAX_20260916.md`.
- Bloqueos: cierre PO final de BL-01 no localizado.
- Responsable tecnico: API / schema contract.
- QA requerido: revision PO de contrato vigente V2.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-16.

### T16 - Bootstrap autosuficiente de base nueva ProductosServicios

- Backlog: BL-01.
- Objetivo: provisionar ProductosServicios solo cuando T13 clasifica `Empty`.
- Problema/necesidad: permitir alta estructural controlada sin reparar bases no vacias ni inventar estado.
- Alcance: bootstrap V1, transaccion, validacion fisica, T14 Attempts/History/State solo tras PASS.
- Fuera de alcance: migraciones historicas, reparacion de `Partial`, gate funcional.
- Dependencias: T13, T14, T15.
- Criterios de aceptacion: no provisionar `Unknown`; no DDL fuera de `Empty`; idempotencia.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET16_BOOTSTRAP_BASE_NUEVA_PRODUCTOSSERVICIOS_20260910.md`.
- Bloqueos: cierre PO no localizado.
- Responsable tecnico: API / schema bootstrap.
- QA requerido: validacion PO de politica `Empty` solamente.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-10.

### T17 - Motor de migraciones secuenciales ProductosServicios

- Backlog: BL-01.
- Objetivo: ejecutar migraciones secuenciales controladas por contrato, lock, History/Attempts/State y validacion fisica.
- Problema/necesidad: evolucionar schema sin ALTER aislado ni migraciones no trazadas.
- Alcance: motor de migraciones y migracion aprobada V1->V2 de descripciones HTML.
- Fuera de alcance: migraciones sin decision PO o reparaciones automaticas.
- Dependencias: T14, T15, T18, T19.
- Criterios de aceptacion: transaccion, rollback, hash, idempotencia, history inmutable.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET17_MOTOR_MIGRACIONES_SECUENCIALES_20260910.md`; `inspector/docs/database/TICKET24_SCHEMA_V2_DESCRIPCIONES_HTML_NVARCHAR_MAX_20260916.md`.
- Bloqueos: cierre PO no localizado para el conjunto historico.
- Responsable tecnico: API / migraciones.
- QA requerido: cierre PO de migracion V2.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-16.

### T18 - Validador fisico y deteccion de drift

- Backlog: BL-01.
- Objetivo: validar schema fisico contra contrato y detectar drift sin reparar.
- Problema/necesidad: impedir operar sobre schema incompatible sin ocultar divergencias.
- Alcance: snapshot fisico, comparacion, certificacion SQL real con drift reversible.
- Fuera de alcance: reparacion automatica.
- Dependencias: T15, T17.
- Criterios de aceptacion: drift detectado, estructura restaurada, `SchemaOk` final.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET18_VALIDADOR_FISICO_DRIFT_20260911.md`.
- Bloqueos: cierre PO no localizado, aunque el documento indica listo para cierre PO.
- Responsable tecnico: API / schema validation.
- QA requerido: cierre PO.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-14.

### T19 - Locking, transacciones e idempotencia

- Backlog: BL-01.
- Objetivo: serializar operaciones de schema por `DatabaseIdentity + Scope`.
- Problema/necesidad: evitar doble create/migracion y estados inconsistentes por concurrencia.
- Alcance: locks SQL, transaccion, rollback, timeout/cancel/deadlock, idempotencia.
- Fuera de alcance: crear V2 por si mismo o cambiar verticales.
- Dependencias: T16, T17, T18.
- Criterios de aceptacion: lock real SQL, relectura post-lock, cleanup, sin impacto a datos.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET19_LOCKING_TRANSACCIONES_IDEMPOTENCIA_20260914.md`.
- Bloqueos: cierre PO no localizado.
- Responsable tecnico: API / concurrencia.
- QA requerido: cierre PO.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-14.

### T20 - Gate server-side de compatibilidad ProductosServicios

- Backlog: BL-01.
- Objetivo: permitir CRUD solo cuando base/scope son compatibles.
- Problema/necesidad: bloquear estados `Unknown`, drift o incompatibles antes de SQL de negocio.
- Alcance: `IProductosServiciosCompatibilityGate`, respuestas saneadas, bloqueo controlado.
- Fuera de alcance: reparacion, migracion o bootstrap desde el gate.
- Dependencias: T11-T19.
- Criterios de aceptacion: allow solo `COMPATIBLE`; 503 saneado para incompatibles.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET20_GATE_COMPATIBILIDAD_PRODUCTOSSERVICIOS_20260914.md`.
- Bloqueos: cierre PO no localizado.
- Responsable tecnico: API / gate.
- QA requerido: cierre PO.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-16.

### T21 - Integridad multitenant por idEmpresa

- Backlog: BL-01.
- Objetivo: asegurar aislamiento por `idEmpresa` en CRUD ProductosServicios.
- Problema/necesidad: dos empresas en la misma `DatabaseIdentity` no deben leer ni modificar datos entre si.
- Alcance: auditoria/refuerzo de endpoints, autoridad server-side, fixtures SQL reales.
- Fuera de alcance: nuevas migraciones, permisos o cambios de sesion.
- Dependencias: T11, T12, T20.
- Criterios de aceptacion: SELECT/INSERT/UPDATE/bajas/relaciones aisladas.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET21_INTEGRIDAD_MULTITENANT_IDEMPRESA_20260914.md`.
- Bloqueos: cierre PO no localizado.
- Responsable tecnico: API / multitenant.
- QA requerido: cierre PO.
- Siguiente accion: confirmar cierre PO.
- Fecha ultima actualizacion: 2026-09-14.

### T22 - Bootstrap empresarial separado del schema

- Backlog: BL-01.
- Objetivo: separar alta empresarial de bootstrap estructural.
- Problema/necesidad: evitar semillas inventadas y operaciones de datos bajo apariencia de schema.
- Alcance: rama NO-OP aprobada para ProductosServicios, sin semillas obligatorias.
- Fuera de alcance: crear productos demo, Firebase interactivo, inventar seeds.
- Dependencias: T20, T21.
- Criterios de aceptacion: `NO_REQUIRED_COMPANY_SEEDS`, 0 DDL, 0 seeds.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET22_BOOTSTRAP_EMPRESARIAL_SEPARADO_SCHEMA_20260914.md`; `inspector/docs/database/t22-qa/README.md`.
- Bloqueos: el documento dice pendiente QA/cierre PO.
- Responsable tecnico: API / bootstrap empresarial.
- QA requerido: cierre PO.
- Siguiente accion: obtener confirmacion PO.
- Fecha ultima actualizacion: 2026-09-14.

### T23 - Seguridad y contexto multitenant / AuthZ ProductosServicios

- Backlog: BL-01.
- Objetivo: incorporar AuthZ server-side y contexto multitenant antes de SQL de negocio.
- Problema/necesidad: no bastaba con autenticacion o menu; se requeria autorizacion funcional.
- Alcance: permiso Proveeduria/ProductosServicios, servicio AuthZ, fuente real Roles/Permisos, fail-closed.
- Fuera de alcance: inventar codigos o modificar schema de CheckAppErp para Roles/Permisos.
- Dependencias: T11-T22.
- Criterios de aceptacion: NOACCESS/READONLY/WRITE reales, cleanup, backend autoridad final.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET23_SEGURIDAD_CONTEXTO_MULTITENANT_20260914.md`; `inspectorapi/AGENTS.md`.
- Bloqueos: el documento contiene bitacoras contradictorias historicas; la entrada consolidada post-T24 prevalece, pero cierre PO formal no localizado.
- Responsable tecnico: API/MVC AuthZ.
- QA requerido: cierre PO.
- Siguiente accion: validar con PM/PO que se acepta el estado consolidado post-T24.
- Fecha ultima actualizacion: 2026-09-16.

### T24 - QA integral T11-T23 ProductosServicios

- Backlog: BL-01.
- Objetivo: certificar integralmente T11-T23 sin iniciar T25.
- Problema/necesidad: demostrar regresion completa y estado operativo de arquitectura ProductosServicios.
- Alcance: matriz T11-T23, CheckAppErp, Roles/Permisos reales, builds/tests, secret scan.
- Fuera de alcance: T25, QA manual PO, Hosting, Firebase, Conexiones tenant.
- Dependencias: T11-T23.
- Criterios de aceptacion: T11-T23 PASS tecnico, fuente real Roles/Permisos, cleanup, sin T25.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/TICKET24_QA_INTEGRAL_MULTITENANT_PRODUCTOSSERVICIOS_20260914.md`; `inspector/docs/database/POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`.
- Bloqueos: no hay evidencia de cierre PO de T25; T24 queda certificado tecnicamente.
- Responsable tecnico: API/MVC / QA tecnico.
- QA requerido: QA PO posterior no debe confundirse con T24.
- Siguiente accion: mantener T25 congelado hasta autorizacion expresa.
- Fecha ultima actualizacion: 2026-09-16.

### T25 - QA manual Product Owner

- Backlog: BL-01.
- Objetivo: QA manual PO posterior a T24.
- Problema/necesidad: validar manualmente sin mezclarlo con certificacion tecnica T24.
- Alcance: no iniciado.
- Fuera de alcance: cualquier preparacion, bootstrap, Hosting, Firebase, bases QA reservadas, conexiones o verticales.
- Dependencias: autorizacion explicita del Product Owner.
- Criterios de aceptacion: no aplican hasta descongelamiento formal.
- Estado: `FROZEN`.
- Avance: `0%`.
- Evidencia: `inspector/docs/database/POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`; `inspectorapi/AGENTS.md`.
- Bloqueos: congelado por instruccion PO/lider.
- Responsable tecnico: pendiente.
- QA requerido: no iniciar.
- Siguiente accion: esperar autorizacion explicita.
- Fecha ultima actualizacion: 2026-09-16.

## Evoluciones transversales posteriores a T24

| Evolucion | Estado | Evidencia | Impacto actual |
| --- | --- | --- | --- |
| Correcciones de menu y RolesPermisos ProductosServicios | `EN QA PO` | `POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md` | Arbol `05000000`-`05001005`, agrupadores solo Acceso, AuthZ granular. |
| V2 descripciones HTML `NVARCHAR(MAX)` | `EN QA PO` | `TICKET24_SCHEMA_V2_DESCRIPCIONES_HTML_NVARCHAR_MAX_20260916.md` | Migra ProductosServicios a version 2 con T17/T19/T18. |
| Baseline/adopcion historica | `EN QA PO` | `inspectorapi/AGENTS.md`; `POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md` | Corrige `SCHEMA_UNKNOWN` para base historica sin DDL ni reconstruccion. |
| Scope tecnico Sucursales V1 | `EN QA PO` | `TICKET_SCOPE_SUCURSALES_V1_CERTIFICACION_CHECKAPPERP_20260917.md` | Reutiliza patron de contrato, bootstrap, drift, locking, gate y AuthZ en scope pequeno. |

## Historico T11-T24

| Ticket | Nombre | Objetivo | Estado | Resultado | Evidencia | Impacto actual |
| --- | --- | --- | --- | --- | --- | --- |
| T11 | Resolucion tenant a base SQL desde Firebase | Resolver base SQL por tenant autorizado | `EN QA PO` | Implementado con QA tecnica | `TICKET11_RESOLUCION_TENANT_BASE_FIREBASE_20260910.md` | Base de multitenant server-side. |
| T12 | DatabaseIdentity + agrupacion | Identidad canonica de base fisica | `EN QA PO` | Implementado con pruebas | `TICKET12_DATABASEIDENTITY_AGRUPACION_BASES_20260910.md` | Versionamiento por base/scope. |
| T13 | Clasificador de estado | Clasificar scope sin writes | `EN QA PO` | Implementado | `TICKET13_CLASIFICADOR_ESTADO_BASE_20260910.md` | Base para bootstrap/gate. |
| T14 | Control version/trazabilidad | State/History/Attempts | `EN QA PO` | Implementado | `TICKET14_CONTROL_VERSION_TRAZABILIDAD_20260910.md` | Evidencia formal de version. |
| T15 | Contrato versionado | Contrato V1/V2 | `EN QA PO` | Implementado | `TICKET15_CONTRATO_VERSIONADO_PRODUCTOSSERVICIOS_20260910.md` | Fuente de verdad de schema. |
| T16 | Bootstrap base nueva | Provisionar solo `Empty` | `EN QA PO` | Implementado | `TICKET16_BOOTSTRAP_BASE_NUEVA_PRODUCTOSSERVICIOS_20260910.md` | Alta estructural controlada. |
| T17 | Migraciones secuenciales | Evolucion trazada | `EN QA PO` | Implementado, V2 real posterior | `TICKET17_MOTOR_MIGRACIONES_SECUENCIALES_20260910.md` | Camino oficial de migracion. |
| T18 | Validador drift | Detectar drift fisico | `EN QA PO` | Certificado SQL real | `TICKET18_VALIDADOR_FISICO_DRIFT_20260911.md` | Gate puede confiar en `SchemaOk`. |
| T19 | Locking/idempotencia | Serializar operaciones schema | `EN QA PO` | Certificado SQL real | `TICKET19_LOCKING_TRANSACCIONES_IDEMPOTENCIA_20260914.md` | Evita doble DDL/migracion. |
| T20 | Gate compatibilidad | Bloquear incompatibles | `EN QA PO` | Certificado | `TICKET20_GATE_COMPATIBILIDAD_PRODUCTOSSERVICIOS_20260914.md` | Protege CRUD. |
| T21 | idEmpresa multitenant | Aislar datos por empresa | `EN QA PO` | Certificado | `TICKET21_INTEGRIDAD_MULTITENANT_IDEMPRESA_20260914.md` | Seguridad de datos por empresa. |
| T22 | Bootstrap empresarial | Separar seeds de schema | `EN QA PO` | NO-OP aprobado/certificado | `TICKET22_BOOTSTRAP_EMPRESARIAL_SEPARADO_SCHEMA_20260914.md` | Evita datos inventados. |
| T23 | Seguridad/AuthZ | Autorizacion funcional | `EN QA PO` | Certificado en consolidado post-T24 | `TICKET23_SEGURIDAD_CONTEXTO_MULTITENANT_20260914.md` | Backend como autoridad de permisos. |
| T24 | QA integral T11-T23 | Certificacion integral tecnica | `EN QA PO` | Implementado y certificado | `TICKET24_QA_INTEGRAL_MULTITENANT_PRODUCTOSSERVICIOS_20260914.md` | Punto de control antes de T25. |

