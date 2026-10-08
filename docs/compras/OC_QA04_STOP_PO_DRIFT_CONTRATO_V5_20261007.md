# OC-QA04 — STOP PO por drift contractual OC V5 en CHECKAPPERP

Fecha: 2026-10-07  
Estado: `STOP_PO / CHECKAPPERP OC V5 MIGRADA / GATE SCHEMA_DRIFT / RECEPCIÓN V2 NO EJECUTADA`

## Resultado ejecutivo

El precheck de CHECKAPPERP coincidió con la identidad, source y hashes autorizados. El runner oficial ejecutó una sola vez `OC-M20261006-V4-V5-MULTISUCURSAL-PARTIDA` con el SQL corregido de hash `19fbdeb7de4af7b77b893c36491e455e94c1d446d4d27aba76e0ae844686d71d`. La migración registró `MIGRATED/PASS/V5`, el manifest persistido quedó en `4e88ac49a73e3169903a6399a5b8c4fa2ea4c9b747005082ecc086636cb8462a` y los objetos V5 esenciales quedaron presentes.

La certificación posterior obligatoria detectó `SchemaDrift` y el gate devolvió `SCHEMA_DRIFT`. Conforme al contrato OC-QA04 se detuvo la secuencia antes de Recepción V2, UMBRELLA, activación runtime, UI y QA.

## CHECKAPPERP

- DatabaseIdentity: `VPS3348900/CHECKAPPERP/A0E05B05-F509-44D3-8BE4-218F875720CA`.
- BEFORE: OC V4 hash `a3895245b8b730f4174f2f64afb2389e715d6f2ed798a5aff56104071edd937a`; Recepción V1 hash `c26551d2eb625dda1138a2b5aad2ad83a3b074ea026082feb7714c97c229fd5f`; ambos `SchemaOk/0`; datos de negocio 0.
- OC AFTER: V5, target hash exacto, historial PASS 1, intentos activos 0.
- Objetos: `OrdenesCompraSucursales` presente; `OrdenesCompraDetalle.idSucursal NOT NULL`; `OrdenesCompra.idSucursal NULL` permitido.
- Datos AFTER: 0 OC, 0 detalles, 0 recepciones, 0 partidas, 0 series y 0 movimientos; datos de negocio modificados 0.
- Recepción: permanece V1 exacta y `SchemaOk/0`; V2 no ejecutada.

## Defecto real

El contrato target OC V5 declara tres restricciones únicas también dentro de `SchemaTableContract.Indexes`:

- `OrdenesCompraDetalle.UX_OrdenesCompraDetalle_Empresa_Id_Orden_Sucursal`;
- `OrdenesCompraSucursales.UX_OrdenesCompraSucursales_Empresa_Id`;
- `OrdenesCompraSucursales.UX_OrdenesCompraSucursales_Empresa_Orden_Sucursal`.

SQL Server materializó correctamente las tres `UNIQUE CONSTRAINT`. Sin embargo, `SchemaDriftValidator` excluye de la comparación de índices ordinarios los índices con `IsUniqueConstraint=true`. Como el target también los espera erróneamente como índices ordinarios, reporta tres `INDEX_MISSING` severidad 2. El gate OC V5 queda incompatible aunque las restricciones físicas existen.

La integración SQL de OC-QA03S5 no detectó esta discrepancia porque certificó con `SchemaContractPhysicalValidator`; no ejecutó el mismo camino completo de `SchemaDriftValidator`/Compatibility Gate sobre el target migrado. Recepción V2 contiene el mismo patrón duplicado para dos constraints y debe corregirse/cubrirse antes de ejecutarla.

## Controles

- UMBRELLA: no consultada ni modificada.
- Recepción V2: no ejecutada.
- Runtime Latest/Known/providers: sin activar.
- MVC/API funcional: sin cambios por OC-QA04.
- Legacy, ListaPrecios y Curvas/Siembra: intactos.
- Secretos persistidos: 0.
- Hard delete: 0.

## Dictamen

`STOP_PO`

Se requiere una corrección contractual/versionada que elimine la doble declaración de unique constraints como índices ordinarios, recalcule los manifests/hashes que correspondan y defina cómo reconciliar el estado V5 ya persistido en CHECKAPPERP. Después debe repetirse una integración real que use `SchemaDriftValidator` y Compatibility Gate para OC V5 y Recepción V2 antes de continuar con UMBRELLA.

No ejecutar Recepción V2, no tocar UMBRELLA, no activar runtime y no continuar UI/QA hasta resolución PO del defecto.
