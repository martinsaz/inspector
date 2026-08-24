# Backlog maestro propuesto — Proveeduría / Órdenes de Compra

Propongo 6 sprints, cada uno con un resultado funcional verificable.

| Sprint | Objetivo | Resultado funcional |
|---|---|---|
| OC-S0 | Fortalecer OC actual | Corregir gaps actuales sin rehacer el módulo |
| OC-S1 | Aprobaciones | OC Generada → aprobación/rechazo trazable |
| OC-S2 | Recepción | Recepción total/parcial y cantidades pendientes |
| OC-S3 | Evidencia mediante Checklist | Recepción/entrega respaldada por checklist y evidencias |
| OC-S4 | Inventario | Recepción aprobada → movimiento → existencia |
| OC-S5 | Seguimiento y cierre | Reporte OC con abastecimiento, recepción, evidencia y cierre |

El principio rector sería:

OC ≠ Recepción ≠ Evidencia ≠ Inventario.

Son etapas relacionadas, pero no debemos mezclarlas en una sola transacción o pantalla.

---

# OC-S0 — Fortalecimiento de la OC actual

## Objetivo

Conservar el módulo actual y resolver inconsistencias antes de construir encima.

CheckApp ya tiene OrdenesCompra, OrdenesCompraDetalle y OrdenesCompraFolios, con un modelo mejor normalizado que Legacy. 04_MODELO_DATOS_OC_ACTUAL.md

### OC-001 — Certificación funcional de OC actual

Certificar end-to-end:

Nueva → Borrador → Editar → Generar → Reporte → Detalle → PDF/Excel → Cancelar

Sin modificar comportamiento.

### OC-002 — Fecha mínima / Fecha máxima

Actualmente aparecen en UI pero no existe evidencia de persistencia backend. 02_PANTALLA_ACTUAL_OC.md

Definir con PO si:

- deben persistirse; o
- deben eliminarse.

No dejar campos simulando funcionalidad.

### OC-003 — Permisos finos de Proveeduría

Definir posteriormente sobre Roles/Permisos existentes:

- Consultar OC
- Crear
- Editar
- Generar
- Cancelar
- Exportar

No crear un segundo sistema de autorización.

### OC-004 — Separación conceptual de estados

Preparar el módulo para distinguir:

Estado Documento

BORRADOR / GENERADA / CANCELADA

de futuros:

Estado Aprobación

y

Estado Recepción

No romper los tres estados actuales.

### OC-005 — Trazabilidad documental

Certificar/preservar:

- creado por;
- actualizado por;
- cancelado por;
- fechas;
- motivo cancelación.

Preparar historial futuro de cambios relevantes.

## Gate QA OC-S0

La OC existente debe quedar certificada sin regresiones antes de agregar Aprobaciones o Recepción.

---

# OC-S1 — Aprobaciones

## Objetivo

Agregar un workflow formal sin copiar Supervisor1...Supervisor5 de SKNC.

Legacy confirmó que la aprobación multinivel es útil, pero su implementación es rígida. CheckApp actualmente no tiene aprobación formal. 05_COMPARATIVO_CHECKAPP_VS_SKNC.md

### OC-010 — Modelo de aprobación OC

Separar aprobación del estado documental.

Conceptualmente:

NO_REQUERIDA
PENDIENTE
APROBADA
RECHAZADA

### OC-011 — Configuración de aprobadores

Permitir definir una secuencia configurable de aprobación.

No columnas:

Supervisor1, Supervisor2, etc.

Modelo 1:N.

### OC-012 — Enviar a aprobación

Una OC Generada que requiera aprobación pasa a:

PENDIENTE DE APROBACIÓN

### OC-013 — Aprobar

Registrar:

- OC;
- nivel;
- usuario;
- fecha/hora;
- decisión.

### OC-014 — Rechazar

A diferencia de Legacy, incluir:

- rechazo;
- motivo obligatorio;
- usuario;
- fecha.

### OC-015 — Reenvío

