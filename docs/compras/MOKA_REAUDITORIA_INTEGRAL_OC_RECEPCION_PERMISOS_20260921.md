# MOKA - Reauditoria integral OC, Recepcion y Permisos - 2026-09-21

Documento solicitado por PM/PO para consolidar auditorias previas, NEXT, Legacy SKNC y ProductosServicios actual antes de implementar OC/Recepcion. No contiene DDL, migraciones ni cambios funcionales.

## 1. Control ejecutivo

| Punto | Dictamen |
|---|---|
| Alcance | OC Nueva, OC Reporte, Recepcion Nueva, Recepcion Reporte, ProductosServicios y RolesPermisos |
| Base visual | `/ProductosServicios/Index` es Golden Master complejo |
| NEXT auditado | `/Activos/OrdenesCompra/Nueva`, `/Activos/OrdenesCompra/Reporte`, `/ProductosServicios/Index`, `/RolesPermisos/RolesPermisos` |
| Legacy auditado solo lectura | `/OrdenesCompra/Index`, `/OrdenesCompra/ReporteOC`, `/RecepcionG/Index`, `/RecepcionG/ReporteRec` |
| Prohibiciones respetadas | No Legacy write, no DDL, no migraciones, no T25, no reporte lider |
| Estado de implementacion | No implementado; solo reauditoria y propuesta |
| Riesgo principal | NEXT OC actual no modela variantes, presentaciones de compra, recepcion, series ni pendientes |
| Bloqueador PO real | `REQUIERE_DECISION_PO_PRESENTACIONES_OC` si PresentacionCompra aun no queda formalizada |

## 2. Decisiones PO vigentes

| Decision | Estado | Impacto obligatorio |
|---|---|---|
| Compra de Productos en OC | Aprobada | OC debe aceptar partidas de producto |
| Compra de Servicios en OC | Aprobada | OC debe aceptar servicios sin inventario ni series por defecto |
| OC mixta Productos + Servicios | Aprobada | Un mismo folio debe contener ambos tipos |
| Variantes en OC cuando existan | Aprobada | Partida producto debe poder apuntar a variante |
| Series en Recepcion cuando aplique | Aprobada | Recepcion debe capturar/validar series en productos/variantes serializados |
| Crear OC no aumenta inventario | Aprobada | Solo reserva/compromete proceso documental |
| Confirmar recepcion de producto aumenta inventario | Aprobada | Movimiento inventario al confirmar recepcion, no al guardar borrador |
| Recepcion parcial | Aprobada | Cantidad recibida puede ser menor al pendiente |
| Sobrerrecepcion | No por ahora | Cantidad recibida no puede superar pendiente |
| `idEmpresa` | Aprobada server-side | Nunca confiar `idEmpresa` cliente; cross-tenant fail closed |

## 3. Presentaciones en OC

Dictamen actual: `PROPUESTA_PMPO_PENDIENTE_FORMALIZAR`.

La auditoria 2026-09-20 recomendo la Alternativa C: separar presentaciones de venta actuales de una futura entidad `PresentacionCompra`. Esa recomendacion no equivale a decision PO formal. Por lo tanto:

- No se debe implementar compra usando `PresentacionesVenta`.
- No se debe asumir que compra opera siempre en unidad base.
- No se debe crear `PresentacionCompra` sin aprobacion y ticket formal.
- Estado requerido: `REQUIERE_DECISION_PO_PRESENTACIONES_OC`.

Alternativas pendientes:

| Alternativa | Descripcion | Ventaja | Riesgo | Recomendacion PM/PO |
|---|---|---|---|---|
| A | Comprar solo en unidad base | Rapida y simple | No cubre cajas, paquetes, compra por proveedor ni conversiones de compra | No recomendada salvo MVP muy restringido |
| B | Reusar `PresentacionesVenta` para compra | Aprovecha UI/datos existentes | Mezcla semantica venta/compra, precios y equivalencias; deuda alta | No recomendada |
| C | Crear `PresentacionCompra` separada | Modelo limpio: proveedor, costo, equivalencia, predeterminada | Requiere diseno/schema/tickets | Recomendada por PM, pendiente PO |

