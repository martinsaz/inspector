# TICKET 20 — Gate server-side de compatibilidad ProductosServicios

Fecha: 2026-09-14  
Scope: `ProductosServicios`  
Base QA certificada: `CheckAppErp`  
Hash V1 vigente: `4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`

## Alcance implementado

Se implementó un gate server-side para permitir CRUD de Productos y Servicios únicamente cuando el tenant resuelve a una base SQL compatible para `DatabaseIdentity + Scope`. El frontend MVC no decide compatibilidad: conserva su rol de proxy/visualización y recibe el estado controlado desde API.

El gate evalúa, en este orden, contexto tenant/base, `DatabaseIdentity`, scope, versión conocida por la aplicación, clasificación T13, evidencia T14, intentos activos T16/T17/T19, versión soportada, hash de manifiesto T15 y validación física T18. Si cualquier requisito no se puede confirmar, el resultado es bloqueo controlado.

## Archivos principales

- API: `checklistWs/Services/Tenant/ProductosServiciosCompatibilityGateModels.cs`
- API: `checklistWs/Services/Tenant/ProductosServiciosCompatibilityGate.cs`
- API: `checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs`
- API: `checklistWs/Program.cs`
- Tests: `checklistWs.Tests/Services/Tenant/ProductosServiciosCompatibilityGateTests.cs`

## Resultado del gate

`CompatibilityDecision` expone:

- `IsAllowed`
- `SanitizedIdentity`
- `Scope`
- `CurrentVersion`
- `LatestSupportedVersion`
- `SchemaResult`
- `ReasonCode`
- `Retryable`
- `ReferenceId`
- `CheckedAtUtc`

No se expone connection string, SQL interno, stack trace ni secretos. El controlador traduce los bloqueos estructurales a HTTP 503 con `code`, `message` y `referenceId` saneados. Los errores Auth existentes siguen antes del flujo de resolución tenant/base y conservan sus respuestas 401/403.

## Matriz de decisión

| Condición | Resultado |
| --- | --- |
| Tenant/base inválido | BLOCK `TENANT_CONTEXT_INVALID` |
| DatabaseIdentity inválido/no verificable | BLOCK `DATABASE_IDENTITY_INVALID` |
| Scope distinto de ProductosServicios | BLOCK `TENANT_CONTEXT_INVALID` |
| Aplicación sin versión conocida | BLOCK `VERSION_INCOMPATIBLE` |
| Clasificación T13 `Empty` | BLOCK `SCHEMA_EMPTY` |
| Clasificación T13 `Partial` | BLOCK `SCHEMA_PARTIAL` |
| Clasificación T13 `Outdated` | BLOCK `SCHEMA_OUTDATED` |
| Clasificación T13 `Future` | BLOCK `SCHEMA_FUTURE` |
| Clasificación T13 `Unknown` | BLOCK `SCHEMA_UNKNOWN` |
| Metadata/base no disponible | BLOCK `SCHEMA_UNAVAILABLE`, retryable |
| Sin `CheckAppSchemaState` vigente | BLOCK `VERSION_EVIDENCE_MISSING` |
| Attempt activo `PROVISION/STARTED` | BLOCK `SCHEMA_PREPARING`, retryable |
| Attempt activo migración/otro `STARTED` | BLOCK `MIGRATION_IN_PROGRESS`, retryable |
| Versión persistida menor a soportada | BLOCK `SCHEMA_OUTDATED` |
| Versión persistida mayor a soportada | BLOCK `SCHEMA_FUTURE` |
| Contrato inexistente para versión | BLOCK `VERSION_INCOMPATIBLE` |
| ManifestHash distinto a contrato T15 | BLOCK `MANIFEST_HASH_MISMATCH` |
| T18 `SchemaDrift` | BLOCK `SCHEMA_DRIFT` |
| T18 `SchemaDriftCritico` | BLOCK `SCHEMA_DRIFT_CRITICAL` |
| T18 `ValidacionNoConcluyente` | BLOCK `VALIDATION_INCONCLUSIVE`, retryable |
| T18 `VersionIncompatible` | BLOCK `VERSION_INCOMPATIBLE` |
| T18 `RequiereRevision` o excepción inesperada | BLOCK `REQUIRES_REVIEW`, retryable |
| T18 `SchemaOk` sin diferencias + versión/hash V1 | ALLOW `COMPATIBLE` |

## Restricciones preservadas

- El gate no ejecuta DDL.
- El gate no provisiona, migra, repara ni actualiza state/history/attempts.
- No se creó V2.
- No se adelantó T21.
- No se modificó Firebase, Hosting, Login/Auth, permisos ni sesión.
- No se persistieron secretos.
- El aislamiento de datos sigue por `idEmpresa`; la compatibilidad de esquema se decide por `DatabaseIdentity + Scope`.

