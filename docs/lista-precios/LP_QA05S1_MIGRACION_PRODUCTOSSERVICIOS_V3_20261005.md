# LP-QA05S1 — Migración ProductosServicios V3

Fecha: 2026-10-05

Estado: **CONTRATO V3 CERRADO / HOTFIX LP-QA05S3 PASS / SQL REAL CERTIFICADO / RUNTIME V3 ACTIVADO**

## Actualización LP-QA05S3

El primer intento real registrado falló antes de ejecutar DDL porque las precondiciones descriptivas del contrato fueron entregadas al executor como SQL. El rollback conservó V2 exacto. LP-QA05S3 reemplazó esas etiquetas por precondiciones SQL ejecutables y dividió la unicidad activa de Producto y Servicio en índices filtrados simples compatibles con SQL Server.

El hash final vigente es `0ce8a1e391f89577ce20a0e29f5a048b48109a93951346a395b5618073b794e5`. El hash original `086c8e7fe0aced219dda9e3937ac0ddc2299c27b202ec2827c5eeda3916b732d` queda `SUPERSEDED`, manteniendo el mismo MigrationId porque ninguna base alcanzó V3 con el artefacto anterior. CHECKAPPERP y UMBRELLA quedaron en V3, drift 0, extensión vacía y Gate `COMPATIBLE`. Las secciones históricas que indican V2 activo o SQL pendiente describen el estado anterior a este cierre.

## Alcance

LP-QA05S1 cierra el contrato ProductosServicios V2→V3 y materializa su DDL en la infraestructura oficial de migraciones. No ejecuta SQL, no cambia bases reales, no integra persistencia runtime y no modifica la UX de ListaPrecios.

## Decisiones PO incorporadas

- Producto y Servicio conservan `ProductosServicios.Descripcion` como fuente canónica; la futura edición usará `05001009` y generará historial comercial.
- Variante y PresentacionVenta muestran la descripción heredada read-only, sin modificar el padre y sin columna propia.
- Web, Liverpool, MercadoLibre y Observaciones aplican a las cuatro identidades como configuración propia.
- DosPorUno, TresPorDos, DescuentoSegundo y Monedero aplican a las cuatro identidades como banderas de configuración.
- No existe herencia ni fallback de la extensión. Consultar una identidad sin fila devuelve textos vacíos y flags falsos en UX, sin materializar una fila.
- Las banderas no implementan reglas de Ventas, prioridad, acumulabilidad, vigencia, sucursal ni porcentajes.

## Contrato físico final

- Scope: `ProductosServicios`.
- SourceContract: V2.
- TargetContract: V3.
- MigrationId: `PS-M20261005-V2-V3-IDENTIDAD-COMERCIAL`.
- Hash anterior propuesto: `5abf54a4648c69304e260be2e2912ac6e8d391b43b977826a26bcc028ae0cb87`.
- Hash final: `086c8e7fe0aced219dda9e3937ac0ddc2299c27b202ec2827c5eeda3916b732d`.
- Tablas nuevas: `dbo.ProductosServiciosIdentidadComercial` y `dbo.ProductosServiciosIdentidadComercialHistorial`.

La extensión conserva PK clustered, FK compuestas tenant-safe a producto, variante y presentación, checks de identidad y archivado, timestamps UTC, actores y baja lógica. El historial es append-only, exige `CorrelationId`, limita campos/orígenes/operaciones y no se mezcla con `ListaPreciosHistorial`.

### Unicidad activa

No se usa un índice único compuesto que dependa de columnas nullable. Se definen tres índices unique filtrados:

- Producto/Servicio: `(idEmpresa, TipoIdentidad, idProductoServicio)` para tipos 1/2 activos.
- Variante: `(idEmpresa, idVariante)` para tipo 3 activo.
- PresentacionVenta: `(idEmpresa, idPresentacionVenta)` para tipo 4 activo.

Los checks obligan la combinación exacta de `TipoIdentidad`, `TipoProductoServicio`, `idVariante` e `idPresentacionVenta`; por ello no puede existir una segunda extensión activa equivalente.

## Package oficial local

`ProductosServiciosMigrationPackageProvider.GetPreparedProductosServiciosV3Package()` construye el release V1→V2→V3 con los mismos modelos, resolver, hashes, target validation, state/history/attempts y reconciliación de commit incierto de la infraestructura oficial. No existe runner paralelo.

El DDL:

- usa `SET XACT_ABORT ON` y `SingleTransaction`;
- crea únicamente las dos tablas, constraints e índices V3;
- no contiene `GO`, backfill ni DML de negocio;
- rechaza si cualquiera de los objetos V3 ya existe mientras el estado fuente siga en V2;
- deja la segunda corrida como no-op a través de state/history y resolución V3 exacta;
- conserva rollback transaccional previo al commit y `ReconcileAfterUncertainCommit` ante commit incierto.

## Estados de adopción

| Estado observado | Resultado |
|---|---|
| V2 exacto, sin objetos V3 | Migrable V2→V3. |
| V3 exacto con hash final | Adoptable/no-op; no se vuelve a ejecutar DDL. |
| V3 parcial | REJECT / revisión manual. |
| V2 con uno o ambos objetos V3 | REJECT / revisión manual. |
| V3 con drift o hash distinto | REJECT. |
| Versión futura desconocida | REJECT. |

No hay backfill. Después de adopción y datos reales no se autoriza DROP; cualquier corrección será forward migration.

## LatestVersion y activación segura

`ProductosServiciosSchemaContractProvider.LatestVersion`, `KnownSchemaVersionProvider`, Compatibility Gate y `GetPackage(ProductosServicios)` permanecen en V2. El package V3 sólo se obtiene mediante el método preparado, por lo que el runtime actual no puede exigir ni ejecutar V3 accidentalmente.

Procedimiento para un ticket SQL posterior:

1. revisión PO pre-ejecución del DDL/hash/package;
2. preflight read-only de CHECKAPPERP: V2 exacto, hash V2, drift 0 y ausencia total de objetos V3;
3. autorización explícita y activación temporal/controlada del release V3 en infraestructura oficial;
4. migrar CHECKAPPERP, validar contrato V3/hash final/drift 0/gate y segunda corrida no-op;
5. repetir preflight, migración y certificación en UMBRELLA;
6. sólo después de ambas certificaciones, activar `LatestVersion = V3`, release V3 y exigencia del Gate en runtime;
7. integrar carga/guardado del modal en otro ticket.

## Evidencia de no ejecución

- CHECKAPPERP: SQL ejecutado 0; datos modificados 0.
- UMBRELLA: SQL ejecutado 0; datos modificados 0.
- Runtime ListaPrecios: sin integración y sin cambios UX.

## Regresión local

- LP-QA05S + LP-QA05S1: `30/30` PASS.
- Schema contract: `84/84` PASS.
- SchemaMigrationEngine: `36/36` PASS.
- ProductosServicios: `294/294` PASS.
- ListaPreciosService: `138/138` PASS.
- Full suite: `817/817` PASS.
- Build API y MVC: PASS, 0 errores; se conservan warnings legacy de paquetes.
- `git diff --check` y secret scan focalizado: PASS.

## Dictamen

**LP-QA05S1 = CONTRATO V3 CERRADO / MIGRATION PACKAGE LOCAL PASS / QA TÉCNICA PASS / SQL REAL PENDIENTE DE AUTORIZACIÓN.**

No declarar V3 desplegado, runtime integrado, ListaPrecios aprobada PO ni FROZEN definitivo.
