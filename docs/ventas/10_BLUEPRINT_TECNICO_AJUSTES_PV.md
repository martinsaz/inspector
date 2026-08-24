# 10 BLUEPRINT TÉCNICO AJUSTES PV

Fecha: 2026-08-17

## 1. Alcance

Pantalla Legacy auditada:

- `/ajustes/pv/tiendas-ajustes`

Pantalla futura CheckApp:

- `/Ajustes/AjustesPvPorTienda`

Estado:

- `CONFIRMADO` el backend Legacy usa `dbo.TiendasAjustes`.
- `CONFIRMADO` la política de devoluciones ya consume `DiasParaDevolver`.
- `CONFIRMADO` `DiasValidezNotaCredito` y `DiasValidezValeCambio` tienen helper server-side localizado.

## 2. Trazabilidad completa

PANTALLA

- `Raramuri.blzr/Components/Pages/Ajustes/AjustesPvTiendasAjustes.razor`

FRONTEND LEGACY

- servicio: `Raramuri.blzr/Services/Ajustes/AjustesPvTiendasService.cs`

REQUEST

- `GET configuracion/tiendas-ajustes/tiendas`
- `GET configuracion/tiendas-ajustes?tienda={tiendaId}`
- `PUT configuracion/tiendas-ajustes/{tiendaId}`

ENDPOINT LEGACY

- `sazapi/Endpoints/Program.Endpoints.ConfiguracionTiendasAjustes.cs`

BACKEND LEGACY

- `MapConfiguracionTiendasAjustesEndpoints`
- `EnsureTiendasAjustesSchemaAsync`
- `TryValidateTiendasAjustesRequest`
- `GetDiasParaDevolverAsync`
- `GetDiasValidezDocumentoAsync`
- `GetTiendaAjustesAsync`

QUERY / TABLA

- tabla: `dbo.TiendasAjustes`
- sucursales catálogo: `dbo.tiendas`

REGLA DE NEGOCIO

- `DiasParaDevolver` gobierna expiración de devoluciones.
- `DiasValidezNotaCredito` gobierna vigencia por fecha de nota de crédito.
- `DiasValidezValeCambio` gobierna vigencia por fecha de vale.
- ausencia de fila o campo `NULL` puede significar fallback/default o “sin vencimiento”, según el campo.

EQUIVALENTE CHECKAPP EXISTENTE

- `CONFIRMADO` existe catálogo de sucursales reutilizable:
  - API: `checklistWs/Controllers/Activos/ActivosController.cs`
  - endpoint: `GET api/Activos/ObtenerCatalogoSucursales`
  - tabla: `dbo.Sucursales`

TABLA CHECKAPP REUTILIZABLE / NUEVA PROPUESTA

- `NO EXISTE` tabla equivalente confirmada para configuración PV por sucursal.
- propuesta conceptual:
  - `dbo.PvStoreSettings`

ENDPOINT CHECKAPP FUTURO

- `GET /api/pv/store-settings/catalogs/sucursales`
- `GET /api/pv/store-settings/{sucursalId}`
- `PUT /api/pv/store-settings/{sucursalId}`

DTO FUTURO

- `PvStoreSettingsDto`
- `PvStoreSettingsSaveRequest`
- `PvStoreSettingsSaveResponse`

FRONTEND CHECKAPP FUTURO

- vista MVC CheckApp con selector de sucursal, formulario de configuración y estados `valor/default/vacío`.

QA FUTURO

- lectura por sucursal;
- guardado;
- recarga F5;
- validación de null/default;
- consumo posterior por devoluciones y venta.

## 3. Tabla Legacy confirmada

### 3.1 DDL confirmado por código

`CONFIRMADO` en `EnsureTiendasAjustesSchemaAsync`:

