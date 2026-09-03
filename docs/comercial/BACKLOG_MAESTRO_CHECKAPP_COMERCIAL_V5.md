# Backlog Maestro CheckApp Comercial V5

Fecha: 2026-08-31  
Estado: evolucion integral propuesta para aprobacion del Product Owner.  
Alcance: auditoria, consolidacion y documentacion. No implementa codigo, SQL, tablas, migraciones, cambios de Login, Roles/Permisos, ProductosServicios ni Ordenes de Compra.

## Principio rector

V5 conserva lo valido de V1 y V4, reclasifica lo que cambio por auditorias posteriores y convierte el programa comercial en tickets ejecutables. La existencia fisica de codigo, tabla, ruta o modulo no autoriza su adopcion. NEXT queda fuera salvo autorizacion explicita del Product Owner. Legacy puede orientar reglas funcionales, pero no se copia como arquitectura.

## Definicion de terminado para tickets futuros

`dotnet build = PASS` no basta. Cada ticket de implementacion debera cubrir, segun aplique: Backend, API, SQL, MVC/frontend, responsive, multitenant, permisos, trazabilidad, compatibilidad historica, producto simple, producto con variante, QA funcional, regresion, QA manual PO, documentacion, `AGENTS.md` y `CLAUDE.md`.

## Tabla 1 - Matriz de verdad actual por modulo

| Modulo | Estado V5 | Evidencia/limite |
|---|---|---|
| ProductosServicios | IMPLEMENTADO Y BASE ACTUAL | Producto, servicio, catalogos, codigos, categorias, marcas, unidades, colecciones, configuracion comercial, SAT, atributos, variantes, costo/precio/imagen por variante, tags, multimedia, paquetes, pesos, ficha tecnica, PDF e inventario fisico/minimo por producto. |
| Ordenes de Compra | IMPLEMENTADA Y APROVECHABLE | Conservar MVC, JS, API, DTOs, PDF, Excel, `OrdenesCompraFolios`, `OrdenesCompra`, `OrdenesCompraDetalle`; no depende de NEXT. |
| Recepcion | NO EXISTE | Debe construirse como modulo nuevo desde OC. |
| Inventario | IMPLEMENTADO POR PRODUCTO / REQUIERE EVOLUCION | Hoy `empresa + producto`; objetivo minimo `empresa + producto + variante nullable`. |
| Cotizaciones | AUDITAR ANTES DE DECIDIR | No demostrable como vertical autorizado; requiere auditoria puntual y decision PO. |
| Pedido | NO EXISTE | Construccion nueva; debe originarse preferentemente desde Cotizacion autorizada. |
| Surtimiento | NO EXISTE | Debe integrarse a Pedido/Venta. |
| Venta | NO EXISTE FUNCIONALMENTE | Placeholder; construccion nueva. |
| Cobro | NO EXISTE | Construccion nueva. |
| Formas de pago | NO EXISTE FUNCIONALMENTE | Placeholder; requiere catalogo operativo. |
| Caja | NO EXISTE | Construccion nueva si PO aprueba reglas. |
| Devoluciones | NO EXISTE FUNCIONALMENTE | Placeholder; construccion nueva desde Venta. |
| NC/Vale | NO EXISTE | Construccion nueva segun politica PO. |
| Ajustes PV | NO EXISTE FUNCIONALMENTE | Placeholder; configuracion por sucursal/tienda pendiente. |
| Usuarios comerciales | NO MATERIALIZADO | Usuario = identidad, Rol = autorizacion, Permiso = capacidad, Operador = identidad operativa existente. |
| Reportes comerciales | PARCIAL / NUEVOS | OC tiene reporte; el resto debe construirse por dominio. |

## Tabla 2 - Modulos congelados / evolucionables / nuevos / auditables

| Clasificacion | Modulos/capacidades |
|---|---|
| IMPLEMENTADO Y APROBADO | ProductosServicios, catalogos P&S, codigos, logistica P&S, ficha tecnica/PDF, factor volumetrico 5000. |
| IMPLEMENTADO / REQUIERE EVOLUCION | OC existente; inventario fisico/minimo por producto; reportes OC. |
| AUDITAR ANTES DE DECIDIR | Cotizaciones, reglas legacy de formas de pago/caja/postventa, saldo historico multi-variante, usuarios comerciales actuales. |
| CONSTRUIR | Recepcion, inventario por variante operativo, Pedido, Surtimiento, Venta, Cobro, Caja, Formas de Pago, Ajustes PV, Devoluciones, NC/Vale, reportes integrales. |
| CONGELADO / NO TOCAR | ProductosServicios aprobado, OC base reutilizable, Login sin instruccion, Roles/Permisos sin ticket, backlogs V1/V2/V3/V4 como historicos. |
| DESCARTADO / SUSTITUIDO | Reconstruir OC desde cero; asumir Cotizaciones NEXT; usar Legacy como base tecnica. |

## Tabla 3 - Flujo comercial objetivo completo

| Paso | Proceso | Origen | Resultado |
|---|---|---|---|
| 1 | ProductosServicios | Catalogo aprobado | Producto/servicio simple o con variante. |
| 2 | OC | Necesidad de compra | Orden generada a proveedor. |
| 3 | Recepcion | OC generada | Recepcion total/parcial. |
| 4 | Movimiento inventario | Recepcion confirmada | Entrada idempotente por producto/variante. |
| 5 | Existencia | Movimiento | Saldo fisico/minimo y futuro disponible. |
| 6 | Cotizacion | Cliente/oportunidad | Oferta con producto, variante, servicio, flete. |
| 7 | Pedido | Cotizacion autorizada | Compromiso comercial de inventario. |
| 8 | Surtimiento | Pedido | Cantidad surtida/pendiente. |
| 9 | Venta | Pedido/surtimiento | Documento de venta. |
| 10 | Cobro | Venta | Pago simple o multiple. |
| 11 | Ticket/documento | Venta cobrada | Comprobante operativo. |
| 12 | Devolucion | Venta | Reversa parcial/total segun politica. |
| 13 | NC/Vale | Devolucion | Saldo a favor aplicable. |
| 14 | Nueva venta/aplicacion | NC/Vale vigente | Consumo parcial/total de saldo. |

## Tabla 4 - Tablas SQL actuales reutilizadas

| Tabla | Uso V5 |
|---|---|
| `ProductosServicios` | Catalogo base de producto/servicio. |
| `ProductosServiciosCategorias` | Catalogo P&S congelado. |
| `ProductosServiciosMarcas` | Catalogo P&S congelado. |
| `ProductosServiciosUnidadesMedida` | Unidad base y OC. |
| `ProductosServiciosColecciones` | Catalogo P&S congelado. |
| `ProductosServiciosPaquetes` | Logistica y pesos. |
| `ProductosServiciosAtributos` | Atributos descriptivos. |
| `ProductosServiciosAtributosValores` | Valores de atributos. |
| `ProductosServiciosProductoAtributos` | Asociacion atributo-producto. |
| `ProductosServiciosProductoAtributoValores` | Valores asignados a producto. |
| `ProductosServiciosOpcionesVariante` | Opciones propias de variante. |
| `ProductosServiciosOpcionesVarianteValores` | Valores de opciones de variante. |
| `ProductosServiciosVariantes` | Variantes existentes con costo/precio/imagen. |
| `ProductosServiciosVarianteValores` | Combinacion de variantes. |
| `ProductosServiciosMultimedia` | Multimedia de P&S. |
| `ProductosServiciosExistencias` | Reutilizar y evolucionar. |
| `ProductosServiciosMovimientosInventario` | Reutilizar y evolucionar. |
| `OrdenesCompraFolios` | Conservar. |
| `OrdenesCompra` | Conservar cabecera OC. |
| `OrdenesCompraDetalle` | Conservar y evolucionar. |
| `ActivosProveedores` | Proveedor usado por OC. |
| `RazonesSociales` | Contexto fiscal/empresa en OC y documentos. |
| `Sucursales` | Contexto operativo/documental. |
| `Usuarios` / roles/permisos actuales | Identidad/autorizacion existentes, previa auditoria. |
| `Operadores` | Referencia operativa para servicios; no duplicar. |

## Tabla 5 - Tablas SQL actuales que requieren evolucion

| Tabla | Evolucion requerida |
|---|---|
| `ProductosServiciosExistencias` | Agregar soporte `idVariante nullable`; evaluar `idSucursal`; conservar historicos. |
| `ProductosServiciosMovimientosInventario` | Agregar `idVariante`, origen documental, idempotencia, posible `idSucursal`. |
| `OrdenesCompraDetalle` | Agregar `idVariante nullable` y snapshot variante; ajustar indice unico por producto. |
| `Roles/Permisos` actuales | Incorporar capacidades comerciales sin crear modelo paralelo. |
| `Operadores` | Vinculo funcional a servicios si PO lo aprueba; no convertir automaticamente en Usuario. |

## Tabla 6 - Tablas nuevas propuestas

| Tabla propuesta | Proceso | Motivo |
|---|---|---|
| `OrdenesCompraRecepciones` | Recepcion | Cabecera recepcion OC. |
| `OrdenesCompraRecepcionDetalle` | Recepcion | Detalle recibido por partida/producto/variante. |
| `InventarioConciliaciones` | Inventario | Conciliar saldos historicos multi-variante si PO aprueba. |
| `InventarioCompromisos` | Pedido | Solo si PO decide persistir comprometido. |
| `Cotizaciones` / evolucion existente | Cotizacion | Sujeto a auditoria puntual. |
| `CotizacionesDetalle` / evolucion existente | Cotizacion | Producto/variante/servicio/flete/pendiente. |
| `Pedidos` | Pedido | Cabecera comercial. |
| `PedidosDetalle` | Pedido | Partidas y compromiso. |
| `PedidosSurtimientos` | Surtimiento | Cabecera surtimiento si se separa de Venta. |
| `PedidosSurtimientoDetalle` | Surtimiento | Cantidades surtidas/pendientes. |
| `FormasPago` | Cobro | Catalogo operativo. |
| `Cajas` | Caja | Caja por empresa/sucursal. |
| `CajasSesiones` | Caja | Apertura/cierre si PO aprueba. |
| `CajasMovimientos` | Caja | Movimientos/arqueo/diferencias. |
| `AjustesPV` | Ajustes PV | Configuracion por empresa/sucursal. |
| `Ventas` | Venta | Cabecera venta. |
| `VentasDetalle` | Venta | Partidas vendidas. |
| `Cobros` | Cobro | Cabecera cobro. |
| `CobrosDetalle` | Cobro | Multiples formas por cobro. |
| `Devoluciones` | Postventa | Cabecera devolucion. |
| `DevolucionesDetalle` | Postventa | Cantidades devueltas. |
| `DocumentosSaldoFavor` | NC/Vale | NC/Vale con vigencia/saldo. |
| `DocumentosSaldoFavorAplicaciones` | NC/Vale | Aplicacion posterior. |
| `AuditoriaComercialEventos` | Transversal | Solo si mecanismo actual no basta. |

## Tabla 7 - Producto simple vs producto con variante por proceso

| Proceso | Producto simple | Producto con variante |
|---|---|---|
| OC | `idProductoServicio`, `idVariante NULL`. | `idProductoServicio`, `idVariante` obligatorio y snapshot. |
| Recepcion | Recibe contra partida simple. | Recibe contra partida con variante exacta. |
| Inventario | Saldo `empresa + producto + NULL`. | Saldo separado `empresa + producto + variante`. |
| Cotizacion | Cotiza producto base. | Cotiza variante y snapshot. |
| Pedido | Compromete producto base. | Compromete variante exacta. |
| Surtimiento | Surte producto base. | Surte variante exacta. |
| Venta | Descarga producto base. | Descarga variante exacta. |
| Devolucion | Reingresa producto base si aplica. | Reingresa variante exacta si aplica. |
| Reportes | Agrupa por producto. | Agrupa por producto y variante. |

## Tabla 8 - Usuario x Proceso x Capacidad

Valores: `OPERA`, `CONSULTA`, `AUTORIZA`, `SUPERVISA`, `PARTICIPA SIN LOGIN`, `NO APLICA`, `DECISION PO`.

| Perfil | Login | ProductosServicios | OC | Autorizar OC | Recepcion | Ajuste inventario | Cotizacion | Autorizar Cotizacion | Pedido | Surtimiento | Servicio | Venta | Cobro | Caja | Devolucion | Autorizar Devolucion | NC/Vale | Ajustes PV | Reportes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Agente | SI | CONSULTA | DECISION PO | NO APLICA | NO APLICA | NO APLICA | OPERA | DECISION PO | OPERA | DECISION PO | DECISION PO | DECISION PO | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | CONSULTA |
| Vendedor | SI | CONSULTA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | OPERA | DECISION PO | OPERA | OPERA | DECISION PO | OPERA | DECISION PO | NO APLICA | DECISION PO | NO APLICA | DECISION PO | NO APLICA | CONSULTA |
| Cajero | SI | CONSULTA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | CONSULTA | NO APLICA | NO APLICA | OPERA | OPERA | OPERA | OPERA | NO APLICA | OPERA | NO APLICA | CONSULTA |
| Operador | SI | CONSULTA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | CONSULTA | OPERA | OPERA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | CONSULTA |
| Ayudante | NO | NO APLICA | NO APLICA | NO APLICA | PARTICIPA SIN LOGIN | NO APLICA | NO APLICA | NO APLICA | NO APLICA | PARTICIPA SIN LOGIN | PARTICIPA SIN LOGIN | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA |
| Administracion | SI | OPERA | OPERA | DECISION PO | OPERA | OPERA | OPERA | DECISION PO | OPERA | CONSULTA | CONSULTA | CONSULTA | CONSULTA | CONSULTA | OPERA | DECISION PO | OPERA | OPERA | CONSULTA |
| Super Usuario | SI | OPERA | OPERA | AUTORIZA | OPERA | OPERA | OPERA | AUTORIZA | OPERA | SUPERVISA | SUPERVISA | OPERA | OPERA | SUPERVISA | OPERA | AUTORIZA | OPERA | OPERA | SUPERVISA |
| Supervisor | SI | CONSULTA | CONSULTA | AUTORIZA | SUPERVISA | AUTORIZA | CONSULTA | AUTORIZA | SUPERVISA | SUPERVISA | SUPERVISA | SUPERVISA | SUPERVISA | SUPERVISA | SUPERVISA | AUTORIZA | SUPERVISA | CONSULTA | SUPERVISA |

## Tabla 9 - Responsables por documento

| Documento | Capturista | Responsable | Autorizador | Sucursal | Trazabilidad |
|---|---|---|---|---|---|
| OC | Usuario que captura | Comprador/Administracion | Supervisor/Super Usuario segun PO | Obligatoria en cabecera actual | Fechas, usuario, proveedor, estado. |
| Recepcion | Usuario receptor | Receptor/Administracion | Segun reversion o excepcion | Deriva de OC o se confirma al recibir | Usuario, fecha/hora, cantidades, movimiento. |
| Cotizacion | Agente/Vendedor | Vendedor/Agente | Supervisor/Super Usuario si aplica | Segun cliente/operacion | Version, vigencia, snapshots. |
| Pedido | Usuario que convierte | Vendedor/Administracion | Segun regla | Sucursal de venta/entrega | Cotizacion origen, estado, compromiso. |
| Surtimiento | Usuario surtidor | Surtidor/Operador | Supervisor si excepcion | Sucursal que surte | Cantidades surtidas/pendientes. |
| Servicio | Usuario asigna | Operador | Supervisor si aplica | Donde se ejecuta | Operador, ayudante, asistencia si aplica. |
| Venta | Usuario vendedor | Vendedor | Supervisor si excepcion | Sucursal/caja | Pedido origen, salida inventario. |
| Cobro | Cajero | Cajero | Supervisor para excepciones | Caja/sucursal | Formas pago, sesion caja. |
| Devolucion | Cajero/Administracion | Responsable postventa | Supervisor/Super Usuario | Sucursal de devolucion | Venta origen, motivos, reingreso. |
| NC/Vale | Cajero/Administracion | Postventa/Administracion | Supervisor/Super Usuario | Sucursal | Vigencia, saldo, aplicaciones. |
| Ajuste Inventario | Usuario autorizado | Administracion/Supervisor | Supervisor/Super Usuario | Sucursal si aplica | Motivo, movimiento, antes/despues. |

## Tabla 10 - Documento origen -> documento destino

| Origen | Destino | Regla |
|---|---|---|
| ProductosServicios | OC Detalle | OC referencia producto/variante; snapshot para historial. |
| OC | Recepcion | Solo OC generada y con pendiente. |
| Recepcion | Movimiento inventario | Solo recepcion confirmada. |
| Movimiento inventario | Existencia | Actualiza saldo fisico por producto/variante. |
| Cotizacion autorizada | Pedido | Conversion idempotente. |
| Pedido | Surtimiento | Cantidades parciales o totales. |
| Pedido/Surtimiento | Venta | Venta preferentemente desde Pedido. |
| Venta | Cobro | Cobro simple o multiple. |
| Cobro | Ticket/documento | Documento operativo. |
| Venta | Devolucion | Cantidades devolubles. |
| Devolucion | Movimiento inventario | Reingreso si aplica. |
| Devolucion | NC/Vale | Documento saldo a favor segun politica. |
| NC/Vale | Cobro futuro | Aplicacion posterior con saldo/vigencia. |

## Tabla 11 - Impacto de cada documento sobre inventario

| Documento | Impacto |
|---|---|
| ProductosServicios | Define si es inventariable y si tiene variantes; no mueve stock por si solo salvo alta inicial actual. |
| OC | No incrementa existencia. |
| Recepcion confirmada | Entrada idempotente a existencia fisica. |
| Cotizacion | Informativa; no compromete ni mueve. |
| Pedido | Compromete inventario si PO aprueba modelo de compromiso. |
| Surtimiento | Prepara/consume compromiso segun decision PO; evitar doble salida con Venta. |
| Venta confirmada | Salida idempotente de existencia fisica y liberacion/consumo de compromiso. |
| Cobro | No mueve inventario. |
| Devolucion | Reingreso idempotente si producto vuelve a inventario. |
| NC/Vale | No mueve inventario; afecta saldo financiero/comercial. |
| Ajuste inventario | Movimiento manual auditado. |

## Tabla 12 - Estados principales por documento

| Documento | Estados propuestos / actuales |
|---|---|
| OC | Actual: Borrador, Generada, Cancelada. Futuro: evaluar Recibida Parcial/Recibida Total. |
| Recepcion | Captura, Confirmada, Cancelada/Reversada segun PO. |
| Cotizacion | Captura, Autorizada, Rechazada, Convertida, Vencida segun auditoria/PO. |
| Pedido | Pendiente, Parcial, Surtido, Cancelado. |
| Surtimiento | Pendiente, Parcial, Completo, Cancelado. |
| Venta | Captura, Confirmada, Cancelada segun PO. |
| Cobro | Pendiente, Pagado, Parcial si PO aprueba, Cancelado. |
| Devolucion | Captura, Autorizada, Confirmada, Rechazada, Cancelada. |
| NC/Vale | Emitido, Parcialmente Aplicado, Aplicado, Vencido, Cancelado. |
| Caja | Cerrada, Abierta, En Cierre, Cerrada con diferencia. |

## Tabla 13 - Decisiones pendientes del Product Owner

| Decision | Impacto |
|---|---|
| Aprobar V5 como backlog rector | Habilita ejecucion por COMV5. |
| Inventario por sucursal ahora o despues | Cambia llave de saldos/movimientos y recepcion. |
| Costo promedio | Define calculo tras recepcion/devolucion. |
| Conciliacion multi-variante | Decide tratamiento de saldo historico sin evidencia. |
| Tipos de movimiento | Estandariza entrada, salida, ajuste, devolucion, recepcion. |
| Impuestos OC | Amplia modelo de OC. |
| Fechas minima/maxima OC | Cierra gap parcial actual. |
| Estados de recepcion y OC recibida | Define ciclo compra. |
| Sobre-recepcion | Permite o bloquea recibir mas de lo ordenado. |
| Reversion de recepcion | Define movimiento inverso y permisos. |
| Cotizaciones: conservar/migrar/reconstruir | Define base tecnica. |
| Venta/cotizacion sin existencia | Afecta Pedido/Venta. |
| Servicio surtido vs ejecutado | Afecta Pedido/Surtimiento/Servicio. |
| Asistencia obligatoria | Afecta Operadores/Ayudantes. |
| Flete parcial | Afecta Cotizacion/Pedido/Venta. |
| Estados Pedido | Define compromiso/surtimiento. |
| Venta libre vs desde Pedido | Cambia flujo comercial. |
| Comprometido persistido vs calculado | Cambia tablas y reportes. |
| Apertura/cierre caja | Cambia flujo de cobro. |
| Politica devolucion | Afecta postventa y ajustes PV. |
| NC vs Vale | Define documentos de saldo a favor. |
| Permisos por perfil | Afecta todos los endpoints y UI. |

