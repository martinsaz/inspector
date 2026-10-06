# LP-QA04R — Modal Editar Precios y sucursales

Fecha: 2026-10-02
Estado: IMPLEMENTADO / QA TÉCNICA PASS / PENDIENTE QA MANUAL DENISSE
No constituye aprobación PO ni FROZEN definitivo.

## Decisiones PO aplicadas

- `ProductosServicios.Descripcion` se consulta desde la fuente canónica y se presenta como texto read-only. El contenido con marcado se normaliza a texto legible; no existe escritura desde ListaPrecios.
- Web, Observaciones, Corrida manual, Liverpool y Mercado Libre están excluidos.
- Promociones 2x1, 3x2, descuento en segundo artículo y monedero no se muestran. Permanecen pendientes de un contrato funcional independiente.
- No se agregó schema, migración ni extensión promocional a LP-08.

## Implementación

- El clipping del selector de sucursales se corrigió con overrides locales de `ListaPrecios.css`; los estilos globales permanecen intactos.
- El dropdown presenta cinco sucursales reales, checks, selección única/múltiple, estado Todas y scroll interno sin overflow del body.
- El editor usa composición compacta: foto cuadrada con `object-fit: contain`, chips deduplicados con datos reales, matriz de Lista 1 a Lista 10, redondeo, alcance, vigencia, motivo y footer Cancelar/Guardar.
- Preview e historial permanecen disponibles como bloque secundario colapsable.
- La matriz mantiene ausencia y cero como `0.00` en la UI, pero conserva `data-has-config` y payload nullable para diferenciarlos internamente. Guardar inicia deshabilitado, no-op no persiste y sólo filas dirty entran al payload.
- En móvil se fuerza únicamente dentro del editor la tabla real con scroll horizontal; no se oculta por la regla responsive general de DynamicGrid.

## Evidencia runtime UMBRELLA 163

- P1, P5 y P10 abrieron la fila correspondiente de una matriz de diez listas.
- No-op: 0 filas dirty y Guardar deshabilitado.
- Edición local de P1: sólo la fila 1 quedó dirty y Guardar se habilitó. Se canceló; al reabrir, el valor original `0.00` permaneció y no hubo persistencia.
- La descripción se mostró sin etiquetas HTML, read-only, y no se exhibieron nombres técnicos de archivo ni campos excluidos.
- 1440: modal 760 px, cuerpo con scroll interno, footer visible y foto 88 × 88.
- 820: modal 760 px dentro del viewport, cuerpo con scroll interno y footer visible.
- 390: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`; foto 64 × 64, 10 filas visibles en DOM, matriz con scroll horizontal y footer usable.
- Dropdown 390: 5 checks, panel con scroll interno (`scrollHeight 206 > clientHeight 167`) y body sin overflow.
- Consola: 0 errores y 0 warnings durante la certificación.
- Datos legítimos modificados: 0. Fixtures activos: 0.

## Regresión

- Contrato Node LP-QA04R: PASS.
- Scripts Node ListaPrecios: 4/4 PASS; `node --check` PASS.
- Focales ListaPrecios: 183/183 PASS.
- Full suite: 781/781 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- Diff check y secret scan: PASS.

## Protecciones

- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: sin cambios, hashes preservados.
- Schema/migraciones, Auth/Login/Firebase/Session, Legacy Rarámuri, sazapi, Cotizaciones, Inventario y ProductosServicios funcional: sin cambios.

## Pendiente

QA manual Denisse. No declarar aprobado PO ni FROZEN definitivo.
