# Recolecciones BL26

## Objetivo del sprint R0 + R1

Construir una ruta paralela y aislada para recolecciones BL26 dentro del frontend legacy, usando la API local real y sin tocar el flujo aprobado de `/ContestarLista/Index`.

## Ruta activa

- Nueva ruta BL26:
  - `http://localhost:5200/ContestarLista/RecoleccionesBL26`
- Ruta legacy protegida:
  - `http://localhost:5200/ContestarLista/Index`

## Alcance implementado en este sprint

- Host MVC independiente para BL26.
- Shell responsive desktop, tablet y movil.
- Seleccion real de:
  - lista
  - sucursal
  - responsable
- Solicitud de geolocalizacion unicamente al iniciar la recoleccion.
- Carga real de preguntas desde la API local.
- Contexto visible de inspeccion durante la captura inicial.
- Primer render funcional de preguntas con tipos legacy:
  - `1` calificacion
  - `2` opcion simple
  - `3` opcion multiple
  - `4` texto
  - `5` numerico
  - `6` fecha
- Estados UX visibles para:
  - listas
  - sucursales
  - responsables
  - GPS
  - cuestionario
  - sesion expirada

## Fuera de alcance en este sprint

- Guardado de respuestas.
- Autosave.
- Drafts.
- Hallazgos.
- Firmas.
- Envio final.
- Sincronizacion.
- Offline real.
- Evidencia de fotos o video.

## Archivos principales

- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/HomeController.cs`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/ContestarLista/ContestarLista.cs`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Views/ContestarLista/RecoleccionesBL26.cshtml`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Shared/_Layout.cshtml`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ContestarLista/RecoleccionesBL26.js`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/ContestarLista/RecoleccionesBL26.css`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Utilerias.js`

## Endpoints reutilizados

Sin crear WS nuevos ni modificar backend:

- `api/Usuario/ObtenerUsuarioPorEmail`
- `api/Evaluaciones/ObtenerComboProgramasXAlumno`
- `api/Sucursal/ObtenerSucursalesPorUsuario`
- `api/Usuario/ObtenerUsuariosCompletoXSucursal`
- `api/Evaluaciones/Evaluacion/ObtenerPreguntasXPrograma`
- `ListasPreguntasOpciones/GetPregunta`

## Regla operativa de listas ejecutables

- La pantalla de inspección no debe consumir el catálogo general de listas cerradas.
- Una lista es ejecutable únicamente cuando:
  - pertenece a la empresa autenticada
  - `Estado = 2`
  - `Status = 1`
  - `Activo = 1`
  - contiene al menos una pregunta activa en `ListasPreguntas.Status = 1`
- No existe campo `borrado` en `Listas`; esa regla no aplica a este módulo con el modelo actual.
- No existe evidencia de una asignación adicional por usuario dentro del endpoint legacy de listas; la regla vigente observada hoy es por empresa y ejecutabilidad del contenido.

## Decisiones tecnicas

- BL26 vive en acciones, vista y assets propios para minimizar regresion.
- Se mantiene el controlador legacy, pero las acciones nuevas usan nombres independientes.
- La geolocalizacion no se solicita al abrir la pagina.
- La geolocalizacion se exige unicamente al presionar `Comenzar recoleccion`.
- No se persisten respuestas ni estado de captura en este sprint.
- La carga de opciones para preguntas tipo `2` y `3` se resuelve con el contrato legacy existente por pregunta.

## Regresion protegida

- No se modifico la vista legacy `Index.cshtml`.
- No se modifico `wwwroot/js/ContestarLista/ContestarLista.js`.
- No se modificaron contratos de guardado legacy.
- No se modificaron endpoints backend ni esquema de base de datos.
- No se agregaron permisos nuevos, roles nuevos ni cambios de datos para exponer BL26.

## Riesgos conocidos

- La carga de opciones por pregunta es secuencial y puede crecer en tiempo con listas muy largas.
- El cuestionario BL26 renderiza captura inicial en modo visual, pero aun no persiste respuestas.
- Si la sesion local no contiene contexto valido, la ruta se protege mostrando estado de sesion expirada.

## Validacion esperada

- Backend local activo en `http://localhost:5127`
- Frontend local activo en `http://localhost:5200`
- Ruta nueva responde en:
  - `http://localhost:5200/ContestarLista/RecoleccionesBL26`
- Ruta legacy sigue respondiendo en:
  - `http://localhost:5200/ContestarLista/Index`

## Historial

### 2026-07-21

- Se ajusto la experiencia de captura para que la pregunta activa sea la superficie principal en:
  - telefono
  - tablet vertical
  - tablet horizontal
- La composicion de captura quedo reordenada para priorizar:
  - pregunta activa
  - progreso compacto
  - preparacion plegable
  - indice disponible sin competir visualmente con el cuestionario
- En el estado iniciado:
  - `Cuestionario por secciones` pasa al primer plano
  - `Preparacion` deja de duplicarse debajo de la captura
  - `Progreso` puede plegarse
  - `Indice` sigue disponible como soporte y no como bloque dominante
- Se conservaron sin cambio:
  - contratos
  - endpoints
  - autenticacion
  - Firebase
  - SQL
  - reglas de negocio
- La ruta sigue mostrando cuestionario real con:
  - secciones
  - progreso
  - comentario
  - navegacion
  - validacion visual de respuesta obligatoria
- Se mantuvo la regla de no exponer en UI:
  - API
  - Firebase
  - UID
  - GUID
  - token
  - SQL
  - HTTP
  - mensajes tecnicos
