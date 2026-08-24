# 08 VENTAS COBRAR TRANSACCION

Fecha: 2026-08-17

## Endpoint central

- `POST /ventas/cobrar`

Fuente:

- `sazapi/Endpoints/Program.Endpoints.Ventas.cs`

## Request real

`VentaCobrarRequest`:

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

## Flujo confirmado

`REQUEST`
-> validación inicial
-> tenant
-> tienda/caja
-> asistencia
-> vendedor
-> cliente
-> cálculo total
-> formas de pago
-> documentos
-> crédito
-> ticket
-> `detnotas`
-> `act_exis25`
-> `cambios/cambiosdesc`
-> `fma`
-> monedero
-> crédito
-> NC/vale usados
-> pedido actualizado
-> vale nuevo si aplica
-> `COMMIT`

## Validaciones críticas

- payload requerido
- items requeridos
- pagos o documentos requeridos
- `VendedorId` requerido
- permiso `Vender/Guardar`
- vendedor elegible del día en sucursal actual
- cliente real para crédito/monedero
- documento vigente para `NC/VC`
- monto pagado suficiente
- sin sobrante sin efectivo/documento

## Tablas principales escritas

- `dbo.detnotas`
- `dbo.fma`
- `dbo.cambios`
- `dbo.cambiosdesc`
- `dbo.creditos`
- `dbo.monedero`
- `dbo.notascre`
- `dbo.vales`
- `dbo.detorder`
- `dbo.pedidos_clientes`

## Tablas principales leídas

- `dbo.formaspago`
- `dbo.creditos`
- `dbo.notascre`
- `dbo.vales`
- `dbo.socios`
- `dbo.empleado`
- `dbo.articulo`
- `dbo.existen`

## Idempotencia

`CONFIRMADA` por `IdempotencyKey`.

## Ticket

- folio con `GetFolioTicketAsync`
- QR con `BuildVentaTicketQrPayload`

## Resultado funcional

- venta persistida
- inventario descontado
- documentos financieros marcados
- pedido surtido si aplica
- nuevo vale generado si hay sobrante documental

## Dictamen

`POST /ventas/cobrar` es la verdadera transacción núcleo del POS Legacy. Cualquier migración a CheckApp debe tratarlos como servicio transaccional propio, no como lógica de MVC o JavaScript.
