import { app } from "electron";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import pino from "pino";
import type { ChannelSession, UnifiedMessage } from "@orca-blitz/shared";
import type { MessageRepository } from "./db/message-repository";
import { normalizeMessage } from "./message-normalizer";

interface ChannelEvents {
  onQR: (businessId: string, qr: string) => void;
  onStatus: (session: ChannelSession) => void;
  onMessage: (message: UnifiedMessage) => void;
  onConversationsChanged: (businessId: string) => void;
}

export class WhatsAppChannel {
  private socket: import("baileys").WASocket | null = null;
  private stopped = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private session: ChannelSession;

  constructor(
    private readonly businessId: string,
    private readonly repository: MessageRepository,
    private readonly events: ChannelEvents,
  ) {
    this.session = repository.getSession(businessId);
  }

  getStatus(): ChannelSession {
    return this.session;
  }

  async connect(): Promise<ChannelSession> {
    this.stopped = false;
    this.setStatus({ status: "connecting", error: undefined });
    await this.openSocket();
    return this.session;
  }

  async disconnect(): Promise<void> {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    try {
      await this.socket?.logout();
    } catch {
      /* already disconnected */
    }
    this.socket?.end(undefined);
    this.socket = null;
    this.setStatus({ status: "disconnected", phone: undefined, name: undefined });
  }

  async sendText(jid: string, text: string): Promise<void> {
    if (!this.socket) throw new Error("WhatsApp is not connected");
    const sent = await this.socket.sendMessage(jid, { text });
    if (!sent) return;
    const normalized = normalizeMessage(sent, this.businessId);
    if (normalized) {
      this.repository.saveMessage(normalized);
      this.events.onMessage(normalized);
      this.events.onConversationsChanged(this.businessId);
    }
  }

  private async openSocket(): Promise<void> {
    const baileys = await import("baileys");
    const authDirectory = join(app.getPath("userData"), "messaging", this.businessId, "auth");
    mkdirSync(authDirectory, { recursive: true });
    const { state, saveCreds } = await baileys.useMultiFileAuthState(authDirectory);
    const { version } = await baileys.fetchLatestBaileysVersion();
    const logger = pino({ level: "silent" });
    const socket = baileys.default({
      version,
      auth: {
        creds: state.creds,
        keys: baileys.makeCacheableSignalKeyStore(state.keys, logger),
      },
      logger,
      browser: ["Orca Blitz", "Desktop", "1.0.0"],
      printQRInTerminal: false,
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });
    this.socket = socket;
    socket.ev.on("creds.update", saveCreds);
    socket.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        this.setStatus({ status: "qr", error: undefined });
        this.events.onQR(this.businessId, qr);
      }
      if (connection === "open") {
        const phone = socket.user?.id?.split(":")[0];
        this.setStatus({ status: "connected", phone, name: socket.user?.name, error: undefined });
      }
      if (connection === "close") {
        const statusCode = (
          lastDisconnect?.error as { output?: { statusCode?: number } } | undefined
        )?.output?.statusCode;
        const loggedOut = statusCode === baileys.DisconnectReason.loggedOut;
        this.socket = null;
        if (loggedOut || this.stopped) {
          if (loggedOut) rmSync(authDirectory, { recursive: true, force: true });
          this.setStatus({ status: "disconnected", error: loggedOut ? "logged_out" : undefined });
        } else {
          this.setStatus({ status: "connecting", error: "reconnecting" });
          this.reconnectTimer = setTimeout(() => {
            void this.openSocket();
          }, 2000);
        }
      }
    });
    socket.ev.on("contacts.upsert", (contacts) => {
      for (const contact of contacts) {
        if (contact.id)
          this.repository.upsertContact(this.businessId, contact.id, {
            name: contact.name ?? undefined,
            pushname: contact.notify ?? undefined,
            isGroup: contact.id.endsWith("@g.us"),
          });
      }
    });
    socket.ev.on("messaging-history.set", ({ contacts, chats, messages }) => {
      for (const contact of contacts) {
        if (contact.id)
          this.repository.upsertContact(this.businessId, contact.id, {
            name: contact.name ?? undefined,
            pushname: contact.notify ?? undefined,
            isGroup: contact.id.endsWith("@g.us"),
          });
      }
      for (const chat of chats) {
        if (chat.id)
          this.repository.upsertContact(this.businessId, chat.id, {
            name: chat.name ?? undefined,
            isGroup: chat.id.endsWith("@g.us"),
          });
      }
      this.saveMessages(messages, false);
    });
    socket.ev.on("messages.upsert", ({ messages, type }) =>
      this.saveMessages(messages, type === "notify"),
    );
  }

  private saveMessages(
    messages: import("baileys").proto.IWebMessageInfo[],
    countUnread: boolean,
  ): void {
    for (const rawMessage of messages) {
      const message = normalizeMessage(rawMessage, this.businessId);
      if (!message) continue;
      this.repository.saveMessage(message);
      if (!countUnread && !message.fromMe)
        this.repository.markRead(message.businessId, message.chatJid);
      this.events.onMessage(message);
    }
    if (messages.length > 0) this.events.onConversationsChanged(this.businessId);
  }

  private setStatus(update: Partial<ChannelSession>): void {
    this.session = { ...this.session, ...update, businessId: this.businessId, channel: "whatsapp" };
    this.repository.saveSession(this.session);
    this.events.onStatus(this.session);
  }
}
