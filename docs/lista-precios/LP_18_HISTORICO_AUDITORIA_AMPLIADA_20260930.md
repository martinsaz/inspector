# LP-18 - Historico y auditoria ampliada

Fecha de certificacion: 2026-09-30

## Estado

LP-18 cerrado. Historico y auditoria ampliada certificados con QA runtime autenticada en UMBRELLA, empresa 163. LP-19 no fue ejecutado.

## Auditoria fisica y funcional

| Dato | Existe | Fuente | Uso LP-18 |
| --- | --- | --- | --- |
| Fecha | Si | `ListaPreciosHistorial.FechaUtc` | Orden y rango inclusivo por fecha |
| Empresa | Si | `idEmpresa` | Aislamiento tenant server-side; no se expone en UI |
| Lista | Si | `idListaPrecio` + `ListaPreciosListas.Nivel/Nombre` | Filtro y etiqueta funcional |
| Tipo de identidad | Si | `TipoIdentidad` | Producto, Servicio, Variante y PresentacionVenta |
| Identidad | Si | IDs canonicos de producto/variante/presentacion | Resolucion de codigo/nombre actual en la misma consulta |
| Campo | Si | `Campo` | Detalle del cambio |
| Operacion | Si | `Operacion` | INSERT, UPDATE, NUEVO, SOBRESCRITURA, REACTIVACION y BAJA |
| Valor anterior/nuevo | Si | `ValorAnterior` / `ValorNuevo` | Detalle comparativo, sin reinterpretar valores |
| Actor | Si, opcional | `idUsuario` / `Usuario` | Filtro y detalle; `No registrado` cuando el evento no lo contiene |
| Origen | Si | `Origen` | INDIVIDUAL, MASIVO, COPIA_LISTA y DESCUENTO_MARCA |
| Correlacion | Si | `CorrelationId` | Filtro y agrupacion operativa de lote |
| Motivo | Si, opcional | `Motivo` | Detalle del evento |

No se requirio DDL ni migracion. El nombre/codigo historico no tiene snapshot fisico inmutable: LP-18 muestra el catalogo actual cuando existe y `Identidad no disponible` cuando ya no existe. No inventa nombres del pasado.

## Contrato implementado

- Consola de solo lectura integrada en `/ListaPrecios/Index`; el historial contextual LP-09 se conserva como vista breve de la identidad editada.
- Endpoint GET `HistorialConsulta` protegido con READ `05001008`; no requiere `05001009` ni agrega acciones de escritura.
- Filtros server-side: fecha desde/hasta, lista 1..10, tipo de identidad, codigo/nombre, origen, operacion, CorrelationId y actor real opcional.
- Paginacion server-side 25/50/100; orden estable `FechaUtc DESC, id DESC`.
- Conteo y pagina se resuelven en una unica operacion SQL, con joins tenant-safe y sin N+1.
- El cliente no envia un tenant confiable: MVC elimina `idEmpresa` recibido y resuelve la empresa autenticada; API aplica contexto, permiso y gate existentes.
- No se agrega exportacion Excel del historico ni se descarga el universo completo al navegador.
- Detalle inspeccionable: fecha, identidad, codigo, tipo, lista, origen, operacion, campo, valores, actor, CorrelationId y motivo.

## QA runtime real

- Login normal autenticado; empresa visible UMBRELLA, empresa 163.
- DatabaseIdentity saneada: base tenant UMBRELLA `DB_A883C3_CHECKLIST`; sin servidor, connection string, usuario, password ni token.
- Historico real: 144 eventos, 6 paginas a 25 filas.
- Origen real: INDIVIDUAL 44, MASIVO 41, COPIA_LISTA 26, DESCUENTO_MARCA 33.
- Eventos reales observados: UPDATE, INSERT, NUEVO, SOBRESCRITURA, REACTIVACION y BAJA.
- Producto, Servicio, Variante y PresentacionVenta presentes en resultados reales.
- Detalle de BAJA certificado: `Activo` de `1` a `0`, origen INDIVIDUAL y CorrelationId visible.
- Lote DESCUENTO_MARCA certificado por CorrelationId comun: 33 eventos; pagina 1/2.
- Filtros combinados certificados: Lista 10 + Variante + busqueda Aceite + DESCUENTO_MARCA + INSERT = 15 eventos.
- Rango 2026-10-01 a 2026-10-01 con los mismos filtros = 15 eventos UTC.
- Filtro actor inexistente = estado vacio controlado; limpiar restaura 144 eventos.
- Paginacion: pagina 1 `1-25/144`; pagina 2 `26-50/144`; orden descendente preservado.
- Actor: el campo fisico existe, pero los 144 registros consultados no contienen nombre; UI muestra `No registrado`.
- Cross-tenant: fail-closed por resolver/autorizacion server-side y cobertura automatizada; el cliente no puede seleccionar otra empresa.
- QA fue read-only: fixtures 0, escrituras 0, datos legitimos modificados 0, cleanup no requerido.

## Responsive

- Desktop: `innerWidth=1440`, `clientWidth=1440`, `bodyScrollWidth=1440`.
- Tablet: `innerWidth=820`, `clientWidth=820`, `bodyScrollWidth=820`.
- Mobile: `innerWidth=390`, `clientWidth=390`, `bodyScrollWidth=390`; filtros en una columna y tabla con scroll local.
- Modal, filtros, detalle y paginacion permanecen operables en los tres viewports.

## Regresion

- `ListaPreciosServiceTests`: 129/129 PASS.
- Focales ListaPrecios: 154/154 PASS.
- Full suite: 698/698 PASS.
- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- `node --check`: PASS.
- `git diff --check`: PASS en MVC y API.
- Secret scan: PASS; no se persistieron credenciales, connection strings ni tokens.

## Protecciones

- `Utilerias.js`, `_Layout.cshtml` y `checkapp-ui.js`: FROZEN y sin cambios LP-18.
- Schema V2, migraciones, runner, Auth/Login/Firebase/Session/Cookies/Claims, Inventario, ProductosServicios funcional y Legacy: sin cambios.
- Historico append-only preservado: 0 updates, 0 deletes, 0 hard deletes y 0 SQL manual de datos.
- No se modificaron usuarios, roles ni permisos; se reutilizo READ `05001008`.

## Dictamen

LP-18 = CERRADO / HISTORICO Y AUDITORIA AMPLIADA CERTIFICADOS / QA RUNTIME AUTENTICADA PASS / LISTO HANDOFF LP-19

Siguiente paso: revision PO. No ejecutar LP-19.
