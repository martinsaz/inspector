# LP-08 - API + Motor V2 de Resolucion y Administracion Comercial Lista de Precios

Fecha: 2026-09-30  
Estado: CERRADO / MOTOR COMERCIAL V2 CERTIFICADO / PASS TECNICO SQL REAL / LISTO HANDOFF LP-09  
Scope: `ListaPrecios`

## 1. Alcance ejecutado

LP-08 extiende el motor LP-03 existente sobre Schema V2 LP-07. No se creo motor paralelo ni se modifico schema, migraciones, runner, tenant resolver, Auth/Login/Firebase/Session/Cookies/Claims/Program.cs, MVC visual, menu global, ProductosServicios funcional, Inventario, Sucursales, Curvas, OC, Recepcion, Legacy ni consumidores reales.

Identidades soportadas:

- Producto.
- Servicio.
- Variante.
- PresentacionVenta.

Reglas preservadas:

- No se admite Variante + PresentacionVenta.
- Servicio no admite Variante ni PresentacionVenta.
- Tenant siempre se resuelve server-side; entradas de cliente solo se aceptan como consistencia defensiva.
- Gate `ListaPrecios` sigue bloqueando antes de operar.
- Precio `0.00` sigue siendo precio configurado valido.
- Fila ausente o fuera de vigencia cae a fallback contractual sin buscar listas arbitrarias.

## 2. Motor comercial V2

El resolver devuelve snapshot comercial con:

- `TenantId`
- identidad vendible
- lista solicitada y efectiva
- `PrecioBase`
- `PrecioLista`
- `OrigenPrecio`
- `DescuentoPct`
- `SubtotalAntesRedondeo`
- `RedondeoModo`
- `PrecioFinal`
- vigencias
- flags promocionales no aplicados
- `ReglaVersion=LP-08-V2`
- fecha de resolucion UTC
- `CorrelationId`

Pipeline implementado:

1. Tenant.
2. Gate.
3. Identidad.
4. Lista.
5. Precio base / precio lista.
6. Descuento.
7. Subtotal antes de redondeo.
8. Redondeo.
9. Precio final.
10. Promocion no aplicada por contrato LP-08.
11. Resultado snapshot.

## 3. Descuento, redondeo y vigencia

Descuento:

- `NULL` significa sin descuento configurado y no se persiste como `0`.
- `0.00`, valores entre `0` y `100`, y `100.00` son validos.
- Valores menores a `0` o mayores a `100` se rechazan con `DESCUENTO_INVALIDO`.

Redondeo:

- `0`: sin redondeo.
- `1`: siguiente entero terminado en `4` o `9`.
- `2`: siguiente entero terminado en `9`.
- El redondeo se aplica despues del descuento y clampa al precio base cuando lo excede.
- Valores fuera de `0..2` se rechazan con `REDONDEO_INVALIDO`.

Vigencia:

- `NULL/NULL`: sin restriccion.
- Inicio solo, fin solo y ambos inclusivos soportados.
- Inicio mayor a fin se rechaza con `VIGENCIA_INVALIDA`.
- Detalles no vigentes no aplican y activan fallback.

## 4. API ampliada

Endpoints existentes extendidos:

- `POST api/ListaPrecios/Resolver`
- `GET api/ListaPrecios/Consulta`
- `POST api/ListaPrecios/GuardarPrecio`
- `POST api/ListaPrecios/BajaPrecio/{idPrecio}`

Endpoints nuevos:

- `POST api/ListaPrecios/Preview`: calcula con el mismo motor sin persistir.
- `POST api/ListaPrecios/Historial`: lee historico minimo por identidad/lista con permiso READ `05001008`.

Escritura:

- Requiere permiso WRITE `05001009`.
- Valida lista `1..10`; fuera de rango rechaza con `LISTA_INVALIDA`.
- Valida identidad, pertenencia, precio, descuento, redondeo, vigencia y duplicidad.
- Persiste columnas V2 `DescuentoPct`, `RedondeoModo`, `VigenciaInicio`, `VigenciaFin`.
- Registra historial minimo con `Origen=INDIVIDUAL`.

