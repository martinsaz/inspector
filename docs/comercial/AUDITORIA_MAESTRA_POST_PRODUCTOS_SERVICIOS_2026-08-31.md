# Auditoría maestra post Productos y Servicios

Fecha de corte: `2026-08-31`

## Alcance auditado

- MVC: `inspector/checklist`
- API: `inspectorapi/checklistWs`
- SQL versionado:
  - `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql`
  - `inspectorapi/checklistWs/Scripts/ordenes-compra-up.sql`
- Documentación:
  - `inspector/AGENTS.md`
  - `inspector/CLAUDE.md`
  - `inspector/docs/comercial/**`
  - `inspector/docs/productos-servicios/**`
  - `inspector/docs/ordenes-compra/**`
- Evidencia de actividad reciente:
  - MVC `git log`: `89617d4 Productos y Servicios 05`, `6c8462f Productos y Servicios 04`, `e7a34ad Productos y Servicios 03`, `9c15570 Investigación Cotización, Pedido y Venta 01`
  - API `git log`: `9968fb6 Productos y Servicios 04`, `acce83c Productos y Servicios 03`, `8644bdf Productos y Servicios 02`

## Dictamen ejecutivo

1. `ProductosServicios` sí cambió de forma mayor y hoy está muy por delante del backlog comercial anterior. Hay evidencia real de catálogo, SAT, logística, atributos, variantes, multimedia, ficha técnica y PDF en `ProductosServiciosController` y en `productos-servicios-up.sql`.
2. `Inventario por variante NO existe hoy`. La evidencia actual apunta a `empresa + producto`, no a `empresa + producto + variante`, tanto en tabla como en código de lectura, guardado y movimientos.
3. `Órdenes de compra` sí existen como módulo NEXT con guardado, generación, cancelación, exportación y detalle; `Recepción` no fue localizada y no hay integración automática OC -> movimiento -> existencia.
4. `Cotizaciones` sí existen como módulo NEXT funcional, pero siguen operando a nivel `idProductoServicio` y `ExistenciaActual`; no hay compromiso, disponible, variante, pedido, flete ni fecha/operador por servicio.
5. `Pedido`, `Venta`, `Cobro`, `Devoluciones`, `Formas de pago` y `Ajustes PV` no existen todavía como flujo completo en código local. En varios casos solo hay documentación o vistas placeholder.
6. La arquitectura actual ya separa tres conceptos que no deben duplicarse:
   - `Usuario` como identidad/login administrativa.
   - `Rol/Permisos` como autorización.
   - `Operador` como identidad operativa separada.

## Fase 1 - Reconstrucción de lo realmente construido

