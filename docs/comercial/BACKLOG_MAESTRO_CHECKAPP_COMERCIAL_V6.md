> ### - BACKLOG MAESTRO CHECKAPP COMERCIAL V6

**Subtítulo:** Evolución integral del ciclo comercial

**Estado:** PROPUESTA PARA REVISIÓN DEL PRODUCT OWNER

**Fecha:** 2026-08-31

**Alcance:** Productos y Servicios -\> Inventario -\> Compras -\> Recepción -\> Cotización -\> Pedido -\> Venta -\> Cobro -\> Postventa -\> Reportes

## 1. Propósito del Backlog

Este documento consolida el Backlog Maestro CheckApp Comercial V6 como plan rector propuesto para revisar con Product Owner. Su función es ordenar qué existe hoy, qué se reutiliza, qué se evoluciona, qué se construye, qué depende de decisión PO y cómo se certifica cada Sprint sin depender de NEXT ni reconstruir contexto desde cero.

La generación de este documento no equivale a aprobación del Product Owner ni autoriza implementar tickets, ejecutar SQL o realizar migraciones. Cada COM-xxx deberá activarse, desarrollarse, validarse y aprobarse individualmente.

## 2. Resumen Ejecutivo

CheckApp ya cuenta con una fundación relevante en ProductosServicios: productos, servicios, variantes, atributos, costo/precio e imagen por variante, Tags, catálogos comerciales, paquetes, ficha técnica, PDF, pesos logísticos, inventario actual y movimientos actuales. Esa base no se reconstruye: V6 la consume y la evoluciona cuando sea necesario.

Órdenes de Compra existe, es aprovechable y no depende de tablas NEXT. Su tratamiento correcto es evolucionar la OC existente para soportar variante, snapshots, exportables y preparación para Recepción, no construirla desde cero.

Inventario existe por empresa + producto. El objetivo V6 es evolucionarlo a producto + variante nullable, con Sucursal sujeta a PO-001, separando Física, Comprometida, Disponible y Mínima. Recepción no existe actualmente y se construye como puente formal entre OC e Inventario.

El siguiente foco recomendado tras aprobación PO es Inventario por variante + evolución de OC + Recepción, porque la existencia confiable por variante habilita Pedido, Surtimiento, Venta, Cobro y Postventa.

## 3. Principios y Reglas de Alcance

- V6 es propuesta para revisión del Product Owner, no backlog aprobado.
- No se implementa ningún COM-xxx por generar este documento.
- No se ejecuta SQL ni migraciones dentro de esta tarea documental.
- Producto simple usa variante NULL; producto con variantes conserva variante exacta.
- Usuario, Rol, Permiso y Operador son conceptos distintos.
- Venta, Cobro y Movimiento de Caja son documentos/efectos distintos.
- Devolución, Reingreso, Nota de Crédito y Vale son procesos distintos.
- Los reportes consumen fuentes reales y no corrigen datos silenciosamente.
- Multitenant debe validarse en backend; empresa/sucursal no se infieren de forma insegura.
- NEXT queda fuera del alcance salvo autorización expresa futura del Product Owner.

## 4. Fuente de Verdad y Exclusión de NEXT

NEXT no es fuente de verdad del programa comercial. La existencia física de código, vistas, tablas o endpoints dentro de NEXT no autoriza su uso. Las menciones a NEXT en V6 son históricas, prohibitivas o de auditoría; dependencias NEXT activas certificadas: 0.

## 5. Estado Actual Real del Proyecto

| Área                                        | Estado V6                                            | Tratamiento                                                       |
| ------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| ProductosServicios                          | Implementado / demostrable hoy como fundación actual | Consumir y evolucionar sólo donde el flujo comercial lo requiera  |
| Variantes                                   | Implementadas como base reciente                     | Preservar extremo a extremo                                       |
| Inventario                                  | Implementado por empresa + producto                  | Evolucionar a producto + variante nullable; Sucursal según PO-001 |
| Órdenes de Compra                           | Implementada / aprovechable                          | Evolucionar OC existente; no reconstruir                          |
| Recepción                                   | No existe actualmente                                | Nueva construcción                                                |
| Cotización, Pedido, Venta, Cobro, Postventa | Definición funcional V6                              | Nueva construcción/evolución según Sprint                         |
| NEXT                                        | No autorizado                                        | Excluir como dependencia activa                                   |

## 6. Evolución del Backlog

V6 conserva capacidades válidas del backlog original y recuperaciones V4/V5, integra la realidad reciente de ProductosServicios y reemplaza documentos anteriores como propuesta rectora una vez sea aprobada por PO. V4/V5 permanecen como histórico documental, no como fuente vigente posterior a la aprobación de V6.

## 7. Arquitectura Funcional Objetivo

La arquitectura funcional se organiza en tres cadenas conectadas: abastecimiento, operación comercial y postventa. Cada documento debe conservar origen, destino, empresa, sucursal cuando aplique, producto, variante, cliente/responsable y efectos físicos/monetarios trazables.

## 8. Flujo Comercial E2E

```text
ProductosServicios -> Variantes -> Inventario -> OC -> Recepción -> Movimiento -> Existencia
Cotización -> Pedido -> Compromiso -> Surtimiento -> Venta -> Cobro -> Caja -> Ticket
Ticket/Venta -> Devolución -> Reingreso si aplica -> NC/Vale -> Aplicación posterior -> Reportes
```

## 9. Modelo Transversal de Usuarios

| Perfil         | Procesos principales                                     | Responsabilidad documental                       | Login                      | Sucursal                        | Asistencia                   |
| -------------- | -------------------------------------------------------- | ------------------------------------------------ | -------------------------- | ------------------------------- | ---------------------------- |
| Agente         | Cotización, atención comercial inicial, seguimiento      | Capturista/responsable comercial según permiso   | Sí                         | Sí, cuando el flujo lo requiera | Según PO-006                 |
| Vendedor       | Cotización, Pedido, Venta, seguimiento                   | Responsable comercial                            | Sí                         | Sí                              | Según PO-006                 |
| Cajero         | Checkout, Cobro, Caja, Ticket, Postventa operativa       | Responsable de cobro/capturista                  | Sí                         | Sí                              | Según PO-006                 |
| Operador       | Servicios, instalación/ejecución, operación comercial    | Responsable operativo                            | Sí                         | Sí                              | Según PO-006                 |
| Ayudante       | Participación operativa y apoyo en servicios             | Participante                                     | Puede participar sin Login | Sí, si se registra operación    | Según PO-006                 |
| Administración | Catálogos, configuración, ajustes, reportes, excepciones | Capturista/autorizador según permiso             | Sí                         | Sí                              | Según PO-006 si se configura |
| Super Usuario  | Configuración crítica, permisos, excepciones             | Autorizador/administrador superior según permiso | Sí                         | Sí                              | Según PO-006 si se configura |
| Supervisor     | Autorizaciones, excepciones, QA operativo, reportes      | Autorizador/supervisor                           | Sí                         | Sí                              | Según PO-006 si se configura |

## 10. Matrices Maestras Consolidadas

### 10.1 Entidades y Tablas

| Elemento                                                                       | Clasificación                            | Uso                                                    |
| ------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------ |
| ProductosServicios, variantes, catálogos, ficha técnica, PDF, pesos logísticos | Tabla física/fundación actual            | Base del ciclo comercial                               |
| OrdenesCompraFolios, OrdenesCompra, OrdenesCompraDetalle                       | Tabla física confirmada                  | OC existente aprovechable                              |
| ProductosServiciosExistencias, ProductosServiciosMovimientosInventario         | Tabla a evolucionar/reutilizar           | Existencia, movimientos y Kardex por variante nullable |
| Recepción, RecepciónDetalle                                                    | Entidad conceptual nueva                 | Confirmación de recibido y entrada a inventario        |
| Cotización, Pedido, Venta, Cobro, Ticket, Devolución, NC, Vale                 | Entidades conceptuales nuevas/evolutivas | Documentos comerciales y postventa                     |
| Sucursal/FormaPago, Caja, Sesión Caja, Movimiento Caja                         | Entidades S5                             | Efectos monetarios y operación de caja                 |
| NEXT/nxt\_\*                                                                   | No autorizada                            | Fuera de alcance y sin dependencia activa              |

### 10.2 Efectos de Inventario

| Documento/Evento           | Física                | Comprometida | Regla                                    |
| -------------------------- | --------------------- | ------------ | ---------------------------------------- |
| OC                         | Sin cambio            | Sin cambio   | OC no modifica inventario                |
| Recepción en captura       | Sin cambio            | Sin cambio   | Sólo preparación                         |
| Recepción confirmada       | Aumenta               | Sin cambio   | Entrada trazable e idempotente           |
| Cotización                 | Sin cambio            | Sin cambio   | No modifica stock                        |
| Pedido confirmado          | Sin cambio            | Aumenta      | Genera compromiso/reserva                |
| Surtimiento confirmado     | Disminuye             | Disminuye    | Salida física y liberación de compromiso |
| Venta/Cobro                | Sin cambio            | Sin cambio   | No duplica salida física                 |
| Devolución                 | Sin cambio automático | Sin cambio   | Debe clasificarse                        |
| Devolución reingresable    | Aumenta               | Sin cambio   | Entrada por devolución                   |
| Devolución no reingresable | Sin cambio            | Sin cambio   | No vuelve a stock vendible               |
| NC/Vale                    | Sin cambio            | Sin cambio   | Saldo económico, no inventario           |

### 10.3 Efectos Monetarios

| Elemento              | Efecto                           | Regla                                           |
| --------------------- | -------------------------------- | ----------------------------------------------- |
| Venta                 | Documento comercial              | No equivale a cobro                             |
| Cobro                 | Aplicación de Formas de Pago     | No modifica inventario                          |
| Movimiento Caja       | Efecto monetario de Cobro        | Debe rastrearse a Caja/Sesión/Cajero            |
| Efectivo              | Aumenta efectivo físico esperado | Cambio no es venta adicional ni vale automático |
| Tarjeta/Transferencia | Cobro no efectivo                | No incrementa efectivo físico                   |
| NC/Vale               | Aplicación de saldo              | No son efectivo y no modifican inventario       |

### 10.4 Cobertura Funcional

| Capacidad            | Cubierta | Tickets principales                         | Observación                                                                          |
| -------------------- | -------- | ------------------------------------------- | ------------------------------------------------------------------------------------ |
| ProductosServicios   | Sí       | Fundación actual, COM-001, COM-009, COM-145 | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Variantes            | Sí       | COM-009 a COM-021 y continuidad E2E         | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Inventario           | Sí       | COM-009 a COM-021, COM-132                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| OC                   | Sí       | COM-022 a COM-027, COM-131                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Recepción            | Sí       | COM-028 a COM-040                           | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Cotización           | Sí       | COM-041 a COM-054, COM-133                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Pedido               | Sí       | COM-055 a COM-068, COM-134                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Compromiso           | Sí       | COM-060 a COM-064, COM-097                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Surtimiento          | Sí       | COM-089 a COM-099, COM-134                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Venta                | Sí       | COM-089, COM-100 a COM-110, COM-135         | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Cobro                | Sí       | COM-101 a COM-105, COM-135                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Caja                 | Sí       | COM-073 a COM-077, COM-104                  | Cubierta como capacidad propuesta; alcance operativo pendiente de PO-009. |
| Ticket               | Sí       | COM-106, COM-109                            | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Devolución           | Sí       | COM-111 a COM-115, COM-136                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Reingreso            | Sí       | COM-116 a COM-120, COM-136                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| NC                   | Sí       | COM-122, COM-124 a COM-126, COM-137         | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Vale                 | Sí       | COM-123 a COM-126, COM-137                  | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Aplicación posterior | Sí       | COM-125, COM-126, COM-144                   | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |
| Reportes             | Sí       | COM-131 a COM-146                           | Cubierta funcionalmente en V6; estado de implementación se decide por Sprint/ticket. |

## 11. Decisiones del Product Owner

| ID     | Decisión                               | Opciones                                                                                                | Impacto                                                                                   | Tickets afectados                                                                                                            | Momento límite                                                  | Estado       |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------ |
| PO-001 | Dimensión operativa del inventario     | A: empresa+producto+variante. B: empresa+sucursal+producto+variante.                                    | Inventario, movimientos, recepción, compromiso, surtimiento, venta, devolución, reportes. | COM-009, COM-010, COM-011, COM-014, COM-015, COM-016, COM-019, COM-020, COM-021, COM-037, COM-060, COM-096, COM-117, COM-132 | Antes del diseño técnico definitivo de inventario por variante. | Pendiente PO |
| PO-002 | Cotizar sin existencia                 | A definir comportamiento al cotizar sin Disponible suficiente.                                          | Cotizaciones 2.0; no afecta Pedido/Venta directamente.                                    | COM-046                                                                                                                      | Antes de cerrar comportamiento funcional de Cotizaciones.       | Pendiente PO |
| PO-003 | Pedido con disponibilidad insuficiente | A: bloquear. B: permitir pendiente sin compromiso negativo. C: permitir compromiso negativo autorizado. | Pedido, compromiso, disponible, surtimiento y venta.                                      | COM-062, COM-068, COM-093, COM-097                                                                                           | Antes de cerrar Pedido/Compromiso.                              | Pendiente PO |
| PO-004 | Política de apertura de Caja           | A: una sesión activa por Caja. B: sesiones concurrentes con regla explícita.                            | Caja, sesión de caja, cobro.                                                              | COM-074, COM-082                                                                                                             | Antes de cerrar apertura/sesiones de Caja.                      | Pendiente PO |
| PO-005 | Temporalidad de política de Devolución | A: política vigente al vender. B: política vigente al devolver.                                         | Ajustes PV y validación de devoluciones.                                                  | COM-079, COM-082, COM-112                                                                                                    | Antes de implementar validación definitiva de Devoluciones.     | Pendiente PO |
| PO-006 | Asistencia como requisito operativo    | A: informativa. B: obligatoria por procesos. C: configurable por perfil/proceso.                        | Vendedor, Cajero, Operador, Caja, Venta y servicios.                                      | COM-087, COM-088, COM-090, COM-093, COM-100, COM-108                                                                         | Antes de usar asistencia como bloqueo operativo.                | Pendiente PO |
| PO-007 | Pago parcial de Venta                  | A: liquidación completa en checkout. B: permitir pagos parciales y saldo pendiente.                     | Checkout, cobro, estados de venta y reportes.                                             | COM-103, COM-107, COM-110, COM-139                                                                                           | Antes de cerrar Checkout y estados de pago.                     | Pendiente PO |
| PO-008 | Titularidad/transferibilidad del Vale  | A: ligado a cliente original. B: transferible/portador bajo reglas.                                     | Emisión, saldo y aplicación posterior de Vale.                                            | COM-123, COM-125, COM-137                                                                                                    | Antes de cerrar Vale.                                           | Pendiente PO |
| PO-009 | Alcance operativo de Caja              | A: Caja POS mínima. B: Caja completa con apertura, movimientos, arqueo, cierre y diferencias. C: alcance progresivo. | S5, S7 y reportes de Caja.                                                                | COM-073, COM-074, COM-075, COM-076, COM-077, COM-082, COM-100, COM-104, COM-135                                             | Antes de cerrar alcance funcional de Caja y Cobro.              | Pendiente PO |
| PO-010 | Cobro de Flete en Ventas parciales     | A: cobrar todo en primera Venta. B: cobrar todo en última Venta. C: prorratear. D: selección/control operativo. | Pedido, Surtimiento parcial, Venta, Checkout, Ticket y Reportes.                         | COM-049, COM-067, COM-089, COM-095, COM-100, COM-106, COM-134, COM-135                                                     | Antes de cerrar Venta parcial y Checkout con Flete.             | Pendiente PO |
| PO-011 | Cierre comercial y operativo de Servicio | A: al incluirse/cobrarse en Venta. B: al confirmar ejecución operativa. C: dos estados independientes. D: otra política PO. | Pedido, Surtimiento, Venta, Ticket, Operadores, Asistencia, Reportes y Postventa.         | COM-044, COM-050, COM-051, COM-065, COM-066, COM-089, COM-098, COM-108, COM-134, COM-138                                    | Antes de cerrar estados de Servicio en Pedido/Venta/Reportes.   | Pendiente PO |

## 12. Mapa de Sprints

| Sprint | Objetivo                           | Tickets | Rango             | Resultado/Gate                                             |
| ------ | ---------------------------------- | ------: | ----------------- | ---------------------------------------------------------- |
| S0     | Usuarios y capacidades comerciales | 8       | COM-001 a COM-008 | Gate funcional del sprint y evidencias E2E cuando aplique. |
| S1     | Inventario por variante            | 13      | COM-009 a COM-021 | Gate funcional del sprint y evidencias E2E cuando aplique. |
| S2     | OC + Recepción                     | 19      | COM-022 a COM-040 | Gate funcional del sprint y evidencias E2E cuando aplique. |
| S3     | Cotizaciones 2.0                   | 14      | COM-041 a COM-054 | Gate funcional del sprint y evidencias E2E cuando aplique. |
| S4     | Pedido + Compromiso                | 14      | COM-055 a COM-068 | Gate funcional del sprint y evidencias E2E cuando aplique. |
| S5     | Formas de Pago + Caja + Ajustes PV | 14      | COM-069 a COM-082 | Gate funcional del sprint y evidencias E2E cuando aplique. |
| S6     | Asistencia y Operación Comercial   | 6       | COM-083 a COM-088 | Gate funcional del sprint y evidencias E2E cuando aplique. |
| S7     | Venta + Surtimiento + Cobro        | 22      | COM-089 a COM-110 | Gate funcional del sprint y evidencias E2E cuando aplique. |
| S8     | Postventa                          | 20      | COM-111 a COM-130 | Gate funcional del sprint y evidencias E2E cuando aplique. |
| S9     | Reportes + Trazabilidad + Cierre   | 16      | COM-131 a COM-146 | Gate funcional del sprint y evidencias E2E cuando aplique. |

**Total certificado:** 146 tickets. **Prioridades corregidas:** P0=106, P1=39, P2=1, P3=0.

## 13. Camino Crítico

```text
Fundación actual: ProductosServicios + Variantes + OC existente
-> S0 Usuarios/Capacidades
-> S1 Inventario por variante
-> S2 Evolución OC + Recepción
-> S4 Pedido + Compromiso, después de S1 y S3
-> S7 Surtimiento + Venta + Cobro + Ticket, después de S1/S4/S5
-> S8 Postventa, después de S7 y políticas S5
-> S9 Reportes + Certificación E2E
```

S3 Cotizaciones 2.0, S5 Formas de Pago/Caja/Ajustes PV y S6 Asistencia/Operación pueden avanzar parcialmente en paralelo cuando no dependan de decisiones PO o estructuras pendientes.

## 14. Backlog Detallado por Sprint

### S0 — Usuarios y capacidades comerciales

**Qué entrega:** 8 tickets, de COM-001 a COM-008.

#### COM-001 — AUDITORÍA DEL MODELO REAL DE IDENTIDAD COMERCIAL

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Determinar qué estructuras actuales pueden reutilizarse para representar
los perfiles y responsabilidades comerciales.

**Funcionalidad**

Auditar y documentar el modelo real de:

- Usuario;
- Rol;
- Permiso;
- relaciones Usuario/Rol;
- relaciones Rol/Permiso;
- Operador;
- personas/empleados si existen;
- Empresa;
- Sucursal.

Mapear este modelo contra los 8 perfiles de referencia:

1. Agente
2. Vendedor
3. Cajero
4. Operador
5. Ayudante
6. Administración
7. Super Usuario
8. Supervisor

**Reglas**

- Tipo 1..8 es referencia funcional.
- NO crear automáticamente tabla TipoUsuario.
- NO crear enum TipoUsuario.
- NO crear segundo Login.
- Usuario != Rol != Permiso != Operador.
- Ayudante debe poder participar sin Login.
- Reutilizar Operador cuando sea compatible.
- No depender de NEXT.

**Tablas/Componentes relevantes**

Usar nombres físicos únicamente después de confirmarlos mediante auditoría.

**Usuarios/Responsables**

8 perfiles.

**Dependencias**

Ninguna.

**Criterios de aceptación**

- modelo real identificado;
- tablas reales identificadas;
- relaciones identificadas;
- Operador documentado;
- alternativa para Ayudante documentada;
- 0 dependencias NEXT;
- 0 estructuras nuevas inventadas sin necesidad.

======================================================================

#### COM-002 — MATRIZ DE CAPACIDADES DE LOS 8 PERFILES

**Prioridad:** P0

**Estado inicial:** LISTO PARA ANÁLISIS Y DISEÑO DETALLADO; no aprobado por PO todavía.

**Objetivo**

Definir qué puede hacer funcionalmente cada perfil.

**Funcionalidad**

Construir matriz:

Perfil × Proceso × Capacidad

incluyendo:

- Cotización;
- Compra;
- Recepción;
- Inventario;
- Pedido;
- Surtimiento/Operación;
- Venta;
- Cobro;
- Devolución;
- Autorización;
- Reportes.

Valores permitidos:

SÍ
NO
AUTORIZA
SUPERVISA
PARTICIPA SIN LOGIN
POR DEFINIR PO

**Reglas**

- No llenar la matriz de POR DEFINIR PO.
- Agente != Vendedor.
- Vendedor != Cajero.
- Usuario != Operador.
- Ayudante puede participar sin Login.
- Supervisor y Super Usuario no equivalen automáticamente.

**Dependencias**

COM-001

**Criterios de aceptación**

- 8/8 perfiles presentes;
- todos los procesos presentes;
- Login/no Login respetado;
- capacidades conocidas documentadas;
- únicamente las reglas realmente desconocidas quedan para PO.

======================================================================

#### COM-003 — MODELO DE PERMISOS COMERCIALES

**Prioridad:** P0

**Estado inicial:** LISTO PARA ANÁLISIS Y DISEÑO DETALLADO; no aprobado por PO todavía.

**Objetivo**

Definir las capacidades de seguridad requeridas por el ciclo comercial.

**Funcionalidad**

Definir permisos para acciones como:

- consultar;
- crear;
- editar;
- cancelar;
- confirmar;
- recibir;
- ajustar;
- surtir;
- vender;
- cobrar;
- devolver;
- autorizar;
- exportar;
- consultar reportes.

**Reglas**

- Rol agrupa permisos.
- Perfil funcional NO sustituye permiso.
- No otorgar acceso por nombre de usuario.
- Mantener multitenant.
- Diferenciar operaciones normales de operaciones sensibles.
- No crear permisos globales innecesariamente amplios.

**Dependencias**

COM-001
COM-002

**Criterios de aceptación**

- matriz permiso × proceso definida;
- permisos sensibles identificados;
- autorización separada de captura;
- perfiles mapeables al sistema existente;
- no se rompe el modelo actual de seguridad.

======================================================================

#### COM-004 — RESPONSABLES DOCUMENTALES

**Prioridad:** P0

**Estado inicial:** LISTO PARA ANÁLISIS Y DISEÑO DETALLADO; no aprobado por PO todavía.

**Objetivo**

Distinguir quién captura, quién es responsable y quién autoriza cada
documento comercial.

**Funcionalidad**

Definir la responsabilidad para:

- OC;
- Recepción;
- Cotización;
- Pedido;
- Surtimiento;
- Venta;
- Cobro;
- Devolución;
- Nota de Crédito;
- Vale.

**Reglas**

Capturista != Responsable != Autorizador.

El modelo debe soportar casos como:

Administración captura OC
→ otro usuario puede ser responsable.

Vendedor realiza venta
→ Cajero realiza cobro.

Supervisor autoriza devolución
→ sin convertirse en vendedor o cajero.

**Dependencias**

COM-002
COM-003

**Criterios de aceptación**

- todos los documentos contemplados;
- responsable comercial identificable;
- responsable operativo identificable cuando aplique;
- autorizador separado;
- sólo casos realmente indefinidos quedan como decisión PO.

======================================================================

#### COM-005 — PARTICIPANTES SIN LOGIN

**Prioridad:** P1

**Estado inicial:** LISTO PARA ANÁLISIS Y DISEÑO DETALLADO; no aprobado por PO todavía.

**Objetivo**

Representar personas que participan físicamente en una operación sin
crearles acceso artificial al sistema.

**Funcionalidad**

Definir cómo relacionar:

- Operador;
- Ayudante;
- participante;
- responsable operativo.

**Reglas**

- Participar NO implica Login.
- Participar NO implica permiso.
- Ayudante puede quedar relacionado con la operación.
- Debe existir trazabilidad posterior.
- No duplicar personas si ya existe un catálogo reutilizable.

**Dependencias**

COM-001
COM-002

**Criterios de aceptación**

- Ayudante representable sin Login;
- relación con operación definida;
- relación con Operador definida cuando aplique;
- trazabilidad disponible;
- no se crea autenticación innecesaria.

======================================================================

#### COM-006 — ALCANCE COMERCIAL POR SUCURSAL

**Prioridad:** P0

**Estado inicial:** LISTO PARA ANÁLISIS Y DISEÑO DETALLADO; no aprobado por PO todavía.

**Objetivo**

Definir cómo interviene Sucursal en los procesos comerciales.

**Funcionalidad**

Auditar/definir alcance para:

- OC;
- Recepción;
- Inventario;
- Cotización;
- Pedido;
- Caja;
- Venta;
- formas de pago;
- Reportes.

**Reglas**

- No asumir que un usuario pertenece exclusivamente a una sucursal.
- No asumir todavía inventario por sucursal.
- La dimensión definitiva de inventario se resolverá en Sprint 1.
- Reutilizar la estructura actual de Sucursal.

**Dependencias**

COM-001
COM-002

**Criterios de aceptación**

- alcance actual identificado;
- procesos que requieren sucursal identificados;
- restricciones actuales identificadas;
- ninguna restricción nueva inventada.

======================================================================

#### COM-007 — AUTORIZACIONES Y OPERACIONES SENSIBLES

**Prioridad:** P1

**Estado inicial:** LISTO PARA ANÁLISIS Y DISEÑO DETALLADO; no aprobado por PO todavía.

**Objetivo**

Definir qué operaciones necesitan una autorización adicional.

**Funcionalidad**

Clasificar al menos:

- ajustes de inventario;
- cancelaciones;
- devoluciones;
- Nota de Crédito;
- Vale;
- ajustes PV;
- excepciones de stock;
- otras operaciones sensibles recuperadas del backlog original.

**Reglas**

Autorización es:

capacidad + permiso.

NO es un nuevo tipo de usuario.

Supervisor o Super Usuario pueden autorizar únicamente si sus permisos lo
permiten.

**Dependencias**

COM-003
COM-004

**Criterios de aceptación**

- operaciones sensibles clasificadas;
- captura separada de autorización;
- autorizaciones auditables;
- no existe bypass general por perfil.

======================================================================

#### COM-008 — CERTIFICACIÓN DEL MODELO COMERCIAL DE USUARIOS

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Cerrar Sprint 0 con una fuente funcional única para Sprints 1 a 9.

**Funcionalidad**

Certificar:

- perfiles;
- Login/no Login;
- capacidades;
- permisos;
- responsables;
- autorizadores;
- participantes;
- sucursal.

**Dependencias**

COM-001
COM-002
COM-003
COM-004
COM-005
COM-006
COM-007

**Criterios de aceptación**

- 8/8 perfiles cubiertos;
- matriz sin contradicciones;
- Usuario/Rol/Permiso diferenciados;
- Operador diferenciado;
- Ayudante sin Login resuelto;
- responsables documentales definidos;
- operaciones sensibles identificadas;
- alcance por sucursal documentado;
- decisiones PO restantes claramente identificadas;
- Sprints posteriores pueden consumir el modelo sin reinterpretarlo.

### S1 — Inventario por variante

**Qué entrega:** 13 tickets, de COM-009 a COM-021.

#### COM-009 — DEFINIR DIMENSIÓN OPERATIVA DEL INVENTARIO

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Cerrar la decisión estructural necesaria para establecer la fuente de
verdad del inventario.

**Funcionalidad**

Definir una de estas dos dimensiones:

OPCIÓN A

empresa
+ producto
+ variante nullable

OPCIÓN B

empresa
+ sucursal
+ producto
+ variante nullable

Esta decisión debe quedar documentada antes de modificar el modelo de
existencias.

**Reglas**

- Producto simple utiliza variante NULL.
- Producto con variantes tiene saldos independientes.
- No implementar ambas opciones como fuentes paralelas.
- No inferir sucursal únicamente desde el usuario.
- La decisión debe propagarse a Recepción, Pedido, Venta, Devolución y
  Reportes.
- Mantener aislamiento multitenant.

**Tablas/Componentes relevantes**

- ProductosServiciosExistencias
- ProductosServiciosVariantes
- ProductosServicios
- Sucursales

**Usuarios/Responsables**

- Product Owner
- Administración
- responsable de inventario

**Dependencias**

COM-006

**Decisión PO pendiente**

PO-001 — Dimensión de inventario.

A)
Empresa + Producto + Variante

B)
Empresa + Sucursal + Producto + Variante

**Criterios de aceptación**

- PO-001 resuelta;
- fuente de verdad definida;
- producto simple definido;
- producto con variantes definido;
- impacto sobre S2, S4, S7, S8 y S9 documentado;
- no existen dos fuentes operativas simultáneas.

======================================================================

**Decisión relacionada**

PO-001

#### COM-010 — EVOLUCIONAR EXISTENCIAS A PRODUCTO + VARIANTE

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Permitir saldos independientes por variante sin romper productos simples.

**Funcionalidad**

Evolucionar la existencia actual para representar:

PRODUCTO SIMPLE

Producto
+
Variante NULL

PRODUCTO CON VARIANTES

Producto
+
Variante específica

Si PO-001 selecciona inventario por sucursal:

la sucursal forma parte de la misma dimensión.

**Reglas**

- No eliminar compatibilidad con producto simple.
- No usar saldo consolidado como fuente operativa para productos con
  variantes.
- No duplicar saldos para la misma dimensión.
- Una variante no puede modificar el saldo de otra.
- Mantener separación por empresa.
- Mantener multitenant.
- No migrar saldos ambiguos dentro de este ticket.

**Tablas/Componentes relevantes**

- ProductosServiciosExistencias
- ProductosServicios
- ProductosServiciosVariantes
- Sucursales si PO-001 lo requiere

**Usuarios/Responsables**

- Administración
- usuarios con permisos de inventario

**Dependencias**

COM-009

**Criterios de aceptación**

Producto simple:

Producto A = 10

continúa siendo operable.

Producto con variantes:

Aceite / 946 ml = 10
Aceite / 5 L = 3

debe mantener dos saldos independientes.

Modificar:

946 ml = 8

NO modifica:

5 L = 3.

No debe existir duplicidad para una misma combinación operativa.

======================================================================

**Decisión relacionada**

PO-001

#### COM-011 — EVOLUCIONAR MOVIMIENTOS DE INVENTARIO A VARIANTE

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Permitir que cada entrada, salida o ajuste identifique exactamente qué
producto/variante fue afectado.

**Funcionalidad**

El movimiento debe poder identificar conceptualmente:

- empresa;
- sucursal si PO-001 lo requiere;
- producto;
- variante nullable;
- tipo de movimiento;
- cantidad;
- usuario;
- fecha;
- referencia documental.

**Reglas**

Producto simple:

variante NULL.

Producto con variantes:

variante exacta.

Un movimiento de:

946 ml

NO afecta:

5 L.

Los movimientos históricos sin variante deben seguir siendo consultables.

NO reescribir artificialmente la historia anterior.

**Tablas/Componentes relevantes**

- ProductosServiciosMovimientosInventario
- ProductosServiciosExistencias
- ProductosServiciosVariantes

**Usuarios/Responsables**

- Administración
- usuarios autorizados de inventario

**Dependencias**

COM-010

**Criterios de aceptación**

- producto simple genera movimiento válido;
- variante genera movimiento independiente;
- variante afectada queda identificada;
- movimientos históricos permanecen disponibles;
- no se mezcla la historia de variantes.

======================================================================

**Decisión relacionada**

PO-001

#### COM-012 — TRAZABILIDAD E IDEMPOTENCIA DEL MOVIMIENTO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Preparar movimientos para integrarse con documentos comerciales sin
duplicar inventario.

**Funcionalidad**

El movimiento debe poder relacionarse con:

- tipo de documento origen;
- documento origen;
- detalle origen.

Ejemplos posteriores:

Recepción
→ Entrada.

Surtimiento/Venta
→ Salida.

Devolución reingresable
→ Entrada.

Ajuste
→ Entrada o salida.

**Reglas**

Una misma operación documental:

NO debe generar el mismo efecto dos veces.

F5:

NO duplica movimiento.

Reintento:

NO duplica movimiento.

