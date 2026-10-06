# LP-BACKLOG-R1 - Backlog corregido post LP-05R7 Lista de Precios

Fecha: 2026-09-29  
Estado: BACKLOG CORREGIDO COMPLETO / LISTO REVISION PO  
Tipo: documento PM/PO. No autoriza implementacion.

## 1. Alcance

Este backlog corrige el roadmap de Lista de Precios despues de LP-05R7. Mantiene LP-01..LP-05 como historico ejecutado y crea tickets nuevos desde LP-06. La decision PO vigente cambia el objetivo final: Lista de Precios debe evolucionar de base read-only a CONSOLA OPERATIVA CheckApp, sin copiar Tarahumara literalmente.

## 2. Antecedentes leidos

- AGENTS/CLAUDE MVC y API.
- LP-AUD-01.
- LP-05R7 completo.
- Backlog original referenciado por LP-01: `/Users/denissemendiola/Downloads/BACKLOG_LISTA_PRECIOS_CHECKAPP_20260928.pdf` (PDF existente; sin extractor PDF local disponible, se uso su referencia historica y los documentos LP derivados).
- LP-01, LP-02, LP-03, LP-04 y LP-05.
- Decisiones PO cerradas en contrato LP-BACKLOG-R1.
- Legacy Raramuri/sazapi como referencia funcional read-only.
- CheckApp como arquitectura, modelo, UX y autoridad de implementacion futura.

## 3. Historico preservado

| Ticket | Estado historico | Preservacion |
|---|---|---|
| LP-01 | Contrato funcional V1 | Mantener; V1 no incluia descuentos/promociones complejas. |
| LP-02 | Schema V1/versionado/gate | Mantener; no reescribir V1, evolucionar con nuevo versionado. |
| LP-03 | API + motor V1 | Mantener; extender en ticket futuro, no romper consumidores tecnicos. |
| LP-04 | Roles/permisos/menu | Mantener `05001008` READ y `05001009` WRITE/ADMIN. |
| LP-05 | Pantalla base read-only | Mantener como base visual secundaria; no declararla modulo completo. |

## 4. Objetivo final

Construir una consola operativa de Lista de Precios CheckApp con listas 1..10, Lista 1 default, Producto/Servicio/Variante/PresentacionVenta, precio especifico + fallback, precio `0.00` valido, descuentos por lista, redondeos, promociones, edicion individual, filtros avanzados, fotografias, existencias/movimientos integrados, ajuste masivo, copiar lista, descuento por marca, Excel operativo, historico/auditoria, ventas como contexto, consumidores reales y sugerencias comerciales cuando existan fuentes confiables.

## 5. Fases

| Fase | Nombre | Objetivo |
|---|---|---|
| A | Modelo comercial | Cerrar contrato extendido, schema/version y motor. |
| B | Administracion individual | Permitir edicion individual segura por identidad vendible. |
| C | Consola operativa | Ampliar filtros, fotos, grid y movimientos read/write-ready. |
| D | Operaciones masivas | Ejecutar acciones batch con preview, confirmacion y auditoria. |
| E | Integraciones/consumidores | Incorporar ventas contexto y consumo de precios. |
| F | Analitica | Sugerencias comerciales con datos confiables. |
| G | Certificacion final | QA integral, regression, cleanup y cierre PO. |

## 6. Reglas de dependencia

- No UI de descuentos antes de LP-06 + LP-07 + LP-08.
- No promociones antes de definir contrato y schema.
- No consumidores antes de estabilizar motor extendido.
- No sugerencias antes de tener existencia, ventas, costo, margen, descuento y precio confiables.
- No operaciones masivas sin preview, confirmacion, transaccion, rollback y auditoria.
- No duplicar catalogos de Categoria, Marca, Coleccion, Etiqueta, Atributos, Variantes, PresentacionesVenta, Inventario, Sucursales, Curvas, OC ni Recepcion.

## 7. Tickets nuevos

### LP-06 - Contrato funcional extendido comercial

