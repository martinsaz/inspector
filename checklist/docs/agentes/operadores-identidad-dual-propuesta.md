# Operadores — Propuesta de identidad dual Usuario + Operador

Fecha: 2026-07-21

## Alcance de este documento

- Este documento es solo de análisis y propuesta.
- No ejecuta cambios en código, SQL, Firebase ni configuración.
- Parte del estado real actualmente implementado en:
  - `LoginController`
  - `OperadoresController`
  - `ContestarLista`
  - API local de `Operadores`

## Resumen ejecutivo

Hoy el sistema ya permite operar con dos experiencias separadas:

- `Usuario` administrativo
- `Operador` de inspección en campo

Pero no modela una identidad única con capacidades acumulables. La sesión vigente resuelve un solo `accountType` por login y la aplicación se comporta como si la persona fuera exclusivamente una cosa u otra en ese momento.

La recomendación técnica es evolucionar a un modelo de identidad única con capacidades por contexto, manteniendo:

- un solo correo;
- una sola contraseña;
- un solo UID de Firebase;
- una sola verificación de correo;
- funciones acumulables por persona;
- empresa activa controlada;
- estado administrativo y estado operativo independientes.

No se recomienda crear dos cuentas Firebase para la misma persona.

## Estado actual comprobado

### 1. Login

Fuente principal:

- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/LoginController.cs`

Comportamiento real observado:

- el flujo arranca como `Usuario`;
- consulta `Conexiones`, `Usuarios` y `Operadores`;
- primero intenta resolver si el UID autenticado coincide con un nodo en `Operadores`;
- si coincide y el correo también coincide, y el operador está activo y verificado, la sesión queda marcada como:
  - `accountType = Operador`
  - redirección a `/ContestarLista/RecoleccionesBL26`
- si entra por la rama de operador, ya no continúa con la evaluación de `Usuarios`;
- solo si no califica como operador evalúa la identidad administrativa de `Usuarios`.

Conclusión:

- hoy el login no soporta perfil dual real;
- resuelve un solo contexto por sesión;
- la rama `Operador` tiene prioridad sobre `Usuario` cuando ambas pudieran coincidir.

### 2. Sesión

Fuentes principales:

- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/Operadores/OperadoresController.cs`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/ContestarLista/ContestarLista.cs`

Comportamiento real observado:

- la aplicación usa el literal `accountType`;
- `IsOperatorSession()` compara ese valor contra `"Operador"`;
- no existe hoy un modelo de capacidades múltiples dentro de la sesión;
- la sesión selecciona una sola experiencia.

Conclusión:

- la autorización de alto nivel está atada a un literal de sesión, no a un conjunto de funciones.

### 3. Módulo Operadores

Fuente principal:

- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/Operadores/OperadoresController.cs`

Comportamiento real observado:

- si la sesión es de operador, `/Operadores/Index` redirige a `RecoleccionesBL26`;
- las acciones administrativas del módulo quedan bloqueadas para sesiones operativas;
- el módulo administrativo y el módulo operativo no conviven en una misma experiencia.

Conclusión:

- hoy la separación de perfiles es estricta a nivel de navegación y controladores.

### 4. API de Operadores

Fuente principal:

- `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/Controllers/Operadores/OperadoresController.cs`

Comportamiento real observado:

- el alta crea identidad operativa y la enlaza con SQL y RTDB;
- suspensión, reactivación, verificación y recuperación son específicas del operador;
- el acceso operativo depende del estado del operador y de sus sucursales;
- el backend trata al operador como una función separada, no como una capacidad adicional de un usuario administrativo.

Conclusión:

- el backend actual está optimizado para un perfil operativo independiente, no para un perfil dual acumulable.

## Problemas del modelo actual para identidad dual

### 1. Cuenta única, sesión no única

Aunque el sistema puede reutilizar el mismo UID, la sesión solo sabe ser:

- `Usuario`, o
- `Operador`

No puede representar:

- `Usuario con capacidad operativa`
- `Operador con acceso administrativo limitado`

### 2. Prioridad rígida de operador

Si una identidad llega a existir en ambos universos, hoy el login puede tomar la rama de operador y omitir la rama administrativa.

Riesgo:

- la persona no controla con qué experiencia quiere entrar;
- el sistema decide unilateralmente el contexto.

