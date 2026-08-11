import { useState } from 'react'
import { SiWhatsapp, SiInstagram, SiFacebook, SiTiktok, SiTelegram, SiX } from 'react-icons/si'
import { MessageCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { type Tab } from './browser-tab-bar'
import { BrowserView } from './browser-view'

export interface Platform {
  id: string
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

export const platforms: Platform[] = [
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: SiWhatsapp },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', icon: SiInstagram },
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com', icon: SiFacebook },
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com', icon: SiTiktok },
  { id: 'telegram', name: 'Telegram', url: 'https://web.telegram.org', icon: SiTelegram },
  { id: 'twitter', name: 'X / Twitter', url: 'https://x.com', icon: SiX },
]

export function createNewTab(closable = false): Tab {
  return {
    id: `tab-${Date.now()}`,
    title: 'New Tab',
    url: '',
    icon: 'home',
    partition: '',
    closable,
  }
}

interface SocialMediaPageProps {
  tabs: Tab[]
  activeTabId: string
  onPickPlatform: (tabId: string, platform: Platform) => void
}

export function SocialMediaPage({ tabs, activeTabId, onPickPlatform }: SocialMediaPageProps) {
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const isNewTab = activeTab?.url === ''

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {isNewTab && activeTab && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <div>
              <h2 className="text-xl font-semibold">Open a Social Network</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a platform to open it in this tab.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon
                return (
                  <button
                    key={platform.id}
                    onClick={() => onPickPlatform(activeTab.id, platform)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="size-6" />
                    <span className="text-sm font-medium">{platform.name}</span>
                  </button>
                )
              })}
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-4">
                <MessageCircle className="size-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Unified Inbox</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tabs.filter((t) => t.url).map((tab) => {
        const isActive = tab.id === activeTabId && !isNewTab
        return (
          <div
            key={tab.id}
            className={cn(
              'absolute inset-0 overflow-hidden',
              !isActive && 'pointer-events-none'
            )}
          >
            <BrowserView
              viewId={tab.id}
              url={tab.url}
              partition={tab.partition}
              isActive={isActive}
              platformId={tab.icon}
            />
          </div>
        )
      })}
    </div>
  )
}
