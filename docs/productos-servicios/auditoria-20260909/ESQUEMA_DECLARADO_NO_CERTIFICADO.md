# Anexo: esquema DECLARADO en scripts, no esquema real certificado

La conexión SQL fue rechazada (18456). Ninguna definición de este anexo demuestra que el objeto exista actualmente en la base. Se consolidan CREATE/ADD/ALTER locales en orden de evolución; los scripts no se ejecutaron. Las referencias API son ocurrencias textuales que deben leerse en contexto, no prueba de ejecución.

## ProductosServiciosCategorias

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:18`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosCategorias PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosCategorias_id DEFAULT (NEWID())` (productos-servicios-up.sql:19) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:22) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosCategorias_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:23) | 127, 301, 403, 1218, 1220 |
| Codigo | NVARCHAR(50) | No | `Codigo NVARCHAR(50) NOT NULL` (productos-servicios-up.sql:25) | 130, 251, 266, 304, 406 |
| Nombre | NVARCHAR(150) | No | `Nombre NVARCHAR(150) NOT NULL` (productos-servicios-up.sql:26) | 132, 135, 138, 140, 145 |
| Descripcion | NVARCHAR(500) | Sí | `Descripcion NVARCHAR(500) NULL` (productos-servicios-up.sql:27) | 133, 254, 307, 409, 567 |
| AplicaA | TINYINT | No | `AplicaA TINYINT NOT NULL CONSTRAINT DF_ProductosServiciosCategorias_AplicaA DEFAULT ((0))` (productos-servicios-up.sql:28) | 136, 310, 570, 2662, 2690 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosCategorias_Activo DEFAULT ((1))` (productos-servicios-up.sql:30) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosCategorias_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:32) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosCategorias_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:34) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (productos-servicios-up.sql:36) | 187, 361, 462, 626, 1218 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosCategorias_Empresa_Codigo` UNIQUE (idEmpresa, Codigo) [productos-servicios-up.sql:220].
- `UX_ProductosServiciosCategorias_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:232].
- `IX_ProductosServiciosCategorias_Empresa_Nombre` (idEmpresa, Nombre) [productos-servicios-up.sql:244].
- `IX_ProductosServiciosCategorias_Empresa_Activo` (idEmpresa, Activo) [productos-servicios-up.sql:256].

FK salientes declaradas:

- Ninguna en los scripts examinados.

FK entrantes declaradas:

- ProductosServicios (idEmpresa, idCategoria) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- `CONSTRAINT CK_ProductosServiciosCategorias_AplicaA CHECK (AplicaA IN (0, 1, 2))`

## ProductosServiciosMarcas

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:45`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosMarcas PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosMarcas_id DEFAULT (NEWID())` (productos-servicios-up.sql:46) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:49) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosMarcas_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:50) | 127, 301, 403, 1218, 1220 |
| Codigo | NVARCHAR(50) | No | `Codigo NVARCHAR(50) NOT NULL` (productos-servicios-up.sql:52) | 130, 251, 266, 304, 406 |
| Nombre | NVARCHAR(150) | No | `Nombre NVARCHAR(150) NOT NULL` (productos-servicios-up.sql:53) | 132, 135, 138, 140, 145 |
| Descripcion | NVARCHAR(500) | Sí | `Descripcion NVARCHAR(500) NULL` (productos-servicios-up.sql:54) | 133, 254, 307, 409, 567 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosMarcas_Activo DEFAULT ((1))` (productos-servicios-up.sql:55) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosMarcas_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:57) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosMarcas_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:59) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (productos-servicios-up.sql:61) | 187, 361, 462, 626, 1218 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosMarcas_Empresa_Codigo` UNIQUE (idEmpresa, Codigo) [productos-servicios-up.sql:268].
- `UX_ProductosServiciosMarcas_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:280].
- `IX_ProductosServiciosMarcas_Empresa_Nombre` (idEmpresa, Nombre) [productos-servicios-up.sql:292].
- `IX_ProductosServiciosMarcas_Empresa_Activo` (idEmpresa, Activo) [productos-servicios-up.sql:304].

FK salientes declaradas:

- Ninguna en los scripts examinados.

FK entrantes declaradas:

