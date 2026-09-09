# MOKA — QA real posterior al reinicio autorizado

Fecha: 2026-09-08. Ticket 10 sigue abierto. Este informe actualiza los resultados pendientes del informe preliminar.

QA funcional de atributos y variantes: PASS. Ambos PDF reales: PASS, una página cada uno. Cierre de procesos: PASS. Dos límites explícitos: no se reprodujo el fallo original de variantes con la versión corregida; el elemento Rojo creado para QA permanece en catálogo, sin asociación al producto, porque no existe baja disponible y no se autorizó SQL.

## Resultado de 52 controles

| Nº | Control | Resultado y evidencia |
|---|---|---|
|1|PID 7529 detenido|PASS; SIGTERM autorizado|
|2|PID 7531 detenido|PASS; SIGTERM autorizado|
|3|Nuevo PID 5200|8185|
|4|Nuevo PID 5127|8179|
|5|Colores Rojo agregado|PASS; alta rápida necesaria porque no existía en catálogo|
|6|Negro preservado|PASS durante QA y al cierre|
|7|Blanco preservado|PASS durante QA; no estaba asociado inicialmente, se agregó temporalmente y retiró al restaurar|
|8|Verde preservado|PASS durante QA; no estaba asociado inicialmente, se agregó temporalmente y retiró al restaurar|
|9|Material preservado|PASS: Plastico|
|10|Consistencia preservada|PASS: Viscosidad|
|11|Guardar atributos|PASS real sin error genérico|
|12|F5/Reabrir atributos|PASS: recarga completa y reapertura de editor|
|13|Fallo original de variantes reproducido|No, con la versión corregida|
|14|Excepción exacta|No ocurrió excepción GuardarProductoServicio; no hay mensaje, inner exception, stack ni restricción de una excepción nueva que reportar|
|15|Causa raíz variantes|No se demostró una causa independiente. El defecto de agrupación de atributos afectaba la transacción compartida antes de sincronizar variantes; posible explicación del síntoma, no certificación de la excepción original|
|16|Corrección aplicada|Se cargó la agrupación por IdAtributo ya implementada en frontend/API. No se modificó código de variantes ni se añadió corrección especulativa|
|17|Variante nueva 1|PASS: QA Variante 1, costo10/precio15|
|18|Variante nueva 2|PASS: QA Variante 2, costo20/precio25|
|19|946 ml preservada|PASS: imagen, costo199/precio445.55|
|20|5 L preservada|PASS: imagen, costo299/precio503|
|21|Guardar variantes|PASS real|
|22|F5/Reabrir variantes|PASS: recarga completa, ficha y editor muestran cuatro variantes|
|23|PDF Aceite generado realmente|PASS: descargado por botón de la aplicación después del guardado y recarga|
|24|Páginas Aceite|1|
|25|Información General alineada|PASS: revisión visual del render completo|
|26|Encabezado mejorado|PASS: título principal y nombre debajo|
|27|Nombre con acento CheckApp|PASS: #EC0000, token oficial --ca-primary / --checkapp-color-primary|
|28|Atributos QA visibles|PASS: Negro, Blanco, Verde, Rojo; Material y Consistencia|
|29|Variantes QA visibles|PASS: cuatro filas completas|
|30|Sin contenido cortado en Aceite|PASS visual|
|31|Paginación eficiente|PASS: una página legible, sin filas aisladas|
|32|PDF Servicio generado realmente|PASS: descarga desde ficha de Cambio de Aceite, sin editar el servicio|
|33|Páginas Servicio|1|
|34|Sin Presentaciones falsas|PASS visual y extracción de texto|
|35|Sin contenido cortado en Servicio|PASS visual|
|36|Datos comerciales modificados|NO en valores cotejados: nombre, código, descripción, clasificación, etiquetas, imagen, precios, cuatro presentaciones, datos fiscales/logísticos/inventario visibles y variantes originales conservados. Los guardados actualizan metadata de modificación|
|37|SQL ejecutado|NO manual: no scripts ni consultas SQL directas; los guardados UI usan la persistencia normal de la aplicación|
|38|Migraciones|NO|
|39|Login/Auth modificado|NO|
|40|Ticket08 modificado|NO|
|41|POS modificado|NO|
|42|Inventario operativo modificado|NO|
|43|Datos QA creados|Asociaciones Blanco, Verde y Rojo; elemento de catálogo Rojo; opciones/variantes QA Variante1 y2|
|44|Datos QA restaurados|Producto restaurado y comprobado tras recarga. Pendiente: elemento Rojo en catálogo sin asociación; no hay operación de baja UI/API disponible|
|45|Defectos encontrados|Agrupación de atributos ya corregida; sin fallo nuevo de variantes reproducible. Aviso preexistente de unidad base al abrir/cerrar guardado permanece fuera de alcance|
|46|Defectos corregidos|Agrupación atributos validada realmente; encabezado y alineación PDF validados realmente. No se cambió código en esta continuación|
|47|Pendientes reales|Excepción original/causa independiente de variantes no reproducida. Resolver destino del elemento Rojo de catálogo sin usar SQL no autorizado. QA manual PO; Ticket10 abierto|
|48|Proceso Codex5200 detenido|PASS: PID8185 ya no existe|
|49|Proceso Codex5127 detenido|PASS: PID8179 ya no existe|
|50|Puerto5200 libre|PASS: lsof sin listeners|
|51|Puerto5127 libre|PASS: lsof sin listeners|
|52|Dictamen|QA FUNCIONAL DE ATRIBUTOS Y VARIANTES PASS — PDF REAL VALIDADO CON MAYOR VOLUMEN — PUERTOS LIBRES — SALVEDADES DOCUMENTADAS|

