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

## Sidebar (723 lineas)

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

## AddBusinessModal (330 lineas)

Cuestionario de 4 pasos con:

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
