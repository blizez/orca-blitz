import { useState } from 'react'
import { Trash2, Pencil, Check, X, DollarSign, Calendar, Users, Globe, Target, TrendingUp, Building2 } from 'lucide-react'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@orca-blitz/ui/components/ui/card'
import { Badge } from '@orca-blitz/ui/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@orca-blitz/ui/components/ui/select'
import { toast } from '@orca-blitz/ui/components/ui/toast'
import { DeleteBusinessModal } from '../../layout/delete-business-modal'
import { BusinessIntegrations } from './business-integrations'
import type { Business } from '@orca-blitz/shared'

interface BusinessSettingsProps {
  business: Business
  onUpdate: (id: string, data: Partial<Business>) => void
  onDelete: (id: string) => void
}

const teamSizes = ['Just me', '2-5', '6-10', '11-50', '50+']

function EditableStatCard({ icon: Icon, label, children }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  children: React.ReactNode
}) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-0.5">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InlineInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-7 border-none bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
    />
  )
}

function InlineTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="border-none bg-transparent p-0 text-sm shadow-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
    />
  )
}

function InlineSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
      <SelectTrigger size="sm" className="h-7 border-none bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function BusinessSettings({ business, onUpdate, onDelete }: BusinessSettingsProps) {
  const [data, setData] = useState(business)
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft] = useState(business.description)
  const [showDelete, setShowDelete] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(business.name)

  const update = (field: keyof Business, value: string | string[]) => {
    const next = { ...data, [field]: value }
    setData(next)
    onUpdate(business.id, { [field]: value })
  }

  const saveDescription = () => {
    update('description', descDraft)
    setEditingDesc(false)
    toast.add({ title: 'Cambios guardados', type: 'success' })
  }

  const saveName = () => {
    update('name', nameDraft)
    setEditingName(false)
    toast.add({ title: 'Cambios guardados', description: nameDraft, type: 'success' })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-8 w-64 text-lg font-semibold"
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
                <h1 className="text-xl font-semibold">{data.name}</h1>
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
            <Badge variant="secondary">{data.type}</Badge>
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
        {editingDesc ? (
          <div className="flex items-start gap-2 max-w-2xl">
            <Textarea
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              placeholder="Describe your business briefly..."
              rows={2}
              className="text-sm resize-none flex-1"
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon-xs" onClick={saveDescription} className="text-primary">
                <Check className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={() => { setEditingDesc(false); setDescDraft(data.description) }} className="text-muted-foreground">
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <p
            className="text-sm text-muted-foreground max-w-2xl cursor-pointer hover:text-foreground transition-colors"
            onClick={() => { setEditingDesc(true); setDescDraft(data.description) }}
          >
            {data.description || 'Click to add a description...'}
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <EditableStatCard icon={DollarSign} label="Monthly Revenue" value={data.monthlyRevenue}>
          <InlineSelect
            value={data.monthlyRevenue}
            onChange={(v) => update('monthlyRevenue', v)}
            options={['Under $10k', '$10k - $50k', '$50k - $100k', '$100k - $500k', '$500k - $1M', 'Over $1M', 'Pre-revenue']}
          />
        </EditableStatCard>
        <EditableStatCard icon={Calendar} label="Established" value={data.yearEstablished}>
          <InlineInput value={data.yearEstablished} onChange={(v) => update('yearEstablished', v)} placeholder="2024" />
        </EditableStatCard>
        <EditableStatCard icon={Users} label="Team Size" value={data.teamSize}>
          <InlineSelect value={data.teamSize} onChange={(v) => update('teamSize', v)} options={teamSizes} />
        </EditableStatCard>
        <EditableStatCard icon={Globe} label="Industry" value={data.industry}>
          <InlineInput value={data.industry} onChange={(v) => update('industry', v)} placeholder="Fashion, Food, Tech..." />
        </EditableStatCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-muted-foreground" />
              Products & Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Products / Services</p>
              <InlineInput value={data.products} onChange={(v) => update('products', v)} placeholder="Clothing, consulting, subscriptions..." />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Target Audience</p>
              <InlineInput value={data.audience} onChange={(v) => update('audience', v)} placeholder="Young professionals, families, SMBs..." />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Goals</p>
              <div className="flex flex-wrap gap-1.5">
                {data.goals.length > 0 ? data.goals.map((g) => (
                  <Badge key={g} variant="outline" className="text-muted-foreground">{g}</Badge>
                )) : (
                  <span className="text-xs text-muted-foreground/60">No goals configured</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              Market Position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Unique Selling Point</p>
              <InlineTextarea value={data.usp} onChange={(v) => update('usp', v)} placeholder="Why do customers choose you over competitors?" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Competitors</p>
              <InlineTextarea value={data.competitors} onChange={(v) => update('competitors', v)} placeholder="Who are your main competitors?" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Pain Points</p>
              <InlineTextarea value={data.painPoints} onChange={(v) => update('painPoints', v)} placeholder="What are your biggest challenges right now?" />
            </div>
          </CardContent>
        </Card>
      </div>

      {(data.channels.length > 0 || data.website) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              Channels & Presence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Website</p>
              <InlineInput value={data.website} onChange={(v) => update('website', v)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Active Channels</p>
              <div className="flex flex-wrap gap-1.5">
                {data.channels.length > 0 ? data.channels.map((ch) => (
                  <Badge key={ch} variant="secondary">{ch}</Badge>
                )) : (
                  <span className="text-xs text-muted-foreground/60">No channels configured</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Connected channels</p>
        <BusinessIntegrations businessId={business.id} business={business} embedded />
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
