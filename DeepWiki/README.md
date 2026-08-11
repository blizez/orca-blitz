Ultima actualizacion: 2026-08-10 15:12

# DeepWiki â€” orca-blitz

Documentacion tecnica del proyecto orca-blitz. Basada en el codigo implementado actualmente.

---

## Navegacion

| # | Documento | Descripcion |
|---|-----------|-------------|
| 01 | [Overview](01-overview.md) | Que es orca-blitz, vision, stack tecnologico |
| 02 | [Architecture](02-architecture.md) | Arquitectura Electron de 3 procesos |
| 03 | [Monorepo](03-monorepo.md) | Estructura del repositorio y reglas de packages |
| 04 | [Design System](04-design-system.md) | packages/ui, 62 componentes, tokens CSS |
| 05 | [State Management](05-state-management.md) | ThemeContext, localStorage, estado |
| 06 | [Components](06-components.md) | Arquitectura de componentes, Base UI primitives |
| 07 | [Roadmap](07-roadmap.md) | Que falta por implementar |

---

## Stack Tecnologico

| Capa | Tecnologia | Estado |
|------|-----------|--------|
| Desktop Shell | Electron | Implementado |
| Frontend UI | React + TypeScript | Implementado |
| Styling | Tailwind CSS v4 | Implementado |
| UI Primitives | Base UI (`@base-ui/react`) | Implementado |
| State | React Context + localStorage | Implementado |
| Build Tool | electron-vite | Implementado |
| Package Manager | pnpm | Implementado |
| Icons | Lucide React | Implementado |
| Font | Geist Variable | Implementado |

---

## Estado del Proyecto

```
Implementado:  ~8%
Scaffolding:   ~92% (directorios vacios definidos en AGENTS.md)
```

### Lo que funciona

- Electron desktop app con titlebar custom
- Sidebar con CRUD de negocios (localStorage)
- Settings con 11 tabs (solo Appearance funcional)
- Theme switching (Light/Dark/System)
- Design system con 62 componentes UI

### Lo que es scaffolding vacio

- `packages/core/` â€” logica de negocio
- `packages/features/` â€” CRM, Automation, Analytics, etc.
- `packages/ai/` â€” inteligencia artificial
- `packages/plugins/` â€” sistema de plugins
- `server/` â€” backend
- `apps/web/` â€” app web
- `apps/mobile/` â€” app mobile

