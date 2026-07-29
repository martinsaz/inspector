# BL26 - Paquete SQL definitivo de `ListasInspecciones`

Fecha de preparación: `2026-07-29`  
Estado: `PREPARADO, NO EJECUTADO`

## Dictamen del paquete anterior

Los scripts `bl26-activos-integracion-*` quedan descartados y marcados como `NO APROBADOS / NO EJECUTAR`.

Motivo:

- proponían agregar `idActivo` directo a `dbo.ListasRespuestas`
- duplicaban el activo por cada respuesta
- no resolvían la ausencia de una cabecera formal de inspección

## Modelo propuesto de `dbo.ListasInspecciones`

| Campo | Tipo propuesto | Nulo | Finalidad |
|---|---|---:|---|
| `id` | `uniqueidentifier` | No | identidad oficial de la inspección |
| `idEmpresa` | `uniqueidentifier` | No | segmentación tenant |
| `idLista` | `uniqueidentifier` | No | plantilla ejecutada |
| `idActivo` | `uniqueidentifier` | Sí | activo inspeccionado cuando la lista usa activos |
| `idProgramacion` | `uniqueidentifier` | Sí | referencia opcional a programación existente |
| `eventoLegacy` | `uniqueidentifier` | Sí | compatibilidad temporal con reportes y pantallas legacy |
| `idSucursal` | `uniqueidentifier` | No | sucursal operativa de ejecución |
| `idUsuarioResponsable` | `uniqueidentifier` | No | responsable elegido en el flujo |
| `FechaInicio` | `datetime2(0)` | No | inicio oficial de inspección |
| `FechaFin` | `datetime2(0)` | Sí | cierre de inspección |
| `Estado` | `tinyint` | No | estado operativo de cabecera |
| `FechaCreacion` | `datetime2(0)` | No | auditoría técnica |
| `FechaActualizacion` | `datetime2(0)` | No | auditoría técnica |

## Estados propuestos de cabecera

- `1`: abierta
- `2`: finalizada
- `3`: cancelada

## Decisión definitiva sobre `idProgramacion`

- `dbo.ListasProgramacion.id` existe y es `uniqueidentifier`
- su nulabilidad real es `NULL`
- tiene `default(newid())`
- no tiene PK
- no tiene restricción `UNIQUE`
- la auditoría directa observó `0` registros actuales

Decisión definitiva para esta versión:

- `ListasInspecciones.idProgramacion` se conserva `NULLABLE`
- no se crea FK hacia `dbo.ListasProgramacion`
- el paquete SQL ya no deja esa relación como condicional

## Tablas existentes a modificar

### `dbo.Listas`

- agregar `UsaActivos bit not null default(0)`
- agregar `idTipoActivo uniqueidentifier null`
- conservar comportamiento actual cuando `UsaActivos = 0`

### `dbo.ListasRespuestas`

- agregar `idInspeccion uniqueidentifier null`
- conservar `evento` sin cambios
- no agregar `idActivo`
- permitir históricos existentes con `idInspeccion = NULL`

## Generación definitiva de identidad

- `dbo.ListasInspecciones.id` se define como `uniqueidentifier NOT NULL`
- la generación por base de datos queda con `DEFAULT (NEWSEQUENTIALID())`
- la identidad oficial no depende del navegador
- el API podrá seguir enviando un `id` explícito si una implementación futura lo valida, pero la protección base ya queda en SQL

## Relaciones y claves

### FKs propuestas

- `dbo.Listas.idTipoActivo -> dbo.ActivosTipos.id`
- `dbo.ListasInspecciones.idLista -> dbo.Listas.id`
- `dbo.ListasInspecciones.idActivo -> dbo.Activos.id`
- `dbo.ListasRespuestas.idInspeccion -> dbo.ListasInspecciones.id`

Soporte necesario validado en base:

- `dbo.Listas.id` tiene `182` filas, `182` valores distintos y `0` nulos auditados
- como la tabla no tenía PK ni `UNIQUE` sobre `id`, el paquete crea `UX_Listas_Id_BL26_20260729` para habilitar la FK aprobada

