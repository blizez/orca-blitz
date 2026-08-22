/// <reference types="vite/client" />

interface Window {
  electron: typeof import('@electron-toolkit/preload').electronAPI
  api: {
    window: {
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
      onMaximized: (callback: (maximized: boolean) => void) => () => void
    }
    customers: {
      create: (data: unknown) => Promise<unknown>
      list: () => Promise<unknown[]>
      get: (id: string) => Promise<unknown>
      update: (id: string, data: unknown) => Promise<unknown>
      delete: (id: string) => Promise<void>
      onChanged: (callback: (...args: unknown[]) => void) => () => void
    }
    workflows: {
      create: (data: unknown) => Promise<unknown>
      list: () => Promise<unknown[]>
      execute: (id: string) => Promise<unknown>
      onChanged: (callback: (...args: unknown[]) => void) => () => void
    }
    integrations: {
      connect: (businessId: string) => Promise<unknown>
      telegramConnect: (businessId: string) => Promise<unknown>
      telegramStartLogin: (businessId: string, phone: string) => Promise<unknown>
      telegramSubmitCode: (businessId: string, code: string) => Promise<void>
      telegramSubmitPassword: (businessId: string, password: string) => Promise<void>
      telegramDisconnect: (businessId: string) => Promise<void>
      metaGetStatus: (businessId: string, channel: string) => Promise<unknown>
      metaStart: (businessId: string, channel: string) => Promise<unknown>
      metaDisconnect: (businessId: string, channel: string) => Promise<unknown>
      instagramLogin: (businessId: string, username: string, password: string) => Promise<unknown>
      instagramDisconnect: (businessId: string) => Promise<unknown>
      messengerLogin: (businessId: string, email: string, password: string) => Promise<unknown>
      messengerDisconnect: (businessId: string) => Promise<unknown>
      gmailGetStatus: (businessId: string) => Promise<unknown>
      gmailConnect: (businessId: string) => Promise<unknown>
      gmailDisconnect: (businessId: string) => Promise<unknown>
      disconnect: (businessId: string) => Promise<void>
      getStatus: (businessId: string, channel?: string) => Promise<unknown>
      listConversations: (businessId: string, channel?: string) => Promise<unknown[]>
      listMessages: (businessId: string, jid: string, channel?: string) => Promise<unknown[]>
      markRead: (businessId: string, jid: string, channel?: string) => Promise<void>
      sendMessage: (businessId: string, jid: string, text: string, channel?: string) => Promise<void>
      onMessage: (callback: (...args: unknown[]) => void) => () => void
      onQR: (callback: (data: { businessId: string; qr: string }) => void) => () => void
      onStatus: (callback: (data: unknown) => void) => () => void
      onConversationsChanged: (callback: (data: { businessId: string }) => void) => () => void
    }
    reports: {
      generate: (config: unknown) => Promise<unknown>
      export: (format: string) => Promise<unknown>
    }
    settings: {
      get: () => Promise<unknown>
      update: (prefs: unknown) => Promise<void>
    }
    plugins: {
      install: (manifest: unknown) => Promise<unknown>
      enable: (id: string) => Promise<void>
      disable: (id: string) => Promise<void>
      list: () => Promise<unknown[]>
    }
    businesses: {
      list: () => Promise<unknown[]>
      create: (data: unknown) => Promise<unknown>
      update: (id: string, data: unknown) => Promise<unknown>
      delete: (id: string) => Promise<void>
      onChanged: (callback: (...args: unknown[]) => void) => () => void
    }
    openai: {
      startAuth: () => Promise<void>
      cancelAuth: () => Promise<void>
      onAuthUrl: (callback: (url: string) => void) => () => void
      onAuthToken: (callback: (data: { accessToken: string; refreshToken: string }) => void) => () => void
      onAuthModels: (callback: (models: string[]) => void) => () => void
      onAuthCode: (callback: (data: { code: string; codeVerifier: string }) => void) => () => void
      onAuthError: (callback: (error: string) => void) => () => void
    }
    chatgpt: {
      setToken: (token: string) => void
      send: (model: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>) => Promise<string>
      stream: (model: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>) => Promise<void>
      user: () => Promise<{ plan?: string; email?: string } | null>
      hasToken: () => Promise<boolean>
      onStreamChunk: (callback: (chunk: string | null) => void) => () => void
    }
    browser: {
      create: (id: string, url: string, partition: string, platformId: string) => Promise<void>
      show: (id: string, bounds: { x: number; y: number; width: number; height: number }) => void
      hide: (id: string) => void
      position: (id: string, bounds: { x: number; y: number; width: number; height: number }) => void
      destroy: (id: string) => void
      css: (id: string, css: string) => void
      onDidLoad: (callback: (id: string) => void) => () => void
      onDidFail: (callback: (id: string, code: number, desc: string) => void) => () => void
      goBack: (id: string) => void
      goForward: (id: string) => void
      reload: (id: string) => void
      canGoBack: (id: string) => Promise<boolean>
      canGoForward: (id: string) => Promise<boolean>
    }
  }
}
