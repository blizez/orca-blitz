import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import type { ApiContract, ChatMessage } from "./api-types";
import type {
  Business,
  ChannelSession,
  ChannelType,
  DevToolIntegration,
  DevToolSession,
  UnifiedMessage,
} from "@orca-blitz/shared";

const api: ApiContract = {
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
    onMaximized: (callback: (maximized: boolean) => void) => {
      const handler = (_event: unknown, maximized: boolean) => callback(maximized);
      ipcRenderer.on("window:maximized", handler);
      return () => {
        ipcRenderer.removeListener("window:maximized", handler);
      };
    },
  },
  customers: {
    create: (data) => ipcRenderer.invoke("customers:create", data),
    list: () => ipcRenderer.invoke("customers:list"),
    get: (id: string) => ipcRenderer.invoke("customers:get", id),
    update: (id: string, data) => ipcRenderer.invoke("customers:update", id, data),
    delete: (id: string) => ipcRenderer.invoke("customers:delete", id),
    onChanged: (callback: (...args: unknown[]) => void) => {
      ipcRenderer.on("customers:changed", (_event, ...args) => callback(...args));
      return () => {
        ipcRenderer.removeAllListeners("customers:changed");
      };
    },
  },
  workflows: {
    create: (data) => ipcRenderer.invoke("workflows:create", data),
    list: () => ipcRenderer.invoke("workflows:list"),
    execute: (id: string) => ipcRenderer.invoke("workflows:execute", id),
    onChanged: (callback: (...args: unknown[]) => void) => {
      ipcRenderer.on("workflows:changed", (_event, ...args) => callback(...args));
      return () => {
        ipcRenderer.removeAllListeners("workflows:changed");
      };
    },
  },
  integrations: {
    connect: (businessId: string) => ipcRenderer.invoke("integrations:connect", businessId),
    telegramConnect: (businessId: string) =>
      ipcRenderer.invoke("integrations:telegram:connect", businessId),
    telegramStartLogin: (businessId: string, phone: string) =>
      ipcRenderer.invoke("integrations:telegram:start-login", businessId, phone),
    telegramSubmitCode: (businessId: string, code: string) =>
      ipcRenderer.invoke("integrations:telegram:submit-code", businessId, code),
    telegramSubmitPassword: (businessId: string, password: string) =>
      ipcRenderer.invoke("integrations:telegram:submit-password", businessId, password),
    telegramDisconnect: (businessId: string) =>
      ipcRenderer.invoke("integrations:telegram:disconnect", businessId),
    metaGetStatus: (businessId: string, channel: ChannelType) =>
      ipcRenderer.invoke("integrations:meta:getStatus", businessId, channel),
    metaStart: (businessId: string, channel: ChannelType) =>
      ipcRenderer.invoke("integrations:meta:start", businessId, channel),
    metaDisconnect: (businessId: string, channel: ChannelType) =>
      ipcRenderer.invoke("integrations:meta:disconnect", businessId, channel),
    instagramLogin: (businessId: string, username: string, password: string) =>
      ipcRenderer.invoke("integrations:instagram:login", businessId, username, password),
    instagramDisconnect: (businessId: string) =>
      ipcRenderer.invoke("integrations:instagram:disconnect", businessId),
    messengerLogin: (businessId: string, email: string, password: string) =>
      ipcRenderer.invoke("integrations:messenger:login", businessId, email, password),
    messengerDisconnect: (businessId: string) =>
      ipcRenderer.invoke("integrations:messenger:disconnect", businessId),
    gmailGetStatus: (businessId: string) =>
      ipcRenderer.invoke("integrations:gmail:getStatus", businessId),
    gmailConnect: (businessId: string) =>
      ipcRenderer.invoke("integrations:gmail:start", businessId),
    gmailDisconnect: (businessId: string) =>
      ipcRenderer.invoke("integrations:gmail:disconnect", businessId),
    disconnect: (businessId: string) => ipcRenderer.invoke("integrations:disconnect", businessId),
    getStatus: (businessId: string, channel: ChannelType = "whatsapp") =>
      ipcRenderer.invoke("integrations:getStatus", businessId, channel),
    listConversations: (businessId: string, channel: ChannelType = "whatsapp") =>
      ipcRenderer.invoke("integrations:listConversations", businessId, channel),
    listMessages: (businessId: string, jid: string, channel: ChannelType = "whatsapp") =>
      ipcRenderer.invoke("integrations:listMessages", businessId, jid, channel),
    markRead: (businessId: string, jid: string, channel: ChannelType = "whatsapp") =>
      ipcRenderer.invoke("integrations:markRead", businessId, jid, channel),
    sendMessage: (
      businessId: string,
      jid: string,
      text: string,
      channel: ChannelType = "whatsapp",
    ) => ipcRenderer.invoke("integrations:sendMessage", businessId, jid, text, channel),
    onMessage: (callback: (message: UnifiedMessage) => void) => {
      const handler = (_event: unknown, message: UnifiedMessage) => callback(message);
      ipcRenderer.on("integrations:message", handler);
      return () => ipcRenderer.removeListener("integrations:message", handler);
    },
    onQR: (callback: (data: { businessId: string; qr: string }) => void) => {
      const handler = (_event: unknown, data: { businessId: string; qr: string }) => callback(data);
      ipcRenderer.on("integrations:qr", handler);
      return () => ipcRenderer.removeListener("integrations:qr", handler);
    },
    onStatus: (callback: (data: ChannelSession) => void) => {
      const handler = (_event: unknown, data: ChannelSession) => callback(data);
      ipcRenderer.on("integrations:status", handler);
      return () => ipcRenderer.removeListener("integrations:status", handler);
    },
    onConversationsChanged: (callback: (data: { businessId: string }) => void) => {
      const handler = (_event: unknown, data: { businessId: string }) => callback(data);
      ipcRenderer.on("integrations:conversations-changed", handler);
      return () => ipcRenderer.removeListener("integrations:conversations-changed", handler);
    },
  },
  devtools: {
    getStatus: (integrationId: DevToolIntegration) =>
      ipcRenderer.invoke("devtools:getStatus", integrationId),
    connect: (integrationId: DevToolIntegration) =>
      ipcRenderer.invoke("devtools:connect", integrationId),
    disconnect: (integrationId: DevToolIntegration) =>
      ipcRenderer.invoke("devtools:disconnect", integrationId),
    onStatus: (callback: (session: DevToolSession) => void) => {
      const handler = (_event: unknown, session: DevToolSession) => callback(session);
      ipcRenderer.on("devtools:status", handler);
      return () => ipcRenderer.removeListener("devtools:status", handler);
    },
  },
  reports: {
    generate: (config) => ipcRenderer.invoke("reports:generate", config),
    export: (format: string) => ipcRenderer.invoke("reports:export", format),
  },
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    update: (prefs) => ipcRenderer.invoke("settings:update", prefs),
  },
  businesses: {
    list: () => ipcRenderer.invoke("businesses:list"),
    create: (data) => ipcRenderer.invoke("businesses:create", data),
    update: (id: string, data) => ipcRenderer.invoke("businesses:update", id, data),
    delete: (id: string) => ipcRenderer.invoke("businesses:delete", id),
    onChanged: (callback: (businesses: Business[]) => void) => {
      const handler = (_event: unknown, businesses: Business[]) => callback(businesses);
      ipcRenderer.on("businesses:changed", handler);
      return () => ipcRenderer.removeListener("businesses:changed", handler);
    },
  },
  plugins: {
    install: (manifest) => ipcRenderer.invoke("plugins:install", manifest),
    enable: (id: string) => ipcRenderer.invoke("plugins:enable", id),
    disable: (id: string) => ipcRenderer.invoke("plugins:disable", id),
    list: () => ipcRenderer.invoke("plugins:list"),
  },
  openai: {
    startAuth: () => ipcRenderer.invoke("openai:start-auth"),
    cancelAuth: () => ipcRenderer.invoke("openai:cancel-auth"),
    onAuthUrl: (callback: (url: string) => void) => {
      const handler = (_event: unknown, url: string) => callback(url);
      ipcRenderer.on("openai:auth-url", handler);
      return () => {
        ipcRenderer.removeListener("openai:auth-url", handler);
      };
    },
    onAuthToken: (callback: (data: { accessToken: string; refreshToken: string }) => void) => {
      const handler = (_event: unknown, data: { accessToken: string; refreshToken: string }) =>
        callback(data);
      ipcRenderer.on("openai:auth-token", handler);
      return () => {
        ipcRenderer.removeListener("openai:auth-token", handler);
      };
    },
    onAuthModels: (callback: (models: string[]) => void) => {
      const handler = (_event: unknown, models: string[]) => callback(models);
      ipcRenderer.on("openai:auth-models", handler);
      return () => {
        ipcRenderer.removeListener("openai:auth-models", handler);
      };
    },
    onAuthCode: (callback: (data: { code: string; codeVerifier: string }) => void) => {
      const handler = (_event: unknown, data: { code: string; codeVerifier: string }) =>
        callback(data);
      ipcRenderer.on("openai:auth-code", handler);
      return () => {
        ipcRenderer.removeListener("openai:auth-code", handler);
      };
    },
    onAuthError: (callback: (error: string) => void) => {
      const handler = (_event: unknown, error: string) => callback(error);
      ipcRenderer.on("openai:auth-error", handler);
      return () => {
        ipcRenderer.removeListener("openai:auth-error", handler);
      };
    },
  },
  chatgpt: {
    setToken: (token: string) => ipcRenderer.send("chatgpt:set-token", token),
    send: (model: string, messages: ChatMessage[]) =>
      ipcRenderer.invoke("chatgpt:send", model, messages),
    stream: (model: string, messages: ChatMessage[]) =>
      ipcRenderer.invoke("chatgpt:stream", model, messages),
    user: () => ipcRenderer.invoke("chatgpt:user"),
    hasToken: () => ipcRenderer.invoke("chatgpt:has-token"),
    onStreamChunk: (callback: (chunk: string | null) => void) => {
      const handler = (_event: unknown, chunk: string | null) => callback(chunk);
      ipcRenderer.on("chatgpt:stream-chunk", handler);
      return () => {
        ipcRenderer.removeListener("chatgpt:stream-chunk", handler);
      };
    },
  },
  browser: {
    create: (id: string, url: string, partition: string, platformId: string) =>
      ipcRenderer.invoke("browser:create", id, url, partition, platformId),
    show: (id: string, bounds: { x: number; y: number; width: number; height: number }) =>
      ipcRenderer.send("browser:show", id, bounds),
    hide: (id: string) => ipcRenderer.send("browser:hide", id),
    position: (id: string, bounds: { x: number; y: number; width: number; height: number }) =>
      ipcRenderer.send("browser:position", id, bounds),
    destroy: (id: string) => ipcRenderer.send("browser:destroy", id),
    css: (id: string, css: string) => ipcRenderer.send("browser:css", id, css),
    onDidLoad: (callback: (id: string) => void) => {
      const handler = (_event: unknown, id: string) => callback(id);
      ipcRenderer.on("browser:did-load", handler);
      return () => {
        ipcRenderer.removeListener("browser:did-load", handler);
      };
    },
    onDidFail: (callback: (id: string, code: number, desc: string) => void) => {
      const handler = (_event: unknown, id: string, code: number, desc: string) =>
        callback(id, code, desc);
      ipcRenderer.on("browser:did-fail", handler);
      return () => {
        ipcRenderer.removeListener("browser:did-fail", handler);
      };
    },
    goBack: (id: string) => ipcRenderer.send("browser:goBack", id),
    goForward: (id: string) => ipcRenderer.send("browser:goForward", id),
    reload: (id: string) => ipcRenderer.send("browser:reload", id),
    canGoBack: (id: string) => ipcRenderer.invoke("browser:canGoBack", id),
    canGoForward: (id: string) => ipcRenderer.invoke("browser:canGoForward", id),
  },
  agent: {
    send: (message: string, images?: string[]) => ipcRenderer.invoke("agent:send", message, images),
    steer: (message: string) => ipcRenderer.invoke("agent:steer", message),
    abort: () => ipcRenderer.invoke("agent:abort"),
    getState: () => ipcRenderer.invoke("agent:getState"),
    setModel: (provider: string, modelId: string) =>
      ipcRenderer.invoke("agent:setModel", provider, modelId),
    setThinkingLevel: (level: string) => ipcRenderer.invoke("agent:setThinkingLevel", level),
    getAvailableModels: () => ipcRenderer.invoke("agent:getAvailableModels"),
    login: (providerId: string) => ipcRenderer.invoke("agent:login", providerId),
    getLoginProviders: () => ipcRenderer.invoke("agent:getLoginProviders"),
    onEvent: (cb: (ev: unknown) => void) => {
      const handler = (_event: unknown, ev: unknown) => cb(ev);
      ipcRenderer.on("agent:event", handler);
      return () => ipcRenderer.removeListener("agent:event", handler);
    },
    onDisconnected: (cb: (code: number | null) => void) => {
      const handler = (_event: unknown, ev: unknown) => {
        if (!ev || typeof ev !== "object") return;
        if (!("type" in ev)) return;
        if ((ev as { type: unknown }).type !== "omp:disconnected") return;
        let code: number | null = null;
        if ("code" in ev && typeof (ev as { code: unknown }).code === "number") {
          code = (ev as { code: number }).code;
        }
        cb(code);
      };
      ipcRenderer.on("agent:event", handler);
      return () => ipcRenderer.removeListener("agent:event", handler);
    },
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-expect-error fallback for non-isolated context
  window.electron = electronAPI;
  // @ts-expect-error fallback for non-isolated context
  window.api = api;
}
