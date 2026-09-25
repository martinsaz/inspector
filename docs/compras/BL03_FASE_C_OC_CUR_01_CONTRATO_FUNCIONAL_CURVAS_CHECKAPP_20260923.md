# BL-03 FASE C OC-CUR-01 - Contrato funcional Curvas CheckApp

Fecha: 2026-09-23

Estado: `CERRADO / PASS PM-PO`

Modo: contrato funcional canonico. Sin codigo, sin DDL, sin migraciones, sin
datos, sin UI, sin API, sin cambios en Legacy, sin ejecutar OC-CUR-02 ni
OC-CUR-03.

## 1. Objetivo

OC-CUR-01 convierte las decisiones PO aprobadas y la auditoria Tarahumara ->
CheckApp en el contrato funcional canonico de Curvas CheckApp.

Este documento no implementa. Su funcion es cerrar el significado de negocio
de Curvas, Siembra, Huecos/Copetes, multisucursal, sugerencias y su relacion
con Ordenes de Compra, Inventario V1, Recepcion V1, ProductosServicios,
Variantes, PresentacionCompra, permisos y Patron CheckApp.

## 2. Fuentes consolidadas

- `docs/compras/MOKA_AUDITORIA_TARAHUMARA_CURVAS_OC_CHECKAPP_20260922.md`.
- `docs/compras/BL03_FASE_A_OC01_CONTRATO_FUNCIONAL_OC_RECEPCION_20260921.md`.
- `docs/compras/BL03_FASE_A_SEC01_PERMISOS_CODIGOS_OC_RECEPCION_20260921.md`.
- `docs/compras/BL03_REAPERTURA_SEC01R_ROLES_PERMISOS_OC_RECEPCION_20260921.md`.
- `docs/compras/BL03_FASE_A_ARQ01_INVENTARIO_VARIANTE_SUCURSAL_20260921.md`.
- `docs/compras/BL03_FASE_A_OC02_MODELO_SCHEMA_OC_20260921.md`.
- `docs/compras/BL03_FASE_A_INV01_SCOPE_INVENTARIO_V1_20260921.md`.
- `docs/compras/BL03_FASE_A_INV02_LIMPIEZA_HISTORICO_INVENTARIO_20260921.md`.
- `docs/compras/BL03_FASE_A_REC01_MODELO_SCHEMA_RECEPCION_20260921.md`.
- `docs/compras/BL03_FASE_B_OC03_NUEVA_OC_PATRON_CHECKAPP_20260921.md`.
- `docs/compras/BL03_FASE_B_OC03R_QA_PO_PATRON_CHECKAPP_20260921.md`.
- `docs/pattern/PATRON_CHECKAPP_GOLDEN_MASTER_COMPONENT_MATRIX_20260917.md`.
- `docs/backlog/INDICE_TRAZABILIDAD_TICKETS.md`.
- `AGENTS.md` y `CLAUDE.md`.

Legacy Tarahumara no fue consultado nuevamente. No hubo duda concreta que
justificara reabrir repos Legacy; se uso la auditoria ya existente.

## 3. Decisiones PO aprobadas y congeladas

1. Multisucursal: aprobado. Una captura puede seleccionar varias sucursales.
   La vision funcional es generar OCs independientes por sucursal bajo una
   operacion agrupadora.
2. Catalogo de Curvas + Siembra: aprobado.
3. Curvas son sugerencias: aprobado. El usuario conserva siempre la cantidad
   final.
4. Servicios permanecen en OC mixta, pero no participan en Curvas V1: aprobado.
5. Modos conservados: Manual, Pedido inicial, Rellenar curva y No pedir.

Estas decisiones no deben reabrirse en OC-CUR-02/03.

## 4. Definiciones canonicas

