import { useTranslation } from 'react-i18next'

export function StatisticsSettings() {
  const { t } = useTranslation('settings')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('statistics.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('statistics.description')}</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">{t('statistics.apiCalls')}</p>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-2 w-[35%] rounded-full bg-primary" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">350 / 1,000 used</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">{t('statistics.workflows')}</p>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-2 w-[12%] rounded-full bg-primary" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">12 / 100 used</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('statistics.storage.label')}</p>
              <p className="text-xs text-muted-foreground">{t('statistics.storage.description')}</p>
            </div>
            <span className="text-sm text-muted-foreground">24 MB</span>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('statistics.tokens.label')}</p>
              <p className="text-xs text-muted-foreground">{t('statistics.tokens.description')}</p>
            </div>
            <span className="text-sm text-muted-foreground">12.4k</span>
          </div>
        </div>
      </div>
    </div>
  )
}
