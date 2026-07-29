# Base de datos de desarrollo - Certificacion de estrategia local o staging

Fecha de certificacion: 2026-07-20

## Estado

- No se modifico `sql5111`.
- No se cambiaron conexiones activas.
- No se ejecuto SQL.
- No se modifico Firebase.
- No se reiniciaron frontend `5200` ni API `5127`.
- Los Paquetes A y B de Operadores O0 permanecen bloqueados hasta certificar un ambiente SQL seguro.

## 1. Explicacion simple

La API corre localmente, pero hoy no trabaja contra una base local. El flujo real de login obtiene la empresa desde Firebase, resuelve una cadena SQL desde `Conexiones` y la propaga a frontend, sesion y claims. Por eso un override simple de `appsettings.Development.json` no basta para asegurar que Development deje de usar `sql5111`.

La recomendacion unica para el siguiente paso es preparar un **staging SQL Server aislado y restaurable** antes de tocar Operadores O0. La alternativa de contenedor local es valida solo despues de autorizar herramientas que hoy no estan disponibles en esta Mac.

## 2. Trazado de la conexion actual

| Archivo/componente | Fuente de conexion | Momento de uso | Puede sobrescribir configuracion local |
|---|---|---|---:|
| `checklistWs/appsettings.json` | `ConnectionStrings:CadenaConexionSQLServer` | arranque de API y servicios que usan `SqlConnectionFactory` | No |
| `checklistWs/appsettings.Development.json` | no define cadena SQL | arranque en Development | No |
| `checklistWs/Properties/launchSettings.json` | solo ambiente `Development` y puertos | `dotnet run` / depuracion | No |
| `checklistWs/Utiles/SqlConnectionFactory.cs` | lee `CadenaConexionSQLServer` de configuracion | controladores/servicios que usan factory | No |
| `checklistWs/Utiles/Firebase.cs` | lee `Conexiones` y `Usuarios` desde Firebase RTDB | flujos que resuelven cadena por empresa | Si |
| `LoginController.Ingreso` | toma `conexionFB.Cadena`, la codifica en Base64 y la devuelve | login web | Si |
| `LoginController.Ingreso` | guarda `cadena` en `HttpContext.Session` y `ClaimTypes.Uri` | despues del login | Si |
| `wwwroot/js/login.js` | guarda `cadenaBase64` en `sessionStorage` | despues del login | Si |
| API `checklistWs` legacy | recibe parametro `cadena`, lo decodifica y abre `SqlConnection` directa | casi todos los endpoints de negocio | Si |
| `ContestarLista` / BL26 | prioriza sesion y contexto serializado | bootstrap de UI | Si |

### Respuestas directas

1. La API si utiliza una cadena fija.
   - Existe en `appsettings.json`.
2. El frontend si recibe una cadena desde Firebase.
   - Le llega a traves de `LoginController.Ingreso`.
3. La cadena si se guarda en sesion y en claims.
   - Tambien se guarda en `sessionStorage`.
4. Cambiar solo `appsettings.Development.json` no seria suficiente.
5. Si.
   - El login actual volveria a apuntar a la cadena resuelta desde Firebase.
6. Si hay mas de una cadena activa.
   - la fija de configuracion y la dinamica por empresa.

## 3. Certificacion del ambiente actual

| Evidencia | Interpretacion | Confianza |
|---|---|---|
| `CadenaConexionSQLServer` apunta a `sql5111.site4now.net` | la base no es local | Alta |
| la empresa y la cadena se resuelven desde Firebase RTDB | la configuracion esta compartida con el flujo publicado | Alta |
| `appsettings.Development.json` no define override SQL | Development no esta aislado por configuracion | Alta |
| no hay documentacion de restore/backup remoto autorizable en el repo | no existe reversa certificada desde esta sesion | Media |
| la API local usa puertos locales pero datos remotos | local no implica desarrollo de datos | Alta |
| `Roles.id` no tiene PK/UNIQUE fisico en la base auditada | la base compartida tiene anomalías legacy que deben preservarse pero no corregirse ahi | Alta |

### Dictamen

