# TICKET 09 — Presentaciones de Venta

Fecha: `2026-09-03`

## Alcance de esta fase

Esta entrega corresponde solo a `FASE 1` del ticket `#MOKA`.

- Se auditó el modelo actual.
- Se auditó la relación con `PrecioPublico`, `Precio unitario` y `Variantes`.
- Se propone el modelo y el motor para `FASE 2`.
- No se modificó código funcional.
- No se ejecutó SQL.
- No se modificó `POS`.
- No se modificó `Ticket 08`.

## Evidencia auditada

- [AGENTS.md](/Users/denissemendiola/dev/Inspecciones/inspector/AGENTS.md)
- [CLAUDE.md](/Users/denissemendiola/dev/Inspecciones/inspector/CLAUDE.md)
- [PRODUCTOS_SERVICIOS_MODELO_DATOS.md](/Users/denissemendiola/dev/Inspecciones/inspector/docs/productos-servicios/PRODUCTOS_SERVICIOS_MODELO_DATOS.md)
- [PRODUCTOS_SERVICIOS_BLUEPRINT.md](/Users/denissemendiola/dev/Inspecciones/inspector/docs/productos-servicios/PRODUCTOS_SERVICIOS_BLUEPRINT.md)
- [PRODUCTOS_SERVICIOS_AMPLIACION_20260819.md](/Users/denissemendiola/dev/Inspecciones/inspector/docs/productos-servicios/PRODUCTOS_SERVICIOS_AMPLIACION_20260819.md)
- [ProductosServiciosController.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs)
- [ProductosServiciosModels.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Models/ProductosServicios/ProductosServiciosModels.cs)
- [ProductosServiciosController.cs](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/ProductosServicios/ProductosServiciosController.cs)
- [Index.cshtml](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Views/ProductosServicios/Index.cshtml)
- [ProductosServicios.js](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/wwwroot/js/ProductosServicios/ProductosServicios.js)
- [CotizacionesController.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/Cotizaciones/CotizacionesController.cs)
- [OrdenesCompraController.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs)

## Entrega #MOKA — Fase 1

1. Unidad base actual del producto se puede reutilizar: `Sí`.
   Campo actual: `ProductosServicios.idUnidadMedida`.

2. Campo/relación actual:
   La unidad base del producto ya se relaciona con `dbo.ProductosServiciosUnidadesMedida` y es la referencia actual para inventario, combos, ficha y consumidores comerciales.

3. PermiteDecimales disponible: `Sí`.
   Campo actual: `ProductosServiciosUnidadesMedida.PermiteDecimales`.

4. PrecioPublico consumidores encontrados:
   `api/ProductosServicios` listado, detalle, ficha y PDF.
   `frontend ProductosServicios` modal, grid y ficha.
   `api/Cotizaciones` usa precio unitario capturado en partida, pero el lookup de producto sigue partiendo del producto base.
   `api/OrdenesCompra` consulta producto base y snapshot base.
   `ProductosServiciosVariantes` ya tiene `PrecioPublico` por variante y no debe confundirse con presentaciones.

5. Estrategia sincronización PrecioPublico/predeterminada:
   Mantener `PrecioPublico` como campo legado compatible y sincronizarlo en backend con el precio de la presentación `EsPredeterminada = 1`.
   La fuente de verdad propuesta para `FASE 2` debe ser `ProductosServiciosPresentacionesVenta.Precio`.
   Regla propuesta: al guardar presentaciones, el backend recalcula y persiste `ProductosServicios.PrecioPublico = precio presentación predeterminada`.
   Regla inversa: si se intenta editar `PrecioPublico`, el backend debe reflejarlo en la presentación predeterminada dentro de la misma transacción.

6. Estructura existente para presentaciones: `No`.
   No se encontró tabla, DTO, endpoint ni sección UI reutilizable para `Presentaciones de venta`.

7. Tabla nueva necesaria: `Sí`.

8. Nombre propuesto:
   `dbo.ProductosServiciosPresentacionesVenta`.

9. Campos propuestos:
   `id`
   `idEmpresa`
   `identityKey`
   `idProductoServicio`
   `Nombre`
   `EquivalenciaBase`
   `Precio`
   `EsPredeterminada`
   `Orden`
   `Activo`
   `FechaCreacion`
   `FechaActualizacion`
   `FechaArchivado`

10. Baja lógica propuesta:
    `Activo = 0`
    `FechaArchivado = SYSUTCDATETIME()`
    `FechaActualizacion = SYSUTCDATETIME()`
    No borrar físicamente para preservar trazabilidad futura de ventas.

11. Multitenant:
    La tabla debe pertenecer a `idEmpresa + idProductoServicio`.
    Todas las lecturas y escrituras deben validar empresa desde contexto server-side igual que el resto del módulo.
    La FK propuesta debe ser compuesta por `idEmpresa + idProductoServicio`.