- Se documento por separado la propuesta de identidad dual:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/operadores-identidad-dual-propuesta.md`

### 2026-07-20

- Se rechazo la jerarquia visual previa de `RecoleccionesBL26` porque la preparacion, el contexto y el indice competian con la pregunta activa, especialmente en movil y tablet.
- Se reimplemento la superficie visual sin cambiar contratos, endpoints ni reglas de negocio:
  - antes de iniciar domina `Preparar inspeccion`
  - despues de iniciar domina `Cuestionario por secciones`
  - la preparacion se colapsa automaticamente al entrar en captura
  - el contexto pasa a una franja compacta
  - el indice deja de vivir como tarjeta grande al fondo y queda disponible como rail en desktop o panel invocable en tablet/movil
  - desaparecen las tarjetas duplicadas del estado iniciado
- Se ajusto la composicion responsive en:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ContestarLista/RecoleccionesBL26.js`
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/ContestarLista/RecoleccionesBL26.css`
- Se activo `asp-append-version` en la vista para asegurar que el navegador tome los assets nuevos sin depender de cache manual:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/Views/ContestarLista/RecoleccionesBL26.cshtml`
- Validacion visual realizada con contenido real de preguntas ya observado en la ruta autenticada:
  - `Acomodo del producto`
  - `Limpieza de piso`
  - secciones visibles:
    - `Producto`
    - `Instalaciones`
- Matriz de validacion revisada para la nueva jerarquia:
  - `1440x900`
  - `1024x768`
  - `768x1024`
  - `430x932`
  - `400x774`
  - `375x812`
- Resultado esperado certificado para QA manual:
  - la pregunta aparece dentro del primer tramo visible despues de iniciar
  - el indice sigue disponible durante la captura
  - la preparacion queda plegable y no vuelve a dominar la pantalla iniciada
  - desktop centra el cuestionario
  - tablet prioriza la pregunta
  - movil llega a la pregunta sin obligar a recorrer tarjetas redundantes
- Riesgo operativo documentado:
  - la sesion autenticada de navegador se perdio durante la validacion final y la URL protegida redirigio a login
  - para cerrar la validacion visual se uso el frontend actual con las mismas preguntas reales ya observadas, sin tocar Firebase, datos ni contratos

### 2026-07-17

- Se creo la base aislada de Recolecciones BL26.
- Se agregaron acciones nuevas en el controlador legacy para consumo local sin romper la ruta aprobada.
- Se implemento host responsive con contexto, GPS bajo demanda y primer render de preguntas reales.
- Se habilito `Recolecciones BL26` dentro del menu dinamico real en `HomeController.BuildMenu`.
- La nueva opcion reutiliza el permiso legacy `02001000` de `Nueva` dentro del grupo `02000000 Recolecciones`.
- Se preservaron intactas las opciones existentes:
  - `Nueva` -> `/ContestarLista/Index`
  - `Listado` -> `/Resultados/Resultados`
  - `Detalle` -> `/Respuestas/Respuestas`
- Se agrego sincronizacion visual para que el grupo `Recolecciones` quede expandido y `Recolecciones BL26` quede activo al entrar a `/ContestarLista/RecoleccionesBL26`.
- Se agrego hidratacion defensiva de `sessionStorage` desde la vista BL26 para evitar menu vacio en recarga completa.
- Reinicio documentado del frontend local en `5200`:
  - proceso previo confirmado y sustituido: PID `24858`
  - comando sustituido: `/Users/denissemendiola/dev/CheckList_Original/checklist/bin/Debug/net8.0/checklist --urls=http://localhost:5200`
  - proceso final activo para QA manual: PID `26568`
- Validacion autenticada real desde menu:
  - usuario visible: `Denisse CheckApp`
  - empresa visible: `UMBRELLA CORP`
  - el submenu `Recolecciones` mostro `Nueva`, `Listado`, `Detalle` y `Recolecciones BL26`
  - la opcion nueva navego correctamente a `/ContestarLista/RecoleccionesBL26`
  - se cargaron listas reales en BL26
- Bloqueo real de certificacion R0-R1 sin alterar datos:
  - `GET /ContestarLista/GetSucursalesRecoleccionesBL26` devolvio `{"d":[],"sessionExpired":false}`
  - `GET /api/Sucursal/ObtenerSucursalesPorUsuario` devolvio `[]`
  - con la sesion autenticada disponible no hubo sucursales para continuar a responsable, GPS e inicio de cuestionario
  - no se modifico base de datos, permisos ni contratos para forzar el flujo
- Validacion adicional del origen y trazabilidad de `idEmpresa`:
  - la fuente exacta es Firebase Realtime Database, no Firebase Authentication ni Firestore
  - nodo fuente auditado:
    - `Usuarios/{uid}` aporta `empresa = 163` y `correo`
    - `Conexiones/163` aporta `idEmpresa = b17aaece-2b78-4e35-b554-9e694eeb15a7`, `Nombre = UMBRELLA CORP`, `Cadena` y `Status`
  - el login resuelve `idEmpresa` tomando `usuario.empresa` como llave de `Conexiones` y copia `conexionFB.IdEmpresa` a:
    - respuesta JSON de `/Login/Ingreso`
    - `sessionStorage.idEmpresa`
    - `HttpContext.Session["idEmpresa"]`
    - claim `ClaimTypes.SerialNumber`
  - evidencia funcional observada para la sesion autenticada:
    - valor esperado desde Firebase: `b17aaece-2b78-4e35-b554-9e694eeb15a7`
    - valor observado en la vista BL26 hidratada desde sesion: `b17aaece-2b78-4e35-b554-9e694eeb15a7`
    - valor usado en la llamada auditada a sucursales: `b17aaece-2b78-4e35-b554-9e694eeb15a7`
  - comparacion Legacy vs BL26 para sucursales:
    - Legacy `GetSucursales` toma `idEmpresa` y `cadena` del navegador y solo `emailUser` desde sesion HTTP
    - BL26 `GetSucursalesRecoleccionesBL26` rehace `idEmpresa`, `cadena` y `correo` desde sesion HTTP antes de llamar a la API
    - BL26 reutiliza el mismo contexto autenticado, pero con una recuperacion mas segura que Legacy
  - riesgo de manipulacion:
    - el navegador si puede modificar `sessionStorage.idEmpresa`
    - la ruta BL26 lo mitiga porque prioriza `HttpContext.Session` y claims
    - Legacy todavia permite que parametros sensibles como `idEmpresa` y `cadena` viajen desde el navegador a su controlador
    - la API local no contrasta `idEmpresa` contra un token o sesion propia; confia en lo que recibe del frontend proxy
  - clasificacion de la auditoria:
    - `idEmpresa PROVIENE DE FIREBASE, PERO SU PROPAGACION ES INSEGURA`
  - riesgo clasificado:
    - `alto` a nivel arquitectura compartida por confianza historica en parametros del navegador
    - `bajo` para BL26 especificamente en sucursales despues de la resolucion por sesion
  - revision de la correccion preparada en API:
    - mantiene el filtro por `idEmpresa`
    - elimina la dependencia obligatoria de un rol valido para permitir evaluar `idSucursal` o `Supervisor`
    - compara `CorreoPersonal` o `CorreoInstitucional`
    - excluye sucursales con borrado logico
    - no reinicia ni valida runtime hasta que el Product Owner autorice el reinicio de `5127`
  - decision pendiente:
    - posponer reinicio de API y certificacion end-to-end hasta cerrar la observacion de trazabilidad segura del contexto tenant en los endpoints legacy compartidos
