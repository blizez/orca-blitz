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

  const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')

  useEffect(() => {
    if (!url) return
    if (!isElectron) {
      setLoaded(true)
      return
    }
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
  }, [viewId, url, partition, platformId, isElectron])

  useEffect(() => {
    if (!isElectron) return
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
  }, [isElectron, viewId, isActive, loaded, url, getBounds])

  useEffect(() => {
    if (!isElectron) return
    if (!loaded || !isActive || !url) return
    const id = viewId

    const observer = new ResizeObserver(() => {
      const bounds = getBounds()
      if (bounds) window.api.browser.position(id, bounds)
    })
    if (containerRef.current) observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [isElectron, viewId, loaded, isActive, url, getBounds])

  if (!url) return null

  if (!isElectron) {
    return (
      <div ref={containerRef} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-medium">Vista embebida solo disponible en la app de escritorio</p>
          <p className="text-xs text-muted-foreground">
            Estás en modo web (localhost:5173). WhatsApp y otras plataformas bloquean iframes. Usa la app Electron para
            el navegador Chromium integrado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Abrir {platformId || 'sitio'} en el navegador
        </button>
        <p className="text-xs text-muted-foreground">
          Ejecuta <code className="rounded bg-muted px-1 py-0.5">pnpm dev</code> y abre la ventana de Electron.
        </p>
      </div>
    )
  }

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
