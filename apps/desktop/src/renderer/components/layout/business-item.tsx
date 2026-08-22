import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Store,
  ShoppingCart,
  UtensilsCrossed,
  Wrench,
  Heart,
  GraduationCap,
  Home,
  Cloud,
  Building2,
  MoreHorizontal,
  Settings,
  Image,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@orca-blitz/ui/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@orca-blitz/ui/components/ui/tooltip'
import type { Business } from '@orca-blitz/shared'
import type { LucideIcon } from 'lucide-react'

const BUSINESS_TYPE_ICONS: Record<string, LucideIcon> = {
  ecommerce: ShoppingCart,
  restaurant: UtensilsCrossed,
  services: Wrench,
  retail: Store,
  healthcare: Heart,
  education: GraduationCap,
  'real-estate': Home,
  saas: Cloud,
  other: Building2,
}

const CONTENT_STORAGE_KEY = (id: string) => `orca-business-content-${id}`
const CAMPAIGNS_STORAGE_KEY = (id: string) => `orca-business-campaigns-${id}`

function hasItems(key: string): boolean {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
  } catch {
    return false
  }
}

function getItemCount(key: string): number {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

function completenessPercent(businessId: string): { percentage: number; missingContent: boolean; missingCampaigns: boolean } {
  const hasContent = hasItems(CONTENT_STORAGE_KEY(businessId))
  const hasCampaigns = hasItems(CAMPAIGNS_STORAGE_KEY(businessId))
  const percentage = (hasContent ? 50 : 0) + (hasCampaigns ? 50 : 0)
  return { percentage, missingContent: !hasContent, missingCampaigns: !hasCampaigns }
}

function CircularProgress({ percentage, className }: { percentage: number; className?: string }) {
  const radius = 6
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={cn("shrink-0", className)}>
      <circle
        cx="8" cy="8" r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-muted-foreground/30"
      />
      <circle
        cx="8" cy="8" r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 8 8)"
        className="text-sidebar-primary transition-all duration-300"
      />
    </svg>
  )
}

interface BusinessItemProps {
  business: Business
  isActive: boolean
  expanded: boolean
  activePage: string
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onBusinessSettings?: (business: Business) => void
}

export function BusinessItem({ business, expanded, activePage, onToggle, onSelect, onDelete, onBusinessSettings }: BusinessItemProps) {
  const { t } = useTranslation('sidebar')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [completeness, setCompleteness] = useState(() => completenessPercent(business.id))
  const [itemCounts, setItemCounts] = useState(() => ({
    content: getItemCount(CONTENT_STORAGE_KEY(business.id)),
    campaigns: getItemCount(CAMPAIGNS_STORAGE_KEY(business.id)),
  }))

  const Icon = BUSINESS_TYPE_ICONS[business.type] ?? Building2

  useEffect(() => {
    function recalc() {
      setCompleteness(completenessPercent(business.id))
      setItemCounts({
        content: getItemCount(CONTENT_STORAGE_KEY(business.id)),
        campaigns: getItemCount(CAMPAIGNS_STORAGE_KEY(business.id)),
      })
    }
    recalc()
    const id = setInterval(recalc, 3000)
    window.addEventListener('storage', recalc)
    return () => {
      clearInterval(id)
      window.removeEventListener('storage', recalc)
    }
  }, [business.id])

  const businessFeatures = [
    { id: 'redes', label: t('features.socialMedia'), count: 0 },
    { id: 'content', label: t('features.content'), count: itemCounts.content },
    { id: 'campaigns', label: t('features.campaigns'), count: itemCounts.campaigns },
    { id: 'notes', label: t('features.notes'), count: 0 },
  ]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  return (
    <li className="group/item">
      <div
        ref={menuRef}
        className={cn(
          'relative rounded-md p-1 transition-colors',
          expanded ? 'border border-sidebar-border' : 'border border-transparent'
        )}
      >
        <div
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
          onClick={() => onToggle(business.id)}
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 truncate">{business.name}</span>

          {completeness.percentage < 100 && (
            <Tooltip>
              <TooltipTrigger render={<span />}>
                <CircularProgress percentage={completeness.percentage} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </TooltipTrigger>
              <TooltipContent>
                {completeness.missingContent && completeness.missingCampaigns
                  ? t('completeness.missingBoth')
                  : completeness.missingContent
                    ? t('completeness.missingContent')
                    : t('completeness.missingCampaigns')}
              </TooltipContent>
            </Tooltip>
          )}

          <ChevronRight className={cn(
            'size-3 shrink-0 text-sidebar-foreground/40 transition-all duration-200 opacity-0 group-hover/item:opacity-100',
            expanded && 'rotate-90'
          )} />

          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="flex size-5 shrink-0 items-center justify-center rounded-md opacity-0 group-hover/item:opacity-100 text-sidebar-foreground/40 hover:text-sidebar-foreground/60 hover:bg-sidebar-border transition-all"
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>

        {showMenu && (
          <div className="absolute right-0 top-full z-50 mt-1 w-[180px] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md">
            <button
              onClick={() => { setShowMenu(false); onBusinessSettings?.(business) }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="size-3.5" />
              {t('menu.businessSettings')}
            </button>
            <button
              onClick={() => setShowMenu(false)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Image className="size-3.5" />
              {t('menu.changeIcon')}
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={() => {
                onDelete(business.id)
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="size-3.5" />
              {t('menu.deleteBusiness')}
            </button>
          </div>
        )}

        <ul className={cn(
          'relative mt-0.5 space-y-0.5 pl-4 ml-2 overflow-hidden transition-all duration-200',
          expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0',
          'before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-sidebar-border'
        )}>
          {businessFeatures.map((feature) => {
            const featureActive = activePage === `${business.id}:${feature.id}`
            return (
              <li key={feature.id}>
                <button
                  onClick={() => onSelect(`${business.id}:${feature.id}`)}
                  className={cn(
                    'flex w-full items-center rounded-md px-2 py-1 text-xs transition-colors',
                    featureActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  {feature.label}
                  {feature.count > 0 && (
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 h-4 font-normal">
                      {feature.count}
                    </Badge>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </li>
  )
}
