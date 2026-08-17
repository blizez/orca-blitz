import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@orca-blitz/ui/components/ui/tabs'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Label } from '@orca-blitz/ui/components/ui/label'
import { Loader2, Check, Cpu } from 'lucide-react'
import { ApiKeyForm } from '../api-key-form'
import type { BuiltInProvider } from '../../types'

interface OpenAISettingsProps {
  provider: BuiltInProvider
  activeTab: string
  apiKey: string
  models: string[]
  selectedModel: string | null
  isFetching: boolean
  error: string | null
  authStatus: string | null
  isAuthenticating: boolean
  onTabChange: (tab: string) => void
  onApiKeyChange: (key: string) => void
  onSelectModel: (model: string) => void
  onStartAuth: () => void
  modelListRef: React.RefObject<HTMLDivElement | null>
}

export function OpenAISettings({
  provider,
  activeTab,
  apiKey,
  models,
  selectedModel,
  isFetching,
  error,
  authStatus,
  isAuthenticating,
  onTabChange,
  onApiKeyChange,
  onSelectModel,
  onStartAuth,
  modelListRef,
}: OpenAISettingsProps) {
  const isElectron = typeof window !== 'undefined' && !!(window as any).electron

  return (
    <>
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="api-key" className="flex-1">API Key</TabsTrigger>
          <TabsTrigger value="chatgpt" className="flex-1">ChatGPT Plus/Pro</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'chatgpt' ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-3">
            {!isElectron ? (
              <p className="text-sm text-muted-foreground">
                ChatGPT authentication requires the desktop app.
              </p>
            ) : authStatus ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Check className="size-4 text-green-500" />
                  <p className="text-sm text-green-500">{authStatus}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Type the model name you want to use below.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Connect with your ChatGPT Plus or Pro account.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Uses your existing ChatGPT subscription limits.
                </p>
              </>
            )}
            {error && (
              <p className="text-xs text-amber-500">{error}</p>
            )}
            {isElectron && (
              <Button
                variant="outline"
                size="sm"
                onClick={onStartAuth}
                disabled={isAuthenticating}
              >
                {isAuthenticating && <Loader2 className="size-4 animate-spin mr-2" />}
                {isAuthenticating ? 'Connecting...' : authStatus ? 'Reconnect' : 'Connect with ChatGPT'}
              </Button>
            )}
          </div>

          {authStatus && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Cpu className="size-3" />
                Model Name
              </Label>
              <Input
                placeholder="e.g. gpt-4o, o1, o3-mini..."
                value={selectedModel || ''}
                onChange={(e) => onSelectModel(e.target.value || '')}
              />
            </div>
          )}
        </div>
      ) : (
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
      )}
    </>
  )
}
