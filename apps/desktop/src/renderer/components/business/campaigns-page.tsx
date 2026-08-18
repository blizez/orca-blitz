import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Megaphone, PenLine, Search, Copy, Clipboard, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { toast } from '@orca-blitz/ui/components/ui/toast'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@orca-blitz/ui/components/ui/dialog'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@orca-blitz/ui/components/ui/select'
import { Badge } from '@orca-blitz/ui/components/ui/badge'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@orca-blitz/ui/components/ui/empty'

interface Campaign {
  id: string
  name: string
  channel: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  startDate: string
  endDate: string
  description: string
}

interface CampaignsPageProps {
  businessId: string
}

const channelOptions = ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Telegram', 'X / Twitter', 'LinkedIn', 'Email']

const statusDots: Record<Campaign['status'], string> = {
  draft: 'bg-muted-foreground/40',
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  completed: 'bg-blue-500',
}

const storageKey = (businessId: string) => `orca-business-campaigns-${businessId}`

const emptyForm = { name: '', channel: channelOptions[0], status: 'draft' as Campaign['status'], startDate: '', endDate: '', description: '' }

export function CampaignsPage({ businessId }: CampaignsPageProps) {
  const { t } = useTranslation('business')

  const statusConfig: Record<Campaign['status'], { label: string; dot: string }> = useMemo(() => ({
    draft: { label: t('campaigns.status.draft'), dot: statusDots.draft },
    active: { label: t('campaigns.status.active'), dot: statusDots.active },
    paused: { label: t('campaigns.status.paused'), dot: statusDots.paused },
    completed: { label: t('campaigns.status.completed'), dot: statusDots.completed },
  }), [t])

  const statusOptions = useMemo(() => Object.entries(statusConfig).map(([value, config]) => ({
    value: value as Campaign['status'],
    label: config.label,
  })), [statusConfig])

  const [items, setItems] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey(businessId))
      return saved ? (JSON.parse(saved) as Campaign[]) : []
    } catch {
      return []
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingItem, setEditingItem] = useState<Campaign | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Campaign['status'] | 'all'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(storageKey(businessId), JSON.stringify(items))
  }, [businessId, items])

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return [...items]
      .filter((item) => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        if (query) {
          return (
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
          )
        }
        return true
      })
      .sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
  }, [items, searchQuery, statusFilter])

  const handleSubmit = () => {
    if (!form.name.trim()) return
    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...form, name: form.name.trim() } : item
        )
      )
    } else {
      setItems((prev) => [
        { id: `campaign-${Date.now()}`, ...form, name: form.name.trim() },
        ...prev,
      ])
    }
    setForm(emptyForm)
    setEditingItem(null)
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((campaign) => campaign.id !== id))
  }

  const handleDuplicate = (campaign: Campaign) => {
    const duplicated: Campaign = {
      ...campaign,
      id: `campaign-${Date.now()}`,
      name: `${campaign.name} (Copia)`,
      status: 'draft',
    }
    setItems((prev) => [duplicated, ...prev])
    toast.add({ title: 'Campaña duplicada', type: 'success' })
  }

  const handleCopy = async (campaign: Campaign) => {
    try {
      const parts = [campaign.name]
      if (campaign.description) parts.push(campaign.description)
      parts.push(`Canal: ${campaign.channel}`)
      if (campaign.startDate || campaign.endDate) {
        parts.push(`Fechas: ${campaign.startDate || 'TBD'} → ${campaign.endDate || 'TBD'}`)
      }
      await navigator.clipboard.writeText(parts.join('\n\n'))
      toast.add({ title: 'Copiado al portapapeles', type: 'success' })
      setCopiedId(campaign.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      toast.add({ title: 'Error al copiar', type: 'error' })
    }
  }

  const dateRange = (campaign: Campaign) => {
    if (!campaign.startDate && !campaign.endDate) return null
    return `${campaign.startDate || 'TBD'} → ${campaign.endDate || 'TBD'}`
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-sleek">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t('campaigns.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('campaigns.description')}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus />
            {t('campaigns.newCampaign')}
          </Button>
        </div>

        {items.length > 1 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('campaigns.searchPlaceholder') ?? 'Search campaigns...'}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('all')}
              >
                {t('campaigns.filterAll') ?? 'All'}
              </Badge>
              {(Object.keys(statusConfig) as Campaign['status'][]).map((status) => (
                <Badge
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setStatusFilter(status)}
                >
                  {statusConfig[status].label}
                </Badge>
              ))}
              {statusFilter !== 'all' || searchQuery ? (
                <span className="text-xs text-muted-foreground">
                  {t('campaigns.showingCount', { showing: filtered.length, total: items.length }) ??
                    `Showing ${filtered.length} of ${items.length}`}
                </span>
              ) : null}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Megaphone />
              </EmptyMedia>
              <EmptyTitle>{t('campaigns.noCampaigns')}</EmptyTitle>
              <EmptyDescription>
                {t('campaigns.emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowForm(true)}>
                <Plus />
                {t('campaigns.createFirst')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-3">
            {filtered.map((campaign) => {
              const status = statusConfig[campaign.status]
              return (
                <div key={campaign.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <span
                        className={cn(
                          'flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium',
                          campaign.status === 'active' ? 'text-green-500' : campaign.status === 'paused' ? 'text-yellow-500' : campaign.status === 'completed' ? 'text-blue-500' : 'text-muted-foreground'
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full', status.dot)} />
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {campaign.channel}
                      {dateRange(campaign) && ` · ${dateRange(campaign)}`}
                    </p>
                    {campaign.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{campaign.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleCopy(campaign)}
                      aria-label={`Copy ${campaign.name}`}
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
                    >
                      {copiedId === campaign.id ? <Check className="size-3.5 text-green-500" /> : <Clipboard className="size-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(campaign)
                        setForm({
                          name: campaign.name,
                          channel: campaign.channel,
                          status: campaign.status,
                          startDate: campaign.startDate,
                          endDate: campaign.endDate,
                          description: campaign.description,
                        })
                        setShowForm(true)
                      }}
                      aria-label={`Edit ${campaign.name}`}
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
                    >
                        <PenLine className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(campaign)}
                        aria-label={`Duplicate ${campaign.name}`}
                        className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                      aria-label={`Delete ${campaign.name}`}
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? t('campaigns.editCampaign') : t('campaigns.newCampaign')}</DialogTitle>
            <DialogDescription>
              {t('campaigns.formDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('campaigns.nameLabel')}</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('campaigns.namePlaceholder') ?? ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('campaigns.channelLabel')}</label>
                <Select value={form.channel} onValueChange={(value) => setForm({ ...form, channel: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelOptions.map((channel) => (
                      <SelectItem key={channel} value={channel}>
                        {channel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{t('campaigns.statusLabel')}</label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as Campaign['status'] })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('campaigns.startDate')}</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{t('campaigns.endDate')}</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('campaigns.descriptionLabel')}</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('campaigns.descriptionPlaceholder') ?? ''}
                className="bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingItem(null); setForm(emptyForm); setShowForm(false) }}>
              {t('campaigns.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim()}>
              {editingItem ? t('campaigns.updateCampaign') : t('campaigns.saveCampaign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
