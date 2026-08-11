import { useState } from 'react'
import { Openai, OpenaiDark } from '@orca-blitz/ui/components/ui/svgs'
import { AnthropicBlack, AnthropicWhite } from '@orca-blitz/ui/components/ui/svgs'
import { Google } from '@orca-blitz/ui/components/ui/svgs'
import { Deepseek } from '@orca-blitz/ui/components/ui/svgs'
import { OllamaDark, OllamaLight } from '@orca-blitz/ui/components/ui/svgs'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Label } from '@orca-blitz/ui/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@orca-blitz/ui/components/ui/dialog'

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    Icon: Openai,
    IconDark: OpenaiDark,
    placeholder: 'sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    Icon: AnthropicBlack,
    IconDark: AnthropicWhite,
    placeholder: 'sk-ant-...',
  },
  {
    id: 'google',
    name: 'Google AI',
    Icon: Google,
    IconDark: Google,
    placeholder: 'AI...',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    Icon: Deepseek,
    IconDark: Deepseek,
    placeholder: 'sk-...',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    Icon: OllamaLight,
    IconDark: OllamaDark,
    placeholder: 'http://localhost:11434',
  },
]

export function ProvidersSettings() {
  const [open, setOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const activeProvider = providers.find((p) => p.id === selectedProvider)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Providers</h3>
        <p className="text-sm text-muted-foreground">
          Configure the AI providers available to your workspace.
        </p>
      </div>

      <div className="space-y-4">
        {providers.map(({ id, name, Icon, IconDark }) => (
          <div
            key={id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
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
                <p className="text-xs text-muted-foreground">Not configured</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setSelectedProvider(id); setOpen(true) }}>
              Configure
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {activeProvider?.name}</DialogTitle>
            <DialogDescription>
              Add your API key to enable {activeProvider?.name}.
            </DialogDescription>
          </DialogHeader>

          {activeProvider && (
            <div className="space-y-1.5">
              <Label htmlFor={`key-${activeProvider.id}`}>{activeProvider.name}</Label>
              <Input
                id={`key-${activeProvider.id}`}
                placeholder={activeProvider.placeholder}
                type="password"
              />
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <DialogClose render={<Button />}>
              Save
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
