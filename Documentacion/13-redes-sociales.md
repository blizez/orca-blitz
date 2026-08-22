# Navegador de redes sociales

Desde la barra lateral, selecciona **Social Media** dentro de un negocio para abrir el navegador de redes sociales.

## Plataformas disponibles

Puedes abrir estas plataformas en la app:

| Plataforma | Icono |
|------------|-------|
| **WhatsApp** | Verde de WhatsApp |
| **Instagram** | Icono de Instagram |
| **Facebook** | Icono azul de Facebook |
| **TikTok** | Icono de TikTok |
| **Telegram** | Icono azul de Telegram |
| **X / Twitter** | Icono de X |

---

## Como usar el navegador

### Abrir una plataforma

1. Ve a **Social Media** en la barra lateral
2. Selecciona una plataforma de la cuadricula
3. Se abre la plataforma en la pestana actual

### Abrir multiples pestanas

1. Haz click en el boton `+` en la barra de pestanas
2. Se abre una nueva pestana con la pantalla de seleccion
3. Elige una plataforma diferente para esa pestana
4. Puedes tener varias plataformas abiertas al mismo tiempo

### Cambiar entre pestanas

Haz click en el nombre de la pestana que quieras ver.

### Cerrar una pestana

Haz click en el boton `X` que aparece al pasar el mouse sobre la pestana.

---

## Barra de navegacion

Arriba del navegador hay tres botones:

- **Flecha izquierda** — Volver a la pagina anterior
- **Flecha derecha** — Ir a la siguiente pagina
- **Recargar** — Recargar la pagina actual

Estos botones funcionan igual que en un navegador normal.

---

## Consejos

- Cada pestana es independiente, puedes tener WhatsApp e Instagram abiertos al mismo tiempo
- Las plataformas se cargan como en un navegador web
- Si una plataforma tarda en cargar, veras un indicador de carga
- Puedes cerrar pestanas que no estes usando para mantener el orden
- Cada plataforma tiene sesion independiente (puedes tener WhatsApp e Instagram abiertos con diferentes cuentas)

## Bandeja unificada de WhatsApp

La tarjeta **Unified Inbox** abre una bandeja local de WhatsApp por negocio. Pulsa **Conectar WhatsApp** y escanea el código QR desde `WhatsApp > Dispositivos vinculados`.

- La sesión se guarda localmente para reconectar al abrir la aplicación.
- Los mensajes y contactos se almacenan en SQLite dentro de los datos locales de Orca.
- No se necesita API key, servidor, Docker ni suscripción.
- La conexión utiliza Baileys, una implementación comunitaria del protocolo de WhatsApp Web. WhatsApp puede cambiar el protocolo o limitar cuentas que automaticen envíos; no se debe utilizar para spam o envíos masivos.

## Prioridad del CRM multicanal

El desarrollo del inbox seguirá este orden:

1. WhatsApp
2. Instagram
3. Facebook Messenger
4. Telegram
5. Gmail

TikTok, X/Twitter, Discord y otras redes permanecerán disponibles como navegador mientras se implementan sus conectores oficiales y seguros. El inbox utilizará el mismo formato de conversación para todos los canales, con filtros por plataforma, contactos compartidos, etiquetas y respuestas desde un solo lugar.

### Telegram

Telegram usa el cliente MTProto oficial mediante GramJS. Las credenciales `ORCA_TELEGRAM_API_ID` y `ORCA_TELEGRAM_API_HASH` pertenecen a la aplicación Orca y no se solicitan al usuario final. El usuario únicamente introduce su teléfono, el código de Telegram y su contraseña 2FA si la tiene.

La sesión se almacena cifrada con `safeStorage` en los datos locales del negocio. Si las credenciales internas todavía no están configuradas, el inbox muestra el estado de conexión pendiente en lugar de fallar silenciosamente.

### Instagram y Facebook Messenger

Estas conexiones usan OAuth oficial de Meta. Las variables internas `ORCA_META_APP_ID` y `ORCA_META_APP_SECRET` deben pertenecer a la aplicación Meta de Orca y el redirect local `http://localhost:1456/meta/callback` debe estar registrado en ella. El token se guarda cifrado con `safeStorage`; nunca se expone al renderer.

La autorización requiere una cuenta profesional de Instagram o una Página de Facebook y los permisos de mensajería aprobados por Meta. La siguiente etapa conectará la sincronización de conversaciones y webhooks/polling sobre este token.