Doble clic o doble confirmación:

NO duplica existencia.

Debe ser posible rastrear:

Documento
→ Detalle
→ Movimiento.

Y también:

Movimiento
→ Documento origen.

**Tablas/Componentes relevantes**

- ProductosServiciosMovimientosInventario
- documentos comerciales futuros

**Dependencias**

COM-011

**Criterios de aceptación**

- origen documental identificable;
- detalle origen identificable;
- un efecto documental produce un solo movimiento válido;
- reintentos son seguros;
- movimiento puede rastrearse hacia su documento;
- preparado para Recepción en Sprint 2.

======================================================================

#### COM-013 — EXISTENCIA FÍSICA, COMPROMETIDA Y DISPONIBLE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Definir los saldos necesarios para Pedido y Venta sin implementar todavía
esos procesos.

**Funcionalidad**

Distinguir:

A. EXISTENCIA FÍSICA

Cantidad realmente existente.

B. EXISTENCIA COMPROMETIDA

Cantidad reservada por documentos comerciales que todavía no se ha
surtido/vendido.

C. EXISTENCIA DISPONIBLE

Cantidad todavía utilizable comercialmente.

Regla objetivo:

Disponible = Física - Comprometida

**Reglas**

- Física forma parte de Sprint 1.
- Comprometida será alimentada por Pedido en Sprint 4.
- Antes de Sprint 4, Comprometida puede ser 0.
- Antes de Sprint 4, Disponible puede equivaler a Física.
- No almacenar un valor derivado si puede producir contradicciones.
- La fuente de verdad debe quedar explícita.
- La fórmula debe operar sobre la misma dimensión de producto/variante.

**Tablas/Componentes relevantes**

- ProductosServiciosExistencias
- modelo futuro de Pedido/Compromiso

**Usuarios/Responsables**

- usuarios de Inventario
- Vendedor posteriormente como consumidor de Disponible
- Administración

**Dependencias**

COM-010
COM-011

**Criterios de aceptación**

Ejemplo:

Variante 946 ml

Física = 10
Comprometida = 3
Disponible = 7

Debe quedar claro que:

10 != 7

y que la existencia comprometida NO desaparece del cálculo.

Sprint 4 debe poder incorporar compromiso sin rediseñar nuevamente la
fuente de verdad.

======================================================================

#### COM-014 — EXISTENCIA MÍNIMA POR DIMENSIÓN OPERATIVA

**Prioridad:** P1

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Evitar que una existencia mínima general mezcle necesidades diferentes
entre variantes.

**Funcionalidad**

Definir existencia mínima para:

- producto simple;
- variante;
- sucursal únicamente si PO-001 así lo determina.

**Reglas**

Producto simple:

mínimo asociado a su saldo.

Producto con variantes:

cada variante puede tener un mínimo diferente.

Ejemplo:

Aceite / 946 ml
Mínimo = 5

Aceite / 5 L
Mínimo = 2

NO sustituirlos por:

Aceite
Mínimo = 7

como fuente operativa.

**Tablas/Componentes relevantes**

- ProductosServiciosExistencias
- ProductosServiciosVariantes

**Usuarios/Responsables**

- Administración
- responsables de inventario

**Dependencias**

COM-009
COM-010

**Criterios de aceptación**

- producto simple conserva mínimo;
- cada variante puede tener mínimo independiente;
- cambiar mínimo de 946 ml no cambia 5 L;
- sucursal se respeta únicamente si PO-001 la incluye;
- futuras alertas pueden consultar la dimensión correcta.

**Decisión relacionada**

PO-001

#### COM-015 — AJUSTES MANUALES DE INVENTARIO TRAZABLES

**Prioridad:** P1

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Permitir corregir diferencias reales de inventario sin editar
silenciosamente el saldo.

**Funcionalidad**

Permitir ajustes:

- positivos;
- negativos.

Cada ajuste debe identificar:

- empresa;
- sucursal si PO-001 la incorpora;
- producto;
- variante nullable;
- cantidad;
- tipo de ajuste;
- motivo;
- usuario que captura;
- responsable cuando corresponda;
- autorizador cuando aplique;
- fecha.

**Reglas**

- Cada ajuste confirmado debe generar movimiento.
- No editar directamente ExistenciaActual como operación ordinaria.
- Producto simple utiliza variante NULL.
- Producto con variantes afecta exclusivamente la variante seleccionada.
- Ajuste positivo aumenta existencia física.
- Ajuste negativo disminuye existencia física.
- No duplicar el ajuste por reintento.
- Las autorizaciones deben respetar COM-007.
- No permitir cantidades inválidas.
- No permitir que un ajuste negativo produzca un saldo prohibido por las
  reglas comerciales vigentes.

**Tablas/Componentes relevantes**

- ProductosServiciosExistencias
- ProductosServiciosMovimientosInventario
- ProductosServiciosVariantes
- modelo existente de usuarios/permisos

**Usuarios/Responsables**

Administración.

Supervisor/Super Usuario únicamente cuando la matriz de permisos y
autorizaciones lo determine.

**Dependencias**

COM-007
COM-011
COM-012

**Criterios de aceptación**

CASO:

Aceite / 946 ml = 10
Aceite / 5 L = 3

Ajuste:

946 ml +2

Resultado:

946 ml = 12
5 L = 3

Debe existir un movimiento trazable con:

- variante 946 ml;
- +2;
- motivo;
- usuario;
- fecha.

Reintentar la confirmación:

NO vuelve a sumar +2.

======================================================================

**Decisión relacionada**

PO-001

#### COM-016 — CLASIFICAR SALDOS HISTÓRICOS

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Determinar cómo debe tratarse cada saldo existente antes de convertir el
inventario por variante en fuente operativa.

**Funcionalidad**

Clasificar los productos existentes en cinco grupos.

GRUPO A — PRODUCTO SIN VARIANTES

El producto no tiene variantes activas.

Tratamiento:

conservar saldo con variante NULL.

GRUPO B — UNA SOLA VARIANTE ACTIVA

Existe una única variante activa.

Tratamiento:

candidato a conciliación/migración controlada.

NO migrar automáticamente sólo por existir una variante.

GRUPO C — MÚLTIPLES VARIANTES CON SALDO EXISTENTE

Existe un saldo consolidado previo y más de una variante.

Tratamiento:

requiere conciliación.

NO repartir automáticamente.

GRUPO D — MÚLTIPLES VARIANTES CON SALDO CERO

No existe saldo físico que repartir.

Tratamiento:

puede preparar saldos cero por variante cuando la implementación lo
requiera.

GRUPO E — MOVIMIENTOS HISTÓRICOS SIN VARIANTE

Tratamiento:

conservar historia previa.

NO inventar variante retroactivamente.

**Reglas**

- No modificar todavía los saldos.
- No repartir cantidades.
- No borrar movimientos históricos.
- No reinterpretar automáticamente movimientos antiguos.
- Mantener separación por empresa.
- Considerar sucursal únicamente según PO-001.
- La clasificación debe ser reproducible y auditable.

**Tablas/Componentes relevantes**

- ProductosServicios
- ProductosServiciosVariantes
- ProductosServiciosExistencias
- ProductosServiciosMovimientosInventario

**Usuarios/Responsables**

Administración
responsables de inventario

**Dependencias**

COM-010
COM-011

**Criterios de aceptación**

- cada producto relevante queda clasificado;
- productos ambiguos quedan identificados;
- saldos no son modificados por la auditoría;
- 0 reparticiones automáticas;
- movimientos históricos permanecen intactos;
- se obtiene la lista de casos que requieren conciliación.

======================================================================

**Decisión relacionada**

PO-001

#### COM-017 — CONCILIACIÓN DE SALDOS POR VARIANTE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Resolver de forma controlada los productos cuyo saldo histórico no puede
asignarse automáticamente a sus variantes.

**Funcionalidad**

Permitir que un responsable determine la distribución real del saldo
existente entre variantes.

Ejemplo:

Saldo histórico:

Aceite Motor Sintético = 13

Variantes:

946 ml
5 L

El sistema NO conoce automáticamente cuánto pertenece a cada una.

El proceso de conciliación debe permitir registrar, por ejemplo:

946 ml = 10
5 L = 3

únicamente porque un responsable confirmó que ésa es la existencia real.

**Reglas**

- No proponer repartición matemática automática.
- No repartir equitativamente.
- No usar precio, costo o tamaño para inferir cantidades.
- La suma conciliada debe corresponder al saldo válido de corte, salvo
  que exista un ajuste documentado.
- Si existe diferencia física, debe resolverse mediante mecanismo
  trazable.
- Registrar responsable.
- Registrar fecha.
- Registrar motivo/observación cuando corresponda.
- Registrar autorización si COM-007 así lo exige.
- La conciliación debe respetar empresa y sucursal cuando aplique.
- Una variante no puede recibir saldo perteneciente a otro producto.

**Tablas/Componentes relevantes**

- ProductosServiciosExistencias
- ProductosServiciosVariantes
- ProductosServiciosMovimientosInventario
- mecanismo conceptual de conciliación

No definir nombre físico nuevo de tabla si todavía no existe diseño
aprobado.

**Usuarios/Responsables**

Administración
responsable de inventario

Supervisor/Super Usuario si la autorización correspondiente lo requiere.

**Dependencias**

COM-016

**Criterios de aceptación**

CASO A:

Saldo histórico = 13

Captura conciliación:

946 ml = 10
5 L = 3

Resultado:

total conciliado = 13.

CASO B:

Saldo histórico = 13

Captura:

946 ml = 10
5 L = 5

Resultado:

NO permitir confirmar sin resolver la diferencia.

CASO C:

Usuario intenta distribuir automáticamente.

Resultado:

NO existe reparto automático.

Toda conciliación confirmada debe ser rastreable.

======================================================================

#### COM-018 — CORTE OPERATIVO A INVENTARIO POR VARIANTE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Definir el momento en que el nuevo modelo se convierte en la única fuente
operativa de inventario.

**Funcionalidad**

Establecer un proceso de corte que contemple:

- validación previa;
- clasificación histórica;
- conciliaciones necesarias;
- verificación de saldos;
- validación de variantes;
- momento de activación;
- evidencia de corte;
- contingencia si la transición falla.

**Reglas**

ANTES DEL CORTE:

la historia previa permanece válida.

DESPUÉS DEL CORTE:

Producto simple
→ opera con variante NULL.

Producto con variantes
→ opera por variante.

NO mantener simultáneamente:

saldo consolidado operativo
+
saldo por variante operativo

para el mismo producto.

El saldo consolidado histórico puede conservarse como información
histórica, pero NO como segunda fuente de verdad.

No habilitar para operación un producto con saldo ambiguo pendiente de
conciliación.

Los movimientos anteriores al corte:

NO se reescriben.

Los movimientos posteriores:

deben respetar la nueva dimensión.

**Tablas/Componentes relevantes**

- ProductosServiciosExistencias
- ProductosServiciosMovimientosInventario
- ProductosServiciosVariantes
- resultados de conciliación

**Usuarios/Responsables**

Administración
responsable de inventario
Product Owner para aceptación del corte

**Dependencias**

COM-016
COM-017

**Criterios de aceptación**

- todos los productos operativos clasificados;
- casos ambiguos conciliados;
- fuente de verdad única;
- fecha/momento de corte identificado;
- movimientos históricos preservados;
- productos simples continúan funcionando;
- productos con variantes operan por variante;
- no existe doble fuente de saldo;
- Sprint 2 puede usar el nuevo inventario.

REGLAS DE MIGRACIÓN/CONCILIACIÓN DE SPRINT 1

V6 debe dejar explícito:

1. La migración NO se ejecuta por existir el backlog.

2. COM-016 clasifica.

3. COM-017 concilia.

4. COM-018 realiza/certifica el corte cuando corresponda durante la
   implementación futura.

5. Producto sin variantes no necesita inventarse una variante.

6. Producto con una variante no se migra ciegamente sin validación.

7. Producto con múltiples variantes nunca reparte saldo automáticamente.

8. Historia anterior no se reescribe para simular que siempre existieron
   variantes.

9. La trazabilidad de conciliación tiene valor operativo y documental.

10. El corte debe ocurrir antes de que Recepción empiece a alimentar stock
	por variante.

#### COM-019 — CONSULTA DE EXISTENCIAS POR PRODUCTO Y VARIANTE

**Prioridad:** P1

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Permitir consultar claramente la fuente operativa de inventario que
consumirán los módulos comerciales posteriores.

**Funcionalidad**

La consulta debe poder mostrar:

- producto;
- variante;
- existencia física;
- existencia mínima;
- existencia comprometida cuando esté implementada;
- existencia disponible;
- sucursal si PO-001 la incorpora.

PRODUCTO SIMPLE:

mostrar una operación sencilla sin obligar al usuario a seleccionar una
variante inexistente.

PRODUCTO CON VARIANTES:

mostrar el desglose por variante.

Ejemplo:

Aceite Motor Sintético

946 ml
Física: 10
Mínima: 5
Comprometida: 2
Disponible: 8

5 L
Física: 3
Mínima: 2
Comprometida: 0
Disponible: 3

**Reglas**

- No ocultar la fuente operativa por variante detrás de un total general.
- Puede existir un total consolidado únicamente como información
  secundaria.
- Disponible debe respetar la regla definida en COM-013.
- Antes de implementar Comprometida, ésta puede ser 0.
- Producto simple conserva variante NULL.
- Respetar sucursal únicamente si PO-001 la incorpora.
- La consulta NO modifica saldos.

**Tablas/Componentes relevantes**

- ProductosServicios
- ProductosServiciosVariantes
- ProductosServiciosExistencias

**Usuarios/Responsables**

- Administración
- usuarios de Inventario
- futuros usuarios comerciales que consulten disponibilidad

**Dependencias**

COM-013
COM-014
COM-018

**Criterios de aceptación**

- producto simple consultable;
- producto con variantes consultable;
- saldos independientes;
- mínimo visible;
- física visible;
- comprometida preparada;
- disponible visible;
- variante claramente identificada;
- consulta no modifica inventario.

======================================================================

**Decisión relacionada**

PO-001

#### COM-020 — KARDEX POR PRODUCTO Y VARIANTE

**Prioridad:** P1

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Consultar la historia del inventario y rastrear cada movimiento hasta su
origen.

**Funcionalidad**

El Kardex debe mostrar cuando corresponda:

- fecha;
- tipo de movimiento;
- entrada;
- salida;
- producto;
- variante;
- documento origen;
- referencia del documento;
- usuario;
- saldo;
- sucursal si PO-001 la incorpora.

Filtros mínimos:

- producto;
- variante;
- rango de fechas;
- tipo de movimiento;
- documento origen.

Debe permitir distinguir movimientos futuros provenientes de:

- Recepción;
- Ajuste;
- Surtimiento/Venta;
- Devolución.

**Reglas**

- Kardex es consulta.
- No modifica saldos.
- Historia previa sin variante sigue visible.
- No asignar artificialmente variantes a movimientos históricos.
- Movimientos posteriores al corte deben identificar variante cuando
  corresponda.
- Documento origen debe ser rastreable.
- Producto simple debe continuar funcionando.
- No mezclar movimientos de variantes diferentes.

**Tablas/Componentes relevantes**

- ProductosServiciosMovimientosInventario
- ProductosServiciosExistencias
- ProductosServiciosVariantes

**Usuarios/Responsables**

- Administración
- usuarios de Inventario
- Supervisor según permisos
- usuarios de Reportes cuando posteriormente corresponda

**Dependencias**

COM-011
COM-012
COM-018

**Criterios de aceptación**

- movimiento rastreable;
- variante visible;
- documento origen identificable;
- historia previa visible;
- filtros funcionales;
- producto simple compatible;
- variantes independientes;
- movimientos posteriores al corte coherentes con existencia.

======================================================================

**Decisión relacionada**

PO-001

#### COM-021 — CERTIFICACIÓN DE INVENTARIO POR VARIANTE

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Certificar Sprint 1 antes de permitir que Recepción empiece a generar
existencia.

**Funcionalidad**

Ejecutar QA funcional del modelo completo:

- dimensión de inventario;
- producto simple;
- producto con variantes;
- existencia física;
- existencia mínima;
- movimiento;
- idempotencia;
- ajustes;
- históricos;
- conciliación;
- corte operativo;
- consulta;
- Kardex.

**Reglas**

No certificar únicamente por:

- build;
- compilación;
- revisión de código.

La certificación debe comprobar comportamiento funcional.

Los datos QA deben estar controlados y ser identificables.

No modificar históricos reales arbitrariamente para completar una prueba.

**Usuarios/Responsables**

- Product Owner
- Administración
- responsable de inventario
- perfiles necesarios para autorización según S0

**Dependencias**

COM-009
COM-010
COM-011
COM-012
COM-013
COM-014
COM-015
COM-016
COM-017
COM-018
COM-019
COM-020

**Criterios de aceptación**

- PO-001 resuelta;
- producto simple funciona;
- variante NULL funciona;
- producto con variantes tiene saldos independientes;
- movimiento afecta variante exacta;
- movimiento es idempotente;
- ajuste positivo funciona;
- ajuste negativo funciona;
- otra variante permanece intacta;
- históricos permanecen disponibles;
- conciliación no reparte automáticamente;
- corte operativo certificado;
- consulta coincide con saldo;
- Kardex coincide con movimientos;
- 0 duplicación de saldo por reintento;
- 0 pérdida de trazabilidad;
- Sprint 2 puede consumir esta fuente de verdad.

**Decisión relacionada**

PO-001

### S2 — OC + Recepción

**Qué entrega:** 19 tickets, de COM-022 a COM-040.

#### COM-022 — EVOLUCIONAR PARTIDA DE OC PARA SOPORTAR VARIANTE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir que una partida de OC identifique exactamente el producto o
variante que se está comprando.

**Funcionalidad**

La partida debe poder representar:

PRODUCTO SIMPLE

Producto
+
Variante NULL

PRODUCTO CON VARIANTES

Producto
+
Variante específica

Debe conservar compatibilidad con las OC históricas existentes.

**Reglas**

- No reconstruir OrdenesCompraDetalle.
- Evolucionar la estructura existente.
- idProductoServicio continúa siendo obligatorio.
- Producto simple utiliza variante NULL.
- Si un producto tiene variantes activas y la compra requiere una unidad
  concreta, debe seleccionarse variante.
- La variante debe pertenecer al producto seleccionado.
- La variante debe pertenecer a la misma empresa.
- No permitir utilizar variante de otro producto.
- OC histórica sin variante sigue siendo válida.
- No modificar documentos históricos sólo para llenar la nueva relación.

**Tablas/Componentes relevantes**

- OrdenesCompraDetalle
- ProductosServicios
- ProductosServiciosVariantes

**Usuarios/Responsables**

Administración
usuarios con permiso de compras definido en Sprint 0

**Dependencias**

COM-003
COM-010
COM-018
COM-021

**Criterios de aceptación**

CASO A:

Producto sin variantes.

Partida:
Producto A
Variante NULL
Cantidad 5

Válido.

CASO B:

Aceite Motor Sintético

Variantes:
946 ml
5 L

Partida:
Aceite Motor Sintético / 946 ml
Cantidad 10

Válido.

CASO C:

Producto A
+
variante perteneciente a Producto B

Resultado:

NO permitido.

CASO D:

OC histórica sin variante

Resultado:

continúa consultable.

======================================================================

#### COM-023 — SELECTOR PRODUCTO + VARIANTE EN NUEVA OC

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir capturar correctamente una partida de compra desde la UI actual
de Nueva OC.

**Funcionalidad**

Comportamiento esperado:

PRODUCTO SIN VARIANTES:

1. seleccionar producto;
2. capturar cantidad;
3. capturar costo.

PRODUCTO CON VARIANTES:

1. seleccionar producto;
2. seleccionar variante;
3. capturar cantidad;
4. capturar costo.

La descripción visible debe permitir identificar claramente la compra.

Ejemplo:

Aceite Motor Sintético — 946 ml

Aceite Motor Sintético — 5 L

**Reglas**

- No obligar a seleccionar variante para producto simple.
- Producto con variantes debe mostrar sus variantes activas.
- No mostrar variantes de otro producto.
- No permitir guardar una partida incompleta.
- La selección debe conservarse al editar la OC.
- El usuario no debe depender únicamente del SKU para entender la partida.
- Mantener el flujo visual actual de OC cuando sea posible.

**Tablas/Componentes relevantes**

- pantalla Nueva OC
- JS actual de OC
- API actual de OC
- ProductosServicios
- ProductosServiciosVariantes

**Usuarios/Responsables**

Administración
comprador autorizado

**Dependencias**

COM-022

**Criterios de aceptación**

- producto simple funciona;
- producto con variantes funciona;
- selector carga variantes correctas;
- variante seleccionada persiste;
- edición conserva variante;
- no se puede guardar combinación inválida.

======================================================================

#### COM-024 — SNAPSHOT DOCUMENTAL DE PRODUCTO Y VARIANTE EN OC

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Evitar que cambios futuros en ProductosServicios reescriban la historia
de una OC ya generada.

**Funcionalidad**

Evaluar y conservar como snapshot documental cuando corresponda:

- código del producto;
- nombre del producto;
- descripción relevante;
- unidad;
- variante;
- SKU de variante;
- clave/combinación de variante;
- costo pactado.

**Reglas**

- Las relaciones operativas utilizan IDs internos.
- Código/SKU son información documental visible.
- Snapshot NO sustituye PK.
- No duplicar datos sin valor histórico.
- Una OC generada debe conservar cómo se identificó la partida al momento
  de generarse.
- Editar posteriormente el nombre de una variante no debe reescribir una
  OC histórica generada.

**Tablas/Componentes relevantes**

- OrdenesCompraDetalle
- ProductosServicios
- ProductosServiciosVariantes

**Usuarios/Responsables**

Administración
usuarios de consulta/reportes de compras

**Dependencias**

COM-022
COM-023

**Criterios de aceptación**

1. Crear/generar OC con:

Aceite Motor Sintético / 946 ml.

2. Posteriormente cambiar el nombre visible de la variante en catálogo.

3. Consultar la OC histórica.

Resultado:

la identidad documental original permanece comprensible y trazable.

======================================================================

#### COM-025 — PERMITIR VARIAS VARIANTES DEL MISMO PRODUCTO EN UNA OC

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir comprar varias variantes del mismo producto dentro de la misma
Orden de Compra.

**Funcionalidad**

Una OC debe poder contener:

Aceite Motor Sintético / 946 ml
Cantidad 10

y también:

Aceite Motor Sintético / 5 L
Cantidad 3

como partidas independientes.

**Reglas**

- No considerar ambas partidas como duplicado únicamente porque comparten
  idProductoServicio.
- La identidad de la partida debe considerar variante.
- Producto simple continúa evitando duplicados equivalentes según la regla
  actual.
- No crear dos partidas idénticas activas para la misma combinación
  producto + variante cuando la regla funcional pueda consolidarlas.
- Mantener cantidades y costos independientes.

**Tablas/Componentes relevantes**

- OrdenesCompraDetalle
- lógica de partidas de OC
- validaciones de duplicidad

**Dependencias**

COM-022
COM-023

**Criterios de aceptación**

OC:

Producto A / Variante 1 = 10
Producto A / Variante 2 = 3

Resultado:

ambas partidas válidas.

Intentar agregar nuevamente:

Producto A / Variante 1

debe respetar la regla definida de consolidación/duplicidad sin afectar
Variante 2.

======================================================================

#### COM-026 — ACTUALIZAR DETALLE, PDF Y EXCEL DE OC PARA VARIANTES

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Mantener la identidad de variante en todas las salidas documentales de OC.

**Funcionalidad**

Actualizar funcionalmente:

- detalle de OC;
- consulta/reporte;
- PDF;
- Excel.

Mostrar cuando aplique:

- producto;
- variante;
- SKU;
- unidad;
- cantidad;
- costo;
- subtotal.

Producto simple:

no debe mostrar información artificial de variante.

**Reglas**

- PDF y Excel deben representar la misma partida.
- No perder variante al exportar.
- Documentos históricos sin variante continúan funcionando.
- Mantener diseño actual aprovechable.
- No reconstruir el generador documental si puede evolucionarse.

**Dependencias**

COM-024
COM-025

**Criterios de aceptación**

OC con:

946 ml
5 L

Detalle:
muestra ambas.

PDF:
muestra ambas.

Excel:
muestra ambas.

OC histórica sin variantes:
continúa exportando correctamente.

======================================================================

#### COM-027 — REGLAS DE ESTADO DE OC FRENTE A RECEPCIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Preparar la OC existente para relacionarse con Recepción sin confundir
estado documental con existencia física.

**Funcionalidad**

Definir cómo debe interpretarse una OC respecto a recepción:

- sin recepción;
- parcialmente recibida;
- totalmente recibida.

Estas condiciones pueden ser:

estados derivados,
indicadores,
o una evolución controlada del modelo,

pero NO deben inventarse como estados persistidos hasta revisar la
arquitectura existente.

**Reglas**

- Borrador NO puede recibirse.
- OC Cancelada NO puede recibir nuevas cantidades.
- OC Generada es candidata a recepción.
- Recepción parcial deja cantidad pendiente.
- Recepción total deja pendiente 0.
- La condición de recepción debe derivarse de recepciones reales.
- No modificar inventario desde la OC.
- No marcar "recibida" únicamente porque la OC fue generada.
- Cancelar una OC con recepciones previas requiere regla explícita y no
  puede borrar la historia de recepción.

**Tablas/Componentes relevantes**

- OrdenesCompra
- OrdenesCompraDetalle
- futura Recepción
- futura RecepciónDetalle

**Usuarios/Responsables**

Administración
comprador
receptor
Supervisor cuando aplique

**Dependencias**

COM-022
COM-024
COM-025

**Criterios de aceptación**

CASO A:

OC Borrador

Resultado:
no disponible para recepción.

CASO B:

OC Generada
Ordenado = 10
Recibido = 0

Resultado:
Pendiente = 10.

CASO C:

Ordenado = 10
Recibido acumulado = 4

Resultado:
Parcialmente recibida.
Pendiente = 6.

CASO D:

Ordenado = 10
Recibido acumulado = 10

Resultado:
Totalmente recibida.
Pendiente = 0.

CASO E:

OC Cancelada sin recepción

Resultado:
no puede recibirse.

CASO F:

OC con recepción histórica

Resultado:
no se permite una acción destructiva que elimine trazabilidad.

#### COM-028 — MODELO FUNCIONAL DE RECEPCIÓN DE OC

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Crear Recepción como documento propio entre la Orden de Compra y el
Inventario.

**Funcionalidad**

Una Recepción debe poder relacionarse con:

- empresa;
- Orden de Compra;
- proveedor;
- sucursal;
- fecha de recepción;
- usuario que captura;
- usuario receptor/responsable;
- estado;
- observaciones;
- partidas recibidas.

La Recepción debe tener:

CABECERA
+
DETALLE.

Cada detalle debe conservar relación con:

- partida de OC;
- producto;
- variante nullable;
- cantidad ordenada;
- cantidad recibida;
- costo recibido;
- observaciones.

**Reglas**

- Recepción NO sustituye a OC.
- Una OC puede tener múltiples Recepciones.
- Recepción debe partir de una OC válida.
- Producto/variante deben provenir de la partida de OC.
- No permitir agregar productos ajenos a la OC dentro de una recepción
  normal.
- Producto simple utiliza variante NULL.
- Producto con variantes conserva variante exacta.
- Captura de Recepción NO afecta inventario todavía.
- Confirmación será la operación que produzca el efecto físico.
- Mantener multitenant.
- Mantener sucursal según la dimensión aprobada.

**Tablas/Componentes relevantes**

Entidades conceptuales nuevas:

- Recepción OC
- Recepción Detalle

Relacionadas con:

- OrdenesCompra
- OrdenesCompraDetalle
- ProductosServicios
- ProductosServiciosVariantes
- ActivosProveedores
- Sucursales

NO definir nombres SQL físicos definitivos dentro del backlog si todavía
no existe diseño aprobado.

**Usuarios/Responsables**

- Administración
- receptor autorizado
- Supervisor cuando aplique

**Dependencias**

COM-004
COM-006
COM-021
COM-027

**Criterios de aceptación**

- Recepción tiene cabecera;
- Recepción tiene detalle;
- se relaciona con una OC;
- se relaciona con sus partidas;
- conserva producto;
- conserva variante;
- conserva proveedor;
- conserva sucursal;
- identifica capturista/receptor;
- una OC puede tener más de una Recepción;
- guardar captura NO modifica inventario.

======================================================================

#### COM-029 — CREAR RECEPCIÓN DESDE UNA OC GENERADA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir iniciar una Recepción a partir de una Orden de Compra existente.

**Funcionalidad**

Desde una OC Generada, el usuario debe poder iniciar:

RECIBIR MERCANCÍA

La pantalla debe mostrar como mínimo:

- folio OC;
- proveedor;
- sucursal;
- fecha OC;
- producto;
- variante;
- cantidad ordenada;
- cantidad recibida acumulada;
- cantidad pendiente;
- costo de OC;
- cantidad a recibir ahora;
- costo recibido;
- observaciones.

**Reglas**

- Sólo OC válida puede recibirse.
- Borrador NO puede recibirse.
- Cancelada NO puede iniciar nueva Recepción.
- Partidas sin pendiente no deben permitir nueva cantidad.
- No modificar la cantidad ordenada desde Recepción.
- No cambiar producto/variante desde Recepción.
- La Recepción hereda la identidad de la partida.
- El usuario captura únicamente lo que realmente está recibiendo.

**Tablas/Componentes relevantes**

- OrdenesCompra
- OrdenesCompraDetalle
- Recepción
- RecepciónDetalle

**Usuarios/Responsables**

- receptor autorizado;
- Administración;
- Supervisor según permisos.

**Dependencias**

COM-027
COM-028

**Criterios de aceptación**

OC Generada:

Ordenado = 10
Recibido = 0
Pendiente = 10

Abrir Recepción:

muestra correctamente 10 pendientes.

OC Borrador:

no permite iniciar Recepción.

OC Cancelada:

no permite iniciar Recepción nueva.

======================================================================

#### COM-030 — RECEPCIÓN TOTAL

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir recibir completamente una partida pendiente.

**Funcionalidad**

El usuario puede indicar que recibe toda la cantidad pendiente.

Ejemplo:

Ordenado = 10
Recibido previo = 0
Pendiente = 10

Recibir ahora = 10

Resultado documental:

Recibido acumulado = 10
Pendiente = 0

**Reglas**

- No recibir más que lo pendiente.
- La cantidad debe ser válida y positiva.
- Producto/variante permanecen iguales a la partida.
- Costo recibido debe quedar documentado.
- Guardar en Captura NO aumenta inventario.
- Confirmar será tratado en el bloque de integración.
- Una partida con pendiente 0 queda cerrada para nuevas cantidades.

**Dependencias**

COM-029

**Criterios de aceptación**

- recibir todo pendiente es posible;
- pendiente llega a 0;
- variante correcta permanece;
- costo recibido queda documentado;
- no permite excedente;
- no modifica inventario mientras permanezca en Captura.

======================================================================

#### COM-031 — RECEPCIÓN PARCIAL

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir recibir una cantidad menor a la ordenada y conservar el pendiente.

**Funcionalidad**

Ejemplo obligatorio:

OC:

Aceite / 946 ml
Cantidad ordenada = 10

Primera Recepción:

Cantidad recibida = 4

Resultado:

Ordenada = 10
Recibida acumulada = 4
Pendiente = 6

La partida debe seguir abierta para futuras Recepciones.

**Reglas**

- Cantidad recibida \> 0.
- Cantidad recibida \<= pendiente.
- No alterar cantidad ordenada.
- No cerrar la partida si queda pendiente.
- Producto y variante permanecen inmutables.
- Debe conservarse quién recibió y cuándo.
- Recepción parcial no debe confundirse con cancelación del pendiente.

**Dependencias**

COM-029
COM-030

**Criterios de aceptación**

Ordenado = 10

Recibir = 4

Resultado:

Acumulado = 4
Pendiente = 6

No debe mostrar:

Pendiente = 0.

La OC debe permitir una Recepción posterior por las 6 restantes.

======================================================================

#### COM-032 — MÚLTIPLES RECEPCIONES Y ACUMULADO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir completar una OC mediante varias Recepciones independientes.

**Funcionalidad**

Continuar el caso anterior:

OC = 10

Recepción 1 = 4

Pendiente = 6

Recepción 2 = 3

Acumulado = 7
Pendiente = 3

Recepción 3 = 3

Acumulado = 10
Pendiente = 0

Cada Recepción debe conservarse como documento independiente.

**Reglas**

La fuente de verdad del acumulado debe provenir de Recepciones válidas.