## Tabla 14 - Dependencias entre Sprints y Track U

| Track/Sprint | Depende de | Habilita |
|---|---|---|
| S0 Verdad/arquitectura | Auditorias previas | Todo el programa. |
| Track U Usuarios | S0 | Permisos de S2 en adelante; debe avanzar en paralelo. |
| S1 Inventario variante | S0 | S2, S3, S4, S6, S7, S8, reportes. |
| S2 OC + Recepcion | S1 + Track U base | Abastecimiento real. |
| S3 Cotizaciones | S0 auditoria; S1 para stock util | Pedido. |
| S4 Pedido + compromiso | S3 + S1 + Track U | Venta/cobro. |
| S5 Pagos/Caja/Ajustes | S0 + Track U | Venta/cobro/postventa. |
| S6 Venta/Cobro | S4 + S5 + Track U | Postventa. |
| S7 Postventa | S6 + S5 | NC/Vale y reingreso. |
| S8 Reportes/Cierre | S1 a S7 + Track U | Operacion completa y congelamiento. |

## Tabla 15 - Matriz de migracion historica

| Caso | Tratamiento |
|---|---|
| Producto sin variantes | Mantener saldo con `idVariante NULL`. |
| Producto con una variante activa | Candidato a asignar saldo a la variante con aprobacion PO. |
| Producto con multiples variantes y saldo cero | Crear saldos en cero por variante si UI/operacion lo requiere. |
| Producto con multiples variantes y saldo positivo | No repartir automaticamente; requiere conciliacion. |
| Producto con movimientos historicos | Conservar historico producto-level y registrar corte operativo. |
| Producto no inventariable | No crear saldo por variante. |
| Servicio | No inventario. |

## Tabla 16 - Documentos/backlogs anteriores y evolucion hacia V5

| Fuente | Antes | Ahora | Por que | Ticket V5 que sustituye |
|---|---|---|---|---|
| V1 Sprint Usuarios | Usuarios temprano y funcional | Recuperado como Track U transversal | Venta/cobro necesitan perfiles antes de operar. | COMV5-U01 a COMV5-U10 |
| V1 Cotizaciones 2.0 | Asumia aprovechar Cotizaciones | Auditar antes de decidir | V3 no demuestra vertical autorizado. | COMV5-030, COMV5-031 |
| V1 Pedido | Nuevo desde Cotizacion | Se conserva y se refina | Pedido no existe y sera punto de compromiso. | COMV5-040 a COMV5-047 |
| V1 Abastecimiento | OC -> Recepcion -> Existencia | Recuperado con OC aprovechable | Auditoria puntual confirma OC util. | COMV5-020 a COMV5-029 |
| V1 Asistencia | Track separado | Pendiente PO dentro Track U/Servicio | No resolver sin decision. | COMV5-U09, COMV5-037, COMV5-046 |
| V1 Flete | Capacidad funcional | Recuperado sujeto a Cotizacion/Pedido/Venta | Es regla comercial valida, no arquitectura legacy. | COMV5-036, COMV5-045, COMV5-064 |
| V1 Concepto pendiente | Capacidad funcional | Recuperado con resolucion antes de Pedido | Evita contaminar ProductosServicios. | COMV5-035 |
| V4 OC | Evolucion de OC | Se conserva | OC es implementada y aprovechable. | COMV5-020 a COMV5-024 |
| V4 Inventario | Variante nullable | Se conserva y amplia | Necesario para toda cadena. | COMV5-010 a COMV5-018 |
| V4 Usuarios tardio | Sprint S5 | Cambia a Track U transversal | Es dependencia de permisos antes de Venta/Cobro. | COMV5-U01 a COMV5-U10 |
| V4 Reportes | Cierre general | Se separa por reportes minimos | Pedido del PO exige no dejar reportes genericos. | COMV5-080 a COMV5-094 |

---

# Roadmap V5

S0 - Verdad / documentacion / arquitectura  
S1 - Inventario por variante  
S2 - OC + Recepcion  
S3 - Cotizaciones  
S4 - Pedido + compromiso  
S5 - Formas de pago / Caja / Ajustes PV  
S6 - Venta / Cobro  
S7 - Postventa  
S8 - Reportes / cierre  
Track U - Usuarios y capacidades comerciales transversal

## Camino critico recalculado

`ProductosServicios existente -> COMV5-001 -> COMV5-U01 -> COMV5-U02 -> COMV5-010 -> COMV5-011 -> COMV5-012 -> COMV5-020 -> COMV5-021 -> COMV5-025 -> COMV5-027 -> COMV5-030 -> COMV5-031 -> COMV5-040 -> COMV5-043 -> COMV5-050 -> COMV5-051 -> COMV5-060 -> COMV5-062 -> COMV5-063 -> COMV5-070 -> COMV5-071 -> COMV5-080 -> COMV5-094`

---

# S0 - Verdad / documentacion / arquitectura

### COMV5-001 - Oficializar Backlog V5

ID: COMV5-001  
Nombre: Oficializar Backlog V5  
Sprint: S0  
Track: Documentacion  
Prioridad: P0 BLOQUEANTE  
Tipo: DOCUMENTACION  
Estado actual: V4 existe; V1 contiene reglas funcionales valiosas; V2/V3 quedaron historicos o parcialmente contaminados.  
Problema: hay multiples fuentes y algunas contradicen la verdad actual de OC/Cotizaciones.  
Objetivo: declarar V5 como backlog maestro vigente tras aprobacion PO.  
Alcance: crear/validar V5, matriz de verdad, dependencias y dictamen.  
Fuera de alcance: implementar, ejecutar SQL, migrar, cambiar Login/Roles/P&S/OC.  
Proceso origen: auditorias y backlogs previos.  
Proceso destino: programa COMV5.  
Usuarios involucrados: Product Owner, administracion tecnica.  
Permisos/capacidades: consulta documental.  
Frontend: no aplica.  
Backend: no aplica.  
API: no aplica.  
SQL/tablas: no aplica.  
Datos/relaciones: V1/V4/V3/OC auditada/P&S.  
Reglas de negocio: V5 no autoriza codigo por si sola.  
Compatibilidad historica: V1-V4 quedan como referencia historica.  
Variantes: declarar obligatorias en todo proceso futuro que use producto con variantes.  
Sucursal: declarar como decision transversal.  
Inventario: reconocer producto-level actual y variante como gap.  
Trazabilidad: registrar decision PO de vigencia.  
Dependencias: ninguna.  
Decisiones PO: [DECISION PO] aprobar V5 como rector.  
Criterios de aceptacion: archivo V5 existe y contiene tablas obligatorias, tickets y resumen.  
Casos QA: lectura del PO y busqueda de contradicciones con OC/P&S.  
Regresion: no toca producto.  
Riesgos: usar backlog anterior por error.  
Documentacion afectada: V5, futuros AGENTS/CLAUDE.  
Definicion de terminado: V5 aprobado o devuelto con observaciones.

### COMV5-002 - Corregir documentos contaminados por OC

ID: COMV5-002  
Nombre: Corregir documentos contaminados por OC  
Sprint: S0  
Track: Documentacion  
Prioridad: P0 BLOQUEANTE  
Tipo: DOCUMENTACION  
Estado actual: V3 aun clasifica OC como no demostrable; V4 ya la reconoce aprovechable.  
Problema: futuras tareas podrian reconstruir OC por una fuente vieja.  
Objetivo: programar actualizacion documental de V3, V4, AGENTS y CLAUDE.  
Alcance: documentar que OC es implementada/aprovechable, recepcion no existe, inventario requiere variante.  
Fuera de alcance: tocar OC funcional.  
Proceso origen: auditoria puntual OC.  
Proceso destino: verdad documental.  
Usuarios involucrados: PO, agentes futuros.  
Permisos/capacidades: documentacion.  
Frontend: no aplica.  
Backend: no aplica.  
API: no aplica.  
SQL/tablas: no aplica.  
Datos/relaciones: rutas `/Activos/OrdenesCompra/Nueva`, `/Reporte`; tablas OC.  
Reglas de negocio: no declarar recepcion/impuestos como existentes.  
Compatibilidad historica: V3 queda como auditoria historica corregida por V5.  
Variantes: OC actual sin variante; evolucion futura.  
Sucursal: OC actual usa sucursal en cabecera.  
Inventario: OC no mueve stock.  
Trazabilidad: nota de cambio ANTES/AHORA/POR QUE.  
Dependencias: COMV5-001.  
Decisiones PO: ninguna tras aprobar V5.  
Criterios de aceptacion: documentos no dicen que OC debe reconstruirse.  
Casos QA: busqueda textual de `NO DEMOSTRABLE` aplicado a OC.  
Regresion: no aplica.  
Riesgos: sobrecorregir Cotizaciones.  
Documentacion afectada: auditoria V3, backlog V3/V4, AGENTS, CLAUDE.  
Definicion de terminado: referencias alineadas con V5.

### COMV5-003 - Mapa de arquitectura comercial autorizada

ID: COMV5-003  
Nombre: Mapa de arquitectura comercial autorizada  
Sprint: S0  
Track: Arquitectura  
Prioridad: P0 BLOQUEANTE  
Tipo: FUNDACION  
Estado actual: P&S y OC tienen bases reales; resto no existe o requiere auditoria.  
Problema: se pueden mezclar componentes autorizados, placeholders, NEXT y Legacy.  
Objetivo: crear mapa tecnico por modulo, tabla, controlador, vista y estado.  
Alcance: solo lectura de repos y documentos.  
Fuera de alcance: implementacion.  
Proceso origen: repos/documentos.  
Proceso destino: decisiones de ejecucion.  
Usuarios involucrados: PO, administracion tecnica.  
Permisos/capacidades: consulta tecnica.  
Frontend: rutas y placeholders.  
Backend: controladores reales.  
API: endpoints reales.  
SQL/tablas: scripts versionados.  
Datos/relaciones: modulo -> fuente -> decision.  
Reglas de negocio: no asumir funcionalidad por existir codigo.  
Compatibilidad historica: marcar Legacy como referencia.  
Variantes: mapear tablas actuales de variante.  
Sucursal: mapear `Sucursales` donde interviene.  
Inventario: mapear existencias y movimientos actuales.  
Trazabilidad: ruta exacta por hallazgo.  
Dependencias: COMV5-001.  
Decisiones PO: [DECISION PO] validar clasificacion final.  
Criterios de aceptacion: tabla de arquitectura sin ambiguedades.  
Casos QA: muestreo de rutas y scripts.  
Regresion: no aplica.  
Riesgos: documento grande dificil de mantener.  
Documentacion afectada: indice comercial.  
Definicion de terminado: mapa versionado y aprobado.

### COMV5-004 - Guardrails para futuros tickets COMV5

ID: COMV5-004  
Nombre: Guardrails para futuros tickets COMV5  
Sprint: S0  
Track: Documentacion  
Prioridad: P1 ALTA  
Tipo: DOCUMENTACION  
Estado actual: AGENTS/CLAUDE tienen reglas P&S, no todo COMV5.  
Problema: futuros agentes pueden tocar areas congeladas.  
Objetivo: registrar reglas permanentes de ejecucion COMV5.  
Alcance: instrucciones para no reconstruir P&S/OC, no usar NEXT, no SQL sin ticket.  
Fuera de alcance: permisos reales.  
Proceso origen: backlog V5.  
Proceso destino: tareas futuras.  
Usuarios involucrados: agentes, PO.  
Permisos/capacidades: no aplica.  
Frontend: no aplica.  
Backend: no aplica.  
API: no aplica.  
SQL/tablas: no aplica.  
Datos/relaciones: docs sincronizados.  
Reglas de negocio: solo PO aprueba cambios de alcance.  
Compatibilidad historica: respeta cierres P&S.  
Variantes: todo ticket con producto debe cubrir variante.  
Sucursal: todo ticket documental debe declarar impacto.  
Inventario: todo ticket debe declarar si mueve stock.  
Trazabilidad: AGENTS y CLAUDE sincronizados.  
Dependencias: COMV5-001.  
Decisiones PO: [DECISION PO] aprobar redaccion.  
Criterios de aceptacion: reglas visibles y no contradictorias.  
Casos QA: lectura cruzada.  
Regresion: no aplica.  
Riesgos: exceso de reglas sin accion.  
Documentacion afectada: AGENTS, CLAUDE.  
Definicion de terminado: ambos docs actualizados y consistentes.

---

# Track U - Usuarios y capacidades comerciales

### COMV5-U01 - Auditoria de usuarios, roles, permisos y operadores

ID: COMV5-U01  
Nombre: Auditoria de usuarios, roles, permisos y operadores  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P0 BLOQUEANTE  
Tipo: TRANSVERSAL  
Estado actual: Usuario/Rol/Permiso existen; Operador existe fuera del comercial; perfil comercial no materializado.  
Problema: no se sabe quien puede comprar, recibir, cotizar, vender, cobrar o devolver.  
Objetivo: auditar arquitectura actual sin crear `TipoUsuario`.  
Alcance: modelos, controladores, permisos actuales y uso operativo.  
Fuera de alcance: modificar Login, roles, permisos o tablas.  
Proceso origen: identidad actual.  
Proceso destino: matriz comercial.  
Usuarios involucrados: los 8 perfiles PO.  
Permisos/capacidades: auditoria de capacidades existentes.  
Frontend: revisar UI de usuarios/roles si aplica.  
Backend: revisar controladores de usuario/roles/operadores.  
API: revisar endpoints de seguridad.  
SQL/tablas: solo lectura de tablas existentes.  
Datos/relaciones: Usuario, Rol, Permiso, Operador.  
Reglas de negocio: no duplicar identidad.  
Compatibilidad historica: conservar operadores de inspeccion.  
Variantes: no aplica directo.  
Sucursal: auditar si usuarios/roles tienen alcance sucursal.  
Inventario: perfilar ajuste/consulta.  
Trazabilidad: documentar hallazgos con rutas.  
Dependencias: COMV5-001.  
Decisiones PO: ninguna antes de entregar auditoria.  
Criterios de aceptacion: dictamen Usuario/Rol/Permiso/Operador.  
Casos QA: lectura cruzada de permisos actuales.  
Regresion: no toca seguridad.  
Riesgos: permisos actuales insuficientes.  
Documentacion afectada: matriz usuarios V5.  
Definicion de terminado: auditoria lista para decision PO.

### COMV5-U02 - Definir ocho perfiles comerciales PO

ID: COMV5-U02  
Nombre: Definir ocho perfiles comerciales PO  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P0 BLOQUEANTE  
Tipo: TRANSVERSAL  
Estado actual: referencia funcional: Agente, Vendedor, Cajero, Operador, Ayudante, Administracion, Super Usuario, Supervisor.  
Problema: perfil funcional no equivale automaticamente a tabla, enum o rol.  
Objetivo: clasificar cada perfil como identidad, rol, capacidad, responsabilidad o persona sin login.  
Alcance: definicion funcional y matriz.  
Fuera de alcance: crear tabla `TipoUsuario`.  
Proceso origen: referencia PO.  
Proceso destino: capacidades comerciales.  
Usuarios involucrados: 8 perfiles.  
Permisos/capacidades: mapa inicial.  
Frontend: no aplica.  
Backend: no aplica.  
API: no aplica.  
SQL/tablas: no aplica.  
Datos/relaciones: perfil -> login -> tipo funcional.  
Reglas de negocio: Ayudante tiene Login NO como caso especial.  
Compatibilidad historica: Operador no se destruye ni se confunde.  
Variantes: no aplica.  
Sucursal: decidir si perfil se limita por sucursal.  
Inventario: ajustar/consultar/recibir segun perfil.  
Trazabilidad: decision PO por perfil.  
Dependencias: COMV5-U01.  
Decisiones PO: [DECISION PO] clasificacion final.  
Criterios de aceptacion: tabla de perfiles aprobada.  
Casos QA: escenarios por perfil.  
Regresion: no aplica.  
Riesgos: mezclar rol con puesto.  
Documentacion afectada: V5/AGENTS/CLAUDE futuro.  
Definicion de terminado: perfiles aprobados por PO.

### COMV5-U03 - Matriz capacidad x proceso

ID: COMV5-U03  
Nombre: Matriz capacidad x proceso  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P0 BLOQUEANTE  
Tipo: TRANSVERSAL  
Estado actual: matriz propuesta V5 necesita decision.  
Problema: endpoints y UI futuros no sabran validar permisos.  
Objetivo: definir capacidades por proceso para los 8 perfiles.  
Alcance: comprar, autorizar, recibir, ajustar, cotizar, pedir, surtir, vender, cobrar, caja, devolver, NC/Vale, reportes.  
Fuera de alcance: implementar permisos.  
Proceso origen: procesos COMV5.  
Proceso destino: permisos.  
Usuarios involucrados: 8 perfiles.  
Permisos/capacidades: OPERA, CONSULTA, AUTORIZA, SUPERVISA, PARTICIPA SIN LOGIN.  
Frontend: visibilidad futura.  
Backend: autorizacion futura.  
API: guardas futuras.  
SQL/tablas: permisos futuros.  
Datos/relaciones: perfil -> proceso -> capacidad.  
Reglas de negocio: capturista, responsable y autorizador pueden diferir.  
Compatibilidad historica: no rompe roles existentes.  
Variantes: permisos para ajustar/recibir variantes.  
Sucursal: permisos pueden limitarse por sucursal.  
Inventario: ajuste y consulta requieren permisos explicitos.  
Trazabilidad: cada accion sensible guarda usuario.  
Dependencias: COMV5-U02.  
Decisiones PO: [DECISION PO] matriz final.  
Criterios de aceptacion: no hay proceso sin capacidad definida.  
Casos QA: usuario con/sin permiso por accion.  
Regresion: no aplica.  
Riesgos: permisos demasiado amplios.  
Documentacion afectada: matriz V5.  
Definicion de terminado: matriz aprobada.

### COMV5-U04 - Personas sin Login y participacion operativa

ID: COMV5-U04  
Nombre: Personas sin Login y participacion operativa  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P1 ALTA  
Tipo: TRANSVERSAL  
Estado actual: Ayudante tiene Login NO en referencia PO.  
Problema: una persona sin login puede participar pero no autenticar acciones.  
Objetivo: definir como registrar participacion sin convertirla en usuario.  
Alcance: ayudantes, auxiliares de recepcion, servicios.  
Fuera de alcance: crear Login para Ayudante.  
Proceso origen: recepcion/surtimiento/servicio.  
Proceso destino: trazabilidad operativa.  
Usuarios involucrados: Ayudante, Operador, Supervisor.  
Permisos/capacidades: participa sin login, supervisado por usuario autenticado.  
Frontend: selector de persona operativa si aplica.  
Backend: validacion de responsable autenticado.  
API: registrar participante no autenticado.  
SQL/tablas: relacion futura persona/documento si PO aprueba.  
Datos/relaciones: usuario responsable -> participante sin login.  
Reglas de negocio: toda accion debe tener usuario autenticado responsable.  
Compatibilidad historica: respetar Operadores actuales.  
Variantes: no aplica directo.  
Sucursal: registrar sucursal de participacion.  
Inventario: ayudante no confirma movimiento solo.  
Trazabilidad: diferenciar quien opera de quien autoriza.  
Dependencias: COMV5-U03.  
Decisiones PO: [DECISION PO] alcance de ayudante sin login.  
Criterios de aceptacion: participacion sin login queda trazada sin permiso propio.  
Casos QA: recepcion/servicio con ayudante.  
Regresion: no toca login.  
Riesgos: responsabilidad legal/operativa difusa.  
Documentacion afectada: matriz usuarios.  
Definicion de terminado: regla aprobada.

### COMV5-U05 - Integracion con Roles y Permisos

