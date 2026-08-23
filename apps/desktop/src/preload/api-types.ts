import type {
  AppSettings,
  Business,
  ChannelSession,
  ChannelType,
  Conversation,
  UnifiedMessage,
} from "@orca-blitz/shared";

export type Unsubscribe = () => void;

export interface CustomerRecord {
  id: string;
  [key: string]: unknown;
}

export interface WorkflowRecord {
  id: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Contrato único window.api compartido por preload (implementación), renderer (consumo) y web-mock
export interface ApiContract {
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
    onMaximized: (callback: (maximized: boolean) => void) => Unsubscribe;
  };
  customers: {
    list: () => Promise<CustomerRecord[]>;
    get: (id: string) => Promise<CustomerRecord | null>;
    create: (data: Partial<CustomerRecord>) => Promise<CustomerRecord>;
    update: (id: string, data: Partial<CustomerRecord>) => Promise<CustomerRecord | null>;
    delete: (id: string) => Promise<boolean>;
    onChanged: (callback: (...args: unknown[]) => void) => Unsubscribe;
  };
  workflows: {
    list: () => Promise<WorkflowRecord[]>;
    create: (data: Partial<WorkflowRecord>) => Promise<WorkflowRecord>;
    execute: (id: string) => Promise<{ success: boolean }>;
    onChanged: (callback: (...args: unknown[]) => void) => Unsubscribe;
  };
  integrations: {
    connect: (businessId: string) => Promise<ChannelSession>;
    telegramConnect: (businessId: string) => Promise<ChannelSession>;
    telegramStartLogin: (businessId: string, phone: string) => Promise<ChannelSession>;
    telegramSubmitCode: (businessId: string, code: string) => Promise<void>;
    telegramSubmitPassword: (businessId: string, password: string) => Promise<void>;
    telegramDisconnect: (businessId: string) => Promise<void>;
    metaGetStatus: (businessId: string, channel: ChannelType) => Promise<ChannelSession>;
    metaStart: (businessId: string, channel: ChannelType) => Promise<ChannelSession>;
    metaDisconnect: (businessId: string, channel: ChannelType) => Promise<ChannelSession>;
    instagramLogin: (
      businessId: string,
      username: string,
      password: string,
    ) => Promise<ChannelSession>;
    instagramDisconnect: (businessId: string) => Promise<void>;
    messengerLogin: (
      businessId: string,
      email: string,
      password: string,
    ) => Promise<ChannelSession>;
    messengerDisconnect: (businessId: string) => Promise<void>;
    gmailGetStatus: (businessId: string) => Promise<ChannelSession>;
    gmailConnect: (businessId: string) => Promise<ChannelSession>;
    gmailDisconnect: (businessId: string) => Promise<void>;
    disconnect: (businessId: string) => Promise<void>;
    getStatus: (businessId: string, channel?: ChannelType) => Promise<ChannelSession>;
    listConversations: (businessId: string, channel?: ChannelType) => Promise<Conversation[]>;
    listMessages: (
      businessId: string,
      jid: string,
      channel?: ChannelType,
    ) => Promise<UnifiedMessage[]>;
    markRead: (businessId: string, jid: string, channel?: ChannelType) => Promise<void>;
    sendMessage: (
      businessId: string,
      jid: string,
      text: string,
      channel?: ChannelType,
    ) => Promise<void>;
    onMessage: (callback: (message: UnifiedMessage) => void) => Unsubscribe;
    onQR: (callback: (data: { businessId: string; qr: string }) => void) => Unsubscribe;
    onStatus: (callback: (session: ChannelSession) => void) => Unsubscribe;
    onConversationsChanged: (callback: (data: { businessId: string }) => void) => Unsubscribe;
  };
  reports: {
    generate: (config: Record<string, unknown>) => Promise<{ reportId: string }>;
    export: (format: string) => Promise<{ path: string }>;
  };
  settings: {
    get: () => Promise<AppSettings>;
    update: (prefs: Partial<AppSettings>) => Promise<AppSettings>;
  };
  businesses: {
    list: () => Promise<Business[]>;
    create: (data: Partial<Business>) => Promise<Business>;
    update: (id: string, data: Partial<Business>) => Promise<Business | null>;
    delete: (id: string) => Promise<boolean>;
    onChanged: (callback: (businesses: Business[]) => void) => Unsubscribe;
  };
  plugins: {
    install: (manifest: Record<string, unknown>) => Promise<{ success: boolean }>;
    enable: (id: string) => Promise<boolean>;
    disable: (id: string) => Promise<boolean>;
    list: () => Promise<unknown[]>;
  };
  openai: {
    startAuth: () => Promise<void>;
    cancelAuth: () => Promise<void>;
    onAuthUrl: (callback: (url: string) => void) => Unsubscribe;
    onAuthToken: (
      callback: (data: { accessToken: string; refreshToken: string }) => void,
    ) => Unsubscribe;
    onAuthModels: (callback: (models: string[]) => void) => Unsubscribe;
    onAuthCode: (callback: (data: { code: string; codeVerifier: string }) => void) => Unsubscribe;
    onAuthError: (callback: (error: string) => void) => Unsubscribe;
  };
  chatgpt: {
    setToken: (token: string) => void;
    send: (model: string, messages: ChatMessage[]) => Promise<string>;
    stream: (model: string, messages: ChatMessage[]) => Promise<void>;
    user: () => Promise<{ plan?: string; email?: string } | null>;
    hasToken: () => Promise<boolean>;
    onStreamChunk: (callback: (chunk: string | null) => void) => Unsubscribe;
  };
  browser: {
    create: (id: string, url: string, partition: string, platformId: string) => Promise<void>;
    show: (id: string, bounds: { x: number; y: number; width: number; height: number }) => void;
    hide: (id: string) => void;
    position: (id: string, bounds: { x: number; y: number; width: number; height: number }) => void;
    destroy: (id: string) => void;
    css: (id: string, css: string) => void;
    onDidLoad: (callback: (id: string) => void) => Unsubscribe;
    onDidFail: (callback: (id: string, code: number, desc: string) => void) => Unsubscribe;
    goBack: (id: string) => void;
    goForward: (id: string) => void;
    reload: (id: string) => void;
    canGoBack: (id: string) => Promise<boolean>;
    canGoForward: (id: string) => Promise<boolean>;
  };
}
