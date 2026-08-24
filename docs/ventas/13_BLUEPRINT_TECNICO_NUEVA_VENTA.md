# 13 BLUEPRINT TÉCNICO NUEVA VENTA

Fecha: 2026-08-17

## 1. Alcance

Pantalla Legacy auditada:

- `/ventas/nueva`

Pantalla futura CheckApp:

- `/Ventas/Nueva`

Estado:

- `CONFIRMADO` el flujo Legacy termina en `POST /ventas/cobrar`.
- `CONFIRMADO` el cobro escribe `dbo.detnotas` y `dbo.fma`.
- `CONFIRMADO` interactúa con crédito, monedero, vales, notas de crédito, gift card, Billetiza, SAT y pedidos cliente.

## 2. Trazabilidad completa

PANTALLA

- `Raramuri.blzr/Components/Pages/Ventas/VentasNueva.razor`
- checkout: `PosCheckoutDialog.razor`

FRONTEND LEGACY

- `Raramuri.blzr/Services/Ventas/VentasPosService.cs`
- `Raramuri.blzr/Services/Clientes/ClientesService.cs`

REQUESTS PRINCIPALES

- `GET clientes/info/buscar`
- `POST ventas/sku/resolver`
- `GET ventas/barcode/{barcode}/tallas`
- `GET ventas/vendedores-elegibles`
- `GET ventas/formas-pago`
- `GET configuracion/formas-pago`
- `GET productos/claves-sat/grid`
- `GET ventas/credito/validar`
- `GET ventas/documentos-pago/validar`
- `POST ventas/cobrar`

ENDPOINT LEGACY

- `sazapi/Endpoints/Program.Endpoints.Ventas.cs`
- `sazapi/Endpoints/Program.Endpoints.Productos.cs`

## 3. Request / response reales

### Request DTO real

- `VentaCobrarRequest`

Campos confirmados:

- `TiendaId`
- `CajaId`
- `VendedorId`
- `SocioId`
- `Items`
- `Pagos`
- `Documentos`
- `Observaciones`
- `IdempotencyKey`
- `PedidoRefs`
- `IdFactura`
- `FolioFiscalNumero`
- `FolioFiscal`
- `FolioFactura`
- `Billetiza`

### Response DTO real

- `VentaCobrarResponse`

Campos confirmados:

- `Ok`
- `NumeroTicket`
- `TiendaId`
- `CajaId`
- `Total`
- `TotalPagado`
- `Cambio`
- `NuevoValeMonto`
- `NuevoValeNumero`
- `Renglones`
- `Mensaje`
- `EstadoTicket`
- `CreditoAplicado`
- `GeneroPagareCredito`
- `CodigoTicket`
- `TipoCodigoTicket`
- `LeyendaPostQr`
- `EsClienteMonedero`
- `MonederoGenerado`
- `SaldoMonederoDespues`
- `ClienteFielDescuentoPct`
- `ClienteFielDescuentoMonto`
- `Billetiza`

## 4. Flujo persistente completo

### Orden confirmado

1. valida payload
2. valida permisos
3. resuelve tienda/caja/usuario
4. valida vendedor elegible por asistencia
5. resuelve clasificación de socio
6. aplica descuento cliente fiel si corresponde
7. calcula total venta
8. normaliza pagos
9. valida Billetiza si aplica
10. calcula monedero
11. carga mapa de formas de pago
12. valida pagos
13. valida documentos NC/VC
14. valida gift card
15. valida monedero
16. valida crédito
17. calcula cambio o nuevo vale
18. genera folio ticket
19. inserta `detnotas`
20. descuenta inventario con `act_exis25`
21. inserta ajustes de precio/descuento en `cambios` / `cambiosdesc`
22. aplica consumos gift card
23. inserta `fma`
24. registra Billetiza
25. registra monedero
26. inserta crédito si aplica
27. marca NC/VC usados
28. actualiza pedidos cliente referenciados
29. genera vale si hay sobrante sin efectivo
30. commit

## 5. Tablas Legacy confirmadas

