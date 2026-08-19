import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BusinessItem } from './business-item'
import type { Business } from '@orca-blitz/shared'

interface SortableBusinessItemProps {
  business: Business
  isActive: boolean
  expanded: boolean
  activePage: string
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onBusinessSettings?: (business: Business) => void
  isDragDisabled?: boolean
}

export function SortableBusinessItem({
  business,
  isActive,
  expanded,
  activePage,
  onToggle,
  onSelect,
  onDelete,
  onBusinessSettings,
  isDragDisabled,
}: SortableBusinessItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: business.id, disabled: isDragDisabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'relative')}>
      <div className="flex items-start">
        {!isDragDisabled && (
          <button
            className={cn(
              'mt-2.5 shrink-0 cursor-grab rounded p-0.5 text-sidebar-foreground/30 hover:text-sidebar-foreground/60 transition-colors',
              isDragging && 'cursor-grabbing'
            )}
            {...attributes}
            {...listeners}
            tabIndex={0}
            aria-label={`Drag to reorder ${business.name}`}
          >
            <GripVertical className="size-3.5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <BusinessItem
            business={business}
            isActive={isActive}
            expanded={expanded}
            activePage={activePage}
            onToggle={onToggle}
            onSelect={onSelect}
            onDelete={onDelete}
            onBusinessSettings={onBusinessSettings}
          />
        </div>
      </div>
    </div>
  )
}
