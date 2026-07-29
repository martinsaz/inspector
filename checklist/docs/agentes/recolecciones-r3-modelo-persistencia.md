# Recolecciones R3 — Propuesta técnica de modelo de persistencia

## Fecha

- Sábado 18 de julio de 2026

## Objetivo

Definir el cambio mínimo, compatible y reversible de modelo para soportar una ejecución persistente de inspección en campo sin romper el flujo Legacy actual ni exigir migración histórica obligatoria.

## Resumen ejecutivo

- El modelo actual sí persiste respuestas reales.
- No persiste una ejecución identificable y controlada por la API.
- `evento` hoy agrupa respuestas, pero nace en el navegador y no representa por sí solo una cabecera operativa segura.
- La recomendación mínima es:
  - crear una cabecera nueva de ejecución
  - agregar una columna `idEjecucion` en `ListasRespuestas`
  - conservar `evento` para compatibilidad con reportes y resultados Legacy
- No se propone modificar datos existentes.
- No se propone una migración histórica obligatoria.
- No se propone tocar el contrato Legacy actual de envío.
- Desde el 2026-07-20 la definición O0 de Operadores agrega una dependencia nueva para cualquier reanudación futura de R3:
  - la ejecución persistente debe poder congelar el contexto original del operador y su asignación

## Dependencia nueva de Operadores O0

Si se autoriza posteriormente el modelo O0 de Operadores, la ejecución persistente de inspección deberá preservar como contexto histórico:

- `idAsignacion`
- `idOperadorPerfil`
- `idUsuario`
- `idEmpresa`
- `idSucursal`
- `idLista`

Motivo:

- cambios posteriores en sucursal, rol, estatus o asignación del operador no deben alterar la interpretación histórica de una inspección ya iniciada.

Esta dependencia es conceptual y no modifica los scripts R3 actuales.

## 1. Modelo actual

### 1.1 Tablas auditadas

| Tabla | Llave primaria | Campos relevantes | Relaciones | Uso actual |
|---|---|---|---|---|
| `ListasRespuestas` | `id` | `idEmpresa`, `idLista`, `idPregunta`, `RespuestaValor`, `Notas`, `idPrograma`, `idTipoPregunta`, `Valor`, `Calificacion`, `obligatoria`, `Fecha`, `FechaRespuesta`, `evento`, `ValorCorrecto`, `idSucursal`, `idUsuario`, `Latitud`, `Longitud`, `stamp` | No se observaron llaves foráneas declaradas en la auditoría | Persistencia real de cada respuesta |
| `AnexoPregunta` | `id` | `url`, `tipo_anexo`, `fecha`, `idListaRespuesta` | FK hacia `ListasRespuestas.id` | Persistencia de anexos por respuesta |
| `Listas` | No se observó PK declarada en la auditoría metadata | `idEmpresa`, `idPrograma`, `idInstructor`, `idusuario`, `Nombre`, `fechacreacion`, `Notas`, `Activo`, `Status`, `Estado`, `latitud`, `longitud` | No se observaron FKs declaradas en la auditoría | Definición de lista |
| `ListasPreguntas` | No se observó PK declarada en la auditoría metadata | `idEmpresa`, `idLista`, `Pregunta`, `Explicacion`, `Tipo`, `Valor`, `Obligatorio`, `Status`, `fecha`, `ValorCorrecto`, `idCategoria`, `idSubCategoria` | No se observaron FKs declaradas en la auditoría | Definición de preguntas |
| `ListasPreguntasCategorias` | No auditada en detalle de índices | `id`, `Nombre` | Se usa por join lógico | Catálogo de categorías |
| `ListasPreguntasSubCategorias` | No auditada en detalle de índices | `id`, `Nombre` | Se usa por join lógico | Catálogo de subcategorías |
| `Usuarios` | `id` observable por nulabilidad y uso | `Nombre`, `CorreoPersonal`, `CorreoInstitucional`, `idEmpresa`, `idRol` | Se usa por join lógico | Inspector y responsables |
| `Sucursales` | `id` observable por nulabilidad y uso | `nombre`, `idEmpresa`, `borrado` | Se usa por join lógico | Sucursal de ejecución |

### 1.2 Tipos, nulabilidad, volumen y metadatos confirmados

#### `ListasRespuestas`