- ID: LP-06.
- Nombre: Contrato funcional extendido comercial Lista de Precios.
- Fase: A Modelo comercial.
- Prioridad: P0.
- Objetivo: formalizar precio, descuento, precio final, redondeo, promocion, vigencia, fallback e identidad aplicable antes de schema/UI.
- Justificacion: LP-05R7 confirmo que Legacy incluye descuentos, redondeos y promociones que LP-01 dejo fuera de V1.
- Dependencias: LP-01..LP-05, LP-AUD-01, LP-05R7, decisiones PO LP-BACKLOG-R1.
- Alcance funcional: listas 1..10, Lista 1 default, Producto/Servicio/Variante/PresentacionVenta, precio `0.00`, NULL/fila ausente, descuento 0..100, redondeos Sin/A 4-9/Solo 9, promociones 2x1/3x2/descuento segundo/monedero, historico y consumidores.
- Alcance tecnico: especificacion sin codigo; definir algoritmos, contratos DTO, casos borde, estados y reglas fail-closed.
- UI: no implementa UI; define lenguaje, labels, hints y comportamiento esperado.
- API: no implementa endpoints; define contratos futuros.
- BD/schema: no DDL; define propuesta conceptual de evolucion.
- Permisos: preservar `05001008` y `05001009`; permisos adicionales quedan como decision PO por operacion sensible.
- Tenant: todo contrato server-side por `idEmpresa` y `DatabaseIdentity+Scope`.
- Responsive: criterios desktop/tablet/mobile 390 para tickets UI futuros.
- QA obligatoria: revision PO del contrato, matriz de casos borde, tabla de conceptos separados.
- Fixtures: ninguno.
- Cleanup: N/A.
- Regresion: no tocar LP-01..LP-05.
- FROZEN: ProductosServicios, Inventario, Curvas, OC, Recepcion, Auth, Legacy.
- Fuera de alcance: implementacion, schema, API, UI, migraciones.
- Criterios de aceptacion: contrato aprobado con precio/descuento/redondeo/promocion separados, algoritmo Legacy de redondeo auditado, consumidores definidos a nivel conceptual.
- Entregables: documento LP-06 contrato extendido.
- Handoff: habilita LP-07.

### LP-07 - Schema y versionado comercial V2/V3

- ID: LP-07.
- Nombre: Evolucion Schema/Version para descuentos, redondeos, promociones e historico.
- Fase: A Modelo comercial.
- Prioridad: P0.
- Objetivo: disenar y ejecutar la evolucion versionada de ListaPrecios sin romper V1.
- Justificacion: V1 solo tiene precio; consola operativa requiere descuento, precio final, redondeo, promociones e historico.
- Dependencias: LP-06 aprobado.
- Alcance funcional: detalle por identidad/lista con precio base/original, descuento, precio final calculable, redondeo elegido, vigencia/promociones si PO las aprueba, auditoria.
- Alcance tecnico: nuevo contrato de schema, hash, migration runner, drift validation, gate compatible, idempotencia y rollback.
- UI: N/A.
- API: N/A salvo hooks de compatibility gate si aplica.
- BD/schema: versionado por `DatabaseIdentity+Scope`; sin DDL manual; migracion reversible en QA; no copiar D1..D10 fisico.
- Permisos: sin permisos nuevos.
- Tenant: idEmpresa en filas; DDL por base/scope, datos aislados por empresa.
- Responsive: N/A.
- QA obligatoria: tests contrato, drift, gate, SQL real, fixtures reversibles, segunda corrida idempotente.
- Fixtures: precios/promociones temporales por empresa QA.
- Cleanup: cero fixtures.
- Regresion: LP-02/LP-03 V1 compatibles o migrados controladamente.
- FROZEN: otras scopes y Legacy.
- Fuera de alcance: UI, operaciones masivas, consumidores.
- Criterios de aceptacion: schema versionado PASS, gate compatible, `0.00` valido, NULL/fila ausente conserva fallback, descuentos 0..100 protegidos.
- Entregables: documento LP-07, tests, evidencia SQL real.
- Handoff: habilita LP-08.

### LP-08 - API y motor comercial extendido

- ID: LP-08.
- Nombre: API + motor V2 de resolucion y administracion comercial.
- Fase: A Modelo comercial.
- Prioridad: P0.
- Objetivo: extender motor/API para resolver precio, descuento, precio final, redondeo, promociones y fallback.
- Justificacion: UI y consumidores no deben duplicar reglas comerciales.
- Dependencias: LP-06, LP-07.
- Alcance funcional: resolver por lista/identidad, guardar/baja precio comercial, validar descuentos, calcular precio final, aplicar redondeos, preparar promociones, mantener fallback.
- Alcance tecnico: servicios server-side, DTOs, validaciones identidad->producto, transacciones, errores saneados.
- UI: N/A.
- API: endpoints/servicios extendidos de consulta, resolver, guardar, baja, preview calculo y lectura historica minima.
- BD/schema: usa LP-07; no DDL adicional.
- Permisos: READ `05001008`, WRITE `05001009`; consumidores internos no saltan tenant/gate.
- Tenant: fail-closed ante mismatch.
- Responsive: N/A.
- QA obligatoria: unit/integration, SQL real, casos 0/NULL/fallback/descuento/redondeo/promocion.
- Fixtures: identidades producto/servicio/variante/presentacion.
- Cleanup: cero fixtures.
- Regresion: LP-03 V1 no queda roto; API publica saneada.
- FROZEN: Auth/Login/menu/Legacy.
- Fuera de alcance: MVC UI y operaciones masivas.
- Criterios de aceptacion: motor unico, determinista, audit-ready, sin reglas en JS.
- Entregables: API/motor extendido documentado.
- Handoff: habilita LP-09, LP-10, LP-12 y consumidores posteriores.

