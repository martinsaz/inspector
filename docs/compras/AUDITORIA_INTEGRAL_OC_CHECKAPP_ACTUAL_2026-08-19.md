# AUDITORIA INTEGRAL CHECKAPP ACTUAL - ORDENES DE COMPRA

Fecha: 2026-08-19

## Estado de la corrida

- AGENTS leido: si
- CLAUDE leido: si
- Backlog comercial congelado respetado: si
- Legacy SKNC reusado solo como fuente comparativa: si
- Codigo funcional modificado: no
- SQL ejecutado de escritura: no
- Proyecto auditado MVC: `/Users/denissemendiola/dev/Inspecciones/inspector`
- Proyecto auditado API: `/Users/denissemendiola/dev/Inspecciones/inspectorapi`

## Dictamen ejecutivo

CheckApp actual ya tiene un modulo real de Ordenes de Compra con:

- wizard de captura;
- reporte administrativo;
- persistencia normalizada encabezado/detalle;
- folio concurrente por empresa;
- estados documentales `Borrador`, `Generada`, `Cancelada`;
- exportacion PDF y Excel;
- validaciones server-side;
- consumo de `ProductosServicios` como catalogo de partidas.

CheckApp actual no tiene todavia la cadena operativa completa:

- `OC -> Aprobacion formal`;
- `OC -> Recepcion`;
- `Recepcion -> ProductosServiciosMovimientosInventario`;
- `Recepcion -> ProductosServiciosExistencias`;
- `Recepcion parcial`;
- `por recibir`;
- `seriales`;
- `costo promedio recalculado por recepcion`.

Conclusión central:

- la OC actual de CheckApp es un documento operativo-administrativo funcional;
- no es todavia un motor integral de abastecimiento e inventario como el legado;
- el gap real principal frente al objetivo comercial es recepcion e impacto inventarial, no captura basica de la OC.

## Respuestas obligatorias

1. Como nace una OC:
   - desde `/Activos/OrdenesCompra/Nueva` en un wizard de 4 pasos que guarda encabezado y partidas en `dbo.OrdenesCompra` + `dbo.OrdenesCompraDetalle`.
2. Quien puede crearla:
   - usuario autenticado con acceso general al sistema; no se encontro un permiso fino propio del modulo en el codigo auditado.
3. Que datos requiere:
   - razon social, sucursal, proveedor, fecha de orden y al menos una partida.
4. Que tablas utiliza:
   - `dbo.OrdenesCompra`, `dbo.OrdenesCompraDetalle`, `dbo.OrdenesCompraFolios`, mas catalogos `RazonesSociales`, `Sucursales`, `ActivosProveedores` y `ProductosServicios`.
5. Como calcula:
   - subtotal y total son suma de partidas; cada partida valida `Cantidad * CostoUnitario`, sin impuestos dentro del modulo.
6. Que estados existen:
   - `1 = Borrador`, `2 = Generada`, `3 = Cancelada`.
7. Como cambia de estado:
   - guardado crea o actualiza borrador; generar cambia a `2`; cancelar cambia a `3`.
8. Quien aprueba:
   - no se encontro flujo de aprobacion en el modulo actual.
9. Como funciona aprobacion:
   - no existe evidencia de aprobacion formal ni multinivel.
10. Si hay multiples niveles:
   - no.
11. Que ocurre al rechazar:
   - no existe rechazo porque no existe motor de aprobacion.
12. Que ocurre al aprobar:
   - no aplica; la accion existente es `Generar`, que solo confirma documentalmente la OC.
13. Cuando se bloquea edicion:
   - cuando la OC deja de estar en `Borrador`; el backend solo permite editar borradores.
14. Que hace Reporte OC:
   - lista, filtra, resume, exporta y abre detalle modal de la OC sin regresar al wizard.
15. Que documento genera:
   - PDF y Excel de una OC individual; Excel del reporte listado.
16. Si existe recepcion:
   - no se localizo en el modulo actual de OC.
17. Si admite parcialidad:
   - no para recepcion; solo existe detalle documental de partidas en la OC.
