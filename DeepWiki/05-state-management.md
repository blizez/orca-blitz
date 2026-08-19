# 05 — State Management

## Estado Actual

| Mecanismo | Uso | Persistencia |
|-----------|-----|-------------|
| React Context | Theme (light/dark/system) | localStorage |
| useState + useEffect | Negocios | localStorage |
| useState | Titular maximizado | IPC events |
| useState | activePage, sidebarOpen | En memoria |

No hay Zustand, TanStack Query, ni otro state manager.

---

## ThemeContext

```typescript
// apps/desktop/src/renderer/lib/theme-context.tsx
const ThemeContext = createContext<ThemeContextProps | null>(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('orca-theme') as Theme) || 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'system') return getSystemTheme()
    return theme
  })

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('orca-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

---

## Business State

```typescript
// apps/desktop/src/renderer/components/layout/app-sidebar.tsx
const [businesses, setBusinesses] = useState<Business[]>(() => {
  const saved = localStorage.getItem('orca-businesses')
  return saved ? JSON.parse(saved) : []
})

useEffect(() => {
  localStorage.setItem('orca-businesses', JSON.stringify(businesses))
}, [businesses])

interface Business {
  id: string
  name: string
  type: string
  industry: string
  description: string
  website: string
  products: string
  audience: string
  competitors: string
  usp: string
  painPoints: string
  monthlyRevenue: string
  yearEstablished: string
  channels: string[]
  goals: string[]
  teamSize: string
}
```

---

## Window State

```typescript
// apps/desktop/src/renderer/components/layout/titlebar.tsx
const [isMaximized, setIsMaximized] = useState(false)

useEffect(() => {
  window.api.window.isMaximized().then(setIsMaximized)
  const unsub = window.api.window.onMaximized(setIsMaximized)
  return unsub
}, [])
```

---

## Page Navigation

```typescript
// apps/desktop/src/renderer/App.tsx
const [activePage, setActivePage] = useState('home')
const [sidebarOpen, setSidebarOpen] = useState(true)
```

Sin react-router. Navegacion por estado.
