# 19 DECISIONES PO CICLO COMERCIAL

Fecha: 2026-08-17

## Propósito

Este documento concentra las decisiones de producto que Denisse debe aprobar antes de construir el plan de trabajo definitivo del comercial CheckApp.

No es un documento de implementación.

## DEC-001

Tema:

Venta libre vs venta obligatoria desde pedido.

Qué confirmó Legacy:

- Legacy soporta venta libre.
- Legacy también soporta venta desde pedido.
- `POST /ventas/cobrar` funciona con y sin `PedidoRefs`.

Qué tiene CheckApp:

- Ya existe cotización.
- Ya existe autorización.
- Ya existe conversión `Cotización -> Pedido`.
- No existe todavía venta POS operativa completa.

Alternativas:

- A. Toda venta requiere pedido.
- B. Convivencia de venta libre y venta desde pedido.
- C. Pedido obligatorio solo para ciertos escenarios.

Recomendación PM/PO:

- Recomendar `B` como modelo operativo.
- Recomendar `A` solo como dirección preferente para flujo empresarial y de preventa.

Impacto funcional:

- `A` mejora trazabilidad, pero ralentiza mostrador.
- `B` conserva paridad con Legacy y evita bloquear ventas rápidas.
- `C` exige reglas de clasificación tempranas y más entrenamiento.

Impacto técnico:

- `A` simplifica reglas de origen.
- `B` obliga a modelar dos entradas a la misma transacción de cobro.
- `C` agrega validaciones por tipo de operación.

Decisión requerida de Denisse:

- Definir si CheckApp mantendrá venta libre.

## DEC-002

Tema:

Pedido parcial y múltiples ventas sobre un mismo pedido.

Qué confirmó Legacy:

- `VentaCobrarRequest.PedidoRefs` solo manda `Llave` y `Folio`.
- `POST /ventas/cobrar` actualiza `detorder.ticket`, `detorder.status = 5` y `pedidos_clientes.estado = 'SURTIDO'`.
- Los listados de pedidos vigentes solo cargan renglones con `status IN (0,3,4)` y ticket vacío.
- No hay evidencia de cantidad surtida, cantidad pendiente, saldo de renglón ni múltiples tickets por mismo renglón.

Qué tiene CheckApp:

- `pedidos_clientes` y `pedidos_clientes_det` hoy guardan cantidad original, no cantidad surtida.
- La conversión de cotización a pedido deja el pedido completo como pendiente inicial.

Alternativas:

- A. Pedido solo surtido total en una sola venta.
- B. Pedido con surtido parcial real.
- C. Pedido híbrido con cierre manual.

Recomendación PM/PO:

- Recomendar `A` como comportamiento actual compatible con la evidencia Legacy.
- Si negocio necesita parcialidad real, tratarlo como decisión nueva, no como “migración”.

Impacto funcional:

- `A` simplifica operación y reduce ambigüedad.
- `B` habilita surtido escalonado, pero cambia el contrato comercial.
- `C` aumenta carga operativa y riesgo de estados inconsistentes.

Impacto técnico:

- `A` no requiere saldo por renglón.
- `B` exige nuevas columnas, reglas de reapertura de pedido y re-carga parcial.
- `C` también exige estados intermedios y controles adicionales.

Decisión requerida de Denisse:

- Confirmar si CheckApp seguirá con surtido total únicamente o si se abrirá un alcance nuevo de surtido parcial.

## DEC-003

Tema:

Caja POS como contexto o como sesión formal.

Qué confirmó Legacy:

- Venta, pedido, devolución y corte usan `CajaId`.
- `POST /ventas/cobrar` no valida apertura formal de caja.
- Sí existen tablas y flujos de retiros `liquidaciones` y fondos `fondocaja/fondocajas`.
- No quedó confirmada una sesión obligatoria de apertura/cierre previa a vender.

Qué tiene CheckApp:

- El contexto operativo ya maneja tienda y caja.
- No existe módulo POS formal de caja.

Alternativas:

- A. Caja como identificador operativo simple.
- B. Caja como sesión formal con apertura/cierre obligatorios.
- C. Caja simple al inicio y sesión formal en etapa posterior.

Recomendación PM/PO:

- Recomendar `C`.

Impacto funcional:

- `A` acelera salida inicial.
- `B` mejora control, pero puede retrasar la primera versión.
- `C` conserva continuidad con Legacy actual auditado y deja espacio a endurecimiento posterior.

Impacto técnico:

- `A` requiere poco.
- `B` exige expediente de apertura, fondo inicial, estado abierto/cerrado y reglas de bloqueo.
- `C` permite separar “trazabilidad de caja” de “sesión formal de caja”.

Decisión requerida de Denisse:

- Confirmar si primera entrega comercial requiere apertura/cierre formal de caja o solo contexto `CajaId`.

## DEC-004

Tema:

Separación entre vendedor, cajero y usuario.

Qué confirmó Legacy:

- El vendedor entra por `VendedorId`.
- El cajero se resuelve con `GetEmpleadoNumeroByUsuarioAsync`.
- `detnotas` y `fma` reciben ambos conceptos por rutas distintas.
- El vendedor sí debe tener asistencia elegible.
- El usuario autenticado es quien ejecuta el cobro.

Qué tiene CheckApp:

- `Usuarios` ya resuelven identidad de acceso.
- `Operadores` ya representan persona operativa reutilizable.

Alternativas:

- A. Usuario y operador son lo mismo.
- B. Usuario, operador vendedor y operador cajero son conceptos separados.
- C. Usuario + operador único en v1 y separación posterior.

Recomendación PM/PO:

- Recomendar `B`.

Impacto funcional:

- Permite que una persona venda y otra cobre.
- Evita confundir login con responsabilidad comercial.

Impacto técnico:

- Exige persistir identidad autenticada y rol operativo por acto.

Decisión requerida de Denisse:

- Confirmar si CheckApp debe distinguir formalmente vendedor y cajero desde el inicio.

## DEC-005

Tema:

Modelo de Perfil POS.

Qué confirmó Legacy:

- El permiso de aplicación no equivale al perfil operativo POS.
- La asistencia gobierna elegibilidad de vendedor.
- Hay operaciones distintas: vender, cobrar, devolver, operar caja.

Qué tiene CheckApp:

- Reutilización parcial de `Operadores`.
- No existe aún un perfil POS comercial formal.

Alternativas:

- A. Un perfil POS único.
- B. Capacidades POS separadas.
- C. Perfil por sucursal y caja.

Recomendación PM/PO:

- Recomendar `B`.

Impacto funcional:

- Facilita delegación operativa real.

Impacto técnico:

- Simplifica futuras reglas sin amarrarlas a login o menú.

Decisión requerida de Denisse:

- Aprobar si el modelo POS se definirá por capacidades: vender, cobrar, devolver, operar caja.

## DEC-006

Tema:

Asistencia POS en CheckApp.

Qué confirmó Legacy:

- `logdia` gobierna elegibilidad del vendedor.
- Login ya puede registrar asistencia automática.
- No hay evidencia de que caja abierta sustituya asistencia.

Qué tiene CheckApp:

- Reutilización parcial de `Operadores` y contexto operativo.
- No existe módulo POS de asistencia dedicado.

Alternativas:

- A. Módulo independiente.
- B. Capacidad dentro de Operadores.
- C. Sesión operativa por sucursal.
- D. Combinación.

Recomendación PM/PO:

- Recomendar `D`: asistencia como sesión operativa por sucursal, administrada desde Operadores.

Impacto funcional:

- Debe bloquear vender y devolver si no hay entrada vigente.
- Abrir/cerrar caja puede quedar condicionado si negocio lo decide después.

Impacto técnico:

- Requiere modelo explícito de entrada, salida, sucursal, hora y estado.

Decisión requerida de Denisse:

- Confirmar si asistencia bloqueará solo venta/devolución o también cobro y caja.

## DEC-007

Tema:

Flete como partida, cargo global o gasto externo.

Qué confirmó Legacy:

- `flete` aparece en acumulados de `fma` y corte.
- En backend actual se persiste como columna financiera, no como renglón inventariable.
- No se confirmó catálogo maestro POS de fletes.

Qué tiene CheckApp:

- `ProductosServicios` soporta producto y servicio.
- No hay definición comercial cerrada para flete.

Alternativas:

- A. Partida comercial.
- B. Cargo global de venta/pedido.
- C. Gasto/logística fuera de venta.
- D. No migrar comportamiento Legacy.

Recomendación PM/PO:

- Recomendar `B`.

Impacto funcional:

- Mantiene el monto visible y facturable sin fingir inventario.

Impacto técnico:

- Evita tratarlo como SKU físico.

Decisión requerida de Denisse:

- Confirmar si flete será cargo global comercial o concepto vendible explícito.

## DEC-008

Tema:

Activos dentro del ciclo comercial.

Qué confirmó Legacy:

- No se confirmó `Activo` como renglón POS Legacy.

Qué tiene CheckApp:

- Existe módulo `Activos`.
- Existe `ProductosServicios`.

Alternativas:

- A. No vender activos.
- B. Usar activo solo como referencia.
- C. Vender activos como partida comercial.

Recomendación PM/PO:

- Recomendar `B`.

Impacto funcional:

- Permite relacionar un activo al contexto comercial sin convertirlo en inventario vendible por defecto.

Impacto técnico:

- Evita mezclar ciclo patrimonial con ciclo POS.

Decisión requerida de Denisse:

- Confirmar si un activo solo acompaña la venta o puede venderse como entidad comercial propia.

## DEC-009

Tema:

Modelo de Nota de Crédito y Vale.

Qué confirmó Legacy:

- Ambos nacen de devolución y regresan como documento de pago.
- Aplicación parcial no quedó confirmada.

Qué tiene CheckApp:

- No existe aún entidad comercial final para estos documentos.

Alternativas:

- A. Dos entidades independientes.
- B. Una entidad `DocumentoComercial` con tipo `NC` o `VALE`.
- C. Otro modelo.

Recomendación PM/PO:

- Recomendar `B`.

Impacto funcional:

- Unifica saldo, vigencia, aplicación y trazabilidad.

Impacto técnico:

- Reduce duplicación de contratos y estados.

Decisión requerida de Denisse:

- Confirmar si NC y Vale deben vivir en una sola familia documental.

## Resumen

Decisiones requeridas de Denisse:

1. Mantener o no venta libre.
2. Mantener surtido total o abrir surtido parcial real.
3. Exigir o no apertura formal de caja en primera entrega.
4. Separar vendedor y cajero desde inicio.
5. Aprobar modelo de capacidades para Perfil POS.
6. Definir alcance de bloqueos por asistencia.
7. Definir semántica comercial del flete.
8. Definir papel comercial del activo.
9. Definir si NC y Vale serán una sola familia documental.
