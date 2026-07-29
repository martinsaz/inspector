# Certificación del Patrón CheckApp

## 1. Resumen Ejecutivo

Se certificó el patrón construido en CheckApp contra la referencia obligatoria Tarahumara usando exclusivamente:

- `TarahumaraPro.md`
- `tarahumara-theme.css`
- `tarahumara-secondary.css`
- `FilterAccordion.razor`
- `TarahumaraDynamicGrid.razor.rz.scp.css`
- documentación UI entregada por Product Owner

La ruta objetivo solicitada para certificación, `http://localhost:5200/CheckApp/Pattern`, **no estuvo disponible** en el frontend activo del usuario durante esta auditoría: respondió `404 Not Found` el `2026-07-25`. Además, la versión actualizada levantada temporalmente en `http://localhost:5201/CheckApp/Pattern` quedó contaminada por comportamiento global de sesión y tenant (`redirección a /`, mensaje `El id de la empresa no puede ser nulo o vacío.`, y modal `Se inició sesión en otro dispositivo con su usuario`).

Para no convertir la certificación en una auditoría de login/sesión fuera de alcance, la comparación visual se realizó sobre dos laboratorios estáticos y fieles a código real:

- un laboratorio Tarahumara reconstruido desde los artefactos oficiales entregados;
- un laboratorio CheckApp reconstruido desde los artefactos oficiales actuales:
  - `checkapp-theme.css`
  - `checkapp-ui.js`
  - `Pattern.cshtml`

### Dictamen ejecutivo

- **Similitud visual estimada:** `62%`
- **Similitud funcional estimada:** `74%`
- **Resultado:** el patrón **todavía no alcanza** una adaptación fiel suficiente para habilitar su uso oficial por instrucción genérica.

## 2. Comparación Componente por Componente

| Componente | Estado | Justificación |
|---|---|---|
| Header | Diferente | Tarahumara usa header secundario sobrio, sin card hero, con línea roja inferior izquierda y jerarquía más compacta. CheckApp usa hero card grande, degradados, chips y CTA principal. |
| Toolbar | Parcialmente parecido | Ambos tienen acciones agrupadas, pero Tarahumara es más denso, bancario y menos decorativo. CheckApp usa pills suaves y mayor aire. |
| Cards | Parcialmente parecido | Existe uso de cards en ambos, pero CheckApp agrega acento lateral, más redondez y una lectura más “friendly” que la referencia operativa. |
| Resumen | Muy parecido | Ambos presentan KPIs/resumen en tarjetas horizontales con foco en lectura rápida, aunque el tratamiento visual diverge. |
| Botones | Diferente | Tarahumara usa botones compactos y semántica muy clara: rojo primario, neutros secundarios, verde Excel. CheckApp añade gradientes, pills y mayor protagonismo visual. |
| Inputs | Parcialmente parecido | CheckApp conserva inputs limpios, pero son más altos y redondeados; Tarahumara exige densidad más operativa. |
| Selects | Parcialmente parecido | La estructura existe, pero el comportamiento visual no replica la neutralidad compacta de Tarahumara en reposo. |
| Checkbox | Diferente | No existe un componente checkbox certificado en la pantalla CheckApp auditada. |
| Switch | Diferente | No existe un componente switch certificado en la pantalla CheckApp auditada. |
| Accordion | Parcialmente parecido | CheckApp conserva panel colapsable, pero la cabecera, iconografía y contundencia visual no coinciden con Tarahumara. |
| FilterAccordion | Parcialmente parecido | CheckApp respeta la idea de resumen visible y panel seguro, pero no replica el lenguaje de `FilterAccordion.razor` ni su feel compacto. |
| Grid | Parcialmente parecido | Existe grid reusable con búsqueda, exportación y responsive, pero el estilo general y el footer no siguen el contrato Tarahumara. |
| Header del Grid | Parcialmente parecido | Hay sticky header y mayúsculas, pero Tarahumara tiene tratamiento más compacto y jerarquía visual más rígida. |
| Toolbar del Grid | Parcialmente parecido | Search + acciones existen, pero CheckApp usa una disposición más “premium suave” que “operativa bancaria”. |
| Hover | Muy parecido | Ambos aplican hover discreto por fila; semánticamente es equivalente aunque el color difiere. |
| Loading | Parcialmente parecido | CheckApp contempla estado loading en contrato JS, pero la expresión visual no alcanza todavía el patrón Tarahumara secundario. |
| Empty | Parcialmente parecido | El estado existe, pero no tiene aún la tarjeta vacía discreta definida en Tarahumara secundario. |
| Error | Parcialmente parecido | Existe manejo de error, pero no con la misma contención visual y semántica de la referencia. |
| Responsive | Muy parecido | CheckApp sí contempla desktop, tablet y móvil real, sin overflow accidental y con conversión de grid. |
| Cards móviles | Muy parecido | La estrategia de transformar tabla a cards está presente y es coherente con la referencia conceptual. |
| Paginación | Diferente | Tarahumara exige footer manual externo con chips `25/50/100` y rango/página controlados. CheckApp sigue usando el footer nativo de DataTables. |
| Selector de columnas | Diferente | Tarahumara maneja selector tipo modal profesional/lista estructurada; CheckApp usa dropdown flotante simple. |
| Exportación Excel | Muy parecido | La capacidad existe y el botón verde semántico también, aunque la UX global alrededor difiere. |
| Modal | Parcialmente parecido | CheckApp usa modal limpio y card blanca, pero mantiene más redondez, aire y peso visual que Tarahumara. |
| Tipografía | Muy parecido | La familia y el tono son cercanos; la diferencia está más en pesos y densidad que en la fuente. |
| Espaciados | Diferente | CheckApp es más amplio y relajado; Tarahumara es más compacto y orientado a operación continua. |
| Sombras | Parcialmente parecido | Ambos usan sombras sutiles, pero CheckApp las usa para suavizar y “elevar” más. |
| Bordes | Parcialmente parecido | Hay borde fino en ambos, aunque Tarahumara usa una temperatura más cálida y menos radio. |
| Jerarquía visual | Diferente | Tarahumara empuja sobriedad y velocidad operativa. CheckApp actual todavía se siente más showcase/premium que operativo puro. |
| Paleta | Parcialmente parecido | Existe traducción de semántica a paleta CheckApp, pero el resultado cromático se aleja demasiado de la severidad Tarahumara. |
| Contraste | Muy parecido | La legibilidad general es correcta en ambos laboratorios. |
| Microinteracciones | Parcialmente parecido | Hay estados hover/focus y toggles, pero Tarahumara es más contenida y consistente; CheckApp introduce más “lift” visual. |

