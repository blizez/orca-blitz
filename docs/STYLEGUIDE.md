# Guía de Estilo Visual — orca-blitz

Este es el documento de **diseño UI/visual** de orca-blitz — tokens de color, tipografía, selección de componentes y reglas UX. **No** es un documento de arquitectura; para diseño de sistema ver código y comentarios inline. Los valores de tokens viven en `packages/ui/src/globals.css` (canonical); este archivo documenta los **roles y reglas** para usarlos.

## Contenido

1. [Qué es este documento](#qué-es-este-documento)
2. [Fuente de verdad](#fuente-de-verdad)
3. [Modos de tema](#modos-de-tema)
4. [Sistema de colores](#sistema-de-colores)
5. [Tipografía](#tipografía)
6. [Radius](#radius)
7. [Elevación y sombras](#elevación-y-sombras)
8. [Componentes](#componentes)
9. [Iconos](#iconos)
10. [Reglas UX](#reglas-ux)
11. [Filas de lista](#filas-de-lista)
12. [Tooltips](#tooltips)
13. [Formularios](#formularios)
14. [Cross-platform](#cross-platform)
15. [Animaciones](#animaciones)
16. [Accesibilidad](#accesibilidad)
17. [Scrollbars](#scrollbars)
18. [Cuando esta guía no responde](#cuando-esta-guía-no-responde)

---

## Qué es este documento

orca-blitz es una plataforma empresarial multi-plataforma (Desktop, Web, Mobile). La identidad visual es **moderna, limpia y escalable** — los colores de acento viven en tokens semánticos que pueden cambiar sin tocar componentes. El producto usa shadcn/ui como base, por lo que la UI propia debe receder y enmarcar el contenido del usuario.

Cuando tengas duda:

- Llega a **muted/accent/border** antes que a color.
- Llega a **CSS variables** antes que a hardcodear hex.
- Igualar el **shadcn primitive** más cercano antes de escribir CSS custom.

---

## Fuente de verdad

| Concern | Ubicación canónica |
|---------|-------------------|
| Color tokens | `packages/ui/src/globals.css` (`:root`, `.dark`) |
| Tailwind theme bindings | Mismo archivo, bloque `@theme inline { … }` |
| Componentes primitives | `packages/ui/src/components/ui/` (shadcn-style) |
| Tipografía / scrollbars / chrome | Mismo `globals.css` |

Nunca hardcodear un valor hex en código de componente si ya existe una variable que lo cubra. Si se necesita un token nuevo, agregarlo a `globals.css` (tanto `:root` como `.dark`), exponerlo en el bloque `@theme inline`, y usarlo.

---

## Modos de tema

La aplicación soporta cuatro modos:

| Modo | Comportamiento |
|------|---------------|
| **Light** | Paleta clara. Token `:root` activo. |
| **Dark** | Paleta oscura. Clase `.dark` en ancestro. |
| **System** | Detecta `prefers-color-scheme` del SO. Cambia automáticamente. |
| **Custom** | El usuario define su propia paleta. Extiende el modo light o dark. |

### Estrategia de dark mode

Se usa **class-based**:

```css
@custom-variant dark (&:is(.dark *));
```

Esto significa que agregar/quitar la clase `dark` en un elemento padre (ej: `<html class="dark">`) alterna el tema. No se usa `prefers-color-scheme` directamente en CSS — se gestiona desde JavaScript para permitir el modo System.

### Regla

El componente nunca debe asumir si está en light o dark. Siempre usar tokens semánticos:

```tsx
// Correcto
<div className="bg-background text-foreground">

// Incorrecto
<div className="bg-white text-black">
```

---

## Sistema de colores

### Arquitectura de tokens

Los tokens se dividen en **dos capas**:

| Capa | Qué controla | Cambia con la paleta |
|------|-------------|---------------------|
| **Superficie** | Fondos, bordes, texto base | **No** |
| **Acento** | Primary, accent, ring, charts | **Sí** |

### Tokens de superficie (NUNCA cambian)

Estos tokens definen la estructura visual y son consistentes sin importar la paleta activa:

| Token | Rol |
|-------|-----|
| `background` / `foreground` | Canvas de la app, texto default |
| `card` / `card-foreground` | Paneles elevados sobre el canvas |
| `popover` / `popover-foreground` | Menús flotantes, dropdowns |
| `muted` / `muted-foreground` | Texto deshabilitado, captions, placeholders |
| `destructive` / `destructive-foreground` | Eliminar, descartar, errores |
| `border` | Hairlines: divisores, outlines de input, bordes de card |
| `input` | Background de campos de formulario |
| `ring` | Focus-visible outlines, halos de selección activa |

### Tokens de acento (CAMBIAN con la paleta)

Estos tokens se adaptan según la paleta seleccionada:

| Token | Rol |
|-------|-----|
| `primary` / `primary-foreground` | Acción afirmativa principal (Guardar, Confirmar) |
| `secondary` / `secondary-foreground` | Acciones de menor énfasis junto a un primary |
| `accent` / `accent-foreground` | Hover/active backgrounds para ghost buttons y list rows |
| `chart-1` a `chart-5` | Gráficas |
| `sidebar` + variantes | Sidebar de trabajo y sus hijos |

### Pares de tokens

Siempre usar tokens en pares (surface + foreground). El foreground debe meeting contrast against el surface:

```tsx
// Correcto
<div className="bg-card text-card-foreground">

// Incorrecto
<div className="bg-card text-black">
```

### Color mixing

Cuando necesites un tint (ej: 12% primary wash en hover), usar `color-mix` contra el token existente, no un nuevo hex:

```css
background: color-mix(in srgb, var(--primary) 12%, var(--background));
```

Esto mantiene light/dark parity automático.

### Sidebar tokens

La sidebar expande tokens propios: `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`. Usarlos dentro de la worktree sidebar para que hover/selected/focus states sean consistentes y no se filtren a otros paneles.

---

## Tipografía

- **Familia:** `Geist` se carga como un solo variable woff2 (rango de peso 100–900). Siempre usar `Geist` para sans, nunca `Inter` o system sans.
- **Mono:** `var(--font-mono)` — usado para paths, UI adyacente a terminal, código, y donde monospace transmite "esto es literal."
- **Letter-spacing del body:** `0.01em` (set global en `body`). No sobreescribir por componente.
- **Tamaños:** Escala default de Tailwind. Tamaños comunes en este repo:
  - 11px (meta en uppercase, headers de sidebar, captions) — combinar con `font-weight: 600` y `text-transform: uppercase` y `letter-spacing: 0.05em` para labels de categoría.
  - 12px (sub-text, paths, contenido secundario)
  - 13px (items de sidebar, filas de lista densas)
  - 14px (body default, texto de botón en tamaño `default`)

---

## Radius

`--radius: 0.625rem` (10px) es la base; el resto se computan:

| Token | Cálculo | Uso típico |
|-------|---------|------------|
| `--radius-sm` | `radius × 0.6` | Badges pequeños |
| `--radius-md` | `radius × 0.8` | Buttons, inputs |
| `--radius-lg` | `radius × 1` | Cards |
| `--radius-xl` | `radius × 1.4` | Modals grandes |
| `--radius-2xl` | `radius × 1.8` | — |
| `--radius-3xl` | `radius × 2.2` | — |
| `--radius-4xl` | `radius × 2.6` | — |

Buttons y inputs usan `rounded-md`; el primitive `Card` usa `rounded-xl`; badges usan `rounded-full`. Igualar el radio del primitive existente en vez de introducir uno nuevo.

---

## Elevación y sombras

orca-blitz usa sombras con moderación. Tres niveles en la práctica:

1. **Inset hairline** — `border` + token `border`. El default. Casi todo está en este nivel.
2. **Subtle lift** — `shadow-xs` + border de un solo token. Outline buttons, cards embebidas.
3. **Floating** — `0 10px 24px rgba(0, 0, 0, 0.18)`. Popovers, popups que escapan del surface. Reservado.

No agregar un cuarto nivel. Si algo necesita más énfasis que "floating", probablemente necesitas el `ring` de focus en vez de una sombra.

---

## Componentes

Usar los primitives de shadcn en `packages/ui/src/components/ui/` antes de escribir algo custom. Los wrappers en esta carpeta siguen un patrón consistente:

- La mayoría tiene un atributo `data-slot="<name>"` en su raíz para CSS targeting — no strippearlo.
- Usar `cn()` para class merging. Pasar el `className` del usuario último para que los callers puedan sobreescribir.
- Usar `class-variance-authority` (CVA) para variantes cuando hay múltiples.

### Tabla de selección de primitive

| Necesitas... | Llega a... | No uses... |
|-------------|-----------|------------|
| Label hover en icon-only button | `Tooltip` | `HoverCard` (pesado), title attr |
| Preview hover de contenido rico | `HoverCard` | `Tooltip` (sin contenido rico) |
| Menu click-reveal con acciones | `DropdownMenu` | `Popover` con lista hecha a mano |
| Acciones contextuales click-derecho | `ContextMenu` | `DropdownMenu` (invocación diferente) |
| Click-reveal con contenido arbitrario | `Popover` | `Dialog` (traps focus y dimmea) |
| Modal que demanda decisión | `Dialog` | `Popover`, overlay inline |
| Panel deslizante desde borde | `Sheet` | `Dialog` centrado |
| Selección simple de lista conocida | `Select` | Custom listbox |
| Selección simple con search/fuzzy | `Command` dentro de `Popover` | `Select` (sin search) |
| Multi-select con search | Custom combobox | Roll a new one |
| Confirmación transitoria ("Guardado") | `sonner` toast | `Dialog`, banner inline |
| Status inline persistente ("3 errores") | Texto inline + `Badge` | toast (toasts desaparecen) |

### Buttons (`button.tsx`)

Variantes en orden de prioridad:

| Variante | Caso de uso |
|---------|------------|
| `default` | La acción afirmativa principal en un flow |
| `secondary` | Acción de menor énfasis junto a un `default` |
| `outline` | Toolbar / acciones standalone donde un botón filled se siente pesado |
| `ghost` | Icon buttons, triggers de list-row, donde el chrome debe desaparecer |
| `link` | Acciones inline en párrafos |
| `destructive` | Eliminar, descartar, irreversible. Nunca para Cancel |

Sizes: `default` (36px), `sm` (32px), `xs` (24px), `lg` (40px), más `icon`, `icon-xs`, `icon-sm`, `icon-lg`. Igualar el tamaño al row height circundante — no meter un botón `default` en un toolbar de 28px.

### Otros primitives en este repo

Explorar `packages/ui/src/components/ui/` para la lista completa. La mayoría envuelve un primitive de Radix/base-ui — excepciones son `command` (envuelve `cmdk`), `sonner` (envuelve `sonner`), y los wrappers visuales-only (`badge`, `button-group`, `card`, `input`) que aplican tokens y utilidades de Tailwind directamente. Nunca re-implementar comportamiento headless; extender el wrapper existente.

---

## Iconos

Los iconos vienen de **`lucide-react`**. No importar una segunda librería de iconos.

- **Tamaño default:** `size-4` (16px). `Button` auto-aplica esto a cualquier `<svg>` que contenga via `[&_svg:not([class*='size-'])]:size-4`, así que la mayoría de call sites no necesita setear un tamaño en el icono.
- **`size-3` / `size-3.5`:** para metadata, captions, y filas de lista densas donde 16px es demasiado.
- **`size-7`+:** solo para hero icons de empty-state.
- **Stroke width:** default de lucide de 2px. No sobreescribir por icono.
- **Color:** heredar del texto circundante — `text-muted-foreground` para secundario, `text-destructive` para destructivo, etc. No aplicar un token al SVG directamente cuando el padre ya lleva el color correcto.
- **Spinner:** El icono de loading canónico es `<Loader2 className="size-4 animate-spin" />`. Para trabajo multi-step de 3s+, preferir un label que nombre la etapa ("Clonando…" → "Instalando…") sobre un spinner sin label.

---

## Reglas UX

Estas son las reglas que un contributor más probablemente va a malinterpretar si trabaja en aislamiento. Aplican a cada cambio de UI.

### 1. Feedback según duración percibida

La pregunta no es *"¿debe cambiar este control mientras trabaja?"* — es *"¿cuánto dura la acción, y qué necesita saber el usuario durante ese tiempo?"*

| Duración | Feedback |
|----------|----------|
| 0–100 ms | Ninguno. Algo visible se lee como un glitch. |
| 100 ms–1 s | Solo estado disabled. |
| 1 s–3 s | Disabled + spinner o swap de label. |
| 3 s+ o multi-step | Labels de etapa, progress, reassurance opcional. |

Dos correlatos:

- **Reservar espacio de antemano.** Si un control puede cambiar a un label más largo o crecer un icono, fijar su footprint de entrada (usar `width`, no `min-width`). Un control que cambia de tamaño mid-action se ve roto incluso cuando la acción fue exitosa.
- **No elegir el peor caso para todos.** Si la acción es rápida localmente y lenta remotamente (SSH), diferir el estado de loading visible por ~200ms. Los usuarios locales no ven nada; los remotos reciben feedback apropiado. Vincular el estado *disabled* inmediatamente (para que doble-click no doble-submit) y el estado *visible* con un timer.

### 2. Buscar componentes hermanos antes de diseñar en aislamiento

Si tu componente tiene un hermano — mismo dominio, comportamiento solapado, frecuentemente visible en momentos adyacentes en el mismo flow — los dos deben leerse como un mismo diseño. Mismos iconos, mismas convenciones de shortcut, mismas semánticas de submit. Un usuario moviéndose entre ellos no debe percibir una costura.

Esto **no** es "igualar cada patrón existente". Algunos patrones del repo son deuda y copiarlos propaga la deuda. La afirmación más estrecha es sobre componentes *adyacentes*. Diverger de un hermano necesita una razón: o el hermano está mal (arreglar ambos) o el nuevo componente tiene una diferencia real en rol (comprometerse con eso).

Cuando no hay hermano, igualar el chrome circundante — tamaños de botón, peso de iconos, tono del copy — y no fabricar un hermano de una pantalla que el usuario nunca correlacionará con esta.

### 3. No sobrecargar el path de back-out

`destructive` es para acciones que pierden datos o no se pueden deshacer. **Cancel, Dismiss, Close y Discard no son destructivos** — sacan al usuario de una acción en progreso y deben mantenerse silenciosos (ghost button default, sin color, sin chip de teclado, sin affordance animado). Guardar el peso visual para la acción afirmativa para que las dos no compitan. Los keyboard handlers pueden honrar Esc; lo que se mantiene minimal es la decoración visible.

### 4. Diseño moderno 2026

- **Glassmorphism sutil:** Usar `backdrop-blur` + `bg-background/80` para overlays, no sombras pesadas.
- **Espaciado generoso:** No amontonar controles. Respiración entre elementos.
- **Jerarquía clara:** Un primary action obvio por flow. Secondary y raras acciones no deben competir con el primary.
- **Empty states accionables:** Cuando faltan datos, mostrar una acción directa para adquirir o configurar esos datos.
- **Loading states progresivos:** Spinner → skeleton → contenido. No saltar directamente a skeleton.
- **Focus visible:** Siempre `ring` en focus-visible. Nunca quitar outlines.
- **Copy conciso:** Texto displayed debe ser libre de typos, conciso y específico. Preferir verbos directos y sustantivos concretos. Remover relleno como "por favor", "simplemente", "solo", "puedes".

---

## Filas de lista

Un punto común de drift. Usar estas convenciones para cualquier fila de estilo lista (worktrees, items de command palette, nav de settings):

- **Idle:** background transparente.
- **Hover:** `bg-accent` (en la sidebar, `bg-sidebar-accent`).
- **Keyboard-selected (highlight de cmdk):** `data-[selected=true]:bg-accent` más un `border-border` outline para que la fila activa sea visible mientras el usuario escribe. El atributo `data-selected` lo setea `cmdk` automáticamente.
- **Persistent "current" / "active"** (ej: la worktree que el usuario está viendo): también `bg-accent`, *más* un atributo `data-current="true"` para que CSS o styling futuro pueda distinguirlo del highlight de cmdk.
- **No hardcodear:** `bg-[#ededed]` / `bg-[#333333]` o inventar un color "selected". El token accent ya se adapta a light/dark y hace match con el resto de la app.

---

## Tooltips

Los tooltips existen para *nombrar* un control cuyo significado no es obvio por su apariencia. No son el lugar para enseñar, persuadir o advertir — cualquier cosa que los usuarios necesiten leer mientras actúan va en la UI visible.

- **Usar un tooltip cuando:** un icon-only button o chip compacto necesita un label. Toolbar icons, badges con abreviaturas, paths truncados.
- **No usar un tooltip cuando:** el control ya tiene un label visible, el contenido es interactivo (links, buttons), o el mensaje es crítico (errores, warnings bloqueantes — esos van inline).
- **Mounting:** El `<TooltipProvider delayDuration={400}>` global vive en el App root. No anidar un segundo `TooltipProvider` a menos que necesites un delay diferente para una superficie de alcance estrecho.
- **Trigger pattern:** envolver el trigger con `<TooltipTrigger asChild>` para que los props de a11y del tooltip se attachen al botón (no a un wrapper span). Esto es requerido para que el focus del keyboard saque el tooltip.
- **Placement:** default `side="top" sideOffset={4}` — igualar el patrón de toolbar en `sidebar/SidebarToolbar.tsx`. Elegir un lado diferente solo cuando el default se recorte contra el viewport.

---

## Formularios

El patrón en `packages/ui/src/components/ui/` es el house style para cualquier label + control + helper text. Igualarlo para formularios nuevos:

- **Outer stack:** `space-y-3` para forms de sección completa; `space-y-2` para campos de control compacto. Elegir por densidad, no por preferencia.
- **Label group:** `space-y-1` con `<Label>` y una descripción en `text-xs text-muted-foreground`.
- **Control:** El primitive de shadcn (`<Input>`, `<Select>`, etc.). Los errores surfacen via `aria-invalid`; el input primitive ya mapea eso a un destructive ring — no pintar el tuyo propio.
- **Trailing metadata:** `text-[11px] text-muted-foreground` debajo del control (ej: "Actual: 14px · Default: 13px"), no al lado del label.

---

## Cross-platform

orca-blitz corre en macOS, Linux, Windows, Web y Mobile. Cada cambio de UI debe funcionar en todas las plataformas, en ambos modos light y dark.

- **Modifier keys:** Nunca hardcodear `e.metaKey`. Usar `navigator.userAgent.includes('Mac')` para elegir `metaKey` en Mac y `ctrlKey` en Linux/Windows.
- **Shortcut labels:** Mostrar `⌘` / `⇧` en Mac; mostrar `Ctrl+` / `Shift+` en otras plataformas. El label debe reflejar el binding real para esa plataforma.
- **Window chrome:** macOS muestra traffic lights; el titlebar reserva un gutter de 80px (`titlebar-traffic-light-pad`) para que no se superpongan con contenido. No poner targets de hit en esa banda en Mac.
- **SSH:** Muchos usuarios corren orca-blitz en una máquina remota. Loading states, focus management, y animations deben aguantar 50–200 ms de latencia extra. Testear bajo latencia simulada (o SSH real) — la verificación local-only no es suficiente.

---

## Animaciones

Usar animación sutil para suavizar contenido que expande/collapse y prevenir cambios de layout bruscos. La animación debe clarificar continuidad, no decorar.

| Tipo | Duración | Easing |
|------|----------|--------|
| Fade in/out | 150ms | ease-out |
| Expand/collapse | 200ms | ease-in-out |
| Page transitions | 200-300ms | ease-in-out |

- **Respetar** `prefers-reduced-motion`. Si el usuario tiene reducido el movimiento, desactivar animaciones no esenciales.
- **No decorar.** La animación solo para clarificar continuidad entre estados.

---

## Accesibilidad

Toda la UI debe soportar:

- **Keyboard navigation:** Toda acción accesible via teclado. Focus management correcto en dialogs, popovers, command surfaces.
- **Screen readers:** Labels en controles, `aria-hidden` en decorativos, estructura semántica.
- **Contraste:** WCAG AA mínimo. Tokens de foreground/surface ya garantizan contraste cuando se usan en pares.
- **Focus visible:** Siempre visible. Nunca quitar outlines sin proveer alternativa.
- **Tamaños ajustables:** No fijar tamaños que impidan zoom del usuario.

---

## Scrollbars

Tres clases de scrollbar están definidas globalmente en `globals.css`:

- **`.scrollbar-sleek`** — default thin, neutral para sidebars, lists, popovers. Emparejar con `.scrollbar-sleek-parent` en un ancestro hover-target si quieres que el thumb solo sea visible al hacer hover del padre.
- **`.scrollbar-editor`** — ligeramente más pesada, usada dentro de superficies adyacentes a Monaco.

Aplicar una de estas a containers de overflow; no escribir un cuarto estilo.

---

## Cuando esta guía no responde

Si tienes una pregunta de UI que este doc no responde:

1. Mirar código hermano en `packages/ui/src/components/ui/` para el sibling más cercano, y seguir su lead.
2. Buscar un primitive existente en `packages/ui/src/components/ui/` que ya codifique el patrón.
3. Si es una pregunta de tokens, `globals.css` es canonical — usar lo que hay, o agregar uno nuevo en ambos light y dark.
4. Si ninguno de esos resuelve, preguntar antes de inventar.
