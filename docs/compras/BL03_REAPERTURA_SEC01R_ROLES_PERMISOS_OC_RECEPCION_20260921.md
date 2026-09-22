# BL-03 SEC-01R - Correccion Roles/Permisos OC + Recepcion

Reapertura ejecutada para corregir el bloqueo QA PO donde `RolesPermisos` mostraba los agrupadores `Ordenes de compra` y `Recepcion`, pero no permitia certificar visualmente sus hijos funcionales.

## Diagnostico

Los codigos existian en backend y en el contrato SEC-01, pero el recorrido real mostraba un gap de implementacion:

- BD/fuente: `Roles.Permisos` guarda JSON jerarquico; fixture reversible valido `05003000/1/2` y `05004000/1/2`.
- DTO/MVC: `RolesPermisosController` ya tenia constantes y guardado/recarga para los seis codigos.
- Arbol/render: los hijos existian en Razor, pero quedaban ocultos por el estado visual del agrupador y no eran certificables desde QA cuando el padre estaba apagado.
- Guardar/recargar: el controller persiste hijos con `Acceso` y `Escritura` independientes; agrupadores quedan con `Escritura=0`.
- Menu lateral: `ProveeduriaMenuBuilder` no concede hijos desde padre; ahora ademas no publica links de Recepcion sin UI funcional.
- AuthZ MVC/API: Nueva OC usa `05003001`, Reporte OC usa `05003002`, Recepcion tecnica usa `05004001/05004002`; padres `05003000/05004000/05000000` no autorizan mutables.

## Correccion

- `RolesPermisos.js`: OC y Recepcion mantienen hijos renderizables bajo el arbol Proveeduria; al activar un hijo se activa el agrupador visual correspondiente sin guardar permisos implicitamente hasta presionar Guardar.
- `ProveeduriaMenuBuilder`: OC sigue mostrando solo hijos autorizados; Recepcion queda como permiso definido, pero sin enlaces `/Activos/Recepcion/*` hasta existir UI final funcional.
- SuperAdmin usa el resolver oficial de Proveeduria (`ProveeduriaMenuBuilder.OfficialSuperAdminPermissions`) para obtener automaticamente las opciones funcionales registradas. No depende de activar switches, no edita `Roles.Permisos`, no quita la proteccion del rol y aplica tambien a futuras opciones agregadas al Patron CheckApp dentro del registro oficial.
- `HomeController` distingue el rol protegido y construye el menu de Proveeduria de SuperAdmin desde el registro oficial, no desde el JSON editable.
- `OrdenesCompraController` autoriza a SuperAdmin contra el mismo registro oficial para `05003001`/`05003002`, incluyendo escritura en Nueva OC.
- Tests agregados para arbol OC/Recepcion, padre no concede hijo, persistencia fuente de hijos/escritura, agrupadores solo acceso y ausencia de links Recepcion ficticios.

## Regla permanente SuperAdmin

SuperAdmin es un rol protegido/no editable. Las nuevas opciones registradas oficialmente deben ser resueltas automaticamente por SuperAdmin mediante el mecanismo oficial. Nunca se debe requerir al PO activar manualmente switches de SuperAdmin para acceder a una nueva funcionalidad.

La disponibilidad de menu debe distinguir permiso efectivo contra ruta funcional implementada. SuperAdmin puede resolver `ALLOW` para Recepcion aunque los enlaces `Recepcion`, `Nueva` y `Reporte` no se publiquen mientras no exista UI funcional final.

Regla adicional por incidente critico: las extensiones de permisos/menu para SuperAdmin son estrictamente aditivas. Ningun resolver parcial de un modulo puede sustituir el menu global ni eliminar opciones preexistentes. Toda modificacion de permisos exige snapshot BEFORE/AFTER y prueba automatica de no perdida del menu completo.

Documento de incidente/restauracion: `BL03_SEC01R_INCIDENTE_RESTAURACION_MENU_SUPERADMIN_20260921.md`.

## QA runtime

