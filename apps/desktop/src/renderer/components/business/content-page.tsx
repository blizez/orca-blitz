import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, CalendarClock, PenLine, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
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

const statusConfig: Record<ContentItem['status'], { label: string; dot: string }> = {
  draft: { label: 'Draft', dot: 'bg-muted-foreground/40' },
  scheduled: { label: 'Scheduled', dot: 'bg-yellow-500' },
  published: { label: 'Published', dot: 'bg-green-500' },
}

const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value: value as ContentItem['status'],
  label: config.label,
}))

const storageKey = (businessId: string) => `orca-business-content-${businessId}`

const emptyForm = { title: '', channel: channelOptions[0], status: 'draft' as ContentItem['status'], date: '', body: '' }

export function ContentPage({ businessId }: ContentPageProps) {
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

  useEffect(() => {
    localStorage.setItem(storageKey(businessId), JSON.stringify(items))
  }, [businessId, items])

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [items]
  )

  const handleSubmit = () => {
    if (!form.title.trim()) return
    setItems((prev) => [
      { id: `content-${Date.now()}`, ...form, title: form.title.trim() },
      ...prev,
    ])
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-sleek">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Content</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan and manage posts for your business channels.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus />
            New Post
          </Button>
        </div>

        {sorted.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PenLine />
              </EmptyMedia>
              <EmptyTitle>No content yet</EmptyTitle>
              <EmptyDescription>
                Create your first post to start building your content pipeline.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowForm(true)}>
                <Plus />
                Create your first post
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sorted.map((item) => {
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
                          status.label === 'Published' ? 'text-green-500' : status.label === 'Scheduled' ? 'text-yellow-500' : 'text-muted-foreground'
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full', status.dot)} />
                        {status.label}
                      </span>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative z-50 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">New Post</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Draft a post for one of your business channels.
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
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Post title"
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
                    onChange={(e) => setForm({ ...form, status: e.target.value as ContentItem['status'] })}
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

              <div className="space-y-1">
                <label className="text-sm font-medium">Publish date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Write the post content..."
                  className="bg-background"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!form.title.trim()}>
                Save Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
