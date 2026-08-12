import { useState, useCallback, useRef, useEffect } from 'react'
import { Titlebar } from './components/layout/titlebar'
import { AppSidebar } from './components/layout/app-sidebar'
import { RightSidebar } from './components/layout/right-sidebar'
import { SettingsPage } from './components/settings/settings-page'
import { HomePage } from './components/home/home-page'
import { BusinessPage } from './components/business/business-page'
import { BrowserTabBar, type Tab } from './components/social-media/browser-tab-bar'
import { BrowserNavBar } from './components/social-media/browser-nav-bar'
import { createNewTab, type Platform } from './components/social-media/social-media-page'
import { OrcaLogo } from '@orca-blitz/ui/components/ui/logo'

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

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [tabs, setTabs] = useState<Tab[]>([createNewTab()])
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id)
  const [businessSettingsId, setBusinessSettingsId] = useState<string | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('orca-businesses')
    return saved ? JSON.parse(saved) : []
  })
  const forwardStack = useRef<Record<string, { title: string; url: string; icon: string; partition: string }>>({})

  useEffect(() => {
    localStorage.setItem('orca-businesses', JSON.stringify(businesses))
  }, [businesses])

  const isSocialMedia = activePage.includes(':redes')

  const addTab = useCallback(() => {
    const newTab = createNewTab(true)
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [])

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      setActiveTabId((prevId) => {
        if (prevId === id) {
          return next.length > 0 ? next[next.length - 1].id : ''
        }
        return prevId
      })
      if (next.length === 0) {
        const fresh = createNewTab()
        next.push(fresh)
        setActiveTabId(fresh.id)
      }
      return next
    })
  }, [])

  const pickPlatform = useCallback((tabId: string, platform: Platform) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? { ...t, title: platform.name, url: platform.url, icon: platform.id, partition: `persist:${platform.id}`, closable: true }
          : t
      )
    )
  }, [])

  const goHome = useCallback((tabId: string) => {
    setTabs((prev) => {
      const tab = prev.find((t) => t.id === tabId)
      if (tab?.url) {
        forwardStack.current[tabId] = {
          title: tab.title,
          url: tab.url,
          icon: tab.icon,
          partition: tab.partition,
        }
      }
      return prev.map((t) =>
        t.id === tabId
          ? { ...t, title: 'New Tab', url: '', icon: 'home', partition: '', closable: false }
          : t
      )
    })
  }, [])

  const goForwardTab = useCallback((tabId: string) => {
    const saved = forwardStack.current[tabId]
    if (!saved) return
    delete forwardStack.current[tabId]
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? { ...t, title: saved.title, url: saved.url, icon: saved.icon, partition: saved.partition, closable: true }
          : t
      )
    )
  }, [])

  const handleBusinessSettings = useCallback((biz: Business) => {
    setBusinessSettingsId(biz.id)
    setActivePage('settings')
  }, [])

  const handleUpdateBusiness = useCallback((id: string, data: Partial<Business>) => {
    setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, ...data } : b))
  }, [])

  const handleDeleteBusiness = useCallback((id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id))
    setBusinessSettingsId(null)
    setActivePage('home')
  }, [])

  const isBusinessPage = activePage.includes(':') || activePage.startsWith('business-')
  const activeBusiness = businessSettingsId ? businesses.find((b) => b.id === businessSettingsId) ?? null : null

  return (
    <div className="flex h-screen bg-background">
      {activePage !== 'settings' && (
        <AppSidebar
          activePage={activePage}
          onNavigate={setActivePage}
          collapsed={!sidebarOpen}
          onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
          businesses={businesses}
          onBusinessesChange={setBusinesses}
          onBusinessSettings={handleBusinessSettings}
        />
      )}
      <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">
        <Titlebar
          center={
            activePage === 'settings' ? (
              <div className="flex h-8 w-[220px] shrink-0 items-center border-b border-r border-sidebar-border bg-sidebar px-2" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
                <OrcaLogo className="size-4 text-foreground" />
              </div>
            ) : isSocialMedia ? (
              <BrowserTabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
                onCloseTab={closeTab}
                onNewTab={addTab}
              />
            ) : undefined
          }
        />
        {isSocialMedia && (() => {
          const activeTab = tabs.find((t) => t.id === activeTabId)
          const hasUrl = !!activeTab?.url
          const canForwardHome = !!forwardStack.current[activeTabId]
          return (
            <BrowserNavBar
              viewId={activeTabId}
              hasUrl={hasUrl}
              canForwardHome={canForwardHome}
              onGoHome={() => goHome(activeTabId)}
              onGoForwardHome={() => goForwardTab(activeTabId)}
            />
          )
        })()}
        <main className="flex-1 overflow-hidden">
          {activePage === 'settings' ? (
            <SettingsPage
              onBack={() => { setActivePage('home'); setBusinessSettingsId(null) }}
              businessId={businessSettingsId}
              business={activeBusiness}
              businesses={businesses}
              onUpdateBusiness={handleUpdateBusiness}
              onDeleteBusiness={handleDeleteBusiness}
              onSelectBusiness={(biz) => setBusinessSettingsId(biz.id)}
            />
          ) : activePage === 'home' ? (
            <HomePage />
          ) : isBusinessPage ? (
            <BusinessPage
              page={activePage}
              tabs={isSocialMedia ? tabs : undefined}
              activeTabId={isSocialMedia ? activeTabId : undefined}
              onPickPlatform={isSocialMedia ? pickPlatform : undefined}
            />
          ) : (
            <>
              <header className="flex h-12 items-center border-b border-border px-6">
                <h1 className="text-sm font-medium capitalize">{activePage.replace('-', ' ')}</h1>
              </header>
              <div className="p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                  <h2 className="text-2xl font-bold capitalize">{activePage.replace('-', ' ')}</h2>
                  <p className="text-muted-foreground">
                    This is the {activePage} module. Start building features here.
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <RightSidebar
        collapsed={!rightSidebarOpen}
        onToggleCollapse={() => setRightSidebarOpen(!rightSidebarOpen)}
      />
    </div>
  )
}
