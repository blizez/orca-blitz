import { useTranslation } from 'react-i18next'

export function ShortcutsSettings() {
  const { t } = useTranslation('settings')

  const shortcuts = [
    { keys: ['Ctrl', 'N'], action: t('shortcuts.newItem', 'New item') },
    { keys: ['Ctrl', 'S'], action: t('shortcuts.save', 'Save') },
    { keys: ['Ctrl', '/'], action: t('shortcuts.toggleSearch', 'Toggle search') },
    { keys: ['Ctrl', 'B'], action: t('shortcuts.toggleSidebar', 'Toggle sidebar') },
    { keys: ['Ctrl', ','], action: t('shortcuts.openSettings', 'Open settings') },
    { keys: ['Ctrl', 'Q'], action: t('shortcuts.quitApp', 'Quit app') },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('shortcuts.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('shortcuts.description')}</p>
      </div>

      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.action} className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm">{shortcut.action}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key) => (
                <kbd key={key} className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium">
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
