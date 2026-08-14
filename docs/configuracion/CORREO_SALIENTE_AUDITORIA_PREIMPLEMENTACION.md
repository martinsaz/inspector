# Correo saliente — Auditoría preimplementación

Fecha de auditoría: 2026-08-13
Producto: CheckApp
Vertical: Ajustes > Configuración > Correo saliente
Tipo de corrida: auditoría y planeación, sin implementación

## 1. Resumen ejecutivo

La arquitectura actual de correo saliente en `checklist` ya existe y depende de un único servicio compartido: [`EmailServices.cs`](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Services/EmailServices.cs). Ese servicio no resuelve credenciales desde `appsettings`, variables de entorno ni SQL; recibe un `MailRegistro` ya hidratado y lo usa directamente para abrir la conexión SMTP.

El origen real auditado de la configuración SMTP vigente es un nodo global de Firebase Realtime Database: `MailRegistro`. Hoy ese nodo es consumido al menos por dos flujos:

- registro/login administrativo en [`LoginController.cs`](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/LoginController.cs)
- envío de cotizaciones en [`CotizacionesController.cs`](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/Cotizaciones/CotizacionesController.cs)

Hallazgo crítico: no existe evidencia en código de una configuración SMTP aislada por empresa. La implementación actual es global y, por tanto, incompatible con el objetivo de producto multitenant si se reutiliza sin intervención arquitectónica.

Hallazgo crítico 2: el defecto documentado de `mail.supervisores.mx` sí es coherente con la arquitectura actual. Cotizaciones hereda exactamente el host almacenado en `MailRegistro`, y ese hostname ya fue identificado como bloqueo real de infraestructura.

Corrección arquitectónica obligatoria: la nueva pantalla `Correo saliente` no debe acoplarse a `MailRegistro`, ni reutilizar la infraestructura SMTP base, ni convertirse en una mutación del flujo de autenticación. Debe nacer como subsistema documental aislado por empresa para evitar riesgo sobre login, registro, Firebase y correo técnico interno.

Dictamen corregido de auditoría: el hallazgo sobre `MailRegistro` debe tratarse como evidencia de riesgo y frontera protegida. La implementación correcta es una fuente tenant nueva y aislada para correo saliente documental, sin tocar la infraestructura base compartida en esta etapa.

## 2. Árbol aprobado

Árbol aprobado por Product Owner para futura implementación:

```text
Ajustes
└ Configuración
  └ Correo saliente
```

Restricciones confirmadas:

- `Configuración` debe insertarse después de `Operadores`.
- `Correo saliente` será el único hijo inicial.
- La incorporación al menú debe ser aditiva; no se deben mover ni reemplazar entradas actuales.
- Esta corrida no autoriza implementarlo todavía.

## 3. Arquitectura actual de EmailServices

Servicio auditado:

- [`EmailServices.cs`](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Services/EmailServices.cs)

Funcionamiento real:

1. `EnviarCorreoAsync(...)` recibe `nombre`, `destinatario`, `MailRegistro` y adjuntos.
2. Construye el `MimeMessage` con:
   - remitente: `mailRegistro.correo`
   - asunto: `mailRegistro.asunto`
   - cuerpo HTML: `mailRegistro.bodyHTML`
3. Intenta conectar por SMTP con:
   - host: `mailRegistro.smtpServer`
   - puerto: `mailRegistro.puerto`
   - SSL/TLS: `mailRegistro.ssl`
4. Autentica con:
   - usuario: `mailRegistro.correo`
   - contraseña: `mailRegistro.password`
5. Si falla, ejecuta un segundo intento con `SecureSocketOptions.None`.
6. Si ambos intentos fallan, devuelve el mensaje técnico condensado.

Hallazgos de implementación actual:

- acepta cualquier certificado: `ServerCertificateValidationCallback = (...) => true`
- desactiva revocación: `CheckCertificateRevocation = false`
- remueve `XOAUTH2`
- no abstrae proveedor
- no resuelve contexto tenant
- no cifra ni protege la contraseña en memoria de forma especial
- registra en logs host, puerto y remitente
- no registra explícitamente la contraseña

## 4. Origen actual SMTP

Modelo auditado:

- [`MailRegistro.cs`](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Models/Firebase/MailRegistro.cs)

Campos reales actuales:

- `smtpServer`
- `asunto`
- `bodyHTML`
- `correo`
- `password`
- `puerto`
- `ssl`

Origen real auditado:

- Firebase Realtime Database
- nodo global `MailRegistro`

Evidencia:

- [`CotizacionesController.cs`](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/Cotizaciones/CotizacionesController.cs) `LoadMailRegistroAsync()` lee `firebaseClient.Child("MailRegistro").OnceAsync<object>()`
- [`LoginController.cs`](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/LoginController.cs) también lee `firebaseClient.Child("MailRegistro").OnceAsync<object>()`

No se encontró en la auditoría:

- tabla SQL de SMTP
- `ConfiguracionCorreo`
- `CorreoSaliente`
- `SMTP` por empresa
- fallback desde `appsettings`
- variables de entorno específicas para host/puerto/cuenta SMTP operativa

Conclusión: hoy el SMTP sale de Firebase global.

## 5. Análisis de mail.supervisores.mx

Hallazgo real:

- el host fallido auditado en Cotizaciones proviene del mismo `MailRegistro` global consumido por el vertical.

Respuesta a las preguntas obligatorias:

1. Origen exacto:
   - `MailRegistro.smtpServer` en Firebase.
2. Dónde se almacena:
   - nodo global `MailRegistro`.
3. Quién lo consume:
   - `CotizacionesController`
   - `LoginController`
   - indirectamente `EmailServices`
4. ¿Es global o por empresa?
   - global en código auditado.
5. ¿Es legacy?
   - sí, por patrón de acceso global Firebase y por ausencia de contexto tenant.
6. ¿Existe configuración oficial alternativa?
   - no se encontró en código.
7. ¿La futura pantalla debe reemplazar esa fuente?
   - sí, si el PO confirma configuración por empresa; no debe crear una segunda fuente.
8. Impacto sobre consumidores actuales:
   - alto, porque Cotizaciones y registro/login dependen del mismo origen.

## 6. Consumidores actuales

Matriz obligatoria de consumidores detectados:

| Consumidor | Servicio usado | Configuración | Adjuntos | Estado |
|---|---|---|---|---|
| `LoginController.Registraru` | `EmailServices.EnviarCorreoAsync` | Firebase global `MailRegistro` | No | Activo |
| `CotizacionesController.EnviarCotizacionCorreo` | `EmailServices.EnviarCorreoAsync` | Firebase global `MailRegistro` | Sí, PDF | Activo |

Conclusiones:

- no se encontraron otros consumidores SMTP reales en MVC ni API durante esta auditoría
- no hay servicio paralelo visible en `inspectorapi/checklistWs`
- el envío de correo hoy está centralizado en MVC, no en API

## 7. Configuración existente reutilizable

Reutilizable:

- clase `MailRegistro`
- servicio `EmailServices`
- inyección DI ya registrada en [`Program.cs`](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Program.cs)
- mecanismo de autenticación a Firebase ya existente en controladores

No reutilizable tal como está:

- nodo global `MailRegistro` si el objetivo final es tenant por empresa
- devolución directa de mensajes técnicos desde `EmailServices` hacia flujos de UI
- política de certificados inseguros como estado “aceptable” a largo plazo

## 8. Modelo multitenant actual

Resultado de auditoría:

- `EmailServices` no recibe `idEmpresa`
- `MailRegistro` no contiene `idEmpresa`
- `CotizacionesController.LoadMailRegistroAsync()` no filtra por empresa
- `LoginController` tampoco filtra por empresa

Conclusión:

- el modelo SMTP actual no es multitenant
- hoy existe riesgo real de que todos los tenants compartan la misma cuenta saliente
- no hay evidencia de fallback global vs tenant porque solo existe fuente global

Respuesta a preguntas obligatorias:

1. ¿Trabaja por empresa?
   - no.
2. ¿Existe configuración SMTP por empresa?
   - no encontrada.
3. ¿Existe tabla/configuración reutilizable?
   - no encontrada; solo `MailRegistro` global en Firebase.
4. ¿Debe existir exactamente una configuración activa por empresa?
   - recomendación arquitectónica: sí.
5. ¿Qué ocurre si una empresa no tiene configuración?
   - hoy no aplica porque la configuración es global.
6. ¿Existe fallback global?
   - hoy el sistema es directamente global.
7. ¿Un tenant podría acceder accidentalmente al SMTP de otro tenant?
   - sí, bajo el modelo actual.

## 9. Riesgos de seguridad

Riesgos reales detectados:

- contraseña SMTP cargada en texto claro desde Firebase
- contraseña entregada al controlador para uso directo
- host/puerto/remitente visibles en logs de warning
- política de certificado insegura:
  - acepta cualquier certificado
  - revocación desactivada
- inexistencia de aislamiento tenant
- la UI futura no puede volver a exponer la contraseña una vez guardada

Riesgos a evitar en implementación futura:

- retornar contraseña guardada al navegador
- almacenarla en `localStorage`, `sessionStorage` o JS persistente
- mostrar errores SMTP crudos
- duplicar fuente de verdad

## 10. Estrategia de protección de contraseña

Propuesta compatible con la arquitectura actual:

1. La contraseña solo debe viajar al servidor al crear o reemplazar.
2. Después de guardar, la UI debe mostrar estado conceptual:
   - `Contraseña configurada`
3. La lectura de configuración para editar no debe devolver el valor real.
4. El backend debe conservar el secreto en persistencia segura aprobada por PO.
5. Si la persistencia elegida no soporta cifrado nativo, el cambio debe escalarse como decisión explícita del PO; no inventar criptografía casera.

Recomendación:

- reutilizar un mecanismo de protección de secretos del stack vigente si ya existe en la capa aprobada por infraestructura
- si no existe, documentar el secreto como campo protegido del servidor y mantenerlo inaccesible al cliente

## 11. Propuesta de persistencia

Estado actual:

- no existe persistencia tenant reutilizable encontrada en SQL ni API
- solo existe `MailRegistro` global en Firebase

Propuesta conceptual mínima, pendiente de PO:

- nombre sugerido: `ConfiguracionCorreoSaliente`
- propósito: almacenar configuración SMTP activa por empresa
- campos conceptuales:
  - `IdConfiguracionCorreo`
  - `IdEmpresa`
  - `CorreoRemitente`
  - `HostSMTP`
  - `Puerto`
  - `UsaSSL`
  - `PasswordProtegida`
  - `EstadoConfiguracion`
  - `UltimaPruebaExitosaUtc`
  - `UltimoErrorFuncional`
  - `FechaAltaUtc`
  - `FechaActualizacionUtc`
  - `UsuarioAlta`
  - `UsuarioActualizacion`

Reglas propuestas:

- exactamente una configuración activa por empresa
- sin lectura de contraseña real
- con timestamps y auditoría
- con estado funcional

## 12. Propuesta de API

Estado actual:

- no existe endpoint específico para correo saliente en `checklistWs`

Propuesta futura, pendiente de PO:

- `GET /api/ConfiguracionCorreoSaliente/Obtener`
- `POST /api/ConfiguracionCorreoSaliente/Guardar`
- `POST /api/ConfiguracionCorreoSaliente/Probar`

Reglas:

- el contexto tenant debe resolverse en servidor
- nunca retornar contraseña real
- `Probar` no debe guardar automáticamente si la política final así lo define
- `Guardar` debe respetar la decisión de PO sobre “requiere prueba exitosa” o no

## 13. Propuesta MVC

Ruta sugerida, alineada con el árbol aprobado:

- `/Configuracion/CorreoSaliente`

Estructura MVC futura:

- `Controllers/Configuracion/ConfiguracionController.cs`
- `Views/Configuracion/CorreoSaliente.cshtml`
- `wwwroot/css/Configuracion/CorreoSaliente.css`
- `wwwroot/js/Configuracion/CorreoSaliente.js`

Razón:

- hoy no existe un módulo `Configuración` real dentro de `Ajustes`
- conviene crear uno coherente con la jerarquía futura y no colgar `Correo saliente` como ruta aislada sin contenedor semántico

## 14. Propuesta UI

La UI debe basarse en Patrón CheckApp, no en copia visual literal de la captura legacy.

Bloques propuestos:

1. Header secundario:
   - `Configuración`
   - `Correo saliente`
2. Card resumen:
   - estado actual
   - remitente configurado
   - última verificación
3. Formulario principal:
   - cuenta
   - contraseña
   - host
   - puerto
   - SSL/TLS
4. Card de prueba:
   - correo destino de prueba
   - acción `Enviar correo de prueba`
5. Barra de acciones:
   - `Guardar`
   - `Cancelar`

## 15. Flujo Enviar correo de prueba

Flujo propuesto:

1. El usuario captura o ajusta valores.
2. Captura un destinatario de prueba.
3. El frontend valida formato mínimo.
4. El backend intenta conexión y autenticación SMTP.
5. Si son válidas, envía un correo real de prueba.
6. Devuelve un resultado funcional y no técnico.

