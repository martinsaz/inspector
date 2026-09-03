# Backlog Maestro CheckApp Comercial V4

Fecha: 2026-08-31  
Estado: backlog vigente propuesto para aprobacion PO. Sustituye V2 y V3 como instrumento de ejecucion una vez aprobado.  
Alcance: documentacion y planificacion. No implementa codigo, SQL, tablas, migraciones ni ejecucion de sprints.

## Regla de verdad V4

| Dominio | Verdad confirmada |
|---|---|
| ProductosServicios | IMPLEMENTADO / BASE ACTUAL. Incluye producto, servicio, catalogos, codigos, configuracion comercial, SAT, atributos, variantes, costo/precio/imagen por variante, tags, multimedia, paquetes, pesos logisticos, ficha tecnica y PDF. No reconstruir. |
| Ordenes de Compra | IMPLEMENTADA Y APROVECHABLE. Conservar MVC, JS, API, DTOs, PDF, Excel, `OrdenesCompraFolios`, `OrdenesCompra`, `OrdenesCompraDetalle`. No depende de tablas NEXT. |
| Recepcion | NO EXISTE. Debe construirse como modulo nuevo asociado a OC. |
| Inventario | IMPLEMENTADO por `empresa + producto`. Gap estructural: falta `empresa + producto + variante`, recepcion documental, comprometido, disponible comercial, salida por venta y reingreso por devolucion. |
| Cotizaciones | NO DEMOSTRABLE COMO VERTICAL AUTORIZADO. Requiere decision PO y auditoria puntual antes de conservar, migrar o reconstruir. |
| Pedido | NO EXISTE. |
| Venta | NO EXISTE FUNCIONALMENTE. Existe placeholder. |
| Cobro | NO EXISTE. |
| Devoluciones | NO EXISTE FUNCIONALMENTE. Existe placeholder. |
| Formas de pago | NO EXISTE FUNCIONALMENTE. Existe placeholder. |
| Ajustes PV | NO EXISTE FUNCIONALMENTE. Existe placeholder. |
| Usuarios comerciales | NO MATERIALIZADO. Usar arquitectura actual: Usuario = identidad, Rol = autorizacion, Permiso = capacidad, Operador = identidad operativa existente fuera del comercial. No crear todavia tabla `TipoUsuario`. |

## Proceso comercial objetivo

`ProductosServicios -> OC -> Recepcion -> Existencias -> Cotizacion -> Pedido -> Surtimiento -> Venta -> Cobro -> Ticket/Documento -> Devolucion -> Nota de Credito/Vale -> Nueva Venta/Aplicacion`

Transversal: `Usuarios`, `Roles`, `Permisos`, `Sucursales`, `Cajas`, `Formas de Pago`, `Ajustes PV`, `Trazabilidad`, `Reportes`.

## Diagrama de dependencias

```text
S0 Documentacion y verdad
        |
        v
S1 Inventario por variante
        |
        v
S2 OC + Recepcion
        |
        v
S3 Cotizaciones
        |
        v
S4 Pedido
        |
        v
S5 Usuarios/Capacidades
        |
        v
S6 Pagos/Caja/Ajustes
        |
        v
S7 Venta/Cobro
        |
        v
S8 Postventa
        |
        v
S9 Reportes/Cierre
```

Cuestionamiento tecnico del orden: S5 debe cerrar antes de S7 porque venta/cobro necesita vendedor, cajero, autorizador, surtidor y permisos. S6 tambien debe cerrar antes de S7 porque cobro depende de formas de pago, caja y ajustes PV. S3 puede iniciar su auditoria puntual despues de S0, pero su implementacion comercial no debe avanzar sin S1 porque necesita variante/existencia/disponible.

## Convenciones

Prioridad: `P0 BLOQUEANTE`, `P1 ALTA`, `P2 MEDIA`, `P3 BAJA`.  
Tipo: `FUNDACION`, `CORE`, `OPERACION`, `POSTVENTA`, `TRANSVERSAL`, `DOCUMENTACION`.  
Marca `[DECISION PO]` cuando la regla no debe resolverse por Codex.

---

# S0 - Documentacion y verdad del proyecto

Objetivo: corregir la verdad oficial del proyecto y dejar una base documental sin clasificacion incorrecta de OC.  
Dependencia: auditorias V3 y auditoria puntual OC.  
Fuera de alcance: codigo, SQL, migraciones, cambios funcionales.  
Reglas de negocio: ninguna regla comercial se considera implementada por documentarla.  
Gate QA: lectura cruzada de auditoria, backlog, AGENTS y CLAUDE sin contradicciones sobre OC, recepcion, inventario, cotizaciones, pedido, venta y usuarios.  
Decisiones PO pendientes: aprobacion formal de V4 como backlog vigente.

## Tickets S0

### COMV4-001 - Oficializar verdad comercial V4

- Prioridad: P0 BLOQUEANTE; Tipo: DOCUMENTACION.
- Objetivo: declarar V4 como backlog vigente y sustituir V2/V3 como guia de ejecucion.
- Estado actual: V2 y V3 existen; V3 quedo parcialmente desactualizada por la auditoria puntual de OC.
- Cambio requerido: agregar nota de vigencia V4 y congelar V2/V3 como historicos.
- Backend: no aplica.
- Frontend: no aplica.
- SQL: no aplica.
- Dependencias: auditoria puntual OC, auditoria V3.
- Reglas: OC se reconoce como implementada y aprovechable; Cotizaciones no se reconoce sin auditoria puntual.
- Criterios de aceptacion: documento V4 localizado, fechado y con dictamen claro; V2/V3 no se usan como backlog vigente.
- QA: revision manual de encabezados, matriz de verdad y diagrama.
- Riesgos: documentos viejos usados por error.
- Decisiones PO: [DECISION PO] aprobar V4 como backlog rector.

### COMV4-002 - Corregir auditoria V3 por nueva verdad de OC

- Prioridad: P0 BLOQUEANTE; Tipo: DOCUMENTACION.
- Objetivo: actualizar `AUDITORIA_MAESTRA_COMERCIAL_V3_REAL.md` para reflejar OC implementada/aprovechable.
- Estado actual: V3 clasifica OC como no demostrable por falta de autorizacion previa.
- Cambio requerido: ajustar Fase 0, Fase 2, matriz de verdad y contaminacion V2 con la conclusion confirmada: OC no depende de NEXT.
- Backend: no aplica.
- Frontend: no aplica.
- SQL: no aplica.
- Dependencias: COMV4-001.
- Reglas: recepcion sigue no existente; inventario sigue por producto; OC no recibe ni mueve stock.
- Criterios de aceptacion: V3 ya no contradice V4 respecto a OC.
- QA: busqueda textual de frases `OC NEXT no autorizado` o `OC actual: NO DEMOSTRABLE` y sustitucion contextual.
- Riesgos: sobrecorregir y declarar impuestos/recepcion como existentes.
- Decisiones PO: ninguna si V4 se aprueba.

### COMV4-003 - Corregir backlog V3 y referencias contaminadas

- Prioridad: P0 BLOQUEANTE; Tipo: DOCUMENTACION.
- Objetivo: actualizar `BACKLOG_MAESTRO_CHECKAPP_COMERCIAL_V3.md` y referencias documentales que empujen reconstruccion de OC.
- Estado actual: COMV3-001/010 hablan de construir o reconstruir OC.
- Cambio requerido: marcar V3 como historico y redirigir a evolucion de OC existente.
- Backend: no aplica.
- Frontend: no aplica.
- SQL: no aplica.
- Dependencias: COMV4-001, COMV4-002.
- Reglas: no reconstruir `OrdenesCompraFolios`, `OrdenesCompra`, `OrdenesCompraDetalle`.
- Criterios de aceptacion: backlog vigente apunta a V4; V3 no se interpreta como orden de implementacion.
- QA: revision manual de links y terminos.
- Riesgos: doble fuente de verdad.
- Decisiones PO: ninguna si V4 se aprueba.

