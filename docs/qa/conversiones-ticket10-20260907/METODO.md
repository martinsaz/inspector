# Banco de prueba del motor real

Se creó UN producto QA por GuardarProductoServicio. Para reutilizarlo en todas las direcciones, se cambió únicamente su idUnidadMedida mediante SQL acotado por ID, código QA y nombre QA. No se cambiaron unidades base de los dos registros de trabajo.

Cada conversión ejecuta GuardarPresentacionVentaProductoServicio de la DLL real mediante un runner C# externo al repositorio. Usa el contexto de empresa de prueba en memoria; no modifica Login/Auth ni el proceso autenticado. Se observa request.EquivalenciaBase después de ejecutar el método real. No se copia ni reimplementa su cálculo para obtener ese valor.

El método real guarda una presentación QA. Se lee el decimal persistido directamente con SqlClient y se hace GET HTTP al endpoint real ObtenerProductoServicio para contrastar la representación API. El cociente de factores en Python es sólo una referencia matemática independiente, no el resultado del motor.

Las incompatibilidades se envían además directamente por HTTP POST a GuardarPresentacionVentaProductoServicio, usando el mecanismo firmado existente. No se emiten firmas ni secretos en evidencia.

La cantidad de vuelta se toma del valor interno observado, nunca de texto visual. Se calcula error absoluto respecto de 1. Para cuantización a cuatro decimales, la cota de dos pasos es 0.00005 × (factorIntermedio/factorOriginal + 1).

No se modifica código de producción. SQL adicional: lectura de escala y datos QA, cambio de unidad del único fixture y baja segura final de ese producto y sus presentaciones. Los INSERT/UPDATE de presentaciones de prueba los realiza el controlador real. No hay migraciones, cambios de columnas o lógica funcional de persistencia.
