export function BillingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Plans & Billing</h3>
        <p className="text-sm text-muted-foreground">Manage your subscription and payment methods.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Current Plan</p>
          <p className="text-sm text-muted-foreground mt-1">Free Tier</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Payment Method</p>
          <p className="text-sm text-muted-foreground mt-1">No payment method added</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Usage</p>
          <p className="text-sm text-muted-foreground mt-1">0 / 1000 API calls this month</p>
        </div>
      </div>
    </div>
  )
}
