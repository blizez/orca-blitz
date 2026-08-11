import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

const uiSrc = resolve(__dirname, '../../packages/ui/src')
const rendererSrc = resolve(__dirname, 'src/renderer')

function pathAliasPlugin(): Plugin {
  return {
    name: 'path-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.startsWith('@/')) return null
      if (!importer) return null
      const subpath = source.slice(2)
      const importerNorm = importer.replace(/\\/g, '/')
      const uiSrcNorm = uiSrc.replace(/\\/g, '/')
      const isUiFile = importerNorm.startsWith(uiSrcNorm)
      const base = isUiFile ? uiSrc : rendererSrc
      return resolve(base, subpath)
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    plugins: [react(), tailwindcss(), pathAliasPlugin()],
    resolve: {
      alias: {
        '@orca-blitz/ui': uiSrc
      }
    }
  }
})