- ProductosServicios (idEmpresa, idMarca) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosUnidadesMedida

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:68`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosUnidadesMedida PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosUnidadesMedida_id DEFAULT (NEWID())` (productos-servicios-up.sql:69) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:72) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosUnidadesMedida_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:73) | 127, 301, 403, 1218, 1220 |
| Codigo | NVARCHAR(30) | No | `Codigo NVARCHAR(30) NOT NULL` (productos-servicios-up.sql:75) | 130, 251, 266, 304, 406 |
| Nombre | NVARCHAR(100) | No | `Nombre NVARCHAR(100) NOT NULL` (productos-servicios-up.sql:76) | 132, 135, 138, 140, 145 |
| Abreviatura | NVARCHAR(20) | No | `Abreviatura NVARCHAR(20) NOT NULL` (productos-servicios-up.sql:77) | 141, 315, 586, 2750, 2759 |
| PermiteDecimales | BIT | No | `PermiteDecimales BIT NOT NULL CONSTRAINT DF_ProductosServiciosUnidadesMedida_PermiteDecimales DEFAULT ((0))` (productos-servicios-up.sql:78) | 142, 316, 587, 1366, 1372 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosUnidadesMedida_Activo DEFAULT ((1))` (productos-servicios-up.sql:80) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosUnidadesMedida_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:82) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosUnidadesMedida_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:84) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (productos-servicios-up.sql:86) | 187, 361, 462, 626, 1218 |
| TipoUnidad | NVARCHAR(20) | No | `TipoUnidad NVARCHAR(20) NOT NULL` (ticket-10-unidades-controladas-up.sql:50) | 1377, 1378, 2750, 2782, 3150 |
| EsSistema | BIT | No | `EsSistema BIT NOT NULL CONSTRAINT DF_PSUnidades_EsSistema DEFAULT ((0))` (ticket-10-unidades-controladas-up.sql:10) | 2750, 2782, 2936, 3150, 3761 |
| EsPersonalizada | BIT | No | `EsPersonalizada BIT NOT NULL CONSTRAINT DF_PSUnidades_EsPersonalizada DEFAULT ((1))` (ticket-10-unidades-controladas-up.sql:12) | 2750, 2782, 3150, 3761, 4167 |
| FactorConversion | DECIMAL(28,12) | Sí | `FactorConversion DECIMAL(28,12) NULL` (ticket-10-unidades-controladas-up.sql:14) | 1385, 2750, 2782, 3150, 3348 |
| Convertible | BIT | No | `Convertible BIT NOT NULL CONSTRAINT DF_PSUnidades_Convertible DEFAULT ((0))` (ticket-10-unidades-controladas-up.sql:16) | 1377, 2750, 2782, 3150, 3344 |
| ClaveSistema | NVARCHAR(30) | Sí | `ClaveSistema NVARCHAR(30) NULL` (ticket-10-unidades-controladas-up.sql:18) | 2750, 2782, 3761, 4167, 7121 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosUnidadesMedida_Empresa_Codigo` UNIQUE (idEmpresa, Codigo) [productos-servicios-up.sql:316].
- `UX_ProductosServiciosUnidadesMedida_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:328].
- `IX_ProductosServiciosUnidadesMedida_Empresa_Nombre` (idEmpresa, Nombre) [productos-servicios-up.sql:340].
- `IX_ProductosServiciosUnidadesMedida_Empresa_Activo` (idEmpresa, Activo) [productos-servicios-up.sql:352].
- `UX_PSUnidades_Empresa_ClaveSistema` UNIQUE (idEmpresa,ClaveSistema) WHERE ClaveSistema IS NOT NULL [ticket-10-unidades-controladas-up.sql:83].

FK salientes declaradas:

- Ninguna en los scripts examinados.

FK entrantes declaradas:

- ProductosServicios (idEmpresa, idUnidadMedida) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServicios

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:93`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServicios PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServicios_id DEFAULT (NEWID())` (productos-servicios-up.sql:94) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:97) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServicios_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:98) | 127, 301, 403, 1218, 1220 |
| Tipo | TINYINT | No | `Tipo TINYINT NOT NULL` (productos-servicios-up.sql:100) | 106, 128, 129, 259, 302 |
| Codigo | NVARCHAR(50) | No | `Codigo NVARCHAR(50) NOT NULL` (productos-servicios-up.sql:101) | 130, 251, 266, 304, 406 |
| Tag | NVARCHAR(100) | Sí | `Tag NVARCHAR(100) NULL` (productos-servicios-up.sql:102) | 131, 252, 305, 407, 474 |
| Nombre | NVARCHAR(150) | No | `Nombre NVARCHAR(150) NOT NULL` (productos-servicios-up.sql:103) | 132, 135, 138, 140, 145 |
| Descripcion | NVARCHAR(MAX) | Sí | `Descripcion NVARCHAR(MAX) NULL` (productos-servicios-up.sql:150) | 133, 254, 307, 409, 567 |
| idCategoria | UNIQUEIDENTIFIER | No | `idCategoria UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:105) | 107, 134, 190, 260, 308 |
| idMarca | UNIQUEIDENTIFIER | Sí | `idMarca UNIQUEIDENTIFIER NULL` (productos-servicios-up.sql:106) | 108, 137, 194, 261, 311 |
| idUnidadMedida | UNIQUEIDENTIFIER | No | `idUnidadMedida UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:107) | 109, 139, 192, 262, 313 |
| Costo | DECIMAL(18, 2) | Sí | `Costo DECIMAL(18, 2) NULL` (productos-servicios-up.sql:108) | 153, 327, 429, 588, 665 |
| PrecioPublico | DECIMAL(18, 2) | No | `PrecioPublico DECIMAL(18, 2) NOT NULL` (productos-servicios-up.sql:109) | 154, 328, 430, 589, 666 |
| CausaInventario | BIT | No | `CausaInventario BIT NOT NULL CONSTRAINT DF_ProductosServicios_CausaInventario DEFAULT ((0))` (productos-servicios-up.sql:110) | 110, 172, 263, 346, 448 |
| PermiteVentaSinExistencia | BIT | No | `PermiteVentaSinExistencia BIT NOT NULL CONSTRAINT DF_ProductosServicios_PermiteVentaSinExistencia DEFAULT ((0))` (productos-servicios-up.sql:112) | 173, 347, 449, 608, 685 |
| ImagenUrl | NVARCHAR(1000) | Sí | `ImagenUrl NVARCHAR(1000) NULL` (productos-servicios-up.sql:114) | 178, 352, 453, 582, 659 |
| ImagenNombre | NVARCHAR(255) | Sí | `ImagenNombre NVARCHAR(255) NULL` (productos-servicios-up.sql:115) | 179, 353, 454, 583, 660 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServicios_Activo DEFAULT ((1))` (productos-servicios-up.sql:116) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServicios_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:118) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | Sí | `FechaActualizacion DATETIME2(0) NULL` (productos-servicios-up.sql:120) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (productos-servicios-up.sql:121) | 187, 361, 462, 626, 1218 |
| PrecioComparacion | DECIMAL(18, 2) | Sí | `PrecioComparacion DECIMAL(18, 2) NULL` (productos-servicios-up.sql:543) | 155, 329, 431, 590, 667 |
| PrecioUnitarioMonto | DECIMAL(18, 6) | Sí | `PrecioUnitarioMonto DECIMAL(18, 6) NULL` (productos-servicios-up.sql:549) | 156, 330, 432, 591, 668 |
| PrecioUnitarioCantidadTotal | DECIMAL(18, 6) | Sí | `PrecioUnitarioCantidadTotal DECIMAL(18, 6) NULL` (productos-servicios-up.sql:555) | 157, 331, 433, 592, 669 |
| PrecioUnitarioUnidadTotal | NVARCHAR(20) | Sí | `PrecioUnitarioUnidadTotal NVARCHAR(20) NULL` (productos-servicios-up.sql:561) | 158, 332, 434, 593, 670 |
| PrecioUnitarioBaseCantidad | DECIMAL(18, 6) | Sí | `PrecioUnitarioBaseCantidad DECIMAL(18, 6) NULL` (productos-servicios-up.sql:567) | 159, 333, 435, 594, 671 |
| PrecioUnitarioUnidad | NVARCHAR(20) | Sí | `PrecioUnitarioUnidad NVARCHAR(20) NULL` (productos-servicios-up.sql:573) | 160, 334, 436, 595, 672 |
| PrecioUnitarioUnidadBase | NVARCHAR(20) | Sí | `PrecioUnitarioUnidadBase NVARCHAR(20) NULL` (productos-servicios-up.sql:579) | 161, 335, 437, 596, 673 |
| ObjetoImpuesto | NVARCHAR(4) | Sí | `ObjetoImpuesto NVARCHAR(4) NULL` (productos-servicios-up.sql:585) | 162, 336, 438, 599, 676 |
| PorcentajeIVA | DECIMAL(5, 2) | No | `PorcentajeIVA DECIMAL(5, 2) NOT NULL CONSTRAINT DF_ProductosServicios_PorcentajeIVA DEFAULT (0)` (productos-servicios-up.sql:591) | 163, 337, 439, 600, 677 |
| ClaveProductoSat | NVARCHAR(20) | Sí | `ClaveProductoSat NVARCHAR(20) NULL` (productos-servicios-up.sql:598) | 164, 338, 440, 597, 674 |
| ClaveUnidadSat | NVARCHAR(10) | Sí | `ClaveUnidadSat NVARCHAR(10) NULL` (productos-servicios-up.sql:604) | 165, 339, 441, 598, 675 |
| EsProductoFisico | BIT | No | `EsProductoFisico BIT NOT NULL CONSTRAINT DF_ProductosServicios_EsProductoFisico DEFAULT ((0))` (productos-servicios-up.sql:610) | 166, 340, 442, 601, 678 |
| PesoKg | DECIMAL(18, 5) | Sí | `PesoKg DECIMAL(18, 5) NULL` (productos-servicios-up.sql:617) | 167, 341, 443, 602, 679 |
| LargoCm | DECIMAL(18, 2) | Sí | `LargoCm DECIMAL(18, 2) NULL` (productos-servicios-up.sql:623) | 149, 168, 323, 342, 444 |
| AnchoCm | DECIMAL(18, 2) | Sí | `AnchoCm DECIMAL(18, 2) NULL` (productos-servicios-up.sql:629) | 150, 169, 324, 343, 445 |
| AltoCm | DECIMAL(18, 2) | Sí | `AltoCm DECIMAL(18, 2) NULL` (productos-servicios-up.sql:635) | 151, 170, 325, 344, 446 |
| UsaNumeroSerie | BIT | No | `UsaNumeroSerie BIT NOT NULL CONSTRAINT DF_ProductosServicios_UsaNumeroSerie DEFAULT ((0))` (productos-servicios-up.sql:641) | 171, 345, 447, 606, 683 |
| idColeccion | UNIQUEIDENTIFIER | Sí | `idColeccion UNIQUEIDENTIFIER NULL` (productos-servicios-up.sql:648) | 143, 196, 317, 370, 419 |
| idPaquete | UNIQUEIDENTIFIER | Sí | `idPaquete UNIQUEIDENTIFIER NULL` (productos-servicios-up.sql:654) | 146, 198, 320, 372, 422 |

