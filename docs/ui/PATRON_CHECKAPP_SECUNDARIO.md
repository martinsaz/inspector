# Patron CheckApp Secundario

**Version:** 1.0  
**Fecha:** 2026-07-24

## Objetivo

El patron secundario gobierna superficies de apoyo: filtros, paneles colapsables, modales, resumenes, chips y bloques complementarios que acompañan al flujo principal sin distraerlo.

## Principios

- Debe acompañar, no competir.
- Debe resumir contexto con rapidez.
- Debe ahorrar espacio sin ocultar informacion critica.
- Debe mantener continuidad visual con el patron principal.

## CheckAppFilterAccordion

`CheckAppFilterAccordion` es el componente oficial de filtros plegables del Patrón CheckApp.

Comportamiento esperado:

- resumen visible cuando el panel esta abierto o cerrado
- apertura y cierre con una sola accion
- persistencia del contenido sin perder contexto
- iconografia discreta y consistente

## Chips y resumenes

- Usar pills para contexto corto, no para texto largo.
- Los chips activos deben comunicar filtro o estado de forma inmediata.
- Los chips mudos o vacios deben verse claramente secundarios.

## Modales y paneles

- El titulo debe explicar la accion.
- El texto auxiliar debe orientar, no documentar.
- Botones principales y de cancelacion deben ser inequívocos.
- En movil deben ocupar el ancho necesario sin cortar contenido.

## Campos y filtros

- Labels siempre visibles.
- Placeholder como ayuda, no como reemplazo del label.
- Acciones de limpiar o resetear deben ser seguras y claras.

## Estados secundarios

- `loading`: visible sin bloquear mas de lo necesario
- `empty`: util y orientado a siguiente accion
- `error`: claro, sin tecnicismos y con opcion de recuperacion cuando aplique

## Anti-patrones

- Acordeones sin resumen.
- Filtros escondidos sin evidencia del estado actual.
- Modales densos con tres jerarquias compitiendo a la vez.
- Chips con color semantico dominante en toda la pantalla.

## Alcance de este documento

- Este documento define el patron secundario ya implementado en `/CheckApp/Pattern`.
- La implementación técnica oficial vive en `checkapp-theme.css` y `checkapp-ui.js`.
- Las pantallas futuras deben reutilizar esta base; no redefinirla.
