# Auditoría comparativa de desviación y plan correctivo final

**Vertical:** Reporte de órdenes de compra  
**Fecha:** 2026-08-06  
**Fase:** auditoría comparativa + plan correctivo final  
**Implementación:** prohibida en esta fase

## 1. Alcance auditado

Se auditó exclusivamente el reporte de órdenes de compra de CheckList contra:

- la implementación actual de CheckList;
- el contrato real frontend + API vigente;
- el Patrón CheckApp oficial;
- la referencia funcional y visual de Rarámuri para `/almacen/compras/ordenes`.

No se modificó código de producción.

## 2. Fuentes revisadas

### CheckList

- `Views/Activos/OrdenesCompra/Index.cshtml`
- `wwwroot/js/Activos/OrdenesCompra/OrdenesCompra.js`
- `wwwroot/css/Activos/OrdenesCompra/OrdenesCompra.css`
- `Controllers/Activos/OrdenesCompraController.cs`
- `inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`
- `inspectorapi/checklistWs/Models/OrdenesCompra/OrdenesCompraModels.cs`
- `wwwroot/js/checkapp-ui.js`
- `wwwroot/css/checkapp-theme.css`

### Patrón CheckApp

- `inspector/docs/ui/PATRON_CHECKAPP.md`
- `inspector/docs/ui/PATRON_CHECKAPP_PRO.md`
- `inspector/docs/ui/CHECKAPP_COMPONENTES.md`

### Rarámuri

- `Raramuri.blzr/Components/Pages/Almacen/AlmacenCompras.razor`
- `Raramuri.blzr/Components/Pages/Almacen/AlmacenCompras.razor.css`

## 3. Restricción de QA visual

El intento de validación visual en navegador local del `2026-08-06` quedó bloqueado por autenticación.  
La ruta `http://localhost:5200/Activos/OrdenesCompra/Reporte` redirigió a:

- `http://localhost:5200/Login/Index?ReturnUrl=%2FActivos%2FOrdenesCompra%2FReporte`

Conclusión:

- la auditoría visual dinámica de scroll real y render final quedó parcialmente bloqueada por falta de sesión activa;
- la auditoría funcional y técnica sí pudo cerrarse por código, contrato y referencia.

## 4. Conclusión ejecutiva

La pantalla actual **sí funciona técnicamente**, pero **todavía no converge ni al patrón operativo de Rarámuri ni al contrato de presentación esperado por CheckApp**.

La desviación principal no es un solo bug aislado. Es una suma de decisiones locales:

- hero con acción primaria de captura dentro de una pantalla de consulta;
- fechas sin inicialización;
- KPI globales desacoplados del resultado consultado;
- tabla con columnas y comportamiento propios del contrato local, pero sin adoptar la misma jerarquía operativa de la referencia;
- detalle resuelto como navegación al wizard en vez de consulta en contexto;
- responsive incompleto para el grid porque la primera columna visible es `Acciones`, lo que degrada las mobile cards del patrón;
- indicios de problema estructural en la columna `Acciones` por ausencia de definición explícita de sticky/fijo y por ancho dependiente del contenido.

## 5. Hallazgos obligatorios

### 5.1 Botón `Nueva`

**Estado actual**

- El hero del reporte expone una acción primaria `Nueva` en `Index.cshtml`.
- Referencia: `Views/Activos/OrdenesCompra/Index.cshtml`, líneas 16-21.

**Evaluación**

- En Rarámuri, la pantalla de reporte de órdenes no concentra la acción de alta en el hero del reporte.
- En CheckApp, el hero debe priorizar identidad, contexto y consulta; no mezclar captura operativa principal si la pantalla es de reporte.
- La existencia de la ruta `/Activos/OrdenesCompra/Nueva` y del menú hace innecesaria su presencia dentro del reporte.

**Clasificación**

- `ELIMINAR` del reporte.

**Decisión final**

- Ocultar `Nueva` en el hero del reporte.
- Conservar `Nueva` únicamente en menú/navegación.

### 5.2 Fechas predeterminadas

**Estado actual en CheckList**

- `Fecha desde` y `Fecha hasta` se renderizan vacías.
- `resetReportFilters()` vuelve a dejar ambas vacías.
- Referencias:
  - `Views/Activos/OrdenesCompra/Index.cshtml`, líneas 74-80
  - `OrdenesCompra.js`, líneas 1627-1635

