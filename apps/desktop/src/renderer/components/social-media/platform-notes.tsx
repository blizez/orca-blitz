import { useState, useEffect, useMemo } from 'react'
import { NotepadText, Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@orca-blitz/ui/components/ui/sheet'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { Badge } from '@orca-blitz/ui/components/ui/badge'

type QuickNoteStatus = 'todo' | 'in_progress' | 'done'

interface QuickNote {
  id: string
  title: string
  content: string
  createdAt: string
  status: QuickNoteStatus
  platformId?: string
}

interface PlatformNotesProps {
  businessId: string
  platformId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const storageKey = (businessId: string) => `orca-quick-notes-${businessId}`



export function PlatformNotes({ businessId, platformId, open, onOpenChange }: PlatformNotesProps) {
  const [items, setItems] = useState<QuickNote[]>([])
  const [text, setText] = useState('')

  // Load linked notes (same key as NotesPage)
  useEffect(() => {
    if (!open) return
    try {
      const raw = localStorage.getItem(storageKey(businessId))
      const parsed = raw ? (JSON.parse(raw) as QuickNote[]) : []
      setItems(parsed.map((n) => ({ ...n, status: (n.status as QuickNoteStatus) ?? 'todo' })))
    } catch {
      setItems([])
    }
  }, [open, businessId])

  const persist = (next: QuickNote[]) => {
    setItems(next)
    localStorage.setItem(storageKey(businessId), JSON.stringify(next))
    // Notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey(businessId), newValue: JSON.stringify(next) }))
  }

  const handleAdd = () => {
    if (!text.trim()) return
    const note: QuickNote = {
      id: `note-${Date.now()}`,
      title: text.trim(),
      content: '',
      createdAt: new Date().toISOString(),
      status: 'todo',
      platformId,
    }
    persist([note, ...items])
    setText('')
  }

  const remove = (id: string) => {
    persist(items.filter((n) => n.id !== id))
  }

  const filtered = useMemo(() => [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), [items])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[520px] max-w-[90vw] flex-col sm:max-w-[520px]">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <NotepadText className="size-4" />
            Notas rápidas
          </SheetTitle>
        </SheetHeader>

        {/* Quick add */}
        <div className="space-y-2 px-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu nota rápida..."
            rows={3}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleAdd()
              }
            }}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd} disabled={!text.trim()}>
              <Plus className="size-3.5" />
              Añadir
            </Button>
          </div>
        </div>

        {/* Lista simple */}
        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Sin notas rápidas. Crea la primera arriba.
            </p>
          ) : (
            filtered.map((note) => (
              <div key={note.id} className="group rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{note.title}</p>
                    {note.content && <p className="mt-1 text-xs text-muted-foreground">{note.content}</p>}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {note.platformId && (
                        <Badge variant="secondary" className="h-5 text-[10px]">
                          {note.platformId}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(note.id)}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Eliminar"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border px-4 py-3">
          <p className="text-[11px] text-muted-foreground">Tip: úsalas para recordatorios rápidos mientras navegas.</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