## 4. Auditorias previas recuperadas

| Documento | Fecha | Vigente | Aporte |
|---|---:|---|---|
| `AUDITORIA_INTEGRAL_OC_SKNC_LEGACY_2026-08-18.md` | 2026-08-18 | Si, como referencia Legacy | Mapeo inicial de OC legacy, estados, filtros, reporte y detalle |
| `AUDITORIA_INTEGRAL_OC_CHECKAPP_ACTUAL_2026-08-19.md` | 2026-08-19 | Si, como estado NEXT anterior | Identifico brechas de OC CheckApp frente a legacy |
| `BACKLOG_MAESTRO_PROVEEDURIA_ORDENES_COMPRA.md` | 2026-08-19 | Parcial | Backlog base de proveeduria/OC, requiere actualizar con recepcion/permisos |
| `BACKLOG_MAESTRO_PROVEEDURIA_OC_CON_EVIDENCIA.md` | 2026-08-19 | Parcial | Evidencia complementaria; no sustituye esta reauditoria |
| `MOKA_AUDITORIA_OC_RECEPCION_COMPLETO_20260920.md` | 2026-09-20 | Si | Consolida NEXT + Legacy + ProductosServicios, deja Presentaciones pendiente |

Faltantes previos que quedan cerrados por este documento: permisos OC/Recepcion, ubicacion menu Proveeduria, contrato PO simple para boceto, backlog por tickets y reglas explicitas de recepcion parcial/sin sobrerrecepcion.

## 5. NEXT - OC Nueva

Ruta: `/Activos/OrdenesCompra/Nueva`.

| Area | Estado actual | Brecha |
|---|---|---|
| UI | Wizard de 4 pasos: Configuracion, Productos y servicios, Partidas, Revisar y guardar | Flujo base util, pero aun no representa variantes, presentacion compra, series/recepcion ni pendientes |
| Configuracion | Razon social, sucursal, proveedor, fechas y observaciones | Correcto como cabecera; debe resolver `idEmpresa` server-side |
| Busqueda | Busca ProductosServicios por tipo/codigo/nombre/unidad/costo | Debe exponer variantes cuando existan y distinguir producto inventariable vs servicio |
| Partidas | `idProductoServicio`, cantidad, costo unitario, subtotal | Falta `idVariante`, snapshot variante, posible `idPresentacionCompra`, equivalencia, cantidad base, flags serial/inventario |
| API payload | `OrdenCompraGuardarRequest` con detalle minimo | No cumple decisiones PO de variantes/recepcion |
| Estados | 1 borrador, 2 generada, 3 cancelada | Faltan estados operativos para recepcion parcial/completa/cerrada/cancelada segun contrato final |
| Inventario | Crear/generar OC no impacta existencias | Correcto como regla; falta recepcion confirmada |

Dictamen: sirve como boceto de UX NEXT, no como contrato funcional definitivo.

## 6. NEXT - OC Reporte

Ruta: `/Activos/OrdenesCompra/Reporte`.

| Area | Estado actual | Brecha |
|---|---|---|
| Visual | Header CheckApp, KPIs, filtros, DynamicGrid, modal detalle | Se alinea mejor con patron que legacy |
| Filtros | Busqueda, estado, proveedor, razon social, sucursal, fechas | Falta filtro por recepcion, pendientes, producto/servicio, variante, serializado |
| Grid | Acciones, folio, proveedor, razon, sucursal, estado, fechas, total, creacion | Falta resumen recibido/pendiente y tipo mixto |
| Detalle | Partidas con tipo, codigo, producto, unidad, cantidad, costo, subtotal | Falta variante, presentacion compra, cantidad recibida, pendiente, series requeridas |
| Export | Excel/PDF disponibles por endpoints | Export debe reflejar contrato final y no ocultar recepcion |

Dictamen: reporte NEXT actual cubre captura documental de OC, no ciclo completo compra-recepcion.

## 7. Legacy SKNC - OC

Rutas solo lectura: `/OrdenesCompra/Index`, `/OrdenesCompra/ReporteOC`.

