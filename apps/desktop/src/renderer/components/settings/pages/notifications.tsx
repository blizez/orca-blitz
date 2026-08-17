import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Switch } from '@orca-blitz/ui/components/ui/switch'
import { Slider } from '@orca-blitz/ui/components/ui/slider'
import { useSound } from '@/lib/sound-context'

export function NotificationsSettings() {
  const { t } = useTranslation('settings')
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  const { enabled: soundEnabled, volume, toggleEnabled, setVolume, play } = useSound()
  const [emailDigest, setEmailDigest] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('notifications.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('notifications.description')}</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('notifications.desktop.label')}</p>
              <p className="text-xs text-muted-foreground">{t('notifications.desktop.description')}</p>
            </div>
            <Switch checked={desktopNotifications} onCheckedChange={(v) => { setDesktopNotifications(v); play('toggle') }} />
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('notifications.sound.label')}</p>
              <p className="text-xs text-muted-foreground">{t('notifications.sound.description')}</p>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={(v) => { toggleEnabled(); if (v) play('toggle') }} />
          </div>
          {soundEnabled && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t('notifications.volume')}</p>
                <p className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</p>
              </div>
              <Slider
                value={[volume * 100]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v
                  setVolume(val / 100)
                }}
                min={0}
                max={100}
                step={1}
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('notifications.emailDigest.label')}</p>
              <p className="text-xs text-muted-foreground">{t('notifications.emailDigest.description')}</p>
            </div>
            <Switch checked={emailDigest} onCheckedChange={(v) => { setEmailDigest(v); play('toggle') }} />
          </div>
        </div>
      </div>
    </div>
  )
}
