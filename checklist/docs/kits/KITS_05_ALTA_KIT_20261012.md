# KITS-05 — Alta de Kit

Fecha: 2026-10-12  
Estado: implementación y QA técnica terminadas; pendiente QA manual Denisse.  
No representa aprobación PO ni congelamiento funcional.

## Alcance

- Botón `+ Nuevo Kit` exclusivo de WRITE `05001011`.
- Modal XL alineado al Golden Master de ProductosServicios.
- Alta Producto, Servicio o Mixto; Activo/Inactivo; precio de Kit independiente.
- Producto base, Variante, Presentación de venta y Servicio sin exponer `TipoIdentidad`.
- Resolución de precio por Lista de Precios Nivel 1 con edición previa y snapshot.
- Composición local con cantidad, edición, remoción, duplicados, cambio de tipo y resumen.
- Guardado atómico serializable con revalidación, tenant firmado, AuthZ, idempotencia e historial.
- Imagen opcional JPG/PNG/WEBP de hasta 10 MB con token temporal HMAC, promoción tenant-safe y compensación.

## QA runtime autenticada

UMBRELLA empresa 163:

- Producto base, Variante, Presentación de venta, Servicio y Mixto Producto+Servicio: PASS.
- Precio Kit `0.00` distinto del valor de componentes: PASS.
- Doble clic, actualización de DynamicGrid y F5: PASS.
- Cambio de tipo incompatible bloqueado nombrando el componente: PASS.
- Estado vacío inicial y final: `No hay Kits registrados.`
- Responsive físico: 1440, 820 y 390; en cada medición `innerWidth = clientWidth = bodyScrollWidth`; resize 390→820 sin F5 preservó el borrador.
- La selección física de archivo no pudo ejecutarse por el permiso de acceso local de la extensión Chrome; no se subió archivo ni quedó temporal. El pipeline sí quedó cubierto por build y pruebas de contrato/código.

## Regresión

- Build API: PASS, 0 errores.
- Build MVC: PASS, 0 errores.
- JavaScript `node --check`: PASS.
- Focal Kits: 37/37 PASS.
- Suite completa: 946/947 PASS; único fallo histórico conocido `ListaPreciosMatrixSqlIntegrationTests.ConsultaMatricialReal_MaterializaTodasLasIdentidadesYDiezNiveles`.
- `git diff --check`: PASS.
- Secret scan: PASS; contraseña no persistida ni documentada.

## Cleanup y límites

- Fixtures exactos eliminados después de verificar F5.
- UMBRELLA final: Kits 0, KitsComponentes 0, KitsHistorial 0.
- Roles/usuarios legítimos: sin cambios netos.
- No se implementó KITS-06, baja/reactivación UI ni integración comercial/operativa.
- ProductosServicios se usó sólo como referencia visual; dominios congelados no fueron modificados.
