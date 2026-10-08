# OC-QA03S4 — STOP PO ejecución CHECKAPPERP OC V5 + Recepción V2

Fecha: 2026-10-07  
Ámbito autorizado: exclusivamente CHECKAPPERP, OC V4→V5 y, sólo después de certificar V5, Recepción V1→V2.  
Dictamen: `STOP_PO`.

## Resultado ejecutivo

El precheck obligatorio coincidió exactamente. El runner oficial inició únicamente `OC-M20261006-V4-V5-MULTISUCURSAL-PARTIDA`, pero SQL Server rechazó el DDL aprobado con `Invalid column name 'idSucursal'`. La migración estaba dentro de la transacción oficial y se revirtió completamente. Por la regla de corte del ticket, Recepción V2 no se ejecutó.

CHECKAPPERP permanece íntegro en OC V4 y Recepción V1, ambos con hash exacto y `SchemaOk/0`. No existe historial V5 PASS, no quedaron objetos parciales y no cambió ningún dato de negocio.

## Precheck

- DatabaseIdentity: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`.
- OC: V4 / `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`.
- Recepción: V1 / `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`.
- Drift: OC `SchemaOk/0`; Recepción `SchemaOk/0`.
- Datos: 0 OC, 0 detalles, 0 recepciones, 0 partidas, 0 series y 0 movimientos.
- Package OC: target `4e88ac49a73e3169903a6399a5b8c4fa2ea4c9b747005082ecc086636cb8462a`; SQL hash `8edb374fabba1229bfb558276d1eccdaad0043fa6b2ed4ed468f87c7a3cf97cf`.
- Package Recepción: target `44629d5055411a5a12e2acddfa108538a6f40295d339b45cead45ea39f62de40`; SQL hash `84d55d162bbb2dc53a7e6e686d3610329d2b596e6e6b2f41b259e086cf4321e6`.
- La autorización se aplicó sólo en memoria; flags/providers del repositorio no cambiaron.

## Falla OC V5

- MigrationId: `OC-M20261006-V4-V5-MULTISUCURSAL-PARTIDA`.
- Ejecutor: `SchemaMigrationRunner` con package oficial completo y activación PO efímera.
- Resultado del intento: `FAIL / MIGRATION_FAILED`.
- Error sanitizado registrado por el runner: `Invalid column name 'idSucursal'.`
- Causa técnica: el mismo batch agrega `dbo.OrdenesCompraDetalle.idSucursal` y después la referencia estáticamente en sentencias `UPDATE`, validaciones, constraints e índices. SQL Server compila esas referencias antes de que la columna agregada esté disponible para el batch.
- No se alteró el DDL ni se aplicó una corrección improvisada.

## Certificación de rollback

- OC posterior: V4 / hash exacto `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`.
- Drift OC posterior: `SchemaOk/0` (4 tablas, 79 columnas, 17 índices, 6 FKs y 20 checks).
- Historial V5 PASS: 0.
- `OrdenesCompraSucursales`: ausente.
- `OrdenesCompraDetalle.idSucursal`: ausente.
- `OrdenesCompra.idSucursal`: continúa NOT NULL conforme a V4.
- Intento: cerrado en `FAIL`; no existe estado activo o incierto.
- Datos OC/detalles: 0/0, sin cambios.

## Recepción

- V2 ejecutada: NO.
- Motivo: OC V5 no certificó PASS; el ticket obliga detener antes de Recepción V2.
- Estado preservado: V1 / hash exacto `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`.
- Drift: `SchemaOk/0`.
- Datos: 0 recepciones, 0 partidas, 0 series y 0 movimientos.

## UMBRELLA

No se consultó ni modificó. Se preserva evidencia vigente: OC V4, Recepción V1, drift 0 y READY individual.

## Regresión

- OC V5 contracts, Recepción V2 contracts, Inventario, migration engine, OrdenesCompra y Recepción: 103/103 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- Las pruebas contractuales locales no detectan el error de compilación real del batch SQL; se requiere corregir y probar el package antes de una nueva autorización de ejecución.
- Advertencias NuGet preexistentes quedan fuera del alcance.

## Controles

- DDL persistente: 0. El único intento fue OC V4→V5 oficial y quedó revertido completamente.
- Recepción V1→V2: no iniciada.
- DML de negocio: 0.
- Datos modificados: 0.
- Secretos persistidos: 0.
- UI, runtime, providers, Curvas, Siembra, Huecos/Copetes, ListaPrecios, ProductosServicios, Auth y Legacy: sin cambios.

## Bloqueo y siguiente paso

Bloqueo real: package OC V5 no ejecutable en SQL Server por referencia estática a la columna nueva `OrdenesCompraDetalle.idSucursal` dentro del mismo batch. Requiere nueva autorización PO para corregir el DDL aprobado, recalcular/validar su SQL hash, agregar cobertura SQL real y repetir OC V5 antes de considerar Recepción V2.

Siguiente paso: revisión PO Denisse. No reintentar V5, no ejecutar Recepción V2, no modificar UI ni continuar QA Denisse.
