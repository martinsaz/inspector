# POST-T24 - correcciones de permisos y congelamiento T25 #MOKA, 2026-09-16

## 1. Estado ejecutivo

T24 queda como `IMPLEMENTADO Y CERTIFICADO`.

T25 queda formalmente congelado por decision del Product Owner:

- `T25 - QA MANUAL PRODUCT OWNER`
- `STATUS: FROZEN / NO INICIADO FORMALMENTE`
- `REANUDACION: UNICAMENTE POR AUTORIZACION EXPLICITA DEL PRODUCT OWNER`

Las validaciones visuales realizadas despues de T24 fueron correcciones/regresiones post-T24 y preparacion documental. No constituyen ejecucion completa ni cierre de T25.

## 2. Linea de tiempo

1. T23/T24 integraron AuthZ para ProductosServicios con `05000000`/`05001000`.
2. Despues de T23/T24, Productos y Servicios desaparecio del menu del usuario esperado.
3. Tambien se detecto que ProductosServicios no aparecia inicialmente en `/RolesPermisos/RolesPermisos`.
4. Se identifico que RolesPermisos conservaba un arbol/UI/guardado hardcodeado sin administracion de `05000000`/`05001000`.
5. Se integro Proveeduria/ProductosServicios en RolesPermisos.
6. Se restauro visibilidad de menu para SuperAdmin.
7. Se detecto que Denisse resolvia un rol incorrecto.
8. Se corrigio la asociacion de Denisse a SuperAdmin en SQL y Firebase.
9. Se granularizo el arbol ProductosServicios con permisos hijos `05001001` a `05001005`.
10. Se corrigio `05001000` como agrupador de solo Acceso, igual que `05001002`.
11. Se congelo T25 por orden expresa del Product Owner.

## 3. Regresion menu

Despues de T23/T24 desaparecio Productos y Servicios del menu porque el acceso visual no estaba alineado con el nuevo contrato de permisos ProductosServicios. La correccion integro el arbol `05000000 -> 05001000 -> hijos` en la resolucion de menu.

El menu no es autoridad final: ocultar o mostrar opciones no sustituye AuthZ backend. La autoridad final permanece server-side.

## 4. Regresion RolesPermisos

ProductosServicios tampoco aparecia inicialmente en `/RolesPermisos/RolesPermisos`. La causa fue que RolesPermisos usaba un arbol, UI y guardado hardcodeado que no administraba `05000000` ni `05001000`.

Correccion aplicada: RolesPermisos muestra y guarda el arbol Proveeduria/ProductosServicios con los codigos definitivos `05000000` a `05001005`.

## 5. SuperAdmin

Existe una regla de negocio que impide modificar manualmente los permisos del SuperAdmin desde RolesPermisos.

Esa regla se preserva y nunca debe eliminarse como workaround de QA. La pantalla/backend debe seguir mostrando/protegiendo el caso: `No se pueden cambiar los permisos del SuperAdmin`.

Para continuar QA del PO se realizo una actualizacion administrativa controlada del SuperAdmin, con snapshot BEFORE de `Roles.Permisos`, incorporando permisos ProductosServicios y preservando el resto del JSON. No se modificaron otros roles.

## 6. Rol incorrecto Denisse

Hallazgo post-T24: Denisse debia utilizar SuperAdmin, pero estaba persistida incorrectamente como `QA Activos 163`.

La inconsistencia existia en:

- SQL `Usuarios.idRol`.
- Firebase `Usuarios/{uid}.idRol`.

Correccion aplicada: se corrigio exclusivamente la asociacion de Denisse.

Resultado final: `Denisse -> SuperAdmin`.

No se utilizo `QA Activos 163` como workaround y no se otorgaron permisos ProductosServicios al rol equivocado.

## 7. Correccion Firebase/SQL

Durante la correccion de rol se modifico Firebase unicamente para restaurar `idRol` de Denisse hacia SuperAdmin. Tambien se corrigio SQL `Usuarios.idRol` de Denisse.

Esta documentacion no ejecuta SQL, no modifica Firebase, no modifica usuarios, no modifica roles y no modifica permisos.

## 8. Arbol final de permisos

Contrato vigente:

| Codigo | Nombre | Tipo | Regla |
|---|---|---|---|
| `05000000` | Proveeduria | Agrupador | Acceso unicamente |
| `05001000` | Productos y Servicios | Agrupador | Acceso unicamente |
| `05001001` | ABC Productos y Servicios | Pantalla funcional | Acceso + Escritura |
| `05001002` | Catalogos | Agrupador | Acceso unicamente |
| `05001003` | Categorias | Pantalla funcional | Acceso + Escritura |
| `05001004` | Marcas | Pantalla funcional | Acceso + Escritura |
| `05001005` | Unidades de medida | Pantalla funcional | Acceso + Escritura |

## 9. Regla agrupador vs pantalla

Agrupadores:

- Controlan unicamente Acceso/visibilidad.
- No tienen Escritura.
- No conceden automaticamente permisos a sus hijos.

Pantallas funcionales:

- Tienen Acceso.
- Tienen Escritura cuando realizan operaciones modificables.

## 10. Granularidad

Cada opcion navegable independiente del menu debe tener su propio permiso.

Padre con `Acceso=1` no implica hijo con `Acceso=1`. La ausencia de un permiso granular debe fallar cerrado.

## 11. AuthZ

`05001000.Escritura` no es autoridad. Aunque exista en algun JSON legacy, debe ignorarse.

ABC ProductosServicios:

- READ: `05001001.Acceso = 1`.
- WRITE: `05001001.Acceso = 1` + `05001001.Escritura = 1`.

Regla equivalente:

- Categorias: `05001003`.
- Marcas: `05001004`.
- Unidades de medida: `05001005`.

Backend sigue siendo la autoridad final. Ocultar menu no sustituye AuthZ.

## 12. Codigos definitivos

No cambiar `05000000` a `05001005` sin autorizacion explicita del Product Owner.

Codigos vigentes:

- `05000000`
- `05001000`
- `05001001`
- `05001002`
- `05001003`
- `05001004`
- `05001005`

## 13. QA

Evidencia registrada post-correcciones:

- SuperAdmin protegido: PASS.
- Denisse -> SuperAdmin: PASS.
- Padre no concede permisos a hijos: PASS.
- `05001000.Escritura` no concede WRITE: PASS.
- `05001001.Escritura` controla WRITE de ABC: PASS.

## 14. Tests/builds

Ultima evidencia registrada:

- Tests: `395/395 PASS`.
- Build API: PASS.
- Build MVC: PASS.
- `git diff --check`: PASS.

## 15. Estado T20-T24

- T20: PASS.
- T21: PASS.
- T22: PASS.
- T23: PASS.
- T24: PASS.

## 16. Bases QA reservadas

Existen bases QA adicionales reservadas para pruebas posteriores del Product Owner.

No ejecutar pruebas sobre ellas ahora. No modificar Hosting. No provisionarlas. No iniciar bootstrap. Quedan reservadas hasta que el Product Owner reactive explicitamente T25.

## 17. Estado congelado T25

T25 queda:

- `FROZEN`.
- No iniciado formalmente.
- No ejecutar.
- No preparar.
- No modificar Hosting.
- No modificar bases QA.
- No iniciar QA manual.

## 18. Reglas para reanudacion

T25 solo puede reanudarse con autorizacion explicita del Product Owner.

Al reanudar, se debe distinguir entre:

- Correcciones post-T24 ya documentadas.
- Inicio formal de QA manual T25.
- Cualquier provisionamiento o modificacion de bases QA/Hosting, que requiere autorizacion expresa.

## 19. Pendientes que NO pertenecen todavia a T25

Mientras T25 permanezca congelado, no pertenecen todavia a ejecucion T25:

- Pruebas manuales completas del Product Owner.
- Provisionamiento de bases QA reservadas.
- Bootstrap de bases QA.
- Modificaciones de Hosting.
- Validaciones E2E nuevas que requieran servidores o cambios de datos.

## 20. Historial de defectos/correcciones

| Defecto | Causa | Correccion | Estado |
|---|---|---|---|
| Menu no mostraba ProductosServicios | RolesPermisos/menu no estaban alineados con `05000000`/`05001000` | Integracion de Proveeduria/ProductosServicios en menu y RolesPermisos | Cerrado |
| ProductosServicios ausente en RolesPermisos | Arbol/UI/guardado hardcodeado | Arbol `05000000` a `05001005` agregado | Cerrado |
| SuperAdmin no podia guardarse manualmente | Regla de negocio correcta | Se preservo regla y se uso actualizacion administrativa controlada | Cerrado |
| Denisse resolvia rol incorrecto | SQL/Firebase apuntaban a `QA Activos 163` | Denisse asociada a SuperAdmin en SQL y Firebase | Cerrado |
| Padre `05001000` expuesto con Escritura | `05001000` tratado como funcional en UI | `05001000` definido como agrupador de solo Acceso; Escritura legacy ignorada | Cerrado |

## Control de no ejecucion

En esta tarea documental:

- Codigo funcional modificado: NO.
- SQL modificado: NO.
- Firebase modificado: NO.
- Hosting modificado: NO.
- Conexiones modificadas: NO.
- Roles/Usuarios modificados: NO.
- T25 ejecutado: NO.
- Servidores levantados: NO.

## Dictamen

POST-T24 DOCUMENTADO Y CONSOLIDADO - ARBOL DEFINITIVO DE PERMISOS PRODUCTOSSERVICIOS REGISTRADO - REGLAS DE GRANULARIDAD Y SUPERADMIN PRESERVADAS - CORRECCIONES DE ROL DENISSE DOCUMENTADAS - T20/T21/T22/T23/T24 CONSOLIDADOS - T25 FORMALMENTE CONGELADO POR ORDEN DEL PRODUCT OWNER - BASES QA Y HOSTING SIN MODIFICAR - ESPERANDO NUEVA AUTORIZACION DEL PRODUCT OWNER.
