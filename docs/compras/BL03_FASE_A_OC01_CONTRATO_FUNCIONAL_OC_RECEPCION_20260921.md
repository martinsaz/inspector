# BL-03 - FASE A - OC-01 - Contrato funcional OC + Recepcion

Fecha: 2026-09-21
Modo: contrato funcional canonico. Sin UI, sin API, sin DDL, sin migraciones, sin cambios Legacy.

## 1. Control ejecutivo

OC-01 convierte la reauditoria aprobada en contrato funcional canonico para Ordenes de Compra y Recepcion. No vuelve a auditar desde cero: consolida las fuentes previas y congela las decisiones PO recibidas para BL-03 -> FASE A -> OC-01.

Dictamen: `OC-01 CERRADO FUNCIONALMENTE` como contrato PM/PO. La implementacion tecnica queda expresamente separada en SEC-01, ARQ-01, OC-02 y REC-01.

## 2. Fuentes consolidadas

| Fuente | Uso en OC-01 | Dictamen |
| --- | --- | --- |
| `docs/compras/MOKA_REAUDITORIA_INTEGRAL_OC_RECEPCION_PERMISOS_20260921.md` | Base de decisiones, arbol Proveeduria, permisos, NEXT y Legacy | Consolidada |
| `docs/compras/MOKA_AUDITORIA_OC_RECEPCION_COMPLETO_20260920.md` | Auditoria NEXT/Legacy/ProductosServicios, estados y brechas | Consolidada |
| `docs/pattern/PATRON_CHECKAPP_OFICIAL_20260916.md` | Responsabilidad futura de pantallas complejas y puertos | Consolidada |
| `docs/pattern/PATRON_CHECKAPP_GOLDEN_MASTER_COMPONENT_MATRIX_20260917.md` | Golden Master ProductosServicios para futuras UI complejas | Consolidada |
| `inspector/AGENTS.md`, `inspector/CLAUDE.md` | Bitacora MVC vigente | Actualizada en OC-01 |
| `inspectorapi/AGENTS.md`, `inspectorapi/CLAUDE.md` | Bitacora API vigente | Actualizada en OC-01 |
| NEXT `/Activos/OrdenesCompra/Nueva`, `/Activos/OrdenesCompra/Reporte`, `/ProductosServicios/Index`, RolesPermisos, Proveedores | Evidencia de estado actual aprovechable y brechas | Solo lectura |
| Legacy `/OrdenesCompra/Index`, `/OrdenesCompra/ReporteOC`, `/RecepcionG/Index`, `/RecepcionG/ReporteRec` | Evidencia funcional de parciales, variantes, series, inventario al recibir | Solo lectura |

## 3. Decisiones PO congeladas

1. OC admite Productos.
2. OC admite Servicios.
3. Una misma OC puede ser mixta Producto + Servicio.
4. Variantes participan cuando el producto las tenga.
5. PresentacionCompra es independiente de PresentacionVenta. Opcion C aprobada.
6. Recepcion es bloque independiente dentro de Proveeduria, con Nueva y Reporte.
7. Recepcion parcial: si; una OC puede tener N recepciones.
8. Sobre-recepcion: no por ahora.
9. Series se capturan en Recepcion cuando Producto/Variante tenga control serial.
10. Crear/generar OC no incrementa inventario.
11. Confirmar recepcion de producto inventariable si impacta inventario.
12. Servicios pueden recibirse/cumplirse parcial, afectan estado OC, pero no generan inventario ni serie.
13. `idEmpresa` se resuelve server-side; cross-tenant fail closed.
14. OC/Recepcion son pantallas complejas: Golden Master `ProductosServicios/Index`, no catalogo simple.

## 4. Arbol funcional aprobado

```text
Proveeduria
|-- Productos y Servicios
|   |-- ABC Productos y Servicios
|   `-- Catalogos
|       |-- Categorias
|       |-- Marcas
|       `-- Unidades de medida
|-- Proveedores
|-- Ordenes de compra
|   |-- Nueva
|   `-- Reporte
`-- Recepcion
    |-- Nueva
    `-- Reporte
