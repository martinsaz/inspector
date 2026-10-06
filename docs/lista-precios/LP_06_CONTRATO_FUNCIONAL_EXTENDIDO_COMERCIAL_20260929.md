# #MOKA LP-06 - CONTRATO FUNCIONAL EXTENDIDO COMERCIAL LISTA DE PRECIOS

Fecha: 2026-09-29  
Estado: CONTRATO FUNCIONAL EXTENDIDO COMPLETO / LISTO REVISION PO  
Tipo: documento funcional-tecnico; no implementacion  
Alcance: Lista de Precios CheckApp posterior a LP-05R7 y backlog corregido post R7.

## 1. Resumen ejecutivo

LP-06 cierra el contrato comercial extendido para Lista de Precios antes de cualquier LP-07. El resultado NO implementa codigo, NO modifica base de datos, NO ejecuta DDL, NO cambia API/UI, NO modifica Legacy y NO genera ni renumera backlog.

El contrato canonico queda definido para:

- listas 1..10, Lista 1 default;
- Producto, Servicio, Variante y PresentacionVenta;
- precio base/original, Precio Lista, descuento, subtotal antes de redondeo, redondeo, precio final y promocion;
- `0.00` como precio valido;
- `NULL` o fila ausente como no configurado/fallback;
- redondeo Legacy real: Sin redondeo, A 4/9, Solo a 9;
- promociones obligatorias como dominio funcional, con decisiones PO pendientes cuando Legacy no demuestra semantica transaccional suficiente;
- historico minimo y snapshots para consumidores.

## 2. Fuentes obligatorias leidas

### 2.1 CheckApp MVC/API

- `inspector/AGENTS.md`
- `inspector/CLAUDE.md`
- `inspectorapi/AGENTS.md`
- `inspectorapi/CLAUDE.md`

### 2.2 Antecedentes Lista de Precios

- `inspector/docs/lista-precios/LP_AUD_01_AUDITORIA_LISTA_PRECIOS_20260928.md`
- `inspector/docs/lista-precios/LP_01_CONTRATO_FUNCIONAL_MODELO_RESOLUCION_20260928.md`
- `inspector/docs/lista-precios/LP_02_SCHEMA_V1_VERSIONADO_GATE_20260928.md`
- `inspector/docs/lista-precios/LP_03_API_MOTOR_RESOLUCION_PRECIOS_20260928.md`
- `inspector/docs/lista-precios/LP_04_ROLES_PERMISOS_MENU_20260928.md`
- `inspector/docs/lista-precios/LP_05_PANTALLA_BASE_LISTA_PRECIOS_20260928.md`
- `inspector/docs/lista-precios/LP_05R7_AUDITORIA_FUNCIONAL_PROFUNDA_LEGACY_20260929.md`
- `inspector/docs/lista-precios/LP_BACKLOG_CORREGIDO_POST_R7_20260929.md`
- `inspector/docs/lista-precios/LP_DECISIONES_PO_POST_R7_20260929.md`

### 2.3 Legacy auditado READ-ONLY

- `/Users/denissemendiola/dev/Raramuri.blzr/Raramuri.blzr/Components/Pages/ProductosListaPrecios.razor`
- `/Users/denissemendiola/dev/Raramuri.blzr/Raramuri.blzr/Models/Productos/ListaPreciosModels.cs`
- `/Users/denissemendiola/dev/Raramuri.blzr/Raramuri.blzr/Services/Productos/ListaPreciosService.cs`
- `/Users/denissemendiola/dev/Raramuri.blzr/Raramuri.blzr/Services/Productos/IListaPreciosService.cs`
- `/Users/denissemendiola/dev/sazapi/Endpoints/Program.Endpoints.Productos.cs`
- `/Users/denissemendiola/dev/sazapi/Endpoints/Program.Endpoints.Ventas.cs`
- `/Users/denissemendiola/dev/sazapi/Program.Helpers.cs`
- `/Users/denissemendiola/dev/sazapi/Program.Contracts.cs`
- `/Users/denissemendiola/dev/sazapi/Infrastructure/Provisioning/LegacyScripts/V001/001_inicial.sql`

## 3. Decisiones heredadas que LP-06 no reabre

| Decision | Estado |
|---|---|
| Lista de Precios evoluciona a consola operativa | CERRADA |
| Listas comerciales 1..10 | CERRADA |
| Lista 1 default | CERRADA |
| Producto, Servicio, Variante, PresentacionVenta | CERRADA |
| Precio especifico + fallback | CERRADA |
| `0.00` es precio valido | CERRADA |
| `NULL` / fila ausente produce fallback | CERRADA |
| Descuentos, redondeos y promociones son obligatorios | CERRADA |
| Edicion individual futura | CERRADA como necesidad, no implementada en LP-06 |
| Ajuste masivo, copia de lista, descuento por marca | CERRADAS como necesidades, no implementadas en LP-06 |
| Excel, fotos, existencias, movimientos | CERRADAS como brecha frente a Legacy, no implementadas en LP-06 |
| Historico/auditoria y consumidores | CERRADAS como obligatorios |
| Sugerencias despues de fuentes | CERRADA |
| Golden Master ProductosServicios | CERRADA |
| LP-05 es base/fachada read-only | CERRADA |

