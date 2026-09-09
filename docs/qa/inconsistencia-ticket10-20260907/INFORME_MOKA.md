# #MOKA — Inconsistencia visible del banco QA

**INCONSISTENCIA QA DEPURADA — CONVERSIONES INCOMPATIBLES BLOQUEADAS — CERTIFICACIÓN DEL MOTOR CONSERVADA.**

## Causa demostrada y corrección de la evidencia

**Clasificación E: inconsistencia introducida por la preparación del banco QA.** No fue una presentación comercial, un producto ajeno ni un guardado cm→lb aceptado por el motor. Tampoco era un dato creado antes de las protecciones actuales.

Durante la matriz anterior Codex reutilizó un único producto cambiando por SQL su unidad base entre pruebas. `QA CM a IN matrix` se creó cuando la base era **Pulgada / LENGTH**, con venta **1 Centímetro / LENGTH**, y persistió **0.3937**. Después el runner puso la base del producto en **Libra / WEIGHT** para la captura kg→lb, sin retirar primero las presentaciones de las direcciones anteriores. La tabla muestra la abreviatura de la base actual junto al valor persistido: así apareció **0.3937 lb**, aunque no se recalculó cm→lb.

Esta preparación SQL del fixture evitó la restricción normal del CRUD que impide cambiar la unidad base con presentaciones activas. La evidencia visual entregada por Codex fue incorrecta como demostración de una tabla coherente. La responsabilidad de esa inconsistencia corresponde al banco de pruebas, no al motor certificado.

Cronología comprobada:

- Creación de la fila: **2026-09-07 18:49:26 UTC** (12:49:26 México).
- Captura anterior `ui-kg-lb.png`: **18:53:17 UTC** (12:53:17 México).
- Limpieza anterior: **18:54:10 UTC** (12:54:10 México).
- Al iniciar esta revisión, antes de modificar datos: producto QA inactivo y **las 39 presentaciones del banco anterior inactivas**. La captura precedía a la limpieza; no representaba el estado final reportado.

El runner anterior, su instrucción `UPDATE ... idUnidadMedida`, la matriz registrada CM→IN y la lectura SQL actual sustentan la secuencia. No se presupone que una columna histórica de unidad base exista: la fila conserva su unidad de venta y equivalencia, mientras la base se resuelve desde el producto actual.

## ENTREGA #MOKA

| Nº | Control | Resultado |
|---:|---|---|
| 1 | QA CM a IN matrix encontrada | Sí |
| 2 | Producto al que pertenecía | Producto QA T10 Conversiones; `78a626bf-b88e-4580-9a13-d5661ed702e0` |
| 3 | Unidad Base real actual | Libra; `15302afe-10f0-40ff-be3b-efe0ed431120`. Al crear esa fila, Pulgada |
| 4 | Unidad Venta | Centímetro; `a780e53b-e75b-4640-b5b2-d39fad9bd605`; CantidadVenta = 1 |
| 5 | Tipo Unidad Base actual | WEIGHT / Peso; en la prueba original CM→IN era LENGTH |
| 6 | Tipo Unidad Venta | LENGTH / Longitud |
| 7 | Equivalencia persistida | 0.3937; dato previo, no calculado ahora |
| 8 | Causa exacta | E: cambio SQL de base del fixture después de guardar la conversión válida, conservando temporalmente filas previas |
| 9 | Era dato QA antiguo | Sí, de la certificación inmediatamente anterior; **no anterior a las protecciones actuales** |
| 10 | Hoy backend permitiría cm→lb | No; request HTTP real rechazado con 400 |
| 11 | Hoy frontend permitiría cm→lb | No por selección normal: Centímetro no está disponible con base Libra |
| 12 | cm→lb bloqueado actualmente | PASS: selector y backend |
| 13 | kg→lb continúa funcionando | PASS: HTTP 200, persistido/API 2.2046; UI muestra 2.2046 lb |
| 14 | QA CM a IN matrix eliminada/baja | PASS; ya estaba de baja antes de esta revisión y permanece inactiva |
| 15 | Otras presentaciones QA incompatibles encontradas | 28 adicionales, 29 incluyendo la reportada. Todas históricas e inactivas al iniciar. Activas incompatibles: 0 |
| 16 | Presentaciones QA activas finales | 0 |
| 17 | Motor general modificado | NO |
| 18 | Catálogo modificado | NO |
| 19 | DECIMAL(18,4) modificado | NO |
| 20 | SQL estructural | NO |
| 21 | Productos comerciales modificados | NO |
| 22 | POS modificado | NO |
| 23 | Inventario operativo modificado | NO |
| 24 | Login/Auth modificado | NO |
| 25 | Build si hubo corrección | No requerido: no hubo corrección de código de producción. Se compiló únicamente el runner de auditoría |
| 26 | 5200 funcionando | Sí |
| 27 | 5127 funcionando | Sí |
| 28 | Pendientes REALES | Ninguno en esta corrección puntual |
| 29 | Dictamen | Inconsistencia del fixture y de la captura resuelta; protección actual funcional; certificación del motor conservada |

ID exacto de la presentación reportada: **`e0b7dbdd-3089-442a-960c-5d5265d9a36e`**. Fecha de creación: **2026-09-07T18:49:26 UTC**. Origen: runner de certificación, caso **CM→IN**, guardado mediante el controlador real de Presentaciones.

## Prueba puntual y limpieza

Se reactivó únicamente el mismo producto QA, cuya base seguía siendo Libra, **sin reactivar sus 39 presentaciones históricas**. No se creó otro producto ni se cambió la base de ninguno.

1. POST real de **1 cm → lb**: HTTP 400, “La unidad de venta no es compatible con la unidad base.” No se insertó el dato inválido.
2. POST real de **1 kg → lb**: HTTP 200. GET posterior: una sola presentación activa, **QA POST KG a LB**, equivalencia **2.2046**.
3. En el selector real con base Libra sólo aparecieron las ocho unidades de Peso; Centímetro no estaba disponible. La captura nueva muestra **2.2046 lb** tanto en el editor como en la única fila activa de la tabla.
4. Se descartó la captura visual sin guardar otro registro. Se dio baja al producto QA y a su presentación compatible de esta prueba. Las históricas permanecen inactivas.

Estado final: **0 productos QA activos, 0 presentaciones QA activas, 2 productos de trabajo activos, 53 unidades Sistema + 2 personalizadas activas**. Los registros QA se conservan únicamente como historial de baja lógica, conforme a la limpieza segura autorizada.

No se repitieron matriz, catálogo ni responsive. No se modificaron código de aplicación, precisión, factores, UX, persistencia funcional ni datos comerciales. SQL ejecutado: lectura acotada de filas QA y baja lógica del banco conocido; sin cambios de esquema.

## Evidencias

- [Auditoría SQL antes de modificaciones](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/inconsistencia-ticket10-20260907/auditoria-antes.json)

- [29 incompatibilidades históricas, todas inactivas](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/inconsistencia-ticket10-20260907/incompatibles-qa-historicas.json)

- [Prueba HTTP puntual y única presentación compatible](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/inconsistencia-ticket10-20260907/prueba-http.json)

- [Opciones reales del frontend](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/inconsistencia-ticket10-20260907/selector-unidades.json)

- [Nueva captura coherente kg→lb](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/inconsistencia-ticket10-20260907/captura-correcta-kg-lb.png)

- [Limpieza y conteos finales](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/inconsistencia-ticket10-20260907/limpieza-final.json)
