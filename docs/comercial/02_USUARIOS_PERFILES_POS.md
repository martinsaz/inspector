# 02 USUARIOS PERFILES POS

Fecha: 2026-08-17

## Hallazgo principal

Legacy no expone un catálogo formal y limpio de perfiles POS separado del resto. La entidad persona operativa confirmada es `dbo.empleado`, y su elegibilidad comercial se determina por:

- asistencia en `dbo.logdia`
- sucursal
- potencialmente caja si la columna existe en `logdia`
- permiso funcional server-side del endpoint

## Perfiles/conceptos encontrados

| Concepto | Evidencia | Tabla / endpoint | Estado |
|---|---|---|---|
| Empleado | asistencia, venta, devoluciones, corte | `dbo.empleado` | `CONFIRMADO` |
| Vendedor | `VendedorId` en venta, `vendedores-elegibles` | `dbo.empleado`, `/ventas/vendedores-elegibles` | `CONFIRMADO` |
| Cajero | corte, retiros, `fma`, `detnotas`, `notascre`, `detdev` | `dbo.empleado` + caja | `CONFIRMADO` como rol operativo, no como catálogo separado |
| Usuario autenticado | token / claims / `GetUsuarioOrThrow` | sesión | `CONFIRMADO` |
| Operador | CheckApp, no Legacy POS | `dbo.OperadoresPerfil` | `CHECKAPP`, no equivalente Legacy directo |
| Asesor | no localizado con evidencia directa de código | no localizado | `NO CONFIRMADO` |
| Supervisor / Encargado | no localizado como flujo POS central | no localizado | `NO CONFIRMADO` |

## Vendedor

Reglas confirmadas:

- se envía en `VentaCobrarRequest.VendedorId`
- debe existir en la lista de `GetVentaVendedoresElegiblesAsistenciaAsync`
- la lista exige último movimiento abierto de asistencia en la sucursal actual
- si no cumple, la venta falla

Fuentes:

- `sazapi/Endpoints/Program.Endpoints.Ventas.cs`
- `sazapi/Endpoints/Program.Endpoints.Asistencia.cs`

## Cajero

Reglas confirmadas:

- `CajaId` viaja en cotización, pedido, venta y devolución
- el usuario autenticado se resuelve a empleado/cajero con `GetEmpleadoNumeroByUsuarioAsync`
- reportes y retiros de caja leen `cajero` desde tablas de corte

Importante:

- `NO CONFIRMADO` un catálogo independiente de cajas asignadas por cajero
- `CONFIRMADO` sí existe relación operativa caja/cajero en reportes y retiros

## Usuario autenticado vs empleado

- el token resuelve `usuario`
- el endpoint traduce `usuario -> empleado`
- la venta persiste ambos contextos según tabla

Esto implica que el login no basta por sí solo; la operación comercial necesita un amarre con `empleado`.

## Mapping CheckApp propuesto

| CheckApp actual | Reutilizar | Limitación |
|---|---|---|
| `Usuarios` | Parcial | identidad administrativa, no perfil POS listo |
| `Operadores` | Parcial | útil como persona operativa por sucursal, pero no cubre venta/caja/asistencia |
| `Sucursales` | Sí | falta política POS |

## Dictamen

- `Vendedor confirmado`: sí
- `Cajero confirmado`: sí
- `Asesor confirmado`: no
- `Operador equivalente Legacy`: no hay uno 1:1

CheckApp puede reutilizar `Operadores` como base de persona operativa, pero requerirá una capa nueva de `Perfil POS` con al menos:

- vende
- cobra
- devuelve
- abre caja
- cierra caja
- autoriza conversión / cancelación
