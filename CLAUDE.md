# CLAUDE

## Patron CheckApp

- Antes de modificar una pantalla, lee `AGENTS.md` y la documentacion de `docs/ui/`.
- Si la tarea impacta UI, ejecuta este flujo:
  - audita comportamiento actual
  - detecta riesgos funcionales y responsive
  - implementa con cambios minimos
  - valida que no se rompa el flujo principal
  - documenta evidencia y pendientes
- Usa la paleta y tokens definidos documentalmente en `docs/ui/PATRON_CHECKAPP.md`.
- No dejes colores hardcodeados cuando exista token definido por el Patron CheckApp.
- Para tablas y listados reutilizables converger al futuro componente oficial `CheckAppDynamicGrid`.
- Para paneles de filtros plegables converger al futuro componente oficial `CheckAppFilterAccordion`.
- Desde `2026-07-24` la implementación técnica oficial inicial ya existe en:
  - `checklist/wwwroot/css/checkapp-theme.css`
  - `checklist/wwwroot/js/checkapp-ui.js`
  - `docs/ui/CHECKAPP_COMPONENTES.md`
- Toda pantalla debe contemplar `loading`, `empty state`, `error state` y mobile real.
- No muevas logica de negocio al frontend.
- No cambies contratos, permisos, sesion o persistencia sin instruccion explicita.
- Cuando no puedas completar una auditoria o QA, dejalo documentado con fecha `2026-07-24` y el bloqueo real.
