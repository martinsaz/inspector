# TICKET 09 - Presentaciones de venta - Fase 2

- Pre-check UNIQUE `(idEmpresa, id)`: PASS. Existe `UX_ProductosServicios_Empresa_Id`.
- Tabla, FK compuesta e índices: PASS.
- Inicialización: `5` candidatos, `5` creadas, `0` duplicados.
- Motor: PASS para `1, 6, 7, 10, 12, 16, 20`, imposible y tela `150 cm = $95`.
- Build API/frontend y sintaxis JavaScript: PASS, 0 errores; warnings legacy preexistentes.
- Pendiente: QA visual autenticada CRUD, multitenant y responsive. Se preservaron procesos preexistentes y datos QA.
- POS, ventas, inventario E2E y Ticket 08: sin cambios.
- Dictamen: `IMPLEMENTACIÓN COMPLETA; PENDIENTE QA VISUAL AUTENTICADA DEL PRODUCT OWNER`.

## Certificación previa

- Lectura SQL: `5` productos activos, `5` con unidad y precio público; `5` predeterminadas iniciales correctas, `0` inválidas y `0` duplicados.
- Procesos actuales: las rutas inequívocas de Fase 2 en `5200` y `5127` responden `404`.
- Dictamen: `LOS PROCESOS PREEXISTENTES NO TIENEN CARGADA FASE 2 — SE REQUIERE AUTORIZACIÓN PARA REINICIAR`.

## Reinicio autorizado

- API nueva: PID `39891`, puerto `5127`; frontend nuevo: PID `39900`, puerto `5200`.
- El contrato nuevo responde `401` sin contexto, confirmando que Fase 2 está cargada.
- La sesión Chrome no sobrevivió y la app redirige a login. Los servicios quedan funcionando para login manual y continuación del QA.

## Certificación visual autenticada

- Fecha: `2026-09-03`; sesión manual: `UMBRELLA`.
- Restricciones cumplidas: sin reinicios, cambios de código ni SQL durante el QA.
- Producto QA: `QA-T03-CERT-20260821`.

| Caso | Resultado real |
| --- | --- |
| Grid Presentaciones de Venta | PASS: grid con Presentación, Equivale a, Precio, Predeterminada y Acciones. |
| Alta Sixpack | PASS: equivalencia 6, $50 y alerta de registro. |
| Alta Paquete 10 | PASS: equivalencia 10, $80 y alerta de registro. |
| Edición | PASS: Sixpack $50 a $48, con alerta y valor en grid. |
| Baja lógica | PASS: Paquete 10 y Sixpack dados de baja y ocultos del grid activo. |
| Predeterminada única | PASS: alternancia entre Sixpack y Pieza dejó una única predeterminada; la única activa no expone Baja. |
| Sincronización PrecioPublico | PASS: reflejó $50, $48 y al restaurar Pieza $99. |
| Precio Unitario intacto | PASS: permaneció `$0.00`. |
| Servicio sin Presentaciones | PASS: `Cambio de Aceite` no muestra el panel y conserva sus precios. |
| Limpieza QA | PASS: solo `Pieza | 1 PZA | $99.00 | predeterminada`. |
| Bloqueo cambio de Unidad | NO EJECUTADO: no se arriesgó el estado limpio. |
| PermiteDecimales | NO EJECUTADO: no se creó dato persistente adicional. |
| Motor 1,6,7,10,12,16,20; imposible; desempate; tela 150=$95 | NO CERTIFICADO EN CONTRATO REAL: solo existe evidencia local previa del motor. |
| Multitenant cruzado | NO EJECUTADO: no se abrió ni contaminó otro tenant. |
| F5/reapertura | NO EJECUTADO. |
| Desktop | PASS: flujo ejecutado en Chrome de escritorio. |
| Tablet / Móvil | NO EJECUTADO: no hubo cambio de viewport real. |
| Ticket 08 intacto | PASS ACOTADO: sin cambios de código, SQL ni operación modificadora sobre Ticket 08. |

- Procesos al cierre: frontend PID `39900` escuchando `5200`; API PID `39891` escuchando `5127`.
- Dictamen: `CERTIFICACIÓN REAL PARCIAL — CRUD, predeterminada/sincronización, servicio y Precio Unitario validados. Pendientes: contrato autenticado del motor, multitenant, decimales, unidad, F5 y responsive tablet/móvil.`
