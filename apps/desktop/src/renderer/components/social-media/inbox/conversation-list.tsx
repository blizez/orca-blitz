import { Search, UserRound } from 'lucide-react'
import { useState } from 'react'
import type { Conversation } from '@orca-blitz/shared'

interface ConversationListProps {
  conversations: Conversation[]
  activeJid: string | null
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({ conversations, activeJid, onSelect }: ConversationListProps) {
  const [query, setQuery] = useState('')
  const filtered = conversations.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.jid.includes(query))
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-card/40">
      <div className="border-b border-border p-3"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar conversaciones" className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-ring" /></div></div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No hay conversaciones todavía.</p> : filtered.map((conversation) => (
          <button type="button" key={conversation.jid} onClick={() => onSelect(conversation)} className={`flex w-full items-center gap-3 border-b border-border/60 p-3 text-left transition-colors hover:bg-accent/60 ${activeJid === conversation.jid ? 'bg-accent' : ''}`}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"><UserRound className="size-5" /></div>
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium">{conversation.name}</span>{conversation.lastMessageAt && <time className="shrink-0 text-[11px] text-muted-foreground">{formatTime(conversation.lastMessageAt)}</time>}</div><p className="truncate text-xs text-muted-foreground">{conversation.lastMessageFromMe ? 'Tú: ' : ''}{conversation.lastMessageBody || labelForType(conversation.lastMessageType)}</p></div>
            {conversation.unreadCount > 0 && <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">{conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}</span>}
          </button>
        ))}
      </div>
    </aside>
  )
}

function formatTime(timestamp: number): string { return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(timestamp) }
function labelForType(type: Conversation['lastMessageType']): string { return type && type !== 'text' ? `[${type}]` : 'Sin mensaje' }
