# LP-03 - API + Motor de Resolucion de Precios V1 Lista de Precios CheckApp

Fecha: 2026-09-28  
Estado: CERRADO / PASS TECNICO API + SQL REAL CHECKAPPERP  
Scope: `ListaPrecios`  
Version: V1  
ManifestHash: `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`

## 1. Alcance ejecutado

LP-03 implementa exclusivamente la capa backend de Lista de Precios sobre Schema V1 certificado por LP-02:

- API tecnica de Lista de Precios.
- Motor server-side de resolucion de precio efectivo.
- CRUD tecnico de precios por identidad vendible.
- Lectura de listas y precios por producto/servicio.
- Validaciones tenant-first y fail-closed.
- Validacion exacta Variante -> Producto y PresentacionVenta -> Producto.
- QA unitaria y SQL real CheckAppErp con fixtures reversibles.

No se implemento UI, menu, permisos nuevos, Auth, consumidores de Ventas/Cotizaciones/Pedidos/Facturacion, backlog, tickets LP posteriores, Legacy, ni cambios de schema V1.

## 2. Archivos implementados

API:

- `inspectorapi/checklistWs/Controllers/ListaPrecios/ListaPreciosController.cs`
- `inspectorapi/checklistWs/Services/Tenant/ListaPreciosModels.cs`
- `inspectorapi/checklistWs/Services/Tenant/ListaPreciosService.cs`

Tests:

- `inspectorapi/checklistWs.Tests/Services/Tenant/ListaPreciosServiceTests.cs`

Docs:

- `inspector/docs/lista-precios/LP_03_API_MOTOR_RESOLUCION_PRECIOS_20260928.md`

Contexto sincronizado:

- `inspectorapi/AGENTS.md`
- `inspectorapi/CLAUDE.md`
- `inspector/AGENTS.md`
- `inspector/CLAUDE.md`

## 3. API tecnica V1

Controlador: `api/ListaPrecios`.

Endpoints:

| Metodo | Ruta | Uso |
|---|---|---|
| `GET` | `/api/ListaPrecios/Listas` | Lee listas activas del tenant. |
| `GET` | `/api/ListaPrecios/PreciosProducto?idProductoServicio=...` | Lee precios tecnicos asociados al producto/servicio. |
| `POST` | `/api/ListaPrecios/Resolver` | Resuelve precio efectivo. |
| `POST` | `/api/ListaPrecios/GuardarPrecio` | Crea, actualiza o reactiva precio tecnico. |
| `POST` | `/api/ListaPrecios/BajaPrecio/{idPrecio}` | Baja logica de precio tecnico. |

El tenant efectivo se resuelve desde contexto firmado/proxy existente. `idEmpresa` de cliente solo se acepta como consistencia defensiva; si no coincide, la operacion falla con 403. La API no acepta connection strings, empresa alterna, database, server ni password desde query.

AuthZ usa el mecanismo existente de ProductosServicios para lectura/escritura, sin crear roles, permisos, menu ni codigos nuevos. LP-04/PO debera decidir permisos navegables definitivos.

## 4. Motor de resolucion

Regla de lista:

- Nivel valido: 1..10.
- Nivel nulo, menor a 1 o mayor a 10: usa nivel 1 y reporta `LISTA_DEFAULT`.
- Si la lista seleccionada no tiene precio activo, no busca listas de menor prioridad.

Producto:

- Requiere `Tipo=Producto`, tenant correcto y activo.
- Precio especifico activo gana.
- Sin precio especifico: fallback a `ProductosServicios.PrecioPublico`.

Servicio:

- Requiere `Tipo=Servicio`, tenant correcto y activo.
- No admite variante ni presentacion.
- Precio especifico activo gana.
- Sin precio especifico: fallback a `ProductosServicios.PrecioPublico`.

Variante:

- Requiere producto base `Tipo=Producto`, tenant correcto y activo.
- La variante debe existir, estar activa y pertenecer exactamente al producto solicitado.
- Variante de otro producto, otro tenant, servicio o inactiva falla cerrada.
- Precio especifico activo gana.
- Sin precio especifico: fallback a `ProductosServiciosVariantes.PrecioPublico`; si es null, fallback a `ProductosServicios.PrecioPublico`.

PresentacionVenta:

- Requiere producto base `Tipo=Producto`, tenant correcto y activo.
- La presentacion debe existir, estar activa y pertenecer exactamente al producto solicitado.
- Presentacion de otro producto, otro tenant, servicio o inactiva falla cerrada.
- Precio especifico activo gana.
- Sin precio especifico: fallback a `ProductosServiciosPresentacionesVenta.Precio`.

General:

- Variante + PresentacionVenta en una misma solicitud: `FUERA_DE_V1`.
- `Precio=0.00` configurado es valido y no activa fallback.
- Detalle inexistente, inactivo o archivado equivale a no configurado.
- Precio negativo se rechaza.
- No hay borrado fisico desde API; baja es logica.

## 5. Escritura tecnica

`GuardarPrecio` normaliza nivel, valida identidad vendible activa y delega al repositorio SQL:

- Crea lista tecnica del nivel si no existe para el tenant.
- Inserta precio nuevo si no existe detalle.
- Actualiza precio activo existente si existe.
- Reactiva detalle archivado/inactivo de la misma identidad si aplica.
- Rechaza duplicidad activa por misma lista + identidad.

La escritura mantiene `idEmpresa` server-side y no expone entidades SQL como DTOs.

## 6. QA unitaria

Comando ejecutado:

```bash
dotnet test /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --filter ListaPreciosServiceTests --no-restore -v quiet
```

Resultado:

- PASS: 23/23.
- Fallas: 0.
- Omitidas: 0.

Cobertura:

- Producto: precio lista, fallback, precio 0, baja logica.
- Servicio: precio lista, fallback, rechazo con variante.
- Variante: precio lista, fallback a variante, fallback a producto, otro producto, inactiva.
- PresentacionVenta: precio lista, fallback, otro producto.
- Cross-tenant fail closed.
- Nivel invalido -> lista default.
- Lista seleccionada sin precio -> fallback sin buscar otra lista.
- Variante + PresentacionVenta -> fuera de V1.
- Precio negativo rechazado.
- Reactivacion de detalle archivado.
- Duplicidad activa rechazada.
- TipoIdentidad inconsistente con llaves rechazado.

## 7. QA SQL real CheckAppErp

Base verificada:

- DatabaseIdentity: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`
- StateVersion: `1`
- StateHash: `d4f0bbdc05f56c96026d6364f9c333799ccb0ddc9acdf8993fe040b92b48ce7e`
- Drift inicial: `SchemaOk`, items `0`
- Gate inicial: `COMPATIBLE`

Runner temporal:

- Proyecto temporal fuera del repo en `/tmp/lp03-runner.*`.
- Connection string QA leida desde contrato autorizado previo.
- No se imprimio, persistio ni documento la credencial.
- No se ejecuto bootstrap DDL.

Checks SQL real:

| Check | Resultado |
|---|---|
| Producto precio lista | PASS |
| Servicio precio lista | PASS |
| Variante precio lista | PASS |
| PresentacionVenta precio lista | PASS |
| Precio 0 sin fallback | PASS |
| Producto fallback | PASS |
| Servicio fallback | PASS |
| Baja logica -> fallback | PASS |
| Lista invalida -> default | PASS |
| Lista seleccionada sin precio no busca otro nivel | PASS |
| Variante fallback | PASS |
| PresentacionVenta fallback | PASS |
| Cross-tenant producto | PASS |
| Variante otro producto | PASS |
| Presentacion otro producto | PASS |
| Variante inactiva | PASS |
| Presentacion inactiva | PASS |
| Variante + Presentacion fuera de V1 | PASS |
| Servicio con variante | PASS |
| Precio negativo rechazado | PASS |
| Reactivacion misma identidad | PASS |
| Lectura listas | PASS |
| Lectura precios producto | PASS |

Cleanup:

- Residuos fixtures LP: `0`
- Soporte ProductosServicios fixture: `0`
- Listas fixture: `0`
- Detalles fixture: `0`

Estado final SQL real:

- Drift final: `SchemaOk`
- DriftItems final: `0`
- Gate final: `COMPATIBLE`

## 8. Regresiones ejecutadas

Comandos ejecutados al cierre:

```bash
dotnet test /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --filter ListaPreciosServiceTests --no-restore -v quiet
dotnet test /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs.Tests/checklistWs.Tests.csproj --no-restore -v quiet
dotnet build /Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/checklistWs.csproj --no-restore -v quiet
dotnet build /Users/denissemendiola/dev/Inspecciones/inspector/checklist/checklist.csproj --no-restore -v quiet
git -C /Users/denissemendiola/dev/Inspecciones/inspectorapi diff --check
git -C /Users/denissemendiola/dev/Inspecciones/inspector diff --check
```

Resultados:

- Pruebas LP-03 enfocadas: PASS 23/23.
- Suite completa: PASS 568/568.
- Build API: PASS.
- Build MVC: PASS.
- SQL real CheckAppErp: PASS.
- Diff check API/MVC: PASS.
- Secret scan diff: PASS, sin connection string ni password en diff.
- `MOKA_CHECKAPPERP_QA_CONNECTION`: cleared, longitud `0`.

Warnings observados: paquetes vulnerables/compatibilidad `NU1902`/`NU1701` preexistentes en proyectos API/MVC; sin errores de compilacion ni pruebas.

## 9. Limites y handoff PO

LP-03 deja lista la capa tecnica para revision PO. Quedan fuera de esta ejecucion:

- UI de Lista de Precios.
- Menu.
- Roles/permisos nuevos.
- Consumo desde Ventas, Cotizaciones, Pedidos o Facturacion.
- Bulk UI/importadores.
- Backlog o tickets LP-04+.
- Decisiones funcionales no aprobadas por PO.

Siguiente estado permitido:

`REVISIÓN PO — NO EJECUTAR LP-04`

## 10. Matriz #MOKA LP-03

| Item | Resultado | Evidencia |
|---|---|---|
| AGENTS/CLAUDE MVC/API leidos | OK | Reglas vigentes aplicadas antes de editar. |
| Contrato LP-03 leido completo | OK | Scope limitado a API + motor V1. |
| Schema V1 modificado | NO | Sin cambios de contrato SQL LP-02. |
| API tecnica | OK | `ListaPreciosController`. |
| Motor resolucion | OK | `ListaPreciosService`. |
| Validacion Variante -> Producto | OK | Fail-closed en servicio. |
| Validacion PresentacionVenta -> Producto | OK | Fail-closed en servicio. |
| Tenant server-side | OK | Tenant firmado + descriptor server-side. |
| Precio 0 | OK | Resuelve `PRECIO_LISTA`, sin fallback. |
| Fallbacks | OK | Producto/Servicio/Variante/Presentacion cubiertos. |
| Baja logica/reactivacion | OK | Sin hard delete API. |
| Pruebas unitarias | PASS | 23/23. |
| SQL real CheckAppErp | PASS | Identidad esperada, checks PASS, cleanup 0. |
| Drift/Gate | PASS | `SchemaOk/0`, `COMPATIBLE`. |
| UI/Menu/Auth/Permisos/Legacy | NO EJECUTADO | Fuera de alcance LP-03. |
| Backlog/LP-04 | NO EJECUTADO | Requiere autorizacion PO. |

LP-03 = CERRADO / PASS TECNICO API + SQL REAL CHECKAPPERP.
