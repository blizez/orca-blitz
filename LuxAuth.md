# Enterprise Automation Platform

## Technical Architecture & Development Blueprint

Version: 1.0

Status: Planning

Language: TypeScript

---

## 1. Project Vision

### Mission

Crear una plataforma empresarial open source capaz de automatizar, analizar y mejorar operaciones completas de negocios mediante:

- Automatizaciones.
- Inteligencia artificial.
- Integraciones externas.
- Gestión empresarial.
- Análisis predictivo.
- Recomendaciones inteligentes.

El objetivo no es crear solamente un chatbot o un constructor de workflows.

El objetivo es crear una plataforma donde una empresa pueda centralizar:

- Comunicación.
- Clientes.
- Ventas.
- Marketing.
- Operaciones.
- Datos.
- Automatizaciones.
- Inteligencia empresarial.

---

## 2. Core Philosophy

### Principle: Business First

La plataforma no debe estar orientada a herramientas.

Incorrecto:

```
"Conecta WhatsApp"
"Usa n8n"
"Configura un bot"
```

Correcto:

```
"Mejora la operación de tu negocio"
```

La tecnología debe estar oculta.

El usuario piensa en objetivos:

- Aumentar ventas.
- Reducir costos.
- Mejorar atención.
- Automatizar procesos.
- Analizar datos.

La plataforma decide cómo lograrlo.

---

## 3. Main Goals

### Multi Platform

La aplicación debe funcionar en:

- Windows
- Linux
- macOS
- Web
- Android
- iOS

Todas las plataformas deben compartir:

- Código.
- Lógica.
- Componentes.
- Diseño.
- Experiencia.

---

## 4. Technology Philosophy

### Single Language Architecture

Todo el ecosistema debe utilizar TypeScript.

No utilizar:

- Kotlin.
- Swift.
- Dart.
- C#.

Excepto cuando sea estrictamente necesario para integración nativa.

La arquitectura principal:

```
TypeScript
|
|
+-- React
|
+-- Electron
|
+-- React Native
|
+-- Node.js
```

---

## 5. Application Architecture

La plataforma estará dividida en capas.

```
+------------------------------------------------+
|              Client Applications               |
|                                                |
|         Desktop | Web | Android | iOS          |
+------------------------------------------------+
                |
+------------------------------------------------+
|                Presentation Layer              |
|                                                |
|                 React Components               |
|                 Design System                  |
|                 UI                             |
+------------------------------------------------+
                |
+------------------------------------------------+
|               Application Layer                |
|                                                |
| Features                                       |
| CRM                                            |
| Automation                                     |
| Analytics                                      |
| AI                                             |
+------------------------------------------------+
                |
+------------------------------------------------+
|                  Domain Layer                  |
|                                                |
|                Business Rules                  |
|                Entities                        |
|                Events                          |
+------------------------------------------------+
                |
+------------------------------------------------+
|                   Infrastructure               |
|                                                |
|                  Database                      |
|                  APIs                          |
|                  External Services             |
+------------------------------------------------+
```

---

## 6. Monorepo Architecture

El proyecto utiliza un único repositorio. Desktop y Web comparten packages. Mobile es un workspace separado con sus propias dependencias.

```
orca-blitz/
├── apps/
│   ├── desktop/             ← Electron
│   └── web/                 ← Browser
├── packages/
│   ├── shared/
│   ├── core/
│   ├── infrastructure/
│   ├── ui/
│   ├── features/
│   ├── ai/
│   ├── plugins/
│   └── sdk/
├── server/
├── relay/
├── plugins/
├── config/
├── docs/
└── tests/
```

Mobile vive aparte:

```
orca-blitz/
└── mobile/                  ← PROYECTO SEPARADO
    ├── pnpm-workspace.yaml  ← Sus propias dependencias
    ├── pnpm-lock.yaml
    └── package.json
```

---

## 7. Applications

### Desktop

Tecnología:

```
Electron + React + TypeScript
```

Responsabilidades:

- Crear ventanas.
- Acceso al sistema operativo.
- Integraciones nativas.
- Navegador integrado.
- Gestión de archivos.
- Notificaciones.

Electron NO contiene lógica empresarial.

Arquitectura:

```
Electron Main
    |
    |
Preload
    |
    |
React Renderer
    |
    |
Shared Packages
```

---

### Web

Tecnología:

```
React + TypeScript
```

Responsabilidad:

Ser otro cliente del mismo sistema.

No contiene lógica empresarial.

---

### Mobile

Tecnología:

```
React Native + TypeScript
```

Responsabilidad:

Ejecutar la misma plataforma desde dispositivos móviles.

---

## 8. Universal UI System

### Objetivo

Todas las plataformas deben verse iguales.

Ejemplo:

Windows:

```
Dashboard
CRM
Automation
Analytics
```

Linux:

```
Dashboard
CRM
Automation
Analytics
```

Android:

```
Dashboard
CRM
Automation
Analytics
```

La experiencia debe ser consistente.

---

## 9. Design System

Todos los componentes visuales pertenecen a un único sistema.

Ejemplo:

```
packages/ui/
Button
Input
Modal
Table
Card
Sidebar
Tabs
Charts
Forms
Theme
Icons
```

Nunca crear componentes visuales directamente dentro de una aplicación.

Incorrecto:

```
desktop/Button.tsx
mobile/Button.tsx
web/Button.tsx
```

Correcto:

```
packages/ui/Button.tsx
```

---

## 10. Feature Architecture

La aplicación se organiza por capacidades.

Ubicación:

```
packages/features/
```

Ejemplo:

```
packages/features/
├── index.ts
├── crm/
├── automation/
├── analytics/
├── sales-engine/
├── self-learning/
├── advisor/
├── reporting/
├── marketing/
└── ...
```

Cada feature contiene:

```
feature/
├── index.ts
├── domain/
├── application/
├── infrastructure/
├── ui/
└── events/
```

#### Ejemplo CRM

```
crm/
domain/
Customer.ts
Company.ts
Lead.ts
application/
CreateCustomer.ts
ConvertLead.ts
infrastructure/
CRMRepository.ts
ui/
CustomerTable.tsx
CustomerCard.tsx
```

---

## 11. Core Principle

Toda funcionalidad nueva debe implementarse una sola vez.

Ejemplo:

Nueva función:

```
"Crear campaña automática de Navidad"
```

Lugar correcto:

```
packages/features/marketing/
```

Después automáticamente estará disponible para:

- Desktop.
- Web.
- Android.
- iOS.

---

## 12. Communication Architecture

Los módulos no deben depender directamente unos de otros.

Utilizar:

### Event Driven Architecture

Ejemplo:

```
customer.created
    |
    |
Automation Engine
    |
    |
Send Welcome Message
```

Eventos:

```
user.created
customer.updated
invoice.created
message.received
workflow.completed
ai.generated
```

---

## 13. Plugin System

La plataforma debe ser extensible.

Ejemplo:

Instalar:

Plugin:

```
WhatsApp Integration
```

La plataforma agrega:

Capability:

```
sendMessage()
receiveMessage()
templates()
```

Sin modificar el Core.

---

## 14. AI Architecture

La IA no es solamente chat.

Debe funcionar como:

### Business Intelligence Assistant

Capacidades:

- Analizar datos.
- Detectar patrones.
- Crear recomendaciones.
- Generar campañas.
- Explicar problemas.
- Automatizar decisiones.

Ejemplo:

Sistema:

- Las ventas bajaron 15%.
- Razones detectadas:
- Menos clientes recurrentes.
- Producto X perdió demanda.
- Competidor lanzó promoción.

Recomendaciones:

- Crear campaña.
- Ajustar precio.
- Contactar clientes antiguos.

---

## 15. User Ownership

La plataforma debe evitar dependencia.

El usuario puede:

- Usar su propia API Key.
- Elegir proveedor de IA.
- Hospedar su instalación.
- Exportar datos.
- Instalar plugins.

Opciones:

```
Self Hosted
o
Cloud Managed
```

---

## 16. Database Philosophy

La aplicación debe soportar:

Cloud:

```
PostgreSQL
```

Local:

```
SQLite
```

El Core no debe depender directamente de una base.

Debe utilizar:

```
Repository Pattern
```

Ejemplo:

```
CustomerRepository
|
|
PostgreSQL
o
SQLite
```

---

## 17. Internal Package Architecture

El proyecto utiliza una arquitectura basada en paquetes independientes.

Cada paquete debe tener:

- Responsabilidad única.
- Interfaces públicas claras.
- Dependencias controladas.
- Tests propios.

Ejemplo:

```
packages/
├── shared/
├── core/
├── infrastructure/
├── ui/
├── features/
├── ai/
├── plugins/
└── sdk/
```

---

## 18. Package Rules

### Regla principal

Un paquete no puede importar cualquier cosa.

Debe existir una jerarquía.

Correcto:

```
UI
↓
Features
↓
Core
↓
Infrastructure
```

Incorrecto:

```
Core
↓
UI
```

El Core nunca debe conocer interfaces.

---

## 19. Shared Package

El paquete shared contiene contratos globales.

Ubicación:

```
packages/shared/
```

Contiene:

```
types/
interfaces/
constants/
events/
schemas/
utils/
```

Ejemplo:

```
export interface Customer {
    id: string;
    name: string;
    email: string;
}
```

Todos los clientes utilizan exactamente la misma definición.

Desktop:

```
import { Customer } from "@shared/types";
```

Mobile:

```
import { Customer } from "@shared/types";
```

Web:

```
import { Customer } from "@shared/types";
```

## 20. Core Package

El Core es el cerebro del sistema.

Ubicación:

```
packages/core/
```

Responsabilidades:

- Reglas de negocio.
- Entidades.
- Casos de uso.
- Eventos.
- Servicios internos.

No conoce:

- Electron.
- React.
- React Native.
- Navegadores.
- UI.

#### Core Structure