## 3. Capturas Comparativas

### Header

CheckApp:

![CheckApp Header](./certificacion-patron-checkapp-assets/checkapp-header.png)

Tarahumara:

![Tarahumara Header](./certificacion-patron-checkapp-assets/tarahumara-header.png)

### Cards

CheckApp:

![CheckApp Cards](./certificacion-patron-checkapp-assets/checkapp-cards.png)

Tarahumara:

![Tarahumara Cards](./certificacion-patron-checkapp-assets/tarahumara-cards.png)

### Toolbar

CheckApp:

![CheckApp Toolbar](./certificacion-patron-checkapp-assets/checkapp-toolbar.png)

Tarahumara:

![Tarahumara Toolbar](./certificacion-patron-checkapp-assets/tarahumara-toolbar.png)

### Filtros

CheckApp:

![CheckApp Filters](./certificacion-patron-checkapp-assets/checkapp-filters.png)

Tarahumara:

![Tarahumara Filters](./certificacion-patron-checkapp-assets/tarahumara-filters.png)

### Grid

CheckApp:

![CheckApp Grid](./certificacion-patron-checkapp-assets/checkapp-grid.png)

Tarahumara:

![Tarahumara Grid](./certificacion-patron-checkapp-assets/tarahumara-grid.png)

### Modal

CheckApp:

![CheckApp Modal](./certificacion-patron-checkapp-assets/checkapp-modal.png)

Tarahumara:

![Tarahumara Modal](./certificacion-patron-checkapp-assets/tarahumara-modal.png)

### Responsive escritorio

![CheckApp Desktop](./certificacion-patron-checkapp-assets/checkapp-responsive-desktop.png)

### Responsive tablet

![CheckApp Tablet](./certificacion-patron-checkapp-assets/checkapp-responsive-tablet.png)

### Responsive móvil

