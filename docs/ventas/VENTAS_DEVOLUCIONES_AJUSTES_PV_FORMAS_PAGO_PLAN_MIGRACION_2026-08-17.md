# PLAN ÚNICO DE MIGRACIÓN

Fecha: 2026-08-17

## 1. Resumen ejecutivo

La auditoría Legacy de:

- `/ventas/nueva`
- `/ventas/devoluciones`
- `/ajustes/pv/tiendas-ajustes`
- `/ajustes-pv/formas-pago`

ya quedó cerrada y validó runtime real, network real, reglas de negocio, persistencia y dependencias cruzadas.

La conclusión de planeación es:

- sí conviene migrar las cuatro capacidades a CheckApp;
- no conviene copiar literalmente Rarámuri ni `sazapi`;
- el orden correcto de implementación sí es:
  1. `Ajustes PV por tienda`
  2. `Formas de pago`
  3. `Devoluciones`
  4. `Nueva venta`

Ese orden no responde a preferencia técnica. Responde a dependencias demostradas:

- `Devoluciones` depende de `DiasParaDevolver` y demás políticas por tienda.
- `Nueva venta` depende de `Formas de pago` y de reglas fiscales ligadas a esa configuración.
- `Nueva venta` también depende de clientes, productos, vendedores y checkout, por lo que es la etapa de mayor acoplamiento.

## 2. Fuente oficial y restricciones

Fuente oficial de esta planeación:

- [AUDITORIA_PREIMPLEMENTACION_LEGACY_VENTAS_DEVOLUCIONES_AJUSTES_PV_FORMAS_PAGO_2026-08-17.md](/Users/denissemendiola/dev/Inspecciones/inspector/docs/qa/AUDITORIA_PREIMPLEMENTACION_LEGACY_VENTAS_DEVOLUCIONES_AJUSTES_PV_FORMAS_PAGO_2026-08-17.md:1)

Continuidad:

- [AGENTS.md](/Users/denissemendiola/dev/Inspecciones/inspector/AGENTS.md:1)
- [CLAUDE.md](/Users/denissemendiola/dev/Inspecciones/inspector/CLAUDE.md:1)

Restricciones vigentes:

- no modificar Legacy;
- no tocar autenticación, sesión, Firebase ni login;
- no confiar en `idEmpresa` del navegador;
- reutilizar `Clientes` existente;
- reutilizar `ProductosServicios` cuando aplique;
- reutilizar `Sucursales` existentes;
- no crear catálogos paralelos si CheckApp ya tiene uno funcional;
- no copiar código Blazor ni código `sazapi`;
- migrar comportamiento, reglas, contratos y persistencia al patrón CheckApp.

## 3. Arquitectura objetivo

Arquitectura obligatoria:

- MVC en `/Users/denissemendiola/dev/Inspecciones/inspector`
- API en `/Users/denissemendiola/dev/Inspecciones/inspectorapi`
- JavaScript para experiencia rica en pantalla
- SQL propio de CheckApp
- contexto multitenant resuelto server-side

Patrón recomendado:

- MVC como shell de pantalla y proxy seguro;
- API propia con contratos estables;
- servicios internos por módulo;
- resolución de empresa desde claims/sesión;
- firma de proxy estilo `ProductosServicios` cuando el MVC llame a la API;
- validaciones críticas en API, nunca en JavaScript solamente.

## 4. Orden de implementación validado

### Etapa 01 — Ajustes PV por tienda

Debe ir primero porque expone la política base de operación por sucursal. Al menos una regla ya está demostrada en runtime Legacy:

- `DiasParaDevolver` gobierna `Devoluciones`.

Además define la frontera funcional de varios comportamientos que CheckApp debe modelar explícitamente:

- valores capturados;
- valores vacíos;
- fallback a comportamiento actual.

### Etapa 02 — Formas de pago

Debe ir después de `Ajustes PV` y antes de `Nueva venta` porque:

- `Nueva venta` consulta catálogo operativo de formas;
- la facturación POS valida `FormaFiscal` contra esa configuración;
- existe diferencia real entre catálogo administrativo y catálogo operativo.

### Etapa 03 — Devoluciones

Debe ir después de `Ajustes PV` porque consume política por tienda. No depende de `Nueva venta` nueva de CheckApp para existir; puede implementarse como flujo propio de consulta de ticket y emisión de devolución.

