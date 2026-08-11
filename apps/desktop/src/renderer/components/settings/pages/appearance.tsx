import { cn } from '../../../lib/utils'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../../lib/theme-context'
import { Plus, X, Check } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@orca-blitz/ui/components/ui/select'
import { LanguageSelect } from './language-select'

const themes = [
  { id: 'system' as const, label: 'System' },
  { id: 'dark' as const, label: 'Dark' },
  { id: 'light' as const, label: 'Light' },
]

const palettes = [
  { id: 'default', label: 'Default', color: '#6366f1' },
  { id: 'blue', label: 'Blue', color: '#3b82f6' },
  { id: 'green', label: 'Green', color: '#22c55e' },
  { id: 'red', label: 'Red', color: '#ef4444' },
  { id: 'orange', label: 'Orange', color: '#f97316' },
  { id: 'yellow', label: 'Yellow', color: '#eab308' },
  { id: 'pink', label: 'Pink', color: '#ec4899' },
  { id: 'purple', label: 'Purple', color: '#a855f7' },
  { id: 'teal', label: 'Teal', color: '#14b8a6' },
  { id: 'zinc', label: 'Zinc', color: '#71717a' },
]

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [showPalettes, setShowPalettes] = useState(false)
  const [selectedPalette, setSelectedPalette] = useState('default')
  const [language, setLanguage] = useState('system')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPalettes(false)
      }
    }
    if (showPalettes) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPalettes])

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">Customize how orca-blitz looks on your device.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Select your preferred color mode</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex rounded-md border border-border bg-muted p-0.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      'rounded-[5px] px-3 py-1 text-xs font-medium transition-colors',
                      theme === t.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowPalettes(!showPalettes)}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-md border transition-colors',
                    showPalettes
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  {showPalettes ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
                </button>

                {showPalettes && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-[180px] rounded-lg border border-border bg-popover p-1 shadow-md">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Palettes
                    </p>
                    {palettes.map((palette) => (
                      <button
                        key={palette.id}
                        onClick={() => {
                          setSelectedPalette(palette.id)
                          setShowPalettes(false)
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="size-3.5 rounded-full" style={{ backgroundColor: palette.color }} />
                        <span className="flex-1 text-left">{palette.label}</span>
                        {selectedPalette === palette.id && <Check className="size-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Accent Color</p>
            <p className="text-xs text-muted-foreground">Choose the highlight color for buttons and links</p>
          </div>
          <span className="text-sm text-muted-foreground">Default</span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Language</p>
            <p className="text-xs text-muted-foreground">Select your preferred language</p>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Español">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Font Size</p>
            <p className="text-xs text-muted-foreground">Adjust the text size across the app</p>
          </div>
          <span className="text-sm text-muted-foreground">14px</span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Sidebar Position</p>
            <p className="text-xs text-muted-foreground">Choose which side the sidebar appears on</p>
          </div>
          <span className="text-sm text-muted-foreground">Left</span>
        </div>
      </div>
    </div>
  )
}