| Termino | Definicion funcional |
| --- | --- |
| Curva | Configuracion reutilizable de cantidad objetivo en unidad base para un producto y su variante/combinacion cuando aplique. No depende de talla ni de ropa. |
| Catalogo de Curvas | Repositorio administrable de curvas reutilizables, con estado, nombre/codigo funcional y detalle por producto/variante. |
| Siembra | Asignacion de una curva a un contexto operativo: empresa, sucursal, producto y variante/combinacion cuando aplique. |
| CurvaObjetivo | Cantidad base esperada para una sucursal + producto + variante segun la siembra vigente. |
| Existencia | Cantidad base actual en Inventario V1 para empresa + sucursal + producto + variante nullable. |
| Transito | Cantidad base ya ordenada en OC generadas/activas y todavia pendiente de recepcion confirmada. |
| Cobertura | Existencia + Transito. |
| Hueco | Faltante operativo respecto a curva objetivo. |
| Copete | Excedente operativo respecto a curva objetivo. |
| CantidadPropuesta | Resultado sugerido por el modo de curva antes de decision del usuario. |
| CantidadFinal | Cantidad que el usuario decide dejar en la OC hija. |
| Completa | Estado donde la cobertura iguala la curva objetivo y no hay hueco ni copete. |
| No pedir | Decision explicita de no generar cantidad para ese producto/variante/sucursal en esa captura. |

## 5. Formulas aprobadas

```text
Cobertura = Existencia + Transito
Hueco = max(CurvaObjetivo - Cobertura, 0)
Copete = max(Cobertura - CurvaObjetivo, 0)
Pedido inicial = max(CurvaObjetivo, 0)
Rellenar curva = max(Hueco, 0)
Manual = cantidad usuario
No pedir = 0
```

Regla de signo:

- Si `Cobertura < CurvaObjetivo`, hay Hueco.
- Si `Cobertura > CurvaObjetivo`, hay Copete.
- Si `Cobertura = CurvaObjetivo`, esta Completa.

## 6. Variantes, no tallas

Curvas CheckApp no tienen concepto de talla. La dimension atomica es:

```text
ProductoServicioId + VarianteId nullable
```

Reglas:

- Producto sin variante: `VarianteId = null`; la curva aplica al producto base.
- Producto con variante requerida: la curva aplica a una variante concreta.
- Producto con combinacion de valores: la curva aplica al identificador canonico
  de la combinacion que ya usa ProductosServicios, sin crear arquitectura paralela.
- Variantes futuras no textiles: se tratan igual que cualquier combinacion
  canonica; el contrato no asume talla, color, calzado ni ropa.
- Una curva no puede mezclar implicitamente variantes distintas. Si se quiere
  objetivo por variante, cada variante/combinacion tiene su propia cantidad base.

La implementacion futura debe validar pertenencia al mismo `idEmpresa`, al mismo
producto y al modelo de variantes vigente.

## 7. Unidad base y PresentacionCompra

Curva, Existencia, Transito, Cobertura, Hueco, Copete y CantidadPropuesta
trabajan en unidad base.

PresentacionCompra:

- No es dimension de Curva.
- Permanece independiente de PresentacionVenta.
- Se usa al convertir una necesidad base a renglones de OC.
- Debe conservar `FactorConversionSnapshot` en la OC, conforme OC-02/OC-03R.
- `CantidadBaseOrdenada` debe seguir siendo trazable.

Ejemplo aprobado:

```text
Hueco: 24 piezas base
PresentacionCompra: Caja 12
OC: 2 cajas
CantidadBaseOrdenada: 24 piezas
```

### Redondeo de PresentacionCompra

Addendum 2026-09-23:

`REQUIERE_DECISION_PO_REDONDEO_PRESENTACION = RESUELTA`.

Regla PO aprobada:

- Si `PresentacionCompra` exige multiplos cerrados, la sugerencia se redondea
  hacia arriba.
- Si permite compra en unidad base, se conserva la cantidad exacta.
- En ambos casos el usuario conserva siempre la decision final (`CantidadFinal`).

## 8. Modos de captura

### Manual

- Precondicion: el usuario tiene acceso de escritura en la captura futura.
- Propuesta: no calcula automaticamente; puede partir de cero o de una cantidad
  visible ya sugerida.
- Override: la cantidad capturada por usuario es la autoridad.
- Persistencia/snapshot futuro: debe conservar que el modo fue Manual.
- Trazabilidad: registrar cantidad propuesta previa si existia y cantidad final.

### Pedido inicial

- Precondicion: existe CurvaObjetivo o el usuario acepta capturar objetivo base.
- Propuesta: `max(CurvaObjetivo, 0)`.
- Override: usuario puede modificar cantidad final.
- Persistencia/snapshot futuro: conservar objetivo, modo, propuesta y final.
- Trazabilidad: util para primera carga, apertura de sucursal o surtido inicial.