Índices declarados (adicionales a PK):

- `UX_ProductosServicios_Empresa_Codigo` UNIQUE (idEmpresa, Codigo) [productos-servicios-up.sql:364].
- `UX_ProductosServicios_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:376].
- `IX_ProductosServicios_Empresa_Tipo_Activo` (idEmpresa, Tipo, Activo) [productos-servicios-up.sql:388].
- `IX_ProductosServicios_Empresa_Categoria_Activo` (idEmpresa, idCategoria, Activo) [productos-servicios-up.sql:400].
- `IX_ProductosServicios_Empresa_Marca_Activo` (idEmpresa, idMarca, Activo) [productos-servicios-up.sql:412].
- `IX_ProductosServicios_Empresa_Unidad_Activo` (idEmpresa, idUnidadMedida, Activo) [productos-servicios-up.sql:424].
- `IX_ProductosServicios_Empresa_Tag` (idEmpresa, Tag) [productos-servicios-up.sql:436].

FK salientes declaradas:

- `FK_ProductosServicios_Categorias_EmpresaId` (idEmpresa, idCategoria) → ProductosServiciosCategorias (idEmpresa, id).
- `FK_ProductosServicios_Marcas_EmpresaId` (idEmpresa, idMarca) → ProductosServiciosMarcas (idEmpresa, id).
- `FK_ProductosServicios_Unidades_EmpresaId` (idEmpresa, idUnidadMedida) → ProductosServiciosUnidadesMedida (idEmpresa, id).
- `FK_ProductosServicios_Colecciones_EmpresaId` (idEmpresa, idColeccion) → ProductosServiciosColecciones (idEmpresa, id).
- `FK_ProductosServicios_Paquetes_EmpresaId` (idEmpresa, idPaquete) → ProductosServiciosPaquetes (idEmpresa, id).

FK entrantes declaradas:

- ProductosServiciosExistencias (idEmpresa, idProductoServicio) → (idEmpresa, id).
- ProductosServiciosMovimientosInventario (idEmpresa, idProductoServicio) → (idEmpresa, id).
- ProductosServiciosProductoAtributos (idEmpresa, idProductoServicio) → (idEmpresa, id).
- ProductosServiciosVariantes (idEmpresa, idProductoServicio) → (idEmpresa, id).
- ProductosServiciosOpcionesVariante (idEmpresa, idProductoServicio) → (idEmpresa, id).
- ProductosServiciosProductoTags (idEmpresa, idProductoServicio) → (idEmpresa, id).
- ProductosServiciosMultimedia (idEmpresa, idProductoServicio) → (idEmpresa, id).
- ProductosServiciosPresentacionesVenta (idEmpresa, idProductoServicio) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- `CONSTRAINT CK_ProductosServicios_Tipo CHECK (Tipo IN (1, 2))`
- `CONSTRAINT CK_ProductosServicios_ValoresMonetarios CHECK ( PrecioPublico >= 0 AND (Costo IS NULL OR Costo >= 0) )`
- `CONSTRAINT CK_ProductosServicios_ServicioSinInventario CHECK ( Tipo = 1 OR ( idMarca IS NULL AND CausaInventario = 0 AND PermiteVentaSinExistencia = 0 ) )`

## ProductosServiciosExistencias

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:156`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosExistencias PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosExistencias_id DEFAULT (NEWID())` (productos-servicios-up.sql:157) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:160) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosExistencias_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:161) | 127, 301, 403, 1218, 1220 |
| idProductoServicio | UNIQUEIDENTIFIER | No | `idProductoServicio UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:163) | 200, 204, 209, 211, 215 |
| ExistenciaActual | DECIMAL(18, 4) | No | `ExistenciaActual DECIMAL(18, 4) NOT NULL CONSTRAINT DF_ProductosServiciosExistencias_ExistenciaActual DEFAULT ((0))` (productos-servicios-up.sql:164) | 175, 349, 450, 609, 686 |
| ExistenciaMinima | DECIMAL(18, 4) | No | `ExistenciaMinima DECIMAL(18, 4) NOT NULL CONSTRAINT DF_ProductosServiciosExistencias_ExistenciaMinima DEFAULT ((0))` (productos-servicios-up.sql:166) | 176, 350, 451, 610, 687 |
| CostoPromedio | DECIMAL(18, 2) | Sí | `CostoPromedio DECIMAL(18, 2) NULL` (productos-servicios-up.sql:168) | 177, 351, 452, 3401, 3422 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosExistencias_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:169) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosExistencias_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:171) | 186, 360, 461, 1218, 1220 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosExistencias_Empresa_ProductoServicio` UNIQUE (idEmpresa, idProductoServicio) [productos-servicios-up.sql:448].

FK salientes declaradas:

- `FK_ProductosServiciosExistencias_ProductosServicios_EmpresaId` (idEmpresa, idProductoServicio) → ProductosServicios (idEmpresa, id).

FK entrantes declaradas:

- Ninguna del núcleo en los scripts examinados.

Constraints incluidos en CREATE TABLE:

- `CONSTRAINT CK_ProductosServiciosExistencias_Valores CHECK ( ExistenciaMinima >= 0 AND (CostoPromedio IS NULL OR CostoPromedio >= 0) )`

## ProductosServiciosMovimientosInventario

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:184`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosMovimientosInventario PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosMovimientosInventario_id DEFAULT (NEWID())` (productos-servicios-up.sql:185) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:188) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosMovimientosInventario_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:189) | 127, 301, 403, 1218, 1220 |
| idProductoServicio | UNIQUEIDENTIFIER | No | `idProductoServicio UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:191) | 200, 204, 209, 211, 215 |
| TipoMovimiento | TINYINT | No | `TipoMovimiento TINYINT NOT NULL` (productos-servicios-up.sql:192) | 2564, 2601, 2608, 2610, 2613 |
| Cantidad | DECIMAL(18, 4) | No | `Cantidad DECIMAL(18, 4) NOT NULL` (productos-servicios-up.sql:193) | 1374, 2608, 2610, 3192, 3302 |
| ExistenciaAnterior | DECIMAL(18, 4) | No | `ExistenciaAnterior DECIMAL(18, 4) NOT NULL` (productos-servicios-up.sql:194) | 3193, 3449, 3564, 3641, 3661 |
| ExistenciaPosterior | DECIMAL(18, 4) | No | `ExistenciaPosterior DECIMAL(18, 4) NOT NULL` (productos-servicios-up.sql:195) | 2608, 2609, 2610, 3194, 3450 |
| CostoUnitario | DECIMAL(18, 2) | Sí | `CostoUnitario DECIMAL(18, 2) NULL` (productos-servicios-up.sql:196) | 2609, 2610, 3195, 3451, 3635 |
| Referencia | NVARCHAR(150) | Sí | `Referencia NVARCHAR(150) NULL` (productos-servicios-up.sql:197) | 2610, 3196, 3452, 3664, 3671 |
| Observaciones | NVARCHAR(1000) | Sí | `Observaciones NVARCHAR(1000) NULL` (productos-servicios-up.sql:198) | 2610, 3197, 3453, 3644, 3665 |
| idUsuario | UNIQUEIDENTIFIER | Sí | `idUsuario UNIQUEIDENTIFIER NULL` (productos-servicios-up.sql:199) | 75, 3198, 3454, 3666, 3671 |
| FechaMovimiento | DATETIME2(0) | No | `FechaMovimiento DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosMovimientosInventario_FechaMovimiento DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:200) | 3199, 3202, 3455, 3459, 3667 |

Índices declarados (adicionales a PK):

- `IX_ProductosServiciosMovimientos_Empresa_ProductoServicio_FechaMovimiento` (idEmpresa, idProductoServicio, FechaMovimiento) [productos-servicios-up.sql:460].
- `IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento` (idEmpresa, FechaMovimiento) [productos-servicios-up.sql:472].

FK salientes declaradas:

- `FK_ProductosServiciosMovimientos_ProductosServicios_EmpresaId` (idEmpresa, idProductoServicio) → ProductosServicios (idEmpresa, id).

FK entrantes declaradas:

- Ninguna del núcleo en los scripts examinados.

Constraints incluidos en CREATE TABLE:

- `CONSTRAINT CK_ProductosServiciosMovimientos_Tipo CHECK (TipoMovimiento IN (1, 2, 3, 4, 5))`
- `CONSTRAINT CK_ProductosServiciosMovimientos_Cantidad CHECK (Cantidad > 0)`
- `CONSTRAINT CK_ProductosServiciosMovimientos_ValoresMonetarios CHECK (CostoUnitario IS NULL OR CostoUnitario >= 0)`

## ProductosServiciosColecciones

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:660`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosColecciones PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosColecciones_id DEFAULT (NEWID())` (productos-servicios-up.sql:661) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:664) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosColecciones_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:665) | 127, 301, 403, 1218, 1220 |
| Numero | NVARCHAR(50) | No | `Numero NVARCHAR(50) NOT NULL` (productos-servicios-up.sql:667) | 144, 318, 573, 2111, 2113 |
| Nombre | NVARCHAR(150) | No | `Nombre NVARCHAR(150) NOT NULL` (productos-servicios-up.sql:668) | 132, 135, 138, 140, 145 |
| Descripcion | NVARCHAR(500) | Sí | `Descripcion NVARCHAR(500) NULL` (productos-servicios-up.sql:669) | 133, 254, 307, 409, 567 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosColecciones_Activo DEFAULT ((1))` (productos-servicios-up.sql:670) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosColecciones_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:672) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosColecciones_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:674) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (productos-servicios-up.sql:676) | 187, 361, 462, 626, 1218 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosColecciones_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:1035].
- `UX_ProductosServiciosColecciones_Empresa_Numero` UNIQUE (idEmpresa, Numero) [productos-servicios-up.sql:1046].
- `IX_ProductosServiciosColecciones_Empresa_Nombre` (idEmpresa, Nombre) [productos-servicios-up.sql:1057].

