# MOKA — Rediseño profesional de Ficha Técnica PDF

## A. Veredicto

Implementado y validado localmente. Aceite Motor Sintetico y Cambio de Aceite: una página A4 cada uno. Descargados desde la aplicación real y revisados mediante renders completos. Ticket10 no se cierra; queda disponible para QA manual PO.

## Auditoría previa

La API genera el PDF directamente con QuestPDF: BuildFichaTecnicaPdfDocumentAsync y ComposeFicha… en ProductosServiciosController.cs. El proxy frontend ExportarFichaTecnicaProductoServicioPdf solamente entrega el archivo. La vista previa web se construye con ProductosServicios.js y sus estilos propios; no genera el PDF mediante HTML/CSS.

La imagen anterior tenía columna80pt y alto82pt; el nombre10pt competía con el título12pt. Recuadros repetidos, métricas de igual peso, tabla de presentaciones sin header diferenciado y miniaturas25pt reducían jerarquía y legibilidad. El esquema previo era encabezado/general → comercial → fiscal/logística → inventario → atributos/variantes.

Nuevo esquema: logo discreto → imagen30% + nombre/descripción/metadata → precios → inventario → presentaciones/variantes → atributos → logística/fiscal. Sin repetición de datos del hero.

## B. Archivos modificados

Código: únicamente inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs, en los métodos privados de composición PDF y sus estilos. Parche de esta iteración en cambios.patch. Evidencias e informe en este directorio. Se preservaron los cambios previos del workspace.

## C. Cambios UI/UX

- Hero30/70; imagen proporcional contenida en área152pt, con padding. Nombre21pt dominante; logo y rótulo de documento discretos.
- Descripción con formato existente; código/tipo/estatus/categoría/marca/colección en grid y etiquetas con wrap. Se retiran solo los rótulos redundantes Información general y Descripción, no su contenido.
- Precio público19pt en una banda neutra; costo, comparación, ganancia, margen y unidad permanecen.
- Inventario adelantado; existencia actual16pt, demás valores10pt.
- Títulos10.5pt semibold y separadores finos. Se eliminan los recuadros repetitivos de las secciones principales.
- Presentaciones y variantes con headers neutros, líneas sutiles e importes a la derecha. Precio más destacado que costo.
- Miniaturas38pt (aproximadamente51px), sin deformación. Placeholder cuando no existe imagen.
- Logística en grid3: producto/paquete, pesos, dimensiones/volumétrico/facturable.
- Paleta de texto, superficie y separadores reutilizada de checkapp-theme.css; acento naranja conservado en el logo compartido. No se inventó paleta ni se modificó la marca.

## D. Impresión/PDF

QuestPDF se conserva sin dependencias nuevas. A4 con margen24pt. Encabezado y pie repetidos, footer discreto. Tablas con Table.Header repetible; reserva de espacio aplicada a secciones completas para evitar títulos huérfanos. La primera revisión dejó fiscal sola en página2; se corrigió el espaciado sin reducir fuentes. La prueba ampliada detectó un título huérfano; la reserva de espacio se corrigió y el render final lo mantiene junto a sus valores.

PDF reales finales: aceite.pdf y servicio.pdf,1 página cada uno. La prueba aislada de24 variantes con imágenes ocupa3 páginas por volumen de filas; no insertó datos en la aplicación. Las páginas1/2 repiten encabezados de tabla y la3 contiene secciones técnicas completas.

Carta: revisado ajuste proporcional centrado del PDF A4 a612x792pt en archivo temporal, sin cortes. No se añadió selector de tamaño; para papel Carta se debe usar Ajustar al área imprimible. No se realizó impresión física ni se certifican todos los controladores de impresora.

## E. Conservado sin cambios

Consultas, DTO, modelos, cálculos, precios, inventarios, presentaciones, atributos, variantes, fiscalidad, reglas de negocio, Auth, Firebase, Ticket08 y vista previa web. No escrituras de datos, catálogos ni QA en aplicación. No SQL manual ni migraciones. Sin commit, push, deploy o publicación.

Cotejo de textos de los dos PDF originales adjuntos frente a los dos finales: todos los tokens de contenido y todos los importes coinciden. Únicas ausencias: Información general y Descripción como rótulos redundantes. Ver cotejo.json. El servicio conserva su información aplicable sin presentaciones ficticias.

## F. Validación, riesgos y límites

- Build API:0 errores;785 advertencias existentes. git diff --check PASS.
- Imagen principal mayor, nombre dominante, precio/inventario reconocibles, tablas y miniaturas mejoradas: PASS visual en ambos renders.
- Sin texto fuera del tamaño de página: PASS mediante coordenadas de extracción; sin cortes observados visualmente.
- Paginación ampliada: PASS en fixture aislado24 variantes; headers repetidos y títulos acompañados.
- El contenido largo puede requerir más páginas; no se fuerza una sola hoja. Imágenes remotas dependen de su disponibilidad y calidad original; el fallback permanece.
- Responsive web no cambió; se validó el documento PDF de tamaño fijo, no se certifica un rediseño de la vista web.
- Pendiente únicamente QA manual/impresión física PO. El pendiente de catálogo Rojo de la iteración anterior no pertenece a este rediseño y no se tocó.

## G. Checklist para QA manual

- [ ] Levantar frontend5200/API5127 y abrir producto001 → Ficha técnica → Descargar PDF.
- [ ] Comparar imagen, nombre, descripción, metadata, etiquetas e importes contra la ficha web.
- [ ] Confirmar cuatro presentaciones y variantes946ml,5L,10L,20L con sus imágenes/precios vigentes.
- [ ] Confirmar inventario, atributos, logística y SAT completos.
- [ ] Descargar Cambio de Aceite: una página, sin presentaciones de producto.
- [ ] Imprimir A4; en Carta usar Ajustar al área imprimible y revisar legibilidad/márgenes.
- [ ] En un registro con más contenido, verificar headers repetidos y secciones sin títulos aislados.

## Cierre operativo

Puertos inicialmente libres. Frontend Codex9004 y API Codex9002 →9083 →9217 durante las revisiones. Todos detenidos al cierre; lsof confirma5200/5127 sin listeners. No se dejaron servidores locales activos.
