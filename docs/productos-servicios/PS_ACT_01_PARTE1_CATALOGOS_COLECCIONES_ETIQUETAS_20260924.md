# PS-ACT-01 Parte 1 - Catalogos Colecciones y Etiquetas

Fecha: 2026-09-24
Estado: PASS TECNICO / BLOQUEADO QA VISUAL AUTENTICADA LOCAL

## Alcance

Se ejecuto la primera parte solicitada para Productos y Servicios:

- Homologacion visual de modales de Categoria, Marca, Unidad de medida, Coleccion y Etiqueta en quick-create y CRUD independientes.
- CRUD Patron CheckApp para Colecciones y Etiquetas con DynamicGrid oficial.
- Menu Catalogos extendido a Categorias, Marcas, Unidades de medida, Colecciones y Etiquetas.
- Filtros server-side en `/ProductosServicios/Index` por Coleccion y Etiqueta, preservando busqueda, tipo, categoria, marca, unidad, causa inventario y estatus.
- Permisos granulares nuevos: `05001006` Colecciones y `05001007` Etiquetas.

## Auditoria de contratos reales

Colecciones usa la tabla fisica `dbo.ProductosServiciosColecciones`, relacionada desde `dbo.ProductosServicios.idColeccion`. El contrato existente contiene `id`, `idEmpresa`, `identityKey`, `Numero`, `Nombre`, `Descripcion`, `Activo`, fechas de creacion/actualizacion/archivo e indices tenant-safe. No se crearon tablas nuevas.

Etiquetas usa el catalogo fisico `dbo.ProductosServiciosTags` y la relacion many-to-many `dbo.ProductosServiciosProductoTags`. El filtro por Etiqueta se implemento con `EXISTS` sobre la tabla relacional y respeta `idEmpresa` y etiquetas activas. No se uso concatenacion de strings ni busqueda insegura sobre texto plano.

No hubo DDL nuevo. El scope `ProductosServicios` se mantiene bajo infraestructura existente de versionamiento, drift y gate.

## UI y UX

Los cinco catalogos comparten el partial `_ProductosServiciosCatalogModal` y las clases oficiales de `ProductosServicios.css`. Colecciones y Etiquetas usan las rutas CRUD independientes:

- `/ProductosServicios/Colecciones`
- `/ProductosServicios/Etiquetas`

El quick-create de Etiqueta ahora abre el modal homologado desde el control de etiquetas del modal padre. Al guardar, refresca `state.combos.tags`, repinta el control y selecciona inmediatamente la etiqueta sin resetear los datos capturados del producto o servicio.

## Backend y permisos

MVC y API resuelven permisos especificos por accion:

- `05001003` Categorias
- `05001004` Marcas
- `05001005` Unidades de medida
- `05001006` Colecciones
- `05001007` Etiquetas

Padres y agrupadores no conceden hijos. SuperAdmin conserva overlay oficial aditivo y proteccion contra edicion manual. RolesPermisos muestra las cinco hijas bajo Catalogos.

Mutaciones de Colecciones y Etiquetas usan AuthZ, tenant server-side, gate, validaciones, transaccion y baja logica/reactivacion. Etiquetas preserva la semantica real: catalogo tenant y relacion many-to-many; no elimina referencias historicas.

## Frozen

BL-03, Ordenes de compra, Recepcion, Curvas, T25, Legacy y Reporte Lider permanecen FROZEN. No se ejecutaron ni adaptaron preventivamente esos modulos.

## QA tecnico

- `dotnet build` MVC: PASS.
- `dotnet build` API: PASS.
- `node --check` ProductosServicios/RolesPermisos: PASS.
- Pruebas focalizadas permisos/menu ProductosServicios: PASS.
- Full suite API: PASS tras actualizar inventario de endpoints a 62 rutas protegidas.
- `git diff --check`: PASS.

QA navegador real abrio `/ProductosServicios/Index` con sesion local activa y confirmo los filtros Coleccion/Etiqueta renderizados. Durante la validacion aparecio el aviso "Se inicio sesion en otro dispositivo con su usuario"; al cerrarlo, el entorno redirigio a Login. Sin credenciales o sesion autenticada vigente no se pudo certificar CRUD completo, quick-create completo ni responsive Desktop/Tablet/Mobile como LISTO QA PO.

## Cleanup

No se dejaron fixtures persistentes del ticket. El cambio no introduce tablas, scripts temporales ni CSS/DynamicGrid paralelos.

## PS-ACT-01S - Refinamiento visual 5 catalogos

Estado documental posterior PO 2026-09-25: `PATRON CHECKAPP OFICIAL - CATALOGOS V1 — APROBADO PO`.

El diseno compacto solicitado por PO para los cinco catalogos de Productos y Servicios fue aprobado en PS-ACT-01S-R5 y formalizado como Golden Master `SIMPLE / COMPACTO` en `inspector/docs/pattern/PATRON_CHECKAPP_CATALOGOS_V1_20260925.md`.

Alcance visual candidato:

- Categorias, Marcas, Unidades de medida, Colecciones y Etiquetas comparten `_ProductosServiciosCatalogModal`.
- El mismo componente se usa en quick-create desde `/ProductosServicios/Index` y en Alta/Edicion de los CRUD independientes.
- Los modales quedan compactos por contenido: Categoria/Marca/Coleccion, Unidad y Etiqueta usan anchos diferenciados, con mobile adaptado al viewport.
- Los labels visuales redundantes de inputs principales se sustituyen por placeholders/hints; la accesibilidad se preserva con labels asociados, `aria-label` y validaciones especificas.
- Etiquetas expone solo `Nombre`; no se muestra Descripcion ni editor HTML y no se ejecuta DDL destructivo.
- Categoria conserva Nombre, Descripcion y Aplica a; Marca conserva Nombre y Descripcion; Unidad conserva Nombre, Abreviatura y Permite decimales; Coleccion conserva Nombre y Descripcion.

Restricciones preservadas:

- No se creo CSS paralelo; los ajustes viven en `ProductosServicios.css`.
- No se creo DynamicGrid paralelo.
- No se modificaron BL-03, Ordenes de compra, Recepcion, Curvas, T25, Legacy ni Parte 2.
- No se cambio schema ni se inventaron tablas nuevas.
- El Patron CheckApp/Golden Master de Catalogos queda formalizado como `PATRON CHECKAPP OFICIAL - CATALOGOS V1`, con capsula de dimensionamiento activa. No migrar otros catalogos sin ticket especifico.
