# BL-03 - Verticales Operativos

Objetivo: gestionar proximos modulos/procesos que requieren auditoria, construccion/homologacion y certificacion. No se inicia implementacion desde este backlog.

Etapas esperadas para cada vertical:

A. Auditoria funcional actual.
B. Auditoria Legacy cuando corresponda.
C. Contrato funcional/campos/reglas.
D. Diseno UI/UX Patron CheckApp.
E. Permisos.
F. API/AuthZ.
G. Multitenant/idEmpresa.
H. Schema/versionamiento.
I. Migracion/bootstrap si aplica.
J. Tests.
K. QA runtime.
L. QA PO.
M. Cierre.

## VO-001 - Ordenes de Compra

- Backlog: BL-03.
- Nombre: Ordenes de Compra.
- Objetivo: fortalecer y homologar el modulo de Ordenes de Compra sin rehacerlo innecesariamente.
- Problema/necesidad: CheckApp ya tiene OC real, pero existen gaps documentados: certificacion funcional, validaciones, permisos finos, trazabilidad, PDF/Excel y separacion posterior con Recepcion.
- Alcance: auditoria funcional actual, auditoria Legacy SKNC, campos/reglas, Patron CheckApp, permisos, API/AuthZ, multitenant, schema/versionamiento, QA y certificacion.
- Fuera de alcance: iniciar implementacion, DDL, SQL writes, T25, Recepcion como ejecucion separada.
- Dependencias: Proveedores/Proveeduria, ProductosServicios certificado, Razones Sociales/Sucursales, decision PO sobre backlog definitivo.
- Criterios de aceptacion: auditoria consolidada; contrato funcional aprobado; dependencias confirmadas; DoD Patron CheckApp definido; cierre PO para pasar a ejecucion.
- Estado: `OC-01 CERRADO / CONTRATO FUNCIONAL APROBADO`; `SEC-01 CERRADO / PASS TECNICO`; `SEC-01R CERRADO / PASS TECNICO RESTAURADO`; `ARQ-01 CERRADO / ALTERNATIVA B APROBADA POR PO`; `OC-02 CERRADO / MODELO SCHEMA OC V1`; `INV-01 CERRADO / PASS TECNICO`; `INV-02 CERRADO / PASS TECNICO`; `REC-01 CERRADO / PASS TECNICO`; `FASE B OC-03R PASS TECNICO / PENDIENTE QA PO`.
- Avance: `FASE A cerrada; SEC-01R corrige RolesPermisos para hijos OC/Recepcion y restaura menu global SuperAdmin con fusion aditiva; FASE B OC-03 actualiza Nueva OC existente con Patron CheckApp, productos, servicios, variantes, PresentacionCompra, snapshots, cantidades compra/base, AuthZ, multitenant y gate; Recepcion UI no iniciada`.
- Evidencia: `inspector/docs/compras/BL03_FASE_B_OC03R_QA_PO_PATRON_CHECKAPP_20260921.md`; `inspector/docs/compras/BL03_SEC01R_INCIDENTE_RESTAURACION_MENU_SUPERADMIN_20260921.md`; `inspector/docs/compras/BL03_REAPERTURA_SEC01R_ROLES_PERMISOS_OC_RECEPCION_20260921.md`; `inspector/docs/compras/BL03_FASE_B_OC03_NUEVA_OC_PATRON_CHECKAPP_20260921.md`; `inspector/docs/compras/BL03_FASE_A_REC01_MODELO_SCHEMA_RECEPCION_20260921.md`; `inspector/docs/compras/BL03_FASE_A_INV02_LIMPIEZA_HISTORICO_INVENTARIO_20260921.md`; `inspector/docs/compras/BL03_FASE_A_INV01_SCOPE_INVENTARIO_V1_20260921.md`; `inspector/docs/compras/BL03_FASE_A_OC02_MODELO_SCHEMA_OC_20260921.md`; `inspector/docs/compras/BL03_FASE_A_ARQ01_INVENTARIO_VARIANTE_SUCURSAL_20260921.md`; `inspector/docs/compras/BL03_FASE_A_SEC01_PERMISOS_CODIGOS_OC_RECEPCION_20260921.md`; `inspector/docs/compras/BL03_FASE_A_OC01_CONTRATO_FUNCIONAL_OC_RECEPCION_20260921.md`; `inspector/docs/compras/MOKA_REAUDITORIA_INTEGRAL_OC_RECEPCION_PERMISOS_20260921.md`; `inspector/docs/compras/MOKA_AUDITORIA_OC_RECEPCION_COMPLETO_20260920.md`; `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_CHECKAPP_ACTUAL_2026-08-19.md`; `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_SKNC_LEGACY_2026-08-18.md`; `inspector/docs/compras/BACKLOG_MAESTRO_PROVEEDURIA_ORDENES_COMPRA.md`; `inspector/docs/ordenes-compra/ORDENES_COMPRA_BACKLOG_FINAL.md`; `inspector/docs/compras/checkapp-actual/05_COMPARATIVO_CHECKAPP_VS_SKNC.md`.
- Bloqueos: no queda bloqueo tecnico de modelo Recepcion V1 ni de Nueva OC V1; pendiente QA PO.
- Responsable tecnico: pendiente.
- QA requerido: QA funcional/manual posterior, no iniciado.
- Siguiente accion: QA PO OC-03; no ejecutar OC-04 ni ticket posterior automaticamente.
- Fecha ultima actualizacion: 2026-09-21.

