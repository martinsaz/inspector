# #MOKA — Ticket 10: QA final de unidades

Fecha: 2026-09-07. Aplicación real: frontend `http://localhost:5200`, API `http://localhost:5127`. Sesión del PO conservada. Empresa visible: UMBRELLA.

**Dictamen: catálogo y CRUD verificados después de dos correcciones; certificación integral pendiente por falta de ejecución del motor real de conversiones dentro del alcance permitido.** No se declara el ticket cerrado ni aprobado.

`PASS` significa prueba satisfactoria. `FAIL — cobertura pendiente` significa requisito de certificación no satisfecho; no afirma que una conversión ejecutada haya producido un resultado incorrecto.

## CATÁLOGO

| Control | Resultado |
|---|---|
| Sistema 53/53 activas | PASS |
| Peso 8/8 | PASS |
| Volumen 14/14 | PASS |
| Longitud 10/10 | PASS |
| Área 11/11 | PASS |
| Por artículo 1/1 | PASS |
| Tiempo 9/9 | PASS |
| Excluidas ausentes | PASS |
| Duplicados semánticos | 0; PASS |

Se contrastaron las claves de las 53 unidades con el conjunto exacto del ticket, además de unicidad de nombre, abreviatura y clave normalizados por espacios exteriores/casing. No aparecen las 13 unidades excluidas. Las cuatro unidades Año, Lustro, Década y Siglo tienen `Convertible=false` y factor nulo; ms, s, min, h y d son convertibles. Pieza es Sistema y no convertible.

Observación de nomenclatura: Galón US aparece con abreviatura **US gal**, equivalente semántico de **gal US** usado en el ticket; no es galón imperial ni otra unidad.

## MODAL

| Control | Resultado |
|---|---|
| Modal real abre | PASS |
| Una fila Desktop | PASS |
| Nombre 2 columnas | PASS; proporción 2:1:1 |
| Abreviatura 1 columna | PASS |
| Permite decimales 1 columna | PASS |
| Tipo ausente | PASS |
| Sin segunda fila de campos Desktop | PASS |
| Sin aire innecesario | PASS visual |
| Footer compacto | PASS visual |

Se cerró el modal inicialmente abierto, se abrió Nueva unidad desde su botón real y se completó alta y edición. No fue necesario reparar el botón ni cambiar código para automatizarlo. Las respuestas asíncronas y confirmaciones se esperaron hasta verificar su resultado; los intentos intermedios no se contabilizaron como fallos del botón.

## AYUDA

| Control | Resultado |
|---|---|
| ? visible en encabezado | PASS |
| Popover por click | PASS; también en viewport móvil |
| Texto correcto | PASS |
| Cierre correcto | PASS; segundo click y `aria-expanded=false` |
| Sin overflow | PASS tras corrección móvil |

Título: **Unidades personalizadas**.

Texto comprobado: “Las unidades estándar de peso, volumen, longitud, área, por artículo y tiempo ya están incluidas en CheckApp. Agrega aquí únicamente unidades propias de tu operación, como caja, paquete o tarima.”

Se probó interacción del navegador en viewport móvil; no se utilizó un teléfono físico ni un evento táctil de dispositivo real.

## PERSONALIZADA

| Control | Resultado |
|---|---|
| Caja QA creada | PASS: Caja QA T10 / CJA-QA / decimales No |
| OTHER automático | PASS; API y tabla |
| Origen Personalizada | PASS; `EsSistema=false`, `EsPersonalizada=true` |
| Activo Sí al crear | PASS |
| Guardar/F5/Editar | PASS |
| Tipo ausente en edición | PASS |
| Nombre, abreviatura y decimales editables | PASS |
| No transformable en Sistema | PASS; prueba HTTP con campos manipulados |

ID temporal: `ec00676c-e697-47ac-a5af-1b8f643dec21`. La UI guardó **Caja QA T10 editada / CJA-QA-E / decimales Sí**; después de F5 la reapertura conservó los tres valores. Una edición directa a API envió `TipoUnidad=WEIGHT`, `EsSistema=true`, `EsPersonalizada=false`, `FactorConversion=100`, `Convertible=true`: el GET posterior mantuvo **OTHER / false / true / factor nulo / no convertible**. Esa prueba restituyó nombre y abreviatura originales antes de la limpieza.

## DUPLICADOS

