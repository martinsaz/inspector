# BL-02 - Homologacion CheckApp

Objetivo: gestionar pantallas/modulos existentes que deben alcanzar el Patron CheckApp completo.

Referencia de DoD comun: `DoD: PATRON CHECKAPP 30/30 APLICABLES`, vinculado a `inspector/docs/pattern/PATRON_CHECKAPP_OFICIAL_20260916.md`.

Regla de cierre: aunque un documento diga `PASS`, el ticket solo queda `CERRADO` y `100%` si existe cierre PO. Si hay QA visual autenticada pendiente, el estado queda `EN QA PO` o `EN DESARROLLO` segun evidencia.

## HC-001 - Menu / jerarquia de navegacion

- Backlog: BL-02.
- Nombre: Menu / jerarquia de navegacion.
- Objetivo: mantener jerarquias navegables coherentes con permisos granulares y agrupadores.
- Problema/necesidad: se documentaron regresiones en ProductosServicios y en Sucursales/Razones/Regiones por arboles o fallbacks legacy.
- Alcance: jerarquia `05000000`-`05001005`; jerarquia Ajustes -> Sucursales -> ABC/Razones/Regiones; agrupadores solo Acceso; menu lateral fail-closed.
- Fuera de alcance: cambiar permisos productivos sin autorizacion, T25, Firebase, Hosting.
- Dependencias: HC-002, BL-01/T23-T24.
- Criterios de aceptacion: menu no fabrica permisos hijos; agrupador no concede escritura; roles legacy tratados solo donde existe regla documentada; QA visual autenticada cuando aplique.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/database/POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`; `inspector/docs/pattern/REGRESION_MENU_SUCURSALES_RAZONES_REGIONES_20260917.md`; `inspector/docs/pattern/APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md`.
- Bloqueos: QA visual autenticada pendiente por sesion duplicada en pruebas temporales.
- Responsable tecnico: MVC / permisos.
- QA requerido: QA visual/runtime autenticada y cierre PO.
- Siguiente accion: repetir validacion visual en puertos manuales del PO.
- Fecha ultima actualizacion: 2026-09-17.

## HC-002 - Roles y Permisos / granularidad

- Backlog: BL-02.
- Nombre: Roles y Permisos / granularidad.
- Objetivo: asegurar granularidad funcional y proteccion de SuperAdmin.
- Problema/necesidad: ProductosServicios requirio permisos granulares y se corrigieron roles/permisos post-T24; Sucursales/Razones/Regiones definieron hijos funcionales.
- Alcance: `05000000`, `05001000`, `05001001`, `05001002`, `05001003`, `05001004`, `05001005`; `04003000`, `04003100`, `04004000`, `04005000`; proteccion SuperAdmin.
- Fuera de alcance: asignacion masiva, cambiar otros roles sin evidencia, Firebase/Hosting.
- Dependencias: HC-001, BL-01/T23.
- Criterios de aceptacion: READ/WRITE usan codigo especifico; padres son agrupadores; SuperAdmin no editable manualmente; fixtures o cambios administrativos documentados.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspectorapi/AGENTS.md`; `inspector/docs/database/POST_T24_CORRECCIONES_PERMISOS_Y_CONGELAMIENTO_T25_20260916.md`; `inspector/docs/pattern/APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md`.
- Bloqueos: cierre PO no localizado para todo el bloque.
- Responsable tecnico: MVC/API AuthZ.
- QA requerido: QA PO de roles reales y no regresion SuperAdmin.
- Siguiente accion: confirmar aceptacion PO de granularidad.
- Fecha ultima actualizacion: 2026-09-17.

## HC-003 - Proveedores

