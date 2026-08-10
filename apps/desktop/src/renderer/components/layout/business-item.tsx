import { useState, useRef, useEffect } from 'react'
import { Building2, MoreHorizontal, Settings, Image, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Business {
  id: string
  name: string
  type: string
  industry: string
}

interface BusinessItemProps {
  business: Business
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function BusinessItem({ business, isActive, onSelect, onDelete }: BusinessItemProps) {
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
    <li
      className="group relative"
      ref={menuRef}
      onMouseEnter={() => {}}
    >
      <div className="flex items-center">
        <button
          onClick={() => onSelect(business.id)}
          className={cn(
            'flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <Building2 className="size-4 shrink-0" />
          <span className="truncate">{business.name}</span>
        </button>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex size-5 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/0 group-hover:text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>

      {showMenu && (
        <div className="absolute right-0 top-full z-50 mt-0.5 w-[160px] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md">
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
    </li>
  )
}
