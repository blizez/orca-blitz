# 06 — Components

## Patron Base UI

Todos los componentes usan primitives de `@base-ui/react`:

```typescript
import { SomePrimitive } from "@base-ui/react/some-primitive"
import { cn } from "@/lib/utils"

function MyComponent({ className, ...props }) {
  return (
    <SomePrimitive
      data-slot="my-component"
      className={cn("base-styles", className)}
      {...props}
    />
  )
}
```

---

## Button

```typescript
// packages/ui/src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border-border bg-background",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive/10 text-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-2.5",
        sm: "h-7 px-2.5",
        lg: "h-9 px-2.5",
        icon: "size-8",
        "icon-sm": "size-7",
      },
    },
  }
)
```

---

## Select (Base UI)

```typescript
// packages/ui/src/components/ui/select.tsx
const Select = SelectPrimitive.Root

<Select value={language} onValueChange={setLanguage}>
  <SelectTrigger size="sm">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="system">System</SelectItem>
    <SelectItem value="en">English</SelectItem>
  </SelectContent>
</Select>
```

### Estructura interna

```
Select (Root)
├── SelectTrigger (Button)
│   ├── SelectValue
│   └── ChevronDownIcon
└── SelectContent (Portal)
    ├── SelectPositioner
    └── SelectPopup
        ├── SelectScrollUpButton
        ├── SelectList
        │   └── SelectItem[]
        └── SelectScrollDownButton
```

---

## Sidebar

El componente mas grande. Incluye:

```typescript
// packages/ui/src/components/ui/sidebar.tsx
export {
  Sidebar,           // Container principal
  SidebarProvider,   // Context para estado
  SidebarContent,    // Area de contenido
  SidebarHeader,     // Header
  SidebarFooter,     // Footer
  SidebarGroup,      // Grupo de items
  SidebarGroupLabel, // Label del grupo
  SidebarMenu,       // Lista de items
  SidebarMenuItem,   // Cada item
  SidebarMenuButton, // Boton del item
  SidebarTrigger,    // Toggle button
  SidebarRail,       // Rail para drag
  useSidebar,        // Hook para acceder al contexto
}
```

---

## Titlebar Custom

```typescript
// apps/desktop/src/renderer/components/layout/titlebar.tsx
<div style={{ WebkitAppRegion: 'drag' }}>  // Mover ventana
  <OrcaLogo />
  <button onClick={onToggleSidebar}>      // Toggle sidebar
  <button onClick={() => window.api.window.minimize()}>
  <button onClick={() => window.api.window.maximize()}>
  <button onClick={() => window.api.window.close()}>
</div>
```

---

## AddBusinessModal

Cuestionario de 5 pasos con:

```typescript
interface BusinessData {
  name: string
  type: string
  industry: string
  description: string
  products: string
  audience: string
  channels: string[]
  goals: string[]
  teamSize: string
}
```

### Pasos

1. Basics — name, type, industry, description
2. Audience — audience, products, teamSize
3. Channels — multi-select (WhatsApp, Instagram, etc.)
4. Goals — multi-select (Increase Sales, etc.)

---

## DeleteBusinessModal

```typescript
// Requiere escribir el nombre para confirmar
const canDelete = input === businessName

<button disabled={!canDelete}>Delete</button>
```

---

## Settings Pages

### Providers Settings (AI)

Nuevo componente en `apps/desktop/src/renderer/components/settings/pages/providers.tsx`. Muestra tarjetas de proveedores AI con iconos de marca y dialog de configuracion.

```typescript
const providers = [
  { id: 'openai',     name: 'OpenAI',      Icon: Openai,     IconDark: OpenaiDark,     placeholder: 'sk-...' },
  { id: 'anthropic',  name: 'Anthropic',   Icon: AnthropicBlack, IconDark: AnthropicWhite, placeholder: 'sk-ant-...' },
  { id: 'google',     name: 'Google AI',   Icon: Google,     IconDark: Google,         placeholder: 'AI...' },
  { id: 'deepseek',   name: 'DeepSeek',    Icon: Deepseek,   IconDark: Deepseek,       placeholder: 'sk-...' },
  { id: 'ollama',     name: 'Ollama',      Icon: OllamaLight, IconDark: OllamaDark,    placeholder: 'http://localhost:11434' },
]
```

