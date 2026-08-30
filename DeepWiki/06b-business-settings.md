# 06b — Business Settings Component

## Ubicacion

```
apps/desktop/src/renderer/components/settings/pages/business-settings.tsx
```

---

## Interfaz

```typescript
interface BusinessData {
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

interface BusinessSettingsProps {
  business: BusinessData
  onUpdate: (id: string, data: Partial<BusinessData>) => void
  onDelete: (id: string) => void
}
```

---

## Patron de edicion inline

### Nombre (Input con Enter/Escape)

```typescript
{editingName ? (
  <div className="flex items-center gap-1.5">
    <Input
      value={nameDraft}
      onChange={(e) => setNameDraft(e.target.value)}
      className="h-8 w-64 text-lg font-medium"
      autoFocus
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

### Descripcion (Edit button con save/cancel)

```typescript
{!editingDesc ? (
  <Button variant="ghost" size="xs" onClick={() => { setEditingDesc(true); setDescDraft(data.description) }}>
    <Pencil /> Edit
  </Button>
) : (
  <div className="flex items-center gap-1">
    <Button variant="ghost" size="icon-xs" onClick={cancel}><X /></Button>
    <Button variant="ghost" size="icon-xs" onClick={saveDescription}><Check /></Button>
  </div>
)}
```

Textarea cambia `readOnly` y `disabled` segun estado:

```typescript
<Textarea
  value={editingDesc ? descDraft : data.description}
  readOnly={!editingDesc}
  disabled={!editingDesc}
/>
```

---

## Secciones

| Seccion             | Campos                                                                                                             | Componentes             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| Header              | name (inline edit), delete button                                                                                  | Input, Button, Trash2   |
| About this business | type (Select), industry (Input), teamSize (Select), description (Textarea inline)                                  | Select, Input, Textarea |
| Market              | products (Input), audience (Input), website (Input), competitors (Textarea), usp (Textarea), painPoints (Textarea) | Input, Textarea         |
| Financial           | monthlyRevenue (Select), yearEstablished (Input)                                                                   | Select, Input           |
| Channels            | channels[] (Badge read-only)                                                                                       | Badge                   |
| Goals               | goals[] (Badge read-only)                                                                                          | Badge                   |

---

## Select options

```typescript
const businessTypes = [
  'E-commerce', 'Restaurant', 'Services', 'Retail', 'Healthcare',
  'Education', 'Real Estate', 'SaaS', 'Other',
]

const teamSizes = ['Just me', '2-5', '6-10', '11-50', '50+']

const revenueRanges = [
  'Under $10k', '$10k - $50k', '$50k - $100k',
  '$100k - $500k', '$500k - $1M', 'Over $1M', 'Pre-revenue',
]
```

---

## Update flow

```typescript
const update = (field: keyof BusinessData, value: string | string[]) => {
  const next = { ...data, [field]: value }
  setData(next)                          // Local state
  onUpdate(business.id, { [field]: value })  // Parent callback → App.tsx
}
```

Parent (`App.tsx`) propaga a `setBusinesses()` → `useEffect` → localStorage.

---

## Delete flow

```typescript
const [showDelete, setShowDelete] = useState(false)

// Click Trash2
<Button onClick={() => setShowDelete(true)}>
  <Trash2 />
</Button>

// DeleteBusinessModal
<DeleteBusinessModal
  open={showDelete}
  businessName={business.name}
  onClose={() => setShowDelete(false)}
  onConfirm={() => onDelete(business.id)}
/>
```

Requiere escribir el nombre exacto del negocio para confirmar.

---

## Componentes shadcn usados

| Componente                                                              | Paquete          | Uso                                         |
| ----------------------------------------------------------------------- | ---------------- | ------------------------------------------- |
| `Field`, `FieldLabel`, `FieldContent`                                   | `@orca-blitz/ui` | Layout de formulario                        |
| `Input`                                                                 | `@orca-blitz/ui` | Campos de texto                             |
| `Textarea`                                                              | `@orca-blitz/ui` | Descripcion, competidores, USP, pain points |
| `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` | `@orca-blitz/ui` | Dropdowns (type, teamSize, revenue)         |
| `Badge`                                                                 | `@orca-blitz/ui` | Canales y goals (read-only)                 |
| `Button`                                                                | `@orca-blitz/ui` | Acciones (save, cancel, delete)             |

---

## Layout

```
<div className="space-y-6">
  <Header>                         ← nombre inline + delete
  <div className="rounded-lg border border-border bg-muted/30 p-5">
    <p>About this business</p>
    <Grid cols={2}>                ← type + industry
    <Field> teamSize </Field>
    <Field> description </Field>   ← inline edit
    <Grid cols={2}>                ← products + audience
    <Field> website </Field>
    <Field> competitors </Field>
    <Field> usp </Field>
    <Field> painPoints </Field>
    <Grid cols={2}>                ← revenue + year
    <Field> channels (Badge) </Field>
    <Field> goals (Badge) </Field>
  </div>
  <DeleteBusinessModal />
</div>
```
