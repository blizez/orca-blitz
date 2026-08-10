import { Users, Workflow, Zap, BarChart3 } from 'lucide-react'

const stats = [
  { label: 'Customers', value: '0', icon: Users, color: 'text-blue-500' },
  { label: 'Workflows', value: '0', icon: Workflow, color: 'text-purple-500' },
  { label: 'Automations', value: '0', icon: Zap, color: 'text-yellow-500' },
  { label: 'Analytics', value: '0', icon: BarChart3, color: 'text-green-500' },
]

export function HomePage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome to orca-blitz</h1>
          <p className="text-muted-foreground">
            Your enterprise automation platform. Get started by exploring the sidebar.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Quick Start</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up your first workflow and start automating your business processes.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Connect Integrations</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Link WhatsApp, email, and other channels to start receiving messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
