# BL-03 SEC-01R - Incidente restauracion menu SuperAdmin

Fecha: 2026-09-21
Estado: CERRADO / PASS tecnico

## Incidente

QA PO reporto que, despues de SEC-01R, el menu de SuperAdmin quedo truncado a Inspecciones y Proveeduria con Ordenes de compra. Desaparecieron ramas historicas como Checklists, Ventas, Facturacion, Cotizaciones, Clientes, Activos, Reportes y Ajustes.

## Causa raiz

La implementacion SEC-01R sustituyo el menu global de SuperAdmin por el registro parcial `ProveeduriaMenuBuilder.OfficialSuperAdminPermissions()`. Ese registro contiene solo la rama Proveeduria y fue correcto como fuente oficial de permisos nuevos, pero fue incorrecto como fuente global de menu.

Archivo responsable:

- `checklist/Controllers/HomeController.cs`: la variable `opciones` se construyo con `OfficialSuperAdminPermissions().ToList()` cuando el rol era SuperAdmin.
- `checklist/Controllers/HomeController.cs`: el render de Proveeduria usaba `BuildForSuperAdmin()`, reforzando la sustitucion parcial.

## Evidencia real

Runtime read-only contra SuperAdmin QA `denisse@checkapp.com.mx`:

- BEFORE real `Roles.Permisos`: 5 raices, 36 opciones.
- FAIL introducido por SEC-01R: 1 raiz, 13 opciones.
- AFTER fix: 5 raices, 42 opciones.
- Raices BEFORE: `01000000`, `02000000`, `03000000`, `04000000`, `05000000`.
- Raices FAIL: `05000000`.
- Raices AFTER: `01000000`, `02000000`, `03000000`, `04000000`, `05000000`.
- Perdidas en FAIL: `01000000`, `02000000`, `03000000`, `04000000`.
- Perdidas despues del fix: ninguna.
- Hash `Roles.Permisos` antes/despues: `49619bc88ba8bf4af0f3019c38af4a3b80a372100a406a110aaa02749130a20a`.
- JSON SuperAdmin modificado: no.

## Correccion

La correccion es aditiva:

1. Parsear el JSON real completo de `Roles.Permisos`.
2. Si el rol es SuperAdmin, fusionar en memoria las opciones oficiales nuevas de Proveeduria.
3. Construir el menu global desde el JSON fusionado.
4. No persistir cambios al rol.
5. No usar el registro parcial de Proveeduria como sustituto del menu global.

## Resultado runtime

Menu SuperAdmin visible despues del fix:

- Checklists.
- Inspecciones.
- Ventas.
- Facturacion.
- Cotizaciones.
- Clientes.
- Activos.
- Proveeduria.
- Reportes.
- Ajustes.

Proveeduria despues del fix:

- Productos y Servicios.
- Proveedores.
- Ordenes de compra.
  - Nueva.
  - Reporte.

Recepcion:

- `05004000`, `05004001`, `05004002` resuelven `ALLOW` para SuperAdmin.
- No se publican links de Recepcion porque la UI funcional final todavia no existe.

## Regla permanente

Las extensiones de permisos/menu para SuperAdmin son estrictamente ADITIVAS.

Ningun resolver parcial de un modulo puede sustituir el menu global ni eliminar opciones preexistentes.

Toda modificacion de permisos exige snapshot BEFORE/AFTER y prueba automatica de no perdida del menu completo.

## Validacion

- Test que reproduce la regresion: `AddOfficialSuperAdminPermissionsKeepsExistingGlobalMenuOptions`.
- Test de no perdida aditiva/idempotente: `AddOfficialSuperAdminPermissionsKeepsExistingOptionsWhenFutureProveeduriaPermissionIsRegistered`.
- Tests enfocados SEC-01R: PASS 21/21.
- Runtime SuperAdmin: menu completo restaurado, OC Nueva/Reporte visibles, Recepcion sin links.
- Datos modificados: no.
- Legacy: no.
- OC-03: no modificado.
- OC-04: no ejecutado.
- T25 / Reporte Lider: sin cambios.