FK salientes declaradas:

- Ninguna en los scripts examinados.

FK entrantes declaradas:

- ProductosServicios (idEmpresa, idColeccion) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosPaquetes

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:683`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosPaquetes PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosPaquetes_id DEFAULT (NEWID())` (productos-servicios-up.sql:684) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:687) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosPaquetes_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:688) | 127, 301, 403, 1218, 1220 |
| Nombre | NVARCHAR(150) | No | `Nombre NVARCHAR(150) NOT NULL` (productos-servicios-up.sql:690) | 132, 135, 138, 140, 145 |
| TipoPaquete | NVARCHAR(30) | No | `TipoPaquete NVARCHAR(30) NOT NULL` (productos-servicios-up.sql:691) | 148, 322, 424, 577, 654 |
| LargoCm | DECIMAL(18, 2) | Sí | `LargoCm DECIMAL(18, 2) NULL` (productos-servicios-up.sql:692) | 149, 168, 323, 342, 444 |
| AnchoCm | DECIMAL(18, 2) | Sí | `AnchoCm DECIMAL(18, 2) NULL` (productos-servicios-up.sql:693) | 150, 169, 324, 343, 445 |
| AltoCm | DECIMAL(18, 2) | Sí | `AltoCm DECIMAL(18, 2) NULL` (productos-servicios-up.sql:694) | 151, 170, 325, 344, 446 |
| PesoEmpaqueVacioKg | DECIMAL(18, 5) | Sí | `PesoEmpaqueVacioKg DECIMAL(18, 5) NULL` (productos-servicios-up.sql:695) | 152, 326, 428, 581, 658 |
| EsPredeterminado | BIT | No | `EsPredeterminado BIT NOT NULL CONSTRAINT DF_ProductosServiciosPaquetes_EsPredeterminado DEFAULT ((0))` (productos-servicios-up.sql:696) | 2192, 2196, 2198, 2209, 2211 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosPaquetes_Activo DEFAULT ((1))` (productos-servicios-up.sql:698) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosPaquetes_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:700) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosPaquetes_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:702) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (productos-servicios-up.sql:704) | 187, 361, 462, 626, 1218 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosPaquetes_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:1068].
- `IX_ProductosServiciosPaquetes_Empresa_Nombre` (idEmpresa, Nombre) [productos-servicios-up.sql:1079].

FK salientes declaradas:

- Ninguna en los scripts examinados.

FK entrantes declaradas:

- ProductosServicios (idEmpresa, idPaquete) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- `CONSTRAINT CK_ProductosServiciosPaquetes_Tipo CHECK (TipoPaquete IN (N'caja', N'sobre', N'flexible'))`

## ProductosServiciosAtributos

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:713`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosAtributos PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosAtributos_id DEFAULT (NEWID())` (productos-servicios-up.sql:714) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:717) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosAtributos_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:718) | 127, 301, 403, 1218, 1220 |
| Nombre | NVARCHAR(100) | No | `Nombre NVARCHAR(100) NOT NULL` (productos-servicios-up.sql:720) | 132, 135, 138, 140, 145 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosAtributos_Activo DEFAULT ((1))` (productos-servicios-up.sql:721) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosAtributos_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:723) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosAtributos_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:725) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (productos-servicios-up.sql:727) | 187, 361, 462, 626, 1218 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosAtributos_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:1090].
- `UX_ProductosServiciosAtributos_Empresa_Nombre` UNIQUE (idEmpresa, Nombre) [productos-servicios-up.sql:1101].

