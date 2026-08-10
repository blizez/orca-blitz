import { useState } from 'react'
import {
  User,
  Building2,
  CreditCard,
  Puzzle,
  BrainCircuit,
  Bell,
  Shield,
  Palette,
  ArrowLeft,
  Search,
  Keyboard,
  BarChart3,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const settingsGroups = [
  {
    label: 'Account',
    items: [
      { id: 'general', label: 'General', icon: Palette },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'organization', label: 'Organization', icon: Building2 },
    ],
  },
  {
    label: 'Interface',
    items: [
      { id: 'appearance', label: 'Appearance', icon: Palette },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
      { id: 'statistics', label: 'Statistics & Usage', icon: BarChart3 },
    ],
  },
  {
    label: 'Billing',
    items: [
      { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
    ],
  },
  {
    label: 'Connect',
    items: [
      { id: 'integrations', label: 'Integrations', icon: Puzzle },
      { id: 'ai', label: 'AI Providers', icon: BrainCircuit },
    ],
  },
  {
    label: 'Security',
    items: [
      { id: 'security', label: 'Security', icon: Shield },
    ],
  },
]

interface SettingsSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onBack: () => void
}

export function SettingsSidebar({ activeTab, onTabChange, onBack }: SettingsSidebarProps) {
  const [search, setSearch] = useState('')

  const filtered = settingsGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <button
        onClick={onBack}
        className="flex items-center gap-2 border-b border-sidebar-border px-3 py-2 hover:bg-sidebar-accent/50 transition-colors"
      >
        <ArrowLeft className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Settings</span>
      </button>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-sidebar-foreground/60" />
          <input
            type="text"
            placeholder="Search settings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-sidebar-border bg-background pl-7 pr-2 text-sm placeholder:text-sidebar-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      activeTab === item.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-2 py-4 text-center text-sm text-sidebar-foreground/60">
            No results found
          </p>
        )}
      </nav>
    </aside>
  )
}
