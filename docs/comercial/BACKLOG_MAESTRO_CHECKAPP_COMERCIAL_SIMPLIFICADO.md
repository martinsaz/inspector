# Backlog maestro CheckApp Comercial simplificado

**Estado:** BORRADOR PARA REVISIÓN DEL PRODUCT OWNER

**Fecha:** 2026-08-31

Este documento reemplaza la lectura técnica extensa de V6 por una propuesta funcional más simple para Product Owner. No aprueba decisiones pendientes, no implementa tickets, no ejecuta SQL y no marca ningún alcance como aprobado por PO.

## Enfoque

La lógica de este backlog es conservar el espíritu del primer Backlog Maestro Comercial: pocos sprints funcionales, tickets entendibles y Gates QA que el Product Owner pueda probar sin leer una especificación técnica.

La fórmula usada es:

```text
Backlog original
+ realidad actual del proyecto
+ hallazgos importantes posteriores
= backlog simplificado actualizado
```

## Qué Tenemos Hoy

| Área | Estado actual | Tratamiento en este backlog |
|---|---|---|
| ProductosServicios | Ya fue trabajado como fundación actual | No reconstruir; consumir y evolucionar sólo si hace falta |
| Variantes | Ya existen y deben conservarse | Usarlas de extremo a extremo |
| Inventario | Existe por producto | Evolucionar a producto + variante nullable |
| Órdenes de Compra | Existe y es aprovechable | Evolucionar OC existente; no reconstruir |
| Recepción | No existe actualmente | Construir como puente OC -> Inventario |
| Cotizaciones | Requiere auditoría puntual antes de reutilizar | Evolucionar o construir sólo lo necesario |
| Pedido | No existe como flujo comercial rector | Construir entre Cotización y Venta |
| Venta/Cobro/Postventa | Requieren definición funcional CheckApp | Construir por sprints funcionales |
| NEXT | Fuera de alcance | No usar como fuente de verdad |

## Fundación Actual Que No Se Reconstruye

ProductosServicios se considera base actual ya trabajada. Incluye productos, servicios, variantes, atributos, costos/precios por variante, imagen por variante, Tags, catálogos, paquetes, código autogenerado, ficha técnica, PDF y pesos logísticos.

OC también existe y es aprovechable. Pantallas actuales:

- `/Activos/OrdenesCompra/Nueva`
- `/Activos/OrdenesCompra/Reporte`

Tablas propias confirmadas:

- `OrdenesCompraFolios`
- `OrdenesCompra`
- `OrdenesCompraDetalle`

La auditoría confirmó que OC no depende de tablas NEXT.

## Definición De Terminado Global

Todo ticket implementado debe contemplar, cuando corresponda: Backend/API, SQL, MVC/frontend, responsive, multitenant, permisos, validaciones, protección contra doble clic/reintento, trazabilidad suficiente, compatibilidad histórica, cero regresiones, build, pruebas funcionales, QA manual del Product Owner y documentación técnica necesaria.

Esto no significa crear tickets separados para cada punto técnico.

---

# SPRINT 0 — Base comercial, usuarios y permisos

## Objetivo

Definir quién puede cotizar, vender, cobrar, operar servicios, autorizar excepciones y consultar información comercial sin crear otro sistema de usuarios.

Mantener la regla:

```text
Usuario != Rol != Permiso != Operador
```

Ayudante puede participar sin Login si el proceso lo requiere.

## Tickets

### COM-001 — Modelo simplificado de perfiles comerciales

Mapear los perfiles Agente, Vendedor, Cajero, Operador, Ayudante, Administración, Super Usuario y Supervisor contra el modelo actual de Usuarios/Roles/Permisos.

No crear ocho tipos físicos automáticamente.

### COM-002 — Capacidades comerciales por perfil

Definir capacidades como cotizar, autorizar, convertir a pedido, surtir, vender, cobrar, devolver, operar caja, registrar asistencia y consultar reportes.

### COM-003 — Responsables documentales

Cada documento debe conservar quién capturó, quién es responsable comercial, quién cobró, quién operó y quién autorizó cuando aplique.

### COM-004 — Participantes operativos sin Login

Permitir que Ayudante participe como colaborador operativo sin convertirlo obligatoriamente en usuario del sistema.

### COM-005 — Autorizaciones comerciales

Definir qué operaciones sensibles requieren Supervisor, Super Usuario o Administración con permiso específico.

## Gate QA

- Usuario con permiso puede ejecutar su acción.
- Usuario sin permiso queda bloqueado.
- Vendedor y Cajero se registran como responsabilidades distintas.
- Operador no se confunde con Usuario comercial.
- Ayudante puede registrarse como participante sin Login cuando aplique.
- Asistencia queda considerada como capacidad configurable por perfil/proceso.

