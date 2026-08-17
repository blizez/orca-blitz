import { Store, Plus, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { OrcaLogo } from '@orca-blitz/ui/components/ui/logo'
import { Button } from '@orca-blitz/ui/components/ui/button'

export function HomePage() {
  const { t } = useTranslation('modals')

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <OrcaLogo className="size-10 text-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('home.title')}</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            {t('home.subtitle')}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => document.querySelector<HTMLButtonElement>('[data-add-business]')?.click()}
          >
            <Plus className="size-4 mr-1.5" />
            {t('home.addBusiness')}
          </Button>
          <Button variant="outline">
            <Upload className="size-4 mr-1.5" />
            {t('home.importBusiness')}
          </Button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Ctrl</span>
            <span>+</span>
            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">N</span>
            <span className="ml-2">{t('home.createBusiness')}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Ctrl</span>
            <span>+</span>
            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">I</span>
            <span className="ml-2">{t('home.importBusinessLabel')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
