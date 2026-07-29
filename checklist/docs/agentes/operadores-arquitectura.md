# Operadores — Arquitectura cerrada y decisiones de producto

Fecha de cierre: 2026-07-20

## Corrección de regresión en alta

Fecha de corrección real: 2026-07-21

## Actualización visual del módulo

Fecha de actualización real: 2026-07-21

## Estado estable de verificación

Fecha de decisión real: 2026-07-22

- La acción administrativa `Actualizar verificación` fue retirada de `/Operadores/Index` como decisión temporal de estabilidad y alcance.
- Se conserva el comportamiento estable previo:
  - Firebase Authentication registra la verificación cuando el operador confirma su correo.
  - RTDB se sincroniza durante el login del operador.
  - El listado administrativo refleja el cambio después de ese login.
- No se modificaron la cuenta de servicio existente ni la configuración de Firebase Console para esta reversión.
- No se modificaron:
  - tablas SQL
  - estado operativo
  - alta
  - edición
  - suspensión
  - reactivación
  - recuperación
  - reenvío
  - diseño general aprobado

- `/Operadores/Index` se homologó visualmente con la referencia aprobada de `CreadorListaBL26`.
- No se modificaron:
  - autenticación
  - SQL
  - Firebase
  - reglas de negocio
  - flujos de alta, edición, suspensión, reactivación o recuperación
- La mejora se concentró en:
  - contenedor principal
  - jerarquía visual
  - filtros
  - tabla
  - badges
  - estado vacío
  - modal
  - responsive
- El modal de alta incorporó una guía dinámica de contraseña basada en la política real ya vigente en backend:
  - mínimo 8 caracteres
  - una mayúscula
  - una minúscula
  - un número
  - un carácter especial
- La UI ahora muestra:
  - nivel de seguridad
  - requisitos cumplidos y pendientes
  - coincidencia de confirmación
  - mostrar y ocultar contraseña
  - bloqueo de `Guardar` mientras falten requisitos o datos obligatorios
- Se mantuvo la validación final en backend y los mensajes de negocio aprobados.

- La regresión reportada en `/Operadores/Index` no fue generada por SQL ni por RTDB; la causa exacta fue la creación de identidad en Firebase Authentication para un correo que ya existía previamente en Auth, pero no en las capas locales.
- El caso reproducido con `velazquezvelazquez759@gmail.com` arrojó error de negocio equivalente a `EMAIL_EXISTS` en Firebase Auth y terminaba filtrándose a la UI como `Response status code does not indicate success: 400 (Bad Request).`
- Estado comprobado del intento fallido original:

| Capa | Existe | Estado |
|---|---:|---|
| Firebase Authentication | Sí | Cuenta previa existente en Auth |
| RTDB `Operadores/{uid}` | No | Sin nodo del operador para ese correo |
| SQL `dbo.Operadores` | No | Sin registro local |
| SQL `dbo.OperadoresSucursales` | No | Sin relación de sucursales |

- La corrección aplicada movió las validaciones críticas antes de crear la identidad en Firebase:
  - disponibilidad de correo en SQL;
  - pertenencia de sucursales a la empresa activa;
  - validez de empresa, sesión, correo y contraseña.
- Con este ajuste, la creación solo llama a Firebase Auth cuando la capa local ya confirmó que el alta puede continuar.
- Si una falla ocurre después de crear la identidad remota, la compensación elimina la cuenta recién creada en Firebase para no dejar datos huérfanos.
- Los mensajes visibles al usuario quedaron normalizados a mensajes de negocio en español y ya no exponen HTTP, Firebase, SQL, UID ni excepciones crudas.
- Durante la certificación final apareció una segunda inconsistencia funcional en el alta positiva:
  - el nodo RTDB del nuevo Operador se escribía con `empresa = "UMBRELLA CORP"`;
  - el login del Operador resuelve la empresa comparando contra las claves reales de `Conexiones` (`163`, `164`, etc.);
  - por eso la cuenta podía quedar creada y verificada, pero sin aterrizar correctamente en la ruta operativa.
- La corrección definitiva cambió la escritura de RTDB para resolver la clave real de `Conexiones` usando `idEmpresa` antes de persistir o actualizar `Operadores/{uid}`.
- Con ello, el nodo del operador quedó consistente con el login actual:
  - `empresa = "163"`
  - `emailVerificado = true` tras verificar e iniciar sesión
  - `status = true`
- No fue necesario eliminar datos del correo original fallido ni del operador nuevo de QA; la reparación aplicada fue de consistencia en backend y rescritura controlada del nodo RTDB del operador de prueba.
- No se realizaron cambios en `RecoleccionesBL26`, ni en su JavaScript, ni en su CSS como parte de esta corrección.

### Resultado certificado de la regresión

- Alta positiva por la misma ruta MVC consumida por navegador:
  - mensaje visible: `El Operador fue registrado. Se envió un correo para verificar su cuenta.`
- Duplicado:
  - mensaje visible: `Ya existe una cuenta registrada con este correo.`
- Reenvío de verificación:
  - mensaje visible: `Se envió un nuevo correo de verificación.`
- Recuperación:
  - mensaje visible: `Se envió el correo de recuperación al operador.`
- Suspensión:
  - mensaje visible: `El operador fue suspendido.`
  - login bloqueado: `Tu cuenta de operador está inactiva. Contacta a tu administrador.`
- Reactivación:
  - mensaje visible: `El operador fue reactivado.`
- Verificación y acceso:
  - Firebase confirmó `emailVerified = true`
  - el login respondió `accountType = Operador`
  - la ruta operativa entregada fue `/ContestarLista/RecoleccionesBL26`
  - la carga autenticada de esa ruta respondió `200`

### Archivos tocados en la corrección

