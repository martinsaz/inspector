# Certificación Funcional y Visual de Activos

Fecha de ejecución: 2026-07-25

## Alcance de esta ejecución

- corrección y validación de la exportación Excel del Patrón CheckApp en `Activos`
- sin cambios al contexto tenant ya corregido previamente
- sin cambios a otras pantallas

## Causa del fallo

- `Activos` referenciaba `xlsx.full.min.js` únicamente por CDN en la vista
- en la ejecución real validada, el script quedaba referenciado pero `window.XLSX` terminaba `undefined`
- `CheckAppUI.exportGrid()` dependía directamente de `window.XLSX`, por lo que el botón no generaba una descarga utilizable

## Solución aplicada

- se incorporó `SheetJS xlsx 0.17.0` como recurso local del proyecto en:
  - `checklist/wwwroot/js/vendor/xlsx.full.min.js`
- `Activos` ahora inicializa `XLSX` en la vista y carga ese recurso local antes de `checkapp-ui.js`
- `CheckAppUI.exportGrid()` fue endurecido para:
  - exportar todas las filas filtradas cargadas en cliente, no solo la página visible
  - construir encabezados visibles aun cuando no existan registros
  - excluir columnas no exportables
  - limpiar valores para evitar HTML en celdas
  - bloquear doble descarga por clic repetido inmediato
  - mostrar mensaje amigable si la dependencia falta o si la exportación falla

## Dependencia utilizada

- librería: `SheetJS xlsx`
- versión: `0.17.0`
- procedencia del archivo local: distribución oficial `dist/xlsx.full.min.js`

## Comportamiento validado

- nombre de archivo en Activos:
  - `Activos_YYYYMMDD_HHmm.xlsx`
- la exportación toma:
  - columnas visibles
  - títulos visibles en español
  - filas filtradas disponibles en el grid completo
- la columna `Acciones` no se exporta
- `Estatus` exporta texto legible
- `Actualización` exporta fecha legible
- con cero registros:
  - se genera archivo válido con encabezados y sin filas de datos

## Pruebas reales ejecutadas

- validación de carga de librería local en navegador
- exportación sin filtros
- exportación con filtros
- exportación con cero resultados
- inspección real del archivo `.xlsx` descargado
- verificación de encabezados, columnas y contenido exportado
- verificación de una sola descarga por clic
- revisión de errores JavaScript
- revisión de errores HTTP
- regresión breve del módulo:
  - carga
  - búsqueda
  - filtros
  - paginación
  - selector de columnas
  - alta
  - edición
  - baja lógica
  - `ActivosTipos`
  - contexto de empresa

## Resultado de la inspección del archivo

- archivo descargado y válido
- encabezados en español
- sin columna de acciones
- sin HTML dentro de celdas
- las filas exportadas respetaron el filtro aplicado
- la exportación incluyó todas las filas filtradas disponibles, no solo la página visible
- archivos inspeccionados en la validación real del `2026-07-25`:
  - `Activos_20260724_1824.xlsx`
  - `Activos_20260724_1824 (1).xlsx`
  - `Activos_20260724_1825 (1).xlsx`

## Limitaciones

- no se modificaron mecanismos legacy de exportación de otras pantallas
- la corrección quedó contenida al Patrón CheckApp en `Activos`

---

## Ejecución adicional: restauración del menú original e integración correcta de Activos

Fecha de ejecución: 2026-07-25

### Defecto confirmado por QA

- la integración previa de `Activos` alteró el árbol del menú
- `Activos` quedó implementado como acordeón raíz
- se generó un hijo interno también llamado `Activos`
- la estructura ya no correspondía a una opción principal simple

### Causa raíz corregida

- en `HomeController.BuildMenu`, el caso `03500000` se construía como:
  - nodo raíz `menu-item menu-accordion`
  - contenedor `menu-sub menu-sub-accordion`
  - hijo `03501000` con texto `Activos`
- esa construcción introducía un grupo artificial y duplicaba visualmente la opción
- la corrección eliminó el acordeón artificial y dejó `Activos` como una única entrada principal con enlace directo a `/Activos/Index`
- el estado activo de `Activos` quedó resuelto desde el servidor al renderizar el menú

### Estructura restaurada en esta ejecución

- `Activos` ya no se renderiza como grupo desplegable
- ya no existe un hijo interno `Activos`
- `Activos` queda como opción principal simple con `href="/Activos/Index"`
- evidencia técnica comparada:
  - `5200` antes del ajuste devolvía `Activos` como acordeón con hijo duplicado
  - `5201` después del ajuste devolvió `Activos` como `menu-item` simple

### Permisos conservados

- no se modificó `LoginController`
- no se modificó Firebase
- no se modificó autenticación
- no se modificaron roles ni permisos de otros módulos
- `Activos` siguió dependiendo únicamente de los permisos `035` ya existentes para el contexto QA

### Pruebas reales ejecutadas

- `dotnet build` de `checklist`
- levantamiento temporal de frontend corregido en `http://localhost:5201`
- recuperación del contexto tenant real desde una vista del sistema con la sesión QA autenticada
- validación visual en navegador real sobre `Activos/Index`
- verificación de estructura del menú renderizado en DOM
- verificación de acceso real a:
  - `/Activos/Index`
  - `/ReporteListado/Index`
  - `/ContestarLista/RecoleccionesBL26`
- verificación de logs del navegador

