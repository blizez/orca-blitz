import { useState } from 'react'
import { SettingsSidebar } from './settings-sidebar'
import { GeneralSettings } from './pages/general'
import { ProfileSettings } from './pages/profile'
import { OrganizationSettings } from './pages/organization'
import { AppearanceSettings } from './pages/appearance'
import { NotificationsSettings } from './pages/notifications'
import { ShortcutsSettings } from './pages/shortcuts'
import { StatisticsSettings } from './pages/statistics'
import { BillingSettings } from './pages/billing'
import { IntegrationsSettings } from './pages/integrations'
import { ProvidersSettings } from "./pages/providers";
import { SecuritySettings } from './pages/security'

interface SettingsPageProps {
  onBack: () => void
}

const pages: Record<string, React.ComponentType> = {
  general: GeneralSettings,
  profile: ProfileSettings,
  organization: OrganizationSettings,
  appearance: AppearanceSettings,
  notifications: NotificationsSettings,
  shortcuts: ShortcutsSettings,
  statistics: StatisticsSettings,
  billing: BillingSettings,
  integrations: IntegrationsSettings,
  ai: ProvidersSettings,
  security: SecuritySettings,
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('general')

  const ActivePage = pages[activeTab] ?? GeneralSettings

  return (
    <div className="flex h-full">
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} onBack={onBack} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl p-6">
          <ActivePage />
        </div>
      </main>
    </div>
  )
}