| Dominio | Tabla | Lectura | Escritura | Estado |
|---|---|---|---|---|
| encabezado venta | `dbo.fma` | Sí | Sí | `CONFIRMADO` |
| detalle venta | `dbo.detnotas` | Sí | Sí | `CONFIRMADO` |
| inventario | `act_exis25` / existencias físicas | Sí | Sí | `CONFIRMADO` helper |
| formas de pago | `dbo.formaspago` | Sí | No directo en cobro | `CONFIRMADO` |
| configuración forma fiscal | tabla no nombrada por helper relación | Sí | Sí | `NO CONFIRMADA — EVIDENCIA FALTANTE` |
| crédito | `dbo.creditos` | Sí | Sí | `CONFIRMADO` por flujos de cobro/cancelación |
| cambios de precio | `dbo.cambios` | No | Sí | `CONFIRMADO` |
| cambios de descuento | `dbo.cambiosdesc` | No | Sí | `CONFIRMADO` |
| monedero | `dbo.monedero` | Sí | Sí | `CONFIRMADO` |
| notas de crédito usadas | `dbo.notascre` | Sí | Sí | `CONFIRMADO` |
| vales | `dbo.vales` | Sí | Sí | `CONFIRMADO` |
| producto | `dbo.articulo` | Sí | No directo | `CONFIRMADO` |
| cliente | `dbo.socios` | Sí | No directo | `CONFIRMADO` |
| vendedor | `dbo.empleado` | Sí | No directo | `CONFIRMADO` |
| sucursal | `dbo.tiendas` | Sí | No directo | `CONFIRMADO` |
| pedido cliente cabecera | `dbo.pedidos_clientes` | Sí | Sí | `CONFIRMADO` |
| pedido cliente detalle | `dbo.pedidos_clientes_det` | Sí | Sí | `CONFIRMADO` |
| pedido cliente pagos | `dbo.pedidos_clientes_pago` | Sí | Sí | `CONFIRMADO` |
| pedido cliente docs | `dbo.pedidos_clientes_doc` | Sí | Sí | `CONFIRMADO` |
| legacy pedido relacionado | `dbo.detorder` | Sí | Sí | `CONFIRMADO` |
| SAT producto | tablas vía `/productos/claves-sat/grid` | Sí | No en cobro | `CONFIRMADO` |

PK/FK exactos:

- `NO CONFIRMADA — EVIDENCIA FALTANTE` para la mayoría de tablas Legacy porque el repositorio no contiene DDL.

## 6. Caja

### Legacy

- `CONFIRMADO` `CajaId` forma parte del request y de `fma`.
- columnas observadas:
  - `fma.caja`
  - `detnotas.caja`
  - `detdev.caja`
  - `notascre.caja`

Relaciones:

- tienda + caja + ticket
- caja participa en folio y trazabilidad del ticket

### CheckApp

- `CONFIRMADO` no se encontró entidad funcional de caja en los verticales actuales auditados.
- decisión:
  - `DEPENDENCIA NUEVA PARA ETAPA 04`

## 7. Vendedor

### Legacy

Fuente:

- request `VendedorId`
- `GET /ventas/vendedores-elegibles`
- `GetVentaVendedoresElegiblesAsistenciaAsync`
- tabla `dbo.empleado`

Validación:

- el vendedor debe tener asistencia registrada hoy en la sucursal

### CheckApp

- `CONFIRMADO` existen usuarios y operadores como dominios
- `CONFIRMADO` no existe equivalente directo de vendedor POS auditado para esta etapa
- decisión:
  - reutilizar identidad/operadores solo si se define relación formal con sucursal y operación POS

## 8. Facturación / SAT

### Dependencias confirmadas

| Dominio | Fuente Legacy | Estado |
|---|---|---|
| FormaFiscal | relación de formas de pago | `CONFIRMADO` |
| ClaveProdServ | `/productos/claves-sat/grid` | `CONFIRMADO` |
| ClaveUnidad | `/productos/claves-sat/grid` | `CONFIRMADO` |
| RégimenFiscal | cliente / razones sociales | `CONFIRMADO` |
| RFC | cliente / razones sociales | `CONFIRMADO` |
| CP fiscal | cliente / razones sociales | `CONFIRMADO` |
| UsoCFDI | frontend + catálogos fiscales | `CONFIRMADO` |

### CheckApp existente

| Dominio | Reutilización | Evidencia |
|---|---|---|
| RFC / Régimen del emisor | Sí | `RazonSocialController`, tabla `RazonesSociales`, join a `CatalogoClientesRegimenFiscal` |
| Régimen fiscal de cliente | Sí parcial | `ClientesController`, tabla `Clientes`, catálogo `CatalogoClientesRegimenFiscal` |
| Formas fiscales SAT de pago | No confirmada | no se localizó catálogo existente |
| ClaveProdServ / ClaveUnidad | No confirmada | no se localizó catálogo SAT equivalente en CheckApp |

### Clasificación

- `REUTILIZAR`
  - `RazonesSociales`
  - `Clientes.RegimenFiscal`
- `NUEVO COMPARTIDO`
  - catálogo SAT de formas de pago
  - catálogo SAT de producto/unidad
- `NO PERTENECE SOLO A NUEVA VENTA`
  - catálogos SAT deben ser compartidos con otros módulos fiscales

## 9. Tallas y curvas

`CONFIRMADO` en Legacy:

- endpoint `GET ventas/barcode/{barcode}/tallas`
- participan en selección de producto
- dependen de barcode, talla, tienda y lista

Decisión CheckApp:

- `NO MIGRAR` como subsistema independiente en esta etapa
- solo soportar la resolución necesaria para venta aprobada
- no proponer tablas de tallas/curvas propias en el destino

## 10. Mapeo CheckApp

### Reutilización real confirmada

| Dominio | Archivo / endpoint | Tabla | Reutilizable | Limitación |
|---|---|---|---|---|
| Clientes | `ClientesController` / MVC Clientes | `dbo.Clientes`, `dbo.ClientesNotas` | Sí | modelo distinto a `socios` |
| Productos | `ProductosServiciosController` | `dbo.ProductosServicios*` | Sí parcial | no reemplaza barcode/talla Legacy directamente |
| Sucursales | `ActivosController` `ObtenerCatalogoSucursales` | `dbo.Sucursales` | Sí | catálogo general |
| Razones sociales | `RazonSocialController` | `RazonesSociales` | Sí | emisor fiscal |
| PDF/documentos | cotizaciones / órdenes compra | tablas propias | Parcial | no existe ticket POS |
| Venta POS | no localizado | no localizada | No | no existe vertical |
| Caja POS | no localizada | no localizada | No | dependencia nueva |
| Formas de pago POS | no localizado | no localizada | No | depende de blueprint 11 |

### Tablas propuestas

| Tabla propuesta | Propósito |
|---|---|
| `dbo.PvSales` | encabezado venta |
| `dbo.PvSaleItems` | detalle venta |
| `dbo.PvSalePayments` | pagos |
| `dbo.PvSaleDocuments` | NC/VC aplicados |
| `dbo.PvSaleTickets` | ticket/folio/documento |
| `dbo.PvRegisters` | caja/sesión operativa |
| `dbo.PvCreditLedgers` | crédito POS |

## 11. Blueprint final por pantalla

### FRONTEND

- ruta: `/Ventas/Nueva`
- secciones:
  - contexto tienda/caja
  - cliente
  - captura de producto
  - carrito
  - resumen
  - checkout
- componentes:
  - buscador cliente
  - buscador SKU/barcode
  - grid de carrito
  - drawer/modal de checkout
- responsive:
  - checkout apilado móvil
  - layout 2 columnas desktop
- acciones:
  - agregar producto
  - quitar producto
  - editar pago
  - cobrar

### MVC

- controller actual: `VentasController`
- acción actual: `Nueva()`
- proxies previstos:
  - `SearchClientes`
  - `ResolveProducto`
  - `GetTallas`
  - `GetVendedores`
  - `GetFormasPagoOperativas`
  - `PreviewCheckout`
  - `ChargeSale`

### API

- `GET /api/pv/sales/clientes/buscar`
- `POST /api/pv/sales/productos/resolver`
- `GET /api/pv/sales/productos/{barcode}/tallas`
- `GET /api/pv/sales/vendedores-elegibles`
- `GET /api/pv/sales/formas-pago-operativas`
- `GET /api/pv/sales/documentos-pago/validar`
- `GET /api/pv/sales/credito/validar`
- `POST /api/pv/sales/checkout/preview`
- `POST /api/pv/sales/charge`

### DTO

- `PosSaleRequest`
- `PosSaleResponse`
- `PosSaleItemDto`
- `PosSalePaymentDto`
- `PosSaleDocumentDto`
- `PosCheckoutPreviewResponse`

### SQL

- reutilizadas:
  - `dbo.Clientes`
  - `dbo.ProductosServicios`
  - `dbo.Sucursales`
  - `RazonesSociales`
- nuevas propuestas:
  - `dbo.PvSales`
  - `dbo.PvSaleItems`
  - `dbo.PvSalePayments`
  - `dbo.PvSaleDocuments`
  - `dbo.PvSaleTickets`
  - `dbo.PvRegisters`
  - `dbo.PvCreditLedgers`

### REGLAS

- server-side:
  - pagos
  - crédito
  - vendedor elegible
  - facturación
  - SAT
  - idempotencia
- frontend-only:
  - flujo UI y suma visual
- no migrables:
  - dependencia física a `fma`, `detnotas`, `act_exis25`

### QA

- happy path:
  - cliente general / cliente real / venta completa
- errores:
  - vendedor inválido
  - pago insuficiente
  - crédito inválido
  - forma fiscal faltante
  - SAT faltante
- persistencia:
  - ticket, pagos, documentos, crédito
- F5:
  - no duplica por idempotencia
- multitenant:
  - empresa/sucursal/caja aisladas
- responsive:
  - POS desktop y tablet/móvil
- network:
  - búsqueda cliente, resolver producto, checkout, cobrar
