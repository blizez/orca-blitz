import { useState, useRef, useEffect } from 'react'
import {
  Building2,
  Settings,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { toast } from '@orca-blitz/ui/components/ui/toast'
import { HelpMenu } from './help-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '@orca-blitz/ui/components/ui/tooltip'
import { Input } from '@orca-blitz/ui/components/ui/input'
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
  const { t } = useTranslation('sidebar')
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Business | null>(null)
  const [expandedBiz, setExpandedBiz] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filteredBusinesses = businesses.filter((biz) =>
    biz.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddBusiness = async (data: Omit<Business, 'id'>) => {
    await window.api.businesses.create(data)
    toast.add({ title: 'Negocio creado', description: data.name, type: 'success' })
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

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await window.api.businesses.delete(deleteTarget.id)
    const name = deleteTarget.name
    if (activePage === `business-${deleteTarget.id}`) {
      onNavigate('home')
    }
    setDeleteTarget(null)
    toast.add({ title: 'Negocio eliminado', description: name, type: 'success' })
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
        {!collapsed && businesses.length > 0 && (
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-sidebar-foreground/40 pointer-events-none" />
              <Input
                ref={searchRef}
                type="text"
                placeholder={t('businesses.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
                className="h-7 pl-7 text-xs border-sidebar-border"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className={cn(
            'flex items-center justify-between',
            collapsed ? 'flex-col gap-1' : 'mb-1 px-2'
          )}>
            {!collapsed && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                {t('businesses.title')}
              </span>
            )}
            {collapsed && businesses.length > 0 && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => {
                        onToggleCollapse()
                        setTimeout(() => searchRef.current?.focus(), 100)
                      }}
                      className="flex size-7 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <Search className="size-4" />
                    </button>
                  }
                />
                <TooltipContent side="right" sideOffset={8}>{t('businesses.search')}</TooltipContent>
              </Tooltip>
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
                <TooltipContent side="right" sideOffset={8}>{t('businesses.add')}</TooltipContent>
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
              {t('businesses.empty')}
            </p>
          )}

          {businesses.length > 0 && !collapsed && filteredBusinesses.length === 0 && (
            <p className="px-2 py-2 text-xs text-sidebar-foreground/40">
              {t('businesses.noResults')}
            </p>
          )}

          {filteredBusinesses.length > 0 && !collapsed && (
            <ul className="space-y-0.5">
              {filteredBusinesses.map((biz) => (
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
              <TooltipContent side="right" sideOffset={8}>{t('navigation.settings')}</TooltipContent>
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
              <span>{t('navigation.settings')}</span>
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
