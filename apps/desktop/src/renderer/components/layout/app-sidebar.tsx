import { useState } from 'react'
import {
  Building2,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { HelpMenu } from './help-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '@orca-blitz/ui/components/ui/tooltip'
import { AddBusinessModal } from './add-business-modal'
import { DeleteBusinessModal } from './delete-business-modal'
import { BusinessItem } from './business-item'
import { OrcaLogo } from '@orca-blitz/ui/components/ui/logo'
import type { Business } from '@orca-blitz/shared'

interface AppSidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
  businesses: Business[]
  onBusinessesChange: (businesses: Business[]) => void
  onBusinessSettings: (business: Business) => void
}

export function AppSidebar({ activePage, onNavigate, collapsed, onToggleCollapse, businesses, onBusinessesChange, onBusinessSettings }: AppSidebarProps) {
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Business | null>(null)
  const [expandedBiz, setExpandedBiz] = useState<string[]>([])

  const handleAddBusiness = (data: Omit<Business, 'id'>) => {
    onBusinessesChange([...businesses, { ...data, id: Date.now().toString() }])
  }

  const handleDeleteBusiness = (id: string) => {
    const biz = businesses.find((b) => b.id === id)
    if (biz) setDeleteTarget(biz)
  }

  const handleToggleBusiness = (id: string) => {
    setExpandedBiz((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    onBusinessesChange(businesses.filter((b) => b.id !== deleteTarget.id))
    if (activePage === `business-${deleteTarget.id}`) {
      onNavigate('home')
    }
    setDeleteTarget(null)
  }

  return (
    <aside
      className={cn(
        'relative z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        collapsed ? 'w-[52px]' : 'w-[220px]'
      )}
    >
      <div
        className="flex h-8 shrink-0 items-center gap-1 border-b border-sidebar-border px-2"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <OrcaLogo className="size-4 text-foreground" />
          <button
            onClick={onToggleCollapse}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-3.5" />
            ) : (
              <PanelLeftClose className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      <nav className={cn('flex-1 overflow-y-auto py-2', collapsed ? 'px-0' : 'px-1.5')}>
        <div className="mb-4">
          <div className={cn(
            'flex items-center justify-between',
            collapsed ? 'flex-col gap-1' : 'mb-1 px-2'
          )}>
            {!collapsed && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                Businesses
              </span>
            )}
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => setShowModal(true)}
                      data-add-business
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
                data-add-business
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
                  isActive={activePage.startsWith(biz.id)}
                  expanded={expandedBiz.includes(biz.id)}
                  activePage={activePage}
                  onToggle={handleToggleBusiness}
                  onSelect={(id) => onNavigate(id)}
                  onDelete={handleDeleteBusiness}
                  onBusinessSettings={onBusinessSettings}
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
      <DeleteBusinessModal
        open={deleteTarget !== null}
        businessName={deleteTarget?.name ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </aside>
  )
}
