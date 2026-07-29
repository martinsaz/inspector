# NO APROBADO / NO EJECUTAR

Este paquete quedó descartado el `2026-07-29`.

## Motivo

- proponía agregar `idActivo` directo a `dbo.ListasRespuestas`
- no modelaba una cabecera formal de inspección
- fue reemplazado por el paquete basado en `dbo.ListasInspecciones`

## Estado vigente

- conservar solo como evidencia histórica
- no ejecutar `UP`
- no ejecutar `DOWN`
- usar en su lugar:
  - `bl26-listas-inspecciones-respaldo.sql`
  - `bl26-listas-inspecciones-up.sql`
  - `bl26-listas-inspecciones-down.sql`
  - `bl26-listas-inspecciones-impacto.md`
