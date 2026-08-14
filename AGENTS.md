# AGENTS

## Entorno activo

- Frontend local: `/Users/denissemendiola/dev/CheckList_Original/checklist`
- Backend local relacionado: `/Users/denissemendiola/dev/checklistWs-Original/checklistWs`
- URL frontend local: `http://localhost:5200`
- URL API local activa: `http://localhost:5127`

## Configuracion de API

- La configuracion publicada debe preservarse comentada y claramente identificada para despliegue.
- El ambiente local activo debe apuntar a la API local real.
- No se deben dejar URLs productivas activas por accidente durante QA local.

## Responsabilidades por capa

- El frontend es responsable de presentacion, interaccion, validaciones basicas de experiencia, consumo de contratos y manejo visual de estados.
- La API es responsable en exclusiva de logica de negocio, validaciones de negocio, acceso a datos, persistencia, integridad y contratos funcionales.
- No trasladar logica de negocio ni reglas de datos al frontend.

## Politica de base de datos

- Esta prohibido modificar esquema, tablas, columnas, relaciones, indices, stored procedures, migraciones o datos estructurales sin autorizacion expresa del Product Owner.
- Antes de proponer cualquier cambio de esquema se debe analizar primero la reutilizacion del modelo actual.
- Si el modelo actual no es suficiente, se debe documentar el cambio minimo, impacto, riesgos, compatibilidad y regresiones antes de solicitar autorizacion.

## Reglas de trabajo

- Documentar cada cambio tecnico y sus regresiones verificadas.
- Proteger funcionalidades aprobadas y evitar cambios laterales no solicitados.
- Liberar unicamente procesos iniciados por Codex; no detener procesos previos del usuario sin instruccion.
- No dejar textos tecnicos, mensajes de auditoria ni comentarios visibles en la UI.
- Mantener autenticacion, sesion, permisos y contratos salvo instruccion explicita en contrario.
- En endpoints sensibles por empresa, `idEmpresa`, `cadena`, `empresa` y `correo` deben resolverse desde sesion HTTP o claims del servidor antes de consumir la API; no confiar en `sessionStorage` del navegador como fuente final de contexto tenant.
- La API define qué listas son ejecutables; el frontend solo las solicita y las presenta.
- Una pantalla de operación no debe consumir directamente el catálogo general de diseño cuando sus reglas de negocio sean distintas.
- Está prohibido mostrar mensajes técnicos al usuario final.
- No modificar esquema, tablas ni estados persistidos sin autorización expresa.
- Desde el 2026-07-20 quedan pausados R3 y cualquier cambio adicional de `Inspección en campo` hasta definir la arquitectura completa de `Operadores`.
- El bloqueo real de acceso del login actual depende de `Usuarios/{uid}.status` en Firebase Realtime Database; `Usuarios.Estatus` en SQL no basta por sí solo para negar login.
- El modelo interno vigente de usuario es de sucursal única por `Usuarios.IdSucursal`; no asumir multisucursal real sin una definición explícita de autorización y modelo.

## Patron CheckApp

- `Patron CheckApp` es el estandar oficial de UX/UI del proyecto y debe leerse antes de modificar pantallas con impacto visual o flujos operativos.
- El flujo obligatorio es:
  - auditar funcionalidad existente
  - auditar responsive
  - auditar consistencia CheckApp
  - implementar de forma quirurgica
  - validar build y regresion del flujo principal
  - documentar evidencia y riesgos
- La auditoria minima debe cubrir:
  - contratos y comportamiento actual
  - estados loading, empty y error
  - desktop, tablet y movil
  - accesibilidad basica de foco, contraste y targets tactiles
- Toda implementacion nueva debe usar los tokens CSS definidos por el Patron CheckApp en `docs/ui/PATRON_CHECKAPP.md`.
- Estan prohibidos colores hardcodeados en vistas, scripts de render y hojas de estilo nuevas cuando exista token equivalente.
- Los grids nuevos o intervenidos deben converger a `CheckAppDynamicGrid` y no crear inicializaciones aisladas de DataTables con look-and-feel local.
- Los paneles de filtros plegables deben usar `CheckAppFilterAccordion` o mantener su misma filosofia de resumen visible, apertura segura y persistencia de contexto.
- Responsive no es opcional:
  - sin overflow horizontal accidental
  - filtros y acciones principales visibles
  - grids convertibles a lectura movil
