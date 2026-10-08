# OC-QA02 — Reconstrucción estricta de Nueva Orden de Compra

Fecha: 2026-10-06  
Estado: **IMPLEMENTADO / QA TÉCNICA Y RUNTIME COMPARATIVA PASS / PENDIENTE QA MANUAL DENISSE**  
No aprobado PO. No FROZEN.

## Decisión y alcance

OC-QA01 queda **RECHAZADO / SUPERSEDED**. La causa fue paridad de elementos sin paridad de experiencia: navegación por paneles separados, pasos/contexto previo ocultos y ausencia de controles/semántica Legacy. OC-QA02 sustituye esa composición por una única pantalla progresiva y continua, preservando Patrón CheckApp V1 y únicamente las adaptaciones PO autorizadas.

Legacy se auditó físicamente en `https://tarahumara.app/almacen/compras/crear-orden` y por código en `Raramuri.blzr`/`sazapi`, siempre read-only. No se modificaron Legacy, ListaPrecios, Catálogo Curvas, Siembra, Huecos/Copetes, Recepción ni Reporte OC.

## Matriz comparativa

| Paso | Elemento/experiencia Legacy | Aparición y habilitación | Resultado CheckApp | Diferencia |
|---|---|---|---|---|
| 1 | Proveedor, folio opcional, llegada/mínima/máxima, observaciones/filtros plegables, observaciones, filtro por proveedor | Visible desde inicio; habilita destino al completar configuración | Misma preparación visible; fecha de orden interna; fechas hoy/hoy/+7; folio personal separado del automático; filtro real | Autorizada: entidades CheckApp |
| 2 | Tienda destino y representación persistente al avanzar | Visible bloqueado; seleccionable tras configuración; conserva selección | Una sucursal por OC; razón social resuelta internamente; selección visible y luego resumida/editable | Autorizada: una OC por sucursal |
| 3 | Búsqueda, resultados y selección de artículo | Visible bloqueado; habilita tras preparación; conserva pasos 1/2 | Búsqueda Producto/Servicio con tipo, resultados reales y selección | Autorizada: Producto + Servicio |
| 4 | Captura equivalente a talla/corrida, cantidad y costo | Visible bloqueado; habilita con concepto | Variante y PresentacionCompra cuando aplican; Servicio no exige ninguna; cantidad/costo/unidad/factor | Autorizada: dominio CheckApp |
| 5 | Renglones, totales, búsqueda, edición, retiro, guardado y estado posterior | Visible desde inicio; acciones se habilitan progresivamente | Grid continuo, totales de unidades base/importe/renglones, edición inline, baja de renglón, borrador/generación/cancelación y exportaciones existentes | Ninguna no autorizada |

Todos los bloques permanecen en el DOM y visibles. Los dependientes se muestran bloqueados/deshabilitados; al avanzar no se reemplaza la pantalla. La preparación puede plegarse al completarse y volver a editarse sin perder datos.

## Configuración y contratos

- `FolioReferencia` es el folio personal opcional Legacy; no sustituye el `Folio` automático CheckApp.
- OrdenesCompra V4 agrega sólo `dbo.OrdenesCompra.FolioReferencia NVARCHAR(100) NULL`.
- Migración oficial: `OC-M20261006-V3-V4-FOLIO-REFERENCIA`.
- Manifest V4: `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`.
- UMBRELLA 163 migró mediante `SchemaMigrationRunner`; contrato físico V4 validado sin discrepancias.
- Fecha de orden se conserva interna y automática; no aparece como captura.
- Fechas Legacy reproducidas en 2026-10-06: llegada `2026-10-06`, mínima `2026-10-06`, máxima `2026-10-13`.
- El checkbox `Solo productos de este proveedor` agrega filtro server-side por proveedor usando relaciones históricas reales de OC; no es decorativo.
- La razón social proviene de la sucursal seleccionada y no se presenta como decisión del usuario.

## SHIP

La auditoría física, DOM y código Legacy no encontró un control, texto o estado persistente denominado `SHIP`. El comportamiento observable es la tienda destino seleccionada y asociada a la captura/renglón. Su equivalente funcional autorizado en CheckApp es la **Sucursal destino** única, preservada en preparación y orden. No se inventó un estado, campo, card ni endpoint SHIP.

## Runtime UMBRELLA

- Datos reales disponibles: Producto `001 Aceite Motor Sintetico` y Servicio `002 Cambio de Aceite`.
- Producto con Variante `946 ml`: PASS.
- Servicio sin Variante/PresentacionCompra obligatoria: PASS.
- OC mixta: PASS, 2 renglones, 2 unidades base, total `$699.00`.
- Folio personal `QA02-CLEANUP`: guardado y round-trip F5 PASS.
- Borrador: PASS.
- Generación: PASS.
- Estado posterior read-only/exportable: PASS.
- Cleanup oficial: cancelación con motivo `Cleanup OC-QA02`; no hubo hard delete.
- PresentacionCompra: no ejecutable por ausencia de una presentación real en los datos disponibles; se validó contrato/código sin fabricar fixture.
- Artículo 501 LEVIS se usó exclusivamente para recorrer/comparar Legacy; CheckApp usó sus datos reales.

## Responsive

| Viewport CSS | Cinco etapas | Bloqueos | Overflow horizontal |
|---|---:|---:|---:|
| 1440 | PASS | PASS | 0 |
| 820 | PASS | PASS | 0 |
| 390 | PASS | PASS | 0 |

## Regresión

- Focal OC/schema/migraciones: `56/56` PASS.
- Suite global: `853/854` PASS.
- Único fallo: `ListaPreciosMatrixSqlIntegrationTests.ConsultaMatricialReal_MaterializaTodasLasIdentidadesYDiezNiveles`, preexistente, fuera de alcance y no bloqueante para BL-03/OC-QA02 por decisión PO.
- Builds MVC/API: PASS, 0 errores.
- `node --check OrdenesCompra.js`: PASS.

## Inventos retirados

- revisión independiente;
- barra/porcentaje de avance;
- panel lateral de resumen;
- razón social como paso visible;
- fecha de orden como captura visible;
- navegación que oculta los pasos anteriores.

Inventos detectados en el resultado OC-QA02: **0**.

## Diferencias autorizadas exactas

1. Producto y Servicio.
2. OC mixta Producto/Servicio.
3. Variante.
4. PresentacionCompra.
5. Una OC por sucursal.
6. Razón social sólo como contexto interno auto-resuelto.
7. Folio automático CheckApp coexistiendo con folio personal/opcional Legacy.
8. Patrón visual CheckApp V1, permisos, tenant, schema/versionado, notificaciones y responsive.

Diferencias no autorizadas: **0**.

## Dictamen

Técnico: 100%.  
Runtime comparativo: 100% de los casos ejecutables con datos reales.  
QA Denisse: 0%.  
Avance real: **listo para QA manual Denisse**, sin declarar aprobación PO ni FROZEN.