---

# SPRINT 1 — Inventario por variante

## Objetivo

Evolucionar el inventario actual por producto para que distinga variantes. La meta es evitar mezclar, por ejemplo, Aceite 946 ml con Aceite 5 L.

## Tickets

### COM-006 — Dimensión de inventario por producto y variante

Evolucionar existencias para soportar `producto + variante nullable`.

Producto simple usa variante NULL.

Producto con variantes usa la variante exacta.

### COM-007 — Existencia física, comprometida, disponible y mínima

Separar los conceptos:

- Física
- Comprometida
- Disponible
- Mínima

Disponible se calcula desde Física menos Comprometida, salvo regla técnica justificada.

### COM-008 — Movimientos y Kardex por variante

Todo cambio de Física debe explicarse mediante movimiento. El Kardex debe permitir consultar producto, variante, fecha, origen, entrada, salida y usuario.

### COM-009 — Compatibilidad con saldos históricos

No repartir automáticamente saldos históricos ambiguos entre variantes. Los saldos actuales sin variante deben conservarse y clasificarse antes de evolucionar.

### COM-010 — Consulta de existencias por variante

Crear una vista operativa donde se pueda consultar producto, variante, Física, Comprometida, Disponible y Mínima.

### COM-011 — Ajustes manuales controlados

Permitir ajustes sólo con permiso, motivo y trazabilidad. No usar ajustes para corregir silenciosamente errores de flujo.

## Gate QA

- Producto simple funciona con variante NULL.
- Producto con variantes muestra 946 ml y 5 L separados.
- Operar 946 ml no modifica 5 L.
- Kardex explica entradas y salidas.
- Histórico sin variante permanece consultable.

---

# SPRINT 2 — Órdenes de Compra y Recepción

## Objetivo

Evolucionar la OC existente para trabajar con variantes y construir Recepción como proceso nuevo entre OC e Inventario.

```text
OC -> Recepción -> Movimiento -> Existencia
```

## Tickets

### COM-012 — Evolucionar OC existente a variante

Actualizar la OC actual para que las partidas soporten producto + variante nullable, sin reconstruir el módulo desde cero.

### COM-013 — Varias variantes del mismo producto en una OC

Permitir comprar 946 ml y 5 L del mismo producto como partidas distintas.

### COM-014 — Documento OC con snapshot comercial

La OC debe conservar datos documentales suficientes del producto/variante usados al momento de compra.

### COM-015 — Recepción de OC

Construir el proceso para recibir mercancía desde una OC generada. Debe permitir recepción total, parcial y múltiples recepciones.

### COM-016 — Pendientes de recepción

Calcular cantidad ordenada, recibida acumulada y pendiente por partida.

### COM-017 — Confirmar Recepción e impactar inventario

Al confirmar Recepción, generar movimiento de entrada y aumentar Física en la variante correcta.

### COM-018 — Costo recibido

Registrar costo recibido cuando corresponda, sin perder el costo documental de la OC.

### COM-019 — Reversión controlada de Recepción

Permitir corregir una recepción confirmada mediante reversión trazable, no borrando historia.

## Gate QA

- OC existente sigue funcionando.
- OC permite 946 ml y 5 L como partidas distintas.
- Recepción parcial deja pendiente correcto.
- Segunda recepción completa el pendiente.
- Confirmar recepción aumenta existencia.
- Reintento no duplica existencia.

---

# SPRINT 3 — Cotizaciones 2.0

## Objetivo

Auditar puntualmente el módulo actual de Cotizaciones y dejar una cotización funcional que soporte productos, variantes, servicios, flete e información operativa sin afectar inventario.

## Tickets

### COM-020 — Auditoría puntual de Cotizaciones existentes

Determinar qué se conserva, qué se corrige y qué se construye. No adoptar piezas NEXT no autorizadas.

### COM-021 — Producto y variante en Cotización

Permitir cotizar producto simple o producto con variante. La variante debe viajar posteriormente a Pedido.

### COM-022 — Servicios en Cotización

Permitir servicios sin tratarlos como inventario. Servicio no consulta existencia ni genera movimiento físico.

### COM-023 — Existencia informativa

Mostrar Física, Comprometida y Disponible como dato informativo. Cotizar no reserva stock.

### COM-024 — Cotizar sin existencia

Permitir o bloquear cotización sin existencia según decisión PO. No confundir con Pedido o Venta sin existencia.

### COM-025 — Concepto pendiente

