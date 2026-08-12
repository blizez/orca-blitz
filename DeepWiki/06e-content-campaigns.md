# 06e — Content & Campaigns Pages

## Ubicacion

```
apps/desktop/src/renderer/components/business/
├── content-page.tsx       ← CRUD de posts (251 lineas)
├── campaigns-page.tsx     ← CRUD de campanas (265 lineas)
└── business-page.tsx      ← Router por feature (37 lineas)
```

---

## Data Models

### ContentItem

```typescript
interface ContentItem {
  id: string          // `content-${Date.now()}`
  title: string
  channel: string     // 'WhatsApp' | 'Instagram' | ...
  status: 'draft' | 'scheduled' | 'published'
  date: string        // publish date
  body: string        // post content
}
```

### Campaign

```typescript
interface Campaign {
  id: string          // `campaign-${Date.now()}`
  name: string
  channel: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  startDate: string
  endDate: string
  description: string
}
```

---

## Status Enums

### Content Status

```typescript
const statusConfig: Record<ContentItem['status'], { label: string; dot: string }> = {
  draft:     { label: 'Draft',     dot: 'bg-muted-foreground/40' },
  scheduled: { label: 'Scheduled', dot: 'bg-yellow-500' },
  published: { label: 'Published', dot: 'bg-green-500' },
}
```

### Campaign Status

```typescript
const statusConfig: Record<Campaign['status'], { label: string; dot: string }> = {
  draft:     { label: 'Draft',     dot: 'bg-muted-foreground/40' },
  active:    { label: 'Active',    dot: 'bg-green-500' },
  paused:    { label: 'Paused',    dot: 'bg-yellow-500' },
  completed: { label: 'Completed', dot: 'bg-blue-500' },
}
```

### Color coding

| Status | Dot color | Text color |
|--------|-----------|------------|
| Draft | `bg-muted-foreground/40` | `text-muted-foreground` |
| Scheduled / Paused | `bg-yellow-500` | `text-yellow-500` |
| Published / Active | `bg-green-500` | `text-green-500` |
| Completed | `bg-blue-500` | `text-blue-500` |

---

## Persistence

### Storage keys

```typescript
// content-page.tsx
const storageKey = (businessId: string) => `orca-business-content-${businessId}`

// campaigns-page.tsx
const storageKey = (businessId: string) => `orca-business-campaigns-${businessId}`
```

### Read on init

```typescript
const [items, setItems] = useState<ContentItem[]>(() => {
  try {
    const saved = localStorage.getItem(storageKey(businessId))
    return saved ? (JSON.parse(saved) as ContentItem[]) : []
  } catch {
    return []
  }
})
```

### Write on change

```typescript
useEffect(() => {
  localStorage.setItem(storageKey(businessId), JSON.stringify(items))
}, [businessId, items])
```

**Patron identico en ambos pages:** useState initializer lee de localStorage, useEffect sincroniza.

---

## Channel Options

Ambas pages comparten las mismas opciones:

```typescript
const channelOptions = [
  'WhatsApp', 'Instagram', 'Facebook', 'TikTok',
  'Telegram', 'X / Twitter', 'LinkedIn', 'Email',
]
```

---

## CRUD Operations

### Content — Create

```typescript
const handleSubmit = () => {
  if (!form.title.trim()) return
  setItems((prev) => [
    { id: `content-${Date.now()}`, ...form, title: form.title.trim() },
    ...prev,  // ← prepend (newest first)
  ])
  setForm(emptyForm)
  setShowForm(false)
}
```

### Content — Delete

```typescript
const handleDelete = (id: string) => {
  setItems((prev) => prev.filter((item) => item.id !== id))
}
```

### Campaign — Create

```typescript
const handleSubmit = () => {
  if (!form.name.trim()) return
  setItems((prev) => [
    { id: `campaign-${Date.now()}`, ...form, name: form.name.trim() },
    ...prev,
  ])
  setForm(emptyForm)
  setShowForm(false)
}
```

### Campaign — Delete

```typescript
const handleDelete = (id: string) => {
  setItems((prev) => prev.filter((campaign) => campaign.id !== id))
}
```

---

## Sorting

```typescript
// Content: sort by date descending
const sorted = useMemo(
  () => [...items].sort((a, b) => (a.date < b.date ? 1 : -1)),
  [items]
)

// Campaigns: sort by startDate descending
const sorted = useMemo(
  () => [...items].sort((a, b) => (a.startDate < b.startDate ? 1 : -1)),
  [items]
)
```

---

## Empty State

Ambas pages usan el componente `Empty` de `@orca-blitz/ui`:

```typescript
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <PenLine />     {/* Content */}
      <Megaphone />   {/* Campaigns */}
    </EmptyMedia>
    <EmptyTitle>No content yet</EmptyTitle>
    <EmptyDescription>
      Create your first post to start building your content pipeline.
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button onClick={() => setShowForm(true)}>
      <Plus /> Create your first post
    </Button>
  </EmptyContent>
</Empty>
```

---

## Custom Modal (Form)

Ambas pages usan modal custom (no Dialog de shadcn):

```typescript
{showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="fixed inset-0 bg-black/50" onClick={() => setShowForm(false)} />
    <div className="relative z-50 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
      {/* Header with title + close X */}
      {/* Form fields */}
      {/* Cancel + Save buttons */}
    </div>
  </div>
)}
```

### Content form fields

- Title (input text)
- Channel (select)
- Status (select)
- Publish date (input date)
- Content (textarea)

### Campaign form fields

- Name (input text)
- Channel (select)
- Status (select)
- Start date (input date)
- End date (input date)
- Description (textarea)

---

## Campaign Date Range

```typescript
const dateRange = (campaign: Campaign) => {
  if (!campaign.startDate && !campaign.endDate) return null
  return `${campaign.startDate || 'TBD'} → ${campaign.endDate || 'TBD'}`
}
```

---

## BusinessPage Router

```typescript
// apps/desktop/src/renderer/components/business/business-page.tsx
export function BusinessPage({ page, tabs, activeTabId, onPickPlatform }: BusinessPageProps) {
  const parts = page.split(':')
  const businessId = parts[0]
  const featureId = parts[1]

  if (featureId === 'redes')    return <SocialMediaPage ... />
  if (featureId === 'content')  return <ContentPage businessId={businessId} />
  if (featureId === 'campaigns') return <CampaignsPage businessId={businessId} />

  return <div />
}
```

Routing: `{businessId}:{featureId}` → featureId determina el componente.

---

## Layout comun

```
<div className="h-full overflow-y-auto scrollbar-sleek">
  <div className="mx-auto max-w-4xl space-y-6 p-6">
    <Header>                     ← title + description + New button
    {sorted.length === 0
      ? <Empty>                  ← empty state con CTA
      : <Grid>                   ← content: grid cols 2, campaigns: stack
          {sorted.map(item => <Card />)}
        </Grid>
    }
  </div>
  {showForm && <Modal />}        ← form modal overlay
</div>
```
