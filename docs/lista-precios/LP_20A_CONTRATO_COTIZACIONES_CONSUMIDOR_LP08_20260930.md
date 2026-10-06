# LP-20A - Contrato Cotizaciones consumidor de ListaPrecios LP-08

Fecha: 2026-09-30

Estado: CONTRATO EN REVISION PO / SIN IMPLEMENTACION PRODUCTIVA

## 1. Objetivo y dictamen

Este documento define la evolucion necesaria para que Cotizaciones pueda convertirse, en un ticket posterior, en el primer consumidor real del motor ListaPrecios LP-08. No integra Cotizaciones, no autoriza DDL y no certifica el consumo.

LP-20 conserva su estado `STOP PO / SIN CONSUMIDOR REAL CERTIFICABLE` hasta que PO cierre las decisiones pendientes y autorice schema, migracion e implementacion.

## 2. Estado actual certificado

- UMBRELLA, empresa 163: 19 cotizaciones activas y 70 partidas activas.
- UI real: reporte, alta, detalle, edicion de borrador, clonado, PDF y correo.
- API real: `api/Cotizaciones`.
- Persistencia: `Cotizaciones` y `CotizacionesPartidas`.
- Precio inicial: `ProductosServicios.PrecioPublico` viaja al JavaScript.
- Precio y descuento: editables en cliente y reenviados a API.
- Calculo cliente: cantidad, precio, descuento, subtotal y total.
- Calculo API: repite el calculo y aplica descuento del cliente cuando el recibido es cero.
- Precio `0.00`: descartado actualmente por `request.PrecioUnitario <= 0`.
- Identidades: Producto y Servicio por `idProductoServicio`.
- Tenant: filtro `idEmpresa` firmado, pero conexion fisica fija por `SqlConnectionFactory`.
- Compatibility Gate ListaPrecios: no consumido.
- Schema scope Cotizaciones: no existe en `DatabaseScopes`, contratos, runner o gate oficiales.
- Edicion de borrador: elimina fisicamente todas las partidas y las recrea.
- Clonado: copia al cliente precio/descuento/snapshot parcial de la cotizacion origen; no resuelve precio vigente.

## 3. Brechas

1. El cliente puede proponer precio y descuento, por lo que el servidor no es autoridad unica.
2. Cotizaciones duplica reglas de calculo en JavaScript y API.
3. El contrato actual rechaza un precio LP-08 valido igual a cero.
4. No existe lista comercial explicita.
5. Variante y PresentacionVenta no pueden identificarse.
6. El snapshot no conserva la resolucion LP-08 completa.
7. La conexion fija no acredita DatabaseIdentity tenant normal.
8. No hay gate para el scope consumidor ni para ListaPrecios antes de resolver.
9. El hard delete de partidas de borrador pierde trazabilidad de reemplazo.
10. El clon puede reutilizar precios historicos sin una decision de negocio explicita.

## 4. Decisiones cerradas por contrato vigente

- LP-08 sera la unica fuente de verdad del precio comercial inicial.
- El precio se resuelve cuando el usuario agrega una identidad a la cotizacion.
- El resultado se persiste como snapshot y no se recalcula por cambios posteriores en ListaPrecios.
- Precio configurado `0.00` es valido, no hace fallback y debe poder persistirse.
- Producto, Servicio, Variante y PresentacionVenta deben ser identidades soportadas.
- Cambiar cantidad no vuelve a resolver LP-08; recalcula importes con el snapshot aplicado.
- Cambiar identidad exige una nueva resolucion LP-08.
- Reabrir un documento muestra el snapshot persistido; nunca consulta precios actuales para reescribirlo.
- El servidor resuelve tenant, identidad, gate y snapshot. El cliente no es confiable para valores comerciales.
- Las 70 partidas actuales permanecen historicas `PRE_LP08`; no se fabrican snapshots retroactivos.

## 5. Decisiones PO pendientes

### 5.1 Politica de lista

Recomendacion tecnica: almacenar lista explicita en encabezado como contexto editable del borrador y snapshot de lista en cada partida. Falta decidir:

- lista inicial obligatoria elegida por usuario o Lista 1 preseleccionada;
- si cliente o sucursal podran sugerir lista en un ticket futuro;
- si un documento confirmado puede cambiar lista (recomendacion: no).