- `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/Controllers/Operadores/OperadoresController.cs`
- `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/Utiles/OperatorFirebaseIdentityService.cs`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/Operadores/OperadoresController.cs`

## Actualización de implementación

Fecha de ejecución real: 2026-07-20

- La arquitectura originalmente propuesta en este documento quedó superada por la corrección definitiva solicitada por Product Owner.
- `Operador` ya no depende de `Usuarios`, de selección manual de rol ni del modelo `OperadoresPerfil`.
- La implementación operativa vigente usa entidad independiente `dbo.Operadores` y relación múltiple `dbo.OperadoresSucursales`.
- El acceso administrativo quedó en `/Operadores/Index`, dentro de `Ajustes`, con formulario propio de nombre, apellidos, correo, contraseña y sucursales.
- La empresa activa se resuelve desde la sesión autenticada del administrador; no se captura en pantalla.
- El alta crea identidad propia en Firebase y nodo RTDB `Operadores/{uid}` desde backend.
- El login del operador redirige a `/ContestarLista/RecoleccionesBL26` y la sesión queda marcada como `account_type = Operador`.
- La sesión del operador no entra a `Home` administrativo y al solicitar `/Operadores/Index` es redirigida nuevamente a `RecoleccionesBL26`.
- La suspensión corta el acceso con el mensaje de negocio `Tu cuenta de operador está inactiva. Contacta a tu administrador.`.
- La reactivación restituye el acceso operativo.
- La recuperación de contraseña respondió correctamente con `Se envió el correo de recuperación al operador.`.

## QA manual certificado

- Alta validada en navegador con el operador QA `operador.qa.1784589277701@checkapp.com.mx`.
- Sucursales asignadas en alta:
  - `Africa`
  - `QA Relacion Ubicacion 20260703051746`
- El operador aparece en listado sin mostrar GUIDs ni campos técnicos visibles.
- El flujo anterior con combos `Usuario` y `Rol operativo` ya no aparece en la UI.
- El operador inicia sesión con su propia cuenta Firebase y aterriza en `Inspección en campo`.
- La API local quedó estable en `5127` y el frontend quedó estable en `5200` para QA manual.

## Estado

- Este documento reemplaza la auditoría inicial y queda como propuesta arquitectónica definitiva para V1 de `Operadores`.
- No aprueba cambios de esquema por sí mismo.
- No se modificó código, Firebase, datos, permisos, tablas ni procesos para emitir estas decisiones.
- `R3` e `Inspección en campo` continúan pausados hasta implementar primero la base de `Operadores`.

## 1. Explicación simple

`Operador` debe implementarse como un usuario operativo restringido, autenticado con Firebase, ligado a una sola empresa y controlado desde la administración interna.

La arquitectura actual ya permite reutilizar:

- Firebase Authentication para identidad;
- Firebase Realtime Database para contexto de acceso;
- la tabla SQL `Usuarios` como identidad interna;
- roles/permisos para navegación;
- `ListasProgramacion` como base de asignación.

Lo que todavía no existe de forma suficiente para V1 es:

- un permiso exclusivo para `Inspección en campo`;
- una regla de listas asignadas por operador;
- una solución real de multisucursal;
- una suspensión que corte también sesión activa;
- un CRUD administrativo dedicado.

## 2. Recomendación de alta

### Comparativo

| Criterio | Alta administrativa | Autorregistro | Híbrido |
|---|---|---|---|
| Seguridad | Alta | Baja | Media |
| Control de empresa | Alto | Bajo | Alto |
| Control de sucursal | Alto | Bajo | Medio |
| Cuentas huérfanas | Bajo | Alto | Medio |
| Soporte | Simple | Complejo | Medio |
| Contraseña | Controlada | Variable | Controlada |
| Recuperación | Clara | Clara | Clara |
| Suspensión | Centralizada | Dispersa | Centralizada |
| Auditoría | Alta | Baja | Media |
| Experiencia de puesta en marcha | Media | Alta | Media |
| Complejidad operativa | Media | Alta | Alta |
| Compatibilidad con Firebase actual | Alta | Media | Media |
| Compatibilidad con modelo interno actual | Alta | Baja | Media |

### Dictamen

Recomendación definitiva: `ALTA ADMINISTRATIVA`

Motivos:

- el autorregistro actual usa token de empresa y deja defaults administrativos no compatibles con un operador restringido;
- hoy el sistema crea Firebase y SQL en pasos separados y sin rollback explícito;
- la empresa y la sucursal deben quedar controladas desde el inicio;
- el operador no debe poder nacer sin asignación administrativa clara.

## 3. Identidad del Operador

### Alternativas

| Alternativa | Reutiliza modelo | Ventaja | Riesgo | Recomendación |
|---|---:|---|---|---|
| Reutilizar `Usuarios` tal como está | Sí | Costo bajo | No distingue bien el perfil operativo | Parcial |
| Reutilizar `Usuarios` + rol específico de Operador | Sí | Compatible con login, menú y trazabilidad actuales | Requiere reforzar permisos y asignaciones | Sí |
| Nueva entidad `Operadores` enlazada con `Usuarios` | No completamente | Aísla reglas futuras | Duplica identidad y complica autenticación | No V1 |
| Usar solo puesto o departamento para distinguir operador | Sí | Sin cambio estructural fuerte | No sirve como control de acceso formal | No |

### Dictamen

El Operador debe ser:

- un registro reutilizado de `Usuarios`;
- identificado por `idRol` específico de operador;
- con `idFirebase` obligatorio y real;
- con correo único;
- ligado a una sola `idEmpresa`;
- con estatus operativo controlado;
- con histórico preservado en el mismo modelo base.

### Identidad mínima definitiva

- identificador interno: `Usuarios.Id`
- UID Firebase: `Usuarios.IdFirebase`
- correo: `CorreoInstitucional` o `CorreoPersonal`, usando uno principal operativo
- empresa: `Usuarios.IdEmpresa`
- tipo: derivado de rol, no de tabla nueva
- rol: nuevo rol de negocio `Operador`
- puesto: opcional, no debe ser el mecanismo primario de autorización
- estatus: SQL + Firebase RTDB, con bloqueo real centrado en RTDB en V1
- relación con histórico: mismo `Usuarios.Id`
- relación con inspecciones futuras: el operador debe ser referencia estable en programación, ejecución y auditoría

## 4. Campos V1

### Clasificación

| Campo | Obligatorio V1 | Editable | Fuente | Justificación |
|---|---:|---:|---|---|
| Nombre | Sí | Sí | Admin | Identidad visible |
| Apellido paterno | Sí | Sí | Admin | Identidad visible |
| Apellido materno | Sí | Sí | Admin | Identidad visible |
| Nombre completo derivado | Sí | No | Sistema | Evita doble captura |
| Correo | Sí | Sí | Admin | Login y recuperación |
| Contraseña inicial | Sí | No directa | Sistema | Alta segura |
| Empresa | Sí | No en la ficha | Contexto administrativo | Aislamiento tenant |
| Sucursal principal | Sí | Sí | Admin | Compatibilidad con modelo actual |
| Sucursales autorizadas | No en V1 simple | Sí si se aprueba multisucursal | Admin | Solo si se autoriza tabla puente |
| Tipo de usuario / Rol | Sí | Sí controlado | Sistema/Admin | Seguridad y menú |
| Estatus | Sí | Sí | Admin | Suspensión / reactivación |
| Teléfono | No | Sí | Admin | Operación |
| Fecha de alta | Sí | No | Sistema | Auditoría |
| Último acceso | No al alta | No manual | Sistema | Auditoría operativa |
| Observaciones | No | Sí | Admin | Soporte |

### Obligatorio

- nombre
- apellido paterno
- apellido materno
- correo
- empresa
- sucursal principal
- rol operador
- estatus
- fecha de alta
- `idFirebase`

### Opcional

- teléfono
- observaciones
- sucursales autorizadas adicionales, solo si se aprueba multisucursal
- último acceso

### No recomendado en V1

- tabla nueva de operadores
- selección de empresa por el propio operador
- contraseña guardada en SQL
- contraseña guardada en RTDB
- múltiples perfiles por una misma cuenta sin política clara

## 5. Creación Firebase

### Respuestas directas

1. ¿Existe Firebase Admin SDK disponible en algún backend?
   - No se encontró integrado ni en el frontend MVC ni en `checklistWs`.
2. ¿Puede incorporarse de forma compatible?
   - Sí, en backend, de forma compatible y preferible frente a crear cuentas desde frontend.
3. ¿Es seguro que el frontend cree cuentas?
   - No como estrategia objetivo de V1.
4. ¿Quién genera la contraseña?
   - El backend administrativo.
5. ¿Se usa contraseña temporal o enlace de activación?
   - Recomendación: contraseña temporal + flujo inmediato de recuperación/cambio.
6. ¿Cómo se recupera contraseña?
   - Con el mecanismo ya existente de reseteo por correo en Firebase Authentication.
7. ¿Qué rollback se ejecuta si falla SQL?
   - Si Firebase ya creó identidad, se debe eliminar esa identidad y su nodo RTDB.
8. ¿Qué rollback se ejecuta si falla Firebase?
   - No se debe insertar SQL ni relaciones.
9. ¿Cómo se evita un correo duplicado?
   - Validación previa en SQL y Firebase antes de crear.
10. ¿Cómo se vincula el UID con SQL?
   - Guardando el UID real en `Usuarios.IdFirebase`.

### Paso recomendado

| Paso | Responsable | Confirmación | Compensación si falla |
|---|---|---|---|
| Validar correo, empresa y rol | Backend | Correo libre y datos válidos | No continúa |
| Crear identidad Firebase | Backend | UID creado | Si luego falla SQL, eliminar UID |
| Crear / actualizar `Usuarios/{uid}` en RTDB | Backend | Nodo consistente | Si falla, eliminar UID y abortar |
| Crear usuario SQL | Backend | `Usuarios.Id` persistido | Si falla, borrar UID y RTDB |
| Crear relaciones adicionales autorizadas | Backend | Relaciones completas | Revertir lo creado del alta |
| Enviar contraseña temporal / recuperación | Backend | Correo enviado | Reintento administrativo, sin duplicar identidad |

### Estrategia definitiva

- La creación del Operador debe ejecutarse desde backend administrativo.
- No se recomienda seguir usando creación de cuentas desde frontend como estrategia de V1.
- Se recomienda autorizar integración de Firebase Admin SDK en backend para alta, deshabilitación y revocación de sesiones.

## 6. Suspensión

### Flujo definitivo

| Capa | Suspender | Reactivar | Validación |
|---|---|---|---|
| Firebase Authentication | Deshabilitar cuenta si se autoriza Admin SDK | Habilitar cuenta | Evita nuevos logins |
| Firebase RTDB `Usuarios/{uid}.status` | `false` | `true` | Mantiene compatibilidad con login actual |
| SQL `Usuarios.Estatus` | `false` | `true` | Trazabilidad interna y filtros administrativos |
| Tokens / sesiones | Revocar tokens / invalidar sesión activa | Permitir nueva sesión | Corta uso posterior |
| Menú | Sin acceso al módulo | Acceso restaurado según rol | Navegación consistente |
| Asignaciones | Se conservan, pero quedan inactivas operativamente | Se reutilizan si siguen vigentes | No perder histórico |
| Históricos | No se eliminan | No aplica | Auditoría intacta |

### Decisiones

- No basta cambiar solo `status`.
- Sí debe deshabilitarse Firebase Auth si se autoriza Admin SDK.
- Sí deben revocarse tokens.
- La sesión ya iniciada debe bloquearse en la siguiente validación protegida del servidor y, de preferencia, con revocación inmediata.
- La API futura debe validar en cada operación:
  - empresa
  - rol operador o rol autorizado
  - estatus activo
  - sucursal autorizada
  - asignación de lista vigente
- Las inspecciones históricas deben conservarse.
- Solo administradores autorizados deben poder suspender y reactivar.
- La acción debe registrarse con:
  - quién suspendió o reactivó
  - fecha/hora
  - motivo

No se recomienda eliminación física.

## 7. Multisucursal

### Alternativas

| Alternativa | Compatibilidad | Cambio de esquema | Riesgo | Recomendación |
|---|---|---:|---|---|
| Usar solo `Usuarios.IdSucursal` | Alta | No | No soporta multisucursal real | Sí para V1 simple |
| Reutilizar programación o permisos como pseudo-multisucursal | Baja | No | Ambiguo y frágil | No |
| Tabla puente usuario-sucursal | Alta | Sí | Requiere diseño y QA | Sí para V2 o V1 ampliada |
| Reutilizar puesto `Supervisor` | Media | No | Mezcla semánticas | No |

### Dictamen

- V1 recomendada: una sola sucursal por operador.
- Si el Product Owner exige multisucursal desde el inicio, la solución correcta es tabla puente.

### Propuesta conceptual si se autoriza tabla puente

- nombre conceptual: `UsuariosSucursales`
- campos mínimos:
  - `Id`
  - `IdUsuario`
  - `IdSucursal`
  - `Activo`
  - `FechaAlta`
  - `FechaBaja`
  - `CreadoPor`
  - `ActualizadoPor`
- índices:
  - único por `IdUsuario + IdSucursal`
  - índice por `IdSucursal + Activo`
- estatus:
  - `Activo` lógico
- auditoría:
  - alta, baja, reactivación, usuario administrador
- compatibilidad:
  - `Usuarios.IdSucursal` debe conservarse como sucursal principal o por compatibilidad legacy

## 8. Multiempresa

### Dictamen explícito

Recomendación: `EXCLUIR DE V1`

Motivos:

- el login actual resuelve una sola empresa por sesión;
- el contexto tenant actual no está diseñado para selección múltiple de empresa por un mismo UID;
- mezclar multisucursal con multiempresa aumentaría riesgo en autenticación, claims, permisos y listas;
- no es necesario para liberar V1.

Si se quiere proteger futuro:

- preparar conceptualmente el modelo, pero no habilitarlo en V1.

## 9. Asignación de listas

### Modelos evaluados

| Modelo | Ventaja | Riesgo | Soporte actual | Recomendación |
|---|---|---|---|---|
| Asignación por operador | Máximo control | Más carga administrativa | Parcial por `ListasProgramacion.idUsuario` | Sí |
| Asignación por sucursal | Simple para operación | Puede abrir listas a operadores no deseados | Parcial por sucursal y listas ejecutables | No como único modelo |
| Modelo mixto | Flexible | Más complejo | No completo hoy | Futuro |

### Dictamen

La recomendación definitiva para V1 es:

- asignación por operador;
- con lista, sucursal y vigencia;
- reutilizando `ListasProgramacion` como base, ajustada si hace falta después de autorización.

### Qué debe filtrar la futura API

- empresa del operador
- rol/estatus activo
- operador asignado
- sucursal autorizada
- vigencia de la programación
- estado de la programación
- lista activa y ejecutable
- cancelación lógica

## 10. Menú y seguridad

### Identificación

- El operador debe identificarse por rol específico.
- `02001000` no debe seguir siendo el permiso final de operación para V1 de Operadores.

### Recomendación

- crear un permiso específico para `Inspección en campo` antes de liberar Operadores;
- mantener además control server-side por rol y estatus.

### Reglas

| Control | Regla frontend | Regla servidor/API |
|---|---|---|
| Menú visible | Mostrar solo `Inspección en campo` | Entregar menú restringido según rol |
| Ruta inicial | Redirigir a `Inspección en campo` | Validar rol y estatus al entrar |
| Rutas prohibidas | No mostrarlas | Responder sin acceso si escribe URL manual |
| Pérdida de estatus en sesión | Mostrar salida segura | Cortar acceso en siguientes validaciones |

### Dictamen sobre URL manual

Si el operador escribe una URL manualmente:

- no debe bastar con ocultar menú;
- el servidor debe negar acceso.

## 11. CRUD funcional

### Alcance V1

| Acción | Regla de negocio | Firebase | SQL | Auditoría |
|---|---|---|---|---|
| Listado | Ver solo operadores de la empresa | No directo | Sí | Sí |
| Alta | Crear operador activo o inactivo según política | Crear identidad y RTDB | Crear `Usuarios` y relaciones | Sí |
| Edición | Permitir actualización controlada | Reflejar cambios relevantes | Actualizar usuario | Sí |
| Sucursales | Una sola en V1 simple | No directo | `IdSucursal` | Sí |
| Suspender | Bloqueo real sin borrar histórico | Deshabilitar / RTDB false | `Estatus=false` | Sí |
| Reactivar | Restaurar acceso controlado | Habilitar / RTDB true | `Estatus=true` | Sí |
| Contraseña | No editar manualmente en ficha | Recuperación / reseteo | No almacenar | Sí |

### Listado recomendado

Columnas:

- nombre completo
- correo
- empresa
- sucursal principal
- rol
- estatus
- último acceso
- fecha de alta

### Alta recomendada

Pasos:

1. Captura administrativa
2. Validación de correo
3. Creación backend
4. Asignación de rol
5. Asignación de sucursal
6. Activación inicial
7. Envío de acceso

### Edición recomendada

Campos editables:

- nombre
- apellidos
- correo, con validación estricta y migración controlada
- sucursal principal
- rol permitido
- estatus
- teléfono
- observaciones

No incluir eliminación física.

## 12. Responsable

### Decisión recomendada

En V1:

- el operador autenticado debe ser automáticamente el responsable operativo de la ejecución.

Excepción futura:

- si el negocio requiere ejecutar para otra persona, eso debe resolverse por programación explícita y no por selector libre abierto.

Motivo:

- simplifica trazabilidad;
- elimina ambigüedad;
- reduce errores de captura;
- encaja con menú restringido.

## 13. Impacto en Inspección en campo

| Elemento actual | Operador una sucursal | Operador multisucursal |
|---|---|---|
| Lista | Mostrar solo asignadas al operador | Mostrar solo asignadas al operador y sucursal |
| Sucursal | No mostrar selector | Mostrar selector restringido |
| Responsable | Operador actual automático | Operador actual automático |
| Empresa | No seleccionable | No seleccionable |
| Menú | Solo `Inspección en campo` | Solo `Inspección en campo` |
| Navegación | Ruta directa de operación | Ruta directa de operación |

## 14. Propuesta visual

### Regla general

- antes de comenzar, el contexto puede verse expandido;
- después de comenzar, ese bloque debe colapsarse automáticamente y dejar un resumen compacto fijo.

### Solución recomendada para contexto

Recomendación definitiva: `tarjeta resumida compacta`

Debe conservar:

- lista
- sucursal
- operador
- ubicación
- avance

### Acomodo por formato

| Bloque | Desktop | Tablet horizontal | Tablet vertical | Móvil |
|---|---|---|---|---|
| Contexto previo | Tarjeta expandida superior | Tarjeta expandida superior | Tarjeta expandida | Tarjeta expandida simple |
| Contexto en captura | Barra/tarjeta compacta fija | Tarjeta compacta fija | Tarjeta compacta colapsable | Tarjeta compacta colapsable |
| Ruta rápida | Visible y colapsable | Visible y colapsable | Cerrada por defecto | Cerrada por defecto |
| Cuestionario | Protagonista central | Protagonista central | Protagonista | Protagonista absoluto |
| Vista previa lateral | Sí | Sí limitada | Mejor colapsable | Integrada abajo o en drawer |

### Wireflow textual

#### Desktop 1440

1. Login
2. Entrada directa a `Inspección en campo`
3. Tarjeta de contexto
4. Inicio
5. Contexto compacto fijo
6. Cuestionario por secciones al centro
7. Ruta rápida lateral colapsable

#### Tablet horizontal

1. Login
2. Pantalla de operación
3. Tarjeta inicial
4. Inicio
5. Contexto resumido arriba
6. Cuestionario principal
7. Ruta rápida opcional

#### Tablet vertical

1. Login
2. Contexto inicial expandido
3. Inicio
4. Tarjeta compacta superior
5. Cuestionario
6. Ruta rápida cerrada por defecto

#### Móvil 320-480

1. Login
2. Tarjeta inicial simple
3. Botón de comenzar
4. Tarjeta compacta colapsable
5. Una pregunta por pantalla
6. Ruta rápida cerrada por defecto
7. Navegación siguiente / anterior

## 15. Cambios de modelo

| Cambio | Obligatorio | Alternativa reutilizable | Impacto |
|---|---:|---|---|
| Rol `Operador` | Sí | No reutilizar `Supervisor` o `Puesto` | Bajo |
| Guardar UID real en `Usuarios.IdFirebase` | Sí | No | Medio |
| Relación usuario-sucursal múltiple | No en V1 simple | Usar `IdSucursal` única | Medio |
| Asignación lista-operador | Sí | Reutilizar base de `ListasProgramacion` | Medio |
| Auditoría de suspensión | Sí | Parcial con logs manuales | Medio |
| Último acceso | Recomendado | Solo Firebase token timestamp no basta | Bajo |
| Estados operativos claros | Sí | No dejar solo `status` y `Estatus` ambiguos | Medio |

## 16. Fases

| Fase | Entregable | Dependencia | Cambio de esquema |
|---|---|---|---:|
| 1 | Modelo e identidad definitiva | Aprobación PO | No inicial |
| 2 | Alta/suspensión Firebase segura | Autorización de backend y SDK | No inicial |
| 3 | CRUD administrativo base | Fases 1 y 2 | No si V1 simple |
| 4 | Sucursal simple o multisucursal | Fase 3 | Sí si hay tabla puente |
| 5 | Menú y seguridad server-side | Fases 1 y 3 | No |
| 6 | Asignación de listas por operador | Fases 1 y 3 | Posible según ajuste de programación |
| 7 | Integración con Inspección en campo | Fases 4, 5 y 6 | No necesariamente |
| 8 | Reorganización responsive | Fase 7 | No |
| 9 | Reanudación de R3 | Fases 1 a 8 cerradas | Posible según persistencia aprobada |

## 17. Riesgos

- mantener `02001000` como permiso final abriría acceso insuficientemente segmentado;
- usar autorregistro generaría cuentas mal vinculadas;
- mezclar multisucursal y multiempresa en V1 aumentaría complejidad sin necesidad;
- no revocar sesiones activas dejaría operadores suspendidos con acceso temporal;
- no guardar correctamente `IdFirebase` mantendría débil la sincronización entre Firebase y SQL;
- reanudar R3 antes de asignación real de listas y sucursales produciría una operación incompleta.

## 18. Decisiones PO

### Recomendación de Codex

- alta: administrativa
- identidad: `Usuarios` reutilizado con rol específico `Operador`
- Firebase: creación desde backend administrativo, no desde frontend
- sucursales: una sola en V1; multisucursal solo con tabla puente autorizada
- multiempresa: excluir de V1
- asignaciones: por operador, reutilizando base de programación
- menú: exclusivo de `Inspección en campo`
- suspensión: SQL + RTDB + deshabilitación/revocación en Firebase si se autoriza Admin SDK
- responsable: el operador autenticado
- interfaz: contexto compacto y cuestionario protagonista

### Autorizaciones requeridas

- tablas:
  - autorización específica si se aprueba una tabla puente `UsuariosSucursales`
  - autorización específica si se ajusta o amplía programación para asignación por operador
- columnas:
  - autorización específica si `Usuarios.IdFirebase` requiere saneamiento o endurecimiento obligatorio
  - autorización específica si se agrega `UltimoAcceso`
  - autorización específica si se agrega `MotivoSuspension` o trazabilidad equivalente
- relaciones:
  - autorización específica para relación usuario-sucursal múltiple
  - autorización específica para relación explícita lista-operador si `ListasProgramacion` no basta
- permisos:
  - autorización específica para crear permiso exclusivo de `Inspección en campo`
  - autorización específica para asociarlo al rol `Operador`
- Firebase Admin SDK:
  - autorización específica para incorporarlo al backend que administrará alta, deshabilitación y revocación
- cambios de autenticación:
  - autorización específica para deshabilitar cuentas Firebase Auth
  - autorización específica para revocar tokens / sesiones activas
  - autorización específica para redirigir al operador a una ruta inicial exclusiva tras login

## 19. Validación de identidad, multiempresa y rol

### Alcance de esta validación

- Esta sección corrige y refina únicamente tres decisiones que el Product Owner no autorizó cerrar todavía en la propuesta anterior:
  - reutilizar directamente `Usuarios`;
  - excluir multiempresa sin medir impacto;
  - crear un rol fijo `Operador`.
- Las conclusiones siguientes no deben interpretarse como aprobación del Product Owner.
- Sí representan la recomendación única de Codex con base en el modelo actual y su compatibilidad futura.

### 19.1 Explicación simple

La validación dirigida confirma que:

- `Usuarios` ya funciona como identidad general del sistema y no solo como registro administrativo;
- el login, la empresa activa, la sesión y el menú actual están diseñados para una sola empresa por sesión;
- los roles son por empresa, configurables y editables, por lo que el sistema no debe reconocer a un Operador por el nombre literal de un rol.

La recomendación corregida es:

- usar `Usuarios` como identidad base compartida;
- agregar un perfil funcional separado para Operador;
- mantener V1 en empresa única por sesión;
- dejar preparado el modelo para multiempresa futura;
- identificar al Operador por perfil funcional, no por texto de rol;
- permitir que el rol siga siendo configurable por empresa.

### 19.2 Identidad actual

#### Respuestas

1. `Usuarios` representa una identidad general, no exclusivamente administrativa.
2. Sí hay evidencia de perfiles operativos:
   - `Supervisor` existe como puesto reservado;
   - la API de sucursales le da comportamiento especial;
   - el autorregistro crea usuarios con puesto `Administrador` o `Supervisor`.
3. Sí hay registros que pueden existir sin un uso directo de módulos administrativos, porque el login y la operación básica dependen de `Usuarios`, correo, empresa, sucursal, rol y Firebase.
4. El nombre `Usuario` es técnico, no funcional.
5. Si se reutiliza directamente para Operador, se mezclarían reglas administrativas, operativas, de reporteo y de CRUD en un mismo listado.
6. Sobran o resultan ambiguos para un operador:
   - `IdDepartamento`
   - `IdPuesto` como identificador funcional principal
   - `FechaNacimiento`
   - algunos campos de contacto duplicados
   Faltaría una capa funcional explícita que diferencie al operador sin depender del rol ni del nombre del puesto.
7. Sí existe histórico y relación estructural suficiente para no desechar `Usuarios`:
   - roles
   - sucursal
   - programación
   - referencias operativas por usuario

#### Evidencia

| Evidencia | Resultado | Impacto para Operador |
|---|---|---|
| `Models/Usuario/Usuario.cs` y `UsuarioWeb.cs` | `Usuarios` contiene identidad, correo, sucursal, empresa, rol, Firebase y estatus | Sirve como identidad base |
| `LoginController.Ingreso` | Login consulta Firebase y luego arma claims con empresa, rol y sesión | Operador debe conservar este flujo base |
| `UsuarioController` frontend y backend | CRUD actual usa `Usuarios` como entidad general | Reutilización directa sin separación generaría confusión funcional |
| `SucursalController.ObtenerSucursalesPorUsuario` | El sistema ya da comportamiento especial por rol/puesto (`SuperAdmin`, `Supervisor`) | El sistema ya mezcla identidad general con reglas operativas |
| `LoginController.Registraru` | Autorregistro crea usuario SQL interno con sucursal, puesto y rol | `Usuarios` no es solo para administradores |

### 19.3 Alternativas de identidad

| Alternativa | Ventajas | Desventajas | Cambio de esquema | Compatibilidad | Riesgo |
|---|---|---|---:|---:|---|
| A — Reutilizar `Usuarios` directamente | Menor cambio inicial | Mezcla identidad, perfil funcional y CRUD; confunde reportes y navegación | Bajo | Alta | Medio |
| B — Usuario base + perfil Operador | Conserva login actual, separa reglas operativas, prepara multiempresa futura | Requiere una capa adicional de perfil | Medio | Alta | Bajo |
| C — Entidad Operador independiente | Aislamiento conceptual total | Duplica identidad, complica login, claims e históricos | Alto | Baja | Alto |
| D — Identidad externa común con perfiles separados | Escalable a futuro | Sobrediseño para el modelo actual | Alto | Media | Alto |

#### Recomendación única

Recomendación: `Alternativa B — Usuario base + perfil Operador`

Motivos:

- reutiliza la identidad ya existente y su trazabilidad;
- evita que el CRUD actual de usuarios administrativos se vuelva ambiguo;
- desacopla la identidad funcional del operador del nombre del rol;
- deja una ruta limpia para evolucionar a multiempresa en el futuro.

### 19.4 Separación Usuario–Operador

| Caso | Comportamiento recomendado |
|---|---|
| Pantallas | Sí, pantallas separadas |
| CRUD de Operadores | Debe mostrar únicamente operadores |
| CRUD actual de Usuarios | Debe poder excluir operadores por defecto o mostrarlos filtrados como identidad general, no como administración operativa |
| Exclusión mutua | Deben separarse visualmente, aunque compartan identidad base |
| Reportes | Deben identificar actor funcional y actor de identidad |
| Nombre funcional | `Usuario administrativo` y `Operador` |
| Persona Administrador y Operador | Sí, puede tener ambos perfiles |
| Dos perfiles con mismo correo | Sí, si la identidad base lo soporta y la relación funcional lo distingue |
| Inicio de sesión con ambos perfiles | Recomendado: elegir contexto o experiencia después del login, no dos cuentas obligatorias |
| Derivación del perfil | Del perfil funcional, no del nombre del rol |

### 19.5 Empresa actual

#### Respuestas

1. Hoy una cuenta Firebase pertenece a una sola empresa por sesión.
2. `Usuarios/{uid}` admite una sola empresa activa observable en el flujo actual.
3. El login espera una sola conexión.
4. El token de alta está ligado a empresa y la conexión activa también.
5. El frontend asume empresa única en:
   - `sessionStorage`
   - `HttpContext.Session`
   - construcción del menú
   - rutas BL26
6. La API asume empresa única en:
   - `idEmpresa`
   - `cadena`
   - resolución de roles
   - catálogos
   - listas
   - sucursales
7. Si se devolviera más de una empresa, el flujo actual no sabría:
   - qué `idEmpresa` usar;
   - qué `cadena` usar;
   - qué rol resolver;
   - qué menú construir.
8. El sistema actual favorece en la práctica una cuenta por empresa o una sola empresa por cuenta activa.

#### Evidencia

| Componente | Asume una empresa | Impacto de multiempresa |
|---|---:|---|
| `Usuarios/{uid}.empresa` | Sí | No admite selección múltiple actual |
| `Conexiones/{empresa}` | Sí | Resuelve una conexión por vez |
| Claims y sesión web | Sí | Habría que cambiar bootstrap de sesión |
| `HomeController.BuildMenu` | Sí | Necesitaría empresa activa previa |
| Proxies BL26 | Sí | Tendrían que resolver empresa seleccionada |
| API legacy por `idEmpresa` + `cadena` | Sí | Requiere contexto tenant explícito por solicitud |

### 19.6 Alternativas multiempresa

| Alternativa | Cambia login actual | Riesgo | Complejidad | Evolución |
|---|---:|---|---|---|
| A — Una cuenta Firebase por empresa | No | Bajo | Media | Baja |
| B — Una cuenta Firebase, varias empresas | Sí | Alto | Alta | Alta |
| C — Empresa principal + accesos adicionales | Sí | Alto | Alta | Media |
| D — V1 empresa única, modelo preparado para evolución | No | Bajo | Media | Alta |

#### Recomendación única

Recomendación: `Alternativa D — V1 empresa única, modelo preparado para evolución`

Esto significa:

- qué se implementará en V1:
  - una empresa activa por sesión;
  - sin selector de empresa;
  - sin cambiar login actual.
- qué quedará preparado:
  - perfil funcional separado de la identidad base;
  - posibilidad de asociar más de una empresa a futuro sin rediseñar el concepto de operador.
- qué no se hará:
  - multiempresa operativa en V1;
  - elección de empresa después del login;
  - claims multiempresa.
- cómo evitar que V1 bloquee el futuro:
  - no amarrar Operador al rol literal;
  - no amarrar Operador a una tabla exclusiva sin identidad compartida;
  - no usar nombre de rol como clave funcional.

### 19.7 Impacto multiempresa

| Elemento | Empresa única V1 | Evolución multiempresa |
|---|---|---|
| Identidad Firebase | Una identidad operativa activa | Una identidad con varios perfiles por empresa |
| Perfiles | Un perfil operativo en una empresa activa | Perfiles por empresa |
| Empresas disponibles | Una | Varias autorizadas |
| Rol por empresa | Uno activo | Uno o más por empresa |
| Sucursales por empresa | Solo de la empresa activa | Separadas por empresa |
| Listas asignadas por empresa | Solo de la empresa activa | Filtradas por empresa seleccionada |
| Pantalla inicial | Entra directo a su experiencia | Debe elegir empresa si tiene más de una |
| Cambio de empresa | No existe | Requiere cambio explícito de contexto |
| Sesión | Una empresa por sesión | Empresa activa dentro de una sesión |
| Suspensión por empresa | No diferenciada | Debe soportarse por empresa |
| Suspensión global | Sí, deshabilitando identidad completa | Debe coexistir con suspensión por empresa |
| Históricos | De la empresa activa | Deben preservarse por empresa |
| Inspecciones abiertas | Una lógica actual | Deben quedar separadas por empresa |

### 19.8 Roles actuales

#### Respuestas

1. `SuperAdmin` no es global del sistema; se maneja por empresa.
2. Sí, se crea automáticamente al registrar una empresa.
3. Sí puede modificarse a nivel de tabla, pero el frontend protege parcialmente sus permisos.
4. Sí, cada empresa tiene sus propios roles.
5. Sí, el administrador puede crear roles.
6. Sí, el menú depende directamente del rol y sus permisos serializados.
7. El sistema identifica tipos funcionales principalmente por rol y, en algunos casos, por puesto.
8. Sí, pueden existir roles con el mismo nombre en distintas empresas porque la consulta es por `idEmpresa`.
9. Si el administrador llama al rol de otra forma, el sistema no tendría una identidad funcional estable para Operador si dependiera del texto.

#### Evidencia

| Regla actual | Evidencia | Impacto para Operador |
|---|---|---|
| Roles por empresa | `RolesController.GetRoles/GetComboRoles` filtran por `idEmpresa` | Operador no debe depender de un rol global |
| `SuperAdmin` automático | `LoginController.Registrare` crea `SuperAdmin` | Ya existe precedente de rol semilla por empresa |
| Edición de roles | `RolesController.Guardar` inserta/actualiza | Los nombres son configurables |
| Menú por permisos del rol | `HomeController.BuildMenu` y `Utilerias.GetOpcion` | Operador necesita una marca funcional adicional |
| Protección parcial de `SuperAdmin` | `RolesPermisos.js` impide cambiar sus permisos en UI | La protección actual es parcial y orientada a frontend |

### 19.9 Alternativas de identificación

| Alternativa | Ventaja | Riesgo | Reutilización | Recomendación |
|---|---|---|---:|---|
| A — Rol fijo | Simple de leer | Rigidez y dependencia del nombre/semilla | Alta | Parcial |
| B — Rol configurable | Flexible | El sistema no sabría cuál es operador sin marca adicional | Alta | No sola |
| C — Tipo funcional Operador + rol configurable | Separa identidad funcional de permisos | Requiere capa adicional | Alta | Sí |
| D — Permiso especial | Útil para menú/rutas | No basta para identidad funcional completa | Media | Complementaria |

#### Recomendación única

Recomendación: `Alternativa C — Tipo funcional Operador + rol configurable por empresa`

### 19.10 Rol predeterminado

#### Modelos

| Modelo | Ventaja | Riesgo | Recomendación |
|---|---|---|---|
| Rol completamente protegido | Máxima consistencia | Poco flexible | No |
| Rol base configurable | Mantiene identidad funcional y permite ampliar permisos | Requiere reglas de protección | Sí |
| Plantilla de rol | Flexible por empresa | Puede divergir demasiado | Parcial |

#### Dictamen

Si se decide sembrar un rol inicial para operador, la recomendación es:

- `rol base configurable por empresa`;
- no puede eliminarse mientras existan operadores activos asociados;
- puede ampliarse en permisos controlados;
- no debe ser la única fuente de identidad funcional.

### 19.11 Rol creado por administrador

#### Respuestas

1. El sistema no debería saber que un rol es de Operador por el nombre.
2. No debe depender del texto literal.
3. Si se renombra, la identidad funcional debe permanecer intacta.
4. Si crea dos roles similares, la identidad funcional no debe duplicarse por texto.
5. El menú debe limitarse por permisos del rol activo más la marca funcional del perfil.
6. La API debe validar perfil funcional + permisos + empresa + estatus.
7. Una configuración incompleta se evita con una relación explícita entre perfil funcional y rol.
8. Si todo dependiera del administrador, el soporte sería alto y frágil.

#### Conclusión

- No se recomienda detectar Operador por el texto del rol.

### 19.12 Modelo combinado

| Capa | Responsabilidad |
|---|---|
| Identidad | `Usuarios` como persona base, correo, Firebase, empresa activa y trazabilidad |
| Perfil funcional | Determina si la persona puede operar como `Operador` |
| Rol | Define permisos por empresa |
| Permisos | Construyen menú y acceso funcional |
| Menú | Se deriva de permisos, pero condicionado por el perfil funcional |
| API | Debe reconocer operador por perfil funcional y no por nombre de rol |

#### Comparación con rol fijo

- mejor que rol fijo porque:
  - tolera renombrado;
  - tolera varias empresas futuras;
  - evita acoplar identidad funcional a una semilla exacta.

### 19.13 Casos funcionales

| Caso | Solución recomendada |
|---|---|
| Administrador únicamente | Ve módulos administrativos |
| Operador únicamente | Ve `Inspección en campo` |
| Administrador y Operador | Misma identidad base, con elección de experiencia o contexto después del login |
| Operador de dos empresas | No en V1; en evolución futura deberá elegir empresa activa |
| Operador suspendido en una empresa | En evolución futura, podría seguir activo en otra si la relación es por empresa |
| Rol Operador renombrado | La identidad funcional no debe perderse |

### 19.14 Impacto actual

| Componente | Sin cambio | Cambio futuro | Riesgo |
|---|---|---|---|
| Login | Sí en V1 | Sí si se habilita multiempresa | Medio |
| Firebase | Sí en V1 | Sí para soporte más fino de perfiles | Medio |
| Sesión | Sí en V1 | Sí si hay empresa seleccionable | Medio |
| Claims | Sí en V1 | Sí para multiempresa/perfil | Medio |
| Menú | No completo | Debe condicionarse por perfil funcional | Medio |
| Permisos | Sí como base | Deben complementarse con perfil funcional | Bajo |
| Usuarios actuales | Sí | Solo filtrado y separación visual | Bajo |
| Roles actuales | Sí | Sin depender del nombre del rol | Bajo |
| CreadorLista | Sí | Sin cambios por esta decisión | Bajo |
| Inspección en campo | No | Debe reconocer operador por perfil funcional | Medio |
| Asignaciones | No | Deben quedar atadas a operador base | Medio |
| R3 | Sí pausado | Requiere esta base primero | Bajo |
| Reportes | Sí | Deben distinguir perfil funcional | Medio |
| Históricos | Sí | Deben seguir colgando de identidad base | Bajo |

### 19.15 Propuesta única

- identidad:
  - `usuario base + perfil`
- empresa V1:
  - una empresa por sesión
- preparación multiempresa:
  - sí, a nivel de modelo conceptual, no operativa
- identificación funcional:
  - perfil funcional `Operador`
- rol:
  - configurable por empresa
- menú:
  - limitado por permisos del rol más la condición de perfil funcional
- API:
  - reconoce Operador por perfil funcional, no por nombre del rol
- compatibilidad:
  - conserva `Usuarios`, login actual, empresa única por sesión y roles por empresa sin romper reglas existentes

### 19.16 Cambios potenciales

| Cambio | Esquema | Datos | Código | Obligatorio V1 |
|---|---:|---:|---:|---:|
| Agregar capa de perfil funcional para Operador | Sí probable | Sí | Sí | Sí |
| Mantener `Usuarios` como identidad base | No | No | Sí por reglas | Sí |
| Mantener empresa única por sesión | No | No | No | Sí |
| Preparar modelo para multiempresa futura | Sí probable después | No ahora | Sí después | No |
| Evitar reconocimiento por nombre de rol | No | No | Sí | Sí |
| Rol configurable por empresa | No necesariamente | Sí según semilla elegida | Sí | Sí |

### 19.17 Decisiones PO

El Product Owner debe aprobar únicamente:

1. identidad compartida o separada
2. empresa única V1
3. preparación multiempresa futura
4. perfil funcional `Operador`
5. rol configurable por empresa en lugar de rol fijo literal
6. comportamiento de persona con perfil administrativo y operativo
7. si debe existir un rol base predeterminado para empresas existentes
8. si nuevas empresas recibirán automáticamente una plantilla/base de rol operativo

## 20. Fase O0 preparada

El 2026-07-20 quedó preparada la definición previa de O0 sin ejecutar cambios en código, Firebase, datos ni esquema.

Documento detallado:

- `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/operadores-o0-modelo-identidad.md`

Objetos y artefactos propuestos para autorización posterior:

- `OperadoresPerfil`
- `ListasOperadoresAsignaciones`
- endurecimiento de `Usuarios.IdFirebase`
- permiso específico de `Inspección en campo`
- plantilla/base de rol operativo por empresa
- scripts propuestos:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/operadores-o0-up.sql`
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/operadores-o0-down.sql`
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/operadores-o0-seed.sql`

