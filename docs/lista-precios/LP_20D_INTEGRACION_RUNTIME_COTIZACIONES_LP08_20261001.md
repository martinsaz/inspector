# LP-20D - Integracion runtime Cotizaciones -> ListaPrecios LP-08

Fecha: 2026-10-01

Estado: **BLOQUEADO / NO CERRADO**

## Alcance implementado

- Cotizaciones usa el resolver tenant server-side y abre conexiones con el descriptor resuelto.
- Los gates `Cotizaciones` y `ListaPrecios` se evaluan antes de operar; ambos fallan cerrado.
- La busqueda de partidas consume el motor LP-08 para Producto, Servicio, Variante y PresentacionVenta.
- Lista 1 es el default y el borrador admite seleccion 1..10.
- El servidor vuelve a resolver LP-08 y no acepta del navegador PrecioBase, PrecioLista, OrigenPrecio, descuento de lista, redondeo, vigencias, ReglaVersion ni CorrelationId.
- Precio `0.00` es valido; el descuento adicional se valida estrictamente entre 0 y 100 sin clamp.
- Las partidas nuevas usan INSERT; partidas existentes conservan identidad y snapshot al cambiar solo cantidad; las retiradas usan baja logica.
- Los cambios de identidad/lista re-resuelven. El cambio de lista requiere confirmacion y un override previo requiere confirmacion explicita.
- Override requiere permiso de escritura, precio no negativo, motivo y actor; el snapshot LP-08 original permanece separado.
- El historial de Cotizaciones es append-only y contempla alta, nueva resolucion, cantidad, identidad, lista, descuento adicional, override, baja y clon re-resuelto.
- El clon conserva `idCotizacionOrigen`, crea borrador y re-resuelve el precio vigente.
- Cotizaciones `PRE_LP08` se identifican por snapshot ausente y no pueden convertirse/recalcularse al editar.

## QA autenticada UMBRELLA 163

La sesion normal mostro UMBRELLA. La busqueda y presentacion en Cotizaciones resolvio las cuatro identidades reales:

- Producto base `Aceite Motor Sintetico`.
- Servicio `Cambio de Aceite`.
- Variante `10 L`.
- PresentacionVenta `Pieza`.

Las cuatro resolvieron fallback y la UI separo precio LP-08, cantidad y descuento adicional. La cantidad `2` y descuento adicional `10%` recalcularon el importe de la partida sin alterar el precio unitario mostrado.

El guardado de la cotizacion fue rechazado antes de persistir con `FALLBACK_PRECIO_PUBLICO`, porque el resultado LP-08 no contenia `idListaPrecio`. La cotizacion permanecio como `Nuevo`, sin folio ni ID.

## Bloqueo real

La pantalla oficial de Lista de Precios mostro diez identidades, `Configurados = 0` y fallback en Lista 1. El preview oficial de un precio QA funciono sin persistencia. Al ejecutar `GuardarPrecio`, el repositorio intento insertar una nueva cabecera de Lista 1 y SQL rechazo la operacion por duplicidad del indice unico empresa+nivel.

La evidencia conjunta determina:

- existe una cabecera de Lista 1 archivada/inactiva para UMBRELLA;
- `ObtenerListaPorNivelAsync` solo devuelve cabeceras activas no archivadas;
- el fallback queda resuelto sin `idListaPrecio`;
- `EnsureListaAsync` intenta INSERT en vez de reactivar la cabecera existente;
- el indice unico impide una segunda fila del mismo nivel.

ListaPrecios esta FROZEN en LP-20D. No se modifico su servicio, schema ni datos para sortear el bloqueo. Se requiere decision PO y ticket autorizado para definir la reactivacion oficial/idempotente de cabeceras archivadas.

## Persistencia y cleanup

- Cotizacion QA persistida: 0.
- Configuraciones ListaPrecios QA activas: 0.
- Persistencia parcial: 0; la pantalla siguio mostrando `Configurados = 0` y `Sin precio lista`.
- Hard delete: 0.
- SQL manual: no.
- Datos legitimos modificados: 0.
- Residuos QA creados por LP-20D: 0.

## Certificacion pendiente por bloqueo

No se certificaron en SQL runtime: snapshot persistido, edicion por cantidad, cambio de identidad/lista, override auditado, clon, baja logica, historial, muestras PRE_LP08, PDF/correo-source ni responsive 1440/820/390. No se declara LP-20D cerrado.

## Regresion tecnica