## 3.1 Decisiones PO post revision - LP-06R

LP-06R incorpora decisiones PO posteriores a la primera revision documental de LP-06. Esta seccion conserva trazabilidad `ANTES -> DECISION PO -> CONTRATO ACTUAL` y no reabre decisiones ya cerradas.

| Concepto | Antes LP-06R | Decision PO | Estado |
|---|---|---|---|
| 2x1 | Regla promocional obligatoria, semantica transaccional pendiente. | Compras 2 productos participantes y pagas 1. | Regla base cerrada / detalles pendientes. |
| 3x2 | Regla promocional obligatoria, semantica transaccional pendiente. | Compras 3 productos participantes y el de menor precio queda gratis. | Regla base cerrada / detalles pendientes. |
| Descuento segundo | Promocion obligatoria, porcentaje/fuente pendiente. | Usuario define el porcentaje de descuento al configurar la promocion. | Porcentaje configurable cerrado / seleccion pendiente. |
| Monedero | Beneficio de lealtad/saldo con evidencia Legacy, alcance pendiente. | PO no definio regla funcional. | Pendiente definicion funcional; no implementar schema/motor/UI operativa. |
| Descuento menor que 0 | Pendiente rechazar vs normalizar/clamp. | Rechazar, mostrar validacion, no guardar, conservar valor anterior en edicion. | Cerrado = rechazar. |
| Descuento mayor que 100 | Pendiente rechazar vs normalizar/clamp. | Rechazar, mostrar validacion, no guardar, conservar valor anterior en edicion. | Cerrado = rechazar. |

Reglas LP-06R:

- Las promociones NO modifican ni sobrescriben automaticamente el Precio Lista almacenado.
- Las promociones se aplican despues del precio final conforme al motor/consumidor futuro.
- El Precio Lista conserva su identidad comercial.
- El snapshot futuro de promociones debe permitir conocer promocion aplicada, regla/version, unidades calificadas, unidades beneficiadas, porcentaje cuando aplique, beneficio monetario, precio previo, precio final transaccional, lista e identidad.
- Monedero permanece solo como reserva conceptual/extensibilidad/documentacion hasta decision PO posterior.

## 4. Glosario canonico LP-06

| Concepto | Definicion |
|---|---|
| Precio base / precio original | Importe bruto de la identidad vendible antes de descuento comercial. En Legacy corresponde al campo de precio de la lista: `precio`, `precio2`, `precio3`, `mayoreo`, `mayoreo2`, `mayoreo3`, `precio7`, `precio8`, `precio9`, `precio10`. |
| Precio Lista | Precio configurado para una lista comercial e identidad vendible. Puede ser explicito o ausente. Si es `0.00`, es configurado valido. |
| Descuento | Porcentaje 0..100 aplicado al precio base/original de la lista. Legacy persiste columnas `descto`, `desctop2`, `desctop3`, `desctom`, `desctom2`, `desctom3`, `desc7`, `desc8`, `desc9`, `desc10`. |
| Subtotal / antes redondeo | Resultado monetario de aplicar descuento al precio base: `precioBase * (1 - descuento / 100)`, redondeado a 2 decimales antes del redondeo comercial. |
| Redondeo | Ajuste comercial aplicado al subtotal. Modos canonicos: Sin redondeo, A 4/9, Solo a 9. |
| Precio final | Precio efectivo comercial despues de descuento y redondeo. En Legacy se calcula en UI y se materializa recalculando descuento; no se encontro persistencia del modo de redondeo ni del precio final como columna propia. |
| Promocion | Beneficio comercial adicional o regla promocional: 2x1, 3x2, descuento en segundo producto, monedero. No reemplaza por si sola el precio final; se evalua despues del precio final segun consumidor/transaccion. |
| Fallback | Uso de precio publico/base de ProductoServicio, Variante o PresentacionVenta cuando no existe precio lista configurado. |
| Snapshot | Copia inmutable de los componentes comerciales usados por un consumidor, necesaria para historico, venta, cotizacion, factura o reporte. |

## 5. Identidades vendibles

| Identidad | Participa en Lista de Precios | Regla LP-06 |
|---|---:|---|
| ProductoServicio tipo Producto | Si | Puede tener precio lista, descuento, redondeo y promociones. |
| ProductoServicio tipo Servicio | Si | Participa sin inventario ni unidad operativa obligatoria. No hereda reglas de inventario. |
| Variante | Si | Identidad vendible hija de Producto. Debe validar pertenencia exacta. |
| PresentacionVenta | Si | Identidad vendible de venta. No debe combinarse con Variante en la misma fila sin decision PO posterior. |

