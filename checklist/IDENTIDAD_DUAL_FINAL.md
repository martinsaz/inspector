# IDENTIDAD DUAL FINAL

Fecha de cierre: 2026-07-23

## Arquitectura final

- La identidad dual conserva una sola cuenta de autenticación, un solo correo, una sola contraseña, un solo UID y una sola sesión autenticada.
- La capacidad administrativa y la capacidad operativa se resuelven server-side después del login.
- El modo activo de trabajo se mantiene en la sesión HTTP del portal mediante:
  - `canAdminMode`
  - `canOperateMode`
  - `hasDualModeAccess`
  - `currentWorkMode`
  - `workModeNotice`
- La navegación sigue siendo compatible con el comportamiento histórico:
  - solo administración: entra directo a administración;
  - solo operación: entra directo a operación;
  - identidad dual: entra al último comportamiento resuelto por sesión activa, sin pantalla intermedia;
  - sin capacidades válidas: acceso denegado.

## Decisiones del Product Owner incorporadas

- Se canceló la pantalla de selección de modo.
- La coexistencia Usuario + Operador se conserva.
- No se modificó autenticación.
- No se modificaron permisos.
- No se modificó SQL.
- No se modificó Firebase.
- No se modificó RTDB.
- La preferencia persistente `checkapp_last_work_mode` se retiró en favor de la sesión del portal para evitar obsolescencia entre navegadores o equipos.
- El copy final del menú queda:
  - `Ir a Administración`
  - `Ir a Operación en campo`

## Flujo de navegación

1. El usuario se autentica con su correo y contraseña existentes.
2. El servidor resuelve si puede administrar, operar o ambas.
3. El portal entra al modo activo válido para esa sesión.
4. Si existe doble capacidad, el menú del usuario muestra:
   - indicador visual de modo;
   - modo actual;
   - acción para ir al otro modo.
5. Al cambiar de modo:
   - no se cierra sesión;
   - no se solicita contraseña;
   - no se crea una segunda sesión;
   - el servidor vuelve a validar la capacidad del modo solicitado.

## Resolución de capacidades

### Administración

- usuario administrativo existente;
- empresa válida;
- estatus administrativo vigente;
- rol o permisos válidos.

### Operación

- perfil operador existente;
- perfil operador activo;
- acceso operativo vigente;
- contexto operativo válido para la empresa.

## Modo de trabajo

- El modo activo ya no se persiste en cookie.
- El modo activo vive únicamente durante la sesión del portal.
- Un login limpio sin contexto previo inicia en `Administracion` para identidad dual.
- El cierre de sesión limpia explícitamente las claves de modo para evitar arrastre entre sesiones.

## Compatibilidad

- No se altera el acceso histórico de usuarios solo administrativos.
- No se altera el acceso histórico de usuarios solo operativos.
- No se altera la arquitectura de identidad compartida.
- No se altera la protección server-side de rutas.

## Reglas de seguridad

- El cliente nunca concede permisos por sí mismo.
- El cambio de modo no concede privilegios; solo solicita un contexto.
- El servidor valida cada transición hacia administración u operación.
- El modo guardado en sesión no sustituye la validación de capacidades.

## QA ejecutado

### Validado

- Compilación del frontend MVC:
  - `dotnet build /Users/denissemendiola/dev/CheckList_Original/checklist/checklist.csproj`
  - resultado: `0 errores`
- Sesión limpia creada por Codex en `http://localhost:5200/`.
- Verificación visual de login limpio:
  - carga correcta de la pantalla de acceso;
  - sin preferencia persistente previa;
  - sin pantalla de selección.
- Revisión de integración del cambio de modo:
  - textos finales del menú;
  - microtransición discreta de aproximadamente `220 ms` antes de navegar.

### No reproducido de forma autenticada en esta pasada

- login interactivo de `denisse@checkapp.com.mx` en sesión limpia;
- cambio Administración → Operación;
- cambio Operación → Administración;
- suspensión;
- reactivación.

Motivo:

- no existe en el repositorio, en los adjuntos visibles ni en el flujo instrumentado una credencial reutilizable por Codex;
- no se añadió ningún bypass;
- no se alteró autenticación;
- no se inspeccionaron ni reutilizaron almacenes sensibles del navegador.

## Riesgos cerrados

- preferencia obsoleta entre navegadores o equipos por cookie persistente;
- copy ambiguo de la acción de cambio de modo;
- cambio visual abrupto de modo dentro del menú.

## Riesgos pendientes

- falta la certificación visual autenticada de punta a punta con la cuenta histórica dual en una sesión limpia controlada por Codex;
- la validación funcional de suspensión y reactivación sigue pendiente de una sesión autenticada reproducible sin romper las restricciones de autenticación.

## Archivos modificados en el cierre final

- `/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Shared/_Layout.cshtml`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Utilerias.js`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/IDENTIDAD_DUAL_FINAL.md`
