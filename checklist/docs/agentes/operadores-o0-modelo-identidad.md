# Operadores O0 — Modelo e identidad del perfil funcional

Fecha: 2026-07-20

## Estado posterior a la corrección definitiva

- Este documento conserva valor histórico de análisis, pero su modelo original ya no es la implementación vigente.
- La decisión final ejecutada el 2026-07-20 fue migrar a operadores independientes.
- No quedó vigente la estrategia `Usuarios` + `OperadoresPerfil` + rol seleccionable.
- La implementación activa usa:
  - `dbo.Operadores`
  - `dbo.OperadoresSucursales`
  - `dbo.ListasOperadoresAsignaciones.idOperador`
- `Usuarios` quedó intacto como módulo administrativo preexistente y no participa como identidad base del operador.
- El login operativo ya reconoce `account_type = Operador` y resuelve empresa, sesión y redirección a `RecoleccionesBL26` sin exigir fila en `Usuarios`.
- La certificación funcional en navegador confirmó:
  - alta independiente;
  - relación con empresa activa;
  - múltiples sucursales;
  - login operativo;
  - bloqueo por suspensión;
  - retorno por reactivación;
  - recuperación por correo.

## Referencia del operador QA vigente

- Correo: `operador.qa.1784589277701@checkapp.com.mx`
- Nombre visible: `Operador QA BL26`
- Estado final: activo
- Disponible para QA manual posterior del Product Owner

## 1. Explicación simple

La fase O0 define cómo preparar técnicamente a `Operadores` sin ejecutar cambios.

La decisión aprobada por Product Owner es:

- `Usuarios` sigue siendo la identidad base común;
- `Operador` no se identifica solo por rol;
- debe existir un perfil funcional separado;
- V1 mantiene una empresa activa por sesión;
- V1 mantiene sucursal única;
- el acceso a `Inspección en campo` debe quedar protegido en menú, servidor y API;
- la asignación de listas debe quedar relacionada con el perfil operador, no con una heurística por empresa.

Este documento aterriza esa decisión en:

- modelo;
- objetos;
- scripts;
- reglas de seguridad;
- compatibilidad con `Legacy`, `CreadorLista`, `Recolecciones BL26` y `R3`.

## 2. Identidad base

### Campos observables de `Usuarios`

Fuente: modelos `Usuarios` y `UsuarioWeb`, controladores de login, usuario, sucursal y menú.

| Campo | Tipo exacto | Uso actual | Uso futuro propuesto |
|---|---|---|---|
| `Id` | `Guid?` | identidad primaria del usuario | identidad base común |
| `Nombre` | `string` | nombre visible | identidad |
| `APaterno` | `string` | apellido | identidad |
| `AMaterno` | `string` | apellido | identidad |
| `FechaNacimiento` | `DateTime?` | dato de ficha | no requerido para perfil operador |
| `Numero` | `string` | dato administrativo | opcional en identidad |
| `TelefonoMovil` | `string` | contacto | opcional |
| `TelefonoFijo` | `string` | contacto | opcional |
| `CorreoInstitucional` | `string` | login/identificación | identidad |
| `CorreoPersonal` | `string` | login/identificación | identidad |
| `IdSucursal` | `Guid?` | sucursal activa actual | fuente autoritativa V1 |
| `IdDepartamento` | `Guid?` | organización interna | no debe identificar operador |
| `IdPuesto` | `Guid?` | organización interna | no debe identificar operador |
| `Estado` | `bool?` | estado interno observado | no usar como perfil operador |
| `FechaIngreso` | `DateTime?` | dato administrativo | histórico de usuario |
| `Estatus` | `bool?` | estado administrativo SQL | apoyo de suspensión |
| `Notas` | `string` | observaciones | opcional |
| `borrado` | `bool?` | borrado lógico | administrativo |
| `FechaAlta` | `DateTime?` | auditoría | identidad |
| `FotoLink` | `string` | perfil visual | opcional |
| `IdFirebase` | `string` | vínculo externo actual | vínculo Auth/RTDB |
| `IdEmpresa` | `Guid?` | tenant activo actual | empresa V1 |
| `idRol` | `Guid?` | rol actual por sesión | rol base o contexto actual |

### Confirmaciones

