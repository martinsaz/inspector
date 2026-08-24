# 04 CAJA APERTURA CIERRE

Fecha: 2026-08-17

## Hallazgo principal

Legacy sí usa `CajaId` intensivamente, pero la evidencia disponible en esta auditoría describe mejor:

- contexto de caja en venta/devolución/pedido
- corte de caja
- retiros
- gastos
- reportes por caja

No quedó confirmado en esta corrida un flujo único y limpio de `apertura de caja` separado como expediente formal.

## Evidencia confirmada

Frontend / servicios:

- `Raramuri.blzr/Services/Caja/CajaCorteService.cs`

Backend / endpoints:

- `/reportes/corte-caja/resumen`
- `/reportes/corte-caja/corte-corto`
- `/reportes/corte-caja/tickets`
- `/reportes/corte-caja/retiros-efectivo`
- `/api/estadisticas/corte-caja/*`

Tablas confirmadas en corte:

- `dbo.fma`
- `dbo.detnotas`
- `dbo.detdev`
- `dbo.notascre`
- `dbo.liquidaciones`
- `dbo.liquidacionesDetalle`
- `dbo.detgasto`
- `dbo.gastos`
- `dbo.empleado`

## Participación de caja en procesos

Venta:

- `fma.caja`
- `detnotas.caja`

Devolución:

- `detdev.caja`
- `notascre.caja`

Pedido:

- `pedidos_clientes.caja_id`
- `orders.caja`
- `detorder.caja`

Asistencia:

- `logdia.caja` si existe

## Respuestas obligatorias

1. `quién abre caja`
`NO CONFIRMADO — EVIDENCIA FALTANTE` en esta corrida.

2. `quién la usa`
Vendedor/cajero/empleado operativo según venta, devoluciones y corte.

3. `si varios venden sobre misma caja`
`NO CONFIRMADO` como regla explícita, pero el modelo lo permite técnicamente por `tienda + caja`.

4. `si caja está ligada a cajero`
Sí, por reportes y retiros.

5. `si caja está ligada a sucursal`
Sí.

6. `si requiere asistencia activa`
Para vendedor sí; para cajero como regla general de caja `NO CONFIRMADO`.

7. `cómo se cierra`
Existe corte/resumen/retiros/gastos, pero no se cerró en esta corrida un endpoint único de cierre.

8. `cómo se hace corte`
Por endpoints de `corte-caja` y agregados estadísticos por tienda/caja/fecha.

9. `qué pasa con ventas pendientes`
`NO CONFIRMADO — EVIDENCIA FALTANTE`.

10. `cómo participa en FMA / DETNOTAS`
Caja queda persistida como parte del ticket y del detalle.

## Dictamen CheckApp

- `Caja CheckApp existe`: no localizada como módulo comercial
- `Caja POS` debe tratarse como dependencia nueva
- no basta con un entero `CajaId`; hacen falta reglas de sesión operativa y de corte
