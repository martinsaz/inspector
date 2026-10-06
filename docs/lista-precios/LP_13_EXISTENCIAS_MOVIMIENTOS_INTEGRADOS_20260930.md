# LP-13 - Existencias y movimientos integrados

Fecha: 2026-09-30

Estado: CERRADO / QA VISUAL AUTENTICADA PASS / LISTO HANDOFF LP-14

## 1. Alcance implementado

- `ListaPrecios` consulta `InventarioSaldos` como fuente canonica de existencia.
- La consulta de grid integra una sola agregacion SQL tenant-scoped; no ejecuta una consulta de inventario por fila.
- Producto base y PresentacionVenta usan saldo base (`idVariante IS NULL`).
- Variante usa exclusivamente su `idVariante`.
- Servicio y producto sin `CausaInventario` exponen `N/A` y no habilitan detalle.
- El detalle read-only consulta hasta 100 movimientos reales desde `InventarioMovimientos`, con sucursal, tipo, cantidad base, saldo anterior/posterior, fecha, origen/referencia y observaciones.
- Filtros backend agregados: Sucursal, existencia con/sin y cantidad menor a.
- El grid agrega columna Existencia y accion de inventario. Tabla y cards reutilizan el mismo handler delegado.
- La columna de existencia no se agrega al Excel actual; LP-17 no fue adelantado.

## 2. Fronteras de dominio

- No se creo inventario paralelo ni se persiste stock en ListaPrecios.
- Transito de OC, pendientes de recepcion y curvas no se mezclaron con el saldo operativo: sus fuentes tienen ownership OC/Recepcion/Curvas y no existe un contrato LP-13 que permita combinarlas sin ambiguedad.
- Pedidos no tiene fuente canonica certificada para este alcance.
- Ventas permanece reservado para LP-19.
- No hubo SQL manual, DDL, schema, migraciones, fixtures ni cambios a datos.

| Dato Legacy | Fuente CheckApp | Estado | Implementado LP-13 | Ticket pendiente |
|---|---|---|---|---|
| Existencia por producto | `InventarioSaldos` | Adoptado | Si, read-only | No |
| Existencia por variante | `InventarioSaldos.idVariante` | Adoptado | Si, read-only | No |
| PresentacionVenta | Saldo base del producto; Inventario V1 no dimensiona presentacion | Adaptado | Si, contexto explicito | No |
| Servicio | No causa inventario | No aplica | `N/A`, sin accion | No |
| Sucursal/ubicacion | `Sucursales` + `InventarioSaldos.idSucursal` | Adoptado | Si | No |
| Entradas/salidas/ajustes/reservas | `InventarioMovimientos` | Adoptado | Si, read-only | No |
| Referencia/documento | `OrigenTipo` + `OrigenId` de movimiento | Adoptado | Si | No |
| Transito OC | OC/Recepcion/Curvas, no saldo operativo | Pendiente fuera de alcance | No | Owner OC/Recepcion/Curvas |
| Pedidos | Sin fuente canonica certificada | Pendiente | No | Decision PO |
| Curvas | Dominio Curvas | Pendiente fuera de alcance | No | Owner Curvas |
| Ventas | Ventas | Reservado | No | LP-19 |

## 3. Seguridad y permisos

- Endpoint `GET api/ListaPrecios/Inventario` protegido por el permiso read existente `05001008`.
- No se inventaron permisos y no se modificaron roles ni usuarios.
- Todas las consultas usan `idEmpresa`; mismatch cross-tenant real respondio HTTP `403`.
- El proxy MVC mantiene firma HMAC server-side y no expone conexion ni secretos al cliente.

## 4. QA real UMBRELLA 163

- Ruta tenant normal API/Firebase resolver: PASS.
- DatabaseIdentity saneada: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.
- Consulta HTTP: `200`; combos HTTP: `200`.
- Identidades: 10 total; 9 producto; 1 servicio; 4 variantes; 4 presentaciones.
- Sucursales reales: 5.
- Inventario aplicable: 9; con existencia: 0; existencia cero: 9; servicio N/A: 1.
- Producto: aplicable, total 0, saldos 0, movimientos 0.
- Servicio: N/A, saldos 0, movimientos 0.
- Variante: aplicable, total 0, saldos 0, movimientos 0.
- PresentacionVenta: aplicable, total 0, saldos 0, movimientos 0.
- Filtro con existencia: 0 filas.
- Filtro sin existencia: 9 filas.
- Filtro cantidad menor a 1: 9 filas.
- Filtro por sucursal real: 10 identidades, con existencia contextual cero.
- No se crearon movimientos para forzar evidencia. El estado real de movimientos poblados queda `NO APLICA EN DATOS ACTUALES`.
- Datos legitimos modificados: 0. Cleanup: no requerido; residuos temporales: 0.

