# Auditoría Preimplementación Legacy

Fecha: 2026-08-17

## Alcance

Auditoría base de los módulos Legacy:

- `/ventas/nueva`
- `/ventas/devoluciones`
- `/ajustes/pv/tiendas-ajustes`
- `/ajustes-pv/formas-pago`

Fuentes auditadas:

- frontend legacy `/Users/denissemendiola/dev/Raramuri.blzr`
- API legacy `/Users/denissemendiola/dev/sazapi`
- capturas funcionales del Product Owner
- documentación técnica ya asentada en los repos legacy

Estado de esta corrida:

- sí se auditó código, rutas, servicios, endpoints, validaciones y persistencia
- sí se verificó el mecanismo real de arranque local
- sí se verificó el arranque runtime del frontend en modo normal contra WS publicados
- no se completó login QA en navegador
- no se ejecutó flujo E2E completo porque `sazapi` local no levanta sin secretos Development autorizados

## Arquitectura Legacy

### Frontend `Raramuri.blzr`

- stack: ASP.NET Core Blazor Server interactivo (`@rendermode InteractiveServer`)
- layout operacional: `DashboardLayout`
- transporte API: `ISazApiRequestExecutor`
- contexto operativo: `OperacionContextService`
- sesión/autenticación: `AuthSessionService`, JWT bearer contra SAZ API
- estado navegador:
  - sesión protegida en `ProtectedSessionStorage` y `ProtectedLocalStorage`
  - contexto tienda/caja en `localStorage`
- resolución de API:
  - default configurado en `Raramuri.blzr/appsettings.Development.json` -> `SazApi:BaseUrl=http://174.138.180.181:5000`
  - perfiles locales oficiales en `Raramuri.blzr/Properties/launchSettings.json`
  - perfiles `http-local-api` y `https-local-api` fuerzan `SazApi__BaseUrl=http://localhost:5082` y `SazApi__ForceConfiguredBaseAddress=true`

### API `sazapi`

- stack: ASP.NET Core Minimal API
- seguridad: JWT bearer obligatorio
- multitenant: `GetTenantConnectionStringAsync(user, cfg)` resuelve la conexión por tenant desde sesión/claims
- SQL: acceso dinámico contra tablas legacy, con detección de columnas por tenant
- permisos:
  - ventas/devoluciones usan permisos server-side, no decisiones del frontend
  - ajustes PV y formas de pago tienen módulos propios en permisos

### Diagrama conceptual

`Raramuri.blzr -> ISazApiRequestExecutor -> SazApi -> SQL tenant legacy + servicios fiscales externos`

## Arranque local auditado

### Comandos y puertos

Frontend:

- proyecto: `Raramuri.blzr/Raramuri.blzr.csproj`
- perfil local correcto: `http-local-api`
- comando: `dotnet run --launch-profile http-local-api`
- puerto: `http://localhost:5022`

API:

- proyecto: `SazApi.csproj`
- perfil local correcto: `http`
- comando: `dotnet run --launch-profile http`
- puerto: `http://localhost:5082`

### Resultado real de esta corrida

- `Raramuri.blzr` sí compiló y sí escuchó en `http://localhost:5022`
- `Raramuri.blzr` también levantó en modo normal con `LOGIN-BOOTSTRAP ORIGIN: http://174.138.180.181:5000`
- `curl http://localhost:5022/login` respondió `200`
- `curl http://localhost:5022/ventas/nueva` respondió `200`
- `sazapi` falló al arrancar por configuración faltante:
  - `Jwt:Key`
  - potencialmente también `ConnectionStrings:Central` para flujos posteriores
- evidencia documental oficial del repo:
  - `README.md` exige `dotnet user-secrets set "Jwt:Key" "<JWT_KEY_LOCAL_QA_AUTORIZADA>"`
  - `README.md` exige `dotnet user-secrets set "ConnectionStrings:Central" "<CONNECTION_STRING_CENTRAL_QA_AUTORIZADA>"`
