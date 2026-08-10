import { useState, useEffect } from 'react'
import { Minus, Square, X, Maximize2, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface TitlebarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Titlebar({ sidebarOpen, onToggleSidebar }: TitlebarProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api.window.isMaximized().then(setIsMaximized)
    const unsub = window.api.window.onMaximized(setIsMaximized)
    return unsub
  }, [])

  return (
    <div
      className="flex h-8 select-none items-center border-b border-border bg-background"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div
        className="flex items-center gap-1 px-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <div className="flex size-4 items-center justify-center rounded-sm bg-primary text-primary-foreground text-[10px] font-bold">
          O
        </div>
        <button
          onClick={onToggleSidebar}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-3.5" />
          ) : (
            <PanelLeftOpen className="size-3.5" />
          )}
        </button>
      </div>

      <div className="flex-1" />

      <div
        className="flex h-full items-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => window.api.window.minimize()}
          className="flex size-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Minus className="size-4" />
        </button>
        <button
          onClick={() => window.api.window.maximize()}
          className="flex size-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {isMaximized ? (
            <Maximize2 className="size-3.5" />
          ) : (
            <Square className="size-3" />
          )}
        </button>
        <button
          onClick={() => window.api.window.close()}
          className="flex size-8 items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