### COMV4-004 - Actualizar AGENTS y CLAUDE con guardrails comerciales

- Prioridad: P1 ALTA; Tipo: DOCUMENTACION.
- Objetivo: registrar reglas de trabajo para futuros tickets comerciales.
- Estado actual: AGENTS/CLAUDE contienen cierres de ProductosServicios, pero no necesariamente la verdad OC V4.
- Cambio requerido: agregar guardrails: no reconstruir P&S, evolucionar OC, no usar NEXT para Cotizaciones sin auditoria, no ejecutar SQL sin ticket.
- Backend: no aplica.
- Frontend: no aplica.
- SQL: no aplica.
- Dependencias: COMV4-001.
- Reglas: todo ticket COMV4 debe citar dependencia y alcance.
- Criterios de aceptacion: futuras tareas encuentran rapidamente la verdad comercial.
- QA: lectura de ambos archivos y busqueda de contradicciones.
- Riesgos: instrucciones duplicadas o ambiguas.
- Decisiones PO: [DECISION PO] validar lenguaje final de guardrails.

### COMV4-005 - Mapa de documentos congelados y vigentes

- Prioridad: P2 MEDIA; Tipo: DOCUMENTACION.
- Objetivo: listar documentos vigentes, historicos y de referencia legacy.
- Estado actual: existen multiples docs de auditoria y backlog.
- Cambio requerido: crear indice documental comercial con vigencia.
- Backend: no aplica.
- Frontend: no aplica.
- SQL: no aplica.
- Dependencias: COMV4-001 a COMV4-004.
- Reglas: Legacy es referencia funcional, no base tecnica.
- Criterios de aceptacion: cualquier ticket futuro sabe que documentos puede usar.
- QA: validar rutas reales y estado de cada documento.
- Riesgos: omitir docs que contengan reglas utiles.
- Decisiones PO: ninguna.

---

# S1 - Inventario por variante

Objetivo: evolucionar el modelo de inventario desde `empresa + producto` hacia `empresa + producto + variante nullable`, conservando productos simples e historicos.  
Dependencia: S0.  
Fuera de alcance: Pedido, venta, cobro, recepcion OC funcional, migracion automatica irreversible.  
Reglas de negocio: producto sin variantes usa `idVariante NULL`; producto con variantes usa saldo separado por variante; no mezclar saldos de variantes.  
Gate QA: producto simple, producto con una variante, producto con multiples variantes, historico con saldo, movimiento por variante y reportes de conciliacion.  
Decisiones PO pendientes: inventario por sucursal ahora o despues, costo promedio, politica de conciliacion para saldos multi-variante.

## Tickets S1

### COMV4-010 - Auditoria final de saldo actual

- Prioridad: P0 BLOQUEANTE; Tipo: FUNDACION.
- Objetivo: inventariar saldos actuales por producto antes de disenar migracion.
- Estado actual: `ProductosServiciosExistencias` tiene una fila unica por `idEmpresa + idProductoServicio`.
- Cambio requerido: reporte de productos con existencia, minima, costo promedio, variantes activas y movimientos.
- Backend: endpoint/reporteria de solo lectura si se implementa despues.
- Frontend: vista o exportable de auditoria si se implementa despues.
- SQL: SELECT solamente durante auditoria autorizada; sin updates.
- Dependencias: COMV4-001.
- Reglas: no repartir saldo automaticamente.
- Criterios de aceptacion: clasificacion por producto sin variantes, una variante, multiples variantes, sin movimientos y con movimientos.
- QA: muestreo manual contra tablas actuales.
- Riesgos: datos historicos incompletos.
- Decisiones PO: [DECISION PO] aprobar acceso y formato de auditoria.

### COMV4-011 - Modelo de existencia por variante nullable

- Prioridad: P0 BLOQUEANTE; Tipo: FUNDACION.
- Objetivo: definir extension minima de `ProductosServiciosExistencias` con `idVariante NULL`.
- Estado actual: llave unica por producto.
- Cambio requerido: nueva llave logica `idEmpresa + idProductoServicio + idVariante`.
- Backend: actualizar consultas de existencia para aceptar variante.
- Frontend: mostrar existencia por variante cuando aplique.
- SQL: agregar `idVariante NULL`, FK recomendada a variantes, indices filtrados/compuestos.
- Dependencias: COMV4-010.
- Reglas: `NULL` significa producto simple; variante no nula debe pertenecer al producto.
- Criterios de aceptacion: no se mezcla saldo 946 ml con 5 L.
- QA: alta/consulta de saldos separados.
- Riesgos: unicidad con NULL en SQL Server y compatibilidad de consultas actuales.
- Decisiones PO: ninguna tecnica; requiere aprobacion de modelo.

### COMV4-012 - Movimientos de inventario por variante

- Prioridad: P0 BLOQUEANTE; Tipo: FUNDACION.
- Objetivo: extender `ProductosServiciosMovimientosInventario` para registrar variante y documento origen.
- Estado actual: movimiento guarda producto, tipo, cantidad, existencia anterior/posterior, costo, referencia, usuario.
- Cambio requerido: `idVariante NULL`, `idSucursal NULL`, `TipoDocumentoOrigen`, `idDocumentoOrigen`, `idDocumentoOrigenDetalle`.
- Backend: adaptar insert/consulta de movimientos.
- Frontend: mostrar variante y origen documental.
- SQL: columnas nuevas e indices por producto/variante/fecha y origen idempotente.
- Dependencias: COMV4-011.
- Reglas: todo movimiento de producto con variantes requiere `idVariante`.
- Criterios de aceptacion: movimientos consultables por variante.
- QA: movimiento manual de producto simple y producto con variante.
- Riesgos: movimientos historicos sin variante deben seguir leyendo.
- Decisiones PO: [DECISION PO] tipos de movimiento definitivos.

### COMV4-013 - Compatibilidad historica de inventario

- Prioridad: P0 BLOQUEANTE; Tipo: FUNDACION.
- Objetivo: definir estrategia de migracion segura sin ejecutar cambios.
- Estado actual: saldos historicos estan a nivel producto.
- Cambio requerido: clasificacion y plan de conciliacion.
- Backend: rutinas de lectura que soporten saldos historicos.
- Frontend: indicador de saldo pendiente de conciliacion si aplica.
- SQL: script futuro de migracion reversible o por lotes autorizados.
- Dependencias: COMV4-010, COMV4-011.
- Reglas: productos con multiples variantes no se reparten sin evidencia.
- Criterios de aceptacion: matriz de casos aprobada.
- QA: casos sin variante, una variante, multiples variantes, saldo cero y movimientos.
- Riesgos: decisiones manuales lentas.
- Decisiones PO: [DECISION PO] que hacer con saldo multi-variante sin evidencia.

### COMV4-014 - Conciliacion operativa de productos multi-variante

