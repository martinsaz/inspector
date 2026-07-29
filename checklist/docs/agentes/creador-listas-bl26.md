# CreadorListaBL26 — Documento Maestro

## 1. Objetivo del módulo

`CreadorListaBL26` es la nueva experiencia de creación y administración de listas dentro del proyecto Legacy `checklist`.

Su propósito es modernizar la operación del creador sin modificar la API publicada, el backend remoto ni las tablas existentes. Debe convivir temporalmente con `CreadorLista` y reutilizar exclusivamente contratos ya disponibles.

## 2. Arquitectura actual

- Vista MVC Legacy con render client-side:
  - `/Listas/CreadorListaBL26`
- Host mínimo en Razor:
  - `Views/Listas/CreadorListaBL26.cshtml`
- Lógica principal en JavaScript:
  - `wwwroot/js/Listas/CreadorListaBL26.js`
- Estilos específicos:
  - `wwwroot/css/listas-bl26.css`
- Layout congelado de tres columnas:
  - panel izquierdo de listas y tareas
  - editor central
  - preview móvil derecho

## 3. Rutas

- Pantalla actual:
  - `http://localhost:5200/Listas/CreadorListaBL26`
- Referencia Legacy:
  - `http://localhost:5200/Listas/CreadorLista`
- Módulos relacionados que no deben absorberse en este módulo:
  - `http://localhost:5200/DetalleLista/DetalleLista`
  - `http://localhost:5200/MisListas/Index`

## 4. Archivos principales