```
core/
entities/
use-cases/
services/
events/
interfaces/
repositories/
errors/
```

Ejemplo

Entidad:

```
Customer.ts
class Customer {
id:string;
name:string;
}
```

Servicio:

```
CustomerService
createCustomer()
updateCustomer()
deleteCustomer()
```

Repositorio:

```
CustomerRepository
save()
find()
remove()
```

## 21. Feature Architecture

Cada módulo empresarial vive separado.

Ejemplo:

```
features/
crm/
automation/
marketing/
sales/
inventory/
support/
```

Cada feature contiene:

```
feature/
domain/
application/
infrastructure/
ui/
```

#### Ejemplo CRM

```
crm/
domain/
Customer.ts
Company.ts
Lead.ts
application/
CreateCustomer.ts
ConvertLead.ts
infrastructure/
CRMRepository.ts
ui/
CustomerTable.tsx
CustomerCard.tsx
```

## 22. Runtime Architecture

El proyecto utiliza un Runtime intermedio.

La interfaz nunca habla directamente con el sistema.

Arquitectura:

```
React UI
   |
   |
Application API
   |
   |
Runtime
   |
   |
Operating System
```

#### Runtime Responsibilities

El Runtime controla:

- Procesos.
- Automatizaciones.
- Plugins.
- Integraciones.
- Sesiones.
- Archivos.
- Navegador.
- Seguridad.

## 23. Desktop Architecture

Desktop utiliza:

```
Electron
+
React
+
TypeScript
```

Estructura:

```
apps/desktop/
src/
main/
preload/
renderer/
services/
```

## 24. Electron Main Process

Main es el proceso con permisos.

Puede:

- Crear ventanas.
- Gestionar procesos.
- Acceder al sistema.
- Controlar módulos nativos.

No puede:

- Renderizar UI.
- Tener lógica empresarial.

#### Main Structure

```
main/
├── index.ts
├── ipc/
│   ├── register-core-handlers.ts
│   ├── customers.ts
│   ├── workflows.ts
│   ├── integrations.ts
│   └── reports.ts
├── persistence/
│   ├── store.ts
│   ├── schema.ts
│   └── migrations/
├── runtime/
│   ├── orca-runtime.ts
│   └── rpc/
├── window/
├── browser/
├── plugins/
│   ├── plugin-host-entry.ts
│   ├── plugin-host-process.ts
│   ├── plugin-event-bus.ts
│   ├── plugin-content-safety.ts
│   └── plugin-registry.ts
├── notifications/
├── updater/
└── daemon/
```

## 25. Renderer Process

Renderer es React.

Responsabilidades:

- Mostrar información.
- Manejar interacción.
- Renderizar componentes.

No puede:

- Leer archivos directamente.
- Ejecutar comandos.
- Acceder al sistema.

## 26. Preload Layer

Preload es una capa de seguridad.

Su función:

Exponer APIs controladas.

Ejemplo:

Main:

```
ipcMain.handle(
"customer:create",
createCustomer
)
```

Preload:

```
window.api.customer.create()
```

React:

```
window.api.customer.create(data)
```

## 27. IPC Architecture

La comunicación entre procesos utiliza contratos.

Ejemplo:

```
  Renderer
      |
      |
IPC Request
      |
      |
    Main
      |
      |
   Runtime
  IPC Rules
```

Nunca:

```
ipcRenderer.send(
"doAnything"
)
```

Siempre:

```
api.customer.create()
```

Cada acción tiene:

- Nombre.
- Parámetros.
- Respuesta.
- Permisos.

## 28. Browser Manager

La plataforma necesita navegador integrado.

No se debe crear un navegador por módulo.

Debe existir:

```
Browser Manager
Browser Manager Responsibilities
```

Gestiona:

- Sesiones.
- Cookies.
- Perfiles.
- Ventanas.
- Permisos.
- Cache.
- Storage.

```
Architecture
Automation
    |
    |
Browser Manager
    |
    |
Electron BrowserView
```

Ejemplo

WhatsApp Plugin:

Solicita:

```
browser.createSession({
name:"whatsapp"
})
```

Browser Manager:

Crea:

Session:

```
whatsapp-profile
```

Cookies:

```
separadas
```

Storage:

```
aislado
```

## 29. Browser Profiles

Cada integración debe poder tener su propio perfil.

Ejemplo:

```
Profiles/
whatsapp/
instagram/
facebook/
google/
```

No compartir:

- Cookies.
- Tokens.
- Sesiones.

## 30. Automation Engine

El sistema de automatizaciones es un motor propio.

No depende de una herramienta externa.

```
Concepto
```

Una automatización es:

```
Trigger
+
Conditions
+
Actions
```

Ejemplo:

```
Cuando llega un mensaje
SI
cliente es nuevo
ENTONCES
crear contacto
enviar bienvenida
Workflow Architecture
Workflow
|
Trigger
|
Rules
|
Actions
|
Execution
|
Logs
```

## 31. Event Bus

Todas las partes del sistema comunican eventos.

Ejemplo:

Cliente creado:

```
event.emit(
"customer.created",
customer
)
```

Escuchan:

CRM:

```
guardar historial
```

Marketing:

```
crear segmento
```

IA:

```
analizar cliente
Event Examples
user.created
customer.created
message.received
sale.completed
workflow.started
workflow.finished
ai.analysis.completed
```

## 32. Plugin Architecture

La plataforma debe permitir extensiones.

Ejemplos:

Plugins:

- WhatsApp.
- Instagram.
- ERP.
- CRM externo.
- Email.
- IA.

#### Plugin Structure

```
plugin/
manifest.json
index.ts
services/
ui/
permissions/
```

#### Plugin Manifest

Ejemplo:

```
{
"name":"whatsapp",
"version":"1.0.0",
"permissions":[
"browser",
"messages"
]
}
```

## 33. SDK

Los desarrolladores externos utilizan:

```
packages/sdk/
```

Para crear:

- Plugins.
- Integraciones.
- Automatizaciones.

Ejemplo:

```
import {
Plugin,
Event,
Browser
}
from "@platform/sdk";
```

## 34. Security Model

La seguridad debe existir desde el inicio.

Principios:

```
Least Privilege
```

Un módulo solamente recibe permisos necesarios.

Ejemplo:

- Plugin WhatsApp:

Permisos:

```
browser
messages
contacts
```

No tiene:

```
filesystem
database
system
```

## 35. Data Flow Complete Example

Caso:

Cliente envía mensaje.

```
WhatsApp
↓
Browser Manager
↓
Plugin WhatsApp
↓
Event Bus
↓
Automation Engine
↓
CRM
↓
AI Analysis
↓
Response
```

Todo ocurre sin que la UI conozca detalles.

## 36. Development Rule

Agregar una funcionalidad nueva:

Nunca:

```
Crear código en Desktop
Crear código en Mobile
Crear código en Web
```

Siempre:

```
Crear Package
Crear Feature
Crear UI Component
Crear Events
Crear Tests
Registrar en el Registry
```

## 37. Golden Architecture Rule

La aplicación debe poder reemplazar cualquier cliente.

Ejemplo:

Cambiar Electron:

NO debe romper:

- Core.
- Features.
- Plugins.
- UI.

Cambiar React:

- NO debe romper:
- Business Logic.
- Data.
- Services.

La arquitectura debe sobrevivir a cambios tecnológicos.

---

## 38. Universal Interface Philosophy

### Objetivo

La plataforma debe tener una experiencia visual idéntica en:

- Windows
- Linux
- macOS
- Web
- Android
- iOS

El usuario no debe sentir que está usando aplicaciones diferentes.

---

## 39. Single UI Source

Debe existir una única fuente de verdad para la interfaz.

Incorrecto:

```
desktop/
CustomerPage.tsx
mobile/
CustomerPage.tsx
web/
CustomerPage.tsx
```

Esto genera:

- Diferencias visuales.
- Bugs duplicados.
- Mantenimiento triple.

---

Correcto:

```
packages/
ui/
features/
crm/
    CustomerPage.tsx
```

Todos consumen la misma implementación.

---

## 40. UI Architecture

La interfaz se divide en tres niveles:

```
Design System
    ↓
Feature Components
    ↓
Application Screens
```

---

## 41. Design System

El Design System es la base visual.

Ubicación:

```
packages/ui/
```

Contiene solamente:

- Componentes.
- Estilos.
- Tokens.
- Animaciones.
- Temas.

Nunca contiene:

- Lógica empresarial.
- API calls.
- Base de datos.

---

## 42. Design Tokens

Todos los valores visuales se definen como CSS variables en un archivo CSS separado, nunca en componentes ni en TypeScript.

### Ubicación

```
packages/ui/theme/globals.css
```

### Cómo funciona

Cada color se define como una CSS variable con un nombre semántico:

```
background/foreground        → Fondo de la app y texto principal
card/card-foreground         → Paneles elevados
popover/popover-foreground   → Menús flotantes
primary/primary-foreground   → Acción principal (botones)
secondary                    → Acción secundaria
muted                        → Texto sutil, placeholders
accent                       → Hover, focus
destructive                  → Errores, eliminar
border                       → Bordes
input                        → Campos de formulario
ring                         → Focus rings
sidebar                      → Sidebar
chart-1 a chart-5            → Gráficas
```

### Regla

Nunca colores dentro de componentes. El componente solo dice qué es, no cómo se ve.

Incorrecto:
```
<div style={{color:"#2563EB"}}>
```

Correcto:
```
<div className="text-primary">
```

Los componentes usan tokens semánticos. El tema define los valores. Cambiar el tema cambia todos los colores.

## 43. Component Architecture

Cada componente debe tener:

```
Component/
index.ts
Component.tsx
styles.ts
types.ts
tests.tsx
```

#### Example Button

```
Button/
Button.tsx
Button.types.ts
Button.styles.ts
index.ts
Button Contract
interface ButtonProps {
```

variant:

```
"primary" |
"secondary" |
"danger";
```

