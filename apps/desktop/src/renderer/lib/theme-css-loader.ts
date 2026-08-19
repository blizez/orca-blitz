const themeStyleId = 'orca-color-themes'

const CSS_VARS = [
  '--background', '--foreground', '--card', '--card-foreground',
  '--popover', '--popover-foreground', '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
  '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
  '--border', '--input', '--ring',
  '--sidebar', '--sidebar-foreground', '--sidebar-primary', '--sidebar-primary-foreground',
  '--sidebar-accent', '--sidebar-accent-foreground', '--sidebar-border', '--sidebar-ring',
  '--font-sans', '--font-serif', '--font-mono', '--radius',
]

const THEME_FILES: Record<string, () => Promise<{ default: string }>> = {
  'theme-zen-inspired': () => import('@orca-blitz/ui/themes/zeninspiredtheme.css?raw'),
  'theme-qrafthive': () => import('@orca-blitz/ui/themes/qrafthive.css?raw'),
  'theme-deep-purple': () => import('@orca-blitz/ui/themes/deeppurple.css?raw'),
  'theme-teal-hue': () => import('@orca-blitz/ui/themes/tealhue.css?raw'),
  'theme-jamaica': () => import('@orca-blitz/ui/themes/jamaica.css?raw'),
  'theme-witch-rave': () => import('@orca-blitz/ui/themes/witchrave.css?raw'),
  'theme-terminal-muted': () => import('@orca-blitz/ui/themes/terminalmuted.css?raw'),
  'theme-my-theme': () => import('@orca-blitz/ui/themes/mytheme.css?raw'),
  'theme-examdedo': () => import('@orca-blitz/ui/themes/examdedo.css?raw'),
}

let allCssLoaded = false

export async function loadAllThemes() {
  if (allCssLoaded) return

  const chunks = await Promise.all(
    Object.values(THEME_FILES).map((loader) => loader())
  )

  const css = chunks.map((c) => c.default).join('\n')

  let style = document.getElementById(themeStyleId)
  if (!style) {
    style = document.createElement('style')
    style.id = themeStyleId
    document.head.appendChild(style)
  }
  style.textContent = css
  allCssLoaded = true
}

export function clearThemeVars() {
  const root = document.documentElement
  for (const key of CSS_VARS) {
    root.style.removeProperty(key)
  }
}

export function applyThemeInline(themeClassName: string, isDark: boolean) {
  const root = document.documentElement
  clearThemeVars()

  if (!themeClassName) return

  for (const styleSheet of document.styleSheets) {
    try {
      for (const rule of styleSheet.cssRules) {
        if (!(rule instanceof CSSStyleRule)) continue
        const selector = rule.selectorText
        if (!selector) continue

        const darkSelector = `:root.${themeClassName}.dark`
        const lightSelector = `:root.${themeClassName}`

        if (isDark && selector === darkSelector) {
          for (const key of CSS_VARS) {
            const value = rule.style.getPropertyValue(key)
            if (value) root.style.setProperty(key, value)
          }
          return
        }

        if (!isDark && selector === lightSelector) {
          for (const key of CSS_VARS) {
            const value = rule.style.getPropertyValue(key)
            if (value) root.style.setProperty(key, value)
          }
          return
        }
      }
    } catch {
      continue
    }
  }
}
