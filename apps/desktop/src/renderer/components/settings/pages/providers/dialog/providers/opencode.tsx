import { Tabs, TabsList, TabsTrigger } from '@orca-blitz/ui/components/ui/tabs'
import { ApiKeyForm } from '../api-key-form'
import type { BuiltInProvider } from '../../types'

interface OpenCodeSettingsProps {
  provider: BuiltInProvider
  activeTab: string
  apiKey: string
  models: string[]
  selectedModel: string | null
  isFetching: boolean
  error: string | null
  onTabChange: (tab: string) => void
  onApiKeyChange: (key: string) => void
  onSelectModel: (model: string) => void
  modelListRef: React.RefObject<HTMLDivElement | null>
}

export function OpenCodeSettings({
  provider,
  activeTab,
  apiKey,
  models,
  selectedModel,
  isFetching,
  error,
  onTabChange,
  onApiKeyChange,
  onSelectModel,
  modelListRef,
}: OpenCodeSettingsProps) {
  return (
    <>
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="zen" className="flex-1">Zen</TabsTrigger>
          <TabsTrigger value="go" className="flex-1">Go</TabsTrigger>
        </TabsList>
      </Tabs>

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
    </>
  )
}