Baja logica:

- No borra fisicamente.
- Archiva el detalle y registra historial `Activo: 1 -> 0`.
- El resolver posterior cae a fallback.

Promociones:

- LP-08 no inventa semantica pendiente.
- Monedero funcional queda no implementado.
- El snapshot deja promociones sin aplicar hasta contrato futuro.

## 5. Compatibilidad LP-03

Se preserva compatibilidad cuando:

- `DescuentoPct=NULL`.
- `RedondeoModo=0`.
- Vigencias no restringen.
- No hay promocion aplicable.

En ese caso `PrecioFinal` y `PrecioEfectivo` equivalen al precio efectivo anterior de LP-03.

## 6. QA ejecutada

Comandos:

```bash
dotnet test checklistWs.Tests/checklistWs.Tests.csproj --filter ListaPreciosServiceTests --no-restore --verbosity minimal
dotnet test checklistWs.Tests/checklistWs.Tests.csproj --no-restore --verbosity minimal
```

Resultados:

- `ListaPreciosServiceTests`: PASS `37/37`.
- Suite API completa: PASS `598/598`.

Cobertura agregada:

- Compatibilidad LP-03 sin descuento/redondeo.
- Descuento antes de redondeo.
- Redondeo A 4/9.
- Redondeo solo a 9.
- Descuento `100%`.
- Lista invalida fail-closed.
- Precio `0.00` configurado.
- Vigencia fuera de rango activa fallback.
- Descuento menor a `0` y mayor a `100` rechazado.
- Vigencia inicio > fin rechazada.
- Preview calcula sin persistir.
- Duplicidad activa retorna `DUPLICADO`.

## 7. LP-08R - CERTIFICACION SQL REAL / CIERRE

Esta seccion consolida exclusivamente resultados ya certificados en LP-08R. No reejecuta QA, SQL, DDL, fixtures, runtime ni LP-09.

### CHECKAPPERP

- Laboratorio tecnico V2 certificado.
- Version: `2`.
- Hash V2: `e7a388ec985a19fb2b3beb73e8c2cf28d5dda17d3f3bb2f0363683c166092882`.
- Drift: `SchemaOk/0`.
- Gate: `COMPATIBLE`.
- Residuos: `0`.
- Datos legitimos modificados: NO.

### UMBRELLA 163

- Tenant funcional real certificado.
- Resolucion: mecanismo normal Firebase/tenant resolver, empresa `163`.
- DatabaseIdentity: `SQL5111/DB_A883C3_CHECKLIST/E398ABAB-6416-4E68-8084-7FF7CB232EF5`.
- Version: `2`.
- Hash V2: `e7a388ec985a19fb2b3beb73e8c2cf28d5dda17d3f3bb2f0363683c166092882`.
- Drift: `SchemaOk/0`.
- Gate: `COMPATIBLE`.
- Producto: PASS.
- Servicio: PASS.
- Variante: PASS.
- PresentacionVenta: PASS.
- Precio `0.00`: PASS.
- Fallback: PASS.
- Descuento: PASS.
- Redondeo: PASS.
- Vigencia: PASS.
- Preview sin persistencia: PASS.
- GuardarPrecio: PASS.
- Historial: PASS.
- Baja logica: PASS.
- Cross-tenant: FAIL CLOSED.
- Cleanup: PASS.
- Datos legitimos preservados: SI.

### Regresion

- `ListaPreciosServiceTests`: PASS `37/37`.
- Full suite API: PASS `598/598`.
- Build API: PASS.
- Build MVC: PASS.
- Diff check API/MVC: PASS.
- Secret scan: PASS.

### Dictamen oficial

LP-08 = CERRADO /
MOTOR COMERCIAL V2 CERTIFICADO /
PASS TECNICO SQL REAL /
LISTO HANDOFF LP-09

LP-09 queda como siguiente ticket. No ejecutado desde LP-08.
