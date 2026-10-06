# LP-12 - DynamicGrid operativo ampliado Lista de Precios

Fecha: 2026-09-30
Estado: CERRADO / QA AUTENTICADA PASS
Scope: `ListaPrecios`

## 1. Alcance

LP-12 consolida `/ListaPrecios/Index` como grid operativo CheckApp sin crear un segundo grid y sin copiar la consola Legacy completa. La configuracion local expone Foto, identidad, codigo, tipo, categoria, marca, identidad vendible, lista, Precio Lista, descuento, Precio final, origen, estatus y la accion Editar de LP-09.

El DTO LP-08 ya entregaba `DescuentoPct` y `PrecioFinal`; LP-12 los presenta sin recalcular reglas comerciales en JavaScript. Las cards usan `nombre` como titulo canonico, por lo que una URL tecnica de imagen nunca se muestra como titulo.

## 2. Matriz Legacy / CheckApp / backlog

| Capacidad | Legacy | CheckApp al iniciar LP-12 | Ticket dueno | Estado LP-12 |
| --- | --- | --- | --- | --- |
| Foto | Columna y modal | Columna LP-11 con fallback oficial | LP-11 | PRESERVADO / PASS |
| Identidad | Articulo/barcode/talla | Producto, Servicio, Variante y PresentacionVenta | LP-08/LP-09 | PASS |
| Codigo/barcode equivalente | Barcode/estilo | `Codigo`/SKU canonico de identidad | LP-12 | PASS |
| Tipo | Producto Legacy | Producto/Servicio e identidad vendible | LP-12 | PASS |
| Categoria/Marca | Linea/Marca Legacy | Catalogos reales ProductosServicios | LP-10/LP-12 | PASS |
| Atributos | Color/acabado | Filtro real LP-10; no se inventa texto denormalizado | LP-10/LP-12 | PASS COMO FILTRO |
| Lista/precio | P1..P10 fisicos | Lista seleccionada 1..10 + Precio Lista | LP-08/LP-12 | PASS |
| Descuento | D1..D10 fisicos | `DescuentoPct` resuelto por LP-08 | LP-08/LP-12 | PASS |
| Precio final | Calculado Legacy | `PrecioFinal` resuelto por LP-08 | LP-08/LP-12 | PASS |
| Origen | Semantica Legacy | Precio de lista / Precio base | LP-08/LP-12 | PASS |
| Estatus | Estado articulo | Estado de identidad y producto padre | LP-12 | PASS |
| Editar | Edicion por articulo | Modal individual LP-09 | LP-09 | PRESERVADO / PASS |
| Existencia resumida/movimientos | Matriz tienda/talla | Fuente Inventario separada | LP-13 | RESERVADO; sin datos ni boton inventado |
| Ajuste masivo | Disponible | No disponible | LP-14 | NO ADELANTADO |
| Copiar lista | Disponible | No disponible | LP-15 | NO ADELANTADO |
| Descuento por marca | Disponible | No disponible | LP-16 | NO ADELANTADO |
| Excel operativo ampliado | Grid operativo completo | Excel actual del DynamicGrid | LP-17 | RESERVADO; export actual preservado |
| Historico ampliado | `preciosl`/reportes | Historial individual LP-09 | LP-18 | NO ADELANTADO |
| Ventas | Matrices por periodo | Sin fuente en ListaPrecios | LP-19 | NO ADELANTADO |
| Sugerencias | Ofertar/Resurtir/Vigilar | Sin algoritmo ni boton | LP-21 | NO ADELANTADO |

## 3. Implementacion LP-12

- Se agregaron columnas `Descuento` y `Precio final` a la configuracion local del DynamicGrid y al encabezado Razor.
- `Precio final` permanece esencial/no ocultable y usa `PrecioFinal`; conserva fallback tecnico a `PrecioEfectivo` para compatibilidad del DTO.
- Se fijo `mobileCardTitleKey: "nombre"` para evitar que Foto/URL sea el titulo mobile.
- Se preservaron selector Columnas, sorting DataTables, busqueda interna, paginacion 25/50/100, contador, empty state y Excel existente.
- Se preservo un unico `CheckAppDynamicGrid`; `checkapp-ui.js` no se modifico.
- Se agrego prueba fuente LP-12 para columnas, titulo mobile, controles operativos y ausencia de acciones LP-13/14/15/16/21.

## 4. QA autenticada UMBRELLA 163

- Registros: `10` (`9` productos, `1` servicio, `0` configurados).
- Producto, Servicio, Variante y PresentacionVenta: PASS.
- Foto: PASS, `52x52`, `object-fit: cover`; Foto no exportable.
- Descuento runtime actual: `0.00%` en las 10 identidades.
- Precio final: PASS con valores reales del motor; ejemplo Variante 10 L `$1,299.00`, Servicio `$1,500.00`.
- Editar: PASS en las cuatro identidades; un click abre un modal.
- Columnas: PASS; `14` activas, Descuento ocultable/restaurable y columnas esenciales no expuestas como ocultables.
- Ordenamiento: PASS por Identidad.
- Busqueda interna `Cambio de Aceite`: PASS, `1` registro.
- Paginacion: PASS; dataset actual `Pagina 1 de 1`, controles anterior/siguiente correctamente deshabilitados; opciones 25/50/100 disponibles.
- LP-10 Tipo Servicio: PASS, `1` card; Editar posterior al re-render PASS; Limpiar restaura `10`.
- F5 autenticado: PASS, restaura `10`.
- Excel fisico: PASS, `ListaPrecios_20260930.xlsx`, `12` columnas y `10` filas; Foto y Acciones excluidas. Archivo QA eliminado al cierre.
- Cross-tenant: FAIL CLOSED por cobertura automatizada existente; no se agrego parametro tenant manipulable.

## 5. Responsive

- Desktop: `innerWidth=1440`, `clientWidth=1440`, `bodyScrollWidth=1440`, tabla y Editar PASS.
- Tablet: `innerWidth=820`, `clientWidth=820`, `bodyScrollWidth=820`, tabla y Editar PASS.
- Mobile: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`, `10` cards y `10` acciones Editar PASS.
- Titulos mobile: nombres de identidad; URLs tecnicas como titulo `0`.
- Producto, Servicio, Variante y PresentacionVenta Editar mobile: PASS.
- CSS LP-11R2 no modificado.

## 6. Regresion

- `node --check ListaPrecios.js`: PASS.
- Focales `ListaPreciosServiceTests|RolesPermisosSec01RSourceTests`: `62/62` PASS.
- `ListaPreciosServiceTests`: `50/50` PASS.
- Full suite: `613/613` PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `git diff --check` MVC/API: PASS.
- Secret scan acotado: PASS.

Warnings NuGet/nullability/analyzers observados son preexistentes y no se corrigieron fuera de alcance.

## 7. Protecciones y cleanup

- Sin SQL, DDL, schema, migraciones ni fixtures.
- Datos legitimos, usuarios y roles modificados: `0`.
- Auth/Login/Firebase, ProductosServicios funcional y Legacy: sin cambios.
- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: sin cambios.
- Procesos temporales API/MVC detenidos al cierre.
- Credencial QA no persistida.
- LP-13 no ejecutado.

## 8. Dictamen

LP-12 = CERRADO /
DYNAMICGRID OPERATIVO AMPLIADO CERTIFICADO /
LISTO HANDOFF LP-13

Siguiente paso: REVISION PO - NO EJECUTAR LP-13.