- Prioridad: P1 ALTA; Tipo: OPERACION.
- Objetivo: permitir resolver saldos existentes cuando un producto tiene multiples variantes.
- Estado actual: no hay flujo para asignar saldo antiguo a variantes.
- Cambio requerido: proceso manual con evidencia, usuario, fecha y observacion.
- Backend: preparar endpoint de conciliacion futuro.
- Frontend: pantalla/listado de conciliacion futuro.
- SQL: tabla o movimiento de conciliacion segun modelo aprobado.
- Dependencias: COMV4-013.
- Reglas: cada asignacion debe cuadrar contra saldo original.
- Criterios de aceptacion: suma asignada por variantes coincide con saldo conciliado.
- QA: producto con 946 ml y 5 L conciliado sin perdida.
- Riesgos: errores humanos de asignacion.
- Decisiones PO: [DECISION PO] perfil autorizado para conciliar.

### COMV4-015 - Preparacion de comprometido y disponible

- Prioridad: P1 ALTA; Tipo: FUNDACION.
- Objetivo: preparar calculo futuro de `Fisica`, `Comprometida` y `Disponible`.
- Estado actual: solo existencia fisica/minima; no existe Pedido.
- Cambio requerido: documentar formula y dejar consultas listas para futuro.
- Backend: no inventar comprometido persistido hasta Pedido.
- Frontend: si se muestra disponible antes de Pedido, debe ser igual a fisica y etiquetado.
- SQL: sin columna comprometida hasta S4 salvo decision PO.
- Dependencias: COMV4-011.
- Reglas: `Disponible = Fisica` mientras no exista compromiso.
- Criterios de aceptacion: no hay falso comprometido.
- QA: validar producto con y sin variante.
- Riesgos: usuarios interpreten disponible como reserva real antes de Pedido.
- Decisiones PO: [DECISION PO] persistir comprometido o calcularlo desde documentos.

### COMV4-016 - Preparacion para sucursal

- Prioridad: P2 MEDIA; Tipo: FUNDACION.
- Objetivo: decidir si saldos se separan por sucursal ahora o despues.
- Estado actual: inventario no tiene sucursal; OC si la tiene en cabecera.
- Cambio requerido: decision de llave futura: empresa/producto/variante o empresa/sucursal/producto/variante.
- Backend: disenar servicios con parametro `idSucursal` nullable.
- Frontend: mostrar sucursal cuando aplique.
- SQL: no aplicar hasta decision.
- Dependencias: COMV4-011.
- Reglas: recepcion debe registrar sucursal aunque saldo no se separe todavia.
- Criterios de aceptacion: decision documentada sin ambiguedad.
- QA: prueba conceptual con dos sucursales.
- Riesgos: migracion doble si se posterga.
- Decisiones PO: [DECISION PO] inventario por sucursal ahora o despues.

---

# S2 - Evolucion de OC + Recepcion

Objetivo: evolucionar OC existente y construir recepcion nueva para conectar compra con inventario.  
Dependencia: S1.  
Fuera de alcance: reconstruir OC, usar NEXT, Pedido, Venta, Cobro.  
Reglas de negocio: OC no incrementa inventario; solo recepcion confirmada genera movimiento y existencia; recepcion debe ser idempotente.  
Gate QA: `OC 10 -> recibo 4 -> pendiente 6 -> recibo 6 -> completa`, producto simple, variante A, variante B, PDF/Excel con variante, reintento sin duplicar stock.  
Decisiones PO pendientes: impuestos OC, fechas minima/maxima, cancelacion/reversion de recepcion.

## Tickets S2

### COMV4-020 - Agregar variante nullable a OC Detalle

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: extender `OrdenesCompraDetalle` sin reconstruir tablas.
- Estado actual: detalle guarda `idProductoServicio` sin `idVariante`.
- Cambio requerido: `idVariante NULL` y snapshot de variante.
- Backend: DTOs, validacion y persistencia con variante.
- Frontend: modelo JS de partida con variante.
- SQL: ALTER TABLE e indices compatibles.
- Dependencias: COMV4-011, COMV4-012.
- Reglas: producto con variantes no puede guardarse sin variante; producto sin variantes debe guardar NULL.
- Criterios de aceptacion: misma OC puede incluir variante A y B del mismo producto.
- QA: guardar, editar, generar y consultar OC.
- Riesgos: indice unico actual por producto bloquea variantes multiples.
- Decisiones PO: ninguna.

### COMV4-021 - Selector de variante en partidas OC

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: permitir seleccionar variante de forma entendible.
- Estado actual: buscador agrega producto directamente.
- Cambio requerido: si producto tiene variantes, exigir seleccion de variante.
- Backend: buscador debe devolver bandera y lista/endpoint de variantes activas.
- Frontend: UI de variante en partida.
- SQL: consulta a `ProductosServiciosVariantes`.
- Dependencias: COMV4-020.
- Reglas: descripcion visible `Producto - Variante`.
- Criterios de aceptacion: no se guarda producto con variantes sin seleccion.
- QA: producto sin variantes fluye igual; producto con variantes exige selector.
- Riesgos: UX lenta si hay muchas variantes.
- Decisiones PO: [DECISION PO] formato final de nombre de variante.

### COMV4-022 - Snapshot comercial de variante en OC

- Prioridad: P1 ALTA; Tipo: CORE.
- Objetivo: conservar nombre, SKU y combinacion de variante al guardar OC.
- Estado actual: snapshot solo producto/unidad/costo.
- Cambio requerido: snapshot variante para historial, PDF y Excel.
- Backend: mapear variante al persistir y consultar.
- Frontend: renderizar snapshot aunque variante cambie despues.
- SQL: columnas snapshot en detalle.
- Dependencias: COMV4-020.
- Reglas: documentos historicos no cambian por edicion posterior de variante.
- Criterios de aceptacion: cambiar nombre de variante no altera OC generada.
- QA: prueba antes/despues de editar variante.
- Riesgos: duplicacion necesaria de datos.
- Decisiones PO: ninguna.

### COMV4-023 - PDF y Excel OC con variante

- Prioridad: P1 ALTA; Tipo: OPERACION.
- Objetivo: reflejar variante en documentos existentes.
- Estado actual: PDF/Excel listan producto sin variante.
- Cambio requerido: columna o subtitulo de variante.
- Backend: DTO documental con variante.
- Frontend: botones actuales se conservan.
- SQL: consulta detalle con snapshot variante.
- Dependencias: COMV4-022.
- Reglas: producto simple no muestra variante vacia de forma ruidosa.
- Criterios de aceptacion: PDF y Excel distinguen 946 ml vs 5 L.
- QA: exportacion visual y datos.
- Riesgos: ajuste de layout PDF.
- Decisiones PO: [DECISION PO] etiqueta final en documentos.

### COMV4-024 - Cerrar gaps parciales de OC

- Prioridad: P2 MEDIA; Tipo: OPERACION.
- Objetivo: resolver fechas minima/maxima e impuestos si aplican.
- Estado actual: UI tiene fechas minima/maxima parciales; OC no maneja impuestos.
- Cambio requerido: decidir reglas y completar persistencia/validacion si se aprueba.
- Backend: campos/reglas segun decision.
- Frontend: validaciones visibles.
- SQL: columnas solo si PO aprueba.
- Dependencias: COMV4-020.
- Reglas: no inventar impuestos si no hay definicion fiscal.
- Criterios de aceptacion: regla documentada y probada.
- QA: fechas limite, subtotal/total, impuestos si existen.
- Riesgos: alcance fiscal crece.
- Decisiones PO: [DECISION PO] impuestos OC; [DECISION PO] fecha minima/maxima.