### LP-09 - Edicion individual operativa

- ID: LP-09.
- Nombre: UI de edicion individual de precios comerciales.
- Fase: B Administracion individual.
- Prioridad: P0.
- Objetivo: editar precio/descuento/precio final/redondeo por Producto, Servicio, Variante y PresentacionVenta.
- Justificacion: Legacy confirma edicion individual; LP-05 no la expone.
- Dependencias: LP-08.
- Alcance funcional: listas 1..10, precio, descuento, precio final, redondeo, promociones cuando esten disponibles, feedback, persistencia/F5.
- Alcance tecnico: MVC proxy firmado, modal Patron CheckApp, llamadas API write, refresh de DynamicGrid.
- UI: Golden Master ProductosServicios; modal con labels/hints homologados y responsive.
- API: consume LP-08; no calcula reglas en JS.
- BD/schema: usa LP-07.
- Permisos: `05001009` WRITE; `05001008` requerido como base.
- Tenant: server-side; sin idEmpresa manipulable.
- Responsive: desktop, tablet, mobile 390.
- QA obligatoria: visual, permisos readonly/write, F5, errores, concurrencia simple.
- Fixtures: precios temporales reversibles.
- Cleanup: restaurar/archivar fixtures.
- Regresion: LP-05 consulta, ProductosServicios modal, DynamicGrid.
- FROZEN: no cambiar PS modal.
- Fuera de alcance: masivos, consumidores, sugerencias.
- Criterios de aceptacion: guardado individual correcto, auditado, sin hard delete, sin overflow responsive.
- Entregables: pantalla/modal y documento LP-09.
- Handoff: habilita LP-14/15/16 por reuse de reglas.

### LP-10 - Filtros avanzados CheckApp

- ID: LP-10.
- Nombre: Filtros avanzados para consola Lista de Precios.
- Fase: C Consola operativa.
- Prioridad: P1.
- Objetivo: adaptar filtros Legacy al modelo CheckApp sin catalogos duplicados.
- Justificacion: PO cerro filtros avanzados como obligatorios.
- Dependencias: LP-08; puede ejecutarse antes o despues de LP-09 si conserva read-only.
- Alcance funcional: Categoria, Marca, Coleccion, Etiquetas, Atributos, Variante, Presentacion, Lista, precio min/max, descuento, estatus, busqueda, existencia/ventas solo cuando fuentes esten listas.
- Alcance tecnico: combos reales, query eficiente, estado de filtros, chips, limpiar.
- UI: panel filtros Golden Master, responsive.
- API: ampliar consulta read-only.
- BD/schema: sin DDL salvo si LP-07 lo requiere para descuento.
- Permisos: READ `05001008`.
- Tenant: filtros server-side.
- Responsive: desktop/tablet/mobile 390.
- QA obligatoria: combinaciones, limpiar, F5, sin resultados, cross-tenant.
- Fixtures: datos filtrables temporales.
- Cleanup: cero fixtures.
- Regresion: LP-05 filtros base siguen funcionando.
- FROZEN: catalogos PS.
- Fuera de alcance: masivos, consumidores.
- Criterios de aceptacion: filtros Legacy cubiertos con equivalentes CheckApp o marcados no aplicables por contrato.
- Entregables: LP-10.
- Handoff: habilita LP-12 y LP-14.

### LP-11 - Fotografias en Lista de Precios

- ID: LP-11.
- Nombre: Fotografias de identidad vendible.
- Fase: C Consola operativa.
- Prioridad: P1.
- Objetivo: mostrar foto/preview desde ProductoServicio/Variante/Presentacion cuando aplique.
- Justificacion: Legacy y PO exigen fotografias.
- Dependencias: LP-08.
- Alcance funcional: columna opcional, toggle, modal de imagen, fallback visual sin imagen.
- Alcance tecnico: reutilizar multimedia existente; no crear almacenamiento paralelo.
- UI: columna DynamicGrid, modal CheckApp, mobile-safe.
- API: lectura de URL/metadatos existentes.
- BD/schema: no DDL.
- Permisos: READ.
- Tenant: validar ownership de imagen/identidad.
- Responsive: desktop/tablet/mobile 390.
- QA obligatoria: con/sin imagen, variante, servicio, cross-tenant.
- Fixtures: imagenes QA si ya existen; no subir assets permanentes.
- Cleanup: cero temporales.
- Regresion: PS multimedia.
- FROZEN: Storage/Auth.
- Fuera de alcance: edicion/subida de fotos.
- Criterios de aceptacion: imagen visible sin degradar grid ni exportar datos privados.
- Entregables: LP-11.
- Handoff: habilita LP-12/LP-17.

