# OC-QA06 — Reconstrucción final experiencia Nueva OC

Fecha: 2026-10-07  
Estado: `PASS / LISTO PARA QA MANUAL DENISSE`  
Alcance: exclusivamente Nueva Orden de Compra; sin cambios de schema, migraciones o módulos ajenos.

## Referencia y ejecución autenticada

- Se abrió Legacy en modo read-only en `https://tarahumara.app/almacen/compras/crear-orden` y CheckApp autenticado en `/Activos/OrdenesCompra/Nueva`.
- La comparación tomó como contrato la experiencia Legacy y la adaptó al patrón visual CheckApp, sin copiar infraestructura ni introducir reglas nuevas.
- La corrida real utilizó dos sucursales, un producto con variante, un servicio y una orden mixta.
- La variante de una sola sucursal se repitió sin guardar: una sucursal seleccionada produjo exactamente un renglón de captura. La selección `todas` incluyó las cinco sucursales disponibles sin duplicados.
- La OC de prueba se guardó, recargó con F5, generó, exportó a PDF y Excel y finalmente se canceló mediante el flujo oficial con motivo de cleanup. No hubo hard delete.

## Resultado por paso

1. Configuración: folio opcional con etiqueta flotante, fechas, plegable, filtro `Solo productos de este proveedor` inicialmente activo y estados equivalentes. Se retiraron botones de navegación redundantes.
2. Sucursales destino: selección múltiple, selección de todas, chips, retiro y reincorporación sin duplicados; cada partida conserva su sucursal explícita.
3. Producto / servicio: búsqueda automática y resultados en tarjetas. Producto expone código, descripción, unidad, costo y variantes existentes; Servicio no inventa variantes ni datos de inventario.
4. Captura: modal por sucursal y variante. Producto ofrece presentación de compra y modos `Manual`, `Pedido inicial`, `Rellenar curva` y `No pedir`, con Curva, Existencia, Tránsito, Hueco y Copete obtenidos del motor oficial read-only. Servicio muestra sólo sucursal, cantidad y costo.
5. Partidas / Guardar: columnas de sucursal, concepto, variante, presentación, cantidad, costo, importe y acciones; edición, eliminación, totales, confirmación, borrador, generación y exportaciones PASS. Se removieron resumen lateral, cronómetro, `OperationId` visible y tarjetas técnicas.

## Integración acotada

- MVC agrega un proxy autenticado y firmado para consumir `POST api/CurvasSugerencias/Preview`; no persiste snapshots ni modifica inventario.
- API acepta en ese preview el mismo contexto proxy HMAC oficial ya usado por MVC, manteniendo validación temporal, firma y aislamiento de tenant.
- No se modificaron contratos V5/V2, `LatestVersion`, providers, Auth, Legacy ni schema.

## Responsive físico

| Ancho | innerWidth | clientWidth | bodyScrollWidth | Resultado |
|---:|---:|---:|---:|---|
| 1440 | 1440 | 1440 | 1440 | PASS |
| 820 | 820 | 820 | 820 | PASS |
| 390 | 390 | 390 | 390 | PASS |

No existe overflow global; la tabla conserva scroll local cuando corresponde.

## Regresión

- Build MVC: PASS, 0 errores; warnings preexistentes del repositorio.
- Build API: PASS, 0 errores; warnings preexistentes del repositorio.
- Sintaxis JavaScript Nueva OC: PASS.
- Focal OC + Recepción + CurvasSugerencias: `84/84` PASS.
- Pruebas de fuente actualizadas al contrato de tarjetas, modal por sucursal/variante y tabla de ocho columnas.
- `git diff --check`: PASS en MVC y API.

## Gate

- `INVENTOS_DETECTADOS = 0`
- `DIFERENCIAS_NO_AUTORIZADAS = 0`
- `LISTO_PARA_QA_MANUAL_DENISSE = SI`

Esto no constituye aprobación PO ni estado FROZEN.
