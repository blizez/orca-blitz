import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { Button } from '@orca-blitz/ui/components/ui/button'
import type { BuiltInProvider, ProviderConfig } from './types'

interface ProviderCardProps {
  provider: BuiltInProvider
  config?: ProviderConfig
  onConfigure: (id: string) => void
}

function getStatusText(provider: BuiltInProvider, config: ProviderConfig): string {
  if (provider.id === 'opencode') {
    return config.selectedModelZen || config.selectedModelGo || 'Configured'
  }
  if (provider.id === 'openai') {
    if (config.authMethod === 'chatgpt') return config.chatgptModel || 'ChatGPT Connected'
    return config.selectedModel || 'Configured'
  }
  return config.selectedModel || 'Configured'
}

function getStatusLabel(provider: BuiltInProvider, config: ProviderConfig): string | null {
  if (provider.id === 'opencode') {
    return config.selectedModelZen ? 'OpenCode Zen' : 'OpenCode Go'
  }
  if (provider.id === 'openai') {
    return config.authMethod === 'chatgpt' ? 'ChatGPT Plus/Pro' : 'API Key'
  }
  return null
}

export function ProviderCard({ provider, config, onConfigure }: ProviderCardProps) {
  const { t } = useTranslation('providers')
  const isConfigured = !!config && (
    provider.id === 'opencode'
      ? !!(config.apiKeyZen && config.selectedModelZen) || !!(config.apiKeyGo && config.selectedModelGo)
      : provider.id === 'openai'
        ? config.authMethod === 'chatgpt' ? !!config.chatgptModel : !!(config.apiKey && config.selectedModel)
        : !!(config.apiKey && config.selectedModel)
  )

  const { Icon, IconDark, name } = provider
  const label = config ? getStatusLabel(provider, config) : null
  const status = config ? getStatusText(provider, config) : null

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="size-6">
          <span className="block dark:hidden">
            <Icon className="size-6" />
          </span>
          <span className="hidden dark:block">
            <IconDark className="size-6" />
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          {isConfigured && config ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Check className="size-3 text-green-500" />
              <span className="text-xs text-muted-foreground">{status}</span>
              {label && (
                <>
                  <span className="text-muted-foreground/30">|</span>
                  <span className="text-xs text-muted-foreground/60">{label}</span>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t('notConfigured')}</p>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => onConfigure(provider.id)}>
        {isConfigured ? t('edit') : t('configure')}
      </Button>
    </div>
  )
}