## 21. Fase O1 implementada

El 2026-07-20 quedó implementado el CRUD administrativo del perfil funcional `Operador` sobre `dbo.OperadoresPerfil`, sin crear cuentas Firebase, sin modificar `dbo.Usuarios` y sin cambiar el esquema.

### Ruta administrativa

- `/Operadores/Index`

### Permiso administrativo reutilizado

- se reutilizó `04001001` (`ABC Usuarios`) como permiso administrativo temporal y compatible para entrar al módulo `Operadores`
- no se creó un permiso nuevo para administración en esta fase

### Endpoints nuevos

API local:

- `GET /api/Operadores/ObtenerOperadores`
- `GET /api/Operadores/ObtenerOperador`
- `GET /api/Operadores/ObtenerCandidatos`
- `GET /api/Operadores/ObtenerRolesOperativos`
- `GET /api/Operadores/ObtenerAccesoUsuario`
- `POST /api/Operadores/Crear`
- `PUT /api/Operadores/ActualizarRol`
- `PUT /api/Operadores/Suspender`
- `PUT /api/Operadores/Reactivar`

Proxy MVC:

- `/Operadores/GetDataOperadores`
- `/Operadores/GetOperador`
- `/Operadores/GetCandidatos`
- `/Operadores/GetRolesOperativos`
- `/Operadores/CrearOperador`
- `/Operadores/ActualizarRol`
- `/Operadores/Suspender`
- `/Operadores/Reactivar`