| Campo | Tipo | Nulo |
|---|---|---:|
| `id` | `uniqueidentifier` | no |
| `idEmpresa` | `uniqueidentifier` | no |
| `idLista` | `uniqueidentifier` | no |
| `idPregunta` | `uniqueidentifier` | no |
| `RespuestaValor` | `text` | no |
| `Notas` | `varchar` | sí |
| `idAlumno` | `uniqueidentifier` | no |
| `idPrograma` | `uniqueidentifier` | sí |
| `idTipoPregunta` | `numeric` | sí |
| `Explicacion` | `text` | sí |
| `Valor` | `numeric` | sí |
| `Calificacion` | `numeric` | sí |
| `obligatoria` | `bit` | sí |
| `Fecha` | `datetime` | sí |
| `FechaRespuesta` | `datetime` | sí |
| `evento` | `uniqueidentifier` | sí |
| `ValorCorrecto` | `varchar` | sí |
| `idSucursal` | `uniqueidentifier` | no |
| `idUsuario` | `uniqueidentifier` | no |
| `Latitud` | `varchar` | sí |
| `Longitud` | `varchar` | sí |
| `stamp` | `bigint` | sí |

- Volumen aproximado auditado:
  - `5872` filas
- Índices observados:
  - `PK_ListasRespuestas(id)` única
- Llaves foráneas observadas:
  - ninguna declarada en metadata auditada
- Uso de `evento`:
  - `5872` filas con `evento`
  - `0` filas sin `evento`
  - `430` eventos distintos

#### `AnexoPregunta`

| Campo | Tipo | Nulo |
|---|---|---:|
| `id` | `uniqueidentifier` | no |
| `url` | `varchar` | no |
| `tipo_anexo` | `int` | no |
| `fecha` | `date` | sí |
| `idListaRespuesta` | `uniqueidentifier` | sí |

- Volumen aproximado auditado:
  - `3450` filas
- Índices observados:
  - PK única sobre `id`
- Llaves foráneas observadas:
  - `idListaRespuesta -> ListasRespuestas.id`

#### Otras tablas relevantes

| Tabla | Volumen aproximado |
|---|---:|
| `Listas` | `161` |
| `ListasPreguntas` | `719` |
| `ListasPreguntasCategorias` | `165` |
| `ListasPreguntasSubCategorias` | `280` |
| `Usuarios` | `48` |
| `Sucursales` | `134` |

### 1.3 Uso actual de `evento`

`evento` es hoy la llave lógica de agrupación operativa para consultas y reportes, aunque no sea una cabecera formal.

Consultas y contratos observados que dependen de `evento`:

| Consulta o módulo | Dependencia actual |
|---|---|
| `ContestarLista.js` | genera `evento` en cliente |
| `ContestarLista/GuardarRespuesta` | reenvía `evento` al backend |
| `ContestarListaHibrida/GuardarRespuesta` | reenvía `evento` al backend |
| `EvaluacionesController.Guardar` | inserta `evento` en cada fila |
| `ListasRespuestasController.GetLista` | consulta por `evento`, pero recibe `idLista` en la firma |
| `ReportesController.GetReporteListado` | filtra por `evento` |
| `ReportesController.ReporteDinamico` | agrupa por `evento` |
| `Evaluacion/ObtenerListasReporte` | lista ejecuciones históricas usando `evento` |
| `MisListas` | cuenta `COUNT(DISTINCT evento)` como veces |

### 1.4 Contratos Legacy afectados por cualquier cambio futuro

| Contrato | Rol actual | Sensibilidad |
|---|---|---|
| `POST /api/Evaluaciones?evento=...` | guardado real legacy por respuesta | alta |
| `ContestarLista/GuardarRespuesta` | proxy frontend legacy | alta |
| `ContestarListaHibrida/GuardarRespuesta` | proxy híbrido | alta |
| `ListasRespuestas/GetLista` | detalle de respuestas por evento | media |
| `GetReporteListado` y reportes asociados | resultados por evento | alta |

## 2. Limitaciones del modelo actual

| Limitación | Consecuencia |
|---|---|
| No existe cabecera persistente de ejecución | no hay identidad operativa controlada por API |
| `evento` nace en navegador | el cliente puede imponer el agrupador |
| No existe estado persistente de ejecución | no se distingue abierta, terminada o cancelada |
| Guardado actual es `INSERT` por respuesta | no hay actualización segura de respuesta |
| No existe unicidad por ejecución/pregunta | riesgo de duplicados |
| No existe control de concurrencia | riesgo por doble clic, pestañas o dos dispositivos |
| No existe transacción global del lote legacy | ante una falla pueden quedar respuestas parciales |
| `GetLista` mezcla `idLista` y `evento` | lectura potencialmente inconsistente |

## 3. Casos de uso de R3

| Caso de uso | Datos requeridos | Soporte actual | Dato faltante |
|---|---|---|---|
| Iniciar inspección | empresa, lista, sucursal, responsable, inspector, GPS, fecha, estado, identidad | lista, sucursal, responsable, inspector y GPS sí existen en el flujo | identidad persistente y estado abierto |
| Guardar respuesta | ejecución, pregunta, valor, tipo, comentario, fecha, usuario, control de concurrencia | pregunta, valor, tipo, comentario, fecha y usuario sí existen | `idEjecucion`, versionado y llave de upsert |
| Recuperar inspección | usuario, empresa, ejecución abierta, lista, respuestas, progreso | respuestas existen por `evento` | búsqueda segura de ejecución abierta y progreso |
| Cerrar inspección | validación, estado, fecha de cierre, resultado | resultados legacy existen a posteriori por `evento` | estado de cierre, fecha de cierre e identidad de ejecución |

