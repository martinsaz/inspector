# Patrón CheckApp Pro

**Versión:** 2.0  
**Fecha:** 2026-07-25

## Objetivo

`CheckAppDynamicGrid` es el estándar oficial para:

- listados administrativos;
- reportes;
- consultas masivas;
- catálogos;
- vistas con exportación y filtros.

Está implementado sobre `DataTables`, pero su contrato visual y operativo replica el patrón Tarahumara Pro.

## Implementación oficial

API pública:

```javascript
CheckAppUI.createDynamicGrid(config)
CheckAppUI.reloadGrid(id)
CheckAppUI.exportGrid(id)
CheckAppUI.getGrid(id)
```

## Capacidades oficiales

- búsqueda general
- filtros externos
- ordenamiento
- paginación cliente
- selector de columnas
- exportación Excel
- sticky header
- scroll horizontal controlado
- zebra rows
- mobile cards
- estados `loading`, `empty`, `error`
- acciones por fila
- footer externo con rango, página y tamaños

## Contrato mínimo

```javascript
CheckAppUI.createDynamicGrid({
  id: "mi-grid",
  hostSelector: "#gridHost",
  tableSelector: "#grDatos",
  searchInputSelector: "#txBusqueda",
  exportButtonSelector: "#btExcel",
  columnToggleButtonSelector: "#btColumnas",
  columnTogglePanelSelector: "#panelColumnas",
  resultCountSelector: "#txConteo",
  footerRangeSelector: "#txRango",
  footerPageIndicatorSelector: "#txPagina",
  footerPrevButtonSelector: "#btPrev",
  footerNextButtonSelector: "#btNext",
  footerPageSizeSelector: "#pageSize",
  pageLength: 25,
  lengthMenu: [[25, 50, 100], [25, 50, 100]],
  columns: [
    { key: "folio", title: "Folio" },
    { key: "nombre", title: "Nombre" }
  ],
  loadData: async function () {
    return [];
  }
});
```

## Reglas obligatorias

1. El grid vive dentro de `checkapp-grid-scroll`.
2. El footer premium vive fuera del scroll horizontal.
3. El selector de columnas no crea ni destruye columnas; solo cambia visibilidad.
4. La exportación usa los registros filtrados y las columnas visibles exportables.
5. El móvil prioriza cards legibles, no tabla horizontal ilegible.
6. Si un módulo necesita una capacidad nueva, se amplía `checkapp-ui.js`; no se crea una variante local.

## Exportación Excel

Comportamiento oficial:

- usa `SheetJS` local;
- exporta los registros filtrados;
- omite columnas con `exportable: false`;
- respeta visibilidad de columnas;
- conserva valores limpios y formatos;
- permite nombre de archivo por pantalla.

## Footer premium

El footer oficial debe mostrar:

- rango visible `Mostrando X-Y de Z`
- página actual `Página N de M`
- navegación `‹ ›`
- chips `25 / 50 / 100`

## Responsive

Breakpoints base:

- `1440`
- `1280`
- `1024`
- `768`
- `430`
- `390`
- `360`

Comportamiento:

- desktop y tablet: tabla + footer externo;
- móvil: cards del grid;
- sin overflow accidental.

## Estados

Todos los grids oficiales deben cubrir:

- `loading`: feedback visible mientras carga;
- `empty`: sin resultados con mensaje útil;
- `error`: fallo operativo sin tecnicismos.

## Extensión controlada

Está permitido ampliar `CheckAppDynamicGrid` solo si:

- la necesidad se valida en una pantalla real;
- el cambio se implementa en el patrón;
- la documentación se actualiza;
- la mejora queda reusable para todos los módulos.
