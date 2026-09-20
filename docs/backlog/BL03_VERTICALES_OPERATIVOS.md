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
- Estado: `EN AUDITORIA`.
- Avance: `25%`.
- Evidencia: `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_CHECKAPP_ACTUAL_2026-08-19.md`; `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_SKNC_LEGACY_2026-08-18.md`; `inspector/docs/compras/BACKLOG_MAESTRO_PROVEEDURIA_ORDENES_COMPRA.md`; `inspector/docs/ordenes-compra/ORDENES_COMPRA_BACKLOG_FINAL.md`; `inspector/docs/compras/checkapp-actual/05_COMPARATIVO_CHECKAPP_VS_SKNC.md`.
- Bloqueos: requiere decision PM/PO sobre si usar backlog final de `ordenes-compra` o backlog maestro de `compras` como fuente primaria.
- Responsable tecnico: pendiente.
- QA requerido: QA funcional/manual posterior, no iniciado.
- Siguiente accion: PM/PO debe validar alcance y separar que entra en OC vs Recepcion.
- Fecha ultima actualizacion: 2026-09-17.

Checklist inicial:

- A: iniciada por documentacion existente.
- B: iniciada por auditoria SKNC.
- C-M: pendiente de confirmacion para esta reorganizacion.

## VO-002 - Recepcion

- Backlog: BL-03.
- Nombre: Recepcion.
- Objetivo: definir y planificar Recepcion como etapa posterior a OC, total/parcial y trazable.
- Problema/necesidad: la documentacion indica que CheckApp actual no tiene Recepcion real desde OC ni impacto de inventario desde recepcion.
- Alcance: auditoria de recepcion legacy, contrato funcional, recepcion parcial, multiples recepciones, estados, evidencia, integracion inventario posterior.
- Fuera de alcance: iniciar implementacion, afectar existencias, crear tablas, DDL, ejecutar vertical.
- Dependencias: VO-001 Ordenes de Compra; evidencia documental confirma relacion OC -> Recepcion -> Inventario.
- Criterios de aceptacion: contrato funcional validado; eventos y estados definidos; dependencias con OC e Inventario separadas.
- Estado: `EN AUDITORIA`.
- Avance: `25%`.
- Evidencia: `inspector/docs/compras/BACKLOG_MAESTRO_PROVEEDURIA_ORDENES_COMPRA.md`; `inspector/docs/compras/checkapp-actual/05_COMPARATIVO_CHECKAPP_VS_SKNC.md`; `inspector/docs/compras/legacy-sknc/08_RECEPCION_OC.md`; `inspector/docs/compras/AUDITORIA_INTEGRAL_OC_SKNC_LEGACY_2026-08-18.md`.
- Bloqueos: requiere PO para alcance exacto de Recepcion y si se implementa antes o despues de aprobaciones.
- Responsable tecnico: pendiente.
- QA requerido: no iniciado.
- Siguiente accion: definir contrato Recepcion y limites con Inventario/Evidencia.
- Fecha ultima actualizacion: 2026-09-17.

Checklist inicial:

- A: iniciada por comparativo y backlog maestro.
- B: iniciada en auditoria legacy SKNC.
- C-M: pendiente.

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

