import { ApiKeyForm } from '../api-key-form'
import type { BuiltInProvider } from '../../types'

interface DefaultSettingsProps {
  provider: BuiltInProvider
  apiKey: string
  models: string[]
  selectedModel: string | null
  isFetching: boolean
  error: string | null
  onApiKeyChange: (key: string) => void
  onSelectModel: (model: string) => void
  modelListRef: React.RefObject<HTMLDivElement | null>
}

export function DefaultSettings({
  provider,
  apiKey,
  models,
  selectedModel,
  isFetching,
  error,
  onApiKeyChange,
  onSelectModel,
  modelListRef,
}: DefaultSettingsProps) {
  return (
    <ApiKeyForm
      provider={provider}
      apiKey={apiKey}
      models={models}
      selectedModel={selectedModel}
      isFetching={isFetching}
      error={error}
      onApiKeyChange={onApiKeyChange}
      onSelectModel={onSelectModel}
      modelListRef={modelListRef}
    />
  )
}
