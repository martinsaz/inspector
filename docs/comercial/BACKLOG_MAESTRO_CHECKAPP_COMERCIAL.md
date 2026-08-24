# Backlog maestro propuesto — CheckApp Comercial

Yo lo organizaría en 8 sprints funcionales, cada uno cerrando una capacidad completa y dejando algo que tú puedas probar.

| Sprint | Objetivo | Resultado funcional |
|---|---|---|
| S0 | Base comercial y tipos/capacidades | Saber quién puede cotizar, vender, cobrar, instalar |
| S1 | Cotizaciones 2.0 | Producto + servicio + existencia + instalación + comodín + flete |
| S2 | Pedido + compromiso | Cotización autorizada → Pedido + compromiso de inventario |
| S3 | Abastecimiento | OC → Recepción → existencia para cubrir pedidos |
| S4 | Formas de pago + Ajustes PV | Configuración necesaria para checkout |
| S5 | Asistencia + operación comercial | Validar quién puede vender/cobrar/ejecutar |
| S6 | Venta desde Pedido | Surtimiento parcial + cobro + ticket |
| S7 | Postventa | Devolución + NC + Vale + integración final |

No propongo Facturación completa dentro de estos ocho todavía; sí dejamos Venta preparada fiscalmente. La auditoría confirmó que hoy faltan UsoCFDI, FormaFiscal, ClaveProdServ, ClaveUnidad y backend fiscal real. 14_FLETE_ACTIVOS_FISCAL.md

---

# SPRINT 0 — Identidad y capacidades comerciales

## Objetivo

No crear otro sistema de usuarios. Extender el modelo actual para distinguir responsabilidades comerciales sin confundir Usuario, Vendedor/Cajero y Operador.

La auditoría confirma que CheckApp ya tiene Usuarios, Roles/Permisos y Operadores como conceptos diferentes. 08_USUARIOS_CAPACIDADES_ASISTENCIA.md

## Tickets

### COM-001 — Modelo de capacidades comerciales

Backend + SQL. Definir capacidades compatibles con Roles/Permisos existentes:

- Cotizar
- Autorizar cotización
- Convertir a pedido
- Vender/surtir
- Cobrar
- Devolver
- Operar caja

### COM-002 — Relación de responsabilidades comerciales

Definir cómo una operación conserva:

- usuario que realizó acción;
- vendedor;
- cajero;
- operador de servicio.

No asumir que son la misma persona.

### COM-003 — Integración con Roles y Permisos

Agregar capacidades comerciales usando la arquitectura existente. No reemplazar ni mover Roles y Permisos.

### COM-004 — Operador de servicio

Mantener Operadores como persona operativa que ejecuta servicios/checklists. No convertirlo en tipo de usuario comercial.

## Gate QA

Probar usuario con/sin cada capacidad y certificar que no se afectaron permisos existentes.

---

# SPRINT 1 — Cotizaciones 2.0

Aquí aprovechamos el módulo funcional que ya construimos; no se rehace Cotizaciones.

### Ticket COM-010 — Fecha de instalación

Agregar soporte para:

Fecha de instalación

Como la auditoría detectó que una cotización puede tener varios servicios, propongo técnicamente soportar fecha por servicio y una fecha general opcional. 06_FECHA_INSTALACION_SERVICIOS.md

### COM-011 — Observaciones para instalador

Por partida Servicio:

- Observaciones instalador.
- Visible posteriormente en Pedido.
- No afecta producto ni inventario.

### COM-012 — Existencia informativa en Cotización

Para Producto mostrar:

Existencia física  
Pedido/Comprometido  
Disponible

Cotizar NO modifica inventario.

Ejemplo:

Existencia: 7 · Pedido: 2 · Disponible: 5

Para Servicio:

No controla inventario.

### COM-013 — Cotizar sin existencia

Permitir:

- existencia positiva;
- existencia 0;
- disponible negativo cuando el producto permita venta sin existencia.

CheckApp ya tiene PermiteVentaSinExistencia. 02_PRODUCTOSSERVICIOS_INVENTARIO.md

### COM-014 — Concepto/producto pendiente de catálogo

Implementar el “comodín” funcional como Concepto pendiente de catálogo, no contaminando ProductosServicios.

