import { useTranslation } from 'react-i18next'
import { Loader2, Key } from 'lucide-react'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Label } from '@orca-blitz/ui/components/ui/label'
import { ModelList } from './model-list'
import type { BuiltInProvider } from '../types'

interface ApiKeyFormProps {
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

export function ApiKeyForm({
  provider,
  apiKey,
  models,
  selectedModel,
  isFetching,
  error,
  onApiKeyChange,
  onSelectModel,
  modelListRef,
}: ApiKeyFormProps) {
  const { t } = useTranslation('providers')

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="dialog-apikey" className="flex items-center gap-1.5">
          <Key className="size-3" />
          {t('apiKey.label')}
        </Label>
        <Input
          id="dialog-apikey"
          placeholder={provider.placeholder}
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
        {error && (
          <p className="text-xs text-amber-500 mt-1">{error}</p>
        )}
        {isFetching && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin" />
            {t('apiKey.detecting')}
          </p>
        )}
      </div>

      <ModelList
        ref={modelListRef}
        models={models}
        selectedModel={selectedModel}
        isFetching={isFetching}
        onSelect={onSelectModel}
      />
    </>
  )
}
