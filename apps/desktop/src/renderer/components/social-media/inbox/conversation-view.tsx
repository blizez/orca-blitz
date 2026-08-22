import { Check, CheckCheck, Image, UserRound } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Conversation, UnifiedMessage } from '@orca-blitz/shared'
import { Bubble, BubbleContent, BubbleGroup } from '@orca-blitz/ui/components/ui/bubble'
import { Message, MessageAvatar, MessageContent } from '@orca-blitz/ui/components/ui/message'
import { MessageComposer } from './message-composer'

interface ConversationViewProps { conversation: Conversation | null; messages: UnifiedMessage[]; onSend: (text: string) => Promise<void> }

export function ConversationView({ conversation, messages, onSend }: ConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])
  if (!conversation) return <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Selecciona una conversación para comenzar.</div>
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-14 items-center gap-3 border-b border-border px-5"><div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="size-4" /></div><div><h2 className="text-sm font-semibold">{conversation.name}</h2><p className="text-xs text-muted-foreground">{conversation.isGroup ? 'Grupo' : conversation.jid.split('@')[0]}</p></div></header>
      <div className="flex-1 overflow-y-auto p-5"><BubbleGroup className="gap-3">{messages.map((message) => <Message key={message.id} align={message.fromMe ? 'end' : 'start'}><MessageAvatar className="size-7"><UserRound className="size-4 text-muted-foreground" /></MessageAvatar><MessageContent><Bubble align={message.fromMe ? 'end' : 'start'} variant={message.fromMe ? 'default' : 'muted'}><BubbleContent>{message.type === 'image' && <Image className="mb-1 size-5" />}{message.body || `[${message.type}]`}</BubbleContent></Bubble><span className="px-2 text-[10px] text-muted-foreground">{formatTime(message.timestamp)} {message.fromMe && (message.status === 'received' ? <CheckCheck className="ml-1 inline size-3" /> : <Check className="ml-1 inline size-3" />)}</span></MessageContent></Message>)}</BubbleGroup><div ref={bottomRef} /></div>
      <MessageComposer onSend={onSend} />
    </section>
  )
}

function formatTime(timestamp: number): string { return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(timestamp) }
