# 06f — Business Sidebar Behavior

## Ubicacion

```
apps/desktop/src/renderer/components/layout/
├── app-sidebar.tsx     ← Sidebar container + state
└── business-item.tsx   ← Business item + expand/collapse
```

---

## State: Multiple Expanded Businesses

```typescript
// apps/desktop/src/renderer/components/layout/app-sidebar.tsx
const [expandedBiz, setExpandedBiz] = useState<string[]>([])

const handleToggleBusiness = (id: string) => {
  setExpandedBiz((prev) =>
    prev.includes(id)
      ? prev.filter((i) => i !== id)   // ← collapse
      : [...prev, id]                   // ← expand (append, no reemplaza)
  )
}
```

**Key behavior:** Multiples negocios pueden estar expandidos simultaneamente. El state es un `string[]`, no un `string | null`.

---

## BusinessItem Props

```typescript
interface BusinessItemProps {
  business: Business
  isActive: boolean       // activePage.startsWith(biz.id)
  expanded: boolean       // expandedBiz.includes(biz.id)
  activePage: string      // para detectar sub-feature activa
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onBusinessSettings?: (business: Business) => void
}
```

---

## Click Behavior

### Click on business name → expand/collapse only

```typescript
<div
  className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer"
  onClick={() => onToggle(business.id)}  // ← solo toggle, NO navega
>
  <Store />
  <span>{business.name}</span>
  <button onClick={(e) => { e.stopPropagation(); onToggle(business.id) }}>
    {expanded ? <ChevronDown /> : <ChevronRight />}
  </button>
  <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}>
    <MoreHorizontal />
  </button>
</div>
```

### Click on sub-feature → navigate

```typescript
businessFeatures.map((feature) => {
  const featureActive = activePage === `${business.id}:${feature.id}`
  return (
    <button
      onClick={() => onSelect(`${business.id}:${feature.id}`)}  // ← navega
      className={cn(
        featureActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50'
      )}
    >
      {feature.label}
    </button>
  )
})
```

---

## Sub-features

```typescript
const businessFeatures = [
  { id: 'redes',    label: 'Social Media' },
  { id: 'content',  label: 'Content' },
  { id: 'campaigns', label: 'Campaigns' },
]
```

Active state: `activePage === '{bizId}:{featureId}'` → `bg-sidebar-accent font-medium`.

---

## CSS Transitions

### Expand/Collapse

```typescript
<ul className={cn(
  'relative mt-0.5 space-y-0.5 pl-4 ml-2 overflow-hidden transition-all duration-200',
  expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0',
  'before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-sidebar-border'
)}>
```

| Property     | Collapsed                     | Expanded                      |
| ------------ | ----------------------------- | ----------------------------- |
| `max-h`      | `max-h-0`                     | `max-h-40` (10rem)            |
| `opacity`    | `opacity-0`                   | `opacity-100`                 |
| `transition` | `transition-all duration-200` | `transition-all duration-200` |

### Border highlight

```typescript
<div className={cn(
  'rounded-md p-1 transition-colors',
  expanded ? 'border border-sidebar-border' : 'border border-transparent'
)}>
```

---

## Context Menu

```typescript
const [showMenu, setShowMenu] = useState(false)

// Click outside to close
useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setShowMenu(false)
    }
  }
  if (showMenu) document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [showMenu])
```

### Menu items

| Item              | Icon       | Accion                           |
| ----------------- | ---------- | -------------------------------- |
| Business Settings | `Settings` | `onBusinessSettings?.(business)` |
| Change Icon       | `Image`    | Placeholder (no-op)              |
| Delete Business   | `Trash2`   | `onDelete(business.id)`          |

```typescript
{showMenu && (
  <div className="absolute right-0 top-full z-50 mt-1 w-[180px] rounded-lg border border-border bg-popover p-1 shadow-md">
    <button onClick={() => { onBusinessSettings?.(business) }}>
      <Settings /> Business Settings
    </button>
    <button onClick={() => setShowMenu(false)}>
      <Image /> Change Icon
    </button>
    <div className="my-1 h-px bg-border" />
    <button onClick={() => { onDelete(business.id) }} className="text-destructive">
      <Trash2 /> Delete Business
    </button>
  </div>
)}
```

---

## AppSidebar Props

```typescript
interface AppSidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
  businesses: Business[]
  onBusinessesChange: (businesses: Business[]) => void
  onBusinessSettings: (business: Business) => void
}
```

---

## Sidebar Layout

```
<aside className={collapsed ? 'w-[52px]' : 'w-[220px]'}>
  <Header>
    <OrcaLogo />
    <PanelLeftOpen/PanelLeftClose />  ← toggle collapse
  </Header>

  <nav>
    <Section "Businesses">
      <Plus />  ← AddBusinessModal trigger
      {businesses.length === 0 && <p>No businesses yet</p>}
      {businesses.map(biz => <BusinessItem />)}
    </Section>
  </nav>

  <Footer>
    <Settings />  ← navigate to settings
    <HelpMenu />
  </Footer>

  <AddBusinessModal />
  <DeleteBusinessModal />
</aside>
```

---

## Collapsed Mode

| Elemento        | Expanded                       | Collapsed              |
| --------------- | ------------------------------ | ---------------------- |
| Width           | `w-[220px]`                    | `w-[52px]`             |
| Business list   | `<ul>` visible                 | Oculto                 |
| Add button      | `<Plus>` inline                | Tooltip "Add Business" |
| Settings button | `<Settings>` + "Settings" text | Icon only + tooltip    |
| Section label   | "Businesses" text              | Oculto                 |

---

## Delete Flow

```typescript
const handleDeleteBusiness = (id: string) => {
  const biz = businesses.find((b) => b.id === id)
  if (biz) setDeleteTarget(biz)  // ← abre modal
}

const confirmDelete = () => {
  if (!deleteTarget) return
  onBusinessesChange(businesses.filter((b) => b.id !== deleteTarget.id))
  if (activePage === `business-${deleteTarget.id}`) {
    onNavigate('home')  // ← vuelve a home si estaba en ese negocio
  }
  setDeleteTarget(null)
}
```

---

## Business Routing

```typescript
// AppSidebar onClick
onSelect={(id) => onNavigate(id)}

// BusinessItem sub-feature
onClick={() => onSelect(`${business.id}:${feature.id}`)}
// → onNavigate('abc123:redes')
// → activePage = 'abc123:redes'
// → BusinessPage renders SocialMediaPage
```

Formato de ruta: `{businessId}:{featureId}`

| Feature      | Ruta                | Componente      |
| ------------ | ------------------- | --------------- |
| Social Media | `{bizId}:redes`     | SocialMediaPage |
| Content      | `{bizId}:content`   | ContentPage     |
| Campaigns    | `{bizId}:campaigns` | CampaignsPage   |