| Funcion legacy | Evidencia | Leccion para NEXT |
|---|---|---|
| OC por producto/variante | `OrdendeCompraPT` usa `idProducto`, `idVariante`, cantidad, costo, proveedor, almacen, razon | NEXT debe conservar variante cuando exista |
| Estados operativos | Nuevo, surtido, cancelado, parcial, terminado, sobrerrecibido, aprobado | NEXT debe definir estados simples y no copiar deuda innecesaria |
| Reporte rico | Filtros por estado, tipo fecha, tipo OC, proveedor, razon, depto, unidad, almacen, producto | NEXT reporte debe incluir pendientes/recepcion, no solo cabecera |
| Acciones | PDF, correo, duplicar, cancelar, modificar fechas/proveedor/unidad, terminar parcial, editar detalle, historial | Backlog debe separar MVP de acciones avanzadas |
| Detalle | Producto, variante, SKU/kits, costos e importes | Snapshot de partida necesario para historico |

Dictamen: Legacy es fuente de reglas y cobertura, no base para copiar UI ni modificar codigo.

## 8. Legacy SKNC - Recepcion

Rutas solo lectura: `/RecepcionG/Index`, `/RecepcionG/ReporteRec`.

| Funcion legacy | Evidencia | Leccion para NEXT |
|---|---|---|
| Elegibilidad OC | OCs con estatus aprobada/parcial en combos | NEXT debe recibir solo OC generada/aprobada con pendiente |
| Recepcion parcial | Usa `Cantidad - Surtidos` y actualiza surtidos | NEXT debe persistir recibido acumulado y pendiente |
| Inventario | Inserta compras/detalle y actualiza existencias por producto/variante/almacen/seccion | NEXT debe tener transaccion idempotente de recepcion |
| Sobrerrecepcion | Legacy contempla estatus 5 | PO actual dice NO por ahora; NEXT debe bloquear `recibido > pendiente` |
| Series | Valida duplicados por empresa/serial e inserta cardex de seriales | NEXT debe validar series unicas, cantidad exacta y tenant |
| Reporte | Filtros proveedor, razon, fechas; detalle producto/SKU/cantidad/costo; PDFs | NEXT requiere reporte de recepciones con trazabilidad OC |

Dictamen: Recepcion debe ser pantalla nueva NEXT, no extension menor de OC.

## 9. ProductosServicios actual

Golden Master: `/ProductosServicios/Index`.

| Componente | Estado actual | Impacto OC/Recepcion |
|---|---|---|
| Producto/Servicio | `Tipo`, `Codigo`, `Nombre`, `Descripcion`, `CausaInventario`, `UsaNumeroSerie` | Fuente para decidir inventario/series |
| Variantes | Tabla `ProductosServiciosVariantes`, SKU, nombre, valores, costos/precios | OC debe permitir variante cuando existan |
| PresentacionesVenta | Nombre, cantidad venta, unidad venta, equivalencia base, precio | No debe usarse automaticamente para compra |
| Existencias | Existencia asociada a producto/servicio | Brecha frente a inventario por variante/sucursal/almacen |
| Movimientos | Movimientos inventario existentes en PS | Recepcion debe integrarse sin romper T11-T24 |
| Catalogos | Categorias, marcas, unidades | OC/Recepcion deben reutilizar catalogos, no duplicar |

Brecha estructural real: si el inventario final requiere existencia por variante y sucursal/almacen, el modelo actual de ProductosServicios no basta. Marcar como `REQUIERE_DECISION_PO_INVENTARIO_VARIANTE_SUCURSAL` antes de implementar recepcion con impacto real.

## 10. Permisos actuales

| Nodo | Codigo real encontrado | Tipo | Estado |
|---|---|---|---|
| Proveeduria | `05000000` | Agrupador | Existe |
| Productos y Servicios | `05001000` | Agrupador | Existe |
| ABC Productos y Servicios | `05001001` | Funcional | Existe |
| Catalogos | `05001002` | Agrupador | Existe |
| Categorias | `05001003` | Funcional | Existe |
| Marcas | `05001004` | Funcional | Existe |
| Unidades de medida | `05001005` | Funcional | Existe |
| Proveedores | `03506003` | Funcional legacy bajo Activos | Existe, no alineado a arbol Proveeduria |
| Ordenes de compra | No encontrado | Agrupador | Falta contrato/codigo |
| OC Nueva | No encontrado | Funcional | Falta contrato/codigo |
| OC Reporte | No encontrado | Funcional | Falta contrato/codigo |
| Recepcion | No encontrado | Agrupador | Falta contrato/codigo |
| Recepcion Nueva | No encontrado | Funcional | Falta contrato/codigo |
| Recepcion Reporte | No encontrado | Funcional | Falta contrato/codigo |

