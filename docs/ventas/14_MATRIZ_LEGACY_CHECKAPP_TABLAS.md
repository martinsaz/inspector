# 14 MATRIZ LEGACY CHECKAPP TABLAS

Fecha: 2026-08-17

| Dominio | Tabla Legacy | Uso | Lectura/Escritura | Pantalla | Tabla CheckApp existente | Reutilizar | Nueva propuesta | Decisión |
|---|---|---|---|---|---|---|---|---|
| Ajustes PV | `dbo.TiendasAjustes` | políticas por tienda | L/E | Ajustes PV, Devoluciones, Venta | No localizada | No | `dbo.PvStoreSettings` | Nueva |
| Tiendas Legacy | `dbo.tiendas` | catálogo sucursales Legacy | L | Ajustes PV, Formas Pago, Devoluciones, Venta | `dbo.Sucursales` | Sí | No | Reutilizar catálogo CheckApp |
| Formas pago admin | `dbo.formaspago` | catálogo/config por tienda | L/E | Formas Pago, Venta | No localizada | No | `dbo.PvPaymentMethodMaster`, `dbo.PvPaymentMethodStoreConfig` | Nueva |
| Relación forma fiscal | `NO CONFIRMADA — EVIDENCIA FALTANTE` | map forma -> SAT | L/E | Formas Pago, Venta | No localizada | No | `dbo.PvPaymentMethodFiscalMap` | Nueva |
| Catálogo SAT pago | servicio externo SAT | formas fiscales | L | Formas Pago, Venta | No localizada | No | subsistema fiscal compartido | Nuevo compartido |
| Motivos devolución | `dbo.motivos` | catálogo motivos | L | Devoluciones | No localizada | No | `dbo.PvReturnReasons` | Nueva |
| Venta encabezado | `dbo.fma` | encabezado ticket | L/E | Devoluciones, Venta | No localizada | No | `dbo.PvSales` | Nueva |
| Venta detalle | `dbo.detnotas` | renglones venta | L/E | Devoluciones, Venta | No localizada | No | `dbo.PvSaleItems` | Nueva |
| Devolución detalle | `dbo.detdev` | renglones devueltos | E/L | Devoluciones | No localizada | No | `dbo.PvReturnItems` | Nueva |
| Nota crédito | `dbo.notascre` | documento devolución / documento pago | L/E | Devoluciones, Venta | No localizada | No | `dbo.PvCreditNotes` | Nueva |
| Vale cambio | `dbo.vales` | documento sobrante / documento pago | L/E | Devoluciones, Venta | No localizada | No | `dbo.PvExchangeVouchers` | Nueva |
| Ticket apartado fallback | `dbo.apartent` | precio/descuento fallback | L | Devoluciones | No localizada | No | No aplica | No migrar directo |
| Artículo | `dbo.articulo` | producto legacy | L | Devoluciones, Venta | `dbo.ProductosServicios` | Parcial | adaptador en API | Adaptar |
| Colores | `dbo.colores` | lookup descripción | L | Devoluciones | No localizada | No | no requerida como tabla nueva aprobada | No migrar literal |
| Acabados | `dbo.acabados` | lookup descripción | L | Devoluciones | No localizada | No | no requerida como tabla nueva aprobada | No migrar literal |
| Cliente legacy | `dbo.socios` | cliente POS | L | Devoluciones, Venta | `dbo.Clientes` | Sí parcial | adaptador / convergencia | Adaptar |
| Vendedor legacy | `dbo.empleado` | vendedor elegible | L | Devoluciones, Venta | Operadores/Usuarios | Parcial | `dbo.PvRegisters` / mapping vendedor | Adaptar |
| Crédito legacy | `dbo.creditos` | venta a crédito | L/E | Venta | No localizada | No | `dbo.PvCreditLedgers` | Nueva |
| Monedero | `dbo.monedero` | saldo / movimientos | L/E | Venta | No localizado | No | fuera de primera etapa o subsistema compartido | Nueva compartida |
| Cambios precio | `dbo.cambios` | auditoría ajuste precio | E | Venta | No localizado | No | auditoría venta destino | Nueva |
| Cambios descuento | `dbo.cambiosdesc` | auditoría ajuste descuento | E | Venta | No localizado | No | auditoría venta destino | Nueva |
| Pedido cliente cabecera | `dbo.pedidos_clientes` | relación con venta/pedido | L/E | Venta | No localizada | No | fuera de este bloque o compartida | Adaptar diferido |
| Pedido cliente detalle | `dbo.pedidos_clientes_det` | detalle pedido | L/E | Venta | No localizada | No | fuera de este bloque o compartida | Adaptar diferido |
| Pedido cliente pagos | `dbo.pedidos_clientes_pago` | pagos pedido | L/E | Venta | No localizada | No | fuera de este bloque o compartida | Adaptar diferido |
| Pedido cliente docs | `dbo.pedidos_clientes_doc` | docs pedido | L/E | Venta | No localizada | No | fuera de este bloque o compartida | Adaptar diferido |
| Legacy order refs | `dbo.detorder` | marcar surtido | L/E | Venta | No localizada | No | fuera de primera implementación | Diferir |
| SAT régimen cliente | `CatalogoClientesRegimenFiscal` | régimen fiscal | L | Venta / clientes / razones sociales | `CatalogoClientesRegimenFiscal` | Sí | No | Reutilizar |
| Razón social emisor | `RazonesSociales` CheckApp | RFC/emisor/regimen | L/E | Venta futura facturable | `RazonesSociales` | Sí | No | Reutilizar |
| Clientes CheckApp | `dbo.Clientes` | cliente destino | L/E | Venta futura / reutilización | `dbo.Clientes` | Sí | No | Reutilizar/adaptar |
| Notas cliente CheckApp | `dbo.ClientesNotas` | notas CRM | L/E | no core POS | `dbo.ClientesNotas` | No directo | No | No usar para POS |
| Sucursales CheckApp | `dbo.Sucursales` | catálogo sucursal | L | todas | `dbo.Sucursales` | Sí | No | Reutilizar |
| Productos y servicios | `dbo.ProductosServicios` | catálogo destino | L/E | Venta futura | `dbo.ProductosServicios` | Sí parcial | No | Adaptar |
| Multimedia / docs | `dbo.ActivosMultimedia` | documentos activos | L/E | no core POS | `dbo.ActivosMultimedia` | No | No | No aplica |
| PDFs cotización | tablas propias cotizaciones | export documental | L/E | documentos futuros | tablas de cotizaciones | Parcial | servicio PDF compartido | Adaptar |