1. `Usuarios` sí puede conservarse como identidad base si las reglas operativas del operador se mueven a un perfil separado.
2. Campos de identidad pura:
   - `Id`
   - nombres
   - correos
   - `IdFirebase`
   - `IdEmpresa`
   - `FechaAlta`
3. Campos que hoy mezclan reglas funcionales:
   - `IdSucursal`
   - `idRol`
   - `IdPuesto`
   - `IdDepartamento`
   - `Estatus`
4. No deben duplicarse en el perfil:
   - nombres
   - correos
   - `IdFirebase`
   - `FechaAlta`
5. Históricos actuales y futuros deben seguir colgando de `Usuarios.Id`.

### PK, índices y restricciones observables

- PK observable por uso: `Usuarios.Id`
- FK formal no confirmada por metadata directa en esta tarea
- Índices:
  - no auditados directamente por metadata SQL en esta fase
- Restricciones observables por código:
  - `IdEmpresa` es clave funcional obligatoria en login y API
  - `idRol` participa en menú y permisos
  - `IdSucursal` participa en filtros operativos
- `Último acceso` no existe hoy como campo observable

## 3. Perfil funcional

Nombre conceptual propuesto:

- `OperadoresPerfil`

Nombre definitivo:

- debe respetar la convención del proyecto para tablas funcionales en plural;
- propuesta técnica final para script: `dbo.OperadoresPerfil`

### Principios

- relación 1 a 1 con `Usuarios`;
- un usuario puede tener 0 o 1 perfil operador activo;
- no se elimina físicamente;
- el perfil concentra reglas operativas;
- el rol operador configurable vive ligado al perfil, no al nombre del rol.

### Campos propuestos

| Campo | Tipo SQL sugerido | Nulo | Índice/FK | Justificación |
|---|---|---:|---|---|
| `id` | `uniqueidentifier` | no | PK | identidad del perfil |
| `idUsuario` | `uniqueidentifier` | no | `UNIQUE`, FK `Usuarios(id)` | relación 1 a 1 |
| `idEmpresa` | `uniqueidentifier` | no | índice de tenant | escopo operativo V1 |
| `idRolOperador` | `uniqueidentifier` | no | validación lógica contra `Roles(id)` | rol configurable por empresa |
| `estatus` | `tinyint` | no | índice | estado operativo |
| `activo` | `bit` | no | índice | borrado lógico / vigencia |
| `fechaAlta` | `datetime` | no | sin índice | auditoría |
| `fechaSuspension` | `datetime` | sí | sin índice | suspensión específica |
| `creadoPor` | `uniqueidentifier` | sí | FK lógica `Usuarios(id)` | auditoría |
| `fechaModificacion` | `datetime` | sí | sin índice | auditoría |
| `modificadoPor` | `uniqueidentifier` | sí | FK lógica `Usuarios(id)` | auditoría |
| `versionRow` | `rowversion` | no | control de concurrencia | seguridad de edición |

### Confirmaciones

- relación uno a uno con `Usuarios`: sí
- más de un perfil operador por usuario: no
- `idSucursal` dentro de `OperadoresPerfil`: no en V1
  - la sucursal autoritativa del operador en V1 permanece en `Usuarios.IdSucursal`
  - el script O0 no agrega `idSucursal` al perfil para evitar doble fuente de verdad
- FK física hacia `Roles(id)`: no en la base auditada el 2026-07-20
  - `dbo.Roles.id` no expone PK ni índice `UNIQUE` físico compatible en esta base
  - `idRolOperador` se conserva como referencia lógica y deberá validarse en API/servicio administrativo hasta que exista una clave física compatible
- control de duplicado:
  - índice único por `idUsuario`
- conservación de histórico:
  - `activo = 0`
  - `estatus` suspendido / inactivo
- suspensión sin eliminar:
  - sí, con `estatus`, `activo` y `fechaSuspension`

## 4. Casos de doble perfil

### Recomendación única

- No se requieren dos cuentas obligatorias.
- Una misma identidad base puede operar en dos contextos:
  - administrativo
  - operador
- Si tiene ambos perfiles, debe elegir experiencia después del login.

| Caso | Perfil | Rol | Menú | Ruta inicial |
|---|---|---|---|---|
| Usuario administrativo únicamente | sin `OperadoresPerfil` | `Usuarios.idRol` | módulos administrativos actuales | comportamiento actual |
| Operador únicamente | con `OperadoresPerfil` | `OperadoresPerfil.idRolOperador` y/o contexto efectivo | solo `Inspección en campo` | `Inspección en campo` |
| Administrador + Operador | con `OperadoresPerfil` y rol administrativo base | ambos, pero uno por contexto de sesión | no combinado por defecto; elegir experiencia | selector de experiencia posterior al login |

