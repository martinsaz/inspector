# LP-05R7 - Auditoria funcional profunda Legacy vs CheckApp Lista de Precios

Fecha: 2026-09-29  
Scope: auditoria read-only Legacy Raramuri/Tarahumara + sazapi contra CheckApp actual.  
Regla aplicada: no implementacion, no DDL, no permisos, no menu, no Auth, no backlog ni tickets nuevos.

## 1. Resumen ejecutivo

Legacy `/productos/lista-precios` no es solo una pantalla de consulta: es una consola operativa de precios, descuentos, existencias, ventas, devoluciones, transito, pedidos, fotografias, exportacion Excel y sugerencias comerciales. CheckApp LP-05 actual es una pantalla base read-only sobre ListaPrecios V1, fiel al cierre LP-05: consulta identidades vendibles, filtros basicos, DynamicGrid y exportacion, sin editar productos, servicios ni el motor de resolucion.

Dictamen tecnico: LP-05 actual esta correctamente clasificada como visor/consulta read-only. No alcanza la intencion funcional completa de Legacy porque omite, por diseno y alcance aprobado, la consola operativa de edicion individual, operaciones masivas, descuentos, matrices y analitica comercial. Esas omisiones no deben convertirse automaticamente en backlog: requieren decision PO.

## 2. Arquitectura Legacy

Frontend Legacy principal: `Raramuri.blzr/Components/Pages/ProductosListaPrecios.razor`, con `MudDataGrid`, filtros avanzados, modales y exportacion. Servicio Blazor: `Services/Productos/ListaPreciosService.cs`, que consume `productos/lista-precios/*`. Modelos: `Models/Productos/ListaPreciosModels.cs`.

Backend sazapi expone endpoints `GET productos/lista-precios/catalogos`, `GET items`, `POST item/actualizar`, `POST ajuste`, `POST copiar-lista`, `POST descuento-marca`, matrices de ventas/devoluciones/transito/pedidos/curva, sugerencias, historial y aplicar pendientes. Persistencia Legacy se concentra en `dbo.articulo`, `dbo.precios`, `dbo.preciosl`, catalogos de linea/sublinea/clasificacion/marca/temporada/color/acabado/tienda y tablas de existencias/ventas/pedidos.

## 3. Filtros

Legacy tiene Linea, Sublinea, Clasificacion, Marca, Temporada, Color, Acabado, Lista precio, Precio min/max, Descuento, Todas las tiendas, selector de tiendas, Existencia, Cantidad menor a, Incluir ventas, Ventas del/al, busqueda libre y toggle Fotografias. Tambien colapsa filtros y muestra chips activos.

CheckApp LP-05 tiene Busqueda, Lista, Tipo, Categoria, Marca y Estatus. Equivalencias parciales: Linea/Sublinea/Clasificacion -> Categoria/Coleccion/Etiqueta/Atributos; Marca -> Marca; Color/Acabado/Temporada -> Atributos/Etiquetas/Coleccion si PO lo define; Tiendas/Existencia -> Sucursales/Inventario, fuera de ListaPrecios V1; ventas -> modulos de ventas, fuera de LP-05.

## 4. Grid

Legacy muestra foto, barcode, estilo, color, marca, descripcion, linea, existencia, precios P1..P10 y descuentos D1..D10, columnas filtrables tipo Excel, ordenamiento, paginacion 25/50/100 o 100/200/400 segun vista, contador, busqueda en lista, configuracion de columnas y responsive con tarjetas.

CheckApp LP-05 muestra Identidad, Codigo, Tipo, Categoria, Marca, Identidad vendible, Lista, Precio Lista, Precio efectivo, Origen y Estatus. Usa DynamicGrid y exporta esas columnas. Falta el set Legacy de foto/barcode/estilo/color/linea/existencia/precios multiples/descuentos/margen/ventas.

## 5. Existencias/movimientos

Legacy permite click en existencia y abre `Movimientos`, con dos vistas: `Exist · Ventas · Dev` y `Curva · Transito · Pedidos`. Presenta matriz tienda x talla con totales y puede respetar tiendas seleccionadas y rango de ventas.