### COMV4-025 - Modelo de Recepcion OC

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: crear entidad nueva de recepcion asociada a OC.
- Estado actual: recepcion no existe.
- Cambio requerido: cabecera y detalle de recepcion.
- Backend: API de alta, consulta, confirmacion y cancelacion segun reglas.
- Frontend: pantalla nueva de recepcion desde OC.
- SQL: tablas nuevas `OrdenesCompraRecepciones` y `OrdenesCompraRecepcionDetalle`.
- Dependencias: COMV4-020.
- Reglas: solo OC generada puede recibirse; no exceder pendiente.
- Criterios de aceptacion: recepcion total y parcial capturada.
- QA: OC 10, recibo 4, pendiente 6.
- Riesgos: estados de OC insuficientes para parcial/completa.
- Decisiones PO: [DECISION PO] estados finales de recepcion y OC recibida.

### COMV4-026 - Recepciones multiples y acumulados

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: soportar varias recepciones para una misma OC.
- Estado actual: no hay recibido acumulado ni pendiente.
- Cambio requerido: calculos por partida y por documento.
- Backend: consultas de ordenado, recibido acumulado, pendiente.
- Frontend: mostrar historial de recepciones y pendientes.
- SQL: indices por OC y detalle.
- Dependencias: COMV4-025.
- Reglas: acumulado no puede superar cantidad ordenada.
- Criterios de aceptacion: segundo recibo completa pendiente exacto.
- QA: parcial, segunda parcial, intento excedente.
- Riesgos: concurrencia de dos usuarios recibiendo.
- Decisiones PO: [DECISION PO] tolerancias por sobre-recepcion.

### COMV4-027 - Movimiento idempotente desde recepcion

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: confirmar recepcion y actualizar inventario una sola vez.
- Estado actual: OC no mueve inventario.
- Cambio requerido: transaccion recepcion -> movimiento -> existencia.
- Backend: servicio idempotente con origen documental unico.
- Frontend: boton confirmar con estado de proceso.
- SQL: indice unico por origen documental en movimientos.
- Dependencias: COMV4-012, COMV4-025, COMV4-026.
- Reglas: refrescar o reintentar no duplica existencia.
- Criterios de aceptacion: doble click/reintento conserva un solo movimiento.
- QA: reintento controlado y revision de saldo.
- Riesgos: fallos parciales si no se transacciona completo.
- Decisiones PO: ninguna tecnica.

### COMV4-028 - Cancelacion o reversion de recepcion

- Prioridad: P1 ALTA; Tipo: OPERACION.
- Objetivo: definir e implementar correccion de recepcion confirmada.
- Estado actual: no existe recepcion ni reversa.
- Cambio requerido: reglas para cancelar, reversar o ajustar.
- Backend: endpoint de cancelacion/reversa segun PO.
- Frontend: accion condicionada por permisos.
- SQL: movimiento inverso o estado cancelado segun regla.
- Dependencias: COMV4-027.
- Reglas: no borrar movimientos confirmados; dejar trazabilidad.
- Criterios de aceptacion: error de recepcion puede corregirse sin perder auditoria.
- QA: recepcion confirmada, reversa, saldo final.
- Riesgos: inventario ya consumido por venta futura.
- Decisiones PO: [DECISION PO] cancelacion/reversion segun etapa.

---

# S3 - Cotizaciones

Objetivo: decidir y despues construir/evolucionar Cotizaciones con base autorizada.  
Dependencia: S0 para auditoria; S1 para implementacion de variante/existencia.  
Fuera de alcance: asumir NEXT como autorizado, convertir a Pedido sin decision, reconstruir automaticamente.  
Reglas de negocio: primer ticket obligatorio es auditoria puntual; resultado puede ser A/B/C/D.  
Gate QA: producto simple, variante, servicio, flete, concepto pendiente, PDF/correo/WhatsApp segun decision.  
Decisiones PO pendientes: conservar, migrar o reconstruir Cotizaciones; venta sin existencia; instalacion; flete parcial.

## Tickets S3

### COMV4-030 - Auditoria puntual de Cotizaciones existentes

- Prioridad: P0 BLOQUEANTE; Tipo: FUNDACION.
- Objetivo: auditar Cotizaciones igual que OC.
- Estado actual: no demostrable como vertical autorizado.
- Cambio requerido: clasificar A aprovechable, B aprovechable con migracion, C no aprovechable, D no demostrable.
- Backend: revision controladores/API/modelos/scripts.
- Frontend: revision rutas/vistas/JS si hay sesion.
- SQL: solo lectura si se autoriza.
- Dependencias: COMV4-001.
- Reglas: no adoptar NEXT por existir.
- Criterios de aceptacion: dictamen con tablas, rutas, dependencias y gaps.
- QA: trazabilidad de fuentes.
- Riesgos: aprobaciones puntuales confundidas con vertical completo.
- Decisiones PO: [DECISION PO] resultado habilita camino.

### COMV4-031 - Decision PO de estrategia Cotizaciones

- Prioridad: P0 BLOQUEANTE; Tipo: FUNDACION.
- Objetivo: elegir conservar, migrar o reconstruir tras auditoria.
- Estado actual: pendiente.
- Cambio requerido: acta breve con decision y alcance.
- Backend: segun camino.
- Frontend: segun camino.
- SQL: segun camino.
- Dependencias: COMV4-030.
- Reglas: ningun desarrollo de Cotizaciones inicia sin decision.
- Criterios de aceptacion: decision firmada en backlog/doc.
- QA: validar que tickets siguientes apunten al camino elegido.
- Riesgos: iniciar sobre base incorrecta.
- Decisiones PO: [DECISION PO] conservar/migrar/reconstruir.

### COMV4-032 - Partidas de cotizacion con producto, variante y servicio

- Prioridad: P1 ALTA; Tipo: CORE.
- Objetivo: cotizar producto simple, variante y servicio.
- Estado actual: sujeto a auditoria.
- Cambio requerido: partida con snapshot comercial completo.
- Backend: modelos y validaciones.
- Frontend: selector producto/variante/servicio.
- SQL: tablas nuevas o existentes segun COMV4-031.
- Dependencias: COMV4-031, COMV4-011.
- Reglas: producto con variantes exige variante.
- Criterios de aceptacion: cotizacion mixta guarda correctamente.
- QA: simple, variante, servicio.
- Riesgos: acoplarse a modelo no autorizado.
- Decisiones PO: ninguna despues de COMV4-031.

### COMV4-033 - Existencia fisica/disponible informativa en Cotizacion

- Prioridad: P1 ALTA; Tipo: CORE.
- Objetivo: mostrar stock util sin comprometer inventario todavia.
- Estado actual: comprometido no existe hasta Pedido.
- Cambio requerido: leer fisica por producto/variante y mostrar disponible segun etapa.
- Backend: consulta de existencia.
- Frontend: indicador en partida.
- SQL: no nueva persistencia salvo cache aprobada.
- Dependencias: COMV4-032, COMV4-015.
- Reglas: antes de Pedido, disponible es informativo.
- Criterios de aceptacion: cotizar stock 0 con regla clara.
- QA: variante con y sin existencia.
- Riesgos: usuario interprete cotizacion como reserva.
- Decisiones PO: [DECISION PO] venta/cotizacion sin existencia.

### COMV4-034 - Instalacion, operador sugerido y observaciones