## QA automatizado

- `dotnet test checklistWs.Tests/checklistWs.Tests.csproj --filter ProductosServiciosCompatibilityGateTests`: PASS, 29/29.
- Casos cubiertos: ALLOW compatible, `Empty`, `Partial`, `Outdated`, `Future`, `Unknown`, unavailable, evidencia faltante, versión futura, versión atrasada, versión desconocida por app, contrato faltante, hash mismatch, drift, drift crítico, validación inconclusa, versión incompatible por T18, requiere revisión, SchemaOk con items inesperados, bootstrap/preparing, migrating, attempts completados, tenant inválido, scope inválido, fallo de identidad, excepción inesperada fail-closed, reevaluación sin cache, ausencia de mutaciones y descriptor manipulado por cliente sin efecto sobre identity/versión.
- Suite API completa posterior: PASS, 224/224.
- Build API posterior: PASS.
- Build MVC posterior: PASS.
- `git diff --check`: PASS en API y MVC.
- Secret scan local: PASS; único match fue `ApiKey` como nombre de propiedad/configuración existente, sin valor secreto literal.

## Certificación SQL real CheckAppErp

Runner temporal fuera del repositorio, con cadena QA leída localmente y eliminada después de la ejecución.

BEFORE:

- `DatabaseIdentity` saneada: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`
- `IsAllowed=True`
- `Reason=COMPATIBLE`
- `CurrentVersion=1`
- `LatestSupportedVersion=1`
- `Schema=SchemaOk`
- `DriftCount=0`
- `ManifestHash=4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`

DRIFT controlado:

- Fixture: `DROP INDEX IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento ON dbo.ProductosServiciosMovimientosInventario`
- Resultado gate: `IsAllowed=False`, `Reason=SCHEMA_DRIFT`, `Schema=SchemaDrift`, `ReferenceId` presente.
- El gate no reparó, no migró y no ejecutó DDL. El único DDL fue el fixture autorizado de certificación y su restauración manual.

AFTER/RESTORE:

- Índice restaurado con la forma contractual: `CREATE NONCLUSTERED INDEX IX_ProductosServiciosMovimientos_Empresa_FechaMovimiento ON dbo.ProductosServiciosMovimientosInventario (idEmpresa ASC, FechaMovimiento ASC)`.
- `IsAllowed=True`
- `Reason=COMPATIBLE`
- `CurrentVersion=1`
- `LatestSupportedVersion=1`
- `Schema=SchemaOk`
- `DriftCount=0`
- `ManifestHash=4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06`

## Checklist #MOKA 1-98

1. PASS — El gate existe como interfaz server-side.
2. PASS — La implementación decide en API.
3. PASS — MVC no calcula compatibilidad.
4. PASS — CRUD ProductosServicios llama al gate antes de SQL de negocio.
5. PASS — Auth 401/403 existente se conserva.
6. PASS — Incompatibilidad estructural responde 503 controlado.
7. PASS — No expone connection string.
8. PASS — No expone stack trace.
9. PASS — No expone SQL interno.
10. PASS — Incluye `ReferenceId` por evaluación.
11. PASS — Incluye `CheckedAtUtc`.
12. PASS — Incluye identidad saneada.
13. PASS — Incluye scope.
14. PASS — Incluye versión actual.
15. PASS — Incluye versión soportada.
16. PASS — Incluye resultado T18.
17. PASS — Incluye reason code.
18. PASS — Incluye retryable.
19. PASS — Bloquea tenant/context inválido.
20. PASS — Bloquea DatabaseIdentity inválida.
21. PASS — Bloquea scope no autorizado.
22. PASS — Bloquea app sin versión conocida.
23. PASS — Bloquea `EMPTY`.
24. PASS — Bloquea `PARTIAL`.
25. PASS — Bloquea `OUTDATED`.
26. PASS — Bloquea `FUTURE`.
27. PASS — Bloquea `UNKNOWN`.
28. PASS — Bloquea `UNAVAILABLE`.
29. PASS — Bloquea evidencia de versión faltante.
30. PASS — Bloquea versión persistida menor.
31. PASS — Bloquea versión persistida mayor.
32. PASS — Bloquea contrato inexistente.
33. PASS — Bloquea `MANIFEST_HASH_MISMATCH`.
34. PASS — Bloquea bootstrap/preparing.
35. PASS — Bloquea migración en progreso.
36. PASS — Ignora attempts completados.
37. PASS — Ejecuta T18 antes de permitir CRUD.
38. PASS — Permite solo T18 `SchemaOk` sin items.
39. PASS — Bloquea `SCHEMA_DRIFT`.
40. PASS — Bloquea `SCHEMA_DRIFT_CRITICAL`.
41. PASS — Bloquea `VALIDATION_INCONCLUSIVE`.
42. PASS — Bloquea `VERSION_INCOMPATIBLE` T18.
43. PASS — Bloquea `REQUIRES_REVIEW`.
44. PASS — Falla cerrado ante excepción inesperada.
45. PASS — No ejecuta DDL.
46. PASS — No provisiona.
47. PASS — No migra.
48. PASS — No repara.
49. PASS — No actualiza `CheckAppSchemaState`.
50. PASS — No escribe `CheckAppSchemaHistory`.
51. PASS — No crea attempts.
52. PASS — No usa cache permisiva.
53. PASS — Reevaluación detecta cambios de drift.
54. PASS — Hash esperado se toma del contrato T15.
55. PASS — Versión soportada se toma de provider T14/T15.
56. PASS — DatabaseIdentity se resuelve desde SQL metadata.
57. PASS — Cliente no puede suplir versión.
58. PASS — Cliente no puede suplir identidad.
59. PASS — Cliente no puede suplir hash.
60. PASS — Base compartida se evalúa por identity+scope.
61. PASS — Datos siguen filtrándose por `idEmpresa` en CRUD existente.
62. PASS — Controller conserva validaciones de request existentes.
63. PASS — Controller registra bloqueos con identity saneada.
64. PASS — Controller no registra cadena SQL.
65. PASS — Mensajes 503 son operativos y no técnicos.
66. PASS — `SCHEMA_PREPARING` informa preparación temporal.
67. PASS — `MIGRATION_IN_PROGRESS` informa actualización temporal.
68. PASS — `SCHEMA_EMPTY` informa módulo no preparado.
69. PASS — `SCHEMA_OUTDATED` informa actualización requerida.
70. PASS — `SCHEMA_FUTURE` informa app incompatible.
71. PASS — `SCHEMA_UNKNOWN` informa compatibilidad no confirmada.
72. PASS — `MANIFEST_HASH_MISMATCH` informa compatibilidad no confirmada.
73. PASS — `VALIDATION_INCONCLUSIVE` informa validación temporal.
74. PASS — `DATABASE_IDENTITY_INVALID` informa base no validable.
75. PASS — `TENANT_CONTEXT_INVALID` informa empresa activa no resoluble.
76. PASS — API compila.
77. PASS — Tests específicos T20 pasan.
78. PASS — Suite API completa pasa.
79. PASS — MVC compila.
80. PASS — `git diff --check` pasa.
81. PASS — Secret scan T20 pasa con falso positivo `ApiKey` sin valor secreto literal.
82. PASS — CheckAppErp BEFORE compatible.
83. PASS — CheckAppErp BEFORE `CurrentVersion=1`.
84. PASS — CheckAppErp BEFORE hash V1 coincide.
85. PASS — CheckAppErp BEFORE `SchemaOk`.
86. PASS — CheckAppErp BEFORE drift 0.
87. PASS — Fixture drift usa índice no PK/no UNIQUE/no FK.
88. PASS — Gate bloquea durante drift real.
89. PASS — Bloqueo real devuelve `SCHEMA_DRIFT`.
90. PASS — Bloqueo real conserva `ReferenceId`.
91. PASS — Índice restaurado a forma contractual.
92. PASS — CheckAppErp AFTER compatible.
93. PASS — CheckAppErp AFTER `CurrentVersion=1`.
94. PASS — CheckAppErp AFTER hash V1 intacto.
95. PASS — CheckAppErp AFTER `SchemaOk`.
96. PASS — CheckAppErp AFTER drift 0.
97. PASS — No se creó V2 ni se adelantó T21.
98. PASS — Listo para QA/cierre del Product Owner.

## Dictamen

TICKET 20 IMPLEMENTADO Y CERTIFICADO — GATE SERVER-SIDE DE COMPATIBILIDAD DE PRODUCTOSSERVICIOS OPERATIVO — CRUD PERMITIDO ÚNICAMENTE CON DATABASEIDENTITY + SCOPE COMPATIBLES — ESTADOS EMPTY/PARTIAL/OUTDATED/FUTURE/UNKNOWN/DRIFT/PREPARING/MIGRATING BLOQUEADOS DE FORMA CONTROLADA — CHECKAPPERP V1 / SCHEMA_OK CONFIRMADA COMO ALLOW — RESPUESTAS HTTP/MVC SANEADAS — SIN DDL, MIGRACIÓN NI REPARACIÓN DESDE EL GATE — SIN ADELANTAR T21 — LISTO PARA QA/Cierre DEL PRODUCT OWNER.
