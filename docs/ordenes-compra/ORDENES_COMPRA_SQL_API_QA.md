# EJECUCIÓN CONTROLADA SQL Y QA REAL API DE ÓRDENES DE COMPRA

Fecha de ejecución: 2026-08-04/2026-08-05  
Evidencia estructurada externa: `/tmp/ordenes_compra_phase56`

## 1. Alcance y contención

- Repositorio frontend: sin cambios en esta fase.
- MVC frontend: sin cambios en esta fase.
- API/WS: sin cambios en esta fase.
- SQL correctivo manual: no aplicado.
- Script DOWN: no ejecutado.
- Roles, permisos, Firebase, login, claims globales, menú y vistas: sin cambios.

## 2. Origen de conexión oficial

- Origen de configuración: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/appsettings.json`
- Fábrica oficial reutilizada por el proyecto: `SqlConnectionFactory`
- Servidor sanitizado confirmado: `sql5111.site4now.net`
- Base confirmada: `db_a883c3_checklist`

No se expone cadena completa, usuario SQL ni contraseña.

## 3. Hashes aprobados

- `ordenes-compra-up.sql`: `00cea8c14868824a478913bfaa1a484e534ab929fbc808cbd2cb0376a8c1c69f`
- `ordenes-compra-down.sql`: `c0c5ff7e8d75ab6f7204442e4097b52386c596b9e933a56bb7085eba69b54e37`

## 4. Evidencia previa a ejecución

- Fecha/hora UTC del servidor antes del UP: `2026-08-05T03:59:16.7364466`
- `@@TRANCOUNT` previo: `0`
- Conteo previo de tablas `OrdenesCompra%`: `0`
- `dbo.OrdenesCompraFolios`: inexistente
- `dbo.OrdenesCompra`: inexistente
- `dbo.OrdenesCompraDetalle`: inexistente
- Índices, constraints y FK previos con esos nombres: inexistentes
- Respaldo completo automatizado: no había herramienta segura lista para backup integral en el entorno; se documentó y se continuó con evidencia previa/posterior en `/tmp/ordenes_compra_phase56`

No se activó ninguna condición de detención previa.

## 5. Ejecución controlada del UP

- Script ejecutado: `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Scripts/ordenes-compra-up.sql`
- Veces ejecutado: `1`
- Inicio UTC aproximado: `2026-08-05T03:59:28Z`
- Fin UTC aproximado: `2026-08-05T03:59:28Z`
- Resultado: exitoso
- Error SQL: ninguno
- `@@TRANCOUNT` posterior inmediato: `0`

## 6. Validación estructural posterior

### Tablas creadas

- `dbo.OrdenesCompraFolios`
- `dbo.OrdenesCompra`
- `dbo.OrdenesCompraDetalle`

### Columnas

- Total de columnas inspeccionadas en las tres tablas: `49`
- Evidencia completa de nombres, tipos, precisión, escala y nulabilidad: `/tmp/ordenes_compra_phase56/postcheck.json`

### PK

- `PK_OrdenesCompraFolios`
- `PK_OrdenesCompra`
- `PK_OrdenesCompraDetalle`

Cada PK quedó sobre `id`.

### FK

- `FK_OrdenesCompraDetalle_OrdenesCompra_EmpresaId`

Confirmada sobre:

- `OrdenesCompraDetalle (idEmpresa, idOrdenCompra)`
- `OrdenesCompra (idEmpresa, id)`

### Índices confirmados

- `UX_OrdenesCompraFolios_Empresa`
- `UX_OrdenesCompraFolios_Empresa_Id`
- `UX_OrdenesCompra_Empresa_Id`
- `UX_OrdenesCompra_Empresa_Folio`
- `IX_OrdenesCompra_Empresa_Estado_FechaOrden`
- `IX_OrdenesCompra_Empresa_Proveedor`
- `IX_OrdenesCompra_Empresa_Sucursal`
- `IX_OrdenesCompra_Empresa_RazonSocial`
- `UX_OrdenesCompraDetalle_Empresa_Id`
- `IX_OrdenesCompraDetalle_Empresa_Orden`
- `UX_OrdenesCompraDetalle_Empresa_Orden_NumeroPartida`
- `UX_OrdenesCompraDetalle_Empresa_Orden_ProductoServicio_Activo`

### Filtros exactos

Confirmados en SQL para:

- `UX_OrdenesCompraDetalle_Empresa_Orden_NumeroPartida`
- `UX_OrdenesCompraDetalle_Empresa_Orden_ProductoServicio_Activo`

Criterio de vigencia confirmado:

- `WHERE Activo = 1 AND FechaArchivado IS NULL`

### Checks confirmados

- `CK_OrdenesCompra_Estado`
- `CK_OrdenesCompra_ImportesNoNegativos`
- `CK_OrdenesCompra_TotalIgualSubtotal`
- `CK_OrdenesCompra_TotalPorEstado`
- `CK_OrdenesCompra_FechaLlegada`
- `CK_OrdenesCompra_Cancelacion`
- `CK_OrdenesCompra_FolioGenerada`
- `CK_OrdenesCompra_Archivado`
- `CK_OrdenesCompraDetalle_NumeroPartida`
- `CK_OrdenesCompraDetalle_TipoProductoServicio`
- `CK_OrdenesCompraDetalle_Cantidad`
- `CK_OrdenesCompraDetalle_ImportesNoNegativos`
- `CK_OrdenesCompraDetalle_Calculo`
- `CK_OrdenesCompraDetalle_Archivado`
- `CK_OrdenesCompraFolios_UltimoConsecutivo`

### Defaults confirmados

- `NEWID()` en claves técnicas
- `Activo`
- `Estado = 1 (Borrador)`
- Fechas automáticas
- Importes en cero
- Consecutivo inicial en cero

### Ausencias confirmadas

- Sin FK física a usuarios
- Sin tablas de inventario
- Sin recepción
- Sin variantes
- Sin impuestos
- Sin descuentos
- Sin monedas

### Transacción final

- `@@TRANCOUNT = 0`

## 7. Build antes y después del QA

Comando:

`dotnet build /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/checklistWs.csproj`

Resultado antes del QA:

- `0` errores
- warnings heredados: `8`
- warnings nuevos atribuibles a Órdenes de Compra: `0`

Resultado después del QA:

- `0` errores
- warnings heredados: `8`
- warnings nuevos atribuibles a Órdenes de Compra: `0`

Warnings heredados observados:

- `NU1701` por `FireSharp 2.0.4`
- `NU1701` por `Microsoft.Bcl 1.1.9`
- `NU1701` por `Microsoft.Bcl.Async 1.0.168`
- `NU1701` por `Microsoft.Net.Http 2.2.28`

## 8. Contexto funcional de QA

- Usuario QA utilizado: `denisse@checkapp.com.mx`
- Encabezado esperado utilizado para firma: `UMBRELLA`
- Tenant activo validado en la API: `b17aaece-2b78-4e35-b554-9e694eeb15a7`
- Usuario técnico resuelto para evidencia API: `d9a07f60-59e4-4f88-95ca-086dcf868163`

Como no existía proxy MVC específico del módulo, el QA real de API se ejecutó con un harness temporal fuera del repositorio que reutilizó exactamente el patrón firmado certificado del proyecto para:

- nombres de headers;
- payload de firma;
- HMAC SHA-256;
- tolerancia temporal;
- comparación de `idEmpresa`.

No se modificó MVC, autenticación, login ni `Program.cs`.

## 9. Endpoints probados

### GET

1. `ObtenerOrdenesCompra`
   - listado por folio: OK
   - filtro por estado cancelada: OK
   - filtro por búsqueda: OK

2. `ObtenerOrdenCompra`
   - detalle de borrador: OK
   - detalle de generada: OK
   - detalle de cancelada: OK

3. `ObtenerResumenOrdenesCompra`
   - antes del QA: OK
   - después del QA: OK

4. `ObtenerCombosOrdenCompra`
   - razones sociales: OK
   - sucursales: OK
   - proveedores: OK
   - estados: OK

5. `BuscarProductosServiciosOrdenCompra`
   - búsqueda general: OK
   - filtro `tipo = producto`: OK
   - filtro `tipo = servicio`: OK

6. `ExportarOrdenesCompra`
   - exportación filtrada por folio: OK
   - exportación filtrada por estado cancelada: OK
   - payload limpio: sin IDs internos, sin HTML, sin acciones

### POST

7. `GuardarBorradorOrdenCompra`
   - rechazo por `FechaLlegada < FechaOrden`: OK
   - rechazo por partidas duplicadas: OK
   - alta borrador con total cero: OK
   - alta borrador válida: OK
   - edición de borrador: OK

8. `GenerarOrdenCompra`
   - rechazo de orden con total cero: OK
   - generación válida: OK
   - prevención de doble generación: OK

9. `CancelarOrdenCompra`
   - cancelación de borrador de limpieza: OK
   - cancelación de orden generada: OK
   - prevención de doble cancelación: OK

## 10. Reglas funcionales validadas

- `FechaLlegada` no puede ser anterior a `FechaOrden`
- no se permiten partidas duplicadas
- una orden con total cero sí puede guardarse como borrador
- una orden con total cero no puede generarse
- una orden generada no puede generarse otra vez
- una orden cancelada no puede cancelarse otra vez
- la edición se permite únicamente en borrador
- la comparación multitenant por `idEmpresa` rechaza mezcla de tenant
- la firma HMAC es obligatoria

## 11. Datos QA creados

- Orden de limpieza por total cero
  - GUID: `2ef5d451-a6c7-4583-8c32-5463f1a35fc6`
  - Folio: `OC-000001`
  - Estado final: cancelada

- Orden válida del flujo completo
  - GUID: `5688e62e-62c9-4502-8837-4bf7346d83c1`
  - Folio: `OC-000002`
  - Estado final: cancelada

Proveedor utilizado:

- `19b44327-2b2a-4101-be33-22f1f3fbed6b`

Razón social utilizada:

- `fd23fc20-2874-4178-9df6-96a142b6cf21`

Sucursal utilizada:

- `f3080af9-985b-4802-8aea-700f829f22fc`

Producto de verificación:

- `ecd83622-584a-48e1-8b01-7db89c950873`

Servicio de verificación:

- `d6fb766b-e8ff-421d-8bdf-bc987ce4130e`

## 12. Inventario y multitenant

- Snapshot del producto antes/después del QA:
  - `CostoActual = 605.00`
  - `CausaInventario = true`
  - sin cambios detectados

- No se detectó afectación de inventario derivada de guardar, generar o cancelar órdenes.
- Rechazo multitenant confirmado contra empresa distinta.

## 13. Errores y defectos reproducibles

- Errores JavaScript propios: no aplica en esta fase de API
- HTTP `500`: `0`
- HTTP `404`: `0`
- Defectos reproducibles nuevos del vertical: ninguno

## 14. Evidencia generada

- Precheck SQL: `/tmp/ordenes_compra_phase56/precheck.json`
- Ejecución UP: `/tmp/ordenes_compra_phase56/execup.json`
- Postcheck SQL: `/tmp/ordenes_compra_phase56/postcheck.json`
- QA API completo: `/tmp/ordenes_compra_phase56/qa_results.json`

## 15. Dictamen

SQL Y API CERTIFICADOS — LISTOS PARA IMPLEMENTAR FRONTEND

FASE SQL/API FINALIZADA — ESPERANDO DECISIÓN DEL PRODUCT OWNER
