import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { type Tab } from './browser-tab-bar'
import { BrowserView } from './browser-view'
import { InboxPage } from './inbox/inbox-page'
import { futurePlatforms, priorityPlatforms, platforms, type SocialMediaPlatform } from './social-media-platforms'

export type Platform = SocialMediaPlatform
export { platforms }

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
  businessId: string
  onOpenSettings: () => void
  tabs: Tab[]
  activeTabId: string
  onPickPlatform: (tabId: string, platform: Platform) => void
}

export function SocialMediaPage({ businessId, onOpenSettings, tabs, activeTabId, onPickPlatform }: SocialMediaPageProps) {
  const [showInbox, setShowInbox] = useState(false)
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const isNewTab = activeTab?.url === ''

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {isNewTab && activeTab && showInbox ? <InboxPage businessId={businessId} onBack={() => setShowInbox(false)} onOpenSettings={onOpenSettings} /> : isNewTab && activeTab && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <div>
              <h2 className="text-xl font-semibold">Social Media CRM</h2>
              <p className="mt-1 text-sm text-muted-foreground">Conecta y administra tus canales prioritarios desde un solo lugar.</p>
            </div>
            <p className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Canales prioritarios</p>
            <div className="grid grid-cols-3 gap-3">
              {priorityPlatforms.map((platform) => {
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
            <p className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Próximamente</p>
            <div className="grid grid-cols-2 gap-3">
              {futurePlatforms.map((platform) => {
                const Icon = platform.icon
                return <button key={platform.id} type="button" onClick={() => onPickPlatform(activeTab.id, platform)} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-left text-muted-foreground transition-colors hover:bg-accent"><Icon className="size-5" /><span className="text-sm font-medium">{platform.name}</span></button>
              })}
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-3 gap-3">
              <button type="button" onClick={() => setShowInbox(true)} className="col-span-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-4 transition-colors hover:bg-accent">
                <MessageCircle className="size-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Unified Inbox</span>
              </button>
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