Checklist inicial:

- A: cerrada por reauditoria consolidada.
- B: cerrada como fuente Legacy solo lectura.
- C: cerrada por OC-01 contrato funcional.
- E/F: SEC-01 cerrada para permisos/codigos/menu/AuthZ OC.
- D y J-K: SEC-01R y OC-03 cerrados tecnicamente con pruebas y QA runtime real reversible; OC-03 queda LISTO QA PO, no aprobado PO; L-M pendientes de QA PO/cierre PO; T25 FROZEN y reporte lider FROZEN.

## VO-002 - Recepcion

- Backlog: BL-03.
- Nombre: Recepcion.
- Objetivo: definir y planificar Recepcion como etapa posterior a OC, total/parcial y trazable.
- Problema/necesidad: la documentacion indica que CheckApp actual no tiene Recepcion real desde OC ni impacto de inventario desde recepcion.
- Alcance: auditoria de recepcion legacy, contrato funcional, recepcion parcial, multiples recepciones, estados, evidencia, integracion inventario posterior.
- Fuera de alcance: iniciar implementacion, afectar existencias, crear tablas, DDL, ejecutar vertical.
- Dependencias: VO-001 Ordenes de Compra; evidencia documental confirma relacion OC -> Recepcion -> Inventario.
- Criterios de aceptacion: contrato funcional validado; eventos y estados definidos; dependencias con OC e Inventario separadas.
- Estado: `OC-01 CERRADO / CONTRATO FUNCIONAL APROBADO`; `SEC-01 CERRADO / PASS TECNICO`; `ARQ-01 CERRADO / ALTERNATIVA B APROBADA POR PO`; `OC-02 CERRADO / MODELO SCHEMA OC V1`; `INV-01 CERRADO / PASS TECNICO`; `INV-02 CERRADO / PASS TECNICO`; `REC-01 CERRADO / PASS TECNICO`.
- Avance: `Contrato funcional de Recepcion definido; permisos/codigos persistibles definidos; Inventario V1 aprobado y certificado; Recepcion V1 implementada como modelo/API tecnico sin UI final, con QA real reversible y cleanup total`.
- Evidencia: `inspector/docs/compras/BL03_FASE_A_REC01_MODELO_SCHEMA_RECEPCION_20260921.md`; `inspector/docs/compras/BL03_FASE_A_INV02_LIMPIEZA_HISTORICO_INVENTARIO_20260921.md`; `inspector/docs/compras/BL03_FASE_A_INV01_SCOPE_INVENTARIO_V1_20260921.md`; `inspector/docs/compras/BL03_FASE_A_OC02_MODELO_SCHEMA_OC_20260921.md`; `inspector/docs/compras/BL03_FASE_A_ARQ01_INVENTARIO_VARIANTE_SUCURSAL_20260921.md`; `inspector/docs/compras/BL03_FASE_A_SEC01_PERMISOS_CODIGOS_OC_RECEPCION_20260921.md`; `inspector/docs/compras/BL03_FASE_A_OC01_CONTRATO_FUNCIONAL_OC_RECEPCION_20260921.md`; `inspector/docs/compras/MOKA_REAUDITORIA_INTEGRAL_OC_RECEPCION_PERMISOS_20260921.md`; `inspector/docs/compras/MOKA_AUDITORIA_OC_RECEPCION_COMPLETO_20260920.md`; `inspector/docs/compras/BACKLOG_MAESTRO_PROVEEDURIA_ORDENES_COMPRA.md`; `inspector/docs/compras/checkapp-actual/05_COMPARATIVO_CHECKAPP_VS_SKNC.md`; `inspector/docs/compras/legacy-sknc/08_RECEPCION_OC.md`; `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_SKNC_LEGACY_2026-08-18.md`.
- Bloqueos: sin bloqueo tecnico de modelo/schema Recepcion V1; pendiente subticket de UI/flujo final si PO lo solicita.
- Responsable tecnico: pendiente.
- QA requerido: no iniciado.
- Siguiente accion: ejecutar siguiente subticket funcional de Recepcion/UI segun PO; no ejecutar automaticamente.
- Fecha ultima actualizacion: 2026-09-21.