- Reinicio controlado y validacion del arreglo de sucursales:
  - autorizacion explicita del Product Owner para reiniciar solo la API local en `5127`
  - proceso anterior sustituido:
    - PID `10379`
    - comando `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/bin/Debug/net8.0/checklistWs`
  - proceso nuevo activo para QA manual:
    - PID `33739`
    - comando `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/bin/Debug/net8.0/checklistWs --urls=http://localhost:5127`
  - verificacion post-reinicio:
    - listener confirmado en `http://localhost:5127`
    - `GET /api/WsTest` devolvio `Hola Mundo`
- Cambio exacto certificado en `api/Sucursal/ObtenerSucursalesPorUsuario`:
  - `INNER JOIN Roles` -> `LEFT JOIN Roles`
  - comparacion por `CorreoPersonal` o `CorreoInstitucional`
  - filtro por `u.idEmpresa = @IdEmpresa`
  - exclusion de sucursales con `borrado = 1`
  - sin cambios de contrato, sin cambios de datos, sin secretos nuevos, sin cambios de esquema
- Certificacion funcional de sucursales BL26 por HTTP real:
  - frontend: `GET /ContestarLista/GetSucursalesRecoleccionesBL26`
  - API: `GET /api/Sucursal/ObtenerSucursalesPorUsuario`
  - `idEmpresa` usado: `b17aaece-2b78-4e35-b554-9e694eeb15a7`
  - correo auditado: `denisse@checkapp.com.mx`
  - respuesta observada:
    - `Africa`
    - `QA Relacion Ubicacion 20260703051746`
    - `QA Relacion Ubicacion 20260703051952`
    - `WillPharma`
  - validaciones:
    - cuatro sucursales activas obtenidas
    - sin duplicados
    - sin sucursales borradas
    - sin mezcla cross-company con `idEmpresa` incorrecta, donde la API devolvio `[]`
- Casos de regresion del endpoint de sucursales:
  - usuario auditado sin rol valido:
    - correo `denisse@checkapp.com.mx`
    - `idRol = 00000000-0000-0000-0000-000000000000`
    - puesto `Supervisor`
    - obtiene las cuatro sucursales activas permitidas
  - usuario con rol valido:
    - correos observados `excella@gmail.com` y `excella@tricell.com`
    - rol `SuperAdmin`
    - conserva el mismo conjunto de cuatro sucursales activas
  - empresa incorrecta:
    - respuesta `[]`
  - sucursales borradas:
    - excluidas por el endpoint corregido
- Flujo R0-R1 validado por endpoints del frontend local:
  - listas:
    - `GET /ContestarLista/GetListasRecoleccionesBL26` devolvio listas reales para el usuario
  - sucursales:
    - `GET /ContestarLista/GetSucursalesRecoleccionesBL26` devolvio cuatro sucursales
  - responsables:
    - `GET /ContestarLista/GetResponsablesRecoleccionesBL26` para `Africa` devolvio cinco responsables
  - cuestionario:
    - `GET /ContestarLista/GetCuestionarioRecoleccionesBL26` con lista `Revisión de Almacén`, sucursal `Africa` y responsable `Deni mtz mendiola`
    - devolvio dos preguntas reales
    - categorias observadas:
      - `Orden`
      - `Limpieza`
    - subcategorias observadas:
      - `Producto`
      - `Instalaciones`
    - tipo observado:
      - `2` opcion simple
    - opciones observadas embebidas:
      - `Si`
      - `No`
- GPS y prueba de manipulacion de `sessionStorage`:
  - por codigo BL26 mantiene la regla esperada:
    - no solicita GPS al abrir la vista
    - solo llama a `navigator.geolocation.getCurrentPosition` al presionar `Comenzar recoleccion`
  - por codigo del controlador BL26 el `idEmpresa` efectivo se reconstruye desde sesion HTTP o claims antes de llamar a la API
  - no fue posible automatizar desde esta sesion de herramientas una mutacion interactiva completa de `sessionStorage` ni una aceptacion real del prompt de GPS, porque el conector activo de navegador no expuso APIs de escritura/interaccion suficientes sobre la pestaña autenticada ya abierta
  - esta limitacion afecta la evidencia UI final, no el resultado HTTP ni la correccion del endpoint
- Regresion Legacy observada tras el reinicio:
  - `ContestarLista/Index` sigue sirviendo la vista legacy y mantiene sus selectores
  - `Resultados/GetSucursales` continua usando `api/Sucursal/ObtenerSucursales`
  - ese flujo legacy sigue incluyendo sucursales con borrado logico y no forma parte del arreglo de BL26

### 2026-07-18 — Fase R3, auditoria de persistencia controlada

- Decision final:
  - `Escenario C`
  - no se implemento persistencia en `RecoleccionesBL26`
  - no se modifico esquema
  - no se modificaron contratos legacy
  - no se reiniciaron procesos
