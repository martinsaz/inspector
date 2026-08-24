# 17 GAP CHECKAPP COMERCIAL

Fecha: 2026-08-17

## Reutilizar

- `Clientes`
- `ProductosServicios`
- `Sucursales`
- `RazonesSociales`
- `Cotizaciones`
- `Operadores`
- `Correo saliente`
- patrones PDF/documentales

## Adaptar

- `Cotizaciones` para incluir estado/flujo comercial más completo
- `ProductosServicios` como base de partida comercial
- `Operadores` como persona operativa
- `Clientes` para converger con cliente POS

## Nuevo

- pedido comercial
- venta POS
- checkout/cobro
- asistencia POS
- caja POS
- documentos comerciales `NC/vale`
- formas de pago operativas y fiscales

## No migrar literal

- `orders` / `detorder` como esquema destino final
- `existen` como tabla final literal
- tallas/curvas heredadas como obligación comercial CheckApp

## Existencia actual en CheckApp

| Dominio | Existe | Comentario |
|---|---|---|
| Pedido CheckApp | No | no localizado |
| Venta CheckApp | No | solo placeholders MVC |
| Caja CheckApp | No | no localizada |
| Asistencia CheckApp | No | no localizada |
| Inventario CheckApp | Sí parcial | `ProductosServiciosExistencias` |

## Dictamen

El gap comercial de CheckApp no está en catálogos base sino en operación transaccional. La estrategia correcta es reutilizar identidad, clientes, sucursales, productos y cotizaciones, y construir el corazón POS como vertical nuevo.
