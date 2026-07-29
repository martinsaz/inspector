# Operadores O0 - Respaldo puntual de Usuarios

Fecha de ejecucion: 2026-07-20 13:29:23

Tabla de respaldo: `dbo.Usuarios_BKP_O0_20260720_132923`

## Resumen

- Conteo original: `48`
- Conteo respaldo: `48`
- `idFirebase` no nulos: `48`
- Placeholder `uid`: `45`
- Hash original: `8D7EB42B051F0BCBB33FB23AC006BE4EC6CC5402706CCCB2254E2C7584002D88`
- Hash respaldo: `8D7EB42B051F0BCBB33FB23AC006BE4EC6CC5402706CCCB2254E2C7584002D88`

## Columnas de `dbo.Usuarios`

| Columna | Tipo | Longitud | Nulo | Collation |
|---|---|---:|---:|---|
| `id` | `uniqueidentifier` | `16` | `No` | `-` |
| `Numero` | `varchar` | `255` | `Sí` | `SQL_Latin1_General_CP1_CI_AS` |
| `Nombre` | `varchar` | `255` | `No` | `SQL_Latin1_General_CP1_CI_AS` |
| `ApellidoPaterno` | `varchar` | `255` | `No` | `SQL_Latin1_General_CP1_CI_AS` |
| `ApellidoMaterno` | `varchar` | `255` | `No` | `SQL_Latin1_General_CP1_CI_AS` |
| `FechaNacimiento` | `date` | `3` | `No` | `-` |
| `CorreoPersonal` | `varchar` | `255` | `No` | `SQL_Latin1_General_CP1_CI_AS` |
| `CorreoInstitucional` | `varchar` | `255` | `Sí` | `SQL_Latin1_General_CP1_CI_AS` |
| `fechaAlta` | `datetime` | `8` | `Sí` | `-` |
| `telefonoMovil` | `nvarchar` | `30` | `Sí` | `SQL_Latin1_General_CP1_CI_AS` |
| `telefonoCasa` | `nvarchar` | `30` | `Sí` | `SQL_Latin1_General_CP1_CI_AS` |
| `idSucursal` | `uniqueidentifier` | `16` | `No` | `-` |
| `idDepartamento` | `uniqueidentifier` | `16` | `Sí` | `-` |
| `idPuesto` | `uniqueidentifier` | `16` | `Sí` | `-` |
| `idEmpresa` | `uniqueidentifier` | `16` | `No` | `-` |
| `FechaIngreso` | `datetime` | `8` | `Sí` | `-` |
| `Estatus` | `bit` | `1` | `Sí` | `-` |
| `FotoLink` | `varchar` | `255` | `Sí` | `SQL_Latin1_General_CP1_CI_AS` |
| `borrado` | `bit` | `1` | `Sí` | `-` |
| `notas` | `varchar` | `255` | `Sí` | `SQL_Latin1_General_CP1_CI_AS` |
| `idFirebase` | `varchar` | `255` | `Sí` | `SQL_Latin1_General_CP1_CI_AS` |
| `Estado` | `bit` | `1` | `Sí` | `-` |
| `idRol` | `uniqueidentifier` | `16` | `Sí` | `-` |

## `idFirebase`

- Tipo: `varchar(255)`
- Nulabilidad: `NULL`
- Collation: `SQL_Latin1_General_CP1_CI_AS`

## Indices actuales

| name | is_unique | is_primary_key | has_filter | filter_definition |
|---|---|---|---|---|
| PK_Instructores_copy3 | True | True | False | NULL |

## Constraints actuales

| name | type_desc |
|---|---|
| DF__Usuarios__borrad__73BA3083 | DEFAULT_CONSTRAINT |
| DF__Usuarios__Estado__74AE54BC | DEFAULT_CONSTRAINT |
| DF__Usuarios__Estatu__72C60C4A | DEFAULT_CONSTRAINT |
| DF__Usuarios__fechaA__71D1E811 | DEFAULT_CONSTRAINT |
| DF__Usuarios__FechaI__3A4CA8FD | DEFAULT_CONSTRAINT |
| DF__Usuarios__id__6FE99F9F | DEFAULT_CONSTRAINT |
| DF__Usuarios__Nombre__70DDC3D8 | DEFAULT_CONSTRAINT |
| PK_Instructores_copy3 | PRIMARY_KEY_CONSTRAINT |

