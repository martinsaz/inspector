# Auditoría y Planeación del Menú Principal

**Fecha:** 2026-08-06  
**Vertical:** Menú principal  
**Fase:** Auditoría y planeación únicamente  
**Product Owner:** Denisse Mendiola

## Estado de esta entrega

Este documento cumple exclusivamente la fase de auditoría y planeación.

No se implementaron cambios funcionales.

No se modificó navegación.

No se modificaron permisos, roles, claims, autenticación, sesión, cookies, SQL, API, modelos ni reglas de negocio.

## Objetivo

Dejar documentada una propuesta controlada para la reorganización completa del menú principal, respetando el Patrón CheckApp heredado del Patrón Tarahumara y las restricciones operativas vigentes.

## Fuentes auditadas

- `AGENTS.md`
- `CLAUDE.md`
- `docs/ui/PATRON_CHECKAPP.md`
- `docs/ui/PATRON_CHECKAPP_PRO.md`
- `docs/ui/PATRON_CHECKAPP_SECUNDARIO.md`
- `docs/ui/USO_PATRON_CHECKAPP.md`
- `docs/ui/CHECKAPP_COMPONENTES.md`
- `checklist/Controllers/HomeController.cs`
- `checklist/wwwroot/js/Utilerias.js`
- `checklist/Views/RolesPermisos/RolesPermisos.cshtml`

## Hallazgos clave

### 1. El menú real es dinámico y server-side

El menú principal visible al usuario se construye en `HomeController.BuildMenu` y se inyecta por AJAX desde `wwwroot/js/Utilerias.js`.

Implicación:

- cualquier reorganización real del menú debe planearse primero en `BuildMenu`;
- `_Layout.cshtml` no es la fuente de verdad del árbol de navegación;
- renombrar o mover opciones requiere revisar también el resaltado de estado activo en `Utilerias.js`.

### 2. El árbol visual y el árbol de permisos no están completamente alineados

La vista `RolesPermisos.cshtml` todavía expone nombres legacy como:

- `Nueva (creador)`
- `Abiertas`
- `Mis Listas`

Mientras tanto, el menú real ya mezcla etiquetas legacy y etiquetas nuevas, por ejemplo:

- `Nueva (editor)`
- `Inspección en campo`

Implicación:

- la futura implementación no podrá quedarse solo en `BuildMenu`;
- deberá incluir una homologación documental y visual en `RolesPermisos` para que administración y navegación hablen el mismo idioma.

### 3. Existe acoplamiento entre permisos legacy y opciones visibles nuevas

Dentro de `Listas`, la opción con permiso `01001001` hoy renderiza dos accesos visibles:

- `Nueva (creador)` hacia `/Listas/CreadorLista`
- `Nueva (editor)` hacia `/Listas/CreadorListaBL26`

Implicación:

- eliminar visualmente `Nueva (creador)` es simple en apariencia, pero debe definirse si el permiso `01001001` seguirá exponiendo una sola ruta o seguirá respaldando dos rutas internas;
- como está prohibido crear permisos nuevos en esta fase, la implementación futura debe reutilizar permisos existentes.

### 4. Recolecciones tiene una excepción operativa

`Inspección en campo` no depende solo del árbol de permisos legacy; también depende de `HasOperatorAccessAsync(...)` y del modo de trabajo.

Implicación:

- la reorganización no debe alterar su visibilidad condicional;
- cualquier cambio posterior debe preservar el comportamiento dual Administración / Operación.

### 5. Hay módulos fuera de alcance que ya están injertados en el menú

Actualmente `Activos`, `Productos y Servicios` y `Proveeduría` se agregan desde métodos auxiliares dentro del mismo `HomeController`.

Implicación:

- aunque el vertical es “reorganización del menú principal”, esos módulos están expresamente protegidos y no deben cambiar de comportamiento en esta fase;
- solo pueden considerarse en el árbol objetivo como nodos a conservar.

### 6. Las nuevas opciones aprobadas por PO no tienen evidencia de rutas equivalentes dentro del frontend auditado

No se encontró evidencia clara en esta auditoría de controladores o navegación ya existente para:

- `Ventas`
- `Cotizaciones`
- `Clientes`
- `ABC Clientes`

Implicación:

- agregarlas en implementación requerirá confirmar primero si ya existen rutas funcionales reutilizables;
- si no existen, no será viable exponerlas sin una definición adicional del PO, porque esta iniciativa prohíbe crear rutas, permisos o comportamiento nuevo fuera del alcance.

## Inventario actual auditado del menú principal

## 1. Listas

- `ABC Listas`
- `Nueva (creador)`
- `Nueva (editor)`
- `Abierta`
- `Mis Listas`
- `Categorización`
- `Categorías`
- `Subcategorías`

## 2. Recolecciones

- `Nueva`
- `Listado`
- `Detalle`
- `Inspección en campo`

Nota:

`Inspección en campo` depende de acceso operador y no se debe degradar.

## 3. Reportes

- `Estrellas`
- `Estrellas Contraido`
- `Estrellas con Categorías`
- `Listado Recolecciones`

## 4. Ajustes

- `Usuarios`
- `ABC Usuarios`
- `Departamentos`
- `Puestos`
- `Roles y Permisos`
- `Sucursales`
- `Razones Sociales`
- `Regiones`
- `Operadores`

## 5. Módulos adicionales ya presentes en menú principal

- `Activos`
- `Productos y Servicios`
- `Proveeduría`

Estos módulos deben preservarse sin cambio de comportamiento.

## Cambios ya aprobados por Product Owner

### Altas futuras

- `Ventas` sin hijos
- `Cotizaciones` sin hijos
- `Clientes`
- `ABC Clientes`
- `Reporte`

### Renombres o depuración futura

- `Listas` -> `Checklists`
- eliminar visualmente `Nueva (creador)`
- `Nueva (editor)` -> `Nueva`
- `Abierta` -> `Borradores`
- `Mis Listas` -> `Vigentes`

## Árbol objetivo propuesto para aprobación

Este árbol objetivo solo define organización visual futura. No autoriza implementación inmediata.

```text
Checklists
  ABC Checklists
    Nueva
    Borradores
    Vigentes
  Categorización
    Categorías
    Subcategorías

Recolecciones
  Nueva
  Inspección en campo
  Listado
  Detalle

Ventas

Cotizaciones

Clientes
  ABC Clientes
  Reporte

Activos
  [sin cambios en esta iniciativa]

Productos y Servicios
  [sin cambios en esta iniciativa]

Proveeduría
  [sin cambios en esta iniciativa]

Reportes
  [sin cambios en esta iniciativa]

Ajustes
  [sin cambios en esta iniciativa]
```

## Criterios de reorganización propuestos

### C1. Homologación de lenguaje

Toda la rama `Listas` debe migrar visualmente a lenguaje `Checklists` en menú y en administración de permisos visible para evitar doble vocabulario.

### C2. Conservación de identidad funcional

El cambio es de acomodo y nomenclatura visual, no de seguridad ni negocio.

Por lo tanto:

- se conservan los mismos permisos existentes;
- se conservan las rutas funcionales existentes salvo aprobación expresa posterior;
- se conserva el comportamiento dual de `Inspección en campo`.

### C3. Separación clara entre operación checklist y operación comercial

`Ventas`, `Cotizaciones` y `Clientes` deben quedar como grupos propios, no mezclados dentro de `Checklists`, para mantener claridad operativa.

### C4. Respeto al patrón CheckApp

La reorganización debe mantener:

- jerarquía simple;
- grupos claros;
- etiquetas cortas;
- consistencia con el lenguaje visible del producto;
- ausencia de textos técnicos.

## Riesgos identificados para implementación futura

### R1. Desalineación con Roles y Permisos

Si solo se cambia `BuildMenu` y no `RolesPermisos`, la administración seguirá mostrando nombres antiguos y el usuario administrador perderá trazabilidad.

### R2. Doble ruta bajo un solo permiso en `01001001`

Hoy el permiso `01001001` expone dos entradas visibles. Al eliminar `Nueva (creador)` debe definirse si:

- la ruta legacy seguirá existiendo sin menú;
- quedará accesible solo por URL;
- o se retirará visualmente pero se mantendrá por compatibilidad temporal.