- No romper funcionalidad aprobada:
  - no mover logica de negocio al frontend
  - no cambiar contratos ni persistencia sin instruccion expresa
  - no degradar permisos, sesion o contexto tenant
- Documentacion fuente del patron:
  - `docs/ui/PATRON_CHECKAPP.md`
  - `docs/ui/PATRON_CHECKAPP_PRO.md`
  - `docs/ui/PATRON_CHECKAPP_SECUNDARIO.md`
  - `docs/ui/USO_PATRON_CHECKAPP.md`

## Ultima certificacion local

- Certificacion frontend -> API local validada el 2026-07-17 con frontend en `http://localhost:5200` y API en `http://localhost:5127`.

## Ruta paralela BL26 activa

- Se habilito la ruta aislada `http://localhost:5200/ContestarLista/RecoleccionesBL26` para la fase R0 + R1 de Recolecciones BL26.
- Esta ruta convive con `http://localhost:5200/ContestarLista/Index` y no debe reutilizar ni modificar el JS legacy salvo aprobacion expresa.
- La implementacion BL26 debe privilegiar archivos propios y cambios minimos en el controlador para reducir regresion.
- El menu real se construye en `HomeController.BuildMenu`; cualquier alta visual de BL26 en navegacion debe hacerse ahi y no en `_Layout.cshtml`.
- `Recolecciones BL26` reutiliza el permiso legacy `02001000` de `Nueva`; no se deben crear permisos o roles nuevos solo para exponer la ruta.
- Estado local certificado el `2026-07-17`:
  - submenu `Recolecciones` conserva `Nueva`, `Listado` y `Detalle`
  - se agrego `Recolecciones BL26` como cuarta opcion visible
  - el grupo queda expandido y BL26 activo al entrar a `/ContestarLista/RecoleccionesBL26`
  - con la sesion autenticada de QA las sucursales retornaron vacias desde frontend y API, por lo que la certificacion funcional completa queda bloqueada sin tocar datos
- Auditoria de trazabilidad del `idEmpresa` el `2026-07-17`:
  - el `idEmpresa` de la sesion auditada proviene de Firebase Realtime Database `Conexiones/{empresa}` y no del token de Firebase Authentication
  - BL26 ya rehace contexto tenant desde sesion HTTP
  - Legacy mantiene endpoints que todavia reciben `idEmpresa` y `cadena` desde `sessionStorage`, lo cual se considera una deuda de seguridad a corregir de forma controlada
- Diagnostico y correccion de catalogos globales el `2026-07-17`:
  - `CategoriasABC`, `SubcategoriasABC` y `CreadorListaBL26` dependian de los WS globales `ObtenerCategorias` y `ObtenerSubcategorias`
  - la causa real era `notas = NULL` en filas activas de catalogo
  - el backend local fue endurecido para tolerar `NULL` en `Notas` sin cambiar datos ni esquema
  - resultado validado:
    - `Categorias/GetData` regreso `28` registros
    - `Subcategorias/GetData` regreso `26` registros
    - `Listas/GetCategoriasComboBox` regreso `28` opciones
    - `Listas/GetSubcategoriasComboBox` regreso `26` opciones
- Reinicio operativo mas reciente del frontend local:
  - proceso sustituido: PID `24858`
  - proceso final activo: PID `26568`
  - comando activo: `/Users/denissemendiola/dev/CheckList_Original/checklist/bin/Debug/net8.0/checklist --urls=http://localhost:5200`
