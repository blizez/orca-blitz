import { ipcMain } from 'electron'
import { randomUUID } from 'crypto'

interface Business {
  id: string
  name: string
  type: string
  industry: string
  description: string
  website: string
  products: string
  audience: string
  competitors: string
  usp: string
  painPoints: string
  monthlyRevenue: string
  yearEstablished: string
  channels: string[]
  goals: string[]
  teamSize: string
}

const businesses = new Map<string, Business>()
const settings = { theme: 'system' as string }

function notifyBusinesses() {
  const { BrowserWindow } = require('electron')
  const list = Array.from(businesses.values())
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('businesses:changed', list)
  }
}

export function registerCoreHandlers() {
  ipcMain.handle('businesses:list', () => Array.from(businesses.values()))

  ipcMain.handle('businesses:create', (_e, data: Partial<Business>) => {
    const biz: Business = {
      id: randomUUID(),
      name: data.name || 'New Business',
      type: data.type || 'Other',
      industry: data.industry || '',
      description: data.description || '',
      website: data.website || '',
      products: data.products || '',
      audience: data.audience || '',
      competitors: data.competitors || '',
      usp: data.usp || '',
      painPoints: data.painPoints || '',
      monthlyRevenue: data.monthlyRevenue || '',
      yearEstablished: data.yearEstablished || '',
      channels: data.channels || [],
      goals: data.goals || [],
      teamSize: data.teamSize || 'Just me',
    }
    businesses.set(biz.id, biz)
    notifyBusinesses()
    return biz
  })

  ipcMain.handle('businesses:update', (_e, id: string, data: Partial<Business>) => {
    const biz = businesses.get(id)
    if (!biz) return null
    const updated = { ...biz, ...data }
    businesses.set(id, updated)
    notifyBusinesses()
    return updated
  })

  ipcMain.handle('businesses:delete', (_e, id: string) => {
    businesses.delete(id)
    notifyBusinesses()
    return true
  })

  ipcMain.handle('customers:list', () => [])
  ipcMain.handle('customers:get', (_e, id: string) => null)
  ipcMain.handle('customers:create', (_e, data: unknown) => ({ id: randomUUID(), ...(data as object) }))
  ipcMain.handle('customers:update', (_e, id: string, data: unknown) => null)
  ipcMain.handle('customers:delete', (_e, id: string) => true)

  ipcMain.handle('workflows:list', () => [])
  ipcMain.handle('workflows:create', (_e, data: unknown) => ({ id: randomUUID(), ...(data as object) }))
  ipcMain.handle('workflows:execute', (_e, id: string) => ({ success: true }))

  ipcMain.handle('integrations:sendMessage', (_e, channel: string, data: unknown) => ({ success: true }))

  ipcMain.handle('reports:generate', (_e, config: unknown) => ({ reportId: randomUUID() }))
  ipcMain.handle('reports:export', (_e, format: string) => ({ path: '' }))

  ipcMain.handle('settings:get', () => settings)
  ipcMain.handle('settings:update', (_e, prefs: Partial<typeof settings>) => {
    Object.assign(settings, prefs)
    return settings
  })

  ipcMain.handle('plugins:list', () => [])
  ipcMain.handle('plugins:install', (_e, manifest: unknown) => ({ success: true }))
  ipcMain.handle('plugins:enable', (_e, id: string) => true)
  ipcMain.handle('plugins:disable', (_e, id: string) => true)
}
