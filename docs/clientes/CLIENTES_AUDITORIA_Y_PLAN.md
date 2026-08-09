# AUDITORÍA Y PLANEACIÓN DEL MÓDULO CLIENTES

## 1. Resumen ejecutivo

Se auditó el vertical `Clientes` en modo de solo planeación, sin modificar MVC, API, SQL, menú ni el proyecto Rarámuri.  
La referencia funcional real en Rarámuri vive en la ruta `/clientes` y su núcleo está en:

- `Raramuri.blzr/Components/Pages/Clientes/Clientes360.razor`
- `Raramuri.blzr/Components/Pages/Clientes/ClienteEdicionAvanzada.razor`
- `Raramuri.blzr/Services/Clientes/IClientesService.cs`
- `Raramuri.blzr/Models/Clientes/ClientesModels.cs`

La conclusión es que **sí conviene migrar la experiencia base de búsqueda + listado + ficha + notas**, pero **no conviene copiar literalmente** la pantalla de Rarámuri porque mezcla varias capacidades fuera de alcance: clasificación comercial, WhatsApp, correo, QR/NFC, compras, edición avanzada, monedero, cliente fiel, club familiar y la pestaña `Más`.

Para CheckList, la recomendación es construir un módulo nuevo de `Clientes` sobre el patrón visual actual de CheckApp y sobre el patrón técnico más reciente de proxy MVC seguro, tomando de Rarámuri solo la estructura operativa:

- panel de búsqueda compacto;
- listado de resultados;
- apertura de ficha en la misma pantalla;
- sección `Datos`;
- sección `Notas`.

## 2. Alcance aprobado

Componentes dentro del alcance y clasificados como `IMPLEMENTAR` o `ADAPTAR`:

- `IMPLEMENTAR` búsqueda rápida de clientes.
- `IMPLEMENTAR` alta de cliente.
- `IMPLEMENTAR` consulta de clientes.
- `IMPLEMENTAR` apertura de ficha.
- `IMPLEMENTAR` consulta y edición de datos básicos.
- `IMPLEMENTAR` notas.
- `IMPLEMENTAR` tareas derivadas de nota con fecha, hora y check de completada.
- `ADAPTAR` encabezado y ritmo visual de Rarámuri al patrón CheckApp.
- `ADAPTAR` resultado/listado a DynamicGrid o variante CheckApp coherente.
- `ADAPTAR` ficha del cliente a layout CheckApp con tabs o segmentos internos mínimos.

## 3. Exclusiones del Product Owner

Elementos expresamente fuera de alcance y clasificados como `EXCLUIR`:

- `EXCLUIR` pestaña `Compras`.
- `EXCLUIR` pestaña `Más`.
- `EXCLUIR` QR / NFC.
- `EXCLUIR` WhatsApp.
- `EXCLUIR` envío de correo.
- `EXCLUIR` monedero.
- `EXCLUIR` cliente fiel.
- `EXCLUIR` club familiar.
- `EXCLUIR` clasificación comercial de Rarámuri.
- `EXCLUIR` datos avanzados.
- `EXCLUIR` dashboards comerciales.
- `EXCLUIR` reportes de venta.
- `EXCLUIR` fidelización.
- `EXCLUIR` RFC, direcciones, crédito, fecha de nacimiento y demás campos avanzados.
- `EXCLUIR` menú `Reporte` dentro de este vertical.
- `EXCLUIR` roles y permisos.

## 4. Auditoría de Rarámuri

Ruta auditada:

- `/clientes`

Hallazgos principales:

- La pantalla principal real es `Clientes360.razor`.
- El flujo inicia con header simple `Clientes` y botón `Reportes`.
- Existe panel operativo con acciones `Nuevo cliente`, `Buscar cliente` y `Refrescar`.
- Existe búsqueda por nombre, teléfono o correo.
- Existe filtro de clasificación.
- Existen KPIs posteriores a la búsqueda.
- Existen tarjetas de resultado con nombre, teléfono, correo y botón `Abrir ficha`.
- La ficha se abre en el mismo contexto y puede colapsar el panel de búsqueda.
- La ficha contiene tabs `Datos`, `Notas`, `Compras` y `Más`.
- `Datos` muestra nombre, teléfono, correo y fecha de nacimiento.
- `Notas` funciona como timeline simple y permite crear notas.
- Existen acciones visibles de `WhatsApp`, `Correo`, `QR / NFC`, `Datos avanzados` y `Cerrar ficha`.
- Existen estados `loading`, `empty`, `sin resultados`, `sin permiso` y `error`.
- La edición avanzada vive aparte en `/clientes/edicion-avanzada` y está fuera del alcance.