### Reglas implementadas

- el listado muestra únicamente perfiles existentes en `OperadoresPerfil`
- los candidatos salen de `Usuarios` de la empresa activa, activos, no borrados, con sucursal válida y sin perfil previo
- el alta no modifica `Usuarios`, no crea Firebase y no asigna listas
- el rol operativo debe pertenecer a la misma empresa y conceder `02005000` dentro de `dbo.Roles.Permisos`
- la edición solo cambia `idRolOperador`
- la suspensión solo cambia el perfil operador: `estatus=2`, `activo=0`, `fechaSuspension`
- la reactivación valida usuario activo, sucursal válida y rol operativo vigente
- la concurrencia se controla con `versionRow`
- la auditoría usa `creadoPor` y `modificadoPor` resueltos por correo del actor administrativo

### Doble perfil

- una misma persona puede seguir siendo administrativa y además tener `OperadoresPerfil`
- suspender el perfil operador no modifica `Usuarios.idRol`, no cambia el login y no retira acceso administrativo existente

### Transición Legacy de Inspección en campo

- `RecoleccionesBL26` quedó validando dos caminos:
  - legacy: `02001000`
  - operador nuevo: `02005000` en `idRolOperador` + perfil activo + usuario activo + sucursal válida
- no se retiró la compatibilidad con `02001000`
- la URL manual `/ContestarLista/RecoleccionesBL26` sigue redirigiendo a `/Home` cuando no hay acceso válido
- el menú ahora puede mostrar `Inspección en campo` también desde el perfil operador aunque `Usuarios.idRol` no tenga `02005000`

