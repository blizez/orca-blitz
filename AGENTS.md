# Reglas para Agentes — orca-blitz

Este documento define cómo trabajar en orca-blitz. Toda la IA que modifique código debe seguir estas reglas.

---

## ⚠️ Estado actual vs roadmap

Este documento mezcla **reglas vigentes** con **arquitectura objetivo (roadmap)**. Antes de actuar, distinguir:

**Vigente hoy:**

- Monorepo pnpm (`pnpm-workspace.yaml`): `apps/desktop` (Electron + React + electron-vite), `packages/ui`, `packages/shared`, `packages/i18n`
- Calidad: TypeScript strict en todos los targets, OxLint (`.oxlintrc.json`), oxfmt, Vitest — scripts en la raíz: `lint`, `lint:fix`, `format`, `typecheck`, `test`
- Arquitectura Electron de 3 procesos, preload con `window.api` tipado
- Mensajería WhatsApp/Telegram en `apps/desktop/src/main/messaging/`

**Roadmap (NO existe aún, no asumir que está):**

- `server/`, `relay/`, `plugins/`, `tests/`, `config/max-lines-baseline.txt`, `config/reliability-gates.jsonc`
- Turborepo (`turbo.json`), Husky/lint-staged, Playwright
- Apps `web/` y `mobile/` como workspaces separados
- Slices de Zustand por dominio (`store/slices/*.ts`) — hoy hay stores planos por feature
- Marketplace y SDK de plugins

Las reglas de estilo, naming, seguridad y comunicación por eventos aplican desde ya a todo código nuevo.

---

## Design System

Todo el trabajo de UI — layout, color, tipografía, spacing, selección de componentes, comportamiento UX — debe seguir [`docs/STYLEGUIDE.md`](docs/STYLEGUIDE.md). Usa los tokens definidos en `packages/ui/src/globals.css` (fuente canonical) y los primitives de shadcn en `packages/ui/src/components/ui/`. No inventar nuevos valores de color, tamaños de fuente, o niveles de sombra cuando ya exista uno documentado que cubra el rol. Cuando STYLEGUIDE.md no responda, seguir el orden de resolución de su última sección.

---

## Style

### Comentarios concisos, solo lo no obvio

- NO: ser verboso, explicar lo obvio, recorrer el código ("POR QUÉ no CÓMO")
- SER CONCISO. 1 LÍNEA si es posible

### TypeScript

- **Strict mode** activado en todos los targets
- **Nunca** usar `any` a menos que sea estrictamente necesario (documentar por qué)
- Prefer `.ts` sobre `.d.ts` para declarations
- Tres targets separados:
  - `tsconfig.node.json` ← Main process + Server
  - `tsconfig.web.json` ← Renderer + Web
  - `tsconfig.cli.json` ← CLI + Tools

### Linting

- **OxLint** como linter principal
- **oxfmt** para formateo de código
- **Nunca** deshabilitar max-lines (`eslint-disable max-lines`, `oxlint-disable max-lines`)
- Husky + lint-staged para git hooks

### Naming de archivos

- **Nunca** usar nombres vagos como `helpers`, `utils`, `common`, `misc`, `shared-stuff`
- Nombrar archivos por lo que _realmente_ contienen — preferir el concepto de dominio concreto (ej: `tab-group-state.ts`, `terminal-orphan-cleanup.ts`) sobre el rol genérico (`tabs-helpers.ts`, `terminal-utils.ts`)
- Si llegas a `helpers`, el archivo probablemente tiene más de una responsabilidad y debe ser dividido, o hay un mejor nombre oculto en el código que describe qué operan las funciones

### Naming de carpetas

- **Siempre** `camelCase`
- Correcto: `workflowEngine`, `pluginManager`
- Incorrecto: `Workflow-engine`, `plugin_manager`

---

## Arquitectura Monorepo

El proyecto utiliza un único repositorio. Desktop y Web comparten packages. Mobile es un workspace separado con sus propias dependencias.

### Estructura del repositorio