ID: COMV5-U05  
Nombre: Integracion con Roles y Permisos  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P1 ALTA  
Tipo: TRANSVERSAL  
Estado actual: roles/permisos existen, sin capacidades COMV5.  
Problema: falta gobierno de acciones comerciales.  
Objetivo: implementar capacidades comerciales en arquitectura actual.  
Alcance: permisos para todos los procesos.  
Fuera de alcance: reemplazar sistema de seguridad.  
Proceso origen: matriz aprobada.  
Proceso destino: autorizacion en UI/API.  
Usuarios involucrados: todos los perfiles con login.  
Permisos/capacidades: permisos granulares por accion.  
Frontend: ocultar/deshabilitar acciones.  
Backend: validar permisos server-side.  
API: rechazar acciones sin capacidad.  
SQL/tablas: permisos nuevos/configuracion autorizada.  
Datos/relaciones: rol -> permiso -> usuario.  
Reglas de negocio: UI no sustituye validacion backend.  
Compatibilidad historica: no romper permisos existentes.  
Variantes: permisos para acciones por variante.  
Sucursal: alcance por sucursal si PO aprueba.  
Inventario: ajuste/recepcion/salida protegidos.  
Trazabilidad: registrar usuario en accion.  
Dependencias: COMV5-U03.  
Decisiones PO: ninguna tras aprobar matriz.  
Criterios de aceptacion: usuario sin permiso no ejecuta accion.  
Casos QA: pruebas por rol.  
Regresion: login y permisos existentes.  
Riesgos: brechas API/MVC.  
Documentacion afectada: AGENTS/CLAUDE.  
Definicion de terminado: permisos implementados y probados.

### COMV5-U06 - Responsables documentales comerciales

ID: COMV5-U06  
Nombre: Responsables documentales comerciales  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P1 ALTA  
Tipo: TRANSVERSAL  
Estado actual: no hay regla unica para capturista/responsable/autorizador.  
Problema: documentos futuros pueden perder auditoria real.  
Objetivo: definir campos y reglas de responsabilidad por documento.  
Alcance: OC, recepcion, cotizacion, pedido, surtimiento, servicio, venta, cobro, devolucion, NC/Vale, ajuste.  
Fuera de alcance: implementar tablas de todos los documentos.  
Proceso origen: matriz de responsables.  
Proceso destino: modelos de documentos.  
Usuarios involucrados: capturista, responsable, autorizador, supervisor.  
Permisos/capacidades: operar, autorizar, supervisar.  
Frontend: mostrar responsables cuando aplique.  
Backend: guardar IDs.  
API: validar responsables requeridos.  
SQL/tablas: columnas por documento futuro.  
Datos/relaciones: documento -> usuarios/participantes.  
Reglas de negocio: quien capturo no siempre es responsable.  
Compatibilidad historica: OC actual conserva usuario existente y se extiende sin romper.  
Variantes: documentos con producto guardan variante.  
Sucursal: documento debe tener sucursal si opera inventario/caja.  
Inventario: movimiento guarda usuario responsable.  
Trazabilidad: cadena usuario-fecha-documento.  
Dependencias: COMV5-U03.  
Decisiones PO: [DECISION PO] responsables obligatorios por documento.  
Criterios de aceptacion: ningun documento critico queda sin actor.  
Casos QA: documento creado por A responsable B autorizado C.  
Regresion: OC existente.  
Riesgos: exceso de captura manual.  
Documentacion afectada: tabla responsables.  
Definicion de terminado: regla incorporada a tickets de implementacion.

### COMV5-U07 - Autorizaciones comerciales

ID: COMV5-U07  
Nombre: Autorizaciones comerciales  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P1 ALTA  
Tipo: TRANSVERSAL  
Estado actual: autorizaciones comerciales no definidas.  
Problema: OC, Cotizacion, Devolucion y Ajuste requieren aprobaciones distintas.  
Objetivo: definir que documentos requieren autorizacion y quien puede autorizar.  
Alcance: OC, cotizacion, ajuste inventario, devolucion, NC/Vale, excepciones de venta/caja.  
Fuera de alcance: motor complejo de workflow.  
Proceso origen: documentos comerciales.  
Proceso destino: reglas de estado.  
Usuarios involucrados: Supervisor, Super Usuario, Administracion.  
Permisos/capacidades: AUTORIZA.  
Frontend: botones de autorizacion.  
Backend: validacion y bitacora.  
API: endpoints aprobar/rechazar.  
SQL/tablas: estados y auditoria por documento.  
Datos/relaciones: documento -> autorizador -> fecha.  
Reglas de negocio: autorizador puede diferir de capturista.  
Compatibilidad historica: no forzar autorizacion a documentos historicos sin regla.  
Variantes: aplica a documentos con variantes igual que simples.  
Sucursal: autorizacion puede limitarse por sucursal.  
Inventario: ajustes y reversiones requieren autorizacion.  
Trazabilidad: motivo y usuario obligatorios.  
Dependencias: COMV5-U03, COMV5-U06.  
Decisiones PO: [DECISION PO] documentos que requieren autorizacion.  
Criterios de aceptacion: acciones criticas bloqueadas sin autorizador.  
Casos QA: usuario operador intenta autorizar y falla.  
Regresion: no aplica.  
Riesgos: friccion operativa.  
Documentacion afectada: matriz autorizaciones.  
Definicion de terminado: reglas autorizadas por PO.

### COMV5-U08 - Sucursal y alcance operativo por usuario

ID: COMV5-U08  
Nombre: Sucursal y alcance operativo por usuario  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P2 MEDIA  
Tipo: TRANSVERSAL  
Estado actual: documentos usan sucursal, pero permisos por sucursal no estan definidos.  
Problema: usuario podria operar o ver sucursales indebidas.  
Objetivo: decidir alcance por sucursal para procesos comerciales.  
Alcance: consulta, operacion, caja, inventario, reportes.  
Fuera de alcance: implementar restriccion hasta decision.  
Proceso origen: usuarios/sucursales.  
Proceso destino: permisos por sucursal.  
Usuarios involucrados: perfiles con login.  
Permisos/capacidades: operar/consultar por sucursal.  
Frontend: filtros y combos limitados.  
Backend: validacion de sucursal.  
API: scope por empresa/sucursal.  
SQL/tablas: relacion usuario-sucursal si no existe.  
Datos/relaciones: usuario -> sucursal -> proceso.  
Reglas de negocio: multitenant primero; sucursal segundo.  
Compatibilidad historica: documentos antiguos sin scope sucursal se tratan segun regla.  
Variantes: inventario por variante puede ademas ser por sucursal.  
Sucursal: eje central.  
Inventario: decision afecta saldos.  
Trazabilidad: guardar sucursal real de operacion.  
Dependencias: COMV5-U03.  
Decisiones PO: [DECISION PO] limitar permisos por sucursal.  
Criterios de aceptacion: regla de visibilidad aprobada.  
Casos QA: usuario sucursal A no opera B si aplica.  
Regresion: multitenant.  
Riesgos: complejidad de permisos.  
Documentacion afectada: matriz usuario/proceso.  
Definicion de terminado: decision documentada.

### COMV5-U09 - Asistencia y operadores/ayudantes en servicios

ID: COMV5-U09  
Nombre: Asistencia y operadores/ayudantes en servicios  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P2 MEDIA  
Tipo: TRANSVERSAL  
Estado actual: V1 incluia asistencia/operacion; V4 la dejo como decision.  
Problema: servicios pueden requerir operador, ayudante y evidencia de ejecucion.  
Objetivo: recuperar capacidad V1 sin resolverla por cuenta propia.  
Alcance: asistencia, operador sugerido/asignado, ayudante sin login, servicio ejecutado.  
Fuera de alcance: motor de asistencia si PO no lo aprueba.  
Proceso origen: Cotizacion/Pedido/Servicio.  
Proceso destino: ejecucion de servicio.  
Usuarios involucrados: Operador, Ayudante, Supervisor.  
Permisos/capacidades: opera/participa/supervisa.  
Frontend: seleccion de operador/ayudante si aplica.  
Backend: registrar asignacion/ejecucion.  
API: endpoints de asignacion futura.  
SQL/tablas: servicios/asistencia si se aprueba.  
Datos/relaciones: servicio -> operador -> ayudante -> evidencia.  
Reglas de negocio: servicio surtido no necesariamente es servicio ejecutado.  
Compatibilidad historica: no tocar Operadores existentes sin ticket.  
Variantes: no aplica directo.  
Sucursal: servicio puede ejecutarse en sucursal o ubicacion cliente.  
Inventario: servicios no descuentan stock salvo insumos futuros.  
Trazabilidad: fecha, responsable, participante.  
Dependencias: COMV5-U04.  
Decisiones PO: [DECISION PO] asistencia obligatoria; [DECISION PO] servicio surtido vs ejecutado.  
Criterios de aceptacion: regla definida antes de Venta/Servicio.  
Casos QA: servicio con operador y ayudante.  
Regresion: operadores actuales.  
Riesgos: alcance crece hacia operaciones no comerciales.  
Documentacion afectada: docs de servicio.  
Definicion de terminado: decision PO lista.

### COMV5-U10 - Auditoria comercial de acciones sensibles

ID: COMV5-U10  
Nombre: Auditoria comercial de acciones sensibles  
Sprint: Track U  
Track: Usuarios transversal  
Prioridad: P2 MEDIA  
Tipo: TRANSVERSAL  
Estado actual: trazabilidad existe de forma parcial por modulo.  
Problema: acciones sensibles requieren consulta auditable.  
Objetivo: definir bitacora o uso de campos existentes para acciones comerciales.  
Alcance: compra, autorizacion, recepcion, ajuste, cotizacion, pedido, venta, cobro, devolucion.  
Fuera de alcance: logging excesivo sin utilidad.  
Proceso origen: documentos comerciales.  
Proceso destino: reporte auditoria.  
Usuarios involucrados: todos los perfiles con login.  
Permisos/capacidades: consulta/supervision.  
Frontend: reporte futuro.  
Backend: registrar eventos.  
API: endpoint de consulta.  
SQL/tablas: `AuditoriaComercialEventos` solo si hace falta.  
Datos/relaciones: actor, documento, accion, fecha, sucursal.  
Reglas de negocio: accion critica debe dejar rastro.  
Compatibilidad historica: no inventar eventos antiguos.  
Variantes: incluir producto/variante cuando aplique.  
Sucursal: incluir sucursal.  
Inventario: movimientos son parte de trazabilidad.  
Trazabilidad: objetivo principal.  
Dependencias: COMV5-U05, COMV5-U06.  
Decisiones PO: [DECISION PO] retencion y visibilidad.  
Criterios de aceptacion: auditoria filtra por usuario/proceso/fecha.  
Casos QA: acciones sensibles visibles.  
Regresion: rendimiento.  
Riesgos: volumen de datos.  
Documentacion afectada: reportes/auditoria.  
Definicion de terminado: mecanismo definido y probado.

---

# S1 - Inventario por variante

### COMV5-010 - Auditoria de saldos actuales

ID: COMV5-010  
Nombre: Auditoria de saldos actuales  
Sprint: S1  
Track: Inventario  
Prioridad: P0 BLOQUEANTE  
Tipo: FUNDACION  
Estado actual: existencia actual por `empresa + producto`; movimientos por producto.  
Problema: no se sabe que saldos pueden migrarse a variante sin riesgo.  
Objetivo: clasificar saldos por producto, variantes y movimientos.  
Alcance: reporte de solo lectura.  
Fuera de alcance: update, migracion, conciliacion.  
Proceso origen: ProductosServiciosExistencias/Movimientos/Variantes.  
Proceso destino: plan migracion.  
Usuarios involucrados: Administracion, Supervisor.  
Permisos/capacidades: consulta inventario.  
Frontend: reporte/exportable futuro.  
Backend: consulta auditoria.  
API: endpoint solo lectura si se implementa.  
SQL/tablas: `ProductosServiciosExistencias`, `ProductosServiciosMovimientosInventario`, `ProductosServiciosVariantes`.  
Datos/relaciones: producto -> variantes -> saldo -> movimientos.  
Reglas de negocio: no repartir multi-variante sin evidencia.  
Compatibilidad historica: clasificar historicos intactos.  
Variantes: contar activas por producto.  
Sucursal: no existe en saldo actual; marcar decision.  
Inventario: fisica/minima/costo promedio actual.  
Trazabilidad: reporte con fecha y usuario auditor.  
Dependencias: COMV5-001.  
Decisiones PO: [DECISION PO] autorizar auditoria de datos.  
Criterios de aceptacion: casos sin variante, una variante, multi-variante, saldo cero y con movimientos.  
Casos QA: muestreo manual contra SQL.  
Regresion: no modifica datos.  
Riesgos: datos incompletos.  
Documentacion afectada: matriz migracion.  
Definicion de terminado: dictamen de migracion por caso.

### COMV5-011 - Llave de existencia con idVariante nullable

ID: COMV5-011  
Nombre: Llave de existencia con idVariante nullable  
Sprint: S1  
Track: Inventario  
Prioridad: P0 BLOQUEANTE  
Tipo: FUNDACION  
Estado actual: llave unica `idEmpresa + idProductoServicio`.  
Problema: variante 946 ml y 5 L se mezclan.  
Objetivo: evolucionar a `idEmpresa + idProductoServicio + idVariante nullable`.  
Alcance: diseno e implementacion futura de columna, indices y consultas.  
Fuera de alcance: inventario por sucursal si PO lo posterga.  
Proceso origen: catalogo P&S.  
Proceso destino: existencia por variante.  
Usuarios involucrados: Administracion, Supervisor.  
Permisos/capacidades: ajustar/consultar inventario.  
Frontend: mostrar saldo por variante.  
Backend: buscar saldo por variante.  
API: contratos con `idVariante`.  
SQL/tablas: evolucion `ProductosServiciosExistencias`.  
Datos/relaciones: variante pertenece a producto y empresa.  
Reglas de negocio: producto sin variantes usa NULL; producto con variantes exige variante.  
Compatibilidad historica: historicos quedan en NULL hasta conciliacion.  
Variantes: obligatorias cuando existan.  
Sucursal: parametro preparado.  
Inventario: saldo fisico/minimo por clave.  
Trazabilidad: migracion documentada.  
Dependencias: COMV5-010.  
Decisiones PO: [DECISION PO] aprobar modelo de llave.  
Criterios de aceptacion: saldos separados por variante.  
Casos QA: Aceite 946 ml=10 y 5 L=3.  
Regresion: producto simple sigue funcionando.  
Riesgos: unicidad con NULL y queries viejas.  
Documentacion afectada: modelo datos inventario.  
Definicion de terminado: modelo aplicado, probado y documentado.

### COMV5-012 - Movimientos por variante y origen documental

ID: COMV5-012  
Nombre: Movimientos por variante y origen documental  
Sprint: S1  
Track: Inventario  
Prioridad: P0 BLOQUEANTE  
Tipo: FUNDACION  
Estado actual: movimientos por producto, con referencia textual.  
Problema: no hay variante ni idempotencia documental robusta.  
Objetivo: extender movimiento con variante, sucursal opcional y origen documental unico.  
Alcance: entradas, salidas, ajustes, recepciones, devoluciones.  
Fuera de alcance: crear documentos que aun no existan.  
Proceso origen: movimiento manual/recepcion/venta/devolucion futuros.  
Proceso destino: Kardex por producto/variante.  
Usuarios involucrados: Administracion, Receptor, Cajero, Supervisor.  
Permisos/capacidades: opera/autoriza/supervisa.  
Frontend: historial por variante.  
Backend: servicio central de movimiento.  
API: insertar/consultar movimiento con origen.  
SQL/tablas: evolucion `ProductosServiciosMovimientosInventario`.  
Datos/relaciones: origen tipo/id/detalle -> movimiento.  
Reglas de negocio: un origen documental no duplica movimiento.  
Compatibilidad historica: movimientos viejos quedan sin origen estructurado.  
Variantes: requerida para productos con variantes.  
Sucursal: nullable hasta decision.  
Inventario: actualiza existencia fisica.  
Trazabilidad: usuario, fecha, documento.  
Dependencias: COMV5-011.  
Decisiones PO: [DECISION PO] catalogo de tipos movimiento.  
Criterios de aceptacion: movimiento idempotente por origen.  
Casos QA: doble intento recepcion/venta no duplica saldo.  
Regresion: movimientos actuales siguen consultables.  
Riesgos: servicio central mal bloqueado.  
Documentacion afectada: inventario/kardex.  
Definicion de terminado: movimientos por variante funcionando.

### COMV5-013 - Compatibilidad historica y corte operativo

ID: COMV5-013  
Nombre: Compatibilidad historica y corte operativo  
Sprint: S1  
Track: Inventario  
Prioridad: P0 BLOQUEANTE  
Tipo: FUNDACION  
Estado actual: saldos y movimientos historicos estan a nivel producto.  
Problema: migrar sin reglas puede falsear inventario.  
Objetivo: definir corte operativo y lectura compatible.  
Alcance: reglas historicas, saldos NULL, fecha corte, reporte.  
Fuera de alcance: repartir saldos multi-variante.  
Proceso origen: historico producto-level.  
Proceso destino: operacion variant-level.  
Usuarios involucrados: Administracion, Supervisor.  
Permisos/capacidades: consulta/autoriza.  
Frontend: indicar saldo pendiente conciliacion.  
Backend: consultas compatibles.  
API: distinguir historico vs nuevo.  
SQL/tablas: existencias/movimientos.  
Datos/relaciones: producto antiguo -> variante futura.  
Reglas de negocio: no alterar historico sin evidencia.  
Compatibilidad historica: objetivo principal.  
Variantes: nuevas operaciones requieren variante si aplica.  
Sucursal: corte puede repetirse si se agrega sucursal.  
Inventario: saldo fisico preservado.  
Trazabilidad: fecha de corte y usuario.  
Dependencias: COMV5-010, COMV5-011.  
Decisiones PO: [DECISION PO] regla de saldos ambiguos.  
Criterios de aceptacion: productos antiguos se consultan sin error.  
Casos QA: saldo viejo sin variante, nuevo con variante.  
Regresion: catalogo P&S.  
Riesgos: confusion visual.  
Documentacion afectada: matriz migracion.  
Definicion de terminado: plan aprobado y aplicado cuando toque.

### COMV5-014 - Conciliacion multi-variante

ID: COMV5-014  
Nombre: Conciliacion multi-variante  
Sprint: S1  
Track: Inventario  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: no existe flujo para asignar saldo producto a variantes.  
Problema: productos con multiples variantes no pueden migrarse automaticamente.  
Objetivo: definir/proveer conciliacion manual auditada.  
Alcance: lista de pendientes, asignacion, evidencia, aprobacion.  
Fuera de alcance: reparto automatico.  
Proceso origen: saldo producto-level ambiguo.  
Proceso destino: saldos variant-level.  
Usuarios involucrados: Administracion, Supervisor.  
Permisos/capacidades: OPERA/AUTORIZA ajuste.  
Frontend: pantalla conciliacion.  
Backend: validar suma y permisos.  
API: guardar conciliacion.  
SQL/tablas: posible `InventarioConciliaciones`.  
Datos/relaciones: saldo original -> asignaciones por variante.  
Reglas de negocio: suma asignada debe cuadrar.  
Compatibilidad historica: conservar movimiento/corte.  
Variantes: foco del ticket.  
Sucursal: incluir si PO decide.  
Inventario: crea/ajusta existencias por variante.  
Trazabilidad: usuario, fecha, motivo, evidencia.  
Dependencias: COMV5-013, COMV5-U07.  
Decisiones PO: [DECISION PO] quien concilia y autoriza.  
Criterios de aceptacion: conciliacion no pierde ni crea saldo neto.  
Casos QA: producto con dos variantes y saldo 13.  
Regresion: productos simples.  
Riesgos: error humano.  
Documentacion afectada: manual inventario.  
Definicion de terminado: conciliacion auditada.

### COMV5-015 - Existencia minima por variante