### Rellenar curva

- Precondicion: se puede calcular Existencia y Transito.
- Propuesta: `max(Hueco, 0)`.
- Override: usuario puede modificar cantidad final.
- Persistencia/snapshot futuro: conservar existencia, transito, hueco, propuesta
  y final.
- Trazabilidad: explica que se pidio solo faltante neto.

### No pedir

- Precondicion: usuario decide excluir el renglon en esa captura.
- Propuesta: `0`.
- Override: cambiar a otro modo reabre cantidad.
- Persistencia/snapshot futuro: conservar decision de No pedir si existia
  sugerencia positiva.
- Trazabilidad: necesario para explicar por que un hueco no genero OC.

## 9. Multisucursal

Experiencia funcional aprobada:

1. El usuario inicia una operacion de compra por curvas.
2. Selecciona proveedor y una o mas sucursales.
3. El sistema calcula necesidades por sucursal.
4. El usuario revisa, cambia modo y modifica cantidades.
5. La confirmacion genera OCs independientes por sucursal.
6. Cada OC hija conserva folio, estado, recepcion e inventario propios.
7. La operacion agrupadora permite seguimiento conjunto.

Datos comunes de la operacion agrupadora:

- Empresa resuelta server-side.
- Usuario/fecha de captura.
- Proveedor seleccionado.
- Parametros generales de busqueda/calculo.
- Sucursales seleccionadas.
- Identificador de operacion.
- Estado global derivado de las OCs hijas.
- Totales agregados informativos.

Datos propios de cada OC hija:

- Sucursal destino.
- Folio de OC.
- Estado OC.
- Partidas producto/servicio.
- Recepciones.
- Movimientos de inventario derivados de recepcion.
- Cancelacion/cierre.
- Snapshots propios.

La operacion agrupadora no reemplaza la OC. Es un contenedor de trazabilidad.

## 10. Servicios

Servicios:

- No participan en Curvas V1.
- No tienen CurvaObjetivo.
- No calculan Hueco/Copete.
- No generan inventario.
- No generan series.
- Pueden agregarse manualmente a las OCs hijas.
- Pueden convivir con productos sugeridos en una OC mixta.
- Conservan las reglas actuales de OC mixta y Recepcion V1.

Si una OC hija contiene productos sugeridos por curva y servicios manuales, su
estado global sigue dependiendo de todas sus partidas, conforme OC-01/REC-01.

## 11. Transito CheckApp

Transito CheckApp representa cantidad base ordenada y todavia pendiente de
recepcion confirmada.

Frontera conceptual:

- Entra en Transito: OC generada/emitida o parcialmente recibida con cantidad
  pendiente positiva.
- Sale de Transito: recepcion confirmada que reduce pendiente.
- No participa: OC borrador, cancelada, partida cancelada o partida totalmente
  recibida.
- Varias OCs en transito para la misma sucursal/producto/variante se suman.
- Servicios no participan.

Formula conceptual:

```text
Transito = suma(CantidadBaseOrdenada - CantidadBaseRecibidaAcumulada)
```

Solo para partidas vigentes de producto inventariable, por empresa + sucursal +
producto + variante nullable.

La implementacion futura debe evitar doble conteo entre OC, recepciones
parciales y estados cancelados.

## 12. Snapshot de curva en OC

Para explicar una sugerencia historica, la OC hija debe poder reconstruir:

- Identificador funcional de la operacion agrupadora.
- Curva usada.
- Siembra/asignacion usada.
- Sucursal.
- Producto.
- Variante/combinacion nullable.
- CurvaObjetivo.
- Existencia al momento del calculo.
- Transito al momento del calculo.
- Cobertura.
- Hueco.
- Copete.
- Modo.
- CantidadPropuesta.
- CantidadFinal.
- Usuario/fecha/contexto de calculo.
- Indicador de override manual o No pedir.

No debe guardarse mas de lo necesario. El objetivo es trazabilidad y auditoria,
no duplicar todo Inventario V1 ni todo el catalogo de ProductosServicios.

## 13. Catalogo de Curvas

Contrato funcional:

