# 06d — Social Media Browser System

## Ubicacion

```
apps/desktop/src/renderer/components/social-media/
├── social-media-page.tsx     ← Page container + platform picker
├── browser-view.tsx          ← BrowserView wrapper con IPC
├── browser-tab-bar.tsx       ← Tab bar con create/close
└── browser-nav-bar.tsx       ← Back/Forward/Reload
```

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                 Renderer Process                         │
│                                                         │
│  SocialMediaPage                                        │
│  ├── BrowserTabBar ← tabs state (Tab[])                 │
│  ├── BrowserNavBar ← nav state (canGoBack/Forward)      │
│  └── BrowserView[] ← 1 por tab con url                  │
│                                                         │
│  BrowserView                                            │
│  ├── containerRef (div) ← ResizeObserver target         │
│  ├── window.api.browser.create(id, url, partition)      │
│  ├── window.api.browser.show/hide/position/destroy       │
│  └── window.api.browser.onDidLoad/onDidFail              │
└──────────────────────┬──────────────────────────────────┘
                       │ contextBridge (IPC)
┌──────────────────────┴──────────────────────────────────┐
│                 Main Process                             │
│                                                         │
│  window.api.browser.* handlers                          │
│  ├── create → new WebContentsView per partition         │
│  ├── show/hide → add/remove from BrowserWindow          │
│  ├── position → setBounds({ x, y, width, height })     │
│  ├── destroy → close view                               │
│  ├── canGoBack/canGoForward/goBack/goForward             │
│  └── reload                                              │
└─────────────────────────────────────────────────────────┘
```

---

## Tab Management

### Interfaz Tab

```typescript
export interface Tab {
  id: string          // `tab-${Date.now()}`
  title: string       // 'New Tab' | platform name
  url: string         // '' | platform URL
  icon: string        // platform id
  partition: string   // session isolation per platform
  closable?: boolean
}
```

### Crear tab

```typescript
export function createNewTab(closable = false): Tab {
  return {
    id: `tab-${Date.now()}`,
    title: 'New Tab',
    url: '',
    icon: 'home',
    partition: '',
    closable,
  }
}
```

### Seleccionar plataforma

```typescript
// SocialMediaPage
const onPickPlatform = (tabId: string, platform: Platform) => {
  // Actualiza el tab: url = platform.url, title = platform.name, icon = platform.id
  // Asigna partition per platform para session isolation
}
```

### Cerrar tab

```typescript
// BrowserTabBar
<button onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id) }}>
  <X />
</button>
```

Al cerrar: `window.api.browser.destroy(tabId)` para limpiar el WebContentsView.

---

## Plataformas soportadas

```typescript
export const platforms: Platform[] = [
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: SiWhatsapp },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', icon: SiInstagram },
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com', icon: SiFacebook },
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com', icon: SiTiktok },
  { id: 'telegram', name: 'Telegram', url: 'https://web.telegram.org', icon: SiTelegram },
  { id: 'twitter', name: 'X / Twitter', url: 'https://x.com', icon: SiX },
]
```

Icons: `react-icons/si` (Simple Icons).

---

## BrowserView Lifecycle

```typescript
// 1. Create on mount
useEffect(() => {
  window.api.browser.create(id, url, partition, platformId)

  const unsubLoad = window.api.browser.onDidLoad((loadedId) => { ... })
  const unsubFail = window.api.browser.onDidFail((failedId, code, desc) => { ... })

  return () => {
    cancelAnimationFrame(rafRef.current)
    unsubLoad()
    unsubFail()
    window.api.browser.destroy(id)
  }
}, [url, partition, platformId])

// 2. Show/Hide based on isActive
useEffect(() => {
  if (isActive) {
    rafRef.current = requestAnimationFrame(() => {
      const bounds = getBounds()
      if (bounds) window.api.browser.show(id, bounds)
    })
  } else {
    window.api.browser.hide(id)
  }
}, [isActive, loaded, url, getBounds])

// 3. ResizeObserver for positioning
useEffect(() => {
  const observer = new ResizeObserver(() => {
    const bounds = getBounds()
    if (bounds) window.api.browser.position(id, bounds)
  })
  if (containerRef.current) observer.observe(containerRef.current)
  return () => observer.disconnect()
}, [loaded, isActive, url, getBounds])
```

---

## Session Isolation

Cada plataforma usa `partition` separado:

```
partition: 'persist:whatsapp'   ← cookies/localStorage separados
partition: 'persist:instagram'
partition: 'persist:facebook'
...
```

Esto permite tener WhatsApp e Instagram abiertos simultaneamente con sesiones independientes.

---

## BrowserNavBar

### API

```typescript
interface BrowserNavBarProps {
  viewId: string | null
  hasUrl: boolean
  canForwardHome: boolean
  onGoHome: () => void
  onGoForwardHome: () => void
}
```

### Nav state

```typescript
const refreshNavState = useCallback(async () => {
  if (!viewId || !hasUrl) {
    setCanGoBack(false)
    setCanGoForward(false)
    return
  }
  const [back, forward] = await Promise.all([
    window.api.browser.canGoBack(viewId),
    window.api.browser.canGoForward(viewId),
  ])
  setCanGoBack(back)
  setCanGoForward(forward)
}, [viewId, hasUrl])
```

### Back behavior

```typescript
const handleBack = async () => {
  if (hasUrl) {
    const back = await window.api.browser.canGoBack(viewId)
    if (back) {
      window.api.browser.goBack(viewId)
      setTimeout(refreshNavState, 150)
    } else {
      onGoHome()  // ← vuelve al platform picker
    }
  }
}
```

### Forward behavior

```typescript
const handleForward = async () => {
  if (hasUrl) {
    // Forward within WebContentsView
    if (canGoForward) {
      window.api.browser.goForward(viewId)
      setTimeout(refreshNavState, 150)
    }
  } else if (canForwardHome) {
    // Forward from home → restore previous page
    onGoForwardHome()
  }
}
```

---

## Loading / Error States

```typescript
// Loading spinner
{!loaded && !error && (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full border-2 border-muted border-t-primary" />
    <span>Loading...</span>
  </div>
)}

// Error con retry
{error && (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
    <span>{error}</span>
    <button onClick={() => {
      setError(null); setLoaded(false)
      window.api.browser.destroy(viewId)
    }}>Retry</button>
  </div>
)}
```

---

## Window.api.browser Type Declaration

```typescript
declare global {
  interface Window {
    api: {
      browser: {
        create: (id: string, url: string, partition: string, platformId: string) => Promise<void>
        show: (id: string, bounds: { x: number; y: number; width: number; height: number }) => void
        hide: (id: string) => void
        position: (id: string, bounds: { x: number; y: number; width: number; height: number }) => void
        destroy: (id: string) => void
        css: (id: string, css: string) => void
        onDidLoad: (callback: (id: string) => void) => () => void
        onDidFail: (callback: (id: string, code: number, desc: string) => void) => () => void
        canGoBack: (id: string) => Promise<boolean>
        canGoForward: (id: string) => Promise<boolean>
        goBack: (id: string) => void
        goForward: (id: string) => void
        reload: (id: string) => void
      }
    }
  }
}
```

---

## BusinessPage Integration

```typescript
// apps/desktop/src/renderer/components/business/business-page.tsx
if (featureId === 'redes' && tabs && activeTabId && onPickPlatform) {
  return (
    <SocialMediaPage
      tabs={tabs}
      activeTabId={activeTabId}
      onPickPlatform={onPickPlatform}
    />
  )
}
```

El routing `{bizId}:redes` renderiza SocialMediaPage. Los tabs y handlers se gestionan en App.tsx.
