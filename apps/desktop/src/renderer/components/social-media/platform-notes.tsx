import { useState, useEffect } from 'react'
import { StickyNote } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@orca-blitz/ui/components/ui/sheet'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { platforms } from './social-media-page'

interface PlatformNotesProps {
  businessId: string
  platformId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlatformNotes({ businessId, platformId, open, onOpenChange }: PlatformNotesProps) {
  const [notes, setNotes] = useState('')
  const [lastEdited, setLastEdited] = useState<string | null>(null)

  const storageKey = `orca-platform-notes-${businessId}-${platformId}`

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setNotes(stored)
        const timestamp = localStorage.getItem(`${storageKey}:timestamp`)
        setLastEdited(timestamp)
      } else {
        setNotes('')
        setLastEdited(null)
      }
    }
  }, [open, storageKey])

  const handleChange = (value: string) => {
    setNotes(value)
    localStorage.setItem(storageKey, value)
    const now = new Date().toLocaleString()
    localStorage.setItem(`${storageKey}:timestamp`, now)
    setLastEdited(now)
  }

  const platform = platforms.find((p) => p.id === platformId)
  const platformName = platform?.name ?? platformId

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <StickyNote className="size-4" />
            Notas — {platformName}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <Textarea
            value={notes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Escribe tus notas aquí..."
            className="h-[calc(100vh-200px)] resize-none"
          />
          {lastEdited && (
            <p className="mt-2 text-xs text-muted-foreground">
              Última edición: {lastEdited}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
