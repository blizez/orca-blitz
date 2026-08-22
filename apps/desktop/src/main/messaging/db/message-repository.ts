import type { ChannelSession, Conversation, UnifiedMessage } from '@orca-blitz/shared'
import { getDatabase } from './database'

interface ContactInput {
  channel?: UnifiedMessage['channel']
  name?: string
  pushname?: string
  isGroup?: boolean
}

interface ConversationRow {
  business_id: string
  jid: string
  name: string | null
  is_group: number
  unread_count: number
  last_message_at: number | null
  last_body: string | null
  last_type: UnifiedMessage['type'] | null
  last_from_me: number | null
  channel: UnifiedMessage['channel']
}

export class MessageRepository {
  upsertContact(businessId: string, jid: string, input: ContactInput = {}): void {
    getDatabase().prepare(`
      INSERT INTO contacts (business_id, jid, channel, name, pushname, is_group)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (business_id, jid) DO UPDATE SET
        name = COALESCE(excluded.name, contacts.name),
        pushname = COALESCE(excluded.pushname, contacts.pushname),
        is_group = excluded.is_group
    `).run(businessId, jid, input.channel ?? 'whatsapp', input.name ?? null, input.pushname ?? null, input.isGroup ? 1 : 0)
  }

  saveMessage(message: UnifiedMessage): void {
    const db = getDatabase()
    this.upsertContact(message.businessId, message.chatJid, {
      name: message.senderName,
      channel: message.channel,
      isGroup: message.chatJid.endsWith('@g.us'),
    })
    db.prepare(`
      INSERT OR REPLACE INTO messages
        (id, business_id, jid, channel, from_me, sender_name, type, body, media_path, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      message.id,
      message.businessId,
      message.chatJid,
      message.channel,
      message.fromMe ? 1 : 0,
      message.senderName ?? null,
      message.type,
      message.body,
      message.mediaPath ?? null,
      message.timestamp,
      message.status ?? null,
    )
    db.prepare(`UPDATE contacts SET last_message_at = ? WHERE business_id = ? AND jid = ? AND channel = ?`)
      .run(message.timestamp, message.businessId, message.chatJid, message.channel)
    if (!message.fromMe) {
      db.prepare(`UPDATE contacts SET unread_count = unread_count + 1 WHERE business_id = ? AND jid = ? AND channel = ?`)
        .run(message.businessId, message.chatJid, message.channel)
    }
  }

  setMediaPath(businessId: string, messageId: string, mediaPath: string): void {
    getDatabase().prepare(`UPDATE messages SET media_path = ? WHERE business_id = ? AND id = ?`)
      .run(mediaPath, businessId, messageId)
  }

  listConversations(businessId: string, channel: Conversation['channel'] = 'whatsapp'): Conversation[] {
    const rows = getDatabase().prepare(`
      SELECT c.business_id, c.jid, c.channel, c.name, c.is_group, c.unread_count, c.last_message_at,
        (SELECT body FROM messages m WHERE m.business_id = c.business_id AND m.jid = c.jid
          AND m.channel = c.channel ORDER BY timestamp DESC LIMIT 1) AS last_body,
        (SELECT type FROM messages m WHERE m.business_id = c.business_id AND m.jid = c.jid
          AND m.channel = c.channel ORDER BY timestamp DESC LIMIT 1) AS last_type,
        (SELECT from_me FROM messages m WHERE m.business_id = c.business_id AND m.jid = c.jid
          AND m.channel = c.channel ORDER BY timestamp DESC LIMIT 1) AS last_from_me
      FROM contacts c
      WHERE c.business_id = ? AND c.channel = ? AND c.last_message_at IS NOT NULL
      ORDER BY c.last_message_at DESC
    `).all(businessId, channel) as unknown as ConversationRow[]

    return rows.map((row) => ({
      businessId: row.business_id,
      channel: row.channel,
      jid: row.jid,
      name: row.name || row.jid.split('@')[0],
      isGroup: row.is_group === 1,
      unreadCount: row.unread_count,
      lastMessageBody: row.last_body ?? undefined,
      lastMessageType: row.last_type ?? undefined,
      lastMessageAt: row.last_message_at ?? undefined,
      lastMessageFromMe: row.last_from_me === 1,
    }))
  }

  listMessages(businessId: string, jid: string, channel: Conversation['channel'] = 'whatsapp', limit = 80): UnifiedMessage[] {
    const rows = getDatabase().prepare(`
      SELECT id, business_id, jid, channel, from_me, sender_name, type, body, media_path, timestamp, status
      FROM messages WHERE business_id = ? AND jid = ? AND channel = ?
      ORDER BY timestamp DESC LIMIT ?
    `).all(businessId, jid, channel, limit) as unknown as Array<Record<string, unknown>>

    return rows.reverse().map((row) => ({
      id: String(row.id),
      businessId: String(row.business_id),
      channel: row.channel as UnifiedMessage['channel'],
      chatJid: String(row.jid),
      fromMe: row.from_me === 1,
      senderName: row.sender_name ? String(row.sender_name) : undefined,
      type: row.type as UnifiedMessage['type'],
      body: String(row.body ?? ''),
      mediaPath: row.media_path ? String(row.media_path) : undefined,
      timestamp: Number(row.timestamp),
      status: row.status ? String(row.status) : undefined,
    }))
  }

  markRead(businessId: string, jid: string, channel: Conversation['channel'] = 'whatsapp'): void {
    getDatabase().prepare(`UPDATE contacts SET unread_count = 0 WHERE business_id = ? AND jid = ? AND channel = ?`)
      .run(businessId, jid, channel)
  }

  saveSession(session: ChannelSession): void {
    getDatabase().prepare(`
      INSERT INTO sessions (business_id, phone, name, status, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (business_id) DO UPDATE SET
        phone = excluded.phone, name = excluded.name,
        status = excluded.status, updated_at = excluded.updated_at
    `).run(session.channel === 'whatsapp' ? session.businessId : `${session.businessId}:${session.channel}`, session.phone ?? null, session.name ?? null, session.status, Date.now())
  }

  getSession(businessId: string, channel: ChannelSession['channel'] = 'whatsapp'): ChannelSession {
    const key = channel === 'whatsapp' ? businessId : `${businessId}:${channel}`
    const row = getDatabase().prepare(`SELECT * FROM sessions WHERE business_id = ?`).get(key) as Record<string, unknown> | undefined
    if (!row) return { businessId, channel, status: 'disconnected' }
    return {
      businessId,
      channel,
      status: row.status as ChannelSession['status'],
      phone: row.phone ? String(row.phone) : undefined,
      name: row.name ? String(row.name) : undefined,
    }
  }
}
