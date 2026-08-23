import { app, safeStorage } from "electron";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { IgApiClient } from "instagram-private-api";
import type { ChannelSession, UnifiedMessage } from "@orca-blitz/shared";
import type { MessageRepository } from "./db/message-repository";

interface ChannelEvents {
  onStatus: (session: ChannelSession) => void;
  onMessage: (message: UnifiedMessage) => void;
  onConversationsChanged: (businessId: string) => void;
}

export class InstagramChannel {
  private ig: IgApiClient | null = null;
  private session: ChannelSession;
  private pollTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly businessId: string,
    private readonly repository: MessageRepository,
    private readonly events: ChannelEvents,
  ) {
    this.session = repository.getSession(businessId, "instagram");
    const saved = this.readState();
    if (saved) {
      try {
        this.ig = new IgApiClient();
        this.ig.state.deserialize(saved as unknown as Record<string, unknown>);
        // verify session still valid by checking we have pk
        if (this.ig.state.cookieJar.toString().length > 0) {
          this.session = { ...this.session, status: "connected" };
        }
      } catch {
        this.ig = null;
      }
    }
  }

  getStatus(): ChannelSession {
    return this.session;
  }

  async login(username: string, password: string): Promise<ChannelSession> {
    this.setStatus({ status: "connecting", error: undefined });
    try {
      this.ig = new IgApiClient();
      this.ig.state.generateDevice(username);
      await this.ig.simulate.preLoginFlow();
      await this.ig.account.login(username, password);
      await this.ig.simulate.postLoginFlow();
      this.writeState(this.ig.state.serialize() as unknown as Record<string, unknown>);
      const user = (this.ig.state as unknown as { cookieUserId?: string }).cookieUserId;
      this.setStatus({ status: "connected", phone: username, name: user, error: undefined });
      this.startPolling();
      return this.session;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Instagram login failed";
      this.setStatus({ status: "error", error: msg });
      throw e;
    }
  }

  async disconnect(): Promise<void> {
    this.stopPolling();
    this.ig = null;
    this.clearState();
    this.setStatus({ status: "disconnected", phone: undefined, name: undefined, error: undefined });
  }

  async sendText(jid: string, text: string): Promise<void> {
    if (!this.ig) throw new Error("Instagram is not connected");
    // jid is instagram user pk, e.g. "123456"
    const thread = this.ig.entity.directThread([jid]);
    await thread.broadcastText(text);
    const message: UnifiedMessage = {
      id: `instagram:${Date.now()}`,
      businessId: this.businessId,
      channel: "instagram",
      chatJid: jid,
      fromMe: true,
      type: "text",
      body: text,
      timestamp: Date.now(),
      status: "sent",
    };
    this.persist(message);
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollTimer = setInterval(() => void this.pollInbox(), 15000);
    void this.pollInbox();
  }

  private stopPolling(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = null;
  }

  private async pollInbox(): Promise<void> {
    if (!this.ig) return;
    try {
      const inbox = await this.ig.feed.directInbox().request();
      for (const thread of inbox.inbox.threads ?? []) {
        const threadId = String(thread.thread_id);
        for (const item of (thread.items ?? []).slice(0, 5)) {
          const text = (item as { text?: string }).text;
          if (!text) continue;
          const message: UnifiedMessage = {
            id: `instagram:${item.item_id}`,
            businessId: this.businessId,
            channel: "instagram",
            chatJid: threadId,
            fromMe: (item as { user_id?: number }).user_id === Number(this.ig?.state.cookieUserId),
            type: "text",
            body: text,
            timestamp:
              Number((item as { timestamp?: string | number }).timestamp ?? Date.now() / 1000) *
              1000,
            status: "received",
          };
          this.persist(message);
        }
      }
    } catch {
      // ignore polling errors
    }
  }

  private persist(message: UnifiedMessage): void {
    this.repository.saveMessage(message);
    this.events.onMessage(message);
    this.events.onConversationsChanged(this.businessId);
  }

  private statePath(): string {
    const dir = join(app.getPath("userData"), "messaging", this.businessId);
    mkdirSync(dir, { recursive: true });
    return join(dir, "instagram.state.json");
  }

  private readState(): Record<string, unknown> | null {
    const p = this.statePath();
    if (!existsSync(p)) return null;
    const raw = readFileSync(p, "utf8");
    if (!raw) return null;
    const json = safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(Buffer.from(raw, "base64"))
      : raw;
    try {
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private writeState(state: Record<string, unknown>): void {
    const json = JSON.stringify(state);
    const value = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(json).toString("base64")
      : json;
    writeFileSync(this.statePath(), value, "utf8");
  }

  private clearState(): void {
    const p = this.statePath();
    if (existsSync(p)) writeFileSync(p, "", "utf8");
  }

  private setStatus(update: Partial<ChannelSession>): void {
    this.session = {
      ...this.session,
      ...update,
      businessId: this.businessId,
      channel: "instagram",
    };
    this.repository.saveSession(this.session);
    this.events.onStatus(this.session);
  }
}
