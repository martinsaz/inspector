# MOKA — QA visual final de Ticket 10

Fecha: 2026-09-08. Sesión autenticada de Chrome; validación real sin cambios de código, SQL ni migraciones.

Resultados: combo agrupado con Pieza primero; búsqueda; exclusión Pieza/kg/cm/L; base protegida; duplicado bloqueado; edición y F5; paquete diferente; fichas Producto/Servicio; PDF reales; desktop/tablet/móvil.

Cambio controlado: Paquete 6 pz $1,500 → $1,450, Guardar/F5/Reabrir confirmó una fila y Precio Público $680. Se restauró $1,500. Paquete 12 pz/$2,900 se creó, verificó tras F5 y dio de baja desde UI; otra recarga confirmó sólo Base y Paquete 6.

Aceite: Unidad Base Pieza (pz), costo $605, público $680, comparación $700, ganancia $75, margen 11.03%. Base 1 pz/$680 y Paquete 6 pz/$1,500. Coinciden Editar, Ficha y PDF.

Servicio: Unidad de servicio (US), público $1,700, objeto de impuesto 01. Sin costo/comparación inventados ni presentaciones.

Se descargaron los PDF usando el botón de cada ficha, se abrieron los archivos resultantes y se renderizaron/revisaron todas sus páginas. Aceite: tres páginas, tabla comercial completa en la primera. Servicio: una página. Márgenes y textos legibles; las secciones existentes continúan entre páginas.

Responsive: escritorio real de Chrome; tablet 820 CSS px y móvil 390 CSS px. Se inspeccionaron visualmente campos y tabla; scrollWidth=clientWidth y cards sin overflow. Se restableció el viewport al terminar.

Observación no bloqueante: continúa el aviso preexistente de unidad base al abrir Editar. Se descartó con Entendido y se verificó que la unidad permanecía Pieza. No se intentó corregir Login/Auth ni ese aviso en esta reanudación.

| # | Control | Resultado |
|---|---|---|
| 1 | Pieza primero | PASS |
| 2 | Por artículo primero | PASS |
| 3 | Agrupamiento correcto | PASS |
| 4 | Búsqueda | PASS |
| 5 | Pieza excluida | PASS |
| 6 | Kg excluido | PASS |
| 7 | cm excluido | PASS |
| 8 | L excluido | PASS |
| 9 | Visible | PASS |
| 10 | No editable | PASS |
| 11 | No baja | PASS |
| 12 | Precio = Precio Público | PASS |
| 13 | Duplicado bloqueado | PASS |
| 14 | Mensaje correcto | PASS |
| 15 | Segunda fila NO creada | PASS |
| 16 | Editar precio existente | PASS |
| 17 | Paquete 12 permitido | PASS |
| 18 | F5/Reabrir | PASS |
| 19 | Unidad Base | PASS |
| 20 | Costo | PASS |
| 21 | Precio Público | PASS |
| 22 | Precio comparación | PASS |
| 23 | Ganancia | PASS |
| 24 | Margen | PASS |
| 25 | Presentaciones | PASS |
| 26 | Sin acciones | PASS |
| 27 | Cambio de Aceite abre | PASS |
| 28 | Datos comerciales correctos | PASS |
| 29 | Información fiscal correcta | PASS |
| 30 | Sin Presentaciones falsas | PASS |
| 31 | Descarga | PASS |
| 32 | Datos comerciales correctos | PASS |
| 33 | Presentaciones visibles | PASS |
| 34 | UI/PDF coinciden | PASS |
| 35 | Descarga | PASS |
| 36 | Datos correctos | PASS |
| 37 | Sin Presentaciones falsas | PASS |
| 38 | Desktop | PASS |
| 39 | Tablet | PASS |
| 40 | Móvil | PASS |
| 41 | Overflow horizontal | NO — ancho/scroll 820/820 en tablet y 390/390 en móvil; cards sin overflow. |
| 42 | Productos finales = 2 | PASS |
| 43 | Unidades finales = 56 | PASS |
| 44 | Paquete activo | PASS |
| 45 | Presentaciones QA activas | 0 — Paquete 12 dado de baja desde UI; F5 y ficha sólo muestran Base y Paquete 6. |
| 46 | Código modificado durante QA | NO — únicamente informe y evidencias; sin cambios en código de aplicación. |
| 47 | SQL ejecutado | NO — todas las operaciones de negocio se realizaron en Chrome. |
| 48 | Migraciones | NO |
| 49 | Login/Auth modificado | NO |
| 50 | POS modificado | NO |
| 51 | Inventario operativo modificado | NO |
| 52 | 5200 funcionando | Sí — PID 4518. |
| 53 | 5127 funcionando | Sí — PID 4510. |
| 54 | Defectos encontrados | Aviso preexistente «No puedes cambiar la unidad base» al abrir Editar. Al inicio hubo aviso de sesión en otro dispositivo; el usuario restableció la sesión y se continuó en la misma pestaña. No se detectaron fallos nuevos en los criterios solicitados. |
| 55 | Defectos corregidos | Ninguno: no se modificó código durante QA. |
| 56 | Pendientes REALES | Ninguno de los criterios de esta reanudación. Permanece el aviso preexistente de unidad base, fuera de la corrección validada. |
| 57 | Evidencias | Capturas PNG, snapshots de UI, datos-finales-ui.json y ambos PDF descargados desde Chrome en esta carpeta. |
| 58 | Dictamen | TICKET 10 — VALIDACIONES DE PRESENTACIONES, FICHA TÉCNICA Y PDF CERTIFICADOS VISUALMENTE — LISTO PARA QA FINAL DEL PRODUCT OWNER. |
