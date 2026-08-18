// electron.vite.config.ts
import { resolve } from "path";
import { readFileSync } from "fs";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
var __electron_vite_injected_dirname = "C:\\Users\\Lux\\orca\\orca-blitz\\apps\\desktop";
var uiSrc = resolve(__electron_vite_injected_dirname, "../../packages/ui/src");
var rendererSrc = resolve(__electron_vite_injected_dirname, "src/renderer");
function pathAliasPlugin() {
  return {
    name: "path-alias",
    enforce: "pre",
    resolveId(source, importer) {
      if (!source.startsWith("@/")) return null;
      if (!importer) return null;
      const subpath = source.slice(2);
      const importerNorm = importer.replace(/\\/g, "/");
      const uiSrcNorm = uiSrc.replace(/\\/g, "/");
      const isUiFile = importerNorm.startsWith(uiSrcNorm);
      const base = isUiFile ? uiSrc : rendererSrc;
      return resolve(base, subpath);
    },
    load(id) {
      const idNorm = id.replace(/\\/g, "/");
      const uiSrcNorm = uiSrc.replace(/\\/g, "/");
      if (!idNorm.startsWith(uiSrcNorm)) return null;
      if (!id.endsWith(".tsx") && !id.endsWith(".ts")) return null;
      try {
        let code = readFileSync(id, "utf-8");
        const regex = /from\s+["']@\/(.*?)["']/g;
        let match;
        const imports = [];
        while ((match = regex.exec(code)) !== null) {
          const full = match[0];
          const subpath = match[1];
          imports.push({
            from: full,
            to: `from "${resolve(uiSrc, subpath).replace(/\\/g, "/")}"`
          });
        }
        if (imports.length === 0) return null;
        for (const imp of imports) {
          code = code.replace(imp.from, imp.to);
        }
        return { code, map: null };
      } catch {
        return null;
      }
    }
  };
}
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/main/index.ts")
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/preload/index.ts")
        }
      }
    }
  },
  renderer: {
    root: resolve(__electron_vite_injected_dirname, "src/renderer"),
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/renderer/index.html")
        }
      }
    },
    plugins: [react(), tailwindcss(), pathAliasPlugin()],
    resolve: {
      alias: {
        "@": rendererSrc,
        "@orca-blitz/ui": uiSrc
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
