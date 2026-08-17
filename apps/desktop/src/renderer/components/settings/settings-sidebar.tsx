import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
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
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Business } from '@orca-blitz/shared'

interface SettingsSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onBack: () => void
  businessId?: string | null
  businesses?: Business[]
  onBusinessSelect?: (business: Business) => void
}

export function SettingsSidebar({ activeTab, onTabChange, onBack, businessId, businesses = [], onBusinessSelect }: SettingsSidebarProps) {
  const { t } = useTranslation('settings')
  const [search, setSearch] = useState('')

  const settingsGroups = [
    {
      label: t('sidebar.sections.interface'),
      items: [
        { id: 'appearance', label: t('sidebar.items.appearance'), icon: Palette },
        { id: 'notifications', label: t('sidebar.items.notifications'), icon: Bell },
        { id: 'shortcuts', label: t('sidebar.items.shortcuts'), icon: Keyboard },
        { id: 'statistics', label: t('sidebar.items.statistics'), icon: BarChart3 },
      ],
    },
    {
      label: t('sidebar.sections.billing'),
      items: [
        { id: 'billing', label: t('sidebar.items.paymentMethods'), icon: CreditCard },
      ],
    },
    {
      label: t('sidebar.sections.connect'),
      items: [
        { id: 'integrations', label: t('sidebar.items.integrations'), icon: Puzzle },
        { id: 'ai', label: t('sidebar.items.aiProviders'), icon: BrainCircuit },
      ],
    },
    {
      label: t('sidebar.sections.security'),
      items: [
        { id: 'security', label: t('sidebar.items.security'), icon: Shield },
      ],
    },
  ]

  const businessGroup = businesses.length > 0
    ? [{
        label: 'Businesses',
        items: businesses.map((biz) => ({
          id: businessId === biz.id ? 'business' : `biz-${biz.id}`,
          label: biz.name,
          icon: Store,
          business: biz,
        })),
      }]
    : []

  const allGroups = [...settingsGroups, ...businessGroup]

  const filtered = allGroups
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
        <span className="text-sm font-medium">{t('sidebar.backToApp')}</span>
      </button>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-sidebar-foreground/60" />
          <input
            type="text"
            placeholder={t('sidebar.search')}
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
                    onClick={() => {
                      if ('business' in item && item.business && onBusinessSelect) {
                        onBusinessSelect(item.business as Business)
                      } else {
                        onTabChange(item.id)
                      }
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      activeTab === item.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
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