- Auditoria operativa previa a R2 del `2026-07-17`:
  - se retiraron textos visibles tecnicos en la ruta de inspeccion y en las opciones nuevas de menu
  - reemplazos visibles aplicados:
    - `Nueva (BL26)` -> `Nueva (editor)`
    - `Recolecciones BL26` -> `Inspeccion en campo`
    - mensajes con `API local`, `sprint`, `primer render funcional` y `ruta paralela` -> mensajes operativos orientados al usuario
  - reglas reales confirmadas desde frontend + backend:
    - categorias visibles en catalogo: `28`
    - subcategorias visibles en catalogo: `26`
    - ambas se cargan por empresa y `borrado = 0`
    - `CreadorListaBL26` consume categorias y subcategorias como catalogos globales independientes; no existe filtro por categoria en el contrato actual
    - `RecoleccionesBL26` no expone selectores de categoria/subcategoria; solo las muestra dentro de preguntas activas de la lista
  - riesgo documentado para R2:
    - el combo de listas de recolecciones sigue heredando listas cerradas no ejecutables desde un endpoint legacy compartido
    - no se corrigio en esta pasada para evitar impacto lateral en flujos legacy sin autorizacion expresa
  - cierre controlado de R1:
    - `Inspección en campo` ya no consume el endpoint compartido de listas
    - la ruta nueva debe usar exclusivamente un proxy aislado hacia la operación local de listas ejecutables
- Auditoria de persistencia R3 del `2026-07-18`:
  - el modelo legacy de respuestas persiste detalle por fila en `ListasRespuestas` y agrupa por `evento`
  - `evento` se genera hoy del lado cliente en el flujo legacy
  - no existe una cabecera persistente de ejecucion para distinguir `abierta`, `en proceso` o `terminada`
  - no existe garantia nativa para:
    - recuperar una inspeccion abierta desde otra sesion o dispositivo
    - evitar ejecuciones duplicadas
    - actualizar una respuesta ya guardada sin insertar otra fila
  - mientras no exista autorizacion expresa del Product Owner para ampliar el modelo o agregar identidad persistente de ejecucion, `RecoleccionesBL26` no debe implementar persistencia real usando heuristicas ni almacenamiento del navegador
- Propuesta tecnica R3 pendiente de autorizacion del `2026-07-18`:
  - si el Product Owner autoriza persistencia real, la identidad de ejecucion debe ser generada y controlada por la API
  - `evento` debe conservarse solo como compatibilidad de resultados legacy y no como identidad principal de la nueva inspeccion en campo
- Certificacion previa del cambio de esquema R3 del `2026-07-18`:
  - la arquitectura de persistencia fue aprobada en principio por el Product Owner
  - la autorizacion final de esquema sigue pendiente
  - se prepararon scripts exactos de avance y rollback solo como propuesta documental
  - no se ejecutaron scripts ni cambios sobre la base
- Auditoria de Operadores del `2026-07-20`:
  - existe autorregistro público por empresa mediante token en `LoginController.Registraru`
  - `Inspección en campo` sigue reutilizando el permiso legacy `02001000` y no tiene todavía un permiso exclusivo
  - las listas ejecutables de BL26 siguen siendo por empresa y ejecutabilidad; no hay restricción actual por operador programado
  - antes de crear `Ajustes -> Operadores` debe definirse:
    - permiso exclusivo o política server-side para el módulo
    - sucursal única vs multisucursal
    - fuente real de listas asignadas
- Paquete C de Operadores ejecutado el `2026-07-20`:
  - el modelo legacy real no usa tablas separadas de permisos ni menú; `Inspección en campo` queda representado en `dbo.Roles.Permisos`
  - se creó el permiso exclusivo `02005000` para `/ContestarLista/RecoleccionesBL26`
  - se creó `Operador Base` solo para empresas activas detectadas en `dbo.Empresa`
  - la transición quedó compatible con `02001000 OR 02005000`, sin retirar acceso legacy
  - evidencia actual en base:
    - respaldo `dbo.Roles_BKP_OPERADORES_C_20260720_130454`
    - `1` rol base insertado
  - Paquete D sigue pendiente
- Fase O1 de Operadores implementada el `2026-07-20`:
  - se creó la ruta administrativa `/Operadores/Index` reutilizando el permiso existente `04001001`
  - el CRUD opera solo sobre `dbo.OperadoresPerfil`; no crea cuentas Firebase, no modifica `dbo.Usuarios` y no cambia esquema
  - el acceso nuevo a `RecoleccionesBL26` usa `02005000` desde `idRolOperador` + perfil activo, manteniendo compatibilidad con `02001000`
  - el menú puede mostrar `Inspección en campo` por perfil operador aunque `Usuarios.idRol` no tenga `02005000`
  - QA local:
    - `UMBRELLA CORP` tiene candidato elegible pero sin rol `02005000`
    - la empresa con `Operador Base` no tiene usuarios candidatos
    - `OperadoresPerfil` cerró con `0` filas