Esta decisión requiere validación del PO antes de implementar.

### R3. Nuevas opciones sin ruta confirmada

`Ventas`, `Cotizaciones` y `Clientes` no deben agregarse visualmente hasta confirmar:

- ruta exacta;
- comportamiento esperado;
- criterio de visibilidad;
- si reutilizan permisos existentes o si su salida queda explícitamente fuera de esta iniciativa.

### R4. Estado activo del menú

Si cambian identificadores o ramas visibles, también deberá ajustarse la lógica de resaltado en `Utilerias.js`.

### R5. Dependencia condicional de `Inspección en campo`

Mover o renombrar nodos dentro de `Recolecciones` no debe romper:

- el acceso por modo operador;
- la expansión automática de rama;
- la navegación a `/ContestarLista/RecoleccionesBL26`.

### R6. Acoplamiento histórico de módulos

`Activos`, `Productos y Servicios` y `Proveeduría` ya están insertados mediante helpers propios dentro de `BuildMenu`.

La implementación futura debe tratarlos como ramas congeladas en alcance.

## Plan de implementación propuesto para fase posterior

Esta secuencia solo debe ejecutarse después de aprobación explícita del Product Owner.

### Paso 1. Homologación documental del árbol final

Confirmar con PO:

- orden exacto de nodos superiores;
- nombre final de `ABC Listas` contra `ABC Checklists`;
- comportamiento esperado de `Nueva (creador)` tras salir del menú;
- rutas reales de `Ventas`, `Cotizaciones` y `Clientes`.

### Paso 2. Ajuste controlado del menú real

Intervenir exclusivamente:

- `checklist/Controllers/HomeController.cs`
- `checklist/wwwroot/js/Utilerias.js`

Objetivo:

- renombrar etiquetas;
- ocultar la opción aprobada para retiro visual;
- mantener estado activo y expansión correcta.

### Paso 3. Homologación visual de administración de permisos

Intervenir exclusivamente la capa visual de:

- `checklist/Views/RolesPermisos/RolesPermisos.cshtml`
- `checklist/wwwroot/js/RolesPermisos/RolesPermisos.js`
- solo si se requiere, `checklist/Controllers/RolesPermisos/RolesPermisosController.cs`

Objetivo:

- alinear nombres visibles con el menú real;
- no crear permisos nuevos;
- no alterar la persistencia del modelo de permisos.

### Paso 4. QA técnico de Codex

Validar:

- build;
- render correcto del menú;
- ramas expandidas;
- activo visual por ruta;
- no regresión de `Inspección en campo`;
- no regresión de módulos congelados.

### Paso 5. QA manual del Product Owner

Validar con sesión de empresa `163`, encabezado `UMBRELLA` y modo `Administración`.

## Decisiones pendientes de aprobación del Product Owner

### D1. Nombre final del subgrupo

Confirmar si:

- `ABC Listas` también debe renombrarse a `ABC Checklists`

o si debe conservarse por compatibilidad operativa.

### D2. Destino funcional de `Nueva (creador)`

Confirmar si la ruta legacy:

- queda sin menú pero vigente;
- queda reservada para administración;
- o se retirará en una fase posterior autorizada.

### D3. Rutas reales de nuevas opciones

Confirmar para cada opción:

- `Ventas`
- `Cotizaciones`
- `Clientes`
- `ABC Clientes`
- `Reporte`

si ya existe ruta funcional aprobada o si todavía son placeholders de roadmap.

### D4. Orden visual final

Confirmar si `Ventas`, `Cotizaciones` y `Clientes` deben aparecer:

- antes de `Activos`
- o después de `Reportes`

La propuesta de este documento las coloca antes de los módulos patrimoniales para reforzar lectura de negocio.

## Conclusión

La reorganización es viable, pero no es un simple cambio de etiquetas.

La implementación posterior deberá tratar al menos cuatro capas coordinadas:

- árbol dinámico del menú;
- resaltado de estado activo;
- administración visible de permisos;
- compatibilidad temporal de rutas legacy.

La recomendación de esta auditoría es aprobar primero el árbol objetivo y las cuatro decisiones pendientes del PO antes de pasar a implementación.