| Punto | Estado | Evidencia | Dictamen |
|---|---|---|---|
| Activos | IMPLEMENTADO Y CERTIFICADO | `inspector/AGENTS.md`, `inspector/CLAUDE.md`, `inspectorapi/checklistWs/Scripts/activos-catalogos-unique-codigos-up.sql` | El módulo de Activos quedó cerrado por QA de PO y hoy aporta catálogos/proveedores reutilizados por OC. |
| Productos y Servicios | IMPLEMENTADO Y CERTIFICADO | `inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs:98-273`, `:276-471`, `inspector/checklist/Views/ProductosServicios/Index.cshtml` | Existe listado, detalle, guardado, baja/activación, resumen y exportación. |
| Catálogos | IMPLEMENTADO Y CERTIFICADO | Endpoints `Obtener/Guardar/Activar/Baja` para categorías, marcas y unidades en `ProductosServiciosController.cs:1481-1838` | Catálogos base viven en NEXT y ya no dependen de alta manual fuera del módulo. |
| Códigos autogenerados | IMPLEMENTADO Y CERTIFICADO | Cierre funcional documentado en `AGENTS.md` y `CLAUDE.md` del `2026-08-25` | El backlog anterior ya no debe tratar esto como gap abierto. |
| Producto vs Servicio | IMPLEMENTADO Y CERTIFICADO | `productos-servicios-up.sql:101-138`, `ProductosServiciosController.cs:27-36` | `Tipo = 1/2` y hay restricciones explícitas para impedir inventario/logística inaplicable en servicio. |
| Configuración comercial | PARCIAL | `ProductosServiciosModels.cs:28-47`, `:109-137`, `CotizacionesController.cs:354-507` | Existen precios, precio unitario, inventario y autorización de cotización, pero no el flujo comercial extremo a extremo. |
| SAT/fiscal | IMPLEMENTADO / REQUIERE QA | `ProductosServiciosController.cs:1339-1382`, `:6691-6716`, `ProductosServiciosModels.cs:34-36`, `:116-120` | Hay captura y render en ficha, pero no facturación real ni cierre fiscal comercial. |
| Inventario | PARCIAL | `productos-servicios-up.sql:142-197`, `ProductosServiciosController.cs:2241-2322`, `:3034-3325` | Sí existe existencia y movimientos manuales, pero solo por producto y sin integración con OC/Pedido/Venta/Devolución. |
| Atributos | IMPLEMENTADO / REQUIERE QA | `productos-servicios-up.sql:676-744`, `ProductosServiciosController.cs:2026-2205`, `:4834-4880` | Existe modelo SKNC para atributo-elemento asociado al producto. |
| Variantes | IMPLEMENTADO / REQUIERE QA | `productos-servicios-up.sql:812-955`, `ProductosServiciosController.cs:4934-5014`, `:5560-5668` | Existe matriz de variantes, combinación, SKU, costo y precio; no existe inventario por variante. |
| Costo por variante | IMPLEMENTADO / REQUIERE QA | `ProductosServiciosController.cs:4945-4951`, `:5624-5643` | Persisten `Costo`, `PrecioPublico`, `PrecioComparacion` y precio unitario por variante. |
| Imagen por variante | IMPLEMENTADO / REQUIERE QA | `ProductosServiciosController.cs:4943-4944`, `:5682-5713`, `:5845-5848`, `inspector/checklist/wwwroot/js/ProductosServicios/ProductosServicios.js:574-592`, `:4280-4294` | El código actual ya soporta imagen por variante; documentación previa quedó parcialmente atrasada. |
| Tags | IMPLEMENTADO / REQUIERE QA | `productos-servicios-up.sql:767-810`, `ProductosServiciosController.cs:1300-1338`, `:5245-5413` | Existe catálogo de tags y relación `ProductoTags`. |
| Multimedia | IMPLEMENTADO / REQUIERE QA | `productos-servicios-up.sql:958-1003`, `ProductosServiciosController.cs:938-1010`, `:5016-5202` | Hay carga temporal, persistencia, orden y desactivación segura. |
| Paquetes | IMPLEMENTADO Y CERTIFICADO | `productos-servicios-up.sql:646-674`, `ProductosServiciosController.cs:1931-2025`, `AGENTS.md` cierre `2026-08-25` | Existe catálogo y relación con producto. |
| Peso del producto | IMPLEMENTADO Y CERTIFICADO | `ProductosServiciosModels.cs:37-41`, `ProductosServiciosController.cs:158-165`, `:6738-6743` | Campo real en modelo y ficha técnica. |
| Peso vacío del empaque | IMPLEMENTADO Y CERTIFICADO | `ProductosServiciosModels.cs:64-70`, `ProductosServiciosController.cs:148`, `:6739` | Sale del paquete y no se fusiona con peso del producto. |
| Peso físico total | IMPLEMENTADO Y CERTIFICADO | `ProductosServiciosModels.cs:68-70`, `ProductosServiciosController.cs:6740`, `CLAUDE.md` | Derivado calculado por backend. |
| Peso volumétrico | IMPLEMENTADO Y CERTIFICADO | `ProductosServiciosController.cs:52`, `:6742`, `CLAUDE.md` | Factor volumétrico aprobado `5000`. |
| Peso facturable | IMPLEMENTADO Y CERTIFICADO | `ProductosServiciosController.cs:6743`, `CLAUDE.md` | `MAX(físico, volumétrico)` documentado como regla oficial. |
| Ficha técnica | IMPLEMENTADO Y CERTIFICADO | `ProductosServiciosController.cs:472-503`, `:6589-6870`, `inspector/checklist/Views/ProductosServicios/Index.cshtml:661-683` | Existe modal y armado backend de la ficha. |
| PDF de ficha técnica | IMPLEMENTADO Y CERTIFICADO | `ProductosServiciosController.cs:504-830`, `:6475-6588` | Exportación a PDF localizada y vigente. |
| Acciones del listado | IMPLEMENTADO / REQUIERE QA | `inspector/checklist/Views/ProductosServicios/Index.cshtml`, `ProductosServiciosController.cs:1214-1235`, `:1441-1479` | Hay acciones de detalle, activar/baja, exportación y ficha, pero falta amarrarlas a cadena comercial completa. |
| Proveedores | IMPLEMENTADO / REQUIERE QA | `OrdenesCompraController.cs:89-96`, `:1640-1661` | OC usa `dbo.ActivosProveedores`; no existe todavía homologación comercial separada. |
| Cambio adicional relacionado | IMPLEMENTADO / REQUIERE QA | `ProductosServiciosController.cs:72-77`, `:6122-6157` | Se agregó endurecimiento de contexto tenant vía headers firmados entre MVC y API. |

### Conclusión de Fase 1

El gran cambio real no fue un ajuste menor de catálogo. Fue la construcción de un dominio `ProductosServicios` mucho más rico que el backlog comercial anterior daba por inexistente o inmaduro.

## Fase 2 - Auditoría de la cadena comercial actual

