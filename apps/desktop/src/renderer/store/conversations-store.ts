import { create } from "zustand";
import type { ChannelSession, Conversation, UnifiedMessage } from "@orca-blitz/shared";

interface ConversationsStore {
  session: ChannelSession | null;
  qr: string | null;
  conversations: Conversation[];
  messagesByJid: Record<string, UnifiedMessage[]>;
  activeJid: string | null;
  setSession: (session: ChannelSession | null) => void;
  setQr: (qr: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (jid: string, messages: UnifiedMessage[]) => void;
  upsertMessage: (message: UnifiedMessage) => void;
  setActiveJid: (jid: string | null) => void;
  reset: () => void;
}

const initialState = {
  session: null,
  qr: null,
  conversations: [],
  messagesByJid: {},
  activeJid: null,
};

export const useConversationsStore = create<ConversationsStore>((set) => ({
  ...initialState,
  setSession: (session) => set({ session }),
  setQr: (qr) => set({ qr }),
  setConversations: (conversations) => set({ conversations }),
  setMessages: (jid, messages) =>
    set((state) => ({ messagesByJid: { ...state.messagesByJid, [jid]: messages } })),
  upsertMessage: (message) =>
    set((state) => {
      const current = state.messagesByJid[message.chatJid] ?? [];
      const next = current.some((item) => item.id === message.id)
        ? current.map((item) => (item.id === message.id ? message : item))
        : [...current, message].sort((a, b) => a.timestamp - b.timestamp);
      return { messagesByJid: { ...state.messagesByJid, [message.chatJid]: next } };
    }),
  setActiveJid: (activeJid) => set({ activeJid }),
  reset: () => set(initialState),
}));
