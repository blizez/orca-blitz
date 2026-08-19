# 01 — Overview

## Vision

orca-blitz es una plataforma empresarial open source para automatizar y gestionar negocios. Construida con Electron + React + TypeScript.

**Estado:** Fase temprana (~30% implementado). Desktop shell funcional con sidebar, settings, CRUD de negocios, social media browser, content calendar y campaigns.

---

## Stack

| Capa | Tecnologia | Uso |
|------|-----------|-----|
| Desktop | Electron ^35.0.0 | Shell nativo cross-platform |
| UI | React ^19.2.8 | Componentes |
| Types | TypeScript ^5.7.0 | Type safety estricto |
| CSS | Tailwind CSS ^4.1.11 | Utility-first |
| Primitives | Base UI ^1.7.0 | Componentes headless |
| Build | electron-vite ^3.1.0 | Dev server + HMR |
| Pkg Manager | pnpm ^11.21.0 | Monorepo workspaces |
| Icons | Lucide React ^0.525.0 | Iconografia |
| Font | Geist Variable ^5.3.0 | Variable font |

---

## Arquitectura de Procesos

```
Main Process (src/main/index.ts)
    │ ipcMain.handle / ipcMain.on
    ▼
Preload (src/preload/index.ts)
    │ contextBridge.exposeInMainWorld
    ▼
Renderer (src/renderer/)
    │ React + useState + localStorage
    ▼
UI Components (packages/ui/src/components/ui/)
```

### Main Process

- `BrowserWindow` con `frame: false` (titlebar custom)
- IPC handlers para window controls (minimize, maximize, close)
- `Menu.setApplicationMenu(null)` (sin menu nativo)
- `@electron-toolkit/utils` para shortcuts

### Preload

- `window.api` con namespaces tipados
- `window.api.window.*` — controles de ventana
- `window.api.customers.*` — CRUD (planeado)
- `window.api.workflows.*` — automatizaciones (planeado)
- `window.api.settings.*` — configuracion (planeado)

### Renderer

- Entry: `main.tsx` → `ThemeProvider` + `TooltipProvider` + `App`
- Routing manual via `useState('home')`
- Componentes en `components/layout/`, `components/settings/`, `components/home/`
- State: React Context (tema) + localStorage (negocios)

---

## Archivos Clave

| Archivo | Descripcion |
|---------|-------------|
| `src/main/index.ts` | Main: BrowserWindow, IPC, Menu |
| `src/preload/index.ts` | Preload: window.api namespaces |
| `src/renderer/App.tsx` | App shell: routing + layout |
| `src/renderer/main.tsx` | Entry: ThemeProvider + TooltipProvider |
| `src/renderer/components/layout/titlebar.tsx` | Titlebar custom |
| `src/renderer/components/layout/app-sidebar.tsx` | Sidebar + CRUD negocios |
| `src/renderer/lib/theme-context.tsx` | Theme switching |
| `packages/ui/src/globals.css` | Design tokens (oklch) |