## 4. Alternativas de modelo

### Comparativo

| Alternativa | Ventajas | Desventajas | Riesgo | Recomendación |
|---|---|---|---|---|
| A. Nueva cabecera + columna `idEjecucion` en `ListasRespuestas` | modelo claro, upsert simple, consulta directa de ejecución, compatibilidad conservando `evento` | requiere una tabla y una columna nuevas | medio | recomendada |
| B. Nueva cabecera + tabla puente ejecución-respuesta/evento | evita tocar `ListasRespuestas` al principio | complica consultas, joins, anexos y upsert; mayor costo operativo | medio-alto | no recomendada |
| C. Reutilizar `evento` como identidad persistente con cabecera | conserva fuerte compatibilidad con reportes | `evento` nace en cliente, no resuelve bien duplicados ni actualización; la API tendría que re-apropiar un dato ya heredado | alto | útil solo como compatibilidad, no como diseño principal |

### 4.1 Alternativa A — Nueva cabecera + columna `idEjecucion`

#### Ventajas

- Crea una identidad de ejecución controlada por la API.
- Permite guardar estado de negocio mínimo sin tocar históricos.
- Permite `upsert` de respuesta por `idEjecucion + idPregunta`.
- Mantiene `evento` para consultas existentes.
- Facilita recuperación multi-sesión.

#### Desventajas

- Requiere cambio de esquema doble:
  - tabla nueva
  - columna nueva en detalle

#### Impacto Legacy

- Legacy puede seguir enviando `evento`.
- Legacy no necesita conocer `idEjecucion`.
- Las nuevas respuestas de inspección en campo pueden seguir alimentando resultados porque conservarían `evento`.

#### Reversibilidad

- Alta, porque:
  - no obliga a migrar históricos
  - puede deshabilitarse la nueva API sin romper el flujo legacy

### 4.2 Alternativa B — Cabecera + tabla puente

#### Ventajas

- Mantiene `ListasRespuestas` sin columna nueva inmediata.

#### Desventajas

- La respuesta real seguiría sin enlazarse directamente con una ejecución.
- Complica anexos y lectura de detalle.
- El `upsert` quedaría dividido entre varias tablas.
- Aumenta costo cognitivo y de mantenimiento.

#### Reversibilidad

- Media, pero a costa de más complejidad técnica.

### 4.3 Alternativa C — Reutilizar `evento` como identidad persistente

#### Ventajas

- Máxima compatibilidad con reportes y detalles existentes.
- Menor cambio aparente en integración.

#### Desventajas

- `evento` hoy se genera en navegador.
- No existe validación fuerte de unicidad operativa.
- Sigue faltando una clave estable para actualización de respuestas.
- Mantiene una dependencia fuerte del legado más frágil.

#### Recomendación sobre `evento`

- Debe conservarse como dato de compatibilidad.
- No debe seguir siendo la identidad principal de ejecución para la nueva ruta.

## 5. Propuesta de cabecera

Nombre conceptual:

- `InspeccionesEjecuciones`

### Campos mínimos propuestos

| Campo | Tipo sugerido | Nulo | Llave/índice | Justificación |
|---|---|---:|---|---|
| `idEjecucion` | `uniqueidentifier` | no | PK | identidad persistente de ejecución |
| `idEmpresa` | `uniqueidentifier` | no | índice compuesto | aislamiento tenant |
| `idLista` | `uniqueidentifier` | no | índice compuesto | preservar cuestionario base |
| `idSucursal` | `uniqueidentifier` | no | índice compuesto | contexto de inspección |
| `idResponsable` | `uniqueidentifier` | no | índice compuesto | sujeto responsable auditado |
| `idInspector` | `uniqueidentifier` | no | índice compuesto | usuario autenticado que captura |
| `eventoLegacy` | `uniqueidentifier` | sí | índice no único | compatibilidad con resultados y reportes |
| `estado` | `tinyint` o `numeric(3,0)` | no | índice compuesto | estado mínimo de negocio |
| `latitudInicio` | `varchar(64)` | sí | sin índice | GPS inicial |
| `longitudInicio` | `varchar(64)` | sí | sin índice | GPS inicial |
| `fechaInicio` | `datetime` | no | índice compuesto | inicio real |
| `fechaUltimaActividad` | `datetime` | no | sin índice | recuperación y monitoreo |
| `fechaCierre` | `datetime` | sí | sin índice | cierre posterior |
| `activo` | `bit` | no | índice compuesto | permite desactivar lógicamente sin tocar históricos |
| `version` | `int` | no | sin índice | control optimista de concurrencia |