## 5. UID Firebase

### Comparativo

| Alternativa | Ventaja | Riesgo | Recomendación |
|---|---|---|---|
| Columna en `Usuarios` | simple, directa, compatible con login actual | requiere saneamiento y unicidad | Sí |
| Tabla de identidades externas | más abstracta y escalable a varios proveedores | sobrediseño para V1 | No V1 |

### Recomendación única

- reutilizar y endurecer `Usuarios.IdFirebase` como vínculo autoritativo V1;
- no crear tabla de identidades externas en O0.

### Confirmaciones

- índice único:
  - recomendado como índice filtrado sobre `Usuarios.IdFirebase` para valores reales
- nulabilidad:
  - permitir `NULL` o vacío para históricos mientras se sanea
- si aún no existe UID:
  - el alta administrativa debe impedir activar el perfil operador
- alta administrativa:
  - crea Firebase primero y guarda el UID en `Usuarios.IdFirebase`
- no resolver solo por correo:
  - correo sirve para captura/recuperación
  - UID debe ser el vínculo técnico autoritativo

## 6. Empresa V1

### Comparativo

| Alternativa | Compatibilidad V1 | Evolución | Duplicidad | Recomendación |
|---|---:|---:|---:|---|
| `idEmpresa` solo en perfil | Media | Media | Baja | No |
| relación futura separada Operador–Empresa | Baja para V1 | Alta | Baja | No V1 |
| empresa principal en perfil + relación futura posterior | Alta | Alta | Media | Sí |

### Recomendación única

- crear en V1:
  - `OperadoresPerfil.idEmpresa`
- no crear todavía:
  - tabla multiempresa
  - selector de empresa
  - múltiples empresas por sesión
- no bloquear futuro:
  - no hacer depender la identidad del operador del nombre del rol
  - no hacer depender futuras asignaciones únicamente de `Usuarios.IdEmpresa`
- dato que debe preservarse en futuras inspecciones:
  - `idEmpresa` efectivo de la ejecución

## 7. Preparación multiempresa

No se crea todavía una tabla multiempresa.

Se deja preparado:

- identidad base compartida;
- perfil funcional separado;
- `idEmpresa` explícito en perfil operador;
- posibilidad futura de agregar:
  - `OperadoresPerfilEmpresas`
  - o una relación equivalente sin romper V1.

## 8. Rol configurable

### Respuestas

1. El operador sí necesita rol, porque el menú y permisos actuales derivan del rol.
2. No debe poder seleccionar cualquier rol arbitrario sin validación.
3. Sí debe existir una plantilla/base recomendada.
4. El administrador podrá modificar permisos, pero no retirar el permiso funcional mínimo.
5. Permiso esencial:
   - acceso específico a `Inspección en campo`
6. La API evita depender del nombre validando:
   - existencia de perfil operador
   - estatus activo
   - rol efectivo permitido
   - permiso funcional requerido
7. El perfil funcional se identifica por `OperadoresPerfil`.
8. Un rol administrativo no vuelve a alguien operador si no existe `OperadoresPerfil`.

### Responsabilidades

| Elemento | Responsabilidad |
|---|---|
| Perfil Operador | identidad funcional del operador |
| Rol | permisos configurables por empresa |
| Permiso | habilita experiencia operativa mínima |
| Menú | se arma desde rol, pero condicionado por perfil |
| API | valida perfil + permiso + tenant + estatus |

## 9. Rol base o plantilla

### Comparativo

| Modelo | Ventaja | Riesgo | Recomendación |
|---|---|---|---|
| Rol fijo protegido | control fuerte | poca flexibilidad | No |
| Rol base configurable | buen equilibrio | requiere reglas de protección | Parcial |
| Plantilla por empresa | consistente con roles por empresa | requiere semilla inicial | Sí |
| Administrador crea manualmente un rol | flexible | configuración incompleta y ambigüedad | No |

### Recomendación única

- `Plantilla por empresa`

Definición:

- se crea al activar O0/O1 para empresas existentes y nuevas;
- puede renombrarse;
- no debe eliminarse mientras exista un `OperadoresPerfil` ligado;
- puede ampliarse;
- no puede perder el permiso funcional mínimo.