El menu NEXT muestra Proveedores y Ordenes de compra bajo Proveeduria, pero OC no esta protegida con permiso granular propio en el arbol de RolesPermisos. Recepcion tampoco aparece como rama NEXT de Proveeduria.

## 11. Permisos propuestos para decision PO

Estado: `REQUIERE_DECISION_PO_CODIGOS_OC_RECEPCION`.

Preflight local de texto: no se encontraron usos exactos de `05003001`, `05003002`, `05004001`, `05004002`. Existen identificadores legacy con prefijo `m05002000`, `m05003000`, `m05004000` en utilerias, por lo que la propuesta requiere preflight SQL/JSON real antes de aprobar.

| Nodo destino | Tipo | Codigo propuesto | Acceso | Escritura | Regla |
|---|---|---:|---|---|---|
| Proveeduria | Agrupador | `05000000` | Si | No | Padre visible si algun hijo autorizado |
| Productos y Servicios | Agrupador | `05001000` | Si | No | No concede hijos automaticamente |
| ABC Productos y Servicios | Funcional | `05001001` | Si | Si | READ/WRITE propio |
| Catalogos | Agrupador | `05001002` | Si | No | No concede hijos automaticamente |
| Categorias | Funcional | `05001003` | Si | Si | READ/WRITE propio |
| Marcas | Funcional | `05001004` | Si | Si | READ/WRITE propio |
| Unidades de medida | Funcional | `05001005` | Si | Si | READ/WRITE propio |
| Proveedores | Funcional | `03506003` o migracion PO a `05002001` | Si | Si | No cambiar sin ticket de migracion |
| Ordenes de compra | Agrupador | `05003000` | Si | No | Rama |
| OC Nueva | Funcional | `05003001` | Si | Si | Crear/editar/generar |
| OC Reporte | Funcional | `05003002` | Si | No | Consultar/exportar; acciones mutables requieren write especifico o subpermiso |
| Recepcion | Agrupador | `05004000` | Si | No | Rama hermana de OC |
| Recepcion Nueva | Funcional | `05004001` | Si | Si | Capturar/confirmar recepcion |
| Recepcion Reporte | Funcional | `05004002` | Si | No | Consultar/exportar |

Reglas obligatorias:

- Agrupador = Acceso solamente.
- Funcional = Acceso + Escritura.
- Padre no concede hijo automaticamente.
- Ausencia de permiso granular = fail closed.
- SuperAdmin protegido; no editar manualmente fuera del mecanismo autorizado.
- API es autoridad final; menu/MVC solo ayudan a ocultar/bloquear temprano.

## 12. Contrato simple para boceto PO

Este contrato es deliberadamente simple para bocetar antes de tickets tecnicos.

1. Una OC tiene cabecera: empresa resuelta server-side, razon social, sucursal, proveedor, fechas, observaciones, estado, folio y moneda si aplica.
2. Una OC puede tener productos, servicios o ambos.
3. Una partida de producto apunta a ProductoServicio y, si el producto tiene variantes, debe apuntar a una variante.
4. Una partida de servicio no causa inventario ni series por defecto.
5. Una partida puede tener unidad base; si PO aprueba PresentacionCompra, tambien presentacion, equivalencia y cantidad base calculada.
6. Crear/guardar/generar OC no aumenta inventario.
7. Recepcion nace desde una OC generada/aprobada con pendiente.
8. Recepcion puede ser parcial.
9. Recepcion no permite recibir mas que el pendiente.
10. Confirmar recepcion de productos inventariables aumenta inventario.
11. Si el producto/variante requiere serie, la recepcion exige series unicas y completas por cantidad recibida.
12. Una recepcion confirmada deja trazabilidad: OC, partida OC, cantidad recibida, usuario, fecha, costo, almacen/sucursal y series si aplica.
13. Reporte OC muestra cantidad ordenada, recibida y pendiente.
14. Reporte Recepcion muestra folio recepcion, OC origen, proveedor, razon, sucursal, usuario, fecha, detalle y series.
15. Todo acceso se controla por permisos Proveeduria granulares; parent no hereda hijos.

