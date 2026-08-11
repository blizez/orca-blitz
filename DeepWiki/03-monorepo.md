# 03 — Monorepo

## Estructura

```
orca-blitz/
├── apps/desktop/                  ← IMPLEMENTADO
│   ├── src/main/index.ts          ← Main process
│   ├── src/preload/index.ts       ← Preload bridge
│   ├── src/renderer/              ← React UI
│   ├── electron.vite.config.ts    ← Build config
│   ├── electron-builder.config.ts ← Packaging
│   ├── tsconfig.node.json         ← TS para main/preload
│   └── tsconfig.web.json          ← TS para renderer
│
├── packages/ui/                   ← IMPLEMENTADO
│   └── src/
│       ├── components/ui/         ← 62 componentes shadcn
│       ├── globals.css            ← Tokens CSS (oklch)
│       ├── lib/utils.ts           ← cn() helper
│       └── hooks/                 ← useIsMobile
│
├── packages/core/                 ← VACIO
├── packages/features/             ← VACIO
├── packages/ai/                   ← VACIO
├── packages/plugins/              ← VACIO
├── packages/sdk/                  ← VACIO
├── packages/shared/               ← VACIO
├── packages/infrastructure/       ← VACIO
├── server/                        ← VACIO
├── relay/                         ← VACIO
├── plugins/                       ← VACIO
├── apps/web/                      ← VACIO
├── apps/mobile/                   ← VACIO
├── tests/                         ← VACIO
├── config/                        ← VACIO
└── scripts/                       ← VACIO
```

---

## Workspace Config

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "server"
  - "relay"
  - "plugins/*"
```

---

## Alias

```typescript
// apps/desktop/electron.vite.config.ts
resolve: {
  alias: {
    '@': resolve(__dirname, 'src/renderer'),
    '@orca-blitz/ui': resolve(__dirname, '../../packages/ui/src')
  }
}
```

| Alias | Resuelve a |
|-------|-----------|
| `@/` | `apps/desktop/src/renderer/` |
| `@orca-blitz/ui` | `packages/ui/src/` |

---

## Jerarquia de Packages

```
UI → Features → Core → Infrastructure
```

```typescript
// CORRECTO: features importa de ui
import { Button } from '@orca-blitz/ui/components/ui/button'

// INCORRECTO: core importa de ui
// import { Button } from '@orca-blitz/ui/components/ui/button'
```

---

## Dependencias

```json
// apps/desktop/package.json
{
  "dependencies": {
    "@orca-blitz/ui": "workspace:*"
  },
  "devDependencies": {
    "@base-ui/react": "^1.7.0",
    "@electron-toolkit/preload": "^3.0.0",
    "@electron-toolkit/utils": "^3.0.0",
    "@tailwindcss/vite": "^4.1.11",
    "@vitejs/plugin-react": "^4.3.4",
    "electron": "^35.0.0",
    "electron-builder": "^26.0.0",
    "electron-vite": "^3.1.0",
    "lucide-react": "^0.525.0",
    "tailwindcss": "^4.1.11"
  }
}
```