FK salientes declaradas:

- Ninguna en los scripts examinados.

FK entrantes declaradas:

- ProductosServiciosAtributosValores (idEmpresa, idAtributo) → (idEmpresa, id).
- ProductosServiciosProductoAtributos (idEmpresa, idAtributo) → (idEmpresa, id).
- ProductosServiciosVarianteValores (idEmpresa, idAtributo) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosAtributosValores

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:734`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosAtributosValores PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosAtributosValores_id DEFAULT (NEWID())` (productos-servicios-up.sql:735) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:738) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosAtributosValores_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:739) | 127, 301, 403, 1218, 1220 |
| idAtributo | UNIQUEIDENTIFIER | No | `idAtributo UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:741) | 2334, 2341, 2352, 2354, 2357 |
| Valor | NVARCHAR(100) | No | `Valor NVARCHAR(100) NOT NULL` (productos-servicios-up.sql:742) | 2352, 2355, 2368, 2410, 2421 |
| Orden | INT | No | `Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosAtributosValores_Orden DEFAULT ((1))` (productos-servicios-up.sql:743) | 1345, 1414, 1420, 2352, 2355 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosAtributosValores_Activo DEFAULT ((1))` (productos-servicios-up.sql:745) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosAtributosValores_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:747) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosAtributosValores_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:749) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (productos-servicios-up.sql:751) | 187, 361, 462, 626, 1218 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosAtributosValores_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:1112].
- `UX_ProductosServiciosAtributosValores_Empresa_Atributo_Valor` UNIQUE (idEmpresa, idAtributo, Valor) [productos-servicios-up.sql:1123].

FK salientes declaradas:

- `FK_ProductosServiciosAtributosValores_Atributos_EmpresaId` (idEmpresa, idAtributo) → ProductosServiciosAtributos (idEmpresa, id).

FK entrantes declaradas:

- ProductosServiciosProductoAtributoValores (idEmpresa, idAtributoValor) → (idEmpresa, id).
- ProductosServiciosVarianteValores (idEmpresa, idAtributoValor) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosProductoAtributos

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:758`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosProductoAtributos PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosProductoAtributos_id DEFAULT (NEWID())` (productos-servicios-up.sql:759) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:762) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributos_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:763) | 127, 301, 403, 1218, 1220 |
| idProductoServicio | UNIQUEIDENTIFIER | No | `idProductoServicio UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:765) | 200, 204, 209, 211, 215 |
| idAtributo | UNIQUEIDENTIFIER | No | `idAtributo UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:766) | 2334, 2341, 2352, 2354, 2357 |
| Orden | INT | No | `Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributos_Orden DEFAULT ((1))` (productos-servicios-up.sql:767) | 1345, 1414, 1420, 2352, 2355 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributos_Activo DEFAULT ((1))` (productos-servicios-up.sql:769) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributos_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:771) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributos_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:773) | 186, 360, 461, 1218, 1220 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosProductoAtributos_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:1134].
- `UX_ProductosServiciosProductoAtributos_Empresa_Producto_Atributo` UNIQUE (idEmpresa, idProductoServicio, idAtributo) [productos-servicios-up.sql:1145].

FK salientes declaradas:

- `FK_ProductosServiciosProductoAtributos_Productos_EmpresaId` (idEmpresa, idProductoServicio) → ProductosServicios (idEmpresa, id).
- `FK_ProductosServiciosProductoAtributos_Atributos_EmpresaId` (idEmpresa, idAtributo) → ProductosServiciosAtributos (idEmpresa, id).

FK entrantes declaradas:

- ProductosServiciosProductoAtributoValores (idEmpresa, idProductoAtributo) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosProductoAtributoValores

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:781`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosProductoAtributoValores PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosProductoAtributoValores_id DEFAULT (NEWID())` (productos-servicios-up.sql:782) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:785) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributoValores_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:786) | 127, 301, 403, 1218, 1220 |
| idProductoAtributo | UNIQUEIDENTIFIER | No | `idProductoAtributo UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:788) | 5306, 5318, 5319, 5323, 5328 |
| idAtributoValor | UNIQUEIDENTIFIER | No | `idAtributoValor UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:789) | 5299, 5308, 5331, 5332, 5336 |
| Orden | INT | No | `Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributoValores_Orden DEFAULT ((1))` (productos-servicios-up.sql:790) | 1345, 1414, 1420, 2352, 2355 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributoValores_Activo DEFAULT ((1))` (productos-servicios-up.sql:792) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributoValores_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:794) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosProductoAtributoValores_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:796) | 186, 360, 461, 1218, 1220 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosProductoAtributoValores_Empresa_ProductoAtributo_Valor` UNIQUE (idEmpresa, idProductoAtributo, idAtributoValor) [productos-servicios-up.sql:1156].

FK salientes declaradas:

- `FK_ProductosServiciosProductoAtributoValores_ProductoAtributos_EmpresaId` (idEmpresa, idProductoAtributo) → ProductosServiciosProductoAtributos (idEmpresa, id).
- `FK_ProductosServiciosProductoAtributoValores_AtributosValores_EmpresaId` (idEmpresa, idAtributoValor) → ProductosServiciosAtributosValores (idEmpresa, id).

FK entrantes declaradas:

- Ninguna del núcleo en los scripts examinados.

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosTags

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:804`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosTags PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosTags_id DEFAULT (NEWID())` (productos-servicios-up.sql:805) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:808) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosTags_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:809) | 127, 301, 403, 1218, 1220 |
| Nombre | NVARCHAR(100) | No | `Nombre NVARCHAR(100) NOT NULL` (productos-servicios-up.sql:811) | 132, 135, 138, 140, 145 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosTags_Activo DEFAULT ((1))` (productos-servicios-up.sql:812) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosTags_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:814) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosTags_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:816) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (productos-servicios-up.sql:818) | 187, 361, 462, 626, 1218 |
| NombreNormalizado | calculada: UPPER(LTRIM(RTRIM(Nombre))) | No | `NombreNormalizado AS UPPER(LTRIM(RTRIM(Nombre)))` (productos-servicios-up.sql:827) | 5715, 5719 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosTags_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:1233].
- `UX_ProductosServiciosTags_Empresa_NombreNormalizado` UNIQUE (idEmpresa, NombreNormalizado) [productos-servicios-up.sql:1244].