Permitir capturar temporalmente un concepto que todavía no existe en ProductosServicios.

### COM-026 — Resolver concepto pendiente

Antes de convertir a Pedido, vincular el concepto pendiente a un ProductoServicio existente o darlo de alta por el flujo autorizado.

### COM-027 — Flete en Cotización

Agregar flete como cargo comercial no inventariable, visible en totales y documentos.

### COM-028 — Datos de instalación y operador sugerido

Para servicios, permitir fecha propuesta, observaciones para instalador y Operador sugerido. No marcar ejecución por capturar estos datos.

### COM-029 — Documento/PDF de Cotización

Generar documento entendible para cliente con productos, variantes, servicios, flete, vigencia y totales.

## Gate QA

- Cotización con producto simple.
- Cotización con variante 946 ml.
- Cotización con servicio.
- Cotización con flete.
- Cotización con concepto pendiente.
- Existencia se muestra pero no cambia.
- PDF refleja lo capturado.

---

# SPRINT 4 — Pedido y compromiso

## Objetivo

Crear Pedido como paso formal entre Cotización y Venta. Pedido confirma intención comercial y puede comprometer inventario sin disminuir Física.

## Tickets

### COM-030 — Modelo de Pedido

Crear Pedido y detalle con Cotización origen, cliente, sucursal, vendedor, productos, variantes, servicios, flete y totales.

### COM-031 — Convertir Cotización autorizada a Pedido

Sólo una cotización elegible puede convertirse a Pedido. Dos clics no deben generar dos pedidos.

### COM-032 — Validaciones antes de Pedido

Bloquear conversión si hay conceptos pendientes sin resolver o partidas inválidas.

### COM-033 — Compromiso de inventario

Pedido confirmado aumenta Comprometida para productos inventariables en la variante correcta.

Servicio y flete no comprometen inventario.

### COM-034 — Pedido sin disponibilidad suficiente

Aplicar la política definida por PO: bloquear, permitir pendiente sin compromiso completo o permitir compromiso negativo autorizado.

### COM-035 — Cancelar Pedido y liberar compromiso

Cancelar Pedido debe liberar únicamente el compromiso pendiente y conservar lo ya surtido.

### COM-036 — Servicios dentro del Pedido

Conservar servicio, fecha propuesta, observaciones, Operador sugerido, Operador asignado y Ayudantes cuando aplique.

### COM-037 — Flete dentro del Pedido

Conservar el flete acordado desde Cotización y prepararlo para Venta sin volverlo inventario.

### COM-038 — Preparar Pedido para surtimiento parcial

Guardar cantidades pedidas, surtidas y pendientes para permitir una o varias Ventas posteriores.

## Gate QA

- Cotización autorizada se convierte en un solo Pedido.
- Producto con variante compromete la variante correcta.
- Servicio y flete no afectan inventario.
- Cancelar libera compromiso pendiente.
- Pedido queda listo para surtimiento parcial.

---

# SPRINT 5 — Formas de pago, Caja mínima y Ajustes PV

## Objetivo

Preparar la configuración necesaria para Checkout, Cobro y Postventa sin asumir todavía una Caja enorme aprobada.

## Tickets

### COM-039 — Catálogo de Formas de Pago

Crear o evolucionar catálogo comercial de formas de pago: efectivo, tarjeta, transferencia y otras autorizadas.

### COM-040 — Formas de Pago por Sucursal

Definir qué formas acepta cada sucursal y sólo mostrar formas activas.

### COM-041 — Reglas por Forma de Pago

Definir datos requeridos por forma: referencia, cambio en efectivo, autorización u otros datos permitidos.

### COM-042 — Caja POS mínima

Crear el contexto mínimo de Caja necesario para Cobro: caja, sesión si aplica, cajero y trazabilidad.

El alcance completo de apertura/cierre/arqueo/diferencias queda pendiente de decisión PO.

### COM-043 — Movimientos básicos de Caja

Registrar el efecto monetario de un Cobro sin confundir efectivo físico con tarjeta, transferencia, NC o Vale.

### COM-044 — Ajustes PV

Configurar días de devolución, vigencia de Nota de Crédito y vigencia de Vale por sucursal cuando corresponda.

## Gate QA

- Sucursal muestra sólo formas habilitadas.
- Efectivo calcula cambio.
- Tarjeta/transferencia no aumentan efectivo físico.
- Caja queda vinculada al Cajero y Cobro.
- Ajustes PV alimentan devolución, NC y Vale.

---

# SPRINT 6 — Venta desde Pedido, surtimiento y cobro

## Objetivo