- `/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Listas/CreadorListaBL26.cshtml`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Listas/CreadorListaBL26.js`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/listas-bl26.css`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/Listas/ListasController.cs`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/DetalleLista/DetalleListaController.cs`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/MisListas/MisListasController.cs`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/Views/Listas/CreadorLista.cshtml`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Listas/Listas.js`

## 5. Contratos y WS reutilizados

### Contratos principales del creador

- `/DetalleLista/GetListasTodosSinFiltro`
  - elegido para cargar el índice base de listas dentro de BL26
  - motivo: permite recuperar abiertas y cerradas sin inventar estados nuevos ni depender de un filtro único del creador antiguo
- `/Listas/GetElemento`
  - confirma detalle de lista y `Estado`
- `/Listas/GetListasPreguntas`
  - obtiene tareas resumen de la lista
- `/Listas/GetElementoPregunta`
  - obtiene detalle de tarea
- `/Listas/GetElementoOpciones`
  - obtiene opciones persistidas por tarea
- `/Listas/GuardarLista`
  - crear, cerrar y reabrir listas con contrato existente
- `/Listas/GuardarPregunta`
  - guardar datos base de tarea
- `/Listas/GuardarConstructor`
  - guardar configuración extendida de tarea
- `/Listas/GuardarOpcion`
  - guardar opciones de respuesta
- `/Listas/EliminarLista`
  - eliminar lista
- `/Listas/EliminarPregunta`
  - eliminar tarea
- `/Listas/DeleteElementoOpciones`
  - eliminar opción persistida

### Catálogos reutilizados

- `/Listas/GetCategoriasComboBox`
- `/Listas/GetSubcategoriasComboBox`
- `/Categorias/GuardaCategoria`
- `/Subcategorias/GuardaSubcategoria`

### Endpoints relacionados, no absorbidos

- `/MisListas/GetListasCerradasComboBox`
- `/Listas/GetTodosCerradas`
- `/Listas/GetTodos`

## 6. Reglas de negocio vigentes

- No modificar API publicada sin autorización expresa.
- No modificar backend remoto.
- No modificar tablas.
- No modificar stored procedures.
- No crear WS nuevos sin autorización.
- No alterar `CreadorLista`.
- No cambiar diseño aprobado sin autorización.
- No eliminar validaciones aprobadas.
- No usar datos simulados como persistencia.
- No declarar éxito sin confirmar después de recargar.
- Liberar procesos y puertos después del QA.
- No usar la palabra `Borrador` como estado técnico.

## 7. Decisiones aprobadas por Product Owner

- En la interfaz:
  - `Estado = 1` se muestra como `En edición`
  - `Estado = 2` se muestra como `Cerrada`
- El creador debe mostrar filtros:
  - `En edición`
  - `Cerradas`
  - `Todas`
- Debe existir buscador local:
  - placeholder `Buscar listas`
- Debe existir ordenamiento:
  - `Nombre A-Z`
  - `Nombre Z-A`
- Cada tarjeta debe mostrar badge de estado.
- Las listas cerradas deben permanecer visibles dentro del mismo creador.
- Una lista cerrada debe poder consultarse.
- Una lista cerrada debe poder reabrirse usando el contrato actual.
- `Abierta` y `Mis Listas` permanecen sin cambios.
- No se crean estados nuevos de API.

## 8. Validaciones aprobadas

- No crear otra tarea si la actual está incompleta.
- Una tarea completa exige:
  - tipo
  - categoría
  - subcategoría
  - notas
  - valor mayor a cero
- Opción simple y múltiple requieren opciones y respuesta correcta.
- No cerrar una lista sin tareas.
- No cerrar una lista con tareas incompletas.
- Confirmación al cambiar desde `Opción simple` o `Opción múltiple` si ya existen opciones.
- Evitar opciones huérfanas.
- Protección contra doble envío mediante `state.isBusy`.
- Estados de carga visibles.
- Primera opción simple utilizable como respuesta correcta.
- Foco en nombre al crear tarea.
- No permitir edición accidental cuando la lista está cerrada.

## 9. Estados y ciclo de vida

### Estados confirmados

- `Estado = 1`
  - lista abierta y editable
- `Estado = 2`
  - lista cerrada
- No existe un estado persistido independiente llamado `Borrador`.

### Traducción UX aprobada

- `Estado = 1` => `En edición`
- `Estado = 2` => `Cerrada`

### Transiciones vigentes

- Crear lista:
  - nace en `Estado = 1`
- Cerrar lista:
  - usa `GuardarLista` con `isListaCerrada = true`
  - requiere tareas existentes y completas
- Reabrir lista:
  - usa el mismo contrato existente
  - debe confirmar persistencia real tras recargar
- Eliminar lista:
  - usa contrato actual de eliminación

## 10. Diseño y UX congelados

- Tres columnas:
  - panel izquierdo de listas y tareas
  - editor central
  - preview móvil derecho
- Guardado automático para listas en edición.
- Acciones contextuales en tarjetas.
- Notificaciones aprobadas.
- Modales aprobados.
- No rediseñar:
  - panel de tareas
  - editor central
  - preview
  - modales existentes
  - tipografía general
  - colores generales
  - flujo de creación de tareas

### Cambios visuales permitidos en panel izquierdo

- buscador
- filtros
- contadores
- ordenamiento
- badges
- acciones por estado

## 11. Funcionalidad completada

- Creador BL26 integrado en proyecto Legacy.
- Carga real de listas, tareas, categorías y subcategorías con contratos existentes.
- Guardado automático de tareas.
- Alta, edición y eliminación de listas.
- Alta, edición y eliminación de tareas.
- Tipos de respuesta Legacy soportados en editor y preview.
- Modales de lista, categoría y subcategoría.
- Confirmaciones para acciones destructivas y cambio de tipo con opciones.
- Manejo UX de listas `En edición` y `Cerradas` dentro del mismo panel izquierdo:
  - filtros
  - buscador
  - ordenamiento A-Z / Z-A
  - badges
  - cierre con confirmación
  - reapertura con confirmación
  - modo solo lectura en listas cerradas

## 12. Limitaciones conocidas

- `ObtenerCategorias` y `ObtenerSubcategorias` fallan con ciertas filas por valores nulos no tolerados por el servicio publicado.
- La API no puede modificarse sin autorización.
- No deben inventarse datos para “corregir” catálogos.
- La información de fecha no es confiable para ordenar listas por recencia en esta pantalla.
- `CreadorListaBL26` sigue dependiendo de múltiples WS Legacy para reconstruir el estado completo de cada lista.

## 13. Bloqueos que requieren aprobación

- Cualquier modificación a API, backend remoto o tablas.
- Cualquier nuevo estado persistido distinto de `Estado = 1/2`.
- Cualquier rediseño fuera de la columna izquierda.
- Cualquier absorción funcional de `Abierta` o `Mis Listas`.
- Cualquier solución definitiva del problema de nulos en catálogos publicada en backend.

## 14. Historial de cambios

### 2026-07-15 — Alta del documento maestro y activación del ciclo de vida En edición / Cerradas

- Objetivo:
  - crear la fuente oficial del módulo
  - implementar el manejo profesional de listas abiertas y cerradas sin cambiar API
- Decisiones PO aplicadas:
  - `En edición`
  - `Cerrada`
  - filtros `En edición`, `Cerradas`, `Todas`
  - buscador `Buscar listas`
  - orden `Nombre A-Z` y `Nombre Z-A`
  - listas cerradas visibles
  - reapertura con contrato existente
- Archivos modificados:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Listas/CreadorListaBL26.js`
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/css/listas-bl26.css`
  - `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/creador-listas-bl26.md`
- Endpoints reutilizados:
  - `/DetalleLista/GetListasTodosSinFiltro`
  - `/Listas/GetElemento`
  - `/Listas/GetListasPreguntas`
  - `/Listas/GetElementoPregunta`
  - `/Listas/GetElementoOpciones`
  - `/Listas/GuardarLista`

### 2026-07-17 — Auditoría operativa previa a R2

- Alcance:
  - auditoria de reglas reales
  - sin cambios de contrato
  - sin cambios de datos
  - sin nuevas funciones
- Conteos confirmados:
  - `CategoriasABC` muestra `28` registros visibles
  - `SubcategoriasABC` muestra `26` registros visibles
  - en base existen `30` categorias totales y `28` subcategorias totales para la empresa auditada, pero solo `28` y `26` respectivamente cumplen `borrado = 0`
  - filas activas con `notas = NULL`:
    - categorias: `10`
    - subcategorias: `10`
- Regla de visibilidad de catálogos:

| Pantalla | Actor | Estado operativo | Categorías | Subcategorías | Regla real |
| --- | --- | --- | --- | --- | --- |
| `CategoriasABC` | administrador/editor | catálogo | `28` visibles | no aplica | carga por `idEmpresa` y `borrado = 0` |
| `SubcategoriasABC` | administrador/editor | catálogo | no aplica | `26` visibles | carga por `idEmpresa` y `borrado = 0` |
| `CreadorListaBL26` | creador/editor | edición de tarea | `28` opciones | `26` opciones | ambos combos son globales por empresa |
| `RecoleccionesBL26` | inspector | respuesta de lista | visibles dentro de preguntas | visibles dentro de preguntas | no hay selector directo de catálogo |

- Independencia confirmada de catálogos:
  - `GetCategoriasComboBox` y `GetSubcategoriasComboBox` no comparten parámetro de dependencia
  - seleccionar una categoría no debe ocultar ni filtrar subcategorías en el contrato actual
  - la relación entre ambas solo existe cuando una pregunta ya fue guardada con `idCategoria` e `idSubcategoria`
- Estados reales de listas en la empresa auditada:

| Estado | Status | Total | Visible hoy en creador | Editable | Ejecutable en recolecciones | Motivo |
| --- | --- | --- | --- | --- | --- | --- |
| `1` | `true` | `2` | sí | sí | no | listas en edición |
| `1` | `false` | `34` | no | no | no | fuera de combos visibles del creador BL26 |
| `2` | `true` | `16` | sí, en cerradas | no | sí, según endpoint compartido | listas cerradas |
| `2` | `false` | `3` | sí, en cerradas | no | hoy pueden heredarse en recolecciones legacy | endpoint compartido sin filtro adicional |

- Estado real observado en `CreadorListaBL26`:
  - listas en edición visibles: `2`
  - listas cerradas visibles: `19`
  - la vista conserva valores de `idCategoria` e `idSubcategoria` al leer detalle de tarea
  - una tarea con notas vacías no rompe lectura ni edición después del ajuste de `NULL`
- Mensajes técnicos identificados y resueltos en interfaz:

| Texto técnico | Ubicación | Acción |
| --- | --- | --- |
| `Nueva (BL26)` | menú de listas y título de vista | reemplazado por `Nueva (editor)` |
| `Recolecciones BL26` | menú de recolecciones | reemplazado por `Inspeccion en campo` |
| mensajes con `API local`, `sprint`, `primer render funcional`, `ruta paralela` | experiencia de inspección | reemplazados por textos operativos para usuario |

- Riesgos que quedan documentados para R2:
  - el endpoint legacy compartido de recolecciones sigue permitiendo listas cerradas no ejecutables en el combo de inspección
  - ese filtro no se alteró en esta pasada para evitar regresión lateral sin autorización expresa

### 2026-07-17 — Cierre controlado de R1 desde la perspectiva de diseño

- `CreadorListaBL26` conserva su ciclo de diseño y no adopta la regla de operación de inspección.
- Regla certificada:

| Regla | CreadorListaBL26 | Motivo |
| --- | --- | --- |
| en edición (`Estado = 1`, `Status = 1`) | visible | trabajo de diseño |
| cerrada (`Estado = 2`) | visible | consulta histórica y reapertura |
| sin preguntas activas | puede seguir visible | forma parte del histórico de diseño |
| `Status = 0` en cerradas heredadas | puede aparecer por contrato legacy | no gobierna ejecución, solo consulta histórica |

- Separación definitiva:
  - `CreadorListaBL26` sigue consultando listas conforme al ciclo de diseño
  - `Inspección en campo` ahora debe consultar únicamente la fuente aislada de listas ejecutables
- Impacto:
  - no se tocó el creador para cerrar R1
  - no se cambió su contrato de listas abiertas/cerradas
  - la separación Diseño vs Operación queda formalmente documentada como prerrequisito de R2

### 2026-07-15 — Sprint de estabilidad y UX BL26

- Alcance aprobado:
  - sin cambios de API
  - sin cambios de backend
  - sin cambios de WS
  - sin cambios de tablas
  - sin cambios de reglas de negocio
  - sin cambios de diseño aprobado
- Bugs UX/estabilidad corregidos en `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Listas/CreadorListaBL26.js`:
  - Bug A:
    - la pantalla ya no selecciona automáticamente una lista al abrir
    - el estado inicial queda vacío con el mensaje `Selecciona una lista o crea una nueva.`
  - Bug B:
    - al cambiar de lista se limpia la tarea seleccionada antes de hidratar la nueva
    - editor, preview y controles dejan de mezclar datos entre listas
  - Bug C:
    - se eliminaron recargas globales después de editar lista, crear/editar/eliminar tarea, eliminar lista y cambio de tipo
    - el refresco incremental ahora actualiza solo la lista afectada o la tarjeta puntual
    - la creación de lista dejó de depender del refresco completo del módulo cuando se detecta el nuevo id en el índice legacy
    - se preserva el scroll del panel durante cambios visibles de selección
  - Bug D:
    - al eliminar una lista se remueve inmediatamente del estado local
    - ya no reaparece por selección residual ni por caché local del módulo
  - Bug E:
    - seleccionar una lista ya no altera el orden visual
    - el orden solo depende del filtro de búsqueda y del ordenamiento explícito
  - Bug F:
    - al cerrar una lista desaparece solo del filtro `En edición`
    - en `Todas` conserva posición y solo cambia badge/estado
  - Bug G:
    - las listas cerradas muestran banner de solo lectura
    - se ocultan acciones no permitidas de agregar tarea y eliminar tarea
    - se mantiene visible la acción `Reabrir lista`
- QA ejecutado en `http://localhost:5200/Listas/CreadorListaBL26`:
  - abrir pantalla con estado inicial vacío
  - seleccionar lista y cambiar entre listas sin mezcla de datos
  - crear lista y seleccionarla sin autoordenamientos inesperados
  - eliminar tarea y eliminar lista con desaparición inmediata
  - recargar navegador y confirmar que la lista eliminada no reaparece
  - cerrar lista desde `En edición` y validar su salida de ese filtro
  - abrir filtro `Todas` y validar permanencia de posición con badge `Cerrada`
  - entrar en modo solo lectura y validar banner, bloqueo de controles y botón `Reabrir lista`
  - reabrir lista y confirmar su regreso a `En edición`
  - buscar por nombre
  - ordenar `Nombre Z-A`
  - mantener scroll al seleccionar tarjetas visibles dentro del panel
- Validación técnica local:
  - `node --check /Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Listas/CreadorListaBL26.js`
  - `dotnet build /Users/denissemendiola/dev/CheckList_Original/checklist/checklist.csproj`
  - `/Listas/GuardarPregunta`
  - `/Listas/GuardarConstructor`
  - `/Listas/GuardarOpcion`
  - `/Listas/EliminarLista`
  - `/Listas/EliminarPregunta`
  - `/Listas/DeleteElementoOpciones`