- evidencia del mecanismo normal del propio repo:
  - `run-local.sh` llama primero `./setup-local.sh --check-only`
  - `setup-local.sh --check-only` reportó exactamente:
    - `Jwt:Key`
    - `ConnectionStrings:Central`

Bloqueo operativo actual:

- no es un bug funcional del módulo auditado
- es un prerrequisito de ambiente local
- no se inventaron secretos ni se alteró configuración sensible
- no existe en el workspace un mecanismo local alterno ya listo que evite ese chequeo sin tocar seguridad

## Continuación runtime cerrada

### Listeners auditados

- al inicio de la corrida no había listeners activos en `5022`, `5082`, `7140` ni `7063`
- no se mataron procesos ajenos
- proceso iniciado por esta corrida:
  - `Raramuri.blzr`
  - perfil `http`
  - listener activo validado en `http://localhost:5022`

### Modo runtime validado

- modo local con API local:
  - frontend sí puede forzar `http://localhost:5082` mediante `http-local-api`
  - backend no arranca sin prerequisitos de Development
- modo normal con API publicada:
  - frontend sí levanta
  - bootstrap de login apunta a `http://174.138.180.181:5000`
  - la app sirve `/login` y `/ventas/nueva` con HTTP `200`

### Conclusión runtime

- sí quedó validado el mecanismo real de listeners, perfiles y resolución de URL base
- no quedó validado el flujo autenticado QA porque el backend local no es utilizable sin secretos y el navegador automatizado no se certificó en esta corrida
- el expediente sí queda listo para una corrida manual asistida con navegador real, sin reabrir análisis de infraestructura

## Pantalla 1: `/ventas/nueva`

### Archivos principales

- vista: `Raramuri.blzr/Components/Pages/Ventas/VentasNueva.razor`
- checkout: `Raramuri.blzr/Components/Pages/Ventas/PosCheckoutDialog.razor`
- servicio: `Raramuri.blzr/Services/Ventas/VentasPosService.cs`
- endpoint cobro: `sazapi/Endpoints/Program.Endpoints.Ventas.cs`

### Flujo funcional observado en código

- carga sesión y contexto operativo
- permite cliente público general o cliente seleccionado
- búsqueda de cliente por texto y por NFC
- captura de SKU/código, búsqueda textual y selector de tallas
- agrega renglones al carrito con precio/descuento por talla
- muestra resumen económico
- abre checkout modal para vendedor, pagos y documentos
- permite preparar facturación antes de cobrar
- envía cobro a `POST ventas/cobrar`

### Endpoints confirmados

- `GET existencias/productos?take=&q=`
- `POST ventas/sku/resolver`
- `GET ventas/barcode/{barcode}/tallas?lista=&tiendaId=`
- `GET ventas/clientes/{socioId}/cliente-fiel/descuento?tiendaId=`
- `GET ventas/vendedores-elegibles?tiendaId=&cajaId=`
- `GET ventas/vendedores-elegibles/lookup-nfc?nfc=&tiendaId=&cajaId=`
- `GET ventas/formas-pago`
- `GET ventas/formas-pago?tiendaId=`
- `GET configuracion/formas-pago?tiendaId=`
- `GET productos/claves-sat/grid?barcode=`
- `POST ventas/monedero/preview`
- `GET ventas/credito/validar?socioId=&monto=`
- `GET ventas/documentos-pago/validar?tipo=&folio=&tiendaId=`
- `GET programas-lealtad/tarjetas-regalo/saldo?codigo=`
- `POST lealtad/billetiza/cupones/validar-redencion`
- `POST ventas/cobrar`

### Reglas de negocio confirmadas

- `Requiere factura` se decide antes del cobro y vive en `CartState.FiscalDraft`
- el switch activa:
  - `CargarEstadoFacturacionAsync()`
  - `AsegurarUsosCfdiAsync()`
