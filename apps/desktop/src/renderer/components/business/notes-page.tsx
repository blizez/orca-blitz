import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, PenLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@orca-blitz/ui/components/ui/dialog'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@orca-blitz/ui/components/ui/empty'

interface NoteItem {
  id: string
  title: string
  content: string
  createdAt: string
  status?: 'todo' | 'in_progress' | 'done'
  platformId?: string
}

interface NotesPageProps {
  businessId: string
}

const storageKey = (businessId: string) => `orca-business-notes-${businessId}`

const emptyForm = { title: '', content: '' }

export function NotesPage({ businessId }: NotesPageProps) {
  const { t } = useTranslation('business')

  const [items, setItems] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey(businessId))
      return saved ? (JSON.parse(saved) as NoteItem[]) : []
    } catch {
      return []
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingItem, setEditingItem] = useState<NoteItem | null>(null)

  useEffect(() => {
    localStorage.setItem(storageKey(businessId), JSON.stringify(items))
  }, [businessId, items])

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [items]
  )

  const handleSubmit = () => {
    if (!form.title.trim()) return
    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, title: form.title.trim(), content: form.content } : item
        )
      )
    } else {
      setItems((prev) => [
        { id: `note-${Date.now()}`, title: form.title.trim(), content: form.content, createdAt: new Date().toISOString() },
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

  return (
    <div className="h-full overflow-y-auto scrollbar-sleek">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t('notes.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('notes.description')}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus />
            {t('notes.newNote')}
          </Button>
        </div>

        {sorted.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PenLine />
              </EmptyMedia>
              <EmptyTitle>{t('notes.noNotes')}</EmptyTitle>
              <EmptyDescription>
                {t('notes.emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowForm(true)}>
                <Plus />
                {t('notes.createFirst')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sorted.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      {item.status && item.status !== 'todo' && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
                          {item.status === 'in_progress' ? 'En curso' : 'Hecho'}
                        </span>
                      )}
                      {item.platformId && (
                        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
                          {item.platformId}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setForm({ title: item.title, content: item.content })
                        setShowForm(true)
                      }}
                      aria-label={`Edit ${item.title}`}
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
                    >
                      <PenLine className="size-3.5" />
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
                {item.content && <p className="line-clamp-3 text-sm text-muted-foreground">{item.content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? t('notes.editNote') : t('notes.newNote')}</DialogTitle>
            <DialogDescription>
              {t('notes.formDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('notes.titleLabel')}</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t('notes.titlePlaceholder') ?? ''}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('notes.contentLabel')}</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder={t('notes.contentPlaceholder') ?? ''}
                className="bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingItem(null); setForm(emptyForm); setShowForm(false) }}>
              {t('notes.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={!form.title.trim()}>
              {editingItem ? t('notes.updateNote') : t('notes.saveNote')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
