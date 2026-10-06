# LP-17 - Excel operativo ampliado

Fecha de certificacion: 2026-09-30

## Estado

LP-17 cerrado. Excel operativo ampliado certificado con QA runtime autenticada en UMBRELLA, empresa 163. LP-18 no fue ejecutado.

## Auditoria previa

- Excel Legacy: exporta la grilla filtrada con columnas operativas, precios multiples, descuentos, existencias y capacidades aun reservadas. Se uso solo como referencia funcional; no se copio su formato ni se incorporaron Ventas, sugerencias o datos inexistentes en CheckApp.
- Excel CheckApp LP-12: `ListaPrecios_YYYYMMDD.xlsx`, hoja `ListaPrecios`, autofiltro y ancho automatico; exportaba 12 columnas visibles: Identidad, Codigo, Tipo, Categoria, Marca, Identidad vendible, Lista, Precio Lista, Descuento, Precio final, Origen y Estatus.
- LP-12 ya excluia Seleccion, Foto y Acciones. No exportaba fechas, columnas tecnicas ni Existencia; el dataset vacio generaba un libro valido con encabezados y feedback controlado.
- La consulta API ya devolvia el universo completo segun filtros. DataTables aplica busqueda interna y pagina 25/50/100 solo en cliente; `buildExportRows` usa todas las filas con `search: applied`, no `page: current`.

## Contrato LP-17

- Universo: conjunto real filtrado completo, no solo la pagina visual.
- Fuente: la consulta server-side `ListaPrecios/Consulta`, sin endpoint nuevo, sin duplicar reglas de filtros en JavaScript y sin N+1.
- Filtros preservados: Lista, busqueda, Tipo, Categoria, Marca, Coleccion, Etiqueta, Atributo, Variante, PresentacionVenta, precio minimo/maximo, descuento, Estatus, Sucursal, Existencia y cantidad menor a. Ventas no se incluyo.
- Seguridad: permiso READ `05001008`; tenant resuelto server-side por MVC/API. El cliente no envia un `idEmpresa` manipulable. Cross-tenant permanece fail-closed por el resolver y la cobertura automatizada.
- Paginacion: exporta universo filtrado. El selector 25/50/100 no limita el archivo.
- Performance: una consulta filtrada, sin imagenes, binarios, consultas por fila ni limite silencioso nuevo.

## Columnas y formatos

- Columnas XLSX certificadas: Identidad, Codigo, Tipo, Categoria, Marca, Identidad vendible, Lista, Precio Base, Precio Lista, Descuento, Precio final, Existencia, Origen y Estatus.
- Precio Base, Precio Lista y Precio final se entregan como valores numericos cuando aplican. Precio `0` conserva cero numerico por el exportador; el caso `PrecioCeroConfigurado_NoHaceFallback` permanece PASS.
- Descuento conserva valor numerico cuando existe; la muestra runtime sin configuraciones activas produjo celdas vacias, no texto inventado.
- Existencia es numerica para identidades inventariables. Servicio exporta `N/A`, no cero.
- No se exportan Foto, URL de imagen, binarios, Acciones, HTML, botones, tenant, `idEmpresa`, IDs tecnicos ni CorrelationId.
- No hay fechas en el dataset LP-17. Los nulos se representan como celda vacia; `N/A` se reserva para inexistencia conceptualmente no aplicable.

## QA fisica XLSX

- Login normal autenticado; empresa visible UMBRELLA. La consola cargo 10 identidades reales: 9 de Producto y 1 Servicio.
- Click real en `Exportar Excel` genero archivos fisicos `.xlsx`. La API de automatizacion del navegador no expuso el evento `download`, pero los archivos aparecieron en Descargas y fueron abiertos desde disco por parser OpenXML.
- A, sin filtros: UI 10 / XLSX 10, 21,013 bytes.
- B, Tipo Servicio: UI 1 / XLSX 1, 16,537 bytes; Existencia `N/A`.
- C, Marca Mobil 1: UI 9 / XLSX 9, 20,522 bytes.
- D, Marca + Categoria + precio 600..1600: UI 4 / XLSX 4, 18,028 bytes.
- E, Sin existencia: UI 9 / XLSX 9, 20,522 bytes; existencia numerica cero en las nueve filas.
- Dataset vacio: UI 0 / XLSX 0, 16,061 bytes; libro valido con 14 encabezados y autofiltro `A1:N1`; feedback controlado visible.
- OpenXML: PASS por `unzip -t` y carga con `openpyxl`; hoja, dimensiones, encabezados, tipos y autofiltros verificados.
- Los archivos no contienen Foto, URL, Acciones, CorrelationId, tenant ni `idEmpresa`.
- Cleanup: 9 archivos QA eliminados; archivos Excel QA finales `0`. No se crearon fixtures ni se modificaron datos, usuarios o roles.

## Responsive

- Desktop: `innerWidth=1440`, `clientWidth=1440`, `bodyScrollWidth=1440`; boton renderizado y habilitado.
- Tablet: `innerWidth=820`, `clientWidth=820`, `bodyScrollWidth=820`; boton renderizado y habilitado.
- Mobile: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`; boton renderizado y habilitado.
- Sin regresion de toolbar ni overflow global.

## Regresion

- Prueba de contrato LP-17: PASS; fija universo filtrado, filtros, encabezados, tipos, `N/A`, columnas prohibidas, dataset vacio, nombre de archivo, lock de descarga y READ.
- `ListaPreciosServiceTests`: 115/115 PASS.
- Focales LP + LP-17: 132/132 PASS.
- Full suite: 683/683 PASS.
- LP-09 Editar, LP-10 filtros, LP-11 fotografias, LP-12 DynamicGrid, LP-13 Inventario, LP-14 Ajuste Masivo, LP-15 Copiar Lista y LP-16 Descuento Marca: PASS por suite de regresion.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check`: PASS.
- `git diff --check`: PASS en MVC y API.
- Secret scan: PASS; no se persistieron credenciales, connection strings ni tokens.

## Protecciones

- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: sin cambios; hashes certificados preservados.
- Sin cambios de Schema V2, migraciones, runner, Auth/Login/Firebase/Session/Cookies/Claims, Inventario funcional, ProductosServicios funcional ni Legacy.
- API productiva: 0 archivos modificados por LP-17. No hubo SQL, DDL, fixtures ni escrituras de negocio.

## Dictamen

LP-17 = CERRADO / EXCEL OPERATIVO AMPLIADO CERTIFICADO / QA RUNTIME AUTENTICADA PASS / LISTO HANDOFF LP-18

Siguiente paso: revision PO. No ejecutar LP-18.
