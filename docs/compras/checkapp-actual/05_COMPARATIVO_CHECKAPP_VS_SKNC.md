# Comparativo CheckApp vs SKNC

Fecha: 2026-08-19

## Enfoque

Este comparativo no busca copiar SKNC.

Busca distinguir:

- que ya hace CheckApp;
- que hace mejor CheckApp;
- que hace legacy que sigue siendo util;
- que no conviene migrar;
- cuales son los gaps reales para evolucion posterior.

## Que ya hace CheckApp

- captura de OC en UI moderna separada del reporte;
- modelo encabezado/detalle normalizado;
- folio concurrente seguro por empresa;
- validacion backend consistente;
- soporte a productos y servicios en una sola OC;
- cancelacion documental con motivo;
- exportacion PDF y Excel;
- proxy MVC -> API con contexto firmado;
- filtro administrativo y modal de detalle desde reporte.

## Que hace mejor CheckApp que legacy

- separacion real entre MVC y API;
- tabla de folios propia, sin `MAX + 1`;
- encabezado y detalle normalizados;
- restricciones SQL mas claras;
- edicion bloqueada server-side cuando la orden deja de ser borrador;
- captura mas limpia y enfocada;
- menor dependencia visible de permisos frontend para la integridad del documento.

## Que hace legacy que CheckApp todavia necesita

- recepcion de OC;
- recepcion parcial;
- distincion operativa entre orden aprobada y orden recibida;
- impacto a inventario al recibir;
- manejo de seriales en compras cuando aplica;
- trazabilidad completa del paso posterior a la orden;
- vista de abastecimiento mas alla del reporte documental.

## Que comportamiento legacy seria util adaptar

- separar estado de aprobacion del estado de recepcion;
- permitir recepcion parcial por partida;
- mantener pendiente por recibir;
- ligar recepcion con movimiento inventarial y costo promedio;
- permitir trazabilidad operativa despues de generada la OC;
- relacionar OC con demanda origen si el destino comercial lo necesita.

## Que comportamiento legacy no debemos migrar

- cabecera repetida en cada fila del detalle;
- SQL incrustado sin delimitacion de responsabilidades;
- permisos dominados por frontend;
- folio derivado de lectura agregada insegura;
- workflow ambiguo de estados entre pantallas;
- mezcla de demasiadas operaciones distintas en el mismo reporte.

## Gap real actual de CheckApp

### Gap 1 - Recepcion

No se localizaron:

- tablas de recepcion;
- endpoints de recepcion;
- UI de recepcion;
- cantidades recibidas;
- parcialidad;
- pendiente por recibir.

### Gap 2 - Inventario desde OC

No se localizaron:

- inserciones desde OC hacia `ProductosServiciosMovimientosInventario`;
- incremento de `ProductosServiciosExistencias`;
- recalculo de `CostoPromedio`;
- manejo de seriales de compra.

### Gap 3 - Aprobacion

No se localizaron:

- niveles de aprobacion;
- rechazo;
- comentario de aprobacion;
- reglas por monto o dominio.

### Gap 4 - Trazabilidad avanzada

No se localizaron:

- historial formal de cambios por renglon;
- comparativo de cantidades/costos previos;
- auditoria operativa de recepcion.

## Decision funcional recomendada

Evolucion posterior recomendada para CheckApp:

1. Mantener la arquitectura actual MVC proxy + API + tablas normalizadas.
2. No migrar arquitectura ni fisico de SKNC.
3. Construir una etapa nueva de `Recepcion OC` separada del wizard de captura.
4. Mantener inventario fisico por empresa y no forzar inventario por sucursal dentro de OC.
5. Si el comercial lo requiere, usar la sucursal de OC como contexto operativo y no como tenedor fisico de existencias.
6. Separar claramente `documento OC`, `recepcion`, `movimiento inventario` y `existencia`.

## Dictamen final

CheckApp actual ya supera al legado en base tecnica de captura de OC.

Legacy sigue superando a CheckApp en la vida posterior del documento:

- recepcion;
- parcialidad;
- inventario;
- seriales;
- cierre operativo.

Por eso, el siguiente salto correcto para CheckApp no es rehacer la OC actual, sino completar el tramo posterior `Generada -> Recepcion -> Inventario`, preservando la arquitectura actual y evitando migrar defectos estructurales de SKNC.
