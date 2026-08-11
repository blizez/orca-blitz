import { useState } from 'react'
import { Switch } from '@orca-blitz/ui/components/ui/switch'

export function NotificationsSettings() {
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  const [sound, setSound] = useState(true)
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
            <Switch checked={desktopNotifications} onCheckedChange={setDesktopNotifications} />
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sound</p>
              <p className="text-xs text-muted-foreground">Play sound for notifications</p>
            </div>
            <Switch checked={sound} onCheckedChange={setSound} />
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Digest</p>
              <p className="text-xs text-muted-foreground">Receive daily email summary</p>
            </div>
            <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
          </div>
        </div>
      </div>
    </div>
  )
}
