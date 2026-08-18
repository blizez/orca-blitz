import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './lib/theme-context'
import { SoundProvider } from './lib/sound-context'
import { TooltipProvider } from '@orca-blitz/ui/components/ui/tooltip'
import { Toaster } from '@orca-blitz/ui/components/ui/toast'
import '@orca-blitz/i18n'
import App from './App'
import '@orca-blitz/ui/globals.css'

if (!window.api) {
  await import('./web-mock')
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <SoundProvider>
      <TooltipProvider delay={400}>
        <App />
        <Toaster />
      </TooltipProvider>
    </SoundProvider>
  </ThemeProvider>
)
