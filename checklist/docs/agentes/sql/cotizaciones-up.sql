IF OBJECT_ID(N'dbo.Cotizaciones', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Cotizaciones
    (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Cotizaciones PRIMARY KEY,
        idEmpresa UNIQUEIDENTIFIER NOT NULL,
        identityKey UNIQUEIDENTIFIER NOT NULL,
        Folio NVARCHAR(30) NOT NULL,
        Estado TINYINT NOT NULL,
        FechaCotizacion DATETIME2(0) NOT NULL,
        VigenciaDias INT NOT NULL CONSTRAINT DF_Cotizaciones_VigenciaDias DEFAULT (0),
        FechaVigencia DATETIME2(0) NULL,
        idCliente UNIQUEIDENTIFIER NOT NULL,
        idSucursal UNIQUEIDENTIFIER NULL,
        Vendedor NVARCHAR(200) NOT NULL CONSTRAINT DF_Cotizaciones_Vendedor DEFAULT (N''),
        Caja NVARCHAR(100) NOT NULL CONSTRAINT DF_Cotizaciones_Caja DEFAULT (N''),
        Observaciones NVARCHAR(1000) NOT NULL CONSTRAINT DF_Cotizaciones_Observaciones DEFAULT (N''),
        Subtotal DECIMAL(18,2) NOT NULL CONSTRAINT DF_Cotizaciones_Subtotal DEFAULT (0),
        DescuentoTotal DECIMAL(18,2) NOT NULL CONSTRAINT DF_Cotizaciones_DescuentoTotal DEFAULT (0),
        Total DECIMAL(18,2) NOT NULL CONSTRAINT DF_Cotizaciones_Total DEFAULT (0),
        TotalPiezas DECIMAL(18,2) NOT NULL CONSTRAINT DF_Cotizaciones_TotalPiezas DEFAULT (0),
        MotivoCancelacion NVARCHAR(500) NOT NULL CONSTRAINT DF_Cotizaciones_MotivoCancelacion DEFAULT (N''),
        FechaCancelacion DATETIME2(0) NULL,
        idUsuarioCreacion UNIQUEIDENTIFIER NULL,
        idUsuarioActualizacion UNIQUEIDENTIFIER NULL,
        idUsuarioCancelacion UNIQUEIDENTIFIER NULL,
        FechaCreacion DATETIME2(0) NOT NULL,
        FechaActualizacion DATETIME2(0) NOT NULL,
        FechaArchivado DATETIME2(0) NULL,
        Activo BIT NOT NULL CONSTRAINT DF_Cotizaciones_Activo DEFAULT (1)
    );
END;
GO

IF OBJECT_ID(N'dbo.CotizacionesPartidas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CotizacionesPartidas
    (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_CotizacionesPartidas PRIMARY KEY,
        idCotizacion UNIQUEIDENTIFIER NOT NULL,
        idEmpresa UNIQUEIDENTIFIER NOT NULL,
        identityKey UNIQUEIDENTIFIER NOT NULL,
        NumeroPartida INT NOT NULL,
        idProductoServicio UNIQUEIDENTIFIER NOT NULL,
        Codigo NVARCHAR(50) NOT NULL,
        Nombre NVARCHAR(200) NOT NULL,
        Descripcion NVARCHAR(1000) NOT NULL CONSTRAINT DF_CotizacionesPartidas_Descripcion DEFAULT (N''),
        TipoProductoServicio TINYINT NOT NULL,
        idUnidadMedida UNIQUEIDENTIFIER NOT NULL,
        UnidadMedida NVARCHAR(100) NOT NULL,
        UnidadAbreviatura NVARCHAR(30) NOT NULL CONSTRAINT DF_CotizacionesPartidas_UnidadAbreviatura DEFAULT (N''),
        UnidadPermiteDecimales BIT NOT NULL CONSTRAINT DF_CotizacionesPartidas_UnidadPermiteDecimales DEFAULT (0),
        PermiteVentaSinExistencia BIT NOT NULL CONSTRAINT DF_CotizacionesPartidas_PermiteVentaSinExistencia DEFAULT (0),
        ExistenciaActual DECIMAL(18,2) NULL,
        Cantidad DECIMAL(18,2) NOT NULL,
        PrecioUnitario DECIMAL(18,2) NOT NULL,
        DescuentoPct DECIMAL(9,2) NOT NULL CONSTRAINT DF_CotizacionesPartidas_DescuentoPct DEFAULT (0),
        ImporteBruto DECIMAL(18,2) NOT NULL,
        DescuentoImporte DECIMAL(18,2) NOT NULL CONSTRAINT DF_CotizacionesPartidas_DescuentoImporte DEFAULT (0),
        Total DECIMAL(18,2) NOT NULL,
        FechaCreacion DATETIME2(0) NOT NULL,
        FechaActualizacion DATETIME2(0) NOT NULL,
        FechaArchivado DATETIME2(0) NULL,
        Activo BIT NOT NULL CONSTRAINT DF_CotizacionesPartidas_Activo DEFAULT (1)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_CotizacionesPartidas_Cotizaciones'
)
BEGIN
    ALTER TABLE dbo.CotizacionesPartidas
    ADD CONSTRAINT FK_CotizacionesPartidas_Cotizaciones
        FOREIGN KEY (idCotizacion) REFERENCES dbo.Cotizaciones(id);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_Cotizaciones_Empresa_Folio'
      AND object_id = OBJECT_ID(N'dbo.Cotizaciones')
)
BEGIN
    CREATE UNIQUE INDEX UX_Cotizaciones_Empresa_Folio
        ON dbo.Cotizaciones (idEmpresa, Folio);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Cotizaciones_Empresa_Fecha_Estado'
      AND object_id = OBJECT_ID(N'dbo.Cotizaciones')
)
BEGIN
    CREATE INDEX IX_Cotizaciones_Empresa_Fecha_Estado
        ON dbo.Cotizaciones (idEmpresa, FechaCotizacion DESC, Estado, Activo);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Cotizaciones_Empresa_Cliente'
      AND object_id = OBJECT_ID(N'dbo.Cotizaciones')
)
BEGIN
    CREATE INDEX IX_Cotizaciones_Empresa_Cliente
        ON dbo.Cotizaciones (idEmpresa, idCliente, Activo);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_CotizacionesPartidas_Cotizacion_Numero'
      AND object_id = OBJECT_ID(N'dbo.CotizacionesPartidas')
)
BEGIN
    CREATE INDEX IX_CotizacionesPartidas_Cotizacion_Numero
        ON dbo.CotizacionesPartidas (idCotizacion, NumeroPartida, Activo);
END;
GO
