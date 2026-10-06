# LP-14 - Ajuste masivo de precios

Fecha: 2026-09-30

Estado: CERRADO / AJUSTE MASIVO CERTIFICADO / QA RUNTIME AUTENTICADA PASS

## 1. Auditoria Legacy

| Capacidad Legacy | Equivalente CheckApp | Decision LP-14 |
| --- | --- | --- |
| Asignar valor exacto | Ajuste `VALOR` + `ASIGNAR` | ADOPTAR |
| Sumar/restar monto | Ajuste `MONTO` + `SUMAR/RESTAR` | ADOPTAR |
| Sumar/restar porcentaje | Ajuste `PORCENTAJE` + `SUMAR/RESTAR` | ADOPTAR |
| Precio P1..P10 | Lista destino canonica 1..10 | ADAPTAR |
| Descuento D1..D10 | `DescuentoPct` V2 | ADAPTAR |
| Aplicar al universo filtrado | Seleccion explicita por identidad vendible | ADAPTAR; el filtro no autoriza escritura |
| Clamp de precio/descuento | Validaciones LP-08 con rechazo controlado | ADAPTAR; no ocultar entradas invalidas |
| Transaccion unica | Lote SQL `Serializable` con rollback total | ADOPTAR |
| Costo | Fuera del contrato ListaPrecios V2 | NO APLICA |
| Copiar lista/promociones | Tickets posteriores | NO APLICA |

No quedaron decisiones monetarias PO pendientes. Redondeo y vigencias se conservan desde la resolucion LP-08; el ajuste no los redefine.

## 2. Contrato implementado

- Seleccion individual o multiple mediante checkbox por fila del DynamicGrid.
- Cambiar filtros/recargar datos limpia la seleccion; nunca se escribe sobre el conjunto filtrado implicitamente.
- Lista destino explicita 1..10.
- Campos soportados: Precio y Descuento.
- Preview backend sin persistencia con before, after, diferencia, descuento, redondeo, precio final y rechazo por identidad.
- Confirmacion explicita posterior al preview; cualquier rechazo deshabilita la ejecucion.
- Producto, Servicio, Variante y PresentacionVenta usan sus llaves canonicas.
- Ejecucion recalcula en backend y persiste todo el lote dentro de una sola transaccion SQL `Serializable`.
- Historial conserva `INDIVIDUAL` y registra lotes como `MASIVO`, con un `CorrelationId` comun.
- Duplicados, identidad/lista inactiva o invalida, cross-tenant, precio negativo y descuento invalido impiden persistencia parcial.

## 3. Permisos

- Preview: `05001008` READ.
- Ejecucion: `05001009` WRITE.
- El boton Ajuste masivo solo se renderiza con WRITE; el proxy MVC y el endpoint API vuelven a exigir WRITE.
- No se crearon permisos, roles ni usuarios.

## 4. Verificacion automatizada real

