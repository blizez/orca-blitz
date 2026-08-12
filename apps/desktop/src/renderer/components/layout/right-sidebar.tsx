import { useState } from 'react'
import {
  MessageCircle,
  Bell,
  Users,
  Search,
  PanelRightClose,
  Minus,
  Square,
  X,
  Maximize2,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent } from '@orca-blitz/ui/components/ui/tooltip'

interface RightSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems = [
  { id: 'messages', icon: MessageCircle, label: 'Messages' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'contacts', icon: Users, label: 'Contacts' },
  { id: 'search', icon: Search, label: 'Search' },
]

export function RightSidebar({ collapsed, onToggleCollapse }: RightSidebarProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)

  const handleMaximize = async () => {
    await window.api.window.maximize()
    const maximized = await window.api.window.isMaximized()
    setIsMaximized(maximized)
  }

  return (
    <aside
      className={cn(
        'relative z-40 flex h-full flex-col bg-sidebar text-sidebar-foreground',
        collapsed ? 'w-[52px]' : 'w-[220px]'
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

      <nav className={cn('flex-1 overflow-y-auto py-2', collapsed ? 'px-0 flex flex-col items-center' : 'px-1.5')}>
        <div className={cn('space-y-0.5', collapsed && 'flex flex-col items-center')}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => setActiveItem(isActive ? null : item.id)}
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
                onClick={() => setActiveItem(isActive ? null : item.id)}
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

      <div className={cn('border-t border-sidebar-border py-1.5', collapsed ? 'px-1' : 'px-1.5')}>
        {!collapsed && (
          <p className="px-2 py-2 text-xs text-sidebar-foreground/40">
            Right panel — Coming Soon
          </p>
        )}
      </div>
    </aside>
  )
}
