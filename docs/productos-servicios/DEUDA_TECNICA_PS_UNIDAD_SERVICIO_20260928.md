# DEUDA_TECNICA_PS_UNIDAD_SERVICIO

## Contexto

PS-ACT-02 separa el contrato funcional de servicios de la persistencia fisica historica de Productos y Servicios.

En UI, ficha tecnica, PDF y contrato funcional, un registro de tipo Servicio no debe solicitar ni exponer Unidad Base operativa. La unidad SAT fiscal permanece separada y vigente mediante la Clave Unidad SAT.

## Motivo

La tabla fisica `ProductosServicios` conserva la columna `idUnidadMedida` como obligatoria (`NOT NULL`) y asociada al contrato historico de productos.

PS-ACT-02 no autoriza DDL, cambios de nulabilidad, alteraciones de llaves, migraciones ni modificaciones destructivas del schema. Por esa restriccion, el backend mantiene compatibilidad interna temporal para satisfacer el `NOT NULL` existente cuando guarda o conserva servicios.

## Comportamiento Temporal

- Servicio no muestra Unidad Base al usuario.
- Servicio no requiere Unidad Base en la experiencia funcional.
- Servicio no presenta Unidad Base en Ficha Tecnica ni PDF.
- La persistencia puede conservar o resolver una unidad fisica interna exclusivamente por compatibilidad con `ProductosServicios.idUnidadMedida NOT NULL`.
- La Clave Unidad SAT, por ejemplo `ACT - Actividad`, sigue siendo fiscal y no sustituye ni representa Unidad Base operativa.

## Restricciones

- No exponer esta unidad fisica al usuario.
- No usarla como semantica de inventario.
- No usarla para reportes operativos, OC, recepcion, curvas, inventario o costos como si fuera una unidad real del servicio.
- No documentar el cambio como "Servicio ya no guarda Unidad Base"; la descripcion correcta es: "Servicio no solicita ni expone Unidad Base, pero conserva compatibilidad fisica temporal por columna obligatoria".
- No ejecutar DDL en este ticket.
- No convertir `idUnidadMedida` a nullable sin ticket arquitectonico separado.

## Decision Futura Pendiente

Se requiere decision arquitectonica futura para resolver el contrato fisico de servicios. Opciones posibles, sujetas a aprobacion PO/lider y versionamiento de schema:

- permitir `idUnidadMedida` nullable para servicios;
- separar unidad operativa de producto y servicio;
- conservar columna de compatibilidad con reglas explicitas;
- introducir migracion versionada con Gate/Drift/History/Attempts;
- definir impacto en inventario, reportes, OC, recepcion y PDFs.

Estado: deuda tecnica documentada. No ejecutada.