Checklist inicial:

- A: cerrada por reauditoria consolidada.
- B: cerrada como fuente Legacy solo lectura.
- C: cerrada por OC-01 contrato funcional.
- E/F: SEC-01 cerrada para codigos/permisos; sin endpoints funcionales ficticios de Recepcion.
- D, G-M: pendientes de tickets posteriores; REC-01 no iniciado; T25 FROZEN y reporte lider FROZEN.

## VO-003 - Catalogo de Curvas

- Backlog: BL-03.
- Nombre: Catalogo de Curvas.
- Objetivo: auditar si Curvas debe existir como catalogo operativo independiente o como parte de otro dominio.
- Problema/necesidad: el backlog solicitado pide Curvas, pero `ORDENES_COMPRA_BACKLOG_FINAL.md` marca Curvas como excluido por PO dentro del alcance especifico de Ordenes de Compra.
- Alcance: auditoria documental, decision de dominio, relacion con OC/ProductosServicios si aplica, Patron CheckApp, permisos, API/AuthZ, schema/versionamiento.
- Fuera de alcance: iniciar implementacion o fusionar con Huecos/Copetes sin evidencia.
- Dependencias: decision PM/PO por contradiccion de alcance; posible relacion con ProductosServicios/OC no confirmada.
- Criterios de aceptacion: decision documentada sobre si Curvas se reabre fuera de OC; alcance funcional aprobado.
- Estado: `BLOQUEADO`.
- Avance: `REQUIERE_VALIDACION_PM/PO`.
- Evidencia: `inspector/docs/ordenes-compra/ORDENES_COMPRA_BACKLOG_FINAL.md` seccion `NO IMPLEMENTAR`, Curvas excluido por PO; solicitud actual de BL-03 pide crear VO-003.
- Bloqueos: contradiccion documental: nuevo pedido solicita Curvas, documento de OC lo excluye por decision PO para OC.
- Responsable tecnico: pendiente.
- QA requerido: no iniciado.
- Siguiente accion: PM/PO debe confirmar si Curvas es nuevo vertical independiente fuera de OC o sigue excluido.
- Fecha ultima actualizacion: 2026-09-17.

## VO-004 - Catalogo de Huecos

- Backlog: BL-03.
- Nombre: Catalogo de Huecos.
- Objetivo: auditar si Huecos debe existir como catalogo operativo independiente o parte de otro dominio.
- Problema/necesidad: el backlog solicitado pide Huecos, pero `ORDENES_COMPRA_BACKLOG_FINAL.md` marca Hueco como excluido por PO dentro del alcance especifico de Ordenes de Compra.
- Alcance: auditoria documental, decision de dominio, Patron CheckApp, permisos, API/AuthZ, multitenant, schema/versionamiento.
- Fuera de alcance: iniciar implementacion o fusionar con Curvas/Copetes sin evidencia.
- Dependencias: decision PM/PO por contradiccion de alcance.
- Criterios de aceptacion: decision documentada sobre si Huecos se reabre fuera de OC; alcance funcional aprobado.
- Estado: `BLOQUEADO`.
- Avance: `REQUIERE_VALIDACION_PM/PO`.
- Evidencia: `inspector/docs/ordenes-compra/ORDENES_COMPRA_BACKLOG_FINAL.md` seccion `NO IMPLEMENTAR`, Hueco excluido por PO; solicitud actual de BL-03 pide crear VO-004.
- Bloqueos: contradiccion documental: nuevo pedido solicita Huecos, documento de OC lo excluye por decision PO para OC.
- Responsable tecnico: pendiente.
- QA requerido: no iniciado.
- Siguiente accion: PM/PO debe confirmar si Huecos es nuevo vertical independiente fuera de OC o sigue excluido.
- Fecha ultima actualizacion: 2026-09-17.

