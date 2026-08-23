import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const tempDir = { current: "" };

vi.mock("electron", () => ({
  app: { getPath: () => tempDir.current },
}));

import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { UnifiedMessage } from "@orca-blitz/shared";
import { closeDatabase } from "./database";
import { MessageRepository } from "./message-repository";

function message(partial: Partial<UnifiedMessage>): UnifiedMessage {
  return {
    id: partial.id ?? "m1",
    businessId: "biz1",
    channel: "whatsapp",
    chatJid: "123@s.whatsapp.net",
    fromMe: false,
    type: "text",
    body: "",
    timestamp: 1000,
    ...partial,
  };
}

beforeEach(() => {
  tempDir.current = mkdtempSync(join(tmpdir(), "orca-db-test-"));
});

afterEach(() => {
  closeDatabase();
  rmSync(tempDir.current, { recursive: true, force: true });
});

describe("MessageRepository", () => {
  it("saveMessage crea contacto y mensaje, e incrementa unread si no es propio", () => {
    const repository = new MessageRepository();
    repository.saveMessage(message({ body: "hola", timestamp: 1000 }));
    repository.saveMessage(message({ id: "m2", body: "otra", timestamp: 2000 }));

    const conversations = repository.listConversations("biz1");
    expect(conversations).toHaveLength(1);
    expect(conversations[0].unreadCount).toBe(2);
    expect(conversations[0].lastMessageBody).toBe("otra");
  });

  it("los mensajes propios no incrementan unread y quedan como lastMessageFromMe", () => {
    const repository = new MessageRepository();
    repository.saveMessage(message({ id: "m1", fromMe: true, body: "yo", timestamp: 1000 }));

    const conversations = repository.listConversations("biz1");
    expect(conversations[0].unreadCount).toBe(0);
    expect(conversations[0].lastMessageFromMe).toBe(true);
  });

  it("markRead reinicia el contador de no leídos", () => {
    const repository = new MessageRepository();
    repository.saveMessage(message({ body: "hola" }));
    repository.markRead("biz1", "123@s.whatsapp.net");

    expect(repository.listConversations("biz1")[0].unreadCount).toBe(0);
  });

  it("listMessages devuelve los mensajes en orden cronológico", () => {
    const repository = new MessageRepository();
    repository.saveMessage(message({ id: "m3", timestamp: 3000 }));
    repository.saveMessage(message({ id: "m1", timestamp: 1000 }));
    repository.saveMessage(message({ id: "m2", timestamp: 2000 }));

    const messages = repository.listMessages("biz1", "123@s.whatsapp.net");
    expect(messages.map((message) => message.id)).toEqual(["m1", "m2", "m3"]);
  });

  it("separa conversaciones por canal", () => {
    const repository = new MessageRepository();
    repository.saveMessage(message({ id: "t1", chatJid: "a@telegram", channel: "telegram" }));
    repository.saveMessage(message({}));

    expect(repository.listConversations("biz1", "whatsapp")).toHaveLength(1);
    expect(repository.listConversations("biz1", "telegram")).toHaveLength(1);
    expect(repository.listMessages("biz1", "a@telegram", "telegram")[0].channel).toBe("telegram");
  });

  it("setMediaPath persiste la ruta del media", () => {
    const repository = new MessageRepository();
    repository.saveMessage(message({ type: "image" }));
    repository.setMediaPath("biz1", "m1", "C:/media/img.png");

    expect(repository.listMessages("biz1", "123@s.whatsapp.net")[0].mediaPath).toBe(
      "C:/media/img.png",
    );
  });

  it("saveSession/getSession redondean el estado de la sesión", () => {
    const repository = new MessageRepository();

    expect(repository.getSession("biz1").status).toBe("disconnected");

    repository.saveSession({
      businessId: "biz1",
      channel: "whatsapp",
      status: "connected",
      phone: "+56911111111",
    });
    expect(repository.getSession("biz1")).toMatchObject({
      status: "connected",
      phone: "+56911111111",
    });
  });

  it("getSession usa una clave distinta por canal", () => {
    const repository = new MessageRepository();
    repository.saveSession({ businessId: "biz1", channel: "telegram", status: "connected" });

    expect(repository.getSession("biz1", "whatsapp").status).toBe("disconnected");
    expect(repository.getSession("biz1", "telegram").status).toBe("connected");
  });
});