- Certificación positiva O1 de Operadores cerrada el `2026-07-20`:
  - respaldo creado: `dbo.Roles_BKP_OPERADORES_O1QA_20260720_151016`
  - `UMBRELLA CORP` recibió `Operador Base` con permiso operativo exclusivo `02005000`
  - la candidata `Excella Gionne Gionne` fue dada de alta temporalmente, validada en API para alta, duplicado, filtros, edición, suspensión y reactivación
  - el perfil temporal fue eliminado al cierre; `OperadoresPerfil` y `ListasOperadoresAsignaciones` volvieron a `0`
  - ajuste puntual de frontend:
    - `/Operadores/Index` ahora hidrata `idEmpresa`, `cadena`, `empresa` y `correo` desde sesión HTTP/claims para evitar falla por pestaña nueva
  - limitación real:
    - el modal `Se inició sesión en otro dispositivo con su usuario` expulsó la sesión visual antes de cerrar todo el CRUD desde navegador
    - la certificación funcional final quedó completada por API local controlada sin tocar `Usuarios` ni `Firebase`

## Patron CheckApp

- Desde el `2026-07-24` existe implementación técnica oficial inicial del Patrón CheckApp para `ASP.NET Core MVC`, `Razor`, `jQuery`, `Bootstrap` y `DataTables`.
- Los artefactos base oficiales son:
  - `checklist/wwwroot/css/checkapp-theme.css`
  - `checklist/wwwroot/js/checkapp-ui.js`
  - `docs/ui/CHECKAPP_COMPONENTES.md`
- La primera implementación real del patrón es el módulo `Activos`.
- Cuando una nueva pantalla adopte el patrón, debe reutilizar `CheckAppDynamicGrid` y `CheckAppFilterAccordion`; no crear variantes locales paralelas salvo autorización expresa.

## Regla documental permanente

- Todo trabajo, decisión de Product Owner, regla de negocio, restricción, arquitectura, estado de QA, funcionalidad aprobada, brecha pendiente y cierre de etapa del proyecto debe registrarse en `AGENTS.md` y `CLAUDE.md` dentro de la misma iteración.
- `AGENTS.md` y `CLAUDE.md` deben mantenerse sincronizados y no pueden contradecirse.
- Si una corrida solo confirma el estado real de una funcionalidad, ese resultado también debe quedar asentado en ambos documentos.

## Ajustes > Configuración > Correo saliente

- Desde el `2026-08-13`, `Ajustes > Configuración > Correo saliente` se define como un subsistema exclusivo para correo saliente de documentos de negocio.
- Su alcance funcional autorizado incluye únicamente:
  - cotizaciones
  - órdenes de compra
  - documentos comerciales u operativos destinados al cliente autorizados explícitamente por Product Owner
- No pertenece a la infraestructura base de autenticación ni al correo técnico interno.
- Debe permanecer aislado de:
  - `LoginController`
  - registro
  - recuperación de contraseña
  - Firebase Authentication
  - `MailRegistro`
  - `EmailServices` cuando opere como servicio compartido legacy de autenticación o correo base
  - `mail.supervisores.mx`
- La auditoría previa confirmó que el modelo actual basado en `MailRegistro` es global y compartido; ese hallazgo debe tratarse como evidencia de riesgo y no como invitación a reutilizar esa arquitectura para el nuevo módulo.
- Regla arquitectónica vigente:
  - el nuevo correo saliente documental debe tener persistencia, prueba y configuración aisladas por empresa
  - no debe sustituir ni refactorizar la infraestructura base protegida en la misma iteración
  - no debe modificar consumidores legacy fuera de alcance mientras el Product Owner no lo autorice
- La empresa QA autorizada para este subsistema es `163`.
- El alta visual aprobada en menú es aditiva:
  - `Ajustes`
  - `Configuración`
  - `Correo saliente`
  - `Configuración` debe insertarse después de `Operadores`