- para facturar deben existir todos estos faltantes resueltos:
  - llave de facturación validada
  - cliente real
  - nombre o razón social
  - RFC válido
  - código postal fiscal
  - régimen fiscal
  - uso CFDI
- la venta no puede facturarse si alguna forma de pago usada no tiene `formaFiscal` ligada en `configuracion/formas-pago`
- la venta no puede facturarse si algún producto no tiene relación SAT (`claveProdServ` + `claveUnidad`)
- checkout exige:
  - vendedor válido
  - al menos una forma de pago con monto
  - total cubierto
  - documentos válidos
- crédito:
  - requiere cliente real
  - se valida server-side
- NFC:
  - cliente y vendedor se resuelven por endpoints separados
  - el frontend solo refleja el resultado

### Trazabilidad de cliente

- búsqueda UI:
  - `Buscar cliente`
  - placeholder `Nombre, RFC o identificador`
- lógica:
  - `BuscarClientesPosAsync`
  - primero `ClientesService.BuscarAsync(criterio)`
  - si parece identificación fiscal, también `ClientesService.BuscarPorIdentificacionAsync(criterio)`
- selección:
  - `OnClientePosSeleccionadoAsync`
  - si `null` vuelve a `Público general`
  - si hay cliente:
    - `CargarClienteFiscalAsync(cliente.Id)`
    - `CargarPedidosVigentesClienteAsync(cliente.Id)`
    - `ActualizarDescuentoClienteFielAsync(cliente.Id)` si `IdClasifSocio == 3`

### Trazabilidad de checkout y cobro

- botón visible:
  - `Finalizar venta`
- habilitación funcional en modal:
  - `VentaListaParaCobrar`
  - `ValidarCheckoutAsync()`
- reglas exactas de `ValidarCheckoutAsync()`:
  - vendedor obligatorio
  - al menos un pago
  - solo formas soportadas en esta fase
  - crédito solo con cliente real y validación server-side
  - monedero solo para cliente elegible y con preview válido
  - gift card solo válida y con saldo suficiente
  - no puede faltar monto
  - no puede sobrar monto salvo efectivo
  - documentos completos y válidos
- payload frontend:
  - `VentaPosCobroRequestDto`
  - campos:
    - `tiendaId`
    - `cajaId`
    - `vendedorId`
    - `socioId`
    - `items[]`
    - `pagos[]`
    - `documentos[]`
    - `pedidoRefs[]`
    - `factura`
    - `idempotencyKey`
- endpoint backend:
  - `POST /ventas/cobrar`
- validaciones backend tempranas:
  - `items[]` requeridos
  - `pagos[] || documentos[]` requeridos
  - `vendedorId` requerido
  - permiso `Vender/Guardar`
  - vendedor con asistencia registrada hoy en sucursal
- persistencia backend declarada en comentario fuente:
  - guarda venta en `detnotas + fma`
  - descuenta existencias con `act_exis25`

### Hallazgos de migración

- la pantalla ya depende de varias reglas fiscales que no deben moverse al frontend de `inspector`
- la validación CFDI no está solo en `/facturacion`; cruza ventas, cliente, formas de pago y catálogos SAT
- `configuracion/formas-pago` es dependencia directa de `ventas/nueva`

## Pantalla 2: `/ventas/devoluciones`

### Archivos principales

- vista: `Raramuri.blzr/Components/Pages/Ventas/VentasDevoluciones.razor`
- servicio: `Raramuri.blzr/Services/Ventas/VentasDevolucionesService.cs`
- endpoints: `sazapi/Endpoints/Program.Endpoints.Ventas.cs`

### Endpoints confirmados

- `GET ventas/devoluciones/motivos`
- `GET ventas/devoluciones/ticket?ticket={ticket}&tiendaId={tiendaId}`
- `POST ventas/devoluciones/crear`
- `GET existencias/producto/{idArticulo}/imagen`

### Flujo funcional observado

