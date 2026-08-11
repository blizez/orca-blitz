export interface AIProviderConfig {
  id: string
  name: string
  apiKey?: string
  baseUrl?: string
  defaultModel?: string
  availableModels: string[]
  enabled: boolean
  lastTested?: string
  status: 'connected' | 'configured' | 'error' | 'not-configured'
}

export interface AIConfig {
  providers: AIProviderConfig[]
}

export const defaultProviders: AIProviderConfig[] = []
