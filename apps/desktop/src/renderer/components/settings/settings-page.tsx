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

interface BusinessData {
  id: string
  name: string
  type: string
  industry: string
  description: string
  website: string
  products: string
  audience: string
  competitors: string
  usp: string
  painPoints: string
  monthlyRevenue: string
  yearEstablished: string
  channels: string[]
  goals: string[]
  teamSize: string
}

interface SettingsPageProps {
  onBack: () => void
  businessId?: string | null
  business?: BusinessData | null
  businesses?: BusinessData[]
  onUpdateBusiness?: (id: string, data: Partial<BusinessData>) => void
  onDeleteBusiness?: (id: string) => void
  onSelectBusiness?: (business: BusinessData) => void
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

  const handleBusinessSelect = (biz: BusinessData) => {
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
