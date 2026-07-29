# Patrón CheckApp

**Versión:** 2.0  
**Fecha:** 2026-07-25

## Estado oficial

El Patrón CheckApp ya no es una intención documental ni una implementación parcial.

Desde esta fecha existe una sola base oficial para `ASP.NET Core MVC`, `Razor`, `jQuery`, `Bootstrap` y `DataTables`, validada exclusivamente sobre:

- `/CheckApp/Pattern`

## Fuente de verdad

Artefactos oficiales del patrón:

- `checklist/wwwroot/css/checkapp-theme.css`
- `checklist/wwwroot/js/checkapp-ui.js`
- `checklist/Views/CheckApp/Pattern.cshtml`
- `checklist/wwwroot/js/CheckApp/Pattern.js`
- `docs/ui/PATRON_CHECKAPP.md`
- `docs/ui/PATRON_CHECKAPP_PRO.md`
- `docs/ui/CHECKAPP_COMPONENTES.md`
- `docs/ui/CHECKAPP_VISUAL_SPEC.md`
- `docs/ui/CERTIFICACION_PATRON_CHECKAPP.md`

## Referencia obligatoria

CheckApp adopta como referencia visual y operativa el material original de Tarahumara entregado por Product Owner:

- `TarahumaraPro.md`
- `tarahumara-theme.css`
- `tarahumara-secondary.css`
- `TarahumaraDynamicGrid`
- `FilterAccordion`
- documentación UI oficial

La adaptación a MVC debe conservar:

- la misma jerarquía visual
- la misma densidad operativa
- la misma semántica de color
- la misma lógica de toolbar, filtros, grid, footer y modal
- la misma disciplina responsive

## Principios obligatorios

1. Claridad operativa antes que decoración.
2. Un único grid reusable: `CheckAppDynamicGrid`.
3. Un único panel plegable reusable: `CheckAppFilterAccordion`.
4. Estados `loading`, `empty` y `error` siempre visibles y consistentes.
5. Responsive real en desktop, tablet y móvil.
6. Sin hardcodes visuales cuando exista token CheckApp.
7. Sin variantes locales por módulo.
8. Sin mover lógica de negocio al frontend.

## Tokens oficiales

CheckApp conserva nombres propios `--checkapp-*`, pero sus valores oficiales convergen al estándar Tarahumara:

- `--checkapp-color-primary`: rojo principal
- `--checkapp-color-surface`: crema cálido de página
- `--checkapp-color-surface-alt`: blanco de panel
- `--checkapp-color-border`: borde cálido
- `--checkapp-color-text`: texto principal
- `--checkapp-color-muted`: texto secundario
- `--checkapp-color-excel`: verde Excel
- `--checkapp-shadow-sm`, `--checkapp-shadow-md`
- `--checkapp-radius-sm`, `--checkapp-radius-md`, `--checkapp-radius-lg`

La especificación exacta vive en `docs/ui/CHECKAPP_VISUAL_SPEC.md`.

## Componentes oficiales

Componentes cubiertos por el patrón:

- Header
- Toolbar
- Cards
- Inputs
- Selects
- Botones
- CheckAppFilterAccordion
- CheckAppDynamicGrid
- Footer de paginación externo
- Selector de columnas
- Modal
- Loading
- Empty
- Error
- Badges y chips
- Responsive
- Espaciados
- Sombras
- Bordes
- Microinteracciones

## Regla de implementación

Cuando una tarea futura indique:

> `Aplica el Patrón CheckApp`

eso significa:

1. leer esta documentación;
2. reutilizar los artefactos oficiales ya existentes;
3. adaptar la pantalla sin rediseñar componentes base;
4. certificar build, flujo principal y responsive.

## Alcance actual

El patrón se construye y certifica en el laboratorio `/CheckApp/Pattern`.

No autoriza por sí mismo:

- cambiar módulos funcionales;
- cambiar permisos;
- cambiar controladores de negocio;
- cambiar API;
- cambiar navegación.

## Criterio de aceptación

Una pantalla que adopte CheckApp correctamente debe:

- reutilizar `checkapp-theme.css`;
- reutilizar `checkapp-ui.js`;
- usar `CheckAppDynamicGrid` si hay listados;
- usar `CheckAppFilterAccordion` si hay filtros plegables;
- conservar funcionalidad aprobada;
- pasar build;
- validar estados y responsive.