### Columna nueva propuesta en `ListasRespuestas`

| Campo | Tipo sugerido | Nulo | Llave/índice | Justificación |
|---|---|---:|---|---|
| `idEjecucion` | `uniqueidentifier` | sí inicialmente | índice compuesto único con `idPregunta` | relacionar cada respuesta nueva con su ejecución |

## 6. Relación con respuestas

### Modelo recomendado

- Una ejecución tiene muchas respuestas.
- Una respuesta nueva de inspección en campo debe guardar:
  - `idEjecucion`
  - `evento`
  - `idPregunta`
  - resto de payload actual

### Llave funcional recomendada para upsert

- `idEjecucion + idPregunta`

Esto evita que una misma pregunta quede repetida dentro de la misma ejecución y permite actualizar respuesta/comentario sin agregar nuevas filas lógicas.

## 7. Estados mínimos

| Estado | Valor | Significado | Transiciones |
|---|---|---|---|
| Abierta | `1` | ejecución iniciada y editable | `Terminada`, `Cancelada` |
| Terminada | `2` | ejecución cerrada sin más edición | ninguna |
| Cancelada | `3` | ejecución invalidada o abandonada intencionalmente | ninguna |

### Decisión

- No se recomienda agregar `Borrador` y `En proceso` por separado en R3.
- `Abierta` cubre la necesidad mínima y deja espacio para R5 si después se requiere un workflow más fino.

## 8. Compatibilidad con Legacy

### Respuestas expresas

1. ¿Legacy necesita conocer `idEjecucion`?
   - No.
2. ¿Las nuevas respuestas pueden seguir apareciendo en Resultados?
   - Sí, si conservan `evento`.
3. ¿Cómo se mantiene `evento`?
   - La API de inspección en campo debe generarlo o controlarlo y guardarlo en cabecera como `eventoLegacy`.
4. ¿Cómo se evitan cambios masivos?
   - Sin migrar históricos y sin tocar el contrato legacy actual.
5. ¿Se requiere migrar históricos?
   - No.
6. ¿Cómo se consultarán ejecuciones nuevas?
   - Por `idEjecucion` en la nueva API; por `evento` cuando se proyecten a reportes legacy.

### Antes y después

| Flujo | Antes | Después | Compatibilidad |
|---|---|---|---|
| Legacy | genera `evento` y guarda filas sueltas | permanece igual | total |
| Inspección en campo | no tiene persistencia real | la API crea `idEjecucion`, controla `eventoLegacy` y guarda incremental | alta |
| Resultados | consultan por `evento` | siguen consultando por `evento` | alta |
| Recuperación nueva | no existe | usa `idEjecucion` y estado `Abierta` | nueva capacidad aislada |

## 9. Concurrencia y duplicados

| Riesgo | Control propuesto | Requiere esquema | Requiere API |
|---|---|---:|---:|
| doble clic en iniciar | índice lógico de abierta por combinación operativa + transacción de inicio | sí | sí |
| doble pestaña | recuperar la misma ejecución abierta en vez de crear otra | no | sí |
| reintento por timeout | endpoint idempotente de iniciar/recuperar | no | sí |
| doble guardado | `upsert` por `idEjecucion + idPregunta` | sí | sí |
| respuesta repetida | índice único por `idEjecucion + idPregunta` | sí | sí |
| dos dispositivos | control por ejecución abierta + `version` | sí | sí |
| actualización concurrente | control optimista por `version` o `fechaUltimaActividad` | sí | sí |

### Índices mínimos recomendados

- En cabecera:
  - índice compuesto no único sobre `idEmpresa, idInspector, estado, idLista, idSucursal`
  - índice por `eventoLegacy`
- En `ListasRespuestas`:
  - índice único sobre `idEjecucion, idPregunta`

## 10. Transacciones

### Inicio

Debe correr en una sola transacción:

1. validar tenant, inspector, lista ejecutable y sucursal
2. buscar ejecución abierta compatible
3. si existe, devolverla
4. si no existe:
   - crear cabecera
   - generar `eventoLegacy`
   - dejar estado `Abierta`

### Guardado de respuesta

Debe usar `upsert` transaccional por:

- `idEjecucion + idPregunta`

Pseudocódigo conceptual:

```text
BEGIN TRAN
  validar ejecucion abierta y pertenencia tenant
  validar que la pregunta pertenece a la lista de la ejecucion
  if existe respuesta para idEjecucion + idPregunta
    update respuesta
  else
    insert respuesta con idEjecucion y eventoLegacy
  update fechaUltimaActividad y version de cabecera
COMMIT
```

### Cierre

Debe validar en una transacción:

1. ejecución abierta
2. preguntas obligatorias completas
3. actualización de estado a `Terminada`
4. `fechaCierre`
5. incremento de `version`

### Evidencias futuras

