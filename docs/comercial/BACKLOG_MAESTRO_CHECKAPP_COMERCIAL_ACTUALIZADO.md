# Backlog maestro propuesto — CheckApp Comercial

Yo lo organizaría en 8 sprints funcionales, cada uno cerrando una capacidad completa y dejando algo que tú puedas probar.

| Sprint | Objetivo | Resultado funcional |
|---|---|---|
| S0 | Base comercial y tipos/capacidades | Saber quién puede cotizar, vender, cobrar, instalar, apoyar y autorizar |
| S1 | Cotizaciones 2.0 | Producto + variante + servicio + existencia + instalación + comodín + flete |
| S2 | Pedido + compromiso | Cotización autorizada → Pedido + compromiso de inventario por variante |
| S3 | Abastecimiento | OC existente evolucionada → Recepción → existencia por variante |
| S4 | Formas de pago + Ajustes PV + Caja mínima | Configuración necesaria para checkout y postventa |
| S5 | Asistencia + operación comercial | Validar quién puede vender/cobrar/ejecutar/apoyar |
| S6 | Venta desde Pedido | Surtimiento parcial + cobro + ticket |
| S7 | Postventa | Devolución + reingreso + NC + Vale + aplicación posterior |

No propongo Facturación completa dentro de estos ocho todavía; sí dejamos Venta preparada fiscalmente.

ProductosServicios ya fue trabajado y funciona como FUNDACIÓN ACTUAL: productos, servicios, Variantes, atributos, costos/precios por variante, imagen por variante, Tags, catálogos, paquetes, código autogenerado, ficha técnica, PDF y pesos logísticos. No lo reconstruiría en este backlog; lo consumiría.

Órdenes de Compra sigue EXISTENTE Y APROVECHABLE, y no depende de tablas NEXT. Pantallas actuales:

- `/Activos/OrdenesCompra/Nueva`
- `/Activos/OrdenesCompra/Reporte`

Tablas propias confirmadas:

- `OrdenesCompraFolios`
- `OrdenesCompra`
- `OrdenesCompraDetalle`

---

# SPRINT 0 — Identidad y capacidades comerciales

## Objetivo

No crear otro sistema de usuarios. Extender el modelo actual para distinguir responsabilidades comerciales sin confundir Usuario, Rol, Permiso, Vendedor/Cajero y Operador.

La auditoría posterior dio más claridad sobre los perfiles que debemos contemplar:

- Agente
- Vendedor
- Cajero
- Operador
- Ayudante
- Administración
- Super Usuario
- Supervisor

Ayudante puede participar sin Login cuando corresponda.

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
- Registrar asistencia
- Consultar reportes

### COM-002 — Relación de responsabilidades comerciales

Definir cómo una operación conserva:

- usuario que realizó acción;
- vendedor;
- cajero;
- operador de servicio;
- ayudante cuando aplique;
- autorizador cuando corresponda.

No asumir que son la misma persona.

### COM-003 — Integración con Roles y Permisos

Agregar capacidades comerciales usando la arquitectura existente. No reemplazar ni mover Roles y Permisos.

### COM-004 — Operador de servicio

Mantener Operadores como persona operativa que ejecuta servicios/checklists. No convertirlo automáticamente en tipo de usuario comercial.

### COM-005 — Ayudante operativo

Permitir que Ayudante participe en servicios como apoyo operativo, incluso sin Login si el proceso lo permite.

## Gate QA

Probar usuario con/sin cada capacidad y certificar que no se afectaron permisos existentes.

También probar:

1. Vendedor distinto de Cajero.
2. Operador distinto de Usuario comercial.
3. Ayudante registrado como participante sin Login cuando aplique.
4. Supervisor/Super Usuario autorizando sólo si tiene permiso.

---

# SPRINT 1 — Cotizaciones 2.0

Aquí mantenemos el Sprint de Cotizaciones del backlog original, pero agregaría una auditoría puntual al inicio para decidir qué parte del módulo actual realmente se conserva.

### COM-006 — Auditoría puntual de Cotizaciones actuales

Antes de asumir reutilización completa, revisar qué existe, qué está autorizado y qué puede aprovecharse sin depender de NEXT.

La salida debe decir claramente:

- se conserva;
- se corrige;
- se reconstruye;
- queda fuera.