### QA ejecutado

Resultado observado en datos locales:

- `OperadoresPerfil` permaneció en `0` filas al cierre
- `UMBRELLA CORP` (`B17AAECE-2B78-4E35-B554-9E694EEB15A7`) sí tiene un candidato válido:
  - `Excella Gionne Gionne`
  - sucursal `Africa`
- pero esa empresa no tiene ningún rol con `02005000`, por lo que el alta queda correctamente bloqueada
- la empresa que sí recibió `Operador Base` por Paquete C es `98C08DAB-5E92-4C6C-86A0-41EB3BA4C707`
- esa empresa no tiene usuarios candidatos hoy, así que no existe un tenant local con:
  - usuario elegible
  - y rol operativo `02005000`
  al mismo tiempo

Validaciones confirmadas:

- `GET /api/Operadores/ObtenerOperadores` devuelve vacío en `UMBRELLA CORP`
- `GET /api/Operadores/ObtenerRolesOperativos` devuelve vacío en `UMBRELLA CORP`
- `GET /api/Operadores/ObtenerCandidatos` devuelve a `Excella Gionne Gionne` en `UMBRELLA CORP`
- `POST /api/Operadores/Crear` bloquea un rol de otra empresa con el mensaje `El rol seleccionado no está disponible.`
- `GET /api/Operadores/ObtenerRolesOperativos` devuelve `Operador Base` en `98C08DAB-5E92-4C6C-86A0-41EB3BA4C707`
- `GET /api/Operadores/ObtenerCandidatos` devuelve vacío en `98C08DAB-5E92-4C6C-86A0-41EB3BA4C707`

