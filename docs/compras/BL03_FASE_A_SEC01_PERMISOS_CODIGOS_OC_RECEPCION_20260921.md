# BL-03 FASE A SEC-01 - Permisos y codigos OC/Recepcion

Fecha: 2026-09-21
Estado: CERRADO / PASS tecnico

## Alcance Ejecutado

SEC-01 cierra la arquitectura de permisos, codigos, menu y AuthZ para Proveeduria -> Ordenes de compra / Recepcion, sin ejecutar ARQ-01, OC-02 ni REC-01. No se implemento funcionalidad nueva de OC/Recepcion, no se ejecuto DDL, no se modifico Legacy SKNC y no se hicieron escrituras masivas en roles productivos.

## Arbol Before

El arbol funcional persistible antes de SEC-01 contenia:

- `05000000` Proveeduria, agrupador.
- `05001000` Productos y Servicios, agrupador.
- `05001001` ABC Productos y Servicios.
- `05001002` Catalogos, agrupador.
- `05001003` Categorias.
- `05001004` Marcas.
- `05001005` Unidades de medida.

OC existia como UI/API operativa, pero no tenia permisos granulares propios en RolesPermisos, menu runtime ni AuthZ funcional. Recepcion estaba aprobada como rama hermana futura, sin implementacion funcional.

## Preflight Real

Preflight local de codigo:

- No existian usos funcionales exactos de `05003000`, `05003001`, `05003002`, `05004000`, `05004001`, `05004002` antes de SEC-01.
- Existian breadcrumbs legacy `m05003000` y `m05004000` en `wwwroot/js/Utilerias.js`; no son codigos JSON de permisos y no colisionan con `Opcion`.

Preflight SQL real read-only sobre `dbo.Roles.Permisos`:

- `PRE_FLIGHT_DB=OK`.
- `ROLES_TOTAL=124`.
- `ROLES_CON_PERMISOS=124`.
- `05000000` a `05001005`: presentes en 1 rol persistido.
- `05003000`, `05003001`, `05003002`, `05004000`, `05004001`, `05004002`: presentes en 0 roles.
- `NEW_CODE_COMPANY_COUNT=0`.

Dictamen de preflight: codigos nuevos libres en persistencia real. No se modifico ninguna fila.

## Arbol After

Arbol final autorizado:

- `05000000` Proveeduria, agrupador solo Acceso.
- `05001000` Productos y Servicios, agrupador solo Acceso.
- `05001001` ABC Productos y Servicios, Acceso + Escritura.
- `05001002` Catalogos, agrupador solo Acceso.
- `05001003` Categorias, Acceso + Escritura.
- `05001004` Marcas, Acceso + Escritura.
- `05001005` Unidades de medida, Acceso + Escritura.
- `05003000` Ordenes de compra, agrupador solo Acceso.
- `05003001` Nueva OC, Acceso + Escritura.
- `05003002` Reporte OC, Acceso + Escritura para acciones mutables.
- `05004000` Recepcion, agrupador solo Acceso.
- `05004001` Nueva Recepcion, Acceso + Escritura.
- `05004002` Reporte Recepcion, Acceso + Escritura para acciones mutables futuras.

Los padres no conceden hijos. Cada pantalla funcional depende de su propio codigo. Los agrupadores pueden existir para ordenar el arbol y abrir ramas, pero no autorizan rutas ni escritura.

## RolesPermisos

`RolesPermisos` ahora expone, guarda y recarga los switches de OC y Recepcion:

- `sw05003000A`, `sw05003001A/W`, `sw05003002A/W`.
- `sw05004000A`, `sw05004001A/W`, `sw05004002A/W`.

El guardado persiste los nodos como hijos de Proveeduria y normaliza `Escritura=0` cuando el hijo no tiene `Acceso=1`. SuperAdmin conserva la proteccion existente de UI/backend: no se habilito edicion manual ni se uso otro rol como workaround.

Regla permanente posterior a SEC-01R: SuperAdmin es un rol protegido/no editable. Las nuevas opciones registradas oficialmente deben ser resueltas automaticamente por SuperAdmin mediante el mecanismo oficial. Nunca se debe requerir al PO activar manualmente switches de SuperAdmin para acceder a una nueva funcionalidad.

## Menu Runtime

`HomeController` delega el menu de Proveeduria a `ProveeduriaMenuBuilder`.

Reglas:

- ProductosServicios conserva su contrato previo.
- Ordenes de compra aparece si existe permiso explicito de Nueva o Reporte.
- Recepcion aparece como hermana de Ordenes de compra si existe permiso explicito de Nueva o Reporte.
- Un padre con Acceso sin hijos no muestra ni autoriza hijos.
- Se aceptan formas JSON mixtas/legacy con hijos planos siempre que el hijo funcional exista explicitamente.

## AuthZ MVC

`Activos/OrdenesCompraController` ahora valida `prmmnu` antes de mostrar paginas o proxyear acciones:

- Nueva/combos/busqueda/validacion/guardar/generar: `05003001`.
- Reporte/listado/resumen/export/detalle/cancelar: `05003002`.
- Detalle acepta `05003001` o `05003002`.
- Escritura requiere `Acceso=1` y `Escritura=1` del codigo funcional.

## AuthZ API

`api/OrdenesCompra` ahora usa `IProductosServiciosAuthorizationService` con codigos OC:

- `ObtenerOrdenesCompra`, `ObtenerResumenOrdenesCompra`, `ExportarOrdenesCompra`, `ExportarOrdenCompraPdf`, `ExportarOrdenCompraExcel`: `05003002.Acceso`.
- `ObtenerOrdenCompra`: `05003001.Acceso` o `05003002.Acceso`.
- `ObtenerCombosOrdenCompra`, `BuscarProductosServiciosOrdenCompra`, `ValidarPendientesOrdenCompra`: `05003001.Acceso`.
- `GuardarBorradorOrdenCompra`, `GenerarOrdenCompra`: `05003001.Acceso + Escritura`.
- `CancelarOrdenCompra`: `05003002.Acceso + Escritura`.

Recepcion no recibio endpoints API ficticios. Los codigos `05004000`-`05004002` quedan persistibles, navegables por contrato de menu y documentados para REC-01.

## Acceso vs Escritura

- Agrupadores: Acceso unicamente, Escritura ignorada aunque aparezca en JSON legacy.
- Funcionales de consulta: Acceso.
- Funcionales mutables: Acceso + Escritura.
- Reporte OC usa Escritura para acciones mutables actuales como cancelar; exportar y consultar usan Acceso.

## Multitenant

Los permisos no sustituyen tenant. API OC mantiene `idEmpresa` server-side desde contexto firmado/claims y rechaza mismatch de empresa antes de SQL de negocio. AuthZ recibe `IdEmpresa`, usuario y descriptor tenant; si el contexto no puede resolverse, falla cerrado.

## Compatibilidad

No se hizo normalizacion masiva de roles existentes. Los nuevos nodos se agregan al JSON cuando RolesPermisos guarda un rol o cuando se crea un rol nuevo, sin tocar roles reales en lote. La compatibilidad legacy se mantiene aceptando busqueda recursiva de permisos y formas mixtas.

## Regresiones

ProductosServicios, Proveedores y Sucursales no cambiaron sus contratos funcionales:

- ProductosServicios conserva `05001000` como agrupador y permisos hijos.
- Proveedores conserva su AuthZ existente por codigos Activos.
- Sucursales conserva `AjustesSucursalesMenuBuilder` y sus pruebas anti-herencia.
- SuperAdmin conserva resolucion automatica oficial para opciones registradas; no depende de switches manuales ni de modificar `Roles.Permisos`.

## Validacion

- `dotnet build inspector/checklist.sln --no-restore`: PASS, 0 errores; advertencias preexistentes.
- `dotnet build inspectorapi/checklistWs.sln --no-restore`: PASS, 0 errores; advertencias preexistentes.
- `dotnet test inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --no-build --filter "FullyQualifiedName~ProveeduriaMenuBuilderTests|FullyQualifiedName~SucursalesMenuBuilderTests" --verbosity minimal`: PASS, 13/13.
- `dotnet test inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --no-build --verbosity minimal`: PASS, 423/423.
- `git diff --check`: PASS.
- Preflight SQL real read-only: PASS, codigos nuevos con conteo 0.

## Pendientes Legitimos

- ARQ-01: resolver inventario Variante/Sucursal.
- OC-02: schema/modelo tecnico de OC, sin ejecutar desde SEC-01.
- REC-01: contrato/schema Recepcion y endpoints reales, sin ejecutar desde SEC-01.
- QA manual PO posterior.

## Dictamen

SEC-01 queda CERRADO / PASS tecnico. El contrato de permisos/codigos/menu/AuthZ esta implementado sin DDL, sin Legacy, sin UI/API funcional nueva de Recepcion y sin ejecutar tickets posteriores.