- RolesPermisos real en `http://localhost:5200/RolesPermisos/RolesPermisos`: pestaña Proveeduria muestra `Ordenes de compra -> Nueva/Reporte` y `Recepcion -> Nueva/Reporte` al activar los agrupadores.
- Ruta Nueva OC: `GET /Activos/OrdenesCompra/Nueva` responde `302` a Login sin sesion con `ReturnUrl`; ruta funcional existente preservada.
- Fixture SQL reversible: rol `MOKA_SEC01R_QA_ROL_*` creado, recargado y eliminado con residuo `0`.
- Persistencia fixture: OC padre ON, Nueva OC Acceso+Escritura ON, Reporte OC OFF; Recepcion padre ON, Nueva Recepcion Acceso+Escritura ON, Reporte Recepcion OFF.
- SuperAdmin real QA: `denisse@checkapp.com.mx`, `NombreRol=SuperAdmin`, `idRol=3f8ad3aa-95c0-43e4-b34d-4e03ba559515`.
- SuperAdmin protegido/no editable: PASS.
- JSON SuperAdmin no modificado: hash antes/despues `49619bc88ba8bf4af0f3019c38af4a3b80a372100a406a110aaa02749130a20a`.
- Resolucion oficial SuperAdmin: `05003000`, `05003001`, `05003002`, `05004000`, `05004001`, `05004002` = `ALLOW`.
- Escritura oficial SuperAdmin: `05003001` Nueva OC y `05004001` Nueva Recepcion = `ALLOW`.
- Menu SuperAdmin: ProductosServicios, Proveedores, Ordenes de compra, Nueva OC y Reporte OC visibles.
- Links Recepcion SuperAdmin: no visibles porque la UI funcional final de Recepcion no existe todavia.

## Conciliacion OC-02 vs OC-03

- TOTAL fisicos `OrdenesCompraDetalle`: 88.
- ACTIVOS: 79.
- INACTIVOS/BAJA: 9.
- Dictamen: no se perdieron nueve partidas; la diferencia corresponde a registros inactivos/baja. No se borraron ni modificaron historicos para cuadrar conteos.

## Evidencia tecnica

- `node --check checklist/wwwroot/js/RolesPermisos/RolesPermisos.js`: PASS.
- `dotnet test checklistWs.Tests/checklistWs.Tests.csproj --filter "FullyQualifiedName~ProveeduriaMenuBuilderTests|FullyQualifiedName~RolesPermisosSec01RSourceTests"`: PASS 8/8.
- QA SQL reversible: PASS.
- Runtime SuperAdmin real read-only: PASS, sin cambio de JSON.

## Alcance preservado

No se crearon pantallas ficticias de Recepcion, no se modifico Legacy, no se borro historico, no se ejecuto OC/Recepcion funcional adicional y OC-03 queda nuevamente listo para QA PO, no aprobado PO.

## Reapertura incidente QA real SuperAdmin / OC-03 - 2026-09-21

SEC-01R se reabrio por evidencia real del PO: SuperAdmin mostraba OC/Recepcion OFF en RolesPermisos y Nueva OC no resolvia usuario activo.

Correccion certificada:

- RolesPermisos usa overlay oficial efectivo de SuperAdmin para pintar ON los permisos registrados oficialmente, sin modificar `Roles.Permisos`.
- SuperAdmin permanece protegido/no editable: los switches quedan ON + disabled y Guardar no altera el rol.
- Regla permanente: SuperAdmin es un rol protegido/no editable. Las nuevas opciones registradas oficialmente deben ser resueltas automaticamente por SuperAdmin mediante el mecanismo oficial. Nunca se debe requerir al PO activar manualmente switches de SuperAdmin para acceder a una nueva funcionalidad.
- Recepcion conserva ALLOW efectivo para `05004000`, `05004001`, `05004002`, pero sin links de menu hasta UI funcional.

Documento de incidente: `docs/compras/BL03_INCIDENTE_QA_REAL_SUPERADMIN_USUARIO_ACTIVO_OC03_20260921.md`.