### LP-12 - DynamicGrid operativo ampliado

- ID: LP-12.
- Nombre: DynamicGrid operativo ampliado Lista de Precios.
- Fase: C Consola operativa.
- Prioridad: P1.
- Objetivo: ampliar columnas y acciones de grid al alcance operativo aprobado.
- Justificacion: Legacy grid contiene columnas P/D, existencia, foto y acciones que LP-05 no tiene.
- Dependencias: LP-08, LP-10, LP-11.
- Alcance funcional: identidad, codigo/barcode equivalente, categoria/marca/atributos, foto, lista, precio, descuento, precio final, origen, existencia resumida, acciones.
- Alcance tecnico: DynamicGrid oficial, columnas configurables, paginacion, busqueda interna, sorting, estados.
- UI: Golden Master ProductosServicios; no cards anidadas.
- API: consulta DTO extendido.
- BD/schema: usa LP-07.
- Permisos: READ, acciones write solo si LP-09 autorizado.
- Tenant: server-side.
- Responsive: desktop/tablet/mobile 390.
- QA obligatoria: columnas, orden, busqueda, estado vacio, mobile sin overflow.
- Fixtures: dataset completo.
- Cleanup: cero fixtures.
- Regresion: LP-05 base.
- FROZEN: componentes base DynamicGrid.
- Fuera de alcance: Excel completo y masivos.
- Criterios de aceptacion: grid operativo sin perder Patron CheckApp.
- Entregables: LP-12.
- Handoff: habilita LP-13, LP-14, LP-17.

### LP-13 - Existencias y movimientos integrados

- ID: LP-13.
- Nombre: Modal de existencias/movimientos adaptado a CheckApp.
- Fase: C Consola operativa.
- Prioridad: P1.
- Objetivo: mostrar existencia, movimientos, sucursal, curva, transito, pedidos/OC, recepcion y ventas/devoluciones cuando existan fuentes.
- Justificacion: Legacy aporta matriz operativa; PO exige integrarla sin duplicar modulos.
- Dependencias: LP-12; fuentes Inventario/Sucursales/Curvas/OC/Recepcion disponibles; ventas contexto puede depender de LP-19.
- Alcance funcional: modal read-only con pestañas equivalentes, totales y filtros de sucursal.
- Alcance tecnico: servicios de lectura por dominio; no replicar saldos.
- UI: modal CheckApp responsive.
- API: endpoints read-only agregadores o servicios internos autorizados.
- BD/schema: sin DDL en ListaPrecios.
- Permisos: READ LP; permisos extra de Inventario/OC si PO lo decide.
- Tenant: cross-domain fail-closed.
- Responsive: desktop/tablet/mobile 390.
- QA obligatoria: con/sin inventario, multi-sucursal, variante, servicio, permisos.
- Fixtures: reversibles por dominio.
- Cleanup: cero fixtures.
- Regresion: Inventario/Curvas/OC/Recepcion.
- FROZEN: no alterar ledger.
- Fuera de alcance: movimientos de inventario desde LP.
- Criterios de aceptacion: informacion contextual confiable sin duplicar fuente de verdad.
- Entregables: LP-13.
- Handoff: habilita sugerencias LP-21 parcialmente.

### LP-14 - Ajuste masivo

- ID: LP-14.
- Nombre: Ajuste masivo de precios/descuentos.
- Fase: D Operaciones masivas.
- Prioridad: P1.
- Objetivo: aplicar cambios masivos al universo filtrado con preview y auditoria.
- Justificacion: Legacy tiene ajuste masivo y PO lo exige.
- Dependencias: LP-09, LP-10, LP-12, LP-18 hooks minimos.
- Alcance funcional: filtros -> universo afectado -> preview -> campo -> operacion -> valor -> confirmacion -> transaccion -> resultado -> auditoria.
- Alcance tecnico: job/operacion transaccional, batch limits, rollback o compensacion documentada.
- UI: modal/wizard CheckApp.
- API: preview y aplicar.
- BD/schema: usa LP-07/LP-18.
- Permisos: `05001009`; permisos adicionales como decision PO si sensible.
- Tenant: server-side.
- Responsive: desktop/tablet/mobile 390.
- QA obligatoria: preview coincide con aplicar, cancelacion no escribe, errores parciales controlados.
- Fixtures: dataset masivo reversible.
- Cleanup: cero fixtures.
- Regresion: edicion individual.
- FROZEN: no consumidores aun.
- Fuera de alcance: copiar lista, descuento marca.
- Criterios de aceptacion: ninguna escritura sin confirmacion y auditoria.
- Entregables: LP-14.
- Handoff: habilita LP-22 regression masiva.

