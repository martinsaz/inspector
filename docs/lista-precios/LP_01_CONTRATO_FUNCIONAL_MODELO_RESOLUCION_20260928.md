# LP-01 - Contrato funcional y modelo de resolucion

Fecha: 2026-09-28  
Ticket: `LP-01`  
Estado: `CONTRATO FUNCIONAL COMPLETO / LISTO PARA REVISION PO`  
Tipo: definicion funcional/tecnica documental.  
Resultado maximo autorizado: contrato para LP-02, sin implementacion.

Este documento reemplaza el LP-01 generado previamente a partir del prompt truncado. La fuente valida para esta version es el contrato #MOKA LP-01 completo recibido despues, junto con LP-AUD-01, el backlog aprobado por PO y el modelo actual de CheckApp.

## 1. Alcance

LP-01 define que es Lista de Precios CheckApp V1, como se identifica el precio aplicable y que reglas debe recibir LP-02 para disenar posteriormente Schema V1.

LP-01 no implementa:
- DDL, tablas, campos, indices ni migraciones.
- API productiva.
- UI.
- Menu.
- Roles/Permisos.
- Login/Auth/Firebase/sesion/cookies/claims.
- Cambios en Legacy Raramuri/sazapi.
- Cambios en ProductosServicios, Variantes, PresentacionesVenta, Inventario, Curvas, OC o Recepcion.

## 2. Fuentes

- MVC CheckApp: `/Users/denissemendiola/dev/Inspecciones/inspector/AGENTS.md`.
- MVC CheckApp: `/Users/denissemendiola/dev/Inspecciones/inspector/CLAUDE.md`.
- API CheckApp: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/AGENTS.md`.
- API CheckApp: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/CLAUDE.md`.
- LP-AUD-01: `/Users/denissemendiola/dev/Inspecciones/inspector/docs/lista-precios/LP_AUD_01_AUDITORIA_LISTA_PRECIOS_20260928.md`.
- Backlog aprobado PO: `/Users/denissemendiola/Downloads/BACKLOG_LISTA_PRECIOS_CHECKAPP_20260928.pdf`.
- Contrato LP-01 completo: `/Users/denissemendiola/.codex/attachments/f20432f9-c6a8-424e-bc9e-4a46db11da8c/Texto pegado.txt`.
- Modelo actual CheckApp: `ProductosServicios`, `ProductosServiciosVariantes`, `ProductosServiciosPresentacionesVenta`.
- Motor actual de PresentacionesVenta: `ProductoPresentacionVentaPricingEngine`.
- Deuda tecnica vigente de servicios: `DEUDA_TECNICA_PS_UNIDAD_SERVICIO_20260928.md`.

## 3. Decisiones PO incorporadas

| # | Decision | Regla LP-01 |
|---|---|---|
| 1 | Adaptar a ProductosServicios CheckApp. | No copiar `barcode + talla` como estructura canonica. |
| 2 | Soportar Productos y Servicios. | Ambos participan en V1. |
| 3 | Precio por identidad vendible real. | Producto base, Variante, PresentacionVenta y Servicio. |
| 4 | Sin precio especifico, usar PrecioPublico vigente. | Fallback obligatorio. |
| 5 | Sucursal/tienda como Legacy. | Contexto operativo; no determina precio. |
| 6 | Vigencia como Legacy. | No motor nuevo de vigencias. |
| 7 | Prioridad como Legacy. | Lista 1 default; no motor avanzado. |
| 8 | PrecioComparacion fuera de LP V1. | Permanece en Producto/Servicio/Variante actual. |
| 9 | Costo solo referencia. | LP no modifica Costo. |
| 10 | Edicion masiva futura. | Debe existir experiencia masiva adaptada a CheckApp. |

## 4. Que es una Lista de Precios V1

Lista de Precios CheckApp V1 es una configuracion comercial de precios de venta por nivel/lista, aplicable a la identidad vendible real de Productos y Servicios.

No es una cabecera Legacy copiada literalmente. Legacy mostro diez columnas fisicas de precio, no una entidad rica con moneda, cliente, prioridad, sucursal o motor de vigencias.