```

## 5. Agregado OrdenCompra

No se inventan nombres fisicos nuevos. Los nombres siguientes son contractuales cuando no existan aun.

| Dato funcional | Clasificacion | Contrato |
| --- | --- | --- |
| Identidad OrdenCompra | EXISTE / CONSERVAR | Debe identificar de forma unica la OC dentro de `idEmpresa`. |
| `idEmpresa` | EXISTE / CONSERVAR | Siempre server-side. La solicitud cliente no es autoridad. |
| Folio | EXISTE / CONSERVAR | Consecutivo por empresa; el mecanismo actual con lock transaccional es evidencia aprovechable. |
| Proveedor | EXISTE / CONSERVAR | Reusar Proveedores; validar tenant y activo al capturar; snapshot al generar. |
| Razon Social | EXISTE / CONSERVAR | Reusar RazonesSociales; validar tenant; snapshot al generar. |
| Sucursal | EXISTE / CONSERVAR | Reusar Sucursales; validar tenant y relacion con razon cuando aplique; snapshot al generar. |
| Fechas | EXISTE / CONSERVAR | Fecha de captura/generacion y fechas operativas de OC. |
| Estado OC | EXISTE / EVOLUCIONAR | Actualmente Borrador/Generada/Cancelada; debe evolucionar para recepcion parcial/completa. |
| Observaciones | EXISTE / CONSERVAR | Texto historico de cabecera. |
| Auditoria | EXISTE / EVOLUCIONAR | Usuario, fechas y trazabilidad deben conservarse y ampliarse para estado/recepcion. |
| Importes | EXISTE / CONSERVAR | Subtotal/total desde partidas. Impuestos no entran en OC-01 salvo contrato futuro. |
| Partidas | EXISTE / EVOLUCIONAR | Coleccion unica de OrdenCompraPartida que soporte producto/servicio/variante/presentacion/pendientes. |
| Estado recepcion | NUEVO PROPUESTO | Puede derivarse de partidas/recepciones; no requiere nombre fisico aun. |

## 6. Contrato unico OrdenCompraPartida

Una sola coleccion de partidas representa Producto o Servicio. El mapeo fisico queda para OC-02.

| Dato funcional | Clasificacion | Contrato |
| --- | --- | --- |
| OrdenCompraPartidaId | EXISTE / CONSERVAR | Identidad de partida. |
| OrdenCompraId | EXISTE / CONSERVAR | Relacion con cabecera. |
| idEmpresa | EXISTE / CONSERVAR | Validacion tenant obligatoria en cada acceso. |
| TipoPartida Producto/Servicio | EXISTE / CONSERVAR | Deriva de ProductosServicios `Tipo`; contrato usa Producto/Servicio. |
| ProductoServicioId | EXISTE / CONSERVAR | Referencia viva a ProductosServicios. |
| VarianteId nullable | NUEVO PROPUESTO | Null si no aplica; requerido si producto tiene variantes. |
| PresentacionCompraId nullable | NUEVO PROPUESTO | Independiente de PresentacionVenta; nullable cuando se capture unidad base. |
| Unidad base / relacion real | EVOLUCIONAR | Unidad base de ProductosServicios y equivalencia real de compra. |
| CantidadCompra | EVOLUCIONAR | Cantidad capturada en unidad/presentacion de compra. |
| FactorConversion snapshot | NUEVO PROPUESTO | Congelado al generar la OC cuando aplique PresentacionCompra. |
| CantidadBase | NUEVO PROPUESTO | `CantidadCompra * FactorConversion` o `CantidadCompra` si unidad base. |
| CostoUnitarioCompra | EXISTE / EVOLUCIONAR | Costo de compra por cantidad capturada; snapshot historico. |
| Subtotal | EXISTE / CONSERVAR | `CantidadCompra * CostoUnitarioCompra`, normalizado. |
| CantidadRecibidaAcumulada | NUEVO PROPUESTO | Suma de recepciones confirmadas vigentes. |
| CantidadPendiente | NUEVO PROPUESTO | `CantidadBase - CantidadRecibidaAcumulada`, o cantidad compatible en servicios. |
| EstadoPartida | NUEVO PROPUESTO | Pendiente, Parcial, Completa, Cancelada si aplica. |
| Snapshots historicos | EVOLUCIONAR | Nombre, descripcion, tipo, variante, presentacion, unidad, factor, costo y flags relevantes. |

## 7. Matriz de partidas

| Caso | Contrato | Ejemplo | Validaciones |
| --- | --- | --- | --- |
| Producto sin variante | `TipoPartida=Producto`, `VarianteId=null` | Aceite generico sin variantes, 10 piezas | Producto tenant/activo, `Tipo=Producto`, sin variantes obligatorias, cantidad > 0, costo >= 0 |
| Producto con variante | `TipoPartida=Producto`, `VarianteId` requerido | Playera / Talla M / Color Negro | Variante pertenece al producto y al tenant; no permitir partida sin variante si el producto la requiere |
| Servicio | `TipoPartida=Servicio`, `VarianteId=null`, sin inventario/serie | Servicio de instalacion, cantidad 4 | `Tipo=Servicio`, cantidad > 0, costo >= 0, sin inventario, sin series |
| OC mixta | Mismo folio con cualquier combinacion valida | Aceite + Filtro variante + Servicio instalacion | Totales suman todo; estados se calculan por todas las partidas; no separar por tipo |

## 8. PresentacionCompra V1

PresentacionCompra V1 queda aprobada como entidad/concepto separado de PresentacionVenta. No se implementa aun.

Proposito: representar como compra el empaque/unidad pactada con el proveedor o usada operativamente para comprar, conservando equivalencia hacia unidad base para recepcion e inventario.

Contrato V1:

- Pertenece conceptualmente a Producto y opcionalmente a Variante cuando el empaque difiera por variante.
- Tiene nombre visible, unidad de compra, factor/equivalencia hacia unidad base, estatus y orden/predeterminada si se define en OC-02.
- El factor usado en una partida queda congelado como snapshot. Cambios posteriores al catalogo no alteran OC historica.
- `PresentacionVenta != PresentacionCompra`. No se reutilizan precio ni semantica de venta.
- Proveedor en V1: `NO` como requisito cerrado de OC-01. Evidencia: auditorias previas proponian evaluar proveedor y no hay contrato/schema aprobado; por tanto Proveedor queda como evolucion futura posible para OC-02/ARQ posterior, no como hecho.

Ejemplo obligatorio:

```text
Producto: Aceite 5W-30
PresentacionCompra: Caja 12
CantidadCompra: 10
FactorConversionSnapshot: 12
CantidadBase: 120
```

## 9. Variantes

- Producto sin variantes: `VarianteId = null`.
- Producto con variantes requeridas: no se genera partida sin `VarianteId`.
- La variante debe pertenecer al ProductoServicio y al mismo `idEmpresa`.
- La variante se conserva historicamente en snapshots hasta Recepcion, Series e Inventario.
- OC-01 no resuelve existencia por Variante/Sucursal. Eso queda en ARQ-01 como `REQUIERE_DECISION_PO_INVENTARIO_VARIANTE_SUCURSAL`.

## 10. Servicios

Servicio en OC:

- Se selecciona desde ProductosServicios con `Tipo=Servicio`.
- Tiene cantidad, costo, subtotal, snapshot de nombre/descripcion/tipo/unidad/costo.
- Puede recibirse/cumplirse parcial o totalmente.
- Tiene pendiente y estado de partida.
- No genera inventario.
- No genera series.
- Si productos estan completos pero un servicio sigue pendiente, la OC global NO esta completa.

## 11. OC mixta

Una sola OC puede incluir Producto A, Producto B con Variante y Servicio C.

Reglas:

- No se separa por tipo.
- Total = suma de subtotales de todas las partidas.
- Pendiente global = existe al menos una partida pendiente.
- Estado global deriva del conjunto completo de partidas.
- Reporte OC debe mostrar productos, variantes, PresentacionCompra, servicios, ordenado, recibido y pendiente.
- Recepcion permite recibir/cumplir solo partidas con pendiente.

## 12. Snapshots

| Dato | Snapshot | Justificacion |
| --- | --- | --- |
| Nombre producto/servicio | SI | Historico no debe cambiar por renombre de catalogo. |
| Descripcion | SI | La OC debe conservar lo comprado/contratado. |
| Tipo Producto/Servicio | SI | Cambios de catalogo no deben reescribir naturaleza historica. |
| Variante | SI | La variante comprada debe llegar a recepcion/series/inventario. |
| PresentacionCompra | SI | La presentacion y factor son parte del acuerdo historico. |
| Unidad | SI | Necesaria para leer cantidades antiguas. |
| FactorConversion | SI | Evita doble conversion y mutacion historica. |
| Costo | SI | Costo pactado no cambia por maestro. |
| Proveedor | SI | Cabecera historica visible y reportable. |
| Razon Social | SI | Documento historico no cambia por catalogo. |
| Sucursal | SI | Documento historico no cambia por catalogo. |
| idEmpresa | NO como snapshot | Es frontera de seguridad viva, no dato historico mutable. |

## 13. Estados OC

Estados reales auditados NEXT:

- `1 Borrador`
- `2 Generada`
- `3 Cancelada`

State machine canonica:

| Origen | Evento | Destino | Validaciones |
| --- | --- | --- | --- |
| Nuevo | Guardar borrador | Borrador | Cabecera valida, al menos puede estar en captura, tenant valido |
| Borrador | Generar | Generada/Emitida | Al menos una partida, totales validos, snapshots congelados, folio reservado |
| Generada/Emitida | Confirmar recepcion parcial | Parcialmente recibida | Existe recepcion confirmada y queda pendiente |
| Generada/Emitida | Confirmar recepcion completa | Recibida | Todas las partidas completas |
| Parcialmente recibida | Confirmar recepcion parcial | Parcialmente recibida | Sin sobre-recepcion |
| Parcialmente recibida | Confirmar recepcion final | Recibida | Pendiente queda 0 en todas las partidas |
| Borrador/Generada | Cancelar | Cancelada | Politica PO para recepciones ya confirmadas queda fuera |

`Generada` y `Emitida` son equivalentes funcionales; el nombre visible final se decide en OC-02 sin cambiar la regla.

## 14. Estados partida

| Estado | Uso |
| --- | --- |
| Pendiente | `CantidadRecibidaAcumulada = 0` y cantidad ordenada/base > 0 |
| Parcial | `0 < CantidadRecibidaAcumulada < CantidadBase` |
| Completa | `CantidadRecibidaAcumulada = CantidadBase` |
| Cancelada | Solo si OC-02/REC-01 aprueban cancelacion de partida o cierre manual |

Servicio usa la misma semantica de pendiente/parcial/completa con cantidad de cumplimiento, pero sin inventario ni series.

## 15. Contrato Recepcion

Recepcion es bloque independiente dentro de Proveeduria. Una OC puede tener N Recepciones.

Recepcion:

- RecepcionId
- idEmpresa
- Folio si aplica
- OrdenCompraId
- Fecha
- Estado
- Observaciones
- Usuario
- Partidas

RecepcionPartida:

- RecepcionPartidaId
- RecepcionId
- OrdenCompraPartidaId
- TipoPartida
- ProductoServicioId
- VarianteId nullable
- CantidadOrdenada
- RecibidaAnterior
- EstaRecepcion
- RecibidaAcumulada
- Pendiente
- Estado
- Series cuando aplique
- Snapshots minimos de lectura

## 16. Recepcion parcial

Formulas canonicas:

```text
PendienteAntes = Ordenada - RecibidaAnterior
0 <= EstaRecepcion <= PendienteAntes
RecibidoNuevo = RecibidoAnterior + EstaRecepcion
PendienteNuevo = Ordenada - RecibidoNuevo
```

No se permiten negativos ni sobre-recepcion.

Ejemplo obligatorio:

```text
Ordenada = 120
Recepcion 1: anterior 0, ahora 60, acumulada 60, pendiente 60
Recepcion 2: anterior 60, ahora 40, acumulada 100, pendiente 20
Estado partida: Parcial
Estado OC: Parcialmente recibida si cualquier partida queda pendiente
```

## 17. Recepcion de servicios

Servicio usa el contrato de RecepcionPartida cuando sea coherente:

```text
Servicio ordenado = 4
Recibida/cumplida anterior = 2
Esta recepcion/cumplimiento = 1
Acumulada = 3
Pendiente = 1
```

Reglas:

- No inventario.
- No series.
- Puede requerir observacion/evidencia futura, pero evidencia no se implementa en OC-01.
- Afecta estado de partida y estado global de OC.

## 18. Series

Aplican solo si:

- `TipoPartida=Producto`.
- Producto/Variante tiene `ControlSerie=true` o flag equivalente vigente (`UsaNumeroSerie` en ProductosServicios).
- `EstaRecepcion > 0`.

Contrato:

```text
Recepcion
  1:N RecepcionPartida
    1:N RecepcionPartidaSerie