No existe hoy asociacion Cliente->Lista ni Sucursal->Lista y no debe inventarse.

### 5.2 Override manual de precio

Opciones:

- A: LP-08 obligatorio, precio no editable.
- B: LP-08 inicial y override manual auditado.
- C: precio manual independiente de LP-08.

Recomendacion: B, sujeta a permiso existente del dominio Cotizaciones y motivo obligatorio. Debe conservar PrecioFinal LP-08, PrecioAplicado, actor, fecha y motivo. PO debe aprobarla antes de agregar columnas o UI.

### 5.3 Descuento adicional de cotizacion

LP-08 ya incorpora `DescuentoPct` de ListaPrecios dentro de `PrecioFinal`. El `DescuentoPct` actual de Cotizaciones representa descuento manual/cliente y no puede sumarse al descuento LP-08 por inferencia.

Recomendacion: tratar el descuento actual como descuento adicional del documento aplicado sobre `PrecioAplicado`, conservando aparte `DescuentoListaPct`. PO debe definir elegibilidad, rango, permiso, limite de cliente y acumulabilidad.

### 5.4 Cambio de lista

Recomendacion: permitido solo en borrador, con confirmacion explicita y nueva resolucion de todas las partidas LP08 no confirmadas. Partidas con override requieren confirmacion individual o bloqueo. Documentos autorizados/cancelados no cambian lista. Pendiente aprobacion PO.

### 5.5 Clonado

- A, conservar snapshots: reproduce exactamente la oferta historica, pero puede cotizar precios vencidos.
- B, volver a resolver: crea una oferta nueva con precio vigente, pero puede diferir del origen.

Recomendacion: B, mostrando comparativo antes de guardar y conservando referencia al documento origen. Pendiente aprobacion PO.

### 5.6 Borradores

Recomendacion: sustituir el delete/reinsert por partidas estables con alta, actualizacion y baja logica; registrar reemplazo de identidad/lista/snapshot. Debe definirse si se crea historial propio de partidas o version de borrador. Pendiente aprobacion PO.

## 6. Momento de resolucion

| Evento | Contrato propuesto |
| --- | --- |
| Crear partida | Resolver LP-08 server-side y generar snapshot/token firmado |
| Cambiar cantidad | No resolver; recalcular con PrecioAplicado persistido |
| Cambiar identidad | Invalidar snapshot anterior y resolver de nuevo |
| Cambiar lista | Decision PO; propuesta: confirmar y resolver nuevamente en borrador |
| Clonar | Decision PO; propuesta: resolver precios actuales |
| Editar borrador | Leer snapshot; no resolver salvo cambio de identidad/lista |
| Reabrir confirmado | Solo lectura del snapshot |
| Cambiar ListaPrecios | No modifica documentos existentes |

## 7. Politica de lista propuesta

Se recomienda opcion C: ambos niveles, con responsabilidades distintas.

- Encabezado `Cotizaciones.idListaPrecio` + `ListaPrecioNivel`: contexto comercial actual del borrador.
- Partida `CotizacionesPartidas.idListaPrecio` + `ListaPrecioNivel`: snapshot de la lista realmente usada en esa resolucion.

La duplicacion se justifica porque el encabezado puede cambiar durante un borrador, mientras cada partida debe probar con que lista fue resuelta. Para documentos LP08 nuevos ambos valores son obligatorios por aplicacion; para historicos permanecen NULL.

## 8. Identidades

La partida futura conserva `idProductoServicio` y agrega:

- `TipoIdentidad`: 1 Producto, 2 Servicio, 3 Variante, 4 PresentacionVenta;
- `idVariante` nullable;
- `idPresentacionVenta` nullable.

Reglas canonicas iguales a LP-08:

- Producto: producto tipo 1, sin variante/presentacion.
- Servicio: producto tipo 2, sin variante/presentacion.
- Variante: producto tipo 1 + variante perteneciente al producto.
- PresentacionVenta: producto tipo 1 + presentacion perteneciente al producto.

Los historicos mantienen `TipoIdentidad`, variante y presentacion en NULL; `idProductoServicio` actual permanece intacto.

## 9. Precio cero

Implementacion futura debe reemplazar la validacion `request.PrecioUnitario <= 0` por validaciones server-side sobre cantidad e identidad. El precio no debe venir libremente del request. Un snapshot LP-08 resuelto con `PrecioFinal = 0.00` es valido y persiste `0.00` en `PrecioFinal` y `PrecioUnitario/PrecioAplicado` cuando no haya override.

