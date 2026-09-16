# QA controlada T23

Resultado ejecutado el 2026-09-14: PASS de seguridad independiente; AuthZ REQUIERE_DECISION_PO. No certifica cierre integral.

`Program.cs` reproduce los controllers API actuales, firma HMAC existente con clave sintética de QA y T11 con lector fixture, contra SQL real CheckAppErp. No conecta a Firebase ni crea tenants. Conserva las etiquetas QA-C-T22/QA-D-T22 del runner de regresión: representan los contextos A/B generados para esta ejecución.

La conexión se recibe exclusivamente por la variable de entorno `MOKA_CHECKAPPERP_QA_CONNECTION`, aprovisionada fuera del repositorio. No escribirla en comandos, logs ni documentos. El programa verifica nombre e identidad de la base antes de escribir y exige GUIDs de empresa sin filas. No es un ejecutor para datos productivos.

Crea siete filas propias: dos categorías, dos unidades, dos servicios y un registro multimedia B cuya URL example.invalid no se consume. Usa transacción y limpieza finally por IDs e idEmpresa; comprueba los hashes originales tras eliminar exactamente siete filas. No hace DDL. Si hay un fallo, revisar el resultado antes de repetir; no borrar datos ajenos.

Ejecutar con `dotnet run --project inspector/docs/database/t23-qa/T23Qa.csproj`. El JSON de cada nueva ejecución se escribe junto al binario, sin sustituir la evidencia histórica. La versión archivada sustituye únicamente la adquisición local de conexión por entorno y la identidad textual por un digest de correlación. La evidencia publicada se saneó de igual modo. El digest no es el fingerprint canónico T12.

Incluye 15 ejecuciones T22 NO-OP, listados, ficha/PDF propios y ajenos, baja ajena, JSON/query/multipart, identidad/scope falsos, firma inválida/expirada y cuatro estados T11 inválidos. T20 BLOCK utiliza un gate fixture (503), no drift físico inducido. Los claims contradictorios y headers arbitrarios se prueban en la suite automática. No se prueba acceso directo a Firebase Storage, login interactivo ni AuthZ sin una regla funcional existente.

Verificación del runner archivado: build PASS, cero errores (21 warnings de dependencias/nullable); no se repitieron escrituras SQL al compilarlo. Tests de solución 384/384 PASS; builds principales API/MVC sin errores; git diff --check PASS. Puertos preexistentes 5127/5200: PIDs 49365/49371 conservados.
