export function OrganizationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization</h3>
        <p className="text-sm text-muted-foreground">Manage your company workspace settings.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Organization Name</p>
          <p className="text-sm text-muted-foreground mt-1">—</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Workspace</p>
          <p className="text-sm text-muted-foreground mt-1">Default</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Members</p>
          <p className="text-sm text-muted-foreground mt-1">1 of 1 seats used</p>
        </div>
      </div>
    </div>
  );
}
