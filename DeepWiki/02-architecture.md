# 02 — Architecture

## Tres Procesos de Electron

```
┌─────────────────────────────────────────────────────────┐
│                    MAIN PROCESS                         │
│  src/main/index.ts (79 lineas)                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ BrowserWindow (frame: false)                    │    │
│  │ ├── webPreferences.preload = '../preload/index' │    │
│  │ ├── webPreferences.contextIsolation = true      │    │
│  │ └── webPreferences.nodeIntegration = false      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ IPC Handlers                                   │    │
│  │ ├── ipcMain.on('window:minimize')              │    │
│  │ ├── ipcMain.on('window:maximize')              │    │
│  │ ├── ipcMain.on('window:close')                 │    │
│  │ └── ipcMain.handle('window:isMaximized')       │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Menu.setApplicationMenu(null)                          │
│  electronApp.setAppUserModelId('com.orcablitz.desktop') │
└──────────────────────┬──────────────────────────────────┘
                       │ ipcMain.handle / ipcMain.on
┌──────────────────────┴──────────────────────────────────┐
│                    PRELOAD                               │
│  src/preload/index.ts (77 lineas)                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ contextBridge.exposeInMainWorld('electron',     │    │
│  │   electronAPI)                                 │    │
│  │ contextBridge.exposeInMainWorld('api', api)     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  api = {                                                │
│    window: { minimize, maximize, close, isMaximized },  │
│    customers: { create, list, get, update, delete },    │
│    workflows: { create, list, execute },                │
│    settings: { get, update },                           │
│    plugins: { install, enable, disable }                │
│  }                                                      │
└──────────────────────┬──────────────────────────────────┘
                       │ contextBridge
┌──────────────────────┴──────────────────────────────────┐
│                  RENDERER PROCESS                        │
│  src/renderer/                                          │
│                                                         │
│  main.tsx                                               │
│  └── <ThemeProvider>                                    │
│      └── <TooltipProvider>                              │
│          └── <App />                                    │
│                                                         │
│  App.tsx                                                │
│  ├── useState('home') → activePage                      │
│  ├── useState(true) → sidebarOpen                       │
│  ├── <Titlebar />                                       │
│  ├── <AppSidebar /> (si no es settings)                 │
│  └── { activePage === 'home' ? <HomePage /> : ... }    │
│                                                         │
│  No puede acceder a Node.js, filesystem, ni procesos.   │
│  Todo pasa por window.api.                              │
└─────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos: Crear Negocio

```
1. Usuario llena AddBusinessModal (4 pasos)
       │
2. onSubmit(data) llama a onAdd(data)
       │
3. AppSidebar.handleAddBusiness(data)
       │ setBusinesses([...businesses, { ...data, id: Date.now() }])
       │
4. useEffect detecta cambio en businesses
       │ localStorage.setItem('orca-businesses', JSON.stringify(businesses))
       │
5. React re-renderiza AppSidebar
       │ businesses.map(biz => <BusinessItem />)
       │
