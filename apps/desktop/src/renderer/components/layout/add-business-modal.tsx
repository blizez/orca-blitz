import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useSound } from '../../lib/sound-context'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@orca-blitz/ui/components/ui/select'

interface AddBusinessModalProps {
  open: boolean
  onClose: () => void
  onAdd: (business: BusinessData) => void
}

export interface BusinessData {
  name: string
  type: string
  industry: string
  description: string
  website: string
  products: string
  audience: string
  competitors: string
  usp: string
  painPoints: string
  monthlyRevenue: string
  yearEstablished: string
  channels: string[]
  goals: string[]
  teamSize: string
}

const steps = [
  { id: 1, title: 'Basics', description: 'Tell us about your business' },
  { id: 2, title: 'Products & Audience', description: 'What do you sell and to whom?' },
  { id: 3, title: 'Market', description: 'Competition and positioning' },
  { id: 4, title: 'Channels', description: 'Where do you connect?' },
  { id: 5, title: 'Goals', description: 'What do you want to achieve?' },
]

const businessTypes = [
  'E-commerce', 'Restaurant', 'Services', 'Retail', 'Healthcare',
  'Education', 'Real Estate', 'SaaS', 'Other',
]

const channelOptions = [
  'WhatsApp', 'Instagram', 'Facebook', 'Email',
  'Phone', 'Live Chat', 'TikTok', 'LinkedIn',
]

const goalOptions = [
  'Increase Sales', 'Improve Customer Support', 'Automate Processes',
  'Better Analytics', 'Marketing Automation', 'Lead Management',
]

const teamSizes = ['Just me', '2-5', '6-10', '11-50', '50+']

const revenueRanges = [
  'Under $10k', '$10k - $50k', '$50k - $100k',
  '$100k - $500k', '$500k - $1M', 'Over $1M', 'Pre-revenue',
]

export function AddBusinessModal({ open, onClose, onAdd }: AddBusinessModalProps) {
  const { play } = useSound()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<BusinessData>({
    name: '', type: '', industry: '', description: '', website: '',
    products: '', audience: '', competitors: '', usp: '', painPoints: '',
    monthlyRevenue: '', yearEstablished: '',
    channels: [], goals: [], teamSize: '',
  })

  if (!open) return null

  const update = (field: keyof BusinessData, value: string | string[]) => {
    setData({ ...data, [field]: value })
  }

  const toggleArrayItem = (field: 'channels' | 'goals', item: string) => {
    const current = data[field] as string[]
    const updated = current.includes(item) ? current.filter((i) => i !== item) : [...current, item]
    update(field, updated)
  }

  const canNext = () => {
    if (step === 1) return data.name.trim() && data.type
    if (step === 2) return data.products.trim()
    if (step === 3) return true
    if (step === 4) return data.channels.length > 0
    if (step === 5) return data.goals.length > 0
    return false
  }

  const handleSubmit = () => {
    play('success')
    onAdd(data)
    setData({ name: '', type: '', industry: '', description: '', website: '', products: '', audience: '', competitors: '', usp: '', painPoints: '', monthlyRevenue: '', yearEstablished: '', channels: [], goals: [], teamSize: '' })
    setStep(1)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Add Business</h2>
            <p className="text-sm text-muted-foreground">Step {step} of {steps.length}</p>
          </div>
          <button onClick={() => { onClose(); play('droplet'); }} className="rounded-md p-1 hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex gap-1 mb-6">
          {steps.map((s) => (
            <div key={s.id} className={cn('h-1 flex-1 rounded-full transition-colors', s.id <= step ? 'bg-primary' : 'bg-muted')} />
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-1">{steps[step - 1].title}</h3>
          <p className="text-xs text-muted-foreground">{steps[step - 1].description}</p>
        </div>

        <div className="min-h-[200px]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Business Name *</label>
                <Input value={data.name} onChange={(e) => update('name', e.target.value)} placeholder="My Store" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type *</label>
                  <Select value={data.type || undefined} onValueChange={(v) => update('type', v as string)}>
                    <SelectTrigger size="sm" className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{businessTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Industry</label>
                  <Input value={data.industry} onChange={(e) => update('industry', e.target.value)} placeholder="Fashion, Food..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Website</label>
                <Input value={data.website} onChange={(e) => update('website', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Brief Description</label>
                <Textarea value={data.description} onChange={(e) => update('description', e.target.value)} placeholder="What does your business do?" rows={2} className="text-sm resize-none" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Products / Services *</label>
                <Textarea value={data.products} onChange={(e) => update('products', e.target.value)} placeholder="What do you sell? Be specific..." rows={3} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Target Audience</label>
                <Textarea value={data.audience} onChange={(e) => update('audience', e.target.value)} placeholder="Who are your ideal customers?" rows={2} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Team Size</label>
                <div className="flex gap-1.5 flex-wrap">
                  {teamSizes.map((size) => (
                    <button key={size} onClick={() => update('teamSize', size)} className={cn('rounded-md border px-3 py-1 text-xs transition-colors', data.teamSize === size ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:bg-accent text-muted-foreground')}>{size}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Main Competitors</label>
                <Textarea value={data.competitors} onChange={(e) => update('competitors', e.target.value)} placeholder="Who are your main competitors? (e.g. Store A, Brand B)" rows={2} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">What makes you different? (USP)</label>
                <Textarea value={data.usp} onChange={(e) => update('usp', e.target.value)} placeholder="Why do customers choose you over competitors?" rows={2} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Current Pain Points</label>
                <Textarea value={data.painPoints} onChange={(e) => update('painPoints', e.target.value)} placeholder="What are your biggest challenges right now?" rows={2} className="text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Monthly Revenue</label>
                  <Select value={data.monthlyRevenue || undefined} onValueChange={(v) => update('monthlyRevenue', v)}>
                    <SelectTrigger size="sm" className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{revenueRanges.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Year Established</label>
                  <Input value={data.yearEstablished} onChange={(e) => update('yearEstablished', e.target.value)} placeholder="2024" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select all channels you use or want to use:</p>
              <div className="grid grid-cols-2 gap-2">
                {channelOptions.map((ch) => (
                  <button key={ch} onClick={() => toggleArrayItem('channels', ch)} className={cn('flex items-center gap-2 rounded-md border p-3 text-sm transition-colors text-left', data.channels.includes(ch) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent')}>
                    <div className={cn('flex size-4 shrink-0 items-center justify-center rounded border', data.channels.includes(ch) ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                      {data.channels.includes(ch) && <Check className="size-3" />}
                    </div>
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">What do you want to achieve? (select multiple)</p>
              <div className="grid grid-cols-1 gap-2">
                {goalOptions.map((g) => (
                  <button key={g} onClick={() => toggleArrayItem('goals', g)} className={cn('flex items-center gap-2 rounded-md border p-3 text-sm transition-colors text-left', data.goals.includes(g) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent')}>
                    <div className={cn('flex size-4 shrink-0 items-center justify-center rounded border', data.goals.includes(g) ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
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
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="flex items-center gap-1 h-8 rounded-md px-3 text-sm hover:bg-muted transition-colors">
            <ChevronLeft className="size-4" />
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < steps.length ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex items-center gap-1 h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Next
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canNext()} className="flex items-center gap-1 h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Check className="size-4" />
              Create Business
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
