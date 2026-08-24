# 12 NOTAS CREDITO VALES

Fecha: 2026-08-17

## Nota de crédito

Tabla principal:

- `dbo.notascre`

Ciclo confirmado:

`Venta`
-> `Devolución`
-> `notascre`
-> vigencia por `TiendasAjustes`
-> nueva venta
-> aplicación como documento
-> marcado como usado

### Campos confirmados por uso

- `numero`
- `tienda`
- `fecha`
- `total`
- `status`
- `empleado`
- `caja`
- `socio` / `cliente`
- `llave`
- referencias de factura si existen

### Reglas confirmadas

- vigencia depende de `DiasValidezNotaCredito`
- se valida por `GET /ventas/documentos-pago/validar`
- se marca usada en el cobro

Aplicación parcial:

- `NO CONFIRMADA — EVIDENCIA FALTANTE`

Cancelación:

- hay lectura/borrado/reversa técnica de NC en código, pero no quedó cerrada una matriz funcional completa de cancelación

## Vale

Tabla principal:

- `dbo.vales`

Ciclo confirmado:

`Devolución`
-> vale o sobrante documental
-> vigencia por `DiasValidezValeCambio`
-> nueva venta
-> aplicación como documento

### Reglas confirmadas

- se valida por `GET /ventas/documentos-pago/validar`
- puede generarse además por sobrante sin efectivo en `ventas/cobrar`
- si el total pagado excede la venta y no hay efectivo, el sobrante va a vale

Aplicación parcial:

- `NO CONFIRMADA`

## NC/vale como pago

`CONFIRMADO`: sí

## CheckApp

No existen equivalentes comerciales actuales confirmados para:

- nota de crédito POS
- vale POS

## Dictamen

NC y vale no son anexos de postventa. Son documentos vivos del ciclo comercial y deben migrarse como subsistema comercial propio.