## VO-005 - Catalogo de Copetes

- Backlog: BL-03.
- Nombre: Catalogo de Copetes.
- Objetivo: auditar si Copetes debe existir como catalogo operativo independiente o parte de otro dominio.
- Problema/necesidad: el backlog solicitado pide Copetes, pero `ORDENES_COMPRA_BACKLOG_FINAL.md` marca Copete como excluido por PO dentro del alcance especifico de Ordenes de Compra.
- Alcance: auditoria documental, decision de dominio, Patron CheckApp, permisos, API/AuthZ, multitenant, schema/versionamiento.
- Fuera de alcance: iniciar implementacion o fusionar con Curvas/Huecos sin evidencia.
- Dependencias: decision PM/PO por contradiccion de alcance.
- Criterios de aceptacion: decision documentada sobre si Copetes se reabre fuera de OC; alcance funcional aprobado.
- Estado: `BLOQUEADO`.
- Avance: `REQUIERE_VALIDACION_PM/PO`.
- Evidencia: `inspector/docs/ordenes-compra/ORDENES_COMPRA_BACKLOG_FINAL.md` seccion `NO IMPLEMENTAR`, Copete excluido por PO; solicitud actual de BL-03 pide crear VO-005.
- Bloqueos: contradiccion documental: nuevo pedido solicita Copetes, documento de OC lo excluye por decision PO para OC.
- Responsable tecnico: pendiente.
- QA requerido: no iniciado.
- Siguiente accion: PM/PO debe confirmar si Copetes es nuevo vertical independiente fuera de OC o sigue excluido.
- Fecha ultima actualizacion: 2026-09-17.

## Dependencias demostradas

| Dependencia | Evidencia | Dictamen |
| --- | --- | --- |
| Proveedores/Proveeduria -> Ordenes de Compra | `AUDITORIA_INTEGRAL_OC_CHECKAPP_ACTUAL_2026-08-19.md` menciona `ActivosProveedores`; `BACKLOG_MAESTRO_PROVEEDURIA_ORDENES_COMPRA.md` organiza OC bajo Proveeduria. | Dependencia funcional/documental demostrada. |
| ProductosServicios -> Ordenes de Compra | Auditoria actual y arquitectura OC documentan busqueda de ProductosServicios para partidas. | Dependencia demostrada. |
| Ordenes de Compra -> Recepcion | `BACKLOG_MAESTRO_PROVEEDURIA_ORDENES_COMPRA.md` separa OC-S2 Recepcion; comparativo recomienda `Generada -> Recepcion -> Inventario`. | Dependencia demostrada. |
| Recepcion -> Inventario | Backlog maestro OC-S4 y comparativo documentan gap de inventario desde OC/Recepcion. | Dependencia demostrada como etapa posterior, no implementada. |

## Dependencias pendientes

| Tema | Pendiente |
| --- | --- |
| Curvas/Huecos/Copetes | Confirmar si son tres catalogos independientes, parte de OC, parte de ProductosServicios o un dominio aparte. |
| Aprobaciones OC vs Recepcion | Definir orden de ejecucion con PO. |
| Evidencia Checklist para Recepcion | Definir si entra en VO-002 o subticket posterior. |

## Incidente QA real SuperAdmin / OC-03 - 2026-09-21

- Estado: `CORREGIDO / LISTO QA PO`.
- Documento: `inspector/docs/compras/BL03_INCIDENTE_QA_REAL_SUPERADMIN_USUARIO_ACTIVO_OC03_20260921.md`.
- Se reprodujo en navegador real: RolesPermisos SuperAdmin mostraba OC/Recepcion OFF y Nueva OC fallaba con `No fue posible resolver el usuario activo`.
- Fix: overlay oficial SuperAdmin ON + disabled sin mutar JSON; Nueva OC MVC/API transmite identidad efectiva string/Firebase UID para AuthZ.
- Runtime real completo: Home -> RolesPermisos -> Nueva OC -> Paso 1 -> Paso 2 -> Partidas -> Revision con producto+variante y servicio, sin guardar OC.
- Regla permanente: nunca exigir al PO activar switches de SuperAdmin para nuevas opciones oficiales.