18. Cuando afecta inventario:
   - no lo afecta en ninguna etapa observada del modulo actual.
19. Que tablas de inventario toca:
   - ninguna de forma integrada desde OC.
20. Como maneja proveedor:
   - mediante `ActivosProveedores` activo por empresa.
21. Como maneja productos:
   - mediante `ProductosServicios` activos por empresa, permitiendo producto y servicio.
22. Como maneja usuarios/permisos:
   - autenticacion general, sesion de empresa y firma HMAC entre MVC y API; sin permiso fino localizado por accion de OC.
23. Que historial conserva:
   - usuario/fecha de creacion, actualizacion y cancelacion; conserva motivo de cancelacion y archiva partidas al regrabar borrador.
24. Que ocurre despues de generar:
   - la OC queda en estado `Generada`, se puede consultar, exportar y cancelar; no se detecta paso posterior automatizado.
25. Como termina/cierra una OC:
   - hoy termina como `Generada` o `Cancelada`; no hay cierre por recepcion total/parcial.
26. Que reglas de legacy serian utiles para CheckApp:
   - recepcion parcial, trazabilidad operativa, estados separados de aprobacion y recepcion, y puente formal a inventario.

## Arquitectura actual

- MVC:
  - `checklist/Controllers/Activos/OrdenesCompraController.cs`
  - `checklist/Views/Activos/OrdenesCompra/Nueva.cshtml`
  - `checklist/Views/Activos/OrdenesCompra/Index.cshtml`
  - `checklist/wwwroot/js/Activos/OrdenesCompra/OrdenesCompra.js`
- API:
  - `inspectorapi/checklistWs/Controllers/OrdenesCompra/OrdenesCompraController.cs`
  - `inspectorapi/checklistWs/Models/OrdenesCompra/OrdenesCompraModels.cs`
- SQL:
  - `inspectorapi/checklistWs/Scripts/ordenes-compra-up.sql`

## Flujo real actual

`Pantalla -> MVC proxy -> API -> SQL directo -> tablas OC -> respuesta JSON o archivo`

Mapa resumido:

- `Nueva`
  - carga wizard;
  - consulta combos;
  - busca `ProductosServicios`;
  - guarda borrador;
  - genera OC;
  - cancela OC.
- `Reporte`
  - consulta resumen KPI;
  - consulta listado filtrado;
  - abre detalle modal;
  - exporta listado;
  - exporta documento individual.

## Hallazgos principales

- CheckApp actual ya resolvio mejor que legacy el modelo fisico de cabecera/detalle y el folio concurrente.
- La OC actual usa validacion server-side y transacciones SQL serializable en guardado, generacion y cancelacion.
- `ValidarPendientesOrdenCompra` no representa recepcion; solo detecta traslapes documentales por proveedor y productos coincidentes.
- La captura soporta productos y servicios juntos, pero no distingue un flujo especial para servicios instalables.
- No hay evidencia de impuestos, autorizaciones por monto, seriales, almacen, ni recepcion por partida.
- La sucursal existe en encabezado, pero no hay inventario por sucursal derivado de la OC.

## Documentos generados

- `docs/compras/checkapp-actual/01_ARQUITECTURA_CHECKAPP_OC.md`
- `docs/compras/checkapp-actual/02_PANTALLA_ACTUAL_OC.md`
- `docs/compras/checkapp-actual/03_REPORTE_OC_ACTUAL.md`
- `docs/compras/checkapp-actual/04_MODELO_DATOS_OC_ACTUAL.md`
- `docs/compras/checkapp-actual/05_COMPARATIVO_CHECKAPP_VS_SKNC.md`

## Limites y pendientes reales

- No se reprodujeron requests autenticados con datos reales desde navegador para evitar operacion sobre registros productivos.
- No se encontro evidencia de un modulo de recepcion OC dentro del destino actual auditado.
- La comparacion con SKNC se baso en los documentos cerrados el `2026-08-18`, sin reabrir la auditoria legacy desde cero.
