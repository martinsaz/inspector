# LP-09 - Edicion individual operativa Lista de Precios

Fecha: 2026-09-30  
Estado: IMPLEMENTADO TECNICO / BLOQUEADO QA VISUAL AUTENTICADA PO  
Scope: `ListaPrecios`

## 1. Alcance implementado

LP-09 agrega edicion individual operativa sobre `/ListaPrecios/Index` usando exclusivamente el motor/API LP-08.

Identidades soportadas desde la grilla:

- Producto.
- Servicio.
- Variante.
- PresentacionVenta.

Campos expuestos para edicion individual:

- Lista `1..10`.
- `Precio Lista`.
- `DescuentoPct`.
- `RedondeoModo`.
- `VigenciaInicio`.
- `VigenciaFin`.
- Motivo de edicion.

Operaciones expuestas:

- Resolver estado actual por identidad/lista.
- Preview con `api/ListaPrecios/Preview`, sin persistencia.
- Guardar con `api/ListaPrecios/GuardarPrecio`.
- Historial con `api/ListaPrecios/Historial`.
- Baja logica con `api/ListaPrecios/BajaPrecio/{idPrecio}`.

El navegador no implementa algoritmo comercial. El JavaScript arma solicitudes, muestra respuestas y refresca la grilla. El precio final, descuento efectivo, redondeo, vigencia, fallback, `CorrelationId` y snapshot provienen del motor LP-08.

## 2. MVC

Archivos:

- `checklist/Controllers/ListaPrecios/ListaPreciosController.cs`
- `checklist/Views/ListaPrecios/Index.cshtml`
- `checklist/wwwroot/js/ListaPrecios/ListaPrecios.js`
- `checklist/wwwroot/css/ListaPrecios/ListaPrecios.css`

Cambios:

- Se agrego proxy POST firmado server-side para `Resolver`, `Preview`, `GuardarPrecio`, `Historial` y `BajaPrecio`.
- Las escrituras MVC requieren permiso `05001009`; lectura/base conserva `05001008`.
- La vista recibe `data-can-write` para modo consulta vs modo escritura.
- Se agrego modal LP-09 con contexto de identidad, formulario comercial, preview LP-08 e historial.
- La grilla conserva filtros, resumen, columnas y export de LP-05.
- El boton de edicion esta disponible por fila; guardar/baja quedan deshabilitados si la sesion no tiene WRITE.

## 3. API

Archivos:

- `checklistWs/Services/Tenant/ListaPreciosModels.cs`
- `checklistWs/Services/Tenant/ListaPreciosService.cs`

Cambios:

- `ListaPreciosConsultaRowDto` expone `IdDetallePrecio` para permitir baja logica desde UI cuando existe precio activo especifico.
- `ConsultarAsync` propaga `resolution.IdDetallePrecio`.
- No se agregaron endpoints nuevos al API; LP-09 consume endpoints LP-08 existentes.
- No se modifico schema, runner, migraciones, tenant resolver, Auth/Login/Firebase, consumidores ni Legacy.

## 4. Permisos

- READ: `05001008`.
- WRITE/Admin: `05001009`.
- Usuarios con READ sin WRITE pueden abrir pantalla, consultar, resolver, preview e historial; guardar y baja quedan bloqueados por UI y API.
- SuperAdmin usa el resolver oficial aditivo existente.

## 5. QA automatizada

Comandos ejecutados:

```bash
node --check checklist/wwwroot/js/ListaPrecios/ListaPrecios.js
dotnet test checklistWs.Tests/checklistWs.Tests.csproj --filter "ListaPreciosServiceTests|RolesPermisosSec01RSourceTests" --no-restore -v minimal
dotnet test checklistWs.Tests/checklistWs.Tests.csproj --no-restore -v minimal
dotnet build checklistWs/checklistWs.csproj --no-restore -v minimal
dotnet build checklist/checklist.csproj --no-restore -v minimal
git diff --check
```

Resultados reales:

- `node --check ListaPrecios.js`: PASS.
- Tests LP-09/LP-08 focales: PASS `48/48`.
- Full suite API/tests: PASS `599/599`.
- Build API: PASS.
- Build MVC: PASS.
- `git diff --check` API: PASS.
- `git diff --check` MVC: PASS.
- Secret scan acotado: PASS, sin valores secretos; solo nombres de variables/campos e historial documental.

Warnings observados:

- Warnings NuGet y nullability legacy preexistentes (`NU1902`, `NU1701`, nullability, xUnit analyzer).
- No se corrigieron fuera de alcance.

## 6. QA runtime autenticada LP-09R

Se levantaron temporalmente:

- API: `http://localhost:5127`.
- MVC: `http://localhost:5200`.

Sesion real:

- Login normal CheckApp: PASS.
- Usuario QA: `denisse@checkapp.com.mx`.
- Empresa visible: `UMBRELLA`.
- Empresa esperada: `163`.
- Ruta: `/ListaPrecios/Index`.
- Permiso efectivo de escritura: `data-can-write=true`.

Resultado runtime:

