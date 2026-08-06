# Órdenes de Compra API

Fecha: 2026-08-05
Fase: Implementación API / WS del MVP
SQL ejecutado: no
Conexiones a base para QA funcional: no

## 1. Resumen

Se implementó la API base del vertical de Órdenes de Compra bajo la ruta `api/OrdenesCompra`, alineada con el modelo aprobado y sin tocar frontend, menú, autenticación global, Firebase o scripts SQL.

## 2. Arquitectura

- Controlador dedicado: `Controllers/OrdenesCompra/OrdenesCompraController.cs`
- Modelos y contratos: `Models/OrdenesCompra/OrdenesCompraModels.cs`
- Conexión: `SqlConnectionFactory`
- Seguridad de empresa: claims del servidor o proxy firmado compatible con el patrón ya certificado
- Persistencia: `dbo.OrdenesCompra`, `dbo.OrdenesCompraDetalle`, `dbo.OrdenesCompraFolios`

## 3. Contexto de empresa

Prioridad aplicada:

1. claims del servidor;
2. proxy firmado;
3. comparación contra `idEmpresa` recibido por compatibilidad.

Si la empresa no puede resolverse o no coincide, la operación se rechaza.

## 4. Conexión SQL

La API usa `SqlConnectionFactory` y `SqlConnection` parametrizada.

No:

- recibe cadena de conexión;
- arma conexiones desde parámetros públicos;
- concatena filtros controlados por cliente;
- modifica configuración global.

## 5. Estados

- `1 = Borrador`
- `2 = Generada`
- `3 = Cancelada`

## 6. Transiciones

- Alta: siempre crea `Borrador`
- `Borrador -> Borrador`: edición permitida
- `Borrador -> Generada`: endpoint explícito y `Total > 0`
- `Borrador -> Cancelada`: permitido con motivo
- `Generada -> Cancelada`: permitido con motivo
- `Generada -> Borrador`: prohibido
- `Cancelada -> *`: prohibido

## 7. Folio

- generado en servidor;
- reservado al alta del borrador;
- consecutivo por empresa;
- formato visible actual: `OC-000001`;
- obtenido dentro de transacción serializable;
- usa `dbo.OrdenesCompraFolios`;
- no confía en ningún valor del cliente.

## 8. Endpoints

### GET

- `api/OrdenesCompra/ObtenerOrdenesCompra`
- `api/OrdenesCompra/ObtenerOrdenCompra`
- `api/OrdenesCompra/ObtenerResumenOrdenesCompra`
- `api/OrdenesCompra/ObtenerCombosOrdenCompra`
- `api/OrdenesCompra/BuscarProductosServiciosOrdenCompra`
- `api/OrdenesCompra/ExportarOrdenesCompra`

### POST

- `api/OrdenesCompra/GuardarBorradorOrdenCompra`
- `api/OrdenesCompra/GenerarOrdenCompra`
- `api/OrdenesCompra/CancelarOrdenCompra`

## 9. Contratos

### Guardar borrador

Encabezado:

- `Id`
- `IdEmpresa`
- `IdRazonSocial`
- `IdSucursal`
- `IdProveedor`
- `FechaOrden`
- `FechaLlegada`
- `Observaciones`
- `Partidas`

Partidas:

- `IdProductoServicio`
- `Cantidad`
- `CostoUnitario`

### Cancelar

- `IdEmpresa`
- `IdOrdenCompra`
- `MotivoCancelacion`

### Generar

- `IdEmpresa`
- `IdOrdenCompra`

### Response funcional

- `Exito`
- `Mensaje`
- `IdOrdenCompra`
- `Folio`
- `Estado`
- `EstadoNombre`
- `Subtotal`
- `Total`

## 10. Validaciones

- empresa resuelta contra contexto seguro;
- razón social existente y activa;
- sucursal existente y activa;
- proveedor existente y activo;
- producto o servicio existente y activo;
- unidad existente y activa vía el producto o servicio;
- fecha de llegada no menor a fecha de orden;
- motivo de cancelación obligatorio;
- cantidad `> 0`;
- costo unitario `>= 0`;
- duplicados rechazados en request;
- generación solo con partidas y total positivo;
- edición solo en borrador.

## 11. Cálculos

Por partida:

- `Subtotal = Cantidad x CostoUnitario`
- `Total = Subtotal`

Por encabezado:

- `Subtotal = suma de partidas activas`
- `Total = suma de partidas activas`

Regla:

- redondeo monetario a 2 decimales;
- cantidad con hasta 4 decimales.

## 12. Partidas

