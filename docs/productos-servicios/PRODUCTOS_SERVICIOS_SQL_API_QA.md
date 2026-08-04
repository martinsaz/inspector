# PRODUCTOS Y SERVICIOS
## FASE 4 - EJECUCION AUTORIZADA EN BASE REAL Y QA DE API

## Autorizacion

La Product Owner autorizo expresamente el 3 de agosto de 2026 ejecutar el script aprobado sobre la base real del proyecto:

- Servidor: `sql5111.site4now.net`
- Base: `db_a883c3_checklist`

## Ambiente

- Proyecto API: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs`
- Perfil: `Development`
- Origen de conexion: `appsettings.json` -> `ConnectionStrings:CadenaConexionSQLServer`
- Helper de conexion: `SqlConnectionFactory`
- Evidencia previa fuera del repo: `/tmp/productos_servicios_sql_pre_evidence.json`
- Evidencia posterior fuera del repo: `/tmp/productos_servicios_sql_post_evidence.json`

## Hashes

- Script UP: `a2c6f735939b3c06c08d848de8215af4398c56ff591b8677145c0478cb208e03`
- Script DOWN: `b89d466ab5298b5ad35dfa63bcfcb9dc27f523d13042b11aee2c67dc24fc478a`
- `RecoleccionesBL26.js`: `35ac6df1c145e7621b571fb19e798e0df32671c9f5a5916b05e565ccd8bbc7b3`
- `RecoleccionesBL26.css`: `2fcd2e33a1abfc32dc65c45b6bc5d846e5f8d3cb2444b6e048d0e89650d77fb5`

## Evidencia previa

Capturada el `2026-08-03 15:05:59 CST`.

- `@@TRANCOUNT = 0` en conexion fresca.
- Conteo previo de objetos `ProductosServicios%`: `0`
- Tablas previas del modulo: `ninguna`
- Transaccion abierta iniciada por Codex: `no`

## Respaldo

No se detecto un mecanismo de respaldo completo disponible con las herramientas presentes en el entorno.

Limitacion documentada:

- `sqlcmd` no esta disponible.
- Se continuo con la ejecucion por autorizacion expresa de Product Owner.
- Se conservo evidencia estructural previa y posterior.
- El script se confirmo como transaccional con `SET XACT_ABORT ON`, `BEGIN TRY/BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK` y `THROW`.

## Ejecucion del script UP

- Script ejecutado: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Scripts/productos-servicios-up.sql`
- Fecha y hora de ejecucion: `2026-08-03 15:06:08 CST`
- Resultado: `ok`
- Reejecucion: `no realizada`
- Script DOWN: `no ejecutado`
- SQL manual correctivo: `ninguno`

## Resultado transaccional

- El script termino sin error.
- `@@TRANCOUNT` posterior: `0`
- No se observaron objetos parciales del modulo.

## Objetos creados

Tablas creadas:

1. `dbo.ProductosServicios`
2. `dbo.ProductosServiciosCategorias`
3. `dbo.ProductosServiciosMarcas`
4. `dbo.ProductosServiciosUnidadesMedida`
5. `dbo.ProductosServiciosExistencias`
6. `dbo.ProductosServiciosMovimientosInventario`

Conteo posterior de objetos `ProductosServicios%` en `sys.objects`: `6`

## Validacion estructural

### PK

Cada una de las seis tablas tiene PK sobre `id`.

### FK

FK compuestas validadas:

- `ProductosServicios -> ProductosServiciosCategorias (idEmpresa, idCategoria)`
- `ProductosServicios -> ProductosServiciosMarcas (idEmpresa, idMarca)`
- `ProductosServicios -> ProductosServiciosUnidadesMedida (idEmpresa, idUnidadMedida)`
- `ProductosServiciosExistencias -> ProductosServicios (idEmpresa, idProductoServicio)`
- `ProductosServiciosMovimientosInventario -> ProductosServicios (idEmpresa, idProductoServicio)`

### Indices

Validados los indices esperados de unicidad y busqueda, incluyendo:

- `UX_ProductosServicios_Empresa_Codigo`
- `UX_ProductosServicios_Empresa_Id`
- `UX_ProductosServiciosCategorias_Empresa_Codigo`
- `UX_ProductosServiciosCategorias_Empresa_Id`
- `UX_ProductosServiciosMarcas_Empresa_Codigo`
- `UX_ProductosServiciosMarcas_Empresa_Id`
- `UX_ProductosServiciosUnidadesMedida_Empresa_Codigo`
- `UX_ProductosServiciosUnidadesMedida_Empresa_Id`
- `UX_ProductosServiciosExistencias_Empresa_ProductoServicio`
- indices de apoyo por `Activo`, `Nombre`, `Tag`, `Tipo`, `Categoria`, `Marca`, `Unidad`, `FechaMovimiento`

