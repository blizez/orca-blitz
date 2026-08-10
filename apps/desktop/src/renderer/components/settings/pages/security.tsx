export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">Manage your account security and sessions.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Two-Factor Authentication</p>
          <p className="text-xs text-muted-foreground mt-1">Not enabled</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Active Sessions</p>
          <p className="text-xs text-muted-foreground mt-1">1 active session</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">API Keys</p>
          <p className="text-xs text-muted-foreground mt-1">No API keys created</p>
        </div>
      </div>
    </div>
  )
}