- QA Google Workspace del `2026-08-14`:
  - configuración visible en sesión reutilizada:
    - cuenta `denisse@checkapp.com.mx`
    - host `smtp.gmail.com`
    - puerto `465`
    - seguridad `SSL/TLS`
  - verificación de infraestructura desde terminal:
    - `smtp.gmail.com` resolvió por DNS
    - `smtp.gmail.com:465` negoció TLS válido con certificado para `smtp.gmail.com`
  - resultado funcional real desde la pantalla:
    - la UI permaneció mostrando `La respuesta del servidor no pudo interpretarse.`
    - no se observó evidencia de conexión saliente del backend hacia `smtp.gmail.com:465` durante la corrida
  - dictamen actual:
    - `Correo saliente documental` con Google Workspace no quedó certificado en esta iteración
    - la causa raíz probable queda aguas arriba de SMTP, entre disparo útil de UI y/o proxy MVC/API, y debe auditarse sin exponer secretos
  - corrección parcial aplicada en la misma fecha:
    - `checklist/Controllers/Configuracion/ConfiguracionController.cs` ahora fuerza contrato JSON en el proxy MVC para `Obtener/Probar/GuardarCorreoSaliente`
    - el proxy agrega `Accept: application/json`, envía `application/json` explícito y sanea respuestas vacías, no JSON o excepciones internas con payload JSON controlado
    - el texto `La respuesta del servidor no pudo interpretarse.` quedó identificado como error del cliente en `wwwroot/js/Configuracion/CorreoSaliente.js -> readJson(response)` cuando recibe algo no parseable como JSON
  - estado real posterior a la corrección parcial:
    - `localhost:5200` compiló y quedó relanzado con el proxy endurecido
    - la pestaña real de Chrome permitió ubicar el botón `Enviar correo de prueba`, pero la automatización disponible no reprodujo una corrida completa con las mismas capacidades de un navegador interactivo normal
    - no quedó evidencia concluyente de POST útil entrando a `ProbarCorreoSaliente` ni de SMTP certificado desde la UI en esta iteración
  - QA manual asistido concluido el `2026-08-14`:
    - Denisse ejecutó manualmente un único clic real en `Enviar correo de prueba`
    - evidencia técnica observada en `localhost:5200`:
      - `POST /Configuracion/ProbarCorreoSaliente` sí salió de UI a MVC
      - MVC llamó `POST http://localhost:5127/api/CorreoSaliente/ProbarConfiguracion?...`
      - MVC recibió `200 OK` con `Content-Type: application/json` y longitud `479`
    - evidencia funcional observada en la pantalla:
      - mensaje UI `Correo de prueba enviado correctamente.`
      - estado `Verificada`
      - `Guardar configuración` habilitado
    - guardado y persistencia:
      - se ejecutó un único guardado posterior con `POST /Configuracion/GuardarCorreoSaliente`
      - MVC recibió `200 OK` con `Content-Type: application/json` y longitud `480`
      - tras recarga, `ObtenerConfiguracion` respondió `200 OK` con `application/json` y longitud `331`
      - persistieron cuenta, host `smtp.gmail.com`, puerto `465`, seguridad `SSL/TLS` y estado `Verificada`
    - seguridad:
      - la contraseña no regresó visible al navegador
      - tras guardar/recargar, la UI mostró únicamente `Contraseña configurada. Déjala vacía para conservarla.`
    - certificación:
      - `Correo saliente documental` con Google Workspace quedó certificado a nivel UI/MVC/API y persistencia local del módulo
      - la recepción en buzón externo queda pendiente de validación manual de Denisse
  - microcorrección final de fecha/hora concluida el `2026-08-14`:
    - causa raíz exacta:
      - `ProbarConfiguracion` y `GuardarConfiguracion` generaban `FechaUltimaPrueba` con `DateTime.UtcNow`
      - SQL la persistía en `dbo.ConfiguracionCorreoSaliente.FechaUltimaPrueba` como `datetime2`, sin offset
      - al releer desde SQL, `SqlDataReader.GetDateTime()` devolvía `Kind=Unspecified`
      - `System.Text.Json` serializaba ese valor rerecuperado sin sufijo `Z`
      - `wwwroot/js/Configuracion/CorreoSaliente.js -> formatDate()` hacía `new Date(value)`, por lo que el valor rerecuperado se interpretaba como hora local y mostraba `8:59 p.m.` en lugar del mismo instante local `2:59 p.m.`
    - estrategia final:
      - el módulo conserva persistencia UTC
      - el API vuelve a marcar explícitamente como UTC las fechas rerecuperadas desde SQL antes de serializarlas
      - el frontend sigue convirtiendo el instante a zona local del navegador para presentación
    - archivo modificado:
      - `inspectorapi/checklistWs/Controllers/Configuracion/CorreoSalienteController.cs`
    - resultado QA:
      - tras recargar la pantalla con la configuración ya guardada, `Última prueba` volvió a mostrarse como `14 ago 2026, 2:59 p.m.`
      - desapareció el desplazamiento visual de `+6` horas
      - SMTP, `Verificada`, `Guardar`, persistencia y protección de contraseña permanecieron intactos

