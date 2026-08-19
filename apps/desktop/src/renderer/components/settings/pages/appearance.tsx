import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/lib/theme-context'
import { useTranslation } from 'react-i18next'
import { Plus, X, Check } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@orca-blitz/ui/components/ui/select'
import { colorThemes } from '@orca-blitz/ui'

const themes = [
  { id: 'system' as const, labelKey: 'appearance.theme.system' },
  { id: 'dark' as const, labelKey: 'appearance.theme.dark' },
  { id: 'light' as const, labelKey: 'appearance.theme.light' },
]

export function AppearanceSettings() {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme()
  const { t, i18n } = useTranslation('settings')
  const [showPalettes, setShowPalettes] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const getInitialLang = (): string => {
    const saved = localStorage.getItem('oc_language_pref')
    if (!saved || saved === 'en' || saved === 'es') return 'system'
    return saved
  }

  const [languagePref, setLanguagePref] = useState(getInitialLang)

  const handleLanguageChange = (value: string | null) => {
    const pref = value || 'system'
    setLanguagePref(pref)
    localStorage.setItem('oc_language_pref', pref)

    if (pref === 'system') {
      i18n.changeLanguage(navigator.language.split('-')[0])
    } else if (pref === 'English') {
      i18n.changeLanguage('en')
    } else if (pref === 'Español') {
      i18n.changeLanguage('es')
    }
  }

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
        <h3 className="text-lg font-medium">{t('appearance.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('appearance.description')}</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('appearance.theme.label')}</p>
              <p className="text-xs text-muted-foreground">{t('appearance.theme.description')}</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex rounded-md border border-border bg-muted p-0.5">
                {themes.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={cn(
                      'rounded-[5px] px-3 py-1 text-xs font-medium transition-colors',
                      theme === th.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t(th.labelKey)}
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
                  <div className="absolute right-0 top-full z-50 mt-1 w-[200px] rounded-lg border border-border bg-popover p-1 shadow-md">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('appearance.palettes')}
                    </p>
                    {colorThemes.map((ct) => (
                      <button
                        key={ct.id}
                        onClick={() => {
                          setColorTheme(ct.className)
                          setShowPalettes(false)
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="flex gap-0.5">
                          <div className="size-3 rounded-full border border-border" style={{ backgroundColor: ct.preview.bg }} />
                          <div className="size-3 rounded-full border border-border" style={{ backgroundColor: ct.preview.fg }} />
                          <div className="size-3 rounded-full border border-border" style={{ backgroundColor: ct.preview.primary }} />
                        </div>
                        <span className="flex-1 text-left">{ct.name}</span>
                        {colorTheme === ct.className && <Check className="size-3.5 text-primary" />}
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
            <p className="text-sm font-medium">{t('appearance.accentColor.label')}</p>
            <p className="text-xs text-muted-foreground">{t('appearance.accentColor.description')}</p>
          </div>
          <span className="text-sm text-muted-foreground">{t('appearance.default')}</span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">{t('appearance.language.label')}</p>
            <p className="text-xs text-muted-foreground">{t('appearance.language.description')}</p>
          </div>
          <Select value={languagePref} onValueChange={handleLanguageChange}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="System">System</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Español">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">{t('appearance.fontSize.label')}</p>
            <p className="text-xs text-muted-foreground">{t('appearance.fontSize.description')}</p>
          </div>
          <span className="text-sm text-muted-foreground">14px</span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">{t('appearance.sidebarPosition.label')}</p>
            <p className="text-xs text-muted-foreground">{t('appearance.sidebarPosition.description')}</p>
          </div>
          <span className="text-sm text-muted-foreground">{t('appearance.left')}</span>
        </div>
      </div>
    </div>
  )
}
