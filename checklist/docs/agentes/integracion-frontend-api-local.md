# Integracion frontend API local

Fecha: 2026-07-17

Frontend: `/Users/denissemendiola/dev/CheckList_Original/checklist`

Backend API: `/Users/denissemendiola/dev/checklistWs-Original/checklistWs`

Estado de AGENTS.md: no se encontraron archivos `AGENTS.md` aplicables en ninguno de los dos proyectos durante la auditoria inicial.

## Objetivo

Configurar el frontend para consumir la API local sin eliminar la configuracion publicada y sin modificar contratos, base de datos ni logica funcional de negocio.

## Decision aplicada

- Configuracion publicada preservada como referencia comentada.
- Configuracion local activa en `http://localhost:5127/`.
- Perfil local de API seleccionado: `http`.
- Puerto del frontend: `http://localhost:5200`.
- Puerto de la API: `http://localhost:5127`.
- No se agrego configuracion CORS porque el frontend ASP.NET consume la API principalmente desde el servidor y no se detecto una necesidad minima adicional para esta integracion.

## Matriz de auditoria de configuracion

| Archivo | Linea aproximada | URL/configuracion actual encontrada | Uso | Cambio requerido |
| --- | --- | --- | --- | --- |
| `Clases/Utilerias.cs` | 116 | `http://mahahual-001-site23.ltempurl.com/` | URL base central para consumo HTTP | Activar URL local y conservar publicada comentada |
| `Controllers/ContestarLista/ContestarLista.cs` | 247 | `http://mahahual-001-site23.ltempurl.com/api/Usuario/ObtenerUsuarioPorEmail...` | Lectura de usuario por email | Apuntar a `Utilerias.UrlBase` |
| `Controllers/ContestarLista/ContestarLista.cs` | 352 | `http://mahahual-001-site23.ltempurl.com/api/Evaluaciones...` | Envio de respuestas | Apuntar a `Utilerias.UrlBase` |
| `Controllers/ContestadorHibrido/ContestarListaHibrida.cs` | 55, 72, 119, 141, 164, 186, 202, 246, 293 | Dominio publicado hardcodeado en distintos endpoints | Flujos hibridos de lectura y guardado | Reemplazar solo los puntos necesarios para usar la base local centralizada |
| `wwwroot/js/ConnectionManager.js` | 5 | `http://mahahual-001-site23.ltempurl.com/` | Cadena JS expuesta al frontend | Activar URL local y conservar publicada comentada |

## Archivos modificados

- `Clases/Utilerias.cs`
- `Controllers/ContestarLista/ContestarLista.cs`
- `Controllers/ContestadorHibrido/ContestarListaHibrida.cs`
- `wwwroot/js/ConnectionManager.js`
- `../AGENTS.md`
- `/Users/denissemendiola/dev/checklistWs-Original/AGENTS.md`
- `docs/agentes/integracion-frontend-api-local.md`

## Restricciones preservadas

- No se modifico la API publicada.
- No se cambiaron contratos HTTP.
- No se altero autenticacion, autorizacion, Firebase, cookies ni tokens.
- No se modifico la base de datos, tablas, columnas, procedimientos, migraciones ni datos.
- No se introdujeron mocks ni fallbacks falsos.

## AGENTS obligatorios

- Se crearon `AGENTS.md` en ambos repositorios raiz:
  - `/Users/denissemendiola/dev/CheckList_Original/AGENTS.md`
  - `/Users/denissemendiola/dev/checklistWs-Original/AGENTS.md`
- Ambos registran:
  - frontend local;
  - backend local;
  - URLs activas;
  - preservacion de configuracion publicada;
  - responsabilidades por capa;
  - prohibicion de modificar esquema sin autorizacion;
  - obligacion de documentar cambios y regresiones;
  - regla de liberar solo procesos iniciados por Codex.

## Auditoria global de URLs relevantes

Solo se clasifican referencias pertenecientes al flujo de Checklist o a su configuracion local/publicada. Se excluyen recursos legitimos de terceros como Firebase, Google Fonts, jQuery CDN, DataTables CDN, Secuencia y otros assets de proveedor.

