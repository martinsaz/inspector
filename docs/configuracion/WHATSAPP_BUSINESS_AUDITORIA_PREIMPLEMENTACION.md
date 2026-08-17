# WhatsApp Business Platform: Auditoria Preimplementacion

Fecha de auditoria: `2026-08-15`
Estado: `SOLO AUDITORIA Y DISENO`
Alcance: evaluar viabilidad para enviar cotizaciones PDF por WhatsApp sin modificar el flujo actual, sin implementar codigo, sin SQL y sin tocar correo documental.

## 1. Objetivo

Determinar si la solucion oficial de Meta permite que CheckApp envie cotizaciones en PDF directamente por WhatsApp y disenar la integracion futura respetando:

- multitenancy por empresa
- empresa activa resuelta server-side
- secretos solo en backend
- reutilizacion del PDF actual de cotizaciones
- independencia de Login, Registro, Firebase, MailRegistro y Correo saliente

## 2. Dictamen ejecutivo

Si existe una ruta oficial viable.

La API oficial recomendada es `WhatsApp Business Platform - Cloud API`.

La plataforma oficial soporta:

- envio de texto
- envio de documentos PDF
- envio de documento con caption
- uso de media subida previamente y referenciada por `media_id`
- uso de templates para mensajes iniciados por empresa fuera de la ventana de servicio

CheckApp si podria evolucionar a este modelo, pero no con otro parche frontend. La evolucion correcta es backend-to-Meta, con configuracion aislada por empresa, secretos protegidos y webhooks de estado.

## 3. Documentacion oficial consultada