### Riesgo pendiente

- el ambiente local todavía no tiene un caso completo para certificar alta positiva real sin alterar roles o usuarios fuera del alcance de O1
- la suspensión actual del perfil operador no corta sesión activa ni estado Firebase porque esa parte sigue fuera de alcance hasta integrar Admin SDK

### Certificación funcional positiva O1 del 2026-07-20

Resultado final:

- `UMBRELLA CORP` quedó habilitada con un rol nuevo `Operador Base`
- el rol quedó ligado al tenant `b17aaece-2b78-4e35-b554-9e694eeb15a7`
- el permiso real del rol quedó limitado al árbol que expone únicamente `02005000` como acceso operativo
- no se modificó `Usuarios.idRol`
- no se tocó Firebase

Respaldo y creación controlada:

- respaldo creado: `dbo.Roles_BKP_OPERADORES_O1QA_20260720_151016`
- conteo de `dbo.Roles` antes y después del respaldo: `117`
- rol creado en `dbo.Roles`:
  - `id = b57ceffb-9731-4354-845e-1ea02c0f33f7`
  - `NombreRol = Operador Base`
  - `idEmpresa = b17aaece-2b78-4e35-b554-9e694eeb15a7`
- observación de catálogo:
  - el tenant sí existe de forma operativa en `nxt_adm_legal_entities`, `nxt_adm_organizational_units` y `nxt_adm_sites`
  - no tiene fila correspondiente en `dbo.Empresa`, por lo que el nombre visible `UMBRELLA CORP` siguió validándose por contexto operativo y sesión autenticada, no por ese catálogo legacy