### LP-15 - Copiar lista

- ID: LP-15.
- Nombre: Copiar lista de precios.
- Fase: D Operaciones masivas.
- Prioridad: P1.
- Objetivo: copiar origen a destino con opciones de precios, descuentos y promociones.
- Justificacion: Legacy copia listas; PO lo exige.
- Dependencias: LP-09, LP-18 hooks minimos.
- Alcance funcional: origen, destino, precios, descuentos, promociones si aplica, NULL, `0.00`, overwrite/merge, preview, confirmacion, transaccion, rollback, auditoria.
- Alcance tecnico: servicio batch idempotente.
- UI: modal CheckApp.
- API: preview/aplicar.
- BD/schema: usa LP-07.
- Permisos: `05001009`.
- Tenant: server-side.
- Responsive: desktop/tablet/mobile 390.
- QA obligatoria: merge/overwrite, descuentos, `0.00`, NULL, rollback.
- Fixtures: listas origen/destino reversibles.
- Cleanup: cero fixtures.
- Regresion: motor resolver.
- FROZEN: no DDL.
- Fuera de alcance: descuento por marca.
- Criterios de aceptacion: destino exacto segun modo y auditado.
- Entregables: LP-15.
- Handoff: habilita LP-22.

### LP-16 - Descuento por marca

- ID: LP-16.
- Nombre: Descuento por marca CheckApp.
- Fase: D Operaciones masivas.
- Prioridad: P1.
- Objetivo: aplicar descuento por Marca real CheckApp + Lista.
- Justificacion: Legacy y PO lo exigen; debe usar Marca CheckApp, no catalogo duplicado.
- Dependencias: LP-09, LP-10, LP-18 hooks minimos.
- Alcance funcional: marca, lista, descuento 0..100, preview, confirmacion, resultado, auditoria.
- Alcance tecnico: batch por marca/identidad vendible.
- UI: modal CheckApp.
- API: preview/aplicar.
- BD/schema: usa LP-07.
- Permisos: `05001009`; permiso adicional queda decision PO.
- Tenant: server-side.
- Responsive: desktop/tablet/mobile 390.
- QA obligatoria: marca sin datos, servicio/producto/variante/presentacion, rollback.
- Fixtures: marca QA reversible.
- Cleanup: cero fixtures.
- Regresion: filtros marca y motor.
- FROZEN: Catalogos Marcas.
- Fuera de alcance: promociones por marca si no estan en LP-06/07.
- Criterios de aceptacion: no afecta otras marcas ni otros tenants.
- Entregables: LP-16.
- Handoff: habilita LP-22.

### LP-17 - Excel operativo ampliado

- ID: LP-17.
- Nombre: Exportacion Excel operativa.
- Fase: C Consola operativa.
- Prioridad: P1.
- Objetivo: exportar el dataset operativo filtrado con precios, descuentos, foto metadata, existencia y origen.
- Justificacion: Legacy exporta grilla operativa; LP-05 exporta solo base.
- Dependencias: LP-12; LP-13 para existencias si se incluyen.
- Alcance funcional: respetar filtros, columnas visibles/obligatorias, tenant, datos saneados.
- Alcance tecnico: DynamicGrid export oficial o endpoint controlado.
- UI: boton oficial Exportar Excel.
- API: si aplica endpoint export.
- BD/schema: no DDL.
- Permisos: READ.
- Tenant: server-side.
- Responsive: boton usable en mobile.
- QA obligatoria: archivo fisico xlsx, encabezados, filtros, sin HTML/error/secretos.
- Fixtures: dataset exportable.
- Cleanup: eliminar archivos QA.
- Regresion: LP-05 Excel.
- FROZEN: vendor/exportador base.
- Fuera de alcance: importacion.
- Criterios de aceptacion: Excel abre y coincide con pantalla.
- Entregables: LP-17.
- Handoff: LP-22.

### LP-18 - Historico y auditoria