Reglas:

- Toda resolucion es por `idEmpresa` server-side y DatabaseIdentity/Scope.
- Identidad inactiva falla cerrado para nuevas operaciones.
- Historico conserva snapshot aunque la identidad cambie o se inactive despues.
- Servicios entran al mismo pipeline comercial, excepto reglas dependientes de inventario/existencia.

## 6. Listas 1..10

| Lista CheckApp | Legacy columna precio | Legacy columna descuento |
|---:|---|---|
| 1 | `precio` | `descto` |
| 2 | `precio2` | `desctop2` |
| 3 | `precio3` | `desctop3` |
| 4 | `mayoreo` | `desctom` |
| 5 | `mayoreo2` | `desctom2` |
| 6 | `mayoreo3` | `desctom3` |
| 7 | `precio7` | `desc7` |
| 8 | `precio8` | `desc8` |
| 9 | `precio9` | `desc9` |
| 10 | `precio10` | `desc10` |

Lista 1 es default. La seleccion de lista es explicita en consumidores o cae a Lista 1 si el consumidor no manda lista y el contrato de ese consumidor lo permite.

## 7. Contrato canonico de precio

### 7.1 Pipeline

1. Resolver tenant y permisos.
2. Validar scope `ListaPrecios`.
3. Resolver identidad vendible.
4. Resolver lista comercial.
5. Buscar configuracion especifica vigente.
6. Si hay precio lista explicito, usarlo aunque sea `0.00`.
7. Si no hay precio lista, aplicar fallback al precio publico/base de la identidad.
8. Resolver descuento: si esta configurado, usar 0..100; si esta ausente, descuento 0.
9. Calcular subtotal antes de redondeo.
10. Aplicar redondeo.
11. Calcular precio final.
12. Evaluar promociones aplicables.
13. Entregar resultado a consumidor con snapshot/auditoria.

### 7.2 Formula

```text
precioBase = precioListaConfigurado ?? precioFallback
descuentoPct = descuentoConfigurado ?? 0
subtotal = round(precioBase * (1 - descuentoPct / 100), 2)
precioFinal = aplicarRedondeo(subtotal, modoRedondeo)
promociones = evaluarPromociones(identity, lista, consumidor, contexto)
```

### 7.3 Fuente de verdad

CheckApp debe considerar fuente de verdad los componentes persistidos y versionados: identidad, lista, precio lista/fallback, descuento, modo de redondeo, vigencia y promociones configuradas. El precio final es deterministico a partir de esos componentes para operaciones activas; consumidores historicos deben guardar snapshot para no recalcular documentos pasados.

Legacy evidencia que el precio final NO se persiste como columna propia en Lista de Precios: se recalcula en UI y se transforma en descuento antes de guardar.

## 8. NULL, fila ausente, 0.00 y fallback

| Caso | Resultado canonico |
|---|---|
| Fila de precio lista ausente | No configurado; aplicar fallback. |
| Precio lista `NULL` | No configurado; aplicar fallback. |
| Precio lista `0.00` | Configurado valido; NO fallback. |
| Descuento `NULL` | Descuento 0. |
| Descuento `0.00` | Sin descuento. |
| Descuento `100.00` | Precio final 0 antes de promociones. |
| Descuento menor que 0 | Invalido. CheckApp debe rechazar, mostrar validacion clara, no guardar y conservar valor anterior si es edicion. Legacy clamp 0 NO se adopta. |
| Descuento mayor que 100 | Invalido. CheckApp debe rechazar, mostrar validacion clara, no guardar y conservar valor anterior si es edicion. Legacy clamp 100 NO se adopta. |
| Precio fallback + descuento especifico vigente | El descuento puede aplicarse sobre fallback si existe una regla comercial especifica de descuento sin precio lista. Si no existe regla de descuento, descuento 0. |
| Precio lista `0.00` + descuento | Base 0; final 0. El descuento queda informativo/auditable, sin efecto monetario. |

## 9. Redondeo

### 9.1 Evidencia Legacy

En `ProductosListaPrecios.razor` se identificaron:

- `CalcPrecioFinal(precio, descPct)`
- `CalcDescPct(precio, precioFinal)`
- `RoundUpToCommercial49(value)`
- `RoundUpTo9(value)`
- `ApplyRedondeoPrecioFinal(value)`
- `AplicarRedondeoATodasLasListas()`
- `OnPrecioChanged`, `OnDescuentoChanged`, `OnPrecioFinalChanged`

Legacy muestra tres modos:

- Sin redondeo: conserva `Math.Round(value, 2)`.
- A 4/9: eleva al siguiente entero terminado en 4 o 9.
- Solo a 9: eleva al siguiente entero terminado en 9.

Legacy aplica el redondeo sobre el precio final/subtotal despues de descuento y recalcula el descuento. Si el redondeo supera el precio base, la UI clampa el precio final al precio base.