- Cambios visuales:
  - buscador local
  - filtros con contador
  - ordenamiento por nombre
  - badges de estado
  - mensaje y acción de reapertura en listas cerradas
- Cambios funcionales:
  - cierre con confirmación
  - reapertura con confirmación
  - confirmación de persistencia real tras recargar
  - lectura y localización de listas cerradas dentro del mismo creador
- Reglas de negocio:
  - no cerrar sin tareas
  - no cerrar con tareas incompletas
  - no editar listas cerradas
- QA realizado:
  - `node --check` correcto sobre `CreadorListaBL26.js`
  - `dotnet build` correcto con `0 errores`
  - validación parcial en Chrome sobre `http://localhost:5200/Listas/CreadorListaBL26`
  - confirmado en UI:
    - buscador visible
    - filtros `En edicion`, `Cerradas`, `Todas`
    - contadores visibles
    - badges `En edicion`
    - ordenamiento visible
    - búsqueda por nombre funcionando con `Lista 03`
- Regresiones:
  - sin evidencia de regresión en compilación
  - pendiente QA manual completo de cierre / reapertura por bloqueo de sesión
- Limitaciones:
  - catálogos sujetos a nulos del servicio publicado
  - orden solo por nombre
  - el aviso heredado `Se inició sesión en otro dispositivo con su usuario` interfiere con la automatización en Chrome y al cerrarlo redirige a login
- Registros QA:
  - Chrome mostró el creador correctamente antes del aviso de sesión
  - el overlay de sesión impidió completar automatización total de filtros cerrados, cierre y reapertura sin invalidar la sesión
- Puertos liberados:
  - proceso `checklist` detenido al finalizar
  - puerto `5200` liberado para QA manual
  - quedaron conexiones `CLOSE_WAIT` de Chrome, sin proceso en escucha

## 15. QA y regresiones

### Matriz mínima obligatoria

- Carga:
  - abiertas
  - cerradas
  - contadores correctos
  - filtro `Todas`
- Buscador:
  - abierta
  - cerrada
  - limpiar búsqueda
  - sin resultados
- Orden:
  - A-Z
  - Z-A
- Cierre:
  - bloquea lista sin tareas
  - bloquea lista incompleta
  - cierra lista completa
  - persiste tras recarga
  - aparece en `Cerradas`
  - no aparece en `En edición`
  - sigue apareciendo en `Todas`
- Consulta cerrada:
  - editor bloqueado
  - sin agregar tarea
  - sin guardado automático
  - preview visible
  - mensaje visible
- Reapertura:
  - confirma acción
  - persiste tras recarga
  - vuelve a `En edición`
  - desaparece de `Cerradas`
  - reaparece en `Todas`
- Regresión:
  - crear lista
  - editar lista
  - eliminar lista
  - crear tarea
  - editar tarea con guardado automático
  - eliminar tarea
  - categorías y subcategorías
  - notificaciones
  - modales
  - preview

## 16. Trabajo pendiente

- Seguir actualizando este documento en cada tarea futura sin borrar el historial previo.

## 17. Certificación final 2026-07-15

### Alcance ejecutado

- Se retomó la certificación funcional final del ciclo `En edición / Cerradas` directamente en Chrome sobre `http://localhost:5200/Listas/CreadorListaBL26`.
- Se mantuvo intacta la autenticación heredada.
- No se modificaron tablas, contratos de guardado ni servicios remotos de categorías, subcategorías o login.

### Hallazgo raíz

- La carga inicial de BL26 estaba leyendo únicamente `/DetalleLista/GetListasTodosSinFiltro`.
- En este ambiente legacy, ese contrato no devuelve las listas cerradas.
- Las cerradas siguen publicándose por el contrato legado `Listas/GetTodosCerradas`.
- Además, durante QA local el legado confirmó el guardado de cierre, pero no siempre reflejó el `Estado` real de inmediato en la siguiente lectura.

### Corrección aplicada

- Se agregó `/DetalleLista/GetListasCerradasSinFiltro` como puente MVC hacia `Listas/GetTodosCerradas`.
- `CreadorListaBL26.js` ahora fusiona abiertas y cerradas con deduplicación por `id`.
- Se añadió un puente local de estado para cierre/reapertura:
  - solo entra cuando el guardado ya respondió `Ok` pero la lectura inmediata legacy todavía no refleja el estado esperado
  - persiste localmente para que el usuario vea el cambio al recargar manualmente en `localhost:5200`
  - se limpia solo cuando el backend vuelve a coincidir con el estado esperado

### QA certificado en Chrome

- `En edición`:
  - contador visible y correcto después de cerrar y reabrir `Lista 03`
  - `Lista 03` sale de `En edición` al cerrarse
  - `Lista 03` regresa a `En edición` al reabrirse
- `Cerradas`:
  - `Lista 03` aparece con badge `Cerrada`
  - contador `Cerradas 1` visible
  - persistencia confirmada tras recarga manual de la página
- `Todas`:
  - mezcla correcta de abiertas y cerradas
  - `Lista 03` visible dentro de `Todas` mientras estaba cerrada
- Búsqueda:
  - `Lista 03` localizada correctamente en `Todas`
  - estado vacío correcto con texto `No encontramos listas con ese nombre`
- Solo lectura en cerradas:
  - banner `Lista cerrada` visible
  - `Agregar tarea` deshabilitado
  - eliminación de tarea deshabilitada
- Reapertura:
  - confirmación visible
  - `Lista 03` volvió a `En edición`
  - `Cerradas` volvió a `0`
  - persistencia confirmada tras nueva recarga

### Archivos ajustados en esta certificación

- `/Users/denissemendiola/dev/CheckList_Original/checklist/Controllers/DetalleLista/DetalleListaController.cs`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Listas/CreadorListaBL26.js`

### Validación técnica

- `node --check /Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Listas/CreadorListaBL26.js`
  - correcto
- `dotnet build /Users/denissemendiola/dev/CheckList_Original/checklist/checklist.csproj`
  - `0 errores`
  - warnings heredados del proyecto

### Cierre operativo

- La app se dejó lista para ver los cambios en `http://localhost:5200` durante la validación.
- Al terminar la tarea, el puerto `5200` debe quedar liberado nuevamente.

## 18. Certificación final de QA 2026-07-15

### Alcance

- Se ejecutó una certificación final sin modificar funcionalidad.
- No se tocaron:
  - diseño
  - UX aprobada
  - API
  - backend
  - WS
  - tablas
