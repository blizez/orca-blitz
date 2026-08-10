export function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">Connect external services and platforms.</p>
      </div>

      <div className="space-y-4">
        {['WhatsApp', 'Instagram', 'Email', 'Slack'].map((name) => (
          <div key={name} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">Not connected</p>
            </div>
            <span className="text-xs text-muted-foreground">Disconnected</span>
          </div>
        ))}
      </div>
    </div>
  )
}
