# Arquitectura SKNC Legacy - Ordenes de Compra

Fecha de auditoria: 2026-08-18

## Proyecto auditado

- Ruta: `/Users/denissemendiola/dev/skncCreator/skncCreator`
- Alcance: solo lectura
- Puerto observado: `8080`
- Proceso observado en escucha: `mono-sgen` PID `31350`

## Arquitectura real confirmada por codigo

- Framework web: `ASP.NET MVC 5`
- Runtime: `.NET Framework 4.6.1`
- Proyecto: `skncCreator.csproj`
- Ruteo: `App_Start/RouteConfig.cs`
- Vistas: `Razor .cshtml`
- Servidor local observado: `Mono.WebServer.XSP/4.6.0.0`
- Frontend: `jQuery`, `DataTables`, `Select2`, `bootstrap-datepicker`, `daterangepicker`, `Dropzone`, `SweetAlert`
- Reporteria/PDF: `Microsoft.ReportViewer.WebForms`, plantillas `RDLC`
- ORM: hay referencia a `EntityFramework 6.4.4`, pero el vertical de OC auditado no usa EF como capa principal
- Acceso a datos dominante: SQL directo mediante utilitarios `bdBase`, `asyncBdBase`, `BdBaseTransaccional`
- Encriptacion de cadena: `cTripleDES`

## Patron de capas realmente usado en OC

No existe una separacion limpia `controller -> service -> repository`.

El flujo real es:

`View/JS -> Controller MVC -> SQL directo / Model con SQL directo -> tablas`

Ejemplos:

- `Controllers/OrdenesCompraController.cs`
- `Models/OrdenesComprasPT.cs`
- `Models/OrdenCompraPTCambios.cs`
- `Controllers/RecepcionGController.cs`

## Sesion, tenant y autenticacion

- La mayoria de acciones leen cookie HTTP `whoamifbctr`
- El contexto se materializa con `Utilerias.GetConfig(usuario)`
- El tenant principal se resuelve con:
  - `myLogin.Empresa`
  - `myLogin.Cadena`
  - `myLogin.Email`
- La UI tambien carga scripts de Firebase desde layout, pero en OC auditado la autoridad operativa inmediata es la cookie + lookup a `fcempleados`

## Configuracion relevante

- `Web.config` confirma:
  - `targetFramework="4.6.1"`
  - `customErrors mode="Off"`
  - `httpCookies requireSSL="true"`
  - `aspnet:MaxJsonDeserializerMembers` alto
- `RouteConfig.cs` deja como default `Login/Index`

## Modulos auditados del vertical OC

- Captura/creacion: `/OrdenesCompra/Index`
- Reporte operativo: `/OrdenesCompra/ReporteOC`
- Aprobaciones: `/OrdenesCompra/Aprobaciones`
- Ajustes de aprobacion: `/OrdenesCompra/AjustesOrdenesCompra`
- Recepcion posterior: `RecepcionGController`
- Variantes relacionadas:
  - `Backorders`
  - `OrdenDeCompraKits`
  - enlace con `ValueVehicOTPartes`

## Hallazgos arquitectonicos clave

- La tabla principal no es encabezado/detalle separado: `OrdendeCompraPT` guarda partidas y muchos datos de cabecera repetidos por folio.
- La aprobacion vive aparte en `OrdendeCompraAprobaciones`.
- El folio no se asigna antes del bulk insert; se calcula despues con `MAX(Folio)+1`.
- La recepcion no ocurre en `OrdenesCompraController`; vive en `RecepcionGController`.
- La afectacion a inventario no sucede al aprobar: al crear solo sube `fcexistenprod.Pedido`; el inventario fisico se mueve en recepcion.
- La seguridad fuerte de permisos esta mayormente en frontend por `validarAccesoPantalla(...)`; no se observaron guardas server-side equivalentes en todos los endpoints auditados.