- Las evidencias pueden seguir relacionándose con `ListasRespuestas.id`.
- No se requiere diseñarlas ahora de otra forma.

## 11. Seguridad tenant

| Operación | Validaciones de seguridad |
|---|---|
| iniciar o recuperar | resolver `idEmpresa` e inspector desde sesión/claims; validar permiso; validar lista ejecutable; validar sucursal y responsable válidos para el tenant |
| obtener ejecución | validar que `idEjecucion` pertenece a la empresa y al inspector autorizado |
| guardar respuesta | validar ejecución abierta, tenant, pregunta perteneciente a la lista y tipo de respuesta |
| recuperar respuestas | validar pertenencia de ejecución y empresa |
| cerrar | validar ejecución abierta, tenant, permiso y completitud obligatoria |

### Regla clave

- El navegador no debe decidir de forma autoritativa:
  - `idEmpresa`
  - inspector
  - estado
  - `idEjecucion`
  - `eventoLegacy`

## 12. Contratos futuros conceptuales

| Operación | Método | Entrada de negocio | Salida de negocio | Idempotencia |
|---|---|---|---|---|
| iniciar o recuperar | `POST` | lista, sucursal, responsable, GPS inicial | ejecución, estado, contexto, progreso inicial | sí |
| obtener ejecución | `GET` | ejecución | contexto, estado, progreso | sí |
| guardar respuesta | `POST` o `PUT` | ejecución, pregunta, respuesta, comentario | confirmación de guardado y progreso | sí |
| recuperar respuestas | `GET` | ejecución | respuestas restauradas | sí |
| cerrar | `POST` | ejecución | confirmación de cierre | sí |

## 13. Impacto en consultas existentes

| Consulta/módulo | Impacto | Cambio requerido | Compatibilidad |
|---|---|---|---|
| `Resultados` | bajo | ninguno inmediato si se conserva `evento` | alta |
| `ReporteListado` | bajo | ninguno inmediato | alta |
| `ReportesController.GetReporteListado` | bajo | ninguno inmediato | alta |
| `ReporteDinamico` | bajo | ninguno inmediato | alta |
| `MisListas` | bajo | ninguno inmediato | alta |
| `ContestarLista Legacy` | nulo | ninguno | total |
| `ContestarListaHibrida` | nulo | ninguno | total |
| `ListasRespuestas/GetAnexo` | nulo | ninguno | total |
| `ListasRespuestas/GetLista` | medio | corregir firma o variable para no tratar `idLista` como `evento` | media-alta |

### Corrección propuesta para `GetLista`

- No ampliar R3 por esa inconsistencia.
- Corregir después en una tarea separada de compatibilidad:
  - renombrar el parámetro a `evento`
  - o agregar una nueva operación aislada correcta sin romper consumidores existentes

## 14. Migración y despliegue

### Plan por pasos

1. crear tabla nueva de cabecera
2. agregar columna `idEjecucion` a `ListasRespuestas`
3. agregar índices nuevos
4. desplegar API compatible sin tocar Legacy
5. probar inicio o recuperación
6. probar guardado de una respuesta
7. probar recarga y recuperación
8. habilitar persistencia en la ruta nueva
9. monitorear
10. conservar Legacy sin cambios

### Reversibilidad

- Alta
- rollback:
  - deshabilitar endpoints nuevos
  - dejar BL26 sin persistencia
  - conservar Legacy intacto

### Riesgos de despliegue

- consultas nuevas sin índice
- errores de upsert si no se define bien la llave única
- necesidad de limpiar duplicados si se insertara antes de aplicar restricción

## 15. Rollback

| Paso | Acción |
|---|---|
| 1 | desactivar endpoints nuevos de ejecución persistente |
| 2 | dejar BL26 en modo sin persistencia |
| 3 | mantener `evento` y Legacy sin tocar |
| 4 | no migrar históricos ni revertir datos existentes |
| 5 | si fuera necesario, remover uso de la columna nueva desde la API antes de revertir esquema en una ventana controlada |

## 16. Recomendación final

### Obligatorio para R3

- Crear una cabecera nueva conceptual `InspeccionesEjecuciones`
- Agregar `idEjecucion` en `ListasRespuestas`
- Agregar índice único en `ListasRespuestas(idEjecucion, idPregunta)`
- Agregar índices de búsqueda de ejecución abierta en cabecera
- Hacer que la API genere y controle:
  - `idEjecucion`
  - `eventoLegacy`
  - `estado`

### Puede esperar a R4/R5

- workflow más amplio de estados
- métricas avanzadas de progreso
- cierre con resumen y firmas
- estrategia completa de evidencias

### No recomendado

- reutilizar `evento` como identidad principal
- resolver recuperación por heurística de “última captura”
- persistencia en navegador
- tabla puente sin columna directa en `ListasRespuestas`

## 17. Cambios exactos solicitados

