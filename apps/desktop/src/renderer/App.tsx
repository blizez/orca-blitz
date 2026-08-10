import { useState } from 'react'
import { Titlebar } from './components/layout/titlebar'
import { AppSidebar } from './components/layout/app-sidebar'
import { SettingsPage } from './components/settings/settings-page'
import { HomePage } from './components/home/home-page'

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen flex-col bg-background">
      <Titlebar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {activePage !== 'settings' && (
          <AppSidebar activePage={activePage} onNavigate={setActivePage} collapsed={!sidebarOpen} />
        )}
        <main className="flex-1 overflow-auto">
          {activePage === 'settings' ? (
            <SettingsPage onBack={() => setActivePage('home')} />
          ) : activePage === 'home' ? (
            <HomePage />
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
                  <div className="rounded-xl border border-border bg-card p-6 text-card-foreground">
                    <p className="text-sm text-muted-foreground">
                      Edit <code className="rounded bg-muted px-1.5 py-0.5 text-xs">src/renderer/App.tsx</code> to see changes in real time.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
