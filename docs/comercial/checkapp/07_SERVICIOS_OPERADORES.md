# Servicios Operadores

## Modulo actual auditado

Evidencia principal:

- `checklist/Controllers/Operadores/OperadoresController.cs`
- `checklist/wwwroot/js/Operadores/Operadores.js`
- `checklistWs/Controllers/Operadores/OperadoresController.cs`
- `checklistWs/Models/Operadores/OperadorPerfilModels.cs`

## Modelo actual confirmado

- Tabla base: `dbo.Operadores`
- Relacion sucursal multiple: `dbo.OperadoresSucursales`
- Existe referencia a identidad / usuario mediante `idFirebase`
- El acceso operativo valida operador activo y al menos una sucursal activa

## Respuestas obligatorias

1. Operador asociado a usuario: `SI`, indirectamente por identidad y `idFirebase`.
2. Operador pertenece a sucursal: `SI`.
3. Puede pertenecer a varias: `SI`.
4. Disponibilidad: `NO CONFIRMADA`.
5. Asignaciones operativas reutilizables: `NO LOCALIZADAS` para trabajo comercial.
6. Ejecucion actual checklist: redireccion a `ContestarLista/RecoleccionesBL26`.
7. Tabla Operador -> trabajo: `NO LOCALIZADA`.
8. Reutilizable para `PedidoServicio`: `SI`, como base de persona operativa.
9. Un servicio puede requerir varios operadores: conceptualmente `SI`, no modelado hoy.

## No confundir

- `Operador` no es `Vendedor`.
- `Operador` no es `Cajero`.
- `Operador` es persona operativa de ejecucion en campo.

## Propuesta conceptual

`Pedido -> PartidaServicio -> AsignacionOperador -> Ejecucion -> Checklist / Evidencia`

## Recomendacion

- Reutilizar `Operadores` como maestro operativo.
- Crear despues una entidad de asignacion por partida de servicio.
- Permitir uno o varios operadores por servicio desde modelo, aunque la UI inicial empiece con uno.
