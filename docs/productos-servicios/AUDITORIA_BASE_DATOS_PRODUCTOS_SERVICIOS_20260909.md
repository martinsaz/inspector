# Auditoría de base de datos — Productos y Servicios — 2026-09-09

**Estado: PARCIAL. Auditoría estática realizada; auditoría de base real bloqueada por autenticación SQL. No declarar completada.**

## 1. Resumen ejecutivo y cierre de Ticket 10

El Product Owner aprobó manualmente los PDF de Producto y Servicio y cerró definitivamente Ticket 10. AGENTS.md y CLAUDE.md de ambos repositorios registran: **TICKET 10 CERRADO POR PRODUCT OWNER — PDF PRODUCTO Y SERVICIO APROBADOS.** No se cambió su código ni su diseño.

La configuración de API apunta a `sql5111.site4now.net`, base `db_a883c3_checklist`, conexión `ConnectionStrings:CadenaConexionSQLServer`. El intento directo desde el mismo proveedor SqlClient fue rechazado con **SQL 18456, login fallido**. Esta identificación es de CONFIGURACIÓN, no una respuesta de `DB_NAME()` del servidor autenticado. No se obtuvieron metadatos ni filas de esa base en esta iteración. La configuración local no declara UserSecretsId ni una conexión alternativa en appsettings.Development.json o launchSettings; el entorno de esta ejecución no contiene override de conexión.

Se localizaron **20 tablas de dominio declaradas en scripts**, **255 columnas declaradas** (incluida NombreNormalizado calculada), 24 FK declaradas en el núcleo y 50 declaraciones de índices no PK. **No son conteos de objetos reales**. No se reproducen los conteos de QA anteriores como datos actuales. Es necesario habilitar la conexión vigente de lectura para terminar el esquema real, conteos, integridad y drift.

La revisión estática confirma: imagen propia por variante contemplada en persistencia y contratos; atributos descriptivos separados de opciones comerciales; existencias por empresa/producto, sin dimensión sucursal ni variante en el modelo versionado; precio público por una unidad base y presentaciones adicionales independientes; precio unitario legacy conservado. Estos hallazgos describen el código disponible, no certifican la base desplegada.

## 2. Alcance, evidencia y límites

