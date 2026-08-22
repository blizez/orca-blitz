import { createContext, useContext, useEffect, useCallback, useState } from 'react'
import { play as cuelumePlay, setEnabled, setVolume as cuelumeSetVolume, bind } from 'cuelume'
import type { SoundName } from 'cuelume'

interface SoundContextValue {
  enabled: boolean
  volume: number
  toggleEnabled: () => void
  setVolume: (v: number) => void
  play: (name?: SoundName, opts?: { volume?: number }) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

const STORAGE_KEY = 'orca-sound-enabled'
const VOLUME_KEY = 'orca-sound-volume'

function readEnabled(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === null ? true : v === 'true'
  } catch { return true }
}

function readVolume(): number {
  try {
    const v = localStorage.getItem(VOLUME_KEY)
    return v === null ? 0.7 : Math.min(1, Math.max(0, Number(v)))
  } catch { return 0.7 }
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(readEnabled)
  const [volume, setVolumeState] = useState(readVolume)

  useEffect(() => { bind() }, [])

  useEffect(() => { setEnabled(enabled) }, [enabled])
  useEffect(() => { cuelumeSetVolume(volume) }, [volume])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(enabled)) } catch { /* ignore */ }
  }, [enabled])

  useEffect(() => {
    try { localStorage.setItem(VOLUME_KEY, String(volume)) } catch { /* ignore */ }
  }, [volume])

  const toggleEnabled = useCallback(() => setEnabledState((p) => !p), [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)))
  }, [])

  const play = useCallback(
    (name?: SoundName, opts?: { volume?: number }) => {
      if (!enabled) return
      cuelumePlay(name, opts)
    },
    [enabled]
  )

  return (
    <SoundContext.Provider value={{ enabled, volume, toggleEnabled, setVolume, play }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
