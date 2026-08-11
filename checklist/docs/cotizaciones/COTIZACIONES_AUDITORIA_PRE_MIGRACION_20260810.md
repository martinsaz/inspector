# Auditoría Previa a Migración
# Vertical: Cotizaciones

Fecha de auditoría: 2026-08-10

## Alcance auditado

Origen Android auditado en solo lectura:

- `/Users/denissemendiola/dev/Sazmobile26`

Destino web auditado en solo lectura:

- `/Users/denissemendiola/dev/Inspecciones/inspector/checklist`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs`

Restricciones respetadas:

- Sin implementación.
- Sin cambios en `Cotizaciones/Index`.
- Sin cambios en Android legacy.
- Sin cambios en API, SQL, permisos, sesión o verticales protegidos.

## Resumen ejecutivo

El módulo Android de `Cotizaciones` sí existe y está funcionalmente dividido en tres piezas principales:

1. Entrada desde menú principal.
2. Listado operativo con filtros por fecha y acciones por estado.
3. Flujo POS para crear, editar, clonar, guardar y reimprimir cotizaciones.

La evidencia principal está en:

- `MenuPrincipal.java`
- `CotizacionesReporteActivity.java`
- `CotizacionesActivity.java`
- `CotizacionPdfHelper.java`

En CheckApp web, la ruta actual `Cotizaciones/Index` es solamente un placeholder visual sin lógica de negocio, sin grid, sin filtros y sin integración backend:

- [CotizacionesController.cs](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/Cotizaciones/CotizacionesController.cs)
- [Index.cshtml](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Views/Cotizaciones/Index.cshtml:1)

Conclusión de alcance:

- `Listado de cotizaciones`: `MIGRAR ADAPTADO`
- `Alta / edición de cotización`: `MIGRAR ADAPTADO`
- `Detalle / consulta`: `MIGRAR ADAPTADO`
- `Impresión PDF`: `MIGRAR ADAPTADO`
- `Autorización`: `REQUIERE DECISIÓN DEL PRODUCT OWNER`
- `Conversión a pedido`: `REQUIERE DECISIÓN DEL PRODUCT OWNER`
- `Tallas`: `DESCARTAR POR ALCANCE`
- `Mecánica móvil offline / cachés temporales`: `NO APLICA` o `REQUIERE ADAPTACIÓN` según caso

## Mapa funcional Android

### 1. Entrada al módulo

La entrada a `Cotizaciones` ocurre desde el menú principal:

- `MenuPrincipal.irACotizaciones()` abre `CotizacionesReporteActivity`
- Evidencia: `/Users/denissemendiola/dev/Sazmobile26/app/src/main/java/com/checkapp/sazmobile26/MenuPrincipal.java:1330`

### 2. Pantalla de listado

La pantalla operativa del listado es `CotizacionesReporteActivity`.

Evidencia:

- `/Users/denissemendiola/dev/Sazmobile26/app/src/main/java/com/checkapp/sazmobile26/CotizacionesReporteActivity.java:42`
- `/Users/denissemendiola/dev/Sazmobile26/app/src/main/res/layout/activity_cotizaciones_reporte.xml`

Comportamiento confirmado:

- Título `Cotizaciones`.
- Botón `Nueva`.
- Botón `Cerrar`.
- Fecha inicial.
- Fecha final.
- Botón `Buscar`.
- Estado textual `Estado: X cotización(es)`.
- Mensaje vacío `Sin cotizaciones en el rango.`

### 3. Flujo de nueva cotización / edición

La pantalla operativa es `CotizacionesActivity`.

Evidencia:

- `/Users/denissemendiola/dev/Sazmobile26/app/src/main/java/com/checkapp/sazmobile26/CotizacionesActivity.java:73`

Comportamiento confirmado:

- Requiere cliente antes de agregar producto.
- Permite buscar cliente.
- Permite buscar producto por texto o por SKU/barcode.
- Si el código resuelve a barcode, despliega selector de tallas.
- Guarda por API.
- Reabre detalle por folio.
- Si la cotización no está en `BORRADOR`, entra en solo lectura.

### 4. PDF

Existe helper propio de cotización:

- `/Users/denissemendiola/dev/Sazmobile26/app/src/main/java/com/checkapp/sazmobile26/CotizacionPdfHelper.java`

Genera PDF a partir del JSON de `/cotizaciones/detalle` y lo escribe en caché local del dispositivo.

## Respuestas obligatorias

### Listado de cotizaciones

1. Cómo se entra a Cotizaciones.
   Desde `MenuPrincipal`, tocando la tarjeta `Cotizar`, que abre `CotizacionesReporteActivity`.

2. Qué pantalla controla el listado.
   `CotizacionesReporteActivity`.

3. Qué datos carga al abrir.
   Carga `items` desde `GET /cotizaciones/listar?fechaDel=...&fechaAl=...`.

4. Si carga automáticamente o requiere Buscar.
   Hace ambas cosas. Carga al abrir y también cuando se toca `Buscar`.

5. Cómo funcionan fecha inicial y fecha final.
   Son `DatePickerDialog` que escriben fecha en formato `yyyy-MM-dd`.

6. Qué rango predeterminado usa.
   Hoy / hoy.
   Evidencia: `CotizacionesReporteActivity.java:83-87`.

7. Qué significa `Estado: X cotización(es)`.
   Es un contador de registros devueltos por el endpoint, no un estado de negocio.

8. Qué columnas/datos muestra cuando existen cotizaciones.
   Por tarjeta:
   - folio
   - estado
   - cliente
   - vendedor
   - fecha
   - tienda
   - piezas
   - total
   - folio de pedido convertido si aplica

9. Qué acción se ejecuta al tocar una cotización.
   Abre modal de detalle con acciones rápidas.

10. Si existe edición.
   Sí, solo cuando el estado es `BORRADOR`.

11. Si existe consulta de detalle.
   Sí, mediante modal de detalle y mediante reapertura en `CotizacionesActivity`.

12. Si existe eliminación.
   No se observó eliminación física.

13. Si existe cancelación.
   Sí, por `POST /cotizaciones/cancelar` con motivo obligatorio.

14. Si existe duplicado.
   Sí, como `Clonar`.

15. Si existe reimpresión.
   Sí, usando `/cotizaciones/detalle` + `CotizacionPdfHelper`.

16. Si existe envío.
   No se encontró correo ni WhatsApp específicos de cotizaciones en el flujo auditado.

17. Si existe conversión a venta/pedido.
   Sí, conversión a pedido.

18. Qué estados de cotización existen.
   Confirmados por código:
   - `BORRADOR`
   - `AUTORIZADA`
   - `CONVERTIDA`
   - `CANCELADA`

19. Cómo se determina cada estado.
   El estado llega desde backend en el payload del listado y del detalle. La app solo lo interpreta para UI y permisos.

20. Qué filtros adicionales existen aunque no aparezcan en la captura.
   No se localizaron filtros adicionales en esta Activity. Solo `fechaDel` y `fechaAl`.

### Nueva cotización

1. Cómo inicia.
   Desde botón `Nueva` del listado.

2. Qué datos pide primero.
   Cliente.

3. Si requiere cliente.
   Sí. No deja agregar producto sin cliente seleccionado.

4. Cómo busca cliente.
   Diálogo de búsqueda por nombre, correo o teléfono.

5. Si permite crear cliente.
   No se encontró alta de cliente dentro de `CotizacionesActivity`.

6. Qué datos del cliente toma.
   Confirmados:
   - `socioId`
   - `socioNombre`
   - `telefono` o `email` para mostrar en búsqueda
   - `descuentoPct`

7. Qué catálogo de productos usa.
   Búsqueda inicial desde `GET /existencias/productos?take=150&q=...`

8. Cómo busca producto.
   Por estilo/modelo en diálogo o por SKU/barcode directo.

9. Si consulta existencias.
   Sí.

10. Si requiere existencia para cotizar.
   No estrictamente. Informa faltantes y sobrecotización, pero deja agregar.

11. Cómo selecciona producto.
   Si es SKU resuelto, agrega directo.
   Si es barcode, abre selector de tallas.

12. Cómo agrega partidas.
   Por SKU resuelto o por selector de tallas con cantidad.

13. Qué campos tiene cada partida.
   Confirmados en payload o edición:
   - `barcode`
   - `talla`
   - `cantidad`
   - `precio`
   - `descuentoPct`
   - `estilo`/descripción
   - `precioOriginal`
   - `descuentoOriginal`
   - flags y motivos de edición manual
   - `curvaNombre`
   - `curvaMultiplicador`

14. Cantidad.
   Sí.

15. Precio.
   Sí.

16. Precio manual sí/no.
   Sí, con motivo obligatorio cuando cambia.

17. Lista de precios.
   Sí, tanto al agregar por tallas como al editar.

18. Descuento.
   Sí.

19. Impuesto.
   No se observó captura/edición explícita de impuesto en UI. Puede venir implícito en subtotal backend o en modelo de artículo, pero no es determinable como input visible desde esta auditoría.

20. Subtotal.
   Sí, existe a nivel de item y PDF.

21. Total.
   Sí.

22. Observaciones.
   Sí.

23. Vigencia.
   Sí, `vigenciaDias`.

24. Vendedor.
   Sí, tomado de sesión/contexto, no capturado manualmente.

25. Caja.
   Sí, tomada de `SharedPreferences`.

26. Sucursal.
   Sí, tomada de `SharedPreferences`.

27. Moneda.
   No se encontró selector de moneda.

28. Condiciones.
   No se encontraron.

29. Forma de pago.
   No aplica en el flujo auditado.

30. Guardado.
   Sí, por `POST /cotizaciones/guardar`.

31. Edición posterior.
   Sí, solo en `BORRADOR`.

32. Cancelación.
   Sí.

33. Impresión/PDF.
   Sí.

34. Correo.
   No encontrado en el flujo auditado.

35. WhatsApp.
   No encontrado en el flujo auditado.

36. Conversión a otra operación.
   Sí, a pedido.

## Datos y reglas de producto

### Confirmado

- Identificador técnico: `idArticulo`
- Código operativo: `barcode`
- Descripción armada desde `estilo`, `color`, `acabado`, `marca` o `descripcion`
- Precio seleccionado
- Descuento seleccionado
- Existencia por talla
- Imagen por `/existencias/producto/{idArticulo}/imagen`
- Curvas comerciales

### Parcial o no determinable desde Android

- costo
- impuesto aplicado por producto
- promociones formales
- moneda

### Tallas

La implementación Android depende de tallas en varios puntos:

- selector de tallas
- existencia por talla
- payload de item con `talla`
- PDF mostrando `T:`
- consulta de existencias por tienda y talla

Clasificación:

- `DESCARTAR POR ALCANCE`

Nota:

- La cotización web debe operar sin dimensión `talla`.
- Cualquier regla de color atada técnicamente a talla requiere redefinición posterior.

## Cálculos

### Determinables desde Android

- Total visible:
  suma de `subtotal()` de todos los items
  evidencia: `CotizacionesActivity.java:1960-1968`

- Piezas visibles:
  suma de `cantidad`
  evidencia: `CotizacionesActivity.java:1962-1967`

### No determinable completamente desde esta auditoría

No se auditó en esta pasada la implementación interna completa de `PedidoClientePosItem.subtotal()` ni la lógica backend que valida totales al guardar. Por lo tanto, estos puntos quedan parciales:

- fórmula exacta de subtotal por partida
- fórmula exacta de descuento final
- fórmula exacta de impuesto
- redondeo final
- si impuestos van incluidos o no

Clasificación:

- `NO DETERMINABLE COMPLETAMENTE DESDE EL PROYECTO ANDROID REVISADO EN ESTA PASADA`

## Endpoints inventariados

### Exclusivos o claramente asociados a Cotizaciones

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/cotizaciones/listar` | listado por fechas |
| `POST` | `/cotizaciones/autorizar` | cambio a autorizada |
| `POST` | `/cotizaciones/{id}/convertir-pedido` | conversión a pedido |
| `POST` | `/cotizaciones/cancelar` | cancelación con motivo |
| `POST` | `/cotizaciones/guardar` | alta / edición |
| `GET` | `/cotizaciones/detalle?folio=...` | detalle, reimpresión, reapertura |

