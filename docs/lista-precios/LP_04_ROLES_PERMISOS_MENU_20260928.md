# LP-04 - Roles, Permisos y Menu Lista de Precios CheckApp

Fecha: 2026-09-28  
Estado: CERRADO / LISTO QA PO  
Scope: `ListaPrecios` Roles/Permisos/Menu

## Alcance Ejecutado

LP-04 integra Lista de Precios V1 al arbol oficial de Roles/Permisos y al menu de Proveeduria, sin implementar LP-05 ni pantalla funcional.

- Codigos nuevos bajo `Proveeduria > Productos y Servicios`:
  - `05001008` Lista de Precios, acceso solo.
  - `05001009` Administrar precios, acceso + escritura.
- Menu oficial: `Proveeduria > Productos y Servicios > Lista de Precios`.
- Ruta preparada: `/ListaPrecios/Index`.
- SuperAdmin protegido por mecanismo aditivo oficial, sin editar JSON persistido.
- API LP-03 ajustada a permisos dedicados:
  - Lectura/listas/precios/resolver: `05001008` READ.
  - Guardar/baja: `05001009` WRITE.

No se implemento UI funcional, DynamicGrid, filtros, CRUD MVC, modal, bulk edit, consumidores, schema nuevo, DDL, cambios de login, cookies, claims, Firebase, Hosting, Legacy ni backlog.

## Arbol Oficial

```text
05000000 Proveeduria
  05001000 Productos y Servicios
    05001001 ABC Productos y Servicios
    05001002 Catalogos
      05001003 Categorias
      05001004 Marcas
      05001005 Unidades de medida
      05001006 Colecciones
      05001007 Etiquetas
    05001008 Lista de Precios
      05001009 Administrar precios
```

Reglas:

- `05001000` no concede `05001008`.
- `05001008` concede navegacion y lectura de Lista de Precios.
- `05001008` no concede escritura.
- `05001009` concede administracion solo si `Acceso=1` y `Escritura=1`.
- Roles existentes no reciben permisos automaticamente.
- Nuevos roles nacen con los permisos LP en `0/0`.
- SuperAdmin resuelve permisos mediante `ProveeduriaMenuBuilder.OfficialSuperAdminPermissions()` y fusion aditiva en memoria.

## Archivos Modificados

MVC:

- `inspector/checklist/Clases/ProveeduriaMenuBuilder.cs`
- `inspector/checklist/Controllers/RolesPermisos/RolesPermisosController.cs`
- `inspector/checklist/Views/RolesPermisos/RolesPermisos.cshtml`
- `inspector/checklist/wwwroot/js/RolesPermisos/RolesPermisos.js`
- `inspector/checklist/Controllers/ListaPrecios/ListaPreciosController.cs`
- `inspector/checklist/Views/ListaPrecios/Index.cshtml`

API:

- `inspectorapi/checklistWs/Controllers/ListaPrecios/ListaPreciosController.cs`
- `inspectorapi/checklistWs/Services/Tenant/ProductosServiciosAuthorizationModels.cs`
- `inspectorapi/checklistWs/Services/Tenant/ProductosServiciosAuthorizationService.cs`

Tests:

- `inspectorapi/checklistWs.Tests/Mvc/ProveeduriaMenuBuilderTests.cs`
- `inspectorapi/checklistWs.Tests/Mvc/RolesPermisosSec01RSourceTests.cs`

## Ruta LP-05 Preparada

La ruta `/ListaPrecios/Index` esta protegida por `[Authorize]` y por permiso `05001008` contra el JSON de permisos vigente o SuperAdmin oficial. Sin permiso explicito, responde `Forbid`.

La vista contiene solo placeholder tecnico:

```text
Modulo preparado para implementacion funcional en LP-05.
```

No contiene controles funcionales ni referencias a DynamicGrid, GuardarPrecio o BajaPrecio.

## API y Consumidores Futuros

La API mantiene el motor de resolucion desacoplado en servicio. El endpoint publico `POST /api/ListaPrecios/Resolver` queda protegido con `05001008` READ para evitar exposicion sin autorizacion en la superficie HTTP actual.

Esta decision no ata futuros consumidores internos al permiso de pantalla: consumidores server-side posteriores deben reutilizar el servicio/motor o definir una superficie interna autorizada por contrato PO, sin saltar tenant validation ni Gate.

## Validacion Ejecutada

```bash
node --check /Users/denissemendiola/dev/Inspecciones/inspector/checklist/wwwroot/js/RolesPermisos/RolesPermisos.js
dotnet test /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --filter "FullyQualifiedName~ProveeduriaMenuBuilderTests|FullyQualifiedName~RolesPermisosSec01RSourceTests"
dotnet test /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --no-restore -v quiet
dotnet build /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/checklistWs.csproj --no-restore -v quiet
dotnet build /Users/denissemendiola/dev/Inspecciones/inspector/checklist/checklist.csproj --no-restore -v quiet
git -C /Users/denissemendiola/dev/Inspecciones/inspector diff --check
git -C /Users/denissemendiola/dev/Inspecciones/inspectorapi diff --check
```

Resultado:

- `node --check`: PASS.
- Pruebas enfocadas MVC/menu/RolesPermisos/API source: PASS 40/40.
- Suite completa: PASS 575/575.
- Build API: PASS, warnings existentes de paquetes/vulnerabilidades/restauracion.
- Build MVC: PASS, warnings existentes de paquetes/vulnerabilidades/restauracion.
- `git diff --check`: PASS.
- Secret scan sobre diff LP-04: CLEAN.

## Addendum LP-04R3 - Correccion Arquitectura QA

Fecha: 2026-09-28  
Estado: LP-04R2 corregido/superado por LP-04R3.

LP-04R3 corrige la conclusion operativa de LP-04R2: no se requiere que un tenant Firebase activo apunte directamente a `CheckAppErp` para certificar Roles/Permisos. En la arquitectura real, Auth/runtime y SQL tecnico de schema son responsabilidades separadas.

- Fuente real de usuarios/roles/permisos: `db_a883c3_checklist`, via `ConnectionStrings:CadenaConexionSQLServer` o `ProductosServicios:AuthorizationConnectionString`.
- Tablas runtime verificadas: `dbo.Usuarios`, `dbo.Roles`, relacion `Usuarios.idRol -> Roles.id`, permisos en `Roles.Permisos` JSON.
- Relacion Firebase/empresa/tenant: Firebase Authentication identifica al usuario; la empresa activa y `idEmpresa` se resuelven desde el contexto CheckApp/Firebase `Conexiones/{empresa}`; el descriptor resultante apunta a la base tenant que corresponde a esa empresa.
- Responsabilidad de `CheckAppErp`: base QA tecnica para `DatabaseIdentity`, `Schema`, `State`, `History`, `Attempts`, `Drift`, `Compatibility Gate` y fixtures tecnicos `ListaPrecios`. No es fuente de usuarios Firebase, roles runtime ni permisos.
- Evidencia SQL real CheckAppErp: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`, `ListaPrecios` V1, `SchemaOk/0`, Gate `COMPATIBLE`, `dbo.Roles`/`dbo.Usuarios` ausentes.

Mecanismo QA reutilizado:

- Patron historico T23/T24: fixtures SQL temporales controlados en `db_a883c3_checklist`, sin Firebase, sin cambios en Login/Auth/session, sin modificar usuarios legitimos ni SuperAdmin.
- Fixtures LP-04R3: roles/usuarios `MOKA-LP04R3-*` para `NOACCESS`, `PARENTONLY`, `READONLY`, `WRITE` y `ADMINONLY`; todos eliminados al cierre (`roles=0; users=0`).
- AuthZ efectivo ListaPrecios:
  - `NOACCESS`: read `False`, endpoint write `False`.
  - `PARENTONLY` (`05001000` ON, `05001008` OFF): read `False`, endpoint write `False`.
  - `READONLY` (`05001008` ON, `05001009` OFF): read `True`, endpoint write `False`.
  - `WRITE` (`05001008` ON, `05001009` ON/WRITE): read `True`, endpoint write `True`.
  - `ADMINONLY` (`05001009` ON/WRITE, `05001008` OFF): endpoint write `False`.

Correccion aplicada en LP-04R3:

- `api/ListaPrecios` ahora valida `05001008` READ como acceso base antes de autorizar `05001009` WRITE en `GuardarPrecio` y `BajaPrecio`.
- La correccion es acotada al controlador de Lista de Precios; no modifica Login, Firebase, Session, Cookies, Claims, `Program.cs`, codigos de permisos, schema, DDL, menu ni Legacy.
- Prueba de fuente agregada para preservar la autorizacion compuesta de Lista de Precios.

SQL real/Gate/Drift:

- LP-04R3 uso conexion QA temporal autorizada en entorno de proceso, sin persistirla ni imprimirla.
- `CheckAppErp` final: `DatabaseIdentity` esperado, `Drift SchemaOk/0`, Gate `COMPATIBLE`.
- No se ejecuto DDL ni persistencia estructural en `CheckAppErp`.

Runtime autenticado:

- No se encontro sesion local autenticada reutilizable en este turno.
- LP-04R/LP-04R2 heredados: login QA normal Denisse/SuperAdmin, menu/ruta `/ListaPrecios/Index`, placeholder LP-05, desktop/tablet/mobile y SuperAdmin ON+LOCKED ya certificados.
- LP-04R3 certifico perfiles runtime por el mecanismo historico AuthZ server-side con fixtures SQL reversibles, no por alta de cuentas Firebase nuevas.
- La proteccion de menu/ruta/API queda cubierta por builder oficial, controlador MVC, autorizacion compuesta API y suite completa.

## Controles Preservados

- No DDL.
- No cambios de schema ListaPrecios V1.
- No cambios de login, cookies, claims, Auth flow ni Firebase.
- No modificacion masiva de roles existentes.
- No SuperAdmin manual ni JSON/hash forzado.
- No Legacy.
- No LP-05.
- No backlog.

## Dictamen

LP-04 = CERRADO / LISTO QA PO.

Siguiente paso permitido: REVISION PO. No ejecutar LP-05 ni generar backlog sin autorizacion expresa del PO.
