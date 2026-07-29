# ALTA INICIAL EMPRESA - FASE 2 - BOOTSTRAP NUEVO

## Estado al 2026-07-23

La corrección de Fase 2 quedó implementada para empresas nuevas en los repos autorizados:

- Frontend MVC: `/Users/denissemendiola/dev/CheckList_Original/checklist`
- API: `/Users/denissemendiola/dev/checklistWs-Original/checklistWs`

La empresa lógica sigue viviendo en `RTDB Conexiones/{numeroEmpresa}` y los catálogos SQL continúan ligados por `idEmpresa`.

## Comportamiento anterior

El flujo original tenía estos problemas:

- helpers de bootstrap en `async void`;
- `Registrare(...)` respondía éxito parcial;
- el primer usuario podía quedar ligado a departamento o puesto de otra empresa;
- `GetRoll` ignoraba `nombreRol`;
- `ObtenerPrimerDepartamento` y `ObtenerPrimerPuesto` resolvían globalmente por nombre;
- `Registraru(...)` podía dejar Firebase y RTDB adelantados sin confirmar el usuario SQL;
- el cierre del bootstrap no conservaba un estado idempotente verificable por empresa nueva.

## Causas corregidas

- el bootstrap usa operaciones esperables con `Task<BootstrapOperationResult>`;
- se agregaron `BootstrapCompleto`, `BootstrapActualizado` y `BootstrapIds` al nodo `Conexiones`;
- se reservan y reutilizan IDs exactos para rol, razón social, zona, sucursal, departamento y puestos;
- el usuario administrativo SQL consume directamente esos IDs del bootstrap;
- `GetRoll` ya respeta `nombreRol`;
- `ObtenerPrimerDepartamento` y `ObtenerPrimerPuesto` aceptan `idEmpresa` y se consumen con ese filtro;
- `Sucursales.InsertarSucursal` respeta el `Id` recibido;
- `Roles.Guardar` ya no valida duplicados globales entre empresas y dejó de hacer doble decode de `cadena`;
- `Registrare(...)` ya no devuelve `Ok` cuando el bootstrap queda incompleto;
- `Registraru(...)` bloquea el registro cuando `BootstrapCompleto != true`.

## Nuevo orden del bootstrap

1. Crear o reutilizar empresa lógica en RTDB.
2. Reservar `BootstrapIds`.
3. Persistir estado incompleto.
4. Crear y validar rol inicial.
5. Crear y validar razón social inicial.
6. Crear y validar región inicial.
7. Crear y validar sucursal inicial con IDs exactos de razón social y zona.
8. Crear y validar departamento inicial.
9. Crear y validar puesto `Administrador`.
10. Crear y validar puesto `Supervisor`.
11. Confirmar todas las entidades por ID y empresa.
12. Persistir `BootstrapCompleto = true`.
13. Permitir el alta del primer usuario con los IDs del bootstrap.

## Transacción o compensación

No se consolidó una transacción SQL única entre todos los inserts de bootstrap.

La compensación actual es idempotente por empresa nueva:

- RTDB guarda `BootstrapIds` y `BootstrapCompleto`;
- si una ejecución falla, una nueva ejecución reutiliza los mismos IDs;
- el sistema no marca éxito global hasta confirmar todas las entidades;
- no se elimina información histórica ni cuentas válidas como compensación automática.

## IDs conservados

Para la empresa QA se conservaron estos IDs:

- `numeroEmpresa`: `171`
- `idEmpresa`: `b581b4ec-0c28-4d66-9546-43c4dcd69bef`
- `token`: `MTc4NTQyNDcwMjAwMA==`
- `idRol`: `c8d86145-55f6-44cd-94ee-5dc4d2ca2e00`
- `idRazonSocial`: `17a0eb51-0a9e-4046-b16c-5106c19b5beb`
- `idZona`: `50538eae-0329-4f13-9949-2373c6dad2e1`
- `idSucursal`: `4fe2076e-2f08-4aa6-b28e-81994a49be25`
- `idDepartamento`: `47c7ce19-54c5-4db6-9e86-c3f1545a1a18`
- `idPuestoAdministrador`: `bf7f21d9-b1a2-4c8c-8f47-6a8cbcd82433`
- `idPuestoSupervisor`: `1fd7b0f5-b404-46e4-9a82-18fa164c5446`

## Endpoints modificados o endurecidos

- `checklist/Controllers/LoginController.cs`
- `checklist/Models/Firebase/Conexion.cs`
- `checklistWs/Controllers/Roles/RolesController.cs`
- `checklistWs/Controllers/Sucursal/SucursalController.cs`
- `checklistWs/Controllers/Usuario/UsuariosDepartamentosController.cs`
- `checklistWs/Controllers/Usuario/UsuariosPuestosController.cs`

## Empresa QA

