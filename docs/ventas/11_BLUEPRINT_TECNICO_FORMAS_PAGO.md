# 11 BLUEPRINT TÉCNICO FORMAS DE PAGO

Fecha: 2026-08-17

## 1. Alcance

Pantalla Legacy auditada:

- `/ajustes-pv/formas-pago`

Pantalla futura CheckApp:

- `/Ajustes/FormasPago`

Estado:

- `CONFIRMADO` la configuración administrativa vive en `dbo.formaspago`.
- `CONFIRMADO` existe un mapa separado de relación a forma fiscal.
- `CONFIRMADO` el catálogo operativo POS no equivale al catálogo administrativo.

## 2. Trazabilidad completa

PANTALLA

- `Raramuri.blzr/Components/Pages/Ajustes/AjustesPvFormasPago.razor`

FRONTEND LEGACY

- `Raramuri.blzr/Services/Ajustes/FormasPagoConfigService.cs`

REQUEST

- `GET configuracion/formas-pago/catalogos/tiendas`
- `GET configuracion/formas-pago/catalogos/formas-fiscales`
- `GET configuracion/formas-pago?tiendaId={tiendaId}`
- `PUT configuracion/formas-pago/{tiendaId}`
- consumo operativo relacionado:
  - `GET ventas/formas-pago?tiendaId={tiendaId}`

ENDPOINT LEGACY

- `sazapi/Endpoints/Program.Endpoints.ConfiguracionFormasPago.cs`
- `sazapi/Endpoints/Program.Endpoints.Ventas.cs`

BACKEND LEGACY

- `GetFormasPagoTiendasCatalogoAsync`
- `GetFormasPagoConfigItemsAsync`
- `ReadFormasPagoConfigRowsAsync`
- `SaveFormasPagoConfigAsync`
- `GetFormasPagoMapAsync`

TABLAS LEGACY

- `dbo.formaspago`
- `dbo.tiendas`
- `NO CONFIRMADA — EVIDENCIA FALTANTE`: tabla exacta del mapa forma->método fiscal, aunque el código la usa mediante `ReadRelacionFormaMetodoMapAsync` y `SaveRelacionFormaMetodoAsync`

REGLA DE NEGOCIO

- configuración administrativa por tienda;
- fallback a tienda `-1`;
- claves reservadas ocultas;
- catálogo operativo POS filtrado;
- facturación bloqueada si falta `FormaFiscal`.

## 3. Catálogo maestro vs configuración vs operación

### A) Catálogo maestro

`CONFIRMADO` parcialmente en `dbo.formaspago`:

- `Numero`
- `Nombre`
- `Clave`
- comportamiento base de tipo/pagaré/tarjeta/MonEx

### B) Configuración por tienda

`CONFIRMADO` también en `dbo.formaspago`, segmentada por columna `tienda`.

### C) Catálogo operativo checkout

`CONFIRMADO`:

- lo entrega `GET /ventas/formas-pago`
- no expone todas las formas configuradas
- filtra por reglas de operación

### D) Catálogo fiscal SAT

`CONFIRMADO`:

- `GET /configuracion/formas-pago/catalogos/formas-fiscales`
- en Legacy sale de un servicio HTTP externo:
  - `SatCatalogosApi:BaseUrl`
  - `.../api/Catalogos/GetTodoFormasPago`

## 4. Tablas Legacy confirmadas

### 4.1 `dbo.formaspago`

Estado:

- `CONFIRMADO` la tabla existe y es central.
- `NO CONFIRMADA — EVIDENCIA FALTANTE` para PK/tipos SQL exactos, porque el repo no trae DDL y el código detecta columnas dinámicamente.

Columnas observadas por código:

| Columna | Uso | Estado |
|---|---|---|
| `numero` | orden/número de forma | `CONFIRMADO` |
| `nombre` | nombre UI | `CONFIRMADO` |
| `clave` | clave funcional | `CONFIRMADO` |
| `status` | activa | `CONFIRMADO` |
| `pagare` | flag pagaré | `CONFIRMADO` |
| `tipo` | flag tipo tarjeta | `CONFIRMADO` |
| `monex` | flag MonEx | `CONFIRMADO` |
| `ticket` | clave externa / texto de ticket | `CONFIRMADO` |
| `tienda` | segmentación por tienda | `CONFIRMADO` |
| `vale` | valor por defecto al insertar directo | `CONFIRMADO` |
| `llave` | GUID cuando existe | `CONFIRMADO` |