- No es seguro certificar `sql5111` como ambiente de desarrollo.
- La configuracion actual parece compartida con un flujo publicado o al menos con un backend remoto comun.
- Cualquier ejecucion de esquema debe moverse primero a un ambiente aislado.

## 4. Capacidades disponibles en macOS

| Herramienta/capacidad | Disponible | Version | Compatible |
|---|---:|---|---:|
| Docker Desktop | No | - | - |
| Colima | No | - | - |
| Podman | No | - | - |
| `sqlcmd` | No | - | - |
| `sqlpackage` | No | - | - |
| DBeaver | No | - | - |
| Azure Data Studio | No | - | - |
| arquitectura ARM | Si | `arm64` | Si |
| puertos 1433 / 14330 / 14333 / 1434 / 11433 | libres | - | Si |
| espacio en disco | Si | > 500 GiB libres | Si |

### Conclusiones

- Esta Mac puede alojar un motor SQL en otra fase.
- Hoy no tiene herramientas listas para contenedor, extraccion ni restauracion.
- Para avanzar sin instalar nada, la mejor ruta no es local inmediata sino staging aislado.

## 5. Alternativas de motor

| Alternativa | Compatibilidad | Restaurable | Aislamiento | Complejidad | Recomendacion |
|---|---:|---:|---:|---:|---|
| A. SQL Server en contenedor local | Alta | Alta | Alta | Alta hoy | secundaria |
| B. Azure SQL Edge o equivalente | Media | Media | Alta | Media | no recomendada |
| C. Staging SQL Server aislado | Alta | Alta | Alta | Media | recomendada |
| D. SQL Server en equipo Windows o servidor interno | Alta | Alta | Media | Media | alternativa aceptable |

### Recomendacion unica

Preparar un **staging SQL Server aislado y restaurable** como primer ambiente seguro para desarrollo y QA.

Motivos:

- no requiere instalar herramientas ahora mismo en esta Mac;
- conserva comportamiento de SQL Server completo;
- permite restauracion controlada;
- evita que el login real y Firebase devuelvan a `sql5111` mientras se diseña el override de Development;
- facilita extraer esquema y validar objetos legacy con menos friccion que un contenedor ARM desde cero.

## 6. Esquema necesario

| Objeto | Tipo | Consumidor | Necesario para QA |
|---|---|---|---:|
| `Usuarios` | tabla | login, usuarios, permisos, O0 | Si |
| `Roles` | tabla | login, menu, O0 | Si |
| `Opciones` / permisos relacionados | tablas | menu, autorizacion | Si |
| `Sucursales` | tabla | login contextual, BL26, O0 | Si |
| `Listas` | tabla | listas legacy, BL26, resultados | Si |
| `ListasPreguntas` | tabla | creador, contestador, BL26 | Si |
| `ListasPreguntasOpciones` | tabla | tipos 2 y 3 | Si |
| `ListasPreguntasCategorias` | tabla | categorias | Si |
| `ListasPreguntasSubCategorias` | tabla | subcategorias | Si |
| `ListasRespuestas` | tabla | legacy, reportes, R3 futuro | Si |
| `AnexoPregunta` | tabla | evidencias | Si |
| `Resultados` y consultas relacionadas | tablas/vistas/procs segun legado | reportes | Si |
| `UsuariosPuestos`, `UsuariosDepartamentos`, `Zonas` | tablas | CRUDs y catalogos | Si |
| `OperadoresPerfil` | tabla futura | O0 | Si para O0 |
| `ListasOperadoresAsignaciones` | tabla futura | O0 / R3 | Si para O0 |

### Decision de alcance

- Un subconjunto manual del esquema es riesgoso.
- La app usa SQL directo distribuido en muchos controladores y dependencias indirectas.
- La base de QA debe partir de **esquema casi completo** y luego poblar solo **datos sinteticos minimos**.
- Deben conservarse tambien vistas, funciones, stored procedures e indices legacy, incluso si contienen anomalias.

## 7. Metodo de extraccion

| Metodo | Modifica remoto | Extrae esquema | Extrae datos | Reproducible | Compatible con macOS |
|---|---:|---:|---:|---:|---:|
| DACPAC con `sqlpackage /Action:Extract` | No | Si | No | Alta | Si, si se autoriza instalarlo |
| scripting desde metadata `sys.*` | No | Parcial | No | Media | Si |
| SMO / wizard en Windows | No | Si | Opcional | Alta | No nativo en esta Mac |
| scripts ya existentes en repo | No | Parcial | No | Baja | Si |