- Motivo:
  - el modelo actual persiste respuestas sueltas en `ListasRespuestas` agrupadas por `evento`
  - no existe una cabecera de ejecucion propia del dominio legacy
  - no existe estado persistente para distinguir `abierta`, `en proceso` o `terminada`
  - no existe unicidad que impida dos ejecuciones equivalentes ni dos respuestas repetidas de la misma pregunta dentro del mismo flujo
  - la recuperacion actual no es confiable para otra sesion o dispositivo sin inventar una politica ambigua

#### Inventario del modelo auditado

| Modelo o tabla | Funcion actual | Cabecera/detalle | Estado | Puede reutilizarse |
|---|---|---|---|---:|
| `ListasRespuestas` | Persistir cada respuesta enviada por Legacy o Hibrida | Detalle | Activo | Parcial |
| `AnexoPregunta` | Persistir anexos por respuesta ya creada | Detalle | Activo | Parcial |
| `Respuesta` | DTO frontend para enviar una respuesta | Payload | Activo | Si |
| `listasRespuestas` | DTO backend para insertar en SQL | Payload | Activo | Si |
| `ListasRespuestasDetalle` | DTO de lectura agregada por consulta | Lectura | Activo | Parcial |
| `PreguntasXResponder` | Cargar cuestionario y metadatos de preguntas | Lectura | Activo | Si |
| `evento` en `ListasRespuestas` | Agrupar filas de una misma captura | Agrupador | Activo | Parcial |
| `nxt_iwq_inspector_state` | Estado ajeno al flujo legacy de respuestas | No aplica | Activo | No |

#### Campos y relaciones confirmadas

- Llave primaria:
  - `ListasRespuestas.id`
- Relacion con lista:
  - `ListasRespuestas.idLista`
- Relacion con usuario:
  - `ListasRespuestas.idUsuario`
- Relacion con sucursal:
  - `ListasRespuestas.idSucursal`
- Relacion con empresa:
  - `ListasRespuestas.idEmpresa`
- Relacion con pregunta:
  - `ListasRespuestas.idPregunta`
- Evento:
  - `ListasRespuestas.evento`
- Fecha:
  - `Fecha` y `FechaRespuesta`
- GPS:
  - `Latitud` y `Longitud`
- Estado persistente:
  - no existe columna de estado de ejecucion en `ListasRespuestas`
- Borrado:
  - no existe bandera de borrado en `ListasRespuestas`
- Edicion:
  - no existe mecanismo de update o versionado; el flujo actual inserta una fila nueva
- Unicidad:
  - no existe restriccion funcional visible para `empresa + lista + sucursal + usuario + evento + pregunta`

#### Ciclo de vida real disponible hoy

| Estado real | Campo | Valor | Uso actual | Reutilizable |
|---|---|---|---|---:|
| Sin respuestas | No aplica | No aplica | Antes del primer POST no existe ejecucion persistida | No |
| Grupo de respuestas por captura | `evento` | `Guid` generado en frontend | Agrupar filas insertadas en `ListasRespuestas` | Parcial |
| Resultado reportable | `evento` + filas existentes | No hay estado propio | Reportes y listados consultan por `evento` | Parcial |

#### Respuestas expresas del bloque 3

1. ¿Puede existir una cabecera antes de guardar respuestas finales?
   - No. El modelo actual no tiene cabecera propia para inspeccion abierta.
2. ¿Puede actualizarse despues?
   - No de forma nativa. El guardado observado es `INSERT`, no `UPDATE`.
3. ¿Puede guardar respuestas parciales?
   - Si, pero solo como filas definitivas sueltas en `ListasRespuestas`.
4. ¿Puede diferenciar abierta de terminada?
   - No.
5. ¿Puede localizar una ejecucion abierta de un usuario?
   - No de forma segura ni no ambigua.
6. ¿Puede evitar dos ejecuciones identicas?
   - No.
7. ¿Puede recuperarse desde otro dispositivo?
   - No con garantia usando solo el modelo actual.
8. ¿Puede conservar el cuestionario asociado?
   - Parcialmente; las filas guardan `idLista` e `idPregunta`, pero no existe una cabecera que congele el estado de la ejecucion.

#### Trazado completo del guardado legacy

| Paso | Archivo/metodo | Datos | Persistencia | Riesgo |
|---|---|---|---|---|
| 1 | `wwwroot/js/ContestarLista/ContestarLista.js` | Genera `evento` en cliente y arma payload por respuesta | Ninguna | El navegador controla el agrupador inicial |
| 2 | `Controllers/ContestarLista/ContestarLista.cs` `GuardarRespuesta` | Recibe `List<Respuesta>` | Ninguna | El flujo depende de datos enviados por cliente |
| 3 | `Controllers/ContestarLista/ContestarLista.cs` `EnviarRespuestas` | Convierte cada item a `ListasRespuestas` y hace POST individual | Ninguna | Si falla a mitad quedan respuestas parciales |
| 4 | `Controllers/Evaluaciones/EvaluacionesController.cs` `Guardar` | Inserta una respuesta y sus anexos | `ListasRespuestas` y `AnexoPregunta` | No se observo transaccion global por lote |
| 5 | `Controllers/Listas/ListasRespuestasController.cs` `GetLista` | Consulta respuestas agregadas por `evento` | Lectura SQL | La firma usa `idLista`, pero la consulta lo interpreta como `evento` |

- Momento en que se crea el evento:
  - en frontend legacy, antes del guardado
- Quien genera el identificador:
  - el navegador
- Que sucede si falla a mitad:
  - quedan filas parciales ya insertadas
- Si existe transaccion:
  - no se observo una transaccion que cubra todo el lote
- Si puede repetirse:
  - si; doble envio o reintento puede insertar duplicados
- Como se consultan resultados:
  - por consultas agrupadas sobre `ListasRespuestas.evento`
- Como se relacionan anexos:
  - `AnexoPregunta.idListaRespuesta` apunta a la fila insertada en `ListasRespuestas`

#### Evaluacion de reutilizacion

| Capacidad | Modelo actual suficiente | Requiere endpoint | Requiere datos/esquema |
|---|---:|---:|---:|
| Crear ejecucion | No | Si | Si |
| Guardar respuesta individual | Si, como insercion | Si | No |
| Actualizar respuesta | No | Si | Si |
| Recuperar ejecucion | No | Si | Si |
| Marcar terminada | No | Si | Si |
| Evitar duplicado | No | Si | Si |
| Recuperar en otro dispositivo | No | Si | Si |

