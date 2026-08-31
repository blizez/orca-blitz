// Fuente canónica: packages/ui/src/globals.css (:root/.dark oklch, --radius 0.625rem)
// Mapea tokens CSS -> paleta ANSI Theme de @oh-my-pi/pi-tui (Markdown, Editor, SelectList)
// No modificar globals.css — este archivo es el puente TUI<->UI per plan Fase 2 step 11.

export interface TuiSymbolTheme {
  // minimal subset used by Editor/Markdown
  borderVertical?: string;
  borderHorizontal?: string;
  spinnerFrames?: string[];
}

export interface TuiSelectListTheme {
  selectedPrefix?: string;
  unselectedPrefix?: string;
}

export interface EditorTheme {
  borderColor: (str: string) => string;
  accentColor?: (str: string) => string;
  surfaceColor?: (str: string) => string;
  selectList: TuiSelectListTheme;
  symbols: TuiSymbolTheme;
  hintStyle?: (text: string) => string;
}

// Lector helper para renderer: extrae tokens computados del DOM
export function readCssTokensFromDocument(): Record<string, string> {
  if (typeof window === "undefined" || typeof getComputedStyle === "undefined") return {};
  const style = getComputedStyle(document.documentElement);
  const keys = [
    "--background",
    "--foreground",
    "--card",
    "--primary",
    "--secondary",
    "--muted",
    "--muted-foreground",
    "--accent",
    "--border",
    "--ring",
    "--radius",
  ];
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = style.getPropertyValue(k).trim();
  return out;
}

// Conversor puro — sin dependencia de pi-tui ni chalk para no contaminar bundle Electron (RPC evita NAPI)
// Si TUI corre embebida en Electron (xterm.js), este tema se pasa a new Editor(theme) / new Markdown(theme)
export function cssTokensToTuiTheme(tokens: Record<string, string>): EditorTheme {
  void tokens;
  return {
    borderColor: (str: string) => str,
    accentColor: (str: string) => str,
    surfaceColor: (str: string) => str,
    selectList: {
      selectedPrefix: "› ",
      unselectedPrefix: "  ",
    },
    symbols: {
      borderVertical: "│",
      borderHorizontal: "─",
    },
    hintStyle: (text: string) => text,
  };
}
