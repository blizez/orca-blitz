import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { builtInProviders, opencodeTabs } from './constants'
import { ProviderCard } from './provider-card'
import { CustomProviders } from './custom-providers'
import { ProviderDialog } from './dialog'
import type { ProviderConfig, CustomProvider, DialogState } from './types'

export function ProvidersSettings() {
  const { t } = useTranslation('providers')
  const [providerConfigs, setProviderConfigs] = useState<Record<string, ProviderConfig>>({})
  const [customProviders, setCustomProviders] = useState<CustomProvider[]>([])
  const [modelsCache, setModelsCache] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('oc_provider_models_cache')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    selectedProvider: null,
    activeTab: 'zen',
    dialogApiKey: '',
    selectedModel: null,
    fetchedModels: [],
    isFetching: false,
    fetchError: null,
    isAuthenticating: false,
    authStatus: null,
    oauthToken: null,
  })

  const modelListRef = useRef<HTMLDivElement>(null)

  const activeProvider = builtInProviders.find((p) => p.id === dialog.selectedProvider)

  const scrollToSelected = useCallback(() => {
    if (!modelListRef.current || !dialog.selectedModel) return
    const container = modelListRef.current
    const selected = container.querySelector('[data-selected="true"]')
    if (selected) {
      const containerRect = container.getBoundingClientRect()
      const selectedRect = selected.getBoundingClientRect()
      const offset = selectedRect.top - containerRect.top - containerRect.height / 2 + selectedRect.height / 2
      container.scrollTo({ top: container.scrollTop + offset, behavior: 'smooth' })
    }
  }, [dialog.selectedModel])

  const getCacheKey = (providerId: string, tab?: string) => {
    return tab ? `${providerId}:${tab}` : providerId
  }

  const fetchModels = async () => {
    if (!activeProvider || !dialog.dialogApiKey.trim()) return

    setDialog((prev) => ({ ...prev, isFetching: true, fetchError: null, fetchedModels: [] }))

    const key = dialog.dialogApiKey.trim()

    try {
      let models: string[] = []
      let endpoint = ''

      if (activeProvider.id === 'opencode') {
        const tab = opencodeTabs.find((t) => t.id === dialog.activeTab)
        endpoint = tab?.endpoint || opencodeTabs[0].endpoint
      } else if (activeProvider.id === 'openai') {
        endpoint = 'https://api.openai.com/v1/models'
      } else if (activeProvider.id === 'google') {
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      } else if (activeProvider.id === 'deepseek') {
        endpoint = 'https://api.deepseek.com/v1/models'
      } else if (activeProvider.id === 'ollama') {
        endpoint = `${key.startsWith('http') ? key : 'http://localhost:11434'}/api/tags`
      }

      if (activeProvider.id === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'hi' }],
          }),
        })
        if (res.status === 401) throw new Error('Invalid API key')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        models = []
      } else if (endpoint) {
        const headers: Record<string, string> = {}
        if (['opencode', 'openai', 'deepseek'].includes(activeProvider.id)) {
          headers['Authorization'] = `Bearer ${key}`
        }

        const res = await fetch(endpoint, { headers })
        if (!res.ok) {
          if (res.status === 401) throw new Error('Invalid API key')
          throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()

        if (activeProvider.id === 'ollama') {
          models = data.models?.map((m: { name: string }) => m.name).sort() || []
        } else if (activeProvider.id === 'google') {
          models = data.models?.map((m: { name: string }) => m.name.replace('models/', '')).sort() || []
        } else if (data.data && Array.isArray(data.data)) {
          models = data.data.map((m: { id: string }) => m.id).sort()
        } else if (Array.isArray(data)) {
          models = data.map((m: { id: string } | string) => typeof m === 'string' ? m : m.id).sort()
        }
      }

      if (models.length > 0) {
        const cacheKey = getCacheKey(activeProvider.id, activeProvider.id === 'opencode' ? dialog.activeTab : undefined)
        setModelsCache((prev) => ({ ...prev, [cacheKey]: models }))
        setDialog((prev) => ({ ...prev, fetchedModels: models }))
      } else {
        setDialog((prev) => ({ ...prev, fetchError: 'No models found.' }))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      if (msg.includes('Invalid API key')) {
        setDialog((prev) => ({ ...prev, fetchError: 'Invalid API key. Please check and try again.' }))
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setDialog((prev) => ({ ...prev, fetchError: 'Cannot reach provider. Check your connection or API key.' }))
      } else {
        setDialog((prev) => ({ ...prev, fetchError: msg }))
      }
    } finally {
      setDialog((prev) => ({ ...prev, isFetching: false }))
    }
  }

  useEffect(() => {
    localStorage.setItem('oc_provider_models_cache', JSON.stringify(modelsCache))
  }, [modelsCache])

  useEffect(() => {
    if (dialog.open && dialog.selectedModel && dialog.fetchedModels.length > 0) {
      setTimeout(scrollToSelected, 100)
    }
  }, [dialog.open, dialog.selectedModel, dialog.fetchedModels.length])

  useEffect(() => {
    if (!activeProvider || !dialog.dialogApiKey.trim()) {
      setDialog((prev) => ({ ...prev, fetchedModels: [], fetchError: null }))
      return
    }

    if (activeProvider.id === 'opencode') {
      const cacheKey = getCacheKey(activeProvider.id, dialog.activeTab)
      const cached = modelsCache[cacheKey]
      if (cached && cached.length > 0) {
        setDialog((prev) => ({ ...prev, fetchedModels: cached, fetchError: null }))
        return
      }
    }

    const timer = setTimeout(() => {
      fetchModels()
    }, 800)

    return () => clearTimeout(timer)
  }, [dialog.dialogApiKey, activeProvider?.id, dialog.activeTab])

  const openDialog = (providerId: string) => {
    const existing = providerConfigs[providerId]

    let newDialog: Partial<DialogState> = {
      open: true,
      selectedProvider: providerId,
      fetchError: null,
      authStatus: null,
      oauthToken: null,
    }

    if (providerId === 'opencode') {
      newDialog.activeTab = 'zen'
      newDialog.dialogApiKey = existing?.apiKeyZen || ''
      newDialog.selectedModel = existing?.selectedModelZen || null
      const cacheKey = getCacheKey(providerId, 'zen')
      newDialog.fetchedModels = modelsCache[cacheKey] || []
    } else if (providerId === 'openai') {
      newDialog.activeTab = existing?.authMethod || 'api-key'
      if (existing?.authMethod === 'chatgpt') {
        newDialog.dialogApiKey = ''
        newDialog.selectedModel = existing?.chatgptModel || null
        newDialog.oauthToken = existing?.oauthToken || null
        newDialog.authStatus = existing?.oauthToken ? 'Connected! Type the model name you want to use.' : null
      } else {
        newDialog.dialogApiKey = existing?.apiKey || ''
        newDialog.selectedModel = existing?.selectedModel || null
        const cacheKey = getCacheKey(providerId)
        newDialog.fetchedModels = modelsCache[cacheKey] || []
      }
    } else {
      newDialog.activeTab = 'api-key'
      newDialog.dialogApiKey = existing?.apiKey || ''
      newDialog.selectedModel = existing?.selectedModel || null
      const cacheKey = getCacheKey(providerId)
      newDialog.fetchedModels = modelsCache[cacheKey] || []
    }

    setDialog((prev) => ({ ...prev, ...newDialog }))
  }

  const handleTabChange = (tab: string) => {
    const existing = providerConfigs[dialog.selectedProvider!]

    setDialog((prev) => {
      const next = { ...prev, activeTab: tab, fetchedModels: [] as string[], selectedModel: null as string | null, fetchError: null as string | null, authStatus: null as string | null }

      if (dialog.selectedProvider === 'opencode') {
        if (tab === 'zen') {
          next.dialogApiKey = existing?.apiKeyZen || ''
          next.selectedModel = existing?.selectedModelZen || null
        } else {
          next.dialogApiKey = existing?.apiKeyGo || ''
          next.selectedModel = existing?.selectedModelGo || null
        }
        const cacheKey = getCacheKey(dialog.selectedProvider!, tab)
        next.fetchedModels = modelsCache[cacheKey] || []
      }

      return next
    })
  }

  const isElectron = typeof window !== 'undefined' && !!(window as any).electron

  const startChatGPTAuth = async () => {
    if (!isElectron) {
      setDialog((prev) => ({ ...prev, fetchError: 'ChatGPT authentication requires the desktop app.' }))
      return
    }

    setDialog((prev) => ({ ...prev, isAuthenticating: true, authStatus: 'Opening browser...', fetchedModels: [] }))

    const unsubUrl = window.api.openai.onAuthUrl((url) => {
      window.open(url, '_blank')
      setDialog((prev) => ({ ...prev, authStatus: 'Waiting for authorization in browser...' }))
    })

    const unsubToken = window.api.openai.onAuthToken(({ accessToken }) => {
      setDialog((prev) => ({ ...prev, oauthToken: accessToken }))
    })

    const unsubModels = window.api.openai.onAuthModels(() => {
      setDialog((prev) => ({ ...prev, authStatus: 'Connected! Type the model name you want to use.', isAuthenticating: false }))
      unsubUrl()
      unsubToken()
      unsubModels()
      unsubError()
    })

    const unsubError = window.api.openai.onAuthError((error) => {
      setDialog((prev) => ({ ...prev, authStatus: null, isAuthenticating: false, fetchError: error }))
      unsubUrl()
      unsubToken()
      unsubModels()
      unsubError()
    })

    try {
      await window.api.openai.startAuth()
    } catch (err) {
      setDialog((prev) => ({
        ...prev,
        authStatus: null,
        isAuthenticating: false,
        fetchError: err instanceof Error ? err.message : 'Authentication failed',
      }))
      unsubUrl()
      unsubToken()
      unsubModels()
      unsubError()
    }
  }

  const selectModel = (model: string) => {
    setDialog((prev) => ({ ...prev, selectedModel: model }))
    setTimeout(scrollToSelected, 50)
  }

  const saveProvider = () => {
    if (!dialog.selectedProvider) return

    if (dialog.selectedProvider === 'opencode') {
      const existing = providerConfigs[dialog.selectedProvider] || { apiKey: '', selectedModel: null }
      if (dialog.activeTab === 'zen') {
        setProviderConfigs((prev) => ({
          ...prev,
          [dialog.selectedProvider!]: {
            ...existing,
            apiKeyZen: dialog.dialogApiKey.trim(),
            selectedModelZen: dialog.selectedModel,
          },
        }))
      } else {
        setProviderConfigs((prev) => ({
          ...prev,
          [dialog.selectedProvider!]: {
            ...existing,
            apiKeyGo: dialog.dialogApiKey.trim(),
            selectedModelGo: dialog.selectedModel,
          },
        }))
      }
    } else if (dialog.selectedProvider === 'openai') {
      const existing = providerConfigs[dialog.selectedProvider] || { apiKey: '', selectedModel: null }
      if (dialog.activeTab === 'chatgpt') {
        setProviderConfigs((prev) => ({
          ...prev,
          [dialog.selectedProvider!]: {
            ...existing,
            authMethod: 'chatgpt',
            chatgptModel: dialog.selectedModel,
            oauthToken: dialog.oauthToken,
          },
        }))
      } else {
        setProviderConfigs((prev) => ({
          ...prev,
          [dialog.selectedProvider!]: {
            ...existing,
            authMethod: 'api-key',
            apiKey: dialog.dialogApiKey.trim(),
            selectedModel: dialog.selectedModel,
          },
        }))
      }
    } else {
      setProviderConfigs((prev) => ({
        ...prev,
        [dialog.selectedProvider!]: {
          apiKey: dialog.dialogApiKey.trim(),
          selectedModel: dialog.selectedModel,
        },
      }))
    }

    setDialog((prev) => ({ ...prev, open: false }))
  }

  const handleAddCustom = (provider: CustomProvider) => {
    setCustomProviders((prev) => [...prev, provider])
  }

  const handleRemoveCustom = (id: string) => {
    setCustomProviders((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="space-y-4">
        {builtInProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            config={providerConfigs[provider.id]}
            onConfigure={openDialog}
          />
        ))}
      </div>

      <CustomProviders
        providers={customProviders}
        onAdd={handleAddCustom}
        onRemove={handleRemoveCustom}
      />

      <ProviderDialog
        provider={activeProvider}
        state={dialog}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
        onSave={saveProvider}
        onApiKeyChange={(key) => setDialog((prev) => ({ ...prev, dialogApiKey: key }))}
        onSelectModel={selectModel}
        onTabChange={handleTabChange}
        onStartAuth={startChatGPTAuth}
        modelListRef={modelListRef}
      />
    </div>
  )
}
