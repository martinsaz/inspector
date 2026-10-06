# LP-QA05S2/LP-QA05S3 — Certificación SQL ProductosServicios V3

Fecha: 2026-10-05  
Estado: **SQL REAL CERTIFICADO / RUNTIME V3 ACTIVADO / PERSISTENCIA UI NO INTEGRADA**

## Artefacto final

- Scope: `ProductosServicios`.
- MigrationId: `PS-M20261005-V2-V3-IDENTIDAD-COMERCIAL`.
- Fuente: V2, hash `1b5c75e4b44fcfcb3af4219660095ddb2a99419db8da300aff6e4a38c731a705`.
- Target: V3, hash `0ce8a1e391f89577ce20a0e29f5a048b48109a93951346a395b5618073b794e5`.
- Hash sustituido: `086c8e7fe0aced219dda9e3937ac0ddc2299c27b202ec2827c5eeda3916b732d` (`SUPERSEDED`).
- Transacción: `SingleTransaction`.
- DML, backfill y DROP: 0.

## Hotfix LP-QA05S3

El intento LP-QA05S2 falló con `Incorrect syntax near '2'` porque el package contenía etiquetas de revisión en la colección de precondiciones que el executor interpreta como SQL. La transacción revirtió y CHECKAPPERP permaneció en V2 sin objetos V3. El intento fallido se preservó en `CheckAppSchemaAttempts`.

La corrección:

- usa precondiciones SQL ejecutables para confirmar estado V2/hash fuente, tablas base y ausencia de objetos V3;
- conserva las etiquetas semánticas en el contrato de revisión, separadas del SQL ejecutable;
- usa índices filtrados independientes para Producto, Servicio, Variante y Presentación;
- conserva el mismo MigrationId y declara el hash original como sustituido.

## Certificación aislada

Antes del reintento real se creó una base temporal, se aprovisionó V2 con la infraestructura oficial y se ejecutó el package completo. Resultado:

- 2 tablas, 2 PK, 6 FK tenant-safe, 8 checks y 12 índices;
- 4 índices únicos filtrados activos;
- TargetContract exacto y drift 0;
- estado V3 con hash final;
- segunda ejecución `NO_PENDING_MIGRATIONS`;
- base temporal eliminada.

## CHECKAPPERP

- Identidad sanitizada: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`.
- Preflight: V2 exacto, drift 0, objetos V3 ausentes y FAIL previo preservado.
- Dry-run: PASS.
- Migración oficial: PASS.
- Estado final: V3/hash final, drift 0 y contrato físico exacto.
- Filas de extensión e historial: 0/0; sin backfill.
- Fingerprint de negocio antes/después: `5d80648e3b347e77fe6fc23afaebbab81a2bfc42b8f7f0a5486eccbad1f864ab`.
- Segundo run: `NO_PENDING_MIGRATIONS`.

## UMBRELLA

- Tenant: `163 / UMBRELLA`.
- `idEmpresa`: `b17aaece-2b78-4e35-b554-9e694eeb15a7`.
- Identidad sanitizada: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.
- Preflight V2 exacto y dry-run: PASS.
- Migración oficial: PASS.
- Estado final: V3/hash final, drift 0 y contrato físico exacto.
- Filas de extensión e historial: 0/0; sin backfill.
- Fingerprint de negocio antes/después: `ea54ddfef62978e49f294f8e1c56ef4df31a89e95fbd7fe51c8eb8f168dda58b`.
- Segundo run: `NO_PENDING_MIGRATIONS`.

## Activación y límites

`LatestVersion`, `KnownSchemaVersionProvider`, `GetPackage(ProductosServicios)` y Compatibility Gate quedan activos en V3. Los gates de CHECKAPPERP y UMBRELLA resolvieron `COMPATIBLE`.

Este cierre no conecta la persistencia de Datos adicionales/Promociones en el modal, no aprueba PO y no declara FROZEN definitivo.