### 3. Empresa activa única por rama

El login arma sesión y empresa en función de la rama que ganó.

Riesgo:

- si en futuro una misma persona tuviera responsabilidades cruzadas o más de un contexto, el modelo actual no lo expresaría limpiamente.

### 4. Menú y permisos acoplados a experiencia cerrada

El operador se redirige fuera del módulo administrativo y el administrativo no carga como operador salvo cambio de sesión.

Riesgo:

- no existe transición controlada entre funciones;
- no hay selector de contexto;
- no hay una identidad base con capacidades.

## Objetivo funcional deseado

Una persona debe poder tener:

- una sola identidad;
- un solo correo;
- una sola contraseña;
- un solo UID de Firebase;
- una sola verificación de correo;
- cero, una o varias capacidades funcionales.

Capacidades mínimas esperadas:

- capacidad administrativa general;
- capacidad operativa de inspección;
- capacidad dual cuando ambas estén autorizadas.

## Alternativas evaluadas

### Alternativa A — Mantener el modelo actual con literales de sesión

Descripción:

- conservar `accountType`;
- seguir resolviendo una sola rama por login;
- permitir que una persona tenga doble alta, pero forzar una experiencia única por sesión.

Ventajas:

- costo bajo;
- mínimo cambio estructural.

Desventajas:

- no resuelve identidad dual real;
- mantiene el acoplamiento actual;
- obliga a priorizar una rama o crear hacks de selección;
- deja ambigüedad sobre empresa, permisos y navegación.

Dictamen:

- no recomendada.

### Alternativa B — Dos cuentas separadas por persona

Descripción:

- una cuenta `Usuario`;
- otra cuenta `Operador`;
- correos distintos o alias distintos.

Ventajas:

- separación simple para la aplicación actual;
- bajo impacto sobre la sesión existente.

Desventajas:

- contradice el objetivo de producto;
- duplica identidad, credenciales y verificación;
- complica soporte, recuperación y auditoría;
- aumenta riesgo de inconsistencia entre perfiles.

Dictamen:

- no recomendada.

### Alternativa C — Identidad única con capacidades funcionales

Descripción:

- una sola identidad base;
- una sola autenticación;
- un solo UID;
- capacidades asociadas a la persona;
- selección de contexto cuando tenga más de una función;
- permisos calculados por capacidad efectiva y empresa activa.

Ventajas:

- cumple con la visión de producto;
- evita duplicación de cuentas;
- separa identidad de función;
- escala mejor a más perfiles futuros;
- permite que una persona sea `Usuario`, `Operador` o ambos.

Desventajas:

- requiere refactor controlado del login y de la sesión;
- exige desacoplar algunos literales actuales;
- requiere definir modelo canónico de capacidades.

Dictamen:

- recomendada.

## Recomendación final

La recomendación es implementar una arquitectura de identidad única con capacidades funcionales acumulables.

### Principios

- una persona = una identidad base;
- una identidad base = un UID de Firebase;
- una identidad puede tener una o más funciones;
- la sesión no debe depender de un único literal como `accountType`;
- la experiencia visible debe resolverse desde capacidades y contexto activo.

## Modelo conceptual recomendado

### Identidad base

Debe conservar:

- identificador interno estable;
- nombres;
- correo principal;
- UID Firebase;
- empresa primaria o empresa de origen;
- estado de la identidad;
- auditoría.

### Capacidades funcionales

Cada identidad puede tener capacidades como:

- `administracion_general`
- `operador_inspeccion`
- futuras capacidades adicionales

Cada capacidad debe poder tener:

- estado propio;
- alcance por empresa;
- alcance por sucursal cuando aplique;
- fecha de alta;
- fecha de suspensión;
- trazabilidad de cambios.

### Contexto activo

La sesión debe guardar:

- identidad;
- empresa activa;
- capacidad activa;
- conjunto de capacidades disponibles.

Si la persona tiene una sola capacidad:

- entra directo.

Si tiene varias:

- el sistema debe permitir elegir experiencia inicial;
- o recordar el último contexto usado.

## Empresa, sucursales y alcances

### Empresa

Recomendación:

- mantener una empresa activa por sesión en la primera versión de identidad dual;
- no mezclar simultáneamente dos empresas en una misma sesión.