- Tabla nueva propuesta:
  - `InspeccionesEjecuciones` nombre conceptual
- Columna nueva propuesta:
  - `ListasRespuestas.idEjecucion`
- Índices propuestos:
  - índice único `ListasRespuestas(idEjecucion, idPregunta)`
  - índice de búsqueda de cabecera por `idEmpresa, idInspector, estado, idLista, idSucursal`
  - índice por `eventoLegacy`
- Datos existentes que no se modificarían:
  - históricos de `ListasRespuestas`
  - históricos de `AnexoPregunta`
  - `evento` ya existente
- Contratos Legacy que permanecerían intactos:
  - `POST /api/Evaluaciones?evento=...`
  - proxies frontend legacy e híbrido actuales

## 18. Riesgos

| Riesgo | Mitigación propuesta |
|---|---|
| duplicados previos a la restricción única | aplicar la nueva restricción solo al flujo nuevo |
| mezclar tenant o inspector | resolver identidad desde sesión/claims en API |
| ambigüedad al recuperar ejecución | recuperar solo por cabecera abierta |
| romper reportes | conservar `eventoLegacy` |
| sobrecarga de cambios | no migrar históricos ni tocar Legacy |

## 19. Solicitud de autorización al Product Owner

Se solicita autorización expresa para el cambio mínimo de modelo necesario para persistencia controlada de inspecciones en campo:

- crear una nueva tabla conceptual de cabecera `InspeccionesEjecuciones`
- agregar una nueva columna `idEjecucion` en `ListasRespuestas`
- crear los índices:
  - único sobre `ListasRespuestas(idEjecucion, idPregunta)`
  - búsqueda de cabecera por `idEmpresa, idInspector, estado, idLista, idSucursal`
  - índice por `eventoLegacy`
- no modificar datos históricos existentes en `ListasRespuestas` ni `AnexoPregunta`
- mantener intactos los contratos Legacy actuales basados en `evento`
- resolver con esto los riesgos hoy no cubiertos:
  - identidad persistente de ejecución
  - recuperación multi-sesión
  - guardado incremental seguro
  - actualización confiable de respuesta
  - prevención de duplicados
- ejecutar rollback sin afectar Legacy:
  - deshabilitando la nueva API de ejecución persistente
  - manteniendo `evento` y el flujo Legacy sin cambios

## 20. Certificación previa del cambio de esquema

### 20.1 Motor y compatibilidad

| Propiedad | Resultado | Impacto |
|---|---|---|
| Motor | SQL Server | compatible con el enfoque propuesto |
| Versión aproximada | `16.0.4145.4` | motor moderno; soporte suficiente para índices filtrados y `rowversion` |
| Edición | Web Edition 64-bit | sin bloqueo para el cambio propuesto |
| Collation servidor y base | `SQL_Latin1_General_CP1_CI_AS` | comparación case-insensitive heredada |
| GUID actuales | `uniqueidentifier` | consistente con nueva cabecera y `idEjecucion` |
| `rowversion` | soportado | opción mínima de concurrencia viable |
| Índices filtrados | soportados por el motor observado | permite proteger solo nuevas filas con `idEjecucion` |
| Zona horaria de servidor | `-07:00` al momento de la auditoría | la base usa hora local del servidor; no se observó convención UTC |

### 20.2 Estructura exacta actual de `ListasRespuestas`

| Elemento | Definición actual |
|---|---|
| PK | `PK_ListasRespuestas(id)` |
| Tipo PK | `uniqueidentifier` con default `(newid())` |
| Índices adicionales | ninguno |
| FKs declaradas | ninguna |
| Triggers | ninguno |
| Defaults | `id = newid()`, `obligatoria = 1`, `Fecha = getdate()`, `FechaRespuesta = getdate()` |
| Volumen auditado | `5872` filas |
| Filas sin `evento` | `0` |
| Eventos distintos | `430` |
| Eventos repetidos entre empresas | no se observaron |

### 20.3 Respuestas expresas sobre `ListasRespuestas`

1. ¿Existe más de una fila para la misma combinación `evento + idPregunta`?
   - Sí.
2. ¿Los tipos de respuesta múltiples usan varias filas?
   - Sí. Los duplicados de tipo `3` muestran varias filas con distintos valores por la misma pregunta.
3. ¿Hay filas sin `evento`?
   - No en la auditoría observada.
4. ¿Hay eventos repetidos entre empresas?
   - No se observaron en la muestra global auditada.
5. ¿La tabla tiene un identificador único por respuesta?
   - Sí, `id`.
6. ¿Agregar una FK nullable es compatible?
   - Sí, `ListasRespuestas.idEjecucion` nullable es compatible con históricos y con Legacy.

### 20.4 Resultado de duplicados

