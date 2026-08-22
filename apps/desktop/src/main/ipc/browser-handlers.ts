import { WebContentsView, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync, writeFileSync, mkdirSync } from 'fs'

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'

const views = new Map<string, WebContentsView>()
const platformIds = new WeakMap<Electron.WebContents, string>()
let activeViewId: string | null = null

const CSS_BY_PLATFORM: Record<string, string> = {}

const SPOOF_SCRIPT = `
Object.defineProperty(navigator, 'userAgentData', {
  get: () => ({
    brands: [
      { brand: 'Google Chrome', version: '134' },
      { brand: 'Chromium', version: '134' },
      { brand: 'Not/A)Brand', version: '99' }
    ],
    mobile: false,
    platform: 'Windows'
  })
});
`

function getPreloadPath(): string {
  const dir = join(process.env.APPDATA || process.env.HOME || '', 'orca-blitz')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const file = join(dir, 'browser-preload.js')
  writeFileSync(file, SPOOF_SCRIPT, 'utf-8')
  return file
}

function injectCSS(view: WebContentsView) {
  const platformId = platformIds.get(view.webContents)
  if (!platformId) return
  const css = CSS_BY_PLATFORM[platformId]
  if (!css) return
  view.webContents.insertCSS(css)
}

export function registerBrowserHandlers(mainWindow: BrowserWindow) {
  const preloadPath = getPreloadPath()

  ipcMain.handle('browser:create', (_e, id: string, url: string, partition: string, platformId: string) => {
    if (views.has(id)) return

    const view = new WebContentsView({
      webPreferences: {
        partition,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        preload: preloadPath
      }
    })
    platformIds.set(view.webContents, platformId)

    view.webContents.setUserAgent(CHROME_UA)

    view.webContents.on('did-finish-load', () => {
      injectCSS(view)
      mainWindow.webContents.send('browser:did-load', id)
    })

    view.webContents.on('did-fail-load', (_e, code, desc) => {
      mainWindow.webContents.send('browser:did-fail', id, code, desc)
    })

    view.webContents.setWindowOpenHandler(() => ({ action: 'deny' as const }))

    views.set(id, view)
    view.webContents.loadURL(url)
  })

  ipcMain.on('browser:show', (_e, id: string, bounds: { x: number; y: number; width: number; height: number }) => {
    const view = views.get(id)
    if (!view) return
    for (const child of mainWindow.contentView.children) {
      try { mainWindow.contentView.removeChildView(child) } catch {}
    }
    mainWindow.contentView.addChildView(view)
    view.setBounds(bounds)
    activeViewId = id
  })

  ipcMain.on('browser:hide', (_e, id: string) => {
    const view = views.get(id)
    if (!view) return
    try { mainWindow.contentView.removeChildView(view) } catch {}
    if (activeViewId === id) activeViewId = null
  })

  ipcMain.on('browser:position', (_e, id: string, bounds: { x: number; y: number; width: number; height: number }) => {
    const view = views.get(id)
    if (!view) return
    view.setBounds(bounds)
  })

  ipcMain.on('browser:destroy', (_e, id: string) => {
    const view = views.get(id)
    if (!view) return
    try { mainWindow.contentView.removeChildView(view) } catch {}
    view.webContents.close()
    views.delete(id)
    if (activeViewId === id) activeViewId = null
  })

  ipcMain.on('browser:css', (_e, id: string, css: string) => {
    const view = views.get(id)
    if (!view) return
    view.webContents.insertCSS(css)
  })

  ipcMain.on('browser:goBack', (_e, id: string) => {
    const view = views.get(id)
    if (!view) return
    if (view.webContents.canGoBack()) view.webContents.goBack()
  })

  ipcMain.on('browser:goForward', (_e, id: string) => {
    const view = views.get(id)
    if (!view) return
    if (view.webContents.canGoForward()) view.webContents.goForward()
  })

  ipcMain.on('browser:reload', (_e, id: string) => {
    const view = views.get(id)
    if (!view) return
    view.webContents.reload()
  })

  ipcMain.handle('browser:canGoBack', (_e, id: string) => {
    const view = views.get(id)
    return view?.webContents.canGoBack() ?? false
  })

  ipcMain.handle('browser:canGoForward', (_e, id: string) => {
    const view = views.get(id)
    return view?.webContents.canGoForward() ?? false
  })
}