- API: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs`.
- Frontend MVC: `/Users/denissemendiola/dev/Inspecciones/inspector/checklist`.
- Las menciones `API:n` apuntan a [ProductosServiciosController.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs); `JS:n` a [ProductosServicios.js](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/wwwroot/js/ProductosServicios/ProductosServicios.js).
- Contratos: [ProductosServiciosModels.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Models/ProductosServicios/ProductosServiciosModels.cs).
- DDL consolidado, columnas/tipos/null/default/PK y relaciones **declaradas**: [anexo de esquema](auditoria-20260909/ESQUEMA_DECLARADO_NO_CERTIFICADO.md).
- No se levantaron servidores, no se usó navegador, no se ejecutaron endpoints de guardado, ni scripts UP/DOWN. No se modificaron SQL de aplicación, esquema, datos, Auth, sesión ni código funcional.
- El intento de conexión falló antes de ejecutar cualquier SELECT; los SELECT preparados permanecen pendientes. No se ejecutó SQL de escritura.
- El esquema de scripts no demuestra ausencia de otras tablas, triggers, índices, SP o columnas en SQL real. La clasificación definitiva depende de esa lectura.

## 3. Inventario de tablas y consumidores

Todas las 20 tablas listadas declaran `id uniqueidentifier` como PK y `idEmpresa uniqueidentifier NOT NULL`; idEmpresa no integra esa PK simple. Los índices y FK compuestos por empresa se detallan en el anexo. Frontend consume DTO a través del proxy MVC, no tablas SQL directamente.

La clasificación A–E siguiente es **provisional según uso del código**: A necesaria; B activa mejorable; C legacy aún utilizada; D aparentemente obsoleta; E no determinable sin decisión/lectura adicional. No hay evidencia suficiente para clasificar una tabla completa C o D ni autorizar su eliminación.

| Tabla | Guarda / relaciones funcionales | Uso API / interfaz | Clasificación estática |
|---|---|---|---|
| ProductosServicios | Registro maestro, tipo, identidad comercial, precios, fiscal, controles, enlaces a catálogos e imagen principal | Listado/detalle/guardar/ficha API:103,285,557,1130; Index y editor | B: mezcla campos vigentes y legacy |
| ProductosServiciosCategorias | Catálogo, AplicaA 0 todos/1 producto/2 servicio | CRUD API:1713–1823; categoría en editor y catálogo | A |
| ProductosServiciosMarcas | Catálogo de marcas, relación N:1 del producto | CRUD API:1825–1947; marca de producto | A |
| ProductosServiciosColecciones | Número, nombre y descripción; colección N:1 | Guardar API:2061; combo/alta rápida colección | A |
| ProductosServiciosUnidadesMedida | Unidad base y unidad de venta; flags y factor de conversión | API:1949–2059,4144; catálogos, combos, presentaciones, pricing engine | B: evolución de catálogo y unicidad repartida |
| ProductosServiciosPaquetes | Contenedor logístico, dimensiones y peso vacío; N:1 | API:2163 y cálculo:737; catálogo/selector paquete | B: predeterminado por código, revisar garantía física |
| ProductosServiciosTags | Etiquetas por empresa; nombre normalizado calculado | API:1532,3046; multiselección y chips | A |
| ProductosServiciosProductoTags | Puente N:M producto/servicio↔tag | API:3101 y sincronización de tags; chips | A |
| ProductosServiciosAtributos | Catálogo de atributos descriptivos | API GuardarAtributoProductoServicio; Configuración de atributos | A |
| ProductosServiciosAtributosValores | Elementos dependientes de cada atributo, 1:N | API:6210 validación/alta; selector Elemento | A |
| ProductosServiciosProductoAtributos | Asociación producto/servicio↔atributo, N:M | API ObtenerAtributosProductoAsync; asociaciones descriptivas | A |
| ProductosServiciosProductoAtributoValores | Elementos elegidos por asociación, 1:N | API:5308 y sincronización; lista agrupada en ficha | B: consistencia atributo↔valor a validar |
| ProductosServiciosOpcionesVariante | Opciones comerciales propias del registro, 1:N | API:5964 sincronización; Matriz de variantes | A |
| ProductosServiciosOpcionesVarianteValores | Valores de una opción, 1:N | API:5977; generación de combinaciones JS | A |
| ProductosServiciosVariantes | Combinación comercial, SKU, costo/precios e imagen propia | API:5400,6038; matriz y ficha | B: precios legacy y reemplazo transaccional |
| ProductosServiciosVarianteValores | Puente variante↔valor de opción; conserva referencias legacy a atributo | API:5427,6132; valores de combinación | B: columnas de dos modelos, uso nuevo separado |
| ProductosServiciosMultimedia | Adjuntos generales de registro y metadatos; 1:N | API subida/sincronización multimedia; Evidencia del producto o servicio | B: tipo textual y flags redundantes |
| ProductosServiciosExistencias | Saldo, mínimo y costo promedio por empresa/producto; 1:0..1 | API:3397,3473; bloque Inventario y consultas comerciales | B: sin sucursal/variante; costo no demuestra promedio ponderado |
| ProductosServiciosMovimientosInventario | Historial de cantidades, saldos y costo por movimiento; 1:N | API:2475–2619,3177; entradas/salidas/ajustes | B: consistencia de saldo depende de transacción API |
| ProductosServiciosPresentacionesVenta | Venta cantidad+unidad, equivalencia a base, precio independiente | API:1342–1467,3312,3367; editor presentaciones y motor | B: idUnidadVenta y regla base dependen parcialmente de API |

### Dominio extendido y falsos positivos

`CotizacionesPartidas` referencia lógicamente `idProductoServicio` y conserva snapshot comercial; `CotizacionesController.cs:1197` consulta ProductosServicios, UnidadesMedida y Existencias con empresa. El DDL de Cotizaciones y CotizacionesPartidas está embebido en ese controller (`1390`, `1423`), fuera de los scripts del núcleo. No se ejecutó.

`OrdenesCompraDetalle` usa idProductoServicio e idUnidadMedida; `OrdenesCompraController.cs:781,1714` obtiene productos/unidades y el script `ordenes-compra-up.sql` declara la tabla detalle. `OrdenesCompra` es cabecera, no catálogo de producto. Estas tablas consumidoras no se incluyen en el conteo de 20 tablas del núcleo. Deben añadirse al recorrido de FK reales y a las consultas de huérfanos.

`Empresa` es raíz lógica de idEmpresa; `Usuarios` es destino conceptual de idUsuario de movimientos. La existencia y PK exacta de las tablas externas se deben consultar antes de construir esos joins de integridad. Ningún script del núcleo revisado declara FK a Empresa/Usuarios. Las coincidencias de “ProductosServicios” en controllers Clientes/CorreoSaliente son nombres de headers de contexto compartidos: no prueban tablas nuevas del dominio.

## 4. Tabla principal: significado de cada columna

Estado y tipo SQL declarado en anexo; uso funcional a continuación. “Legacy” no significa eliminable. La ausencia real o el desuso global no pueden certificarse sin metadatos, datos y consumidores externos.

| Columna | Significado / uso vigente comprobado en código |
|---|---|
| id | Identificador del producto/servicio y llave de todas sus colecciones hijas. |
| idEmpresa | Ámbito tenant validado contra contexto; filtros y joins SQL. |
| identityKey | GUID técnico generado en altas; no se observó uso comercial que permita declararlo obsoleto. |
| Tipo | 1 Producto / 2 Servicio; API constantes líneas 26–27 y normalización al guardar. |
| Codigo | Identidad comercial visible en grid, detalle, ficha y documentos. |
| Tag | Sombra/fallback legacy; lectura API:3101 y ResolveLegacyTagShadow al guardar. Convive con puente de tags. |
| Nombre | Nombre visible y persistido. |
| Descripcion | Descripción rica/comercial; ficha y editor. |
| idCategoria | Clasificación obligatoria y AplicaA de categoría. |
| idMarca | Marca opcional; API la vacía para Servicio. |
| idUnidadMedida | Unidad BASE del precio público e inventario; no es presentación. |
| Costo | Costo del registro; base de ganancia/margen. También alimenta inicialización de CostoPromedio. |
| PrecioPublico | Precio de UNA unidad base; sincroniza exclusivamente presentación base 1:1. |
| CausaInventario | Habilita inventario para Producto. |
| PermiteVentaSinExistencia | Permite salida con saldo negativo cuando cumple las validaciones API. |
| ImagenUrl | URL de imagen principal del registro, independiente de variante y adjuntos. |
| ImagenNombre | Nombre original de imagen principal. |
| Activo | Estatus operativo; filtros activo/inactivo y baja lógica. |
| FechaCreacion | Auditoría temporal, UTC en API y default versionado. |
| FechaActualizacion | Última modificación. |
| FechaArchivado | Fecha de baja lógica cuando el flujo la actualiza. |
| PrecioComparacion | Precio comparativo independiente; no reemplaza PrecioPublico. |
| PrecioUnitarioMonto | Legacy. API lo lee; nuevas altas normalizan null; UPDATE preserva histórico por COALESCE. |
| PrecioUnitarioCantidadTotal | Legacy, cantidad del antiguo precio unitario; lectura/resumen y preservación histórica. |
| PrecioUnitarioUnidadTotal | Legacy, texto de unidad total; no FK a catálogo. |
| PrecioUnitarioBaseCantidad | Legacy, medida base del cálculo de precio unitario. |
| PrecioUnitarioUnidad | Legacy, texto de unidad previa. |
| PrecioUnitarioUnidadBase | Legacy, texto unidad base del antiguo precio unitario. |
| ObjetoImpuesto | Código fiscal persistido. Guardado normaliza 02 si IVA activo, en otro caso 01; presentación final Sí/No. |
| PorcentajeIVA | Porcentaje fiscal persistido (decimal 5,2 declarado); API normaliza a 0 cuando no es 02. |
| ClaveProductoSat | Clave persistida; descripción enriquecida desde catálogo externo. |
| ClaveUnidadSat | Clave persistida; descripción externa; fallback H87 en flujos existentes. |
| EsProductoFisico | Controla aplicabilidad de logística; no equivale a CausaInventario. |
| PesoKg | Peso real del producto; fuente de cálculo logístico. |
| LargoCm | Dimensión de producto conservada por compatibilidad; logística actual usa dimensiones del paquete. |
| AnchoCm | Dimensión de producto conservada; no confundir con AnchoCm del paquete. |
| AltoCm | Dimensión de producto conservada; no confundir con AltoCm del paquete. |
| UsaNumeroSerie | Flag de control conservado; no demuestra existencia de inventario serializado ni tabla de series. |
| idColeccion | Colección opcional multitenant. |
| idPaquete | Referencia a catálogo logístico; fuente de dimensiones y peso vacío. |

API listado/detalle/ficha selecciona estas propiedades; alta/edición centralizada en API:1218–1260. El frontend las representa mediante DTO y `ProductosServicios.js`; los seis campos de precio unitario se envían vacíos (`JS:3368–3374`). No confundir una ocurrencia en DTO con edición activa en UI.

## 5. PK, FK, índices y mapa de relaciones

El anexo enumera PK/defaults, 24 FK y 50 índices **declarados**, por tabla y columnas. Todas las FK del núcleo declaradas incluyen idEmpresa y destino `(idEmpresa,id)`. No se certifican existencia física, confianza (`is_not_trusted`), deshabilitación ni acciones reales de borrado.

Mapa del modelo de código/scripts, pendiente de contraste físico:

```text
Empresa (relación lógica por idEmpresa; FK del núcleo no declarada)
└─ ProductosServicios [Tipo=1 Producto / Tipo=2 Servicio]
   ├─ N:1 Categorias
   ├─ N:0..1 Marcas / Colecciones / Paquetes
   ├─ N:1 UnidadesMedida [unidad base]
   ├─ 1:N ProductoTags → N:1 Tags                 [N:M]
   ├─ 1:N ProductoAtributos → N:1 Atributos       [N:M]
   │  └─ 1:N ProductoAtributoValores → AtributosValores
   │                                  └─ N:1 Atributos
   ├─ 1:N OpcionesVariante
   │  └─ 1:N OpcionesVarianteValores
   ├─ 1:N Variantes [imagen propia y precios]
   │  └─ 1:N VarianteValores → OpcionesVariante / OpcionesVarianteValores
   │                         [columnas legacy a Atributos/Valores, no modelo nuevo]
   ├─ 1:N Multimedia [adjuntos generales]
   ├─ 1:0..1 Existencias [único empresa/producto]
   ├─ 1:N MovimientosInventario
   └─ 1:N PresentacionesVenta → N:1 UnidadesMedida [unidad venta, relación lógica]
      └─ base automática 1 venta = 1 inventario; adicionales independientes