En CheckApp V1, la lista/nivel representa el conjunto conceptual de precios especificos que pueden sobrescribir el precio publico vigente de una identidad vendible. Cuando no hay precio especifico aplicable, el precio publico vigente sigue siendo la respuesta comercial.

## 5. Listas/niveles

Evidencia:
- LP-AUD-01 localizo Legacy con listas 1..10: `precio`, `precio2`, `precio3`, `mayoreo`, `mayoreo2`, `mayoreo3`, `precio7`, `precio8`, `precio9`, `precio10`.
- Backlog aprobado PO indica que LP-01 debe definir identidad de `Lista 1..10`.
- Decision PO cerrada: Lista 1 es default operativo.

Contrato V1:
- V1 conserva diez niveles conceptuales: Lista 1 a Lista 10.
- Lista 1 es el default operativo.
- Las Listas 2..10 son niveles alternos seleccionables, sin motor de prioridad entre ellas.
- Si no se informa lista o la lista no es valida, se usa Lista 1.
- LP-01 no define nombres comerciales, descripciones, colores, permisos ni UI para esas listas.

## 6. Identidad vendible

La identidad vendible es el elemento exacto que se vende y sobre el que se resuelve precio.

| Identidad | V1 | Evidencia/regla |
|---|---|---|
| Producto base | Si | `ProductosServicios` tipo Producto con `PrecioPublico`. |
| Servicio | Si | `ProductosServicios` tipo Servicio; sin Unidad Base operativa. |
| Variante | Si | `ProductosServiciosVariantes` tiene identidad, `Activo` y precio publico opcional. |
| PresentacionVenta | Si | `ProductosServiciosPresentacionesVenta` tiene identidad, `Activo` y `Precio`. |
| Variante + PresentacionVenta | No en V1 | El modelo actual no evidencia relacion directa entre variante y presentacion. |

La identidad vendible no debe duplicarse en estructuras paralelas. LP-02 debe reutilizar las identidades actuales.

## 7. Producto base

Un Producto base es vendible cuando se vende el producto sin variante especifica ni presentacion especifica.

Reglas:
- Puede tener precio especifico de Lista.
- Sin precio especifico, fallback a `ProductosServicios.PrecioPublico`.
- No modifica `Costo`.
- No modifica `PrecioComparacion`.
- No modifica Unidad Base, SAT ni Inventario.
- Si el producto esta inactivo, no debe resolver precio activo.

## 8. Servicio

Servicio participa directamente en LP V1.

Reglas:
- Puede tener precio especifico de Lista.
- Sin precio especifico, fallback a `ProductosServicios.PrecioPublico`.
- Prohibido reintroducir Unidad Base operativa.
- La unidad fisica interna que pueda existir por compatibilidad de schema no es semantica funcional para LP.
- Si el servicio esta inactivo, no debe resolver precio activo.

## 9. Variante

Variante reutiliza `ProductosServiciosVariantes`.

Reglas:
- Puede tener precio especifico de Lista.
- Sin precio especifico de Lista, fallback a `ProductosServiciosVariantes.PrecioPublico` cuando exista.
- Si la variante no tiene `PrecioPublico`, fallback al `PrecioPublico` del producto padre.
- Variante inactiva no debe resolver precio activo.
- No DELETE fisico destructivo.
- No modificar Curvas.

## 10. PresentacionVenta

PresentacionVenta reutiliza `ProductosServiciosPresentacionesVenta`.

Reglas:
- Puede tener precio especifico de Lista.
- Sin precio especifico de Lista, fallback a `ProductosServiciosPresentacionesVenta.Precio`.
- Presentacion inactiva no debe resolver precio activo.
- No crear presentacion paralela.
- No confundir con PresentacionesCompra.

## 11. Variante + PresentacionVenta

V1 no soporta precio especifico para combinacion Variante + PresentacionVenta.

Sustento:
- `ProductosServiciosVariantes` se relaciona con `ProductosServicios`.
- `ProductosServiciosPresentacionesVenta` se relaciona con `ProductosServicios`.
- No hay relacion actual variante-presentacion ni motor que resuelva esa combinacion como identidad vendible propia.

Regla:
- Si un flujo futuro requiere Variante + PresentacionVenta, eso queda fuera de V1 y requiere decision PO posterior.
- LP-02 no debe modelar esta combinacion.

