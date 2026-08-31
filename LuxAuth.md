# Blitz

## AI Coding Agent Platform — Technical Architecture & Development Blueprint

Version: 3.0

Status: Active Development

Language: TypeScript + Rust (OMP Core)

---

## 1. Project Vision

### Mission

Blitz es una plataforma que envuelve OMP (Oh My Pi) para ofrecer una experiencia de coding agent completa. La arquitectura tiene tres capas:

```
┌─────────────────────────────────────────────────────────────────┐
│                         BLITZ                                   │
│                    (Plataforma Principal)                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Blitz UI App (apps/desktop)                 │   │
│  │         Nuestra UI Graphical - Electron + React          │   │
│  │    Terminal embebida, Editor, Chat, File Explorer         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              OMP TUI (packages/coding-agent)             │   │
│  │         Terminal UI created by OMP                       │   │
│  │    Session management, Tool execution, Agent runtime     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              OMP Core (blitz_tui_infraestructura)        │   │
│  │         Foundation - 80k+ lines Rust core                │   │
│  │    LLM providers, Wire protocol, Native operations       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### ¿Qué es Blitz?

Blitz es la **envoltura completa** que toma OMP (un coding agent TUI) y lo convierte en una aplicación de escritorio moderna.

- **OMP Core** → La base: provedores LLM, operaciones nativas, protocolo wire
- **OMP TUI** → La interfaz de terminal: sesiones, ejecución de herramientas, runtime del agente
- **Blitz UI App** → Nuestra interfaz gráfica: todo lo que tiene la TUI pero en una app visual

### Objetivo

Crear una aplicación de escritorio donde un desarrollador pueda:

- Ver y interactuar con sesiones de chat con IA
- Ejecutar comandos en terminal integrado
- Navegar y editar archivos del proyecto
- Usar herramientas de desarrollo (git, grep, LSP, DAP)
- Conectar con cualquier provider LLM (60+ providers soportados)
- Toda la funcionalidad de OMP TUI pero en una UI gráfica

---

## 2. Core Philosophy

### Principle: Wrapper First

Blitz es un wrapper de OMP. No reinventa la rueda — toma el poder de OMP TUI y lo entrega en una UI gráfica.

Incorrecto:

```
Crear un coding agent desde cero
Ignorar OMP TUI
Reescribir funcionalidad existente
```

Correcto:

```
Envolver OMP TUI
Reutilizar OMP Core
Crear UI gráfica sobre la base existente
```

La tecnología de OMP debe ser accesible.

El desarrollador obtiene:

- Toda la potencia de OMP (60+ providers, 31 tools, Rust core)
- En una interfaz visual moderna y amigable
- Sin perder funcionalidad de la TUI

Blitz es OMP, pero más accesible.

---

## 3. Main Goals

### Wrapper Architecture

Blitz tiene un objetivo claro: ser la envoltura gráfica de OMP.

```
OMP Core (Base)
    ↓
OMP TUI (Terminal Interface)
    ↓
Blitz UI App (Graphical Interface)
```

### Plataformas

La aplicación debe funcionar en:

- Windows
- Linux
- macOS
- Web (futuro)

### Core Integration

Blitz se comunica con OMP a través de:

- **@oh-my-pi/pi-wire** — Wire protocol para comunicación
- **IPC** — Electron IPC para UI ↔ Main process
- **OMP Process** — Proceso OMP corriendo en background

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

Blitz es un wrapper de OMP. La arquitectura refleja esto:

```
┌─────────────────────────────────────────────────────────────────┐
│                         BLITZ                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Blitz UI App                          │   │
│  │              (apps/desktop - Electron)                   │   │
│  │                                                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │  Sessions   │ │  Terminal   │ │   Editor    │      │   │
│  │  │    Panel    │ │   Emulator  │ │   Panel     │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │  Chat with  │ │    File     │ │    Tool     │      │   │
│  │  │     AI      │ │  Explorer   │ │   Results   │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ↓ IPC / Wire Protocol              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    OMP TUI                               │   │
│  │              (packages/coding-agent)                     │   │
│  │                                                         │   │
│  │  - Session management                                   │   │
│  │  - Tool execution engine                                │   │
│  │  - Agent runtime                                        │   │
│  │  - Event bus                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    OMP Core                              │   │
│  │              (blitz_tui_infraestructura)                 │   │
│  │                                                         │   │
│  │  - @oh-my-pi/pi-ai (60+ LLM providers)                 │   │
│  │  - @oh-my-pi/pi-wire (wire protocol)                    │   │
│  │  - @oh-my-pi/pi-natives (Rust operations)               │   │
│  │  - crates/pi-natives (performance critical)             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Capas de Blitz

| Capa         | Descripción                       | Ubicación                                          |
| ------------ | --------------------------------- | -------------------------------------------------- |
| **Blitz UI** | Interfaz gráfica Electron + React | `apps/desktop/`                                    |
| **OMP TUI**  | Terminal UI runtime               | `blitz_tui_infraestructura/packages/coding-agent/` |
| **OMP Core** | Base Rust + TypeScript            | `blitz_tui_infraestructura/`                       |

### Comunicación

```
Blitz UI App
    ↓ window.api.sessions.* (IPC)
Electron Main Process
    ↓ OMP Process spawn
OMP TUI
    ↓ @oh-my-pi/pi-wire
OMP Core
```

---

## 6. Monorepo Architecture

Blitz es un wrapper de OMP. El repositorio contiene:

```
orca-blitz/
├── blitz_tui_infraestructura/    ← OMP Core (submodule/fork)
│   ├── packages/
│   │   ├── coding-agent/         ← OMP TUI
│   │   ├── ai/                   ← LLM providers
│   │   ├── wire/                 ← Wire protocol
│   │   ├── natives/              ← Rust bindings
│   │   └── ...
│   └── crates/
│       └── pi-natives/           ← Rust core
│
├── apps/
│   └── desktop/                  ← Blitz UI App (Electron)
│       ├── src/
│       │   ├── main/             ← Main process (spawns OMP)
│       │   ├── preload/          ← IPC bridge
│       │   └── renderer/         ← React UI
│       └── package.json
│
├── packages/
│   ├── shared/                   ← Shared types
│   ├── ui/                       ← Design system
│   └── ...
│
└── LuxAuth.md                    ← Este documento
```