ID: COMV5-015  
Nombre: Existencia minima por variante  
Sprint: S1  
Track: Inventario  
Prioridad: P1 ALTA  
Tipo: CORE  
Estado actual: minima por producto.  
Problema: variantes pueden tener minimos distintos.  
Objetivo: soportar minima por clave de existencia.  
Alcance: captura/consulta minima por producto simple o variante.  
Fuera de alcance: sugerencias automaticas de compra.  
Proceso origen: ProductosServicios/inventario.  
Proceso destino: alertas y reportes.  
Usuarios involucrados: Administracion.  
Permisos/capacidades: ajustar inventario/configuracion.  
Frontend: editor minima por variante.  
Backend: validacion minima >= 0.  
API: guardar minima.  
SQL/tablas: `ProductosServiciosExistencias.ExistenciaMinima`.  
Datos/relaciones: existencia -> minima.  
Reglas de negocio: minima no mueve stock.  
Compatibilidad historica: minima vieja va a NULL o variante segun migracion.  
Variantes: minima por variante.  
Sucursal: minima por sucursal si PO decide.  
Inventario: alertas bajo minimo.  
Trazabilidad: fecha/usuario actualizacion.  
Dependencias: COMV5-011.  
Decisiones PO: [DECISION PO] minima por sucursal.  
Criterios de aceptacion: variantes con minimos diferentes.  
Casos QA: 946 ml minimo 5, 5 L minimo 2.  
Regresion: producto simple.  
Riesgos: duplicar configuracion.  
Documentacion afectada: manual inventario.  
Definicion de terminado: minima por variante probada.

### COMV5-016 - Comprometido y disponible preparado

ID: COMV5-016  
Nombre: Comprometido y disponible preparado  
Sprint: S1  
Track: Inventario  
Prioridad: P1 ALTA  
Tipo: FUNDACION  
Estado actual: no existe Pedido ni comprometido real.  
Problema: disponible comercial no puede inventarse.  
Objetivo: definir formula y preparacion para S4.  
Alcance: `Fisica`, `Comprometida`, `Disponible`.  
Fuera de alcance: crear compromiso antes de Pedido.  
Proceso origen: inventario fisico.  
Proceso destino: Pedido/Venta/Cotizacion.  
Usuarios involucrados: Vendedor, Administracion, Supervisor.  
Permisos/capacidades: consulta.  
Frontend: mostrar disponible solo cuando exista regla.  
Backend: servicio de calculo.  
API: lectura de disponibilidad.  
SQL/tablas: posible `InventarioCompromisos` en S4.  
Datos/relaciones: existencia - compromiso.  
Reglas de negocio: antes de Pedido, disponible = fisica si se muestra.  
Compatibilidad historica: no comprometido historico.  
Variantes: compromiso por variante.  
Sucursal: decision pendiente.  
Inventario: no mueve stock.  
Trazabilidad: fuente de calculo.  
Dependencias: COMV5-011.  
Decisiones PO: [DECISION PO] comprometido persistido vs calculado.  
Criterios de aceptacion: no hay comprometido falso.  
Casos QA: cotizacion muestra existencia sin reservar.  
Regresion: reportes P&S.  
Riesgos: confusion operativa.  
Documentacion afectada: reglas inventario.  
Definicion de terminado: formula aprobada.

### COMV5-017 - Ajuste inventario por variante

ID: COMV5-017  
Nombre: Ajuste inventario por variante  
Sprint: S1  
Track: Inventario  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: existen movimientos manuales por producto.  
Problema: ajuste futuro debe afectar variante correcta.  
Objetivo: evolucionar ajuste manual con variante, motivo y permisos.  
Alcance: entrada/salida/ajuste por producto simple o variante.  
Fuera de alcance: recepcion/venta/devolucion automatica.  
Proceso origen: ajuste manual.  
Proceso destino: movimiento inventario.  
Usuarios involucrados: Administracion, Supervisor.  
Permisos/capacidades: OPERA/AUTORIZA ajuste.  
Frontend: selector variante y motivo.  
Backend: validar permisos y saldo si aplica.  
API: movimiento ajuste.  
SQL/tablas: movimientos/existencias.  
Datos/relaciones: ajuste -> movimiento -> existencia.  
Reglas de negocio: no ajustar producto con variantes sin variante.  
Compatibilidad historica: ajustes viejos producto-level se leen.  
Variantes: obligatorio si existen.  
Sucursal: si aplica.  
Inventario: cambia fisica.  
Trazabilidad: usuario, motivo, antes/despues.  
Dependencias: COMV5-012, COMV5-U07.  
Decisiones PO: [DECISION PO] motivos y autorizacion.  
Criterios de aceptacion: ajuste variant-level idempotente/auditable.  
Casos QA: ajuste positivo/negativo.  
Regresion: producto simple.  
Riesgos: ajustes indebidos.  
Documentacion afectada: manual inventario.  
Definicion de terminado: ajuste probado con permisos.

### COMV5-018 - Decision de inventario por sucursal

ID: COMV5-018  
Nombre: Decision de inventario por sucursal  
Sprint: S1  
Track: Inventario  
Prioridad: P0 BLOQUEANTE  
Tipo: FUNDACION  
Estado actual: inventario no tiene sucursal; OC si tiene sucursal.  
Problema: recepcion/venta por sucursal pueden requerir saldo separado.  
Objetivo: decidir si la llave incluye sucursal ahora o se prepara para despues.  
Alcance: analisis tecnico y operativo.  
Fuera de alcance: implementar sin decision.  
Proceso origen: inventario/recepcion/venta.  
Proceso destino: modelo de saldos.  
Usuarios involucrados: PO, Administracion, Supervisor.  
Permisos/capacidades: decision.  
Frontend: impacto en filtros/combos.  
Backend: impacto en servicios.  
API: impacto en contratos.  
SQL/tablas: `idSucursal` en existencias/movimientos si aplica.  
Datos/relaciones: empresa/sucursal/producto/variante.  
Reglas de negocio: recepcion debe registrar sucursal aunque saldo no la use.  
Compatibilidad historica: si se agrega despues, habra segunda migracion.  
Variantes: combina con `idVariante`.  
Sucursal: objetivo principal.  
Inventario: define granularidad real.  
Trazabilidad: documentar decision.  
Dependencias: COMV5-011, COMV5-U08.  
Decisiones PO: [DECISION PO] inventario por sucursal ahora o despues.  
Criterios de aceptacion: decision cerrada antes de recepcion.  
Casos QA: dos sucursales con misma variante.  
Regresion: no aplica si solo decision.  
Riesgos: rehacer saldos despues.  
Documentacion afectada: modelo inventario.  
Definicion de terminado: PO decide granularidad.

---

# S2 - OC + Recepcion

### COMV5-020 - Evolucion OC Detalle con variante

ID: COMV5-020  
Nombre: Evolucion OC Detalle con variante  
Sprint: S2  
Track: Abastecimiento  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: OC existe y detalle no tiene `idVariante`.  
Problema: no distingue variantes del mismo producto.  
Objetivo: agregar `idVariante nullable` y snapshot variante sin reconstruir OC.  
Alcance: SQL, API, DTO, MVC/JS y reportes de detalle.  
Fuera de alcance: recepcion e inventario automatico.  
Proceso origen: ProductosServicios/Variantes.  
Proceso destino: OC Detalle.  
Usuarios involucrados: Comprador/Administracion.  
Permisos/capacidades: comprar.  
Frontend: partida con variante.  
Backend: validacion producto-variante.  
API: request/response con `idVariante`.  
SQL/tablas: `OrdenesCompraDetalle`.  
Datos/relaciones: variante pertenece al producto.  
Reglas de negocio: producto con variantes exige variante; simple usa NULL.  
Compatibilidad historica: OC antiguas quedan con NULL.  
Variantes: snapshot nombre/SKU/combinacion.  
Sucursal: cabecera OC actual.  
Inventario: no mueve stock.  
Trazabilidad: usuario y fechas actuales.  
Dependencias: COMV5-011, COMV5-012.  
Decisiones PO: ninguna tecnica tras aprobar V5.  
Criterios de aceptacion: misma OC acepta dos variantes del mismo producto.  
Casos QA: 946 ml y 5 L en una OC.  
Regresion: OC simple sigue guardando/generando/cancelando.  
Riesgos: indice unico actual por producto.  
Documentacion afectada: OC API/modelo.  
Definicion de terminado: OC variante probada end-to-end.

### COMV5-021 - UI OC selector de variante

ID: COMV5-021  
Nombre: UI OC selector de variante  
Sprint: S2  
Track: Abastecimiento  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: JS agrega producto directamente por `idProductoServicio`.  
Problema: permite producto con variantes sin elegir variante.  
Objetivo: exigir seleccion de variante cuando aplique.  
Alcance: buscador, partida, validaciones y revision.  
Fuera de alcance: redisenar toda la pantalla OC.  
Proceso origen: busqueda producto.  
Proceso destino: partida OC.  
Usuarios involucrados: Comprador.  
Permisos/capacidades: comprar.  
Frontend: selector o modal de variantes.  
Backend: endpoint/lista variantes.  
API: devolver `TieneVariantes` y variantes activas.  
SQL/tablas: `ProductosServiciosVariantes`.  
Datos/relaciones: producto -> variantes activas.  
Reglas de negocio: no guardar sin variante si producto tiene variantes.  
Compatibilidad historica: partidas antiguas renderizan sin selector si NULL.  
Variantes: descripcion `Producto - Variante`.  
Sucursal: no cambia.  
Inventario: no mueve stock.  
Trazabilidad: snapshot visible.  
Dependencias: COMV5-020.  
Decisiones PO: [DECISION PO] formato visible de variante.  
Criterios de aceptacion: validacion frontend/backend.  
Casos QA: producto simple, producto con una variante, multiples variantes.  
Regresion: busqueda actual.  
Riesgos: UX con muchas variantes.  
Documentacion afectada: manual OC.  
Definicion de terminado: selector validado en desktop/mobile.

### COMV5-022 - PDF y Excel OC con variante

ID: COMV5-022  
Nombre: PDF y Excel OC con variante  
Sprint: S2  
Track: Abastecimiento  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: documentos OC no muestran variante.  
Problema: proveedor y usuario no distinguen presentaciones.  
Objetivo: extender documentos con variante sin romper formato.  
Alcance: DTO documento, PDF, Excel, reporte detalle.  
Fuera de alcance: impuestos salvo ticket dedicado.  
Proceso origen: OC generada.  
Proceso destino: PDF/Excel.  
Usuarios involucrados: Comprador, Proveedor, Administracion.  
Permisos/capacidades: consulta/exporta OC.  
Frontend: botones existentes.  
Backend: generacion documental.  
API: detalle con snapshot.  
SQL/tablas: `OrdenesCompraDetalle`.  
Datos/relaciones: detalle -> variante snapshot.  
Reglas de negocio: producto simple no muestra ruido.  
Compatibilidad historica: documentos antiguos exportan sin variante.  
Variantes: columna/subtitulo visible.  
Sucursal: mostrar como actual.  
Inventario: no mueve.  
Trazabilidad: documento refleja snapshot.  
Dependencias: COMV5-020.  
Decisiones PO: [DECISION PO] etiqueta final documento.  
Criterios de aceptacion: PDF/Excel distinguen variantes.  
Casos QA: exportar OC mixta.  
Regresion: PDF actual.  
Riesgos: layout PDF.  
Documentacion afectada: OC docs.  
Definicion de terminado: documentos aprobados.

### COMV5-023 - Gaps parciales OC: impuestos y fechas

ID: COMV5-023  
Nombre: Gaps parciales OC: impuestos y fechas  
Sprint: S2  
Track: Abastecimiento  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: no impuestos; fechas minima/maxima parciales en UI.  
Problema: reglas incompletas pueden confundir compra.  
Objetivo: decidir e implementar solo lo aprobado.  
Alcance: impuestos OC, fecha minima/maxima, validacion.  
Fuera de alcance: facturacion completa.  
Proceso origen: captura OC.  
Proceso destino: OC validada.  
Usuarios involucrados: Comprador, Administracion.  
Permisos/capacidades: comprar.  
Frontend: campos/validaciones.  
Backend: validar reglas.  
API: persistir si aplica.  
SQL/tablas: columnas OC si PO aprueba.  
Datos/relaciones: fechas/totales.  
Reglas de negocio: no inventar impuestos.  
Compatibilidad historica: OC antiguas con null/default.  
Variantes: no afecta.  
Sucursal: podria afectar reglas fiscales.  
Inventario: no mueve.  
Trazabilidad: decision PO.  
Dependencias: COMV5-020.  
Decisiones PO: [DECISION PO] impuestos OC; [DECISION PO] fechas minima/maxima.  
Criterios de aceptacion: reglas visibles y consistentes.  
Casos QA: fechas fuera de rango; totales con/sin impuesto.  
Regresion: generar/cancelar OC.  
Riesgos: alcance fiscal.  
Documentacion afectada: OC reglas.  
Definicion de terminado: decision aplicada o congelada.

### COMV5-024 - Estados OC para recepcion

ID: COMV5-024  
Nombre: Estados OC para recepcion  
Sprint: S2  
Track: Abastecimiento  
Prioridad: P1 ALTA  
Tipo: CORE  
Estado actual: OC tiene Borrador/Generada/Cancelada.  
Problema: recepciones parciales necesitan estado operacional.  
Objetivo: definir si OC conserva estados actuales y calcula recibido, o agrega recibida parcial/total.  
Alcance: reglas de estado y visualizacion.  
Fuera de alcance: recepcion detalle.  
Proceso origen: OC.  
Proceso destino: Recepcion.  
Usuarios involucrados: Comprador, Receptor, Supervisor.  
Permisos/capacidades: consulta/recibe.  
Frontend: badges/estado.  
Backend: calculo estado.  
API: respuesta resumen.  
SQL/tablas: posible columna/estado nuevo solo si PO aprueba.  
Datos/relaciones: OC -> recepciones.  
Reglas de negocio: OC cancelada no se recibe.  
Compatibilidad historica: estados actuales siguen validos.  
Variantes: recibido por variante en detalle.  
Sucursal: hereda cabecera.  
Inventario: estado no mueve.  
Trazabilidad: fecha de cierre recepcion si aplica.  
Dependencias: COMV5-025.  
Decisiones PO: [DECISION PO] estados OC recibida parcial/total.  
Criterios de aceptacion: OC 10, recibido 4, pendiente 6 visible.  
Casos QA: sin recepcion, parcial, completa.  
Regresion: reporte OC.  
Riesgos: duplicar estado calculado/persistido.  
Documentacion afectada: OC/Recepcion.  
Definicion de terminado: regla de estado aprobada.

### COMV5-025 - Modelo cabecera Recepcion OC

ID: COMV5-025  
Nombre: Modelo cabecera Recepcion OC  
Sprint: S2  
Track: Recepcion  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: Recepcion no existe.  
Problema: no hay documento entre OC y movimiento inventario.  
Objetivo: crear cabecera de recepcion asociada a OC.  
Alcance: empresa, OC, proveedor, sucursal, estado, receptor, fecha/hora, observaciones.  
Fuera de alcance: movimiento inventario hasta COMV5-027.  
Proceso origen: OC generada.  
Proceso destino: Recepcion.  
Usuarios involucrados: Receptor, Administracion, Supervisor.  
Permisos/capacidades: recibir mercancia.  
Frontend: pantalla nueva desde OC.  
Backend: crear/consultar recepcion.  
API: endpoints recepcion.  
SQL/tablas: `OrdenesCompraRecepciones`.  
Datos/relaciones: recepcion -> OC/proveedor/sucursal/usuario.  
Reglas de negocio: solo OC generada con pendiente.  
Compatibilidad historica: no afecta OC antiguas.  
Variantes: detalle las maneja.  
Sucursal: obligatoria desde OC o confirmada.  
Inventario: no mueve hasta confirmar.  
Trazabilidad: usuario receptor y fecha.  
Dependencias: COMV5-020, COMV5-U05.  
Decisiones PO: [DECISION PO] estados recepcion.  
Criterios de aceptacion: crear recepcion en captura.  
Casos QA: recepcion para OC generada y bloqueo para cancelada.  
Regresion: OC existente.  
Riesgos: permitir recepcion sin pendiente.  
Documentacion afectada: Recepcion modelo.  
Definicion de terminado: cabecera persistida y consultable.

### COMV5-026 - Detalle Recepcion: ordenado, recibido, acumulado, pendiente

ID: COMV5-026  
Nombre: Detalle Recepcion acumulado y pendiente  
Sprint: S2  
Track: Recepcion  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: no hay detalle recepcion.  
Problema: no se puede recibir parcial ni varias veces.  
Objetivo: registrar recibido por partida OC y calcular acumulado/pendiente.  
Alcance: producto simple, variante, cantidad ordenada, recibida, acumulada, pendiente, costo recibido.  
Fuera de alcance: movimiento inventario hasta COMV5-027.  
Proceso origen: OC Detalle.  
Proceso destino: Recepcion Detalle.  
Usuarios involucrados: Receptor.  
Permisos/capacidades: recibir.  
Frontend: grid de partidas pendientes.  
Backend: validar cantidades.  
API: detalle recepcion.  
SQL/tablas: `OrdenesCompraRecepcionDetalle`.  
Datos/relaciones: recepcion detalle -> OC detalle.  
Reglas de negocio: no exceder pendiente salvo decision.  
Compatibilidad historica: OC antiguas sin variante se reciben simple.  
Variantes: afecta variante exacta.  
Sucursal: hereda recepcion.  
Inventario: aun no mueve hasta confirmar.  
Trazabilidad: detalle por partida.  
Dependencias: COMV5-025.  
Decisiones PO: [DECISION PO] permitir sobre-recepcion.  
Criterios de aceptacion: OC 10 -> recibo 4 -> pendiente 6.  
Casos QA: parcial, total, excedente bloqueado.  
Regresion: OC detalle.  
Riesgos: concurrencia.  
Documentacion afectada: Recepcion reglas.  
Definicion de terminado: acumulados correctos.

### COMV5-027 - Confirmacion recepcion genera movimiento idempotente

ID: COMV5-027  
Nombre: Confirmacion recepcion genera movimiento idempotente  
Sprint: S2  
Track: Recepcion/Inventario  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: OC no actualiza inventario.  
Problema: no hay entrada documental ni proteccion contra doble incremento.  
Objetivo: confirmar recepcion y generar movimiento/actualizar existencia una sola vez.  
Alcance: transaccion recepcion -> movimiento -> existencia.  
Fuera de alcance: venta/devolucion.  
Proceso origen: Recepcion confirmada.  
Proceso destino: Movimiento y Existencia.  
Usuarios involucrados: Receptor, Supervisor.  
Permisos/capacidades: recibir/autorizar excepcion.  
Frontend: accion confirmar.  
Backend: servicio transaccional con locks.  
API: confirmar recepcion.  
SQL/tablas: recepcion, movimientos, existencias.  
Datos/relaciones: origen documental unico por detalle recepcion.  
Reglas de negocio: reintento no duplica movimiento.  
Compatibilidad historica: no afecta movimientos viejos.  
Variantes: movimiento usa variante exacta.  
Sucursal: registrar sucursal.  
Inventario: incrementa fisica.  
Trazabilidad: usuario, fecha, documento origen.  
Dependencias: COMV5-012, COMV5-026.  
Decisiones PO: ninguna tecnica.  
Criterios de aceptacion: doble click deja un solo movimiento.  
Casos QA: reintento, timeout simulado, variante A/B.  
Regresion: ajustes manuales.  
Riesgos: transaccion incompleta.  
Documentacion afectada: inventario/recepcion.  
Definicion de terminado: stock sube exactamente una vez.

### COMV5-028 - Cancelacion/reversion de Recepcion

ID: COMV5-028  
Nombre: Cancelacion/reversion de Recepcion  
Sprint: S2  
Track: Recepcion  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: no existe recepcion ni reversion.  
Problema: errores de recepcion deben corregirse con trazabilidad.  
Objetivo: definir cancelacion antes de confirmar y reversion despues de confirmar.  
Alcance: estados, permisos, movimiento inverso si aplica.  
Fuera de alcance: borrar fisicamente movimientos.  
Proceso origen: recepcion en captura/confirmada.  
Proceso destino: recepcion cancelada/reversada.  
Usuarios involucrados: Receptor, Supervisor, Super Usuario.  
Permisos/capacidades: opera/autoriza.  
Frontend: accion con motivo.  
Backend: validar si inventario ya se uso.  
API: cancelar/reversar.  
SQL/tablas: recepcion/movimientos/existencias.  
Datos/relaciones: movimiento inverso -> recepcion original.  
Reglas de negocio: no borrar historial.  
Compatibilidad historica: no aplica.  
Variantes: reversa la misma variante.  
Sucursal: misma sucursal.  
Inventario: decremento o movimiento inverso.  
Trazabilidad: motivo/autorizador.  
Dependencias: COMV5-027, COMV5-U07.  
Decisiones PO: [DECISION PO] reglas de reversion.  
Criterios de aceptacion: error corregido sin perdida de auditoria.  
Casos QA: cancelar captura, reversar confirmada.  
Regresion: saldo final.  
Riesgos: stock ya vendido.  
Documentacion afectada: reglas recepcion.  
Definicion de terminado: reglas probadas y aprobadas.

