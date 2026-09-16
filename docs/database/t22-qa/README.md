# Certificación SQL T22

Runner QA explícito; no se integra al arranque ni a los endpoints. Requiere variable `MOKA_CHECKAPPERP_QA_CONNECTION` proporcionada por el entorno autorizado. No colocar su valor en código, comandos registrados ni documentación. Valida CheckAppErp y su GUID antes de escribir; aborta ante destino diferente o gate no compatible.

Ejecutar `dotnet run --project T22Qa.csproj` desde esta carpeta con el entorno ya configurado. El resultado saneado se guarda junto al binario como T22_QA_RESULT.json. RESULTADO_SQL_REAL.json conserva la ejecución certificada del 2026-09-14.

Crea exactamente dos categorías temporales QA-A/QA-B bajo GUIDs nuevos, dentro de transacción. T22 recibe C/D como contextos QA del resolver, sin escribir Firebase. Ejecuta 15 llamadas (10 repetidas C, una D, dos concurrentes C/C y dos C/D), más regresión por controller real con conexión SQL real. Compara metadata y SHA-256 del contenido ordenado de las 20 tablas y controles. No imprime datos de filas ni conexiones.

El cleanup usa los IDs y empresas generados por esta ejecución; se ejecuta en DisposeAsync incluso ante fallo, y nunca borra filas preexistentes. En éxito exige hashes iguales a los originales y gate compatible después de limpiar. No crea productos demo ni usa DDL. El runner usa contexto servidor de fixture; no certifica autenticación Firebase interactiva.
