# MOKA — Ticket 10: validaciones y ficha técnica

Fecha: 2026-09-08. **Registro histórico de la implementación. El QA visual posterior se completó: [informe de reanudación](visual-final/INFORME_MOKA.md).**

Se implementaron los cinco cambios solicitados. La API se probó con requests reales; los PDF se generaron desde el endpoint de la aplicación y se inspeccionaron todas sus páginas. Chrome muestra Login, por lo que no se certifican la UI, responsive ni F5 con inspección de código.

La fórmula, factores, catálogo y esquema no cambiaron. Los datos completos de Aceite y Cambio de Aceite coincidieron antes/después. La limpieza DML autorizada usó transacción y guardas de empresa/id/código exclusivamente sobre QA-T10-PRECIO-BASE; no hubo SQL estructural ni migraciones.

La paginación del PDF conserva márgenes y texto legible. La tabla de presentaciones está completa en la página 1 del Aceite; las secciones fiscales y variantes siguen el flujo multipágina existente. Servicio ocupa una página.

PASS en controles no visuales significa prueba API/datos/PDF según se indica; no implica prueba de navegador. PENDIENTE no se sustituye por PASS a partir del build.

| # | Control | Resultado / evidencia |
|---|---|---|
| 1 | Pieza aparece primero | PENDIENTE — requiere sesión y prueba real en navegador. |
| 2 | Grupo Por artículo primero | PENDIENTE — requiere sesión y prueba real en navegador. |
| 3 | Peso después | PENDIENTE — requiere sesión y prueba real en navegador. |
| 4 | Volumen después | PENDIENTE — requiere sesión y prueba real en navegador. |
| 5 | Longitud después | PENDIENTE — requiere sesión y prueba real en navegador. |
| 6 | Área después | PENDIENTE — requiere sesión y prueba real en navegador. |
| 7 | Tiempo después | PENDIENTE — requiere sesión y prueba real en navegador. |
| 8 | Otra después | PENDIENTE — requiere sesión y prueba real en navegador. |
| 9 | Nombre + abreviatura preservados | PENDIENTE — requiere sesión y prueba real en navegador. |
| 10 | Búsqueda preservada | PENDIENTE — requiere sesión y prueba real en navegador. |
| 11 | Pieza Base excluye Pieza de salida | PENDIENTE — requiere sesión y prueba real en navegador. |
| 12 | Kg Base excluye Kg de salida | PENDIENTE — requiere sesión y prueba real en navegador. |
| 13 | cm Base excluye cm de salida | PENDIENTE — requiere sesión y prueba real en navegador. |
| 14 | L Base excluye L de salida | PENDIENTE — requiere sesión y prueba real en navegador. |
| 15 | Paquete Base excluye Paquete de salida | PENDIENTE — requiere sesión y prueba real en navegador. |
| 16 | Regla frontend | PENDIENTE — requiere sesión y prueba real en navegador. |
| 17 | Regla backend | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 18 | Mensaje UX correcto | PENDIENTE — requiere sesión y prueba real en navegador. |
| 19 | Presentación Base preservada | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 20 | 1 Pieza Base → 1 pz | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 21 | Precio Base = Precio Público | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 22 | Presentación Base no editable | PENDIENTE — requiere sesión y prueba real en navegador. |
| 23 | Presentación Base no permite Baja | PENDIENTE — requiere sesión y prueba real en navegador. |
| 24 | Presentación inválida Pieza→Pieza QA eliminada | N/A — la fila inválida de la captura no existe persistida; no había borrador abierto en la pestaña actual. |
| 25 | Paquete 6 pz existente detectado | PENDIENTE — requiere sesión y prueba real en navegador. |
| 26 | Segundo Paquete 6 pz con otro precio bloqueado | PENDIENTE — requiere sesión y prueba real en navegador. |
| 27 | Mensaje "Esta presentación ya existe" | PENDIENTE — requiere sesión y prueba real en navegador. |
| 28 | Backend bloquea duplicado | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 29 | Precio NO forma parte de llave de duplicidad | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 30 | Edición de precio existente permitida | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 31 | Paquete 12 pz permitido | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 32 | Diferente Unidad Venta con misma equivalencia permitida | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 33 | Duplicados activos finales | 0 — auditoría de filas activas. |
| 34 | Guardar/F5/Reabrir | PENDIENTE — requiere sesión y prueba real en navegador. |
| 35 | Precio Público sigue representando Unidad Base | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 36 | Presentación adicional NO modifica Precio Público | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 37 | Cambio Precio Público actualiza Base | PENDIENTE — requiere sesión y prueba real en navegador. |
| 38 | Paquetes conservan precios independientes | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 39 | Fórmula Ganancia preservada | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 40 | Fórmula Margen preservada | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 41 | Aceite Ganancia $75 | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 42 | Aceite Margen 11.03% | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 43 | Unidad Base visible | PENDIENTE — requiere sesión y prueba real en navegador. |
| 44 | Costo visible | PENDIENTE — requiere sesión y prueba real en navegador. |
| 45 | Precio Público visible | PENDIENTE — requiere sesión y prueba real en navegador. |
| 46 | Precio comparación visible | PENDIENTE — requiere sesión y prueba real en navegador. |
| 47 | Ganancia visible | PENDIENTE — requiere sesión y prueba real en navegador. |
| 48 | Margen visible | PENDIENTE — requiere sesión y prueba real en navegador. |
| 49 | Valores coinciden con Editar | PENDIENTE — requiere sesión y prueba real en navegador. |
| 50 | Subsección Presentaciones visible | PENDIENTE — requiere sesión y prueba real en navegador. |
| 51 | Presentación Base visible | PENDIENTE — requiere sesión y prueba real en navegador. |
| 52 | Presentaciones adicionales visibles | PENDIENTE — requiere sesión y prueba real en navegador. |
| 53 | Venta correcta | PENDIENTE — requiere sesión y prueba real en navegador. |
| 54 | Equivale en inventario correcto | PENDIENTE — requiere sesión y prueba real en navegador. |
| 55 | Precio correcto | PENDIENTE — requiere sesión y prueba real en navegador. |
| 56 | Sin acciones de edición | PENDIENTE — requiere sesión y prueba real en navegador. |
| 57 | Sin bloque vacío innecesario | PENDIENTE — requiere sesión y prueba real en navegador. |
| 58 | Cambio de Aceite abre Ficha | PENDIENTE — requiere sesión y prueba real en navegador. |
| 59 | Unidad de servicio preservada | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 60 | Precio Público $1,700 preservado | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 61 | Información General intacta | PENDIENTE — requiere sesión y prueba real en navegador. |
| 62 | Información Fiscal intacta | PENDIENTE — requiere sesión y prueba real en navegador. |
| 63 | No se inventan Presentaciones | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 64 | PDF descarga | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 65 | Unidad Base visible | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 66 | Costo visible | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 67 | Precio Público visible | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 68 | Precio comparación visible | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 69 | Ganancia visible | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 70 | Margen visible | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 71 | Presentaciones visibles | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 72 | Equivalencias correctas | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 73 | Precios correctos | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 74 | Sin Acciones | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 75 | UI y PDF coinciden | PENDIENTE — requiere sesión y prueba real en navegador. |
| 76 | PDF Cambio de Aceite descarga | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 77 | Datos comerciales correctos | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 78 | Información fiscal correcta | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 79 | No aparecen Presentaciones falsas | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 80 | Ficha Desktop | PENDIENTE — requiere sesión y prueba real en navegador. |
| 81 | Ficha Tablet | PENDIENTE — requiere sesión y prueba real en navegador. |
| 82 | Ficha Móvil | PENDIENTE — requiere sesión y prueba real en navegador. |
| 83 | Presentaciones sin overflow | PENDIENTE — requiere sesión y prueba real en navegador. |
| 84 | Información Comercial legible | PENDIENTE — requiere sesión y prueba real en navegador. |
| 85 | Información General intacta | PENDIENTE — requiere sesión y prueba real en navegador. |
| 86 | Información Fiscal intacta | PENDIENTE — requiere sesión y prueba real en navegador. |
| 87 | Información física/logística intacta | PENDIENTE — requiere sesión y prueba real en navegador. |
| 88 | Inventario visual intacto | PENDIENTE — requiere sesión y prueba real en navegador. |
| 89 | IVA intacto | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 90 | Ticket 08 intacto | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 91 | Productos activos finales | 2 — PASS. |
| 92 | Nombres finales: | Aceite Motor Sintetico; Cambio de Aceite. |
| 93 | Unidades Sistema activas finales | 53 — PASS. |
| 94 | Personalizadas activas finales: | Unidad de servicio, Actividad y Paquete — PASS. |
| 95 | Total unidades activas finales | 56 — PASS. |
| 96 | Paquete permanece activo | PASS — prueba API, datos persistidos o PDF real; ver evidencias. |
| 97 | Presentaciones QA temporales activas | 0 — PASS; baja lógica de temporales y fixture previo. |
| 98 | Duplicados activos | 0 — PASS. |
| 99 | Catálogo Sistema modificado | NO — diff acotado; sin ejecución estructural. |
| 100 | Factores modificados | NO — diff acotado; sin ejecución estructural. |
| 101 | Motor conversiones modificado | NO — diff acotado; sin ejecución estructural. |
| 102 | DECIMAL modificado | NO — diff acotado; sin ejecución estructural. |
| 103 | CRUD Unidades modificado | NO — diff acotado; sin ejecución estructural. |
| 104 | Login/Auth modificado | NO — diff acotado; sin ejecución estructural. |
| 105 | Firebase modificado | NO — diff acotado; sin ejecución estructural. |
| 106 | IVA modificado | NO — diff acotado; sin ejecución estructural. |
| 107 | Ticket 08 modificado | NO — diff acotado; sin ejecución estructural. |
| 108 | POS modificado | NO — diff acotado; sin ejecución estructural. |
| 109 | Inventario operativo modificado | NO — diff acotado; sin ejecución estructural. |
| 110 | SQL estructural ejecutado | NO — diff acotado; sin ejecución estructural. |
| 111 | Migraciones ejecutadas | NO — diff acotado; sin ejecución estructural. |
| 112 | Archivos modificados: | ProductosServicios.js; ProductosServicios.css; ProductosServiciosController.cs (API); ProductosServiciosModels.cs; documentación de esta iteración. |
| 113 | Build frontend: | PASS — 0 errores, 9 advertencias existentes. |
| 114 | Build API: | PASS — 0 errores, 785 advertencias existentes. |
| 115 | JS syntax: | PASS — node --check. |
| 116 | PDF generado y verificado | Sí — ambos PDF reales de API generados y todas sus páginas renderizadas e inspeccionadas. |
| 117 | 5200 funcionando al terminar | Sí. |
| 118 | PID 5200: | 4518. |
| 119 | 5127 funcionando al terminar | Sí. |
| 120 | PID 5127: | 4510. |
| 121 | Defectos encontrados: | Selección repetida de base; falta de unicidad estructural; ficha/PDF sin modelo comercial actualizado. |
| 122 | Defectos corregidos: | Implementadas exclusión, validación de alta/edición/inicial con precisión persistida, orden de grupos, campos y presentaciones en ficha/PDF. |
| 123 | Datos QA creados: | Tres presentaciones temporales; ningún producto nuevo persistido. Requests de alta rechazados comprobaron rollback. |
| 124 | Datos QA limpiados: | Tres temporales dadas de baja; fixture QA-T10-PRECIO-BASE y sus presentaciones archivados de forma acotada por empresa/id/código. |
| 125 | Excepciones: | Chrome quedó sin sesión. El ticket actual sustituye explícitamente la instrucción anterior de liberar puertos: se dejan ambos activos. |
| 126 | Pendientes REALES: | QA visual real de combos, ficha, responsive y Guardar/F5/Reabrir. Necesita inicio de sesión del usuario. |
| 127 | Evidencias: | api-tests.json; initial-api-tests.json; base-protection-api-tests.json; final-data-audit.json; aceite.pdf; servicio.pdf; renders PNG; sesion-pendiente.png; cambios.patch. |
| 128 | Dictamen: | IMPLEMENTACIÓN Y QA API/PDF COMPLETADAS; CERTIFICACIÓN VISUAL PENDIENTE DE SESIÓN. No cerrado ni aprobado por PO. |
