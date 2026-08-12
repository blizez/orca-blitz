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
      sendMessage: (channel: string, data: unknown) => Promise<unknown>
      onMessage: (callback: (...args: unknown[]) => void) => () => void
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
