# 12 BLUEPRINT TÉCNICO DEVOLUCIONES

Fecha: 2026-08-17

## 1. Alcance

Pantalla Legacy auditada:

- `/ventas/devoluciones`

Pantalla futura CheckApp:

- `/Ventas/Devoluciones`

Estado:

- `CONFIRMADO` el lookup del ticket lee `dbo.fma` y `dbo.detnotas`.
- `CONFIRMADO` el POST de devolución escribe `dbo.notascre` y `dbo.detdev`.
- `CONFIRMADO` la política por tienda viene de `dbo.TiendasAjustes`.

## 2. Trazabilidad completa

PANTALLA

- `Raramuri.blzr/Components/Pages/Ventas/VentasDevoluciones.razor`

FRONTEND LEGACY

- `Raramuri.blzr/Services/Ventas/VentasDevolucionesService.cs`

REQUEST

- `GET ventas/devoluciones/motivos`
- `GET ventas/devoluciones/ticket?ticket={ticket}&tiendaId={tiendaId}`
- `POST ventas/devoluciones/crear`

ENDPOINT LEGACY

- `sazapi/Endpoints/Program.Endpoints.Ventas.cs`

BACKEND LEGACY

- carga motivos desde `dbo.motivos`
- carga ticket desde `dbo.fma` y `dbo.detnotas`
- aplica política por tienda
- genera nota de crédito en `dbo.notascre`
- registra detalle de devolución en `dbo.detdev`
- actualiza `dbo.detnotas`
- reintegra inventario con `act_exis25`

## 3. Tablas Legacy confirmadas

| Dominio | Tabla | Estado |
|---|---|---|
| encabezado venta original | `dbo.fma` | `CONFIRMADO` |
| detalle venta original | `dbo.detnotas` | `CONFIRMADO` |
| devoluciones | `dbo.detdev` | `CONFIRMADO` |
| nota de crédito | `dbo.notascre` | `CONFIRMADO` |
| vale de cambio | `dbo.vales` | `CONFIRMADO` |
| motivos | `dbo.motivos` | `CONFIRMADO` |
| fallback precio descuento ticket apartado | `dbo.apartent` | `CONFIRMADO` |
| artículo lookup | `dbo.articulo` | `CONFIRMADO` |
| vendedor | `dbo.empleado` | `CONFIRMADO` |
| cliente | `dbo.socios` | `CONFIRMADO` |
| tienda | `dbo.tiendas` | `CONFIRMADO` |

PK/FK reales:

- `NO CONFIRMADA — EVIDENCIA FALTANTE` para `fma`, `detnotas`, `detdev`, `notascre`, `vales`, `motivos`, porque el repositorio no trae DDL y el código depende de columnas dinámicas.

## 4. GET motivos

### Endpoint

- `GET /ventas/devoluciones/motivos`

### Query confirmada

Tabla:

- `dbo.motivos`

Columnas detectadas:

- `numero|id`
- `nombre|motivo`
- `tipoDefecto|tipodefecto`
- opcional `status`

Regla:

- si `status` existe, excluye `status = 2`

DTO response real:

- `VentaDevolucionMotivoDto`

## 5. GET ticket

### Endpoint

- `GET /ventas/devoluciones/ticket`

### Orden real

1. valida ticket
2. resuelve tienda final
3. lee `dbo.fma`
4. valida cancelación
5. resuelve `DiasParaDevolver`
6. valida expiración
7. lee `dbo.detnotas`
8. complementa con `dbo.apartent`
9. lookup de vendedor en `dbo.empleado`
10. lookup de cliente en `dbo.socios`
11. lookup de tienda en `dbo.tiendas`
12. responde DTO

### Reglas confirmadas

- si `fma.status == 2`:
  - error `Este ticket ya fue cancelado`
- si expiró por política:
  - error con fecha de expiración
- si `detnotas` no tiene `llave`:
  - no puede devolverse
- si un renglón tiene `devuelto` no vacío:
  - `YaDevuelto = true`
- si artículo indica no devolución:
  - `SinDevolucion = true`

### Tablas leídas

- `dbo.fma`
- `dbo.detnotas`
- `dbo.apartent`
- `dbo.articulo`
- `dbo.colores`
- `dbo.acabados`
- `dbo.empleado`
- `dbo.socios`
- `dbo.tiendas`
- `dbo.TiendasAjustes`

## 6. POST crear devolución

### Endpoint

- `POST /ventas/devoluciones/crear`

### Request DTO real

- `VentaDevolucionCrearRequest`
- campos:
  - `Ticket`
  - `TiendaId`
  - `CajaId`
  - `VendedorId`
  - `SocioId`
  - `Items[]`

Item DTO:

- `Id`
- `MotivoId`
- `Observaciones`

### Response DTO real

- `VentaDevolucionCrearResponse`
- campos:
  - `Ok`
  - `Ticket`
  - `NotaCredito`
  - `TiendaId`
  - `CajaId`
  - `Renglones`
  - `Total`
  - `Mensaje`
  - `BilletizaFolioReposicion`

### Validaciones previas confirmadas

- payload requerido
- ticket requerido
- items requeridos
- ids de renglones válidos
- renglones existentes en `detnotas`
- no previamente devueltos
- no bloqueados por `SinDevolucion`

### Flujo persistente confirmado

1. abre transacción SQL
2. relee `fma`
3. relee renglones de `detnotas`
4. genera folio de nota de crédito
5. inserta encabezado en `dbo.notascre`
6. inserta renglones en `dbo.detdev`
7. actualiza `dbo.detnotas`
8. reintegra existencias con `act_exis25`
9. intenta post-proceso Billetiza
10. `COMMIT`