Perfil temporal de QA:

- candidata usada: `Excella Gionne Gionne`
- correo: `excella@tricell.com`
- sucursal: `Africa`
- perfil temporal creado:
  - `idOperadorPerfil = 3cd581bf-5591-4c3b-92b0-400c57d623e4`
  - `idRolOperador = b57ceffb-9731-4354-845e-1ea02c0f33f7`
- el alta positiva respondió:
  - `El Operador fue registrado correctamente.`
- el duplicado respondió:
  - `Este usuario ya está registrado como Operador.`

Pruebas funcionales certificadas:

- listado:
  - el perfil apareció una sola vez
  - nombre, correo, sucursal, rol y estado quedaron correctos
- filtros:
  - búsqueda por nombre `Excella`
  - búsqueda por correo `excella@tricell.com`
  - filtro por sucursal `Africa`
  - filtro por rol `Operador Base`
  - filtro por estado `Activos` y `Suspendidos`
- edición:
  - guardar el mismo rol conservó `idUsuario`, `idEmpresa` e `idSucursal`
  - la operación actualizó `versionRow` de `AAAAAAAC+V8=` a `AAAAAAAC+WA=`
  - un intento posterior con `versionRow` anterior bloqueó correctamente por concurrencia
- suspensión:
  - mensaje: `El Operador fue suspendido.`
  - estado visible en API: `Suspendido`
  - `perfilActivo = false`
  - `fechaSuspension` quedó registrada
