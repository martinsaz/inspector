# Productos y Servicios: Ampliación Alta / Edición

Fecha: `2026-08-19`

## Alcance ejecutado

Se implementó ampliación real del módulo `ProductosServicios` en CheckApp, limitada a:

- MVC
- frontend (`cshtml`, `js`, `css`)
- API
- SQL de soporte

Se respetó el alcance congelado de no tocar funcionalmente:

- `Login`
- `Registro`
- `Firebase auth/session/JWT/mail`
- `Cotizaciones`
- `Pedidos`
- `Ventas`
- `OrdenesCompra`
- `Recepción`
- `Checklists`
- `Activos`
- `Roles/Permisos`
- menú

Solo se reutilizó el patrón de multimedia de `Activos` como referencia de UX y operación temporal/final.

## Auditoría base usada

Antes de implementar se revisó:

- [AGENTS.md](/Users/denissemendiola/dev/Inspecciones/inspector/AGENTS.md)
- [CLAUDE.md](/Users/denissemendiola/dev/Inspecciones/inspector/CLAUDE.md)
- [PRODUCTOS_SERVICIOS_API.md](/Users/denissemendiola/dev/Inspecciones/inspector/docs/productos-servicios/PRODUCTOS_SERVICIOS_API.md)
- [ACTIVOS_MULTIMEDIA_ARQUITECTURA.md](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/docs/ACTIVOS_MULTIMEDIA_ARQUITECTURA.md)
- [PATRON_CHECKAPP.md](/Users/denissemendiola/dev/Inspecciones/inspector/docs/ui/PATRON_CHECKAPP.md)

También se auditó código real del módulo actual, del backend de `ProductosServicios`, del flujo multimedia de `Activos` y la referencia SAT de Rarámuri.

## Cambios implementados

### Ficha alta / edición

Se amplió la ficha para soportar:

- `Estatus` activo/inactivo
- `Colección` con alta rápida
- `Precio de comparación`
- `Precio unitario` con monto, base y unidad
- bloque SAT:
  - `ObjetoImpuesto`
  - `ClaveProductoSat`
  - `ClaveUnidadSat`
- switch `EsProductoFisico`
- switch `UsaNumeroSerie`
- bloque logístico:
  - `Paquete`
  - `PesoKg`
  - `LargoCm`
  - `AnchoCm`
  - `AltoCm`
- atributos configurables
- generación / edición de variantes
- evidencia multimedia:
  - hasta 3 fotos
  - 1 video
  - hasta 3 documentos

### Backend / API

Se amplió `GuardarProductoServicio` para persistir:

- precios extendidos
- SAT
- logística física
- serialización
- colección
- paquete
- atributos
- variantes
- multimedia

Se agregaron endpoints nuevos:

- `GuardarColeccionProductoServicio`
- `GuardarPaqueteProductoServicio`
- `GuardarAtributoProductoServicio`
- `SubirMultimediaTemporal`
- `LimpiarMultimediaTemporal`

`ObtenerCombosProductosServicios` ahora expone también:

- `Colecciones`
- `Paquetes`
- `Atributos`
- `ObjetosImpuesto`
- `TiposPaquete`
- `UnidadesPrecioUnitario`

### SQL

Se ampliaron columnas en `ProductosServicios` para:

- precios extendidos
- SAT
- control físico
- dimensiones
- seriales
- colección
- paquete

Se agregaron tablas nuevas:

- `ProductosServiciosColecciones`
- `ProductosServiciosPaquetes`
- `ProductosServiciosAtributos`
- `ProductosServiciosAtributosValores`
- `ProductosServiciosProductoAtributos`
- `ProductosServiciosProductoAtributoValores`
- `ProductosServiciosVariantes`
- `ProductosServiciosVarianteValores`
- `ProductosServiciosMultimedia`

## Decisiones funcionales

- `Estatus` reutiliza `Activo` existente.
- Si `EsProductoFisico = false`, la UI oculta logística, pero la edición no destruye datos históricos de forma silenciosa; el backend normaliza al guardar según el estado enviado.
- Las variantes heredan implícitamente el precio base si sus overrides quedan vacíos.
- Multimedia usa carga temporal a Firebase y promoción a carpeta final al guardar.
- El frontend no introduce catálogo SAT duro; solo captura campos y usa combos ligeros expuestos por API donde aplica.

## Archivos principales tocados

- [Index.cshtml](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Views/ProductosServicios/Index.cshtml)
- [ProductosServicios.js](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/wwwroot/js/ProductosServicios/ProductosServicios.js)
- [ProductosServicios.css](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/wwwroot/css/ProductosServicios/ProductosServicios.css)
- [ProductosServiciosController.cs](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/ProductosServicios/ProductosServiciosController.cs)
- [ProductosServiciosController.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs)
- [ProductosServiciosModels.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Models/ProductosServicios/ProductosServiciosModels.cs)
- [productos-servicios-up.sql](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Scripts/productos-servicios-up.sql)
- [productos-servicios-down.sql](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Scripts/productos-servicios-down.sql)

## Validación ejecutada

Se ejecutó el `2026-08-19`:

- `node --check /Users/denissemendiola/dev/Inspecciones/inspector/checklist/wwwroot/js/ProductosServicios/ProductosServicios.js`
- `dotnet build /Users/denissemendiola/dev/Inspecciones/inspector/checklist/checklist.csproj`
- `dotnet build /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/checklistWs.csproj`

Resultado:

- `node --check`: correcto
- `dotnet build MVC`: correcto con warnings preexistentes del proyecto
- `dotnet build API`: correcto con warnings preexistentes del proyecto

## Riesgos abiertos para QA manual

- validar flujo visual completo de `select2` dentro de los modales nuevos
- validar carga real de multimedia temporal/final contra Firebase
- validar combinaciones de variantes y overrides en casos con múltiples atributos
- validar migración SQL en ambiente donde ya existan datos reales de `ProductosServicios`