```sql
CREATE TABLE dbo.TiendasAjustes(
    TiendaId                 int             NOT NULL PRIMARY KEY,
    DiasParaDevolver         int             NULL,
    DiasValidezNotaCredito   int             NULL,
    DiasValidezValeCambio    int             NULL,
    PorcentajeMinimoApartado int             NULL,
    DiasValidezApartado      int             NULL,
    LeyendaTicketVenta       nvarchar(1000)  NULL,
    LeyendaTicketDevolucion  nvarchar(1000)  NULL,
    LeyendaTicketApartado    nvarchar(1000)  NULL,
    ModoTicket               varchar(20)     NULL,
    TicketVentaApertura      varchar(20)     NULL,
    MostrarPrevioCobro       bit             NULL,
    UsarCurvasMayoreo        bit             NULL,
    ModoEtiquetaPdf          varchar(20)     NULL,
    FechaAlta                datetime        NOT NULL DEFAULT (GETDATE()),
    FechaMod                 datetime        NULL,
    UsuarioMod               int             NULL
);
```

### 3.2 PK real

- `CONFIRMADO`: `TiendaId int NOT NULL PRIMARY KEY`

### 3.3 Columna tienda/sucursal real

- `CONFIRMADO`: `TiendaId`

### 3.4 Columnas reales y nulabilidad

| Columna | Tipo SQL | Nullable | Default confirmado | Observación |
|---|---|---:|---|---|
| `TiendaId` | `int` | No | No | PK |
| `DiasParaDevolver` | `int` | Sí | No | política de devoluciones |
| `DiasValidezNotaCredito` | `int` | Sí | No | política de NC |
| `DiasValidezValeCambio` | `int` | Sí | No | política de VC |
| `PorcentajeMinimoApartado` | `int` | Sí | No | fuera de primera etapa |
| `DiasValidezApartado` | `int` | Sí | No | fuera de primera etapa |
| `LeyendaTicketVenta` | `nvarchar(1000)` | Sí | No | plantilla textual |
| `LeyendaTicketDevolucion` | `nvarchar(1000)` | Sí | No | plantilla textual |
| `LeyendaTicketApartado` | `nvarchar(1000)` | Sí | No | fuera de primera etapa |
| `ModoTicket` | `varchar(20)` | Sí | No | `grafico` / `escpos` |
| `TicketVentaApertura` | `varchar(20)` | Sí | No | `selector` / `vertical` / `horizontal` / `vertical_mayoreo` |
| `MostrarPrevioCobro` | `bit` | Sí | No | POS |
| `UsarCurvasMayoreo` | `bit` | Sí | No | fuera de alcance inmediato |
| `ModoEtiquetaPdf` | `varchar(20)` | Sí | No | `grafico` / `escpos` |
| `FechaAlta` | `datetime` | No | `GETDATE()` | auditoría |
| `FechaMod` | `datetime` | Sí | No | auditoría |
| `UsuarioMod` | `int` | Sí | No | auditoría |

## 4. Queries Legacy confirmadas

### 4.1 GET catálogo de tiendas

`CONFIRMADO`

Origen:

- `GetTiendasParaAjustesAsync`
- tabla: `dbo.tiendas`

Comportamiento:

- detecta dinámicamente columnas:
  - `numero|tienda|id`
  - `nombre|tienda|descripcion`
- devuelve solo tiendas con número positivo.

### 4.2 GET configuración por tienda

`CONFIRMADO`

Query:

```sql
SELECT TOP 1
    TiendaId, DiasParaDevolver, DiasValidezNotaCredito, DiasValidezValeCambio,
    PorcentajeMinimoApartado, DiasValidezApartado,
    LeyendaTicketVenta, LeyendaTicketDevolucion, LeyendaTicketApartado,
    ModoTicket, TicketVentaApertura, MostrarPrevioCobro, UsarCurvasMayoreo, ModoEtiquetaPdf,
    FechaAlta, FechaMod, UsuarioMod
FROM dbo.TiendasAjustes
WHERE TiendaId = @Tienda;
```

### 4.3 PUT update

`CONFIRMADO`

