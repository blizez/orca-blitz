import { beforeEach, describe, expect, it } from "vitest";
import type { UnifiedMessage } from "@orca-blitz/shared";
import { useConversationsStore } from "./conversations-store";

function message(partial: Partial<UnifiedMessage>): UnifiedMessage {
  return {
    id: partial.id ?? "m1",
    businessId: "biz1",
    channel: "whatsapp",
    chatJid: partial.chatJid ?? "123@s.whatsapp.net",
    fromMe: false,
    type: "text",
    body: "",
    timestamp: 1000,
    ...partial,
  };
}

describe("useConversationsStore", () => {
  beforeEach(() => {
    useConversationsStore.getState().reset();
  });

  it("upsertMessage agrega mensajes nuevos ordenados por timestamp", () => {
    const store = useConversationsStore.getState();
    store.upsertMessage(message({ id: "m2", timestamp: 2000, body: "segundo" }));
    useConversationsStore
      .getState()
      .upsertMessage(message({ id: "m1", timestamp: 1000, body: "primero" }));

    const messages = useConversationsStore.getState().messagesByJid["123@s.whatsapp.net"];
    expect(messages.map((message) => message.id)).toEqual(["m1", "m2"]);
  });

  it("upsertMessage reemplaza el mensaje si el id ya existe sin duplicar", () => {
    useConversationsStore.getState().upsertMessage(message({ id: "m1", body: "original" }));
    useConversationsStore.getState().upsertMessage(message({ id: "m1", body: "editado" }));

    const messages = useConversationsStore.getState().messagesByJid["123@s.whatsapp.net"];
    expect(messages).toHaveLength(1);
    expect(messages[0].body).toBe("editado");
  });

  it("separa los mensajes por chatJid", () => {
    useConversationsStore.getState().upsertMessage(message({ chatJid: "a@x" }));
    useConversationsStore.getState().upsertMessage(message({ chatJid: "b@x" }));

    const state = useConversationsStore.getState();
    expect(state.messagesByJid["a@x"]).toHaveLength(1);
    expect(state.messagesByJid["b@x"]).toHaveLength(1);
  });

  it("reset vuelve al estado inicial", () => {
    const store = useConversationsStore.getState();
    store.setQr("qr-data");
    store.setActiveJid("123@s.whatsapp.net");
    store.upsertMessage(message({}));

    useConversationsStore.getState().reset();

    const state = useConversationsStore.getState();
    expect(state.qr).toBeNull();
    expect(state.activeJid).toBeNull();
    expect(state.session).toBeNull();
    expect(state.conversations).toEqual([]);
    expect(state.messagesByJid).toEqual({});
  });
});
