export function ShortcutsSettings() {
  const shortcuts = [
    { keys: ['Ctrl', 'N'], action: 'New item' },
    { keys: ['Ctrl', 'S'], action: 'Save' },
    { keys: ['Ctrl', '/'], action: 'Toggle search' },
    { keys: ['Ctrl', 'B'], action: 'Toggle sidebar' },
    { keys: ['Ctrl', ','], action: 'Open settings' },
    { keys: ['Ctrl', 'Q'], action: 'Quit app' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
        <p className="text-sm text-muted-foreground">View and customize keyboard shortcuts.</p>
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
