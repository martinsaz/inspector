# Auditoria Maestra Comercial V3 - Fuentes Reales Autorizadas

Fecha: 2026-08-31  
Alcance: auditoria de solo lectura de `inspector`, `inspectorapi` y sus documentos versionados. No se ejecuto SQL ni se modifico codigo.

## Regla de verdad aplicada

Un componente solo suma al estado real cuando hay evidencia explicita de autorizacion o aprobacion del Product Owner dentro del alcance actual. Estar en `master`, compilar, tener UI, tabla, endpoint o commit no es evidencia suficiente. Los artefactos clasificados como `NEXT` se reportan por separado y no se contabilizan. Legacy solo se usa como referencia funcional.

La evidencia documental autorizada y especifica localizada para el alcance comercial es el cierre de Tickets 01 a 07.1 de `Productos y Servicios` en `AGENTS.md` y `CLAUDE.md`: QA manual del PO, funcionalidades congeladas y reglas logisticas aprobadas. No se localizo una autorizacion equivalente que incorpore OC, Cotizaciones, Pedido, Venta, Cobro, Devoluciones, Formas de Pago o Ajustes PV al sistema comercial actual. Las aprobaciones aisladas de correo/PDF de Cotizaciones no autorizan por si mismas la adopcion del vertical, sus tablas ni su flujo completo.

## Fase 0 - Inventario de fuentes

| Ruta o conjunto | Tipo | Dominio | Origen | Evidencia de clasificacion | PO autorizo uso actual | Contabilizable |
|---|---|---|---|---|---|---|
| `checklist/Controllers/ProductosServicios`, `Views/ProductosServicios`, `wwwroot/js/ProductosServicios` | MVC, vista, JS | Productos y Servicios | ACTUAL AUTORIZADO | Tickets 01-07.1 y cierre QA PO 2026-08-25 | SI | SI |
| `checklistWs/Controllers/ProductosServicios`, `Models/ProductosServicios`, `Scripts/productos-servicios-up.sql` | API, modelo, SQL | Productos y Servicios e inventario base | ACTUAL AUTORIZADO | Mismo cierre; la documentacion identifica las tablas como fuente vigente del ticket | SI | SI |
| `checklist/Controllers/Activos/OrdenesCompraController.cs`, vistas y JS asociados | MVC, vista, JS | OC | NEXT NO AUTORIZADO | Commit `75d8776 Ordenes de Compra 01`; no hay cierre/alta PO de este vertical dentro del alcance actual | NO DEMOSTRABLE | NO |
| `checklistWs/Controllers/OrdenesCompra`, `Models/OrdenesCompra`, `Scripts/ordenes-compra-*.sql` | API, modelo, SQL | OC | NEXT NO AUTORIZADO | Commit `283f2b8 Ordenes de Compra 01`; no hay evidencia de homologacion o aprobacion PO para reutilizarlo | NO DEMOSTRABLE | NO |
| `checklist/Controllers/Cotizaciones`, `Views/Cotizaciones`, `wwwroot/js/Cotizaciones` | MVC, vista, JS | Cotizaciones | NEXT NO AUTORIZADO | Commits `83a2b21`, `2e49fc6`, `493edcc`; existen aprobaciones puntuales de entrega, no autorizacion verificable de adopcion integral actual | NO DEMOSTRABLE | NO |
| `checklistWs/Controllers/Cotizaciones`, `Models/Cotizaciones` y `checklist/docs/agentes/sql/cotizaciones-up.sql` | API, modelo, SQL documental | Cotizaciones | NEXT NO AUTORIZADO | Codigo y script fisicos sin evidencia de PO que los incorpore al alcance comercial actual | NO DEMOSTRABLE | NO |
| `checklist/Controllers/Ventas`, `Views/Ventas` | MVC, vista | Venta y devolucion | PLACEHOLDER | Las vistas se declaran literalmente `Placeholder` y excluyen implementacion funcional | NO | NO |
| `checklist/Controllers/Ajustes`, `Views/Ajustes` | MVC, vista | Formas de pago y Ajustes PV | PLACEHOLDER | Las vistas se declaran literalmente `Placeholder` y excluyen implementacion funcional | NO | NO |
| Busqueda en MVC, API y scripts para recepcion, pedido, cobro y tablas correspondientes | controlador, API, SQL | Recepcion, Pedido, Cobro | NO EXISTE | No se localizaron componentes propios en las fuentes actuales | NO | NO |
| `skncCreator` y documentos `docs/*/legacy-*` | codigo/documentacion externa | OC, recepcion, venta y POS | LEGACY REFERENCIA | Referencia funcional auditada; no pertenece al destino actual | NO | NO |
| `Controllers/Usuario`, `Roles`, `Operadores` y modelos API asociados | MVC/API/modelo | Identidad y operacion de inspeccion | DESCONOCIDO PARA COMERCIAL | Existen desde el baseline y Operadores tiene autorizacion para Recolecciones BL26; no se localizo aprobacion para roles comerciales | NO DEMOSTRABLE | NO para capacidad comercial |
| `AUDITORIA_MAESTRA_POST_PRODUCTOS_SERVICIOS_2026-08-31.md` y `BACKLOG_MAESTRO_CHECKAPP_COMERCIAL_V2.md` | documentacion | Auditoria/backlog | CONTAMINADA POR NEXT | Contabilizan OC y Cotizaciones fisicos como estado real | NO | NO como fuente de verdad |