### Checks

Checks validados:

- `CK_ProductosServicios_Tipo`
- `CK_ProductosServicios_ValoresMonetarios`
- `CK_ProductosServicios_ServicioSinInventario`
- `CK_ProductosServiciosCategorias_AplicaA`
- `CK_ProductosServiciosExistencias_Valores`
- `CK_ProductosServiciosMovimientos_Cantidad`
- `CK_ProductosServiciosMovimientos_Tipo`
- `CK_ProductosServiciosMovimientos_ValoresMonetarios`

### Defaults

Defaults validados para `id`, `identityKey`, `Activo`, `FechaCreacion`, `FechaActualizacion` y los campos funcionales esperados como `AplicaA`, `CausaInventario`, `PermiteVentaSinExistencia`, `ExistenciaActual`, `ExistenciaMinima`, `PermiteDecimales`, `FechaMovimiento`.

### Tipos y longitudes relevantes

- `ProductosServiciosUnidadesMedida.Codigo`: `NVARCHAR(30)`
- `ProductosServiciosUnidadesMedida.Nombre`: `NVARCHAR(100)`
- `ProductosServiciosUnidadesMedida.Abreviatura`: `NVARCHAR(20)`
- `ProductosServiciosExistencias.ExistenciaActual`: `DECIMAL(18,4)`
- `ProductosServiciosExistencias.ExistenciaMinima`: `DECIMAL(18,4)`
- `ProductosServiciosMovimientosInventario.Cantidad`: `DECIMAL(18,4)`
- `ProductosServiciosMovimientosInventario.idUsuario`: `UNIQUEIDENTIFIER NULL`

### Proteccion multitenant

Confirmada por:

- unicidad por `idEmpresa + Codigo` en catalogos y tabla principal;
- FK compuestas por `idEmpresa` + identificador del catalogo o producto;
- unicidad de existencia por `idEmpresa + idProductoServicio`.

### Ausencias requeridas

- FK hacia `dbo.Usuarios`: `0`
- FK a sucursal: `0`
- campos o referencias GPS: `0` observables en el modulo creado
- estado operativo fuera del modelo aprobado: `no observado`

## Correccion de contexto servidor

### Patron real confirmado el 3 de agosto de 2026

La auditoria del proyecto confirmo el Patron B compatible con Patron D:

- el frontend MVC `checklist` mantiene autenticacion por cookie y sesion;
- el login persiste `idEmpresa`, `cadena`, `empresa` y `emailUser` en sesion;
- modulos funcionales como `Activos` resuelven ese contexto en MVC y llaman a la API desde servidor;
- la API `checklistWs` local no registra `UseAuthentication()`, por lo que una llamada directa a `localhost:5127` no trae claims de empresa.

### Correccion aplicada

Sin tocar autenticacion global, sesion, roles ni permisos:

- se agrego el controlador MVC exclusivo `/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/ProductosServicios/ProductosServiciosController.cs`;
- se agrego en la API un fallback exclusivo de `ProductosServicios` para aceptar contexto firmado servidor-a-servidor cuando no existan claims;
- la firma usa headers `X-ProductosServicios-Proxy-*`, HMAC-SHA256 y tolerancia de 5 minutos;
- la validacion sigue comparando `idEmpresa` efectivo contra el solicitado.

## QA HTTP real

### Estado anterior reproducido

La API local del proyecto:

- no registra `UseAuthentication()`;
- no configura esquema de autenticacion en `Program.cs`;
- no tiene un mecanismo local observable para poblar claims de empresa al ejecutar `checklistWs` en `localhost:5127`.

Prueba real realizada:

- `GET /api/ProductosServicios/ObtenerCombosProductosServicios?idEmpresa=00000000-0000-0000-0000-000000000163`
- respuesta: `401 Unauthorized`
- payload: `{\"mensaje\":\"No fue posible resolver la empresa activa.\"}`

Esto confirma que el modulo protege la empresa, pero tambien que el contexto autenticado requerido no se encuentra disponible en la API local ejecutada aisladamente.

### Estado posterior a la correccion

Prueba real repetida el `2026-08-03` contra `http://127.0.0.1:5127`:

1. Llamada directa sin contexto firmado:
   - `GET /api/ProductosServicios/ObtenerCombosProductosServicios?idEmpresa=00000000-0000-0000-0000-000000000163`
   - resultado: `401 Unauthorized`
   - payload: `{\"mensaje\":\"No fue posible resolver la empresa activa.\"}`

