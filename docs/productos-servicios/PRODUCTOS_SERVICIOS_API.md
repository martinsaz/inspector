# PRODUCTOS Y SERVICIOS
## API

### Alcance

Esta fase implementa exclusivamente la capa API del módulo `Productos y servicios` sobre el contrato aprobado en:

- `/Users/denissemendiola/dev/Inspecciones/inspector/docs/productos-servicios/PRODUCTOS_SERVICIOS_BLUEPRINT.md`
- `/Users/denissemendiola/dev/Inspecciones/inspector/docs/productos-servicios/PRODUCTOS_SERVICIOS_MODELO_DATOS.md`

No ejecuta SQL.
No modifica frontend.
No modifica menú.
No agrega roles ni permisos.

### Controlador

- `api/ProductosServicios`

### Contratos principales

#### Productos y servicios

- `GET api/ProductosServicios/ObtenerProductosServicios`
- `GET api/ProductosServicios/ObtenerProductoServicio`
- `POST api/ProductosServicios/GuardarProductoServicio`
- `POST api/ProductosServicios/BajaProductoServicio`
- `POST api/ProductosServicios/ActivarProductoServicio`
- `GET api/ProductosServicios/ObtenerCombosProductosServicios`
- `GET api/ProductosServicios/ObtenerResumenProductosServicios`
- `GET api/ProductosServicios/ExportarProductosServicios`

#### Imagen principal

- `POST api/ProductosServicios/SubirImagenTemporal`
- `POST api/ProductosServicios/LimpiarImagenTemporal`

La implementación reutiliza el patrón de Firebase auditado en `Activos`, pero lo reduce a una sola imagen principal por registro.

#### Categorías

- `GET api/ProductosServicios/ObtenerCategoriasProductosServicios`
- `GET api/ProductosServicios/ObtenerCategoriaProductoServicio`
- `POST api/ProductosServicios/GuardarCategoriaProductoServicio`
- `POST api/ProductosServicios/BajaCategoriaProductoServicio`
- `POST api/ProductosServicios/ActivarCategoriaProductoServicio`
- `GET api/ProductosServicios/ObtenerCatalogoCategoriasProductosServicios`
- `GET api/ProductosServicios/ExportarCategoriasProductosServicios`

#### Marcas

- `GET api/ProductosServicios/ObtenerMarcasProductosServicios`
- `GET api/ProductosServicios/ObtenerMarcaProductoServicio`
- `POST api/ProductosServicios/GuardarMarcaProductoServicio`
- `POST api/ProductosServicios/BajaMarcaProductoServicio`
- `POST api/ProductosServicios/ActivarMarcaProductoServicio`
- `GET api/ProductosServicios/ObtenerCatalogoMarcasProductosServicios`
- `GET api/ProductosServicios/ExportarMarcasProductosServicios`

#### Unidades de medida

- `GET api/ProductosServicios/ObtenerUnidadesMedidaProductosServicios`
- `GET api/ProductosServicios/ObtenerUnidadMedidaProductoServicio`
- `POST api/ProductosServicios/GuardarUnidadMedidaProductoServicio`
- `POST api/ProductosServicios/BajaUnidadMedidaProductoServicio`
- `POST api/ProductosServicios/ActivarUnidadMedidaProductoServicio`
- `GET api/ProductosServicios/ObtenerCatalogoUnidadesMedidaProductosServicios`
- `GET api/ProductosServicios/ExportarUnidadesMedidaProductosServicios`

#### Inventario

- `GET api/ProductosServicios/ObtenerExistenciaProductoServicio`
- `GET api/ProductosServicios/ObtenerMovimientosInventarioProductoServicio`
- `POST api/ProductosServicios/RegistrarEntradaInventarioProductoServicio`
- `POST api/ProductosServicios/RegistrarSalidaInventarioProductoServicio`
- `POST api/ProductosServicios/RegistrarAjustePositivoInventarioProductoServicio`
- `POST api/ProductosServicios/RegistrarAjusteNegativoInventarioProductoServicio`

### Reglas aplicadas en servidor

#### Tipo

- `1 = Producto`
- `2 = Servicio`

#### Servicio

La API normaliza en servidor:

- `idMarca = NULL`
- `CausaInventario = false`
- `PermiteVentaSinExistencia = false`
- `ExistenciaInicial = NULL`
- `ExistenciaMinima = NULL`

La API rechaza movimientos y existencias para servicios.

#### Producto sin inventario

La API normaliza:

- `PermiteVentaSinExistencia = false`
- `ExistenciaInicial = NULL`
- `ExistenciaMinima = NULL`