- ID: LP-18.
- Nombre: Historico/auditoria de Lista de Precios.
- Fase: A/D transversal.
- Prioridad: P0.
- Objetivo: registrar trazabilidad completa de cambios.
- Justificacion: PO exige historico; operaciones masivas no son aceptables sin auditoria.
- Dependencias: LP-07; debe habilitar LP-14/15/16.
- Alcance funcional: identidad, lista, campo, valor anterior, valor nuevo, usuario, fecha/hora, origen individual/masivo/copia/marca/promocion.
- Alcance tecnico: tablas/servicio audit trail versionado, lectura historica.
- UI: consulta historica basica o enlace desde identidad.
- API: registrar y consultar.
- BD/schema: versionado por LP-07 o migracion subsecuente.
- Permisos: READ historial con `05001008`; escritura interna.
- Tenant: idEmpresa obligatorio.
- Responsive: consulta basica responsive si hay UI.
- QA obligatoria: cada origen genera auditoria exacta, cleanup fixtures.
- Fixtures: cambios controlados.
- Cleanup: cero fixtures.
- Regresion: no inflar consumidores.
- FROZEN: no modificar logs globales no relacionados.
- Fuera de alcance: BI avanzado.
- Criterios de aceptacion: trazabilidad verificable y saneada.
- Entregables: LP-18.
- Handoff: habilita LP-14/15/16 y LP-22.

### LP-19 - Ventas como contexto

- ID: LP-19.
- Estado: BLOQUEADO / DEPENDENCIA VENTAS.
- Nombre: Ventas como contexto dentro de Lista de Precios.
- Fase: E Integraciones/consumidores.
- Prioridad: P1.
- Objetivo: mostrar ventas/devoluciones por periodo como informacion contextual.
- Justificacion: Legacy filtra por ventas y sugerencias dependen de ventas confiables.
- Dependencias: dominio funcional Ventas CheckApp con fuente canonica certificada. No se asigna numero nuevo de ticket.
- Alcance funcional: ventas del/al, cantidades, devoluciones, ventas netas y contexto por identidad/sucursal cuando aplique.
- Alcance tecnico: lectura de ventas, sin cambiar motor de precio.
- UI: filtros/columnas/modal.
- API: read-only agregado.
- BD/schema: no DDL LP salvo indices aprobados por ticket especifico.
- Permisos: READ LP + decision PO si ventas requiere permiso separado.
- Tenant: server-side.
- Responsive: filtros mobile.
- QA obligatoria: periodos, sin ventas, devoluciones, cross-tenant.
- Fixtures: ventas QA si existentes/reversibles.
- Cleanup: cero fixtures.
- Regresion: Ventas.
- FROZEN: no modificar venta historica.
- Fuera de alcance: consumidor de precios.
- Criterios de aceptacion: separar claramente contexto de consumo.
- Entregables: LP-19.
- Handoff: habilita LP-21.
- Evidencia LP-19D: UMBRELLA 163 fue auditada read-only sobre `DB_A883C3_CHECKLIST`; 162 objetos SQL no contienen fuente canonica de Ventas, tickets, devoluciones, pedidos o documentos de venta. `/Ventas/Nueva` y `/Ventas/Devoluciones` son placeholders MVC; Legacy no es fuente runtime e Inventario/OC/Recepcion no sustituyen Ventas.
- Reactivacion: conservar pendientes periodo Desde/Hasta, con/sin ventas, cantidad vendida, contexto por identidad y sucursal, devoluciones, detalle, filtros server-side, responsive y QA runtime hasta que el dominio Ventas certificado exponga persistencia, tenant, identidades, sucursal, fecha, cantidad, devoluciones, permisos y API/servicio.

### LP-20 - Consumidores de precios

- ID: LP-20.
- Estado: CERRADO / COTIZACIONES CONSUMIDOR REAL LP-08 CERTIFICADO.
- Nombre: Consumidores reales del motor ListaPrecios.
- Fase: E Integraciones/consumidores.
- Prioridad: P0.
- Objetivo: conectar Ventas/Cotizaciones/Pedidos/Facturacion u otros consumidores aprobados al motor estabilizado.
- Justificacion: Lista de Precios no aporta valor final si consumidores no resuelven precio vigente.
- Dependencias: LP-08 estable, LP-18 historico minimo, decisiones PO de consumidor exacto.
- Alcance funcional: resolver precio efectivo al momento correcto, snapshot historico, fallback y errores.
- Alcance tecnico: integracion server-side; no llamadas desde cliente para decidir precio.
- UI: solo consumidores afectados.
- API: servicios internos o endpoints autorizados.
- BD/schema: snapshots donde corresponda.
- Permisos: consumidores internos no dependen de permiso navegable, pero no saltan tenant/gate.
- Tenant: fail-closed.
- Responsive: N/A salvo pantallas consumidoras.
- QA obligatoria: ventas/cotizaciones/pedidos/facturacion segun autorizacion, historico no recalcula.
- Fixtures: documentos QA reversibles si dominio lo permite.
- Cleanup: cero fixtures.
- Regresion: consumidores existentes.
- FROZEN: no tocar consumidores no autorizados.
- Fuera de alcance: sugerencias.
- Criterios de aceptacion: precio aplicado/snapshot correcto y auditado.
- Entregables: LP-20.
- Handoff: habilita QA integral y analitica.