Debe permitir capturar:

- código/descripción temporal;
- nombre;
- unidad;
- cantidad;
- precio;
- descuento.

CotizacionesPartidas ya conserva snapshots comerciales, aunque hoy idProductoServicio es obligatorio. 05_PRODUCTO_NO_CATALOGADO.md

## Regla

Cotizar: sí.  
Convertir a Pedido: NO hasta vincularlo con ProductosServicios.

### COM-015 — Resolver concepto pendiente

Antes de convertir:

- vincular con ProductoServicio existente; o
- darlo de alta.

Después sustituir la referencia temporal por el producto real.

### COM-016 — Flete

Agregar flete opcional a Cotización.

Aquí dejaría inicialmente el modelo funcional como:

cargo comercial no inventariable, visible claramente en el resumen.

Todavía no mezclarlo con ProductosServicios.

### COM-017 — Servicios de instalación

Las partidas Servicio podrán indicar:

- requiere instalación;
- fecha;
- observaciones;
- requiere operador.

### COM-018 — Operador sugerido

Permitir seleccionar Operador para servicio cuando corresponda.

La relación definitiva viajará al Pedido.

## Gate QA Sprint 1

Probar mínimo:

1. Solo producto con existencia.
2. Producto sin existencia.
3. Producto con negativos permitidos.
4. Solo servicio.
5. Producto + servicio.
6. Servicio con instalador.
7. Concepto pendiente.
8. Flete.
9. Producto + servicio + flete.
10. PDF de todos los escenarios.

---

# SPRINT 2 — Cotización → Pedido + compromiso

Este es el corazón nuevo.

La auditoría confirma que Pedido no existe actualmente en CheckApp. 10_PEDIDO_MODELO_OBJETIVO.md

### COM-020 — Modelo Pedido

Crear:

Pedido  
PedidoDetalle

Debe conservar:

- Cotización origen;
- cliente;
- sucursal;
- vendedor;
- fecha;
- datos instalación;
- observaciones;
- flete;
- totales.

### COM-021 — Estados Pedido

Propuesta inicial:

PENDIENTE  
PARCIAL  
SURTIDO  
CANCELADO

### COM-022 — Conversión Cotización → Pedido

Solo:

Cotización AUTORIZADA → Pedido

Después:

Cotización → CONVERTIDA

Debe ser idempotente: dos clics jamás generan dos pedidos.

### COM-023 — Validación de catálogo

Antes de convertir:

Todas las partidas que necesiten catálogo deben tener idProductoServicio.

Si existe Concepto pendiente:

“Antes de crear el pedido debes vincular todos los productos al catálogo.”

### COM-024 — Compromiso de inventario

Producto:

al crear Pedido aumenta ComprometidoPedido.

Servicio:

no.

Flete:

no.

### COM-025 — Disponible

No recomiendo persistir Disponible.

Calcular:

Disponible = ExistenciaFisica − ComprometidoPedido

Así evitamos tres fuentes de verdad.

### COM-026 — Negativos

Ejemplo:

Físico 7 / Pedido 2 → Disponible 5

Físico 0 / Pedido 3 → Disponible -3, únicamente cuando las reglas del producto lo permitan.

### COM-027 — Cancelar Pedido

Debe:

- cambiar estado;
- liberar únicamente compromiso pendiente;
- no alterar cantidades ya surtidas;
- conservar trazabilidad.

### COM-028 — Servicios del Pedido

Servicio conserva:

- cantidad;
- fecha;
- observaciones;
- operador(es);
- estado operativo.

### COM-029 — Asignación de Operadores

Modelo preparado 1:N:

PedidoDetalleServicio → Operadores

No significa que el Operador sea vendedor.

## Gate QA

Cotización autorizada → Pedido → compromiso → disponible → cancelar → liberar compromiso.

---

# SPRINT 3 — OC, Recepción y abastecimiento

Este sprint apareció gracias a la auditoría de nuestro propio sistema.

Tenemos OrdenesCompra, OrdenesCompraDetalle y folios, pero no existe Recepción integrada con inventario. 03_OC_RECEPCION_EXISTENCIAS.md

### COM-030 — Recepción de OC

Nuevo flujo:

OC Generada → Recibir

### COM-031 — Recepción parcial

Ejemplo:

OC = 10  
Recibo = 4  
Pendiente = 6

Debe poder existir otra recepción.

### COM-032 — Movimiento de inventario

Cada recepción genera movimiento de entrada.

### COM-033 — Actualización de existencia física

Recepción incrementa ProductosServiciosExistencias.

### COM-034 — Relación con pedidos comprometidos

No “asignar mágicamente” mercancía a Pedido.

Simplemente:

Antes:

Físico 0 - Comprometido 3 = Disponible -3

Recepción +5:

Físico 5 - Comprometido 3 = Disponible 2

### COM-035 — Trazabilidad

OC → Recepción → Movimiento → Existencia

### COM-036 — QA de negativos

Certificar que una recepción recupera correctamente productos que estaban comercialmente comprometidos.

---

# SPRINT 4 — Formas de pago + Ajustes PV

Hoy Formas de pago es solo placeholder y no hay backend. 09_FORMAS_PAGO_DOCUMENTOS.md

### COM-040 — Catálogo maestro de Formas de pago

Basado conceptualmente en FORMASPAGO, pero modelo CheckApp propio.

### COM-041 — Configuración por sucursal

Definir qué formas acepta cada sucursal.

### COM-042 — Catálogo operativo

Endpoint que Venta consumirá, ya filtrado.

### COM-043 — Forma fiscal

Preparar relación futura con SAT.

### COM-044 — Ajustes PV por sucursal

Implementar configuraciones necesarias para Venta/Postventa.

Como mínimo:

- Días para devolver.
- Vigencia NC.
- Vigencia Vale.
- Mostrar previo al cobro.

### COM-045 — Caja POS mínima

Crear catálogo/contexto de Caja necesario para Venta.

No implementar todavía un sistema enorme de apertura/cierre si no forma parte del alcance aprobado.

## Gate

Sucursal → configuración → formas operativas → Caja → persistencia → F5.

---

# SPRINT 5 — Asistencia comercial

La auditoría confirma que no existe un módulo reusable actual. 08_USUARIOS_CAPACIDADES_ASISTENCIA.md

### COM-050 — Modelo Asistencia

Registrar:

- persona/operador comercial;
- sucursal;
- entrada;
- salida;
- estado.

### COM-051 — Entrada

Registrar asistencia activa.

### COM-052 — Salida

Cerrar asistencia.

### COM-053 — Validación Vendedor

Venta/surtimiento debe validar que el responsable comercial cumple las reglas aprobadas.

### COM-054 — Validación Cajero

Cobro valida capacidad + asistencia según política PO.

### COM-055 — Operador instalador

No confundir asistencia comercial con ejecución del servicio.

Debe poder validarse independientemente.

### COM-056 — UX Asistencia

Pantalla simple y responsive de Entrada/Salida.

---

# SPRINT 6 — Venta desde Pedido + surtimiento parcial

Esta es ahora la verdadera Ventas/Nueva.

La regla PO es que Venta nace de Pedido, y el modelo auditado permite Pedido → Venta 1..N. 12_VENTA_DESDE_PEDIDO.md

### COM-060 — Selección de Pedido

Mostrar únicamente pedidos:

- pendientes;
- parciales;
- válidos para sucursal/contexto.

### COM-061 — Resumen Pedido

Cliente, vendedor, partidas, flete, instalación, surtido y pendientes.

### COM-062 — Preparar surtimiento

Por partida:

- Pedida.
- Surtida.
- Pendiente.
- Surtir ahora.

### COM-063 — Validación de producto

No permitir surtir más que pendiente.

Validar inventario y negativos.

### COM-064 — Servicio

Permitir incluir en Venta las cantidades de Servicio correspondientes sin movimiento de inventario.

### COM-065 — Surtimiento parcial

Ejemplo oficial:

Pedido 5 → Venta 2 → Pendiente 3 → PARCIAL

Después:

Venta 3 → Pendiente 0 → SURTIDO. 13_SURTIMIENTO_PARCIAL.md

### COM-066 — Inventario al surtir

Producto:

- baja físico;
- baja compromiso por misma cantidad.

Servicio:

- no movimiento.

### COM-067 — Checkout