- Carga inicial autenticada: PASS, `10` registros, `9` productos, `1` servicio, `0` configurados tras cleanup.
- Listas `1..10`: PASS, selector disponible y cambio validado con Lista 2 y Lista 10.
- Modal Producto base: PASS.
- Modal Servicio: PASS.
- Modal Variante: PASS.
- Modal PresentacionVenta: PASS.
- Preview LP-08 sin persistencia: PASS; preview en Lista 2 calculo precio `123.45`, descuento `10%`, redondeo `A 4/9`, vigencia `2026-09-30 - 2026-10-30`, sin persistir en grilla.
- GuardarPrecio UI: PASS sobre Producto base / Lista 10; `321.99`, descuento `5%`, redondeo `Solo a 9`, vigencia `2026-09-30 - 2026-10-30`; grilla mostro `Precio de lista` y final `$309.00`.
- Precio Lista `0.00`: PASS; motor resolvio `PRECIO_LISTA`, precio final `$0.00`, sin fallback.
- Historial: PASS; eventos `INDIVIDUAL` para alta/edicion con cambios de precio, descuento, redondeo y vigencias.
- Baja logica: PASS; modal resolvio fallback posterior, recarga mostro `Sin precio lista`, `$680.00`, origen `Precio base`.
- Responsive autenticado: PASS en `1366x768`, `1440x900`, `820x1180` y `390x844`, con `10` registros y sin overflow global.
- Consola navegador: sin errores bloqueantes.
- Puertos `5127` y `5200`: liberados al entregar.

## 7. SQL / datos / cleanup

- SQL directo: NO ejecutado.
- DDL: NO ejecutado.
- Fixtures SQL: NO creados.
- Fixture UI runtime: Producto base `001` / Lista 10, creado por UI y dado de baja logicamente por UI.
- Cleanup SQL: NO ejecutado.
- Cleanup UI: PASS; configurados activos `1 -> 0`.
- CHECKAPPERP: no modificado.
- UMBRELLA 163: usado como tenant funcional real; datos legitimos preservados.
- Datos legitimos modificados: `0`.
- Usuarios modificados: `0`.
- Roles modificados: `0`.
- Descargas: `0`.
- Credencial QA persistida: NO.

## 8. Protecciones

No se modifico:

- `checklist/wwwroot/js/Utilerias.js`.
- `checklist/Views/Shared/_Layout.cshtml`.
- `checklist/wwwroot/js/checkapp-ui.js`.
- Auth/Login/Firebase/Session/Cookies/Claims.
- `Program.cs`.
- Tenant resolver.
- Schema V2.
- Migration package.
- SchemaMigrationRunner.
- ProductosServicios funcional.
- Inventario, Curvas, OC, Recepcion, Ventas, Cotizaciones, Facturacion.
- Legacy.

No se ejecuto LP-10.

## 9. Archivos modificados LP-09

MVC:

- `checklist/Controllers/ListaPrecios/ListaPreciosController.cs`
- `checklist/Views/ListaPrecios/Index.cshtml`
- `checklist/wwwroot/js/ListaPrecios/ListaPrecios.js`
- `checklist/wwwroot/css/ListaPrecios/ListaPrecios.css`

API:

- `checklistWs/Services/Tenant/ListaPreciosModels.cs`
- `checklistWs/Services/Tenant/ListaPreciosService.cs`

Tests:

- `checklistWs.Tests/Mvc/RolesPermisosSec01RSourceTests.cs`

Docs:

- `inspector/docs/lista-precios/LP_09_EDICION_INDIVIDUAL_OPERATIVA_20260930.md`
- `inspector/AGENTS.md`
- `inspector/CLAUDE.md`
- `inspectorapi/AGENTS.md`
- `inspectorapi/CLAUDE.md`

## 10. Regresion final LP-09R

Comandos ejecutados:

```bash
node --check checklist/wwwroot/js/ListaPrecios/ListaPrecios.js
dotnet test checklistWs.Tests/checklistWs.Tests.csproj --filter "ListaPreciosServiceTests|RolesPermisosSec01RSourceTests" --no-restore -v minimal
dotnet test checklistWs.Tests/checklistWs.Tests.csproj --no-restore -v minimal
dotnet build checklistWs/checklistWs.csproj --no-restore -v minimal
dotnet build checklist/checklist.csproj --no-restore -v minimal
git diff --check
```

Resultados:

- `node --check ListaPrecios.js`: PASS.
- Tests LP-09/LP-08 focales: PASS `48/48`.
- Full suite API/tests: PASS `599/599`.
- Build API: PASS.
- Build MVC: PASS.
- `git diff --check` API: PASS.
- `git diff --check` MVC: PASS.
- Secret scan acotado: PASS; no password, token ni connection string persistidos. Unico match permitido: nombre de variable local `secret` sin valor.

## 11. Bloqueo

Ninguno.

## 12. Dictamen

LP-09 = CERRADO /
EDICION INDIVIDUAL OPERATIVA CERTIFICADA /
QA VISUAL AUTENTICADA PASS /
LISTO HANDOFF LP-10

Siguiente paso:

REVISION PO — HANDOFF LP-10.

NO EJECUTAR LP-10.
