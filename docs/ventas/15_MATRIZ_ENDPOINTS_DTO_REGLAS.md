# 15 MATRIZ ENDPOINTS DTO REGLAS

Fecha: 2026-08-17

| Pantalla | Endpoint Legacy | Método | DTO Request | DTO Response | Regla | Tablas | Endpoint CheckApp futuro | DTO futuro |
|---|---|---|---|---|---|---|---|---|
| Ajustes PV | `/configuracion/tiendas-ajustes/tiendas` | GET | none | `{ items, total }` | catálogo de sucursales operativas | `dbo.tiendas` | `/api/pv/store-settings/catalogs/sucursales` | `SucursalComboDto[]` |
| Ajustes PV | `/configuracion/tiendas-ajustes?tienda={tienda}` | GET | query `tienda` | `{ item }` | si no existe fila devuelve null/default, no error | `dbo.TiendasAjustes`, `dbo.tiendas` | `/api/pv/store-settings/{sucursalId}` | `PvStoreSettingsDto` |
| Ajustes PV | `/configuracion/tiendas-ajustes/{tienda}` | PUT | `TiendasAjustesGuardarRequest` | `TiendasAjustesGuardarResponse` | valida rangos, modos y longitudes | `dbo.TiendasAjustes` | `/api/pv/store-settings/{sucursalId}` | `PvStoreSettingsSaveRequest/Response` |
| Formas Pago | `/configuracion/formas-pago/catalogos/tiendas` | GET | none | `FormasPagoCatalogosResponse` | sugiere tienda origen | `dbo.tiendas` | `/api/pv/payment-methods/catalogs/sucursales` | `SucursalComboDto[]` |
| Formas Pago | `/configuracion/formas-pago/catalogos/formas-fiscales` | GET | none | `CatalogoClaveDto[]` | catálogo SAT externo | servicio SAT externo | `/api/pv/payment-methods/catalogs/fiscal-forms` | `FiscalPaymentFormDto[]` |
| Formas Pago | `/configuracion/formas-pago?tiendaId={tiendaId}` | GET | query `tiendaId` | `FormasPagoConfigResponse` | fallback a tienda `-1`, oculta claves reservadas | `dbo.formaspago`, mapa forma fiscal | `/api/pv/payment-methods/store-config/{sucursalId}` | `PaymentMethodStoreConfigDto[]` |
| Formas Pago | `/configuracion/formas-pago/{tiendaId}` | PUT | `FormasPagoConfigGuardarRequest` | `FormasPagoConfigGuardarResponse` | update / clone default / insert directo | `dbo.formaspago`, mapa forma fiscal | `/api/pv/payment-methods/store-config/{sucursalId}` | `PaymentMethodStoreConfigSaveRequest/Response` |
| Venta | `/ventas/formas-pago` | GET | query `tiendaId` opcional | lista operativa | filtra catálogo administrativo | `dbo.formaspago`, mapa forma fiscal | `/api/pv/payment-methods/operativas?sucursalId=` | `PaymentMethodOperationalDto[]` |
| Devoluciones | `/ventas/devoluciones/motivos` | GET | none | `VentaDevolucionMotivoDto[]` | excluye inactivos por status | `dbo.motivos` | `/api/pv/returns/catalogs/reasons` | `ReturnReasonDto[]` |
| Devoluciones | `/ventas/devoluciones/ticket` | GET | query `ticket`, `tiendaId` | `VentaDevolucionTicketResponse` | ticket vigente, no cancelado, política por tienda | `dbo.fma`, `dbo.detnotas`, `dbo.apartent`, `dbo.TiendasAjustes`, `dbo.articulo`, `dbo.empleado`, `dbo.socios` | `/api/pv/returns/ticket` | `ReturnTicketLookupResponse` |
| Devoluciones | `/ventas/devoluciones/crear` | POST | `VentaDevolucionCrearRequest` | `VentaDevolucionCrearResponse` | no duplicidad, genera nota y reintegra inventario | `dbo.notascre`, `dbo.detdev`, `dbo.detnotas` | `/api/pv/returns` | `ReturnCreateRequest/Response` |
| Venta | `/clientes/info/buscar` | GET | query `q`, `take` | array clientes | búsqueda cliente | Legacy clientes | `/api/pv/sales/clientes/buscar` | `PosClienteLookupDto[]` |
| Venta | `/ventas/sku/resolver` | POST | resolver producto | producto resuelto | barcode/lista/talla | artículo legacy | `/api/pv/sales/productos/resolver` | `PosProductoResolucionDto` |
| Venta | `/ventas/barcode/{barcode}/tallas` | GET | barcode, lista, tiendaId | tallas | selección por talla | existencias/artículo | `/api/pv/sales/productos/{barcode}/tallas` | `PosProductoTallaDto[]` |
| Venta | `/ventas/vendedores-elegibles` | GET | tiendaId, cajaId | vendedores | asistencia registrada hoy | `dbo.empleado` + asistencia | `/api/pv/sales/vendedores-elegibles` | `PosVendedorDto[]` |
| Venta | `/configuracion/formas-pago?tiendaId=` | GET | query | `FormasPagoConfigResponse` | forma fiscal por clave | `dbo.formaspago` | `/api/pv/sales/formas-pago-config` | `PaymentMethodStoreConfigDto[]` |
| Venta | `/productos/claves-sat/grid` | GET | barcode | grid SAT | producto debe tener relación SAT | tablas SAT no confirmadas por nombre | `/api/pv/sales/productos/{barcode}/sat` | `PosProductoSatDto` |
| Venta | `/ventas/credito/validar` | GET | socioId, monto | `VentaCreditoValidacionResponse` | cliente real y saldo válido | `dbo.creditos` | `/api/pv/sales/credito/validar` | `PosCreditoValidacionDto` |
| Venta | `/ventas/documentos-pago/validar` | GET | tipo, folio, tiendaId | `VentaDocumentoPagoValidacionDto` | NC/VC vigentes | `dbo.notascre`, `dbo.vales` | `/api/pv/sales/documentos-pago/validar` | `PosDocumentoPagoValidacionDto` |
| Venta | `/ventas/cobrar` | POST | `VentaCobrarRequest` | `VentaCobrarResponse` | vendedor, pagos, crédito, monedero, SAT, facturación, idempotencia | `dbo.detnotas`, `dbo.fma`, `dbo.formaspago`, `dbo.notascre`, `dbo.vales`, `dbo.creditos`, `dbo.monedero`, `dbo.cambios`, `dbo.cambiosdesc`, `dbo.detorder` | `/api/pv/sales/charge` | `PosSaleRequest/Response` |