Tipos inferidos por código:

- `status`, `pagare`, `tipo`, `monex` se tratan como enteros/bits convertibles.
- `ticket`, `nombre`, `clave`, `tienda` se tratan como texto.
- `numero` se trata como entero.

### 4.2 Tabla del mapa forma fiscal

Estado:

- `CONFIRMADO` existe una persistencia separada consultada por:
  - `ReadRelacionFormaMetodoMapAsync`
  - `SaveRelacionFormaMetodoAsync`
- `NO CONFIRMADA — EVIDENCIA FALTANTE` para nombre exacto de tabla y PK.

Implicación:

- la relación `Clave -> FormaFiscal` no vive únicamente en `formaspago`.

### 4.3 `dbo.tiendas`

`CONFIRMADO`

- usada para catálogo de tiendas
- columnas detectadas dinámicamente:
  - `numero|id`
  - `nombre`
  - opcional `tipo`
  - opcional `borrada`

## 5. Queries y transformaciones confirmadas

### 5.1 GET catálogo tiendas

Fuente:

- `GetFormasPagoTiendasCatalogoAsync`

Comportamiento:

- lee `dbo.tiendas`
- filtra tiendas operativas salvo modo entrenamiento

### 5.2 GET configuración por tienda

Fuente:

- `ReadFormasPagoConfigRowsAsync`

Filtro confirmado:

```sql
WHERE tienda = @TiendaTxt
  AND clave NOT IN ('VD', 'CF', 'X8', 'X9', 'P0', 'P1')
```

### 5.3 Fallback por tienda default

`CONFIRMADO`

Si no hay filas para `tiendaId`, el backend intenta:

- `ReadFormasPagoConfigRowsAsync(..., -1)`

### 5.4 PUT guardado

`CONFIRMADO`

Orden real:

1. normaliza items recibidos
2. ignora claves reservadas
3. intenta `UPDATE` por `tienda + clave`
4. si no existe, intenta clonar fila default de tienda `-1`
5. si no existe default, intenta `INSERT` directo
6. guarda relación `FormaFiscal`

### 5.5 GET operativo POS

`CONFIRMADO`

- `GET /ventas/formas-pago`
- consume `GetFormasPagoMapAsync`
- publica solo formas operativas

## 6. Claves especiales

| Clave | Tabla / fuente | Endpoint | Regla | UI | Checkout | Facturación | Decisión |
|---|---|---|---|---|---|---|---|
| `VD` | `dbo.formaspago` | config | oculta/restringida | no visible | no operativa | no aplica | `ADAPTAR` como reservada |
| `CF` | `dbo.formaspago` | config | oculta/restringida | no visible | no operativa | no aplica | `ADAPTAR` como reservada |
| `VC` | `dbo.formaspago` + docs pago | `ventas/formas-pago` | excluida de cobro directo | admin sí / checkout no | documento, no pago normal | sí como vale | `MIGRAR` como documento, no forma cobrable |
| `NC` | `dbo.formaspago` + docs pago | `ventas/formas-pago` | excluida de cobro directo | admin sí / checkout no | documento, no pago normal | sí como nota | `MIGRAR` como documento, no forma cobrable |
| `P0` | `dbo.formaspago` | config/ventas | reservada/excluida | no visible operativa | no | no | `NO MIGRAR` como forma visible |
| `EF` | `dbo.formaspago` | ventas | forma base / contingencia | visible | sí | sí si tiene forma fiscal | `MIGRAR` |
| `CR` | `dbo.formaspago` | ventas | crédito/pagaré/ticket | visible | sí con regla especial | no libre | `MIGRAR` |

## 7. Tipos, flags y estados