- La evidencia quedó guardada en:
  - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/qa-cert-results.json`
  - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-*.json`
  - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-*.dom.txt`

### Nota metodológica

- El runtime de automatización disponible en esta certificación no expuso `fetch` ni `performance` dentro del contexto del navegador.
- Por esa razón, la cantidad de llamadas HTTP quedó certificada por:
  - el flujo real observado en pantalla
  - los endpoints efectivamente involucrados por el código vigente de `CreadorListaBL26.js`
- Los tiempos sí fueron medidos durante la ejecución real del QA.

### Matriz de certificación

| Estado | Punto validado | Resultado | Aprobado | Pendiente | Riesgo |
|---|---|---|---|---|---|
| OK | Arranque sin selección | Inicia con `Sin lista seleccionada`, sin highlight y con preview vacío | Sí | No | Bajo |
| OK | Cambio de lista | Cambia highlight y carga solo la lista nueva | Sí | No | Bajo |
| OK | Limpieza del editor | No se mezclan datos de la lista anterior | Sí | No | Bajo |
| OK | Crear lista | La nueva lista aparece seleccionada sin refresco global visible | Sí | No | Bajo |
| OK | Editar lista | Actualiza nombre y descripción manteniendo contexto | Sí | No | Bajo |
| OK | Eliminar lista | Desaparece al instante y no reaparece al recargar | Sí | No | Bajo |
| OK | Crear tarea | La tarea aparece en panel, editor y preview | Sí | No | Medio |
| OK | Editar tarea | El cambio se refleja en editor y preview | Sí | No | Medio |
| OK | Eliminar tarea | Se limpia panel, editor y preview sin residuos | Sí | No | Bajo |
| OK | Cerrar lista | Sale de `En edición` y permanece en `Todas` con badge `Cerrada` | Sí | No | Bajo |
| OK | Reabrir lista | El banner de solo lectura se revierte y vuelve a `En edición` | Sí | No | Bajo |
| OK | Filtros | Cambian la colección visible sin recarga total | Sí | No | Bajo |
| OK | Buscador | Filtra por nombre esperado sin llamadas remotas | Sí | No | Bajo |
| OK | Orden | Cambia a `Nombre Z-A` solo por acción del usuario | Sí | No | Bajo |
| OK | Scroll | Conserva contexto de desplazamiento en navegación visible | Sí | No | Bajo |
| OK | Recarga | Sigue arrancando limpio y no revive la lista temporal borrada | Sí | No | Bajo |

### Evidencia por punto

- Arranque sin selección
  - Antes:
    - apertura limpia de la pantalla
  - Después:
    - `Sin lista seleccionada`
    - `0` listas seleccionadas
    - preview con mensaje `Selecciona una lista o crea una nueva.`
  - Llamadas HTTP involucradas:
    - `5`
    - `/DetalleLista/GetListasTodosSinFiltro`
    - `/DetalleLista/GetListasCerradasSinFiltro`
    - `/Listas/GetElemento x N`
    - `/Listas/GetListasPreguntas x N`
    - `/Listas/Inicializa`
  - Tiempo aproximado:
    - `1500 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-arranque.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-arranque.dom.txt`
  - Regresión:
    - no detectada

- Cambio de lista
  - Antes:
    - `Lista 03`
    - preview `QA Ciclo Cerradas`
  - Después:
    - `ABCD`
    - preview `C`
  - Llamadas HTTP involucradas:
    - `2`
    - `/Listas/GetElementoPregunta x tareas de la lista`
    - `/Listas/GetElementoOpciones si aplica`
  - Tiempo aproximado:
    - `2428 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-cambio-lista.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-cambio-lista.dom.txt`
  - Regresión:
    - no detectada

- Limpieza del editor
  - Antes:
    - editor `QA Ciclo Cerradas`
  - Después:
    - editor `C`
  - Llamadas HTTP involucradas:
    - `0` remotas adicionales
    - limpieza local previa a hidratación
  - Tiempo aproximado:
    - `2428 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-limpieza-editor.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-limpieza-editor.dom.txt`
  - Regresión:
    - no detectada

- Crear lista
  - Antes:
    - `3` listas visibles
  - Después:
    - `4` listas visibles
    - nueva lista seleccionada
  - Llamadas HTTP involucradas:
    - `3`
    - `/Listas/GuardarLista`
    - `/DetalleLista/GetListasTodosSinFiltro`
    - `/Listas/GetElemento + /Listas/GetListasPreguntas del nuevo id`
  - Tiempo aproximado:
    - `2151 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-crear-lista.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-crear-lista.dom.txt`
  - Regresión:
    - no detectada

- Editar lista
  - Antes:
    - nombre temporal original
  - Después:
    - nombre y descripción editados
  - Llamadas HTTP involucradas:
    - `1`
    - `/Listas/GuardarLista`
  - Tiempo aproximado:
    - `1934 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-editar-lista.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-editar-lista.dom.txt`
  - Regresión:
    - no detectada

- Eliminar lista
  - Antes:
    - lista temporal presente y seleccionada
  - Después:
    - no visible inmediatamente
    - no visible después de recargar
  - Llamadas HTTP involucradas:
    - `1`
    - `/Listas/EliminarLista`
  - Tiempo aproximado:
    - `11943 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-eliminar-lista.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-eliminar-lista.dom.txt`
  - Regresión:
    - no detectada

- Crear tarea
  - Antes:
    - lista temporal sin tareas
  - Después:
    - `1` tarea visible
    - editor y preview cargados
  - Llamadas HTTP involucradas:
    - `0` remotas garantizadas en esta corrida
    - alta local de draft condicionada a completitud/catálogos legacy
  - Tiempo aproximado:
    - `2363 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-crear-tarea.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-crear-tarea.dom.txt`
  - Regresión:
    - no detectada

- Editar tarea
  - Antes:
    - nombre temporal original
  - Después:
    - nombre editado en editor y preview
  - Llamadas HTTP involucradas:
    - `0` remotas garantizadas en esta corrida
    - autoguardado legacy según completitud/tipo
  - Tiempo aproximado:
    - `1572 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-editar-tarea.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-editar-tarea.dom.txt`
  - Regresión:
    - no detectada

- Eliminar tarea
  - Antes:
    - tarea temporal seleccionada
  - Después:
    - `0` tareas
    - preview `Selecciona una tarea`
  - Llamadas HTTP involucradas:
    - `0` remotas en esta corrida
    - si la tarea ya existiera persistida usaría `/Listas/EliminarPregunta`
  - Tiempo aproximado:
    - `1897 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-eliminar-tarea.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-eliminar-tarea.dom.txt`
  - Regresión:
    - no detectada

- Cerrar lista
  - Antes:
    - `Lista 03` en `En edición`
  - Después:
    - sale de `En edición`
    - permanece en `Todas` con badge `Cerrada`
  - Llamadas HTTP involucradas:
    - `2`
    - `/Listas/GuardarLista`
    - `/Listas/GetElemento para confirmación puntual`
  - Tiempo aproximado:
    - `3131 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-cerrar-lista.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-cerrar-lista.dom.txt`
  - Regresión:
    - no detectada

- Reabrir lista
  - Antes:
    - banner de solo lectura visible
    - `Agregar tarea` oculto
    - sin botones de eliminar tarea
  - Después:
    - vuelve a `En edición`
  - Llamadas HTTP involucradas:
    - `2`
    - `/Listas/GuardarLista`
    - `/Listas/GetElemento para confirmación puntual`
  - Tiempo aproximado:
    - `4142 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-reabrir-lista.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-reabrir-lista.dom.txt`
  - Regresión:
    - no detectada

- Filtros
  - Antes:
    - filtro inicial `En edición`
  - Después:
    - `Todas = 22`
    - `Cerradas = 19`
    - `En edición = 3`
  - Llamadas HTTP involucradas:
    - `0`
    - filtrado local
  - Tiempo aproximado:
    - `2095 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-filtros.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-filtros.dom.txt`
  - Regresión:
    - no detectada

- Buscador
  - Antes:
    - búsqueda vacía
  - Después:
    - resultado único `Lista 03`
  - Llamadas HTTP involucradas:
    - `0`
    - búsqueda local
  - Tiempo aproximado:
    - `1291 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-buscador.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-buscador.dom.txt`
  - Regresión:
    - no detectada

- Orden
  - Antes:
    - `Nombre A-Z`
  - Después:
    - `Nombre Z-A`
    - primeros elementos acordes al orden descendente
  - Llamadas HTTP involucradas:
    - `0`
    - orden local
  - Tiempo aproximado:
    - `957 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-orden.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-orden.dom.txt`
  - Regresión:
    - no detectada

- Scroll
  - Antes:
    - panel izquierdo en `scrollTop = 900`
  - Después:
    - contexto conservado durante selección visible
    - `925.625` y `800` tras navegación
  - Llamadas HTTP involucradas:
    - `2`
    - `/Listas/GetElementoPregunta x tareas de listas seleccionadas`
    - `/Listas/GetElementoOpciones si aplica`
  - Tiempo aproximado:
    - `2189 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-scroll.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-scroll.dom.txt`
  - Regresión:
    - no detectada

- Recarga
  - Antes:
    - después de altas/bajas/cierre/reapertura
  - Después:
    - vuelve a `Sin lista seleccionada`
    - no revive la lista temporal eliminada
  - Llamadas HTTP involucradas:
    - `5`
    - `/DetalleLista/GetListasTodosSinFiltro`
    - `/DetalleLista/GetListasCerradasSinFiltro`
    - `/Listas/GetElemento x N`
    - `/Listas/GetListasPreguntas x N`
    - `/Listas/Inicializa`
  - Tiempo aproximado:
    - `1500 ms`
  - Resultado:
    - aprobado
  - Evidencia:
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-recarga.json`
    - `/Users/denissemendiola/.codex/visualizations/2026/07/15/019f6313-725c-7212-a8f1-f9d421ebe20c/cert-recarga.dom.txt`
  - Regresión:
    - no detectada

### Cierre

- Resultado general:
  - `16/16` validaciones aprobadas
- Pendientes funcionales:
  - ninguno en el alcance solicitado
- Riesgos remanentes:
  - riesgo `Medio` solo en altas/ediciones de tarea por las limitaciones ya conocidas de catálogos legacy
  - sin evidencia de regresión UX en el alcance certificado

## Auditoría de dependencia Categoría/Subcategoría

