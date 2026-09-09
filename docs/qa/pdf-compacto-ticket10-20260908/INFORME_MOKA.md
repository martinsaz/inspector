# MOKA — PDF compacto de Ficha Técnica: estado y pendiente real

2026-09-08. Modificación exclusiva del generador PDF. La aplicación muestra «Se inició sesión en otro dispositivo con su usuario»; se solicitó restablecer sesión al PO sin modificar autenticación. El QA real obligatorio no se completó, por lo que no se declara PASS global.

La prueba preliminar invocó únicamente el renderizador con JSON archivados de una iteración anterior, sin conectarse a la base ni ejecutar consultas SQL. Aceite produjo 1 página y ambas variantes; Servicio 1 página. Los valores históricos del Servicio no representan sus valores actuales: estos archivos NO son entregables finales ni prueba de consistencia con la Vista Previa actual.

Código funcional anterior/posterior al bloque PDF idéntico; huellas web preservadas. Sin escritura de registros, SQL o migraciones. Los puertos estaban libres al inicio; los dos servidores iniciados por Codex se detuvieron al entregar.

| # | Control | Resultado |
|---|---|---|
| 1 | Páginas Aceite antes | 3 — confirmado con pdfinfo del archivo adjunto. |
| 2 | Páginas Aceite después | PENDIENTE real. Prueba preliminar con JSON archivado: 1 página, ambas variantes visibles. |
| 3 | Páginas Servicio después | PENDIENTE real. Prueba preliminar con JSON archivado: 1 página; esa referencia tiene datos históricos distintos a la vista actual y NO certifica consistencia. |
| 4 | Header compactado | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 5 | Imagen reducida | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 6 | Información General compacta | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 7 | Precios y Costos compacto | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 8 | Presentaciones compactas | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 9 | Fiscal compacto | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 10 | Física/Logística compacta | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 11 | Inventario compacto | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 12 | Atributos compactos | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 13 | Variantes compactas | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 14 | Ambas variantes Aceite en máximo 2 páginas | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 15 | Sin página casi vacía | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 16 | Sin contenido cortado | PENDIENTE de certificación con PDF real descargado desde la app. Implementado y revisado preliminarmente con referencia archivada. |
| 17 | Datos coinciden con Vista Previa | PENDIENTE — requiere sesión y descarga real; no se usó el JSON histórico como prueba de datos actuales. |
| 18 | Vista Previa modificada | NO — SHA256 de JS, CSS y Razor idéntico al inicio. |
| 19 | Datos modificados | NO. |
| 20 | SQL/migraciones | NO — ningún SQL ni migración. |
| 21 | Archivos modificados | inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs (exclusivamente bloque de composición PDF); documentación de esta iteración. Herramienta temporal de render en tmp/pdf-compacto-smoke. |
| 22 | Build | PASS — API: 0 errores, 785 advertencias existentes. Frontend sin modificaciones. |
| 23 | PDF Aceite revisado realmente | PENDIENTE — app bloqueada por aviso de sesión. Render de referencia sí inspeccionado, no equivale al PDF real solicitado. |
| 24 | PDF Servicio revisado realmente | PENDIENTE — app bloqueada por aviso de sesión. Render de referencia sí inspeccionado, no equivale al PDF real solicitado. |
| 25 | Defectos encontrados/corregidos | Corregidos en código: header e imagen grandes, repetición de nombre, grids verticales, espacios y miniaturas excesivos; reserva de espacio para grupos pequeños de variantes. Falta certificación con descarga real. |
| 26 | Pendientes reales | Restablecer sesión normal en localhost:5200; levantar temporalmente los servicios, descargar ambos PDF reales, abrirlos y cotejarlos contra Vista Previa. No alterar Login/Auth. |
| 27 | Puerto 5200 libre al terminar | PASS — PID 7235 iniciado por Codex detenido; sin listener. |
| 28 | Puerto 5127 libre al terminar | PASS — PID 7228 iniciado por Codex detenido; sin listener. |
| 29 | Dictamen | IMPLEMENTACIÓN PDF COMPACTA PREPARADA — QA REAL PENDIENTE DE SESIÓN — VISTA PREVIA PRESERVADA — PROCESOS CODEX DETENIDOS. No se declara listo para QA manual ni Ticket 10 cerrado. |