### COM-007 — Producto y variante en Cotización

Permitir cotizar Producto simple o Producto con variante.

Ejemplo:

Aceite 946 ml

Aceite 5 L

No deben perder identidad ni compartir saldo operativo.

### COM-008 — Fecha de instalación

Agregar soporte para:

Fecha de instalación

Como una cotización puede tener varios servicios, propongo soportar fecha por servicio y una fecha general opcional.

### COM-009 — Observaciones para instalador

Por partida Servicio:

- Observaciones instalador.
- Visible posteriormente en Pedido.
- No afecta producto ni inventario.

### COM-010 — Existencia informativa en Cotización

Para Producto/Variante mostrar:

Existencia física  
Pedido/Comprometido  
Disponible

Cotizar NO modifica inventario.

Para Servicio:

No controla inventario.

### COM-011 — Cotizar sin existencia

Permitir o bloquear según regla aprobada:

- existencia positiva;
- existencia 0;
- disponible insuficiente.

No confundir Cotización sin existencia con Pedido o Venta sin existencia.

### COM-012 — Concepto/producto pendiente de catálogo

Implementar el “comodín” funcional como Concepto pendiente de catálogo, no contaminando ProductosServicios.

Debe permitir capturar:

- código/descripción temporal;
- nombre;
- unidad;
- cantidad;
- precio;
- descuento cuando aplique.

## Regla

Cotizar: sí.  
Convertir a Pedido: NO hasta vincularlo con ProductosServicios.

### COM-013 — Resolver concepto pendiente

Antes de convertir:

- vincular con ProductoServicio existente; o
- darlo de alta.

Después sustituir la referencia temporal por el producto real.

### COM-014 — Flete

Agregar flete opcional a Cotización.

Modelo funcional inicial:

cargo comercial no inventariable, visible claramente en el resumen.

Todavía no mezclarlo automáticamente con ProductosServicios.

### COM-015 — Servicios de instalación y operador sugerido

Las partidas Servicio podrán indicar:

- requiere instalación;
- fecha;
- observaciones;
- requiere operador;
- operador sugerido.

Operador sugerido no significa ejecución ni asignación definitiva.

## Gate QA Sprint 1

Probar mínimo:

1. Solo producto con existencia.
2. Producto con variante.
3. Producto sin existencia.
4. Solo servicio.
5. Producto + servicio.
6. Servicio con instalación.
7. Concepto pendiente.
8. Flete.
9. Producto + servicio + flete.
10. PDF de todos los escenarios.

---

# SPRINT 2 — Cotización → Pedido + compromiso

Este es el corazón nuevo.

La auditoría confirma que Pedido no existe actualmente como flujo comercial rector en CheckApp.

### COM-016 — Modelo Pedido

Crear:

Pedido  
PedidoDetalle

Debe conservar:

- Cotización origen;
- cliente;
- sucursal;
- vendedor;
- producto;
- variante cuando corresponda;
- servicios;
- fecha instalación;
- observaciones;
- operador sugerido/asignado;
- ayudantes cuando aplique;
- flete;
- totales.

### COM-017 — Estados Pedido

Propuesta inicial:

PENDIENTE  
PARCIAL  
SURTIDO  
CANCELADO

Los nombres finales pueden ajustarse al diseño técnico, pero el comportamiento debe conservarse.

### COM-018 — Conversión Cotización → Pedido

Solo:

Cotización AUTORIZADA → Pedido

Después:

Cotización → CONVERTIDA

Dos clics jamás deben generar dos pedidos.

### COM-019 — Validación de catálogo

Antes de convertir:

Todas las partidas que necesiten catálogo deben tener idProductoServicio.

Si existe Concepto pendiente:

“Antes de crear el pedido debes vincular todos los productos al catálogo.”

### COM-020 — Compromiso de inventario

Producto:

al crear Pedido aumenta ComprometidoPedido en la variante correcta.

Servicio:

no.

Flete:

no.

### COM-021 — Disponible

No recomiendo persistir Disponible.

Calcular:

Disponible = ExistenciaFisica − ComprometidoPedido

Así evitamos tres fuentes de verdad.

### COM-022 — Negativos / disponibilidad insuficiente

Ejemplo:

Físico 7 / Pedido 2 → Disponible 5