No confiar únicamente en un snapshot editable.

Regla conceptual:

Recibido acumulado =
SUM(cantidades de Recepciones confirmadas vigentes)

Pendiente =
Cantidad ordenada - Recibido acumulado

Una Recepción en Captura:

NO debe contarse todavía como recibida físicamente.

Una Recepción cancelada/revertida:

debe respetar la estrategia definida posteriormente.

No permitir acumulado mayor a ordenado salvo una futura regla explícita
de sobre-recepción aprobada por PO.

**Tablas/Componentes relevantes**

- OrdenesCompraDetalle
- Recepción
- RecepciónDetalle

**Dependencias**

COM-031

**Criterios de aceptación**

Secuencia:

10
→ 4
→ 3
→ 3

produce:

4
→ 7
→ 10 acumulado.

Pendiente:

6
→ 3
→ 0.

Las tres Recepciones permanecen consultables.

No se sobrescribe la primera con la segunda.

======================================================================

#### COM-033 — RECEPCIÓN POR VARIANTE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Garantizar que las Recepciones respeten la variante exacta comprada.

**Funcionalidad**

Una OC puede contener:

Aceite / 946 ml
Ordenado = 10

Aceite / 5 L
Ordenado = 3

La Recepción debe manejar pendientes independientes.

Ejemplo:

Recibir:

946 ml = 4
5 L = 1

Resultado:

946 ml:
Recibido = 4
Pendiente = 6

5 L:
Recibido = 1
Pendiente = 2

**Reglas**

- No recibir una variante diferente a la ordenada.
- No mover cantidad de una variante a otra.
- No consolidar pendientes por producto padre.
- Producto simple sigue funcionando con variante NULL.
- La variante debe conservarse en el detalle de Recepción.
- El movimiento de inventario posterior debe utilizar esa misma variante.
- El costo recibido puede diferir entre variantes si las partidas así lo
  permiten.
- Una variante eliminada/inactivada posteriormente no debe destruir la
  historia de una OC/Recepción previa.

**Tablas/Componentes relevantes**

- OrdenesCompraDetalle
- RecepciónDetalle
- ProductosServiciosVariantes

**Usuarios/Responsables**

- receptor;
- Administración.

**Dependencias**

COM-022
COM-028
COM-032

**Criterios de aceptación**

OC:

946 ml = 10
5 L = 3

Recepción:

946 ml = 4
5 L = 1

Resultado:

pendientes independientes.

Intentar recibir:

946 ml utilizando idVariante de 5 L

Resultado:

NO permitido.

Producto simple:

continúa recibiéndose correctamente.

#### COM-034 — COSTO RECIBIDO Y TRAZABILIDAD DE COSTO

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Distinguir el costo esperado/pactado en OC del costo realmente recibido.

**Funcionalidad**

Cada partida de Recepción debe poder conservar:

- costo de OC;
- costo recibido;
- producto;
- variante;
- cantidad recibida.

El usuario debe poder identificar diferencias entre:

Costo OC
vs
Costo recibido.

**Reglas**

- No sobrescribir el costo histórico de la OC.
- Costo recibido pertenece a la Recepción.
- Producto con variantes conserva costo de la variante recibida.
- No cambiar automáticamente el costo base del catálogo por capturar una
  Recepción.
- Cualquier actualización futura de costo promedio o costo catálogo debe
  definirse mediante una regla específica.
- El costo utilizado por el movimiento debe corresponder a la Recepción
  confirmada cuando el modelo de inventario lo requiera.

**Tablas/Componentes relevantes**

- OrdenesCompraDetalle
- RecepciónDetalle
- ProductosServicios
- ProductosServiciosVariantes
- ProductosServiciosMovimientosInventario

**Usuarios/Responsables**

- receptor autorizado;
- Administración;
- usuarios de compras.

**Dependencias**

COM-028
COM-033

**Criterios de aceptación**

OC:

Costo = 100

Recepción:

Costo recibido = 105

Resultado:

OC conserva 100.

Recepción conserva 105.

La diferencia puede rastrearse.

La captura NO modifica silenciosamente el costo base del producto.

======================================================================

#### COM-035 — CONFIRMAR RECEPCIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Convertir una Recepción en Captura en una entrada física confirmada.

**Funcionalidad**

La acción Confirmar debe:

1. validar que la Recepción siga siendo válida;
2. validar cantidades pendientes;
3. validar producto/variante;
4. validar empresa;
5. validar sucursal cuando aplique;
6. cerrar la captura contra modificaciones incompatibles;
7. preparar/generar el movimiento de inventario;
8. actualizar la existencia;
9. conservar trazabilidad.

**Reglas**

Recepción en Captura:

NO afecta existencia.

Recepción Confirmada:

SÍ afecta existencia.

No permitir confirmar:

- cantidad \<= 0;
- cantidad mayor al pendiente;
- variante ajena al producto;
- OC cancelada cuando la regla lo prohíba;
- Recepción ya confirmada como si fuera nueva.

La confirmación debe ser transaccional desde la perspectiva funcional:

o se completa el efecto completo
o no debe quedar un estado parcial incoherente.

**Usuarios/Responsables**

- receptor autorizado;
- Administración;
- autorizador si Sprint 0 determina que aplica.

**Dependencias**

COM-029
COM-030
COM-031
COM-032
COM-033
COM-034

**Criterios de aceptación**

Antes de confirmar:

Existencia = 10

Recepción en Captura = +4

Existencia sigue = 10.

Confirmar:

Existencia = 14.

Recepción cambia a condición confirmada.

Reabrir:

la Recepción permanece confirmada y trazable.

======================================================================

#### COM-036 — GENERAR MOVIMIENTO DE ENTRADA POR RECEPCIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Registrar formalmente el efecto de una Recepción confirmada sobre el
inventario.

**Funcionalidad**

Cada detalle confirmado debe generar el movimiento de entrada
correspondiente.

El movimiento debe conservar:

- empresa;
- sucursal si aplica;
- producto;
- variante;
- cantidad;
- costo recibido cuando corresponda;
- tipo de movimiento;
- documento origen = Recepción;
- detalle origen;
- usuario;
- fecha.

**Reglas**

- Una partida recibida produce su movimiento correspondiente.
- Producto simple utiliza variante NULL.
- Producto con variantes utiliza variante exacta.
- No generar movimiento desde OC.
- No generar movimiento mientras Recepción esté en Captura.
- Movimiento debe respetar COM-012.
- El documento origen debe poder rastrearse desde Kardex.

**Tablas/Componentes relevantes**

- Recepción
- RecepciónDetalle
- ProductosServiciosMovimientosInventario

**Dependencias**

COM-012
COM-035

**Criterios de aceptación**

Recepción confirmada:

946 ml +4

Kardex:

Entrada +4
Variante = 946 ml
Origen = Recepción correspondiente.

5 L:

NO cambia.

======================================================================

#### COM-037 — ACTUALIZAR EXISTENCIA POR RECEPCIÓN

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Actualizar la fuente de verdad de existencia con la cantidad físicamente
recibida.

**Funcionalidad**

Después de una confirmación válida:

Existencia física nueva =
Existencia física anterior + Cantidad recibida.

Debe utilizar la dimensión definida en Sprint 1.

**Reglas**

Producto simple:

actualiza producto + variante NULL.

Producto con variantes:

actualiza exclusivamente variante recibida.

Sucursal:

respetar PO-001.

No modificar:

Existencia comprometida

por recibir mercancía.

Disponible se recalcula según:

Física - Comprometida.

**Dependencias**

COM-010
COM-013
COM-035
COM-036

**Criterios de aceptación**

Inicial:

946 ml = 10
5 L = 3

Recepción confirmada:

946 ml +4

Resultado:

946 ml = 14
5 L = 3

Comprometida:

sin cambio.

Kardex y existencia coinciden.

======================================================================

**Decisión relacionada**

PO-001

#### COM-038 — IDEMPOTENCIA DE CONFIRMACIÓN DE RECEPCIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Garantizar que una Recepción nunca incremente stock dos veces por el mismo
detalle.

**Funcionalidad**

La relación:

RecepciónDetalle
→ MovimientoInventario

debe permitir reconocer que el efecto ya fue aplicado.

**Reglas**

Confirmar una vez:

+4.

Volver a presionar Confirmar:

NO +4 adicional.

F5:

NO duplica.

Reintento HTTP:

NO duplica.

Doble clic:

NO duplica.

Si la operación falla antes de completar el efecto:

no debe quedar una Recepción confirmada sin su movimiento/saldo coherente.

**Dependencias**

COM-012
COM-035
COM-036
COM-037

**Criterios de aceptación**

Saldo inicial:

10.

Confirmar Recepción +4:

14.

Reintentar exactamente la misma confirmación:

14.

Kardex:

un único movimiento válido de +4.

======================================================================

#### COM-039 — CANCELACIÓN / REVERSIÓN DE RECEPCIÓN CONFIRMADA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Corregir una Recepción ya confirmada sin borrar su historia ni manipular
directamente el saldo.

**Funcionalidad**

Definir una operación controlada de reversión.

Una Recepción confirmada que ya generó:

+4

NO debe simplemente eliminarse.

La corrección debe conservar:

- Recepción original;
- usuario que revierte;
- motivo;
- fecha;
- movimiento original;
- movimiento inverso cuando corresponda;
- nueva existencia.

**Reglas**

- Nunca borrar el movimiento original para fingir que no ocurrió.
- Reversión debe ser trazable.
- Reversión debe ser idempotente.
- No revertir dos veces el mismo efecto.
- La cantidad pendiente de OC debe recalcularse considerando la reversión.
- Si inventario posterior ya consumió la mercancía, la regla puede requerir
  autorización/bloqueo.

Este último caso debe marcarse como regla de negocio sensible y no
resolverse mediante borrado.

**Usuarios/Responsables**

Administración.

Supervisor/Super Usuario según permisos definidos en Sprint 0.

**Dependencias**

COM-007
COM-036
COM-037
COM-038

**Criterios de aceptación**

Saldo inicial:

10.

Recepción confirmada:

+4

Saldo:

14.

Reversión autorizada:

movimiento inverso -4.

Saldo:

10.

Recepción original:

permanece en historial.

Motivo y usuario:

visibles.

Segundo intento de reversión:

NO vuelve a restar 4.

======================================================================

#### COM-040 — HISTORIAL, REPORTE Y CERTIFICACIÓN E2E DE RECEPCIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Cerrar Sprint 2 demostrando el flujo completo desde OC hasta existencia.

**Funcionalidad**

Permitir consultar:

- OC;
- Recepciones asociadas;
- fecha;
- receptor;
- producto;
- variante;
- cantidad ordenada;
- recibida;
- acumulada;
- pendiente;
- costo OC;
- costo recibido;
- estado de Recepción;
- movimiento asociado.

Incluir filtros útiles cuando corresponda:

- folio OC;
- proveedor;
- fecha;
- producto;
- variante;
- estado;
- sucursal.

**Dependencias**

COM-022 a COM-039

**Criterios de aceptación**

- OC puede rastrear sus Recepciones;
- Recepción puede rastrear OC;
- Recepción puede rastrear movimiento;
- movimiento puede rastrear Recepción;
- pendiente coincide con Recepciones válidas;
- producto simple funciona;
- producto con variantes funciona;
- recepción parcial funciona;
- múltiples Recepciones funcionan;
- reversión conserva historia;
- idempotencia certificada;
- existencia coincide con Kardex.

### S3 — Cotizaciones 2.0

**Qué entrega:** 14 tickets, de COM-041 a COM-054.

#### COM-041 — AUDITORÍA PUNTUAL DE COTIZACIONES EXISTENTES

**Prioridad:** P1

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Determinar qué parte de la implementación existente de Cotizaciones puede
reutilizarse sin adoptar componentes NEXT no autorizados.

**Funcionalidad**

Auditar la cadena real de Cotizaciones:

Pantalla
→ MVC
→ JS
→ API
→ SQL
→ PDF
→ correo/comunicación cuando exista.

Determinar:

- pantallas actuales;
- controladores;
- endpoints;
- tablas;
- relaciones;
- dependencias NEXT;
- dependencias Legacy;
- ProductosServicios consumidos;
- Clientes consumidos;
- usuarios/responsables;
- PDF;
- comunicación;
- estados;
- reglas actuales;
- datos históricos.

Clasificar la implementación como:

A. Aprovechable.

B. Aprovechable con evolución.

C. Requiere migración.

D. Construcción nueva.

E. Fuera del alcance autorizado.

**Reglas**

- NEXT NO se adopta automáticamente.
- Legacy es referencia funcional.
- No modificar código durante este ticket.
- No ejecutar migraciones.
- No eliminar históricos.
- No asumir que una pantalla existente equivale a un proceso completo.
- La conclusión debe estar sustentada por la cadena real de consumo.

**Tablas/Componentes relevantes**

Únicamente los realmente encontrados durante auditoría.

**Usuarios/Responsables**

- Product Owner
- Administración
- Agente/Vendedor como perfiles consumidores futuros

**Dependencias**

COM-008
COM-021
COM-040

**Criterios de aceptación**

- arquitectura actual identificada;
- tablas identificadas;
- dependencia NEXT = explícita;
- dependencia Legacy = explícita;
- históricos identificados;
- capacidades reutilizables identificadas;
- gaps identificados;
- clasificación A/B/C/D/E emitida;
- recomendación concreta para los tickets posteriores;
- 0 implementación realizada.

======================================================================

#### COM-042 — DEFINIR BASE DE COTIZACIÓN 2.0

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Establecer la entidad/documento comercial Cotización que utilizará el
resto del flujo.

**Funcionalidad**

La Cotización debe poder representar como mínimo:

CABECERA:

- empresa;
- sucursal cuando corresponda;
- cliente;
- fecha;
- vigencia cuando corresponda;
- agente/vendedor responsable;
- usuario captura;
- estado;
- observaciones;
- subtotal;
- impuestos si el alcance autorizado los contempla;
- total.

DETALLE:

- producto;
- variante nullable;
- servicio;
- cantidad;
- precio;
- descuento si posteriormente está autorizado;
- descripción/snapshot;
- tipo de concepto;
- observaciones de partida.

**Reglas**

- Utilizar el resultado de COM-041.
- Reutilizar implementación existente si fue clasificada como aprovechable.
- No adoptar tablas NEXT no autorizadas.
- Producto simple utiliza variante NULL.
- Producto con variantes conserva variante exacta.
- Servicio no debe recibir reglas físicas de producto.
- La Cotización NO modifica existencia física.
- La Cotización NO compromete inventario todavía.
- El compromiso comienza en Pedido, Sprint 4.
- Debe existir trazabilidad de capturista y responsable comercial.

**Tablas/Componentes relevantes**

Definir a partir de COM-041.

Si requiere construcción nueva:

usar entidades conceptuales hasta aprobar diseño físico.

**Usuarios/Responsables**

- Agente
- Vendedor
- Administración
- Supervisor/autorizador cuando corresponda

**Dependencias**

COM-002
COM-004
COM-041

**Criterios de aceptación**

- cabecera definida;
- detalle definido;
- cliente identificado;
- responsable comercial identificado;
- producto simple soportado;
- variante soportada;
- servicio soportado;
- Cotización no modifica stock;
- preparada para convertirse en Pedido.

======================================================================

#### COM-043 — PRODUCTO Y VARIANTE EN COTIZACIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir cotizar exactamente la presentación/producto que el cliente
solicita.

**Funcionalidad**

PRODUCTO SIMPLE:

seleccionar producto
→ cantidad
→ precio.

PRODUCTO CON VARIANTES:

seleccionar producto
→ seleccionar variante
→ cantidad
→ precio.

La partida debe mostrar de forma humana:

Producto + Variante.

Ejemplo:

Aceite Motor Sintético — 946 ml

y no únicamente:

Aceite Motor Sintético.

**Reglas**

- Variante debe pertenecer al producto.
- No permitir variante de otro producto.
- Producto con variantes conserva variante en la partida.
- Producto simple no obliga variante.
- La Cotización debe conservar snapshot documental cuando corresponda.
- La identidad de variante debe sobrevivir a la conversión a Pedido.
- Precio puede provenir de la variante cuando exista precio específico.
- No sobrescribir el precio de catálogo al capturar una Cotización.

**Tablas/Componentes relevantes**

- ProductosServicios
- ProductosServiciosVariantes
- Cotización
- CotizaciónDetalle

según arquitectura autorizada por COM-041.

**Usuarios/Responsables**

- Agente
- Vendedor
- Administración

**Dependencias**

COM-042

**Criterios de aceptación**

Cotizar:

Producto simple A
Cantidad 2

funciona.

Cotizar:

Aceite / 946 ml
Cantidad 3

funciona.

Cotizar:

Aceite / 5 L
Cantidad 1

funciona como partida distinta.

La variante permanece al guardar/reabrir.

======================================================================

#### COM-044 — SERVICIOS EN COTIZACIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir cotizar servicios sin forzarlos a comportarse como productos
inventariables.

**Funcionalidad**

Una Cotización puede contener:

- sólo productos;
- sólo servicios;
- productos + servicios.

Un servicio debe poder incluir:

- nombre;
- descripción;
- cantidad cuando aplique;
- precio;
- observaciones;
- información operativa posterior cuando corresponda.

**Reglas**

- Servicio NO consulta existencia física.
- Servicio NO compromete inventario.
- Servicio NO requiere variante.
- Servicio NO genera salida de inventario.
- Servicio puede requerir Operador posteriormente.
- Servicio puede requerir fecha de instalación/ejecución.
- Producto y Servicio pueden convivir en una Cotización.

**Tablas/Componentes relevantes**

- ProductosServicios
- CotizaciónDetalle
- modelo futuro de operación de servicios

**Usuarios/Responsables**

- Agente
- Vendedor
- Operador como referencia futura
- Administración

**Dependencias**

COM-042

**Decisión relacionada**

PO-011

**Criterios de aceptación**

Cotización:

Producto A
+
Servicio Instalación

se guarda correctamente.

Servicio no muestra existencia.

Servicio no exige variante.

Producto conserva sus reglas normales.

======================================================================

#### COM-045 — EXISTENCIA INFORMATIVA EN COTIZACIÓN

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Dar al Agente/Vendedor visibilidad de stock sin convertir la Cotización
en una reserva.

**Funcionalidad**

Al seleccionar un producto/variante, mostrar cuando corresponda:

- Existencia física;
- Existencia comprometida;
- Existencia disponible.

Producto simple:

consulta su saldo.

Producto con variantes:

consulta exclusivamente la variante seleccionada.

Servicio:

No aplica.

**Reglas**

- La consulta es informativa.
- Crear Cotización NO cambia Física.
- Crear Cotización NO cambia Comprometida.
- Crear Cotización NO cambia Disponible.
- Los valores provienen del modelo certificado en Sprint 1.
- No mostrar saldo consolidado como sustituto del saldo de variante.
- Si no existe stock, la UI debe informar claramente.

**Tablas/Componentes relevantes**

- ProductosServiciosExistencias
- ProductosServiciosVariantes
- Cotización

**Usuarios/Responsables**

- Agente
- Vendedor
- Administración

**Dependencias**

COM-019
COM-042
COM-043

**Criterios de aceptación**

Variante:

946 ml

Física = 10
Comprometida = 3
Disponible = 7

Cotización muestra:

7 disponibles.

Guardar Cotización:

los valores de inventario permanecen iguales.

Servicio:

no muestra stock.

======================================================================

#### COM-046 — COTIZAR SIN EXISTENCIA

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Recuperar la capacidad del backlog original de cotizar un producto aunque
no exista stock, sin confundir Cotización con Pedido/Venta.

**Funcionalidad**

Cuando un producto/variante tenga:

Disponible = 0

el sistema debe aplicar la política comercial autorizada:

- informar al usuario;
- permitir o bloquear Cotización según configuración/regla;
- conservar claramente que la partida no tiene existencia disponible.

La Cotización puede representar intención comercial futura.

El abastecimiento/compromiso se resolverá posteriormente.

**Reglas**

- Cotización NO es salida de inventario.
- Cotización NO reserva stock.
- Cotización sin existencia NO genera existencia negativa.
- Producto con variantes evalúa disponibilidad de la variante exacta.
- No utilizar disponibilidad de otra variante.
- Servicio no aplica a esta validación.
- La política debe ser coherente con configuración comercial futura.

**Usuarios/Responsables**

- Agente
- Vendedor
- Administración

**Dependencias**

COM-013
COM-045

**Decisión PO pendiente**

PO-002 — Política de Cotización sin existencia.

Definir si:

A. Siempre se permite con advertencia.

B. Se controla mediante configuración comercial.

C. Requiere autorización en ciertos casos.

NO confundir esta decisión con Venta sin existencia.

**Criterios de aceptación**

CASO A:

Disponible = 5.

Cotizar 2:

sin advertencia de faltante.

CASO B:

Disponible = 0.

El sistema aplica PO-002.

CASO C:

Producto tiene:

946 ml disponible = 0
5 L disponible = 10

Cotizar 946 ml:

NO utiliza las 10 unidades de 5 L como disponibilidad.

CASO D:

Guardar Cotización sin stock:

NO cambia inventario.

**Decisión relacionada**

PO-002

#### COM-047 — CONCEPTO PENDIENTE EN COTIZACIÓN

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Recuperar la capacidad del backlog original para cotizar temporalmente un
concepto que todavía no existe formalmente en ProductosServicios.

**Funcionalidad**

Permitir agregar una partida identificada claramente como:

CONCEPTO PENDIENTE

con información mínima como:

- descripción;
- cantidad;
- precio estimado;
- observaciones;
- tipo esperado si se conoce.

Debe quedar visualmente diferenciada de un ProductoServicio real.

**Reglas**

- Concepto pendiente NO crea automáticamente ProductosServicios.
- No inventar idProductoServicio.
- No inventar variante.
- No afecta inventario.
- No genera compromiso.
- Debe quedar marcado como pendiente de resolución.
- No debe perderse al guardar/reabrir la Cotización.
- Debe impedir la conversión definitiva a Pedido mientras siga pendiente,
  salvo una futura regla expresa diferente.
- Debe conservar quién lo capturó.

**Usuarios/Responsables**

- Agente
- Vendedor
- Administración

**Dependencias**

COM-042

**Criterios de aceptación**

Cotización contiene:

Producto real A
+
Concepto pendiente "Instalación especial X"

Guardar/reabrir:

ambos permanecen.

El concepto pendiente:

NO aparece como producto inventariable.

NO modifica existencias.

======================================================================

#### COM-048 — RESOLVER CONCEPTO PENDIENTE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Convertir un concepto pendiente en una referencia comercial válida antes
de generar Pedido.

**Funcionalidad**

Permitir resolver una partida pendiente mediante una de las alternativas
autorizadas por el modelo:

A. vincularla a un ProductoServicio existente;

B. vincularla a una variante existente cuando corresponda;

C. dar de alta primero el ProductoServicio mediante el flujo autorizado y
posteriormente vincularlo;

D. eliminar/cancelar la partida pendiente si ya no aplica.

**Reglas**

- No crear productos silenciosamente.
- No sustituir la descripción sin trazabilidad.
- Si se vincula a producto con variantes, seleccionar variante exacta.
- La resolución debe conservar referencia al concepto original cuando
  tenga valor documental.
- No permitir convertir a Pedido una Cotización con conceptos pendientes
  sin resolver.
- El alta de ProductoServicio debe reutilizar el módulo existente.
- No duplicar ProductosServicios.

**Usuarios/Responsables**

- Agente/Vendedor para solicitar o seleccionar cuando tenga permiso;
- Administración para altas/catálogos cuando corresponda.

**Dependencias**

COM-043
COM-047

**Criterios de aceptación**

Concepto pendiente:

"Aceite presentación especial"

se vincula posteriormente a:

Aceite / 5 L.

Resultado:

la partida deja de estar pendiente.

Conserva producto/variante válida.

La Cotización queda elegible para conversión a Pedido si no existen otros
bloqueos.

======================================================================

#### COM-049 — FLETE EN COTIZACIÓN

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Recuperar el concepto de flete del backlog original sin forzarlo a ser
inventario físico.

**Funcionalidad**

Permitir incorporar flete a una Cotización cuando la operación lo requiera.

Debe poder representarse claramente en:

- Cotización;
- totales;
- PDF;
- futura conversión a Pedido.

**Reglas**

- Flete NO modifica existencia.
- Flete NO utiliza variante.
- Flete debe distinguirse de Producto inventariable.
- No crear movimiento de inventario.
- Debe conservarse al convertir a Pedido.
- Su tratamiento fiscal/comercial debe seguir la configuración autorizada.
- No asumir todavía si flete será ProductoServicio, concepto especial o
  entidad propia hasta usar la arquitectura resultante de COM-041.

**Usuarios/Responsables**

- Agente
- Vendedor
- Administración

**Dependencias**

COM-041
COM-042

**Decisión relacionada**

PO-010

**Criterios de aceptación**

Cotización:

Producto A = 1,000
Flete = 200

Total comercial:

refleja ambos conceptos correctamente.

Inventario:

sin cambio por Flete.

PDF:

identifica Flete claramente.

======================================================================

#### COM-050 — DATOS DE INSTALACIÓN / EJECUCIÓN DE SERVICIO

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Recuperar del backlog original la información necesaria para preparar
servicios que requieren instalación o ejecución posterior.

**Funcionalidad**

Cuando una partida de Servicio lo requiera, permitir capturar:

- requiere instalación/ejecución;
- fecha propuesta;
- observaciones;
- domicilio/ubicación cuando corresponda;
- información necesaria para la futura operación.

**Reglas**

- No obligar estos campos a todos los Servicios.
- No mostrarlos para productos que no los requieran.
- La fecha capturada en Cotización es inicialmente una propuesta comercial,
  no evidencia de ejecución.
- La ejecución real se resolverá en Sprints posteriores.
- No marcar servicio como ejecutado desde Cotización.

**Usuarios/Responsables**

- Agente
- Vendedor
- Administración
- Operador como consumidor futuro de la información

**Dependencias**

COM-044

**Decisión relacionada**

PO-011

**Criterios de aceptación**

Servicio sin instalación:

no exige fecha.

Servicio con instalación:

permite fecha y observaciones.

Guardar/reabrir:

conserva información.

No genera asistencia ni ejecución automáticamente.

======================================================================

#### COM-051 — OPERADOR SUGERIDO

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Recuperar la capacidad de proponer un Operador desde la etapa comercial
sin confundir sugerencia con asignación definitiva.

**Funcionalidad**

Para Servicios que lo requieran, permitir seleccionar:

Operador sugerido.

La Cotización debe conservar esta sugerencia para que Pedido/Operación
puedan utilizarla posteriormente.

**Reglas**

- Operador sugerido NO equivale a Operador asignado definitivamente.
- No reservar agenda automáticamente.
- No registrar asistencia.
- No marcar servicio como ejecutado.
- Utilizar el modelo de Operadores definido/reutilizado en Sprint 0.
- Ayudantes no se asignan obligatoriamente desde Cotización.
- La asignación definitiva podrá ocurrir en Pedido/Operación.

**Usuarios/Responsables**

- Agente/Vendedor como solicitante cuando tenga permiso;
- Administración;
- Operador como referencia.

**Dependencias**

COM-001
COM-005
COM-044
COM-050

**Decisión relacionada**

PO-011

**Criterios de aceptación**

Servicio:

Instalación X

Operador sugerido:

Operador A.

Guardar/reabrir:

Operador A permanece como sugerencia.

No genera ejecución ni asistencia.

======================================================================

#### COM-052 — ESTADOS, AUTORIZACIÓN Y VIGENCIA DE COTIZACIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Definir el ciclo de vida mínimo de la Cotización para poder convertirla
posteriormente a Pedido.

**Funcionalidad**

V6 debe definir estados funcionales mínimos coherentes con la
implementación que resulte de COM-041.

Conceptualmente deben cubrir al menos:

- Captura/Borrador;
- emitida/enviada cuando corresponda;
- autorizada/aceptada para conversión;
- cancelada/rechazada cuando corresponda;
- vencida si existe vigencia.

NO convertir estos nombres conceptuales en estados físicos definitivos sin
revisar lo existente.

**Reglas**

- Una Cotización en edición no genera Pedido.
- Una Cotización con concepto pendiente no puede quedar lista para Pedido.
- La vigencia debe ser trazable cuando se utilice.
- La autorización puede representar aceptación comercial/permiso según el
  proceso finalmente aprobado.
- Cancelar Cotización NO modifica inventario.
- Vencer Cotización NO modifica inventario.
- No eliminar Cotizaciones históricas para representar cancelación.

**Usuarios/Responsables**

- Agente
- Vendedor
- Administración
- Supervisor/autorizador cuando corresponda

**Dependencias**

COM-004
COM-007
COM-042
COM-048

**Criterios de aceptación**

- ciclo de vida definido;
- Cotización incompleta no puede convertirse;
- concepto pendiente bloquea conversión;
- cancelación conserva historia;
- vigencia no altera stock;
- estado elegible para Pedido identificable.

======================================================================

#### COM-053 — PDF Y COMUNICACIÓN DE COTIZACIÓN

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Generar una salida comercial comprensible y reutilizar capacidades
existentes cuando la auditoría lo permita.

**Funcionalidad**

El PDF debe representar como mínimo:

- datos de la Cotización;
- cliente;
- responsable comercial;
- productos;
- variantes;
- servicios;
- conceptos pendientes claramente identificados si todavía pueden
  aparecer en borradores;
- flete;
- instalación cuando aplique;
- cantidades;
- precios;
- totales;
- vigencia cuando aplique.

La comunicación puede contemplar:

- descarga PDF;
- correo si existe infraestructura autorizada;
- WhatsApp únicamente como canal/enlace cuando el alcance lo permita.

**Reglas**

- Reutilizar generador PDF existente si COM-041 lo clasifica aprovechable.
- No adoptar componentes NEXT no autorizados.
- PDF debe conservar variante.
- PDF no debe mostrar información técnica interna.
- Enviar/descargar NO modifica inventario.
- La comunicación debe quedar trazable cuando exista soporte real.

**Dependencias**

COM-041
COM-043
COM-044
COM-049
COM-050
COM-051
COM-052

**Criterios de aceptación**

Cotización con:

Producto simple
+
Producto con variante
+
Servicio
+
Flete

produce PDF correcto.

Variante visible.

Servicio visible.

Flete visible.

Totales coherentes.

======================================================================

#### COM-054 — CERTIFICACIÓN FUNCIONAL DE COTIZACIONES 2.0

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Cerrar Sprint 3 y demostrar que la Cotización está preparada para
convertirse en Pedido.

**Funcionalidad**

Certificar:

- cliente;
- Agente/Vendedor;
- producto simple;
- variante;
- servicio;
- existencia informativa;
- cotización sin existencia;
- concepto pendiente;
- resolución;
- flete;
- instalación;
- operador sugerido;
- estados;
- PDF;
- persistencia;
- trazabilidad.

**Dependencias**

COM-041 a COM-053

**Criterios de aceptación**

- producto simple cotizable;
- variante cotizable;
- stock mostrado correctamente;
- Cotización no modifica stock;
- Servicio no consulta inventario;
- concepto pendiente funciona;
- concepto pendiente puede resolverse;
- Cotización con pendiente no convierte a Pedido;
- flete persiste;
- instalación persiste;
- operador sugerido persiste;
- PDF conserva variantes;
- estado elegible para Pedido identificado;
- historial preservado;
- 0 dependencia NEXT activa.

### S4 — Pedido + Compromiso

**Qué entrega:** 14 tickets, de COM-055 a COM-068.

#### COM-055 — MODELO FUNCIONAL DE PEDIDO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Crear el documento Pedido como entidad comercial independiente de la
Cotización.

**Funcionalidad**

El Pedido debe contener conceptualmente:

CABECERA:

- empresa;
- sucursal cuando corresponda;
- cliente;
- Cotización origen;
- fecha;
- vendedor/responsable comercial;
- usuario captura;
- estado;
- observaciones;
- subtotal;
- total;
- información necesaria para surtimiento.

DETALLE:

- producto;
- variante nullable;
- servicio;
- cantidad pedida;
- cantidad surtida;
- cantidad pendiente;
- precio documental;
- descripción/snapshot;
- flete cuando corresponda;
- información operativa relacionada.

**Reglas**

- Pedido es documento nuevo.
- No reutilizar Cotización como si fuera Pedido.
- Cotización y Pedido deben conservar trazabilidad.
- Producto simple utiliza variante NULL.
- Producto con variantes conserva variante exacta.
- Servicio no genera inventario físico.
- Pedido debe poder tener productos + servicios.
- Mantener multitenant.
- Sucursal debe respetar las decisiones previas.
- El Pedido debe poder sobrevivir aunque el catálogo cambie posteriormente.