## Vertical Cotizaciones

### Alcance y reglas globales

- El vertical oficial vive en `checklist` bajo MVC `http://localhost:5200` y API `http://localhost:5127`.
- La referencia visual obligatoria del proyecto es `Activos`; Cotizaciones debe usar el Patrón CheckApp sin modificar `Activos`.
- `Sazmobile26` es fuente legacy de solo lectura para auditoría funcional; no se modifica.
- Está prohibido introducir tallas o curvas comerciales en Cotizaciones; la regla es `NO TALLAS`.
- No crear roles ni permisos nuevos para Cotizaciones sin autorización expresa del Product Owner.
- No modificar `Login`, `Firebase`, `Sesión`, `SQL`, `otros verticales` ni contratos de API fuera de alcance explícito.
- QA manual del Product Owner prevalece sobre cualquier certificación automática.
- Las microiteraciones posteriores no deben romper funcionalidades ya aprobadas del vertical.
- Si Codex inicia procesos locales para QA, solo esos procesos deben detenerse al finalizar; listeners preexistentes no se tocan.

### Etapa 00

- Se preparó el vertical con entrada de menú `Cotizaciones` y operación `ABC Cotizaciones`.
- Ruta base documentada: `/Cotizaciones/Index`.
- No se autorizaron roles ni permisos nuevos para esta etapa base.

### Etapa 01

- Se migró la funcionalidad base desde `Sazmobile26` en modo solo lectura.
- Cobertura funcional migrada o adaptada:
  - listado
  - nueva cotización
  - cliente
  - sucursal
  - vigencia
  - observaciones
  - productos
  - servicios
  - partidas
  - cantidad
  - precio
  - descuento
  - subtotal
  - total
  - guardado
  - borrador
  - edición
  - clonación
  - cancelación
  - PDF
- La regla operativa explícita desde esta etapa es `NO TALLAS`.

### Etapa 02

- Se implementó la distribución y autorización de cotizaciones.
- Cobertura documentada:
  - autorización
  - PDF
  - WhatsApp
  - correo
  - compartir
  - estados `Borrador`, `Autorizada` y `Cancelada`
  - modo solo lectura cuando corresponde

### Etapa 03

- Se ejecutaron mejoras UX/UI de `Nueva cotización` siguiendo el Patrón CheckApp.
- Áreas intervenidas y aprobadas dentro del alcance:
  - resumen
  - colapsado inteligente
  - cliente
  - descuento
  - datos de cotización
  - observaciones
  - productos y servicios
  - imágenes
  - detalle operativo
  - responsive
  - popup PDF
  - regreso al Reporte

### Etapa 03.1

- Se auditó la diferencia entre `descuento cliente` y `descuento partida`.
- Regla heredada validada contra legacy Android:
  - descuento automático por partida = `max(descuentoProductoBase, descuentoCliente)`
  - tope automático de `10%`
  - salvo edición manual autorizada por el flujo operativo

### Etapa 03.2

- Se corrigió el payload de clientes para exponer `Descuento` en el flujo de cotización.
- Caso de control documentado:
  - cliente `Sadie Sink`: `5%`
  - producto `$680`
  - descuento automático `$34`
  - total de partida `$646`
