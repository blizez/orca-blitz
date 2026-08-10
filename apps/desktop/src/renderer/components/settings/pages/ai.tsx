export function AISettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">AI Providers</h3>
        <p className="text-sm text-muted-foreground">Configure your AI service providers and API keys.</p>
      </div>

      <div className="space-y-4">
        {['OpenAI', 'Anthropic', 'Google AI'].map((name) => (
          <div key={name} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">API key not configured</p>
            </div>
            <span className="text-xs text-muted-foreground">Not set</span>
          </div>
        ))}
      </div>
    </div>
  )
}