- `ListaPreciosServiceTests`: 69/69 PASS; 14 casos LP-14 nuevos contando las cuatro filas de la teoria aritmetica.
- Casos LP-14: valor exacto; monto +/-; porcentaje +/-; descuento valido/invalido; seleccion vacia; lista invalida; cuatro identidades; duplicado; cross-tenant; ejecucion/origen/correlacion; rollback.
- Full suite: 634/634 PASS, baseline 619/619.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check ListaPrecios.js`: PASS.
- `git diff --check` MVC/API: PASS.
- Secret scan acotado a archivos LP-14: PASS, 0 coincidencias.

Warnings NuGet/nullability/analyzers preexistentes permanecen fuera de alcance.

## 5. QA runtime y responsive

- UMBRELLA 163: BLOQUEADO. Los perfiles IAB y Chrome `checkapp.com.mx` redirigieron a Login; no habia sesion reutilizable ni credenciales autocompletadas.
- No se recuperaron, imprimieron ni persistieron credenciales. No se eludio Login/Firebase/tenant resolver.
- Flujo Seleccionar -> Preview -> Confirmar -> Guardar -> Grid -> Historial: NO CERTIFICADO EN RUNTIME REAL.
- Desktop 1440, Tablet 820 y Mobile 390: NO CERTIFICADOS autenticados.
- Fixtures: 0; cleanup: no requerido; datos legitimos modificados: 0.

## 6. Protecciones

- `Utilerias.js`: sin cambios; SHA-256 `c311fca34ad0b4006898dc36346006d257c8c8fdbe2e2b8e21a1a763a986fb0d`.
- `_Layout.cshtml`: sin cambios; SHA-256 `085f7809037b5ace0d503773dda79c07ef51886894e2e7c5d30f25eb7545d7fb`.
- `checkapp-ui.js`: sin cambios; SHA-256 `63d3a4ca246de4197678556d836ef1f829fd15631565e14f32339e01d6a5ed16`.
- Sin cambios de schema, migraciones, Auth/Login/Firebase, inventario, ProductosServicios funcional o Legacy.
- LP-15 no ejecutado.

## 7. Dictamen

LP-14 NO CERRADO.

Bloqueo exacto: falta sesion autenticada normal para certificar UMBRELLA 163, permisos reales, persistencia/historial/cleanup y responsive 1440/820/390.

Siguiente paso: REVISION PO / retoma QA autenticada LP-14. NO EJECUTAR LP-15.

## 8. LP-14R2 - Hotfix historial de reactivacion y cierre

### Defecto y correccion

- Defecto reproducido: al reactivar mediante lote una configuracion inactiva cuyos valores comerciales no cambiaban, `Activo` pasaba de `0` a `1`, pero no se insertaba historial porque la politica solo comparaba precio, descuento, redondeo y vigencias.
- Causa raiz: `GuardarPrecioInTransactionAsync` reactivaba la fila antes de evaluar el historial y no contemplaba el cambio de estado como evento auditable.
- Hotfix acotado: la politica `ListaPreciosHistorialPolicy.RequiresReactivationHistory` registra `Activo 0 -> 1`, operacion `REACTIVACION`, cuando no existe otro cambio comercial. Reutiliza el `Origen` y `CorrelationId` del comando oficial.
- La reactivacion con cambio comercial conserva solo el historial comercial correspondiente; una configuracion ya activa sin cambio real no genera historial artificial.
- El camino compartido preserva `INDIVIDUAL` para edicion individual y `MASIVO` para ajuste masivo.

### Pruebas y regresion

- `ListaPreciosServiceTests`: 75/75 PASS, incluidos seis casos focales nuevos para reactivacion, no duplicidad, no-op activo, correlacion/origen masivo, baja logica y origen individual.
- Full suite: 640/640 PASS.
- Build API: PASS, 0 errores; Build MVC: PASS, 0 errores.
- `node --check ListaPrecios.js`: PASS.
- `git diff --check` MVC/API: PASS.
- Secret scan acotado: PASS, 0 secretos detectados.

### QA runtime autenticada UMBRELLA 163

- Acceso normal por Login/Firebase/tenant resolver; empresa UMBRELLA, `idEmpresa=163`.
- Lote QA de dos identidades, Producto y Servicio, sobre Lista 10: preview `2 aceptadas / 0 rechazadas` sin persistencia; ejecucion unica PASS.
- Precio exacto `0.00`: persistencia y resolucion PASS, sin fallback mientras las configuraciones estuvieron activas.
- Historial posterior al lote: ambas identidades registraron `Activo 0 -> 1`, operacion `REACTIVACION`, origen `MASIVO`, dentro de la misma operacion y con correlacion comun al lote.
- No se genero evento comercial duplicado para valores sin cambio; la repeticion activa sin cambio no agrego historial.
- Transaccion `Serializable` y rollback total: PASS por implementacion y prueba automatizada; persistencia parcial `0`.
- F5, filtros LP-10, fotografias LP-11, DynamicGrid LP-12, inventario LP-13 y editor LP-09: PASS.
- Responsive autenticado: Desktop `1440`, Tablet `820` y Mobile `390` PASS; en mobile `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`, sin overflow.

### Cleanup autorizado por PO

- Se ejecuto exclusivamente el mecanismo oficial de baja logica sobre los dos fixtures LP-14R2; no hubo SQL manual ni hard delete.
- Producto: `Activo 1 -> 0`, historial de baja `INDIVIDUAL` PASS y fallback a precio base restaurado.
- Servicio: `Activo 1 -> 0`, historial de baja `INDIVIDUAL` PASS y fallback a precio base restaurado.
- Configuraciones QA activas: `2 -> 0`; residuos: `0`.
- Historial append-only preservado; datos legitimos, usuarios y roles modificados: `0`.

### Protecciones y dictamen final

- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: FROZEN, sin cambios y con hashes preservados.
- Schema, migraciones, Auth/Login/Firebase, inventario, ProductosServicios funcional y Legacy: sin cambios.
- LP-15 no fue ejecutado.

LP-14 = CERRADO / AJUSTE MASIVO CERTIFICADO / HISTORIAL MASIVO CERTIFICADO / QA RUNTIME AUTENTICADA PASS / LISTO HANDOFF LP-15

Siguiente paso: REVISION PO. NO EJECUTAR LP-15.
