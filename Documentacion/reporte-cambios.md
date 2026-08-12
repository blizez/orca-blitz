# Reporte de Cambios para Usuarios
**Fecha:** 2026-08-11
**Commits analizados:** 4

## Commits Recientes
- feat: Add business settings, payment methods, sound system, and improved sidebar
- feat: Add AI providers settings with brand icons
- 973d5c2 feat: bootstrap Electron desktop app with settings and home UI
- e704b85 chore: add .gitignore and initial project setup


## Cambios para Usuarios

### Pantalla de inicio renovada
- Ahora muestra el logo de orca y el titulo de la app
- Botones **Add Business** e **Import Business** en el centro de la pantalla
- Atajos de teclado visibles: `Ctrl+N` para crear negocio, `Ctrl+I` para importar

### Formulario de creacion de negocios mejorado
- Ahora tiene **5 pasos** (antes 4): Basics, Products & Audience, Market, Channels, Goals
- Nuevo paso "Market" con campos para: competidores, diferenciador (USP), problemas actuales, ingresos mensuales, ano de fundacion
- Campo de sitio web y tamano del equipo incluidos

### Configuracion de negocios (Business Settings)
- Pagina completa para editar todos los datos de un negocio
- Editar nombre con boton de lapiz
- Editar descripcion con boton "Edit"
- Campos: tipo, industria, tamano del equipo, productos, audiencia, sitio web, competidores, USP, problemas, ingresos, ano, canales y metas
- Los cambios se guardan automaticamente

### Metodos de pago
- PayPal y Binance Pay vienen como metodos por defecto
- Puedes agregar metodos personalizados (Yape, Stripe, tu banco, etc.)
- Cada metodo tiene: nombre, numero de cuenta, y codigo QR opcional
- Acordeon para expandir y contraer cada metodo
- Eliminar metodos personalizados con confirmacion
- Los metodos por defecto no se pueden eliminar

### Sonidos de interaccion
- La app reproduce sonidos en distintas acciones
- Sonido al cambiar interruptores (on/off)
- Sonido de exito al crear un negocio
- Sonido de error al eliminar un negocio
- Sonido suave al cerrar ventanas
- Control de volumen en Settings → Notifications
- Puedes activar o desactivar los sonidos

### Barra lateral mejorada
- Los negocios ahora se expanden y colapsan
- Sub-secciones visibles: Social Media, Content, Campaigns
- La seccion activa se resalta con color
- Puedes tener varios negocios expandidos al mismo tiempo
- Borde visible en el negocio expandido

### Ajustes
- "Plans & Billing" renombrado a **Payment Methods**
- Logo de orca en la barra superior cuando estas en ajustes
- Boton **Back to app** para volver a la pantalla principal
- Interrupctor de sonido con control de volumen en Notifications

### Modales
- Fondo difuso (blur) en las ventanas de crear y eliminar negocio
- Eliminar negocio requiere escribir el nombre para confirmar

### Icono de Google
- Icono simplificado con la "G" de Google


## Detalles
- Nuevas funcionalidades: True
- Cambios en interfaz: True
- Cambios en ajustes: True
- Nuevas paginas: True

## Accion Requerida
Revisar los cambios y actualizar la documentacion de usuarios en Documentacion segun las funcionalidades nuevas o modificadas.
