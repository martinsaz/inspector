# Backlog maestro CheckApp Comercial V2

Fecha de emisión: `2026-08-31`

## Principios de esta V2

1. Parte del estado real actual, no del backlog anterior.
2. No rehace `ProductosServicios`; lo extiende donde todavía hay gaps reales.
3. Prioriza dependencias estructurales antes de flujos visuales finales.
4. Evita duplicar sistemas de usuarios, permisos o inventario.

## Resumen ejecutivo

La auditoría confirma que el siguiente frente correcto es:

`Inventario por variante + Órdenes de compra + Recepción`

No porque `Pedido` o `Venta` hayan dejado de importar, sino porque hoy esos módulos quedarían construidos sobre un inventario insuficiente.

## Roadmap propuesto

| Sprint | Objetivo | Resultado esperado |
|---|---|---|
| S1 | Inventario por variante + recepción | La cadena `OC -> Recepción -> Movimiento -> Existencia` funciona por variante |
| S2 | Cotizaciones 2.1 | Cotización ya opera con stock útil, servicio y cargos comerciales complementarios |
| S3 | Pedido comercial | Cotización autorizada se convierte a pedido con compromiso |
| S4 | Venta + cobro | Pedido se surte, se cobra y genera ticket/venta |
| S5 | Postventa | Devolución, NC y vale con reingreso de inventario |
| S6 | Capacidades, trazabilidad y documentación | Roles/capacidades y documentación quedan coherentes con el proceso completo |

---

# S1 - Inventario por variante + OC + Recepción

## Objetivo

Cerrar la brecha estructural más crítica del sistema:

- hoy existen variantes;
- hoy no existe inventario por variante;
- hoy no existe recepción;
- hoy OC no incrementa existencias.

## Tickets

### COMV2-001 - Modelo de inventario por variante

Diseñar e implementar la estructura de stock que soporte:

- producto sin variantes;
- producto con variantes;
- existencia física;
- existencia mínima;
- compatibilidad con históricos.

### COMV2-002 - Compatibilidad histórica de inventario

Definir la estrategia para que los productos existentes sin variante o con histórico previo no se rompan al evolucionar el modelo.

### COMV2-003 - Movimientos de inventario por variante

Extender el concepto actual de movimientos para soportar:

- entrada;
- salida;
- ajuste;
- alta inicial;
- devolución;
- recepción.

### COMV2-004 - Disponible y comprometido base

Preparar el modelo para calcular:

- existencia física;
- comprometido;
- disponible;
- negativos permitidos bajo política.

### COMV2-005 - Trazabilidad de inventario

Cada movimiento debe conservar:

- actor;
- documento origen;
- fecha;
- sucursal/contexto;
- producto;
- variante.

### COMV2-010 - Recepción de orden de compra

Crear el módulo de recepción vinculado a OC generada.

### COMV2-011 - Recepción parcial y total

Soportar:

- `OC 10 -> recepción 4 -> pendiente 6`
- `segunda recepción 6 -> OC completa`

### COMV2-012 - Entrada automática a inventario desde recepción

La recepción debe generar movimiento de entrada y actualizar existencia física de la variante correcta.

### COMV2-013 - Estado y pendientes de OC

Agregar trazabilidad operativa de pendiente recibido por partida y por documento.

### COMV2-014 - Reglas de recepción por sucursal

Definir cómo se registra sucursal/contexto operativo de recepción sin romper el inventario actual.

## Gate QA S1

1. Producto sin variantes con recepción total.
2. Producto con variantes con recepción parcial.
3. Dos recepciones sobre la misma OC.
4. Recepción con mezcla de producto y servicio.
5. Verificación de movimientos y saldos finales.

---

# S2 - Cotizaciones 2.1

## Objetivo

Aprovechar el módulo existente de cotizaciones, pero llevarlo al nivel comercial requerido.

## Tickets

### COMV2-020 - Snapshot comercial por variante

Cuando una partida use variante, la cotización debe conservar snapshot del producto y de la variante seleccionada.

### COMV2-021 - Existencia informativa útil

Mostrar en cotización:

- existencia física;
- comprometido;
- disponible;
- regla de negativos.

### COMV2-022 - Servicio con fecha y observaciones de instalación

Agregar por servicio:

- fecha de instalación;
- observaciones;
- indicador de ejecución.

### COMV2-023 - Flete comercial

Agregar flete como concepto comercial explícito, sin mezclarlo todavía con inventario.

### COMV2-024 - Concepto pendiente de catálogo

Permitir cotizar conceptos pendientes y obligar su resolución antes de pedido.

### COMV2-025 - Reglas finales de autorización de cotización

Revisar la autorización actual para asegurar consistencia con servicios, stock y conceptos pendientes.

## Gate QA S2