- la API asigna `NumeroPartida = 1..n`;
- no confía en numeración del cliente;
- en edición de borrador regenera la secuencia final;
- archiva partidas previas activas y luego inserta el conjunto validado.
- el índice `UX_OrdenesCompraDetalle_Empresa_Orden_NumeroPartida` protege solo partidas vigentes con filtro `Activo = 1 AND FechaArchivado IS NULL`;
- el nuevo conjunto vigente puede reutilizar `NumeroPartida = 1..n` sin bloquearse por el histórico archivado.

## 13. Snapshots

Cada partida persiste:

- tipo;
- código;
- nombre;
- descripción;
- unidad;
- abreviatura;
- costo unitario.

La API obtiene esos datos de tablas maestras, no de textos enviados por frontend.

La búsqueda y la toma de snapshots aplican criterios consistentes sobre empresa activa, producto o servicio activo y unidad de medida activa, para no ofrecer registros que después sean rechazados al guardar.

## 14. Transacciones

`GuardarBorradorOrdenCompra` trabaja en una sola transacción serializable que cubre:

1. validación de catálogos;
2. validación de partidas;
3. generación de folio en alta;
4. inserción/actualización de encabezado;
5. archivado de partidas previas en edición;
6. inserción del conjunto final de partidas;
7. actualización de totales.

`GenerarOrdenCompra` y `CancelarOrdenCompra` también usan transacción serializable.

## 15. Concurrencia

- el folio usa `Serializable` y actualización atómica sobre `OrdenesCompraFolios`;
- edición protege la orden con `UPDLOCK, HOLDLOCK`;
- generación protege la orden con `UPDLOCK, HOLDLOCK`;
- cancelación protege la orden con `UPDLOCK, HOLDLOCK`.

## 16. Cancelación

- endpoint explícito;
- no elimina partidas;
- no archiva automáticamente el encabezado;
- no toca inventario;
- conserva histórico;
- asigna `FechaCancelacion` desde servidor.

## 17. Listado

Devuelve:

- `Id`
- `Folio`
- `FechaOrden`
- `FechaLlegada`
- `RazonSocial`
- `Sucursal`
- `Proveedor`
- `Estado`
- `EstadoNombre`
- `Total`
- `FechaCreacion`
- `PuedeEditar`
- `PuedeGenerar`
- `PuedeCancelar`

Sin HTML ni acciones renderizadas desde backend.

## 18. Exportación

`ExportarOrdenesCompra` devuelve datos limpios reutilizables por frontend:

- folio;
- fechas;
- razón social;
- sucursal;
- proveedor;
- estado legible;
- total;
- fecha de creación.

No genera `.xlsx` desde API.

## 19. Seguridad

- contexto de empresa obligatorio;
- proxy firmado con `fireClave` compartida;
- firmas en tiempo constante;
- tolerancia temporal en headers firmados;
- mensajes seguros en español;
- logger interno para excepciones.

## 20. Mensajes

Mensajes funcionales cubiertos:

- guardado como borrador;
- actualización;
- generación;
- cancelación;
- orden no disponible;
- solo borradores editables;
- orden sin partidas;
- total no válido para generar;
- proveedor no disponible;
- razón social no disponible;
- sucursal no disponible;
- producto o servicio no disponible;
- partidas duplicadas;
- fecha inválida;
- motivo obligatorio;
- empresa no resuelta.

## 21. Reglas pospuestas

- recepción;
- inventario;
- impresión;
- adjuntos;
- impuestos;
- descuentos;
- monedas;
- tipo de cambio;
- variantes;
- reapertura;
- reactivación;
- roles y permisos específicos del módulo.

## 22. Riesgos

- el modelo usa validación lógica contra catálogos externos, no FK física;
- el formato visual final del folio puede requerir ajuste futuro;
- cuando SQL aún no esté desplegado, solo es posible certificación estática;
- si el frontend futuro manda duplicados, la API los rechazará y no consolidará silenciosamente.

## 23. Pruebas puras posibles sin SQL

- build;
- conteo de endpoints;
- verbos y rutas;
- presencia de DTOs;
- validaciones puras;
- reglas de estados;
- formato de folio;
- mensajes seguros;
- ausencia de `ex.Message` en responses;
- ausencia de recepción, inventario y variantes.

## 24. Pruebas que requieren tablas ejecutadas

- alta real;
- edición real;
- generación real;
- cancelación real;
- validación de catálogos;
- reserva concurrente de folio;
- listado con datos;
- exportación con datos;
- verificación de índices y checks.

## 25. Decisiones para frontend

- el frontend debe consolidar partidas repetidas antes de enviar;
- debe tratar `GuardarBorrador` como alta y edición;
- no debe enviar totales, estado, folio ni snapshots;
- `Generada` y `Cancelada` deben mostrarse como no editables;
- `ExportarOrdenesCompra` ya entrega datos limpios para el patrón DynamicGrid.
