import { useState, useRef, useEffect } from 'react'
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
import { cn } from '../../lib/utils'

const menuGroups = [
  [
    { label: 'Keyboard Shortcuts', icon: Keyboard, id: 'shortcuts' },
  ],
  [
    { label: 'Send Feedback', icon: MessageSquare, id: 'feedback' },
    { label: 'Milestones', icon: Flag, id: 'milestones' },
    { label: 'Onboarding', icon: Rocket, id: 'onboarding' },
  ],
  [
    { label: 'Documentation', icon: BookOpen, id: 'docs' },
    { label: 'Changelog', icon: FileText, id: 'changelog' },
    { label: 'GitHub', icon: Github, id: 'github' },
  ],
  [
    { label: 'Check for Updates', icon: RefreshCw, id: 'updates' },
    { label: 'Restart', icon: RotateCcw, id: 'restart' },
  ],
]

interface HelpMenuProps {
  collapsed: boolean
}

export function HelpMenu({ collapsed }: HelpMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex size-7 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
      >
        <HelpCircle className="size-4" />
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 left-0 z-50 min-w-[200px] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md">
          {menuGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="my-1 h-px bg-border" />}
              {group.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setOpen(false)}
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
