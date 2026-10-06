# LP-10 - Filtros Avanzados CheckApp Lista de Precios

Fecha: 2026-09-30

## Estado

LP-10 implementado y certificado sobre Lista de Precios CheckApp.

No se ejecuto LP-11. No se modificaron `checklist/wwwroot/js/Utilerias.js` ni `checklist/Views/Shared/_Layout.cshtml`.

## Alcance Implementado

- Filtros server-side en `/ListaPrecios/Index` via MVC proxy y API `api/ListaPrecios/Consulta`.
- Filtros preservados: busqueda, lista, tipo, categoria, marca, estatus, limpiar.
- Filtros agregados: coleccion, etiqueta, atributo, variante, presentacion venta, precio minimo, precio maximo, descuento.
- Listas 1..10 preservadas desde LP-08.
- Precio 0.00 valido: filtro de rango acepta 0 y tests automatizados cubren precio configurado 0 sin fallback.
- Rango precio minimo > precio maximo muestra feedback controlado y no ejecuta consulta invalida desde UI; API tambien rechaza con `RANGO_PRECIO_INVALIDO`.
- Descuento se valida 0..100 y se filtra por porcentaje exacto resuelto.
- Tipo Servicio deshabilita Variante y PresentacionVenta, evitando combinaciones incompatibles.
- Existencia y Ventas quedan pendientes por dependencia funcional de Inventario/LP-13 y Ventas/LP-19; no se inventaron reglas.

## Matriz Legacy -> CheckApp

| Filtro Legacy | Equivalente CheckApp | Estado | Fuente |
| --- | --- | --- | --- |
| Linea | Categoria | PASS | `ProductosServicios.idCategoria` / `ProductosServiciosCategorias` |
| Sublinea | Coleccion/Etiqueta/Atributo segun dato real disponible | PASS parcial por mapeo CheckApp | `ProductosServicios.idColeccion`, `ProductosServiciosProductoTags`, `ProductosServiciosProductoAtributos` |
| Clasificacion | Categoria/Coleccion/Etiqueta/Atributo | PASS parcial por mapeo CheckApp | Catalogos V2 ProductosServicios |
| Marca | Marca | PASS | `ProductosServicios.idMarca` / `ProductosServiciosMarcas` |
| Temporada | Coleccion/Etiqueta/Atributo si PO la modela ahi | PENDIENTE PO | No hay campo dedicado Temporada en CheckApp V2 |
| Color | Atributo/Variante | PASS | `ProductosServiciosAtributos`, `ProductosServiciosVariantes` |
| Acabado | Atributo/Variante | PASS | `ProductosServiciosAtributos`, `ProductosServiciosVariantes` |
| Lista | Lista 1..10 | PASS | LP-08 `ListaPreciosListas` |
| Precio minimo | PrecioFinal/PrecioEfectivo minimo | PASS | Motor comercial LP-08 |
| Precio maximo | PrecioFinal/PrecioEfectivo maximo | PASS | Motor comercial LP-08 |
| Descuento | DescuentoPct exacto | PASS | LP-08 `DescuentoPct` resuelto |
| Tiendas | Sucursal/Inventario futuro | PENDIENTE | LP-13/Inventario, fuera de LP-10 |
| Existencia | Inventario futuro | PENDIENTE | LP-13/Inventario, fuera de LP-10 |
| Cantidad menor a | Inventario futuro | PENDIENTE | LP-13/Inventario, fuera de LP-10 |
| Incluir ventas | Ventas futuro | PENDIENTE | LP-19/Ventas, fuera de LP-10 |
| Ventas del/al | Ventas futuro | PENDIENTE | LP-19/Ventas, fuera de LP-10 |
| Busqueda | Busqueda general | PASS | Codigo, nombre, categoria, marca, coleccion, identidad vendible |
| Fotografias | No aplica a ListaPrecios | FUERA DE ALCANCE | Multimedia/ProductosServicios |

## QA Real UMBRELLA 163

Tenant: UMBRELLA empresa 163.

DatabaseIdentity saneada: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.

Conteos iniciales visibles:

- Total: 10.
- Productos: 9.
- Servicios: 1.
- Configurados: 0.
- Lista default: Lista 1.

Combos reales visibles:

- Listas: 10.
- Categorias: Alimentos, Electrodomesticos, Mantenimiento, Seguridad y catalogos QA existentes.
- Marcas: Castrol, Mabe, Mobil 1, Samsung y catalogos QA existentes.
- Colecciones: Coleccion 01..04 y catalogo QA existente.
- Etiquetas: ACEITES, AVION, Ivan, LTH, M01, NEW, NUEVO, OTROS, PRIMAVERA y catalogo QA existente.
- Atributos: Color QA Runtime, Colores, Consistencia, Material, Sabor, Talla.
- Variantes: 4 identidades de Aceite Motor Sintetico.
- Presentaciones venta: 4 identidades de Aceite Motor Sintetico.

Escenarios runtime autenticados:

- Categoria Mantenimiento: PASS, 1 registro, Servicio `Cambio de Aceite`.
- Tipo Servicio: PASS, 1 registro, Variante y PresentacionVenta deshabilitados.
- Busqueda sin resultados `LP10-SIN-RESULTADOS-XYZ`: PASS, 0 registros y empty state.
- Rango precio minimo 100 mayor a maximo 10: PASS, feedback visible `El precio minimo no puede ser mayor al precio maximo.`
- Limpiar + F5: PASS, vuelve a 10 registros, Lista 1, sin filtros residuales.

## Pruebas Automatizadas

- `ListaPreciosServiceTests`: 45/45 PASS.
- Cobertura nueva: catalogos reales CheckApp, variante, presentacion venta, servicio sin combinaciones inventadas, precio 0, min/max, descuento, rango invalido, descuento invalido, cross-tenant preservado.

## Protecciones

- `Utilerias.js`: FROZEN, sin modificacion LP-10.
- `_Layout.cshtml`: FROZEN, sin modificacion LP-10.
- `checkapp-ui.js`: FROZEN, sin modificacion LP-10.
- Auth/Login/Firebase/Session/Cookies/Claims: sin modificacion LP-10.
- Schema V2/migraciones/runner: sin modificacion LP-10.
- ProductosServicios funcional: sin modificacion LP-10.
- Legacy: sin modificacion LP-10.

## Dictamen

LP-10 = CERRADO / FILTROS AVANZADOS CHECKAPP CERTIFICADOS / LISTO HANDOFF LP-11

Siguiente paso: REVISION PO - HANDOFF LP-11. NO EJECUTAR LP-11.