#### Alternativas descartadas

- Reusar `evento` generado en navegador como identidad persistente principal:
  - descartado porque no resuelve recuperacion segura entre sesiones ni evita duplicados
- Recuperar "la ultima captura" por `usuario + lista + sucursal`:
  - descartado por ambiguedad, ausencia de estado abierto y riesgo de mezclar ejecuciones terminadas o repetidas
- Persistencia en navegador:
  - descartada por prohibicion explicita de la fase

#### Cambio minimo propuesto para autorizacion futura

- Tabla propuesta:
  - una cabecera de ejecucion de inspeccion
- Columnas minimas:
  - `id`
  - `idEmpresa`
  - `idLista`
  - `idSucursal`
  - `idResponsable`
  - `idInspector`
  - `fechaInicio`
  - `fechaActualizacion`
  - `latitudInicial`
  - `longitudInicial`
  - `estado`
  - `evento` legacy opcional para compatibilidad
- Relacion:
  - `1:N` entre cabecera de ejecucion y respuestas de detalle
- Impacto:
  - permitiria crear o recuperar una ejecucion abierta sin depender del navegador
- Compatibilidad:
  - puede convivir con `ListasRespuestas` manteniendo el detalle actual
- Migracion:
  - agregar cabecera y enlazar nuevas respuestas a esa identidad
- Reversibilidad:
  - alta si se mantiene el detalle actual intacto
- Riesgos:
  - requiere definir politica de cierre, recuperacion y unicidad

#### Seguridad tenant y concurrencia

- El frontend BL26 ya rehace contexto tenant desde sesion HTTP para listas, sucursales, responsables y cuestionario.
- Esa mejora no resuelve la identidad de ejecucion porque el modelo actual sigue aceptando un `evento` generado por cliente.
- No hay garantia contra:
  - doble clic en iniciar
  - doble clic en guardar
  - reintento despues de timeout
  - pestañas multiples
  - otra sesion o dispositivo del mismo usuario

#### QA y regresion de esta fase

- No se implemento vertical persistente porque no cumple los criterios de aceptacion sin cambiar modelo.
- No hubo cambios funcionales en:
  - `R0`
  - `R1`
  - `R2`
  - `/ContestarLista/Index`
  - `/Listas/CreadorLista`
  - `/Listas/CreadorListaBL26`
  - `Categorias`
  - `Subcategorias`
- No hubo reinicios en esta fase.
- Procesos disponibles al cierre:
  - frontend `5200`: PID `49768`
  - API `5127`: PID `49759`
- Base de datos:
  - sin cambios de esquema
  - sin cambios de datos estructurales
  - solo auditoria de lectura

#### Autorizacion pendiente

- Se requiere autorizacion expresa del Product Owner para introducir una identidad persistente de ejecucion y su estado.

### 2026-07-18 — Propuesta técnica de modelo para persistencia R3

- Se elaboró una propuesta técnica separada en:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/recolecciones-r3-modelo-persistencia.md`
- Decisión propuesta, aún no aprobada:
  - crear una cabecera nueva de ejecución
  - agregar `idEjecucion` en `ListasRespuestas`
  - conservar `evento` como compatibilidad para reportes y resultados Legacy
- Restricción vigente:
  - no implementar persistencia real en `RecoleccionesBL26` hasta recibir autorización expresa del Product Owner para ese cambio mínimo de modelo

### 2026-07-18 — Certificación previa del cambio de esquema R3

- El Product Owner aprobó en principio la arquitectura:
  - cabecera nueva de ejecución
  - columna nullable `idEjecucion` en `ListasRespuestas`
  - compatibilidad por `evento`
  - endpoints aislados
- Aún no existe autorización final para ejecutar cambios sobre la base.
- Se prepararon sin ejecutar:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/recolecciones-r3-up.sql`
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/recolecciones-r3-down.sql`
- Hallazgos clave de certificación:
  - el motor observado soporta índices filtrados y `rowversion`
  - `ListasRespuestas` no tiene FKs declaradas y `Listas.id` no expone PK declarada en metadata
  - el índice único simple `idEjecucion + idPregunta` no es compatible con preguntas tipo `3`
  - la propuesta final usa:
    - índice único filtrado para tipos distintos de `3`
    - índice de recuperación por `idEjecucion`
    - unicidad de `eventoLegacy` en la cabecera nueva
  - el riesgo tenant legacy queda documentado como deuda separada y no se amplio este sprint
- Deuda de seguridad separada:
  - flujos legacy siguen aceptando `idEmpresa`, `cadena`, `empresa` o `correo` desde navegador
  - BL26 ya recompone el contexto desde sesion HTTP/claims
  - se recomienda migracion gradual por modulo, sin cambio masivo ni ruptura de contratos
- Compilacion:
  - backend compilado con `0` errores y warnings heredados
  - frontend compilado con `0` errores y warnings heredados
  - no se detectaron warnings nuevos atribuibles al cambio de sucursales

### 2026-07-17 — Cierre de QA posterior al arreglo de catálogos

- Alcance:
  - solo validación final de compatibilidad
  - sin cambios funcionales en Recolecciones
  - sin reinicios adicionales
- Proceso disponible durante el QA:
  - frontend activo en `http://localhost:5200`
  - API activa en `http://localhost:5127`
- Validación visual en Chrome sobre `http://localhost:5200/ContestarLista/RecoleccionesBL26`:
  - la ruta siguió cargando
  - el menú `Recolecciones` conservó:
    - `Nueva`
    - `Listado`
    - `Detalle`
    - `Recolecciones BL26`
  - la pantalla mostró shell operativo real con:
    - selector de lista poblado
    - selector de sucursal poblado
    - selector de responsable visible
    - botón `Comenzar recoleccion`
  - listas visibles en la sesión auditada:
    - `Revisión de Almacén`
    - múltiples listas QA históricas
  - sucursales visibles en la sesión auditada:
    - `Africa`
    - `QA Relacion Ubicacion 20260703051746`
    - `QA Relacion Ubicacion 20260703051952`
    - `WillPharma`
