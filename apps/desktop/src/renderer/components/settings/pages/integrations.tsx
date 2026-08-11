import { Gmail, Instagram, Slack, WhatsApp } from '@orca-blitz/ui/components/ui/svgs'

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  WhatsApp,
  Instagram,
  Gmail,
  Slack,
}

export function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">Connect external services and platforms.</p>
      </div>

      <div className="space-y-4">
        {(['WhatsApp', 'Instagram', 'Gmail', 'Slack'] as const).map((name) => {
          const Icon = icons[name]
          return (
            <div key={name} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <Icon className="size-8" />
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Disconnected</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