FK salientes declaradas:

- Ninguna en los scripts examinados.

FK entrantes declaradas:

- ProductosServiciosProductoTags (idEmpresa, idTag) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosProductoTags

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:832`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosProductoTags PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosProductoTags_id DEFAULT (NEWID())` (productos-servicios-up.sql:833) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:836) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosProductoTags_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:837) | 127, 301, 403, 1218, 1220 |
| idProductoServicio | UNIQUEIDENTIFIER | No | `idProductoServicio UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:839) | 200, 204, 209, 211, 215 |
| idTag | UNIQUEIDENTIFIER | No | `idTag UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:840) | 230, 3110, 5781, 5792, 5872 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosProductoTags_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:841) | 185, 359, 460, 1218, 1220 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosProductoTags_Empresa_Producto_Tag` UNIQUE (idEmpresa, idProductoServicio, idTag) [productos-servicios-up.sql:1255].
- `IX_ProductosServiciosProductoTags_Empresa_Tag` (idEmpresa, idTag, idProductoServicio) [productos-servicios-up.sql:1266].

FK salientes declaradas:

- `FK_ProductosServiciosProductoTags_Productos_EmpresaId` (idEmpresa, idProductoServicio) → ProductosServicios (idEmpresa, id).
- `FK_ProductosServiciosProductoTags_Tags_EmpresaId` (idEmpresa, idTag) → ProductosServiciosTags (idEmpresa, id).

FK entrantes declaradas:

- Ninguna del núcleo en los scripts examinados.

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosOpcionesVariante

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:849`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosOpcionesVariante PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosOpcionesVariante_id DEFAULT (NEWID())` (productos-servicios-up.sql:850) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:853) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVariante_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:854) | 127, 301, 403, 1218, 1220 |
| idProductoServicio | UNIQUEIDENTIFIER | No | `idProductoServicio UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:856) | 200, 204, 209, 211, 215 |
| Nombre | NVARCHAR(100) | No | `Nombre NVARCHAR(100) NOT NULL` (productos-servicios-up.sql:857) | 132, 135, 138, 140, 145 |
| Orden | INT | No | `Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVariante_Orden DEFAULT ((1))` (productos-servicios-up.sql:858) | 1345, 1414, 1420, 2352, 2355 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVariante_Activo DEFAULT ((1))` (productos-servicios-up.sql:860) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVariante_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:862) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVariante_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:864) | 186, 360, 461, 1218, 1220 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosOpcionesVariante_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:1167].
- `UX_ProductosServiciosOpcionesVariante_Empresa_Producto_Nombre` UNIQUE (idEmpresa, idProductoServicio, Nombre) [productos-servicios-up.sql:1178].

FK salientes declaradas:

- `FK_ProductosServiciosOpcionesVariante_Productos_EmpresaId` (idEmpresa, idProductoServicio) → ProductosServicios (idEmpresa, id).

FK entrantes declaradas:

- ProductosServiciosOpcionesVarianteValores (idEmpresa, idOpcionVariante) → (idEmpresa, id).
- ProductosServiciosVarianteValores (idEmpresa, idOpcionVariante) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosOpcionesVarianteValores

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:872`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosOpcionesVarianteValores PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosOpcionesVarianteValores_id DEFAULT (NEWID())` (productos-servicios-up.sql:873) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:876) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVarianteValores_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:877) | 127, 301, 403, 1218, 1220 |
| idOpcionVariante | UNIQUEIDENTIFIER | No | `idOpcionVariante UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:879) | 5361, 5391, 5421, 5430, 5466 |
| Valor | NVARCHAR(100) | No | `Valor NVARCHAR(100) NOT NULL` (productos-servicios-up.sql:880) | 2352, 2355, 2368, 2410, 2421 |
| Orden | INT | No | `Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVarianteValores_Orden DEFAULT ((1))` (productos-servicios-up.sql:881) | 1345, 1414, 1420, 2352, 2355 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVarianteValores_Activo DEFAULT ((1))` (productos-servicios-up.sql:883) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVarianteValores_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:885) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosOpcionesVarianteValores_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:887) | 186, 360, 461, 1218, 1220 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosOpcionesVarianteValores_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:1189].
- `UX_ProductosServiciosOpcionesVarianteValores_Empresa_Opcion_Valor` UNIQUE (idEmpresa, idOpcionVariante, Valor) [productos-servicios-up.sql:1200].

FK salientes declaradas:

- `FK_ProductosServiciosOpcionesVarianteValores_Opciones_EmpresaId` (idEmpresa, idOpcionVariante) → ProductosServiciosOpcionesVariante (idEmpresa, id).

FK entrantes declaradas:

- ProductosServiciosVarianteValores (idEmpresa, idOpcionVarianteValor) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosVariantes

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:895`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosVariantes PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosVariantes_id DEFAULT (NEWID())` (productos-servicios-up.sql:896) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:899) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosVariantes_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:900) | 127, 301, 403, 1218, 1220 |
| idProductoServicio | UNIQUEIDENTIFIER | No | `idProductoServicio UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:902) | 200, 204, 209, 211, 215 |
| Sku | NVARCHAR(100) | Sí | `Sku NVARCHAR(100) NULL` (productos-servicios-up.sql:903) | 5408, 5449, 6103, 6105, 6110 |
| Nombre | NVARCHAR(200) | No | `Nombre NVARCHAR(200) NOT NULL` (productos-servicios-up.sql:904) | 132, 135, 138, 140, 145 |
| ClaveCombinacion | NVARCHAR(500) | No | `ClaveCombinacion NVARCHAR(500) NOT NULL` (productos-servicios-up.sql:905) | 4078, 5410, 5451, 6043, 6044 |
| ImagenUrl | NVARCHAR(1000) | Sí | `ImagenUrl NVARCHAR(1000) NULL` (productos-servicios-up.sql:929) | 178, 352, 453, 582, 659 |
| ImagenNombre | NVARCHAR(255) | Sí | `ImagenNombre NVARCHAR(255) NULL` (productos-servicios-up.sql:936) | 179, 353, 454, 583, 660 |
| Costo | DECIMAL(18, 2) | Sí | `Costo DECIMAL(18, 2) NULL` (productos-servicios-up.sql:943) | 153, 327, 429, 588, 665 |
| PrecioPublico | DECIMAL(18, 2) | Sí | `PrecioPublico DECIMAL(18, 2) NULL` (productos-servicios-up.sql:909) | 154, 328, 430, 589, 666 |
| PrecioComparacion | DECIMAL(18, 2) | Sí | `PrecioComparacion DECIMAL(18, 2) NULL` (productos-servicios-up.sql:910) | 155, 329, 431, 590, 667 |
| PrecioUnitarioMonto | DECIMAL(18, 6) | Sí | `PrecioUnitarioMonto DECIMAL(18, 6) NULL` (productos-servicios-up.sql:911) | 156, 330, 432, 591, 668 |
| PrecioUnitarioBaseCantidad | DECIMAL(18, 6) | Sí | `PrecioUnitarioBaseCantidad DECIMAL(18, 6) NULL` (productos-servicios-up.sql:912) | 159, 333, 435, 594, 671 |
| PrecioUnitarioUnidad | NVARCHAR(20) | Sí | `PrecioUnitarioUnidad NVARCHAR(20) NULL` (productos-servicios-up.sql:913) | 160, 334, 436, 595, 672 |
| Orden | INT | No | `Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosVariantes_Orden DEFAULT ((1))` (productos-servicios-up.sql:914) | 1345, 1414, 1420, 2352, 2355 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosVariantes_Activo DEFAULT ((1))` (productos-servicios-up.sql:916) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosVariantes_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:918) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosVariantes_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:920) | 186, 360, 461, 1218, 1220 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosVariantes_Empresa_Id` UNIQUE (idEmpresa, id) [productos-servicios-up.sql:1211].
- `UX_ProductosServiciosVariantes_Empresa_Producto_ClaveCombinacion` UNIQUE (idEmpresa, idProductoServicio, ClaveCombinacion) [productos-servicios-up.sql:1222].

