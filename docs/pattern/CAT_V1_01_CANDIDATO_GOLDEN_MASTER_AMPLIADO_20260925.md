# CAT-V1-01 - Candidato Golden Master Catalogo Ampliado

Estado: CANDIDATO GOLDEN MASTER - CATALOGO AMPLIADO
Fecha: 2026-09-25

## Alcance

Se aplica el Patron CheckApp - Catalogos V1 a:

- `/Regiones/Index`
- `/Sucursales/SucursalesABC`
- `/RazonesSociales/Index`

## Clasificacion PO

- Regiones: `SIMPLE / COMPACTO`.
- Sucursales: `AMPLIADO`.
- Razones Sociales: `AMPLIADO`.

## Regla visual aplicada

Regiones usa la variante compacta del Patron CheckApp - Catalogos V1.

Sucursales y Razones Sociales comparten la misma variante ampliada mediante la clase reutilizable:

- `ca-catalog-modal-dialog--expanded`

Esta variante es mas ancha que la compacta y mas contenida que el modal previo. No crea un tercer ancho por catalogo.

## Campos

No se agregan ni eliminan campos.

Regiones conserva:

- Region.
- Notas.

Sucursales conserva:

- Nombre.
- Direccion.
- Ciudad.
- Telefono.
- Correo.
- Pais.
- Razon Social.
- Region.
- Notas.

Razones Sociales conserva:

- Razon Social.
- Representante.
- RFC.
- Direccion.
- Colonia.
- C.P.
- Ciudad.
- Estado.
- Pais.
- Telefono.
- Regimen Fiscal.
- Notas.

## Dictamen documental

`CANDIDATO GOLDEN MASTER - CATALOGO AMPLIADO`

Referencias candidatas:

- Sucursales.
- Razones Sociales.

Golden Master ampliado oficial:

`NO`

Pendiente:

`APROBACION VISUAL PO`
