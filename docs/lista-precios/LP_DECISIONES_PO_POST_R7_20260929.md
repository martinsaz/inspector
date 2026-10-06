# LP-BACKLOG-R1 - Decisiones PO post LP-05R7

Fecha: 2026-09-29  
Estado: LISTO REVISION PO  
Tipo: documento de decisiones. No autoriza implementacion.

## 1. Decisiones PO ya cerradas

Estas decisiones se consideran cerradas por el contrato LP-BACKLOG-R1 y no deben volver a preguntarse para construir LP-06:

| Decision | Estado |
|---|---|
| Lista de Precios evoluciona a CONSOLA OPERATIVA | Cerrada |
| Listas 1..10 | Cerrada |
| Lista 1 default operativo | Cerrada |
| Producto, Servicio, Variante, PresentacionVenta | Cerrada |
| Precio especifico + fallback | Cerrada |
| `0.00` es precio configurado valido | Cerrada |
| Descuentos por lista obligatorios | Cerrada |
| Redondeos obligatorios | Cerrada |
| Promociones obligatorias | Cerrada |
| Edicion individual | Cerrada |
| Filtros avanzados | Cerrada |
| Fotografias | Cerrada |
| Existencias/movimientos adaptados a CheckApp | Cerrada |
| Ajuste masivo, copiar lista, descuento por marca | Cerrada |
| Excel operativo ampliado | Cerrada |
| Historico/auditoria | Cerrada |
| Consumidores | Cerrada |
| Sugerencias comerciales despues de fuentes confiables | Cerrada |
| Patron CheckApp y Golden Master ProductosServicios | Cerrada |
| LP-05 es base read-only, no modulo completo | Cerrada |

## 1.1 Decisiones PO incorporadas por LP-06R

Estas decisiones fueron incorporadas documentalmente en `LP_06_CONTRATO_FUNCIONAL_EXTENDIDO_COMERCIAL_20260929.md` y preparan el handoff seguro a LP-07 sin autorizar implementacion:

| Concepto | Decision PO | Estado |
|---|---|---|
| 2x1 | Compras 2 productos participantes y pagas 1. Cantidad calificadora 2, cobrada 1, beneficiada 1. | Regla base cerrada; detalles promocionales pendientes. |
| 3x2 | Compras 3 productos participantes y el de menor precio queda gratis. Cantidad calificadora 3, cobrada 2, beneficiada 1. | Regla base cerrada; detalles promocionales pendientes. |
| Descuento segundo | Usuario configura el porcentaje de descuento aplicado al segundo producto. No hardcodear. | Porcentaje configurable cerrado; seleccion del segundo producto pendiente. |
| Monedero | PO no definio regla funcional. | Pendiente definicion funcional; no schema/motor/UI operativa. |
| Descuento <0 | Rechazar, mostrar validacion, no guardar, conservar valor anterior en edicion. | Cerrada. |
| Descuento >100 | Rechazar, mostrar validacion, no guardar, conservar valor anterior en edicion. | Cerrada. |

Regla adicional cerrada: promociones no sobrescriben automaticamente el Precio Lista almacenado; se evaluan despues del precio final conforme al motor/consumidor futuro.

## 2. Bloqueantes para LP-06

LP-06 es documental/funcional y puede iniciar con estas decisiones cerradas, pero debe resolver formalmente antes de habilitar LP-07/LP-08:

1. Algoritmo exacto de redondeo Legacy: Sin redondeo, A 4/9, Solo a 9.
2. Separacion canonica entre precio base/original, descuento, precio final, redondeo y promocion.
3. Semantica de promocion: vigencia, alcance, acumulabilidad, prioridad, identidad aplicable, lista aplicable, condiciones, historico y consumidores.
4. Regla de NULL/fila ausente vs precio `0.00` en presencia de descuentos/promociones.
5. Contrato de precio final: persistido, calculado o ambos, y fuente de verdad.
6. Handoff exacto para historico/auditoria como requisito de operaciones masivas.

## 2.1 Pendientes promocionales posteriores a LP-06R

No deben ser decididos unilateralmente por LP-07/LP-08:

1. 2x1: mezcla de productos, misma identidad, variantes, PresentacionesVenta, Servicios, listas, repeticion por multiplos, acumulabilidad, prioridad, tienda/sucursal y vigencia exacta.
2. 3x2: mezcla de productos, variantes, PresentacionesVenta, Servicios, agrupacion promocional, repeticion por multiplos, desempate entre productos del mismo precio, listas, acumulabilidad, prioridad contra 2x1, sucursal y vigencia exacta.
3. Descuento segundo: segundo producto exacto, segundo mas barato, segundo en orden de captura, misma identidad, identidad distinta, mezcla de variantes, repeticion, acumulabilidad, prioridad, listas, sucursal y vigencia.
4. Monedero: definicion funcional completa. Solo reserva conceptual/extensibilidad/documentacion hasta decision PO.

## 3. Importantes no bloqueantes

Estas decisiones no bloquean el inicio de LP-06, pero deben cerrarse en el ticket que corresponda:

1. Permisos adicionales para ajuste masivo, copiar lista, descuento por marca o sugerencias comerciales.
2. Nivel de detalle visual para fotografias: miniatura, modal, columna exportable o solo metadata.
3. Alcance de datos adicionales Legacy que se omiten del core LP: Web, Liverpool, Mercado Libre, observaciones y corrida manual.
4. Si existencias/movimientos se muestran como modal agregado o deep link a modulos Inventario/OC/Recepcion/Curvas.
5. Politica de batch size, ejecucion asincrona y cancelacion para operaciones masivas.
6. Columnas obligatorias vs opcionales del Excel operativo.
7. Superficie exacta de consulta historica para usuarios finales.

## 4. Futuras

1. Aplicacion automatica de sugerencias comerciales.
2. Promociones avanzadas por cliente/canal/sucursal si exceden promociones cerradas por PO.
3. Analitica predictiva o IA: no incluida; primero algoritmo determinista.
4. Precio por sucursal/cliente/moneda si PO lo abre como alcance posterior.
5. Importacion masiva desde Excel.
6. Migracion de datos Legacy Tarahumara a CheckApp; no autorizada por este backlog.

## 5. Reglas de no confusion

- Precio, descuento, redondeo y promocion son conceptos diferentes.
- `0.00` no es NULL.
- Fallback se activa por ausencia de precio resoluble, no por precio cero.
- Promociones no sustituyen descuentos por lista.
- Ventas como contexto no es lo mismo que Ventas como consumidor del motor.
- Inventario/Sucursales/Curvas/OC/Recepcion son fuentes existentes; no deben duplicarse en ListaPrecios.

## 6. Dictamen PO-ready

El backlog corregido puede presentarse a revision PO porque cubre el checklist LP-BACKLOG-R1 y separa decisiones cerradas, bloqueantes, importantes y futuras sin ejecutar LP-06.
