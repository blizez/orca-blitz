import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AddBusinessModalProps {
  open: boolean
  onClose: () => void
  onAdd: (business: BusinessData) => void
}

interface BusinessData {
  name: string
  type: string
  industry: string
  description: string
  products: string
  audience: string
  channels: string[]
  goals: string[]
  teamSize: string
}

const steps = [
  { id: 1, title: 'Basics', description: 'Tell us about your business' },
  { id: 2, title: 'Audience', description: 'Who are your customers?' },
  { id: 3, title: 'Channels', description: 'Where do you connect?' },
  { id: 4, title: 'Goals', description: 'What do you want to achieve?' },
]

const businessTypes = [
  'E-commerce',
  'Restaurant',
  'Services',
  'Retail',
  'Healthcare',
  'Education',
  'Real Estate',
  'SaaS',
  'Other',
]

const channelOptions = [
  'WhatsApp',
  'Instagram',
  'Facebook',
  'Email',
  'Phone',
  'Live Chat',
  'TikTok',
  'LinkedIn',
]

const goalOptions = [
  'Increase Sales',
  'Improve Customer Support',
  'Automate Processes',
  'Better Analytics',
  'Marketing Automation',
  'Lead Management',
]

const teamSizes = [
  'Just me',
  '2-5',
  '6-10',
  '11-50',
  '50+',
]

export function AddBusinessModal({ open, onClose, onAdd }: AddBusinessModalProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<BusinessData>({
    name: '',
    type: '',
    industry: '',
    description: '',
    products: '',
    audience: '',
    channels: [],
    goals: [],
    teamSize: '',
  })

  if (!open) return null

  const update = (field: keyof BusinessData, value: string | string[]) => {
    setData({ ...data, [field]: value })
  }

  const toggleArrayItem = (field: 'channels' | 'goals', item: string) => {
    const current = data[field] as string[]
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item]
    update(field, updated)
  }

  const canNext = () => {
    if (step === 1) return data.name.trim() && data.type
    if (step === 2) return data.audience.trim()
    if (step === 3) return data.channels.length > 0
    if (step === 4) return data.goals.length > 0
    return false
  }

  const handleSubmit = () => {
    onAdd(data)
    setData({ name: '', type: '', industry: '', description: '', products: '', audience: '', channels: [], goals: [], teamSize: '' })
    setStep(1)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Add Business</h2>
            <p className="text-sm text-muted-foreground">Step {step} of {steps.length}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex gap-1 mb-6">
          {steps.map((s) => (
            <div
              key={s.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                s.id <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-1">{steps[step - 1].title}</h3>
          <p className="text-xs text-muted-foreground">{steps[step - 1].description}</p>
        </div>

        <div className="min-h-[200px]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Business Name *</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="My Store"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Business Type *</label>
                <select
                  value={data.type}
                  onChange={(e) => update('type', e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select type...</option>
                  {businessTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <input
                  type="text"
                  value={data.industry}
                  onChange={(e) => update('industry', e.target.value)}
                  placeholder="Fashion, Food, Tech..."
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Brief Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="What does your business do?"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Who is your target audience? *</label>
                <textarea
                  value={data.audience}
                  onChange={(e) => update('audience', e.target.value)}
                  placeholder="Young professionals, families, small businesses..."
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium">What do you sell?</label>
                <input
                  type="text"
                  value={data.products}
                  onChange={(e) => update('products', e.target.value)}
                  placeholder="Clothing, consulting, subscriptions..."
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Team Size</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {teamSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => update('teamSize', size)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm transition-colors',
                        data.teamSize === size
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select all channels you use or want to use:</p>
              <div className="grid grid-cols-2 gap-2">
                {channelOptions.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => toggleArrayItem('channels', ch)}
                    className={cn(
                      'flex items-center gap-2 rounded-md border p-3 text-sm transition-colors text-left',
                      data.channels.includes(ch)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-accent'
                    )}
                  >
                    <div className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border',
                      data.channels.includes(ch)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    )}>
                      {data.channels.includes(ch) && <Check className="size-3" />}
                    </div>
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">What do you want to achieve? (select multiple)</p>
              <div className="grid grid-cols-1 gap-2">
                {goalOptions.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleArrayItem('goals', g)}
                    className={cn(
                      'flex items-center gap-2 rounded-md border p-3 text-sm transition-colors text-left',
                      data.goals.includes(g)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-accent'
                    )}
                  >
                    <div className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border',
                      data.goals.includes(g)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    )}>
                      {data.goals.includes(g) && <Check className="size-3" />}
                    </div>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1 h-8 rounded-md px-3 text-sm hover:bg-muted transition-colors"
          >
            <ChevronLeft className="size-4" />
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < steps.length ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1 h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext()}
              className="flex items-center gap-1 h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="size-4" />
              Create Business
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