CheckApp tiene Inventario/Sucursales/Curvas/OC/Recepcion como dominios separados y frozen. LP-05 actual no consulta ni presenta matrices. La adaptacion requiere integracion transversal y decision PO; no pertenece al alcance read-only de precios V1 salvo como enlace futuro.

## 6. Edicion de precios

Legacy edita por articulo/barcode: costo, listas 1..10, descuentos 1..10, precio final calculado, redondeo sin redondeo/A 4-9/Solo a 9, datos adicionales (descripcion, corrida manual, Web, Liverpool, Mercado Libre, observaciones) y promociones 2x1, 3x2, descuento en segundo y monedero.

CheckApp API LP-03 si tiene endpoints tecnicos `GuardarPrecio` y `BajaPrecio` para precio especifico de identidad vendible, protegidos por `05001009`, pero LP-05 MVC no los expone. Schema V1 solo modela precio por lista e identidad; no modela descuentos, redondeo, costo editable, promociones ni campos de marketplace.

## 7. Ajuste masivo

Legacy aplica operaciones masivas sobre el resultado de filtros: campo a modificar, tipo de ajuste, operacion y valor. Backend itera productos filtrados y usa la misma actualizacion transaccional por item.

CheckApp no tiene UI ni endpoint masivo equivalente en ListaPrecios V1. Recomendacion: fase futura con preview, confirmacion, auditoria, permisos write y limites de alcance si PO decide adoptarlo.

## 8. Copiar lista

Legacy copia una lista origen a una lista destino y opcionalmente descuentos. Operativamente actualiza columnas `precio*`/`desc*` de `dbo.precios`.

CheckApp tiene listas 1..10 como entidad tecnica (`ListaPreciosListas`) y detalle por identidad, pero no tiene copiar lista. Adaptacion posible: copiar detalles activos origen->destino, con opcion de overwrite/merge y auditoria, si PO lo aprueba.

## 9. Descuento por marca

Legacy aplica un descuento porcentual a una marca y lista seleccionada. Depende de marca Legacy y columnas de descuento por lista.

CheckApp no tiene descuentos en schema V1 ni motor LP-03. Si PO requiere descuentos, hay que decidir si entran como atributo de ListaPreciosDetalle, promocion separada o regla comercial externa. No debe agregarse por inferencia.

## 10. Sugerir acciones

Legacy calcula sugerencias comerciales por marca/filtros y clasifica Ofertar, Resurtir y Vigilar usando existencia, ventas, devoluciones, transito, pedidos, precio, costo, descuento maximo, margen y motivo. Puede abrir movimientos desde la sugerencia.

CheckApp LP-05 no tiene analitica comercial. Es funcionalidad de inteligencia operativa, no de precio base. Recomendacion: fase futura separada, despues de resolver datos de ventas/inventario y permisos.

## 11. Fotografias

Legacy tiene toggle Fotografias, columna foto y modal de imagen; intenta resolver imagen aunque ListaPrecios no tenga campo propio.

CheckApp ProductosServicios ya tiene imagen en producto/variante, pero LP-05 actual no muestra fotografia. Adaptable como columna opcional read-only, siempre desde ProductosServicios/Variantes, no desde ListaPrecios.

## 12. Excel

Legacy exporta la grilla filtrada con columnas operativas. CheckApp LP-05 exporta DynamicGrid read-only con columnas actuales y quedo certificado en LP-05R5. Falta exportar el universo Legacy porque esas columnas/datos no existen en LP-05 actual.

## 13. Modelo de datos

Legacy usa `articulo` como maestro, `precios` por barcode/talla con costo, precio 1..10 y descuentos, `preciosl` para historial/programados, mas existencias, ventas, devoluciones, transito, pedidos y curvas.

CheckApp ListaPrecios V1 usa `ListaPreciosListas` y `ListaPreciosDetalle`; identidad vendible puede ser producto, servicio, variante o presentacion venta. Tiene `Precio DECIMAL(18,2)`, activo, fecha de actualizacion y fallback a precio publico cuando no hay detalle. No incluye descuento, costo, vigencia, sucursal, cliente, moneda, impuestos, promociones ni analytics.