**Tablas/Componentes relevantes**

Entidades conceptuales nuevas:

- Pedido
- PedidoDetalle

Relacionadas con:

- Cotización
- CotizaciónDetalle
- ProductosServicios
- ProductosServiciosVariantes
- Clientes según arquitectura autorizada
- Sucursales
- Usuarios

NO declarar nombres físicos definitivos hasta diseño técnico.

**Usuarios/Responsables**

- Agente/Vendedor
- Administración
- Supervisor/autorizador cuando corresponda

**Dependencias**

COM-004
COM-006
COM-021
COM-054

**Criterios de aceptación**

- cabecera definida;
- detalle definido;
- cliente trazable;
- Cotización origen trazable;
- responsable comercial trazable;
- producto simple soportado;
- variante soportada;
- servicio soportado;
- preparado para compromiso y surtimiento.

======================================================================

#### COM-056 — PEDIDODETALLE: PRODUCTO, VARIANTE Y SERVICIO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Garantizar que cada partida del Pedido conserve exactamente lo acordado en
la Cotización.

**Funcionalidad**

PEDIDO CON PRODUCTO SIMPLE:

Producto
+
Variante NULL
+
Cantidad.

PEDIDO CON VARIANTE:

Producto
+
Variante exacta
+
Cantidad.

PEDIDO CON SERVICIO:

Servicio
+
Cantidad/regla comercial correspondiente
+
datos operativos cuando apliquen.

**Reglas**

- No perder variante durante Cotización → Pedido.
- No sustituir variante automáticamente.
- No convertir servicio en producto inventariable.
- Conservar snapshot documental cuando tenga valor histórico.
- Cantidad pedida debe ser positiva.
- Cantidad surtida inicia según regla del nuevo Pedido, normalmente 0.
- Cantidad pendiente debe derivarse coherentemente.
- Producto/variante deben conservar empresa.
- La edición del catálogo posterior no reescribe la historia del Pedido.

**Tablas/Componentes relevantes**

- PedidoDetalle
- ProductosServicios
- ProductosServiciosVariantes
- CotizaciónDetalle

**Usuarios/Responsables**

- Agente/Vendedor
- Administración

**Dependencias**

COM-043
COM-044
COM-055

**Criterios de aceptación**

Cotización:

Aceite / 946 ml = 3
Servicio Instalación = 1

Pedido resultante:

Aceite / 946 ml = 3
Servicio Instalación = 1

La variante permanece 946 ml.

Servicio continúa siendo Servicio.

======================================================================

#### COM-057 — ESTADOS Y CICLO DE VIDA DEL PEDIDO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Definir un ciclo de vida que permita distinguir Pedido en preparación,
comprometido, parcialmente surtido, surtido y cancelado.

**Funcionalidad**

V6 debe proponer estados funcionales mínimos que cubran:

- Captura/Borrador;
- Confirmado/Activo;
- Parcialmente surtido;
- Surtido;
- Cancelado.

Los nombres físicos definitivos podrán ajustarse en diseño técnico.

**Reglas**

CAPTURA/BORRADOR:

- editable;
- todavía no debe producir efectos irreversibles.

CONFIRMADO/ACTIVO:

- representa compromiso comercial;
- habilita compromiso de inventario.

PARCIALMENTE SURTIDO:

- parte del Pedido ya fue atendida;
- conserva pendiente.

SURTIDO:

- pendiente de productos = 0 según reglas aplicables.

CANCELADO:

- conserva historia;
- libera compromiso no surtido;
- no borra Ventas/Surtimientos ya realizados.

No permitir regresar estados de forma destructiva.

**Usuarios/Responsables**

- Vendedor
- Administración
- Supervisor/autorizador según reglas

**Dependencias**

COM-055
COM-056
COM-007

**Criterios de aceptación**

- ciclo de vida definido;
- estado activo identificable;
- parcial identificable;
- surtido identificable;
- cancelación conserva historia;
- estado puede controlar compromiso;
- estado puede controlar surtimiento futuro.

======================================================================

#### COM-058 — CONVERTIR COTIZACIÓN ELEGIBLE EN PEDIDO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Crear el Pedido a partir de una Cotización válida sin recapturar la
operación.

**Funcionalidad**

Desde una Cotización elegible:

GENERAR PEDIDO

Debe trasladar:

- empresa;
- sucursal;
- cliente;
- responsable comercial;
- productos;
- variantes;
- servicios;
- cantidades;
- precios;
- flete;
- instalación;
- operador sugerido;
- observaciones relevantes;
- snapshots documentales necesarios.

**Reglas**

Sólo una Cotización elegible puede convertirse.

NO convertir si:

- está cancelada;
- está vencida cuando la vigencia sea bloqueante;
- tiene conceptos pendientes sin resolver;
- carece de información obligatoria;
- no cumple autorización requerida.

La conversión debe ser idempotente.

La misma Cotización NO debe crear dos Pedidos por:

- doble clic;
- F5;
- reintento.

Cotización permanece como documento origen.

No borrar ni transformar físicamente la Cotización en Pedido.

**Tablas/Componentes relevantes**

- Cotización
- CotizaciónDetalle
- Pedido
- PedidoDetalle

**Usuarios/Responsables**

- Agente/Vendedor
- Administración
- autorizador cuando corresponda

**Dependencias**

COM-048
COM-052
COM-054
COM-055
COM-056
COM-057

**Criterios de aceptación**

Cotización elegible:

genera 1 Pedido.

Reintentar:

continúa existiendo 1 Pedido.

Producto:
conservado.

Variante:
conservada.

Servicio:
conservado.

Flete:
conservado.

Cotización:
permanece consultable como origen.

======================================================================

#### COM-059 — VALIDACIONES PREVIAS A CONFIRMAR PEDIDO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Evitar que un Pedido inválido llegue a comprometer inventario o a
surtimiento.

**Funcionalidad**

Antes de confirmar/activar Pedido, validar como mínimo:

- cliente;
- empresa;
- sucursal cuando corresponda;
- responsable comercial;
- partidas;
- cantidades;
- producto/variante;
- conceptos pendientes;
- estado de productos/variantes cuando la regla lo requiera;
- disponibilidad informativa;
- servicios;
- datos operativos obligatorios.

**Reglas**

- No permitir conceptos pendientes sin resolver.
- Variante debe pertenecer al producto.
- Producto simple usa variante NULL.
- Servicio no requiere existencia.
- Disponibilidad insuficiente debe aplicar la política definida en tickets
  posteriores de compromiso/negativos.
- No modificar inventario físico desde esta validación.
- No generar movimiento de inventario.
- Los errores deben ser funcionales y comprensibles para el usuario.
- No mostrar errores técnicos como regla de negocio.

**Usuarios/Responsables**

- Vendedor
- Administración
- Supervisor/autorizador cuando corresponda

**Dependencias**

COM-056
COM-057
COM-058

**Criterios de aceptación**

Pedido con concepto pendiente:

NO confirma.

Pedido con variante inválida:

NO confirma.

Pedido con Servicio:

NO exige stock.

Pedido válido:

queda preparado para aplicar compromiso.

Inventario físico:

sin cambios durante validación.

#### COM-060 — COMPROMETER INVENTARIO AL CONFIRMAR PEDIDO

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Convertir un Pedido confirmado en una reserva comercial de existencia sin
disminuir todavía la existencia física.

**Funcionalidad**

Cuando un Pedido válido pase al estado que represente compromiso:

cada partida inventariable debe aumentar la existencia comprometida de:

- producto simple;
o
- variante exacta.

Ejemplo:

Aceite / 946 ml

Física = 10
Comprometida = 0
Disponible = 10

Pedido confirmado:

Cantidad = 3

Resultado:

Física = 10
Comprometida = 3
Disponible = 7

**Reglas**

- Confirmar Pedido NO disminuye Física.
- Producto simple compromete su saldo con variante NULL.
- Producto con variantes compromete exclusivamente la variante elegida.
- Servicio NO genera compromiso de inventario.
- Flete NO genera compromiso.
- La misma confirmación NO debe comprometer dos veces.
- F5/reintento/doble clic NO duplica compromiso.
- El compromiso debe poder rastrearse al Pedido y partida origen.
- Mantener empresa y sucursal según PO-001.
- No comprometer una variante diferente por tener disponibilidad.

**Tablas/Componentes relevantes**

- Pedido
- PedidoDetalle
- ProductosServiciosExistencias
- ProductosServiciosVariantes
- entidad/mecanismo de compromiso definido en diseño técnico

**Usuarios/Responsables**

- Vendedor
- Administración
- autorizador cuando corresponda

**Dependencias**

COM-012
COM-013
COM-057
COM-059

**Criterios de aceptación**

Inicial:

946 ml
Física = 10
Comprometida = 0
Disponible = 10

Pedido confirmado = 3

Resultado:

Física = 10
Comprometida = 3
Disponible = 7

5 L:

sin cambios.

Reintentar confirmación:

Comprometida continúa = 3.

======================================================================

**Decisión relacionada**

PO-001

#### COM-061 — DISPONIBLE Y CONTROL DE CANTIDAD COMPROMETIBLE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Evitar comprometer más existencia de la permitida por la política
comercial vigente.

**Funcionalidad**

Antes de comprometer una partida, consultar:

Física
Comprometida
Disponible

de la dimensión exacta.

Regla base:

Disponible = Física - Comprometida

El Pedido debe evaluar la cantidad solicitada contra Disponible.

**Reglas**

- Producto con variantes consulta la variante exacta.
- No utilizar disponibilidad de otra variante.
- Producto simple utiliza variante NULL.
- Servicio no consulta stock.
- La validación debe ocurrir nuevamente al confirmar, no sólo cuando se
  abrió la pantalla.
- Dos usuarios concurrentes no deben comprometer la misma disponibilidad
  como si estuviera libre.
- La operación debe proteger la consistencia del saldo.
- La política de insuficiencia se define en COM-062.

**Dependencias**

COM-013
COM-019
COM-060

**Criterios de aceptación**

Física = 10
Comprometida = 3
Disponible = 7

Intentar comprometer 5:

válido según regla base.

Nuevo resultado:

Comprometida = 8
Disponible = 2.

Intentar comprometer 3 adicionales:

debe aplicar COM-062.

======================================================================

#### COM-062 — POLÍTICA DE PEDIDO SIN DISPONIBILIDAD / NEGATIVOS

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Recuperar del backlog original la regla de negativos y definir qué sucede
cuando el Pedido supera la existencia disponible.

**Funcionalidad**

Cuando:

Cantidad a comprometer \> Disponible

el sistema debe aplicar una política comercial explícita.

Opciones conceptuales:

A. Bloquear Pedido.

B. Permitir Pedido pendiente de abastecimiento sin generar compromiso
   negativo.

C. Permitir compromiso negativo bajo autorización/regla específica.

NO seleccionar una opción automáticamente.

**Reglas**

- Cotizar sin existencia NO implica automáticamente permitir Pedido sin
  existencia.
- Venta sin existencia es una decisión diferente.
- Producto con variantes evalúa su propia disponibilidad.
- No utilizar stock de otra variante.
- Servicio no aplica.
- Si se permiten negativos, deben ser visibles y trazables.
- No esconder faltantes mediante saldo consolidado.
- La política debe ser uniforme para Pedido y posteriormente interpretada
  correctamente por Surtimiento/Venta.

**Usuarios/Responsables**

- Product Owner
- Vendedor
- Administración
- Supervisor/autorizador

**Dependencias**

COM-007
COM-046
COM-061

**Decisión PO pendiente**

PO-003 — Política de Pedido con disponibilidad insuficiente.

Definir:

A. Bloquear.

B. Permitir pendiente sin compromiso negativo.

C. Permitir negativo bajo autorización.

**Criterios de aceptación**

Disponible = 2

Pedido solicita = 5

Resultado:

aplica exactamente PO-003.

No se modifica otra variante.

No se genera un comportamiento implícito diferente al autorizado.

======================================================================

**Decisión relacionada**

PO-003

#### COM-063 — CANCELAR PEDIDO Y LIBERAR COMPROMISO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Liberar correctamente la existencia comprometida que todavía no haya sido
surtida cuando un Pedido se cancela.

**Funcionalidad**

Al cancelar un Pedido:

- conservar documento;
- registrar usuario;
- registrar fecha;
- registrar motivo;
- liberar únicamente compromiso pendiente;
- conservar cantidades ya surtidas;
- conservar Ventas/Surtimientos existentes.

Ejemplo:

Pedido = 10

Comprometida inicialmente = 10

Ya surtido = 4

Pendiente comprometido = 6

Cancelar:

libera 6.

NO revierte automáticamente las 4 ya surtidas.

**Reglas**

- Cancelar NO borra Pedido.
- Cancelar NO borra Venta.
- Cancelar NO borra movimientos de inventario ya ejecutados.
- Sólo libera compromiso no consumido.
- Producto con variantes libera variante exacta.
- No liberar dos veces por reintento.
- Debe existir motivo.
- Autorización según COM-007 cuando corresponda.
- Cancelar un Pedido sin compromiso no debe alterar inventario.

**Usuarios/Responsables**

- Vendedor según permiso
- Administración
- Supervisor/autorizador cuando corresponda

**Dependencias**

COM-057
COM-060
COM-061

**Criterios de aceptación**

Pedido:

946 ml = 10

Comprometido = 10

Surtido = 4

Cancelar:

Comprometido pendiente liberado = 6.

Física:

no se restaura artificialmente por las 4 ya surtidas.

Reintentar cancelación:

NO libera nuevamente.

======================================================================

#### COM-064 — PREPARAR PEDIDO PARA SURTIMIENTO PARCIAL

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Dejar el Pedido preparado para que Sprint 7 pueda surtir cantidades
parciales sin rediseñar su detalle.

**Funcionalidad**

Cada partida debe poder distinguir:

- Cantidad pedida;
- Cantidad surtida acumulada;
- Cantidad pendiente.

Regla conceptual:

Pendiente =
Cantidad pedida - Cantidad surtida acumulada

Ejemplo:

Pedido:

946 ml = 10

Surtimiento futuro 1:

4

Resultado:

Pedida = 10
Surtida = 4
Pendiente = 6

Surtimiento futuro 2:

6

Resultado:

Pedida = 10
Surtida = 10
Pendiente = 0

**Reglas**

- No surtir todavía en Sprint 4.
- Este ticket prepara modelo/reglas para Sprint 7.
- Cantidad surtida debe derivarse de operaciones válidas posteriores.
- No editar manualmente el acumulado como fuente de verdad.
- Producto con variantes mantiene pendientes independientes.
- Servicio debe manejar su avance/ejecución según su propia regla y no
  fingir salida de inventario.
- Flete debe conservarse sin convertirse en stock.
- Pedido parcialmente surtido debe conservar pendiente.
- Pedido surtido no pierde historia.

**Tablas/Componentes relevantes**

- Pedido
- PedidoDetalle
- modelo futuro de Surtimiento/Venta

**Usuarios/Responsables**

- Vendedor
- Operador/usuarios de surtimiento en Sprint 7
- Administración

**Dependencias**

COM-056
COM-057
COM-060

**Criterios de aceptación**

Pedido:

946 ml = 10
5 L = 3

La estructura puede representar posteriormente:

946 ml:
Surtido 4
Pendiente 6

5 L:
Surtido 1
Pendiente 2

sin mezclar variantes.

No genera salida de inventario todavía.

#### COM-065 — SERVICIOS DENTRO DEL PEDIDO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Conservar los Servicios provenientes de la Cotización y prepararlos para
su futura ejecución sin tratarlos como inventario físico.

**Funcionalidad**

Un Pedido debe poder contener:

- sólo productos;
- sólo servicios;
- productos + servicios.

Para cada Servicio conservar cuando aplique:

- Servicio;
- descripción;
- cantidad;
- precio;
- fecha propuesta de instalación/ejecución;
- observaciones;
- Operador sugerido;
- información operativa proveniente de Cotización.

El Pedido debe distinguir entre:

Servicio pendiente de ejecución

y

Servicio ejecutado.

La ejecución real se resolverá posteriormente.

**Reglas**

- Servicio NO genera existencia comprometida.
- Servicio NO disminuye existencia física.
- Servicio NO utiliza variante.
- Servicio NO genera movimiento de inventario.
- Convertir Cotización → Pedido conserva los datos operativos del Servicio.
- Fecha propuesta NO equivale a fecha ejecutada.
- Operador sugerido NO equivale a asignación definitiva.
- Un Servicio puede permanecer pendiente aunque los productos del Pedido
  ya hayan sido surtidos.
- El estado global del Pedido debe considerar correctamente productos y
  servicios según las reglas posteriores de operación.

**Tablas/Componentes relevantes**

- Pedido
- PedidoDetalle
- ProductosServicios
- datos operativos provenientes de Cotización
- modelo futuro de ejecución de Servicio

**Usuarios/Responsables**

- Agente/Vendedor
- Administración
- Operador como participante futuro

**Dependencias**

COM-044
COM-050
COM-051
COM-056
COM-058

**Decisión relacionada**

PO-011

**Criterios de aceptación**

CASO A:

Pedido contiene únicamente:

Servicio Instalación.

Resultado:

NO genera compromiso físico.

CASO B:

Pedido contiene:

Producto A
+
Servicio Instalación.

Producto:

puede comprometer existencia.

Servicio:

NO compromete existencia.

CASO C:

Servicio conserva:

fecha propuesta
+
observaciones
+
Operador sugerido

después de Cotización → Pedido.

======================================================================

#### COM-066 — OPERADORES Y AYUDANTES DEL PEDIDO

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Preparar la responsabilidad operativa de Servicios sin confundir usuarios
autenticados con participantes.

**Funcionalidad**

Para Servicios que lo requieran, el Pedido debe poder relacionar
conceptualmente:

- Operador sugerido;
- Operador asignado;
- Ayudante(s);
- responsable operativo.

Debe distinguir:

SUGERIDO
vs
ASIGNADO.

También:

OPERADOR CON LOGIN
vs
AYUDANTE SIN LOGIN.

**Reglas**

- Reutilizar el modelo definido en Sprint 0.
- No crear un segundo catálogo de Operadores sin necesidad.
- Ayudante NO requiere Login.
- Participar NO concede permisos.
- Operador sugerido proveniente de Cotización puede cambiar antes de la
  ejecución si el proceso lo permite.
- Cambiar Operador asignado debe conservar trazabilidad cuando corresponda.
- Asignar Operador NO registra asistencia.
- Asignar Operador NO marca Servicio como ejecutado.
- Asistencia se resolverá en Sprint 6.
- La ejecución real debe identificar quién participó.

**Tablas/Componentes relevantes**

- Pedido
- PedidoDetalle
- Operadores existentes
- personas/participantes definidos en Sprint 0
- futura operación de Servicio

**Usuarios/Responsables**

- Operador
- Ayudante
- Administración
- Supervisor cuando corresponda
- Vendedor como consulta cuando aplique

**Dependencias**

COM-001
COM-005
COM-051
COM-065

**Decisión relacionada**

PO-011

**Criterios de aceptación**

Servicio:

Instalación X.

Operador sugerido:

Operador A.

Pedido permite posteriormente establecer:

Operador asignado = Operador B.

Ayudante:

Ayudante C sin Login.

Resultado:

- sugerencia original puede conservarse;
- responsable operativo identificable;
- Ayudante identificable;
- no se crea Login al Ayudante;
- no se registra asistencia automáticamente.

======================================================================

#### COM-067 — FLETE DENTRO DEL PEDIDO

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Conservar el Flete acordado en Cotización durante el ciclo del Pedido.

**Funcionalidad**

Cuando una Cotización incluya Flete:

Cotización
→ Pedido

debe conservar:

- concepto;
- descripción;
- importe;
- información comercial relevante.

El Flete debe quedar disponible posteriormente para:

- resumen del Pedido;
- Venta;
- Ticket;
- reportes.

**Reglas**

- Flete NO genera compromiso físico.
- Flete NO genera movimiento de inventario.
- Flete NO utiliza variante.
- No perder Flete al convertir Cotización → Pedido.
- No convertir Flete automáticamente en Producto inventariable.
- Si la arquitectura de Cotizaciones define Flete mediante ProductoServicio
  no inventariable u otro mecanismo autorizado, Pedido debe respetar esa
  decisión.
- No duplicar el importe durante conversiones posteriores.

**Tablas/Componentes relevantes**

- Cotización
- Pedido
- PedidoDetalle o mecanismo de conceptos definido
- futura Venta

**Usuarios/Responsables**

- Agente/Vendedor
- Administración
- Cajero como consumidor futuro del importe

**Dependencias**

COM-049
COM-055
COM-058

**Decisión relacionada**

PO-010

**Criterios de aceptación**

Cotización:

Producto = 1,000
Flete = 200

Pedido:

Producto = 1,000
Flete = 200

Total:

coherente.

Inventario:

sin cambio por Flete.

======================================================================

#### COM-068 — CERTIFICACIÓN FUNCIONAL DE PEDIDO + COMPROMISO

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Cerrar Sprint 4 demostrando que Pedido puede convertirse en la fuente
comercial para Surtimiento y Venta.

**Funcionalidad**

Certificar:

- Cotización → Pedido;
- idempotencia;
- producto simple;
- variante;
- Servicio;
- Flete;
- responsable comercial;
- estados;
- compromiso;
- Disponible;
- insuficiencia;
- cancelación;
- liberación;
- preparación de surtimiento parcial;
- Operador/Ayudante;
- trazabilidad.

**Reglas**

La certificación debe comprobar comportamiento funcional.

NO basta:

build PASS.

NO generar todavía:

- salida física;
- Venta;
- Cobro.

Esos efectos corresponden a Sprint 7.

**Usuarios/Responsables**

- Product Owner
- Vendedor
- Administración
- Operador/Ayudante cuando corresponda
- Supervisor/autorizador

**Dependencias**

COM-055
COM-056
COM-057
COM-058
COM-059
COM-060
COM-061
COM-062
COM-063
COM-064
COM-065
COM-066
COM-067

**Criterios de aceptación**

- Cotización elegible crea un Pedido;
- reintento NO crea segundo Pedido;
- variante permanece;
- Servicio permanece;
- Flete permanece;
- Pedido confirmado compromete inventario;
- Física NO disminuye;
- Disponible se recalcula;
- otra variante NO cambia;
- PO-003 se respeta;
- cancelar libera compromiso pendiente;
- cantidades surtidas previas no se revierten por cancelar;
- Pedido preparado para surtimiento parcial;
- Operador/Ayudante representables;
- Servicio no compromete stock;
- Flete no compromete stock;
- trazabilidad Cotización → Pedido disponible.

**Decisión relacionada**

PO-003

### S5 — Formas de Pago + Caja + Ajustes PV

**Qué entrega:** 14 tickets, de COM-069 a COM-082.

#### COM-069 — CATÁLOGO COMERCIAL DE FORMAS DE PAGO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Definir el catálogo de medios mediante los cuales podrá liquidarse una
Venta.

**Funcionalidad**

Auditar primero si existe un catálogo autorizado y reutilizable.

Si existe:

evolucionarlo.

Si no existe:

construir conceptualmente un catálogo comercial.

Debe poder representar como mínimo categorías como:

- Efectivo;
- Tarjeta;
- Transferencia;
- Nota de Crédito;
- Vale;

y otras formas autorizadas por el negocio.

Cada Forma de Pago debe poder contemplar:

- identificador;
- código;
- nombre;
- descripción;
- activo/inactivo;
- orden;
- comportamiento comercial cuando corresponda.

**Reglas**

- NO utilizar una tabla NEXT.
- NO duplicar un catálogo actual si existe uno autorizado y reutilizable.
- Una forma inactiva no debe aparecer en operaciones nuevas.
- Históricos que utilizaron una forma posteriormente inactiva deben seguir
  siendo consultables.
- Código visible no sustituye ID interno.
- Nota de Crédito y Vale pueden aparecer como medios aplicables de saldo
  cuando Sprint 8 los implemente.
- No implementar todavía la aplicación de NC/Vale.
- No mezclar Forma de Pago con condición de pago si son conceptos
  diferentes en el modelo real.

**Tablas/Componentes relevantes**

Auditar catálogo actual si existe.

Si no existe:

usar entidad conceptual:

FORMA DE PAGO

hasta diseño técnico.

**Usuarios/Responsables**

- Administración
- Super Usuario según permisos
- Cajero como consumidor futuro
- Vendedor como consulta cuando corresponda

**Dependencias**

COM-001
COM-003

**Criterios de aceptación**

- catálogo autorizado identificado o definido;
- Efectivo representable;
- Tarjeta representable;
- Transferencia representable;
- NC/Vale preparados conceptualmente;
- activo/inactivo definido;
- no existe dependencia NEXT;
- históricos quedan protegidos.

======================================================================

#### COM-070 — CONFIGURACIÓN DE FORMAS DE PAGO POR SUCURSAL

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir que cada sucursal determine qué Formas de Pago puede utilizar
durante el Cobro.

**Funcionalidad**

Relacionar conceptualmente:

Sucursal
↔
Forma de Pago

Ejemplo:

Sucursal Centro:

- Efectivo = habilitado
- Tarjeta = habilitado
- Transferencia = habilitado

Sucursal B:

- Efectivo = habilitado
- Tarjeta = no habilitado
- Transferencia = habilitado

Checkout futuro debe consumir esta configuración.

**Reglas**

- No asumir que todas las sucursales aceptan todas las formas.
- Una forma globalmente inactiva no puede habilitarse operativamente.
- Deshabilitar una forma para nuevas operaciones NO borra históricos.
- Mantener empresa.
- Mantener multitenant.
- La configuración debe poder evolucionar posteriormente con reglas
  adicionales sin reconstruir el catálogo.
- No inferir la sucursal únicamente desde el Cajero si la operación ya
  tiene sucursal explícita.

**Tablas/Componentes relevantes**

- Sucursales
- Forma de Pago
- relación conceptual Sucursal/FormaPago

**Usuarios/Responsables**

- Administración
- Super Usuario según permisos
- Cajero como consumidor

**Dependencias**

COM-006
COM-069

**Criterios de aceptación**

Sucursal A:

Tarjeta habilitada.

Sucursal B:

Tarjeta deshabilitada.

Checkout futuro en A:

puede ofrecer Tarjeta.

Checkout futuro en B:

NO debe ofrecer Tarjeta.

Históricos de B pagados anteriormente con Tarjeta:

permanecen consultables.

======================================================================

#### COM-071 — REGLAS OPERATIVAS DE FORMAS DE PAGO

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Preparar el catálogo para que Checkout conozca qué información requiere
cada Forma de Pago.

**Funcionalidad**

Definir metadatos/reglas comerciales por forma cuando correspondan.

Ejemplos conceptuales:

EFECTIVO

Puede requerir:
- importe recibido;
- cambio.

TARJETA

Puede requerir:
- referencia/autorización;
- tipo de terminal o información futura si se decide.

TRANSFERENCIA

Puede requerir:
- referencia;
- observación/comprobante cuando la regla lo exija.

NC / VALE

Posteriormente requerirán:
- folio;
- saldo disponible;
- vigencia;
- aplicación parcial/total.

**Reglas**

- NO guardar datos sensibles de tarjeta que no correspondan.
- No diseñar procesamiento bancario en este Sprint.
- No integrar pasarela de pago sin ticket específico.
- Las reglas son configuración para Checkout.
- Una forma puede requerir referencia y otra no.
- Las validaciones deben ser comprensibles para Cajero.
- NC/Vale se terminan funcionalmente en Sprint 8.
- No duplicar reglas fiscales aquí.

**Usuarios/Responsables**

- Cajero
- Administración

**Dependencias**

COM-069
COM-070

**Criterios de aceptación**

Efectivo:

puede configurarse para cálculo de cambio.

Transferencia:

puede requerir referencia.

Forma inactiva:

no disponible.

NC/Vale:

reconocibles como formas futuras sin fingir que ya existen saldos.

======================================================================

#### COM-072 — PREPARACIÓN DE FORMA FISCAL FUTURA

**Prioridad:** P2

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Conservar del backlog original la necesidad de relacionar la operación
comercial con requisitos fiscales futuros sin convertir Sprint 5 en un
proyecto de facturación.

**Funcionalidad**

Documentar cómo las Formas de Pago comerciales podrán mapearse
posteriormente a la clasificación fiscal requerida cuando exista
facturación electrónica o integración fiscal.

**Reglas**

- Forma de Pago comercial y Forma de Pago fiscal pueden no ser el mismo
  concepto.
- NO construir facturación electrónica en este ticket.
- NO asumir claves fiscales sin auditar el modelo fiscal vigente.
- No romper los datos fiscales ya implementados en ProductosServicios.
- La Venta futura debe conservar información suficiente para una
  integración fiscal posterior.
- Este ticket NO bloquea el Checkout básico salvo dependencia real.

**Tablas/Componentes relevantes**

- Forma de Pago comercial
- configuración fiscal futura
- datos fiscales existentes del sistema

**Usuarios/Responsables**

- Administración
- perfiles fiscales futuros cuando correspondan

**Dependencias**

COM-069
COM-071

**Criterios de aceptación**

- diferencia comercial/fiscal documentada;
- estrategia de mapeo preparada;
- no se construye facturación innecesariamente;
- no se crean claves fiscales inventadas;
- Checkout comercial puede avanzar sin depender de una integración fiscal
  inexistente.

#### COM-073 — MODELO FUNCIONAL DE CAJA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Crear la base operativa necesaria para que un Cajero pueda registrar
Cobros y que éstos queden asociados a una Caja/Sucursal responsable.

**Funcionalidad**

Definir conceptualmente una Caja capaz de identificar:

- empresa;
- sucursal;
- código/nombre;
- estado activo/inactivo;
- usuario/Cajero responsable cuando corresponda;
- sesión o turno de Caja;
- fecha/hora;
- movimientos;
- saldo inicial;
- entradas;
- salidas;
- saldo esperado;
- cierre.

Debe distinguir:

CAJA

de

SESIÓN/TURNO DE CAJA.

Una misma Caja física/lógica puede utilizarse en distintos turnos a lo
largo del tiempo.

**Reglas**

- NO construir un ERP financiero.
- Caja pertenece al flujo operativo de Venta/Cobro.
- Mantener multitenant.
- Caja debe relacionarse con Sucursal.
- No asumir una Caja única para toda la empresa.
- No asumir que un Cajero sólo puede utilizar una Caja durante toda su
  vida laboral.
- Los históricos deben conservar qué Caja y qué sesión procesaron cada
  Cobro.
- Una Caja inactiva no debe iniciar nuevas sesiones.
- No borrar sesiones históricas.
- Los Cobros se implementarán en Sprint 7.

**Tablas/Componentes relevantes**

Entidades conceptuales:

- Caja
- Sesión/Turno de Caja

Relacionadas con:

- Empresa
- Sucursal
- Usuario/Cajero
- futuros Cobros

Usar estructuras actuales si una auditoría demuestra que son autorizadas
y reutilizables.

NO adoptar NEXT.

**Usuarios/Responsables**

- Cajero
- Administración
- Supervisor
- Super Usuario según permisos

**Dependencias**

COM-003
COM-006
COM-070

**Decisión relacionada**

PO-009

**Criterios de aceptación**

- Caja diferenciada de sesión;
- Caja relacionada con sucursal;
- Cajero identificable;
- históricos protegidos;
- Caja inactiva no inicia nueva sesión;
- modelo preparado para Cobro en Sprint 7.

======================================================================

#### COM-074 — APERTURA DE CAJA / INICIO DE TURNO

**Prioridad:** P1

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Permitir iniciar una sesión operativa de Caja con trazabilidad del Cajero
y saldo inicial.

**Funcionalidad**

La apertura debe poder registrar:

- Caja;
- Sucursal;
- Cajero;
- fecha/hora de apertura;
- saldo inicial de efectivo cuando aplique;
- observaciones;
- estado de sesión.

Conceptualmente:

Caja disponible
→ Abrir turno
→ Sesión activa.

**Reglas**

- Una sesión debe identificar al Cajero que la abrió.
- El saldo inicial NO es una Venta.
- El saldo inicial NO es un ingreso comercial.
- Debe registrarse como apertura/fondo inicial según el diseño posterior.
- No permitir dos aperturas incompatibles de la misma Caja si la política
  determina una sola sesión activa.
- No borrar una apertura histórica.
- Reintento NO debe crear dos sesiones.
- Asistencia como requisito para abrir Caja depende de Sprint 6 y de una
  decisión expresa del PO.
- No bloquear Sprint 5 por esa decisión.

**Usuarios/Responsables**

- Cajero
- Supervisor/Administración cuando corresponda

**Dependencias**

COM-073

**Decisión PO pendiente**

PO-004 — Política de apertura de Caja.

Definir si:

A. Cada Caja sólo puede tener una sesión activa.

B. Se permiten sesiones concurrentes bajo una regla específica.

La opción debe corresponder al modelo operativo real.

Decisión relacionada adicional: PO-009 — Alcance operativo de Caja.

**Criterios de aceptación**

Caja A.

Cajero 1.

Saldo inicial:
1,000.

Abrir:

crea una sola sesión activa.

Reintentar:

NO crea otra sesión accidental.

El saldo inicial queda diferenciado de las Ventas.

======================================================================

**Decisión relacionada**

PO-004

#### COM-075 — MOVIMIENTOS DE CAJA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Registrar los movimientos monetarios que explican el saldo de una sesión
de Caja.

**Funcionalidad**

La Caja debe poder recibir movimientos provenientes de:

- Cobro de Venta;
- devolución/reembolso cuando corresponda;
- apertura/fondo inicial;
- entrada manual autorizada;
- salida manual autorizada;
- otros movimientos definidos posteriormente.

Cada movimiento debe identificar:

- sesión de Caja;
- tipo;
- importe;
- Forma de Pago cuando corresponda;
- documento origen;
- usuario;
- fecha/hora;
- motivo/referencia.

**Reglas**

- Un Cobro debe generar su efecto de Caja una sola vez.
- No duplicar movimiento por F5/reintento.
- Movimiento manual requiere motivo.
- Entradas/salidas sensibles pueden requerir autorización COM-007.
- Efectivo afecta el saldo físico esperado de efectivo.
- Una Transferencia o Tarjeta puede formar parte del total cobrado sin
  necesariamente incrementar efectivo físico.
- No mezclar saldo de efectivo con total general de cobros.
- Documento origen debe ser rastreable.
- No editar/eliminar silenciosamente movimientos confirmados.

**Tablas/Componentes relevantes**

Entidades conceptuales:

- Movimiento de Caja
- Sesión de Caja
- Forma de Pago
- futuros Cobro/Venta

**Usuarios/Responsables**

- Cajero
- Administración
- Supervisor/autorizador

**Dependencias**

COM-007
COM-071
COM-073
COM-074

**Decisión relacionada**

PO-009

**Criterios de aceptación**

Apertura:

Efectivo inicial = 1,000.

Cobro futuro en efectivo:

+500.

Efectivo esperado:

1,500.

Cobro futuro por Transferencia:

+300 al total cobrado.

Efectivo físico esperado:

continúa 1,500.

Cada movimiento queda rastreable.

======================================================================

#### COM-076 — CIERRE Y ARQUEO DE CAJA

**Prioridad:** P1

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Cerrar una sesión comparando lo que el sistema espera contra lo que el
Cajero declara físicamente.

**Funcionalidad**

El cierre debe poder presentar:

- Caja;
- Cajero;
- apertura;
- ventas/cobros del turno;
- movimientos manuales;
- efectivo esperado;
- efectivo contado;
- diferencia;
- totales por Forma de Pago;
- observaciones;
- fecha/hora de cierre.

Conceptualmente:

Saldo esperado
vs
Saldo contado.

**Reglas**

- No alterar Cobros para hacer cuadrar Caja.
- Una diferencia debe registrarse, no esconderse.
- Cierre conserva historial.
- Sesión cerrada no recibe nuevos movimientos ordinarios.
- Correcciones posteriores deben ser trazables.
- Totales por Forma de Pago deben distinguir Efectivo, Tarjeta,
  Transferencia y otros.
- NC/Vale deben tratarse conforme a Sprint 8 cuando existan.
- El cierre NO modifica inventario.
- No borrar una sesión cerrada.

**Usuarios/Responsables**

- Cajero
- Supervisor
- Administración

**Dependencias**

COM-074
COM-075

**Decisión relacionada**

PO-009

**Criterios de aceptación**

Saldo inicial:
1,000.

Cobros efectivo:
500.

Salida autorizada:
100.

Efectivo esperado:
1,400.

Cajero declara:
1,390.

Diferencia:
-10.

El sistema registra la diferencia.

NO modifica Cobros para ocultarla.

======================================================================

#### COM-077 — RESPONSABILIDAD Y TRAZABILIDAD DE CAJA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Garantizar que cada Cobro y movimiento monetario pueda rastrearse a la
persona, Caja, sesión y documento correspondiente.

**Funcionalidad**

La trazabilidad futura debe permitir:

Venta
→ Cobro
→ Forma de Pago
→ Movimiento de Caja
→ Sesión
→ Caja
→ Cajero
→ Sucursal.

Debe ser posible consultar también en sentido inverso:

Sesión de Caja
→ Movimientos
→ Cobros
→ Ventas.

**Reglas**

- Vendedor responsable != Cajero que cobra.
- Cajero debe quedar identificado.
- Caja debe quedar identificada.
- Sesión debe quedar identificada.
- Sucursal debe quedar identificada.
- Documento origen debe conservarse.
- No utilizar sólo nombre del usuario como referencia.
- Mantener IDs internos estables.
- No borrar trazabilidad al desactivar Cajero/Caja/Forma de Pago.

**Usuarios/Responsables**

- Cajero
- Vendedor como responsable comercial relacionado
- Administración
- Supervisor
- usuarios de Reportes

**Dependencias**

COM-004
COM-073
COM-075
COM-076

**Decisión relacionada**

PO-009

**Criterios de aceptación**

Una futura Venta debe poder responder:

¿Quién vendió?
→ Vendedor A.

¿Quién cobró?
→ Cajero B.

¿En qué Caja?
→ Caja Centro 01.

¿En qué sesión?
→ Turno X.

¿En qué Sucursal?
→ Centro.

¿Con qué Forma de Pago?
→ Efectivo/Tarjeta/etc.

Sin confundir responsables.

#### COM-078 — AJUSTES PV POR SUCURSAL

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Recuperar del backlog original la configuración comercial de Punto de
Venta y centralizar las reglas que pueden variar por Sucursal.

**Funcionalidad**

Definir una configuración de Ajustes PV capaz de controlar, como mínimo:

- Sucursal;
- días permitidos para devolución;
- vigencia de Nota de Crédito;
- vigencia de Vale;
- reglas operativas futuras que realmente pertenezcan al Punto de Venta.

La configuración debe ser consultable posteriormente por:

- Venta;
- Cobro;
- Devolución;
- Nota de Crédito;
- Vale.

**Reglas**

- NO convertir Ajustes PV en un contenedor genérico de cualquier
  configuración del sistema.
- Cada parámetro debe tener una finalidad comercial clara.
- La configuración puede variar por Sucursal.
- Mantener empresa/multitenant.
- Los cambios de configuración aplican hacia operaciones nuevas según la
  regla temporal definida.
- NO reescribir históricos porque cambie una configuración.
- No utilizar tablas NEXT.
- Reutilizar una estructura actual únicamente si es autorizada y
  funcionalmente compatible.
- No duplicar configuración existente sin auditoría.

**Tablas/Componentes relevantes**

- Sucursales
- entidad conceptual Ajustes PV o configuración comercial equivalente
- futura Venta
- futura Devolución
- futura NC/Vale

**Usuarios/Responsables**

- Administración
- Super Usuario
- Supervisor cuando tenga permiso de configuración

**Dependencias**

COM-003
COM-006
COM-070

**Criterios de aceptación**

- una Sucursal puede tener configuración propia;
- otra Sucursal puede tener valores diferentes;
- configuración queda ligada a empresa;
- históricos no cambian al modificar parámetros;
- no existe dependencia NEXT;
- parámetros son consumibles por Sprints posteriores.

======================================================================

#### COM-079 — POLÍTICA DE DÍAS PARA DEVOLUCIÓN

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Definir cuántos días después de una Venta puede solicitarse una
Devolución.

**Funcionalidad**

Ajustes PV debe permitir definir:

Días para devolución

por Sucursal o alcance comercial autorizado.

Ejemplo:

Sucursal Centro:
30 días.

Sucursal Norte:
15 días.

Sprint 8 utilizará esta regla para validar la elegibilidad de una Venta o
partida.

**Reglas**

- Este ticket configura la política; NO construye Devoluciones.
- El cálculo futuro debe partir de una fecha documental confiable de Venta.
- No modificar la fecha de Venta para hacer válida una devolución.
- La política debe poder cambiar sin reescribir operaciones históricas.
- Debe definirse qué política aplica a una Venta: la vigente al momento de
  Venta o la vigente al solicitar Devolución.

Esta última regla debe quedar explícita antes de Sprint 8.

**Usuarios/Responsables**

- Administración
- Supervisor/Super Usuario según permisos
- Cajero/Vendedor como consumidores futuros de la regla

**Dependencias**

COM-078

**Decisión PO pendiente**

PO-005 — Temporalidad de la política de devolución.

A)
Usar configuración vigente al momento de la Venta.

B)
Usar configuración vigente al momento de solicitar la Devolución.

V6 debe documentar el impacto de ambas alternativas.

**Criterios de aceptación**

- días configurables;
- configuración diferenciable por Sucursal;
- política temporal definida mediante PO-005;
- Sprint 8 puede consultar la regla;
- no se construye todavía la Devolución.

======================================================================

**Decisión relacionada**

PO-005

#### COM-080 — VIGENCIA DE NOTA DE CRÉDITO

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Definir cuánto tiempo podrá utilizarse una Nota de Crédito después de ser
emitida.

**Funcionalidad**

Ajustes PV debe permitir configurar:

Vigencia Nota de Crédito

en días o mediante la unidad temporal autorizada.

Sprint 8 utilizará esta configuración para calcular:

Fecha emisión
→ Fecha vencimiento.

**Reglas**

- Este ticket configura la política.
- NO crea Notas de Crédito.
- Una NC vencida no debe aplicarse a nuevas operaciones cuando Sprint 8
  implemente la regla.
- Cambiar la configuración no debe modificar automáticamente la vigencia
  de NC ya emitidas si éstas conservaron su propia fecha de vencimiento.
- La NC futura debe conservar snapshot de su vigencia/fecha de vencimiento.
- Mantener Sucursal cuando la política sea por Sucursal.
- No confundir Nota de Crédito con devolución de efectivo.

**Usuarios/Responsables**

- Administración
- Supervisor/Super Usuario
- Cajero como consumidor futuro

**Dependencias**

COM-078

**Criterios de aceptación**

Sucursal A:

Vigencia NC = 30 días.

Sucursal B:

Vigencia NC = 60 días.

La configuración puede consultarse independientemente.

Sprint 8 puede utilizarla para emitir NC con fecha de vencimiento propia.

======================================================================

#### COM-081 — VIGENCIA DE VALE

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Definir cuánto tiempo podrá utilizarse un Vale emitido como saldo a favor.

**Funcionalidad**

Ajustes PV debe permitir configurar:

Vigencia Vale

por Sucursal cuando corresponda.

Sprint 8 utilizará la configuración para calcular:

Fecha emisión
→ Fecha vencimiento.

**Reglas**

- Este ticket configura la política.
- NO crea Vales.
- Vale futuro debe tener folio/saldo/vigencia propios.
- Cambiar la configuración no reescribe Vales ya emitidos.
- Un Vale vencido no podrá aplicarse a una nueva Venta cuando Sprint 8
  implemente esa regla.
- Vale y Nota de Crédito deben permanecer como conceptos distintos aunque
  puedan compartir reglas de aplicación.
- No asumir que ambos tienen la misma vigencia.
- No convertir Vale en efectivo automáticamente.

**Usuarios/Responsables**

- Administración
- Supervisor/Super Usuario
- Cajero como consumidor futuro

**Dependencias**

COM-078

**Criterios de aceptación**

Sucursal A:

Vigencia Vale = 90 días.

Sucursal B:

Vigencia Vale = 30 días.

La configuración es independiente de NC.

Sprint 8 puede consumirla.

======================================================================

#### COM-082 — CERTIFICACIÓN DE FORMAS DE PAGO, CAJA Y AJUSTES PV

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Cerrar Sprint 5 demostrando que la configuración necesaria para Venta y
Cobro está lista antes de construir Checkout.

**Funcionalidad**

Certificar funcionalmente:

FORMAS DE PAGO

- catálogo;
- activo/inactivo;
- configuración por Sucursal;
- reglas operativas;
- preparación fiscal futura.

CAJA

- Caja;
- sesión/turno;
- apertura;
- movimientos;
- efectivo esperado;
- cierre;
- arqueo;
- trazabilidad de Cajero.

AJUSTES PV

- configuración por Sucursal;
- días devolución;
- vigencia NC;
- vigencia Vale.

**Reglas**

- NO certificar sólo por build.
- NO construir Venta todavía.
- NO construir Devolución todavía.
- NO crear NC/Vale todavía.
- Validar que Sprint 7 y Sprint 8 puedan consumir las reglas.
- NEXT debe permanecer fuera.
- Históricos deben estar protegidos.

**Usuarios/Responsables**

- Product Owner
- Administración
- Cajero
- Supervisor
- Super Usuario

**Dependencias**

COM-069
COM-070
COM-071
COM-072
COM-073
COM-074
COM-075
COM-076
COM-077
COM-078
COM-079
COM-080
COM-081

**Criterios de aceptación**

- Formas de Pago disponibles por Sucursal;
- Forma inactiva no aparece para nuevas operaciones;
- Caja diferenciada de sesión;
- apertura identificable;
- Cajero identificable;
- movimientos trazables;
- efectivo separado de otros medios;
- cierre calcula diferencia;
- Ajustes PV varían por Sucursal;
- días devolución configurables;
- vigencia NC configurable;
- vigencia Vale configurable;
- decisiones PO-004 y PO-005 identificadas/resueltas cuando bloqueen
  implementación;
- 0 dependencia NEXT activa;
- Sprint 7 puede construir Checkout/Cobro;
- Sprint 8 puede construir Devolución/NC/Vale.

**Decisión relacionada**

PO-004, PO-005

### S6 — Asistencia y Operación Comercial

**Qué entrega:** 6 tickets, de COM-083 a COM-088.

#### COM-083 — AUDITORÍA Y MODELO FUNCIONAL DE ASISTENCIA

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Determinar qué estructuras actuales pueden reutilizarse antes de construir
Asistencia comercial.

**Funcionalidad**

Auditar si existe una capacidad autorizada para:

- persona;
- empleado;
- Operador;
- asistencia;
- entrada;
- salida;
- sucursal;
- horarios/turnos cuando existan.

Clasificar lo encontrado como:

A. Reutilizable.

B. Reutilizable con evolución.

C. No aplicable al Comercial.

D. Fuera de alcance por NEXT.

E. Requiere construcción nueva.

**Reglas**

- No crear segundo catálogo de personas sin necesidad.
- No crear segundo modelo de Operadores.
- Ayudante puede existir sin Login.
- Usuario y persona física pueden ser conceptos relacionados pero
  diferentes.
- NEXT queda fuera.
- No modificar código durante la auditoría.

**Usuarios/Responsables**

- Vendedor
- Cajero
- Operador
- Ayudante
- Administración

**Dependencias**

COM-001
COM-005
COM-006

**Criterios de aceptación**

- modelo actual identificado;
- entidades reutilizables identificadas;
- Operador auditado;
- Ayudante representable;
- Sucursal identificada;
- dependencia NEXT explícita;
- estrategia de reutilización definida;
- 0 implementación realizada.

======================================================================

#### COM-084 — REGISTRO DE ENTRADA

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Registrar que una persona inició su jornada/participación operativa en una
Sucursal.

**Funcionalidad**

Permitir registrar cuando corresponda:

- persona;
- perfil/relación operativa;
- sucursal;
- fecha;
- hora de entrada;
- usuario que registra si es diferente;
- observaciones;
- estado de asistencia.

Debe soportar conceptualmente:

Vendedor
Cajero
Operador
Ayudante

según el modelo resultante de COM-083.

**Reglas**

- Ayudante no necesita Login para tener asistencia.
- Entrada no concede permisos.
- Entrada no inicia Venta.
- Entrada no abre Caja automáticamente.
- Entrada no asigna Servicio automáticamente.
- No duplicar entrada accidental por reintento.
- Mantener empresa y sucursal.
- No crear asistencia para perfiles donde no tenga sentido funcional.

**Dependencias**

COM-083

**Criterios de aceptación**

Operador A:

Entrada 08:00
Sucursal Centro.

Ayudante B sin Login:

Entrada 08:05
Sucursal Centro.

Ambos quedan registrados.

Ayudante B:

continúa sin credenciales de acceso.

======================================================================

#### COM-085 — REGISTRO DE SALIDA

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Cerrar la participación/jornada iniciada mediante Entrada.

**Funcionalidad**

Permitir registrar:

- persona;
- entrada relacionada;
- fecha/hora de salida;
- sucursal;
- observaciones;
- usuario que registra cuando corresponda.

Debe permitir calcular posteriormente:

duración/asistencia

sin convertirlo todavía en nómina.

**Reglas**

- Salida debe corresponder a una Entrada válida.
- No duplicar Salida por reintento.
- No modificar Entrada para fingir una Salida.
- No calcular nómina.
- No generar pagos.
- No borrar asistencia histórica.
- Una corrección debe ser trazable.
- Ayudante continúa sin requerir Login.

**Dependencias**

COM-084

**Criterios de aceptación**

Entrada:

08:00.

Salida:

17:00.

Resultado:

asistencia cerrada y trazable.

Segundo intento de Salida:

NO crea una segunda salida incompatible.

======================================================================

#### COM-086 — RELACIONAR ASISTENCIA CON VENDEDOR, CAJERO Y OPERADOR

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir conocer si las personas responsables de una operación estaban
registradas en la Sucursal cuando la política lo requiera.

**Funcionalidad**

Preparar consultas como:

- Vendedor con asistencia activa;
- Cajero con asistencia activa;
- Operador con asistencia activa;
- Ayudante participante.

Esto debe servir posteriormente para:

- Venta;
- Caja;
- Servicios;
- reportes operativos.

**Reglas**

- Registrar asistencia NO equivale a autorizar una operación.
- Los permisos siguen dependiendo de Rol/Permiso.
- Asistencia y seguridad son dimensiones diferentes.
- No bloquear operaciones todavía sólo por ausencia de asistencia.
- El bloqueo se define en COM-087.
- Respetar Sucursal.

**Dependencias**

COM-002
COM-003
COM-084
COM-085

**Criterios de aceptación**

El sistema conceptual puede responder:

¿Vendedor A tiene asistencia activa?

¿Cajero B tiene asistencia activa?

¿Operador C tiene asistencia activa?

sin modificar sus permisos.

======================================================================

#### COM-087 — POLÍTICA DE ASISTENCIA COMO REQUISITO OPERATIVO

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Definir si la asistencia será únicamente informativa o una precondición
para determinadas operaciones.

**Funcionalidad**

Definir una política para casos como:

- Vendedor puede iniciar Venta;
- Cajero puede abrir Caja;
- Operador puede ejecutar Servicio.

Opciones:

A. Asistencia sólo informativa.

B. Asistencia obligatoria para determinadas operaciones.

C. Política configurable por perfil/proceso.

**Reglas**

- No asumir B automáticamente.
- Si se exige asistencia, debe validarse en la Sucursal correcta.
- Ayudante puede registrar asistencia sin Login.
- Permiso válido + asistencia inválida pueden ser condiciones distintas.
- No usar asistencia como sustituto de permisos.
- La política debe quedar lista antes de Sprint 7.

**Usuarios/Responsables**

- Product Owner
- Administración
- Vendedor
- Cajero
- Operador
- Supervisor

**Dependencias**

COM-086

**Decisión PO pendiente**

PO-006 — Política de asistencia operativa.

A)
Informativa.

B)
Obligatoria para procesos definidos.

C)
Configurable por proceso/perfil.

**Criterios de aceptación**

- PO-006 documentada;
- procesos afectados identificados;
- comportamiento de Vendedor definido;
- comportamiento de Cajero definido;
- comportamiento de Operador definido;
- Ayudante contemplado;
- permisos siguen siendo independientes.

======================================================================

**Decisión relacionada**

PO-006

#### COM-088 — CERTIFICACIÓN DE ASISTENCIA Y OPERACIÓN COMERCIAL

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Cerrar Sprint 6 y dejar resuelta la participación humana antes de
Venta/Surtimiento/Cobro.

**Funcionalidad**

Certificar:

- modelo reutilizado/nuevo;
- Entrada;
- Salida;
- Sucursal;
- Vendedor;
- Cajero;
- Operador;
- Ayudante sin Login;
- política PO-006;
- trazabilidad.

**Dependencias**

COM-083
COM-084
COM-085
COM-086
COM-087

**Criterios de aceptación**

- Entrada funciona conceptualmente para perfiles aplicables;
- Salida cierra asistencia;
- Ayudante no requiere Login;
- Vendedor identificable;
- Cajero identificable;
- Operador identificable;
- Sucursal identificable;
- asistencia no concede permisos;
- política de bloqueo/información definida;
- Sprint 7 puede consumir la regla.

**Decisión relacionada**

PO-006

### S7 — Venta + Surtimiento + Cobro

**Qué entrega:** 22 tickets, de COM-089 a COM-110.

#### COM-089 — MODELO FUNCIONAL DE VENTA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Crear Venta como documento comercial que representa lo efectivamente
surtido/cobrado al cliente.

**Funcionalidad**

La Venta debe poder contener conceptualmente:

CABECERA:

- empresa;
- sucursal;
- cliente;
- Pedido origen;
- fecha/hora;
- Vendedor responsable;
- Cajero;
- usuario captura cuando corresponda;
- Caja;
- sesión de Caja;
- estado;
- subtotal;
- total;
- observaciones.

DETALLE:

- PedidoDetalle origen;
- producto;
- variante nullable;
- servicio;
- cantidad vendida/surtida;
- precio;
- importe;
- snapshot documental;
- información necesaria para devolución futura.

**Reglas**

- Venta es documento distinto de Pedido.
- Pedido permanece como documento origen.
- Producto simple utiliza variante NULL.
- Producto con variantes conserva variante exacta.
- Servicio no genera salida de inventario.
- Flete puede formar parte comercial de Venta sin ser inventario.
- Venta debe conservar quién vendió.
- Cobro debe conservar quién cobró.
- Vendedor != Cajero.
- Venta debe quedar preparada para Devolución en Sprint 8.
- Mantener empresa/sucursal.
- Mantener multitenant.
- No borrar Venta para corregir una operación posterior.

**Tablas/Componentes relevantes**

Entidades conceptuales nuevas:

- Venta
- VentaDetalle

Relacionadas con:

- Pedido
- PedidoDetalle
- ProductosServicios
- ProductosServiciosVariantes
- Usuario/Vendedor
- Usuario/Cajero
- Caja
- Sesión Caja

NO declarar nombres físicos definitivos sin diseño técnico.

**Usuarios/Responsables**

- Vendedor
- Cajero
- Administración
- Supervisor según permisos

**Dependencias**

COM-004
COM-068
COM-077
COM-088

**Decisión relacionada**

PO-010, PO-011

**Criterios de aceptación**

- Venta diferenciada de Pedido;
- Pedido origen rastreable;
- Vendedor identificable;
- Cajero identificable;
- producto simple soportado;
- variante soportada;
- servicio soportado;
- sucursal identificable;
- preparada para Cobro;
- preparada para Devolución.

======================================================================

#### COM-090 — SELECCIONAR PEDIDO PARA VENTA

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Iniciar la Venta desde un Pedido válido sin recapturar la operación.

**Funcionalidad**

Permitir localizar/seleccionar un Pedido mediante criterios útiles como:

- folio;
- cliente;
- fecha;
- Vendedor;
- estado;
- sucursal.

Al abrirlo debe mostrar:

- cliente;
- responsable comercial;
- productos;
- variantes;
- servicios;
- cantidad pedida;
- cantidad surtida acumulada;
- cantidad pendiente;
- Flete;
- información operativa relevante.

**Reglas**

- No vender desde Pedido cancelado.
- No volver a surtir una cantidad ya surtida.
- Pedido completamente surtido no debe ofrecer cantidades nuevas.
- Pedido parcialmente surtido debe mostrar sólo pendiente real.
- Variante debe permanecer exacta.
- Servicio pendiente debe identificarse separadamente.
- Respetar Sucursal.
- Aplicar política de asistencia PO-006 si ésta fue definida como
  requisito para Vendedor/Cajero.

**Usuarios/Responsables**

- Vendedor
- Cajero cuando corresponda al flujo
- Administración

**Dependencias**

COM-057
COM-064
COM-068
COM-087
COM-089

**Criterios de aceptación**

Pedido:

946 ml
Pedida = 10
Surtida = 4
Pendiente = 6

Abrir para nueva Venta:

muestra pendiente = 6.

NO permite vender nuevamente las 4 ya surtidas como si siguieran
pendientes.

======================================================================

**Decisión relacionada**

PO-006

#### COM-091 — RESUMEN OPERATIVO DEL PEDIDO ANTES DE SURTIR

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Dar al usuario una vista clara de lo que todavía debe atenderse antes de
generar la Venta.

**Funcionalidad**

Mostrar por partida:

- producto/servicio;
- variante;
- cantidad pedida;
- surtida acumulada;
- pendiente;
- existencia física actual;
- compromiso;
- disponible;
- cantidad a surtir ahora;
- estado de la partida.

Para Servicios mostrar información operativa relevante en lugar de stock.

**Reglas**

- Existencia debe consultarse nuevamente.
- No confiar únicamente en snapshots antiguos del Pedido.
- Producto con variantes consulta variante exacta.
- No utilizar existencia de otra variante.
- Servicio no muestra stock.
- El resumen no modifica inventario.
- El resumen no libera compromiso.
- La cantidad a surtir es propuesta hasta confirmación.

**Dependencias**

COM-019
COM-064
COM-090

**Criterios de aceptación**

Producto:

946 ml

Pedido pendiente:
6

Física actual:
8

Comprometida correspondiente:
6

El resumen muestra correctamente la situación.

5 L:

se consulta independientemente.

Servicio:

no muestra existencia física.

======================================================================

#### COM-092 — PREPARAR SURTIMIENTO POR PARTIDA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir indicar cuánto se atenderá en la operación actual antes de
generar los efectos definitivos.

**Funcionalidad**

Para cada partida pendiente permitir capturar:

Cantidad a surtir ahora.

Ejemplo:

Pedido:

946 ml
Pendiente = 6

Usuario selecciona:

Surtir ahora = 4

Resultado previo:

4 quedan preparados para esta operación.

2 permanecerán pendientes después de confirmar.

**Reglas**

- Cantidad \> 0.
- Cantidad \<= pendiente.
- Producto con variante conserva variante exacta.
- No cambiar producto desde surtimiento.
- No cambiar variante desde surtimiento.
- No afectar inventario todavía durante preparación.
- No liberar compromiso todavía durante preparación.
- No actualizar acumulado hasta confirmación.
- Servicio utiliza una regla de atención/ejecución propia y no una salida
  de inventario.
- Debe ser posible dejar una partida sin surtir en esta operación.

**Usuarios/Responsables**

- Vendedor
- usuario de surtimiento autorizado
- Administración
- Operador cuando el proceso lo requiera

**Dependencias**

COM-090
COM-091

**Criterios de aceptación**

Pendiente = 6.

Capturar:

4.

Resultado previo:

Surtir ahora = 4
Quedará pendiente = 2.

Inventario:

sin cambios antes de confirmar.

Compromiso:

sin cambios antes de confirmar.

======================================================================

#### COM-093 — VALIDACIONES PREVIAS AL SURTIMIENTO

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Evitar que una operación inválida llegue a disminuir inventario.

**Funcionalidad**

Antes de confirmar el surtimiento validar:

- Pedido válido;
- estado permitido;
- cantidad pendiente;
- cantidad a surtir;
- producto;
- variante;
- existencia física;
- compromiso relacionado;
- sucursal;
- permisos;
- asistencia cuando PO-006 la haga obligatoria.

**Reglas**

- No surtir más que el pendiente.
- No surtir variante distinta.
- No usar stock de otra variante.
- No surtir producto cancelado/inválido cuando la regla lo impida.
- La política para falta de Física debe ser coherente con PO-003 y con la
  política específica de Venta si se requiere una decisión adicional.
- Servicio no se valida contra Física.
- No modificar inventario durante validación.
- Los mensajes deben ser funcionales, no errores técnicos.
- Revalidar inmediatamente antes de confirmar para evitar concurrencia.

**Usuarios/Responsables**

- Vendedor
- usuario de surtimiento
- Administración
- Supervisor/autorizador cuando aplique

**Dependencias**

COM-003
COM-062
COM-087
COM-092

**Criterios de aceptación**

CASO A:

Pendiente = 6
Surtir = 7

Resultado:

NO permitido.

CASO B:

Pedido = 946 ml
Usuario intenta utilizar 5 L

Resultado:

NO permitido.

CASO C:

Servicio

Resultado:

NO exige existencia física.

CASO D:

permiso/asistencia no cumplen la política vigente

Resultado:

aplica exactamente las reglas de Sprint 0/Sprint 6.

**Decisión relacionada**

PO-003, PO-006

#### COM-094 — CONFIRMAR SURTIMIENTO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Convertir la preparación del surtimiento en una operación confirmada que
afecte las cantidades reales del Pedido.

**Funcionalidad**

Al confirmar el surtimiento, el sistema debe procesar las cantidades
seleccionadas en COM-092 después de repetir las validaciones de COM-093.

Para productos inventariables debe preparar en una sola operación
coherente:

1. confirmar cantidad surtida;
2. generar salida de inventario;
3. disminuir existencia física;
4. liberar compromiso correspondiente;
5. actualizar cantidad surtida acumulada;
6. actualizar cantidad pendiente;
7. actualizar condición/estado del Pedido;
8. conservar trazabilidad documental.

Para Servicios:

la confirmación del producto NO debe generar salida física del Servicio.

**Reglas**

- Confirmar es una operación definitiva y trazable.
- Preparar no equivale a confirmar.
- Revalidar inmediatamente antes de afectar inventario.
- Producto simple utiliza variante NULL.
- Producto con variantes utiliza variante exacta.
- No surtir más que el pendiente.
- No surtir más cantidad física de la permitida por la política vigente.
- No afectar otra variante.
- La operación debe evitar estados parciales incoherentes.
- Si falla el efecto físico, no debe quedar el Pedido actualizado como si
  el surtimiento hubiera concluido correctamente.
- La idempotencia se completa en COM-099.

**Tablas/Componentes relevantes**

- Pedido
- PedidoDetalle
- Venta/VentaDetalle según diseño final del flujo
- ProductosServiciosExistencias
- ProductosServiciosMovimientosInventario
- mecanismo de Compromiso/Reserva

**Usuarios/Responsables**

- Vendedor
- usuario autorizado de surtimiento
- Administración
- Supervisor cuando aplique

**Dependencias**

COM-060
COM-064
COM-093

**Criterios de aceptación**

Pedido:

946 ml
Pedida = 10
Surtida = 0
Pendiente = 10

Preparar:

4

Antes de confirmar:

sin cambios físicos.

Confirmar:

Surtida acumulada = 4
Pendiente = 6

y se generan los efectos físicos correspondientes una sola vez.

======================================================================

#### COM-095 — SURTIMIENTO PARCIAL Y MÚLTIPLES OPERACIONES

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir atender un Pedido mediante varias operaciones sin perder el
pendiente ni duplicar cantidades.

**Funcionalidad**

Ejemplo obligatorio:

Pedido:

946 ml = 10

Surtimiento 1:

4

Resultado:

Surtida acumulada = 4
Pendiente = 6

Surtimiento 2:

3

Resultado:

Surtida acumulada = 7
Pendiente = 3

Surtimiento 3:

3

Resultado:

Surtida acumulada = 10
Pendiente = 0

Cada operación debe permanecer trazable.

**Reglas**

- Una operación no sobrescribe la anterior.
- El acumulado proviene de operaciones válidas.
- No editar manualmente el acumulado como fuente de verdad.
- No permitir acumulado mayor a cantidad pedida.
- Variantes mantienen pendientes independientes.
- Producto simple continúa funcionando.
- Un Pedido puede estar parcialmente surtido.
- Pendiente 0 representa partida completamente surtida.
- Servicios pueden seguir pendientes aunque productos hayan terminado.

**Dependencias**

COM-064
COM-094

**Decisión relacionada**

PO-010

**Criterios de aceptación**

Secuencia:

10
→ surtir 4
→ surtir 3
→ surtir 3

produce:

4
→ 7
→ 10 acumulado

y:

6
→ 3
→ 0 pendiente.

Las tres operaciones permanecen trazables.

======================================================================

#### COM-096 — SALIDA DE INVENTARIO POR SURTIMIENTO

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Registrar la disminución física de inventario correspondiente a la
mercancía realmente surtida.

**Funcionalidad**

