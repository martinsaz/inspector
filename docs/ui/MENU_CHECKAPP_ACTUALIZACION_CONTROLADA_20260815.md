# Actualización controlada de menú CheckApp

**Fecha:** 2026-08-15  
**Vertical:** Menú principal  
**Product Owner:** Denisse Mendiola  
**Alcance:** estructura de menú, navegación, rutas y placeholders mínimos

## Fuentes auditadas antes de implementar

- `inspector/AGENTS.md`
- `inspector/CLAUDE.md`
- `inspector/checklist/Controllers/HomeController.cs`
- `inspector/checklist/wwwroot/js/Utilerias.js`
- controladores y vistas existentes de `Cotizaciones`, `Clientes`, `Operadores`, `Configuracion`, `Sucursales`, `RazonesSociales`, `Regiones`, `RolesPermisos`, `Usuario`

## Árbol real auditado antes del cambio

### Ventas

- padre visual existente: `Ventas`
- id real: `menu-ventas`
- tipo: link estático sin hijos
- ruta real: no tenía ruta funcional; renderizaba `javascript:void(0);`
- icono: `ki-duotone ki-element-plus fs-2`
- estado active/here/show: sin sincronización dedicada en `Utilerias.js`
- visibilidad: siempre que se construía la parte custom del menú después de `Inspecciones`
- permiso asociado: sin permiso propio nuevo; injertado visualmente desde `HomeController`

### Cotizaciones

- padre existente: `Cotizaciones`
- id real: `menu-cotizaciones`
- hija existente: `ABC Cotizaciones`
- ruta real hija: `/Cotizaciones/Index`
- estado active/here/show: helper server-side parcial + sin mapa dedicado en `Utilerias.js` previo a esta iteración
- visibilidad: injerto visual custom desde `HomeController`
- permiso asociado: sin permiso nuevo en esta capa visual

### Clientes

- padre existente: `Clientes`
- id real: `menu-clientes`
- hijas existentes:
  - `ABC Clientes` -> `/Clientes/Index`
  - `Reporte` -> `/Clientes/Reporte`
- estado active/here/show: sin mapa dedicado en `Utilerias.js` previo a esta iteración
- visibilidad: injerto visual custom desde `HomeController`
- permiso asociado: sin permiso nuevo en esta capa visual

### Facturación

- no existía nodo actual en `BuildMenu`
- no se encontró ruta MVC equivalente existente reutilizable

### Ajustes

- padre existente: `Ajustes`
- id real: `04000000`
- orden real previo:
  1. `Usuarios` -> accordion `04001000`
  2. `Roles y Permisos` -> `/RolesPermisos/RolesPermisos`
  3. `Sucursales` -> `/Sucursales/SucursalesABC`
  4. `Razones Sociales` -> `/RazonesSociales/Index`
  5. `Regiones` -> `/Regiones/Index`
  6. `Operadores` -> `/Operadores/Index`
  7. `Configuración`
     - `Correo saliente` -> `/Configuracion/CorreoSaliente`
- hallazgo crítico:
  - `Roles y Permisos` ya estaba como hija directa de `Ajustes`
  - no era hija de `Configuración`
  - no debía moverse
- estados active/here/show:
  - `Utilerias.js` no tenía sincronización dedicada para la rama de Ajustes previa a esta iteración
- visibilidad:
  - `Ajustes` depende de permiso legacy `04000000`
  - `Usuarios`, `Roles y Permisos`, `Sucursales`, `Razones Sociales` y `Regiones` dependen de los hijos legacy de `item.Hijos`
  - `Operadores` se injerta solo cuando existe acceso a `04001000`
  - `Configuración > Correo saliente` se injerta visualmente como rama protegida aprobada

## Hallazgos de reutilización

- `Nueva Venta`: no se encontró una pantalla funcional real asociada al nodo actual `Ventas`; el nodo previo no navegaba.
- `Devoluciones`: no se encontró pantalla/ruta MVC existente reutilizable.
- `Panel de facturación`: no se encontró pantalla/ruta MVC existente reutilizable.
- `Ajustes PV por tienda`: no se encontró pantalla/ruta MVC existente reutilizable.
- `Formas de pago`: no se encontró pantalla/ruta MVC existente reutilizable.

## Implementación aplicada

- `Ventas` se convirtió en padre desplegable con:
  - `Nueva Venta` -> `/Ventas/Nueva`
  - `Devoluciones` -> `/Ventas/Devoluciones`
- se agregó nuevo padre `Facturación` con:
  - `Panel de facturación` -> `/Facturacion/Panel`
- `Ajustes` conservó intactos:
  - `Roles y Permisos`
  - `Configuración`
  - `Correo saliente`
- se agregaron después de `Configuración` y en el orden aprobado:
  - `Ajustes PV por tienda` -> `/Ajustes/AjustesPvPorTienda`
  - `Formas de pago` -> `/Ajustes/FormasPago`
- se crearon placeholders MVC mínimos solo para las opciones sin implementación existente.
- no se crearon roles ni permisos nuevos.
- no se modificaron rutas protegidas existentes de `Roles y Permisos` ni `Configuración > Correo saliente`.

## Active state y expansión

- `Utilerias.js` ahora sincroniza explícitamente `active`, `here` y `show` para:
  - `Ventas`
  - `Facturación`
  - `Cotizaciones`
  - `Clientes`
  - `Ajustes` y sus nuevas rutas controladas
  - `Roles y Permisos`
  - `Sucursales`
  - `Razones Sociales`
  - `Regiones`
  - `Operadores`
  - `Correo saliente`

## Riesgos residuales

- `Ventas` no tenía funcionalidad previa reutilizable; `Nueva Venta` quedó como placeholder controlado hasta que el PO autorice la implementación funcional real.
- los nodos visuales custom siguen injertados en `HomeController.BuildMenu` y no provienen de un catálogo server-side homogéneo de permisos.