Consumidores: CotizacionesPartidas y OrdenesCompraDetalle → ProductoServicio/unidad
```

La cardinalidad N:M de tags/atributos se materializa mediante puentes, no FK directa N:M. La existencia es opcional: el índice único declarado la limita a una por producto y empresa; no demuestra que todo producto tenga una.

## 6. Multitenant

Todas las tablas del núcleo declaran idEmpresa NOT NULL uniqueidentifier, con PK simple id; las 24 FK declaradas enlazan empresa más id. El anexo indica qué UNIQUE e índices contiene cada tabla. Hay UNIQUE por empresa en códigos de catálogos/producto, número de colección, nombre de atributo, valores por padre, combinación de variante y otras asociaciones. No todo Nombre tiene UNIQUE: paquetes y nombres de ciertos catálogos dependen de validación API. Tags usa nombre normalizado.

API:6692 rechaza empresa cliente distinta del contexto; API:6726 resuelve claims o proxy firmado. No se verificó mediante pruebas de intrusión ni sesiones cruzadas. La presencia de estos controles no certifica aislamiento real de todos los consumidores.

Riesgos estáticos a verificar sin corregir:

- No hay FK del núcleo a Empresa en los scripts: NOT NULL no impide un GUID inexistente. Contar filas sin tenant y tenants inexistentes requiere SELECT real.
- `PresentacionesVenta.idUnidadVenta` se añade sin FK física declarada en los scripts revisados: validar empresa/unidad recae en API; la base real puede tener una FK no versionada.
- Las FK independientes de ProductoAtributoValores a asociación y a elemento no obligan por sí solas a que el elemento sea del atributo de esa asociación.
- Las FK independientes de VarianteValores no prueban por sí solas que opción, valor y variante pertenezcan al mismo producto, aunque compartan empresa. Las columnas legacy admiten NULL y no se halló CHECK que elija un único modelo de referencias.
- Activo de un hijo no queda condicionado por FK a Activo de su padre. Debe medirse, no inferirse que hoy haya inconsistencias.

## 7. Producto vs Servicio

Código: TipoProducto=1 y TipoServicio=2; script CK_ProductosServicios_Tipo declara IN(1,2). Valores efectivamente existentes: **pendientes**. Categoría declara AplicaA 0/1/2.

Servicio: normalización API:4537 vacía marca, CausaInventario, PermiteVentaSinExistencia e inputs de existencia. Inventario y presentaciones se restringen por validación a Producto; el CHECK versionado de la tabla maestra sólo expresa parte de esa regla. No demuestra inexistencia de hijos de servicio insertados por otras vías. Columnas físicas/logísticas están en la misma tabla para ambos tipos, aunque no deban mostrarse/calcule logística de servicio. Atributos y multimedia son capacidades del registro; variantes conservan DTO/colecciones separadas y se debe comprobar si hay filas reales asociadas a servicio.

## 8. Precios

| Concepto | Fuente en código/esquema declarado | Persistido / derivado |
|---|---|---|
| Precio público | ProductosServicios.PrecioPublico | Persistido: una unidad base |
| Costo | ProductosServicios.Costo | Persistido, nullable |
| Ganancia | PrecioPublico − Costo | Derivado en UI/PDF; no columna declarada |
| Margen | (PrecioPublico − Costo) / PrecioPublico × 100 | Derivado; no dividir por cero; UI/ficha tratan ausencia |
| Comparación | ProductosServicios.PrecioComparacion | Persistido, independiente |
| Precio unitario antiguo | seis columnas PrecioUnitario* de maestro | Legacy; lectura y conservación histórica, captura principal deshabilitada |
| Precio/costo variante | ProductosServiciosVariantes.PrecioPublico / Costo | Persistidos, independientes del padre |
| Precio presentación | ProductosServiciosPresentacionesVenta.Precio | Persistido; adicional independiente |
| Costo inventario | Existencias.CostoPromedio; Movimientos.CostoUnitario | Fuentes distintas del costo comercial |

Ganancia/margen: JS:2074–2077 y 2583–2584; PDF calcula en composición. `EnsureAndSynchronizeBasePresentationAsync` (API:3312) busca unidad de venta igual a base, cantidad 1 y equivalencia 1; crea o sincroniza su Precio desde PrecioPublico. EsPredeterminada se deriva como marca legacy de base. Las adicionales no actualizan PrecioPublico. API limita duplicados y protege base ante edición/baja (1342–1451).

**Regla 1:1: PASS en inspección de código; pendiente en datos y cobertura completa de constraints reales.** El índice filtrado versionado garantiza como máximo una predeterminada activa; no garantiza por sí solo cantidad/equivalencia/unidad 1:1 ni existencia de una base por producto. No se certifica PASS global esquema/código/datos.

## 9. Unidades

Unidad base pertenece al registro y expresa inventario/PrecioPublico; unidad de venta pertenece a la presentación. Campos declarados: Codigo, Nombre, Abreviatura, PermiteDecimales, TipoUnidad, EsSistema, EsPersonalizada, FactorConversion decimal(28,12), Convertible, ClaveSistema, Activo y fechas. TipoUnidad evoluciona a WEIGHT/VOLUME/LENGTH/AREA/ITEM/TIME/OTHER. PermiteDecimales es booleano, no una escala decimal numérica.

`GuardarUnidadControladaAsync` API:4144 impide editar Sistema; alta personalizada crea OTHER, sin factor, Convertible=0. Bloquea nombre o abreviatura normalizados duplicados en la empresa, incluso filas inactivas. Sistema/Personalizada no tienen CHECK de exclusión mutua identificado en scripts. UNIQUE de ClaveSistema es filtrado no NULL; nombre/abreviatura no tienen equivalente UNIQUE declarado.

Tiempo calendario: script `ticket-10-unidades-tiempo-no-convertible-up.sql` añade Año/Lustro/Década/Siglo sin factor automático. El catálogo no debe reconstruirse a partir de estos archivos como si fuera su contenido actual. Totales Sistema/personalizadas, duplicados y filas activas reales: pendientes.

## 10. Presentaciones de venta

PK id; FK declarada compuesta al maestro; idUnidadVenta NOT NULL por evolución, sin FK declarada a unidad. CantidadVenta y EquivalenciaBase decimal(18,4) >0; Precio decimal(18,2) >=0; Orden, Activo, FechaArchivado; Nombre legacy derivado por API del catálogo. Baja lógica para adicionales; base protegida en API.

Motor: `Services/ProductosServicios/ProductoPresentacionVentaPricingEngine.cs`; usa equivalencias y precios suministrados, sin tabla nueva ni persistencia propia. Los duplicados por cantidad/unidad/equivalencia activa se comparan en API y no incluyen precio; no se halló un índice único equivalente en scripts. No asumir ausencia de duplicados reales.

## 11. Inventario

Existencias: saldo/minimo decimal(18,4) y CostoPromedio decimal(18,2); nivel **empresa+producto**, sin idSucursal/idVariante/idUnidad propia declarada. Unidad implícita: idUnidadMedida del maestro. UNIQUE declarado `(idEmpresa,idProductoServicio)`.

Movimientos: tipo 1 existencia inicial, 2 entrada, 3 salida, 4 ajuste positivo, 5 ajuste negativo; Cantidad positiva, saldos anterior/posterior, costo, referencia, observaciones, usuario y fecha. No hay flags Activo ni FechaArchivado declarados para estas dos tablas.

API:2564 opera en transacción Serializable, consulta existencia con bloqueo y actualiza saldo/movimiento. La persistencia admite saldo negativo por esquema declarado (no CHECK ExistenciaActual>=0); API valida PermiteVentaSinExistencia para salidas. Cantidad >0 no implica saldo positivo. `SynchronizeInventoryForSaveAsync` (3473) inicializa o actualiza controles y preserva historia bajo validaciones; no se ejecutó en esta auditoría.

`CostoPromedio` no demuestra promedio ponderado: el código lo inicializa desde Costo y puede reemplazarlo con CostoUnitario del movimiento (`API:2607`) o costo del guardado. Clasificarlo como costo promedio contable requeriría decisión y revisión adicional. Saldos, negativos reales y coherencia con movimientos: pendientes de SELECT.

## 12. Atributos

Cuatro tablas descriptivas: Atributos, AtributosValores, ProductoAtributos, ProductoAtributoValores. Configuran atributo→elementos y asociaciones al registro; no generan precios ni combinaciones. API:5308 y sincronización de asociaciones operan por empresa. UNIQUE declarados limitan atributo repetido por producto y valor repetido por asociación. Integridad de pertenencia de elemento al atributo debe contrastarse también como relación lógica, no sólo como existencia de ambas FK.

## 13. Variantes

Cuatro tablas comerciales: OpcionesVariante, OpcionesVarianteValores, Variantes, VarianteValores. Variantes tiene ClaveCombinacion, SKU, Nombre, Costo, PrecioPublico, PrecioComparacion, precio unitario legacy, Orden, Activo y fechas.

**Imagen propia: SÍ en esquema versionado y contratos/persistencia del código; SQL real no certificado.** `productos-servicios-up.sql:895,929–938` declara ImagenUrl/ImagenNombre; API:5411 los selecciona y API:6103–6114 los inserta. DTO y frontend conservan imagen por fila. No depende de una fila de ProductosServiciosMultimedia. Este hallazgo sustituye sólo el diagnóstico histórico de ausencia en el código; no reabre Ticket 03 ni certifica columnas reales hoy.

Ruta separada construida por BuildFinalVariantImageFolderName y validación de tenant del token temporal (API:6172). Inventario por variante: **NO en el modelo versionado/contratos de inventario revisados**; base real pendiente. Sin afirmación de ausencia de tablas externas desconocidas.

VarianteValores mantiene idAtributo/idAtributoValor nullable por compatibilidad, mientras el nuevo INSERT usa idOpcionVariante/idOpcionVarianteValor (API:6132). La lectura usa opciones actuales. La sincronización borra/reinserta enlaces y opciones dentro de transacción; auditar historia y referencias externas antes de proponer cambios. Nunca mezclar estos campos legacy con atributos descriptivos como modelo futuro sin decisión PO.

## 14. Multimedia

Tabla general con FK compuesta al producto, TipoMultimedia y flags Foto/Video/Documento, NombreOriginal/NombreAlmacenado, Extension, MimeType, UrlFirebase, PesoBytes, Orden, Activo y fechas. No incluye idVariante ni flag ImagenPrincipal. La imagen principal reside en ProductosServicios.ImagenUrl/ImagenNombre y la de variante en Variantes.

Rutas en API:6307–6337: `{empresa}/ProductosServicios/Temporal/Imagen`, temporales por operación/tipo, imagen final por producto y carpetas de adjuntos. Variantes añade su propia carpeta por id. SQL contiene URL/metadatos; los bytes viven en Firebase Storage. Se inspeccionó código, no objetos remotos ni rutas reales de datos.

Activo permite filtrar adjuntos; no hay FechaArchivado declarada en Multimedia. El sincronizador puede retirar filas/archivos; no describir todo el ciclo como baja lógica garantizada. Tipo y flags son representaciones redundantes cuya coherencia debe consultarse. No se modificó Firebase.

## 15. SAT y fiscal

SQL versionado: ObjetoImpuesto nvarchar(4), PorcentajeIVA decimal(5,2), ClaveProductoSat nvarchar(20), ClaveUnidadSat nvarchar(10). Las descripciones se resuelven en runtime por API desde `GetClaveProdServ4` / `GetTodoClaveUnidad` (`API:4914,4926`) y se exponen en DTO/ficha; no se halló tabla de catálogo SAT dentro de las 20 del núcleo. La UI final representa ObjetoImpuesto como Sí/No; no se cambia el catálogo ni se aplica una interpretación fiscal nueva en esta auditoría. Valores existentes 01/02/03, nulos e IVA: pendientes de SELECT.

## 16. Logística

Fuente: maestro.PesoKg + Paquetes.PesoEmpaqueVacioKg; dimensiones del paquete. API:737–811 calcula:

- Peso físico total = PesoKg + PesoEmpaqueVacioKg (peso empaque nulo se toma 0 si hay peso de producto).
- Peso volumétrico = LargoCm × AnchoCm × AltoCm / 5000, cuando hay paquete y dimensiones positivas.
- Peso facturable = MAX de ambos disponibles; si falta uno usa el disponible.

Si no es Producto físico, no calcula esos valores. No se declaran columnas persistidas PesoFisicoTotalKg/PesoVolumetricoKg/PesoFacturableKg en scripts; aparecen en DTO/runtime. Verificar base real para descartar columnas no versionadas. Dimensiones legacy del maestro se conservan por contrato y no son fuente del cálculo actual.

## 17. Datos reales e integridad

**Todos los conteos reales solicitados están PENDIENTES, no son cero.** Productos activos, servicios activos, inactivos, categorías, marcas, colecciones, unidades, paquetes, tags, atributos/valores, opciones/valores, variantes, multimedia, existencias, movimientos, presentaciones: no consultados por SQL 18456.

Tampoco se certifican huérfanos, tenants inválidos, cruces, duplicados ni hijos activos con padres inactivos. Se preparó un paquete SELECT de metadatos, conteos e integridad; las consultas basadas en scripts deben ajustarse al esquema real antes de ejecutarlas. No se cambió nada para resolver riesgos.

## 18. Drift base/código/scripts

| Comparación | Resultado |
|---|---|
| Base real vs API/DTO | Pendiente: sin acceso SQL |
| Base real vs scripts | Pendiente: sin acceso SQL |
| Columnas usadas pero inexistentes en base | No determinable |
| Tablas reales fuera de scripts | No determinable |
| Índices/FK reales distintos | No determinable |
| Maestro: columnas de INSERT vs declaraciones consolidadas | Coinciden en revisión estática; no prueba base real |
| Variantes: ImagenUrl/ImagenNombre | Presentes en script y SELECT/INSERT/DTO actuales |
| Regla base 1:1 | Implementada API; CHECK/UNIQUE versionados no expresan toda la regla |
| idUnidadVenta | Presente por script evolutivo y código; no FK a unidad declarada |
| Precio unitario | Persistencia de compatibilidad; no tratar documentación histórica como captura vigente |
| Catálogo tiempo | Requiere scripts evolutivos: el UP principal por sí solo no representa el modelo completo |

No se identifican “columnas huérfanas” ni “tablas obsoletas reales” sólo porque no exista un editor. Tag, PrecioUnitario* y dimensiones del maestro mantienen lecturas/compatibilidad; idAtributo/idAtributoValor de VarianteValores son legado del modelo anterior. Su ocupación real está pendiente.

## 19. Auditoría de scripts (lectura, no ejecución)

| Script | Efecto y repetibilidad | DOWN / riesgo |
|---|---|---|
| productos-servicios-up.sql | Crea 19 tablas del núcleo, añade columnas, FK e índices con guardas OBJECT_ID/COL_LENGTH/IF NOT EXISTS; transforma Descripcion y columnas legacy. Reejecución condicionada, no verificación completa de definición existente. | Tiene DOWN general; destructivo, no rollback de negocio seguro |
| ticket-09-presentaciones-venta-up.sql | Crea tabla 20, FK compuesta, índices/constraints e INSERT inicial de bases a candidatos sin presentaciones; valida índice padre. | Sin DOWN específico localizado; inicialización no repara una base ya existente incorrecta |
| ticket-10-unidades-controladas-up.sql | Añade metadata de unidades y cantidad/unidad venta, backfill, constraints y catálogo por empresa; guardas parciales. | DDL inicial antes del GO/transacción posterior: no es un único cambio atómico; sin DOWN específico |
| ticket-10-unidades-catalogo-tiempo-up.sql | Amplía TIME, agrega/reclasifica catálogo y reasigna referencias de unidades en maestro/presentaciones/cotizaciones/órdenes. | No es sólo catálogo: afecta referencias; repetibilidad no equivale a no alterar datos |
| ticket-10-catalogo-metrico-us-up.sql | Actualiza/inserta catálogo sistema y elimina determinadas unidades sin referencias comprobadas por el script. | Escritura/destrucción; no ejecutar como auditoría; sin DOWN específico |
| ticket-10-unidades-tiempo-no-convertible-up.sql | Inserta periodos calendario faltantes por empresa/clave con factor NULL. | Guardia NOT EXISTS; no corrige filas ya presentes; sin DOWN específico |
| productos-servicios-down.sql | DROP de tablas e índices del módulo; guardas de existencia, transacción. | Destruye datos; no cubre de forma completa evolución Tags/ProductoTags/Presentaciones y consumidores externos. No es seguro sobre el esquema vigente sin revisión física y respaldo autorizado |

No se ejecutó ninguno. No se certifica idempotencia ejecutando dos veces sobre una base real. Se describe el control visible y sus límites. El orden de scripts evolutivos importa.

## 20. Riesgos y deuda técnica consolidados del código

1. Esquema real no accesible: bloquea garantías de completitud, integridad y drift; no sustituir con capturas de PDF ni registros anteriores.
2. Regla base/precios y duplicados de presentación parcialmente dependientes de API; no inferir enforcement completo en SQL.
3. Relación unidad venta sin FK declarada, y tenant sin FK declarada a Empresa.
4. Doble representación de tags, precio unitario legacy, dimensiones de maestro y referencias antiguas de atributos en variantes.
5. Existencias no modelan sucursal/variante; CostoPromedio se usa sin demostrar cálculo ponderado.
6. Modelo multimedia redundante de tipo y flags; garantías físicas pendientes.
7. Scripts UP/DOWN evolutivos no forman una recreación o rollback integral certificado. DDL de consumidores embebido en controller amplía la superficie a revisar.

Ninguno de estos puntos autoriza implementación o limpieza. No se afirma que existan hoy filas incorrectas.

## 21. Clasificación y decisiones de Product Owner

Clasificación provisional por tabla: sección 3. No se puede declarar ninguna tabla entera legacy/obsoleta con la evidencia disponible; sí se identifican campos de compatibilidad. No se proponen eliminaciones.

Decisión inmediata necesaria: indicar/actualizar la configuración vigente de acceso SQL de lectura para la base objetivo. No enviar contraseñas en el chat. Después de la lectura real, revisar con PO sólo riesgos medidos y necesidades de negocio: política de inventario por variante/sucursal, significado de CostoPromedio y eventual conservación de campos legacy. Ninguna decisión futura debe reinterpretar PrecioPublico ni atributos/variantes ni reabrir Ticket 10.

## 22. Entrega #MOKA (50 puntos)

| # | Punto | Resultado |
|---|---|---|
| 1 | Ticket 10 documentado CERRADO por PO | PASS, ambos documentos en ambos repositorios |
| 2 | Base auditada | Código/scripts auditados; base real bloqueada |
| 3 | Base de datos | db_a883c3_checklist, destino configurado, no autenticado |
| 4 | Total tablas detectadas | 20 declaradas; total real pendiente |
| 5 | Tabla principal | dbo.ProductosServicios, código y DDL |
| 6 | Productos activos | Pendiente |
| 7 | Servicios activos | Pendiente |
| 8 | Inactivos | Pendiente |
| 9 | Activas y necesarias | Clasificación estática sección 3, no certificación real |
| 10 | Legacy | Campos identificados; ninguna tabla completa certificada |
| 11 | Posiblemente obsoletas | Ninguna demostrada |
| 12 | Tablas con idEmpresa | 20 declaradas; real pendiente |
| 13 | Riesgos multitenant | Sección 6; incidencias reales pendientes |
| 14 | FK reales | Pendiente; 24 declaradas del núcleo |
| 15 | Relaciones sin FK física | Físicas pendientes; faltan declaraciones a Empresa y unidad venta |
| 16 | Fuente PrecioPublico | Maestro.PrecioPublico |
| 17 | Fuente Costo | Maestro.Costo |
| 18 | Ganancia | Derivada en código |
| 19 | Margen | Derivado en código |
| 20 | Presentaciones | Tabla propia y precios independientes |
| 21 | Regla 1:1 esquema/código | Código PASS; esquema/datos pendiente, sin PASS global |
| 22 | Total unidades | Pendiente |
| 23 | Sistema | Pendiente |
| 24 | Personalizadas | Pendiente |
| 25 | Duplicados | Pendiente |
| 26 | Riesgos unidades | Unicidad nombre/abreviatura en API, catálogo evolutivo |
| 27 | Modelo variantes | Opciones, valores, variantes y puente separados de atributos |
| 28 | Imagen propia variante | SÍ en script/contrato/SQL del código; base pendiente |
| 29 | Inventario variante | NO en modelo revisado; base completa pendiente |
| 30 | Riesgos variantes | Referencias legacy y consistencia entre opción/valor/producto |
| 31 | Existencia | ProductosServiciosExistencias |
| 32 | Movimientos | ProductosServiciosMovimientosInventario |
| 33 | Nivel | Empresa/producto en modelo, sin sucursal |
| 34 | Negativos | Admitidos por modelo con regla API PermiteVentaSinExistencia |
| 35 | Riesgos inventario | Sección 11; saldos reales pendientes |
| 36 | Base vs código | Pendiente |
| 37 | Base vs scripts | Pendiente |
| 38 | Columnas huérfanas | No determinable; compatibilidad identificada |
| 39 | Código esperando columnas inexistentes | No determinable |
| 40 | Scripts desactualizados | UP principal no contiene toda evolución; DOWN incompleto frente al conjunto |
| 41 | SQL escritura ejecutado | NO |
| 42 | Datos modificados | NO |
| 43 | Esquema modificado | NO |
| 44 | Migraciones ejecutadas | NO |
| 45 | Código funcional modificado | NO |
| 46 | AGENTS actualizado | SÍ en frontend y API |
| 47 | CLAUDE actualizado | SÍ en frontend y API, bloque vigente sincronizado |
| 48 | Documento generado | Este informe parcial y anexo |
| 49 | Decisiones requeridas PO | Acceso SQL vigente de lectura; demás decisiones después de datos reales |
| 50 | Dictamen | AUDITORÍA PARCIAL — SIN MODIFICACIONES DE BASE/CÓDIGO — PENDIENTE DE ACCESO SQL |

**No corresponde emitir “AUDITORÍA COMPLETADA” mientras siga pendiente toda la evidencia SQL real.**
