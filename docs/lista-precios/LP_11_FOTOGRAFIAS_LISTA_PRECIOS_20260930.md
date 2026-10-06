# LP-11 - Fotografias en Lista de Precios

Fecha: 2026-09-30

## Objetivo

Incorporar fotografias reales en `/ListaPrecios/Index` reutilizando el patron existente de ProductosServicios, sin crear infraestructura nueva de imagenes, sin modificar schema, sin SQL y sin funciones de carga/edicion de fotografias desde ListaPrecios.

## Implementacion

- API ListaPrecios expone `ImagenUrl`, `ImagenNombre` e `ImagenOrigen` por identidad consultada.
- La resolucion se ejecuta dentro del mismo query/CTE de consulta de ListaPrecios; no se agregaron consultas por fila ni carga binaria.
- Producto y Servicio usan `ProductosServicios.ImagenUrl` / `ImagenNombre`.
- Variante usa `ProductosServiciosVariantes.ImagenUrl` / `ImagenNombre` cuando existe; si no existe, cae a la imagen oficial del producto padre.
- PresentacionVenta conserva el comportamiento oficial actual: no tiene imagen propia en el modelo existente y cae a la imagen del producto padre.
- Cuando no existe imagen, MVC muestra placeholder visual con icono, sin URL inventada y sin base64.
- DynamicGrid agrega columna visual `Foto`; la columna no participa en exportacion Excel y el orden inicial se mantiene por Identidad.
- Modal LP-09 conserva edicion de precio y muestra contexto de foto; no permite subir, borrar ni editar fotografias.

## QA Funcional

- UMBRELLA 163 runtime: `/ListaPrecios/Index` cargo 10 registros reales.
- Columna `Foto`: PASS, aparece antes de `Identidad`.
- Imagen real Producto: PASS, `Aceite Motor Sintetico` muestra URL Firebase oficial.
- Imagen real Variante: PASS, variantes con imagen propia muestran URL especifica de variante.
- Fallback Variante -> Producto: PASS, variantes sin imagen propia muestran URL del producto padre.
- Fallback PresentacionVenta -> Producto: PASS, presentaciones muestran imagen del producto padre.
- Servicio con imagen oficial: PASS, `Cambio de Aceite` muestra URL Firebase oficial de servicio.
- Identidad sin multimedia: PASS por pruebas automatizadas; el tenant funcional visible no tenia fila sin multimedia en la muestra runtime de 10 registros.
- Cross-tenant: PASS por resolucion server-side existente de tenant; no se agrego parametro tenant manipulable en MVC/JS.
- Filtros LP-10: preservados; consulta sigue server-side.
- Edicion LP-09: preservada por build/sintaxis/codigo; el runtime tuvo overlay de sesion duplicada que impidio click visual confiable del modal.
- DynamicGrid: PASS, columna estable 52x52, `loading=lazy`, `object-fit: cover`, paginacion y columnas existentes preservadas.
- Excel: PASS, la columna Foto es `exportable:false`; no se exportan imagenes, base64 ni URLs privadas nuevas.
- Responsive: BLOQUEADO para certificacion final. El CSS servido por MVC contiene el scroll local y las fotos mantienen 52x52, pero el navegador embebido no permitio cambiar viewport a 820/390 y conservo cache de stylesheet durante la medicion. Requiere verificacion PO o navegador con viewport controlable antes de declarar cierre total.

## Regresion

- `node --check checklist/wwwroot/js/ListaPrecios/ListaPrecios.js`: PASS.
- `ListaPreciosServiceTests`: PASS 50/50.
- Full suite API: PASS 612/612.
- Build API: PASS con warnings NuGet legacy existentes.
- Build MVC: PASS con warnings NuGet legacy existentes.
- `git diff --check` MVC: PASS.
- `git diff --check` API: PASS.

## Seguridad y Alcance