## 13. Modelo funcional propuesto

| Entidad | Objetivo | Campos clave |
|---|---|---|
| OrdenCompra | Cabecera documental | Folio, idEmpresa, idRazonSocial, idSucursal, idProveedor, fechas, estado, totales |
| OrdenCompraPartida | Lineas de compra | ProductoServicio, Tipo, Variante opcional, PresentacionCompra opcional, cantidad, costo, recibido, pendiente |
| RecepcionCompra | Cabecera de recepcion | Folio, OC, idEmpresa, proveedor snapshot, sucursal/almacen, fecha, usuario, estado |
| RecepcionCompraPartida | Cantidad recibida | Partida OC, cantidad recibida, costo, inventariable, serializado |
| RecepcionCompraSerie | Series recibidas | Partida recepcion, serie, producto, variante, empresa |
| InventarioMovimiento | Movimiento por confirmacion | Producto, variante, almacen/sucursal, cantidad, costo, referencia recepcion |

No crear estas tablas sin ticket de schema/versioning/migracion aprobado.

## 14. API propuesta

| Endpoint | Metodo | Permiso | Regla |
|---|---|---|---|
| `/api/ordenes-compra` | GET | `05003002.Acceso` | Listar con filtros tenant |
| `/api/ordenes-compra/{id}` | GET | `05003002.Acceso` o `05003001.Acceso` | Detalle con partidas/recepcion |
| `/api/ordenes-compra/borrador` | POST | `05003001.Escritura` | Guardar sin inventario |
| `/api/ordenes-compra/generar` | POST | `05003001.Escritura` | Generar folio/estado |
| `/api/ordenes-compra/{id}/cancelar` | POST | `05003001.Escritura` | Solo si sin recepcion confirmada o regla aprobada |
| `/api/recepciones` | GET | `05004002.Acceso` | Reporte recepciones |
| `/api/recepciones/elegibles` | GET | `05004001.Acceso` | OC con pendiente |
| `/api/recepciones/borrador` | POST | `05004001.Escritura` | Validar pendiente y series sin impactar inventario |
| `/api/recepciones/confirmar` | POST | `05004001.Escritura` | Transaccion idempotente: recepcion + inventario + series |
| `/api/recepciones/{id}` | GET | `05004002.Acceso` | Detalle/export |

Reglas transversales: resolver empresa desde sesion/tenant, validar pertenencia proveedor/razon/sucursal/producto, usar locking o concurrencia optimista por partida, idempotency key en confirmacion, fail closed ante drift/schema/authz.

## 15. Estados recomendados

OC:

| Estado | Uso |
|---|---|
| Borrador | Captura editable |
| Generada | Lista para recepcion |
| Recepcion parcial | Tiene recepciones confirmadas y pendientes |
| Recibida | Todas las partidas inventariables/productos recibidas segun contrato; servicios no inventariables cerrados por regla PO |
| Cancelada | Sin operacion pendiente |

Recepcion:

| Estado | Uso |
|---|---|
| Borrador | Captura no confirmada |
| Confirmada | Inventario/series aplicados |
| Cancelada | Solo si se disena reversa; no asumir en MVP |

## 16. Wireflow PO

OC Nueva:

1. Configuracion: razon social, sucursal, proveedor, fechas, observaciones.
2. Productos y servicios: buscar desde ProductosServicios; mostrar tipo, inventariable, serializado, variantes.
3. Partidas: cantidad, costo, variante obligatoria si aplica, presentacion compra solo si aprobada.
4. Revision: totales, alertas de series/inventario, guardar borrador o generar.

Recepcion Nueva:

1. Buscar OC generada/parcial con pendiente.
2. Ver partidas con ordenado, recibido y pendiente.
3. Capturar cantidad a recibir por partida.
4. Capturar series cuando aplique.
5. Confirmar; aplicar inventario solo para productos inventariables.

Reportes:

1. OC Reporte: filtros, KPIs, grid, detalle con recibido/pendiente.
2. Recepcion Reporte: filtros, grid de recepciones, detalle de partidas y series, export.

## 17. Reglas de negocio OC

| Regla | Estado |
|---|---|
| OC puede mezclar productos y servicios | Aprobada |
| Partida producto puede requerir variante | Aprobada |
| Partida servicio no inventariable por defecto | Aprobada |
| Cantidad debe ser mayor a cero | Obligatoria |
| Costo no negativo | Obligatoria |
| Snapshot de nombre/codigo/unidad/costo | Obligatoria para historico |
| Generar OC no mueve inventario | Aprobada |
| Cancelar OC con recepcion | Requiere regla especifica por ticket |
| PresentacionCompra | Pendiente PO |

## 18. Reglas de negocio Recepcion

| Regla | Estado |
|---|---|
| Recepcion parcial permitida | Aprobada |
| Sobrerrecepcion bloqueada | Aprobada por ahora |
| Producto inventariable aumenta inventario al confirmar | Aprobada |
| Servicio no aumenta inventario | Aprobada |
| Series requeridas si producto/variante las exige | Aprobada |
| Serie duplicada en misma empresa bloquea confirmacion | Obligatoria |
| Confirmacion idempotente | Obligatoria |
| Cross-tenant fail closed | Obligatoria |
| Reversa/cancelacion de recepcion | Fuera de MVP salvo decision PO |

## 19. Comparativo integral

| Capacidad | Legacy | NEXT actual | Propuesta |
|---|---|---|---|
| Productos OC | Si | Si basico | Si completo |
| Servicios OC | Limitado/no homologado | Si por tipo PS | Si sin inventario |
| OC mixta | No claramente homologada | Posible por tipo | Si explicita |
| Variantes | Si | No en payload | Si obligatoria cuando aplique |
| Presentaciones compra | No formal NEXT | No | Pendiente PO |
| Recepcion | Si legacy | No NEXT | Nueva pantalla |
| Recepcion parcial | Si | No NEXT | Si |
| Sobrerrecepcion | Legacy contempla | No NEXT | Bloqueada |
| Series | Si legacy | No NEXT | Si |
| Reporte recepcion | Si | No NEXT | Si |
| Permisos granular OC/REC | Legacy disperso | No | Nuevo contrato |

## 20. Riesgos

| Riesgo | Severidad | Mitigacion |
|---|---:|---|
| Implementar OC sin variante | Alta | Bloquear tickets hasta agregar contrato variante |
| Usar PresentacionesVenta para compra | Alta | Esperar decision PO |
| Recepcion sin idempotencia | Alta | Idempotency key + transaccion + locks |
| Inventario sin dimension variante/sucursal | Alta | `REQUIERE_DECISION_PO_INVENTARIO_VARIANTE_SUCURSAL` |
| Menu visible sin API protegida | Alta | AuthZ backend obligatoria |
| Padre de permisos heredando hijos | Media | Reusar regla T23/T24 fail closed |
| Copiar legacy UI | Media | Aplicar Golden Master ProductosServicios |
| Reporte ocultando pendientes | Media | Grid/detail con ordenado/recibido/pendiente |

## 21. Backlog propuesto por tickets

### OC-01 - Contrato funcional y permisos OC/Recepcion

Objetivo: formalizar arbol Proveeduria, codigos, permisos Acceso/Escritura, estados y rutas.  
Dependencias: decision PO de codigos y Presentaciones.  
DoD: matriz aprobada, SuperAdmin protegido, parent sin herencia, API fail closed.  
Estado inicial: listo para PM/PO, no desarrollo.

### OC-02 - Modelo OC V2 sin DDL aun

Objetivo: especificar schema versionado para cabecera/partidas/snapshots/recepcion acumulada.  
Dependencias: OC-01, decision inventario variante/sucursal.  
DoD: ERD, contrato JSON, migracion propuesta no ejecutada, rollback conceptual.

