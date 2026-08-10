export function StatisticsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Statistics & Usage</h3>
        <p className="text-sm text-muted-foreground">Monitor your usage and resource consumption.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">API Calls This Month</p>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-2 w-[35%] rounded-full bg-primary" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">350 / 1,000 used</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Workflows Executed</p>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-2 w-[12%] rounded-full bg-primary" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">12 / 100 used</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Storage Used</p>
              <p className="text-xs text-muted-foreground">Local data storage</p>
            </div>
            <span className="text-sm text-muted-foreground">24 MB</span>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">AI Tokens Used</p>
              <p className="text-xs text-muted-foreground">This billing cycle</p>
            </div>
            <span className="text-sm text-muted-foreground">12.4k</span>
          </div>
        </div>
      </div>
    </div>
  )
}