## 10. Permiso

### Comparativo

| Alternativa | Seguridad | Compatibilidad | Riesgo | Recomendación |
|---|---:|---:|---|---|
| Reutilizar `02001000` | Baja | Alta | acceso lateral a `Nueva` legacy | No |
| Crear permiso específico | Alta | Media | requiere semilla y validación | Sí |
| Perfil Operador + permiso existente | Media | Alta | mezcla reglas legacy y nuevas | No |

### Recomendación única

- crear permiso específico para `Inspección en campo`

Código propuesto por convención observada:

- `02005000`

Nota:

- es código propuesto, no ejecutado ni aprobado aún.

## 11. Sucursal V1

### Comparativo

| Alternativa | Fuente autoritativa | Compatibilidad | Evolución multisucursal |
|---|---|---|---|
| Solo `Usuarios.IdSucursal` | `Usuarios` | Alta | Requiere tabla puente futura |
| Solo perfil | `OperadoresPerfil` | Baja con legacy actual | Media |
| En ambos | Ambigua | Media | Mala por doble fuente |
| Otra relación existente | No demostrada | Baja | Baja |

### Recomendación única

- fuente autoritativa V1: `Usuarios.IdSucursal`

### Casos

- operador con sucursal válida:
  - puede operar
- operador sin sucursal:
  - no puede activarse para V1
- sucursal inactiva:
  - debe bloquear operación hasta reasignar
- cambio de sucursal:
  - se actualiza en `Usuarios`
- histórico:
  - la inspección debe persistir el `idSucursal` original
- multisucursal futura:
  - se resuelve con tabla puente posterior

## 12. Asignación

### Entidad reutilizable

- `ListasProgramacion` existe, pero no alcanza como asignación V1 de operador porque:
  - no referencia `OperadoresPerfil`
  - no resuelve suspensión del perfil
  - no resuelve control de sucursal operativo
  - no deja clara unicidad por operador/lista/sucursal/vigencia

### Tabla mínima propuesta

Nombre conceptual:

- `ListasOperadoresAsignaciones`

Nombre propuesto para script:

- `dbo.ListasOperadoresAsignaciones`

| Campo | Tipo SQL | Obligatorio | Índice/FK | Justificación |
|---|---|---:|---|---|
| `id` | `uniqueidentifier` | Sí | PK | identidad de asignación |
| `idEmpresa` | `uniqueidentifier` | Sí | índice | tenant |
| `idLista` | `uniqueidentifier` | Sí | índice | lista asignada |
| `idOperadorPerfil` | `uniqueidentifier` | Sí | FK `OperadoresPerfil(id)` | operador funcional |
| `idSucursal` | `uniqueidentifier` | Sí | FK lógica `Sucursales(id)` | contexto operativo |
| `fechaProgramada` | `date` | No | índice | agenda |
| `vigenciaInicio` | `datetime` | No | índice | validez |
| `vigenciaFin` | `datetime` | No | índice | validez |
| `estatus` | `tinyint` | Sí | índice | programada, cancelada, cerrada |
| `activo` | `bit` | Sí | índice | vigencia lógica |
| `creadoPor` | `uniqueidentifier` | No | FK lógica `Usuarios(id)` | auditoría |
| `fechaCreacion` | `datetime` | Sí | sin índice | auditoría |
| `fechaModificacion` | `datetime` | No | sin índice | auditoría |
| `modificadoPor` | `uniqueidentifier` | No | FK lógica `Usuarios(id)` | auditoría |
| `versionRow` | `rowversion` | Sí | concurrencia | control de actualización |

### Reglas

- asignación única:
  - por operador + lista + sucursal + inicio
- reprogramación:
  - nueva fila o actualización controlada, no borrado
- expiración:
  - por `vigenciaFin` y `estatus`
- cancelación:
  - `estatus` + `activo = 0` si aplica
- lista deja de ser ejecutable:
  - no se elimina histórico; solo se bloquea nueva ejecución
- operador suspendido:
  - no puede usar asignaciones activas
- cambio de sucursal:
  - invalida asignaciones incompatibles
- duplicados:
  - índice único filtrado propuesto
- compatibilidad con R3:
  - `idAsignacion` debe persistirse en la ejecución

## 13. Relación con R3