- Compatibilidad con el arreglo de catálogos:
  - el ajuste de categorías/subcategorías ocurrió solo en lectura de `Notas` dentro de los WS globales
  - no alteró contratos de preguntas ni de recolecciones
  - no se observaron regresiones visibles en el arranque de la ruta BL26
- Riesgo de sesión observado:
  - durante esta pasada apareció el modal `Se inició sesión en otro dispositivo con su usuario`
  - el modal no fue corregido en esta tarea
  - se documenta como deuda separada de autenticación y continuidad de QA
- Evidencia funcional complementaria preservada:
  - la ruta siguió mostrando listas y sucursales reales desde la sesión autenticada
  - no apareció ninguna traza relacionada con `Data is Null`
  - no hubo señales de que el arreglo de catálogos afectara el render de Recolecciones

### 2026-07-17 — Auditoría operativa previa a R2

- Alcance:
  - definir reglas reales del flujo
  - separar estados visibles válidos de estados heredados
  - retirar lenguaje técnico visible sin cambiar contratos
- Textos visibles corregidos:
  - `Recolecciones BL26` -> `Inspeccion en campo`
  - `Ruta paralela para inspecciones de campo con API local real` -> `Captura de inspecciones de campo`
  - mensajes con `API local`, `sprint`, `preview operativo`, `solo lectura operativa` y `primer render funcional` -> textos de operación para usuario final
- Matriz de actores y elementos visibles:

| Actor | Pantalla | Qué selecciona | Qué solo observa | Regla real |
| --- | --- | --- | --- | --- |
| inspector | `RecoleccionesBL26` | lista, sucursal, responsable | categorias, subcategorias y preguntas | categorías y subcategorías viajan dentro del cuestionario, no como catálogos editables |
| creador/editor | `CreadorListaBL26` | lista, tarea, categoría, subcategoría | preview móvil | configura la estructura que luego responde el inspector |
| administrador/editor | `CategoriasABC` / `SubcategoriasABC` | catálogo correspondiente | no aplica | mantiene catálogos globales por empresa |

- Estados de lista observados en la empresa auditada:

| Estado real | Aparece hoy en recolecciones | Debería aparecer | Acción |
| --- | --- | --- | --- |
| cerrada + `Status = true` + preguntas activas | sí | sí | conservar |
| cerrada + `Status = true` + `0` preguntas activas | sí | no idealmente | documentado para R2; hoy deriva del endpoint legacy compartido |
| cerrada + `Status = false` | sí en el contrato heredado | no idealmente | documentado para R2; no se cambió sin autorización |
| en edición (`Estado = 1`) | no | no | correcto |

- Reglas funcionales confirmadas:
  - la lista disponible para inspección se obtiene desde `api/Evaluaciones/ObtenerComboProgramasXAlumno`
  - el cuestionario se obtiene desde `api/Evaluaciones/Evaluacion/ObtenerPreguntasXPrograma`
  - solo las preguntas con `lp.status = 1` llegan al inspector
  - las categorías y subcategorías mostradas al inspector provienen de cada pregunta activa, no del catálogo completo
  - el flujo sigue exigiendo GPS al iniciar, no al abrir la pantalla
- Mensajes técnicos y su tratamiento:

| Hallazgo | Estado final |
| --- | --- |
| etiquetas BL26 visibles al usuario | retiradas de menú y cabecera |
| mensajes que mencionaban `API local` o `sprint` | reemplazados por mensajes operativos |
| modal `Se inició sesión en otro dispositivo con su usuario` | documentado como deuda separada; sin cambio en esta tarea |

- Resultado operativo:
  - el flujo conserva compatibilidad con categorías y subcategorías tras el arreglo de `Notas = NULL`
  - `RecoleccionesBL26` sigue cargando listas, sucursales, responsables y preguntas
  - la deuda relevante antes de R2 no está en catálogos sino en el filtro heredado de listas ejecutables

### 2026-07-17 — Cierre controlado de R1 con listas ejecutables aisladas

- Objetivo cumplido:
  - la pantalla `Inspección en campo` deja de depender del endpoint legacy compartido para poblar listas
- Evidencia de estados reales certificada:

| Campo | Valores observados | Significado real | Evidencia |
| --- | --- | --- | --- |
| `Listas.Estado` | `1`, `2` | `1` diseño / edición, `2` cerrada para operación | consultas API `GetTodosSinFiltro`, `GetTodosCerradas`, datos reales de la empresa |
| `Listas.Status` | `0`, `1` | disponibilidad lógica real de la lista | listas cerradas visibles con `Status = 0` quedaban heredadas por el endpoint legacy |
| `Listas.Activo` | `1` en los datos auditados | bandera activa de la lista | tabla `Listas` |
| `ListasPreguntas.Status` | `0`, `1` | pregunta activa para ejecución | `ObtenerPreguntasXPrograma` y consultas a `ListasPreguntas` |
| `Listas.idEmpresa` | tenant autenticado | aislamiento por empresa | endpoint legacy y operación nueva |

- Diferencia diseño vs operación:

| Regla | CreadorListaBL26 | Inspección en campo |
| --- | --- | --- |
| `Estado = 1` | visible | no visible |
| `Estado = 2` | visible | visible solo si además es ejecutable |
| `Status = 0` | puede aparecer en catálogos legacy cerrados | excluida |
| sin preguntas activas | puede existir en histórico | excluida |
| otra empresa | excluida | excluida |

- Endpoint aislado de API:
  - `GET /api/Evaluaciones/ObtenerComboProgramasEjecutablesXAlumno`
  - aplica:
    - empresa
    - `Estado = 2`
    - `Status = 1`
    - `Activo = 1`
    - existencia de al menos una pregunta activa
  - no modifica contratos legacy previos