## 12. Precedencia

La precedencia V1 no compara simultaneamente producto, variante y presentacion como reglas competidoras. Primero se identifica que se esta vendiendo; despues se resuelve esa identidad.

Orden:
1. Lista solicitada valida; si no existe, Lista 1.
2. Identidad vendible seleccionada por el flujo: Producto base, Servicio, Variante o PresentacionVenta.
3. Precio especifico de Lista para esa identidad.
4. Fallback al precio publico vigente de esa identidad.

Reglas por seleccion:
- Si la venta selecciona Producto base, no se busca precio de Variante ni Presentacion.
- Si la venta selecciona Variante, la Variante es la identidad; no compite con Producto base salvo fallback.
- Si la venta selecciona PresentacionVenta, la Presentacion es la identidad; no compite con Producto base salvo fallback definido.
- Servicio no compite con Producto.

No existe V1:
- Prioridad por cliente.
- Prioridad por sucursal.
- Prioridad por moneda.
- Prioridad configurable.
- Motor de promociones/descuentos.

## 13. Fallback

Regla general:

`Sin precio especifico de Lista -> PrecioPublico vigente`

Detalle por identidad:

| Identidad | Precio especifico | Fallback |
|---|---|---|
| Producto base | Precio de Lista para Producto base. | `ProductosServicios.PrecioPublico`. |
| Servicio | Precio de Lista para Servicio. | `ProductosServicios.PrecioPublico`. |
| Variante | Precio de Lista para Variante. | `ProductosServiciosVariantes.PrecioPublico`; si es NULL, producto padre. |
| PresentacionVenta | Precio de Lista para PresentacionVenta. | `ProductosServiciosPresentacionesVenta.Precio`. |

El fallback no usa Costo ni PrecioComparacion.

## 14. Precio configurado, 0 y NULL

V1 debe distinguir:

| Valor | Significado |
|---|---|
| Precio especifico con valor mayor a 0 | Precio de Lista configurado. |
| Precio especifico igual a 0 | Precio de Lista configurado con valor cero; decision PO LP-02: valido y no activa fallback. |
| Precio especifico NULL/no existente | No configurado; activar fallback. |

Adenda de decision PO LP-02:
- `Precio Lista = 0.00` es precio configurado valido y no debe convertirse a NULL.
- `Precio NULL` o detalle inexistente significa no configurado y activa fallback.

## 15. Validaciones de precio

Evidencia actual:
- `ProductosServicios.PrecioPublico` es `DECIMAL(18,2)` y debe ser `>= 0`.
- `ProductosServicios.Costo` permite NULL y debe ser `>= 0` si existe.
- `ProductosServiciosVariantes.PrecioPublico` es nullable.
- `ProductosServiciosPresentacionesVenta.Precio` es `DECIMAL(18,2)` y debe ser `>= 0`.
- Legacy evita negativos y distingue programacion/historial, pero no prueba semantica comercial universal de precio cero.

Contrato V1:
- Negativos: no validos.
- Decimales: precios monetarios con escala 2.
- NULL/no configurado: no es precio, activa fallback.
- Redondeo: no crear motor nuevo; usar escala monetaria actual y reglas vigentes del modelo.
- Precio 0: valido por decision PO LP-02; no activa fallback.

## 16. Estados y baja logica

Estados conceptuales:
- Activo: identidad vendible disponible para resolucion activa.
- Inactivo/baja logica: identidad preservada, no vendible activa.
- Historico: operaciones pasadas deben conservar precio aplicado aunque la identidad despues quede inactiva.

Regla por dominio:
- Producto inactivo: no resolver como venta activa.
- Servicio inactivo: no resolver como venta activa.
- Variante inactiva: no resolver como venta activa.
- PresentacionVenta inactiva: no resolver como venta activa.

LP-01 no asume CRUD de cabecera de lista. LP-02 debe proponerlo solo si es necesario para schema y despues de revision PO.

## 17. Tenant