### COMV5-029 - Historial y reporte de Recepciones

ID: COMV5-029  
Nombre: Historial y reporte de Recepciones  
Sprint: S2  
Track: Recepcion  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: no hay recepciones ni reporte.  
Problema: compras no tienen trazabilidad de recibido/pendiente.  
Objetivo: crear consulta de recepciones, pendientes y movimientos asociados.  
Alcance: filtros por OC, proveedor, sucursal, fecha, estado, producto/variante.  
Fuera de alcance: reportes integrales S8.  
Proceso origen: Recepcion.  
Proceso destino: Reporte operativo.  
Usuarios involucrados: Administracion, Comprador, Supervisor.  
Permisos/capacidades: consulta/supervisa.  
Frontend: grid y detalle.  
Backend: consultas.  
API: endpoints reporte.  
SQL/tablas: recepcion, detalle, OC, movimientos.  
Datos/relaciones: OC -> recepcion -> movimiento.  
Reglas de negocio: respetar permisos y empresa.  
Compatibilidad historica: OC sin recepcion muestra pendiente total.  
Variantes: filtro y columna variante.  
Sucursal: filtro.  
Inventario: mostrar impacto.  
Trazabilidad: usuario receptor.  
Dependencias: COMV5-027.  
Decisiones PO: [DECISION PO] exportables requeridos.  
Criterios de aceptacion: pendiente por OC visible.  
Casos QA: recepcion parcial/multiple.  
Regresion: reporte OC.  
Riesgos: consultas pesadas.  
Documentacion afectada: manual recepcion.  
Definicion de terminado: reporte validado.

---

# S3 - Cotizaciones

### COMV5-030 - Auditoria puntual de Cotizaciones existentes

ID: COMV5-030  
Nombre: Auditoria puntual de Cotizaciones existentes  
Sprint: S3  
Track: Cotizaciones  
Prioridad: P0 BLOQUEANTE  
Tipo: FUNDACION  
Estado actual: no demostrable como vertical autorizado.  
Problema: V1 asumio aprovechamiento; V3 lo invalido sin auditoria puntual equivalente a OC.  
Objetivo: clasificar Cotizaciones como A aprovechable, B aprovechable con migracion, C no aprovechable, D no demostrable.  
Alcance: MVC, JS, API, DTOs, SQL, PDF/correo/WhatsApp si existen.  
Fuera de alcance: implementar cambios.  
Proceso origen: fuentes Cotizaciones.  
Proceso destino: decision tecnica.  
Usuarios involucrados: PO, Agente, Vendedor.  
Permisos/capacidades: auditar.  
Frontend: inspeccion rutas si hay sesion.  
Backend: revisar controladores.  
API: revisar endpoints/modelos.  
SQL/tablas: solo lectura/versionado.  
Datos/relaciones: cotizacion -> partidas -> cliente/producto.  
Reglas de negocio: no adoptar NEXT por existir.  
Compatibilidad historica: identificar datos reutilizables.  
Variantes: verificar soporte real.  
Sucursal: verificar soporte real.  
Inventario: verificar si solo informa o afecta.  
Trazabilidad: rutas/lineas/evidencia.  
Dependencias: COMV5-001.  
Decisiones PO: ninguna antes del dictamen.  
Criterios de aceptacion: dictamen A/B/C/D con gaps.  
Casos QA: rutas Nueva/Reporte si aplican.  
Regresion: no modifica.  
Riesgos: aprobaciones puntuales mal interpretadas.  
Documentacion afectada: auditoria Cotizaciones.  
Definicion de terminado: auditoria entregada.

### COMV5-031 - Decision PO estrategia Cotizaciones

ID: COMV5-031  
Nombre: Decision PO estrategia Cotizaciones  
Sprint: S3  
Track: Cotizaciones  
Prioridad: P0 BLOQUEANTE  
Tipo: FUNDACION  
Estado actual: pendiente de auditoria.  
Problema: no se puede planear implementacion sin elegir conservar/migrar/reconstruir.  
Objetivo: cerrar estrategia tecnica.  
Alcance: decision y alcance de tickets siguientes.  
Fuera de alcance: codigo.  
Proceso origen: auditoria COMV5-030.  
Proceso destino: implementacion Cotizaciones.  
Usuarios involucrados: PO, Agente, Vendedor, Supervisor.  
Permisos/capacidades: decision.  
Frontend: segun estrategia.  
Backend: segun estrategia.  
API: segun estrategia.  
SQL/tablas: segun estrategia.  
Datos/relaciones: base elegida.  
Reglas de negocio: ningun desarrollo inicia sin decision.  
Compatibilidad historica: si hay migracion, plan aparte.  
Variantes: debera soportar `idVariante nullable`.  
Sucursal: debera declarar impacto.  
Inventario: cotizacion no mueve stock.  
Trazabilidad: acta decision.  
Dependencias: COMV5-030.  
Decisiones PO: [DECISION PO] aprovechar, migrar o reconstruir.  
Criterios de aceptacion: decision firmada/documentada.  
Casos QA: revisar que tickets posteriores respeten decision.  
Regresion: no aplica.  
Riesgos: elegir base debil.  
Documentacion afectada: V5/AGENTS/CLAUDE futuro.  
Definicion de terminado: camino aprobado.

### COMV5-032 - Cotizacion producto simple y variante

ID: COMV5-032  
Nombre: Cotizacion producto simple y variante  
Sprint: S3  
Track: Cotizaciones  
Prioridad: P1 ALTA  
Tipo: CORE  
Estado actual: sujeto a decision.  
Problema: futuras cotizaciones deben respetar variantes existentes.  
Objetivo: soportar producto simple y producto con variante con snapshot.  
Alcance: partida producto, precio, cantidad, unidad, variante.  
Fuera de alcance: Pedido/compromiso.  
Proceso origen: ProductosServicios.  
Proceso destino: Cotizacion.  
Usuarios involucrados: Agente, Vendedor.  
Permisos/capacidades: cotizar.  
Frontend: selector producto/variante.  
Backend: validar producto-variante.  
API: guardar partida.  
SQL/tablas: segun estrategia Cotizaciones.  
Datos/relaciones: producto/variante snapshot.  
Reglas de negocio: producto con variantes exige variante.  
Compatibilidad historica: cotizaciones viejas segun migracion si aplica.  
Variantes: objetivo principal.  
Sucursal: cotizacion puede tomar sucursal.  
Inventario: consulta informativa.  
Trazabilidad: capturista/fecha.  
Dependencias: COMV5-031, COMV5-011.  
Decisiones PO: ninguna tras estrategia.  
Criterios de aceptacion: cotizacion con 946 ml y 5 L separadas.  
Casos QA: simple, una variante, multiples variantes.  
Regresion: P&S.  
Riesgos: usar precio equivocado.  
Documentacion afectada: Cotizaciones.  
Definicion de terminado: cotiza variantes correctamente.

### COMV5-033 - Cotizacion de servicios

ID: COMV5-033  
Nombre: Cotizacion de servicios  
Sprint: S3  
Track: Cotizaciones  
Prioridad: P1 ALTA  
Tipo: CORE  
Estado actual: P&S soporta Servicio; vertical Cotizaciones pendiente.  
Problema: servicios no deben afectar inventario pero si documento comercial.  
Objetivo: cotizar servicios con precio, observaciones y reglas futuras.  
Alcance: partida servicio.  
Fuera de alcance: ejecucion/asistencia final.  
Proceso origen: ProductosServicios tipo Servicio.  
Proceso destino: Cotizacion.  
Usuarios involucrados: Agente, Vendedor, Operador sugerido.  
Permisos/capacidades: cotizar.  
Frontend: selector servicio.  
Backend: validar tipo Servicio.  
API: partida servicio.  
SQL/tablas: cotizacion detalle.  
Datos/relaciones: servicio snapshot.  
Reglas de negocio: servicio no inventariable.  
Compatibilidad historica: segun estrategia.  
Variantes: no aplica salvo servicio con variantes si PO lo definiera.  
Sucursal: servicio puede tener sucursal/ubicacion futura.  
Inventario: no mueve ni compromete.  
Trazabilidad: capturista.  
Dependencias: COMV5-031.  
Decisiones PO: [DECISION PO] servicio con operador requerido.  
Criterios de aceptacion: cotizacion solo servicio y mixta.  
Casos QA: servicio sin stock.  
Regresion: P&S Servicio.  
Riesgos: mezclar servicio con surtimiento.  
Documentacion afectada: Cotizaciones/Servicios.  
Definicion de terminado: servicio cotizado correctamente.

### COMV5-034 - Existencia informativa y venta sin existencia

ID: COMV5-034  
Nombre: Existencia informativa y venta sin existencia  
Sprint: S3  
Track: Cotizaciones  
Prioridad: P1 ALTA  
Tipo: CORE  
Estado actual: inventario fisico por producto; disponible real pendiente de Pedido.  
Problema: cotizacion no debe reservar pero necesita informar.  
Objetivo: mostrar existencia fisica/disponible informativa y regla de sin existencia.  
Alcance: lectura por producto/variante, indicadores y mensajes.  
Fuera de alcance: compromiso.  
Proceso origen: Inventario.  
Proceso destino: Cotizacion.  
Usuarios involucrados: Agente, Vendedor.  
Permisos/capacidades: consulta/cotiza.  
Frontend: indicador stock.  
Backend: servicio disponibilidad.  
API: endpoint consulta.  
SQL/tablas: existencias/compromisos si ya existen.  
Datos/relaciones: producto/variante -> fisica/disponible.  
Reglas de negocio: cotizar no mueve ni reserva.  
Compatibilidad historica: productos sin variante.  
Variantes: consulta por variante.  
Sucursal: segun decision COMV5-018.  
Inventario: informativo.  
Trazabilidad: no requiere evento salvo cotizacion.  
Dependencias: COMV5-016, COMV5-032.  
Decisiones PO: [DECISION PO] permitir cotizar/vender sin existencia.  
Criterios de aceptacion: stock 0 se comporta segun regla.  
Casos QA: existencia positiva, cero, negativa permitida si aplica.  
Regresion: inventario.  
Riesgos: usuario asume reserva.  
Documentacion afectada: reglas Cotizacion.  
Definicion de terminado: indicador y reglas aprobadas.

### COMV5-035 - Concepto pendiente y resolucion antes de Pedido

ID: COMV5-035  
Nombre: Concepto pendiente y resolucion antes de Pedido  
Sprint: S3  
Track: Cotizaciones  
Prioridad: P1 ALTA  
Tipo: CORE  
Estado actual: V1 lo contemplaba; V4 lo menciono parcialmente.  
Problema: operacion necesita cotizar algo no catalogado sin contaminar P&S.  
Objetivo: permitir concepto pendiente y exigir resolucion antes de Pedido si PO lo aprueba.  
Alcance: captura temporal, validacion, vinculacion o alta P&S.  
Fuera de alcance: crear productos automaticamente sin confirmacion.  
Proceso origen: Cotizacion.  
Proceso destino: Pedido/P&S.  
Usuarios involucrados: Agente, Vendedor, Administracion.  
Permisos/capacidades: cotizar, resolver catalogo.  
Frontend: partida pendiente y flujo resolver.  
Backend: validacion.  
API: guardar pendiente/vincular.  
SQL/tablas: cotizacion detalle y posible tabla pendiente.  
Datos/relaciones: pendiente -> producto real.  
Reglas de negocio: no convertir a Pedido con pendiente sin resolucion si PO lo exige.  
Compatibilidad historica: no aplica.  
Variantes: al resolver puede elegir variante/producto.  
Sucursal: no aplica directo.  
Inventario: pendiente no consulta stock.  
Trazabilidad: quien resolvio y cuando.  
Dependencias: COMV5-031.  
Decisiones PO: [DECISION PO] regla obligatoria de resolucion.  
Criterios de aceptacion: cotiza pendiente y bloquea conversion si corresponde.  
Casos QA: pendiente -> producto existente; pendiente -> alta nueva.  
Regresion: P&S no se contamina.  
Riesgos: catalogo duplicado.  
Documentacion afectada: Cotizaciones/P&S.  
Definicion de terminado: flujo pendiente controlado.

### COMV5-036 - Flete en Cotizacion

ID: COMV5-036  
Nombre: Flete en Cotizacion  
Sprint: S3  
Track: Cotizaciones  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: V1 lo recupera como regla funcional; no existe base autorizada.  
Problema: flete debe mostrarse sin confundirse con inventario.  
Objetivo: agregar flete como cargo comercial explicito.  
Alcance: monto, descripcion, totales y PDF.  
Fuera de alcance: flete como producto inventariable.  
Proceso origen: Cotizacion.  
Proceso destino: Pedido/Venta.  
Usuarios involucrados: Agente, Vendedor.  
Permisos/capacidades: cotizar.  
Frontend: captura flete.  
Backend: calculo total.  
API: partida/cargo flete.  
SQL/tablas: segun modelo cotizacion.  
Datos/relaciones: cargo no inventariable.  
Reglas de negocio: flete no mueve inventario.  
Compatibilidad historica: segun estrategia.  
Variantes: no aplica.  
Sucursal: podria variar por sucursal.  
Inventario: sin impacto.  
Trazabilidad: snapshot de cargo.  
Dependencias: COMV5-031.  
Decisiones PO: [DECISION PO] flete parcial y regla fiscal futura.  
Criterios de aceptacion: cotizacion muestra flete y total correcto.  
Casos QA: producto+servicio+flete.  
Regresion: totales.  
Riesgos: impuestos/fiscal.  
Documentacion afectada: Cotizaciones.  
Definicion de terminado: flete probado.

### COMV5-037 - Instalacion, observaciones y operador sugerido

ID: COMV5-037  
Nombre: Instalacion, observaciones y operador sugerido  
Sprint: S3  
Track: Cotizaciones/Servicios  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: V1 incluia instalacion/observaciones/operador sugerido.  
Problema: servicios necesitan planeacion operativa.  
Objetivo: recuperar la capacidad con decision PO.  
Alcance: fecha instalacion, observaciones, operador sugerido.  
Fuera de alcance: ejecucion final del servicio.  
Proceso origen: Cotizacion servicio.  
Proceso destino: Pedido/Servicio.  
Usuarios involucrados: Vendedor, Operador, Ayudante, Supervisor.  
Permisos/capacidades: cotiza/supervisa/participa.  
Frontend: campos por servicio.  
Backend: persistencia.  
API: DTO servicio.  
SQL/tablas: cotizacion detalle servicio.  
Datos/relaciones: servicio -> operador sugerido.  
Reglas de negocio: sugerido no es asignacion final.  
Compatibilidad historica: null para cotizaciones previas.  
Variantes: no aplica directo.  
Sucursal: servicio puede tener ubicacion.  
Inventario: no mueve.  
Trazabilidad: quien sugirio.  
Dependencias: COMV5-033, COMV5-U09.  
Decisiones PO: [DECISION PO] asistencia obligatoria; [DECISION PO] operador requerido.  
Criterios de aceptacion: servicio con fecha y observaciones.  
Casos QA: solo servicio, servicio+producto.  
Regresion: servicio no inventariable.  
Riesgos: prometer agenda sin modulo operativo.  
Documentacion afectada: Cotizaciones/Servicios.  
Definicion de terminado: captura aprobada.

### COMV5-038 - PDF, correo y WhatsApp de Cotizacion

ID: COMV5-038  
Nombre: PDF, correo y WhatsApp de Cotizacion  
Sprint: S3  
Track: Cotizaciones  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: hay aprobaciones puntuales de documento, no vertical completo.  
Problema: comunicacion debe seguir al modelo elegido.  
Objetivo: emitir y compartir cotizacion con snapshots correctos.  
Alcance: PDF, correo, WhatsApp si aplica.  
Fuera de alcance: adoptar implementacion anterior sin auditoria.  
Proceso origen: Cotizacion.  
Proceso destino: Cliente/comunicacion.  
Usuarios involucrados: Agente, Vendedor.  
Permisos/capacidades: cotizar/enviar.  
Frontend: acciones enviar/descargar.  
Backend: generacion y servicios.  
API: documento y envio.  
SQL/tablas: bitacora envio si aplica.  
Datos/relaciones: cotizacion -> archivo/envio.  
Reglas de negocio: documento refleja snapshot.  
Compatibilidad historica: segun migracion.  
Variantes: mostrar variante.  
Sucursal: datos de empresa/sucursal.  
Inventario: informativo si se muestra.  
Trazabilidad: usuario/envio/fecha.  
Dependencias: COMV5-032, COMV5-036.  
Decisiones PO: [DECISION PO] canales oficiales.  
Criterios de aceptacion: PDF/comunicacion coincide con cotizacion.  
Casos QA: producto variante, servicio, flete.  
Regresion: correo/PDF existente si se reutiliza.  
Riesgos: dependencia externa.  
Documentacion afectada: Cotizaciones comunicaciones.  
Definicion de terminado: documento y envio aprobados.

---

# S4 - Pedido + compromiso

### COMV5-040 - Modelo Pedido

ID: COMV5-040  
Nombre: Modelo Pedido  
Sprint: S4  
Track: Pedido  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: Pedido no existe.  
Problema: no hay entidad para compromiso y surtimiento.  
Objetivo: crear cabecera Pedido con origen Cotizacion.  
Alcance: cliente, sucursal, vendedor, estado, totales, observaciones, origen.  
Fuera de alcance: venta/cobro.  
Proceso origen: Cotizacion autorizada.  
Proceso destino: Pedido.  
Usuarios involucrados: Vendedor, Administracion, Supervisor.  
Permisos/capacidades: convertir a Pedido.  
Frontend: vista Pedido.  
Backend: CRUD/estado.  
API: endpoints Pedido.  
SQL/tablas: `Pedidos`.  
Datos/relaciones: Pedido -> Cotizacion.  
Reglas de negocio: preferentemente nace de Cotizacion autorizada.  
Compatibilidad historica: no hay pedido historico.  
Variantes: detalle.  
Sucursal: obligatoria si aplica venta/inventario.  
Inventario: no mueve por cabecera.  
Trazabilidad: capturista/vendedor.  
Dependencias: COMV5-031, COMV5-U05.  
Decisiones PO: [DECISION PO] venta libre vs pedido obligatorio.  
Criterios de aceptacion: pedido creado/consultado.  
Casos QA: pedido desde cotizacion autorizada.  
Regresion: Cotizaciones.  
Riesgos: crear pedido sin base de cotizacion estable.  
Documentacion afectada: Pedido.  
Definicion de terminado: cabecera probada.

### COMV5-041 - PedidoDetalle producto, variante, servicio y flete

ID: COMV5-041  
Nombre: PedidoDetalle producto, variante, servicio y flete  
Sprint: S4  
Track: Pedido  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: no existe detalle Pedido.  
Problema: Pedido debe conservar snapshots y reglas de cada partida.  
Objetivo: crear detalle completo.  
Alcance: producto simple, variante, servicio, flete, concepto resuelto.  
Fuera de alcance: cobro.  
Proceso origen: Cotizacion detalle.  
Proceso destino: PedidoDetalle.  
Usuarios involucrados: Vendedor, Operador sugerido.  
Permisos/capacidades: pedido.  
Frontend: grid detalle.  
Backend: copiar snapshots.  
API: detalle Pedido.  
SQL/tablas: `PedidosDetalle`.  
Datos/relaciones: detalle -> producto/variante/servicio.  
Reglas de negocio: concepto pendiente debe resolverse si PO lo exige.  
Compatibilidad historica: no aplica.  
Variantes: snapshot obligatorio.  
Sucursal: del pedido.  
Inventario: detalle puede comprometer.  
Trazabilidad: origen cotizacion partida.  
Dependencias: COMV5-040, COMV5-035.  
Decisiones PO: ninguna tras reglas Cotizacion.  
Criterios de aceptacion: detalle conserva producto/variante/servicio/flete.  
Casos QA: pedido mixto.  
Regresion: Cotizacion origen.  
Riesgos: snapshots incompletos.  
Documentacion afectada: Pedido modelo.  
Definicion de terminado: detalle correcto.

