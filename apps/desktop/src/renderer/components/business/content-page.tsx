import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, CalendarClock, PenLine } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@orca-blitz/ui/components/ui/dialog'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@orca-blitz/ui/components/ui/select'
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Post</DialogTitle>
            <DialogDescription>
              Draft a post for one of your business channels.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Post title"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Channel</label>
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
                <label className="text-sm font-medium">Status</label>
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
              <label className="text-sm font-medium">Publish date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!form.title.trim()}>
              Save Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
