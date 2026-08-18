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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { Tooltip, TooltipTrigger, TooltipContent } from '@orca-blitz/ui/components/ui/tooltip'
import type { RightPanelId } from '@/store'

interface RightSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function RightSidebar({ collapsed, onToggleCollapse }: RightSidebarProps) {
  const { t } = useTranslation('sidebar')
  const [isMaximized, setIsMaximized] = useState(false)
  const activeBusinessId = useAppStore((s) => s.activeBusinessId)
  const rightPanel = useAppStore((s) => s.rightPanel)
  const setRightPanel = useAppStore((s) => s.setRightPanel)

  const navItems: { id: RightPanelId; icon: typeof Receipt; label: string }[] = [
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

  const handleNavClick = (id: RightPanelId) => {
    if (rightPanel === id) {
      setRightPanel(null)
    } else {
      setRightPanel(id)
      if (collapsed) onToggleCollapse()
    }
  }

  if (!activeBusinessId) return null

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
            const isActive = rightPanel === item.id

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
    </aside>
  )
}