```
orca-blitz/
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

### Regla de jerarquía de packages

Un paquete no puede importar cualquier cosa. Debe existir una jerarquía:

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

El Core nunca debe conocer interfaces de UI.

### Regla de feature registry

Si una feature no está en `packages/features/index.ts`, no existe para el sistema. No se renderiza, no se registra, no se escucha.

---

## Comunicación

### Event Driven Architecture

Los módulos no deben depender directamente unos de otros. Utilizar eventos:

```
customer.created
    ↓
Automation Engine
    ↓
Send Welcome Message
```

Nunca:

```
CRM importa Marketing
Marketing importa AI
```

Siempre:

```
CRM emite evento
Marketing escucha evento
AI escucha evento
```

### Eventos del sistema

```
user.created
customer.updated
invoice.created
message.received
workflow.completed
ai.generated
```

---

## State Management

### Zustand Slices

El store se compone de slices especializados:

| Slice         | Responsabilidad                    |
| ------------- | ---------------------------------- |
| ui            | Sidebar, modales, filtros, sorting |
| customers     | Clientes, leads, deals             |
| workflows     | Automatizaciones, ejecuciones      |
| conversations | Chat con clientes, historial       |
| integrations  | Estado de integraciones externas   |
| settings      | Preferencias del usuario           |

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

### Persistencia

- **Write-then-rename** para atomicidad
- **Schema versioning** con `SCHEMA_VERSION`
- **Datos sensibles** encriptados con Electron safeStorage
- **API keys** nunca en texto plano

---

## Cross-platform

orca-blitz corre en macOS, Linux, Windows, Web y Mobile.

### Modifier keys

Nunca hardcodear `e.metaKey`. Usar:

```typescript
const isMac = navigator.userAgent.includes('Mac')
const mod = isMac ? 'metaKey' : 'ctrlKey'
```

### Shortcut labels

- Mac: `⌘` / `⇧`
- Otros: `Ctrl+` / `Shift+`

El label debe reflejar el binding real para esa plataforma.

### File paths

Usar `path.join` o utilidades de path de Electron/Node — nunca asumir `/` o `\`.

### Platform detection

Solo para:

- Ajustes
- Rendimiento
- Integraciones

**Nunca** para duplicar interfaces.

Incorrecto:

```typescript
if (android) return DifferentScreen()
```

Correcto:

```typescript
if (android) adjustSpacing()
```

---

## Arquitectura Electron

### Tres procesos estrictos

```
Electron Main (proceso con permisos)
    ↓
Preload (Application API tipada)
    ↓
React Renderer (solo UI)
```

### Main Process

Puede:

- Crear ventanas
- Gestionar procesos
- Acceder al sistema
- Controlar módulos nativos

No puede:

- Renderizar UI
- Tener lógica empresarial

### Preload Layer

El preload es la capa de seguridad entre UI y sistema. Expone `window.api` con namespaces tipados:

```typescript
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

### Renderer Process

El renderer NUNCA accede a Node.js, filesystem, o procesos. Todo pasa por `window.api`.

Incorrecto:

```typescript
const fs = require('fs')
fs.readFile(path)
```

Correcto:

```typescript
window.api.files.read(path)
```

---

## Seguridad

### Least Privilege

Un módulo solamente recibe permisos necesarios.

Ejemplo — Plugin WhatsApp:

Permitido:

- `messages.send`
- `messages.receive`
- `contacts.read`

No permitido:

- `filesystem`
- `system.execute`
- `database.raw`

### Input Validation

Nunca confiar en datos externos.

Incorrecto:

```typescript
createUser(request.body)
```

Correcto:

```typescript
const data = UserSchema.parse(request.body)
createUser(data)
```

Utilizar Zod para esquemas.

### Secrets Management

- API keys **nunca** en texto plano
- Encriptar con Electron safeStorage
- Separar datos de usuario de secretos de aplicación

### Plugin Isolation

Los plugins corren en su propio proceso:

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

Si un plugin falla:

- El proceso plugin crashea
- La app principal NO se ve afectada
- El plugin se desactiva automáticamente
- Se registra el error

---

## Base de Datos

### Repository Pattern

Nunca:

```
Feature → Database
```

Siempre:

```
Feature → Service → Repository → Database Adapter
```

### Dual Database Support

- **Cloud:** PostgreSQL
- **Local:** SQLite

El Core no debe depender directamente de una base.

### Multi-Tenant

Todo dato debe pertenecer a una organización:

Incorrecto:

```typescript
interface Customer {
  id: string
  name: string
}
```

Correcto:

```typescript
interface Customer {
  id: string
  organizationId: string
  name: string
}
```

---

## Testing

### Tipos de test

- **Unit Tests** — Vitest
- **Integration Tests** — Vitest
- **End To End Tests** — Playwright
- **Visual Tests** — Composición visual
- **Performance Tests** — Benchmarks
- **Security Tests** — Auditoría

### Quality Gates

#### Max-Lines Ratchet

Cada archivo tiene un límite de líneas en `config/max-lines-baseline.txt`. El límite solo puede BAJAR, nunca subir. Esto fuerza la modularidad.

Si un archivo crece más allá de su límite, CI falla.

#### Reliability Gates

`config/reliability-gates.jsonc` contiene presupuestos de confiabilidad:

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

---

## Build & Desarrollo

### Package Manager

**pnpm** como package manager. No npm, no yarn.

### Monorepo

**Turborepo** para orquestar builds.

### Comandos

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Tests
pnpm test

# Lint
pnpm lint

# Typecheck
pnpm typecheck
```

### Un comando para correr todo

Un nuevo desarrollador debe poder ejecutar:

```bash
git clone <repo>
cd orca-blitz
pnpm install
pnpm dev
```

Y tener la app funcionando.

---

## Uso de SSH

Todos los cambios deben considerar el caso de uso SSH. No asumir ejecución local-only.

- Loading states, focus management, y animations deben aguantar 50–200 ms de latencia extra
- Testear bajo latencia simulada (o SSH real)
- La verificación local-only no es suficiente

---

## Compatibilidad con Proveedores Git

Los cambios de source-control y review deben considerar GitLab y otros proveedores soportados, no solo GitHub. Mantener el comportamiento específico del proveedor detrás de checks explícitos, y evitar naming de GitHub para conceptos genéricos de review.

---

## Remote Wire Compatibility

Clientes y servidores remotos de orca-blitz se actualizan independientemente, por lo que versiones mixtas son el estado normal. Antes de cambiar algo que un cliente pareado y un host intercambien — parámetros de RPC, stream frames, o el contenido que cada lado publica sobre ellos — seguir这些 convenciones:

- Un campo nuevo opcional es seguro
- Un opcode nuevo de stream debe ser capability-negotiated (los decoders droppean opcodes unknown silenciosamente)
- Cambiar lo que el host publica alcanza a clientes viejos incluso sin wire change

---

## SDK para Desarrolladores

Ubicación: `packages/sdk/`

Los desarrolladores externos utilizan el SDK para crear:

- Plugins
- Integraciones
- Automatizaciones

Ejemplo:

```typescript
import { Plugin, Event, Browser } from "@platform/sdk"
```

---

## Marketplace

La plataforma debe tener un marketplace que permita:

- Instalar plugins
- Compartir workflows
- Compartir plantillas
- Compartir integraciones

---

## Prerrequisitos de la Plataforma

### Multi Platform

La aplicación debe funcionar en:

- Windows
- Linux
- macOS
- Web
- Android
- iOS

Todas las plataformas deben compartir:

- Código
- Lógica
- Componentes
- Diseño
- Experiencia

### Technology Stack

- **Lenguaje:** TypeScript (strict mode)
- **Frontend Desktop:** Electron + React + Vite + electron-vite
- **Frontend Web:** React + Vite
- **Frontend Mobile:** React Native + Expo
- **UI:** shadcn/ui + Radix UI + Tailwind CSS + Lucide React
- **State:** Zustand (slices pattern)
- **Backend:** Node.js + Fastify/Hono
- **Database:** PostgreSQL (cloud) + SQLite (local) + Drizzle ORM
- **Build:** pnpm + Turborepo + Vite + electron-vite + electron-builder
- **Testing:** Vitest + Playwright
- **Code Quality:** TypeScript strict + OxLint + oxfmt + Husky

---

## Cuando este documento no responde

1. Buscar código hermano en `packages/ui/src/components/ui/` para el sibling más cercano
2. Buscar primitive existente que ya codifique el patrón
3. Para tokens, `globals.css` es canonical
4. Si nada resuelve, preguntar antes de inventar