size:

```
"small" |
"medium" |
"large";
```

children:

```
ReactNode;
}
```

## 44. Component Categories

#### Primitive Components

Componentes básicos.

Ejemplo:

```
Button
Input
Checkbox
Switch
Icon
Avatar
Badge
Spinner
```

#### Layout Components

Estructuras.

Ejemplo:

```
Container
Stack
Grid
Sidebar
Panel
SplitView
ModalLayout
```

#### Business Components

Componentes con información empresarial.

Ejemplo:

```
CustomerCard
InvoiceCard
ProductCard
MessageBubble
WorkflowNode
```

## 45. Feature UI

Cada módulo tiene sus componentes.

Ejemplo:

```
features/
crm/
ui/
CustomerTable.tsx
CustomerDetails.tsx
CustomerTimeline.tsx
```

Pero utilizan:

```
packages/ui
```

## 46. Screen Architecture

Una pantalla no debe contener lógica.

Incorrecto:

```
function Customers(){
fetchCustomers()
calculateStats()
saveCustomer()
return <Table />
}
```

Correcto:

```
function Customers(){
const customers =
useCustomers()
return (
<CustomerTable
data={customers}
/>
)
}
```

La lógica vive en servicios.

## 47. State Management

La aplicación utiliza diferentes tipos de estado.

#### Local State

Estado temporal.

Ejemplo:

```
const [open,setOpen]
```

#### Global UI State

Estado visual global.

Ejemplo:

- Tema.
- Sidebar.
- Modal abierto.
- Preferencias.
- Herramienta:
- Zustand.

Ubicación:

```
packages/ui-state/
```

#### Server State

Datos externos.

Ejemplo:

- Clientes.
- Productos.
- Ventas.
- Herramienta:
- TanStack Query.

## 48. Data Flow

El flujo siempre debe ser:

```
UI
↓
Hooks
↓
Application Services
↓
Core
↓
Repository
↓
Database
```

Nunca:

```
UI
↓
Database
```

## 49. Example Complete Flow

Usuario crea cliente.

```
UI
CustomerForm
```

llama:

```
useCreateCustomer()
Hook
createCustomer(data)
Application Service
CustomerService.create()
Core
```

Valida:

- Datos.
- Permisos.
- Reglas.

```
Repository
```

Guarda:

```
PostgreSQL
o
SQLite
Event
```

Emite:

```
customer.created
```

## 50. Responsive Philosophy

Aunque la interfaz sea igual, debe adaptarse.

No crear:

```
Desktop UI
Mobile UI
```

Crear:

```
Same Components
Different Layout Rules
Example
```

Desktop:

```
Sidebar
   |
Content
```

Mobile:

```
Menu Button
Content
```

El componente es el mismo.

## 51. Layout System

Debe existir:

```
packages/ui/layout/
DesktopLayout
MobileLayout
TabletLayout
UniversalLayout
```

## 52. Platform Detection

La aplicación puede conocer el entorno:

platform:

```
"desktop"
"mobile"
"web"
```

Pero solamente para:

- Ajustes.
- Rendimiento.
- Integraciones.
- Nunca para duplicar interfaces.

Incorrecto:

```
if(android)
return DifferentScreen()
```

Correcto:

```
if(android)
adjustSpacing()
```

## 53. Theme System

La app soporta múltiples paletas de colores, no solo light/dark.

### Capas del tema

```
Capa 1: Modo
    Light / Dark
    (la app es clara u oscura)

Capa 2: Paleta de colores
    Neutro / Azul / Verde / Púrpura / etc.
    (los colores de la interfaz)

Capa 3: Custom
    El usuario crea la suya propia
```

### Cómo se combinan

```
Dark + Azul = App oscura con acentos azules
Light + Verde = App clara con acentos verdes
```

### Cambio en tiempo real

```
Usuario selecciona paleta
    ↓
Se cambian las CSS variables
    ↓
TODOS los componentes se ven diferentes
    ↓
No se toca ningún componente
```

### Persistencia

La preferencia del usuario se guarda. Al reiniciar la app, el tema seleccionado se restaura automáticamente.

## 54. Typography System

Debe estar centralizado.

Ejemplo:

```
Heading1
Heading2
Body
Caption
Label
Code
```

## 55. Icon System

Todos los iconos vienen de Lucide React. No se usa otra librería de iconos.

```
import { IconName } from "lucide-react"
```

Nunca crear iconos propios ni usar otra librería.

## 56. Animation System

Las animaciones deben estar definidas.

Ejemplo:

```
fadeIn
slideIn
collapse
expand
loading
```

## 57. Accessibility

Toda la UI debe soportar:

- Keyboard navigation.
- Screen readers.
- Contraste.
- Tamaños ajustables.

## 58. UI Testing

Cada componente importante debe tener:

```
Unit Test
Visual Test
Interaction Test
```

## 59. UI Development Rule

Antes de crear un componente nuevo:

Preguntar:

- ¿Ya existe?

Si existe:

- Reutilizar.

Si no:

- Crear en Design System.

## 60. Adding A New Feature UI

Ejemplo:

Nueva función:

```
"Gestión de proveedores"
```

Proceso:

```
1.
Crear dominio
packages/features/providers
2.
Crear servicios
ProviderService
3.
Crear eventos
provider.created
4.
Crear componentes UI
ProviderCard
ProviderTable
5.
Crear pantalla
ProvidersPage
6.
Disponible en todas las plataformas
```

## 61. Final UI Architecture

Resultado:

```
                 React
                   |
             Design System
                   |
        ---------------------
        |         |         |
     Desktop     Web    Mobile
        |         |         |
     Electron  Browser React Native
```

## 62. Main UI Principle

La plataforma no tiene tres aplicaciones.

Tiene una aplicación ejecutándose en tres tipos de clientes.

---

## 63. Backend Architecture

La plataforma debe separar completamente:

- Cliente.
- Lógica empresarial.
- Infraestructura.

Arquitectura general:

```
Client Applications
Desktop
Web
Mobile
    |
    |
API Gateway
    |
    |
Application Server
    |
    |
Core Services
    |
    |
Database + External Services
```

---

## 64. Backend Philosophy

El backend es una capa de servicios.

No debe contener lógica visual.

Responsabilidades:

- Autenticación.
- Usuarios.
- Organizaciones.
- Datos.
- Automatizaciones.
- IA.
- Integraciones.
- Permisos.

---

## 65. Backend Technology

Lenguaje:

```
TypeScript
```

Runtime:

```
Node.js
```

Framework recomendado:

```
Fastify
o
Hono
```

Motivo:

- Alto rendimiento.
- TypeScript nativo.
- Bajo consumo.
- Arquitectura modular.

---

## 66. Server Structure

```
server/
├── src/
│   ├── app.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── rate-limit.ts
│   │   └── error-handler.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── organizations.routes.ts
│   │   ├── customers.routes.ts
│   │   ├── workflows.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── integrations.routes.ts
│   │   ├── reports.routes.ts
│   │   └── plugins.routes.ts
│   ├── services/
│   ├── workers/
│   └── websocket/
│       ├── dispatcher.ts
│       ├── agent-hook-server.ts
│       └── fs-handler.ts
└── drizzle.config.ts
```

---

## 67. API Architecture

La API es la puerta de entrada.

Tipos:

```
REST API
WebSocket
Internal RPC
Event System
```

---

### REST API

Para:

- CRUD.
- Configuración.
- Usuarios.
- Datos.

Ejemplo:

```
GET
/customers
POST
/customers
PUT
/customers/:id
```

---

### WebSocket

Para tiempo real.

Ejemplo:

- Mensajes.
- Ejecuciones.
- Logs.
- Notificaciones.

Flujo:

```
Server
    |
    |
WebSocket
    |
    |
Client
```

---

## 68. User System

La plataforma tiene usuarios.

Entidad:

```
User
```

Ejemplo:

```
interface User {
id:string;
email:string;
name:string;
createdAt:Date;
}
```

## 69. Organization System

La unidad principal no es el usuario.

Es la organización.

Ejemplo:

Empresa:

```
Empresa ABC
    |
    |
Usuarios
    |
    |
Permisos
Organization Model
Organization
id
name
plan
settings
createdAt
```

## 70. Multi Tenant Architecture

La plataforma debe soportar múltiples empresas.

Ejemplo:

```
Database
   |
   |
Organization A
Customers
Automations
Users
Organization B
Customers
Automations
Users
```

#### Tenant Isolation

Todo dato debe pertenecer a una organización.

Ejemplo:

Incorrecto:

```
Customer
id
name
```

Correcto:

```
Customer
id
organizationId
name
```

## 71. Workspace System

Dentro de una empresa pueden existir espacios.

Ejemplo:

Empresa:

```
Marketing
Ventas
Soporte
Administración
```

Cada workspace puede tener:

- Usuarios.
- Automatizaciones.
- Datos.
- Configuración.

## 72. Permission System

Debe existir un sistema granular.

Ejemplo:

Roles:

```
Owner
Admin
Manager
Employee
Viewer
Permissions
```

Ejemplo:

```
customers.read
customers.create
customers.delete
automation.execute
automation.manage
plugins.install
Permission Flow
User Action
        |
Permission Check
        |
Allowed / Denied
        |
    Execution
```

## 73. Authentication

Debe soportar:

- Email.
- Password.
- OAuth.
- SSO empresarial.

```
Authentication Architecture
User
 |
Auth Service
 |
Session
 |
Access Token
 |
Application
```

## 74. Session Management

Cada dispositivo tiene una sesión.

Ejemplo:

```
  User
    |
Desktop Session
    |
Mobile Session
    |
Web Session
```

Cada sesión puede revocarse.

## 75. Database Architecture

La plataforma debe soportar:

```
Cloud Mode
PostgreSQL
Local Mode
SQLite
Database Layer
```

Nunca:

```
Feature
 |
Database
```

Siempre:

```
     Feature
        |
	Repository
        |
Database Adapter
    Example
CustomerService
        |
CustomerRepository
        |
----------------
	PostgreSQL
	SQLite
```

## 76. Data Synchronization

La aplicación debe soportar modo híbrido.

Ejemplo:

Usuario sin internet:

```
Desktop
SQLite Local
```

Luego:

```
Internet vuelve
        |
Sync Engine
        |
 Cloud Database
  Sync Engine
```

Responsable:

- Detectar cambios.
- Resolver conflictos.
- Sincronizar datos.

#### Conflict Example

Dos dispositivos editan:

```
Customer Name
```

Desktop:

```
Juan
```

Mobile:

```
John
```

Debe existir una estrategia:

```
Last Write Wins
o
Manual Resolution
```

## 77. Offline First Philosophy

Funciones críticas deben funcionar sin conexión.

Ejemplos:

- Ver clientes.
- Crear notas.
- Crear tareas.
- Revisar automatizaciones.

## 78. AI Architecture

La IA es un servicio interno.

No una simple ventana de chat.

#### AI Capabilities

Debe permitir:

- Chat empresarial.
- Análisis.
- Recomendaciones.
- Generación.
- Automatización.
- Predicción.

```
AI Layer
Application
        |
AI Service
        |
AI Provider Adapter
        |
Provider
```

## 79. AI Provider System

Nunca conectar directamente:

```
Feature
 |
OpenAI API
```

Incorrecto.

Correcto:

```
Feature
 |
AI Service
 |
Provider Adapter
 |
OpenAI
Anthropic
Local Model
Other
```

## 80. User Own API Key

El usuario puede colocar su propia clave.

Ejemplo:

Configuración:

AI Provider:

```
OpenAI
```

API Key:

```
************
```

#### API Key Storage

Nunca guardar texto plano.

Utilizar:

- Encriptación.
- Secret Storage.
- Key Management.

## 81. Platform AI Key

La empresa desarrolladora puede ofrecer:

```
Managed AI
```

Flujo:

```
User
 |
Platform Account
 |
Platform AI Key
 |
AI Service
```

## 82. AI Memory System

La IA debe tener contexto.

Tipos:

```
User Memory
```

Preferencias.

#### Organization Memory

Información empresarial.

#### Conversation Memory

Historial.

```
Memory Architecture
AI Request
 |
Context Builder
 |
Memory Retrieval
 |
Prompt Builder
 |
AI Provider
```

## 83. Business Intelligence Engine

La IA debe analizar eventos.

Ejemplo:

Evento:

```
sales.decreased
```

Proceso:

```
Event
 |
Analytics Engine
 |
AI Analysis
 |
Recommendation
```

Resultado:

Las ventas bajaron 15%.

Motivos:

- Menor frecuencia de compra.
- Menos clientes nuevos.

Acciones sugeridas:

- Crear campaña.
- Contactar clientes antiguos.

## 84. Automation + AI

La IA puede crear automatizaciones.

Ejemplo:

Usuario:

```
"Quiero mejorar mis ventas"
```

Sistema:

- Analiza:
- Clientes.
- Productos.
- Historial.

Propone:

Workflow:

```
Cuando cliente no compra durante 60 días
Enviar mensaje personalizado
Crear seguimiento
```

## 85. Notification System

Sistema centralizado.

Eventos:

```
notification.created
```

Canales:

- Desktop.
- Mobile.
- Email.
- Push.

## 86. Logging System

Todo debe generar logs.

Tipos:

```
System Logs
User Logs
Automation Logs
AI Logs
Security Logs
```

## 87. Audit System

Las empresas necesitan trazabilidad.

Ejemplo:

Usuario:

```
Carlos
```

Acción:

```
Eliminó cliente
```

Fecha:

```
2026-01-01
```

Resultado:

```
Correcto
```

## 88. Final Backend Architecture

Resultado:

```
                Clients
Desktop
Web
Mobile
                    |
                 API
                    |
              Core Services
                    |
        -----------------------
        |          |          |
    Database    AI       Integrations
```

## 89. Backend Golden Rules

- Toda lógica empresarial vive en servicios.
- Nunca conectar UI directamente con datos.
- Toda acción importante genera eventos.
- Toda integración externa usa adapters.
- Todo módulo debe ser reemplazable.
- El usuario es dueño de sus datos y claves.

---

## 90. Automation Platform Philosophy

La automatización es una de las partes centrales del sistema.

No debe ser solamente:

```
"Enviar mensajes"
```

Debe ser un motor capaz de automatizar procesos completos.

Ejemplos:

- Atención al cliente.
- Ventas.
- Marketing.
- Inventario.
- Finanzas.
- Recursos humanos.
- Operaciones.

---

## 91. Automation Engine

El Automation Engine es un sistema independiente.

Ubicación:

```
packages/automation/
```

Responsabilidades:

- Crear workflows.
- Ejecutar workflows.
- Controlar estados.
- Manejar errores.
- Registrar historial.
- Ejecutar acciones.

---

## 92. Workflow Concept

Un workflow está compuesto por:

```
Trigger
Nodes
Conditions
Actions
Execution
```

Ejemplo:

```
Nuevo cliente creado
    |
    |
Validar información
    |
    |
Enviar bienvenida
    |
    |
Crear tarea comercial
```

---

## 93. Workflow Model

Entidad principal:

```
Workflow
```

Modelo:

```
interface Workflow {
id:string;
organizationId:string;
name:string;
status:"active"|"inactive";
nodes:Node[];
createdAt:Date;
}
```

## 94. Node System

Todo dentro del workflow es un nodo.

Tipos:

```
Trigger Node
Action Node
Condition Node
Transform Node
AI Node
Integration Node
```

## 95. Trigger Nodes

Inician un workflow.

Ejemplos:

```
customer.created
message.received
sale.completed
schedule.time
webhook.received
```

## 96. Action Nodes

Ejecutan acciones.

Ejemplos:

```
sendMessage()
createCustomer()
updateDatabase()
sendEmail()
createTask()
```

## 97. Condition Nodes

Permiten lógica.

Ejemplo:

```
IF
customer.totalPurchases > 1000
THEN
VIP Customer
ELSE
Normal Customer
```

## 98. AI Nodes

La IA es un nodo más.

Ejemplo:

```
Message Received
        |
        |
AI Analyze Intent
        |
        |
Select Response
```

## 99. Workflow Execution Engine

Cada ejecución tiene un contexto.

Ejemplo:

```
ExecutionContext {
	workflowId:string;
	variables:Object;
	user:Object;
	organization:Object;
}

Execution Flow

Workflow Start
        |
	Load Context
        |
	Execute Node
        |
	Save Result
        |
	Continue
        |
	Finish
```

## 100. Execution History

Toda ejecución debe guardarse.

Ejemplo:

Workflow:

```
Customer Welcome
```

Execution:

```
2026-01-01
```

Status:

```
Completed
```

Steps:

1. Customer Created
2. Email Sent
3. Task Created

## 101. Error Handling

Los workflows deben soportar errores.

Ejemplo:

```
Enviar mensaje
       X
WhatsApp error
       |
Retry
       |
Alternative Action
Retry System
```

Configuración:

```
Maximum retries
Delay
Fallback action
Notification
```

## 102. Visual Workflow Builder

La interfaz debe permitir crear workflows visualmente.

Ejemplo:

```
[Trigger]
    |
[Condition]
    |
   [AI]
    |
[Action]
```

#### Builder Architecture

La UI solamente representa.

No ejecuta.

Flujo:

```
Workflow Builder UI
        |
Workflow Definition
        |
Automation Engine
        |
	Execution
```

## 103. Workflow Definition Format

Formato interno:

JSON.

Ejemplo:

```
{
	"name":"Customer Welcome",
	"nodes":[
		{
			"type":"trigger",
			"event":"customer.created"
		},
		{
			"type":"action",
			"action":"sendMessage"
		}
	]
}
```

## 104. Integration Architecture

Las integraciones externas nunca viven dentro del Core.

Ejemplo:

Incorrecto:

```
Core
 |
WhatsApp API
```

Correcto:

```
Core
 |
Integration Layer
 |
WhatsApp Plugin
```

## 105. Integration Layer

Las integraciones externas nunca viven dentro del Core.

Incorrecto:

```
Core
↓
WhatsApp API
```

Correcto:

```
Core
↓
Integration Layer
↓
WhatsApp Plugin
```

Ubicación:

```
plugins/
├── whatsapp/
├── instagram/
├── email/
├── telegram/
└── payments/
```

## 106. Integration Adapter Pattern

Todas las integraciones tienen una interfaz común.

Ejemplo:

```
interface MessagingProvider {
sendMessage()
receiveMessage()
getContacts()
}
```

Entonces:

WhatsApp:

```
class WhatsAppProvider
implements MessagingProvider
```

Email:

```
class EmailProvider
implements MessagingProvider
```

## 107. Supported Integrations

Primera etapa:

Comunicación:

- WhatsApp.
- Instagram.
- Facebook Messenger.
- Email.
- Telegram.

Negocio:

- CRM.
- ERP.
- E-commerce.
- Payments.

Productividad:

- Calendar.
- Documents.
- Storage.

## 108. Plugin System

La plataforma debe permitir extensiones externas.

Un plugin puede agregar:

- Integraciones.
- Pantallas.
- Automatizaciones.
- Nodos.
- Herramientas IA.

## 109. Plugin Architecture

```
Platform Core
        |
Plugin Manager
        |
Installed Plugins
```

## 110. Plugin Package Structure

Ejemplo:

```
my-plugin/
manifest.json
src/
    index.ts
    actions/
    components/
    services/
    permissions/
```

## 111. Plugin Manifest

Define información.

Ejemplo:

```
{
	"name":"whatsapp-plugin",
	"version":"1.0.0",
	"author":"Developer",
	"permissions":[
		"messages",
		"contacts"
	]
}
```