## 14. Endpoints

Legacy: `catalogos`, `items`, `item/actualizar`, `ajuste`, `copiar-lista`, `descuento-marca`, `margen-utilidad`, `historial`, `reporte-cambios`, `aplicar-pendientes`, matrices de devoluciones/ventas/transito/pedidos/curva y `sugerencias`.

CheckApp: API `api/ListaPrecios/Listas`, `Combos`, `Consulta`, `PreciosProducto`, `Resolver`, `GuardarPrecio`, `BajaPrecio`. MVC expone `Index`, `ObtenerCombos` y `Consultar`. Solo la API tiene escritura tecnica; la pantalla LP-05 usa read-only.

## 15. Matriz Legacy vs CheckApp

| Funcionalidad Legacy | Existe en LP-AUD-01 | Existe en backlog/docs | Ticket original | Implementada actualmente | Falta | Equivalente CheckApp | Adaptacion necesaria | Recomendacion |
|---|---|---|---|---|---|---|---|---|
| Filtros avanzados Linea/Sublinea/Clasificacion/Temporada/Color/Acabado | Si | Parcial | LP-05 solo filtros base | Parcial | taxonomia avanzada | Categoria/Marca/Estatus; atributos PS | mapear a Coleccion/Etiqueta/Atributos | ADAPTAR |
| Lista precio 1..10 | Si | Si | LP-01/LP-02/LP-03/LP-05 | Si, consulta | administracion UI | ListaPreciosListas nivel 1..10 | UI admin futura | ADOPTAR |
| Precio min/max y descuento | Si | Descuento fuera LP-01 | No asignado | No | filtros por rango/desc | Precio efectivo/lista; sin descuento | ampliar consulta/modelo si PO aprueba | ADAPTAR/PO |
| Tiendas/existencia/cantidad menor | Si | Fuera LP-01 | No asignado | No | inventario por sucursal | Inventario/Sucursales | integracion transversal | FASE FUTURA |
| Incluir ventas y fechas | Si | Fuera LP-01 | No asignado | No | ventas por periodo | Ventas no LP | consumidor/analytics | FASE FUTURA |
| Fotografias | Si | No en LP-05 | No asignado | No | columna/modal foto | Imagen PS/Variante | columna opcional read-only | ADAPTAR |
| Grid con barcode/estilo/color/linea/existencia/P1..P10/D1..D10 | Si | Parcial | LP-05 read-only base | Parcial | columnas operativas | DynamicGrid | decidir columnas canones | ADAPTAR |
| Existencias/movimientos matriz | Si | Fuera LP-01 | No asignado | No | modal completo | Inventario/Curvas/OC/Recepcion | enlaces o modal cross-domain | FASE FUTURA |
| Edicion individual P1..P10 | Si | API tecnica parcial | LP-03 API | API si, MVC no | UI, descuentos, redondeo | GuardarPrecio/BajaPrecio | pantalla write con permiso | ADAPTAR |
| Descuentos 1..10 | Si | Expresamente fuera LP-01 | No asignado | No | schema/motor/UI | ninguno | decision modelo descuentos | PO |
| Redondeo 4/9 | Si | No | No asignado | No | regla comercial | ninguno | herramienta UI separada | FASE FUTURA |
| Datos adicionales Web/Liverpool/ML/promos | Si | Fuera LP | No asignado | No | campos marketplace/promos | ProductosServicios parcial para descripcion; no marketplace | no copiar al core LP | OMITIR/FASE FUTURA |
| Ajuste masivo | Si | No | No asignado | No | operacion bulk | ninguno | preview/auditoria/permisos | FASE FUTURA |
| Copiar lista | Si | No | No asignado | No | operacion bulk | ListaPreciosDetalle | copy job transaccional | FASE FUTURA |
| Descuento por marca | Si | No | No asignado | No | descuento por marca/lista | Marca existe; descuento no | modelo descuentos | PO |
| Sugerir acciones | Si | No | No asignado | No | analytics | ninguno | modulo inteligencia comercial | FASE FUTURA |
| Excel operativo completo | Si | LP-05 Excel base | LP-05 | Parcial | columnas Legacy | DynamicGrid export | ampliar dataset si PO aprueba | ADAPTAR |