| Módulo | Qué existe hoy | Qué funciona | Incompleto / placeholder | Legacy vs NEXT | Tablas y endpoints | Dictamen |
|---|---|---|---|---|---|---|
| Productos y Servicios | Listado, detalle, guardado, ficha, PDF, multimedia, tags, atributos, variantes, inventario manual | CRUD y consulta central del catálogo comercial | Sin inventario por variante ni vínculo downstream a Pedido/Venta | NEXT real | `dbo.ProductosServicios*`, endpoints `Obtener*`, `GuardarProductoServicio`, `ObtenerFichaTecnicaProductoServicio` | Base comercial vigente. |
| Órdenes de Compra | Listado, detalle, borrador, generar, cancelar, exportar PDF/Excel | Flujo documental de OC | Sin recepción, sin entrada a inventario, sin variante | NEXT real | `dbo.OrdenesCompra`, `dbo.OrdenesCompraDetalle`, `dbo.OrdenesCompraFolios`; `OrdenesCompraController.cs` | Módulo real pero aislado. |
| Recepción | No localizada | N/A | Placeholder funcional total | Ni NEXT ni local | Sin tabla, sin endpoint, sin vista | GAP real. |
| Existencias | Existencia y movimientos manuales en ProductosServicios | Alta inicial, entradas/salidas/ajustes manuales | Sin comprometido, sin disponible, sin sucursal, sin variante | NEXT parcial | `dbo.ProductosServiciosExistencias`, `dbo.ProductosServiciosMovimientosInventario`; endpoints `ObtenerExistencia...`, `RegistrarEntrada...` | Inventario base, no cadena comercial. |
| Cotizaciones | Listado, editor, detalle, PDF, correo, WhatsApp, autorización | Guardado en borrador, autorización y exportación | No usa variante, no calcula disponible, no convierte a pedido | NEXT real | `CotizacionesController.cs`, `Views/Cotizaciones/*`, tablas creadas vía `EnsureSchemaAsync` en `CotizacionesController.cs:1396-1467` | Módulo funcional pero aún pre-pedido. |
| Pedido | No localizado en código local | N/A | Gap completo | Solo referencia documental/legacy | No hay tablas/controlador/vistas locales | GAP real. |
| Ventas | Menú + controlador + vistas base | Navegación visual únicamente | Placeholder total | Placeholder local + documentación legacy | `Controllers/Ventas/VentasController.cs:6-20`, `Views/Ventas/Nueva.cshtml:8-29` | No existe venta funcional en CheckApp local. |
| Devoluciones | Menú + vista base | Navegación visual únicamente | Placeholder total | Placeholder local + documentación legacy | `Views/Ventas/Devoluciones.cshtml:8-29` | No existe postventa funcional local. |
| Formas de Pago | Menú + vista base | Navegación visual únicamente | Placeholder total | Placeholder local + documentación legacy | `Controllers/Ajustes/AjustesController.cs:16-19`, `Views/Ajustes/FormasPago.cshtml:8-29` | Gap. |
| Ajustes PV por Tienda/Sucursal | Menú + vista base | Navegación visual únicamente | Placeholder total | Placeholder local + documentación legacy | `AjustesController.cs:10-13`, `Views/Ajustes/AjustesPvPorTienda.cshtml:8-29` | Gap. |

### Hallazgos clave por relaciones

- `ProductosServicios -> OC`: sí existe por `idProductoServicio` snapshot en `OrdenesCompraController.cs:1680-1708`, `:1761-1828`.
- `ProductosServicios -> Cotización`: sí existe por `idProductoServicio` snapshot y `ExistenciaActual` en `CotizacionesController.cs:1028-1088`, `:1197-1244`.
- `OC -> Recepción`: no localizada.
- `Recepción -> Movimiento`: no localizada.
- `Cotización -> Pedido`: no localizada en código.
- `Pedido -> Venta`: no localizada en código.
- `Venta -> Cobro`: no localizada en código.
- `Venta -> Devolución`: no localizada en código.

## Fase 3 - Inventario por variante

## Respuesta explícita

Hoy la existencia se controla por:

`empresa + producto`

No por:

`empresa + producto + variante`

## Evidencia

1. La tabla `dbo.ProductosServiciosExistencias` solo tiene `idProductoServicio`; no contiene `idVariante` en `productos-servicios-up.sql:142-167`.
2. La tabla `dbo.ProductosServiciosMovimientosInventario` solo tiene `idProductoServicio`; no contiene `idVariante` en `productos-servicios-up.sql:170-197`.
3. La lectura de existencia en API filtra solo por `idEmpresa` + `idProductoServicio` en `ProductosServiciosController.cs:3034-3040`.
4. La inserción/actualización de existencia también opera solo por `idProductoServicio` en `ProductosServiciosController.cs:3143-3179`, `:3243-3269`.
5. `Cotizaciones` lee `ExistenciaActual` con `LEFT JOIN dbo.ProductosServiciosExistencias ex ON ex.idProductoServicio = ps.id` en `CotizacionesController.cs:1212-1218`.
6. `OrdenesCompraDetalle` persiste solo `idProductoServicio` y snapshot del producto; no existe campo de variante en `ordenes-compra-up.sql:120-162` y `OrdenesCompraController.cs:1762-1806`.
7. `CotizacionesPartidas` persiste solo `idProductoServicio`, `PermiteVentaSinExistencia` y `ExistenciaActual`; no existe `idVariante` en `CotizacionesController.cs:1098-1124`, `:1430-1443`.

