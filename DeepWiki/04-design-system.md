# 04 — Design System

## Ubicacion

```
packages/ui/src/
├── components/ui/    ← 62 componentes + SVG icons
│   └── svgs/         ← Brand icons (SVG React components)
├── globals.css       ← Tokens CSS
├── lib/utils.ts      ← cn()
└── hooks/            ← useIsMobile
```

---

## SVG Brand Icons

Ubicados en `packages/ui/src/components/ui/svgs/`. Cada icono es un componente React funcional que acepta `SVGProps<SVGSVGElement>`:

```typescript
// packages/ui/src/components/ui/svgs/whatsapp.tsx
import type { SVGProps } from "react";

const WhatsApp = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill="#25D366" d="M17.472 14.382c..." />
  </svg>
);

export { WhatsApp };
```

### Iconos disponibles

| Icono | Archivo | Uso |
|-------|---------|-----|
| `WhatsApp` | `whatsapp.tsx` | Integracion mensajeria |
| `Instagram` | `instagram.tsx` | Integracion redes sociales |
| `Gmail` | `gmail.tsx` | Integracion correo |
| `Slack` | `slack.tsx` | Integracion equipo |

### Export centralizado

```typescript
// packages/ui/src/components/ui/svgs/index.ts
export { Gmail } from './gmail'
export { Instagram } from './instagram'
export { Slack } from './slack'
export { WhatsApp } from './whatsapp'
// + iconos de proveedores AI existentes (OpenAI, Anthropic, Google, etc.)
```

### Uso en settings

```typescript
import { WhatsApp, Instagram, Gmail, Slack } from '@orca-blitz/ui/components/ui/svgs'

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  WhatsApp, Instagram, Gmail, Slack,
}
```

---

## Tokens CSS

### Light Mode

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --popover: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
  --secondary: oklch(0.97 0 0);
  --muted: oklch(0.97 0 0);
  --accent: oklch(0.97 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --sidebar: oklch(0.985 0 0);
}
```

### Dark Mode

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --popover: oklch(0.205 0 0);
  --primary: oklch(0.922 0 0);
  --secondary: oklch(0.269 0 0);
  --muted: oklch(0.269 0 0);
  --accent: oklch(0.269 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --sidebar: oklch(0.205 0 0);
}
```

### Tailwind Theme

```css
@theme inline {
  --font-sans: 'Geist Variable', sans-serif;
  --radius: 0.625rem;
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}
```

---

## Dark Mode Strategy

```css
@custom-variant dark (&:is(.dark *));
```

Class-based. Agregar `.dark` en `<html>` activa dark mode.

---

## 62 Componentes

### Forms
`button` `input` `textarea` `select` `native-select` `checkbox` `radio-group` `switch` `slider` `combobox` `input-otp` `input-group` `field`

### Layout
`sidebar` `tabs` `resizable` `separator` `scroll-area` `collapsible`

### Overlays
`dialog` `sheet` `drawer` `popover` `hover-card` `tooltip` `context-menu` `dropdown-menu` `menubar`

### Data
`table` `card` `badge` `avatar` `skeleton` `progress` `chart`

### Feedback
`toast` `alert` `alert-dialog` `spinner`

### Navigation
`breadcrumb` `pagination` `navigation-menu` `command`

### Chat
`message` `message-scroller` `bubble` `attachment`

### Specialized
`accordion` `carousel` `calendar` `questionnaire` `item` `marker` `empty` `direction` `kbd` `label` `toggle` `toggle-group` `aspect-ratio` `button-group` `logo`

---

## Patron de Componente

```typescript
import { Primitive } from "@base-ui/react/primitive"
import { cn } from "@/lib/utils"

function Component({ className, ...props }) {
  return (
    <Primitive
      data-slot="component"
      className={cn("base-styles", className)}
      {...props}
    />
  )
}
```

- `data-slot` para CSS targeting
- `cn()` para class merging
- Tokens semanticos (nunca hex hardcodeado)

---

## Payment Methods — Accordion Pattern

`billing.tsx` usa `Collapsible` (Base UI) en lugar de `Accordion` para expandir/metodos de pago:

```typescript
// apps/desktop/src/renderer/components/settings/pages/billing.tsx
<Collapsible open={expandedId === method.id} onOpenChange={(o) => setExpandedId(o ? method.id : null)}>
  <div className="rounded-lg border border-border bg-muted/30">
    <div className="flex items-center justify-between p-4">
      {/* Header: icono + nombre + value */}
      <CollapsibleTrigger render={<Button variant="ghost" size="icon-xs" />}>
        <ChevronRight className={cn("size-4 transition-transform", expandedId === method.id && "rotate-90")} />
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent>
      {/* Contenido expandible: nombre, cuenta, QR upload */}
    </CollapsibleContent>
  </div>
</Collapsible>
```

**Patron:**
- Solo un metodo expandido a la vez (`expandedId: string | null`)
- Metodos default (PayPal, Binance) no se pueden eliminar
- QR upload: `<input type="file" accept="image/*">` oculto + `<label>` estilizado
- Delete con confirmation dialog (requiere escribir el nombre exacto)

---

## Business Settings — Inline Edit Pattern

`business-settings.tsx` implementa edicion inline para nombre y descripcion:

```typescript
// Campo con edit/save/cancel
{editingName ? (
  <div className="flex items-center gap-1.5">
    <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus
      onKeyDown={(e) => {
        if (e.key === 'Enter') saveName()
        if (e.key === 'Escape') { setEditingName(false); setNameDraft(data.name) }
      }}
    />
    <Button variant="ghost" size="icon-xs" onClick={saveName}><Check /></Button>
    <Button variant="ghost" size="icon-xs" onClick={cancel}><X /></Button>
  </div>
) : (
  <h3>{data.name}</h3>
  <Button variant="ghost" size="icon-xs" onClick={() => setEditingName(true)}><Pencil /></Button>
)}
```

**Componentes shadcn usados:**
- `Field`, `FieldLabel`, `FieldContent` — layout de formulario
- `Input`, `Textarea` — campos editables
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` — dropdowns
- `Badge` — canales y goals (read-only)
- `Button` — acciones

**Delete flow:** Click Trash2 → `DeleteBusinessModal` (requiere escribir nombre para confirmar)

---

## Modals — backdrop-blur-sm

Todos los modales modales ahora usan `backdrop-blur-sm` en el overlay:

```typescript
// apps/desktop/src/renderer/components/layout/add-business-modal.tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
```

Patron consistente: overlay semi-transparente + blur backdrop + dialog centrado.
