# LP-QA01 — Corrección QA manual PO Lista de Precios

Fecha: 2026-10-02  
Estado: **IMPLEMENTADO / QA TÉCNICA PASS / PENDIENTE QA MANUAL PO**

Este ticket supersede cualquier texto histórico que pudiera interpretarse como aprobación PO definitiva de la experiencia actual de Lista de Precios. No declara aprobación ni congelamiento visual nuevo.

## Alcance implementado

- Filtros ordenados por identidad, clasificación, precio/inventario y visualización; búsqueda exitosa pliega el acordeón y conserva un resumen en chips.
- Descuento triestado (`Todos`, `Con descuento`, `Sin descuento`) evaluado en servidor sobre la lista seleccionada; un precio `0.00` sigue siendo una configuración válida e independiente del descuento.
- `Todas las sucursales` activo por defecto y multiselección de sucursales para sumar existencia desde Inventory V1, siempre acotada por tenant.
- Fotografías desactivadas por defecto. Activarlas sólo cambia la columna/tarjeta visual; no altera el universo ni el Excel.
- Un único DynamicGrid con selección LP-14, búsqueda, columnas, paginación, Excel y scroll horizontal local. La matriz principal presenta `P1/D1%` hasta `P10/D10%`; `NULL` significa ausencia y `0` se conserva como valor numérico configurado.
- Consulta matricial server-side en una sola ida a SQL: precio base, configuración seleccionada y diez niveles se proyectan junto con cada identidad, sin resolver una vez por renglón.
- Existencia clicable abre detalle por sucursal y movimientos canónicos, con entradas, salidas, saldo anterior/posterior, fecha y referencia. Servicios muestran `N/A`. Curva, Tránsito y Pedidos se presentan explícitamente como `Integración pendiente`.
- Clic en una celda Pn/Dn abre un editor matricial de diez listas enfocado en el nivel elegido. Lectura queda sin persistencia; escritura requiere `05001009`, permite preview LP-08, vigencias, redondeo, baja lógica y guardado de los renglones modificados en una transacción serializable con correlación común.
- Excel excluye fotografía, URL, selección y acciones; conserva valores numéricos en P/D, cero numérico y celda vacía cuando no existe configuración.

## Seguridad y compatibilidad

- Lectura: `05001008`; escritura: `05001009`.
- El MVC continúa usando el proxy firmado y la empresa de sesión; API resuelve la empresa normal y todas las consultas incluyen `idEmpresa`.
- Sin cambios en schema, migraciones, Auth/Login/Firebase/Session/Cookies/Claims/Program.cs, ProductosServicios ni Inventory V1.
- Sin cambios en `Utilerias.js`, `_Layout.cshtml` o `checkapp-ui.js`; Legacy Rarámuri y sazapi permanecieron read-only.

## Verificación técnica

- `node --check checklist/wwwroot/js/ListaPrecios/ListaPrecios.js` — PASS.
- Build MVC `checklist/checklist.csproj` — PASS, 0 errores (warnings históricos del repositorio).
- Build API `checklistWs/checklistWs.csproj` — PASS, 0 errores (warnings históricos del repositorio).
- Suite focal `ListaPrecios` — PASS `177/177`; cubre descuento triestado, cero vs ausencia, matriz, transacción/correlación y contratos MVC.
- Suite completa — PASS `775/775`.
- Smoke visual local — no ejecutable en esta sesión: `localhost:5200` rechazó la conexión. No se inició sesión ni se inventaron credenciales; permanece incluido en la QA manual PO pendiente.

## QA manual PO pendiente

La aprobación final requiere una sesión autenticada normal en empresa válida y recorrido PO en `1440`, `820` y `390` px. Hasta entonces el único dictamen permitido es: **IMPLEMENTADO / QA TÉCNICA PASS / PENDIENTE QA MANUAL PO**.

## QA manual PO — rechazada visualmente

Denisse rechazó la composición visual previa del bloque de filtros antes de continuar la certificación funcional: sucursales desalineadas, checkbox separado de su texto, multiselect mal colocado, controles encimados, pie de filtros amontonado, espacios irregulares y jerarquía insuficiente. Este resultado no invalida la regresión funcional de LP-QA01R5, pero sí impide cualquier declaración de aprobación PO o congelamiento visual definitivo.

## LP-QA02 — Corrección visual filtros

Estado: **CORRECCIÓN VISUAL IMPLEMENTADA / QA TÉCNICA PASS / PENDIENTE QA MANUAL DENISSE**.

- El encabezado conserva una sola jerarquía: `Lista de Precios` y `Consulta y edición por producto o servicio`; se retiró el título redundante y el copy técnico del panel de resultados.
- Los filtros se reorganizaron en filas conceptuales de búsqueda/clasificación, atributos, condiciones comerciales e inventario, con densidad compacta y espaciado consistente.
- `Todas las sucursales` y su multiselect forman un único grupo visual. El multiselect permanece deshabilitado y claramente atenuado al seleccionar todas; al desmarcar se habilita; el estado inicial se restauró tras la prueba.
- Fotografías reutiliza el switch homologado de ProductosServicios; Buscar y Limpiar permanecen separados y alineados a la derecha.
- CSS y textos se limitaron a ListaPrecios; no se modificó CSS/JS global, API, schema, Auth, Legacy, Inventario ni ProductosServicios.
- QA visual real autenticada UMBRELLA: `1440`, `820` y `390` px PASS, sin superposiciones ni overflow de BODY. En móvil: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`.
- Regresión: focal ListaPrecios `179/179`, suite completa `777/777`, Build MVC, `node --check`, `git diff --check` y secret scan acotado PASS.

## LP-QA03 — Paridad Legacy real

Estado: **IMPLEMENTADO / QA TÉCNICA PASS / PENDIENTE QA MANUAL DENISSE**.

- Se auditó Rarámuri/sazapi en modo read-only y se trasladó únicamente la paridad funcional respaldada por fuentes reales: atributo→valores, sucursales con checks, switch compacto, matriz P1/D1%…P10/D10% y editor matricial de diez listas.
- Las presentaciones homónimas conservan ids distintos y ahora incluyen contexto sólo cuando colisionan. Ausencia y cero se muestran como `0.00`, pero siguen diferenciados internamente y en Excel.
- UMBRELLA 163: QA autenticada funcional y responsive 1440/820/390 PASS; móvil `390/390/390`, consola sin errores. Focales `180/180`, suite `778/778`, builds API/MVC y Node PASS.
- No se añadieron Datos adicionales ni Promociones sin fuente contractual. No se modificaron schema, Auth, Legacy, Inventario, ProductosServicios ni archivos globales protegidos.