## Dictamen técnico

- `Variantes` existen como configuración comercial del producto.
- `Existencias` no conocen variantes.
- `OC`, `Cotización` y `movimientos` siguen anclados al producto padre.
- Por lo tanto, el modelo actual NO soporta correctamente:
  - existencia física por variante;
  - recepción por variante;
  - comprometido por variante;
  - venta/devolución por variante;
  - trazabilidad logística por variante.

## Propuesta técnica sin implementar

### Objetivo

Evolucionar a un modelo compatible con:

- producto sin variantes;
- producto con variantes;
- históricos existentes;
- coexistencia temporal de consumo legacy por producto.

### Propuesta de evolución

1. Crear una entidad de stock canónica por `producto-variante`, con una fila “base” para producto sin variantes.
2. Mantener `ProductosServiciosVariantes` como dimensión comercial y no como stock por sí sola.
3. Introducir `idVariante` nullable en la nueva capa de inventario, con regla:
   - `NULL` = producto sin variantes o stock agregado heredado durante migración.
   - valor no nulo = control exacto por variante.
4. Separar saldos:
   - `ExistenciaFisica`
   - `ExistenciaMinima`
   - `ComprometidoPedido`
   - `Disponible`
5. Registrar movimientos con referencia obligatoria a origen:
   - alta inicial
   - recepción OC
   - ajuste
   - surtimiento/venta
   - devolución
6. En productos sin variantes, seguir resolviendo la operación al registro base para compatibilidad.
7. En históricos existentes, migrar primero el saldo actual del producto padre a la variante base o a un stock agregado temporal, según la decisión de negocio.

### Dependencias obligatorias

- `OC detalle` debe poder capturar `idVariante`.
- `Recepción detalle` debe poder recibir parcial por `idVariante`.
- `Cotización/Pedido/Venta/Devolución` deben capturar snapshot de variante además del producto padre.
- La trazabilidad debe conservar quién movió, desde qué documento y en qué sucursal/contexto.

## Fase 4 - Validación de hipótesis PO

Hipótesis del PO:

`Órdenes de compra + Recepción + Existencias por variante` como siguiente paso.

## Validación técnica

La hipótesis es correcta, pero con un matiz importante:

`Existencias por variante` no debe entrar como subdetalle tardío de Recepción; debe ser la base estructural del sprint.

## Recomendación

Sí recomiendo que el siguiente sprint sea exactamente ese frente, pero ejecutado en este orden interno:

1. Modelo de inventario por variante y compatibilidad histórica.
2. Adaptación de OC detalle para soportar variante.
3. Recepción parcial/total por variante.
4. Generación de movimientos de entrada por variante.
5. Actualización de existencia física y saldo disponible base.

## Casos que el siguiente sprint debe cerrar

- `OC 10 -> recepción 4 -> pendiente 6`
- `segunda recepción 6 -> OC recibida completa`
- `Producto talla M = 5`, `talla G = 3`; la recepción debe incrementar solo la variante correcta.

## Fase 5 - Auditoría de usuarios

## Modelo real actual

### Usuario

- Es la identidad administrativa principal.
- Tiene `IdSucursal`, `IdDepartamento`, `IdPuesto`, `idRol`, `IdFirebase`.
- Evidencia: `UsuarioController.cs:24-88`, `:205-277`.

### Rol

- Es la autorización del sistema.
- Vive en `dbo.Roles` y la capacidad efectiva se almacena en `Roles.Permisos`.
- Evidencia: `RolesController.cs:25-76`, `:130-175`, `AGENTS.md`.

### Permiso

- No está modelado como tabla separada localizada en este corte.
- Se representa como texto estructurado dentro de `dbo.Roles.Permisos`.
- Evidencia: `RolesController.cs:49`, `:61-62`, `AGENTS.md`.

### Operador

- Es identidad operativa separada de Usuario tradicional.
- Tiene ciclo propio de alta, sucursales y validación de acceso.
- Evidencia: `OperadoresController.cs:25-176`, `:203-245`, `:270-358`.

### Vendedor / Cajero / Agente / Supervisor / Administración / Superusuario

- No se localizaron como entidades persistentes separadas dentro del código local auditado.
- Hoy deben interpretarse como combinaciones de `Usuario + Rol/Permisos`, no como tablas o dominios nuevos.

### Ayudante

- No se localizó como identidad propia con o sin login.
- Debe tratarse como concepto funcional todavía no materializado.

## Clasificación conceptual resultante

