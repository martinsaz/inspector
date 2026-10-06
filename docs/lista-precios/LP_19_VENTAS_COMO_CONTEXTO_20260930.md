# LP-19 - Ventas como contexto

Fecha: 2026-09-30

Estado: BLOQUEADO / DEPENDENCIA EXTERNA DOMINIO VENTAS CHECKAPP

## 1. Dictamen

LP-19 es consumidor del dominio Ventas y no tiene autorizacion para crearlo. La auditoria no representa una implementacion fallida: confirma que la dependencia canonica requerida todavia no existe en CheckApp.

`LP-19 = BLOQUEADO / DEPENDENCIA EXTERNA DOMINIO VENTAS CHECKAPP / SIN IMPLEMENTACION / SIN REGRESION SOBRE LP-01..LP-18`

LP-20 no fue ejecutado.

## 2. Evidencia CheckApp

- Tenant auditado read-only: UMBRELLA, empresa 163.
- DatabaseIdentity saneada: `DB_A883C3_CHECKLIST`.
- Objetos SQL inspeccionados: 162.
- Fuente canonica de Ventas: no localizada.
- Fuentes canonicas de tickets, devoluciones, pedidos o documentos de venta: no localizadas.
- API Ventas: no existe.
- Servicio Ventas: no existe.
- Persistencia Ventas: no existe.
- Contrato canonico Ventas: no existe.
- `/Ventas/Nueva` y `/Ventas/Devoluciones`: placeholders MVC, no modulos funcionales.

La inspeccion fisica fue exclusivamente de metadatos SQL. No ejecuto escrituras, DDL, fixtures ni cambios de schema o datos.

## 3. Matriz de fuente

| Dato requerido | Fuente CheckApp certificable | Estado LP-19 |
| --- | --- | --- |
| Cantidad vendida | No disponible | Pendiente |
| Periodo/fecha | No disponible | Pendiente |
| Sucursal | No disponible | Pendiente |
| Producto | No disponible en un documento de venta | Pendiente |
| Variante | No disponible en un documento de venta | Pendiente |
| PresentacionVenta | No disponible en un documento de venta | Pendiente |
| Servicio | No disponible en un documento de venta | Pendiente |
| Devoluciones | No disponible | Pendiente |
| Importe | No disponible | Pendiente |
| Documento/referencia | No disponible | Pendiente |

## 4. Legacy

Legacy contiene `fma`, `detnotas` y `detdev`. Se clasifican exclusivamente como referencia funcional read-only.

Queda prohibido consumirlas desde CheckApp, crear una dependencia runtime, sincronizarlas informalmente o tratarlas como fuente canonica de LP-19.

## 5. Inventario no sustituye Ventas

`InventarioSaldos`, `InventarioMovimientos`, Ordenes de Compra y Recepcion pertenecen a dominios distintos. Una salida de inventario no prueba por si sola una venta y no puede reinterpretarse como cantidad vendida, ticket o devolucion.

LP-13 permanece certificado e intacto. LP-19 no modifica ni extiende Inventario.

## 6. Alcance pendiente

Cuando exista una fuente canonica Ventas CheckApp, LP-19 debera reabrirse para implementar y certificar:

- periodo Desde/Hasta;
- con ventas y sin ventas;
- cantidad vendida;
- contexto por identidad;
- sucursal;
- devoluciones cuando existan;
- detalle cuando la fuente lo soporte;
- filtros server-side;
- responsive desktop 1440, tablet 820 y mobile 390;
- QA runtime autenticada y cross-tenant fail-closed.

Ninguna de estas capacidades se marca como implementada en LP-19D.

## 7. Condiciones de desbloqueo

El dominio Ventas CheckApp debe contar con contrato funcional, persistencia canonica y tenant; relaciones inequivocas con Producto, Variante y PresentacionVenta; tratamiento definido de Servicio; Sucursal, Fecha y Cantidad; devoluciones cuando correspondan; permisos; y API o servicio certificado.

No se crea un numero nuevo de ticket para esta dependencia. El backlog conserva LP-19 y registra solamente la dependencia funcional de Ventas.

## 8. Estado de Lista de Precios

- LP-01..LP-18: CERRADOS.
- LP-19: BLOQUEADO POR DEPENDENCIA EXTERNA.
- LP-09..LP-18: certificaciones preservadas y FROZEN.
- LP-20: NO EJECUTADO.

## 9. Protecciones

- Codigo productivo modificado: 0 archivos.
- SQL/DDL/schema/fixtures: NO.
- Usuarios, roles y datos legitimos modificados: 0.
- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: FROZEN y sin cambios LP-19D.
- Auth/Login/Firebase, Inventario, ProductosServicios, Legacy y placeholders Ventas: sin cambios.
- No se repitio QA completa porque LP-19D es exclusivamente documental.

## 10. Siguiente paso

Revision PO del backlog post LP-19. No ejecutar LP-20 todavia.
