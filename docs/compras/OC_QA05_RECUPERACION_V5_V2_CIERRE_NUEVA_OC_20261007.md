# OC-QA05 — Recuperación V5/V2 y cierre técnico de Nueva OC

Fecha: 2026-10-07

## Resultado

La corrección contractual, SQL real, migración de CHECKAPPERP/UMBRELLA, activación runtime y flujo funcional API multisucursal quedaron certificados. El gate final permanece **NO LISTO PARA QA DENISSE** únicamente porque la sesión autenticada de CheckApp expiró al reiniciar el MVC y `/Activos/OrdenesCompra/Nueva` redirige a Login; no se inventaron credenciales ni se agregó un bypass. La inspección física final de chips/controles y responsive `1440/820/390` debe repetirse tras login normal.

## Contrato y SQL

- OC V5 manifest: `4e88ac49a73e3169903a6399a5b8c4fa2ea4c9b747005082ecc086636cb8462a` → `843193ced8cccf043953c4b81eec7991a1cce65a666d58321385c637075b9b8d`; SQL hash permanece `19fbdeb7de4af7b77b893c36491e455e94c1d446d4d27aba76e0ae844686d71d`.
- Recepción V2 manifest: `44629d5055411a5a12e2acddfa108538a6f40295d339b45cead45ea39f62de40` → `24f73a6f4512b26e8f41f02e1aa9faabe36a624fda475ee8df630ae835663803`; SQL hash permanece `a0d0d9b43afaaf946f542d038b933e7de864bd158e9b23aeb537f7ccb5ca742a`.
- Se retiraron de `Indexes` tres duplicaciones OC y dos de Recepción; las cinco permanecen como `UNIQUE CONSTRAINT` físicas.
- SQL Server temporal: OC V4→V5 y Recepción V1→V2 PASS por runner productivo, `SchemaDriftValidator` `SchemaOk/0`, gate `COMPATIBLE`, segundo run no-op, partial reject, drift inducido detectado, backfill y objetos exactos; base temporal eliminada.
- CHECKAPPERP: OC V5 reconciliado por migración oficial de metadata `OC-M20261007-V5-RECONCILE-CONTRACT-INDEX-METADATA`; Recepción V2 ejecutada; ambos `SchemaOk/0`, `COMPATIBLE`, no-op, datos negocio 0.
- UMBRELLA BEFORE: OC V4/Recepción V1, 47 OC, 96 detalles, estados `17/19/11/0/0`, ordenado/recibido/pendiente `152/0/152`, subtotal/total `48745.01`, huérfanos/cross-tenant/incompatibilidades 0, fingerprint `033cc87f2d9bbb237075a8e354db61968534161eb34c45203d91c69c0706259a`.
- UMBRELLA AFTER: 47 destinos y 96 detalles poblados; Recepción backfill 0; V5/V2 `SchemaOk/0`, `COMPATIBLE`, fingerprint comercial idéntico.

## Runtime y Nueva OC

- Providers, packages, `LatestVersion` y `KnownSchemaVersion` activados en OC V5/Recepción V2.
- Autoridad V5: `OrdenesCompraSucursales` + `OrdenesCompraDetalle.idSucursal`; cabecera `OrdenesCompra.idSucursal` se persiste `NULL`.
- Nueva OC conserva cinco pasos visibles; Paso 1 y 2 permanecen continuos y el contexto anterior se resume sin razón social visible.
- Selector multisucursal: seleccionar agrega chip y elimina opción; seleccionar todas agota el combo; quitar reincorpora; sin duplicados; captura por sucursal o todas.
- Paso 5 muestra sucursal, concepto, variante, presentación, cantidad, costo e importe; sin KPI, preview, historial, resumen lateral ni barra de progreso.
- Hotfix runtime real: se eliminó la referencia inventada a `Sucursales.Codigo`, inexistente en UMBRELLA; se usa código vacío compatible. La primera transacción fallida revirtió íntegramente.

## QA funcional real y cleanup

UMBRELLA generó de forma reversible `OC-000054`: tres destinos, producto expandido a todas las sucursales, servicio individual, OC mixta, variante real, edición/eliminación, recarga de detalle, generación a estado 2, rechazo de edición posterior, PDF y Excel. La presentación de compra quedó `N/A_DATA` porque ninguno de los dos conceptos activos la ofrece. El filtro proveedor ON/OFF devolvió `2/2`, por lo que el dataset no permite demostrar diferencia. Cleanup oficial por cancelación dejó estado 3; no hubo hard delete.

## Regresión

- Focal OC/Recepción/Inventario/ProductosServicios/migration/drift: `444/444` PASS.
- Full suite: `888/889` PASS; único fallo `ListaPreciosMatrixSqlIntegrationTests...`, preexistente, congelado y no bloqueante.
- Build API y MVC: PASS, 0 errores; `node --check`, `diff --check` y secret scan de adiciones: PASS.
- Legacy se revalidó físicamente read-only en la pantalla oficial: cinco pasos, configuración, multiselección de tiendas, tienda por renglón/todas, tallas y tabla/guardado.
- Bloqueo restante: CheckApp local no tiene sesión reutilizable y muestra Login; faltan la comparación física CheckApp paso 1→5 y responsive exacto `1440/820/390` después de login normal.

No se modificaron ListaPrecios, Recepción UI ni Legacy. Curvas/Siembra no forman parte de este ticket.
