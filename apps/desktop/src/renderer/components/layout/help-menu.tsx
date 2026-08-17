import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HelpCircle,
  Keyboard,
  MessageSquare,
  Flag,
  Rocket,
  BookOpen,
  FileText,
  Github,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpMenuProps {
  collapsed: boolean
}

export function HelpMenu({ collapsed }: HelpMenuProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const menuGroups = [
    [
      { label: t('help.keyboardShortcuts'), icon: Keyboard, id: 'shortcuts' },
    ],
    [
      { label: t('help.sendFeedback'), icon: MessageSquare, id: 'feedback' },
      { label: t('help.milestones'), icon: Flag, id: 'milestones' },
      { label: t('help.onboarding'), icon: Rocket, id: 'onboarding' },
    ],
    [
      { label: t('help.documentation'), icon: BookOpen, id: 'docs' },
      { label: t('help.changelog'), icon: FileText, id: 'changelog' },
      { label: t('help.github'), icon: Github, id: 'github' },
    ],
    [
      { label: t('help.checkForUpdates'), icon: RefreshCw, id: 'updates' },
      { label: t('help.restart'), icon: RotateCcw, id: 'restart' },
    ],
  ]

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-7 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
      >
        <HelpCircle className="size-4" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute bottom-full mb-1 z-[60] min-w-[200px] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md',
            collapsed ? 'left-0' : 'right-0'
          )}
        >
          {menuGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="my-1 h-px bg-border" />}
              {group.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