### Compartidos con otros verticales

| Método | Ruta | Uso en Cotizaciones |
| --- | --- | --- |
| `GET` | `/existencias/productos` | búsqueda de productos |
| `POST` | `/ventas/sku/resolver` | resolver SKU/barcode a artículo |
| `GET` | `/ventas/barcode/{barcode}/tallas` | selección de tallas |
| `GET` | `/existencias/producto/{idArticulo}/imagen` | imagen de producto |
| `GET` | `/existencias/{barcode}/existencias-tiendas?talla=...` | existencias por tienda y talla |

Autenticación observada:

- Header `Authorization: Bearer ...`
- Evidencia: `CotizacionesReporteActivity.java:163-170`

## Offline / sincronización

### Confirmado

- No se observó SQLite, Room ni cola de sincronización propia de cotizaciones en los archivos auditados.
- Sí existe uso de `SharedPreferences`, pero solo para contexto operativo:
  - tienda
  - caja
  - auth/token
  - empleado/vendedor
- Sí existe caché temporal de imágenes por barcode en memoria.
- Sí existe escritura de PDF en `cacheDir`.

### Clasificación

- `SharedPreferences` de contexto operativo: `REQUIERE ADAPTACIÓN`
- caché de imágenes en memoria: `NO NECESARIO EN WEB`
- PDF en `cacheDir`: `REQUIERE ADAPTACIÓN`
- SQLite / Room / cola offline: `NO EVIDENCIADO`

