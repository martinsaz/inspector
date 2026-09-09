# ENTREGA #MOKA — Referencia visual aprobada

8 de septiembre de 2026. Ticket 10 permanece abierto.

Se modificó exclusivamente la presentación del generador QuestPDF. Se usaron el logo original, su naranja #FF9231 y los colores ya utilizados por la ficha. No hay HTML/CSS ni framework nuevo en este generador.

## Producto

1. Hero equivalente a referencia: PASS.
2. Imagen protagonista: PASS — columna 34%, proporción conservada.
3. Nombre producto dominante: PASS.
4. Metadata compacta: PASS — código/tipo/estatus, marca/colección y chips.
5. Precios y Costos equivalente: PASS — seis cards, orden solicitado.
6. Precio público destacado: PASS.
7. Inventario equivalente: PASS — tres indicadores.
8. Atributos equivalente: PASS — tabla compacta junto a inventario.
9. Presentaciones equivalente: PASS — cuatro filas reales, precios a la derecha.
10. Variantes equivalente: PASS — cuatro variantes; miniaturas y placeholder gris.
11. Información fiscal/logística equivalente: PASS — bloque integrado, conserva paquete y peso físico total además de los campos de la maqueta.
12. Páginas finales: 1.
13. Sin cortes: PASS — página completa renderizada y revisada.

## Servicio

14. Hero equivalente: PASS — diseño distinto del producto.
15. Imagen horizontal protagonista: PASS — columna 48%, proporción original.
16. Nombre dominante: PASS.
17. Descripción equivalente: PASS — bloque ancho inmediatamente después del hero.
18. Información general equivalente: PASS — tres columnas y dos filas.
19. Precio/rentabilidad equivalente: PASS — cinco cards, precio público dominante.
20. Información fiscal equivalente: PASS — tres columnas, Objeto de impuesto «No».
21. Páginas finales: 1.
22. Sin cortes: PASS — página completa renderizada y revisada.

## Control

23. Vista Previa modificada: NO.
24. Datos modificados: NO.
25. SQL ejecutado: NO.
26. Migraciones: NO.
27. Lógica de negocio modificada: NO. Sin cambios en Login/Auth, Firebase, sesión, roles o permisos.
28. Archivo de aplicación modificado en esta iteración: `inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs`, exclusivamente región de composición PDF. `cambio-pdf.diff` compara contra la copia al inicio de esta iteración. El repositorio contiene cambios anteriores en otros archivos que se preservaron. Se añadieron evidencias en esta carpeta y utilidades temporales locales bajo `tmp/ficha-referencia`; el ejecutor temporal de PDF habilitó diagnóstico QuestPDF para identificar el fallo de layout.
29. Build: PASS — `dotnet build --no-restore`, 0 errores, 785 advertencias existentes; registro `/tmp/moka-reference-build.log`.
30. PDF Producto generado y abierto: PASS — descargado desde el botón real de la aplicación; `producto.pdf` y `producto-1.png`.
31. PDF Servicio generado y abierto: PASS — descargado desde el botón real de la aplicación; `servicio.pdf` y `servicio-1.png`.
32. Diferencias respecto a referencia: equivalencia de estructura y jerarquía, no identidad de píxeles. Se conserva Calibri del generador y se usan iconos vectoriales simplificados: no se suministraron los iconos originales de la maqueta como assets. Se conserva la foto completa del servicio sin deformación; su encuadre difiere del mock. Los saltos de etiquetas dependen del ancho A4. Los campos reales adicionales de logística se mantienen y cambian ligeramente su distribución. No se añadieron el icono decorativo de herramienta ni los iconos internos opcionales de inventario. Las imágenes y textos reales no se sustituyeron por los ilustrados en la referencia.
33. Defectos encontrados: primera descarga falló por contenedor SVG de 16×14 puntos incompatible con icono cuadrado. Fue un error de composición PDF.
34. Defectos corregidos: contenedor de icono 16×16; inventario compacto; placeholder gris para variantes sin imagen; jerarquía financiera y secciones paralelas solicitadas.
35. Pendientes reales: aceptación visual manual del Product Owner. No se cierra Ticket 10. Verificación adicional aislada sin BD: fixture de 24 variantes genera 3 páginas; descripción larga de servicio genera 2; servicio sin imagen y con nulos genera 1. No se fuerza una sola página. En documentos extensos se conserva la estructura de columnas: puede quedar espacio vacío junto a una tabla que continúa, sin perder datos. Estas pruebas sintéticas no modificaron registros reales.

## Cierre

36. Puerto 5200 libre al terminar: PASS — verificado con bind IPv4/IPv6.
37. Puerto 5127 libre al terminar: PASS — verificado con bind IPv4/IPv6.
38. Procesos preexistentes PO respetados: PASS — puertos libres al inicio. Se detuvieron solamente los procesos propios: frontend PID 10247, API inicial 10245 y API final 10334. No se inició sesión ni se alteraron tokens para descargar los PDF. No quedaron datos de QA que limpiar porque no se crearon registros.
39. Dictamen: PDF PRODUCTO Y SERVICIO REDISEÑADOS SEGÚN REFERENCIA VISUAL APROBADA — LISTOS PARA QA MANUAL DEL PRODUCT OWNER.

Los servidores temporales quedaron detenidos. El Product Owner levanta su ambiente cuando lo necesita. Sin commit, push ni despliegue.
