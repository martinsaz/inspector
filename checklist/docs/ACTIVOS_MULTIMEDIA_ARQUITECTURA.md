# ACTIVOS MULTIMEDIA ARQUITECTURA

## Flujo final

Captura o selección  
↓  
Validación cliente  
↓  
Optimización de fotografía  
↓  
Firebase temporal  
↓  
Guardar Activo  
↓  
`ActivosMultimedia`  
↓  
Confirmación final  
↓  
Limpieza de temporales

## Arquitectura final

El módulo Activos trabaja en dos fases.

1. Cada archivo se valida en cliente antes de subir.
2. Cada archivo nuevo se carga de forma temporal a Firebase con una operación aislada.
3. El formulario final de `GuardarActivo` ya no transporta binarios grandes en Base64.
4. El backend valida nuevamente tipo, tamaño, firma y contexto de empresa.
5. El backend confirma rutas finales por empresa y activo.
6. Después de confirmar SQL, elimina los temporales de la operación.

## Límites

- Fotografías: mínimo `1`, máximo `3`, máximo `10 MB` antes de optimizar.
- Fotografías finales: lado mayor máximo `1920 px`, compresión JPEG objetivo `80 %` a `85 %`.
- Video: máximo `1`, máximo `200 MB`, captura objetivo `720p`, sin audio.
- Documentos: mínimo `1`, máximo `3`, máximo `25 MB`.
- Endpoint final `GuardarActivo`: límite exclusivo `20 MiB`.

## Rutas

Ruta temporal:

```text
{empresa}/Activos/Temporal/{operacion}/{tipo}/{guid}.{extension}
```

Rutas finales:

```text
{empresa}/Activos/{idActivo}/Fotos/{guid}.{extension}
{empresa}/Activos/{idActivo}/Video/{guid}.{extension}
{empresa}/Activos/{idActivo}/Documentos/{guid}.{extension}
```

## Estrategia de limpieza

- Si un archivo temporal se elimina desde el formulario, se invoca `LimpiarMultimediaTemporal`.
- Si el usuario cierra el modal de alta o edición, se liberan los temporales pendientes de esa operación.
- Si `GuardarActivo` falla, el backend elimina los archivos finales o temporales que alcanzó a mover en esa ejecución.
- Si `GuardarActivo` termina correctamente, el backend elimina los temporales asociados a los tokens confirmados antes de responder éxito.

## Estrategia de reintento

- La carga se controla por archivo, no por lote completo.
- Si una evidencia falla, sólo ese elemento pasa a estado `Error`.
- El formulario conserva datos, previews y archivos ya confirmados.
- El botón `Reintentar` vuelve a subir únicamente el archivo con error.