No crea fila de existencia.
No crea movimientos.

#### Producto con inventario

La API:

- valida una sola fila de existencia por `empresa + producto`;
- crea existencia al alta cuando el registro es inventariable;
- genera movimiento tipo `1` solo si la existencia inicial es mayor a cero;
- calcula `ExistenciaAnterior` y `ExistenciaPosterior` en servidor;
- impide negativo cuando `PermiteVentaSinExistencia = false`.

### Cambio de inventario en edición

#### De no inventariable a inventariable

La API crea la existencia si no existe.
Genera movimiento inicial solo si la cantidad inicial es mayor a cero.

#### De inventariable a no inventariable

La API no elimina historia ni existencia.
La operación se rechaza si existe historial o una existencia distinta de cero.

### Concurrencia

Los guardados con inventario y los movimientos usan transacción SQL `Serializable`.
La lectura de existencias para movimientos usa bloqueo de actualización para evitar carreras al calcular existencia previa y posterior.

### Multiempresa

La API resuelve la conexión SQL en servidor mediante `SqlConnectionFactory`.
No recibe ni consume una cadena de conexión desde cliente.

La empresa activa se resuelve con prioridad desde `Claims` autenticados.

Cuando el host API se ejecuta localmente sin pipeline de autenticación y el módulo es consumido desde el frontend MVC autenticado, `ProductosServicios` admite un fallback exclusivo del módulo mediante headers firmados servidor-a-servidor:

- `X-ProductosServicios-Proxy-EmpresaId`
- `X-ProductosServicios-Proxy-Empresa`
- `X-ProductosServicios-Proxy-UsuarioId` opcional
- `X-ProductosServicios-Proxy-Timestamp`
- `X-ProductosServicios-Proxy-Signature`

La firma HMAC-SHA256 usa el secreto compartido ya presente en configuración `fireBdata:fireClave`, con tolerancia de `5` minutos y validación estricta del `idEmpresa` solicitado.

No se modificó la autenticación global del proyecto.
No se agregó `UseAuthentication()` en la API.
No se abrió un bypass desde navegador.

La API valida siempre `idEmpresa` y la pertenencia de:

- categoría
- marca
- unidad de medida
- producto
- existencia
- movimiento

No se confía en ids cruzados entre tenants.

### Seguridad y consistencia endurecidas

- La API no expone `ex.Message` en respuestas; los detalles internos solo se registran en logs.
- Las operaciones de Firebase no se ejecutan dentro de la transacción SQL de guardado.
- Cuando se prepara una nueva imagen principal y la persistencia SQL falla, la API compensa eliminando la imagen final recién creada.
- Cuando se reemplaza o elimina la imagen principal y el guardado confirma, la API limpia la imagen previa y el temporal correspondiente.
- `EliminarImagenPrincipal = true` permite borrar explícitamente la imagen principal sin sobrecargar el contrato de `ImagenPrincipal`.
- Para servicios o productos no inventariables la API rechaza cantidades contradictorias en `ExistenciaInicial` y `ExistenciaMinima`.
- Las unidades de medida se validan con los límites del modelo SQL: `Codigo <= 30`, `Nombre <= 100`, `Abreviatura <= 20`.
- `ProductosServiciosUnidadesMedida` se alinea al SQL aprobado: no persiste columna `Descripcion`; los DTOs del módulo la normalizan como cadena vacía para mantener compatibilidad del contrato serializado.
- Al convertir un producto a servicio o a no inventariable, la API elimina la fila residual de existencias solo si no hay historial y la existencia actual es `0`.

### Integración MVC

Se agregó un controlador exclusivo del módulo en:

- `/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/ProductosServicios/ProductosServiciosController.cs`

Este controlador:

- resuelve `idEmpresa` y `empresa` desde sesión o claims del frontend MVC;
- fuerza `idEmpresa` efectivo en la URL hacia la API;
- reenvía `GET`, `POST JSON`, `multipart/form-data` y exportaciones;
- firma el contexto servidor-a-servidor antes de llamar a `api/ProductosServicios/...`.

### Exportación

Los endpoints de exportación devuelven contratos limpios para futura interfaz.
No exponen ids internos como requisito funcional del archivo exportable.

### Usuario de inventario

`idUsuario` se resuelve desde `Claims` si hay un `Guid` disponible en:

- `ClaimTypes.NameIdentifier`
- `sub`
- `idUsuario`
- `userid`
- `uid`

Si el contexto autenticado no lo resuelve con seguridad, se guarda `NULL` y el movimiento sigue siendo válido conforme al modelo aprobado.