Legacy NO persiste el modo de redondeo; al guardar persiste precio y descuento recalculado.

### 9.2 Algoritmos canonicos

```text
Sin redondeo:
  resultado = round(valor, 2)

A 4/9:
  entero = ceiling(valor)
  ultimo = entero % 10
  si ultimo <= 4 => resultado = entero + (4 - ultimo)
  si ultimo > 4  => resultado = entero + (9 - ultimo)

Solo a 9:
  entero = ceiling(valor)
  ultimo = entero % 10
  si ultimo == 9 => resultado = entero
  si ultimo != 9 => resultado = entero + (9 - ultimo)

Clamp Legacy observado:
  si resultado > precioBase => precioFinal = precioBase
```

### 9.3 Tabla de ejemplos

| Entrada | Descuento | Modo | Antes redondeo | Resultado | Regla observada |
|---:|---:|---|---:|---:|---|
| 0.01 | 0% | Sin redondeo | 0.01 | 0.01 | Conserva 2 decimales. |
| 0.01 | 0% | A 4/9 | 0.01 | 4.00 | `ceil(0.01)=1`, siguiente 4. |
| 0.01 | 0% | Solo a 9 | 0.01 | 9.00 | `ceil(0.01)=1`, siguiente 9. |
| 0.04 | 0% | A 4/9 | 0.04 | 4.00 | Siguiente 4. |
| 0.05 | 0% | A 4/9 | 0.05 | 4.00 | Siguiente 4. |
| 0.09 | 0% | Solo a 9 | 0.09 | 9.00 | Siguiente 9. |
| 0.10 | 0% | A 4/9 | 0.10 | 4.00 | Siguiente 4. |
| 0.49 | 0% | A 4/9 | 0.49 | 4.00 | Siguiente 4. |
| 0.50 | 0% | A 4/9 | 0.50 | 4.00 | Siguiente 4. |
| 0.90 | 0% | A 4/9 | 0.90 | 4.00 | Siguiente 4. |
| 0.99 | 0% | Solo a 9 | 0.99 | 9.00 | Siguiente 9. |
| 52.00 | 0% | A 4/9 | 52.00 | 54.00 | Siguiente final 4/9. |
| 56.00 | 0% | A 4/9 | 56.00 | 59.00 | Siguiente final 4/9. |
| 59.00 | 0% | Solo a 9 | 59.00 | 59.00 | Ya termina en 9. |
| 100.01 | 0% | A 4/9 | 100.01 | 104.00 | `ceil=101`, siguiente 104. |
| 100.49 | 0% | Solo a 9 | 100.49 | 109.00 | `ceil=101`, siguiente 109. |
| 100.50 | 0% | A 4/9 | 100.50 | 104.00 | `ceil=101`, siguiente 104. |
| 100.90 | 0% | Solo a 9 | 100.90 | 109.00 | `ceil=101`, siguiente 109. |
| 100.99 | 0% | A 4/9 | 100.99 | 104.00 | `ceil=101`, siguiente 104. |
| 100.00 | 10% | Sin redondeo | 90.00 | 90.00 | Precio final directo. |
| 100.00 | 10% | A 4/9 | 90.00 | 94.00 | Descuento primero, redondeo despues. |
| 100.00 | 10% | Solo a 9 | 90.00 | 99.00 | Descuento primero, redondeo despues. |
| 100.00 | 50% | A 4/9 | 50.00 | 54.00 | Descuento primero. |
| 100.00 | 50% | Solo a 9 | 50.00 | 59.00 | Descuento primero. |
| 10.00 | 0% | A 4/9 | 10.00 | 10.00 | Raw seria 14; Legacy clampa a precio base. |
| 10.00 | 0% | Solo a 9 | 10.00 | 10.00 | Raw seria 19; Legacy clampa a precio base. |

## 10. Promociones

### 10.1 Evidencia Legacy general

Legacy expone en UI:

- `2 x 1`
- `3 x 2`
- `Descuento en 2o`
- `Monedero`

En modelo/API:

- `DosPorUno`
- `TresPorDos`
- `DescuentoSegundo`
- `Monedero`

En schema Legacy:

- `articulo.DOSPORUNO`
- `articulo.TRESPORDOS`
- `articulo.DESCUENTOSEGUNDO`
- `articulo.DESCTO2`
- `articulo.DESCTO3`
- `articulo.MONEDERO`
- tabla `DescuentoAutomaticoMasDeUnArticulo`
- tabla `monedero`

La pantalla de Lista de Precios auditada guarda banderas promocionales en `articulo`, pero no demuestra por si sola:

- prioridad entre promociones;
- acumulabilidad;
- mezcla de articulos;
- vigencia promocional especifica;
- reglas de tiendas/listas;
- reglas exactas de consumidor POS/facturacion;
- porcentaje exacto para descuento en segundo desde la pantalla LP;
- significado completo de `MONEDERO` como bandera vs monto/saldo.