### COMV5-042 - Estados Pedido

ID: COMV5-042  
Nombre: Estados Pedido  
Sprint: S4  
Track: Pedido  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: propuesta: Pendiente, Parcial, Surtido, Cancelado.  
Problema: estados definen compromiso, surtimiento y venta.  
Objetivo: aprobar e implementar ciclo de estados.  
Alcance: transiciones, restricciones, permisos.  
Fuera de alcance: venta/cobro.  
Proceso origen: Pedido.  
Proceso destino: Surtimiento/Venta.  
Usuarios involucrados: Vendedor, Supervisor.  
Permisos/capacidades: opera/supervisa.  
Frontend: badges/acciones.  
Backend: maquina de estados simple.  
API: endpoints estado.  
SQL/tablas: campo Estado.  
Datos/relaciones: Pedido -> detalles.  
Reglas de negocio: cancelado libera compromiso; surtido no se cancela sin regla.  
Compatibilidad historica: no aplica.  
Variantes: estado por detalle si surtimiento parcial.  
Sucursal: no cambia.  
Inventario: controla compromiso.  
Trazabilidad: fechas/usuarios por transicion.  
Dependencias: COMV5-040.  
Decisiones PO: [DECISION PO] estados finales.  
Criterios de aceptacion: transiciones validas/bloqueadas.  
Casos QA: pendiente->parcial->surtido, pendiente->cancelado.  
Regresion: no aplica.  
Riesgos: estados duplicados con Venta.  
Documentacion afectada: Pedido reglas.  
Definicion de terminado: estados aprobados/probados.

### COMV5-043 - Conversion Cotizacion a Pedido idempotente

ID: COMV5-043  
Nombre: Conversion Cotizacion a Pedido idempotente  
Sprint: S4  
Track: Pedido  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: no existe.  
Problema: doble click/reintento podria crear pedidos duplicados.  
Objetivo: convertir cotizacion autorizada una sola vez.  
Alcance: endpoint convertir, bloqueo origen, indice unico.  
Fuera de alcance: venta.  
Proceso origen: Cotizacion autorizada.  
Proceso destino: Pedido.  
Usuarios involucrados: Vendedor, Supervisor.  
Permisos/capacidades: convertir.  
Frontend: accion convertir.  
Backend: idempotencia.  
API: convertir.  
SQL/tablas: indice unico por cotizacion origen.  
Datos/relaciones: cotizacion -> pedido.  
Reglas de negocio: cotizacion no autorizada no convierte.  
Compatibilidad historica: segun Cotizaciones.  
Variantes: copiar snapshots.  
Sucursal: copiar/confirmar sucursal.  
Inventario: crea compromiso en siguiente ticket.  
Trazabilidad: usuario/fecha conversion.  
Dependencias: COMV5-041, COMV5-042.  
Decisiones PO: [DECISION PO] bloquear edicion cotizacion convertida.  
Criterios de aceptacion: dos intentos = un pedido.  
Casos QA: reintento, cotizacion no autorizada.  
Regresion: Cotizacion.  
Riesgos: estados mal sincronizados.  
Documentacion afectada: Pedido/Cotizacion.  
Definicion de terminado: conversion idempotente.

### COMV5-044 - Compromiso de inventario por Pedido

ID: COMV5-044  
Nombre: Compromiso de inventario por Pedido  
Sprint: S4  
Track: Pedido/Inventario  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: comprometido no existe.  
Problema: disponible real no puede calcularse sin compromiso.  
Objetivo: aumentar compromiso por producto/variante al crear Pedido.  
Alcance: compromiso, disponible, liberacion futura.  
Fuera de alcance: salida fisica de venta.  
Proceso origen: Pedido confirmado.  
Proceso destino: Inventario comprometido.  
Usuarios involucrados: Vendedor, Supervisor.  
Permisos/capacidades: pedido.  
Frontend: mostrar disponible.  
Backend: servicio compromiso.  
API: calcular/consultar.  
SQL/tablas: `InventarioCompromisos` o calculo desde PedidoDetalle segun PO.  
Datos/relaciones: pedido detalle -> compromiso.  
Reglas de negocio: servicio/flete no comprometen.  
Compatibilidad historica: no hay compromiso viejo.  
Variantes: compromiso por variante.  
Sucursal: depende COMV5-018.  
Inventario: afecta disponible, no fisica.  
Trazabilidad: documento origen.  
Dependencias: COMV5-016, COMV5-043.  
Decisiones PO: [DECISION PO] persistido vs calculado.  
Criterios de aceptacion: disponible baja al crear pedido.  
Casos QA: producto simple y variante.  
Regresion: existencia fisica no cambia.  
Riesgos: concurrencia/sobrecompromiso.  
Documentacion afectada: inventario/pedido.  
Definicion de terminado: compromiso probado.

### COMV5-045 - Flete y conceptos comerciales en Pedido

ID: COMV5-045  
Nombre: Flete y conceptos comerciales en Pedido  
Sprint: S4  
Track: Pedido  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: flete viene de regla funcional V1, no implementado.  
Problema: Pedido debe conservar cargos no inventariables.  
Objetivo: llevar flete y conceptos resueltos desde Cotizacion.  
Alcance: cargos, totales, snapshots.  
Fuera de alcance: fiscal avanzado.  
Proceso origen: Cotizacion.  
Proceso destino: Pedido.  
Usuarios involucrados: Vendedor, Administracion.  
Permisos/capacidades: pedido.  
Frontend: mostrar flete/cargos.  
Backend: copiar/calcular.  
API: detalle cargos.  
SQL/tablas: PedidoDetalle/cargos.  
Datos/relaciones: cargo no inventariable.  
Reglas de negocio: flete no compromete ni mueve inventario.  
Compatibilidad historica: no aplica.  
Variantes: no aplica.  
Sucursal: podria afectar regla flete.  
Inventario: sin impacto.  
Trazabilidad: snapshot.  
Dependencias: COMV5-036, COMV5-041.  
Decisiones PO: [DECISION PO] flete parcial.  
Criterios de aceptacion: pedido conserva flete.  
Casos QA: producto+flete.  
Regresion: totales.  
Riesgos: impuestos/fiscal.  
Documentacion afectada: Pedido.  
Definicion de terminado: cargos probados.

### COMV5-046 - Servicios y operadores en Pedido

ID: COMV5-046  
Nombre: Servicios y operadores en Pedido  
Sprint: S4  
Track: Pedido/Servicios  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: servicio existe en P&S; operador comercial no definido.  
Problema: Pedido debe transportar necesidad de servicio sin confundir ejecucion.  
Objetivo: asignar o confirmar operador/ayudante segun decision PO.  
Alcance: servicios, operador sugerido/asignado, ayudante, observaciones.  
Fuera de alcance: asistencia si no aprobada.  
Proceso origen: Cotizacion servicio.  
Proceso destino: Pedido/Servicio.  
Usuarios involucrados: Operador, Ayudante, Supervisor.  
Permisos/capacidades: opera/participa/supervisa.  
Frontend: asignacion.  
Backend: validacion.  
API: actualizar servicio pedido.  
SQL/tablas: PedidoDetalle/servicio.  
Datos/relaciones: servicio -> operador/ayudante.  
Reglas de negocio: asignado no necesariamente ejecutado.  
Compatibilidad historica: null seguro.  
Variantes: no aplica.  
Sucursal: ubicacion servicio.  
Inventario: no mueve.  
Trazabilidad: usuario asigna, operador participa.  
Dependencias: COMV5-037, COMV5-U09.  
Decisiones PO: [DECISION PO] asistencia obligatoria; [DECISION PO] servicio surtido vs ejecutado.  
Criterios de aceptacion: pedido con servicio asignado.  
Casos QA: servicio con operador y ayudante.  
Regresion: producto pedido.  
Riesgos: alcance operativo.  
Documentacion afectada: Servicios.  
Definicion de terminado: reglas servicio aprobadas.

### COMV5-047 - Cancelacion Pedido y liberacion compromiso

ID: COMV5-047  
Nombre: Cancelacion Pedido y liberacion compromiso  
Sprint: S4  
Track: Pedido/Inventario  
Prioridad: P1 ALTA  
Tipo: CORE  
Estado actual: no existe.  
Problema: cancelar sin liberar compromiso distorsiona disponible.  
Objetivo: cancelar pedido con motivo y liberar compromiso pendiente.  
Alcance: cancelacion total/parcial si PO aprueba.  
Fuera de alcance: venta ya confirmada.  
Proceso origen: Pedido.  
Proceso destino: Inventario disponible.  
Usuarios involucrados: Vendedor, Supervisor.  
Permisos/capacidades: opera/autoriza.  
Frontend: accion cancelar.  
Backend: liberar compromiso.  
API: cancelar.  
SQL/tablas: Pedido/compromisos.  
Datos/relaciones: pedido detalle -> compromiso.  
Reglas de negocio: no cancelar vendido sin regla.  
Compatibilidad historica: no aplica.  
Variantes: libera variante exacta.  
Sucursal: segun compromiso.  
Inventario: disponible sube; fisica no cambia.  
Trazabilidad: usuario/motivo/fecha.  
Dependencias: COMV5-044, COMV5-U07.  
Decisiones PO: [DECISION PO] cancelacion parcial.  
Criterios de aceptacion: disponible recuperado.  
Casos QA: cancelar sin surtir y parcial.  
Regresion: compromiso.  
Riesgos: liberacion doble.  
Documentacion afectada: Pedido.  
Definicion de terminado: cancelacion idempotente.

---

# S5 - Formas de pago / Caja / Ajustes PV

### COMV5-050 - Catalogo Formas de Pago

ID: COMV5-050  
Nombre: Catalogo Formas de Pago  
Sprint: S5  
Track: Pagos  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: no existe funcionalmente; placeholder.  
Problema: Cobro requiere catalogo operativo.  
Objetivo: crear formas de pago activas/inactivas con restricciones.  
Alcance: CRUD, baja logica, restricciones, permisos.  
Fuera de alcance: cobro.  
Proceso origen: configuracion.  
Proceso destino: checkout/cobro.  
Usuarios involucrados: Administracion, Cajero, Supervisor.  
Permisos/capacidades: configura/consulta.  
Frontend: administracion formas.  
Backend: CRUD.  
API: endpoints formas pago.  
SQL/tablas: `FormasPago`.  
Datos/relaciones: empresa/sucursal si aplica.  
Reglas de negocio: inactiva no se usa en cobro nuevo.  
Compatibilidad historica: Legacy solo referencia.  
Variantes: no aplica.  
Sucursal: configurable si PO aprueba.  
Inventario: no impacta.  
Trazabilidad: altas/bajas.  
Dependencias: COMV5-U05.  
Decisiones PO: [DECISION PO] forma fiscal futura y restricciones.  
Criterios de aceptacion: alta/edicion/baja.  
Casos QA: forma activa visible, inactiva bloqueada.  
Regresion: seguridad.  
Riesgos: fiscalidad.  
Documentacion afectada: Pagos.  
Definicion de terminado: catalogo probado.

### COMV5-051 - Modelo Caja y sucursal

ID: COMV5-051  
Nombre: Modelo Caja y sucursal  
Sprint: S5  
Track: Caja  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: Caja no existe.  
Problema: Cobro necesita contexto operativo.  
Objetivo: definir/crear caja por empresa/sucursal y cajero autorizado.  
Alcance: caja, sucursal, usuario cajero, estado basico.  
Fuera de alcance: apertura/cierre si PO no decide.  
Proceso origen: configuracion caja.  
Proceso destino: cobro.  
Usuarios involucrados: Cajero, Administracion, Supervisor.  
Permisos/capacidades: operar caja.  
Frontend: seleccion/configuracion caja.  
Backend: validar caja.  
API: endpoints caja.  
SQL/tablas: `Cajas`.  
Datos/relaciones: caja -> sucursal -> cajero.  
Reglas de negocio: cobro debe registrar caja si aplica.  
Compatibilidad historica: no aplica.  
Variantes: no aplica.  
Sucursal: obligatoria.  
Inventario: no impacta.  
Trazabilidad: cajero/caja.  
Dependencias: COMV5-U05, COMV5-U08.  
Decisiones PO: [DECISION PO] caja obligatoria para todo cobro.  
Criterios de aceptacion: caja por sucursal operable.  
Casos QA: cajero correcto/incorrecto.  
Regresion: permisos.  
Riesgos: bloquear cobros por configuracion.  
Documentacion afectada: Caja.  
Definicion de terminado: caja validada.

### COMV5-052 - Sesion, apertura y cierre de Caja

ID: COMV5-052  
Nombre: Sesion, apertura y cierre de Caja  
Sprint: S5  
Track: Caja  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: no existe.  
Problema: si PO exige apertura/cierre, cobro necesita sesion.  
Objetivo: definir e implementar sesion caja, apertura, cierre, arqueo y diferencias.  
Alcance: apertura, cierre, efectivo inicial/final, diferencias.  
Fuera de alcance: conciliacion bancaria avanzada.  
Proceso origen: Caja.  
Proceso destino: Cobro.  
Usuarios involucrados: Cajero, Supervisor.  
Permisos/capacidades: operar/supervisar caja.  
Frontend: abrir/cerrar.  
Backend: estados y validacion.  
API: endpoints sesion.  
SQL/tablas: `CajasSesiones`, `CajasMovimientos`.  
Datos/relaciones: caja -> sesion -> cobros.  
Reglas de negocio: no cobrar con caja cerrada si PO lo exige.  
Compatibilidad historica: no aplica.  
Variantes: no aplica.  
Sucursal: caja por sucursal.  
Inventario: no impacta.  
Trazabilidad: cajero/fechas/diferencias.  
Dependencias: COMV5-051.  
Decisiones PO: [DECISION PO] apertura/cierre obligatorio.  
Criterios de aceptacion: apertura, cobro, cierre.  
Casos QA: intento cobro sin caja abierta.  
Regresion: cobro.  
Riesgos: operacion diaria mas compleja.  
Documentacion afectada: Caja.  
Definicion de terminado: flujo caja aprobado.

### COMV5-053 - Ajustes PV por sucursal

ID: COMV5-053  
Nombre: Ajustes PV por sucursal  
Sprint: S5  
Track: Ajustes PV  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: placeholder; no funcional.  
Problema: devoluciones, vales y checkout necesitan reglas.  
Objetivo: configurar dias devolucion, vigencia NC, vigencia Vale, checkout y venta sin existencia si aplica.  
Alcance: configuracion por empresa/sucursal.  
Fuera de alcance: implementar devolucion/venta.  
Proceso origen: configuracion PV.  
Proceso destino: Venta/Postventa.  
Usuarios involucrados: Administracion, Supervisor, Cajero.  
Permisos/capacidades: configura/consulta.  
Frontend: pantalla ajustes.  
Backend: CRUD/configuracion.  
API: endpoints ajustes.  
SQL/tablas: `AjustesPV`.  
Datos/relaciones: empresa/sucursal -> reglas.  
Reglas de negocio: si no hay regla, usar default aprobado.  
Compatibilidad historica: Legacy referencia.  
Variantes: no aplica directo.  
Sucursal: objetivo principal.  
Inventario: puede afectar venta sin existencia.  
Trazabilidad: usuario actualiza.  
Dependencias: COMV5-U05, COMV5-U08.  
Decisiones PO: [DECISION PO] dias devolucion, vigencia NC/Vale, checkout, venta sin existencia.  
Criterios de aceptacion: sucursales con reglas claras.  
Casos QA: regla distinta por sucursal.  
Regresion: no aplica.  
Riesgos: defaults ambiguos.  
Documentacion afectada: Ajustes PV.  
Definicion de terminado: ajustes aprobados/probados.

### COMV5-054 - Restricciones de formas de pago por sucursal/caja

ID: COMV5-054  
Nombre: Restricciones de formas de pago por sucursal/caja  
Sprint: S5  
Track: Pagos  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: no existe.  
Problema: no todas las formas aplican a toda sucursal/caja.  
Objetivo: definir restricciones operativas.  
Alcance: disponibilidad por sucursal, caja, rol y estado.  
Fuera de alcance: cobro multiple.  
Proceso origen: Formas Pago/Caja.  
Proceso destino: Cobro.  
Usuarios involucrados: Cajero, Administracion.  
Permisos/capacidades: configura/opera.  
Frontend: mostrar solo formas permitidas.  
Backend: validar restriccion.  
API: consulta formas permitidas.  
SQL/tablas: relacion forma-sucursal/caja si PO aprueba.  
Datos/relaciones: forma -> sucursal/caja.  
Reglas de negocio: forma no permitida se rechaza server-side.  
Compatibilidad historica: no aplica.  
Variantes: no aplica.  
Sucursal: objetivo.  
Inventario: no impacta.  
Trazabilidad: configuracion.  
Dependencias: COMV5-050, COMV5-051.  
Decisiones PO: [DECISION PO] restricciones por sucursal/caja.  
Criterios de aceptacion: forma restringida no se usa.  
Casos QA: sucursal A acepta tarjeta, B no.  
Regresion: formas pago.  
Riesgos: bloqueo operativo.  
Documentacion afectada: Pagos.  
Definicion de terminado: restricciones claras.

---

# S6 - Venta / Cobro

### COMV5-060 - Venta desde Pedido

ID: COMV5-060  
Nombre: Venta desde Pedido  
Sprint: S6  
Track: Venta  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: venta funcional no existe; placeholder.  
Problema: no hay documento venta ni salida comercial.  
Objetivo: crear venta preferentemente desde Pedido.  
Alcance: seleccionar pedido, partidas, cantidades, totales, vendedor, sucursal.  
Fuera de alcance: devolucion.  
Proceso origen: Pedido.  
Proceso destino: Venta.  
Usuarios involucrados: Vendedor, Cajero, Supervisor.  
Permisos/capacidades: vender.  
Frontend: pantalla venta desde pedido.  
Backend: crear venta.  
API: endpoints venta.  
SQL/tablas: `Ventas`, `VentasDetalle`.  
Datos/relaciones: venta -> pedido.  
Reglas de negocio: no vender mas del pendiente.  
Compatibilidad historica: no hay ventas funcionales previas.  
Variantes: detalle con variante exacta.  
Sucursal: venta/caja/sucursal.  
Inventario: salida en ticket dedicado.  
Trazabilidad: vendedor/capturista.  
Dependencias: COMV5-040, COMV5-044, COMV5-051, COMV5-U05.  
Decisiones PO: [DECISION PO] venta libre vs exclusivamente desde Pedido.  
Criterios de aceptacion: pedido pendiente genera venta.  
Casos QA: pedido simple, variante, servicio, flete.  
Regresion: Pedido.  
Riesgos: duplicar venta.  
Documentacion afectada: Venta.  
Definicion de terminado: venta desde pedido probada.

### COMV5-061 - Venta parcial y surtimiento

ID: COMV5-061  
Nombre: Venta parcial y surtimiento  
Sprint: S6  
Track: Venta/Surtimiento  
Prioridad: P1 ALTA  
Tipo: CORE  
Estado actual: no existe surtimiento.  
Problema: pedidos pueden venderse/surtirse parcialmente.  
Objetivo: manejar cantidades surtidas, vendidas y pendientes.  
Alcance: venta parcial, segunda venta, estado pedido.  
Fuera de alcance: servicio ejecutado si PO lo separa.  
Proceso origen: Pedido.  
Proceso destino: Venta/Surtimiento.  
Usuarios involucrados: Vendedor, Operador, Supervisor.  
Permisos/capacidades: surtir/vender/supervisar.  
Frontend: captura cantidades.  
Backend: validar pendientes.  
API: actualizar acumulados.  
SQL/tablas: VentasDetalle/PedidoDetalle/Surtimiento si aplica.  
Datos/relaciones: pedido detalle -> ventas.  
Reglas de negocio: 10 -> venta 4 -> pendiente 6.  
Compatibilidad historica: no aplica.  
Variantes: pendiente por variante.  
Sucursal: segun pedido/venta.  
Inventario: salida al confirmar venta o surtimiento segun PO.  
Trazabilidad: usuario surtidor/vendedor.  
Dependencias: COMV5-060.  
Decisiones PO: [DECISION PO] surtimiento descuenta o venta descuenta.  
Criterios de aceptacion: venta parcial y cierre.  
Casos QA: dos ventas completan pedido.  
Regresion: compromiso.  
Riesgos: doble descuento.  
Documentacion afectada: Venta/Pedido.  
Definicion de terminado: parcial probado.

