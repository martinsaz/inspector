# ENTREGA MOKA — Ticket 10, corrección de Ficha Técnica

Fecha: 2026-09-08. Alcance exclusivo: Ficha UI y composición de su PDF. Sin cambios de datos, SQL ni migraciones. Cambios preexistentes de ambos repositorios preservados.

Contrato fiscal auditado en el catálogo API: 01 = No objeto de impuesto; 02 = Sí objeto; 03 = Sí objeto sin obligación de desglose; 04 = Sí objeto sin causar impuesto. Mapeo exclusivo de lectura: 01 → No; 02/03/04 → Sí. El aceite conserva 03 y el servicio 01 en Editar. IVA no se usa para inferir objeto fiscal ni se modifica.

QA real: Aceite Motor Sintetico y Cambio de Aceite, desktop 1890, tablet 820 y móvil 390 píxeles CSS. El zoom preexistente de Chrome requería ajustar el viewport físico; las dimensiones CSS efectivas están registradas. Override restaurado al terminar. Ambos formularios Editar se consultaron y cerraron sin guardar. El servicio carece de Marca/Colección; se omiten sin inventar valores ni reservar cards vacías.

PDF final: aceite.pdf (3 páginas, renders aceite-final-1/2/3.png), servicio.pdf (1 página, servicio-pdf-1.png). Todas las páginas revisadas visualmente; el producto mantiene el flujo multipágina de física/logística y variantes, sin alterar esas secciones. Se conservan imágenes, encabezados, botones y datos. Precios y Costos también usa seis columnas en PDF.

Los PASS de regresión 49–58 acreditan preservación del código funcional por comparación contra el estado inicial de esta iteración; no afirman nuevas pruebas de escritura, prohibidas por el alcance. Los controles visuales sí se validaron en la app real.

