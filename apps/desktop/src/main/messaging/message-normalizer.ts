import type { proto } from 'baileys'
import type { ChannelType, MessageType, UnifiedMessage } from '@orca-blitz/shared'

export function normalizeMessage(message: proto.IWebMessageInfo, businessId: string, channel: ChannelType = 'whatsapp'): UnifiedMessage | null {
  const jid = message.key?.remoteJid
  const content = message.message
  if (!jid || !content || jid === 'status@broadcast' || jid.endsWith('@newsletter')) return null

  const type = getMessageType(content)
  const body = content.conversation
    ?? content.extendedTextMessage?.text
    ?? content.imageMessage?.caption
    ?? content.videoMessage?.caption
    ?? content.documentMessage?.fileName
    ?? ''
  const timestamp = Number(message.messageTimestamp ?? 0) * 1000
  return {
    id: message.key?.id ?? `${jid}-${timestamp}`,
    businessId,
    channel,
    chatJid: jid,
    fromMe: message.key?.fromMe === true,
    senderName: message.pushName ?? undefined,
    type,
    body,
    timestamp: timestamp || Date.now(),
    status: message.key?.fromMe ? 'sent' : 'received',
  }
}

function getMessageType(content: proto.IMessage): MessageType {
  if (content.imageMessage) return 'image'
  if (content.videoMessage) return 'video'
  if (content.audioMessage) return 'audio'
  if (content.documentMessage) return 'document'
  if (content.stickerMessage) return 'sticker'
  if (content.conversation || content.extendedTextMessage) return 'text'
  return 'other'
}