### Relación con OMP

OMP vive en `blitz_tui_infraestructura/` como un fork o submodule.

Blitz toma:

- **OMP Core** — La base Rust
- **OMP TUI** — El runtime de terminal
- **Wire protocol** — La comunicación

Blitz agrega:

- **UI gráfica** — La experiencia visual
- **Electron** — La plataforma desktop
- **Integración** — El glue entre OMP y la UI

---

## 7. Applications

### Blitz UI App (Desktop)

La aplicación principal de Blitz — una UI gráfica que envuelve OMP.

Tecnología:

```
Electron + React + TypeScript
```

Responsabilidades:

- **Spawn OMP process** — Iniciar y controlar OMP TUI
- **UI Rendering** — Mostrar sesiones, chat, terminal, archivos
- **IPC Communication** — Comunicarse con OMP via wire protocol
- **File System** — Acceso a archivos del proyecto
- **Window Management** — Crear y gestionar ventanas

Arquitectura:

```
┌─────────────────────────────────────────┐
│            Electron Main                │
│                                         │
│  ┌─────────────┐   ┌─────────────────┐ │
│  │ OMP Process │   │ Window Manager  │ │
│  │  (spawned)  │   │                 │ │
│  └─────────────┘   └─────────────────┘ │
│           │                             │
│     Wire Protocol                       │
│           │                             │
│  ┌─────────────────────────────────┐   │
│  │        Preload (IPC)            │   │
│  └─────────────────────────────────┘   │
│           │                             │
│  ┌─────────────────────────────────┐   │
│  │      React Renderer (UI)        │   │
│  │  ┌─────┐ ┌─────┐ ┌─────────┐  │   │
│  │  │Chat │ │Term │ │  Files  │  │   │
│  │  └─────┘ └─────┘ └─────────┘  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### OMP TUI (Terminal)

La interfaz de terminal que OMP provee — Blitz la envuelve gráficamente.

Tecnología:

```
TypeScript + Bun
```

Responsabilidades:

- **Session Management** — Crear, cargar, guardar sesiones
- **Tool Execution** — Ejecutar herramientas (shell, files, git, LSP)
- **Agent Runtime** — Comunicarse con providers LLM
- **Event Bus** — Emitir y escuchar eventos
- **Wire Protocol** — Comunicación con clientes externos

### OMP Core (Foundation)

La base Rust que OMP provee — el corazón del sistema.

Tecnología:

```
Rust + TypeScript bindings
```

Responsabilidades:

- **LLM Providers** — 60+ providers (OpenAI, Anthropic, local)
- **Native Operations** — Text processing, grep, image handling
- **Performance Critical** — Operaciones que necesitan Rust
- **Wire Protocol** — Protocolo de comunicación

No contiene lógica de la aplicación.

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
Sessions
Terminal
Editor
Chat
```

Linux:

```
Sessions
Terminal
Editor
Chat
```

Web:

```
Sessions
Terminal
Editor
Chat
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
├── sessions/
├── terminal/
├── editor/
├── tools/
├── chat/
├── providers/
├── files/
└── git/
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

#### Ejemplo Sessions

```
sessions/
domain/
Session.ts
Message.ts
application/
CreateSession.ts
LoadSession.ts
infrastructure/
SessionRepository.ts
ui/
SessionList.tsx
SessionChat.tsx
```

---

## 11. Core Principle

Toda funcionalidad nueva debe implementarse una sola vez.

Ejemplo:

Nueva función:

```
"Agregar soporte para nuevo provider LLM"
```

Lugar correcto:

```
packages/features/providers/
```

Después automáticamente estará disponible para:

- Desktop.
- Web.

---

## 12. Communication Architecture

Los módulos no deben depender directamente unos de otros.

Utilizar:

### Event Driven Architecture

Ejemplo:

```
session.created
    |
    |
Terminal
    |
    |
Initialize Shell
```

Eventos:

```
user.created
session.created
message.received
tool.executed
agent.completed
```

---

## 13. Plugin System

La plataforma debe ser extensible.

Ejemplo:

Instalar:

Plugin:

```
LSP Support
```

La plataforma agrega:

Capability:

```
diagnostics()
completions()
hover()
```

Sin modificar el Core.

---

## 14. AI Architecture

La IA no es solamente chat.

Debe funcionar como:

### Coding Assistant

Capacidades:

- Analizar código.
- Detectar errores.
- Crear refactorizaciones.
- Generar código.
- Explicar problemas.
- Automatizar tareas.

Ejemplo:

Sistema:

- Hay un bug en el módulo de autenticación.
- Razones detectadas:
- Token no se valida correctamente.
- Falta manejo de errores.
- Timeout no configurado.

Recomendaciones:

- Corregir validación.
- Agregar try-catch.
- Configurar timeout.

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
SessionRepository
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
export interface Session {
    id: string;
    title: string;
    cwd: string;
}
```

Todas las plataformas utilizan exactamente la misma definición.

Desktop:

```
import { Session } from "@shared/types";
```

Web:

```
import { Session } from "@shared/types";
```

## 20. Core Package

El Core es el cerebro del sistema.

Ubicación:

```
packages/core/
```

Responsabilidades:

- Reglas de la aplicación.
- Entidades.
- Casos de uso.
- Eventos.
- Servicios internos.

No conoce:

- Electron.
- React.
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
Session.ts
class Session {
id:string;
title:string;
cwd:string;
}
```

Servicio:

```
SessionService
createSession()
updateSession()
deleteSession()
```

Repositorio:

```
SessionRepository
save()
find()
remove()
```

## 21. Feature Architecture

Cada módulo vive separado.

Ejemplo:

```
features/
sessions/
terminal/
editor/
tools/
chat/
providers/
files/
git/
```

Cada feature contiene:

```
feature/
domain/
application/
infrastructure/
ui/
```

#### Ejemplo Sessions

```
sessions/
domain/
Session.ts
Message.ts
application/
CreateSession.ts
LoadSession.ts
infrastructure/
SessionRepository.ts
ui/
SessionList.tsx
SessionChat.tsx
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
- Tener lógica de la aplicación.