Mensajes propuestos:

- éxito: `Correo de prueba enviado correctamente.`
- conexión: `No fue posible conectar con el servidor de correo.`
- autenticación: `No fue posible autenticar la cuenta de correo.`
- configuración: `Revisa la configuración de correo e inténtalo nuevamente.`

## 16. Flujo Guardar

Opciones evaluadas:

- Opción A: guardar solo después de prueba exitosa
- Opción B: permitir guardar sin prueba y marcar `No verificada`
- Opción C: otra política

Recomendación arquitectónica:

- **Opción B**

Justificación:

- desacopla captura administrativa de disponibilidad momentánea del servidor SMTP
- permite registrar configuración en horarios con bloqueos temporales
- preserva trazabilidad con estado `No verificada`

Estado de esta recomendación:

- pendiente de aprobación del Product Owner

## 17. Estados propuestos

Estados funcionales sugeridos:

- `No configurada`
- `No verificada`
- `Verificada`
- `Error de conexión`

## 18. Validaciones

Validaciones mínimas propuestas:

- cuenta:
  - obligatoria
  - formato correo
- host:
  - obligatorio
  - hostname válido
- puerto:
  - obligatorio
  - entero
  - rango válido
- contraseña:
  - obligatoria al crear
  - opcional al editar si ya existe una configurada
- SSL/TLS:
  - booleano explícito
- correo de prueba:
  - obligatorio para probar
  - formato correo válido

## 19. Responsive

Objetivo responsive futuro:

- desktop 1440:
  - formulario en dos columnas balanceadas
- tablet 768:
  - columnas apilables sin overflow
- mobile 390:
  - una sola columna
  - labels siempre visibles
  - botones de ancho utilizable
  - sin overflow horizontal global

## 20. Manejo de errores

Propuesta:

- mostrar errores funcionales, no técnicos
- no mostrar:
  - `SocketException`
  - `SmtpException` cruda
  - DNS interno
  - stack trace
  - contraseña

Recomendación técnica:

- `EmailServices` requiere una capa posterior de normalización de errores
- esta corrida no lo modifica

## 21. Impacto en Cotizaciones

Impacto real:

- Cotizaciones depende hoy del mismo `MailRegistro` global
- cualquier futura migración de fuente SMTP afecta directamente `EnviarCotizacionCorreo`

Beneficio esperado:

- al mover la fuente oficial a configuración tenant, Cotizaciones dejaría de depender del host global legacy

Riesgo:

- si se reemplaza la fuente sin estrategia de compatibilidad, el flujo de correo de Cotizaciones puede romperse

## 22. Compatibilidad con consumidores existentes

Requisito obligatorio de futura implementación:

- mantener aislada la infraestructura base actual
- no modificar `LoginController`, registro ni recuperación de contraseña
- no modificar `MailRegistro`
- no modificar el flujo legado de `Cotizaciones` mientras el Product Owner no autorice la integración posterior

Compatibilidad propuesta:

- el nuevo subsistema documental vive en rutas, persistencia y servicio propios
- los consumidores actuales siguen intactos durante esta etapa
- la integración futura de Cotizaciones u otros módulos debe hacerse en una iteración posterior y explícitamente autorizada

## 23. Archivos que requeriría futura implementación

Como mínimo:

- nuevo controlador MVC de configuración
- nueva vista Razor
- nuevo JS específico
- nuevo CSS específico
- ajustes en `HomeController.BuildMenu`
- posible nuevo controlador API
- posible servicio/repositorio de configuración saliente aislado
- posible servicio de prueba SMTP documental aislado
- sin adaptación de `LoginController` en esta etapa
- sin tocar `CotizacionesController` en esta etapa

## 24. SQL que requeriría futura implementación, si aplica

No autorizado en esta corrida.

Si PO aprueba persistencia SQL nueva, requerirá:

- tabla tenant de configuración SMTP
- llave por empresa
- timestamps
- estado
- secreto protegido

## 25. Decisiones pendientes del PO

1. Confirmar si la configuración es por empresa.
2. Confirmar si `Guardar` requiere prueba exitosa.
3. Confirmar si el estado `No verificada` es aceptable.
4. Confirmar si la persistencia oficial será SQL o si existe un almacenamiento seguro aprobado alterno.
5. Confirmar en una etapa posterior si Cotizaciones u otros documentos migrarán al subsistema documental nuevo.

