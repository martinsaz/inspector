# #MOKA — Certificación final del motor de conversiones

2026-09-07. Únicamente se ejecutó el pendiente de conversiones. No se repitieron las pruebas previamente aprobadas de catálogo, CRUD, modal, duplicados, protección o responsive.

**MOTOR DE CONVERSIONES MÉTRICO + INGLÉS/US CERTIFICADO — CATÁLOGO Y CRUD DE UNIDADES LISTOS PARA QA DEL PRODUCT OWNER.**

Certificación conforme a la escala existente **DECIMAL(18,4)** del consumidor Presentaciones, con factores **DECIMAL(28,12)**. No equivale a afirmar que se conservan diez o doce decimales en EquivalenciaBase. La QA funcional/visual restante de Precios y Presentaciones continúa separada. No se declara Ticket 10 cerrado.

## Separación de precisión A/B/C/D

- **A — Interno real:** el runner invocó `GuardarPresentacionVentaProductoServicio` de la DLL compilada de producción y leyó `request.EquivalenciaBase` después de ejecutarlo. Ese método redondea explícitamente a 4 decimales antes de persistir. No es un cálculo simulado.
- **B — Persistido:** lectura SQL directa de cada presentación QA. EquivalenciaBase y CantidadVenta son `DECIMAL(18,4)`; FactorConversion es `DECIMAL(28,12)`.
- **C — API:** GET HTTP real `ObtenerProductoServicio`, campo `presentacionesVenta[].equivalenciaBase`. Coincide numéricamente con A y B en los 30 casos y en las ocho etapas de ida/vuelta. El POST de guardado retorna ID y mensaje; no retorna la equivalencia.
- **D — UI:** el editor real ejecuta `.toFixed(4)` y mostró `1 kg → 2.2046 lb`. No se cambió el formato. La tabla puede omitir ceros finales mediante `formatMeasure(...,4)`.

**No es exclusivamente redondeo visual:** el backend también cuantiza a la escala que la base de datos define. El resultado cumple esa precisión vigente. Exigir más decimales persistidos requeriría una decisión distinta sobre EquivalenciaBase, expresamente fuera de esta iteración.

Criterio numérico: comparación decimal, sin igualdad de strings. Para una operación, error de cuantización ≤0.00005 unidades destino contra el cociente de factores canónicos. Para ida/vuelta, cota = `0.00005 × (factorIntermedio/factorOrigen + 1)`. Los factores canónicos no presentan error incorrecto comprobado en esta matriz; fl oz usa la aproximación canónica a 12 posiciones decimales propia de su columna.

## PESO, LONGITUD, VOLUMEN, ÁREA Y MÉTRICO

Todos los casos parten de cantidad 1. La columna “Interno = SQL = API” es el valor observado en las tres capas. “Error absoluto” compara contra el cociente de factores, no contra strings ni contra un texto visual truncado.

