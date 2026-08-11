import {
  Card,
  CardContent,
} from '@orca-blitz/ui/components/ui/card'

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: 'https://cdn.simpleicons.org/openai',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: 'https://cdn.simpleicons.org/anthropic',
  },
  {
    id: 'google',
    name: 'Google AI',
    logo: 'https://cdn.simpleicons.org/google',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: 'https://cdn.simpleicons.org/deepseek',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    logo: 'https://cdn.simpleicons.org/ollama',
  },
]

export function AISettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">AI Providers</h3>
        <p className="text-sm text-muted-foreground">
          Connect the AI providers available to your workspace.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id} size="sm">
            <CardContent className="flex items-center gap-3 py-3">
              <img
                src={provider.logo}
                alt=""
                aria-hidden="true"
                className="size-6 object-contain"
              />
              <span className="text-sm font-medium">{provider.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
