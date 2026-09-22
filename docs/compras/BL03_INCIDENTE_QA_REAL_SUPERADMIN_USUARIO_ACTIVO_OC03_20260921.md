# BL-03 incidente bloqueante QA real SuperAdmin + OC-03

Fecha: 2026-09-21

## Alcance

Reapertura SEC-01R / OC-03 por evidencia QA real con SuperAdmin:

- RolesPermisos mostraba OC/Recepción OFF y bloqueados aunque AuthZ efectivo resolvía ALLOW.
- `/Activos/OrdenesCompra/Nueva` abría, pero la carga de catálogos fallaba con `No fue posible resolver el usuario activo`.

No se ejecutó OC-04, no se modificó Legacy y no se generó una OC persistente.

## Causa raíz

- RolesPermisos pintaba exclusivamente el JSON persistido del rol. SuperAdmin obtiene permisos funcionales nuevos por registro oficial/bypass protegido, pero ese overlay efectivo no se aplicaba al render protegido.
- Nueva OC MVC resolvía usuario activo sólo si `ClaimTypes.NameIdentifier` era GUID. La sesión real de QA puede usar Firebase UID/string; el header firmado no se enviaba o la API descartaba el identificador no GUID antes de AuthZ.

## Corrección

- `RolesPermisos/GetRol` aplica `ProveeduriaMenuBuilder.AddOfficialSuperAdminPermissions` sólo para visualización efectiva de SuperAdmin. No modifica `Roles.Permisos`.
- `RolesPermisos.js` deja SuperAdmin ON + disabled para switches protegidos y mantiene bloqueo de guardado manual.
- `CheckAppProxyHeaders` expone el resolver oficial de usuario para MVC.
- Nueva OC MVC usa el resolver oficial de identidad en vez de exigir GUID.
- API OrdenesCompra separa identidad efectiva string para AuthZ de auditoría GUID opcional.

## QA runtime real

Sesión Chrome autenticada QA:

- Home muestra Proveeduría con Productos y Servicios, Proveedores y Órdenes de compra > Nueva/Reporte.
- Recepción no muestra links porque UI funcional aún no existe.
- RolesPermisos > SuperAdmin > Proveeduría muestra ON + disabled para `05003000`, `05003001`, `05003002`, `05004000`, `05004001`, `05004002`.
- Nueva OC carga sin modal de identidad.
- Paso 1 carga Razón Social `Tricell Pharmaceuticals`, Sucursal `Blue Umbrella`, Proveedor `Liverpool`.
- Paso 2 carga catálogo real con producto, variantes y servicio.
- Se agregó en memoria producto `Aceite Motor Sintetico` variante `5 L` y servicio `Cambio de Aceite`.
- Paso 3 muestra 2 partidas.
- Paso 4 Revisión muestra encabezado y partidas. No se guardó ni generó OC.
- Refresh directo de `/Activos/OrdenesCompra/Nueva` vuelve a cargar Paso 1 y combos sin error.

## Regla permanente

SuperAdmin es un rol protegido/no editable. Las nuevas opciones registradas oficialmente deben ser resueltas automáticamente por SuperAdmin mediante el mecanismo oficial. Nunca se debe requerir al PO activar manualmente switches de SuperAdmin para acceder a una nueva funcionalidad.
