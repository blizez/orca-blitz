type Listener = (...args: unknown[]) => void

function createEventEmitter() {
  const listeners = new Map<string, Set<Listener>>()
  return {
    on(event: string, cb: Listener) {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)!.add(cb)
    },
    off(event: string, cb: Listener) {
      listeners.get(event)?.delete(cb)
    },
    emit(event: string, ...args: unknown[]) {
      listeners.get(event)?.forEach((cb) => cb(...args))
    },
  }
}

const bus = createEventEmitter()

// In-memory stores
let businesses: Record<string, unknown>[] = JSON.parse(localStorage.getItem('oc_businesses') || '[]')
let customers: Record<string, unknown>[] = JSON.parse(localStorage.getItem('oc_customers') || '[]')
let workflows: Record<string, unknown>[] = JSON.parse(localStorage.getItem('oc_workflows') || '[]')
let settingsData = JSON.parse(localStorage.getItem('oc_settings') || '{"theme":"system"}')

function persist(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data))
}

function uuid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
}

const api = {
  window: {
    minimize: () => {},
    maximize: () => {},
    close: () => {},
    isMaximized: async () => false,
    onMaximized: () => () => {},
  },
  customers: {
    list: async () => customers,
    get: async (id: string) => customers.find((c) => c.id === id) ?? null,
    create: async (data: unknown) => {
      const c = { id: uuid(), ...(data as object) }
      customers.push(c)
      persist('oc_customers', customers)
      bus.emit('customers:changed', customers)
      return c
    },
    update: async (id: string, data: unknown) => {
      customers = customers.map((c) => (c.id === id ? { ...c, ...(data as Record<string, unknown>) } : c))
      persist('oc_customers', customers)
      bus.emit('customers:changed', customers)
      return customers.find((c) => c.id === id) ?? null
    },
    delete: async (id: string) => {
      customers = customers.filter((c) => c.id !== id)
      persist('oc_customers', customers)
      bus.emit('customers:changed', customers)
      return true
    },
    onChanged: (cb: Listener) => { bus.on('customers:changed', cb); return () => bus.off('customers:changed', cb) },
  },
  workflows: {
    list: async () => workflows,
    create: async (data: unknown) => {
      const w = { id: uuid(), ...(data as object) }
      workflows.push(w)
      persist('oc_workflows', workflows)
      bus.emit('workflows:changed', workflows)
      return w
    },
    execute: async (_id: string) => ({ success: true }),
    onChanged: (cb: Listener) => { bus.on('workflows:changed', cb); return () => bus.off('workflows:changed', cb) },
  },
  integrations: (() => {
    const sessions = new Map<string, Record<string, unknown>>()
    // restore persisted sessions
    try {
      const raw = localStorage.getItem('oc_sessions')
      if (raw) (JSON.parse(raw) as [string, Record<string, unknown>][]).forEach(([k, v]) => sessions.set(k, v))
    } catch {}
    const key = (businessId: string, channel: string) => `${businessId}:${channel}`
    const get = (businessId: string, channel: string) =>
      sessions.get(key(businessId, channel)) ?? { businessId, channel, status: 'disconnected' }
    const set = (businessId: string, channel: string, patch: Record<string, unknown>) => {
      const next = { ...get(businessId, channel), ...patch, businessId, channel }
      sessions.set(key(businessId, channel), next)
      localStorage.setItem('oc_sessions', JSON.stringify([...sessions.entries()]))
      bus.emit('integrations:status', next)
      return next
    }
    return {
      connect: async (businessId: string) => {
        // simulate QR flow in web
        const s = set(businessId, 'whatsapp', { status: 'qr' })
        setTimeout(() => bus.emit('integrations:qr', { businessId, qr: 'mock-qr-' + Date.now() }), 300)
        return s
      },
      telegramConnect: async (businessId: string) => set(businessId, 'telegram', { status: 'phone' }),
      telegramStartLogin: async (businessId: string, _phone: string) => set(businessId, 'telegram', { status: 'code' }),
      telegramSubmitCode: async (businessId: string, _code: string) => set(businessId, 'telegram', { status: 'password' }),
      telegramSubmitPassword: async (businessId: string, _password: string) =>
        set(businessId, 'telegram', { status: 'connected', phone: '+000000' }),
      telegramDisconnect: async (businessId: string) => set(businessId, 'telegram', { status: 'disconnected' }),
      metaGetStatus: async (businessId: string, channel: string) => get(businessId, channel),
      metaStart: async (businessId: string, channel: string) => set(businessId, channel, { status: 'error', error: 'meta_credentials_missing' }),
      metaDisconnect: async (businessId: string, channel: string) => set(businessId, channel, { status: 'disconnected', error: undefined }),
      instagramLogin: async (businessId: string, username: string, _password: string) =>
        set(businessId, 'instagram', { status: 'connected', phone: username, name: username }),
      instagramDisconnect: async (businessId: string) => set(businessId, 'instagram', { status: 'disconnected', error: undefined }),
      messengerLogin: async (businessId: string, email: string, _password: string) =>
        set(businessId, 'facebook', { status: 'connected', phone: email, name: email }),
      messengerDisconnect: async (businessId: string) => set(businessId, 'facebook', { status: 'disconnected', error: undefined }),
      gmailGetStatus: async (businessId: string) => get(businessId, 'gmail'),
      gmailConnect: async (businessId: string) => set(businessId, 'gmail', { status: 'error', error: 'google_credentials_missing' }),
      gmailDisconnect: async (businessId: string) => set(businessId, 'gmail', { status: 'disconnected', error: undefined }),
      disconnect: async (businessId: string) => set(businessId, 'whatsapp', { status: 'disconnected' }),
      getStatus: async (businessId: string, channel = 'whatsapp') => get(businessId, channel),
      listConversations: async (_businessId: string, _channel = 'whatsapp') => [],
      listMessages: async (_businessId: string, _jid: string, _channel = 'whatsapp') => [],
      markRead: async (_businessId: string, _jid: string, _channel = 'whatsapp') => {},
      sendMessage: async (_businessId: string, _jid: string, _text: string, _channel = 'whatsapp') => {},
      onMessage: (cb: Listener) => { bus.on('integrations:message', cb); return () => bus.off('integrations:message', cb) },
      onQR: (cb: Listener) => { bus.on('integrations:qr', cb as Listener); return () => bus.off('integrations:qr', cb as Listener) },
      onStatus: (cb: Listener) => { bus.on('integrations:status', cb); return () => bus.off('integrations:status', cb) },
      onConversationsChanged: (cb: Listener) => { bus.on('integrations:conversations-changed', cb); return () => bus.off('integrations:conversations-changed', cb) },
    }
  })(),
  reports: {
    generate: async (_config: unknown) => ({ reportId: uuid() }),
    export: async (_format: string) => ({ path: '' }),
  },
  settings: {
    get: async () => settingsData,
    update: async (prefs: unknown) => {
      settingsData = { ...settingsData, ...(prefs as Record<string, unknown>) }
      persist('oc_settings', settingsData)
      return settingsData
    },
  },
  businesses: {
    list: async () => businesses,
    create: async (data: unknown) => {
      const b = { id: uuid(), ...(data as object) }
      businesses.push(b)
      persist('oc_businesses', businesses)
      bus.emit('businesses:changed', businesses)
      return b
    },
    update: async (id: string, data: unknown) => {
      businesses = businesses.map((b) => (b.id === id ? { ...b, ...(data as Record<string, unknown>) } : b))
      persist('oc_businesses', businesses)
      bus.emit('businesses:changed', businesses)
      return businesses.find((b) => b.id === id) ?? null
    },
    delete: async (id: string) => {
      businesses = businesses.filter((b) => b.id !== id)
      persist('oc_businesses', businesses)
      bus.emit('businesses:changed', businesses)
      return true
    },
    onChanged: (cb: Listener) => { bus.on('businesses:changed', cb); return () => bus.off('businesses:changed', cb) },
  },
  plugins: {
    install: async (_manifest: unknown) => ({ success: true }),
    enable: async (_id: string) => true,
    disable: async (_id: string) => true,
    list: async () => [],
  },
  openai: {
    startAuth: async () => {},
    cancelAuth: async () => {},
    onAuthUrl: () => () => {},
    onAuthToken: () => () => {},
    onAuthModels: () => () => {},
    onAuthCode: () => () => {},
    onAuthError: () => () => {},
  },
  chatgpt: {
    setToken: (_token: string) => {},
    send: async (_model: string, _messages: Array<{ role: 'user' | 'assistant'; content: string }>) => '',
    stream: async (_model: string, _messages: Array<{ role: 'user' | 'assistant'; content: string }>) => {},
    user: async () => null,
    hasToken: async () => false,
    onStreamChunk: () => () => {},
  },
  browser: {
    create: async (_id: string, _url: string, _partition: string, _platformId: string) => {},
    show: (_id: string, _bounds: { x: number; y: number; width: number; height: number }) => {},
    hide: (_id: string) => {},
    position: (_id: string, _bounds: { x: number; y: number; width: number; height: number }) => {},
    destroy: (_id: string) => {},
    css: (_id: string, _css: string) => {},
    onDidLoad: (_cb: (id: string) => void) => () => {},
    onDidFail: (_cb: (id: string, code: number, desc: string) => void) => () => {},
    goBack: (_id: string) => {},
    goForward: (_id: string) => {},
    reload: (_id: string) => {},
    canGoBack: async (_id: string) => false,
    canGoForward: async (_id: string) => false,
  },
}

;(window as any).api = api
export {}
