# BL-03 FASE B OC-03 - Nueva OC Patron CheckApp

Ticket ejecutado: `BL-03 -> FASE B -> OC-03`.

## Alcance

Se actualizo la captura existente de Nueva Orden de Compra en `/Activos/OrdenesCompra/Nueva` para operar contra el modelo V1 aprobado de OC, sin construir Recepcion UI, sin modificar Legacy y sin mover inventario al crear o generar una OC.

## Implementacion

- Wizard de 4 pasos preservado: Configuracion, Productos y servicios, Partidas, Revisar y guardar.
- Paso Productos y servicios consume `BuscarProductosServiciosOrdenCompra` con productos, servicios, variantes activas y `OrdenesCompraPresentacionesCompra`.
- Productos con variantes activas bloquean alta sin variante.
- Servicios no aceptan variante ni presentacion de compra.
- PresentacionCompra usa `OrdenesCompraPresentacionesCompra` V1; no usa PresentacionesVenta.
- Captura mixta producto + servicio habilitada.
- Grid de partidas muestra tipo, producto/servicio, variante, presentacion de compra, cantidad compra, unidad compra, factor, cantidad base, costo, subtotal y accion Quitar.
- Calculo UI: `CantidadBaseOrdenada = CantidadCompra * FactorConversionSnapshot`; `Subtotal = CantidadCompra * CostoUnitario`.
- API recalcula/valida factor, cantidad base, variante y presentacion desde SQL server-side.
- `GuardarBorradorOrdenCompra` persiste snapshots de variante, presentacion y unidades de compra.
- `GenerarOrdenCompra` conserva semantica de estado; no escribe `InventarioSaldos`, `InventarioMovimientos` ni `InventarioSeries`.

## Archivos

- `inspector/checklist/Views/Activos/OrdenesCompra/Nueva.cshtml`
- `inspector/checklist/wwwroot/js/Activos/OrdenesCompra/OrdenesCompra.js`
- `inspector/checklist/wwwroot/css/Activos/OrdenesCompra/OrdenesCompra.css`
- `inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`
- `inspectorapi/checklistWs/Models/OrdenesCompra/OrdenesCompraModels.cs`
- `inspectorapi/checklistWs.Tests/Controllers/OrdenesCompra/OrdenesCompraOc03SourceTests.cs`

## Validaciones

- AuthZ `05003001`: MVC y API conservan permiso especifico de Nueva OC.
- Padre no concede hijo: cubierto por `ProveeduriaMenuBuilderTests`.
- Multitenant: `idEmpresa` se resuelve server-side en API; request cross-tenant falla por contexto.
- Gate: scope `OrdenesCompra` permanece versionado V1.
- Inventario V1 queda como fuente operativa; OC no mueve inventario.
- Recepcion V1 no se modifico y no se implemento UI de Recepcion.
- Legacy no se modifico.

## Pruebas

- `node --check inspector/checklist/wwwroot/js/Activos/OrdenesCompra/OrdenesCompra.js`: PASS.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore`: PASS con warnings existentes.
- `dotnet build inspector/checklist/checklist.csproj --no-restore`: PASS con warnings existentes.
- `dotnet test inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --no-restore --filter "FullyQualifiedName~OrdenesCompraOc03SourceTests|FullyQualifiedName~OrdenesCompraSchemaContractTests|FullyQualifiedName~ProveeduriaMenuBuilderTests" --verbosity minimal`: PASS 12/12.

## QA runtime

PASS tecnico con API firmado y SQL real reversible:

- Fixture temporal: producto sin variante, producto con variante existente, presentacion de compra V1 temporal y servicio existente.
- OC mixta generada con 4 partidas: producto base directo, producto con variante, producto con variante + presentacion compra y servicio.
- PresentacionCompra validada desde `OrdenesCompraPresentacionesCompra`: factor 4, cantidad compra 3, cantidad base 12.
- Cross-tenant fail closed: request con tenant distinto regreso 400.
- Inventario antes: `InventarioSaldos=0`, `InventarioMovimientos=0`, `InventarioSeries=0`.
- Inventario despues de guardar/generar OC: `InventarioSaldos=0`, `InventarioMovimientos=0`, `InventarioSeries=0`.
- Cleanup reversible ejecutado: OC temporal, detalle, presentacion temporal y producto fixture eliminados; maestros existentes preservados.
- Conteos maestros preservados tras cleanup: OrdenesCompra 43 activas, OrdenesCompraDetalle 79 activas, ProductosServicios 2, Proveedores 3, Sucursales 5.

## Siguiente ticket recomendado

`OC-04 - API OC y AuthZ` / reporte o siguiente backlog real segun PO. No ejecutado desde OC-03.

## Incidente QA real SuperAdmin / identidad - 2026-09-21

Reabierto por evidencia PO y corregido:

- SuperAdmin real ya visualiza OC/Recepcion ON + disabled en RolesPermisos, sin editar JSON ni quitar proteccion.
- Nueva OC ya resuelve usuario activo con identidad oficial string/Firebase UID para AuthZ; GUID solo cuando existe para auditoria.
- QA navegador autenticado real recorrio Home -> RolesPermisos -> Proveeduria -> Nueva OC -> Paso 1 -> Paso 2 -> Partidas -> Revision.
- Datos runtime: Razon Social `Tricell Pharmaceuticals`, Sucursal `Blue Umbrella`, Proveedor `Liverpool`, producto `Aceite Motor Sintetico` variante `5 L`, servicio `Cambio de Aceite`, total en memoria `$799.00`.
- No se guardo ni genero OC persistente.

Documento de incidente: `docs/compras/BL03_INCIDENTE_QA_REAL_SUPERADMIN_USUARIO_ACTIVO_OC03_20260921.md`.

## Reapertura OC-03R QA PO Patron CheckApp - 2026-09-21

OC-03 fue reabierto por QA PO no aprobado en UI/UX. Correccion documentada en `docs/compras/BL03_FASE_B_OC03R_QA_PO_PATRON_CHECKAPP_20260921.md`.

- Paso 02/03 homologados al Golden Master `/ProductosServicios/Index`.
- Descripciones HTML se muestran como texto plano compacto, sin tags crudos.
- Paso 02 desktop queda operable sin scroll horizontal obligatorio; scroll permanece como fallback.
- Paso 03 compacta producto/tipo/codigo/descripcion y mantiene cantidad compra, unidad, factor, cantidad base, costo, subtotal y accion.
- `Guardar orden` cambia a `Guardar borrador`; `Generar orden` se conserva como emision.
- `PresentacionCompra` sigue independiente de `PresentacionVenta`; no se copian presentaciones de venta.

Estado: `PASS TECNICO PENDIENTE APROBACION QA PO`.