Contrato obligatorio:
- Toda resolucion ocurre dentro de `idEmpresa`.
- `idEmpresa` se resuelve server-side.
- El frontend no decide ni sustituye `idEmpresa`.
- Cross-tenant es fail closed.
- Relaciones futuras deben incluir pertenencia a empresa en todos los vinculos conceptuales.

LP-01 no crea scope, gate ni migracion.

## 18. Historico

Regla conceptual:
- Operaciones historicas deben preservar el precio aplicado al momento de la operacion.
- Si una entidad vendible queda inactiva despues, el registro historico conserva su precio aplicado y su referencia/snapshot.
- LP no debe recalcular operaciones pasadas a partir del precio vigente actual.

LP-01 no integra consumidores ni implementa snapshot. LP-09 debera conectar consumidor exacto solo con aprobacion PO.

## 19. Edicion masiva

La futura experiencia de edicion masiva debe conservar la intencion funcional Legacy adaptada a CheckApp.

Debe contemplar:
- Producto.
- Servicio.
- Variante.
- PresentacionVenta.
- Lista 1..10.
- PrecioPublico vigente.
- Precio de Lista.
- Indicador de fallback.
- Costo como referencia.
- Ganancia/margen informativos.
- Estado activo/inactivo.

Debe prohibir:
- Modificar Costo.
- Modificar PrecioComparacion.
- Crear identidades paralelas.
- Cambiar inventario.
- Modificar Curvas.
- Integrar consumidores no aprobados.

LP-01 no disena UI.

## 20. Reglas por dominio fuera de precio

| Dominio | Regla V1 |
|---|---|
| Costo | Solo referencia; no se modifica. |
| PrecioComparacion | Fuera de LP V1. |
| Sucursal | Contexto operativo; no determina precio. |
| Cliente | Fuera de V1. |
| Moneda | Sin multimoneda V1. |
| SAT | No se modifica. |
| Unidad Base | No se modifica; prohibido reintroducirla para servicios. |
| Inventario | Fuera de LP V1. |
| Curvas | Frozen. |
| OC/Recepcion | Frozen. |

## 21. Casos borde obligatorios

| Caso | Resultado V1 |
|---|---|
| Producto sin precio de Lista | Fallback a `ProductosServicios.PrecioPublico`. |
| Servicio sin precio de Lista | Fallback a `ProductosServicios.PrecioPublico`. |
| Variante sin precio de Lista | Fallback a `ProductosServiciosVariantes.PrecioPublico`; si NULL, producto padre. |
| Presentacion sin precio de Lista | Fallback a `ProductosServiciosPresentacionesVenta.Precio`. |
| Producto inactivo | Fail closed para venta activa; historico preservado. |
| Variante inactiva | Fail closed para venta activa; historico preservado. |
| Presentacion inactiva | Fail closed para venta activa; historico preservado. |
| Lista seleccionada sin precio | Fallback de identidad vendible. |
| Lista 1 sin precio | Fallback de identidad vendible. |
| PrecioPublico = 0 | Valido tecnicamente por modelo actual; requiere cuidado funcional. |
| Precio Lista = 0 | Valido como precio configurado por decision PO LP-02; no activa fallback. |
| Precio negativo | Rechazado. |
| Precio NULL/no configurado | No configurado; activar fallback. |
| Intento cross-tenant | Fail closed. |
| Historico con entidad despues inactiva | Conservar precio/snapshot aplicado. |
| Variante + Presentacion | Fuera de V1; no resolver combinacion. |

## 22. Estados de resolucion

El motor futuro debe poder distinguir estados:

| Estado | Significado |
|---|---|
| `PRECIO_LISTA` | Precio especifico encontrado para lista e identidad. |
| `FALLBACK_PRECIO_PUBLICO` | No hay precio especifico; se usa precio publico vigente. |
| `LISTA_DEFAULT` | Se uso Lista 1 por ausencia/invalidez de lista solicitada. |
| `IDENTIDAD_INACTIVA` | La identidad existe pero no es vendible activa. |
| `IDENTIDAD_INVALIDA` | La identidad no existe, no pertenece al tenant o no pertenece al producto. |
| `SIN_PRECIO_RESOLUBLE` | No hay precio especifico ni fallback valido. |
| `FUERA_DE_V1` | Caso solicitado no pertenece a V1, por ejemplo Variante + Presentacion. |