- exige contexto operativo tienda/caja
- carga motivos al entrar
- localiza ticket por número manual o escaneo
- consulta renglones desde `fma + detnotas`
- bloquea devolución si no hay motivos
- genera nota de crédito y luego permite descargar PDF

### Reglas de negocio confirmadas

- el ticket se busca primero en `dbo.fma`
- si `statusTicket == 2`, devuelve `Este ticket ya fue cancelado`
- los días permitidos no vienen del cliente:
  - se resuelven server-side con `GetDiasParaDevolverAsync`
  - el querystring `diasVigencia` se conserva por compatibilidad pero ya no manda
- si expira:
  - error `Ticket expiró el día yyyy-MM-dd`
- renglones fuente:
  - `dbo.detnotas`
  - requiere columna `llave`
  - usa `apartent` como fallback de precio/descuento cuando `detnotas.precio == 0`
- flags por renglón:
  - `YaDevuelto`
  - `SinDevolucion`
- cliente por default:
  - `PUBLICO GENERAL` si no hay socio
- al crear:
  - valida ticket
  - valida items
  - genera nota de crédito
  - registra renglones en `detdev`
- la política de devoluciones por tienda ya quedó conectada a la operación real, no solo a una pantalla administrativa

### Trazabilidad de regla `Días para devolver`

`Ajustes PV por tienda -> dbo.TiendasAjustes.DiasParaDevolver -> GetDiasParaDevolverAsync() -> GET /ventas/devoluciones/ticket -> validación de expiración`

Regla exacta:

- primero intenta leer `dbo.TiendasAjustes.DiasParaDevolver`
- si no existe valor por tienda:
  - fallback a `cfg["Devoluciones:DiasVigencia"]`
  - default final `30`
- si vence:
  - bloquea devolución por fecha

### Resultado económico auditado por código

- esta pantalla genera `nota de crédito`
- no se encontró en este flujo un pago inmediato de efectivo/tarjeta dentro de la misma pantalla
- la operación económica primaria es:
  - localizar venta
  - determinar renglones devolubles
  - emitir nota de crédito
  - descargar comprobante/PDF

### Hallazgos de migración

- esta pantalla sí consume ajustes por tienda para vigencia real de devoluciones
- el backend ya protege permisos y reglas críticas; `inspector` debe consumir contrato, no reimplementar cálculo
- conviene separar desde diseño futuro:
  - localización del ticket
  - selección de renglones devolubles
  - emisión de nota/PDF

## Pantalla 3: `/ajustes/pv/tiendas-ajustes`

### Archivos principales

- vista: `Raramuri.blzr/Components/Pages/Ajustes/AjustesPvTiendasAjustes.razor`
- servicio: `Raramuri.blzr/Services/Ajustes/AjustesPvTiendasService.cs`
- API: `sazapi/Endpoints/Program.Endpoints.ConfiguracionTiendasAjustes.cs`

### Endpoints confirmados

- `GET configuracion/tiendas-ajustes/tiendas`
- `GET configuracion/tiendas-ajustes?tienda={tiendaId}`
- `PUT configuracion/tiendas-ajustes/{tiendaId}`

### Datos administrados

- `DiasParaDevolver`
- `DiasValidezNotaCredito`
- `DiasValidezValeCambio`
- `PorcentajeMinimoApartado`
- `DiasValidezApartado`
- `LeyendaTicketVenta`
- `LeyendaTicketDevolucion`
- `LeyendaTicketApartado`
- `ModoTicket`
- `TicketVentaApertura`
- `MostrarPrevioCobro`
- `UsarCurvasMayoreo`
- `ModoEtiquetaPdf`

### Validaciones confirmadas

- `DiasParaDevolver >= 0`
- `DiasValidezNotaCredito >= 0`
- `DiasValidezValeCambio >= 0`
- `PorcentajeMinimoApartado` entre `2` y `89`
- `DiasValidezApartado` entre `2` y `99`
- `ModoTicket` y `ModoEtiquetaPdf`:
  - `grafico`
  - `escpos`
