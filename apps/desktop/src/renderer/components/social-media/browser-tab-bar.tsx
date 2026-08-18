import { Plus, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface Tab {
  id: string
  title: string
  url: string
  icon: string
  iconComponent?: React.ComponentType<{ className?: string }>
  partition: string
  closable?: boolean
}

interface BrowserTabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onNewTab: () => void
}

export function BrowserTabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab
}: BrowserTabBarProps) {
  return (
    <div
      className="flex h-full items-center gap-0.5 px-2"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={cn(
            'group flex h-6 max-w-[200px] flex-1 cursor-pointer items-center gap-2 rounded-md px-3 text-xs transition-colors',
            activeTabId === tab.id
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          {tab.iconComponent && <tab.iconComponent className="size-3 shrink-0" />}
          <span className="truncate flex-1">{tab.title}</span>
          {tab.closable !== false && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCloseTab(tab.id)
              }}
              className="flex size-3.5 shrink-0 items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 hover:bg-border transition-all"
            >
              <X className="size-2.5" />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={onNewTab}
        className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