Crear Venta desde Pedido, permitiendo surtimiento parcial, disminución de inventario, liberación de compromiso, Cobro y Ticket.

## Tickets

### COM-049 — Seleccionar Pedido para Venta

Buscar pedidos pendientes o parcialmente surtidos por cliente, folio, fecha, sucursal o vendedor.

### COM-050 — Resumen de Pedido antes de surtir

Mostrar partidas, variantes, cantidades pedidas, surtidas, pendientes, Física, Comprometida y Disponible.

### COM-051 — Preparar surtimiento

Capturar cuánto se surtirá ahora por partida. Preparar no afecta inventario.

### COM-052 — Confirmar surtimiento

Al confirmar, disminuir Física, liberar Comprometida y actualizar surtido/pendiente de Pedido.

### COM-053 — Surtimiento parcial y múltiples Ventas

Permitir que un Pedido se atienda en varias operaciones sin duplicar cantidades.

### COM-054 — Servicio dentro de Venta

Servicio puede venderse/cobrarse sin generar movimiento de inventario. Su cierre operativo queda pendiente de decisión PO.

### COM-055 — Flete en Venta parcial

Evitar perder, duplicar o cobrar dos veces el flete cuando el Pedido genere varias Ventas parciales.

La regla exacta queda pendiente de decisión PO.

### COM-056 — Checkout

Mostrar Pedido, Venta, cliente, vendedor, cajero, productos, variantes, servicios, flete, subtotal, total y formas de pago habilitadas.

### COM-057 — Cobro

Registrar una o varias formas de pago, validando total, saldo, cambio y referencias requeridas.

### COM-058 — Efecto en Caja

Registrar efecto monetario del Cobro. Efectivo aumenta efectivo esperado; tarjeta/transferencia/NC/Vale no.

### COM-059 — Ticket

Generar comprobante de Venta con productos, variantes, servicios, flete, vendedor, cajero, formas de pago y datos necesarios para devolución futura.

## Gate QA

- Pedido se abre para Venta.
- Surtir 946 ml no toca 5 L.
- Surtimiento parcial deja pendiente correcto.
- Inventario baja una sola vez.
- Compromiso se libera correctamente.
- Vendedor y Cajero quedan diferenciados.
- Cobro cuadra con total.
- Ticket no duplica Venta, Cobro ni inventario.

---

# SPRINT 7 — Postventa

## Objetivo

Resolver devoluciones sin borrar la Venta original y permitiendo reingreso, Nota de Crédito, Vale y aplicación posterior.

## Tickets

### COM-060 — Devolución desde Venta/Ticket

Localizar Venta o Ticket, validar plazo, sucursal, estado y partidas devolvibles.

### COM-061 — Devolución parcial o total

Calcular vendido, devuelto acumulado y disponible para devolver por partida y variante.

### COM-062 — Motivos y autorización de devolución

Registrar motivo, observaciones, responsable y autorizador cuando aplique.

### COM-063 — Reingreso a inventario

Si la devolución es reingresable, generar entrada de inventario en la variante correcta.

### COM-064 — Producto no reingresable

Permitir aceptar devolución comercial sin aumentar existencia cuando el producto esté dañado o no sea revendible.

### COM-065 — Nota de Crédito

Emitir NC con folio, cliente, importe, saldo, vigencia, estado y origen en devolución.

### COM-066 — Vale

Emitir Vale como documento distinto de NC, con saldo, vigencia y titularidad según decisión PO.

### COM-067 — Aplicación posterior de NC/Vale

Permitir usar saldo vigente en una Venta posterior, parcial o total, combinado con otras formas de pago.

### COM-068 — Consulta de Postventa

Consultar devoluciones, reingresos, NC, Vales, saldos, vencimientos y aplicaciones.

## Gate QA

- Devolución parcial reduce cantidad devolvible.
- Reingresable aumenta Física.
- No reingresable no aumenta Física.
- NC/Vale tienen saldo y vigencia.
- Aplicación posterior descuenta saldo.
- NC/Vale no aumentan efectivo físico.
- Venta original permanece intacta.

---

# SPRINT 8 — Reportes y cierre funcional

## Objetivo

Dar visibilidad suficiente del ciclo completo sin crear un sprint enorme de reportes individuales.

## Tickets

### COM-069 — Reportes de compras, recepción e inventario

Consultar OC, recepciones, pendientes, existencias y Kardex por producto, variante, sucursal y fecha cuando aplique.

### COM-070 — Reportes de cotizaciones, pedidos y ventas

Consultar cotizaciones, conversión a Pedido, pedidos, surtimientos, ventas, vendedor, cajero, importes y estados.