- `TicketVentaApertura`:
  - `selector`
  - `vertical`
  - `horizontal`
  - `vertical_mayoreo`
- leyendas máximo `1000` caracteres

### Persistencia confirmada

- tabla: `dbo.TiendasAjustes`
- alta/update por `TiendaId`
- cache invalidada con `InvalidateOperationalGateCache(cn)`

### Consumidores reales confirmados

- `DiasParaDevolver`
  - sí tiene consumidor real en `ventas/devoluciones`
- `DiasValidezNotaCredito`
  - consumidor server-side disponible mediante `GetDiasValidezDocumentoAsync(..., "NC")`
- `DiasValidezValeCambio`
  - consumidor server-side disponible mediante `GetDiasValidezDocumentoAsync(..., "VC")`
- resto de campos
  - auditados como persistidos y expuestos por endpoint
  - no quedó certificada en esta corrida una lectura runtime consumidora equivalente para cada uno
  - requieren siguiente prueba autenticada en navegador o request real para cerrar trazabilidad total

### Hallazgos de migración

- esta pantalla ya no es solo UI de parámetros: al menos `DiasParaDevolver` influye en `ventas/devoluciones`
- migrar esta pantalla antes que ventas/devoluciones reduce deuda de reglas escondidas

## Pantalla 4: `/ajustes-pv/formas-pago`

### Archivos principales

- vista: `Raramuri.blzr/Components/Pages/Ajustes/AjustesPvFormasPago.razor`
- servicio: `Raramuri.blzr/Services/Ajustes/FormasPagoConfigService.cs`
- API: `sazapi/Endpoints/Program.Endpoints.ConfiguracionFormasPago.cs`
- endpoint operativo dependiente: `GET /ventas/formas-pago`

### Endpoints confirmados

- `GET configuracion/formas-pago/catalogos/tiendas`
- `GET configuracion/formas-pago/catalogos/formas-fiscales`
- `GET configuracion/formas-pago?tiendaId=`
- `PUT configuracion/formas-pago/{tiendaId}`
- `GET ventas/formas-pago?tiendaId=`

### Reglas de negocio confirmadas

- la pantalla administra configuración por tienda
- catálogo fiscal SAT se consulta aparte
- claves `VD` y `CF` se ocultan en frontend
- si la tienda usa default:
  - algunas claves restringidas se normalizan como `DISPONIBLE`
- para facturación, la relación crítica es `Clave -> FormaFiscal`
- `ventas/formas-pago` filtra:
  - solo activas
  - excluye `VC`, `NC`, `P0`
- si no existe una forma directa válida:
  - backend intenta contingencia con `EF`
- `CR` queda forzada como crédito/pagaré/ticket

### Persistencia funcional relevante

- esta pantalla no es decorativa:
  - `ventas/nueva` usa `ventas/formas-pago`
  - `ventas/nueva` valida contra `configuracion/formas-pago` cuando se requiere factura

### Trazabilidad de formas fiscales

`Ajustes PV / Formas de pago -> dbo.formaspago + mapa relación fiscal -> GET /configuracion/formas-pago?tiendaId= -> ValidarFormasPagoFacturaAsync() -> bloqueo/permiso para facturar en checkout`

Detalles confirmados:

- lectura por tienda:
  - `ReadFormasPagoConfigRowsAsync`
  - excluye `VD`, `CF`, `X8`, `X9`, `P0`, `P1`
- fallback:
  - si no hay filas por tienda y `usarDefaultSiVacio=true`, intenta tienda `-1`
- guardado:
  - `SaveFormasPagoConfigAsync`
  - persiste en `dbo.formaspago`
- validación POS:
  - no basta con forma activa
  - debe existir `FormaFiscal` ligada para cada clave usada al facturar

## GAP Analysis

### GAP 1 — runtime local incompleto

- estado legacy:
  - frontend local sí corre
  - backend local no corre sin prerequisitos Development
