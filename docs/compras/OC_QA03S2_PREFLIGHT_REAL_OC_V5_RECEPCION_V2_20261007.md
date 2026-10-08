#MOKA

# OC-QA03S2 — Preflight real pre-ejecución OC V5 + Recepción V2

> Actualización 2026-10-07: el bloqueo de acceso CHECKAPPERP de este corte fue resuelto por OC-QA03S2R. El resultado vigente está en `OC_QA03S2R_RECUPERACION_CHECKAPPERP_CIERRE_PREFLIGHT_20261007.md`: acceso recuperado, CHECKAPPERP OC V2/Recepción V1, drift 0 y dictamen global `STOP_PO` por source OC V4 no satisfecho.

Fecha: 2026-10-07  
Estado: `STOP_PO / CHECKAPPERP NO VERIFICABLE / UMBRELLA PASS / DDL 0 / DML 0`  
Autorización usada: consultas read-only, validador físico oficial y resolución pura de packages.  
No autorizado/no ejecutado: migración, DDL, DML, activación V5/V2, runtime o UI.

## 1. Dictamen ejecutivo

UMBRELLA 163 cumple el preflight: OC V4 y Recepción V1 exactas, hashes exactos, drift cero, estructura física completa y cero incompatibilidades de datos. Su backfill esperado es 47 destinos OC, 96 partidas OC y cero partidas de recepción.

CHECKAPPERP no pudo certificarse:

- `MOKA_CHECKAPPERP_QA_CONNECTION` no está disponible en el proceso;
- el catálogo oficial Firebase no contiene una conexión cuyo `Initial Catalog` sea CHECKAPPERP;
- la credencial configurada para `DB_A883C3_CHECKLIST`, probada cambiando únicamente el catálogo en memoria, no puede resolver la identidad de CHECKAPPERP (`DatabaseIdentityUnavailable`).

No se adivinaron credenciales, no se utilizó información histórica como estado actual y no se intentó reparar acceso. Como el gate exige validar ambas bases, el dictamen global obligatorio es `STOP_PO`.

## 2. CHECKAPPERP

| Evidencia | Resultado |
|---|---|
| Acceso read-only actual | No disponible |
| OC versión/hash | No verificable |
| Recepción versión/hash | No verificable |
| Drift | No verificable |
| Conteos/backfill | No verificables |
| Dry-run | No ejecutable sin identidad/source actual |
| DDL/DML | 0 / 0 |
| Dictamen | `STOP_PO` |

La evidencia histórica del proyecto no sustituye la lectura actual requerida por OC-QA03S2.

## 3. UMBRELLA 163

DatabaseIdentity saneada: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.

### 3.1 Contrato físico y estado

| Scope | Versión | Hash persistido/esperado | Drift | Objetos detectados |
|---|---:|---|---:|---|
| OrdenesCompra | 4 | `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a` | 0 / `SchemaOk` | 4 tablas, 79 columnas, 17 índices, 6 FKs, 20 checks |
| Recepcion | 1 | `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f` | 0 / `SchemaOk` | 4 tablas, 57 columnas, 16 índices, 13 FKs, 7 checks |

El validador reportó `ChangedState=false` y `ExecutedDdl=false` en ambos scopes.

### 3.2 OrdenesCompra

- OCs: 47.
- Detalles: 96.
- Estados: Borrador 17, Generada 19, Cancelada 11, Parcialmente recibida 0, Recibida 0, inválidos 0.
- Tenant: las 47 OCs pertenecen a una empresa; inconsistencias tenant 0.
- Sucursales históricas válidas: 47/47.
- Distribución de OCs por `idSucursal`:
  - `F3080AF9-985B-4802-8AEA-700F829F22FC`: 38.
  - `E60D8B40-F9ED-4040-959F-39C9ED69C24A`: 4.
  - `0B416D08-1A4E-4E81-8DDE-4D2FC7936580`: 3.
  - `FD6D1477-E712-4946-8F3A-FD18F7E95EAC`: 1.
  - `CB8BA047-087D-4FE4-B6C8-64DDA8475C7A`: 1.
