import { app, safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { ChannelSession, UnifiedMessage } from '@orca-blitz/shared'
import type { MessageRepository } from './db/message-repository'

interface ChannelEvents {
  onStatus: (session: ChannelSession) => void
  onMessage: (message: UnifiedMessage) => void
  onConversationsChanged: (businessId: string) => void
}

// fca-unofficial is CommonJS, dynamic import to avoid ESM issues
type FcaApi = {
  sendMessage: (msg: string, threadID: string, cb?: (err: unknown) => void) => void
  listenMqtt: (cb: (err: unknown, event: { type: string; body?: string; threadID?: string; senderID?: string }) => void) => () => void
  getAppState: () => unknown
  logout?: (cb?: () => void) => void
}

export class MessengerChannel {
  private api: FcaApi | null = null
  private session: ChannelSession
  private stopListen: (() => void) | null = null

  constructor(
    private readonly businessId: string,
    private readonly repository: MessageRepository,
    private readonly events: ChannelEvents,
  ) {
    this.session = repository.getSession(businessId, 'facebook')
    const state = this.readState()
    if (state) {
      // try to restore session silently
      void this.loginWithAppState(state).catch(() => {})
    }
  }

  getStatus(): ChannelSession {
    return this.session
  }

  async login(email: string, password: string): Promise<ChannelSession> {
    this.setStatus({ status: 'connecting', error: undefined })
    try {
      const { default: login } = await import('@dongdev/fca-unofficial')
      const api: FcaApi = await new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        ;(login as (creds: unknown, cb: (err: unknown, a: FcaApi) => void) => void)(
          { email, password },
          (err: unknown, a: FcaApi) => (err ? reject(err) : resolve(a)),
        )
      })
      await this.attach(api)
      return this.session
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Messenger login failed'
      this.setStatus({ status: 'error', error: msg })
      throw e
    }
  }

  async loginWithAppState(appState: unknown): Promise<ChannelSession> {
    try {
      const { default: login } = await import('@dongdev/fca-unofficial')
      const api: FcaApi = await new Promise((resolve, reject) => {
        ;(login as (creds: unknown, cb: (err: unknown, a: FcaApi) => void) => void)(
          { appState },
          (err: unknown, a: FcaApi) => (err ? reject(err) : resolve(a)),
        )
      })
      await this.attach(api)
      return this.session
    } catch {
      this.clearState()
      return this.session
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.stopListen?.()
      this.api?.logout?.()
    } catch {}
    this.api = null
    this.stopListen = null
    this.clearState()
    this.setStatus({ status: 'disconnected', phone: undefined, name: undefined, error: undefined })
  }

  async sendText(jid: string, text: string): Promise<void> {
    if (!this.api) throw new Error('Messenger is not connected')
    await new Promise<void>((resolve, reject) => {
      this.api!.sendMessage(text, jid, (err) => (err ? reject(err) : resolve()))
    })
    const message: UnifiedMessage = {
      id: `facebook:${Date.now()}`,
      businessId: this.businessId,
      channel: 'facebook',
      chatJid: jid,
      fromMe: true,
      type: 'text',
      body: text,
      timestamp: Date.now(),
      status: 'sent',
    }
    this.persist(message)
  }

  private async attach(api: FcaApi): Promise<void> {
    this.api = api
    this.writeState(api.getAppState())
    this.stopListen?.()
    this.stopListen = api.listenMqtt((err, event) => {
      if (err || !event || event.type !== 'message' || !event.body || !event.threadID) return
      const message: UnifiedMessage = {
        id: `facebook:${Date.now()}:${event.threadID}`,
        businessId: this.businessId,
        channel: 'facebook',
        chatJid: event.threadID,
        fromMe: false,
        type: 'text',
        body: event.body,
        timestamp: Date.now(),
        status: 'received',
      }
      this.persist(message)
    })
    this.setStatus({ status: 'connected', error: undefined })
  }

  private persist(message: UnifiedMessage): void {
    this.repository.saveMessage(message)
    this.events.onMessage(message)
    this.events.onConversationsChanged(this.businessId)
  }

  private statePath(): string {
    const dir = join(app.getPath('userData'), 'messaging', this.businessId)
    mkdirSync(dir, { recursive: true })
    return join(dir, 'facebook.appstate.json')
  }

  private readState(): unknown | null {
    const p = this.statePath()
    if (!existsSync(p)) return null
    const raw = readFileSync(p, 'utf8')
    if (!raw) return null
    const json = safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(Buffer.from(raw, 'base64')) : raw
    try {
      return JSON.parse(json) as unknown
    } catch {
      return null
    }
  }

  private writeState(state: unknown): void {
    const json = JSON.stringify(state)
    const value = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(json).toString('base64') : json
    writeFileSync(this.statePath(), value, 'utf8')
  }

  private clearState(): void {
    const p = this.statePath()
    if (existsSync(p)) writeFileSync(p, '', 'utf8')
  }

  private setStatus(update: Partial<ChannelSession>): void {
    this.session = { ...this.session, ...update, businessId: this.businessId, channel: 'facebook' }
    this.repository.saveSession(this.session)
    this.events.onStatus(this.session)
  }
}
