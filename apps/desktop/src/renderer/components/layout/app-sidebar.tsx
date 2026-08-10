import { useState } from 'react'
import {
  Building2,
  Settings,
  Plus,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { HelpMenu } from './help-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '@orca-blitz/ui/components/ui/tooltip'
import { AddBusinessModal } from './add-business-modal'
import { BusinessItem } from './business-item'

interface Business {
  id: string
  name: string
  type: string
  industry: string
  description: string
  products: string
  audience: string
  channels: string[]
  goals: string[]
  teamSize: string
}

interface AppSidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  collapsed: boolean
}

export function AppSidebar({ activePage, onNavigate, collapsed }: AppSidebarProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [showModal, setShowModal] = useState(false)

  const handleAddBusiness = (data: Business) => {
    setBusinesses([...businesses, { ...data, id: Date.now().toString() }])
  }

  const handleDeleteBusiness = (id: string) => {
    setBusinesses(businesses.filter((b) => b.id !== id))
    if (activePage === `business-${id}`) {
      onNavigate('home')
    }
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        collapsed ? 'w-[52px]' : 'w-[220px]'
      )}
    >
      <nav className={cn('flex-1 overflow-y-auto py-2', collapsed ? 'px-0' : 'px-1.5')}>
        <div className="mb-4">
          <div className={cn(
            'flex items-center justify-between',
            collapsed ? 'flex-col gap-1' : 'mb-1 px-2'
          )}>
            {!collapsed && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                <Building2 className="size-3.5" />
                Businesses
              </span>
            )}
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex size-7 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  }
                />
                <TooltipContent side="right" sideOffset={8}>Add Business</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex size-5 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Plus className="size-3.5" />
              </button>
            )}
          </div>

          {businesses.length === 0 && !collapsed && (
            <p className="px-2 py-2 text-xs text-sidebar-foreground/40">
              No businesses yet
            </p>
          )}

          {businesses.length > 0 && !collapsed && (
            <ul className="space-y-0.5">
              {businesses.map((biz) => (
                <BusinessItem
                  key={biz.id}
                  business={biz}
                  isActive={activePage === `business-${biz.id}`}
                  onSelect={(id) => onNavigate(`business-${id}`)}
                  onDelete={handleDeleteBusiness}
                />
              ))}
            </ul>
          )}
        </div>
      </nav>

      <div className={cn('border-t border-sidebar-border py-1.5', collapsed ? 'px-1' : 'px-1.5')}>
        <div className={cn('flex items-center gap-1', collapsed ? 'flex-col-reverse' : 'flex-row')}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => onNavigate('settings')}
                    className={cn(
                      'flex size-7 items-center justify-center rounded-md py-1.5 text-sm transition-colors',
                      activePage === 'settings'
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Settings className="size-4 shrink-0" />
                  </button>
                }
              />
              <TooltipContent side="right" sideOffset={8}>Settings</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => onNavigate('settings')}
              className={cn(
                'flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors justify-start',
                activePage === 'settings'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Settings className="size-4 shrink-0" />
              <span>Settings</span>
            </button>
          )}
          <HelpMenu collapsed={collapsed} />
        </div>
      </div>

      <AddBusinessModal open={showModal} onClose={() => setShowModal(false)} onAdd={handleAddBusiness} />
    </aside>
  )
}