**Contrato real backend**

- El backend sí soporta `fechaDesde` y `fechaHasta`.
- Ambos filtros se aplican únicamente sobre `oc.FechaOrden`.
- No existe soporte para `Tipo de fecha`.
- Referencia: `inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`, líneas 48-62 y 121-122.

**Comportamiento de referencia en Rarámuri**

- `SetDefaults()` define:
  - fecha inicial = primer día del mes actual;
  - fecha final = día actual.
- `LimpiarFiltros()` vuelve a ejecutar `SetDefaults()`.
- Referencias:
  - `AlmacenCompras.razor`, líneas 2040-2042
  - `AlmacenCompras.razor`, líneas 3717-3725

**Desviación**

- CheckList hoy no inicializa fechas.
- Rarámuri sí inicializa fechas, pero no exactamente como pidió Product Owner.
- Product Owner de CheckList solicitó:
  - desde = primer día del mes actual;
  - hasta = último día del mes actual.

**Clasificación**

- `CORREGIR`

**Decisión final**

- Priorizar la instrucción del Product Owner de CheckList sobre la variante observada en Rarámuri.

**Regla exacta recomendada**

- Valor inicial al abrir la pantalla:
  - `Fecha desde = primer día del mes actual`
  - `Fecha hasta = último día del mes actual`
- Formato visible:
  - control `input type="date"` con valor ISO `yyyy-MM-dd`
- Formato enviado:
  - `fechaDesde=yyyy-MM-dd`
  - `fechaHasta=yyyy-MM-dd`
- Regla de búsqueda inicial:
  - no consultar automáticamente al entrar;
  - esperar acción explícita de `Buscar`
- Regla de `Limpiar`:
  - limpiar búsqueda libre, estado, proveedor, razón social y sucursal;
  - restaurar ambas fechas al rango predeterminado del mes actual;
  - limpiar búsqueda interna del grid;
  - no dejar fechas vacías
- Regla de recarga:
  - en reload completo de página se recalculan con la fecha local del cliente

### 5.3 Acciones y scroll del DynamicGrid

**Estado actual**

- El grid usa `CheckAppDynamicGrid` con una sola envoltura `.checkapp-grid-scroll`.
- El patrón base define sticky únicamente para el header `thead th`.
- No existe definición local ni base de columna sticky para `Acciones`.
- La columna `Acciones` tampoco tiene ancho fijo explícito.
- Referencias:
  - `OrdenesCompra.js`, líneas 1412-1517
  - `checkapp-theme.css`, líneas 550-590
  - `OrdenesCompra.css`, líneas 584-586

**Hallazgo técnico**

- No hay evidencia en código de una columna fija autorizada para `Acciones`.
- Tampoco hay doble contenedor de scroll en este módulo.
- El footer externo está correctamente fuera del scroll horizontal; ese punto sí converge al patrón.
- La tabla usa:
  - `width: max-content`
  - `min-width: 100%`
  - `autoWidth: false`
- La celda de `Acciones` se renderiza con un enlace inline cuyo ancho depende del texto.

**Causa más probable y sustentada**

- El problema no nace de un sticky correctamente implementado que “falle”.
- Nace de que la UI sugiere una columna especial de acciones, pero la implementación no le da una política explícita:
  - no sticky;
  - no ancho fijo;
  - no tratamiento de z-index propio;
  - no variante móvil específica;
  - no template compacto de acciones.
- En ese estado, cualquier desalineación visual durante scroll horizontal/vertical depende del ancho dinámico de la columna y del render de DataTables dentro del contenedor con `width: max-content`.

**Clasificación**

- `CORREGIR`

**Decisión final**

- No fijar la columna `Acciones` en esta pantalla.
- Mantener únicamente sticky header.
- Compactar `Acciones` como columna normal sincronizada con el resto del grid.
- Definir ancho explícito y comportamiento consistente por breakpoint.

**Conclusión específica solicitada**

- `sticky incorrecto`: no hay sticky de columna implementado; por tanto no debe “parcharse” como si existiera.
- `superposición / z-index`: hoy no hay z-index específico para celdas de acciones; si aparece, es un síntoma de falta de política de columna, no una política mal terminada.
- `doble scroll`: no se detectó en el código del módulo.
- `columna fija no autorizada`: la pantalla no debe introducirla.

### 5.4 Detalle de la orden