- impacto CheckApp:
  - la migración no está bloqueada conceptualmente
  - sí queda pendiente captura autenticada real de requests para cierre de paridad

### GAP 2 — dependencias cruzadas fuertes en POS

- `ventas/nueva` depende de:
  - clientes
  - descuentos
  - crédito
  - monedero/gift card/billetiza
  - formas de pago
  - catálogos SAT
  - facturación
- impacto CheckApp:
  - no conviene migrar `Nueva venta` como primera pantalla del bloque

### GAP 3 — devoluciones ya consume configuración operativa

- `Días para devolver` ya gobierna runtime real
- impacto CheckApp:
  - no basta con copiar UI de devoluciones; hay que migrar la política de tienda y su lectura server-side

### GAP 4 — formas de pago y facturación están acopladas

- `Formas de pago` no es solo catálogo administrativo
- impacto CheckApp:
  - si no existe relación fiscal equivalente, la venta no puede facturarse

### GAP 5 — trazabilidad consumidora parcial en algunos ajustes PV

- persistencia de todos los campos sí quedó localizada
- consumidor runtime total solo quedó cerrado para una parte del bloque
- impacto CheckApp:
  - esos campos deben migrarse como configuración formal, no como flags huérfanos

## Roadmap propuesto

### Fase A — cierre de auditoría runtime

1. Ejecutar login QA manual asistido en navegador real.
2. Capturar requests/responses autenticadas de:
   - `/ventas/nueva`
   - `/ventas/devoluciones`
   - `/ajustes/pv/tiendas-ajustes`
   - `/ajustes-pv/formas-pago`
3. Confirmar `Daniel X` en runtime como cliente QA usable.

### Fase B — base de configuración

1. Diseñar primero modelo destino de `Ajustes PV por tienda`.
2. Diseñar después `Formas de pago` por tienda con relación fiscal.
3. Definir consumidores destino explícitos antes de migrar UI.

### Fase C — operación controlada

1. Migrar `Devoluciones`.
2. Certificar regla de vigencia por tienda.
3. Migrar `Nueva venta` al final.

## Cierre de esta continuación

- sí se avanzó sobre runtime, network y trazabilidad sin ampliar alcance
- no se modificó Legacy funcionalmente
- no se tocaron `user-secrets`, JWT ni login
- la evidencia nueva principal es:
  - frontend normal operativo en `5022`
  - mecanismo local oficial del backend bloqueado exactamente por `Jwt:Key` y `ConnectionStrings:Central`
  - trazabilidad más fina de checkout, facturación, devoluciones y consumidores de configuración

### Hallazgos de migración

- es dependencia transversal de POS y CFDI
- no debe mezclarse con crédito, apartados ni ajustes de ticket
- la migración futura debe preservar la distinción entre:
  - catálogo operativo de checkout
  - configuración fiscal por tienda

## Dependencias cruzadas entre pantallas

- `/ajustes/pv/tiendas-ajustes` -> gobierna vigencia real de devoluciones
- `/ajustes-pv/formas-pago` -> gobierna facturación válida en `/ventas/nueva`
- `/ventas/nueva` -> depende de cliente, productos, vendedor, formas de pago, SAT y facturación
- `/ventas/devoluciones` -> depende de ticket original, motivos y política por tienda

## Riesgos de migración

- alto acoplamiento entre operación POS y configuración fiscal
- reglas server-side distribuidas entre ventas, configuración y catálogos
- compatibilidad legacy por tenant basada en detección dinámica de columnas SQL
- no todas las reglas visibles en UI son fuente de verdad; varias se recalculan en backend

## Recomendación de secuencia para CheckApp

1. Migrar primero lectura administrativa de `Ajustes PV por tienda`.
2. Migrar después `Formas de pago` administrativa.
3. Migrar `Devoluciones` con contrato exacto del backend.
4. Migrar `Nueva venta` al final por ser la pantalla con más dependencias y mayor riesgo transaccional.