- Backlog: BL-02.
- Nombre: Proveedores.
- Objetivo: homologar Proveedores al Patron CheckApp completo.
- Problema/necesidad: el modulo requirio paridad Legacy, UI/UX, schema/scope, permisos y certificacion.
- Alcance: pantalla Proveedores, modal, DTO/API/MVC, multitenant, scope propio, AuthZ, gate, drift, lock, QA tecnica.
- Fuera de alcance: T25, cambios no documentados en otros modulos.
- Dependencias: BL-01 como patron reusable; HC-001/HC-002 para menu/permisos.
- Criterios de aceptacion: `DoD: PATRON CHECKAPP 30/30 APLICABLES`; QA automatizada; QA visual runtime autenticada.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/pattern/APLICACION_PATRON_CHECKAPP_PROVEEDORES_20260917.md`; `inspector/docs/pattern/MOKA_PROVEEDORES_CIERRE_100_PATRON_CHECKAPP_20260917.md`; `inspector/docs/pattern/MOKA_PROVEEDORES_LEGACY_PATRON_CHECKAPP_20260917.md`; `inspector/docs/pattern/QA_UI_UX_PROVEEDORES_SUCURSALES_RAZONES_REGIONES_20260917.md`.
- Bloqueos: hay documento de cierre 100 tecnico, pero tambien evidencia de QA visual autenticada incompleta por sesion duplicada; requiere validacion PM/PO para estado final.
- Responsable tecnico: MVC/API Proveedores.
- QA requerido: cierre PO o repeticion visual autenticada si el PO no acepta evidencia tecnica.
- Siguiente accion: PM/PO debe decidir si el cierre 100 tecnico equivale a aceptacion o si se repite QA visual.
- Fecha ultima actualizacion: 2026-09-17.

## HC-004 - ABC Sucursales

- Backlog: BL-02.
- Nombre: ABC Sucursales.
- Objetivo: homologar ABC Sucursales al Patron CheckApp.
- Problema/necesidad: antes usaba DataTables legacy, modal antiguo y permiso padre `04003000`; se definio `04003100` funcional.
- Alcance: UI MVC, DynamicGrid, filtros, modal, permisos, AuthZ, scope tecnico `Sucursales`, schema/gate/locking/drift/CRUD multitenant.
- Fuera de alcance: T25, Firebase, Hosting, Conexiones.
- Dependencias: HC-001, HC-002, BL-01 patron reusable.
- Criterios de aceptacion: `DoD: PATRON CHECKAPP 30/30 APLICABLES`; `04003100` como permiso funcional; QA visual autenticada.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/pattern/APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md`; `inspector/docs/database/TICKET_SCOPE_SUCURSALES_V1_CERTIFICACION_CHECKAPPERP_20260917.md`; `inspector/docs/pattern/REGRESION_MENU_SUCURSALES_RAZONES_REGIONES_20260917.md`.
- Bloqueos: QA visual autenticada pendiente por bloqueo de sesion duplicada documentado.
- Responsable tecnico: MVC/API Sucursales.
- QA requerido: runtime autenticado y cierre PO.
- Siguiente accion: repetir QA visual/manual con sesion PO estable.
- Fecha ultima actualizacion: 2026-09-17.

## HC-005 - Razones Sociales

- Backlog: BL-02.
- Nombre: Razones Sociales.
- Objetivo: homologar Razones Sociales al Patron CheckApp.
- Problema/necesidad: integrar a jerarquia Sucursales y scope tecnico comun con permiso funcional propio.
- Alcance: UI MVC, DynamicGrid, filtros/modal, permiso `04004000`, AuthZ, scope `Sucursales`.
- Fuera de alcance: T25, nuevas conexiones o DDL no documentado.
- Dependencias: HC-001, HC-002, HC-004.
- Criterios de aceptacion: `DoD: PATRON CHECKAPP 30/30 APLICABLES`; permiso funcional `04004000`; QA visual autenticada.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/pattern/APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md`; `inspector/docs/database/TICKET_SCOPE_SUCURSALES_V1_CERTIFICACION_CHECKAPPERP_20260917.md`; `inspector/docs/pattern/QA_UI_UX_PROVEEDORES_SUCURSALES_RAZONES_REGIONES_20260917.md`.
- Bloqueos: QA visual autenticada incompleta.
- Responsable tecnico: MVC/API catalogos administrativos.
- QA requerido: runtime autenticado y cierre PO.
- Siguiente accion: repetir comparacion visual contra ProductosServicios.
- Fecha ultima actualizacion: 2026-09-17.

## HC-006 - Regiones

- Backlog: BL-02.
- Nombre: Regiones.
- Objetivo: homologar Regiones al Patron CheckApp.
- Problema/necesidad: integrar a jerarquia Sucursales y scope tecnico comun con permiso funcional propio.
- Alcance: UI MVC, DynamicGrid, filtros/modal, permiso `04005000`, AuthZ, scope `Sucursales`.
- Fuera de alcance: T25, nuevas conexiones o DDL no documentado.
- Dependencias: HC-001, HC-002, HC-004.
- Criterios de aceptacion: `DoD: PATRON CHECKAPP 30/30 APLICABLES`; permiso funcional `04005000`; QA visual autenticada.
- Estado: `EN QA PO`.
- Avance: `90%`.
- Evidencia: `inspector/docs/pattern/APLICACION_PATRON_CHECKAPP_SUCURSALES_RAZONES_REGIONES_20260916.md`; `inspector/docs/database/TICKET_SCOPE_SUCURSALES_V1_CERTIFICACION_CHECKAPPERP_20260917.md`; `inspector/docs/pattern/QA_UI_UX_PROVEEDORES_SUCURSALES_RAZONES_REGIONES_20260917.md`.
- Bloqueos: QA visual autenticada incompleta.
- Responsable tecnico: MVC/API catalogos administrativos.
- QA requerido: runtime autenticado y cierre PO.
- Siguiente accion: repetir comparacion visual contra ProductosServicios.
- Fecha ultima actualizacion: 2026-09-17.

## Subtickets recomendados

| Subticket | Padre | Estado | Motivo |
| --- | --- | --- | --- |
| HC-001.1 | HC-001 | `EN QA PO` | Revalidar menu Sucursales/Razones/Regiones sin fallback legacy inseguro. |
| HC-002.1 | HC-002 | `EN QA PO` | Confirmar granularidad ProductosServicios `05001001`-`05001005` con PO. |
| HC-003.1 | HC-003 | `EN QA PO` | Resolver contradiccion entre cierre 100 tecnico y QA visual autenticada incompleta. |
| HC-004.1 | HC-004 | `EN QA PO` | Repetir QA visual autenticada de ABC Sucursales. |

