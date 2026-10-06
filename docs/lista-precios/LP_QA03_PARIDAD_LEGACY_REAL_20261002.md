# LP-QA03 — Paridad Legacy real

Fecha: 2026-10-02  
Estado QA PO: **RECHAZADA**  
Estado del ticket: implementación y QA técnica en curso; **NO APROBADO / NO FROZEN**.

## Auditoría BEFORE — filtros y matriz

| Área | Legacy real | CheckApp antes de LP-QA03 | Gap / decisión LP-QA03 |
|---|---|---|---|
| Atributos | Rarámuri expone catálogos específicos; no implementa el modelo genérico atributo→valor de CheckApp. | Sólo selector `Atributo`; el catálogo real de valores existe en `ProductosServiciosAtributosValores` y sus relaciones tenant-scoped. | ADAPTAR al modelo real CheckApp: `Atributo` controla `Valor(es)`, limpia al cambiar y filtra server-side. Sin hardcode. |
| Presentación venta | Cada opción representa una identidad concreta. | El combo usa `Producto · Nombre`; varias presentaciones distintas pueden quedar con texto idéntico. | No usar `DISTINCT` ciego. Mantener ids distintos y añadir contexto real de la presentación cuando el texto colisione. |
| Tiendas/sucursales | `MudCheckBox` “Todas las tiendas” y `MudSelect` multiselección con check visible; todas deshabilita el selector; una o varias persisten al cerrar. | Checkbox “Todas” más `<select multiple>` nativo. | ADOPTAR interacción Legacy con dropdown local y checkbox visible por sucursal, preservando tenant y query server-side. |
| Fotografías | `MudSwitch` compacto con etiqueta “Fotografías” y ayuda “Puede tardar más.”; OFF no muestra/carga, ON muestra; no cambia dataset ni Excel. | Checkbox/`ps-switch-card` visualmente distinto. | ADOPTAR toggle compacto local de ListaPrecios; la columna sigue no exportable. |
| Matriz | Columnas P1/D1…P10/D10 construidas desde el DTO de la consulta; precios interactivos. | Un único DynamicGrid con matriz nullable; ausencia se muestra `—`; P y D ya abren el nivel correspondiente. | Mostrar `0.00` para ausencia y cero configurado, conservar `null` internamente y celda vacía en Excel. Mantener click P/D por nivel. |

## Auditoría BEFORE — Editar precios

| Campo Legacy | CheckApp antes de LP-QA03 | Decisión |
|---|---|---|
| Encabezado e identidad | Encabezado, foto y chips/contexto comercial. | Encabezado y cards técnicas de tipo/producto/categoría/marca/estatus. | ADOPTAR encabezado/foto/contexto, reducir jerga técnica. |
| Redondeo del precio final | Radios: Sin redondeo / A 4/9 / Sólo a 9. | Select de redondeo en cada fila. | ADOPTAR radios visibles; LP-08 conserva el valor por lista. |
| Alcance del redondeo | Sólo lista editada / Todas las listas + aplicar. | No hay alcance global. | ADAPTAR: lista enfocada o todas; aplicar marca filas explícitamente modificadas, compatible con guardado dirty-only. |
| Tabla de precios | `LISTA | PRECIO | DESCUENTO % | PRECIO FINAL`, diez niveles. | Ocho columnas (incluye redondeo, vigencias y estado), diez niveles. | ADOPTAR bloque principal de cuatro columnas; vigencia e historial quedan como opciones secundarias. |
| Cálculo / preview | Precio final visible; Legacy calcula en su UI/endpoint. | Preview server-side LP-08 y snapshot técnico dominante. | ADAPTAR: acción clara “Calcular precios finales”; LP-08 sigue siendo autoridad y escribe resultados en la tabla. |
| Guardado | Endpoint Legacy actualiza matriz de listas dentro de transacción. | LP-08 ya guarda una lista de comandos dentro de una transacción, con historial/CorrelationId. | Mantener LP-08; enviar sólo filas dirty. Abrir/no-op no materializa ausencias. Cero tocado explícitamente sí se envía. |
| Vigencia | No domina el bloque Legacy mostrado. | Dos columnas por fila. | ADAPTAR como sección secundaria para la lista enfocada, conservando contrato LP-08. |
| Historial | No domina el editor Legacy. | Panel lateral principal. | Conservar como acceso secundario y compacto. |
| Datos adicionales | Descripción, corrida manual, Web, Liverpool, Mercado Libre, observaciones. | No existen equivalentes contractuales LP-08. | **NO APLICA**: no inventar ni persistir campos. |
| Promociones | 2×1, 3×2, descuento en 2º, monedero; no implementadas funcionalmente en el alcance auditado. | No se muestran. | **FUERA DE ALCANCE**: no crear controles ficticios. |

