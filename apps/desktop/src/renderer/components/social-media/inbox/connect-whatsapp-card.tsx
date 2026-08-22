import { useState } from 'react'
import { QrCode, RefreshCw, Smartphone, Wifi, WifiOff } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { ChannelSession } from '@orca-blitz/shared'

interface ConnectChannelCardProps {
  channel: 'whatsapp' | 'telegram' | 'instagram' | 'facebook'
  session: ChannelSession | null
  qr: string | null
  onConnect: (value?: string) => void
  onSubmitCode: (value: string) => void
  onSubmitPassword: (value: string) => void
  onDisconnect: () => void
}

export function ConnectWhatsAppCard({ channel, session, qr, onConnect, onSubmitCode, onSubmitPassword, onDisconnect }: ConnectChannelCardProps) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const status = session?.status ?? 'disconnected'
  const isTelegram = channel === 'telegram'
  const isMeta = channel === 'instagram' || channel === 'facebook'
  const name = channel === 'telegram' ? 'Telegram' : channel === 'instagram' ? 'Instagram' : channel === 'facebook' ? 'Facebook Messenger' : 'WhatsApp'

  if (status === 'qr' && qr) return <Card><div className="rounded-xl bg-white p-4"><QRCodeSVG value={qr} size={220} /></div><h2 className="text-lg font-semibold">Escanea el código QR</h2><p className="text-sm text-muted-foreground">Abre WhatsApp, entra en Dispositivos vinculados y escanea este código.</p><button type="button" onClick={onDisconnect} className="mt-2 rounded-lg border border-border bg-card px-6 py-2 text-sm font-medium hover:bg-accent">Cancelar</button></Card>
  if (status === 'connecting') return <Card><RefreshCw className="size-8 animate-spin text-primary" /><h2 className="font-semibold">Conectando {name}...</h2><p className="text-sm text-muted-foreground">Estamos preparando tu sesión segura.</p></Card>
  if (status === 'code') return <Card><Smartphone className="size-8 text-primary" /><h2 className="font-semibold">Código de Telegram</h2><p className="text-sm text-muted-foreground">Escribe el código que Telegram envió a tu aplicación.</p><input value={code} onChange={(event) => setCode(event.target.value)} placeholder="12345" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-center outline-none focus:border-ring" /><button type="button" onClick={() => onSubmitCode(code)} className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Verificar código</button></Card>
  if (status === 'password') return <Card><Smartphone className="size-8 text-primary" /><h2 className="font-semibold">Contraseña de Telegram</h2><p className="text-sm text-muted-foreground">Tu cuenta tiene verificación en dos pasos.</p><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña 2FA" className="h-10 w-full rounded-lg border border-border bg-background px-3 outline-none focus:border-ring" /><button type="button" onClick={() => onSubmitPassword(password)} className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Verificar contraseña</button></Card>
  if (status === 'connected') return <Card><Wifi className="size-8 text-primary" /><div><h2 className="font-semibold">{name} conectado</h2><p className="mt-1 text-sm text-muted-foreground">{session?.name || session?.phone || 'Sesión activa'}</p></div><button type="button" onClick={onDisconnect} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent">Desconectar</button></Card>

  return <Card><div className="flex size-10 items-center justify-center rounded-full bg-primary/10">{status === 'error' ? <WifiOff className="size-5 text-destructive" /> : <QrCode className="size-5 text-primary" />}</div><div><h2 className="text-lg font-semibold">Conecta tu {name}</h2><p className="mt-1 text-sm text-muted-foreground">{isTelegram ? 'Usa tu teléfono y el código que Telegram te enviará.' : isMeta ? 'Inicia sesión con Meta para autorizar el acceso oficial a tus mensajes.' : 'Escanea un QR una sola vez. No necesitas API key ni suscripción.'}</p></div>{isTelegram ? <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+52 555 000 0000" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring" /> : null}<button type="button" onClick={() => onConnect(isTelegram ? phone : undefined)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Smartphone className="size-4" /> {isMeta ? 'Iniciar sesión con Meta' : `Conectar ${name}`}</button>{session?.error === 'telegram_credentials_missing' && <p className="text-xs text-destructive">Telegram requiere las credenciales internas de la aplicación.</p>}{session?.error === 'meta_credentials_missing' && <p className="text-xs text-destructive">Meta requiere las credenciales internas de la aplicación.</p>}{session?.error && !['telegram_credentials_missing', 'meta_credentials_missing'].includes(session.error) && <p className="text-xs text-destructive">No se pudo conectar. Inténtalo de nuevo.</p>}</Card>
}

function Card({ children }: { children: React.ReactNode }) { return <div className="flex h-full w-full items-center justify-center"><div className="flex w-full flex-col items-center gap-4 bg-card px-8 py-8 text-center">{children}</div></div> }
