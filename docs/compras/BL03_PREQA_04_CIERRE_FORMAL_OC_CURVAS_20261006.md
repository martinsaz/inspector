# BL03-PREQA-04 — Cierre formal pre-QA OC + Curvas

Fecha: 2026-10-06  
Decisión: PO  
Estado: LISTO PARA QA MANUAL DENISSE

## Decisión PO

- Los estados OC `4 = Parcialmente recibida` y `5 = Recibida` no son un defecto de OrdenesCompra ni un bloqueo de PRE-QA OC.
- Su certificación E2E visual queda diferida hasta que exista la UI oficial de Recepción.
- Está prohibido crear rollback, cancelación, reversión, fixtures irreversibles o cualquier mecanismo artificial únicamente para facilitar QA.
- El backend de Recepción conserva su certificación técnica de recepción parcial, segunda recepción, inventario e idempotencia.
- El fallo de `ListaPreciosMatrixSqlIntegrationTests` es preexistente, fuera de BL-03 y no bloqueante. ListaPrecios permanece pausada/congelada y no se modifica.
- Etiquetas y Configuración Legacy permanecen documentadas como `C) DECISIÓN PO POSTERIOR`; no penalizan el alcance autorizado. Legacy sigue estrictamente read-only.

## Revalidación objetiva

- Mapeo OC por código: `1 Borrador`, `2 Generada`, `3 Cancelada`, `4 Parcialmente recibida`, `5 Recibida` en API, proxy MVC y JavaScript.
- `RecepcionScopeService` transiciona legítimamente a 4 cuando existe recepción parcial y a 5 cuando todas las partidas quedan completas.
- Fechas mínima/máxima: persistencia real V3, F5 y reapertura PASS.
- Ordenado, Recibido, Pendiente, detalle, PDF, Excel, permisos, tenant y responsive: PASS según BL03-PREQA-03.
- Catálogo de Curvas: 13/13, `Revertir cambios` ausente, inventos 0, responsive PASS.
- Siembra: 13/13, sembrar/reemplazar/quitar/F5/cleanup, inventos 0, responsive PASS.
- Regresión BL-03 reejecutada: 369/369 PASS.
- Node y `git diff --check`: PASS.
- ListaPrecios y Legacy: archivos modificados 0.

## Avance

Metodología: `conformes / auditados × 100`.

- OC: 22/22 = 100% dentro del alcance actual; estados 4/5 correctamente mapeados y su E2E diferido no penaliza.
- Catálogo: 13/13 = 100%.
- Siembra: 13/13 = 100%.
- Alcance actual OC + Catálogo + Siembra: 48/48 = 100%.
- BL-03 total: 69/92 = 75%; Huecos/Copetes y Recepción UI siguen pendientes y no reducen el gate del alcance actual.

## Gate

`LISTO PARA QA MANUAL DENISSE`.

No iniciar desarrollo posterior hasta el resultado de QA PO. No iniciar OC-CUR-06, no implementar Recepción UI, no modificar ListaPrecios ni Legacy y no agregar extensiones para facilitar QA.
