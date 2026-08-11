import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Megaphone, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
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

const statusConfig: Record<Campaign['status'], { label: string; dot: string }> = {
  draft: { label: 'Draft', dot: 'bg-muted-foreground/40' },
  active: { label: 'Active', dot: 'bg-green-500' },
  paused: { label: 'Paused', dot: 'bg-yellow-500' },
  completed: { label: 'Completed', dot: 'bg-blue-500' },
}

const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value: value as Campaign['status'],
  label: config.label,
}))

const storageKey = (businessId: string) => `orca-business-campaigns-${businessId}`

const emptyForm = { name: '', channel: channelOptions[0], status: 'draft' as Campaign['status'], startDate: '', endDate: '', description: '' }

export function CampaignsPage({ businessId }: CampaignsPageProps) {
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

  useEffect(() => {
    localStorage.setItem(storageKey(businessId), JSON.stringify(items))
  }, [businessId, items])

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.startDate < b.startDate ? 1 : -1)),
    [items]
  )

  const handleSubmit = () => {
    if (!form.name.trim()) return
    setItems((prev) => [
      { id: `campaign-${Date.now()}`, ...form, name: form.name.trim() },
      ...prev,
    ])
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((campaign) => campaign.id !== id))
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
            <h1 className="text-xl font-semibold">Campaigns</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan, launch, and track marketing campaigns per channel.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus />
            New Campaign
          </Button>
        </div>

        {sorted.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Megaphone />
              </EmptyMedia>
              <EmptyTitle>No campaigns yet</EmptyTitle>
              <EmptyDescription>
                Launch your first campaign to start driving engagement for this business.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowForm(true)}>
                <Plus />
                Create your first campaign
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-3">
            {sorted.map((campaign) => {
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
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    aria-label={`Delete ${campaign.name}`}
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative z-50 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">New Campaign</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Define a campaign for one of your business channels.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                aria-label="Close"
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Campaign name"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Channel</label>
                  <select
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {channelOptions.map((channel) => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Campaign['status'] })}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Start date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">End date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this campaign about?"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!form.name.trim()}>
                Save Campaign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
