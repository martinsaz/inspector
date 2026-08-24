# Reglas de Negocio OC

## Catalogo

### RN-OC-001

- Nombre: Estado inicial condicionado por departamento
- Descripcion: la OC nace `0` o `6` segun `OrdendeCompraSupervisores.aprobarOrdenesCompra`
- Evidencia: `GuardaPedido`, `guardarOrdenDeCompraKits`
- Clasificacion: `RUNTIME + CODIGO CONFIRMADO`

### RN-OC-002

- Nombre: Folio consecutivo post-insercion
- Descripcion: el folio numerico se asigna despues del bulk insert con `MAX(Folio)+1`
- Clasificacion: `CODIGO CONFIRMADO`

### RN-OC-003

- Nombre: La OC incrementa pedido y no inventario fisico al crear
- Descripcion: al guardar se incrementa `fcexistenprod.Pedido`
- Clasificacion: `CODIGO CONFIRMADO`

### RN-OC-004

- Nombre: Aprobacion por supervisores fijos
- Descripcion: la aprobacion depende de hasta cinco supervisores por departamento
- Clasificacion: `RUNTIME + CODIGO CONFIRMADO`

### RN-OC-005

- Nombre: Todas las firmas configuradas son requeridas
- Descripcion: la OC solo pasa a `6` cuando todas las firmas requeridas valen `1`
- Clasificacion: `CODIGO CONFIRMADO`

### RN-OC-006

- Nombre: Aprobacion no afecta existencias fisicas
- Descripcion: aprobar solo cambia estado/logistica asociada
- Clasificacion: `CODIGO CONFIRMADO`

### RN-OC-007

- Nombre: Recepcion parcial permitida
- Descripcion: la recepcion puede dejar `Surtidos < Cantidad`
- Clasificacion: `RUNTIME + CODIGO CONFIRMADO`

### RN-OC-008

- Nombre: Recepcion total pasa a surtido
- Descripcion: si `Surtidos == Cantidad`, estatus `1`
- Clasificacion: `CODIGO CONFIRMADO`

### RN-OC-009

- Nombre: Recepcion de mas genera estatus especial
- Descripcion: si `Surtidos > Cantidad`, estatus `5`
- Clasificacion: `CODIGO CONFIRMADO`

### RN-OC-010

- Nombre: Una misma OC puede tener multiples recepciones
- Descripcion: la recepcion reutiliza OCs `6` y `3`
- Clasificacion: `RUNTIME + CODIGO CONFIRMADO`

### RN-OC-011

- Nombre: Recepcion subsecuente debe reutilizar el mismo folio documental
- Descripcion: si la OC ya se habia recibido, el folio de compra debe ser igual al anterior
- Clasificacion: `CODIGO CONFIRMADO`

### RN-OC-012

- Nombre: Costo editable condicionado
- Descripcion: el costo en OC y en recepcion depende de flags departamentales
- Clasificacion: `RUNTIME + CODIGO CONFIRMADO`

### RN-OC-013

- Nombre: Producto de OC debe venir del catalogo
- Descripcion: la seleccion se resuelve por `fcproductos` y `fcvariantes`
- Clasificacion: `RUNTIME + CODIGO CONFIRMADO`

### RN-OC-014

- Nombre: Historial de cambios de detalle
- Descripcion: modificaciones de cantidad/costo se guardan en `OrdenCompraPTCambios`
- Clasificacion: `CODIGO CONFIRMADO`

### RN-OC-015

- Nombre: La seguridad de pantalla es frontend-first
- Descripcion: el acceso visible depende de `validarAccesoPantalla(...)`
- Clasificacion: `CODIGO CONFIRMADO`