### COMV5-062 - Salida inventario por Venta

ID: COMV5-062  
Nombre: Salida inventario por Venta  
Sprint: S6  
Track: Venta/Inventario  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: no existe salida por venta.  
Problema: stock no baja al vender.  
Objetivo: generar movimiento idempotente de salida por producto/variante.  
Alcance: movimiento, existencia, consumo/liberacion compromiso.  
Fuera de alcance: devolucion.  
Proceso origen: Venta confirmada.  
Proceso destino: Movimiento/Existencia.  
Usuarios involucrados: Vendedor, Cajero, Supervisor.  
Permisos/capacidades: vender/cobrar.  
Frontend: confirmacion estado.  
Backend: transaccion venta -> movimiento -> existencia.  
API: confirmar venta.  
SQL/tablas: ventas, movimientos, existencias, compromisos.  
Datos/relaciones: venta detalle -> origen movimiento.  
Reglas de negocio: servicios/flete no descuentan; variante exacta descuenta.  
Compatibilidad historica: no aplica.  
Variantes: obligatoria para productos con variantes.  
Sucursal: segun decision de inventario.  
Inventario: decrementa fisica y compromiso.  
Trazabilidad: origen documental.  
Dependencias: COMV5-012, COMV5-044, COMV5-060.  
Decisiones PO: [DECISION PO] permitir negativos.  
Criterios de aceptacion: salida una sola vez.  
Casos QA: doble click no duplica salida.  
Regresion: existencia/compromiso.  
Riesgos: concurrencia.  
Documentacion afectada: Inventario/Venta.  
Definicion de terminado: stock baja correctamente.

### COMV5-063 - Cobro con multiples formas de pago

ID: COMV5-063  
Nombre: Cobro con multiples formas de pago  
Sprint: S6  
Track: Cobro  
Prioridad: P0 BLOQUEANTE  
Tipo: CORE  
Estado actual: cobro no existe.  
Problema: venta no puede cerrarse comercialmente.  
Objetivo: registrar cobro con una o varias formas de pago.  
Alcance: cobro, detalle formas, totales, caja/cajero.  
Fuera de alcance: devolucion.  
Proceso origen: Venta.  
Proceso destino: Cobro/Ticket.  
Usuarios involucrados: Cajero, Vendedor, Supervisor.  
Permisos/capacidades: cobrar/autorizar excepciones.  
Frontend: UI checkout.  
Backend: validar suma y formas.  
API: endpoints cobro.  
SQL/tablas: `Cobros`, `CobrosDetalle`.  
Datos/relaciones: cobro -> venta -> caja.  
Reglas de negocio: suma pagos debe cuadrar segun politica.  
Compatibilidad historica: no aplica.  
Variantes: visibles por venta, no por pago.  
Sucursal: caja/sucursal.  
Inventario: no mueve por si mismo.  
Trazabilidad: cajero, caja, fecha.  
Dependencias: COMV5-050, COMV5-051, COMV5-060.  
Decisiones PO: [DECISION PO] pago parcial o solo completo.  
Criterios de aceptacion: efectivo+tarjeta en una venta.  
Casos QA: exacto, faltante, excedente.  
Regresion: venta.  
Riesgos: redondeo/conciliacion.  
Documentacion afectada: Cobro.  
Definicion de terminado: cobro multiple probado.

### COMV5-064 - Ticket/documento de venta

ID: COMV5-064  
Nombre: Ticket/documento de venta  
Sprint: S6  
Track: Venta/Cobro  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: no existe documento funcional.  
Problema: usuario necesita comprobante operativo.  
Objetivo: generar ticket/documento con partidas, pagos, caja y trazabilidad.  
Alcance: PDF/impresion/descarga segun PO.  
Fuera de alcance: facturacion fiscal completa.  
Proceso origen: venta cobrada.  
Proceso destino: ticket/documento.  
Usuarios involucrados: Cajero, Cliente, Vendedor.  
Permisos/capacidades: cobrar/imprimir.  
Frontend: accion imprimir/descargar.  
Backend: generacion documento.  
API: obtener documento.  
SQL/tablas: folio/documento si aplica.  
Datos/relaciones: venta+cobro.  
Reglas de negocio: documento refleja snapshot.  
Compatibilidad historica: no aplica.  
Variantes: mostrar variante.  
Sucursal: mostrar sucursal/caja.  
Inventario: mostrar no mover.  
Trazabilidad: folio, usuario, fecha.  
Dependencias: COMV5-063.  
Decisiones PO: [DECISION PO] alcance fiscal.  
Criterios de aceptacion: ticket coincide con venta/cobro.  
Casos QA: producto+variante+servicio+flete+pagos.  
Regresion: totales.  
Riesgos: requerimientos fiscales.  
Documentacion afectada: Venta/Cobro.  
Definicion de terminado: documento aprobado.

### COMV5-065 - Cancelacion de Venta/Cobro

ID: COMV5-065  
Nombre: Cancelacion de Venta/Cobro  
Sprint: S6  
Track: Venta/Cobro  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: no existe.  
Problema: errores de venta/cobro necesitan regla antes de postventa.  
Objetivo: definir cancelacion antes/despues de cobro y efecto inventario.  
Alcance: motivo, permisos, reversa, caja.  
Fuera de alcance: devolucion comercial cuando ya aplica postventa.  
Proceso origen: venta/cobro.  
Proceso destino: estado cancelado o devolucion.  
Usuarios involucrados: Cajero, Supervisor.  
Permisos/capacidades: autorizar cancelacion.  
Frontend: accion condicionada.  
Backend: validar etapa.  
API: cancelar/reversar.  
SQL/tablas: ventas/cobros/movimientos/caja.  
Datos/relaciones: documento original -> reversa.  
Reglas de negocio: no borrar historial.  
Compatibilidad historica: no aplica.  
Variantes: reversa misma variante si hubo salida.  
Sucursal: caja/sucursal.  
Inventario: reversa salida si aplica.  
Trazabilidad: motivo/autorizador.  
Dependencias: COMV5-062, COMV5-063, COMV5-U07.  
Decisiones PO: [DECISION PO] cancelar vs devolver segun etapa.  
Criterios de aceptacion: cancelacion mantiene saldos correctos.  
Casos QA: venta sin cobro, venta cobrada.  
Regresion: caja/inventario.  
Riesgos: doble reversa.  
Documentacion afectada: Venta/Cobro.  
Definicion de terminado: politica aplicada.

---

# S7 - Postventa

### COMV5-070 - Devolucion desde Venta

ID: COMV5-070  
Nombre: Devolucion desde Venta  
Sprint: S7  
Track: Postventa  
Prioridad: P0 BLOQUEANTE  
Tipo: POSTVENTA  
Estado actual: devolucion funcional no existe; placeholder.  
Problema: no hay documento para devolver venta.  
Objetivo: localizar venta y capturar devolucion parcial/total.  
Alcance: partidas devolubles, cantidades, motivos, autorizacion.  
Fuera de alcance: NC/Vale aplicacion posterior.  
Proceso origen: Venta.  
Proceso destino: Devolucion.  
Usuarios involucrados: Cajero, Administracion, Supervisor.  
Permisos/capacidades: devolver/autorizar.  
Frontend: buscar venta/devolver.  
Backend: validar devoluble.  
API: endpoints devolucion.  
SQL/tablas: `Devoluciones`, `DevolucionesDetalle`.  
Datos/relaciones: devolucion -> venta detalle.  
Reglas de negocio: no devolver mas de vendido no devuelto.  
Compatibilidad historica: no aplica.  
Variantes: devolver variante exacta.  
Sucursal: devolucion por sucursal.  
Inventario: reingreso en ticket dedicado.  
Trazabilidad: motivo, usuario, autorizador.  
Dependencias: COMV5-060, COMV5-053, COMV5-U07.  
Decisiones PO: [DECISION PO] politica devolucion y motivos.  
Criterios de aceptacion: devolucion parcial y total.  
Casos QA: venta con variante devuelta.  
Regresion: venta/cobro.  
Riesgos: fuera de vigencia.  
Documentacion afectada: Postventa.  
Definicion de terminado: devolucion capturada.

### COMV5-071 - Reingreso inventario por Devolucion

ID: COMV5-071  
Nombre: Reingreso inventario por Devolucion  
Sprint: S7  
Track: Postventa/Inventario  
Prioridad: P0 BLOQUEANTE  
Tipo: POSTVENTA  
Estado actual: no existe reingreso por devolucion.  
Problema: stock no se recupera cuando producto vuelve.  
Objetivo: generar movimiento idempotente de entrada si aplica.  
Alcance: producto simple, variante, producto no reingresable, motivo.  
Fuera de alcance: NC/Vale.  
Proceso origen: Devolucion confirmada.  
Proceso destino: Movimiento/Existencia.  
Usuarios involucrados: Cajero, Supervisor.  
Permisos/capacidades: devolver/autorizar.  
Frontend: indicar reingresa/no reingresa.  
Backend: transaccion reingreso.  
API: confirmar devolucion.  
SQL/tablas: devolucion, movimientos, existencias.  
Datos/relaciones: devolucion detalle -> movimiento.  
Reglas de negocio: servicios no reingresan; producto danado puede no reingresar.  
Compatibilidad historica: no aplica.  
Variantes: reingresa variante exacta.  
Sucursal: sucursal devolucion/inventario.  
Inventario: incrementa fisica si aplica.  
Trazabilidad: origen documental.  
Dependencias: COMV5-070, COMV5-012.  
Decisiones PO: [DECISION PO] motivos que reingresan.  
Criterios de aceptacion: saldo sube una sola vez.  
Casos QA: doble intento, producto no reingresable.  
Regresion: inventario.  
Riesgos: reingresar mercancia no vendible.  
Documentacion afectada: Postventa/Inventario.  
Definicion de terminado: reingreso probado.

### COMV5-072 - Nota de Credito y Vale

ID: COMV5-072  
Nombre: Nota de Credito y Vale  
Sprint: S7  
Track: Postventa  
Prioridad: P1 ALTA  
Tipo: POSTVENTA  
Estado actual: no existen.  
Problema: devolucion necesita saldo a favor o documento comercial.  
Objetivo: emitir NC/Vale segun politica.  
Alcance: tipo documento, monto, vigencia, saldo, autorizacion.  
Fuera de alcance: aplicacion posterior.  
Proceso origen: Devolucion.  
Proceso destino: NC/Vale.  
Usuarios involucrados: Cajero, Administracion, Supervisor.  
Permisos/capacidades: emitir/autorizar.  
Frontend: emision/consulta.  
Backend: generar documento saldo.  
API: endpoints NC/Vale.  
SQL/tablas: `DocumentosSaldoFavor`.  
Datos/relaciones: documento -> devolucion.  
Reglas de negocio: monto no excede devolucion autorizada.  
Compatibilidad historica: no aplica.  
Variantes: heredadas de devolucion.  
Sucursal: regla vigencia por sucursal si aplica.  
Inventario: no mueve.  
Trazabilidad: emisor/autorizador.  
Dependencias: COMV5-070, COMV5-053.  
Decisiones PO: [DECISION PO] NC vs Vale, vigencias, autorizacion.  
Criterios de aceptacion: documento emitido con saldo.  
Casos QA: NC y/o Vale segun decision.  
Regresion: devolucion.  
Riesgos: saldo duplicado.  
Documentacion afectada: NC/Vale.  
Definicion de terminado: documento saldo aprobado.

### COMV5-073 - Aplicacion posterior de NC/Vale

ID: COMV5-073  
Nombre: Aplicacion posterior de NC/Vale  
Sprint: S7  
Track: Postventa/Cobro  
Prioridad: P1 ALTA  
Tipo: POSTVENTA  
Estado actual: no existe.  
Problema: saldo a favor no puede consumirse en nueva venta.  
Objetivo: permitir usar NC/Vale como forma de pago futura.  
Alcance: saldo, vigencia, aplicacion parcial/total, idempotencia.  
Fuera de alcance: emitir nuevo documento.  
Proceso origen: NC/Vale.  
Proceso destino: Cobro nueva venta.  
Usuarios involucrados: Cajero, Cliente, Supervisor.  
Permisos/capacidades: cobrar/autorizar excepciones.  
Frontend: seleccionar documento.  
Backend: validar saldo/vigencia.  
API: aplicar saldo.  
SQL/tablas: `DocumentosSaldoFavorAplicaciones`, CobroDetalle.  
Datos/relaciones: documento saldo -> cobro.  
Reglas de negocio: no aplicar vencido/sin saldo.  
Compatibilidad historica: no aplica.  
Variantes: no aplica directo.  
Sucursal: restriccion por sucursal si PO aprueba.  
Inventario: no mueve.  
Trazabilidad: aplicacion/usuario/venta.  
Dependencias: COMV5-063, COMV5-072.  
Decisiones PO: [DECISION PO] aplicacion parcial y sucursal.  
Criterios de aceptacion: saldo baja correctamente.  
Casos QA: aplicacion parcial, total, vencido.  
Regresion: cobro multiple.  
Riesgos: doble aplicacion concurrente.  
Documentacion afectada: NC/Vale/Cobro.  
Definicion de terminado: aplicacion idempotente.

### COMV5-074 - Reporte e historial postventa

ID: COMV5-074  
Nombre: Reporte e historial postventa  
Sprint: S7  
Track: Postventa  
Prioridad: P2 MEDIA  
Tipo: POSTVENTA  
Estado actual: no existe.  
Problema: devoluciones y saldos a favor requieren control operativo.  
Objetivo: consultar devoluciones, reingresos, NC/Vale y aplicaciones.  
Alcance: filtros por venta, cliente, fecha, sucursal, estado, usuario.  
Fuera de alcance: reportes ejecutivos S8.  
Proceso origen: Postventa.  
Proceso destino: Reporte operativo.  
Usuarios involucrados: Cajero, Administracion, Supervisor.  
Permisos/capacidades: consulta/supervisa.  
Frontend: grid/historial.  
Backend: consultas.  
API: endpoints reporte.  
SQL/tablas: devoluciones, documentos saldo, aplicaciones.  
Datos/relaciones: venta -> devolucion -> NC/Vale -> aplicacion.  
Reglas de negocio: respetar permisos.  
Compatibilidad historica: no aplica.  
Variantes: mostrar en partidas devueltas.  
Sucursal: filtro.  
Inventario: mostrar reingreso.  
Trazabilidad: usuarios/fechas.  
Dependencias: COMV5-073.  
Decisiones PO: [DECISION PO] formatos/exportables.  
Criterios de aceptacion: historial completo por venta.  
Casos QA: devolucion con vale aplicado.  
Regresion: postventa.  
Riesgos: consultas complejas.  
Documentacion afectada: Reportes/Postventa.  
Definicion de terminado: historial validado.

---

# S8 - Reportes / cierre

### COMV5-080 - Reporte ProductosServicios

ID: COMV5-080  
Nombre: Reporte ProductosServicios  
Sprint: S8  
Track: Reportes  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: P&S tiene vistas/reportes parciales.  
Problema: V5 necesita visibilidad por producto, servicio y variante.  
Objetivo: reporte consolidado de catalogo comercial.  
Alcance: producto/servicio, catalogos, variantes, precios, tags, paquetes.  
Fuera de alcance: modificar P&S.  
Proceso origen: ProductosServicios.  
Proceso destino: Reporte.  
Usuarios involucrados: Administracion, Supervisor, Vendedor.  
Permisos/capacidades: consulta reportes.  
Frontend: filtros/export.  
Backend: consulta.  
API: endpoint reporte.  
SQL/tablas: P&S actuales.  
Datos/relaciones: producto -> variantes/catalogos.  
Reglas de negocio: solo lectura.  
Compatibilidad historica: productos antiguos.  
Variantes: columnas por variante.  
Sucursal: no aplica salvo inventario.  
Inventario: mostrar fisica si se integra.  
Trazabilidad: fecha reporte.  
Dependencias: COMV5-011.  
Decisiones PO: [DECISION PO] formato.  
Criterios de aceptacion: reporte exportable.  
Casos QA: producto simple, variante, servicio.  
Regresion: P&S congelado.  
Riesgos: tocar logica congelada.  
Documentacion afectada: Reportes.  
Definicion de terminado: reporte aprobado.

### COMV5-081 - Reporte Inventario y Movimientos

ID: COMV5-081  
Nombre: Reporte Inventario y Movimientos  
Sprint: S8  
Track: Reportes  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: movimientos actuales por producto.  
Problema: operacion necesita Kardex por variante/documento.  
Objetivo: reportar existencias y movimientos por producto/variante/sucursal.  
Alcance: fisica, minima, comprometida, disponible, movimientos, origen.  
Fuera de alcance: modificar saldos.  
Proceso origen: Inventario.  
Proceso destino: Reporte.  
Usuarios involucrados: Administracion, Supervisor.  
Permisos/capacidades: consulta/supervisa.  
Frontend: filtros/export.  
Backend: consultas.  
API: endpoints reporte.  
SQL/tablas: existencias, movimientos, compromisos.  
Datos/relaciones: movimiento -> documento origen.  
Reglas de negocio: saldo por variante es fuente de verdad.  
Compatibilidad historica: movimientos viejos sin variante.  
Variantes: filtro principal.  
Sucursal: si aplica.  
Inventario: objetivo.  
Trazabilidad: origen documental.  
Dependencias: COMV5-012, COMV5-016.  
Decisiones PO: [DECISION PO] columnas ejecutivas.  
Criterios de aceptacion: rastrear saldo desde documentos.  
Casos QA: recepcion, venta, devolucion.  
Regresion: rendimiento.  
Riesgos: consultas lentas.  
Documentacion afectada: Reportes.  
Definicion de terminado: Kardex aprobado.

### COMV5-082 - Reporte OC y Recepciones

ID: COMV5-082  
Nombre: Reporte OC y Recepciones  
Sprint: S8  
Track: Reportes  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: OC tiene reporte; recepciones no existen.  
Problema: se necesita compras, recibidos y pendientes.  
Objetivo: reporte integrado OC -> Recepcion -> Movimiento.  
Alcance: proveedor, sucursal, estado, pendiente, variante, costo recibido.  
Fuera de alcance: cambiar OC.  
Proceso origen: OC/Recepcion.  
Proceso destino: Reporte.  
Usuarios involucrados: Comprador, Administracion, Supervisor.  
Permisos/capacidades: consulta/supervisa.  
Frontend: filtros/export.  
Backend: consultas.  
API: endpoints reporte.  
SQL/tablas: OC, recepciones, movimientos.  
Datos/relaciones: OC detalle -> recepcion detalle -> movimiento.  
Reglas de negocio: OC no incrementa; recepcion confirmada si.  
Compatibilidad historica: OC sin recepcion pendiente total.  
Variantes: mostrar variante.  
Sucursal: filtro.  
Inventario: mostrar impacto.  
Trazabilidad: receptor/fecha.  
Dependencias: COMV5-029.  
Decisiones PO: [DECISION PO] exportables.  
Criterios de aceptacion: pendientes de recepcion correctos.  
Casos QA: OC parcial/completa.  
Regresion: reporte OC existente.  
Riesgos: doble conteo.  
Documentacion afectada: Reportes.  
Definicion de terminado: reporte aprobado.

### COMV5-083 - Reporte Cotizaciones

ID: COMV5-083  
Nombre: Reporte Cotizaciones  
Sprint: S8  
Track: Reportes  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: sujeto a auditoria/estrategia.  
Problema: se requiere seguimiento comercial previo a Pedido.  
Objetivo: reportar cotizaciones por estado, usuario, cliente, vigencia y conversion.  
Alcance: producto/variante/servicio/flete/pendientes.  
Fuera de alcance: modificar cotizaciones.  
Proceso origen: Cotizacion.  
Proceso destino: Reporte.  
Usuarios involucrados: Agente, Vendedor, Supervisor.  
Permisos/capacidades: consulta/supervisa.  
Frontend: filtros/export.  
Backend: consultas.  
API: endpoint reporte.  
SQL/tablas: segun estrategia Cotizaciones.  
Datos/relaciones: cotizacion -> pedido si convertido.  
Reglas de negocio: respetar estado autorizado.  
Compatibilidad historica: segun migracion.  
Variantes: mostrar variante.  
Sucursal: filtro si aplica.  
Inventario: stock informativo historico si se guarda.  
Trazabilidad: capturista/autorizador.  
Dependencias: COMV5-038.  
Decisiones PO: [DECISION PO] KPIs cotizacion.  
Criterios de aceptacion: reporte por estado.  
Casos QA: autorizada, convertida, vencida.  
Regresion: Cotizaciones.  
Riesgos: depender de decision pendiente.  
Documentacion afectada: Reportes.  
Definicion de terminado: reporte aprobado.

