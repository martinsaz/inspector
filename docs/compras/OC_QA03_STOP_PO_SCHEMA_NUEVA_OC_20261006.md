# OC-QA03 — Hotfix de paridad estricta Nueva Orden de Compra

Fecha: 2026-10-06  
Estado: **STOP PO SCHEMA / SIN IMPLEMENTACIÓN PRODUCTIVA / NO LISTO QA DENISSE**

## Decisión vigente

- OC-QA01: **RECHAZADO / SUPERSEDED**.
- OC-QA02: **RECHAZADO / SUPERSEDED** por QA manual Denisse.
- OC-QA03: alcance vigente.
- La regla “una OC por sucursal” queda revocada para Nueva OC.
- Legacy permanece estrictamente read-only.
- No se implementan Steps 4/5, DDL, migración, contrato API ni adaptación visual que simule multisucursal mientras falte decisión PO de schema.

## Auditoría física Legacy — pasos 1 a 3

Ruta auditada: `https://tarahumara.app/almacen/compras/crear-orden`.

### Paso 1 — Configuración

- Controles visibles: Proveedor, Folio (opcional), Fecha llegada, Fecha mínima, Fecha máxima y panel colapsable de Observaciones/filtro.
- `Solo productos de este proveedor` es funcional: con el proveedor `DISTRIBUIDOR DE CALZADO BAJIO S.A DE C.V` y búsqueda `501`, al desactivarlo se reinició la selección y aparecieron dos artículos (`501 AZUL...` y `501 CAFE...`).
- La fecha máxima pertenece al mismo grid de fechas; no es una tarjeta o paso adicional.

### Paso 2 — Tiendas destino

- El selector es multiselección real.
- UMBRELLA expuso cuatro tiendas reales: `1 · ESTEBAN ALATORRE`, `2 · ALTACIA`, `3 · PLAZA GALERÍAS` y `4 · ESTEBAN ALATORRE FACTURADOR`.
- Al seleccionar una tienda, se agrega un chip y se retira de las opciones disponibles.
- Al quitar el chip, la tienda reaparece en el selector.
- No se observaron duplicados.
- Las selecciones permanecen al continuar hacia producto y al reabrir preparación.

### Paso 3 — Producto y relación con tienda

- El producto se habilita cuando hay proveedor y una o más tiendas destino.
- La búsqueda `501` con filtro de proveedor activo resolvió `501 AZUL MEZCLILLA LEVIS`, con estilo, color, acabado, marca, sublínea, clasificación, temporada y tallas.
- Legacy conserva `Tienda del renglón` y el estado `Todas las tiendas`.
- La captura de tallas muestra una sección independiente por cada tienda seleccionada y declara: `Captura independiente para 3 tienda(s)` / `La captura se repetirá en 3 tienda(s) seleccionada(s)`.
- La tabla final tiene columna `Tienda`.
- El modelo Legacy confirma `PedidoProveedorDetalleInputDto.IdTienda` por renglón y la llave de partida incluye tienda + barcode + talla + costo.

## Bloqueo estructural CheckApp V4

El modelo actual no puede representar el comportamiento auditado sin perder información:

1. `dbo.OrdenesCompra.idSucursal` es `UNIQUEIDENTIFIER NOT NULL`: una sola sucursal por cabecera.
2. `dbo.OrdenesCompraDetalle` no contiene `idSucursal`.
3. `OrdenCompraGuardarRequest` expone un solo `IdSucursal`.
4. `OrdenCompraPartidaGuardarRequest` no expone sucursal.
5. Guardado, listado y detalle leen/escriben la sucursal de cabecera.
6. Recepción valida `oc.idSucursal = @IdSucursal` y los movimientos de Inventario V1 heredan esa sucursal.

Por lo tanto, una UI multiselect sobre V4 sería un invento: solo podría descartar destinos, atribuir todas las partidas a una sucursal o generar varias OCs. Las tres salidas contradicen OC-QA03; la tercera, además, está expresamente revocada.

## Decisión PO de schema requerida

Antes de programar se debe aprobar un contrato V5 que defina, como mínimo:

- la relación entre una orden y sus sucursales destino;
- `idSucursal` obligatorio por partida y su FK tenant-safe;
- la compatibilidad/backfill de OCs V1–V4;
- el destino de `OrdenesCompra.idSucursal` singular (retiro, nulabilidad o semántica explícita, sin inventar “principal”);
- unicidad de partida incorporando sucursal donde corresponda;
- edición/F5/detalle/PDF/Excel por sucursal;
- Recepción por sucursal/partida y su idempotencia;
- movimientos de Inventario V1 usando la sucursal de cada partida;
- estrategia de migración, gate, rollback técnico y pruebas cross-tenant.

No se propone ni registra package de migración en OC-QA03. La forma final depende de decisión PO.

## Alcance preservado

- MVC productivo: sin cambios OC-QA03.
- API productiva: sin cambios OC-QA03.
- Schema/DDL/migraciones/datos: sin cambios OC-QA03.
- Steps 4/5: no iniciados.
- ListaPrecios, Curvas, Siembra, Huecos/Copetes, Recepción UI, Reporte OC, ProductosServicios funcional, Auth, Login, Firebase y Session: intactos.
- Legacy Raramuri/sazapi: lectura únicamente.
- Datos QA creados: 0.
- Cleanup requerido: no aplica.

## Gate de salida

OC-QA03 no puede declararse `LISTO PARA QA MANUAL DENISSE` hasta que el PO autorice el contrato de persistencia multisucursal y se implemente/certifique la migración correspondiente. El siguiente paso es exclusivamente **DECISIÓN PO SCHEMA**.
