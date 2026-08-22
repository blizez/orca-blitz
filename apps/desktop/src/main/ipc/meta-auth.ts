import { BrowserWindow, ipcMain, safeStorage, shell } from 'electron'
import { randomBytes } from 'crypto'
import http from 'http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import { URL } from 'url'
import type { ChannelSession } from '@orca-blitz/shared'
import { MessageRepository } from '../messaging/db/message-repository'

type MetaChannel = 'instagram' | 'facebook'
const REDIRECT_PORT = 1456
const repository = new MessageRepository()

export function registerMetaAuthHandlers(): void {
  let server: http.Server | null = null
  ipcMain.handle('integrations:meta:getStatus', (_event, businessId: string, channel: MetaChannel) => repository.getSession(businessId, channel))
  ipcMain.handle('integrations:meta:start', async (event, businessId: string, channel: MetaChannel) => {
    const sender = BrowserWindow.fromWebContents(event.sender)
    const config = getConfig()
    if (!config) {
      const session = saveStatus(businessId, channel, { status: 'error', error: 'meta_credentials_missing' })
      sender?.webContents.send('integrations:status', session)
      return session
    }
    server?.close()
    const state = randomBytes(24).toString('hex')
    const redirectUri = `http://localhost:${REDIRECT_PORT}/meta/callback`
    const authUrl = new URL('https://www.facebook.com/v23.0/dialog/oauth')
    authUrl.searchParams.set('client_id', config.appId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', channel === 'instagram' ? 'instagram_business_basic,instagram_business_manage_messages,pages_show_list,pages_read_engagement' : 'pages_show_list,pages_messaging,pages_manage_metadata')
    const session = saveStatus(businessId, channel, { status: 'connecting', error: undefined })
    sender?.webContents.send('integrations:status', session)

    await new Promise<void>((resolve, reject) => {
      server = http.createServer(async (request, response) => {
        const callback = new URL(request.url ?? '/', `http://localhost:${REDIRECT_PORT}`)
        if (callback.pathname !== '/meta/callback') return
        if (callback.searchParams.get('state') !== state) {
          response.writeHead(400); response.end('Invalid OAuth state'); return
        }
        const code = callback.searchParams.get('code')
        if (!code) {
          const error = callback.searchParams.get('error') ?? 'No authorization code'
          const failed = saveStatus(businessId, channel, { status: 'error', error })
          sender?.webContents.send('integrations:status', failed)
          response.writeHead(400); response.end('Meta authorization failed'); server?.close(); server = null; resolve(); return
        }
        try {
          const token = await exchangeCode(code, config, redirectUri)
          saveToken(businessId, channel, token.access_token)
          const connected = saveStatus(businessId, channel, { status: 'connected', error: undefined })
          sender?.webContents.send('integrations:status', connected)
          response.writeHead(200, { 'Content-Type': 'text/html' }); response.end('<h1>Meta conectado</h1><p>Puedes cerrar esta ventana.</p>')
        } catch (error) {
          const failed = saveStatus(businessId, channel, { status: 'error', error: error instanceof Error ? error.message : 'Meta token exchange failed' })
          sender?.webContents.send('integrations:status', failed)
          response.writeHead(500); response.end('Meta authorization failed')
        } finally { server?.close(); server = null; resolve() }
      })
      server.listen(REDIRECT_PORT, () => { void shell.openExternal(authUrl.toString()); resolve() })
      server.on('error', reject)
    })
    return session
  })
  ipcMain.handle('integrations:meta:disconnect', (_event, businessId: string, channel: MetaChannel) => {
    const path = tokenPath(businessId, channel)
    if (existsSync(path)) writeFileSync(path, '', 'utf8')
    return saveStatus(businessId, channel, { status: 'disconnected', error: undefined })
  })
}

function getConfig(): { appId: string; appSecret: string } | null {
  const appId = process.env.ORCA_META_APP_ID
  const appSecret = process.env.ORCA_META_APP_SECRET
  return appId && appSecret ? { appId, appSecret } : null
}

async function exchangeCode(code: string, config: { appId: string; appSecret: string }, redirectUri: string): Promise<{ access_token: string }> {
  const url = new URL('https://graph.facebook.com/v23.0/oauth/access_token')
  url.searchParams.set('client_id', config.appId); url.searchParams.set('client_secret', config.appSecret); url.searchParams.set('redirect_uri', redirectUri); url.searchParams.set('code', code)
  const response = await fetch(url)
  const data = await response.json() as { access_token?: string; error?: { message?: string } }
  if (!response.ok || !data.access_token) throw new Error(data.error?.message ?? 'Meta token exchange failed')
  return { access_token: data.access_token }
}

function tokenPath(businessId: string, channel: MetaChannel): string { const directory = join(app.getPath('userData'), 'messaging', businessId); mkdirSync(directory, { recursive: true }); return join(directory, `${channel}.token`) }
function saveToken(businessId: string, channel: MetaChannel, token: string): void { const value = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(token).toString('base64') : token; writeFileSync(tokenPath(businessId, channel), value, 'utf8') }
function saveStatus(businessId: string, channel: MetaChannel, update: Partial<ChannelSession>): ChannelSession { const session: ChannelSession = { ...repository.getSession(businessId, channel), ...update, businessId, channel }; repository.saveSession(session); return session }

export function readMetaToken(businessId: string, channel: MetaChannel): string | null { const path = tokenPath(businessId, channel); if (!existsSync(path)) return null; const value = readFileSync(path, 'utf8'); return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(Buffer.from(value, 'base64')) : value }
