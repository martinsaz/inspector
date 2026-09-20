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
| VO-003 | `inspector/docs/ordenes-compra/ORDENES_COMPRA_BACKLOG_FINAL.md` | Bloqueado: Curvas excluido por PO en OC, pero solicitado como vertical nuevo. |
| VO-004 | `inspector/docs/ordenes-compra/ORDENES_COMPRA_BACKLOG_FINAL.md` | Bloqueado: Hueco excluido por PO en OC, pero solicitado como vertical nuevo. |
| VO-005 | `inspector/docs/ordenes-compra/ORDENES_COMPRA_BACKLOG_FINAL.md` | Bloqueado: Copete excluido por PO en OC, pero solicitado como vertical nuevo. |

## Tickets sin evidencia suficiente

- VO-003 Curvas: falta decision PM/PO para reabrir fuera de OC.
- VO-004 Huecos: falta decision PM/PO para reabrir fuera de OC.
- VO-005 Copetes: falta decision PM/PO para reabrir fuera de OC.
- Cierre PO formal de T11-T24: no localizado en la documentacion auditada, salvo referencias a certificacion tecnica/listo para cierre.
- QA visual autenticada final de Proveedores/Sucursales/Razones/Regiones: documentada como incompleta en pruebas temporales por sesion duplicada.

## Decisiones PM/PO requeridas

- Confirmar si T11-T24 se aceptan como `CERRADO` o permanecen `EN QA PO`.
- Confirmar si el cierre tecnico 30/30 de Proveedores equivale a cierre PO o requiere repeticion visual.
- Confirmar reactivacion o no de Curvas/Huecos/Copetes como verticales independientes.
- Definir fuente primaria para Ordenes de Compra: backlog maestro de compras vs backlog final de ordenes-compra.

