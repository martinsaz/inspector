# LISTAS BL26 - CICLO DE VIDA

## 1. Estados de lista

### En edicion

- `Estado = 1`
- `Status = 1`
- `Activo = 1`

### Cerrada

- `Estado = 2`
- `Status = 1`
- `Activo = 1`

### Eliminada por baja logica

- `Estado = 2`
- `Status = 0`
- `Activo = 1`

## 2. Transiciones permitidas

- Crear -> En edicion.
- En edicion -> Cerrada.
- Cerrada -> En edicion mediante reapertura.
- En edicion o Cerrada -> Eliminada.
- Eliminada -> solo consulta historica.

## 3. Reglas de cierre

Una lista no puede cerrarse si:

- no tiene tareas;
- tiene tareas incompletas.

Una lista cerrada debe conservar:

- informacion general;
- tareas;
- categorias;
- subcategorias;
- configuracion de respuestas.

## 4. Persistencia de preguntas

Toda pregunta nueva en `ListasPreguntas` debe crearse con:

- `Status = 1`.

Las consultas operativas recuperan unicamente preguntas vigentes.

La baja logica de una lista no debe eliminar fisicamente sus preguntas.

## 5. Recolecciones

Las listas ejecutables deben cumplir:

- `Estado = 2`;
- `Status = 1`;
- `Activo = 1`;
- al menos una pregunta vigente.

No modificar Recolecciones en esta tarea.
