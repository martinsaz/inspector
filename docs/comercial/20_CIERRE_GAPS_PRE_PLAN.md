# 20 CIERRE GAPS PRE PLAN

Fecha: 2026-08-17

## GAP 01

Gap:

Pedido parcial / múltiples ventas.

Evidencia:

- `VentaPedidoOrigenRefRequest` solo contiene `Llave` y `Folio`.
- `POST /ventas/cobrar` actualiza `detorder.ticket`, `detorder.status = 5` y `pedidos_clientes.estado = 'SURTIDO'`.
- `GET /ventas/pedidos-cliente/vigentes` y `POST /ventas/pedidos-cliente/cargar` solo consideran renglones con `status IN (0,3,4)` y ticket vacío.
- No existe campo auditado de cantidad surtida o pendiente en el flujo comercial POS revisado.

Conclusión:

- No quedó confirmada parcialidad real.
- La evidencia apunta a surtido total por renglón y cierre completo del pedido referenciado.

Impacto sobre CheckApp:

- No debe asumirse surtido parcial como “paridad Legacy”.

Decisión PO si existe:

- Sí. Ver `DEC-002`.

## GAP 02

Gap:

Caja POS.

Evidencia:

- `CajaId` participa en cotización, pedido, venta, devolución y corte.
- `POST /ventas/cobrar` requiere `CajaId`, pero no valida una apertura formal previa.
- Sí existen `liquidaciones`, `liquidacionesDetalle`, `fondocaja/fondocajas` y retiros.
- El endpoint de retiros usa cajero y caja, pero es un flujo independiente de venta.

Conclusión:

- Caja sí existe como dimensión operativa.
- Apertura/cierre formal obligatorios para vender no quedaron confirmados.

Impacto sobre CheckApp:

- Primera versión puede apoyarse en `CajaId` como contexto.
- Si negocio exige caja formal, debe tratarse como alcance nuevo.

Decisión PO si existe:

- Sí. Ver `DEC-003`.

## GAP 03

Gap:

Vendedor / cajero / operador.

Evidencia:

- `req.VendedorId` se valida contra vendedores elegibles por asistencia.
- `empleadoCajero = GetEmpleadoNumeroByUsuarioAsync(...)`.
- La ejecución del cobro la hace el usuario autenticado.
- En Legacy actual hay separación técnica entre vendedor y cajero.

Conclusión:

- Vendedor y cajero pueden ser distintos.
- Vendedor sí depende de asistencia.
- El cajero nace del usuario autenticado.

Impacto sobre CheckApp:

- Debe separarse identidad de acceso de identidad operativa POS.

Decisión PO si existe:

- Sí. Ver `DEC-004` y `DEC-005`.

## GAP 04

Gap:

Asistencia POS CheckApp.

Evidencia:

- `GetVentaVendedoresElegiblesAsistenciaAsync` toma el último movimiento del día en `logdia`.
- Solo deja elegibles movimientos tipo `ENTRADA` en la sucursal actual.
- El login ya puede registrar asistencia automática.

Conclusión:

- Asistencia sí es regla viva de elegibilidad POS.
- No es solo bitácora histórica.

Impacto sobre CheckApp:

- Venta y devolución deben depender de una sesión operativa vigente por sucursal.

Decisión PO si existe:

- Sí. Ver `DEC-006`.

## GAP 05

Gap:

Flete.

Evidencia:

- En corte y acumulados se usa `fma.flete`.
- No apareció catálogo maestro comercial confirmado.
- No se detectó como partida inventariable del flujo POS auditado.

Conclusión:

- Flete vive hoy como cargo financiero asociado a la venta.
- No hay evidencia suficiente para tratarlo como SKU POS Legacy.

Impacto sobre CheckApp:

- Conviene modelarlo como cargo global comercial, no como inventario.

Decisión PO si existe:

- Sí. Ver `DEC-007`.

## GAP 06

