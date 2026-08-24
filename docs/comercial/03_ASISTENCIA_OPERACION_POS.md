# 03 ASISTENCIA OPERACION POS

Fecha: 2026-08-17

## Proceso trazado

`Entrada`
-> `dbo.logdia`
-> asistencia activa del día
-> vendedor elegible
-> venta/cobro
-> `Salida`

## Endpoints confirmados

- `GET /asistencia/empleados`
- `GET /asistencia/movimientos`
- `POST /asistencia/registrar`
- `GET /ventas/vendedores-elegibles`
- `GET /ventas/vendedores-elegibles/lookup-nfc`

## Tabla principal

- `dbo.logdia`

Columnas confirmadas por uso dinámico:

- `tipo`
- `fecha`
- `tienda`
- `caja`
- `nombre`
- `idempleado` o `empleado`
- `hora`
- `origen`
- `llave`
- `autoriza`
- `asistencia`

PK real:

- `NO CONFIRMADA — EVIDENCIA FALTANTE`

## Regla de registro

`POST /asistencia/registrar`:

- valida `dbo.empleado`
- valida `dbo.logdia`
- obtiene tienda y tolerancias desde `dbo.tiendas`
- detecta último movimiento del día del empleado
- si hay entrada abierta en otra sucursal, bloquea
- decide automáticamente `SALIDA`, `ENTRADA`, `ENTRADA R` o `ENTRADA A`
- inserta nuevo registro en `dbo.logdia`

## Respuestas obligatorias

1. `¿Quién debe registrar entrada?`
Empleado/persona operativa identificada contra `dbo.empleado`.

2. `¿Quién debe registrar salida?`
La misma persona operativa vía `POST /asistencia/registrar`; el endpoint cambia a `SALIDA` según el último movimiento.

3. `¿Puede vender sin entrada?`
No, si no aparece como vendedor elegible del día.

4. `¿Puede cobrar sin entrada?`
No, el `POST /ventas/cobrar` valida vendedor elegible.

5. `¿Puede operar después de salida?`
No como vendedor elegible, salvo que registre una nueva entrada y quede abierta.

6. `¿Puede cambiar de sucursal?`
No con entrada abierta en otra sucursal; el endpoint bloquea hasta registrar salida ahí.

7. `¿Qué pasa si no tiene asistencia del día?`
No entra a `vendedores-elegibles`.

8. `¿Qué usa ventas/vendedores-elegibles?`
`GetVentaVendedoresElegiblesAsistenciaAsync`.

9. `¿Qué perfil se considera vendedor elegible?`
Empleado activo con último movimiento global `ENTRADA` abierta en la sucursal actual.

10. `¿Qué perfil se considera cajero elegible?`
`NO CONFIRMADO — EVIDENCIA FALTANTE` como lista formal separada.

11. `¿Asistencia es por sucursal?`
Sí.

12. `¿Asistencia está relacionada con caja?`
Sí, cuando `logdia.caja` existe y se usa como filtro adicional.

## CheckApp actual

No se localizó en CheckApp un módulo equivalente ya operativo de asistencia POS:

- `Caja CheckApp`: no
- `Asistencia CheckApp`: no

## Decisión documental

Para comercial CheckApp, asistencia es una dependencia nueva de etapa comercial y no un detalle opcional de UI.
