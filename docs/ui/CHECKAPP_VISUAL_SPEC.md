# CheckApp Visual Spec

**Versión:** 1.0  
**Fecha:** 2026-07-25

## Objetivo

Fijar la especificación visual exacta del sistema de diseño CheckApp ya construido en MVC.

Toda variación futura debe compararse contra este documento y contra `/CheckApp/Pattern`.

## Paleta oficial

| Token | Valor |
|---|---|
| `--checkapp-color-primary` | `#EC0000` |
| `--checkapp-color-primary-dark` | `#CC0000` |
| `--checkapp-color-primary-deeper` | `#990000` |
| `--checkapp-color-surface` | `#FBF1EA` |
| `--checkapp-color-surface-alt` | `#FFFFFF` |
| `--checkapp-color-border` | `#E6E1DC` |
| `--checkapp-color-text` | `#1A1A1A` |
| `--checkapp-color-muted` | `#6B7280` |
| `--checkapp-color-excel` | `#1D6F42` |
| `--checkapp-color-success` | `#16A34A` |
| `--checkapp-color-warning` | `#D97706` |
| `--checkapp-color-error` | `#DC2626` |
| `--checkapp-color-info` | `#2563EB` |

## Radio y sombras

| Token | Valor |
|---|---|
| `--checkapp-radius-sm` | `8px` |
| `--checkapp-radius-md` | `14px` |
| `--checkapp-radius-lg` | `20px` |
| `--checkapp-shadow-sm` | `0 1px 4px rgba(17, 24, 39, 0.06)` |
| `--checkapp-shadow-md` | `0 4px 16px rgba(17, 24, 39, 0.08)` |
| `--checkapp-shadow-lg` | `0 8px 32px rgba(17, 24, 39, 0.12)` |

## Tipografía

| Elemento | Regla |
|---|---|
| Kicker | uppercase, `0.76rem`, `font-weight: 800`, tracking amplio |
| Título principal | `clamp(1.45rem, 1.9vw, 1.95rem)`, `font-weight: 900` |
| Texto auxiliar | `var(--checkapp-color-muted)` |
| Botón | `0.84rem`, `font-weight: 800` |
| Encabezado de tabla | `0.74rem`, uppercase, `font-weight: 800` |

## Header

| Propiedad | Valor oficial |
|---|---|
| Fondo | transparente sobre `--checkapp-color-surface` |
| Borde inferior | `1px` con mezcla cálida |
| Línea de identidad | `2.5rem x 2px` en rojo principal |
| Radio | `0` |
| Distribución | copy izquierda, acciones derecha, wrap en móvil |

## Toolbar

| Propiedad | Valor oficial |
|---|---|
| Altura de botón | `40px` |
| Radio de botón | `10px` |
| Botón primario | rojo principal |
| Botón neutral | blanco con borde cálido |
| Botón Excel | verde Excel |
| Gap base | `0.6rem` |

## Cards

| Propiedad | Valor oficial |
|---|---|
| Fondo | blanco |
| Borde | `1px solid #E6E1DC` |
| Radio | `14px` |
| Sombra | `shadow-sm` |
| Acento resumen | línea lateral roja `3px` |

## Inputs y Selects

| Propiedad | Valor oficial |
|---|---|
| Altura mínima | `40px` |
| Radio | `10px` |
| Border | `1px solid #E6E1DC` |
| Label | visible, `0.84rem`, `700` |
| Focus ring | halo rojo tenue |

## FilterAccordion

| Propiedad | Valor oficial |
|---|---|
| Trigger | ancho completo |
| Estado | abierto/cerrado sin desmontar contenido |
| Resumen | visible, texto o HTML |
| Cuerpo | transición con `grid-template-rows` |
| Accesibilidad | `aria-expanded` obligatorio |

## DynamicGrid

| Propiedad | Valor oficial |
|---|---|
| Header fijo | sí |
| Fondo `th` | `#F7F3EF` |
| Zebra rows | blanco / crema suave |
| Hover | rojo sutil |
| Scroll horizontal | contenedor controlado |
| Footer | externo al scroll |
| Page sizes | `25 / 50 / 100` |
| Móvil | cards |

## Estados

| Estado | Regla |
|---|---|
| Loading | superficie cálida con borde rojo tenue |
| Empty | superficie muy suave con mensaje de continuidad |
| Error | superficie contenida con borde de error, sin tecnicismos |

## Modal

| Propiedad | Valor oficial |
|---|---|
| Radio | `20px` |
| Fondo | blanco |
| Sombra | `shadow-lg` |
| Header/Footer | limpios, sin borde duro |
| Body | misma retícula de formulario del patrón |

## Responsive

Breakpoints obligatorios:

- `1440`
- `1280`
- `1024`
- `768`
- `430`
- `390`
- `360`

Reglas:

- sin overflow horizontal accidental;
- toolbar wrapea;
- grid desktop desaparece en móvil;
- cards móviles toman el relevo;
- botones táctiles permanecen utilizables.