| Dato | Persistir en inspección | Derivable | Motivo |
|---|---:|---:|---|
| `idAsignacion` | Sí | No | referencia operativa original |
| `idOperadorPerfil` | Sí | No | congelar contexto funcional |
| `idUsuario` | Sí | Sí parcial | conservar identidad base original |
| `idEmpresa` | Sí | Sí parcial | congelar tenant original |
| `idSucursal` | Sí | Sí parcial | histórico inmutable |
| `idLista` | Sí | Sí parcial | histórico inmutable |

Cambios posteriores de:

- sucursal del operador;
- rol;
- estado;
- asignación;

no deben alterar una inspección ya iniciada.

## 14. Suspensión

| Capa | Suspender | Reactivar | Fuente autoritativa |
|---|---|---|---|
| Perfil Operador | `estatus` suspendido / `activo=0` según caso | reactivar perfil | `OperadoresPerfil` |
| Usuario | `Estatus=false` solo si la identidad completa se bloquea | `Estatus=true` | `Usuarios` |
| Firebase Auth | deshabilitar solo para suspensión global | habilitar | Auth |
| RTDB | `Usuarios/{uid}.status=false` en suspensión global | `true` | RTDB |
| Sesión | revocación / cierre si pierde acceso global o al contexto actual | nueva autenticación | sesión + Auth |
| API | negar acceso por perfil, estatus, tenant o asignación | restaurar validación positiva | servidor |
| Asignaciones | conservadas pero no ejecutables | recuperables | `ListasOperadoresAsignaciones` |
| Inspecciones abiertas | no borrar; política de cierre o reanudación futura | según regla futura | ejecución |
| Históricos | intactos | intactos | ejecución histórica |

Casos:

- suspensión global:
  - bloquea toda la identidad
- suspensión solo del perfil operador:
  - puede seguir como administrador si aplica
- operador que también es administrador:
  - se le quita solo contexto operador si la suspensión no es global

## 15. Seguridad

| Recurso | Perfil requerido | Permiso requerido | Validación servidor |
|---|---|---|---|
| CRUD de Operadores | administrativo | permisos de ajustes correspondientes | rol administrativo válido |
| `Inspección en campo` | operador | permiso específico operativo | perfil operador activo + rol/permiso + empresa |
| URL manual a módulos administrativos | administrativo | permisos administrativos | negar si solo es operador |
| URL manual a operación | operador | permiso operativo | negar si no tiene perfil o asignación |
| Proxy BL26 | operador | permiso operativo | resolver sesión, estatus, empresa, sucursal y asignación |
| API futura de listas asignadas | operador | permiso operativo | perfil + tenant + vigencia |

No confiar solo en menú.

## 16. Firebase Admin

### Hallazgos

- Admin SDK no está integrado hoy.
- El alta actual la hace el frontend MVC con credenciales de servicio.
- No se observó una capa dedicada en `checklistWs` para:
  - deshabilitar cuentas
  - revocar tokens
  - crear usuarios de forma idempotente

### Recomendación única

- proyecto responsable futuro:
  - `checklistWs` o un backend compartido equivalente, no el frontend MVC
- estrategia de activación:
  - alta administrativa con contraseña temporal o recuperación controlada
- rollback:
  - si falla SQL, revertir Auth/RTDB
- idempotencia:
  - validar correo, UID y relación antes de crear

## 17. Esquema exacto

### Cambios obligatorios V1

| Objeto | Acción | Obligatorio V1 | Justificación |
|---|---|---:|---|
| `OperadoresPerfil` | crear tabla | Sí | perfil funcional separado |
| `Usuarios.IdFirebase` | endurecer semántica e índice filtrado propuesto | Sí | vínculo Firebase–SQL |
| `ListasOperadoresAsignaciones` | crear tabla | Sí | asignación por operador |
| rol base / plantilla | semilla propuesta | Sí | permisos configurables consistentes |
| permiso específico `Inspección en campo` | semilla propuesta | Sí | no depender de `02001000` |

### Cambios opcionales futuros

| Objeto | Acción | Obligatorio V1 | Justificación |
|---|---|---:|---|
| relación multiempresa | tabla futura | No | evolución posterior |
| multisucursal | tabla puente futura | No | fuera de V1 |
| `UltimoAcceso` | columna futura | No | auditoría operativa |

### Cambios rechazados

