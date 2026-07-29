# Componentes CheckApp

**Versión:** 2.0  
**Fecha:** 2026-07-25

## Uso oficial

Este documento enumera los componentes base ya implementados y su punto de entrada oficial.

## CSS oficial

Archivo:

- `checklist/wwwroot/css/checkapp-theme.css`

Responsabilidades:

- tokens `--checkapp-*`
- layout del laboratorio
- header interno
- toolbar
- cards
- inputs y selects
- acordeón de filtros
- grid shell
- footer premium
- modal
- badges, chips y estados
- responsive

## JavaScript oficial

Archivo:

- `checklist/wwwroot/js/checkapp-ui.js`

Expone:

- `CheckAppUI.createDynamicGrid(config)`
- `CheckAppUI.reloadGrid(id)`
- `CheckAppUI.exportGrid(id)`
- `CheckAppUI.createFilterAccordion(config)`
- `CheckAppUI.getGrid(id)`
- `CheckAppUI.getAccordion(id)`

## Header

Clases:

- `checkapp-hero`
- `checkapp-kicker`
- `checkapp-hero-actions`

Contrato:

- línea de identidad inferior izquierda;
- título compacto;
- copy corto;
- acciones agrupadas sin competir con el título.

## Toolbar

Clases:

- `checkapp-panel-actions`
- `checkapp-toolbar-showcase`
- `checkapp-btn-*`

Contrato:

- botón primario rojo;
- acciones secundarias neutras;
- Excel verde;
- chips cortos;
- wrap limpio en resoluciones intermedias.

## Cards

Clases:

- `checkapp-summary-strip`
- `checkapp-summary-card`
- `ca-card`

Contrato:

- fondo blanco;
- borde cálido;
- sombra sutil;
- acento lateral rojo en tarjetas de resumen.

## Inputs y Selects

Clases:

- `checkapp-field`
- `checkapp-field > span`
- `checkapp-field input`
- `checkapp-field select`
- `checkapp-field textarea`

Contrato:

- label visible;
- altura operativa;
- foco visible;
- placeholder auxiliar, no sustitutivo.

## Botones

Clases:

- `checkapp-btn`
- `checkapp-btn-primary`
- `checkapp-btn-secondary`
- `checkapp-btn-ghost`
- `checkapp-btn-excel`
- `checkapp-btn-danger`

Contrato:

- radio compacto;
- peso tipográfico alto;
- semántica de color estable;
- hover contenido, no decorativo.

## CheckAppFilterAccordion

Clases:

- `checkapp-accordion`
- `checkapp-accordion-toggle`
- `checkapp-accordion-summary`
- `checkapp-accordion-body`
- `checkapp-accordion-inner`

API:

```javascript
CheckAppUI.createFilterAccordion({
  id: "filtros",
  selector: "#accordionFiltros",
  toggleSelector: ".checkapp-accordion-toggle",
  summarySelector: ".checkapp-accordion-summary",
  open: true,
  emptySummaryText: "Sin filtros activos"
});
```

Capacidades:

- abrir/cerrar;
- resumen texto o HTML;
- persistencia del contenido montado;
- `aria-expanded`.

## CheckAppDynamicGrid

Capacidades:

- render tabular;
- cards móviles;
- selector de columnas;
- exportación;
- footer externo;
- estados visuales.

Clases principales:

- `checkapp-grid`
- `checkapp-grid-toolbar`
- `checkapp-grid-search`
- `checkapp-grid-actions`
- `checkapp-grid-columns-panel`
- `checkapp-grid-scroll`
- `checkapp-grid-table`
- `checkapp-grid-state`
- `checkapp-grid-footer`
- `checkapp-grid-page-chip`
- `checkapp-grid-nav-btn`

## Badges y chips

Clases:

- `checkapp-badge`
- `checkapp-badge-success`
- `checkapp-badge-muted`
- `ca-chip`
- `ca-chip--primary`
- `ca-chip--secondary`

## Estados

Clases:

- `ca-state`
- `ca-state--loading`
- `ca-state--empty`
- `ca-state--error`

## Modal

Clases:

- `checkapp-modal`
- `ca-modal`

Contrato:

- card blanca;
- header y footer limpios;
- acciones inequívocas;
- cuerpo con misma retícula de campos.

## Pantalla laboratorio

Vista oficial:

- `checklist/Views/CheckApp/Pattern.cshtml`

Script de laboratorio:

- `checklist/wwwroot/js/CheckApp/Pattern.js`

Uso:

- validar visualmente el patrón;
- validar responsive;
- generar capturas de certificación;
- probar estados y contratos sin tocar módulos funcionales.
