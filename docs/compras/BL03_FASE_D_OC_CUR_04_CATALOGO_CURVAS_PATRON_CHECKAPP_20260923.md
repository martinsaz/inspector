# BL-03 FASE D OC-CUR-04 - Catalogo de Curvas Patron CheckApp

Fecha: 2026-09-23

## Estado

OC-CUR-04 queda implementado tecnicamente y certificado en codigo, build, suite y SQL real CheckAppErp. No se declara `LISTO QA PO` porque el navegador local autenticado no estuvo disponible: `http://localhost:5200/Proveeduria/Curvas/Catalogo` redirigio a Login y no se desactivo autenticacion ni se usaron credenciales inventadas.

## Alcance implementado

- Ruta MVC: `/Proveeduria/Curvas/Catalogo`.
- API: `api/CurvasCatalogo`.
- Menu: `Proveeduria > Curvas > Catalogo de Curvas`.
- Permisos:
  - `05005000` Curvas, agrupador solo Acceso.
  - `05005001` Catalogo de Curvas, Acceso + Escritura.
- SuperAdmin: permisos oficiales aditivos, protegidos y no editables.
- RolesPermisos: switches de Acceso/Escritura para Catalogo, padre sin herencia funcional al hijo.
- UI: DynamicGrid oficial y estilos compartidos de ProductosServicios; sin CSS paralelo.
- CRUD: alta, edicion, baja logica, reactivacion.
- Detalle: producto + variante nullable + cantidad objetivo en unidad base.
- Servicios: no elegibles y rechazados fail closed si se manipula el request.
- Multitenant: `idEmpresa` server-side y validacion de producto/variante por tenant.
- Gate: `Curvas` requerido para lectura/escritura.

## Archivos principales

- `inspector/checklist/Controllers/Curvas/CurvasController.cs`
- `inspector/checklist/Views/Curvas/Catalogo.cshtml`
- `inspector/checklist/wwwroot/js/Curvas/CurvasCatalogo.js`
- `inspector/checklist/Clases/ProveeduriaMenuBuilder.cs`
- `inspector/checklist/Controllers/RolesPermisos/RolesPermisosController.cs`
- `inspectorapi/checklistWs/Controllers/Curvas/CurvasCatalogoController.cs`
- `inspectorapi/checklistWs/Services/Tenant/CurvasScopeService.cs`
- `inspectorapi/checklistWs/Services/Tenant/CurvasScopeModels.cs`

## SQL real CheckAppErp

- DatabaseIdentity: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`
- IdentityFingerprint: `c350a230091367524aa216e862ad97bef1dfc6e773fa73b16206248613810719`
- Scope: `Curvas`
- Version: `1`
- Hash: `85167e40a617c4535514563c03cfd3c49ec5c0f915f122b0d0c533779e88d4f5`
- State: `PROVISIONED/PASS`
- History: `1`
- Attempts: `4`
- Drift: `SchemaOk/0`
- Gate: `COMPATIBLE`
- CRUD fixture: PASS con transaccion reversible.
- Producto sin variante: PASS.
- Producto con variante: PASS.
- Servicio manipulado rechazado: PASS.
- Baja logica/reactivacion: PASS.
- Cross-tenant: FAIL CLOSED.
- PresentacionCompra cerrada/libre preservadas.
- Cleanup: `Curvas:0;Detalles:0`.

## Pruebas

- `node --check checklist/wwwroot/js/Curvas/CurvasCatalogo.js`: PASS.
- `node --check checklist/wwwroot/js/RolesPermisos/RolesPermisos.js`: PASS.
- `dotnet build inspector/checklist/checklist.csproj --no-restore`: PASS.
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore`: PASS.
- `dotnet test inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --no-restore`: PASS, 499 tests, 0 fail.
- `git diff --check`: pendiente de cierre final en ambos repositorios al terminar la tarea.
- Secret scan: pendiente de cierre final al terminar la tarea.

## QA visual/runtime autenticado OC-CUR-04R

El PO habilito Chrome localhost autenticado y se reprodujo la regresion reportada: `/Proveeduria/Curvas/Catalogo` renderizaba documento completo con `body` vacio. El primer fallo real fue Razor: la vista declaraba `@section Styles`, pero `_Layout.cshtml` no renderiza esa seccion. La excepcion quedaba oculta porque el middleware global de MVC tragaba excepciones y dejaba pantalla blanca.

Correcciones aplicadas:

- `Program.cs`: el middleware ya escribe la excepcion y relanza, evitando pantallas blancas silenciosas.
- `Catalogo.cshtml`: se declaro el layout explicito y los estilos se cargan dentro de `@section Scripts`, igual que el Golden Master `ProductosServicios/Index`.
- `CurvasController`: headers proxy alineados al patron `X-ProductosServicios-Proxy-*`.
- `CurvasCatalogoController`: resolucion de empresa/usuario desde headers proxy oficiales y bootstrap controlado de `Scope=Curvas` cuando el gate devuelve `SCHEMA_EMPTY`; cualquier otro bloqueo permanece cerrado.

QA runtime real ejecutado en Chrome autenticado:

- Catálogo visible: PASS.
- DynamicGrid: PASS.
- Alta: PASS.
- Producto sin variante: PASS.
- Producto con variante: PASS.
- Unidad base visible: PASS.
- Cantidad objetivo: PASS.
- Duplicidad producto+variante: PASS.
- Servicio excluido de elegibles: PASS.
- Guardar: PASS.
- F5 persistencia: PASS.
- Editar nombre: PASS.
- Baja logica: PASS.
- Filtro Inactivos/Todos: PASS.
- Reactivar y volver a Activos: PASS.
- Responsive desktop/tablet/mobile: PASS.
- Golden Master `ProductosServicios/Index`: PASS.
- Consola navegador: sin errores.
- Cleanup fixtures runtime `MOKA_OC_CUR_04R`: `CurvasCatalogo=0; CurvasDetalle=0; ProductosServicios=0; Variantes=0`.

RolesPermisos runtime confirmado con sesion autenticada antes del fix: `05005000` Curvas y `05005001` Catalogo activos y protegidos para SuperAdmin.

## No ejecutado

- No Siembra UI.
- No Huecos/Copetes UI.
- No integracion visual en Nueva OC.
- No generacion multisucursal.
- No Recepcion UI.
- No movimientos de inventario.
- No Legacy.
- No T25.
- Reporte Lider permanece FROZEN.
- No ticket posterior.

## Dictamen

Implementacion tecnica y SQL real: PASS.

Estado de entrega: `LISTO QA PO`.

Siguiente ticket recomendado: OC-CUR-05. No ejecutar ticket posterior automaticamente.

## Addendum 2026-09-23 - OC-CUR-04S

OC-CUR-04 fue reabierto por QA PO para refinar funcionalmente el Catalogo de Curvas. Se aplicaron las correcciones aprobadas sin ejecutar OC-CUR-05, sin Siembra UI, sin Huecos UI, sin Nueva OC, sin Legacy, sin T25 y sin Reporte Lider.

Cambios funcionales:

- Codigo de curva: oculto en alta y edicion; el backend lo autogenera y lo conserva inmutable en edicion.
- Estatus: switch `Activa`, alta ON por defecto, edicion refleja estado y es compatible con baja logica/reactivacion.
- Producto con variantes: al seleccionar producto se cargan automaticamente todas las variantes activas.
- Inclusion/exclusion: cada variante activa puede incluirse o excluirse antes de agregarla a la curva.
- Cantidad para todas: control `Cantidad para todas` + `Aplicar a todas`; despues se permite modificar cantidades individualmente.
- Producto sin variantes: contrato conserva fila unica `Base` con `VarianteId=NULL`.
- Resumen en vivo: muestra variantes incluidas y unidades objetivo.
- Multiples productos: se preservan multiples productos y variantes dentro de una misma curva.
- Servicios: siguen fuera de Curvas V1 y el backend rechaza manipulacion de servicio.

QA runtime Chrome autenticado:

- Vista nueva cargada con `tab.goto` cache-busted despues de detectar que Chrome conservaba HTML antiguo en memoria.
- Alta nueva: PASS.
- Codigo oculto en alta: PASS.
- Switch Activa ON por defecto: PASS.
- Producto con variantes: PASS, carga automatica de 4 variantes activas.
- Aplicar a todas: PASS.
- Modificacion individual posterior: PASS.
- Excluir variante: PASS.
- Resumen `3 variantes incluidas · 17 unidades objetivo`: PASS.
- Guardar: PASS.
- F5/persistencia: PASS.
- Editar: PASS, codigo oculto y switch activo reflejado.
- Producto sin variante: PASS en SQL real CheckAppErp; no habia producto sin variantes disponible en la sesion runtime normal explorada.
- Baja logica/reactivacion runtime: NO CERTIFICADO en navegador en esta corrida; los enlaces del grid no pudieron activarse de forma confiable desde la automatizacion disponible, aunque OC-CUR-04R ya los habia certificado previamente.

Estado OC-CUR-04S:

- Implementacion: PASS.
- SQL real CheckAppErp: PASS.
- Build/suite: pendiente de cierre final de esta corrida.
- Estado maximo declarado por esta corrida: `NO LISTO QA PO` hasta recertificar baja/reactivacion y cleanup runtime completo en navegador.