### OC-03 - OC Nueva UI Golden Master

Objetivo: redisenar wizard OC con variantes, productos/servicios, alertas y revision.  
Dependencias: OC-01, OC-02.  
DoD: vista responsive, sin CSS paralelo, accesible, captura mixta, no inventario.

### OC-04 - API OC y AuthZ

Objetivo: endpoints OC con tenant server-side, permisos y validaciones.  
Dependencias: OC-01, OC-02.  
DoD: NOACCESS/READONLY/WRITE, cross-tenant fail closed, pruebas.

### OC-05 - OC Reporte

Objetivo: reporte OC con filtros, KPIs, detalle y export incluyendo recibido/pendiente.  
Dependencias: OC-04, REC-02.  
DoD: DynamicGrid, columnas finales, export consistente.

### OC-06 - PresentacionCompra si PO aprueba C

Objetivo: disenar presentaciones de compra separadas de venta.  
Dependencias: decision PO formal.  
DoD: entidad propuesta, UI/catalogo, conversion cantidad base, pruebas.

### OC-07 - QA OC integral

Objetivo: validar productos, servicios, mixta, variantes, permisos y reportes.  
Dependencias: OC-03 a OC-05.  
DoD: matriz PASS/FAIL, evidencia responsive, datos limpios.

### REC-01 - Contrato Recepcion

Objetivo: definir flujo, estados, elegibilidad OC, parcialidad, bloqueo sobrerrecepcion y series.  
Dependencias: OC-01, OC-02.  
DoD: contrato aprobado por PO, reglas RB-REC cerradas.

### REC-02 - Modelo Recepcion e inventario

Objetivo: especificar recepcion cabecera/detalle/series/movimientos inventario.  
Dependencias: REC-01, decision inventario variante/sucursal.  
DoD: transaccion idempotente definida, locks, rollback conceptual.

### REC-03 - Recepcion Nueva UI

Objetivo: pantalla hermana de OC bajo Proveeduria.  
Dependencias: REC-01, REC-02.  
DoD: buscar OC elegible, recibir parcial, series, confirmacion, responsive.

### REC-04 - API Recepcion

Objetivo: endpoints elegibles, guardar/confirmar, detalle.  
Dependencias: REC-02.  
DoD: no sobrerrecepcion, series unicas, inventario en confirmacion, tenant fail closed.

### REC-05 - Reporte Recepcion

Objetivo: grid y detalle de recepciones con export.  
Dependencias: REC-04.  
DoD: filtros proveedor/razon/sucursal/fechas/OC, detalle partidas/series.

### REC-06 - QA Recepcion integral

Objetivo: validar parcial, completa, servicios, serializados, permisos y concurrencia.  
Dependencias: REC-03 a REC-05.  
DoD: evidencia completa y puertos libres.

### SEC-01 - RolesPermisos Proveeduria completo

Objetivo: incorporar Proveedores/OC/Recepcion al arbol si PO aprueba codigos.  
Dependencias: OC-01.  
DoD: UI RolesPermisos, JSON persistente, bootstrap idempotente, SuperAdmin protegido.

### QA-01 - Regresion ProductosServicios Golden Master

Objetivo: garantizar que OC/Recepcion no degraden ProductosServicios.  
Dependencias: tickets UI/API.  
DoD: Golden Master visual y funcional conservado.

## 22. Entregables obligatorios 1-74