## 16. Matriz Legacy vs backlog

| Bloque Legacy | Backlog/docs actuales | Estado |
|---|---|---|
| Contrato funcional listas 1..10, identidad vendible y fallback | LP-01 | Contemplado |
| Schema V1 lista/detalle | LP-02 | Contemplado |
| Motor resolver y API tecnica guardar/baja | LP-03 | Contemplado parcialmente |
| Roles/menu lectura/escritura | LP-04 | Contemplado |
| Pantalla base consulta | LP-05 | Contemplado y cerrado |
| Edicion UI individual | No hay ticket aprobado en docs presentes | No contemplado como backlog vigente |
| Bulk ajuste/copiar/descuento marca | No hay ticket aprobado en docs presentes | No contemplado |
| Existencias/movimientos/sugerencias/fotos avanzadas | No hay ticket aprobado en docs presentes | No contemplado |

## 17. Funcionalidades omitidas

Filtros avanzados completos, matriz de existencias/movimientos, edicion UI, descuentos, redondeo, datos marketplace, promociones, ajuste masivo, copia de listas, descuento por marca, sugerencias comerciales, fotografia en grilla y Excel operativo Legacy.

## 18. Funcionalidades ya planificadas

Ya planificado/ejecutado: listas 1..10, detalle de precio por identidad vendible, resolucion con fallback, API tecnica de guardar/baja, permisos `05001008/05001009`, menu/ruta y pantalla base read-only con DynamicGrid y Excel. No se encontro backlog aprobado posterior para LP-06/LP-07 en `inspector/docs/lista-precios`.

## 19. Funcionalidades especificas Tarahumara que NO debemos copiar sin decision

Campos Web/Liverpool/Mercado Libre, promociones 2x1/3x2/segundo/monedero, redondeo comercial 4/9, matrices por talla/tienda acopladas a barcode Legacy, `precios` como columnas fijas P1..P10/D1..D10, historial `preciosl` con semantica Legacy y sugerencias basadas en margen/costo/venta sin modelo PO CheckApp.

## 20. Decisiones PO necesarias

1. Si LP futuro sera solo visor, administracion parcial o consola operativa.
2. Si descuentos forman parte de ListaPrecios V1/V2 o de promociones externas.
3. Si existencias/ventas/movimientos deben integrarse en LP o enlazarse a Inventario/Ventas.
4. Si edicion individual se habilita en MVC usando `GuardarPrecio/BajaPrecio`.
5. Si operaciones masivas requieren preview, aprobacion, auditoria y permisos nuevos.
6. Si fotografia y columnas Legacy se adoptan en DynamicGrid.
7. Si se crea backlog LP-06/LP-07 o se reabre el alcance despues de revision PO.

## 21. Matriz #MOKA LP-05R7

| Control | Resultado |
|---|---|
| Contrato leido | OK |
| AGENTS/CLAUDE MVC/API leidos | OK |
| Legacy/sazapi | READ-ONLY |
| CheckApp productivo | FROZEN |
| Codigo modificado | NO |
| BD/DDL | NO |
| Permisos/menu/Auth | NO |
| Backlog/tickets nuevos | NO |
| Documento autorizado | `LP_05R7_AUDITORIA_FUNCIONAL_PROFUNDA_LEGACY_20260929.md` |
| Estado | AUDITORIA COMPLETA / LISTA REVISION PO |

## 22. Dictamen

LP-05R7 confirma que LP-05 no debe aprobarse como homologacion funcional completa de Legacy. Si el objetivo PO era una pantalla base read-only de ListaPrecios V1, LP-05 esta alineado. Si el objetivo PO incluye la consola Legacy, faltan bloques funcionales mayores y se requiere decision PO antes de backlog.

Siguiente paso: REVISION PO - NO IMPLEMENTAR / NO MODIFICAR BACKLOG.