## Evidencia y procedimiento

1. Se verificaron identidad y directorio de los procesos PO 7529/7531 y se detuvieron con SIGTERM conforme a autorización.
2. Se iniciaron las compilaciones actuales con Development y URLs5200/5127. Los builds previos de estos mismos cambios finalizaron con cero errores; no hubo edición de código posterior que requiriera otro build.
3. Antes de guardar se registró el editor: únicamente Negro, Plastico, Viscosidad y variantes946ml/5L. Blanco y Verde estaban solo en catálogo. Se agregaron las tres asociaciones solicitadas y se guardó. La recarga completa y reapertura confirmaron las seis relaciones. Un intento de repetir Colores/Negro fue bloqueado por “Esa relación atributo / elemento ya fue agregada al producto.”
4. Se agregaron dos valores a la opción Tamaño existente. Guardado, recarga y reapertura confirmaron las cuatro variantes. El log API controlado no contiene excepción de guardado. No se inventa stack ni causa histórica.
5. Se descargó el PDF real del producto desde la ficha ampliada y después el del servicio. Ambos se renderizaron y se revisaron visualmente antes de limpiar. `pdf-verificacion.json` confirma una página cada uno, Rojo y ambas variantes QA en Aceite y ausencia de presentaciones en Servicio.
6. Se retiraron únicamente las asociaciones y variantes creadas por Codex. Una nueva recarga y ficha confirmaron el estado original del producto.
7. El catálogo no ofrece baja de elementos; GuardarValorAtributoProductoServicio permite crear/editar Valor y Orden, sin campo Activo ni borrado. Se conserva Rojo sin asociación y se reporta. No se añadió endpoint ni se ejecutó SQL para borrarlo.
8. Se detuvieron los nuevos PID8185/8179. No se levantaron nuevamente los procesos PO. La verificación final no encuentra listeners ni ninguno de los cuatro PID.

Archivos de evidencia en este directorio:
- `editor-antes.txt`, `atributos-reabiertos.txt`, `duplicado-atributo.txt`.
- `ficha-ampliada-real.txt`, `variantes-reabiertas-editor.txt`.
- `aceite-ampliado-real.pdf`, `aceite-ampliado-1.png`, `servicio-real.pdf`, `servicio-real-1.png`.
- `ficha-final-restaurada.txt`, `api-qa-controlada.log`, `pdf-verificacion.json`, `cierre-qa-real.json`.

No se declara cierre de Ticket10 ni limpieza total de catálogo. La validación funcional sí está ejecutada y documentada; no se sustituye por pruebas aisladas ni builds.
