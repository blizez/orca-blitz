import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Receipt,
  BarChart3,
  Users,
  Bell,
  PanelRightClose,
  Minus,
  Square,
  X,
  Maximize2,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { Tooltip, TooltipTrigger, TooltipContent } from '@orca-blitz/ui/components/ui/tooltip'

type PanelId = 'billing' | 'reports' | 'contacts' | 'notifications'

interface RightSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function RightSidebar({ collapsed, onToggleCollapse }: RightSidebarProps) {
  const { t } = useTranslation('sidebar')
  const [activePanel, setActivePanel] = useState<PanelId | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const activeBusinessId = useAppStore((s) => s.activeBusinessId)
  const businesses = useAppStore((s) => s.businesses)

  const activeBusiness = businesses.find((b) => b.id === activeBusinessId) ?? null

  const navItems: { id: PanelId; icon: typeof Receipt; label: string }[] = [
    { id: 'billing', icon: Receipt, label: t('rightSidebar.billing') },
    { id: 'reports', icon: BarChart3, label: t('rightSidebar.reports') },
    { id: 'contacts', icon: Users, label: t('rightSidebar.contactsPanel') },
    { id: 'notifications', icon: Bell, label: t('rightSidebar.notifications') },
  ]

  const handleMaximize = async () => {
    await window.api.window.maximize()
    const maximized = await window.api.window.isMaximized()
    setIsMaximized(maximized)
  }

  const handleNavClick = (id: PanelId) => {
    if (activePanel === id) {
      setActivePanel(null)
    } else {
      setActivePanel(id)
      if (collapsed) onToggleCollapse()
    }
  }

  return (
    <aside
      className={cn(
        'relative z-40 flex h-full flex-col bg-sidebar text-sidebar-foreground',
        collapsed ? 'w-[52px]' : 'w-[260px]'
      )}
    >
      <div
        className="flex h-8 shrink-0 items-center justify-end gap-0.5 border-b border-sidebar-border bg-background px-1"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div
          className="flex items-center gap-0.5"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => onToggleCollapse()}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <PanelRightClose className="size-3.5 rotate-180" />
            ) : (
              <PanelRightClose className="size-3.5" />
            )}
          </button>
          <button
            onClick={() => window.api.window.minimize()}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            onClick={() => handleMaximize()}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {isMaximized ? (
              <Maximize2 className="size-3" />
            ) : (
              <Square className="size-3" />
            )}
          </button>
          <button
            onClick={() => window.api.window.close()}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-red-500 hover:text-white transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <nav className={cn('shrink-0 border-b border-sidebar-border py-1.5', collapsed ? 'px-0 flex flex-col items-center' : 'px-1.5')}>
        <div className={cn('space-y-0.5', collapsed && 'flex flex-col items-center')}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePanel === item.id

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={cn(
                          'flex w-full size-7 items-center justify-center rounded-md transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <Icon className="size-4" />
                      </button>
                    }
                  />
                  <TooltipContent side="left" sideOffset={8}>{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors justify-start',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto scrollbar-sleek">
        {!activeBusinessId ? (
          <EmptyState message={t('rightSidebar.emptyState')} />
        ) : activePanel ? (
          <PanelContent panel={activePanel} businessName={activeBusiness?.name ?? ''} />
        ) : (
          <EmptyState message={t('rightSidebar.comingSoon')} />
        )}
      </div>
    </aside>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
      <Inbox className="size-8 text-muted-foreground/30" />
      <p className="text-xs text-muted-foreground/60">{message}</p>
    </div>
  )
}

function PanelContent({ panel, businessName }: { panel: PanelId; businessName: string }) {
  const { t } = useTranslation('sidebar')

  const panelConfig: Record<PanelId, { title: string; emptyKey: string }> = {
    billing: { title: t('rightSidebar.billing'), emptyKey: t('rightSidebar.billingEmpty') },
    reports: { title: t('rightSidebar.reports'), emptyKey: t('rightSidebar.reportsEmpty') },
    contacts: { title: t('rightSidebar.contactsPanel'), emptyKey: t('rightSidebar.contactsEmpty') },
    notifications: { title: t('rightSidebar.notifications'), emptyKey: t('rightSidebar.comingSoon') },
  }

  const config = panelConfig[panel]

  return (
    <div className="p-3">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
          {config.title}
        </h3>
        {businessName && (
          <span className="truncate text-[11px] text-sidebar-foreground/40">
            {businessName}
          </span>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-sidebar-border py-8 text-center">
        <Inbox className="size-6 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground/60">{config.emptyKey}</p>
      </div>
    </div>
  )
}