## 10. Snapshot comercial propuesto

### 10.1 Campos actuales reutilizados

| Campo actual | Uso futuro |
| --- | --- |
| `idProductoServicio` | Raiz de identidad |
| `Cantidad` | Cantidad cotizada |
| `PrecioUnitario` | PrecioAplicado por unidad; inicialmente PrecioFinal LP-08 |
| `DescuentoPct` | Candidato a descuento adicional de cotizacion; pendiente PO |
| `ImporteBruto` | Cantidad x PrecioAplicado |
| `DescuentoImporte` | Importe del descuento adicional aprobado |
| `Total` | Total final de la partida |
| Codigo/Nombre/Descripcion/Unidad | Snapshot descriptivo existente |

### 10.2 Campos nuevos base

- `TipoIdentidad TINYINT NULL`.
- `idVariante UNIQUEIDENTIFIER NULL`.
- `idPresentacionVenta UNIQUEIDENTIFIER NULL`.
- `idListaPrecio UNIQUEIDENTIFIER NULL`.
- `ListaPrecioNivel TINYINT NULL`.
- `PrecioBase DECIMAL(18,2) NULL`.
- `PrecioLista DECIMAL(18,2) NULL`.
- `OrigenPrecio NVARCHAR(50) NULL`.
- `DescuentoListaPct DECIMAL(9,2) NULL`.
- `SubtotalAntesRedondeo DECIMAL(18,2) NULL`.
- `RedondeoModo TINYINT NULL`.
- `PrecioFinal DECIMAL(18,2) NULL`.
- `VigenciaInicio DATETIME2(0) NULL`.
- `VigenciaFin DATETIME2(0) NULL`.
- `ReglaVersion NVARCHAR(30) NULL`.
- `FechaResolucionUtc DATETIME2(0) NULL`.
- `CorrelationId UNIQUEIDENTIFIER NULL`.

Los 13 faltantes de LP-20 quedan cubiertos; `ListaPrecioNivel`, `DescuentoListaPct` y `FechaResolucionUtc` se agregan porque el resultado LP-08 los expone y son necesarios para explicar la resolucion sin consultar estado actual.

### 10.3 Campos condicionales a decisiones PO

Si se aprueba override B:

- `PrecioOverride BIT NULL`;
- `MotivoPrecioOverride NVARCHAR(500) NULL`;
- `idUsuarioPrecioOverride UNIQUEIDENTIFIER NULL`;
- `FechaPrecioOverrideUtc DATETIME2(0) NULL`.

No deben entrar a una migracion aprobada hasta cerrar la decision.

### 10.4 Clasificacion historica

- `ReglaVersion IS NULL`: `PRE_LP08`.
- `ReglaVersion IS NOT NULL`: `LP08`.

No se agrega una columna redundante de clasificacion. API/UI derivan la etiqueta sin alterar datos.

## 11. Compatibilidad historica

- 19 cotizaciones y 70 partidas permanecen sin cambios.
- Nuevas columnas son nullable y sin defaults comerciales.
- No se llena lista, identidad extendida, precios, vigencias, regla o correlacion para historicos.
- `PrecioUnitario`, `DescuentoPct`, importes y totales actuales siguen siendo la evidencia historica disponible.
- Un documento `PRE_LP08` nunca se recalcula al abrir, editar vista, exportar PDF o clonar.
- La UI debe mostrar `Snapshot anterior a LP-08` y valores disponibles, sin advertencias tecnicas crudas.

## 12. Cantidad, identidad y lista

- Cantidad: recalculo server-side de importes con snapshot; no llama a LP-08.
- Identidad: nueva llamada LP-08; reemplazo de snapshot solo en borrador y con auditoria futura.
- Lista: nueva llamada LP-08 segun politica PO; no actualiza confirmado/cancelado.
- Precio/Listas futuros: ningun cambio en configuracion comercial altera snapshots persistidos.

## 13. Clonado

Hoy el clon copia precios y descuentos del documento origen al cliente. Esto no es una decision valida para LP-08.

La opcion A ofrece reproduccion historica; la B crea una oferta comercial vigente. Se recomienda B con comparativo por partida y referencia de origen. Hasta decision PO, clonado LP08 debe fallar cerrado o conservar el flujo preexistente solo para documentos PRE_LP08 sin afirmar certificacion.