1. Auditorias previas recuperadas: completado.
2. NEXT Nueva auditada: completado.
3. NEXT Reporte auditado: completado.
4. ProductosServicios auditado: completado.
5. RolesPermisos auditado: completado.
6. Legacy OC Index auditado: completado.
7. Legacy OC Reporte auditado: completado.
8. Legacy Recepcion Index auditado: completado.
9. Legacy Recepcion Reporte auditado: completado.
10. Decisiones PO vigentes listadas: completado.
11. Presentaciones clasificadas: `PROPUESTA_PMPO_PENDIENTE_FORMALIZAR`.
12. Alternativas Presentaciones A/B/C incluidas: completado.
13. Recomendacion PM sin decidir por PO: completado.
14. Brecha variantes NEXT documentada: completado.
15. Brecha servicios documentada: completado.
16. Brecha OC mixta documentada: completado.
17. Brecha series documentada: completado.
18. Brecha recepcion parcial documentada: completado.
19. Bloqueo sobrerrecepcion documentado: completado.
20. Regla crear OC sin inventario: completado.
21. Regla confirmar recepcion con inventario: completado.
22. Regla servicios sin inventario: completado.
23. Regla `idEmpresa` server-side: completado.
24. Cross-tenant fail closed: completado.
25. Arbol permisos actual: completado.
26. Arbol permisos propuesto: completado.
27. Codigos reales identificados: completado.
28. Codigos faltantes marcados: `REQUIERE_DECISION_PO_CODIGOS_OC_RECEPCION`.
29. Proveedores `03506003` documentado: completado.
30. Propuesta Recepcion hermana de OC: completado.
31. Agrupadores acceso only: completado.
32. Funcionales acceso+escritura: completado.
33. Parent sin herencia: completado.
34. SuperAdmin protegido: completado.
35. Menu NEXT observado: completado.
36. RolesPermisos brecha UI/JSON: completado.
37. API OC actual inventariada: completado.
38. API propuesta OC: completado.
39. API propuesta Recepcion: completado.
40. Estados OC propuestos: completado.
41. Estados Recepcion propuestos: completado.
42. Modelo cabecera OC: completado.
43. Modelo partidas OC: completado.
44. Modelo Recepcion: completado.
45. Modelo Series: completado.
46. Modelo InventarioMovimiento: completado.
47. Dimension inventario variante/sucursal marcada: `REQUIERE_DECISION_PO_INVENTARIO_VARIANTE_SUCURSAL`.
48. Wireflow OC: completado.
49. Wireflow Recepcion: completado.
50. Wireflow Reportes: completado.
51. Comparativo Legacy/NEXT/Propuesta: completado.
52. Riesgos: completado.
53. Mitigaciones: completado.
54. Backlog OC: completado.
55. Backlog Recepcion: completado.
56. Backlog Seguridad/Permisos: completado.
57. Backlog QA: completado.
58. DoD por ticket: completado.
59. Dependencias por ticket: completado.
60. Evidencia de no implementacion: completado.
61. Prohibicion Legacy respetada: completado.
62. Prohibicion DDL respetada: completado.
63. Prohibicion migraciones respetada: completado.
64. Prohibicion T25 respetada: completado.
65. Reporte lider frozen respetado: completado.
66. Contrato simple PO: completado.
67. Snapshot de pendientes PO: completado.
68. Separacion hechos/aprobaciones/propuestas: completado.
69. Referencia Golden Master: completado.
70. Reglas RB-OC: completado.
71. Reglas RB-REC: completado.
72. Entrega en `docs/compras`: completado.
73. Memoria AGENTS/CLAUDE debe registrar solo hechos aprobados: completado en esta ejecucion.
74. Puertos 5200/5127 deben quedar libres al final: verificacion operacional fuera del documento, ejecutada al cierre.

## 23. Pendientes PO abiertos

| Pendiente | Marca |
|---|---|
| Presentaciones en OC | `REQUIERE_DECISION_PO_PRESENTACIONES_OC` |
| Codigos OC/Recepcion definitivos | `REQUIERE_DECISION_PO_CODIGOS_OC_RECEPCION` |
| Inventario por variante/sucursal/almacen | `REQUIERE_DECISION_PO_INVENTARIO_VARIANTE_SUCURSAL` |
| Proveedores bajo codigo Proveeduria nuevo o conservar `03506003` | Decision PO/arquitectura |
| Cancelacion/reversa de recepcion confirmada | Decision futura |

## 24. Cierre

La ruta recomendada es no iniciar implementacion hasta que PO formalice Presentaciones OC y codigos OC/Recepcion. El primer ticket ejecutable es OC-01/SEC-01 de contrato y permisos, seguido de modelo OC/Recepcion versionado. NEXT OC actual puede reutilizarse como base visual, pero no como contrato de negocio final.