Consumir Formas de pago operativas del Sprint 4.

### COM-068 — Cajero/Vendedor

Persistir ambas responsabilidades.

### COM-069 — Cobro

Transacción atómica inspirada en las reglas auditadas de FMA/DETNOTAS, pero usando modelo CheckApp.

### COM-070 — Ticket/Venta

Crear Venta y detalle con vínculo a Pedido.

### COM-071 — Actualización Pedido

Actualizar:

- surtida;
- pendiente;
- estado.

### COM-072 — Idempotencia

Un doble clic no puede cobrar/surtir dos veces.

---

# SPRINT 7 — NC, Vale y Devoluciones

### COM-080 — Devolución desde Venta

Localizar ticket/venta CheckApp.

### COM-081 — Partidas devolubles

Cantidad vendida, devuelta, disponible para devolución.

### COM-082 — Reingreso inventario

Producto devuelto:

movimiento de entrada.

Servicio:

requiere regla distinta; no “reingresa inventario”.

### COM-083 — Nota de Crédito

Crear documento con:

- cliente;
- monto;
- vigencia;
- estado;
- venta/devolución origen.

### COM-084 — Vale

Mismo ciclo documental con tipo Vale.

### COM-085 — Documentos vigentes

Venta debe consultar por cliente:

- NC activa/vigente.
- Vale activo/vigente.

### COM-086 — Aplicación como pago

Permitir utilizarlos en checkout según reglas aprobadas.

### COM-087 — Ajustes PV

Consumir:

- días devolución;
- vigencia NC;
- vigencia Vale.

---

# Dependencias entre Sprints

```text
S0 Capacidades
 │
 ├──────────────┐
 ▼              │
S1 Cotización   │
 │              │
 ▼              │
S2 Pedido       │
 │              │
 ├─────► S3 OC/Recepción
 │
 ├─────► S4 Pagos/Ajustes/Caja
 │
 └─────► S5 Asistencia
           │
           ▼
        S6 Venta
           │
           ▼
        S7 Postventa
```

S3, S4 y S5 podrían desarrollarse parcialmente en paralelo después de cerrar S2, pero no empezaría S6 hasta tener los tres certificados.

---

# Qué tablas Legacy sirven como referencia

No vamos a copiarlas, pero sí deben aparecer en cada ticket técnico como fuente de reglas:

| Legacy | Referencia para CheckApp |
|---|---|
| FMA | encabezado Venta/Ticket |
| DETNOTAS | detalle Venta |
| FORMASPAGO | formas/configuración |
| EXISTEN | comportamiento inventario |
| NOTASCRE | Nota de Crédito |
| VALES | Vale |
| CREDITOS | Crédito |
| PEDIDOS_CLIENTES* | Pedido |
| DETORDER | Pedido ↔ Venta |
| LOGDIA | Asistencia |
| EMPLEADO | responsabilidades operativas |

La arquitectura final debe conservar reglas útiles, no nombres ni deuda técnica Legacy.

---

# Backlog resumido para el líder

Tenemos aproximadamente 60 tickets funcionales/técnicos, pero agrupados en 8 entregables verificables. No recomiendo estimarlos todavía en horas sin que el líder apruebe primero alcance y secuencia.

La definición de terminado de cada Sprint debe incluir siempre:

Backend + SQL + MVC/frontend + responsive + multitenant + seguridad + pruebas funcionales Codex + QA manual Denisse + AGENTS.md + CLAUDE.md + documentación técnica + cero regresiones.

Y ningún Sprint se considera terminado simplemente porque dotnet build dio cero errores.

# Tres decisiones que dejaría marcadas para el líder/PO, no para Codex

Todavía quedan reglas que afectan tickets concretos, pero no impiden presentar este backlog:

1. Flete en surtimiento parcial: cuándo se cobra si un Pedido genera varias Ventas.
2. Servicio/instalación: cuándo se considera comercialmente “surtido” respecto de su ejecución operativa.
3. Inventario físico: confirmar si el negocio quiere mantenerlo global por empresa o evolucionarlo posteriormente por sucursal; actualmente CheckApp lo maneja por empresa+producto. 16_GAP_FINAL_CHECKAPP_COMERCIAL.md