Nota metodologica: no se encontro una marca tecnica universal `NEXT` dentro de cada archivo. La clasificacion se determina por la instruccion vigente del PO y por ausencia de evidencia de autorizacion de uso actual. Es una clasificacion de alcance, no una afirmacion de que el codigo fisico no exista.

## Fase 1 - Productos y Servicios actual autorizado

| Capacidad | Estado autorizado | Evidencia |
|---|---|---|
| CRUD, producto vs servicio y codigos automaticos | IMPLEMENTADO Y APROBADO PO | Tickets 01, 04 y 05; cierre PO 2026-08-25 |
| Catalogos, precios, SAT y configuracion fiscal | IMPLEMENTADO Y APROBADO PO | Ticket 02 y cierre de catalogos/validaciones |
| Inventario actual por producto | IMPLEMENTADO Y APROBADO PO | El inventario se declara ya aprobado y no remezclado en Ticket 03 |
| Atributos y variantes | IMPLEMENTADO PENDIENTE QA | Ticket 03 fue implementado, pero su certificacion integral quedo condicionada por la QA manual final |
| Costo/precio por variante | IMPLEMENTADO PENDIENTE QA | El costo se incorporo en Ticket 06; Ticket 06 quedo tecnicamente cerrado, no certificado por QA UI completa |
| Imagen por variante | IMPLEMENTADO PENDIENTE QA | El modelo actual contiene `ImagenUrl` y `ImagenNombre`; la brecha historica fue atendida, pero no hay cierre QA PO especifico de la fila de imagen |
| Tags | IMPLEMENTADO PENDIENTE QA | Ticket 06 creo persistencia y UI, pero su QA completa permanece pendiente |
| Multimedia | IMPLEMENTADO PENDIENTE QA | Hay evidencia tecnica y de QA previa; no hay cierre PO especifico localizado para el alcance completo de multimedia |
| Paquetes | IMPLEMENTADO Y APROBADO PO | Ticket 02 y cierre 07.1 de persistencia/logistica |
| Pesos logísticos, ficha tecnica y PDF | IMPLEMENTADO Y APROBADO PO | Cierre 07.1: formulas, persistencia, ficha tecnica y PDF aprobados |

## Fase 2 - Ordenes de Compra

**OC actual autorizada: NO DEMOSTRABLE.** No hay pantalla, controlador, API ni tabla de OC con evidencia de adopcion por el PO para el sistema comercial vigente.

OC NEXT existe fisicamente: MVC bajo `Activos/OrdenesCompra`, API `OrdenesCompraController`, tablas `OrdenesCompra`, `OrdenesCompraDetalle` y script `ordenes-compra-up.sql`. El commit de creacion es `Ordenes de Compra 01`; no es autorizacion para el alcance actual y no se contabiliza.

