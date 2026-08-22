import { SiFacebook, SiGmail, SiInstagram, SiTelegram, SiTiktok, SiWhatsapp, SiX } from 'react-icons/si'
import type { ComponentType } from 'react'

export type PlatformTier = 'priority' | 'future'

export interface SocialMediaPlatform {
  id: string
  name: string
  url: string
  icon: ComponentType<{ className?: string }>
  tier: PlatformTier
  messaging: 'ready' | 'planned' | 'browser'
}

export const priorityPlatforms: SocialMediaPlatform[] = [
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: SiWhatsapp, tier: 'priority', messaging: 'ready' },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', icon: SiInstagram, tier: 'priority', messaging: 'planned' },
  { id: 'facebook-messenger', name: 'Facebook Messenger', url: 'https://www.messenger.com', icon: SiFacebook, tier: 'priority', messaging: 'planned' },
  { id: 'telegram', name: 'Telegram', url: 'https://web.telegram.org', icon: SiTelegram, tier: 'priority', messaging: 'ready' },
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', icon: SiGmail, tier: 'priority', messaging: 'planned' },
]

export const futurePlatforms: SocialMediaPlatform[] = [
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com', icon: SiTiktok, tier: 'future', messaging: 'browser' },
  { id: 'twitter', name: 'X / Twitter', url: 'https://x.com', icon: SiX, tier: 'future', messaging: 'browser' },
]

export const platforms = [...priorityPlatforms, ...futurePlatforms]