## 112. Plugin Lifecycle

Estados:

```
	Installed
      |
	Enabled
      |
	Running
      |
	Disabled
      |
	Removed
```

## 113. Plugin Permissions

Un plugin nunca tiene acceso total.

Ejemplo:

WhatsApp:

Permitido:

```
messages.send
messages.receive
contacts.read
```

No permitido:

```
filesystem
system.execute
database.raw
```

## 114. Marketplace

La plataforma debe tener un marketplace.

Permite:

- Instalar plugins.
- Compartir workflows.
- Compartir plantillas.
- Compartir integraciones.

```
Marketplace Architecture
	Marketplace
        |
Package Registry
        |
Plugin Manager
        |
Local Installation
```

## 115. Plugin Registry

Información:

```
Name
Version
Author
Downloads
Rating
Permissions
Compatibility
```

## 116. SDK For Developers

Debe existir un SDK oficial.

Ubicación:

```
packages/sdk/
```

#### SDK Capabilities

Permitir crear:

Plugins:

```
createPlugin()
```

Eventos:

```
subscribeEvent()
```

Automatizaciones:

```
createNode()
```

UI:

```
registerComponent()
```

## 117. Developer Experience

Crear un plugin debe ser sencillo.

Ejemplo:

```
create-platform-plugin my-plugin
```

Genera:

```
src/
manifest.json
README.md
tests/
```

## 118. Open Source Strategy

El proyecto debe permitir:

```
Community Edition
```

Características:

- Código abierto.
- Auto hospedado.
- Usuario coloca sus API Keys.

#### Cloud Edition

Servicio administrado:

Incluye:

- Hosting.
- Actualizaciones.
- IA administrada.

Soporte.

## 119. Feature Flags

Permitir activar funcionalidades.

Ejemplo:

```
feature.isEnabled(
"advanced-ai"
)
```

Usos:

- Beta testing.
- Planes comerciales.
- Experimentos.

## 120. Versioning Strategy

Todo debe tener versiones.

Ejemplo:

Core:

```
1.0.0
```

Plugin:

```
2.1.0
```

Workflow:

```
1.5.0
```

## 121. Compatibility System

Un plugin declara:

requiresPlatform:

```
>=1.0.0
```

Si no es compatible:

No instalar.

## 122. Update System

Debe existir actualización segura.

Componentes:

```
Application Update
Plugin Update
Database Migration
Configuration Migration
```

## 123. Migration System

Cuando cambia una estructura:

Ejemplo:

Antes:

```
Customer.name
```

Después:

```
Customer.firstName
Customer.lastName
```

Debe existir:

```
Migration Script
```

## 124. Open Source Repository Structure

Repositorio:

```
orca-blitz/
├── apps/
│   ├── desktop/
│   ├── web/
│   └── mobile/
├── packages/
│   ├── shared/
│   ├── core/
│   ├── infrastructure/
│   ├── ui/
│   ├── features/
│   ├── ai/
│   ├── plugins/
│   └── sdk/
├── server/
├── relay/
├── plugins/
├── config/
├── docs/
├── tests/
└── scripts/
```

## 125. Community Contribution

Los colaboradores pueden agregar:

- Plugins.
- Componentes.
- Integraciones.
- Mejoras.
- Pero deben seguir:
- Arquitectura.
- TypeScript.
- Tests.
- Documentación.

## 126. Final Automation Architecture

Resultado:

```
                User
                  |
          Workflow Builder
                  |
          Workflow Definition
                  |
          Automation Engine
                  |
        ---------------------
        |         |         |
    Actions    AI     Integrations
                  |
              Execution
                  |
               Logs
```

## 127. Automation Golden Rules

- Los workflows son datos, no código.
- Toda acción importante genera eventos.
- Las integraciones son plugins.
- La IA es un componente del workflow.
- Todo debe poder auditarse.
- Todo debe poder exportarse.

---

## 128. Security Architecture

La seguridad debe ser una característica del diseño inicial.

No debe agregarse después.

Principios:

- Zero Trust.
- Least Privilege.
- Data Ownership.
- Encryption.
- Auditability.

---

## 129. Security Layers

La plataforma tiene varias capas:

```
Application Security
    |
API Security
    |
Data Security
    |
Infrastructure Security
    |
Plugin Security
```

---

## 130. Application Security

Responsabilidades:

- Validación de entradas.
- Control de permisos.
- Manejo de sesiones.
- Protección de datos.

---

## 131. Input Validation

Nunca confiar en datos externos.

Ejemplo:

Incorrecto:

```
createUser(request.body)
```

Correcto:

```
const data = UserSchema.parse(
request.body
)
createUser(data)
```

Utilizar esquemas:

- Zod.
- JSON Schema.

## 132. API Security

Toda API debe validar:

- Identidad.
- Permisos.
- Organización.
- Acción.

Flujo:

```
Request
 |
Authentication
 |
Authorization
 |
Validation
 |
Execution
```

## 133. Data Encryption

Datos sensibles deben estar cifrados.

Ejemplos:

- API Keys.
- Tokens.
- Secretos.
- Información privada.

Nunca guardar:

```
api_key = "sk-xxxxx"
```

Guardar:

```
encrypted_api_key
```

## 134. Secrets Management

Los secretos deben estar separados.

Ejemplo:

```
User Data
≠
Application Secrets
```

## 135. Plugin Security Model

Los plugins son código externo.

Por lo tanto:

Nunca asumir confianza.

#### Plugin Isolation

Un plugin debe ejecutarse con permisos limitados.

Ejemplo:

```
Plugin
 |
Permission Layer
 |
Allowed APIs
```

## 136. Audit Logs

Toda acción importante genera registro.

Ejemplo:

User:

```
Maria
```

Action:

```
Created Automation
```

Date:

```
2026-01-01
```

Organization:

```
Company A
```

## 137. Security Events

Eventos:

```
user.login
user.logout
permission.changed
api_key.created
plugin.installed
data.exported
```

## 138. Testing Strategy

El proyecto debe tener pruebas desde el inicio.

Tipos:

```
Unit Tests
Integration Tests
End To End Tests
Visual Tests
Performance Tests
Security Tests
```

## 139. Unit Testing

Prueban piezas pequeñas.

Ejemplo:

```
CustomerService
WorkflowParser
PermissionChecker
```

## 140. Integration Testing

Prueban comunicación.

Ejemplo:

```
API
 |
Database
 |
Service
```

## 141. End To End Testing

Simula usuarios reales.

Ejemplo:

```
User Login
        |
Create Customer
        |
Run Automation
        |
Verify Result
```

## 142. UI Testing

Debe comprobar:

- Componentes.
- Navegación.
- Estados.
- Responsive.

## 143. Performance Testing

Medir:

- Tiempo de carga.
- Uso memoria.
- Ejecuciones simultáneas.
- Workflows grandes.

## 144. Code Quality Rules

Todo código debe cumplir:

- TypeScript strict mode.
- ESLint.
- Prettier.
- Tests.
- Documentación.

## 145. TypeScript Rules

Activar:

```
{
"strict":true
}
```

## 146. Naming Convention

Archivos:

```
CustomerService.ts
CustomerRepository.ts
CustomerCard.tsx
```

Clases:

```
CustomerService
WorkflowEngine
PluginManager
```

Funciones:

```
createCustomer()
executeWorkflow()
loadPlugin()
```

## 147. Folder Naming

Siempre:

```
camelCase
```

Ejemplo:

Correcto:

```
workflowEngine
pluginManager
```

Incorrecto:

```
Workflow-engine
plugin_manager
```

## 148. Git Strategy

Branches:

```
main
develop
feature/*
bugfix/*
release/*
```

## 149. Commit Convention

Usar:
feat:
fix:
docs:
refactor:
test:
chore:
Ejemplo:

feat: add workflow scheduler

## 150. CI/CD Pipeline

Todo cambio pasa por:

```
Commit
 |
Lint
 |
Tests
 |
Build
 |
Security Check
 |
Deploy
```

## 151. Build System

Debe generar:

Desktop:
```
.exe
.dmg
.AppImage
```

Mobile:
```
Android APK
iOS Build
```

Web:
```
Static Build
```

## 152. Release Channels

Versiones:
```
Nightly
Beta
Stable
```

## 153. Documentation Requirement

Toda nueva funcionalidad necesita:
```
Code
+
Tests
+
Documentation
+
Examples
```

## 154. Development Environment

Nuevo desarrollador:

Debe poder ejecutar:
```
clone repository
install dependencies
run development
```

Con:
```
one command
```

Ejemplo:
```
npm run dev
```

## 155. Technology Stack

Stack tecnológico completo del proyecto. Todo lo que se usa está aquí definido.

### Lenguaje

```
TypeScript (strict mode)
Node.js
```

### Frontend Desktop

```
Electron
React
Vite + electron-vite
```

### Frontend Web

```
React
Vite
```

### Frontend Mobile

```
React Native + Expo
```

### UI / Design System

```
shadcn/ui (librería completa de componentes)
Radix UI (primitivas headless)
Tailwind CSS (styling)
CSS Variables (temas)
Lucide React (iconos)
cmdk (command palette - futuro)
clsx / cn() (class merging)
CVA (variantes de componentes)
```

### State Management

```
Zustand (con slices pattern)
```

### Backend / Server

```
Node.js
Fastify o Hono (por definir)
WebSocket Relay
REST API
```

### Base de Datos

```
PostgreSQL (cloud)
SQLite (local)
Drizzle ORM
```

### Build / Monorepo

```
pnpm (package manager)
Turborepo (monorepo)
Vite (build web)
electron-vite (build desktop)
electron-builder (empaquetado)
```

### Testing

```
Vitest (unit tests)
Playwright (e2e tests)
```

### Code Quality

```
TypeScript strict mode
OxLint (con custom plugins)
oxfmt (formateo de código)
Husky (git hooks)
```

### Comunicación