- Tests Cotizaciones LP-08: 10/10 PASS.
- `CotizacionesSchemaContractTests`: 29/29 PASS.
- `SchemaMigrationEngineTests`: 36/36 PASS.
- `ListaPreciosServiceTests`: 129/129 PASS.
- Full suite: 750/750 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check` Cotizaciones: PASS.
- `git diff --check` MVC/API: PASS.

## Protecciones

Sin cambios LP-20D en schema/versionado, Auth/Login/Firebase, ListaPrecios, Inventario, ProductosServicios, Ventas, Facturacion ni Legacy. `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js` permanecen intactos. LP-21 y LP-22 no se ejecutaron.

## Dictamen

LP-20D = BLOQUEADO / NO CERRADO.

Bloqueo exacto: cabecera Lista 1 archivada/inactiva en UMBRELLA; fallback sin `idListaPrecio`; el mecanismo oficial de GuardarPrecio intenta INSERT y colisiona con el indice unico empresa+nivel. Reparacion de ListaPrecios requiere revision PO.

## LP-20D1 - Hotfix de reactivacion de cabecera y retoma runtime

Fecha: 2026-10-01

Estado: **HOTFIX CERTIFICADO / LP-20D AUN BLOQUEADO POR DEFECTO RUNTIME INDEPENDIENTE**

### Hotfix autorizado

- `EnsureListaAsync` consulta la cabecera exacta por `idEmpresa + Nivel` dentro de la transaccion `Serializable`, con `UPDLOCK, HOLDLOCK`.
- Una cabecera activa se reutiliza; una unica cabecera archivada se reactiva sobre el mismo GUID; una cabecera inexistente se crea por el flujo vigente.
- Multiples candidatas o estados fisicos incoherentes fallan cerrado con `CABECERA_LISTA_INCONSISTENTE`.
- La reactivacion solo cambia `Activo`, `FechaArchivado`, `idUsuarioArchivado`, `FechaActualizacion` e `idUsuarioActualizacion`. No cambia identidad, nivel, tenant ni relaciones.
- Preview no llama a `EnsureListaAsync` y no reactiva ni persiste.
- No existe historial oficial de cabecera en el contrato actual; no se invento un evento en `ListaPreciosHistorial`.

### Certificacion UMBRELLA 163

- BEFORE funcional: Lista 1 archivada/inactiva; `Configurados = 0`; fallback operativo sin cabecera activa.
- Preview oficial de Producto base: `777.00`, descuento `5%`, redondeo `A 4/9`, subtotal `738.15`, final `739.00`, vigencia `2026-10-01..2026-10-31`; sin persistencia.
- GuardarPrecio oficial: PASS. La cabecera canonica Lista 1 fue reactivada y la escritura quedo operativa sin insertar una segunda cabecera.
- Precio `0.00` oficial en Servicio: PASS y resolucion `PRECIO_LISTA`.
- Fallback posterior a cleanup: Producto `680.00` y Servicio `1500.00`, ambos `FALLBACK_PRECIO_PUBLICO`.
- Idempotencia: la segunda escritura reutilizo la cabecera ya activa.
- Cabecera Lista 1 final: ACTIVA y operativa; no se archivo durante cleanup.
- Duplicados: 0 por indice unico empresa+nivel y reuso de la fila canonica.

### Cleanup oficial

- Producto base: baja logica `Activo 1 -> 0`, evento `BAJA` append-only y fallback restaurado.
- Servicio: baja logica `Activo 1 -> 0`, evento `BAJA` append-only y fallback restaurado.
- Configuraciones QA activas finales: 0.
- Residuos QA activos: 0.
- Hard delete: 0.
- SQL manual: no.
- Datos legitimos modificados: 0.

### Bloqueo runtime independiente

Al retomar `/Cotizaciones/Nueva`, la carga inicial autentica de UMBRELLA fue detenida por el endpoint oficial de sucursales: respondio HTTP 500 al leer un valor nulo antes de cargar clientes y productos. No se creo ni modifico ninguna cotizacion. El defecto pertenece al catalogo/runtime de Sucursal y queda fuera del hotfix quirurgico de ListaPrecios; no se modifico automaticamente.

Por este bloqueo no se certificaron runtime en LP-20D1: persistencia de snapshot de Cotizaciones, cuatro identidades dentro de una cotizacion guardada, cantidad, cambio de identidad/lista, override, baja, historial, clon, PRE_LP08, PDF/correo-source ni responsive 1440/820/390.

### Regresion LP-20D1

- `ListaPreciosHeaderReactivationTests`: 14/14 PASS.
- `ListaPreciosServiceTests`: 129/129 PASS.
- Cotizaciones LP-08 + schema: 39/39 PASS (10 runtime-contract + 29 schema).
- Full suite: 764/764 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check` Cotizaciones: PASS.
- `git diff --check` MVC/API: PASS.

