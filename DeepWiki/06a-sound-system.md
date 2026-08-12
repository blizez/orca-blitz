# 06a — Sound System Architecture

## Dependencia

`cuelume ^0.2.2` — libreria de sonidos UI minimalista.

---

## Ubicacion

```
apps/desktop/src/renderer/
├── main.tsx                          ← SoundProvider en wrap tree
└── lib/sound-context.tsx             ← Provider + hook (74 lineas)
```

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     main.tsx                             │
│                                                         │
│  <ThemeProvider>                                        │
│    <SoundProvider>          ← Inicializa cuelume        │
│      <TooltipProvider>                                  │
│        <App />                                          │
│      </TooltipProvider>                                 │
│    </SoundProvider>                                     │
│  </ThemeProvider>                                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                sound-context.tsx                          │
│                                                         │
│  SoundProvider                                          │
│  ├── bind() ← una vez en mount                          │
│  ├── enabled ← localStorage('orca-sound-enabled')       │
│  ├── volume  ← localStorage('orca-sound-volume')        │
│  ├── sync setEnabled() / setVolume() con cuelume        │
│  └── context value: { enabled, volume, play, ... }      │
│                                                         │
│  useSound()                                             │
│  └── throw si no hay SoundProvider                      │
└─────────────────────────────────────────────────────────┘
```

---

## Interfaz

```typescript
// apps/desktop/src/renderer/lib/sound-context.tsx
interface SoundContextValue {
  enabled: boolean
  volume: number
  toggleEnabled: () => void
  setVolume: (v: number) => void
  play: (name?: SoundName, opts?: { volume?: number }) => void
}
```

### SoundName (de cuelume)

14 sonidos disponibles:

| Sound | Uso en orca-blitz |
|-------|-------------------|
| `chime` | — |
| `sparkle` | — |
| `droplet` | Modal close |
| `bloom` | — |
| `whisper` | — |
| `tick` | — |
| `press` | — |
| `release` | — |
| `toggle` | Switch toggle |
| `success` | Creation, submit |
| `error` | Deletion |
| `page` | Navigation |
| `loading` | — |
| `ready` | — |
| `pulse` | — |
| `scan` | — |
| `arrival` | — |

### Asignacion de sonidos por accion

| Accion | Sound | Ejemplo |
|--------|-------|---------|
| Crear negocio | `play('success')` | AddBusinessModal submit |
| Eliminar negocio | `play('error')` | DeleteBusinessModal confirm |
| Cerrar modal | `play('droplet')` | AddBusinessModal close |
| Toggle switch | `play('toggle')` | Notifications settings |
| Navegar pagina | `play('page')` | Sidebar navigation |

---

## Persistencia

```typescript
const STORAGE_KEY = 'orca-sound-enabled'   // 'true' | 'false'
const VOLUME_KEY = 'orca-sound-volume'     // '0.7' (0..1)
```

- Default: `enabled=true`, `volume=0.7`
- `readEnabled()` y `readVolume()` leen de localStorage en init
- Cada cambio de estado sincroniza a localStorage via `useEffect`
- `try/catch` en cada operacion de localStorage (no crashea si esta lleno)

---

## Lifecycle

```typescript
// bind() se llama una vez en mount
useEffect(() => { bind() }, [])

// Sync con cuelume en cada cambio
useEffect(() => { setEnabled(enabled) }, [enabled])
useEffect(() => { cuelumeSetVolume(volume) }, [volume])

// Persistir a localStorage
useEffect(() => {
  try { localStorage.setItem(STORAGE_KEY, String(enabled)) } catch (_e) { }
}, [enabled])
```

---

## Hook: useSound

```typescript
import { useSound } from '../../lib/sound-context'

function MyComponent() {
  const { play, enabled, volume, toggleEnabled, setVolume } = useSound()

  // Reproducir sonido
  play('success')

  // Sonido con volumen override
  play('error', { volume: 0.3 })

  // Sonido default (sin nombre)
  play()

  // Toggle
  toggleEnabled()

  // Volume (0..1)
  setVolume(0.5)
}
```

---

## Errores

```typescript
export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
```

Si `useSound` se usa fuera del provider, lanza error explicito.

---

## Componentes que usan useSound

| Componente | Sonido | Contexto |
|------------|--------|----------|
| `AddBusinessModal` | `success` | Al crear negocio |
| `AddBusinessModal` | `droplet` | Al cerrar modal |
| `DeleteBusinessModal` | `error` | Al confirmar eliminacion |
| Notifications settings | `toggle` | Al cambiar switches |
| Business sidebar | `page` | Al navegar entre paginas |