- Prioridad: P2 MEDIA; Tipo: OPERACION.
- Objetivo: soportar servicios con fecha/observaciones y operador sugerido.
- Estado actual: no autorizado en vertical vigente.
- Cambio requerido: campos de servicio en cotizacion.
- Backend: persistencia/DTO.
- Frontend: captura por partida de servicio.
- SQL: columnas/tablas segun modelo.
- Dependencias: COMV4-032, S5 para capacidades finales.
- Reglas: operador sugerido no equivale a ejecucion del servicio.
- Criterios de aceptacion: servicio cotizado con fecha y observaciones.
- QA: solo servicio y producto+servicio.
- Riesgos: confundir surtido con ejecucion.
- Decisiones PO: [DECISION PO] servicio surtido vs ejecutado; asistencia obligatoria.

### COMV4-035 - Flete y concepto pendiente de catalogo

- Prioridad: P2 MEDIA; Tipo: OPERACION.
- Objetivo: permitir flete y conceptos pendientes sin romper catalogo.
- Estado actual: no existe regla vigente.
- Cambio requerido: flete explicito y concepto pendiente resoluble antes de Pedido.
- Backend: tipos de partida/reglas.
- Frontend: captura y alertas.
- SQL: segun modelo de Cotizaciones.
- Dependencias: COMV4-032.
- Reglas: concepto pendiente no debe convertirse a Pedido sin resolucion si PO lo exige.
- Criterios de aceptacion: PDF muestra flete y pendiente.
- QA: cotizacion con producto+flete+pendiente.
- Riesgos: crear productos basura por prisa operativa.
- Decisiones PO: [DECISION PO] flete parcial; regla de resolucion de pendientes.

---

# S4 - Pedido

Objetivo: crear Pedido como entidad comercial y punto de compromiso/surtimiento.  
Dependencia: S3 implementado; S1 para inventario por variante.  
Fuera de alcance: venta/cobro, devolucion, caja.  
Reglas de negocio: Pedido nace preferentemente desde Cotizacion autorizada; conversion debe ser idempotente; compromiso inicia aqui.  
Gate QA: cotizacion autorizada a pedido, compromiso por variante, cancelacion libera compromiso, surtimiento parcial.  
Decisiones PO pendientes: estados finales, venta libre vs desde Pedido.

## Tickets S4

### COMV4-040 - Modelo Pedido y PedidoDetalle

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: crear entidad Pedido con detalle comercial.
- Estado actual: Pedido no existe.
- Cambio requerido: cabecera, detalle, estados y snapshots.
- Backend: API CRUD/control de estado.
- Frontend: vista de Pedido y detalle.
- SQL: tablas nuevas de Pedido.
- Dependencias: COMV4-031 a COMV4-033.
- Reglas: detalle conserva producto, variante, servicio, flete y origen.
- Criterios de aceptacion: pedido consultable y trazable.
- QA: pedido mixto.
- Riesgos: disenar sin Cotizacion definida.
- Decisiones PO: [DECISION PO] estados finales: Pendiente, Parcial, Surtido, Cancelado u otros.

### COMV4-041 - Conversion Cotizacion a Pedido idempotente

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: crear Pedido desde Cotizacion autorizada una sola vez.
- Estado actual: conversion no existe.
- Cambio requerido: origen documental unico.
- Backend: endpoint convertir con idempotencia.
- Frontend: accion desde Cotizacion.
- SQL: indice unico por cotizacion origen.
- Dependencias: COMV4-040.
- Reglas: no convertir cotizacion no autorizada.
- Criterios de aceptacion: doble click no crea doble pedido.
- QA: conversion y reintento.
- Riesgos: cotizacion editable despues de convertir.
- Decisiones PO: [DECISION PO] si cotizacion queda bloqueada al convertir.

### COMV4-042 - Compromiso de inventario por variante

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: registrar compromiso al crear Pedido.
- Estado actual: comprometido no existe.
- Cambio requerido: modelo persistido o calculado de compromiso.
- Backend: servicio de compromiso/liberacion.
- Frontend: mostrar disponible real.
- SQL: tabla de compromisos o derivacion desde PedidoDetalle segun decision.
- Dependencias: COMV4-015, COMV4-041.
- Reglas: compromiso por producto/variante; servicios no comprometen inventario.
- Criterios de aceptacion: disponible baja al crear Pedido.
- QA: producto simple y variante.
- Riesgos: sobreventa si concurrencia no bloquea.
- Decisiones PO: [DECISION PO] persistir comprometido o calcular desde Pedido.

### COMV4-043 - Cancelacion y liberacion de compromiso

- Prioridad: P1 ALTA; Tipo: CORE.
- Objetivo: cancelar Pedido y liberar compromiso.
- Estado actual: no existe.
- Cambio requerido: estado cancelado y trazabilidad.
- Backend: endpoint cancelar.
- Frontend: accion con motivo.
- SQL: movimiento/registro de liberacion si aplica.
- Dependencias: COMV4-042.
- Reglas: no cancelar lo ya vendido/surtido salvo regla especial.
- Criterios de aceptacion: disponible se recupera al cancelar.
- QA: cancelar pedido sin surtir y parcial.
- Riesgos: inconsistencias con venta futura.
- Decisiones PO: [DECISION PO] cancelacion parcial.

### COMV4-044 - Surtimiento de Pedido

- Prioridad: P1 ALTA; Tipo: OPERACION.
- Objetivo: registrar cantidades surtidas y pendientes.
- Estado actual: no existe.
- Cambio requerido: surtido parcial/total por partida.
- Backend: API surtir/reservar para venta.
- Frontend: pantalla de surtimiento.
- SQL: tablas o campos de surtimiento.
- Dependencias: COMV4-042.
- Reglas: surtir no necesariamente cobra; salida fisica final puede ocurrir en Venta segun PO.
- Criterios de aceptacion: Pedido pasa a Parcial o Surtido.
- QA: surtido 4 de 10 y pendiente 6.
- Riesgos: duplicar salida inventario con Venta.
- Decisiones PO: [DECISION PO] surtimiento descuenta inventario o solo prepara venta.

---

# S5 - Usuarios y capacidades comerciales

Objetivo: definir y aplicar capacidades comerciales sobre Usuario/Rol/Permiso sin duplicar identidad.  
Dependencia: antes de S7; puede iniciar definicion despues de S0.  
Fuera de alcance: crear tabla `TipoUsuario` sin decision, duplicar Operadores.  
Reglas de negocio: Usuario = identidad, Rol = autorizacion, Permiso = capacidad, Operador = identidad operativa existente.  
Gate QA: usuarios con permisos limitados, vendedor, cajero, receptor, autorizador, supervisor y operador servicio.  
Decisiones PO pendientes: permisos por tipo funcional y asistencia obligatoria.

## Tickets S5

### COMV4-050 - Definicion funcional de tipos comerciales

- Prioridad: P0 BLOQUEANTE; Tipo: TRANSVERSAL.
- Objetivo: clasificar Agente, Vendedor, Cajero, Operador, Ayudante, Administracion, Super Usuario y Supervisor.
- Estado actual: referencia funcional existe, modelo comercial no.
- Cambio requerido: decidir si cada uno es identidad, rol, capacidad, responsabilidad o persona sin login.
- Backend: no aplicar hasta decision.
- Frontend: no aplicar hasta decision.
- SQL: no crear `TipoUsuario`.
- Dependencias: COMV4-001.
- Reglas: Ayudante tiene Login NO como referencia, pero requiere decision operativa.
- Criterios de aceptacion: matriz tipo -> significado aprobada.
- QA: revision PO.
- Riesgos: crear modelo paralelo a usuarios.
- Decisiones PO: [DECISION PO] clasificacion final.

### COMV4-051 - Matriz capacidad por proceso