1. Producto simple.
2. Producto con variante.
3. Producto con stock 0 y negativos permitidos.
4. Solo servicio.
5. Producto + servicio + flete.
6. Concepto pendiente de catálogo.

---

# S3 - Pedido comercial

## Objetivo

Introducir la entidad comercial que hoy no existe en código local.

## Tickets

### COMV2-030 - Modelo Pedido y PedidoDetalle

Crear el modelo local de pedido con snapshot comercial suficiente.

### COMV2-031 - Conversión Cotización -> Pedido

Solo desde cotización autorizada, con comportamiento idempotente.

### COMV2-032 - Compromiso de inventario por variante

Al crear pedido, aumentar comprometido; al cancelar o surtir, liberar o consumir correctamente.

### COMV2-033 - Servicios y operadores en pedido

Vincular servicios con operador sugerido/asignado sin duplicar el sistema de Operadores.

### COMV2-034 - Estados y ciclo de pedido

Propuesta base:

- Pendiente
- Parcial
- Surtido
- Cancelado

## Gate QA S3

1. Cotización autorizada -> pedido.
2. Cancelación de pedido.
3. Pedido mixto producto/servicio.
4. Pedido con compromiso parcial por variante.

---

# S4 - Venta + cobro

## Objetivo

Reemplazar placeholders de venta por flujo real apoyado en pedido.

## Tickets

### COMV2-040 - Caja POS mínima

Crear el contexto operativo mínimo para identificar la caja de la venta/cobro.

### COMV2-041 - Formas de pago, ajustes PV y forma fiscal operativa

Construir la configuración mínima necesaria para checkout y operación por sucursal.

### COMV2-042 - Venta desde pedido

La venta toma partidas pendientes del pedido y conserva el vínculo documental.

### COMV2-043 - Surtimiento parcial y descarga de inventario

Permitir múltiples ventas parciales sobre un pedido cuando aplique.

### COMV2-044 - Cobro y ticket de venta

Persistir la operación de venta/cobro con sus medios de pago e idempotencia.

### COMV2-045 - Trazabilidad comercial

Conservar vendedor, cajero, autorizador y actor de surtimiento sin asumir que son la misma persona.

## Gate QA S4

1. Pedido surtido total en una sola venta.
2. Pedido surtido parcial en dos ventas.
3. Servicio sin movimiento de inventario.
4. Venta con una y múltiples formas de pago.

---

# S5 - Postventa

## Objetivo

Completar la cadena comercial después del cobro.

## Tickets

### COMV2-050 - Devolución desde venta

Crear la devolución local vinculada a venta real.

### COMV2-051 - Reingreso de inventario por variante

Cuando aplique, reingresar a la variante correcta y dejar el movimiento trazable.

### COMV2-052 - Nota de crédito y vale

Crear documentos de postventa con reglas claras de emisión y saldo.

### COMV2-053 - Aplicación de documentos como pago

Permitir que NC/vale puedan consumirse en ventas futuras cuando el PO lo apruebe.

## Gate QA S5

1. Devolución parcial.
2. Devolución total.
3. Producto con variante correcta.
4. Emisión y aplicación de documento posterior.

---

# S6 - Capacidades, trazabilidad y documentación

## Objetivo

Cerrar la capa transversal para que el proceso completo quede gobernable y mantenible.

## Tickets

### COMV2-060 - Matriz de capacidades comerciales

Mapear funciones comerciales sobre `Usuarios + Roles/Permisos + Operadores` existentes.

### COMV2-061 - Integración final con Roles y Permisos

No crear un sistema paralelo de autorización; extender el existente.

### COMV2-062 - Decisión final sobre asistencia

Resolver si asistencia es obligatoria para vender/cobrar/operar o si sale del backlog comercial actual.

### COMV2-063 - Trazabilidad y documentación final

Actualizar:

- `AGENTS.md`
- `CLAUDE.md`
- auditorías
- backlog maestro
- matrices de proceso

## Gate QA S6

1. Usuario con capacidades limitadas.
2. Usuario administrativo.
3. Operador de servicio.
4. Revisión documental sin contradicciones.

---

# Priorización final

## Siguiente sprint recomendado

`S1 - Inventario por variante + OC + Recepción`

## Motivo

Sin ese sprint, los siguientes módulos nacerían con deuda estructural inmediata:

- Pedido no sabría qué variante comprometer.
- Venta no sabría qué variante surtir.
- Devolución no sabría qué variante reingresar.
- La trazabilidad comercial quedaría incompleta desde el origen.

## Tickets que no deben iniciar antes de S1

- `COMV2-031`
- `COMV2-032`
- `COMV2-042`
- `COMV2-043`
- `COMV2-051`

porque todos dependen directa o indirectamente del inventario por variante.