Gap:

Activos.

Evidencia:

- Legacy POS auditado no confirmó activos como partida de venta.
- CheckApp sí tiene módulo `Activos`.
- CheckApp sí tiene `ProductosServicios` para lo vendible.

Conclusión:

- No debe asumirse que un activo sea vendible por paridad Legacy.

Impacto sobre CheckApp:

- El activo debe quedar, por defecto, como referencia o contexto.

Decisión PO si existe:

- Sí. Ver `DEC-008`.

## GAP 07

Gap:

Venta libre vs venta desde pedido.

Evidencia:

- Legacy soporta venta libre.
- Legacy soporta venta desde pedido.
- `cotización -> pedido -> venta` ya existe y está confirmada en backend.

Conclusión:

- Ambos caminos existen y son válidos en Legacy.

Impacto sobre CheckApp:

- El modelo comercial final debe decidir si conserva ambos caminos o fuerza uno.

Decisión PO si existe:

- Sí. Ver `DEC-001`.

## GAP 08

Gap:

Cotización CheckApp -> Pedido.

Evidencia:

- Existe `POST /cotizaciones/{id}/convertir-pedido`.
- Solo convierte cotizaciones `AUTORIZADA`.
- Escribe `pedidos_clientes` + `pedidos_clientes_det`.
- Marca cotización `CONVERTIDA`, guarda `pedido_folio_convertido`, `fecha_convertido`, `usuario_convertido`.
- El servicio Blazor `VentasCotizacionesService.ConvertirAPedidoAsync` ya consume ese endpoint.

Conclusión:

- El backend central ya tiene la transición crítica.
- La brecha principal ya no es “existencia del proceso”, sino amarre completo del estado y su experiencia operativa de venta.

Impacto sobre CheckApp:

- El estado `CONVERTIDA` sí es necesario y ya existe.
- Falta consolidar su uso completo en operación comercial.

Decisión PO si existe:

- Parcial. La existencia está cerrada; la política de uso depende de `DEC-001`.

## GAP 09

Gap:

Modelo de partida comercial CheckApp.

Evidencia:

- `ProductosServicios` ya soporta producto y servicio.
- `PermiteVentaSinExistencia` ya soporta negativos controlados.
- Activo y flete siguen abiertos conceptualmente.

Conclusión:

- La base correcta de partida comercial es `ProductosServicios`.
- Activo y flete requieren decisión explícita, no improvisación de implementación.

Impacto sobre CheckApp:

- El modelo de partida debe nacer centrado en producto/servicio y extenderse solo con decisión PO.

Decisión PO si existe:

- Sí. Depende de `DEC-007` y `DEC-008`.

## GAP 10

Gap:

Nota de crédito / vale.

Evidencia:

- Ambos se generan en postventa.
- Ambos regresan como documento de pago.
- Aplicación parcial sigue no confirmada.

Conclusión:

- Se puede unificar conceptualmente, pero no debe inventarse aplicación parcial.

Impacto sobre CheckApp:

- Conviene diseñar primero el modelo documental y luego sus reglas de uso.

Decisión PO si existe:

- Sí. Ver `DEC-009`.

## Cierre

Gaps cerrados con evidencia:

- pedido parcial como comportamiento Legacy confirmado: `NO`
- múltiples ventas sobre mismo pedido Legacy confirmado: `NO`
- caja como sesión formal obligatoria previa a venta: `NO CONFIRMADA`
- vendedor y cajero distintos técnicamente: `SÍ`
- asistencia del vendedor como requisito real: `SÍ`
- flete como inventario: `NO`
- activo como partida POS Legacy: `NO CONFIRMADO`
- venta libre Legacy: `SÍ`
- venta desde pedido Legacy: `SÍ`

Siguiente paso correcto:

- No generar todavía plan de implementación.
- Esperar decisiones PO del documento `19_DECISIONES_PO_CICLO_COMERCIAL.md`.
