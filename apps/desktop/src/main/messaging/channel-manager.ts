import type { ChannelSession, Conversation, UnifiedMessage } from '@orca-blitz/shared'
import { MessageRepository } from './db/message-repository'
import { WhatsAppChannel } from './whatsapp-channel'
import { TelegramChannel } from './telegram-channel'
import { InstagramChannel } from './instagram-channel'
import { MessengerChannel } from './messenger-channel'

export interface MessagingEvents {
  onQR: (businessId: string, qr: string) => void
  onStatus: (session: ChannelSession) => void
  onMessage: (message: UnifiedMessage) => void
  onConversationsChanged: (businessId: string) => void
}

export class ChannelManager {
  private readonly channels = new Map<string, WhatsAppChannel>()
  private readonly telegramChannels = new Map<string, TelegramChannel>()
  private readonly instagramChannels = new Map<string, InstagramChannel>()
  private readonly messengerChannels = new Map<string, MessengerChannel>()
  readonly repository = new MessageRepository()

  constructor(private readonly events: MessagingEvents) {}

  async connect(businessId: string): Promise<ChannelSession> {
    let channel = this.channels.get(businessId)
    if (!channel) {
      channel = new WhatsAppChannel(businessId, this.repository, this.events)
      this.channels.set(businessId, channel)
    }
    return channel.connect()
  }

  async disconnect(businessId: string): Promise<void> {
    await this.channels.get(businessId)?.disconnect()
    this.channels.delete(businessId)
  }

  async connectTelegram(businessId: string): Promise<ChannelSession> {
    let channel = this.telegramChannels.get(businessId)
    if (!channel) {
      channel = new TelegramChannel(businessId, this.repository, this.events)
      this.telegramChannels.set(businessId, channel)
    }
    return channel.connect()
  }

  async startTelegramLogin(businessId: string, phone: string): Promise<ChannelSession> {
    let channel = this.telegramChannels.get(businessId)
    if (!channel) {
      channel = new TelegramChannel(businessId, this.repository, this.events)
      this.telegramChannels.set(businessId, channel)
    }
    return channel.startLogin(phone)
  }

  async submitTelegramCode(businessId: string, code: string): Promise<void> {
    await this.telegramChannels.get(businessId)?.submitCode(code)
  }

  async submitTelegramPassword(businessId: string, password: string): Promise<void> {
    await this.telegramChannels.get(businessId)?.submitPassword(password)
  }

  async disconnectTelegram(businessId: string): Promise<void> {
    await this.telegramChannels.get(businessId)?.disconnect()
    this.telegramChannels.delete(businessId)
  }

  async loginInstagram(businessId: string, username: string, password: string): Promise<ChannelSession> {
    let channel = this.instagramChannels.get(businessId)
    if (!channel) {
      channel = new InstagramChannel(businessId, this.repository, this.events)
      this.instagramChannels.set(businessId, channel)
    }
    return channel.login(username, password)
  }

  async disconnectInstagram(businessId: string): Promise<void> {
    await this.instagramChannels.get(businessId)?.disconnect()
    this.instagramChannels.delete(businessId)
  }

  async loginMessenger(businessId: string, email: string, password: string): Promise<ChannelSession> {
    let channel = this.messengerChannels.get(businessId)
    if (!channel) {
      channel = new MessengerChannel(businessId, this.repository, this.events)
      this.messengerChannels.set(businessId, channel)
    }
    return channel.login(email, password)
  }

  async disconnectMessenger(businessId: string): Promise<void> {
    await this.messengerChannels.get(businessId)?.disconnect()
    this.messengerChannels.delete(businessId)
  }

  status(businessId: string, channel: ChannelSession['channel'] = 'whatsapp'): ChannelSession {
    if (channel === 'telegram') return this.telegramChannels.get(businessId)?.getStatus() ?? this.repository.getSession(businessId, 'telegram')
    if (channel === 'instagram') return this.instagramChannels.get(businessId)?.getStatus() ?? this.repository.getSession(businessId, 'instagram')
    if (channel === 'facebook') return this.messengerChannels.get(businessId)?.getStatus() ?? this.repository.getSession(businessId, 'facebook')
    if (channel === 'gmail') return this.repository.getSession(businessId, 'gmail')
    return this.channels.get(businessId)?.getStatus() ?? this.repository.getSession(businessId)
  }

  async sendText(businessId: string, jid: string, text: string, channel: ChannelSession['channel'] = 'whatsapp'): Promise<void> {
    if (channel === 'telegram') {
      const telegram = this.telegramChannels.get(businessId)
      if (!telegram) throw new Error('Telegram is not connected')
      await telegram.sendText(jid, text)
      return
    }
    if (channel === 'instagram') {
      const ig = this.instagramChannels.get(businessId)
      if (!ig) throw new Error('Instagram is not connected')
      await ig.sendText(jid, text)
      return
    }
    if (channel === 'facebook') {
      const fb = this.messengerChannels.get(businessId)
      if (!fb) throw new Error('Messenger is not connected')
      await fb.sendText(jid, text)
      return
    }
    let whatsapp = this.channels.get(businessId)
    if (!whatsapp) {
      await this.connect(businessId)
      whatsapp = this.channels.get(businessId)
    }
    if (!whatsapp) throw new Error('Unable to initialize WhatsApp')
    await whatsapp.sendText(jid, text)
  }

  conversations(businessId: string, channel: Conversation['channel'] = 'whatsapp'): Conversation[] {
    return this.repository.listConversations(businessId, channel)
  }

  messages(businessId: string, jid: string, channel: Conversation['channel'] = 'whatsapp'): UnifiedMessage[] {
    return this.repository.listMessages(businessId, jid, channel)
  }

  markRead(businessId: string, jid: string, channel: Conversation['channel'] = 'whatsapp'): void {
    this.repository.markRead(businessId, jid, channel)
  }
}