## 23. Decisiones PO pendientes

Bloqueantes:
- Ninguna para cerrar el contrato LP-01.

No bloqueantes:
- Definir en LP-02/Revision PO si se requiere cabecera CRUD de Lista o solo estructura tecnica de niveles 1..10.
- Definir profundidad exacta del historico tecnico de cambios LP.
- Definir consumidor exacto antes de LP-09.
- Definir codigos de permisos antes de LP-04 mediante auditoria de colisiones.

## 24. HANDOFF LP-02 - SCHEMA V1

LP-02 recibe estas reglas conceptuales, sin DDL:

Entidades necesarias conceptuales:
- Lista/Nivel: niveles 1..10, con Lista 1 default.
- Precio especifico de Lista.
- Identidad vendible: Producto base, Servicio, Variante, PresentacionVenta.
- Historico/auditoria de cambios, con alcance por definir tecnicamente.

Dimensiones:
- `idEmpresa`.
- Lista/nivel.
- Tipo de identidad vendible.
- Referencia a ProductoServicio.
- Referencia opcional a Variante.
- Referencia opcional a PresentacionVenta.
- Precio especifico nullable conceptualmente para distinguir no configurado.
- Estado activo/inactivo si LP-02 justifica entidad propia.

Relaciones:
- Producto/Servicio pertenece a empresa.
- Variante pertenece a empresa y producto.
- PresentacionVenta pertenece a empresa y producto.
- No existe relacion Variante + PresentacionVenta en V1.

Nullability conceptual:
- VarianteId solo existe para identidad Variante.
- PresentacionVentaId solo existe para identidad PresentacionVenta.
- Producto base y Servicio no llevan VarianteId ni PresentacionVentaId.
- Precio NULL/no existente significa no configurado y activa fallback.

Regla de unicidad:
- Un solo precio especifico activo por `idEmpresa + Lista + IdentidadVendible`.
- IdentidadVendible debe distinguir Producto base, Servicio, Variante y PresentacionVenta.
- Variante + PresentacionVenta no es identidad valida V1.

Niveles/listas:
- Lista 1..10.
- Lista 1 default.
- Sin prioridades avanzadas.

Fallback:
- Producto/Servicio: `ProductosServicios.PrecioPublico`.
- Variante: `ProductosServiciosVariantes.PrecioPublico`; si NULL, producto padre.
- PresentacionVenta: `ProductosServiciosPresentacionesVenta.Precio`.

Precedencia:
- Lista valida o Lista 1.
- Identidad vendible seleccionada.
- Precio especifico.
- Fallback.

Estados:
- Activo/inactivo segun identidad vendible.
- Historico preservado.
- No DELETE fisico destructivo.

Tenant:
- `idEmpresa` obligatorio.
- Server-side.
- Cross-tenant fail closed.

Historico:
- Guardar precio aplicado/snapshot en consumidores futuros.
- No recalcular historicos desde precio vigente.

Casos borde:
- Los definidos en la seccion 21 son obligatorios para LP-02.

Fuera del modelo:
- Cliente.
- Moneda multiple.
- Precio por sucursal.
- Prioridad avanzada.
- Descuentos/promociones complejas.
- PrecioComparacion.
- Costo editable.
- Inventario.
- Curvas.
- OC.
- Recepcion.
- Variante + PresentacionVenta.

## 25. Elementos FROZEN

Permanecen intactos:
- PS-ACT-03.
- CAT-V1.
- BL-03.
- OC.
- Recepcion.
- Curvas.
- T25.
- Reporte Lider.
- Legacy Raramuri/sazapi.
- Auth/Login/Firebase/sesion/cookies/claims/Program.cs.
- ProductosServicios.
- Variantes.
- PresentacionesVenta.
- Inventario.

## 26. Dictamen

LP-01 queda como `CONTRATO FUNCIONAL COMPLETO / LISTO PARA REVISION PO`.

LP-02 tiene handoff conceptual suficiente para proponer Schema V1 sin reinterpretar reglas de negocio, pero no debe ejecutarse hasta revision/aprobacion PO.

No hubo implementacion. No hubo DDL. No hubo cambios de codigo productivo.
