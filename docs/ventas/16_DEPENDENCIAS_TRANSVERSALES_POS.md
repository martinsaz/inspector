# 16 DEPENDENCIAS TRANSVERSALES POS

Fecha: 2026-08-17

## 1. Ajustes PV → Devoluciones → Nota / vale

### Cadena confirmada

`Ajustes PV`
→ `dbo.TiendasAjustes.DiasParaDevolver`
→ `GET /ventas/devoluciones/ticket`
→ expiración ticket
→ `POST /ventas/devoluciones/crear`
→ `dbo.notascre`
→ consumo posterior como documento de pago

### Cadena de vigencia documento

`Ajustes PV`
→ `DiasValidezNotaCredito`
→ `GetDiasValidezDocumentoAsync(..., "NC")`
→ vigencia `notascre`

`Ajustes PV`
→ `DiasValidezValeCambio`
→ `GetDiasValidezDocumentoAsync(..., "VC")`
→ vigencia `vales`

## 2. Formas de pago → Checkout → Facturación

### Cadena confirmada

`configuracion/formas-pago`
→ `dbo.formaspago`
→ mapa `FormaFiscal`
→ `GET /ventas/formas-pago`
→ checkout
→ validación de facturación

### Reglas confirmadas

- catálogo administrativo no equivale a catálogo operativo;
- `VC`, `NC`, `P0`, `VD`, `CF` no deben aparecer como cobrables normales;
- una venta facturable requiere `FormaFiscal` por cada forma usada.

## 3. Clientes → Venta → Facturación

### Cadena confirmada

`ClientesService.BuscarAsync`
→ selección cliente
→ `SocioId`
→ validación crédito / monedero / club / cliente fiel
→ datos fiscales del cliente
→ facturación

### Dependencias

- cliente real para crédito;
- RFC, CP fiscal, régimen fiscal y uso CFDI para facturar;
- `Público general` permitido para venta no facturable.

## 4. Productos → Venta → SAT → Inventario

### Cadena confirmada

`ResolverProducto`
→ barcode/talla/precio/descuento
→ carrito
→ `/productos/claves-sat/grid`
→ validación SAT
→ `POST /ventas/cobrar`
→ `detnotas`
→ `act_exis25`

### Reglas

- si producto no tiene relación SAT suficiente, no debe facturarse;
- cada renglón vendido impacta inventario;
- devolución reintegra inventario.

## 5. Sucursal → Ajustes → Formas Pago → Venta → Devolución

### Cadena confirmada

`Sucursal`
→ `Ajustes PV`
→ política por tienda

`Sucursal`
→ `Formas de pago`
→ catálogo operativo por tienda

`Sucursal`
→ `Venta`
→ ticket / folio / formas / vendedor elegible

`Sucursal`
→ `Devolución`
→ expiración / documento / inventario

### Implicación CheckApp

- la sucursal no puede ser un dato decorativo;
- debe ser llave funcional en configuración y operación.

## 6. Caja → Venta → Ticket

### Cadena confirmada

`CajaId`
→ request de cobro
→ folio ticket
→ `fma.caja`
→ `detnotas.caja`
→ `notascre.caja`
→ `detdev.caja`

### Estado CheckApp

- `CONFIRMADO` no existe equivalente funcional auditado para caja POS.
- decisión:
  - dependencia nueva para etapa 04

## 7. Vendedor → Venta

### Cadena confirmada

`GET /ventas/vendedores-elegibles`
→ asistencia del día
→ `VendedorId`
→ validación pre-cobro
→ persistencia en venta

### Implicación

- no basta un usuario autenticado;
- debe existir concepto operativo de vendedor POS elegible.

## 8. Reutilización real CheckApp

| Dominio | Archivo | Tabla | Endpoint | Reutilizable | Limitación |
|---|---|---|---|---|---|
| Clientes | `checklistWs/Controllers/Clientes/ClientesController.cs` | `dbo.Clientes`, `dbo.ClientesNotas` | `ObtenerClientes`, `ObtenerCliente`, `GuardarCliente`, `ObtenerNotasCliente`, `GuardarNotaCliente` | Sí | no equivale 1:1 a `socios` |
| Productos y Servicios | `checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs` | `dbo.ProductosServicios`, `dbo.ProductosServiciosExistencias`, catálogos relacionados | `ObtenerProductosServicios` y derivados | Sí parcial | no sustituye barcode+talla Legacy directamente |
| Sucursales | `checklistWs/Controllers/Activos/ActivosController.cs` | `dbo.Sucursales` | `ObtenerCatalogoSucursales` | Sí | catálogo general, no POS |
| Razones sociales | `checklistWs/Controllers/RazonSocial/RazonSocialController.cs` | `RazonesSociales` | `ObtenerRazonesSociales`, `ObtenerRazonesSocialesCompleta` | Sí | fiscal del emisor, no POS completo |
| Usuarios | modelos/claims existentes | Firebase + sesión | varios | Sí parcial | no resuelve vendedor POS |
| Operadores | `Models/Operadores/OperadorPerfilModels.cs` y vertical operadores | tablas de operadores | varios | Sí parcial | no resuelve caja/vendedor POS |
| Correo saliente | documentación existente | subsistema propio | no aplica aquí | No directo | fuera de POS |
| PDF/documentos | `CotizacionesController`, `OrdenesCompraController`, `ActivosController` | tablas de cotizaciones/OC/multimedia | export PDF/documentos | Parcial | no existe ticket/NC/vale POS |
| Catálogos SAT forma pago | no localizado | no localizado | no localizado | No | nuevo compartido |
| Catálogos SAT producto/unidad | no localizado | no localizado | no localizado | No | nuevo compartido |
| Venta | no localizado | no localizado | no localizado | No | vertical nuevo |
| Caja | no localizada | no localizada | no localizado | No | dependencia nueva |

## 9. Dictamen técnico

### Confirmado

- `Ajustes PV` es dependencia real de `Devoluciones`.
- `Formas de pago` es dependencia real de `Nueva venta`.
- `Clientes`, `ProductosServicios`, `Sucursales` y `RazonesSociales` sí aportan reutilización real.

### No confirmado

- tabla exacta del mapa `FormaFiscal` en Legacy;
- catálogos SAT de pago/producto ya existentes en CheckApp;
- entidad caja equivalente en CheckApp;
- entidad vendedor POS equivalente en CheckApp.

Marcado obligatorio para implementación:

- `DEPENDENCIA NUEVA PARA ETAPA 04`:
  - caja
  - vendedor POS si operadores/usuarios no cubren el caso
