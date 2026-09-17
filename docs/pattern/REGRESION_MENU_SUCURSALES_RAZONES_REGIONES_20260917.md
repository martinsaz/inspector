# Regresion Menu Sucursales, Razones Sociales y Regiones

Fecha: 2026-09-17

## Alcance

Correccion del runtime de menu para `Ajustes -> Sucursales`, manteniendo granulares los permisos:

- `04003100` ABC Sucursales
- `04004000` Razones Sociales
- `04005000` Regiones

## Causa

`HomeController` conservaba un fallback legacy donde `04003000` con acceso y sin hijos renderizaba automaticamente `04003100`. Ese comportamiento trataba al padre como permiso efectivo de hijo y podia ocultar el problema de permisos incompletos mostrando solo ABC Sucursales.

## Correccion

La construccion del submenu se movio a `AjustesSucursalesMenuBuilder`.

La regla vigente queda:

- `04003000` es contenedor.
- `04003000` no otorga acceso a `04003100`, `04004000` ni `04005000`.
- Cada pantalla aparece solo si su permiso explicito tiene `Acceso = 1`.
- Se soporta permisos hijos anidados bajo `04003000` y permisos explicitos planos bajo `04000000`, sin fabricar permisos.

## Pruebas

Se agregaron pruebas unitarias de granularidad para:

- Renderizar los tres permisos explicitos.
- No otorgar ABC Sucursales desde padre vacio.
- Renderizar Razones Sociales y Regiones cuando vienen como permisos explicitos planos, sin activar ABC.

Validacion ejecutada:

- `dotnet build inspector/checklist/checklist.csproj --no-restore --verbosity minimal`
- `dotnet test inspectorapi/checklistWs.sln --no-restore --verbosity minimal`
- `git diff --check` en `inspector`
- `git diff --check` en `inspectorapi`

## Correccion puntual ABC Sucursales

Fecha: 2026-09-17

Se audito el rol `SuperAdmin` de empresa `163` en SQL real. El estado BEFORE tenia:

- `04003000` existente con `Acceso = 1`.
- `04003100` inexistente.
- `04004000` existente con `Acceso = 1`.
- `04005000` existente con `Acceso = 1`.

Se normalizo exclusivamente el rol `SuperAdmin` agregando `04003100` bajo `04003000` con `Acceso = 1` y `Escritura = 1`. No se modificaron otros roles.

Adicionalmente se elimino la compatibilidad insegura de MVC que hacia que `Utilerias.GetOpcion("04003100")` regresara `04003000` cuando ABC no existia. ABC Sucursales queda fail-closed y depende exclusivamente de `04003100`.