| Archivo | Linea aproximada | URL | Activa o comentada | Uso | Accion requerida |
| --- | ---: | --- | --- | --- | --- |
| `Clases/Utilerias.cs` | 117 | `http://mahahual-001-site23.ltempurl.com/` | Comentada | Referencia publicada central | Conservar |
| `Clases/Utilerias.cs` | 120 | `http://localhost:5127/` | Activa | Base URL central del consumo API | Mantener activa en local |
| `Controllers/ContestarLista/ContestarLista.cs` | 247, 352 | `Utilerias.UrlBase + api/...` | Activa | Proxy lectura/guardado de recolecciones | Verificado sin mezcla con publicado |
| `Controllers/ContestadorHibrido/ContestarListaHibrida.cs` | 55, 72, 119, 141, 164, 186, 202, 246, 293 | `Utilerias.UrlBase + ...` | Activa | Proxy hibrido de lectura/guardado | Verificado sin mezcla con publicado |
| `wwwroot/js/ConnectionManager.js` | 5 | `http://mahahual-001-site23.ltempurl.com/` | Comentada | Referencia publicada JS | Conservar |
| `wwwroot/js/ConnectionManager.js` | 8 | `http://localhost:5127/` | Activa | Cadena local JS | Mantener activa en local |
| `Properties/launchSettings.json` frontend | 16 | `http://localhost:5200` | Activa | Puerto local del frontend | Mantener |
| `Properties/launchSettings.json` backend | 16 | `http://localhost:5127` | Activa | Puerto local de la API | Mantener |
| `Controllers/LoginController.cs` y multiples controladores legacy | varias | `Utilerias.UrlBase + ...` | Activa | Consumo server-side hacia API | Sin cambios adicionales en esta tarea |
| `docs/agentes/*` | varias | `localhost:5200`, `localhost:5127`, `mahahual...` | Documental o comentada | Bitacoras y referencia historica | Mantener como documentacion |

## Controladores proxy revisados

- `Clases/Utilerias.cs`
  - `UrlBase` activa en local: `http://localhost:5127/`
  - URL publicada preservada en comentario.
- `Controllers/ContestarLista/ContestarLista.cs`
  - Construye URLs con `Utilerias.UrlBase`.
  - Preserva parametros existentes.
  - Preserva metodos `GET` y `POST`, serializacion y respuesta.
- `Controllers/ContestadorHibrido/ContestarListaHibrida.cs`
  - Construye URLs con `Utilerias.UrlBase`.
  - No mantiene URL publicada activa.
  - Preserva parametros, metodos y respuesta.
- `wwwroot/js/ConnectionManager.js`
  - Activo en local con `http://localhost:5127/`.
  - Referencia publicada conservada en comentario.

## Base de datos y configuracion

- API local:
  - archivo de configuracion: `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/appsettings.json`
  - nombre logico de la conexion: `ConnectionStrings:CadenaConexionSQLServer`
  - ambiente usado: `Development` con los valores base de `appsettings.json`
- Frontend:
  - archivo de configuracion: `/Users/denissemendiola/dev/CheckList_Original/checklist/appsettings.json`
  - configuracion relacionada: `Servidor`
- No se exponen secretos en esta bitacora.
- No se altero la conexion ni el esquema.

## Validacion ejecutada

1. Se confirmo que la API local ya estaba ejecutandose desde `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/bin/Debug/net8.0/checklistWs` en `http://localhost:5127`.
2. Se verifico el endpoint de lectura segura `GET http://localhost:5127/api/WsTest` con respuesta `Hola Mundo`.
3. Se levanto temporalmente el frontend con el perfil `http` en `http://localhost:5200`.
4. Se verifico respuesta `200 OK` del frontend en `http://localhost:5200/`.
5. Se verifico desde el frontend servido el asset `http://localhost:5200/js/ConnectionManager.js`, confirmando `http://localhost:5127/` como configuracion activa y la URL publicada conservada en comentario.
6. Se revisaron las referencias del dominio publicado en el frontend y quedaron limitadas a comentarios de referencia y documentacion; los puntos funcionales auditados quedaron conectados a `Utilerias.UrlBase`.

