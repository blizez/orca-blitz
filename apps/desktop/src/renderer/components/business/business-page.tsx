import { SocialMediaPage, type Platform } from '../social-media/social-media-page'
import { type Tab } from '../social-media/browser-tab-bar'

interface BusinessPageProps {
  page: string
  tabs?: Tab[]
  activeTabId?: string
  onPickPlatform?: (tabId: string, platform: Platform) => void
}

export function BusinessPage({ page, tabs, activeTabId, onPickPlatform }: BusinessPageProps) {
  const parts = page.split(':')
  const featureId = parts[1]

  if (featureId === 'redes' && tabs && activeTabId && onPickPlatform) {
    return (
      <SocialMediaPage
        tabs={tabs}
        activeTabId={activeTabId}
        onPickPlatform={onPickPlatform}
      />
    )
  }

  return <div />
}
