import { Paperclip, Send } from 'lucide-react'
import { useState } from 'react'

export function MessageComposer({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  async function submit(): Promise<void> {
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    try { await onSend(value); setText('') } finally { setSending(false) }
  }
  return <div className="border-t border-border p-3"><div className="flex items-end gap-2 rounded-xl border border-border bg-card p-2"><button type="button" disabled className="rounded-lg p-2 text-muted-foreground opacity-50"><Paperclip className="size-4" /></button><textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit() } }} placeholder="Escribe un mensaje..." rows={1} className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none" /><button type="button" disabled={!text.trim() || sending} onClick={() => void submit()} className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-50"><Send className="size-4" /></button></div></div>
}