Físico 0 / Pedido 3 → Disponible -3, únicamente si la regla aprobada lo permite.

### COM-023 — Cancelar Pedido

Debe:

- cambiar estado;
- liberar únicamente compromiso pendiente;
- no alterar cantidades ya surtidas;
- conservar trazabilidad.

### COM-024 — Servicios del Pedido

Servicio conserva:

- cantidad;
- fecha;
- observaciones;
- operador(es);
- ayudantes;
- estado operativo.

### COM-025 — Flete dentro del Pedido

El flete de Cotización debe viajar al Pedido y quedar disponible para Venta.

No genera inventario ni compromiso físico.

## Gate QA

Cotización autorizada → Pedido → compromiso → disponible → cancelar → liberar compromiso.

También validar:

1. Variante exacta comprometida.
2. Servicio sin compromiso físico.
3. Flete conservado.
4. Concepto pendiente bloquea conversión.

---

# SPRINT 3 — OC, Recepción y abastecimiento

Este sprint apareció gracias a la auditoría de nuestro propio sistema.

Tenemos OrdenesCompra, OrdenesCompraDetalle y folios. La OC actual es aprovechable y no depende de NEXT.

Lo que no existe es Recepción integrada con inventario.

### COM-026 — Evolucionar OC existente a variantes

No construir OC desde cero.

Actualizar la OC actual para que una partida pueda manejar:

- producto;
- variante nullable;
- cantidad;
- costo;
- snapshot documental necesario.

### COM-027 — Varias variantes del mismo producto en una OC

Permitir:

Aceite 946 ml  
Aceite 5 L

como partidas distintas dentro de la misma OC.

### COM-028 — Recepción de OC

Nuevo flujo:

OC Generada → Recibir

### COM-029 — Recepción parcial

Ejemplo:

OC = 10  
Recibo = 4  
Pendiente = 6

Debe poder existir otra recepción.

### COM-030 — Múltiples recepciones

Cada recepción válida suma al recibido acumulado y actualiza el pendiente.

No sobrescribe recepciones anteriores.

### COM-031 — Movimiento de inventario

Cada recepción confirmada genera movimiento de entrada.

### COM-032 — Actualización de existencia física

Recepción confirmada incrementa ProductosServiciosExistencias en la variante correcta.

### COM-033 — Relación con pedidos comprometidos

No “asignar mágicamente” mercancía a Pedido.

Simplemente:

Antes:

Físico 0 - Comprometido 3 = Disponible -3

Recepción +5:

Físico 5 - Comprometido 3 = Disponible 2

### COM-034 — Reversión controlada de recepción

Si se confirma mal una recepción, corregir con reversión trazable.

No borrar historia.

## Gate QA

OC → Recepción → Movimiento → Existencia

Probar:

1. OC existente sigue funcionando.
2. OC con dos variantes.
3. Recepción total.
4. Recepción parcial.
5. Segunda recepción.
6. Existencia aumenta sólo en la variante correcta.
7. Reintento no duplica inventario.

---

# SPRINT 4 — Formas de pago + Ajustes PV + Caja mínima

Conservar el enfoque del backlog original: Caja POS mínima.

No implementar todavía un sistema enorme de apertura/cierre/arqueo si no forma parte del alcance aprobado.

### COM-035 — Catálogo maestro de Formas de pago

Basado conceptualmente en FORMASPAGO, pero modelo CheckApp propio.

### COM-036 — Configuración por sucursal

Definir qué formas acepta cada sucursal.

### COM-037 — Catálogo operativo para Checkout

Endpoint o servicio que Venta consumirá, ya filtrado por sucursal y formas activas.

### COM-038 — Forma fiscal futura

Preparar relación futura con SAT, sin implementar Facturación completa en este backlog.

### COM-039 — Ajustes PV por sucursal

Implementar configuraciones necesarias para Venta/Postventa.

Como mínimo:

- Días para devolver.
- Vigencia NC.
- Vigencia Vale.
- Mostrar previo al cobro cuando aplique.

### COM-040 — Caja POS mínima

Crear catálogo/contexto de Caja necesario para Venta y Cobro.

Debe permitir identificar:

- caja;
- cajero;
- sucursal;
- sesión/turno sólo si el alcance aprobado lo requiere;
- efecto monetario básico del cobro.

El alcance completo de apertura, cierre, arqueo y diferencias queda como decisión pendiente.

