export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          Manage your general application preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Language</p>
              <p className="text-xs text-muted-foreground">Select your preferred language</p>
            </div>
            <span className="text-sm text-muted-foreground">English</span>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Choose your color theme</p>
            </div>
            <span className="text-sm text-muted-foreground">System</span>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-start</p>
              <p className="text-xs text-muted-foreground">Launch app on system startup</p>
            </div>
            <span className="text-sm text-muted-foreground">Off</span>
          </div>
        </div>
      </div>
    </div>
  );
}
