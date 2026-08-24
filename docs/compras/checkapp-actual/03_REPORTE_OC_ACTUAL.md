# Reporte OC Actual

Fecha: 2026-08-19

## Ruta y proposito

- Menu: `Proveeduría -> Reporte`
- Ruta: `/Activos/OrdenesCompra/Reporte`

Su objetivo actual es administrativo:

- consultar OC existentes;
- filtrar el universo documental;
- revisar detalle desde modal;
- exportar listado o documento.

## Componentes localizados

### Hero / contexto

- titulo: `Reporte de órdenes de compra`
- mensaje: consulta por proveedor, razon social, sucursal, estado y fechas.

### KPI strip

- `Órdenes`
- `En captura`
- `Confirmadas`
- `Detenidas`
- `Importe total`

Interpretacion tecnica:

- `Confirmadas` en UI corresponde a `Generadas`.
- `Detenidas` en UI corresponde a `Canceladas`.

### Filtros

- busqueda libre;
- estado;
- proveedor;
- razon social;
- sucursal;
- fecha desde;
- fecha hasta.

### Grid

Columnas localizadas:

- acciones;
- folio;
- proveedor;
- razon social;
- sucursal;
- estado;
- fecha de orden;
- fecha de llegada;
- total;
- fecha de creacion.

Accion localizada:

- `Ver detalle`

No se localizaron acciones desde reporte para:

- editar directo;
- aprobar;
- recibir;
- duplicar;
- reenviar por correo.

### Modal de detalle

Resume:

- folio;
- estado;
- razon social;
- sucursal;
- proveedor;
- fecha orden;
- fecha llegada;
- observaciones;
- partidas;
- subtotal;
- total.

Exportaciones del modal:

- PDF
- Excel

## API y consultas

### Resumen

- endpoint: `ObtenerResumenOrdenesCompra`
- tabla fuente: `dbo.OrdenesCompra`

### Listado

- endpoint: `ObtenerOrdenesCompra`
- joins:
  - `RazonesSociales`
  - `Sucursales`
  - `ActivosProveedores`

### Detalle

- endpoint: `ObtenerOrdenCompra`
- tablas:
  - `dbo.OrdenesCompra`
  - `dbo.OrdenesCompraDetalle`

### Exportacion listado

- endpoint: `ExportarOrdenesCompra`
- formato: Excel

## Alcance real del reporte

El reporte actual sí cubre bien:

- consulta general;
- filtros operativos;
- resumen por estado;
- detalle sin cambiar de pantalla;
- exportacion.

El reporte actual no cubre:

- cola de aprobaciones;
- control de recepcion;
- pendientes por recibir;
- recepciones parciales;
- trazabilidad de inventario;
- historial de cambios de costo/cantidad;
- comparativo de proveedor o ultima compra;
- seguimiento por serial.

## Dictamen

El Reporte OC actual en CheckApp es un reporte administrativo/documental bien aterrizado para el estado real del modulo.

No debe confundirse con un tablero de abastecimiento ni con un reporte de recepcion, porque no existe todavia la etapa operativa posterior a `Generada`.