### Etapa 04 — Nueva venta

Debe ir al final porque depende de:

- clientes;
- productos;
- vendedores;
- formas de pago;
- reglas fiscales;
- SAT;
- checkout;
- crédito;
- validaciones transaccionales.

## 5. Decisiones transversales obligatorias

### 5.1 Empresa y tenant

- `idEmpresa` se resuelve server-side.
- MVC y API deben recibir contexto autenticado, no contexto libre del navegador.
- tienda/caja sí pueden ser seleccionadas por el usuario, pero su validez debe revalidarse en servidor.

### 5.2 Catálogos existentes a reutilizar

- `Clientes`: reutilizar para búsqueda/selección de cliente.
- `ProductosServicios`: reutilizar para catálogos administrativos y cualquier selector que aplique al modelo destino.
- `Sucursales`: reutilizar para ajustes por tienda y configuración por sucursal.

### 5.3 Tipos de estado

CheckApp debe modelar explícitamente tres estados:

- valor configurado;
- valor vacío permitido;
- comportamiento default heredado.

Eso es obligatorio para `Ajustes PV por tienda` y para cualquier pantalla que hoy dependa de fallback Legacy.

### 5.4 Seguridad funcional

- permisos y decisiones críticas se validan en API;
- el navegador no decide si una venta puede facturarse, devolverse o cobrarse;
- toda validación fiscal debe terminar en servidor.

## 6. Etapa 01 — Ajustes PV por tienda

### 6.1 Objetivo de la etapa

Crear en CheckApp un módulo administrativo por sucursal que concentre las políticas de venta/devolución necesarias para los módulos posteriores, sin arrastrar opciones Legacy que no aporten valor claro.

### 6.2 Decisión por campo

| Campo Legacy | Uso confirmado en auditoría | CheckApp | Decisión técnica | Recomendación PO |
|---|---|---|---|---|
| `DiasParaDevolver` | Sí, consumidor real en Devoluciones | Configuración por sucursal | `MIGRAR` | Aprobar |
| `DiasValidezNotaCredito` | Consumidor server-side localizado | Configuración por sucursal | `MIGRAR` | Aprobar |
| `DiasValidezValeCambio` | Consumidor server-side localizado | Configuración por sucursal | `MIGRAR` | Aprobar |
| `PorcentajeMinimoApartado` | Relacionado a apartados, fuera de este bloque inmediato | Configuración futura, no bloqueante | `ADAPTAR` y diferir consumo | Aprobar diferido |
| `DiasValidezApartado` | Relacionado a apartados, fuera de este bloque inmediato | Configuración futura, no bloqueante | `ADAPTAR` y diferir consumo | Aprobar diferido |
| `LeyendaTicketVenta` | Persistida, consumidor runtime no cerrado en esta etapa | Plantilla textual opcional | `ADAPTAR` | Aprobar opcional |
| `LeyendaTicketDevolucion` | Persistida, consumidor runtime no cerrado | Plantilla textual opcional | `ADAPTAR` | Aprobar opcional |
| `LeyendaTicketApartado` | Fuera del bloque de alcance inmediato | No crítica para estas cuatro capacidades | `DESCARTAR` en primera implementación | Aprobar descarte temporal |
| `ModoTicket` | Persistido, valor Legacy específico | Configuración de impresión/documento | `ADAPTAR` solo si CheckApp tendrá múltiple estrategia real | Aprobar diferido |
| `TicketVentaApertura` | Persistido, orientado a UX Legacy | No esencial para regla de negocio | `DESCARTAR` en primera implementación | Aprobar |
| `MostrarPrevioCobro` | Persistido, impacta UX de POS | Flag funcional de etapa 04 | `ADAPTAR` | Aprobar |
| `UsarCurvasMayoreo` | No aporta valor directo a estas cuatro capacidades | Fuera de alcance | `DESCARTAR` | Aprobar |
| `ModoEtiquetaPdf` | Relacionado a impresión/etiquetas, no a venta/devolución core | Fuera de alcance inmediato | `DESCARTAR` | Aprobar |

### 6.3 Alcance aprobado para Etapa 01

Implementar en primera versión:

- `DiasParaDevolver`
- `DiasValidezNotaCredito`
- `DiasValidezValeCambio`
- `MostrarPrevioCobro`
- soporte formal a `null/default`
- auditoría visual y funcional por sucursal

Diseñar pero dejar fuera de la primera entrega funcional:

- `PorcentajeMinimoApartado`
- `DiasValidezApartado`
- leyendas de ticket
- modos de ticket/etiqueta

### 6.4 Modelo funcional destino

Entidad conceptual:

- `PvStoreSettings`

Propiedades mínimas:

- `SucursalId`
- `DiasParaDevolver`
- `DiasValidezNotaCredito`
- `DiasValidezValeCambio`
- `MostrarPrevioCobro`
- `UsaValoresDefault`
- metadatos de auditoría

### 6.5 Contratos mínimos

MVC:

- `GET /Ajustes/AjustesPvPorTienda`

API:

- `GET /api/pv/store-settings/catalogs/sucursales`
- `GET /api/pv/store-settings/{sucursalId}`
- `PUT /api/pv/store-settings/{sucursalId}`

### 6.6 Criterio de listo

- una sucursal puede cargar configuración;
- se puede distinguir entre valor explícito y valor vacío;
- `Devoluciones` y `Nueva venta` pueden leer esta configuración en etapa posterior;
- no existe lógica de empresa en frontend.

## 7. Etapa 02 — Formas de pago

### 7.1 Objetivo de la etapa

Separar en CheckApp dos conceptos que Legacy ya distingue operativamente:

- catálogo maestro de formas de pago;
- configuración por tienda/sucursal.

### 7.2 Arquitectura objetivo

#### Catálogo maestro

Representa la definición estable de la forma:

- `Clave`
- `Nombre`
- `ClaveExterna`
- `Tipo`
- `EsPagare`
- `EsTipoTarjeta`
- `EsMonex`
- `EsInterna/Reservada`
- `Orden`

#### Configuración por sucursal

Representa cómo esa forma opera en una sucursal concreta:

- `SucursalId`
- `FormaPagoId`
- `Activa`
- `FormaFiscalId`
- flags operativos permitidos

### 7.3 Reglas especiales Legacy a preservar

| Clave | Comportamiento Legacy confirmado | Decisión de migración |
|---|---|---|
| `VD` | Oculta/restringida en lectura de configuración | Mantener como clave reservada, no visible al usuario |
| `CF` | Oculta/restringida en lectura de configuración | Mantener como clave reservada, no visible al usuario |
| `VC` | Excluida del catálogo operativo POS | Mantener fuera de formas cobrables de venta |
| `NC` | Excluida del catálogo operativo POS | Mantener fuera de formas cobrables de venta |
| `P0` | Excluida | Mantener reservada |
| `EF` | Contingencia y forma base | Mantener como forma operativa principal |
| `CR` | Crédito/pagaré/ticket con comportamiento especial | Mantener regla especial server-side |

### 7.4 Decisiones estructurales

- no modelar `formas-pago` como un solo catálogo plano;
- no permitir que la activación por sucursal reescriba el significado de la forma maestra;
- no mezclar catálogo fiscal con catálogo de formas;
- `FormaFiscal` debe resolverse como relación formal, no como texto libre.

### 7.5 Catálogo fiscal

Debe existir como fuente independiente reutilizable por API.

Decisión:

- si CheckApp ya tiene catálogo fiscal funcional, reutilizarlo;
- si no lo tiene, crear el catálogo fiscal como subsistema compartido y no como tabla ad hoc solo para POS.

### 7.6 Contratos mínimos

MVC:

- `GET /Ajustes/FormasPago`

API:

- `GET /api/pv/payment-methods/master`
- `GET /api/pv/payment-methods/catalogs/sucursales`
- `GET /api/pv/payment-methods/catalogs/fiscal-forms`
- `GET /api/pv/payment-methods/store-config/{sucursalId}`
- `PUT /api/pv/payment-methods/store-config/{sucursalId}`
- `GET /api/pv/payment-methods/operativas?sucursalId={sucursalId}`

### 7.7 Reglas obligatorias

- una forma puede existir en catálogo maestro y no estar operativa en una sucursal;
- una forma activa para venta facturable debe tener `FormaFiscal`;
- el catálogo operativo POS no es igual al catálogo administrativo;
- `CR` conserva validación diferenciada;
- `VC`, `NC` y claves reservadas no deben aparecer como cobrables en checkout.