| Resultado | Valor |
|---|---:|
| Combinaciones duplicadas por `evento + empresa + lista + pregunta` | `84` |
| Filas involucradas | `276` |
| Duplicados en tipos distintos de `3` | `43` combinaciones |
| Duplicados en tipo `3` | `41` combinaciones |
| Máximo observado en no múltiples | `11` filas |
| Máximo observado en múltiples | `7` filas |

Impacto:

- El histórico confirma que un índice único general por `idEjecucion + idPregunta` rompería el patrón de tipo `3`.
- También confirma que el histórico sufrió reintentos o reenvíos repetidos en tipos no múltiples.

### 20.5 Ajuste definitivo de la propuesta

La propuesta queda certificada así:

- Tabla nueva exacta:
  - `dbo.InspeccionesEjecuciones`
- PK de cabecera:
  - `id`
- Columna nueva exacta en detalle:
  - `dbo.ListasRespuestas.idEjecucion`
- Compatibilidad:
  - `evento` se conserva
  - Legacy sigue insertando con `idEjecucion = NULL`

### 20.6 Estados mínimos certificados

| Estado | Valor persistido | Uso en R3 | Uso futuro |
|---|---:|---|---|
| Abierta | `1` | sí | sí |
| Terminada | `2` | no obligatoria en la primera entrega | sí |
| Cancelada | `3` | no obligatoria en la primera entrega | sí |

Decisión:

- R3 puede arrancar operativamente usando `Abierta`.
- Conviene dejar `Terminada` y `Cancelada` definidas desde esquema para no volver a alterar la cabecera en R5.

### 20.7 Índice recomendado

| Alternativa de índice | Compatible | Riesgo | Recomendación |
|---|---|---|---|
| Único simple `idEjecucion + idPregunta` | no | rompería tipo `3` | descartado |
| Único filtrado para no múltiples | sí | requiere que la API siempre informe `idTipoPregunta` en nuevas filas | recomendado |
| Único para múltiples usando `RespuestaValor` | no con el esquema actual | `RespuestaValor` es `text` y no es clave indexable | descartado |

Índices finales recomendados:

1. `UX_ListasRespuestas_IdEjecucion_IdPregunta_NoTipo3`
   - único filtrado
   - protege tipos distintos de `3`
2. `IX_ListasRespuestas_IdEjecucion_Recuperacion`
   - no único
   - acelera recuperación general por ejecución
3. `UX_InspeccionesEjecuciones_EventoLegacy`
   - único
   - evita colisión en el evento de compatibilidad
4. `IX_InspeccionesEjecuciones_AbiertaBusqueda`
   - filtrado por `activo = 1 AND estado = 1`
   - acelera iniciar o recuperar

### 20.8 FKs certificadas

| FK | Compatible | Acción de eliminación | Riesgo |
|---|---:|---|---|
| `FK_ListasRespuestas_InspeccionesEjecuciones` | sí | `NO ACTION` | bajo |
| `FK_InspeccionesEjecuciones_Sucursales` | sí | `NO ACTION` | bajo |
| `FK_InspeccionesEjecuciones_Usuarios_Responsable` | sí | `NO ACTION` | bajo |
| `FK_InspeccionesEjecuciones_Usuarios_Inspector` | sí | `NO ACTION` | bajo |

FK no recomendada en esta pasada:

- `InspeccionesEjecuciones.idLista -> Listas.id`
  - motivo:
    - `Listas.id` no expone PK ni índice único declarado en la metadata auditada
    - forzar esta integridad requeriría tocar primero la estructura de `Listas`
  - decisión:
    - validar `idLista` desde API en R3
    - evaluar hardening de `Listas` en otra fase si se autoriza

### 20.9 Concurrencia mínima

Control mínimo elegido:

- `rowversion` en cabecera
- índice único filtrado para tipos no múltiples
- transacción
- validación semántica en API para tipo `3`

Justificación:

- `rowversion` está soportado por el motor actual y evita incrementar manualmente una versión numérica.
- El índice único cubre el riesgo mayor de doble guardado sobre tipos simples.
- Para tipo `3`, el modelo actual usa varias filas y `RespuestaValor` es `text`, por lo que la unicidad detallada debe controlarse en API y no en un índice de clave con este esquema.

### 20.10 Límites transaccionales propuestos

#### Iniciar o recuperar

```text
BEGIN TRAN
  resolver tenant e inspector desde sesion
  validar lista ejecutable, sucursal y responsable
  buscar ejecucion abierta activa
  si existe -> devolverla
  si no existe -> crear cabecera y generar eventoLegacy
COMMIT
```

#### Guardar respuesta

```text
BEGIN TRAN
  validar ejecucion, tenant y pregunta
  si tipo != 3:
    insert/update por idEjecucion + idPregunta
  si tipo = 3:
    reconciliar filas existentes de esa pregunta en la ejecucion
    insertar solo los valores seleccionados del intento actual
  actualizar fechaUltimaActividad
COMMIT
```