Cada partida inventariable confirmada debe generar un movimiento de salida
con:

- empresa;
- sucursal según PO-001;
- producto;
- variante nullable;
- cantidad;
- tipo de movimiento;
- Pedido/Venta/Surtimiento origen según arquitectura final;
- detalle origen;
- usuario;
- fecha.

Regla física:

Existencia física nueva =
Existencia física anterior - Cantidad surtida.

**Reglas**

- Pedido confirmado por sí solo NO disminuye Física.
- Preparación de surtimiento NO disminuye Física.
- Confirmación SÍ disminuye Física.
- Producto simple utiliza variante NULL.
- Producto con variantes disminuye variante exacta.
- Servicio NO genera movimiento de salida.
- Flete NO genera movimiento.
- No utilizar existencia de otra variante.
- Movimiento debe aparecer en Kardex.
- Mantener idempotencia documental.

**Tablas/Componentes relevantes**

- ProductosServiciosExistencias
- ProductosServiciosMovimientosInventario
- PedidoDetalle
- documento de surtimiento/venta definido

**Dependencias**

COM-011
COM-012
COM-094

**Criterios de aceptación**

Inicial:

946 ml Física = 10
5 L Física = 3

Surtir:

946 ml = 4

Resultado:

946 ml Física = 6
5 L Física = 3

Kardex:

Salida 4
Variante 946 ml
Origen rastreable.

======================================================================

**Decisión relacionada**

PO-001

#### COM-097 — LIBERAR COMPROMISO AL SURTIR

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Evitar que una cantidad ya surtida continúe apareciendo como reservada.

**Funcionalidad**

Al surtir una cantidad comprometida:

disminuir Comprometida por la cantidad atendida.

Ejemplo:

Antes:

Física = 10
Comprometida = 6
Disponible = 4

Surtir:

4

Después:

Física = 6
Comprometida = 2
Disponible = 4

La operación consume Física y Compromiso simultáneamente en la dimensión
correcta.

**Reglas**

- Liberar únicamente el compromiso relacionado con la cantidad surtida.
- No liberar compromiso de otra variante.
- No liberar todo si sólo se surtió parcialmente.
- Servicio no tiene compromiso físico.
- La operación debe quedar relacionada con el Pedido.
- No liberar dos veces por reintento.
- Disponible debe recalcularse con la regla vigente.
- Si PO-003 permitió un Pedido sin compromiso completo, liberar únicamente
  el compromiso realmente existente.

**Dependencias**

COM-060
COM-061
COM-094
COM-096

**Criterios de aceptación**

Antes:

946 ml
Física = 10
Comprometida = 6
Disponible = 4

Surtir 4:

Física = 6
Comprometida = 2
Disponible = 4.

Otra variante:

sin cambios.

======================================================================

**Decisión relacionada**

PO-003

#### COM-098 — ACTUALIZAR PEDIDO DESPUÉS DEL SURTIMIENTO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Mantener el Pedido sincronizado con lo realmente atendido.

**Funcionalidad**

Después de cada operación confirmada actualizar/derivar:

- cantidad pedida;
- cantidad surtida acumulada;
- cantidad pendiente;
- condición de cada partida;
- condición global del Pedido.

Ejemplo:

Pedido con dos partidas:

A:
Pedida 10
Surtida 10
Pendiente 0

B:
Pedida 5
Surtida 2
Pendiente 3

Resultado global:

Pedido parcialmente surtido.

Sólo cuando las reglas aplicables indiquen que todas las partidas
relevantes están atendidas:

Pedido puede quedar Surtido.

**Reglas**

- No marcar Pedido completo si quedan productos pendientes.
- Servicios deben considerarse conforme a su regla operativa.
- No borrar partidas atendidas.
- No sobrescribir historia de surtimientos.
- Cancelar remanente posteriormente debe respetar COM-063.
- Estado debe derivarse de operaciones reales.
- Reintento no incrementa nuevamente Surtida acumulada.

**Dependencias**

COM-057
COM-064
COM-095
COM-097

**Decisión relacionada**

PO-011

**Criterios de aceptación**

Partida A:
Pendiente 0.

Partida B:
Pendiente 3.

Resultado:

Pedido NO aparece totalmente surtido.

Después de atender B:

Pendiente 0.

Resultado:

Pedido puede pasar a condición final según reglas del Servicio/Flete.

======================================================================

#### COM-099 — IDEMPOTENCIA DEL SURTIMIENTO Y EFECTO FÍSICO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Garantizar que una misma operación no disminuya inventario ni compromiso
más de una vez.

**Funcionalidad**

La operación confirmada debe tener identidad documental suficiente para
detectar que ya fue aplicada.

Debe proteger simultáneamente:

- cantidad surtida;
- movimiento de salida;
- existencia física;
- compromiso;
- pendiente del Pedido.

**Reglas**

Confirmar una vez:

aplica efecto.

F5:

NO repite efecto.

Doble clic:

NO repite efecto.

Reintento:

NO repite efecto.

Si ocurre un fallo:

no debe quedar:

movimiento sin actualización de Pedido

ni:

Pedido actualizado sin movimiento físico correspondiente.

La operación debe ser consistente desde la perspectiva del negocio.

**Dependencias**

COM-012
COM-038 como referencia del patrón de idempotencia documental
COM-094
COM-096
COM-097
COM-098

**Criterios de aceptación**

Inicial:

Física = 10
Comprometida = 6
Pendiente Pedido = 6

Confirmar surtimiento 4:

Física = 6
Comprometida = 2
Pendiente = 2.

Reintentar la misma operación:

Física = 6
Comprometida = 2
Pendiente = 2.

Kardex:

un solo movimiento válido de salida 4.

#### COM-100 — CHECKOUT DE VENTA

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Crear el punto de revisión final donde el Cajero confirma qué se está
cobrando antes de registrar el pago.

**Funcionalidad**

El Checkout debe mostrar como mínimo:

- Pedido origen;
- Venta;
- cliente;
- sucursal;
- Vendedor;
- Cajero;
- productos;
- variantes;
- servicios;
- Flete;
- cantidades;
- precios;
- subtotal;
- total;
- saldo por cobrar;
- Formas de Pago habilitadas para la Sucursal.

Debe diferenciar claramente:

QUIÉN VENDIÓ
vs
QUIÉN ESTÁ COBRANDO.

**Reglas**

- Checkout NO modifica nuevamente el inventario.
- El efecto físico pertenece al surtimiento confirmado.
- No permitir cobrar una cantidad diferente del saldo válido sin una regla
  comercial explícita.
- Sólo mostrar Formas de Pago habilitadas para la Sucursal.
- Forma de Pago inactiva no aparece.
- Respetar Caja y sesión activa cuando la política lo requiera.
- Aplicar PO-006 si asistencia es requisito para Cajero.
- Producto/variante deben conservar identidad documental.
- Servicio y Flete forman parte del importe sin generar stock.
- No permitir que una recarga duplique el Cobro.

**Tablas/Componentes relevantes**

- Venta
- VentaDetalle
- Pedido
- Forma de Pago
- configuración Sucursal/FormaPago
- Caja
- Sesión de Caja

**Usuarios/Responsables**

- Cajero
- Vendedor como responsable comercial visible
- Administración
- Supervisor cuando corresponda

**Dependencias**

COM-070
COM-077
COM-088
COM-089
COM-099

**Criterios de aceptación**

Venta:

Producto = 1,000
Servicio = 200
Flete = 100

Total:

1,300.

Checkout:

muestra total 1,300.

Vendedor:

A.

Cajero:

B.

Sucursal:

Centro.

Sólo aparecen Formas de Pago habilitadas para Centro.

Inventario:

NO cambia por abrir Checkout.

======================================================================

**Decisión relacionada**

PO-006, PO-009, PO-010

#### COM-101 — COBRO CON UNA FORMA DE PAGO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir liquidar una Venta utilizando una sola Forma de Pago.

**Funcionalidad**

El Cajero debe poder seleccionar una Forma de Pago habilitada y capturar
la información requerida por dicha forma.

Ejemplos:

EFECTIVO:

- importe recibido;
- cambio.

TRANSFERENCIA:

- importe;
- referencia cuando aplique.

TARJETA:

- importe;
- referencia/autorización permitida por la política.

El Cobro debe conservar:

- Venta;
- Caja;
- sesión;
- Cajero;
- Forma de Pago;
- importe;
- referencia;
- fecha/hora.

**Reglas**

- Importe aplicado debe ser \> 0.
- No utilizar Forma de Pago inactiva.
- No utilizar Forma de Pago deshabilitada para la Sucursal.
- No guardar datos sensibles innecesarios de tarjeta.
- Cobro confirmado debe ser trazable.
- Cobro NO genera una segunda salida de inventario.
- El mismo Cobro no puede confirmarse dos veces.
- Efectivo puede calcular cambio.
- El cambio NO es importe adicional de Venta.

**Tablas/Componentes relevantes**

Entidades conceptuales:

- Cobro
- CobroDetalle o aplicación de pago según diseño

Relacionadas con:

- Venta
- Forma de Pago
- Caja
- Sesión de Caja
- Usuario/Cajero

**Usuarios/Responsables**

- Cajero
- Administración
- Supervisor según permisos

**Dependencias**

COM-071
COM-075
COM-100

**Criterios de aceptación**

Venta:

Total = 1,000.

Forma:

Efectivo.

Cliente entrega:

1,200.

Resultado:

Cobro aplicado = 1,000.
Cambio = 200.
Saldo por cobrar = 0.

Movimiento de Caja:

refleja 1,000 como efecto comercial correspondiente, según modelo
autorizado.

No genera movimiento de inventario adicional.

======================================================================

#### COM-102 — COBRO CON MÚLTIPLES FORMAS DE PAGO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir dividir el total de una Venta entre varios medios de pago.

**Funcionalidad**

Ejemplo:

Venta total:

1,500.

Cliente paga:

Efectivo = 500
Tarjeta = 700
Transferencia = 300

Total aplicado:

1,500.

El sistema debe conservar cada aplicación individual.

**Reglas**

- Suma de aplicaciones debe coincidir con el importe cobrado.
- No perder el detalle de cada Forma de Pago.
- Cada forma aplica sus propias validaciones.
- Sólo usar formas habilitadas en la Sucursal.
- No fusionar todas las formas en un texto libre.
- El Ticket debe poder mostrar el desglose posteriormente.
- Caja debe distinguir efectivo de medios no efectivos.
- NC/Vale podrán participar posteriormente según Sprint 8.
- No fingir saldo de NC/Vale antes de que exista.

**Tablas/Componentes relevantes**

- Cobro
- aplicaciones/detalle de Cobro
- Forma de Pago
- Venta
- Caja

**Usuarios/Responsables**

- Cajero
- Administración

**Dependencias**

COM-101

**Criterios de aceptación**

Venta:

1,500.

Aplicaciones:

500 efectivo
700 tarjeta
300 transferencia

Resultado:

Total aplicado = 1,500.
Saldo = 0.

Caja:

Efectivo físico aumenta sólo por la porción correspondiente al efectivo.

Las tres aplicaciones permanecen consultables.

======================================================================

#### COM-103 — VALIDACIÓN DEL TOTAL COBRADO Y SALDO

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Evitar Ventas marcadas como pagadas cuando las aplicaciones no cubren el
importe requerido.

**Funcionalidad**

Calcular:

Total Venta
- Pagos aplicados
= Saldo por cobrar.

Debe distinguir conceptualmente:

PENDIENTE
PARCIALMENTE PAGADA
PAGADA

si el negocio permite pagos parciales.

**Reglas**

- No marcar Pagada si saldo \> 0.
- No permitir sobreaplicación salvo comportamiento específico como
  efectivo/cambio.
- El cambio no se considera saldo a favor automático.
- No generar Vale automáticamente por entregar efectivo de más.
- Múltiples formas deben sumar correctamente.
- No alterar Total Venta para hacer cuadrar el Cobro.
- La política de pagos parciales debe definirse explícitamente.

**Usuarios/Responsables**

- Cajero
- Administración
- Supervisor cuando corresponda

**Dependencias**

COM-101
COM-102

**Decisión PO pendiente**

PO-007 — Pago parcial de Venta.

Definir:

A. Venta debe liquidarse completamente en Checkout.

B. Se permiten pagos parciales y saldo pendiente.

No confundir esta decisión con:

Pedido parcialmente surtido.

Son conceptos diferentes.

**Criterios de aceptación**

CASO A:

Venta = 1,000.
Aplicado = 1,000.

Saldo = 0.
Pagada.

CASO B:

Venta = 1,000.
Aplicado = 700.

Resultado:

aplica PO-007.

Nunca debe mostrarse Pagada con saldo 300.

======================================================================

**Decisión relacionada**

PO-007

#### COM-104 — EFECTO DEL COBRO EN CAJA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Relacionar cada Cobro confirmado con la Caja y sesión responsables.

**Funcionalidad**

Al confirmar un Cobro válido debe generarse el efecto monetario
correspondiente en Caja.

Debe conservar:

- Venta;
- Cobro;
- Caja;
- sesión;
- Cajero;
- Forma de Pago;
- importe;
- fecha/hora;
- referencia.

Ejemplo:

Venta = 1,000.

Pago:

Efectivo = 400.
Tarjeta = 600.

Caja debe registrar:

Total cobrado = 1,000.

Efectivo físico esperado:

+400.

Tarjeta:

+600 como cobro no efectivo.

**Reglas**

- Cobro y movimiento de Caja deben quedar relacionados.
- No duplicar movimiento por reintento.
- No incrementar efectivo físico por Tarjeta/Transferencia.
- No modificar inventario.
- Caja cerrada no debe aceptar Cobros ordinarios.
- Sesión debe corresponder a la Caja/Sucursal válida.
- Cajero debe quedar trazable.
- Reversión futura de Cobro debe generar trazabilidad y no borrar
  silenciosamente el movimiento original.

**Tablas/Componentes relevantes**

- Cobro
- detalle/aplicaciones Cobro
- Caja
- Sesión Caja
- Movimiento Caja
- Venta

**Dependencias**

COM-075
COM-077
COM-101
COM-102
COM-103

**Decisión relacionada**

PO-009

**Criterios de aceptación**

Efectivo 400:
afecta efectivo esperado +400.

Tarjeta 600:
queda como cobro 600, pero NO suma 600 al efectivo físico.

Total cobrado:
1,000.

Todos los movimientos pueden rastrearse a la misma Venta.

======================================================================

#### COM-105 — IDEMPOTENCIA DEL COBRO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Garantizar que una misma confirmación no cobre dos veces ni duplique Caja.

**Funcionalidad**

La confirmación debe proteger conjuntamente:

- Cobro;
- aplicaciones de pago;
- saldo de Venta;
- movimiento(s) de Caja;
- estado de pago.

**Reglas**

Confirmar una vez:

aplica Cobro.

Doble clic:

NO duplica.

F5:

NO duplica.

Reintento:

NO duplica.

Si falla el movimiento de Caja:

no debe quedar un Cobro marcado como completamente aplicado con Caja
incoherente.

Si falla el Cobro:

no debe quedar movimiento huérfano de Caja.

La operación debe conservar una identidad documental estable.

**Dependencias**

COM-012 como patrón general de idempotencia
COM-038 como patrón de Recepción
COM-099 como patrón de Surtimiento
COM-104

**Criterios de aceptación**

Venta:

1,000.

Confirmar Cobro:

1,000.

Resultado:

Saldo = 0.
Un Cobro.
Un conjunto válido de movimientos de Caja.

Reintentar:

Saldo continúa = 0.

NO existe segundo Cobro de 1,000.

NO existe segundo efecto monetario.

#### COM-106 — TICKET / COMPROBANTE DE VENTA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Generar el comprobante comercial de la Venta conservando la información
necesaria para cliente, operación, Cobro y futura Devolución.

**Funcionalidad**

Una Venta cobrada según la política vigente debe poder generar un Ticket
que muestre como mínimo:

- folio de Venta/Ticket;
- fecha/hora;
- Sucursal;
- cliente cuando corresponda;
- Vendedor;
- Cajero;
- productos;
- variantes;
- servicios;
- Flete;
- cantidades;
- precio;
- importe;
- subtotal;
- total;
- Formas de Pago;
- importes por Forma de Pago;
- cambio cuando aplique;
- información comercial necesaria para Devolución.

Debe contemplar:

- visualización;
- impresión/descarga según infraestructura autorizada;
- reimpresión sin generar una nueva Venta.

**Reglas**

- Ticket NO genera una segunda Venta.
- Reimprimir NO genera un segundo Cobro.
- Reimprimir NO modifica inventario.
- Producto con variantes debe mostrar variante.
- Producto simple no muestra una variante artificial.
- Servicio debe identificarse como Servicio.
- Flete debe aparecer cuando forme parte de la Venta.
- Múltiples Formas de Pago deben mostrarse separadas.
- No mostrar información sensible innecesaria de Tarjeta.
- El Ticket debe permitir identificar posteriormente la Venta origen de
  una Devolución.
- La numeración/folio debe seguir una estrategia autorizada y trazable.

**Tablas/Componentes relevantes**

- Venta
- VentaDetalle
- Cobro
- aplicaciones de Cobro
- Forma de Pago
- Pedido
- Sucursal
- Usuario/Vendedor
- Usuario/Cajero
- infraestructura PDF/impresión reutilizable cuando corresponda

**Usuarios/Responsables**

- Cajero
- Vendedor
- Cliente como receptor del documento
- Administración

**Dependencias**

COM-089
COM-102
COM-103
COM-105

**Decisión relacionada**

PO-010, PO-011

**Criterios de aceptación**

Venta:

Aceite / 946 ml = 2
Servicio Instalación = 1
Flete = 200

Pago:

Efectivo = 500
Tarjeta = resto

Ticket:

- muestra 946 ml;
- muestra Servicio;
- muestra Flete;
- muestra ambas Formas de Pago;
- identifica Vendedor;
- identifica Cajero.

Reimprimir:

NO modifica Venta,
NO modifica Cobro,
NO modifica Caja,
NO modifica inventario.

======================================================================

#### COM-107 — ESTADO Y CIERRE FUNCIONAL DE LA VENTA

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Definir cuándo una Venta está operativamente terminada y cuándo todavía
requiere una acción posterior.

**Funcionalidad**

La Venta debe distinguir condiciones como:

- En proceso;
- pendiente de Cobro cuando PO-007 permita saldo;
- pagada;
- cancelada/revertida únicamente mediante proceso autorizado;
- con Devolución parcial/total posteriormente.

Los nombres físicos definitivos deben ajustarse al diseño técnico.

**Reglas**

- Venta pagada requiere saldo de Cobro = 0.
- Si PO-007 no permite pagos parciales, la Venta debe liquidarse según la
  política antes de considerarse cerrada.
- Si PO-007 permite pagos parciales, debe conservar saldo pendiente.
- No marcar Pagada sólo porque exista un Cobro parcial.
- Venta cerrada conserva Pedido origen.
- Venta cerrada conserva Surtimientos.
- Venta cerrada conserva movimientos de inventario.
- Cancelar una Venta ya surtida/cobrada NO puede resolverse mediante
  DELETE.
- Correcciones posteriores deben utilizar reversión/devolución según el
  proceso correspondiente.
- Devolución en Sprint 8 NO debe borrar la Venta original.

**Usuarios/Responsables**

- Cajero
- Vendedor
- Administración
- Supervisor/autorizador

**Dependencias**

COM-099
COM-103
COM-105
COM-106

**Criterios de aceptación**

Venta total:

1,000.

Cobro:

1,000.

Saldo:

0.

Resultado:

Pagada/cerrada según modelo.

Venta:

1,000.

Cobro:

700.

Resultado:

aplica PO-007.

Nunca aparece Pagada con saldo 300.

======================================================================

**Decisión relacionada**

PO-007

#### COM-108 — SERVICIOS Y PARTICIPANTES EN LA VENTA

**Prioridad:** P1

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Conservar en la Venta la información de Servicios y responsables
operativos sin crear movimientos de inventario inexistentes.

**Funcionalidad**

Cuando el Pedido incluya un Servicio, la Venta debe conservar cuando
corresponda:

- Servicio;
- descripción;
- precio;
- información de instalación/ejecución;
- Operador sugerido;
- Operador asignado;
- Ayudante(s);
- estado operativo del Servicio;
- observaciones.

Debe poder distinguir:

Producto surtido
vs
Servicio ejecutado/pendiente.

**Reglas**

- Servicio NO genera salida de inventario.
- Servicio NO libera compromiso físico porque nunca lo generó.
- Operador/Ayudante deben respetar Sprint 0.
- Ayudante continúa sin Login cuando así esté definido.
- Asistencia se consulta/aplica conforme PO-006.
- Vender/cobrar un Servicio NO significa automáticamente que fue
  físicamente ejecutado.
- Debe conservarse la posibilidad de ejecución posterior si el negocio lo
  requiere.
- No marcar instalación completada sólo por emitir Ticket.

**Tablas/Componentes relevantes**

- Pedido
- PedidoDetalle
- Venta
- VentaDetalle
- Operadores
- Participantes/Ayudantes
- Asistencia cuando aplique

**Usuarios/Responsables**

- Vendedor
- Cajero
- Operador
- Ayudante
- Administración

**Dependencias**

COM-065
COM-066
COM-087
COM-089

**Criterios de aceptación**

Pedido:

Producto A
+
Servicio Instalación.

Venta:

Producto A genera su efecto físico.

Servicio:

NO genera movimiento de inventario.

Operador/Ayudante:

permanecen identificables.

Cobrar el Servicio:

NO lo marca automáticamente como ejecutado.

======================================================================

**Decisión relacionada**

PO-006, PO-011

#### COM-109 — TRAZABILIDAD INTEGRAL PEDIDO → VENTA → COBRO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Garantizar que toda operación pueda recorrerse de origen a destino y de
destino a origen.

**Funcionalidad**

Debe ser posible navegar conceptualmente:

Cotización
→ Pedido
→ Surtimiento
→ Venta
→ Cobro
→ Movimiento Caja
→ Ticket

y para productos:

Pedido
→ Surtimiento
→ Movimiento Inventario
→ Kardex.

También debe ser posible consultar en sentido inverso.

Ejemplo:

Ticket
→ Venta
→ Pedido
→ Cotización.

Movimiento de inventario
→ Surtimiento/Venta
→ Pedido.

Movimiento de Caja
→ Cobro
→ Venta.

**Reglas**

- Usar IDs internos estables para relaciones.
- Folios/códigos son referencias visibles, no sustitutos de PK.
- No perder variante.
- No perder Vendedor.
- No perder Cajero.
- No perder Caja/Sesión.
- No perder Sucursal.
- No perder documento origen.
- Históricos permanecen aunque catálogos se inactiven.
- No crear relaciones por nombre textual cuando exista ID.
- La trazabilidad debe funcionar sin depender de NEXT.

**Dependencias**

COM-024
COM-040
COM-058
COM-077
COM-099
COM-105
COM-106

**Criterios de aceptación**

Desde Ticket:

identificar Venta.

Desde Venta:

identificar Pedido.

Desde Pedido:

identificar Cotización.

Desde Venta:

identificar Vendedor y Cajero.

Desde Cobro:

identificar Caja/Sesión.

Desde movimiento de inventario:

identificar la operación que produjo la salida.

Variante:

permanece igual durante todo el flujo.

======================================================================

#### COM-110 — CERTIFICACIÓN E2E DE VENTA, SURTIMIENTO Y COBRO

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Cerrar Sprint 7 demostrando el ciclo comercial desde Pedido hasta Ticket.

**Funcionalidad**

Certificar:

- selección de Pedido;
- producto simple;
- producto con variante;
- Servicio;
- Flete;
- surtimiento parcial;
- múltiples surtimientos;
- salida de inventario;
- liberación de compromiso;
- Disponible;
- Venta;
- Vendedor;
- Cajero;
- Checkout;
- Forma de Pago;
- múltiples Formas de Pago;
- Caja;
- pago parcial según PO-007;
- Ticket;
- trazabilidad;
- idempotencia.

**Reglas**

La certificación debe ser funcional E2E.

NO certificar únicamente:

- build;
- endpoints;
- revisión de código.

Debe verificarse la coherencia entre:

Pedido
Inventario
Compromiso
Venta
Cobro
Caja
Ticket.

**Usuarios/Responsables**

- Product Owner
- Vendedor
- Cajero
- Administración
- Operador/Ayudante cuando aplique
- Supervisor/autorizador

**Dependencias**

COM-089 a COM-109

**Criterios de aceptación**

- Pedido válido abre para Venta;
- pendiente correcto;
- variante correcta;
- surtimiento parcial correcto;
- Física disminuye;
- Comprometida disminuye;
- Disponible correcto;
- otra variante permanece intacta;
- Venta creada una sola vez;
- Cobro creado una sola vez;
- Caja recibe efecto una sola vez;
- múltiples pagos cuadran;
- Ticket coincide con Venta;
- Vendedor != Cajero cuando corresponda;
- Servicio no genera salida;
- Flete no genera salida;
- trazabilidad completa;
- 0 doble movimiento por reintento;
- 0 doble Cobro por reintento.

**Decisión relacionada**

PO-007

### S8 — Postventa

**Qué entrega:** 20 tickets, de COM-111 a COM-130.

#### COM-111 — MODELO FUNCIONAL DE DEVOLUCIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Crear Devolución como documento propio relacionado con una Venta
existente.

**Funcionalidad**

La Devolución debe contener conceptualmente:

CABECERA:

- empresa;
- sucursal;
- Venta origen;
- Ticket/folio visible;
- cliente cuando corresponda;
- fecha/hora;
- usuario captura;
- responsable;
- autorizador cuando aplique;
- motivo general;
- estado;
- observaciones.

DETALLE:

- VentaDetalle origen;
- producto;
- variante nullable;
- servicio cuando la política permita algún tratamiento;
- cantidad vendida;
- cantidad devuelta previamente;
- cantidad disponible para devolver;
- cantidad a devolver;
- precio/importe documental;
- motivo;
- condición de reingreso.

**Reglas**

- Devolución es documento distinto de Venta.
- Venta original permanece intacta.
- No borrar Venta para representar una Devolución.
- Toda partida debe provenir de una Venta válida.
- Producto simple utiliza variante NULL.
- Producto con variantes conserva variante exacta.
- No devolver una variante distinta.
- No inventar una Venta origen.
- Mantener empresa y sucursal.
- Mantener multitenant.
- Debe quedar preparada para devolución parcial.
- Debe quedar preparada para reingreso o no reingreso.
- Debe quedar preparada para NC/Vale.

**Tablas/Componentes relevantes**

Entidades conceptuales nuevas:

- Devolución
- DevoluciónDetalle

Relacionadas con:

- Venta
- VentaDetalle
- Ticket
- ProductosServicios
- ProductosServiciosVariantes
- Usuario
- Sucursal

NO declarar nombres físicos definitivos sin diseño técnico.

**Usuarios/Responsables**

- Cajero
- Vendedor según permisos
- Administración
- Supervisor/autorizador

**Dependencias**

COM-004
COM-007
COM-079
COM-110

**Criterios de aceptación**

- Devolución tiene Venta origen;
- Ticket/folio rastreable;
- detalle conserva VentaDetalle;
- producto simple soportado;
- variante soportada;
- cantidad original visible;
- cantidad ya devuelta visible;
- cantidad disponible visible;
- motivo registrable;
- responsable identificable;
- Venta original permanece consultable.

======================================================================

#### COM-112 — LOCALIZAR VENTA Y VALIDAR ELEGIBILIDAD DE DEVOLUCIÓN

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Evitar devoluciones sobre operaciones inexistentes, fuera de política o
sin saldo devolvible.

**Funcionalidad**

Permitir localizar una Venta mediante criterios como:

- Ticket;
- folio Venta;
- cliente;
- fecha;
- Sucursal.

Después evaluar:

- Venta válida;
- fecha de Venta;
- política de días de devolución;
- Sucursal;
- estado de Venta;
- partidas disponibles;
- cantidades ya devueltas.

**Reglas**

- Aplicar PO-005 para determinar qué política temporal de devolución
  corresponde.
- No modificar fecha de Venta.
- No permitir devolución de una Venta inexistente.
- No permitir devolver una partida que ya fue devuelta completamente.
- Una devolución previa reduce la cantidad disponible.
- No usar cantidades de otra variante.
- No utilizar otra Sucursal para evadir la política.
- Excepciones fuera de plazo requieren una regla/autorización explícita,
  no manipulación de fechas.

**Usuarios/Responsables**

- Cajero
- Administración
- Supervisor/autorizador
- Vendedor como consulta cuando corresponda

**Dependencias**

COM-079
COM-107
COM-111

**Criterios de aceptación**

CASO A:

Venta dentro del plazo.

Resultado:

elegible.

CASO B:

Venta fuera del plazo.

Resultado:

bloqueada o enviada a autorización según política definida.

CASO C:

Partida vendida = 5.
Ya devuelta = 5.

Resultado:

disponible para devolver = 0.

CASO D:

Variante 946 ml vendida.

No permite utilizar una partida de 5 L como origen.

======================================================================

**Decisión relacionada**

PO-005

#### COM-113 — MOTIVOS DE DEVOLUCIÓN

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Registrar por qué se está devolviendo una Venta o partida y utilizar esa
información para trazabilidad y reportes.

**Funcionalidad**

Definir/reutilizar un catálogo controlado de motivos cuando resulte
apropiado.

Ejemplos conceptuales:

- producto defectuoso;
- producto incorrecto;
- error de surtimiento;
- cambio solicitado;
- daño;
- otros autorizados.

Debe permitir observación adicional cuando corresponda.

**Reglas**

- Auditar si existe catálogo autorizado antes de crear uno nuevo.
- No depender únicamente de texto libre si el negocio requiere reportar
  motivos.
- Un motivo inactivo no aparece en operaciones nuevas.
- Históricos conservan su motivo.
- Motivo puede influir posteriormente en:
  reingreso;
  autorización;
  reportes.
- No asumir automáticamente que todo producto devuelto reingresa.
- NEXT queda fuera.

**Tablas/Componentes relevantes**

- catálogo actual si existe y es reutilizable;
o
- entidad conceptual MotivoDevolución.

**Usuarios/Responsables**

- Cajero
- Administración
- Supervisor

**Dependencias**

COM-111

**Criterios de aceptación**

- motivo seleccionable;
- observación disponible cuando aplique;
- motivo persiste;
- histórico conserva motivo aunque se inactive;
- preparado para reportes y regla de reingreso.

======================================================================

#### COM-114 — DEVOLUCIÓN PARCIAL POR PARTIDA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir devolver una cantidad menor a la vendida sin invalidar toda la
Venta.

**Funcionalidad**

Ejemplo:

Venta:

Aceite / 946 ml
Cantidad vendida = 5

Primera Devolución:

2

Resultado:

Devuelto acumulado = 2
Disponible para devolver = 3

Segunda Devolución:

1

Resultado:

Devuelto acumulado = 3
Disponible = 2

La Venta original permanece con su cantidad histórica vendida.

**Reglas**

- Cantidad a devolver \> 0.
- Cantidad a devolver \<= disponible.
- No modificar cantidad vendida original.
- Acumulado proviene de Devoluciones válidas.
- No editar acumulado manualmente como fuente de verdad.
- Múltiples Devoluciones deben conservarse como documentos independientes.
- Variante debe permanecer exacta.
- No mezclar cantidades entre variantes.
- No permitir acumulado devuelto mayor a cantidad vendida.
- La devolución parcial no implica cancelar toda la Venta.

**Dependencias**

COM-111
COM-112

**Criterios de aceptación**

Vendida:

5.

Devolver:

2.

Resultado:

Disponible = 3.

Devolver posteriormente:

1.

Resultado:

Disponible = 2.

Ambas Devoluciones permanecen consultables.

Venta original:

continúa mostrando 5 vendidas históricamente.

======================================================================

#### COM-115 — DEVOLUCIÓN TOTAL Y CONTROL DE CANTIDAD DEVOLVIBLE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir devolver todo el remanente disponible sin exceder lo realmente
vendido.

**Funcionalidad**

La operación debe calcular:

Cantidad disponible para devolver =
Cantidad vendida
- Cantidad devuelta acumulada válida.

Ejemplo:

Vendida = 5
Devuelta previamente = 2
Disponible = 3

Devolver ahora = 3

Resultado:

Devuelta acumulada = 5
Disponible = 0.

**Reglas**

- No permitir devolución \> disponible.
- No permitir cantidad negativa/cero.
- Producto con variantes evalúa variante exacta.
- Producto simple usa variante NULL.
- No utilizar cantidad de otra Venta.
- No utilizar cantidad de otra partida.
- Devolver completamente una partida NO borra VentaDetalle.
- El documento debe conservar historia.
- El efecto en inventario se resolverá en el bloque de reingreso a inventario de Sprint 8.
- La resolución económica se resolverá en el bloque de Nota de Crédito/Vale de Sprint 8.

