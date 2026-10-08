# OC-QA05R — Cierre visual final pre-QA Denisse

Fecha: 2026-10-07  
Estado: `QA VISUAL AUTENTICADA PASS / LISTO PARA QA MANUAL DENISSE`  
Alcance: exclusivamente Nueva Orden de Compra; sin schema, migraciones ni funcionalidad nueva.

## Referencia y sesión

- Legacy se auditó físicamente y en modo estrictamente read-only en `https://tarahumara.app/almacen/compras/crear-orden`.
- CheckApp se auditó autenticado en `/Activos/OrdenesCompra/Nueva` contra los servicios locales de QA.
- La sesión duplicada encontrada durante la apertura simultánea se resolvió mediante autenticación normal y no constituyó bloqueo.
- No se persistieron ni documentaron credenciales.

## Paridad física Legacy ↔ CheckApp

- Paso 1, Configuración: PASS. Acomodo, proveedor, folio opcional, fechas, plegable, filtro por proveedor y transiciones equivalentes. El filtro inicia marcado como en Legacy.
- Paso 2, Sucursales: PASS. Multiselección real, chips sin duplicados, retiro y reincorporación de opciones, selección de todas las sucursales, botones y estados.
- Paso 3, Producto/servicio: PASS. Búsqueda real, resultados Producto/Servicio, selección y transición al bloque de captura.
- Paso 4, Captura: PASS. Sucursal individual y todas las sucursales, variante, Presentación de compra cuando aplica, cantidad y costo.
- Paso 5, Partidas/Guardar: PASS. Columnas, sucursal, concepto, cantidad, costo, importe, edición, eliminación, guardado, generación e inmutabilidad posterior.

La corrida autenticada utilizó un producto con variante y un servicio expandido a todas las sucursales. Se verificaron edición y eliminación de renglones, guardado como borrador y generación. La OC de QA fue cancelada al final mediante el flujo oficial con motivo de cleanup; no hubo hard delete ni residuo operativo activo.

## Correcciones acotadas

1. Se redistribuyeron a dos filas los campos de Configuración en escritorio para eliminar compresión y superposición de etiquetas: proveedor/folio y las tres fechas.
2. El checkbox `Solo productos de este proveedor` ahora inicia marcado, conforme al estado inicial observado en Legacy.

No se agregó comportamiento, control, endpoint, campo ni regla de negocio.

## Responsive físico

| Ancho | innerWidth | clientWidth | bodyScrollWidth | Resultado |
|---:|---:|---:|---:|---|
| 1440 | 1440 | 1440 | 1440 | PASS |
| 820 | 820 | 820 | 820 | PASS |
| 390 | 390 | 390 | 390 | PASS |

No existe overflow global. Las tablas operativas conservan scroll local en anchos reducidos.

## Regresión posterior a las correcciones

- Build MVC Release: PASS, 0 errores.
- Sintaxis JavaScript de OrdenesCompra: PASS.
- Focal OC V5 / Recepción V2 / contrato de fuente MVC: `46/46` PASS.
- `diff --check`: PASS en MVC y API.
- OC-QA05 conserva su baseline previo focal `444/444` PASS y full `888/889`, con el único fallo preexistente de ListaPrecios fuera de alcance.

## Gate

- `INVENTOS_DETECTADOS = 0`
- `DIFERENCIAS_NO_AUTORIZADAS = 0`
- `LISTO_PARA_QA_MANUAL_DENISSE = SI`

Esto no constituye aprobación PO ni estado FROZEN.