| Objeto | Acción | Obligatorio V1 | Justificación |
|---|---|---:|---|
| tabla independiente de identidad externa | crear | No | sobrediseño |
| reutilizar `02001000` | mantener | No | acceso lateral legacy |
| detectar operador por nombre de rol | implementar | No | frágil |

## 18. Scripts

Archivos propuestos:

- `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/operadores-o0-up.sql`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/operadores-o0-down.sql`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/operadores-o0-seed.sql`

Contenido esperado:

- `up`:
  - validaciones
  - creación de tablas
  - índices
  - FKs seguras físicamente certificables
  - índice filtrado propuesto sobre `Usuarios.IdFirebase`
- `down`:
  - rollback defensivo
  - sin cascadas destructivas
  - bloqueo si ya hay datos
- `seed`:
  - plantilla de rol
  - permiso específico
  - relaciones mínimas propuestas
  - bloqueado por bandera para no ejecutarse accidentalmente

## 19. Prueba en seco

| Prueba | Resultado | Bloqueo |
|---|---|---|
| Compatibilidad con login actual | Compatible si se mantiene una empresa por sesión | ninguno estructural en O0 |
| Compatibilidad con `Usuarios` existentes | Compatible si el perfil es separado | requiere filtro visual futuro |
| Compatibilidad con roles actuales | Compatible si no se depende del nombre | requiere permiso nuevo |
| Compatibilidad con `Legacy` | Compatible si no se toca login ni CRUD actual | ninguno en O0 |
| Compatibilidad con `Inspección en campo` | Compatible como siguiente etapa | depende de permiso y asignaciones |
| Compatibilidad con `R3` | Compatible y recomendable | requiere persistir `idAsignacion` y perfil |
| Rollback | viable con tablas nuevas y sin tocar históricos | bloquear si hay datos nuevos |
| FK e índices | viables parcialmente | `Roles.id` no tiene PK/UNIQUE físico; la FK hacia Roles no debe ejecutarse en esta base |

## 19.1 Validación física del 2026-07-20

Resultado observado en la base configurada por la API local:

- servidor SQL: `sql5111`
- base: `db_a883c3_checklist`
- edición: `Web Edition (64-bit)`
- modo: `READ_WRITE`
- `Usuarios`: `48`
- `Roles`: `116`
- `Sucursales`: `134`
- `dbo.OperadoresPerfil`: no existe
- `dbo.ListasOperadoresAsignaciones`: no existe

### `Usuarios.idFirebase`

- nombre físico real: `idFirebase`
- tipo: `varchar(255)`
- collation: `SQL_Latin1_General_CP1_CI_AS`
- nulabilidad: sí
- default: no
- total auditado: `48`
- `NULL`: `0`
- vacíos/espacios: `0`
- placeholder literal `uid`: `45`
- longitud máxima observada: `22`
- duplicados reales detectados: no observados en la auditoría

Conclusión:

- el índice filtrado sigue siendo viable si excluye `NULL`, vacío, espacios y el placeholder histórico `uid`
- no debe intentar normalizar ni corregir los `45` placeholders durante O0

### Claves de destino para FKs

- `Usuarios.id`: `uniqueidentifier`, con PK física compatible
- `Sucursales.id`: `uniqueidentifier`, con PK física compatible
- `Roles.id`: `uniqueidentifier`, sin PK ni índice `UNIQUE` físico compatible en la auditoría del 2026-07-20

Conclusión:

- la FK `OperadoresPerfil -> Roles(id)` no debe ejecutarse en esta base
- el script O0 de Paquetes A y B debe omitir esa FK hasta que `dbo.Roles` tenga una clave física compatible o exista una autorización específica para corregir esa tabla compartida
- la siguiente decisión obligatoria ya no es de esquema O0 sino de ambiente SQL:
  - ver `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/base-datos-desarrollo-certificacion.md`
  - este bloqueo quedó superado únicamente para Paquetes A y B por autorización expresa del Product Owner el 2026-07-20, sin extenderse a C ni D

## 19.2 Ejecución controlada de Paquetes A y B

Resultado de ejecución real:

- fecha y hora: `2026-07-20 13:29:23`
- tabla de respaldo creada: `dbo.Usuarios_BKP_O0_20260720_132923`
- conteo `Usuarios` antes: `48`
- conteo respaldo: `48`
- placeholder `uid`: `45`
- resultado transaccional final: `COMMIT`

