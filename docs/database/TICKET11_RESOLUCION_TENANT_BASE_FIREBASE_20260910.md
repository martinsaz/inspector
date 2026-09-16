# TICKET 11 - Resolucion tenant a base SQL desde Firebase

Fecha: 2026-09-10

## Objetivo

Resolver para ProductosServicios la base SQL efectiva desde el contexto tenant autorizado en Firebase, usando `Conexiones/{EmpresaKey}` como fuente oficial. El cambio elimina del vertical el uso de la conexion fija `ConnectionStrings:CadenaConexionSQLServer` cuando hay contexto tenant firmado.

## Problema anterior

ProductosServicios validaba `idEmpresa` y filtraba por `idEmpresa`, pero `CreateConnection()` abria la conexion legacy de `SqlConnectionFactory`. El resultado posible era `idEmpresa` correcto contra base incorrecta.

## Arquitectura implementada

Flujo actual:

1. MVC resuelve `idEmpresa` y `empresa` desde sesion/claims.
2. MVC firma el contexto con HMAC y lo envia a API mediante headers internos.
3. API valida firma, vigencia, `empresa` e `idEmpresa`.
4. API consulta Firebase en modo read-only usando lookup exacto `Conexiones/{EmpresaKey}`.
5. API valida `Status == 1`, `idEmpresa` de Firebase y cadena SQL utilizable.
6. API abre SQL con `TenantSqlConnectionFactory`.
7. ProductosServicios conserva los filtros `WHERE idEmpresa`.

## Componentes

- API: `Services/Tenant/ITenantConnectionReader`.
- API: `Services/Tenant/FirebaseTenantConnectionReader`.
- API: `Services/Tenant/ITenantDatabaseResolver`.
- API: `Services/Tenant/TenantDatabaseResolver`.
- API: `Services/Tenant/ITenantSqlConnectionFactory`.
- API: `Services/Tenant/TenantSqlConnectionFactory`.
- API: `ProductosServiciosController` usa `RequestContext.TenantDatabase` para abrir conexiones.
- MVC: `ProductosServiciosController` deja de usar query string como fallback de tenant y filtra campos tenant en multipart.

## Manejo Firebase

Firebase sigue siendo la fuente oficial de tenant. El resolver lee `Conexiones/{EmpresaKey}` directamente y no consulta `Hosting`, no itera la primera conexion activa, no usa `Contains` y no crea catalogos SQL paralelos.

La operacion es read-only. No se escribe `Usuarios`, `Conexiones`, `Hosting`, `Status`, `idEmpresa`, `Cadena`, `BootstrapCompleto` ni `BootstrapIds`.

## Validacion empresa/idEmpresa

La API falla cerrado cuando:

- falta contexto tenant;
- no existe `Conexiones/{EmpresaKey}`;
- `Status` no es `1`;
- `idEmpresa` de Firebase no es GUID valido;
- `idEmpresa` firmado no coincide con `Conexiones/{EmpresaKey}.IdEmpresa`;
- la configuracion SQL no tiene servidor/base utilizables;
- Firebase no esta disponible.

No hay correccion silenciosa ni fallback a la conexion fija.

## Factory tenant

`SqlConnectionFactory` legacy se conserva para otros consumidores. ProductosServicios usa `TenantSqlConnectionFactory`, registrada como scoped y sin estado mutable global. El resolver y el reader tambien se registran como scoped.

## Integracion ProductosServicios

Todas las rutas SQL del controlador fueron auditadas para usar `CreateConnection(context)`: listado, detalle, ficha tecnica, PDF, combos, SAT con guardado tag, categorias, marcas, unidades, colecciones, paquetes, atributos, valores, presentaciones, variantes, multimedia e inventario.

Las reglas de negocio existentes no cambiaron. El ticket no modifica precios, inventario, variantes, atributos, presentaciones, fiscal, logistica, multimedia, PDF ni Vista Previa.

## Errores y seguridad

Los errores de resolucion tenant responden con mensajes genericos sin servidor, base, usuario SQL, password, token ni connection string.

- Sin contexto: `401`.
- Contexto no autorizado, tenant inexistente, inactive, mismatch o cadena invalida: `403`.
- Firebase/resolucion no disponible: `503`.
- SQL no disponible por conectividad/autenticacion/base inaccesible: `503`.
- Errores internos reales: `500`.