### Dictamen LP-20D1

Hotfix de reactivacion de cabecera ListaPrecios: **PASS TECNICO + SQL REAL**.

LP-20D: **BLOQUEADO / NO CERRADO** por HTTP 500 del catalogo oficial de sucursales en la carga inicial de Cotizaciones. No ejecutar LP-21 ni LP-22. Siguiente paso: revision PO del defecto runtime de Sucursal.

## LP-20D2 - Hotfix runtime Sucursales y retoma LP-20D

Fecha: 2026-10-01

Estado: **HOTFIX SUCURSALES CERTIFICADO / LP-20D AUN BLOQUEADO POR DEFECTO RUNTIME INDEPENDIENTE**

### Diagnostico y hotfix Sucursales

- Endpoint exacto: `GET /api/Sucursal/ObtenerSucursales`, consumido por MVC mediante `/Cotizaciones/ObtenerSucursalesCotizacion`.
- Error real anterior: HTTP 500, `Data is Null. This method or property cannot be called on Null values.`
- Campo real: `Sucursales.Notas = NULL` en UMBRELLA 163.
- Contrato: `Notas` es nullable en el schema V2; el dato es valido. La incompatibilidad estaba en el mapper/modelo, que usaba `GetString` y `string` no nullable.
- Correccion quirurgica: solo `Sucursales.Notas` paso a `string?` y su lectura usa `IsDBNull`; el resto del mapper conserva los getters previos.
- Schema modificado: no. Datos modificados: no.
- Runtime autenticado: `/Cotizaciones/Nueva` cargo `Sin sucursal` y 8 sucursales reales sin HTTP 500.

### Retoma runtime Cotizaciones

- Tenant autenticado: UMBRELLA 163.
- Gates Cotizaciones y ListaPrecios: operativos; la cotizacion Lista 1 pudo crearse, consultarse y actualizarse.
- La UI ofrecio Lista 1..10.
- Cotizacion QA `COT-000020` persistio cuatro identidades: Producto base, Servicio, Variante 10 L y PresentacionVenta Pieza.
- Lista 1 persistio precio especifico `777.00`, descuento de lista `5%`, redondeo `A 4/9`, vigencia `2026-10-01..2026-10-31`, final `739.00` y Servicio con precio exacto `0.00`.
- Variante y PresentacionVenta persistieron fallback `1299.00` y `680.00`.
- Cantidad `2 -> 3` con descuento adicional `10%` conservo el snapshot/precio unitario LP-08.
- El preview de cambio a Lista 2 re-resolvio las cuatro partidas a fallback y pidio confirmacion.

### Bloqueo runtime independiente

El guardado del cambio a Lista 2 fue rechazado con `FALLBACK_PRECIO_PUBLICO`. El motor LP-08 resuelve correctamente el fallback, pero cuando no existe cabecera materializada para el nivel devuelve `IdListaPrecio = null`. Cotizaciones exige `IdListaPrecio` para todo snapshot persistido y falla en `BuildLp08PartidasAsync` antes de guardar.

No se modifico Cotizaciones ni ListaPrecios para sortear este defecto, porque LP-20D2 autoriza exclusivamente el hotfix de Sucursales. La certificacion se detuvo en este punto. Cambio de identidad, override persistido, baja de partida, clon, muestras PRE_LP08 y responsive 1440/820/390 permanecen no certificados en runtime.

### Cleanup oficial LP-20D2

- Cotizacion `COT-000020`: cancelada por mecanismo oficial; reporte final `Borradores = 0`, `Canceladas = 1`.
- Producto base Lista 1: baja logica `Activo 1 -> 0`, historial `INDIVIDUAL` append-only y fallback posterior `680.00`.
- Servicio Lista 1: baja logica `Activo 1 -> 0`, historial `INDIVIDUAL` append-only y fallback posterior `1500.00`.
- Configuraciones QA activas finales: 0 (`Configurados = 0`).
- Cabecera canonica Lista 1: activa y operativa; una sola opcion Lista 1 en el catalogo UI.
- Hard delete: 0. SQL manual: no. Datos legitimos modificados: 0. Residuos QA activos: 0.

### Regresion LP-20D2