#### Main Structure

```
main/
├── index.ts
├── ipc/
│   ├── register-core-handlers.ts
│   ├── sessions.ts
│   ├── tools.ts
│   ├── terminal.ts
│   └── providers.ts
├── persistence/
│   ├── store.ts
│   ├── schema.ts
│   └── migrations/
├── omp/
│   ├── omp-process.ts
│   └── wire-protocol.ts
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
"session:create",
createSession
)
```

Preload:

```
window.api.session.create()
```

React:

```
window.api.session.create(data)
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
api.session.create()
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
Agent Runtime
    |
    |
Browser Manager
    |
    |
Electron BrowserView
```

Ejemplo

LSP Plugin:

Solicita:

```
browser.createSession({
name:"typescript-lsp"
})
```

Browser Manager:

Crea:

Session:

```
typescript-lsp-profile
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
typescript-lsp/
rust-analyzer/
python-lsp/
```

No compartir:

- Cookies.
- Tokens.
- Sesiones.

## 30. Tool Execution Engine

El sistema de ejecución de herramientas es un motor propio.

No depende de una herramienta externa.

```
Concepto
```

Una ejecución de herramienta es:

```
Trigger
+
Conditions
+
Actions
```

Ejemplo:

```
Cuando el usuario escribe un comando
SI
el comando es válido
ENTONCES
ejecutar comando
capturar output
Tool Execution Architecture
Tool
|
Input
|
Execution
|
Output
|
Logs
```

## 31. Event Bus

Todas las partes del sistema comunican eventos.

Ejemplo:

Sesión creada:

```
event.emit(
"session.created",
session
)
```

Escuchan:

Terminal:

```
iniciar proceso
```

Editor:

```
cargar archivos
```

Chat:

```
cargar historial
Event Examples
user.created
session.created
message.received
tool.executed
agent.completed
```

## 32. Plugin Architecture

La plataforma debe permitir extensiones.

Ejemplos:

Plugins:

- LSP.
- DAP.
- Git.
- Theme.
- AI Provider.
- Terminal.

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
"name":"lsp-typescript",
"version":"1.0.0",
"permissions:[
"lsp",
"diagnostics"
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
- Extensions.
- Tools.

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

- Plugin LSP:

Permisos:

```
diagnostics
completions
hover
```

No tiene:

```
filesystem
database
system
```

## 35. Data Flow Complete Example

Caso:

Usuario ejecuta comando.