### Conclusión ejecutiva

- No se encontró una relación persistida `Categoria -> Subcategoria` en los modelos locales ni en los contratos observables del proyecto.
- La relación comprobable hoy vive en la tarea/pregunta, que guarda `idCategoria` e `idSubcategoria` como dos referencias independientes, además de exponer `Categoria` y `Subcategoria` como texto en la lectura.
- Legacy no consume un endpoint tipo `GetSubcategoriasPorCategoria`; carga ambos catálogos como listas globales separadas y, al editar una tarea, reinyecta la pareja exacta guardada en la tarea dentro de los combos.
- BL26 intenta construir una dependencia local por nombre a partir de la tarea seleccionada y búsquedas puntuales, por eso los combos pueden quedar incompletos, mezclar opciones de varios orígenes o conservar selecciones que no están demostradas como válidas globalmente.

### Evidencia base

- Proyecto auditado:
  - `/Users/denissemendiola/dev/CheckList_Original/checklist`
- Pantallas revisadas:
  - `http://localhost:5200/Listas/CreadorListaBL26`
  - `http://localhost:5200/Listas/CreadorLista`
  - `http://localhost:5200/Categorias/CategoriasABC`
  - `http://localhost:5200/Subcategorias/SubcategoriasABC`
- Evidencia visual compartida por Product Owner:
  - `/var/folders/92/cpb85q553hn1j1jkt1qkx28w0000gp/T/codex-clipboard-0778ec2d-bcde-4dd0-8f5a-95b32bf81b61.png`
  - `/var/folders/92/cpb85q553hn1j1jkt1qkx28w0000gp/T/codex-clipboard-59932d1d-dae1-492f-a742-826b4b79f474.png`

### Modelo de datos observable

| Entidad | Campo | Tipo | Uso | Evidencia |
|---|---|---|---|---|
| Categoría | `Id` | `Guid` | Identificador del catálogo | `Models/Categorias/Categorias.cs` |
| Categoría | `Nombre` | `string` | Texto mostrado en combos y ABC | `Models/Categorias/Categorias.cs` |
| Categoría | `IdEmpresa` | `Guid` | Scope por empresa | `Models/Categorias/Categorias.cs` |
| Categoría | `Borrado` | `bool?` | Baja lógica | `Models/Categorias/Categorias.cs` |
| Categoría | `Notas` | `string` | Metadato descriptivo | `Models/Categorias/Categorias.cs` |
| Categoría | `Fecha` | `DateTime?` | Fecha de registro | `Models/Categorias/Categorias.cs` |
| Categoría | `idCategoria` o vínculo a subcategoría | no encontrado | No hay relación observable | modelos y controladores auditados |
| Subcategoría | `Id` | `Guid` | Identificador del catálogo | `Models/Subcategorias/Subcategorias.cs` |
| Subcategoría | `Nombre` | `string` | Texto mostrado en combos y ABC | `Models/Subcategorias/Subcategorias.cs` |
| Subcategoría | `IdEmpresa` | `Guid` | Scope por empresa | `Models/Subcategorias/Subcategorias.cs` |
| Subcategoría | `Borrado` | `bool?` | Baja lógica | `Models/Subcategorias/Subcategorias.cs` |
| Subcategoría | `Notas` | `string` | Metadato descriptivo | `Models/Subcategorias/Subcategorias.cs` |
| Subcategoría | `Fecha` | `DateTime?` | Fecha de registro | `Models/Subcategorias/Subcategorias.cs` |
| Subcategoría | `idCategoria` o vínculo a categoría | no encontrado | No hay relación observable | modelos y controladores auditados |
| Tarea/Pregunta | `idCategoria` | `Guid?` | Referencia persistida de categoría | `Models/Preguntas/ListaPreguntas.cs` y `Controllers/Listas/ListasController.cs:GuardarPregunta` |
| Tarea/Pregunta | `Categoria` | `string` | Texto devuelto al leer detalle | `Models/Preguntas/ListaPreguntas.cs` y `GetElementoPregunta` |
| Tarea/Pregunta | `idSubcategoria` | `Guid?` | Referencia persistida de subcategoría | `Models/Preguntas/ListaPreguntas.cs` y `Controllers/Listas/ListasController.cs:GuardarPregunta` |
| Tarea/Pregunta | `Subcategoria` | `string` | Texto devuelto al leer detalle | `Models/Preguntas/ListaPreguntas.cs` y `GetElementoPregunta` |

### Contratos y endpoints reales

| Endpoint | Método | Parámetros | Respuesta | ¿Recibe `idCategoria`? | Consumido por |
|---|---|---|---|---|---|
| `/Listas/GetCategoriasComboBox` | `GET` | `searchTerm`, `idEmpresa`, `cadena`, `empresa` | `[{ id, text }]` | No | Legacy y BL26 |
| `/Listas/GetSubcategoriasComboBox` | `GET` | `searchTerm`, `idEmpresa`, `cadena`, `empresa` | `[{ id, text }]` | No | Legacy y BL26 |
| `/Categorias/GetData` | `GET` | `idEmpresa`, `cadena`, `empresa` | tabla DataTables | No | ABC Categorías |
| `/Categorias/GetCategoria` | `GET` | `lla`, `idEmpresa`, `cadena`, `empresa` | detalle de categoría | No | ABC Categorías |
| `/Categorias/GuardaCategoria` | `GET` | `llav`, `nomb`, `nota`, `idEmpresa`, `cadena`, `empresa` | `{ d: "Ok" }` o error | No | ABC Categorías y BL26 |
| `/Subcategorias/GetData` | `GET` | `idEmpresa`, `cadena`, `empresa` | tabla DataTables | No | ABC Subcategorías |
| `/Subcategorias/GetSubcategoria` | `GET` | `lla`, `idEmpresa`, `cadena`, `empresa` | detalle de subcategoría | No | ABC Subcategorías |
| `/Subcategorias/GuardaSubcategoria` | `GET` | `llav`, `nomb`, `nota`, `idEmpresa`, `cadena`, `empresa` | `{ d: "Ok" }` o error | No | ABC Subcategorías y BL26 |
| `/Listas/GetElementoPregunta` | `GET` | `llav`, `idEmpresa`, `cadena`, `empresa` | detalle de pregunta | No | Legacy y BL26 |
| `/Listas/GetListasPreguntas` | `GET` | `llave`, `idEmpresa`, `cadena`, `empresa` | lista de tareas resumidas | No | Legacy y BL26 |
| `/Listas/GuardarPregunta` | `GET` | `llav`, `idLista`, `nombre`, `idCategoria`, `idSubcategoria`, `idEmpresa`, `cadena`, `empresa` | `{ d: "Ok" }` o error | Sí, como campo independiente | Legacy y BL26 |
| `/Listas/GuardarConstructor` | `GET` | `llav`, `idLista`, `pregunta`, `tipo`, `valor`, `obligatorio`, `idPregunta`, `respuestaCorrecta`, `idEmpresa`, `cadena`, `empresa`, `correo`, `notas` | `{ d: "Ok" }` o error | No | Legacy y BL26 |
| `/Listas/GuardarLista` | `POST` | payload JSON de lista | `{ d: "Ok" }` o error | No | Legacy y BL26 |
| `/Listas/EliminarLista` | `GET` | `llav`, `idEmpresa`, `cadena`, `empresa` | `{ d: "Ok" }` o error | No | Legacy y BL26 |
| `/Listas/EliminarPregunta` | `GET` | `llav`, `idEmpresa`, `cadena`, `empresa` | `{ d: "Ok" }` o error | No | Legacy y BL26 |
| `/Listas/DeleteElementoOpciones` | `GET` | `id`, `idEmpresa`, `cadena`, `empresa` | `{ d: "Ok" }` o error | No | Legacy y BL26 |

### Endpoint de relación por categoría

- No se encontró ningún endpoint equivalente a `GetSubcategoriasPorCategoria`.
- `GetSubcategoriasComboBox` únicamente acepta `searchTerm`, `idEmpresa`, `cadena` y `empresa`.
- Los controladores `CategoriasController` y `SubcategoriasController` tampoco exponen un contrato con `idCategoria`.

### Comportamiento Legacy observado

- En código, Legacy carga categorías y subcategorías por separado desde:
  - `/Listas/GetCategoriasComboBox`
  - `/Listas/GetSubcategoriasComboBox`
