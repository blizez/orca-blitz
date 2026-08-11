import { useState, useCallback, useRef } from 'react'
import { Titlebar } from './components/layout/titlebar'
import { AppSidebar } from './components/layout/app-sidebar'
import { RightSidebar } from './components/layout/right-sidebar'
import { SettingsPage } from './components/settings/settings-page'
import { HomePage } from './components/home/home-page'
import { BusinessPage } from './components/business/business-page'
import { BrowserTabBar, type Tab } from './components/social-media/browser-tab-bar'
import { BrowserNavBar } from './components/social-media/browser-nav-bar'
import { createNewTab, type Platform } from './components/social-media/social-media-page'

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [tabs, setTabs] = useState<Tab[]>([createNewTab()])
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id)
  const forwardStack = useRef<Record<string, { title: string; url: string; icon: string; partition: string }>>({})

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

  const isBusinessPage = activePage.includes(':') || activePage.startsWith('business-')

  return (
    <div className="flex h-screen bg-background">
      {activePage !== 'settings' && (
        <AppSidebar activePage={activePage} onNavigate={setActivePage} collapsed={!sidebarOpen} onToggleCollapse={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">
        <Titlebar
          center={
            isSocialMedia ? (
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
            <SettingsPage onBack={() => setActivePage('home')} />
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