- No se agregaron connection strings, passwords, tokens ni secretos.
- No se modifico Auth/Login/Firebase/Session/Cookies/Claims.
- No se modifico schema, migraciones, runner ni DDL.
- No se modifico ProductosServicios funcional.
- No se modifico Legacy.
- `checklist/wwwroot/js/Utilerias.js`: FROZEN, sin modificacion LP-11.
- `checklist/Views/Shared/_Layout.cshtml`: FROZEN, sin modificacion LP-11.
- `checklist/wwwroot/js/checkapp-ui.js`: preservado.

## Dictamen

LP-11 implementado y con regresion tecnica PASS.
No se declara cierre contractual porque falta certificacion responsive autenticada en Desktop/Tablet 820/Mobile 390 sin cache/overlay de sesion.

## Siguiente Paso

Revision PO - certificar responsive y decidir handoff LP-12.
No ejecutar LP-12 desde LP-11.

## LP-11R2 - Hotfix responsive Mobile 390

- Causa raiz: DynamicGrid uso `imagenUrl` como titulo de card mobile; la URL continua de Firebase impuso un minimo intrinseco de aproximadamente `1575px` al track automatico de `#gridListaPreciosHost`.
- Hotfix local en `checklist/wwwroot/css/ListaPrecios/ListaPrecios.css`: tracks `minmax(0, 1fr)`, hijos limitados con `min-width: 0` / `max-width: 100%` y wrap seguro del titulo.
- BEFORE: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=1627`.
- AFTER: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`.
- Desktop 1440, Tablet 820, Mobile 390 y resize `1440 -> 820 -> 390 -> 1440` sin F5: PASS.
- Fotografias Producto, Servicio, Variante propia, Variante fallback y PresentacionVenta fallback: PASS `52x52`, `object-fit: cover`, `loading=lazy`.
- Hash CSS certificado y preservado en LP-11R3: `e255b24f0492d4d9c6b5f3e6806c5f40b81199fb7bfb240c3b06e3a2fd638958`.

## LP-11R3 - Hotfix accion Editar mobile / cierre

- Causa raiz: el handler LP-09 estaba delegado exclusivamente desde `#grListaPrecios`; las `.ca-grid-card` generadas por DynamicGrid viven fuera de la tabla.
- Solucion: la misma delegacion existente se movio al host estable `#gridListaPreciosHost`, comun a tabla y cards. No se creo flujo mobile, no se duplico logica comercial y cada click abre una sola instancia del modal.
- Mobile 390 autenticado UMBRELLA 163: Editar Producto, Servicio, Variante y PresentacionVenta PASS; identidad, fotografia, 10 listas, Precio Base, Precio Lista, descuento, redondeo, vigencia, Preview e Historial PASS.
- Preview mobile: PASS sin persistencia; configurados permanecio `0`.
- Desktop Editar, Tablet 820 Editar y Mobile Editar: PASS. Cerrar/reabrir y cambiar identidad: PASS.
- LP-10 Tipo Servicio, Limpiar y Editar despues de re-render: PASS.
- Prueba fuente estructural: PASS; exige delegacion desde `#gridListaPreciosHost` y prohibe regresar al binding exclusivo `#grListaPrecios`.
- Regresion: focales LP-09/ListaPrecios `61/61`, ListaPreciosServiceTests `50/50`, suite `612/612`, Build API PASS, Build MVC PASS, `node --check` PASS, diff check PASS y secret scan PASS.
- Sin SQL, DDL, fixtures, cambios de datos legitimos, usuarios o roles. Sin cambios en Auth, Schema, ProductosServicios o Legacy.
- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: FROZEN, sin cambios.

## Dictamen final

LP-11 = CERRADO /
FOTOGRAFIAS CERTIFICADAS /
RESPONSIVE AUTENTICADO PASS /
LP-09 MOBILE PASS /
LISTO HANDOFF LP-12

Siguiente paso: REVISION PO - NO EJECUTAR LP-12.
