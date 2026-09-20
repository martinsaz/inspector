# MOKA - Cierre 100 Proveedores Patron CheckApp

Fecha: 2026-09-17  
Scope: `Proveedores`  
Tabla contractual: `dbo.ActivosProveedores`  
Base certificada: `CHECKAPPERP`

## Resultado Ejecutivo

Proveedores queda alineado con Legacy en campos, reglas de datos y operacion, sin copiar el diseno Legacy. El alcance fue cerrado con contrato versionado propio, version `1`, manifest hash, `CheckAppSchemaState`, `CheckAppSchemaHistory`, `CheckAppSchemaAttempts`, gate compatible y validacion de drift real.

## Paridad Legacy

Legacy auditado en `/Users/denissemendiola/dev/skncCreator`:

- Controlador: `AdministracionController`.
- Vista: `Views/Administracion/Proveedores.cshtml`.
- Script: `Scripts/Administracion/fcproveedores.js`.
- Modelo/tabla: `FcProveedores` / `fcproveedores`.

Campos reales homologados:

- `idEmpresa`
- `idProveedor` / `id`
- `Nombre`
- `RFC`
- `Telefono`
- `Telefono1`
- `Descripcion`
- `Email`
- `RazonSocial`
- `FechaAlta` / `FechaCreacion`
- `Limite`
- `Estatus` / `Activo`
- `Tipo`
- `ClasifContable`
- `CuentaContable`
- `Contacto`
- `CuentaBancaria`

Reglas Legacy trasladadas:

- Codigo autogenerado en alta.
- Edicion conserva codigo persistido.
- Busqueda por campos operativos.
- Baja/activacion logica.
- `Limite` decimal no negativo.
- `ClasifContable` booleano persistente.
- `idEmpresa` obligatorio en todo CRUD.

## Implementacion

MVC:

- `checklist/Controllers/Activos/ActivosController.cs`
- `checklist/Models/Activos/ActivoModels.cs`
- `checklist/Views/Activos/Proveedores.cshtml`
- `checklist/Views/Activos/Index.cshtml`
- `checklist/wwwroot/js/Activos/Activos.js`

API:

- `checklistWs/Controllers/Activos/ActivosController.cs`
- `checklistWs/Models/Activos/ActivoModels.cs`
- `checklistWs/Services/Tenant/ProductosServiciosSchemaContractProvider.cs`
- `checklistWs/Services/Tenant/SchemaVersionControlModels.cs`
- `checklistWs/Services/Tenant/ProductScopeInventory.cs`
- `checklistWs/Services/Tenant/ProductosServiciosSchemaBootstrapper.cs`
- `checklistWs/Services/Tenant/SchemaMigrationModels.cs`
- `checklistWs/Services/Tenant/SchemaMigrationRunner.cs`
- `checklistWs/Services/Tenant/ProductosServiciosCompatibilityGate.cs`
- `checklistWs/Services/Tenant/ProductosServiciosAuthorizationModels.cs`
- `checklistWs/Services/Tenant/ProductosServiciosAuthorizationService.cs`
- `checklistWs/Services/Tenant/SqlSchemaOperationLock.cs`
- `checklistWs/Services/Tenant/ProductosServiciosHistoricalBaselineAdopter.cs`

SQL/bootstrap:

- `checklistWs/Scripts/activos-proveedores-legacy-parity-up.sql`
- `checklistWs/Scripts/activos-proveedores-permission-bootstrap.sql`
- `checklist/docs/sql/20260727_activos_fases_2_5.sql`

## Certificacion CheckAppErp

Ejecucion real contra `CHECKAPPERP`:

- Infraestructura schema control: `Ready`.
- Tablas control verificadas: 3.
- Version scope: `1`.
- Baseline: `PROVEEDORES_V1_HISTORICAL_BASELINE`.
- Manifest hash: presente, 64 caracteres.
- Drift: `SchemaOk`.
- DriftCount: `0`.
- Tablas detectadas: `1`.
- Columnas detectadas: `18`.
- Indices detectados: `3`.
- Checks detectados: `1`.
- Gate primera corrida: `COMPATIBLE`.
- Gate segunda corrida: `COMPATIBLE`.
- History PASS: `1`.
- Attempts PASS: `1`.
- Lock real: `PASS`.
- CRUD all-fields con rollback: `PASS`.
- Drift detect/restore: `PASS`.
- RolesPermisos: bootstrap idempotente agregado para permiso propio `03506003`; el runtime conserva fallback transitorio a `03506000`. CheckAppErp no contiene tablas `dbo.Roles`/`dbo.Usuarios`, por lo que se valida condicionalmente en bases de autorizacion.

## Matriz 30 Reglas

1. Scope propio Proveedores: PASS.
2. T25 frozen: PASS, no se modifico T25.
3. Auditoria Legacy real: PASS.
4. Tabla/modelo Legacy identificados: PASS.
5. Todos los campos Legacy mapeados: PASS.
6. UI NEXT sin copiar Legacy: PASS.
7. Campos completos en modal: PASS.
8. Campos completos en DTO MVC/API: PASS.
9. Persistencia completa: PASS.
10. Lectura/listado completo: PASS.
11. Busqueda funcional extendida: PASS.
12. Baja/activacion logica: PASS.
13. DynamicGrid reutilizado: PASS.
14. HTML standalone Proveedores: PASS.
15. Responsive/modal grid: PASS.
16. idEmpresa obligatorio: PASS.
17. Multitenant CRUD aislado: PASS.
18. Schema versionado, no script manual como fuente unica: PASS.
19. Contrato manifestado: PASS.
20. Bootstrap/version infra: PASS.
21. Migracion registrada por scope: PASS.
22. State/History/Attempts: PASS.
23. Lock real: PASS.
24. Drift detection: PASS.
25. Drift restore: PASS.
26. Compatibility gate: PASS.
27. AuthZ MVC permiso propio `03506003` + fallback transitorio `03506000`: PASS.
28. AuthZ API permiso propio `03506003` + firma proxy + fallback transitorio `03506000`: PASS.
29. RolesPermisos bootstrap: PASS condicional por presencia de tablas de autorizacion.
30. Regresion build/test/SQL: PASS.

## Comandos de Verificacion

- `dotnet build checklist/checklist.csproj --no-restore --verbosity minimal`
- `dotnet build checklistWs/checklistWs.csproj --no-restore --verbosity minimal`
- `dotnet test checklistWs.sln --no-restore --verbosity minimal`
- `node --check checklist/wwwroot/js/Activos/Activos.js`
- Certificacion temporal CheckAppErp con runner local eliminado despues de ejecutar.