**Estado actual**

- `Ver detalle` navega a `/Activos/OrdenesCompra/Detalle/{id}`.
- Esa ruta vuelve a cargar la vista del wizard `Nueva.cshtml` en modo detalle.
- Referencias:
  - `OrdenesCompra.js`, líneas 1440-1447
  - `Controllers/Activos/OrdenesCompraController.cs`, líneas 43-56

**Referencia Rarámuri**

- El reporte abre un modal de detalle en contexto.
- El detalle permanece sobre la misma pantalla.
- Referencia: `AlmacenCompras.razor`, líneas 1085-1132 y 2239-2267.

**Contrato actual reutilizable en CheckList**

- `ObtenerOrdenCompra` ya devuelve:
  - folio;
  - estado;
  - razón social;
  - sucursal;
  - proveedor;
  - fecha de orden;
  - fecha de llegada;
  - observaciones;
  - subtotal;
  - total;
  - partidas.
- No hace falta endpoint nuevo para un modal de consulta.
- Referencias:
  - `Controllers/Activos/OrdenesCompraController.cs`, líneas 59-63
  - `inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`, líneas 155-253

**Clasificación**

- `ADAPTAR A CHECKLIST`

**Decisión final**

- Sustituir navegación a wizard por modal de detalle de solo lectura.
- Consumir `ObtenerOrdenCompra`.
- No crear endpoint nuevo.

**Contenido final del modal**

- folio
- estado visible
- razón social
- sucursal
- proveedor
- fecha de orden
- fecha de llegada
- observaciones
- partidas
- tipo
- código
- producto o servicio
- unidad
- cantidad
- costo
- subtotal
- total
- botón `PDF`
- botón `Excel`
- botón `Cerrar`

**Excluir del modal**

- stepper
- progreso
- pasos completados
- edición
- guardar
- generar
- detener
- campos de captura
- ids internos
- datos técnicos

### 5.5 KPI

**Estado actual**

- CheckList muestra KPI globales por estado incluso antes de consultar.
- Se cargan desde `ObtenerResumenOrdenesCompra`, que no recibe filtros.
- Referencias:
  - `Index.cshtml`, líneas 24-40
  - `OrdenesCompra.js`, líneas 1400-1408
  - `inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`, líneas 700-742

**Referencia Rarámuri**

- Los KPI de órdenes se calculan sobre `_reporteOrdenesView`, es decir, sobre el resultado visible/filtrado.
- Incluyen cantidad, pendientes/canceladas y métricas operativas reales como piezas e importe.
- Referencias:
  - `AlmacenCompras.razor`, líneas 281-285
  - `AlmacenCompras.razor`, líneas 1940-1948

**Restricción del modelo CheckList**

- El listado actual sí expone:
  - total de órdenes filtradas;
  - total monetario por fila;
  - estados.
- El listado actual no expone:
  - partidas por orden;
  - piezas recibidas;
  - piezas por llegar.

**Clasificación**

- `CORREGIR`

**Decisión final**

- Los KPI del reporte deben depender del resultado consultado, no del universo global.
- Deben mostrarse únicamente después de consultar.
- Deben calcularse con los registros retornados por `ObtenerOrdenesCompra`.

**KPI finales recomendados**

- `Órdenes` = cantidad de registros filtrados
- `En captura` = cantidad filtrada con estado `1`
- `Confirmadas` = cantidad filtrada con estado `2`
- `Detenidas` = cantidad filtrada con estado `3`
- `Importe total` = suma de `Total` de la consulta filtrada

**KPI excluidos**

- `Partidas`
- `Piezas`
- `Recibidas`
- `Por llegar`

Motivo:

- el contrato actual del listado no los soporta de forma directa.

### 5.6 Filtros

**Evaluación del backend actual**

Filtros realmente soportados:

- `busqueda`
- `estado`
- `idProveedor`
- `idRazonSocial`
- `idSucursal`
- `fechaDesde`
- `fechaHasta`

Filtro no soportado:

- `Tipo de fecha`

Referencia:

- `inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`, líneas 48-62

**Clasificación final**

- `Proveedor` → `ADAPTAR A CHECKLIST`
- `Razón social` → `ADAPTAR A CHECKLIST`
- `Sucursal` → `ADAPTAR A CHECKLIST`
- `Estado` → `ADAPTAR A CHECKLIST`
- `Tipo de fecha` → `EXCLUIR POR MODELO DIFERENTE`
- `Fecha desde` → `CORREGIR`
- `Fecha hasta` → `CORREGIR`
- `Búsqueda libre` → `REUTILIZAR CONCEPTUALMENTE`