OC legacy existe como referencia funcional en la auditoria SKNC, incluido flujo de recepcion. No es funcionalidad actual. No se localizo OC recientemente reconstruida y aprobada fuera de NEXT; tampoco existe solo una pantalla autorizada que pueda elevar el dictamen.

## Fase 3 - Recepcion

**Recepcion actual autorizada: NO EXISTE.** No se localizaron pantalla, controlador, API, tablas, detalle, recepcion parcial, pendientes, usuario, fecha, proveedor, variante ni movimiento actual autorizado desde OC.

La recepcion aparece en Legacy como referencia funcional. NEXT de OC tampoco contiene una recepcion vinculada: sus tablas cubren cabecera y detalle de orden, no recepciones. Por lo tanto, no hay evidencia de cadena autorizada `OC -> Recepcion -> Movimiento -> Existencia`.

## Fase 4 - Existencias

**Inventario actual autorizado: `empresa + producto`.** Pertenece a la construccion autorizada de Productos y Servicios.

La fuente es `dbo.ProductosServiciosExistencias`, complementada por `dbo.ProductosServiciosMovimientosInventario` en `productos-servicios-up.sql`. Ambas referencian `idProductoServicio`; no incluyen `idVariante`. El saldo y los movimientos son por empresa y producto. Se evidencian existencia fisica y minima en el modelo actual; no hay evidencia autorizada de comprometido, disponible, sucursal, costo promedio, trazabilidad por variante ni relacion operativa con OC/recepcion.

La tabla de variantes autorizada sí contiene costo e imagen por variante, pero no convierte el inventario a variante: `ProductosServiciosVariantes` y las existencias son entidades sin una llave de saldo comun. Este es el gap estructural real.

## Fase 5 - Cotizaciones

**Cotizaciones actual autorizada: NO DEMOSTRABLE como modulo comercial.** Hay artefactos NEXT fisicos: ruta MVC, controlador API, vistas, JavaScript, modelos y SQL documental con `Cotizaciones` y `CotizacionesPartidas`. No existe evidencia localizada de que el PO haya autorizado conservar o reutilizar esas tablas y flujo como parte del alcance comercial actual.

Se conserva evidencia de aprobacion puntual de correo/PDF para un documento de cotizacion. Eso no prueba autorizacion de la creacion, guardado, autorizacion, tablas, variantes, existencia ni conversion a pedido del vertical completo. En consecuencia no puede sumar al avance ni puede ser base del backlog; se reporta como NEXT no autorizado. Legacy puede orientar el comportamiento futuro, no el estado actual.

## Fase 6 - Resto de la cadena

| Proceso | Actual autorizado | NEXT no autorizado | Legacy referencia | Placeholder | Estado real |
|---|---|---|---|---|---|
| Pedido | No existe | No localizado en CheckApp | Si | No | NO EXISTE |
| Venta | No existe | No localizado como flujo | Si | Si, `/Ventas/Nueva` | NO EXISTE |
| Cobro | No existe | No localizado en CheckApp | Si | No | NO EXISTE |
| Devolucion | No existe | No localizado como flujo | Si | Si, `/Ventas/Devoluciones` | NO EXISTE |
| Formas de pago | No existe | No localizado como modulo | Si | Si, `/Ajustes/FormasPago` | NO EXISTE |
| Ajustes PV por tienda/sucursal | No existe | No localizado como modulo | Si | Si, `/Ajustes/AjustesPvPorTienda` | NO EXISTE |

## Fase 7 - Usuarios, roles y operadores

| Concepto | Clasificacion real autorizada para comercial | Evidencia y limite |
|---|---|---|
| Usuario | IDENTIDAD existente, pero uso comercial NO MATERIALIZADO | Controller/modelos base existen; no hay autorizacion localizada que los modele para comercial |
| Rol y permiso | ROL/PERMISO existentes, pero capacidad comercial NO MATERIALIZADA | `dbo.Roles.Permisos` es el mecanismo actual; no hay matriz comercial autorizada |
| Operador | OPERADOR SEPARADO para inspeccion; no comercial | El alcance documentado es Recolecciones BL26, no asignacion comercial |
| Agente, vendedor, cajero, ayudante, administracion, super usuario, supervisor | NO MATERIALIZADO para comercial | No se localizaron entidades/roles/capacidades autorizadas con esos significados comerciales |

