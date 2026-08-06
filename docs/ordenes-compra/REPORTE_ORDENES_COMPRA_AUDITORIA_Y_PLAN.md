# REPORTE DE ÓRDENES DE COMPRA

Fecha: 2026-08-05
Fase: Planeación y auditoría
Estado: Propuesta para aprobación del Product Owner

## Principio rector

El `Reporte de Órdenes de Compra` debe consumir exactamente el mismo documento administrativo ya definido en el vertical `Órdenes de Compra`.

No se autoriza:

- reinterpretar estados;
- reinterpretar folios;
- reinterpretar reglas;
- reinterpretar modelos;
- crear una segunda lógica de consulta;
- crear una vista “parecida” con semántica distinta;
- separar el reporte del mismo ciclo documental de `Borrador`, `Generada` y `Cancelada`.

El reporte será únicamente una vista de consulta del mismo documento administrativo persistido en:

- `dbo.OrdenesCompra`
- `dbo.OrdenesCompraDetalle`
- `dbo.OrdenesCompraFolios`

Fuentes auditadas:

- referencia visual Rarámuri `/almacen/compras/ordenes` y capturas provistas por Product Owner;
- `ORDENES_COMPRA_BACKLOG_FINAL.md`;
- `ORDENES_COMPRA_API.md`;
- `ORDENES_COMPRA_MODELO_DATOS.md`;
- `ORDENES_COMPRA_SQL_API_QA.md`;
- `inspector/AGENTS.md`;
- `inspector/CLAUDE.md`;
- `docs/ui/USO_PATRON_CHECKAPP.md`;
- `docs/ui/CHECKAPP_COMPONENTES.md`.

## 1. Auditoría completa de la pantalla de referencia

La referencia Rarámuri muestra una pantalla de consulta administrativa con estos bloques:

- encabezado corto de módulo;
- panel de filtros desplegable;
- filtros de proveedor, agrupador operativo, tipo de fecha, estado y rango;
- acciones de `Buscar`, `Cancelar`, `Limpiar` y `Excel`;
- área de resultados con estado vacío;
- jerarquía visual muy enfocada en consulta, no en captura.

Valor real observado en la referencia:

- el usuario entiende rápido que está consultando documentos existentes;
- los filtros ocupan la parte superior y dominan la primera interacción;
- el listado queda subordinado a la búsqueda;
- la exportación vive como acción de resultado, no como función independiente.

Elementos de referencia que sí aportan valor:

- bloque de filtros compacto;
- lectura inmediata del contexto de búsqueda;
- acción principal clara para buscar;
- exportación visible sólo como salida del mismo listado;
- estado vacío explícito.

Elementos de referencia que no deben trasladarse literalmente:

- filtro por `Tiendas` como concepto de distribución;
- `Tipo fecha` si fuerza una lectura distinta al modelo real aprobado;
- cualquier texto o semántica propia de abastecimiento por tienda;
- cualquier lógica que sugiera un documento diferente al ya implementado en CheckList.

## 2. Comparativo entre Rarámuri y CheckList

### Coincidencias funcionales válidas

- ambos requieren consulta administrativa de órdenes;
- ambos necesitan filtros visibles y listados exportables;
- ambos se benefician de un estado vacío claro;
- ambos pueden usar una acción primaria de búsqueda y una secundaria de limpieza.

### Diferencias estructurales obligatorias

- Rarámuri consulta pedidos con contexto operativo de tiendas.
- CheckList consulta el mismo documento administrativo de `Órdenes de Compra` ya aprobado para razón social, sucursal y proveedor.
- Rarámuri permite una lectura asociada a su abastecimiento.
- CheckList debe limitarse al documento persistido con sus estados reales:
  - `1 = Borrador`
  - `2 = Generada`
  - `3 = Cancelada`

### Hallazgo clave

CheckList ya cuenta con contratos reales para consulta:

- `ObtenerOrdenesCompra`
- `ObtenerResumenOrdenesCompra`
- `ObtenerCombosOrdenCompra`
- `ExportarOrdenesCompra`
- `ObtenerOrdenCompra`

