import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, CreditCard, ChevronRight, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@orca-blitz/ui/components/ui/button'
import { Input } from '@orca-blitz/ui/components/ui/input'
import { Field, FieldLabel, FieldContent } from '@orca-blitz/ui/components/ui/field'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@orca-blitz/ui/components/ui/collapsible'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@orca-blitz/ui/components/ui/dialog'

interface PaymentMethod {
  id: string
  name: string
  value: string
  qrImage: string
}

const defaultMethods: PaymentMethod[] = [
  { id: 'paypal', name: 'PayPal', value: '', qrImage: '' },
  { id: 'binance', name: 'Binance Pay', value: '', qrImage: '' },
]

export function BillingSettings() {
  const { t } = useTranslation('settings')
  const [methods, setMethods] = useState<PaymentMethod[]>(defaultMethods)
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editingValueId, setEditingValueId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const isDefault = (id: string) => defaultMethods.some((d) => d.id === id)

  const handleAdd = () => {
    if (!newName.trim() || !newValue.trim()) return
    setMethods([...methods, { id: Date.now().toString(), name: newName.trim(), value: newValue.trim(), qrImage: '' }])
    setNewName('')
    setNewValue('')
    setOpen(false)
  }

  const handleDelete = (id: string) => {
    setMethods(methods.filter((m) => m.id !== id))
  }

  const handleImageUpload = (methodId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setMethods(methods.map((m) => m.id === methodId ? { ...m, qrImage: result } : m))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = (methodId: string) => {
    setMethods(methods.map((m) => m.id === methodId ? { ...m, qrImage: '' } : m))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{t('billing.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('billing.description')}</p>
        </div>
        <Button size="sm" onClick={() => { setNewName(''); setNewValue(''); setOpen(true) }}>
          <Plus className="size-3.5 mr-1" />
          {t('billing.addMethod')}
        </Button>
      </div>

      <div className="space-y-2">
        {methods.map((method) => (
          <Collapsible key={method.id} open={expandedId === method.id} onOpenChange={(o) => setExpandedId(o ? method.id : null)}>
            <div className="rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-background">
                    <CreditCard className="size-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.value || t('billing.notConfigured')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!isDefault(method.id) && (
                    <Button variant="ghost" size="icon-xs" onClick={() => { setDeleteTarget(method); setDeleteConfirm('') }} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                  <CollapsibleTrigger render={<Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" />}>
                    <ChevronRight className={cn("size-4 transition-transform", expandedId === method.id && "rotate-90")} />
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent>
                <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                  {!isDefault(method.id) && (
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <FieldContent>
                        <Input
                          value={editingNameId === method.id ? newName : method.name}
                          onChange={(e) => { setEditingNameId(method.id); setNewName(e.target.value) }}
                          placeholder="Payment method name..."
                        />
                      </FieldContent>
                    </Field>
                  )}
                  <Field>
                    <FieldLabel>Account / Number</FieldLabel>
                    <FieldContent>
                      <Input
                        value={editingValueId === method.id ? newValue : method.value}
                        onChange={(e) => { setEditingValueId(method.id); setNewValue(e.target.value) }}
                        placeholder="Phone number, email, wallet..."
                      />
                    </FieldContent>
                  </Field>

                  <div className="flex items-end justify-between">
                    <Field>
                      <FieldLabel>QR Code</FieldLabel>
                      <FieldContent>
                        {method.qrImage ? (
                          <div className="relative inline-block">
                            <img src={method.qrImage} alt={`${method.name} QR`} className="h-32 w-32 rounded-lg border border-border object-cover" />
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleRemoveImage(method.id)}
                              className="absolute -right-2 -top-2 size-5 rounded-full bg-background border border-border text-muted-foreground hover:text-destructive"
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex size-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border hover:bg-muted/50 transition-colors">
                            <Upload className="size-5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Upload QR</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(method.id, file)
                              }}
                            />
                          </label>
                        )}
                      </FieldContent>
                    </Field>
                    <Button size="sm" onClick={() => {
                      const name = editingNameId === method.id && newName.trim() ? newName.trim() : method.name
                      const value = editingValueId === method.id && newValue.trim() ? newValue.trim() : method.value
                      setMethods(methods.map((m) => m.id === method.id ? { ...m, name, value } : m))
                      setEditingNameId(null)
                      setEditingValueId(null)
                      setNewName('')
                      setNewValue('')
                      setExpandedId(null)
                    }}>
                      Save
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Add a new payment method for your businesses.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <FieldContent>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Yape, PayPal, Stripe..."
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Account / Number</FieldLabel>
              <FieldContent>
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Phone number, email, wallet..."
                />
              </FieldContent>
            </Field>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={handleAdd} disabled={!newName.trim() || !newValue.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) { setDeleteTarget(null); setDeleteConfirm('') } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Type <span className="font-medium text-foreground">{deleteTarget?.name}</span> to confirm
            </label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={deleteTarget?.name}
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== deleteTarget?.name}
              onClick={() => { if (deleteTarget) { handleDelete(deleteTarget.id); setDeleteTarget(null); setDeleteConfirm('') } }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