### LP-21 - Sugerencias comerciales

- ID: LP-21.
- Estado: BLOQUEADO / NO EJECUTABLE POR DEPENDENCIAS COMERCIALES Y VENTAS.
- Nombre: Sugerencias comerciales.
- Fase: F Analitica.
- Prioridad: P2.
- Objetivo: adaptar Ofertar/Resurtir/Vigilar con score y motivo sin inventar IA.
- Justificacion: PO exige sugerencias despues de fuentes confiables.
- Dependencias: LP-13, LP-18, LP-19, fuentes costo/margen/descuento/precio confiables; idealmente LP-20 si consumo afecta analitica.
- Alcance funcional: existencia, ventas, costo, margen, descuento, precio, score, accion, motivo y ver movimientos.
- Alcance tecnico: algoritmo documentado, deterministic scoring, fallback de datos incompletos.
- UI: modal/tabla CheckApp con tabs.
- API: endpoint read-only de sugerencias.
- BD/schema: no DDL salvo snapshots aprobados.
- Permisos: READ; permiso adicional si PO lo pide.
- Tenant: server-side.
- Responsive: desktop/tablet/mobile 390.
- QA obligatoria: datos completos/incompletos, scores, motivos, sin ventas, sin costo.
- Fixtures: dataset analitico reversible.
- Cleanup: cero fixtures.
- Regresion: no bloquear LP operativo.
- FROZEN: no IA generativa ni acciones automaticas de compra/precio.
- Fuera de alcance: aplicar automaticamente sugerencias.
- Criterios de aceptacion: sugerencias explicables y trazables.
- Entregables: LP-21.
- Handoff: LP-22.

### LP-22 - QA integral y certificacion final

- ID: LP-22.
- Estado: CERRADO / CERTIFICADO / APROBADO PO / FROZEN.
- Nombre: Certificacion final consola Lista de Precios.
- Fase: G Certificacion final.
- Prioridad: P0.
- Objetivo: certificar extremo a extremo la consola operativa.
- Justificacion: el modulo toca precio, consumidores, inventario, ventas y operaciones masivas.
- Dependencias: LP-06..LP-21 segun alcance aprobado.
- Alcance funcional: checklist completo LP-BACKLOG-R1.
- Alcance tecnico: suites, SQL real, visual runtime, permisos, tenant, cleanup, regression.
- UI: desktop/tablet/mobile 390.
- API: smoke y regression.
- BD/schema: drift/gate compatible.
- Permisos: NOACCESS/READ/WRITE/ADMINONLY.
- Tenant: cross-tenant fail-closed.
- Responsive: obligatorio.
- QA obligatoria: full suite, builds, node, diff, secret scan, Excel fisico, fixtures cleanup 0.
- Fixtures: todos reversibles.
- Cleanup: BD/files/procesos temporales.
- Regresion: ProductosServicios, Inventario, Sucursales, Curvas, OC, Recepcion, Ventas, Cotizaciones, Pedidos, Facturacion, Auth.
- FROZEN: Legacy y dominios no autorizados.
- Fuera de alcance: nuevos features.
- Criterios de aceptacion: cierre PO sin residuos, sin tickets futuros ejecutados.
- Entregables: informe LP-22.
- Handoff: cierre final/revision PO.

## 8. Matriz de cobertura obligatoria

