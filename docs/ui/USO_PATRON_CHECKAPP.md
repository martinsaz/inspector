# Uso del Patron CheckApp

## Instruccion canonica

Para cualquier agente o desarrollador:

> Lee `AGENTS.md` y `CLAUDE.md`.  
> Aplica el Patron CheckApp.  
> Audita primero.  
> Reutiliza la implementación oficial ya existente.  
> No rompas funcionalidad.  
> Utiliza `CheckAppDynamicGrid` y `CheckAppFilterAccordion` donde aplique.

## Flujo esperado

1. Lee `AGENTS.md`.
2. Lee `CLAUDE.md` si el agente opera bajo ese contrato.
3. Lee:
   - `docs/ui/PATRON_CHECKAPP.md`
   - `docs/ui/PATRON_CHECKAPP_PRO.md`
   - `docs/ui/PATRON_CHECKAPP_SECUNDARIO.md`
4. Audita la pantalla actual.
5. Documenta brechas funcionales, visuales y responsive.
6. Implementa con cambios minimos solo cuando exista autorizacion tecnica expresa.
7. Verifica estados `loading`, `empty` y `error`.
8. Valida build y regresion del flujo principal.

## Reglas duras

- No hardcodear colores si existe token CheckApp.
- No crear grids paralelos; se debe reutilizar `CheckAppDynamicGrid`.
- No dejar mensajes tecnicos visibles.
- No trasladar logica de negocio al frontend.
- No tocar persistencia ni contratos sin aprobacion.

## Cuando usar CheckAppDynamicGrid

Debe usarse en cualquiera de estos casos:

- tablas de consulta
- listados administrativos
- reportes con exportacion
- catalogos con paginacion y filtros

## Cuando usar CheckAppFilterAccordion

Debe usarse cuando:

- haya filtros avanzados
- el espacio vertical importe
- el usuario necesite ver un resumen rapido del contexto activo

## Resultado esperado

Una pantalla CheckApp correcta:

- se siente rapida
- se entiende sin explicacion tecnica
- mantiene consistencia con el resto del sistema
- funciona en desktop, tablet y movil
- conserva la funcionalidad aprobada

## Implementacion oficial

La implementación técnica oficial existe en:

- `checklist/wwwroot/css/checkapp-theme.css`
- `checklist/wwwroot/js/checkapp-ui.js`
- `docs/ui/CHECKAPP_COMPONENTES.md`

La pantalla laboratorio oficial es `CheckApp/Pattern`.
Las adopciones por módulo deben partir de esta base certificada.