| Nº | Conversión | Interno = SQL = API | Error absoluto | Resultado |
|---:|---|---:|---:|---|
| 1 | kg → lb | 2.2046 | 0.00002262184878 | PASS |
| 2 | lb → kg | 0.4536 | 0.00000763 | PASS |
| 3 | kg → oz | 35.274 | 0.00003805041959 | PASS |
| 4 | oz → g | 28.3495 | 0.000023125 | PASS |
| 5 | m → ft | 3.2808 | 0.00003989501312 | PASS |
| 6 | ft → m | 0.3048 | 0.0000 | PASS |
| 7 | cm → in | 0.3937 | 7.874015748e-7 | PASS |
| 8 | in → cm | 2.54 | 0.00 | PASS |
| 9 | km → mi | 0.6214 | 0.00002880776267 | PASS |
| 10 | mi → km | 1.6093 | 0.000044 | PASS |
| 11 | L → fl oz US | 33.814 | 0.00002270241469 | PASS |
| 12 | fl oz US → L | 0.0296 | 0.000026470438 | PASS |
| 13 | L → gal US | 0.2642 | 0.00002794764185 | PASS |
| 14 | gal US → L | 3.7854 | 0.000011784 | PASS |
| 15 | m² → ft² | 10.7639 | 0.00001041670972 | PASS |
| 16 | ft² → m² | 0.0929 | 0.00000304 | PASS |
| 17 | kg → g | 1000.0 | 0.0 | PASS |
| 18 | g → mg | 1000.0 | 0.0 | PASS |
| 19 | mg → µg | 1000.0 | 0.0 | PASS |
| 20 | km → m | 1000.0 | 0.0 | PASS |
| 21 | m → cm | 100.0 | 0.0 | PASS |
| 22 | cm → mm | 10.0 | 0.0 | PASS |
| 23 | mm → µm | 1000.0 | 0.0 | PASS |
| 24 | L → mL | 1000.0 | 0.0 | PASS |
| 25 | L → dL | 10.0 | 0.0 | PASS |
| 26 | L → cL | 100.0 | 0.0 | PASS |
| 27 | cm³ → mL | 1.0 | 0.0 | PASS |
| 28 | dm³ → L | 1.0 | 0.0 | PASS |
| 29 | m³ → L | 1000.0 | 0.0 | PASS |
| 30 | m² → cm² | 10000.0 | 0.0 | PASS |

## INCOMPATIBLES Y NO CONVERTIBLES

Estas pruebas se enviaron como requests HTTP POST reales al endpoint de guardado de Presentaciones. No dependen de opciones ocultas del combo. Todas devolvieron HTTP 400 y **“La unidad de venta no es compatible con la unidad base.”** No se insertaron presentaciones incompatibles.

| Nº | Prueba | Resultado |
|---:|---|---|
| 31 | kg → L, backend bloqueado | PASS |
| 32 | cm → kg, backend bloqueado | PASS |
| 33 | m² → L, backend bloqueado | PASS |
| 34 | Hora → kg, backend bloqueado | PASS |
| 35 | Pieza → m, backend bloqueado | PASS |
| 36 | Año → Día bloqueado | PASS |
| 37 | Lustro/Década/Siglo sin factor | PASS; factor nulo y Convertible=false. También se probaron los tres hacia Día: HTTP 400 |

## PRECISIÓN IDA/VUELTA

La entrada de vuelta se tomó del valor interno del controlador en la ida, nunca del texto visual. Los valores de UI que se presentan a continuación expresan el formato vigente de hasta cuatro decimales; se verificó visualmente su funcionamiento con kg→lb, no se hicieron capturas de los cuatro recorridos completos.

| Nº | Recorrido | Interno ida | Interno vuelta = SQL = API | Mostrado, hasta 4 decimales | Resultado |
|---:|---|---:|---:|---|---|
| 38 | kg→lb→kg | 2.2046 | 1.0 | 2.2046 → 1.0000 (puede omitir ceros finales) | PASS |
| 40 | m→ft→m | 3.2808 | 1.0 | 3.2808 → 1.0000 (puede omitir ceros finales) | PASS |
| 42 | L→gal US→L | 0.2642 | 1.0001 | 0.2642 → 1.0001 (puede omitir ceros finales) | PASS |
| 44 | m²→ft²→m² | 10.7639 | 1.0 | 10.7639 → 1.0000 (puede omitir ceros finales) | PASS |

| Nº | Error absoluto de retorno | Cota por escala |
|---:|---:|---:|
| 39 | 0.0 | 0.0000726796185 |
| 41 | 0.0 | 0.000065240 |
| 43 | 0.0001 | 0.00023927058920 |
| 45 | 0.0 | 0.0000546451520 |

- **46. Precisión interna preservada: PASS conforme a DECIMAL(18,4).** El valor interno ya cuantizado coincide con persistencia y API. El volumen retorna 1.0001 L: error 0.0001 L = 0.1 mL = 0.01%; está dentro de la cota 0.00023927058920 L de los dos redondeos. No se atribuye este error a un factor incorrecto.
- **47. UI redondea a 4 decimales: Sí.** MOTOR PASS a la escala vigente; UI REDONDEA A 4 DECIMALES. El backend también lo hace: esta conclusión no oculta esa diferencia frente a un motor de precisión superior.