```
Event Bus
WebSocket Relay
IPC tipado (contextBridge)
```

### Distribución / Monitoreo

```
electron-updater (actualizaciones)
PostHog (telemetry)
```

### Regla principal

shadcn/ui es la librería completa. No crear componentes nuevos. Si shadcn tiene un componente, usarlo.

## 156. Repository Structure Final

```
orca-blitz/
├── apps/
│   ├── desktop/
│   ├── web/
│   └── mobile/
├── packages/
│   ├── shared/
│   ├── core/
│   ├── infrastructure/
│   ├── ui/
│   ├── features/
│   ├── ai/
│   ├── plugins/
│   └── sdk/
├── server/
├── relay/
├── plugins/
├── config/
├── docs/
├── tests/
└── scripts/
```

## 157. Development Roadmap

La construcción debe seguir etapas.

No intentar crear todo al mismo tiempo.
```
Phase 0
Foundation
```

Objetivo:

- Crear la base.
- Construir:
- Monorepo.
- TypeScript.
- React.
- Electron.
- Shared packages.
- Design System inicial.

Resultado:

Aplicación vacía funcionando en Desktop y Web.
```
Phase 1
Core Platform
```

Construir:

- Usuarios.
- Organizaciones.
- Login.
- Permisos.
- Base de datos.
- API.

Resultado:

Plataforma base funcional.
```
Phase 2
Universal UI
```

Construir:

- Sistema visual completo.
- Dashboard.
- Navegación.
- Temas.
- Componentes.

Resultado:

Todas las plataformas tienen la misma interfaz.
```
Phase 3
Automation Engine
```

Construir:

- Workflows.
- Triggers.
- Actions.
- Execution Engine.
- Logs.

Resultado:

Primera automatización funcionando.
```
Phase 4
Integrations
```

Agregar:

- WhatsApp.
- Email.
- Redes sociales.
- APIs externas.

Resultado:

Sistema conectado al mundo real.
```
Phase 5
AI Layer
```

Agregar:

- AI Providers.
- Memory.
- Analysis.
- Recommendations.

Resultado:

Asistente empresarial inteligente.

```
Phase 6
Plugin Marketplace
```

Construir:

- SDK.
- Registry.
- Installation.
- Permissions.

Resultado:

Comunidad creando extensiones.

```
Phase 7
Enterprise Features
```

Agregar:

- SSO.
- Audit.
- Advanced permissions.
- Scaling.
- High availability.

## 158. MVP Definition

El MVP NO debe intentar competir con todo.

Debe demostrar el concepto.

MVP:

```
Desktop Application
+
Web Application
+
User System
+
CRM Básico
+
Automation Engine
+
AI Assistant
+
Plugin Example
```

## 159. First Plugin Example

El primer plugin debe ser:

```
Messaging Plugin
```

Debe demostrar:

- Integración externa.
- Eventos.
- Automatización.
- UI.
- Permisos.

## 160. First Automation Example

Caso:

Nuevo cliente.

Flujo:

```
Customer Created
        |
AI Analysis
        |
Create Welcome Message
        |
Send Message
        |
Create Follow Up Task
```

## 161. Final Architecture Vision

La plataforma completa:

```
                         Users
                           |
              Desktop / Web / Mobile
                           |
                     Universal UI
                           |
                    Application Layer
                           |
                        Core
                           |
        ----------------------------------
        |                |               |
   Automation            AI           Integrations
        |                |               |
        ----------------------------------
                           |
                    Infrastructure
                           |
               Database / External APIs
```

## 162. Final Principles

#### Principle 1
- Construir una plataforma, no una colección de funciones.
#### Principle 2
- Una sola base de código.
#### Principle 3
- TypeScript como lenguaje principal.
#### Principle 4
- La UI es un sistema compartido.
#### Principle 5
- La lógica empresarial nunca pertenece al cliente.
#### Principle 6
- Todo debe ser modular.
#### Principle 7
- Todo debe poder extenderse.
#### Principle 8
- El usuario controla sus datos.
#### Principle 9
- La IA es una herramienta empresarial, no solamente un chatbot.
#### Principle 10
- La arquitectura debe permitir crecer durante años.

---

## 163. Conversational Sales Engine

La plataforma no vende. La plataforma **crea las condiciones para que la IA venda**.

### Qué construye la plataforma

- **Motor de conversación** — Maneja el flujo de mensajes entre cliente y negocio.
- **Detector de intención** — Clasifica cada mensaje del cliente (quiere comprar, curiosea, tiene duda, objeción).
- **Gestor de contexto** — Mantiene el historial completo de cada conversación.
- **Plantillas de conversación** — Define las etapas: Descubrimiento, Interés, Decisión, Cierre.
- **Captura de datos** — Registra qué funcionó y qué no en cada interacción.

### Qué hace la IA (conectada a través de la plataforma)

- Interpreta el mensaje del cliente.
- Decide qué tipo de respuesta dar.
- Genera la respuesta.
- La plataforma la entrega al canal correcto (WhatsApp, Email, etc.).

### La plataforma NO asume qué IA usar

El usuario puede conectar:
- OpenAI
- Anthropic
- Modelo local
- Cualquier proveedor a través del SDK

La plataforma solo define **el contrato**: *"El cliente dijo X, responde en el contexto Y"*.

---

## 164. Self-Learning System

La plataforma no aprende sola. La plataforma **crea el mecanismo para que los datos mejoren las respuestas de la IA**.

### Qué construye la plataforma

- **Repositorio de interacciones** — Cada conversación se guarda con resultado (conversión o no).
- **Sistema de feedback** — Etiqueta cada interacción como éxito o fracaso.
- **Análisis de patrones** — Detecta qué horarios, qué tipo de mensajes, qué clientes convierten.
- **Contexto para la IA** — Cuando la IA va a responder, la plataforma le entrega: *"Los clientes como este suelen comprar cuando la respuesta incluye [X]"*.

### Qué hace la IA

- Recibe el contexto enriquecido.
- Genera una respuesta más informada.

### La plataforma no cambia el modelo de IA

La plataforma **alimenta** al modelo con datos. El modelo decide cómo usarlos. Si mañana el usuario cambia de OpenAI a Anthropic, el sistema de aprendizaje sigue funcionando igual.

---

## 165. Proactive Business Advisor

La plataforma no sugiere campañas. La plataforma **monitorea el calendario y los datos, y genera contexto para que la IA sugiera**.

### Qué construye la plataforma

- **Monitor de calendario** — Revisa fechas futuras y detecta eventos relevantes (Navidad, Halloween, etc.).
- **Análisis de tendencias** — Compara datos de ventas periodo a periodo.
- **Detección de clientes inactivos** — Identifica clientes que no compran en X días.
- **Sistema de notificaciones** — Cuando hay algo que sugerir, la plataforma emite un evento.

### Qué hace la IA

- Recibe el evento: *"Halloween en 2 semanas, este negocio vende [X]"*.
- Genera la sugerencia concreta.
- La plataforma la entrega al usuario.

### Ejemplo de flujo

```
Plataforma detecta: Halloween en 15 días
    ↓
Plataforma emite evento: calendar.event_upcoming
    ↓
IA recibe contexto + datos del negocio
    ↓
IA genera sugerencia: "Crear promoción de disfrazes"
    ↓
Plataforma entrega al usuario
```

La plataforma **no sabe qué sugerir**. Solo sabe que hay un evento y tiene datos. La IA decide la sugerencia.

---

## 166. Reporting System

La plataforma no genera reportes. La plataforma **recopila los datos y expone los formatos para que la IA o el usuario los generen**.

### Qué construye la plataforma

- **Data Warehouse ligero** — Almacena ventas, mensajes, conversiones, productos.
- **Exportadores de formato** — Excel, PDF, CSV.
- **Programación de reportes** — El usuario puede pedir: "envíame un reporte cada lunes".
- **Métricas calculadas** — Tasa de conversión, ventas por periodo, tendencias.

### Qué hace la IA (opcionalmente)

- Puede narrar los datos: *"Las ventas subieron 15% porque..."*
- Puede sugerir acciones basadas en los números.

### El usuario también puede

- Generar reportes sin IA.
- Exportar datos crudos.
- Importar en herramientas externas.

### La plataforma no asume qué formato

El usuario elige: Excel, PDF, CSV. La plataforma provee los exportadores. Si mañana se necesita un formato nuevo, se agrega un exportador sin tocar el resto.

---

## 167. Free & Open Source

La plataforma es **100% gratis**. No es una estrategia de marketing, es el modelo.

### Qué significa

- Sin versiones de pago.
- Sin funciones premium.
- Sin límites de usuarios, contactos o automatizaciones.
- Self-hosted sin costo.
- Cloud Managed sin costo adicional.

### Open Source

- Código abierto y auditable.
- Licencia que garantice que siempre será gratis.
- Comunidad puede contribuir.
- El usuario es dueño de su instalación y sus datos.

### Sostenibilidad

El modelo no depende de cobrar por funcionalidades. La sostenibilidad puede venir de:
- Servicios de soporte.
- Hosting administrado opcional.
- Marketplace de plugins (comunidad crea, plataforma distribuye).

---

## 168. Architecture Reference: Orca ADE Patterns

La arquitectura de esta plataforma se inspira en patrones probados de Orca ADE (stablyai/orca), una aplicación Electron de 40k+ stars que nunca se cae, es escalable, y no rompe la UI.

### Patrones adoptados

- **Tres procesos estrictos** (Main, Preload, Renderer) con aislamiento total.
- **Preload como Application API** tipada con namespaces.
- **Zustand slices + cross-slice cascades** para state management.
- **Persistencia atómica** con write-then-rename y schema versionado.
- **Session hydration** al iniciar la aplicación.
- **Mobile como workspace separado** con dependencias propias.
- **Plugins en proceso separado** con sandbox.
- **Relay WebSocket** para multi-cliente (desktop ↔ mobile ↔ CLI).
- **Quality gates** con max-lines ratchet y reliability budgets.
- **Shared types como source of truth** entre todos los procesos.