## 5. Flujo actual de `/clientes`

Flujo real observado en Rarámuri:

1. El usuario entra a `/clientes`.
2. Ve encabezado, panel operativo y filtros.
3. Captura texto de búsqueda.
4. Opcionalmente aplica clasificación.
5. Ejecuta búsqueda.
6. Aparecen KPIs y resultados.
7. Abre ficha de un cliente.
8. El panel de búsqueda puede colapsarse.
9. Edita `Datos` o consulta `Notas`.
10. Puede navegar a pestañas fuera de alcance como `Compras` o `Más`.

## 6. Componentes visuales reutilizables

De Rarámuri hacia la propuesta de UX:

- `ADAPTAR` header interno sobrio con título único.
- `ADAPTAR` panel operativo compacto con acciones claras.
- `ADAPTAR` filtros densos y de lectura rápida.
- `ADAPTAR` estado vacío con mensaje de orientación.
- `ADAPTAR` tarjetas/listado de resultados con CTA único.
- `ADAPTAR` ficha en el mismo contexto.
- `ADAPTAR` tabs internas de ficha reducidas a `Datos` y `Notas`.
- `ADAPTAR` timeline visual para notas.

De CheckList ya disponibles:

- `REUTILIZAR` `wwwroot/css/checkapp-theme.css`
- `REUTILIZAR` `wwwroot/js/checkapp-ui.js`
- `REUTILIZAR` `Views/CheckApp/Pattern.cshtml` como contrato visual base
- `REUTILIZAR` `Views/Activos/Index.cshtml` para resumen + accordion + grid
- `REUTILIZAR` `Views/Activos/Proveedores.cshtml` para catálogo sencillo con modal
- `REUTILIZAR` `Views/ProductosServicios/_ProductosServiciosCatalogoPage.cshtml` para patrón de grid y modal

## 7. Componentes funcionales reutilizables

- `REUTILIZAR` patrón de bootstrap de sesión a `sessionStorage` usado en:
  - `Views/Activos/Index.cshtml`
  - `Views/ProductosServicios/_ProductosServiciosSessionContext.cshtml`
- `REUTILIZAR` patrón MVC proxy seguro de `Controllers/ProductosServicios/ProductosServiciosController.cs`
- `REUTILIZAR` patrón CheckApp de:
  - accordion de filtros;
  - toolbar de grid;
  - footer externo de paginación;
  - modal de alta/edición;
  - estados loading/empty/error.
- `REUTILIZAR` multitenant por claims/sesión ya resuelto en CheckList.

## 8. Componentes descartados

Descartes explícitos de la referencia Rarámuri:

- `EXCLUIR` botón `Reportes`.
- `EXCLUIR` filtro `Clasificación`.
- `EXCLUIR` KPIs de monedero, cliente fiel y club.
- `EXCLUIR` chips de clasificación comercial.
- `EXCLUIR` `WhatsApp`.
- `EXCLUIR` `Correo`.
- `EXCLUIR` `QR / NFC`.
- `EXCLUIR` `Datos avanzados`.
- `EXCLUIR` pestaña `Compras`.
- `EXCLUIR` pestaña `Más`.
- `EXCLUIR` fecha de nacimiento.
- `EXCLUIR` domicilio y datos fiscales.
- `EXCLUIR` crédito y comercial.

## 9. Comparativo Rarámuri vs CheckList

| Área | Rarámuri actual | CheckList propuesto |
|---|---|---|
| Ruta | `/clientes` | `Clientes/Index` o ruta MVC equivalente del ABC |
| UI base | MudBlazor, tarjeta/ficha integrada | MVC Razor + CheckApp |
| Búsqueda | nombre, teléfono, correo + clasificación | nombre, teléfono, correo, empresa |
| KPIs | total, teléfono, correo, monedero, fiel, club | total, particulares, empresas, con teléfono, con correo |
| Ficha | tabs `Datos`, `Notas`, `Compras`, `Más` | tabs `Datos`, `Notas` |
| Datos | mezcla básicos y extra | solo básicos autorizados |
| Notas | timeline simple | timeline + nota/tarea |
| Acciones de contacto | WhatsApp, correo | no aplica |
| Datos avanzados | sí | no |
| Patrón técnico | servicio Blazor a API externa | MVC proxy seguro a API propia |

## 10. UX propuesta

Experiencia recomendada para CheckList:

- hero sobrio con título `Clientes` y botón `Nuevo cliente`;
- accordion o panel de filtros compacto;
- búsqueda general por `nombre`, `teléfono`, `correo` y `empresa`;
- chips o tarjetas KPI mínimas solo con métricas útiles al alcance;
- grid/listado con CTA único `Abrir ficha`;
- ficha en la misma vista, debajo del listado o en panel contextual;
- tabs internas:
  - `Datos`
  - `Notas`
- modal para alta rápida;
- edición directa en ficha;
- timeline de notas con diferenciación visual entre `Nota` y `Tarea`;
- estados de:
  - loading;
  - empty inicial;
  - sin resultados;
  - error.

## 11. Wireframe textual

```text
CLIENTES
[Nuevo cliente]

[Búsqueda general________________] [Tipo: Todos|Particular|Empresa]
[Buscar] [Limpiar]

[Total] [Particulares] [Empresas] [Con teléfono] [Con correo]

LISTADO DE CLIENTES
Cliente | Teléfono | Correo | Tipo | Empresa | Acción
Daniel X | 477... | daniel... | Particular | - | [Abrir ficha]

FICHA DE CLIENTE
Nombre
Tipo
Teléfono
Correo
Empresa (si aplica)

[DATOS] [NOTAS]

DATOS
Nombre
Teléfono
Correo
Tipo
Empresa (solo cuando Tipo = Empresa)
[Guardar cliente]

NOTAS
[Nueva nota]
[Tipo: Nota | Tarea]
Si es Tarea:
[Fecha] [Hora]
[Texto________________]
[Guardar]

Timeline:
- Nota · fecha · texto
- ☐ Tarea · fecha hora · texto
- ☑ Tarea completada · fecha hora · texto
```

## 12. Tipos de cliente

Tipos aprobados:

- `Particular`
- `Empresa`

Recomendación de implementación:

- usar un catálogo cerrado en frontend y backend;
- persistir como valor controlado, no texto libre;
- exponer selector simple:
  - radio buttons;
  - segmented control;
  - select compacto en mobile.

## 13. Datos Particular

Campos finales recomendados:

- `Nombre`
- `Teléfono`
- `Correo`

Reglas:

- `Nombre` obligatorio.
- `Teléfono` opcional.
- `Correo` opcional.
- `Empresa` no visible.

## 14. Datos Empresa

Campos finales recomendados:

- `Nombre`
- `Teléfono`
- `Correo`
- `Empresa`

Reglas:

- `Nombre` obligatorio.
- `Teléfono` opcional.
- `Correo` opcional.
- `Empresa` obligatoria cuando el tipo sea `Empresa`.

## 15. Modelo de Notas

Modelo funcional mínimo:

- texto libre;
- fecha de creación;
- usuario creador si el patrón actual ya lo facilita en sesión;
- orden cronológico descendente;
- vinculación a cliente;
- baja lógica opcional a nivel de backend aunque no visible en esta fase.

Presentación:

- timeline o lista vertical;
- etiqueta visual `Nota`;
- fecha visible;
- texto principal.

## 16. Modelo de Tareas

Modelo funcional mínimo:

- comparte la misma base de nota;
- agrega `EsTarea`;
- fecha de tarea;
- hora de tarea;
- `Completada`;
- `FechaCompletada`.

Presentación:

- etiqueta visual `Tarea`;
- checkbox visible;
- fecha y hora visibles solo si `EsTarea = true`;
- si está completada, mostrar estado completado y marca visual.

## 17. Flujo alta

Flujo recomendado:

1. Usuario presiona `Nuevo cliente`.
2. Se abre modal CheckApp.
3. Selecciona `Particular` o `Empresa`.
4. El formulario muestra solo campos válidos para ese tipo.
5. Guarda.
6. El sistema responde con confirmación.
7. Se refresca el listado manteniendo la búsqueda actual o mostrando el nuevo cliente.
8. Opcionalmente se abre la ficha recién creada.

## 18. Flujo búsqueda

Flujo recomendado:

1. Usuario entra al módulo.
2. Ve estado vacío inicial.
3. Escribe criterio.
4. Opcionalmente filtra por tipo.
5. Presiona `Buscar`.
6. Ve loading.
7. Si hay resultados, ve KPIs y grid.
8. Si no hay resultados, ve empty state.
9. Puede limpiar y volver a buscar.

## 19. Flujo ficha

Flujo recomendado:

1. Usuario abre un cliente del listado.
2. La ficha aparece en contexto sin navegar a otra pantalla.
3. Muestra encabezado resumido del cliente.
4. Muestra tabs `Datos` y `Notas`.
5. `Datos` permite edición.
6. `Notas` permite consulta y alta de nota/tarea.

