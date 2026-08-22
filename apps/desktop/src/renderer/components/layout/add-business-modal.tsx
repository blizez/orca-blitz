import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSound } from '@/lib/sound-context'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@orca-blitz/ui/components/ui/select'
import type { BusinessData } from '@orca-blitz/shared'

interface AddBusinessModalProps {
  open: boolean
  onClose: () => void
  onAdd: (business: BusinessData) => void
}

const steps = [
  { id: 1, titleKey: 'addBusiness.steps.basics.title', descKey: 'addBusiness.steps.basics.description' },
  { id: 2, titleKey: 'addBusiness.steps.products.title', descKey: 'addBusiness.steps.products.description' },
  { id: 3, titleKey: 'addBusiness.steps.market.title', descKey: 'addBusiness.steps.market.description' },
  { id: 4, titleKey: 'addBusiness.steps.channels.title', descKey: 'addBusiness.steps.channels.description' },
  { id: 5, titleKey: 'addBusiness.steps.goals.title', descKey: 'addBusiness.steps.goals.description' },
]

const businessTypeKeys = ['ecommerce', 'restaurant', 'services', 'retail', 'healthcare', 'education', 'realEstate', 'saas', 'other']
const channelKeys = ['whatsapp', 'instagram', 'facebook', 'email', 'phone', 'liveChat', 'tiktok', 'linkedin']
const goalKeys = ['increaseSales', 'improveSupport', 'automateProcesses', 'betterAnalytics', 'marketingAutomation', 'leadManagement']
const teamSizeKeys = ['solo', 'small', 'medium', 'large', 'enterprise']
const revenueRangeKeys = ['under10k', '10k50k', '50k100k', '100k500k', '500k1m', 'over1m', 'preRevenue']

export function AddBusinessModal({ open, onClose, onAdd }: AddBusinessModalProps) {
  const { t } = useTranslation('modals')
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
            <h2 className="text-lg font-semibold">{t('addBusiness.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('addBusiness.step', { current: step, total: steps.length })}</p>
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

        <div className="min-h-[200px]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.businessName')}</label>
                <Input value={data.name} onChange={(e) => update('name', e.target.value)} placeholder={t('addBusiness.placeholders.name')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.type')}</label>
                  <Select value={data.type || undefined} onValueChange={(v) => update('type', v as string)}>
                    <SelectTrigger size="sm" className="w-full"><SelectValue placeholder={t('addBusiness.options.select')} /></SelectTrigger>
                    <SelectContent>{businessTypeKeys.map((type) => <SelectItem key={type} value={type}>{t(`addBusiness.options.businessTypes.${type}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.industry')}</label>
                  <Input value={data.industry} onChange={(e) => update('industry', e.target.value)} placeholder={t('addBusiness.placeholders.industry')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.website')}</label>
                <Input value={data.website} onChange={(e) => update('website', e.target.value)} placeholder={t('addBusiness.placeholders.website')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.description')}</label>
                <Textarea value={data.description} onChange={(e) => update('description', e.target.value)} placeholder={t('addBusiness.placeholders.description')} rows={2} className="text-sm resize-none" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.products')}</label>
                <Textarea value={data.products} onChange={(e) => update('products', e.target.value)} placeholder={t('addBusiness.placeholders.products')} rows={3} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.audience')}</label>
                <Textarea value={data.audience} onChange={(e) => update('audience', e.target.value)} placeholder={t('addBusiness.placeholders.audience')} rows={2} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.teamSize')}</label>
                <div className="flex gap-1.5 flex-wrap">
                  {teamSizeKeys.map((size) => (
                    <button key={size} onClick={() => update('teamSize', size)} className={cn('rounded-md border px-3 py-1 text-xs transition-colors', data.teamSize === size ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:bg-accent text-muted-foreground')}>{t(`addBusiness.options.teamSizes.${size}`)}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.competitors')}</label>
                <Textarea value={data.competitors} onChange={(e) => update('competitors', e.target.value)} placeholder={t('addBusiness.placeholders.competitors')} rows={2} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.usp')}</label>
                <Textarea value={data.usp} onChange={(e) => update('usp', e.target.value)} placeholder={t('addBusiness.placeholders.usp')} rows={2} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.painPoints')}</label>
                <Textarea value={data.painPoints} onChange={(e) => update('painPoints', e.target.value)} placeholder={t('addBusiness.placeholders.painPoints')} rows={2} className="text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.monthlyRevenue')}</label>
                  <Select value={data.monthlyRevenue || undefined} onValueChange={(v) => update('monthlyRevenue', v ?? '')}>
                    <SelectTrigger size="sm" className="w-full"><SelectValue placeholder={t('addBusiness.options.select')} /></SelectTrigger>
                    <SelectContent>{revenueRangeKeys.map((r) => <SelectItem key={r} value={r}>{t(`addBusiness.options.revenueRanges.${r}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('addBusiness.fields.yearEstablished')}</label>
                  <Input value={data.yearEstablished} onChange={(e) => update('yearEstablished', e.target.value)} placeholder="2024" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('addBusiness.helpers.channels')}</p>
              <div className="grid grid-cols-2 gap-2">
                {channelKeys.map((ch) => (
                  <button key={ch} onClick={() => toggleArrayItem('channels', ch)} className={cn('flex items-center gap-2 rounded-md border p-3 text-sm transition-colors text-left', data.channels.includes(ch) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent')}>
                    <div className={cn('flex size-4 shrink-0 items-center justify-center rounded border', data.channels.includes(ch) ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                      {data.channels.includes(ch) && <Check className="size-3" />}
                    </div>
                    {t(`addBusiness.options.channels.${ch}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('addBusiness.helpers.goals')}</p>
              <div className="grid grid-cols-1 gap-2">
                {goalKeys.map((g) => (
                  <button key={g} onClick={() => toggleArrayItem('goals', g)} className={cn('flex items-center gap-2 rounded-md border p-3 text-sm transition-colors text-left', data.goals.includes(g) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent')}>
                    <div className={cn('flex size-4 shrink-0 items-center justify-center rounded border', data.goals.includes(g) ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                      {data.goals.includes(g) && <Check className="size-3" />}
                    </div>
                    {t(`addBusiness.options.goals.${g}`)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="flex items-center gap-1 h-8 rounded-md px-3 text-sm hover:bg-muted transition-colors">
            <ChevronLeft className="size-4" />
            {step > 1 ? t('addBusiness.actions.back') : t('addBusiness.actions.cancel')}
          </button>

          {step < steps.length ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex items-center gap-1 h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {t('addBusiness.actions.next')}
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canNext()} className="flex items-center gap-1 h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Check className="size-4" />
              {t('addBusiness.actions.create')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
