import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useAppStore } from './store'
import type { Business } from '@orca-blitz/shared'

export default function App() {
  const { t } = useTranslation('sidebar')
  const [activePage, setActivePage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tabs, setTabs] = useState<Tab[]>([createNewTab()])
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id)
  const [businessSettingsId, setBusinessSettingsId] = useState<string | null>(null)
  const forwardStack = useRef<Record<string, { title: string; url: string; icon: string; iconComponent?: React.ComponentType<{ className?: string }>; partition: string }>>({})

  const businesses = useAppStore((s) => s.businesses)
  const setBusinesses = useAppStore((s) => s.setBusinesses)
  const setActiveBusinessId = useAppStore((s) => s.setActiveBusinessId)
  const rightSidebarOpen = useAppStore((s) => s.rightSidebarOpen)
  const toggleRightSidebar = useAppStore((s) => s.toggleRightSidebar)
  const rightPanel = useAppStore((s) => s.rightPanel)

  useEffect(() => {
    window.api.businesses.list().then((data) => {
      setBusinesses(data as Business[])
    })

    const unsubscribe = window.api.businesses.onChanged((data) => {
      setBusinesses(data as Business[])
    })

    return unsubscribe
  }, [])

  const isSocialMedia = activePage.includes(':redes')

  const handleNavigate = useCallback((page: string) => {
    setActivePage(page)
    const bizId = page.includes(':') ? page.split(':')[0] : page
    const matchedBiz = businesses.find((b) => b.id === bizId)
    setActiveBusinessId(matchedBiz ? bizId : null)
  }, [businesses, setActiveBusinessId])

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
          ? { ...t, title: platform.name, url: platform.url, icon: platform.id, iconComponent: platform.icon, partition: `persist:${platform.id}`, closable: true }
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
          iconComponent: tab.iconComponent,
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
          ? { ...t, title: saved.title, url: saved.url, icon: saved.icon, iconComponent: saved.iconComponent, partition: saved.partition, closable: true }
          : t
      )
    )
  }, [])

  const handleBusinessSettings = useCallback((biz: Business) => {
    setBusinessSettingsId(biz.id)
    setActivePage('settings')
  }, [])

  const handleUpdateBusiness = useCallback((id: string, data: Partial<Business>) => {
    setBusinesses(businesses.map((b) => b.id === id ? { ...b, ...data } : b))
  }, [businesses, setBusinesses])

  const handleDeleteBusiness = useCallback((id: string) => {
    setBusinesses(businesses.filter((b) => b.id !== id))
    setBusinessSettingsId(null)
    setActiveBusinessId(null)
    setActivePage('home')
  }, [businesses, setBusinesses, setActiveBusinessId])

  const isBusinessPage = activePage.includes(':') || (!activePage.startsWith('business-') && businesses.some((b) => activePage === b.id))
  const activeBusinessForPage = businesses.find((b) => activePage === b.id || activePage.startsWith(b.id + ':')) ?? null
  const activeBusiness = businessSettingsId ? businesses.find((b) => b.id === businessSettingsId) ?? null : null

  useEffect(() => {
    const isMac = navigator.userAgent.includes('Mac')
    const mod = isMac ? 'metaKey' : 'ctrlKey'

    function handleKeyDown(e: KeyboardEvent) {
      if (!e[mod]) return

      switch (e.key) {
        case 'n':
          e.preventDefault()
          document.querySelector<HTMLButtonElement>('[data-add-business]')?.click()
          break
        case 'b':
          e.preventDefault()
          setSidebarOpen((prev) => !prev)
          break
        case ',':
          e.preventDefault()
          setActivePage('settings')
          break
        case 'q':
          e.preventDefault()
          window.api.window.close()
          break
        case '/':
          e.preventDefault()
          // TODO: implementar búsqueda global
          break
        case 's':
          e.preventDefault()
          // TODO: implementar guardado context-aware
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {activePage !== 'settings' && (
        <AppSidebar
          activePage={activePage}
          onNavigate={handleNavigate}
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
              onBack={() => { handleNavigate('home'); setBusinessSettingsId(null) }}
              businessId={businessSettingsId}
              business={activeBusiness}
              businesses={businesses}
              onUpdateBusiness={handleUpdateBusiness}
              onDeleteBusiness={handleDeleteBusiness}
              onSelectBusiness={(biz) => setBusinessSettingsId(biz.id)}
            />
          ) : activePage === 'home' ? (
            <HomePage />
          ) : rightPanel ? (
            <RightPanelContent panel={rightPanel} businessName={activeBusinessForPage?.name ?? ''} />
          ) : isBusinessPage ? (
            <BusinessPage
              page={activePage}
              business={activeBusinessForPage}
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
        onToggleCollapse={toggleRightSidebar}
      />
    </div>
  )
}

function RightPanelContent({ panel, businessName }: { panel: string; businessName: string }) {
  const { t } = useTranslation('sidebar')

  const panelConfig: Record<string, { title: string; description: string }> = {
    billing: { title: t('rightSidebar.billing'), description: 'Gestiona facturación y pagos de tu negocio.' },
    reports: { title: t('rightSidebar.reports'), description: 'Analiza el rendimiento de tu negocio.' },
    contacts: { title: t('rightSidebar.contactsPanel'), description: 'Administra tus contactos y clientes.' },
    notifications: { title: t('rightSidebar.notifications'), description: 'Revisa las notificaciones importantes.' },
  }

  const config = panelConfig[panel] ?? { title: panel, description: '' }

  return (
    <div className="h-full flex flex-col">
      <header className="flex h-12 items-center border-b border-border px-6">
        <h1 className="text-sm font-medium">{config.title}</h1>
        {businessName && (
          <span className="ml-2 text-xs text-muted-foreground">— {businessName}</span>
        )}
      </header>
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold">{config.title}</h2>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>
    </div>
  )
}