| Control | Resultado |
|---|---|
| Kilogramo/kg bloqueado | PASS en UI y HTTP 400 |
| KILOGRAMO/KG bloqueado | PASS en UI y HTTP 400 |
| Metro/m normalizado bloqueado | PASS: `  mEtRo  ` / ` M ` |
| Caja duplicada bloqueada | PASS, incluyendo casing diferente |
| Backend protege duplicados | PASS |
| Mensajes funcionales correctos | PASS tras corrección |

Defecto reproducido inicialmente: todos los duplicados recibían “Ya existe una unidad con el mismo nombre o abreviatura.”

Corrección: la consulta existente identifica primero si coincide una unidad Sistema; mantiene transacción serializable, contexto de empresa y exclusión del ID editado. Se conserva el contrato existente `mensaje` y el estado HTTP 400. El frontend presenta el título y explicación cuando el backend determina un duplicado Sistema.

Mensajes finales comprobados:

- **Esta unidad ya está disponible** / **La unidad que intentas crear ya forma parte de las unidades estándar de CheckApp.**
- **Ya existe una unidad con ese nombre o abreviatura.**

## SISTEMA

| Control | Resultado |
|---|---|
| Sistema protegido | PASS |
| Edición bloqueada | PASS, HTTP 400 |
| Baja bloqueada | PASS, HTTP 400 |
| Tipo visible en tabla | PASS |
| Cambio de Tipo/Factor desde CRUD normal | Bloqueado; PASS |

Muestras verificadas: Kilogramo, Litro, Metro, Metro cuadrado, Pieza y Hora. Las seis muestran Sistema/Protegida sin enlaces Editar/Baja; las doce solicitudes directas de edición y baja fueron rechazadas. Edición envió también un factor distinto y `TipoUnidad=OTHER`, sin modificar las unidades.

## CONVERSIONES

| Control obligatorio con motor real | Resultado |
|---|---|
| kg ↔ lb | FAIL — cobertura pendiente |
| m ↔ ft | FAIL — cobertura pendiente |
| cm ↔ in | FAIL — cobertura pendiente |
| km ↔ mi | FAIL — cobertura pendiente |
| L ↔ fl oz US | FAIL — cobertura pendiente |
| L ↔ gal US | FAIL — cobertura pendiente |
| m² ↔ ft² | FAIL — cobertura pendiente |
| Conversiones métricas | FAIL — cobertura pendiente |
| Incompatibles bloqueadas en backend | FAIL — cobertura pendiente |
| Precisión ida/vuelta | FAIL — cobertura pendiente |

**Causa concreta:** la búsqueda del código C# y JS activo localizó la conversión en `GuardarPresentacionVentaProductoServicio` y `GuardarPresentacionesInicialesAsync`. No se encontró una operación independiente de conversión de unidades. La primera depende de un producto y puede escribir Presentaciones y Precio Público; la segunda forma parte del guardado de productos. La UI correspondiente también pertenece a Presentaciones. El motor `ProductoPresentacionVentaPricingEngine` calcula combinaciones de presentaciones, no conversiones generales de unidades.

El ticket prohíbe tocar Productos, Presentaciones y Precios. No se invocaron esas operaciones para fabricar cobertura ni se agregó un endpoint exclusivamente para las pruebas. Se completó el resto de la QA; este bloqueo no proviene de selectors, stale elements, sesión ni apertura del modal.

**Diagnóstico complementario, que no sustituye al motor real:** los factores obtenidos por HTTP permiten calcular las 23 conversiones solicitadas y coinciden con los valores esperados. Se documentaron cocientes con aritmética decimal en `factores-diagnostico.json`. Los pares kg→L, cm→kg, m²→L, Hora→kg y Pieza→m son incompatibles conforme a los tipos/flags y al código inspeccionado, pero no se certificó su rechazo ejecutando el flujo de aplicación.

**Precisión pendiente:** las dos rutas existentes redondean `cantidad × factorOrigen / factorDestino` a **4 decimales**. El JS también aplica `toFixed(4)`. La reproducción diagnóstica de esa fórmula da, por ejemplo, lb→kg = **0.4536**, fl oz→L = **0.0296** y L→gal→L = **1.0001**. Son resultados calculados fuera del motor, no respuestas observadas de esos endpoints. Es necesario decidir la precisión requerida y verificarla en el flujo real cuando se habilite el alcance correspondiente.

## RESPONSIVE

| Control | Resultado |
|---|---|
| Desktop | PASS |
| Tablet | PASS; una fila a 820 px CSS |
| Móvil | PASS tras corrección; 390 px CSS |
| Overflow horizontal del modal | NO |
| Botones fuera / inputs cortados | NO después de corrección |