## Contraste contra CheckApp actual

### Existencia actual del vertical destino

La ruta web existe, pero solo como base visual:

- [CotizacionesController.cs](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/Cotizaciones/CotizacionesController.cs)
- [Index.cshtml](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Views/Cotizaciones/Index.cshtml:8)

### Infraestructura reutilizable localizada

Localizada por nombre/ruta en el proyecto destino:

- `Clientes`
- `ProductosServicios`
- `Sucursales`
- `EmailServices`
- `QuestPDF` en el frontend MVC
- Patrón CheckApp:
  - `checkapp-theme.css`
  - `checkapp-ui.js`
  - `CheckAppDynamicGrid`
  - `CheckAppFilterAccordion`

Archivos relevantes localizados:

- `/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/Clientes/ClientesController.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/Clientes/ClientesReporteController.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/ProductosServicios/ProductosServiciosController.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/Sucursales/SucursalesController.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/Clientes/ClientesController.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/Clientes/ClientesReporteController.cs`
- `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs`

### No localizado con esta auditoría por nombre/ruta

No se localizaron controladores/verticales explícitos de:

- `Cotizaciones` en `checklistWs`
- `Ventas` en `checklistWs`
- `Existencias` en `checklistWs`

Clasificación prudente:

- `Cotizaciones backend`: `NO EXISTE` en el repositorio auditado por nombre/ruta
- `Clientes`: `YA EXISTE Y ES REUTILIZABLE`
- `ProductosServicios`: `EXISTE PARCIALMENTE`
- `Sucursales`: `YA EXISTE Y ES REUTILIZABLE`
- `Existencias`: `EXISTE PARCIALMENTE O NO LOCALIZADO POR NOMBRE`
- `Ventas / conversión a pedido`: `NO LOCALIZADO`
- `PDF`: `EXISTE PARCIALMENTE`
- `Correo`: `EXISTE PARCIALMENTE`
- `WhatsApp`: `NO LOCALIZADO`

