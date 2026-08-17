import { useRef, useEffect, useState, useCallback } from 'react'

interface BrowserViewProps {
  viewId: string
  url: string
  partition: string
  isActive: boolean
  platformId?: string
}

export function BrowserView({ viewId, url, partition, isActive, platformId }: BrowserViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getBounds = useCallback(() => {
    const el = containerRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) }
  }, [])

  useEffect(() => {
    if (!url) return
    const id = viewId
    window.api.browser.create(id, url, partition, platformId || '')

    const unsubLoad = window.api.browser.onDidLoad((loadedId) => {
      if (loadedId === id) setLoaded(true)
    })
    const unsubFail = window.api.browser.onDidFail((failedId, code, desc) => {
      if (failedId === id) setError(`Error ${code}: ${desc}`)
    })

    return () => {
      cancelAnimationFrame(rafRef.current)
      unsubLoad()
      unsubFail()
      window.api.browser.destroy(id)
    }
  }, [url, partition, platformId])

  useEffect(() => {
    const id = viewId
    cancelAnimationFrame(rafRef.current)

    if (!loaded || !url) {
      window.api.browser.hide(id)
      return
    }

    if (isActive) {
      rafRef.current = requestAnimationFrame(() => {
        const bounds = getBounds()
        if (bounds) window.api.browser.show(id, bounds)
      })
    } else {
      window.api.browser.hide(id)
    }

    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive, loaded, url, getBounds])

  useEffect(() => {
    if (!loaded || !isActive || !url) return
    const id = viewId

    const observer = new ResizeObserver(() => {
      const bounds = getBounds()
      if (bounds) window.api.browser.position(id, bounds)
    })
    if (containerRef.current) observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [loaded, isActive, url, getBounds])

  if (!url) return null

  return (
    <div ref={containerRef} className="absolute inset-0">
      {!loaded && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-12">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-foreground">Loading...</span>
              <span className="text-xs text-muted-foreground">Please wait while we prepare everything</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-sm text-muted-foreground">{error}</span>
            <button
              onClick={() => {
                setError(null)
                setLoaded(false)
                window.api.browser.destroy(viewId)
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