- Permite alta de curva.
- Permite edicion mientras las reglas de historico lo permitan.
- Permite baja logica/desactivacion.
- Permite reactivacion si no genera ambiguedad.
- Tiene nombre visible obligatorio.
- Puede tener codigo funcional si el PO lo requiere en OC-CUR-02, pero no queda
  aprobado como campo fisico desde este ticket.
- Tiene detalle por producto + variante nullable + cantidad base objetivo.
- Debe evitar duplicidad funcional dentro de empresa segun la llave que cierre
  OC-CUR-02.
- Puede reutilizarse en varias sucursales.
- Curva inactiva no debe proponerse para nueva siembra, pero puede mantenerse
  visible en historicos.
- Vigencia temporal queda fuera de aprobacion. Si se requiere, debe documentarse
  en OC-CUR-02 como decision tecnica/PO adicional.

## 14. Siembra

Contrato funcional:

- Se asigna una curva a una sucursal y a un producto/variante o conjunto de
  productos/variantes segun alcance aprobado por pantalla futura.
- La siembra es configuracion permanente hasta cambio, baja o reemplazo.
- Debe evitar ambiguedad: para una misma empresa + sucursal + producto +
  variante no puede haber dos curvas vigentes con la misma prioridad efectiva.
- Reemplazo: una nueva siembra vigente sustituye la anterior para calculos
  futuros, sin reescribir OCs historicas.
- Sin curva: el producto/variante queda como `Sin curva`; puede capturarse Manual
  pero no tiene Pedido inicial/Rellenar curva automatico salvo decision explicita
  del usuario.
- Override temporal de OC: modifica CantidadFinal de esa captura; no cambia la
  siembra permanente.

Prioridad:

- OC-CUR-01 aprueba la necesidad de prioridad/ambiguedad, pero no fija el modelo
  fisico ni algoritmo final. OC-CUR-02 debe cerrar llave y precedencia.

## 15. Huecos/Copetes

Huecos/Copetes es consulta operativa, no configuracion.

Resultado minimo a mostrar:

- Sucursal.
- Producto.
- Variante/combinacion.
- Curva objetivo.
- Existencia.
- Transito.
- Cobertura.
- Hueco.
- Copete.
- Sugerencia segun modo.
- Estado: Sin curva, Hueco, Copete, Completa, No pedir, Manual.

La consulta no crea OC por si misma. Una OC se crea solamente al confirmar una
operacion de compra.

## 16. Fronteras funcionales

- OC no mueve inventario.
- Recepcion confirmada mueve Inventario V1.
- Curvas no modifican inventario.
- Siembra no modifica inventario.
- Sugerencia no crea OC hasta confirmacion.
- Servicios estan fuera de Curvas V1.
- PresentacionCompra no altera la CurvaObjetivo base.
- `idEmpresa` siempre debe resolverse server-side en implementacion futura.
- Legacy Tarahumara no se modifica ni se usa como runtime.
- OC-03R permanece baseline; este ticket no modifica UI existente.

## 17. Patron CheckApp

Futuras pantallas complejas de Curvas deben usar `/ProductosServicios/Index`
como Golden Master real.

Tarahumara aporta inteligencia funcional, no estilo visual.

No se crea UI en OC-CUR-01.

## 18. Permisos conceptuales

Necesidades funcionales:

- Curvas agrupador: Acceso solamente.
- Catalogo Curvas: Acceso para consultar; Escritura para alta, edicion,
  desactivacion y reactivacion.
- Siembra: Acceso para consultar asignaciones; Escritura para asignar, reemplazar
  o remover.
- Huecos/Copetes: Acceso para consultar analisis; Escritura solo si una accion
  futura muta configuracion o dispara proceso persistente.

Reglas SEC:

- Padre no concede hijo.
- Pantalla funcional depende de su propio permiso.
- SuperAdmin permanece protegido/no editable.
- Las extensiones de menu/permisos deben ser aditivas y no pueden borrar menu
  existente.
- No se asignan codigos definitivos desde OC-CUR-01.
- No se modifican roles ni permisos desde OC-CUR-01.

## 19. Estados y casos borde

