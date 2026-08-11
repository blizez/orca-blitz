import { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { Store, MoreHorizontal, Settings, Image, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

interface Business {
  id: string
  name: string
  type: string
  industry: string
}

interface BusinessItemProps {
  business: Business
  isActive: boolean
  expanded: boolean
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

const businessFeatures = [
  { id: 'redes', label: 'Social Media' },
  { id: 'content', label: 'Content' },
  { id: 'campaigns', label: 'Campaigns' },
]

export function BusinessItem({ business, isActive, expanded, onToggle, onSelect, onDelete }: BusinessItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
      <div className="relative" ref={menuRef}>
        <div
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
          )}
          onClick={() => {
            onToggle(business.id)
            onSelect(business.id)
          }}
        >
          <Store className="size-4 shrink-0" />
          <span className="flex-1 truncate">{business.name}</span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(business.id)
            }}
            className="flex size-5 shrink-0 items-center justify-center rounded-md opacity-0 group-hover/item:opacity-100 text-sidebar-foreground/40 hover:text-sidebar-foreground/60 hover:bg-sidebar-border transition-all"
          >
            {expanded ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </button>

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
              onClick={() => setShowMenu(false)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="size-3.5" />
              Business Settings
            </button>
            <button
              onClick={() => setShowMenu(false)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Image className="size-3.5" />
              Change Icon
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
              Delete Business
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <ul className="ml-6 mt-0.5 space-y-0.5">
          {businessFeatures.map((feature) => (
            <li key={feature.id}>
              <button
                onClick={() => onSelect(`${business.id}:${feature.id}`)}
                className="flex w-full items-center rounded-md px-2 py-1 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
              >
                {feature.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