## CONTROL

| Nº | Control | Resultado |
|---:|---|---|
| 48 | Motor de Presentaciones modificado | NO; tampoco se modificó el cálculo de conversión |
| 49 | UX Presentaciones modificada | NO |
| 50 | POS modificado | NO |
| 51 | Inventario operativo modificado | NO |
| 52 | CRUD Unidades modificado | NO |
| 53 | Login/Auth modificado | NO |
| 54 | SQL ejecutado | Lectura de escala y valores QA; cambio de unidad base sólo del fixture; baja lógica final del fixture y sus presentaciones |
| 55 | Código modificado | Ningún archivo de producción. Runner externo C# y orquestación Python de pruebas |
| 56 | Defectos encontrados en conversión/factores | 0 contra la escala DECIMAL implementada |
| 57 | Defectos corregidos | 0; no hubo cambio funcional |
| 58 | Producto QA limpiado | PASS; inactivo, historial conservado |
| 59 | Presentaciones QA limpiadas | PASS; ninguna presentación QA activa |
| 60 | Productos finales de trabajo = 2 | PASS; QA inactivo no se cuenta como trabajo |
| 61 | Sistema finales = 53 | PASS; conteo final, sin repetir certificación del catálogo |
| 62 | Personalizadas finales = 2 | PASS; conteo final, sin repetir CRUD |
| 63 | 5200 funcionando | Sí |
| 64 | 5127 funcionando | Sí |
| 65 | Pendientes REALES de esta matriz | Ninguno bajo DECIMAL(18,4); ampliar precisión persistida sería alcance posterior |
| 66 | Evidencias | Enlaces abajo |
| 67 | Dictamen | Motor certificado conforme a escala vigente; restante QA de Precios/Presentaciones separada |

Se utilizó **un solo producto**: Producto QA T10 Conversiones, código QA-T10-CONVERSION. Para reutilizarlo se cambió su unidad base entre casos. Esos cambios y la baja final se acotaron por ID, código y nombre QA. No se guardaron Aceite Motor Sintetico ni Cambio de Aceite; no se alteraron sus precios, unidades ni relaciones.

Se conservó sin cambios EquivalenciaBase, el algoritmo de combinaciones, el esquema y la persistencia funcional. No se ejecutaron migraciones. La compilación del runner con referencia al proyecto API pasó; no hubo necesidad de recargar una implementación nueva ni de reiniciar servicios. Las modificaciones preexistentes en los repositorios pertenecen a trabajos anteriores.

## EVIDENCIAS

- [Método reproducible y límites](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/conversiones-ticket10-20260907/METODO.md)
- [30 conversiones: interno, SQL y API](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/conversiones-ticket10-20260907/matriz-real.json)
- [Rechazos HTTP reales](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/conversiones-ticket10-20260907/incompatibles-http.json)
- [Ida/vuelta y errores absolutos](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/conversiones-ticket10-20260907/ida-vuelta-real.json)
- [Escala real en SQL](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/conversiones-ticket10-20260907/schema.json)
- [Identidad del único fixture y factores usados](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/conversiones-ticket10-20260907/fixture.json)
- [Bajas y conteos finales](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/conversiones-ticket10-20260907/limpieza-final.json)
- [Hashes de fuentes y DLL](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/conversiones-ticket10-20260907/fuentes-hashes.json)
- [Conversión automática real en UI](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/conversiones-ticket10-20260907/ui-kg-lb.png)

> Corrección de evidencia posterior: la captura `ui-kg-lb.png` fue tomada antes de limpiar el fixture y contiene filas históricas con la etiqueta de una base cambiada por SQL. No debe usarse como evidencia de coherencia de la tabla. Véase [auditoría y captura corregida](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/inconsistencia-ticket10-20260907/INFORME_MOKA.md). La matriz numérica y su certificación se conservan.
