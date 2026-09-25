# Indice de Trazabilidad de Tickets

## Fuentes generales auditadas

- `inspector/AGENTS.md`
- `inspector/CLAUDE.md`
- `inspectorapi/AGENTS.md`
- `inspectorapi/CLAUDE.md`
- `inspector/docs/database/`
- `inspector/docs/pattern/`
- `inspector/docs/compras/`
- `inspector/docs/ordenes-compra/`
- `inspector/checklist/docs/`

## BL-01

| Ticket | Documentos | Archivos / evidencia tecnica |
| --- | --- | --- |
| T11 | `inspector/docs/database/TICKET11_RESOLUCION_TENANT_BASE_FIREBASE_20260910.md` | `inspectorapi/checklistWs/Services/Tenant/*`; `ProductosServiciosController` |
| T12 | `inspector/docs/database/TICKET12_DATABASEIDENTITY_AGRUPACION_BASES_20260910.md` | `DatabaseIdentityResolver`, `DatabaseGroupingService` |
| T13 | `inspector/docs/database/TICKET13_CLASIFICADOR_ESTADO_BASE_20260910.md` | `DatabaseStateClassifier`, `ProductScopeInventory`, `SqlDatabaseSchemaProbe` |
| T14 | `inspector/docs/database/TICKET14_CONTROL_VERSION_TRAZABILIDAD_20260910.md` | `SchemaVersionRepository`, control tables |
| T15 | `inspector/docs/database/TICKET15_CONTRATO_VERSIONADO_PRODUCTOSSERVICIOS_20260910.md`; `inspector/docs/database/TICKET24_SCHEMA_V2_DESCRIPCIONES_HTML_NVARCHAR_MAX_20260916.md` | `SchemaContractModels.cs`, `ProductosServiciosSchemaContractProvider.cs` |
| T16 | `inspector/docs/database/TICKET16_BOOTSTRAP_BASE_NUEVA_PRODUCTOSSERVICIOS_20260910.md` | `ProductosServiciosSchemaBootstrapper.cs` |
| T17 | `inspector/docs/database/TICKET17_MOTOR_MIGRACIONES_SECUENCIALES_20260910.md`; `TICKET24_SCHEMA_V2_DESCRIPCIONES_HTML_NVARCHAR_MAX_20260916.md` | `SchemaMigrationRunner`, `SchemaMigrationSqlExecutor` |
| T18 | `inspector/docs/database/TICKET18_VALIDADOR_FISICO_DRIFT_20260911.md` | `SchemaDriftValidator`, physical snapshot reader |
| T19 | `inspector/docs/database/TICKET19_LOCKING_TRANSACCIONES_IDEMPOTENCIA_20260914.md` | `SqlSchemaOperationLock`, lock adapters |
| T20 | `inspector/docs/database/TICKET20_GATE_COMPATIBILIDAD_PRODUCTOSSERVICIOS_20260914.md` | `ProductosServiciosCompatibilityGate` |
| T21 | `inspector/docs/database/TICKET21_INTEGRIDAD_MULTITENANT_IDEMPRESA_20260914.md` | `ProductosServiciosController`, tests tenant isolation |
| T22 | `inspector/docs/database/TICKET22_BOOTSTRAP_EMPRESARIAL_SEPARADO_SCHEMA_20260914.md`; `inspector/docs/database/t22-qa/README.md`; `inspector/docs/database/t22-qa/RESULTADO_SQL_REAL.json` | `ProductosServiciosCompanyBootstrapper` |
| T23 | `inspector/docs/database/TICKET23_SEGURIDAD_CONTEXTO_MULTITENANT_20260914.md`; `inspector/docs/database/t23-qa/README.md`; `inspector/docs/database/t23-qa/RESULTADO_SQL_REAL.json` | `ProductosServiciosAuthorizationService` |
| T24 | `inspector/docs/database/TICKET24_QA_INTEGRAL_MULTITENANT_PRODUCTOSSERVICIOS_20260914.md`; `inspector/docs/database/POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md` | Tests/builds/secret scan documentados |
| T25 | `inspector/docs/database/POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`; `inspectorapi/AGENTS.md` | No iniciado |

## BL-02

| Ticket | Documentos | Archivos / evidencia tecnica |
| --- | --- | --- |
| HC-001 | `POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`; `REGRESION_MENU_SUCURSALES_RAZONES_REGIONES_20260917.md`; `APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md` | `HomeController`, menu MVC, utilerias de permisos |
| HC-002 | `POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`; `APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md`; `inspectorapi/AGENTS.md` | `RolesPermisos`, `ProductosServiciosAuthorizationService` |
| HC-003 | `APLICACION_PATRON_CHECKAPP_PROVEEDORES_20260917.md`; `MOKA_PROVEEDORES_CIERRE_100_PATRON_CHECKAPP_20260917.md`; `MOKA_PROVEEDORES_LEGACY_PATRON_CHECKAPP_20260917.md`; `QA_UI_UX_PROVEEDORES_SUCURSALES_RAZONES_REGIONES_20260917.md` | `Activos/Proveedores` MVC/API, scope Proveedores |
| HC-004 | `APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md`; `TICKET_SCOPE_SUCURSALES_V1_CERTIFICACION_CHECKAPPERP_20260917.md`; `REGRESION_MENU_SUCURSALES_RAZONES_REGIONES_20260917.md` | `Sucursales` MVC/API |
| HC-005 | `APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md`; `TICKET_SCOPE_SUCURSALES_V1_CERTIFICACION_CHECKAPPERP_20260917.md`; `QA_UI_UX_PROVEEDORES_SUCURSALES_RAZONES_REGIONES_20260917.md` | `RazonesSociales` MVC/API |
| HC-006 | `APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md`; `TICKET_SCOPE_SUCURSALES_V1_CERTIFICACION_CHECKAPPERP_20260917.md`; `QA_UI_UX_PROVEEDORES_SUCURSALES_RAZONES_REGIONES_20260917.md` | `Regiones` MVC/API |