- Empresa QA creada por flujo visible: `QA FASE2 20260723151820`
- Número de empresa: `171`
- GUID empresa: `b581b4ec-0c28-4d66-9546-43c4dcd69bef`
- Token: `MTc4NTQyNDcwMjAwMA==`

## Evidencia funcional de catálogos base

Se confirmó por API local que en la empresa `171` existen y pertenecen a la misma empresa:

- `Roles`: `1`
- `RazonesSociales`: `1`
- `Zonas`: `1`
- `Sucursales`: `1`
- `Departamentos`: `1`
- `Puestos`: `2`

Relaciones comprobadas:

- la sucursal apunta a la razón social y zona de la misma empresa;
- departamento y puestos tienen `idEmpresa = b581b4ec-0c28-4d66-9546-43c4dcd69bef`;
- el rol `SuperAdmin` quedó con el `idEmpresa` correcto.

## Primer usuario

- Correo: `qa.fase2.171.primer.20260723@example.com`
- UID Firebase / RTDB: `dx064dVHricdrKMR9ofMWZqek612`
- `Usuarios.IdEmpresa`: `b581b4ec-0c28-4d66-9546-43c4dcd69bef`
- `Usuarios.IdSucursal`: `4fe2076e-2f08-4aa6-b28e-81994a49be25`
- `Usuarios.IdDepartamento`: `47c7ce19-54c5-4db6-9e86-c3f1545a1a18`
- `Usuarios.IdPuesto`: `bf7f21d9-b1a2-4c8c-8f47-6a8cbcd82433`
- `Usuarios.idRol`: `c8d86145-55f6-44cd-94ee-5dc4d2ca2e00`
- `NombreRol`: `SuperAdmin`

Resultado funcional:

- `Registraru(...)` persistió Firebase, RTDB y SQL correctamente;
- el mensaje final reportó problema al reenviar correo de confirmación, no al alta de identidad.

## Segundo usuario

- Correo: `qa.fase2.171.segundo.20260723@example.com`
- UID Firebase / RTDB: `yE7aXLISyqPeoJbd4MhlwVfCt842`
- `Usuarios.IdEmpresa`: `b581b4ec-0c28-4d66-9546-43c4dcd69bef`
- `Usuarios.IdSucursal`: `4fe2076e-2f08-4aa6-b28e-81994a49be25`
- `Usuarios.IdDepartamento`: `47c7ce19-54c5-4db6-9e86-c3f1545a1a18`
- `Usuarios.IdPuesto`: `1fd7b0f5-b404-46e4-9a82-18fa164c5446`
- `Usuarios.idRol`: `00000000-0000-0000-0000-000000000000`

Resultado funcional:

- el segundo usuario quedó en la misma empresa;
- no recibió `SuperAdmin`;
- utilizó el puesto `Supervisor` del mismo bootstrap.

## Evidencia de ABC

No quedó certificada evidencia de navegador para:

- Ajustes -> Razones Sociales
- Ajustes -> Regiones
- Ajustes -> Sucursales
- Ajustes -> Departamentos
- Ajustes -> Puestos
- Ajustes -> Roles
- Ajustes -> ABC Usuarios

La evidencia actual es de API local y RTDB. Esta fase todavía requiere un pase adicional de UI para cerrar esa parte del criterio de aceptación.

## Regresión

No se ejecutó todavía la validación funcional de:

- empresa `163` en modo solo lectura;
- empresa histórica sana adicional;
- login visual completo con los usuarios QA creados.

No se realizaron cambios intencionales sobre empresa `163`.

## Inventario histórico pendiente para Fase 3

Pendiente elaborar el inventario de:

- usuarios con `idDepartamento` de otra empresa;
- usuarios con `idPuesto` de otra empresa;
- usuarios con `idSucursal` de otra empresa;
- empresas con bootstrap incompleto histórico.

## Compilación

Frontend:

- proyecto: `/Users/denissemendiola/dev/CheckList_Original/checklist/checklist.csproj`
- resultado: compila
- errores: `0`
- advertencias observadas: heredadas del proyecto, principalmente nulabilidad, compatibilidad de paquetes legacy y vulnerabilidades NU1902 de `MailKit`, `MimeKit` y `RestSharp`

API:

- proyecto: `/Users/denissemendiola/dev/checklistWs-Original/checklistWs/checklistWs.csproj`
- resultado: compila
- errores: `0`
- advertencias observadas: heredadas del proyecto, principalmente nulabilidad y compatibilidad NU1701

## Riesgos abiertos

- falta certificación visual en navegador de los ABC;
- falta validación de login final con cuentas QA;
- falta validación de regresión sobre empresa `163` e histórica sana;
- el envío de correo de confirmación del primer usuario QA no quedó validado aunque la identidad sí persistió;
- el bootstrap sigue usando compensación idempotente, no transacción SQL única.
