# CLAUDE

## Patron CheckApp

- Antes de modificar una pantalla, lee `AGENTS.md` y la documentacion de `docs/ui/`.
- Si la tarea impacta UI, ejecuta este flujo:
  - audita comportamiento actual
  - detecta riesgos funcionales y responsive
  - implementa con cambios minimos
  - valida que no se rompa el flujo principal
  - documenta evidencia y pendientes
- Usa la paleta y tokens definidos documentalmente en `docs/ui/PATRON_CHECKAPP.md`.
- No dejes colores hardcodeados cuando exista token definido por el Patron CheckApp.
- Para tablas y listados reutilizables converger al futuro componente oficial `CheckAppDynamicGrid`.
- Para paneles de filtros plegables converger al futuro componente oficial `CheckAppFilterAccordion`.
- Desde `2026-07-24` la implementación técnica oficial inicial ya existe en:
  - `checklist/wwwroot/css/checkapp-theme.css`
  - `checklist/wwwroot/js/checkapp-ui.js`
  - `docs/ui/CHECKAPP_COMPONENTES.md`
- Toda pantalla debe contemplar `loading`, `empty state`, `error state` y mobile real.
- No muevas logica de negocio al frontend.
- No cambies contratos, permisos, sesion o persistencia sin instruccion explicita.
- Cuando no puedas completar una auditoria o QA, dejalo documentado con fecha `2026-07-24` y el bloqueo real.

## Regla documental permanente

- Toda decision de Product Owner, regla de negocio, restriccion, cambio relevante, estado de QA, pendiente real y cierre de etapa debe quedar registrado en `AGENTS.md` y `CLAUDE.md` en la misma iteracion.
- `AGENTS.md` y `CLAUDE.md` deben permanecer consistentes y no pueden contradecirse.

## Vertical Cotizaciones

### Reglas globales

- Cotizaciones opera en MVC `http://localhost:5200` y API `http://localhost:5127`.
- La referencia visual obligatoria es `Activos`; no modificar `Activos` al implementar Cotizaciones.
- `Sazmobile26` es legacy de solo lectura para auditoria y migracion funcional.
- Regla permanente del vertical: `NO TALLAS`.
- No modificar `Login`, `Firebase`, `Sesion`, `SQL`, roles, permisos u otros verticales sin autorizacion expresa.
- QA manual del Product Owner prevalece sobre la certificacion automatica.
- Las microiteraciones no deben alterar funcionalidades ya aprobadas.
- Si Codex inicia procesos para QA, solo esos procesos deben detenerse al terminar.

### Historia minima obligatoria

- `Etapa 00`: preparacion del vertical, menu `Cotizaciones -> ABC Cotizaciones`, ruta `/Cotizaciones/Index`, sin roles nuevos.
- `Etapa 01`: migracion funcional base desde `Sazmobile26` en solo lectura, incluyendo listado, nueva cotizacion, cliente, sucursal, vigencia, observaciones, productos, servicios, partidas, cantidad, precio, descuento, subtotal, total, guardado, borrador, edicion, clonacion, cancelacion y PDF.
- `Etapa 02`: distribucion y autorizacion, incluyendo WhatsApp, correo, compartir, PDF, autorizacion y estados `Borrador`, `Autorizada` y `Cancelada`.
- `Etapa 03`: mejoras UX/UI de `Nueva cotizacion` con Patron CheckApp, resumen, colapsado inteligente, cliente, descuento, datos, observaciones, productos/servicios, imagenes, detalle operativo, responsive, popup PDF y regreso al Reporte.
- `Etapa 03.1`: auditoria de descuento, distinguiendo `descuento cliente` y `descuento partida`; regla heredada `max(descuentoProductoBase, descuentoCliente)` con tope automatico de `10%`, salvo edicion manual autorizada.
- `Etapa 03.2`: correccion del payload de clientes para exponer `Descuento`; caso validado `Sadie Sink 5%`, producto `$680`, descuento `$34`, total `$646`.
- `Etapa 03.3`: compactacion visual de `Unidad`, `Cantidad` y `Precio` en desktop, sin romper tablet ni mobile.
- `Etapa 04`: correccion del `localhost` en WhatsApp; estado real aprobado: chat correcto, telefono correcto, mensaje limpio, sin `localhost`, sin `GUID`, PDF generado y descargado; pendiente real: el PDF no se adjunta automaticamente al chat. Correo sigue bloqueado porque `mail.supervisores.mx` no resuelve por DNS.
- `Etapa 04.2`: auditoria final de distribucion; el navegador real auditado no expone `navigator.share`, `navigator.canShare` ni soporte `files`, por lo que `wa.me` solo transporta texto y el adjunto del PDF debe seguir siendo manual mientras no exista soporte web real o una definicion aprobada distinta.

## Ajustes > Configuración > Correo saliente

- Desde el `2026-08-13`, `Correo saliente` queda definido como correo saliente documental de negocio y no como parte de autenticación o correo interno base.
- Su alcance exclusivo es:
  - cotizaciones
  - órdenes de compra
  - documentos comerciales o operativos para cliente autorizados por Product Owner
- Queda prohibido mezclarlo con:
  - `LoginController`
  - registro
  - recuperación de contraseña
  - Firebase Authentication
  - `MailRegistro`
  - `mail.supervisores.mx`
  - infraestructura SMTP base compartida
- Árbol aprobado:
  - `Ajustes`
  - `Configuración`
  - `Correo saliente`
