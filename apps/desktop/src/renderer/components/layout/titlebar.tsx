import { type ReactNode } from 'react'

interface TitlebarProps {
  center?: ReactNode
}

export function Titlebar({ center }: TitlebarProps) {
  return (
    <div
      className="flex h-8 shrink-0 select-none items-center border-b border-border bg-background"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex flex-1 min-w-0 items-center">
        {center}
      </div>
    </div>
  )
}