| Item | Ticket/dependencia |
|---|---|
| Precio Lista | LP-06, LP-07, LP-08, LP-09 |
| Fallback | LP-06, LP-08, LP-20 |
| Producto | LP-06..LP-09 |
| Servicio | LP-06..LP-09 |
| Variante | LP-06..LP-09 |
| PresentacionVenta | LP-06..LP-09 |
| Lista 1..10 | LP-06..LP-09, LP-15 |
| Descuento | LP-06..LP-09, LP-14..LP-16 |
| Precio final | LP-06..LP-09 |
| Redondeo | LP-06..LP-09 |
| Promociones | LP-06, LP-07, LP-08, LP-09 futuro |
| Edicion individual | LP-09 |
| Filtros avanzados | LP-10 |
| Fotografias | LP-11 |
| Existencias | LP-13 |
| Movimientos | LP-13 |
| Sucursales | LP-13 |
| Ventas como contexto | LP-19 |
| Ajuste masivo | LP-14 |
| Copiar lista | LP-15 |
| Descuento por marca | LP-16 |
| Excel | LP-17 |
| Historico/auditoria | LP-18 |
| Consumidores | LP-20 |
| Sugerencias comerciales | LP-21 |
| Roles/permisos | LP-04 historico, LP-09/14/15/16/22 |
| Tenant | LP-07, LP-08, todos los tickets API/UI |
| Responsive | LP-09..LP-17, LP-21, LP-22 |
| QA | Cada ticket + LP-22 |
| Cleanup | Cada ticket con fixtures + LP-22 |
| Regresion | Cada ticket + LP-22 |

## 9. Estado de cierre

Backlog completo: SI.  
LP-06 no ejecutado.  
Codigo productivo modificado: NO.  
BD/DDL: NO.  
Legacy modificado: NO.

## 10. Estado pre-handoff LP-09

Actualizacion documental LP-08C del 2026-09-30. No renumera tickets, no ejecuta LP-09, no modifica codigo productivo, no ejecuta SQL/DDL/fixtures/runtime.

| Ticket | Estado |
|---|---|
| LP-01 | CERRADO |
| LP-02 | CERRADO |
| LP-03 | CERRADO |
| LP-04 | CERRADO |
| LP-05 | CERRADO |
| LP-06 | CERRADO |
| LP-07 | CERRADO |
| LP-08 | CERRADO |

Siguiente ticket: `LP-09 - EDICION INDIVIDUAL OPERATIVA`.

Regla de handoff: `LP-09` queda pendiente de revision PO y no ejecutado desde LP-08C.

## 11. Estado consolidado post LP-20D3

Actualizacion documental LP-20E del 2026-10-01. No renumera tickets y no ejecuta LP-21 ni LP-22.

| Ticket | Estado vigente |
|---|---|
| LP-01..LP-18 | CERRADOS |
| LP-19 | BLOQUEADO EXTERNO / DOMINIO VENTAS |
| LP-20 | CERRADO / COTIZACIONES CONSUMIDOR REAL LP-08 CERTIFICADO |
| LP-21 | BLOQUEADO / NO EJECUTABLE POR DEPENDENCIAS COMERCIALES Y VENTAS |
| LP-22 | CERRADO / CERTIFICADO / APROBADO PO / FROZEN |

Cotizaciones es el unico consumidor real certificado por LP-20. Ventas y Facturacion permanecen PLACEHOLDER; Pedidos no existe como dominio CheckApp. No se inventan consumidores adicionales.

Siguiente paso: revision PO pre-LP-22. No ejecutar LP-21 ni LP-22.

## 12. Cierre PO definitivo Lista de Precios

Actualizacion documental LP-CLOSE del 2026-10-01. LP-22 fue APROBADO por PO.

`LISTA DE PRECIOS CHECKAPP = CERRADA / CERTIFICADA / APROBADA PO / FROZEN`.

- Alcance certificado: LP-01..LP-18, LP-20 y LP-22 cerrados; consola operativa PASS; Cotizaciones consumidor LP-08 PASS; QA integral y regresion 772/772 PASS; cleanup 0; datos legitimos modificados 0.
- LP-19 permanece BLOQUEADO por dominio Ventas inexistente. LP-21 permanece BLOQUEADO por dependencias comerciales y Ventas. Ambos son dependencias externas y no impiden el cierre del modulo actual.
- Exclusiones documentadas, no defectos: 2x1, 3x2, descuento de segundo articulo, monedero, Ventas, Pedidos, Facturacion y sugerencias LP-21.
- FROZEN: schema V2, motor LP-08, edicion, filtros, fotografias, DynamicGrid, inventario/movimientos, ajuste masivo, copiar lista, descuento por marca, Excel, historico, Cotizaciones LP-08, PRE_LP08, tenant/gates y permisos.
- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js` permanecen NUNCA TOCAR; Auth y Legacy preservados.
- Cualquier cambio futuro sobre funcionalidad certificada requiere nuevo alcance/ticket y analisis de regresion antes de modificar lo FROZEN.
- LP-CLOSE modifico codigo productivo 0 archivos; SQL/DDL/QA adicional: NO.