Defecto inicial en 390 px CSS: el selector de tres columnas de unidades tenía más especificidad que el reflow genérico. El checkbox salía del recuadro y la abreviatura quedaba estrecha. Se agregó una media query sólo para el formulario de unidades a ≤575.98 px, con una columna y filas automáticas. Se repitieron móvil con ayuda abierta y tablet; Desktop conserva la proporción 2:1:1.

El navegador tenía zoom preexistente; las dimensiones se verificaron en el DOM, no se asumieron por el tamaño solicitado al controlador. En móvil, `clientWidth=scrollWidth=390` y todos los controles del modal quedan dentro del viewport. Se restauró el viewport al terminar.

## REGRESIÓN

| Control | Resultado |
|---|---|
| Aceite conserva Pieza Sistema | PASS; UI + relación por ID en API |
| Cambio Aceite conserva Unidad de servicio | PASS; UI + API |
| Productos modificados | NO |
| Presentaciones modificadas | NO |
| Precios modificados | NO |
| IVA modificado | NO |
| Ticket 08 modificado | NO |
| POS modificado | NO |
| Inventario modificado | NO |
| Login/Auth modificado | NO |

Se visitó el listado de Productos y Servicios exclusivamente para inspección visual. No se guardó ningún producto ni servicio. La sesión autenticada se conservó; no se reinició el frontend. Las modificaciones anteriores presentes en ambos repositorios no se atribuyen a esta QA ni se revirtieron.

## LIMPIEZA

| Control | Resultado final |
|---|---|
| Pack QA limpio | PASS; baja lógica, historial conservado |
| Caja QA limpia | PASS; baja lógica, historial conservado |
| Personalizadas activas | 2: Unidad de servicio y Actividad |
| Sistema activas | 53 |
| Total activas | 55 |
| QA activas adicionales | 0 |

El listado completo contiene 57 registros al incluir las dos bajas históricas. Eso no equivale a 57 activas. El catálogo final se dejó con filtro **Activos**.

## CONTROL

- Código modificado durante esta QA: tres archivos; backend de duplicados, JS del aviso Sistema y CSS del reflow móvil de unidades. El parche de esta corrida está separado de los cambios preexistentes.
- SQL adicional manual: **ninguno**. No se ejecutaron scripts ni consultas ad hoc sobre la base. Se ajustó la consulta SELECT de duplicados dentro del CRUD para corregir el defecto reproducido; los datos QA se gestionaron con UI/API.
- Migraciones adicionales: **ninguna**.
- Build frontend: **PASS**, 0 errores, 9 advertencias de paquetes existentes.
- Build API: **PASS**, 0 errores, 785 advertencias existentes.
- JavaScript `node --check`: **PASS**.
- 5200 funcionando: **Sí**; PID 88875 conservado.
- 5127 funcionando: **Sí**; API recompilada y relanzada, PID 89624.
- Defectos encontrados y corregidos: **2** — mensajes de duplicados y reflow móvil.
- Excepción de cobertura: conversión disponible únicamente dentro del alcance expresamente pausado.
- Pendientes REALES: ejecutar las conversiones/incompatibles/ida-vuelta con el motor real; resolver la precisión exigida frente al redondeo existente a cuatro decimales. No declarar certificadas esas pruebas con los cálculos independientes.
- Dictamen: **QA de catálogo, modal, ayuda, CRUD, protección, responsive y limpieza satisfactoria tras correcciones. Certificación integral de conversiones pendiente.**

## EVIDENCIAS

- [Catálogo final y flags reales](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/catalogo-final-api.json)
- [18 pruebas directas de backend](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/backend-pruebas.json)
- [Factores: diagnóstico sin certificar motor](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/factores-diagnostico.json)
- [Regresión por API](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/regresion-api.json)
- [Parche exclusivo de esta corrida](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/cambios-solo-esta-qa.patch)
- [Build frontend](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/build-frontend.log)
- [Build API](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/build-api.log)
- [Desktop final](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/11-desktop-modal-final.png)
- [Tablet 820 px CSS](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/05-tablet-820-ayuda.png)
- [Móvil corregido 390 px CSS](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/04-movil-corregido-ayuda.png)
- [Métricas de contención móvil](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/mobile-metrics.json)
- [Mensaje Sistema corregido](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/06-duplicado-sistema-corregido.png)
- [Mensaje Personalizada corregido](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/07-duplicado-personalizado.png)
- [Edición persistida tras F5](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/01-desktop-edicion-f5.png)
- [Regresión visual productos](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/09-regresion-unidades-productos.png)
- [55 activas finales](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/unidades-ticket10-20260907/10-catalogo-final-55-activas.png)
