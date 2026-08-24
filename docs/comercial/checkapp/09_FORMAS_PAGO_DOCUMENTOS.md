# Formas Pago Documentos

## Formas de pago destino

Evidencia localizada:

- `checklist/Views/Ajustes/FormasPago.cshtml`

Hallazgo:

- solo existe pantalla placeholder;
- el propio texto indica que la implementacion funcional completa no forma parte de la iteracion;
- no se localizaron tablas, catalogos ni endpoints comerciales CheckApp actuales para medios de pago.

Clasificacion:

- `Formas de pago CheckApp = NUEVO`

## Facturacion destino

Evidencia localizada:

- `checklist/Controllers/Facturacion/FacturacionController.cs`
- `checklist/Views/Facturacion/Panel.cshtml`

Hallazgo:

- controlador minimo para abrir vista;
- no se localizo backend comercial / fiscal operativo asociado a checkout actual.

Clasificacion:

- `Facturacion destino = NUEVO`

## NC / Vale

Busqueda realizada sobre codigo destino actual:

- sin tablas vivas localizadas;
- sin endpoints;
- sin foliado;
- sin saldo;
- sin vigencia;
- sin PDF operativo comercial.

Clasificacion:

- `Nota de credito = NUEVO`
- `Vale = NUEVO`

## Conclusiones

- No existe hoy infraestructura destino suficiente para checkout, medios de pago o documentos postventa.
- El legado ya auditado no debe confundirse con implementacion vigente en CheckApp.