## 14. Borradores y auditoria

El delete/reinsert actual puede conservar el resultado final, pero no la identidad estable ni la causa del cambio. No es adecuado para snapshot auditado.

Diseno recomendado:

1. conservar `id` de partidas existentes;
2. insertar nuevas partidas;
3. actualizar cantidad o campos autorizados sin reemplazar snapshot;
4. baja logica para partidas retiradas;
5. nueva resolucion y evento cuando cambia identidad/lista;
6. historial propio de Cotizaciones, separado de `ListaPreciosHistorial`.

`ListaPreciosHistorial` LP-18 permanece append-only y no simula eventos del documento.

## 15. Tenant resolver

Estado actual: MVC firma `idEmpresa/empresa/usuario/timestamp`; API valida firma e `idEmpresa`, pero abre la conexion fija.

Propuesta futura:

- contexto server-side equivalente al patron tenant vigente;
- resolver `EmpresaKey + idEmpresa` mediante `ITenantDatabaseResolver`;
- obtener `TenantDatabaseDescriptor` y DatabaseIdentity real;
- abrir conexion con `ITenantSqlConnectionFactory`;
- eliminar conexion/cadena manipulable del request;
- fail-closed ante tenant ausente, inactivo, mismatch o identidad no verificable;
- preservar las 19 cotizaciones porque el tenant UMBRELLA resuelve a la misma DatabaseIdentity certificada.

LP-20A no modifica `Program.cs` ni registros DI.

## 16. Compatibility Gate

Se requieren dos gates antes de resolver o guardar una partida LP08:

1. scope `Cotizaciones` compatible para persistir el snapshot;
2. scope `ListaPrecios` compatible para ejecutar LP-08.

Contrato de error:

| Estado | Resultado consumidor |
| --- | --- |
| `SCHEMA_EMPTY` | 409 controlado; no resolver ni guardar |
| `SCHEMA_PARTIAL` | 409 controlado; no resolver ni guardar |
| `SCHEMA_DRIFT` | 409 controlado; no resolver ni guardar |
| `INCOMPATIBLE`/Future/Unknown | 409 controlado; no fallback a PrecioPublico |
| Tenant mismatch/unavailable | 403/503 saneado; fail-closed |

UX: mensaje funcional `Cotizaciones no esta disponible temporalmente por compatibilidad de datos`; no exponer servidor, base, hash, SQL o secretos.

## 17. Scope y schema propuesto

Cotizaciones no tiene scope/versionado oficial. Se propone agregar, en ticket autorizado posterior, `DatabaseScopes.Cotizaciones` al mismo runner, gate, inventory, contract provider y paquetes existentes. No se crea un mecanismo paralelo.

### 17.1 Versiones

- V1: contrato fisico historico exacto de `Cotizaciones` y `CotizacionesPartidas`, adoptable solo si la validacion completa es `SchemaOk`.
- V2: V1 + lista explicita, identidad completa y snapshot LP-08.
- Baseline propuesto: `COTIZACIONES_V1_HISTORICAL_BASELINE`.
- MigrationId propuesto: `COT-M20260930-V1-V2-LP08-SNAPSHOT`.

Estos identificadores son propuesta de diseno, no registros oficiales ejecutados.

### 17.2 Tablas y columnas

`Cotizaciones` agrega nullable:

- `idListaPrecio UNIQUEIDENTIFIER NULL`;
- `ListaPrecioNivel TINYINT NULL`.

`CotizacionesPartidas` agrega las columnas base de la seccion 10.2 y, solo tras decision PO, las de override.

### 17.3 FK

- `(idEmpresa, idListaPrecio)` a `ListaPreciosListas(idEmpresa, id)` en encabezado y partida.
- `(idEmpresa, idProductoServicio)` a `ProductosServicios(idEmpresa, id)`.
- `(idEmpresa, idVariante)` a `ProductosServiciosVariantes(idEmpresa, id)`.
- `(idEmpresa, idPresentacionVenta)` a `ProductosServiciosPresentacionesVenta(idEmpresa, id)`.

Las FK nullable preservan historicos; requieren que las claves compuestas unicas vigentes existan y sean validadas por contrato.

### 17.4 Checks