```sql
UPDATE dbo.TiendasAjustes
SET
    DiasParaDevolver         = @DiasParaDevolver,
    DiasValidezNotaCredito   = @DiasValidezNotaCredito,
    DiasValidezValeCambio    = @DiasValidezValeCambio,
    PorcentajeMinimoApartado = @PorcentajeMinimoApartado,
    DiasValidezApartado      = @DiasValidezApartado,
    LeyendaTicketVenta       = @LeyendaTicketVenta,
    LeyendaTicketDevolucion  = @LeyendaTicketDevolucion,
    LeyendaTicketApartado    = @LeyendaTicketApartado,
    ModoTicket               = @ModoTicket,
    TicketVentaApertura      = @TicketVentaApertura,
    MostrarPrevioCobro       = @MostrarPrevioCobro,
    UsarCurvasMayoreo        = @UsarCurvasMayoreo,
    ModoEtiquetaPdf          = @ModoEtiquetaPdf,
    FechaMod                 = @FechaMod,
    UsuarioMod               = @UsuarioMod
WHERE TiendaId = @TiendaId;
```

### 4.4 PUT insert/upsert

`CONFIRMADO`

```sql
INSERT INTO dbo.TiendasAjustes
    (TiendaId, DiasParaDevolver, DiasValidezNotaCredito, DiasValidezValeCambio,
     PorcentajeMinimoApartado, DiasValidezApartado,
     LeyendaTicketVenta, LeyendaTicketDevolucion, LeyendaTicketApartado,
     ModoTicket, TicketVentaApertura, MostrarPrevioCobro, UsarCurvasMayoreo, ModoEtiquetaPdf,
     FechaAlta, FechaMod, UsuarioMod)
VALUES
    (@TiendaId, @DiasParaDevolver, @DiasValidezNotaCredito, @DiasValidezValeCambio,
     @PorcentajeMinimoApartado, @DiasValidezApartado,
     @LeyendaTicketVenta, @LeyendaTicketDevolucion, @LeyendaTicketApartado,
     @ModoTicket, @TicketVentaApertura, @MostrarPrevioCobro, @UsarCurvasMayoreo, @ModoEtiquetaPdf,
     GETDATE(), @FechaMod, @UsuarioMod);
```

## 5. Validaciones server-side confirmadas

`CONFIRMADO` en `TryValidateTiendasAjustesRequest`:

- `DiasParaDevolver >= 0`
- `DiasValidezNotaCredito >= 0`
- `DiasValidezValeCambio >= 0`
- `PorcentajeMinimoApartado` entre `2` y `89`
- `DiasValidezApartado` entre `2` y `99`
- `ModoTicket` y `ModoEtiquetaPdf` en `grafico|escpos`
- `TicketVentaApertura` en `selector|vertical|horizontal|vertical_mayoreo`
- leyendas máximo `1000` caracteres

## 6. Consumidores por campo

| Campo | Consumidor Legacy | Estado |
|---|---|---|
| `DiasParaDevolver` | `GET /ventas/devoluciones/ticket` vía `GetDiasParaDevolverAsync` | `CONFIRMADO` |
| `DiasValidezNotaCredito` | `GetDiasValidezDocumentoAsync(..., "NC")` | `CONFIRMADO` |
| `DiasValidezValeCambio` | `GetDiasValidezDocumentoAsync(..., "VC")` | `CONFIRMADO` |
| `MostrarPrevioCobro` | UI/flujo POS planeado | `CONFIRMADO` como campo; consumidor runtime completo `NO CERRADO` |
| resto | persistidos y expuestos | `CONFIRMADO` como persistencia, `CONSUMIDOR NO CONFIRMADO` |

## 7. Fallback y null

### 7.1 Sin registro

`CONFIRMADO`

Si no existe fila:

- el endpoint devuelve objeto `item` con todos los campos configurables en `null`
- no es error
- el comentario del código lo define como “comportamiento actual”

### 7.2 `DiasParaDevolver`

`CONFIRMADO`

Orden real:

1. `dbo.TiendasAjustes.DiasParaDevolver` para la tienda
2. `cfg["Devoluciones:DiasVigencia"]`
3. `30`

### 7.3 `DiasValidezNotaCredito` / `DiasValidezValeCambio`

`CONFIRMADO`

- no tienen fallback a `appsettings`
- si el valor en `TiendasAjustes` no existe o es `NULL`, el documento no vence por fecha

## 8. Mapeo CheckApp

### 8.1 Reutilización real confirmada