12. Relación Producto:
    `1 ProductoServicio -> N PresentacionesVenta`.
    Debe existir exactamente `1` activa predeterminada por producto.

13. Relación Variante actual:
    Hoy las variantes son un modelo separado en `ProductosServiciosVariantes`.
    Tienen `Sku`, `Nombre`, `Costo`, `PrecioPublico`, `PrecioComparacion` y metadatos propios.
    No existe hoy relación entre variante y presentación.

14. ¿Presentaciones deberían ser por Producto o Variante?:
    `Por Producto` en esta fase.
    El ticket pide auditar antes de inventar regla para variantes y hoy no existe contrato ni UI para manejar `presentaciones por variante`.
    Llevarlo a variante sin definición PO duplicaría complejidad de persistencia, motor, UI y compatibilidad comercial.

15. Recomendación PO sobre Variantes:
    Mantener `Presentaciones de venta` solo a nivel `ProductoServicio` base en `FASE 2`.
    Dejar explícitamente pendiente una decisión PO posterior para saber si una variante podrá:
    heredar presentaciones del producto,
    sobrescribir precios por presentación,
    o tener presentaciones completamente propias.

16. Precio Unitario actual se conserva: `Sí`.

17. Cómo convivirá visualmente:
    `Precio unitario` se conserva como bloque informativo/comercial independiente.
    `Presentaciones de venta` se agrega dentro de `Precios y Costos` como grid compacto debajo de `Precio público` y antes de `Precio unitario`, o inmediatamente después del bloque de precios principales.
    No debe mezclarse en la misma estructura de datos ni en la misma tabla.

18. Cambio Unidad base con presentaciones — estrategia segura:
    Si el producto ya tiene presentaciones activas, bloquear guardado directo del cambio de `Unidad`.
    Mostrar advertencia funcional y exigir una decisión explícita futura.
    Regla segura propuesta para `FASE 2`: no convertir automáticamente equivalencias.
    Ruta autorizable posterior:
    eliminar/recrear presentaciones,
    o usar un flujo dedicado de migración todavía no aprobado.

19. Motor de combinación — ubicación propuesta:
    Backend API, dentro del dominio `ProductosServicios`, como servicio reutilizable interno.
    Propuesta técnica:
    `ProductoPresentacionVentaPricingEngine`
    o helpers privados dentro de `ProductosServiciosController` en la primera iteración.
    Exponer después un endpoint de consulta reutilizable para POS, sin integrarlo todavía a POS.

20. Algoritmo propuesto:
    Programación dinámica de `cobertura exacta` sobre cantidad en unidad base normalizada.
    Pasos:
    normalizar cantidad solicitada y equivalencias a una escala entera segura,
    resolver combinación exacta de menor costo total,
    desempatar por menor número de presentaciones,
    después por mayor equivalencia,
    después por `Orden` estable de configuración.
    Esto soporta `N` presentaciones mejor que lógica greedy y evita errores donde una combinación barata no es localmente obvia.

21. Soporta N presentaciones: `Sí`.
    El diseño propuesto no impone límite artificial.

22. Soporta decimales: `Sí`.
    Condición: normalizar equivalencias y cantidad solicitada según precisión admitida por la unidad base.
    Si `PermiteDecimales = 0`, equivalencias y cantidades deben validarse como enteros exactos.

23. Ejemplo 7 piezas:
    Configuración:
    `1 = $10`
    `6 = $50`
    `10 = $80`
    Resultado:
    `1 Sixpack + 1 Individual = $60`
    Inventario:
    `-7 piezas`

24. Ejemplo 12 piezas:
    Configuración:
    `1 = $10`
    `6 = $50`
    `10 = $80`
    Comparaciones exactas:
    `12 individuales = $120`
    `1 paquete 10 + 2 individuales = $100`
    `2 sixpacks = $100`
    Resultado propuesto por desempate:
    `2 Sixpacks = $100`
    Motivo:
    mismo total mínimo, pero menor número de presentaciones.

25. Ejemplo 16 piezas:
    Configuración:
    `10 + 6 = $130`
    Es mejor que `16 individuales = $160`.
    Resultado:
    `1 Paquete 10 + 1 Sixpack = $130`

26. Ejemplo tela:
    Unidad base:
    `Centímetro`
    Presentaciones:
    `1 cm = $0.80`
    `50 cm = $35`
    `100 cm = $60`
    `1000 cm = $500`
    Para `150 cm`, resultado:
    `1 Metro + 1 Medio metro = $95`
    Inventario:
    `-150 cm`