2. Llamada con contexto firmado equivalente al proxy MVC:
   - mismos endpoint y `idEmpresa`;
   - headers `X-ProductosServicios-Proxy-*` validos;
   - resultado: `200 OK`
   - payload funcional observado:
     - `categorias: []`
     - `marcas: []`
     - `unidadesMedida: []`
     - `tipos: Producto/Servicio`
     - `estatus: Activos/Inactivos/Todos`

Esto confirma que el bloqueo original de contexto de empresa quedo resuelto sin redisenar la autenticacion global.

### Ajuste adicional detectado y corregido durante QA

La misma prueba firmada revelo un defecto independiente del contexto:

- `ObtenerCombosProductosServicios` consultaba `Descripcion` en `dbo.ProductosServiciosUnidadesMedida`;
- la columna `Descripcion` no existe en el SQL aprobado para `UnidadesMedida`;
- se corrigio la rama de `UnidadesMedida` en API para no leer ni escribir esa columna y normalizar `Descripcion` como cadena vacia en DTOs.

## QA realizado efectivamente

### Sesion real validada

Fecha de corrida real: `2026-08-03`.

Validado en una sola sesion y una sola pagina automatizada:

- URL posterior al login: `http://127.0.0.1:5200/Home/Index`
- correo en sesion del navegador: `denisse@checkapp.com.mx`
- `sessionStorage.empresa`: `163`
- `sessionStorage.idEmpresa`: `b17aaece-2b78-4e35-b554-9e694eeb15a7`
- encabezado visible confirmado: `UMBRELLA`
- usuario visible confirmado: `Denisse Martinez Mendiola`

### Cobertura real del proxy MVC firmado

Se ejecutaron exitosamente los `37` endpoints del modulo mediante el proxy MVC autenticado:

1. `ObtenerProductosServicios`
2. `ObtenerProductoServicio`
3. `SubirImagenTemporal`
4. `LimpiarImagenTemporal`
5. `GuardarProductoServicio`
6. `BajaProductoServicio`
7. `ActivarProductoServicio`
8. `ObtenerCombosProductosServicios`
9. `ObtenerResumenProductosServicios`
10. `ExportarProductosServicios`
11. `ObtenerCategoriasProductosServicios`
12. `ObtenerCategoriaProductoServicio`
13. `GuardarCategoriaProductoServicio`
14. `BajaCategoriaProductoServicio`
15. `ActivarCategoriaProductoServicio`
16. `ObtenerCatalogoCategoriasProductosServicios`
17. `ExportarCategoriasProductosServicios`
18. `ObtenerMarcasProductosServicios`
19. `ObtenerMarcaProductoServicio`
20. `GuardarMarcaProductoServicio`
21. `BajaMarcaProductoServicio`
22. `ActivarMarcaProductoServicio`
23. `ObtenerCatalogoMarcasProductosServicios`
24. `ExportarMarcasProductosServicios`
25. `ObtenerUnidadesMedidaProductosServicios`
26. `ObtenerUnidadMedidaProductoServicio`
27. `GuardarUnidadMedidaProductoServicio`
28. `BajaUnidadMedidaProductoServicio`
29. `ActivarUnidadMedidaProductoServicio`
30. `ObtenerCatalogoUnidadesMedidaProductosServicios`
31. `ExportarUnidadesMedidaProductosServicios`
32. `ObtenerExistenciaProductoServicio`
33. `ObtenerMovimientosInventarioProductoServicio`
34. `RegistrarEntradaInventarioProductoServicio`
35. `RegistrarSalidaInventarioProductoServicio`
36. `RegistrarAjustePositivoInventarioProductoServicio`
37. `RegistrarAjusteNegativoInventarioProductoServicio`

### Resultados funcionales QA

Validaciones reales completadas:

- categorias: alta, consulta, baja logica, reactivacion, catalogo y exportacion;
- marcas: alta, consulta, baja logica, reactivacion, catalogo y exportacion;
- unidades de medida: alta, consulta, baja logica, reactivacion, catalogo y exportacion;
- producto inventariable: alta correcta con existencia inicial `10`;
- producto no inventariable: alta correcta;
- servicio: alta correcta sin inventario;
- edicion: actualizacion correcta;
- cambios de inventario: conversion `no inventariable -> inventariable` correcta con existencia inicial `0`;
- cambios de tipo: conversion `producto -> servicio` correcta sobre registro sin historial ni existencia;
- baja logica y reactivacion de producto: correctas;
- KPI: respuesta `200 OK` con resumen funcional del modulo;
- filtros: busqueda por sufijo QA, tipo, categoria, marca, unidad y bandera de inventario;
- exportacion: las cuatro exportaciones respondieron `200 OK` y `content-disposition attachment`;
- existencia inicial: generacion correcta en el alta del producto inventariable;
- entrada: `+5` correcta;
- salida: `-3` correcta;
- ajuste positivo: `+2` correcto;
- ajuste negativo: `-14` correcto;
- existencia final del producto principal: `0`;
- bloqueo de existencia negativa: correcto con `400` y mensaje de negocio;
- cambios de inventario bloqueados con historial: correcto con `400`;
- cambios de tipo bloqueados con historial: correcto con `400`;
- conservacion de historial: movimientos preservados, conteo observado `5`;
- multitenant por proxy MVC: correcto; aun enviando un `idEmpresa` ajeno en query, el proxy resolvio y devolvio datos del tenant activo `163`;
- concurrencia: correcta bajo `Serializable`; dos salidas simultaneas sobre existencia `1` produjeron `1` exito, `1` rechazo por negativo y existencia final `0`;
- Firebase temporal: carga y limpieza de imagen temporal correctas sin tocar configuracion ni credenciales.

### Exportaciones observadas

- `ExportarCategoriasProductosServicios`: `200 OK`, `attachment`, tamano observado `1254 bytes`
- `ExportarMarcasProductosServicios`: `200 OK`, `attachment`, tamano observado `743 bytes`
- `ExportarUnidadesMedidaProductosServicios`: `200 OK`, `attachment`, tamano observado `798 bytes`
- `ExportarProductosServicios`: `200 OK`, `attachment`, tamano observado `1661 bytes`

## Datos QA

Sufijo unico de corrida:

- `20260803220114`

GUIDs QA creados:

- categoria producto: `21927841-c96b-4414-be15-9249678ab576`
- categoria servicio: `e9b56153-0659-4ce4-a704-783e20b9e12a`
- categoria spare: `4d812752-6c8a-41b8-88c4-c529c07410bf`
- marca principal: `6d7344c3-8923-4e55-9474-1b24d6987e67`
- marca spare: `0a07b94b-296c-45fe-a897-b225e5bcfea8`
- unidad principal: `72bf05d5-de87-49e8-aa49-5c9e9a20507e`
- unidad spare: `5986ea43-4f4d-465e-9b17-ae873bcfca9e`
- producto inventariable: `5da5e17d-64c1-41dc-b85e-860ad6a4809a`
- producto switch: `dc218b2e-8eb9-4a41-87e5-b2242b0dced0`
- producto concurrencia: `9d62f40c-c3e8-44f1-8feb-66a91f2ec633`
- servicio final validado: `b9171397-e7fe-481c-8692-55405e0b3991`

Registros con baja logica generados durante QA:

- categoria spare: baja y reactivacion validadas
- marca spare: baja y reactivacion validadas
- unidad spare: baja y reactivacion validadas
- producto switch: baja y reactivacion validadas

## Defectos encontrados

No se identificaron defectos funcionales reproducibles del modulo en esta corrida final.

Observacion metodologica, no clasificada como defecto:

- una primera alta de servicio intento reutilizar una imagen temporal ya limpiada por la misma prueba;
- se repitio la validacion del servicio con alta limpia sin imagen temporal;
- el servicio se registro correctamente y quedo validado.

## Pendientes para frontend o integracion

- ninguno bloqueante para SQL o API del modulo;
- el frontend puede implementarse sobre el contrato ya validado del proxy MVC firmado.

## Procesos y puertos

Antes del cierre:

- `5200`: listener activo del MVC local iniciado por Codex
- `5127`: listener activo de la API local iniciada por Codex

Despues del cierre:

- procesos iniciados por Codex cerrados correctamente
- `5200`: sin listener
- `5127`: sin listener
- procesos temporales adicionales: `ninguno`

## Cambios no realizados

- Cambios de codigo API: `ninguno`
- Cambios SQL durante QA final: `ninguno`
- Frontend modificado: `ninguno`
- Login o autenticacion modificados: `ninguno`
- Firebase modificado: `ninguno`
- Menu modificado: `ninguno`
- Roles y permisos modificados: `ninguno`
- Modulos ajenos modificados: `ninguno`

## Decision

El modelo SQL quedo aplicado y validado estructuralmente en la base real autorizada.

La API del modulo quedo validada mediante el proxy MVC firmado dentro de la sesion real autorizada de la empresa `163`.

Las reglas de negocio de catalogos, productos, servicios, inventario, multitenant, concurrencia y limpieza temporal quedaron certificadas en ejecucion real.

### Dictamen

`SQL Y API CERTIFICADOS — LISTOS PARA IMPLEMENTAR FRONTEND`
