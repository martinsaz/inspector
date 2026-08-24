# Flete Activos Fiscal

## Flete en cotizaciones

### Alternativas evaluadas

- Campo en encabezado.
- Partida especial.
- Estructura separada.

### Recomendacion

`Partida especial no inventariable`

Motivos:

- se preserva mejor hacia pedido, venta, ticket y factura;
- evita mezclarlo con totales generales opacos;
- permite cobrarlo o no cobrarlo despues;
- respeta la regla de que no afecta inventario.

### Regla abierta PO

Queda pendiente decidir:

- si se cobra al inicio o al surtir;
- si puede prorratearse o no en surtimiento parcial.

## Activos y comercial

Modulo actual:

- `api/Activos/*` es un vertical independiente con catalogos, sucursal, proveedor, estado operativo y multimedia.

Uso recomendado en comercial:

- equipo relacionado al servicio;
- activo del cliente;
- activo interno;
- evidencia / contexto de instalacion.

Uso no recomendado:

- vender `Activo` como si fuera partida comercial por defecto.

## Fiscal reutilizable

### Clientes

`SI` existe reusable:

- `RFC`
- `RegimenFiscal`
- `CodigoPostal`

Tambien existen:

- credito;
- plazo;
- observaciones;
- notas / tareas comerciales.

### Razones sociales

`SI` existe reusable:

- `RFC`
- direccion;
- telefono;
- `Regimen1`

### Faltantes fiscales destino

- `UsoCFDI`
- `FormaFiscal`
- catalogo SAT comercial de `ClaveProdServ`
- catalogo SAT comercial de `ClaveUnidad`
- backend de facturacion real

## Dictamen

- `Flete`: `ADAPTAR`
- `Activos`: `ADAPTAR`
- `Fiscal basico cliente / razon social`: `REUTILIZAR`
- `Facturacion SAT completa`: `FALTA`
