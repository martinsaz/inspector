# Patron CheckApp - Catalogos V1

Estado: APROBADO PO
Fecha de formalizacion: 2026-09-25
Golden Master SIMPLE / COMPACTO: PS-ACT-01S-R5

## Decision PO

PS-ACT-01S-R5 queda aprobado por Product Owner. La propuesta `PROPUESTA_CANDIDATA_PATRON_CATALOGOS` deja de ser candidata y se formaliza como:

`PATRON CHECKAPP OFICIAL - CATALOGOS V1`

Esta formalizacion documenta el patron para reutilizacion futura. No migra otros catalogos, no rediseña Productos y Servicios y no modifica codigo funcional.

## Referencias oficiales compactas

El Golden Master simple/compacto esta formado por los cinco catalogos de Productos y Servicios aprobados en PS-ACT-01S-R5:

- Categorias.
- Marcas.
- Unidades de medida.
- Colecciones.
- Etiquetas.

La referencia aplica a:

- Quick-create desde `/ProductosServicios/Index`.
- Alta en CRUD independiente.
- Edicion en CRUD independiente.
- Desktop.
- Tablet.
- Mobile.

## Capsula oficial de dimensionamiento

Regla permanente:

`EL PATRON CHECKAPP DE CATALOGOS NO DEFINE UN ANCHO UNICO UNIVERSAL PARA TODOS LOS CATALOGOS.`

### Catalogo SIMPLE / COMPACTO

Aplica cuando el formulario tiene pocos campos y no requiere una distribucion compleja.

Ejemplos Golden Master:

- Categorias.
- Marcas.
- Unidades de medida.
- Colecciones.
- Etiquetas.

Estos usan el ancho compacto homologado aprobado en PS-ACT-01S-R5. La altura no se homologa artificialmente; depende del contenido real de cada catalogo.

### Catalogo AMPLIADO

Aplica cuando el catalogo contiene mayor cantidad de campos, grupos de informacion, relaciones, direccion, configuracion, selectores multiples u otra informacion que haria incomoda la captura en ancho compacto.

Ejemplo conceptual:

- Sucursales.

Sucursales no queda declarado como Golden Master ampliado en esta formalizacion. Cuando exista un ticket especifico, debe auditarse el formulario real, clasificarse como SIMPLE o AMPLIADO y presentarse a QA PO antes de promoverlo como referencia ampliada.

En catalogos AMPLIADOS no se debe forzar el ancho compacto. Se permite mayor ancho usando breakpoints, contenedores y lenguaje visual oficiales del Patron CheckApp.

## Reglas obligatorias para SIMPLE y AMPLIADO

Ambas variantes conservan el mismo patron visual. La diferencia principal es dimensionamiento y distribucion del contenido.

Debe preservarse:

- Lenguaje visual CheckApp.
- Encabezado con kicker/seccion, titulo y boton X.
- Jerarquia tipografica oficial.
- Inputs, selects, radios, checks y ayudas compactas.
- Hints/tooltips cuando el concepto pueda generar duda.
- Espaciados y bordes del Patron CheckApp.
- Footer con `Cancelar` y `Guardar`.
- Validaciones y estados.
- Accesibilidad, foco y ARIA.
- Responsive real.
- Lifecycle de modales, overlays y editores.
- Comportamiento Alta/Edicion.
- Quick-create equivalente al CRUD cuando aplique.
- DynamicGrid cuando corresponda.
- Baja logica y reactivacion cuando aplique.
- Filtros y botones oficiales del Patron CheckApp.

## Altura

La altura nunca debe homologarse artificialmente.

Prohibido:

- Agregar espacio vacio para igualar alturas.
- Fijar alturas innecesarias.
- Comprimir formularios solo para hacerlos pequenos.

El modal debe crecer de manera natural y usar scroll cuando el contenido lo requiera.

## Regla de seleccion

Antes de implementar un catalogo nuevo, Codex debe clasificarlo por estructura real del formulario:

- `CATALOGO SIMPLE`: pocos campos, captura directa y legible en variante compacta.
- `CATALOGO AMPLIADO`: suficientes campos o grupos como para comprometer legibilidad, captura o responsive si se fuerza el ancho compacto.

La clasificacion no se decide por nombre del modulo. Si existe duda real, reportar la clasificacion propuesta al PO antes de reinterpretar el diseno.

## Responsive

Desktop:

- SIMPLE usa ancho compacto aprobado.
- AMPLIADO usa ancho suficiente segun contenido.

Tablet:

- Ambas variantes se adaptan al viewport con margenes seguros.

Mobile:

- Ambas variantes convergen al ancho disponible del viewport con margenes seguros.

Nunca debe existir overflow horizontal destructivo.

## Hints y labels

Se preserva la decision PS-ACT-01S-R5:

- Preferir hints/placeholders y ayudas compactas cuando el contexto sea evidente.
- Usar tooltip o icono de ayuda para conceptos que puedan generar duda.
- No eliminar labels cuando hacerlo provoque ambiguedad.

La prioridad es claridad + compactacion, no simplemente quitar labels.

## Editores y campos complejos

TinyMCE solo se usa cuando el contrato funcional requiere descripcion enriquecida.

Prohibido:

- Agregar TinyMCE por consistencia visual.
- Crear campos artificiales para igualar modales.

Ejemplo oficial:

- Etiqueta = solo `Nombre`, sin `Descripcion` y sin TinyMCE.

## Quick-create

Cuando un catalogo pueda crearse desde otro formulario, quick-create debe reutilizar el mismo patron visual y funcional del CRUD.

No debe existir una segunda version visual del mismo catalogo.

La variante nested-modal puede adaptarse al contexto sin perder:

- Estructura.
- Validaciones.
- Campos.
- Comportamiento.
- Lifecycle.
- Datos capturados en el modal padre.

## Protecciones de alcance

Esta formalizacion no autoriza:

- Migrar otros catalogos.
- Implementar Sucursales.
- Declarar Golden Master ampliado.
- Tocar Login/Auth/Firebase/sesion.
- Tocar Roles/Permisos.
- Tocar tenant.
- Tocar API/BD.
- Ejecutar DDL o datos.
- Tocar Legacy/Tarahumara.
- Tocar BL-03 / OC / Recepcion / Curvas.
- Tocar T25.
- Tocar Reporte Lider.
- Ejecutar Parte 2 de ProductosServicios.
- Crear CSS paralelo o DynamicGrid paralelo.
- Convertir el ancho compacto en regla universal.

## Dictamen

`PATRON CHECKAPP - CATALOGOS V1`

`FORMALIZADO / APROBADO PO`

Golden Master SIMPLE:

`PS-ACT-01S-R5`

Capsula de dimensionamiento:

`ACTIVA`
