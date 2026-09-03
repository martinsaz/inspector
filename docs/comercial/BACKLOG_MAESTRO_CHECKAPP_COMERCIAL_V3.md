# Backlog Maestro CheckApp Comercial V3

Fecha: 2026-08-31  
Precondicion: deriva exclusivamente de `AUDITORIA_MAESTRA_COMERCIAL_V3_REAL.md`. No reutiliza ni adapta componentes NEXT. Legacy es referencia funcional, no base tecnica.

## Principio de ejecucion

Antes de construir cualquier vertical, el Product Owner debe aprobar su inclusion, sus reglas y la reutilizacion o no de cualquier artefacto existente. Un ticket de analisis/diseno no autoriza SQL, migraciones ni implementacion.

## S1 - Fundacion comercial autorizada

| ID | Ticket | Resultado esperado | Dependencia |
|---|---|---|---|
| COMV3-001 | Decision PO: alcance de OC | Definir si se construye OC nueva y sus estados/reglas; prohibido adoptar OC NEXT sin autorizacion expresa | PO |
| COMV3-002 | Decision PO: inventario por variante | Definir si el saldo pasa de `empresa+producto` a `empresa+producto+variante`, y politicas para productos sin variante | PO |
| COMV3-003 | Diseno de inventario por variante | Modelo de saldos, movimientos, minima, costo y trazabilidad compatible con ProductosServicios autorizado | COMV3-002 |
| COMV3-004 | Diseno de recepcion | Recepcion total/parcial, pendientes, proveedor, usuario, fecha y enlace con OC/movimientos; sin usar tablas NEXT | COMV3-001, COMV3-003 |
| COMV3-005 | Matriz de autorizacion comercial | Definir responsabilidades y permisos para compra, recepcion e inventario sobre la identidad actual | PO |

## S2 - Compra y abastecimiento

| ID | Ticket | Resultado esperado | Dependencia |
|---|---|---|---|
| COMV3-010 | CONSTRUIR / RECONSTRUIR OC | OC autorizada con cabecera, partidas, proveedor, estados y auditabilidad definidos por PO | COMV3-001 |
| COMV3-011 | CONSTRUIR recepcion de OC | Captura de recepcion parcial/total y pendientes contra la OC nueva | COMV3-004, COMV3-010 |
| COMV3-012 | Movimientos y saldo de recepcion | Movimiento idempotente y saldo por la clave aprobada | COMV3-003, COMV3-011 |
| COMV3-013 | QA E2E compra a existencia | Evidencia de OC -> recepcion -> movimiento -> existencia | COMV3-010 a 012 |

## S3 - Cotizacion y pedido

| ID | Ticket | Resultado esperado | Dependencia |
|---|---|---|---|
| COMV3-020 | Decision PO: alcance de Cotizaciones | Confirmar si se construye/reconstruye Cotizaciones; prohibido adoptar Cotizaciones NEXT sin autorizacion expresa | PO |
| COMV3-021 | CONSTRUIR / RECONSTRUIR Cotizaciones | Cliente, partidas de producto/servicio, precios, vigencia y documentos definidos por PO | COMV3-020 |
| COMV3-022 | Variante y disponibilidad comercial | Regla de seleccion por variante y definicion de fisico, comprometido y disponible | COMV3-002, COMV3-021 |
| COMV3-023 | CONSTRUIR Pedido | Conversion autorizada desde cotizacion, estados y reservas | COMV3-021, COMV3-022 |

## S4 - Venta, cobro y postventa

| ID | Ticket | Resultado esperado | Dependencia |
|---|---|---|---|
| COMV3-030 | Decision PO: venta y caja | Venta libre/desde pedido, vendedor/cajero y reglas de surtido | PO |
| COMV3-031 | CONSTRUIR Formas de Pago | Catalogo, vigencias y reglas fiscales aprobadas | COMV3-030 |
| COMV3-032 | CONSTRUIR Venta y Cobro | Transaccion, documentos, descuento de inventario y trazabilidad | COMV3-023, COMV3-031 |
| COMV3-033 | CONSTRUIR Devoluciones | Politica, motivos y reingreso/ajuste de inventario | COMV3-032 |
| COMV3-034 | CONSTRUIR Ajustes PV por tienda/sucursal | Parametros PV autorizados y alcance por sucursal | COMV3-030 |

## S5 - Seguridad y documentacion

| ID | Ticket | Resultado esperado | Dependencia |
|---|---|---|---|
| COMV3-040 | Modelo de capacidades comerciales | Mapear Agente, Vendedor, Cajero, Ayudante, Administracion, Super Usuario y Supervisor contra Usuario/Rol/Permiso actuales | COMV3-005 |
| COMV3-041 | Matriz usuario por proceso | Permisos verificables para todo el ciclo comercial | COMV3-040 |
| COMV3-042 | Documentacion operativa y QA | Contratos, reglas, migracion autorizada y casos E2E actualizados | Cada modulo aprobado |

## Roadmap propuesto

1. El siguiente paso es una decision formal del PO sobre S1: modelo de stock por variante, necesidad de OC nueva y recepcion.
2. Despues se disena y construye la cadena de abastecimiento sin importar ni adaptar `NEXT`.
3. Cotizaciones, Pedido, Venta y POS comienzan solo tras una autorizacion independiente de sus reglas y de su base tecnica.

No iniciar COMV3-010, COMV3-021 ni COMV3-032 sin las decisiones previas correspondientes. Este backlog no autoriza cambios de codigo ni SQL.
