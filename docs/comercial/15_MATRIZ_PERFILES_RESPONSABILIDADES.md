# 15 MATRIZ PERFILES RESPONSABILIDADES

Fecha: 2026-08-17

## Legacy confirmado

| Perfil | Entrada | Cotizar | Autorizar | Convertir Pedido | Vender | Cobrar | Devolver | Abrir Caja | Cerrar Caja |
|---|---|---|---|---|---|---|---|---|---|
| Empleado / Vendedor | Sí | Sí | `NO CONFIRMADO` | `NO CONFIRMADO` | Sí | Sí | Sí | `NO CONFIRMADO` | `NO CONFIRMADO` |
| Cajero | Sí | `NO CONFIRMADO` | `NO CONFIRMADO` | `NO CONFIRMADO` | Sí posible | Sí | Sí | `NO CONFIRMADO` | `NO CONFIRMADO` |
| Usuario autenticado | indirecto | indirecto | indirecto | indirecto | indirecto | indirecto | indirecto | indirecto | indirecto |

## Reglas confirmadas

- sin asistencia del día no hay venta elegible
- vendedor debe pertenecer a la sucursal actual
- caja participa en venta, pedido, devolución y corte

## Mapping CheckApp propuesto

| CheckApp | Papel sugerido | Limitación |
|---|---|---|
| `Usuario` | identidad base | no es perfil POS |
| `Operador` | persona operativa reutilizable | no cubre comercial todavía |
| `Perfil POS` | nuevo | debe definir permisos comerciales |
| `Rol/Permiso` | adaptar | no crear aún en esta auditoría |

## Dictamen

CheckApp necesita un `Perfil POS` encima de `Usuarios/Operadores`, no en sustitución de ellos.