Por lo tanto, el nuevo vertical no debe rediseñar el documento ni proponer otro origen de datos. Debe formalizar la vista de consulta del mismo documento ya persistido.

## 3. Componentes reutilizables del Patrón CheckApp

Componentes oficiales que sí deben reutilizarse:

- `checkapp-hero`
- `checkapp-summary-strip`
- `checkapp-summary-card`
- `checkapp-field`
- `checkapp-btn-*`
- `CheckAppFilterAccordion`
- `CheckAppDynamicGrid`
- `checkapp-status-inline`
- `ca-state--loading`
- `ca-state--empty`
- `ca-state--error`
- modal CheckApp para acciones de documento si se autorizan después

Motivo:

- ya existen como patrón oficial;
- evitan una pantalla aislada;
- son coherentes con el vertical congelado de Órdenes de Compra;
- son la ruta correcta para filtros, grid, exportación y responsive.

## 4. Componentes que NO deben copiarse

No deben copiarse de Rarámuri:

- filtro `Tiendas` como entidad primaria;
- agrupaciones de surtido por tienda;
- texto de `consulta por proveedor, fechas y estatus` si omite razón social y sucursal;
- cualquier acción que sugiera consolidación operativa;
- componentes visuales ajenos al patrón CheckApp;
- layout rojo Tarahumara como skin principal;
- lógica de “tipo de fecha” si reinterpreta el documento en lugar de consultar fechas ya existentes.

## 5. Componentes que sí deben adaptarse

Sí deben adaptarse conceptualmente:

- hero corto de módulo;
- bloque de filtros plegable con resumen visible;
- acción principal de búsqueda;
- acción secundaria de limpiar;
- exportación del listado;
- estado vacío con mensaje de guía;
- KPI strip superior.

Adaptación correcta para CheckList:

- `Tiendas` debe sustituirse por `Razón social` y `Sucursal`, que sí pertenecen al documento real.
- `Status` debe consumir exactamente los estados reales del vertical.
- el resultado debe navegar al mismo `Detalle` del documento ya existente.

## 6. Flujo propuesto

Flujo MVP propuesto:

1. El usuario entra a `Proveeduría > Órdenes de compra > Reporte`.
2. Visualiza KPIs resumidos del mismo documento persistido.
3. Abre o revisa el acordeón de filtros.
4. Filtra por búsqueda libre, estado, proveedor, razón social, sucursal y rango de fechas.
5. Ejecuta `Buscar`.
6. Visualiza resultados en grid administrativo.
7. Desde cada fila consulta el mismo documento en `Detalle`.
8. Si necesita exportar el listado completo filtrado, usa `Excel`.
9. Si necesita PDF o Excel del documento individual, lo hace desde `Detalle`, no desde una lógica paralela del reporte.

## 7. Wireframe funcional descriptivo

### Header

- kicker: `Proveeduría`
- título: `Reporte de órdenes de compra`
- copy: `Consulta el mismo documento administrativo por folio, proveedor, razón social, sucursal, estado y fecha.`
- acción secundaria opcional: `Nueva`

### KPI strip

- `Total`
- `Borradores`
- `Generadas`
- `Canceladas`

### Filtros

Fila 1:

- búsqueda libre;
- estado;
- proveedor.

Fila 2:

- razón social;
- sucursal;
- fecha desde;
- fecha hasta.

Acciones:

- `Buscar`
- `Limpiar`
- `Exportar Excel`

### Grid

- toolbar con conteo;
- selector de columnas si se aprueba en implementación;
- tabla administrativa;
- estado vacío;
- paginación;
- cards móviles para tablet y mobile.

### Resultado por fila

- documento identificado por folio;
- estado visible;
- proveedor;
- razón social;
- sucursal;
- total;
- fecha;
- acción principal `Ver detalle`.

## 8. Filtros propuestos

Filtros MVP:

- búsqueda libre por `Folio`, `Proveedor`, `Razón social`, `Sucursal`;
- `Estado`;
- `Proveedor`;
- `Razón social`;
- `Sucursal`;
- `Fecha desde`;
- `Fecha hasta`.

Regla funcional:

- los filtros deben operar sobre el mismo dataset de `ObtenerOrdenesCompra`;
- no deben exigir tablas nuevas;
- no deben introducir un filtro por `tienda` que no exista en el documento aprobado.

Filtro descartado para MVP:

- `Tipo fecha`.

Motivo:

- el modelo actual ya expone `FechaOrden` y `FechaLlegada`;
- el endpoint existente filtra hoy por rango aplicado a `FechaOrden`;
- introducir selector de tipo de fecha sería una ampliación funcional, no una necesidad del MVP.

## 9. Columnas propuestas

Columnas MVP:

- `Folio`
- `Fecha de orden`
- `Fecha de llegada`
- `Razón social`
- `Sucursal`
- `Proveedor`
- `Estado`
- `Total`
- `Fecha de creación`
- `Acciones`

Columnas descartadas:

- `OperationId`
- `IdentityKey`
- `idEmpresa`
- IDs internos;
- cualquier GUID;
- payload técnico;
- nombre de endpoint;
- banderas internas `PuedeEditar`, `PuedeGenerar`, `PuedeCancelar` como columnas visibles.

## 10. Acciones propuestas

Acciones MVP por fila:

- `Ver detalle`
- `Editar` sólo si el documento está en `Borrador`
- `Cancelar` sólo si el documento está en `Borrador` o `Generada`, sujeto a aprobación funcional final del PO

Acciones globales:

- `Buscar`
- `Limpiar`
- `Exportar Excel`
- `Nueva`

Acciones descartadas en MVP:

- PDF directo desde el grid como duplicación de flujo;
- Excel del documento directo desde el grid;
- acciones masivas;
- consolidaciones;
- aprobaciones;
- reenvíos.

## 11. Exportaciones necesarias

Exportación necesaria en MVP:

- Excel del listado filtrado.

Motivo:

- ya existe `ExportarOrdenesCompra`;
- mantiene la pantalla como reporte;
- evita crear un segundo mecanismo documental.

Exportaciones documentales individuales:

- PDF del documento individual;
- Excel del documento individual.

Regla:

- deben seguir viviendo en el flujo de `Detalle`, porque pertenecen al documento, no al reporte como vista.

## 12. Responsive esperado

Desktop:

- filtros completos en dos filas;
- KPIs visibles en una sola tira;
- grid completo con paginación.

Tablet:

- filtros con wrap limpio;
- exportación y acciones visibles sin saturar;
- grid todavía tabular si el ancho lo permite.

Mobile:

- filtros apilados;
- acordeón cerrado por default con resumen visible;
- resultados transformados a cards o grid móvil de `CheckAppDynamicGrid`;
- acciones por fila compactas;
- sin overflow horizontal accidental.

## 13. Endpoints que podrían reutilizarse

Reutilización directa para MVP:

- `GET api/OrdenesCompra/ObtenerOrdenesCompra`
- `GET api/OrdenesCompra/ObtenerResumenOrdenesCompra`
- `GET api/OrdenesCompra/ObtenerCombosOrdenCompra`
- `GET api/OrdenesCompra/ExportarOrdenesCompra`
- `GET api/OrdenesCompra/ObtenerOrdenCompra`

Reutilización funcional:

- los estados y nombres visibles deben venir del mismo origen ya existente;
- las acciones permitidas deben seguir el mismo contrato `PuedeEditar`, `PuedeGenerar`, `PuedeCancelar`;
- el detalle debe abrir el mismo documento ya certificado.

## 14. Endpoints nuevos

Para MVP:

- no se justifican endpoints nuevos.

Sólo podrían considerarse después si el Product Owner aprueba una fase posterior con:

- paginación server-side real;
- filtro por fecha de llegada independiente del de fecha de orden;
- exportaciones avanzadas distintas del Excel actual;
- KPIs ampliados por proveedor o sucursal.

Pero en esta fase no deben proponerse como requisito del MVP.

## 15. Riesgos