**Caracteristicas:**
- Tarjetas con icono light/dark mode (dual theme support via `<span className="block dark:hidden">`)
- Boton "Configure" abre `Dialog` con `Input` de password para API key
- Registra en `settings-page.tsx` como `ai: ProvidersSettings` (reemplaza al anterior `AISettings`)

### Integrations Settings (actualizado)

Agrega iconos SVG de marca junto a cada integracion:

```typescript
import { WhatsApp, Instagram, Gmail, Slack } from '@orca-blitz/ui/components/ui/svgs'

// Cada tarjeta ahora muestra el icono:
<div className="flex items-center gap-3">
  <Icon className="size-8" />
  <div>
    <p className="text-sm font-medium">{name}</p>
    <p className="text-xs text-muted-foreground">Not connected</p>
  </div>
</div>
```

### Notifications Settings (actualizado)

Reemplaza `<span>` estatico por `Switch` interactivo con estado local:

```typescript
const [desktopNotifications, setDesktopNotifications] = useState(true)
const [sound, setSound] = useState(true)
const [emailDigest, setEmailDigest] = useState(false)

// Cada opcion usa:
<Switch checked={desktopNotifications} onCheckedChange={setDesktopNotifications} />
```

---

## Sound Context

```typescript
// apps/desktop/src/renderer/lib/sound-context.tsx
export function SoundProvider({ children })   // Provider wrapper
export function useSound()                     // Hook: { enabled, volume, toggleEnabled, setVolume, play }
```

- Dependencia: `cuelume ^0.2.2`
- `play(name?: SoundName)` — ejecuta sonido si `enabled`
- Persiste `enabled` y `volume` a localStorage
- Default: `enabled=true`, `volume=0.7`

---

## Business Settings

Pagina de configuracion individual de un negocio con edicion inline.

```typescript
// apps/desktop/src/renderer/components/settings/pages/business-settings.tsx
interface BusinessSettingsProps {
  business: BusinessData
  onUpdate: (id: string, data: Partial<BusinessData>) => void
  onDelete: (id: string) => void
}
```

**Secciones:**
- Header: nombre editable (inline), Trash2 → DeleteBusinessModal
- "About this business": Type (Select), Industry (Input), Team Size (Select), Description (editable Textarea)
- Market: Products, Audience, Website, Competitors (Textarea), USP (Textarea), Pain Points (Textarea)
- Financial: Monthly Revenue (Select), Year Established (Input)
- Active Channels (Badge read-only), Goals (Badge read-only)

**BusinessData interface (extendida):**
```typescript
interface BusinessData {
  id: string; name: string; type: string; industry: string; description: string
  website: string; products: string; audience: string
  competitors: string; usp: string; painPoints: string
  monthlyRevenue: string; yearEstablished: string
  channels: string[]; goals: string[]; teamSize: string
}
```

---

## Billing Settings — Accordion

Reescritura completa. Antes: tarjetas estaticas. Ahora: accordion expandible con CRUD.

```typescript
// apps/desktop/src/renderer/components/settings/pages/billing.tsx
function BillingSettings()
// methods: PaymentMethod[] — estado local
// expandedId: string | null — solo uno expandido a la vez
// defaultMethods: PayPal, Binance Pay (no se pueden eliminar)
```

**Features:**
- `Collapsible` de Base UI para expandir cada metodo
- QR code upload via `<input type="file" accept="image/*">` oculto
- Add method dialog (Name + Account/Number)
- Delete confirmation dialog (requiere escribir nombre exacto)
- Save por metodo (no global)

---

## Add Business Modal — 5 Steps

Wizard de 5 pasos (antes 4). Nuevo paso: **Market**.

