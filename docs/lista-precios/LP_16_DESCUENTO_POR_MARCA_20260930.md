# LP-16 - Descuento por marca

Fecha de certificacion: 2026-09-30

## Estado

LP-16 cerrado. Descuento por marca certificado con QA runtime autenticada en UMBRELLA, empresa 163. LP-17 no fue ejecutado.

## Auditoria Legacy

- Fuente auditada: `Program.Endpoints.Productos.cs`, `Program.Contracts.cs` y `ProductosListaPrecios.razor` del sistema Legacy.
- Legacy recibe Marca, Descuento, Lista e IncluirInactivos; valida descuento `0..100` y lista `1..10`.
- Reemplaza el descuento de la lista elegida, no lo acumula. Por defecto excluye productos inactivos y actualiza solamente filas existentes de `precios`.
- Legacy no aporta transaccion ni historial comercial equivalente al motor V2.

## Contrato CheckApp

- La marca se valida dentro del tenant actual y el universo se reconstruye server-side desde identidades activas; la UI no autoriza identidades.
- Producto, Variante y PresentacionVenta heredan la marca real del producto. Servicio participa solo si su registro real tiene marca.
- El descuento reemplaza `DescuentoPct`, admite `0..100` y preserva Precio, Redondeo y Vigencias.
- Una configuracion inexistente se crea desde el precio efectivo/fallback. Una configuracion inactiva se reactiva conservando sus campos comerciales y aplicando el descuento.
- Una configuracion activa con el mismo descuento se omite sin escritura ni historial.
- Lista canonica `1..10` es valida aunque aun no tenga configuraciones; marca invalida o de otro tenant falla cerrado.
- No quedan decisiones PO pendientes para LP-16.

## Implementacion

- API expone preview READ y ejecucion WRITE; MVC conserva permisos `05001008` y `05001009`.
- El calculo monetario se delega al motor LP-08. JavaScript solo captura datos y presenta snapshots devueltos por servidor.
- La ejecucion reutiliza el escritor masivo Serializable de LP-14, con rollback total y persistencia parcial cero.
- Historial append-only con origen `DESCUENTO_MARCA` y un CorrelationId comun por operacion.
- Preview informa crear, actualizar, reactivar u omitir y nunca persiste.

## QA autenticada UMBRELLA 163

- Marca real: Mobil 1. Universo: 9 identidades activas, compuesto por Producto, 4 Variantes y 4 PresentacionesVenta; el Servicio sin marca quedo fuera.
- Preview inicial Lista 10, descuento 25%: 9 evaluados, 9 afectados, 0 omitidos, 0 rechazados; sin persistencia antes de confirmar.
- Ejecucion: 6 creaciones y 3 reactivaciones. Tres precios `0.00` se preservaron y su precio final continuo en `0.00`.
- Segundo preview identico: 9 evaluados, 0 afectados, 9 omitidos, 0 rechazados.
- Historial visible: `DESCUENTO_MARCA`; pruebas automatizadas confirman CorrelationId comun y ausencia de comandos para no-op.
- Otra marca y cross-tenant: fail-closed cubierto por pruebas automatizadas; el Servicio real sin marca permanecio intacto.
- Responsive autenticado: Desktop 1440 PASS, Tablet 820 PASS, Mobile 390 PASS. Se corrigio localmente el contraste heredado de botones secundarios en ListaPrecios.

## Cleanup

- Se ejecutaron 9 bajas logicas mediante la UI oficial, sin SQL manual y sin hard delete.
- Conteo verificado por paso: `9 -> 8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1 -> 0`.
- Estado final Lista 10: configuraciones activas QA `0`, diez identidades con fallback `Precio base`, residuos `0`.
- Historial posterior verificado con evento `Activo 1 -> 0`; historial previo `DESCUENTO_MARCA` preservado.
- Datos legitimos modificados: `0`.

## Regresion

- Casos LP-16: descuento 0, 25 y 100; invalidos; listas 1..10; universo server-side; servicio con marca; crear/actualizar/reactivar/omitir; preview vacio; cross-tenant; rollback.
- `ListaPreciosServiceTests`: 115/115 PASS.
- Full suite: 682/682 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check`: PASS.
- `git diff --check`: PASS en MVC y API.
- Secret scan: PASS; no se persistieron credenciales, connection strings ni tokens.

## Protecciones

- Sin cambios en `Utilerias.js`, `_Layout.cshtml` ni `checkapp-ui.js`.
- Sin cambios de Schema V2, migraciones, runner, Auth/Login/Firebase/Session/Cookies/Claims, Inventario, ProductosServicios funcional ni Legacy.
- LP-09, LP-10, LP-11, LP-12, LP-13, LP-14 y LP-15 permanecen operativos y cubiertos por la suite completa.

## Dictamen

LP-16 = CERRADO / DESCUENTO POR MARCA CERTIFICADO / QA RUNTIME AUTENTICADA PASS / LISTO HANDOFF LP-17

Siguiente paso: revision PO. No ejecutar LP-17.