| Caso | Contrato funcional |
| --- | --- |
| Sin curva | Estado `Sin curva`; no hay sugerencia automatica salvo Manual. |
| Curva inactiva | No se usa para nueva siembra/calculo; historicos conservan snapshot. |
| Producto inactivo | No debe sugerirse para nueva compra salvo regla historica/PO futura; historicos se leen. |
| Variante inactiva | No debe sugerirse para nueva compra; historicos se leen. |
| Existencia 0 | Cobertura depende de Transito; si no hay transito, Hueco=CurvaObjetivo. |
| Existencia negativa | Se admite en formula como dato operativo; puede aumentar Hueco. Debe mostrarse con alerta funcional futura. |
| Transito mayor a objetivo | Copete puede ser positivo; Rellenar curva propone 0. |
| Hueco 0 | Rellenar curva propone 0. |
| Copete > 0 | No genera pedido automatico; informa excedente. |
| Cantidad manual > sugerida | Permitida si usuario tiene escritura; snapshot marca override. |
| Cantidad manual < sugerida | Permitida; snapshot marca override. |
| No pedir | Cantidad final 0 aun si Hueco > 0; snapshot obligatorio. |
| OC cancelada | Sale del Transito. |
| Recepcion parcial | Reduce Transito por cantidad base recibida confirmada. |
| Recepcion total | Transito de esa partida queda 0. |
| Varias OCs en transito | Se suman pendientes por sucursal/producto/variante. |
| Producto sin variante | Llave funcional con `VarianteId=null`. |
| Presentacion factor > 1 | Curva sigue en base; OC convierte con factor snapshot. |

## 20. Decisiones PO pendientes indispensables

Solo queda una decision indispensable no demostrable desde contratos existentes:

### `REQUIERE_DECISION_PO_REDONDEO_PRESENTACION`

Pregunta simple: cuando la necesidad base no divide exacto entre la
PresentacionCompra, que debe hacer la sugerencia?

Ejemplo: Hueco 25 piezas, caja de 12.

Opciones:

- Redondear hacia arriba: 3 cajas = 36 piezas.
- Redondear hacia abajo con advertencia: 2 cajas = 24 piezas.
- Capturar en base o permitir ajuste manual: 25 piezas.

Recomendacion PM/PO: permitir politica visible en captura, con default
conservador de redondeo hacia arriba solo si el proveedor exige compra cerrada
por presentacion; si no, permitir cantidad base/manual. Esta recomendacion no
queda aprobada por OC-CUR-01.

## 21. Handoff OC-CUR-02

OC-CUR-02 debe cerrar contrato tecnico/schema/versionado de Curvas + Siembra,
sin cambiar decisiones PO ya aprobadas.

Entidades conceptuales requeridas, sin DDL en este documento:

- Catalogo de curvas.
- Detalle de curva por producto/variante/cantidad base.
- Siembra/asignacion por sucursal/producto/variante.
- Operacion agrupadora de compra por curvas.
- Relacion de operacion agrupadora con OCs hijas.
- Snapshot minimo de sugerencia en OC/detalle.
- Estado, History, Attempts, hash, drift, gate y lock/idempotencia si aplica al
  patron CheckApp.

OC-CUR-02 no debe implementar motor de sugerencias completo si queda asignado a
OC-CUR-03.

## 22. Handoff OC-CUR-03

OC-CUR-03 debe construir el motor funcional/tecnico de Huecos/Copetes y
sugerencias.

Entradas conceptuales:

- Inventario V1: saldos por empresa + sucursal + producto + variante nullable.
- OC V1: cantidades base ordenadas pendientes.
- Recepcion V1: cantidades recibidas confirmadas.
- Siembra vigente: CurvaObjetivo.
- Modos de captura.

Salidas conceptuales:

- Existencia.
- Transito.
- Cobertura.
- Hueco.
- Copete.
- CantidadPropuesta.
- Estado.
- Snapshot para OC.

OC-CUR-03 no debe cambiar Catalogo/Siembra sin respetar OC-CUR-02.

## 23. Dictamen

OC-CUR-01 queda `CERRADO / PASS PM-PO`.

PASS significa contrato funcional completo. No autoriza implementar OC-CUR-02,
OC-CUR-03 ni tickets posteriores.

T25 permanece `FROZEN`.

Reporte Lider permanece `FROZEN`.
