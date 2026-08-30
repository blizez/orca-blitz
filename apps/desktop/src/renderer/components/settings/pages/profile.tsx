export function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">Manage your personal account information.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Name</p>
          <p className="text-sm text-muted-foreground mt-1">—</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm text-muted-foreground mt-1">—</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Password</p>
          <p className="text-sm text-muted-foreground mt-1">Last changed: Never</p>
        </div>
      </div>
    </div>
  );
}