## 5. Verificacion tecnica

- `ListaPreciosServiceTests`: 55/55 PASS; cinco escenarios LP-13 nuevos.
- Focal ampliada ListaPrecios/Inventario/source: 89/89 PASS.
- Full suite: 619/619 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check ListaPrecios.js`: PASS.
- `git diff --check` API/MVC: PASS.
- `Utilerias.js`: sin diff; SHA-256 `c311fca34ad0b4006898dc36346006d257c8c8fdbe2e2b8e21a1a763a986fb0d`.
- `_Layout.cshtml`: sin diff; SHA-256 `085f7809037b5ace0d503773dda79c07ef51886894e2e7c5d30f25eb7545d7fb`.
- `checkapp-ui.js`: sin diff; SHA-256 `63d3a4ca246de4197678556d836ef1f829fd15631565e14f32339e01d6a5ed16`.
- CSS LP-11R2: sin cambios LP-13; SHA-256 `e255b24f0492d4d9c6b5f3e6806c5f40b81199fb7bfb240c3b06e3a2fd638958`.

## 6. LP-13R - QA visual autenticada / cierre

- Login normal y tenant funcional UMBRELLA 163: PASS. La empresa permanecio seleccionada despues de F5.
- Grid autenticado: 10 identidades; 9 productos inventariables con existencia `0`; 1 servicio con `N/A` y sin accion de inventario.
- Producto base, Variante y PresentacionVenta: detalle read-only PASS con identidad correcta, total `0`, sin saldos registrados y `0` movimientos.
- Catalogo de sucursales: 5 reales (`Blue Umbrella`, `Neo-Umbrella`, `Sede Central`, `Tricell`, `WillPharma`).
- Movimientos poblados y referencias: NO APLICA EN DATOS ACTUALES; no se crearon movimientos artificiales.
- Filtros runtime: con existencia `0`; sin existencia `9`; cantidad menor a `1` = `9`; sucursal `Blue Umbrella` aislada = `10`; Limpiar restauro `10`.
- Responsive autenticado: Desktop `1440`, Tablet `820` y Mobile `390` PASS.
- Mobile exacto: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`; cards, fotos, existencia, Editar LP-09, toolbar LP-12 y accion inventario visibles y operativos.
- Detalle mobile: ancho `378`, `scrollWidth=378`, dentro del viewport y sin overflow destructivo.
- Editor LP-09 mobile: ancho `378`, foto y preview visibles, sin overflow destructivo.
- Consola: 0 errores y 0 warnings. Solicitudes runtime usadas por la pantalla: HTTP `200`.
- Smoke LP-09/LP-10/LP-11/LP-12: PASS; edicion de Producto, Servicio, Variante y PresentacionVenta abre sin persistir cambios.
- Regresion de cierre: `node --check` PASS; focal `89/89`; full suite `619/619`; build API y MVC PASS con 0 errores; `git diff --check` API/MVC PASS; secret scan PASS.
- SQL/DDL/fixtures: NO. Datos legitimos modificados: 0. Cleanup: no requerido. Residuos temporales: 0.
- Codigo productivo modificado por LP-13R: 0 archivos.
- `Utilerias.js`, `_Layout.cshtml`, `checkapp-ui.js`, Auth/Login/Firebase/Session/Cookies/Claims, Schema V2, migraciones/runner, ProductosServicios y Legacy: FROZEN, sin cambios.

Dictamen:

`LP-13 = CERRADO / EXISTENCIAS Y MOVIMIENTOS INTEGRADOS CERTIFICADOS / QA VISUAL AUTENTICADA PASS / LISTO HANDOFF LP-14`

LP-14 es el siguiente ticket y NO fue ejecutado.

### Antecedente de bloqueo resuelto

La sesion Chrome autenticada UMBRELLA abrio la pantalla y permitio detectar/corregir un alias SQL ambiguo. Despues, el aviso de sesion duplicada cerro la sesion y Chrome no conservo password. No se eludio Login ni se recuperaron credenciales. Queda pendiente repetir visualmente grid, detalle y responsive `1440/820/390` con sesion autenticada.

Ese bloqueo quedo resuelto por LP-13R mediante login normal autorizado y QA visual autenticada completa. LP-14 no se ejecuto durante el cierre.
