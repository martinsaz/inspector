# GAP Legacy OC vs CheckApp

## Reglas utiles conceptualmente

- Separar estado de aprobacion y estado de recepcion
- Permitir recepcion parcial
- Registrar trazabilidad de cambios de cantidad/costo
- Mantener folio final del documento separado del identificador tecnico
- Configurar aprobadores por dominio operativo y no hardcodearlos en UI
- Incrementar demanda esperada al crear OC y afectar inventario fisico solo al recibir
- Relacionar OC con procesos origen como OT/backorder sin mezclar el documento principal

## Reglas que no conviene migrar tal cual

- Cabecera repetida en cada fila de `OrdendeCompraPT`
- Asignacion de folio con `MAX(Folio)+1`
- Permisos dominados por frontend
- Workflow de aprobacion sin rechazo, comentarios ni montos
- SQL embebido masivo en controller
- Uso de mismo modulo para consulta y mantenimiento pesado
- Semantica inconsistente de estados entre pantallas

## Preguntas que CheckApp deberia resolver despues

- modelo encabezado/detalle normalizado
- folios concurrentes y seguros
- motor de aprobacion con rechazo y comentario
- permisos server-side
- separacion clara entre OC, recepcion e inventario
- manejo formal de sobrerecepcion

## Decision conceptual preliminar

Reutilizar:

- ciclo general crear -> aprobar -> recibir
- recepcion parcial
- trazabilidad
- relacion con demanda operativa

No migrar:

- arquitectura tecnica
- SQL incrustado
- modelo fisico
- dependencias de UI legacy