- Focales Sucursales + Cotizaciones + ListaPrecios: 187/187 PASS.
- Full suite: 765/765 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check` Cotizaciones: PASS.
- `git diff --check` MVC/API: PASS.
- Secret scan del hotfix: PASS.

### Dictamen LP-20D2

Hotfix runtime Sucursales: **PASS TECNICO + QA AUTENTICADA**.

LP-20D: **BLOQUEADO / NO CERRADO** por incompatibilidad entre fallback LP-08 sin cabecera materializada (`IdListaPrecio = null`) y la persistencia obligatoria del snapshot de Cotizaciones al cambiar a Lista 2. No ejecutar LP-21 ni LP-22. Siguiente paso: revision PO del defecto runtime de Lista destino/fallback.

## LP-20D3 - Materializacion canonica Lista destino y cierre runtime

Fecha: 2026-10-01

Estado: **LP-20D CERRADO / QA RUNTIME AUTENTICADA PASS**

### Hotfix autorizado

- Preview permanece read-only: resuelve fallback aun cuando la cabecera no esta materializada y no crea, reactiva ni modifica datos.
- En Guardar Cotizacion, una resolucion valida con precio y `IdListaPrecio = null` invoca `EnsureListaAsync`, vuelve a resolver LP-08 server-side y persiste el GUID canonico.
- La materializacion usa el flujo oficial Serializable con `UPDLOCK, HOLDLOCK`: reutiliza activa, reactiva archivada unica o crea una sola cabecera.
- Materializar la cabecera no llama `GuardarPrecioAsync` ni crea detalles/configuraciones de precio.
- Nivel fuera de `1..10` y cross-tenant fallan cerrado.

### QA runtime UMBRELLA 163

- Lista 2 BEFORE: sin cabecera materializada operativa para el snapshot; 10 identidades, 9 productos, 1 servicio y `Configurados = 0`; fallback LP-08 correcto.
- Preview Lista 1 -> Lista 2: cuatro partidas re-resueltas sin escritura.
- Guardar materializo una sola cabecera Lista 2, persistio `idListaPrecio` no nulo y mantuvo configuraciones activas en 0.
- Producto, Servicio, Variante 10 L y PresentacionVenta Pieza: PASS.
- Precio especifico de Producto: `777.00`, descuento LP `5%`, redondeo `A 4/9`, vigencia `2026-10-01..2026-10-31`, final `739.00`.
- Servicio con precio exacto `0.00`: PASS.
- Variante y PresentacionVenta conservaron fallback `1299.00` y `680.00`.
- Cantidad `2 -> 3` y descuento adicional `10%` conservaron el snapshot unitario.
- Cambio de identidad usa el flujo oficial baja logica + alta/re-resolucion; no muta una identidad persistida in-place.
- Override autorizado de Variante a `888.88` con motivo: PASS.
- Baja logica de partida PresentacionVenta: PASS, sin hard delete.
- Clon `COT-000022`: PASS con re-resolucion; origen tenant-safe preservado.
- Cotizaciones QA `COT-000021` y `COT-000022`: canceladas oficialmente. `COT-000020` permanecio cancelada desde LP-20D2.

### PRE_LP08

- 19 cotizaciones historicas abiertas en detalle read-only.
- 70 partidas reales verificadas; importes visibles preservados.
- 19/19 enlaces PDF disponibles; muestra `COT-000001` genero PDF A4 valido de 1 pagina.
- No hubo re-resolucion LP-08, escritura automatica, envio de correo/WhatsApp ni cambio de datos historicos.

### Responsive

- Desktop: `innerWidth/clientWidth/bodyScrollWidth = 1440/1440/1440`.
- Tablet: `820/820/820`.
- Mobile: `390/390/390`; `documentElement.scrollWidth = 390`.

### Cleanup oficial LP-20D3

- Producto base Lista 2: `Activo 1 -> 0`, historial append-only y fallback `680.00`.
- Servicio Lista 2: `Activo 1 -> 0`, historial append-only y fallback `1500.00`.
- Bajas: 2/2 PASS; configuraciones QA activas finales: 0; residuos QA activos: 0.
- Cabeceras canonicas Lista 1 y Lista 2: activas y operativas; GUID preservado; duplicados empresa+nivel: 0.
- Hard delete: 0. SQL manual: no. Datos legitimos modificados: 0.

### Regresion LP-20D3

- Tests hotfix: 7/7 PASS.
- Focales: 226/226 PASS.
- Full suite: 772/772 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check` Cotizaciones: PASS.
- `git diff --check` MVC/API: PASS.
- Secret scan: PASS.

### Dictamen LP-20D3

LP-20D = CERRADO / COTIZACIONES CONSUMIDOR LP-08 CERTIFICADO / SNAPSHOT PASS / PRE_LP08 PRESERVADO / QA RUNTIME AUTENTICADA PASS.

No ejecutar LP-21 ni LP-22. Siguiente paso: revision PO.
