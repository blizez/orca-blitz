import { useState } from 'react'
import { SettingsSidebar } from './settings-sidebar'
import { AppearanceSettings } from './pages/appearance'
import { NotificationsSettings } from './pages/notifications'
import { ShortcutsSettings } from './pages/shortcuts'
import { StatisticsSettings } from './pages/statistics'
import { BillingSettings } from './pages/billing'
import { IntegrationsSettings } from './pages/integrations'
import { ProvidersSettings } from './pages/providers'
import { SecuritySettings } from './pages/security'
import { BusinessSettings } from './pages/business-settings'
import type { Business } from '@orca-blitz/shared'

interface SettingsPageProps {
  onBack: () => void
  businessId?: string | null
  business?: Business | null
  businesses?: Business[]
  onUpdateBusiness?: (id: string, data: Partial<Business>) => void
  onDeleteBusiness?: (id: string) => void
  onSelectBusiness?: (business: Business) => void
}

const pages: Record<string, React.ComponentType> = {
  appearance: AppearanceSettings,
  notifications: NotificationsSettings,
  shortcuts: ShortcutsSettings,
  statistics: StatisticsSettings,
  billing: BillingSettings,
  integrations: IntegrationsSettings,
  ai: ProvidersSettings,
  security: SecuritySettings,
}

export function SettingsPage({ onBack, businessId, business, businesses, onUpdateBusiness, onDeleteBusiness, onSelectBusiness }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState(businessId ? 'business' : 'appearance')

  const isBusinessMode = !!businessId && business
  const ActivePage = isBusinessMode && activeTab === 'business'
    ? () => business && onUpdateBusiness && onDeleteBusiness ? (
        <BusinessSettings business={business} onUpdate={onUpdateBusiness} onDelete={onDeleteBusiness} />
      ) : null
    : pages[activeTab] ?? AppearanceSettings

  const handleBusinessSelect = (biz: Business) => {
    onSelectBusiness?.(biz)
    setActiveTab('business')
  }

  return (
    <div className="flex h-full">
      <SettingsSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={onBack}
        businessId={businessId}
        businesses={businesses}
        onBusinessSelect={handleBusinessSelect}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl p-6">
          {isBusinessMode && activeTab === 'business'
            ? (business && onUpdateBusiness && onDeleteBusiness ? (
                <BusinessSettings business={business} onUpdate={onUpdateBusiness} onDelete={onDeleteBusiness} />
              ) : null)
            : <ActivePage />}
        </div>
      </main>
    </div>
  )
}
