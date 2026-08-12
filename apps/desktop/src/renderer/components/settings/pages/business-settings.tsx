import { useState } from 'react'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { Field, FieldLabel, FieldContent } from '@orca-blitz/ui/components/ui/field'
import { Badge } from '@orca-blitz/ui/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@orca-blitz/ui/components/ui/select'
import { DeleteBusinessModal } from '../../layout/delete-business-modal'

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

const businessTypes = [
  'E-commerce', 'Restaurant', 'Services', 'Retail', 'Healthcare',
  'Education', 'Real Estate', 'SaaS', 'Other',
]

const teamSizes = ['Just me', '2-5', '6-10', '11-50', '50+']

export function BusinessSettings({ business, onUpdate, onDelete }: BusinessSettingsProps) {
  const [data, setData] = useState(business)
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft] = useState(business.description)
  const [showDelete, setShowDelete] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(business.name)

  const update = (field: keyof BusinessData, value: string | string[]) => {
    const next = { ...data, [field]: value }
    setData(next)
    onUpdate(business.id, { [field]: value })
  }

  const saveDescription = () => {
    update('description', descDraft)
    setEditingDesc(false)
  }

  const saveName = () => {
    update('name', nameDraft)
    setEditingName(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
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
                <Button variant="ghost" size="icon-xs" onClick={saveName} className="text-primary">
                  <Check className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => { setEditingName(false); setNameDraft(data.name) }} className="text-muted-foreground">
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium">{data.name}</h3>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => { setEditingName(true); setNameDraft(data.name) }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-3" />
                </Button>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">General settings for this business.</p>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setShowDelete(true)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-5">
        <p className="text-sm font-medium">About this business</p>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Type</FieldLabel>
            <FieldContent>
              <Select value={data.type} onValueChange={(v) => update('type', v as string)}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Industry</FieldLabel>
            <FieldContent>
              <Input
                value={data.industry}
                onChange={(e) => update('industry', e.target.value)}
                placeholder="Fashion, Food, Tech..."
              />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Team Size</FieldLabel>
          <FieldContent>
            <Select value={data.teamSize} onValueChange={(v) => update('teamSize', v)}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Select team size..." />
              </SelectTrigger>
              <SelectContent>
                {teamSizes.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel>Description</FieldLabel>
            {!editingDesc ? (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => { setEditingDesc(true); setDescDraft(data.description) }}
                className="h-6 gap-1 text-xs text-muted-foreground"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => { setEditingDesc(false); setDescDraft(data.description) }}
                  className="h-6 w-6 text-muted-foreground"
                >
                  <X className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={saveDescription}
                  className="h-6 w-6 text-primary"
                >
                  <Check className="size-3" />
                </Button>
              </div>
            )}
          </div>
          <FieldContent>
            <Textarea
              value={editingDesc ? descDraft : data.description}
              onChange={(e) => setDescDraft(e.target.value)}
              placeholder="Describe your business briefly..."
              rows={2}
              className="text-sm resize-none"
              readOnly={!editingDesc}
              disabled={!editingDesc}
            />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Products / Services</FieldLabel>
            <FieldContent>
              <Input
                value={data.products}
                onChange={(e) => update('products', e.target.value)}
                placeholder="Clothing, consulting, subscriptions..."
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Target Audience</FieldLabel>
            <FieldContent>
              <Input
                value={data.audience}
                onChange={(e) => update('audience', e.target.value)}
                placeholder="Young professionals, families, SMBs..."
              />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Website</FieldLabel>
          <FieldContent>
            <Input
              value={data.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://..."
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Main Competitors</FieldLabel>
          <FieldContent>
            <Textarea
              value={data.competitors}
              onChange={(e) => update('competitors', e.target.value)}
              placeholder="Who are your main competitors?"
              rows={2}
              className="text-sm resize-none"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>What makes you different? (USP)</FieldLabel>
          <FieldContent>
            <Textarea
              value={data.usp}
              onChange={(e) => update('usp', e.target.value)}
              placeholder="Why do customers choose you over competitors?"
              rows={2}
              className="text-sm resize-none"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Current Pain Points</FieldLabel>
          <FieldContent>
            <Textarea
              value={data.painPoints}
              onChange={(e) => update('painPoints', e.target.value)}
              placeholder="What are your biggest challenges right now?"
              rows={2}
              className="text-sm resize-none"
            />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Monthly Revenue</FieldLabel>
            <FieldContent>
              <Select value={data.monthlyRevenue || undefined} onValueChange={(v) => update('monthlyRevenue', v)}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {['Under $10k', '$10k - $50k', '$50k - $100k', '$100k - $500k', '$500k - $1M', 'Over $1M', 'Pre-revenue'].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Year Established</FieldLabel>
            <FieldContent>
              <Input
                value={data.yearEstablished}
                onChange={(e) => update('yearEstablished', e.target.value)}
                placeholder="2024"
              />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Active Channels</FieldLabel>
          <FieldContent>
            <div className="flex gap-1.5 flex-wrap">
              {data.channels.length > 0 ? data.channels.map((ch) => (
                <Badge key={ch} variant="secondary" className="text-muted-foreground border-border/50">{ch}</Badge>
              )) : (
                <span className="text-xs text-muted-foreground/60">No channels configured</span>
              )}
            </div>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Goals</FieldLabel>
          <FieldContent>
            <div className="flex gap-1.5 flex-wrap">
              {data.goals.length > 0 ? data.goals.map((g) => (
                <Badge key={g} variant="secondary" className="text-muted-foreground border-border/50">{g}</Badge>
              )) : (
                <span className="text-xs text-muted-foreground/60">No goals configured</span>
              )}
            </div>
          </FieldContent>
        </Field>
      </div>

      <DeleteBusinessModal
        open={showDelete}
        businessName={business.name}
        onClose={() => setShowDelete(false)}
        onConfirm={() => onDelete(business.id)}
      />
    </div>
  )
}