### 7.8 Criterio de listo

- una sucursal puede activar/desactivar formas;
- la relación con `FormaFiscal` queda formalizada;
- `Nueva venta` puede consumir catálogo operativo listo para checkout;
- no se rompe la distinción entre administración y operación.

## 8. Etapa 03 — Devoluciones

### 8.1 Objetivo de la etapa

Implementar un flujo de devoluciones de ticket con política por sucursal, selección de renglones devolubles y emisión de documento resultado, conservando la lógica server-side crítica.

### 8.2 Dependencias

Depende de `Etapa 01` porque necesita:

- `DiasParaDevolver`
- `DiasValidezNotaCredito`
- `DiasValidezValeCambio`
- fallback/default por sucursal

No depende de `Nueva venta` implementada en CheckApp para poder existir.

### 8.3 Alcance funcional

Incluye:

- captura o escaneo de ticket;
- consulta del ticket;
- carga de motivos;
- visualización de artículos devolubles;
- selección de renglones;
- validación de expiración;
- creación de devolución;
- salida documental o resultado final.

No incluye en primera entrega:

- rediseño fiscal profundo;
- efectivo/tarjeta en la misma pantalla;
- flujos de apartados.

### 8.4 Contratos mínimos

MVC:

- `GET /Ventas/Devoluciones`

API:

- `GET /api/pv/returns/catalogs/motivos`
- `GET /api/pv/returns/ticket?ticket={ticket}&sucursalId={sucursalId}`
- `POST /api/pv/returns`

### 8.5 Modelo conceptual

Entidades:

- `ReturnPolicySnapshot`
- `ReturnTicketLookup`
- `ReturnTicketItem`
- `ReturnReason`
- `ReturnRequest`
- `ReturnResult`

### 8.6 Reglas a preservar

- ticket cancelado no se devuelve;
- vigencia la decide servidor, no navegador;
- cada renglón puede venir marcado como ya devuelto o no devoluble;
- cliente vacío cae a público general cuando aplique;
- la creación de devolución valida ticket e items antes de persistir.

### 8.7 Criterio de listo

- carga motivos reales;
- valida ticket real;
- respeta política por sucursal;
- persiste devolución y documento resultado;
- no duplica reglas de expiración en JavaScript.

## 9. Etapa 04 — Nueva venta

### 9.1 Objetivo de la etapa

Implementar en CheckApp la experiencia funcional de POS para venta nueva, basada en:

- cliente;
- productos;
- carrito;
- checkout;
- cobro;
- reglas fiscales;
- documentos de pago.

### 9.2 Dependencias

Depende obligatoriamente de:

- `Etapa 02` para catálogo operativo de formas de pago;
- `Clientes` existente;
- `ProductosServicios` y/o resolver de producto equivalente;
- contexto de sucursal/caja válido;
- política `MostrarPrevioCobro` de `Etapa 01`.

### 9.3 Alcance funcional

Incluye:

- cliente público general o cliente seleccionado;
- búsqueda de cliente;
- captura de SKU/código;
- resolución de producto;
- carrito;
- resumen económico;
- selección de vendedor;
- formas de pago;
- validación de checkout;
- cobro;
- facturación condicionada.

No incluye en la primera pasada si no existe contrato seguro:

- reproducción completa de UX Blazor;
- NFC si CheckApp no tiene soporte real;
- extensiones opcionales no probadas del ecosistema Legacy.

### 9.4 Contratos mínimos

MVC:

- `GET /Ventas/Nueva`

API:

- `GET /api/pv/sales/clientes/buscar`
- `POST /api/pv/sales/productos/resolver`
- `GET /api/pv/sales/productos/{barcode}/tallas`
- `GET /api/pv/sales/vendedores-elegibles`
- `GET /api/pv/sales/formas-pago-operativas?sucursalId={sucursalId}`
- `GET /api/pv/sales/formas-pago-config?sucursalId={sucursalId}`
- `GET /api/pv/sales/credito/validar`
- `GET /api/pv/sales/documentos-pago/validar`
- `POST /api/pv/sales/checkout/preview`
- `POST /api/pv/sales/charge`

### 9.5 Reglas a preservar