```
Terminal Input
↓
Shell Process
↓
Command Execution
↓
Event Bus
↓
Session Manager
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

La aplicación debe poder reemplazar cualquier plataforma.

Ejemplo:

Cambiar Electron:

NO debe romper:

- Core.
- Features.
- Plugins.
- UI.

Cambiar React:

- NO debe romper:
- Application Logic.
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
SessionPage.tsx
web/
SessionPage.tsx
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
sessions/
    SessionPage.tsx
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

- Lógica de la aplicación.
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

Componentes con información de la aplicación.

Ejemplo:

```
SessionCard
ToolCallCard
MessageBubble
FileTree
TerminalOutput
```

## 45. Feature UI

Cada módulo tiene sus componentes.

Ejemplo:

```
features/
sessions/
ui/
SessionList.tsx
SessionChat.tsx
SessionHistory.tsx
```

Pero utilizan:

```
packages/ui
```

## 46. Screen Architecture

Una pantalla no debe contener lógica.

Incorrecto:

```
function Sessions(){
fetchSessions()
calculateStats()
saveSession()
return <Table />
}
```

Correcto:

```
function Sessions(){
const sessions =
useSessions()
return (
<SessionTable
data={sessions}
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

- Sesiones.
- Mensajes.
- Herramientas.
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

Usuario crea sesión.

```
UI
SessionForm
```

llama:

```
useCreateSession()
Hook
createSession(data)
Application Service
SessionService.create()
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
session.created
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
"Soporte para nuevo provider LLM"
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
ProviderList
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
     Desktop     Web
        |         |
     Electron  Browser
```

## 62. Main UI Principle

La plataforma no tiene dos aplicaciones.

Tiene una aplicación ejecutándose en dos tipos de plataformas.

---

## 63. Backend Architecture

La plataforma debe separar completamente:

- Presentación.
- Lógica de la aplicación.
- Infraestructura.

Arquitectura general:

```
Client Applications
Desktop
Web
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
- Datos.
- Sesiones.
- IA.
- Plugins.
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
│   │   ├── sessions.routes.ts
│   │   ├── providers.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── tools.routes.ts
│   │   ├── files.routes.ts
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
/sessions
POST
/sessions
PUT
/sessions/:id
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

## 69. Workspace System

Dentro de un usuario pueden existir espacios.

Ejemplo:

Usuario:

```
Personal
    |
    |
Projects
    |
    |
Workspaces
    |
    |
Settings
Workspace Model
Workspace
id
name
settings
createdAt
```

## 70. Multi Tenant Architecture

La plataforma debe soportar múltiples usuarios.

Ejemplo:

```
Database
   |
   |
User A
Sessions
Projects
Settings
User B
Sessions
Projects
Settings
```

#### Tenant Isolation

Todo dato debe pertenecer a un usuario.

Ejemplo:

Incorrecto:

```
Session
id
title
```

Correcto:

```
Session
id
userId
title
```

## 71. Workspace System

Dentro de un usuario pueden existir espacios.

Ejemplo:

Usuario:

```
Frontend
Backend
DevOps
Personal
```

Cada workspace puede tener:

- Proyectos.
- Configuración.
- Settings.

## 72. Permission System

Debe existir un sistema granular.

Ejemplo:

Roles:

```
Owner
Admin
Developer
Viewer
Permissions
```

Ejemplo:

```
sessions.read
sessions.create
sessions.delete
tools.execute
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
SessionService
        |
SessionRepository
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

- Ver historial de sesiones.
- Crear notas.
- Editar archivos.
- Revisar código.

## 78. AI Architecture

La IA es un servicio interno.

No una simple ventana de chat.

#### AI Capabilities

Debe permitir:

- Chat con código.
- Análisis.
- Recomendaciones.
- Generación.
- Refactorización.
- Depuración.

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

El equipo desarrollador puede ofrecer:

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

Información del proyecto.

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

## 83. Code Intelligence Engine

La IA debe analizar código.

Ejemplo:

Evento:

```
error.detected
```

Proceso:

```
Event
 |
Code Analysis Engine
 |
AI Analysis
 |
Recommendation
```

Resultado:

Hay errores en el módulo de autenticación.

Motivos:

- Token no se valida correctamente.
- Falta manejo de errores.

Acciones sugeridas:

- Corregir validación.
- Agregar try-catch.

## 84. Code Generation + AI

La IA puede generar código.

Ejemplo:

Usuario:

```
"Necesito una función para parsear JSON"
```

Sistema:

- Analiza:
- Contexto del proyecto.
- Código existente.
- Dependencias.

Propone:

Código:

```typescript
function parseJSON(data: string) {
try {
return JSON.parse(data);
} catch (error) {
throw new Error(`Failed to parse JSON: ${error}`);
}
}
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
Tool Execution Logs
AI Logs
Security Logs
```

## 87. Audit System

Los proyectos necesitan trazabilidad.

Ejemplo:

Usuario:

```
Developer
```

Acción:

```
Executed Shell Command
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
                    |
                 API
                    |
              Core Services
                    |
        -----------------------
        |          |          |
    Database    AI       Tools
```

## 89. Backend Golden Rules

- Toda lógica de la aplicación vive en servicios.
- Nunca conectar UI directamente con datos.
- Toda acción importante genera eventos.
- Toda integración externa usa adapters.
- Todo módulo debe ser reemplazable.
- El usuario es dueño de sus datos y claves.

---

## 90. Tool Execution Philosophy

La ejecución de herramientas es una de las partes centrales del sistema.

No debe ser solamente:

```
"Ejecutar comandos"
```

Debe ser un motor capaz de ejecutar herramientas complejas.

Ejemplos:

- Terminal.
- Editor.
- Git.
- LSP.
- DAP.
- File operations.
- Search.

---

## 91. Tool Execution Engine

El Tool Execution Engine es un sistema independiente.

Ubicación:

```
packages/tools/
```

Responsabilidades:

- Ejecutar herramientas.
- Controlar estados.
- Manejar errores.
- Registrar historial.
- Retornar resultados.

---

## 92. Tool Execution Concept

Una ejecución de herramienta está compuesta por:

```
Input
Tool
Execution
Output
```

Ejemplo:

```
User Input
    |
    |
Shell Command
    |
    |
Execute
    |
    |
Output
```

---

## 93. Tool Execution Model

Entidad principal:

```
ToolExecution
```

Modelo:

```
interface ToolExecution {
id:string;
userId:string;
toolName:string;
status:"pending"|"running"|"completed"|"error";
input:unknown;
output:unknown;
createdAt:Date;
}
```

## 94. Tool System

Cada herramienta es un módulo independiente.

Tipos:

```
Shell Tool
File Tool
Search Tool
LSP Tool
DAP Tool
Git Tool
AI Tool
```

## 95. Shell Tool

Ejecuta comandos en el shell.

Ejemplos:

```
ls -la
git status
npm install
```

## 96. File Tool

Opera con archivos.

Ejemplos:

```
readFile()
writeFile()
deleteFile()
renameFile()
```

## 97. Search Tool

Busca en el código fuente.

Ejemplo:

```
grep -r "function" .
find . -name "*.ts"
```

## 98. AI Tool

La IA es una herramienta más.

Ejemplo:

```
User Input
        |
        |
AI Analysis
        |
        |
Code Generation
```

## 99. Tool Execution Engine

Cada ejecución tiene un contexto.

Ejemplo:

```
ExecutionContext {
	toolName:string;
	input:unknown;
	user:Object;
	project:Object;
}

Execution Flow

Tool Start
        |
	Load Context
        |
	Execute Tool
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

Tool:

```
Shell Command
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

1. Command Executed
2. Output Captured
3. Result Returned

## 101. Error Handling

Las herramientas deben soportar errores.

Ejemplo:

```
Execute Command
       X
Command Error
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

## 102. Visual Tool Builder

La interfaz debe permitir crear herramientas visualmente.

Ejemplo:

```
[Input]
    |
[Tool]
    |
[Output]
```

#### Builder Architecture

La UI solamente representa.

No ejecuta.

Flujo:

```
Tool Builder UI
        |
Tool Definition
        |
Tool Execution Engine
        |
	Execution
```

## 103. Tool Definition Format

Formato interno:

JSON.

Ejemplo:

```
{
	"name":"Shell Command",
	"input":{
		"command":"ls -la"
	},
	"output":{
		"stdout":"",
		"stderr":"",
		"exitCode":0
	}
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
LSP API
```

Correcto:

```
Core
 |
Integration Layer
 |
LSP Plugin
```

## 105. Integration Layer

Las integraciones externas nunca viven dentro del Core.

Incorrecto:

```
Core
↓
LSP API
```

Correcto:

```
Core
↓
Integration Layer
↓
LSP Plugin
```

Ubicación:

```
plugins/
├── lsp/
├── dap/
├── git/
└── theme/
```

## 106. Integration Adapter Pattern

Todas las integraciones tienen una interfaz común.

Ejemplo:

```
interface LSPProvider {
diagnose()
complete()
hover()
}
```

Entonces:

TypeScript:

```
class TypeScriptLSPProvider
implements LSPProvider
```

Rust:

```
class RustAnalyzerProvider
implements LSPProvider
```

## 107. Supported Integrations

Primera etapa:

Lenguajes:

- TypeScript.
- JavaScript.
- Python.
- Rust.
- Go.

Herramientas:

- LSP.
- DAP.
- Git.
- Shell.
- File System.

## 108. Plugin System

La plataforma debe permitir extensiones externas.

Un plugin puede agregar:

- Integraciones.
- Herramientas.
- Herramientas IA.
- Lenguajes.

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
	"name":"lsp-typescript",
	"version":"1.0.0",
	"author":"Developer",
	"permissions":[
		"lsp",
		"diagnostics"
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

LSP Plugin:

Permitido:

```
diagnostics
completions
hover
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
- Compartir herramientas.
- Compartir plantillas.
- Compartir configuraciones.

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

Herramientas:

```
createTool()
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
- Feature flags.
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

Tool:

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
Configuration Migration
```

## 123. Migration System

Cuando cambia una estructura:

Ejemplo:

Antes:

```
Session.title
```

Después:

```
Session.name
Session.description
```

Debe existir:

```
Migration Script
```

## 124. Open Source Repository Structure

Repositorio:

```
Blitz/
├── apps/
│   ├── desktop/
│   └── web/
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
- Herramientas.
- Mejoras.
- Pero deben seguir:
- Arquitectura.
- TypeScript.
- Tests.
- Documentación.

## 126. Final Tool Execution Architecture

Resultado:

```
                User
                  |
          Tool Builder
                  |
          Tool Definition
                  |
          Tool Execution Engine
                  |
        ---------------------
        |         |         |
    Shell    File    Search
                  |
              Execution
                  |
               Logs
```

## 127. Tool Execution Golden Rules

- Las herramientas son datos, no código.
- Toda ejecución importante genera eventos.
- Las integraciones son plugins.
- La IA es una herramienta más.
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
Allowed Tools
```

## 136. Audit Logs

Toda acción importante genera registro.

Ejemplo:

User:

```
Developer
```

Action:

```
Executed Shell Command
```

Date:

```
2026-01-01
```

Project:

```
my-project
```

## 137. Security Events

Eventos:

```
user.login
user.logout
permission.changed
api_key.created
plugin.installed
tool.executed
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
SessionService
ToolExecutor
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
Create Session
        |
Execute Tool
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
- Herramientas complejas.

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
SessionService.ts
SessionRepository.ts
SessionCard.tsx
```

Clases:

```
SessionService
ToolExecutor
PluginManager
```

Funciones:

```
createSession()
executeTool()
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
sessionManager
toolExecutor
pluginManager
```

Incorrecto:

```
Session-manager
tool_executor
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

feat: add session manager

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

Stack tecnológico completo del proyecto. Blitz es un wrapper de OMP.

### Blitz UI App (Nuestra Capa)

```
Lenguaje:    TypeScript (strict mode)
Frontend:    Electron + React + Vite + electron-vite
UI:          shadcn/ui + Radix UI + Tailwind CSS
State:       Zustand (slices pattern)
Build:       electron-builder
```

### OMP Core (Capa Base)

```
Lenguaje:    TypeScript + Rust
Runtime:     Bun
TUI:         packages/coding-agent
AI:          packages/ai (60+ providers)
Protocol:    packages/wire (wire protocol)
Natives:     crates/pi-natives (Rust)
```

### Comunicación entre capas

```
Blitz UI App
    ↓ IPC (Electron)
Main Process
    ↓ OMP Process spawn
OMP TUI
    ↓ @oh-my-pi/pi-wire
OMP Core
```

### Package Managers

```
Blitz:   pnpm (UI app)
OMP:     Bun (core)
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
@oh-my-pi/pi-wire (wire protocol)
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
Blitz/
├── apps/
│   ├── desktop/
│   └── web/
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

El objetivo es envolver OMP en una UI gráfica. Fases:

```
Phase 1
OMP Integration
```

Objetivo:

- Conectar Blitz UI con OMP Core
- Spawn OMP process desde Electron
- Comunicación via wire protocol

Resultado:

- Blitz UI ejecutando OMP en background

```
Phase 2
Session Panel
```

Objetivo:

- Mostrar sesiones de OMP en UI
- Seleccionar y cargar sesiones
- Ver historial de mensajes

Resultado:

- Panel de sesiones funcionando

```
Phase 3
Terminal Emulator
```

Objetivo:

- Terminal embebida en Blitz UI
- Output de OMP TUI visible
- Input del usuario enviado a OMP

Resultado:

- Terminal funcionando en UI

```
Phase 4
Chat Interface
```

Objetivo:

- Interfaz de chat con IA
- Streaming de respuestas
- Tool calls visuales

Resultado:

- Chat con AI funcionando

```
Phase 5
File Explorer
```

Objetivo:

- Explorador de archivos del proyecto
- Abrir archivos en editor
- Navegación de directorios

Resultado:

- File explorer integrado

```
Phase 6
Tool Results
```

Objetivo:

- Mostrar resultados de herramientas
- Diff viewer para cambios
- Output de comandos

Resultado:

- Tool results renderizados

```
Phase 7
Provider Manager
```

Objetivo:

- Seleccionar provider LLM
- Configurar API keys
- Gestión de modelos

Resultado:

- Provider manager funcionando

```
Phase 8
Polish & Distribution
```

Objetivo:

- UI pulida
- Build y distribución
- Documentación

Resultado:

- Blitz listo para usar

```

Construir:

- Terminal emulator.
- Shell integration.
- Process management.

Resultado:

- Terminal funcionando en la UI.

```

Phase 4
Tool Execution

```

Construir:

- Tool registry.
- Tool execution engine.
- Tool results rendering.

Resultado:

- Herramientas ejecutándose correctamente.

```

Phase 5
AI Chat

```

Construir:

- Chat interface.
- Streaming support.
- Provider integration.

Resultado:

- Chat con IA funcionando.

```

Phase 6
Plugin System

```

Construir:

- Plugin manager.
- Plugin loader.
- Plugin sandbox.

Resultado:

- Sistema de plugins funcionando.

```

Phase 7
Marketplace

```

Construir:

- SDK.
- Registry.
- Installation.
- Permissions.

Resultado:

- Comunidad creando extensiones.

```

Phase 8
Code Intelligence

```

Agregar:

- LSP integration.
- DAP integration.
- Code analysis.

Resultado:

- IDE completo funcionando.

```

Phase 9
Advanced Features

```

Agregar:

- SSO.
- Audit.
- Advanced permissions.
- Scaling.
- High availability.

## 158. MVP Definition

El MVP es Blitz envolviendo OMP.

MVP:

```

Blitz UI App (Electron)

- OMP Core Integration
- Session Panel
- Terminal Emulator
- Chat Interface
- Tool Results

```

Este MVP demuestra que Blitz puede:
- Spawn OMP process
- Comunicarse via wire protocol
- Mostrar sesiones de OMP
- Ejecutar herramientas de OMP
- Chat con IA usando providers de OMP

## 159. First Plugin Example

El primer plugin debe ser:

```

LSP Plugin

```

Debe demostrar:

- Integración externa.
- Eventos.
- Herramientas.
- UI.
- Permisos.

## 160. First Tool Execution Example

Caso:

Ejecutar comando.

Flujo:

```

User Input
|
Shell Command
|
Execute
|
Output
|
Return Result

```

## 161. Final Architecture Vision

Blitz es un wrapper de OMP. La arquitectura completa:

```

┌─────────────────────────────────────────────────────────────────┐
│ BLITZ │
│ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Users (Developer) │ │
│ └─────────────────────────────────────────────────────────┘ │
│ │ │
│ ↓ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Blitz UI App │ │
│ │ (Electron + React) │ │
│ │ │ │
│ │ ┌───────────┐ ┌───────────┐ ┌───────────┐ │ │
│ │ │ Sessions │ │ Terminal │ │ Chat │ │ │
│ │ │ Panel │ │ Emulator │ │ AI │ │ │
│ │ └───────────┘ └───────────┘ └───────────┘ │ │
│ │ ┌───────────┐ ┌───────────┐ ┌───────────┐ │ │
│ │ │ File │ │ Tool │ │ Provider │ │ │
│ │ │ Explorer │ │ Results │ │ Manager │ │ │
│ │ └───────────┘ └───────────┘ └───────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│ │ │
│ ↓ IPC / Wire Protocol │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ OMP TUI │ │
│ │ (coding-agent package) │ │
│ │ │ │
│ │ - Session management │ │
│ │ - Tool execution │ │
│ │ - Agent runtime │ │
│ │ - Event bus │ │
│ └─────────────────────────────────────────────────────────┘ │
│ │ │
│ ↓ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ OMP Core │ │
│ │ (blitz_tui_infraestructura) │ │
│ │ │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ LLM AI │ │ Wire │ │ Natives │ │ │
│ │ │ 60+ │ │ Protocol │ │ Rust │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

```

### Resumen de capas

| Capa | Qué es | Qué provee |
|------|--------|------------|
| **Blitz** | La plataforma | Envoltura completa |
| **Blitz UI** | Nuestra app | Interfaz gráfica |
| **OMP TUI** | Terminal UI | Runtime del agente |
| **OMP Core** | Base Rust | Providers, protocolo, nativos |

## 162. Final Principles

#### Principle 1: Wrapper First

- Blitz envuelve OMP, no lo reemplaza.

#### Principle 2: Reuse Over Rewrite

- Reutilizar OMP TUI y Core, no crear desde cero.

#### Principle 3: UI as Interface

- La UI gráfica es solo una forma de interactuar con OMP.

#### Principle 4: Wire Protocol

- Toda comunicación UI ↔ Core usa wire protocol.

#### Principle 5: Session Parity

- Blitz UI debe poder toda la funcionalidad de OMP TUI.

#### Principle 6: Open Core

- OMP es open source, Blitz es open source.

#### Principle 7: Provider Agnostic

- Soportar cualquier provider LLM que OMP soporte.

#### Principle 8: Tool Equivalence

- Blitz UI expone todas las herramientas de OMP TUI.

#### Principle 9: Performance

- No degradar el rendimiento de OMP con la capa UI.

#### Principle 10: Extensible

- Blitz debe poder extenderse con plugins como OMP.

- La arquitectura debe permitir crecer durante años.

---

## 163. Code Intelligence Engine

La plataforma no escribe código. La plataforma **crea las condiciones para que la IA escriba código**.

### Qué construye la plataforma

- **Motor de código** — Maneja el flujo de código entre desarrollador y proyecto.
- **Detector de contexto** — Clasifica cada solicitud del desarrollador (quiere escribir, depurar, refactorizar, explicar).
- **Gestor de contexto** — Mantiene el historial completo de cada sesión.
- **Plantillas de código** — Define los patrones: Component, Service, Hook, Utility.
- **Captura de datos** — Registra qué funcionó y qué no en cada interacción.

### Qué hace la IA (conectada a través de la plataforma)

- Interpreta la solicitud del desarrollador.
- Decide qué tipo de código generar.
- Genera el código.
- La plataforma lo entrega al editor correcto.

### La plataforma NO asume qué IA usar

El usuario puede conectar:

- OpenAI
- Anthropic
- Modelo local
- Cualquier proveedor a través del SDK

La plataforma solo define **el contrato**: _"El desarrollador dijo X, responde en el contexto Y"_.

---

## 164. Self-Learning System

La plataforma no aprende sola. La plataforma **crea el mecanismo para que los datos mejoren las respuestas de la IA**.

### Qué construye la plataforma

- **Repositorio de interacciones** — Cada sesión se guarda con resultado (éxito o error).
- **Sistema de feedback** — Etiqueta cada interacción como éxito o fracaso.
- **Análisis de patrones** — Detecta qué tipos de código, qué herramientas, qué patrones funcionan mejor.
- **Contexto para la IA** — Cuando la IA va a responder, la plataforma le entrega: _"Los desarrolladores como este suelen escribir cuando la respuesta incluye [X]"_.

### Qué hace la IA

- Recibe el contexto enriquecido.
- Genera una respuesta más informada.

### La plataforma no cambia el modelo de IA

La plataforma **alimenta** al modelo con datos. El modelo decide cómo usarlos. Si mañana el usuario cambia de OpenAI a Anthropic, el sistema de aprendizaje sigue funcionando igual.

---

## 165. Proactive Code Advisor

La plataforma no sugiere código. La plataforma **monitorea el proyecto y los datos, y genera contexto para que la IA sugiera**.

### Qué construye la plataforma

- **Monitor de proyecto** — Revisa cambios recientes y detecta áreas relevantes (bugs, deuda técnica, etc.).
- **Análisis de tendencias** — Compara patrones de código periodo a periodo.
- **Detección de código inactivo** — Identifica archivos que no se modifican en X días.
- **Sistema de notificaciones** — Cuando hay algo que sugerir, la plataforma emite un evento.

### Qué hace la IA

- Recibe el evento: _"Hay bugs en el módulo de autenticación"_.
- Genera la sugerencia concreta.
- La plataforma la entrega al usuario.

### Ejemplo de flujo

```

Plataforma detecta: Bugs en auth module
↓
Plataforma emite evento: code.bug_detected
↓
IA recibe contexto + datos del proyecto
↓
IA genera sugerencia: "Corregir validación de token"
↓
Plataforma entrega al usuario

```

La plataforma **no sabe qué sugerir**. Solo sabe que hay un evento y tiene datos. La IA decide la sugerencia.

---

## 166. Code Analytics System

La plataforma no genera reportes. La plataforma **recopila los datos y expone los formatos para que la IA o el usuario los generen**.

### Qué construye la plataforma

- **Data Warehouse ligero** — Almacena sesiones, herramientas, código, errores.
- **Exportadores de formato** — JSON, CSV.
- **Programación de reportes** — El usuario puede pedir: "envíame un reporte de actividad".
- **Métricas calculadas** — Tiempo de desarrollo, herramientas usadas, tendencias.

### Qué hace la IA (opcionalmente)

- Puede narrar los datos: _"El uso de herramientas subió 15% porque..."_
- Puede sugerir acciones basadas en los números.

### El usuario también puede

- Generar reportes sin IA.
- Exportar datos crudos.
- Importar en herramientas externas.

### La plataforma no asume qué formato

El usuario elige: JSON, CSV. La plataforma provee los exportadores. Si mañana se necesita un formato nuevo, se agrega un exportador sin tocar el resto.

---

## 167. Free & Open Source

La plataforma es **100% gratis**. No es una estrategia comercial, es el modelo.

### Qué significa

- Sin versiones de pago.
- Sin funciones premium.
- Sin límites de sesiones, herramientas o plugins.
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

## 168. Architecture Reference: OMP Core

OMP (Oh My Pi) es la base de Blitz. Es un coding agent TUI con 80k+ líneas de Rust core que provee las capacidades fundamentales del agente.

### Qué toma Blitz de OMP

Blitz **reutiliza** OMP, no lo reescribe:

| Componente | OMP provee | Blitz lo envuelve |
|------------|------------|-------------------|
| **LLM Providers** | 60+ providers | UI para seleccionar providers |
| **Session Management** | Crear/cargar/guardar sesiones | Panel de sesiones en UI |
| **Tool Execution** | Ejecutar shell, files, git, LSP | Terminal embebida + resultados |
| **Agent Runtime** | Comunicación con IA | Chat interface |
| **Wire Protocol** | Comunicación UI ↔ core | IPC bridge |

### OMP Core Packages (Lo que Blitz consume)

- **@oh-my-pi/pi-coding-agent** — CLI principal con session management, tool execution, agent runtime.
- **@oh-my-pi/pi-ai** — Multi-provider LLM client con streaming support.
- **@oh-my-pi/pi-agent** — Agent runtime con tool calling y state management.
- **@oh-my-pi/pi-catalog** — Model catalog con 60+ providers.
- **@oh-my-pi/pi-wire** — Wire protocol para comunicación UI ↔ core.
- **@oh-my-pi/pi-natives** — Bindings para operaciones nativas (text, grep).
- **crates/pi-natives** — Rust crate para operaciones performance-critical.

### Patrones de OMP que Blitz adopta

- **Wire protocol** — Comunicación estructurada entre UI y core
- **Session hydration** — Cargar sesiones al iniciar
- **Event-driven** — Comunicación por eventos
- **Plugin isolation** — Plugins en proceso separado

---

## 169. Repository Structure

```

orca-blitz/
│
├── blitz_tui_infraestructura/ ← OMP Core (fork/submodule)
│ ├── packages/
│ │ ├── coding-agent/ ← OMP TUI (terminal UI)
│ │ ├── ai/ ← LLM providers (60+)
│ │ ├── wire/ ← Wire protocol
│ │ ├── natives/ ← Rust bindings
│ │ ├── agent/ ← Agent runtime
│ │ ├── tui/ ← Terminal UI library
│ │ ├── catalog/ ← Model catalog
│ │ ├── utils/ ← Shared utilities
│ │ └── ...
│ ├── crates/
│ │ └── pi-natives/ ← Rust core (performance)
│ └── ...
│
├── apps/
│ └── desktop/ ← Blitz UI App (Electron)
│ ├── src/
│ │ ├── main/ ← Main process
│ │ │ ├── index.ts ← Entry point
│ │ │ ├── omp/ ← OMP process manager
│ │ │ │ ├── omp-process.ts ← Spawn OMP
│ │ │ │ └── wire-protocol.ts ← IPC with OMP
│ │ │ ├── ipc/ ← IPC handlers
│ │ │ └── window/ ← Window manager
│ │ ├── preload/ ← Security bridge
│ │ │ ├── index.ts
│ │ │ └── api-types.ts
│ │ └── renderer/ ← React UI
│ │ ├── App.tsx
│ │ ├── components/
│ │ │ ├── sessions/ ← Session panel
│ │ │ ├── terminal/ ← Terminal emulator
│ │ │ ├── chat/ ← Chat interface
│ │ │ ├── files/ ← File explorer
│ │ │ └── tools/ ← Tool results
│ │ └── store/ ← Zustand store
│ ├── electron.vite.config.ts
│ └── package.json
│
├── packages/
│ ├── shared/ ← Shared types
│ └── ui/ ← Design system
│
└── LuxAuth.md ← Este documento

```
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useIpcEvents.ts
│   │   │   │   ├── store/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   ├── selectors.ts
│   │   │   │   │   └── slices/
│   │   │   │   │       ├── ui.ts
│   │   │   │   │       ├── sessions.ts
│   │   │   │   │       ├── terminal.ts
│   │   │   │   │       ├── chat.ts
│   │   │   │   │       ├── tools.ts
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
│   │   │   ├── lsp/
│   │   │   └── tools/
│   │   └── storage/
│   │
│   ├── ui/
│   │   ├── theme/
│   │   ├── icons/
│   │   ├── primitives/
│   │   ├── layout/
│   │   ├── components/
│   │   └── charts/
│   │
│   ├── features/
│   │   ├── index.ts
│   │   ├── sessions/
│   │   ├── terminal/
│   │   ├── editor/
│   │   ├── tools/
│   │   ├── chat/
│   │   ├── providers/
│   │   ├── files/
│   │   └── git/
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
│   ├── lsp/
│   ├── dap/
│   ├── git/
│   └── theme/
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
window.api.sessions.create(data)
window.api.sessions.list()
window.api.sessions.onChanged(cb)

window.api.terminal.execute(command)
window.api.terminal.onOutput(cb)

window.api.tools.execute(toolName, args)
window.api.tools.onResult(cb)

window.api.chat.send(message)
window.api.chat.onMessage(cb)

window.api.settings.get()
window.api.settings.update(prefs)

window.api.plugins.install(manifest)
window.api.plugins.enable(id)
```

### Flujo

```
Renderer
    ↓ window.api.sessions.create(data)
Preload (contextBridge)
    ↓ ipcRenderer.invoke('sessions:create', data)
Main Process
    ↓ SessionService.create(data)
OMP Core
    ↓ Wire Protocol
Infrastructure
    ↓ PostgreSQL / SQLite
```

### Regla

El renderer NUNCA accede a Node.js, filesystem, o procesos. Todo pasa por `window.api`.

---

## 171. Zustand Store Architecture

El store se compone de slices especializados. Cada feature tiene su propio slice.

### Slices

| Slice    | Responsabilidad                       |
| -------- | ------------------------------------- |
| ui       | Sidebar, modales, filtros, sorting    |
| sessions | Sesiones de chat, historial           |
| terminal | Output del terminal, procesos activos |
| chat     | Mensajes del agent, streaming         |
| tools    | Estado de herramientas, resultados    |
| settings | Preferencias del usuario              |

### Cross-Slice Cascades

Cuando se elimina una entidad, se limpia todo el estado relacionado:

```
Eliminar session
    ↓
Messages de la session → eliminadas
Terminal output de la session → limpiado
Tools en ejecución → abortados
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
Load persisted state (blitz-data.json)
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
1. Write to temp file (blitz-data.json.[uuid].tmp)
2. Check write generation (no sobreescribir cambios recientes)
3. Rename to blitz-data.json (atómico en la mayoría de filesystems)
4. On shutdown: synchronous flush
```

### Schema Versioning

```
SCHEMA_VERSION = 1
```

Al cargar, se hace deep merge con defaults para manejar versiones anteriores.

### Entidades persistidas

- Sessions (sesiones de chat)
- Messages (mensajes del agent)
- Settings (preferencias)
- Plugin states (estado de plugins)
- Terminal state (historial de terminal)

### Seguridad

- Datos sensibles encriptados con Electron safeStorage
- API keys nunca en texto plano
- SSH passphrases encriptadas

---

## 173. Relay WebSocket Architecture

El relay conecta desktop ↔ web ↔ CLI ↔ SSH.

### Conexiones

```
Desktop (Electron)
    ↕ WebSocket
Web (Browser)
    ↕ WebSocket
CLI (Node.js)
    ↕ WebSocket
SSH Remote
```

### Funciones del relay

- Autenticación de conexiones
- Enrutamiento de mensajes
- Streaming de terminal output
- Operaciones de archivos
- Git operations
- Port forwarding

### Seguridad

- Cada conexión autenticada
- Permisos por conexión
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
src/main/sessions.ts: 500
src/renderer/src/App.tsx: 2000
packages/core/services/SessionService.ts: 300
```

Si un archivo crece más allá de su límite, CI falla.

### Reliability Gates

`config/reliability-gates.jsonc` contiene presupuestos de confiabilidad para cada subsistema. Ejemplo:

```jsonc
{
  "sessions": {
    "maxResponseTime": "200ms",
    "maxMemoryUsage": "50MB",
    "testCoverage": "90%"
  },
  "terminal": {
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
Sessions:
    Ajustes     → Configuración del módulo
    Rutas       → Páginas que ofrece
    Eventos     → Qué eventos maneja
    Store       → Estado que necesita
    UI          → Componentes visuales

Terminal:
    Ajustes     → Configuración del shell
    Rutas       → Página de terminal
    Eventos     → terminal.output, process.exit
    Store       → Historial de output
    UI          → Terminal emulator
```

### Regla

Si una feature no entrega algo, no lo tiene. Si Sessions no entrega `Ajustes`, no tiene pantalla de configuración. Si Terminal no entrega `Rutas`, no tiene página propia. Simple.

---

## 177. Feature Registry

El registry es un archivo central que lista todas las features. Es explícito. Igual que OMP.

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

### Web

```
Vite build (archivos estáticos)
```

---

## 185. Code Quality

### Linting

```
OxLint (con custom plugins de Blitz)
    renderer-scrollbar-style
    app-store-performance
    quadratic-buffer-concat
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
- Código fuente del usuario
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

Version 2.0

---