```

Validaciones:

- Serie no vacia.
- Cantidad de series = cantidad recibida seriada.
- No duplicadas dentro de la misma RecepcionPartida.
- No duplicadas historicamente para `idEmpresa` segun politica vigente.
- La serie corresponde a idEmpresa, ProductoServicio, Variante si existe, OC y Recepcion.
- Servicio nunca requiere ni acepta series.

## 19. Inventario - frontera

- Generar OC = no movimiento de inventario.
- Confirmar recepcion de Producto inventariable = si genera movimiento/entrada de inventario.
- Servicio = no inventario.
- Producto no inventariable = no movimiento salvo decision futura.
- No improvisar existencia por variante/sucursal dentro de OC-01.

Pendiente tecnico obligatorio:

```text
REQUIERE_DECISION_PO_INVENTARIO_VARIANTE_SUCURSAL
```

ARQ-01 debe decidir si el inventario se mantiene en ProductosServicios actual, evoluciona, o se crea un scope complementario para variante/sucursal/almacen.

## 20. Transaccion futura de recepcion

REC-01/REC-02 deben implementar una transaccion atomica equivalente a:

```text
Begin
  Validar tenant
  Validar permiso
  Validar Gate/Scope compatible
  Validar OC y estado recepcionable
  Validar pendientes
  Validar variantes
  Validar series
  Guardar recepcion
  Guardar partidas de recepcion
  Guardar series
  Generar movimientos inventario si Producto inventariable
  Actualizar acumulados
  Actualizar estado partida
  Actualizar estado OC
