# LP-QA05 — Paridad estricta Editar Precios

Fecha de ejecución: 2026-10-05
Estado: CORRECCIONES UX IMPLEMENTADAS / STOP PO SCHEMA / PENDIENTE AUTORIZACIÓN

## Alcance aplicado

- Se retiraron del flujo visible de Editar Precios: Preview, Historial, Calcular precios finales y Vigencia de la lista seleccionada.
- Se conserva una sola matriz de 10 listas con las columnas Lista, Precio, Descuento % y Precio final.
- El cálculo es inmediato al modificar Precio, Descuento % o Precio final.
- Se implementó el redondeo Legacy Sin redondeo, A 4/9 y Sólo a 9, con alcance Sólo la lista editada o Todas las listas y acción explícita Aplicar redondeo a todas.
- El texto visible es: `El redondeo ajusta el precio final y recalcula el descuento correspondiente. No modifica el precio base.`
- Guardar continúa enviando únicamente filas modificadas; abrir y cerrar no genera persistencia.

## Auditoría Legacy

La referencia fue `Raramuri.blzr/Components/Pages/ProductosListaPrecios.razor`, sus modelos/servicios y los contratos de productos de sazapi.

- Descripción: `dbo.articulo.descri`; se lee y edita en Legacy.
- Web: `dbo.ArticuloExt.Web varchar(250) NULL`.
- Liverpool, Mercado Libre y Observaciones: columnas nullable de `dbo.ArticuloExt`.
- Corrida manual: `dbo.articulo.ubica`; quedó expresamente fuera de LP-QA05.
- Promociones Legacy: `dbo.articulo.dosporuno`, `trespordos`, `descuentosegundo` y `monedero`.
- La búsqueda focalizada no encontró un consumidor transaccional de ventas para estas cuatro banderas fuera de Lista de Precios/Excel; no se inventó un motor de promociones.

## Límite de persistencia y decisión PO

CheckApp sí dispone de `ProductosServicios.Descripcion`, pero escribirla desde Lista de Precios ampliaría el contrato funcional de otro dominio. Web, Liverpool, Mercado Libre y Observaciones no tienen persistencia equivalente en el contrato LP actual. La entidad `ListaPreciosPromociones` existente tiene semántica por identidad/lista y sólo tres tipos; no equivale a las cuatro banderas globales de artículo de Legacy.

Por ello, Datos adicionales y Promociones se muestran como bloques reales, cargados cuando existe dato disponible y deshabilitados con estado explícito pendiente de autorización. No se ejecutó DDL ni se expusieron controles con persistencia ficticia.

Decisiones PO requeridas:

1. Autorizar o rechazar la escritura de Descripción sobre el campo canónico de ProductosServicios desde este modal.
2. Definir persistencia para Web, Liverpool, Mercado Libre y Observaciones: extensión de contrato existente o tabla LP por identidad vendible.
3. Definir si Promociones conserva semántica global de artículo Legacy o adopta alcance por identidad/lista; incluir Monedero y precisar consumidor transaccional.
4. Después de la decisión, autorizar explícitamente el contrato/schema, permisos, auditoría y migración. Este documento no contiene DDL.

## QA visual y funcional

- Login QA autenticado, empresa 163 / UMBRELLA; credencial no persistida.
- Aperturas P1, P5 y P10: PASS; la lista correspondiente queda enfocada y las 10 listas permanecen visibles.
- Cálculo inmediato: Precio 100.00 y Descuento 10.00 producen Precio final 90.00.
- A 4/9: 94.00; Sólo a 9: 99.00; Precio 0: final 0.00 y descuento 0.00.
- Texto, botón, orden de columnas, bloques y controles deshabilitados: PASS.
- Elementos retirados no visibles: PASS.
- Guardado no fue ejecutado durante QA visual; datos legítimos modificados: 0.
- Consola: 0 errores y 0 advertencias durante el recorrido.
- Responsive 1440: PASS, `bodyScrollWidth=1440`.
- Responsive 820: PASS, `bodyScrollWidth=820`.
- Responsive 390: PASS, `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`; modal 384 px dentro del viewport.

## Regresión

- Focales ListaPrecios: 189/189 PASS.
- LP-QA05 específicos: 6/6 PASS.
- Full suite: 787/787 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check`: PASS.
- `git diff --check`: PASS.
- Secret scan focalizado: PASS.

Las advertencias NU1701/NU1902 de paquetes preexistentes continúan visibles en build; no fueron introducidas por LP-QA05.

## Protecciones

- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: sin cambios LP-QA05.
- Sin cambios de Schema, Auth/Login/Firebase/Session, Cotizaciones, Inventario funcional, ProductosServicios funcional ni Legacy.
- Fixtures QA activos: 0. Datos legítimos modificados: 0.

## Dictamen

CORRECCIONES UX IMPLEMENTADAS / STOP PO SCHEMA / PENDIENTE AUTORIZACIÓN.

No constituye aprobación PO ni FROZEN definitivo.