| # | Control | Resultado |
|---|---|---|
| 1 | Imagen sin cambios | PASS — presentación preservada; consulta real y diff limitado a esta corrección. No se guardaron datos. |
| 2 | Fila 01 Código + Descripción | PASS — ficha real, captura y mediciones del navegador. |
| 3 | Descripción completa | PASS — ficha real, captura y mediciones del navegador. |
| 4 | Fila 02 Tipo + Estatus + Categoría + Marca | PASS — ficha real, captura y mediciones del navegador. |
| 5 | Fila 03 Colección + Etiquetas | PASS — ficha real, captura y mediciones del navegador. |
| 6 | Etiquetas intactas | PASS — presentación preservada; consulta real y diff limitado a esta corrección. No se guardaron datos. |
| 7 | Sin cuarta fila innecesaria | PASS — ficha real, captura y mediciones del navegador. |
| 8 | Aire reducido | PASS — ficha real, captura y mediciones del navegador. |
| 9 | Información Comercial eliminada | PASS — ficha real, captura y mediciones del navegador. |
| 10 | Título Precios y Costos | PASS — ficha real, captura y mediciones del navegador. |
| 11 | Unidad Base en fila única Desktop | PASS — ficha real, captura y mediciones del navegador. |
| 12 | Costo en fila única Desktop | PASS — ficha real, captura y mediciones del navegador. |
| 13 | Precio Público en fila única Desktop | PASS — ficha real, captura y mediciones del navegador. |
| 14 | Precio comparación en fila única Desktop | PASS — ficha real, captura y mediciones del navegador. |
| 15 | Ganancia en fila única Desktop | PASS — ficha real, captura y mediciones del navegador. |
| 16 | Margen en fila única Desktop | PASS — ficha real, captura y mediciones del navegador. |
| 17 | Sin segunda fila para Margen | PASS — ficha real, captura y mediciones del navegador. |
| 18 | Presentaciones debajo preservadas | PASS — ficha real, captura y mediciones del navegador. |
| 19 | Producto Objeto de impuesto = Sí/No | PASS — ficha real, captura y mediciones del navegador. |
| 20 | Servicio Objeto de impuesto = Sí/No | PASS — ficha real, captura y mediciones del navegador. |
| 21 | Código persistido NO modificado | PASS — presentación preservada; consulta real y diff limitado a esta corrección. No se guardaron datos. |
| 22 | Claves SAT intactas | PASS — presentación preservada; consulta real y diff limitado a esta corrección. No se guardaron datos. |
| 23 | Aceite Ficha Técnica abre | PASS — ficha real, captura y mediciones del navegador. |
| 24 | Información General correcta | PASS — ficha real, captura y mediciones del navegador. |
| 25 | Precios y Costos correcto | PASS — ficha real, captura y mediciones del navegador. |
| 26 | Presentaciones correctas | PASS — ficha real, captura y mediciones del navegador. |
| 27 | Fiscal correcto | PASS — ficha real, captura y mediciones del navegador. |
| 28 | Cambio de Aceite Ficha abre | PASS — ficha real, captura y mediciones del navegador. |
| 29 | Información General correcta | PASS — ficha real, captura y mediciones del navegador. |
| 30 | Precios y Costos correcto | PASS — ficha real, captura y mediciones del navegador. |
| 31 | Sin Presentaciones falsas | PASS — ficha real, captura y mediciones del navegador. |
| 32 | Fiscal correcto | PASS — ficha real, captura y mediciones del navegador. |
| 33 | PDF Producto generado REALMENTE | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 34 | PDF Producto nuevo orden | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 35 | PDF Producto Precios y Costos | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 36 | PDF Producto Presentaciones | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 37 | PDF Producto Objeto impuesto Sí/No | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 38 | PDF Servicio generado REALMENTE | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 39 | PDF Servicio nuevo orden | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 40 | PDF Servicio Precios y Costos | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 41 | PDF Servicio sin Presentaciones falsas | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 42 | PDF Servicio Objeto impuesto Sí/No | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 43 | PDF sin contenido cortado | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 44 | UI/PDF coinciden | PASS — PDF real descargado desde UI; páginas renderizadas e inspeccionadas. |
| 45 | Desktop | PASS — ficha real, captura y mediciones del navegador. |
| 46 | Tablet | PASS — ficha real, captura y mediciones del navegador. |
| 47 | Móvil | PASS — ficha real, captura y mediciones del navegador. |
| 48 | Overflow horizontal | NO — sin overflow horizontal en ficha; ver mediciones a 1890, 820 y 390 píxeles CSS. |
| 49 | Pieza primero intacto | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 50 | Unidad Base excluida de salida intacta | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 51 | Duplicados bloqueados intactos | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 52 | Presentación Base intacta | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 53 | Precio Público/Base intacto | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 54 | Paquete intacto | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 55 | Conversiones intactas | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 56 | Catálogo Unidades intacto | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 57 | IVA intacto | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 58 | Ticket 08 intacto | PASS — código funcional preservado en el diff de esta iteración; no se repitieron altas ni pruebas de escritura de puntos aprobados. |
| 59 | POS modificado | NO. |
| 60 | Inventario operativo modificado | NO. |
| 61 | Login/Auth modificado | NO. |
| 62 | Productos activos finales | 2 — PASS, consulta del listado real (Producto + Servicio activos). |
| 63 | Unidades activas finales | 56 — PASS, catálogo activo consumido por la UI. |
| 64 | Paquete activo | PASS — Paquete incluido en las unidades activas. |
| 65 | Datos QA creados | 0 — no se crearon datos QA. |
| 66 | Datos comerciales modificados | NO. |
| 67 | Código modificado | ProductosServicios.js; ProductosServicios.css; ProductosServiciosController.cs de API (solo composición PDF); evidencia de esta iteración. |
| 68 | SQL estructural | NO. |
| 69 | Migraciones | NO. |
| 70 | Build frontend | PASS — 0 errores, 9 advertencias existentes. |
| 71 | Build API | PASS — 0 errores, 785 advertencias existentes. |
| 72 | JS syntax | PASS — node --check. |
| 73 | Defectos encontrados | Distribución de Información General y Margen; título comercial antiguo; código fiscal visible. Aviso de unidad base en Editar preexistente, fuera de alcance. |
| 74 | Defectos corregidos | Tres filas generales desktop, seis columnas de precios, título Precios y Costos, mapeo fiscal según contrato; PDF con orden lógico y precios compactos. |
| 75 | Excepciones | Sesión inicialmente mostró aviso de otro dispositivo; después se recuperó y el QA real se completó. No se modificó Login/Auth. PDF Aceite conserva paginación de 3 páginas y Servicio 1; texto completo, sin recortes. |
| 76 | Pendientes REALES | Ninguno de implementación/QA Codex dentro del alcance. Siguiente QA manual y aprobación corresponden al PO. |
| 77 | Evidencias | Capturas desktop/tablet/móvil, mediciones-responsive.json, aceite-ui.txt, servicio-ui.txt, cotejo-fiscal.json, conteos-ui.json, aceite.pdf, servicio.pdf, renders finales, builds y cambios-iteracion.patch. |
| 78 | Proceso 5200 iniciado por Codex | Sí — PID 6365. |
| 79 | Proceso 5127 iniciado por Codex | Sí — PID 6356, sustituido por 6540 después del ajuste PDF. |
| 80 | Proceso Codex 5200 detenido | PASS — PID 6365 detenido. |
| 81 | Proceso Codex 5127 detenido | PASS — PID 6356 y PID 6540 detenidos. |
| 82 | Puerto 5200 libre al terminar | PASS — lsof sin listener. |
| 83 | Puerto 5127 libre al terminar | PASS — lsof sin listener. |
| 84 | Procesos preexistentes del PO respetados | PASS — puertos libres al inicio, sin detener procesos preexistentes. |
| 85 | Dictamen | TICKET 10 — FICHA TÉCNICA CORREGIDA SEGÚN QA MANUAL — DISTRIBUCIÓN COMPACTA, PRECIOS Y COSTOS ACTUALIZADOS Y OBJETO DE IMPUESTO REPRESENTADO COMO SÍ/NO — ENTORNO LIMPIO Y LISTO PARA SIGUIENTE QA MANUAL DEL PRODUCT OWNER. |
