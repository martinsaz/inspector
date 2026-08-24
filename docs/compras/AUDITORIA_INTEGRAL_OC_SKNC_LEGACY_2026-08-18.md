# AUDITORIA INTEGRAL LEGACY SKNC - ORDENES DE COMPRA

## Estado de la corrida

- AGENTS leido: si
- CLAUDE leido: si
- Backlog comercial congelado respetado: si
- Legacy modificado: no
- Puerto 8080: activo
- PID observado: `31350`
- Proyecto auditado: `/Users/denissemendiola/dev/skncCreator/skncCreator`

## Arquitectura

- ASP.NET MVC 5 sobre .NET Framework 4.6.1
- Razor + jQuery + DataTables + Select2
- SQL directo como capa dominante
- Reportes con RDLC / ReportViewer
- Contexto tenant resuelto desde cookie `whoamifbctr`

## Respuestas obligatorias

1. Como nace una OC:
   - desde `/OrdenesCompra/Index`, capturando datos de encabezado y partidas, con persistencia final en `OrdendeCompraPT`.
2. Quien puede crearla:
   - usuario con acceso a `m011110END`.
3. Que datos requiere:
   - razon social, proveedor, almacen, departamento, fechas, partidas.
4. Que tablas utiliza:
   - `OrdendeCompraPT`, `OrdendeCompraAprobaciones`, `fcexistenprod`, mas catalogos y tablas de recepcion.
5. Como calcula:
   - base `Cantidad * Costo`; el IVA aparece en consultas agregadas, no en captura manual de la OC.
6. Que estados existen:
   - `0,1,2,3,4,5,6`.
7. Como cambia de estado:
   - creacion, aprobacion, recepcion, cancelacion y cierre manual.
8. Quien aprueba:
   - supervisores por departamento.
9. Como funciona aprobacion:
   - secuencial por `Firma1..Firma5`.
10. Si hay multiples niveles:
   - si, hasta 5.
11. Que ocurre al rechazar:
   - no se encontro flujo formal de rechazo de OC en el motor auditado.
12. Que ocurre al aprobar:
   - cambia a `6`; no entra inventario.
13. Cuando se bloquea edicion:
   - la UI limita varias ediciones a estatus `0`; despues subsisten acciones puntuales desde reporte.
14. Que hace ReporteOC:
   - consulta y operacion: ver, editar, cancelar, duplicar, PDF, correo.
15. Que documento genera:
   - PDF de OC y archivo tabular por correo.
16. Si existe recepcion:
   - si, en `RecepcionGController`.
17. Si admite parcialidad:
   - si.
18. Cuando afecta inventario:
   - en recepcion, no en aprobacion.
19. Que tablas de inventario toca:
   - `fcexistenprod`, `fcComprasPT`, `fcComprasPTDet`, `fcProductosSeriales*`.
20. Como maneja proveedor:
   - desde `fcproveedores`, con email usado para envio documental.
21. Como maneja productos:
   - desde `fcproductos` + `fcvariantes` + `fcSkus`.
22. Como maneja usuarios/permisos:
   - permisos frontend por pantalla y aprobadores por email/departamento.
23. Que historial conserva:
   - cambios de cantidad/costo en `OrdenCompraPTCambios`; aprobaciones por firma/fecha.
24. Que ocurre despues de aprobacion:
   - queda lista para recepcion.
25. Como termina/cierra una OC:
   - recibida total, parcial, cancelada o terminada manualmente.
26. Que reglas serian utiles para CheckApp:
   - aprobacion separada, recepcion parcial, trazabilidad, demanda esperada vs inventario real.

## Tablas clave

- Tabla encabezado OC real: no separada; la cabecera esta repetida en `OrdendeCompraPT`
- Tabla detalle OC: `OrdendeCompraPT`
- Tabla folio: no existe dedicada; se toma de `OrdendeCompraPT`
- Tabla proveedor: `fcproveedores`
- Tabla producto: `fcproductos`

## Pantallas auditadas

- Index auditado: si
- ReporteOC auditado: si
- Aprobaciones auditado: si
- Recepcion relacionada auditada: si

## Hallazgos principales

- `/OrdenesCompra/Index` es captura, no listado.
- La OC puede nacer aprobada o pendiente segun configuracion departamental.
- La aprobacion no depende de monto; depende de lista fija de supervisores.
- El modelo fisico mezcla cabecera y detalle en una sola tabla.
- La recepcion es el evento que realmente mueve inventario.
- El sistema soporta recepcion parcial y sobrerecepcion.
- No se encontro rechazo formal de OC con motivo dentro del motor auditado.
- La seguridad visible depende demasiado del frontend.

## Documentos generados

- `docs/compras/legacy-sknc/01_ARQUITECTURA_SKNC_OC.md`
- `docs/compras/legacy-sknc/02_ORDENES_COMPRA_INDEX.md`
- `docs/compras/legacy-sknc/03_REPORTE_OC.md`
- `docs/compras/legacy-sknc/04_APROBACIONES_OC.md`
- `docs/compras/legacy-sknc/05_CICLO_ESTADOS_OC.md`
- `docs/compras/legacy-sknc/06_MODELO_DATOS_OC.md`
- `docs/compras/legacy-sknc/07_APROBACIONES_REGLAS.md`
- `docs/compras/legacy-sknc/08_RECEPCION_OC.md`
- `docs/compras/legacy-sknc/09_INVENTARIO_DESDE_OC.md`
- `docs/compras/legacy-sknc/10_USUARIOS_PERMISOS_OC.md`
- `docs/compras/legacy-sknc/11_REGLAS_NEGOCIO_OC.md`
- `docs/compras/legacy-sknc/12_MAPA_ENDPOINTS_TABLAS.md`
- `docs/compras/legacy-sknc/13_PROCESO_E2E_OC.md`
- `docs/compras/legacy-sknc/14_GAP_LEGACY_OC_VS_CHECKAPP.md`

## Limites y pendientes reales

- La corrida CLI confirmo runtime en `8080`, pero no reprodujo requests autenticados completos de las tres pantallas con sesion de usuario real.
- No se encontro en el codigo auditado un motor formal de rechazo/reenvio de aprobacion equivalente al de aprobacion positiva.
- La generacion de PDF no fue reejecutada por CLI para evitar acciones operativas sobre datos reales; se documento por codigo.