### COMV5-084 - Reporte Pedidos, comprometido y disponible

ID: COMV5-084  
Nombre: Reporte Pedidos comprometido y disponible  
Sprint: S8  
Track: Reportes  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: Pedido/compromiso no existen.  
Problema: se necesita visibilidad de pendientes y stock comprometido.  
Objetivo: reportar pedidos, surtimiento, compromiso y disponible.  
Alcance: estados, producto/variante, vendedor, sucursal.  
Fuera de alcance: modificar compromiso.  
Proceso origen: Pedido.  
Proceso destino: Reporte.  
Usuarios involucrados: Vendedor, Administracion, Supervisor.  
Permisos/capacidades: consulta/supervisa.  
Frontend: filtros/export.  
Backend: consultas.  
API: endpoint reporte.  
SQL/tablas: pedidos, compromisos, existencias.  
Datos/relaciones: pedido -> compromiso -> disponible.  
Reglas de negocio: disponible = fisica - comprometido.  
Compatibilidad historica: no aplica.  
Variantes: filtro.  
Sucursal: filtro.  
Inventario: comprometido/disponible.  
Trazabilidad: origen cotizacion.  
Dependencias: COMV5-047.  
Decisiones PO: [DECISION PO] KPIs pedido.  
Criterios de aceptacion: comprometido cuadra.  
Casos QA: pedido parcial/cancelado.  
Regresion: inventario.  
Riesgos: saldos calculados lentos.  
Documentacion afectada: Reportes.  
Definicion de terminado: reporte aprobado.

### COMV5-085 - Reporte Ventas y Cobros

ID: COMV5-085  
Nombre: Reporte Ventas y Cobros  
Sprint: S8  
Track: Reportes  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: venta/cobro no existen.  
Problema: operacion necesita ventas, pagos, caja y usuarios.  
Objetivo: reportar ventas y cobros por fecha, sucursal, vendedor, cajero, forma pago.  
Alcance: totales, partidas, pagos, ticket.  
Fuera de alcance: devoluciones en este reporte salvo referencia.  
Proceso origen: Venta/Cobro.  
Proceso destino: Reporte.  
Usuarios involucrados: Cajero, Vendedor, Supervisor.  
Permisos/capacidades: consulta/supervisa.  
Frontend: filtros/export.  
Backend: consultas.  
API: endpoint reporte.  
SQL/tablas: ventas, cobros, caja.  
Datos/relaciones: venta -> cobro -> formas.  
Reglas de negocio: cobros deben cuadrar con ventas.  
Compatibilidad historica: no aplica.  
Variantes: mostrar en partidas.  
Sucursal: filtro.  
Inventario: mostrar salidas.  
Trazabilidad: vendedor/cajero.  
Dependencias: COMV5-064.  
Decisiones PO: [DECISION PO] KPIs venta/cobro.  
Criterios de aceptacion: venta y cobro cuadran.  
Casos QA: multiple forma pago.  
Regresion: cobro.  
Riesgos: conciliacion caja.  
Documentacion afectada: Reportes.  
Definicion de terminado: reporte aprobado.

### COMV5-086 - Reporte Caja

ID: COMV5-086  
Nombre: Reporte Caja  
Sprint: S8  
Track: Reportes  
Prioridad: P2 MEDIA  
Tipo: OPERACION  
Estado actual: caja no existe.  
Problema: apertura/cierre y diferencias requieren control.  
Objetivo: reportar sesiones, movimientos, arqueos y diferencias.  
Alcance: caja, sucursal, cajero, fechas, formas pago.  
Fuera de alcance: conciliacion bancaria avanzada.  
Proceso origen: Caja/Cobro.  
Proceso destino: Reporte.  
Usuarios involucrados: Cajero, Supervisor, Administracion.  
Permisos/capacidades: consulta/supervisa.  
Frontend: filtros/export.  
Backend: consultas.  
API: endpoint reporte.  
SQL/tablas: cajas, sesiones, movimientos, cobros.  
Datos/relaciones: caja -> sesion -> cobros.  
Reglas de negocio: respeta permisos.  
Compatibilidad historica: no aplica.  
Variantes: no aplica.  
Sucursal: filtro principal.  
Inventario: no impacta.  
Trazabilidad: cajero/supervisor.  
Dependencias: COMV5-052, COMV5-063.  
Decisiones PO: [DECISION PO] formato arqueo.  
Criterios de aceptacion: cierre cuadra con cobros.  
Casos QA: diferencia positiva/negativa.  
Regresion: cobro.  
Riesgos: redondeo.  
Documentacion afectada: Reportes/Caja.  
Definicion de terminado: reporte aprobado.

### COMV5-087 - Reporte Devoluciones y NC/Vale

ID: COMV5-087  
Nombre: Reporte Devoluciones y NC/Vale  
Sprint: S8  
Track: Reportes  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: no existe.  
Problema: postventa necesita saldos y trazabilidad.  
Objetivo: reportar devoluciones, reingresos, NC/Vale y aplicaciones.  
Alcance: estado, saldo, vigencia, venta origen, usuario, sucursal.  
Fuera de alcance: modificar saldos.  
Proceso origen: Postventa.  
Proceso destino: Reporte.  
Usuarios involucrados: Cajero, Administracion, Supervisor.  
Permisos/capacidades: consulta/supervisa.  
Frontend: filtros/export.  
Backend: consultas.  
API: endpoint reporte.  
SQL/tablas: devoluciones, documentos saldo, aplicaciones.  
Datos/relaciones: venta -> devolucion -> saldo favor.  
Reglas de negocio: saldo vigente debe cuadrar.  
Compatibilidad historica: no aplica.  
Variantes: mostrar partidas.  
Sucursal: filtro.  
Inventario: mostrar reingresos.  
Trazabilidad: usuario/autorizador.  
Dependencias: COMV5-074.  
Decisiones PO: [DECISION PO] KPIs postventa.  
Criterios de aceptacion: saldo de NC/Vale correcto.  
Casos QA: aplicacion parcial.  
Regresion: cobro/postventa.  
Riesgos: saldo duplicado.  
Documentacion afectada: Reportes.  
Definicion de terminado: reporte aprobado.

### COMV5-088 - Reporte Usuarios, operaciones y sucursales

ID: COMV5-088  
Nombre: Reporte Usuarios operaciones y sucursales  
Sprint: S8  
Track: Reportes/Usuarios  
Prioridad: P2 MEDIA  
Tipo: TRANSVERSAL  
Estado actual: no existe reporte comercial transversal.  
Problema: se necesita saber quien opera, autoriza y supervisa.  
Objetivo: reportar operaciones por usuario/perfil/sucursal/proceso.  
Alcance: compras, recepciones, ajustes, cotizaciones, pedidos, ventas, cobros, devoluciones.  
Fuera de alcance: vigilancia no comercial.  
Proceso origen: Auditoria comercial.  
Proceso destino: Reporte.  
Usuarios involucrados: todos.  
Permisos/capacidades: consulta/supervisa.  
Frontend: filtros/export.  
Backend: consultas.  
API: endpoint reporte.  
SQL/tablas: documentos y auditoria eventos si existe.  
Datos/relaciones: usuario -> accion -> documento.  
Reglas de negocio: respetar privacidad/permisos.  
Compatibilidad historica: no inventar acciones viejas.  
Variantes: mostrar cuando documento tiene partida.  
Sucursal: filtro principal.  
Inventario: acciones de stock.  
Trazabilidad: objetivo.  
Dependencias: COMV5-U10.  
Decisiones PO: [DECISION PO] visibilidad del reporte.  
Criterios de aceptacion: operaciones por usuario visibles.  
Casos QA: acciones de varios perfiles.  
Regresion: permisos.  
Riesgos: exposicion de informacion.  
Documentacion afectada: Reportes.  
Definicion de terminado: reporte aprobado.

### COMV5-089 - QA E2E multitenant comercial

ID: COMV5-089  
Nombre: QA E2E multitenant comercial  
Sprint: S8  
Track: Cierre  
Prioridad: P0 BLOQUEANTE  
Tipo: FUNDACION  
Estado actual: QA por modulo futuro pendiente.  
Problema: el ciclo completo puede fallar en integracion.  
Objetivo: probar flujo completo en dos empresas, dos sucursales y varios perfiles.  
Alcance: P&S -> OC -> recepcion -> inventario -> cotizacion -> pedido -> venta -> cobro -> devolucion.  
Fuera de alcance: nuevos features.  
Proceso origen: todos los modulos.  
Proceso destino: certificacion integral.  
Usuarios involucrados: todos los perfiles.  
Permisos/capacidades: todos.  
Frontend: desktop/mobile.  
Backend: endpoints.  
API: multitenant.  
SQL/tablas: aislamiento por empresa/sucursal.  
Datos/relaciones: flujo documental completo.  
Reglas de negocio: no cruzar empresas.  
Compatibilidad historica: productos historicos.  
Variantes: caso obligatorio.  
Sucursal: caso obligatorio.  
Inventario: saldos finales cuadran.  
Trazabilidad: cadena completa.  
Dependencias: S1 a S7, Track U.  
Decisiones PO: ninguna.  
Criterios de aceptacion: flujo completo pasa sin cruces.  
Casos QA: producto simple, variante, servicio, flete, devolucion.  
Regresion: modulos aprobados.  
Riesgos: defectos integracion.  
Documentacion afectada: evidencia QA.  
Definicion de terminado: QA integral PASS y PO valida.

### COMV5-090 - QA responsive y usabilidad operativa

ID: COMV5-090  
Nombre: QA responsive y usabilidad operativa  
Sprint: S8  
Track: Cierre  
Prioridad: P1 ALTA  
Tipo: OPERACION  
Estado actual: QA responsive queda por modulo.  
Problema: flujos de venta/caja/recepcion deben operar en pantallas reales.  
Objetivo: validar responsive y estados UI.  
Alcance: desktop, tablet, mobile; loading, empty, error.  
Fuera de alcance: redisenos mayores no necesarios.  
Proceso origen: UI comercial.  
Proceso destino: aprobacion UX.  
Usuarios involucrados: usuarios operativos.  
Permisos/capacidades: segun perfil.  
Frontend: foco principal.  
Backend: solo soporte errores.  
API: mensajes consistentes.  
SQL/tablas: no aplica.  
Datos/relaciones: no aplica.  
Reglas de negocio: no mover logica al frontend.  
Compatibilidad historica: patron CheckApp.  
Variantes: grids deben mostrar variante sin romper.  
Sucursal: filtros legibles.  
Inventario: saldos legibles.  
Trazabilidad: evidencia visual.  
Dependencias: COMV5-089.  
Decisiones PO: [DECISION PO] criterios visuales finales.  
Criterios de aceptacion: pantallas clave usables.  
Casos QA: OC/Recepcion/Cotizacion/Venta/Caja/Postventa.  
Regresion: patron UI.  
Riesgos: tablas densas en mobile.  
Documentacion afectada: QA visual.  
Definicion de terminado: evidencia responsive aprobada.

### COMV5-091 - Manual operativo por proceso

ID: COMV5-091  
Nombre: Manual operativo por proceso  
Sprint: S8  
Track: Documentacion  
Prioridad: P1 ALTA  
Tipo: DOCUMENTACION  
Estado actual: docs dispersos.  
Problema: operacion necesita guia por rol/proceso.  
Objetivo: crear manual operativo.  
Alcance: compra, recepcion, inventario, cotizacion, pedido, venta, caja, devolucion, reportes.  
Fuera de alcance: documentar features no aprobados.  
Proceso origen: modulos implementados.  
Proceso destino: operacion.  
Usuarios involucrados: 8 perfiles.  
Permisos/capacidades: por rol.  
Frontend: capturas si aplica.  
Backend: no aplica.  
API: no aplica.  
SQL/tablas: no aplica.  
Datos/relaciones: documentos origen/destino.  
Reglas de negocio: manual refleja verdad aprobada.  
Compatibilidad historica: historicos documentados si afectan.  
Variantes: seccion obligatoria.  
Sucursal: seccion obligatoria.  
Inventario: seccion obligatoria.  
Trazabilidad: como consultar historial.  
Dependencias: COMV5-089.  
Decisiones PO: [DECISION PO] audiencia/formato.  
Criterios de aceptacion: usuario puede operar ciclo completo.  
Casos QA: revision con PO.  
Regresion: no aplica.  
Riesgos: desactualizacion.  
Documentacion afectada: manual comercial.  
Definicion de terminado: manual aprobado.

### COMV5-092 - Actualizar AGENTS y CLAUDE cierre comercial

ID: COMV5-092  
Nombre: Actualizar AGENTS y CLAUDE cierre comercial  
Sprint: S8  
Track: Documentacion  
Prioridad: P0 BLOQUEANTE  
Tipo: DOCUMENTACION  
Estado actual: docs contienen cierres P&S, no ciclo comercial completo futuro.  
Problema: futuros agentes necesitan verdad final.  
Objetivo: registrar modulos implementados, congelados, reglas y QA.  
Alcance: AGENTS/CLAUDE sincronizados.  
Fuera de alcance: codigo.  
Proceso origen: cierre QA.  
Proceso destino: memoria operativa del repo.  
Usuarios involucrados: agentes futuros, PO.  
Permisos/capacidades: no aplica.  
Frontend: no aplica.  
Backend: no aplica.  
API: no aplica.  
SQL/tablas: no aplica.  
Datos/relaciones: estado final.  
Reglas de negocio: solo declarar aprobado lo certificado.  
Compatibilidad historica: documentar migraciones realizadas.  
Variantes: estado final.  
Sucursal: estado final.  
Inventario: estado final.  
Trazabilidad: fecha de cierre.  
Dependencias: COMV5-089, COMV5-091.  
Decisiones PO: [DECISION PO] aprobacion final de cierre.  
Criterios de aceptacion: ambos docs consistentes.  
Casos QA: lectura cruzada.  
Regresion: no aplica.  
Riesgos: contradicciones futuras.  
Documentacion afectada: AGENTS, CLAUDE.  
Definicion de terminado: cierre documental firmado.

### COMV5-093 - Congelar backlog V5 ejecutado

ID: COMV5-093  
Nombre: Congelar backlog V5 ejecutado  
Sprint: S8  
Track: Documentacion  
Prioridad: P1 ALTA  
Tipo: DOCUMENTACION  
Estado actual: V5 es propuesta.  
Problema: tras implementacion habra tickets cerrados, descartados o diferidos.  
Objetivo: crear version de cierre con estado final por ticket.  
Alcance: completado, diferido, descartado, pendiente PO.  
Fuera de alcance: nuevas funcionalidades.  
Proceso origen: tickets COMV5.  
Proceso destino: backlog historico/cierre.  
Usuarios involucrados: PO.  
Permisos/capacidades: no aplica.  
Frontend: no aplica.  
Backend: no aplica.  
API: no aplica.  
SQL/tablas: no aplica.  
Datos/relaciones: ticket -> estado final.  
Reglas de negocio: no reabrir sin nuevo ticket.  
Compatibilidad historica: conserva V5.  
Variantes: resumen final.  
Sucursal: resumen final.  
Inventario: resumen final.  
Trazabilidad: decision por ticket.  
Dependencias: COMV5-092.  
Decisiones PO: [DECISION PO] congelamiento final.  
Criterios de aceptacion: matriz final de tickets.  
Casos QA: revision PO.  
Regresion: no aplica.  
Riesgos: cierre prematuro.  
Documentacion afectada: backlog cierre.  
Definicion de terminado: V5 cerrado.

### COMV5-094 - Cierre integral del programa comercial

ID: COMV5-094  
Nombre: Cierre integral del programa comercial  
Sprint: S8  
Track: Cierre  
Prioridad: P0 BLOQUEANTE  
Tipo: DOCUMENTACION  
Estado actual: programa no iniciado.  
Problema: se necesita dictamen final PO al completar ciclo.  
Objetivo: emitir cierre integral comercial.  
Alcance: QA PO, resumen de modulos, riesgos residuales, congelamientos.  
Fuera de alcance: nuevos cambios.  
Proceso origen: COMV5 ejecutado.  
Proceso destino: producto comercial cerrado.  
Usuarios involucrados: PO, operacion, equipo tecnico.  
Permisos/capacidades: no aplica.  
Frontend: evidencia final.  
Backend: evidencia final.  
API: evidencia final.  
SQL/tablas: evidencia final.  
Datos/relaciones: ciclo completo.  
Reglas de negocio: solo se cierra con QA real.  
Compatibilidad historica: migraciones conciliadas.  
Variantes: ciclo validado.  
Sucursal: ciclo validado.  
Inventario: saldos validados.  
Trazabilidad: dictamen final.  
Dependencias: COMV5-089, COMV5-092, COMV5-093.  
Decisiones PO: [DECISION PO] aprobacion final.  
Criterios de aceptacion: PO aprueba ciclo completo.  
Casos QA: regresion completa.  
Regresion: todo el sistema comercial.  
Riesgos: pendientes diferidos.  
Documentacion afectada: cierre maestro.  
Definicion de terminado: programa cerrado por PO.

---

# Resumen ejecutivo V5

1. Numero total de sprints/tracks: 10 (`S0`, `S1`, `S2`, `S3`, `S4`, `S5`, `S6`, `S7`, `S8`, `Track U`).
2. Numero total de tickets: 81.
3. Tickets P0: 34.
4. Tickets P1: 31.
5. Tickets P2: 16.
6. Tickets P3: 0.
7. Ya implementado: ProductosServicios completo como base actual; OC implementada y aprovechable; inventario fisico/minimo por producto.
8. Aprobado/congelado: ProductosServicios aprobado, reglas logisticas P&S, factor volumetrico 5000, OC base reutilizable sin reconstruccion.
9. Existe pero requiere evolucion: OC sin variante/recepcion/inventario; inventario sin variante/sucursal/comprometido/documento origen; reportes OC.
10. Todavia no existe: recepcion, Pedido, Surtimiento, Venta funcional, Cobro, Caja, Formas de Pago funcionales, Ajustes PV funcionales, Devoluciones funcionales, NC/Vale y reportes integrales.
11. Auditar antes de decidir: Cotizaciones, usuarios/roles/permisos/operadores comerciales, saldo historico multi-variante, reglas legacy de caja/pagos/postventa.
12. Reutilizar: ProductosServicios, variantes existentes, OC MVC/JS/API/DTOs/PDF/Excel, tablas OC, proveedores activos, razones sociales, sucursales, Usuario/Rol/Permiso y Operadores como base auditada.
13. Construir nuevo: recepcion, inventario por variante operativo, conciliacion, compromiso/disponible, Pedido, Surtimiento, Formas de Pago, Caja, Ajustes PV, Venta, Cobro, Devoluciones, NC/Vale, reportes y auditoria comercial si hace falta.
14. Camino critico: `COMV5-001 -> COMV5-U01 -> COMV5-U02 -> COMV5-010 -> COMV5-011 -> COMV5-012 -> COMV5-020 -> COMV5-021 -> COMV5-025 -> COMV5-027 -> COMV5-030 -> COMV5-031 -> COMV5-040 -> COMV5-043 -> COMV5-050 -> COMV5-051 -> COMV5-060 -> COMV5-062 -> COMV5-063 -> COMV5-070 -> COMV5-071 -> COMV5-089 -> COMV5-094`.
15. Primer ticket recomendado: `COMV5-001 - Oficializar Backlog V5`.
16. Ultimo ticket del programa: `COMV5-094 - Cierre integral del programa comercial`.
17. Archivo generado: `docs/comercial/BACKLOG_MAESTRO_CHECKAPP_COMERCIAL_V5.md`.
18. Codigo modificado: NO.
19. SQL ejecutado: NO.

**DICTAMEN: BACKLOG MAESTRO CHECKAPP COMERCIAL V5 GENERADO - ESPERANDO APROBACION DEL PRODUCT OWNER.**