- nivel NULL o `1..10`;
- precios NULL o `>= 0`, incluyendo cero;
- descuento lista NULL o `0..100`;
- redondeo NULL o `0..2`;
- vigencia NULL o inicio <= fin;
- forma canonica de identidad para filas LP08;
- coherencia de snapshot: PRE_LP08 permite campos nuevos NULL; LP08 exige identidad, lista, precio base/final, origen, redondeo, regla, fecha y correlacion.
- checks de override solo si PO aprueba opcion B.

### 17.5 Indices

- conservar `UX_Cotizaciones_Empresa_Folio` e indices actuales;
- `IX_Cotizaciones_Empresa_Lista_Activo (idEmpresa, idListaPrecio, Activo)` filtrable por activos;
- `IX_CotizacionesPartidas_Empresa_Lista_Identidad (idEmpresa, idListaPrecio, TipoIdentidad, idProductoServicio, idVariante, idPresentacionVenta)` filtrado a `ReglaVersion IS NOT NULL`;
- conservar `IX_CotizacionesPartidas_Cotizacion_Numero`.

## 18. Migracion propuesta

- Runner: oficial por DatabaseIdentity + Scope.
- Precondicion: infraestructura State/History/Attempts compatible y V1 fisico exacto.
- Adopcion: `ADOPTED` de V1 solo tras manifest/hash y drift 0; no inventar historia.
- V1->V2: columnas nullable, FK/checks/indices; sin backfill comercial.
- Transaccion: una transaccion del executor oficial con lock de control/scope.
- Idempotencia: MigrationId unico, cadena lineal, contrato objetivo/hash y segunda corrida `NO_PENDING_MIGRATIONS`.
- Validacion: contrato V2 y drift 0 antes de avanzar State.
- Fallo pre-commit: rollback transaccional; State no avanza.
- Post-commit: no down destructivo automatico; aplicacion anterior debe tolerar columnas aditivas. Recuperacion por `RecoverUncertainCommitAsync` o forward-fix autorizado.
- No modificar schema `ListaPrecios`.

## 19. Contrato API futuro

### 19.1 Input confiable por contexto servidor

- tenant/DatabaseIdentity;
- usuario y permisos Cotizaciones;
- estado del documento;
- gates Cotizaciones y ListaPrecios.

### 19.2 Input permitido del cliente

- `TipoIdentidad`;
- `IdProductoServicio`;
- `IdVariante` o `IdPresentacionVenta` segun forma;
- cantidad;
- nivel/lista explicita permitida;
- override/motivo solo si PO lo aprueba.

### 19.3 Input no confiable

El cliente no puede fijar `PrecioBase`, `PrecioLista`, `OrigenPrecio`, `DescuentoListaPct`, `SubtotalAntesRedondeo`, `RedondeoModo`, `PrecioFinal`, vigencias, `ReglaVersion`, fecha o `CorrelationId`.

### 19.4 Resolucion al agregar sin falsificacion

Endpoint futuro `ResolverPartidaCotizacion` llama LP-08 y devuelve DTO visual + `SnapshotToken` opaco, firmado y ligado a tenant, usuario, lista, identidad, resultado, fecha y correlacion. `GuardarCotizacion` acepta identidad/cantidad y token, valida integridad/expiracion y persiste el snapshot firmado. Token invalido o expirado exige resolver/reconfirmar; nunca acepta campos comerciales alternos.

Esta propuesta preserva el momento de resolucion al agregar sin confiar en JavaScript. No se persiste el token como secreto; se persisten sus valores verificados.

## 20. Edicion y preservacion historica

- Cantidad cambia importes, no snapshot LP-08.
- Override/descuento adicional cambian solo campos autorizados y auditados.
- Identidad/lista invalidan token/snapshot de borrador y exigen nueva resolucion.
- Documento autorizado/cancelado es read-only comercial.
- Reapertura, PDF y correo leen snapshot persistido.
- Cambios futuros a ListaPrecios no actualizan documentos.

## 21. Plan de implementacion posterior

