"use strict";
const electron = require("electron");
const electronAPI = {
  ipcRenderer: {
    send(channel, ...args) {
      electron.ipcRenderer.send(channel, ...args);
    },
    sendTo(webContentsId, channel, ...args) {
      const electronVer = process.versions.electron;
      const electronMajorVer = electronVer ? parseInt(electronVer.split(".")[0]) : 0;
      if (electronMajorVer >= 28) {
        throw new Error('"sendTo" method has been removed since Electron 28.');
      } else {
        electron.ipcRenderer.sendTo(webContentsId, channel, ...args);
      }
    },
    sendSync(channel, ...args) {
      return electron.ipcRenderer.sendSync(channel, ...args);
    },
    sendToHost(channel, ...args) {
      electron.ipcRenderer.sendToHost(channel, ...args);
    },
    postMessage(channel, message, transfer) {
      electron.ipcRenderer.postMessage(channel, message, transfer);
    },
    invoke(channel, ...args) {
      return electron.ipcRenderer.invoke(channel, ...args);
    },
    on(channel, listener) {
      electron.ipcRenderer.on(channel, listener);
      return () => {
        electron.ipcRenderer.removeListener(channel, listener);
      };
    },
    once(channel, listener) {
      electron.ipcRenderer.once(channel, listener);
      return () => {
        electron.ipcRenderer.removeListener(channel, listener);
      };
    },
    removeListener(channel, listener) {
      electron.ipcRenderer.removeListener(channel, listener);
      return this;
    },
    removeAllListeners(channel) {
      electron.ipcRenderer.removeAllListeners(channel);
    }
  },
  webFrame: {
    insertCSS(css) {
      return electron.webFrame.insertCSS(css);
    },
    setZoomFactor(factor) {
      if (typeof factor === "number" && factor > 0) {
        electron.webFrame.setZoomFactor(factor);
      }
    },
    setZoomLevel(level) {
      if (typeof level === "number") {
        electron.webFrame.setZoomLevel(level);
      }
    }
  },
  webUtils: {
    getPathForFile(file) {
      return electron.webUtils.getPathForFile(file);
    }
  },
  process: {
    get platform() {
      return process.platform;
    },
    get versions() {
      return process.versions;
    },
    get env() {
      return { ...process.env };
    }
  }
};
const api = {
  window: {
    minimize: () => electron.ipcRenderer.send("window:minimize"),
    maximize: () => electron.ipcRenderer.send("window:maximize"),
    close: () => electron.ipcRenderer.send("window:close"),
    isMaximized: () => electron.ipcRenderer.invoke("window:isMaximized"),
    onMaximized: (callback) => {
      const handler = (_event, maximized) => callback(maximized);
      electron.ipcRenderer.on("window:maximized", handler);
      return () => {
        electron.ipcRenderer.removeListener("window:maximized", handler);
      };
    }
  },
  customers: {
    create: (data) => electron.ipcRenderer.invoke("customers:create", data),
    list: () => electron.ipcRenderer.invoke("customers:list"),
    get: (id) => electron.ipcRenderer.invoke("customers:get", id),
    update: (id, data) => electron.ipcRenderer.invoke("customers:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("customers:delete", id),
    onChanged: (callback) => {
      electron.ipcRenderer.on("customers:changed", (_event, ...args) => callback(...args));
      return () => {
        electron.ipcRenderer.removeAllListeners("customers:changed");
      };
    }
  },
  workflows: {
    create: (data) => electron.ipcRenderer.invoke("workflows:create", data),
    list: () => electron.ipcRenderer.invoke("workflows:list"),
    execute: (id) => electron.ipcRenderer.invoke("workflows:execute", id),
    onChanged: (callback) => {
      electron.ipcRenderer.on("workflows:changed", (_event, ...args) => callback(...args));
      return () => {
        electron.ipcRenderer.removeAllListeners("workflows:changed");
      };
    }
  },
  integrations: {
    sendMessage: (channel, data) => electron.ipcRenderer.invoke("integrations:sendMessage", channel, data),
    onMessage: (callback) => {
      electron.ipcRenderer.on("integrations:message", (_event, ...args) => callback(...args));
      return () => {
        electron.ipcRenderer.removeAllListeners("integrations:message");
      };
    }
  },
  reports: {
    generate: (config) => electron.ipcRenderer.invoke("reports:generate", config),
    export: (format) => electron.ipcRenderer.invoke("reports:export", format)
  },
  settings: {
    get: () => electron.ipcRenderer.invoke("settings:get"),
    update: (prefs) => electron.ipcRenderer.invoke("settings:update", prefs)
  },
  plugins: {
    install: (manifest) => electron.ipcRenderer.invoke("plugins:install", manifest),
    enable: (id) => electron.ipcRenderer.invoke("plugins:enable", id),
    disable: (id) => electron.ipcRenderer.invoke("plugins:disable", id),
    list: () => electron.ipcRenderer.invoke("plugins:list")
  },
  browser: {
    create: (id, url, partition, platformId) => electron.ipcRenderer.invoke("browser:create", id, url, partition, platformId),
    show: (id, bounds) => electron.ipcRenderer.send("browser:show", id, bounds),
    hide: (id) => electron.ipcRenderer.send("browser:hide", id),
    position: (id, bounds) => electron.ipcRenderer.send("browser:position", id, bounds),
    destroy: (id) => electron.ipcRenderer.send("browser:destroy", id),
    css: (id, css) => electron.ipcRenderer.send("browser:css", id, css),
    onDidLoad: (callback) => {
      const handler = (_event, id) => callback(id);
      electron.ipcRenderer.on("browser:did-load", handler);
      return () => {
        electron.ipcRenderer.removeListener("browser:did-load", handler);
      };
    },
    onDidFail: (callback) => {
      const handler = (_event, id, code, desc) => callback(id, code, desc);
      electron.ipcRenderer.on("browser:did-fail", handler);
      return () => {
        electron.ipcRenderer.removeListener("browser:did-fail", handler);
      };
    },
    goBack: (id) => electron.ipcRenderer.send("browser:goBack", id),
    goForward: (id) => electron.ipcRenderer.send("browser:goForward", id),
    reload: (id) => electron.ipcRenderer.send("browser:reload", id),
    canGoBack: (id) => electron.ipcRenderer.invoke("browser:canGoBack", id),
    canGoForward: (id) => electron.ipcRenderer.invoke("browser:canGoForward", id)
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