| Campo | Dominio | Confirmación |
|---|---|---|
| `Clave` | maestro | `CONFIRMADO` |
| `Nombre` | maestro | `CONFIRMADO` |
| `ClaveExterna` (`ticket`) | maestro/config | `CONFIRMADO` |
| `Activa` (`status`) | configuración | `CONFIRMADO` |
| `Pagaré` | configuración/operación | `CONFIRMADO` |
| `TipoTarjeta` | configuración/operación | `CONFIRMADO` |
| `MonEx` | configuración/operación | `CONFIRMADO` |
| `FormaFiscal` | relación separada | `CONFIRMADO` |
| `Tienda` | configuración | `CONFIRMADO` |

## 8. Mapeo CheckApp

### 8.1 Reutilización real confirmada

| Dominio | Archivo / endpoint | Tabla | Reutilizable | Limitación |
|---|---|---|---|---|
| Sucursales | `ActivosController` `ObtenerCatalogoSucursales` | `dbo.Sucursales` | Sí | catálogo general |
| Productos/Servicios | `ProductosServiciosController` | `dbo.ProductosServicios*` | Parcial | útil para SAT/productos, no para pagos |
| Razones sociales | `RazonSocialController` | `RazonesSociales` | Sí | fiscal del emisor, no pagos |
| Catálogo fiscal cliente | `ClientesController` `ObtenerRegimenesFiscalesCliente` | `CatalogoClientesRegimenFiscal` | Parcial | no resuelve formas SAT de pago |
| Formas de pago | No localizada | No localizada | No | no existe equivalente confirmado |

### 8.2 Tabla equivalente

- `CONFIRMADO`: no se encontró catálogo CheckApp de formas de pago.
- `CONFIRMADO`: no se encontró relación forma pago / sucursal.
- `CONFIRMADO`: no se encontró catálogo CheckApp de formas fiscales SAT para pagos.

### 8.3 Tablas propuestas

| Tabla propuesta | Propósito |
|---|---|
| `dbo.PvPaymentMethodMaster` | catálogo maestro |
| `dbo.PvPaymentMethodStoreConfig` | activación y flags por sucursal |
| `dbo.PvPaymentMethodFiscalMap` | relación a forma fiscal |

## 9. Blueprint final por pantalla

### FRONTEND

- ruta: `/Ajustes/FormasPago`
- secciones:
  - selector de sucursal
  - búsqueda/filtro
  - grid administrativo
  - panel de resumen
- componentes:
  - grid editable
  - combos de forma fiscal
  - chips de flags
- responsive:
  - grid desktop
  - cards móvil por fila
- acciones:
  - cargar
  - editar
  - guardar
  - recargar

### MVC

- controller actual: `AjustesController`
- acción actual: `FormasPago()`
- proxies previstos:
  - `GetPaymentMethodStores`
  - `GetFiscalForms`
  - `GetPaymentMethodConfig`
  - `SavePaymentMethodConfig`

### API

- `GET /api/pv/payment-methods/master`
- `GET /api/pv/payment-methods/catalogs/sucursales`
- `GET /api/pv/payment-methods/catalogs/fiscal-forms`
- `GET /api/pv/payment-methods/store-config/{sucursalId}`
- `PUT /api/pv/payment-methods/store-config/{sucursalId}`
- `GET /api/pv/payment-methods/operativas?sucursalId={sucursalId}`

### DTO

- `PaymentMethodMasterDto`
- `PaymentMethodStoreConfigDto`
- `PaymentMethodStoreConfigSaveRequest`
- `PaymentMethodOperationalDto`

### SQL

- reutilizadas:
  - `dbo.Sucursales`
- nuevas propuestas:
  - `dbo.PvPaymentMethodMaster`
  - `dbo.PvPaymentMethodStoreConfig`
  - `dbo.PvPaymentMethodFiscalMap`

### REGLAS

- server-side:
  - claves reservadas
  - fallback default
  - catálogo operativo vs administrativo
  - forma fiscal obligatoria al facturar
- frontend-only:
  - filtros, orden, edición inline
- no migrables:
  - dependencia a endpoint externo Legacy de formas SAT si CheckApp centraliza ese catálogo

### QA

- happy path:
  - cargar sucursal, editar flags, guardar
- errores:
  - sucursal inválida
  - forma fiscal faltante
- persistencia:
  - update vs insert from default
- F5:
  - conserva última configuración
- multitenant:
  - aislamiento por empresa+sucursal
- responsive:
  - grid/card
- network:
  - catálogo, config, guardado, operativas