FK salientes declaradas:

- `FK_ProductosServiciosVariantes_Productos_EmpresaId` (idEmpresa, idProductoServicio) → ProductosServicios (idEmpresa, id).

FK entrantes declaradas:

- ProductosServiciosVarianteValores (idEmpresa, idVariante) → (idEmpresa, id).

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosVarianteValores

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:949`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosVarianteValores PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosVarianteValores_id DEFAULT (NEWID())` (productos-servicios-up.sql:950) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:953) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosVarianteValores_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:954) | 127, 301, 403, 1218, 1220 |
| idVariante | UNIQUEIDENTIFIER | No | `idVariante UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:956) | 5428, 5442, 5443, 5447, 5463 |
| idAtributo | UNIQUEIDENTIFIER | Sí | `idAtributo UNIQUEIDENTIFIER NULL` (productos-servicios-up.sql:983) | 2334, 2341, 2352, 2354, 2357 |
| idAtributoValor | UNIQUEIDENTIFIER | Sí | `idAtributoValor UNIQUEIDENTIFIER NULL` (productos-servicios-up.sql:989) | 5299, 5308, 5331, 5332, 5336 |
| idOpcionVariante | UNIQUEIDENTIFIER | Sí | `idOpcionVariante UNIQUEIDENTIFIER NULL` (productos-servicios-up.sql:971) | 5361, 5391, 5421, 5430, 5466 |
| idOpcionVarianteValor | UNIQUEIDENTIFIER | Sí | `idOpcionVarianteValor UNIQUEIDENTIFIER NULL` (productos-servicios-up.sql:977) | 5355, 5385, 5423, 5432, 5467 |
| Orden | INT | No | `Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosVarianteValores_Orden DEFAULT ((1))` (productos-servicios-up.sql:961) | 1345, 1414, 1420, 2352, 2355 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosVarianteValores_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:963) | 185, 359, 460, 1218, 1220 |

Índices declarados (adicionales a PK):

- `IX_ProductosServiciosVarianteValores_Empresa_Variante_Orden` (idEmpresa, idVariante, Orden) [productos-servicios-up.sql:1277].

FK salientes declaradas:

- `FK_ProductosServiciosVarianteValores_Variantes_EmpresaId` (idEmpresa, idVariante) → ProductosServiciosVariantes (idEmpresa, id).
- `FK_ProductosServiciosVarianteValores_Atributos_EmpresaId` (idEmpresa, idAtributo) → ProductosServiciosAtributos (idEmpresa, id).
- `FK_ProductosServiciosVarianteValores_AtributosValores_EmpresaId` (idEmpresa, idAtributoValor) → ProductosServiciosAtributosValores (idEmpresa, id).
- `FK_ProductosServiciosVarianteValores_Opciones_EmpresaId` (idEmpresa, idOpcionVariante) → ProductosServiciosOpcionesVariante (idEmpresa, id).
- `FK_ProductosServiciosVarianteValores_OpcionesValores_EmpresaId` (idEmpresa, idOpcionVarianteValor) → ProductosServiciosOpcionesVarianteValores (idEmpresa, id).

FK entrantes declaradas:

- Ninguna del núcleo en los scripts examinados.

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosMultimedia

Declaración: `inspectorapi/checklistWs/Scripts/productos-servicios-up.sql:995`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosMultimedia PRIMARY KEY CLUSTERED CONSTRAINT DF_ProductosServiciosMultimedia_id DEFAULT (NEWID())` (productos-servicios-up.sql:996) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:999) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosMultimedia_identityKey DEFAULT (NEWID())` (productos-servicios-up.sql:1000) | 127, 301, 403, 1218, 1220 |
| idProductoServicio | UNIQUEIDENTIFIER | No | `idProductoServicio UNIQUEIDENTIFIER NOT NULL` (productos-servicios-up.sql:1002) | 200, 204, 209, 211, 215 |
| TipoMultimedia | NVARCHAR(20) | No | `TipoMultimedia NVARCHAR(20) NOT NULL` (productos-servicios-up.sql:1003) | 1022, 1031, 1072, 1075, 5487 |
| Foto | BIT | No | `Foto BIT NOT NULL CONSTRAINT DF_ProductosServiciosMultimedia_Foto DEFAULT ((0))` (productos-servicios-up.sql:1004) | 72, 205, 377, 5487, 5490 |
| Video | BIT | No | `Video BIT NOT NULL CONSTRAINT DF_ProductosServiciosMultimedia_Video DEFAULT ((0))` (productos-servicios-up.sql:1006) | 72, 206, 378, 5487, 5490 |
| Documento | BIT | No | `Documento BIT NOT NULL CONSTRAINT DF_ProductosServiciosMultimedia_Documento DEFAULT ((0))` (productos-servicios-up.sql:1008) | 72, 207, 379, 5487, 5505 |
| NombreOriginal | NVARCHAR(255) | No | `NombreOriginal NVARCHAR(255) NOT NULL` (productos-servicios-up.sql:1010) | 957, 966, 1065, 1076, 4446 |
| NombreAlmacenado | NVARCHAR(255) | No | `NombreAlmacenado NVARCHAR(255) NOT NULL` (productos-servicios-up.sql:1011) | 958, 967, 997, 1006, 1066 |
| Extension | NVARCHAR(20) | No | `Extension NVARCHAR(20) NOT NULL` (productos-servicios-up.sql:1012) | 959, 968, 1067, 1078, 4312 |
| MimeType | NVARCHAR(120) | No | `MimeType NVARCHAR(120) NOT NULL` (productos-servicios-up.sql:1013) | 960, 969, 1068, 1079, 5148 |
| UrlFirebase | NVARCHAR(1000) | No | `UrlFirebase NVARCHAR(1000) NOT NULL` (productos-servicios-up.sql:1014) | 961, 970, 1069, 1080, 4445 |
| PesoBytes | BIGINT | No | `PesoBytes BIGINT NOT NULL` (productos-servicios-up.sql:1015) | 963, 971, 1071, 1081, 5148 |
| Orden | INT | No | `Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosMultimedia_Orden DEFAULT ((1))` (productos-servicios-up.sql:1016) | 1345, 1414, 1420, 2352, 2355 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosMultimedia_Activo DEFAULT ((1))` (productos-servicios-up.sql:1018) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosMultimedia_FechaCreacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:1020) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosMultimedia_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (productos-servicios-up.sql:1022) | 186, 360, 461, 1218, 1220 |