### Inserción en nota de crédito

Tabla:

- `dbo.notascre`

Campos confirmados intentados:

- `tienda`
- `numero`
- `fecha`
- `total`
- `pares`
- `status`
- `empleado`
- `caja`
- `socio`
- `cliente`
- `corte`
- `llave`
- `fechaope`
- `subido`

### Inserción en detalle devolución

Tabla:

- `dbo.detdev`

Campos confirmados intentados:

- `tienda`
- `numero`
- `ticket`
- `barcode`
- `estilo`
- `color`
- `acabado`
- `punto`
- `cantidad`
- `precio`
- `descuen`
- `empleado`
- `caja`
- `fecha`
- `corte`
- `motivo`
- `socio`
- `cliente`
- `observaciones`
- `llave`
- `fechaope`
- `operacion`
- `notacredito`
- `idnotacredito`
- `tipomov`
- `costopromedio`

### Update en detalle original

Tabla:

- `dbo.detnotas`

Updates confirmados:

- `devuelto = GETDATE()`
- `notacredito = @NotaCredito`
- `subido = 0`

## 7. Nota de crédito y vale

### Nota de crédito

- `CONFIRMADO` al devolver con ticket el flujo genera nota de crédito.
- tabla: `dbo.notascre`
- folio: `GetFolioNotaCreditoAsync`

### Vale de cambio

- `CONFIRMADO` existe infraestructura Legacy de `dbo.vales`.
- `NO CONFIRMADA — EVIDENCIA FALTANTE` en este endpoint concreto para generación de vale desde devolución con ticket; el flujo auditado devuelve `NotaCredito`.

### Vigencia

- `DiasValidezNotaCredito` se resuelve con `GetDiasValidezDocumentoAsync(..., "NC")`
- `DiasValidezValeCambio` se resuelve con `GetDiasValidezDocumentoAsync(..., "VC")`

### Documento/PDF

- `CONFIRMADO` el frontend Legacy muestra/consume folio de nota de crédito.
- `NO CONFIRMADA — EVIDENCIA FALTANTE` para el generador exacto de PDF de devolución en este mismo flujo.

## 8. Mapeo CheckApp

### Reutilización real confirmada

| Dominio | Archivo / endpoint | Tabla | Reutilizable | Limitación |
|---|---|---|---|---|
| Clientes | `ClientesController` | `dbo.Clientes`, `dbo.ClientesNotas` | Sí | cliente CheckApp no equivale a `socios` Legacy |
| Sucursales | `ActivosController` `ObtenerCatalogoSucursales` | `dbo.Sucursales` | Sí | catálogo general |
| PDF/documentos | `CotizacionesController` `ExportarCotizacionPdf`, `OrdenesCompraController` `ExportarOrdenCompraPdf` | tablas propias | Parcial | no existe PDF de devolución |
| Devoluciones | No localizada | No localizada | No | no existe vertical equivalente |
| Nota de crédito / vale | No localizado | No localizado | No | no existe subsistema equivalente confirmado |

### Tablas propuestas

| Tabla propuesta | Propósito |
|---|---|
| `dbo.PvReturns` | encabezado devolución |
| `dbo.PvReturnItems` | renglones devueltos |
| `dbo.PvReturnReasons` | catálogo motivos |
| `dbo.PvCreditNotes` | nota de crédito |
| `dbo.PvExchangeVouchers` | vales |

## 9. Blueprint final por pantalla

### FRONTEND

- ruta: `/Ventas/Devoluciones`
- secciones:
  - captura de ticket
  - resultados del ticket
  - lista de renglones
  - panel de motivos
  - resumen y confirmación
- componentes:
  - input scanner/manual
  - grid/card de renglones
  - selector de motivos
- responsive:
  - cards en móvil
  - grid completo desktop
- acciones:
  - buscar ticket
  - seleccionar renglones
  - devolver

### MVC

- controller actual: `VentasController`
- acción actual: `Devoluciones()`
- proxies previstos:
  - `GetReturnReasons`
  - `GetReturnTicket`
  - `CreateReturn`

### API

- `GET /api/pv/returns/catalogs/reasons`
- `GET /api/pv/returns/ticket`
- `POST /api/pv/returns`

### DTO

- `ReturnReasonDto`
- `ReturnTicketLookupResponse`
- `ReturnCreateRequest`
- `ReturnCreateResponse`

### SQL

- reutilizadas:
  - `dbo.Sucursales`
  - eventualmente `dbo.Clientes` si el destino unifica cliente
- nuevas propuestas:
  - `dbo.PvReturns`
  - `dbo.PvReturnItems`
  - `dbo.PvCreditNotes`
  - `dbo.PvExchangeVouchers`
  - `dbo.PvReturnReasons`

### REGLAS

- server-side:
  - vigencia
  - ticket cancelado
  - renglón ya devuelto
  - política por sucursal
- frontend-only:
  - selección visual y mensajes
- no migrables:
  - dependencias físicas a `detnotas` y `fma`

### QA

- happy path:
  - ticket vigente, renglón válido, nota generada
- errores:
  - ticket no encontrado
  - ticket cancelado
  - ticket expirado
  - motivo faltante
- persistencia:
  - encabezado + detalle + documento
- F5:
  - no duplica devolución
- multitenant:
  - sucursal/empresa aisladas
- responsive:
  - móvil y desktop
- network:
  - motivos, ticket, crear devolución
