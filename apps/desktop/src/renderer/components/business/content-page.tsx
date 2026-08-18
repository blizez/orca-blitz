import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, CalendarClock, PenLine, Search, Copy } from 'lucide-react'
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

interface ContentItem {
  id: string
  title: string
  channel: string
  status: 'draft' | 'scheduled' | 'published'
  date: string
  body: string
}

interface ContentPageProps {
  businessId: string
}

const channelOptions = ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Telegram', 'X / Twitter', 'LinkedIn', 'Email']

const statusDots: Record<ContentItem['status'], string> = {
  draft: 'bg-muted-foreground/40',
  scheduled: 'bg-yellow-500',
  published: 'bg-green-500',
}

const storageKey = (businessId: string) => `orca-business-content-${businessId}`

const emptyForm = { title: '', channel: channelOptions[0], status: 'draft' as ContentItem['status'], date: '', body: '' }

export function ContentPage({ businessId }: ContentPageProps) {
  const { t } = useTranslation('business')

  const statusConfig: Record<ContentItem['status'], { label: string; dot: string }> = useMemo(() => ({
    draft: { label: t('content.status.draft'), dot: statusDots.draft },
    scheduled: { label: t('content.status.scheduled'), dot: statusDots.scheduled },
    published: { label: t('content.status.published'), dot: statusDots.published },
  }), [t])

  const statusOptions = useMemo(() => Object.entries(statusConfig).map(([value, config]) => ({
    value: value as ContentItem['status'],
    label: config.label,
  })), [statusConfig])

  const [items, setItems] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey(businessId))
      return saved ? (JSON.parse(saved) as ContentItem[]) : []
    } catch {
      return []
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContentItem['status'] | 'all'>('all')

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
            item.title.toLowerCase().includes(query) ||
            item.body.toLowerCase().includes(query)
          )
        }
        return true
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [items, searchQuery, statusFilter])

  const handleSubmit = () => {
    if (!form.title.trim()) return
    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...form, title: form.title.trim() } : item
        )
      )
    } else {
      setItems((prev) => [
        { id: `content-${Date.now()}`, ...form, title: form.title.trim() },
        ...prev,
      ])
    }
    setForm(emptyForm)
    setEditingItem(null)
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleDuplicate = (item: ContentItem) => {
    const duplicated: ContentItem = {
      ...item,
      id: `content-${Date.now()}`,
      title: `${item.title} (Copia)`,
      status: 'draft',
    }
    setItems((prev) => [duplicated, ...prev])
    toast.add({ title: 'Contenido duplicado', type: 'success' })
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-sleek">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t('content.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('content.description')}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus />
            {t('content.newPost')}
          </Button>
        </div>

        {items.length > 1 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('content.searchPlaceholder') ?? 'Search posts...'}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('all')}
              >
                {t('content.filterAll') ?? 'All'}
              </Badge>
              {(Object.keys(statusConfig) as ContentItem['status'][]).map((status) => (
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
                  {t('content.showingCount', { showing: filtered.length, total: items.length }) ??
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
                <PenLine />
              </EmptyMedia>
              <EmptyTitle>{t('content.noContent')}</EmptyTitle>
              <EmptyDescription>
                {t('content.emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowForm(true)}>
                <Plus />
                {t('content.createFirst')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((item) => {
              const status = statusConfig[item.status]
              return (
                <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.channel}</span>
                        {item.date && (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="size-3" />
                            {item.date}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          'flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium',
                          item.status === 'published' ? 'text-green-500' : item.status === 'scheduled' ? 'text-yellow-500' : 'text-muted-foreground'
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full', status.dot)} />
                        {status.label}
                      </span>
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setForm({
                            title: item.title,
                            channel: item.channel,
                            status: item.status,
                            date: item.date,
                            body: item.body,
                          })
                          setShowForm(true)
                        }}
                        aria-label={`Edit ${item.title}`}
                        className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
                      >
                        <PenLine className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(item)}
                        aria-label={`Duplicate ${item.title}`}
                        className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete ${item.title}`}
                        className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.body && <p className="line-clamp-2 text-sm text-muted-foreground">{item.body}</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? t('content.editPost') : t('content.newPost')}</DialogTitle>
            <DialogDescription>
              {t('content.formDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('content.titleLabel')}</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t('content.titlePlaceholder') ?? ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('content.channelLabel')}</label>
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
                <label className="text-sm font-medium">{t('content.statusLabel')}</label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as ContentItem['status'] })}>
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

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('content.publishDate')}</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('content.bodyLabel')}</label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder={t('content.bodyPlaceholder') ?? ''}
                className="bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingItem(null); setForm(emptyForm); setShowForm(false) }}>
              {t('content.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={!form.title.trim()}>
              {editingItem ? t('content.updatePost') : t('content.savePost')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