27. Tablas/archivos que requerirían cambios:
    Tabla nueva:
    `dbo.ProductosServiciosPresentacionesVenta`
    Backend:
    [ProductosServiciosController.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs)
    [ProductosServiciosModels.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Models/ProductosServicios/ProductosServiciosModels.cs)
    Frontend MVC proxy:
    [ProductosServiciosController.cs](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/ProductosServicios/ProductosServiciosController.cs)
    UI:
    [Index.cshtml](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Views/ProductosServicios/Index.cshtml)
    [ProductosServicios.js](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/wwwroot/js/ProductosServicios/ProductosServicios.js)
    [ProductosServicios.css](/Users/denissemendiola/dev/Inspecciones/inspector/checklist/wwwroot/css/ProductosServicios/ProductosServicios.css)
    Impacto de lectura compatible:
    [CotizacionesController.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/Cotizaciones/CotizacionesController.cs)
    [OrdenesCompraController.cs](/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs)

28. SQL propuesto SIN EJECUTAR:

```sql
CREATE TABLE dbo.ProductosServiciosPresentacionesVenta
(
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosPresentacionesVenta PRIMARY KEY,
    idEmpresa UNIQUEIDENTIFIER NOT NULL,
    identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_IdentityKey DEFAULT (NEWID()),
    idProductoServicio UNIQUEIDENTIFIER NOT NULL,
    Nombre NVARCHAR(150) NOT NULL,
    EquivalenciaBase DECIMAL(18,4) NOT NULL,
    Precio DECIMAL(18,2) NOT NULL,
    EsPredeterminada BIT NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_EsPredeterminada DEFAULT (0),
    Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_Orden DEFAULT (0),
    Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_Activo DEFAULT (1),
    FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_FechaCreacion DEFAULT (SYSUTCDATETIME()),
    FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_FechaActualizacion DEFAULT (SYSUTCDATETIME()),
    FechaArchivado DATETIME2(0) NULL,
    CONSTRAINT FK_ProductosServiciosPresentacionesVenta_Producto
        FOREIGN KEY (idEmpresa, idProductoServicio)
        REFERENCES dbo.ProductosServicios (idEmpresa, id),
    CONSTRAINT CK_ProductosServiciosPresentacionesVenta_Equivalencia
        CHECK (EquivalenciaBase > 0),
    CONSTRAINT CK_ProductosServiciosPresentacionesVenta_Precio
        CHECK (Precio >= 0)
);

CREATE UNIQUE INDEX UX_ProductosServiciosPresentacionesVenta_Empresa_Id
    ON dbo.ProductosServiciosPresentacionesVenta (idEmpresa, id);

CREATE INDEX IX_ProductosServiciosPresentacionesVenta_Empresa_Producto_Activo
    ON dbo.ProductosServiciosPresentacionesVenta (idEmpresa, idProductoServicio, Activo, Orden);

CREATE UNIQUE INDEX UX_ProductosServiciosPresentacionesVenta_Default
    ON dbo.ProductosServiciosPresentacionesVenta (idEmpresa, idProductoServicio)
    WHERE Activo = 1 AND EsPredeterminada = 1;
```

29. Riesgos:
    Sin tabla hija no existe persistencia real para `N` presentaciones.
    Si se mezcla con `Precio unitario`, se rompe el concepto comercial aprobado.
    Si se reutiliza `Variantes`, se contamina un modelo ya existente con otra semántica.
    Cambiar unidad base con presentaciones sin flujo dedicado puede corromper equivalencias.
    `Cotizaciones`, `Ventas` futuras y `POS` necesitarán un punto de verdad común para no recalcular distinto.
    Para decimales, una implementación greedy puede fallar en mínimos globales.

30. Decisiones adicionales PO necesarias:
    Confirmar si `Presentaciones de venta` quedan solo por producto o si luego existirán por variante.
    Confirmar si la UI debe permitir editar `Precio público` directo o solo desde la presentación predeterminada.
    Confirmar precisión máxima permitida para `EquivalenciaBase` en unidades decimales.
    Confirmar si el producto debe poder guardarse temporalmente sin presentaciones en alta inicial o si la primera presentación debe ser obligatoria desde el primer guardado.
    Confirmar si productos `Servicio` también soportarán presentaciones comerciales sin inventario.

31. Código modificado: `NO`.

32. SQL ejecutado: `NO`.

33. Ticket 08 modificado: `NO`.

34. POS modificado: `NO`.

35. Dictamen:
    `PROPUESTA PRESENTACIONES DE VENTA — PENDIENTE APROBACIÓN PO`

## Conclusión

El modelo actual sí reutiliza correctamente la `unidad base` y el flag `PermiteDecimales`, pero no cuenta con una estructura persistente para `N presentaciones` ni con un motor reusable de combinación exacta. Para implementar `FASE 2` sin romper el módulo actual, se requiere una tabla hija nueva, sincronización transaccional con `PrecioPublico`, un motor backend de optimización exacta y una decisión explícita del Product Owner para la relación futura con `Variantes`.