```typescript
// apps/desktop/src/renderer/components/layout/add-business-modal.tsx
const steps = [
  { id: 1, title: 'Basics',              description: 'Tell us about your business' },
  { id: 2, title: 'Products & Audience', description: 'What do you sell and to whom?' },
  { id: 3, title: 'Market',              description: 'Competition and positioning' },  // NUEVO
  { id: 4, title: 'Channels',            description: 'Where do you connect?' },
  { id: 5, title: 'Goals',               description: 'What do you want to achieve?' },
]
```

**Step 3 — Market (nuevo):**
- Main Competitors (Textarea)
- What makes you different? USP (Textarea)
- Current Pain Points (Textarea)
- Monthly Revenue (Select: "Under $10k" ... "Over $1M", "Pre-revenue")
- Year Established (Input)

**Usa `useSound()`** para feedback sonoro en submit (`play('success')`) y close (`play('droplet')`).

---

## BusinessItem — Sidebar

Componente de negocio en la sidebar con sub-features expandibles.

```typescript
// apps/desktop/src/renderer/components/layout/business-item.tsx
interface BusinessItemProps {
  business: Business
  isActive: boolean
  expanded: boolean
  activePage: string
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onBusinessSettings?: (business: Business) => void
}
```

**Features:**
- `expanded` controlado desde `AppSidebar` via `expandedBiz: string[]`
- CSS transitions: `max-h-0 opacity-0` → `max-h-40 opacity-100` con `duration-200`
- Border highlight cuando expandido: `border border-sidebar-border` vs `border-transparent`
- Sub-features: Social Media, Content, Campaigns (activos via `activePage === '{bizId}:{feature}'`)
- Context menu: Business Settings, Change Icon, Delete Business

---

## AppSidebar — Multiple Expanded

```typescript
// apps/desktop/src/renderer/components/layout/app-sidebar.tsx
const [expandedBiz, setExpandedBiz] = useState<string[]>([])

const handleToggleBusiness = (id: string) => {
  setExpandedBiz((prev) =>
    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
  )
}
```

**Props actualizadas:**
```typescript
interface AppSidebarProps {
  // ...existentes
  businesses: Business[]           // NUEVO
  onBusinessesChange: (businesses: Business[]) => void  // NUEVO
  onBusinessSettings: (business: Business) => void       // NUEVO
}
```

---

## HomePage — Empty State

Reescritura. Antes: placeholder generico. Ahora: empty state con logo y CTAs.

```typescript
// apps/desktop/src/renderer/components/home/home-page.tsx
<div className="flex h-full items-center justify-center p-6">
  <OrcaLogo className="size-10 text-foreground" />
  <h1>orca-blitz</h1>
  <p>Select a business from the sidebar to get started.</p>
  <Button onClick={() => document.querySelector('[data-add-business]')?.click()}>
    <Plus /> Add Business
  </Button>
  <Button variant="outline"><Upload /> Import Business</Button>
  {/* Keyboard shortcuts: Ctrl+N, Ctrl+I */}
</div>
```

---

## Settings Page — Business Integration

```typescript
// apps/desktop/src/renderer/components/settings/settings-page.tsx
interface SettingsPageProps {
  // ...existentes
  businessId?: string | null        // NUEVO
  business?: BusinessData | null    // NUEVO
  businesses?: BusinessData[]       // NUEVO
  onUpdateBusiness?: (id: string, data: Partial<BusinessData>) => void
  onDeleteBusiness?: (id: string) => void
  onSelectBusiness?: (business: BusinessData) => void
}
```

Cuando `businessId` esta definido y `activeTab === 'business'`, renderiza `BusinessSettings` en vez del page generico.

---

## Settings Sidebar — Businesses List

```typescript
// apps/desktop/src/renderer/components/settings/settings-sidebar.tsx
const businessGroup = businesses.length > 0
  ? [{
      label: 'Businesses',
      items: businesses.map((biz) => ({
        id: businessId === biz.id ? 'business' : `biz-${biz.id}`,
        label: biz.name,
        icon: Store,
        business: biz,
      })),
    }]
  : []

const allGroups = [...settingsGroups, ...businessGroup]
```

Los negocios aparecen como grupo separado en la sidebar de settings. Click en un negocio → `onBusinessSelect(biz)` → cambia a `activeTab: 'business'`.