### Índices mínimos propuestos

- `IX_Listas_BL26_UsaActivos_TipoActivo_20260729`
- `UX_Listas_Id_BL26_20260729`
- `IX_ListasInspecciones_IdEmpresa_IdLista_20260729`
- `IX_ListasInspecciones_IdActivo_20260729`
- `IX_ListasInspecciones_IdUsuarioResponsable_20260729`
- `IX_ListasInspecciones_IdSucursal_20260729`
- `IX_ListasInspecciones_EventoLegacy_20260729`
- `IX_ListasRespuestas_IdInspeccion_20260729`

## Compatibilidad con `evento`

- los históricos actuales permanecen solo con `evento`
- las nuevas inspecciones podrán guardar:
  - `ListasInspecciones.id`
  - `ListasInspecciones.eventoLegacy`
  - `ListasRespuestas.idInspeccion`
  - `ListasRespuestas.evento`
- no se generan cabeceras históricas automáticas
- no se asignan activos por inferencia
- `eventoLegacy` queda solo como referencia de compatibilidad
- `IX_ListasInspecciones_EventoLegacy_20260729` es índice normal, no restricción única

## Nulabilidad definitiva

| Campo | Nulabilidad | Justificación |
|---|---:|---|
| `ListasInspecciones.idSucursal` | `NOT NULL` | el flujo actual persiste `idSucursal` en `ListasRespuestas` como obligatorio |
| `ListasInspecciones.idUsuarioResponsable` | `NOT NULL` | el flujo actual persiste `idUsuario` en `ListasRespuestas` como obligatorio |
| `ListasInspecciones.idActivo` | `NULL` | debe soportar listas sin activos |
| `ListasInspecciones.idProgramacion` | `NULL` | existen inspecciones manuales y no habrá FK en esta versión |
| `ListasInspecciones.FechaFin` | `NULL` | la inspección puede permanecer abierta |

## Estrategia posterior de guardado consistente

La implementación futura deberá usar una transacción server-side:

1. validar empresa, lista, sucursal, usuario y activo desde servidor
2. validar `UsaActivos` e `idTipoActivo` contra la lista
3. crear una sola cabecera en `dbo.ListasInspecciones`
4. guardar todas las respuestas con el mismo `idInspeccion`
5. conservar `evento` como compatibilidad legacy
6. cerrar o cancelar la cabecera según el resultado
7. revertir todo si falla cualquier inserción

## Riesgos reales pendientes

- la FK hacia `dbo.ListasProgramacion` depende de confirmar su PK real en la base
- el sistema actual aún tiene consultas legacy que leen por `evento`
- si más adelante se desea unicidad fuerte por inspección y pregunta, habrá que tratar aparte las preguntas de tipo múltiple
- el código funcional actual todavía tendría que adaptarse a esta nueva cabecera en una tarea posterior

## Archivos preparados

- [/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/bl26-listas-inspecciones-respaldo.sql](/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/bl26-listas-inspecciones-respaldo.sql)
- [/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/bl26-listas-inspecciones-up.sql](/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/bl26-listas-inspecciones-up.sql)
- [/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/bl26-listas-inspecciones-down.sql](/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/bl26-listas-inspecciones-down.sql)
- [/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/bl26-listas-inspecciones-impacto.md](/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/bl26-listas-inspecciones-impacto.md)

## Respaldo y reversión

- el respaldo cubre `dbo.Listas` y `dbo.ListasRespuestas`
- el `DOWN` elimina relaciones e índices en orden
- el `DOWN` advierte sobre pérdida de datos nuevos si la cabecera ya contiene filas
- `UP` y `DOWN` ya son simétricos respecto a la decisión final de no crear FK a `ListasProgramacion`

## Estado actual

- no se ejecutó ningún respaldo
- no se ejecutó ningún `CREATE TABLE`
- no se ejecutó ningún `ALTER TABLE`
- no se ejecutó ningún `INSERT`, `UPDATE` o `DELETE`
