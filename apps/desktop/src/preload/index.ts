import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximized: (callback: (maximized: boolean) => void) => {
      const handler = (_event: unknown, maximized: boolean) => callback(maximized)
      ipcRenderer.on('window:maximized', handler)
      return () => { ipcRenderer.removeListener('window:maximized', handler) }
    }
  },
  customers: {
    create: (data: unknown) => ipcRenderer.invoke('customers:create', data),
    list: () => ipcRenderer.invoke('customers:list'),
    get: (id: string) => ipcRenderer.invoke('customers:get', id),
    update: (id: string, data: unknown) => ipcRenderer.invoke('customers:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('customers:delete', id),
    onChanged: (callback: (...args: unknown[]) => void) => {
      ipcRenderer.on('customers:changed', (_event, ...args) => callback(...args))
      return () => {
        ipcRenderer.removeAllListeners('customers:changed')
      }
    }
  },
  workflows: {
    create: (data: unknown) => ipcRenderer.invoke('workflows:create', data),
    list: () => ipcRenderer.invoke('workflows:list'),
    execute: (id: string) => ipcRenderer.invoke('workflows:execute', id),
    onChanged: (callback: (...args: unknown[]) => void) => {
      ipcRenderer.on('workflows:changed', (_event, ...args) => callback(...args))
      return () => {
        ipcRenderer.removeAllListeners('workflows:changed')
      }
    }
  },
  integrations: {
    sendMessage: (channel: string, data: unknown) => ipcRenderer.invoke('integrations:sendMessage', channel, data),
    onMessage: (callback: (...args: unknown[]) => void) => {
      ipcRenderer.on('integrations:message', (_event, ...args) => callback(...args))
      return () => {
        ipcRenderer.removeAllListeners('integrations:message')
      }
    }
  },
  reports: {
    generate: (config: unknown) => ipcRenderer.invoke('reports:generate', config),
    export: (format: string) => ipcRenderer.invoke('reports:export', format)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (prefs: unknown) => ipcRenderer.invoke('settings:update', prefs)
  },
  plugins: {
    install: (manifest: unknown) => ipcRenderer.invoke('plugins:install', manifest),
    enable: (id: string) => ipcRenderer.invoke('plugins:enable', id),
    disable: (id: string) => ipcRenderer.invoke('plugins:disable', id),
    list: () => ipcRenderer.invoke('plugins:list')
  },
  browser: {
    create: (id: string, url: string, partition: string, platformId: string) =>
      ipcRenderer.invoke('browser:create', id, url, partition, platformId),
    show: (id: string, bounds: { x: number; y: number; width: number; height: number }) =>
      ipcRenderer.send('browser:show', id, bounds),
    hide: (id: string) => ipcRenderer.send('browser:hide', id),
    position: (id: string, bounds: { x: number; y: number; width: number; height: number }) =>
      ipcRenderer.send('browser:position', id, bounds),
    destroy: (id: string) => ipcRenderer.send('browser:destroy', id),
    css: (id: string, css: string) => ipcRenderer.send('browser:css', id, css),
    onDidLoad: (callback: (id: string) => void) => {
      const handler = (_event: unknown, id: string) => callback(id)
      ipcRenderer.on('browser:did-load', handler)
      return () => { ipcRenderer.removeListener('browser:did-load', handler) }
    },
    onDidFail: (callback: (id: string, code: number, desc: string) => void) => {
      const handler = (_event: unknown, id: string, code: number, desc: string) => callback(id, code, desc)
      ipcRenderer.on('browser:did-fail', handler)
      return () => { ipcRenderer.removeListener('browser:did-fail', handler) }
    },
    goBack: (id: string) => ipcRenderer.send('browser:goBack', id),
    goForward: (id: string) => ipcRenderer.send('browser:goForward', id),
    reload: (id: string) => ipcRenderer.send('browser:reload', id),
    canGoBack: (id: string) => ipcRenderer.invoke('browser:canGoBack', id),
    canGoForward: (id: string) => ipcRenderer.invoke('browser:canGoForward', id)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error fallback for non-isolated context
  window.electron = electronAPI
  // @ts-expect-error fallback for non-isolated context
  window.api = api
}