- Partidas huérfanas: 0.
- Errores de cantidades: 0.
- Errores subtotal/total: 0.
- Cantidad base ordenada: 152.0000.
- Recibido acumulado: 0.0000.
- Pendiente: 152.0000.
- Subtotal cabeceras: 48,745.01.
- Total cabeceras: 48,745.01.

Backfill OC V4→V5 esperado:

- crear 47 filas en `OrdenesCompraSucursales`;
- poblar `OrdenesCompraDetalle.idSucursal` en 96 filas;
- alterar datos comerciales, cantidades, importes o estados: 0;
- incompatibilidades: 0.

### 3.3 Recepción e Inventario

- Recepciones: 0.
- Partidas de recepción: 0.
- Series de recepción: 0.
- Recepciones parciales: 0.
- Grupos con múltiples recepciones: 0.
- Sobrerrecepciones: 0.
- `OperationKey` vacío/duplicado: 0/0.
- Movimientos de inventario totales/por recepción: 0/0.
- Incompatibilidades movimiento/sucursal/producto/variante/cantidad: 0.
- Servicios con movimiento físico: 0.
- Identidades de saldo faltantes relacionadas con recepción: 0.
- Errores de serie por conteo/identidad/sucursal: 0.
- Series duplicadas: 0.

Backfill Recepción V1→V2 esperado:

- poblar `RecepcionPartidas.idSucursal`: 0 filas;
- modificar movimientos, saldos o series históricos: 0;
- recalcular cantidades o estados: 0;
- incompatibilidades: 0.

## 4. Simulación oficial sin ejecución

No se invocó el runner ni el SQL de migración. Se usaron el validador físico oficial y `SchemaMigrationResolver`, que son read-only/puro respectivamente.

### OC

- SourceVersion: 4.
- TargetVersion: 5.
- SourceHash: `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`.
- TargetHash: `4e88ac49a73e3169903a6399a5b8c4fa2ea4c9b747005082ecc086636cb8462a`.
- PendingMigration lógica: `OC-M20261006-V4-V5-MULTISUCURSAL-PARTIDA`.
- Resolución oficial actual: `MIGRATION_NOT_AUTO_APPLICABLE`, protección esperada por `AutoApplicable=false` y lista aprobada vacía.
- DryRun: PASS read-only/protección activa; cambios ejecutados 0.
- DDL esperado si PO autoriza después: tabla destinos, columna detalle, FKs/unique/indexes y cabecera nullable.
- DML esperado: 47 inserts de destinos y 96 updates de detalle.

### Recepción

- SourceVersion: 1.
- TargetVersion: 2.
- SourceHash: `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`.
- TargetHash: `44629d5055411a5a12e2acddfa108538a6f40295d339b45cead45ea39f62de40`.
- PendingMigration lógica: `REC-M20261006-V1-V2-SUCURSAL-PARTIDA-OCV5`.
- Resolución oficial actual: `MIGRATION_NOT_AUTO_APPLICABLE`.
- DryRun: PASS read-only/protección activa; cambios ejecutados 0.
- DDL esperado si PO autoriza después: columna sucursal de partida, candidate keys, FKs e índice.
- DML esperado: 0 updates por no existir partidas de recepción.

La dependencia conserva orden exacto OC V5 → Recepción V2 y referencia el manifest OC V5 exacto. Ambos packages permanecen `ApprovedForExecution=false` y `AutoApplicable=false`. La segunda ejecución sólo está diseñada como no-op ante objetivo completo; cualquier parcial/drift ejecuta `THROW`.

## 5. Gate

UMBRELLA individual: `READY_FOR_PO_EXECUTION` desde el punto de vista de datos/schema, sin otorgar autorización de ejecución.  
CHECKAPPERP: `STOP_PO`, no verificable.  
Dictamen global OC-QA03S2: `STOP_PO`.

Siguiente paso: revisión PO Denisse y provisión de acceso read-only oficial a CHECKAPPERP. No ejecutar migraciones, activar V5/V2, modificar UI ni continuar QA manual.