- Prioridad: P0 BLOQUEANTE; Tipo: TRANSVERSAL.
- Objetivo: definir quien puede comprar, autorizar, recibir, ajustar, cotizar, vender, cobrar, devolver y reportar.
- Estado actual: no materializado.
- Cambio requerido: matriz capacidad x proceso.
- Backend: permisos a mapear.
- Frontend: visibilidad/acciones por permiso.
- SQL: permisos/roles segun arquitectura actual.
- Dependencias: COMV4-050.
- Reglas: autorizador no debe asumirse igual que capturista.
- Criterios de aceptacion: cada accion critica tiene permiso.
- QA: usuarios con y sin permiso.
- Riesgos: permisos demasiado amplios.
- Decisiones PO: [DECISION PO] permisos por tipo funcional.

### COMV4-052 - Integracion con Roles y Permisos actuales

- Prioridad: P1 ALTA; Tipo: TRANSVERSAL.
- Objetivo: implementar capacidades comerciales en el sistema de autorizacion existente.
- Estado actual: roles/permisos existen, no matriz comercial.
- Cambio requerido: permisos nuevos o configuracion.
- Backend: validacion en endpoints.
- Frontend: ocultar/deshabilitar acciones.
- SQL: insercion de permisos solo con script autorizado.
- Dependencias: COMV4-051.
- Reglas: endpoint debe validar aunque UI oculte.
- Criterios de aceptacion: usuario sin permiso no ejecuta accion.
- QA: pruebas por rol.
- Riesgos: permisos inconsistentes entre MVC/API.
- Decisiones PO: ninguna despues de matriz.

### COMV4-053 - Responsables por documento

- Prioridad: P1 ALTA; Tipo: TRANSVERSAL.
- Objetivo: estandarizar vendedor, cajero, surtidor, receptor, autorizador, supervisor y operador servicio.
- Estado actual: cada modulo futuro podria inventar campos.
- Cambio requerido: guia de campos y reglas por documento.
- Backend: IDs de usuario/responsable en cabeceras/eventos.
- Frontend: selector o derivacion de responsable.
- SQL: columnas segun modulo.
- Dependencias: COMV4-051.
- Reglas: usuario capturista y usuario responsable pueden diferir.
- Criterios de aceptacion: OC/Recepcion/Pedido/Venta guardan responsables correctos.
- QA: auditoria de trazabilidad.
- Riesgos: confusion entre Operador y Usuario.
- Decisiones PO: [DECISION PO] operador servicio requiere login o no.

### COMV4-054 - Auditoria de acceso comercial

- Prioridad: P2 MEDIA; Tipo: TRANSVERSAL.
- Objetivo: reportar acciones sensibles por usuario.
- Estado actual: trazabilidad parcial por modulo.
- Cambio requerido: criterios de auditoria comercial.
- Backend: bitacora o eventos segun sistema actual.
- Frontend: reporte administrativo.
- SQL: tabla/eventos si no existe mecanismo suficiente.
- Dependencias: COMV4-052.
- Reglas: compras, recepciones, ajustes, cobros y devoluciones son acciones auditables.
- Criterios de aceptacion: reporte filtra por usuario/proceso/fecha.
- QA: ejecutar acciones y validar bitacora.
- Riesgos: exceso de logs sin utilidad.
- Decisiones PO: [DECISION PO] retencion y visibilidad de auditoria.

---

# S6 - Formas de Pago + Caja + Ajustes PV

Objetivo: construir configuracion operativa necesaria antes de Venta/Cobro.  
Dependencia: S5 para permisos; antes de S7.  
Fuera de alcance: venta completa, devoluciones, documentos fiscales completos si PO no los aprueba.  
Reglas de negocio: formas de pago, caja y ajustes pueden variar por sucursal si PO lo decide.  
Gate QA: forma activa/inactiva, caja por sucursal, cajero autorizado, ajustes PV aplicados por sucursal.  
Decisiones PO pendientes: apertura/cierre caja, politica devolucion, vigencia NC/Vale, forma fiscal, restricciones.

## Tickets S6

### COMV4-060 - Catalogo Formas de Pago

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: crear formas de pago operativas para cobro.
- Estado actual: no existe funcionalmente; placeholder.
- Cambio requerido: catalogo activo/inactivo con restricciones.
- Backend: CRUD y validacion.
- Frontend: administracion de formas.
- SQL: tablas nuevas o extension segun auditoria.
- Dependencias: COMV4-051.
- Reglas: forma inactiva no puede usarse en cobro nuevo.
- Criterios de aceptacion: alta, edicion, baja logica.
- QA: forma activa visible y forma inactiva bloqueada.
- Riesgos: impacto fiscal no definido.
- Decisiones PO: [DECISION PO] forma fiscal y restricciones.

### COMV4-061 - Caja y contexto operativo

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: definir caja, sucursal y cajero para cobro.
- Estado actual: caja no existe.
- Cambio requerido: modelo caja y asignacion operativa.
- Backend: APIs de caja/contexto.
- Frontend: seleccion o deteccion de caja.
- SQL: tablas de caja y sesiones si aplica.
- Dependencias: COMV4-052.
- Reglas: cobro requiere cajero autorizado y contexto de caja si PO lo aprueba.
- Criterios de aceptacion: usuario cajero opera caja asignada.
- QA: cajero correcto/incorrecto.
- Riesgos: bloquear venta si caja no esta inicializada.
- Decisiones PO: [DECISION PO] apertura/cierre obligatoria.

### COMV4-062 - Apertura y cierre de caja

- Prioridad: P1 ALTA; Tipo: OPERACION.
- Objetivo: soportar turno de caja si PO lo requiere.
- Estado actual: no existe.
- Cambio requerido: apertura, cierre, arqueo y diferencias.
- Backend: estados de caja.
- Frontend: pantalla de apertura/cierre.
- SQL: sesiones/movimientos de caja.
- Dependencias: COMV4-061.
- Reglas: no cobrar con caja cerrada si regla aprobada.
- Criterios de aceptacion: apertura, cobro, cierre.
- QA: intento de cobro sin apertura.
- Riesgos: complejidad operativa.
- Decisiones PO: [DECISION PO] apertura/cierre de caja.

### COMV4-063 - Ajustes PV por sucursal/tienda

- Prioridad: P1 ALTA; Tipo: CORE.
- Objetivo: configurar devoluciones, NC, vales y checkout por sucursal.
- Estado actual: placeholder; no funcional.
- Cambio requerido: parametros comerciales PV.
- Backend: CRUD/configuracion.
- Frontend: pantalla de ajustes.
- SQL: tabla de ajustes por empresa/sucursal.
- Dependencias: COMV4-051.
- Reglas: dias devolucion, vigencia NC y vigencia Vale deben venir de configuracion aprobada.
- Criterios de aceptacion: sucursal A y B pueden tener reglas distintas si PO lo aprueba.
- QA: validar aplicacion de regla.
- Riesgos: reglas incompletas bloquean postventa.
- Decisiones PO: [DECISION PO] dias devolucion, vigencia NC, vigencia Vale, comportamiento checkout.

---

# S7 - Venta + Cobro

Objetivo: construir venta funcional y cobro, preferentemente desde Pedido.  
Dependencia: S4, S5, S6.  
Fuera de alcance: devoluciones, NC/Vale salvo lectura de ajustes, venta libre sin decision PO.  
Reglas de negocio: venta parte de Pedido salvo decision contraria; salida de inventario debe ser idempotente; cobro puede usar multiples formas de pago.  
Gate QA: venta total, venta parcial, multiple forma de pago, salida por variante, ticket, actualizacion Pedido.  
Decisiones PO pendientes: venta libre vs exclusivamente desde Pedido, surtimiento descuenta o venta descuenta.

