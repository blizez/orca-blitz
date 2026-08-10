export function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">Control how and when you receive notifications.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Desktop Notifications</p>
              <p className="text-xs text-muted-foreground">Show system notifications</p>
            </div>
            <span className="text-sm text-muted-foreground">On</span>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sound</p>
              <p className="text-xs text-muted-foreground">Play sound for notifications</p>
            </div>
            <span className="text-sm text-muted-foreground">On</span>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Digest</p>
              <p className="text-xs text-muted-foreground">Receive daily email summary</p>
            </div>
            <span className="text-sm text-muted-foreground">Off</span>
          </div>
        </div>
      </div>
    </div>
  )
}