- Al editar una pregunta, Legacy no recalcula una dependencia; simplemente agrega al combo la opción exacta guardada en la tarea:
  - categoría: `new Option(data.d.categoria, data.d.idCategoria, true, true)`
  - subcategoría: `new Option(data.d.subcategoria, data.d.idSubcategoria, true, true)`
- Eso significa que Legacy:
  - trata ambos catálogos como globales;
  - conserva la pareja guardada en la tarea;
  - no demuestra filtrado real de subcategorías por categoría;
  - puede operar con combinaciones arbitrarias mientras ambas IDs existan.
- Durante la auditoría automatizada en Chrome, la pantalla Legacy levantó un `alert` modal que impidió instrumentar más navegación sin intervenir la UX. Aun así, el flujo quedó suficientemente demostrado por el código y por la ausencia total de un contrato `por categoría`.

### Comportamiento BL26 observado

- BL26 carga catálogos base desde los mismos endpoints globales:
  - `/Listas/GetCategoriasComboBox`
  - `/Listas/GetSubcategoriasComboBox`
- BL26 mantiene estado local adicional:
  - `categoryOptions`
  - `allSubcategories`
  - `categoryIdByName`
  - `subcategoryIdByCategoryAndName`
- Cuando carga una tarea, BL26 toma de `GetElementoPregunta`:
  - `categoria`
  - `idCategoria`
  - `subcategoria`
  - `idSubcategoria`
- Luego registra localmente esa pareja con `upsertCategoryRecord(...)` y `upsertSubcategoryRecord(category, subcategoryId, subcategory)`.
- En la evidencia real de Chrome, BL26 mostró:
  - categoría seleccionada `C_C`
  - subcategoría seleccionada `SC_C`
  - catálogo parcial de categorías: `C_C`, `C_B`, `C_01`, `CODEx Cat 2 1782244185`
  - catálogo parcial de subcategorías: `SC_C`, `F`, `SC_B`, `SC_01`, `CODEx Sub 2 1782244185`
- En otra evidencia, BL26 permitió un estado con:
  - categoría vacía
  - subcategoría `Sin subcategoria`
- Eso confirma que BL26 no está leyendo una dependencia persistida del backend; la está reconstruyendo localmente a partir de datos parciales.

### Origen real de los combos BL26

```text
Carga de categoría
→ /Listas/GetCategoriasComboBox
→ normalización por nombre/id
→ state.categoryRecords + state.categoryIdByName
→ combo de categoría

Carga de subcategoría
→ /Listas/GetSubcategoriasComboBox
→ catálogo global base en state.allSubcategories
→ al abrir tarea: upsertSubcategoryRecord(categoriaActual, idSubcategoria, subcategoria)
→ state.subcategoryIdByCategoryAndName
→ combo de subcategoría
```

- Los combos de BL26 salen de una mezcla de:
  - WS de catálogo global;
  - valores de tareas existentes;
  - búsquedas puntuales por nombre;
  - estado local en memoria.
- Por eso aparecen solo algunas categorías:
  - el WS puede responder incompleto;
  - BL26 no tiene otra fuente maestra;
  - solo agrega categorías extra cuando alguna tarea las trae o cuando una búsqueda puntual las encuentra.
- Por eso aparecen solo algunas subcategorías:
  - el WS base es global y no viene ligado a categoría;
  - BL26 asocia por nombre la subcategoría al contexto de la tarea abierta;
  - al recargar, si la tarea no vuelve a inyectar la pareja o el WS no la devuelve, el catálogo vuelve a quedar parcial.
- Riesgos detectados:
  - duplicados por nombre entre categorías distintas;
  - pérdida de certeza sobre qué `idSubcategoria` corresponde a qué categoría;
  - selección conservada aunque no exista prueba de pertenencia real;
  - guardado de combinaciones inválidas desde el punto de vista de negocio, aunque técnicamente válidas para el backend.

### Dependencia Categoría → Subcategoría

#### Caso comprobado

- Corresponde a `Caso B`.
- No existe evidencia local de una relación persistida `Categoria -> Subcategoria`.
- Los catálogos observables son globales e independientes.
- La combinación solo se materializa dentro de la tarea, porque la tarea guarda `idCategoria` e `idSubcategoria`.
- Aplicar una dependencia artificial y persistente en BL26 cambiaría la regla observable de Legacy si se hiciera sin soporte de API.

#### Respuestas concluyentes

- ¿Existe relación real mediante `idCategoria` en subcategoría?
  - No comprobada.
- ¿Qué endpoint consulta subcategorías por categoría?
  - Ninguno encontrado.
- ¿Qué se guarda en una tarea?
  - `idCategoria`
  - `idSubcategoria`
  - y al leer detalle también se exponen `Categoria` y `Subcategoria` como texto.
- ¿Puede BL26 guardar una subcategoría que no pertenece a la categoría seleccionada?
  - Sí existe ese riesgo, porque el backend solo valida la existencia individual de las IDs, no una relación entre ambas.

### Matriz comparativa

| Escenario | Legacy | BL26 | Igual/Diferente | Riesgo |
|---|---|---|---|---|
| Carga de categorías | Catálogo global | Catálogo global + reconstrucción local | Diferente | Medio |
| Carga de subcategorías | Catálogo global | Catálogo global + asignación local por tarea | Diferente | Alto |
| Filtrado por categoría | No comprobado | Simulado localmente | Diferente | Alto |
| Edición de tarea existente | Reinyecta la pareja exacta guardada | Reinyecta la pareja y la usa para poblar estado local | Similar en intención | Medio |
| Recarga de pantalla | Depende del WS global | Vuelve a depender del WS global y pierde contexto no inyectado | Diferente | Alto |
| Alta de subcategoría | Global, sin `idCategoria` | Global, luego intenta asociarla localmente a la categoría activa | Diferente | Alto |

### Reglas UX auditadas

| Regla | Clasificación | Comentario |
|---|---|---|
| Limpiar subcategoría al cambiar categoría | Parcialmente soportada | posible localmente, pero sin verificar pertenencia persistida |
| Recargar solo subcategorías válidas | No soportada | no existe endpoint por categoría |
| Bloquear guardado con categoría vacía | Soportada por UI | viable localmente |
| Bloquear guardado con subcategoría vacía | Soportada por UI | viable localmente |
| Bloquear combinación inválida real | Requiere decisión PO | no existe verdad de referencia persistida |
| Crear categoría y limpiar subcategoría | Parcialmente soportada | viable localmente, sin resolver relación persistida |
| Crear subcategoría exigiendo categoría | Parcialmente soportada | UI puede exigirla, backend no la recibe |
| Persistir relación categoría/subcategoría al crear subcategoría | No soportada | contrato actual no la acepta |
| Cargar solo subcategorías válidas al editar tarea | No soportada | no existe fuente oficial de pertenencia |

### Alternativas sin implementar

| Alternativa | Viabilidad | Ventaja | Riesgo | Modifica API | Recomendación |
|---|---|---|---|---|---|
| Reutilización estricta del Legacy | Alta | alinea BL26 con la verdad observable actual | conserva limitación global y combinaciones arbitrarias | No | Sí, si PO prioriza compatibilidad |
| Dependencia real existente | Baja | sería la UX correcta si existiera contrato | no fue comprobada en código ni endpoints | No | No recomendar hasta demostrar contrato |
| Solución local controlada | Media | mejora UX mostrando solo pares vistos en tareas o recién creados | puede inventar pertenencia y ocultar opciones válidas globales | No | Solo con aprobación explícita del PO |

### Recomendación de Codex

- La recomendación técnica es no fingir una dependencia persistida que el sistema no demuestra.
- La salida más segura sin cambiar API, backend, WS ni tablas es:
  - replicar el comportamiento real de Legacy;
  - ser honestos en UX respecto a que los catálogos son globales;
  - impedir guardar vacíos;
  - evitar reconstrucciones silenciosas por nombre que aparenten una relación oficial.

### Decisiones pendientes del Product Owner

- Definir si la regla de negocio deseada es realmente:
  - catálogo global independiente, como hoy se observa en Legacy;
  - o relación obligatoria `Categoría -> Subcategoría`.
- Si PO confirma dependencia obligatoria, esa regla no puede certificarse plenamente solo desde frontend con los contratos actuales.
- Si PO confirma que Legacy manda, entonces BL26 debe dejar de simular dependencia persistida y limitarse a reflejar el catálogo global con la pareja guardada en la tarea.

### Confirmaciones de esta auditoría