## Addendum 2026-09-23 - OC-CUR-04S cierre QA runtime

Se ejecuto el cierre QA runtime solicitado para OC-CUR-04S sin ejecutar OC-CUR-05, sin Siembra UI, sin Huecos UI, sin Nueva OC, sin Legacy, sin T25 y sin Reporte Lider.

Limpieza segura en tenant normal:

- Tenant normal resuelto por mecanismo oficial de proyecto: empresa `163`, `idEmpresa=b17aaece-2b78-4e35-b554-9e694eeb15a7`.
- Identidad saneada: `sql5111/db_a883c3_checklist/SQL_Latin1_General_CP1_CI_AS`.
- Fixtures previos identificados y eliminados por ID, codigo y nombre exactos:
  - `7288786b-055a-4140-9f6c-635c1d0e5b49`, `CUR-059D3A93`, `MOKA04S QA 1790179290000`.
  - `10db9881-b1ae-40cd-a3df-0d664777e68b`, `CUR-2D736776`, `MOKA 04S QA 1790179109692`.
- Dependencias previas: `CurvasDetalle=6`, `CurvasSiembra=0`, `CurvasSugerenciasSnapshot=0`, `Operacion=0`, `RelacionOC=0`.
- AFTER fixtures previos: `0`.

QA runtime Chrome autenticado:

- Fixture controlado creado: `MOKA04S CIERRE QA 1790183648603`, codigo autogenerado `CUR-7637CB3A`.
- Producto con variantes: PASS; carga automatica de `10 L`, `20 L`, `5 L`, `946 ml`.
- Incluir/excluir: PASS; se incluyeron 3 variantes y se excluyo 1.
- Cantidad para todas + Aplicar a todas: PASS.
- Modificacion individual: PASS; cantidades `5`, `7`, `5`.
- Resumen: PASS, `3 variantes incluidas · 17 unidades objetivo`.
- Codigo oculto en alta/edicion: PASS.
- Guardar/F5/Editar: PASS.
- Baja logica desde Activos: PASS con confirmacion oficial `¿Aplicar baja lógica?`; tras F5 desaparece de Activos.
- Filtro Inactivos: PASS, fixture visible con estatus `Baja lógica`.
- Filtro Todos: PASS, fixture visible con estatus `Baja lógica`.
- Reactivar desde Inactivos: PASS con confirmacion oficial `¿Reactivar curva?`; tras F5 vuelve a Activos.
- Switch Activa desde edicion: PASS despues de corregir hidratacion defensiva del id de edicion; OFF deja la curva inactiva y ON la reactiva sin crear una segunda cabecera.
- Limpieza fixture cierre: PASS por codigo/nombre exactos; `CurvasDetalle=9`, `CurvasSiembra=0`, `CurvasSugerenciasSnapshot=0`; AFTER `0`.
- UI post-cleanup: Activos muestra solo `QA DENISSE`, curva legitima preexistente no tocada.

Correccion tecnica puntual:

- `CurvasCatalogo.js` ahora conserva el id de edicion en `state.editingId` y lo usa como respaldo del hidden `hdCurvaId`, evitando que una edicion con input oculto no hidratado cree cabeceras duplicadas.

Responsive:

- Desktop runtime real: PASS en Chrome autenticado; `window.innerWidth=2400`, sin overflow horizontal destructivo (`hasHorizontalOverflow=false`).
- Tablet/Mobile real/CDP: NO CERTIFICADO en esta corrida porque el conector disponible no expone `setViewportSize`, `resize`, `setBounds`, `Emulation.setDeviceMetricsOverride` ni comandos CDP. No se acepta PASS por CSS ni se declara `LISTO QA PO`.

Validacion tecnica:

- `dotnet test checklistWs.Tests/checklistWs.Tests.csproj --no-restore`: PASS, `500/500`, `0 FAIL`.
- `dotnet build checklist/checklist.csproj --no-restore`: PASS.
- `dotnet build checklistWs/checklistWs.csproj --no-restore`: PASS.
- `node --check checklist/wwwroot/js/Curvas/CurvasCatalogo.js`: PASS.
- `git diff --check`: PASS en MVC y API.
- Secret scan diff: PASS, sin hits.

Estado OC-CUR-04S despues de esta corrida:

- Cleanup, baja/filtros/reactivar, switch edicion, UX principal y regresion tecnica: PASS.
- Bloqueo restante: certificacion Tablet/Mobile real/CDP post-04S no disponible con el conector actual.
- Estado maximo declarado: `NO LISTO QA PO`.