1. Cerrar decisiones PO de la seccion 5.
2. Formalizar contrato V1/V2 Cotizaciones, hashes, baseline y migration package.
3. Certificar runner/gate con tests sin tocar UMBRELLA.
4. Ejecutar adopcion/migracion SQL real autorizada, segunda corrida y drift.
5. Migrar Cotizaciones a tenant resolver normal y doble gate.
6. Integrar servicio interno LP-08 y token de snapshot.
7. Extender API/DTO/UI para lista e identidades.
8. Sustituir delete/reinsert segun decision de borradores.
9. QA automatizada y runtime con fixtures reversibles.
10. Certificar documentos PRE_LP08 intactos y nuevos LP08 completos.

## 22. QA futura

- Producto, Servicio, Variante y PresentacionVenta.
- Lista 1..10 y lista invalida.
- Precio especifico, `0.00`, fallback, inactivo y fuera de vigencia.
- Descuento ListaPrecios, redondeo y PrecioFinal.
- Cantidad sin nueva resolucion.
- Cambio de identidad/lista con confirmacion.
- Override y descuento adicional segun decision PO.
- Clonado segun decision PO.
- PRE_LP08 sin recalculo y LP08 con snapshot completo.
- Cambio posterior en ListaPrecios sin alterar documento.
- tenant/cross-tenant y ambos gates fail-closed.
- migracion idempotente, drift 0, rollback pre-commit y recovery.
- cleanup: documentos/configuraciones QA 0 y datos legitimos 0.

## 23. Riesgos

- Resolver al guardar en vez de al agregar cambiaria silenciosamente la oferta mostrada.
- Aceptar snapshot desde cliente permitiria falsificar precio.
- Reutilizar `DescuentoPct` sin separar LP-08 y Cotizaciones duplicaria descuentos.
- Backfill de historicos inventaria origen/lista/regla inexistentes.
- Mantener conexion fija podria mezclar DatabaseIdentity aunque exista filtro `idEmpresa`.
- Cambiar lista o clonar sin regla PO puede alterar precios sin consentimiento.
- Delete/reinsert impide auditoria granular y puede romper referencias futuras.
- Agregar DDL en `EnsureSchemaAsync` mantendria mutacion de schema en runtime; el futuro debe usar runner/gate oficial.

## 24. Protecciones y validacion LP-20A

- Codigo productivo modificado: 0.
- SQL/DDL/migraciones/fixtures: NO.
- Datos legitimos, usuarios y roles modificados: 0.
- `Utilerias.js`, `_Layout.cshtml`, `checkapp-ui.js`: FROZEN y sin cambios.
- Auth/Login/Firebase, Ventas, Facturacion, Legacy, ProductosServicios, Inventario y ListaPrecios: sin cambios.
- LP-19 permanece bloqueado.
- LP-21 y LP-22 no ejecutados.
- Validacion limitada a `git diff --check` y secret scan documental.

## 25. Siguiente paso

Revision PO del contrato LP-20A. No implementar Cotizaciones todavia. No ejecutar LP-21 ni LP-22.

## 26. Decisiones PO cerradas por LP-20B

Estado desde LP-20B: `DECISIONES PO CERRADAS / FROZEN`.

1. Lista: nivel 1 preseleccionado; el usuario puede elegir 1..10 solo en borrador. El encabezado conserva el contexto actual y cada partida la lista resuelta. No existen asociaciones Cliente-Lista ni Sucursal-Lista. Confirmada o cancelada no cambia lista.
2. Override: permitido solo con autorizacion Cotizaciones, motivo, usuario y fecha. El precio LP-08 original permanece en el snapshot y `PrecioUnitario` representa el precio aplicado.
3. Descuento: `DescuentoListaPct` conserva el descuento LP-08; `DescuentoPct` sigue siendo descuento adicional Cotizaciones sobre el precio aplicado, rango 0..100, sin clamp ni suma de porcentajes.
4. Cambio de lista: solo en borrador, con confirmacion y nueva resolucion de partidas LP08. Un override exige confirmacion explicita antes de reemplazarse.
5. Clonar: crea una oferta nueva, conserva `idCotizacionOrigen`, re-resuelve LP-08 y requiere comparativo antes de guardar; no copia silenciosamente snapshots anteriores.
6. Borradores: la implementacion futura conserva identidad estable, inserta nuevas, actualiza existentes y da baja logica con auditoria propia `CotizacionesHistorial`. `ListaPreciosHistorial` no se reutiliza.

LP-20B formaliza estas decisiones en contrato fisico local V1/V2, scope, manifest y package, sin ejecutar SQL ni integrar runtime.