## Fuentes Legacy auditadas (read-only)

- `Raramuri.blzr/Components/Pages/ProductosListaPrecios.razor`
- `Raramuri.blzr/Components/Pages/ProductosListaPrecios.razor.css`
- `Raramuri.blzr/Services/Productos/IListaPreciosService.cs`
- `Raramuri.blzr/Services/Productos/ListaPreciosService.cs`
- `Raramuri.blzr/Models/Productos/ListaPreciosModels.cs`
- `sazapi/Endpoints/Program.Endpoints.Productos.cs`
- `sazapi/Program.Helpers.cs`
- `sazapi/Program.Contracts.cs`

Legacy permanece **READ-ONLY**. La aprobación visual/funcional corresponde exclusivamente a Denisse.

## Implementación LP-QA03

- `Atributo` gobierna `Valor(es)` con catálogo tenant-scoped, limpieza al cambiar el padre y filtro server-side por ids reales.
- Presentaciones con nombre repetido conservan identidades separadas y sólo reciben contexto adicional cuando existe colisión: cantidad/unidad, precio base, orden y referencia abreviada.
- Sucursales usa dropdown con checks, selección múltiple persistente y rama `Todas las sucursales`; el selector queda deshabilitado cuando aplica a todas.
- Fotografías usa switch compacto, inicia OFF y sólo altera la visualización. La exportación continúa sin foto ni URL.
- La matriz única muestra P1/D1%…P10/D10%. Ausencia y cero se presentan como `0.00`, pero `null` se conserva internamente y exporta celda vacía.
- Click en cualquier Pn/Dn abre el editor de diez listas enfocado en el nivel correcto. El editor conserva encabezado/foto, redondeo y alcance, vigencia secundaria, preview LP-08, guardado dirty-only e historial.
- Datos adicionales Legacy: **NO APLICA**, sin equivalencia contractual. Promociones Legacy: **FUERA DE ALCANCE**.

## QA técnica y visual

- Empresa autenticada: UMBRELLA 163; resolución tenant normal y filtros acotados por `idEmpresa`.
- Atributos/valores, presentaciones inequívocas, una/múltiples/todas las sucursales, fotografías OFF/ON, búsqueda y limpieza: PASS.
- DynamicGrid único, selección, columnas, sorting, búsqueda interna, paginación 1/1 y matriz P1..P10/D1..D10: PASS.
- Existencia directa para Producto, Variante y PresentaciónVenta: PASS; Servicio: N/A. Curva/Tránsito/Pedidos muestran `Integración pendiente` sin inventar datos.
- Editor: P1, P5 y P10 enfocan la fila correcta; diez listas, precio, descuento, precio final, redondeo, alcance, vigencia, preview, guardado dirty-only e historial presentes.
- Excel real: 34 columnas, P1..P10/D1..D10, ausencias vacías y sin Foto/URL/Seleccionar/Acciones. Archivos de QA retirados de Descargas.
- Responsive: 1440, 820 y 390 PASS. En móvil: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`.
- Regresión: LP-QA03 Node PASS; focal ListaPrecios `180/180`; suite completa `778/778`; builds MVC/API PASS; consola sin errores.
- Fixtures, configuraciones QA y datos legítimos modificados: 0. Legacy Rarámuri y sazapi permanecen read-only.

Dictamen máximo: **LP-QA03 = IMPLEMENTADO / QA TÉCNICA PASS / PENDIENTE QA MANUAL DENISSE**.
