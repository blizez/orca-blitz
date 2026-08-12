import { useState } from 'react'
import { Switch } from '@orca-blitz/ui/components/ui/switch'
import { Slider } from '@orca-blitz/ui/components/ui/slider'
import { useSound } from '../../../lib/sound-context'

export function NotificationsSettings() {
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  const { enabled: soundEnabled, volume, toggleEnabled, setVolume, play } = useSound()
  const [emailDigest, setEmailDigest] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">Control how and when you receive notifications.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Desktop Notifications</p>
              <p className="text-xs text-muted-foreground">Show system notifications</p>
            </div>
            <Switch checked={desktopNotifications} onCheckedChange={(v) => { setDesktopNotifications(v); play('toggle') }} />
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sound</p>
              <p className="text-xs text-muted-foreground">Enable or disable interaction sounds</p>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={(v) => { toggleEnabled(); if (v) play('toggle') }} />
          </div>
          {soundEnabled && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Volume</p>
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
              <p className="text-sm font-medium">Email Digest</p>
              <p className="text-xs text-muted-foreground">Receive daily email summary</p>
            </div>
            <Switch checked={emailDigest} onCheckedChange={(v) => { setEmailDigest(v); play('toggle') }} />
          </div>
        </div>
      </div>
    </div>
  )
}