## Tickets S7

### COMV4-070 - Venta desde Pedido

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: crear venta tomando partidas pendientes de Pedido.
- Estado actual: venta funcional no existe; placeholder.
- Cambio requerido: cabecera/detalle de venta con origen Pedido.
- Backend: API venta desde pedido.
- Frontend: pantalla seleccionar Pedido y vender.
- SQL: tablas Venta/VentaDetalle.
- Dependencias: COMV4-044, COMV4-052, COMV4-061.
- Reglas: no vender cantidades mayores al pendiente permitido.
- Criterios de aceptacion: pedido pendiente genera venta.
- QA: venta de pedido simple.
- Riesgos: pedido y venta desincronizados.
- Decisiones PO: [DECISION PO] venta libre vs desde Pedido.

### COMV4-071 - Surtimiento parcial en Venta

- Prioridad: P1 ALTA; Tipo: CORE.
- Objetivo: vender parcialmente un Pedido y mantener pendiente.
- Estado actual: no existe.
- Cambio requerido: cantidades vendidas/acumuladas/pendientes.
- Backend: calculo por detalle.
- Frontend: captura cantidades a vender.
- SQL: indices por pedido origen.
- Dependencias: COMV4-070.
- Reglas: venta parcial cambia Pedido a Parcial.
- Criterios de aceptacion: venta 4 de 10 deja pendiente 6.
- QA: segunda venta completa pedido.
- Riesgos: doble venta concurrente.
- Decisiones PO: ninguna si S4 define estados.

### COMV4-072 - Salida de inventario por venta

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: descontar existencia por producto/variante al confirmar venta.
- Estado actual: no existe salida por venta.
- Cambio requerido: movimiento idempotente de salida.
- Backend: transaccion venta -> movimiento -> existencia -> liberacion compromiso.
- Frontend: estado de confirmacion.
- SQL: origen documental unico en movimientos.
- Dependencias: COMV4-012, COMV4-042, COMV4-070.
- Reglas: servicios no descuentan inventario; producto con variantes descuenta variante correcta.
- Criterios de aceptacion: saldo baja una sola vez.
- QA: reintento no duplica salida.
- Riesgos: negativos segun politica no definida.
- Decisiones PO: [DECISION PO] permitir negativos en venta.

### COMV4-073 - Cobro con multiples formas de pago

- Prioridad: P0 BLOQUEANTE; Tipo: CORE.
- Objetivo: registrar pago de venta con una o varias formas.
- Estado actual: cobro no existe.
- Cambio requerido: cabecera de cobro y detalle por forma.
- Backend: API cobro idempotente.
- Frontend: UI de medios de pago.
- SQL: tablas Cobro/CobroDetalle o integracion con Venta.
- Dependencias: COMV4-060, COMV4-061, COMV4-070.
- Reglas: suma de pagos debe cubrir total segun politica.
- Criterios de aceptacion: efectivo+tarjeta en una venta.
- QA: pago exacto, faltante, excedente segun regla.
- Riesgos: redondeos y conciliacion de caja.
- Decisiones PO: [DECISION PO] pagos parciales o solo pago completo.

### COMV4-074 - Ticket/documento de venta

- Prioridad: P1 ALTA; Tipo: OPERACION.
- Objetivo: emitir documento operativo de venta/cobro.
- Estado actual: no existe ticket funcional.
- Cambio requerido: PDF/impresion o documento digital.
- Backend: DTO documento.
- Frontend: boton imprimir/descargar.
- SQL: folio si aplica.
- Dependencias: COMV4-073.
- Reglas: ticket debe reflejar variantes, servicios, flete, pagos y caja.
- Criterios de aceptacion: documento coincide con venta.
- QA: revision visual y totales.
- Riesgos: requerimientos fiscales externos.
- Decisiones PO: [DECISION PO] alcance fiscal del documento.

---

# S8 - Devoluciones y postventa

Objetivo: completar devolucion, reingreso y documentos de postventa.  
Dependencia: S7 y Ajustes PV S6.  
Fuera de alcance: facturacion fiscal completa si PO no la aprueba.  
Reglas de negocio: devolucion parte de Venta; reingreso solo para productos que vuelven a inventario; NC/Vale dependen de Ajustes PV.  
Gate QA: devolucion parcial, total, variante correcta, NC/Vale emitido y aplicado.  
Decisiones PO pendientes: politica devolucion, NC vs Vale, autorizaciones.

## Tickets S8

### COMV4-080 - Devolucion desde Venta

- Prioridad: P0 BLOQUEANTE; Tipo: POSTVENTA.
- Objetivo: localizar venta y seleccionar partidas devolubles.
- Estado actual: placeholder; no funcional.
- Cambio requerido: modelo devolucion cabecera/detalle.
- Backend: API devolucion.
- Frontend: pantalla buscar venta y devolver.
- SQL: tablas Devolucion/DevolucionDetalle.
- Dependencias: COMV4-070, COMV4-063.
- Reglas: no devolver mas de lo vendido no devuelto.
- Criterios de aceptacion: devolucion parcial y total.
- QA: venta con variante devuelta parcialmente.
- Riesgos: devoluciones fuera de vigencia.
- Decisiones PO: [DECISION PO] politica devolucion y motivos.

### COMV4-081 - Reingreso inventario por devolucion

- Prioridad: P0 BLOQUEANTE; Tipo: POSTVENTA.
- Objetivo: regresar existencia a la variante correcta cuando aplique.
- Estado actual: no existe.
- Cambio requerido: movimiento idempotente de entrada por devolucion.
- Backend: transaccion devolucion -> movimiento -> existencia.
- Frontend: indicar si reingresa o no reingresa.
- SQL: origen documental unico.
- Dependencias: COMV4-080, COMV4-012.
- Reglas: servicios no reingresan inventario.
- Criterios de aceptacion: saldo vuelve a variante correcta.
- QA: reintento sin doble reingreso.
- Riesgos: producto dañado no debe regresar a venta.
- Decisiones PO: [DECISION PO] motivos que reingresan inventario.

### COMV4-082 - Nota de Credito y Vale

- Prioridad: P1 ALTA; Tipo: POSTVENTA.
- Objetivo: emitir documento de saldo a favor segun politica.
- Estado actual: no existe.
- Cambio requerido: NC/Vale con vigencia, saldo y trazabilidad.
- Backend: modelo documento saldo.
- Frontend: emision y consulta.
- SQL: tablas NC/Vale o documento comercial unico.
- Dependencias: COMV4-080, COMV4-063.
- Reglas: documento no puede exceder importe autorizado de devolucion.
- Criterios de aceptacion: NC/Vale emitido con saldo.
- QA: vigencia y saldo.
- Riesgos: duplicar saldos a favor.
- Decisiones PO: [DECISION PO] NC vs Vale, vigencias y autorizacion.

### COMV4-083 - Aplicacion posterior de NC/Vale

- Prioridad: P1 ALTA; Tipo: POSTVENTA.
- Objetivo: usar NC/Vale como forma de pago futura.
- Estado actual: no existe.
- Cambio requerido: integracion con cobro.
- Backend: validar saldo, vigencia e idempotencia.
- Frontend: seleccionar documento en checkout.
- SQL: movimientos de saldo/aplicaciones.
- Dependencias: COMV4-073, COMV4-082.
- Reglas: no aplicar documento vencido o sin saldo.
- Criterios de aceptacion: venta nueva paga con vale parcial/total.
- QA: aplicacion y saldo restante.
- Riesgos: doble aplicacion concurrente.
- Decisiones PO: [DECISION PO] reglas de aplicacion parcial.