## Certificacion funcional real en Chrome

### Flujo seleccionado

- Pantalla: `Categorias > CategoriasABC`
- URL del frontend: `http://localhost:5200/Categorias/CategoriasABC`
- Accion realizada: apertura del modulo autenticado en Chrome y espera de la carga real del grid
- Endpoint del frontend: `GET /Categorias/GetData`
- Endpoint final de la API: `GET http://localhost:5127/ObtenerCategorias`
- Metodo HTTP: `GET`
- Parametros preservados por el proxy: `idEmpresa`, `empresa`, `cadena`
- Respuesta visible esperada: tabla de categorias o estado vacio controlado

### Evidencia observada el 2026-07-17

- Se reutilizo una sesion real ya autenticada en Chrome del usuario.
- Se reclamo el tab existente `http://localhost:5200/Listas/CreadorListaBL26` y se confirmo sesion valida:
  - nombre visible: `Denisse CheckApp`
  - empresa visible: `UMBRELLA CORP`
  - listas visibles en BL26: `ABCD` y `Lista 03`
- Desde esa misma sesion se navego en Chrome a `http://localhost:5200/Categorias/CategoriasABC`.
- Resultado visible en pantalla:
  - titulo `Categorías`
  - subtitulo `ABC Categorías`
  - grid DataTables cargado
  - mensaje visible: `Ningún dato disponible en esta tabla`
  - estado visible: `Mostrando registros del 0 al 0 de un total de 0 registros`
- Evidencia de comunicacion real frontend -> API local:
  - el proceso del frontend local en `5200` (`PID 15352`) mantuvo conexiones `ESTABLISHED` hacia `localhost:5127`
  - conexiones observadas durante la certificacion:
    - `[::1]:58051 -> [::1]:5127`
    - `[::1]:58050 -> [::1]:5127`
    - `[::1]:58052 -> [::1]:5127`
- Esto certifica que el frontend local no solo sirvio la pagina, sino que abrio trafico real hacia la API local configurada.
- Verificacion complementaria del proxy:
  - `curl http://localhost:5200/Categorias/GetData`
  - resultado observado: `HTTP 200 OK`, `Content-Length: 0`
  - coincide con el estado visible vacio del grid en Chrome
- No se detecto trafico activo hacia el dominio publicado durante esta certificacion.

## CORS, autenticacion y sesion

- No se encontraron configuraciones `AddCors`, `UseCors`, `WithOrigins` ni `AllowAnyOrigin` en el backend local.
- No se agrego bypass de autenticacion ni de autorizacion.
- La sesion en Chrome ya estaba autenticada y permitio navegar dentro de la app.
- Se conservaron cookies, claims y permisos existentes.
- No se registraron errores de CORS durante el flujo certificado.
- Firebase permanece configurado; no fue modificado en esta tarea.

## Validacion minima de escritura

- No se ejecuto escritura QA.
- Motivo: en esta pasada no se identifico una operacion reversible, segura y no destructiva que pudiera certificarse sin riesgo de alterar datos existentes.
- La instruccion de no modificar datos reales ni crear efectos laterales se preservo.

## Hallazgos y riesgos

- Existen advertencias de compilacion heredadas en ambos proyectos, pero no forman parte de este cambio.
- La evidencia mas confiable del origen real de solicitudes se obtiene ejecutando ambos proyectos y observando el consumo hacia `localhost:5127`.
- Si algun flujo cliente realiza llamadas directas desde JavaScript a la API, podria requerirse CORS puntual en una iteracion posterior; no se aplico porque no fue necesario para el cambio minimo solicitado.
- El modulo `CategoriasABC` respondio con estado vacio visible y el proxy local `Categorias/GetData` devolvio `HTTP 200` sin cuerpo, por lo que el flujo certificado demuestra integracion real, aunque no un catalogo con registros visibles.

## Cierre operativo

- Se libero el proceso del frontend levantado para esta validacion.
- No se detuvo la API en `localhost:5127` porque ya estaba activa previamente y pertenece al proyecto backend objetivo.