### Recomendacion

Para el ambiente recomendado, el mejor metodo es:

1. **extraer DACPAC de solo lectura** desde la base remota autorizada;
2. **restaurar/aplicar esquema** en staging aislado;
3. **cargar solo datos QA sinteticos** por separado.

Si no se autoriza `sqlpackage` en esta Mac, la extraccion debe hacerse desde un host ya autorizado con SQL Server tooling y luego entregar solo el artefacto de esquema.

## 8. Datos minimos de QA

| Dato | Obligatorio | Puede ser sintetico | Dependencias |
|---|---:|---:|---|
| empresa QA | Si | Si | login, menu |
| conexion QA | Si | Si | login, API |
| administrador QA | Si | Si | acceso inicial |
| rol administrativo QA | Si | Si | menu |
| permisos/menu QA | Si | Si | navegacion |
| sucursal QA | Si | Si | usuarios, BL26 |
| categorias QA | Si | Si | categorias, listas |
| subcategorias QA | Si | Si | subcategorias, listas |
| lista QA | Si | Si | BL26, legacy |
| preguntas QA | Si | Si | contestadores |
| respuestas/resultados QA minimos | No al inicio | Si | reportes posteriores |
| operador QA futuro | No para certificar ambiente | Si | O0 posterior |

### Regla

- No copiar nombres, correos, telefonos ni UID reales.
- Solo sinteticos.
- El ambiente debe nacer vacio de personas reales.

## 9. Firebase y conexion

| Capa | Comportamiento actual | Estrategia Development |
|---|---|---|
| Firebase Authentication | autentica usuario real | usar proyecto Firebase de desarrollo o stub autorizado futuro |
| `Usuarios/{uid}` | define empresa y estatus | separar proyecto o namespace de desarrollo |
| `Conexiones/{empresa}` | entrega cadena SQL activa | no debe apuntar a `sql5111` en Development |
| `LoginController` | copia cadena a respuesta, sesion y claim | debe preferir override Development antes de exponerla |
| `sessionStorage` | guarda `cadenaBase64` | solo debe recibir cadena QA |
| API legacy | usa parametro `cadena` en casi todos los endpoints | debe rechazar cadena remota en Development si no esta autorizada |

### Respuestas directas

1. Si, la conexion remota esta almacenada en Firebase.
2. Si, la aplicacion la obtiene despues de autenticar.
3. Si, un override local simple seria ignorado por el login actual.
4. Si, idealmente se necesitara Firebase de desarrollo para un Development completo seguro.
5. Si, pero requiere una estrategia de override explicita en login/backend.
6. Debe existir una barrera que, en Development, sustituya o rechace la cadena resuelta desde Firebase.
7. La configuracion publicada se mantiene intacta si el override vive solo en Development y fuera de produccion.

## 10. Configuracion Development propuesta

| Configuracion | Development | Production |
|---|---|---|
| `appsettings.Development.json` | nombre del servidor/base permitidos, flags de seguridad, sin secretos | no aplica |
| user secrets | cadena QA o alias local, no commit | no aplica |
| variable de entorno | activar override y `AllowSchemaChanges=false` por defecto | sin uso |
| archivo local ignorado por Git | fallback de desarrollo si no se usan secrets | no aplica |
| login/backend | override de cadena dinamica cuando `ASPNETCORE_ENVIRONMENT=Development` | comportamiento actual |
| logs internos | registrar destino SQL efectivo | no visible al usuario |

### Regla de diseno

Development debe resolverse asi:

`Development -> Firebase/empresa QA -> override local seguro -> SQL QA certificado`

No:

`Development -> Firebase publicado -> sql5111`

## 11. Salvaguardas obligatorias