- Proxy aislado de frontend:
  - `GET /ContestarLista/GetListasEjecutablesRecoleccionesBL26`
  - reconstruye `idEmpresa`, `cadena`, `empresa` y `correo` desde sesión HTTP/claims
  - no usa `sessionStorage` como fuente final de tenant
- Datos auditados en la empresa validada:

| Lista | Estado | Status | Activo | Preguntas activas | Ejecutable |
| --- | --- | --- | --- | --- | --- |
| `Revisión de Almacén` | `2` | `1` | `1` | `2` | sí |
| `Lista 02` | `2` | `1` | `1` | `4` | sí |
| `Lista 01` | `2` | `1` | `1` | `0` | no |
| `Lista 001` | `2` | `1` | `1` | `0` | no |
| `CODEx Lista 2 1782244185` | `2` | `0` | `1` | `2` | no |
| `QA Close Probe 1784070458401` | `2` | `0` | `1` | `1` | no |

- Listas incluidas por la regla auditada:
  - `CODEx Lista 1782243979`
  - `CODEx QA 1784065087985 EDIT`
  - `Lista 02`
  - `Lista QA`
  - `QA Blazor 1784070436817`
  - `QA Sprint ToDo 1783406871758`
  - `QA Sprint ToDo 1783407251712`
  - `QA Wizard 1783443885107`
  - `Revisión de Almacén`
- Listas excluidas por la regla auditada:
  - listas en edición
  - listas con `Status = 0`
  - listas cerradas sin preguntas activas
  - listas de otra empresa
- Seguridad tenant:
  - la pantalla nueva sigue reconstruyendo el tenant desde sesión HTTP/claims
  - la prueba de mutación interactiva de `sessionStorage.idEmpresa` queda certificada por código y pendiente como verificación manual del Product Owner
- Prerrequisito inmediato de R2:
  - partir desde esta fuente aislada de listas ejecutables y no volver a usar el catálogo general de listas cerradas

### 2026-07-18 — Fase R2 con contestador funcional por secciones

- Archivos principales de R2:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ContestarLista/RecoleccionesBL26.js`
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/ContestarLista/RecoleccionesBL26.css`
- Alcance implementado:
  - una sola pregunta activa por vista
  - secciones principales por categoría
  - subcategoría como etiqueta secundaria
  - navegación `Anterior` y `Siguiente`
  - índice de secciones con progreso
  - navegación rápida por pregunta
  - progreso general, por sección y conteos de obligatorias pendientes
  - respuestas y comentarios temporales en memoria
  - validaciones inmediatas sin bloquear navegación
  - experiencia responsive para desktop, tablet y móvil
  - advertencia de salida accidental en navegación interna y cierre/recarga
- Alcance preservado fuera de R2:
  - sin guardado
  - sin envío
  - sin borradores persistidos
  - sin `localStorage`
  - sin `sessionStorage` para respuestas
  - sin cambios de API
  - sin cambios de base de datos

## Tipos reales certificados para R2

| Tipo | Significado observado | Control en R2 | Valor esperado | Opciones | Validaciones |
| ---: | --- | --- | --- | --- | --- |
| 1 | Calificación / estrellas | escala 1 a 5 | entero `1..5` | no | rango válido |
| 2 | Opción simple | radio | texto de opción | sí | una opción existente |
| 3 | Opción múltiple | checkbox | arreglo de textos | sí | una o más opciones existentes |
| 4 | Texto libre | textarea | texto | no | no vacío si es obligatoria |
| 5 | Numérico | input number | número | no | número válido |
| 6 | Fecha | input date | `yyyy-mm-dd` | no | fecha válida |

- Evidencia usada para fijar el significado:
  - `wwwroot/js/ContestarLista/ContestarLista.js` usa `valor = 1..6` para estrellas, radio, checkbox, texto, número y fecha
  - `checklistWs/Controllers/Evaluaciones/EvaluacionesController.cs` publica el mismo mapeo textual en detalle y reportes
  - el cuestionario real `Revisión de Almacén` devolvió tipo `2` con opciones `Si` y `No`

## Validaciones activas

| Tipo | Validación | Mensaje de negocio | Bloquea navegación |
| ---: | --- | --- | ---: |
| 1 | valor entre `1` y `5` | `Selecciona una calificación para esta pregunta.` | no |
| 2 | opción válida | `Selecciona una opción para esta pregunta.` | no |
| 3 | al menos una opción válida | `Selecciona al menos una opción para esta pregunta.` | no |
| 4 | texto no vacío en obligatorias | `Escribe una respuesta para esta pregunta.` | no |
| 5 | número válido | `Captura un valor numérico válido.` | no |
| 6 | fecha válida | `Selecciona una fecha válida.` | no |
| cualquier tipo sin opciones | contrato incompleto | `Esta pregunta no tiene opciones disponibles para capturarse.` | no |
| tipo desconocido | contrato no representable | `Esta pregunta no se puede capturar en esta pantalla.` | no |

## QA real del sábado 18 de julio de 2026

- Ruta validada:
  - `http://localhost:5200/ContestarLista/RecoleccionesBL26`
- Sesión autenticada observada:
  - usuario visible `Denisse CheckApp`
  - empresa visible `UMBRELLA CORP`
- Contexto real probado:
  - lista `Revisión de Almacén`
  - sucursal `Africa`
  - responsable `Excella Gionne Gionne`
- Resultados funcionales observados:
  - la pantalla cargó el shell R2 por secciones
  - el cuestionario mostró `2` preguntas y `2` secciones
  - categorías visibles:
    - `Orden`
    - `Limpieza`
  - subcategorías visibles:
    - `Producto`
    - `Instalaciones`
  - `Pregunta 1 de 2` avanzó a `Pregunta 2 de 2` con `Siguiente`
  - `Anterior` regresó a la primera pregunta sin perder respuesta ni comentario
  - el progreso general pasó de `0%` a `100%`
  - el índice lateral pasó de `0/1` a `1/1` en ambas secciones
  - la navegación rápida distinguió `actual`, `respondida` y `obligatoria pendiente`
  - GPS quedó visible en contexto durante la captura