## BL-03

| Ticket | Documentos | Dependencias demostradas / pendientes |
| --- | --- | --- |
| VO-001 | `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_CHECKAPP_ACTUAL_2026-08-19.md`; `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_SKNC_LEGACY_2026-08-18.md`; `inspector/docs/compras/BACKLOG_MAESTRO_PROVEEDURIA_ORDENES_COMPRA.md`; `inspector/docs/ordenes-compra/ORDENES_COMPRA_BACKLOG_FINAL.md` | Depende de Proveedores/Proveeduria, ProductosServicios, Sucursales/Razones; requiere decision de alcance. |
| VO-002 | `inspector/docs/compras/BACKLOG_MAESTRO_PROVEEDURIA_ORDENES_COMPRA.md`; `inspector/docs/compras/checkapp-actual/05_COMPARATIVO_CHECKAPP_VS_SKNC.md`; `inspector/docs/compras/legacy-sknc/08_RECEPCION_OC.md` | Depende de OC generada; posterior impacto inventario pendiente. |
| VO-003 / OC-CUR-01 | `inspector/docs/compras/MOKA_AUDITORIA_TARAHUMARA_CURVAS_OC_CHECKAPP_20260922.md`; `inspector/docs/compras/BL03_FASE_C_OC_CUR_01_CONTRATO_FUNCIONAL_CURVAS_CHECKAPP_20260923.md` | Curvas reabierto por decision PO. OC-CUR-01 cerrado como contrato funcional PM/PO; redondeo PresentacionCompra resuelto el 2026-09-23. |
| VO-003B / OC-CUR-02 | `inspector/docs/compras/BL03_FASE_C_OC_CUR_02_SCHEMA_VERSIONADO_CURVAS_SIEMBRA_20260923.md` | CERRADO / PASS tecnico SQL real CheckAppErp: Scope Curvas V1, OrdenesCompra V2, State/History/Attempts, drift 0, Gate compatible, fixtures reversibles, cross-tenant, OperationKey y cleanup 0; sin UI y sin OC-CUR-03. |
| VO-004 / OC-CUR-03 | `inspector/docs/compras/BL03_FASE_C_OC_CUR_03_MOTOR_HUECOS_COPETES_SUGERENCIAS_20260923.md` | CERRADO / PASS tecnico SQL real CheckAppErp: motor Huecos implementado read-only con Inventario V1, transito OC/Recepcion, modos, PresentacionCompra y cleanup 0; sin UI final. |
| VO-005 / OC-CUR-03 | `inspector/docs/compras/BL03_FASE_C_OC_CUR_03_MOTOR_HUECOS_COPETES_SUGERENCIAS_20260923.md` | CERRADO / PASS tecnico SQL real CheckAppErp: motor Copetes/Sugerencias implementado read-only con multisucursal aislada, cross-tenant fail closed, snapshot payload no persistido por preview; sin generar OCs hijas. |
| VO-006 / OC-CUR-04 | `inspector/docs/compras/BL03_FASE_D_OC_CUR_04_CATALOGO_CURVAS_PATRON_CHECKAPP_20260923.md` | Implementado tecnico + SQL real PASS: Catalogo de Curvas con permisos `05005000/05005001`, DynamicGrid, CRUD, detalle producto/variante, servicios rechazados, Gate, multitenant y cleanup 0. Bloqueado QA visual autenticada local porque localhost redirige a Login; no declarar LISTO QA PO. |

## Tickets sin evidencia suficiente

- OC-CUR-04: pendiente cierre visual autenticado local/PO; implementacion tecnica y SQL real PASS, pero no `LISTO QA PO`.
- Cierre PO formal de T11-T24: no localizado en la documentacion auditada, salvo referencias a certificacion tecnica/listo para cierre.
- QA visual autenticada final de Proveedores/Sucursales/Razones/Regiones: documentada como incompleta en pruebas temporales por sesion duplicada.

## Decisiones PM/PO requeridas

- Confirmar si T11-T24 se aceptan como `CERRADO` o permanecen `EN QA PO`.
- Confirmar si el cierre tecnico 30/30 de Proveedores equivale a cierre PO o requiere repeticion visual.
- Definir fuente primaria para Ordenes de Compra: backlog maestro de compras vs backlog final de ordenes-compra.
