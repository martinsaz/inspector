# Usuarios Capacidades Asistencia

## Arquitectura actual

### Usuarios

- MVC: `Controllers/Usuarios/UsuarioController.cs`
- Usuario interno usa:
  - `IdSucursal`
  - `IdDepartamento`
  - `IdPuesto`
  - `idRol`
  - `IdFirebase`

### Roles

- API: `checklistWs/Controllers/Roles/RolesController.cs`
- Modelo: `checklistWs/Models/Roles/Roles.cs`
- Permisos viven como texto estructurado en `dbo.Roles.Permisos`

### Operadores

- Identidad operativa separada de usuario administrativo tradicional
- Relacion multiple a sucursales

## Separacion conceptual recomendada

- `IDENTIDAD`: login, Firebase, correo, claims.
- `PERSONA OPERATIVA`: operador que ejecuta trabajo.
- `AUTORIZACION DEL SISTEMA`: rol y permisos en `dbo.Roles.Permisos`.
- `RESPONSABILIDAD COMERCIAL`: cotizar, autorizar, vender, cobrar, devolver, operar caja.

## Capacidades comerciales

La arquitectura actual si puede soportarlas mas adelante sin duplicar roles completos, pero la implementacion correcta deberia:

- mapear responsabilidades comerciales sobre permisos existentes;
- evitar crear un segundo sistema paralelo de autorizacion;
- distinguir si una persona es usuario administrativo, operador o ambas.

## Riesgos

- duplicar `Roles` y `Permisos` para comercial;
- mezclar operador con vendedor o cajero;
- asumir que una sola sucursal por usuario resuelve toda responsabilidad comercial.

## Asistencia reutilizable

Busqueda exhaustiva en codigo propio del destino:

- no se localizaron modulos vivos de asistencia, turno, entrada, salida o jornada comercial;
- si existe uso de GPS y contexto operativo dentro de checklist BL26, pero no como asistencia general reutilizable para vendedor o cajero.

## Dictamen

- Capacidades comerciales futuras: `VIABLES`
- Asistencia CheckApp reusable: `GAP PARCIAL / NO CONFIRMADA COMO MODULO GENERAL`
