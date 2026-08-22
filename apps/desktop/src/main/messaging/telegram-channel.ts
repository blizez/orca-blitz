import { app, safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { Api, TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { NewMessage } from 'telegram/events'
import type { ChannelSession, UnifiedMessage } from '@orca-blitz/shared'
import type { MessageRepository } from './db/message-repository'

interface ChannelEvents {
  onStatus: (session: ChannelSession) => void
  onMessage: (message: UnifiedMessage) => void
  onConversationsChanged: (businessId: string) => void
}

type Deferred = { promise: Promise<string>; resolve: (value: string) => void }

export class TelegramChannel {
  private client: TelegramClient | null = null
  private session: ChannelSession
  private loginPromise: Promise<void> | null = null
  private codeInput: Deferred | null = null
  private passwordInput: Deferred | null = null

  constructor(
    private readonly businessId: string,
    private readonly repository: MessageRepository,
    private readonly events: ChannelEvents,
  ) {
    this.session = repository.getSession(businessId, 'telegram')
  }

  getStatus(): ChannelSession { return this.session }

  async connect(): Promise<ChannelSession> {
    if (!this.getCredentials()) {
      this.setStatus({ status: 'error', error: 'telegram_credentials_missing' })
      return this.session
    }
    await this.createClient()
    if (await this.client!.checkAuthorization()) {
      await this.finishConnected()
    } else {
      this.setStatus({ status: 'phone', error: undefined })
    }
    return this.session
  }

  async startLogin(phone: string): Promise<ChannelSession> {
    await this.createClient()
    this.setStatus({ status: 'connecting', error: undefined })
    const code = createDeferred()
    const password = createDeferred()
    this.codeInput = code
    this.passwordInput = password
    this.loginPromise = this.client!.start({
      phoneNumber: async () => phone,
      phoneCode: async () => {
        this.setStatus({ status: 'code' })
        return code.promise
      },
      password: async () => {
        this.setStatus({ status: 'password' })
        return password.promise
      },
      onError: (error) => {
        this.setStatus({ status: 'error', error: error.message })
      },
    }).then(() => this.finishConnected())
    return this.session
  }

  async submitCode(code: string): Promise<void> { this.codeInput?.resolve(code); await this.loginPromise }
  async submitPassword(password: string): Promise<void> { this.passwordInput?.resolve(password); await this.loginPromise }

  async disconnect(): Promise<void> {
    await this.client?.disconnect()
    this.client = null
    this.loginPromise = null
    this.setStatus({ status: 'disconnected', phone: undefined, name: undefined })
  }

  async sendText(jid: string, text: string): Promise<void> {
    if (!this.client) throw new Error('Telegram is not connected')
    const entity = await this.client.getEntity(jid.replace(/^telegram:/, ''))
    const sent = await this.client.sendMessage(entity, { message: text })
    const message = this.normalizeMessage(sent, true)
    if (message) this.persist(message)
  }

  private async createClient(): Promise<void> {
    if (this.client) return
    const credentials = this.getCredentials()
    if (!credentials) throw new Error('Telegram application credentials are missing')
    const session = new StringSession(this.readSession())
    this.client = new TelegramClient(session, credentials.apiId, credentials.apiHash, { connectionRetries: 5 })
    await this.client.connect()
    this.client.addEventHandler((event) => {
      const message = this.normalizeMessage(event.message, false)
      if (message) this.persist(message)
    }, new NewMessage({}))
  }

  private normalizeMessage(message: Api.Message, fromMe: boolean): UnifiedMessage | null {
    const chatId = message.chatId?.toString()
    if (!chatId) return null
    return {
      id: `telegram:${message.id}`,
      businessId: this.businessId,
      channel: 'telegram',
      chatJid: `telegram:${chatId}`,
      fromMe: fromMe || message.out === true,
      senderName: undefined,
      type: message.media ? 'other' : 'text',
      body: message.message ?? '',
      timestamp: Number(message.date ?? Math.floor(Date.now() / 1000)) * 1000,
      status: fromMe ? 'sent' : 'received',
    }
  }

  private persist(message: UnifiedMessage): void {
    this.repository.saveMessage(message)
    this.events.onMessage(message)
    this.events.onConversationsChanged(this.businessId)
  }

  private async finishConnected(): Promise<void> {
    const user = await this.client?.getMe()
    const userData = user as { phone?: string; firstName?: string; lastName?: string } | undefined
    this.writeSession(this.client?.session.save() ?? '')
    this.setStatus({ status: 'connected', phone: userData?.phone, name: [userData?.firstName, userData?.lastName].filter(Boolean).join(' ') || undefined, error: undefined })
  }

  private getCredentials(): { apiId: number; apiHash: string } | null {
    const apiId = Number(process.env.ORCA_TELEGRAM_API_ID)
    const apiHash = process.env.ORCA_TELEGRAM_API_HASH
    return apiId > 0 && apiHash ? { apiId, apiHash } : null
  }

  private sessionPath(): string { const directory = join(app.getPath('userData'), 'messaging', this.businessId); mkdirSync(directory, { recursive: true }); return join(directory, 'telegram.session') }
  private readSession(): string { const path = this.sessionPath(); if (!existsSync(path)) return ''; const value = readFileSync(path, 'utf8'); return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(Buffer.from(value, 'base64')) : value }
  private writeSession(session: string): void { const value = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(session).toString('base64') : session; writeFileSync(this.sessionPath(), value, 'utf8') }
  private setStatus(update: Partial<ChannelSession>): void { this.session = { ...this.session, ...update, businessId: this.businessId, channel: 'telegram' }; this.repository.saveSession(this.session); this.events.onStatus(this.session) }
}

function createDeferred(): Deferred {
  let resolve!: (value: string) => void
  const promise = new Promise<string>((innerResolve) => { resolve = innerResolve })
  return { promise, resolve }
}
