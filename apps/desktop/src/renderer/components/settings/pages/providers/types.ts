import type { ComponentType, SVGProps } from 'react'

export interface ProviderConfig {
  apiKey: string
  selectedModel: string | null
  apiKeyZen?: string
  apiKeyGo?: string
  selectedModelZen?: string | null
  selectedModelGo?: string | null
  authMethod?: 'api-key' | 'chatgpt'
  chatgptModel?: string | null
  oauthToken?: string | null
}

export interface BuiltInProvider {
  id: string
  name: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  IconDark: ComponentType<SVGProps<SVGSVGElement>>
  placeholder: string
}

export interface CustomProvider {
  id: string
  name: string
  endpoint: string
  apiKey: string
  models: string[]
}

export interface DialogState {
  open: boolean
  selectedProvider: string | null
  activeTab: string
  dialogApiKey: string
  selectedModel: string | null
  fetchedModels: string[]
  isFetching: boolean
  fetchError: string | null
  isAuthenticating: boolean
  authStatus: string | null
  oauthToken: string | null
}

export interface DialogActions {
  setOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void
  setDialogApiKey: (key: string) => void
  setSelectedModel: (model: string | null) => void
  setFetchedModels: (models: string[]) => void
  setIsFetching: (fetching: boolean) => void
  setFetchError: (error: string | null) => void
  setIsAuthenticating: (authenticating: boolean) => void
  setAuthStatus: (status: string | null) => void
  setOauthToken: (token: string | null) => void
}
