# OC-QA03S3 — Actualización controlada CHECKAPPERP OC V2→V3→V4

Fecha: 2026-10-07  
Ámbito autorizado: exclusivamente `CHECKAPPERP`, OrdenesCompra V2→V3→V4 mediante el runner oficial.  
Dictamen: `CHECKAPPERP_V4_CERTIFIED`.

## Resultado ejecutivo

CHECKAPPERP quedó certificado en OrdenesCompra V4, con el manifest exacto, `SchemaOk`, drift 0 y gate compatible. Las migraciones oficiales V2→V3 y V3→V4 aparecen una vez cada una en el historial y una nueva resolución devuelve `NO_PENDING_MIGRATIONS`. No se ejecutó OC V5 ni Recepción V2, no se consultó ni modificó UMBRELLA y no se modificaron UI, runtime, providers o datos de negocio.

La conexión QA autorizada recuperada en OC-QA03S2R se cargó sólo en memoria. No se imprimieron ni persistieron secretos.

## CHECKAPPERP BEFORE

- DatabaseIdentity: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`.
- OrdenesCompra: V2, hash `0977353cc806ec35d21c95c4149e16cdf41b3480d52b929b13ec82185957e802`.
- Drift OC: `SchemaOk / 0`.
- Datos OC: 0 órdenes y 0 detalles.
- Recepción: V1, hash `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`.

Todas las precondiciones coincidieron exactamente antes de ejecutar DDL.

## Migración V2→V3

- MigrationId: `OC-M20261006-V2-V3-RANGO-FECHAS`.
- Ejecutor: `SchemaMigrationRunner` oficial; no se utilizó SQL manual.
- Resultado: `MIGRATED/PASS/V3`.
- Versión AFTER: 3.
- Hash AFTER: `f301f05fb2928d941d2cd7bf1d312da78629db4002ab1e4ab06225464ab2ffc1`.
- Drift: `SchemaOk / 0`; contrato detectado: 4 tablas, 78 columnas, 17 índices, 6 FKs y 20 checks.
- Gate: `COMPATIBLE`.
- Datos legítimos modificados: 0; 0 órdenes y 0 detalles.
- Resolución posterior: únicamente `OC-M20261006-V3-V4-FOLIO-REFERENCIA` pendiente.

## Migración V3→V4

El primer intento de resolución del segundo salto usó un wrapper temporal que presentaba al runner sólo el paso V3→V4 y omitía el antecedente V2→V3 del package. El runner oficial lo rechazó con `HISTORIAL_INCONSISTENTE` antes de ejecutar DDL. Se detuvo el intento y se revalidó por lectura que V3 seguía exacto, sin drift, intento activo, estado parcial ni cambio de datos. Después se ejecutó el provider oficial completo, que resolvió exclusivamente el salto V3→V4.

- MigrationId: `OC-M20261006-V3-V4-FOLIO-REFERENCIA`.
- Ejecutor: `SchemaMigrationRunner` con el package/provider oficial completo; no se utilizó SQL manual.
- Resultado: `MIGRATED/PASS/V4`.
- Versión AFTER: 4.
- Hash AFTER: `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`.
- Drift: `SchemaOk / 0`; contrato detectado: 4 tablas, 79 columnas, 17 índices, 6 FKs y 20 checks.
- Gate: `COMPATIBLE`.
- `FolioReferencia`: presente.
- Datos legítimos modificados: 0; 0 órdenes y 0 detalles.

## Idempotencia y estado final

- Historial V2→V3: 1 ejecución.
- Historial V3→V4: 1 ejecución.
- Segunda resolución oficial en V4: `NO_PENDING_MIGRATIONS`.
- Pendientes V2→V3: 0.
- Pendientes V3→V4: 0.
- Intentos activos/estado parcial: 0.
- Una certificación independiente posterior reprodujo V4 exacto, drift 0, gate compatible y datos 0.

## Recepción

- Versión/hash final: V1 / `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`.
- Drift: `SchemaOk / 0`.
- Contrato detectado: 4 tablas, 57 columnas, 16 índices, 13 FKs y 7 checks.
- Datos: 0 recepciones, 0 partidas, 0 series y 0 movimientos.
- Recepción V2 ejecutada: NO.

## Preflight read-only OC V5

- Package: `OC-M20261006-V4-V5-MULTISUCURSAL-PARTIDA`.
- Source: `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`.
- Target: `4e88ac49a73e3169903a6399a5b8c4fa2ea4c9b747005082ecc086636cb8462a`.
- Incompatibilidades: 0.
- Backfill esperado: 0 destinos / 0 detalles.
- Dry-run: `PASS_READ_ONLY`.
- Protección: `ApprovedForExecution=false`, `AutoApplicable=false`.
- Recepción V1 continúa siendo source válido futuro para V2 condicionado a OC V5.
- V5 ejecutado: NO.

## UMBRELLA

No se consultó ni modificó. Se preserva la evidencia vigente de OC-QA03S2: OC V4, Recepción V1, drift 0 y `READY` individual.

## Regresión

- Contrato OC, motor de migraciones, OrdenesCompra, Recepción, Inventario y propuestas protegidas V5/V2: 103/103 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- Advertencias NuGet existentes de compatibilidad/vulnerabilidades no alteran este dictamen y no fueron corregidas por estar fuera de alcance.
- `git diff --check`: PASS.
- Secret scan acotado a cambios: PASS; secretos persistidos 0.

## Controles de cambio

- DDL ejecutado: únicamente las migraciones oficiales `OC-M20261006-V2-V3-RANGO-FECHAS` y `OC-M20261006-V3-V4-FOLIO-REFERENCIA`.
- DML de negocio: 0. El runner sólo registró sus estados, intentos e historial técnicos esperados.
- Datos legítimos modificados: 0.
- ListaPrecios, Legacy, Curvas, Siembra, UI, runtime y providers: sin cambios por este ticket.
- UMBRELLA: sin consulta y sin cambios.
- Secretos persistidos: 0.

## Siguiente paso

Revisión PO Denisse. No ejecutar OC V5, Recepción V2, cambios de UI ni QA manual hasta nueva autorización.