Permitir corregir según reglas aprobadas y reenviar cuando proceda, conservando historial.

### OC-016 — Historial de aprobación

Mostrar:

Nivel → Aprobador → Decisión → Fecha → Comentario

### OC-017 — Seguridad server-side

Ninguna aprobación puede depender solo de ocultar/mostrar botones.

## Gate QA

Probar:

1 nivel, varios niveles, rechazo, intento no autorizado, doble clic y trazabilidad.

---

# OC-S2 — Recepción de Orden de Compra

## Objetivo

Construir la pieza que hoy no existe.

Legacy demuestra que la recepción —no la aprobación— es el evento que materializa la llegada de mercancía. CheckApp actualmente no tiene tablas, endpoints ni UI de recepción. AUDITORIA_INTEGRAL_OC_CHECKAPP_ACTUAL_2026-08-19.md

### OC-020 — Modelo Recepción

Una OC podrá tener:

1:N Recepciones

Conceptualmente:

OrdenCompra
   ├── Recepción 1
   ├── Recepción 2
   └── Recepción N

### OC-021 — Detalle Recepción

Por partida conservar:

- CantidadOrdenada
- CantidadRecibidaAcumulada
- CantidadPendiente
- CantidadRecibirAhora

### OC-022 — Recepción parcial

Caso obligatorio:

Ordenado 10 → Recibo 4 → Pendiente 6

La OC permanece abierta a nuevas recepciones.

### OC-023 — Múltiples recepciones

Continuando:

Recibo 6 → Acumulado 10 → Pendiente 0

### OC-024 — Estado de recepción

Conceptualmente:

SIN_RECEPCION
PARCIAL
COMPLETA

Sobrerecepción se mantiene como decisión PO.

### OC-025 — Validaciones

No permitir:

- cantidad <= 0;
- partida ajena;
- recepción sobre OC cancelada;
- doble registro accidental;
- alterar cantidades ya recibidas sin proceso autorizado.

### OC-026 — Usuario receptor

Registrar quién recibió y cuándo.

### OC-027 — Observaciones de recepción

Capturar incidencias generales de entrega:

- faltante;
- daño;
- entrega incompleta;
- diferencia;
- comentario.

### OC-028 — Productos y Servicios

Producto inventariable:

recepción física.

Servicio:

no debe incrementar existencia.

Su tratamiento debe quedar diferenciado en la recepción.

## Gate QA

Total, parcial, múltiples recepciones, cancelada, cantidades inválidas y concurrencia.

---

# OC-S3 — Evidencia de Recepción/Entrega mediante Checklist

Este Sprint es una capacidad propiamente CheckApp y es donde podemos superar claramente al Legacy.

## Objetivo

Cada recepción que lo requiera podrá ejecutar un Checklist de Recepción/Entrega y vincular su resultado como evidencia de esa recepción.

No crear un motor nuevo de formularios.

Reutilizar el sistema de Checklists existente.

### OC-030 — Configuración de Checklist para recepción

Definir qué plantilla/checklist se utiliza para Recepción de OC.

La relación conceptual:

Tipo operación:
RECEPCION_OC
→ Checklist configurado

### OC-031 — Generar ejecución de Checklist

Desde una Recepción:

Realizar checklist de recepción

Debe crear/vincular una ejecución real del módulo CheckApp existente.

### OC-032 — Contexto enviado al Checklist

La ejecución debe conocer, al menos:

- OC;
- folio;
- proveedor;
- sucursal;
- recepción;
- usuario receptor;
- fecha.

Sin duplicar esos datos dentro del motor de Checklist innecesariamente.

### OC-033 — Evidencia fotográfica

El checklist podrá solicitar evidencia existente soportada por CheckApp:

- fotografías;
- comentarios;
- respuestas;
- hallazgos;
- otros tipos ya soportados.

No crear un sistema paralelo de archivos.

### OC-034 — Evidencia de entrega documental

El Checklist puede incluir preguntas/evidencias como:

