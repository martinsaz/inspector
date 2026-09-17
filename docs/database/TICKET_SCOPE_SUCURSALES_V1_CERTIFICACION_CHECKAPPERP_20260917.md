# TICKET SCOPE SUCURSALES V1 - CERTIFICACION CHECKAPPERP

Fecha: 2026-09-17

## Alcance

Certificacion SQL real del scope tecnico `Sucursales` en `CheckAppErp`, cubriendo `04003100` ABC Sucursales, `04004000` Razones Sociales y `04005000` Regiones.

T25 permanece `FROZEN`. No se modificaron Firebase, Hosting, Conexiones, bases T25, SuperAdmin ni credenciales persistidas.

## Identidad y contrato

- DB real: `CheckAppErp`
- DatabaseIdentity saneada: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`
- Scope: `Sucursales`
- Version vigente: `1`
- ManifestHash V1: `ec4db55d8080444f75d6689abd8602eaeb86975d7d723d0c67e33590f612c03c`
- Contrato: 3 tablas, 40 columnas, 7 indices, 2 foreign keys, 0 checks
- Tablas: `dbo.RazonesSociales`, `dbo.Sucursales`, `dbo.Zonas`

## Bootstrap, idempotencia y gate

- Primera corrida efectiva despues de corregir el probe de scopes pequenos: `Empty / NO_SCOPE_TABLES_FOUND`
- Bootstrap V1: `PROVISIONED / PASS`
- Control T14: `CheckAppSchemaState`, `CheckAppSchemaHistory` y `CheckAppSchemaAttempts`
- State final: `CurrentVersion=1`, manifest V1 vigente
- History final: ultimo resultado `PROVISIONED / PASS`
- Validacion T18 final: `SchemaOk`, drift `0`
- Objetos detectados: 3 tablas, 40 columnas, 7 indices, 2 foreign keys, 0 checks
- Gate T20 final: `COMPATIBLE`
- Segunda ejecucion: `NoProvision / ALREADY_PROVISIONED`
- DDL adicional: NO
- Duplicados: NO

## Drift real controlado

- Objeto: `dbo.Zonas.IX_Zonas_Empresa_Nombre`
- Drift detectado: `INDEX_MISSING`
- Gate durante drift: bloqueado por `SCHEMA_DRIFT`
- Auto-reparacion del validador: NO
- Restauracion: PASS
- Estado final post-restauracion: `SchemaOk`, drift `0`, gate `COMPATIBLE`

## Locking, CRUD y multitenant

- Lock A adquirido: PASS
- Lock B mientras A retenia: bloqueado por timeout, PASS
- Lock B despues de liberar A: PASS
- Locks simultaneos sobre el mismo `DatabaseIdentity + Scope`: NO
- Region fixture: PASS
- Razon social fixture: PASS
- Sucursal fixture: PASS
- Empresa A ve datos de empresa B: NO
- Empresa A modifica datos de empresa B: NO
- Empresa A relaciona razon social de B: NO
- Empresa A relaciona region de B: NO
- Fixtures remanentes `MOKA_QA_%`: `0`

## Seguridad y secretos

- La credencial temporal autorizada se uso solo para la ejecucion SQL real.
- No se persistio en codigo, `appsettings`, documentos, reportes ni scripts del repo.
- Runner temporal externo al repo eliminado al terminar.
- Busquedas de secreto en `inspector` e `inspectorapi`: sin hits.

## Correcciones aplicadas durante certificacion

1. `SqlDatabaseSchemaProbe` ahora registra siempre los 20 parametros declarados por el query. Antes, scopes con menos de 20 tablas podian fallar como `UNAVAILABLE` por parametros SQL faltantes.
2. `SqlSchemaPhysicalSnapshotReader` ya no calcula objetos extra con prefijo fijo `ProductosServicios%`; usa prefijo por scope (`Sucursales%` para este contrato). Antes, la validacion de `Sucursales` podia marcar falsos extras por objetos de ProductosServicios.

## Cierre final de bloqueos

### AuthZ real

- Fuente real Roles/Permisos: `db_a883c3_checklist`
- `dbo.Usuarios`: disponible
- `dbo.Roles`: disponible
- Separacion preservada: `CheckAppErp` contiene schema/datos del vertical; identidad y permisos permanecen en fuente legacy autorizada.
- `04003100` ABC Sucursales: certificado
- `04004000` Razones Sociales: certificado
- `04005000` Regiones: certificado
- `04000000` Ajustes y `04003000` Sucursales: agrupadores solo Acceso
- Padre concede hijos: NO
- NOAUTH: fail-closed
- NOACCESS: bloqueado
- READONLY: READ permitido y WRITE bloqueado
- WRITE: READ y WRITE permitidos
- ABC-only no concede Razones/Regiones
- Razones-only no concede ABC/Regiones
- Regiones-only no concede ABC/Razones
- Fixtures AuthZ residuales: `0`
- Roles productivos modificados permanentemente: NO

Correccion aplicada: `ProductosServiciosAuthorizationService` resuelve la fuente de autorizacion desde `ProductosServicios:AuthorizationConnectionString`, `ConnectionStrings:AuthorizationSqlServer` o `ConnectionStrings:CadenaConexionSQLServer`, y no desde la base tenant cuando existe fuente autorizada configurada.

API directa: los endpoints legacy usados por las tres pantallas ahora ejecutan `SucursalesScopeRequestContextResolver` antes de SQL de negocio.

### ProductosServicios CheckAppErp V1 -> V2

- Version final: `2`
- ManifestHash V2: `1b5c75e4b44fcfcb3af4219660095ddb2a99419db8da300aff6e4a38c731a705`
- Migracion: `PS-M20260916-V1-V2-DESCRIPCIONES-NVARCHAR-MAX`
- `ProductosServiciosCategorias.Descripcion`: `NVARCHAR(MAX) NULL`
- `ProductosServiciosMarcas.Descripcion`: `NVARCHAR(MAX) NULL`
- `ProductosServiciosColecciones.Descripcion`: `NVARCHAR(MAX) NULL`
- Datos preservados: SI
- T18 final: `SchemaOk`
- DriftCount final: `0`
- T20 final: `COMPATIBLE`
- History `MIGRATED/PASS`: `1`
- Segunda ejecucion: sin DDL adicional, sin `MIGRATED` duplicado

### Regresion Sucursales post V2

- Scope: `Sucursales`
- CurrentVersion: `1`
- ManifestHash V1: `ec4db55d8080444f75d6689abd8602eaeb86975d7d723d0c67e33590f612c03c`
- T18 final: `SchemaOk`
- DriftCount final: `0`
- Gate final: `COMPATIBLE`
- Reprovisionado: NO

## QA final

- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`: PASS 406/406
- `dotnet build inspectorapi/checklistWs/checklistWs.csproj --no-restore --verbosity minimal`: PASS con warnings legacy
- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`: PASS con warnings legacy
- `node --check` JS Sucursales/Razones/Regiones/RolesPermisos/admin catalogos: PASS
- `git diff --check` API/MVC: PASS

## Dictamen

PATRON CHECKAPP COMPLETO CERTIFICADO EN ABC SUCURSALES / RAZONES SOCIALES / REGIONES. AuthZ MVC/API queda certificada contra la fuente real `db_a883c3_checklist`; `Scope=Sucursales` V1 permanece `SchemaOk` / `COMPATIBLE` en `CheckAppErp`; ProductosServicios quedo migrado V1 -> V2 en `CheckAppErp` y finaliza `SchemaOk`, `DriftCount=0`, `COMPATIBLE`. Sin fixtures, locks ni secretos residuales. T25 permanece `FROZEN`.