Objetos creados:

- `dbo.OperadoresPerfil`
- `dbo.ListasOperadoresAsignaciones`
- `UX_Usuarios_IdFirebase_Real`

Validación posterior:

- `Usuarios` conservó el mismo conteo y el mismo hash lógico de datos
- `Roles` conservó conteo `116`
- `Sucursales` conservó conteo `134`
- `OperadoresPerfil` quedó con `0` filas
- `ListasOperadoresAsignaciones` quedó con `0` filas
- no se ejecutó `operadores-o0-seed.sql`
- no se ejecutaron Paquetes C y D

## 19.3 Ejecución controlada de Paquete C

Resultado de ejecución real:

- fecha y hora: `2026-07-20 13:04:54`
- tabla de respaldo creada: `dbo.Roles_BKP_OPERADORES_C_20260720_130454`
- resultado transaccional final: `COMMIT`
- empresas activas sembradas: `1`

Modelo real utilizado:

| Función | Tabla real | PK lógica |
|---|---|---|
| roles | `dbo.Roles` | `id` |
| permisos | `dbo.Roles.Permisos` | `Opcion` dentro del JSON |
| menú | `dbo.Roles.Permisos` | `Opcion` dentro del JSON |
| relación rol-permiso | `dbo.Roles.Permisos` | `id` del rol + `Opcion` |
| relación empresa-rol | `dbo.Roles` | `idEmpresa` |
| empresas activas para seed | `dbo.Empresa` | `id` |

Configuración creada:

- permiso exclusivo: `02005000`
- texto visible: `Inspección en campo`
- ruta protegida: `/ContestarLista/RecoleccionesBL26`
- rol base configurable: `Operador Base`
- script de reversa inmediata: `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/operadores-c-down.sql`

Validación posterior:

- `Roles` pasó de `116` a `117` filas
- se insertó `1` rol `Operador Base`
- `02005000` quedó presente `1` vez en `dbo.Roles.Permisos`
- `Usuarios` no cambió
- `OperadoresPerfil` quedó con `0` filas
- `ListasOperadoresAsignaciones` quedó con `0` filas
- no se modificó Firebase
- no se modificó el login

Compatibilidad aplicada en código:

- la autorización de `RecoleccionesBL26` quedó en transición compatible: `02001000 OR 02005000`
- el menú visible acepta ambos permisos sin retirar el legacy
- `RolesPermisos` ya preserva `02005000` al guardar roles
- el acceso directo sin sesión a `/ContestarLista/RecoleccionesBL26` redirige a `/Home`
- la inicialización BL26 responde `accessDenied` sin texto técnico cuando no existe permiso

Validación operativa:

- frontend recompilado sin errores
- backend recompilado sin errores
- frontend reiniciado en `5200` sustituyendo PID `65351` por PID `94867`
- API local se mantuvo intacta en `5127`

Pendiente posterior:

- Paquete D sigue pendiente de autorización y ejecución
- la validación funcional con usuarios que solo tengan `02005000` queda sujeta a QA manual autenticado

## 20. Riesgos

- que `Usuarios.idRol` siga usándose como única fuente para doble perfil;
- que se duplique la sucursal entre usuario y perfil;
- que se siga resolviendo vínculo Firebase solo por correo;
- que se use `02001000` como permiso final de operador;
- que el seed del rol se vuelva dependiente del nombre textual;
- que R3 avance sin congelar `idOperadorPerfil` e `idAsignacion`.

## 21. Autorización exacta

Solicitar autorización concreta para:

### Esquema

- crear `OperadoresPerfil`
- crear `ListasOperadoresAsignaciones`
- crear índices únicos y filtrados propuestos
- crear FKs no destructivas propuestas

### Datos de configuración

- crear plantilla/base de rol operativo por empresa
- crear permiso específico de `Inspección en campo`
- asociar ese permiso a la plantilla/base

### Firebase

- incorporar Admin SDK en backend responsable
- alta administrativa
- suspensión
- revocación

### Código futuro

- servicios de perfil operador
- servicios de asignación
- autorización por perfil funcional
- protección de rutas y proxies

### Lo que permanece intacto

- login actual
- usuarios administrativos actuales
- roles actuales existentes
- `CreadorLista`
- `Legacy`
- `Recolecciones` actuales
- `R3` actual y sus scripts existentes
- históricos existentes
