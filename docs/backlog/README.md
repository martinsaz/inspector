# Backlog CheckApp

Este directorio reorganiza el trabajo de CheckApp en tres backlogs reportables para seguimiento diario de PM/PO y liderazgo tecnico. No sustituye la documentacion historica: la consolida y apunta a sus fuentes.

## BL-01 - Arquitectura Multitenant / Patron CheckApp

BL-01 contiene la arquitectura transversal reusable construida en T11 a T24: resolucion tenant a base, DatabaseIdentity, clasificacion de schema, control de version, contrato versionado, bootstrap, migraciones, drift, locking, gate de compatibilidad, aislamiento multitenant, bootstrap empresarial, AuthZ y QA integral.

T11 a T24 conservan su identidad historica. T25 aparece solo como `FROZEN / NO INICIADO`.

## BL-02 - Homologacion CheckApp

BL-02 agrupa pantallas y modulos existentes que deben cumplir el Patron CheckApp completo. Incluye menu, Roles y Permisos, Proveedores, ABC Sucursales, Razones Sociales y Regiones.

Cada ticket BL-02 debe medirse contra el documento oficial del patron: `inspector/docs/pattern/PATRON_CHECKAPP_OFICIAL_20260916.md`. En las fichas se referencia como `DoD: PATRON CHECKAPP 30/30 APLICABLES`.

## BL-03 - Verticales Operativos

BL-03 contiene proximos procesos o modulos operativos: Ordenes de Compra, Recepcion, Catalogo de Curvas, Catalogo de Huecos y Catalogo de Copetes.

Estos tickets nacen como `PENDIENTE DE AUDITORIA` salvo evidencia documental real que justifique otro estado. No inician implementacion.

## Identificacion de tickets

- `T11` a `T24`: tickets historicos de arquitectura y ProductosServicios.
- `T25`: QA manual PO, congelado.
- `HC-001` en adelante: homologacion de pantallas existentes.
- `VO-001` en adelante: verticales operativos.

## Estados oficiales

Usar solo estos estados:

- `PENDIENTE`
- `EN AUDITORIA`
- `EN DESARROLLO`
- `EN QA TECNICO`
- `EN QA PO`
- `BLOQUEADO`
- `FROZEN`
- `CERRADO`

`PASS` no es estado de ticket. `PASS` puede aparecer como resultado de una prueba, criterio o certificacion tecnica.

## Porcentajes

Usar solo esta escala:

- `0%`: no iniciado.
- `25%`: auditoria iniciada.
- `50%`: implementacion en curso.
- `75%`: implementacion terminada / QA pendiente.
- `90%`: QA tecnico aprobado / QA PO pendiente.
- `100%`: cierre PO aprobado.

Si no existe evidencia suficiente para asignar porcentaje, usar `REQUIERE_VALIDACION_PM/PO`.

## Cierre

Una implementacion o certificacion tecnica no cierra un ticket por si sola. Para `CERRADO` y `100%` debe existir evidencia de cierre PO. Si QA PO encuentra defectos despues de un PASS tecnico, prevalece el estado manual mas reciente.

## Reporte diario

Para generar el reporte diario:

1. Revisar `REPORTE_EJECUTIVO_CHECKAPP.md`.
2. Identificar tickets con cambio de estado, avance, bloqueo o siguiente accion.
3. Usar `PLANTILLA_REPORTE_DIARIO_CHECKAPP.md`.
4. Mantener evidencia concreta con ruta documental o archivo relevante.

## Agregar un ticket

Para agregar un ticket:

1. Elegir backlog correcto: BL-01, BL-02 o BL-03.
2. Usar la definicion completa de ticket: ID, backlog, nombre, objetivo, problema, alcance, fuera de alcance, dependencias, criterios de aceptacion, estado, avance, evidencia, bloqueos, responsable tecnico, QA requerido, siguiente accion y fecha.
3. No asignar porcentaje sin evidencia.
4. Actualizar `REPORTE_EJECUTIVO_CHECKAPP.md`.
5. Actualizar `INDICE_TRAZABILIDAD_TICKETS.md`.