Por tanto LP-06 clasifica promociones como obligatorias para CheckApp, pero deja pendientes PO solo los aspectos no demostrados por Legacy.

### 10.2 2x1

| Dimension | Contrato LP-06 |
|---|---|
| Identidad | Debe poder asociarse a identidad vendible, minimo Producto/Variante cuando aplique. |
| Lista | Debe definirse si aplica a todas las listas o lista especifica. Legacy LP no lo demuestra. |
| Regla base cerrada LP-06R | Compras 2 productos participantes y pagas 1. |
| Cantidad calificadora | 2 productos participantes. |
| Cantidad cobrada | 1. |
| Cantidad beneficiada | 1. |
| Condicion | Por cada 2 productos participantes que cumplen las condiciones de la promocion. |
| Beneficio | 1 producto participante no cobrado o beneficio equivalente en motor transaccional futuro. |
| Vigencia | Requerida en CheckApp; Legacy LP no demuestra campos de vigencia promocional. |
| Estado | Activa/Inactiva requerido. |
| Acumulacion/prioridad | DECISION PO pendiente. |
| Consumidor | Venta/cotizacion/facturacion deben recibir snapshot si aplican promocion. |

Decision PO pendiente: definir si 2x1 mezcla productos diferentes, si debe ser misma identidad, si mezcla variantes, si mezcla PresentacionesVenta, si aplica a Servicios, si aplica a lista especifica o varias, repeticion por multiplos, acumulabilidad con descuento, acumulabilidad con 3x2, prioridad entre promociones, tienda/sucursal y vigencia exacta. Estos pendientes bloquean la implementacion completa de 2x1, pero no bloquean el diseno de precio/descuento/redondeo de LP-07.

### 10.3 3x2

| Dimension | Contrato LP-06 |
|---|---|
| Identidad | Debe poder asociarse a identidad vendible o grupo promocional. |
| Lista | Requiere definicion PO: todas/lista especifica. |
| Regla base cerrada LP-06R | Compras 3 productos participantes y el de menor precio queda gratis. |
| Cantidad calificadora | 3 productos participantes. |
| Cantidad cobrada | 2. |
| Cantidad beneficiada | 1. |
| Seleccion del beneficio | Menor precio dentro del grupo participante. |
| Condicion | Por cada 3 productos participantes que cumplen las condiciones de la promocion. |
| Beneficio | El producto participante de menor precio queda gratis o beneficio equivalente en motor transaccional futuro. |
| Vigencia | Requerida en CheckApp. |
| Estado | Activa/Inactiva requerido. |
| Acumulacion/prioridad | DECISION PO pendiente. |
| Consumidor | Debe snapshotear unidades calificadas y beneficio. |

Decision PO pendiente: definir mezcla de productos, mezcla de variantes, PresentacionesVenta, Servicios, agrupacion promocional, repeticion por multiplos, desempate entre productos del mismo precio, listas aplicables, acumulabilidad, prioridad contra 2x1, sucursal y vigencia exacta. Estos pendientes bloquean la implementacion completa de 3x2.

### 10.4 Descuento en segundo producto

Evidencia Legacy:

- `articulo.DESCUENTOSEGUNDO` existe como bandera.
- `articulo.DESCTO2` y `articulo.DESCTO3` existen en schema.
- `DescuentoAutomaticoMasDeUnArticulo` contiene `OrdinalArticulo` y `Descuento`.
- La UI LP auditada muestra bandera, pero no captura porcentaje ni ordinal.

Contrato:

- Es una promocion obligatoria.
- LP-06R cierra que el usuario configura el porcentaje de descuento aplicado al segundo producto.
- El porcentaje NO debe estar hardcodeado.
- Rango valido del porcentaje: 0% a 100% inclusive.
- Si el usuario captura menor que 0 o mayor que 100, CheckApp debe rechazar, mostrar validacion clara, no guardar y conservar el valor anterior si es edicion.
- CheckApp no debe inventar el segundo producto exacto ni el orden de seleccion.

Decision PO pendiente bloqueante para implementacion completa: segundo producto exacto, segundo mas barato, segundo en orden de captura, misma identidad, identidad distinta, mezcla de variantes, repeticion, acumulabilidad, prioridad, listas, sucursal y vigencia.

### 10.5 Monedero

Evidencia Legacy:

- `articulo.MONEDERO` existe en schema.
- Tabla `monedero` registra movimientos/saldos.
- En ventas existe calculo de monedero por marca (`CalcularMonederoGeneradoPorMarcaAsync`), usando descuento/marca y acumulando importe neto.
- Tambien hay consumo de saldo de monedero como forma de pago.

Contrato:

- Monedero permanece PENDIENTE DEFINICION FUNCIONAL.
- La evidencia Legacy se conserva solo como antecedente.
- No se autoriza inferir que CheckApp debe funcionar exactamente como Legacy.
- No se autoriza disenar schema comercial definitivo de Monedero.
- No se autoriza tabla de saldo, algoritmo, porcentaje inventado, motor o UI operativa de Monedero.
- LP-07 puede dejar reserva conceptual/extensibilidad/documentacion, pero NO implementacion funcional completa.
- La falta de definicion de Monedero NO bloquea precio, descuento, precio final, redondeo, historico base, vigencia base ni estructura extensible para promociones.

Decision PO pendiente: definicion funcional completa de Monedero por PO.

## 11. Vigencia

Legacy `preciosl` demuestra cambios programados por fecha:

- `FechaAplicacion`
- `Status`
- `avisar`
- `Fecha`
- `Usuario`
- `Modulo`
- `ListaSeleccionada`

La aplicacion de pendientes usa fecha local Mexico (`GetMexicoNow().Date`).

Contrato CheckApp:

- Toda regla comercial futura debe admitir vigencia opcional: inicio, fin, estado.
- Rango de vigencia es inclusivo por fecha local de negocio, zona `America/Mexico_City`, salvo decision PO posterior por hora exacta.
- Si hay reglas superpuestas para la misma identidad/lista/concepto, LP-07 debe impedir ambiguedad o definir prioridad explicita.
- Cambios programados deben registrarse como pendientes y aplicarse con auditoria.

## 12. Servicio, Variante y PresentacionVenta

| Caso | Regla |
|---|---|
| Servicio con precio lista | Valido; participa en descuento/redondeo/promocion cuando no dependa de inventario. |
| Servicio sin precio lista | Fallback a precio publico/base del servicio. |
| Variante con precio lista | Valido; debe validar pertenencia al producto. |
| Variante sin precio lista | Fallback a precio de variante si existe, si no a producto. |
| PresentacionVenta con precio lista | Valido; snapshot debe conservar presentacion/factor/precio. |
| PresentacionVenta sin precio lista | Fallback a precio de presentacion o producto segun contrato LP-03. |
| Variante + PresentacionVenta en una misma identidad | No autorizado sin decision PO. |

## 13. Historico minimo

LP-07/LP-08 deben preservar como minimo:

- `idEmpresa`;
- `DatabaseIdentity`;
- `Scope`;
- tipo de identidad;
- id identidad;
- id padre cuando aplique;
- lista;
- concepto/campo cambiado;
- valor anterior;
- valor nuevo;
- usuario/id;
- fecha/hora UTC;
- fecha/hora local o zona horaria;
- origen de operacion: individual, masivo, copia lista, descuento marca, promocion, sistema;
- `CorrelationId` u `OperationKey`;
- motivo cuando exista;
- vigencia inicio/fin;
- estado pendiente/aplicado/cancelado;
- snapshot de precio base, descuento, redondeo, precio final y promociones cuando afecte consumidores.

Legacy `preciosl` es evidencia suficiente de historico de precio/costo/descuento/lista/usuario/fecha/estado, pero no cubre todo el contrato CheckApp futuro.

## 14. Consumidores y snapshot

Consumidor interno o externo debe recibir:

- identidad vendible;
- lista;
- precio base/original;
- precio lista configurado o fallback;
- origen del precio;
- descuento;
- subtotal antes de redondeo;
- modo de redondeo;
- precio final;
- promociones evaluadas;
- vigencia;
- snapshot id/correlation id;
- tenant/scope;
- advertencias si hay decisiones PO pendientes no soportadas.

Regla: ventas, cotizaciones, facturacion, reportes o cualquier consumidor documental NO deben recalcular historicos con reglas actuales; deben usar snapshot.

## 15. Tenant, permisos y seguridad

| Elemento | Regla |
|---|---|
| Tenant | `idEmpresa` siempre server-side. |
| DB | `DatabaseIdentity` y scope requeridos. |
| Gate | `ListaPrecios` debe estar compatible antes de operar. |
| READ | `05001008` vigente para consulta. |
| WRITE | `05001009` vigente para administracion general futura. |
| Permisos futuros | LP-07/LP-08 deben proponer permisos especificos para ajuste masivo, copia lista, descuento marca, promociones, historico/export si PO lo aprueba. |
| Padres | No conceden hijos. |
| SuperAdmin | Aditivo/protegido, sin edicion manual forzada. |
| Legacy | Solo lectura en LP-06. |

## 16. Datos Legacy no canonicos para core LP

| Dato | Evidencia | Decision LP-06 |
|---|---|---|
| `Web` | `ArticuloExt.Web` | Marketplace/canal externo; no core precio. |
| `Liverpool` | `ArticuloExt.Liverpool` | Marketplace/canal externo; no core precio. |
| `ML` / Mercado Libre | `ArticuloExt.ML` | Marketplace/canal externo; no core precio. |
| `CorridaManual` | `articulo.ubica` / UI | Dato operativo de Raramuri/tallas; no core CheckApp LP. |
| `Observaciones` | `ArticuloExt.Observaciones` | Metadata/auditoria opcional futura, no motor de precio. |