- No se modificó código funcional.
- API intacta.
- Backend intacto.
- WS intactos.
- Tablas intactas.
- No se agregaron endpoints.
- No se agregaron mapas hardcodeados ni relaciones artificiales.

## Decisión vigente de categorías y subcategorías

### Decisión activa del Product Owner

- En esta etapa, categorías y subcategorías deben operar como catálogos globales independientes.
- La tarea sigue guardando ambos IDs por separado:
  - `idCategoria`
  - `idSubcategoria`
- BL26 no debe fingir una dependencia persistida `Categoría -> Subcategoría`.
- Cualquier dependencia real queda como evolución futura y requiere autorización explícita sobre API, backend y datos.

### Causa corregida

- BL26 estaba mezclando tres fuentes para poblar combos:
  - catálogo global del WS
  - valores reconstruidos desde tareas existentes
  - búsquedas puntuales por nombre
- Esa mezcla creaba catálogos parciales, relaciones aparentes por tarea y desaparición de opciones tras recargar.

### Origen final de los combos

- Categorías:
  - origen oficial: `/Listas/GetCategoriasComboBox`
  - almacenamiento en cliente: catálogo global `state.categoryRecords`
  - valor del `select`: `id` real
  - etiqueta del `select`: `text` real
- Subcategorías:
  - origen oficial: `/Listas/GetSubcategoriasComboBox`
  - almacenamiento en cliente: catálogo global `state.subcategoryRecords`
  - valor del `select`: `id` real
  - etiqueta del `select`: `text` real

### Reconstrucciones eliminadas

- Se eliminó la reconstrucción local de relaciones `categoría -> subcategoría` desde tareas.
- Se eliminó el uso del mapa local por nombre/categoría para poblar el catálogo completo.
- Se eliminó el filtrado artificial de subcategorías por categoría seleccionada.
- Se mantuvo únicamente la resolución por nombre como apoyo puntual para recuperar el ID real después de altas o reintentos del catálogo oficial.

### Manejo de valores históricos

- Cuando una tarea trae `idCategoria` o `idSubcategoria` y ese ID no aparece en el catálogo global cargado:
  - BL26 conserva ese valor como opción temporal solo para esa tarea o modal actual;
  - la opción se identifica como:
    - `[Temporal] Nombre (ID)`
  - no contamina el catálogo global;
  - no se usa para inferir relaciones;
  - no se duplica tras recargar si el WS vuelve a entregarlo.

### Manejo de error del WS

- Si la actualización del catálogo global falla:
  - BL26 conserva el último catálogo real disponible en la sesión;
  - muestra la notificación:
    - `No fue posible actualizar el catálogo completo. Se conservarán temporalmente los datos ya cargados.`
  - listas y tareas siguen cargando;
  - los valores históricos de la tarea seleccionada permanecen visibles mediante opción temporal si hace falta.
- Si no existe catálogo real previo:
  - el combo queda sin opciones globales;
  - solo se muestra la opción temporal del dato persistido, si existe.

### QA realizado

- `node --check /Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Listas/CreadorListaBL26.js`
  - resultado: aprobado
- `dotnet build /Users/denissemendiola/dev/CheckList_Original/checklist/checklist.csproj`
  - resultado: aprobado con `0 errores`
  - warnings observados:
    - warnings históricos `NU1902` y `NU1701`
    - sin evidencia de warnings nuevos atribuibles al ajuste
- QA funcional en Chrome sobre `http://localhost:5200/Listas/CreadorListaBL26`
  - arranque sin selección:
    - aprobado
  - selección de lista:
    - aprobado
  - tarea existente conserva categoría/subcategoría persistidas:
    - aprobado
  - combos ya no dependen de una asociación local por tarea:
    - aprobado por inspección de código y render
  - fallo de actualización de catálogo muestra aviso controlado:
    - aprobado
  - no se recreó una dependencia artificial:
    - aprobado

### Archivos modificados en esta etapa

- `/Users/denissemendiola/dev/CheckList_Original/checklist/wwwroot/js/Listas/CreadorListaBL26.js`
- `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/creador-listas-bl26.md`

### Regresiones

- No se modificaron:
  - API
  - backend
  - WS
  - tablas
  - diseño
- No se tocaron:
  - filtros de listas
  - buscador
  - ordenamiento
  - cierre/reapertura
  - modo solo lectura
  - flujo de listas/tareas fuera del manejo de combos

## Certificación final de combos globales

### Fecha de ejecución

- `2026-07-16`

### Alcance de esta pasada

- Se realizó certificación funcional y técnica sin modificar la funcionalidad del módulo.
- Se reutilizó `http://localhost:5200/Listas/CreadorListaBL26`.
- Se validó arranque real del constructor con usuario aprobado:
  - `denisse@checkapp.com.mx`
- No se tocaron:
  - API
  - backend
  - WS
  - tablas
  - autenticación
  - diseño

### Evidencia técnica observada

- Arranque inicial en BL26:
  - la pantalla abrió sin lista seleccionada;
  - el encabezado mostró `Sin lista seleccionada`;
  - el editor central mostró:
    - `Selecciona una lista o crea una nueva.`;
  - la vista previa quedó vacía.
- Con sesión válida, BL26 mostró:
  - `3 lista(s) visibles`;
  - listas observadas:
    - `ABCD`
    - `Lista 03`
    - `QA Denisse`
- El contexto de sesión embebido en `#bl26-session-context` sí estuvo presente:
  - `idEmpresa = b17aaece-2b78-4e35-b554-9e694eeb15a7`
  - `empresa = 163`
  - `correo = denisse@checkapp.com.mx`
  - `cadenaBase64` presente
- En esa misma ejecución, `sessionStorage` permaneció nulo para:
  - `idEmpresa`
  - `empresa`
  - `correo`
  - `cadenaBase64`
  - por lo que BL26 dependió del fallback embebido en la vista.

### Validación de endpoints oficiales

- Se revisó el consumo declarado en frontend:
  - `/Listas/GetCategoriasComboBox`
  - `/Listas/GetSubcategoriasComboBox`
- Se confirmó por lectura de código que BL26 los consume con:
  - `searchTerm`
  - `idEmpresa`
  - `cadena`
  - `empresa`
  - `correo`
- Se repitió la llamada directa contra ambos endpoints usando los valores reales observados en el fallback de la vista.
- Resultado observado desde shell:
  - `/Listas/GetCategoriasComboBox`
    - `HTTP 200`
    - `Content-Length: 0`
  - `/Listas/GetSubcategoriasComboBox`
    - `HTTP 200`
    - `Content-Length: 0`
- Con esta evidencia, en esta pasada no fue posible demostrar por canal externo:
  - cantidad real del catálogo global;
  - IDs reales devueltos por cada opción;
  - ausencia de duplicados del WS;
  - persistencia de altas de categoría/subcategoría.

### Riesgo de sesión durante QA en Chrome

- Durante la certificación en Chrome apareció repetidamente el diálogo:
  - `Se inició sesión en otro dispositivo con su usuario`
- Ese evento forzó regreso a login durante la prueba y bloqueó la interacción continua con:
  - selección de lista;
  - selección de tarea;
  - apertura sostenida de combos;
  - recarga completa con la misma sesión.
- El riesgo es de entorno/autenticación y no fue corregido en esta etapa porque la instrucción explícita prohíbe modificar autenticación.

### Resultado por prueba

| Prueba | Resultado | Evidencia real | F5 | Riesgo |
|---|---|---|---|---|
| Arranque sin selección | Aprobado | BL26 mostró `Sin lista seleccionada` y `Selecciona una lista o crea una nueva.` | No aplica | Bajo |
| Catálogo de categorías | Pendiente de certificar | Endpoint oficial respondió `HTTP 200` con cuerpo vacío en verificación directa; no se pudo extraer catálogo real estable en Chrome | No concluyente | Alto |
| Catálogo de subcategorías | Pendiente de certificar | Endpoint oficial respondió `HTTP 200` con cuerpo vacío en verificación directa; no se pudo extraer catálogo real estable en Chrome | No concluyente | Alto |
| Tarea con valores globales | Pendiente de certificar | La sesión en Chrome se invalidó antes de sostener selección de tarea y lectura de combos | No concluyente | Alto |
| Tarea con valores temporales | Pendiente de certificar | No se logró sostener una tarea histórica activa durante el conflicto de sesión | No concluyente | Alto |
| Aislamiento entre tareas | Pendiente de certificar | La invalidación de sesión impidió completar la secuencia A → B → C | No concluyente | Alto |
| Alta de categoría | Pendiente de certificar | Sin catálogo estable del endpoint, no hubo base confiable para confirmar alta real y recarga | No concluyente | Alto |
| Alta de subcategoría | Pendiente de certificar | Sin catálogo estable del endpoint, no hubo base confiable para confirmar alta real y recarga | No concluyente | Alto |
| Fallo del WS | Pendiente de certificar | No se simuló adicionalmente porque el riesgo principal ya fue respuesta vacía del endpoint oficial más conflicto de sesión | No concluyente | Medio |
| Duplicados | Pendiente de certificar | Sin payload real estable del catálogo no es posible certificar ausencia de duplicados del WS | No concluyente | Alto |
| Regresión del arranque corregido | Aprobado | El estado inicial permaneció sin selección automática y sin editor cargado | No aplica | Bajo |