#### Recuperar

```text
leer cabecera
leer respuestas por idEjecucion
leer cuestionario por idLista
recomponer contexto
```

#### Cerrar posteriormente

```text
BEGIN TRAN
  validar ejecucion abierta
  validar pendientes obligatorias
  actualizar estado y fechaCierre
COMMIT
```

### 20.11 Prueba en seco

| Prueba | Resultado | Bloqueo |
|---|---|---|
| Tipos coinciden para nueva cabecera y `idEjecucion` | sí | ninguno |
| FK detalle -> cabecera nullable | sí | ninguno |
| FK a `Sucursales` y `Usuarios` | sí | ninguno |
| FK a `Listas` | no certificada | `Listas.id` no tiene PK o índice único declarado |
| Índice único general por `idEjecucion + idPregunta` | no | rompería múltiples |
| Índice filtrado no múltiples | sí | requiere `idTipoPregunta` informado en nuevas filas |
| Legacy insertando con `idEjecucion = NULL` | sí | ninguno |
| Resultados existentes usando `evento` | sí | ninguno inmediato |
| Respuestas múltiples sin cambiar el modelo actual | sí, con control API | no queda unicidad detallada 100% en DB con `text` |

### 20.12 Scripts preparados

Archivos creados como propuesta no ejecutada:

- `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/recolecciones-r3-up.sql`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/sql/recolecciones-r3-down.sql`

### 20.13 Compatibilidad Legacy certificada

| Componente Legacy | Impacto esperado | Prueba requerida |
|---|---|---|
| `/ContestarLista/Index` | ninguno | envío legacy sigue funcionando con `idEjecucion = NULL` |
| `POST /api/Evaluaciones?evento=...` | ninguno | insert directo sin cambio de payload |
| `ContestarListaHibrida` | ninguno | guardado híbrido intacto |
| `Resultados` | ninguno inmediato | sigue consultando por `evento` |
| históricos existentes | ninguno | no se migran ni se alteran |

### 20.14 Riesgos certificados

| Riesgo | Estado |
|---|---|
| `Listas.id` sin PK declarada | abierto |
| `RespuestaValor` tipo `text` impide índice único detallado para tipo `3` | abierto |
| reintentos históricos en tipos no múltiples | controlable con nuevo índice filtrado para flujo nuevo |
| hora local del servidor no UTC | documentado |

### 20.15 Plan posterior una vez autorizado

1. respaldo
2. ejecutar script de avance
3. validar objetos nuevos
4. adaptar API compatible
5. implementar endpoints aislados
6. probar inicio
7. probar guardado
8. probar recuperación
9. conectar frontend
10. QA y regresión
11. rollback si falla

### 20.16 Objetos exactos solicitados

- Tabla:
  - `dbo.InspeccionesEjecuciones`
- Columna nueva:
  - `dbo.ListasRespuestas.idEjecucion`
- FK:
  - `FK_ListasRespuestas_InspeccionesEjecuciones`
  - `FK_InspeccionesEjecuciones_Sucursales`
  - `FK_InspeccionesEjecuciones_Usuarios_Responsable`
  - `FK_InspeccionesEjecuciones_Usuarios_Inspector`
- Índices:
  - `UX_InspeccionesEjecuciones_EventoLegacy`
  - `IX_InspeccionesEjecuciones_AbiertaBusqueda`
  - `IX_ListasRespuestas_IdEjecucion_Recuperacion`
  - `UX_ListasRespuestas_IdEjecucion_IdPregunta_NoTipo3`

### 20.17 Solicitud final de autorización

Solicito autorización para:

1. Crear la tabla `dbo.InspeccionesEjecuciones` con las columnas definidas en esta certificación.
2. Agregar la columna nullable `dbo.ListasRespuestas.idEjecucion`.
3. Crear la FK `FK_ListasRespuestas_InspeccionesEjecuciones`.
4. Crear el índice filtrado `UX_ListasRespuestas_IdEjecucion_IdPregunta_NoTipo3`.
5. Crear los índices auxiliares:
   - `IX_ListasRespuestas_IdEjecucion_Recuperacion`
   - `UX_InspeccionesEjecuciones_EventoLegacy`
   - `IX_InspeccionesEjecuciones_AbiertaBusqueda`
6. Crear las FKs de cabecera:
   - `FK_InspeccionesEjecuciones_Sucursales`
   - `FK_InspeccionesEjecuciones_Usuarios_Responsable`
   - `FK_InspeccionesEjecuciones_Usuarios_Inspector`

No se modificarán registros históricos.
No se cambiarán contratos Legacy.
No se ejecutará migración masiva.
El rollback eliminará únicamente los objetos nuevos, siempre que no existan ejecuciones que deban conservarse o que antes se haya autorizado explícitamente la pérdida de esos datos nuevos.
