/// <reference types="vite/client" />

interface Window {
  electron: typeof import("@electron-toolkit/preload").electronAPI;
  api: import("../preload/api-types").ApiContract;
}