**Orden visual recomendado**

Fila 1:

- Búsqueda libre
- Estado
- Proveedor
- Razón social

Fila 2:

- Sucursal
- Fecha desde
- Fecha hasta

Fila 3:

- Buscar
- Limpiar
- Excel

**Regla operativa**

- Todos opcionales.
- Sin `Tipo de fecha`.
- Sin autosearch al cambiar filtros.
- `Buscar` dispara consulta.
- `Limpiar` restaura defaults del mes actual.

### 5.7 Tabla

**Columnas soportadas por contrato actual**

- `Acciones`
- `Folio`
- `Proveedor`
- `Fecha de orden`
- `Fecha de llegada`
- `Estado`
- `Razón social`
- `Sucursal`
- `Total`
- `Fecha de creación`

**Columnas no soportadas por contrato actual del listado**

- `Partidas`

Motivo:

- `OrdenCompraListadoDto` no la expone.

**Clasificación**

- `Acciones` → `CORREGIR`
- `Folio` → `REUTILIZAR CONCEPTUALMENTE`
- `Proveedor` → `REUTILIZAR CONCEPTUALMENTE`
- `Fecha de orden` → `REUTILIZAR CONCEPTUALMENTE`
- `Fecha de llegada` → `REUTILIZAR CONCEPTUALMENTE`
- `Estado` → `ADAPTAR A CHECKLIST`
- `Razón social` → `ADAPTAR A CHECKLIST`
- `Sucursal` → `ADAPTAR A CHECKLIST`
- `Partidas` → `EXCLUIR POR MODELO DIFERENTE`
- `Total` → `REUTILIZAR CONCEPTUALMENTE`
- `Fecha de creación` → `CONSERVAR COMO ESTÁ`

**Orden final recomendado**

1. Acciones
2. Folio
3. Proveedor
4. Razón social
5. Sucursal
6. Estado
7. Fecha de orden
8. Fecha de llegada
9. Total
10. Fecha de creación

**Política de tabla**

- sin columna fija;
- header sticky;
- ancho explícito para `Acciones`;
- densidad compacta;
- footer externo;
- mobile cards reales.

### 5.8 Responsive

**Hallazgo crítico**

- `CheckAppDynamicGrid` usa la primera columna visible como `mobileCardTitleKey` si no se configura una clave propia.
- En este módulo la primera columna visible es `acciones`.
- `acciones` no existe como propiedad de datos del row.
- Resultado esperado en móvil: cards con título genérico `Registro` y con la fila de acciones tratada como dato, no como acción prioritaria.
- Referencias:
  - `checkapp-ui.js`, líneas 217-261
  - `OrdenesCompra.js`, líneas 1438-1450

**Clasificación**

- `CORREGIR`

**Decisión final**

- Definir `mobileCardTitleKey = "folio"`.
- Definir `mobileCardMeta` con estado.
- Definir `mobileCardTemplate` para que el CTA `Ver detalle` aparezca como acción principal de card y no como “campo”.

## 6. Comparativo por secciones

### Encabezado

- Rarámuri: foco en reporte, sin mezclar alta principal.
- CheckList: hero correcto en estructura, pero con CTA `Nueva` compitiendo con consulta.
- Clasificación: `CORREGIR`

### Filtros

- Rarámuri: resumen útil, defaults, acciones completas, orden más operativo.
- CheckList: base correcta, pero sin defaults y sin cierre de set real de filtros.
- Clasificación: `ADAPTAR A CHECKLIST`

### Resumen de filtros

- Rarámuri: visible y consistente con defaults.
- CheckList: existe, pero refleja fechas vacías y textos abiertos como `inicio` / `hoy`.
- Clasificación: `CORREGIR`

### KPI

- Rarámuri: derivados del resultado filtrado.
- CheckList: globales y previos a consulta.
- Clasificación: `CORREGIR`

### Búsqueda dentro del resultado

- Rarámuri: integrada en toolbar y aplicada sobre vista filtrada.
- CheckList: conceptualmente correcta.
- Clasificación: `REUTILIZAR CONCEPTUALMENTE`

### Tabla

