# MOKA — Ficha Técnica específica para Servicios

## A. Veredicto

Implementación local terminada y validada; lista para QA manual PO. Cambio de Aceite002 genera una página A4 real, descargada desde la aplicación y revisada renderizada. Sin escrituras de datos, SQL manual ni migraciones. Sin commit, push, publish o deploy. Ticket10 permanece abierto.

## Auditoría previa

QuestPDF genera el documento en BuildFichaTecnicaPdfDocumentAsync, dentro del controlador de API ProductosServiciosController.cs. ComposeFichaGeneralSection y ComposeFichaCommercialSection compartían composición para producto y servicio; descripción dentro del hero y unidad en la banda comercial diluían la identidad del servicio. Los proxies MVC entregan el DTO y el PDF; la vista web usa JS/CSS/Razor propios y no genera el PDF por HTML. El DTO y los helpers de texto, imagen, métricas, moneda, fiscalidad, secciones y footer son reutilizables. El PDF adjunto coincide por SHA256 con el PDF de servicio de la iteración anterior, usado como referencia de diseño.

## B. Cambios UI/UX

- Hero38/62 con imagen configurada, proporción conservada y alto145pt; nombre24pt, código secundario y badges SERVICIO/estatus real. La categoría acompaña la identificación.
- Descripción del servicio como sección editorial independiente,10pt e interlineado1.35, sin tabla rígida.
- Información general en grid3 columnas y dos filas principales: código, tipo, estatus, categoría, unidad base, etiquetas. Label8pt y valor10pt semibold. Marca/colección opcionales permanecen si están presentes.
- Precio público25pt en bloque neutro; costo, ganancia, margen y comparación en grid2x2 con valores12pt. Unidad se traslada a información general, no se elimina.
- Información fiscal reutiliza el renderer técnico existente. Texto y valores fiscales intactos.
- Espaciado15pt entre bloques, sin estirarlos para llenar la hoja. Logo original y paleta neutra compartida.

## C. Archivos modificados

Código únicamente: inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs.

Nuevos métodos privados: ComposeFichaServiceHero, ComposeFichaServiceDescription y ComposeFichaServiceMetadata. Branch Service en composición de página y presentación comercial; helpers y cálculos existentes compartidos. No se modificaron HTML, Razor, CSS, DTOs, modelos, contratos ni otros controladores.

Evidencias e informe en inspector/docs/qa/ficha-servicio-diseno-20260908. Parche limitado a esta iteración: cambios.patch. Pruebas sintéticas temporales en tmp/ficha-servicio-diseno, sin insertar registros.

## D. Producto vs Servicio

TipoServicio selecciona una composición específica: identificación → descripción → general → rentabilidad → fiscal → multimedia cuando aplica. La rama Product conserva su orden y métodos. No se muestran inventario, logística física ni presentaciones ficticias para Servicio. Se reutilizan los formatos y el cálculo original de rentabilidad; no se duplican reglas ni se cambia persistencia.

Regresión real de producto001: PDF nuevo con igual texto y exactamente los mismos píxeles del render anterior a1200px; una página. Ver validacion.json y producto-regresion.pdf. Los otros tipos de reporte de la aplicación no se modificaron ni se volvieron a certificar; los cambios están dentro del renderer de Productos/Servicios.

## E. Fallback de imagen

Con imagen: archivo existente, FitArea, sin recorte ni deformación. Sin imagen o si la carga existente devuelve null: fondo neutro, iniciales de las dos primeras palabras del nombre y categoría. Sin nombre usa S; sin categoría usa Servicio. No se inventa imagen ni se solicita recurso adicional. Campos opcionales vacíos muestran raya o mantienen la omisión original según su renderer. Las colecciones conservan el contrato existente de listas inicializadas.

## F. PDF y validación

- Build API: PASS,0 errores,785 advertencias existentes. git diff --check PASS.
- Servicio real:1 página A4, importes idénticos a referencia, descripción completa, SAT completo. Revisión visual y cero caracteres fuera de página.
- Fixture aislado sin imagen, descripción/categoría/marca/costo/comparación nulos y etiquetas vacías:1 página, fallback visible, sin excepción ni overflow.
- Fixture aislado con8 párrafos largos:2 páginas, texto completo y siguientes bloques con sus encabezados; cero caracteres fuera de página. Usa datos de referencia históricos exclusivamente en archivo temporal, no representa los precios actuales ni se entrega como ficha comercial.
- Producto real: texto y píxeles idénticos,1 página.
- Encabezado/footer repetidos y márgenes24pt; reserva de espacio por sección. Descripciones muy largas pueden continuar en páginas adicionales; no se fuerza una página.
- No se ejecutó impresión física. Para papel Carta, usar ajuste al área imprimible del PDF A4, como en la versión anterior.

## G. Regresiones y checklist manual

Los valores reales500/1500/1750, ganancia1000 y margen66.67% se conservaron. Producto001 conservó su render íntegro. Vista previa web, reglas de negocio, datos, Auth/Firebase, precios, presentaciones, unidades, inventario y Ticket08 sin modificaciones.

- [ ] Levantar frontend5200/API5127 y descargar Cambio de Aceite002.
- [ ] Revisar nombre, código, badges e imagen representativa.
- [ ] Cotejar descripción, unidad, etiquetas y clasificación contra la ficha web.
- [ ] Confirmar costo500, precio1500, comparación1750, ganancia1000, margen66.67%.
- [ ] Revisar SAT y ausencia de inventario/presentaciones de producto.
- [ ] Imprimir en A4 y revisar legibilidad/márgenes físicos.
- [ ] En un servicio sin imagen, verificar iniciales/categoría; con descripción extensa, revisar continuidad.
- [ ] Descargar producto001 y confirmar que conserva el diseño aprobado.

## Cierre operativo

Puertos inicialmente libres. Procesos iniciados por Codex: frontend9488/API9486. Detenidos al terminar; lsof confirma5200/5127 libres. Ningún proceso preexistente interferido. No hubo datos QA en la aplicación que limpiar; las variantes de prueba son archivos temporales.
