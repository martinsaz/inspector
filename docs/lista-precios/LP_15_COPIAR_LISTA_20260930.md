# LP-15 - Copiar Lista de Precios

Fecha: 2026-09-30  
Estado: CERRADO / QA RUNTIME AUTENTICADA PASS  
Tenant certificado: UMBRELLA, empresa 163

## Alcance certificado

- Copia configuraciones activas entre listas canonicas `1..10` dentro del mismo tenant.
- Modos explicitos `SOBRESCRIBIR` y `MERGE`.
- Copia Precio, DescuentoPct, RedondeoModo, VigenciaInicio y VigenciaFin para Producto, Servicio, Variante y PresentacionVenta.
- Precio `0.00` se conserva como precio configurado valido.
- Preview no persiste; la ejecucion exige confirmacion y usa una transaccion `Serializable`.
- Historial usa origen `COPIA_LISTA`, operacion `NUEVO`, `REACTIVACION` o `SOBRESCRITURA`, y CorrelationId comun por lote.
- Omitidos no generan comandos ni historial nuevo.

## LP-15R2 - defecto LISTA_INVALIDA

El defecto se reprodujo con origen Lista 8 valido y destinos 1-7, 9 y 10 rechazados como `LISTA_INVALIDA`.

Causa raiz:

- `ListaPreciosService.PrepareCopyAsync` validaba correctamente `NivelDestino` como entero canonico `1..10`, pero despues exigia que ya existiera una fila activa para ese nivel mediante `ObtenerListaPorNivelAsync`.
- UMBRELLA tenia fila activa para Lista 8; los demas niveles canonicos no tenian fila interna activa previa.
- LP-08/LP-09/LP-14 no usan esa precondicion para escribir: `EnsureListaAsync` crea la fila interna de la lista canonica dentro de la transaccion cuando se guarda el primer detalle.
- Se confundio el numero comercial canonico con la existencia previa del GUID interno de `ListaPreciosListas`.

Hotfix:

- Se conserva la validacion y existencia del origen real para mantener tenant fail-closed.
- Se elimina exclusivamente la exigencia de fila activa previa para el destino.
- Un destino canonico vacio se clasifica en preview como `NUEVO`; la ejecucion reutiliza `EnsureListaAsync`.
- Sin cambios de UI, schema, migraciones, motor monetario, MERGE, SOBRESCRIBIR, historial o tenant resolver.

## Validacion de listas

- Destinos 1-7, 9 y 10 desde Lista 8 vacia: preview read-only PASS, sin persistencia y sin `LISTA_INVALIDA`.
- Destino 8 con origen distinto: PASS automatizado.
- Origen igual a destino: `ORIGEN_DESTINO_IGUALES`.
- Lista 0 y Lista 11: `LISTA_INVALIDA`.
- Cross-tenant: FAIL CLOSED.

## QA runtime UMBRELLA 163

Fixtures reversibles: Producto base, Servicio, Variante 10 L y Presentacion Pieza en Lista 8 y Lista 9.

MERGE:

- Destino vacio: `4 NUEVO`, ejecucion PASS.
- Destino activo: `4 OMITIDO`, valores destino preservados.

SOBRESCRIBIR:

- Destino activo diferente: `1 SOBRESCRIBIR + 3 OMITIDO`, ejecucion PASS.
- Destino activo identico: omitido sin cambio.
- Destino inactivo: `1 REACTIVAR + 3 OMITIDO`, ejecucion PASS.
- Historial de reactivacion: `Activo 0 -> 1`, origen `COPIA_LISTA`.

Auditoria:

- Creacion, sobrescritura y reactivacion registradas como `COPIA_LISTA`.
- CorrelationId comun por lote certificado por pruebas focales.
- Rollback total y persistencia parcial cero certificados por pruebas focales.
- Preview sin persistencia y confirmacion explicita certificados en runtime.

Responsive y smoke:

- Desktop 1440: PASS.
- Tablet 820: PASS.
- Mobile 390: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`, modal 378, PASS.
- LP-09, LP-10, LP-11, LP-12, LP-13 y LP-14: smoke PASS.

## Cleanup

- Ocho fixtures QA archivados mediante baja logica oficial por UI.
- Cada identidad registra `Activo 1 -> 0` y conserva historial append-only.
- Lista 8 configuraciones QA activas: 0.
- Lista 9 configuraciones QA activas: 0.
- Total configuraciones QA activas: 0.
- Residuos: 0.
- Datos legitimos modificados: 0.
- Hard delete: 0.
- SQL manual: NO.

## Regresion

- `ListaPreciosServiceTests`: 94/94 PASS.
- Full suite: 660/660 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check`: PASS.
- `git diff --check` MVC/API: PASS.
- Secret scan acotado: PASS.

## Protecciones

- `checklist/wwwroot/js/Utilerias.js`: FROZEN, hash preservado.
- `checklist/Views/Shared/_Layout.cshtml`: FROZEN, hash preservado.
- `checklist/wwwroot/js/checkapp-ui.js`: FROZEN, hash preservado.
- Schema, migraciones, Auth/Login/Firebase, Inventario, ProductosServicios y Legacy: sin cambios LP-15R2.
- LP-16: NO ejecutado.

## Dictamen

LP-15 = CERRADO /  
COPIAR LISTA CERTIFICADO /  
MERGE + SOBRESCRIBIR CERTIFICADOS /  
QA RUNTIME AUTENTICADA PASS /  
LISTO HANDOFF LP-16

Siguiente paso: REVISION PO. NO ejecutar LP-16 sin autorizacion.
