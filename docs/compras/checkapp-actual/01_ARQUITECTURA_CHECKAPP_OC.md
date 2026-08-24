# Arquitectura CheckApp OC

Fecha: 2026-08-19

## Rutas reales localizadas

- Captura nueva: `/Activos/OrdenesCompra/Nueva`
- Reporte: `/Activos/OrdenesCompra/Reporte`
- Detalle editable / consulta: `/Activos/OrdenesCompra/Detalle/{id}`
- API base: `/api/OrdenesCompra/*`

## Menu real

El menu actual vive en `checklist/Controllers/HomeController.cs` bajo `Proveeduría`:

- `Nueva`
- `Reporte`

## Capas

### MVC

`checklist/Controllers/Activos/OrdenesCompraController.cs`

Responsabilidad:

- exponer vistas `Nueva` y `Reporte`;
- redirigir `Index` a `Reporte`;
- resolver `Detalle/{id}`;
- actuar como proxy HTTP hacia API;
- firmar headers de empresa/usuario entre MVC y API;
- generar PDF en MVC cuando el detalle ya fue recuperado.

### Vistas

- `Views/Activos/OrdenesCompra/Nueva.cshtml`
- `Views/Activos/OrdenesCompra/Index.cshtml`

Responsabilidad:

- `Nueva`: wizard 4 pasos para captura, revision, guardado, generacion y cancelacion.
- `Index`: reporte administrativo con filtros, KPIs, grid, modal de detalle y exportaciones.

### JS

`wwwroot/js/Activos/OrdenesCompra/OrdenesCompra.js`

Responsabilidad:

- detectar si la pagina actual es `editor` o `index`;
- administrar estado cliente del wizard;
- cargar combos;
- buscar `ProductosServicios`;
- enviar guardado / generar / cancelar;
- poblar reporte, modal y exportaciones.

### API

`inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`

Responsabilidad:

- resolver contexto empresa/usuario;
- validar firma HMAC proveniente de MVC;
- leer y escribir SQL directo;
- persistir encabezado, detalle y folio;
- exportar PDF y Excel;
- validar pendientes documentales.

### Modelos / DTO

`inspectorapi/checklistWs/Models/OrdenesCompra/OrdenesCompraModels.cs`

Cobertura:

- requests de guardado, generar, cancelar y validar pendientes;
- DTO de listado, detalle, combos, busqueda, resumen y exportacion.

### SQL

`inspectorapi/checklistWs/Scripts/ordenes-compra-up.sql`

Crea:

- `dbo.OrdenesCompraFolios`
- `dbo.OrdenesCompra`
- `dbo.OrdenesCompraDetalle`

## Mapa pantalla -> accion -> MVC -> API -> SQL -> tabla -> resultado

### Wizard de OC

- Pantalla:
  - `Nueva.cshtml`
- Accion:
  - cargar combos
- MVC:
  - `ObtenerCombosOrdenCompra`
- API:
  - `ObtenerCombosOrdenCompra`
- SQL:
  - `SELECT` a `RazonesSociales`, `Sucursales`, `ActivosProveedores`
- Tabla:
  - catalogos
- Resultado:
  - combos de encabezado y estados

- Pantalla:
  - `Nueva.cshtml`
- Accion:
  - buscar partida
- MVC:
  - `BuscarProductosServiciosOrdenCompra`
- API:
  - `BuscarProductosServiciosOrdenCompra`
- SQL:
  - `SELECT TOP (@Limite)` sobre `ProductosServicios`
- Tabla:
  - `dbo.ProductosServicios`, `dbo.ProductosServiciosUnidadesMedida`
- Resultado:
  - candidatos de producto/servicio con costo actual y bandera `CausaInventario`

- Pantalla:
  - `Nueva.cshtml`
- Accion:
  - guardar borrador
- MVC:
  - `GuardarBorradorOrdenCompra`
- API:
  - `GuardarBorradorOrdenCompra`
- SQL:
  - `INSERT` o `UPDATE` de encabezado
  - `UPDATE` de archivado de detalle previo
  - `INSERT` de nuevas partidas
  - `UPDATE OUTPUT` de folio consecutivo
- Tabla:
  - `dbo.OrdenesCompraFolios`, `dbo.OrdenesCompra`, `dbo.OrdenesCompraDetalle`
- Resultado:
  - OC queda en `Borrador`

- Pantalla:
  - `Nueva.cshtml`
- Accion:
  - generar orden
- MVC:
  - `GenerarOrdenCompra`
- API:
  - `GenerarOrdenCompra`
- SQL:
  - `SELECT` de validaciones
  - `UPDATE dbo.OrdenesCompra SET Estado = 2`
- Tabla:
  - `dbo.OrdenesCompra`, `dbo.OrdenesCompraDetalle`
- Resultado:
  - OC queda en `Generada`

- Pantalla:
  - `Nueva.cshtml`
- Accion:
  - cancelar orden
- MVC:
  - `CancelarOrdenCompra`
- API:
  - `CancelarOrdenCompra`
- SQL:
  - `UPDATE dbo.OrdenesCompra SET Estado = 3, MotivoCancelacion, FechaCancelacion`
- Tabla:
  - `dbo.OrdenesCompra`
- Resultado:
  - cancelacion documental con trazabilidad

### Reporte de OC

- Pantalla:
  - `Index.cshtml`
- Accion:
  - ver KPIs
- MVC:
  - `ObtenerResumenOrdenesCompra`
- API:
  - `ObtenerResumenOrdenesCompra`
- SQL:
  - agregados `COUNT` y `SUM(CASE...)`
- Tabla:
  - `dbo.OrdenesCompra`
- Resultado:
  - tarjetas resumen por estado

- Pantalla:
  - `Index.cshtml`
- Accion:
  - listar y filtrar
- MVC:
  - `ObtenerOrdenesCompra`
- API:
  - `ObtenerOrdenesCompra`
- SQL:
  - `SELECT` con filtros por busqueda, estado, proveedor, razon social, sucursal y fechas
- Tabla:
  - `dbo.OrdenesCompra` + joins catalogos
- Resultado:
  - grid administrativo

- Pantalla:
  - `Index.cshtml`
- Accion:
  - abrir detalle modal
- MVC:
  - `ObtenerOrdenCompra`
- API:
  - `ObtenerOrdenCompra`
- SQL:
  - `SELECT` encabezado + `SELECT` partidas activas
- Tabla:
  - `dbo.OrdenesCompra`, `dbo.OrdenesCompraDetalle`
- Resultado:
  - detalle completo sin salir del reporte

- Pantalla:
  - `Index.cshtml`
- Accion:
  - exportar listado
- MVC:
  - `ExportarOrdenesCompra`
- API:
  - `ExportarOrdenesCompra`
- SQL:
  - reutiliza `ObtenerOrdenesCompra`
- Tabla:
  - mismas del listado
- Resultado:
  - Excel del reporte

## Hallazgos de arquitectura

- El modulo actual esta mejor separado que legacy: MVC proxy, API central y modelo SQL normalizado.
- La firma HMAC entre MVC y API protege empresa y usuario cuando no vienen por claims directos.
- No existe capa de servicios dedicada; el controller API concentra reglas de negocio, SQL y exportacion.
- No se localizaron stored procedures para OC actual; el modulo usa SQL embebido directo.