## 17. Casos borde

| Caso | Resultado esperado |
|---|---|
| Precio lista ausente | Fallback. |
| Precio lista `NULL` | Fallback. |
| Precio lista `0.00` | Configurado, final 0. |
| Descuento `NULL` | 0. |
| Descuento 0 | Sin descuento. |
| Descuento 100 | Final 0. |
| Descuento negativo | Invalido; CheckApp rechaza, muestra validacion, no guarda y conserva valor anterior en edicion. Legacy clampa, pero NO se adopta. |
| Descuento > 100 | Invalido; CheckApp rechaza, muestra validacion, no guarda y conserva valor anterior en edicion. Legacy clampa, pero NO se adopta. |
| Redondeo sube sobre precio base | Legacy clampa a precio base. |
| Precio base 0 con descuento | Final 0. |
| Servicio con promocion de inventario | Debe fallar o ignorarse segun tipo de promocion; decision PO si se permiten promociones no inventariables. |
| Variante inactiva | Fail closed en nuevas operaciones. |
| PresentacionVenta inactiva | Fail closed en nuevas operaciones. |
| Regla vigente duplicada | Invalido; LP-07 debe impedir ambiguedad. |
| Venta historica despues de cambio de precio | Usa snapshot historico. |
| Consumidor sin lista | Lista 1 si el consumidor no define otra lista. |
| Promocion 2x1 + descuento lista | DECISION PO pendiente para acumulabilidad/prioridad. |
| Promocion 3x2 con precios distintos | El menor precio queda gratis; mezcla, agrupacion y desempates siguen pendientes. |
| Descuento segundo con porcentaje <0 o >100 | Invalido; rechazar. |
| Monedero + descuento | DECISION PO pendiente para prioridad/generacion. |

## 18. Matriz Legacy -> CheckApp

| Legacy | CheckApp canonico | Estado |
|---|---|---|
| `precios.precio`..`precio10` | Precio Lista 1..10 | CERRADO |
| `precios.descto`..`desc10` | Descuento lista 1..10 | CERRADO |
| Legacy clamp descuento <0/>100 | CheckApp rechaza y no guarda | NO ADOPTADO |
| `Precio1D` calculado | Subtotal/precio final calculado | CERRADO |
| UI redondeo Sin/A 4-9/Solo 9 | Modo redondeo | CERRADO como regla; persistencia futura requerida |
| `articulo.DOSPORUNO` | Promo 2x1 | Regla base cerrada: compras 2 participantes y pagas 1; detalles pendientes |
| `articulo.TRESPORDOS` | Promo 3x2 | Regla base cerrada: compras 3 participantes y menor precio gratis; detalles pendientes |
| `articulo.DESCUENTOSEGUNDO` | Promo descuento segundo | Porcentaje configurable cerrado; seleccion del segundo pendiente |
| `articulo.MONEDERO` + tabla `monedero` | Monedero | PENDIENTE DEFINICION FUNCIONAL; solo antecedente/reserva conceptual |
| `preciosl` | Historico/programacion | Base de evidencia; CheckApp requiere historico ampliado |
| Ajuste masivo endpoint Legacy | Operacion futura LP | Necesidad cerrada, no implementada |
| Copiar lista endpoint Legacy | Operacion futura LP | Necesidad cerrada, no implementada |
| Descuento por marca endpoint Legacy | Operacion futura LP | Necesidad cerrada, no implementada |
| Web/Liverpool/ML | Metadata/canal externo | Fuera del core LP |

## 19. Requisitos para LP-07

LP-07 no puede iniciar hasta revision PO de este documento. Si se autoriza, debe:

- modelar descuentos y redondeos como datos persistentes/versionados;
- no perder `0.00` como precio valido;
- conservar fallback por ausencia/NULL;
- incluir modo de redondeo, porque Legacy no lo persiste;
- incluir vigencia y no ambiguedad de reglas;
- incluir historico minimo;
- modelar estructura promocional extensible sin cerrar unilateralmente reglas pendientes;
- NO cerrar unilateralmente agrupacion 2x1, agrupacion 3x2, mezcla de identidades, prioridad/acumulabilidad, segundo producto exacto o Monedero;
- NO implementar promociones completas sin decisiones PO pendientes;
- proponer permisos granulares solo si PO lo autoriza;
- no tocar Legacy;
- no ejecutar DDL sin contrato tecnico LP-07/LP-08.

## 20. Requisitos para LP-08

LP-08 o ticket posterior de UI/API debe:

- exponer precio base, descuento, precio final, redondeo y promociones sin ocultar componentes;
- preservar pipeline y snapshot;
- mostrar origen/fallback;
- impedir reglas ambiguas;
- respetar tenant/gate/permisos;
- separar promociones con decisiones PO pendientes;
- dejar FAIL CLOSED/no disponible cualquier regla promocional que requiera decision pendiente;
- no presentar funciones promocionales incompletas como cerradas;
- no implementar interpretaciones razonables no aprobadas.