- reactivación:
  - mensaje devuelto: `El Operador volvió a quedar disponible para Inspección en campo.`
  - estado final: `Activo`
  - `perfilActivo = true`
  - `versionRow` final: `AAAAAAAC+WI=`

Acceso a Inspección en campo:

- `GET /api/Operadores/ObtenerAccesoUsuario` confirmó:
  - activo: `true` antes de suspensión
  - activo: `false` durante suspensión
  - activo: `true` después de reactivación
- con ello quedó validado el método de autorización nuevo:
  - `02005000`
  - perfil activo
  - usuario activo
  - empresa coincidente
  - sucursal válida

Limitación real de autenticación:

- `/Operadores/Index` requería `sessionStorage` para operar en pestañas nuevas
- se corrigió la vista para hidratar `idEmpresa`, `cadena`, `empresa` y `correo` desde sesión HTTP/claims
- durante la prueba apareció el modal de sesión compartida:
  - `Se inició sesión en otro dispositivo con su usuario`
- al aceptar ese modal, la sesión del navegador fue expulsada al login
- por esa razón la certificación completa de alta, edición, suspensión y reactivación quedó cerrada por API local controlada y no por recorrido visual íntegro de la pantalla

Compatibilidad legacy:

- no se cambió la lógica de `Usuarios`
- no se alteró `02001000`
- `RecoleccionesBL26`, `ContestarLista/Index` y `CreadorListaBL26` no recibieron cambios en esta certificación O1
- el único ajuste de frontend fue la hidratación de contexto en `/Operadores/Index` para evitar fallas por pestaña nueva

Limpieza final:

- el perfil temporal de QA fue eliminado con transacción puntual
- validaciones previas:
  - correspondía a la candidata autorizada
  - no tenía filas en `ListasOperadoresAsignaciones`
  - no tenía referencias adicionales declaradas fuera de `Usuarios` y `ListasOperadoresAsignaciones`
- estado final:
  - `OperadoresPerfil = 0`
  - `ListasOperadoresAsignaciones = 0`
  - `Usuarios` de la candidata intacto
  - rol `Operador Base` conservado para uso futuro

### 2026-07-21 — Corrección final de edición en `/Operadores/Index`

Resultado del ajuste:

- quedó corregido el error visible:
  - `No fue posible cargar el operador seleccionado.`
- no se cambiaron reglas de negocio
- no se cambiaron endpoints de negocio
- no se cambió el modelo de datos
- no se cambió Firebase
- no se cambió la semántica de `versionRow`

#### Causa raíz confirmada

- la pantalla estaba mezclando contratos con nombres `PascalCase` y `camelCase`
- el listado y el detalle del operador no siempre llegaban con las mismas propiedades
- al abrir `Editar`, la vista intentaba consumir campos que no existían con el casing esperado y terminaba mostrando el mensaje genérico de error
- además, en validación HTTP sin sesión interactiva completa, `GET /Operadores/GetOperador` pudo responder `200` con cuerpo vacío, por lo que depender únicamente de esa llamada hacía frágil la apertura del modal

#### Corrección aplicada

- el frontend normaliza el detalle del operador antes de pintarlo en pantalla
- el listado cachea el detalle ya normalizado para reutilizarlo al abrir `Editar`
- el controlador MVC serializa en `camelCase` las respuestas del listado y del detalle
- la pantalla mantiene la carga y el guardado usando el mismo `idOperador` y la misma `versionRow` de concurrencia

Archivos ajustados:

- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Operadores/Operadores.js`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/Operadores/OperadoresController.cs`

#### Validación controlada certificada

- `GET /Operadores/GetDataOperadores` devolvió operadores reales en `camelCase`
- el detalle de operadores quedó disponible para hidratación consistente del modal
- el guardado controlado desde el endpoint del frontend permitió actualizar y revertir un operador real sin perder concurrencia
- la respuesta observada del guardado fue:
  - `El operador fue actualizado.`
- el registro intervenido fue restaurado a su valor original después de la prueba

#### Estado de QA

- la corrección quedó certificada a nivel de contrato frontend + MVC + API local
- no se certificó en esta corrida un recorrido visual administrativo completo con sesión estable, porque el navegador autenticado presentó conflicto de sesión compartida y expulsión a login
- aun con esa limitación, la causa raíz quedó identificada y la compatibilidad del payload quedó corregida

### 2026-07-21 — Trazabilidad real de verificación de correo

- El clic del operador en el enlace de verificación cambia primero el estado en Firebase Authentication:
  - `emailVerified = true`
- Ese cambio no actualiza por sí mismo el grid de `/Operadores/Index`.
- El listado administrativo no toma el estado desde SQL; lo resuelve enriqueciendo cada operador con el nodo RTDB de `Operadores/{uid}`.
- El componente backend que hoy define lo que ve la pantalla es:
  - `EnrichWithVerificationStateAsync(...)`
  - apoyado por `GetOperatorNodeStatesAsync(...)`
  - y `ResolveVerifiedState(...)`
- Mientras el nodo RTDB conserve `emailVerificado = false`, la UI puede seguir mostrando:
  - `Pendiente de verificar`
- La sincronización de RTDB ocurre después, cuando el flujo operativo vuelve a tocar identidad y ejecuta la actualización explícita:
  - `UpdateOperatorVerificationAsync(uid, emailVerified)`
- En la práctica, el momento observable de esa sincronización suele ser el primer login exitoso del operador o cualquier flujo que refresque su identidad remota.
- SQL no es la fuente visual de `correo verificado` en este módulo y por eso no corrige por sí solo la vista administrativa aunque Firebase Auth ya esté validado.
