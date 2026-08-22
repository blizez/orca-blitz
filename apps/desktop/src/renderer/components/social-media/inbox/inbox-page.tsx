import { ArrowLeft, RefreshCw, Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChannelSession, Conversation, UnifiedMessage } from '@orca-blitz/shared'
import { useConversationsStore } from '../../../store/conversations-store'
import { ConversationList } from './conversation-list'
import { ConversationView } from './conversation-view'

const EMPTY_MESSAGES: UnifiedMessage[] = []

export function InboxPage({ businessId, onBack, onOpenSettings }: { businessId: string; onBack: () => void; onOpenSettings: () => void }) {
  const [channel, setChannel] = useState<'whatsapp' | 'telegram' | 'instagram' | 'facebook'>('whatsapp')
  const session = useConversationsStore((state) => state.session)
  const conversations = useConversationsStore((state) => state.conversations)
  const activeJid = useConversationsStore((state) => state.activeJid)
  const messages = useConversationsStore((state) => state.messagesByJid[activeJid ?? ''] ?? EMPTY_MESSAGES)
  const setSession = useConversationsStore((state) => state.setSession)
  const setQr = useConversationsStore((state) => state.setQr)
  const setConversations = useConversationsStore((state) => state.setConversations)
  const setMessages = useConversationsStore((state) => state.setMessages)
  const upsertMessage = useConversationsStore((state) => state.upsertMessage)
  const setActiveJid = useConversationsStore((state) => state.setActiveJid)
  const reset = useConversationsStore((state) => state.reset)

  useEffect(() => {
    reset()
    void window.api.integrations.getStatus(businessId, channel).then((value) => setSession(value as ChannelSession))
    void window.api.integrations.listConversations(businessId, channel).then((value) => setConversations(value as Conversation[]))
    const removeMessage = window.api.integrations.onMessage((...args) => { const message = args[0] as UnifiedMessage; if (message.businessId === businessId && message.channel === channel) upsertMessage(message) })
    const removeQr = window.api.integrations.onQR((data) => { if (data.businessId === businessId && channel === 'whatsapp') { setQr(data.qr); setSession({ businessId, channel: 'whatsapp', status: 'qr' }) } })
    const removeStatus = window.api.integrations.onStatus((data) => { const next = data as ChannelSession; if (next.businessId === businessId && next.channel === channel) { setSession(next); if (next.status !== 'qr') setQr(null) } })
    const removeConversations = window.api.integrations.onConversationsChanged((data) => { if (data.businessId === businessId) void window.api.integrations.listConversations(businessId, channel).then((value) => setConversations(value as Conversation[])) })
    return () => { removeMessage(); removeQr(); removeStatus(); removeConversations(); reset() }
  }, [businessId, channel, reset, setConversations, setMessages, setQr, setSession, upsertMessage])

  const activeConversation = conversations.find((item) => item.jid === activeJid) ?? null
  async function selectConversation(conversation: Conversation): Promise<void> {
    setActiveJid(conversation.jid)
    const loaded = await window.api.integrations.listMessages(businessId, conversation.jid, channel)
    setMessages(conversation.jid, loaded as UnifiedMessage[])
    await window.api.integrations.markRead(businessId, conversation.jid, channel)
  }
  async function sendMessage(text: string): Promise<void> { if (activeJid) await window.api.integrations.sendMessage(businessId, activeJid, text, channel) }
  const connected = session?.status === 'connected'
  return <div className="flex h-full flex-col overflow-hidden"><header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4"><button type="button" onClick={onBack} className="rounded-lg p-2 hover:bg-accent"><ArrowLeft className="size-4" /></button><div className="flex-1"><h1 className="text-sm font-semibold">Unified Inbox</h1><div className="mt-1 flex gap-1"><button type="button" onClick={() => setChannel('whatsapp')} className={`rounded px-2 py-0.5 text-[11px] ${channel === 'whatsapp' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>WhatsApp</button><button type="button" onClick={() => setChannel('instagram')} className={`rounded px-2 py-0.5 text-[11px] ${channel === 'instagram' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>Instagram</button><button type="button" onClick={() => setChannel('facebook')} className={`rounded px-2 py-0.5 text-[11px] ${channel === 'facebook' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>Messenger</button><button type="button" onClick={() => setChannel('telegram')} className={`rounded px-2 py-0.5 text-[11px] ${channel === 'telegram' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>Telegram</button></div></div>{connected && <button type="button" onClick={() => void window.api.integrations.listConversations(businessId, channel).then((value) => setConversations(value as Conversation[]))} className="rounded-lg p-2 text-muted-foreground hover:bg-accent"><RefreshCw className="size-4" /></button>}</header>{connected ? <div className="flex min-h-0 flex-1"><ConversationList conversations={conversations} activeJid={activeJid} onSelect={(conversation) => void selectConversation(conversation)} /><ConversationView conversation={activeConversation} messages={messages} onSend={sendMessage} /></div> : <div className="flex flex-1 items-center justify-center p-6"><div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center"><Settings2 className="size-8 text-muted-foreground" /><h2 className="text-lg font-semibold">Configura {channel === 'facebook' ? 'Facebook Messenger' : channel}</h2><p className="text-sm text-muted-foreground">Conecta esta cuenta desde Settings del negocio para comenzar a recibir mensajes.</p><button type="button" onClick={onOpenSettings} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Abrir configuración</button></div></div>}</div>
}