| Dominio | Archivo / endpoint | Tabla | Reutilizable | Limitación |
|---|---|---|---|---|
| Sucursales | `checklistWs/Controllers/Activos/ActivosController.cs` `GET ObtenerCatalogoSucursales` | `dbo.Sucursales` | Sí | catálogo general, no configuración PV |
| MVC Ajustes | `checklist/Controllers/Ajustes/AjustesController.cs` | No aplica | Sí | hoy solo ruta placeholder |

### 8.2 Equivalente de tabla

- `CONFIRMADO`: no se encontró tabla CheckApp equivalente a `TiendasAjustes`.

### 8.3 Tabla propuesta

`CONFIRMADO` como propuesta documental, no implementada:

| Campo | Tipo conceptual | Nullable |
|---|---|---:|
| `id` | `uniqueidentifier` | No |
| `idEmpresa` | `uniqueidentifier` | No |
| `idSucursal` | `uniqueidentifier` | No |
| `DiasParaDevolver` | `int` | Sí |
| `DiasValidezNotaCredito` | `int` | Sí |
| `DiasValidezValeCambio` | `int` | Sí |
| `MostrarPrevioCobro` | `bit` | Sí |
| `PorcentajeMinimoApartado` | `int` | Sí |
| `DiasValidezApartado` | `int` | Sí |
| `LeyendaTicketVenta` | `nvarchar(1000)` | Sí |
| `LeyendaTicketDevolucion` | `nvarchar(1000)` | Sí |
| `LeyendaTicketApartado` | `nvarchar(1000)` | Sí |
| `ModoTicket` | `nvarchar(20)` | Sí |
| `TicketVentaApertura` | `nvarchar(20)` | Sí |
| `UsarCurvasMayoreo` | `bit` | Sí |
| `ModoEtiquetaPdf` | `nvarchar(20)` | Sí |
| `FechaCreacion` | `datetime2` | No |
| `FechaActualizacion` | `datetime2` | Sí |
| `idUsuarioModificacion` | `uniqueidentifier` | Sí |

Índice recomendado:

- único compuesto `idEmpresa + idSucursal`

## 9. Blueprint final por pantalla

### FRONTEND

- ruta: `/Ajustes/AjustesPvPorTienda`
- secciones:
  - selector de sucursal
  - formulario de políticas
  - bloque de ayuda sobre `vacío = usar default`
- componentes CheckApp:
  - toolbar
  - formulario tipo card
  - estados `loading/empty/error`
- responsive:
  - stack vertical móvil
  - grid 2 columnas desktop
- acciones:
  - buscar sucursal
  - cargar configuración
  - guardar
  - recargar

### MVC

- controller: `AjustesController`
- acción actual: `AjustesPvPorTienda()`
- proxy previsto:
  - `GetSucursales`
  - `GetStoreSettings`
  - `SaveStoreSettings`

### API

- endpoints futuros:
  - `GET /api/pv/store-settings/catalogs/sucursales`
  - `GET /api/pv/store-settings/{sucursalId}`
  - `PUT /api/pv/store-settings/{sucursalId}`
- multitenant:
  - `idEmpresa` resuelto server-side
  - `idSucursal` validada contra el tenant

### DTO

- request:
  - `PvStoreSettingsSaveRequest`
- response:
  - `PvStoreSettingsDto`
  - `PvStoreSettingsSaveResponse`

### SQL

- tablas reutilizadas:
  - `dbo.Sucursales`
- tabla nueva propuesta:
  - `dbo.PvStoreSettings`

### REGLAS

- server-side:
  - rangos y catálogos válidos
  - fallback/default
  - pertenencia tenant+sucursal
- frontend-only:
  - habilitar/deshabilitar campos
- no migrables:
  - semántica literal de impresión Legacy si CheckApp no la necesita

### QA

- happy path:
  - carga sucursal, modifica, guarda, recarga
- errores:
  - rangos inválidos
  - sucursal inválida
- persistencia:
  - update vs insert
- F5:
  - persiste estado guardado
- multitenant:
  - una empresa no puede leer otra sucursal
- responsive:
  - móvil y desktop
- network:
  - GET catálogo, GET detalle, PUT guardado
