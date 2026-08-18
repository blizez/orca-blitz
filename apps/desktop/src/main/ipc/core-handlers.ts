import { ipcMain, app } from 'electron'
import { randomUUID } from 'crypto'
import { mkdirSync, readdirSync, existsSync, writeFileSync, readFileSync, rmSync } from 'fs'
import { join } from 'path'

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getBusinessesDir(): string {
  const dir = join(app.getPath('userData'), 'businesses')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function getBusinessDir(slug: string): string {
  const dir = join(getBusinessesDir(), slug)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

const businesses = new Map<string, Business>()
const settings = { theme: 'system' as string }

function loadBusinessesFromDisk() {
  const dir = getBusinessesDir()
  const folders = readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
  for (const folder of folders) {
    const metaPath = join(dir, folder, 'business.json')
    if (existsSync(metaPath)) {
      try {
        const data = JSON.parse(readFileSync(metaPath, 'utf-8')) as Business
        businesses.set(data.id, data)
      } catch { /* corrupt file, skip */ }
    }
  }
}

function notifyBusinesses() {
  const { BrowserWindow } = require('electron')
  const list = Array.from(businesses.values())
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('businesses:changed', list)
  }
}

export function registerCoreHandlers() {
  loadBusinessesFromDisk()

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
    const slug = slugify(biz.name)
    const bizDir = getBusinessDir(slug)
    writeFileSync(join(bizDir, 'business.json'), JSON.stringify(biz, null, 2), 'utf-8')
    businesses.set(biz.id, biz)
    notifyBusinesses()
    return biz
  })

  ipcMain.handle('businesses:update', (_e, id: string, data: Partial<Business>) => {
    const biz = businesses.get(id)
    if (!biz) return null
    const updated = { ...biz, ...data }
    businesses.set(id, updated)
    const slug = slugify(updated.name)
    const bizDir = getBusinessDir(slug)
    writeFileSync(join(bizDir, 'business.json'), JSON.stringify(updated, null, 2), 'utf-8')
    notifyBusinesses()
    return updated
  })

  ipcMain.handle('businesses:delete', (_e, id: string) => {
    const biz = businesses.get(id)
    if (biz) {
      const slug = slugify(biz.name)
      const bizDir = join(getBusinessesDir(), slug)
      if (existsSync(bizDir)) rmSync(bizDir, { recursive: true })
    }
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