- Captura temporal validada:
  - pregunta 1:
    - opción elegida `Si`
    - comentario conservado `Producto acomodado y verificado en pasillo central.`
  - pregunta 2:
    - opción elegida `No`
    - comentario conservado `Se detecta humedad menor cerca del acceso.`
- Regresión protegida:
  - no reaparecieron textos técnicos visibles
  - la fuente de listas ejecutables siguió aislada
  - no hubo guardado ni envío durante la prueba
- Riesgo abierto:
  - la advertencia nativa de `beforeunload` no pudo certificarse de extremo a extremo con la automatización del navegador en recarga programática
  - el frontend quedó cableado con:
    - `window.addEventListener("beforeunload", ...)`
    - `window.onbeforeunload = ...`
    - intercepción de enlaces internos con confirmación
  - requiere verificación manual final en navegador real para cierre absoluto del comportamiento nativo de recarga/cierre

### 2026-07-20 — Pausa controlada por arquitectura de Operadores

- Por decisión del Product Owner se pausaron:
  - R3
  - persistencia
  - evidencias
  - resumen
  - cierre
  - y cualquier cambio adicional de `Inspección en campo`
- La continuidad de `RecoleccionesBL26` queda supeditada a la definición completa de `Operadores`.
- Hallazgos que impactan directamente al módulo:
  - el login vigente bloquea acceso por `Usuarios/{uid}.status` en Firebase Realtime Database
  - el `Estatus` del usuario en SQL no es suficiente por sí solo para negar login
  - `Inspección en campo` todavía reutiliza el permiso legacy `02001000` de `Nueva`
  - `RecoleccionesBL26` no tiene aún un permiso exclusivo propio
  - el modelo interno actual usa una sola `IdSucursal` por usuario
  - las listas ejecutables visibles hoy se filtran por empresa y ejecutabilidad, no por asignación individual de operador
  - sí existe `ListasProgramacion`, pero BL26 aún no la usa como restricción real por usuario
- Documento rector de esta pausa:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/operadores-arquitectura.md`

### 2026-07-20 — Dependencias concretas de Operadores sobre Recolecciones BL26

- `RecoleccionesBL26` no debe continuar a R3 ni a funciones avanzadas hasta cerrar estas dependencias:
  - permiso exclusivo para `Inspección en campo`
  - ruta inicial y navegación restringida de `Operador`
  - alta administrativa del operador con UID Firebase y usuario SQL consistentes
  - suspensión/reactivación con corte real de acceso
  - asignación de listas por operador
  - definición de responsable operativo
  - decisión final de una sucursal vs multisucursal
- Impacto esperado cuando se reanude el módulo:
  - la vista ya no debe mostrar listas ejecutables generales por empresa, sino listas asignadas al operador
  - con una sola sucursal no debe mostrarse selector
  - con varias sucursales solo debe mostrarse selector restringido a autorizadas
  - el responsable recomendado para V1 es el propio operador autenticado
  - el menú del operador debe exponer únicamente `Inspección en campo`
- Dependencias de autorización todavía no implementadas:
  - `RecoleccionesBL26` sigue dependiendo del permiso legacy `02001000`
  - no existe aún permiso exclusivo ni control server-side final para el rol `Operador`
- Dependencias de modelo todavía no implementadas:
  - el modelo vigente de `Usuarios` sigue siendo de sucursal única
  - la asignación actual de listas ejecutables sigue siendo por empresa
  - `ListasProgramacion` existe como base reutilizable, pero todavía no gobierna la visibilidad individual del operador

### 2026-07-21 — Implementación UX aprobada para QA manual

Resultado del ajuste visual:

- `Cuestionario por secciones` quedó como protagonista principal
- `Preparar inspección` pasó a comportamiento plegable y resumido
- el contexto operativo se integró dentro de la preparación
- `Ruta rápida` dejó de comportarse como tarjeta permanente y pasó a índice bajo demanda
- el progreso quedó visible durante la captura
- en móvil se priorizó una sola pregunta activa por vista
- en escritorio y tablet se simplificó la jerarquía para reducir bloques repetidos
- no se cambiaron reglas funcionales, contratos, persistencia ni endpoints

Archivos ajustados:

- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/ContestarLista/RecoleccionesBL26.js`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/ContestarLista/RecoleccionesBL26.css`

#### Cambios UX concretos

- encabezado compacto con:
  - estado
  - sección actual
  - porcentaje
  - barra de avance
  - acción `Salir`
- preparación resumida con contexto visible sin repetir tarjetas administrativas extensas
- barra superior del cuestionario con:
  - lista
  - sucursal
  - responsable
  - GPS
  - avance
  - sección actual
- índice lateral colapsable en escritorio y disparador accesible en vistas compactas
- eliminación de paneles duplicados y de la vista móvil secundaria permanente
- consolidación de la pregunta activa como superficie dominante de la pantalla

#### Certificación técnica

- verificación sintáctica satisfactoria:
  - `wwwroot/js/ContestarLista/RecoleccionesBL26.js`
  - `wwwroot/js/Operadores/Operadores.js`
- compilación satisfactoria:
  - frontend MVC local
  - API local

#### Validación funcional disponible en esta corrida

- la implementación quedó alineada con la decisión aprobada por Product Owner
- la estructura del shell ya responde con:
  - preparación
  - cuestionario
  - índice bajo demanda
  - progreso visible
- la navegación y la captura siguen dependiendo del mismo contexto funcional ya certificado en R2

#### Límite real de evidencia visual en navegador

- la validación visual autenticada completa no pudo cerrarse en esta corrida porque la sesión del navegador presentó conflicto de sesión compartida y expulsión al login en recorridos administrativos
- en la pestaña autenticada disponible para `RecoleccionesBL26`, la inspección visual quedó condicionada por ese contexto compartido
- por honestidad de auditoría, este documento no declara una certificación visual end-to-end superior a la evidencia realmente observada

#### Estado final para QA

- la UX aprobada quedó implementada sin tocar reglas de negocio
- el cuestionario conserva prioridad visual
- la preparación queda accesible y plegable
- el índice queda accesible sin competir permanentemente con la pregunta activa