- no se cobra sin vendedor válido;
- no se cobra sin pagos válidos;
- crédito requiere cliente real;
- la facturación requiere cliente fiscal completo;
- la facturación requiere `FormaFiscal` en cada forma usada;
- la facturación requiere relación SAT en productos;
- el cálculo final y la autorización ocurren en API.

### 9.6 Decisión de producto

CheckApp no debe intentar clonar la interfaz de Rarámuri pantalla por pantalla.

Debe implementar:

- comportamiento equivalente;
- validaciones equivalentes;
- experiencia optimizada al patrón CheckApp.

### 9.7 Criterio de listo

- permite vender con flujo operativo completo;
- respeta reglas fiscales y de cobro;
- reutiliza clientes y catálogos existentes;
- deja toda decisión crítica en API.

## 10. Diseño MVC/API por etapa

### MVC

Pantallas destino:

- `/Ajustes/AjustesPvPorTienda`
- `/Ajustes/FormasPago`
- `/Ventas/Devoluciones`
- `/Ventas/Nueva`

Responsabilidad MVC:

- render de pantalla;
- bootstrap de contexto seguro;
- llamadas proxy a API;
- estados visuales y UX CheckApp.

### API

Responsabilidad API:

- resolver empresa por contexto autenticado;
- validar permisos;
- ejecutar reglas;
- consultar persistencia;
- responder contratos JSON estables;
- proteger operaciones de escritura.

## 11. Persistencia objetivo

No se define SQL en esta etapa, pero sí se define la necesidad de persistencia separada por dominio:

- configuración por sucursal;
- catálogo maestro de formas de pago;
- configuración de formas por sucursal;
- devoluciones;
- ventas/cobros;
- documentos derivados.

Decisión obligatoria:

- no persistir estos cuatro módulos como blobs genéricos;
- no depender de estructura Legacy para el modelo destino;
- modelar entidades de negocio propias de CheckApp con trazabilidad por empresa/sucursal.

## 12. Riesgos y mitigación

### Riesgo 1 — copiar UI Legacy en lugar de migrar comportamiento

Mitigación:

- usar patrón CheckApp;
- limitarse a reglas, contratos y experiencia funcional.

### Riesgo 2 — mezclar catálogo administrativo con catálogo operativo

Mitigación:

- separar maestro vs configuración por sucursal vs catálogo operativo POS.

### Riesgo 3 — perder soporte a `null/default`

Mitigación:

- diseñar estado tri-state desde `Etapa 01`.

### Riesgo 4 — mover reglas críticas al frontend

Mitigación:

- validaciones de venta, devolución y facturación siempre en API.

### Riesgo 5 — intentar atacar `Nueva venta` antes de sus dependencias

Mitigación:

- respetar el orden aprobado de etapas.

## 13. Checklist de aprobación PO

El Product Owner debe aprobar explícitamente:

- orden de implementación `01 -> 02 -> 03 -> 04`;
- migrar solo estos campos de `Ajustes PV` en primera entrega:
  - `DiasParaDevolver`
  - `DiasValidezNotaCredito`
  - `DiasValidezValeCambio`
  - `MostrarPrevioCobro`
- diferir o descartar en primera entrega:
  - `TicketVentaApertura`
  - `UsarCurvasMayoreo`
  - `ModoEtiquetaPdf`
  - `LeyendaTicketApartado`
- separar `Formas de pago` en:
  - catálogo maestro
  - configuración por sucursal
  - catálogo operativo
- tratar `FormaFiscal` como dependencia obligatoria de venta facturable;
- implementar `Devoluciones` antes de `Nueva venta`;
- implementar `Nueva venta` solo después de cerrar dependencias previas.

## 14. Dictamen final

Sí existe un plan de migración ejecutable y suficiente para pasar a aprobación PO sin otra iteración de planeación.

La recomendación final es aprobar exactamente esta secuencia:

1. `Ajustes PV por tienda`
2. `Formas de pago`
3. `Devoluciones`
4. `Nueva venta`

con las siguientes decisiones de producto:

- migrar solo reglas y capacidades necesarias;
- no heredar opciones Legacy innecesarias;
- separar configuración administrativa de operación POS;
- dejar todas las reglas críticas en API;
- reutilizar catálogos y módulos CheckApp existentes cuando ya resuelvan el problema.