**Dependencias**

COM-112
COM-114

**Criterios de aceptación**

Vendida:

5.

Devuelta acumulada:

2.

Intentar devolver:

4.

Resultado:

NO permitido.

Devolver:

3.

Resultado:

Acumulada = 5.
Disponible = 0.

Nueva devolución de esa partida:

NO permitida.

#### COM-116 — CLASIFICAR DEVOLUCIÓN REINGRESABLE / NO REINGRESABLE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Determinar si la mercancía devuelta puede volver a formar parte de la
existencia disponible.

**Funcionalidad**

Cada partida física devuelta debe poder clasificarse como mínimo en:

A. REINGRESABLE

El producto vuelve físicamente al inventario.

B. NO REINGRESABLE

El producto fue devuelto, pero NO vuelve a existencia vendible.

La clasificación debe considerar cuando corresponda:

- motivo de devolución;
- condición física;
- producto;
- variante;
- observaciones;
- usuario que revisa;
- autorización.

**Reglas**

- Devolver un producto NO significa automáticamente reingresarlo.
- Producto defectuoso/dañado puede requerir NO reingreso.
- Error de surtimiento con producto íntegro puede permitir reingreso.
- La clasificación debe ser explícita.
- No inferir reingreso únicamente por el motivo si requiere revisión.
- Producto con variantes conserva variante exacta.
- Servicio NO reingresa a inventario.
- Flete NO reingresa a inventario.
- La resolución económica es independiente del reingreso físico.
- Un producto puede generar NC/Vale aunque no sea reingresable, según las
  reglas de resolución económica.
- Operaciones sensibles pueden requerir autorización según COM-007.

**Tablas/Componentes relevantes**

- Devolución
- DevoluciónDetalle
- MotivoDevolución
- ProductosServicios
- ProductosServiciosVariantes
- futura integración con Inventario

**Usuarios/Responsables**

- Cajero
- Administración
- responsable de inventario
- Supervisor/autorizador cuando corresponda

**Dependencias**

COM-007
COM-113
COM-114
COM-115

**Criterios de aceptación**

CASO A:

Producto íntegro devuelto por error de surtimiento.

Clasificación:

REINGRESABLE.

CASO B:

Producto dañado.

Clasificación:

NO REINGRESABLE.

CASO C:

Servicio.

Resultado:

NO aplica reingreso físico.

La clasificación queda trazable y no modifica inventario hasta confirmar
el efecto correspondiente.

======================================================================

#### COM-117 — REINGRESO DE PRODUCTO DEVUELTO AL INVENTARIO

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Aumentar la existencia física únicamente cuando una devolución válida haya
sido clasificada como reingresable.

**Funcionalidad**

Al confirmar el reingreso:

Existencia física nueva =
Existencia física anterior + Cantidad devuelta reingresable.

Debe conservar:

- empresa;
- sucursal según PO-001;
- producto;
- variante nullable;
- cantidad;
- Devolución origen;
- DevoluciónDetalle origen;
- usuario;
- fecha.

**Reglas**

- Sólo partidas REINGRESABLES aumentan Física.
- Producto simple utiliza variante NULL.
- Producto con variantes utiliza variante exacta.
- No aumentar Comprometida.
- Disponible se recalcula conforme al modelo de inventario.
- Servicio no genera entrada.
- Flete no genera entrada.
- No modificar directamente el saldo sin movimiento.
- La entrada debe aparecer en Kardex.
- No utilizar una variante diferente porque sea equivalente comercialmente.
- Mantener multitenant.

**Tablas/Componentes relevantes**

- Devolución
- DevoluciónDetalle
- ProductosServiciosExistencias
- ProductosServiciosMovimientosInventario
- ProductosServiciosVariantes

**Usuarios/Responsables**

- Administración
- responsable de inventario
- Cajero cuando el flujo autorizado lo permita
- Supervisor/autorizador cuando corresponda

**Dependencias**

COM-011
COM-012
COM-116

**Criterios de aceptación**

Inicial:

946 ml Física = 6
5 L Física = 3

Devolución reingresable:

946 ml = 2

Resultado:

946 ml Física = 8
5 L Física = 3.

Disponible:

se recalcula.

Kardex:

muestra entrada +2 con origen Devolución.

======================================================================

**Decisión relacionada**

PO-001

#### COM-118 — MOVIMIENTO DE INVENTARIO POR DEVOLUCIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Registrar formalmente el reingreso para mantener la trazabilidad completa
del Kardex.

**Funcionalidad**

Una partida reingresable confirmada debe generar un movimiento de entrada
con:

- empresa;
- sucursal si aplica;
- producto;
- variante;
- cantidad;
- tipo = devolución/reingreso;
- documento origen = Devolución;
- detalle origen;
- usuario;
- fecha;
- referencia a Venta original cuando sea útil para trazabilidad.

Cadena esperada:

Venta
→ Devolución
→ Movimiento de entrada
→ Existencia.

**Reglas**

- No generar movimiento para partida NO REINGRESABLE.
- No generar movimiento para Servicio.
- No generar movimiento para Flete.
- Movimiento debe respetar variante exacta.
- No borrar el movimiento de salida original de la Venta.
- El Kardex debe mostrar ambos eventos históricos:

Venta:
Salida.

Devolución reingresable:
Entrada.

- Documento origen debe ser rastreable.
- Aplicar patrón de idempotencia de COM-012.

**Tablas/Componentes relevantes**

- ProductosServiciosMovimientosInventario
- ProductosServiciosExistencias
- Devolución
- DevoluciónDetalle
- Venta
- VentaDetalle

**Dependencias**

COM-012
COM-096
COM-117

**Criterios de aceptación**

Venta original:

Salida 2 de 946 ml.

Devolución posterior reingresable:

Entrada 1 de 946 ml.

Kardex:

muestra:

-2 Venta
+1 Devolución

sin alterar ni eliminar el movimiento original.

======================================================================

#### COM-119 — PRODUCTO DEVUELTO NO REINGRESABLE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Registrar una devolución comercial válida sin aumentar inventario cuando
la mercancía no puede volver a venderse.

**Funcionalidad**

Una partida clasificada:

NO REINGRESABLE

debe conservar:

- Venta origen;
- producto;
- variante;
- cantidad;
- motivo;
- condición;
- responsable;
- autorización cuando aplique;
- resolución económica posterior.

Pero:

NO aumenta Existencia Física.

Debe quedar disponible para futuros reportes de:

- daño;
- merma;
- producto defectuoso;
- devolución no reingresable.

**Reglas**

- No aumentar Física.
- No generar movimiento de entrada de existencia vendible.
- No eliminar la salida original de Venta.
- No cambiar variante.
- La devolución económica puede continuar.
- No confundir "no reingresable" con "devolución rechazada".
- Una Devolución puede ser aceptada comercialmente y al mismo tiempo no
  reingresar a stock.
- Si posteriormente se requiere un inventario de merma/cuarentena, debe
  diseñarse mediante ticket específico; NO inventarlo aquí.
- La razón debe quedar trazable.

**Usuarios/Responsables**

- Cajero
- Administración
- responsable de inventario
- Supervisor/autorizador

**Dependencias**

COM-113
COM-116

**Criterios de aceptación**

Venta:

946 ml = 1.

Devolución aceptada:

producto dañado.

Clasificación:

NO REINGRESABLE.

Resultado:

Existencia Física NO aumenta.

Devolución:

permanece válida.

Resolución económica:

puede continuar hacia NC/Vale según reglas posteriores.

======================================================================

#### COM-120 — IDEMPOTENCIA Y REVERSIÓN DEL EFECTO FÍSICO DE DEVOLUCIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Evitar que una misma devolución reingrese mercancía dos veces y permitir
corregir un reingreso erróneo sin borrar historia.

**Funcionalidad**

La confirmación del reingreso debe proteger conjuntamente:

- DevoluciónDetalle;
- movimiento de entrada;
- existencia;
- variante;
- documento origen.

Confirmar una vez:

aplica entrada.

Reintentar:

NO vuelve a aplicar.

Si un reingreso confirmado fue incorrecto y debe revertirse:

generar una corrección trazable según la política autorizada.

**Reglas**

- F5 NO duplica entrada.
- Doble clic NO duplica entrada.
- Reintento NO duplica entrada.
- No borrar movimiento original para corregir.
- Una reversión debe quedar relacionada con el efecto original.
- No revertir dos veces.
- Reversión afecta la misma variante.
- No modificar otra variante.
- Si el stock reingresado ya fue utilizado posteriormente, la reversión
  puede requerir bloqueo/autorización.
- No resolver inconsistencias editando directamente ExistenciaActual.
- La resolución económica NC/Vale NO debe duplicarse por una reversión
  física.

**Tablas/Componentes relevantes**

- Devolución
- DevoluciónDetalle
- ProductosServiciosExistencias
- ProductosServiciosMovimientosInventario

**Usuarios/Responsables**

- Administración
- responsable de inventario
- Supervisor/autorizador

**Dependencias**

COM-007
COM-012
COM-117
COM-118

**Criterios de aceptación**

Inicial:

Física = 6.

Devolución reingresable:

+2.

Resultado:

Física = 8.

Reintentar:

Física continúa = 8.

Kardex:

un único movimiento válido +2.

Reversión autorizada:

movimiento inverso -2.

Física:

6.

Segundo intento de reversión:

NO vuelve a disminuir.

#### COM-121 — RESOLUCIÓN ECONÓMICA DE LA DEVOLUCIÓN

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Definir cómo se resuelve económicamente una Devolución aceptada sin
confundir el efecto monetario con el reingreso físico de mercancía.

**Funcionalidad**

Una Devolución aceptada debe poder tener una resolución económica
explícita.

V6 debe contemplar como mínimo:

- Nota de Crédito;
- Vale;
- otra resolución únicamente si existe una regla comercial autorizada.

Debe conservar:

- Devolución origen;
- Venta origen;
- cliente;
- importe elegible;
- importe resuelto;
- tipo de resolución;
- usuario;
- fecha;
- autorización cuando corresponda.

**Reglas**

- Reingreso físico y resolución económica son procesos distintos.
- Producto REINGRESABLE puede generar resolución económica.
- Producto NO REINGRESABLE también puede generar resolución económica si
  la Devolución fue aceptada.
- No generar automáticamente devolución de efectivo si no existe regla
  autorizada.
- No generar NC y Vale simultáneamente por el mismo importe salvo una
  resolución dividida explícitamente permitida.
- No resolver más importe que el elegible.
- No modificar el total histórico de la Venta.
- No modificar el Cobro histórico para fingir que la Venta nunca ocurrió.
- La resolución debe ser trazable.
- La resolución debe ser idempotente.

**Tablas/Componentes relevantes**

- Devolución
- DevoluciónDetalle
- Venta
- VentaDetalle
- futuras Nota de Crédito
- futuro Vale

**Usuarios/Responsables**

- Cajero
- Administración
- Supervisor/autorizador
- Super Usuario según permisos

**Dependencias**

COM-007
COM-111
COM-115
COM-116
COM-119

**Criterios de aceptación**

Devolución aceptada:

Importe elegible = 500.

Resolución:

NC = 500.

Resultado:

Importe resuelto = 500.
Pendiente económico = 0.

No se modifica el total histórico de Venta.

No se duplica la resolución por reintento.

======================================================================

#### COM-122 — EMISIÓN DE NOTA DE CRÉDITO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Crear una Nota de Crédito como saldo a favor trazable derivado de una
Devolución autorizada.

**Funcionalidad**

La Nota de Crédito debe conservar conceptualmente:

- empresa;
- sucursal;
- cliente;
- Devolución origen;
- Venta origen;
- folio;
- fecha de emisión;
- importe original;
- saldo disponible;
- fecha de vencimiento;
- estado;
- usuario emisor;
- autorizador cuando aplique;
- observaciones.

**Reglas**

- NC es documento propio.
- NC NO borra la Venta.
- NC NO borra el Cobro.
- NC NO modifica inventario.
- El inventario se resolvió independientemente en 13B.
- La vigencia proviene de la política configurada en COM-080.
- La NC debe conservar su fecha de vencimiento propia al emitirse.
- Cambiar después la configuración de vigencia NO modifica una NC ya
  emitida.
- Saldo inicial no puede superar el importe autorizado de la Devolución.
- No emitir dos NC por el mismo importe mediante reintento.
- NC debe relacionarse con cliente.
- NC debe poder aplicarse posteriormente a otra operación.
- Una NC vencida no debe aplicarse a operaciones nuevas.
- Una NC agotada no debe volver a utilizarse.

**Tablas/Componentes relevantes**

Entidad conceptual nueva:

- Nota de Crédito

Relacionada con:

- Devolución
- Venta
- Cliente
- Ajustes PV
- futuras aplicaciones de saldo

**Usuarios/Responsables**

- Administración
- Cajero cuando el proceso lo permita
- Supervisor/autorizador

**Dependencias**

COM-080
COM-121

**Criterios de aceptación**

Devolución:

500.

Emitir NC:

500.

Resultado:

Importe original = 500.
Saldo disponible = 500.
Fecha emisión registrada.
Fecha vencimiento calculada según configuración aplicable.

Reintentar emisión:

NO crea segunda NC equivalente.

======================================================================

#### COM-123 — EMISIÓN DE VALE

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Crear un Vale como mecanismo de saldo a favor diferenciado de Nota de
Crédito.

**Funcionalidad**

El Vale debe conservar conceptualmente:

- empresa;
- sucursal;
- cliente o portador según regla futura autorizada;
- Devolución origen;
- Venta origen;
- folio;
- fecha de emisión;
- importe original;
- saldo disponible;
- fecha de vencimiento;
- estado;
- usuario emisor;
- autorizador;
- observaciones.

**Reglas**

- Vale != Nota de Crédito.
- Vale es documento propio.
- Vale NO modifica inventario.
- Vale NO borra Venta/Cobro.
- Vigencia proviene de COM-081.
- El Vale conserva su fecha de vencimiento propia.
- Cambiar configuración futura no reescribe Vales emitidos.
- No emitir saldo mayor al importe autorizado.
- No duplicar Vale por reintento.
- Vale agotado no puede reutilizarse.
- Vale vencido no puede aplicarse a una operación nueva.
- No convertir automáticamente Vale en efectivo.
- La transferibilidad del Vale NO debe asumirse si no existe regla
  aprobada.

**Usuarios/Responsables**

- Administración
- Cajero cuando corresponda
- Supervisor/autorizador

**Dependencias**

COM-081
COM-121

**Decisión PO pendiente**

PO-008 — Titularidad del Vale.

Definir si el Vale será:

A. ligado obligatoriamente al cliente original;

B. transferible/portador bajo reglas específicas.

No asumir B automáticamente.

**Criterios de aceptación**

Devolución autorizada:

300.

Emitir Vale:

300.

Resultado:

Saldo = 300.
Vigencia propia.
Folio propio.
Origen trazable.

Reintentar:

NO duplica el Vale.

======================================================================

**Decisión relacionada**

PO-008

#### COM-124 — SALDO Y VIGENCIA DE NC / VALE

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Mantener una fuente de verdad para conocer cuánto saldo sigue disponible
y si el documento puede utilizarse.

**Funcionalidad**

Para NC y Vale debe poder determinarse:

- importe original;
- importe aplicado acumulado;
- saldo disponible;
- fecha emisión;
- fecha vencimiento;
- estado.

Regla conceptual:

Saldo disponible =
Importe original - Aplicaciones válidas acumuladas

Estados funcionales mínimos pueden contemplar:

- Disponible;
- Parcialmente utilizado;
- Agotado;
- Vencido;
- Cancelado cuando exista proceso autorizado.

**Reglas**

- No editar manualmente saldo disponible como fuente ordinaria.
- Saldo deriva de aplicaciones válidas.
- No permitir saldo negativo.
- Documento vencido no puede generar nueva aplicación.
- Documento agotado no puede generar nueva aplicación.
- Histórico permanece consultable.
- Cancelación no borra aplicaciones históricas.
- NC utiliza su propia vigencia.
- Vale utiliza su propia vigencia.
- No asumir que ambas vigencias son iguales.
- Mantener empresa/sucursal/cliente según las reglas aplicables.

**Dependencias**

COM-080
COM-081
COM-122
COM-123

**Criterios de aceptación**

NC:

Importe = 500.
Aplicado = 200.
Saldo = 300.

Nueva aplicación máxima:

300.

Vale:

Importe = 300.
Aplicado = 300.
Saldo = 0.
Estado = Agotado.

No permite nueva aplicación.

======================================================================

#### COM-125 — APLICACIÓN PARCIAL Y TOTAL DE NC / VALE

**Prioridad:** P0

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Permitir utilizar una Nota de Crédito o Vale como saldo a favor en una
operación comercial posterior.

**Funcionalidad**

Durante un Checkout futuro, permitir seleccionar un documento válido y
aplicar:

- una parte de su saldo;
o
- todo su saldo disponible.

Ejemplo:

Nueva Venta:

800.

NC disponible:

500.

Aplicar:

300.

Resultado:

Saldo NC = 200.
Saldo Venta pendiente de pago = 500.

Debe poder combinarse posteriormente con otras Formas de Pago.

**Reglas**

- Aplicación \> 0.
- Aplicación \<= saldo disponible.
- Documento debe estar vigente.
- Documento debe estar activo/utilizable.
- NC debe respetar cliente.
- Vale debe respetar PO-008.
- Aplicar saldo NO modifica inventario.
- Aplicación debe quedar relacionada con la nueva Venta/Cobro.
- No duplicar aplicación por reintento.
- La misma aplicación no puede consumirse dos veces.
- Una aplicación parcial conserva saldo remanente.
- Una aplicación total deja saldo 0.
- NC/Vale deben integrarse con el modelo de Formas de Pago de Sprint 5.
- No modificar el importe original del documento.

**Tablas/Componentes relevantes**

Entidades conceptuales:

- Aplicación de NC
- Aplicación de Vale

Relacionadas con:

- NC/Vale
- Venta nueva
- Cobro
- Forma de Pago

**Usuarios/Responsables**

- Cajero
- Administración
- Supervisor cuando aplique

**Dependencias**

COM-069
COM-102
COM-122
COM-123
COM-124

**Criterios de aceptación**

Nueva Venta:

800.

NC:

Saldo = 500.

Aplicar:

300.

Resultado:

NC saldo = 200.
Venta saldo = 500.

Reintentar la misma aplicación:

NO vuelve a descontar 300.

======================================================================

**Decisión relacionada**

PO-008

#### COM-126 — APLICACIÓN POSTERIOR Y COMBINACIÓN CON OTRAS FORMAS DE PAGO

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Completar el ciclo del saldo a favor permitiendo usarlo en una Venta
posterior junto con otros medios de pago.

**Funcionalidad**

Ejemplo:

Venta nueva:

1,000.

Cliente tiene:

NC disponible = 300.

Checkout:

NC = 300
Efectivo = 200
Tarjeta = 500

Resultado:

Total aplicado = 1,000.
Saldo Venta = 0.
Saldo NC = 0.

El Ticket debe poder mostrar posteriormente las aplicaciones utilizadas.

**Reglas**

- NC/Vale actúan como aplicaciones de saldo dentro del Checkout.
- No aumentar efectivo físico por una NC/Vale.
- Efectivo sí afecta Caja según Sprint 7.
- Tarjeta/Transferencia siguen sus reglas.
- Aplicación de NC/Vale debe conservar documento origen.
- No permitir documento vencido.
- No permitir saldo insuficiente.
- No aplicar un mismo saldo en dos Ventas concurrentemente.
- Debe protegerse concurrencia/idempotencia.
- El Cobro debe cuadrar con todas las aplicaciones.
- Ticket debe conservar el desglose.
- Aplicación posterior no altera la Devolución original.
- Aplicación posterior no altera la Venta original que originó el saldo.

**Dependencias**

COM-102
COM-103
COM-104
COM-105
COM-124
COM-125

**Criterios de aceptación**

Venta:

1,000.

Aplicaciones:

NC = 300
Efectivo = 200
Tarjeta = 500

Resultado:

Venta saldo = 0.
NC saldo = 0.

Caja:

Efectivo físico +200.

Tarjeta:

500 como medio no efectivo.

NC:

300 como saldo aplicado, sin incrementar efectivo físico.

Ticket:

muestra las tres aplicaciones.

#### COM-127 — AUTORIZACIONES Y EXCEPCIONES DE POSTVENTA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Controlar las operaciones sensibles de Postventa sin permitir que una
excepción destruya la trazabilidad comercial.

**Funcionalidad**

Definir qué operaciones requieren autorización adicional, incluyendo
cuando corresponda:

- Devolución fuera de plazo;
- Devolución de cantidad excepcional;
- producto no reingresable;
- reversión de reingreso;
- cancelación de Devolución;
- emisión excepcional de NC;
- emisión excepcional de Vale;
- cancelación de NC/Vale;
- aplicación excepcional de saldo;
- otras excepciones definidas por el negocio.

La autorización debe conservar:

- operación;
- solicitante;
- autorizador;
- fecha/hora;
- motivo;
- decisión;
- observaciones.

**Reglas**

- Autorización es capacidad/permisos, NO un nuevo tipo de usuario.
- Supervisor/Super Usuario sólo autorizan si tienen el permiso.
- No modificar fechas para evadir una política.
- No modificar cantidades originales para evadir validaciones.
- No reactivar documentos vencidos silenciosamente.
- Una excepción autorizada debe quedar explícitamente identificada.
- Rechazar una autorización NO debe modificar inventario ni saldo.
- Autorizar NO debe duplicar el efecto posterior.
- No permitir autoautorización cuando la regla de segregación lo prohíba.
- Mantener empresa y sucursal.
- Toda excepción debe ser auditable.

**Tablas/Componentes relevantes**

- Devolución
- Nota de Crédito
- Vale
- aplicaciones
- modelo de permisos/autorizaciones de Sprint 0
- bitácora/auditoría cuando exista una estructura reutilizable

**Usuarios/Responsables**

- Cajero como solicitante cuando corresponda
- Administración
- Supervisor
- Super Usuario

**Dependencias**

COM-003
COM-007
COM-112
COM-119
COM-120
COM-121
COM-122
COM-123
COM-124

**Criterios de aceptación**

CASO A:

Devolución fuera de plazo.

Usuario sin autorización:

NO puede forzarla.

Supervisor autorizado:

puede aprobar la excepción.

Resultado:

motivo y autorizador quedan registrados.

CASO B:

Excepción rechazada.

Resultado:

no cambia inventario,
no genera NC,
no genera Vale.

======================================================================

#### COM-128 — TRAZABILIDAD INTEGRAL DE POSTVENTA

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir recorrer toda la historia desde la Venta original hasta la
resolución final de la Devolución.

**Funcionalidad**

Debe poder rastrearse:

Ticket
→ Venta
→ VentaDetalle
→ Devolución
→ DevoluciónDetalle

y cuando existe reingreso:

DevoluciónDetalle
→ Movimiento Inventario
→ Existencia/Kardex.

Y cuando existe resolución económica:

Devolución
→ Nota de Crédito / Vale
→ Aplicaciones
→ Venta posterior
→ Cobro posterior.

También debe poder recorrerse en sentido inverso.

Ejemplos:

NC
→ Devolución
→ Venta original.

Aplicación NC
→ NC
→ Devolución original.

Movimiento de reingreso
→ Devolución
→ Venta original.

**Reglas**

- Utilizar IDs internos estables.
- Folios son referencias visibles.
- No relacionar documentos únicamente por texto.
- Conservar producto.
- Conservar variante.
- Conservar cliente cuando corresponda.
- Conservar Sucursal.
- Conservar usuario.
- Conservar autorizador.
- Conservar documento origen.
- No borrar trazabilidad cuando un catálogo se inactive.
- Venta original permanece intacta.
- Ticket original permanece rastreable.
- Movimiento original de salida permanece en Kardex.
- Reingreso genera un movimiento nuevo, no sustituye el anterior.
- NC/Vale conservan Devolución origen.
- Aplicación posterior conserva NC/Vale origen.
- NEXT permanece fuera.

**Dependencias**

COM-109
COM-111
COM-118
COM-121
COM-122
COM-123
COM-125
COM-126

**Criterios de aceptación**

Desde una NC:

identificar Devolución.

Desde Devolución:

identificar Venta.

Desde Venta:

identificar Ticket/Pedido.

Desde movimiento de reingreso:

identificar Devolución.

Desde aplicación posterior:

identificar NC/Vale.

Variante:

permanece igual en toda la cadena documental que la requiera.

======================================================================

#### COM-129 — CONSULTA OPERATIVA DE DEVOLUCIONES, NC Y VALES

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Dar visibilidad operativa de la Postventa antes de construir los reportes
gerenciales de Sprint 9.

**Funcionalidad**

Permitir consultar Devoluciones mediante filtros como:

- folio;
- Venta;
- Ticket;
- cliente;
- fecha;
- Sucursal;
- motivo;
- estado;
- producto;
- variante;
- responsable.

Permitir consultar NC/Vale mediante:

- folio;
- cliente;
- fecha emisión;
- fecha vencimiento;
- estado;
- saldo;
- Devolución origen;
- Sucursal.

Mostrar cuando corresponda:

- importe original;
- saldo disponible;
- importe aplicado;
- vencimiento;
- aplicaciones realizadas.

**Reglas**

- Consulta NO modifica documentos.
- Consulta NO modifica inventario.
- Consulta NO modifica saldo.
- Documento vencido sigue visible.
- Documento agotado sigue visible.
- Documento cancelado sigue visible.
- Producto con variantes muestra variante.
- Históricos permanecen disponibles.
- Los filtros deben respetar empresa/multitenant.
- Los permisos de consulta/exportación deben respetar Sprint 0.

**Usuarios/Responsables**

- Cajero
- Vendedor según permisos
- Administración
- Supervisor
- Super Usuario
- usuarios de Reportes

**Dependencias**

COM-003
COM-111
COM-122
COM-123
COM-124
COM-128

**Criterios de aceptación**

- Devolución localizable por Ticket;
- Devolución localizable por cliente;
- variante visible;
- motivo visible;
- NC muestra saldo;
- Vale muestra saldo;
- vencidos permanecen consultables;
- aplicaciones pueden consultarse;
- consulta no altera información.

======================================================================

#### COM-130 — CERTIFICACIÓN E2E DE POSTVENTA

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Cerrar Sprint 8 demostrando el flujo completo desde una Venta existente
hasta la resolución física y económica de una Devolución.

**Funcionalidad**

Certificar:

- localizar Venta;
- política de días;
- devolución parcial;
- devolución total;
- variante exacta;
- motivo;
- reingresable;
- no reingresable;
- movimiento de entrada;
- Kardex;
- idempotencia;
- reversión física;
- resolución económica;
- NC;
- Vale;
- vigencia;
- saldo;
- aplicación parcial;
- aplicación total;
- aplicación posterior;
- múltiples Formas de Pago;
- autorizaciones;
- trazabilidad.

**Reglas**

NO certificar únicamente por:

- build;
- compilación;
- revisión de código.

La certificación debe comprobar efectos reales y consistencia entre:

Venta
Devolución
Inventario
Kardex
NC/Vale
Aplicaciones
Cobro
Caja.

No destruir históricos para realizar QA.

**Usuarios/Responsables**

- Product Owner
- Cajero
- Administración
- Supervisor/autorizador
- responsable de inventario

**Dependencias**

COM-111 a COM-129

**Criterios de aceptación**

- Venta válida localizable;
- plazo aplicado correctamente;
- cantidad devolvible correcta;
- devolución parcial funciona;
- devolución total funciona;
- no permite devolver más de lo vendido;
- variante permanece exacta;
- reingresable aumenta Física;
- no reingresable NO aumenta Física;
- Kardex conserva salida original y entrada posterior;
- reintento no duplica reingreso;
- NC puede emitirse;
- Vale puede emitirse;
- vigencia correcta;
- saldo correcto;
- aplicación parcial correcta;
- aplicación total correcta;
- documento agotado no vuelve a utilizarse;
- documento vencido no se aplica;
- aplicación posterior puede combinarse con otras Formas de Pago;
- Caja distingue NC/Vale de efectivo;
- excepciones requieren autorización cuando corresponda;
- trazabilidad completa;
- 0 dependencia NEXT activa.

### S9 — Reportes + Trazabilidad + Cierre

**Qué entrega:** 16 tickets, de COM-131 a COM-146.

#### COM-131 — REPORTE DE COMPRAS Y RECEPCIONES

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir analizar lo comprado frente a lo realmente recibido.

**Funcionalidad**

El reporte debe poder consultar como mínimo:

- OC;
- fecha OC;
- proveedor;
- Sucursal;
- producto;
- variante;
- cantidad ordenada;
- cantidad recibida acumulada;
- cantidad pendiente;
- costo OC;
- costo recibido;
- Recepciones;
- estado/condición de recepción.

Filtros útiles:

- rango de fechas;
- proveedor;
- Sucursal;
- producto;
- variante;
- OC;
- estado;
- pendientes.

Debe permitir identificar:

OC sin recibir.

OC parcialmente recibida.

OC totalmente recibida.

**Reglas**

- Cantidad recibida debe provenir de Recepciones válidas.
- No inventar recibido desde el estado de la OC.
- Producto con variantes debe mostrar variante.
- Producto simple continúa funcionando.
- No mezclar variantes en una sola cantidad pendiente operativa.
- Históricos de OC sin variante permanecen consultables.
- Reporte es consulta.
- No modifica OC.
- No modifica Recepción.
- No modifica inventario.
- Respetar empresa/multitenant.

**Tablas/Componentes relevantes**

- OrdenesCompra
- OrdenesCompraDetalle
- Recepción
- RecepciónDetalle
- ProductosServicios
- ProductosServiciosVariantes
- ActivosProveedores
- Sucursales

**Usuarios/Responsables**

- Administración
- Supervisor
- responsables de compras
- usuarios de Reportes

**Dependencias**

COM-040

**Criterios de aceptación**

OC:

946 ml
Ordenado = 10
Recibido = 4
Pendiente = 6

Reporte:

muestra exactamente esos valores.

Segunda Recepción:

6.

Reporte actualizado:

Recibido = 10
Pendiente = 0.

======================================================================

#### COM-132 — REPORTE DE EXISTENCIAS Y KARDEX

**Prioridad:** P1

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Dar una vista consolidada y trazable de la situación actual del
inventario.

**Funcionalidad**

REPORTE DE EXISTENCIAS:

mostrar:

- producto;
- variante;
- Sucursal si PO-001 la incorpora;
- existencia física;
- existencia mínima;
- comprometida;
- disponible;
- condición respecto al mínimo.

KARDEX:

permitir consultar:

- fecha;
- producto;
- variante;
- entrada;
- salida;
- tipo de movimiento;
- documento origen;
- usuario;
- Sucursal;
- saldo cuando corresponda.

Filtros:

- producto;
- variante;
- Sucursal;
- fecha;
- tipo de movimiento;
- documento origen.

**Reglas**

- Variante es dimensión obligatoria cuando el producto tenga variantes.
- No utilizar consolidado como sustituto del saldo por variante.
- Consolidado puede existir como indicador secundario.
- Física, Comprometida y Disponible deben respetar Sprint 1.
- Kardex explica cambios de Física.
- Históricos sin variante siguen disponibles.
- No reescribir historia.
- Reporte NO modifica saldos.

**Dependencias**

COM-019
COM-020
COM-021
COM-118

**Criterios de aceptación**

Producto:

Aceite.

946 ml:
Física 8
Comprometida 2
Disponible 6.

5 L:
Física 3
Comprometida 0
Disponible 3.

Reporte:

muestra ambas variantes por separado.

Kardex 946 ml:

muestra únicamente sus movimientos al filtrar esa variante.

======================================================================

**Decisión relacionada**

PO-001

#### COM-133 — REPORTE DE COTIZACIONES Y CONVERSIÓN A PEDIDO

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Medir la actividad comercial previa a la Venta y conocer qué Cotizaciones
se convierten en Pedido.

**Funcionalidad**

Consultar:

- folio Cotización;
- fecha;
- cliente;
- Agente/Vendedor;
- Sucursal;
- importe;
- estado;
- vigencia;
- productos;
- variantes;
- servicios;
- conceptos pendientes;
- Pedido relacionado cuando exista;
- fecha de conversión.

Indicadores básicos:

- Cotizaciones creadas;
- Cotizaciones elegibles;
- Cotizaciones convertidas;
- Cotizaciones no convertidas;
- importe cotizado;
- importe convertido.

**Reglas**

