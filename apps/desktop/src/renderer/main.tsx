import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './lib/theme-context'
import { SoundProvider } from './lib/sound-context'
import { TooltipProvider } from '@orca-blitz/ui/components/ui/tooltip'
import App from './App'
import '@orca-blitz/ui/globals.css'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <SoundProvider>
      <TooltipProvider delay={400}>
        <App />
      </TooltipProvider>
    </SoundProvider>
  </ThemeProvider>
)
