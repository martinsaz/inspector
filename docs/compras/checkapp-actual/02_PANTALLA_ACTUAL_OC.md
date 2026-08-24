# Pantalla Actual OC

Fecha: 2026-08-19

## Proposito

La pantalla real de OC actual en CheckApp es un wizard de captura y mantenimiento documental.

Hace hoy:

- configura encabezado;
- busca productos y servicios;
- arma partidas;
- recalcula total;
- guarda borrador;
- genera la orden;
- cancela la orden;
- exporta PDF y Excel.

No hace hoy:

- aprobacion;
- recepcion;
- afectacion de inventario;
- serializacion;
- por recibir;
- costo promedio.

## Acceso y contexto

- Menu: `Proveeduría -> Nueva`
- Ruta: `/Activos/OrdenesCompra/Nueva`
- Consulta de detalle: `/Activos/OrdenesCompra/Detalle/{id}`
- Seguridad observada:
  - `[Authorize]` en MVC;
  - no se encontro permiso fino especifico del modulo.

## Encabezado

Campos localizados:

- razon social obligatoria;
- sucursal obligatoria;
- proveedor obligatorio;
- fecha de orden obligatoria;
- fecha de llegada opcional;
- fecha minima;
- fecha maxima;
- observaciones.

Observacion importante:

- `Fecha minima` y `Fecha maxima` aparecen en UI, pero no se localizaron en request, tabla ni persistencia API del modulo actual.
- por lo tanto, hoy son campos visuales sin evidencia de almacenamiento en el backend auditado.

## Stepper real

### Paso 1 - Configuracion

Objetivo:

- definir empresa operativa via razon social;
- seleccionar sucursal;
- seleccionar proveedor;
- fijar fechas y observaciones.

### Paso 2 - Productos y servicios

Objetivo:

- buscar en `ProductosServicios`;
- filtrar por tipo `Producto` o `Servicio`;
- agregar resultados al armado de partidas.

Reglas visibles:

- busqueda por codigo, nombre o descripcion;
- limite de resultados;
- arranque automatico de busqueda.

### Paso 3 - Partidas

Objetivo:

- capturar cantidades y costos;
- consolidar una lista sin duplicados;
- calcular subtotal y total.

Reglas confirmadas por backend:

- no se permiten partidas duplicadas por `IdProductoServicio`;
- cantidad debe ser mayor a cero;
- costo unitario debe ser mayor o igual a cero;
- la orden requiere al menos una partida;
- la generacion exige costos validos y total mayor a cero.

### Paso 4 - Revisar y guardar

Objetivo:

- revisar encabezado;
- revisar partidas;
- guardar;
- generar;
- cancelar;
- exportar.

## Estados y comportamiento UI

- Estado inicial visible: `En captura`
- Boton `Generar`:
  - solo visible si la OC ya existe y sigue en `Borrador`
- Boton `Cancelar`:
  - visible si la OC existe y esta en `Borrador` o `Generada`
- Panel de cancelacion:
  - visible solo para orden cancelada
- Exportaciones:
  - visibles en orden persistida

## Reglas de negocio observadas

- el folio existe desde el guardado de borrador, no solo al generar;
- editar una OC archivando detalle previo y reinsertando partidas nuevas evita actualizacion granular por renglon;
- la UI habla de `sin mover inventario`, lo cual coincide con el backend auditado;
- productos y servicios comparten el mismo documento y el mismo ciclo basico de captura.

## Quién la usa

Rol funcional inferido:

- equipo administrativo o de proveeduria que necesita capturar y formalizar la OC.

No se localizo:

- aprobador;
- receptor;
- almacenista;
- comprador multinivel.

## Gaps puntuales de la pantalla

- no existe pestaña o paso de aprobacion;
- no existe captura de cantidad recibida por partida;
- no existe campo `recibido`, `pendiente`, `por recibir`;
- no existe asociacion a OT, pedido, backorder o demanda origen;
- no existe manejo de impuestos;
- no existe costo historico ni comparativo de compras previas;
- no existe soporte visible de seriales;
- `Fecha minima` y `Fecha maxima` no muestran evidencia de persistencia.
