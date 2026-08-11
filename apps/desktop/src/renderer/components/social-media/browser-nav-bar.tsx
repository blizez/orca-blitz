import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BrowserNavBarProps {
  viewId: string | null
  hasUrl: boolean
  canForwardHome: boolean
  onGoHome: () => void
  onGoForwardHome: () => void
}

export function BrowserNavBar({ viewId, hasUrl, canForwardHome, onGoHome, onGoForwardHome }: BrowserNavBarProps) {
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  const refreshNavState = useCallback(async () => {
    if (!viewId || !hasUrl) {
      setCanGoBack(false)
      setCanGoForward(false)
      return
    }
    const [back, forward] = await Promise.all([
      window.api.browser.canGoBack(viewId),
      window.api.browser.canGoForward(viewId),
    ])
    setCanGoBack(back)
    setCanGoForward(forward)
  }, [viewId, hasUrl])

  useEffect(() => {
    refreshNavState()
    if (!viewId || !hasUrl) return
    const unsub = window.api.browser.onDidLoad((id) => {
      if (id === viewId) refreshNavState()
    })
    return unsub
  }, [viewId, hasUrl, refreshNavState])

  const handleBack = async () => {
    if (!viewId) return
    if (hasUrl) {
      const back = await window.api.browser.canGoBack(viewId)
      if (back) {
        window.api.browser.goBack(viewId)
        setTimeout(refreshNavState, 150)
      } else {
        onGoHome()
      }
    }
  }

  const handleForward = async () => {
    if (!viewId) return
    if (hasUrl) {
      // Forward within WebContentsView
      if (canGoForward) {
        window.api.browser.goForward(viewId)
        setTimeout(refreshNavState, 150)
      }
    } else if (canForwardHome) {
      // Forward from home → restore previous page
      onGoForwardHome()
    }
  }

  const handleReload = () => {
    if (!viewId || !hasUrl) return
    window.api.browser.reload(viewId)
  }

  const backDisabled = !hasUrl
  const forwardDisabled = hasUrl ? !canGoForward : !canForwardHome
  const reloadDisabled = !hasUrl

  return (
    <div
      className="flex h-8 shrink-0 items-center gap-1 bg-background px-2"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <button
        disabled={backDisabled}
        onClick={handleBack}
        className={cn(
          'flex size-7 items-center justify-center rounded-md transition-colors',
          backDisabled
            ? 'cursor-not-allowed text-muted-foreground/30'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      <button
        disabled={forwardDisabled}
        onClick={handleForward}
        className={cn(
          'flex size-7 items-center justify-center rounded-md transition-colors',
          forwardDisabled
            ? 'cursor-not-allowed text-muted-foreground/30'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <ChevronRight className="size-4" />
      </button>

      <button
        disabled={reloadDisabled}
        onClick={handleReload}
        className={cn(
          'flex size-7 items-center justify-center rounded-md transition-colors',
          reloadDisabled
            ? 'cursor-not-allowed text-muted-foreground/30'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <RotateCw className="size-3.5" />
      </button>
    </div>
  )
}