- mercancía recibida;
- empaque correcto;
- cantidad validada;
- producto dañado;
- factura/remisión recibida;
- evidencia fotográfica.

Estas preguntas deben provenir de la plantilla, no estar hardcodeadas en OC.

### OC-035 — Evidencia por recepción

La relación debe ser:

OC
 └── Recepción 1
      └── Ejecución Checklist
           ├── respuestas
           ├── fotos
           ├── evidencia
           └── hallazgos

No solamente:

OC → Checklist

porque una OC puede tener múltiples recepciones.

### OC-036 — Estado del Checklist

La Recepción debe poder saber:

- No iniciado
- En proceso
- Completado

utilizando estados reales del motor existente.

### OC-037 — Política de obligatoriedad

Preparar configuración para determinar si el Checklist es:

- obligatorio antes de confirmar recepción;
- opcional;
- requerido según tipo de producto/proveedor/sucursal.

La regla exacta queda pendiente de aprobación PO.

### OC-038 — Recepción con incidencia

Si el Checklist detecta:

- daño;
- faltante;
- incumplimiento;

no debe alterar silenciosamente la cantidad.

Debe conservar evidencia y permitir que el proceso aplique posteriormente la regla de negocio aprobada.

### OC-039 — Hallazgos / acciones

Si el Checklist actual soporta Hallazgos/Acciones, reutilizar esa capacidad.

Ejemplo:

“4 cajas dañadas.”

Puede generar hallazgo sin inventar un subsistema propio de incidencias de compras.

### OC-040 — Consulta de evidencia

Desde detalle de Recepción:

Ver evidencia

Debe llevar/mostrar la ejecución asociada sin duplicarla.

### OC-041 — Evidencia desde Reporte OC

Desde Reporte:

OC
→ Recepciones
→ Recepción #2
→ Evidencia

### OC-042 — Auditoría

Conservar:

- quién ejecutó;
- cuándo;
- plantilla;
- versión de plantilla;
- resultado;
- evidencias.

Esto es especialmente importante si después se modifica la plantilla.

## Gate QA

Recepción → Checklist → fotografía/respuesta → completar → regresar a recepción → evidencia vinculada → F5 → persistencia.

---

# OC-S4 — Recepción → Inventario

## Objetivo

Solo después de tener una Recepción válida, afectar existencia.

Actualmente OC no escribe en ProductosServiciosExistencias ni en ProductosServiciosMovimientosInventario. AUDITORIA_INTEGRAL_OC_CHECKAPP_ACTUAL_2026-08-19.md

### OC-050 — Tipo de movimiento Recepción OC

Reutilizar MovimientosInventario y agregar/adaptar el concepto:

ENTRADA_RECEPCION_OC

si el catálogo actual no tiene equivalente.

### OC-051 — Actualización de existencia física

Producto inventariable recibido:

ExistenciaNueva = ExistenciaAnterior + CantidadRecibida

### OC-052 — Negativos

Debe funcionar naturalmente:

Existencia -3 + Recepción 5 = Existencia 2

sin tratamientos artificiales.

### OC-053 — Servicios

Servicio recibido/confirmado:

NO genera movimiento físico.

### OC-054 — Trazabilidad movimiento

Movimiento debe referenciar:

- OC;
- Recepción;
- ProductoServicio;
- usuario;
- cantidad;
- fecha.

### OC-055 — Idempotencia

La misma Recepción jamás puede impactar inventario dos veces.

### OC-056 — Costo

Definir integración con CostoPromedio/costo actual según infraestructura existente.

No copiar directamente fórmula Legacy sin validar nuestro modelo.

### OC-057 — Seriales

Para productos serializados:

la recepción debe utilizar la infraestructura de seriales existente de CheckApp.

No crear seriales exclusivos de Compras.

### OC-058 — Relación con Checklist

Aquí recomiendo una regla arquitectónica:

Evidencia y movimiento deben pertenecer a la misma Recepción, pero no acoplar el inventario directamente al Checklist.

Es decir:

Recepción
 ├── Checklist/Evidencia
 └── Movimiento Inventario

NO:

Checklist
→ actualiza inventario

El dueño de la transacción sigue siendo Recepción.

## Gate QA

Recepción parcial + evidencia + movimiento + existencia + segunda recepción + no duplicidad.

---

# OC-S5 — Reporte, seguimiento y cierre

## Objetivo

Evolucionar el Reporte existente sin convertirlo en una mega pantalla Legacy.

El Reporte actual ya tiene filtros, KPIs, grid, detalle, PDF y Excel. 03_REPORTE_OC_ACTUAL.md

### OC-060 — Estado aprobación en Reporte

Mostrar independientemente:

Aprobación

### OC-061 — Estado recepción

Mostrar:

- Sin recepción
- Parcial
- Completa

### OC-062 — Cantidades de abastecimiento

En detalle:

- Ordenado
- Recibido
- Pendiente

### OC-063 — Historial de recepciones

Desde una OC:

Recepción 001 — 19 ago — 4 unidades
Recepción 002 — 21 ago — 6 unidades

### OC-064 — Evidencias

Cada recepción debe mostrar claramente:

Checklist/Evidencia: Completada

y permitir consultarla.

### OC-065 — Incidencias

Mostrar si una recepción tiene:

- hallazgos;
- faltantes;
- daños;
- observaciones.

Sin duplicar el módulo de Hallazgos.

### OC-066 — Historial integral

Timeline conceptual:

OC creada
→ Generada
→ Enviada a aprobación
→ Aprobada
→ Recepción parcial
→ Checklist completado
→ Inventario actualizado
→ Recepción final
→ Checklist completado
→ OC cerrada

### OC-067 — Cierre operativo

Una OC debe poder distinguir:

documento formalizado

de

abastecimiento completado.

Propuesta:

cuando todas las cantidades inventariables estén recibidas:

Recepción = COMPLETA

No necesariamente necesitamos otro estado documental CERRADA; eso puede resolverse después de validar reglas PO.

### OC-068 — Exportación

Extender exportaciones solo donde agregue valor:

- estado aprobación;
- recibido;
- pendiente;
- estado evidencia.

No intentar exportar fotografías dentro del Excel.

### OC-069 — Compatibilidad PDF

El PDF original de OC sigue representando lo ordenado.

No debe transformarse en reporte de recepción.

Recepciones/evidencias son documentos relacionados independientes.

---

# Dependencias

OC-S0
Fortalecer OC actual
    │
    ▼
OC-S1
Aprobaciones
    │
    ▼
OC-S2
Recepción
    │
    ├──────────────┐
    ▼              ▼
OC-S3           OC-S4
Checklist       Inventario
Evidencia
    │              │
    └──────┬───────┘
           ▼
         OC-S5
  Reporte / Seguimiento

OC-S3 y OC-S4 pueden desarrollarse en paralelo después de estabilizar Recepción, porque ambos dependen de la misma entidad/evento.

---

# Cómo queda la responsabilidad de cada dominio

| Dominio | Responsabilidad |
|---|---|
| Orden de Compra | Qué se solicitó comprar |
| Aprobación | Quién autorizó comprarlo |
| Recepción | Qué llegó realmente |
| Checklist | Evidencia de cómo/qué se recibió |
| Inventario | Existencia física resultante |
| Reporte OC | Seguimiento integral |
| ProductosServicios | Catálogo |
| Operador/Usuario | Quién ejecuta las acciones |

Esta separación es fundamental.

---

# Relación con el backlog comercial congelado

No propongo modificarlo.

Pero este backlog de OC queda compatible con él.

Cuando eventualmente retomemos Comercial podremos distinguir:

POR RECIBIR PROVEEDOR
= OC pendiente de recepción

COMPROMETIDO CLIENTE
= Pedido pendiente de surtimiento

EXISTENCIA FÍSICA
= lo que realmente tenemos

DISPONIBLE
= cálculo comercial posterior