- Regla confirmada:
  - `Configuración` debe ir después de `Operadores`
  - `Correo saliente` será el único hijo inicial
- Hallazgos reales:
  - `EmailServices` ya existe en MVC y depende de `MailRegistro`
  - `MailRegistro` se hidrata hoy desde Firebase Realtime Database
  - consumidores auditados: `LoginController` y `CotizacionesController`
  - no se encontró SMTP por empresa en SQL, API ni `appsettings`
  - el modelo actual es global, no multitenant
  - el bloqueo de `mail.supervisores.mx` en Cotizaciones proviene de esa misma fuente global
- Corrección arquitectónica obligatoria:
  - el hallazgo anterior demuestra riesgo en la infraestructura actual, no una arquitectura a reutilizar para el nuevo módulo
  - el nuevo correo saliente documental debe vivir como subsistema aislado, multitenant y sin tocar la infraestructura base protegida
  - la contraseña no puede volver al navegador una vez guardada
- Documento base de planeación:
  - `docs/configuracion/CORREO_SALIENTE_AUDITORIA_PREIMPLEMENTACION.md`
- QA Google Workspace del `2026-08-14`:
  - sesión QA reutilizada con configuración visible:
    - `denisse@checkapp.com.mx`
    - `smtp.gmail.com`
    - puerto `465`
    - `SSL/TLS`
  - infraestructura SMTP validada fuera de la UI:
    - DNS correcto para `smtp.gmail.com`
    - TLS válido en `smtp.gmail.com:465`
  - resultado real del módulo:
    - la pantalla siguió mostrando `La respuesta del servidor no pudo interpretarse.`
    - no hubo evidencia observable de salida SMTP del backend a `smtp.gmail.com:465` en la corrida
  - estado de certificación:
    - Google Workspace SMTP no quedó certificado todavía
    - el siguiente diagnóstico debe concentrarse en UI/proxy MVC/API antes de culpar autenticación SMTP
  - corrección parcial aplicada el mismo día:
    - `Controllers/Configuracion/ConfiguracionController.cs` quedó endurecido para mantener contrato JSON consistente en `Obtener/Probar/GuardarCorreoSaliente`
    - el proxy MVC ahora fuerza `Accept: application/json`, envía `application/json` explícito y devuelve JSON controlado ante contenido vacío, no JSON o excepciones del proxy
    - `La respuesta del servidor no pudo interpretarse.` quedó clasificado como error del cliente en `wwwroot/js/Configuracion/CorreoSaliente.js -> readJson(response)`
  - estado posterior a la corrección parcial:
    - `localhost:5200` compiló y se relanzó con la corrección
    - la pestaña real de Chrome permitió localizar `Enviar correo de prueba`, pero la automatización disponible no reprodujo todavía una corrida UI end-to-end concluyente
    - no existe aún evidencia cerrada de POST útil a `ProbarCorreoSaliente` ni de certificación SMTP final desde la pantalla
  - QA manual asistido concluido el `2026-08-14`:
    - Denisse ejecutó manualmente un único clic real en `Enviar correo de prueba`
    - evidencia técnica observada:
      - `POST /Configuracion/ProbarCorreoSaliente` sí salió de UI a MVC
      - MVC llamó `POST http://localhost:5127/api/CorreoSaliente/ProbarConfiguracion?...`
      - MVC recibió `200 OK` con `Content-Type: application/json`
    - evidencia funcional observada:
      - mensaje UI `Correo de prueba enviado correctamente.`
      - estado `Verificada`
      - `Guardar configuración` habilitado
    - guardado y persistencia:
      - se ejecutó un único guardado posterior con `POST /Configuracion/GuardarCorreoSaliente`
      - MVC recibió `200 OK` con `application/json`
      - después de recargar, `ObtenerConfiguracion` respondió `200 OK`
      - persistieron `denisse@checkapp.com.mx`, `smtp.gmail.com`, puerto `465`, `SSL/TLS` y estado verificado
    - seguridad:
      - la contraseña no volvió visible al navegador
      - la UI posterior solo mostró `Contraseña configurada. Déjala vacía para conservarla.`
    - certificación:
      - Google Workspace SMTP quedó certificado en el módulo `Correo saliente` a nivel UI/MVC/API y persistencia local
      - la recepción externa del buzón queda pendiente de validación manual de Denisse
  - microcorrección final de fecha/hora concluida el `2026-08-14`:
    - causa raíz exacta:
      - `FechaUltimaPrueba` se generaba con `DateTime.UtcNow`
      - SQL la persistía como `datetime2` sin offset
      - al releerla, `SqlDataReader.GetDateTime()` devolvía `Kind=Unspecified`
      - el JSON posterior a `ObtenerConfiguracion` perdía el sufijo `Z`
      - el frontend hacía `new Date(value)` y esa variante rerecuperada se interpretaba como hora local, desplazando la hora visible aproximadamente `+6` horas
    - estrategia final:
      - persistencia UTC intacta
      - el API remarca como UTC las fechas leídas desde SQL antes de serializarlas
      - la UI mantiene conversión a zona local del navegador solo para presentación
    - archivo modificado:
      - `Controllers/Configuracion/CorreoSalienteController.cs`
    - resultado QA:
      - después de recargar, `Última prueba` volvió a mostrarse como `14 ago 2026, 2:59 p.m.`
      - desapareció el desfase visual entre prueba, guardado y `F5`
      - SMTP, `Verificada`, `Guardar`, persistencia y password protegido permanecieron intactos