## Bloqueos pendientes para siguiente corrida

- cargar secretos Development autorizados para `sazapi` local:
  - `Jwt:Key`
  - `ConnectionStrings:Central` si el setup lo exige
- completar login QA real en navegador
- capturar requests/responses reales autenticadas de los cuatro módulos
- contrastar caso QA con cliente recomendado por negocio sin documentar secretos en artefactos

## Cierre definitivo contra WS publicado

### Decisión operativa aplicada

- desde este punto la auditoría se cierra con `Raramuri.blzr` en modo normal contra WS publicado
- `sazapi` local queda únicamente como fuente de lectura de código
- no se reabrió investigación de secretos Development ni se intentó corregir infraestructura local

### Runtime real certificado el 2026-08-17

- comando ejecutado:
  - `dotnet run --launch-profile http`
- proyecto:
  - `Raramuri.blzr/Raramuri.blzr.csproj`
- perfil:
  - `http`
- listener:
  - `http://localhost:5022`
- PID:
  - `71810`
- evidencias HTTP:
  - `GET /login` -> `200`
  - `GET /ventas/nueva` -> `200`
- evidencias de log:
  - `MODO SAZ API: NORMAL`
  - `LOGIN-BOOTSTRAP ORIGIN: http://174.138.180.181:5000`
  - `API EFECTIVA ESPERADA POST-LOGIN: TENANT.API`

### Login real QA y contexto operativo

- `POST /app/login-bootstrap` contra `http://174.138.180.181:5000` respondió `200`
- el bootstrap devolvió:
  - `Empresa=4993`
  - `Usuario=b@babicora.com`
  - `BootstrapVersion=2`
  - `EmpleadoTiendaAsignadaId=2`
  - `PuedeCambiarTienda=true`
  - `Tenant.Api=http://153.75.231.11:5082`
  - `Tenant.Database=db_aab1b5_babicora`
  - `Tenant.EmpresaNombre=BABICORA`
  - `MenuAcceso.Acceso=true`
- módulos efectivos visibles en bootstrap:
  - `VENDER`
  - `DEVOLVER`
  - `CLIENTES`
  - `CREDITO`
- conclusión runtime:
  - el frontend realmente hace bootstrap en `174.138.180.181:5000`
  - después de autenticar cambia al `tenantApi` real `153.75.231.11:5082`

### Network real autenticada

#### `/ventas/nueva`

- `GET /clientes/info/buscar?q=Daniel%20X&take=10` -> `200`
  - encontró `1` registro
  - `Daniel X` sí existe en el runtime QA publicado
- `GET /ventas/formas-pago` -> `200`
  - devolvió `5` formas operativas
  - muestra observada:
    - `CR`
    - `EF`
    - `D1`
    - `TC`
    - `D5`
- `GET /ventas/vendedores-elegibles?tiendaId=2&cajaId=1` -> `200`
  - devolvió `1` vendedor elegible
- lectura cruzada:
  - `GET /configuracion/formas-pago?tiendaId=2` -> `200`
  - devolvió `26` filas de configuración para tienda `ALTACIA`

#### `/ventas/devoluciones`

- `GET /ventas/devoluciones/motivos` -> `200`
  - devolvió `10` motivos
  - primer motivo observado:
    - `numero=8`
    - `nombre=ACCESORIO DESPEGADO`
- no se ejecutó `GET /ventas/devoluciones/ticket`
  - faltó ticket QA autorizado para no provocar lectura sobre un folio no controlado

#### `/ajustes/pv/tiendas-ajustes`

- `GET /configuracion/tiendas-ajustes/tiendas` -> `200`
  - devolvió `4` sucursales
- `GET /configuracion/tiendas-ajustes?tienda=2` -> `200`
  - devolvió objeto `item`
  - en esta corrida sus campos configurables llegaron `null`
  - esto es consistente con la leyenda funcional de la UI:
    - vacío = usar comportamiento actual del sistema