- Cliente control alterno con `0%` validado como referencia.

### Etapa 03.3

- Se compactó exclusivamente el `Detalle Operativo` en desktop.
- Ajustes permitidos y aplicados:
  - `Unidad`
  - `Cantidad`
  - `Precio`
- Restricción documentada:
  - no romper `tablet`
  - no romper `mobile`

### Etapa 04

- Se auditó y corrigió el problema de `localhost` en la distribución por WhatsApp.
- Estado real certificado después de la corrección:
  - WhatsApp abre el chat correcto
  - usa el teléfono correcto
  - mensaje limpio
  - no contiene `localhost`
  - no contiene `GUID`
  - no contiene endpoints internos
  - el PDF se genera
  - el PDF se descarga o queda preparado
- Pendiente real de WhatsApp:
  - el PDF no queda adjunto automáticamente al chat
  - este punto queda `pendiente de definición técnica web`
- Estado real de correo:
  - frontend funcional
  - destinatario, asunto y mensaje funcionales
  - PDF generado y adjunto preparado correctamente
  - `EmailServices` invocado correctamente
  - bloqueo actual: `mail.supervisores.mx` no resuelve por DNS
  - correo queda `bloqueado por infraestructura/configuración SMTP`
  - no tocar SMTP hasta identificar la infraestructura oficial

### Etapa 04.2

- La auditoría final de distribución diferencia explícitamente dos flujos:
  - `Web Share API` con archivos
  - apertura de chat mediante `wa.me`
- El navegador real auditado en esta etapa no expone:
  - `navigator.share`
  - `navigator.canShare`
  - soporte `files` para compartir PDF como archivo
- Con el navegador actual, `wa.me` solo puede transportar texto; no existe evidencia real de adjunto automático de PDF al chat.
- La clasificación técnica vigente del flujo WhatsApp es:
  - PDF preparado o descargado
  - WhatsApp abierto con texto limpio
  - adjunto manual requerido por el usuario
- Recomendación UX pendiente de autorización posterior:
  - informar explícitamente que el PDF quedó preparado para adjuntarlo manualmente en WhatsApp

## Ajustes > Configuración > Correo saliente

- El `2026-08-13` se cerró la auditoría preimplementación del nuevo nodo transversal `Ajustes > Configuración > Correo saliente`.
- Alcance de esa corrida:
  - solo auditoría y planeación
  - sin implementación
  - sin SQL
  - sin cambios a `EmailServices`
  - sin cambios a `Firebase`
  - sin cambios a menú real
- Árbol aprobado por Product Owner para futura implementación:
  - `Ajustes`
  - `Configuración`
  - `Correo saliente`
- Regla confirmada:
  - `Configuración` debe insertarse después de `Operadores`
  - `Correo saliente` será el único hijo inicial
- Hallazgos reales de auditoría:
  - el servicio vigente es `checklist/Services/EmailServices.cs`
  - `EmailServices` no resuelve SMTP por sí mismo; consume un `MailRegistro` ya hidratado
  - la fuente actual real de SMTP es `MailRegistro` en Firebase Realtime Database
  - los consumidores reales auditados son `LoginController` y `CotizacionesController`
  - no se encontró configuración SMTP por empresa en SQL, API, `appsettings` ni variables de entorno operativas
  - el modelo actual es global y no multitenant
  - por eso Cotizaciones hereda el bloqueo documentado de `mail.supervisores.mx`
- Riesgo arquitectónico confirmado:
  - hoy un tenant puede quedar atado a la misma cuenta SMTP global que otros tenants
- Decisión técnica propuesta, pendiente de Product Owner:
  - reutilizar `EmailServices` como servicio único
  - reemplazar la fuente global `MailRegistro` por una fuente oficial tenant por empresa
  - no crear un segundo sistema de correo
  - no devolver la contraseña real al navegador después de guardarla
- Recomendación de comportamiento, pendiente de Product Owner:
  - permitir `Guardar` sin prueba y marcar estado `No verificada`
- Entregable documental oficial:
  - `docs/configuracion/CORREO_SALIENTE_AUDITORIA_PREIMPLEMENTACION.md`