## 20. Flujo edición

Flujo recomendado:

1. Usuario abre ficha.
2. Edita datos autorizados.
3. Guarda cambios.
4. El sistema confirma guardado.
5. El encabezado y el listado reflejan el cambio.

No se recomienda separar alta y edición en dos pantallas distintas para este vertical.

## 21. Modelo de datos propuesto

Tablas mínimas recomendadas:

### `Clientes`

Campos propuestos:

- `id uniqueidentifier`
- `idEmpresa uniqueidentifier`
- `TipoCliente tinyint` o `int`
- `Nombre nvarchar(200)`
- `Telefono nvarchar(30) null`
- `Correo nvarchar(200) null`
- `Empresa nvarchar(200) null`
- `Activo bit`
- `FechaAlta datetime`
- `FechaModificacion datetime null`
- `FechaBaja datetime null`

### `ClientesNotas`

Campos propuestos:

- `id uniqueidentifier`
- `idEmpresa uniqueidentifier`
- `idCliente uniqueidentifier`
- `Tipo tinyint` o `int`
- `Texto nvarchar(max)`
- `EsTarea bit`
- `FechaTarea date null`
- `HoraTarea time null`
- `Completada bit`
- `FechaCompletada datetime null`
- `Activo bit`
- `FechaAlta datetime`
- `FechaModificacion datetime null`

Dictamen de reutilización:

- el `clientes` detectado en `checklistWs` aparece en joins legacy ligados a `idAlumno` y `CatalogoClientesApellidos`;
- ese uso pertenece a un dominio previo de listas/programación y **no demuestra compatibilidad con el nuevo vertical CRM**;
- por tanto se recomienda **no reutilizarlo como base del módulo Clientes**.

## 22. API propuesta

Mínimo necesario:

- `ObtenerClientes`
- `ObtenerCliente`
- `GuardarCliente`
- `ActualizarCliente`
- `BajaCliente`
- `ObtenerNotasCliente`
- `GuardarNotaCliente`
- `CompletarTareaCliente`

Convención recomendada:

- seguir el patrón moderno de controllers tipo proxy en MVC;
- resolver `idEmpresa` desde sesión/claims del servidor;
- evitar depender de `idEmpresa` libre desde frontend.

## 23. Reglas de negocio mínimas

Recomendaciones cerradas:

1. `Nombre` obligatorio.
2. `Teléfono` opcional.
3. `Correo` opcional.
4. `Empresa` obligatoria solo cuando `Tipo = Empresa`.
5. Validación básica de correo solo si el usuario captura valor.
6. Duplicados:
   - advertir coincidencias exactas por teléfono o correo;
   - permitir guardar con confirmación;
   - no bloquear por nombre similar.
7. Baja lógica:
   - sí;
   - no borrado físico.
8. Edición:
   - sí;
   - sobre la misma ficha.
9. Búsqueda por:
   - nombre;
   - teléfono;
   - correo;
   - empresa.
10. Orden de notas:
   - más recientes primero.
11. Tarea completada:
   - cambio por checkbox;
   - registrar fecha de completado.
12. Fecha/hora:
   - capturadas en zona local operativa del sistema;
   - mostradas en formato legible al usuario.
13. Estados:
   - loading;
   - empty inicial;
   - sin resultados;
   - error recuperable con reintento.

## 24. Seguridad multitenant

Decisión obligatoria:

- `Clientes` pertenece a `idEmpresa`.

Recomendaciones:

- no confiar en `idEmpresa` libre enviado por frontend;
- resolver contexto desde sesión/claims, como ya hacen módulos modernos;
- filtrar siempre por `idEmpresa` en todos los SELECT;
- incluir `idEmpresa` en ambas tablas propuestas;
- validar que `idCliente` pertenezca al mismo `idEmpresa` antes de leer o escribir notas;
- no tocar login, sesión, cookies, Firebase, claims ni permisos.

## 25. Archivos que deberán crearse

MVC:

- `inspector/checklist/Controllers/Clientes/ClientesController.cs`
- `inspector/checklist/Views/Clientes/Index.cshtml`
- `inspector/checklist/Views/Clientes/_ClientesSessionContext.cshtml`
- `inspector/checklist/wwwroot/js/Clientes/Clientes.js`
- `inspector/checklist/wwwroot/css/Clientes/Clientes.css`

API:

- `inspectorapi/checklistWs/Controllers/Clientes/ClientesController.cs`
- `inspectorapi/checklistWs/Models/Clientes/ClienteModels.cs`