| Concepto | Clasificación auditada |
|---|---|
| Usuario | IDENTIDAD |
| Rol | AUTORIZACIÓN / RESPONSABILIDAD CONFIGURABLE |
| Permiso | CAPACIDAD TÉCNICA |
| Tipo de usuario | POR DEFINIR PO, hoy no materializado como modelo único |
| Vendedor | RESPONSABILIDAD OPERATIVA sobre usuario existente |
| Cajero | RESPONSABILIDAD OPERATIVA sobre usuario existente |
| Agente | RESPONSABILIDAD OPERATIVA sobre usuario existente |
| Operador | IDENTIDAD OPERATIVA separada |
| Ayudante | PERSONA SIN LOGIN o rol operativo futuro; no materializado |
| Supervisor | RESPONSABILIDAD OPERATIVA/AUTORIZACIÓN; no entidad separada localizada |
| Administrador | RESPONSABILIDAD OPERATIVA/AUTORIZACIÓN sobre usuario existente |
| Superusuario | RESPONSABILIDAD OPERATIVA/AUTORIZACIÓN sobre usuario existente |

## Fase 6 - Matriz usuario x proceso

Nota: como `Agente`, `Vendedor`, `Cajero`, `Supervisor`, `Administración` y `Super Usuario` no aparecen como entidades separadas en el código local, la siguiente matriz es deliberadamente conservadora.

| Rol funcional | Login | Productos | OC | Recepción | Existencias | Cotización | Autorizar cotización | Pedido | Surtimiento | Venta | Cobro | Devolución | Ajustes PV | Reportes | Administración | Ejecución de servicios |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Agente | POR DEFINIR PO | POR DEFINIR PO | NO APLICA | NO APLICA | CONSULTAR | POR DEFINIR PO | NO APLICA | POR DEFINIR PO | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | CONSULTAR | NO APLICA | NO APLICA |
| Vendedor | POR DEFINIR PO | CONSULTAR | NO APLICA | NO APLICA | CONSULTAR | OPERAR | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | NO APLICA | NO APLICA | NO APLICA | CONSULTAR | NO APLICA | NO APLICA |
| Cajero | POR DEFINIR PO | CONSULTAR | NO APLICA | NO APLICA | CONSULTAR | CONSULTAR | NO APLICA | CONSULTAR | NO APLICA | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | NO APLICA | CONSULTAR | NO APLICA | NO APLICA |
| Operador | OPERAR | CONSULTAR | NO APLICA | NO APLICA | CONSULTAR | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | CONSULTAR | NO APLICA | OPERAR |
| Ayudante | POR DEFINIR PO | CONSULTAR | NO APLICA | NO APLICA | CONSULTAR | NO APLICA | NO APLICA | NO APLICA | POR DEFINIR PO | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | POR DEFINIR PO |
| Administración | OPERAR | OPERAR | OPERAR | POR DEFINIR PO | OPERAR | OPERAR | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | CONSULTAR | OPERAR | CONSULTAR |
| Super Usuario | OPERAR | OPERAR | OPERAR | OPERAR | OPERAR | OPERAR | AUTORIZAR | AUTORIZAR | AUTORIZAR | AUTORIZAR | AUTORIZAR | AUTORIZAR | AUTORIZAR | CONSULTAR | OPERAR | CONSULTAR |
| Supervisor | OPERAR | CONSULTAR | CONSULTAR | POR DEFINIR PO | CONSULTAR | CONSULTAR | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | POR DEFINIR PO | CONSULTAR | CONSULTAR | POR DEFINIR PO |

## Fase 7 - Impacto en documentación

| Documento | Sección | Estado actual | Problema | Cambio necesario | Prioridad |
|---|---|---|---|---|---|
| `inspector/docs/comercial/BACKLOG_MAESTRO_CHECKAPP_COMERCIAL.md` | S0-S7 | Parcialmente obsoleto | Fue redactado antes del cierre fuerte de ProductosServicios | ACTUALIZAR con backlog V2 | Alta |
| `inspector/docs/comercial/17_GAP_CHECKAPP_COMERCIAL.md` | Gaps generales | Obsoleto en ProductosServicios | Todavía asume huecos ya cerrados en catálogo/logística/ficha | REEMPLAZAR o archivar como histórico | Alta |
| `inspector/docs/productos-servicios/PRODUCTOS_SERVICIOS_AMPLIACION_20260819.md` | Ampliación | Útil pero incompleto | No refleja cierres de PO del `2026-08-25` | ACTUALIZAR | Alta |
| `inspector/AGENTS.md` | Productos y Servicios / comercial | Mayormente vigente | No incorpora todavía esta auditoría comercial maestra ni el dictamen final de inventario por variante | ACTUALIZAR | Alta |
| `inspector/CLAUDE.md` | Productos y Servicios / comercial | Mayormente vigente | Mismo gap que `AGENTS.md` | ACTUALIZAR | Alta |
| `inspector/docs/comercial/checkapp/03_OC_RECEPCION_EXISTENCIAS.md` | OC/Recepción | Válido | Ya detecta ausencia de recepción, pero no aterriza prioridad de variante como dependencia estructural | ACTUALIZAR | Media |
| `inspector/docs/comercial/checkapp/08_USUARIOS_CAPACIDADES_ASISTENCIA.md` | Usuarios/capacidades | Válido parcial | No baja la propuesta a matriz de proceso ni a backlog nuevo | ACTUALIZAR | Media |
| `inspector/docs/comercial/checkapp/04_COTIZACIONES_ESTADO_ACTUAL.md` | Cotizaciones | Válido parcial | Debe marcar que hoy sigue a nivel producto, no variante | ACTUALIZAR | Media |
| `inspector/docs/comercial/18_RECOMENDACION_ARQUITECTURA_CHECKAPP.md` | Recomendación | Aún útil | Requiere reordenar prioridad por variante antes de venta | CONSERVAR con addendum | Media |
| Documentación previa que declare “imagen por variante pendiente” | Ticket 03 | Potencialmente obsoleta | El código actual ya contiene soporte de imagen por variante en frontend+backend | ACTUALIZAR tras QA o ELIMINAR referencia obsoleta | Alta |