- Rarámuri: jerarquía más operativa, acciones compactas, métricas de negocio del modelo hermano.
- CheckList: correcta para su contrato, pero necesita depurar columnas y orden.
- Clasificación: `ADAPTAR A CHECKLIST`

### Acciones por fila

- Rarámuri: ver detalle en contexto y acciones secundarias compactas.
- CheckList: navegación fuera de contexto.
- Clasificación: `CORREGIR`

### Estado vacío

- Rarámuri: distingue “aún no consultas” vs “sin resultados”.
- CheckList: el grid ya muestra un texto base útil.
- Clasificación: `CONSERVAR COMO ESTÁ` con ajuste menor de copy si se rediseña la secuencia de KPI

### Detalle

- Rarámuri: modal en contexto.
- CheckList: wizard completo reutilizado como lectura.
- Clasificación: `CORREGIR`

### Exportación

- Rarámuri: exporta consulta visible y detalle en contexto.
- CheckList: listado Excel ya existe; PDF/Excel de detalle también existen por documento.
- Clasificación: `ADAPTAR A CHECKLIST`

### Responsive

- Rarámuri: grid desktop + cards móviles con CTA legible.
- CheckList: base heredada del patrón, pero mal configurada por primera columna sintética.
- Clasificación: `CORREGIR`

## 7. Plan correctivo final único

## Objetivo

Converger el reporte de CheckList al patrón operativo de Rarámuri adaptado a CheckApp, **sin tocar modelo ni contratos**.

### Etapa 1. Reencuadre del reporte

- Retirar `Nueva` del hero.
- Mantener el hero enfocado en consulta.
- Reordenar copy para enfatizar búsqueda y consulta.

### Etapa 2. Filtros y defaults

- Inicializar rango del mes actual.
- Eliminar `Tipo de fecha`.
- Normalizar `Limpiar` para restaurar defaults.
- Mantener consulta sólo bajo `Buscar`.

### Etapa 3. KPI alineados al resultado

- Dejar de usar `ObtenerResumenOrdenesCompra` como fuente visual principal del reporte.
- Calcular KPI desde el resultado retornado por `ObtenerOrdenesCompra`.
- Mostrar KPI sólo después de una consulta ejecutada.

### Etapa 4. Tabla y acciones

- Reordenar columnas al set final definido.
- Compactar `Acciones`.
- Definir ancho explícito de `Acciones`.
- No implementar columna fija.
- Mantener sticky header solamente.

### Etapa 5. Detalle en contexto

- Reemplazar navegación a wizard por modal de detalle de solo lectura.
- Reutilizar `ObtenerOrdenCompra`.
- Conectar acciones `PDF` y `Excel` desde ese modal.

### Etapa 6. Responsive real

- Configurar `mobileCardTitleKey = "folio"`.
- Agregar template móvil del card.
- Elevar `Ver detalle` como CTA primario móvil.

## 8. Decisiones cerradas

- `Nueva` en reporte: **no**
- `Tipo de fecha`: **no**
- fechas vacías por defecto: **no**
- consulta automática al entrar: **no**
- KPI globales antes de buscar: **no**
- KPI filtrados tras búsqueda: **sí**
- detalle por navegación al wizard: **no**
- detalle modal en misma pantalla: **sí**
- endpoint nuevo de detalle: **no**
- columna fija de acciones: **no**
- sticky header: **sí**
- mobile cards customizadas para órdenes: **sí**

## 9. Riesgos y notas

- La parte visual exacta del bug de scroll en navegador no quedó reproducida en sesión autenticada al `2026-08-06`; la conclusión se fundamenta en estructura de grid, CSS y patrón base.
- Si en implementación se quisiera agregar `Partidas` como columna de listado, eso ya requeriría ampliar contrato o derivar dato adicional; no está autorizado en esta fase.
- Si se conservara `ObtenerResumenOrdenesCompra`, debería quedar como apoyo analítico global, no como KPI principal del reporte operativo.

## 10. Recomendación final al Product Owner

Sí procede una corrección del reporte actual.  
No procede un rediseño libre ni un nuevo vertical.  
La intervención correcta es:

- quirúrgica en contratos;
- fuerte en UX operativa;
- consistente con CheckApp;
- reutilizando el detalle actual mediante modal;
- eliminando elementos ajenos al reporte;
- y alineando KPI, filtros y responsive al comportamiento esperado.