Commit
```

Cualquier fallo debe hacer `ROLLBACK`. Confirmacion debe ser idempotente y concurrente-segura.

## 21. Responsabilidad de pantallas

No se implementa UI en OC-01. Esta es la responsabilidad futura.

Nueva OC:

1. Configuracion: Proveedor, Razon Social, Sucursal, Fechas, Observaciones.
2. Productos y Servicios: buscador, Tipo, Variante, PresentacionCompra, Cantidad, Costo.
3. Partidas: editar/eliminar, subtotales, total, validaciones.
4. Revisar y generar: snapshots, folio, total, generacion.

Reporte OC:

- Folio, Proveedor, Razon, Sucursal, Fecha, Total, Estado OC, Estado recepcion.
- Producto, Variante, PresentacionCompra, Servicio.
- Cantidades, Recibido, Pendiente.

Nueva Recepcion:

- Seleccionar OC.
- Resumen.
- Pendientes.
- Recibir/cumplir ahora.
- Series condicionales.
- Observaciones.
- Revisar.
- Confirmar.

Reporte Recepcion:

- Recepcion, OC, Proveedor, Razon, Sucursal, Fecha, Estado.
- Producto, Variante, PresentacionCompra, Servicio.
- Cantidad, Series, Usuario.

## 22. Reglas canonicas RB-OC

| ID | Regla | Fuente | Entidad | Validacion | Error esperado |
| --- | --- | --- | --- | --- | --- |
| RB-OC-001 | Crear/generar OC no incrementa inventario | DECISION_PO/LEGACY/NEXT | OrdenCompra | Ningun movimiento por generar | 409/validacion si intenta mover inventario |
| RB-OC-002 | OC debe tener al menos una partida para generarse | NEXT | OrdenCompra | Partidas activas > 0 | 400 sin partidas |
| RB-OC-003 | Una partida refiere ProductoServicio real | PRODUCTOSSERVICIOS | Partida | `idEmpresa + ProductoServicioId` existe y activo | 404/400 producto no disponible |
| RB-OC-004 | Producto puede comprarse | DECISION_PO | Partida | `TipoPartida=Producto` valido | 400 tipo invalido |
| RB-OC-005 | Servicio puede comprarse | DECISION_PO | Partida | `TipoPartida=Servicio` valido | 400 tipo invalido |
| RB-OC-006 | OC mixta esta permitida | DECISION_PO | OrdenCompra | Productos y Servicios en mismo folio | No separar en otra OC |
| RB-OC-007 | Variante es obligatoria cuando el producto la requiere | DECISION_PO/PRODUCTOSSERVICIOS | Partida | Producto con variantes requiere VarianteId | 400 variante requerida |
| RB-OC-008 | Variante debe pertenecer al producto y tenant | PRODUCTOSSERVICIOS | Partida | `idEmpresa + ProductoServicioId + VarianteId` | 404/409 variante invalida |
| RB-OC-009 | PresentacionCompra es independiente de PresentacionVenta | DECISION_PO | Partida | No usar PresentacionesVenta como compra | 400 presentacion compra invalida |
| RB-OC-010 | Factor de PresentacionCompra queda snapshot | DECISION_PO | Partida | Factor congelado al generar | 409 si falta factor aplicable |
| RB-OC-011 | CantidadBase deriva de cantidad y factor | PRODUCTOSSERVICIOS/DECISION_PO | Partida | `CantidadBase = CantidadCompra * Factor` | 400 conversion invalida |
| RB-OC-012 | Snapshots historicos son obligatorios | DECISION_PO | OrdenCompra/Partida | Snapshot antes de Generada | 409 snapshots incompletos |
| RB-OC-013 | Folio se reserva de forma concurrente-segura por empresa | NEXT | OrdenCompra | Lock/transaccion por empresa | 409 concurrencia/folio |
| RB-OC-014 | Cross-tenant falla cerrado | DECISION_PO/PRODUCTOSSERVICIOS | Todas | Nunca aceptar IDs de otro `idEmpresa` | 403/404 |
| RB-OC-015 | OC completa exige todas las partidas completas | DECISION_PO | OrdenCompra | Ninguna partida pendiente | Estado no puede ser Recibida |
| RB-OC-016 | Servicio pendiente mantiene OC no completa | DECISION_PO | OrdenCompra | Servicios incluidos en calculo | Estado Parcial/Pendiente |
| RB-OC-017 | Cancelar con recepciones requiere politica futura | LEGACY/DECISION_PO | OrdenCompra | No cancelar si hay recepcion sin regla | 409 politica no definida |
| RB-OC-018 | No elevar propuestas a decision | PRODUCTOSSERVICIOS/NEXT | Contrato | Codigos permiso/schema no inventados | Bloqueo a ticket futuro |

## 23. Reglas canonicas RB-REC

| ID | Regla | Fuente | Entidad | Validacion | Error esperado |
| --- | --- | --- | --- | --- | --- |
| RB-REC-001 | Recepcion es bloque independiente de Proveeduria | DECISION_PO | Recepcion | Nueva/Reporte separados | No mezclar como accion menor de OC |
| RB-REC-002 | Una OC tiene N recepciones | DECISION_PO/LEGACY | Recepcion | Permitir multiples documentos | 400 si se fuerza unicidad por OC |
| RB-REC-003 | Solo OC generada/parcial con pendiente es recepcionable | LEGACY/NEXT | Recepcion | Estado y pendientes | 409 no recepcionable |
| RB-REC-004 | Recepcion parcial permitida | DECISION_PO/LEGACY | RecepcionPartida | `EstaRecepcion < PendienteAntes` valida | No completar indebidamente |
| RB-REC-005 | Sobre-recepcion prohibida | DECISION_PO | RecepcionPartida | `EstaRecepcion <= PendienteAntes` | 409 sobre-recepcion |
| RB-REC-006 | No negativos | DECISION_PO | RecepcionPartida | Cantidades >= 0 y pendiente >= 0 | 400 cantidad invalida |
| RB-REC-007 | Producto inventariable recibido impacta inventario | DECISION_PO/PRODUCTOSSERVICIOS | RecepcionPartida | Producto + inventariable + confirmada | Rollback si no movimiento |
| RB-REC-008 | Servicio recibido no mueve inventario | DECISION_PO | RecepcionPartida | Tipo Servicio no genera movimiento | 409 si intenta mover |
| RB-REC-009 | Servicio nunca captura serie | DECISION_PO | RecepcionPartida | Tipo Servicio rechaza series | 400 series no permitidas |
| RB-REC-010 | Producto serializado requiere series completas | DECISION_PO/PRODUCTOSSERVICIOS | Serie | Cantidad series = cantidad recibida seriada | 400 series incompletas |
| RB-REC-011 | Serie no vacia ni duplicada en recepcion | LEGACY | Serie | Normalizacion y duplicado local | 409 serie duplicada |
| RB-REC-012 | Serie no duplicada por empresa segun politica | LEGACY/PRODUCTOSSERVICIOS | Serie | `idEmpresa + serie` historico | 409 serie existente |
| RB-REC-013 | Serie conserva variante si existe | DECISION_PO | Serie | Variante de partida = variante de serie | 409 variante incompatible |
| RB-REC-014 | Confirmacion atomica | PRODUCTOSSERVICIOS/LEGACY | Recepcion | Recepcion+inventario+acumulados en una transaccion | Rollback completo |
| RB-REC-015 | Confirmacion idempotente | PRODUCTOSSERVICIOS | Recepcion | Reintento no duplica documento/movimiento | 409/idempotent replay |
| RB-REC-016 | Estado OC se recalcula tras recepcion | LEGACY/DECISION_PO | OrdenCompra | Partidas determinan global | Estado incoherente bloqueado |
| RB-REC-017 | ARQ-01 define inventario variante/sucursal | DECISION_PO | Inventario | No improvisar destino fisico | Bloqueo tecnico |
| RB-REC-018 | Cross-tenant falla cerrado | DECISION_PO | Todas | OC/partidas/series mismo tenant | 403/404 |

## 24. Dependencias y tickets futuros

| Ticket | Queda para | Motivo |
| --- | --- | --- |
| SEC-01 | Permisos/codigos OC y Recepcion | OC-01 no inventa codigos. Debe definir ramas funcionales y AuthZ real. |
| ARQ-01 | Inventario Variante/Sucursal | Requiere decision tecnica/PO antes de recepcion productiva. |
| OC-02 | Modelo/schema tecnico OC | Mapear contrato a tablas/campos/versionamiento sin DDL manual. |
| REC-01 | Contrato/schema tecnico Recepcion | Definir recepcion, detalle, series, idempotencia y transaccion. |

No ejecutar esos tickets desde OC-01.

## 25. DoD OC-01

| Punto | Estado |
| --- | --- |
| Fuentes previas consolidadas | PASS |
| Agregado OC definido | PASS |
| Partida unica Producto/Servicio definida | PASS |
| Producto sin variante definido | PASS |
| Producto con variante definido | PASS |
| PresentacionCompra V1 formalizada | PASS |
| Servicio definido | PASS |
| OC mixta definida | PASS |
| Snapshots definidos | PASS |
| Estados/transiciones definidos | PASS |
| Recepcion agregada definida | PASS |
| Recepcion parcial definida | PASS |
| Servicios en recepcion definidos | PASS |
| Series definidas | PASS |
| Frontera inventario definida | PASS |
| Dependencia ARQ-01 explicita | PASS |
| Responsabilidades 4 pantallas definidas | PASS |
| RB-OC/RB-REC creadas | PASS |
| No contradicciones con reauditoria | PASS |
| AGENTS/CLAUDE actualizados | PASS al actualizar bitacoras |
| Legacy sin cambios | PASS |
| No DDL/migraciones | PASS |
| No implementacion UI/API | PASS |
| T25 FROZEN | PASS |
| Reporte lider FROZEN | PASS |
| git diff --check documentacion tocada | Pendiente de verificacion final |
| 5200 y 5127 libres al finalizar | Pendiente de verificacion final |

## 26. Dictamen

OC-01 queda cerrado como contrato funcional canonico para OC + Recepcion en BL-03 FASE A. El siguiente ticket recomendado es SEC-01 o ARQ-01:

- SEC-01 si el PO quiere cerrar arbol/codigos/permisos antes de schema.
- ARQ-01 si el PO quiere resolver primero el destino de inventario por Variante/Sucursal, porque Recepcion productiva depende de esa frontera.

No se ejecuta ningun ticket posterior desde OC-01.