---

## 169. Corrected Folder Structure

```
orca-blitz/
│
├── apps/
│   ├── desktop/                         ← Electron (Windows, Linux, macOS)
│   │   ├── src/
│   │   │   ├── main/                    ← Proceso con permisos del SO
│   │   │   │   ├── index.ts
│   │   │   │   ├── ipc/
│   │   │   │   │   ├── register-core-handlers.ts
│   │   │   │   │   ├── customers.ts
│   │   │   │   │   ├── workflows.ts
│   │   │   │   │   ├── integrations.ts
│   │   │   │   │   └── reports.ts
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── store.ts
│   │   │   │   │   ├── schema.ts
│   │   │   │   │   └── migrations/
│   │   │   │   ├── runtime/
│   │   │   │   │   ├── orca-runtime.ts
│   │   │   │   │   └── rpc/
│   │   │   │   ├── window/
│   │   │   │   ├── browser/
│   │   │   │   ├── plugins/
│   │   │   │   │   ├── plugin-host-entry.ts
│   │   │   │   │   ├── plugin-host-process.ts
│   │   │   │   │   ├── plugin-event-bus.ts
│   │   │   │   │   ├── plugin-content-safety.ts
│   │   │   │   │   └── plugin-registry.ts
│   │   │   │   ├── notifications/
│   │   │   │   ├── updater/
│   │   │   │   └── daemon/
│   │   │   │
│   │   │   ├── preload/
│   │   │   │   ├── index.ts
│   │   │   │   └── api-types.ts
│   │   │   │
│   │   │   ├── renderer/
│   │   │   │   ├── App.tsx
│   │   │   │   ├── main.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ui/
│   │   │   │   │   ├── layout/
│   │   │   │   │   ├── crm/
│   │   │   │   │   ├── automation/
│   │   │   │   │   └── chat/
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useIpcEvents.ts
│   │   │   │   ├── store/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   ├── selectors.ts
│   │   │   │   │   └── slices/
│   │   │   │   │       ├── ui.ts
│   │   │   │   │       ├── customers.ts
│   │   │   │   │       ├── workflows.ts
│   │   │   │   │       ├── conversations.ts
│   │   │   │   │       ├── integrations.ts
│   │   │   │   │       └── settings.ts
│   │   │   │   ├── assets/
│   │   │   │   │   └── main.css
│   │   │   │   └── web/
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── types.ts
│   │   │       ├── constants.ts
│   │   │       └── events.ts
│   │   │
│   │   ├── electron.vite.config.ts
│   │   └── electron-builder.config.ts
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── web-preload-api.ts
│   │   │   └── ...
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── mobile/                          ← PROYECTO SEPARADO
│       ├── pnpm-workspace.yaml
│       ├── pnpm-lock.yaml
│       ├── package.json
│       ├── app.json
│       ├── app/
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   └── settings.tsx
│       ├── src/
│       │   ├── components/
│       │   ├── transport/
│       │   │   ├── client-context.tsx
│       │   │   ├── host-store.ts
│       │   │   └── types.ts
│       │   ├── storage/
│       │   └── hooks/
│       └── packages/
│
├── packages/
│   ├── shared/
│   │   ├── types/
│   │   ├── events/
│   │   ├── constants/
│   │   └── utils/
│   │
│   ├── core/
│   │   ├── entities/
│   │   ├── use-cases/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── events/
│   │   └── errors/
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── adapters/
│   │   │   └── migrations/
│   │   ├── external/
│   │   │   ├── ai-providers/
│   │   │   ├── messaging/
│   │   │   └── payments/
│   │   └── storage/
│   │
│   ├── ui/
│   │   ├── theme/
│   │   ├── icons/
│   │   ├── primitives/
│   │   ├── layout/
│   │   ├── business/
│   │   └── charts/
│   │
│   ├── features/
│   │   ├── index.ts
│   │   ├── crm/
│   │   ├── automation/
│   │   ├── sales-engine/
│   │   ├── self-learning/
│   │   ├── advisor/
│   │   ├── reporting/
│   │   ├── marketing/
│   │   └── analytics/
│   │
│   ├── ai/
│   │   ├── contracts/
│   │   ├── memory/
│   │   └── prompts/
│   │
│   ├── plugins/
│   │   ├── plugin-manager/
│   │   ├── plugin-loader/
│   │   ├── plugin-sandbox/
│   │   └── plugin-api/
│   │
│   └── sdk/
│       ├── create-plugin/
│       ├── api/
│       └── types/
│
├── server/
│   ├── src/
│   │   ├── app.ts
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   └── websocket/
│   │       ├── dispatcher.ts
│   │       ├── agent-hook-server.ts
│   │       └── fs-handler.ts
│   └── drizzle.config.ts
│
├── relay/
│   ├── src/
│   │   ├── dispatcher.ts
│   │   ├── auth.ts
│   │   └── handlers/
│   └── package.json
│
├── plugins/
│   ├── whatsapp/
│   ├── instagram/
│   ├── email/
│   └── payments/
│
├── config/
│   ├── max-lines-baseline.txt
│   ├── reliability-gates.jsonc
│   ├── vitest.config.ts
│   ├── tsconfig.node.json
│   ├── tsconfig.web.json
│   └── tsconfig.cli.json
│
├── docs/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

---

## 170. Preload as Application API

El preload es la capa de seguridad entre UI y sistema. Expone `window.api` con namespaces tipados.

### Namespaces

```
window.api.customers.create(data)
window.api.customers.list()
window.api.customers.onChanged(cb)

window.api.workflows.create(data)
window.api.workflows.execute(id)
window.api.workflows.onChanged(cb)

window.api.integrations.sendMessage(channel, data)
window.api.integrations.onMessage(cb)

window.api.reports.generate(config)
window.api.reports.export(format)

window.api.settings.get()
window.api.settings.update(prefs)

window.api.plugins.install(manifest)
window.api.plugins.enable(id)
```

### Flujo

```
Renderer
    ↓ window.api.customers.create(data)
Preload (contextBridge)
    ↓ ipcRenderer.invoke('customers:create', data)
Main Process
    ↓ CustomerService.create(data)
Core
    ↓ CustomerRepository.save()
Infrastructure
    ↓ PostgreSQL / SQLite
```

### Regla

El renderer NUNCA accede a Node.js, filesystem, o procesos. Todo pasa por `window.api`.

---

## 171. Zustand Store Architecture

El store se compone de slices especializados. Cada feature tiene su propio slice.

### Slices

| Slice | Responsabilidad |
|---|---|
| ui | Sidebar, modales, filtros, sorting |
| customers | Clientes, leads, deals |
| workflows | Automatizaciones, ejecuciones |
| conversations | Chat con clientes, historial |
| integrations | Estado de integraciones externas |
| settings | Preferencias del usuario |

### Cross-Slice Cascades

Cuando se elimina una entidad, se limpia todo el estado relacionado:

```
Eliminar customer
    ↓
Conversations del customer → eliminadas
Workflows que usan el customer → actualizados
Tags del customer → eliminados
Reports que mencionan al customer → invalidated
```

### Selectores

```
src/renderer/src/store/selectors.ts
```

Contiene selectores memoizados que derivan estado complejo sin re-renders innecesarios.

### Session Hydration

Al iniciar la app:

```
App Start
    ↓
Load persisted state (orca-data.json)
    ↓
Merge with defaults (deep merge)
    ↓
Validate schema
    ↓
Clean orphaned state
    ↓
Hydrate Zustand store
    ↓
Renderer ready
```

---

## 172. Persistence Layer

La persistencia usa un JSON atomic con write-then-rename.

### Estrategia

```
1. Write to temp file (orca-data.json.[uuid].tmp)
2. Check write generation (no sobreescribir cambios recientes)
3. Rename to orca-data.json (atómico en la mayoría de filesystems)
4. On shutdown: synchronous flush
```

### Schema Versioning

```
SCHEMA_VERSION = 1
```

Al cargar, se hace deep merge con defaults para manejar versiones anteriores.

### Entidades persistidas

- Projects (organizaciones)
- Workflows (automatizaciones)
- Customers (clientes)
- Conversations (historial de chat)
- Settings (preferencias)
- Plugin states (estado de plugins)
- Session state (tabs abiertos, layout)

### Seguridad

- Datos sensibles encriptados con Electron safeStorage
- API keys nunca en texto plano
- SSH passphrases encriptadas

---

## 173. Relay WebSocket Architecture

El relay conecta desktop ↔ mobile ↔ CLI ↔ SSH.

### Conexiones

```
Desktop (Electron)
    ↕ WebSocket
Mobile (React Native)
    ↕ WebSocket
CLI (Node.js)
    ↕ WebSocket
SSH Remote
```

### Funciones del relay

- Autenticación de clientes
- Enrutamiento de mensajes
- Streaming de terminal output
- Operaciones de archivos
- Git operations
- Port forwarding

### Seguridad

- Cada conexión autenticada
- Permisos por cliente
- Auditoría de operaciones

---

## 174. Plugin Process Isolation

Los plugins corren en su propio proceso Electron.

### Flujo

```
Plugin Manager
    ↓
plugin-host-entry.ts (proceso separado)
    ↓
Plugin Code (aislado)
    ↓
plugin-event-bus.ts (comunicación)
    ↓