### Sucursales

La capacidad operativa debe conservar:

- sus sucursales autorizadas;
- validación independiente de la capacidad administrativa.

Conclusión:

- la persona es única;
- los alcances operativos siguen siendo específicos.

## Estados independientes

Se recomienda separar claramente:

- estado de la identidad base;
- estado de la capacidad operativa;
- estado de la capacidad administrativa.

Ejemplos válidos:

- identidad activa + operador suspendido + usuario activo;
- identidad activa + operador activo + usuario sin capacidad administrativa;
- identidad bloqueada + todas las capacidades inhabilitadas.

Esto evita que suspender la operación en campo destruya innecesariamente la identidad completa de la persona.

## Login recomendado

### Flujo propuesto

1. Firebase autentica una sola identidad.
2. El backend resuelve la identidad base.
3. El backend obtiene las capacidades autorizadas.
4. El backend define:
   - empresa activa;
   - capacidades disponibles;
   - contexto sugerido.
5. Si solo hay una capacidad:
   - redirección directa.
6. Si hay más de una:
   - selector de experiencia.

### Qué debe dejar de pasar

- que una rama opaque a la otra sin decisión del usuario;
- que `Operador` gane por prioridad fija;
- que toda la experiencia dependa de un solo string literal.

## Menú y navegación

### Recomendación

El menú debe construirse por:

- capacidades;
- empresa activa;
- permisos efectivos.

No por:

- literal único de cuenta;
- nombre textual del rol;
- suposición de exclusividad entre usuario y operador.

### Ejemplo esperado

- una persona solo operador ve `Inspección en campo`;
- una persona solo administrativa ve módulos administrativos;
- una persona dual puede:
  - entrar a administración;
  - cambiar a modo operativo;
  - regresar sin reautenticarse, si el diseño de seguridad así lo permite.

## Impacto técnico previsto

### Cambios lógicos necesarios

- refactor del login para devolver capacidades, no una sola etiqueta;
- cambio de sesión para guardar contexto y capacidades;
- autorización por capacidad efectiva;
- transición controlada en menú y redirecciones;
- revisión de controladores que hoy preguntan `IsOperatorSession()`.

### Puntos del código hoy sensibles

- `LoginController`
- `OperadoresController`
- `ContestarLista`
- cualquier controlador que dependa de:
  - `accountType`
  - `ClaimTypes.Role`
  - redirecciones rígidas por perfil

## Riesgos si se ejecutara más adelante

- regresión de login;
- mezcla incorrecta de empresa activa;
- permisos cruzados no deseados;
- pérdida temporal de acceso en módulos que hoy dependen del string `Operador`;
- deuda de migración si se mantiene lógica duplicada por demasiado tiempo.

## Estrategia de migración recomendada

### Fase 1

- no tocar credenciales;
- no duplicar cuentas;
- introducir modelo de capacidades;
- conservar compatibilidad con `accountType` como puente temporal.

### Fase 2

- mover controladores críticos a autorización por capacidad;
- agregar selector de experiencia para perfiles duales.

### Fase 3

- retirar dependencias del literal `accountType`;
- consolidar menús y redirecciones.

## Estrategia de rollback

Si una futura implementación de identidad dual generara problemas, el rollback más seguro sería:

- mantener la identidad base;
- reactivar compatibilidad con `accountType`;
- forzar nuevamente una experiencia única por sesión;
- no tocar Firebase ni duplicar cuentas.

## Decisión propuesta a Product Owner

Se recomienda aprobar esta línea:

- identidad única;
- capacidades funcionales acumulables;
- una sola autenticación;
- un solo correo;
- una sola contraseña;
- una sola verificación;
- contexto activo seleccionable;
- estados administrativos y operativos independientes.

## Estado de ejecución

- propuesta documentada: sí
- cambios implementados: no
- cambios en Firebase: no
- cambios en SQL: no
- cambios en login: no
- cambios en permisos: no

## Conclusión

El sistema actual ya separa bien la experiencia administrativa y la operativa, pero todavía no resuelve identidad dual real. La arquitectura más sana para evolucionar es una identidad única con capacidades funcionales acumulables y contexto activo por sesión, sin crear cuentas duplicadas y sin depender de un literal exclusivo como `accountType`.