---

# S9 - Reportes + cierre integral

Objetivo: cerrar visibilidad, regresion, documentacion operativa y gobierno del ciclo comercial completo.  
Dependencia: S1 a S8.  
Fuera de alcance: nuevas funcionalidades no previstas.  
Reglas de negocio: reportes deben respetar permisos y multitenant.  
Gate QA: reportes por compras, recepciones, existencias, movimientos, cotizaciones, pedidos, ventas, cobros, devoluciones, usuarios y sucursales.  
Decisiones PO pendientes: formato de reportes y manual operativo final.

## Tickets S9

### COMV4-090 - Reportes de abastecimiento e inventario

- Prioridad: P1 ALTA; Tipo: OPERACION.
- Objetivo: reportar compras, recepciones, existencias y movimientos.
- Estado actual: OC tiene reporte; recepcion e inventario por variante no.
- Cambio requerido: reportes integrados por producto/variante/sucursal.
- Backend: consultas/exportables.
- Frontend: filtros y grids.
- SQL: indices de lectura si se requieren.
- Dependencias: S1, S2.
- Reglas: saldo por variante es fuente de verdad.
- Criterios de aceptacion: rastrear OC -> recepcion -> movimiento -> existencia.
- QA: export Excel/PDF si aplica.
- Riesgos: reportes lentos.
- Decisiones PO: [DECISION PO] formato ejecutivo.

### COMV4-091 - Reportes comerciales

- Prioridad: P1 ALTA; Tipo: OPERACION.
- Objetivo: reportar cotizaciones, pedidos, ventas, cobros y devoluciones.
- Estado actual: no existen funcionalmente.
- Cambio requerido: reportes por estado, fecha, usuario, sucursal, cliente y variante.
- Backend: consultas.
- Frontend: vistas/exportables.
- SQL: indices de lectura.
- Dependencias: S3 a S8.
- Reglas: respetar permisos.
- Criterios de aceptacion: reportes cuadran con documentos.
- QA: datos semilla/controlados.
- Riesgos: conciliacion de cobro y venta.
- Decisiones PO: [DECISION PO] KPIs prioritarios.

### COMV4-092 - Regresion E2E multitenant

- Prioridad: P0 BLOQUEANTE; Tipo: FUNDACION.
- Objetivo: validar el ciclo completo en empresa/sucursal/usuario.
- Estado actual: pruebas por modulo futuras.
- Cambio requerido: suite QA manual y/o automatizada.
- Backend: endpoints protegidos por empresa.
- Frontend: flujos responsive.
- SQL: validacion de aislamiento.
- Dependencias: S1 a S8.
- Reglas: ningun documento de otra empresa debe aparecer.
- Criterios de aceptacion: ciclo completo pasa sin cruces multitenant.
- QA: dos empresas, dos sucursales, varios roles.
- Riesgos: bugs de autorizacion o datos cruzados.
- Decisiones PO: ninguna.

### COMV4-093 - Documentacion operativa final

- Prioridad: P1 ALTA; Tipo: DOCUMENTACION.
- Objetivo: documentar uso operativo del ciclo comercial.
- Estado actual: documentos parciales.
- Cambio requerido: manual por proceso y rol.
- Backend: no aplica.
- Frontend: no aplica.
- SQL: no aplica.
- Dependencias: S1 a S8.
- Reglas: documentar solo lo implementado y aprobado.
- Criterios de aceptacion: manual permite operar compra a postventa.
- QA: revision con PO/operacion.
- Riesgos: documentacion se desactualiza.
- Decisiones PO: [DECISION PO] formato y audiencia.

### COMV4-094 - Cierre AGENTS/CLAUDE y congelamiento comercial

- Prioridad: P0 BLOQUEANTE; Tipo: DOCUMENTACION.
- Objetivo: dejar instrucciones permanentes post-implementacion.
- Estado actual: pendiente de ejecucion del programa.
- Cambio requerido: actualizar AGENTS/CLAUDE con modulos aprobados, reglas, pruebas y restricciones.
- Backend: no aplica.
- Frontend: no aplica.
- SQL: no aplica.
- Dependencias: COMV4-092, COMV4-093.
- Reglas: solo se declara aprobado lo certificado por QA/PO.
- Criterios de aceptacion: cualquier futuro agente entiende estado real.
- QA: lectura cruzada final.
- Riesgos: volver a contaminar con supuestos.
- Decisiones PO: [DECISION PO] aprobacion final del programa.

---

# Resumen ejecutivo

1. Numero total de Sprints: 10 (`S0` a `S9`).
2. Numero total de tickets: 55.
3. Tickets P0: 28.
4. Tickets P1: 21.
5. Tickets P2: 6.
6. Tickets P3: 0.
7. Actualmente terminado: ProductosServicios como base actual; OC implementada y aprovechable; inventario fisico/minimo por producto.
8. Queda congelado: V2/V3 como backlog vigente; cualquier reconstruccion de ProductosServicios; adopcion de Cotizaciones NEXT sin auditoria; uso de NEXT no autorizado.
9. Reutilizamos: ProductosServicios completo; OC MVC/JS/API/DTOs/PDF/Excel; `OrdenesCompraFolios`, `OrdenesCompra`, `OrdenesCompraDetalle`; Usuario/Rol/Permiso actuales como arquitectura de identidad/autorizacion.
10. Construimos nuevo: recepcion OC, inventario por variante, compromiso/disponible real, Pedido, Formas de Pago, Caja, Ajustes PV funcionales, Venta, Cobro, Devoluciones, NC/Vale y reportes integrales.
11. Auditamos antes de decidir: Cotizaciones existentes; documentos contaminados; saldo historico de inventario; usuarios/capacidades comerciales; reglas legacy que se usen solo como referencia.
12. Camino critico: `COMV4-001 -> COMV4-010 -> COMV4-011 -> COMV4-012 -> COMV4-020 -> COMV4-025 -> COMV4-027 -> COMV4-030 -> COMV4-031 -> COMV4-040 -> COMV4-042 -> COMV4-050 -> COMV4-051 -> COMV4-060 -> COMV4-061 -> COMV4-070 -> COMV4-072 -> COMV4-073 -> COMV4-080 -> COMV4-092 -> COMV4-094`.
13. Decisiones PO pendientes: aprobar V4; inventario por sucursal ahora o despues; costo promedio; conciliacion multi-variante; tipos de movimiento; impuestos OC; fechas minima/maxima; estados recepcion/OC recibida; sobre-recepcion; reversion; estrategia Cotizaciones; venta sin existencia; servicio surtido vs ejecutado; asistencia obligatoria; flete parcial; estados Pedido; venta libre vs desde Pedido; comprometido persistido vs calculado; caja apertura/cierre; politicas devolucion; NC vs Vale; permisos por tipo funcional.
14. Primer ticket recomendado: `COMV4-001 - Oficializar verdad comercial V4`.
15. Ultimo ticket del programa: `COMV4-094 - Cierre AGENTS/CLAUDE y congelamiento comercial`.
16. Archivo generado: `docs/comercial/BACKLOG_MAESTRO_CHECKAPP_COMERCIAL_V4.md`.
17. Codigo modificado: NO.
18. SQL ejecutado: NO.

**DICTAMEN: BACKLOG MAESTRO CHECKAPP COMERCIAL V4 GENERADO - ESPERANDO APROBACION DEL PRODUCT OWNER.**
