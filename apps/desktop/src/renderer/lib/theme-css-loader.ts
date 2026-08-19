const themeStyleId = 'orca-color-themes'

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

let loaded = false

export async function loadAllThemes() {
  if (loaded) return

  const chunks = await Promise.all(
    Object.values(THEME_FILES).map((loader) => loader())
  )

  const css = chunks.map((c) => c.default).join('\n')

  const existing = document.getElementById(themeStyleId)
  if (existing) existing.remove()

  const style = document.createElement('style')
  style.id = themeStyleId
  style.textContent = css
  document.head.appendChild(style)

  loaded = true
}