## Gate

Sucursal → configuración → formas operativas → Caja mínima → persistencia → F5.

---

# SPRINT 5 — Asistencia comercial

La auditoría confirma que no existe un módulo reusable actual.

Mantener el Sprint de Asistencia del Documento 1 y actualizarlo sólo con los perfiles descubiertos.

### COM-041 — Modelo Asistencia

Registrar:

- persona/operador comercial;
- sucursal;
- entrada;
- salida;
- estado.

### COM-042 — Entrada

Registrar asistencia activa.

### COM-043 — Salida

Cerrar asistencia.

### COM-044 — Validación Vendedor

Venta/surtimiento debe validar que el responsable comercial cumple las reglas aprobadas.

### COM-045 — Validación Cajero

Cobro valida capacidad + asistencia según política PO.

### COM-046 — Operador instalador

No confundir asistencia comercial con ejecución del servicio.

Debe poder validarse independientemente.

### COM-047 — Ayudante

Cuando aplique, registrar Ayudante como participante operativo.

Puede existir sin Login si el proceso aprobado lo permite.

### COM-048 — UX Asistencia

Pantalla simple y responsive de Entrada/Salida.

## Gate QA

1. Entrada.
2. Salida.
3. Vendedor validado.
4. Cajero validado.
5. Operador instalador validado.
6. Ayudante participante cuando aplique.
7. No romper permisos existentes.

---

# SPRINT 6 — Venta desde Pedido + surtimiento parcial

Esta es ahora la verdadera Ventas/Nueva.

La regla PO es que Venta nace de Pedido, y el modelo auditado permite Pedido → Venta 1..N.

### COM-049 — Selección de Pedido

Mostrar únicamente pedidos:

- pendientes;
- parciales;
- válidos para sucursal/contexto.

### COM-050 — Resumen Pedido

Cliente, vendedor, partidas, variantes, flete, instalación, surtido y pendientes.

### COM-051 — Preparar surtimiento

Por partida:

- Pedida.
- Surtida.
- Pendiente.
- Surtir ahora.

Preparar no modifica inventario.

### COM-052 — Validación de producto/variante

No permitir surtir más que pendiente.

Validar inventario, disponibilidad y variante exacta.

### COM-053 — Servicio

Permitir incluir en Venta las cantidades de Servicio correspondientes sin movimiento de inventario.

Cobrar Servicio no significa necesariamente ejecutarlo.

### COM-054 — Flete en Venta parcial

Si un Pedido con flete genera varias Ventas, no se debe perder, duplicar ni cobrar dos veces el flete.

La regla exacta queda para decisión PO.

### COM-055 — Surtimiento parcial

Ejemplo oficial:

Pedido 5 → Venta 2 → Pendiente 3 → PARCIAL

Después:

Venta 3 → Pendiente 0 → SURTIDO.

### COM-056 — Inventario al surtir

Producto:

- baja físico;
- baja compromiso por misma cantidad.

Servicio:

- no movimiento.

Flete:

- no movimiento.

### COM-057 — Checkout

Consumir Formas de pago operativas del Sprint 4.

Mostrar producto, variante, servicio, flete, vendedor, cajero y total.

### COM-058 — Cajero/Vendedor

Persistir ambas responsabilidades.

### COM-059 — Cobro

Registrar una o varias formas de pago.

Efectivo afecta efectivo físico esperado.

Tarjeta/transferencia no incrementan efectivo físico.

### COM-060 — Ticket/Venta

Crear Venta y detalle con vínculo a Pedido.

El ticket debe mostrar:

- producto;
- variante;
- servicio;
- flete;
- vendedor;
- cajero;
- formas de pago.

### COM-061 — Actualización Pedido

Actualizar:

- surtida;
- pendiente;
- estado.

### COM-062 — Protección contra duplicados

Un doble clic, F5 o reintento no puede cobrar/surtir dos veces.

## Gate QA

1. Pedido pendiente abre para Venta.
2. Variante 946 ml no modifica 5 L.
3. Surtimiento parcial mantiene pendiente.
4. Segundo surtimiento cierra pendiente.
5. Inventario baja sólo al confirmar surtimiento.
6. Compromiso se libera.
7. Servicio no mueve inventario.
8. Flete aparece una sola vez según regla definida.
9. Vendedor y Cajero son distintos.
10. Cobro cuadra.
11. Ticket no duplica efectos.