| Salvaguarda | Evita | Obligatoria |
|---|---|---:|
| lista blanca de servidor permitido | DDL en remoto no autorizado | Si |
| lista blanca de base permitida | apuntar a base equivocada | Si |
| `AllowSchemaChanges` | ejecucion accidental de O0 | Si |
| ambiente `Development` explicito | mezclar QA con publicado | Si |
| usuario SQL restringido | dano innecesario | Si |
| respaldo/restauracion certificados | cambios irreversibles | Si |
| prueba transaccional con rollback | daño por script defectuoso | Si |
| conteos antes/despues | cambios silenciosos | Si |
| script DOWN validado | reversa controlada | Si |
| bloqueo si hay datos no previstos | perdida de QA | Si |
| bitacora interna | trazabilidad | Si |

## 12. Tratamiento de `Roles.id`

| Alternativa | Impacto Legacy | Integridad | Riesgo | Recomendacion |
|---|---:|---:|---:|---|
| A. conservar `idRolOperador` sin FK fisica y validar en API | Bajo | Media | Baja | recomendada para O0 |
| B. tabla puente propia | Medio | Media | Media | no por ahora |
| C. corregir `Roles.id` en fase independiente | Alto | Alta | Alta | futura, separada |

### Decision

Para O0 debe mantenerse la alternativa A.

## 13. Plan de implementacion del entorno

| Paso | Accion | Riesgo | Reversible |
|---|---|---|---:|
| 1 | autorizar herramienta de extraccion | bajo | Si |
| 2 | autorizar staging SQL Server aislado | medio | Si |
| 3 | crear base QA vacia | bajo | Si |
| 4 | extraer/aplicar esquema completo | medio | Si |
| 5 | validar conteos de objetos y dependencias | bajo | Si |
| 6 | insertar datos QA sinteticos minimos | medio | Si |
| 7 | implementar override Development | medio | Si |
| 8 | probar login contra QA | medio | Si |
| 9 | probar modulos Legacy principales | medio | Si |
| 10 | correr prueba O0 con rollback | medio | Si |
| 11 | ejecutar O0 A y B | medio | Si |
| 12 | validar tablas nuevas vacias y regresion | bajo | Si |
| 13 | documentar reversa | bajo | Si |

## 14. Matriz de QA preparada

- login / logout
- usuarios
- roles
- permisos / menu
- sucursales
- `CreadorLista`
- `CreadorListaBL26`
- `ContestarLista` legacy
- `Inspeccion en campo`
- resultados
- `OperadoresPerfil`
- `ListasOperadoresAsignaciones`
- rollback O0

## 15. Trabajos que pueden continuar

| Trabajo | Puede continuar sin base certificada | Motivo |
|---|---:|---|
| arquitectura documental | Si | no toca runtime |
| diseño de CRUD | Si parcial | sin validar integracion real |
| Paquete C | Si documental | depende de datos, no de esquema ejecutado |
| Paquete D | Si documental | depende de arquitectura, no de base QA |
| Firebase Admin | Si documental | no implementar aun |
| implementacion API | No recomendable | no podria probarse seguro |
| implementacion frontend | No recomendable | quedaria sin backend QA confiable |
| R3 | No recomendable | sigue dependiendo de persistencia real |

## 16. Autorizaciones exactas

| Autorizacion | Alcance exacto | Riesgo | Reversible |
|---|---|---:|---:|
| 1 - Herramientas | autorizar `sqlpackage` o herramienta equivalente de extraccion de esquema | bajo | Si |
| 2 - Lectura de esquema remoto | extraer solo esquema de `sql5111`, sin datos personales | medio | Si |
| 3 - Creacion de ambiente | staging SQL Server aislado, restaurable y no productivo | medio | Si |
| 4 - Datos QA | crear empresa, admin, rol, sucursal, lista y preguntas sinteticas | medio | Si |
| 5 - Configuracion Development | agregar override local seguro y flags de bloqueo | medio | Si |
| 6 - O0 A y B | ejecutar solo despues de certificar ambiente QA | medio | Si |

## 17. Recomendacion unica

La alternativa recomendada es **Staging SQL Server aislado y restaurable**, con extraccion de esquema en modo solo lectura y con un override exclusivo de Development que impida que el login y la sesion vuelvan a inyectar la cadena de `sql5111`.

La alternativa local en contenedor queda como segunda opcion, pero requiere una autorizacion previa de herramientas que hoy no estan disponibles en esta Mac.