![CheckApp Mobile](./certificacion-patron-checkapp-assets/checkapp-responsive-mobile.png)

## 4. Hallazgos

1. El patrón CheckApp sí logró construir un set reusable con identidad propia y cobertura funcional amplia.
2. La referencia Tarahumara no es solo una paleta: impone densidad, sobriedad, footer externo manual, semántica precisa de botones y una jerarquía operativa mucho más estricta.
3. CheckApp tradujo varias capacidades, pero no tradujo todavía la misma disciplina visual del patrón original.
4. El mayor desvío está en el lenguaje del header, la expresividad de botones/cards y el contrato del grid.
5. La ruta viva solicitada para certificar no estaba disponible en `5200`, lo que por sí solo vuelve riesgoso declarar el patrón como estándar oficial listo para invocación genérica.

## 5. Diferencias

### CRÍTICO

- `http://localhost:5200/CheckApp/Pattern` no existe actualmente en el frontend activo del usuario (`404 Not Found`).
- La versión actualizada del laboratorio en runtime MVC quedó interferida por capa global de sesión/tenant, impidiendo una certificación limpia sobre la ruta viva.
- La paginación/footers del grid no siguen el contrato Tarahumara oficial; esto afecta una de las piezas más visibles y normativas del patrón.

### ALTO

- Header interno de CheckApp no replica el patrón Tarahumara Secundario.
- Botonera principal demasiado decorativa frente a la severidad operativa de Tarahumara.
- Selector de columnas no replica el flujo modal/estructurado de la referencia.
- Jerarquía visual general más cercana a una UI “premium suave” que a una UI “operativa bancaria”.

### MEDIO

- Cards y resumen con más radio/sombra/aire que la referencia.
- Filtros y accordion conceptualmente correctos, pero visualmente más blandos y amplios.
- Modal correcto en estructura, pero no en densidad exacta.

### MENOR

- Microinteracciones con más lift/softness que Tarahumara.
- Separación cromática secundaria más visible de lo necesario.

## 6. Correcciones Realizadas Automáticamente

Ninguna.

Se decidió no aplicar correcciones automáticas porque la certificación encontró diferencias **críticas**. Conforme a la instrucción de esta fase, ante una diferencia crítica corresponde detenerse y no continuar con ajustes parciales que puedan simular una certificación prematura.

## 7. Correcciones Pendientes

1. Publicar o estabilizar realmente la ruta oficial de certificación `5200/CheckApp/Pattern`.
2. Rediseñar el header hacia el modelo `tara-secondary-header` y su jerarquía compacta.
3. Rehacer la botonera principal según semántica Tarahumara: compacta, sin gradiente hero, rojo primario más severo.
4. Sustituir el footer nativo DataTables por footer externo/manual estilo Tarahumara.
5. Replantear el selector de columnas hacia una experiencia modal o panel profesional alineada con la referencia.
6. Compactar espaciados, radios y alturas de controles.
7. Revisar states `loading`, `empty` y `error` para acercarlos a la variante secundaria real.

## 8. Porcentaje de Similitud Visual

**62%**

Base del cálculo:

- alta similitud en responsive, contraste y cobertura de piezas;
- similitud media en cards, filtros, modal e inputs;
- baja similitud en header, botones, jerarquía visual, footer de grid y selector de columnas.

## 9. Porcentaje de Similitud Funcional

**74%**

Base del cálculo:

- sí existen grid reusable, exportación, responsive, mobile cards, filtros y estados;
- no existe todavía equivalencia funcional completa en paginación/manual footer, selector de columnas y comportamiento operativo del filter flow.

## 10. Riesgos

1. Declarar el patrón como certificado en este estado permitiría propagar a otras pantallas una variante que aún no converge al contrato Tarahumara real.
2. Si se aplica el patrón actual a más módulos, el costo de alineación futura subirá porque habrá más superficies divergentes.
3. La indisponibilidad real de la ruta viva de certificación puede ocultar regresiones de integración que no aparecen en laboratorio estático.

## 11. Recomendación

No habilitar todavía la instrucción general:

`Aplica el Patrón CheckApp`

Primero debe cerrarse la brecha crítica del laboratorio vivo y la brecha alta del grid/header/botonera. Hasta entonces, el patrón existe como base técnica prometedora, pero **no** como estándar oficial certificado.