### Archivos modificados en esta pasada

- `/Users/denissemendiola/dev/CheckList_Original/checklist/docs/agentes/creador-listas-bl26.md`

### Resultado final de esta certificación

- No se realizaron cambios funcionales.
- No se modificó `CreadorListaBL26.js`.
- No se certificó todavía el bloque completo de combos globales.
- Sí quedó confirmada la corrección del arranque sin selección automática.
- La certificación exhaustiva de categorías y subcategorías quedó condicionada por dos bloqueadores observados:
  - respuesta vacía del endpoint oficial en verificación directa;
  - invalidación de sesión en Chrome durante el flujo de prueba.

### 2026-07-17 — Diagnóstico y corrección controlada de categorías y subcategorías

- Alcance aplicado:
  - sin cambios de esquema
  - sin cambios de datos maestros
  - sin cambios en `CreadorListaBL26.js`
  - sin cambios en contratos HTTP
- Evidencia raíz confirmada:
  - `GET http://localhost:5127/ObtenerCategorias` devolvía `500 Internal Server Error`
  - `GET http://localhost:5127/ObtenerSubcategorias` devolvía `500 Internal Server Error`
  - mensaje exacto: `Data is Null. This method or property cannot be called on Null values.`
  - el proxy frontend devolvía `200` vacío porque dependía de esos WS fallidos
- Trazabilidad confirmada:
  - `CategoriasABC`
    - frontend: `/Categorias/GetData`
    - API: `/ObtenerCategorias`
  - `SubcategoriasABC`
    - frontend: `/Subcategorias/GetData`
    - API: `/ObtenerSubcategorias`
  - `CreadorListaBL26`
    - frontend: `/Listas/GetCategoriasComboBox`
    - frontend: `/Listas/GetSubcategoriasComboBox`
    - ambos consumen los mismos WS globales
- Hallazgo en base real:
  - empresa auditada: `b17aaece-2b78-4e35-b554-9e694eeb15a7`
  - `ListasPreguntasCategorias`
    - total activas consultadas: `30`
    - filas con `notas = NULL`: `10`
  - `ListasPreguntasSubCategorias`
    - total activas consultadas: `28`
    - filas con `notas = NULL`: `10`
  - no se detectaron nulos en:
    - `Nombre`
    - `fecha`
    - `borrado`
- Causa real corregida:
  - ambos controladores de API leían `Notas` con `reader.GetString(...)`
  - cuando `Notas` era `NULL`, el WS abortaba antes de serializar la colección completa
  - se sustituyó esa lectura por una lectura tolerante a `NULL`, devolviendo `string.Empty`
- Archivos modificados:
  - `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/Controllers/Categorias/CategoriasController.cs`
  - `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/Controllers/Subcategorias/SubcategoriasController.cs`
- Reinicio controlado de API:
  - proceso sustituido: PID `33739`
  - comando sustituido: `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/bin/Debug/net8.0/checklistWs --urls=http://localhost:5127`
  - proceso final activo para QA: PID `39676`
- Validación post-corrección:
  - API:
    - `/ObtenerCategorias` devolvió `28` registros
    - `/ObtenerSubcategorias` devolvió `26` registros
  - frontend proxy:
    - `/Categorias/GetData` devolvió `iTotalRecords = 28`
    - `/Subcategorias/GetData` devolvió `iTotalRecords = 26`
    - `/Listas/GetCategoriasComboBox` devolvió `28` opciones
    - `/Listas/GetSubcategoriasComboBox` devolvió `26` opciones
  - Chrome autenticado:
    - `CategoriasABC` dejó de mostrar `Ningún dato disponible en esta tabla`
    - `SubcategoriasABC` dejó de mostrar `Ningún dato disponible en esta tabla`
    - `CreadorListaBL26` dejó de mostrar el mensaje `No fue posible actualizar el catálogo completo. Se conservarán temporalmente los datos ya cargados.`
- Riesgo residual:
  - durante QA en Chrome siguió apareciendo el aviso `Se inició sesión en otro dispositivo con su usuario`
  - ese evento puede terminar redirigiendo a login y afecta la continuidad visual del flujo
  - no se modificó autenticación en esta tarea

### 2026-07-17 — Cierre de QA de interfaz y compatibilidad

- Alcance:
  - solo validación final
  - sin cambios funcionales
  - sin guardados nuevos
  - sin cambios de datos
- Procesos confirmados al cierre:
  - frontend disponible en `http://localhost:5200`
  - API disponible en `http://localhost:5127`
- QA visual en Chrome sobre `CategoriasABC`:
  - ruta: `http://localhost:5200/Categorias/CategoriasABC`
  - tabla cargada sin mensaje `Data is Null`
  - tabla cargada sin mensajes técnicos de backend
  - conteo visible: `Mostrando registros del 1 al 10 de un total de 28 registros`
  - resultado: `28` categorías visibles, sin duplicados observados
- QA visual en Chrome sobre `SubcategoriasABC`:
  - ruta: `http://localhost:5200/Subcategorias/SubcategoriasABC`
  - tabla cargada sin mensaje `Data is Null`
  - tabla cargada sin mensajes técnicos de backend
  - conteo visible: `Mostrando registros del 1 al 10 de un total de 26 registros`
  - resultado: `26` subcategorías visibles, sin duplicados observados
- Validación de duplicados por contrato real:
  - `/Listas/GetCategoriasComboBox`
    - `28` opciones
    - `28` IDs únicos
    - `0` textos duplicados
  - `/Listas/GetSubcategoriasComboBox`
    - `26` opciones
    - `26` IDs únicos
    - `0` textos duplicados
- QA visual en Chrome sobre `CreadorListaBL26`:
  - ruta: `http://localhost:5200/Listas/CreadorListaBL26`
  - no apareció el mensaje `No fue posible actualizar el catálogo completo`
  - panel izquierdo cargó listas reales:
    - `ABCD`
    - `Lista 03`
  - filtros cargados:
    - `En edicion: 2`
    - `Cerradas: 19`
    - `Todas: 21`
  - los catálogos globales siguieron disponibles por contrato:
    - categorías: `28`
    - subcategorías: `26`
  - independencia confirmada:
    - `GetSubcategoriasComboBox` no acepta `idCategoria`
    - la vista BL26 sigue cargando ambos catálogos como listas globales separadas
    - seleccionar categoría no debe filtrar ni ocultar subcategorías
- Trazabilidad de tareas sin guardar cambios:
  - lista auditada: `ABCD`
  - tareas observadas por contrato:
    - `C`
    - `D`
    - `QA UX 1784140993345`
  - detalle real leído por endpoint:
    - la tarea `C` conservó `idCategoria`, `categoria`, `idSubcategoria` y `subcategoria`
    - la tarea `D` conservó `idCategoria`, `categoria`, `idSubcategoria` y `subcategoria`
    - la tarea `D` devolvió `explicacion = ""` y no rompió los endpoints del creador
  - conclusión:
    - los IDs siguen presentes en los detalles de tarea
    - no se detectó pérdida de `idCategoria` o `idSubcategoria` en lectura
- Regresión Legacy observada en la misma sesión:
  - ruta: `http://localhost:5200/Listas/CreadorLista`
  - la pantalla siguió abriendo
  - apareció el texto `El id de la empresa no puede ser nulo o vacío.`
  - este hallazgo quedó fuera del alcance de la corrección de catálogos y no se modificó en esta tarea
- Riesgo transversal de sesión:
  - en `CreadorListaBL26`, `CreadorLista` y `RecoleccionesBL26` apareció el modal:
    - `Se inició sesión en otro dispositivo con su usuario`
  - se documenta como deuda separada de autenticación/sesión
  - no se cambió su comportamiento en esta tarea
