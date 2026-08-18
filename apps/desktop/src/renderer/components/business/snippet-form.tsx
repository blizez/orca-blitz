import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Textarea } from '@orca-blitz/ui/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@orca-blitz/ui/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@orca-blitz/ui/components/ui/dialog'

export type SnippetCategory = 'cta' | 'description' | 'greeting' | 'response' | 'payment' | 'other'

export interface SavedSnippet {
  id: string
  title: string
  body: string
  category: SnippetCategory
  createdAt: string
}

interface SnippetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  snippet?: SavedSnippet | null
  onSave: (data: Omit<SavedSnippet, 'id' | 'createdAt'>) => void
}

const CATEGORY_OPTIONS: { value: SnippetCategory; labelKey: string }[] = [
  { value: 'cta', labelKey: 'snippets.categories.cta' },
  { value: 'description', labelKey: 'snippets.categories.description' },
  { value: 'greeting', labelKey: 'snippets.categories.greeting' },
  { value: 'response', labelKey: 'snippets.categories.response' },
  { value: 'payment', labelKey: 'snippets.categories.payment' },
  { value: 'other', labelKey: 'snippets.categories.other' },
]

export function SnippetForm({ open, onOpenChange, snippet, onSave }: SnippetFormProps) {
  const { t } = useTranslation('business')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<SnippetCategory>('other')

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title)
      setBody(snippet.body)
      setCategory(snippet.category)
    } else {
      setTitle('')
      setBody('')
      setCategory('other')
    }
  }, [snippet, open])

  const handleSubmit = () => {
    if (!title.trim()) return
    onSave({ title: title.trim(), body, category })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{snippet ? t('snippets.editSnippet') : t('snippets.newSnippet')}</DialogTitle>
          <DialogDescription>{t('snippets.formDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('snippets.titleLabel')}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('snippets.titlePlaceholder')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('snippets.categoryLabel')}</label>
            <Select value={category} onValueChange={(v) => setCategory(v as SnippetCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('snippets.bodyLabel')}</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('snippets.bodyPlaceholder')}
              className="bg-background"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('snippets.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {snippet ? t('snippets.updateSnippet') : t('snippets.saveSnippet')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
