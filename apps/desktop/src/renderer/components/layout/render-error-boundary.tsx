import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class RenderErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State { return { error } }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[renderer] render error', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-xl rounded-xl border border-destructive/40 bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold">No se pudo cargar esta vista</h1>
          <p className="mt-2 text-sm text-muted-foreground">La aplicación sigue activa. Recarga esta sección después de revisar el error.</p>
          <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">{this.state.error.message}</pre>
          <button type="button" onClick={() => this.setState({ error: null })} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Reintentar</button>
        </div>
      </div>
    )
  }
}