6. Negocio aparece en la sidebar
```

---

## IPC Architecture

### Preload API Definition

```typescript
// apps/desktop/src/preload/index.ts
const api = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximized: (cb) => {
      ipcRenderer.on('window:maximized', (_, maximized) => cb(maximized))
      return () => ipcRenderer.removeListener('window:maximized', handler)
    }
  }
}
```

### Main Process Handlers

```typescript
// apps/desktop/src/main/index.ts
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)
```

### Renderer Usage

```typescript
// apps/desktop/src/renderer/components/layout/titlebar.tsx
useEffect(() => {
  window.api.window.isMaximized().then(setIsMaximized)
  const unsub = window.api.window.onMaximized(setIsMaximized)
  return unsub
}, [])
```

---

## pathAliasPlugin (electron-vite)

El `pathAliasPlugin` resuelve imports `@/` y `@orca-blitz/ui/` dentro del renderer. Tiene dos hooks:

```typescript
// apps/desktop/electron.vite.config.ts
function pathAliasPlugin(): Plugin {
  return {
    name: 'path-alias',
    resolveId(source, importer) {
      // Resuelve @/subpath → renderer/src/subpath
      // Resuelve @orca-blitz/ui/... → packages/ui/src/...
      return resolve(base, subpath)
    },
    load(id) {
      // Para archivos en packages/ui/src/:
      // Lee el .tsx/.ts, busca imports `from "@/..."` y los reescribe
      // a rutas absolutas resueltas dentro de ui/src/
      let code = readFileSync(id, 'utf-8')
      const regex = /from\s+["']@\/(.*?)["']/g
      // ... reemplaza cada match con ruta absoluta
      return { code, map: null }
    }
  }
}
```

**Flujo:**
1. `resolveId` intercepta `@/` y `@orca-blitz/ui/` durante resolución
2. `load` reescribe imports internos de `packages/ui/` — cuando un archivo en `ui/src/` importa `@/lib/utils`, se reemplaza con la ruta absoluta real

Esto permite que los componentes de `packages/ui/` usen `@/` sin depender del alias del renderer.

---

## Routing

Sin react-router. Routing manual:

```typescript
// apps/desktop/src/renderer/App.tsx
const [activePage, setActivePage] = useState('home')

// Pages:
// 'home'         → <HomePage />
// 'settings'     → <SettingsPage />
// 'business-{id}' → placeholder
// otros           → placeholder
```

---

## Sound System

Nuevo sistema de sonidos via `cuelume` (dependencia `^0.2.2`). Provider en `main.tsx` envuelve toda la app.

```typescript
// apps/desktop/src/renderer/lib/sound-context.tsx
interface SoundContextValue {
  enabled: boolean
  volume: number
  toggleEnabled: () => void
  setVolume: (v: number) => void
  play: (name?: SoundName, opts?: { volume?: number }) => void
}

const STORAGE_KEY = 'orca-sound-enabled'  // localStorage
const VOLUME_KEY = 'orca-sound-volume'    // localStorage
```

**Inicializacion:**
1. `bind()` se llama una vez en mount (`useEffect`)
2. Estado leido de localStorage (default: `enabled=true`, `volume=0.7`)
3. Cambios de estado sincronizados con cuelume via `setEnabled()` / `cuelumeSetVolume()`
4. Persistencia automatica a localStorage en cada cambio

**Uso:**
```typescript
import { useSound } from '../../lib/sound-context'

const { play } = useSound()
play('success')   // Ejecuta sonido
play()             // Default sound
```

**Provided en:**
```typescript
// apps/desktop/src/renderer/main.tsx
<ThemeProvider>
  <SoundProvider>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </SoundProvider>
</ThemeProvider>
```

---

## Business Settings State

El state de negocios se centraliza en `App.tsx` y se pasa via props (no Context):

```typescript
// apps/desktop/src/renderer/App.tsx
const [businesses, setBusinesses] = useState<Business[]>(() => {
  const saved = localStorage.getItem('orca-businesses')
  return saved ? JSON.parse(saved) : []
})

// Callbacks tipados
const handleUpdateBusiness = useCallback((id: string, data: Partial<Business>) => {
  setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, ...data } : b))
}, [])

const handleDeleteBusiness = useCallback((id: string) => {
  setBusinesses((prev) => prev.filter((b) => b.id !== id))
  setBusinessSettingsId(null)
  setActivePage('home')
}, [])
```

El `BusinessSettings` recibe `business` + `onUpdate` + `onDelete` como props. Cada campo se actualiza inline y persiste a localStorage via el `useEffect` en App.

---

## Routing

Sin react-router. Routing manual:

```typescript
// apps/desktop/src/renderer/App.tsx
const [activePage, setActivePage] = useState('home')
const [businessSettingsId, setBusinessSettingsId] = useState<string | null>(null)

// Pages:
// 'home'                    → <HomePage />
// 'settings'                → <SettingsPage businessId={...} />
// 'business-{id}'           → <BusinessPage />
// '{bizId}:{feature}'       → <BusinessPage page={activePage} />
```

Cuando `businessSettingsId` esta definido, `SettingsPage` renderiza `BusinessSettings` en lugar de la pagina de settings generica.

---

## Tema

```typescript
// apps/desktop/src/renderer/lib/theme-context.tsx
type Theme = 'light' | 'dark' | 'system'

// Lee de localStorage('orca-theme')
// Aplica clase .dark o .light en <html>
// System mode: escucha prefers-color-scheme
```