### COM-071 — Reportes de cobro, caja y formas de pago

Conciliar ventas, cobros, forma de pago, efectivo, medios no efectivos, caja, sesión y diferencias cuando aplique.

### COM-072 — Reportes de postventa y saldos

Consultar devoluciones, reingresos, NC, Vales, saldos disponibles, vencidos, agotados y aplicaciones posteriores.

### COM-073 — Indicadores comerciales básicos

Mostrar indicadores simples y explicables: compras, inventario, cotizaciones, pedidos, ventas, cobros, postventa y responsables.

### COM-074 — QA E2E y regresión final

Certificar el ciclo completo:

```text
OC -> Recepción -> Existencia
Cotización -> Pedido -> Venta -> Cobro -> Ticket
Venta -> Devolución -> NC/Vale -> Aplicación posterior
```

Validar también multitenant, permisos, variantes, Caja, ProductosServicios y cero dependencia NEXT.

## Gate QA

- Reportes no modifican datos.
- Variante se conserva en todo el ciclo.
- Caja se explica con cobros/movimientos.
- Postventa se rastrea hasta Venta original.
- Empresa A no ve datos de Empresa B.
- ProductosServicios y OC existente no sufren regresiones.

---

# Dependencias Entre Sprints

```text
Fundación actual: ProductosServicios + Variantes + OC existente
        |
        v
S0 Usuarios y capacidades
        |
        v
S1 Inventario por variante
        |
        +--> S2 OC + Recepción
        |
        +--> S3 Cotizaciones 2.0
                  |
                  v
              S4 Pedido + Compromiso
                  |
        S5 Pagos/Caja/Ajustes y asistencia operativa pueden avanzar en paralelo
                  |
                  v
              S6 Venta + Cobro + Ticket
                  |
                  v
              S7 Postventa
                  |
                  v
              S8 Reportes + cierre funcional
```

# Prioridades

| Prioridad | Uso |
|---|---|
| P0 | Bloquea camino funcional inmediato, inventario, dinero, seguridad o continuidad E2E |
| P1 | Necesario para completar el proceso objetivo |
| P2 | Mejora, preparación o capacidad posterior |

En esta versión simplificada se evita marcar casi todo como P0. Las prioridades se asignarán ticket por ticket cuando el PO seleccione el Sprint activo.

# Decisiones Pendientes Del Product Owner

| ID | Decisión | Opciones resumidas | Impacto |
|---|---|---|---|
| PO-001 | Inventario por empresa o por sucursal | Empresa + producto + variante, o empresa + sucursal + producto + variante | Inventario, recepción, compromiso, venta, devolución, reportes |
| PO-002 | Cotizar sin existencia | Permitir, bloquear o permitir con advertencia/regla | Cotizaciones |
| PO-003 | Pedido sin disponibilidad suficiente | Bloquear, permitir pendiente, o permitir compromiso negativo autorizado | Pedido, compromiso, surtimiento |
| PO-004 | Alcance de Caja | Caja POS mínima, Caja completa, o alcance progresivo | Caja, cobro, reportes |
| PO-005 | Días de devolución | Política vigente al vender o al devolver | Postventa |
| PO-006 | Asistencia como requisito | Informativa, obligatoria o configurable | Venta, cobro, servicios |
| PO-007 | Pago parcial de Venta | Liquidación completa o saldo pendiente permitido | Checkout, cobro, estados |
| PO-008 | Vale | Ligado al cliente o transferible/portador | Vale y aplicación posterior |
| PO-009 | Flete en Ventas parciales | Primera venta, última venta, prorrateo o control operativo | Pedido, Venta, Ticket, Reportes |
| PO-010 | Cierre de Servicio | Al cobrar, al ejecutar, doble estado o política PO | Pedido, Venta, Operadores, Reportes |

# Qué Se Consolidó Desde V6

Este backlog consolida idempotencia, trazabilidad, snapshots, auditoría, multitenant, seguridad, migración, documentación, estados y QA como reglas de terminado dentro de tickets funcionales. No se eliminan como requisitos; dejan de existir como tickets independientes cuando no representan una capacidad funcional separada.

# Qué Queda Fuera

- No se usa NEXT como fuente de verdad.
- No se reconstruye ProductosServicios.
- No se reconstruye OC.
- No se aprueba Caja completa sin decisión PO.
- No se implementa Facturación completa en esta versión.
- No se crean nuevos tipos físicos de usuario sólo por existir perfiles comerciales.

# Dictamen Documental

BACKLOG SIMPLIFICADO GENERADO COMO BORRADOR PARA REVISIÓN DEL PRODUCT OWNER.