### Resultado observado en navegador

- `Activos` abrió correctamente en `5201`
- `Activos` quedó activo en el menú
- no existió un segundo `Activos` hijo
- no se detectaron errores JavaScript en logs del navegador
- no se detectaron errores HTTP en las rutas probadas durante esta ejecución

### Hallazgo relevante de esta validación

- con los parámetros reales de QA usados en esta ejecución, `BuildMenu` devolvió por servidor:
  - `Reportes`
  - `Activos`
  - `Recolecciones`
- en esta corrida no fue posible evidenciar visualmente `Listas` ni `Ajustes` porque no fueron devueltos por `BuildMenu` ni en `5200` ni en `5201` con el mismo contexto QA utilizado para la prueba
- por esa razón, esta ejecución deja corregida la duplicación estructural de `Activos`, pero no permite declarar restauración completa del menú original

### Evidencia visual

- captura del menú validado:
  - `.qa-evidence/activos-menu-restaurado-2026-07-25.png`

### Procesos y puertos

- proceso temporal iniciado por Codex:
  - frontend local en `5201`
- al cierre de la ejecución:
  - `5201` debe liberarse
  - `5200` y `5127` corresponden a procesos previos ya existentes del entorno y no fueron modificados por esta ejecución

---

## Ejecución adicional: corrección controlada del acceso SuperAdmin a Activos

Fecha de ejecución: 2026-07-25

### Alcance de esta ejecución

- revertir únicamente el fallback de autorización no aprobado agregado en la ejecución inmediata anterior
- conservar intactas las correcciones aprobadas de contexto tenant y del CRUD de `Activos`
- permitir acceso a `Activos` solo bajo esta regla:
  - `SuperAdmin` real por identidad server-side
  - o permiso propio `035` si existe en el futuro

### Reversión aplicada

- se eliminó el fallback que autorizaba `Activos` usando visibilidad legacy de otro módulo
- se eliminó la resolución adicional de `idRol` introducida en la ejecución anterior
- `HasPermAsync()` volvió a depender únicamente de `Utilerias.IdRol` para los permisos propios `035`

### Patrón real auditado de SuperAdmin

- `LoginController` construye la sesión autenticada con:
  - `ClaimTypes.Email`
  - `ClaimTypes.SerialNumber` para `idEmpresa`
  - `ClaimTypes.Uri` para `cadena`
  - `ClaimTypes.Role` para `idRol`
- la API local expone un mecanismo propio y vigente para identificar al `SuperAdmin` real por empresa en:
  - `api/Usuario/ObtenerSuperAdminId`
- ese endpoint regresa el `id` del usuario administrativo base de la empresa
- el patrón seguro reutilizado en esta ejecución fue:
  - resolver `idEmpresa`, `cadena`, `empresa` y `correo` desde sesión/claims
  - obtener por servidor el `id` del `SuperAdmin` real de la empresa
  - obtener por servidor el usuario actual por correo dentro de esa misma empresa
  - comparar ambos `id` del lado servidor

### Implementación mínima aplicada

- `ActivosController` ahora autoriza el módulo con:
  - `SuperAdmin` real por identidad de usuario dentro de la empresa
  - o permisos propios `035`
- no se creó ningún permiso `035`
- no se asignó ningún permiso
- no se reutilizó ningún permiso de `Listas`, `Recolecciones`, `Reportes`, `Ajustes`, `Operadores` ni otro módulo
- no se modificó:
  - `LoginController`
  - `Firebase`
  - autenticación global
  - sesión global
  - menú
  - vistas
  - JavaScript
  - CSS

### Validación técnica ejecutada

- `dotnet build /Users/denissemendiola/dev/CheckList_Original/checklist/checklist.csproj`
- resultado:
  - `0` errores
  - `918` warnings preexistentes
- levantamiento temporal del frontend corregido en `http://localhost:5201`
- validación en navegador real de la instancia temporal

### Resultado real observado

- la instancia temporal abrió correctamente en `5201`
- el navegador disponible para Codex no contaba con una sesión autenticada reutilizable
- al abrir `http://localhost:5201/` la aplicación mostró la pantalla de login
- al navegar sin autenticar a `http://localhost:5201/Activos/Index`, la ruta no abrió el CRUD y terminó en:
  - `http://localhost:5201/Home`

### Limitación real de QA

- no fue posible completar la validación obligatoria con una sesión autenticada que mostrara rol `SuperAdmin`
- tampoco fue posible certificar el caso negativo con un usuario autenticado no `SuperAdmin` sin permiso `035`
- motivo real:
  - no había una sesión autenticada reutilizable en las superficies de navegador disponibles para Codex
  - esta ejecución no recibió credenciales operativas ni un contexto autenticado seguro ya abierto
  - no se inspeccionaron cookies, almacenes sensibles ni secretos del navegador
  - no se debilitó la autorización para fabricar la prueba

### Regresión confirmada

- no se modificó:
  - menú
  - `Listas`
  - `Recolecciones`
  - `Reportes`
  - `Ajustes`
  - `Roles y Permisos`
  - `Login`
  - `Operadores`
  - `Firebase`

### Procesos y puertos

- proceso temporal iniciado por Codex:
  - frontend local en `5201`
- al cierre:
  - `5201` debe quedar liberado
  - `5200` y `5127` permanecen como procesos previos del entorno y no fueron reemplazados por esta ejecución