- Meta - About the WhatsApp Business Platform  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform`
- Meta - WhatsApp Cloud API Get Started  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started`
- Meta - Document messages  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/document-messages`
- Meta - Service messages  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages`
- Meta - Media  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media`
- Meta - Message API  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/reference/whatsapp-business-phone-number/message-api`
- Meta - Template fundamentals  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview`
- Meta - Template media  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-media/`
- Meta - Embedded Signup overview  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview`
- Meta - Onboard WhatsApp Business app users  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users`
- Meta - Register a business phone number  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration`
- Meta - Business phone numbers  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers`
- Meta - Webhooks overview  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview`
- Meta - Status messages webhook reference  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/status`
- Meta - Pricing on the WhatsApp Business Platform  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing`
- Meta - Getting opt-in for WhatsApp  
  `https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in`

## 4. Hallazgos oficiales

### 4.1 API oficial actual

La ruta oficial vigente es `Cloud API` dentro de `WhatsApp Business Platform`.

Hallazgo adicional importante:

- el modelo `On-Premises API` ya no es la direccion recomendada para nuevas integraciones
- para CheckApp la ruta correcta es Cloud API

### 4.2 Soporte funcional del mensaje

La documentacion oficial confirma viabilidad para:

- texto libre dentro de la ventana de servicio
- documento PDF en mensaje tipo document
- documento con caption
- documento por `media_id`
- documento por URL en los ejemplos oficiales de document message / message API

Conclusion funcional:

- una cotizacion PDF dinamica de CheckApp si es compatible con el producto oficial
- el reto no es el PDF; el reto real es arquitectura, onboarding, plantillas, opt-in y trazabilidad

### 4.3 Metodo oficial para entregar el PDF

Meta documenta dos patrones relevantes:

1. subir media y usar `media_id`
2. usar enlace/URL publica donde el API lo permita

Para CheckApp, la estrategia recomendada es:

- generar el PDF en backend reutilizando el export existente
- subirlo a Meta mediante Media Upload API
- recibir `media_id`
- enviar el document message usando ese `media_id`

Motivo:

- evita exponer URLs publicas del PDF al cliente
- evita tener que abrir infraestructura de archivos publicos temporales
- mantiene el documento bajo control server-side

### 4.4 Conversaciones, ventana de 24 horas y templates

Meta documenta:

- los `service messages` son mensajes libres enviados durante una `customer service window` de 24 horas
- la ventana inicia cuando el usuario escribe o llama
- fuera de esa ventana, los `template messages` son el unico tipo de mensaje permitido para iniciar contacto

Implicacion directa para cotizaciones:

- si el cliente escribio recientemente y la ventana sigue abierta, se puede enviar mensaje de documento usando el flujo de servicio
- si el cliente nunca escribio o la ventana expiro, la empresa no puede iniciar con texto libre
- en ese caso se requiere template aprobado

### 4.5 Cliente que nunca escribio antes

Escenario especifico solicitado:

- cliente no ha escrito previamente por WhatsApp

Resultado oficial:

- no procede mensaje libre
- se requiere mensaje iniciado por empresa mediante template
- ademas Meta exige `opt-in` previo del usuario

Para CheckApp esto significa:

- no basta con tener telefono
- se necesita consentimiento valido para mensajes de la empresa
- el flujo futuro debe distinguir entre:
  - `ventana abierta`
  - `sin ventana pero con opt-in y template aprobado`
  - `sin elegibilidad para envio`

### 4.6 Templates y documento

Meta documenta que:

- las plantillas son los unicos mensajes que pueden enviarse fuera de la ventana de servicio
- las plantillas pueden tener `header`, `body`, `footer`, `buttons`
- `template media` soporta header con `image`, `video`, `GIF` o `document`

Implicacion:

- si CheckApp necesita enviar cotizaciones a clientes sin ventana abierta, la ruta mas coherente es un `utility template` con header de documento

### 4.7 Webhooks y estados

Meta documenta webhooks para:

- mensajes entrantes
- estados de mensajes salientes
- errores relevantes

Estados observables por diseño:

- aceptado por API
- enviado
- entregado
- leido
- error / fallo

Esto hace viable una trazabilidad real por cotizacion y destinatario.

### 4.8 Costos

Hallazgos oficiales de pricing vigentes al `2026-08-15`:

- Meta cobra en esquema `per-message basis`
- segun la pagina oficial vigente, el cobro confirmado ocurre cuando un `template message` es entregado
- la tarifa varia por categoria del template y por pais del destinatario
- Meta publica tablas y cambios de pricing que pueden variar en el tiempo

Hallazgo temporal importante:

- Meta ya anuncio una actualizacion para `2026-10-01` sobre cobro de mensajes no template

Conclusion de costos:

- no es seguro fijar cifras duras dentro de este documento
- antes de implementar se debe revisar la tabla oficial vigente en la fecha real de alta
- la estimacion financiera depende como minimo de:
  - pais del cliente
  - categoria del template
  - volumen
  - si el envio cae dentro o fuera de la ventana de servicio

## 5. Numero telefonico

La documentacion oficial indica:

- se requiere un `business phone number` registrado para Cloud API
- Meta soporta onboarding de numeros ya usados en `WhatsApp Business app`
- Embedded Signup puede devolver `WABA ID`, `business phone number ID` y un token intercambiable

Respuesta de diseno:

- si, existe posibilidad oficial de reutilizar un numero existente
- pero no debe asumirse automaticamente para todas las empresas
- cada empresa debe validarlo durante onboarding

Recomendacion:

- no imponer un numero global de CheckApp
- el modelo correcto es `numero por empresa`
- si una empresa no puede o no quiere migrar/reutilizar su numero actual, debera provisionar uno dedicado

## 6. Requisitos de Meta

Para una integracion productiva razonable, se debe prever:

- Meta Business Account / negocio en Meta
- WhatsApp Business Account (`WABA`)
- numero telefonico comercial registrado
- `phone number ID`
- app de Meta
- access token
- configuracion de webhooks
- verify token del webhook
- plantillas aprobadas para mensajes iniciados por empresa
- opt-in del usuario

Segun el caso de onboarding, tambien puede requerirse:

- verificacion del negocio
- verificacion de propiedad del numero
- aprobacion del display name

## 7. Auditoria del proyecto actual

### 7.1 PDF reutilizable

Si, el PDF actual ya es reutilizable.

Evidencia tecnica actual:

- MVC expone `ExportarCotizacionPdf` en  
  `/Users/denissemendiola/dev/Inspecciones/inspector/checklist/Controllers/Cotizaciones/CotizacionesController.cs`
- API genera el PDF real en  
  `/Users/denissemendiola/dev/Inspecciones/inspectorapi/checklistWs/Controllers/Cotizaciones/CotizacionesController.cs`
- el backend ya tiene el punto de ensamblado documental en:
  - `ObtenerDocumentoCotizacionAsync(...)`
  - `BuildPdfDocument(documento)`

Por lo tanto:

- no debe duplicarse la generacion del PDF
- el futuro envio por WhatsApp debe reutilizar la misma fuente documental oficial que hoy usa correo

### 7.2 Multitenancy y secretos

La arquitectura actual ya muestra el patron correcto para esta futura integracion:

- MVC firma y propaga contexto tenant
- API resuelve empresa activa server-side
- correo documental ya protege secretos con `IDataProtector`

Esto es valioso porque la integracion WhatsApp deberia seguir exactamente la misma filosofia:

- nada de tokens en frontend
- nada de `phone_number_id` operado por JS
- nada de secretos por querystring
- nada de almacenamiento en navegador como autoridad

### 7.3 Independencia de verticales sensibles

El modulo futuro debe permanecer aislado de:

- Login
- Registro
- Firebase
- MailRegistro
- Correo saliente documental

Puede convivir dentro de `Ajustes > Configuracion`, pero como subsistema separado.

## 8. Arquitectura propuesta para CheckApp

### 8.1 Configuracion futura

Se recomienda evaluar una nueva seccion:

`Ajustes > Configuracion > WhatsApp`

No agregarla todavia.

Su objetivo futuro seria guardar por empresa:

- habilitado / activo
- WABA ID
- phone number ID
- access token o referencia a secreto
- app secret si la estrategia de validacion lo requiere
- webhook verify token
- modo sandbox / productivo
- templates aprobados a usar para cotizaciones

### 8.2 Donde deben vivir los secretos

Nunca en frontend.

Ubicacion recomendada:

- backend API
- persistencia protegida por empresa
- secretos cifrados o guardados en secret store / vault compatible

Secretos y datos sensibles a proteger:

- access token
- phone number ID
- WABA ID
- app secret
- webhook verify token

### 8.3 Flujo backend propuesto

Flujo tecnico recomendado:

1. usuario en `Cotizaciones` pulsa `WhatsApp`
2. frontend envia solo:
   - `idCotizacion`
   - telefono destino
   - opcion UX elegida
3. MVC hace proxy firmado al API
4. API resuelve empresa server-side
5. API carga configuracion WhatsApp de la empresa
6. API obtiene cotizacion documental con `ObtenerDocumentoCotizacionAsync`
7. API genera PDF con `BuildPdfDocument`
8. API sube PDF a Meta y recibe `media_id`
9. API decide:
   - service message si hay ventana abierta
   - template utility si no hay ventana abierta y existe template aprobado + opt-in
10. API envia el mensaje
11. API devuelve confirmacion inicial
12. webhooks actualizan estado real posterior

### 8.4 Endpoints futuros previstos

Sin implementarlos aun, la forma mas coherente seria:

- MVC:
  - proxy de configuracion WhatsApp
  - proxy de envio documental por WhatsApp
- API:
  - obtener configuracion tenant
  - guardar configuracion tenant
  - probar conexion / validar credenciales
  - enviar cotizacion por WhatsApp
  - recibir webhooks de Meta

## 9. Persistencia propuesta

No crear tabla todavia.

Pero si conviene prever una persistencia propia para trazabilidad, separada del correo.

Campos recomendados:

- idCotizacion
- idEmpresa
- telefono destino
- tipo de envio
- template usado si aplica
- fecha de solicitud
- fecha de aceptacion por Meta
- fecha de enviado
- fecha de entregado
- fecha de leido
- estado actual
- `messageId` de Meta
- codigo / mensaje de error
- usuario que disparo el envio

## 10. UX propuesta

### 10.1 Principio

La UX debe dejar de simular WhatsApp Web y pasar a un envio documental real por backend.

### 10.2 Recomendacion funcional

Se recomienda:

- modal de confirmacion breve
- telefono editable
- mensaje no libre en primera etapa
- texto/caption controlado por plantilla o politica de negocio
- feedback real de `Preparando documento...`
- feedback posterior:
  - `Enviado a Meta`
  - `Entregado`
  - `Leido`
  - `Error`

### 10.3 Opcion recomendada entre A/B/C/D

- A) enviarse inmediatamente: no como unica experiencia; conviene confirmacion breve
- B) abrir modal de confirmacion: si, recomendado
- C) permitir editar mensaje: no en fase 1, salvo que Product Owner lo pida expresamente
- D) registrar estado del envio: si, altamente recomendado

UX futura sugerida:

`Cotizaciones -> WhatsApp -> telefono -> Confirmar envio -> Preparando documento... -> Enviado por WhatsApp`

Si no es elegible:

- `No es posible iniciar este envio por WhatsApp sin opt-in y template aprobado.`

## 11. Riesgos

- onboarding de Meta mas complejo que SMTP
- dependencia externa de politicas, pricing y aprobaciones de Meta
- necesidad de opt-in real por usuario
- necesidad de templates aprobados para mensajes iniciados por empresa
- necesidad de webhooks publicos y estables
- gestion segura de secretos por empresa
- convivencia entre empresas con numeros distintos
- soporte operacional cuando una empresa cambie numero, token o WABA

## 12. Dependencias externas

- cuenta Meta Business / negocio
- WABA
- numero telefonico por empresa
- aprobaciones de plantilla
- opt-in del cliente
- webhook publico HTTPS
- politica y disponibilidad de Meta

## 13. Que debe proporcionar el Product Owner

- decision de negocio sobre si WhatsApp sera opcional por empresa
- definicion de si cada empresa usa su propio numero o si habra un modelo central
- definicion de mensaje/caption permitido para cotizaciones
- definicion de cuando se puede iniciar contacto
- definicion de politica de opt-in
- definicion de si quiere historial de estados entregado/leido/error en UI
- definicion de SLA operacional para soporte de integracion Meta

## 14. Que debemos configurar en Meta

- app de Meta
- producto WhatsApp
- WABA
- numero(s) telefonico(s)
- registro/verificacion del numero
- webhooks
- verify token
- access token de larga duracion o estrategia equivalente
- templates utility para cotizaciones
- flujo de Embedded Signup si se busca onboarding por empresa

## 15. Que debemos implementar en CheckApp

- configuracion tenant de WhatsApp
- resguardo de secretos
- servicio backend para Media Upload API
- servicio backend para Message API
- decision de envio por ventana abierta vs template
- webhook receiver
- trazabilidad de estados
- UX de envio y consulta de estatus

## 16. Que no debemos implementar

- otro parche frontend con `wa.me`
- exposicion de tokens en navegador
- URLs publicas improvisadas del PDF como atajo por defecto
- dependencia de Login/Firebase/MailRegistro
- duplicacion del generador PDF
- decision de negocio sin definir opt-in y templates

## 17. Complejidad estimada

`ALTA`

Justificacion:

- integracion externa con onboarding y politicas
- configuracion multitenant por empresa
- secretos protegidos
- media upload + message send + webhook lifecycle
- decision de negocio sobre ventana, templates y opt-in
- trazabilidad completa de estados

## 18. Conclusiones finales

- `WhatsApp Business Platform / Cloud API` si es una solucion oficial viable para cotizaciones PDF
- CheckApp puede reutilizar el PDF actual
- la estrategia recomendada es `backend -> Media Upload API -> media_id -> document message`
- para clientes fuera de la ventana de 24 horas se requerira template aprobado
- para clientes que nunca escribieron antes se requerira, ademas, opt-in valido
- la evolucion correcta es una integracion dedicada por empresa, no otro ajuste del frontend actual