#### `/ajustes-pv/formas-pago`

- `GET /configuracion/formas-pago/catalogos/tiendas` -> `200`
- `GET /configuracion/formas-pago/catalogos/formas-fiscales` -> `200`
  - devolvió arreglo vacío en esta sesión QA
- `GET /configuracion/formas-pago?tiendaId=2` -> `200`
  - `tiendaNombre=ALTACIA`
  - `usaDefaultTienda=false`
  - `total=26`
  - muestra observada:
    - `EF / Efectivo`
    - `CH / Cheques`
    - `CU / Cupones`
    - `D1 / Shopify`
    - `D5 / transferencia`
    - `DE / Depositos/Giros`

### Lectura combinada runtime + código

- la tienda QA sí tiene configuración explícita de formas de pago (`26` filas) pero el endpoint operativo de POS solo expone `5` claves utilizables en venta
- `ventas/formas-pago` confirmado en runtime sigue alineado con la regla auditada en código:
  - filtra catálogo administrativo y solo publica formas operativas
- `configuracion/tiendas-ajustes` para tienda `2` regresó campos vacíos
  - esto refuerza la regla auditada en backend:
    - cuando no hay override por tienda, el sistema cae a defaults o comportamiento actual
- `configuracion/formas-pago/catalogos/formas-fiscales` regresó vacío en esta sesión
  - para CheckApp esto es un GAP importante porque la facturación POS depende de esa relación

## GAP CheckApp definitivo

### GAP 1 — bootstrap y operación usan dos bases URL reales

- el login no termina en la misma URL donde inicia
- CheckApp debe separar:
  - origen de bootstrap/autenticación
  - `tenantApi` efectivo posterior al login

### GAP 2 — POS no consume el catálogo completo de formas

- configuración administrativa:
  - `26` filas en tienda `ALTACIA`
- catálogo operativo POS:
  - `5` formas publicadas al checkout
- CheckApp no debe asumir que toda forma configurada es cobrable

### GAP 3 — devoluciones sí tiene catálogo vivo y política cruzada

- motivos cargan en runtime real
- vigencia sigue gobernada por `TiendasAjustes` y fallback server-side
- migrar devoluciones sin esa política rompe paridad

### GAP 4 — ajustes PV vacíos siguen siendo estado válido

- `null` en `TiendasAjustes` no equivale a error
- equivale a usar comportamiento actual/default
- CheckApp debe modelar explícitamente ese estado tri-state y no forzar defaults inventados en frontend

### GAP 5 — formas fiscales siguen siendo dependencia crítica sin evidencia poblada en QA

- el catálogo fiscal devolvió vacío en esta sesión
- la relación `FormaPago -> FormaFiscal` sigue siendo obligatoria para facturación según código
- si el destino no resuelve esta ausencia con contrato claro, `Nueva venta` no puede cerrar paridad fiscal

## Roadmap definitivo

### Secuencia recomendada

1. Migrar primero `Ajustes PV por tienda` como contrato de configuración con soporte a valores vacíos/default.
2. Migrar después `Formas de pago` separando:
   - catálogo administrativo completo
   - catálogo operativo POS
   - relación fiscal requerida para facturación
3. Migrar `Devoluciones` preservando:
   - catálogo de motivos
   - lookup de ticket
   - vigencia por tienda resuelta server-side
4. Migrar `Nueva venta` al final por su acoplamiento con:
   - clientes
   - vendedores
   - formas de pago
   - crédito
   - SAT
   - facturación

### Cierre ejecutivo

- la auditoría ya quedó cerrada con evidencia suficiente de:
  - runtime real
  - network real autenticada
  - trazabilidad de frontend
  - trazabilidad de `sazapi`
  - persistencia
  - reglas de negocio
  - GAP CheckApp
  - roadmap
- no quedó pendiente volver a intentar `sazapi` local
- no se implementó ningún cambio funcional en Legacy ni en CheckApp