Core (solo APIs permitidas)
```

### Seguridad del plugin

- **Sandbox**: Permisos limitados declarados en manifest
- **Content Safety**: Validación de código antes de ejecutar
- **Content Integrity**: Hash de integridad
- **Audit Log**: Registro de todas las operaciones
- **Kill List**: Revocación de plugins maliciosos

### Si un plugin falla

- El proceso plugin crashea
- La app principal NO se ve afectada
- El plugin se desactiva automáticamente
- Se registra el error

---

## 175. Quality Gates

### Max-Lines Ratchet

Cada archivo tiene un límite de líneas en `config/max-lines-baseline.txt`. El límite solo puede BAJAR, nunca subir. Esto fuerza la modularidad.

```
src/main/customers.ts: 500
src/renderer/src/App.tsx: 2000
packages/core/services/CustomerService.ts: 300
```

Si un archivo crece más allá de su límite, CI falla.

### Reliability Gates

`config/reliability-gates.jsonc` contiene presupuestos de confiabilidad para cada subsistema. Ejemplo:

```jsonc
{
  "customers": {
    "maxResponseTime": "200ms",
    "maxMemoryUsage": "50MB",
    "testCoverage": "90%"
  },
  "workflows": {
    "maxExecutionTime": "30s",
    "maxConcurrent": 10
  }
}
```

### TypeScript Targets Separados

```
tsconfig.node.json    ← Main process + Server
tsconfig.web.json     ← Renderer + Web
tsconfig.cli.json     ← CLI + Tools
```

Cada target tiene reglas de strictness diferentes. El renderer es el más estricto.

---

## 176. Feature Contract

Cada feature es una carpeta que entrega un contrato al sistema. El sistema sabe qué consume de ella.

### Qué puede contener una feature

```
CRM:
    Ajustes     → Configuración del módulo
    Rutas       → Páginas que ofrece
    Eventos     → Qué eventos maneja
    Store       → Estado que necesita
    UI          → Componentes visuales

Inventario:
    Ajustes     → Alertas de stock, umbrales
    Rutas       → Página de productos
    Eventos     → stock.low, product.created
    Store       → Lista de productos
    UI          → Tabla de productos
```

### Regla

Si una feature no entrega algo, no lo tiene. Si CRM no entrega `Ajustes`, no tiene pantalla de configuración. Si Inventario no entrega `Rutas`, no tiene página propia. Simple.

---

## 177. Feature Registry

El registry es un archivo central que lista todas las features. Es explícito. Igual que Orca.

### Cómo funciona

```
packages/features/index.ts

    ← Importa cada feature
    ← Lista las que están activas
    ← Expone: "estas son todas las features del sistema"
```

### Qué consume el sistema del registry

```
Settings Page
    → Lee el registry
    → Renderiza los ajustes de cada feature

Router
    → Lee el registry
    → Registra las rutas de cada feature

Store
    → Lee el registry
    → Inicializa el estado de cada feature

Event Bus
    → Lee el registry
    → Conecta los eventos de cada feature
```

### Regla

Si una feature no está en el registry, no existe para el sistema. No se renderiza, no se registra, no se escucha.

---

## 178. Registration Flow

Paso a paso para agregar una feature nueva.

### Flujo

```
1. Crear la carpeta de la feature
   → Crear domain, application, infrastructure, ui
   → Crear settings, routes, events, store

2. Registrar en el registry
   → 1 línea de importación
   → 1 línea en el array de features

3. Listo.
   → Los ajustes se renderizan solos
   → Las rutas se registran solas
   → Los eventos se conectan solos
   → El store se inicializa solo
```

### Qué NO tocas

```
No tocas:
    La pantalla de ajustes
    El router principal
    El store central
    El preload
    El main process
    Ningún archivo existente
```

### Archivos a tocar: 2

```
1. Tu feature (obligatorio)
2. El registry (1 línea)
```

---

## 179. shadcn/ui Component Library

La interfaz se construye sobre shadcn/ui.

### Qué es

shadcn/ui es una librería de componentes React construida sobre Radix UI y Tailwind CSS. No es un paquete npm, es código que copias a tu proyecto y controlas completamente.

### Por qué shadcn/ui

- Los componentes son tuyos, no de un paquete externo
- Puedes modificarlos sin esperar actualizaciones
- Funciona con CSS variables (temas)
- Orca ADE lo usa como base
- Simple, elegante, monocromático
- 60+ componentes listos

### Componentes principales que usaremos

```
Botones:        Button, Button Group, Toggle, Toggle Group
Formularios:    Input, Textarea, Select, Checkbox, Switch, Radio Group
Navegación:     Sidebar, Tabs, Breadcrumb, Navigation Menu, Pagination
Datos:          Table, Data Table, Card, Badge
Feedback:       Alert, Toast, Dialog, Sheet, Drawer
Gráficas:       Chart
Otros:          Avatar, Calendar, Command, Popover, Tooltip, Separator
```

### Regla

Nunca crear un componente visual que ya exista en shadcn/ui. Si shadcn tiene un Button, no crees otro Button.

---

## 180. Theme Palette

El usuario puede cambiar la paleta de colores de toda la app.

### Paletas predefinidas

```
Neutro (default)
    → Grises, minimalista, profesional

Azul Profesional
    → Tonos azules, corporativo

Verde Naturaleza
    → Tonos verdes, fresco

Púrpura Creativo
    → Tonos púrpuras, moderno

Rojo Energía
    → Tonos rojos, dinámico

Océano
    → Tonos azul-verde, calmado

Atardecer
    → Tonos naranja-rosa, cálido
```

### Cada paleta define

```
Los tokens principales de la app:
    Fondo, texto, botones, bordes, sidebar, gráficas

Cada paleta tiene variante clara y oscura
```

### Cómo se aplica

```
Usuario elige paleta en Ajustes → Temas
    ↓
Se cambian las CSS variables
    ↓
Toda la app cambia inmediatamente
```

### Persistencia

La paleta elegida se guarda en las preferencias del usuario. Al reiniciar, se restaura automáticamente.

---

## 181. Community Themes

La app permite importar temas de la comunidad.

### Fuente

tweakcn.com/community tiene paletas creadas por la comunidad.

### Cómo funciona

```
1. Usuario va a Ajustes → Temas → Comunidad
2. Ve paletas disponibles con preview
3. Selecciona una
4. Se importa y aplica automáticamente
5. Queda guardada en sus preferencias
```

### El usuario también puede

- Exportar su propia paleta
- Compartirla con la comunidad
- Guardar favoritos

---

## 182. Theme Awareness

Toda la app debe ser consciente del tema activo.

### Reglas

```
1. Nunca colores hardcoded dentro de componentes
2. Siempre usar tokens semánticos (bg-primary, text-foreground)
3. Si shadcn tiene un componente, usarlo en vez de crear uno nuevo
4. Si un componente necesita un color especial, agregarlo como token nuevo en el CSS
5. Nunca asumir que el fondo es blanco o negro
```

### Ejemplo correcto

```
<Button>Acción</Button>
```

### Ejemplo incorrecto

```
<Button style={{background:"#2563EB", color:"white"}}>Acción</Button>
```

### Flujo para agregar un color nuevo

```
1. Definir el token en globals.css (tanto :root como .dark)
2. Exponerlo en @theme inline
3. Usarlo en componentes con su nombre semántico
```

---

## 183. UI Toolkit: shadcn/ui

La interfaz se construye sobre la librería completa de shadcn/ui.

### Qué es

shadcn/ui es una librería de componentes React construida sobre Radix UI y Tailwind CSS. No es un paquete npm, es código que copias a tu proyecto y controlas completamente.

### Por qué shadcn/ui

- Los componentes son tuyos, no de un paquete externo
- Puedes modificarlos sin esperar actualizaciones
- Funciona con CSS variables (temas)
- Orca ADE lo usa como base
- Simple, elegante, monocromático
- 60+ componentes listos

### Regla principal

Se instala la librería COMPLETA. No se crean componentes nuevos. Si shadcn tiene un componente, se usa ese componente.

### Componentes disponibles

```
Accordion, Alert, Alert Dialog, Aspect Ratio, Attachment
Avatar, Badge, Breadcrumb, Bubble
Button, Button Group
Calendar, Card, Carousel, Chart, Checkbox, Collapsible
Combobox, Command, Context Menu
Data Table, Date Picker, Dialog, Direction, Drawer
Dropdown Menu
Empty
Field
Hover Card
Input, Input Group, Input OTP, Item
Kbd
Label
Marker, Menubar, Message, Message Scroller
Native Select, Navigation Menu
Pagination, Popover, Progress
Questionnaire
Radio Group
Resizable
Scroll Area, Select, Separator, Sheet, Sidebar
Skeleton, Slider, Spinner, Switch
Table, Tabs, Textarea, Toast, Toggle, Toggle Group
Tooltip, Typography
```

### Iconos

Todos los iconos vienen de Lucide React. No se usa otra librería de iconos.

### Command Palette

cmdk se instala para uso futuro. Estará disponible en el stack cuando se necesite.

---

## 184. Build & Distribution

### Desktop

```
electron-builder (empaquetado para Windows, Linux, macOS)
electron-updater (actualizaciones automáticas sin romper el sistema)
```

### Mobile

```
Fastlane (deploy a App Store y Google Play)
```

### Web

```
Vite build (archivos estáticos)
```

---

## 185. Code Quality

### Linting

```
OxLint (con custom plugins de Orca)
    renderer-scrollbar-style
    app-store-performance
    quadratic-buffer-concat
    mobile-pairing
```

### Formateo

```
oxfmt (más rápido que Prettier)
```

### Git Hooks

```
Husky (pre-commit hooks)
lint-staged (ejecutar lint solo en archivos modificados)
```

### TypeScript

```
Strict mode activado
Tres targets separados: Node, Web, CLI
```

---

## 186. Monitoring & Analytics

### Telemetry

```
PostHog (tracking de uso anónimo)
```

### Qué se trackea

```
- Funciones más usadas
- Errores en producción
- Rendimiento
- Uso de plugins
```

### Qué NO se trackea

```
- Datos de clientes del usuario
- Contenido de mensajes
- API keys
- Información sensible
```

### Privacidad

```
El usuario puede desactivar el telemetry
Los datos se anonimizan
Se cumple GDPR
```

---

END OF PROJECT ARCHITECTURE DOCUMENT

Version 1.5

---