## Matriz Android -> CheckApp

| Funcionalidad | Existe en Android | Evidencia Android | Equivalente CheckApp | Cobertura actual | Adaptación necesaria | Backend necesario | SQL necesario | Riesgo | Decisión |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Entrada desde menú | Sí | `MenuPrincipal.java:1330` | Menú ya existe | Parcial | Alta visual controlada | No inmediata | No | Bajo | `REUTILIZAR EXISTENTE` |
| Listado por fecha | Sí | `CotizacionesReporteActivity.java:125` | `CheckAppDynamicGrid` + filtros | No existe | Alta | Sí | No determinable | Medio | `MIGRAR ADAPTADO` |
| Contador de resultados | Sí | `CotizacionesReporteActivity.java:146` | chip/resumen CheckApp | No existe | Baja | Sí | No | Bajo | `MIGRAR ADAPTADO` |
| Empty state | Sí | layout + `tvCotRptVacio` | estado empty CheckApp | Parcial | Baja | No | No | Bajo | `REUTILIZAR EXISTENTE` |
| Detalle modal | Sí | `CotizacionesReporteActivity.java:371` | modal oficial CheckApp | No existe | Media | Sí | No | Medio | `MIGRAR ADAPTADO` |
| Nueva cotización | Sí | `CotizacionesActivity.java` | formulario/panel web | No existe | Alta | Sí | No determinable | Alto | `MIGRAR ADAPTADO` |
| Editar borrador | Sí | `CotizacionesActivity.java:1973` | edición web | No existe | Alta | Sí | No determinable | Alto | `MIGRAR ADAPTADO` |
| Solo lectura para no borrador | Sí | `CotizacionesActivity.java:2110` y extras | vista detalle | No existe | Media | Sí | No | Medio | `MIGRAR ADAPTADO` |
| Clonar | Sí | `CotizacionesReporteActivity.java:465` | acción secundaria | No existe | Media | Sí | No determinable | Medio | `MIGRAR ADAPTADO` |
| Cancelar con motivo | Sí | `CotizacionesReporteActivity.java:236` | modal confirmación | No existe | Media | Sí | No determinable | Medio | `MIGRAR ADAPTADO` |
| Autorizar | Sí | `CotizacionesReporteActivity.java:174` | acción de negocio | No existe | Media | Sí | No determinable | Alto | `REQUIERE DECISIÓN DEL PRODUCT OWNER` |
| Convertir a pedido | Sí | `CotizacionesReporteActivity.java:198` | acción de negocio | No existe | Alta | Sí | No determinable | Alto | `REQUIERE DECISIÓN DEL PRODUCT OWNER` |
| PDF | Sí | `CotizacionPdfHelper.java:48` | PDF server-side | Parcial | Alta | Sí | No | Medio | `MIGRAR ADAPTADO` |
| Búsqueda de cliente | Sí | `CotizacionesActivity.java:270` | selector/modal clientes | Parcial | Media | Sí | No | Medio | `REUTILIZAR EXISTENTE` |
| Búsqueda de producto | Sí | `CotizacionesActivity.java:476` | selector/modal producto | Parcial | Alta | Sí | No | Medio | `MIGRAR ADAPTADO` |
| Existencias informativas | Sí | `CotizacionesActivity.java:733` | tooltip/modal existencias | No localizada | Alta | Sí | No | Medio | `MIGRAR ADAPTADO` |
| Tallas | Sí | `CotizacionesActivity.java:733` | Sin equivalente | Fuera de alcance | Redefinir sin talla | Sí | No | Alto | `DESCARTAR POR ALCANCE` |
| Curvas | Sí | payload y selector de tallas | No equivalente claro | No existe | Alta | Sí | No determinable | Alto | `REQUIERE DECISIÓN DEL PRODUCT OWNER` |
| Correo | No encontrado | n/a | servicio de correo existente | Parcial | A evaluar | Sí | No | Medio | `REQUIERE DECISIÓN DEL PRODUCT OWNER` |
| WhatsApp | No encontrado | n/a | no localizado | No existe | Alta | Sí | No | Medio | `NO APLICA` |