Logs nuevos: categoria de error, `EmpresaKey` saneado, `idEmpresa`, operacion. No se loguea connection string, password, token, Firebase secret ni cadena base64.

## QA

Automatizado:

- `dotnet test inspectorapi/checklistWs.sln --verbosity minimal`
- Resultado: 10 pruebas superadas, 0 fallas.
- Cobertura: lookup exacto por `EmpresaKey`, tenant inexistente, mismatch `idEmpresa`, status inactivo, cadena invalida, dos tenants misma DB, dos tenants DB distinta/concurrente, fallo Firebase/readers sin fallback.

Build:

- `dotnet build inspectorapi/checklistWs/checklistWs.csproj`: PASS.
- `dotnet build inspector/checklist/checklist.csproj`: PASS.

Warnings:

- Persisten warnings legacy de paquetes, compatibilidad y nulabilidad ya existentes en ambos proyectos.
- No se detectaron errores nuevos.

QA real con cuenta 163:

- No se levanto servidor local en este cierre.
- No habia listeners preexistentes en 5200 ni 5127 al revisar.
- La validacion funcional en navegador queda lista para QA manual del Product Owner.

## Resultados

1. T11 implementado: PASS.
2. Alcance limitado a T11: PASS.
3. Nueva planeacion realizada: NO.
4. T12 adelantado: NO.
5. T13 adelantado: NO.
6. T14+ adelantados: NO.
7. Firebase escrito: NO.
8. Hosting modificado: NO.
9. SQL/schema/datos modificados: NO.
10. ConnectionString enviada al navegador: NO.
11. ConnectionString recibida por API desde cliente: NO.
12. Fallback fijo en ProductosServicios: NO.
13. Base compartida soportada: PASS por prueba automatizada.
14. Multibase soportado: PASS por prueba automatizada.
15. Contexto concurrente aislado: PASS por prueba automatizada.

## Archivos creados

- `inspectorapi/checklistWs/Services/Tenant/TenantDatabaseResolution.cs`
- `inspectorapi/checklistWs/Services/Tenant/FirebaseTenantConnectionReader.cs`
- `inspectorapi/checklistWs/Services/Tenant/TenantDatabaseResolver.cs`
- `inspectorapi/checklistWs/Services/Tenant/TenantSqlConnectionFactory.cs`
- `inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj`
- `inspectorapi/checklistWs.Tests/Services/Tenant/TenantDatabaseResolverTests.cs`
- `inspector/docs/database/TICKET11_RESOLUCION_TENANT_BASE_FIREBASE_20260910.md`

## Archivos modificados

- `inspectorapi/checklistWs/Controllers/ProductosServicios/ProductosServiciosController.cs`: usa resolver tenant y factory tenant para todas las conexiones del vertical.
- `inspectorapi/checklistWs/Program.cs`: registra servicios scoped tenant.
- `inspectorapi/checklistWs.sln`: agrega proyecto de pruebas.
- `inspector/checklist/Controllers/ProductosServicios/ProductosServiciosController.cs`: elimina fallback tenant desde query y filtra campos tenant en multipart.
- `inspector/AGENTS.md`, `inspector/CLAUDE.md`, `inspectorapi/AGENTS.md`, `inspectorapi/CLAUDE.md`: registran estado T11.

## Limitaciones

T11 no instala schema en bases vacias, no migra bases atrasadas y no valida estructura fisica completa. Si una empresa resuelve correctamente a una base sin tablas ProductosServicios, el sistema llegara a la base autorizada y fallara de forma controlada por falta de estructura. Eso corresponde a T16/T17/T18.

## Pendientes T12+

- DatabaseIdentity y agrupacion formal.
- Clasificador de bases.
- State/History/Attempts.
- Contrato versionado de tablas ProductosServicios.
- Bootstrap automatico.
- Migraciones secuenciales.
- Validador fisico completo.
- Locking/gate de compatibilidad.
- Certificacion integral multitenant.

## Dictamen

TICKET 11 IMPLEMENTADO DENTRO DE SU ALCANCE - PENDIENTES DEL MOTOR MULTITENANT CONTINUAN EN T12+ - LISTO PARA QA MANUAL DEL PRODUCT OWNER.
