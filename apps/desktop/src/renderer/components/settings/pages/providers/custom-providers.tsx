import { useState } from 'react'
import { Globe, Plus, Trash2, Key, Cpu } from 'lucide-react'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Label } from '@orca-blitz/ui/components/ui/label'
import { Badge } from '@orca-blitz/ui/components/ui/badge'
import type { CustomProvider } from './types'

interface CustomProvidersProps {
  providers: CustomProvider[]
  onAdd: (provider: CustomProvider) => void
  onRemove: (id: string) => void
}

export function CustomProviders({ providers, onAdd, onRemove }: CustomProvidersProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [models, setModels] = useState('')

  const handleAdd = () => {
    if (!name.trim() || !endpoint.trim()) return
    onAdd({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      endpoint: endpoint.trim(),
      apiKey: apiKey.trim(),
      models: models.split(',').map((m) => m.trim()).filter(Boolean),
    })
    setName('')
    setEndpoint('')
    setApiKey('')
    setModels('')
    setShowForm(false)
  }

  return (
    <>
      {providers.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Providers</p>
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-6 items-center justify-center rounded-md bg-muted">
                  <Globe className="size-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{provider.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[300px]">{provider.endpoint}</p>
                  {provider.models.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {provider.models.slice(0, 3).map((model) => (
                        <Badge key={model} variant="secondary" className="text-[10px]">{model}</Badge>
                      ))}
                      {provider.models.length > 3 && (
                        <Badge variant="secondary" className="text-[10px]">+{provider.models.length - 3}</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onRemove(provider.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="size-4" />
          Add Custom Provider
        </Button>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="provider-name" className="text-xs flex items-center gap-1.5">
                <Cpu className="size-3" />
                Name
              </Label>
              <Input
                id="provider-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom Provider"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="provider-endpoint" className="text-xs flex items-center gap-1.5">
                <Globe className="size-3" />
                Endpoint URL
              </Label>
              <Input
                id="provider-endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.example.com/v1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="provider-apikey" className="text-xs flex items-center gap-1.5">
              <Key className="size-3" />
              API Key
            </Label>
            <Input
              id="provider-apikey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="provider-models" className="text-xs">Models (comma separated)</Label>
            <Input
              id="provider-models"
              value={models}
              onChange={(e) => setModels(e.target.value)}
              placeholder="gpt-4, claude-3, custom-model"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!name.trim() || !endpoint.trim()}>
              Add Provider
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