La tabla inicial de tipos 1-8 se conserva solo como referencia funcional solicitada por el PO. No es modelo actual ni autorizacion de implementacion.

## Fase 8 - Matriz de verdad sin NEXT

| Proceso | Actual autorizado | NEXT encontrado | Legacy encontrado | Placeholder | Estado REAL |
|---|---|---|---|---|---|
| ProductosServicios | Si | No aplica | Si | No | IMPLEMENTADO Y APROBADO PO |
| OC | No demostrable | Si | Si | No | NO DEMOSTRABLE |
| Recepcion | No | No | Si | No | NO EXISTE |
| Existencias | Si, empresa + producto | No aplica | Si | No | IMPLEMENTADO Y APROBADO PO, limitado |
| Cotizaciones | No demostrable como vertical | Si | Si | No | NO DEMOSTRABLE |
| Pedido | No | No | Si | No | NO EXISTE |
| Venta | No | No | Si | Si | NO EXISTE |
| Cobro | No | No | Si | No | NO EXISTE |
| Devolucion | No | No | Si | Si | NO EXISTE |
| Formas de Pago | No | No | Si | Si | NO EXISTE |
| Ajustes PV | No | No | Si | Si | NO EXISTE |
| Usuarios | Identidad base; alcance comercial no demostrado | No | Si | No | NO MATERIALIZADO PARA COMERCIAL |
| Operadores | Si, solo inspeccion | No | Si | No | FUERA DEL DOMINIO COMERCIAL |

## Fase 9 - Documentacion contaminada V2

| Conclusion V2 | Evidencia usada | Por que se invalida | Conclusion V3 | Impacto |
|---|---|---|---|---|
| OC existe como vertical real y es punto de partida | Codigo, script y commit NEXT | Existencia fisica no prueba autorizacion PO | OC actual: NO DEMOSTRABLE | S1 no puede adaptar OC NEXT |
| Cotizaciones es vertical funcional actual | MVC/API/tablas NEXT y aprobaciones puntuales | No prueba adopcion del vertical y sus tablas | Cotizaciones actual: NO DEMOSTRABLE | No se puede construir sobre Cotizaciones NEXT |
| S1 = inventario por variante + OC + recepcion | Inventario autorizado mezclado con OC NEXT | Encadena un modulo autorizado con uno no autorizable | S1 debe decidir/reconstruir solo lo autorizado | Roadmap se reinicia por fundacion autorizada |
| Roadmap S2-S5 amplia Cotizaciones/Pedido/Venta | Capacidades NEXT como base | La base no es contabilizable | Son construcciones nuevas sujetas a PO | Reordenar y pedir decisiones de producto |
| Inventario por variante como continuacion de OC NEXT | Modelo de variantes actual y OC NEXT | Variantes si son autorizadas; OC NEXT no | Gap valido: saldo por variante, sin comprometer diseño de OC | Mantener como discovery/diseno autorizado, no adaptacion |

## Pregunta central y dictamen

Si se ignora completamente NEXT, CheckApp conserva de manera comercial demostrable `Productos y Servicios` con catalogo, producto/servicio, inventario por empresa+producto, atributos, variantes, costo/imagen por variante, multimedia, tags, paquetes, logistica, ficha tecnica y PDF. Conserva infraestructura de identidad/roles y Operadores para inspeccion, pero no un modelo comercial autorizado de capacidades. No conserva de forma demostrable OC, Recepcion, Cotizaciones, Pedido, Venta, Cobro, Devoluciones, Formas de Pago ni Ajustes PV.

**AUDITORIA V3 REAL COMPLETADA - ESPERANDO DECISION DEL PRODUCT OWNER.**
