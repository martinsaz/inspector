# MOKA — Ticket 10: avance y QA pendiente

No se cierra Ticket 10. No se declara listo para QA manual.

## Auditoría

`buildAttributesPayload` separaba filas por IdProductoAtributo guardado frente a `new:IdAtributo`. Así, Negro guardado y Rojo nuevo de Colores producían dos padres. `SynchronizeProductoAtributosAsync` insertaba ambos. El script vigente define unicidad por empresa/producto/atributo. Es un defecto demostrado en construcción y persistencia; falta cotejar la excepción de la corrida del PO para certificar que fue el error reportado.

Corrección: agrupación por IdAtributo en frontend y API. API inserta una relación padre y sus distintos valores; detecta una relación idéntica por ID de elemento resuelto y devuelve validación legible dentro de la transacción. No se modificó ni ejecutó ningún script SQL.

Variantes: expansión y editor Tamaño abren correctamente. La generación aislada produce cuatro combinaciones. No se encontró límite de dos. Atributos se sincronizan antes de variantes en la misma transacción; un fallo de atributos impide guardar ambas. Esto es una posible explicación del síntoma de variantes, aún no confirmada con guardado real ni excepción de API.

Estado observado del producto 001: Negro, Plastico y Viscosidad guardados; Blanco/Verde de la captura no aparecen en ficha. Variantes 946 ml y 5 L con imágenes y precios. Cuatro presentaciones del PO: base1pz/$680, paquete6pz/$1500, paquete12pz/$2399, paquete24pz/$5599. Ficha actual indica Objeto de impuesto No. No se cambió ningún dato.

## Entrega de 41 puntos

| Nº | Control | Resultado |
|---|---|---|
|1|Causa exacta atributos|Defecto payload/persistencia identificado arriba; excepción PO pendiente|
|2|Más atributos permitidos|Pendiente de QA real|
|3|Múltiples elementos del mismo atributo|Prueba aislada PASS; persistencia pendiente|
|4|Duplicado idéntico bloqueado|Frontend sin duplicación en prueba; API pendiente de QA real|
|5|Guardar atributos|Pendiente|
|6|F5/Reabrir atributos|Pendiente|
|7|Datos anteriores preservados|Sin escrituras; pendiente certificar después de guardar|
|8|Causa exacta variantes|Pendiente; no se afirma causa sin excepción o reproducción|
|9|Más variantes permitidas|Generador aislado PASS; persistencia pendiente|
|10|Al menos 2 variantes QA agregadas|NO|
|11|Guardar variantes|Pendiente|
|12|F5/Reabrir variantes|Pendiente|
|13|946 ml preservada|Observada; sin escrituras|
|14|5 L preservada|Observada; sin escrituras|
|15|Vista Previa web modificada|NO|
|16|Información General PDF alineada|Render preliminar PASS; PDF real pendiente|
|17|Código/Descripción|Campos separados; render preliminar PASS|
|18|Tipo/Estatus/Categoría/Marca|Cuadrícula uniforme; render preliminar PASS|
|19|Colección/Etiquetas|Celdas independientes; render preliminar PASS|
|20|FICHA TÉCNICA preservado|PASS preliminar|
|21|Nombre usa acento oficial|PASS: #EC0000 de --ca-primary / --checkapp-color-primary|
|22|Jerarquía título/nombre|PASS preliminar: 12/10 puntos|
|23|PDF con atributos nuevos|Pendiente|
|24|PDF con variantes nuevas|Pendiente|
|25|Sin contenido cortado|Render de referencia PASS; volumen real pendiente|
|26|Páginas finales|No existe PDF final de esta QA; referencia preliminar 1 página|
|27|Justificación más de 2 páginas|N/A hasta PDF real|
|28|Código modificado|ProductosServicios.js y ProductosServiciosController.cs; parche adjunto|
|29|Datos QA creados|Ninguno|
|30|Restauración/estado final|Sin guardados; datos del PO intactos|
|31|SQL ejecutado|NO: solo lectura del código de scripts, sin consultas manuales ni scripts ejecutados|
|32|Migraciones|NO|
|33|Build frontend/API|PASS: 0 errores; 9/785 advertencias respectivamente|
|34|Defectos encontrados|Agrupación incorrecta de atributos; aviso preexistente de unidad base al abrir (fuera de alcance)|
|35|Defectos corregidos|Agrupación atributos frontend/API; alineación y encabezado PDF. QA real pendiente|
|36|Pendientes reales|Excepción API, reinicio autorizado, Guardar/F5/reabrir, QA de duplicados y variantes, PDF real ampliado, limpieza QA y cierre de procesos propios|
|37|Evidencia PDF|Solo temporal: tmp/pdf-compacto-smoke/aceite-alineacion-preliminar.pdf, datos históricos, no sustituye PDF real|
|38|Puerto5200 libre|FAIL: PID7529 preexistente|
|39|Puerto5127 libre|FAIL: PID7531 preexistente|
|40|Procesos preexistentes respetados|PASS; ningún servidor iniciado por esta ejecución|
|41|Dictamen|IMPLEMENTACIÓN PARCIAL VERIFICADA — QA REAL PENDIENTE — TICKET 10 ABIERTO|

## Bloqueo operativo

Se solicitó autorización para reiniciar los procesos preexistentes 7529/7531, ejecutar QA con las compilaciones nuevas y detener los procesos sustitutos al terminar. Sin respuesta, no se detienen. Se solicitó además la excepción de GuardarProductoServicio: la herramienta rechazó leer la ventana de Terminal por seguridad, y no se intentó acceder por otro medio.

Validación aislada reproducible: `node inspector/docs/qa/atributos-variantes-pdf-ticket10-20260908/payload-regresion.cjs` desde la raíz del workspace. No accede a base ni navegador. Ambos repos pasan `git diff --check`.
