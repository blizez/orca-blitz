"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const is = {
  dev: !electron.app.isPackaged
};
const platform = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform.isWindows)
      electron.app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return electron.app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      electron.app.setLoginItemSettings({
        openAtLogin: auto,
        path: process.execPath
      });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return electron.session.defaultSession.setProxy({ mode: "direct" });
  }
};
const optimizer = {
  watchWindowShortcuts(window, shortcutOptions) {
    if (!window)
      return;
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
    webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        if (!is.dev) {
          if (input.code === "KeyR" && (input.control || input.meta))
            event.preventDefault();
        } else {
          if (input.code === "F12") {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: "undocked" });
              console.log("Open dev tool...");
            }
          }
        }
        if (escToCloseWindow) {
          if (input.code === "Escape" && input.key !== "Process") {
            window.close();
            event.preventDefault();
          }
        }
        if (!zoom) {
          if (input.code === "Minus" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "Equal" && input.shift && (input.control || input.meta))
            event.preventDefault();
        }
      }
    });
  },
  registerFramelessWindowIpc() {
    electron.ipcMain.on("win:invoke", (event, action) => {
      const win = electron.BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (action === "show") {
          win.show();
        } else if (action === "showInactive") {
          win.showInactive();
        } else if (action === "min") {
          win.minimize();
        } else if (action === "max") {
          const isMaximized = win.isMaximized();
          if (isMaximized) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        } else if (action === "close") {
          win.close();
        }
      }
    });
  }
};
const CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36";
const views = /* @__PURE__ */ new Map();
const CSS_BY_PLATFORM = {};
const SPOOF_SCRIPT = `
Object.defineProperty(navigator, 'userAgentData', {
  get: () => ({
    brands: [
      { brand: 'Google Chrome', version: '134' },
      { brand: 'Chromium', version: '134' },
      { brand: 'Not/A)Brand', version: '99' }
    ],
    mobile: false,
    platform: 'Windows'
  })
});
`;
function getPreloadPath() {
  const dir = path.join(process.env.APPDATA || process.env.HOME || "", "orca-blitz");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "browser-preload.js");
  fs.writeFileSync(file, SPOOF_SCRIPT, "utf-8");
  return file;
}
function injectCSS(view) {
  const platformId = view.webContents.__platformId;
  const css = CSS_BY_PLATFORM[platformId];
  if (!css) return;
  view.webContents.insertCSS(css);
}
function registerBrowserHandlers(mainWindow2) {
  const preloadPath = getPreloadPath();
  electron.ipcMain.handle("browser:create", (_e, id, url, partition, platformId) => {
    if (views.has(id)) return;
    const view = new electron.WebContentsView({
      webPreferences: {
        partition,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        preload: preloadPath
      }
    });
    view.webContents.__platformId = platformId;
    view.webContents.setUserAgent(CHROME_UA);
    view.webContents.on("did-finish-load", () => {
      injectCSS(view);
      mainWindow2.webContents.send("browser:did-load", id);
    });
    view.webContents.on("did-fail-load", (_e2, code, desc) => {
      mainWindow2.webContents.send("browser:did-fail", id, code, desc);
    });
    view.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    views.set(id, view);
    view.webContents.loadURL(url);
  });
  electron.ipcMain.on("browser:show", (_e, id, bounds) => {
    const view = views.get(id);
    if (!view) return;
    for (const child of mainWindow2.contentView.children) {
      try {
        mainWindow2.contentView.removeChildView(child);
      } catch {
      }
    }
    mainWindow2.contentView.addChildView(view);
    view.setBounds(bounds);
  });
  electron.ipcMain.on("browser:hide", (_e, id) => {
    const view = views.get(id);
    if (!view) return;
    try {
      mainWindow2.contentView.removeChildView(view);
    } catch {
    }
  });
  electron.ipcMain.on("browser:position", (_e, id, bounds) => {
    const view = views.get(id);
    if (!view) return;
    view.setBounds(bounds);
  });
  electron.ipcMain.on("browser:destroy", (_e, id) => {
    const view = views.get(id);
    if (!view) return;
    try {
      mainWindow2.contentView.removeChildView(view);
    } catch {
    }
    view.webContents.close();
    views.delete(id);
  });
  electron.ipcMain.on("browser:css", (_e, id, css) => {
    const view = views.get(id);
    if (!view) return;
    view.webContents.insertCSS(css);
  });
  electron.ipcMain.on("browser:goBack", (_e, id) => {
    const view = views.get(id);
    if (!view) return;
    if (view.webContents.canGoBack()) view.webContents.goBack();
  });
  electron.ipcMain.on("browser:goForward", (_e, id) => {
    const view = views.get(id);
    if (!view) return;
    if (view.webContents.canGoForward()) view.webContents.goForward();
  });
  electron.ipcMain.on("browser:reload", (_e, id) => {
    const view = views.get(id);
    if (!view) return;
    view.webContents.reload();
  });
  electron.ipcMain.handle("browser:canGoBack", (_e, id) => {
    const view = views.get(id);
    return view?.webContents.canGoBack() ?? false;
  });
  electron.ipcMain.handle("browser:canGoForward", (_e, id) => {
    const view = views.get(id);
    return view?.webContents.canGoForward() ?? false;
  });
}
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window:maximized", true);
  });
  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window:maximized", false);
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  mainWindow.webContents.session.setPermissionRequestHandler((_, permission, callback) => {
    const allowedPermissions = ["media", "geolocation", "notifications", "clipboard-read", "clipboard-sanitized-write"];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.orcablitz.desktop");
  electron.app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  electron.Menu.setApplicationMenu(null);
  electron.ipcMain.on("window:minimize", () => mainWindow?.minimize());
  electron.ipcMain.on("window:maximize", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  electron.ipcMain.on("window:close", () => mainWindow?.close());
  electron.ipcMain.handle("window:isMaximized", () => mainWindow?.isMaximized() ?? false);
  createWindow();
  if (mainWindow) registerBrowserHandlers(mainWindow);
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