SQL posterior:

- script de creación de `Clientes`
- script de creación de `ClientesNotas`

Documentación posterior opcional:

- `inspector/checklist/docs/sql/CLIENTES_UP.sql`
- `inspector/checklist/docs/sql/CLIENTES_DOWN.sql`

## 26. Archivos existentes que deberán modificarse

Durante la implementación posterior, los archivos más probables a modificar son:

- `inspector/checklist/Controllers/HomeController.cs`
  - para cambiar el placeholder de `ABC Clientes` a ruta real.
- `inspector/checklist/Views/Shared/_Layout.cshtml`
  - solo si la navegación requiere ajuste adicional visual.
- `inspector/checklist/wwwroot/css/checkapp-theme.css`
  - solo si se detecta un gap reusable real del patrón, no para customización local innecesaria.
- `inspector/checklist/wwwroot/js/checkapp-ui.js`
  - solo si falta soporte reusable para tabs, estados o timeline.

Recomendación:

- intentar no modificar `checkapp-theme.css` ni `checkapp-ui.js` salvo necesidad reusable demostrada;
- preferir CSS y JS locales del módulo.

## 27. Riesgos

- El patrón legado de CheckList aún convive con MVC + jQuery + DataTables; mezclarlo con el patrón nuevo puede generar inconsistencia si no se decide una sola dirección.
- El menú `Clientes` actual es placeholder; si se implementa el módulo sin activar la ruta, el acceso quedará incompleto.
- Existe un dominio legacy llamado `clientes` en API, pero no corresponde claramente al CRM objetivo; reutilizarlo sería riesgoso.
- Si se intenta copiar Rarámuri completo, se contaminará el alcance con funciones comerciales fuera de aprobación.
- Si la implementación usa el patrón antiguo con `idEmpresa` libre, queda más débil la seguridad multitenant.

## 28. Criterios de aceptación

- Existe módulo `Clientes > ABC Clientes`.
- La pantalla conserva esencia operativa de Rarámuri sin copiar funciones excluidas.
- Permite alta de `Particular` y `Empresa`.
- Muestra solo los campos autorizados.
- Permite buscar por nombre, teléfono, correo y empresa.
- Permite abrir ficha en la misma experiencia.
- Permite editar datos básicos.
- Permite crear nota simple.
- Permite crear tarea con fecha y hora.
- Permite completar tarea por checkbox.
- Respeta `idEmpresa` en todo el flujo.
- Tiene estados loading, empty, sin resultados y error.
- Funciona en desktop `1440`, tablet `768` y mobile `390`.
- No aparecen botones vacíos para `Compras`, `Más`, `QR/NFC`, `WhatsApp`, `Correo` o `Datos avanzados`.

## 29. Plan de implementación completo

1. Crear tablas `Clientes` y `ClientesNotas` con `idEmpresa`, auditoría y baja lógica.
2. Crear modelos API del vertical.
3. Crear controller API del vertical con operaciones mínimas.
4. Crear controller MVC proxy del vertical siguiendo el patrón moderno.
5. Crear partial `_ClientesSessionContext.cshtml`.
6. Crear vista `Views/Clientes/Index.cshtml` sobre patrón CheckApp.
7. Crear `Clientes.js` para:
   - filtros;
   - grid;
   - modal de alta;
   - apertura de ficha;
   - tabs;
   - notas/tareas.
8. Crear `Clientes.css` para ajustes locales del vertical.
9. Activar la ruta real en `HomeController` para `ABC Clientes`.
10. Ejecutar QA técnico:
   - búsqueda;
   - alta;
   - edición;
   - notas;
   - tareas;
   - tenant;
   - responsive.

## 30. Dictamen

Dictamen final:

- `IMPLEMENTAR` módulo nuevo de `Clientes` en CheckList.
- `ADAPTAR` la experiencia operativa de Rarámuri a CheckApp.
- `REUTILIZAR` patrón visual CheckApp actual y patrón técnico proxy seguro.
- `NO REUTILIZAR` el dominio legacy `clientes` detectado en joins académicos.
- `EXCLUIR` todas las funciones comerciales y avanzadas no aprobadas.

La propuesta final correcta para este vertical es:

- un `ABC Clientes` nuevo;
- visualmente alineado a CheckApp;
- conceptualmente inspirado en `/clientes` de Rarámuri;
- limitado a búsqueda, alta, ficha, datos y notas/tareas;
- multitenant por `idEmpresa`;
- sin mezclar compras, QR/NFC, lealtad, contacto externo ni datos avanzados.