## Mapeo conceptual Android -> CheckApp

Sin diseñar HTML ni implementación, el mapeo recomendado es:

- Android `listado móvil`
  -> CheckApp `listado operativo con CheckAppDynamicGrid`

- Android `fecha inicial / fecha final / buscar`
  -> CheckApp `CheckAppFilterAccordion` con resumen de filtros

- Android `contador Estado: X cotización(es)`
  -> CheckApp `chip de resultados + tarjeta de resumen`

- Android `modal de detalle`
  -> CheckApp `modal oficial` o panel lateral, según densidad final

- Android `POS de cotización`
  -> CheckApp `formulario operativo por secciones`

- Android `acciones por estado`
  -> CheckApp `acciones inline de grid + acciones de detalle`

## Componentes CheckApp futuros aplicables

- `CheckAppDynamicGrid`
- `CheckAppFilterAccordion`
- `checkapp-panel`
- `checkapp-btn`
- `checkapp-field`
- `modales oficiales`
- `estados loading / empty / error`

No se recomienda trasladar:

- layout móvil Android
- diálogos visuales Android
- selector por tallas
- generación local de PDF en caché de dispositivo

## Riesgos principales

1. El flujo Android depende de tallas y de existencias por talla, pero CheckApp no usa tallas.
2. `Autorizar` y `Convertir a pedido` son reglas de negocio, no solo botones UI.
3. La reapertura / edición se apoya en estado `BORRADOR`; esa semántica debe existir en backend web.
4. No se localizó backend `Cotizaciones` en `checklistWs`, por lo que la brecha backend es real.
5. La búsqueda de producto en Android reutiliza endpoints compartidos con ventas/existencias; en web habrá que decidir si se reutilizan o se encapsulan.

## Decisión recomendada para la siguiente fase

### Migrar en la siguiente fase

- Listado de cotizaciones
- Filtros por fecha
- Detalle de cotización
- Alta de cotización
- Edición de borrador
- Clonado
- Cancelación con motivo
- PDF adaptado a servidor/web

### Reutilizar conceptualmente

- Vertical `Clientes`
- `ProductosServicios` como punto de partida para selector de producto
- `Sucursales`
- Patrón CheckApp

### Descartar por alcance

- Tallas
- inventario por talla
- matriz talla/color
- PDF móvil local

### Requiere decisión del Product Owner antes de implementar

- Autorizar cotización
- Convertir a pedido
- Curvas comerciales
- eventual envío por correo
- eventual integración WhatsApp

## Estado final de la auditoría

Resultado suficiente para arrancar definición de fase siguiente:

- qué existe en Android: `sí, claramente`
- qué se migra: `parcial y adaptado`
- qué se descarta: `tallas`
- qué requiere backend: `sí`
- qué requiere SQL: `no determinable sin auditar persistencia objetivo`
- qué puede reutilizarse en CheckApp: `Clientes, ProductosServicios parcial, Sucursales, patrón UI`

No se inició implementación.
