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

## Tema

```typescript
// apps/desktop/src/renderer/lib/theme-context.tsx
type Theme = 'light' | 'dark' | 'system'

// Lee de localStorage('orca-theme')
// Aplica clase .dark o .light en <html>
// System mode: escucha prefers-color-scheme
```
