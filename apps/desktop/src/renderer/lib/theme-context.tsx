import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadAllThemes, applyThemeInline } from './theme-css-loader'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextProps {
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  colorTheme: string
  setTheme: (theme: ThemeMode) => void
  setColorTheme: (id: string) => void
}

const ThemeContext = createContext<ThemeContextProps | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('orca-theme') as ThemeMode) || 'system'
  })

  const [colorTheme, setColorThemeState] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('orca-color-theme') || ''
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'system') return getSystemTheme()
    return theme
  })

  useEffect(() => {
    loadAllThemes()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    const root = document.documentElement
    const allThemeClasses = Array.from(root.classList).filter((c) => c.startsWith('theme-'))
    allThemeClasses.forEach((c) => root.classList.remove(c))
    if (colorTheme) {
      root.classList.add(colorTheme)
    }
    applyThemeInline(colorTheme, resolvedTheme === 'dark')
  }, [colorTheme, resolvedTheme])

  useEffect(() => {
    if (theme === 'system') {
      setResolvedTheme(getSystemTheme())
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => setResolvedTheme(getSystemTheme())
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      setResolvedTheme(theme)
    }
  }, [theme])

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    localStorage.setItem('orca-theme', newTheme)
  }

  const setColorTheme = (id: string) => {
    setColorThemeState(id)
    localStorage.setItem('orca-color-theme', id)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, colorTheme, setTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