- ya existe una vista `Index.cshtml` y un `HomeController` con rastros de un reporte en trabajo; ese material debe tratarse como antecedente técnico, no como autorización implícita.
- el controlador MVC actual redirige `Index` a `Nueva`; por tanto el menú `Reporte` todavía no está formalizado.
- el JS actual auditado pertenece al editor (`data-oc-page='editor'`), no al reporte; reutilizarlo sin separar responsabilidades sería un riesgo.
- si se implementa un filtro de fecha distinto al contrato actual, se rompería la regla de “misma lógica, mismo documento”.
- mostrar acciones distintas a las que permite el contrato `PuedeEditar/PuedeCancelar` abriría una segunda interpretación del documento.

## 16. Alcance del MVP

El MVP debe incluir únicamente:

- alta documental del menú `Reporte`;
- pantalla de consulta administrativa;
- KPIs básicos del mismo documento;
- filtros por búsqueda, estado, proveedor, razón social, sucursal y fechas;
- listado con columnas administrativas;
- navegación al mismo `Detalle`;
- exportación Excel del listado;
- estados `loading`, `empty` y `error`;
- responsive desktop, tablet y mobile.

## 17. Alcance de fases posteriores

Fases posteriores, sólo si el PO las autoriza:

- paginación server-side;
- selector de rango rápido;
- filtro alterno por fecha de llegada;
- acciones rápidas por fila;
- badges KPI por proveedor o sucursal;
- personalización de columnas persistente por usuario.

No forman parte del MVP:

- nuevo modelo de datos;
- nuevas tablas;
- nuevos estados;
- nuevo documento;
- lógica de tienda;
- lógica de Rarámuri.

## 18. Plan completo de implementación

### Paso 1. Formalizar la ruta

- exponer `Reporte` en menú bajo `Proveeduría > Órdenes de compra`;
- enrutar a la vista de consulta sin alterar `Nueva` ni `Detalle`.

### Paso 2. Formalizar la pantalla CheckApp

- hero;
- KPI strip;
- filtros con `CheckAppFilterAccordion`;
- grid con `CheckAppDynamicGrid`;
- estado vacío y exportación.

### Paso 3. Conectar únicamente contratos ya existentes

- combos;
- resumen;
- listado;
- exportación.

### Paso 4. Respetar el documento real

- misma semántica de estados;
- mismos folios;
- mismas fechas;
- mismas reglas de acciones.

### Paso 5. Navegación

- `Ver detalle` siempre debe abrir el documento real;
- el reporte no debe renderizar un “detalle alterno”.

### Paso 6. QA posterior

- validar que el reporte y el documento individual coincidan;
- validar que `Borrador`, `Generada` y `Cancelada` se lean idéntico al vertical fuente;
- validar exportación del listado;
- validar responsive.

## 19. Criterios de aceptación

- el menú final documentado queda:
  - `Proveeduría`
  - `Órdenes de compra`
  - `Nueva`
  - `Reporte`
- la pantalla consulta exactamente el mismo documento administrativo ya aprobado;
- el estado visible del reporte coincide con el contrato del vertical;
- el folio visible coincide con el persistido;
- `Ver detalle` abre el mismo documento certificado;
- no aparecen IDs internos ni mensajes técnicos;
- el listado se puede filtrar por los campos realmente existentes del modelo;
- la exportación Excel del listado usa el mismo dataset del reporte;
- no se crean tablas, estados ni endpoints para el MVP;
- no se copia lógica de tiendas, tallas, curvas o consolidaciones de Rarámuri.

## 20. Recomendación final del PM

Se recomienda aprobar un MVP estrictamente documental y de consulta, construido como vista del mismo vertical `Órdenes de Compra`, reutilizando los endpoints y modelos ya certificados.

Recomendación explícita:

- sí a `Reporte` como vista de consulta del mismo documento;
- sí a filtros y grid administrativos CheckApp;
- sí a exportación Excel del listado;
- sí a navegación al detalle real;
- no a reinterpretar estados, folios o reglas;
- no a copiar la semántica operativa de Rarámuri;
- no a nuevos endpoints para el MVP;
- no a una segunda versión del documento administrativo.

Dictamen funcional:

El reporte debe nacer como una extensión natural del vertical congelado de `Órdenes de Compra`, no como un módulo hermano autónomo. Si se respeta esta regla, el MVP es claro, reutilizable y de bajo riesgo técnico.