## 21. Decisiones PO

### 21.1 Cerradas por LP-06

- Precio final = resultado deterministico de precio base/lista, descuento y redondeo.
- Redondeo se aplica despues del descuento.
- Redondeo Legacy real: Sin redondeo, A 4/9, Solo a 9.
- Legacy clampa precio final al precio base cuando redondeo lo supera.
- Legacy no persiste modo de redondeo; CheckApp debe persistirlo si quiere reproducibilidad.
- Promociones son obligatorias como dominio funcional, pero no toda semantica esta demostrada.
- 2x1 regla base cerrada: compras 2 productos participantes y pagas 1.
- 3x2 regla base cerrada: compras 3 productos participantes y el menor precio queda gratis.
- Descuento segundo: porcentaje configurable por usuario; rango 0..100 inclusive.
- Descuentos fuera de rango: CheckApp rechaza; Legacy clamp no se adopta.
- Monedero permanece pendiente definicion funcional.
- Snapshot es obligatorio para consumidores.

### 21.2 Pendientes PO bloqueantes para promociones completas

- 2x1: mezcla de productos, misma identidad, variantes, PresentacionesVenta, Servicios, listas, repeticion por multiplos, acumulabilidad con descuento, acumulabilidad con 3x2, prioridad, tienda/sucursal y vigencia exacta.
- 3x2: mezcla de productos, variantes, PresentacionesVenta, Servicios, agrupacion promocional, repeticion por multiplos, desempate entre productos del mismo precio, listas, acumulabilidad, prioridad contra 2x1, sucursal y vigencia exacta.
- Descuento segundo: segundo producto exacto, segundo mas barato, segundo en orden de captura, misma identidad, identidad distinta, mezcla de variantes, repeticion, acumulabilidad, prioridad, listas, sucursal y vigencia.
- Monedero: definicion funcional completa; LP-07/LP-08/LP-09 no deben implementarlo ni mostrarlo como configuracion operativa cerrada.

### 21.3 Pendientes PO no bloqueantes para precio/descuento/redondeo

- Permisos adicionales por operacion sensible.
- Uso de metadata Web/Liverpool/ML/Observaciones en versiones futuras.

## 22. Criterios de aceptacion LP-06

| Criterio | Resultado |
|---|---|
| Lee antecedentes obligatorios | PASS |
| Audita Legacy READ-ONLY | PASS |
| Define precio base/original | PASS |
| Define Precio Lista | PASS |
| Define descuento | PASS |
| Define precio final | PASS |
| Define fuente de verdad | PASS |
| Define `NULL`/fila ausente | PASS |
| Define `0.00` | PASS |
| Define fallback | PASS |
| Define vigencia | PASS |
| Define redondeo con ejemplos | PASS |
| Define promociones y pendientes reales | PASS |
| Define identidades | PASS |
| Define pipeline | PASS |
| Define historico | PASS |
| Define consumidores/snapshot | PASS |
| Define tenant/permisos | PASS |
| Define datos Legacy no canonicos | PASS |
| Define casos borde | PASS |
| Handoff LP-07/LP-08 | PASS |

## 23. Handoff

LP-06 queda listo para revision PO. El siguiente paso NO se ejecuta automaticamente.

Handoff a LP-07:

- usar este documento como contrato funcional;
- queda autorizable conceptualmente para disenar precio, descuento, precio final reproducible, modo redondeo, vigencia, historico minimo y estructura promocional extensible;
- no inventar promociones;
- bloquear partes promocionales sin decision PO;
- no cerrar unilateralmente reglas de agrupacion 2x1, agrupacion 3x2, mezcla de identidades, prioridad/acumulabilidad, segundo producto exacto ni Monedero;
- conservar decisiones cerradas;
- generar contrato tecnico/schema/API solo con autorizacion expresa.

Handoff a LP-08:

- usar este documento para UI/API de operaciones;
- no ocultar componentes comerciales;
- exigir snapshot/historico para consumidores.
- puede implementar solo conceptos cerrados;
- debe bloquear como FAIL CLOSED/no disponible cualquier regla promocional que requiera decision pendiente.

## 24. Cierre #MOKA LP-06

| Control | Resultado |
|---|---|
| Codigo productivo modificado | NO |
| BD/DDL/migraciones ejecutadas | NO |
| API/UI modificada | NO |
| Legacy modificado | NO |
| LP-07 ejecutado | NO |
| Backlog generado/renumerado | NO |
| AGENTS/CLAUDE actualizados solo con nota documental | SI |
| Documento generado | `inspector/docs/lista-precios/LP_06_CONTRATO_FUNCIONAL_EXTENDIDO_COMERCIAL_20260929.md` |
| Estado final | LP-06 = CONTRATO FUNCIONAL EXTENDIDO COMPLETO / LISTO REVISION PO |
| FROZEN | PASS |