---

# SPRINT 7 — NC, Vale y Devoluciones

Conservar el Sprint de Postventa del Documento 1 y actualizarlo con variantes, devolución parcial y producto no reingresable.

### COM-063 — Devolución desde Venta

Localizar ticket/venta CheckApp.

Validar fecha, sucursal, cliente, estado y política de días.

### COM-064 — Partidas devolubles

Cantidad vendida, devuelta, disponible para devolución.

La variante debe conservarse.

### COM-065 — Devolución parcial

Permitir devolver menos de lo vendido.

Ejemplo:

Vendida 5  
Devuelve 2  
Disponible para devolver 3

### COM-066 — Reingreso inventario

Producto devuelto reingresable:

movimiento de entrada en la variante correcta.

Servicio:

no “reingresa inventario”.

### COM-067 — Producto no reingresable

Permitir aceptar una devolución comercial sin aumentar existencia cuando el producto esté dañado o no sea revendible.

### COM-068 — Nota de Crédito

Crear documento con:

- cliente;
- monto;
- vigencia;
- estado;
- venta/devolución origen.

### COM-069 — Vale

Mismo ciclo documental con tipo Vale.

La titularidad o transferibilidad debe definirse por PO.

### COM-070 — Documentos vigentes

Venta debe consultar por cliente:

- NC activa/vigente.
- Vale activo/vigente.

### COM-071 — Aplicación como pago

Permitir utilizarlos en checkout según reglas aprobadas.

NC/Vale no incrementan efectivo físico.

### COM-072 — Ajustes PV

Consumir:

- días devolución;
- vigencia NC;
- vigencia Vale.

### COM-073 — Consulta sencilla de Postventa

Consultar devoluciones, NC, Vales, saldos y aplicaciones posteriores sin crear un Sprint enorme de reportes.

## Gate QA

1. Devolución desde Venta.
2. Devolución parcial.
3. Producto con variante correcta.
4. Reingreso aumenta existencia.
5. No reingresable no aumenta existencia.
6. NC vigente se aplica.
7. Vale vigente se aplica.
8. Documento vencido no se aplica.
9. Venta original permanece intacta.

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

S3, S4 y S5 podrían desarrollarse parcialmente en paralelo después de cerrar las bases necesarias, pero no empezaría S6 hasta tener Pedido, inventario por variante, pagos/caja mínima y asistencia certificados.

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

Tenemos 73 tickets funcionales/técnicos, agrupados en 8 entregables verificables. No recomiendo estimarlos todavía en horas sin que el líder apruebe primero alcance y secuencia.

La definición de terminado de cada Sprint debe incluir siempre:

Backend + SQL + MVC/frontend + responsive + multitenant + seguridad + pruebas funcionales Codex + QA manual Denisse + AGENTS.md + CLAUDE.md + documentación técnica + cero regresiones.

Y ningún Sprint se considera terminado simplemente porque dotnet build dio cero errores.

Reportes quedan incluidos de forma sencilla dentro de los Sprints que consumen la información:

- inventario y Kardex en S1/S3;
- cotización/pedido/venta en S1/S2/S6;
- cobros/caja en S4/S6;
- postventa, NC y Vales en S7.

# Decisiones que todavía debemos definir

Todavía quedan reglas que afectan tickets concretos, pero no impiden presentar este backlog:

1. Flete en surtimiento parcial: cuándo se cobra si un Pedido genera varias Ventas.
2. Servicio/instalación: cuándo se considera comercialmente “surtido” respecto de su ejecución operativa.
3. Inventario físico: confirmar si el negocio quiere mantenerlo global por empresa o evolucionarlo por sucursal; actualmente CheckApp lo maneja por empresa+producto.
4. Cotizar o pedir sin existencia: definir cuándo se permite, cuándo se bloquea y cuándo requiere autorización.
5. Caja: confirmar si el primer alcance es Caja POS mínima o si se aprueba apertura/cierre/arqueo completo.
6. Asistencia: definir si será informativa, obligatoria o configurable por perfil/proceso.

NEXT queda fuera. No usar tablas ni componentes NEXT salvo autorización expresa futura. La OC actual auditada no debe descartarse como NEXT.
