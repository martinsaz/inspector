# LP-07 - Schema y Versionado Comercial V2 Lista de Precios

Fecha: 2026-09-29  
Estado: HOTFIX MIGRACION LP-07R4 / SQL REAL CHECKAPPERP CERTIFICADO  
Scope: `ListaPrecios`

## 1. Decision de versionado

La evolucion comercial aprobada en LP-06 + LP-06R requiere una sola version nueva: V2.

No se crea V3 porque precio, descuento, redondeo, vigencia, historico minimo y estructura promocional extensible cerrada caben en una migracion compatible V1 -> V2. Crear V3 seria artificial y aumentaria superficie de migracion sin contrato adicional.

Baseline congelado:

- V1 Version: `1`
- V1 Hash esperado: `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`
- V1 Hash local verificado por manifest provider: `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`
- V1 preservado: si, pedible explicitamente con `GetContract("ListaPrecios", 1)`

Nueva version:

- V2 Version: `2`
- V2 Hash real: `e7a388ec985a19fb2b3beb73e8c2cf28d5dda17d3f3bb2f0363683c166092882`
- MigrationId: `LP-M20260929-V1-V2-COMERCIAL`
- Release: `LP-B20260928`

## 2. Modelo fisico V2

`ListaPreciosListas` permanece sin cambios.

`ListaPreciosDetalle` conserva la semantica V1:

- `Precio DECIMAL(18,2) NOT NULL`
- `0.00` sigue siendo precio configurado valido.
- `NULL` no se introduce para precio.
- Fila inexistente sigue representando no configurado/fallback.
- No se agrega `PrecioFinal`; LP-07 no crea segunda fuente de verdad.

Columnas comerciales nuevas:

- `DescuentoPct DECIMAL(5,2) NULL`
- `RedondeoModo TINYINT NOT NULL DEFAULT 0`
- `VigenciaInicio DATE NULL`
- `VigenciaFin DATE NULL`

Constraints:

- `CK_ListaPreciosDetalle_DescuentoPct`: `NULL` o rango `0..100`.
- `CK_ListaPreciosDetalle_RedondeoModo`: `0` sin redondeo, `1` a 4/9, `2` solo a 9.
- `CK_ListaPreciosDetalle_Vigencia`: inicio menor o igual a fin cuando ambas fechas existen.

## 3. Promociones

Se agrega `ListaPreciosPromociones` como estructura normalizada y extensible, sin implementar motor promocional.

Soportado estructuralmente:

- `TipoPromocion = 1`: 2x1.
- `TipoPromocion = 2`: 3x2.
- `TipoPromocion = 3`: descuento segundo.
- `DescuentoSegundoPct` obligatorio para tipo 3, rango `0..100`.

No implementado:

- Monedero funcional.
- saldo, movimientos, generacion, consumo o redencion de monedero.
- prioridad, acumulabilidad, sucursal, agrupaciones, mezcla de identidades, multiplos o segundo producto exacto.

La tabla conserva identidad vendible separada: Producto, Servicio, Variante y PresentacionVenta. No inventa combinacion Variante + PresentacionVenta.

## 4. Historico minimo

Se agrega `ListaPreciosHistorial` para soporte audit-ready minimo:

- `idEmpresa`
- identidad vendible y lista cuando aplique
- `Campo`, `Operacion`, `ValorAnterior`, `ValorNuevo`
- `idUsuario`, `Usuario`
- `Origen`
- `CorrelationId`
- `Motivo`
- `FechaUtc`

Origen permitido:

- `INDIVIDUAL`
- `MASIVO`
- `COPIA_LISTA`
- `DESCUENTO_MARCA`
- `PROMOCION`
- `SISTEMA`

LP-18 mantiene el historico completo futuro.

## 5. Migracion

La migracion oficial V1 -> V2 esta registrada en `ProductosServiciosMigrationPackageProvider`.

Propiedades:

- Usa el runner oficial de schema/migration.
- Depende del hash V1 congelado.
- Agrega columnas nuevas sin tocar `Precio`.
- Crea tablas nuevas para promociones e historial.
- No fabrica descuentos, promociones ni redondeos operativos.
- No copia Legacy `P1..P10` ni `D1..D10`.
- No activa LP-08 ni calculo comercial.

Primera corrida esperada:

- V1 -> V2 con `LP-M20260929-V1-V2-COMERCIAL`.

Segunda corrida esperada:

- `NO_PENDING_MIGRATIONS` / equivalente, sin repetir DDL.

## 6. QA local ejecutada

Comandos ejecutados:

```bash
dotnet test checklistWs.Tests/checklistWs.Tests.csproj --filter ListaPreciosSchemaContractTests --no-restore -v quiet
dotnet test checklistWs.Tests/checklistWs.Tests.csproj --filter SchemaMigrationEngineTests --no-restore -v quiet
dotnet test checklistWs.Tests/checklistWs.Tests.csproj --filter ListaPreciosServiceTests --no-restore -v quiet
dotnet build checklistWs/checklistWs.csproj --no-restore -v quiet
dotnet build inspector/checklist/checklist.csproj --no-restore -v quiet
```

Resultados:

- `ListaPreciosSchemaContractTests`: PASS 12/12.
- `SchemaMigrationEngineTests`: PASS 30/30.
- `ListaPreciosServiceTests`: PASS 23/23.
- Build API: PASS.
- Build MVC: PASS.

Warnings observados: `NU1902`, `NU1701` y warnings nullability legacy preexistentes.

## 7. SQL real

LP-07R4 certifica SQL real CheckAppErp despues del hotfix quirurgico del package oficial.

Defecto LP-07R3 reproducido:

- MigrationId: `LP-M20260929-V1-V2-COMERCIAL`.
- Defecto: SQL Server reporto columnas invalidas `DescuentoPct`, `RedondeoModo`, `VigenciaInicio`, `VigenciaFin`.
- Causa raiz: el batch agregaba columnas y despues compilaba constraints dependientes en el mismo batch.
- Hotfix: constraints, indices y FKs dependientes se ejecutan con `EXEC(N'...')` bajo las mismas guardas `IF`; no se usa `GO`.
- Runner: no modificado en LP-07R4.
- Schema V2 funcional: sin cambios.

Certificacion CheckAppErp:

- DatabaseIdentity: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`.
- V1 pre-migracion preservado por guardas oficiales: Version `1`, hash `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`, drift `SchemaOk/0`, gate `SCHEMA_PARTIAL` previo.
- Migracion oficial V1 -> V2 ejecutada por runner oficial; State final Version `2`, hash `e7a388ec985a19fb2b3beb73e8c2cf28d5dda17d3f3bb2f0363683c166092882`.
- Segunda corrida: `NO_PENDING_MIGRATIONS`.
- Final: Classification `Current`, Reason `VERSION_EVIDENCE_CURRENT`, tablas `4/4`, columnas `71`, indices `23`, PK `4`, FK `9`, CHECK `19`.
- Drift final: `SchemaOk`, items `0`.
- Gate final: `COMPATIBLE`, allowed `true`.
- HistoryCount final: `2`.
- AttemptCount final: `5` incluyendo intentos fallidos previos LP-07R3/LP-07R4.
- Fixtures reversibles: producto, servicio, variante, PresentacionVenta, precio >0, precio 0, NULL/fallback, descuento 0/100, descuento negativo/>100 reject, redondeo 0/1/2, redondeo invalido reject, vigencia valida/invalida, duplicidad reject, cross-tenant fail-closed, baja logica, promocion estructural e historico temporal PASS.
- Monedero: `NO_IMPLEMENTADO`.
- Cleanup: listas `0`, detalles `0`, promociones `0`, historico `0`, soporte `0`, residuos `0`.
- Credencial runtime: temporal, no impresa, no persistida.
- UMBRELLA 163: no migrado, no modificado.

## 8. Seguridad y frozen

No se modifico:

- Auth/Login/Firebase/Session/Cookies/Claims.
- `Program.cs`.
- tenant resolver.
- UI ListaPrecios.
- ProductosServicios, Inventario, Sucursales, Curvas, OC, Recepcion, Ventas, Cotizaciones, Facturacion, T25, Reporte Lider o Legacy.

No se persistieron secretos.

LP-07R4 tampoco modifico Auth, Login, Firebase, Session, Cookies, Claims, `Program.cs`, tenant resolver, UI ListaPrecios, ProductosServicios funcional, Inventario, Sucursales, Curvas, OC, Recepcion, Ventas, Cotizaciones, Facturacion, T25, Reporte Lider, Legacy ni UMBRELLA.

## 9. Archivos modificados

API:

- `checklistWs/Services/Tenant/ProductosServiciosSchemaContractProvider.cs`
- `checklistWs/Services/Tenant/ListaPreciosSchemaContractFactory.cs`
- `checklistWs/Services/Tenant/ProductScopeInventory.cs`
- `checklistWs/Services/Tenant/SchemaMigrationModels.cs`

Tests:

- `checklistWs.Tests/Services/Tenant/ListaPreciosSchemaContractTests.cs`
- `checklistWs.Tests/Services/Tenant/SchemaMigrationEngineTests.cs`

Docs:

- `inspector/docs/lista-precios/LP_07_SCHEMA_VERSIONADO_COMERCIAL_20260929.md`

## 10. Handoff LP-08

LP-08 no fue ejecutado.

LP-08 debe implementar calculo/API/UI comercial usando V2 como almacenamiento de configuracion:

- precio base/lista;
- descuento;
- redondeo;
- precio final reproducible;
- promociones cerradas;
- snapshots;
- bloqueo de Monedero hasta definicion PO.

## 11. Regresion LP-07R4

- `SchemaMigrationEngineTests|ListaPreciosSchemaContractTests`: PASS 47/47.
- Full suite API: PASS 584/584.
- Build API: PASS.
- Build MVC: PASS.
- `git diff --check` API/MVC: PASS.
- Secret scan diff API/MVC: PASS; solo aparece el nombre de variable runtime en documentacion historica, sin valor secreto.

## 12. Dictamen

LP-07R4 queda certificado en CheckAppErp.

Dictamen: `CHECKAPPERP V2 CERTIFICADO / HOTFIX MIGRACION PASS / LISTO PARA VALIDACION TENANT`.

Siguiente paso: REVISION PO. NO EJECUTAR LP-08.

## 13. LP-07R5 tenant UMBRELLA 163

LP-07R5 certifica SQL real del tenant funcional UMBRELLA / empresa 163 usando el mecanismo normal de resolucion CheckApp (`FirebaseTenantConnectionReader` + `TenantDatabaseResolver`), sin usar connection string CheckAppErp ni variable runtime externa.

Identidad resuelta:

- EmpresaKey: `163`.
- idEmpresa: `b17aaece-2b78-4e35-b554-9e694eeb15a7`.
- DatabaseIdentity: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.

BEFORE UMBRELLA:

- Classification: `Partial`, Reason `SCOPE_TABLES_INCOMPLETE`, scope tables `2/4`.
- State: Version `1`, hash `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`, LastResult `PROVISIONED/PASS`.
- History: `1`; Attempts: `1`.
- Objects: tablas `2`, columnas `30`, indices `11`, PK `2`, FK `4`, CHECK `7`.
- Drift: `SchemaOk`, items `0`.
- Gate previo: `SCHEMA_PARTIAL`, allowed `false` por inventario V1 contra inventario latest.
- Datos ListaPrecios preservados: listas `2`, detalles `3`, precio cero `1`, activos `0`, inactivos `3`, hash `a820e977be63780ed176ff86507a3bb5833c498e244d567421260496f94274e1`.

Migracion:

- Runner oficial ejecuto `LP-M20260929-V1-V2-COMERCIAL`.
- Resultado primera corrida: `Migrated/MIGRATED`, From `1`, To `2`.
- Segunda corrida: `NoProvision/NO_PENDING_MIGRATIONS`.

AFTER/FINAL UMBRELLA:

- Classification: `Current`, Reason `VERSION_EVIDENCE_CURRENT`, scope tables `4/4`.
- State: Version `2`, hash `e7a388ec985a19fb2b3beb73e8c2cf28d5dda17d3f3bb2f0363683c166092882`, LastResult `MIGRATED/PASS/LP-M20260929-V1-V2-COMERCIAL`.
- History: `2`; Attempts: `2`.
- Objects: tablas `4`, columnas `71`, indices `19`, PK `4`, FK `9`, CHECK `19`.
- Drift final: `SchemaOk`, items `0`.
- Gate final: `COMPATIBLE`, allowed `true`.
- Datos ListaPrecios preservados: hash final `a820e977be63780ed176ff86507a3bb5833c498e244d567421260496f94274e1`, conteos iguales al BEFORE.

QA funcional LP-03 sobre V2:

- Producto: PASS.
- Servicio: PASS.
- Variante: PASS.
- PresentacionVenta: PASS.
- Precio especifico: PASS.
- Precio `0.00`: PASS.
- Lista default: PASS (`LISTA_DEFAULT/FALLBACK_PRECIO_PUBLICO`).
- Baja logica: PASS (`FALLBACK_PRECIO_PUBLICO` tras archivar fixture).
- Cross-tenant fail-closed: PASS (`IDENTIDAD_INVALIDA`).
- Consulta DynamicGrid/filtros/export source data API: PASS.
- Cleanup fixtures LP-07R5: soporte `0`.

Runtime UI:

- Se levantaron temporalmente API `5127` y MVC `5200`, y se intento abrir `/ListaPrecios/Index`.
- Resultado: redirect a `/Login/Index?ReturnUrl=%2FListaPrecios%2FIndex`; no habia sesion autenticada reutilizable en el navegador controlado.
- No se introdujeron credenciales ni se forzo login. Por regla permanente de UI/UX, no se declara PASS visual autenticado.
- Puertos `5200` y `5127` quedaron liberados.

Regresion LP-07R5:

- Runner temporal `/tmp/lp07r5-runner`: build PASS; no se incorporo al repo.
- Full suite API: PASS `584/584`.
- Build API: PASS.
- Build MVC: PASS.
- Warnings: paquetes legacy/vulnerabilidades ya observadas (`NU1902`, `NU1701`, `RestSharp` en MVC) y obsolescencia de `System.Data.SqlClient` solo en runner temporal.

No se modifico:

- Auth/Login/Firebase/Session/Cookies/Claims/Program.cs.
- Tenant resolver.
- CheckAppErp.
- SchemaMigrationRunner.
- UI ListaPrecios, CSS, JS o vistas.
- ProductosServicios funcional.
- LP-05, LP-08, T25, Legacy, BL-03, Curvas, Inventario, OC, Recepcion.

Dictamen LP-07R5: `UMBRELLA SQL V2 CERTIFICADO / MIGRACION OFICIAL PASS / DATOS PRESERVADOS / UI AUTENTICADA PENDIENTE POR SESION`.

## 14. LP-07C saneamiento R8 y cierre filtro Tipo

Fecha: 2026-09-30.

Saneamiento R8:

- Se retiro el hotfix R8 no autorizado de `checklist/wwwroot/js/Utilerias.js`.
- Se retiro el cambio R8 no autorizado de `checklist/Views/Shared/_Layout.cshtml`.
- Validacion posterior: ambos archivos quedaron sin diff local y quedan FROZEN para LP-07C.
- No se corrigio menu global en LP-07C; si vuelve a aparecer incidencia de menu, requiere ticket separado y autorizacion PO explicita.

Diagnostico filtro Tipo:

- MVC `ListaPreciosController.BuildApiUrl()` preserva `tipo` recibido y agrega solo `idEmpresa` resuelto servidor.
- API `ListaPreciosController.Consultar()` enlaza `tipo` y lo pasa a `ListaPreciosConsultaRequest.Tipo`.
- `ListaPreciosService.ConsultarAsync()` conserva `Tipo`.
- `SqlListaPreciosRepository.ConsultarIdentidadesAsync()` aplica `AND Tipo=@Tipo` para Producto/Servicio; variantes y presentaciones pertenecen solo a producto.
- Causa corregida en UI: `Limpiar` no limpiaba de forma robusta el buscador interno del DynamicGrid/DataTables, lo que podia dejar resultados visuales incongruentes aunque el backend respondiera correctamente.

Hotfix LP-07C:

- `ListaPrecios.js` ahora reinicia el buscador interno del grid y el estado `DataTables.search("")`.
- `Buscar` y `Limpiar` usan binding nativo defensivo con guard anti-duplicado para evitar perdida de evento del boton.
- No se agrego filtrado artificial en JS de filas recibidas; el backend sigue siendo la fuente de verdad del filtro `tipo`.

QA runtime autenticada UMBRELLA / empresa 163:

- Login QA exitoso con `denisse@checkapp.com.mx`; no se persistio la contraseña.
- Menu lateral cargado despues de limpiar pestañas duplicadas; se verifico acceso directo a `/ListaPrecios/Index`.
- Todos: `10` filas, `9` Producto, `1` Servicio.
- Servicio: request MVC/API con `tipo=2`, respuesta `1` fila `Cambio de Aceite`, `0` productos.
- Producto: request MVC/API con `tipo=1`, `9` filas producto, `0` servicios.
- Servicio + categoria `Mantenimiento`: request con `tipo=2&idCategoria=...`, respuesta servicio.
- Producto + marca `Mobil 1`: request con `tipo=1&idMarca=...`, respuesta producto.
- Logs MVC confirmaron solicitudes a API con `idEmpresa=b17aaece-2b78-4e35-b554-9e694eeb15a7` y parametros `tipo=1`, `tipo=2`, `idCategoria`, `idMarca` y consulta limpia `nivel=1&estatus=activos`.

Pruebas automatizadas:

- `ListaPreciosServiceTests`: PASS `28/28`.
- Suite API completa: PASS `589/589`.
- Se agregaron pruebas de contrato para:
  - Todos incluye producto y servicio.
  - Producto excluye servicio.
  - Servicio excluye producto y devuelve servicio.
  - Servicio + busqueda preserva tipo.
  - Cross-tenant no devuelve datos.

No se modifico:

- Auth/Login/Firebase/Session/Cookies/Claims/Program.cs.
- Tenant resolver.
- Schema/migraciones/DDL/SQL.
- ProductosServicios.
- `checkapp-ui.js`, `HomeController.BuildMenu`.
- LP-08.

Dictamen LP-07C: `SANEAMIENTO R8 PASS / FILTRO TIPO CERTIFICADO / SQL V2 PRESERVADO / LISTA PRECIOS CIERRE FUNCIONAL`.