- No inventar conversión por coincidencia de cliente/importe.
- Utilizar relación documental Cotización → Pedido.
- Variante debe conservarse.
- Conceptos pendientes deben poder identificarse.
- Cotización cancelada/vencida permanece histórica.
- Reporte NO modifica Cotización/Pedido.
- No depender de NEXT.

**Usuarios/Responsables**

- Agente
- Vendedor
- Administración
- Supervisor
- usuarios de Reportes

**Dependencias**

COM-054
COM-058
COM-068

**Criterios de aceptación**

Cotización A:

convertida a Pedido X.

Reporte:

muestra relación.

Cotización B:

sin Pedido.

Reporte:

muestra no convertida.

No se infiere conversión sin vínculo documental.

======================================================================

#### COM-134 — REPORTE DE PEDIDOS, SURTIMIENTO Y VENTAS

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Conocer qué se pidió, qué se surtió, qué sigue pendiente y qué terminó en
Venta.

**Funcionalidad**

Consultar por Pedido/partida:

- Pedido;
- fecha;
- cliente;
- Vendedor;
- Sucursal;
- producto;
- variante;
- servicio;
- cantidad pedida;
- cantidad surtida;
- cantidad pendiente;
- compromiso;
- Venta(s) relacionada(s);
- importe;
- estado.

Filtros:

- fecha;
- cliente;
- Vendedor;
- Sucursal;
- producto;
- variante;
- estado;
- pendientes.

Debe permitir identificar:

- Pedido sin surtir;
- parcialmente surtido;
- totalmente surtido;
- cancelado;
- con Venta;
- pendiente.

**Reglas**

- Surtido acumulado proviene de operaciones válidas.
- No editar acumulados desde reporte.
- Producto con variantes mantiene desglose.
- Servicios deben diferenciarse de productos.
- No interpretar Servicio cobrado como ejecutado si su estado operativo
  indica otra cosa.
- Reporte NO modifica compromiso.
- Reporte NO modifica inventario.
- Venta debe relacionarse documentalmente.

**Dependencias**

COM-068
COM-098
COM-109
COM-110

**Decisión relacionada**

PO-010, PO-011

**Criterios de aceptación**

Pedido:

946 ml = 10.

Surtido:

4.

Pendiente:

6.

Reporte:

muestra 10 / 4 / 6.

Segundo surtimiento:

6.

Reporte:

10 / 10 / 0.

Venta relacionada:

identificable.

======================================================================

#### COM-135 — REPORTE DE VENTAS, COBROS Y CAJA

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir conciliar la actividad comercial con los Cobros y movimientos de
Caja.

**Funcionalidad**

REPORTE DE VENTAS:

- folio Venta;
- Ticket;
- fecha;
- cliente;
- Sucursal;
- Vendedor;
- Cajero;
- total;
- saldo;
- estado.

REPORTE DE COBROS:

- Venta;
- Cobro;
- Forma de Pago;
- importe;
- referencia;
- Cajero;
- Caja;
- sesión;
- fecha.

REPORTE DE CAJA:

- Caja;
- sesión;
- Cajero;
- saldo inicial;
- Cobros;
- movimientos;
- efectivo esperado;
- efectivo contado;
- diferencia;
- cierre.

Filtros:

- fecha;
- Sucursal;
- Vendedor;
- Cajero;
- Caja;
- Forma de Pago;
- estado.

**Reglas**

- Vendedor != Cajero.
- Venta != Cobro.
- Efectivo != total general de medios de pago.
- NC/Vale no incrementan efectivo físico.
- Reporte de Caja debe derivarse de movimientos válidos.
- No modificar Cobros para cuadrar reporte.
- Diferencias permanecen visibles.
- Múltiples Formas de Pago deben conservar desglose.
- Ticket debe rastrearse a Venta.
- Mantener multitenant.

**Dependencias**

COM-077
COM-105
COM-106
COM-107
COM-109
COM-110
COM-126

**Decisión relacionada**

PO-009, PO-010

**Criterios de aceptación**

Venta:

1,000.

Cobro:

Efectivo = 200
Tarjeta = 500
NC = 300.

Reporte Venta:

Total = 1,000.

Reporte Cobro:

muestra las tres aplicaciones.

Reporte Caja:

Efectivo físico aumenta únicamente 200.

NC:

NO aparece como efectivo.

#### COM-136 — REPORTE DE DEVOLUCIONES Y REINGRESOS

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Permitir analizar qué mercancía fue devuelta, por qué motivo y cuál fue
su efecto físico real.

**Funcionalidad**

El reporte debe poder mostrar:

- Devolución;
- Venta origen;
- Ticket;
- fecha;
- cliente;
- Sucursal;
- producto;
- variante;
- cantidad vendida;
- cantidad devuelta;
- motivo;
- clasificación REINGRESABLE / NO REINGRESABLE;
- cantidad reingresada;
- movimiento de inventario relacionado;
- responsable;
- autorizador cuando corresponda;
- estado.

Filtros mínimos:

- fecha;
- Sucursal;
- cliente;
- Venta/Ticket;
- producto;
- variante;
- motivo;
- clasificación;
- estado.

Debe permitir distinguir:

DEVUELTO
!=
REINGRESADO.

**Reglas**

- Una Devolución aceptada NO implica necesariamente reingreso.
- Sólo REINGRESABLE debe reflejar entrada física.
- No inferir reingreso únicamente por existir Devolución.
- Movimiento de entrada debe relacionarse documentalmente.
- Movimiento de salida original de Venta permanece en Kardex.
- Producto con variantes conserva variante exacta.
- Históricos permanecen consultables.
- Reporte no modifica inventario.
- Reporte no modifica Devoluciones.
- Respetar empresa/multitenant.

**Tablas/Componentes relevantes**

- Venta
- VentaDetalle
- Devolución
- DevoluciónDetalle
- Motivo Devolución
- ProductosServicios
- ProductosServiciosVariantes
- ProductosServiciosMovimientosInventario
- ProductosServiciosExistencias

**Usuarios/Responsables**

- Administración
- Supervisor
- responsable de inventario
- usuarios de Reportes

**Dependencias**

COM-118
COM-119
COM-128
COM-130

**Criterios de aceptación**

CASO A:

Devolución:

946 ml = 2
REINGRESABLE.

Reporte:

Devuelto = 2
Reingresado = 2
Movimiento entrada identificable.

CASO B:

Devolución:

946 ml = 1
NO REINGRESABLE.

Reporte:

Devuelto = 1
Reingresado = 0.

No debe fingir entrada de inventario.

======================================================================

#### COM-137 — REPORTE DE NOTAS DE CRÉDITO, VALES Y SALDOS

**Prioridad:** P1

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Conocer los saldos a favor emitidos, utilizados, vencidos y pendientes.

**Funcionalidad**

El reporte debe poder mostrar para NC y Vale:

- tipo de documento;
- folio;
- cliente/titular según regla;
- Devolución origen;
- Venta origen;
- Sucursal;
- fecha emisión;
- fecha vencimiento;
- importe original;
- importe aplicado acumulado;
- saldo disponible;
- estado;
- aplicaciones realizadas;
- Venta(s) posteriores donde fue utilizado.

Filtros:

- tipo;
- folio;
- cliente;
- fecha emisión;
- vencimiento;
- Sucursal;
- estado;
- con saldo;
- agotado;
- vencido.

Indicadores básicos:

- saldo NC vigente;
- saldo Vale vigente;
- saldo vencido;
- importe aplicado;
- documentos agotados.

**Reglas**

- Saldo debe derivarse de aplicaciones válidas.
- No editar saldo desde el reporte.
- Documento vencido permanece visible.
- Documento agotado permanece visible.
- NC != Vale.
- Vale respeta PO-008.
- Aplicaciones posteriores deben ser rastreables.
- No contar NC/Vale como efectivo.
- No duplicar aplicaciones en los totales.
- Reporte no modifica vigencias ni estados.

**Dependencias**

COM-122
COM-123
COM-124
COM-125
COM-126
COM-128
COM-130

**Criterios de aceptación**

NC:

Original = 500
Aplicado = 300
Saldo = 200.

Reporte:

muestra exactamente 500 / 300 / 200.

Vale:

Original = 300
Aplicado = 300
Saldo = 0
Estado = Agotado.

Documento vencido:

permanece consultable.

======================================================================

**Decisión relacionada**

PO-008

#### COM-138 — REPORTE DE DESEMPEÑO POR RESPONSABLE

**Prioridad:** P1

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Dar visibilidad del trabajo comercial y operativo sin mezclar
responsabilidades distintas.

**Funcionalidad**

Permitir consultar indicadores por:

AGENTE / VENDEDOR

- Cotizaciones;
- Cotizaciones convertidas;
- Pedidos;
- Ventas;
- importe vendido.

CAJERO

- Cobros procesados;
- importe cobrado;
- sesiones de Caja;
- diferencias de arqueo cuando tenga permiso de consulta.

OPERADOR

- Servicios asignados;
- Servicios atendidos cuando exista estado de ejecución;
- participación operativa.

AYUDANTE

- participaciones registradas;
- asistencia cuando corresponda.

ADMINISTRACIÓN / SUPERVISOR

- operaciones capturadas;
- autorizaciones;
- ajustes/excepciones según permisos.

**Reglas**

- No atribuir Cobro al Vendedor si lo procesó un Cajero diferente.
- No atribuir Venta al Cajero si el responsable comercial fue otro.
- Operador sugerido no cuenta como ejecución.
- Servicio cobrado no cuenta automáticamente como ejecutado.
- Ayudante puede aparecer sin Login.
- Asistencia no equivale a productividad.
- No convertir este reporte en nómina.
- No calcular comisiones sin reglas/ticket específico.
- Mantener Sucursal cuando corresponda.
- Respetar permisos de consulta.

**Dependencias**

COM-004
COM-005
COM-077
COM-088
COM-109
COM-110

**Decisión relacionada**

PO-011

**Criterios de aceptación**

Venta:

Vendedor A.

Cobro:

Cajero B.

Reporte Vendedor:

atribuye Venta a A.

Reporte Cajero:

atribuye Cobro a B.

Servicio:

Operador sugerido A,
Operador ejecutor B.

El desempeño operativo NO debe atribuir ejecución a A sólo por haber sido
sugerido.

======================================================================

#### COM-139 — INDICADORES COMERCIALES Y OPERATIVOS

**Prioridad:** P1

**Estado inicial:** BLOQUEADO POR DECISIÓN PO para el punto específico afectado; el análisis y diseño no bloqueado pueden avanzar.

**Objetivo**

Crear un conjunto controlado de indicadores que permita al Product Owner
entender el desempeño del ciclo completo.

**Funcionalidad**

V6 debe contemplar como mínimo indicadores de:

COMPRAS

- OC generadas;
- importe comprado;
- pendiente por recibir;
- porcentaje recibido.

INVENTARIO

- existencia física;
- comprometida;
- disponible;
- productos/variantes bajo mínimo.

COTIZACIONES

- cantidad;
- importe;
- conversión a Pedido.

PEDIDOS

- activos;
- parcialmente surtidos;
- pendientes;
- cancelados.

VENTAS

- cantidad;
- importe;
- Ticket promedio cuando sea útil;
- ventas por Sucursal;
- ventas por Vendedor.

COBROS

- importe por Forma de Pago;
- efectivo;
- medios no efectivos;
- saldo pendiente cuando PO-007 lo permita.

POSTVENTA

- Devoluciones;
- importe devuelto;
- reingresable/no reingresable;
- NC emitidas;
- Vales emitidos;
- saldos vigentes.

**Reglas**

- Cada indicador debe tener definición explícita.
- No crear métricas con nombres ambiguos.
- No mezclar unidades con importes.
- No sumar variantes como si fueran unidades equivalentes cuando no lo
  sean.
- Conversión Cotización → Pedido requiere vínculo real.
- Venta debe provenir de documentos válidos.
- Cobro != Venta.
- Devolución != reingreso.
- NC/Vale != efectivo.
- Los indicadores deben respetar filtros de fecha/Sucursal cuando
  corresponda.
- No construir predicciones/IA dentro de este ticket.
- No crear métricas sin fuente de datos identificable.

**Usuarios/Responsables**

- Product Owner
- Administración
- Supervisor
- Super Usuario
- responsables autorizados

**Dependencias**

COM-131
COM-132
COM-133
COM-134
COM-135
COM-136
COM-137
COM-138

**Criterios de aceptación**

Cada indicador del tablero/reporte debe poder responder:

- qué mide;
- de qué documentos proviene;
- qué rango de fechas utiliza;
- qué Sucursal utiliza;
- qué unidad representa.

No debe existir un indicador cuyo cálculo no pueda explicarse.

======================================================================

**Decisión relacionada**

PO-007

#### COM-140 — TRAZABILIDAD DOCUMENTAL GLOBAL DEL CICLO COMERCIAL

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Crear una vista lógica integral que permita recorrer el ciclo comercial
completo de un documento a otro.

**Funcionalidad**

Debe poder recorrerse cuando aplique:

ABASTECIMIENTO

Producto/Variante
→ OC
→ Recepción
→ Movimiento Inventario
→ Existencia.

VENTA

Cotización
→ Pedido
→ Compromiso
→ Surtimiento
→ Movimiento Inventario
→ Venta
→ Cobro
→ Movimiento Caja
→ Ticket.

POSTVENTA

Ticket/Venta
→ Devolución
→ Reingreso cuando aplique
→ Movimiento Inventario
→ NC/Vale
→ Aplicación posterior
→ Venta/Cobro posterior.

También debe permitir navegación inversa.

Ejemplos:

Movimiento Inventario
→ documento que lo originó.

Movimiento Caja
→ Cobro
→ Venta.

NC
→ Devolución
→ Venta original.

Pedido
→ Cotización origen.

Recepción
→ OC origen.

**Reglas**

- IDs internos estables para relaciones.
- Folios/códigos son referencias visibles.
- No relacionar por coincidencias de texto.
- No perder empresa.
- No perder Sucursal.
- No perder producto.
- No perder variante.
- No perder cliente.
- No perder Vendedor.
- No perder Cajero.
- No perder Operador/participantes cuando corresponda.
- No perder autorizaciones.
- Históricos deben sobrevivir a inactivación de catálogos.
- La navegación no modifica documentos.
- No crear una segunda fuente de verdad.
- NEXT permanece fuera.

**Tablas/Componentes relevantes**

Todos los documentos comerciales autorizados de S1 a S8.

La implementación técnica puede resolverse mediante consultas/servicios
sin crear necesariamente una tabla física adicional.

**Usuarios/Responsables**

- Administración
- Supervisor
- Product Owner
- usuarios de Reportes según permisos

**Dependencias**

COM-040
COM-054
COM-068
COM-109
COM-110
COM-128
COM-130

**Criterios de aceptación**

CASO A:

Desde Recepción:

identificar OC.

Desde movimiento de entrada:

identificar Recepción.

CASO B:

Desde Ticket:

identificar Venta
→ Pedido
→ Cotización.

CASO C:

Desde movimiento de salida:

identificar Surtimiento/Venta
→ Pedido.

CASO D:

Desde NC:

identificar Devolución
→ Venta original.

CASO E:

Desde aplicación NC:

identificar NC
→ Devolución origen
y
Venta posterior donde fue aplicada.

Toda la cadena conserva variante cuando corresponda.

#### COM-141 — AUDITORÍA INTEGRAL DEL CICLO COMERCIAL

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Comprobar que los procesos definidos desde Sprint 0 hasta Sprint 8 forman
un único ciclo comercial coherente y no un conjunto de módulos aislados.

**Funcionalidad**

Auditar la continuidad funcional de:

USUARIOS
→ PRODUCTOS/SERVICIOS
→ VARIANTES
→ INVENTARIO
→ OC
→ RECEPCIÓN
→ COTIZACIÓN
→ PEDIDO
→ COMPROMISO
→ SURTIMIENTO
→ VENTA
→ COBRO
→ CAJA
→ TICKET
→ DEVOLUCIÓN
→ REINGRESO
→ NC/VALE
→ APLICACIÓN POSTERIOR.

Para cada transición validar:

- documento origen;
- documento destino;
- IDs relacionados;
- producto;
- variante;
- cliente;
- Sucursal;
- responsable;
- estado;
- efectos de inventario;
- efectos monetarios;
- trazabilidad.

**Reglas**

- No certificar módulos aisladamente si la transición entre ellos falla.
- Producto con variantes debe conservar variante durante todo el ciclo.
- Producto simple conserva variante NULL.
- No crear relaciones por coincidencia textual.
- Documento destino debe conservar documento origen.
- Inventario debe explicarse mediante movimientos.
- Caja debe explicarse mediante Cobros/movimientos.
- Postventa debe rastrearse hasta Venta original.
- No modificar datos durante esta auditoría salvo QA controlado posterior.
- NEXT permanece fuera.

**Usuarios/Responsables**

- Product Owner
- Administración
- Supervisor
- responsables de QA

**Dependencias**

COM-140

**Criterios de aceptación**

Debe existir continuidad demostrable entre:

OC → Recepción.

Recepción → Inventario.

Cotización → Pedido.

Pedido → Compromiso.

Pedido → Surtimiento.

Surtimiento → Inventario.

Surtimiento → Venta.

Venta → Cobro.

Cobro → Caja.

Venta → Ticket.

Venta → Devolución.

Devolución → Inventario cuando aplica.

Devolución → NC/Vale.

NC/Vale → aplicación posterior.

0 transiciones huérfanas.

======================================================================

#### COM-142 — QA E2E: ABASTECIMIENTO HASTA EXISTENCIA

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Certificar de extremo a extremo el ciclo de abastecimiento antes de
validar la Venta.

**Funcionalidad**

Ejecutar un escenario controlado:

Producto con variantes:

Aceite Motor Sintético

946 ml
5 L

Crear/evolucionar OC con ambas variantes.

Realizar Recepciones parciales.

Confirmar Recepciones.

Validar:

- cantidades ordenadas;
- recibidas;
- pendientes;
- movimientos;
- existencia;
- costo recibido;
- Kardex;
- idempotencia.

**Reglas**

OC:

NO modifica inventario.

Recepción en Captura:

NO modifica inventario.

Recepción Confirmada:

SÍ genera entrada.

Cada variante:

se actualiza independientemente.

Reintento:

NO duplica entrada.

Históricos:

no deben destruirse para ejecutar QA.

**Dependencias**

COM-040
COM-131
COM-132
COM-141

**Criterios de aceptación**

Estado inicial:

946 ml = 10
5 L = 3.

OC:

946 ml = 10
5 L = 4.

Recepción 1:

946 ml = 4
5 L = 1.

Resultado:

946 ml = 14
5 L = 4.

Pendiente OC:

946 ml = 6
5 L = 3.

Recepción 2:

946 ml = 6
5 L = 3.

Resultado:

946 ml = 20
5 L = 7.

Pendiente:

0 / 0.

Kardex:

movimientos separados por variante.

Reintento:

sin duplicación.

======================================================================

#### COM-143 — QA E2E: COTIZACIÓN HASTA TICKET

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Certificar el ciclo comercial principal desde la intención de Venta hasta
el Cobro.

**Funcionalidad**

Ejecutar un escenario controlado:

Cotización
→ Pedido
→ Compromiso
→ Surtimiento
→ Venta
→ Cobro
→ Caja
→ Ticket.

Debe incluir:

- producto con variante;
- Servicio;
- Flete;
- Vendedor;
- Cajero;
- múltiples Formas de Pago;
- surtimiento parcial cuando sea útil;
- idempotencia.

**Reglas**

Cotización:

NO compromete stock.

Pedido confirmado:

SÍ compromete.

Surtimiento:

disminuye Física y libera Comprometida.

Venta/Cobro:

NO vuelve a disminuir inventario.

Cobro:

afecta Caja.

Ticket:

NO genera efectos adicionales.

Vendedor != Cajero.

Servicio/Flete:

NO generan movimiento físico.

**Dependencias**

COM-054
COM-068
COM-082
COM-088
COM-110
COM-133
COM-134
COM-135
COM-141

**Criterios de aceptación**

Ejemplo:

946 ml

Física inicial = 10
Comprometida = 0.

Cotización:

3.

Resultado:

Física = 10.
Comprometida = 0.

Pedido confirmado:

3.

Resultado:

Física = 10.
Comprometida = 3.
Disponible = 7.

Surtir:

2.

Resultado:

Física = 8.
Comprometida = 1.
Pedido pendiente = 1.

Venta/Cobro:

corresponde a las 2 unidades surtidas.

Caja:

recibe únicamente el efecto monetario.

Ticket:

coincide con Venta/Cobro.

Reintentos:

NO duplican compromiso,
NO duplican salida,
NO duplican Cobro,
NO duplican Caja.

======================================================================

#### COM-144 — QA E2E: POSTVENTA Y APLICACIÓN POSTERIOR

**Prioridad:** P0

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Certificar que una Venta puede devolverse y resolverse sin destruir su
historia.

**Funcionalidad**

Ejecutar un escenario controlado:

Venta
→ Devolución parcial
→ Reingreso
→ Movimiento
→ NC/Vale
→ aplicación posterior.

Debe incluir también un caso:

NO REINGRESABLE.

**Reglas**

- No devolver más de lo vendido.
- Variante exacta.
- Reingresable aumenta Física.
- No reingresable NO aumenta Física.
- Venta original permanece.
- Movimiento de salida original permanece.
- NC/Vale no modifican inventario.
- Aplicación posterior no modifica la Devolución original.
- NC/Vale no incrementan efectivo físico.
- Idempotencia en todos los efectos.

**Dependencias**

COM-130
COM-136
COM-137
COM-140
COM-141

**Criterios de aceptación**

CASO 1:

Venta:

946 ml = 2.

Devolver:

1.

REINGRESABLE.

Resultado:

Física +1.

Kardex:

salida original
+
entrada Devolución.

Emitir NC:

importe correspondiente.

Aplicar NC posteriormente:

saldo disminuye correctamente.

CASO 2:

Producto dañado.

NO REINGRESABLE.

Resultado:

Física sin cambio.

Resolución económica:

puede continuar.

======================================================================

#### COM-145 — REGRESIÓN, MULTITENANT Y SEGURIDAD DEL PROGRAMA COMERCIAL

**Prioridad:** P0

**Estado inicial:** PENDIENTE / LISTO PARA DESARROLLO cuando sus dependencias estén satisfechas.

**Objetivo**

Certificar que el nuevo ciclo comercial no rompe funcionalidades
aprobadas ni permite contaminación entre empresas.

**Funcionalidad**

Ejecutar una matriz de regresión sobre:

- ProductosServicios;
- variantes;
- código autogenerado aprobado;
- ficha técnica;
- pesos logísticos;
- Activos cuando sea consumidor compartido;
- Roles;
- Permisos;
- Login;
- sesión;
- Sucursales;
- catálogos compartidos;
- OC;
- inventario;
- reportes.

Validar multitenant en:

- productos;
- variantes;
- inventario;
- OC;
- Recepción;
- Cotización;
- Pedido;
- Venta;
- Cobro;
- Caja;
- Devolución;
- NC/Vale.

**Reglas**

- Empresa A no consulta/modifica datos de Empresa B.
- No confiar únicamente en idEmpresa enviado por frontend.
- Mantener controles backend.
- No modificar Login/Firebase/sesión global sin autorización.
- No adoptar tablas NEXT.
- No romper código autogenerado aprobado.
- No romper Ticket 03/04/05/06/07 y evoluciones aprobadas que sigan
  vigentes.
- Los catálogos compartidos deben conservar sus consumidores actuales.
- Una regresión real debe registrarse como defecto, no ocultarse.

**Usuarios/Responsables**

Todos los perfiles aplicables.

**Dependencias**

COM-008
COM-021
COM-040
COM-054
COM-068
COM-082
COM-088
COM-110
COM-130
COM-141
COM-142
COM-143
COM-144

**Criterios de aceptación**

- aislamiento empresa A/B;
- 0 acceso cross-tenant no autorizado;
- ProductosServicios intacto;
- variantes intactas;
- código autogenerado intacto;
- ficha técnica intacta;
- pesos logísticos intactos;
- Roles/Permisos intactos;
- Login/sesión intactos;
- OC actual evolucionada sin dependencia NEXT;
- catálogos compartidos intactos;
- regresiones documentadas y corregidas antes del cierre.

======================================================================

#### COM-146 — CIERRE DOCUMENTAL DEL CICLO COMERCIAL

**Prioridad:** P1

**Estado inicial:** PENDIENTE DE EJECUCIÓN / QA cuando el Sprint correspondiente sea implementado.

**Objetivo**

Mantener alineada la documentación del proyecto con lo realmente
implementado y certificado.

**Funcionalidad**

Al finalizar cada implementación futura, actualizar la documentación
correspondiente para reflejar:

- arquitectura real;
- tablas reales;
- procesos reales;
- estados reales;
- permisos;
- responsables;
- decisiones PO;
- dependencias;
- migraciones realizadas;
- QA;
- limitaciones;
- deuda técnica;
- funcionalidades pendientes.

El Backlog V6 debe permanecer como:

PLAN MAESTRO.

La documentación de implementación debe distinguir:

PLANIFICADO
vs
IMPLEMENTADO
vs
CERTIFICADO.

**Reglas**

- No marcar un ticket como implementado sólo por existir en V6.
- No marcar un Sprint como certificado sin QA.
- No sustituir evidencia por intención.
- No documentar tablas conceptuales como si ya existieran.
- No borrar decisiones históricas relevantes.
- V2/V3/V4/V5 no deben seguir utilizándose como backlog vigente una vez que
  V6 sea aprobado.
- Pueden conservarse como histórico documental.
- Cambios futuros deben evolucionar V6, no reconstruir el contexto desde
  cero.
- No incorporar NEXT como fuente de verdad sin autorización expresa PO.

**Usuarios/Responsables**

- Product Owner
- PM
- Desarrollo
- QA

**Dependencias**

COM-141
COM-142
COM-143
COM-144
COM-145

**Criterios de aceptación**

- backlog y realidad diferenciados;
- tickets implementados identificables;
- tickets pendientes identificables;
- decisiones PO rastreables;
- tablas conceptuales no se presentan como físicas;
- documentación histórica preservada;
- fuente documental vigente identificada;
- siguiente fase puede continuar sin volver a auditar todo desde cero.

## 15. Gates QA por Sprint

- S0: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- S1: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- S2: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- S3: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- S4: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- S5: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- S6: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- S7: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- S8: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- S9: Gate funcional obligatorio con evidencia de negocio; build PASS no equivale a aprobación.
- E2E abastecimiento: OC -\> Recepción -\> Existencia.
- E2E comercial: Cotización -\> Pedido -\> Compromiso -\> Surtimiento -\> Venta -\> Cobro -\> Caja -\> Ticket.
- E2E postventa: Venta -\> Devolución -\> Reingreso -\> NC/Vale -\> Aplicación posterior.

## 16. Migración / Compatibilidad Histórica

Los históricos sin variante deben permanecer consultables. No se deben repartir saldos ambiguos automáticamente. Los snapshots documentales conservan representación histórica sin sustituir IDs internos estables. Cambios futuros de catálogo no deben reescribir documentos comerciales históricos.

## 17. Multitenant y Seguridad

idEmpresa es dimensión obligatoria donde corresponda. Empresa A no debe consultar ni modificar datos de Empresa B. No se debe confiar únicamente en idEmpresa enviado por frontend. Sucursal se trata por documento/proceso y la dimensión de inventario por Sucursal depende de PO-001.

## 18. Trazabilidad Documental

Todo documento crítico debe poder navegarse desde origen a destino y de destino a origen usando IDs internos estables, no coincidencias textuales. Folios y códigos son referencias visibles, no sustitutos de PK.

## 19. Reportes e Indicadores

Los reportes mínimos cubren compras/recepciones, existencias, Kardex, cotizaciones, conversión a pedido, pedidos, surtimientos, ventas, cobros, caja, devoluciones, reingresos, NC, Vales, saldos, desempeño por responsable e indicadores comerciales/operativos. Cada indicador debe tener fuente, fórmula, fecha, Sucursal cuando aplique y unidad comprensible.

## 20. Cobertura del Backlog Original

| Capacidad original          | Recuperada | Ticket/Sprint                           | Omisión |
| --------------------------- | ---------- | --------------------------------------- | ------- |
| Asistencia                  | Sí         | S6 COM-083 a COM-088; referencias S7/S8 | No      |
| Fecha instalación           | Sí         | S3/S4/S6 servicios e instalación        | No      |
| Observaciones instalador    | Sí         | S3/S4/S6 servicios/operación            | No      |
| Operador sugerido           | Sí         | COM-065, COM-066, COM-108, COM-138      | No      |
| Concepto pendiente          | Sí         | COM-047 y resolución posterior          | No      |
| Resolución concepto         | Sí         | COM-048 y flujo Cotización/Pedido       | No      |
| Flete                       | Sí         | COM-049, COM-067, COM-089 a COM-110, COM-134, COM-135 | No; cobro en ventas parciales pendiente de PO-010 |
| Formas de Pago por Sucursal | Sí         | S5 COM-069 a COM-072                    | No      |
| Caja                        | Sí         | S5 COM-073 a COM-077; S7 Cobro          | No; alcance operativo pendiente de PO-009 |
| Surtimiento parcial         | Sí         | COM-095 y S7                            | No      |
| Días de devolución          | Sí         | COM-079, PO-005, S8                     | No      |
| Ajustes PV                  | Sí         | S5 COM-078 a COM-082                    | No      |
| Nota de Crédito             | Sí         | COM-122, COM-124 a COM-126              | No      |
| Vale                        | Sí         | COM-123 a COM-126                       | No      |
| Vigencias                   | Sí         | COM-080, COM-081, COM-124               | No      |
| Aplicación posterior        | Sí         | COM-125, COM-126                        | No      |
| Responsables comerciales    | Sí         | S0, S7, S9                              | No      |
| Autorizaciones              | Sí         | COM-007, COM-127                        | No      |

## 21. Cobertura de Implementaciones Recientes

V6 conserva como fundación actual Productos, Servicios, Variantes, atributos, costo/precio/imagen por variante, Tags, categorías, marcas, unidades, colecciones, paquetes, código autogenerado, ficha técnica, PDF, pesos logísticos, inventario actual, movimientos actuales y OC existente. No se crean tickets ficticios para reconstruir capacidades ya trabajadas.

## 22. Riesgos y Dependencias

- PO-001 condiciona la dimensión final de inventario y reportes por Sucursal.
- PO-003 condiciona pedidos con insuficiencia y compromisos negativos.
- PO-007 condiciona estados de pago y saldo de Venta.
- Idempotencia y concurrencia son obligatorias en Recepción, Pedido, Surtimiento, Cobro, Reingreso, NC/Vale y aplicaciones.
- Reutilización futura de NEXT requiere autorización expresa del Product Owner.

## 23. Reglas de Estado del Backlog

Estados permitidos: PENDIENTE, EN ANÁLISIS, BLOQUEADO POR DECISIÓN PO, LISTO PARA DESARROLLO, EN DESARROLLO, LISTO PARA QA, EN QA, APROBADO POR PO, CERRADO. Definido en V6 no equivale a implementado; certificado técnicamente no equivale a aprobado por PO.

## 24. Orden Recomendado de Implementación

Fundación actual -\> S0 -\> S1 -\> S2, con S3/S5/S6 parcialmente paralelizables -\> S4 -\> S7 -\> S8 -\> S9. El primer foco recomendado es Inventario por Variante + Evolución OC + Recepción.

## 25. Criterios de Cierre del Programa

El programa cierra cuando los Gates S0-S9 demuestren continuidad funcional, 0 dependencias NEXT activas, trazabilidad completa, multitenant backend, variantes E2E, efectos de inventario y dinero consistentes, documentación actualizada y aprobación expresa del Product Owner.

## 26. Anexo de Tablas/Entidades

Las 26 tablas maestras recibidas se consolidan editorialmente en el cuerpo principal y anexos. El detalle técnico secundario incluye snapshots documentales, fuente de verdad por dato, matriz de idempotencia, auditoría/trazabilidad detallada, compatibilidad histórica, riesgos técnicos, Gates extendidos e inventario completo de entidades.

## 27. Anexo de Decisiones PO

PO-001 a PO-011 se mantienen pendientes de definición expresa por el Product Owner. PO-009, PO-010 y PO-011 fueron agregadas como corrección documental controlada para no presentar alcance de Caja, Flete en ventas parciales ni cierre comercial/operativo de Servicio como reglas ya aprobadas.

## 28. Anexo de Tickets

Índice completo COM-001 a COM-146 incluido en el Backlog Detallado por Sprint. Validación documental corregida: 146 IDs únicos, 0 faltantes, 0 duplicados, P0=106, P1=39, P2=1, P3=0.