## 26. Riesgos

1. Riesgo multitenant alto por configuración global actual.
2. Riesgo de bloqueo de Cotizaciones mientras exista `mail.supervisores.mx`.
3. Riesgo de exponer secreto si la UI futura intenta “editar mostrando valor actual”.
4. Riesgo de romper registro/login si se mezcla el nuevo módulo con la fuente global actual.
5. Riesgo de certificar como segura una política SMTP con validación de certificado desactivada.

## 27. Plan de implementación de una sola iteración posterior

1. Crear persistencia oficial aprobada por PO.
2. Crear API tenant para obtener, probar y guardar configuración.
3. Crear módulo MVC `Configuración > Correo saliente`.
4. Mantener intactos `LoginController`, `CotizacionesController`, `MailRegistro` y correo base.
5. Validar con QA funcional:
   - prueba exitosa
   - error de conexión
   - error de autenticación
   - edición sin revelar contraseña
   - aislamiento por empresa

## 28. Criterios de aceptación

1. Menú `Ajustes > Configuración > Correo saliente` visible en posición aprobada.
2. La pantalla no expone contraseña guardada.
3. La configuración queda aislada por empresa.
4. El correo de prueba entrega mensajes funcionales y no técnicos.
5. La etapa no rompe `Cotizaciones`, `Login` ni la fuente global protegida.
6. No se rompe registro/login porque queda fuera de alcance.
7. Desktop, tablet y mobile cumplen Patrón CheckApp.

## 29. Dictamen

La arquitectura actual sí permite delimitar con claridad la frontera protegida, pero no debe reutilizarse directamente para este módulo documental. La implementación correcta de esta etapa es un subsistema aislado por empresa, con prueba SMTP y persistencia propias, dejando intactos `MailRegistro`, `LoginController`, `CotizacionesController` y el correo base técnico.

## Matriz obligatoria de impacto

| Componente | Estado actual | Cambio futuro | Riesgo | Reutilizar/Crear | Requiere PO |
|---|---|---|---|---|---|
| Menú | `Ajustes` existe sin `Configuración` | agregar `Configuración > Correo saliente` | Medio | Crear nodo visual | Sí |
| Ruta | no existe ruta específica | crear `/Configuracion/CorreoSaliente` | Bajo | Crear | Sí |
| Vista | no existe | crear pantalla CheckApp | Bajo | Crear | No |
| CSS | no existe | hoja dedicada del módulo | Bajo | Crear | No |
| JavaScript | no existe | lógica de formulario y prueba | Medio | Crear | No |
| MVC | `HomeController` y controladores legacy | añadir módulo de configuración | Medio | Reutilizar + crear | Sí |
| EmailServices | servicio compartido activo | mantenerlo fuera de alcance | Alto | No tocar | Sí |
| API | no existe endpoint dedicado | crear CRUD/probar aislado | Alto | Crear | Sí |
| Persistencia | `MailRegistro` global Firebase | crear persistencia tenant oficial nueva | Alto | Crear | Sí |
| SMTP | host global heredado | parametrizar por empresa en módulo nuevo | Alto | Crear aislado | Sí |
| Credenciales | secreto global y legible en servidor | proteger por tenant y ocultar al cliente | Alto | Crear manejo aislado | Sí |
| Empresa | sin aislamiento SMTP | aislamiento estricto por `IdEmpresa` | Alto | Crear soporte | Sí |
| Cotizaciones | consume `MailRegistro` global | sin cambios en esta etapa | Alto | No tocar | Sí |
| AGENTS.md | sin este vertical documentado | registrar auditoría y reglas | Bajo | Reutilizar | No |
| CLAUDE.md | sin este vertical documentado | registrar auditoría y reglas | Bajo | Reutilizar | No |

## Matriz de menú obligatoria

| Opción | Antes | Después | Acción |
|---|---|---|---|
| Usuarios | EXISTE | EXISTE | Preservar |
| Roles y Permisos | EXISTE | EXISTE | Preservar |
| Sucursales | EXISTE | EXISTE | Preservar |
| Razones Sociales | EXISTE | EXISTE | Preservar |
| Regiones | EXISTE | EXISTE | Preservar |
| Operadores | EXISTE | EXISTE | Preservar |
| Configuración | NO EXISTE | EXISTE | Agregar después de `Operadores` |
| Correo saliente | NO EXISTE | EXISTE | Crear como hijo inicial de `Configuración` |
