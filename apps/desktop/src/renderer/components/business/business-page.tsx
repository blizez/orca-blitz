import { SocialMediaPage, type Platform } from '../social-media/social-media-page'
import { type Tab } from '../social-media/browser-tab-bar'
import { ContentPage } from './content-page'
import { CampaignsPage } from './campaigns-page'
import { NotesPage } from './notes-page'
import { BusinessOverview } from './business-overview'
import type { Business } from '@orca-blitz/shared'

interface BusinessPageProps {
  page: string
  business?: Business | null
  tabs?: Tab[]
  activeTabId?: string
  onPickPlatform?: (tabId: string, platform: Platform) => void
}

export function BusinessPage({ page, business, tabs, activeTabId, onPickPlatform }: BusinessPageProps) {
  const parts = page.split(':')
  const businessId = parts[0]
  const featureId = parts[1]

  return (
    <div className="relative h-full">
      {featureId === 'redes' && tabs && activeTabId && onPickPlatform ? (
        <SocialMediaPage
          tabs={tabs}
          activeTabId={activeTabId}
          onPickPlatform={onPickPlatform}
        />
      ) : featureId === 'content' ? (
        <ContentPage businessId={businessId} />
      ) : featureId === 'campaigns' ? (
        <CampaignsPage businessId={businessId} />
      ) : featureId === 'notes' ? (
        <NotesPage businessId={businessId} />
      ) : business ? (
        <div className="p-6 overflow-y-auto h-full">
          <div className="mx-auto max-w-4xl">
            <BusinessOverview business={business} />
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}