Índices declarados (adicionales a PK):

- `IX_ProductosServiciosMultimedia_Empresa_Producto` (idEmpresa, idProductoServicio, Activo, TipoMultimedia, Orden) [productos-servicios-up.sql:1288].

FK salientes declaradas:

- `FK_ProductosServiciosMultimedia_Productos_EmpresaId` (idEmpresa, idProductoServicio) → ProductosServicios (idEmpresa, id).

FK entrantes declaradas:

- Ninguna del núcleo en los scripts examinados.

Constraints incluidos en CREATE TABLE:

- Ver declaraciones de columna y scripts evolutivos.

## ProductosServiciosPresentacionesVenta

Declaración: `inspectorapi/checklistWs/Scripts/ticket-09-presentaciones-venta-up.sql:27`.

| Columna | Tipo declarado | Nullable | Default / PK / declaración | Referencia API |
|---|---|---|---|---|
| id | UNIQUEIDENTIFIER | No | `id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductosServiciosPresentacionesVenta PRIMARY KEY` (ticket-09-presentaciones-venta-up.sql:28) | 125, 174, 190, 192, 194 |
| idEmpresa | UNIQUEIDENTIFIER | No | `idEmpresa UNIQUEIDENTIFIER NOT NULL` (ticket-09-presentaciones-venta-up.sql:30) | 73, 104, 113, 126, 190 |
| identityKey | UNIQUEIDENTIFIER | No | `identityKey UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_IdentityKey DEFAULT (NEWID())` (ticket-09-presentaciones-venta-up.sql:31) | 127, 301, 403, 1218, 1220 |
| idProductoServicio | UNIQUEIDENTIFIER | No | `idProductoServicio UNIQUEIDENTIFIER NOT NULL` (ticket-09-presentaciones-venta-up.sql:33) | 200, 204, 209, 211, 215 |
| Nombre | NVARCHAR(100) | No | `Nombre NVARCHAR(100) NOT NULL` (ticket-09-presentaciones-venta-up.sql:34) | 132, 135, 138, 140, 145 |
| EquivalenciaBase | DECIMAL(18, 4) | No | `EquivalenciaBase DECIMAL(18, 4) NOT NULL` (ticket-09-presentaciones-venta-up.sql:35) | 1345, 1366, 1385, 1399, 1414 |
| Precio | DECIMAL(18, 2) | No | `Precio DECIMAL(18, 2) NOT NULL` (ticket-09-presentaciones-venta-up.sql:36) | 1345, 1402, 1414, 1420, 3287 |
| EsPredeterminada | BIT | No | `EsPredeterminada BIT NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_EsPredeterminada DEFAULT ((0))` (ticket-09-presentaciones-venta-up.sql:37) | 1414, 1420, 3318, 3325, 3330 |
| Orden | INT | No | `Orden INT NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_Orden DEFAULT ((0))` (ticket-09-presentaciones-venta-up.sql:39) | 1345, 1414, 1420, 2352, 2355 |
| Activo | BIT | No | `Activo BIT NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_Activo DEFAULT ((1))` (ticket-09-presentaciones-venta-up.sql:41) | 184, 205, 206, 207, 218 |
| FechaCreacion | DATETIME2(0) | No | `FechaCreacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_FechaCreacion DEFAULT (SYSUTCDATETIME())` (ticket-09-presentaciones-venta-up.sql:43) | 185, 359, 460, 1218, 1220 |
| FechaActualizacion | DATETIME2(0) | No | `FechaActualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_ProductosServiciosPresentacionesVenta_FechaActualizacion DEFAULT (SYSUTCDATETIME())` (ticket-09-presentaciones-venta-up.sql:45) | 186, 360, 461, 1218, 1220 |
| FechaArchivado | DATETIME2(0) | Sí | `FechaArchivado DATETIME2(0) NULL` (ticket-09-presentaciones-venta-up.sql:47) | 187, 361, 462, 626, 1218 |
| CantidadVenta | DECIMAL(18,4) | No | `CantidadVenta DECIMAL(18,4) NOT NULL CONSTRAINT DF_PSPresentaciones_CantidadVenta DEFAULT ((1))` (ticket-10-unidades-controladas-up.sql:23) | 1345, 1372, 1385, 1399, 1414 |
| idUnidadVenta | UNIQUEIDENTIFIER | No | `idUnidadVenta UNIQUEIDENTIFIER NOT NULL` (ticket-10-unidades-controladas-up.sql:63) | 1345, 1360, 1371, 1399, 1414 |

Índices declarados (adicionales a PK):

- `UX_ProductosServiciosPresentacionesVenta_Empresa_Id` UNIQUE (idEmpresa, id) [ticket-09-presentaciones-venta-up.sql:61].
- `IX_ProductosServiciosPresentacionesVenta_Empresa_Producto_Activo_Orden` (idEmpresa, idProductoServicio, Activo, Orden) [ticket-09-presentaciones-venta-up.sql:67].
- `UX_ProductosServiciosPresentacionesVenta_PredeterminadaActiva` UNIQUE (idEmpresa, idProductoServicio)
            WHERE Activo = 1 AND EsPredeterminada = 1 [ticket-09-presentaciones-venta-up.sql:73].

FK salientes declaradas:

- `FK_ProductosServiciosPresentacionesVenta_Productos_EmpresaId` (idEmpresa, idProductoServicio) → ProductosServicios (idEmpresa, id).

FK entrantes declaradas:

- Ninguna del núcleo en los scripts examinados.

Constraints incluidos en CREATE TABLE:

- `CONSTRAINT CK_ProductosServiciosPresentacionesVenta_Equivalencia CHECK (EquivalenciaBase > 0)`
- `CONSTRAINT CK_ProductosServiciosPresentacionesVenta_Precio CHECK (Precio >= 0)`
- `CONSTRAINT FK_ProductosServiciosPresentacionesVenta_Productos_EmpresaId FOREIGN KEY (idEmpresa, idProductoServicio) REFERENCES dbo.ProductosServicios (idEmpresa, id)`