## Fase 8 - Contraste del backlog anterior

### Leyenda usada

- `YA IMPLEMENTADO`
- `IMPLEMENTADO PARCIALMENTE`
- `SIGUE VIGENTE`
- `DEBE MODIFICARSE`
- `DEBE DIVIDIRSE`
- `DEBE ELIMINARSE`
- `DEPENDENCIA CAMBIÓ`

| Ticket anterior | Objetivo original | Estado real actual | Evidencia | Impacto de cambios recientes | Decisión recomendada | Ticket nuevo equivalente |
|---|---|---|---|---|---|---|
| COM-001 | Capacidades comerciales | IMPLEMENTADO PARCIALMENTE | Existen `Usuarios`, `Roles`, `Permisos`, `Operadores` | Ya no parte de cero; debe montarse sobre lo existente | DEBE MODIFICARSE | COMV2-060 |
| COM-002 | Responsables comerciales | SIGUE VIGENTE | Trazabilidad parcial por usuario en OC y cotización | Ahora hay más actores potenciales | DEBE MODIFICARSE | COMV2-045 |
| COM-003 | Integración con Roles y Permisos | IMPLEMENTADO PARCIALMENTE | `Roles.Permisos` ya es base real | No debe crearse otro sistema | DEBE MODIFICARSE | COMV2-061 |
| COM-004 | Operador de servicio | IMPLEMENTADO PARCIALMENTE | `OperadoresController.cs` y docs de operadores | Operador ya existe como identidad separada | DEPENDENCIA CAMBIÓ | COMV2-033 |
| COM-010 | Fecha de instalación | SIGUE VIGENTE | No localizada en `Cotizaciones` | Sigue faltando, pero ahora cotización ya existe | SIGUE VIGENTE | COMV2-022 |
| COM-011 | Observaciones para instalador | SIGUE VIGENTE | No localizada en modelo local | Requiere snapshot por servicio | SIGUE VIGENTE | COMV2-022 |
| COM-012 | Existencia informativa en cotización | IMPLEMENTADO PARCIALMENTE | `ExistenciaActual` sí existe en `CotizacionesController.cs:1210-1243` | Falta comprometido/disponible y variante | DEBE DIVIDIRSE | COMV2-021, COMV2-032 |
| COM-013 | Cotizar sin existencia | IMPLEMENTADO PARCIALMENTE | `PermiteVentaSinExistencia` existe en producto/cotización | Cotización no valida stock real ni disponible | DEBE MODIFICARSE | COMV2-021 |
| COM-014 | Concepto pendiente de catálogo | SIGUE VIGENTE | `Cotizaciones` exige `IdProductoServicio` válido | El snapshot comercial actual ayuda, pero no resuelve comodín | SIGUE VIGENTE | COMV2-024 |
| COM-015 | Resolver concepto pendiente | SIGUE VIGENTE | No localizado | Sigue dependiendo de Pedido | SIGUE VIGENTE | COMV2-024 |
| COM-016 | Flete | SIGUE VIGENTE | No localizado en cotización local | Requiere modelado explícito | SIGUE VIGENTE | COMV2-023 |
| COM-017 | Servicios de instalación | SIGUE VIGENTE | No localizado | Cotización actual ya distingue producto/servicio, buena base | DEBE MODIFICARSE | COMV2-022 |
| COM-018 | Operador sugerido | SIGUE VIGENTE | `Operadores` existe, cotización no lo usa | La dependencia cambió a favor | DEPENDENCIA CAMBIÓ | COMV2-033 |
| COM-020 | Modelo Pedido | SIGUE VIGENTE | No localizado en código local | Ningún cambio reciente lo resolvió | SIGUE VIGENTE | COMV2-030 |
| COM-021 | Estados Pedido | SIGUE VIGENTE | No localizado | Sin cambio | SIGUE VIGENTE | COMV2-034 |
| COM-022 | Conversión Cotización -> Pedido | SIGUE VIGENTE | No localizado | Cotización autorizada ya existe, así que el ticket es más viable | DEPENDENCIA CAMBIÓ | COMV2-031 |
| COM-023 | Validación de catálogo antes de pedido | SIGUE VIGENTE | No hay pedido | Debe convivir con concepto pendiente | DEBE MODIFICARSE | COMV2-031, COMV2-024 |
| COM-024 | Compromiso de inventario | SIGUE VIGENTE | No existe comprometido | Ahora depende de inventario por variante | DEPENDENCIA CAMBIÓ | COMV2-032 |
| COM-025 | Disponible | SIGUE VIGENTE | No existe disponible persistido | Debe basarse en stock variante | DEPENDENCIA CAMBIÓ | COMV2-004 |
| COM-026 | Negativos | IMPLEMENTADO PARCIALMENTE | Existe `PermiteVentaSinExistencia` | Falta acotarlo a disponible/comprometido reales | DEBE MODIFICARSE | COMV2-004 |
| COM-027 | Cancelar Pedido | SIGUE VIGENTE | No existe pedido | Sin cambio | SIGUE VIGENTE | COMV2-034 |
| COM-028 | Servicios del Pedido | SIGUE VIGENTE | No existe pedido | Ahora puede reutilizar producto/servicio y operadores existentes | DEPENDENCIA CAMBIÓ | COMV2-033 |
| COM-029 | Asignación de Operadores | SIGUE VIGENTE | `Operadores` existe, asignación comercial no | Requiere bajar a Pedido/servicio | DEBE MODIFICARSE | COMV2-033 |
| COM-030 | Recepción de OC | SIGUE VIGENTE | No hay recepción local | Hoy es prioridad más alta por variante | SIGUE VIGENTE | COMV2-010 |
| COM-031 | Recepción parcial | SIGUE VIGENTE | No hay recepción local | Sigue siendo requisito central | SIGUE VIGENTE | COMV2-011 |
| COM-032 | Movimiento de inventario desde recepción | SIGUE VIGENTE | Solo hay movimientos manuales | Debe migrar a variante | DEBE MODIFICARSE | COMV2-012 |
| COM-033 | Actualización de existencia física | IMPLEMENTADO PARCIALMENTE | Existe actualización manual de existencia | Falta automatización por recepción y variante | DEBE MODIFICARSE | COMV2-003, COMV2-012 |
| COM-034 | Relación con pedidos comprometidos | SIGUE VIGENTE | No hay pedido ni compromiso | Debe posponerse a después del stock variante | DEPENDENCIA CAMBIÓ | COMV2-032 |
| COM-035 | Trazabilidad | IMPLEMENTADO PARCIALMENTE | OC guarda `idUsuario*`; movimientos guardan `idUsuario` | Falta cadena completa por documento y actor comercial | DEBE MODIFICARSE | COMV2-005, COMV2-045 |
| COM-036 | QA de negativos | SIGUE VIGENTE | No existe disponible real para probar | Ahora depende de stock variante | DEPENDENCIA CAMBIÓ | COMV2-004 |
| COM-040 | Catálogo maestro formas de pago | SIGUE VIGENTE | Solo hay placeholder MVC | Sin backend local | SIGUE VIGENTE | COMV2-041 |
| COM-041 | Configuración por sucursal | SIGUE VIGENTE | No localizada | Depende de formas de pago/caja | SIGUE VIGENTE | COMV2-041 |
| COM-042 | Catálogo operativo | SIGUE VIGENTE | No localizado | Sin cambio | DEBE MODIFICARSE | COMV2-041 |
| COM-043 | Forma fiscal | SIGUE VIGENTE | No localizada en venta/cobro | SAT en producto no resuelve checkout fiscal | SIGUE VIGENTE | COMV2-041 |
| COM-044 | Ajustes PV por sucursal | SIGUE VIGENTE | Placeholder MVC | No existe funcionalidad | SIGUE VIGENTE | COMV2-041 |
| COM-045 | Caja POS mínima | SIGUE VIGENTE | Solo `Caja` string en cotización | Falta modelo operativo | DEBE MODIFICARSE | COMV2-040 |
| COM-050 | Modelo Asistencia | SIGUE VIGENTE | No localizado módulo reusable | Debe decidirse si realmente aplica | DEBE MODIFICARSE | COMV2-062 |
| COM-051 | Entrada asistencia | SIGUE VIGENTE | No localizado | Sin cambio | DEBE ELIMINARSE o reescribir tras decisión PO | COMV2-062 |
| COM-052 | Salida asistencia | SIGUE VIGENTE | No localizado | Sin cambio | DEBE ELIMINARSE o reescribir tras decisión PO | COMV2-062 |
| COM-053 | Validación Vendedor | SIGUE VIGENTE | No localizado | Debe apoyarse en capacidades, no en entidad nueva | DEBE MODIFICARSE | COMV2-060 |
| COM-054 | Validación Cajero | SIGUE VIGENTE | No localizado | Igual que vendedor | DEBE MODIFICARSE | COMV2-060 |
| COM-055 | Operador instalador | SIGUE VIGENTE | Operador existe, integración comercial no | Dependencia cambió | DEPENDENCIA CAMBIÓ | COMV2-033 |
| COM-056 | UX Asistencia | SIGUE VIGENTE | No localizada | No debe abordarse antes de decidir si asistencia aplica | DEBE ELIMINARSE temporalmente | COMV2-062 |
| COM-060 | Selección de Pedido | SIGUE VIGENTE | No existe pedido ni venta local | Sigue faltando | SIGUE VIGENTE | COMV2-042 |
| COM-061 | Resumen Pedido | SIGUE VIGENTE | No existe pedido | Sigue faltando | SIGUE VIGENTE | COMV2-042 |
| COM-062 | Preparar surtimiento | SIGUE VIGENTE | No existe pedido/venta | Ahora depende de stock variante | DEPENDENCIA CAMBIÓ | COMV2-043 |
| COM-063 | Validación de producto | SIGUE VIGENTE | No localizada en venta local | Depende de pedido y disponible | DEPENDENCIA CAMBIÓ | COMV2-043 |
| COM-064 | Servicio en venta | SIGUE VIGENTE | No localizada | Base de producto/servicio ya existe | DEPENDENCIA CAMBIÓ | COMV2-042 |
| COM-065 | Surtimiento parcial | SIGUE VIGENTE | No localizada | Sigue siendo clave | SIGUE VIGENTE | COMV2-043 |
| COM-066 | Inventario al surtir | SIGUE VIGENTE | No existe venta local | Ahora depende de variante | DEPENDENCIA CAMBIÓ | COMV2-043 |
| COM-067 | Checkout | SIGUE VIGENTE | No localizado | Falta caja y formas de pago | SIGUE VIGENTE | COMV2-044 |
| COM-068 | Cajero/Vendedor | SIGUE VIGENTE | No localizado | Debe montarse sobre capacidades | DEBE MODIFICARSE | COMV2-045 |
| COM-069 | Cobro | SIGUE VIGENTE | No localizado | Sigue faltando backend | SIGUE VIGENTE | COMV2-044 |
| COM-070 | Ticket/Venta | SIGUE VIGENTE | `Ventas/Nueva` es placeholder | Gap total | SIGUE VIGENTE | COMV2-044 |
| COM-071 | Actualización Pedido | SIGUE VIGENTE | No existe pedido | Sin cambio | SIGUE VIGENTE | COMV2-034 |
| COM-072 | Idempotencia | SIGUE VIGENTE | No existe flujo de venta/cobro | Sigue siendo requisito | SIGUE VIGENTE | COMV2-044 |
| COM-080 | Devolución desde Venta | SIGUE VIGENTE | `Devoluciones` es placeholder | Gap total | SIGUE VIGENTE | COMV2-050 |
| COM-081 | Partidas devolubles | SIGUE VIGENTE | No localizada | Sin cambio | SIGUE VIGENTE | COMV2-050 |
| COM-082 | Reingreso inventario | SIGUE VIGENTE | No hay devolución local | Debe ser por variante | DEPENDENCIA CAMBIÓ | COMV2-051 |
| COM-083 | Nota de crédito | SIGUE VIGENTE | No localizada | Sin cambio | SIGUE VIGENTE | COMV2-052 |
| COM-084 | Vale | SIGUE VIGENTE | No localizado | Sin cambio | SIGUE VIGENTE | COMV2-052 |
| COM-085 | Documentos vigentes | SIGUE VIGENTE | No localizado | Sin cambio | SIGUE VIGENTE | COMV2-053 |
| COM-086 | Aplicación como pago | SIGUE VIGENTE | No localizada | Depende de cobro y documentos | SIGUE VIGENTE | COMV2-053 |
| COM-087 | Ajustes PV | SIGUE VIGENTE | Placeholder MVC | Sin cambio | SIGUE VIGENTE | COMV2-041 |

## Fase 9 - Conclusión y decisión de backlog

### Estado real del sistema

- `ProductosServicios`: base funcional real y vigente.
- `OC`: módulo documental real, todavía sin abastecimiento operativo.
- `Existencias`: base técnica parcial, todavía no comercialmente suficiente.
- `Cotizaciones`: módulo real, todavía pre-pedido y pre-venta.
- `Pedido/Venta/Cobro/Postventa`: gaps reales en código local.

### Recomendación de backlog maestro

Se creó el archivo:

`inspector/docs/comercial/BACKLOG_MAESTRO_CHECKAPP_COMERCIAL_V2.md`

### Recomendación de siguiente sprint

Sí validar como siguiente sprint:

`Inventario por variante + OC + Recepción`

porque hoy es la dependencia técnica que más reduce riesgo para:

- abastecimiento,
- pedido,
- venta,
- devolución,
- trazabilidad.

Si se intenta construir `Pedido` o `Venta` antes de cerrar esa base, el sistema quedará obligado a rehacer snapshots, compromiso, surtimiento y reingreso poco después.
