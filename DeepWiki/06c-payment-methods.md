# 06c — Payment Methods Component

## Ubicacion

```
apps/desktop/src/renderer/components/settings/pages/billing.tsx (247 lineas)
```

---

## Interfaz

```typescript
interface PaymentMethod {
  id: string
  name: string
  value: string        // Account, phone, email, wallet
  qrImage: string      // base64 data URL
}

// Default methods (no se pueden eliminar)
const defaultMethods: PaymentMethod[] = [
  { id: 'paypal', name: 'PayPal', value: '', qrImage: '' },
  { id: 'binance', name: 'Binance Pay', value: '', qrImage: '' },
]
```

---

## State

```typescript
const [methods, setMethods] = useState<PaymentMethod[]>(defaultMethods)
const [open, setOpen] = useState(false)              // Add dialog
const [newName, setNewName] = useState('')            // Add form
const [newValue, setNewValue] = useState('')          // Add form
const [expandedId, setExpandedId] = useState<string | null>(null)  // Solo uno expandido
const [editingNameId, setEditingNameId] = useState<string | null>(null)
const [editingValueId, setEditingValueId] = useState<string | null>(null)
const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)
const [deleteConfirm, setDeleteConfirm] = useState('')
```

---

## Patron Accordion

Usa `Collapsible` de Base UI en lugar de `Accordion`:

```typescript
<Collapsible
  open={expandedId === method.id}
  onOpenChange={(o) => setExpandedId(o ? method.id : null)}
>
  <div className="rounded-lg border border-border bg-muted/30">
    <div className="flex items-center justify-between p-4">
      {/* Header */}
      <CollapsibleTrigger render={<Button variant="ghost" size="icon-xs" />}>
        <ChevronRight className={cn("size-4 transition-transform", expandedId === method.id && "rotate-90")} />
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent>
      {/* Contenido: nombre, cuenta, QR upload, save */}
    </CollapsibleContent>
  </div>
</Collapsible>
```

**Regla:** Solo un metodo expandido a la vez (`expandedId: string | null`).

---

## Metodos default vs custom

```typescript
const isDefault = (id: string) => defaultMethods.some((d) => d.id === id)
```

| Tipo | Nombre editable | Account editable | Deleteable |
|------|----------------|-----------------|------------|
| Default (PayPal, Binance) | No | Si | No |
| Custom | Si | Si | Si |

---

## CRUD

### Add

```typescript
const handleAdd = () => {
  if (!newName.trim() || !newValue.trim()) return
  setMethods([...methods, {
    id: Date.now().toString(),
    name: newName.trim(),
    value: newValue.trim(),
    qrImage: '',
  }])
  setOpen(false)
}
```

Dialog con Name + Account/Number.

### Delete

```typescript
const handleDelete = (id: string) => {
  setMethods(methods.filter((m) => m.id !== id))
}
```

Requiere escribir el nombre exacto en confirmation dialog.

### Save (por metodo)

```typescript
// Save button dentro de cada CollapsibleContent
<Button onClick={() => {
  const name = editingNameId === method.id && newName.trim() ? newName.trim() : method.name
  const value = editingValueId === method.id && newValue.trim() ? newValue.trim() : method.value
  setMethods(methods.map((m) => m.id === method.id ? { ...m, name, value } : m))
  setEditingNameId(null)
  setEditingValueId(null)
  setExpandedId(null)
}}>
  Save
</Button>
```

---

## QR Code Upload

```typescript
const handleImageUpload = (methodId: string, file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string  // base64 data URL
    setMethods(methods.map((m) =>
      m.id === methodId ? { ...m, qrImage: result } : m
    ))
  }
  reader.readAsDataURL(file)  // ← base64 storage
}
```

UI: `<input type="file" accept="image/*">` oculto + `<label>` estilizado con Upload icon.

Si ya hay QR: imagen preview 128x128 + boton X para remover.

```typescript
const handleRemoveImage = (methodId: string) => {
  setMethods(methods.map((m) =>
    m.id === methodId ? { ...m, qrImage: '' } : m
  ))
}
```

---

## Delete Confirmation Dialog

```typescript
<Dialog open={!!deleteTarget} onOpenChange={...}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Payment Method</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete <span className="font-medium">{deleteTarget?.name}</span>?
      </DialogDescription>
    </DialogHeader>

    <label>Type <span className="font-medium">{deleteTarget?.name}</span> to confirm</label>
    <Input
      value={deleteConfirm}
      onChange={(e) => setDeleteConfirm(e.target.value)}
      placeholder={deleteTarget?.name}
    />

    <Button
      variant="destructive"
      disabled={deleteConfirm !== deleteTarget?.name}  // ← must match exactly
      onClick={() => { handleDelete(deleteTarget.id) }}
    >
      Delete
    </Button>
  </DialogContent>
</Dialog>
```

---

## Layout de cada metodo

```
Collapsible
├── Header row
│   ├── CreditCard icon (8x8, rounded-md bg-background)
│   ├── Name + value text
│   ├── Trash2 button (si no es default)
│   └── ChevronRight trigger (rotate-90 when expanded)
└── CollapsibleContent (border-t)
    ├── Name field (si custom)
    ├── Account/Number field
    └── Bottom row
        ├── QR Code upload/preview (128x128)
        └── Save button
```

---

## Dependencias

| Componente | Paquete |
|------------|---------|
| `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | `@orca-blitz/ui` (Base UI) |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | `@orca-blitz/ui` |
| `Button`, `Input`, `Field`, `FieldLabel`, `FieldContent` | `@orca-blitz/ui` |
| `cn` | `../../lib/utils` |
| `Plus`, `Trash2`, `CreditCard`, `ChevronRight`, `Upload`, `X` | `lucide-react` |
